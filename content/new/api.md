# Access the Compute service API on the new platform

## Requirements

For security reasons access to the API endpoints in the Compute service is
blocked by default.  

In order to reach to the API endpoints your public IP needs to be in the allow
list on our load balancers. 

The recommended setup is to create an instance in a Compute project and use this
as a jumphost for all project members who need API access. This is more secure
and more manageable than allowing single (and often dynamic) public IPs.

Create the instance, take note of its assigned public IPv4 address, then create
a support ticket at support@safespring.com with this address attached.  

If you for some reason cannot create a dedicated jumphost, we will allow adding
single addresses or smaller subnets by request. 
