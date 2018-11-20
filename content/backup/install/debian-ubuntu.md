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
cat > /etc/apt/sources.list.d/safespring-baas.list << EOF
deb https://repo.cloud.ipnett.com/debian xenial main
EOF
wget -qO - https://repo.cloud.ipnett.com/debian/pubkey.gpg | sudo apt-key add -
apt-get install unzip
apt-get update && apt install safespring-baas-setup
unzip dsm-*
cp dsm.opt /opt/tivoli/tsm/client/ba/bin/
cp dsm.sys /opt/tivoli/tsm/client/ba/bin/
dsmc query session
cat > /etc/init.d/dsmcad << 'EOF'
#!/bin/sh
# kFreeBSD do not accept scripts as interpreters, using #!/bin/sh and sourcing.
if [ true != "$INIT_D_SCRIPT_SOURCED" ] ; then
    set "$0" "$@"; INIT_D_SCRIPT_SOURCED=true . /lib/init/init-d-script
fi
### BEGIN INIT INFO
# Provides:          dsmcad
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: DSMCAD initscript
# Description:       This script replaces the /etc/init.d/dsmcad script
#                       from IBM that only works on Red Hat variants
#                       to start the dmscad service on Debian variants
### END INIT INFO

# Author: Gabriel Paues <gabriel.paues@safespring.com>
#

DESC="DSMCAD Start Script"
DSMCAD_DIR=/opt/tivoli/tsm/client/ba/bin
DAEMON=$DSMCAD_DIR/dsmcad
PIDFILE=/var/run/dsmcad.pid
WORKING_DIR=/var/log/tsm

mkdir -p $WORKING_DIR

test -x $DAEMON || exit 0

. /lib/lsb/init-functions

case "$1" in
  start)
        log_daemon_msg "Starting dsmcad" "dsmcad"
        cd $WORKING_DIR
        start_daemon -p $PIDFILE $DAEMON
        log_end_msg $?
    ;;
  stop)
        log_daemon_msg "Stopping dsmcad" "dsmcad"
        killproc -p $PIDFILE $DAEMON
        log_end_msg $?
    ;;
  force-reload|restart)
    $0 stop
    $0 start
    ;;
  status)
    status_of_proc -p $PIDFILE $DAEMON atd && exit 0 || exit $?
    ;;
  *)
    echo "Usage: /etc/init.d/dsmcad {start|stop|restart|force-reload|status}"
    exit 1
    ;;
esac
EOF
systemctl enable dsmcad
systemctl start dsmcad
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
