# Getting Started with on-demand Kubernetes

!!! note "on-demand Kubernetes"
    The on-demand kubernetes service is currently still in development. A beta-launch is planned for December 2025.

This guide will help you get started with Safespring's on-demand Kubernetes service.

## Overview

On-demand Kubernetes allows users to create, scale and use Kubernetes clusters. Such a functionality is made available through a [portal and API](portal-overview.md), where users can manage the clusters.

It is build on top of the [Safespring Compute](../compute/getting-started.md) service.

## Cluster Management

Clusters can be created using the Safespring portal or API. Once created, clusters can be scaled up or down as needed.

We support using 3 or 5 control plane nodes. When Kubernetes API uptime is critical for you business operations, we recommend using 5 control plane nodes.

Worker nodes can be used with L2 or B2 flavors, see [flavors](../compute/flavors.md) for more details and trade-offs. Generally B2 provides better uptime and L2 with local disk provides better disk performance.

We make use of [Talos Linux](https://www.talos.dev) and follow its [Support Matrix](https://www.talos.dev/v1.10/introduction/support-matrix) with the following currently supported versions:

| **Talos Version**            | **Supported Kubernetes Versions**                     |
| ---------------------------- | ----------------------------------------------------- |
| 1.10.7                       | 1.33.5                                                |
| 1.11.2                       | 1.34.1                                                |
| 1.11.5                       | 1.34.1                                                |

## Access and Authentication

Access to the clusters is handled through the accounts you've been provided with for onboarding in the [self-service portal](../portal-api/getting-started.md).

Clusters are integrated with the OIDC compatible identity provider that is integrated with the portal. Use the following [instructions](authentication.md) on how to authenticate to a Kubernetes cluster with your account.

## Networking

Cilium is used as the default CNI. Cilium is configured with the following settings:

* Gateway API enabled
* host routing
* kube-proxy replacement
* vxlan encapsulation

### loadbalancing

Dedicated load balancers managed by Safespring are used to direct traffic to the control plane api and worker nodes. The cluster is provisioned with [dedicated IPv4 addresses](../compute/loadbalancing.md), ensuring control plane traffic stays isolated from worker node traffic.

When nodes get added or removed from the cluster, the load balancers will automatically be updated.

## Storage

Clusters are configured with cinder csi during creation. The following [storage classes](persistent-volumes.md#storage-classes) are available if Cinder CSI component has been activated:

* `large` - HDD based block storage
* `fast` - NVMe based block storage

Currently all available storage classes are based on networked storage.

## SLA and Availability

Safespring on-demand Kubernetes is a highly available, reliable Kubernetes service.
The clusters provisioned have a managed control plane with a 99.5% uptime SLA measured against the kubernetes API availability.

The worker nodes that are part of the cluster are part of the default Compute service SLA and not included in the on-demand Kubernetes SLA.

For any questions regarding the SLA please reach out to [support](../service/support.md).

## Cluster Components

### Core Components in a Control Plane

We consider the following components

1. **API Server (`kube-apiserver`)**
2. **etcd**
3. **Controller Manager (`kube-controller-manager`)**
4. **Scheduler (`kube-scheduler`)**
5. **Cloud Controller Manager**

Additionally we consider Cilium CNI as necessary for running the Kubernetes cluster, and we do not recommend replacing it.

### Additional Components

| **Component**                                                                                                                | **Description**                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**OpenStack Cloud Controller Manager**](https://github.com/kubernetes/cloud-provider-openstack)                             | Integrates with OpenStack to provide node metadata, load balancers, and storage support.                                                                                                                                                                                                                  |
| [**Cert Manager**](https://cert-manager.io/)                                                                                 | Automates the management and issuance of TLS certificates for Kubernetes workloads. Cluster issuer `letsencrypt-prod` available for NGINX Ingress Controller. For Gateway API a cluster issuer will need to be [created](https://cert-manager.io/docs/usage/gateway/).                                                                                                                                                                                                                       |
| [**Traffic Management**](manage-traffic.md)                                                                                                         | - [**Cilium API Gateway (Default)**](https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/): eBPF-based ingress solution with advanced traffic management. We provide GatewayClass `cilium` by default. <br/>- [**NGINX Ingress Controller**](https://kubernetes.github.io/ingress-nginx/): Widely adopted ingress controller with a large ecosystem. Default Ingress Class name is `nginx`. |
| [**Cinder CSI (optional)**](https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/cinder-csi-plugin/using-cinder-csi-plugin.md) | Container Storage Interface (CSI) driver for provisioning and managing OpenStack Cinder volumes. [Making use of Cinder CSI](persistent-volumes.md) for persistent volumes.                                                                                                                                                                                      |
| [**Cilium**](https://cilium.io/)                                                                                             | eBPF-based networking, security, and observability for Kubernetes clusters, providing advanced features like network policies and load balancing.                                                                                                                                                         |
| [**NVIDIA Device Plugin**](https://github.com/NVIDIA/k8s-device-plugin)                                                      | Enables Kubernetes workloads to request and use GPUs for machine learning, AI, and high-performance compute applications. **Only available if worker nodes have GPU [flavors](../compute/flavors.md)**, see how to [run GPU workloads](gpu.md).                                                                                                            |
