# Getting S3 api credentials 

In the new platform all compute accounts comes with credentials to the S3 storage solution. In order to use the S3 service on needs to download the credentials from the platform through the Compute portal.

1. Log into to you compute account and click "API Access" up in the left corner.
2. Then click on the button "Download OpenStack RC file" and then pick EC2 Credentials in the dropdown.

![image](../../images/s3-api-creds.png)

3. You will now download a zip file with the credentials Unpack the file and open the file ec2.sh in a texteditor.

![image](../../images/s3-api-creds-file.png)

4. The rows of interest is circled in the picture: EC2_ACCESS_KEY, EC2_SECRET_KEY and S3_URL.
5. Open up your favorite S3-client and copy the values from the file into the connection dialog of the S3-client:

![image](../../images/s3-client-dialog.png)

You should now have access to you S3 account.

