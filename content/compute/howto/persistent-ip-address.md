# Obtaining persistent IP addresses to your instances

This page includes OpenStack CLI commands. See the [API Access documentation](../api.md) for instructions on how to install and configure the command line client.

It is possible to create a port without creating an instance. When you create a
port in such a manner, the port will be allocated IP address(es) from the
network you specify just like when you create an instance. Afterwards, when
creating an instance, you can specify to attach the port you created as an
interface to the instance.

When ports are created upfront of instance creation and then attached, the
ports will not automatically be deleted when those instances are deleted nor if
you detach that interface/port from an instance. Thus, the IP address(es) will
still be allocated to that port and it can be attached to another instance that
you want to have the same IP address as the one you deleted. This can be
useful if you want to change flavor of an instance by snapshotting an old
instance and creating a new one with a different flavor from that snapshot.

If you however create the instance without creating a port for it up front, the
interface/port will be deleted and the IP address will go back to the pool of
available addresses when the instance is deleted or the port is detached from
the instance.

!!! info "Important note"
         Even if you create one or more ports/interfaces you must only connect one port/interface to each instance.

## Creating a port in the Horizon GUI

1. Navigate to **Network** → **Networks** and click the network you want to use (typically "public").
2. Click the **Ports** tab.
3. Click the **Create Port** button.
4. Enter a **Name** for the port. No other fields need to be changed from their defaults.
5. Click **Create** to finish.

## Creating a port with the OpenStack CLI

You can also create ports using the OpenStack CLI:

```
$ openstack port create --network public dummytest
$ openstack port list |grep dummy
| aead4548-e41d-4724-acd5-6aeb8d9fbce8 | dummytest  | fa:16:3e:d5:bc:ef | ip_address='10.68.129.21', subnet_id='059d94a0-0fc1-40dd-9814-eb00571c6a4d'           | DOWN   |
```

When the port is created you can choose to attach to it instead of a network
when launching a new instance in the GUI. Just skip the network part, and
select the port in the next step "Network ports". Now the network port and the
instance can be maintained in separate lifecycles.

It is of course possible to create an instance through the Openstack CLI
without attaching to a network, and then to attache the port later on, or
create it by specifying the port name like this:

```
$ os server create --image ubuntu-20.04 --flavor l2.c2r4.100 --port dummytest my-instance
```
