# Trouble Shooting

## Cluster Authentication

1. Check `kubectl --kubeconfig=demo-kubeconfig cluster-info`
2. If there is no response, [re-run the steps to authenticate](authentication.md).
3. If there is no response contact `support@safespring.com`

## Debugging Resources: **Deployments**, **StatefulSets**, **Pods**

We offer a few pointes on how to identify issues with core Kubernetes resources in an kubernetes cluster:

- Checking pod status and logs;
- Describing deployments, StatefulSets and pods to identify issues;
- Reviewing events;
- Inspecting image pulls, health probes, and network configurations.

By following these techniques, you should be able to identify the root cause of most issues in Kubernetes resources.

### Check the Status of the Resource

To start debugging a deployment, check its status.

```bash
kubectl get deployment <deployment-name> -n <namespace>
```

This will show you if the deployment is in a healthy state. Check the number of replicas that are available, desired, and updated.

### Describe the Resource

The `describe` command gives detailed information about a deployment, including events related to its progress.

```bash
kubectl describe deployment <deployment-name> -n <namespace>
```

Look for the **Events** section at the bottom of the output for any errors or warnings. This will indicate if there are issues with scheduling pods, image pulls, or insufficient resources.

### Check the Status of Pods

Once you know which deployment is having issues, inspect the pods it created:

```bash
kubectl get pods -n <namespace>
```

You will see the status of each pod, including:

- **Running**
- **Pending**
- **CrashLoopBackOff**
- **Error**

If a pod is not in the `Running` state, you can use the following commands to investigate further.

### Describe a Pod

To get detailed information about a specific pod:

```bash
kubectl describe pod <pod-name> -n <namespace>
```

This command provides:

- **Container states**: Running, Waiting, Terminated, etc.
- **Events**: Look at the events section for potential errors like image pull issues, readiness or liveness probe failures, and scheduling errors.

### View Pod Logs

If a pod is running but not behaving as expected, you can check its logs:

```bash
kubectl logs <pod-name> -n <namespace>
```

If your pod has multiple containers, specify the container name:

```bash
kubectl logs <pod-name> -c <container-name> -n <namespace>
```

For pods that restart frequently (e.g., in **CrashLoopBackOff** state), you can view logs from the previous instance:

```bash
kubectl logs <pod-name> -c <container-name> --previous -n <namespace>
```

### Inspect Events in the Namespace

Events in kubernetes cluster provide helpful insight into what is happening within your project. These logs include scheduling, resource availability, and networking-related issues.

```bash
kubectl get events -n <namespace>
```

Reviewing events will give you a timeline of what went wrong, such as issues pulling images, scheduling pods, or mounting volumes.

### Debug a Stuck or Failed Pod

If a pod is stuck in a pending state or continuously restarting (e.g., **CrashLoopBackOff**), you can use `kubectl debug` to start an interactive troubleshooting session.

```bash
kubectl debug pod/<pod-name> -n <namespace>
```

This will create a copy of the pod with debugging utilities, allowing you to enter the pod and inspect its contents.

You can also debug the node where the pod is scheduled if it's a node-related issue:

```bash
kubectl debug node/<node-name>
```

### Verify Image Pull and Permissions Issues

If the pod is stuck in **ImagePullBackOff**, it indicates a problem pulling the container image. Check for these possible issues:

- Incorrect image name or tag.
- No access to the private image registry.
- Missing image pull secrets.

You can also describe the pod to see image pull errors:

```bash
kubectl describe pod <pod-name> -n <namespace>
```

If you are using a private registry, make sure the correct image pull secret is configured:

```bash
kubectl get secrets -n <namespace>
```

### Debugging Using Remote Shell

You can open a remote shell to a running pod for more in-depth debugging:

```bash
kubectl rsh <pod-name> -n <namespace>
```

This gives you direct access to the container’s shell, where you can inspect logs, files, or processes inside the pod.

### Check Health Probes (Liveness and Readiness)

If your pods are failing health checks, check the configured liveness and readiness probes in the pod spec.

Use `kubectl describe pod` to see if the probes are failing:

```bash
kubectl describe pod <pod-name> -n <namespace>
```

If the probes are misconfigured or the application takes too long to start, the pod may restart continuously or fail to become ready.

### Check Network Policies

Network policies might block traffic to or from the pod. Ensure that your pod has the appropriate network policies to allow inbound/outbound traffic. You can check existing network policies with:

```bash
kubectl get networkpolicy -n <namespace>
```

You can then describe specific network policies to see if they are impacting the pod’s networking.

### Inspect Persistent Volume Claims (PVCs)

If your application uses persistent storage, a pod might fail to start if it cannot mount a persistent volume. Check for PVCs that are not in the `Bound` state:

```bash
kubectl get pvc -n <namespace>
```

If a PVC is stuck in the `Pending` state, describe it to find out more:

```bash
kubectl describe pvc <pvc-name> -n <namespace>
```
