# Restoring data from the sto4 storage cluster

After the incident that took down the storage cluster in our sto4 site, we are working on restoring data from the cluster. Daily updates will be posted on this site.

A complete incident report is being prepared, and will be published later.

## Update 2021-07-09

There is not much to report today. We started exporting metadata yesterday and it will be finished today. On Monday we will process metadata, and finish code to restore actual data. We expect more news on Tuesday, when we expect to start restoring data.

## Update 2021-07-08

Today we have finished the code for metadata restore, and also proceeded our infrastructure work, which means we are getting closer to restore data from next week.

## Update 2021-07-07

We are still working on the metadata restore, and also building tooling. That means no files are restored today, but unless anything unexpected happens, we will se a much faster recovery rate starting next week. 

## Update 2021-07-06

We are splitting the restore operation in two parts: First we are going to restore metadata, and when that is done, we will be able to restore actual data at a faster speed. We will report the progress of the metadata restoration in tomorrows status update.

Meanwhile, we have also restored a full object from the cluster as a proof of concept, and we are waiting for the customer to verify that the restore is complete before we proceed with more objects.

## Update 2021-07-05

Since last status update, we have continued to work on setting up infrastructure and automating restore process. We haven't restored any more files, but we have a list of 5 prioritized buckets we will start to restore this week. Once we have more information about numbers (number of buckets to restore, number of files in each bucket) - we will update with progress here.

## Update 2021-07-02
We have today continued with the restore of the metadata. We also have set up a process for clearer communication on which data to restore first. We still aim at being able to restore objects in a larger scale early next week.


## Update 2021-07-01
We now have a working automatic process to restore objects larger than 4 MB from the active part of the cluster. The restoration process from the inactive nodes is still manual.

To be able to provide a reliable report of what is in the cluster and what we need to restore work will now be focused primarely on restoring the metadata. By restoring the metadata we will be able to tell with certainty exactly which files that was in the solution before it went down. Once we have the metadata database we will continue to restore the actual objects.


## Update 2021-06-30
Our focus right now is to restore the primary storage bucket for the Nextcloud installation. Yesterday we managed to restore 810 objects out of 1230 in that bucket. The restored objects have all a size smaller than 4 MB. Due to multipart handling in the backend objects bigger than 4 MB need to be handled differently. The parts of the objects need to be found and concatenated in order to restore them properly. We are today writing the code to do just that to be able to retrieve those objects as well.


## Update 2021-06-29
We now have a working program to list all object names in a bucket which we will use as
input to the next set of programs that will do the actual restore. We can also get metadata about the objects to get the checksums but since Nextcloud is using multipart uploads as default we will have to investigate the chunk sizes for the multipart uploads to be able to calculate the checksums correctly to be able to verify the integrity of the restored data.

We have a working process to restore the objects in the active part of the cluster. Next step is to find which parts of the objects that resides in the inactive part and find a consistent way how to restore them.

We are working on setting up a new Nextcloud instance to which the users that where using the Sunet Drive solution can reupload the files that they still have. We will then be able to find a delta on which files that can not be reuploaded in order to focus our efforts on restoring those objects.


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
