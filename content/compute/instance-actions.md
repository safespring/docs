# Instance Actions

This page describes the different actions you can perform on instances in Safespring Compute, such as stopping, starting, rebooting, and shelving.

This page includes OpenStack CLI commands. See the [API Access documentation](api.md) for instructions on how to install and configure the command line client.

## Billing implications

At Safespring, you are billed for an instance for as long as it exists — even if it is shut off, paused, suspended, or shelved. Billing is based on the instance existing on a compute node, not on whether it is running. The only way to stop being billed for an instance is to delete it.

## Overview

The following actions are available for instances:

| Action | Description | Billed for compute | Resources freed |
| --- | --- | --- | --- |
| **Shut off** | Shuts down the instance gracefully. The instance remains allocated on a compute node. | Yes | None |
| **Start** | Boots a previously shut off instance. | Yes | N/A |
| **Reboot** | Restarts the instance. Can be soft (graceful) or hard (forced). | Yes | None |
| **Pause** | Freezes the instance in memory. Very fast to resume. | Yes | None |
| **Unpause** | Resumes a paused instance from memory. | Yes | N/A |
| **Suspend** | Saves instance state to disk, similar to hibernation. | Yes | CPU and RAM freed |
| **Resume** | Restores a suspended instance from disk. | Yes | N/A |
| **Shelve** | Shuts down the instance and removes it from the compute node. A snapshot is stored. | Yes | CPU, RAM, and compute node |
| **Unshelve** | Restores a shelved instance from its snapshot onto a compute node. | Yes | N/A |

## Shut off and start

Shutting off an instance performs a graceful shutdown of the operating system, similar to pressing the power button on a physical server. The instance stays allocated on its compute node and all resources (disk, network, IP address) are preserved.

### Using the [Horizon dashboard](sites.md)

In the instance list, select **Shut Off Instance** from the dropdown menu. To start it again, select **Start Instance**.

### Using the CLI

```bash
openstack server stop my-instance
```

```bash
openstack server start my-instance
```

!!! note
    A shut off instance still occupies resources on the compute node and you will continue to be billed for it. Shutting off, pausing, suspending, and shelving do not reduce billing. The only way to stop being billed for an instance is to delete it.

## Reboot

Rebooting restarts the instance operating system. A **soft reboot** sends a shutdown signal to the OS and then boots it again. A **hard reboot** is the equivalent of a power cycle and should be used when the instance is unresponsive.

### Using the [Horizon dashboard](sites.md)

Select **Soft Reboot Instance** or **Hard Reboot Instance** from the dropdown menu in the instance list.

### Using the CLI

Soft reboot (graceful):

```bash
openstack server reboot my-instance
```

Hard reboot (forced):

```bash
openstack server reboot --hard my-instance
```

!!! warning
    A hard reboot does not give the operating system a chance to shut down gracefully. Use it only when the instance is not responding to a soft reboot.

## Pause and unpause

Pausing an instance freezes it in its current state in memory. The instance stops executing but its memory contents are preserved on the compute node. Unpausing restores execution immediately, making this the fastest way to temporarily stop and resume an instance.

### Using the [Horizon dashboard](sites.md)

Select **Pause Instance** from the dropdown menu. To resume, select **Resume Instance**.

### Using the CLI

```bash
openstack server pause my-instance
```

```bash
openstack server unpause my-instance
```

## Suspend and resume

Suspending an instance saves its entire state (including memory) to disk, similar to hibernating a laptop. This frees up CPU and RAM on the compute node while allowing you to restore the instance to exactly the state it was in when suspended.

### Using the [Horizon dashboard](sites.md)

Select **Suspend Instance** from the dropdown menu. To restore, select **Resume Instance**.

### Using the CLI

```bash
openstack server suspend my-instance
```

```bash
openstack server resume my-instance
```

## Shelve and unshelve

Shelving an instance shuts it down, takes a snapshot of it, and removes it from the compute node. The instance can be restored later from its snapshot using unshelve, though this takes longer than starting a shut off instance since it must be scheduled onto a compute node again.

!!! warning
    Shelving does **not** reduce your billing. You are billed for an instance for as long as it exists, regardless of whether it is running, shut off, or shelved. The only way to stop being billed for an instance is to delete it.

### Using the [Horizon dashboard](sites.md)

Select **Shelve Instance** from the dropdown menu. To restore, select **Unshelve Instance**.

### Using the CLI

```bash
openstack server shelve my-instance
```

```bash
openstack server unshelve my-instance
```

## Rescue mode

If your instance has a broken root filesystem and cannot boot properly, you can use rescue mode to boot from a different image and repair the disk. This is covered in the [Troubleshooting documentation](troubleshooting.md).
