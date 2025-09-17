# System Protection and Maintenance

This document outlines the system protection and maintenance requirements and practices for Safespring Storage services.

## 1.1 Malware Protection

*Information about malware protection measures for storage instances will be documented here.*

## 1.2 Vulnerability Management

Security patches are installed automatically using the Ubuntu unattended upgrades feature.
A high level inventory of software assets is maintained using our Netbox instance. Versions of major components are automatically registered and maintained using the `ansible/roles/SBOM` role.

The storage service team monitors various data sources for security alerts and advisories.
These and more data sources are monitored:

* [Ubuntu CVE reports](https://ubuntu.com/security/cves)
* [NIST NVD](https://nvd.nist.gov/)
* [Opensource Vulnerability Database](https://osv.dev/list)

Critical patches are applied within 7 days of release. Non-critical patches are applied within 30 days of release.

Generally critical patches are applied within 24-48 hours of release. An emergency maintenance window will be scheduled when needed.


## 1.3 Configuration Management

The internal `storage service baseline` defines the system architecture, automation design and forms the basis of our architecture design records(ADRs).

Based on this baseline the service automation is implemented using Ansible. All configuration changes are tracked and approved using a GitOps workflow, see [#change management in Development and Operations](development-operations-management.md#62-change-management).

Ansible roles and default settings are captured in the `ansible/roles` internal repository/path. Inventory data is stored in the `seter/inventory` internal repository/path.

Sensitive values and credentials are stored inside the `seter` repository, they are encrypted using a SOPS keyring. The SOPS keyring itself is protected by GPG keys from storage team members, the GPG keys are backed by yubikeys. When credentials for a component are missing, the component will fail at deployment. This ensures possible default credentials set in the roles are always overwritten.

Each site has it's own private SSH keypair and GPG key. Those are used for automating deployments and configuration changes. The site keys are rotated regularly.

## 1.4 Cryptography

Cryptographic controls for the Compute service are divided into the following categories: in transit, at rest and material used for authentication and key management.

### 1.4.1 Information in Transit

All communication between users and the S3 service is isolated with loadbalancers. The loadbalancers terminate TLS, and enforce strong encryption algorithms and policies.

**TLS version: The system enforces TLS 1.2 or later**

**Cipher suite: AES-GCM 128/256 / CHACHA20-POLY1305**

The explicit configs are stored in the Safespring internal repository/path: `ansible/roles/haproxy/defaults/main.yml`.

### 1.4.2 Information at Rest

#### Object storage encryption

Customers are responsible for encrypting their data before uploading it. This can be done with:

* Server-side encryption (SSE) with Ceph's built-in key management
* SSE with customer-provided keys (SSE-C) for user-managed encryption

#### Disk level encryption

customer data stored on disk is protected using full disk encryption with dm-crypt. Encryption keys are stored in the Ceph monitor database.

### 1.4.3 Authentication and Key Management

Authentication for S3 services can be done locally or with Openstack integration(through keystone).
Keystone provides identity and access management, enforcing:

* Token-based authentication with Fernet or JWT tokens, ensuring signed and encrypted authentication flows.
* Role-based access control (RBAC) is implemented to enforce strict permissions for API access.
* S3 authentication is handled through Openstack

When local authentication is used:

* access ids and secret keys are stored in the storage cluster.
