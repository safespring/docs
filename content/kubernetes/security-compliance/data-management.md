# Data Management

This document outlines the data management requirements and practices for Safespring on-demand Kubernetes services.

## 2.1 Data Retention and Deletion

Safespring does not handle data retention or data deletion for customers. It is the responsibility of the customer to manage their data retention and deletion policies.

After contract expiration, Safespring will delete any leftover data associated with the customer's account within 6 months or the contractually specified period.

## 2.2 Backup and Recovery

Automatic backups are created of the control-plane etcd, as well as [Zitadel IAM](https://zitadel.com/) database, and [Harbor Registry](https://goharbor.io/) database.

Regular restore tests are done during upgrades and during disaster recovery simulations.

Backups are made to s3, every day using [talos-backup](https://github.com/siderolabs/talos-backup). The etcd backups are stored in s3 at 2 sites.

All backups are kept for 30 days.
