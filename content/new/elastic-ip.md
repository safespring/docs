# Elastic IP

Safespring Elastic IP allows projects to announce anycast IP addresses within a
site and enables potential for load balancing and/or failover for your services.
You may advertise extra addresses for project instances via [Border Gateway
Protocol (BGP)](https://en.wikipedia.org/wiki/Border_Gateway_Protocol), either
IPv4 and/or IPv6 addresses. If the same address is advertised from multiple
instances, [Equal Cost Multipath
(ECMP)](https://en.wikipedia.org/wiki/Equal-cost_multi-path_routing) routes will
be created in the Safespring infrastructure.

Example usecases for the Safespring Elastic IP feature include MetalLB for
container clusters and failover-handling haproxy servers.

## How it works

Each project consuming the Elastic IP feature will be provided an extra OpenStack network.
The OpenStack network itself will provide a pool of private IPv4 addresses with
NAT policy, as well as public IPv6 addresses. Prefixes from which you pick IP
addresses to be advertised are also provided, in addition to a mandatory
[AS number](https://en.wikipedia.org/wiki/Autonomous_system_(Internet)). After
launching one or more instances attached to this OpenStack network, you are ready
to advertise [anycast](https://en.wikipedia.org/wiki/Anycast) addresses.

## Example configuration

In this example we will launch an instance, install a BGP speaker and verify
IPv4 and IPv6 connectivity. Launching the instance is nothing different from
what you normally would do, the only difference being the OpenStack network the
instance attaches to. In our example we will be using the popular BGP speaker
[Bird](https://bird.network.cz/), other widely used BGP speakers include
[Free Range Routing](https://frrouting.org/),
[GoBGP](https://osrg.github.io/gobgp/) and
[ExaBGP](https://github.com/Exa-Networks/exabgp)

Please note that the security groups you configure for your instance will be applied
to the Openstack network for the instance, as well as to the IP addresses announced by
the instance.

Installing Bird is trivial as it is available in most linux distributions (Enterprise
Linux may require the EPEL repository). For example, in recent Ubuntu releases it can be
installed with

```code
# sudo apt-get install -y bird2
```

Regardless of which software you use, common configuration parameters will be
communicated to you from support, when the feature is enabled for you

1. Your assigned [AS number](https://en.wikipedia.org/wiki/Autonomous_system_(Internet))
2. An IP address and AS number to peer your instance with
3. IPv4 and IPv6 prefixes you are allowed to announce

An example configuration file for [Bird](https://bird.network.cz/) could look like this:

```code
router id 10.129.0.3;

filter export_bgp_v4 {
    if net ~ 185.189.29.0/31 then accept;
    else {
        reject;
    }
}

filter export_bgp_v6 {
    if net ~ 2a0a:bcc0:40:4::/127 then accept;
    else {
        reject;
    }
}

protocol device {
  scan time 5;
}

protocol direct {
        disabled;
        ipv4;
        ipv6;
}

protocol kernel {
        learn;
        scan time 2;
        ipv4 {
              import all;
              export all;
        };
}

protocol kernel {
        learn;
        scan time 2;
        ipv6 {
              import all;
              export all;
        };
}

protocol bgp safespring  {
  neighbor 169.254.169.254 port 179 as 64700;
  local 10.129.0.3 as 64532;
  multihop;
  ipv4 {
        import none;
        export filter export_bgp_v4;
       };
  ipv6 {
        import none;
        export filter export_bgp_v6;
        };
}
```

The address and port to connect to is always `169.254.169.254:179` using AS
number `64700`. Even though the BGP peering happens over IPv4 only, you may
advertise IPv6 prefixes over this connection. Please note that the term
"safespring" is an arbitrary name set specifically in Bird in order to identify
the connection - it has no technical meaning or effect. After starting Bird we
can check status with

```code
# birdcl show protocol safespring
BIRD 2.0.7 ready.
Name       Proto      Table      State  Since         Info
safespring BGP        ---        up     11:21:37.847  Established
```

At this point we can start advertising prefixes. Given the above configuration,
we want to advertise `185.189.29.0/32`. First, we have to actually assign the
IP address to an interface on the instance. That interface can be of the dummy
interface type, or you can assign the IP address directly to the loopback interface.

```code
ip addr add 185.189.29.0/32 dev lo
ip -6 addr add 2a0a:bcc0:40:4::/128 dev lo
```

The advertisement happens as soon as there is a route to the IP address.

```code
ip route add 185.189.29.0/32 dev lo
ip -6 route add 2a0a:bcc0:40:4::/128 dev lo
```

Likevise, the advertisement will stop as soon as you delete the routes.
In our example, we can check which prefixes we are announcing with

```code
# birdcl show route export safespring
BIRD 2.0.7 ready.
Table master4:
185.189.29.0/32      unicast [kernel1 12:39:30.408] (10)
	dev lo

Table master6:
2a0a:bcc0:40:4::/128 unicast [kernel2 12:44:41.579] (10)
	dev lo
```

## Next steps

More instances advertising the same IP addresses may be created with identical
configuration for the BGP speaker software - the only difference being the
instance's own address. Depending on your usecase, a service health checker can
be useful. For example, [AnyCast
Healthcecker](https://github.com/unixsurfer/anycast_healthchecker) configures
the Bird daemon directly. If you are using MetalLB, please note that by default
MetalLB will try peering all your nodes with the infrastructure. This may not be
optimal, so consider deploying only a few nodes to run that service.

## Conclusion

Safespring Elastic IP enables a generic and simple method of implementing load
balancing and failover over industry standard BGP protocol for a variety of
usecases. Please contact us in order to get the necessary resources to get started.

## Additional example configurations

### exabgp


```
neighbor 169.254.169.254 {             # bgp neighbor to peer with
  local-address 10.129.0.5;            # local instance IP address
  local-as 64532;                      # bgp as (unique per openstack project)
  peer-as 64700;                       # safespring compute as (static)
}

# process to announce or withdraw address based on the result of the check.sh script
process service_ip {
  run python3 -m exabgp healthcheck --cmd "/etc/exabgp/check.sh 185.189.29.2" --ip 185.189.29.2 --interval 15 --no-ip-setup --up-metric 1 --withdraw-on-down;
  encoder text;
}
```

Show what addresses are currently announced to the upstream router
```
$ sudo exabgpcli show adj-rib out extensive
neighbor 169.254.169.254 local-ip 10.129.0.5 local-as 64532 peer-as 64700 router-id 10.129.0.5 family-allowed in-open ipv4 unicast 185.189.29.2/32 next-hop self med 1
```

### metallb

Example metallb CRDs. See https://github.com/metallb/metallb/ and the
`config/manifests` folder of the version you are using. We recommend using frr
mode https://metallb.universe.tf/concepts/bgp/#frr-mode

```
apiVersion: metallb.io/v1beta1
kind: BGPAdvertisement
metadata:
  name: local
  namespace: metallb
spec:
  ipAddressPools:
  - first-pool
  aggregationLength: 32
  communities:
  - 65535:65282
```

```
apiVersion: metallb.io/v1beta2
kind: BGPPeer
metadata:
  name: local
  namespace: metallb
spec:
  myASN: 64532
  peerASN: 64700
  peerAddress: 169.254.169.254
```

```
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: first-pool
  namespace: metallb
spec:
  addresses:
  - 185.189.29.2/32
```
