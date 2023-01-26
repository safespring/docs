#Trouble Shooting
This section contains practical tips on how to solve certain problems.

## Rescuing instances
If the root file system of your instance becomes broken for some reason there is a smart functionality in OpenStack to help solve the problem. There is a "Rescue Instance" feature in the drop-down menu on the instance in the instance listing, which makes it possible to put the instance in rescue mode. The user picks an image to boot from (could be any image that you feel familiar with) and then the instance will be rebooted with the original root file system mounted as a secondary volume. You can now run fsck or other operations on the root fs in order to repair the filesystem. Once you are done, pick "Unrescue Instance" in the drop-down menu and the instance will be rebooted with the mended root file system.
