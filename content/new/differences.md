# Differences from older platform 

## Network
In the new platform, there is 3 networks to choose from (attach only one network):

1. public: This network will give you a public v4 ip address, public v6 address, dns setup and default gateway so it is reachable directly to/from Internet.
2. default: This network will give you a private ip on a RFC 1918 network,
   dns setup and default gateway with Network Address Translation (NAT) for outgoing traffic so instances can reach 
   services on the Internet, in addtion to instances on other networks in Safespring Compute (provided it is allowed by means of security groups).
3. private: This network will give you a private ip on a RFC 1918 network that is routed to/from other
   Safespring networks (including public) but not anywhere else.

Thus, the right way to communicate between instances attached to the different networks is to
just use security groups directly to control access. Do NOT add a second
interface on any instance. That will create problems with default gateways that
compete, thus unstable network connection to the instance

As an example all instances from any network in the new platform will be able
to communicate if the are members of the following computer security group in
(as expressed in Terraform code):

```code
resource "openstack_compute_secgroup_v2" "instance_inerconnect" {
  name        = "interconnect"
  description = "Full network access between members of this security group"

  rule {$
    ip_protocol = "tcp"
    from_port   = "1"
    to_port     = "65535"
    self        = true
  }

  rule {
    ip_protocol = "udp"
    from_port   = "1"
    to_port     = "65535"
    self        = true
  }
}
```

The keyword here is `self`. See: https://registry.terraform.io/providers/terraform-provider-openstack/openstack/latest/docs/resources/compute_secgroup_v2#self

## s3 bucket naming constraints

In earlier setups we were running with `rgw_relaxed_s3_bucket_names` set to
`true`. This allowed a bit more characters but could cause issues with clients
& solutions expecting the stricter standard bucket naming constraints. To avoid
such issues in the future we are now running  with the default constraints
which can be seen here
<https://docs.ceph.com/en/octopus/radosgw/s3/bucketops/#constraints>.
