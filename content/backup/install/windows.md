# Microsoft Windows installation (64-bit)

## Manual installation

_This document describes how to **manually** install install IBM Spectrum Protect Backup-Archive Client on Windows Windows (64-bit)._

Required files:

- [IBM Spectrum Protect Backup-Archive Client](https://public.dhe.ibm.com/storage/tivoli-storage-management/patches/client/v8r1/Windows/x64/)
- [SafeDC Root CA installer](windows-ca-installer) (Right-click and Save)
- [SafeDC Default Configuration file dsm.opt](windows-dsm-opt) (Right-click and Save)

### Installation and Configuration

#### Installation

1. Download the required files according to above into a temporary folder
1. Run `8.x.x.x-TIV-TSMBAC-WinX64.exe` to extract all installations files.
1. Open the `TSMClient` Installation directory that just get created and run `spinstall.exe` and accept the UAC pop-up that comes up, "Setup Launcher Unicode".. ![UAC Pop-up](../images/UAC-popup.png) Follow the instructions on the screen, and if this is a new installation you maybe need to install a few requirements.

    ![Spectrum Protect Backup-Archive Client - InstallShield Wizard](../images/SPBAC_ISWizard.png)

    1. The installation process could sometimes require a reboot, due to the installation of a couple of VC redistributables.
    1. If a reboot is unpleasant, at the above decision point, jump to the _"Circumvent reboot during install"_ section below.
    1. Resume the installation, choose Typical installation.
    1. After installation, answer 'No' to the reboot question.

#### Install Safespring Root Certificate

1. In a command prompt with elevated privileges, execute the "Safespring Root CA installer" to install the Safespring BaaS CA into the GSK (IBM crypto kit) trust database.


    ```sh
    SafeDC-Net-Root-CA-tsm12-win64.bat
    ```

![Install SafeDC Root CA](../images/SPBAC-Root-CA.png)

#### Create Configuration File

1. Retrieve client node configuration and password from the [Safespring Backup Portal](baas-portal), and edit the `dsm.opt.sample`, copy the *Setup Information* from the portal and paste it in to `dsm.opt.sample` file and save that file in `C:\Program Files\Tivoli\TSM\baclient`

![Copy the Backup Configuration information](../images/baas-portal-consumption-unit-setup-infomartion.png)

Paste the information to the `dsm.opt.sample` file between the `*** Copy and Paste Information from Safespring Backup Portal ***` sections

![dsm.opt sample file](../images/SPBAC-dsm-opt.png)

Save the file as `dsm.opt` in the Backup-Archive Directory e.g `C:\Program Files\Tivoli\TSM\Baclient\dsm.opt`
    
1. Test the connection, easiest way is either via GUI or CLI.
    1. **Login via Command-Line**

    Start a Command-Line window in *Administrator Mode* and change to the Backup-Archive Client directory e.g `cd C:\Program Files\Tivoli\TSM\Baclient` 
    Start the `dsmc.exe` and it will now ask you to confirm the *User ID* that is the same as your node name, and copy and paste the password from the [Safespring Backup Portal](baas-portal)

    ![Copy Password from Safespring Backup Portal](../images/baas-portal-consumption-unit-setup-infomartion.png) ![Paste Password to the Password Feild](../images/SPBAC-cli-login.png)

    Run `quit` to exit Spectrum Protect Backup-Archive Client CLI.

    1. **Login via GUI**

    The GUI icon can you find in the start-menu, search for Backup-Archive GUI 

    ![GUI via Start-Menu](../images/SPBAC-startmenu-GUI.png)

    When the Backup-Archive GUI Starts it will ask for Node Admin ID and Password.
    This can be copy and pasted from the the [Safespring Backup Portal](baas-portal) and paste it to the Password feild.

    ![Copy Password from Safespring Backup Portal](../images/baas-portal-consumption-unit-setup-infomartion.png) ![Paste Password to Password Feild](../images/SPBAC-GUI-login.png)

    If the application starts it was succesfully login and saved the password encrypted for future use.

#### Schedule Daily Backups

1. IBM Spectrum Protect Backup-Archive Client are polling the backup server on regular basis to see when it will backup your data next time.
To assign a predefined schedule, open [Safespring Backup Portal](baas-portal) and go to the _consumption unit_ you want to define an schedule too and click on _schedule_ 
![Consumption Unit Schedule](../images/baas-portal-consumption-unit-schedule.png)

Here can you schedule the backup for your consumption unit.

1. Setup IBM Spectrum Protect Backup-Archive Client schedule polling.
    1. **Setup schedule via Command-Line**

     Start a Command-Line window in _Administrator Mode_ and change to the Backup-Archive Client directory e.g `cd C:\Program Files\Tivoli\TSM\Baclient`.
     Run following commands to setup your schedule.

     ```sh
    dsmcutil install scheduler /name:"TSM Client Scheduler" /node:<NODENAME> /optfile:"<PATH TO DSM.OPT>" /password:<TSM PASSWORD> /autostart:no /startnow:no
    
    dsmcutil install cad /name:"TSM Client Acceptor" /node:<NODENAME> /password:<TSM PASSWORD> /optfile:"<PATH TO DSM.OPT>" /autostart:yes /startnow:no
    
    dsmcutil update cad /name:"TSM Client Acceptor" /cadschedname:"TSM Client Scheduler"

    net start "TSM Client Acceptor"
     ```

    1. **Setup schedule via GUI**

    The GUI icon can you find in the start-menu, search for Backup-Archive GUI 

    ![GUI via Start-Menu](../images/SPBAC-startmenu-GUI.png)

    Click on *Utilities -> Setup Wizard* to start the Configuraton Wizard.

    ![Start the Schedule Setup Wizard](../images//SPBAC-GUI-Schedule-wizard-mainmenu.png)

    A wizard will help you to go though step-by-step to setup the schedule.

    ![Schedule Wizard Guide](../images/SPBAC-GUI-Schedule-wizard-start.png)

    Confirm that you want to *Install a new or additional scheduler*, if *Update ...* and *Remove ...* is enables, that means you already have a earlier Spectrum Protect Schedule configured. 

    ![Install a new or addition scheduler](../images/SPBAC-GUI-Schedule-wizard-new-schedule.png)

    Make sure you enable *[X] Use the client acceptor to manage the scheduler* 

    ![Enable Client Acceptor to Manage Scheduler](../images/SPBAC-GUI-Schedule-wizard-enable-client-acceptor.png)

    Confirm the name of the *TSM Client Acceptor* and press *Next*

    ![Client Acceptor Configuration File Path](../images/SPBAC-GUI-Client-Acceptor-Config-file.png)

    Confirm the Client Acceptor TCP Port, this port doesn't need to be expose externally.

    ![Client Acceptor TCP Port, default is 1581](../images/SPBAC-GUI-Client-Acceptor-TCP-port.png)

    Insert the node password, the password can be copy from the [Safespring Backup Portal](baas-portal).

    ![Insert Node name and Password](../images/SPBAC-GUI-Client-Acceptor-node-n-pwd.png)

    Click on _(o) Automatic when Windows boots_ to automatic start the TSM Client Acceptor Services

    ![Client Acceptor Services](../images/SPBAC-GUI-Client-Acceptor-services.png)

    Confirm the location where you want to save the TSM Schedule and Error Logs, and it you want to log to Windows Event Logger

    ![TSM Client Logs Files](../images/SPBAC-GUI-Client-Acceptor-logfiles.png)

    Click on _(o) Yes_ to start the TSM Client Acceptor when the wizard are done.

    ![Start TSM Client Acceptor after wizard](../images/SPBAC-GUI-Schedule-wizard-schedule-services.png)

    Confirm the configuration before Setup Wizard will create the services.

    ![Confirm the Schedule Services](../images/SPBAC-GUI-Schedule-wizard-schedule-confirm.png)

    The Configuration are now done, click _Finish_ to quit the wizard.

    ![Finish the configuration](../images/SPBAC-GUI-Schedule-wizard-schedule-finish.png)

### Finish

Basic installation for Backup-Archive Client is now finish, if you need to setup a Online agent for e.g Microsoft SQL, Orable Database or any other application, you can continue with that installation.

[baas-portal]:https://portal.backup.sto2.safedc.net/
[windows-ca-installer]:https://raw.githubusercontent.com/safespring/cloud-BaaS/master/pki/SafeDC-Net-Root-CA-win64.bat
[windows-dsm-opt]:https://raw.githubusercontent.com/safespring/cloud-BaaS/master/windows/dsm.opt.sample