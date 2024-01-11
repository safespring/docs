Switching from TSM12 to the new TSM server
================================================

Around New Year 2024 we have been working on switching to a new TSM server in 
Kalix, Norrbotten (**server2.backup.dco1.safedc.net**) from the older TSM12 in 
Stockholm (**tsm12.backup.sto2.safedc.net**). 
TSM12 will be decommissioned.
**From your end, we need you to follow five steps to switch your clients to the 
new TSM server.**

If you need assistance with the following steps, 
you are welcome to contact [support](./../../service/support.md).

How to Switch to the new Server
--------------------------

**For every existing backup node/client:**

1. [Create a new node](../quickstart-guide.md) using Cloutility. 
   Newly created nodes will be on the new TSM server.
   This new node will be used in the future rather than the existing backup 
   node. So make sure to use the same _Platform_, _Domain_ and 
   _Client Option Set_.
   
     **Schedules**

     If you have used schedules in the old node, then you should add them to 
     the new node as well. 
     This can be done from Cloutility -> Consumption Units -> 
     [Your New Node] -> Schedules -> Available schedules. 
     Click Add on the right schedules so that they match the old node.

2. Modify the client configuration file to use the hostname of the new server,
   and the new node name.
   Also, remove `TESTFLAG disable_tls13` if you have this entry.

     - **(Linux)** Edit `/opt/tivoli/tsm/client/ba/bin/dsm.sys`. 
       Change:
       ```
       NODENAME YOUR_OLD_NODE_NAME
       TCPSERVERADDRESS tsm12.backup.sto2.safedc.net
       ```
       To:
       ```
       NODENAME YOUR_NEW_NODE_NAME
       TCPSERVERADDRESS server2.backup.dco1.safedc.net
       ```
     - **(Windows)** Edit `C:\Program Files\Tivoli\TSM\baclient\dsm.opt`. 
       Change:
       ```
       NODENAME YOUR_OLD_NODE_NAME
       TCPSERVERADDRESS tsm12.backup.sto2.safedc.net
       ```
       To:
       ```
       NODENAME YOUR_NEW_NODE_NAME
       TCPSERVERADDRESS server2.backup.dco1.safedc.net
       ```
         Here is <a href="https://raw.githubusercontent.com/safespring/cloud-BaaS/master/windows/dsm.opt.example" target="_blank">an example</a> of a working dsm.opt file on Windows
         that you can use as a reference. You can replace your existing dsm.opt 
         file with this example if you want. But do make sure to include 
         custom options from your previous dsm.opt file that you know you want 
         to keep, such as include/exclude rules for example.
         Also, make sure to replace the node name, as instructed in the file.

3. Your node on **server2.backup.dco1.safedc.net** has a new password. 
   This new password is provided to you through 
   <a href="https://portal.backup.sto2.safedc.net/" target="_blank">Cloutility</a>. Go to 
   Consumption Units -> [Your New Node] -> Basics -> Setup information -> 
   SP password.

    If the TSM Backup-Archive client software is still running, after letting it 
    finish any operation that it may be performing, restart it to make sure that 
    it connects to the new TSM server. You will be asked for a password, use the 
    new password.

4. Perform a first backup against the new TSM server.
5. Once the backup in the previous step has been completed, [delete the old
   node in Cloutility](delete-node.md). 
   This will lock the old node in the TSM server rather
   than deleting it completely. 
   It means that the old node will not be usable for future backups, 
   but is available for future restores if needed. 
   Eventually, the old node's retention time will expire, 
   and the old node will be removed completely. 
   By then, all client backups, according to the node's retention time, should 
   be on the new server.
