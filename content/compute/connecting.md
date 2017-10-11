#Connecting your virtual servers to your infrastructure
The instances you have set up in Safespring Compute will get floating IP 
addresses from the SUNET/UNINETT IP pool and are the way of contact for the clients
connecting to you services. By setting up Security Groups you will be able
to control which clients (based on IP) that can connect to your servers.
Many applications today support encryption in transit so you come a long way
with tools like [LetsEncrypt](https://letsencrypt.org/) to uphold secure access to your services.

Sometimes application encryption is not enough for secure transport and in
those cases Safespring offers two solutions:
1. Site-to-site layer 3 VPN - SSLVPN based tunnel
2. Saferoute - dedicated MPLS VRF in SUNETs/UNINETTs network

![Connecting to Safespring](/images/connect.png)


Site-to-site VPN is easier to set up and works by setting up two tunnel
enpoints, one in Safesprings infrastructure and one in your infrastructure
at your site. By routing the floating IPs that you use for your servers in
the Safespring infrastructure to your tunnel endpoint server at site, you
can ensure that all traffic to those virtual machines go through the tunnel
encrypted. To handle the return traffic you respectively set up routes for
the IPs (hosts or networks) that you virtual machines should be able to 
communicate to the endpoint at Safespring.

Saferoute is somewhat more work to set up but will give you a separate routing
instance (VRF) in the SUNET/UNINETT MPLS network effectively giving you a port in your 
edge router to SUNET/UNINETT where all the traffic to your servers will be served.
This is especially good if you have security policies at your site which
enforces infrastrucure to be behind a central firewall. You will also be able
to pick which IP-addresses you want to use for your virtual machines in the 
Safespring infrastructure.

Below we will describe both ways of connecting to you virtual instances.

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
    cp $easy_rsa_dir/keys/$NAME.crt $openvpn_dir
    cp $easy_rsa_dir/keys/$NAME.key $openvpn_dir
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

![image](../../images/cloud-init.png)

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

![image](../../images/network-vpn.png)

### Troubleshoot

You can easily follow packets with tcpdump even on the "tun" interfaces.

### Notes

> **Note**
>
> It is recommended to update the OS and reboot the server as part of
> the setup.

##Dedicated Access with Saferoute
![Connecting to Safespring](/images/connect.png)

The second option to set up connectivity is by using Saferoute where a dedicated MPLS IPVPN is set up through SUNETs/UNINETTs network. The advantages is that that the virtual servers in the infrastructure will logically be placed behind the firewall at the campus site. This makes managing the firewall rules for the virtual infrastructure no different from managing the servers at the site since traffic to both environments will go through the firewall at the campus site. All traffic between servers at the campus and the Safespring infrastructure will also go through this private channel.

To set this up a part of the Campus IP-range must be reserved for the infrastructure at Safespring. Depending on the need of addresses in the virtual infrastructure the size of the range might vary but it is better to reserve some extra addresses since the administrative work for setting this up includes work both at SUNET/UNINETT, Safespring and the central IT at campus. To order Saferoute - contact Safespring and fill in the form at [here](https://goo.gl/forms/usCnl6T8nEIZmAJW2).  
