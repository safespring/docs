# Safespring documentation

This site contains documentation for Safespring services and user resources.

* For service status, go to our [statuspage](https://status.safespring.com)
* For support, see our [support page][sup]

!!! info "Known issues"
    Please review our list of [known issues][ki] to avoid spending time on issues
    we are already aware of.

## Getting Access

To get access to Safespring services, please contact us at hello@safespring.com.

## Services

Our services are delivered from four datacenters in Norway and Sweden: *osl2*
in the Oslo region,
*sto1* and *sto2* at two different locations in the Stockholm region,
and *dco1* in Kalix.

|                                  | osl2  | sto1  | sto2  | dco1  |
|:---------------------------------|:-----:|:-----:|:-----:|:-----:|
| Safespring Compute               |   X   |   X   |   X   |   -   |
| Safespring Storage               |   X   |   X   |   X   |   -   |
| Safespring Archive               |   -   |   -   |   X   |   -   |
| Safespring Backup                |   -   |   -   |   -   |   X   |
| Safespring on-demand Kubernetes  |   X   |   -   |   X   |   -   |


### Safespring Compute

To get started with the Compute service, see the [getting started guide](compute/getting-started.md)

### Safespring Storage

To get started with the Storage service, we have a page with [general
information](storage/getting-started.md)

### Safespring Backup

To get started with the Backup service,
see the [quickstart guide](backup/quickstart-guide.md)

### Safespring on-demand Kubernetes

To get started with the on-demand Kubernetes service,
we have a page with [general information](kubernetes/getting-started.md)

## Roadmap

This section describes what we are working on right now

### 1 - 3 months

* MFA features in Openstack for public cloud
* On-demand Kubernetes loadbalancing improvements (retain source ip address)
* Private cloud on-demand Kubernetes

## Recent changes in the platform

### 2026 Q1

* STO1 migrated to new hardware, refreshed core network and major upgrades to Openstack
* Introduced on-demand Kubernetes and self-service portal
* H100 flavors in STO1 on request


[ki]:service/known_issues.md
[sup]:service/support.md
