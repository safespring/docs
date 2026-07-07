# Deploy Your First Application

This guide deploys [podinfo](https://github.com/stefanprodan/podinfo), a small Go web application, on Safespring Kubernetes Engine. The deployment covers the building blocks most applications need:

- a **Secret** injected as an environment variable
- a **PersistentVolumeClaim** mounted for data that survives pod restarts
- **HTTPS exposure** with a Let's Encrypt certificate, via Ingress or Gateway API

## Prerequisites

- A running SKE cluster and a kubeconfig [obtained from the portal](portal-overview.md#accessing-kubernetes-cluster), active in your shell via the `KUBECONFIG` environment variable.
- `kubectl` installed locally.
- A DNS A record for your application hostname pointing at the cluster's public IPv4 address, shown in the portal. The examples use `podinfo.example.com` — replace it with your hostname throughout.

Apply each manifest below with `kubectl apply -f <file>`.

## Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: podinfo-demo
```

## Secret

The secret holds the message podinfo displays on its start page, so you can verify the value reached the pod.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: podinfo-secret
  namespace: podinfo-demo
type: Opaque
stringData:
  ui-message: "Hello from a Kubernetes Secret"
```

!!! note
    Applying a plain `Secret` manifest is fine for getting started, but do not commit one to Git.
    See [Secret Management](secret-management.md) for Git-safe workflows.

## Persistent Volume Claim

The claim provisions a Cinder block volume through the pre-installed CSI driver. See [Persistent Volumes](persistent-volumes.md) for the available [storage classes](persistent-volumes.md#storage-classes) and how to expand a volume later.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: podinfo-data
  namespace: podinfo-demo
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast
  resources:
    requests:
      storage: 1Gi
```

## Deployment

The deployment consumes the secret as the `PODINFO_UI_MESSAGE` environment variable and mounts the volume at `/data`, where podinfo's `/store` endpoint writes.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: podinfo
  namespace: podinfo-demo
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: podinfo
  template:
    metadata:
      labels:
        app: podinfo
    spec:
      securityContext:
        runAsUser: 1000
        runAsGroup: 1000
        fsGroup: 1000
        runAsNonRoot: true
      containers:
        - name: podinfo
          image: ghcr.io/stefanprodan/podinfo:6.7.1
          command:
            - ./podinfo
            - --port=9898
            - --data-path=/data
          env:
            - name: PODINFO_UI_MESSAGE
              valueFrom:
                secretKeyRef:
                  name: podinfo-secret
                  key: ui-message
          ports:
            - name: http
              containerPort: 9898
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /healthz
              port: http
          readinessProbe:
            httpGet:
              path: /readyz
              port: http
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              memory: 128Mi
          volumeMounts:
            - name: data
              mountPath: /data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: podinfo-data
```

!!! note
    `strategy: Recreate` matters here: a `ReadWriteOnce` volume can only attach to one node.
    A rolling update would start the new pod before the old one releases the volume and deadlock.

## Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: podinfo
  namespace: podinfo-demo
spec:
  selector:
    app: podinfo
  ports:
    - name: http
      port: 80
      targetPort: http
      protocol: TCP
  type: ClusterIP
```

## Expose the Application over HTTPS

[Cert Manager](https://cert-manager.io/) is pre-installed on every cluster, but a `ClusterIssuer` is not — you create one per cluster. Both options below use Let's Encrypt with an HTTP-01 solver, so the DNS record from the prerequisites must be in place before the certificate can be issued.

Pick **one** of the two options. See [Traffic Management](manage-traffic.md) for a comparison.

!!! note
    Let's Encrypt rate-limits failed and repeated issuance per domain. While experimenting, use the
    staging server `https://acme-staging-v02.api.letsencrypt.org/directory` in the `ClusterIssuer`,
    then switch to production.

### Option A: Ingress

Cilium provides the `IngressClass` named `cilium`; verify with `kubectl get ingressclass`.

Create the issuer with an Ingress HTTP-01 solver:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-ingress
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: you@example.com
    privateKeySecretRef:
      name: letsencrypt-ingress-private-key
    solvers:
      - http01:
          ingress:
            ingressClassName: cilium
```

The `cert-manager.io/cluster-issuer` annotation makes cert-manager request the certificate and store it in the secret named under `tls.secretName`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: podinfo
  namespace: podinfo-demo
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-ingress
spec:
  ingressClassName: cilium
  tls:
    - hosts:
        - podinfo.example.com
      secretName: podinfo-tls
  rules:
    - host: podinfo.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: podinfo
                port:
                  number: 80
```

### Option B: Gateway API

The clusters ship with [Gateway API](https://gateway-api.sigs.k8s.io/) enabled and the `GatewayClass` named `cilium`.

Create the Gateway first — the certificate solver below attaches a challenge route to its HTTP listener:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: podinfo-gateway
  namespace: podinfo-demo
spec:
  gatewayClassName: cilium
  listeners:
    - name: https
      hostname: "podinfo.example.com"
      port: 443
      protocol: HTTPS
      tls:
        mode: Terminate
        certificateRefs:
          - kind: Secret
            name: podinfo-tls
      allowedRoutes:
        namespaces:
          from: Same
    - name: http
      hostname: "podinfo.example.com"
      port: 80
      protocol: HTTP
      allowedRoutes:
        namespaces:
          from: Same
```

Create the issuer and request the certificate. The HTTPS listener stays unready until the secret `podinfo-tls` exists; issuance succeeds anyway because the HTTP-01 challenge uses the HTTP listener.

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-gateway
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: you@example.com
    privateKeySecretRef:
      name: letsencrypt-gateway-private-key
    solvers:
      - http01:
          gatewayHTTPRoute:
            parentRefs:
              - name: podinfo-gateway
                namespace: podinfo-demo
                kind: Gateway
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: podinfo-tls
  namespace: podinfo-demo
spec:
  secretName: podinfo-tls
  issuerRef:
    name: letsencrypt-gateway
    kind: ClusterIssuer
  dnsNames:
    - podinfo.example.com
```

Route HTTPS traffic to the service and redirect plain HTTP to HTTPS:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: podinfo-https
  namespace: podinfo-demo
spec:
  parentRefs:
    - name: podinfo-gateway
      sectionName: https
  hostnames:
    - "podinfo.example.com"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: "/"
      backendRefs:
        - name: podinfo
          port: 80
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: podinfo-http-redirect
  namespace: podinfo-demo
spec:
  parentRefs:
    - name: podinfo-gateway
      sectionName: http
  hostnames:
    - "podinfo.example.com"
  rules:
    - filters:
        - type: RequestRedirect
          requestRedirect:
            scheme: https
            statusCode: 301
```

## Verify

Wait for the pod and the certificate to become ready:

```shell
kubectl -n podinfo-demo get pods
kubectl -n podinfo-demo get certificate
```

The certificate is issued when `READY` is `True`; the first issuance typically takes a minute or two.

Open `https://podinfo.example.com` in a browser. The start page shows the message from the secret. Or check the environment directly:

```shell
➜ curl -s https://podinfo.example.com/env | grep PODINFO_UI_MESSAGE
  "PODINFO_UI_MESSAGE=Hello from a Kubernetes Secret",
```

Verify data survives a pod restart. `POST /store` writes the payload to the volume and returns its hash:

```shell
➜ curl -s -X POST https://podinfo.example.com/store -d 'hello world'
{"hash":"<hash>"}

➜ kubectl -n podinfo-demo delete pod -l app=podinfo
➜ kubectl -n podinfo-demo wait --for=condition=Ready pod -l app=podinfo

➜ curl -s https://podinfo.example.com/store/<hash>
hello world
```

The replacement pod reads the data from the persistent volume — the container filesystem itself was discarded.

## Clean Up

```shell
kubectl delete namespace podinfo-demo
kubectl delete clusterissuer letsencrypt-ingress letsencrypt-gateway
```

Deleting the namespace removes the PVC, and the storage class's `Delete` reclaim policy removes the underlying Cinder volume and its data.

## Next Steps

- [Traffic Management](manage-traffic.md) — advanced routing with Gateway API
- [Secret Management](secret-management.md) — encrypted secrets in Git
- [Persistent Volumes](persistent-volumes.md) — storage classes and volume expansion
- [Observability](observability.md) — metrics and monitoring
