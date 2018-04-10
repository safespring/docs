# Service status

## Status page

A status page is under development at https://status.safespring.com - for now,
the page contains (manual) annoucement of downtime and maintenace windows. It
will be extended with an automated view with data from our service monitoring.

In addition, the Norwegian site got test results from regular Rally runs at
https://test-stats.cloud.ipnett.no/ Rally is a suite that runs tests and
validation against the Openstack API.

## Known Issues

The Backup service is currently running in a degraded state. We are [updating
a dedicated page](/backup/status) with information on this.

There are some currently known issues in the Compute platform. This page
describes the most common pitfalls. Known issues for Backup is under the [Backup
FAQ page](/backup/faq).

### DNS Resolver

The built in resolver in the platform has some issues in the current version.
It has been reported to be slow and not to respond to queries in a timely
manner. The best work around is to provide another resolver when creating the
network to which you connect your instances. It is done in the third tab in the
"Create Network" dialogue:

![Create Network Tab 3](/images/create-network-dia2.png)

In the picture above we picked Googles resolver but any external resolver would
work. Please note that this setting can only set when creating the network in
the GUI. In order to update this setting on an existing network - the API must
be used.

### Instance operations

"Create Snapshot" only works for smaller instances at the moment. This has to
do with some compability issues with OpenStack and the Ceph backend. With the
coming upgrade of OpenStack, this is prioritized to get working for all kinds
of instances.

In the drop-down menu in the instance listing there are some operations which
are unsupported at the moment. It does not mean that they fail - but they could
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

### SNAT-networks in the network listing and Topology view

For every network you create which is connected to a router with an external
gateway another network also will show up in the network listing and network
topolgy view:

![Network Listing](/images/snat-network.png)

These network should be neglected, but never deleted as the NAT-functionality
for floating IPs will stop working if they are deleted. This extra information
(which only confuses the user) is planned to go away in newer releases of the
platform.

### Network operations in the GUI

Right now the operations to change admin state and to change name of a network
does not work in the GUI. We recommend our users to use [API
Access](/compute/api/) to perform these operations.


### Backup client incompatibility with local Windows NTFS deduplication enabled

Some users have reported performance issues when running the backup client on
volumes with NTFS deduplication enabled since the deduplication in the backup
client conflicts with the deduplication in the filesystem. The recommended solution
is to turn off deduplication either on the filesystem or local deduplication
in the backup client.

### Too recent version of shade results in images not showing

We have had an instance where a newer (1.24.0) version of shade caused some
images to become unavailable for provisioning when using ansible.

The solution was to downgrade shade to a known good (1.12.1) version.

### Unstable ipv6 connectivity

If you experiance flapping ipv6 connectivity it could be resolved either by
setting a static default route and not depend on RA.
Remove the "accept_ra 1" if it exists in you network configuration file or
any sysctl settings for accept_ra.

!!! note "Set static default route."

This is an example, check your instance network address and change accordingly.

`# ip -6 route add default via 2001:6b0:5a:4017::1`

You may need to delete the RA route first if it exists.

`# ip -6 route delete default`

Alternative configure all ipv6 settings static.

!!! note "Set static ipv6."

Find your ipv6 address from Horizon or by CLI and insert it as "ipv6_address"
and set "ipv6_gateway" to the same subnet but ::1 at the end. No quotes.

####Debian or Ubuntu

```
iface ens6 inet6 static
  address "ipv6_address"
  netmask 64
  gateway "ipv6_gateway"
  autoconf 0
  dns-nameservers 2001:4860:4860::8844 2001:4860:4860::8888
```

####CentOS and Fedora

```
IPV6INIT=yes
IPV6ADDR="ipv6_address"/64
IPV6_DEFAULTGW="ipv6_gateway"
IPV6_AUTOCONF=no
DNS1=2001:4860:4860::8844
DNS2=2001:4860:4860::8888
```
