# Roadmap for safespring services

This page describes what we are working on right now

## Roadmap for Safespring services

| Currently working on       | Near term plans                   | Future plans                        |
|----------------------------|-----------------------------------|-------------------------------------|
| Upgrades to Safespring Compute in osl1 site |                  |                                     |
|  |                        |                                     |
|                            |                                   |                                     |

## Recent changes in the platform

### March 2022

* Old flavors are removed. If that impacts your automation scripts, please refer to our [statuspage](https://status.safespring.com/incidents/sndw1pmf48f5)
* New flavors, see [documentation](../compute/../new/flavors.md)
* Added IPv6 to default instance network
* Fixed an issue where NAT outgoing rules implemented  in calico policy wrongfully also NATed connections going to the internal, east-west, public IPs of the public openstack network.

### February 2022

* Improved performance for windows instances in the new platform

### January 2022

* We are now charging for IPv4 address use in sto1 site
* Old ipnett domains are deprecated - see [this link](https://docs.safespring.com/service/domain-changes/) for more information

### September 2021

* Block storage and NVME flavors available on the new sto1 site
### January 2020

* Improved performance for Safespring Storage service in sto2
* New support email – support@safespring.com for all our services

### December 2019

* Updated backup client to 8.1.9.0
* New Storage Cluster in sto2

### November 2019

* New compute nodes with local disk and AMD CPUs in sto1
* New compute flavors
