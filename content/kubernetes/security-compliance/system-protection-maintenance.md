# System Protection and Maintenance

This document outlines the system protection and maintenance requirements and practices for Safespring On-demand Kubernetes services.

## 1.1 Malware Protection

*Information about malware protection measures for Kubernetes infrastructure and container security will be documented here.*

## 1.2 Vulnerability Management

*Details about vulnerability assessment, patch management, and security updates for Kubernetes infrastructure and container images will be outlined here.*

## 1.3 Configuration Management

*Information about secure configuration standards, baseline configurations, and configuration drift detection for Kubernetes services will be described here.*

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
