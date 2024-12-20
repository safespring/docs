Graphical Linux Backup Client
==============================

On desktop/workstation Linux systems, it may be useful to have a backup client 
GUI available. 
There is one, just like on Windows, but there is no desktop shortcut for it.

The GUI client is:
```shell
sudo dsmj
```
It requires root, hence the command being prefixed with `sudo`.

Desktop Shortcut
-----------------
You can create your own desktop shortcut by creating the file
`/usr/local/share/applications/dsmj.desktop` with the content:
```ini
[Desktop Entry]
Version=1.0
Type=Application
Name=Backup-Archive GUI
Icon=/opt/tivoli/tsm/client/ba/bin/logo_ISP_small.png
Exec=/usr/bin/sh -c '/usr/bin/pkexec env GDK_SCALE=1 DISPLAY=$DISPLAY XAUTHORITY=$XAUTHORITY /opt/tivoli/tsm/client/ba/bin/dsmj'
Comment=IBM Storage Protect backup-archive client
Categories=Utility;
Terminal=false
StartupWMClass=COM-ibm-storage-adsm-cadmin-clientgui-DDsmApplet
StartupNotify=true
```

Extract the app icon so that the shortcut can find it:
```shell
sudo unzip -j /opt/tivoli/tsm/client/ba/bin/dsm.jar COM/ibm/storage/adsm/cadmin/clientgui/images/logo_ISP_small.png -d /opt/tivoli/tsm/client/ba/bin/
```

You should now have **Backup-Archive GUI** available on your desktop menu.

GUI Scaling
-------------------
If you have a HiDPI screen and the application appears small, you can scale up the graphical interface by an
integer, for example, 2 or 3. 
Unfortunately, fractional scaling (like 1.5) is not supported. This is a <a href="https://bugs.openjdk.org/browse/JDK-8214227" target="_blank">known limitation</a> in JDK.

To scale the application, edit `/usr/local/share/applications/dsmj.desktop` and change `GDK_SCALE=1` to the scaling you want, for example, `GDK_SCALE=2`.
