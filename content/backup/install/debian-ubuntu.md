# Debian/Ubuntu Linux (64-bit)
 
These instructions show how to install the TSM client on Debian or Ubuntu.
We will use a shell-script listed below and the TSM-debian repositories Safespring
privides.
 
Start with creating a node inte portal:
![Create node](/images/create-node.png)

Make sure to fill in all the fields and to choose "Traditional files" at "Application" dropdown. Click "Create node".

After the creation is finished you will be presented with this dialogue:

![Node created](/images/node-created.png)
Make sure to save the password in a textfile for further reference. Also click
the "Download configuration" and save the ZIP-file on your computer.

Create a file setup-baas.sh with the following contents:

```shell
#!/bin/bash
WORKINGDIR=/opt/tivoli/tsm/client/ba/bin/
cat > /etc/apt/sources.list.d/safespring-baas.list << EOF
deb https://repo.cloud.ipnett.com/debian xenial main
EOF
wget -qO - https://repo.cloud.ipnett.com/debian/pubkey.gpg | sudo apt-key add -
apt-get install unzip
apt-get update && apt install safespring-baas-setup
unzip dsm-*
cp dsm.opt $WORKINGDIR
cp dsm.sys $WORKINGDIR
dsmc query session
cat > /etc/systemd/system/dsmcad.service << EOF
[Unit]
Description=Tivoli Storage Manager Client Daemon
After=network.target

[Service]
Type=forking
ExecStart=/usr/bin/dsmcad
Restart=on-abort
GuessMainPID=no
WorkingDirectory=/opt/tivoli/tsm/client/ba/bin/

[Install]
WantedBy=multi-user.target
EOF
systemctl enable dsmcad
systemctl start dsmcad
systemctl status dsmcad
```

Now it is time to upload the configuration ZIP-file that you downloaded from the 
"Create node" in the portal and the script you just created above. If using Windows
we recommend using WinSCP to upload the files to the home directory of a user
that has sudo-rights.

![WinSCP upload](/images/winscp-upload.png)
<image winscp-upload.png>

Now you connect to the server with SSH with to user to which home directory
you copied the two files. 
Now you need to run:
```shell
ubuntu@baas-test-4:~$ ls
dsm-ZXAGTHTIGQKC.zip  setup-baas.sh
ubuntu@baas-test-4:~$ chmod +x setup-baas.sh
ubuntu@baas-test-4:~$ sudo ./setup-baas.sh
```
You will need to answer "Yes" with a "y" two times.
When you come to the part which asks which node name to use, just hit return.
After that you provide the password that you got from the backup portal and 
that you wrote to a textfile.

When the script has finished you have successfully installed TSM on the server.
You can ensure that the service is running by running "systemctl status dsmcad".

Do not forget to go to the portal and update the node to configure retention
