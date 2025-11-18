# Persistent Volumes

Container filesystems are ephemeral by default, meaning they reset after an application restart. If your app needs persistent data storage (e.g., for a database such PostgreSQL), use a PersistentVolumeClaim (PVC). This PVC can be mounted to any path within your container.

Consider the following:

- To use the feature the [optional Cinder CSI component](getting-started.md#additional-components) should be activated on your Safespring on-demand Kubernetes;
- **Size:** Can be expanded, but not reduced;
- **StorageClass:** Represents the "kind" of storage which are equivalent to the storage classes available on [Openstack Volume types](../compute/flavors.md);
- **AccessMode:** Typically, only one pod can mount a given PVC at a time, though some storage classes allow multiple pods to access it simultaneously.

## Storage classes

Available storage classes are based Cinder block storage volumes - `ReadWriteOnce` mode is possible at the moment and the retention policy is `Delete`.

- `large` - well suited for most common use case and recommended for long term storage
- `fast` (default) - best for application that require fast random RW capabilities where performance is very important

```shell
➜ kubectl get storageclasses.storage.k8s.io
NAME              PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
fast              cinder.csi.openstack.org   Delete          Immediate           true                   9m33s
large (default)   cinder.csi.openstack.org   Delete          Immediate           true                   9m33s
```

## Creating a Persistent Volume

We are going to create a [persistent volume claim](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims) in the `test` namespace.

To replicate the example make sure:

- `kubeconf-demo` is [obtained](portal-overview.md#accessing-kubernetes-cluster) for that specific cluster
- `test` namespace exists or created using `kubectl --kubeconfig=kubeconf-demo create ns test`

```bash
➜ cat <<EOF | kubectl --kubeconfig=kubeconf-demo apply -f -

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: csi-pvc-cinderplugin
  namespace: test
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: fast

EOF
```

Result can be verified with

```bash
➜ kubectl --kubeconfig=kubeconf-demo get pvc -n test 
NAME                   STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
csi-pvc-cinderplugin   Bound    pvc-019cff07-4a0f-4e62-b80b-e9d390500ad3   1Gi        RWO            fast           <unset>                 17s

```
And the resulting persistent volume

```bash
➜ kubectl --kubeconfig=kubeconf-demo get pv                                                                                                                                
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                       STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
pvc-019cff07-4a0f-4e62-b80b-e9d390500ad3   1Gi        RWO            Delete           Bound    test/csi-pvc-cinderplugin   fast           <unset>                          11s
```

### Extending Persistent Volumes

To extend the persistent volume created above we can make use of: `kubectl --kubeconfig=kubeconf-demo patch pvc -n test csi-pvc-cinderplugin -p '{"spec":{"resources":{"requests":{"storage":"5Gi"}}}}'`, which would extend the volume to `5Gi`

The result can be monitored using:


```bash

➜ kubectl --kubeconfig=kubeconf-demo get pv                                                                                           
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                       STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
pvc-019cff07-4a0f-4e62-b80b-e9d390500ad3   5Gi        RWO            Delete           Bound    test/csi-pvc-cinderplugin   fast           <unset>                          5m10s
```

While the volume has been resized the persistent volume is waiting for

```bash
➜ kubectl --kubeconfig=kubeconf-demo describe pvc -n test csi-pvc-cinderplugin 
Name:          csi-pvc-cinderplugin
Namespace:     test
StorageClass:  fast
Status:        Bound
Volume:        pvc-019cff07-4a0f-4e62-b80b-e9d390500ad3
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
               volume.beta.kubernetes.io/storage-provisioner: cinder.csi.openstack.org
               volume.kubernetes.io/storage-provisioner: cinder.csi.openstack.org
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      1Gi
Access Modes:  RWO
VolumeMode:    Filesystem
Used By:       <none>
Conditions:
  Type                      Status  LastProbeTime                     LastTransitionTime                Reason  Message
  ----                      ------  -----------------                 ------------------                ------  -------
  FileSystemResizePending   True    Mon, 01 Jan 0001 00:00:00 +0000   Tue, 18 Nov 2025 16:06:48 +0200           Waiting for user to (re-)start a pod to finish file system resize of volume on node.
Events:
  Type    Reason                    Age    From                                                                                                        Message
  ----    ------                    ----   ----                                                                                                        -------
  Normal  ExternalProvisioning      5m48s  persistentvolume-controller                                                                                 Waiting for a volume to be created either by the external provisioner 'cinder.csi.openstack.org' or manually by the system administrator. If volume creation is delayed, please verify that the provisioner is running and correctly registered.
  Normal  Provisioning              5m48s  cinder.csi.openstack.org_csi-cinder-controllerplugin-59d4999d75-82lkb_2e1570f2-9849-4ded-aa52-dc0209a7e981  External provisioner is provisioning volume for claim "test/csi-pvc-cinderplugin"
  Normal  ProvisioningSucceeded     5m47s  cinder.csi.openstack.org_csi-cinder-controllerplugin-59d4999d75-82lkb_2e1570f2-9849-4ded-aa52-dc0209a7e981  Successfully provisioned volume pvc-019cff07-4a0f-4e62-b80b-e9d390500ad3
  Normal  ExternalExpanding         50s    volume_expand                                                                                               waiting for an external controller to expand this PVC
  Normal  Resizing                  50s    external-resizer cinder.csi.openstack.org                                                                   External resizer is resizing volume pvc-019cff07-4a0f-4e62-b80b-e9d390500ad3
  Normal  FileSystemResizeRequired  49s    external-resizer cinder.csi.openstack.org                                                                   Require file system resize of volume on node

```

Once a pod that has that persistent volume claim attached has been restarted the resize will complete.
