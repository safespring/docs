# CyberDuck

## Download Cyberduck

This client is available for macOS and Windows at
https://cyberduck.io/

## Creating a config

The main window will show "bookmarks" unless you are connected to
somewhere, and in the lower left corner, press the `+` sign to add yet
another one.

![Add config](/images/cyberduckadd.png)

Enter the host part of the [URL for your account](generalinfo.md) in
the Server field and fill in your `access_key`. CyberDuck will prompt
for the `secret_key` at first connect and store it in the system
keyring.

![Create config](/images/cyberduck1.png)

## Options

Cyberduck defaults to a using multiple connections and chunked
transfers, so there isn't a lot of buttons to twist for performance
reasons. It can also sync folders, and it has nice menu choices to
select `Show me HTTPS url for this file` (don't ask for HTTP, that
will not work on our S3 setup) if you want to share an URL to a
publicly readable file.

## If creating or accessing buckets fail

Cyberduck can be set to use path-based URLs for buckets, which some of
our endpoints prefer, and if you log in successfully but cannot
operate on buckets, please set this property for Cyberduck and then
restart the client:

    s3.bucket.virtualhost.disable true

### For Mac users, run this command

    defaults write ch.sudo.cyberduck s3.bucket.virtualhost.disable true

### For Windows users, edit/create this file

     %AppData%\Cyberduck\default.properties

and add this line to it:

    s3.bucket.virtualhost.disable=true

After restart the bucket operations should work as expected.

## Setting ACLs on files

Select the file and choose `Info from the File` menu (keyboard
shortcut: Opt-I) or the cogwheel. Then add or remove permissions as
you see fit.

![Permissions](/images/cyberduck2.png)

## Addons

There is an addition called Mountainduck (mountainduck.io) which uses
your Cyberduck preferences and allows you to mount one or more of the
configured endpoints as a mounted drive. (In my case, the `DC1-S3`
'drive' on the left)

![Drives](/images/mountainduck1.png)
