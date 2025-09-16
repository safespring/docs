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
| Safespring On-demand Kubernetes  |   X   |   -   |   X   |   -   |


### Safespring Compute

To get started with the Compute service, see the [getting started guide](compute/getting-started.md)

### Safespring Storage

To get started with the Storage service, we have a page with [general
information](storage/getting-started.md)

### Safespring Backup

To get started with the Backup service,
see the [quickstart guide](backup/quickstart-guide.md)

### Safespring On-demand Kubernetes

To get started with the On-demand Kubernetes service,
we have a page with [general information](kubernetes/getting-started.md)

## Roadmap

This section describes what we are working on right now

### 1 - 3 months

* Migration of STO1 physical datacenter to a new location. This includes a major hardware refresh and new core network. The migration is expected to be completed by the end of the quarter and should mostly be transparent to customers.
* [Safespring on-demand Kubernetes clusters](https://www.safespring.com/en/services/containerplatform/). We will introduce a self-service portal and API that will allow you to create and manage Kubernetes clusters on demand. This on-demand solution will provide managed control planes and easy customization options.

### 3-9 months

* self-service portal and capabilities for Compute and Storage services
* Improved S3 authentication and authorization capabilities
* Kubernetes based private cloud solutions

## Recent changes in the platform

### 2025 Q3

* Refresh of documentation, removal of legacy references
* Openstack upgrades started in other sites

### 2025 Q1

* Increased S3 archive capacity in STO2
* Added compute site in STO2
* NVIDIA A2 GPU flavors in STO2
* Major Openstack upgrades finished in STO1

[ki]:service/known_issues.md
[sup]:service/support.md
