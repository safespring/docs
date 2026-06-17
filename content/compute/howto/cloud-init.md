# Cloud-init and Cloudbase-init

Cloud-init is the industry-standard tool for configuring cloud instances at first boot. When you launch an instance in Safespring Compute, cloud-init (Linux) or cloudbase-init (Windows) reads the **User Data** you provide and executes the configuration automatically — before you ever log in.

You supply User Data in the **"Configuration"** tab of the Launch Instance dialog in the [Horizon dashboard](../sites.md), or via the `--user-data` flag with the OpenStack CLI:

```bash
openstack server create \
  --image "Ubuntu 24.04" \
  --flavor l2.c2r4 \
  --user-data my-script.yaml \
  my-instance
```

## Linux (cloud-init)

Linux images on Safespring ship with cloud-init pre-installed. Scripts use the YAML-based `#cloud-config` format. The cloud-init run happens once, on the very first boot of the instance.

### Switch to Swedish package mirrors

Ubuntu images in Safespring come with a default mirror (`nova.clouds.archive.ubuntu.com`) that may be slower than the Swedish mirror when accessed from our Swedish or Norwegian data centers. This snippet replaces the mirror and runs an initial package update.

```yaml
#cloud-config

runcmd:
  - sed -i 's|nova.clouds.archive.ubuntu.com|se.archive.ubuntu.com|g' /etc/apt/sources.list.d/ubuntu.sources
  - sed -i 's|nova.clouds.archive.ubuntu.com|se.archive.ubuntu.com|g' /etc/apt/sources.list
  - sed -i 's|security.ubuntu.com|se.archive.ubuntu.com|g' /etc/apt/sources.list.d/ubuntu.sources
  - sed -i 's|security.ubuntu.com|se.archive.ubuntu.com|g' /etc/apt/sources.list
  - apt-get update
```

### Install NetBird and join a network

[NetBird](https://netbird.io/) is a WireGuard-based overlay network. Replace `YOUR_SETUP_KEY_HERE` with the setup key from your NetBird management console.

```yaml
#cloud-config

runcmd:
  - curl -fsSL https://pkgs.netbird.io/install.sh | sh
  - netbird up --setup-key YOUR_SETUP_KEY_HERE
```

### Switch to Swedish mirrors, update all packages, and install NetBird

A combined snippet that first optimizes the mirror, performs a full system upgrade, and then joins a NetBird network.

```yaml
#cloud-config

runcmd:
  # Switch to Swedish mirror
  - sed -i 's|nova.clouds.archive.ubuntu.com|se.archive.ubuntu.com|g' /etc/apt/sources.list.d/ubuntu.sources
  - sed -i 's|nova.clouds.archive.ubuntu.com|se.archive.ubuntu.com|g' /etc/apt/sources.list
  - sed -i 's|security.ubuntu.com|se.archive.ubuntu.com|g' /etc/apt/sources.list.d/ubuntu.sources
  - sed -i 's|security.ubuntu.com|se.archive.ubuntu.com|g' /etc/apt/sources.list
  # Update and upgrade all packages
  - apt-get update
  - DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
  - DEBIAN_FRONTEND=noninteractive apt-get autoremove -y
  # Install NetBird and join the network
  - curl -fsSL https://pkgs.netbird.io/install.sh | sh
  - netbird up --setup-key YOUR_SETUP_KEY_HERE
```

---

## Windows (cloudbase-init)

Safespring Windows images come with [cloudbase-init](https://cloudbase.it/cloudbase-init/) pre-installed. Cloudbase-init is the Windows equivalent of cloud-init and can run PowerShell scripts supplied as User Data. Scripts must begin with the directive `#ps1_sysnative` so that cloudbase-init executes them in the 64-bit PowerShell host.

!!! warning
    Anything entered in the User Data / Customization Script field may end up in cloudbase-init log files on the instance. Do not reuse passwords set here for long-lived production accounts — treat them as temporary bootstrap credentials and rotate them after first login.

### Important: always set the Administrator password first

Unlike Linux, Windows instances are not accessible over SSH by default after launch. The built-in **Administrator** account has no password set, meaning you cannot log in via RDP until one is configured. Without a password, the only way into a fresh instance is through the OpenStack web console — which is inconvenient and does not scale.

**Every Windows cloudbase-init script should therefore begin by setting the Administrator password.** The block below is the canonical password-setting snippet that the more complete examples in the following sections all build upon.

```powershell
#ps1_sysnative

$NewPassword = "YourPasswordHere"

$ErrorActionPreference = "Stop"

try {
    $account = [ADSI]"WinNT://./Administrator,user"
    $account.SetPassword($NewPassword)

    # Enable the account and clear "must change password at next logon"
    $flags = $account.UserFlags.value
    $flags = $flags -band (-bnot 0x2)   # ADS_UF_ACCOUNTDISABLE — clear disabled flag
    $flags = $flags -bor 0x10000        # ADS_UF_DONT_EXPIRE_PASSWD
    $account.UserFlags = $flags
    $account.PasswordExpired = 0
    $account.SetInfo()

    Write-Host "Administrator password set successfully."
} catch {
    Write-Host "Error setting password: $_"
    exit 1
}
```

### Enable OpenSSH Server

Installs the Windows built-in OpenSSH Server capability, starts it automatically, opens port 22 in the Windows Firewall, and sets PowerShell as the default remote shell. Includes the mandatory Administrator password block at the top.

```powershell
#ps1_sysnative

$NewPassword = "YourPasswordHere"

$ErrorActionPreference = "Stop"

try {
    # Set Administrator password
    $account = [ADSI]"WinNT://./Administrator,user"
    $account.SetPassword($NewPassword)
    $flags = $account.UserFlags.value
    $flags = $flags -band (-bnot 0x2)   # ADS_UF_ACCOUNTDISABLE
    $flags = $flags -bor 0x10000        # ADS_UF_DONT_EXPIRE_PASSWD
    $account.UserFlags = $flags
    $account.PasswordExpired = 0
    $account.SetInfo()
    Write-Host "Administrator password set successfully."

    # Install OpenSSH Server
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    Set-Service -Name sshd -StartupType Automatic
    Start-Service sshd

    # Open firewall (rule may already exist, so errors are suppressed)
    New-NetFirewallRule -DisplayName "OpenSSH Server" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 22 `
        -Action Allow `
        -Profile Any `
        -ErrorAction SilentlyContinue

    # Set default shell to PowerShell
    New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" `
        -Name DefaultShell `
        -Value "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" `
        -PropertyType String `
        -Force

    Write-Host "OpenSSH Server installed and configured successfully."
} catch {
    Write-Host "Error: $_"
    exit 1
}
```

### Run Windows Update and install NetBird

Applies all pending Windows updates, installs NetBird, and joins a NetBird network. Replace `YOUR-SETUP-KEY-HERE` with your NetBird setup key. Includes the mandatory Administrator password block at the top.

```powershell
#ps1_sysnative

$NewPassword  = "YourPasswordHere"
$SetupKey     = "YOUR-SETUP-KEY-HERE"
$InstallerPath = "C:\Windows\Temp\netbird-installer.exe"
$DownloadUrl   = "https://pkgs.netbird.io/windows/x64/NetBird_Installer_latest.exe"

$ErrorActionPreference = "Stop"

try {
    # Set Administrator password
    $account = [ADSI]"WinNT://./Administrator,user"
    $account.SetPassword($NewPassword)
    $flags = $account.UserFlags.value
    $flags = $flags -band (-bnot 0x2)   # ADS_UF_ACCOUNTDISABLE
    $flags = $flags -bor 0x10000        # ADS_UF_DONT_EXPIRE_PASSWD
    $account.UserFlags = $flags
    $account.PasswordExpired = 0
    $account.SetInfo()
    Write-Host "Administrator password set successfully."

    # Run Windows Updates
    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force
    Install-Module PSWindowsUpdate -Force -SkipPublisherCheck
    Import-Module PSWindowsUpdate
    Get-WindowsUpdate -Install -AcceptAll -IgnoreReboot
    Write-Host "Windows updates applied."

    # Install NetBird
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $InstallerPath
    Start-Process -FilePath $InstallerPath -ArgumentList "/S" -Wait
    Write-Host "NetBird installed."

    # Join NetBird network
    & "C:\Program Files\NetBird\netbird.exe" up --setup-key $SetupKey
    Write-Host "NetBird network joined."

    # Reboot if required by Windows Update
    if (Get-WURebootStatus -Silent) {
        Write-Host "Reboot required, restarting."
        Restart-Computer -Force
    }
} catch {
    Write-Host "Error: $_"
    exit 1
}
```

### Join an Active Directory domain

Joins the instance to an Active Directory domain and places the computer account in a specific OU. Replace all variables at the top of the script with values from your environment. Includes the mandatory Administrator password block at the top.

```powershell
#ps1_sysnative

$NewPassword  = "YourPasswordHere"
$DomainName   = "corp.example.com"
$OUPath       = "OU=Servers,DC=corp,DC=example,DC=com"
$JoinUser     = "corp\joiner-account"
$JoinPassword = "YourJoinPasswordHere"

$ErrorActionPreference = "Stop"

try {
    # Set Administrator password
    $account = [ADSI]"WinNT://./Administrator,user"
    $account.SetPassword($NewPassword)
    $flags = $account.UserFlags.value
    $flags = $flags -band (-bnot 0x2)   # ADS_UF_ACCOUNTDISABLE
    $flags = $flags -bor 0x10000        # ADS_UF_DONT_EXPIRE_PASSWD
    $account.UserFlags = $flags
    $account.PasswordExpired = 0
    $account.SetInfo()
    Write-Host "Administrator password set successfully."

    # Join domain
    $securePassword = ConvertTo-SecureString $JoinPassword -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($JoinUser, $securePassword)

    Add-Computer -DomainName $DomainName `
        -OUPath $OUPath `
        -Credential $credential `
        -Restart `
        -Force

    Write-Host "Domain join initiated, rebooting."
} catch {
    Write-Host "Error: $_"
    exit 1
}
```

---

## Using instance metadata to parameterize scripts

The scripts above require you to edit variables like `YOUR_SETUP_KEY_HERE` before pasting them into the Configuration window. A cleaner approach is to store those values as OpenStack **instance metadata properties** and have the cloud-init script fetch them at boot from the metadata service (`169.254.169.254`). The script itself then becomes fully generic and can be reused across any number of instances without modification.

### Set the metadata property at launch

Pass the property with `--property` when creating the instance:

```bash
openstack server create \
  --image "Ubuntu 24.04" \
  --flavor l2.c2r4 \
  --user-data netbird-generic.yaml \
  --property netbird_setup_key=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX \
  my-instance
```

In Horizon, add the key-value pair in the **Metadata** tab of the **Launch Instance** wizard.

See [Custom metadata](../metadata.md#custom-metadata) for more details on setting and reading instance metadata.

### Example: generic NetBird install

The script below installs NetBird and reads the setup key from instance metadata at boot. Because the setup key is never written into the User Data, the same script can be stored as a template and launched against any instance without editing.

```yaml
#cloud-config

runcmd:
  - |
    SETUP_KEY=$(curl -sf http://169.254.169.254/openstack/latest/meta_data.json \
      | python3 -c "import sys,json; print(json.load(sys.stdin)['meta']['netbird_setup_key'])")
    if [ -z "$SETUP_KEY" ]; then
      echo "ERROR: netbird_setup_key not found in instance metadata" >&2
      exit 1
    fi
    curl -fsSL https://pkgs.netbird.io/install.sh | sh
    netbird up --setup-key "$SETUP_KEY"
```

`python3` is used here instead of `jq` because it is available on all Ubuntu cloud images without any additional package installation. The same pattern works for any variable you want to externalize — domain names, environment tags, API tokens, and so on.
