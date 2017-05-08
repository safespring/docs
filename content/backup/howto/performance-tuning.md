# System performance tuning

There are a couple of primary parameters that limit the performance clients can
achieve with backup and restore with the Backup service.

These include:

* Host CPU
    - Available CPU cycles on the client host
    - Available AES-acceleration on the client host's CPU
* Host RAM
    - Available RAM on client host
* Network IO
    - Available underlying network bandwidth between the client host and the server
    - Available network throughput (TCP/IP) between the client host and the server
* Disk IO
    - Available underlying disk system ~random IOPS
    - Available underlying disk system streaming throughput

In order to determine the limit to how fast a current system can perform, the
performance of these factors can be baselined. It may also interest the
designer of a new system, to factor for the parameters given in this guide.

## File backup vs. Image backup

When working with file backups, TSM will store each individual file as it
changes over time, on the backup server. With image backups, an entire raw
device can be backed up.  Raw image backup is much faster since the underlying
storage can deliver basically streaming sequential IO to service the read
requests.  But there is a trade-off in recovery time, since a users restore
request for a single email or word document implies the backup administrator
must restore and mount the image in order to restore the document, which can
take time.  Thus, image backups optimizes for minimizing speed of doing a
backup at the expense of time to restore an individual file, which is the
typical backup restore request to an IT department.

Conversely, file backups have a much less streaming sequential IO pattern
from the client host, and optimize more towards more simply restoring a simple
file, than the restore of an entire block device. Restoring from a file backup
implies to work on top of a file system, which has a bit less sequential IO
pattern than simply writing to the underlying block device from start to
finish.

File backups is the normal mode of operation on typical servers including file
servers, and what we recommend.  Image backups may be a fit virtual
environments where the VM in itself is a functional unit and does not
necessarily contain individualized data.

# Host CPU / RAM on the client host

## CPU cycles

## AES-acceleration

## RAM

# Network IO

## Underlying network bandwidth

## Point-to-point TCP/IP throughput

# Disk IO

Reference system (a year 2010 system):

* Host OS: Debian GNU/Linux, version Wheezy
* Kernel version: 3.2.0-4-amd64 (standard)
* Drive systems:
    - SATA (4x1TB 7200 RPM) Linux software RAID-5
    - PATA (10x300GB 7200 RPM) Linux software RAID-5
* Logical storage construct:
    - Both RAID volumes in one LVM2 volume
    - dmcrypt block level AES-256 encryption per individual logical volumes
    - Filesystem:  EXT4
* CPU: AMD Phenom(tm) II X4 965 Processor - Quad-core 3.4 GHz
* RAM: 16 GB

## Underlying disk system ~random IOPS

A regular backup run on a file system backed up with the service involves
iterating over all files of the protected file system(s) and performing
`stat()` on them, in order to compare with what the backup server has stored.
The comparisons are made on file's attributes such as modify-time, size, etc.
Since the change pattern of files approach random, and all files need to be
accessed, it is relevant to base-line a storage systems

### Base-lining the random IOPS of a storage system

Using the file IO tester `fio`, we can base-line a storage system:

    root@system:/usr/local/src/fio-tests# fio
    No jobs(s) defined
    
    2.0.8
    fio [options] [job options] <job file(s)>
      --debug=options   Enable debug logging. May be one/more of:
                        process,file,io,mem,blktrace,verify,random,parse,
                        diskutil,job,mutex,profile,time,net
      --output          Write output to file
      --timeout         Runtime in seconds
      --latency-log             Generate per-job latency logs
      --bandwidth-log   Generate per-job bandwidth logs
      --minimal         Minimal (terse) output
      --version         Print version info and exit
      --terse-version=x Set terse version output format to 'x'
      --help            Print this page
      --cmdhelp=cmd             Print command help, "all" for all of them
      --enghelp=engine  Print ioengine help, or list available ioengines
      --enghelp=engine,cmd      Print help for an ioengine cmd
      --showcmd         Turn a job file into command line options
      --eta=when                When ETA estimate should be printed
                                May be "always", "never" or "auto"
      --readonly                Turn on safety read-only checks, preventing writes
      --section=name    Only run specified section in job file
      --alloc-size=kb   Set smalloc pool to this size in kb (def 1024)
      --warnings-fatal  Fio parser warnings are fatal
      --max-jobs=nr             Maximum number of threads/processes to support
      --server=args             Start a backend fio server
      --daemonize=pidfile       Background fio server, write pid to file
      --client=hostname Talk to remote backend fio server at hostname
    
    Fio was written by Jens Axboe <jens.axboe@oracle.com>
                     Jens Axboe <jaxboe@fusionio.com>

It's required to A) locate a directory where tests can be done, as it uses
files to perform its tests, and B) define a test description to the program.

Fio is very versatile, so we decide to benchmark on random reads, using 4k
block size, 1G test files, 1 job running, and a couple of different IO queue
depths to check how a presumed increased concurrency of the backup client may
affect performance:

    [global]
    write_bw_log
    write_lat_log
    write_iops_log
    runtime=30
    time_based
    directory=/mnt/backups/
    size=2G
    direct=1
    ioengine=libaio
    bs=4k
    wait_for_previous
    rw=randread
    
    [1]
    iodepth=1
    
    [2]
    iodepth=2
    
    [4]
    iodepth=4
    
    [8]
    iodepth=8
    
    [16]
    iodepth=16
    
    [32]
    iodepth=32
    
    [64]
    iodepth=64
    
    [128]
    iodepth=128

The test configuration is stored in a file called `system-randread-4k.ini`.
Now prepare and launch Fio:

    root@system:/usr/local/src/fio-tests/# mkdir -p system/randread-4k
    root@system:/usr/local/src/fio-tests/# cd system/randread-4k
    root@system:/usr/local/src/fio-tests/system/randread-4k# fio --latency-log --bandwidth-log --output system-randread-4k.log ../../system-randread-4k.ini

Fio will now run and create 8x2GiB files to test against, and then perform the
tests in sequence with queue depths according to the test configuration file
above.  Direct IO means to bypass the Linux kernel's memory page cache, and
perform each IO operation directly against the underlying storage.

Once completed, Fio will have generated a log file, `system-randread-4k.log`,
which contains information about the jobs run:

    1: (g=0): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=1
    2: (g=1): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=2
    4: (g=2): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=4
    8: (g=3): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=8
    16: (g=4): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=16
    32: (g=5): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=32
    64: (g=6): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=64
    128: (g=7): rw=randread, bs=4K-4K/4K-4K, ioengine=libaio, iodepth=128

And then much more detailed information about each run:

    1: (groupid=0, jobs=1): err= 0: pid=9877
      read : io=16024KB, bw=546897 B/s, iops=133 , runt= 30003msec
        slat (usec): min=16 , max=286 , avg=81.11, stdev=12.73
        clat (usec): min=236 , max=33898 , avg=7395.16, stdev=3127.19
         lat (usec): min=321 , max=34004 , avg=7477.98, stdev=3127.41
        clat percentiles (usec):
         |  1.00th=[  410],  5.00th=[ 2704], 10.00th=[ 3600], 20.00th=[ 4576],
         | 30.00th=[ 5536], 40.00th=[ 6432], 50.00th=[ 7328], 60.00th=[ 8256],
         | 70.00th=[ 9152], 80.00th=[10048], 90.00th=[11328], 95.00th=[12224],
         | 99.00th=[14272], 99.50th=[15168], 99.90th=[25472], 99.95th=[26752],
         | 99.99th=[34048]
        bw (KB/s)  : min=  392, max=  595, per=100.00%, avg=534.05, stdev=31.05
        lat (usec) : 250=0.05%, 500=1.15%, 750=0.75%, 1000=0.30%
        lat (msec) : 2=0.45%, 4=10.68%, 10=66.15%, 20=20.24%, 50=0.22%
      cpu          : usr=0.32%, sys=1.48%, ctx=4104, majf=0, minf=145
      IO depths    : 1=100.0%, 2=0.0%, 4=0.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
         submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
         complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
         issued    : total=r=4006/w=0/d=0, short=r=0/w=0/d=0

Fio will also have generated log files that on a system with gnuplot and some
font libraries installed, you can run `fio_generate_plot` to get some gnuplot
images of the test traces such as:

* IO Bandwidth

* IO Operations

* IO Latency

* IO Submission Latency

* IO Completion Latency

For more Fio test examples, check out
https://github.com/axboe/fio/tree/master/examples The Fio HOWTO manual is at
https://github.com/axboe/fio/blob/master/HOWTO

### Base-lining time to stat() a file system with many files

The file system /mnt/backups on the reference host is 394 GiB large, out of
which 388 GiB are used, and there are ~2M files on it.

First, get and compile the recursive-stat program:

    root@system:/usr/local/src# git clone https://github.com/IPnett/cloud-BaaS
    Cloning into 'cloud-BaaS'...
    remote: Counting objects: 241, done.
    remote: Compressing objects: 100% (22/22), done.
    remote: Total 241 (delta 6), reused 0 (delta 0)
    Receiving objects: 100% (241/241), 46.05 KiB, done.
    Resolving deltas: 100% (96/96), done.
    root@system:/usr/local/src# cd cloud-BaaS/unix/baselining/recursive-stat/
    root@system:/usr/local/src/cloud-BaaS/unix/baselining/recursive-stat# make
    gcc -O2 -o recursive-stat recursive-stat.c
    root@system:/usr/local/src/cloud-BaaS/unix/baselining/recursive-stat

Second, get IOPS values from the underlying disk system before running the
test:

    root@system:/usr/local/src/cloud-BaaS/unix/baselining/recursive-stat# grep 'md.' /proc/diskstats
       9       2 md2 4663599 0 155657288 0 2888861 0 116705128 0 0 0 0  
       9       3 md3 17369972 0 791542623 0 177633 0 1382800 0 0 0 0

This shows that there have been `4663599 + 17369972 = 22033571` read IO ops on
this system until now.

Third, empty the Linux dentry cache to make sure there are no cached direntries
etc.

    root@system:~# echo 3 > /proc/sys/vm/drop_caches

Fourth, run the recursive stat program on the file system under test:

    root@system:/usr/local/src/cloud-BaaS/unix/baselining/recursive-stat# ./recursive-stat /mnt/backups/
    Files stat()'ed: 1999531
    Listing completed:
      1999531 files stat()'ed
      409.54 seconds elapsed
      4882.38 files stat()'ed per second

Fifth, get the after-test IO ops values from the underlying disk system:

       9       2 md2 4718083 0 156093160 0 2888861 0 116705128 0 0 0 0
       9       3 md3 17658828 0 793853471 0 177633 0 1382800 0 0 0 0

Apparently, now after the run (other background activity at an absolute
minimum), there are `4718083 + 17658828 = 22376911` read IO ops registered by
the kernel.  This implies that `22376911 - 22033571 = 343340` read IOPS were
issued in order to traverse all folders on the path (there are ~many) and run
stat() in them, or `1999531 / 343340 = 5.82` files stat()'ed per read IO op.
This also means an average of `343340 / 409.54 = 838.4` read IOPS were
delivered from the underlying disk system.  `XXX: COMPARE WITH fio random read
test.`

Sixth, run the benchmark once again to view the impact of a dentry cache on the
file server:

    root@system:/usr/local/src/cloud-BaaS/unix/baselining/recursive-stat# ./recursive-stat /mnt/backups/
    Files stat()'ed: 1999531
    Listing completed:
      1999531 files stat()'ed
      11.78 seconds elapsed
      169699.97 files stat()'ed per second
    root@system:/usr/local/src/cloud-BaaS/unix/baselining/recursive-stat# grep 'md.' /proc/diskstats
       9       2 md2 4718083 0 156093160 0 2888861 0 116705128 0 0 0 0
       9       3 md3 17658828 0 793853471 0 177633 0 1382800 0 0 0 0

Not a single read request were issued to the underlying disk system, and the
CPU time involved in iterating through all directories, stat()'ing all files
and hitting the dentry cache as well as progress updating the terminal, is at a
minimum.

## Underlying disk system streaming throughput

TBD ...

