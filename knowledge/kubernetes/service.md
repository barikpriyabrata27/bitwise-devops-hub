# Kubernetes Service --- Complete Study & Reference Guide

> A comprehensive practical guide to Kubernetes Services: why Services
> exist, selectors, labels, ports, ClusterIP, NodePort, LoadBalancer,
> ExternalName, Headless Services, DNS, EndpointSlices, kube-proxy,
> service discovery, traffic flow, session affinity, external traffic
> policy, internal traffic policy, topology-aware routing, ports and
> protocols, YAML examples, troubleshooting, hands-on labs, production
> practices, and interview questions.

------------------------------------------------------------------------

# 1. What Is a Kubernetes Service?

A Kubernetes **Service** is an abstraction that provides a stable
network endpoint for a group of Pods.

Pods are temporary.

Their:

-   IP addresses can change
-   names can change
-   replicas can be created or destroyed
-   nodes can change

A Service provides a stable way to reach those Pods.

Mental model:

``` text
                Service
                   |
        +----------+----------+
        |          |          |
        v          v          v
      Pod A      Pod B      Pod C
    10.1.0.10  10.1.0.11  10.1.0.12
```

The client does not need to know the individual Pod IPs.

------------------------------------------------------------------------

# 2. Why Do We Need Services?

Imagine a Deployment:

``` text
Deployment
    |
    +-- Pod 1 -> 10.244.1.10
    +-- Pod 2 -> 10.244.1.11
    +-- Pod 3 -> 10.244.2.10
```

Pods can be replaced.

Pod 1 may disappear:

``` text
Pod 1 -> deleted
```

A new Pod may get:

``` text
10.244.3.15
```

If clients directly use Pod IPs, their configuration breaks.

A Service solves this:

``` text
Client
  |
  v
Service
  |
  +--> Pod 2
  +--> Pod 3
  +--> New Pod
```

------------------------------------------------------------------------

# 3. Service Provides a Stable Endpoint

A Service normally provides:

``` text
stable virtual IP
stable DNS name
stable port
```

Example:

``` text
python-app.default.svc.cluster.local
```

The backend Pods can change without requiring clients to know their
individual IP addresses.

------------------------------------------------------------------------

# 4. Service and Deployment

A very common Kubernetes architecture is:

``` text
Deployment
    |
    v
ReplicaSet
    |
    v
Pods
    |
    ^
    |
Service
```

The Service does not create Pods.

The Deployment creates and manages Pods.

The Service provides networking to the selected Pods.

------------------------------------------------------------------------

# 5. Service and ReplicaSet

``` text
Deployment
    |
    v
ReplicaSet
    |
    v
Pod Pod Pod
 \   |   /
  \  |  /
   \ | /
  Service
```

A Service uses labels/selectors to identify the Pods it should send
traffic to.

------------------------------------------------------------------------

# 6. Service Does Not Deploy Applications

This is a common beginner mistake.

A Service:

``` text
does NOT:
- create containers
- create Pods
- create ReplicaSets
- build images
```

A Service:

``` text
does:
- provide network access
- provide stable addressing
- select backend Pods
- expose applications
```

------------------------------------------------------------------------

# 7. Basic Service YAML

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app
spec:
  selector:
    app: python-app

  ports:
    - port: 80
      targetPort: 5000

  type: ClusterIP
```

------------------------------------------------------------------------

# 8. Understanding the YAML

``` yaml
selector:
  app: python-app
```

means:

``` text
Find Pods with:
app=python-app
```

Then:

``` yaml
port: 80
```

is the Service port.

And:

``` yaml
targetPort: 5000
```

is the backend Pod port.

------------------------------------------------------------------------

# 9. Service Port vs Target Port

This is extremely important.

``` text
Client
   |
   | port 80
   v
Service
   |
   | targetPort 5000
   v
Pod
   |
   | application listens on 5000
   v
Application
```

Therefore:

``` text
port = Service port
targetPort = backend port
```

------------------------------------------------------------------------

# 10. Example

Service:

``` yaml
ports:
  - port: 80
    targetPort: 5000
```

Application:

``` text
Pod listens on:
5000
```

Client connects to:

``` text
Service:80
```

Service forwards to:

``` text
Pod:5000
```

------------------------------------------------------------------------

# 11. `containerPort` vs `targetPort`

Deployment:

``` yaml
containers:
  - name: app
    image: example/app
    ports:
      - containerPort: 5000
```

Service:

``` yaml
ports:
  - port: 80
    targetPort: 5000
```

They have different purposes.

``` text
containerPort
=
documentation/Pod port declaration

targetPort
=
Service backend destination
```

A Service can target a port even if `containerPort` was not explicitly
declared, provided the application is actually listening there.

------------------------------------------------------------------------

# 12. The Most Important Service Fields

Common fields:

``` yaml
spec:
  selector:
  ports:
  type:
  clusterIP:
  externalTrafficPolicy:
  internalTrafficPolicy:
  sessionAffinity:
```

Advanced configurations add more fields.

------------------------------------------------------------------------

# 13. Service Types

The primary Service types are:

``` text
ClusterIP
NodePort
LoadBalancer
ExternalName
```

There are also headless Services using:

``` yaml
clusterIP: None
```

------------------------------------------------------------------------

# 14. ClusterIP

Default Service type:

``` yaml
type: ClusterIP
```

It exposes the Service inside the cluster.

Example:

``` text
Pod A
  |
  v
ClusterIP Service
  |
  +--> Pod B
  +--> Pod C
```

External clients cannot normally reach a ClusterIP directly.

------------------------------------------------------------------------

# 15. ClusterIP Example

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app
spec:
  type: ClusterIP

  selector:
    app: python-app

  ports:
    - port: 80
      targetPort: 5000
```

------------------------------------------------------------------------

# 16. What Is ClusterIP?

ClusterIP is a virtual IP allocated to the Service.

Example:

``` text
Service:
python-app

ClusterIP:
10.96.100.20
```

Clients inside the cluster can access:

``` text
10.96.100.20:80
```

or preferably:

``` text
python-app:80
```

through Kubernetes DNS.

------------------------------------------------------------------------

# 17. NodePort

NodePort exposes a Service on a port on each node.

Example:

``` yaml
type: NodePort
```

Conceptual flow:

``` text
External Client
      |
      v
NodeIP:NodePort
      |
      v
Service
      |
      v
Pod
```

------------------------------------------------------------------------

# 18. NodePort Example

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app
spec:
  type: NodePort

  selector:
    app: python-app

  ports:
    - port: 80
      targetPort: 5000
      nodePort: 30080
```

The client can access:

``` text
<NodeIP>:30080
```

assuming network/firewall configuration permits it.

------------------------------------------------------------------------

# 19. NodePort Range

Kubernetes commonly uses the default NodePort range:

``` text
30000-32767
```

The configured cluster may use a different range.

Check the API server configuration if you need the exact range.

------------------------------------------------------------------------

# 20. NodePort Ports

NodePort involves three useful port concepts:

``` text
nodePort
    |
    v
port
    |
    v
targetPort
```

Example:

``` yaml
ports:
  - nodePort: 30080
    port: 80
    targetPort: 5000
```

Flow:

``` text
Node:30080
     |
     v
Service:80
     |
     v
Pod:5000
```

------------------------------------------------------------------------

# 21. LoadBalancer

A LoadBalancer Service is commonly used to expose an application
externally through a cloud or infrastructure load balancer.

Example:

``` yaml
type: LoadBalancer
```

Conceptual flow:

``` text
Internet
   |
   v
External Load Balancer
   |
   v
Kubernetes Service
   |
   v
Pods
```

The exact implementation depends on the cluster's cloud/provider
integration or load-balancer implementation.

------------------------------------------------------------------------

# 22. LoadBalancer Example

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app
spec:
  type: LoadBalancer

  selector:
    app: python-app

  ports:
    - port: 80
      targetPort: 5000
```

Then:

``` bash
kubectl get service python-app
```

You may eventually see an:

``` text
EXTERNAL-IP
```

if the environment provisions one.

------------------------------------------------------------------------

# 23. LoadBalancer on Local Clusters

On environments such as:

``` text
Minikube
kind
Docker Desktop
bare-metal Kubernetes
```

a LoadBalancer may not automatically provide a cloud external IP.

The behavior depends on the environment.

You may need an environment-specific mechanism.

------------------------------------------------------------------------

# 24. ExternalName

`ExternalName` maps a Service name to an external DNS name.

Example:

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: database.example.com
```

Conceptually:

``` text
Pod
 |
 v
external-db
 |
 DNS
 |
 v
database.example.com
```

It does not create normal Pod endpoints.

------------------------------------------------------------------------

# 25. Headless Service

A headless Service uses:

``` yaml
clusterIP: None
```

Example:

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: database
spec:
  clusterIP: None

  selector:
    app: database

  ports:
    - port: 5432
      targetPort: 5432
```

------------------------------------------------------------------------

# 26. Why Use Headless Services?

Headless Services are useful when clients need to discover individual
backend Pods rather than a single virtual Service IP.

Common use cases include:

``` text
StatefulSets
databases
distributed systems
service discovery
peer-to-peer systems
```

------------------------------------------------------------------------

# 27. Normal vs Headless Service

Normal:

``` text
DNS
 |
 v
Service IP
 |
 +--> Pod A
 +--> Pod B
 +--> Pod C
```

Headless:

``` text
DNS
 |
 +--> Pod A IP
 +--> Pod B IP
 +--> Pod C IP
```

The exact DNS responses depend on the Service and query.

------------------------------------------------------------------------

# 28. Service Selectors

The selector is one of the most important Service fields.

Example:

``` yaml
selector:
  app: python-app
```

The Service looks for Pods with:

``` yaml
labels:
  app: python-app
```

------------------------------------------------------------------------

# 29. Selector and Labels Must Match

Pod:

``` yaml
labels:
  app: python-app
```

Service:

``` yaml
selector:
  app: python-app
```

Match:

``` text
YES
```

If Service selector is:

``` yaml
selector:
  app: backend
```

then:

``` text
No matching Pods
```

unless Pods have that label.

------------------------------------------------------------------------

# 30. Service Selector Does Not Need to Match Deployment Name

Deployment:

``` yaml
metadata:
  name: python-app
```

Pod label:

``` yaml
app: python-app
```

Service:

``` yaml
selector:
  app: python-app
```

The Service uses labels, not the Deployment name.

------------------------------------------------------------------------

# 31. Service and Replica Count

Suppose:

``` yaml
replicas: 3
```

and all Pods have:

``` text
app=python-app
```

Service sees:

``` text
Pod 1
Pod 2
Pod 3
```

If one Pod dies:

``` text
Pod 1 -> deleted
```

ReplicaSet creates another:

``` text
Pod 4
```

Service automatically uses the current eligible backend set.

------------------------------------------------------------------------

# 32. Service and Pod Lifecycle

``` text
Deployment
    |
    v
ReplicaSet
    |
    v
Pod created
    |
    v
Pod gets IP
    |
    v
Pod becomes Ready
    |
    v
Service routes eligible traffic
```

Readiness is important for deciding whether a Pod should receive
traffic.

------------------------------------------------------------------------

# 33. Service and Readiness Probe

Suppose:

``` yaml
readinessProbe:
  httpGet:
    path: /healthz
    port: 5000
```

If the Pod is not Ready, it normally should not receive regular Service
traffic.

Conceptually:

``` text
Pod A -> Ready
Pod B -> NotReady
Pod C -> Ready

Service
  |
  +--> A
  |
  +--> C
```

------------------------------------------------------------------------

# 34. Service and Liveness Probe

Liveness and Service routing solve different problems.

``` text
Liveness
=
Should this container be restarted?

Readiness
=
Should this Pod receive traffic?
```

------------------------------------------------------------------------

# 35. Service and Startup Probe

A startup probe can protect slow-starting applications from premature
liveness failures.

Conceptually:

``` text
Startup
   |
   v
Application initializes
   |
   v
Startup succeeds
   |
   +--> liveness/readiness behavior proceeds
```

------------------------------------------------------------------------

# 36. Service Discovery

Kubernetes provides DNS-based Service discovery.

Example Service:

``` text
python-app
```

in:

``` text
default
```

can generally be reached as:

``` text
python-app
```

from a Pod in the same namespace.

------------------------------------------------------------------------

# 37. Fully Qualified Service DNS

General form:

``` text
<service>.<namespace>.svc.<cluster-domain>
```

Common default cluster domain:

``` text
cluster.local
```

Example:

``` text
python-app.default.svc.cluster.local
```

The cluster domain can be configured differently.

------------------------------------------------------------------------

# 38. Service DNS Within Same Namespace

From a Pod in:

``` text
default
```

you can typically use:

``` text
python-app
```

instead of the full DNS name.

------------------------------------------------------------------------

# 39. Service DNS Across Namespaces

Suppose Service:

``` text
backend
```

is in:

``` text
production
```

A Pod in another namespace can use:

``` text
backend.production
```

or:

``` text
backend.production.svc.cluster.local
```

assuming normal cluster DNS configuration.

------------------------------------------------------------------------

# 40. Service DNS and Ports

DNS resolves the Service address.

It does not automatically select the port.

Example:

``` text
backend.production.svc.cluster.local:8080
```

The application must connect to the correct Service port.

------------------------------------------------------------------------

# 41. CoreDNS

Kubernetes clusters commonly use **CoreDNS** for cluster DNS.

Conceptually:

``` text
Application
    |
    v
DNS query
    |
    v
CoreDNS
    |
    v
Service DNS
```

------------------------------------------------------------------------

# 42. What CoreDNS Does

CoreDNS provides DNS resolution for Kubernetes resources according to
its configuration.

It can resolve:

``` text
Service names
Pod-related DNS records
other configured DNS zones
```

------------------------------------------------------------------------

# 43. Check CoreDNS

``` bash
kubectl get pods -n kube-system
```

Look for CoreDNS Pods.

Depending on your cluster, names and deployment details may vary.

------------------------------------------------------------------------

# 44. Service DNS Troubleshooting

From a test Pod:

``` bash
nslookup python-app
```

or:

``` bash
nslookup python-app.default.svc.cluster.local
```

Depending on the image, `dig` may also be available.

------------------------------------------------------------------------

# 45. EndpointSlice

Modern Kubernetes uses **EndpointSlices** to represent network endpoints
associated with Services.

Conceptually:

``` text
Service
   |
   v
EndpointSlices
   |
   +--> Pod IP A
   +--> Pod IP B
   +--> Pod IP C
```

EndpointSlices scale better than the older single Endpoints object for
large numbers of endpoints.

------------------------------------------------------------------------

# 46. Check EndpointSlices

``` bash
kubectl get endpointslices
```

For a specific Service:

``` bash
kubectl get endpointslices \
  -l kubernetes.io/service-name=python-app
```

------------------------------------------------------------------------

# 47. Inspect EndpointSlice

``` bash
kubectl describe endpointslice <name>
```

You can inspect:

``` text
addresses
ports
conditions
node
zone
```

------------------------------------------------------------------------

# 48. Endpoint Conditions

Endpoint information can include conditions such as:

``` text
ready
serving
terminating
```

These help Kubernetes and traffic-routing components reason about
endpoint state.

------------------------------------------------------------------------

# 49. Service With No Endpoints

If:

``` bash
kubectl get endpointslices
```

shows no usable endpoints for the Service, check:

``` text
selector
Pod labels
Pod readiness
namespace
ports
Pod IP
```

------------------------------------------------------------------------

# 50. The Most Common Service Problem

Service:

``` yaml
selector:
  app: python-app
```

Pods:

``` yaml
labels:
  app: python
```

Result:

``` text
Service has no matching endpoints
```

This is one of the first things to check.

------------------------------------------------------------------------

# 51. Service Traffic Flow

Simplified flow:

``` text
Client Pod
    |
    v
Service DNS
    |
    v
Service virtual IP
    |
    v
Service dataplane
    |
    v
Selected Pod IP
    |
    v
Container
```

The exact dataplane depends on the Kubernetes networking implementation.

------------------------------------------------------------------------

# 52. kube-proxy

Many Kubernetes clusters use `kube-proxy` to implement Service
networking.

It can program node-level packet-processing rules using mechanisms such
as:

``` text
iptables
IPVS
```

depending on configuration and Kubernetes version/environment.

Modern clusters may also use alternative service dataplanes provided by
network implementations.

------------------------------------------------------------------------

# 53. kube-proxy's Role

Conceptually:

``` text
Service
   |
   v
Service rules
   |
   v
Backend endpoints
```

When traffic arrives for the Service virtual IP/port, the node's
networking rules can direct it toward an eligible backend.

------------------------------------------------------------------------

# 54. Service Load Balancing

A Service can distribute traffic among multiple backend Pods.

Example:

``` text
             Service
                |
       +--------+--------+
       |        |        |
       v        v        v
     Pod A    Pod B    Pod C
```

The exact selection algorithm depends on the service dataplane and
configuration.

Do not assume a simplistic exact round-robin model in every cluster.

------------------------------------------------------------------------

# 55. Session Affinity

Kubernetes Services support:

``` yaml
sessionAffinity: ClientIP
```

This can provide client-IP-based session affinity.

Example:

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: sticky-service
spec:
  selector:
    app: web

  sessionAffinity: ClientIP

  ports:
    - port: 80
      targetPort: 8080
```

------------------------------------------------------------------------

# 56. Default Session Affinity

Default:

``` yaml
sessionAffinity: None
```

Traffic can be distributed among eligible endpoints without ClientIP
session affinity.

------------------------------------------------------------------------

# 57. When to Use Session Affinity

Possible use cases:

``` text
legacy applications
in-memory session state
applications that cannot easily externalize sessions
```

But prefer stateless architectures where practical.

------------------------------------------------------------------------

# 58. Session Affinity Is Not a Replacement for Shared State

If an application needs:

``` text
session data
```

it is often better to use:

``` text
Redis
database
distributed session store
```

rather than depending heavily on sticky routing.

------------------------------------------------------------------------

# 59. External Traffic Policy

For NodePort and LoadBalancer Services, Kubernetes supports:

``` yaml
externalTrafficPolicy: Cluster
```

or:

``` yaml
externalTrafficPolicy: Local
```

------------------------------------------------------------------------

# 60. `externalTrafficPolicy: Cluster`

Conceptually:

``` text
External traffic
      |
      v
Node A
      |
      +--> Pod on Node A
      |
      +--> Pod on Node B
```

Traffic can be routed to endpoints on other nodes.

This may involve an extra network hop.

------------------------------------------------------------------------

# 61. `externalTrafficPolicy: Local`

With:

``` yaml
externalTrafficPolicy: Local
```

traffic is generally sent only to local endpoints for that node.

Conceptually:

``` text
Node A
 |
 +--> local Pod A
```

If there are no local endpoints, the node may not be a usable backend
for that traffic path.

------------------------------------------------------------------------

# 62. Why Use `Local`?

Potential benefits:

-   can preserve source IP in applicable paths
-   avoids cross-node hop for external traffic
-   useful with certain client-IP-aware applications

Trade-offs:

-   uneven traffic distribution
-   nodes without local endpoints may receive no useful traffic
-   requires careful architecture

------------------------------------------------------------------------

# 63. Source IP Preservation

A common reason to use:

``` yaml
externalTrafficPolicy: Local
```

is preserving the original client source IP in certain
NodePort/LoadBalancer traffic paths.

Always verify behavior in your actual cloud/load-balancer environment.

------------------------------------------------------------------------

# 64. Internal Traffic Policy

Kubernetes also supports:

``` yaml
internalTrafficPolicy: Local
```

This can restrict internal Service traffic to node-local endpoints.

Example:

``` yaml
spec:
  internalTrafficPolicy: Local
```

------------------------------------------------------------------------

# 65. Internal Traffic Policy Use Case

Potential use cases:

``` text
node-local services
latency optimization
avoiding cross-node traffic
local agents
```

If no local endpoint is available, traffic may fail rather than being
sent to a remote endpoint.

------------------------------------------------------------------------

# 66. Topology-Aware Routing

Kubernetes supports topology-aware traffic routing mechanisms.

Conceptually:

``` text
Client in Zone A
      |
      v
prefer endpoint in Zone A
```

This can help reduce:

``` text
cross-zone traffic
latency
network cost
```

The exact behavior depends on Kubernetes version, service configuration,
endpoint topology information, and networking implementation.

------------------------------------------------------------------------

# 67. Service Ports

A Service can expose multiple ports.

Example:

``` yaml
ports:
  - name: http
    port: 80
    targetPort: 8080

  - name: metrics
    port: 9090
    targetPort: 9090
```

This is common for:

``` text
application traffic
metrics
admin endpoints
```

------------------------------------------------------------------------

# 68. Named Service Ports

Example:

``` yaml
ports:
  - name: http
    port: 80
    targetPort: http
```

If the container defines:

``` yaml
ports:
  - name: http
    containerPort: 8080
```

the Service can target the named container port.

------------------------------------------------------------------------

# 69. Named Ports

Deployment:

``` yaml
containers:
  - name: app
    image: example/app
    ports:
      - name: http
        containerPort: 5000
```

Service:

``` yaml
ports:
  - name: http
    port: 80
    targetPort: http
```

This avoids hardcoding the numeric target port in the Service.

------------------------------------------------------------------------

# 70. Service Protocol

Service ports support protocols such as:

``` text
TCP
UDP
SCTP
```

Example:

``` yaml
ports:
  - port: 53
    targetPort: 53
    protocol: UDP
```

The application and networking implementation must support the chosen
protocol.

------------------------------------------------------------------------

# 71. TCP Example

``` yaml
ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 5000
```

------------------------------------------------------------------------

# 72. UDP Example

``` yaml
ports:
  - name: dns
    protocol: UDP
    port: 53
    targetPort: 53
```

------------------------------------------------------------------------

# 73. Multiple Ports Require Names

When exposing multiple Service ports, each port should have a unique
name.

Example:

``` yaml
ports:
  - name: http
    port: 80
    targetPort: 8080

  - name: https
    port: 443
    targetPort: 8443
```

------------------------------------------------------------------------

# 74. Service IP Families

Kubernetes supports IPv4 and IPv6 networking depending on cluster
configuration.

Fields can include:

``` yaml
ipFamilyPolicy:
```

and:

``` yaml
ipFamilies:
```

Examples of policies include:

``` text
SingleStack
PreferDualStack
RequireDualStack
```

The exact availability depends on cluster configuration.

------------------------------------------------------------------------

# 75. Dual-Stack Services

A dual-stack cluster can support:

``` text
IPv4
+
IPv6
```

A Service may be configured to use both address families where
supported.

This is an advanced networking topic.

------------------------------------------------------------------------

# 76. Service ClusterIP Allocation

When a Service is created as a normal ClusterIP Service, Kubernetes
allocates an IP from the configured Service CIDR.

Example:

``` text
Service CIDR:
10.96.0.0/12

Service:
10.96.100.20
```

The exact CIDR depends on cluster configuration.

------------------------------------------------------------------------

# 77. Service CIDR

The Service CIDR is the address range from which ClusterIP addresses are
allocated.

Example:

``` text
10.96.0.0/12
```

Do not assume this is universal.

Different clusters may use different ranges.

------------------------------------------------------------------------

# 78. Pod CIDR vs Service CIDR

Important distinction:

``` text
Pod CIDR
=
addresses used for Pods

Service CIDR
=
virtual IPs used for Services
```

Example:

``` text
Pod:
10.244.x.x

Service:
10.96.x.x
```

These are example ranges only.

------------------------------------------------------------------------

# 79. Service IP Is Virtual

A ClusterIP is not normally the IP of a physical network interface.

It is a virtual Service address implemented by the cluster networking
dataplane.

------------------------------------------------------------------------

# 80. Service Without Selector

A Service can be created without a selector.

Example:

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: external-service
spec:
  ports:
    - port: 80
      targetPort: 8080
```

You can then manage EndpointSlices separately.

This is useful when the backend is not represented by normal Pod label
selection.

------------------------------------------------------------------------

# 81. Manual EndpointSlice Use

For selector-less Services, EndpointSlices can represent external or
manually managed endpoints.

Conceptually:

``` text
Service
   |
   v
EndpointSlice
   |
   +--> external IP
```

This is an advanced use case.

------------------------------------------------------------------------

# 82. Service and External Backends

You may use a Service abstraction for a backend that is:

``` text
outside the cluster
```

with appropriate endpoint configuration.

This can provide a stable Kubernetes DNS name for applications.

------------------------------------------------------------------------

# 83. Service and Ingress

A common architecture:

``` text
Internet
   |
   v
Ingress / Gateway
   |
   v
Service
   |
   v
Pods
```

Ingress usually routes HTTP/HTTPS requests to Services.

The Service then routes to backend Pods.

------------------------------------------------------------------------

# 84. Service vs Ingress

### Service

Provides:

``` text
network endpoint for backend Pods
```

### Ingress

Provides:

``` text
HTTP/HTTPS routing
host/path rules
```

Mental model:

``` text
Ingress
   |
   v
Service
   |
   v
Pods
```

------------------------------------------------------------------------

# 85. Service vs Gateway API

Modern Kubernetes environments may use Gateway API for more expressive
traffic management.

Conceptually:

``` text
Gateway
   |
   v
Service
   |
   v
Pods
```

Gateway API and Ingress solve related but distinct traffic-management
concerns.

------------------------------------------------------------------------

# 86. Service vs NodePort

``` text
ClusterIP
=
internal virtual endpoint

NodePort
=
node-level externally reachable port

LoadBalancer
=
external load-balancer integration
```

------------------------------------------------------------------------

# 87. Service vs Pod IP

Pod IP:

``` text
temporary
```

Service:

``` text
stable abstraction
```

Do not hardcode Pod IPs for normal application communication.

------------------------------------------------------------------------

# 88. Service vs DNS

DNS gives you a name.

Service gives you the Kubernetes networking abstraction behind that
name.

Example:

``` text
python-app.default.svc.cluster.local
```

DNS resolves the Service name.

The Service dataplane then handles traffic toward eligible endpoints.

------------------------------------------------------------------------

# 89. Service and Application Port

Suppose Python application listens on:

``` text
5000
```

Service:

``` yaml
port: 80
targetPort: 5000
```

Then:

``` text
Application:
5000

Service:
80
```

Clients use:

``` text
python-app:80
```

------------------------------------------------------------------------

# 90. Service and ContainerPort

Example Deployment:

``` yaml
ports:
  - containerPort: 5000
```

This does not automatically expose the application outside the cluster.

You still need a Service if you want Service-based networking.

------------------------------------------------------------------------

# 91. Complete Python App Example

Deployment:

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-app
spec:
  replicas: 3

  selector:
    matchLabels:
      app: python-app

  template:
    metadata:
      labels:
        app: python-app

    spec:
      containers:
        - name: python-app
          image: example/python-app:v1

          ports:
            - name: http
              containerPort: 5000

          readinessProbe:
            httpGet:
              path: /healthz
              port: http
            initialDelaySeconds: 3
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: python-app
spec:
  type: ClusterIP

  selector:
    app: python-app

  ports:
    - name: http
      port: 80
      targetPort: http
```

------------------------------------------------------------------------

# 92. Python App Traffic Flow

``` text
Client Pod
    |
    | http://python-app
    v
CoreDNS
    |
    v
ClusterIP
    |
    v
Service dataplane
    |
    +------> Pod 1:5000
    |
    +------> Pod 2:5000
    |
    +------> Pod 3:5000
```

Only eligible endpoints receive traffic.

------------------------------------------------------------------------

# 93. Verify Service

``` bash
kubectl get services
```

or:

``` bash
kubectl get svc
```

Example:

``` text
NAME         TYPE        CLUSTER-IP      PORT(S)
python-app   ClusterIP   10.96.100.20    80/TCP
```

------------------------------------------------------------------------

# 94. Describe Service

``` bash
kubectl describe service python-app
```

Check:

``` text
Selector
Type
IP
Port
TargetPort
Endpoints/Endpoint information
Events
```

Modern clusters may primarily expose endpoint information through
EndpointSlices.

------------------------------------------------------------------------

# 95. Get Service YAML

``` bash
kubectl get service python-app -o yaml
```

Useful for debugging:

``` text
selector
ports
clusterIP
type
sessionAffinity
traffic policies
```

------------------------------------------------------------------------

# 96. Check EndpointSlices

``` bash
kubectl get endpointslices \
  -l kubernetes.io/service-name=python-app
```

Then:

``` bash
kubectl describe endpointslice <name>
```

------------------------------------------------------------------------

# 97. Test Service From Inside Cluster

Run a temporary test Pod:

``` bash
kubectl run curl-test \
  --image=curlimages/curl \
  --rm -it -- sh
```

Then:

``` bash
curl http://python-app
```

------------------------------------------------------------------------

# 98. Test Fully Qualified DNS

Inside the test Pod:

``` bash
curl http://python-app.default.svc.cluster.local
```

------------------------------------------------------------------------

# 99. Test Service IP

Get Service:

``` bash
kubectl get svc python-app
```

Then:

``` bash
curl http://<cluster-ip>:80
```

from a suitable Pod inside the cluster.

------------------------------------------------------------------------

# 100. Test NodePort

Get:

``` bash
kubectl get svc python-app
```

Example:

``` text
PORT(S)
80:30080/TCP
```

Then access:

``` text
<NodeIP>:30080
```

if your environment allows it.

------------------------------------------------------------------------

# 101. Get Node IPs

``` bash
kubectl get nodes -o wide
```

Look for:

``` text
INTERNAL-IP
```

External access depends on network/firewall configuration.

------------------------------------------------------------------------

# 102. Test LoadBalancer

``` bash
kubectl get svc python-app
```

Wait for:

``` text
EXTERNAL-IP
```

if your environment supports automatic load-balancer provisioning.

Then access:

``` text
http://<external-ip>
```

on the exposed Service port.

------------------------------------------------------------------------

# 103. Troubleshooting: Service Has No Endpoints

Check:

``` bash
kubectl get pods --show-labels
```

Compare:

``` text
Pod labels
```

with:

``` yaml
selector:
```

------------------------------------------------------------------------

# 104. Troubleshooting: Selector Mismatch

Service:

``` yaml
selector:
  app: python-app
```

Pod:

``` yaml
labels:
  app: python
```

Result:

``` text
No matching endpoint
```

Fix either:

``` text
Pod labels
```

or:

``` text
Service selector
```

so they match the intended workload.

------------------------------------------------------------------------

# 105. Troubleshooting: Wrong Namespace

Service:

``` text
default/python-app
```

Pod:

``` text
production
```

A Service only selects Pods in its own namespace.

A Service in `default` does not select Pods in `production`.

------------------------------------------------------------------------

# 106. Troubleshooting: Wrong TargetPort

Application listens:

``` text
5000
```

Service:

``` yaml
targetPort: 8000
```

Traffic reaches:

``` text
Pod:8000
```

but application listens on:

``` text
Pod:5000
```

Result:

``` text
connection failure
```

------------------------------------------------------------------------

# 107. Troubleshooting: Wrong Service Port

Service:

``` yaml
port: 80
```

Client connects:

``` text
:5000
```

That will not work unless the Service actually exposes port 5000.

Remember:

``` text
Client -> Service port
Service -> targetPort
```

------------------------------------------------------------------------

# 108. Troubleshooting: Pod Not Ready

Check:

``` bash
kubectl get pods
```

If:

``` text
READY
0/1
```

check:

``` bash
kubectl describe pod <pod>
```

A failed readiness probe can prevent the Pod from being considered a
ready Service endpoint.

------------------------------------------------------------------------

# 109. Troubleshooting: Service Exists but Connection Fails

Use this order:

``` text
1. Check Service
2. Check selector
3. Check EndpointSlices
4. Check Pod readiness
5. Check targetPort
6. Check application listening port
7. Test Pod directly
8. Test Service DNS
9. Test Service IP
10. Check NetworkPolicy
```

------------------------------------------------------------------------

# 110. Test Pod Directly

Find Pod IP:

``` bash
kubectl get pods -o wide
```

Then from a test Pod:

``` bash
curl http://<pod-ip>:5000
```

If Pod direct access fails:

``` text
application/container/network issue
```

If Pod direct access works but Service fails:

``` text
Service configuration/dataplane issue
```

------------------------------------------------------------------------

# 111. Check Application Listening Port

Inside the container:

``` bash
kubectl exec -it <pod> -- sh
```

Depending on the image, tools such as:

``` bash
ss -lnt
```

may be available.

Verify the application is listening on the expected port.

------------------------------------------------------------------------

# 112. Troubleshooting: DNS Failure

From a test Pod:

``` bash
nslookup python-app
```

If DNS fails, check:

``` text
CoreDNS
Pod DNS configuration
NetworkPolicy
cluster DNS service
```

------------------------------------------------------------------------

# 113. Troubleshooting: ClusterIP Not Reachable

Check:

``` bash
kubectl get svc python-app
kubectl get endpointslices -l kubernetes.io/service-name=python-app
```

Then check:

``` text
network plugin
service dataplane
kube-proxy
NetworkPolicy
node networking
```

------------------------------------------------------------------------

# 114. Troubleshooting: NodePort Not Reachable

Check:

``` text
Service type
NodePort
node IP
firewall
cloud security groups
network routing
externalTrafficPolicy
```

Also test the Service from inside the cluster.

------------------------------------------------------------------------

# 115. Troubleshooting: LoadBalancer Pending

If:

``` text
EXTERNAL-IP = <pending>
```

check:

``` text
cloud provider integration
load-balancer controller
cloud credentials
subnets
security rules
service events
```

Use:

``` bash
kubectl describe service <service>
```

------------------------------------------------------------------------

# 116. Troubleshooting: Service Routes to Wrong Application

This is often a selector problem.

Example:

``` text
Service selector:
app=web

Two Deployments:
web-v1
web-v2

Both Pods:
app=web
```

The Service may select both.

Use more specific labels.

------------------------------------------------------------------------

# 117. Recommended Labels

Example:

``` yaml
labels:
  app: python-app
  component: api
  version: v1
```

Service:

``` yaml
selector:
  app: python-app
  component: api
```

Avoid accidental overlap.

------------------------------------------------------------------------

# 118. Service Selector Best Practice

Use stable application labels.

For example:

``` text
app=python-app
```

Do not use a temporary Pod-specific label that changes during every
deployment unless that behavior is intentional.

------------------------------------------------------------------------

# 119. Service and Rolling Updates

Suppose:

``` text
v1 Pods
```

are replaced by:

``` text
v2 Pods
```

If the Service selects:

``` text
app=python-app
```

both versions can potentially be selected during the rollout if they
share the same selector labels.

This allows a rolling transition.

------------------------------------------------------------------------

# 120. Service and Version Labels

Example:

``` text
app=python-app
version=v1
```

and:

``` text
app=python-app
version=v2
```

A general Service:

``` yaml
selector:
  app: python-app
```

can select both.

A version-specific Service:

``` yaml
selector:
  app: python-app
  version: v1
```

selects only v1.

------------------------------------------------------------------------

# 121. Blue-Green Deployment With Services

Conceptually:

``` text
                 Service
                    |
             selector: blue
                    |
                  Blue
```

Switch:

``` text
selector: green
```

Then:

``` text
                 Service
                    |
             selector: green
                    |
                 Green
```

This can provide a simple traffic-switching mechanism.

------------------------------------------------------------------------

# 122. Canary Architecture

A Service can select multiple versions:

``` text
Service
  |
  +--> v1 Pods
  |
  +--> v2 Pods
```

However, a Kubernetes Service selector alone does not provide precise
percentage-based canary control.

For sophisticated traffic splitting, consider:

``` text
Gateway API
service mesh
ingress/controller features
```

depending on your platform.

------------------------------------------------------------------------

# 123. Service and NetworkPolicy

A Service does not bypass NetworkPolicy.

Example:

``` text
Client Pod
   |
   v
Service
   |
   v
NetworkPolicy
   |
   v
Backend Pod
```

If NetworkPolicy blocks the traffic, the Service can exist correctly
while connections still fail.

------------------------------------------------------------------------

# 124. NetworkPolicy Troubleshooting

If:

``` text
Service works
Endpoint exists
Pod is Ready
```

but connection fails, inspect:

``` bash
kubectl get networkpolicy
kubectl describe networkpolicy <policy>
```

The exact behavior depends on your CNI/network-policy implementation.

------------------------------------------------------------------------

# 125. Service and Ingress Example

``` text
Internet
    |
    v
Ingress Controller
    |
    | /api
    v
api-service
    |
    +--> API Pod
    +--> API Pod

    | /web
    v
web-service
    |
    +--> Web Pod
    +--> Web Pod
```

------------------------------------------------------------------------

# 126. Service and Gateway Example

``` text
Client
  |
  v
Gateway
  |
  +--> Service A
  |      |
  |      +--> Pods
  |
  +--> Service B
         |
         +--> Pods
```

------------------------------------------------------------------------

# 127. Service and StatefulSet

StatefulSets often use:

``` text
Headless Service
```

for stable network identity.

Example:

``` text
db-0
db-1
db-2
```

A headless Service can support DNS-based discovery of individual
StatefulSet Pods.

------------------------------------------------------------------------

# 128. StatefulSet Architecture

``` text
Headless Service
       |
       +--> db-0
       +--> db-1
       +--> db-2
```

Each Pod can have a stable identity tied to its StatefulSet ordinal.

------------------------------------------------------------------------

# 129. Headless Service DNS

A StatefulSet commonly creates DNS records associated with Pod
identities when configured with a governing headless Service.

Conceptually:

``` text
db-0.database.namespace.svc.cluster.local
db-1.database.namespace.svc.cluster.local
db-2.database.namespace.svc.cluster.local
```

Exact DNS behavior depends on the StatefulSet and cluster DNS
configuration.

------------------------------------------------------------------------

# 130. Service and DaemonSet

A Service can select Pods created by a DaemonSet.

Example:

``` text
DaemonSet
  |
  +--> Pod on Node A
  +--> Pod on Node B
  +--> Pod on Node C
```

A Service can select them if their labels match.

------------------------------------------------------------------------

# 131. Service and Job

A Service can technically select Pods created by Jobs if labels and
readiness/network behavior make sense, but Services are more commonly
used for long-running workloads such as Deployments and StatefulSets.

------------------------------------------------------------------------

# 132. Service and CronJob

A CronJob creates short-lived Jobs.

A Service is usually not useful for a short-lived batch workload unless
there is a specific networking requirement.

------------------------------------------------------------------------

# 133. Service Account vs Service

Do not confuse:

``` text
Service
```

with:

``` text
ServiceAccount
```

### Service

Network access to Pods.

### ServiceAccount

Identity for workloads interacting with Kubernetes APIs and related
authentication mechanisms.

------------------------------------------------------------------------

# 134. Service and Secrets

A Service does not normally contain application credentials.

You might have:

``` text
Service
+
Deployment
+
Secret
```

Architecture:

``` text
Client
  |
  v
Service
  |
  v
Pod
  |
  +--> Secret
```

------------------------------------------------------------------------

# 135. Service and ConfigMap

ConfigMap provides configuration.

Service provides networking.

``` text
ConfigMap
   |
   v
Application configuration

Service
   |
   v
Application network endpoint
```

They solve different problems.

------------------------------------------------------------------------

# 136. Service and PVC

PVC provides persistent storage.

Service provides networking.

``` text
PVC
 |
 v
persistent application data

Service
 |
 v
network access
```

------------------------------------------------------------------------

# 137. Service and Probes

A strong application configuration often combines:

``` text
Deployment
+
resources
+
probes
+
Service
```

Example:

``` text
Deployment
   |
   +--> resources
   +--> readiness
   +--> liveness
   |
   v
Pods
   ^
   |
Service
```

------------------------------------------------------------------------

# 138. Your Python Application Architecture

A typical setup:

``` text
                Client
                  |
                  v
              Service
             port 80
                  |
                  v
       +----------+----------+
       |          |          |
       v          v          v
    Python     Python     Python
      Pod        Pod        Pod
     :5000      :5000      :5000
```

Deployment controls:

``` text
replicas
image
resources
probes
```

Service controls:

``` text
network endpoint
selector
ports
```

------------------------------------------------------------------------

# 139. Complete Python Service YAML

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app
  labels:
    app: python-app
spec:
  type: ClusterIP

  selector:
    app: python-app

  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 5000

  sessionAffinity: None
```

------------------------------------------------------------------------

# 140. Expose Python App With NodePort

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app-nodeport
spec:
  type: NodePort

  selector:
    app: python-app

  ports:
    - name: http
      port: 80
      targetPort: 5000
      nodePort: 30080
```

------------------------------------------------------------------------

# 141. Expose Python App With LoadBalancer

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app-lb
spec:
  type: LoadBalancer

  selector:
    app: python-app

  ports:
    - name: http
      port: 80
      targetPort: 5000
```

------------------------------------------------------------------------

# 142. Headless Python Service

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app-headless
spec:
  clusterIP: None

  selector:
    app: python-app

  ports:
    - name: http
      port: 5000
      targetPort: 5000
```

------------------------------------------------------------------------

# 143. Service With Session Affinity

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: sticky-app
spec:
  selector:
    app: python-app

  sessionAffinity: ClientIP

  ports:
    - port: 80
      targetPort: 5000
```

------------------------------------------------------------------------

# 144. Service With External Traffic Policy

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: python-app
spec:
  type: LoadBalancer

  externalTrafficPolicy: Local

  selector:
    app: python-app

  ports:
    - port: 80
      targetPort: 5000
```

Use this only when its traffic behavior matches your architecture.

------------------------------------------------------------------------

# 145. Service With Internal Traffic Policy

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: local-app
spec:
  internalTrafficPolicy: Local

  selector:
    app: local-app

  ports:
    - port: 8080
      targetPort: 8080
```

Traffic from a client Pod is restricted to node-local endpoints.

------------------------------------------------------------------------

# 146. Practical Lab 1 --- Create a Deployment

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3

  selector:
    matchLabels:
      app: nginx

  template:
    metadata:
      labels:
        app: nginx

    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80
```

Apply:

``` bash
kubectl apply -f deployment.yaml
```

------------------------------------------------------------------------

# 147. Practical Lab 2 --- Create ClusterIP Service

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx

  ports:
    - port: 80
      targetPort: 80
```

Apply:

``` bash
kubectl apply -f service.yaml
```

------------------------------------------------------------------------

# 148. Practical Lab 3 --- Verify

``` bash
kubectl get pods -o wide
kubectl get svc
kubectl get endpointslices
```

Check that the Service has endpoints corresponding to the Pods.

------------------------------------------------------------------------

# 149. Practical Lab 4 --- Test DNS

Create a temporary Pod:

``` bash
kubectl run curl-test \
  --image=curlimages/curl \
  --rm -it -- sh
```

Then:

``` bash
curl http://nginx-service
```

------------------------------------------------------------------------

# 150. Practical Lab 5 --- Test FQDN

Inside the test Pod:

``` bash
curl http://nginx-service.default.svc.cluster.local
```

------------------------------------------------------------------------

# 151. Practical Lab 6 --- Scale Deployment

``` bash
kubectl scale deployment nginx --replicas=5
```

Then:

``` bash
kubectl get pods
kubectl get endpointslices
```

Observe the backend endpoint set change.

------------------------------------------------------------------------

# 152. Practical Lab 7 --- Delete a Pod

``` bash
kubectl delete pod <nginx-pod>
```

Then:

``` bash
kubectl get pods
kubectl get endpointslices
```

Observe that the Deployment creates a replacement and the Service
updates its backend endpoints.

------------------------------------------------------------------------

# 153. Practical Lab 8 --- Test Selector Failure

Change the Service selector:

``` yaml
selector:
  app: wrong-label
```

Apply:

``` bash
kubectl apply -f service.yaml
```

Then:

``` bash
kubectl get endpointslices
```

Observe that the Service no longer selects the intended Pods.

Fix it afterward.

------------------------------------------------------------------------

# 154. Practical Lab 9 --- NodePort

Change:

``` yaml
type: NodePort
```

and optionally:

``` yaml
nodePort: 30080
```

Apply:

``` bash
kubectl apply -f service.yaml
```

Then:

``` bash
kubectl get svc
kubectl get nodes -o wide
```

Test:

``` text
<NodeIP>:30080
```

according to your environment's networking.

------------------------------------------------------------------------

# 155. Practical Lab 10 --- LoadBalancer

Change:

``` yaml
type: LoadBalancer
```

Apply:

``` bash
kubectl apply -f service.yaml
```

Then:

``` bash
kubectl get svc -w
```

Watch for:

``` text
EXTERNAL-IP
```

This may remain pending on local clusters.

------------------------------------------------------------------------

# 156. Practical Lab 11 --- Headless Service

Create:

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-headless
spec:
  clusterIP: None

  selector:
    app: nginx

  ports:
    - port: 80
      targetPort: 80
```

Then test DNS:

``` bash
nslookup nginx-headless
```

Observe the DNS behavior for a headless Service.

------------------------------------------------------------------------

# 157. Practical Lab 12 --- Named Ports

Deployment:

``` yaml
ports:
  - name: http
    containerPort: 80
```

Service:

``` yaml
ports:
  - name: http
    port: 8080
    targetPort: http
```

Now:

``` text
Client
  |
  v
Service:8080
  |
  v
Pod:80
```

------------------------------------------------------------------------

# 158. Practical Lab 13 --- Readiness and Service

Add a readiness probe:

``` yaml
readinessProbe:
  httpGet:
    path: /
    port: 80
  periodSeconds: 5
```

Then intentionally make the readiness probe fail.

Observe:

``` bash
kubectl get pods
kubectl get endpointslices
```

The Pod can remain running while being excluded from normal ready
traffic.

------------------------------------------------------------------------

# 159. Practical Lab 14 --- Multiple Services

Create:

``` text
frontend-service
backend-service
```

with:

``` text
frontend Pods
backend Pods
```

Then have the frontend call:

``` text
backend-service
```

This demonstrates Kubernetes service discovery.

------------------------------------------------------------------------

# 160. Practical Lab 15 --- Cross-Namespace Service Discovery

Create:

``` text
namespace-a
namespace-b
```

Create a Service in:

``` text
namespace-b
```

Then call it from a Pod in:

``` text
namespace-a
```

using:

``` text
service-name.namespace-b
```

or the FQDN.

------------------------------------------------------------------------

# 161. Practical Lab 16 --- Inspect Service Traffic

Use:

``` bash
kubectl get svc
kubectl describe svc <service>
kubectl get endpointslices
kubectl describe endpointslice <slice>
```

Then test:

``` bash
curl
```

from a Pod.

Map the complete path:

``` text
DNS
→ ClusterIP
→ EndpointSlice
→ Pod
```

------------------------------------------------------------------------

# 162. Practical Lab 17 --- Service + Deployment Rollout

Deploy:

``` text
v1
```

with:

``` text
app=python-app
```

Expose it with:

``` text
Service selector:
app=python-app
```

Update the Deployment to:

``` text
v2
```

Observe:

``` bash
kubectl rollout status deployment/python-app
kubectl get rs
kubectl get pods
kubectl get endpointslices
```

------------------------------------------------------------------------

# 163. Practical Lab 18 --- Blue-Green Service Switching

Create:

``` text
blue Pods:
app=python-app
version=blue

green Pods:
app=python-app
version=green
```

Service initially:

``` yaml
selector:
  app: python-app
  version: blue
```

Switch to:

``` yaml
selector:
  app: python-app
  version: green
```

Observe traffic switching.

------------------------------------------------------------------------

# 164. Service Troubleshooting Cheat Sheet

``` bash
# List Services
kubectl get svc

# Describe Service
kubectl describe svc <service>

# Service YAML
kubectl get svc <service> -o yaml

# Pods and labels
kubectl get pods --show-labels

# EndpointSlices
kubectl get endpointslices

# Service-specific EndpointSlices
kubectl get endpointslices \
  -l kubernetes.io/service-name=<service>

# Nodes
kubectl get nodes -o wide

# Pod details
kubectl describe pod <pod>

# Test DNS
nslookup <service>

# Test HTTP
curl http://<service>

# Network policies
kubectl get networkpolicy

# Events
kubectl get events --sort-by='.lastTimestamp'
```

------------------------------------------------------------------------

# 165. Service Troubleshooting Decision Tree

``` text
Cannot reach application
          |
          v
Does Service exist?
          |
       No -> create/fix Service
          |
         Yes
          |
          v
Does Service have endpoints?
          |
       No -> check selector
          |
          v
Are Pods Ready?
          |
       No -> check readiness
          |
         Yes
          |
          v
Is targetPort correct?
          |
       No -> fix targetPort
          |
         Yes
          |
          v
Can Pod be reached directly?
          |
       No -> application/network issue
          |
         Yes
          |
          v
Can Service DNS resolve?
          |
       No -> DNS/CoreDNS issue
          |
         Yes
          |
          v
Check NetworkPolicy / dataplane / node networking
```

------------------------------------------------------------------------

# 166. Common Mistake #1

Confusing:

``` text
port
```

with:

``` text
targetPort
```

Remember:

``` text
port
=
Service port

targetPort
=
Pod/application destination port
```

------------------------------------------------------------------------

# 167. Common Mistake #2

Service selector does not match Pod labels.

Service:

``` yaml
selector:
  app: web
```

Pod:

``` yaml
labels:
  app: api
```

No endpoint.

------------------------------------------------------------------------

# 168. Common Mistake #3

Assuming `containerPort` exposes the application.

It does not create a Service.

You need:

``` text
Service
```

for Service-based network access.

------------------------------------------------------------------------

# 169. Common Mistake #4

Using Pod IP directly.

Pod IPs are not stable.

Use:

``` text
Service DNS
```

for normal application-to-application communication.

------------------------------------------------------------------------

# 170. Common Mistake #5

Assuming ClusterIP Is Internet Accessible

ClusterIP is intended for cluster-internal access.

For external exposure, use an appropriate mechanism such as:

``` text
LoadBalancer
NodePort
Ingress
Gateway API
```

depending on requirements.

------------------------------------------------------------------------

# 171. Common Mistake #6

Assuming LoadBalancer Always Gets an External IP

Local clusters may not have a load-balancer implementation.

``` text
EXTERNAL-IP:
<pending>
```

can be normal in such environments.

------------------------------------------------------------------------

# 172. Common Mistake #7

Using NodePort Directly in Production Without Considering Architecture

NodePort can be useful, but production environments often use:

``` text
LoadBalancer
Ingress
Gateway API
```

for external HTTP/HTTPS traffic.

------------------------------------------------------------------------

# 173. Common Mistake #8

Ignoring Readiness

A Pod can be:

``` text
Running
```

but:

``` text
Not Ready
```

The Service should not normally send regular traffic to an unready
endpoint.

------------------------------------------------------------------------

# 174. Common Mistake #9

Overlapping Selectors

Example:

``` text
Service A:
app=web

Service B:
app=web
```

Both may select the same Pods.

Make selectors intentional.

------------------------------------------------------------------------

# 175. Common Mistake #10

Using Broad Labels

If multiple applications share:

``` text
app=backend
```

a Service can accidentally select workloads it should not.

Use sufficiently specific labels.

------------------------------------------------------------------------

# 176. Common Mistake #11

Wrong Namespace

Service:

``` text
default/backend
```

Client:

``` text
production
```

Use the correct DNS name:

``` text
backend.default.svc.cluster.local
```

------------------------------------------------------------------------

# 177. Common Mistake #12

Wrong Protocol

Application:

``` text
UDP
```

Service:

``` yaml
protocol: TCP
```

Traffic will fail.

Ensure protocol compatibility.

------------------------------------------------------------------------

# 178. Common Mistake #13

Ignoring NetworkPolicy

Service and endpoints may be completely correct while NetworkPolicy
blocks traffic.

------------------------------------------------------------------------

# 179. Common Mistake #14

Assuming Service Provides Application-Level Routing

A basic Service primarily provides L3/L4-style network exposure and load
distribution.

For:

``` text
/path
host
HTTP headers
advanced routing
```

use:

``` text
Ingress
Gateway API
service mesh
```

as appropriate.

------------------------------------------------------------------------

# 180. Common Mistake #15

Expecting Service to Provide Authentication

A Service does not authenticate users.

Use:

``` text
application authentication
TLS
identity systems
API gateways
```

as appropriate.

------------------------------------------------------------------------

# 181. Production Best Practices

1.  Use stable, intentional labels.
2.  Use Services instead of hardcoding Pod IPs.
3.  Define explicit Service ports.
4.  Use named ports where useful.
5.  Use readiness probes.
6.  Monitor EndpointSlices.
7.  Keep selectors specific.
8.  Use ClusterIP for internal services.
9.  Use LoadBalancer/Ingress/Gateway for external applications as
    appropriate.
10. Avoid unnecessary NodePort exposure.

------------------------------------------------------------------------

# 182. More Production Best Practices

11. Use NetworkPolicy to control access.
12. Use TLS for sensitive traffic.
13. Understand source-IP requirements.
14. Use `externalTrafficPolicy` deliberately.
15. Use `internalTrafficPolicy` only when appropriate.
16. Consider topology-aware routing for cross-zone workloads.
17. Avoid unnecessary session affinity.
18. Use headless Services for appropriate stateful/discovery use cases.
19. Monitor Service latency and errors.
20. Test failover and rolling deployments.

------------------------------------------------------------------------

# 183. Service Monitoring

Monitor:

``` text
request rate
error rate
latency
endpoint count
ready endpoints
DNS errors
connection failures
load balancer health
node health
```

A Service object can be healthy while the application behind it is
unhealthy.

------------------------------------------------------------------------

# 184. Service SLOs

For an API Service, monitor:

``` text
availability
p95 latency
p99 latency
5xx rate
connection errors
endpoint health
```

Service networking should support the application's SLOs.

------------------------------------------------------------------------

# 185. Service and Autoscaling

A Service does not autoscale Pods.

HPA changes:

``` text
replica count
```

Deployment/ReplicaSet manages:

``` text
Pods
```

Service provides:

``` text
stable networking
```

Architecture:

``` text
HPA
 |
 v
Deployment
 |
 v
ReplicaSet
 |
 v
Pods
 ^
 |
Service
```

------------------------------------------------------------------------

# 186. Service During Scaling

Before:

``` text
Service
 |
 +--> Pod A
 +--> Pod B
```

Scale to 4:

``` text
Service
 |
 +--> Pod A
 +--> Pod B
 +--> Pod C
 +--> Pod D
```

EndpointSlices update accordingly.

------------------------------------------------------------------------

# 187. Service During Pod Failure

``` text
Service
 |
 +--> Pod A
 +--> Pod B
 +--> Pod C
```

Pod B fails:

``` text
Service
 |
 +--> Pod A
 +--> Pod C
```

ReplicaSet creates replacement:

``` text
Service
 |
 +--> Pod A
 +--> Pod C
 +--> Pod D
```

------------------------------------------------------------------------

# 188. Service During Node Failure

Suppose:

``` text
Node A:
Pod A
Pod B

Node B:
Pod C
```

Node A fails.

Deployment/ReplicaSet may recreate Pods on another eligible node.

Service continues to use currently eligible endpoints.

The exact recovery time depends on node detection, scheduling, startup,
readiness, and application behavior.

------------------------------------------------------------------------

# 189. Service Availability

A Service itself is an abstraction, not the application.

High availability requires:

``` text
multiple replicas
multiple nodes
correct readiness
adequate resources
reliable networking
appropriate topology
```

------------------------------------------------------------------------

# 190. Service and Topology Spread

If all Pods are on one node:

``` text
Service
 |
 +--> Pod A
 +--> Pod B
 +--> Pod C
```

and that node fails, all replicas may disappear.

Use:

``` text
topologySpreadConstraints
```

or affinity strategies to distribute replicas.

------------------------------------------------------------------------

# 191. Service and Resources

Services do not reserve CPU/memory.

Resources belong to:

``` text
Pods/containers
```

Therefore:

``` text
Service
=
network

resources
=
container workload
```

------------------------------------------------------------------------

# 192. Service and PVC

A Service does not provide persistence.

``` text
Service
=
network access

PVC
=
persistent storage
```

A database may use both:

``` text
Service
+
StatefulSet
+
PVC
```

------------------------------------------------------------------------

# 193. Service and Secrets

A TLS-enabled application may use:

``` text
Secret
```

for credentials/certificates and:

``` text
Service
```

for network access.

They are complementary.

------------------------------------------------------------------------

# 194. Service Architecture Summary

``` text
                    Client
                       |
                       v
                Service DNS
                       |
                       v
                   ClusterIP
                       |
                       v
                Service Dataplane
                       |
              +--------+--------+
              |        |        |
              v        v        v
             Pod      Pod      Pod
              |        |        |
              +--------+--------+
                       |
                       v
                  Application
```

------------------------------------------------------------------------

# 195. External Architecture

``` text
                  Internet
                     |
                     v
             Load Balancer
                     |
                     v
                 Service
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Pod A      Pod B      Pod C
```

------------------------------------------------------------------------

# 196. Ingress Architecture

``` text
Internet
   |
   v
Ingress Controller
   |
   +------> Service A ---> Pods
   |
   +------> Service B ---> Pods
   |
   +------> Service C ---> Pods
```

------------------------------------------------------------------------

# 197. Service Types Cheat Sheet

``` text
ClusterIP
=
internal cluster access

NodePort
=
node IP + node port

LoadBalancer
=
external load balancer integration

ExternalName
=
DNS alias to external name

Headless
=
clusterIP: None
individual endpoint discovery
```

------------------------------------------------------------------------

# 198. Port Cheat Sheet

``` text
nodePort
   |
   v
Node

port
   |
   v
Service

targetPort
   |
   v
Pod/Application
```

Example:

``` text
Node:30080
   |
   v
Service:80
   |
   v
Pod:5000
```

------------------------------------------------------------------------

# 199. Service Discovery Cheat Sheet

Same namespace:

``` text
service-name
```

Other namespace:

``` text
service-name.namespace
```

FQDN:

``` text
service-name.namespace.svc.cluster.local
```

Cluster domain may differ from `cluster.local`.

------------------------------------------------------------------------

# 200. Service Debugging Cheat Sheet

``` text
Service unreachable?
       |
       +--> Does Service exist?
       |
       +--> Selector correct?
       |
       +--> Pods have matching labels?
       |
       +--> EndpointSlices populated?
       |
       +--> Pods Ready?
       |
       +--> targetPort correct?
       |
       +--> App listening?
       |
       +--> DNS works?
       |
       +--> NetworkPolicy?
       |
       +--> kube-proxy/CNI/dataplane?
       |
       +--> Firewall/load balancer?
```

------------------------------------------------------------------------

# 201. Interview Question --- What Is a Kubernetes Service?

Answer:

> A Kubernetes Service is an abstraction that provides a stable network
> endpoint for a group of Pods and routes traffic to eligible backend
> endpoints selected through labels.

------------------------------------------------------------------------

# 202. Interview Question --- Why Do We Need Services?

Answer:

> Pods are ephemeral and their IP addresses can change. A Service
> provides a stable virtual IP and DNS name so clients can communicate
> with the application without tracking individual Pod IPs.

------------------------------------------------------------------------

# 203. Interview Question --- What Is ClusterIP?

Answer:

> ClusterIP is the default Service type and provides a virtual IP
> accessible within the cluster.

------------------------------------------------------------------------

# 204. Interview Question --- What Is NodePort?

Answer:

> NodePort exposes a Service through a port on each node, allowing
> clients that can reach the nodes to access the Service through the
> node IP and NodePort.

------------------------------------------------------------------------

# 205. Interview Question --- What Is LoadBalancer?

Answer:

> LoadBalancer exposes a Service through an external load-balancing
> mechanism, commonly integrated with a cloud provider or another
> load-balancer implementation.

------------------------------------------------------------------------

# 206. Interview Question --- What Is ExternalName?

Answer:

> ExternalName makes a Kubernetes Service name resolve to an external
> DNS name. It does not create normal Pod endpoints.

------------------------------------------------------------------------

# 207. Interview Question --- What Is a Headless Service?

Answer:

> A headless Service is a Service with `clusterIP: None`. It does not
> provide a normal virtual ClusterIP and is commonly used for direct
> endpoint discovery, especially with StatefulSets.

------------------------------------------------------------------------

# 208. Interview Question --- What Is `port`?

Answer:

> `port` is the port exposed by the Service.

------------------------------------------------------------------------

# 209. Interview Question --- What Is `targetPort`?

Answer:

> `targetPort` specifies the destination port on the backend endpoint,
> typically the application container port.

------------------------------------------------------------------------

# 210. Interview Question --- What Is `nodePort`?

Answer:

> `nodePort` is the port exposed on each node for a NodePort Service.

------------------------------------------------------------------------

# 211. Interview Question --- What Is a Service Selector?

Answer:

> A Service selector identifies backend Pods by matching their labels.

------------------------------------------------------------------------

# 212. Interview Question --- What Happens If Selector Is Wrong?

Answer:

> The Service may have no matching endpoints, so client requests cannot
> reach the intended Pods.

------------------------------------------------------------------------

# 213. Interview Question --- Does Service Create Pods?

Answer:

> No. Deployments, StatefulSets, Jobs, and other workload controllers
> create Pods. A Service only provides networking to selected endpoints.

------------------------------------------------------------------------

# 214. Interview Question --- Does `containerPort` Expose a Pod?

Answer:

> No. `containerPort` declares a container port in the Pod
> specification. It does not itself create a Service or external network
> access.

------------------------------------------------------------------------

# 215. Interview Question --- What Is EndpointSlice?

Answer:

> EndpointSlice is a Kubernetes API resource that represents network
> endpoints associated with a Service. It provides a scalable way to
> track backend endpoints.

------------------------------------------------------------------------

# 216. Interview Question --- What Is kube-proxy?

Answer:

> kube-proxy is a Kubernetes node component traditionally responsible
> for implementing Service networking rules, using mechanisms such as
> iptables or IPVS depending on configuration. Some modern networking
> implementations provide alternative Service dataplanes.

------------------------------------------------------------------------

# 217. Interview Question --- How Does Service DNS Work?

Answer:

> Kubernetes cluster DNS, commonly CoreDNS, provides DNS records for
> Services. Applications can use the Service DNS name instead of
> directly using the virtual IP.

------------------------------------------------------------------------

# 218. Interview Question --- What Is the FQDN of a Service?

Typical form:

``` text
service.namespace.svc.cluster.local
```

where the cluster domain may differ from `cluster.local`.

------------------------------------------------------------------------

# 219. Interview Question --- ClusterIP vs NodePort?

``` text
ClusterIP:
internal access

NodePort:
node-level access
```

NodePort can also have a ClusterIP as part of the Service abstraction.

------------------------------------------------------------------------

# 220. Interview Question --- NodePort vs LoadBalancer?

``` text
NodePort:
node IP + port

LoadBalancer:
external load-balancer integration
```

A LoadBalancer Service commonly builds on lower-level Service
mechanisms.

------------------------------------------------------------------------

# 221. Interview Question --- Service vs Ingress?

``` text
Service:
connects clients to backend Pods

Ingress:
HTTP/HTTPS routing to Services
```

------------------------------------------------------------------------

# 222. Interview Question --- Can Service Route HTTP Paths?

A basic Service does not provide application-level path routing such as:

``` text
/api
/web
/admin
```

Use:

``` text
Ingress
Gateway API
service mesh
```

for advanced HTTP routing.

------------------------------------------------------------------------

# 223. Interview Question --- What Is Session Affinity?

Answer:

> Session affinity controls whether a Service attempts to keep traffic
> from a client associated with the same backend endpoint. Kubernetes
> supports ClientIP session affinity.

------------------------------------------------------------------------

# 224. Interview Question --- What Is `externalTrafficPolicy`?

Answer:

> It controls how external traffic to NodePort/LoadBalancer Services is
> routed. `Cluster` can route to endpoints on other nodes, while `Local`
> restricts external traffic to node-local endpoints.

------------------------------------------------------------------------

# 225. Interview Question --- Why Use `externalTrafficPolicy: Local`?

Potential reasons include:

``` text
source IP preservation
avoid cross-node hops
node-local traffic handling
```

But it can create uneven traffic distribution.

------------------------------------------------------------------------

# 226. Interview Question --- What Is `internalTrafficPolicy`?

Answer:

> It controls whether internal Service traffic can use endpoints on
> other nodes. With `Local`, traffic is restricted to node-local
> endpoints.

------------------------------------------------------------------------

# 227. Interview Question --- Why Is My Service Not Working?

Check:

``` text
Service
selector
Pod labels
EndpointSlices
readiness
targetPort
application port
DNS
NetworkPolicy
network dataplane
firewall
load balancer
```

------------------------------------------------------------------------

# 228. Scenario --- Service Has No Endpoints

Service:

``` yaml
selector:
  app: python-app
```

Pods:

``` yaml
labels:
  app: python
```

Answer:

> The Service selector does not match the Pod labels. Correct the
> selector or labels.

------------------------------------------------------------------------

# 229. Scenario --- Endpoint Exists but Connection Refused

Possible causes:

``` text
wrong targetPort
application not listening
wrong protocol
container process crashed
NetworkPolicy
node networking
```

Test the Pod directly.

------------------------------------------------------------------------

# 230. Scenario --- Pod Is Running but Service Does Not Send Traffic

Check:

``` text
readinessProbe
```

The Pod can be Running while not Ready.

Inspect:

``` bash
kubectl get pod
kubectl describe pod <pod>
```

and EndpointSlices.

------------------------------------------------------------------------

# 231. Scenario --- DNS Name Does Not Resolve

Check:

``` bash
nslookup <service>
```

Then inspect:

``` text
CoreDNS
Pod DNS configuration
Service name
namespace
cluster DNS
NetworkPolicy
```

------------------------------------------------------------------------

# 232. Scenario --- Service Selects Too Many Pods

Possible cause:

``` text
selector too broad
```

Example:

``` yaml
selector:
  app: backend
```

Multiple applications may use:

``` text
app=backend
```

Use more specific labels.

------------------------------------------------------------------------

# 233. Scenario --- External IP Is Pending

For:

``` text
type: LoadBalancer
```

check:

``` bash
kubectl describe svc <service>
```

Then investigate:

``` text
cloud provider integration
load balancer controller
permissions
subnets
network configuration
```

------------------------------------------------------------------------

# 234. Scenario --- NodePort Is Unreachable

Check:

``` text
Node IP
NodePort
firewall
security group
routing
kube-proxy/dataplane
externalTrafficPolicy
```

First confirm that the Service works internally.

------------------------------------------------------------------------

# 235. Scenario --- Need Direct Pod Discovery

Use:

``` text
Headless Service
```

especially for:

``` text
StatefulSet
database
distributed system
```

------------------------------------------------------------------------

# 236. Scenario --- Need HTTP Path Routing

Use:

``` text
Ingress
```

or:

``` text
Gateway API
```

rather than creating many NodePorts.

------------------------------------------------------------------------

# 237. Scenario --- Need Internal Application Access Only

Use:

``` yaml
type: ClusterIP
```

This is the default and usually the simplest option.

------------------------------------------------------------------------

# 238. Scenario --- Need Public Application Access

Possible architecture:

``` text
Internet
   |
   v
LoadBalancer
   |
   v
Ingress/Gateway
   |
   v
Service
   |
   v
Pods
```

The exact architecture depends on your platform.

------------------------------------------------------------------------

# 239. Scenario --- Need Source Client IP

Investigate:

``` yaml
externalTrafficPolicy: Local
```

for applicable external Service traffic paths.

Verify the behavior with your actual load-balancer/network setup.

------------------------------------------------------------------------

# 240. Scenario --- Need Same-Node Traffic

Consider:

``` yaml
internalTrafficPolicy: Local
```

if your application specifically benefits from node-local endpoint
selection.

------------------------------------------------------------------------

# 241. Scenario --- Need Stateful Database Networking

Common architecture:

``` text
StatefulSet
+
Headless Service
+
PVC
```

Each component solves a different problem:

``` text
StatefulSet
=
stable workload identity

Headless Service
=
network identity/discovery

PVC
=
persistent storage
```

------------------------------------------------------------------------

# 242. Scenario --- Need Stateless API

Common architecture:

``` text
Deployment
+
ClusterIP Service
+
Ingress/LoadBalancer
```

------------------------------------------------------------------------

# 243. Scenario --- Need Internal Microservice Communication

Example:

``` text
frontend
   |
   | http://backend:8080
   v
backend Service
   |
   v
backend Pods
```

No hardcoded Pod IPs.

------------------------------------------------------------------------

# 244. Scenario --- Need Multiple Versions

Use labels:

``` text
app=python-app
version=v1
```

and:

``` text
app=python-app
version=v2
```

Then select:

``` text
v1
```

or:

``` text
v2
```

with a Service selector for blue-green style switching.

------------------------------------------------------------------------

# 245. Scenario --- Need Percentage-Based Canary

A basic Service selector is not designed for precise percentage
splitting.

Consider:

``` text
Ingress/controller
Gateway API
service mesh
```

depending on the required capabilities.

------------------------------------------------------------------------

# 246. Service Security Checklist

``` text
[ ] Service type is intentional
[ ] Selector is specific
[ ] Only required ports are exposed
[ ] NetworkPolicy is configured where appropriate
[ ] TLS is used for sensitive traffic
[ ] Public exposure is intentional
[ ] Load balancer/firewall is configured
[ ] Source-IP requirements are understood
[ ] DNS is functioning
[ ] Readiness probes are configured
[ ] Endpoint health is monitored
```

------------------------------------------------------------------------

# 247. Production Service Checklist

``` text
[ ] Correct labels
[ ] Correct selector
[ ] Correct port
[ ] Correct targetPort
[ ] Correct protocol
[ ] Correct Service type
[ ] Readiness probe
[ ] EndpointSlice health
[ ] DNS resolution
[ ] NetworkPolicy
[ ] External traffic policy
[ ] Internal traffic policy
[ ] Topology requirements
[ ] Monitoring
[ ] Disaster/failure testing
```

------------------------------------------------------------------------

# 248. Final Mental Model

``` text
                    SERVICE
                       |
          +------------+------------+
          |                         |
       Stable                    Selector
      Endpoint                     |
          |                         v
          |                  Matching Pod Labels
          |                         |
          v                         v
     DNS / ClusterIP          EndpointSlices
          |                         |
          +------------+------------+
                       |
                       v
                    Pods
                       |
                       v
                 Application
```

------------------------------------------------------------------------

# 249. The One Mental Model to Remember

``` text
Deployment
    |
    v
ReplicaSet
    |
    v
Pods
    |
    | labels
    v
Service
    |
    +--> stable DNS
    +--> stable virtual IP
    +--> stable Service port
    |
    v
EndpointSlices
    |
    +--> Pod A
    +--> Pod B
    +--> Pod C
```

Remember:

> **Deployment creates and manages Pods. Service discovers and provides
> network access to those Pods.**

------------------------------------------------------------------------

# 250. Final Interview-Ready Explanation

> A Kubernetes Service provides a stable network abstraction for a set
> of Pods. Because Pods are ephemeral and their IP addresses can change,
> applications should normally communicate through a Service rather than
> directly through Pod IPs. A Service uses label selectors to identify
> backend Pods, and Kubernetes maintains endpoint information through
> EndpointSlices. The default ClusterIP type provides internal cluster
> access, NodePort exposes a port on nodes, LoadBalancer integrates with
> an external load-balancing mechanism, ExternalName provides DNS-based
> mapping to an external name, and a headless Service
> (`clusterIP: None`) supports direct endpoint discovery. Service ports
> define the client-facing Service port, while targetPort identifies the
> backend port. Kubernetes DNS, commonly CoreDNS, provides Service name
> resolution. Readiness, NetworkPolicy, traffic policies, topology, and
> the underlying Service dataplane all influence real-world traffic
> behavior.

------------------------------------------------------------------------

# 251. Final Command Cheat Sheet

``` bash
# List Services
kubectl get svc

# List Services across namespaces
kubectl get svc -A

# Describe Service
kubectl describe svc <service>

# Service YAML
kubectl get svc <service> -o yaml

# Create ClusterIP Service
kubectl expose deployment <deployment> \
  --name=<service> \
  --port=80 \
  --target-port=5000

# Create NodePort
kubectl expose deployment <deployment> \
  --type=NodePort \
  --port=80 \
  --target-port=5000

# Get Pods with labels
kubectl get pods --show-labels

# Get Pods with a selector
kubectl get pods -l app=python-app

# Get EndpointSlices
kubectl get endpointslices

# Get EndpointSlices for a Service
kubectl get endpointslices \
  -l kubernetes.io/service-name=<service>

# Describe EndpointSlice
kubectl describe endpointslice <slice>

# Get node IPs
kubectl get nodes -o wide

# Test DNS from a temporary Pod
kubectl run dns-test \
  --image=busybox:1.36 \
  --rm -it -- nslookup <service>

# Test HTTP from a temporary Pod
kubectl run curl-test \
  --image=curlimages/curl \
  --rm -it -- curl http://<service>

# Check NetworkPolicies
kubectl get networkpolicy

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

------------------------------------------------------------------------

# 252. Final Service Cheat Sheet

``` text
Service
=
stable network abstraction

ClusterIP
=
internal access

NodePort
=
NodeIP:NodePort

LoadBalancer
=
external load balancer

ExternalName
=
DNS mapping to external name

Headless
=
clusterIP: None

selector
=
which Pods?

port
=
Service port

targetPort
=
backend port

nodePort
=
node-level port

EndpointSlice
=
backend endpoint information

CoreDNS
=
Service DNS

Readiness
=
should endpoint receive traffic?

NetworkPolicy
=
can traffic be allowed?

Ingress/Gateway
=
advanced HTTP/traffic routing
```

------------------------------------------------------------------------

# 253. Final Architecture

``` text
                         INTERNET
                            |
                            v
                  LoadBalancer / Ingress
                            |
                            v
                     Kubernetes Service
                            |
                    +-------+-------+
                    |               |
                    v               v
               ClusterIP        EndpointSlices
                                    |
                         +----------+----------+
                         |          |          |
                         v          v          v
                       Pod A      Pod B      Pod C
                         |          |          |
                         +----------+----------+
                                    |
                                    v
                              Application
```

And the complete Kubernetes application stack is:

``` text
                    Client
                      |
                      v
             Ingress / Gateway
                      |
                      v
                  Service
                      |
                      v
                   Pods
                      |
             +--------+--------+
             |        |        |
             v        v        v
           Config   Secret   Resources
             |        |        |
             +--------+--------+
                      |
                      v
                Application
                      |
                      v
                     PVC
```

> **Core concept: Service = stable network endpoint + Pod selection +
> traffic delivery.**
