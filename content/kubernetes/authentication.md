# Cluster Authentication

We recommend leveraging the [kubectl OIDC plugin](https://github.com/int128/kubelogin) (`kubelogin`) for handling OIDC-based logins seamlessly from the command line by installing it in your environment.

!!! note "Accessing Kubernetes Cluster"
    We recommend making use of [portal generated Kubeconfig](portal-overview.md#accessing-kubernetes-cluster) for generating an up to date `.kubeconfig`.

## Alternative Scripted Kubeconfig

Use the script `make-kubeconfig.sh` script (referenced below) to generate a kubeconfig that supports OIDC login via `kubelogin`. Note that for this method the certificate that will be retrieved will be per control plane node.

Example:

```bash
./make_kubeconfig.sh -c <client_id> -i <zitadel_url> -k <cluster-api-url>
kubectl --kubeconfig=demo-kubeconfig cluster-info

Kubernetes control plane is running at https://api.demo.safespring.com:6443
CoreDNS is running at https://api.demo.safespring.com:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

Alternatively one can use: `export KUBECONFIG=$PWD/stage-sto2-01-kubeconfig` in order to omit `--kubeconfig` flag.

The required part of the script `<client_id>`, `<zitadel_url>` and `<cluster-api-url>` will be available via the portal.

## Kubeconfig Script

Create `make-kubeconfig.sh` using:

```bash

#!/usr/bin/env bash
set -euo pipefail

unset KUBECONFIG

usage() {
  cat >&2 <<'USAGE'
Create a kubeconfig that uses kubectl oidc-login as an exec plugin.

Required flags:
  -i  OIDC issuer (host or URL; e.g. zitadel.example.com or https://zitadel.example.com)
  -k  Kubernetes API host (no scheme; e.g. api.your-cluster.com)
  -c  OIDC Client ID (e.g. XXXXXXXXXXXXXXX)

Optional:
  -d  Use Device Code flow (authentication for devices without a browser)
  -h  Show this help and exit

Examples:
  # default (auth code opens browser, depending on kubelogin defaults)
  ./make-kubeconfig.sh -i zitadel.example.com -k api.your-cluster.com -c XXXXXXXXXXXXXXX

  # device code (fully CLI; verify on any browser)
  ./make-kubeconfig.sh -i zitadel.example.com -k api.your-cluster.com -c XXXXXXXXXXXXXXX -d
USAGE
}

ISSUER_IN=""
API_HOST_IN=""
CLIENT_ID=""
DEVICE_MODE=false

while getopts ":i:k:c:dh" opt; do
  case "$opt" in
    i) ISSUER_IN="$OPTARG" ;;
    k) API_HOST_IN="$OPTARG" ;;
    c) CLIENT_ID="$OPTARG" ;;
    d) DEVICE_MODE=true ;;
    h) usage; exit 0 ;;
    \?) echo "Error: invalid option -$OPTARG" >&2; usage; exit 2 ;;
    :)  echo "Error: -$OPTARG requires an argument" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "${ISSUER_IN}" || -z "${API_HOST_IN}" || -z "${CLIENT_ID}" ]]; then
  echo "Error: -i, -k and -c are required." >&2
  usage
  exit 2
fi

# Tooling checks
if ! command -v openssl >/dev/null 2>&1; then
  echo "Error: openssl not found in PATH." >&2
  exit 1
fi
if ! command -v kubectl >/dev/null 2>&1; then
  echo "Error: kubectl not found in PATH." >&2
  exit 1
fi
if ! kubectl oidc-login --help >/dev/null 2>&1; then
  echo "Error: 'kubectl oidc-login' plugin not found." >&2
  echo "       Install via: kubectl krew install oidc-login" >&2
  echo "       or see: https://github.com/int128/kubelogin" >&2
  exit 1
fi

kubectl oidc-login clean >/dev/null 2>&1 || true

case "$ISSUER_IN" in
  http://*|https://*) ISSUER_URL="$ISSUER_IN" ;;
  *)                  ISSUER_URL="https://${ISSUER_IN}" ;;
esac

# Sanitize API host (strip any scheme/path/port or IPv6 brackets)
API_HOST="$(printf '%s\n' "$API_HOST_IN" | awk -F/ '{print $3?$3:$1}')"
API_HOST="${API_HOST#[}"   # drop leading '['
API_HOST="${API_HOST%]}"   # drop trailing ']'
API_HOST="${API_HOST%%:*}" # drop port if present

if [[ -z "$API_HOST" ]]; then
  echo "Error: could not parse a host from -k argument (${API_HOST_IN})." >&2
  exit 2
fi

CONNECT_TARGET="${API_HOST}:6443"
SERVER_NAME="$API_HOST"
SERVER_URL="https://${API_HOST}:6443"

openssl s_client -servername "${SERVER_NAME}" -connect "${CONNECT_TARGET}" < /dev/null 2>/dev/null | openssl x509 > ca.crt

if base64 --help 2>&1 | grep -q -- ' -w'; then
  CA_B64="$(base64 -w0 ca.crt)"
else
  CA_B64="$(base64 < ca.crt | tr -d '\n')"
fi

# Generate config filename from API host
config_base="$API_HOST"
config_base="${config_base#api.}"
config_base="${config_base%.paas.safedc.net}"
config_file="${config_base}-kubeconfig"
cluster_name="$config_base"

# Conditionally add device-code arguments 
DEVICE_ARGS=""
if $DEVICE_MODE; then
  DEVICE_ARGS=$'\n      - --grant-type=device-code\n      - --skip-open-browser'
fi

cat > "${config_file}" <<YAML
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${CA_B64}
    server: ${SERVER_URL}
  name: ${cluster_name}
contexts:
- context:
    cluster: ${cluster_name}
    user: oidc
  name: oidc@${cluster_name}
current-context: oidc@${cluster_name}
kind: Config
preferences: {}
users:
- name: oidc
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1
      args:
      - oidc-login
      - get-token
      - --oidc-issuer-url=${ISSUER_URL}
      - --oidc-client-id=${CLIENT_ID}
      - --oidc-extra-scope=email,profile,groups${DEVICE_ARGS}
      command: kubectl
      env: null
      interactiveMode: Never
      provideClusterInfo: false
YAML

echo "Wrote kubeconfig to ${config_file}"
echo "To use now: export KUBECONFIG=\$PWD/${config_file}"
rm ca.crt
```