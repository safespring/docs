# Development and Operations Management

This document outlines the development and operations management requirements and practices for Safespring on-demand Kubernetes services.

## 6.1 Environment Separation

Safespring On-Demand Kubernetes operational infrastructure is currently divided into two types of clusters:

- Ops Cluster - necessary for having a centralized view (logging, monitoring) of the infrastructure and the operations performed on it, as well as acting as the controller (via ArgoCD) for application setup both in Ops Cluster as well as Management Cluster(s);
- Management Cluster(s) - needs to be at least 1 per [datacenter](../../index.md#services) (e.g. osl2, sto2 etc.) with the purpose of acting as both the Management cluster for creating Workload Clusters, as well as any necessary site specific components for enabling cluster creation and monitoring.

We also make use of 3 types environments: testing (including CI/CD), staging/QA and production.

Customers always run their Workload Clusters from the production Management Clusters.

The dedicated staging environment that runs within the same production security measures as the production environments.

The testing environment is used for CI/CD, upgrade testing, bug fixing, etc.

Customer data from the on-demand Kubernetes service is never transferred to other environments than the production environment.

## 6.2 Change Management

Change management is implemented as a GitOps workflow. Changes are made into feature branches and merged into the main branch after approval.

Branch protection is implemented to ensure only team members can review pull requests. A minimum of one approval from a team member that is not the author of the pull request is required and enforced.

Workload Clusters configuration of managed apps, for each customer cluster is tracked in a dedicate namespace.

## 6.3 Data Masking

!!! note "Data Masking"

    Data masking is not implemented. We never transfer customer data to other environments than the production environment.

## 6.4 Production data in acceptance environments

!!! note "Production data in acceptance environments"

    Production data is never transferred to other environments.

## 6.5 Audit and Testing Protection

### Audit Trail Protection

**Immutable Audit Logs**:

* Kubernetes audit logs are stored in an **append-only** - format to prevent tampering.
* Each of the infrastructure clusters (Management and Ops) has audit logging enabled and collected via Loki with a total retention of 1 month.

**Access Controls**:

* Access to audit logs is restricted via RBAC and Zitadel integration with MFA.
* Only authorized personnel can view or query audit data.
* Auditors are provided **read-only** - credentials when accessing monitoring dashboards, logs, or cluster state.
* For Workload Clusters access can be tracked as follows:

  - the authentication is performed via a Managed Zitadel IDM, whilst authorization of the user happens by having a mapping between the group of the user from IDM, that is bound in the Workload CLuster to a specific cluster role;
  - the kubernetes APIserver is configured to so that each user with a specific group claim coming from our issuer, and having a specific OIDC clientID is identified by its email in the APIserver requests.
  - the logging level in the kubernetes APIserver is done at the **Metadata**.

### Testing Environment Security

**Isolated Testing Environments**:

* Security assessments and compliance testing occur a **dedicated clusters** to avoid risk to production workloads.
* Openstack Security Groups segmentation ensures no cross-contamination between test and production environments.

**Controlled Test Data Usage**:

* Synthetic or anonymized datasets are used in test environments to comply with GDPR and reduce data exposure risks.
