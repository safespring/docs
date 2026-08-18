# Kubernetes Cluster Traffic Management

Safespring Kubernetes Engine uses the Cilium [Gateway API](https://gateway-api.sigs.k8s.io/) as the default means of routing traffic to services running in your cluster. It offers full API lifecycle management, security, and governance.

!!! note "It's a default, not a requirement"
    Cilium comes pre-installed with Gateway API support enabled on every newly provisioned
    cluster, but you're not obliged to route traffic through it. You're free to delete the Gateway
    resources and run whatever suits your needs better - for example an
    [ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress/) such as Traefik.
    Note that this applies to the Gateway API only: Cilium itself is the cluster's CNI and, as
    covered in [Cluster Components](getting-started.md#core-components-in-a-control-plane), we do
    not recommend replacing it.

## Networking Details

Workload Clusters are deployed on top of **OpenStack infrastructure** where we orchestrate/harden traffic as follows:

- **OpenStack Security Groups**: provide a stateful virtual firewall applied to cluster nodes, plus granular filtering for API access and service ports, with explicit allowlists for Kubernetes control plane and worker node communication.
- The [Safespring load balancer](../compute/loadbalancing.md) forwards traffic to the cluster nodes on L4 TCP ports `80`, `443`, `6443` and `30000-32767`.
- TCP ports `80`, `443` and the range `30000-32767` are available for exposing your own services. Ports `80` and `443` are served by the Cilium Gateway API, and ports `30000-32767` are the Kubernetes [NodePort](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport) range - and as covered below, the Gateway can listen on any of these ports.

## How Incoming Traffic Reaches Your App

Before the examples, here is the path a request takes and the Kubernetes objects involved. If you are new to the [Gateway API](https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/), this is the high-level overview:

```
Client
  |
  v
DNS resolves your hostname to the cluster's external IP
  |
  v
Safespring load balancer  (forwards 80, 443 and 30000-32767 to the cluster nodes)
  |
  v
Gateway  (terminates TLS; can listen on 80, 443 or any port in 30000-32767)
  |
  v
HTTPRoute  (matches hostname/path)
  |
  v
Service
  |
  v
your Pods
```

You can expose a service on any port the load balancer forwards - `80`, `443`, or any port in `30000-32767` - and the Gateway can listen on all of them, so the same path applies. For a non-HTTP service you can instead skip the Gateway and expose it directly with a [`type: NodePort`](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport) Service on the `30000-32767` range, in which case TLS is your app's responsibility.

You create a handful of standard Kubernetes objects. Our default Gateways use the `cilium` implementation:

| Object | What it does | Official docs |
| --- | --- | --- |
| **GatewayClass** (`cilium`) | Selects *which* implementation runs your Gateways. Cilium provides this cluster-wide - you only reference it by name, you don't create it. | [Gateway API overview](https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/), [Cilium Gateway API](https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/) |
| **Gateway** | The entry point: which ports/protocols to listen on, and where TLS is terminated. | [Gateway API overview](https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/) |
| **HTTPRoute** | The routing rules: match on hostname/path and forward to a Service. | [HTTP routing guide](https://gateway-api.sigs.k8s.io/guides/http-routing/) |
| **Certificate** + **ClusterIssuer** | cert-manager obtains and renews the TLS certificate (via Let's Encrypt) that the Gateway serves. | [cert-manager + Gateway API](https://cert-manager.io/docs/usage/gateway/) |
| **Service** | Your application - the destination the HTTPRoute forwards to. | [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/) |

!!! note "Shared Gateway, or one Gateway per app"
    Two patterns follow. The [shared Gateway](#shared-gateway-for-multiple-services) comes first:
    a single Gateway in its own namespace that routes in any namespace can attach to
    (`allowedRoutes.namespaces.from: All`). It is what most clusters want, and what Safespring runs
    internally. The [self-contained Gateway](#self-contained-gateway-single-service) after it keeps
    everything in one namespace (`allowedRoutes.namespaces.from: Same`) and is the shortest way to
    get a single service exposed.

## Examples

### Shared Gateway for Multiple Services

A single **shared Gateway** in its own namespace, that every service attaches routes to, is the pattern that scales - and the one Safespring uses internally. Each service then only ships its own `Certificate`, `HTTPRoute`, and a `ReferenceGrant`.

The shared Gateway lives in a dedicated namespace and has one HTTPS listener per hostname, plus a single HTTP listener for redirects. `allowedRoutes.namespaces.from: All` lets routes in any namespace attach to it:

```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: gateway-system
---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: gateway-system
spec:
  gatewayClassName: cilium
  listeners:
    # One HTTP listener covers redirects for every hostname
    - name: http
      port: 80
      protocol: HTTP
      allowedRoutes:
        namespaces:
          from: All
    # Add one HTTPS listener per hostname you expose
    - name: https-my-app
      port: 443
      protocol: HTTPS
      hostname: my-app.example.com
      tls:
        mode: Terminate
        certificateRefs:
          - kind: Secret
            name: my-app-tls
            namespace: my-app        # the cert lives in the service's namespace
      allowedRoutes:
        namespaces:
          from: All
```

!!! note "Apply order"
    A listener whose `certificateRefs` Secret does not exist yet reports `ResolvedRefs=False` and
    serves no traffic - and the Secret only appears once cert-manager has completed the ACME
    challenge *through this same Gateway*. Apply the shared Gateway with its `http` listener first,
    then the per-service `Certificate`, `ReferenceGrant` and `HTTPRoute`s, and add the service's
    HTTPS listener last. If you apply everything at once, expect the HTTPS listener to stay
    degraded until the certificate is issued.

The HTTP-01 challenge for every service is served through this shared Gateway, so the `ClusterIssuer` must point its solver at the shared `http` listener. An issuer pinned to some other Gateway will not work here: the solver route cert-manager creates in your service's namespace would be rejected, and the certificate never issued.

```yaml
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-shared-gateway
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: notvalid@safespring.com
    privateKeySecretRef:
      name: letsencrypt-shared-gateway-private-key
    solvers:
    - http01:
        gatewayHTTPRoute:
          parentRefs:
          - name: gateway
            namespace: gateway-system
            sectionName: http
            kind: Gateway
```

Each service needs a [`ReferenceGrant`](https://gateway-api.sigs.k8s.io/guides/tls/) to let the shared Gateway read its TLS Secret across namespaces - the Secret lives in the service's namespace, but the Gateway reads it from `gateway-system`. Per service you apply a `Certificate`, the `ReferenceGrant`, and the `HTTPRoute`s:

```yaml
---
# TLS certificate for this service (cert-manager)
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: my-app-tls
  namespace: my-app
spec:
  secretName: my-app-tls
  issuerRef:
    name: letsencrypt-shared-gateway
    kind: ClusterIssuer
  dnsNames:
    - my-app.example.com
---
# Allow the shared Gateway to read the TLS secret from this namespace
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: my-app-tls-from-gateway
  namespace: my-app
spec:
  from:
    - group: gateway.networking.k8s.io
      kind: Gateway
      namespace: gateway-system
  to:
    - group: ""
      kind: Secret
      name: my-app-tls
---
# Route HTTPS traffic to the Service
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app
  namespace: my-app
spec:
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https-my-app
  hostnames:
    - my-app.example.com
  rules:
    - backendRefs:
        - name: my-app           # your Service
          port: 80
---
# Redirect HTTP -> HTTPS
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app-redirect
  namespace: my-app
spec:
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: http
  hostnames:
    - my-app.example.com
  rules:
    - filters:
        - type: RequestRedirect
          requestRedirect:
            scheme: https
            statusCode: 301
```

For each additional service, add one HTTPS listener to the shared Gateway and repeat the per-service block (`Certificate` + `ReferenceGrant` + `HTTPRoute`s), pointing `sectionName` at that service's listener.

### Self-Contained Gateway (Single Service)

To get a single service exposed with the least moving parts, keep everything in one namespace: the app and its Service, the `Certificate` and its `ClusterIssuer`, and the `Gateway` with its `HTTPRoute`s. `allowedRoutes.namespaces.from: Same` restricts the Gateway to routes in its own namespace, so no `ReferenceGrant` is needed.

Note that this Gateway needs its own `ClusterIssuer`: the solver's `parentRefs` point at *this* Gateway, so the issuer is not interchangeable with the shared-Gateway one above.

```yaml
---
# Namespace for our application
apiVersion: v1
kind: Namespace
metadata:
  name: cilium-gateway-demo

---
# Sample application, and the Service in front of it
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
  namespace: cilium-gateway-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-app
  template:
    metadata:
      labels:
        app: demo-app
    spec:
      containers:
      - name: demo-app
        image: nginx:1.25
        ports:
        - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: demo-app-service
  namespace: cilium-gateway-demo
spec:
  selector:
    app: demo-app
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP

---
# TLS certificate, and an issuer solving the challenge through this Gateway
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: cilium-demo-tls
  namespace: cilium-gateway-demo
spec:
  secretName: cilium-demo-tls-secret
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - cilium-demo.apps.safesdemo.paas.safedc.net

---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: notvalid@safespring.com
    privateKeySecretRef:
      name: letsencrypt-prod-private-key
    solvers:
    - http01:
        gatewayHTTPRoute:
          parentRefs:
          - name: cilium-gateway
            namespace: cilium-gateway-demo
            sectionName: http
            kind: Gateway

---
# The Gateway: an HTTPS listener terminating TLS, and an HTTP listener for redirects
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: cilium-gateway
  namespace: cilium-gateway-demo
spec:
  gatewayClassName: cilium
  listeners:
  - name: https
    hostname: "cilium-demo.apps.safesdemo.paas.safedc.net"
    port: 443
    protocol: HTTPS
    tls:
      mode: Terminate
      certificateRefs:
      - kind: Secret
        name: cilium-demo-tls-secret
    allowedRoutes:
      namespaces:
        from: Same
  - name: http
    hostname: "cilium-demo.apps.safesdemo.paas.safedc.net"
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
        from: Same

---
# Route HTTPS traffic to the Service
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: demo-https-route
  namespace: cilium-gateway-demo
spec:
  parentRefs:
  - name: cilium-gateway
    sectionName: https
  hostnames:
  - "cilium-demo.apps.safesdemo.paas.safedc.net"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: "/"
    backendRefs:
    - name: demo-app-service
      port: 80

---
# Redirect HTTP -> HTTPS
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: demo-http-redirect
  namespace: cilium-gateway-demo
spec:
  parentRefs:
  - name: cilium-gateway
    sectionName: http
  hostnames:
  - "cilium-demo.apps.safesdemo.paas.safedc.net"
  rules:
  - filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        statusCode: 301
```
