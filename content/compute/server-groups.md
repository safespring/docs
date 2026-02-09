# Server Groups

Server groups let you control how instances are placed on the underlying compute nodes. By assigning instances to a server group with a specific policy, you can either keep them together on the same host or spread them across different hosts.

This page includes OpenStack CLI commands. See the [API Access documentation](api.md) for instructions on how to install and configure the command line client.

## Policies

Safespring Compute supports the following server group policies:

| Policy | Description |
| --- | --- |
| `affinity` | All instances in the group are placed on the **same** compute node. Useful when low latency between instances is critical. |
| `anti-affinity` | Instances in the group are placed on **different** compute nodes. Useful for high availability, ensuring a single hardware failure does not affect all members. |

!!! info "Important"
    A server group policy is enforced at launch time. If the scheduler cannot satisfy the policy (for example, no single host has enough capacity for another affinity member), the instance creation will fail. Plan your flavor sizes accordingly.

!!! warning "Avoid soft-affinity and soft-anti-affinity"
    OpenStack also offers `soft-affinity` and `soft-anti-affinity` policies. Safespring recommends **never** using these. The soft variants treat the placement policy as a preference rather than a requirement. If the scheduler cannot satisfy the policy, the instance will still be created without any warning. This means you may believe your instances are safely spread across different hosts (or grouped together), when in reality the policy was silently ignored. Always use the strict `affinity` or `anti-affinity` policies so that a failed placement is surfaced immediately as an error.

!!! warning "Limit anti-affinity groups to 5 instances"
    Safespring recommends adding no more than 5 instances to a single anti-affinity group. Large anti-affinity groups make platform maintenance more difficult, since every member must be placed on a separate compute node. During maintenance operations such as host evacuations or upgrades, the scheduler may not be able to satisfy the anti-affinity constraint, which can cause unwanted service interruptions for your instances. If you need more than 5 members in a cluster, consider splitting them across multiple anti-affinity groups.

## When to use server groups

### Anti-affinity (most common)

Use anti-affinity when you are running a cluster where each member should survive independently of the others. Typical use cases:

- Database cluster members (MySQL, PostgreSQL, MongoDB replicas)
- etcd nodes in a Kubernetes cluster
- Application servers behind a load balancer

This is especially important when using **l2 flavors** with local disk, since a single disk failure would affect all instances on that compute node. See the [Flavors documentation](flavors.md) for more details on local disk implications.

### Affinity

Use affinity when instances need the lowest possible network latency between them, and you accept the trade-off that a host failure will affect all members simultaneously.

## Creating a server group

### Using the Horizon web interface

Server groups can be created directly in the Horizon dashboard. Navigate to **Compute** -> **Server Groups** and click **Create Server Group**. Give the group a name and select the desired policy from the dropdown. The group is then available when launching new instances through the **Server Groups** tab in the **Launch Instance** wizard.

### Using the CLI

Create a server group with anti-affinity policy:

```bash
openstack server group create --policy anti-affinity my-ha-group
```

Create a server group with affinity policy:

```bash
openstack server group create --policy affinity my-local-group
```

List your server groups:

```bash
openstack server group list
```

View details of a server group, including its members:

```bash
openstack server group show my-ha-group
```

### Using Terraform

```hcl
resource "openstack_compute_servergroup_v2" "my_ha_group" {
  name     = "my-ha-group"
  policies = ["anti-affinity"]
}
```

## Launching instances in a server group

### Using the CLI

When creating an instance, use the `--hint` flag to assign it to a server group:

```bash
openstack server create \
    --flavor b2.c2r4 \
    --image ubuntu-24.04 \
    --network default \
    --key-name my-key \
    --hint group=<server-group-id> \
    my-instance-1
```

Replace `<server-group-id>` with the ID of the server group from `openstack server group list`.

### Using Terraform

Reference the server group in your instance resource using a scheduler hint:

```hcl
resource "openstack_compute_servergroup_v2" "ha_group" {
  name     = "ha-group"
  policies = ["anti-affinity"]
}

resource "openstack_compute_instance_v2" "cluster_member" {
  count     = 3
  name      = "cluster-member-${count.index + 1}"
  flavor_id = "b2.c2r4"
  key_pair  = "my-key"

  block_device {
    uuid                  = var.image_id
    source_type           = "image"
    destination_type      = "volume"
    volume_size           = 20
    boot_index            = 0
    delete_on_termination = true
  }

  network {
    name = "default"
  }

  scheduler_hints {
    group = openstack_compute_servergroup_v2.ha_group.id
  }
}
```

## Removing a server group

A server group can only be deleted when it has no members. Remove or delete all instances in the group first, then delete the group:

```bash
openstack server group delete my-ha-group
```

!!! note
    Deleting an instance automatically removes it from the server group. You do not need to manually unassign instances before deleting them.
