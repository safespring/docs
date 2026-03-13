# Configuration Drive

A **configuration drive** (config drive) is a small read-only disk that OpenStack attaches to an instance at launch. It contains the same metadata and user data as the network-based [metadata service](../metadata.md), but is available entirely offline — no network connection is required to read it.

## When to use a config drive

The config drive is the right choice when:

- **The instance has no network at first boot.** The most common example is bootstrapping the network itself — for instance, using a cloud-init script to install and configure NetBird or WireGuard. The network metadata service at `169.254.169.254` is unreachable until the network is up, but the config drive is already attached and readable.
- **User data exceeds 16 KB.** The metadata service imposes a 16 KB limit on user data. A config drive has no such restriction.
- **You want a network-independent source of instance configuration.** In environments with strict network isolation, the config drive provides a reliable fallback.

When none of the above apply, the [metadata service](../metadata.md) is simpler and requires no extra steps at launch.

!!! warning "Config drive must be enabled at launch"
    The config drive is only present if it was explicitly requested when the instance was created. It cannot be added to a running instance.

## Enabling the config drive at launch

In the Horizon dashboard, check **Configuration Drive** in the **Configuration** tab of the **Launch Instance** wizard.

Using the CLI:

```bash
openstack server create \
    --config-drive true \
    --image "Ubuntu 24.04" \
    --flavor l2.c2r4 \
    --property netbird_setup_key=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX \
    my-instance
```

## Accessing the config drive on Linux

Cloud-init detects and reads the config drive automatically at boot — no manual steps are needed for normal use. The config drive takes priority over the network metadata service when both are available.

For debugging or for scripts that need to read data directly, you can mount it manually. The config drive uses an `iso9660` filesystem, so use `lsblk -f` to locate it:

```bash
lsblk -f
```

Look for a device with `FSTYPE=iso9660` and `LABEL=config-2`. Then mount it:

```bash
mkdir -p /mnt/config
mount -o ro /dev/<config-drive-device> /mnt/config
```

The contents mirror the structure of the network metadata service:

```
/mnt/config/openstack/latest/meta_data.json
/mnt/config/openstack/latest/user_data
```

## Accessing the config drive on Windows

Cloudbase-init detects the config drive automatically — no manual configuration is needed. The config drive appears to Windows as a CD-ROM drive and cloudbase-init reads from it during the normal initialization sequence, in the same way it would read from the network metadata service.

## Practical example: bootstrapping a network at first boot

The most common use for the config drive is running a setup script that needs instance-specific data (such as a NetBird setup key) before the network is available. The approach is the same as the [metadata parameterization example](cloud-init.md#using-instance-metadata-to-parameterize-scripts) in the cloud-init how-to, but reads from the config drive instead of `169.254.169.254`.

**At launch**, pass the setup key as an instance property and enable the config drive:

```bash
openstack server create \
    --config-drive true \
    --image "Ubuntu 24.04" \
    --flavor l2.c2r4 \
    --user-data netbird-configdrive.yaml \
    --property netbird_setup_key=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX \
    my-instance
```

**The cloud-init script** locates the config drive by filesystem type, mounts it, reads the setup key from the instance metadata, and joins the NetBird network — all before any external network access is needed:

```yaml
#cloud-config

runcmd:
  - |
    # Locate and mount the config drive
    CONFIG_DEV=$(blkid -t TYPE=iso9660 -o device | head -1)
    if [ -z "$CONFIG_DEV" ]; then
      echo "ERROR: config drive not found" >&2
      exit 1
    fi
    mkdir -p /mnt/config
    mount -o ro "$CONFIG_DEV" /mnt/config

    # Read the NetBird setup key from instance metadata
    SETUP_KEY=$(python3 -c "
import json
data = json.load(open('/mnt/config/openstack/latest/meta_data.json'))
print(data['meta']['netbird_setup_key'])
")
    if [ -z "$SETUP_KEY" ]; then
      echo "ERROR: netbird_setup_key not found in instance metadata" >&2
      exit 1
    fi

    # Install NetBird and join the network
    curl -fsSL https://pkgs.netbird.io/install.sh | sh
    netbird up --setup-key "$SETUP_KEY"

    umount /mnt/config
```

Because the config drive is a locally attached disk, the `netbird up` command that establishes network connectivity can run successfully even on an instance that has no external network yet.
