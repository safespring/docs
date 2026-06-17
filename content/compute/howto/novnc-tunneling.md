# How to tunnel console traffic via SSH

This how-to describes how to use an SSH tunnel via a Safespring jumphost so that the OpenStack noVNC console on port 6080 becomes available as `https://localhost:6080` from your own machine, without opening the console service to the internet.

## Background and prerequisites

Safespring’s console and API endpoints are restricted to Safespring-controlled IP ranges for security reasons, while all public instance networks in Safespring Compute are whitelisted. By creating a small Ubuntu jumphost VM in each site (sto1, sto2, osl2) and tunneling through it, you can access the console from anywhere without changing firewall rules.

Before starting:

- Create a small Ubuntu instance (jumphost) in the desired site following Safespring’s “Using a jump host for persistent access to Safespring’s APIs”.
- Ensure the jumphost has:
  - Public IP and security group allowing SSH (22) from your current public IP.
  - Your SSH public key installed.
- Note the console endpoints:
  - sto1: `v2.dashboard.sto1.safedc.net:6080`
  - sto2: `v2.api.sto2.safedc.net:6080`
  - osl2: `v2.api.osl2.safedc.net:6080`

The goal is to forward **local** port 6080 on your laptop/desktop to the relevant `v2.*.safedc.net:6080` address via the jumphost using SSH local port forwarding (`-L`).

## Linux and macOS (Terminal)

Linux and macOS both use the OpenSSH client with identical syntax for local port forwarding.

### sto1

```bash
ssh -N -L 6080:v2.dashboard.sto1.safedc.net:6080 ubuntu@<jumphost-sto1-ip>
```

- `-L 6080:v2.dashboard.sto1.safedc.net:6080` means: listen on local port 6080 and forward all traffic to `v2.dashboard.sto1.safedc.net:6080` from the jumphost’s perspective.
- `-N` tells SSH not to execute a remote command or open a shell, keeping the process as a pure tunnel.

While this command is running, open your browser on the same machine and go to:

```text
https://localhost:6080/...
```

Use the appropriate path/query string Safespring’s console provides; from the browser’s point of view, the service is now on localhost even though it actually terminates inside Safespring.

### sto2

```bash
ssh -N -L 6080:v2.api.sto2.safedc.net:6080 ubuntu@<jumphost-sto2-ip>
```

Then browse to:

```text
https://localhost:6080/...
```

### osl2

```bash
ssh -N -L 6080:v2.api.osl2.safedc.net:6080 ubuntu@<jumphost-osl2-ip>
```

Then browse to:

```text
https://localhost:6080/...
```

If port 6080 is in use on your client, pick another local port (for example 16080) and adjust the URL accordingly:

```bash
ssh -N -L 16080:v2.dashboard.sto1.safedc.net:6080 ubuntu@<jumphost-sto1-ip>
# then browse to https://localhost:16080/...
```

Local port numbers for `-L` are arbitrary as long as they are free on the client.

## Windows using OpenSSH (PowerShell / cmd)

On current Windows 10/11, an OpenSSH client is included and uses the same syntax as Linux/macOS.

Open **PowerShell** or **Command Prompt** and run, for sto1:

```powershell
ssh -N -L 6080:v2.dashboard.sto1.safedc.net:6080 ubuntu@<jumphost-sto1-ip>
```

For sto2:

```powershell
ssh -N -L 6080:v2.api.sto2.safedc.net:6080 ubuntu@<jumphost-sto2-ip>
```

For osl2:

```powershell
ssh -N -L 6080:v2.api.osl2.safedc.net:6080 ubuntu@<jumphost-osl2-ip>
```

As with Linux/macOS, keep the SSH window open and point your Windows browser at:

```text
https://localhost:6080/...
```

You can use the same `-L 16080:...` pattern to choose a different local port if necessary.

## Windows using PuTTY (GUI)

For users who prefer a GUI, PuTTY can configure the same local port forward.

1. Start **PuTTY**.
2. On the **Session** page:
   - **Host Name (or IP address)**: `<jumphost-ip>`
   - **Port**: `22`
   - **Connection type**: SSH
3. In the left tree, go to **Connection → SSH → Tunnels**.
4. Under **Source port**, enter `6080`.
5. Under **Destination**, enter one of:
   - sto1: `v2.dashboard.sto1.safedc.net:6080`
   - sto2: `v2.api.sto2.safedc.net:6080`
   - osl2: `v2.api.osl2.safedc.net:6080`
6. Ensure **Local** and **Auto** are selected, then click **Add** so the tunnel appears in the list.
7. Go back to **Session**, optionally enter a name under **Saved Sessions** and click **Save** for reuse.
8. Click **Open**, log in with your SSH key or credentials, and keep the PuTTY window open.
9. On the same Windows machine, open a browser and navigate to:

```text
https://localhost:6080/...
```

PuTTY now forwards `localhost:6080` to the chosen `v2.*.safedc.net:6080` endpoint through the jumphost, just like the `ssh -L` examples.

## Security and operational notes

- Local port forwarding (`ssh -L`) tunnels traffic inside SSH, which protects the console session over untrusted networks.
- The Safespring noVNC/API endpoints remain reachable only from Safespring public instance ranges; all external access goes via your hardened jumphost.
- Stop the tunnel when not in use:
  - For CLI: `Ctrl+C` in the SSH terminal.
  - For PuTTY: close the session window.
- Consider using a separate low-privilege SSH key for the jumphost and enabling extra hardening (MFA, restricted security groups) as outlined in Safespring’s jumphost [article](https://www.safespring.com/blogg/2022/2022-08-using-jumphost-for-safespring-apis/)
