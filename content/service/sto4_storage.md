# Restoring data from the sto4 storage cluster

After the incident that took down the storage cluster in our sto4 site, we are working on restoring data from the cluster. Daily updates will be posted on this site.

A complete incident report is beeing prepared, and will be published later.

## Update 2021-06-24

We have had progress on restoring files: Work has been done to manually restore a few specific files from the placement groups that are unavailable. Later this process will be automated so we can speed up the process. Progress is still slow because of the manual steps that need to be taken, but we expect recovery to be faster from next week. So far the work has been successful.

We have also done further work on bringing up important services or migrate to other solutions for customers that were affected.

We have done work to ensure that other storage clusters are operating safely, and we are confident that similar situations will not happen at our other sites.

## Update 2021-06-23

Today, we are doing work to establish the process for restoring data, with the intent to write scripts do this automatically at a later stage.

We have also been securing metadata, and we will work on creating lists of files we need to recover.

We have also been working on setting up services at other sites, and we have scheduled meetings with some of the customers. 

If you are a customer and this incident has an impact for you, don't hesitate to get in touch with us at support@safespring.com, and we will set up a meeting with you.