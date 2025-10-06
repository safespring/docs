# Kubernetes Cluster Traffic Management

We provide current two means of managing traffic into a kubernetes cluster:

- [NGINX Ingress](https://github.com/kubernetes/ingress-nginx) when you need simple, Kubernetes-native routing of web traffic into services;
- Cilium [Gateway API](https://gateway-api.sigs.k8s.io/) which offers full API lifecycle management, security, and governance.

| Feature                        | **Ingress**                         | **API Gateway**                                           |
| ------------------------------ | ----------------------------------- | --------------------------------------------------------- |
| **Routing**                    | Host/path-based HTTP routing        | Advanced routing, multi-protocol (HTTP, gRPC, WebSockets) |
| **TLS Termination**            | ✅                                | ✅                                                      |
| **Auth (OIDC, JWT, API Keys)** | ❌ Limited (via annotations/plugins) | ✅ Built-in                                                |
| **Rate Limiting / Quotas**     | ❌ Not native                        | ✅ Core feature                                            |
| **Observability**              | Basic (via logs/metrics)            | Detailed API analytics                                    |
| **Kubernetes-native**          | ✅                                 | Sometimes (can be external)                               |
| **Best for**                   | Simple cluster ingress              | Full API management and security                          |

## Examples

### Gateway API

In the following example we illustrate how to create a Gateway and corresponding HTTP routes, with HTTP redirecting to HTTPS. We create the Gateway `cilium-gateway`  which makes use of the GatewayClass `cilium`.

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

```yaml
---

apiVersion: gateway.networking.k8s.io/v1beta1
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
apiVersion: gateway.networking.k8s.io/v1beta1
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
apiVersion: gateway.networking.k8s.io/v1beta1
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

### NGNIX Ingress

We make use of [NGINX demo](https://github.com/nginxinc/NGINX-Demos/tree/master/nginx-hello-nonroot) containers to illustrate NGINX Ingress with a certificate generated using `letsencrypt-prod`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coffee
spec:
  replicas: 2
  selector:
    matchLabels:
      app: coffee
  template:
    metadata:
      labels:
        app: coffee
    spec:
      containers:
      - name: coffee
        image: nginxdemos/nginx-hello:plain-text
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: coffee-svc
spec:
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: coffee
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tea
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tea
  template:
    metadata:
      labels:
        app: tea
    spec:
      containers:
      - name: tea
        image: nginxdemos/nginx-hello:plain-text
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: tea-svc
  labels:
    app: tea
spec:
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: tea
---
```

#### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cafe-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - cafe.apps.safesdemo.paas.safedc.net
    secretName: cafe-secret
  rules:
  - host: cafe.apps.safesdemo.paas.safedc.net
    http:
      paths:
      - path: /tea
        pathType: Prefix
        backend:
          service:
            name: tea-svc
            port:
              number: 80
      - path: /coffee
        pathType: Prefix
        backend:
          service:
            name: coffee-svc
            port:
              number: 80

```
