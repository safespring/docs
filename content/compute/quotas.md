# Quotas Management

Quotas limit how many resources a project can consume in Safespring Compute. They prevent any single project from accidentally using more resources than intended and help ensure fair distribution across the platform.

This page includes OpenStack CLI commands. See the [API Access documentation](api.md) for instructions on how to install and configure the command line client.

## What is quota-controlled

Each project has quotas for the following resource types:

| Resource | Description |
| --- | --- |
| Instances | Maximum number of virtual machines |
| VCPUs | Total number of virtual CPU cores across all instances |
| RAM | Total memory across all instances (in MB) |
| Volumes | Maximum number of block storage volumes |
| Volume storage | Total storage across all volumes (in GB) |
| Volume snapshots | Maximum number of volume snapshots |
| Security groups | Maximum number of security groups |
| Security group rules | Maximum number of rules across all security groups |

## Public IP addresses and networking

Safespring uses Calico as its networking engine, which does not use the floating IP concept found in traditional OpenStack deployments. To give an instance a public IP address, attach it to the **public** network when launching it. To remove public access, detach the instance from the public network and use the **default** network instead.

!!! warning "Never attach more than one network interface to an instance"
    Each network assigns a default gateway to the instance via DHCP. If an instance is attached to multiple networks (for example both **public** and **default**), it will receive two default gateways, leading to asymmetrical routing and unstable network connectivity. Always attach exactly one network interface per instance.

For more details on the available networks, see the [Network section in Getting Started](getting-started.md#network). For a deeper understanding of how networking works on the Safespring platform, see the blog post [Networking at Safespring](https://www.safespring.com/blogg/2022/2022-03-network/).

## Viewing quotas in the dashboard

The **Overview** page in the Horizon dashboard shows your current resource usage as pie charts, with each chart comparing usage against the quota limit. This is the quickest way to check how much headroom you have in a project.

For more details on the dashboard overview, see the [Getting Started documentation](getting-started.md).

## Viewing quotas with the CLI

### Compute quotas

To see your compute quotas (instances, VCPUs, RAM):

```bash
openstack quota show
```

### Storage quotas

To see your volume quotas:

```bash
openstack quota show --volume
```

### Current usage

To see how much of each resource you are currently using:

```bash
openstack limits show --absolute
```

This shows both the limit and current usage for each resource type, making it easy to identify which quotas you are approaching.

## Requesting a quota increase

Quotas are set by Safespring and cannot be changed by the customer directly. If you need more resources than your current quotas allow, contact Safespring support at [support@safespring.com](mailto:support@safespring.com).

When requesting a quota increase, include:

- The **project name** (e.g., `prod.company.com`)
- Which **resource type** needs to be increased
- The **desired new limit**
- A brief description of **why** the increase is needed

See [Getting support](../service/support.md) for more information on how to contact support.

## Tips for managing quota usage

- **Clean up unused snapshots** regularly, as they count against your storage quota. See the [Snapshots HOWTO](howto/snapshotting-instances.md) for more details.
- **Delete volumes** that are no longer attached to any instance and no longer needed. Detached volumes still count against your quota.
- **Remove unused security groups** and their rules if they are no longer in use.
- Use `openstack limits show --absolute` to periodically check your usage before launching new instances, to avoid hitting a quota limit unexpectedly.
