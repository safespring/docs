# Collaboration and conflict management

## I want to prevent others from modifying a file

1. Find the file in Synker.
2. Right-click the file in the file directory and choose Lock.
3. The file will now be displayed with a green color, and its status will be that it is locked by you on this particular computer. This means that only you on this computer will be allowed to modify the file.
4. The file will be displayed with a red color on all other computers where you or someone else is logged on, and the file will be write protected on those computers. This means that most applications not will allow modifications to the file to be saved.
5. The file can be unlocked as described in [How can I unlock a locked file so that I can modify it?][How can I unlock a locked file so that I can modify it?].

## How can I unlock a locked file so that I can modify it?

1. You can only unlock a file if either you have locked it yourself, if you have Manage rights in the zone, of you are an administrator (see [How can I become a Synkzone administrator for my organization?][How can I become a Synkzone administrator for my organization?]).
2. Right-click the file in Synker and choose Unlock to unlock the file.
3. When it is unlocked, any participant in the zone with Update rights or higher will be able to modify the file.
4. It can also happen that you cannot modify a file even if it is not locked. This can happen if the file is locally write protected, in which case that will be indicated by the file status in Synker. To remove such write protection you will need to use the local file manager (e.g. Windows Explorer or macOS Finder) to open the file properties and change its write
protection. Such a change will also be synchronized and will be made on all computers that participate in the zone.

## How can I undo all the latest changes made by a user?

1. Go to the zone log and right-click the first of the changes that you want to undo (you may have to change the level of detail to Detailed to see all relevant changes).
2. Choose Undo this and later file changes.
3. As far as possible, the selected change all later changes made by the same user will be undone. All changes made to undo the chosen changes will be logged in the zone log.
4. If a file has later been changed also by any other user, that and later changes for the same file will not be undone.

## Why do I get a message that I have changed a file at the same time as another user?

1. This will happen if you have save changes to a file on your computer that have not yet been registered by Synker at the same time as someone else has modified the same file. This may happen if you have been offline, if the zone synchronization has been stopped for some other reason, or you only just modified the file.
2. To prevent your changes to the file from being overwritten or hidden as an old file version without you realizing it, Synker will warn you if this happens so that you in collaboration with the other user can merge your different changes manually.
3. When this happens, your modified version of the file gets saved to file with the same name as the original file but with ~Conflicting as a prefix. This is called a conflict file, which you can read more about in [Why is there a file on my computer with a name starting with "~Conflicting"?][Why is there a file on my computer with a name starting with "~Conflicting"?].
4. You can to some extent avoid conflicts like these by deciding who is allowed to change a particular file, and then lock it for only that user to change. You can read more about this in [I want to prevent others from modifying a file][I want to prevent others from modifying a file].

## Why is there a file on my computer with a name starting with "~Conflicting"?

1. This is an automatically created file that contains a modified version of a file that you have created at the same time (possibly while you have been working offline) as another user has created a different version. See also [Why do I get a message that I have changed a file at the same time as another user?][Why do I get a message that I have changed a file at the same time as another user?]. This happens if it is possible that two users, without realizing it, can have made simultaneous changes to a file that Synker
cannot resolve. This so called conflict file has the same name as the original file, but with ~Conflicting as prefix.
2. You can also get a conflict file if you have tried to modify or add a file in a zone without having the necessary access rights in the zone. See also [Why do I get a message that I cannot add, modify, or delete a file or a folder?][Why do I get a message that I cannot add, modify, or delete a file or a folder?].
3. You can only see a conflict file on the computer where you created its contents.
4. If the conflict file corresponds to an already existing file in the zone, the status for that file will include "conflict" as a reminder to you that a potential conflict may exist for that file.
5. Creation of conflict files in a folder is also recorded in a file called ~Conflicts.txt in the same folder. This helps you to later determine the cause of the conflict and if necessary merge any changes in collaboration with other users.
6. To see more information about what has caused a conflict, you can right-click the file and select Show conflict.
7. You can remove a conflict file at any time when you decide that you do not need it any more. If the conflict file corresponds to an existing file in the zone, you can also right-click on that file and choose Remove conflicting version.
8. You need to manually review and resolve all conflicts by comparing the conflict file and the normal file.
9. If you want to remove all conflicts in a folder at one, you can right-click the folders path at the top of the directory panel for the zone, and then select Remove conflicts.

## What does it mean that the status of a file in the zone directory is ”conflict”?

1. It means that a conflict file exists for that file on the local computer. You can read more about conflict files in [Why is there a file on my computer with a name starting with "~Conflicting"?][Why is there a file on my computer with a name starting with "~Conflicting"?].
2. When you are sure that any possible conflict has been handled so that the conflict file no longer is needed, you may remove it by right-clicking the file in Synker and choose Remove conflict version. The status of the file will change as soon as the conflict file has been removed. Note that if the conflict file is open in some other application, it may not be possible to remove it, in which case you need to close the file in the other application first.

[Why is there a file on my computer with a name starting with "~Conflicting"?]: #why-is-there-a-file-on-my-computer-with-a-name-starting-with-conflicting
[I want to prevent others from modifying a file]: #i-want-to-prevent-others-from-modifying-a-file
[How can I become a Synkzone administrator for my organization?]: /synkzone/username-and-password/#how-can-i-become-a-synkzone-administrator-for-my-organization
[How can I unlock a locked file so that I can modify it?]: #how-can-i-unlock-a-locked-file-so-that-i-can-modify-it
[Why do I get a message that I cannot add, modify, or delete a file or a folder?]: /synkzone/working-with-files/#why-do-i-get-a-message-that-i-cannot-add-modify-or-delete-a-file-or-a-folder
[Why do I get a message that I have changed a file at the same time as another user?]: #why-do-i-get-a-message-that-i-have-changed-a-file-at-the-same-time-as-another-user
