# Installing for MSSQL

!!! warning "Disclaimer"
     This instruction is for a single standalone, non-clustered, SQL server with one SQL server instance.  There can be several databases within this single instance and all are backed up. If you have a more complex setup such as

    * Clustered SQL servers
    * Many SQL server instances

    then these instructions aren't enough.

    **Prerequisite 1**: Windows PowerShell version 3 has to be installed prior to this installation.

    **Prerequisite 2**: Installation and configuration of the file client, a.k.a. baclient has to be completed prior to this installation.  Among other things the file client installs/configures the SSL certificates and the TSM API.

## Step 1 — Download

Download the TDP for SQL media [here](https://archive.service.safedc.net/tsm/db/mssql/TSM_DB_7.1.1_DP_MS_SQL_ML.exe) and save it in a local directory.  In this example `C:\TSM-media` is used. Execute the `.exe` file and it will unpack the files.

## Step 2 — Support files

Download the support files to the same directory.

- https://archive.service.safedc.net/tsm/db/mssql/db_full.bat
- https://archive.service.safedc.net/tsm/db/mssql/db_incr.bat
- https://archive.service.safedc.net/tsm/db/mssql/install_sched.bat

## Step 3 — Installation

Install the TDP for SQL the following commands.

!!! note
    There is a risk that the last command reboots the server.  The reboot is caused by the prerequisite packages from Microsoft.  A reboot can often be avoided by manually installing the prerequisite packages before installing the TDP for SQL.  

    The prerequisite packages can be found in

    `…\TSMSQL_WIN\fcm\x64\mmc\4110\enu\ISSetupPrerequisites` and

    `…\TSMSQL_WIN\fcm\x64\sql\7110\enu\ISSetupPrerequisites`

Replace x64 in the path with x86 if this is a 32-bit client

    C:\TSM-media\TSMSQL_WIN\fcm\x64\mmc\4110\enu\setup.exe

Use default answers on all questions.

    C:\TSM-media\TSMSQL_WIN\fcm\x64\sql\7110\enu\setup.exe

Use default answers on all questions.

## Step 4 — Script files

Copy the script files to the baclient directory.

```shell
copy db_full.bat "c:\program files\tivoli\tsm\baclient"
copy db_incr.bat "c:\program files\tivoli\tsm\baclient"
```

The name and location of these files are important, since they are scheduled from the TSM server. The content of the files can be adapted to fit local needs.  For example the number of days to keep log files is set to 30 as default, but can be increased/reduced.

## Step 5 — Create node

Request a new tsm nodename from the API (or web portal).  Make sure to specify `application=mssql` when doing this.   This option can only be set during creation.  If you forget this option you have to delete the node and create a new.
The SQL backup is always done using a separate TSM nodename.

## Step 6 — Configuration file

Download the configuration file from the API.   Unzip the file and a `dsm.opt` will appear.
Edit the `dsm.opt` and add the following two lines (In the next release this 
will be done by default — until then do it manually)

```shell
SCHEDLOGNAME  "C:\Program Files\tivoli\tsm\TDPSql\dsmsched.log"
ERRORLOGNAME  "C:\Program Files\tivoli\tsm\TDPSql\dsmerror.log"
```

Save the file and copy it to `C:\Program Files\tivoli\tsm\TDPSql\`

```shell
copy dsm.opt  "c:\program files\tivoli\tsm\TDPsql"
```

!!! Note  
    The configuration files for the file client go into the baclient directory and the configuration files for TDP SQL are in the TDPsql directory.  Now you may wonder why the `db_full.bat` and `db_incr.bat` went into the baclient dir.  This is because the bat files are executed by the baclient, but inside the bat-files the TDP SQL is called.

## Step 7 — Services for TDP SQL

Install the services needed for the TDP SQL.  This is done using the script `install_sql_sched.bat` The parameters are:

```shell
%1 TSM NODENAME for the SQL node
%2 TSM NODE PASSWORD for the SQL node
%3 WINDOWS ACCOUNT that should run the service.  Need access to SQL server
%4 WINDOWS ACCOUNT PASSWORD
%5 WINDOWS ACCOUNT DOMAIN – domain name or “.”
```

!!! note "Example"

    ```shell
    install_sched XXXYUUVJWDWG_DB PaSSvd Administrator qwerty "."
    ```

In many cases, the TSM scheduler has to be run as a local/domain user. 
This is depending on the security settings in SQL. 
Make sure to specify an account that can access SQL.

## Step 8 - Associate node

Associate the TDP node with one or more schedules in the TSM server – using the API or the web portal.

## Step 9 - Exclude DB files

(Optional) Exclude the database files from the file backup.  Since we are 
backing up the SQL server using the TDP for SQL agent it is unnecessary to back up the same files with the file client.

Add the correct `exclude` lines to `C:\program files\tivoli\tsm\baclient\dsm.opt.`   

!!! note "Example"
    ```shell
    Exclude *:\...\MSSQL\...\*.MDF
    Exclude *:\...\MSSQL\...\*.NDF
    Exclude *:\...\MSSQL\...\*.LDF
    ```

!!! note
    Be careful when specifying these excludes. 
    You might exclude more that you intend to do. The example above excludes 
all MDF, NDF and LDF files that are in directory path with MSSQL it in.  In 
a “standard” setup, this is OK, but not if you have several instances of SQL server and only back up one using the TDP for SQL. (Instance 1 backed up with TDP and Instance 2 stopped and backed up by the file client).

!!! info "A short description of the exclude syntax"
    ```
    “*”    matches zero or more characters in a file name or disk name.
    “\…\”  match zero or more directories.
    "*”    does not apply to directories.
    ```

## Manual backup

Manual backup and restores can be done using the GUI called **DP for SQL Management Console**.

The scripts `db_full.bat` and `db_incr.bat` can also be used to start attendant backups manually.

## More information

The complete manual can be found [here](https://www.ibm.com/docs/en/SSGSG7_7.1.0/com.ibm.itsm.db.sql.doc/b_dp_sql_iuguide.pdf).
