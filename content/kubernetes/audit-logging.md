# Implementing Audit Logging

## DaemonSet Audit Logger

A simple form of audit logging within a cluster can be achieved with a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/).

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: audit-log-tail
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: audit-log-tail
  template:
    metadata:
      labels:
        app: audit-log-tail
    spec:
      containers:
      - name: tail
        image: busybox:1.36
        command:
          - sh
          - -c
          - tail -f /host/var/log/audit/kube/kube-apiserver.log
        volumeMounts:
        - name: audit-log
          mountPath: /host/var/log/audit/kube
          readOnly: true
      restartPolicy: Always
      volumes:
      - name: audit-log
        hostPath:
          path: /var/log/audit/kube
          type: DirectoryOrCreate
      nodeSelector:
        node-role.kubernetes.io/control-plane: ""
      tolerations:
        - key: "node-role.kubernetes.io/control-plane"
          operator: "Exists"
          effect: "NoSchedule"
```

Once created logs can be forwarded to a preferred logging solution or monitored from the command line:

- `kubectl get pods -n kube-system` identify daemon set pods that start with `audit-log-tail-`
- `kubectl logs -f -n kube-system audit-log-tail-<pod>` follow the logs

The output, formatted, should look:

```json
{
  "kind": "Event",
  "apiVersion": "audit.k8s.io/v1",
  "level": "Metadata",
  "auditID": "audit-id",
  "stage": "ResponseComplete",
  "requestURI": "/api/v1/namespaces/kube-system/pods?limit=500",
  "verb": "list",
  "user":
    {
      "username": "zitadel:user@company.com",
      "groups": ["zitadel:admin", "system:authenticated"],
    },
  "sourceIPs": ["ip"],
  "userAgent": "kubectl/v1.35.0 (linux/amd64) kubernetes/6645204",
  "objectRef":
    { "resource": "pods", "namespace": "kube-system", "apiVersion": "v1" },
  "responseStatus": { "metadata": {}, "code": 200 },
  "requestReceivedTimestamp": "2026-01-19T14:33:22.948509Z",
  "stageTimestamp": "2026-01-19T14:33:22.954101Z",
  "annotations":
    {
      "authorization.k8s.io/decision": "allow",
      "authorization.k8s.io/reason": 'RBAC: allowed by ClusterRoleBinding "cluster-admin-group" of ClusterRole "zitadel-cluster-admin" to Group "zitadel:admin"',
    },
}
```
