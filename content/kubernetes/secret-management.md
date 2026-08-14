# Secret Management

Whilst secrets inside Safespring Kubernetes Engine are [encrypted at rest](security-compliance/index.md#secrets-management), the ecosystem of secret management inside a Kubernetes cluster is diverse, with solutions each offering various features, for example:

- [Kubernetes external secrets](https://github.com/external-secrets/external-secrets)
- [Vault Secrets Operator](https://github.com/ricoberger/vault-secrets-operator) with [OpenBao](https://openbao.org/docs/platform/k8s/) OSS alternative
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [Secrets Store CSI driver](https://github.com/kubernetes-sigs/secrets-store-csi-driver)
- [SOPS operator](https://github.com/isindir/sops-secrets-operator)

## SOPS Operator with Age Key

This guide walks you through setting up the SOPS operator in Kubernetes to
automatically decrypt secrets encrypted with
[SOPS](https://github.com/getsops/sops) using [Age
encryption](https://github.com/FiloSottile/age).

An alternative implementation of SOPS is presented by [Sops Operator](https://github.com/peak-scale/sops-operator) which focuses on complex scenario most of which valid in a multi-tenant environment.

!!! note "What SOPS is - and that you don't have to use it"
    SOPS ("Secrets OPerationS") is a general-purpose file-encryption tool - not a Kubernetes
    feature. It encrypts the *values* in a structured file (YAML/JSON) while leaving the keys and
    overall structure readable, so an encrypted file is still safe to store and diff in Git.

    You don't have to use it at all. A pod, Job, etc. that references a secret only cares that
    the `Secret` object exists in the cluster - it is completely indifferent to how it got
    there. You can create Secrets directly (for example `kubectl apply` an unencrypted Secret
    against the cluster) and everything works. SOPS exists purely to give you a safe way to
    **keep secrets in a Git repository**: it encrypts the values at rest in Git, and the
    operator decrypts them back into normal Secrets in the cluster. If you are not committing
    secrets to Git, you don't need any of this.

For following this guide it is required:

- `kubeconf-demo` is [obtained from the portal](portal-overview.md#accessing-kubernetes-cluster) for that specific cluster and active in current shell via `KUBECONFIG` environment variable or specified via `--kubeconfig` flag for helm and kubectl command line tools.
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
kubectl create secret generic sops-age-key -n sops-operator \
     --from-file=age-key.txt="${AGE_KEY_FILE}" \
     --dry-run=client -o yaml | kubectl apply -f -
```

### Example Usage

#### Configure SOPS to use your Age key

Create a [`.sops.yaml` configuration file](https://github.com/getsops/sops?tab=readme-ov-file#using-sops-yaml-conf-to-select-kms-pgp-and-age-for-new-files) in your project directory. Set `encrypted_regex` so SOPS encrypts **only the secret values** and leaves the rest of the manifest (`kind`, `metadata`, structure) readable - the operator needs that structure in clear text to decrypt:

```yaml
creation_rules:
  - path_regex: '.*\.enc\.yaml$'
    encrypted_regex: '^(data|stringData)$'
    age: age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Replace the public key with your actual Age public key. The `path_regex` scopes this rule to files whose names end in `.enc.yaml`. Naming your encrypted files that way is good practice - it makes them easy to spot and keeps them cleanly separated from plaintext. Note that SOPS matches `path_regex` against the file you encrypt, so the file must already be named `*.enc.yaml` for the rule to apply.

#### Create and encrypt a SopsSecret

The operator watches for `SopsSecret` resources - **this is the only thing you deploy**. Write it with your values in clear text:

```yaml
# my-sops-secret.enc.yaml
apiVersion: isindir.github.com/v1alpha3
kind: SopsSecret
metadata:
  name: my-sops-secret
  namespace: default
spec:
  secretTemplates:
    - name: my-secret          # name of the Secret the operator will create
      stringData:
        username: admin
        password: supersecret123
```

Encrypt it in place:

```bash
sops --encrypt --in-place my-sops-secret.enc.yaml
```

Because `.sops.yaml` sets `encrypted_regex`, SOPS encrypts only the `stringData`/`data` values and adds a `sops:` metadata block; `kind`, `metadata` and the template structure stay readable. **This encrypted file is what you commit to Git and/or apply - there is no separate plain-Secret file to deploy.**

!!! warning
    Do **not** apply a SOPS-encrypted plain `kind: Secret` to the cluster. Neither `kubectl`
    nor your GitOps tool decrypt SOPS - they store the ciphertext as the value and Kubernetes
    silently drops the `sops:` block, so the secret is unusable (and shows as permanently out
    of sync in your GitOps tool). Always wrap secrets in a `SopsSecret`; the operator is what
    decrypts.

#### Apply it

```bash
kubectl apply -f my-sops-secret.enc.yaml
```

The operator decrypts it and creates a normal `kind: Secret` named `my-secret`, which your pods consume the usual way (`envFrom`, `secretKeyRef`, or a volume mount). Under GitOps, commit the encrypted file and let your GitOps tool sync it rather than applying by hand.

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
