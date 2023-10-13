Cloutility REST API
=====================
The Cloutility portal has a REST API that can be used to programmatically 
perform Create, Retrieve, Update and Delete (CRUD) operations with various 
_resources_.

This document will describe the APIs used to manage two resource 
types, Consumption Units and Backup Nodes. However, doing so will require us 
to also document all the dependencies (more resources). This is necessary to 
perform operations on the resources that we are actually interested in.

Before talking about resources, we need to understand how
authentication on Cloutility is done.

Authentication
---------------
Cloutility authentication is based on the OAuth v2 protocol. The way this 
works is that we want an _access token_ that corresponds to our user account.
Once we have this access token, we can perform any operations that our 
account has permissions to do!

### Generating a Client ID

To get an access token, you need to provide a client ID. This identifies 
your app. A client ID can be generated in the Cloutility portal by clicking on 
Settings (cogwheel in the top-right corner) -> API access -> Add. You will 
be asked to provide an app name, an origin and a choice whether to 
allow token refreshing or not. The origin should be a URL, it is 
relevant because the origin must be sent with every API call, or else the 
call will fail.

This step should only be done once for every app you have that utilizes the 
API. Once you have a client ID, it can be embedded into the app and reused.

### Requesting an Access Token
Requesting an access token is done using the following HTTP route.
```
[POST] /v1/oauth
- Request Headers:
    * Origin: {client_origin}
- Request Body: PasswordGrant
- Response Body: AccessToken
```

The structure of the **PasswordGrant** HTTP request body is described below.

```
client_id={client_id}
&grant_type=password
&username={username}
&password={password}
```
_The HTTP request body should be on one line, but is split here into several 
lines for clarity._ 

The **grant_type** should always be the same. It should be set to the 
password [OAuth2 Grant Type](https://oauth.net/2/grant-types/). You have to specify the client_id, username and the password.

Once you have made the HTTP request, you should get an HTTP response with an 
**AccessToken** body. Its structure is as follows.
```json
{
  "access_token": string,
  "token_type": "bearer",
  "expires_in": 299,
  "refresh_token": string
}
```

Do you see **access_token** above? That is what you want.

The **token_type** is always the same, it can be ignored. The **expires_in** 
tells us when the access token expires, in Cloutility it is always ~5 
minutes. In most situations this should give us plenty of time to execute a 
program that utilizes these APIs. If we need more time, we can use the 
**refresh_token** to get a new access token. How this is done is described 
under the Refresh Access Token section.

### How to Use an Access Token

Let us try out the `GET /v1/fullVersion` API endpoint as an example. It is 
used 
to get the full version of the Cloutility API.

```
[GET] /v1/fullVersion
- Request Headers:
    * Authorization: Bearer {access_token}
    * Origin: {client_origin}
- Response Body: string
```

The response should be something like:

```
"1.0.4480.0"
```

### Refreshing an Access Token
If you don't need an access token for longer than 5 minutes, then you may 
ignore this section. If you do, then make an HTTP POST request to 
`/v1/oauth` as you did before, but as an authenticated user, and instead send a 
**RefreshTokenGrant** request body. The body structure is as follows.

```
client_id=ba413598-d11d-48e0-9a25-68d5929b260c
&grant_type=refresh_token
&refresh_token={your_refresh_token}
```
_Again, this is written on multiple lines for clarity. Everything should be on 
one line._

The placeholder **your_refresh_token** is replaced with the refresh token 
that you got when you first authenticated yourself, see **AccessToken** in 
the Requesting an Access Token section above. This refresh token will always 
be the same.

### Full Python Example Program

In this example we authenticate, and then call the `/v1/fullVersion` using 
the `requests` module. To install this module, run `python3 -m pip install 
requests`.

```python
import requests

# Change these
USERNAME = "cloutility username"
PASSWORD = "cloutility password"
CLIENT_ID = "your client ID"
CLIENT_ORIGIN = "your client origin"

# Don't change this
CLOUTILITY_API_URL = "https://portal-api.backup.sto2.safedc.net/v1/"

# Step 1: Get an access token
response = requests.post(
    url=CLOUTILITY_API_URL + "oauth",
    headers={
        "Origin": CLIENT_ORIGIN
    },
    data={
        "client_id": CLIENT_ID,
        "grant_type": "password",
        "username": USERNAME,
        "password": PASSWORD
    }
)

if response.status_code == 200:
    response_body = response.json()
    access_token = response_body["access_token"]
    refresh_token = response_body["refresh_token"]
    expires_in = response_body["expires_in"]
    print(f"Got access token! Expires in {expires_in} seconds.")
else:
    print("Authentication failed.")
    exit(1)

# Step 2: Make an API call
response = requests.get(
    url=CLOUTILITY_API_URL + "fullVersion",
    headers={
        "Authorization": "Bearer " + access_token,
        "Origin": CLIENT_ORIGIN
    }
)

if response.status_code == 200:
    print("API call successful!")
    print("API full version is:", response.json())
else:
    print("Failed to perform API call.")
    exit(1)

# Step 3: You can reuse the same access_token for about 5 minutes...
# If you need to renew the access token, check out step 4.
...

# Step 4: Refresh the access token by using refresh_token
response = requests.post(
    url=CLOUTILITY_API_URL + "oauth",
    headers={
        "Authorization": "Bearer " + access_token,
        "Origin": CLIENT_ORIGIN
    },
    data={
        "client_id": CLIENT_ID,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }
)

if response.status_code == 200:
    response_body = response.json()
    access_token = response_body["access_token"]  # New access token
    expires_in = response_body["expires_in"]
    print(f"Refreshed access token. Expires in {expires_in} seconds.")
else:
    print("Failed to refresh access token.")
    exit(1)
```

Define the first four constants, and run the program. The output should be something like:

```
Got access token! Expires in 299 seconds.
API call successful!
API full version is: 1.0.4480.0
Refreshed access token. Expires in 299 seconds.
```

API Endpoints
----------------
For all listed API calls/operations, the HTTP request headers Origin and 
Authorization are obligatory. However, they will be omitted from the document for brevity.

### Business units
```
[GET] /v1/bunits
- Response Body: BusinessUnitSummary
[GET] /v1/bunits/{bunit_id}
- Response Body: BusinessUnitSummary
[GET] /v1/bunits/{parent_bunit_id}/bunits
- Response Body: BusinessUnitURL
```

```
[POST] /v1/bunits/{bunit_id}/bunits
- Request Body: BusinessUnitCreationRequest
- Response Body: BusinessUnit
```

```
[PUT] /v1/bunits/{bunit_id}
- Request Body: BusinessUnit
- Response Body: BusinessUnit
```

```
[DELETE] /v1/bunits/{bunit_id}?deleteChildren={true/false}&deleteConsumers={true/false}&deleteServers={true/false}
- Request Body: BusinessUnit
```

### Backup servers
Actually, there is only _one_ backup server that we will consider. That is the default one.
```
[GET] /v1/bunits/{bunit_id}/defaultserver
- Response Body: BackupServer
[GET] /v1/bunits/{bunit_id}/defaultserver/domains
- Response Body: PolicyDomainList
[GET] /v1/bunits/{bunit_id}/defaultserver/clientoptionsets
- Response Body: ClientOptionSetList
```

### Backup node operating systems and types
When creating or modifying backup nodes, we have to specify an operating system and node type. Therefore, it is necessary to know how to retrieve `BackupNodeOperatingSystem` and `BackupNodeType` resources.

```
[GET] /v1/nodeoperatingsystems
- Response Body: BackupNodeOperatingSystemList
[GET] /v1/nodeoperatingsystems/{os_id}
- Response Body: BackupNodeOperatingSystem
[GET] /v1/nodetypes
- Response Body: BackupNodeTypeList
[GET] /v1/nodetypes/{nodetype_id}
- Response Body: BackupNodeType
```

### Consumption units
```
[GET] /v1/bunits/{bunit_id}/consumers
- Response Body: ConsumerList
[GET] /v1/bunits/{bunit_id}/consumers/{consumer_id}
- Response Body: Consumer
```

```
[POST] /v1/bunits/{bunit_id}/consumers
- Request Body: ConsumerCreationRequest
- Response Body: Consumer
```

```
[PUT] /v1/bunits/{bunit_id}/consumers/{consumer_id}
- Request Body: Consumer
- Response Body: Consumer
```

```
[DELETE] /v1/bunits/{bunit_id}/consumers/{consumer_id}?deleteAssociations={true/false}&deletionComment={comment}
- Request Body: Consumer
```

### Backup nodes
```
[GET] /v1/bunits/{bunit_id}/consumers/{consumer_id}/node
- Response Body: BackupNode
```

```
[POST] /v1/bunits/{bunit_id}/consumers/{consumer_id}/node
- Request Body: BackupNodeCreationRequest
- Response Body: BackupNode
```

```
[PUT] /v1/bunits/{bunit_id}/consumers/{consumer_id}/node
- Request Body: BackupNode
- Response Body: BackupNode
```

_This will remove the entire consumption unit:_
```
[DELETE] /v1/bunits/{bunit_id}/consumers/{consumer_id}/node
- Request Body: BackupNode
```

#### Activate
To activate the backup node, use the following endpoint:
```
[GET] /v1/bunits/{bunit_id}/consumers/{consumer_id}/node/activate?tsmName={tsm_node_name}
- Response Body: string
```

#### Filespaces
You can use the following endpoint to manage filespaces of a node. 

```
[GET] /v1/bunits/{bunit_id}/consumers/{consumer_id}/node/filespaces?tsmSync={true/false}
- Response Body: FilespaceList
```
Setting tsmSync to `true` will manually sync Cloutility with the backup server before returning the filespaces. Setting it to `false` will make the call faster.

#### Setting proxy nodes
You can allow a node to act as another node, in other words, making a node a _proxy agent_ for a _proxy target_. The proxy agent can then, for example, restore the proxy target's files. 

With the API, this relationship can be established from either side.

To find possible nodes to establish such a relationship with, you can use:
```
[GET] /v1/bunits/{bunit_id}/consumers/{consumer_id}/node/possibleproxynodes
- Response Body: BackupNodeList
```

To establish a proxy relationship, you may use either one of these endpoints:
```
[POST] /v1/bunits/{bunit_id}/consumers/{target_consumer_id}/node/proxyagents?proxyAgentId={proxy_consumer_id}
- Request Body: BackupNode
- Response Body: BackupNode
[POST] /v1/bunits/{bunit_id}/consumers/{proxy_consumer_id}/node/proxytargets?proxyTargetId={target_consumer_id}
- Request Body: BackupNode
- Response Body: BackupNode
```

To severe a proxy relationship, you may use either one of these endpoints:
```
[DELETE] /v1/bunits/{bunit_id}/consumers/{target_consumer_id}/node/proxyagents/{proxy_consumer_id}
- Request Body: BackupNode
[DELETE] /v1/bunits/{bunit_id}/consumers/{proxy_consumer_id}/node/proxytargets/{target_consumer_id}
- Request Body: BackupNode
```

Resources
-------------
The documentation is divided into one section for every resource, with the 
resources whose CRUD operations having the lowest number of dependencies being 
listed first.

### APIEndpoint
```json
{
  "name": string,
  "method": string,
  "href": string
}
```

### TimeZone
```json
{
  "$type": string,
  "href": string,
  "actions": [APIEndpoint...],
  "name": string,
  "windowsId": string,
  "offset": integer,
  "id": integer,
  "createdDate": string
}
```

### DataSourceState
```json
{
  "id": integer,
  "name": string
}
```

### DataSourceType
```json
{
  "id": integer,
  "name": string
}
```

### BusinessUnitTag
```json
{
  "id": integer,
  "businessUnitId": integer,
  "text": string,
  "inheritable": boolean,
  "businessUnitCount": integer,
  "consumerCount": integer
}
```

### BusinessUnitURL
```json
{
  "$type": string  // optional
  "href": string,
  "total": integer,
  "offset": integer,  // optional
  "first": string,  // optional
  "items": [BusinessUnit...]
}
```

### BusinessUnitSummary
```json
{
  "id": integer,
  "parentId": integer,  // optional
  "name": string,
  "groupName": string,
  "reportRemotely": boolean,
  "businessUnits": [BusinessUnitSummary...],
  "tags": [BusinessUnitTag...],
  "invoiceDay": integer
}
```

### BusinessUnitParent
```json
{
  "consumers": [...],
  "tags": [BusinessUnitTag...],
  "id": integer,
  "name": string,
  "registrationNumber": string,
  "invoiceDay": integer,
  "createdDate": string,
  "useScheduleBindings": boolean,
  "supportResponsible": boolean,
  "storageLimit": integer,
  "transferLimit": integer,
  "nodeLimit": integer,
  "requiredApproversOfDeleteRequest": integer,
  "finalDeleteRequestApprover": boolean,
  "usersCanApproveOwnRequests": boolean,
  "billingStorageTypeId": integer,
  "reportRemotely": boolean,
  "passwordExpirationDays": integer,
  "domainFilter": [...],
  "clientOptionSetFilter": [...],
  "billingStorageType": integer
}
```

### BusinessUnit
A business unit.
```json
{
  "href": string,
  "parentBusinessUnit": BusinessUnitParent,
  "timeZone": TimeZone,
  "users": BusinessUnitURL,
  "addresses": BusinessUnitURL,
  "businessUnits": BusinessUnitURL, 
  "ancestors": BusinessUnitURL,  // optional
  "note": string,  // optional
  "domainFilter": [...],
  "clientOptionSetFilter": [...],
  "name": string,
  "supportResponsible": boolean,
  "registrationNumber": string,
  "invoiceDay": integer,
  "billingStorageTypeId": integer,
  "billingStorageType": integer,
  "useScheduleBindings": boolean,
  "consumers": [...],
  "storageLimit": integer,
  "transferLimit": integer,
  "nodeLimit": integer,
  "passwordExpirationDays": integer,
  "requiredApproversOfDeleteRequest": integer,
  "finalDeleteRequestApprover": boolean,
  "usersCanApproveOwnRequests": boolean,
  "reportRemotely": boolean,
  "tags": [BusinessUnitTag...],
  "id": integer,
  "createdDate": string
}
```

### BusinessUnitCreationRequest
```json
{
  "name": string,
  "registrationNumber": string,
  "timeZone": TimeZone
}
```

### BackupServer
```json
{
  "href": string,
  "id": integer,
  "name": string
}
```

### ClientOptionSet
```json
{
  "href": string,  // optional
  "name": string,
  "description": string,  // optional
  "id": integer,
  "createdDate": string
}
```

### ClientOptionSetList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [ClientOptionSet...]
}
```

### PolicyDomain
```json
{
  "href": string,  // optional
  "server": BackupServer,  // optional
  "name": string,
  "description": string,
  "backupRetention": integer,
  "archiveRetention": integer,
  "missingInTsm": boolean,
  "id": integer,
  "createdDate": string
}
```

### PolicyDomainList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [PolicyDomain...]
}
```

### BackupNodeType
```json
{
  "href": string,  // optional
  "id": integer,
  "name": string,
  "shortName": string,  // optional
  "createdDate": string
}
```

### BackupNodeTypeList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [BackupNodeType...]
}
```

### BackupNodeOperatingSystem
```json
{
  "href": string,  // optional
  "name": string,
  "shortName": string,
  "supportedNodeTypes": [BackupNodeType...],  // optional
  "id": integer,
  "createdDate": string
}
```

### BackupNodeOperatingSystemList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [BackupNodeOperatingSystem...]
}
```

### BackupNodePlatform
```json
{
  "name": string,
  "id": integer,
  "createdDate": string
}
```

### BackupNodeTsmClientVersion
```json
{
  "name": string,
  "id": integer,
  "createdDate": string
}
```

### BackupNodeOSVersion
```json
{
  "name": string,
  "id": integer,
  "createdDate": string
}
```

### BackupNodeSyncState
```json
{
  "name": string,
  "id": integer,
  "createdDate": string
}
```

### BackupNodeSessionSecurity
```json
{
  "id": integer,
  "name": string
}
```

### BackupNodeDataSourceType
```json
{
  "id": integer,
  "name": string
}
```

### BackupNodeDataSourceState
```json
{
  "id": integer,
  "name": string
}
```

### BackupNode
```json
{
  "href": string,
  "cpuCount": integer,
  "activatedDate": string,  // optional
  "locked": boolean,
  "operatingSystem": BackupNodeOperatingSystem,
  "type": BackupNodeType,
  "syncState": BackupNodeSyncState,
  "domain": PolicyDomain,
  "clientOptionSet": ClientOptionSet,
  "schedules": [...],
  "nodeSchedules": [...],
  "filespaces": [...],
  "events": [...],
  "unscheduledActivities": [...],
  "ticket": string,
  "retentionSets": [...],
  "activityLogs": [...],
  "proxyAgents": [...],
  "proxyTargets": [...],
  "nodeGroups": [...],
  "tsmName": string,
  "tsmNodeId": string,  // optional
  "tsmPassword": string,
  "contact": string,
  "platform": BackupNodePlatform,
  "tsmClientVersion": BackupNodeTsmClientVersion,
  "osLevel": BackupNodeOSVersion,
  "tcpName": string,
  "tcpAddress": string,
  "macAddress": string,  // optional
  "sessionSecurity": BackupNodeSessionSecurity,
  "hypervisor": string,  // optional
  "containsVmFilespaces": boolean,
  "lastAccessTime": string,  // optional
  "registeredTime": string,  // optional
  "decommissioned": boolean,
  "replicationState": boolean,
  "replicationMode": integer,
  "replicationServerPrimary": string,  // optional
  "replicationServerSecondary": string,  // optional
  "replicationServerSecondary2": string,  // optional
  "activityLogFilters": [...],
  "remoteActivities": [...],
  "name": string,
  "dataSourceState": BackupNodeDataSourceState,
  "dataSourceType": BackupNodeDataSourceType,
  "consumer": Consumer,
  "id": integer,
  "createdDate": string
}
```

### BackupNodeList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [BackupNode...]
}
```


### BackupNodeCreationRequest
Used to create Consumption Unit Backup Nodes.
```json
{
  "clientOptionSet": ClientOptionSet,
  "contact": string,  // Contact information
  "cpuCount": integer,
  "domain": PolicyDomain,
  "operatingSystem": BackupNodeOperatingSystem,
  "server": BackupServer,
  "type": BackupNodeType
}
```

### StoragePool
```json
{
  "name": string,
  "type": string,
  "totalStorageMegaBytes": float,
  "freeStorageMegaBytes": float,
  "maxProcesses": integer,
  "id": integer,
  "createdDate": string
}
```

### FilespaceOccupancyType
```json
{
  "id": integer,
  "name": string,
  "createdDate": string
}
```

### FilespaceOccupancy
```json
{
  "storagePool": StoragePool,
  "files": integer,
  "logicalMegaBytes": float,
  "logicalMegaBytesCorrected": float,
  "dedupStatNeeded": boolean,
  "dedupStatUpToDate": boolean,
  "physicalMegaBytes": float,
  "reportingMegaBytes": float,
  "storageMegaBytes": float,
  "type": FilespaceOccupancyType,
  "id": integer,
  "createdDate": string
}
```

### Filespace
```json
{
  "href": string,
  "tsmFilespaceId": string,
  "type": string,
  "capacityMegaBytes": float,
  "frontEndCapacityMegaBytes": integer,
  "percentageUtilized": float,
  "lastBackupStart": string,
  "lastBackupEnd": string,
  "occupancies": [FilespaceOccupancy...],
  "dedupStats": [...],
  "activities": [...],
  "events": [...],
  "node": BackupNode,
  "retentionSets": [...],
  "name": string,
  "dataSourceState": BackupNodeDataSourceState,
  "id": integer,
  "createdDate": string
}
```

### FilespaceList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Filespace...]
}
```

### Consumer
```json
{
  "dataSourceType": DataSourceType,
  "dataSourceIsPotentialParent": boolean,
  "dataSourceState": DataSourceState,
  "latestRestorePoint": string,
  "name": string,
  "billingStartDate": string,
  "businessUnit": BusinessUnit,
  "comments": [...],
  "note": string,  // optional
  "externalReference": string,  // optional
  "node": BackupNode,
  "limitHighStorage": integer,
  "allowNoActivity": boolean,
  "tags": [BusinessUnitTag...],
  "jobs": [],
  "id": integer,
  "createdDate": string,
  "billingEndDate": boolean,
  "scheduledDeletionDate": boolean
}
```

### ConsumerList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Consumer...]
}
```

### ConsumerCreationRequest
Used to create Consumption Units.
```json
{
  "name": string,
  "billingStartDate": string
}
```



