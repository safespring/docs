# Data Management

This document outlines the data management requirements and practices for Safespring Compute services.

## 2.1 Data Retention and Deletion

Safespring does not handle data retention or data deletion for customers. It is the responsibility of the customer to manage their data retention and deletion policies.

After contract expiration, Safespring will delete any leftover data associated with the customer's account within 6 months or the contractually specified period.

## 2.2 Backup and Recovery

### Customer Data
Safespring compute services does not provide automatic backups of virtual machines. Customers are responsible for handling their own backup and recovery strategies. Safespring can assist implementing these with the Backup as a Service (BaaS) offering.

### Compute service

Automatic backups are created of the controlplane databases.

Regular restore tests are done during upgrades and during disaster recovery simulations.

Backups are made by kopia, every hour using the `bekopia` role. This can be found in the internal `safespring/ansible/roles/bekopia` repository/path.

Control plane backups are kept for 30 days.
