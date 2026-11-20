# Deleting Instances and Offboarding of service

We want you to stay with Safespring because you choose to, not because you have to. The self-service portal and open APIs let you manage, and remove, all your resources yourself.

Safespring never deletes anything on your behalf, to avoid accidental loss of data. You delete your own resources, and you are billed for them until they are deleted.

## How billing works

You are billed for:

- Storage used by volumes
- Storage used by volume snapshots
- Images you uploaded yourself
- Instance snapshots
- Instances that are not completely deleted

!!! warning
    A shut-down instance is still billed, because Safespring keeps its capacity reserved. To stop billing, delete the instance.

## Is my instance booting from an image or a volume?

Click the instance name, choose **Overview** and look at **Volumes Attached** at the bottom.

- **No volume on /dev/sda or /dev/vda:** the instance boots from an image. Volumes on other devices, such as /dev/sdb, don't change this.
- **A volume on /dev/sda or /dev/vda:** the instance boots from that volume. Note which one; you'll need it later.

## Keeping an instance ready to start

To stop paying for CPU and memory but keep the instance available, keep only its storage. You are then billed only for the snapshot or volume.

**Image-booted instances (l2 flavors):**

1. Create a snapshot of the instance under **Compute → Instances**.
2. Wait until the snapshot shows **Active** under **Compute → Images**. This can take up to 30 minutes.
3. Delete the instance.
4. To start it again, choose **Launch Instance**, select **Snapshot** under **Source**, and pick your snapshot.

**Volume-booted instances (b2 flavors):**

1. Delete the instance. The boot volume is kept.
2. To start it again, go to **Volumes**, open the dropdown at the end of the volume's row and choose **Launch as Instance**.

## Deleting an instance completely

Deleting an instance does not delete its volumes, snapshots or images. To remove everything:

1. Note the instance's volumes: click the instance name, choose **Overview** and check **Volumes Attached**.
2. Delete the instance.
3. Delete its snapshots under **Compute → Images**.
4. Delete its volume snapshots under **Volumes → Snapshots**. A volume can't be deleted while it has snapshots.
5. Delete its volumes, both boot and data volumes, under **Volumes → Volumes**.
6. Delete any images you uploaded for the instance.

## Removing a project

A project can be removed only when it is completely empty:

1. Delete all instances completely, as described in [Deleting an instance completely](#deleting-an-instance-completely).
2. Check that **Compute → Images**, **Volumes → Snapshots** and **Volumes → Volumes** are empty, and that no object storage buckets remain.
3. Email support@safespring.com and ask for the project to be removed.

## Secure erasure of data

Some contracts and procurements require secure erasure based on a standard such as NIST SP 800-88 or DoD 5220.22-M.

### How deleted data is handled

Deleted resources are removed from our storage immediately and can't be reached by you or any other customer. The freed storage is not overwritten at the moment of deletion; it is reused over time.

All disks that store customer data are encrypted with dm-crypt. When a disk is retired, the disk is sanitised or destroyed according to NIST SP 800-88.

### What you need to do

1. **Encrypt your data with keys you control.** Use LUKS on data volumes, and client-side encryption or SSE-C (customer-provided keys) for object storage.
2. **Destroy the keys** when the data should be erased. This is cryptographic erase, which NIST SP 800-88 accepts as a Purge method.
3. **Delete all resources**, as described in [Deleting an instance completely](#deleting-an-instance-completely) and [Removing a project](#removing-a-project).
4. **Keep a record** of what was erased, how, when and by whom.

!!! note
    DoD 5220.22-M (overwriting) can't be applied in a cloud, because your data is spread across many disks. Cryptographic erase is the method NIST SP 800-88 accepts for this kind of storage.

For a written statement on how we handle disks, for a procurement or audit, contact support@safespring.com.
