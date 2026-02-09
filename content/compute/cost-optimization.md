# Cost Optimization

This page collects practical advice for keeping costs under control when using Safespring Compute. For full pricing details, see the [Price list and Calculator](https://www.safespring.com/en/price/).

## Right-size your flavors

Choose the smallest flavor that meets your workload requirements. Over-provisioning CPU and RAM means paying for resources that are not being used. Monitor your instances' actual resource utilization and consider resizing to a smaller flavor if usage is consistently low. See the [Flavors documentation](flavors.md) for available sizes and [resizing instructions](flavors.md#resizing).

## Shelve instances you are not using

Shutting off an instance does **not** reduce billing — you are still billed for the reserved compute resources as long as the instance exists on a compute node. If you have instances that are not needed for an extended period, **shelve** them instead. A shelved instance is removed from the compute node and you are only billed for the storage of its snapshot.

Shelving works best for volume-based instances (b2 flavors), since the root disk already resides in central storage and does not need to be uploaded to the image service. For l2-flavor instances, the shelve operation needs to upload the entire local disk as a snapshot, which can take a long time for large disks.

See the [Instance Actions documentation](instance-actions.md#shelve-and-unshelve) for details on how to shelve and unshelve.

## Choose the right volume type

Safespring offers two volume types: **fast** and **large**. Fast volumes provide significantly higher IOPS but are priced accordingly. If your workload does not require high disk performance — for example data archives, log storage, or infrequently accessed files — use large volumes instead. Reserve fast volumes for boot disks and applications with high I/O requirements.

See the [Flavors documentation](flavors.md#b2-flavors) for IOPS details per volume type.

## Use the default network when public access is not needed

Public IPv4 addresses are a billable resource. If an instance does not need to be directly reachable from the internet, use the **default** network instead of the **public** network. The default network gives your instance a private IP address with NAT for outgoing traffic, so it can still reach the internet for updates, external API calls, and other outbound connections — it just won't have a public IP address.

If an instance currently on the public network no longer needs direct public access, you can detach it from the public network and attach it to the default network instead.

!!! tip "Preserve your IP address with Network Ports"
    If you assign a network directly when creating an instance, the IP address is lost when the instance is deleted. To keep the same IP address across instance recreation — useful in emergencies or restore scenarios — create a **Network Port** on the desired network and attach the port to the instance instead. See [Persistent IP addresses](howto/persistent-ip-address.md) for instructions.

!!! note
    The **private** network does not provide internet access at all — it only allows communication with other Safespring instances. If your instance needs outgoing internet connectivity, the **default** network is the right choice.

See the [Network section in Getting Started](getting-started.md#network) for details on the available networks.

## Clean up unused resources

Resources that are no longer in use still count against your quotas and may incur costs:

- **Detached volumes** — delete volumes that are no longer attached to any instance and no longer needed
- **Old snapshots** — volume snapshots consume storage quota. Remove snapshots that are no longer needed for backup or cloning purposes
- **Unused instances** — delete test or temporary instances when they are no longer needed, rather than just shutting them off

Use `openstack limits show --absolute` to get an overview of your current resource usage. See the [Quotas documentation](quotas.md) for more details.
