# Development and Operations Management

This document outlines the development and operations management requirements and practices for Safespring Storage services.

## 6.1 Environment Separation

Safespring storage is currently developed using 3 environments: development, staging/QA, and production.

Customers always run their workloads on the production environment.

Safespring has a dedicated staging environment that runs within the same production security measures as the production environments. This environment is used for upgrade testing, bug fixing, etc.

Safespring never transfers customer data to other environments.

## 6.2 Change Management

Change management is implemented as a GitOps workflow. Changes are made into feature branches and merged into the main branch after approval.

Branch protection is implemented to ensure only team members can review pull requests. A minimum of one approval from a team member that is not the author of the pull request is required and enforced.


## 6.3 Data Masking

!!! note "Data Masking"

    Data masking is not implemented. We never transfer customer data to other environments than the production environment.

## 6.4 Production data in acceptance environments

!!! note "Production data in acceptance environments"

    Production data is never transferred to acceptance environments.

## 6.5 Audit and Testing Protection

Audits done against the production environment always happen without elevated permissions.

For more details please contact [support](../../../service/support)
