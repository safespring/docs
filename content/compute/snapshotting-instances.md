#Snapshotting instances
This document descibes how to take snapshot of an instance in Safesprings plattform and
then how to start a copy of the instance from the snapshot. The way of doing this varies
a bit depending on how the instance was created in the first place.

There is mainly two variants to create an instance in Safesprings platform:
* You create the instance from an image Safespring provides in the platform.
* You create the instance from a volume. When doing this you will be able to alter the standard 40 GB size of the root filesystem. This option is also common if you have migrated the instance from another platform into Safespring.
The image below shows what the different types of method looks like in the instance view:
![image](../../images/snapshot-different-instance-types.png)
The instance which is started from an image has the image listed in the "Image"-column whether the instance created from a volume just has a minus-sign in that column.

If the instance is created from an image, and do not have a minus-sign in the "Image"-column you can go ahead and press the "Create Snapshot"-button to create a snapshot.
If it instead is created from a volume, you should instead go to the "Volumes"-tab in the GUI and find the volume which is the root filesystem for the instance you want
to snapshot.

![image](../../images/snapshot-create-volume-snap.png)

Your snapshot will now show up under "Volume Snapshots" tab.

In order to start a new instance from your snapshot you go to the "Launch Instance" dialogue in the Instance-listing.
When it is time to pick a source for the instance - use the dropdown and either pick "Instance Snapshot" or "Volume Snapshot" depending on 
which method you used to take the snapshot. You use "Instance Snapshot" if the original instance was created from an image and "Volume Snapshot"
if the snapshot was taken from the volume.

![image](../../images/snapshot-start-from-volume-snap.png)

You fill in the other things that are needed, and put the new instance in the same network as the original and launch the instance.

If it is a linux instance, you will now have a copy of you former instance and can check out that the copy works as intended.
If it is a Windows instance, you have to reconfigure the network in order to make the copy reachable and to be able to manage it over RDP.

You start by clicking the name of your new instance started from the snapshot and the click "Console". You will notice that the instance does
not have working networking connectivity but you log in just like you normally do in the web console. 

![image](../../images/snapshot-login-to-snapped.png)

Once your in you right-click on the little network icon in the lower right corner and pick the "Open Network and Sharing Center". 
You click "Change adapter settings" and right click the network adapter and pick "Properties". You will be presented by the following dialogue:

![image](../../images/snapshot-network-properties.png)

You double click the "Internet Protocol version 4" entry and you will see the following:

![image](../../images/snapshot-wrong-ip.png)

You see that the instance has the original instance IP-address configured which is the problem. Just pick "Obtain an IP-address automatically" and click "OK".

After a short while the instance will reboot itself and when it is back upp it will have the IP-adress that is listed in the Instance-listing in the OpenStack GUI
instead of the old one. 

Your snapshotted copy instance is now ready to use.
