# Development and Operations Management

This document outlines the development and operations management requirements and practices for Safespring On-demand Kubernetes services.

## 6.1 Environment Separation

*Information about environment isolation, development/staging/production separation, and access controls between environments for Kubernetes services will be documented here.*

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

*Information about protecting audit trails, testing environment security, and maintaining data integrity during security assessments and compliance testing will be outlined here.*
