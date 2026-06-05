# System Protection and Maintenance

This document outlines the system protection and maintenance requirements and practices for Safespring Backup services.

## 1.1 Malware Protection

Backed up customer data is protected from *ransomware attacks* by not allowing 
already backed up data to be deleted instantly, or the retention time 
of said data to be reduced by the means the customer is (by default) provided. 

!!! note
    If you as a customer wishes to delete data instantly, it is possible to 
    contact [Support](../../service/support.md) and have that arranged in a secure manner.

The backup infrastructure is protected from malware by:

- Using authentication, cryptography and firewall rules to defend it from 
  unauthorized access.
- Making sure the built-in anti-malware feature is enabled in Windows Server 
  machines within the infrastructure.

## 1.2 Vulnerability Management

Vulnerabilities within the backup infrastructure are managed by:

- Regularly updating software to incorporate new security patches.
- Keeping an eye out for recent vulnerabilities that have been made public 
  and acting accordingly.
- Reporting vulnerabilities that we find to respective software maintainers.

## 1.3 Configuration Management

*Information about secure configuration standards, baseline configurations, and configuration drift detection for backup services will be described here.*

## 1.4 Cryptography

### Information in Transit

All customer data is encrypted using TLS.

!!! warning
    The Backup Portal is currently exposed through the IIS web server which technically permits 
    [TLS 1.0](https://caniuse.com/?search=tls+1.0) and [TLS 1.1](https://caniuse.com/?search=tls+1.1). This
    should not be an issue as most modern browsers either outright reject these older protocols or
    warn the user before connecting.
    All other backup services besides the Portal enforce TLS 1.2 or 1.3 exclusively.

#### Storage Protect Servers

Non-TLS connections are rejected.

**TLS cipher suites (TLS 1.3):**

* TLS_AKE_WITH_AES_128_GCM_SHA256
* TLS_AKE_WITH_AES_256_GCM_SHA384
* TLS_AKE_WITH_AES_128_CCM_SHA256
* TLS_AKE_WITH_AES_128_CCM_8_SHA256
* TLS_AKE_WITH_CHACHA20_POLY1305_SHA256

**TLS cipher suites (TLS 1.2):**

* TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
* TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
* TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384
* TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256
* TLS_RSA_WITH_AES_256_GCM_SHA384
* TLS_RSA_WITH_AES_128_GCM_SHA256
* TLS_RSA_WITH_AES_256_CBC_SHA256
* TLS_RSA_WITH_AES_128_CBC_SHA256
* TLS_RSA_WITH_AES_256_CBC_SHA
* TLS_RSA_WITH_AES_128_CBC_SHA

#### Backup Portal

**TLS cipher suites (TLS 1.2):**

* TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
* TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
* TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384
* TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256
* TLS_RSA_WITH_AES_256_GCM_SHA384
* TLS_RSA_WITH_AES_128_GCM_SHA256
* TLS_RSA_WITH_AES_256_CBC_SHA256
* TLS_RSA_WITH_AES_128_CBC_SHA256
* TLS_RSA_WITH_AES_256_CBC_SHA
* TLS_RSA_WITH_AES_128_CBC_SHA

**Notes on TLS 1.1 & TLS 1.0:**

_Prevent the usage of TLS 1.1 or TLS 1.0 by keeping your browser up-to-date and avoiding Internet Explorer._

