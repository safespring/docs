# Zones

## What is a zone?

1. A zone is a folder of files shared by one or more users with different access rights.
2. Within an organization, zones may be created to fit the organization's structure and workflows. For example, different zones created for different departments and functions, for different projects, for different clients, or for various external partners.
3. Zones can also have different properties controlled by the zone types you can read more about under [What is a zone type?][What is a zone type?].
4. When you become a participant in a zone, a local folder that corresponds to the zone will be assigned on each computer where you log on to Synker. Normally, Synker then keeps this folder synchronized with the current zone content.
5. In Synker there is a tab for each zone you participate in and which is active. In each such tab, you can view a file directory that shows all content in the zone and its current status on your computer. Above the file directory, you can see where on your computer the local files are stored, and you can open that location in the local file browser (e.g. Windows Explorer or macOS Finder) on your computer by double clicking on it.
6. For each zone there is also a log, referred to as the zone log, of everything that happens with files in the zone and who did what, which makes collaboration easier. In the zone log, you can also write messages to other users in the zone, for example to explain what changes have been made to a particular file.
7. Learn more about how to get access to a zone under [How do I get a new zone?][How do I get a new zone?] or [How do I create a new zone?][How do I create a new zone?].

## How do I get a new zone?

1. It depends on what your organization chooses to allow.
2. As a normal user, you may be allowed to create a private zone where only you can be a participant. If it is allowed, you can do this by choosing New zone in the Zone menu. Also see [How do I create a new zone?][How do I create a new zone?].
3. If you are a Synkzone administrator within your organization, then follow the instructions in [How do I create a new zone?][How do I create a new zone?].
4. Otherwise, you turn to any person who is an administrator for your organization (the Main administrator or any other user with administrator privileges) and ask for a new zone to be created for you.
5. As soon as you get access to a zone, you also get a notification that you can read more about under [I have received a message that I am invited to a zone. What do I do?][I have received a message that I am invited to a zone. What do I do?].

## How do I create a new zone?

1. It is only Synkzone administrators in your organization who can create arbitrary zones, but for some organizations, other internal users are allowed to create their own private zones.
2. Select New Zone in the Zone menu Synker. If you do not have the right to create a new zone, this option is disabled (grayed out in the menu), and then you have to turn to a Synkzone administrator (read more [How can I become a Synkzone administrator for my organization?][How can I become a Synkzone administrator for my organization?]).
3. In the dialog box that opens, enter a descriptive name for the zone. It is to use the same name for several zones, but to make it easier to find the zone it is best to choose a unique name that also describes the purpose of the zone. If you choose a long name or description, it will sometimes be displayed in a truncated form with just the first and last parts of the name shown.
4. If you have the rights to create shared zones, you also need to select a zone type (read more about zone types in [What is a zone type?][What is a zone type?]). Otherwise the zone type will be Private, which means that the zone can only be accessed by you and there may be other restrictions on how much can be stored and how many old file versions are saved.
5. In a zone that you created, you always get Manage rights. If it is not a private zone, or if you are an administrator, you can now start to give other users access rights to the zone. You can even give someone else Manage rights and then leave the zone, which is a way for administrators to create zones for other users without being participants themselves.

## What is a zone type?

1. A zone type determines how the files in the zone are stored and made available, the extent to which old versions of files will be saved, and certain restrictions on how files are stored locally on individual computers.
2. There are three basic types of zones, but more specialized types may be available for organizations with special needs:
    21. **Normal.** This is the default type for common zones shared by multiple users within the organization. It means that up to 20 previous versions of each file will be saved for up to a month after they have been created.
    22. **Private.** This is the default type for zones that are only intended for use by individual users. It means there are some restrictions on how much zone can contain, and that only the most recent previous version of each file is saved for a month after a file is modified.
    23. **Safe.** This is a special type of zone similar to Normal, but which always forces all files on individual computers to be archived (see also [What is an "Archived Synker file" (file suffix .skz)?][What is an "Archived Synker file" (file suffix .skz)?]) within a few minutes when they are not used, and the user is required to enter their password to retrieve any archived file. This is a suitable choice for extra sensitive zones with files that you do not want to be available in plain text on computers when they are not in use. The downside is that sometimes, but not always, you have to be online to be able to open files in Safe zones (some files may still be stored locally in a highly encrypted form and can be accessed even without connection).

## How do I add a user to a zone?

1. You must have Manage rights for the zone to do this. You get Manage rights either if you created the zone, or if any other participant with Manage rights gives you Manage rights.
2. If the zone is private, i.e. the zone type is Private and only you are a participant, you are not allowed to add other users.
3. Go to the Participants list in the zone (scroll right or left until you see it).
4. If you have the right to add users, the end of the list shows all available users within the organization who are not already participants in italics. Double-click the user you want to add. If you are an administrator and want to create a new user account that will be included in the zone, click instead on the + at the bottom of the user list (read more about creating new user accounts in [How can I create a new account?][How can I create a new account?]).
5. In the dialog with user information that opens, you can now choose what access rights you want the new user to have. Once you have assigned rights, the user becomes a participant in the zone and will be notified about this.

## I have received a message that I am invited to a zone. What do I do?

1. When you have confirmed that you have seen the invitation, suggested local settings for the zone will be shown, and you can adjust them if you like. Then click OK to accept the settings as they are shown, or Cancel to revert to the default settings that normally mean that the zone will be set to not synchronize.
2. See [How can I change how a zone is synchronized?][How can I change how a zone is synchronized?] for more information about local zone settings.
3. If you do not want to participate in the zone or think you have been invited by mistake, you can choose to leave the zone by selecting Leave on the Zone menu. After leaving the zone in this way, you can only access it again by asking a Manager of the zone to invite you back.
4. If you do not want to participate in the zone right now, but want to be able to start work in it the later, you can look up the zone in the zone table in the Overview tab, right-click it and select Deactivate. The zone will then not appear on your computer other than in the zone table until you later choose to activate it (select Activate in the zone table)..

## How can I change how a zone is synchronized?

1. Open the local settings for the zone. You can do this by selecting Local settings in the Zone menu when the tab for the zone is selected, by clicking on the zone status symbol in the zone’s directory panel, or by right-clicking the zone in the zone table under the Overview tad and select Local settings.
2. You can see where the local files are stored for the zone. Click on the … button to right to change this place. Synker will help you make sure that you do not accidentally overlap the mappings of zones, and to move all files if a new location is chosen.
3. You can set allocated storage space for the zone. If the zone is bigger than this, some of the least recently accessed files will be archived (see [What is an "Archived Synker file" (file suffix .skz)?][What is an "Archived Synker file" (file suffix .skz)?]) to take up less space.
4. You can choose if the zone shall be synchronized or not. If a zone is not being synchronized, any changes you make locally will not become available for others, and no changes made by others will be downloaded. When a zone is set not to be synchronized, its status will be “paused”.
5. You can choose if new files or file versions shall be downloaded automatically as they become available or more local storage space is allocated. Exceptions to this are if Synker is in Travel mode, or if a file has not be changed since a short time before the storage location for the zone was set.

## What can I do in a zone (access rights)?

1. This is determined by your access rights in the zone. These you can see by going to the Participants list for the zone and double-click on your name. In the information box that opens, it says among other things, what access rights you have.
2. The available rights are:
    21. **Access** (only get to see and open files),
    22. **Add** (also add new files, but not modify or delete),
    23. **Update** (also modify files, but not delete)
    24. **Modify** (also delete files), and
    25. **Manage** (same rights as Modify in terms of files, but also have the right to add and remove participants and change their access rights, and can always unlock locked files).

## How do I find where the files in a zone are stored on my computer?

1. Open the zone in Synker by selecting its tab.
2. Go to the panel showing the file directory (Files).
3. At the top above the list of files that is the full local path to the folder in the zone shown in the file directory.
4. Double click on the path to open the corresponding folder on your computer.
5. You can also right-click on a single file or folder in Synker and choose Show in local file manager to open the corresponding folder on your computer.

## How can I share a file with someone else?

1. If it is someone with an account in your organization, the simplest way is to share a zone with that user. Remember that all participants in a zone can see all the files that are there, so it may not always be the best if it is something private.

## Can I prevent a folder or file from being synchronized?

1. Yes, you can right-click a folder or file in the directory in Synker and selecting Do not synchronize.
2. This folder (and its contents) or file will then no longer be synchronized between users and computers that share the zone. Note that this therefore applies everywhere, and not just where the request was made.
3. You can at any time request the synchronization to start again, right-click and choose Synchronize. When synchronization starts again, some conflicts may arise if different users modified files while the synchronization was disabled.

## How can I see which files are being downloaded, uploaded, or have conflicts?

1. In every zone, there is a panel to the left of the directory panel that shows how many and which files are being downloaded, uploaded, or have a conflict (see [Why is there a file on my computer with a name starting with "~Conflicting"?][Why is there a file on my computer with a name starting with "~Conflicting"?]).
2. There you can double click any file to go directly to the corresponding folder in the directory panel.
3. This can for example be useful to check that all of your recent changes have been uploaded so that others can access them before you shut down, or to find conflicts that may need to be resolved.

[How do I create a new zone?]: #how-do-i-create-a-new-zone
[What is an "Archived Synker file" (file suffix .skz)?]: /synkzone/archived-files/#what-is-an-archived-synker-file-file-suffix-skz
[How can I change how a zone is synchronized?]: #how-can-i-change-how-a-zone-is-synchronized
[Why is there a file on my computer with a name starting with "~Conflicting"?]: /synkzone/collaboration-and-conflict-management/#why-is-there-a-file-on-my-computer-with-a-name-starting-with-conflicting
[I have received a message that I am invited to a zone. What do I do?]: #i-have-received-a-message-that-i-am-invited-to-a-zone-what-do-i-do
[How can I become a Synkzone administrator for my organization?]:
[How can I create a new account?]: /synkzone/username-and-password/#how-can-i-create-a-new-account
[What is a zone type?]: #what-is-a-zone-type
[How do I get a new zone?]: #how-do-i-get-a-new-zone
