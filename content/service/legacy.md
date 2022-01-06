## Example Terraform configuration

This example configuration starts a test cirros instance using Terraform.
Please use resource IDs instead of names in production to avoid suprises.

```json
provider "openstack" {
  auth_url  = "https://keystone.api.cloud.ipnett.se/v3"
}

resource "openstack_networking_network_v2" "terraform-test-network" {
  name           = "terraform-test-network"
  admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "terraform-test-subnet" {
  network_id = "${openstack_networking_network_v2.terraform-test-network.id}"
  cidr       = "192.168.199.0/24"
}

resource "openstack_compute_instance_v2" "terraform-test-instance" {
  name        = "terraform-test-instance"
  image_name  = "cirros-0.3.4"
  flavor_name = "b.tiny"

  network {
    name = "terraform-test-network"
  }

  depends_on = [
    "openstack_networking_network_v2.terraform-test-network"
  ]
}
```

```shell
export OS_DEBUG=1
export TF_LOG=DEBUG
terraform plan
terraform apply
terraform destroy
```