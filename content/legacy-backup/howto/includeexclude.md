Including and excluding files on TSM.
=====================================


## Backing a single directory

The simplest way is of course to run the `dsmc` command line client
and point it to the directory in question, perhaps using cron
or some other scheduler or event handler. The invocation would
then be as simple as: (unix client OS)

``` shell
dsmc inc /var/lib/pg_data/psql_dumps/
```

but in case you would need the machine to run using the built-in
dsmcad scheduler, perhaps for reporting reasons, it will default to
all locally-connected filesystems so the exclusions need to work in
several steps in order to achieve single-dir backup like the above
example.

Below is an example for windows, where you first specify a single file
system using the `DOMAIN C:` specifier to say that out of all connected disks and filesystems it
might find, only take `C:` into consideration. The default for `DOMAIN` is
called `ALL-LOCAL` and is a global option meant to only be listed once
in the file with the disks one wants to consider, if `ALL-LOCAL` is not
suitable for you.  It also only applies to invocations like `dsmc inc`
where you do not specify any path, or when `dsmcad` starts backup on a
schedule.

Then follows an `EXCLUDE` to match all files in all possible
subdirectories under `C:`, and lastly an `INCLUDE`-statement to add back
files that does exist under `Program Files\docgenerator\` on `C:`

``` shell
DOMAIN C:
EXCLUDE C:\...\*
INCLUDE "C:\Program Files\docgenerator\...\*"
```

## How includes interact

You might view it as if `INCLUDE` and `EXCLUDE` statements are parsed
backwards, from last line to first, and acting on the first match.

In the above example, files matching the docgenerator directory
will be considered for backups and the rule matching will stop
since it matched an existing rule. The earlier rule that excludes
all files will not cover the files in docgenerator, but all other files.

Also, the output when running a setup like the above will be backing
up directory structures and names, but not files in them, so it might
look like it is about to back the whole disk, even though it is not.

Lastly, if you use `EXCLUDE.DIR` "`/some/path`" the backup client will NOT
enter that directory at all, so you may not include files in that
directory tree, the client skips everything covered by an `EXCLUDE.DIR`
rule.

Combining includes and excludes that select whether to backup or not
with includes and excludes for compression/encryption is a separate
topic, [explained here](https://www.ibm.com/support/knowledgecenter/en/SSEQVQ_8.1.4/client/c_opt_include_compencrunx.html).

### Handling common includes/excludes

The `dsm.sys` / `dsm.opt` files used by TSM clients can have a command
to point include/exclude rules to a separate file.

``` shell
INCLEXCL /opt/tivoli/tsm/client/ba/bin/dsm.inclexcl
```

which might be a good way to handle local exclusions depending on the
role of the computer but still keeping the general options in `dsm.sys`
/ `dsm.opt` generic. It could also be used to give local admins
permissions to edit include/exclude rules without being able to affect
other TSM configuration entries.

### Sum of all include/exclude rules

There are several sources of rules for what to exclude and include
which come from different places. One of the sources are the
above-mentioned local preferences in the config files.

Another is the client itself which, based on your operating system,
knows which virtual filesystems (like /proc on linux) and files
(`pagefile.sys`, `hiberfile.sys` on windows) should always be exempt from
backups.

Lastly, the server policies might add rules. In our case we
have mostly `EXCLUDE.COMPRESS` rules to not try to compress files which
are already compressed like `.zip`, `.jpg` and so on.

We have no generic exclusions serverside for things like names of
trashcan folders, Firefox caches, iTunes libraries, core files and so
on. It is up to your organisation to select what is meant to go in
backups and what isn't, especially across different operating systems,
where one single filename might have vastly differing meanings.

You can ask any configured client about the sum of rules with
`dsmc query inclexcl` which will list all applicable rules and at
which place they originate from.

### Other uses for include/excludes

Apart from the broad "to include in backups or not", the include
statements can also be used to select management classes of files and
directories, which in turn control retention times, ie for how long
the backups will be kept. You might set a very short retention time on
operating system files but long retentions on personal document
folders on the same machine.

On a configured node, you can run `dsmc query mgmt` to see available
selections, returning something like this:

``` shell
Domain Name               : ORGNAME_FILE_DEDUP
Activated Policy Set Name : STANDARD
Activation date/time      : 2015-05-15 15:55:55
Default Mgmt Class Name   : 30DAYS
Grace Period Backup Retn. : 3655 day(s)
Grace Period Archive Retn.: 3655 day(s)
MgmtClass Name            : 180DAYS
Description               : Files are saved for 180 days
MgmtClass Name            : 30DAYS
Description               : Files are saved 30 days
...
```

where the names of the MgmtClass are what we are looking for
( *30DAYS* and *180DAYS* in that example list)

To set different retentions for OS files and personal files on a unix
machine, something like this can be set:

``` shell
INCLUDE / 30DAYS
INCLUDE /home 180DAYS
```

The next time you run the backup, the new expiration dates will be
applied to the current (and future) version of the files, something
the client will call rebinding, which means a new class gets set on
each file covered by the new non-default retention policy.

For unknown reasons, rebinding does not work on files being Archived
using `dsmc archive ...`, only on backups. In order to actually change
`MgmtClass` on archive files, you need to pull them back with `dsmc
retrieve` and then archive them again.

## Links

* [All details on includes and excludes on the IBM website](https://www.ibm.com/support/knowledgecenter/en/SSEQVQ_8.1.4/client/r_opt_include.html)
* [Details on the DOMAIN option](https://www.ibm.com/support/knowledgecenter/en/SSEQVQ_8.1.4/client/r_opt_domain.html)
