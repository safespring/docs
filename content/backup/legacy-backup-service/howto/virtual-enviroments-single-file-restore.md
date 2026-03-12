TSM4VE single file restore
==========================

## Installation

Since the software used for file level restore doesn't support SSL we have to use stunnel to encrypt the traffic to/from the TSM server.

* **Download stunnel**  - It can be found here https://www.stunnel.org/downloads.html
* **Install stunnel** - Use the default values to start with. It will ask you for details about your organization. Since we only use stunnel for outgoing traffic it has little importance what you say.  Make sure you answer localhost on the last question though.

!!! note "Example"
    You are about to be asked to enter information that will be incorporated into your certificate request.
    What you are about to enter is what is called a Distinguished Name or a DN.
    There are quite a few fields but you can leave some blank
    For some fields there will be a default value,
    If you enter '.', the field will be left blank.
        ```shell
        Country Name (2 letter code) [PL]:SE
        State or Province Name (full name) [Mazovia Province]:Stockholm
        Locality Name (eg, city) [Warsaw]:Stockholm
        Organization Name (eg, company) [Stunnel Developers]:Safespring
        Organizational Unit Name (eg, section) [Provisional CA]:Safespring
        Common Name (FQDN of your server) [localhost]:
        ```

* Download the file https://raw.githubusercontent.com/safespring/cloud-BaaS/master/pki/SafeDC-Net-Root-CA.pem and put it in `C:\Program Files (x86)\stunnel\config\SafeDC-Net-Root-CA.pem`
* Replace the content of `C:\Program Files (x86)\stunnel\config\stunnel.conf` with the following:
    ```shell
    [cleartext-tsm]
    client = yes
    accept = 127.0.0.1:1800
    connect = tsm1.backup.sto2.safedc.net:1600
    verify = 2
    checkhost = tsm1.backup.sto2.safedc.net
    CAfile = C:\Program Files\stunnel\config\SafeDC-Net-Root-CA.pem
    ```
* Run the app `stunnel Service install` from the start menu.  This will install the stunnel service.
* Start the service, either the normal windows way, or by running the app "stunnel Service Start".  The service will start automatically after reboots.

## Usage

The restore process is a 2-step process.  

* One system mounts restore image from the TSM server and presents it as an ISCSI disk. This is in most cases the physical host.
* The virtual machine will then mount the ISCSI disk from the server above.
* You can see the physical host as an disk array and the VM as a server that uses the disk. The steps to make this happen are:
* On the Tivoli Storage Manager recovery agent system (most cases the physical host), open port 3260 in the Windows client firewall.
* Record the iSCSI initiator name on the system where data is to be restored (Normally a virtual machine)

The iSCSI initiator name is shown in the iSCSI initiator configuration window of the Control Panel. For example: _iqn.1991-05.com.microsoft:hypervtest.rantila.local_

* Start the "Tivoli Storage Manager Recovery Agent" (on physical host) and give some basic communications information- After the first run most of these are remembered and you don't have to fill in them next time:
    ```
    Server address:       localhost
    Server port:          1800
    Asnodename            Use this method
    Authentication node:  The node name of your local machine.
                          (See C:\program files\Tivoli\tsm\baclient\dsm.opt
                          for nodename)
    Password              Keep the entry blank
                          Put a mark at "Use password access generate"
    Target node:          The node name that owns the backups (cluster node)
    ```
* Complete the Select TSM server that ends with `localhost` and Select `snapshot` dialogs and click `Mount`.
* In the Choose mount destination dialog, select `Mount an iSCSI target`.
* Create a target name (name of the disk). Make sure that it is unique and that you can identify it from the system that runs the iSCSI initiator. For example: `VM_OSCAR_TUE_C_DISK`
* Enter the iSCSI Initiator name that was recorded above and click `OK`.
* Verify that the volume you just mounted is displayed in the `Mounted Volumes` field.
* Locate and start the iSCSI Initiator program on the initiator system that was selected above (the VM)
    ``` shell
    Connect to the iSCSI target:
    In the Targets tab, enter the TCP/IP address of the Tivoli Storage
    Manager recovery agent (iSCSI target - physical host) in the target dialog.
    Click Quick Connect.

    The Quick Connect dialog shows a target that matches the target name
    that was specified in above (VM_OSCAR_TUE_C_DISK). If it is not already
    connected, select this target and click Connect.

    On the initiator system, go to Control Panel > Administrative Tools >
    Computer Management > Storage > Disk Management.

    If the mounted iSCSI target is listed as Type=Foreign, right-click Foreign
    Disk and select Import Foreign Disks. The Foreign Disk Group is selected.
    Click OK.

    The next screen shows the type, condition, and size of the Foreign Disk.
    Click OK and wait for the disk to be imported.

    When the disk import completes, press F5 (refresh). The mounted iSCSI
    snapshot is visible and contains an assigned drive letter. If drive letters
    are not automatically assigned, right-click the required partition and
    select Change Drive Letters or Paths. Click Add and select a drive
    letter.

    Open Windows Explorer (or other utility) and browse the mounted snapshot
    for a file restore operation.

    After the file is restored, complete these tasks:

    * Disconnect each iSCSI target by using the iSCSI Initiator Properties dialog.
    * Dismount the volume by selecting the volume in the Tivoli Storage Manager
      recovery agent GUI and clicking Dismount
    ```
