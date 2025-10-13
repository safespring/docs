#Trouble Shooting
This section contains practical tips on how to solve certain problems.

## Console access through the dashboard
The OpenStack dashboard provides console access to instances through the web interface. This can be useful for troubleshooting issues or accessing the instance when SSH is not available. It can also be used to view the boot logs of the instance.

!!! warning "Console access is restricted"
    Console access through the dashboard is firewall protected and only available to users who have been whitelisted for API access. If you need console access to your instances, you must first request API access permissions.

    To request the necessary permissions for console access you need to contact support. See [Getting support](../service/support.md) for details.
    Include the site you're using and the ip address that needs to be whitelisted.



## Rescuing instances
If the root file system of your instance becomes broken for some reason there is a smart functionality in OpenStack to help solve the problem. There is a "Rescue Instance" feature in the drop-down menu on the instance in the instance listing, which makes it possible to put the instance in rescue mode. The user picks an image to boot from (could be any image that you feel familiar with) and then the instance will be rebooted with the original root file system mounted as a secondary volume. You can now run fsck or other operations on the root fs in order to repair the filesystem. Once you are done, pick "Unrescue Instance" in the drop-down menu and the instance will be rebooted with the mended root file system.
