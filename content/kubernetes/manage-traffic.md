# Kubernetes Cluster Traffic Management

Safespring uses the Cilium [Gateway API](https://gateway-api.sigs.k8s.io/) as the default means of routing traffic to services running in your cluster. It offers full API lifecycle management, security, and governance.

!!! note "It's a default, not a requirement"
    Cilium with Gateway API support enabled comes pre-installed on every newly provisioned
    cluster, but you're free to remove it entirely and run whatever suits your needs better -
    for example an [ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress/) such as Traefik.

If you are migrating your service from an Ingress controller (Nginx, Traefik, or any other), here is a quick comparison of the main advantages of using the Gateway API:

| Feature                        | **Ingress**                         | **API Gateway**                                           |
| ------------------------------ | ----------------------------------- | --------------------------------------------------------- |
| **Routing**                    | Host/path-based HTTP routing        | Advanced routing, multi-protocol (HTTP, gRPC, WebSockets) |
| **TLS Termination**            | ✅                                | ✅                                                      |
| **Auth (OIDC, JWT, API Keys)** | ❌ Limited (via annotations/plugins) | ✅ Built-in                                                |
| **Rate Limiting / Quotas**     | ❌ Not native                        | ✅ Core feature                                            |
| **Observability**              | Basic (via logs/metrics)            | Detailed API analytics                                    |
| **Kubernetes-native**          | ✅                                 | Sometimes (can be external)                               |
| **Best for**                   | Simple cluster ingress              | Full API management and security                          |

## Networking Details

Workload Clusters are deployed on top of **OpenStack infrastructure** where we orchestrate/harden traffic as follows:

- **OpenStack Security Groups**: provide a stateful virtual firewall applied to cluster nodes, plus granular filtering for API access and service ports, with explicit allowlists for Kubernetes control plane and worker node communication.
- The Safespring load balancer forwards traffic to the cluster nodes on L4 TCP ports `80, 443, 6443 and 30000-32767`.
- Ports `80`, `443` and the range `30000-32767` (all TCP) are available for exposing your own services. `80`/`443` are served by the Cilium Gateway API and `30000-32767` is the Kubernetes [NodePort](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport) range - and as covered below, the Gateway can listen on any of these ports.

## How incoming traffic reaches your app

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

!!! note "One Gateway per app vs. a shared Gateway"
    The first example below is *self-contained* - the Gateway, Certificate and HTTPRoute all live in
    one namespace (`allowedRoutes: from: Same`), the simplest way to expose a single service. To
    expose several services, use the [shared Gateway](#shared-gateway-for-multiple-services) example
    below instead: one Gateway that routes in any namespace attach to.

## Examples

### Self-contained Gateway (single service)

In the following example we create a Gateway and its HTTP routes (with HTTP redirecting to HTTPS), using the [`GatewayClass`](https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/) `cilium`. Everything - the app and its Service, the Certificate, and the Gateway with its routes - lives in one namespace, so it all appears together below.

First, the application itself - a namespace, an nginx `Deployment` serving a demo page, and a `Service` in front of it:

```yaml
---
# Namespace for our application
apiVersion: v1
kind: Namespace
metadata:
  name: cilium-gateway-demo

---
# Sample application deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
  namespace: cilium-gateway-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demo-app
  template:
    metadata:
      labels:
        app: demo-app
        version: v1
    spec:
      containers:
      - name: demo-app
        image: nginx:1.25
        ports:
        - containerPort: 80
        volumeMounts:
        - name: html-content
          mountPath: /usr/share/nginx/html
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
      volumes:
      - name: html-content
        configMap:
          name: demo-html

---
# ConfigMap with Cilium-themed HTML content
apiVersion: v1
kind: ConfigMap
metadata:
  name: demo-html
  namespace: cilium-gateway-demo
data:
  index.html: |
    <!DOCTYPE html>
    <html>
    <head>
        <title>Cilium Gateway API Demo</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .container { 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 40px;
                text-align: center;
            }
            .logo { font-size: 3em; margin-bottom: 20px; }
            .feature-box { 
                background: rgba(255,255,255,0.1); 
                padding: 20px; 
                margin: 20px 0; 
                border-radius: 10px; 
                backdrop-filter: blur(10px);
            }
            .success { color: #4CAF50; }
            h1 { margin-bottom: 30px; }
            ul { text-align: left; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">Safespring</div>
            <h1>Cilium Gateway API with TLS</h1>
            <div class="feature-box">
                <h2 class="success">Successfully Connected!</h2>
                <p>This application is running behind Cilium Gateway with TLS termination.</p>
            </div>
            <div class="feature-box">
                <h3>Cilium Features</h3>
                <ul>
                    <li>eBPF-based networking and security</li>
                    <li>Gateway API implementation</li>
                    <li>Advanced load balancing</li>
                    <li>Network policies and observability</li>
                    <li>High-performance TLS termination</li>
                </ul>
            </div>
        </div>
    </body>
    </html>

---
# Service for the demo application
apiVersion: v1
kind: Service
metadata:
  name: demo-app-service
  namespace: cilium-gateway-demo
  labels:
    app: demo-app
spec:
  selector:
    app: demo-app
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
  type: ClusterIP
```

#### ClusterIssuer for Let's Encrypt and Certificate

Next, cert-manager obtains the TLS certificate: the `ClusterIssuer` defines how to get certificates from Let's Encrypt, and the `Certificate` requests one and stores it in a Secret the Gateway serves. See [cert-manager with Gateway API](https://cert-manager.io/docs/usage/gateway/).

```yaml
---
# TLS Certificate using cert-manager
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
            kind: Gateway
```

#### Cilium Gateway Configuration

Finally, the `Gateway` itself (the entry point, terminating TLS on port 443) and the `HTTPRoute`s (the routing rules) - one forwarding HTTPS traffic to the Service, and one redirecting plain HTTP to HTTPS. See the [HTTP routing guide](https://gateway-api.sigs.k8s.io/guides/http-routing/).

```yaml
---

apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: cilium-gateway
  namespace: cilium-gateway-demo
spec:
  gatewayClassName: cilium
  listeners:
  # HTTPS listener
  - name: https
    hostname: "cilium-demo.apps.safesdemo.paas.safedc.net"
    port: 443
    protocol: HTTPS
    tls:
      mode: Terminate
      certificateRefs:
      - kind: Secret
        name: cilium-demo-tls-secret
        namespace: cilium-gateway-demo
    allowedRoutes:
      namespaces:
        from: Same
  # HTTP listener for redirects
  - name: http
    hostname: "cilium-demo.apps.safesdemo.paas.safedc.net"
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
        from: Same

---
# HTTPRoute for HTTPS traffic
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: demo-https-route
  namespace: cilium-gateway-demo
  labels:
    gateway: cilium-gateway
spec:
  parentRefs:
  - name: cilium-gateway
    namespace: cilium-gateway-demo
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
      namespace: cilium-gateway-demo
      port: 80
      weight: 100
    filters:
    - type: ResponseHeaderModifier
      responseHeaderModifier:
        add:
        - name: X-Served-By
          value: "Cilium-Gateway"
        - name: X-Gateway-Class
          value: "cilium"

---
# HTTPRoute for HTTP to HTTPS redirect
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: demo-http-redirect
  namespace: cilium-gateway-demo
spec:
  parentRefs:
  - name: cilium-gateway
    namespace: cilium-gateway-demo
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

### Shared Gateway for multiple services

Running a separate Gateway per service (as above) gets repetitive once you expose more than one or two. The more scalable pattern - and the one Safespring uses internally - is a single **shared Gateway** in its own namespace that every service attaches routes to. Each service then only ships its own `Certificate`, `HTTPRoute`, and a `ReferenceGrant`.

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

Because the TLS Secret lives in the service's namespace but the Gateway reads it from `gateway-system`, each service needs a [`ReferenceGrant`](https://gateway-api.sigs.k8s.io/guides/tls/) allowing that cross-namespace read. Per service you then apply a `Certificate`, the `ReferenceGrant`, and the `HTTPRoute`s (reusing the `letsencrypt-prod` ClusterIssuer from the previous example):

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
    name: letsencrypt-prod
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
