Connect TSM Backup-Archive Client to the new Server
================================================

Around New Year 2024 we have been working on switching to a new TSM server in 
Kalix, Norrbotten (**server2.backup.dco1.safedc.net**) from the older TSM12 in 
Stockholm (**tsm12.backup.sto2.safedc.net**). Most work to make
this happen is done in the background by our technicians. From your end, 
we need you to follow two steps at your given switch date. This date should be provided to you by SafeSpring. 

If you need assistance with the following steps, 
you are welcome to contact [support](./../../service/support.md).

**For every backup node/client:**

1. Perform one last complete incremental backup against the old server (TSM12).
2. Modify the client configuration file to use the hostname of the new server. 
   Also, comment out `TESTFLAG disable_tls13` if you have this entry.

     - **(Linux)** Edit `/opt/tivoli/tsm/client/ba/bin/dsm.sys`. 
       Change:
       ```
       TCPSERVERADDRESS tsm12.backup.sto2.safedc.net
       TESTFLAG disable_tls13
       ```
       To:
       ```
       TCPSERVERADDRESS server2.backup.dco1.safedc.net
       *TESTFLAG disable_tls13
       ```
     - **(Windows)** Edit `C:\Program Files\Tivoli\TSM\baclient\dsm.opt`. 
       Change:
       ```
       TCPSERVERADDRESS tsm12.backup.sto2.safedc.net
       TESTFLAG disable_tls13
       ```
       To:
       ```
       TCPSERVERADDRESS server2.backup.dco1.safedc.net
       *TESTFLAG disable_tls13
       ```

    If the TSM Backup-Archive client software is still running, after letting it 
    finish any operation that it may be performing, restart it to make sure that 
    it connects to the new TSM server. You may be asked for a password, use the 
    same password as before. If you don't know the password to your node(s), 
    you can find it/them in the Cloutility backup portal. Go to Consumption Units -> [Your Node] -> Basics -> Setup information -> SP password.

!!! warning
      Status reports in Cloutility may be incorrect during the migration 
      process. We are working on finishing the migration as fast as possible.
      All customers will be notified once this has been completed.