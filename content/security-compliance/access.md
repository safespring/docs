# Access control for datacenter infrastructure

Safespring services are build on a shared infrastructure that has the same design principles for public and private cloud installations.

Access control to this shared infrastructure is enforced using role-based access control, multi-factor authentication, applied through configuration management.

## Scope

Implementation for datacenter infrastructure of access control, secure authentication and other chapters of the Safespring information security and DevOps guidelines.

## Overview

Safespring does not use traditional VPN setups to secure access to shared infrastructure on internal networks.
Datacenter infrastructure is protected by per site console hosts(also called 'jump hosts'). The console hosts are the isolation layer between the datacenter and the internet.

To guarantee access to infrastructure managed by Safespring a dedicated out-of-band network is implemented in all sites. The entrypoint for the network is always a dedicated server used only for OOB purposes, it is exposed with a externally reachable IP address.

## Security controls

console hosts and oob servers can only be Accessed by authorized Safespring employees. This is enforced through a combination of SSH server settings and hardware tokens.

Configuration management enforces:

* SSH accepted key settings: only allow entry with non-residential hardware based SSH keys
* Authorized employees always have unique/individual user accounts on console hosts/oob servers
* SSH login is only allowed for specified users, managed in version controlled repository
