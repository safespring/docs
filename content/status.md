# Service status

## Status page

A status page is under development at https://status.safespring.com - for now,
the page contains (manual) annoucement of downtime and maintenace windows. It
will be extended with an automated view with data from our service monitoring.

In addition, the Norwegian site got test results from regular Rally runs at
https://test-stats.cloud.ipnett.no/ Rally is a suite that runs tests and
validation against the Openstack API.

## Known Issues

There are some currently known issues in the Compute platform. This page
describes the most common pitfalls. Known issues for Backup is under the [Backup
FAQ page][/backup/faq].

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

