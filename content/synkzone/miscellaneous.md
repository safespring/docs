# Miscellaneous

## What does Travel mode mean?

1. In travel mode, Synker tries to reduce network traffic, which may be useful if the available internet connection has a limited capacity or if data traffic is expensive. This reduction of network traffic may however also result in some reduced performance.
2. Among other things, Synker avoids in travel mode to automatically download new files and file versions as they become available, and instead just keeps those files in the archived form until they are explicitly requested.

## Why does Synker say that I am offline although I have working internet connection?

1. This may be due to temporary maintenance of your organization's servers.
2. It may also be caused by special access restrictions on the network that you are connected to, e.g. certain guest networks. Synker can handle several such restrictions, but there are unfortunately cases when it does not work.

## What does Quarantine mean?

1. Synker can be placed in quarantine mode either on explicit request by you, or automatically if there is a suspicion that your computer has been infected by malicious software such as ransomware that tries for modify or manipulate files in one or more of your zones.
2. Quarantine mode can be switched on and off in the Client menu.
3. In quarantine mode, Synker will attempt to counteract all changes made in zones on the local computer. All changes made by other user will however still be synchronized as usual (depending on the settings for each zone), but all changes made locally will be treated as conflicts. This means that local changes will be saved in conflict files (see [Why is there a file on my computer with a name starting with "~Conflicting"?][Why is there a file on my computer with a name starting with "~Conflicting"?]), and changes files will be automatically restored. This will however, happen with longer delay than usual (about 10-15 minutes).
4. In this way, unwanted changes and effects of malicious software can be prevented from spreading to other computers and users

## Can I switch to a different language in Synker?

1. Normally, Synker follows the general language settings on your computer, but you can choose to disable this in Synker's client preferences.
2. English will be used if the language you have chosen for your computer is not supported by Synker, or if you have disabled Synker's automatic language setting.

[Why is there a file on my computer with a name starting with "~Conflicting"?]: /synkzone/collaboration-and-conflict-management/#why-is-there-a-file-on-my-computer-with-a-name-starting-with-conflicting
