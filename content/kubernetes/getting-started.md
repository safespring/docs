# Getting Started with On-demand Kubernetes

!!! note "on-demand Kubernetes"
    The on-demand kubernetes service is currently still in development. A beta-launch is planned for October 2025.

This guide will help you get started with Safespring's On-demand Kubernetes service.

## Overview

on-demand Kubernetes allows users to create, scale and use Kubernetes clusters. A [portal and api](../../portal-api/getting-started) are used to manage the clusters.

It is build on top of the [Safespring Compute](../compute/getting-started.md) service.

## Cluster Management

Clusters can be created using the Safespring portal or API. Once created, clusters can be scaled up or down as needed.

We support using 3 or 5 control plane nodes. When Kubernetes api uptime is critcial for you business operations, we recommend using 5 control plane nodes.

Worker nodes can be used with L2 or B2 flavors, see [flavors](../../compute/flavors) for more details and trade-offs. Generally B2 provides better uptime and L2 with local disk provides better disk performance.

## Access and Authentication

Access to the clusters is handled through the accounts you've been provided with for onboarding in the [self-service portal](../../portal-api/getting-started).

Clusters are integrated with the oidc compatible identity provider that is integrated with the portal. Detailed instructions on how to authenticate with Kubernetes using your portal account will be provided at a later stage.


## Networking

Cilium is used as the default CNI. Cilium is configured with the following settings:

* Gateway API enabled
* host routing
* kube-proxy replacement
* vxlan encapsulation

### loadbalancing

Dedicated loadbalancers maneged by Safespring are used to direct traffic to the controlplane api and worker nodes. The cluster is provisioned with dedicated IPv4 addresses, ensuring controlplane traffic stays isolated from workernode traffic.

When nodes get added or removed from the cluster, the loadbalancers will automatically be updated.


## Storage

Clusters are configured with cinder csi during creation. The following storage classes are available:

* large - HDD based block storage
* fast - NVMe based block storage

Currently all available storage classes are based on networked storage.

## SLA and Availability

Safespring on-demand Kubernetes is a highly available, reliable Kubernetes service.
The clusters provisioned have a managed control plane with a 99.5% uptime SLA measured against the kubernetes API availability.

The worker nodes that are part of the cluster are part of the default Compute service SLA and not included in the on-demand Kubernetes SLA.

For any questions regarding the SLA please reach out to [support](../../service/support)
