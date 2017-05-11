# CyberDuck

## Getting CyberDuck

This client is available for Mac and Windows at
https://cyberduck.io/

## Creating a config

The main window will show "bookmarks" unless you are connected
to somewhere, and in the lower left corner, press the + sign
to add yet another one.

![Add config](/images/cyberduckadd.png)

Enter the URL s3-archive.api.cloud.ipnett.se and your access_key.
The secret_key will be asked on first connect and stored in the system
keyring (for Mac at least).

![Create config](/images/cyberduck1.png)

## Options

Cyberduck defaults to a using multiple connections and chunked
transfers, so there isn't a lot of buttons to twist for performance
reasons. It can also sync folders, and it has nice menu choices
to select "Show me HTTPS url for this file" (don't ask for HTTP,
that will not work on our S3 setup) if you want to give away an
URL to a publicly readable file.

## Setting ACLs on files

Select the file and choose Info from the File menu (keyboard
shortcut: Opt-I) or the cogwheel. Then add or remove permissions
as you see fit.

![Permissions](/images/cyberduck2.png)

## Addons

There is an addition called Mountainduck (mountainduck.io) which
uses your Cyberduck preferences and allows you to mount one or
more of the configured endpoints as a mounted drive. (In my case,
the DC1-SE 'drive' on the left)

![Drives](/images/mountainduck1.png)
