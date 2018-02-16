## Backup service degration

Last update: 16.02.2019 at 12:00

### Description

We have been experiencing database load issues on the server on which the BaaS
service is based and are working on sharding the nodes among a pool of new
servers.

Mostly, this has shown itself as a delay when using the API or the web portal
while doing node operations which updated several fields at once, but we have
now received reports of clients that will misbehave in such a way that you
might get OK reports even if the client has not inspected all of its files.

The cause of this seems to be the following:

dsmcad is the lightweight program used to keep track of when the schedule of a
particular node is to be run. When this occurs, it starts the "dsmc" client to
run and collects the result from it, then goes to
sleep again, until the next scheduled event is set to happen.

For some reason (this has been a registered bug in the TSM client previously),
with the situation now where the backend database is slower to answer queries,
dsmcad ends up thinking the session is done or idle and asks "dsmc" to end,
just like would happen if you run "dsmc" interactively and press Q twice to
make a clean exit.

The devious part of this is that from the server side, it looks very much like
the client node did backup everything it wanted to back up and
then executed a clean exit, which means the nightly report will consider this
run a full success.

### Impact

We believe the chance of being impacted is related to scheduling of backups.
Currently known instances of the problem occurs in periods with high to very
high load on the service, typically during the night.

To check if this might have occured to a node you control, run:

    dsmc query backup <file that frequently changes> -inactive

For Linux/Unix machines, you might use the file /var/log/cron. For Windows
machines, some other local log file like C:\Windows\WindowsUpdate.log

### Work towards mitigation

Safespring is currently working at our highest priority to add resources to the
service. We believe this will bring the problem under control and resume normal
service quality for all users. This work is currently ongoing. As the migration
process will be incremental we expect full mitigation to take time in the order
of several days. Our goal is to better the sitatuion as quickly as possible.

Updates will be communciated on https://status.safespring.com and this web
page.

