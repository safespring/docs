# Development and Operations Management

This document outlines the development and operations management requirements and practices for Safespring On-demand Kubernetes services.

## 6.1 Environment Separation

Safespring On-Demand Kubentes operational infrastructure is currently devided into two types of clusters:

- Ops Cluster - necessary for having a centralized view (logging, monitoring) or the infrastructure and the operations performed on it, as well as acting as the controller (via ArgoCD) for application setup both in Ops Cluster as well as Management Cluster(s).
- Management Cluster(s) - needs to be at least 1 per [datacenter](../../index.md#services) (e.g. osl2, sto2 etc.) with the purpose of acting as both the Management cluster for creating Workload Clusters, as well as any necessary site specific components for enabling cluster creation

We also make use of 2 types environments: staging and production.

Customers always run their workloads from the production Management Clusters.

The dedicated staging environment that runs within the same production security measures as the production environments. This environment is used for upgrade testing, bug fixing, etc.

Customer data from the on-demand Kubernetes service is never transferred to other environments than the production environment.

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
