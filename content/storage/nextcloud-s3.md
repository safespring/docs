# Installing Nextcloud

There are a number of instructions on how to install Nextcloud.

Safespring recommend the instructions here: https://websiteforstudents.com/install-nextcloud-on-ubuntu-17-04-17-10-with-apache2-mariadb-and-php/

Do not forget to secure your installation with Let's Encrypt.
The most reliable instructions to install certbot can be found here: https://certbot.eff.org/docs/install.html

## Setting up Nextcloud with S3

Start with going to Settings under the account menu up in the right corner.

### 1. Open the external storage panel
In the Settings view - click "External Storages" under "Administration":

![External storage](/images/nextcloud-s3-1.png)

### 2. Add storage type
Click the "Add storage" drop-down and choose "Amazon S3".

![Add dropdown](/images/nextcloud-s3-2.png)

### 3. Additional settings
In the settings dialogue fill in name, bucket name (which you need to create beforehand), Storage-URL, portnumber (443). You do not need to fill anything into the "Region" field. Check "Enable SSL" and "Enable Path Style" and at last enter your `access key` and `secret key`.

![Setting dialogue](/images/nextcloud-s3-3.png)

### 4. Accept settings
When all the fields are filled in click the tick box symbol at the very right and make sure that the symbol in the dialogue in front Name-field turns green (see image "Accept settings")

![Accept settings](/images/nextcloud-s3-4.png)

## Things to know
The quota setting that you can set per group or user in Nextcloud does not apply to files put in the S3 external storage.

You can also in the setting dialogue restrict which users or groups that should have access to the external storage.
