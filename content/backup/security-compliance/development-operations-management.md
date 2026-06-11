# Development and Operations Management

This document outlines the development and operations management requirements and practices for Safespring Backup services.

## 6.1 Environment Separation

Safespring runs Backup production and development services on separate environments.

Customer files are never transferred to a development environment. For development purposes, 
we use our own dedicated nodes to simulate various types of machines and data.

## 6.2 Change Management

Installations and upgrades of production backup servers are always executed after the approval of multiple engineers.

Backup documentation changes are submitted on a [public GitHub repository](https://github.com/safespring/docs/) 
as pull requests, and are approved by a separate engineer from the author(s).

## 6.3 Data Masking

!!! note "Data Masking"

    Data masking is not implemented. We never transfer customer data to other environments than the
    production environments.

## 6.4 Production data in acceptance environments

!!! note "Production data in acceptance environments"

    Production data is never transferred to acceptance environments.

## 6.5 Audit and Testing Protection

*Information about protecting audit trails, testing environment security, and maintaining data integrity during security assessments and compliance testing will be outlined here.*