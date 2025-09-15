# Security and Compliance

This chapter covers security and compliance aspects specific to Safespring On-demand Kubernetes services.

## Overview

Safespring’s On-demand Kubernetes services are designed with security and compliance as core principles. The platform leverages modern, immutable infrastructure with **Talos Linux**, enforces **policy-driven governance with Kyverno**, ensures **supply chain integrity with GitOps and age-encrypted secrets**, provides **identity and access management through Zitadel with RBAC and MFA**, and offers **observability and compliance monitoring through Grafana and Kubescape**.

The following sections detail the different layers of security and compliance.

---

## Security

### Cluster Security

* **Immutable OS with Talos Linux**:
  The Kubernetes clusters run on [Talos Linux](https://www.talos.dev/), a minimal, immutable, API-driven operating system purpose-built for Kubernetes.

  * No SSH access, reducing attack surface.
  * All configuration is declarative and controlled via GitOps workflows.
  * Automatic OS hardening and minimal package footprint reduce vulnerabilities.

* **Secure control plane**:

  * TLS encryption between all cluster components.
  * Jump host access via Talos API.
  * Automatic certificate rotation.

### Container Security

* **Image Security**:

  * Integration with vulnerability scanning tools ([Trivy](https://goharbor.io/docs/2.13.0/administration/vulnerability-scanning/) and [Kubescape](https://kubescape.io/)).

* **Runtime Security**:

  * Pod security standards enforced via [**Kyverno**](https://kyverno.io/) admission policies.
  * Restriction of privilege escalation, root containers, and hostPath usage.

* **Supply Chain Security**:

  * GitOps-driven deployments with **age-encrypted secrets** ensure manifests remain secure at rest and in transit.

### Network Security

* **Openstack Network Policies**:

  * Fine-grained control of control-plane and worker node communication.

* **Isolation**:

  * Dedicated VPCs and private networking for cluster nodes.
  * Separation of tenant workloads where required.

### Identity and Access Management

* **IAM Integration**:

  * Authentication and authorization managed through Zitadel, an identity provider supporting **OIDC** and **SAML**.
  * **Role-Based Access Control (RBAC)** tightly integrated with Kubernetes API access.
  * **Multi-Factor Authentication (MFA)** enforced for admin users.

* **Service Accounts**:

  * Fine-grained access for workloads.

### Secrets Management

* **Kubernetes Secrets**:

  * Encrypted at rest using cluster [secretbox](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/#providers).

* **GitOps Secrets with Age**:

  * Declarative workflows leverage **AGE key encryption** for storing Kubernetes secrets securely in Git internal repository.
  * Decryption happens only within the cluster at runtime, ensuring end-to-end secret protection.

### Pod Security

* **Pod Security Standards (PSS)**:

  * Policies enforce restrictions such as:

    * No privileged containers.
    * Mandatory non-root user.
    * No workloads in default namespace.
    * Resource requests and limits.

### Security Monitoring

* **Monitoring with Grafana**:

  * Metrics, logs, and alerts are centralized in Grafana.
  * Integration with Prometheus and Loki ensures full observability of operational infrastructure.
  * Integration with slack for monitoring of relevant alerts.

* **Threat Detection with Kubescape**:

  * Each Operations cluster has enabled continuous Kubernetes cluster posture scanning.
  * Compliance checks against frameworks (CIS, NSA, MITRE).
  * Reports deviations from security best practices.

* **Audit Logging**:

  * Kubernetes audit logs captured for compliance and incident response.

---

## Compliance

### Data Processing

* Workloads deployed on Safespring Kubernetes clusters inherit **GDPR-aligned processing guarantees**.
* Data location is restricted to Safespring’s compliant Nordic datacenters.

### Audit and Monitoring

* **Grafana dashboards** provide real-time compliance observability.
* **Kubescape** generates compliance posture reports across CIS Benchmarks, PCI-DSS, and ISO standards.
* **Audit logs** stored securely and queryable for forensics.

### Regulatory Requirements

* **GDPR compliance**:

  * Data sovereignty ensured within EU/EEA boundaries.

* **Kubernetes security benchmarks**:

  * Regular scanning with Kubescape validates CIS Kubernetes Benchmark adherence.

### Configuration Compliance

* **Kyverno Policies**:

  * No workloads in default namespace.

* **GitOps Workflows**:

  * All cluster configurations tracked and version-controlled.
  * Age-encrypted secrets prevent accidental compliance violations.
  * Require approval to merge to main branches.
  * Protected main branches.

### Documentation and Reporting

* **Compliance Documentation**:

  * Automated reports generated from **Kubescape scans**.
  * Historical audit logs available for internal and external audits.
  * [ADR](https://adr.github.io/) provided for main parts of the infrastructure and components maintained by Safespring with threat modelling performed where required.

* **Reporting Dashboards**:

  * Grafana dashboards tailored for compliance visualization.
