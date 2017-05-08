After installing the client using the guides on this wiki, you are ready to start doing backups and restores. If you started the scheduler service (Client Acceptor Service on windows, dsmcad on linux/mac/solaris/other-unices), TSM will make backups once per day around the time set on the backup schedule.

If you want to start a manual backup, start the graphical client (Backup & Archive GUI in the windows Start menu or /opt/tivoli/tsm/client/ba/bin/dsmj for linux/solaris, TSM Tools for Administrators on Mac)
You will see a GUI looking like this:

<image goes here>

from where you can ask for backup of all or selected local disks.

From the command line, the equivalent command to backup all local disks would be: **dsmc inc** and for backing up just a particular path, **dsmc i /only/this/dir/and/subdirs** or **dsmc inc e:**

IBMs documentation for backups (and considerations before setting up your backups) is available here:

http://www-01.ibm.com/support/knowledgecenter/SSGSG7_7.1.1/com.ibm.itsm.client.doc/c_bac_data.html


You may also ask to restore data from that GUI. Anyone that has local administration privileges may restore data from backups made on this machine.

IBM documentation regarding different kinds of restore operations and options is available from here:

http://www-01.ibm.com/support/knowledgecenter/SSGSG7_7.1.1/com.ibm.itsm.client.doc/c_res_data.html
