# System Protection and Maintenance

This document outlines the system protection and maintenance requirements and practices for Safespring Compute services.

## 1.1 Malware Protection

*Information about malware protection measures for compute instances will be documented here.*

## 1.2 Vulnerability Management

*Details about vulnerability assessment, patch management, and security updates for compute infrastructure will be outlined here.*

## 1.3 Configuration Management

*Information about secure configuration standards, baseline configurations, and configuration drift detection for compute services will be described here.*

## 1.4 Cryptography

Cryptographic controls for the Compute service are divided into the following categories: in transit, at rest and material used for authentication and key management.

### 1.4.1 Information in Transit

All communication between Openstack services, clients and APIs is encrypted using HAProxy and TLS, enforcing strong encryption algorithms and policies.

**TLS version: The system enforces TLS 1.2 or later**

**Cipher suite: AES-GCM 128/256 / CHACHA20-POLY1305**

The explicit configs are stored in the Safespring internal repository/path: `ansible/roles/haproxy/defaults/main.yml`.

### 1.4.2 Information at Rest

Openstack databases are encrypted using full disk encryption implemented by LUKS, with AES-256 encryption.

Database, API, and other credentials are encrypted using a SOPS keyring that can only be accessed authorized personnel. During runtime these values get stored on disk with restricted permissions(chmod 600 or 700).

### 1.4.3 Authentication and Key Management

Keystone provides identity and access management, enforcing:

* Token-based authentication with Fernet or JWT tokens, ensuring signed and encrypted authentication flows.
* Role-based access control (RBAC) is implemented to enforce strict permissions for API access.
