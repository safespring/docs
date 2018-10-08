After installing the client using the guides on this wiki, you are ready to start doing backups and restores. If you started the scheduler service (Client Acceptor Service on windows, dsmcad on linux/mac/solaris/other-unices), TSM will make backups once per day around the time set on the backup schedule.

If you want to start a manual backup, start the graphical client (Backup & Archive GUI in the windows Start menu or /opt/tivoli/tsm/client/ba/bin/dsmj for linux/solaris, TSM Tools for Administrators on Mac)
You will see a GUI looking like this:

<image goes here>

from where you can ask for backup of all or selected local disks.

From the command line, the equivalent command to backup all local disks would be: **dsmc inc** and for backing up just a particular path, **dsmc i /only/this/dir/and/subdirs** or **dsmc inc e:**

If you choose to initiate the backups from the client (instead of configuring when the backup jobs should be run from the portal) it is important to know that the reports from the backup server will not be reliable because the server can not detect if the backup was complete or not. To remedy this you have two options:1) Set up your own reports based on the backup logs on the client node
2) Set up a backup job in the portal as well as your local scripted one. This way the server will be able to measure the job configured in the portal and the reports will be correct.

IBMs documentation for backups (and considerations before setting up your backups) is available here:

http://www-01.ibm.com/support/knowledgecenter/SSGSG7_7.1.1/com.ibm.itsm.client.doc/c_bac_data.html


You may also ask to restore data from that GUI. Anyone that has local administration privileges may restore data from backups made on this machine.

IBM documentation regarding different kinds of restore operations and options is available from here:

http://www-01.ibm.com/support/knowledgecenter/SSGSG7_7.1.1/com.ibm.itsm.client.doc/c_res_data.html

