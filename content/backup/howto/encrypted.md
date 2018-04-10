Encrypting parts of backups.
============================

If you want to make sure data is unreadable for 3rd parties (including
us), then you can opt to encrypt the data before it gets sent over the
wire. The network traffic will be encrypted once again since our
clients always encrypt data over the wire, and it will land on disks
which are encrypted-at-rest, which means it will be encrypted twice,
but the inner encryption is something you will have full control over.

Options mentioned below go into

    /opt/tivoli/tsm/client/ba/bin/dsm.sys

on Linux/Unix machines, in

    C:\Program Files\tivoli\tsm\baclient\dsm.opt

on Windows and

    /Library/Application Support/tivoli/tsm/client/ba/bin/dsm.sys

on MacOS X.

If you are going to use encryption, you will probably want to
move from the default AES128 to AES256 with this option:

    Encryptiontype aes256

How to handle keys
------------------

First of all, there is nothing that prevents you from using external
crypto software using whatever key scheme, the only change as far as
the service goes is that deduplication and compression will not yield
any gains. When creating a node when you know all data will be
encrypted, selecting

  * Encryption

will make sure neither client nor server will attempt dedup or
compression to prevent waste of computing resources. It is not a hard
requirement and if you want to encrypt only parts of it, select
deduplication and compression as normal, then use options (described
below) to point out the specific folders to encrypt. Selecting
encryption while creating the node will push server config to the
client going

    "INCLUDE.ENCRYPT /.../*"

to make sure all files are secure at first run.

If you want to let the IBM client do the encryption you have to select
if and how to store the encryption key. The choices are:

1) Never store the key at all. This forces you to enter the key for
   every backup and restore operation. Very cumbersome but ultimately
   the safest option if you decide not to trust the backup operators
   at all, or want the same level as using a completely separate
   encryption program manually.

   Enabled with

     "ENCRYPTKEY prompt"

2) Randomize a per-node key and store it on the local drive. This will
   allow automated backups and restores as long as the client node
   still has its drive working. For Bare Metal restores you need to
   have an offline copy of the key at your place.

   Enabled with

     "ENCRYPTKEY save"

   Should be combined with

     "PASSWORDACCESS generate"

   which means the key is stashed encrypted on disk, accessible by the
   program but not readable by humans. If your machine in turn has an
   encrypted root disk which requires password entry at boot, it will
   still be protected from "evil maid" scenarios where someone copies
   your drive when it is turned off and tries to use the data offline.

3) Generate a key and store it in the backup server database.  Sounds
   a bit weird, but is meant to protect situations similar to having
   backup tapes sent via untrusted couriers to external cold
   storage. In this case a lost/stolen tape will be unreadable for
   anyone not in control of the running backup server. Not very
   applicable to our service, and our encryption-at-rest should cover
   the risk of someone stealing a disk from us with your backups on.
 
   Enabled with

     "ENCRYPTKEY generate"

Selecting what to encrypt
-------------------------

To cover the whole disk, something simple like

    INCLUDE.encrypt "/.../*"

for Unix/Linux/Mac and

    INCLUDE.encrypt ?:\...\*

for Windows will make all files on all drives and filesystems that are
backed up to be encrypted before transfer.

Do mind that it will not affect files that have already been sent over
previously, which may confuse people testing encryption on a node for
which normal backups have been done before. Touching or editing a file
that is (now) covered by a INCLUDE.encrypt statement will make next
backup be encrypted, but the old unencrypted version will linger until
it expires depending on the retention polices it was backed up under.

Also, this will still store directory and file names in clear text in
the database to be able to selectively make single file restores, but
the contents of encrypted files will be unavailable until the correct
key has been supplied.

Encrypting selected folders
---------------------------

If you want to selectively encrypt a subset of the data, add
something along the lines of this to your dsm.opt / dsm.sys
file:

    INCLUDE.ENCRYPT "/Users/username/secret2/.../*" 
    INCLUDE.ENCRYPT "/Users/username/secret/.../*" 
    INCLUDE.ENCRYPT "/Users/username/private/.../*" 

which means most of the files can get the normal deduplication and
compression gains, but when the backup client passes by files in
these three folders and their subfolders, they will be encrypted.

Output from a backup run
------------------------

From a run with some files matching INCLUDE.encrypt:

    Total number of objects inspected:           24
    Total number of objects backed up:            5
    Total number of objects updated:             19
    Total number of objects rebound:              0
    Total number of objects deleted:              0
    Total number of objects expired:              0
    Total number of objects failed:               0
    Total number of objects encrypted:            4
    Data encryption type:               256-bit AES
    ...


Read more on IBMs site
----------------------

Include options:
https://www.ibm.com/support/knowledgecenter/SSEQVQ_8.1.4/client/r_opt_include.html

Encryptkey options:
https://www.ibm.com/support/knowledgecenter/SSEQVQ_8.1.4/client/r_opt_encryptkey.html
