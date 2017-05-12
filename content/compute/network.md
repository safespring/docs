# Network service

In order to be able to connect to the internet with you instances (and make it possible to reach your instances on their floating IPs) there are a small number of things you need to do first:

+ Create a router with an external gateway to the public_v4 network
+ Create a network to which your instances will connect
+ Connect the network to the router
+ Attach the instances you create to the new network

In most cases you only need to do this once since your instances can share the same network.

##Create a router
First head to Network->Routers in the navigation menu:

![Create router](/images/create-router.png)

Click "Create Router" and you will be presented with the following dialogue:

![Create router dialogue](/images/create-router-dia.png)

Name your router anything unique and make sure to pick "public_v4" under the "External Network" dropdown. Click "Create Router".

## Create a network
Navigate to Network->Networks in the navigation menu and click "Create Network"

![Create network](/images/create-network.png)

You will be presented with the following dialogue.

![Create network dialogue 1](/images/create-network-dia1.png)

Name your network anything unique and press "Next". You will now instead be presented with the "Create Subnet" dialogue. This is where you pick which IP-network that you be configured on you network:

![Create subnet dialogue](/images/create-subnet-dia.png)

Just pick a private network which is not taken in your project and provide the netmask with the slash-notation. Cllick next.

![Create network dialogue 2](/images/create-network-dia2.png)

The next dialogue will present you with some optional settings. Since the internal DNS resolver has shown to be slow at times it is highly recommended to provide an external resolver. This could be Googles (8.8.8.8) or another resolver of you liking. Click "Create".

## Connect the network to your router
Navigate to Network->Routers again and click the title of you router:

![Router configuration 1](/images/router-conf-1.png)

You will be presented with the following:

![Router configuration 2](/images/router-conf-2.png)

Click the "Interface" tab and the "Add Interface":

![Router configuration 3](/images/router-conf-3.png)

Pick the subnet you created earlier in the drop-down box. If you leave the "IP Address" field empty the router will get the first address in the network (which is probably what you want). Click "Submit".

You now have created a router and a network to which you can attach your instances for network connectivity.

##Attach instances to your network
Go to Compute->Instances and click "Launch Instance". Under "Networks" make sure you pick the network you created. If you launch the instance and attach a floating IP and 
Go to Compute->Instances and click "Launch Instance". Under "Networks" make sure you pick the network you created. Make sure to set up [keypairs](keypairs.md) correctly. If you launch the instance and set up security groups and floating IP as described in [here](getting-started.md) you should now be able to connect to you instance. 

## Site-to-site layer 3 VPN

### The server

This is a working example of how to bring up a openVPN-server with Cloud-Init.
This example is made for Ubuntu 16.04. It is not made with all security, bells
and whistles that you might would like to have in production but it is a good
starting point.

To start, copy the cloud-config file below and edit it to suit your
environment . This file is in yaml syntax and you can read more at
http://cloudinit.readthedocs.io/en/latest/topics/examples.html

```shell
#cloud-config
output: {all: '| tee -a /var/log/cloud-init-output.log'}
password: mypassword
chpasswd: { expire: False }
ssh_pwauth: True
manage_etc_hosts: true
#
apt_update: true
packages:
   - openvpn
   - easy-rsa
   - sipcalc
#
write_files:
 - path: /root/setup-openvpn.sh
   content: |
    #!/bin/bash
    # Built for OpenVPN 2.3.2 x86_64-pc-linux-gnu [SSL (OpenSSL)] [LZO] [EPOLL] [PKCS11] [eurephia] [MH] [IPv6] built on Dec  1 2014
    set -x -e
    # PLEASE CHANGE THESE SETTINGS TO YOUR OWN TASTE, $easy_rsa_dir/vars
    COUNTRY="SE"
    PROVINCE="Solna"
    CITY="Stockholm"
    ORG="Safespring"
    EMAIL="me@safespring.com"
    OU="Cloud"
    NAME="server"
    KEY_CN=$NAME
    # openvpn setup variables
    openvpn_dir=/etc/openvpn
    easy_rsa_dir=${openvpn_dir}/easy-rsa
    keys_dir=${easy_rsa_dir}/keys
    client=client1
    home_network=192.168.34.0/24 #This MUST match openvpn client network.
    # END CUSTOM SETTINGS
    home_netaddr=`sipcalc $home_network | grep "Network address" | awk '{ print $4}' |grep -v -`
    home_netmask=`sipcalc $home_network | grep "Network mask" | awk '{ print $4}' |grep -v -`
    public_ip_addr=$(curl -s http://169.254.169.254/2009-04-04/meta-data/public-ipv4)
    ip_addr=$(curl -s http://169.254.169.254/2009-04-04/meta-data/local-ipv4)
    ip_mask=`ifconfig -a | sed -n "/inet addr:$ip_addr /{ s/.*Mask://;p; }"`
    network=`sipcalc $ip_addr $ip_mask | grep 'Network address' | awk '{ print $4}'`
    # Bugfix, https://bugs.launchpad.net/serverguide/+bug/1504676
    KEY_ALTNAMES="something"
    #
    # openvpn server #
    gunzip -c /usr/share/doc/openvpn/examples/sample-config-files/server.conf.gz > $openvpn_dir/server.conf
    mkdir $openvpn_dir/ccd
    sed -i.orig -e 's|;client-config-dir ccd|client-config-dir ccd|' $openvpn_dir/server.conf
    sed -i.orig -e 's|;log-append  openvpn.log|log-append  /var/log/openvpn.log|' $openvpn_dir/server.conf
    echo route $home_netaddr $home_netmask >> $openvpn_dir/server.conf
    # system #
    echo 1 > /proc/sys/net/ipv4/ip_forward #runtime
    sed -i.orig -e 's|#*net/ipv4/ip_forward=.*|net/ipv4/ip_forward=1|' /etc/ufw/sysctl.conf #permanent
    #
    sudo openssl dhparam -out $openvpn_dir/dh2048.pem 2048
    #
    # EasyRSA #
    make-cadir $easy_rsa_dir
    sed -i 's/KEY_COUNTRY="US"/KEY_COUNTRY="'$COUNTRY'"'/ $easy_rsa_dir/vars
    sed -i 's/KEY_PROVINCE="CA"/KEY_PROVINCE="'$PROVINCE'"'/ $easy_rsa_dir/vars
    sed -i 's/KEY_CITY="SanFrancisco"/KEY_CITY="'$CITY'"'/ $easy_rsa_dir/vars
    sed -i 's/KEY_ORG="Fort-Funston"/KEY_ORG="'$ORG'"'/ $easy_rsa_dir/vars
    sed -i 's/KEY_EMAIL="me@myhost.mydomain"/KEY_EMAIL="'$EMAIL'"'/ $easy_rsa_dir/vars
    sed -i 's/KEY_OU="MyOrganizationalUnit"/KEY_OU="'$OU'"'/ $easy_rsa_dir/vars
    sed -i 's/KEY_NAME="EasyRSA"/KEY_NAME="'$NAME'"'/ $easy_rsa_dir/vars
    cd $easy_rsa_dir
    source ./vars
    ./clean-all
    ./build-ca --batch
    ./build-key-server --batch $NAME
    cp $easy_rsa_dir/keys/server.crt $openvpn_dir
    cp $easy_rsa_dir/keys/server.key $openvpn_dir
    cp $easy_rsa_dir/keys/ca.crt $openvpn_dir
    #
    # build client files
    cd $easy_rsa_dir
    source ./vars
    ./build-key --batch $client
    cp /usr/share/doc/openvpn/examples/sample-config-files/client.conf $openvpn_dir/ccd/$client.conf
    sed -i 's/my-server-1/'$public_ip_addr/ $openvpn_dir/ccd/$client.conf
    sed -i 's/cert client.crt/cert '$client.crt/ $openvpn_dir/ccd/$client.conf
    sed -i 's/key client.key/key '$client.key/ $openvpn_dir/ccd/$client.conf
    cd $openvpn_dir/ccd/ && tar cvf $openvpn_dir/ccd/$client.files.tar $client.conf
    cd $easy_rsa_dir/keys/ && tar vfr $openvpn_dir/ccd/$client.files.tar ca.crt $client.crt $client.key
    echo iroute $home_netaddr $home_netmask > $openvpn_dir/ccd/$client
    echo 'push "route '$network $ip_mask'"' >> $openvpn_dir/ccd/$client
    #
    # Ubuntu 16.04 fix, http://unix.stackexchange.com/questions/292091/ubuntu-server-16-04-openvpn-seems-not-to-start-no-logs-get-written
    mkdir -p /lib/systemd/system/openvpn\@.service.d
    echo [Unit] > /lib/systemd/system/openvpn\@.service.d/local-after-ifup.conf
    echo Requires=networking.service >> /lib/systemd/system/openvpn\@.service.d/local-after-ifup.conf
    echo After=networking.service >> /lib/systemd/system/openvpn\@.service.d/local-after-ifup.conf
    # End fix.
    systemctl restart openvpn@server.service
    systemctl enable openvpn@server.service
    systemctl status openvpn@server.service
    vif_id=`curl -s http://169.254.169.254/openstack/latest/network_data.json \
           | sed -E 's/(^.*\"vif_id\"\:\s\")([a-z0-9-]+)(\".*$)/\2/'`
    echo -e "\nYour server is now ready!\n" > /dev/tty0
    echo -e "\nYour client1 files are here: /etc/openvpn/ccd/client1.files.tar\n" > /dev/tty0
    echo -e "neutron port-update "$vif_id" --allowed-address-pair ip_address=10.8.0.0/24  --allowed-address-pair ip_address="$home_network"\n" > /dev/tty0
runcmd:
 - bash /root/setup-openvpn.sh
```

Then paste your file into the "Configuration section", "Customization
Script" or upload it "Load script from a file".

![image](/images/cloud-init.png)

You could also use the Openstack cli and input the file as "user-data"
when creating the server.

```shell
openstack$ openstack server create --wait \
--image ubuntu-16.04 \
--flavor b.small \
--security-group External-in \
--nic net-id=test-net \
--user-data=~/cloud-init/safespring-openvpn.yaml \
vpnserver01
```

When the server is ready to run a message will be sent to log and to the
console.

```shell
+ echo -e '\nYour server is now ready!\n'
+ echo -e '\nYour client1 files are here: /etc/openvpn/ccd/client1.files.tar\n'
+ echo -e 'neutron port-update 08c66eba-6a6c-4ca8-811e-68006d8b24f5 --allowed-address-pair ip_address=10.8.0.0/24  --allowed-address-pair ip_address=192.168.34.0/24\n'
```

The "neutron" command is the magic to allow unknown packets to enter the
cloud network. Either you enter it by yourself or you send a request to
us and we'll do it for you if you don't have cli access. The output is
tailored from the installation and is unique for each server.

```shell
$ neutron port-update 08c66eba-6a6c-4ca8-811e-68006d8b24f5 --allowed-address-pair ip_address=192.168.34.0/24 --allowed-address-pair ip_address=10.8.0.0/24

$ openstack port show 08c66eba-6a6c-4ca8-811e-68006d8b24f5
+-----------------------+-----------------------------------------------------------------------------+
| Field                 | Value                                                                       |
+-----------------------+-----------------------------------------------------------------------------+
| admin_state_up        | UP                                                                          |
| allowed_address_pairs | ip_address='192.168.34.0/24'                                                |
|                       | ip_address='10.8.0.0/24'                                                    |
| binding_host_id       | openstack-compute14.cloud                                                   |
| binding_vif_details   | port_filter='True'                                                          |
| binding_vif_type      | vrouter                                                                     |
| binding_vnic_type     | normal                                                                      |
| device_id             | bb77391c-6af1-4ecd-b9f9-8cd2367e4cbf                                        |
| device_owner          | compute:None                                                                |
| fixed_ips             | ip_address='192.168.0.10', subnet_id='ef9ce1f5-9f26-41ad-a139-fb34b44c80b7' |
| id                    | affca7cd-06ef-4d19-a2bc-7db4a496225c                                        |
| mac_address           | 02:af:fc:a7:cd:06                                                           |
| name                  | 08c66eba-6a6c-4ca8-811e-68006d8b24f5                                        |
| network_id            | d1143e67-3dec-4f7c-87aa-d438a2d63ce2                                        |
| port_security_enabled | True                                                                        |
| project_id            | db677836044143a5b4a77629f1f1debb                                            |
| security_groups       | 0d4277f6-7734-44b0-9822-f8e8f97c15a5                                        |
| status                | ACTIVE                                                                      |
+-----------------------+-----------------------------------------------------------------------------+
```

### The client

This example can be used in the same way as the server example through Horizon or with cli. Please observe the note below the example. 

```shell
#cloud-config
output: {all: '| tee -a /var/log/cloud-init-output.log'}
password: mypassword
chpasswd: { expire: False }
ssh_pwauth: True
manage_etc_hosts: true
#
apt_update: true
packages:
   - openvpn
#
write_files:
 - path: /root/setup-openvpn.sh
   content: |
    #!/bin/bash
    # Built for OpenVPN 2.3.2 x86_64-pc-linux-gnu [SSL (OpenSSL)] [LZO] [EPOLL] [PKCS11] [eurephia] [MH] [IPv6] built on Dec  1 2014
    set -x -e
    openvpn_dir=/etc/openvpn
    client=client1
    #
    echo 1 > /proc/sys/net/ipv4/ip_forward #runtime
    sed -i.orig -e 's|#*net/ipv4/ip_forward=.*|net/ipv4/ip_forward=1|' /etc/ufw/sysctl.conf #permanent
    #
    # Ubuntu 16.04 fix, http://unix.stackexchange.com/questions/292091/ubuntu-server-16-04-openvpn-seems-not-to-start-no-logs-get-written
    mkdir -p /lib/systemd/system/openvpn\@.service.d
    echo [Unit] > /lib/systemd/system/openvpn\@.service.d/local-after-ifup.conf
    echo Requires=networking.service >> /lib/systemd/system/openvpn\@.service.d/local-after-ifup.conf
    echo After=networking.service >> /lib/systemd/system/openvpn\@.service.d/local-after-ifup.conf
    # End fix.

    if [ -f /tmp/$client.files.tar ]; then
      cd $openvpn_dir
      tar xvf /tmp/$client.files.tar
      mv $client.conf client.conf
    else
      echo -e "\nYour client configuration files are missing! Please copy them from the server to /tmp/client1.files.tar.\n" > /dev/tty0
    fi

    systemctl enable openvpn@client.service
    systemctl start openvpn@client.service
    systemctl status openvpn@client.service
    echo -e "\nYour client is now ready!\n" > /dev/tty0
runcmd:
 - bash /root/setup-openvpn.sh
```


> **Note**
> In order to fully automate you must use some method to transfer the client files from the VPN-server to the VPN-client.
> This can be made in several ways, ex. "scp /etc/openvpn/ccd/client1.files.tar ubuntu@10.0.0.1:/tmp", from the server
> to the client.
> This script doesn't provide that step so you need to manually transfer the file and rerun the script on the clientside again.
> "bash /root/setup-openvpn.sh"


### Routing

At the "Home network" there is an option to add the destination route
for the "Cloud network" either to the "home network" clients that is in
matter or make it available for all by adding the route to the clients
default-gateway, "Alt 2".

At the "cloud network" side all clients/servers must have a route back
to the "Home network" with a next-hop to the vpn-server.

![image](/images/network-vpn.png)

### Troubleshoot

You can easily follow packets with tcpdump even on the "tun" interfaces.

### Notes

> **Note**
>
> It is recommended to update the OS and reboot the server as part of
> the setup.
