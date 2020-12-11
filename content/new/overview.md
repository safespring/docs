# Overview 

The different tenants in OpenStack is divided into domains and projects. One domain usually has the form “company.com” and may have several projects underneath. The projects usually has a name ending on the same thing as the domain it belongs to, so typically “project1.company.com” and “project2.company.com”. A project is an administrative entity in OpenStack and can be seen as a separate environment. A very common setup is to have different projects for the test and production environments, like “test.company.com” and “prod.company.com”. This way common resources can be shared between the different instances (virtual machines) but kept apart between the different environments.

When you log into the platform you will be greated with the “Overview”-screen were you can see how much resources you currently is using in the project.


![image](../../images/np-overview.png)

The pie charts show how much of the resources compared to the set quota. 

## Instances
Instances means virtual machine in OpenStack. As you can see two instances out of 10 possible (with the current quota settings) is running in the project.
## VCPUs
VCPU stands for Virtual CPU and translates to processor cores in Safesprings platform. In this example 8 out of 20 are running in the project.
## RAM
RAM is exactly what you would expect it to be: memory allocated to the instances in the project. 
## Volumes (NOT SUPPORTED YET)
Volumes corresponds to the number of volumes created in the project. Storage in OpenStack comes in two types: ephemeral and persistent. Ephemeral storage is created with the instance and has the same lifetime as the instance. This means that ephemeral storage is removed automatically when the instance is removed. Persistent storage can be created independently of instances and attached and detached to instances. This type of storage is not tied to a specific instance and is created and deleted separately. Volumes is the notion for persistent storage in OpenStack and hence can be created in a dialogue separate from the instance creation.
## Volume Snapshots (NOT SUPPORTED YET)
It is possible to take snapshots of a volume. This pie chart shows how many such snapshots that are stored currently. 
## Volumes Storage (NOT SUPPORTED YET)
Here you can see how much of the current storage quota that is used in the project. 
## Security Groups and Security Group Rules
Security Groups is the built-in firewall functionality in OpenStack. One Security Groups is a set of Security Group Rules with each of them corresponding to a specific port and allowed source IP, IP network of other Security Group. 
## Networks
With the new networking engine in Safesprings setup of OpenStack, Calico, there is not possible to create networks which is why this is not applicable in the platform. 

