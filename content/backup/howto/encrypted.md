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

How to handle keys
------------------

First of all, there is nothing that prevents you from using external
crypto software using whatever key scheme, the only change as far as
the service goes is that deduplication and compression will not yield
any gains. When creating a node when you know all data will be
encrypted, selecting

  * Encryption

will make sure neither client nor server will attempt dedup or
compression to prevent waste of computing resources.
Note: It will not make encryption choices for your node in other regards.

If you want to let the IBM client do the encryption you have to select
if and how to store the encryption key. The choices are:

1) Never store the key at all. This forces you to enter the key for
   every backup and restore operation. Very cumbersome but ultimately
   the safest option if you decide not to trust the backup operators
   at all, or want the same level as using a completely separate
   enryption program manually.

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

   which means the key is stashed encrypted on disk, accessible by
   the program but not readable by humans.

3) Generate a key and store it in the backup server database.  Sounds
   a bit weird, but is meant to protect situations similar to having
   backup tapes sent via untrusted couriers to cold storage. In this
   case a lost/stolen tape will be unreadable for anyone not in
   control of the running backup server. Not very applicable to our
   service, and our encryption-at-rest should cover the risk of
   someone stealing a disk from us with your backups on.
 
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


