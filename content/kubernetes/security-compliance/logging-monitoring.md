# Logging and Monitoring

This document outlines the logging and monitoring requirements and practices for Safespring On-demand Kubernetes services.

## 3.1 System Logging

Logs are collected per site in a shared logging system using[grafana Loki](https://grafana.com/oss/loki/). The service runs on the operations cluster and monitor applications and clusters on each site.The infrastructure and configuration is fully automated using our internal git repositories and ArgoCD.

API and application logs can be provided to the customer on a case by case basis. Please request access through support, and include the site and relevent access IDs.

!!! note "On-demand Kubernetes Logs"

    For On-demand Kubernetes clusters we do not store or monitor the logs.

## 3.2 Security Monitoring

*Details about security event monitoring, threat detection, and incident response for Kubernetes services will be outlined here.*

## 3.3 Time Synchronization

We make use of Talos linux as an underlying OS for our operational infrastructure and by default, Talos Linux uses `time.cloudflare.com` as the NTP server.
