# System Protection and Maintenance

This document outlines the system protection and maintenance requirements and practices for Safespring On-demand Kubernetes services.

## 1.1 Malware Protection

Safespring implements layered malware protection measures to safeguard Kubernetes infrastructure and containerized workloads:

* **Immutable Host OS (Talos Linux)**:

  * Talos Linux is an immutable, API-driven operating system with no package manager or SSH access, eliminating the risk of malware persistence at the node level.
  * Nodes are deployed from clean, verified images and are automatically hardened.

* **Container Image Security**:

  * Only **privates registries** are permitted for pulling own manage software images.
  * Images are **scanned for malware and vulnerabilities**

* **Continuous Monitoring**:

  * Kubescape scans cluster workloads for known misconfigurations and suspicious patterns.
  * Grafana dashboards with Prometheus and Loki provide anomaly detection and alerting for unusual container activity.

---

## 1.2 Vulnerability Management

Vulnerability management is a continuous process to identify, prioritize, and remediate risks across infrastructure, container images, and workloads.

* **Infrastructure Vulnerabilities**:

  * Talos Linux nodes are rebuilt with updated base images instead of being patched in place, ensuring consistent, up-to-date systems without configuration drift.
  * Cluster components (Kubernetes, etcd, CNI) follow a regular update cycle managed by Safespring operations on a monthly basis as well as high risk CVE.

* **Container Image Vulnerabilities**:

  * Automated **static code checks** and **vulnerability scanning** during CI/CD pipeline execution are performed.

* **Cluster Vulnerability Scanning**:

  * Kubescape continuously evaluates cluster compliance with **CIS Kubernetes Benchmarks** and reports potential vulnerabilities.
  * Integration with vulnerability databases ensures fast detection of newly disclosed CVEs.

* **Patch and Update Management**:

  * Regular maintenance windows ensure that clusters are kept up-to-date.
  * GitOps-driven workflows apply patches consistently across environments, with change history tracked in Git.

---

## 1.3 Configuration Management

Safespring ensures that Kubernetes clusters remain securely configured and aligned with best practices through strong configuration management.

* **Baseline Configurations**:

  * All clusters are provisioned using **Talos Linux declarative configurations**.
  * Security baselines follow CIS Kubernetes Benchmarks and industry standards.

* **Configuration as Code**:

  * GitOps is the authoritative source of truth for all Kubernetes manifests and Talos configurations.
  * Sensitive data is managed with **AGE encrypted secrets**, ensuring secure version control.

* **Drift Detection and Remediation**: Continuous reconciliation ensures that running clusters match their GitOps configuration state.

* **Audit and Monitoring**: Grafana dashboards provide visibility into configuration compliance and highlight deviations.

## 1.4 Cryptography

All communication between Operational services, clients and APIs is encrypted, enforcing strong encryption algorithms and policies.

- **TLS version: The system enforces TLS 1.2 or later**
- **Cipher suite: AES-GCM 128/256 / CHACHA20-POLY1305**

### 1.4.2 Information at Rest

Talos secrets  are encrypted at rest  using [secretbox](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/#providers) **XSalsa20 and Poly1305**.

Other credentials are encrypted using a [AGE key](https://github.com/FiloSottile/age) with SOPS, that can only from within the cluster, during runtime of the respective processes. The secrets are stored encrypted in a git repository and

### 1.4.3 Authentication and Key Management

Zitadel provides identity and access management with the Operational infrastructure, enforcing:

- Multi Factor Authentication;
- Role-based access control (RBAC) is implemented to enforce strict permissions for Kubernetes and Application access.
