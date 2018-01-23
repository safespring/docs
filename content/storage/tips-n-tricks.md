Tips and Tricks for S3 storage
==============================

Versioning of file contents
---------------------------

The S3 system allows you to enable versioning on a per-bucket
basis. This means that whenever a file gets overwritten, the S3 system
will keep the old contents alongside with the new content, using
the same object name.

In order to request older file versions, your clients need to have
support for it, and not all S3 clients do. 

S3 Browser looks like this if you view a bucket with versioning
enabled and press the Versios panel:

![S3browser](/images/S3browser+versions.png)

CyberDuck needs to enable "Show hidden files" from the View menu, then
you can get old versions listed in grey underneath the latest active
version.

![Cyberduck](/images/cyberduck+versions.png)

Pros and Cons of versioning
---------------------------

For safety reasons, enabling versioning on a bucket can prevent data
loss in case one accidentally overwrites something on the S3 storage
meant to be kept. Since S3 is not a file system per se but rather an
object storage which often represents data like it was files and
folders, handling permissions might be trickier than on a local disk
and then versioning might help recovering from inadvertent changes.

On the other hand, the storage will charge you for the full extent of
stored data, even if some clients will not let you see the hidden
versions, so you might be suprised to see usage exceed the sum of the
sizes of the visible files. Versioning if off by default, so this can
only happen if you deliberately enable it on a particular bucket.

You need to be careful when acting on old versions of files, the GUI
tools tend to move back to the active version if you move about in the
software. In my examples above, the sizes of the files makes it easier
to know what the versions were, but that will not always be the case.

In my examples above, the versions had rather big differences in sizes
which made it somewhat easy to spot when large changes had occured to
the file, but if your versioned file changes mostly internally and
not so much in size, it will be a manual task to download different
versions and look into their contents to know which versions is the
"good" one, in case there has been a lot of unknown internal changes
to its content.
