Audit logging
=============

We are working on implementing audit logging of user actions in our platforms.

Currently this is what is implemented:

compute
-------

s3
--

For each s3 request the following is logged:

* what is done: `GET`/`PUT`/`DELETE`/`HEAD`
* from where: source ip of request
* who: access_key ussed in request
* which data is accessed: bucket name + full path

This data is written to a log server and kept for 90 days.

This log format is available in the following sites:

* sto1 (2024-05-03)

backup?
-------

Retrieving log data
-------------------

As a customer you can request logs regarding access to your own data, either filtered by access_key, bucket name or both via a request to support@safespring.com. 

If you would like to receive an encrypted version of the log data, please supply a public key we can use in encrypting it.
