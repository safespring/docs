# VPN with wireguard

We have created an automated setup of a [wireguard VPN
server](https://github.com/safespring-community/wireguard-gateway) that can be
used as a starting point to access instances on the private network from hosts
attached to the same wireguard network. Optionally one can configure an on-premise
host as a router into the private network. On premise routing then need
to be adjusted to route traffic to the Safespring private network via that
local wireguard peer.

Of course the setup can be changed and/or wrapped into your specific needs. If
you find bugs or make enhancements, pull requests and/or issues are most
welcome.

Se detailed doc on: https://github.com/safespring-community/wireguard-gateway 


# Overlay networking with NetBird

If you don't want to maintain a WireGuard gateway, [NetBird](https://netbird.io/) is a managed overlay network built on top of WireGuard. It handles peer discovery, NAT traversal, and access control automatically, so you can connect instances to each other — and to on-premise hosts — without configuring tunnels manually.

## How it works

Each instance runs a lightweight NetBird agent. Agents connect to the NetBird control plane to discover peers and establish direct encrypted WireGuard tunnels between them. NetBird works across NAT boundaries without requiring any public IP addresses or open inbound firewall rules.

## Getting started

1. Sign up at [netbird.io](https://netbird.io/) and create a network.
2. In the NetBird dashboard, go to **Setup Keys** and create a key. The setup key is used to authenticate new instances joining your network.
3. Launch a Safespring instance with the setup key passed via cloud-init or instance metadata.

## Installing NetBird via cloud-init

The [Cloud-init and Cloudbase-init how-to](howto/cloud-init.md) has ready-to-use snippets for installing NetBird on both Linux and Windows, including examples that read the setup key from instance metadata so the same User Data script can be reused across instances.

For a quick start, the minimal Linux cloud-init snippet is:

```yaml
#cloud-config

runcmd:
  - curl -fsSL https://pkgs.netbird.io/install.sh | sh
  - netbird up --setup-key YOUR_SETUP_KEY_HERE
```

Pass this in the **Configuration** tab of the **Launch Instance** wizard, or via `--user-data` on the CLI. Replace `YOUR_SETUP_KEY_HERE` with the setup key from the NetBird dashboard.

Once the agent is running, the instance will appear in the **Peers** section of the NetBird dashboard and is reachable from all other peers in the network.
