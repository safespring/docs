# Network Security

This document outlines the network security requirements and practices for Safespring on-demand Kubernetes services.

## 4.1 Network Protection

Safespring Kubernetes clusters are deployed on top of **OpenStack infrastructure**, where **security groups** provide the first line of network perimeter protection.

* **OpenStack Security Groups**:

  * Stateful virtual firewalls applied to cluster nodes.
  * Default-deny rules for inbound traffic, with explicit allowlists for Kubernetes control plane and worker node communication.
  * Granular filtering for API access and service ports.

All external traffic to the Kubernetes cluster is routed through a **dedicated HAProxy load balancer**:

* **HAProxy Load Balancer**:

  * Acts as a secure entry point to the Kubernetes control plane and ingress services.
  * Provides **TLS termination** for incoming traffic.
  * Supports **high availability and redundancy** across multiple nodes.
  * Enforces **rate limiting, connection filtering, and DDoS protection** at the edge.

On the cluster OS level, **Talos Linux** further reduces the attack surface by:

* Disabling unnecessary services and network daemons.
* Enforcing secure-by-default configurations with immutable networking settings.
* Providing an API-driven firewall configuration mechanism.

## 4.2 Network Services Security

* **Protocol Security**:

  * All internal Kubernetes communication is encrypted with TLS.
  * Mutual TLS (mTLS) can be enabled for pod-to-pod and service-to-service traffic using service mesh integrations.

* **Service Hardening**:

  * Kubernetes API server access is restricted via Zitadel RBAC + MFA authentication.
  * Node-to-node and pod-to-pod traffic flows are minimized using **default-deny NetworkPolicies**.
  * Talos Linux ensures minimal exposure by running no general-purpose services on cluster nodes.

* **Ingress and Egress Control**:

  * External ingress traffic flows through the **HAProxy load balancer**, which provides TLS termination and routing to the correct Kubernetes services.

## 4.3 Network Segmentation

* **Kubernetes Network Policies**:

  * Workloads are isolated by default with explicit policies defining allowed communication paths.
  * Policies enforce micro-segmentation between namespaces, reducing lateral movement risks.

* **Cilium with eBPF for Network Hardening**:
  Safespring leverages **Cilium**, a CNI (Container Network Interface) powered by eBPF, for advanced Kubernetes networking and security.
