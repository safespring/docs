# Secure Development

This document outlines the secure development requirements and practices for Safespring on-demand Kubernetes services.

## 5.1 Development Lifecycle Security

Applications developed for on-demand Kubernetes implement multiple layers to ensure a secure development lifecycle.

* Development is done in stages starting with the local environment and progressing to testing and stage before getting packaged and released to production;
* Code reviews are mandatory, access control is enforced. See [change management](development-operations-management.md#62-change-management) for implementation details;
* Uniform development linting and testing is ensured through CI/CD pipelines;
* Static Application Security Analysis tools are implemented in CI/CD pipelines;
* Dependency checks are performed twice a month;
* Vulnerability scanning of code is performed in CI/CD pipelines;
* Container images are scanned at regular intervals using:
    - [trivy vulnerability scanner](https://goharbor.io/docs/2.13.0/administration/vulnerability-scanning/) from Harbor registry
    - [Kubescape scanner](https://kubescape.io/docs/operator/vulnerabilities/#scanning-images-pulled-from-private-registries) configured for management clusters with access to harbor registries

## 5.2 Application Security Requirements

* Multi-Factor Authentication (MFA) is implemented for all administrator accounts;
* RBAC is used to enforce access control for all resources;
* Input validation in custom defined resources or components is used to minimize fallout from wrong input;
* Unified Packaging and Deployment ensure version control and rollback strategies for 

## 5.3 Secure System Architecture

Service architecture is set out during regular roadmap, strategy and design sessions as well as regular planning. This includes defining the architecture, identifying potential security risks, and implementing security controls.

ADRs (Architectural Decision Records) are used to document decisions and show rationale for design choices. ADRs are documented in the team repository, and are tracked in version control.

A default ADR template is used that includes mandatory sections for security controls and threat modeling.
Existing ADRs are reviewed regularly and updated as needed.

## 5.4 Secure Coding Standards

Industry best practices and resources are used to ensure secure coding standards for Kubernetes service development. This includes following secure coding guidelines, conducting code reviews, and training developers on secure coding practices.

## 5.5 Security Testing

* Automated security testing and Vulnerability scanning is implemented in CI/CD pipelines.

## 5.6 Outsourced Development

Development is never outsourced for components developed for on-demand Kubernetes service.
