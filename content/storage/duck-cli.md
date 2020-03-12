# CLI version of CyberDuck

## Getting Duck

This client is available at https://duck.sh

## Creating a config

Duck is used to move files, and handles a lot of different protocols,
and for each of those protocols you use, it wants you to make a URL
scheme so it can differentiate between endpoints in case you use it to
copy from remoteA to remoteB. This in turn shares the config file
`forOBmat` that Cyberduck uses, but since you would almost always
configure Cyberduck from the GUI, it's not super well documented nor
simple. For this reason we have made a config file that works with our
S3 endpoints.

I've chosen the name `safe://` for the endpoint, you can choose any
other name of course.  The filename isn't very important, but it needs
to end in `.cyberduckprofile` in order for duck to pick it up. The
protocol name is set in the Vendor part of the config file.

The config should be in your home folder, under
```
$HOME/.duck/profiles/safe.cyberduckprofile
```

The contents of this file should look like this for the Norwegian
site:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/
PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Protocol</key>
        <string>s3</string>
        <key>Vendor</key>
        <string>safe</string>
        <key>Scheme</key>
        <string>https</string>
        <key>Description</key>
        <string>Safespring Storage</string>
        <key>Default Port</key>
        <string>443</string>
        <key>Default Hostname</key>
        <string>s3.osl1.safedc.net</string>
    </dict>
</plist>
```

Change the "Default Hostname" entry to `s3.sto1.safedc.net` for the
Swedish site, everything else can be left as is.

The first time you connect to the service, it will ask you for the
`access_key` and the `secret_key`:

```
$ duck --list safe://my-test-bucket/
Login s3.sto1.safedc.net.
Login s3.sto1.safedc.net – S3 with username and password.
No login credentials could be found in the Keychain.
Access Key ID (ubuntu): ABCDEFGHIJ
Login as ABCDEFGHIJ
Secret Access Key: SECRETKEYGOESHERE12345678

Save password (y/n): y
```

## How to run

The cli version of CyberDuck is mostly meant for scripting so it
doesn't contain all the S3-related bells and whistles that for
instance s3cmd does, so for changing fancy permissions on objects or
other meta operations you should probably use the GUI or s3cmd, but
for normal upload/download/sync ops, duck performs very well and
allows for good parallelism while transferring data.

!!! info "Lists entries in that bucket,"
    ```
    duck --list safe://<my-bucket-name>
    ```

!!! info "Uploads a file or recursively uploads a whole directory structure."
    ```
    duck --upload safe://my-bucket-name object-or-dir
    ```

!!! info "Downloads it later on."
    ```
    duck --download safe://my-bucket-name/file
    ```

!!! info "Use this to synchronize local `-vs-` remote folders."
    ```
    duck --synchronize safe://my-bucket-name local-dir
    ```



## Options

Adding `--parallel <X>` will use `X` parallel streams for sending data and
a value between 5 or 10 might be suitable to speed things up a bit.

`-e` is used to tell duck how to handle overwrites if the destination
already exists.

For Upload and Download the options include:

`Resume`, `Overwrite`, `Rename (add timestamp)`, `Skip`, `Compare`, `Cancel`

and for Synchronize the options are:

`Download`, `Upload`, `Mirror`, `Cancel`

which tells the sync operation if local or remote side wins in case of
changed files or if it should add changed or missing files both ways
(`Mirror`).
