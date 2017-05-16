#Known Issues
There are some currently known issues in the platform. This page describes the most common pitfalls.

##DNS Resolver
The built in resolver in the platform has some issues in the current version. It has been reported to be slow and not to respond to queries in timely manner. The best work around is to provide another resolver when creating the network to which you connect your instances. It is done in the third tab in the "Create Network" dialogue:

![Create Network Tab 3](/images/create-network-dia2.png)

In the picture above we picked Googles resolver but any external resolver would work. Please note that this setting can only set when creating the network in the GUI. In order to update this setting on an existing network - the API must be used.

##Instance operations
In the drop-down menu in the instance listing there are some operations which are unsupported at the moment. It does not mean that they fail - but they could lead to data-loss and therefore not recommended for use. Problems with using "Suspend" and "Resize" while a volume was attached to the instance have been reported. To ensure that the attached volume persists after the operation it should be detached from the instance before the "Suspend" or "Resize" command is issued.


![Create Network Tab 3](/images/instance-dropdown.png)

"Resize" works if you shutdown the instance first. It is prioritized function to get working properly even for running instances.
"Shelve" shutdowns the instance and takes a snapshot of it. It works for smaller instances but takes very long time for larger instances and should be used with caution.


##SNAT-networks in the network listing and Topology view
For every network you create which is connected to a router with an external gateway another network also will show up in the network listing and network topolgy view:

![Network Listing](/images/snat-network.png)

These network should be neglected, but never deleted as the NAT-functionality for floating IPs will stop working if they are deleted. This extra information (which only confuses the user) is planned to go away in newer releases of the platform.