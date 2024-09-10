# FAQ

## How can I scale my application ?

Using the Web console under the correct object e.g. `deployments`
`https://eu-2.paas.open-science-cloud.ec.europa.eu/k8s/ns/<project_name>/deployments/nginx` under the `Deployment details` the arrows can be used to scale up and down the number of pods

![Container Platform Add YAML](../images/cp-scale-pod.png)

```bash
oc scale deployment nginx -n <project_name> --replicas=0
oc get pods -w  # check pod is terminated
oc scale deployment nginx -n <project_name> --replicas=1
```

Autoscaling can be used by utilizing the [Horizontal Pod autoscaler](https://docs.okd.io/4.15/nodes/pods/nodes-pods-autoscaling.html) e.g. 
```bash
oc autoscale deployment/nginx -n <project_name> --min=5 --max=7 --cpu-percent=75
```

## How can I add configuration/secrets into my application?

- **Secrets and ConfigMaps:** Store key-value data, including text or small binary files. Secrets should be used for confidential information like passwords and certificates. You can mount ConfigMaps/Secrets as directories or individual keys as files for your application to read.
- **Environment Variables:** Can be set in various ways:
    - Manually on a resource [(e.g., Pod, Deployment, StatefulSet)](getting-started.md#core-concepts).
    - By referencing values from Secrets/ConfigMaps individually.
    - By injecting all Secret/ConfigMap values into the environment (with an optional prefix).
- **Command Line Arguments** can also be directly defined on your application.

Relevant Documentation:

- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Environment Variables](https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/)

## I noticed permissions errors when accessing a file, what is the cause?

Each project has a range of user IDs (UIDs), and every pod is assigned a different UID, which is different from standard Kubernetes. Some containers may require specific UID/group permissions.

For mounted PersistentVolumeClaims, Secrets, and ConfigMaps, the Container Platform automatically sets the appropriate permissions.

To address this:

- Modify container permissions so that a user with a random UID can run the application (recommended).
- Submit a support ticket to request custom security permissions via support@safespring.com or the official European Open Science Cloud help desk.
  - Note that permissions are tied to ServiceAccounts.
  - Ensure your pod runs with the specified ServiceAccount and that SecurityContext is set.

Relevant Documentation:

- [Service Accounts](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/)
- [Security Context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
- [Security Context Constraints](https://docs.okd.io/latest/authentication/managing-security-context-constraints.html)

## How can I access images from a private registry project?

1. **Get Credentials for Your Registry:** - for example obtain credentials from [Container Registry Web UI](registry.md#obtaining-credentials).

2. **Create a Secret with Credentials and Domain:** Create a Secret containing the registry credentials and domain, then link it to the ServiceAccount or specify its name in the imagePullSecrets of your Pod, Deployment, etc. The Container Platform will handle authentication automatically.

Relevant Documentation:

- [Using Image Pull Secrets](https://docs.okd.io/latest/openshift_images/managing_images/using-image-pull-secrets.html#images-allow-pods-to-reference-images-from-secure-registries_using-image-pull-secrets)
- [Pulling Images from a Private Registry](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)
- [Container Registry](registry.md)

## I am unable to mount volumes, what can I do?

OKD will automatically retry mounting the volume.

If the problem persists for several minutes, the issue might be that the volume is full, preventing OKD from properly mounting it, or the quota reached its limits. Here’s a possible solution:

1. Try expanding the volume following the [Expand Volume](persistent-volume.md#expand-volume) guide

2. If this doesn’t work, and you can see that the volume has been scaled properly in the PVCs, please report the issue to support@safespring.com.

## How can I spot potential problems ?

To see other info just look at your project's events:
```bash
oc get events -n <project_name>
```
