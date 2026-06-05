# Network Security

This document outlines the network security requirements and practices for Safespring Backup services.

## 4.1 Network Protection

Firewalls are used to prevent unauthorized access to arbitrary ports. Ingress to the backup infrastructure is blocked
by default. Only whitelisted ports are accessible.

More concretely, the firewalls:

- Limit worldwide ingress to only customer services/ports.
- Help enforce the usage of WireGuard to access administrative services/ports.

## 4.2 Network Services Security

Customer traffic to backup services use TLS to secure data on transit.

Traffic to _administrative_ services are encrypted using WireGuard when the connections are established from 
outside the backup infrastructure.

## 4.3 Network Segmentation

Backup servers, the Backup Portal, and other services operate within their own network namespaces. That's because 
they either run within their own VM instance, Docker containers or Kubernetes pods. This makes it easier to maintain
tighter isolation between services.

Administrative services have their own WireGuard network.
