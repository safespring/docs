# Asset management for datacenter infrastructure

Most of Safespring services depend on physical assets such as servers, storage devices, and networking equipment. As a hybrid cloud provider, we have many assets spanning many different datacenters and regions.

Safespring uses a self-hosted [netbox](https://netboxlabs.com/) server that is used to track assets and source of truth for all our infrastructure and services.

## Overview

In netbox we track hostnames, roles, serial numbers and other metadata about our assets. We regularly audit our assets and compare them to our netbox inventory.

## Asset management process

Before hardware is procured a racklayout is created in netbox. The racklayout is used to reserve space for the hardware and set the hostnames and roles. The hardware will be set to the 'planned' state.

New hardware is labelled with hostnames and serial numbers. The serial numbers will then be added to netbox, together with any out-of-band management information. Once the hardware is installed, it will be set to the 'active' state.

### Roles and device types

We use various roles and device types to categorize our assets. The most common are:

* block-large - HDD based storage nodes
* block-fast - SSD based storage nodes
* os-cl - Openstack compute nodes
* net-leaf - leaf switches
* net-ext - routers
* net-mgmt - management switches

Currently, netbox servers as the source of truth for the various roles and device types.
