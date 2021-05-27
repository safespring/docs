# How to setup mc for use with Safesprings S3

## Installing minio

Install minio client (mc) from https://min.io/download

## Set up credentials

  Running this command
  
  mc alias set <ALIAS> <YOUR-S3-ENDPOINT> [YOUR-ACCESS-KEY] [YOUR-SECRET-KEY] [--api API-SIGNATURE]

should produce a config like the one below, naming the alias sto2 and using S3v4 API

```
  more $HOME/.minioc/config.json
  {
   "version": "10",
   "aliases": {
     "sto2": {
              "url": "https://s3.sto2.safedc.net",
              "accessKey": "CFxxxxxxxxxxxxT8",
              "secretKey": "R39yyyyyyyyyyykN",
              "api": "S3v4",
              "path": "auto"
             }
       }
  }
```

## Running various commands

On this machine, the mc command was named "minioc", presumably because
midnight commander has been using the name "mc" for a very long time.

```
$ date > DATETIME.txt
$ minioc cp DATETIME.txt  sto2/jj_demo/
DATETIME.txt:   30 B / 30 B [=======================] 209 B/s 0s
$ minioc ls sto2/jj_demo/
[2021-05-27 15:12:58 CEST]    30B DATETIME.txt
$ minioc rm sto2/jj_demo/DATETIME.txt
Removing `sto2/jj_demo/DATETIME.txt`.

```

As you can see here, the "sto2" alias requires no s3:// or other indicator of
the remote side, which is slightly different from other command line
clients and makes it look like a local directory specifier.

Complete (and long) guide available for mc here:

  https://docs.min.io/docs/minio-client-complete-guide.html

