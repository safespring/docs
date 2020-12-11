# Using overlay networks 

Most customers will be fine with not being able to choose which network to use in the platform. For some other customers this could be a problem if they intend to set up VPN-tunnels from their current environment to the one at Safespring. There are mainly two solutions to this
1)  Use IPv6 for all communication to the servers at Safespring. This could either be done by relying on the application security (with for instance TLS) and then set up the connections directly to the public IPv6 addresses in either the “default” or the “public” network. The other options is to set up an IPSec or IPinIP tunnel from the current infrastructure with IPv6 traffic going through the tunnel. 
2)  Using an overlay network solution such as Wireguard or Zerotier. Both solutions are used to set up VPN-tunnels between all the instances communicating. Wireguard is proven but lacks some of the management features Zeroties has. Zeroties is a paid service but has a free start option with a network with up to 50 hosts which will suffice for most customers.
Both Wireguard and Zerotier are agent based solutions which means that one has to install an agent which in turn sets up the tunnels between the hosts in the overlay network.  

A description on how to set up Zerotier with automatic installation of the agent on instances in Safesprings platform follows below.

## Setting up Zerotier
Zerotier is a product used to set up virtual networks with encrypted tunnels which spans over the internet. When nodes are added to the virtual network they can communicate with each other. In the standard setup layer 3 connectivity is achieved but functionality for L2 tunnels is also supported.
Zerotier can be used instead of the classic VPN-tunnel setup. Instead of manually configuring VPN-tunnels for access to resources a more automatic approach can be used for easy addition and deletion of nodes to the virtual networks. All nodes belonging to the networks will run an agent which comes for all major platforms and is easy to install.
Go to https://zerotier.com and sign up for an account.

Click “Sign up” and fill in the form. Also click the link sent to your email to verify your address.

## Create a network
When you log in for the first time you will be greeted with a button that says “Create network”. Click that and you will now see your virtual networks ID. This ID is used when you want to join nodes to the network.
If you click on the network ID you will see a number of settings. The most important for now is whether the network should be “Private” or “Public”. Private means that you in the GUI at Zerotier must acknowledge all nodes joining the network whereas “Public” means that the nodes can join without such acknowledgment. For security reasons Safespring recommends to set it to private.
### Install agents on nodes that should join the network
The installation of the agents is easy. Go to https://www.zerotier.com/download/ and pick the agent for you platform. For Windows and Mac there are graphical installers but for Linux you will have to use the command line to install the agent. Below comes a description on how to install the agent on Linux automatically on new nodes in Safesprings platform.
Once the installer is run you will be able to start the management software for the agent. If you are running Windows an icon in the taskbar will show up. If you right-click on that icon you will see a menu with different options.

If you click on “Join Network” and input the network ID from your account page at Zerotier the node will be added to the network. You can now reach all other nodes on the addresses listen under the network at your account page at Zerotier.

## Installation on other platforms
Even though the installation on Linux is done with the command line it is actually very simple to install the agent on  any Linux. Just follow the instructions for you specific platform at https://www.zerotier.com/download/.
For Debian based Linux distributions it is possible to automate the process even further to automatically join a new instance to the network. Safesprings platform has support for cloud-init which is a framework for automatic tasks when an instance is created. By using the commands from the Zerotier download page wrapped in a cloud-init script the installation can be fully automated.
## Automatic installation on Debian and RedHat based distributions
Start with creating a new instance with the “Launch instance” dialogue in Safesprings platform. Under “Network” you can pick either “public” or “default”. The public-network will assign a public IP-address to the instance and “default” will assign a private IP-address with dynamic NAT to the outside. The reason for you using Zerotier in the first place is probably that you do not want the instance to be publicly available so the network "default" is your best choice here. 

![image](../../images/np-launch-instance.png)

The next point of interest is the “Configuration” tab. This is where we will paste the cloud-init code below that will install the agent:

```code
#cloud-config
output: {all: '| tee -a /var/log/cloud-init-output.log'}
manage_etc_hosts: true
apt_update: true
runcmd:
 - curl -s 'https://raw.githubusercontent.com/zerotier/ZeroTierOne/master/doc/contact%40zerotier.com.gpg' | gpg --import && if z=$(curl -s 'https://install.zerotier.com/' | gpg); then echo "$z" | sudo bash; fi
 - sudo zerotier-cli join <network ID from Zerotiers webpage>
```

Make sure to insert your network ID from the Zerotier web page at the last row. Start the instance and go the the Zerotiers webpage. After a while you should see you host showing up in the “Members” section:


![image](../../images/np-zerotier-members.png)

When the host show up, check the “Auth” checkbox to join the host to the network. It will now get an IP-address in the overlay network which you can reach from the other nodes in the network.
