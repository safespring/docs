# Logging and Monitoring

This document outlines the logging and monitoring requirements and practices for Safespring Storage services.

## 3.1 System Logging

Logs are collected per site in the [shared logging system](../../security-compliance/logging-monitoring.md).

External and internal API calls are logged. This allows for detailed tracking of API usage and potential security incidents.

API and application logs can be provided to the customer on a case by case basis. Please request access through support, and include the site and relevant access IDs.

### Audit logging

auditd is being implemented on all physical storage machines, providing full security and audit logging.

## 3.2 Security Monitoring

*Details about security event monitoring, threat detection, and incident response for storage services will be outlined here.*

## 3.3 Time Synchronization

All servers have `systemd-timesyncd` enabled and configured to synchronize time. The timezone is set to UTC to ensure consistency across all servers.

Clock drift is monitored by the Ceph control plane and alerts are generated if drift exceeds the default Ceph thresholds.
