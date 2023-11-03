# Installing on FreeBSD

!!! note "Before you start"
    This assumes you have added whatever package is needed for linux compat and set the corresponding `sysctl/rc.conf` flags to make it work. We tried with some version of the Fedora 10 package from ports.

We have tried with FreeBSD 10 (that was the latest stable release at the time), and made it work with the Linux TSM client. Since you are running the linux emulation in 32-bit mode only, the limitations from being a 32-bit application is carried over to the emulating operating system.

The single most important part is
that dsmc needs to be able to read the file `/etc/mtab`. 
In my case, it had freebsd device names in it,
but the file must exist and cannot be zero bytes in size. 
If it is missing or empty, then "dsmc incremental"
will claim that the operating system denied it some memory allocation and exit,
whereas "dsmc restore" will crash.
That file appears under `/compat/linux/proc/mtab`
after you have mounted a special linprocfs which is a specific kernel module you have
to add to your `/boot/loader.conf`,
where you presumably already had an entry for linux
(to get the basic linux emulation going at all).

Our configuration looked as follows:  

```shell
linux_load=“YES”  
linprocfs_load=“YES”  
```

In the `/etc` directory of the FreeBSD system, I placed a link for the "mtab" that points into the emulation filespace, and it is created easiest as follows:

```sh
ln -sf /compat/linux/proc/mtab /etc/mtab
```

which you only need to do once. 
Then you make sure linprocfs is mounted by 
editing your fstab and add this line:

```sh
linprocfs /compat/linux/proc linprocfs rw 0 0
```

in accordance with the manpage for linprocfs.

Lastly, I had tsm unpacked under `/compat/linux/opt..` because I assumed that it would look under `/compat/linux` first for files, but I made a soft link from the freebsd filesystem `/opt/tivoli into /compat/linux/opt/tivoli` for my own sake.

We are currently running TSM 6.2.5.4 with gscrypt-8.0.14.43, where 
everything comes as RPMs from TSM unpacked from within the linux emulation 
mode. I think you need to link to a few language files depending on what 
language your FreeBSD is set to, and what the emulation thinks you can 
support in terms of languages. So in our case we ended up linking 
`/compat/linux/opt/tivoli/tsm/client/ba/bin/dsmclientV3.cat` and `EN_US` 
from `../../lang/` where those two files could be found. It seems like dsmc 
looks in its own directory if it can't find them in whatever correct place 
they should be, so that solved the language file issue.

That's basically all you need to do with FreeBSD in order to run TSM in 32-bit linux emulation mode.
If your FreeBSD system has millions of files, I guess you will have to make sure `RESOURCEUTILIZATION` is 1 (or at least low) you are used to bumping it to 5 or 10 for performance reasons and also go for `MEMORYEFFICIENTBACKUP=yes` so it will not try to build complete filelists before transmitting any data, since that will make it run out of memory space if you have millions of files in total on the machine.

As any 32-bit userspace application, it will be limited by the minimum of (2-or-3G ram OR the memory-limit for a single process) even if the operating system in itself is running in full 64bit mode.
