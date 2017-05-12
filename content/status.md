# Service status

## Status page

A status page is under development at https://status.safespring.com - for now,
the page contains (manual) annoucement of downtime and maintenace windows. It
will be extended with an automated view with data from our service monitoring.

In addition, the Norwegian site got test results from regular Rally runs
at https://test-stats.cloud.ipnett.no/ Rally is a suite that runs tests and
validation against the Openstack API.

## Known issues

### The internal DNS resolver does not work correctly

The internal DNS resolver service that is set up by default when using our
network service does not work correctly. To work around this, configure an
external DNS server for your network.

