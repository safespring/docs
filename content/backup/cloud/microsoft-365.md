Microsoft 365 Backup
=====================

If your organization is backing up Microsoft 365 data at Safespring, 
you will be using the AvePoint service to manage backups and restore data. 
The backups themselves are stored in the Safespring S3 storage.

To access the administration panel, sign in at 
<a href="https://m365backup.avepointonlineservices.com/" target="_blank">
AvePoint Cloud Backup for Microsoft 365</a>.

Backup
--------

You can decide what to back up from Microsoft 365 and how often
by visiting **Backup**:

![avepoint-m365-backup.png](../images/avepoint-m365-backup.png)

Services that can be protected are:

- Exchange Online
- OneDrive
- SharePoint Online
- Microsoft 365 Groups
- Teams
- Project Online
- Viva Engage

Click on **"..."** on top of the service you wish to protect, and then
**Configure backup**:

![avepoint-m365-backup-scope.png](../images/avepoint-m365-backup-scope.png)

If you wish to enable backing up this specific service, toggle
**Back up [Service Name]** to on.

### Backup scope

Options will appear to set the scope of the backups, in other words, configuring 
_which_ objects from the service to back up. 
If you intend to protect everything, 
leave **All objects in existing and further containers** as selected.

### Frequency

You can configure how frequently backups are made by clicking on **Frequency**.

![avepoint-m365-backup-schedule.png](../images/avepoint-m365-backup-schedule.png)

Set the number of backups per day, and then set which time(s) during the day 
the backup jobs for this service should run.

Once done, click **Save**.

Reports
---------

### Subscription consumption

A subscription has a limit on the number of user seats which depends on your 
contract. To see this number and how many of them are in use, visit 
**Reporting -> Subscription consumption**.

If you wish to increase the limit, contact [Support](../../service/support.md), 
and we will help you do so.

### Job analytics

To get an overview of how the most recent backup jobs have gone, you can 
visit **Reporting -> Job analytics**.

![avepoint-m365-job-analytics.png](../images/avepoint-m365-job-analytics.png)

### Job monitoring

For more detailed information about every backup or recovery job, visit
**Job monitor**.

To generate a detailed report, click on **"..."** next to the job, and then 
click **Generate report**. Once it is available, the **Generate report** will
turn into a download button.

### Audit log

The AvePoint portal has an audit log where sign-ins and administrative 
operations are recorded.
To see the audit log, visit **Reporting -> System auditor**.

The log can be exported by clicking the **Export** button. You will be asked to
specify a time interval to export from the log. The maximum is 1 year.


Restore
---------


Data management
------------------

