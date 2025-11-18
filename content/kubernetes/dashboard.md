# Kubernetes Dashboard

Whilst most of the interaction with the newly provided cluster can be done through the [kubectl](https://kubernetes.io/docs/reference/kubectl/) command line tool. There are graphical user interfaces that can be used with the cluster such as the [web UI (Kubernetes Dashboard)](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/) and [Headlmap](https://headlamp.dev/), out of which we will be focusing on the latter.

## Headlamp

Headlamp can be run as a desktop application as well as in-cluster.

### Desktop Application

To get started with Headlamp for desktop follow the [Desktop App](https://headlamp.dev/docs/latest/installation/desktop/) installation instructions.

![image](../images/headlamp-desktop.png)

To add a cluster:

1. Add Cluster
2. Load from KubeConfig, where we need to add the kubeconfig [obtained from portal](portal-overview.md#accessing-kubernetes-cluster)
3. Finalize adding the cluster
4. (optional) You will be redirected to login
5. Access the cluster resources and overview 

![image](../images/headlmap-overview-desktop.png)

### In-cluster Install

#### 1. Add the Headlamp Helm Repository

First, add the official Headlamp Helm repository:

```bash
helm repo add headlamp https://kubernetes-sigs.github.io/headlamp/
```

Update your Helm repositories to ensure you have the latest charts:

```bash
helm repo update
```

#### 2. Install Headlamp

Install Headlamp in the `kube-system` namespace:

```bash
helm install my-headlamp headlamp/headlamp --namespace kube-system
```

#### 3. Enable Service Account Token

```bash
helm install my-headlamp headlamp/headlamp \
  --namespace kube-system \
  --set serviceAccount.create=true
```

#### 4. Port Forwarding (Quick Access)

For immediate access without setting up ingress:

```bash
kubectl port-forward -n kube-system service/headlamp 8080:80
```

Then access Headlamp at `http://localhost:8080`
