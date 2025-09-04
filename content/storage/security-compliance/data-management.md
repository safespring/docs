# Data Management

This document outlines the data management requirements and practices for Safespring Storage services.

## 2.1 Data Retention and Deletion

Safespring does not handle data retention or data deletion for customers. It is the responsibility of the customer to manage their data retention and deletion policies.

After contract expiration, Safespring will delete any leftover data associated with the customer's account within 6 months or the contractually specified period.

## 2.2 Backup and Recovery

### Customer Data
Safespring storage services does not provide automatic backups of buckets or objects. Customers are responsible for handling their own backup and recovery strategies. Safespring can assist implementing these with the Backup as a Service (BaaS) offering.

### Storage service

Controlplane components for the storage service are not backed up. The components for this service cannot be restored from a backup. Instead the service is implemented with redundancy, utilizing at least 3-5 nodes for each stateful component.

Settings and configuration details for the service are included in configuration management tooling. This can easily be restored using a redeploy.
