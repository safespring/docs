# Known Issues

There are some currently known issues for Safespring services. This page
describes the most common pitfalls. Known issues for Backup is under the [Backup
FAQ page](/backup/faq).


## AWS S3 update makes some S3 libraries or S3 clients fail
The AWS S3 protocol recently changed to include extra checksums during uploads, and some of the libraries used by S3-compatible applications have quickly followed suit and added the requirements for these checksums. Ceph is implementing these for its S3 endpoint, but no release has this in yet. If you suddenly get an upload error like

```code
Error: failed to upload state: operation error S3: PutObject, https response error StatusCode: 400, RequestID: xyz HostID: , api error InvalidArgument: x-amz-content-sha256 must be UNSIGNED-PAYLOAD or a valid sha256 value
```
or

```code
upload failed: test.txt to s3://bucket/test.txt An error occurred (MissingContentLength) when calling the PutObject operation: Unknown
```
it will be because the client library expects a response with more checksums made than before.
This affects software that pulls in S3 library code such as Boto3 or from the AWS SDK, and if possible you should see if you can pin the S3 library to a slightly older version until we can push out this update.
For Boto3, pinning the version to 1.35.99 still works, while 1.36 gives you upload errors.

## DHCP lease not being renewed causing loss of connectivity in STO1

This is an issue that we've seen on certain hypervisors in STO1, where unicast
messages from the DHCP client are being dropped before they reach the service
acting as DHCP server. This causes the lease to expire and the instance to lose
its IP address. Although we haven't been able to find the root cause of the
issue, it's expected to be resolved in an upcoming hypervisor upgrade. In the
meantime, we've proceeded to set an unlimited duration on IPv4 leases. However,
its recommended to either configure a static IP or set a DHCP client option to
prevent connectivity loss when rebooting the instance.

### DHCP client-side options on Ubuntu 22.04

To configure the DHCP client with the "critical" option, add the following to Netplan:

```yaml
/etc/netplan/99-critical-dhcp.yaml
network:
  version: 2
  ethernets:
    ens3:  # Replace "ens3" with your network interface name
      dhcp4: true
      dhcp6: true # optional
      critical: true
```

### DHCP client-side options on Debian and other distribution using networkd

Create an override file for the network interface and add the following to the
DHCP section:

```ini
/etc/systemd/network/99-dhcp-client.network
[DHCP]
KeepConfiguration=true
```

## Security group rule with unspecified `remote_ip_prefix` opens up all ports

We have identified a problem where security group rules that have unspecified
or empty string as `remote_ip_prefix` will unexpectedly ignore the specified
port range in the rule and instead opens up all ports.

The workaround to avoid this rather astonishing behaviour is to always specify
an IP range even when the range is `0.0.0.0/0` (aka "the world") and similarly
`::/0` for IPv6.

This situation is most unfortunate when using the Terraform provider for
Openstack to create security group rules, since the `remote_ip_prefix` is
documented as optional.

The issue is actively being investigated, and this page will be updated with new
information as soon as there is something to share.

**Update 2023-10-02:** The issues is now fixed upstream 
(https://github.com/projectcalico/calico/pull/8026/files/ff96fc82fcbae2d0eafd8f77ab782d4e7cbd2646) 
and we will implement the fix as soon as possible and then update the status
here.

## Rebuild of Debian 11 breaks DHCPv6 address assignment
This bug is described [here](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=991613). The Debian 11 image comes up just fine with IPv4 and IPv6 when creating it from the image but if one tries to rebuild the instance with the "Rebuild"-command DHCPv6 will fail to provide an IPv6 address. This has to do with that the instance the first time created generates a DUID which is used to calculate the last part of the IPv6 adress. When the instance is rebuilt another DUID is calculated which does no match the former DUID and therefore the DHCPv6 services will not provide the address. The solution is to save the old DUID in /var/lib/dhcp/dhclient6.ens3.leases and insert the same value into the same file after the rebuild.   

## Snapshots in the legacy platform
Safespring has trimmed the snapshotting functionality in the legacy platform which will make them go faster. There is still an old bug though with the image service not renewing it's keystone token which makes operations longer than 1 hour to fail. With the current optimizations an image of 40 GB will take about 20 minutes so that will usually not be a problem. When taking snapshots in the GUI Horizon it is important though to **start the snapshot operation soon after you have logged in** since the token is generated when you login in and not when you start the snapshot job. If you're about to take several snapshots in a row, you should logout and then login again before taking the next snapshot.

!!! info "Important Notice"
    To have the best success with snapshots the instance should be **shut off** before taking the snapshot.


## Create volumes from image sometimes fails

Sometimes when trying to create a volume from an image, the process fails with and "Error" status on the volume. This has to do with backend glance servers and we are working to fix this. If this happens, contact support@safespring.com with the ID of the volume and we will remove the failing volume. Then you can try again. The intermittent nature of the failure has to do with that some backend glance servers does not expand the qcow2 image correctly.

## Networking issue with the Debian 10 images

Unfortunately, the network services installed on the publicly provided 
Debian 10 images are not working with OpenStack.
One option is to install a Debian 9 image and then do an upgrade. 
Another option is to provide the following Cloud-Init script under 
"Configuration" when launching the instance. 
This will make the network services work as intended.

```shell
#cloud-config

output: {all: '| tee -a /var/log/cloud-init-output.log'}

password: [REDACTED]

chpasswd: { expire: False }

ssh_pwauth: True

manage_etc_hosts: false

package_upgrade: false

packages:

- curl

write_files:

- path: /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg

content: |

network: {config: disabled}

- path: /etc/network/interfaces.d/custom_eth0

content: |

auto lo

iface lo inet loopback

auto eth0

iface eth0 inet dhcp

mtu 1500

iface eth0 inet6 dhcp

accept_ra 2

runcmd:

- sed -i '1i\'"$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4) $(hostname)" /etc/hosts

- rm -f /etc/network/interfaces.d/50-cloud-init

- systemctl restart networking


```

## New certificate and hostname on Safespring Backup Service

Safespring backup service is changing hostname: `tsm1.cloud.ipnett.se` becomes
`tsm1.backup.sto2.safedc.net`.

All customers running Safespring Backup needs to update hostnames and
certificates for Safespring Backup services to start using the new hostnames.
See [this blogpost](https://www.safespring.com/blogg/byte-av-host-och-domainname/) for details.

## Resize operations disabled

Due to different issues with resize operations, we have disabled user-initiated resize operations. If you need to resize instances, please contact [support](/service/support/).

It is not possible to resize to an instance that has less disk space than the one you are resizing from.

We expect to support user initiated resize operations after a future system upgrade.

## DNS Resolver

The built-in resolver in the platform has some issues in the current version.
It has been reported to be slow and not to respond to queries in a timely
manner. 
The best workaround is to provide another resolver when creating the
network to which you connect your instances. 
Use `89.32.32.32` which is SUNETs resolver. 
It is done in the third tab in the "Create Network" dialogue:

![Create Network Tab 3](/images/create-network-dia2.png)

In the picture above, we picked Google's resolver, but any external resolver would
work. Please note that this setting can only set when creating the network in
the GUI. In order to update this setting on an existing network, the API must
be used.

## Instance operations

"Create Snapshot" only works for smaller instances at the moment. In addition,
creating snapshots can in some cases create locking issues in the storage backend
which will lead to a hard reboot of the instance.  This has to do with some
compatibility issues with OpenStack and the Ceph backend. With the coming upgrade
of OpenStack, this is prioritized to get working for all kinds of instances.

In the drop-down menu in the instance listing, there are some operations that
are unsupported at the moment. 
It does not mean that they fail, but they could
lead to data-loss and are therefore not recommended for use. 
Problems with using
"Suspend" and "Resize" while a volume was attached to the instance have been
reported. To ensure that the attached volume persists after the operation, it
should be detached from the instance before the "Suspend" or "Resize" command
is issued.

![Create Network Tab 3](/images/instance-dropdown.png)

"Resize" works if you shut down the instance first. It is a prioritized function
to get working properly even for running instances.  "Shelve" shutdowns the
instance and takes a snapshot of it. It works for smaller instances but takes
a very long time for larger instances and should be used with caution.

## SNAT-networks in the network listing and Topology view

For every network you create which is connected to a router with an external
 gateway, another network also will show up in the network listing and network
topology view:

![Network Listing](/images/snat-network.png)

These networks should be neglected, but never deleted as the NAT-functionality
for floating IPs will stop working if they are deleted. This extra information
(which only confuses the user) is planned to go away in newer releases of the
platform.

## Network operations in the GUI

Right now, the operations to change admin state and to change the name of a 
network do not work in the GUI. 
We recommend our users to use [API Access](/compute/api/) to perform these operations.


## Backup client incompatibility with local Windows NTFS deduplication enabled

Some users have reported performance issues when running the backup client on
volumes with NTFS deduplication enabled since the deduplication in the backup
client conflicts with the deduplication in the filesystem. The recommended solution
is to turn off deduplication either on the filesystem or local deduplication
in the backup client.

## Too recent version of shade results in images not showing

We have had an instance where a newer (`1.24.0`) version of shade caused some
images to become unavailable for provisioning when using ansible.

The solution was to downgrade shade to a known good (`1.12.1`) version.

## Unstable ipv6 connectivity

If you experience flapping ipv6 connectivity, it could be resolved either by
setting a static default route and not depend on RA.
Remove the `accept_ra 1` if it exists in you network configuration file or
any sysctl settings for `accept_ra`.

!!! note "Set static default route."
    This is an example, check your instance network address and change accordingly.

      `# ip -6 route add default via 2001:6b0:5a:4017::1`

      You may need to delete the RA route first if it exists.

      `# ip -6 route delete default`

Alternative configure all ipv6 settings static.

!!! note "Set static ipv6."
    Find your ipv6 address from Horizon or by CLI and insert it as `ipv6_address` and set `ipv6_gateway` to the same subnet but `::1` at the end.


``` shell tab="Debian or Ubuntu"
iface ens6 inet6 static
  address "ipv6_address"
  netmask 64
  gateway "ipv6_gateway"
  autoconf 0
  dns-nameservers 2001:4860:4860::8844 2001:4860:4860::8888
```

``` shell tab="CentOS and Fedora"
IPV6INIT=yes
IPV6ADDR="ipv6_address"/64
IPV6_DEFAULTGW="ipv6_gateway"
IPV6_AUTOCONF=no
DNS1=2001:4860:4860::8844
DNS2=2001:4860:4860::8888
```

## Accessing API in sto1 legacy

General API access is no longer available in legacy, but it is still possible
to get it working. You need a local, non-federated account.

Edit your local /etc/hosts to add the legacy DNS names which are no longer
published:

```shell
193.11.89.226 api.cloud.ipnett.se
193.11.89.225 cinder.api.cloud.ipnett.se
193.11.89.225 glance.api.cloud.ipnett.se
193.11.89.225 keystone.api.cloud.ipnett.se
193.11.89.225 neutron.api.cloud.ipnett.se
193.11.89.225 nova.api.cloud.ipnett.se
```

Use the following rc file as a base to create one with your own credentials.
You need to know your username, password, domain and project name.

```shell
export OS_AUTH_URL=https://keystone.api.cloud.ipnett.se/v3
export OS_IDENTITY_API_VERSION=3
export OS_VOLUME_API_VERSION=2
export OS_USERNAME=<USERNAME>
export OS_USER_DOMAIN_NAME=<DOMAIN>
export OS_PASSWORD=<PASSWORD>
export OS_PROJECT_NAME=<PROJECT>
export OS_PROJECT_DOMAIN_NAME=<DOMAIN>
export OS_REGION_NAME=se-east-1
```

Use a version of openstack cli that is not too new:

```
pip install python-openstackclient==4.0.2 python_cinderclient==6.0.0

source credentials.rc
openstack --insecure server list --long
openstack --insecure volume list --long
```

