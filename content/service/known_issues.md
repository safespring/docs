# Known Issues

There are some currently known issues in the Compute platform. This page
describes the most common pitfalls. Known issues for Backup is under the [Backup FAQ page](/backup/faq).

## Rebuild of Debian 11 breaks DHCPv6 address assignment
This bug is described [here](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=991613). The Debian 11 image comes up just fine with IPv4 and IPv6 when creating it from the image but if one tries to rebuild the instance with the "Rebuild"-command DHCPv6 will fail to provide an IPv6 address. This has to do with that the instance the first time created generates a DUID which is used to calculate the last part of the IPv6 adress. When the instance is rebuilt another DUID is calculated which does no match the former DUID and therefore the DHCPv6 services will not provide the address. The solution is to save the old DUID in /var/lib/dhcp/dhclient6.ens3.leases and insert the same value into the same file after the rebuild.   

## Snapshots in legacy platform
Safespring has trimmed the snapshotting functionality in the legacy platform which will make them go faster. There is still an old bug though with the image service not renewing it's keystone token which makes operations longer than 1 hour to fail. With the current optimizations an image of 40 GB will take about 20 minutes so that will usually not be a problem. When taking snapshots in the GUI Horizon it is important though to **start the snapshot operation soon after you have logged in** since the token is generated when you login in and not when you start the snapshot job. If you're about to take several snapshots in a row, you should logout and then login again before taking the next snapshot.

!!! info "Important Notice"
    To have the best success with snapshots the instance should be **shut off** before taking the snapshot.


## Create volumes from image sometimes fails

Sometimes when trying to create a volume from an image, the process fails with and "Error" status on the volume. This has to do with backend glance servers and we are working to fix this. If this happens, contact support@safespring.com with the ID of the volume and we will remove the failing volume. Then you can try again. The intermittent nature of the failure has to do with that some backend glance servers does not expand the qcow2 image correctly.

## Networking issue with the Debian 10 images

Unfortunately the network services installed on the publicly provided Debian 10 images are not working with OpenStack. One option is to install a Debain 9 image and 
then do an upgrade. Another option is to provide the following Cloud-Init script under "Configuration" when launching the instance. This will make the network services
work as intended.

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

Due to different issues with resize operations, we have disabled the resize operations
users. If you need to resize instances, please contact [support](/service/support/).

We expect to support user initiated resize operations after a future system upgrade.

## DNS Resolver

The built in resolver in the platform has some issues in the current version.
It has been reported to be slow and not to respond to queries in a timely
manner. The best work around is to provide another resolver when creating the
network to which you connect your instances. Use `89.32.32.32` which is SUNETs resolver. It is done in the third tab in the
"Create Network" dialogue:

![Create Network Tab 3](/images/create-network-dia2.png)

In the picture above we picked Googles resolver but any external resolver would
work. Please note that this setting can only set when creating the network in
the GUI. In order to update this setting on an existing network, the API must
be used.

## Instance operations

"Create Snapshot" only works for smaller instances at the moment. In addition,
creating snapshots can in some cases create locking issues in the storage backend
which will lead to a hard reboot of the instance.  This has to do with some
compatibility issues with OpenStack and the Ceph backend. With the coming upgrade
of OpenStack, this is prioritized to get working for all kinds of instances.

In the drop-down menu in the instance listing there are some operations which
are unsupported at the moment. It does not mean that they fail,  but they could
lead to data-loss and therefore not recommended for use. Problems with using
"Suspend" and "Resize" while a volume was attached to the instance have been
reported. To ensure that the attached volume persists after the operation it
should be detached from the instance before the "Suspend" or "Resize" command
is issued.

![Create Network Tab 3](/images/instance-dropdown.png)

"Resize" works if you shutdown the instance first. It is prioritized function
to get working properly even for running instances.  "Shelve" shutdowns the
instance and takes a snapshot of it. It works for smaller instances but takes
very long time for larger instances and should be used with caution.

## SNAT-networks in the network listing and Topology view

For every network you create which is connected to a router with an external
gateway another network also will show up in the network listing and network
topology view:

![Network Listing](/images/snat-network.png)

These network should be neglected, but never deleted as the NAT-functionality
for floating IPs will stop working if they are deleted. This extra information
(which only confuses the user) is planned to go away in newer releases of the
platform.

## Network operations in the GUI

Right now the operations to change admin state and to change name of a network
does not work in the GUI. We recommend our users to use [API Access](/compute/api/) to perform these operations.


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

If you experience flapping ipv6 connectivity it could be resolved either by
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

## cloud.ipnett.[no|se] domains
Due to historical reasons some of our v1 infrastructure is using cloud.ipnett.[no|se] domains
which are no longer in public DNS. Thus, in order to reach these services using API you'll need
the following names and IP adresses in your local hosts file.

For .se, sto1 v1 API services

```shell
193.11.89.226 api.cloud.ipnett.se
193.11.89.225 cinder.api.cloud.ipnett.se
193.11.89.225 glance.api.cloud.ipnett.se
193.11.89.225 keystone.api.cloud.ipnett.se
193.11.89.225 neutron.api.cloud.ipnett.se
193.11.89.225 nova.api.cloud.ipnett.se
```

For .no, osl1 v1 API services

```shell
193.156.25.225 api.cloud.ipnett.no
193.156.25.225 cinder.api.cloud.ipnett.no
193.156.25.225 glance.api.cloud.ipnett.no
193.156.25.225 keystone.api.cloud.ipnett.no
193.156.25.225 neutron.api.cloud.ipnett.no
193.156.25.225 nova.api.cloud.ipnett.no
```

## Example rc files for legacy sites

These are example rc files (settings) for accessing our Norwegian and
Swedish Compute services. Replace the bracketed variables with your own
information.

### no-south-1

```shell
export OS_AUTH_URL=https://keystone.api.cloud.ipnett.no/v3
export OS_IDENTITY_API_VERSION=3
export OS_PASSWORD=<PASSWORD>
export OS_PROJECT_DOMAIN_NAME=<DOMAIN>
export OS_PROJECT_NAME=<PROJECT>
export OS_REGION_NAME=no-south-1
export OS_USERNAME=<USERNAME>
export OS_USER_DOMAIN_NAME=<DOMAIN>
```

### se-east-1

For API access to sto1 legacy, you also need to [download a
certificate](safedc_root.pem) to be able to verify the internal certs used. Set
the path to this certificate in the rc file setting `OS_CACERT` as below

```shell
export OS_AUTH_URL=https://keystone.api.cloud.ipnett.se/v3
export OS_CACERT=/path/to/safedc_root.pem
export OS_IDENTITY_API_VERSION=3
export OS_PASSWORD=<PASSWORD>
export OS_PROJECT_DOMAIN_NAME=<DOMAIN>
export OS_PROJECT_NAME=<PROJECT>
export OS_REGION_NAME=se-east-1
export OS_USERNAME=<USERNAME>
export OS_USER_DOMAIN_NAME=<DOMAIN>
```
