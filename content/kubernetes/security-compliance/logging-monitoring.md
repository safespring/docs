# Logging and Monitoring

This document outlines the logging and monitoring requirements and practices for Safespring on-demand Kubernetes services.

## 3.1 System Logging

Logs are collected per site in a shared logging system using[grafana Loki](https://grafana.com/oss/loki/). The service runs on the operations cluster and monitor applications and clusters on each site.The infrastructure and configuration is fully automated using our internal git repositories and ArgoCD.

API and application logs can be provided to the customer on a case by case basis. Please request access through support, and include the site and relevant access IDs.

!!! note "On-demand Kubernetes Logs"

    For on-demand Kubernetes clusters we do not store or monitor the logs.

## 3.2 Security Monitoring

**Monitoring with Grafana**:

* Metrics, logs, and alerts are centralized in Grafana.
* Integration with Prometheus and Loki ensures full observability of operational infrastructure.
* Integration with slack for monitoring of relevant alerts.

**Threat Detection with Kubescape**:

* Each Operations cluster has enabled continuous Kubernetes cluster posture scanning.
* Compliance checks against frameworks (CIS, NSA, MITRE).
* Reports deviations from security best practices.

**Audit Logging**:

* Kubernetes audit logs captured for compliance and incident response.

## 3.3 Time Synchronization

We make use of Talos linux as an underlying OS for our operational infrastructure and by default, Talos Linux uses `time.cloudflare.com` as the NTP server.
