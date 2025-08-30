# Logging and Monitoring for Datacenter infrastructure and shared services

Safespring has a shared platform per site that provides centralized logging and monitoring capabilities. This platform ensures consistent and efficient management of logs and metrics across all datacenter infrastructure and shared services.


## Logging

For logging, [grafana Loki](https://grafana.com/oss/loki/) is used. The service runs on the shared controlplane nodes('virt nodes') in each site. The infrastructure and configuration is fully automated using our internal ansible roles.

Services can integrate with loke using fluentbit or other tools. Depending on the puprose and type of logs they can be ingested in protected storage to prevent tampering. This is utilized for auditing and compliance purposes.

## Monitoring

Each site has a dedicated monitoring system, implemented using prometheus.
Alerting rules are managed per site to provide granularity and match customer needs.

Alerting itself is done using a central alert management cluster. The cluster runs on our public clouds and a node in an external cloud. This is done to ensure we are able to keep alerting in case of incidents in our own infrastructure.
