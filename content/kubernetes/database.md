# Database Solutions

In this guide we will go over some options for setting up a persistent database in your Kubernetes cluster.

## CloudNativePG

This guide walks you through installing the [CloudNativePG operator](https://cloudnative-pg.io/) on Kubernetes and configuring [PostgreSQL](https://www.postgresql.org/) clusters with automated backups using Barman.

### Installation

Add the CloudNativePG Helm repository:

```bash
helm repo add cnpg https://cloudnative-pg.github.io/charts
helm repo update
```

Install the operator:

```bash
helm install cnpg --namespace cnpg-system --create-namespace cnpg/cloudnative-pg
```

### Example Configuration

We will provide a basic `Cluster` with PVC storage configuration; to replicate make sure:

- `kubeconf-demo` is [obtained](portal-overview.md#accessing-kubernetes-cluster) for that specific cluster and active in current shell via `KUBECONFIG` environment variable or specified via `--kubeconfig` flag for helm and kubectl command line tools.
- `test` namespace exists or created using `kubectl create ns test`

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: pg-cluster
  namespace: test
spec:
  instances: 2
  imageName: ghcr.io/cloudnative-pg/postgresql:16
  
  storage:
    size: 8Gi
    storageClass: "large"
  
  bootstrap:
    initdb:
      database: testdb
      owner: testuser

  resources:
    requests:
      memory: "2Gi"
      cpu: "1"
    limits:
      memory: "4Gi"
      cpu: "2"
  
```

**Check cluster is ready:**

```bash
kubectl get cluster pg-cluster
kubectl cnpg status pg-cluster
```

In case the operator or the cluster is not available additional troubleshooting options can be:

**Checking operator logs:**

```bash
kubectl logs -n cnpg-system deployment/cnpg-controller-manager
```

**Check cluster events:**

```bash
kubectl describe cluster pg-cluster
```

### Barman Plugin For CloudNativePG

!!! note "S3 Storage"
  The Barman Plugin configuration below makes use of [S3 storage](../storage/getting-started.md).

CloudNativePG has **Barman support**, with functionalities that include:

- **Barman Cloud**: Native integration for cloud object storage backups
- **WAL archiving**: Continuous archiving of Write-Ahead Logs
- **Point-in-Time Recovery (PITR)**: Restore to any point in time
- **Backup scheduling**: Automated backup management

Newer versions 1.26+ have additional requirements for [installation](https://cloudnative-pg.io/plugin-barman-cloud/docs/installation/):

**Checking current cnpg version:**

```bash
kubectl get deployment -n cnpg-system cnpg-controller-manager -o jsonpath="{.spec.template.spec.containers[*].image}"

```

which should provide an output `ghcr.io/cloudnative-pg/cloudnative-pg:1.26.0` where the version is higher or equal to `1.26.0`

**Installing the Barman Cloud Plugin:**

```bash
kubectl apply -f \
        https://github.com/cloudnative-pg/plugin-barman-cloud/releases/download/v0.9.0/manifest.yaml
```

#### Example Barman Configuration

Additional to the `kind: Cluster` configuration illustrated previously we can add:

```yaml

  # Configure cluster to use Barman plugin
  plugins:
    - enabled: true
      name: barman-cloud.cloudnative-pg.io
      isWALArchiver: true
      parameters:
        barmanObjectName: backup-store
```

where the `backup-store` is specified as

```yaml
# ObjectStore for Barman Cloud Plugin - Backup
apiVersion: barmancloud.cnpg.io/v1
kind: ObjectStore
metadata:
  name: backup-store
  namespace: test
spec:
  configuration:
    destinationPath: "s3://postgres-backups/cnpg"
    endpointURL: "https://s3.osl2.safedc.net"
    s3Credentials:
      accessKeyId:
        name: postgres-backup-credentials
        key: ACCESS_KEY_ID
      secretAccessKey:
        name: postgres-backup-credentials
        key: SECRET_ACCESS_KEY
  retentionPolicy: "30d"
```

with a scheduled backup:


```yaml
# Scheduled backup for PostgreSQL
apiVersion: postgresql.cnpg.io/v1
kind: ScheduledBackup
metadata:
  name: postgres-backup
  namespace: test
  labels:
    app.kubernetes.io/name: postgres-backup
spec:
  schedule: "0 0 2 * * 2,5" # Daily at 2 AM UTC Tuesdays and Fridays
  backupOwnerReference: self
  cluster:
    name: postgres
  method: plugin
  pluginConfiguration:
    name: barman-cloud.cloudnative-pg.io
    parameters:
      barmanObjectName: backup-store
  target: prefer-standby
  immediate: false
```