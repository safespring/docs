Restore Encrypted Data
=======================

Data backed up using the Safespring Backup service is encrypted at rest by 
default, this all happens in the background, and no action from your part is 
needed. If files have been 
[client-side encrypted](../howto/encryption.md#ibm-client-encryption) using the 
options `ENCRYPTKEY prompt` or `ENCRYPTKEY save`, along with `INCLUDE.ENCRYPT`, 
then you will need to supply the encryption key password to the client on 
a new machine when performing a data restore.

Retrieving the encryption key password
---------------------------------------
If you have forgotten the password, and you are using `ENCRYPTKEY save`, you 
could extract the password from the production system by following 
[these steps](../howto/password.md#retrieving-the-current-password). That 
text is applicable to encryption key passwords as well as backup node passwords,
because they are saved in the same location and can be retrieved in the same 
way. 

Note that if you have backed up encrypted data, you will have two or more
passwords in the backup-archive client password keystore. It is not clear 
which one is for encryption, so you will have to use trial-and-error to figure 
that out.

!!! warning
     If you are using `ENCRYPTKEY prompt` and have forgotten the password, 
     **there will be no way to retrieve the data without brute-forcing**. 
     Assuming the password has good entropy (which it is supposed to have), 
     it should not be brute-forcible in any short amount of time. 
     In such a case, we can assume that the _backup data is lost_. 
     Safespring cannot recover client-side encrypted data for you without the 
     password.

Restoring encrypted data
--------------------------
Restoration is done just [like normal](basics.md).
The only exception is that you will be asked to input the encryption key 
password (or skip restoring encrypted files):

```
root@restore-test:~# dsmc restore -preservepath=complete -subdir=yes -replace=yes '{/var/secret/}/*' /root/output/
IBM Storage Protect
Command Line Backup-Archive Client Interface
  Client Version 8, Release 1, Level 25.0 
  Client date/time: 2024-12-17 16:52:58
(c) Copyright IBM Corp. 1990, 2024. All Rights Reserved. 

Node Name: TESTING_NODE
Session established with server DCO1-BACKUP-SERVER-2: Linux/x86_64
  Server Version 8, Release 1, Level 21.000
  Server date/time: 2024-12-17 17:52:58  Last access: 2024-12-17 17:52:50

Accessing as node: PRODUCTION_NODE
Restore function invoked.

ANS1247I Waiting for files from the server...

--- User Action is Required ---
File: /root/output/README.md requires an encryption key.


Select an appropriate action
  1. Prompt for encrypt key password
  2. Skip this object from decryption
  3. Skip all objects that are encrypted
  A. Abort this operation
Action [1,2,3,A] : 
```

Select action number 1 and input the encryption key password to restore 
the encrypted file(s).
