# Container Registry

## Zot Registry

This guide focuses on deploying [Zot](https://zotregistry.dev) as a container registry.

Make sure `kubeconf-demo` is [obtained](portal-overview.md#accessing-kubernetes-cluster) for that specific cluster and active in current shell via `KUBECONFIG` environment variable or specified via `--kubeconfig` flag for helm and kubectl command line tools.

### Add the Zot Helm Repository

```bash
# Add the Zot Helm repository
helm repo add project-zot https://project-zot.github.io/helm-charts

# Update your Helm repositories
helm repo update

# Verify the chart is available
helm search repo project-zot/zot

# create namespace
kubectl create namespace zot-registry
```

### Create the Zot Configuration

Before installing the Helm chart, create a ConfigMap with your custom Zot configuration. This will override the default configuration.

```yaml
# zot-config-map.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: zot-config
  namespace: zot-registry
data:
  config.json: |
    {
      "distSpecVersion": "1.1.0",
      "storage": {
        "rootDirectory": "/var/lib/registry",
        "dedupe": true,
        "gc": true,
        "gcDelay": "1h",
        "gcInterval": "24h"
      },
      "http": {
        "address": "0.0.0.0",
        "port": "5000",
        "realm": "zot",
        "auth": {
          "htpasswd": {
            "path": "/secret/htpasswd"
          }
        }
      },
      "log": {
        "level": "info",
        "output": "/dev/stdout"
      },
      "extensions": {
        "metrics": {
          "enable": true,
          "prometheus": {
            "path": "/metrics"
          }
        },
        "search": {
          "enable": true,
          "cve": {
            "updateInterval": "24h"
          }
        },
        "ui": {
          "enable": true
        }
      }
    }
```

Apply the ConfigMap:

```bash
kubectl apply -f zot-config-map.yaml
```

### Create Authentication Secret (Optional)

If you're using htpasswd authentication as shown in the config above, create the authentication secret:

```bash
# Generate htpasswd credentials
htpasswd -Bbn admin "SecurePassword123" > htpasswd

# Create the secret
kubectl create secret generic zot-htpasswd \
  --from-file=htpasswd=htpasswd \
  --namespace zot-registry

# Clean up local file
rm htpasswd
```

### Example Create Helm Values File

Create a values file named `zot-values.yaml`:

```yaml
# zot-values.yaml
replicaCount: 1

serviceAccount:
  create: true
  annotations: {}
  name: ""

service:
  type: ClusterIP
  port: 5000

persistence:
  enabled: true
  storageClass: "large"
  size: 100Gi

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 100m
    memory: 256Mi

# Mount custom zot configuration to override default
extraVolumes:
  - name: zot-config
    configMap:
      name: zot-config

extraVolumeMounts:
  - name: zot-config
    mountPath: /etc/zot-config
    readOnly: true

# If using htpasswd authentication
secretMounts:
  - name: zot-htpasswd
    mountPath: /secret
    secretName: zot-htpasswd
    readOnly: true

```

### Install Zot with Helm

Install Zot using the Helm chart with your custom values:

```bash
helm install zot project-zot/zot \
  --namespace zot-registry \
  --values zot-values.yaml
```

### Accessing Zot Registry

!!! info "Public Access"
    It is important to be aware when exposing cluster services of the [traffic management](manage-traffic.md) available.
    Examples below illustrate local [port forwarding access](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/).

### Port Forward (For Testing)

```bash
kubectl port-forward -n zot-registry svc/zot 5000:5000
```

Then access:

- API: `http://localhost:5000/v2/`
- UI: `http://localhost:5000/`
- Metrics: `http://localhost:5000/metrics`

### Testing the Registry

```bash
# Test the API endpoint
curl http://localhost:5000/v2/

# With authentication
curl -u admin:SecurePassword123 http://localhost:5000/v2/_catalog

# Login with Docker
podman login localhost:5000 -u admin

# Tag and push an image
podman tag nginx:latest localhost:5000/nginx:test
podman push localhost:5000/nginx:test

# Verify the image was pushed
curl -u admin:SecurePassword123 http://localhost:5000/v2/_catalog
```
