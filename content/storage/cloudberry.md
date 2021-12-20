# Getting CloudBerry

## Download CloudBerry
The CloudBerry Explorer for S3 can be downloaded from:
https://www.cloudberrylab.com/explorer/amazon-s3.aspx

## Creating a config

Start with adding an `S3 compatible gateway` config,

![Create config](/images/cloudberry1.png)

and in the next menu, give it a name, add endpoint URL
https://s3.sto2.safedc.net (if this is where your account is located)
and the `access_key` and `secret_key` you got while enrolling for the
service.

![Options](/images/cloudberry2.png)

## Simple CloudBerry usage

From this point on, you can use it like any graphical
`FTP` or `SCP` client, you can open local folder or another
remote folder on each side and drag-n-drop files and folders
between the sites.

![Usage](/images/cloudberry3.png)

## Features of Cloudberry

Apart from manual up- and downloads, you can also sync folders
from one side to the other. This will compare the two sides and
copy missing files to the destination side. You may save the
chosen sync settings and run it at a later date again with
identical settings.

You may also edit the properties of individual objects or folders
by selecting them in the list and pressing the Properties button
(alternatively right-click on any remote object) to select who
may read or write to the files/folders.

![Properties](/images/cloudberry4.png)

For folders, you may choose to apply the setting recursively to
the whole directory tree. If you upload a file and ask for its
Public URL, you will get something along the lines of:
http://s3.sto2.safedc.net/bucket-name/Folder/File.txt
which is ALMOST usable immediately.

Since the S3 software runs
behind a SSL accelerator and load-balancer it thinks it is serving
`http` in clear text but for the outside users, it must always be
`https://` so adding the S in https allows you to hand out access
to a single file/folder just by giving out the URL to the
object(s) in one or more of your S3 buckets.

## Optional features

If you register CloudBerry, you will be able to add parallel
upload/download capabilities, the ability to compare folders,
map a remote path as a windows unit letter (`X:` for instance)
and so on.
