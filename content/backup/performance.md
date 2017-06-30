# TSM Backup Client Performance

## Small-file baseline performance metrics

* Reference disk: 
  * 1x 3TB 7200 RPM Barracuda SATA-drive
* Test data:
  * 194 GB Debian mirror package's source files, 
  * Unpacked into ~497 GB of small files
  * Files: 27 million
  * Directories: 2.5 million
  * Average file size: 19 KiB
* Internet path client-to-server
  * Congested consumer gigabit Internet connection
  * 15 ms RTT
* TSM `dsm.sys` settings:
  * From server, via API node parameters:
    * Deduplication - On, client-side
    * Compression - On, client-side
  * Locally modified:
    * `TXNBYTELIMIT 10G`
    * `RESOURCEUTILIZATION 10`
    * `TCPWINDOWSIZE 0`
* Reference recursive opendir() on all directories and fstatat() of all files:
  * 2710 seconds total runtime, with cold directory caches, from `echo 3 > /proc/sys/vm/drop_caches`.
  * Equivalent to 10045 objects per second.

### First full incremental backup

Session report table below:

    Total number of objects inspected:   27,843,085
    Total number of objects backed up:   27,838,989
    Total number of objects updated:              0
    Total number of objects rebound:              0
    Total number of objects deleted:              0
    Total number of objects expired:              0
    Total number of objects failed:           4,999
    Total number of objects encrypted:            0
    Total objects deduplicated:          13,731,609
    Total number of objects grew:                 0
    Total number of retries:                      0
    Total number of bytes inspected:         438.16 GB
    Total number of bytes processed:         270.86 GB
    Total bytes before deduplication:        419.78 GB
    Total bytes after deduplication:         262.49 GB
    Total number of bytes transferred:       171.40 GB
    Data transfer time:                    6,982.41 sec
    Network data transfer rate:           25,740.56 KB/sec
    Aggregate data transfer rate:          2,001.94 KB/sec
    Objects compressed by:                       37%
    Deduplication reduction:                  37.47%
    Total data reduction ratio:               60.89%
    Elapsed processing time:               24:56:18

 * **310 objects inspected per second**
 * **157 objects uploaded per second, post-dedup**
   * 310 OPS => 1.11M objects per hour.

The run leaves a very small local dedup database cache in `/opt/tivoli/tsm/client/ba/bin/TSMDEDUPDB_TSM1.CLOUD.IPNETT.SE${NODENAME}.DB`.
With a size of 263 KiB, it appears it will really be populated on the second run.

### Second incremental run

The backup run starts with the `dsmc` process retrieving the server's object list.
The list retrieval phase is CPU-limited (constructing data sets, etc). `dsmc` saturates a CPU core while downloading and ends up at a resident memory usage at 7.1 GB. It is roughly equivalent to the 300 B memory per object IBM states (~274 B/O to be exact).
This retrieval takes ~15 minutes and appears polynomial in time complexity vs. #objects, hinting at linked-lists or similar data structures being constructed within.

Session report table below:

    Total number of objects inspected:   27,843,114
    Total number of objects backed up:            0
    Total number of objects updated:              0
    Total number of objects rebound:              0
    Total number of objects deleted:              0
    Total number of objects expired:              0
    Total number of objects failed:             903
    Total number of objects encrypted:            0
    Total objects deduplicated:                   0
    Total number of objects grew:                 0
    Total number of retries:                      0
    Total number of bytes inspected:         438.16 GB
    Total number of bytes processed:              0  B
    Total bytes before deduplication:             0  B
    Total bytes after deduplication:              0  B
    Total number of bytes transferred:            0  B
    Data transfer time:                        0.00 sec
    Network data transfer rate:                0.00 KB/sec
    Aggregate data transfer rate:              0.00 KB/sec
    Objects compressed by:                        0%
    Deduplication reduction:                   0.00%
    Total data reduction ratio:              100.00%
    Elapsed processing time:               01:20:36

* Overall performance:
  * **5757 objects inspected per second**
  * 20.7M objects inspected per hour.
* Split performance (list construction / disk IO):
  * 15 minutes to retrieve and construct object list in client process
  * 01:05:36 spent on disk IO, stat()'ing files
  * **7073 objects (files) stat()'ed per second**
  * 25.5M objects stat()'ed per hour.
* **0 objects uploaded per second**  (Incremental forever)
* 5757 OPS is roughly 60% of the native disk IO speed (7073 OPS roughly 70%). That it is less than 100% is likely due to one of:
  * A) _Disk-first_. 28 million list lookups against a ~28 million entries long in-memory server-list of the objects, upon disk traversal, or, 
  * B) _Memory-first_. Less optimal disk traversal due to traversing the in-memory server list of objects, and looking them up on disk according to the order of the in-memory list.
 
This on a single 7200 RPM SATA drive. Some 3k odd objects that had been missed the first run were catched a second run. The remaining missed objects are due to not having LC_LANG=C configured.


## Performance Tuning

Tuning the client options can help you use more of the local resources
to speed up the backup transfers, at the cost of more CPU, Network and
I/O.  More about this on [System performance tuning](System-performance-tuning).

Since we assume most people have decent Internet links now, getting
the data over the wire as quickly as possible is probably the most
important part in order to finish the backup and restore tasks as fast
as possible.

Also, since we force encryption on all transport, CPU resources limit
somewhat how fast a single stream from you can ship data over to our
end. Most servers and clients today have more than one core/thread and
often more than one CPU, so adding a few more threads for TSM to ship
data will definitely help.

The client options discussed in this guide are set in the TSM config
file "dsm.sys", found by default in different places on different
OSes: 

- Linux/Unix: "/opt/tivoli/tsm/client/ba/bin/dsm.sys"
- MacOSX: "/Library/Application Support/tivoli/tsm/client/ba/bin/dsm.sys"
- Windows: "C:\Program Files\tivoli\tsm\baclient\dsm.sys"

These are simple text files and can be edited with any simple text
editor of your choice. Remember the default comment character is * and not #.


## Parallelism

In order to allow more resources while shipping data over, and to
allow more than one thread to collect lists of files needing backup
since the last time, the option RESOURCEUTILIZATION needs to be bumped
from the default value to something larger, up to 10. This means up to 8
streams could be used for communicating with the server, and up to 4
threads looking over the local file systems for new and changed
files. The complete matrix of the meaning of settings 1 to 10 is
available in the [Performance Tuning Guide](<http://publib.boulder.ibm.com/tividd/td/TSMM/SC32-9101-01/en_US/HTML/SC32-9101-01.htm#_Toc58484215>), 
but the general idea is that a higher value leads to more cores being
dedicated to finding and sending files.

Add:

    RESOURCEUTILIZATION 5

to the dsm.sys file, and the next run will use up a few more cores on
your server, hopefully shortening the time it takes for the actual
network transfer.

This could be useful to make the initial full-backup finish faster, and later
incremental runs could run with a lower setting in order to leave more
for the regular tasks of your server if it is acceptable to have
longer run times in order to not peg all CPU cores while running.

## Network Settings

While tuning you might want to bump TSM client tcp window limits and
buffer sizes too, since many of the options are defaulting to rather
conservative low values that were appropriate a long time ago. Among
the ones that may have a positive impact while bumping memory usage up
a meg or two are:

- TCPBUFSIZE (default is 32, max 512 in kilobytes)
- TCPWINDOWSIZE (default 63/64, max 2048 in kilobytes) 

This may also need a bump or two in the appropriate sysctls if your
Linux or Solaris OS is old. Newer machines either have better defaults
or even auto-tune some of these without need for manual tweaking.
Generic network tuning guides are plenty on the net.

(Make sure you find recent ones, since many guides are outdated and
focus on not starving a 64M ram machine with a "fast" 100Mbit/s
interface)

## CPU-native AES Instructions

On the topic of encrypting traffic, the IBM software crypto software
that comes with the TSM client (gsk8, Global Security Kit v8) should
be as recent as possible. Newer versions include support for native
AES-NI instructions found on Intel CPUs from the models
Westmere/SandyBridge and newer AMD CPUs. A more complete list can be found in [Wikipedia](http://en.wikipedia.org/wiki/AES_instruction_set#Supporting_CPUs).

**MacOSX** clients get a recent Global Security kit along with the TSM v7.1x
client bundle.

**Linux** users should check their rpm database using the following command:

    rpm -qa |grep gsk

And make sure that the following packages (or later versions) are installed in
order to get native support for AES-NI in case your CPU does have it.

- gskssl64-8.0-50.20.x86_64
- gskcrypt64-8.0-50.20.x86_64

IBM claims Sparc64 Ultra T1 and T2 CMT processors with on-CPU crypto
chips will benefit also, but we haven't tested any of those for crypto
performance. 

## Local Compression

Among all the options to tweak and tune how to send data faster, the
overall best option is to not send it at all of course. This comes
with a price, but depending on how you weigh your resources, it still
is a choice you can make. Compression is rather simple, a yes/no
option to have all data compressed before going over the wire like
this:

    COMPRESSION yes

Compression eats cpu but attempts to minimize the data that has to be
sent over, and also minimized the amount one has to encrypt/decrypt at
both ends.

## Local Deduplication

Another way to minimize the amount of data you have to send is using
deduplication, where you match outgoing datablock checksums with lists
of previously sent datablocks. When done server-side, it will match
against other machines in your own domain, so backing up lots of
machines using the same operating system will reduce the amount of
used space since the remote end will only store each such file once.
When done locally, it means you can have log files that append only a
small amount of data (or get renamed/rotated) where most of the
content is identical and only send over the unique parts.

Using local deduplication means that you keep a local cache (default
256M) of the hashes you have sent earlier, so that your client can
look up all datablocks before shipping them over the network, and in
the case where a duplicate checksum/hash is found, you can skip past
it and move on to the next file/datablock. Like compression, this is a
local operation, which trades CPU and resources at every client for a
reduction in total network traffic and backup time.

Still, if you know you have lots of similar/identical files, or large
files that slowly grow over time, this will make sure only new parts
of those files are sent over the network. In our service offering, we
will be removing duplicate data server-side also, so the end result
does not differ much in terms of where the deduplication happens, but
sending the same data over and over might be worth preventing. 
 
To enable client side deduplication, simply add:

    DEDUPLICATION    yes
    ENABLEDEDUPCACHE yes

If you don't enable the DEDUPCACHE, TSM will ask the server if this
particular piece of data has been seen before, so this may be a far
slower option for large backup jobs compared to checking against a
local file.  It will increase network chattyness. Local deduplication
is good for satellite links or cell phone Internet.

To set the local cache size (in megabytes, 256 MB is the default):

    DEDUPCACHESIZE 2048

To place it somewhere specific:

    DEDUPCACHEPATH /path/to/cache/dir/

Using deduplication together with compression has no negative impact,
whenever the client has something to send over the network to the
server, it will be compressed.  The deduplication decision has already
been made at that point.