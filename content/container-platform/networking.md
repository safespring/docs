# Routes and Networking

## Routes

Routes in OpenShift are similar to Ingress in vanilla Kubernetes, enabling external access to a Service object via HTTP/HTTPS. A typical Route definition looks like this:

```yaml
apiVersion: v1
kind: Route
metadata:
  name: some-service
spec:
  host: service.example.com
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
  to:
    kind: Service
    name: target-service-name
```

**TLS Settings:**

- **`termination`**: Determines how incoming encrypted traffic is handled.
    - **`edge`**: Handles incoming HTTPS traffic and redirects HTTP traffic to your pod. Your application doesn't manage HTTPS.
    - **`passthrough`**: Passes HTTPS traffic directly to your service without handling it. Your application must manage HTTPS. **Currently not supported.**
    - **`reencrypt`**: Handles incoming HTTPS traffic and then reencrypts it with a different certificate (which can be self-signed). Your application must handle HTTPS for the new certificate.
- **`insecureEdgeTerminationPolicy`**: Determines how incoming unencrypted traffic is managed.
    - **`Allow`**: Permits HTTP traffic (not recommended).
    - **`Redirect`**: Redirects clients to the HTTPS endpoint (recommended).
    - **`Disable`**: Blocks unencrypted traffic, terminating the connection.

!!! info "Default Routes"
    Default application routes come with a wildcard certificate, securing all related routes by default. The default ingress domain for EOSC is `*.eu-2.open-science-cloud-user-apps.eu`.

    Custom domains can be added, but users must manage the DNS entry. For ingress IP information, contact support@safespring.com.

### Route IP Whitelisting

```yaml
haproxy.router.openshift.io/ip_whitelist: 192.168.1.0/24 YOUR_IPs 8.8.8.8
```

!!! note
    The maximum number of IPs allowed is 61. For more details, refer to [Route-specific annotations](https://docs.openshift.com/container-platform/4.15/networking/routes/route-configuration.html#nw-route-specific-annotations_route-configuration).

```bash
oc annotate route <route_name> \
    haproxy.router.openshift.io/ip_whitelist='192.168.1.0/24 YOUR_IPs 8.8.8.8'
```

## Certificates

The Container Platform provides a default wildcard domain with certificates for public application endpoints. No DNS or certificate configuration is needed for these routes.

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: service-tls
spec:
  # Make sure the certificate is created beforehand
  secretName: service-tls
  # Issuer details
  issuerRef:
    # this default Cluster issue can be utilized by every project
    name: letsencrypt-prod  # Issuer/ClusterIssuer name
    kind: ClusterIssuer  # Can be Issuer or ClusterIssuer
  # Common name of your Certificate
  commonName: service.example.com
  # [OPTIONAL] to renew certificate before expiration, default is 2/3 before expiration
  # given that we are using let's encrypt that is 30 days
  renewBefore: 360h # 15d
  # [OPTIONAL] Set to false for Let's Encrypt certs
  isCA: false
  # [OPTIONAL] DNS names for the certificate (overrides common name)
  dnsNames:
  - service.example.com
  # [OPTIONAL] Additional IP address valid for this certificate
  ipAddresses:
  - 1.2.3.4
  # [OPTIONAL] set to Always so that the private key is renewed
  # cert-manager reuses the existing private key on each issuance
  privateKey:
    rotationPolicy: Always
```

### Adding a Certificate to a Route

!!! note
    Supplying a custom certificate not allowed to supply custom certificate through `Edge` / `Reencrypt` TLS termination.

Specify the following annotation to the route to associate the certificate with the route:

```yaml
metadata:
  annotations:
    # The secret's name must match the one in the Certificate definition
    # A single certificate can be used on multiple routes by adding this annotation
    cert-utils-operator.redhat-cop.io/certs-from-secret: "service-tls"
```

The default behaviour is to automatically renew the certificates before they expire, however some alerts can be configured as detailed by [`cert-utils-operator`](https://github.com/redhat-cop/cert-utils-operator?tab=readme-ov-file#generating-kubernetes-events).

```yaml
# Add this annotation to the secret
cert-utils-operator.redhat-cop.io/generate-cert-expiry-alert: "true"
 
# Control annotations

# Default: 7 days - frequency to check if a certificate is expiring
cert-utils-operator.redhat-cop.io/cert-expiry-check-frequency: <value> 

# Default: 1h - frequency to check if a certificate is near expiration
cert-utils-operator.redhat-cop.io/cert-soon-to-expire-check-frequency: <value> 

# Default: 90 days - time interval to consider a certificate close to expiry
cert-utils-operator.redhat-cop.io/cert-soon-to-expire-threshold: <value>  
```

## Network Policies

To enable network communication with other projects, [`NetworkPolicy`](https://kubernetes.io/docs/concepts/services-networking/network-policies/) objects can be used to define custom access policies.

To ensure NetworkPolicies function correctly, each namespace must have a "name" label with the project name as the value. This label is NOT automatically added during project creation.

!!! note
    In the example the `name` label is different from `metadata.name`. Use the following command to add the label:

    ```bash
    oc label namespace project2 name=project2
    ```

Example NetworkPolicy:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-port-8443-from-project2
spec:
  podSelector: {}
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: project2
    ports:
    - protocol: TCP
      port: 8443
```

It is the owner's responsibility to maintain security, so the default policies should remain unchanged. Only add new NetworkPolicy objects if necessary to allow communication between specific services across projects.

Default network policies are:

- `deny-by-default` - denies any communication
- `allow-same-namespace` - allows communication from the own namespace
- `allow-from-kube-apiserver-operator`, `allow-from-openshift-monitoring`, `allow-from-openshift-ingress` allows communication from know namespaces - required to allow the okd functionality to work properly

OKD Guide:

- [About Network Policies](https://docs.okd.io/4.15/networking/network_policy/about-network-policy.html)
- [Editing Network Policies](https://docs.okd.io/latest/networking/network_policy/editing-network-policy.html)