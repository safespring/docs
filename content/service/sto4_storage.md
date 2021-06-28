# Restoring data from the sto4 storage cluster

After the incident that took down the storage cluster in our sto4 site, we are working on restoring data from the cluster. Daily updates will be posted on this site.

A complete incident report is beeing prepared, and will be published later.

## Update 2021-06-28
We keep on doing progress with the restore process. As it looks now we will be able to start automated restores later this week. We will be able to focus our efforts on specifik buckets where the primary storage bucket for the Nextcloud installation in sto4 has the highest priority.

We have also enforced bucket quotas on 5 million objects per bucket in sto3 which will prevent this problem from happening there.

## Update 2021-06-26

Yesterday we calculated quotas for sto3, we have controlled all existing
accounts, and all accounts will have limits set today.

We are waiting for Nextcloud support and an implemetation of automatc restores
before we can restore at any speed. Both are prioritized, and we expect to see
progress in the coming week.

## Update 2021-06-25

We are implementing quota limits per bucket on our other ceph clusters, to
prevent same isse from happening at other sites. We are also looking at other
protection mechanisms.

We have an ongoing support case with nextcloud to ensure we are doing the right
steps to restore the service and any data.

We have had progress in restoring data from sto4. This is still a slow process,
but we plan to speed up the process at some point in next week. 

We are working on setting up alternative solutions for users at sto4. 
 
## Update 2021-06-24

We have had progress on restoring files: Work has been done to manually restore a few specific files from the placement groups that are unavailable. Later this process will be automated so we can speed up the process. Progress is still slow because of the manual steps that need to be taken, but we expect recovery to be faster from next week. So far the work has been successful.

We have also done further work on bringing up important services or migrate to other solutions for customers that were affected.

We have done work to ensure that other storage clusters are operating safely, and we are confident that similar situations will not happen at our other sites.

## Update 2021-06-23

Today, we are doing work to establish the process for restoring data, with the intent to write scripts do this automatically at a later stage.

We have also been securing metadata, and we will work on creating lists of files we need to recover.

We have also been working on setting up services at other sites, and we have scheduled meetings with some of the customers. 

If you are a customer and this incident has an impact for you, don't hesitate to get in touch with us at support@safespring.com, and we will set up a meeting with you.
