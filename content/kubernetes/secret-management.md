# Secret Management

Whilst secrets inside Safespring On-demand Kubernetes are [encrypted at rest](security-compliance/index.md#secrets-management) the ecosystem of secret management inside a Kubernetes cluster is diverse with solutions each with various features:

- [Kubernetes external secrets](https://github.com/external-secrets/external-secrets)
- [Vault Secrets Operator](https://github.com/ricoberger/vault-secrets-operator) with [OpenBao](https://openbao.org/docs/platform/k8s/) OSS alternative
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [Secrets Store CSI driver](https://github.com/kubernetes-sigs/secrets-store-csi-driver)
- [SOPS operator](https://github.com/isindir/sops-secrets-operator)

## SOPS Operator with Age Key

This guide walks you through setting up the SOPS operator in Kubernetes to automatically decrypt secrets encrypted with [SOPS](sops) using [Age encryption](https://github.com/FiloSottile/age).

An alternative implementation of SOPS is presented by [Sops Operator](https://github.com/peak-scale/sops-operator) which focuses on complex scenario most of which valid in a multi-tenant environment.

For following this guide it is required:

- `kubeconf-demo` is [obtained](portal-overview.md#accessing-kubernetes-cluster) for that specific cluster and active in current shell via `KUBECONFIG` environment variable or specified via `--kubeconfig` flag for helm and kubectl command line tools.
- `age` CLI tool [installed locally](https://github.com/FiloSottile/age?tab=readme-ov-file#installation)
- `sops` CLI tool [installed locally](https://github.com/getsops/sops?tab=readme-ov-file#1download)

### Install SOPS Operator

Install the SOPS operator using Helm:

```bash
# Add the SOPS operator Helm repository
helm repo add sops https://isindir.github.io/sops-secrets-operator/
helm repo update

# Create a namespace for the operator
kubectl create namespace sops-operator

# Install the operator
helm install sops-operator sops/sops-secrets-operator \
  --namespace sops-operator \
  --set replicaCount=1
```

Verify the installation:

```bash
kubectl get pods -n sops-operator
```

### Generate an Age Key

First, generate an Age key pair that will be used for encryption/decryption:

```bash
AGE_KEY_FILE=$(mktemp)
echo "========================"
echo "Public Age key"
age-keygen > "$AGE_KEY_FILE"
echo "========================"

# we will use this when we create the sops-encryption for the cluster
public_age_key=$(grep -oP "public key: \K(.*)" "${AGE_KEY_FILE}")
```

Save the **public key** (starts with `age1...`) for encrypting secrets and the **private key** (starts with `AGE-SECRET-KEY-1...`) for the operator to decrypt.

### Create a Kubernetes Secret with the Age Key

Create a secret containing your Age private key:

```bash
kubectl create secret generic age-key -n sops-operator \
     --from-file=keys.txt="${AGE_KEY_FILE}" \
     --dry-run=client -o yaml | kubectl apply -f -
```

### Example Usage

#### Configure SOPS to Use Age Key

Create a [`.sops.yaml` configuration file](https://github.com/getsops/sops?tab=readme-ov-file#using-sops-yaml-conf-to-select-kms-pgp-and-age-for-new-files) in your project directory:

```yaml
creation_rules:
  - age: age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Replace the public key with your actual Age public key.

#### Encrypt a Secret with SOPS

Create a sample Kubernetes secret file:

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
  namespace: default
type: Opaque
stringData:
  username: admin
  password: supersecret123
```

Encrypt it with SOPS:

```bash
sops --encrypt --age age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
  --encrypted-regex '^(data|stringData)$' \
  secret.yaml > secret.enc.yaml
```

#### Create a SopsSecret Resource

The SOPS operator uses custom `SopsSecret` resources. Convert your encrypted secret:

```yaml
# sops-secret.yaml
apiVersion: isindir.github.com/v1alpha3
kind: SopsSecret
metadata:
  name: my-sops-secret
  namespace: default
spec:
  secretTemplates:
    - name: my-secret
      stringData:
        username: ENC[AES256_GCM,data:xxxxx,type:str]
        password: ENC[AES256_GCM,data:xxxxx,type:str]
```

Or simply point to your encrypted file and apply it directly if it's in the correct format.

#### Configure the Operator for SopsSecret

Create a configuration to tell the operator where to find the Age key:

```yaml
# sops-secret-with-age.yaml
apiVersion: isindir.github.com/v1alpha3
kind: SopsSecret
metadata:
  name: my-sops-secret
  namespace: default
  annotations:
    # Tell the operator to use the Age key from the secret
    sops.secrets-operator/age-key-secret: sops-age-key
    sops.secrets-operator/age-key-namespace: sops-operator
spec:
  secretTemplates:
    - name: my-decrypted-secret
      stringData:
        username: ENC[AES256_GCM,data:xxxxx,type:str]
        password: ENC[AES256_GCM,data:xxxxx,type:str]
```

Apply the resource:

```bash
kubectl apply -f sops-secret-with-age.yaml
```

#### Alternative: Global Age Key Configuration

Instead of annotating each SopsSecret, you can configure the operator to use the Age key globally by updating the Helm values:

```bash
helm upgrade sops-operator sops/sops-secrets-operator \
  --namespace sops-operator \
  --set secrets.ageKey.secret=sops-age-key \
  --set secrets.ageKey.key=age-key.txt
```
