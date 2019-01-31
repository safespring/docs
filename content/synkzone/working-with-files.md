# Working with Files

## How do I see what has happened to a file?

1. Right-click on the file in the directory in Synker and select Show log. The zone log will then be updated so that it only shows messages related to that particular file.
2. To redisplay all messages in the log, click the X next to the Search field.
3. If you do not know where the file is located, you can instead follow the instructions in ["I cannot find a file"][I cannot find a file] and select Detailed as the level of detail.
4. The zone log gets updated as the search conditions change. Each update may take a few seconds.
5. Sometimes the search may take extra time or give very many results. In that case it may happen that only some of the matching messages are listed. If there might be more messages earlier or later in the log this will be indicated at the top or bottom of the log
with a special message that tells the time interval for which messages are displayed. There may also be buttons at the top and / or bottom that you can click to continue search into earlier or later portions of the log. You may also right-click on these buttons to jump directly to the earliest or the latest matching messages.

## I cannot find a file

1. Open Synker, and select the tab for the zone file should be in.
2. Make sure you can see the section called Log (the zone log). If necessary, you can click on the arrows < and > on the far right and left until you see the Log section.
3. At the top of the log portion is a search box. Enter all or part of the file name in the Search box, and press Enter. This will change the log to display only the messages containing the name that you entered. Locate any message for the file you searched for and double-click the message. If the file still exists or is possible to restore, the file directory will be changed to show the folder where the file resides and the file will be highlighted. If the file is deleted, but is possible to restore, the file directory is changed to show deleted files instead and the trash can symbol will be highlighted.
4. If needed, you can search using a more precise file name by entering it in the Search box. Sometimes it may also be necessary that you choose the level of detail to Detailed for the file to appear in the log.
5. When you are done, you can press the X next to the Search box to redisplay the entire log as usual.
6. You can read more about how you can use the zone log in [How do I see what has happened to a file?][How do I see what has happened to a file?].

## I want to restore a deleted file

1. Open Synker and go to zone that the file belongs to.
2. Go to the folder where the file was and show deleted files by clicking on the trash can symbol, or locate the file as described under I cannot find a file.
3. If the file you want to restore is not permanently deleted, it will appear in the file directory.
4. Right-click on the file to bring up a menu of options. If the file is possible to restore, there is an option called Restore to restore the file. It can happen that a file is not possible restore at the moment, and then you could try again later.
5. When the file is restored, it ends up in the same place as it was when it was deleted.
6. Whether a deleted file can be restored depends on whether you are online or not, and what type of zone the file belongs to.

## Why are the changes I made in a file gone?

1. There may be several reasons. You can also read more about this under [Why can I not see the change I made in a zone?][Why can I not see the change I made in a zone?].
2. If you made changes on another computer, they may not have been synchronized if you were offline on the computer, if the synchronization of the zone was turned off on the computer, or if you turned off your computer before they could be synchronized. Then you need to start Synker on the computer again and make sure that the changes are synchronized.
3. It can also happen that someone else saved a new version of the file. You can, for example, check this by right-clicking the file in Synker and select Show log. If your version had been synchronized, you can get it back as described in [I want to remove the latest changes to a file][I want to remove the latest changes to a file], or [I would like to see and possibly work with an old version of a file without changing the current version][I would like to see and possibly work with an old version of a file without changing the current version]. If it had not been synchronized, your version of the file is stored as a conflict file which you can read more about in [Why is there a file on my computer with a name starting with "~Conflicting"?][Why is there a file on my computer with a name starting with "~Conflicting"?].
4. You can prevent others from modifying a file by following the instructions under [I want to prevent others from modifying a file][I want to prevent others from modifying a file].

## I want to remove the latest changes to a file

1. Find the file in the file directory for the zone.
2. Click the Last modified date of the file. If there are earlier versions that can be restored, they will be shown in a menu where information about when each version was created and by whom.
3. If you choose an old version, you will get a question about whether you want create a new file with the old version, change the current version of the file, or if you want to cancel. In this case, you should choose to change the current version of the file.
4. The file will now change its last modified date to the version you chose, and either be locally stored as an archived file or start to download the old version as soon as possible. All other old versions will however remain for a while.

## I would like to see and possibly work with an old version of a file without changing the current version

1. Follow the instructions in I want to remove the latest changes to a file, but choose the option to create a new file instead.
2. If the old version is possible to restore, a new file will be created with the same name as the original file, but with a description of the particular version added to it. You can then change the name of the new file if you like.

## Why am I asked to confirm that I want to delete, remove, or change the name of a folder?

1. If Synker finds that a folder within a zone that contains one or more files no longer exists in its previous location or with its previous name, you will be warned about this and you will be given the option to restore it if the change was not intentional.
2. This is meant to be a protection against mistakes that otherwise could have big consequences for both you and other participants in the zone.
3. There may be (very rare) situations due to temporary activities in the files when a folder may be incorrectly detected as removed. In those cases, you just need to answer No to the question about whether the removal was intentional.
4. If you do not actively confirm the removal of a folder by answering Yes within a few minutes, Synker will handle this as an unintentional removal and will restore the folder automatically. This is also a protection against mistakes and temporary events in the file system.

## Why am I asked to confirm that I have intentionally changed the name of several files in a zone?

1. If Synker's client preferences allow detection of suspicious behavior, it will also monitor the contents of zones to see if it changes in a suspicious way that may indicate an infection with malicious software (e.g. ransomware).
2. If such changes are detected, you will be asked if those changes were intentional.
3. If you do not actively confirm that the changes were intentional within a few minutes, Synker will attempt to undo those changes and then go into a quarantine mode to protect all your zones against further changes. You can read more about quarantine mode in [What does Quarantine mean?][What does Quarantine mean?].
4. If it later should turn out that the changes were in fact legitimate, you can leave quarantine mode and restore the changes from the conflict files (read more in [Why is there a file on my computer with a name starting with "~Conflicting"?][Why is there a file on my computer with a name starting with "~Conflicting"?]) created when the changes were first detected.
5. You can at any time disable this detection of suspicious behavior for example if it tends to frequently mistake normal file operations for effects of malicious software. You are also given the option to disable this directly each time you are asked to confirm suspicious file replacements.

## I want to prevent a deleted file from being restored

1. Go to the folder where the file is stored.
2. If the file is already deleted, open the trash bin. If the file can be restored it will be shown there.
3. Right click the file in Synker, choose Delete permanently, and then confirm that this is what you want to do.
4. The file will no longer be shown in any directory or in the trash bin, and cannot be restored.

## Why do I get a message that I cannot add, modify, or delete a file or a folder?

1. This depends on your access rights in the zone. If you try to do something that you do not have the rights to do, Synker will warn you about this and will undo your changes. If you incorrectly added or modified a file, your new file contents will not be lost, but will be stored as a conflict file (also see [Why is there a file on my computer with a name starting with "~Conflicting"?][Why is there a file on my computer with a name starting with "~Conflicting"?]).
2. You can see your access rights in the Participants list in the zone. By moving the mouse over your name in the list, you will se a small text box that summarizes your rights. You can also double click on any user to see more information about that user, including access rights in the current zone.
3. An overview of different access rights is available in What can I do in a zone (access rights)?.

## Why does Synker say that a file has been modified even if it just has been opened?

1. The reason is that some types of files (e.g. old file file types for Microsoft Office like .xls, .doc, and .ppt) are affected when they are opened so that they look to the file system like they have been modified although nothing of the contents has actually changed. This is behavior of certain applications, and is as such difficult for Synker to do anything about.
2. It is not harmful in any way, and contents is actually changed or removed. A potential disadvantage is however that the number of proper old versions that Synker can keep gets reduced.
3. We recommend that you whenever possible try to use new file formats for Microsoft Office and other applications with this behavior to avoid these effects.
4. An alternative workaround is to lock these types of files if they are not intended to be modified (see [I want to prevent others from modifying a file][I want to prevent others from modifying a file]) in order to avoid unnecessary modifications and potential conflicts.

## Why can I not see the change I made in a zone?

1. First check that the file has not been deleted. See I cannot find a file for more information.
2. Some files may not get synchronized by Synker because they have special names or have a purpose that is only meaningful on a particular computer. The most common example is files with a name that starts with tilde (~). Links to files, thumbnail picture files, and other metadata files are also never synchronized.
3. It can also be that the zone is currently not set to be locally synchronized. You can see the current zone status above the file directory, where it is indicated if the zone is synchronized, synchronizing, or if synchronization is paused. If it is paused, you can open the Local settings for the zone via the Zone menu, and select Keep synchronized to restart synchronization.
4. Synchronization can also be stopped if you have no network connection to the organization servers, or if there is not enough local disk space left for Synker to work.
5. It can also happen that Synker has been placed in quarantine mode as described in [What does Quarantine mean?][What does Quarantine mean?].
6. The zone can also have been deactivated on your computer. In that case, there will be no tab for the zone in Synker's main window. To activate a deactivated zone, go to the Zones table under the Overview tab, right-click on the zone there, and choose Activate.

[How do I see what has happened to a file?]: #how-do-i-see-what-has-happened-to-a-file
[I cannot find a file]: #i-cannot-find-a-file
[Why can I not see the change I made in a zone?]: #why-can-i-not-see-the-change-i-made-in-a-zone
[I want to remove the latest changes to a file]: #i-want-to-remove-the-latest-changes-to-a-file
[I would like to see and possibly work with an old version of a file without changing the current version]: #i-would-like-to-see-and-possibly-work-with-an-old-version-of-a-file-without-changing-the-current-version
[Why is there a file on my computer with a name starting with "~Conflicting"?]: /synkzone/collaboration-and-conflict-management/#why-is-there-a-file-on-my-computer-with-a-name-starting-with-conflicting
[I want to prevent others from modifying a file]: /synkzone/collaboration-and-conflict-management/#i-want-to-prevent-others-from-modifying-a-file
[What does Quarantine mean?]: /synkzone/miscellaneous/#what-does-quarantine-mean
