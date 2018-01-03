Backup of virtual machines in vSphere can be done in three different ways.
==========================================================================

1) Treat it as a physical machine.  Use the normal TSM BA client.

2) Do a snapshot backup of the virtual machine  (VMDK file).  This can be done with the normal BA client. This method only support the most primitive snapshot backups  (full backup and restore of the VM) 

3) Use TSM for Virtual Environment (TSM4VE).  TSM4VE is an advanced method of backing up vSphere 

What are the advantages/disadvantages of the different methods:

Method 1 - in VM backup
-----------------------

* Easy to install - Same procedure as physical server
* Easy to use - Same tools as physical server
* Can restore entire server using TBMR - either to same VM or other server - even other physical server.
  Since BaaS includes TMBR this is easy and rather fast  (10-20 minutes typical).
* Easy to find and restore files and directories.
  TSM keeps an index of all files backed up.
* Takes more CPU and I/O than than the other methods

Method 2 - Snapshot of whole VM
-------------------------------

* More complex to install.
  Requires a VM that runs the client outside of the VM being backed up.
* Requires access to vCenter  (admin userid and password)
* Can restore entire server very fast!
* Since the backup is done at the disk level, it is more complex to restore files/directories.
  TSM keeps tracks of the disks (VMDKs) that are backed up, but do not index the content.
* This method can backup VMs regardless of operating system inside.
  Even OSes that are not supported by the normal TSM client can be backed up.

Method 3 - TSM for Virtual Environments
---------------------------------------

* An advanced way of backing up vSphere.
  Backup is done using changed block tracking is vSphere.
  This enables TSM4VE to do "block level incremental backups".
  Only changed blocks on the VMDK is backed up.  Saves time and storage.
* Easier than method 2 when it comes to file restore.
  Not as good as method 1 though.
* Can do "instant restore" of crashed VMDKs.
  For example a crashed H: disk can be logically restored within seconds.
  During the physical restore process the TSM server acts as a file server.
  The H: disk is available for read/write during the entire restore!
* Can even do "instant restore" of entire VM.
  The crashed VM is booted from the TSM server and the migrated to the correct datastore.
  All this is done online.
* Complex setup -  It does require consultancy services to install
* Requires access to vCenter  (admin userid and password)
* A lot more ports need to be opened.
  There are a lot of communication between the VM, the ESX server, the vCenter server and the server running TSM4VE.
* The backup can be offloaded to a physical host outside of the vSphere cluster.
  This saves CPU and I/O in vSphere.
 
Extra steps needed to use method 2
----------------------------------

* The machine that runs the BA-client should **not** be the server that is to be backed up.
  Install the BA-client on another server.
  This server can be a virtual machine, or a physical server.
  The recomendation is to use a virtual machine.
* The server that runs the BA-client has to be able to communicate with both the ESX-server(s) and the vCenter machine.
  It doesn't have to talk to the server (VM) that is backed up.
* The BA-client has to have some optional software installed.
  When installing the TSM BA-client use the "custom install" and add "VMware vStorage API runtime files"
* Use the normal BaaS dsm.opt  (from portal/API) and start the GUI BackupArchive-client.
* Click "Edit" - "Client preferences" and choose "VM backup". 
* Insert the vCenter host name and the userid and password for vSpehere.  
* click OK
* Now you can backup any VM within your cluster (not the vCenter or the machine that you are running the BA-client on).
  In the GUI there is meny on the top  "Actions" - "Backup VM".
  The command line way is "dsmc backup vm {VMNAME}"

In order to use method 3 the setup is more complex. Please contact us for assistance. 
