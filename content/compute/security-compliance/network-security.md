# Network Security

This document outlines the network security requirements and practices for Safespring Compute services.

## 4.1 Network Protection

Network protection is implemented by using the ubuntu UFW firewall with default deny policies for all incoming traffic.

The firewall is enabled by default due to it's inclusion in the `all` group in our inventory.
Default settings for the firewall are included in the internal ansible role `ufw`.


## 4.2 Network Services Security

Access control is implemented with role based access control (RBAC) and firewalls.

All administrative access is monitored and and logged as documented in [Logging and Monitoring](logging-monitoring.md).



## 4.3 Network Segmentation

Networks related to the Compute service are segmented into management related traffic and customer related traffic.

Management related traffic relies on the segmentation of the infrastructure networks, encompassing out of band traffic, ssh traffic and internal monitoring traffic.

Customer related traffic is isolated from management traffic with firewalls and access controls.

Customers can implement their own network segementation by using Openstack security groups.
