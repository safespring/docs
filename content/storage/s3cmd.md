# Example config for s3cmd

## Getting s3cmd

Most linux distributions will have s3cmd in their repos, so a simple "apt-get install s3cmd" or "yum install s3cmd" should suffice.

## Creating a config file

s3cmd can be told to output a file containing all options in their current state, but it holds a lot of unneeded information so a simple start config could be as short as:

$HOME/.s3cfg:

    [default]
    access_key = REDACTED
    secret_key = REDACTED
    check_ssl_certificate = True
    guess_mime_type = True
    host_base = s3-archive.api.cloud.ipnett.se
    multipart_chunk_size_mb = 16
    use_https = True

and nothing else.

## Simple s3cmd usage

When you have the program installed and a config file in place, you can make a bucket and place a file or two in there.

    s3cmd mb s3://unique-bucket-name

    s3cmd put localfile.txt s3://unique-bucket-name

    upload: 'localfile.txt' -> 's3://unique-bucket-name'
    524 of 524   100% in  1s    3.68 MB/s  done

    s3cmd ls s3://unique-bucket-name


## About the options

The multipart chunk size is tunable, it's there for people with shaky internet connections and mean that files larger than 16MB will be uploaded in pieces.
After all pieces are completed, an MD5 of the whole file will be compared against the checksum of the local file, to ensure the file was correctly uploaded.

We have uploaded lots of files of sizes above 1G without issues, and using larger chunks will allow s3cmd reach higher speeds at the cost of larger resends in case anything does happen during transport. The upper limit seems to be somewhere above 2G.

We will not allow unencrypted access, so the https and ssl options should be left as is.

## Other flags and options

s3cmd has subcommands for many different operations, not all of them applicable to our service, but among the useful ones is the command to synchronize a local folder over to an s3 bucket as a simple backup method.

In that scenario, you might run over the same files over and over and only send the newly arrived files which doesn't already exist at the s3 side.
In order to prevent s3cmd from re-calculating the local MD5 sums on every run, add a
```--cache-file=/path/to/cache.md5s``` to the s3cmd invocation and it will note the timestamp of the files along with the MD5 sum so that it can skip that part on every upcoming run.

    s3cmd --list-md5 ls s3://unique-bucket-name

will show the server side checksums, which are also stored alongside with each file.
MD5 is not a 100% perfect checksum and intentionally crafted files having the same checksum has been created, so people needing more certainty are encouraged to run other algorithms and store the results alongside with the files for added confidence.
