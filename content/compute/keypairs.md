#Handling SSH key pairs
A key pair is needed to connect to your newly created instance over SSH. OpenStack gives you the option to either generate a key pair in OpenStack or import an already existing key pair.
##Generate with OpenStack
Under "Compute->Access & Security" in the dashboard there is a tab called "Key Pairs". There are two buttons at the top:

- Create Key Pair
- Import Key Pair

By pressing "Create Key Pair" you will be presented with a dialogue where you can name your key pair. When that is done, you press "Create Key Pair" at the bottom. The browser will start downloading the private part of the key as a PEM-file. You should save this file in a secure place.

If you are using an operating system which runs OpenSSH you will be able to use the pem-file directly with the -i flag to the ssh command. If you are using PuTTY on Windows you will need to convert the pem-file to a format Putty understands. This is done with the PuTTYgen-program (that is installed alongside PuTTY if you are using the installer for PuTTY).

When Puttygen has started go to the menu entry File->Load private key. Since files ending with .pem is not recognized you pick "All files *.*" in the open dialogue and then open the key you downloaded from the dashboard. You should get a notification that PuTTYgen has imported the key. You are recommended to set a password for the key - otherwise anyone with access to your computer will be able to log in to you instance. Now you press "Save private key" and name file.


## Import already existing key
This is fairly straight forward: if using a system that uses OpenSSH you only copy the public key (of you already existing key) into the text field in the "Import Key Pair" dialogue.

If using PuTTY you start PuTTYgen and copy the public part of the key from the text-field at the top (once you have loaded you key).

##Once the key is installed
If you start PuTTY you now will be able to go to SSH->Auth in the session configuration dialogue and use the file picking window under "Private key for authentication" to point to you converted key. If you also give the Floating IP that you have assigned (and updated the security groups to allow SSH-traffic) you now should be able to log in to you instance with you key and password that you set in the convert procedure.
