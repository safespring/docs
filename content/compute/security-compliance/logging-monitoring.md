# Logging and Monitoring

This document outlines the logging and monitoring requirements and practices for Safespring Compute services.

## 3.1 System Logging

Logs are collected per site in the shared Loki system.


External and internal API calls are logged. This allows for detailed tracking of API usage and potential security incidents.

API and application logs can be provided to the customer on a case by case basis. Please request access through support, and include the site and relevent access IDs.

### Audit logging
auditd runs on all hypervisors, providing full security and audit logging.




## 3.2 Security Monitoring

*Details about security event monitoring, threat detection, and incident response for compute services will be outlined here.*

## 3.3 Time Synchronization

All servers have `systemd-timesyncd` enabled and configured to synchronize time. The timezone is set to UTC to ensure consistency across all servers.

Clock drift is monitored by prometheus node exporter and alerted on when exceeding the thresholds defined in the seter site configuration: `prometheus/rules/ntp.rules`.
