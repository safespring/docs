## Backup service degration

### Document history

* 26.02.2019 at 14:00 - status update
* 16.02.2019 at 12:00 - initial description and mitigation plans

### Description

We have been experiencing database load issues on the server on which the BaaS
service is based and are working on sharding the nodes among a pool of new
servers. This has shown itself as a delay when using the API or the web portal
while doing node operations which updated several fields at once, but we have
now received reports of clients that misbehave in such a way that you might get
OK reports even if the client has not inspected all of its files.

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
of several days.

As of Monday 26.2.2018 14:00 the following is current:

* New hardware has been put in place and verified

* A PKI infrastructure to expand the service to X new nodes has been
  verified.

* New versions of backup clients have been developed, adding a required new CA
  certificate. Early releases of updated clients are available for select
  customers. We do not yet recommend all users to upgrade.

* A first batch of nodes has been replicated, verified and successfully moved
  to the new server. We work with select customers in this process, focusing on
  relieving load on the main server as quickly as possible.

* As we mature the replication process we expect to be able to move larger
  batches of nodes, speeding up the migration considerably.

Updates will be communciated on this web page.

