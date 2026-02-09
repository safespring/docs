# Metadata Service

The metadata service allows instances to retrieve information about themselves at boot time and during runtime. This is the mechanism that powers cloud-init, SSH key injection, and custom instance configuration.

This page includes OpenStack CLI commands. See the [API Access documentation](api.md) for instructions on how to install and configure the command line client.

## How it works

Every instance in Safespring Compute can reach the metadata service at the link-local address:

```
http://169.254.169.254
```

This address is available from within any instance regardless of which network it is attached to. No security group rules are needed to access it.

!!! note
    The metadata service address `169.254.169.254` is also used for BGP peering in load balancing setups. See the [Load Balancing documentation](loadbalancing.md) for details on that use case.

## Querying the metadata service

From within a running instance, you can query the metadata service using standard HTTP requests. The OpenStack metadata API is available at several version endpoints:

```bash
curl http://169.254.169.254/openstack/latest/meta_data.json
```

This returns a JSON document containing information about the instance, such as:

- Instance UUID
- Instance name
- Hostname
- Availability zone
- SSH public keys
- Project ID

Example response:

```json
{
    "uuid": "5b60d85c-8898-459a-804a-9ca593097104",
    "hostname": "my-instance.novalocal",
    "name": "my-instance",
    "launch_index": 0,
    "availability_zone": "nova",
    "project_id": "b397a608f93148acaf55e5223a445814",
    "public_keys": {
        "my-key": "ssh-rsa AAAA..."
    },
    "keys": [
        {
            "name": "my-key",
            "type": "ssh",
            "data": "ssh-rsa AAAA..."
        }
    ],
    "devices": [],
    "dedicated_cpus": []
}
```

### Extracting specific fields with jq

You can pipe the output through `jq` to extract individual fields. For example, to get the instance UUID:

```bash
curl -s http://169.254.169.254/openstack/latest/meta_data.json | jq -r '.uuid'
```

To get the instance name:

```bash
curl -s http://169.254.169.254/openstack/latest/meta_data.json | jq -r '.name'
```

To get the first SSH public key:

```bash
curl -s http://169.254.169.254/openstack/latest/meta_data.json | jq -r '.keys[0].data'
```

!!! info
    The `-s` flag silences curl's progress output and `-r` tells jq to output raw strings without quotes. Most cloud images include `jq` by default. If it is not installed, you can install it with `apt install jq` (Debian/Ubuntu) or `dnf install jq` (CentOS/RHEL).

## User data

User data is the content you provide in the **Customization Script** field (or via the `--user-data` CLI flag) when launching an instance. This is what cloud-init processes at first boot.

You can retrieve the user data from within the instance:

```bash
curl http://169.254.169.254/openstack/latest/user_data
```

This is useful for debugging cloud-init issues or for scripts that need to re-read their configuration.

For more on how to provide user data at launch time, see the [Cloud Init section in Getting Started](getting-started.md#cloud-init).

## Custom metadata

You can attach arbitrary key-value metadata to an instance at launch time or afterwards. This is useful for tagging instances with roles, environments, or other application-specific information.

!!! note
    Custom metadata only appears in the metadata service response if it has been explicitly set. If no custom metadata has been added, the `meta` field will be absent or `null`.

### Setting metadata at launch

In the Horizon dashboard, custom metadata can be added in the **Metadata** tab of the **Launch Instance** wizard.

Using the CLI:

```bash
openstack server create \
    --property role=webserver \
    --property environment=production \
    ...
    my-instance
```

### Updating metadata on a running instance

```bash
openstack server set --property role=appserver my-instance
```

### Reading metadata from within the instance

Scripts running inside the instance can read custom metadata through the metadata service:

```bash
curl -s http://169.254.169.254/openstack/latest/meta_data.json | jq '.meta'
```

When custom metadata has been set, the response will include a `meta` field:

```json
{
    "meta": {
        "role": "webserver",
        "environment": "production"
    }
}
```

## Config drive

As an alternative to the network-based metadata service, OpenStack supports a **config drive** — a small read-only disk that is attached to the instance and contains the same metadata and user data.

Config drives are useful in scenarios where:

- The instance does not have network access at boot time
- You need to pass data larger than what the metadata service supports
- You want the metadata to be available without any network dependency

!!! warning "Config drive must be enabled at launch"
    A config drive is only present if it was explicitly enabled when the instance was created. If you did not enable it, there will be no config drive device attached to the instance. In that case, use the network-based metadata service at `169.254.169.254` instead.

### Enabling config drive

In the Horizon dashboard, enable the config drive option in the **Configuration** tab of the **Launch Instance** wizard.

Using the CLI:

```bash
openstack server create \
    --config-drive true \
    ...
    my-instance
```

### Finding and accessing the config drive

The config drive appears as a small read-only disk inside the instance. The device path varies, so use `lsblk -f` to identify it. A config drive will show up with an `iso9660` or `vfat` filesystem type.

If the config drive was **not** enabled, you will only see the instance's regular disks and any attached volumes. For example:

```
NAME    FSTYPE FSVER LABEL           UUID                                 MOUNTPOINTS
sda
├─sda1  ext4   1.0   cloudimg-rootfs b2679cb7-040c-47fb-9459-f477977bb9de /
├─sda14
├─sda15 vfat   FAT32 UEFI            E9A4-DC35                            /boot/efi
└─sda16 ext4   1.0   BOOT            9c6b3b5d-0247-404e-ac9c-39dd8b38829c /boot
sdb
└─sdb1  ext4   1.0                   62822aa7-2f1f-47ae-afdd-42841c3c9bda
```

In this output there is no `iso9660` config drive — `sdb` is a regular attached volume. If a config drive were present, it would appear as an additional device with an `iso9660` filesystem.

Once you have identified the config drive device, mount it:

```bash
mkdir -p /mnt/config
mount /dev/<config-drive-device> /mnt/config
```

The contents follow the same structure as the network metadata service:

```
/mnt/config/openstack/latest/meta_data.json
/mnt/config/openstack/latest/user_data
```

Most cloud images that support cloud-init will automatically detect and mount the config drive at boot, so manual mounting is typically only needed for debugging.

## Troubleshooting

If cloud-init is not behaving as expected, the metadata service is a good place to start debugging:

1. Verify that the metadata service is reachable:

    ```bash
    curl -s http://169.254.169.254/openstack/latest/meta_data.json > /dev/null && echo "OK" || echo "UNREACHABLE"
    ```

2. Check that your user data was received correctly:

    ```bash
    curl http://169.254.169.254/openstack/latest/user_data
    ```

3. Review the cloud-init logs for errors:

    ```bash
    cat /var/log/cloud-init.log
    cat /var/log/cloud-init-output.log
    ```
