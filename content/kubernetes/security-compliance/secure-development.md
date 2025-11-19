# Secure Development

This document outlines the secure development requirements and practices for Safespring on-demand Kubernetes services.

## 5.1 Development Lifecycle Security

Applications developed for on-demand Kubernetes implement multiple layers to ensure a secure development lifecycle.

* Code reviews are mandatory, access control is enforced. See [change management](../development-operations-management.md#62-change-management) for implementation details.
* Static Application Security Analysis tools are implemented in CI/CD pipelines
* Vulnerability scanning of code is performed in CI/CD pipelines
* Docker images are scanned upon upload to the container registry and at regular intervals using:

  * [trivy vulnerability scanner](https://goharbor.io/docs/2.13.0/administration/vulnerability-scanning/) from Harbor
  * [Kubescape scanner](https://kubescape.io/docs/operator/vulnerabilities/#scanning-images-pulled-from-private-registries) for private registries

## 5.2 Application Security Requirements

* Multi-Factor Authentication (MFA) is implemented for all administrator accounts
* RBAC is used to enforce access control for all resources
* Extensive input validation is used to minimize fallout from wrong input

## 5.3 Secure System Architecture

Service architecture is set out during regular roadmap, strategy and design sessions. This includes defining the architecture, identifying potential security risks, and implementing security controls.

ADRs are used to document decisions and show rationale for design choices. ADRs are documented in the team repository, they are tracked in version control.

A default ADR template is used that includes mandatory sections for security controls and threat modeling.
Existing ADRs are reviewed regularly and updated as needed.

## 5.4 Secure Coding Standards

Industry best practices and resources are used to ensure secure coding standards for Kubernetes service development. This includes following secure coding guidelines, conducting code reviews, and training developers on secure coding practices.

## 5.5 Security Testing

* Automated security testing and Vulnerability scanning is implemented in CI/CD pipelines.

## 5.6 Outsourced Development

When development is outsourced to third parties, this is done under strict security requirements.
Security requirements are part of outsourced contracts and contractors always follow the same security standards as our own teams.
