# Kubernetes Ingress

## 1. Overview

**Ingress** is a Kubernetes API object that manages external HTTP and HTTPS access to services running inside a Kubernetes cluster.

Ingress provides a way to define rules that route incoming web traffic to Kubernetes Services.

Instead of exposing every application using a separate external LoadBalancer, an Ingress can provide a **single entry point** and route requests to different applications based on:

* Hostnames
* URL paths
* TLS configuration

A simplified architecture looks like this:

```text
                    Internet
                       │
                       │ HTTP / HTTPS
                       ▼
              ┌─────────────────┐
              │ Ingress /       │
              │ Ingress Gateway │
              └────────┬────────┘
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
          Service A  Service B  Service C
             │         │         │
             ▼         ▼         ▼
           Pods       Pods       Pods
```

> **Important:** An Ingress resource by itself does not implement traffic routing. A Kubernetes cluster needs an **Ingress controller** to process the Ingress rules.

---

# 2. Why Use Ingress?

Without Ingress, applications may be exposed individually:

```text
Internet
   │
   ├── LoadBalancer → Service A
   │
   ├── LoadBalancer → Service B
   │
   └── LoadBalancer → Service C
```

This can result in:

* Multiple external load balancers
* Higher infrastructure cost
* More configuration
* More public endpoints

With Ingress:

```text
                 Internet
                    │
                    ▼
              Ingress Controller
                    │
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼
       Service A Service B Service C
```

A single external entry point can route traffic to multiple applications.

---

# 3. What Is an Ingress Controller?

An **Ingress Controller** is the component that watches Kubernetes Ingress resources and implements the defined routing rules.

Examples include:

* NGINX Ingress Controller
* HAProxy Ingress
* Traefik
* Kong
* Cloud-provider-specific ingress/load-balancing controllers

The Ingress object defines **what should happen**.

The Ingress Controller determines **how it actually happens**.

```text
Ingress YAML
     │
     │ Rules
     ▼
Ingress Controller
     │
     │ Implements routing
     ▼
Kubernetes Services
     │
     ▼
Pods
```

---

# 4. Ingress vs Ingress Controller

These concepts are different.

| Component          | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| Ingress            | Kubernetes API object containing routing rules         |
| Ingress Controller | Software that processes those rules and routes traffic |

For example:

```text
Ingress Resource
      │
      │
      ▼
NGINX Ingress Controller
      │
      ▼
Kubernetes Services
```

Creating an Ingress resource without an appropriate controller may result in no traffic being routed.

---

# 5. Basic Ingress Example

A basic Ingress can look like this:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
spec:
  ingressClassName: nginx

  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: webapp-service
                port:
                  number: 80
```

This means:

```text
Request:
http://example.com/

        │
        ▼

Ingress Controller

        │
        ▼

webapp-service:80

        │
        ▼

Web Application Pods
```

---

# 6. Ingress API Version

The current stable Ingress API is:

```yaml
apiVersion: networking.k8s.io/v1
```

Example:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
```

Older Kubernetes versions used APIs such as:

```text
extensions/v1beta1
networking.k8s.io/v1beta1
```

These older APIs have been removed from modern Kubernetes versions.

For new manifests, use:

```yaml
networking.k8s.io/v1
```

---

# 7. Ingress Resource Structure

A typical Ingress has:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: application-ingress

spec:
  ingressClassName: nginx

  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: application-service
                port:
                  number: 80
```

Important sections include:

* `apiVersion`
* `kind`
* `metadata`
* `spec`
* `ingressClassName`
* `rules`
* `host`
* `http`
* `paths`
* `pathType`
* `backend`

---

# 8. Ingress Rules

Ingress rules determine how traffic is routed.

Example:

```yaml
rules:
  - host: example.com
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: web-service
              port:
                number: 80
```

The request:

```text
https://example.com/
```

is routed to:

```text
web-service:80
```

---

# 9. Host-Based Routing

Ingress can route traffic based on the hostname.

Example:

```yaml
spec:
  rules:

    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80

    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

Architecture:

```text
                 Internet
                    │
                    ▼
             Ingress Controller
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
app.example.com         api.example.com
          │                   │
          ▼                   ▼
    app-service          api-service
          │                   │
          ▼                   ▼
        Pods                 Pods
```

---

# 10. Path-Based Routing

Ingress can route traffic based on URL paths.

Example:

```yaml
rules:
  - host: example.com
    http:
      paths:

        - path: /app
          pathType: Prefix
          backend:
            service:
              name: app-service
              port:
                number: 80

        - path: /api
          pathType: Prefix
          backend:
            service:
              name: api-service
              port:
                number: 80
```

Requests:

```text
https://example.com/app
```

go to:

```text
app-service
```

Requests:

```text
https://example.com/api
```

go to:

```text
api-service
```

Architecture:

```text
                      example.com
                           │
                           ▼
                   Ingress Controller
                     /           \
                    /             \
                   ▼               ▼
                /app             /api
                  │                │
                  ▼                ▼
             app-service       api-service
                  │                │
                  ▼                ▼
                Pods              Pods
```

---

# 11. Path Types

The Kubernetes Ingress API supports:

```text
Prefix
Exact
ImplementationSpecific
```

---

## 11.1 Prefix

Example:

```yaml
path: /api
pathType: Prefix
```

This can match:

```text
/api
/api/
/api/users
/api/products
/api/orders/123
```

---

## 11.2 Exact

Example:

```yaml
path: /login
pathType: Exact
```

This matches:

```text
/login
```

but does not match:

```text
/login/
/login/user
```

---

## 11.3 ImplementationSpecific

Example:

```yaml
path: /api
pathType: ImplementationSpecific
```

The exact matching behavior depends on the Ingress Controller.

For portability, prefer:

```text
Prefix
Exact
```

when they meet your requirements.

---

# 12. Ingress Backend

The backend specifies where the traffic should go.

Example:

```yaml
backend:
  service:
    name: web-service
    port:
      number: 80
```

This means:

```text
Ingress
   │
   ▼
web-service
   │
   ▼
Service Port 80
   │
   ▼
Pod
```

---

# 13. Ingress and Kubernetes Service

Ingress normally routes traffic to a Kubernetes Service rather than directly to Pods.

The flow is:

```text
Client
  │
  ▼
Ingress
  │
  ▼
Ingress Controller
  │
  ▼
Service
  │
  ▼
Pod
  │
  ▼
Container
```

This separation provides clean responsibility boundaries.

---

# 14. Ingress and Service Types

Ingress commonly works with Services that expose the application internally, often:

```yaml
type: ClusterIP
```

Example:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service

spec:
  type: ClusterIP

  selector:
    app: web

  ports:
    - port: 80
      targetPort: 8080
```

The Ingress Controller then routes external HTTP/HTTPS traffic to this Service.

---

# 15. IngressClass

Modern Kubernetes uses `IngressClass` to identify which controller should handle an Ingress.

Example:

```yaml
spec:
  ingressClassName: nginx
```

This tells Kubernetes which Ingress Controller class the resource is intended for.

You can list IngressClasses:

```bash
kubectl get ingressclass
```

Example:

```text
NAME
nginx
```

---

# 16. IngressClass Example

An IngressClass might look like:

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx

spec:
  controller: example.com/ingress-controller
```

The exact controller identifier depends on the implementation.

---

# 17. Default IngressClass

A cluster can have a default IngressClass.

You can inspect:

```bash
kubectl get ingressclass
```

If an Ingress does not specify:

```yaml
ingressClassName:
```

the cluster's default IngressClass may be used, depending on the cluster configuration.

For clarity and portability, explicitly specifying:

```yaml
ingressClassName: nginx
```

is often preferable when you know which controller should process the resource.

---

# 18. TLS With Ingress

Ingress can terminate HTTPS traffic using TLS certificates.

Example:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress

spec:
  ingressClassName: nginx

  tls:
    - hosts:
        - example.com
      secretName: example-tls

  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

Architecture:

```text
Client
  │
  │ HTTPS
  ▼
Ingress Controller
  │
  │ TLS Termination
  ▼
HTTP
  │
  ▼
Service
  │
  ▼
Pods
```

---

# 19. TLS Secret

The referenced Secret:

```yaml
secretName: example-tls
```

typically contains:

```text
tls.crt
tls.key
```

Example:

```bash
kubectl get secret example-tls
```

For a TLS Secret:

```yaml
type: kubernetes.io/tls
```

The private key is sensitive and should be protected using appropriate Kubernetes security controls.

---

# 20. HTTP to HTTPS Redirect

Many Ingress Controllers support redirecting HTTP traffic to HTTPS.

The exact configuration is controller-specific.

Conceptually:

```text
http://example.com
       │
       ▼
Ingress Controller
       │
       ▼
301 / 308 Redirect
       │
       ▼
https://example.com
```

The exact annotation or configuration depends on the selected Ingress Controller.

---

# 21. TLS Termination

TLS termination means HTTPS is decrypted at the Ingress layer.

Example:

```text
                    HTTPS
Client ─────────────────────────► Ingress
                                   │
                                   │ TLS Termination
                                   ▼
                                  HTTP
                                   │
                                   ▼
                                Service
                                   │
                                   ▼
                                  Pod
```

Alternatively, organizations may choose end-to-end or re-encrypted TLS depending on security requirements and controller capabilities.

---

# 22. Default Backend

Some Ingress Controllers support a default backend for requests that do not match a configured host/path.

Conceptually:

```text
Request
   │
   ▼
Ingress
   │
   ├── Match /api → API Service
   │
   ├── Match /app → App Service
   │
   └── No Match → Default Backend
```

The exact default backend configuration is controller-specific.

---

# 23. Ingress Without a Host

An Ingress rule can omit the host.

Example:

```yaml
rules:
  - http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: web-service
              port:
                number: 80
```

This can act as a catch-all rule for traffic handled by that Ingress, subject to the controller's configuration.

---

# 24. Multiple Hosts

One Ingress can define multiple hosts.

Example:

```yaml
spec:
  rules:

    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80

    - host: shop.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: shop-service
                port:
                  number: 80

    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

Architecture:

```text
                 Ingress
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
     app.*        shop.*        api.*
       │            │            │
       ▼            ▼            ▼
     App          Shop          API
   Service       Service       Service
```

---

# 25. Multiple Paths

Multiple paths can be defined under one host.

Example:

```yaml
rules:
  - host: example.com
    http:
      paths:
        - path: /api
          pathType: Prefix
          backend:
            service:
              name: api-service
              port:
                number: 80

        - path: /web
          pathType: Prefix
          backend:
            service:
              name: web-service
              port:
                number: 80

        - path: /admin
          pathType: Prefix
          backend:
            service:
              name: admin-service
              port:
                number: 80
```

---

# 26. Ingress Traffic Flow

A typical request follows this path:

```text
                    Internet
                       │
                       │ DNS
                       ▼
                External IP / LB
                       │
                       ▼
             Ingress Controller
                       │
                ┌──────┴──────┐
                │             │
             Host Rule     Path Rule
                │             │
                └──────┬──────┘
                       ▼
                    Service
                       │
                       ▼
                Service Endpoints
                       │
                       ▼
                     Pods
                       │
                       ▼
                   Container
```

---

# 27. DNS and Ingress

Ingress routing normally depends on DNS mapping a hostname to the external address of the Ingress Controller.

Example:

```text
app.example.com
        │
        ▼
DNS
        │
        ▼
203.0.113.10
        │
        ▼
Ingress Controller
        │
        ▼
app-service
```

The exact external address depends on the Kubernetes environment and Ingress Controller.

---

# 28. Ingress and DNS

For host-based routing:

```text
app.example.com → Ingress External IP
api.example.com → Ingress External IP
shop.example.com → Ingress External IP
```

Multiple DNS names can point to the same Ingress entry point.

The Ingress Controller uses the HTTP `Host` header to determine which routing rule applies.

---

# 29. Ingress Annotations

Many Ingress Controllers provide additional configuration through annotations.

Example:

```yaml
metadata:
  annotations:
    example.com/feature: "enabled"
```

However, annotations are generally **controller-specific**.

For example, an annotation supported by one controller may have no effect on another controller.

Therefore:

> Always check the documentation of the specific Ingress Controller before using annotations.

---

# 30. Common Ingress Controller Features

Depending on the implementation, an Ingress Controller may provide features such as:

* TLS termination
* HTTP to HTTPS redirect
* Load balancing
* URL routing
* Host routing
* Authentication
* Rate limiting
* Request rewriting
* Header manipulation
* Access logging
* WAF integration
* Metrics
* Custom error pages

Not every controller supports every feature.

---

# 31. Request Routing

Suppose the following rules exist:

```yaml
rules:
  - host: example.com
    http:
      paths:
        - path: /api
          pathType: Prefix
          backend:
            service:
              name: api-service
              port:
                number: 80

        - path: /web
          pathType: Prefix
          backend:
            service:
              name: web-service
              port:
                number: 80
```

Requests are routed as follows:

| Request                 | Backend       |
| ----------------------- | ------------- |
| `example.com/api`       | `api-service` |
| `example.com/api/users` | `api-service` |
| `example.com/web`       | `web-service` |
| `example.com/web/home`  | `web-service` |

---

# 32. Path Matching Considerations

When defining multiple paths, understand the matching behavior of your controller and the Kubernetes Ingress specification.

For example:

```text
/api
/api/users
/api/orders
```

with:

```yaml
pathType: Prefix
```

matches the `/api` prefix.

For exact matching:

```yaml
path: /login
pathType: Exact
```

is intended for the exact `/login` path.

---

# 33. Ingress and Load Balancing

Ingress Controllers commonly distribute requests among the Pods behind a Service.

Conceptually:

```text
                    Ingress
                       │
                       ▼
                    Service
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
           Pod 1     Pod 2     Pod 3
```

The exact load-balancing behavior depends on the controller and networking implementation.

---

# 34. Ingress and Service Discovery

Ingress generally does not need to know individual Pod IP addresses.

Instead:

```text
Ingress
   │
   ▼
Service
   │
   ▼
Endpoints / EndpointSlices
   │
   ├── Pod 1
   ├── Pod 2
   └── Pod 3
```

This allows Pods to be recreated or scaled without manually changing Ingress rules.

---

# 35. Ingress and Scaling

Suppose an application has three Pods:

```text
Service
   │
   ├── Pod 1
   ├── Pod 2
   └── Pod 3
```

The application scales to five Pods:

```text
Service
   │
   ├── Pod 1
   ├── Pod 2
   ├── Pod 3
   ├── Pod 4
   └── Pod 5
```

The Ingress configuration normally does not need to change because it routes to the Service.

---

# 36. Ingress vs Service

Ingress and Service have different responsibilities.

| Feature                         | Service                        | Ingress                         |
| ------------------------------- | ------------------------------ | ------------------------------- |
| Internal service discovery      | Yes                            | No                              |
| Stable endpoint for Pods        | Yes                            | Uses Service                    |
| HTTP routing                    | Limited                        | Yes                             |
| Host-based routing              | No                             | Yes                             |
| Path-based routing              | No                             | Yes                             |
| TLS termination                 | Not generally its primary role | Yes, via controller             |
| External HTTP/HTTPS entry point | Depending on type              | Yes                             |
| Load balancing to Pods          | Yes                            | Usually through Service/backend |

---

# 37. Ingress vs LoadBalancer Service

A `LoadBalancer` Service can expose an individual application.

```text
Internet
   │
   ▼
LoadBalancer Service
   │
   ▼
Application Pods
```

Ingress can expose multiple applications through routing rules:

```text
Internet
   │
   ▼
Ingress Controller
   │
   ├── /app → App Service
   ├── /api → API Service
   └── /shop → Shop Service
```

Ingress is especially useful for HTTP/HTTPS workloads.

---

# 38. Ingress vs NodePort

NodePort exposes a Service through a port on cluster nodes.

Example:

```text
Node IP:30080
      │
      ▼
Service
      │
      ▼
Pods
```

Ingress provides a more application-aware HTTP/HTTPS routing layer.

---

# 39. Ingress vs Gateway API

Kubernetes networking has evolved beyond the traditional Ingress API.

The **Gateway API** provides a more expressive and extensible model for traffic management.

Conceptually:

```text
Ingress
   │
   └── Simple HTTP/HTTPS routing

Gateway API
   │
   ├── Gateway
   ├── HTTPRoute
   ├── GRPCRoute
   ├── TLSRoute
   └── Other routing capabilities
```

Ingress remains widely used, but for new platforms requiring advanced traffic-management capabilities, Gateway API may be worth evaluating.

---

# 40. Ingress Limitations

Ingress is primarily designed around HTTP/HTTPS routing.

It is not a generic solution for every networking protocol.

For example, workloads requiring:

* Arbitrary TCP
* Arbitrary UDP
* Advanced L4 routing

may require controller-specific capabilities or another networking mechanism.

Gateway API and other load-balancing solutions may be more appropriate depending on requirements.

---

# 41. Ingress Security

Ingress is an important security boundary because it is often exposed to the Internet.

Security considerations include:

* TLS configuration
* Certificate management
* Authentication
* Authorization
* Rate limiting
* Web Application Firewall
* Request size limits
* Header validation
* Network policies
* Controller security
* RBAC
* Container security
* Logging and monitoring

---

# 42. TLS Best Practices

For production HTTPS applications:

* Use valid certificates.
* Automate certificate renewal.
* Disable obsolete TLS versions where appropriate.
* Use strong cipher/configuration policies supported by your controller.
* Redirect HTTP to HTTPS where required.
* Protect TLS private keys.
* Monitor certificate expiration.

A common architecture is:

```text
Client
  │
  │ HTTPS
  ▼
Ingress Controller
  │
  │ TLS termination
  ▼
Service
  │
  ▼
Application
```

---

# 43. Certificate Management

Certificate management can be automated using Kubernetes-compatible certificate management solutions.

A common architecture is:

```text
Ingress
   │
   ▼
Certificate Manager
   │
   ▼
Certificate Authority
   │
   ▼
TLS Secret
   │
   ▼
Ingress Controller
```

The exact implementation depends on the certificate-management solution used by the organization.

---

# 44. Authentication

Ingress Controllers can integrate with authentication mechanisms such as:

* OAuth/OIDC
* External authentication services
* Basic authentication
* Identity-aware proxies

The exact configuration is controller-specific.

A typical architecture is:

```text
User
 │
 ▼
Ingress
 │
 ▼
Authentication Layer
 │
 ├── Unauthorized → Reject
 │
 └── Authorized → Application
```

---

# 45. Rate Limiting

Rate limiting helps protect applications from excessive traffic.

Conceptually:

```text
Client
   │
   ▼
Ingress Controller
   │
   ├── Within limit → Application
   │
   └── Over limit → Reject / Throttle
```

Configuration is generally controller-specific.

---

# 46. Web Application Firewall

For Internet-facing applications, a WAF can inspect HTTP requests.

Example:

```text
Internet
   │
   ▼
Load Balancer
   │
   ▼
WAF
   │
   ▼
Ingress Controller
   │
   ▼
Service
   │
   ▼
Pods
```

A WAF can help protect against common web attacks, but it should be part of a broader security strategy.

---

# 47. NetworkPolicy and Ingress

NetworkPolicies can restrict which Pods are allowed to communicate.

Example architecture:

```text
Internet
   │
   ▼
Ingress Controller
   │
   ▼
Application Service
   │
   ▼
Application Pods
```

NetworkPolicy can restrict:

```text
Ingress Controller
       │
       ▼
Application Namespace
       │
       └── Only approved traffic
```

Ingress routing and NetworkPolicy solve different problems:

* Ingress controls HTTP/HTTPS routing.
* NetworkPolicy controls Pod network connectivity.

---

# 48. Ingress Logging

Ingress Controllers commonly provide access logs.

A request might look conceptually like:

```text
Client IP
    │
    ▼
Ingress Controller
    │
    ├── Host
    ├── Path
    ├── HTTP Method
    ├── Status Code
    ├── Response Time
    └── Backend
```

Logs can help troubleshoot:

* 404 responses
* 502/503 responses
* TLS failures
* Routing problems
* High latency
* Suspicious traffic

---

# 49. Ingress Monitoring

Monitor metrics such as:

* Request rate
* Response codes
* Request latency
* Active connections
* Backend errors
* TLS errors
* Controller CPU
* Controller memory
* Controller restarts

Architecture:

```text
Ingress Controller
       │
       ├── Metrics
       ├── Logs
       └── Events
             │
             ▼
     Monitoring Platform
```

---

# 50. Common HTTP Errors

## 404 Not Found

Possible causes:

* Host doesn't match.
* Path doesn't match.
* Wrong Ingress rule.
* Application returns the 404.
* Incorrect path rewrite configuration.

Check:

```bash
kubectl get ingress
kubectl describe ingress <ingress-name>
```

---

## 502 Bad Gateway

Possible causes:

* Backend Service unavailable
* Application Pod unavailable
* Wrong Service port
* Backend connection failure
* Application not listening on expected port

Check:

```bash
kubectl get svc
kubectl get endpoints
kubectl get endpointslices
```

Also check:

```bash
kubectl get pods
kubectl logs <pod-name>
```

---

## 503 Service Unavailable

Possible causes:

* No ready backend Pods
* Service selector mismatch
* Readiness probe failures
* Ingress Controller cannot reach backend

Check:

```bash
kubectl get pods
kubectl get svc
kubectl get endpoints
```

---

# 51. Troubleshooting Ingress

Use this workflow:

```text
Client
  │
  ▼
DNS
  │
  ▼
External IP / Load Balancer
  │
  ▼
Ingress Controller
  │
  ▼
Ingress Rules
  │
  ▼
Service
  │
  ▼
Endpoints
  │
  ▼
Pods
  │
  ▼
Container
```

Check each layer independently.

---

# 52. Useful Troubleshooting Commands

List Ingress resources:

```bash
kubectl get ingress
```

Short form:

```bash
kubectl get ing
```

Across namespaces:

```bash
kubectl get ingress -A
```

Detailed information:

```bash
kubectl describe ingress <ingress-name>
```

Get YAML:

```bash
kubectl get ingress <ingress-name> -o yaml
```

List IngressClasses:

```bash
kubectl get ingressclass
```

Check Services:

```bash
kubectl get svc
```

Check endpoints:

```bash
kubectl get endpoints
```

Check EndpointSlices:

```bash
kubectl get endpointslices
```

Check Pods:

```bash
kubectl get pods -o wide
```

---

# 53. Checking Ingress Controller

First identify the controller:

```bash
kubectl get pods -A
```

Depending on the installation, the controller may run in a dedicated namespace.

For example:

```bash
kubectl get pods -n ingress-nginx
```

Check controller logs:

```bash
kubectl logs -n ingress-nginx <controller-pod>
```

The namespace and Pod names depend on the controller installation.

---

# 54. Checking Ingress Events

Use:

```bash
kubectl describe ingress <ingress-name>
```

Look at the Events section.

You can also inspect cluster events:

```bash
kubectl get events --sort-by=.lastTimestamp
```

Events may reveal:

* Invalid configuration
* Backend issues
* Controller errors
* Certificate problems
* Admission failures

---

# 55. Complete HTTP Ingress Example

## Application Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp

spec:
  replicas: 3

  selector:
    matchLabels:
      app: webapp

  template:
    metadata:
      labels:
        app: webapp

    spec:
      containers:
        - name: webapp
          image: nginx:1.27
          ports:
            - containerPort: 80
```

## Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-service

spec:
  type: ClusterIP

  selector:
    app: webapp

  ports:
    - port: 80
      targetPort: 80
```

## Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress

spec:
  ingressClassName: nginx

  rules:
    - host: webapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: webapp-service
                port:
                  number: 80
```

Traffic flow:

```text
webapp.example.com
        │
        ▼
Ingress Controller
        │
        ▼
webapp-service:80
        │
        ▼
┌───────┼───────┐
▼       ▼       ▼
Pod 1  Pod 2   Pod 3
```

---

# 56. Complete TLS Ingress Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-webapp-ingress

spec:
  ingressClassName: nginx

  tls:
    - hosts:
        - webapp.example.com
      secretName: webapp-tls

  rules:
    - host: webapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: webapp-service
                port:
                  number: 80
```

The architecture becomes:

```text
              HTTPS
                │
                ▼
      ┌──────────────────┐
      │ Ingress Controller│
      │                  │
      │ TLS Certificate  │
      └────────┬─────────┘
               │
               │ HTTP
               ▼
        webapp-service
               │
               ▼
             Pods
```

---

# 57. Complete Host and Path Routing Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: platform-ingress

spec:
  ingressClassName: nginx

  rules:

    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80

    - host: api.example.com
      http:
        paths:
          - path: /users
            pathType: Prefix
            backend:
              service:
                name: users-service
                port:
                  number: 80

          - path: /orders
            pathType: Prefix
            backend:
              service:
                name: orders-service
                port:
                  number: 80
```

Traffic:

```text
app.example.com/
        │
        ▼
frontend-service


api.example.com/users
        │
        ▼
users-service


api.example.com/orders
        │
        ▼
orders-service
```

---

# 58. Ingress Deployment Checklist

Before deploying an Ingress, verify:

* [ ] An appropriate Ingress Controller is installed.
* [ ] The correct `ingressClassName` is configured.
* [ ] DNS points to the correct external endpoint.
* [ ] The backend Service exists.
* [ ] Service ports are correct.
* [ ] Service selectors match the Pods.
* [ ] Pods are Ready.
* [ ] Endpoints/EndpointSlices contain expected backends.
* [ ] TLS Secret exists when HTTPS is used.
* [ ] Hostnames are correct.
* [ ] Paths use the intended `pathType`.
* [ ] Authentication is configured if required.
* [ ] Rate limiting is configured if required.
* [ ] Security controls are in place.
* [ ] Logging and monitoring are enabled.
* [ ] Ingress Controller resources are adequate.
* [ ] Failure and rollback procedures have been tested.

---

# 59. Production Best Practices

## Use HTTPS

For Internet-facing applications, prefer HTTPS.

```text
HTTPS
  │
  ▼
Ingress Controller
```

---

## Use Explicit IngressClass

Example:

```yaml
ingressClassName: nginx
```

This makes the intended controller clear.

---

## Keep Services Internal Where Appropriate

A common architecture is:

```text
Internet
   │
   ▼
Ingress
   │
   ▼
ClusterIP Service
   │
   ▼
Pods
```

This avoids unnecessarily exposing each application Service directly.

---

## Use Meaningful Hostnames

Prefer:

```text
api.example.com
app.example.com
admin.example.com
```

over unclear or temporary naming.

---

## Protect the Ingress Controller

The controller itself is a critical infrastructure component.

Monitor:

* CPU
* Memory
* Restarts
* Request rate
* Error rate
* Latency

---

## Use Resource Requests and Limits

The Ingress Controller should have appropriate resource configuration.

---

## Secure TLS

Use valid certificates and automate renewal where possible.

---

## Minimize Controller Permissions

Ingress Controllers should use the minimum Kubernetes permissions required for their operation.

---

# 60. Ingress Security Architecture

A production architecture may look like:

```text
                       Internet
                          │
                          ▼
                    DNS / CDN
                          │
                          ▼
                    Load Balancer
                          │
                          ▼
                         WAF
                          │
                          ▼
                 Ingress Controller
                    │           │
                    │           └── TLS
                    │
                    ▼
                 Services
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
        Pods      Pods       Pods
          │
          ▼
     Applications
```

Additional security layers may include:

* NetworkPolicy
* Identity-aware authentication
* RBAC
* Pod Security
* Image security
* Runtime security
* Secrets management

---

# 61. Ingress High Availability

Ingress Controllers should be deployed with high availability for production environments.

Conceptually:

```text
                Load Balancer
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Ingress     Ingress    Ingress
      Controller  Controller  Controller
          │          │          │
          └──────────┼──────────┘
                     │
                     ▼
                  Services
```

Running multiple controller replicas reduces the impact of individual Pod failures.

The exact architecture depends on the Kubernetes platform and controller.

---

# 62. Ingress Controller Scaling

As traffic increases, the Ingress Controller may need more resources or replicas.

Monitor:

```text
Requests/sec
Latency
CPU
Memory
Connections
Error rate
```

Scaling may involve:

```text
Increase replicas
       │
       ▼
More controller capacity
       │
       ▼
Higher traffic handling capability
```

However, scaling behavior and limits depend on the controller and underlying infrastructure.

---

# 63. Ingress and Cloud Kubernetes

Cloud Kubernetes platforms may integrate Ingress with native load-balancing services.

A typical architecture could be:

```text
Internet
   │
   ▼
Cloud Load Balancer
   │
   ▼
Ingress Controller
   │
   ▼
Kubernetes Service
   │
   ▼
Pods
```

Some cloud platforms also provide controllers that translate Kubernetes resources into native cloud load-balancing configuration.

---

# 64. Ingress and Bare-Metal Kubernetes

In bare-metal environments, exposing an Ingress Controller may require additional networking infrastructure.

Possible approaches include:

* NodePort
* External load balancer
* MetalLB
* BGP-based networking
* Dedicated hardware load balancer

A simplified architecture is:

```text
Internet
   │
   ▼
External Load Balancer
   │
   ▼
Ingress Controller
   │
   ▼
Services
   │
   ▼
Pods
```

The exact solution depends on the environment.

---

# 65. Ingress and Microservices

Ingress is especially useful in microservice architectures.

Example:

```text
                      Internet
                         │
                         ▼
                    Ingress
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       Frontend         Users          Orders
       Service         Service         Service
          │              │              │
          ▼              ▼              ▼
        Pods            Pods            Pods
```

A single domain can expose multiple services through paths:

```text
example.com/
example.com/users
example.com/orders
```

---

# 66. Ingress and API Routing

An API platform may use:

```text
api.example.com
```

with paths:

```text
/api/v1/users
/api/v1/orders
/api/v1/products
```

Ingress can route these paths to different Services.

Example:

```text
/api/v1/users
       │
       ▼
users-service

/api/v1/orders
       │
       ▼
orders-service

/api/v1/products
       │
       ▼
products-service
```

---

# 67. Ingress and Blue-Green Deployments

Ingress can participate in blue-green deployment strategies when supported by the controller and deployment architecture.

Conceptually:

```text
                 Ingress
                    │
                    ▼
              Production URL
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       Blue                  Green
       Version               Version
```

Traffic can be switched between versions according to the deployment strategy.

The exact implementation depends on the controller and deployment tooling.

---

# 68. Ingress and Canary Deployments

Some Ingress Controllers support controller-specific mechanisms for canary traffic.

Conceptually:

```text
                     Ingress
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
          Stable 95%          Canary 5%
              │                   │
              ▼                   ▼
         Version 1            Version 2
```

This can be useful for gradually introducing a new application version.

> Canary configuration is typically controller-specific and should not be assumed to be portable across different Ingress Controllers.

---

# 69. Common Mistakes

## Mistake 1: No Ingress Controller

Creating:

```yaml
kind: Ingress
```

does not automatically install an Ingress Controller.

---

## Mistake 2: Wrong IngressClass

Example:

```yaml
ingressClassName: nginx
```

when the installed controller uses a different class.

---

## Mistake 3: Wrong Service Port

Ingress:

```yaml
port:
  number: 80
```

but the Service exposes a different port.

---

## Mistake 4: Wrong Service Selector

If the Service does not select the expected Pods, the Service may have no endpoints.

---

## Mistake 5: Pods Are Not Ready

A readiness failure can prevent traffic from reaching Pods.

---

## Mistake 6: Incorrect DNS

DNS must point the hostname to the correct external entry point.

---

## Mistake 7: TLS Secret Missing

If the Ingress references:

```yaml
secretName: webapp-tls
```

but the Secret doesn't exist or is invalid, HTTPS may fail.

---

## Mistake 8: Controller-Specific Annotation Assumptions

An annotation supported by one controller may not work with another.

---

# 70. Quick Troubleshooting Matrix

| Symptom               | Possible Cause                 | Check                      |
| --------------------- | ------------------------------ | -------------------------- |
| No external access    | Controller/external IP problem | Controller + LoadBalancer  |
| 404                   | Host/path mismatch             | Ingress rules              |
| 502                   | Backend unavailable            | Service/endpoints          |
| 503                   | No Ready backends              | Pods/readiness             |
| TLS error             | Certificate/Secret issue       | TLS Secret/controller      |
| No endpoints          | Service selector issue         | Service + EndpointSlices   |
| Ingress ignored       | Wrong IngressClass             | `kubectl get ingressclass` |
| Intermittent failures | Pod/backend health             | Pod status + readiness     |
| High latency          | Controller/backend resources   | Metrics                    |
| Controller crashes    | Resource/configuration issue   | Controller logs            |

---

# 71. Important kubectl Commands

```bash
# List Ingress resources
kubectl get ingress

# List all Ingress resources
kubectl get ingress -A

# Describe an Ingress
kubectl describe ingress <name>

# Get Ingress YAML
kubectl get ingress <name> -o yaml

# List IngressClasses
kubectl get ingressclass

# List Services
kubectl get svc

# List Pods
kubectl get pods -o wide

# Check Endpoints
kubectl get endpoints

# Check EndpointSlices
kubectl get endpointslices

# Check events
kubectl get events --sort-by=.lastTimestamp

# Check controller Pods
kubectl get pods -A

# View controller logs
kubectl logs -n <controller-namespace> <controller-pod>
```

---

# 72. Interview Questions

### What is Kubernetes Ingress?

Ingress is a Kubernetes API resource used to define rules for routing external HTTP/HTTPS traffic to Kubernetes Services.

### Does Ingress itself route traffic?

No. An Ingress resource contains routing rules. An Ingress Controller implements those rules.

### What is an Ingress Controller?

It is the software component that watches Ingress resources and configures/handles traffic routing according to those resources.

### Can Ingress route traffic based on hostname?

Yes.

Example:

```text
app.example.com → app-service
api.example.com → api-service
```

### Can Ingress route traffic based on URL path?

Yes.

Example:

```text
example.com/app → app-service
example.com/api → api-service
```

### What are Ingress path types?

The Kubernetes Ingress API supports:

```text
Prefix
Exact
ImplementationSpecific
```

### What is `ingressClassName`?

It identifies the IngressClass/controller intended to process the Ingress.

### Can Ingress handle HTTPS?

Yes. Ingress can define TLS configuration, with the actual TLS behavior implemented by the Ingress Controller.

### Where is the TLS certificate stored?

Typically in a Kubernetes Secret referenced by the Ingress.

### Does Ingress route directly to Pods?

Normally, Ingress routes to a Kubernetes Service, which then provides access to backend Pods.

### What is the difference between Ingress and Service?

A Service provides stable networking and load balancing for a set of Pods. Ingress provides HTTP/HTTPS routing into Services.

### Can one Ingress route to multiple Services?

Yes.

### Can one Ingress support multiple domains?

Yes.

### Can one Ingress support multiple paths?

Yes.

### What causes a 502 from an Ingress?

Common causes include:

* Backend Service problems
* Incorrect ports
* Unavailable Pods
* Connection failures
* Controller/backend configuration problems

### What causes a 503?

Common causes include:

* No ready backend Pods
* Service selector problems
* Readiness failures
* Controller unable to reach the backend

### How do you troubleshoot an Ingress?

Start with:

```bash
kubectl get ingress
kubectl describe ingress <name>
kubectl get svc
kubectl get endpoints
kubectl get endpointslices
kubectl get pods
```

Then inspect the Ingress Controller logs.

---

# 73. Ingress Architecture Summary

```text
                         Internet
                            │
                            ▼
                           DNS
                            │
                            ▼
                    External Endpoint
                            │
                            ▼
                  ┌──────────────────┐
                  │ Ingress Controller│
                  └────────┬─────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
             Host Rule             Path Rule
                │                     │
                └──────────┬──────────┘
                           ▼
                       Services
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
           Pod 1         Pod 2         Pod 3
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                       Containers
```

---

# 74. Ingress Request Lifecycle

A typical request lifecycle is:

```text
1. User enters URL
       │
       ▼
2. DNS resolves hostname
       │
       ▼
3. Request reaches external endpoint
       │
       ▼
4. Ingress Controller receives request
       │
       ▼
5. Host is evaluated
       │
       ▼
6. Path is evaluated
       │
       ▼
7. Backend Service is selected
       │
       ▼
8. Service selects backend Pods
       │
       ▼
9. Request reaches application container
       │
       ▼
10. Response returns to client
```

---

# 75. Best-Practice Ingress Pattern

A common production architecture is:

```text
                           Internet
                              │
                              ▼
                         DNS / CDN
                              │
                              ▼
                       Load Balancer
                              │
                              ▼
                             WAF
                              │
                              ▼
                   Ingress Controller
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
          Frontend         API Service    Admin Service
           Service             │              │
               │               ▼              ▼
               ▼             API Pods      Admin Pods
          Frontend Pods
```

Security and operational layers may additionally include:

```text
TLS
Authentication
Authorization
Rate Limiting
NetworkPolicy
Monitoring
Logging
Alerting
```

---

# 76. Key Takeaways

```text
Ingress
│
├── Provides HTTP/HTTPS routing
│
├── Routes external traffic to Kubernetes Services
│
├── Supports host-based routing
│
├── Supports path-based routing
│
├── Supports TLS configuration
│
├── Uses IngressClass to identify the intended controller
│
├── Requires an Ingress Controller to implement routing
│
├── Works with Kubernetes Services and Pods
│
├── Is commonly used for microservices
│
├── Can provide a single external entry point
│
└── Requires careful security and monitoring
```

The most important concept is:

> **Ingress defines how HTTP/HTTPS traffic should be routed, while the Ingress Controller implements those routing rules.**

A typical traffic flow is:

```text
Client
  ↓
DNS
  ↓
External Load Balancer
  ↓
Ingress Controller
  ↓
Ingress Rules
  ↓
Kubernetes Service
  ↓
Pod
  ↓
Container
```

For modern Kubernetes platforms, also evaluate **Gateway API** when you need more advanced and expressive traffic-management capabilities than traditional Ingress provides.
