Command Line Tool
===================

If you need to automate management of backup nodes, there is an easy-to-use 
command line tool called <a href="https://github.com/safespring-community/cloutility-api-client" target="_blank">cloutility-api-client</a> that you can use.

**Features:**

- Retrieve [business units](../howto/business-units.md) (ID, name, group).
- Retrieve client option sets (ID, name).
- Retrieve policy domains (ID, name, description).
- Retrieve client OS types (ID, name, short name).
- Create consumption units/backup nodes.
- Retrieve consumption units/backup nodes (ID, name, creation date).
- Delete consumption units/backup nodes.


This is what the main help page looks like, showing its various options:
```
user@workstation:~$ cloutility-api-client                     
cloutility-api-client is used for managing resources in
Safespring BaaS 2.0 using the Cloutility REST API.

Usage:
  cloutility-api-client [command]

Available Commands:
  bunit           bunit subcommand
  clientoptionset The clientoptionset subcommand
  completion      Generate the autocompletion script for the specified shell
  consumer        consumer subcommand
  domain          The domain subcommand
  help            Help about any command
  ostype          ostype subcommand

Flags:
      --config string   config file (default is ./cloutility-api-client.yaml)
  -h, --help            help for cloutility-api-client

Use "cloutility-api-client [command] --help" for more information about a command.
```

How to use
-----------

### Step 1: Generate a Client ID

Any meaningful interaction with the Cloutility REST API requires a Client ID. 
This can be easily generated by: 

1. Logging in to <a href="https://portal.backup.sto2.safedc.net/" target="_blank">Cloutility</a>.
2. Go to the settings page (the cogwheel in the top-right corner).
3. Click on API access.
4. Add your client by specifying a name (e.g. "cloutility-api-client") and an origin URL.
5. You will have a new entry in the list. Make note of the new client ID, you will need it when configuring the tool.

### Step 2: Download, configure and run the tool

1. Download the latest version from [here](https://github.com/safespring-community/cloutility-api-client/releases). There are binaries for Linux, Windows and macOS. On Linux and macOS, placing the binary in `/usr/local/bin/` makes the tool globally accessible.
   ```shell
   sudo mv cloutility-api-client /usr/local/bin/
   sudo chown root:root /usr/local/bin/cloutility-api-client
   ```
2. Create a file called `cloutility-api-client.yaml`:
    ```yaml
    ---
    url: "https://portal-api.backup.sto2.safedc.net"
    client_id: "the client ID from the safespring backup portal"
    username: "username"
    password: "password"
    client_name: "cloutility-api-client"
    client_origin: https://www.yourcompany.com
    ```
3. Run the tool while having the same working directory as the configuration file. On Linux or macOS this may look something like this:
   ```
   user@workstation:/path/to/config$ ls
   cloutility-api-client.yaml
   user@workstation:/path/to/config$ cloutility-api-client
   cloutility-api-client is used for managing resources in
   Safespring BaaS 2.0 using the Cloutility REST API.
   
   Usage:
     cloutility-api-client [command]
   ...
   ```

!!! note
    To use a configuration file that has a non-standard name or is not in the working directory of the tool; you can use the `--config /path/to/config.yaml` flag.

Using the API directly
-----------------------
If this tool is not enough, and you need to access more of Cloutility's functionality, you can have a more complete interface by having your software interact with the Cloutility API directly.

How to use Cloutility's REST API is described in detail [here](rest-api.md).


