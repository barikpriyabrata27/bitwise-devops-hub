# Kubernetes Fundamentals

> Kubernetes (K8s) is an open-source container orchestration platform for running, scaling, networking, securing, and operating containerized workloads using declarative configuration and continuous reconciliation.

---

## 1. What Is Kubernetes?

Kubernetes is a platform for managing containerized applications across a cluster of machines.

Instead of manually managing individual containers:

```text
Container 1
Container 2
Container 3
Container 4
```

you define the desired state:

```text
Run 3 instances
Expose them through a Service
Use this container image
Provide these resources
Restart failed workloads
Perform rolling updates
```

Kubernetes continuously works to make the actual state match the desired state.

---

## 2. Why Kubernetes Exists

Production container environments introduce problems such as:

- Application scaling
- High availability
- Container failures
- Node failures
- Service discovery
- Load balancing
- Networking
- Storage
- Configuration
- Secrets
- Rolling deployments
- Rollback
- Resource management
- Security
- Monitoring

Kubernetes provides abstractions and control loops to manage these concerns consistently.

---

## 3. The Kubernetes Mental Model

The most important Kubernetes concept is:

```text
Desired State
      |
      v
Kubernetes API
      |
      v
Controllers
      |
      v
Actual State
      |
      v
Continuous Reconciliation
```

You describe what you want. Kubernetes continuously works toward that state.

---

## 4. Desired State vs Current State

Suppose a Deployment specifies:

```yaml
replicas: 3
```

Desired state:

```text
3 Pods
```

Current state:

```text
Pod 1 -> Running
Pod 2 -> Running
Pod 3 -> Failed
```

Kubernetes detects:

```text
Desired = 3
Current = 2
```

and the appropriate controller creates a replacement.

Eventually:

```text
Desired = 3
Current = 3
```

---

## 5. Reconciliation

Kubernetes follows a control-loop model:

```text
             Desired State
                  |
                  v
           Kubernetes API
                  |
                  v
              Controller
                  |
                  v
        Compare Desired/Actual
             /          \
            /            \
        Same             Different
          |                  |
          v                  v
       Nothing          Take Action
                             |
                             v
                       Actual State
                             |
                             +-------> Observe Again
```

This reconciliation model is fundamental to Kubernetes.

---

## 6. Declarative Configuration

Kubernetes is primarily declarative.

Declarative means:

```text
Describe WHAT you want
```

rather than manually specifying every operation:

```text
Create container
Start container
Restart container
Move container
Replace container
```

For example:

```yaml
spec:
  replicas: 3
```

means:

```text
I want three replicas.
```

Kubernetes determines how to achieve that state.

---

## 7. Imperative vs Declarative

### Imperative

You directly request an operation:

```bash
kubectl create deployment nginx --image=nginx
```

### Declarative

You define the desired resource:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx

spec:
  replicas: 3
```

Then:

```bash
kubectl apply -f deployment.yaml
```

Declarative configuration is especially useful for:

- Version control
- GitOps
- CI/CD
- Repeatability
- Auditability
- Environment management

---

# 8. Kubernetes Cluster

A Kubernetes cluster consists primarily of:

```text
Kubernetes Cluster
|
+-- Control Plane
|
+-- Worker Nodes
```

Architecture:

```text
                    Kubernetes Cluster
                           |
              +------------+------------+
              |                         |
              v                         v
        Control Plane              Worker Nodes
              |                         |
              |                    +----+----+
              |                    |    |    |
              |                    v    v    v
              |                   Pod  Pod  Pod
              |
              v
         Cluster State
```

---

# 9. Control Plane

The control plane manages the overall state of the cluster.

Major components include:

```text
kube-apiserver
etcd
kube-scheduler
kube-controller-manager
cloud-controller-manager (when used)
```

---

# 10. Worker Node

Worker nodes run application workloads.

Important components include:

```text
kubelet
Container Runtime
kube-proxy (where used)
```

Worker nodes host Pods.

---

# 11. Kubernetes Architecture

```text
                         Kubernetes
                            Cluster
                               |
              +----------------+----------------+
              |                                 |
              v                                 v
        CONTROL PLANE                      WORKER NODES
              |                                 |
      +-------+--------+                 +------+------+
      |       |        |                 |      |      |
      v       v        v                 v      v      v
 API Server  etcd  Scheduler          kubelet Runtime kube-proxy
                  |
                  v
              Controllers
```

---

# 12. Kubernetes API

The Kubernetes API is the central interface for interacting with the cluster.

Clients and components communicate through the API server.

```text
kubectl
   |
   v
API Server
   |
   +-- Pods
   +-- Deployments
   +-- Services
   +-- ConfigMaps
   +-- Secrets
   +-- Nodes
   +-- Namespaces
   +-- Other Resources
```

The API is resource-oriented and exposed through HTTP/REST-style interfaces.

---

# 13. kube-apiserver

The API server is the central control-plane component.

It is responsible for tasks including:

- Receiving API requests
- Authentication
- Authorization
- Admission processing
- Object validation
- API exposure
- Persisting cluster state through the configured storage layer

Conceptually:

```text
User / kubectl / Controller
            |
            v
       kube-apiserver
            |
            v
           etcd
```

---

# 14. etcd

`etcd` is the consistent key-value store used to persist Kubernetes cluster state.

Conceptually:

```text
API Server
    |
    v
  etcd
    |
    +-- Cluster State
    +-- Resource Metadata
    +-- Configuration
    +-- Object State
```

Protecting etcd is critical because loss or corruption of control-plane state can affect cluster recovery.

Production environments should have:

- Secure etcd access
- Encryption where appropriate
- Regular backups
- Tested restore procedures
- Restricted administrative access

---

# 15. kube-scheduler

The scheduler determines which node should run a Pod that has not yet been assigned to a node.

Conceptually:

```text
Unscheduled Pod
      |
      v
Scheduler
      |
      +-- CPU / Memory
      +-- Node Labels
      +-- Affinity
      +-- Anti-Affinity
      +-- Taints
      +-- Tolerations
      +-- Topology
      +-- Scheduling Rules
      |
      v
Selected Node
```

The scheduler does not itself run containers. It assigns Pods to nodes.

---

# 16. kube-controller-manager

The controller manager runs Kubernetes control loops.

Controllers watch resources and work toward desired state.

Examples include controllers associated with:

- Deployments
- ReplicaSets
- Nodes
- Jobs
- Namespaces
- Services and endpoint-related resources

A simplified controller loop is:

```text
Watch
 |
 v
Observe State
 |
 v
Compare Desired vs Actual
 |
 v
Take Action
 |
 +----> Watch Again
```

---

# 17. Cloud Controller Manager

The cloud controller manager integrates Kubernetes with cloud-provider functionality.

Depending on the environment, cloud integrations can support things such as:

- Cloud load balancers
- Node metadata
- Cloud routes
- Cloud storage integration

The exact behavior depends on the cloud provider and Kubernetes architecture.

---

# 18. Container Runtime

Kubernetes needs a container runtime on worker nodes.

The runtime is responsible for starting and managing containers.

Kubernetes communicates with runtimes through the Container Runtime Interface (CRI).

Common runtimes include:

```text
containerd
CRI-O
```

---

# 19. kubelet

The kubelet runs on each worker node.

Its primary responsibility is to make sure Pods assigned to that node are running and healthy according to their specifications.

Conceptually:

```text
API Server
    |
    v
Pod Specification
    |
    v
kubelet
    |
    v
Container Runtime
    |
    v
Containers
```

---

# 20. kube-proxy

`kube-proxy` traditionally implements network rules associated with Kubernetes Services.

However, modern Kubernetes networking implementations can replace or bypass kube-proxy functionality.

Therefore:

```text
Kubernetes Service Networking
```

does not necessarily mean:

```text
kube-proxy
```

in every cluster.

---

# 21. Kubernetes Objects

Kubernetes represents resources as API objects.

Common objects include:

```text
Pod
Deployment
ReplicaSet
Service
ConfigMap
Secret
Namespace
StatefulSet
DaemonSet
Job
CronJob
PersistentVolume
PersistentVolumeClaim
StorageClass
Ingress
```

An object generally describes desired state and metadata.

---

# 22. Kubernetes Manifest Structure

A common manifest structure is:

```yaml
apiVersion:
kind:
metadata:
spec:
```

Example:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: payment-api

spec:
  replicas: 3
```

Many resources also expose:

```text
status
```

which represents observed/current state.

---

# 23. apiVersion

`apiVersion` identifies the API group and version.

Examples:

```text
v1
apps/v1
batch/v1
networking.k8s.io/v1
```

The valid version depends on the resource.

---

# 24. kind

`kind` specifies the type of object.

Examples:

```yaml
kind: Pod
```

```yaml
kind: Deployment
```

```yaml
kind: Service
```

---

# 25. metadata

Metadata identifies and organizes the object.

Example:

```yaml
metadata:
  name: payment-api
  namespace: production
  labels:
    app: payment-api
    team: payments
```

---

# 26. spec

`spec` describes the desired state.

Example:

```yaml
spec:
  replicas: 3
```

The fields under `spec` depend on the resource.

---

# 27. status

`status` represents observed state.

Conceptually:

```text
spec
 |
 +-- Desired State

status
 |
 +-- Observed State
```

Controllers use this information to determine whether corrective action is required.

---

# 28. Labels

Labels are key-value pairs used to identify and select Kubernetes objects.

Example:

```yaml
labels:
  app: payment-api
  environment: production
```

Labels are widely used for:

- Service selectors
- Workload selectors
- Organization
- Scheduling
- Queries
- Automation

---

# 29. Selectors

Selectors identify resources based on labels.

Example:

```yaml
selector:
  matchLabels:
    app: payment-api
```

This selects resources with:

```text
app=payment-api
```

Labels and selectors form a major relationship mechanism in Kubernetes.

---

# 30. Labels and Services

Example Pod label:

```yaml
metadata:
  labels:
    app: payment-api
```

Service selector:

```yaml
selector:
  app: payment-api
```

Relationship:

```text
             Service
                |
         selector app=payment-api
                |
        +-------+-------+
        |       |       |
        v       v       v
      Pod 1   Pod 2   Pod 3
        app=payment-api
```

---

# 31. Annotations

Annotations store metadata that is not primarily intended for selection.

Example:

```yaml
metadata:
  annotations:
    example.com/description: "Payment API"
```

Annotations are often used by:

- Ingress controllers
- Monitoring systems
- Cloud integrations
- Deployment tools
- Operators
- Platform automation

---

# 32. Namespace

Namespaces provide logical separation within a cluster.

Example:

```text
Cluster
|
+-- development
+-- staging
+-- production
```

Namespaces are useful for:

- Organization
- Access control
- Resource quotas
- Network policy scope
- Environment separation

Namespaces are logical boundaries, not complete security boundaries by themselves.

---

# 33. Pod

A Pod is Kubernetes' smallest deployable compute object.

Most application Pods contain one main application container, but a Pod can contain multiple tightly coupled containers.

Example:

```text
Pod
|
+-- Application Container
|
+-- Sidecar Container
```

Containers in the same Pod share important resources and have a common lifecycle.

---

# 34. Pod Networking

Containers in the same Pod share a network namespace.

Therefore they share:

```text
Pod IP
Network interfaces
localhost
```

For example:

```text
Container A
  |
  +-- localhost:8080
  |
Container B
  |
  +-- localhost:9090
```

Container A can reach Container B using localhost and the appropriate port.

---

# 35. Pod Storage

Containers in the same Pod can mount and share volumes.

```text
Pod
|
+-- App Container
|
+-- Sidecar
|
+-- Shared Volume
```

This is useful for patterns such as:

- Log sidecars
- File processing
- Proxies
- Agents
- Shared temporary data

---

# 36. Pod Lifecycle

A simplified Pod lifecycle is:

```text
Pending
   |
   v
Running
   |
   +----> Succeeded
   |
   +----> Failed
```

Pods can also be deleted and recreated by higher-level controllers.

---

# 37. Pods Are Ephemeral

A Pod should generally be treated as replaceable.

A Pod can be:

```text
Deleted
Recreated
Rescheduled
Replaced
```

A Pod IP can change.

Therefore applications should normally communicate through stable Services rather than directly relying on Pod IPs.

---

# 38. Deployment

A Deployment manages application Pods through ReplicaSets.

Architecture:

```text
Deployment
     |
     v
ReplicaSet
     |
     +-- Pod
     +-- Pod
     +-- Pod
```

Deployments are commonly used for stateless workloads.

They support concepts such as:

- Replicas
- Rolling updates
- Rollback
- Revision history
- Declarative updates

---

# 39. ReplicaSet

A ReplicaSet maintains a desired number of matching Pods.

Example:

```yaml
spec:
  replicas: 3
```

The ReplicaSet works to maintain three matching Pods.

Normally, Deployments manage ReplicaSets for you.

---

# 40. Service

A Service provides a stable networking abstraction for a group of Pods.

Conceptually:

```text
Service
   |
   +-- Pod 1
   +-- Pod 2
   +-- Pod 3
```

Pods can be replaced while the Service remains the stable application endpoint.

---

# 41. Service Discovery

Kubernetes provides DNS-based service discovery.

For example, a Service named:

```text
payment-api
```

in namespace:

```text
production
```

can be addressed through a DNS name such as:

```text
payment-api.production.svc.cluster.local
```

Within an appropriate namespace context, applications often use the shorter name:

```text
payment-api
```

---

# 42. ConfigMap

ConfigMaps provide non-sensitive configuration data.

Example:

```yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: payment-config

data:
  LOG_LEVEL: info
  FEATURE_ENABLED: "true"
```

Applications can consume ConfigMaps as:

- Environment variables
- Files
- Command arguments

Do not store passwords or other sensitive material in ConfigMaps.

---

# 43. Secret

Secrets are intended for sensitive configuration such as:

```text
Passwords
Tokens
Credentials
Certificates
Keys
```

Example:

```yaml
apiVersion: v1
kind: Secret

metadata:
  name: payment-secret

type: Opaque

stringData:
  username: payment-user
  password: change-me
```

Important:

> Kubernetes Secrets are not automatically a complete enterprise secret-management solution. Production environments should consider encryption at rest, RBAC, external secret managers, rotation, audit, and access policies.

---

# 44. Volume

A Volume provides storage to containers in a Pod.

Depending on the volume type, its lifecycle and durability can differ.

Conceptually:

```text
Pod
 |
 +-- Container
 |
 +-- Volume
```

Volume types can support:

- Temporary data
- Node-local data
- Network-backed data
- Cloud storage
- Persistent application data

---

# 45. PersistentVolume

A PersistentVolume (PV) represents storage available to the cluster.

Conceptually:

```text
Storage Backend
       |
       v
PersistentVolume
```

The PV can be statically created or dynamically provisioned depending on the storage configuration.

---

# 46. PersistentVolumeClaim

A PersistentVolumeClaim (PVC) is an application's request for storage.

Relationship:

```text
Pod
 |
 v
PVC
 |
 v
PV
 |
 v
Storage Backend
```

This separates the application's storage request from the underlying storage resource.

---

# 47. StorageClass

A StorageClass describes a class of storage and can enable dynamic provisioning.

Conceptually:

```text
PVC
 |
 v
StorageClass
 |
 v
Provisioner
 |
 v
PersistentVolume
 |
 v
Storage Backend
```

---

# 48. CSI

CSI means:

```text
Container Storage Interface
```

CSI provides a standard integration model for storage systems.

It allows storage providers to integrate with Kubernetes.

---

# 49. StatefulSet

StatefulSets are designed for workloads requiring stable identity and/or persistent storage semantics.

Examples can include:

- Databases
- Distributed systems
- Message brokers
- Clustered applications

Example identities:

```text
db-0
db-1
db-2
```

StatefulSets do not automatically make an application database highly available; the application itself must support the required replication and failover behavior.

---

# 50. DaemonSet

A DaemonSet ensures a Pod runs on each eligible node, subject to scheduling rules.

Typical use cases:

```text
Logging Agent
Monitoring Agent
Security Agent
Node Agent
```

Architecture:

```text
DaemonSet
|
+-- Node 1 -> Agent
+-- Node 2 -> Agent
+-- Node 3 -> Agent
```

---

# 51. Job

A Job represents a task that should run to completion.

Examples:

```text
Database Migration
Batch Processing
Data Import
One-Time Processing
```

Architecture:

```text
Job
 |
 v
Pod
 |
 v
Process
 |
 v
Complete
```

---

# 52. CronJob

A CronJob creates Jobs according to a schedule.

Example:

```text
CronJob
   |
   +-- Schedule: 02:00 daily
             |
             v
            Job
             |
             v
            Pod
```

Common uses include:

- Backups
- Cleanup
- Reports
- Scheduled processing

---

# 53. Probes

Kubernetes supports three important probe types:

```text
Startup Probe
Liveness Probe
Readiness Probe
```

They answer different questions.

---

# 54. Liveness Probe

Liveness asks:

```text
Is the container/application alive?
```

A failed liveness probe can cause Kubernetes to restart the container according to the configured behavior.

Use liveness to detect conditions where restarting the application is an appropriate recovery action.

---

# 55. Readiness Probe

Readiness asks:

```text
Can this application receive traffic?
```

If a Pod is not ready, Kubernetes can remove it from eligible Service endpoints.

Important:

```text
Running != Ready
```

A process can be running while the application is not ready to serve requests.

---

# 56. Startup Probe

Startup probes are useful for applications that take a long time to initialize.

They provide startup-specific protection so that slow initialization does not immediately trigger liveness behavior.

---

# 57. Example Probes

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
```

Probe values must be tuned to the application's real startup and recovery characteristics.

---

# 58. Resource Requests

A resource request represents the amount of resource Kubernetes should consider when scheduling a Pod.

Example:

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
```

Requests help the scheduler determine whether a node has sufficient allocatable capacity.

---

# 59. Resource Limits

Limits define maximum resource consumption for supported resources.

Example:

```yaml
resources:
  limits:
    cpu: "1"
    memory: "512Mi"
```

For memory, exceeding the container's effective memory limit can result in an OOM kill.

---

# 60. Requests vs Limits

Think:

```text
Request
 |
 +-- Scheduling / capacity requirement

Limit
 |
 +-- Maximum allowed resource consumption
```

They serve different purposes.

---

# 61. Ingress

Ingress provides HTTP/HTTPS routing into Services.

Conceptually:

```text
Internet
   |
   v
Ingress
   |
   +-- /payments -> payment-service
   +-- /orders   -> order-service
   +-- /users    -> user-service
```

An Ingress resource requires an Ingress Controller to actually implement the traffic handling.

---

# 62. Gateway API

The Kubernetes Gateway API is a modern, extensible networking API for expressing traffic routing.

Conceptually:

```text
Client
  |
  v
Gateway
  |
  v
HTTPRoute / Other Routes
  |
  v
Service
  |
  v
Pods
```

Ingress remains widely used, but Gateway API is important for modern Kubernetes networking designs.

---

# 63. Kubernetes Networking

A simplified Kubernetes networking model expects communication paths such as:

```text
Pod -> Pod
Pod -> Service
External -> Service
```

A cluster networking implementation provides Pod networking.

---

# 64. CNI

CNI means:

```text
Container Network Interface
```

CNI is a standard interface for configuring container networking.

Common Kubernetes networking solutions include:

```text
Calico
Cilium
Flannel
Cloud-provider networking solutions
```

The exact networking behavior depends on the chosen implementation.

---

# 65. NetworkPolicy

NetworkPolicy can restrict network traffic between Pods and other allowed endpoints, depending on the cluster's networking implementation.

Example intent:

```text
Frontend
   |
   v
API
   |
   v
Database
```

while preventing:

```text
Frontend --------X--------> Database
```

NetworkPolicy is an important defense-in-depth control.

---

# 66. Kubernetes Security

Important security areas include:

```text
Authentication
Authorization
RBAC
Service Accounts
Secrets
Network Policies
Pod Security
Admission Control
Image Security
Runtime Security
```

Security should be applied across the entire workload lifecycle.

---

# 67. RBAC

RBAC means:

```text
Role-Based Access Control
```

It answers:

```text
WHO
 |
 v
CAN DO WHAT
 |
 v
ON WHICH RESOURCE
 |
 v
WITHIN WHICH SCOPE
```

Example:

```text
Developer
   |
   v
Role
   |
   +-- get Pods
   +-- list Pods
   |
   v
Namespace: development
```

---

# 68. ServiceAccount

A ServiceAccount provides an identity for workloads running in Kubernetes.

Conceptually:

```text
Pod
 |
 v
ServiceAccount
 |
 v
API Authorization
 |
 v
Allowed Kubernetes Resources
```

Use dedicated ServiceAccounts and least privilege rather than granting broad permissions.

---

# 69. Scheduling

Kubernetes scheduling considers factors such as:

```text
CPU
Memory
Resource Requests
Node Labels
Affinity
Anti-Affinity
Taints
Tolerations
Topology
Scheduling Policies
```

The goal is to place Pods on suitable nodes.

---

# 70. Node Labels

Nodes can have labels such as:

```text
environment=production
zone=zone-a
workload=compute
```

Pods can use node selectors or affinity rules to influence placement.

---

# 71. Taints

A taint can prevent ordinary Pods from being scheduled onto a node.

Conceptually:

```text
Node
 |
 +-- Taint
       |
       v
   "Keep out"
```

Taints are useful for dedicated nodes and special workloads.

---

# 72. Tolerations

A Pod can tolerate a matching taint.

```text
Node
 |
 +-- Taint
       |
       v
Pod
 |
 +-- Matching Toleration
```

Important:

> A toleration allows a Pod to be scheduled onto a tainted node; it does not by itself force the Pod to run there.

---

# 73. Affinity

Affinity expresses scheduling preferences or requirements.

Examples:

```text
Run in a particular zone
Run near another workload
Prefer a particular node class
```

---

# 74. Anti-Affinity

Anti-affinity can separate workloads.

Example:

```text
API Replica 1 -> Node A
API Replica 2 -> Node B
API Replica 3 -> Node C
```

This improves resilience against node failures.

---

# 75. Kubernetes Self-Healing

Suppose:

```text
Deployment
replicas = 3
```

and:

```text
Pod 2 fails
```

A controller works to restore the desired state.

```text
3 desired
   |
   v
2 running
   |
   v
Controller
   |
   v
Replacement Pod
   |
   v
3 running
```

---

# 76. Scaling

Kubernetes supports multiple forms of scaling.

Manual:

```bash
kubectl scale deployment payment-api --replicas=5
```

Automatic scaling can involve:

```text
HorizontalPodAutoscaler
VerticalPodAutoscaler
Cluster Autoscaler
```

The exact availability and behavior depend on the Kubernetes distribution and platform configuration.

---

# 77. Horizontal Scaling

Horizontal scaling means increasing or decreasing the number of workload instances.

```text
2 Pods
  |
  v
5 Pods
```

This is common for stateless services.

---

# 78. Vertical Scaling

Vertical scaling means changing the resources assigned to a workload.

```text
CPU:    250m -> 500m
Memory: 256Mi -> 1Gi
```

Vertical scaling should be based on measured workload behavior.

---

# 79. Cluster Autoscaling

Cluster autoscaling changes the number of worker nodes based on workload capacity requirements when supported by the platform.

Conceptually:

```text
Pods Pending
     |
     v
Insufficient Node Capacity
     |
     v
Cluster Autoscaler
     |
     v
New Node
     |
     v
Pod Scheduled
```

---

# 80. Kubernetes Application Lifecycle

A typical application lifecycle looks like:

```text
Developer
    |
    v
Git
    |
    v
CI Pipeline
    |
    +-- Unit Tests
    +-- Build
    +-- Security Scan
    +-- Image Scan
    +-- SBOM
    |
    v
Container Registry
    |
    v
Deployment / GitOps
    |
    v
Kubernetes
    |
    v
Deployment
    |
    v
ReplicaSet
    |
    v
Pods
```

---

# 81. Kubernetes Does Not Build Your Application Image

Kubernetes normally consumes images that have already been built.

Typical flow:

```text
Source Code
    |
    v
Dockerfile / Build System
    |
    v
Container Image
    |
    v
Container Registry
    |
    v
Kubernetes
```

---

# 82. Image Pull

Example:

```yaml
containers:
  - name: api
    image: registry.example.com/payments/api:1.5.0
```

The node's container runtime obtains the image from the configured registry when necessary.

---

# 83. ImagePullPolicy

Common image pull policies include:

```text
Always
IfNotPresent
Never
```

Production deployments should generally avoid depending on mutable tags for release reproducibility.

---

# 84. Immutable Images

Avoid:

```yaml
image: payment-api:latest
```

Prefer:

```yaml
image: payment-api:1.5.0
```

For strict immutability:

```yaml
image: payment-api@sha256:<digest>
```

This makes the deployed artifact unambiguous.

---

# 85. Basic Pod Manifest

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: nginx

spec:
  containers:
    - name: nginx
      image: nginx:1.29
      ports:
        - containerPort: 80
```

Apply:

```bash
kubectl apply -f pod.yaml
```

For production application workloads, a Deployment is generally preferred over creating individual Pods directly.

---

# 86. kubectl

`kubectl` is the primary command-line tool for interacting with Kubernetes.

Examples:

```bash
kubectl get pods
kubectl get nodes
kubectl get deployments
kubectl get services
```

---

# 87. kubectl Contexts

A kubeconfig can contain multiple clusters and contexts.

List contexts:

```bash
kubectl config get-contexts
```

Current context:

```bash
kubectl config current-context
```

Switch:

```bash
kubectl config use-context <context>
```

Always verify the context before running destructive production commands.

---

# 88. Cluster Information

```bash
kubectl cluster-info
```

---

# 89. Get Nodes

```bash
kubectl get nodes
```

Detailed:

```bash
kubectl get nodes -o wide
```

Describe:

```bash
kubectl describe node <node-name>
```

---

# 90. Get Pods

```bash
kubectl get pods
```

All namespaces:

```bash
kubectl get pods -A
```

Specific namespace:

```bash
kubectl get pods -n production
```

---

# 91. Describe a Pod

```bash
kubectl describe pod <pod-name>
```

This is useful for examining:

- Scheduling
- Events
- Volumes
- Containers
- Probes
- Image pulls
- Failures
- Conditions

---

# 92. Pod Logs

```bash
kubectl logs <pod-name>
```

Follow:

```bash
kubectl logs -f <pod-name>
```

Specific container:

```bash
kubectl logs <pod-name> -c <container-name>
```

Previous container instance:

```bash
kubectl logs <pod-name> --previous
```

---

# 93. Execute Into a Pod

```bash
kubectl exec -it <pod-name> -- sh
```

If Bash exists:

```bash
kubectl exec -it <pod-name> -- bash
```

Do not assume production containers contain a shell.

---

# 94. Apply Configuration

```bash
kubectl apply -f deployment.yaml
```

Directory:

```bash
kubectl apply -f ./k8s/
```

---

# 95. Delete Resources

```bash
kubectl delete -f deployment.yaml
```

or:

```bash
kubectl delete deployment payment-api
```

Be careful with destructive commands in production.

---

# 96. Inspect Live YAML

```bash
kubectl get deployment payment-api -o yaml
```

This is useful for understanding the live API representation.

---

# 97. Inspect JSON

```bash
kubectl get pod payment-api-xxx -o json
```

Useful for:

- Automation
- Scripting
- Debugging
- API inspection

---

# 98. Kubernetes Events

Events are often one of the first places to look during troubleshooting.

```bash
kubectl get events
```

Namespace:

```bash
kubectl get events -n production
```

Depending on Kubernetes version and output needs, additional sorting or filtering can be useful.

---

# 99. Common Pod States

Common Pod phases include:

```text
Pending
Running
Succeeded
Failed
Unknown
```

The phase alone is not sufficient to diagnose an application problem. Inspect conditions, container state, events, and logs.

---

# 100. Pending Pod

Possible causes include:

```text
Insufficient CPU
Insufficient Memory
Scheduling Constraints
Taints
Missing Volumes
Unbound PVC
Topology Constraints
```

Use:

```bash
kubectl describe pod <pod-name>
```

and inspect the Events section.

---

# 101. CrashLoopBackOff

`CrashLoopBackOff` commonly means a container is repeatedly starting and exiting, with Kubernetes applying increasing restart delays.

Investigate:

```bash
kubectl logs <pod-name>
kubectl logs <pod-name> --previous
kubectl describe pod <pod-name>
```

Possible causes:

```text
Application Error
Bad Configuration
Missing Secret
Missing ConfigMap
Dependency Failure
Incorrect Command
Incorrect Arguments
```

---

# 102. ImagePullBackOff

This commonly indicates that the image cannot be pulled successfully.

Check:

```text
Image Name
Tag
Registry
Credentials
Network
Image Availability
Node Architecture
```

Use:

```bash
kubectl describe pod <pod-name>
```

to inspect events.

---

# 103. OOMKilled

`OOMKilled` indicates that a container was killed because it exceeded its effective memory limit or the system experienced memory pressure conditions relevant to the workload.

Investigate:

```text
Memory Limit
Application Memory Usage
Memory Leak
Traffic
Requests/Limits
Node Memory Pressure
```

---

# 104. Kubernetes Service Architecture

```text
                 Service
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Pod 1     Pod 2     Pod 3
          |         |         |
          +---------+---------+
                    |
               Application
```

The Service provides a stable abstraction while Pods remain replaceable.

---

# 105. Deployment Architecture

```text
Deployment
     |
     v
ReplicaSet
     |
 +---+---+
 |   |   |
 v   v   v
Pod Pod Pod
```

The Deployment manages ReplicaSets and rollout history.

---

# 106. StatefulSet Architecture

```text
StatefulSet
     |
     +-- db-0
     +-- db-1
     +-- db-2
           |
           v
      Persistent Storage
```

Stateful workloads require careful application-level design.

---

# 107. DaemonSet Architecture

```text
DaemonSet
    |
    +-- Node 1 -> Agent
    +-- Node 2 -> Agent
    +-- Node 3 -> Agent
    +-- Node 4 -> Agent
```

---

# 108. Job Architecture

```text
Job
 |
 v
Pod
 |
 v
Process
 |
 v
Complete
```

---

# 109. CronJob Architecture

```text
CronJob
   |
   +-- Schedule
          |
          v
         Job
          |
          v
         Pod
```

---

# 110. Configuration Architecture

```text
                    Pod
                     |
        +------------+------------+
        |            |            |
        v            v            v
   ConfigMap       Secret       Image
        |            |            |
        +------------+------------+
                     |
                     v
                Application
```

---

# 111. Storage Architecture

```text
Pod
 |
 v
PVC
 |
 v
PV
 |
 v
StorageClass / CSI
 |
 v
Storage Backend
```

---

# 112. Networking Architecture

```text
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
  v
Application
```

---

# 113. Security Architecture

For API access:

```text
User / CI / Automation
          |
          v
    Authentication
          |
          v
     Authorization
          |
          v
          RBAC
          |
          v
    Kubernetes API
```

For workloads:

```text
Pod
 |
 +-- ServiceAccount
 +-- Security Context
 +-- NetworkPolicy
 +-- Image Security
 +-- Secrets
```

---

# 114. Kubernetes Control Loop

The deepest Kubernetes mental model is:

```text
          Desired State
               |
               v
        Kubernetes API
               |
               v
          Controllers
               |
               v
          Actual State
               |
               v
      Observe Differences
               |
               v
          Take Action
               |
               +------------------+
                                  |
                                  v
                            Observe Again
```

This continues throughout the life of the cluster.

---

# 115. Example: Pod Failure

Desired:

```text
3 Pods
```

Current:

```text
2 Pods
```

Flow:

```text
Pod Failure
    |
    v
Controller Observes
    |
    v
Desired != Current
    |
    v
Replacement Created
    |
    v
Scheduler Selects Node
    |
    v
kubelet Starts Pod
    |
    v
3 Pods Running
```

---

# 116. Example: Node Failure

Suppose:

```text
Node A
 |
 +-- Pod 1
 +-- Pod 2
```

becomes unavailable.

Kubernetes detects node conditions and, depending on the workload controller and storage/topology constraints, works toward restoring the desired workload state on suitable nodes.

The conceptual flow is:

```text
Node Failure
     |
     v
Workload State Changes
     |
     v
Controller / Scheduler
     |
     v
Replacement Placement
     |
     v
New Pod
```

---

# 117. Example: Deployment Update

Initial state:

```text
Deployment
image=api:1.0
replicas=3
```

New state:

```text
image=api:2.0
```

Typical rollout:

```text
Deployment
     |
     v
New ReplicaSet
     |
     v
New Pods
     |
     v
Readiness Checks
     |
     v
Old ReplicaSet Scales Down
```

The exact rollout behavior depends on the Deployment strategy and configuration.

---

# 118. Kubernetes Self-Healing vs Docker Compose

Docker Compose is excellent for:

```text
Local Multi-Container Applications
Development Environments
Simple Integration Environments
```

Kubernetes provides a broader cluster orchestration model including:

```text
Scheduling
Desired-State Reconciliation
Self-Healing
Rolling Updates
Service Discovery
Scaling
Storage Abstractions
Policy
RBAC
Cluster Operations
```

---

# 119. Kubernetes vs Docker Swarm

| Capability | Docker Swarm | Kubernetes |
|---|---|---|
| Container orchestration | Yes | Yes |
| Desired-state model | Yes | Yes |
| Multi-node | Yes | Yes |
| Rolling updates | Yes | Yes |
| Secrets | Yes | Yes |
| Service discovery | Yes | Yes |
| Scheduling | Yes | Extensive |
| Ecosystem | Smaller | Very large |
| Extensibility | Moderate | Extensive |
| Operators | Limited | Strong ecosystem |
| Advanced networking | Moderate | Extensive |
| Autoscaling | Limited | Extensive |
| Operational complexity | Lower | Higher |

---

# 120. Kubernetes and GitOps

Kubernetes works well with GitOps.

Conceptually:

```text
Git
 |
 v
Desired Configuration
 |
 v
GitOps Controller
 |
 v
Kubernetes API
 |
 v
Cluster
```

Common GitOps tools include:

```text
Argo CD
Flux
```

---

# 121. Kubernetes in CI/CD

A modern pipeline can look like:

```text
Developer
    |
    v
Git
    |
    v
CI Pipeline
    |
    +-- Unit Tests
    +-- SAST
    +-- Build Image
    +-- Image Scan
    +-- SBOM
    +-- Push Image
    |
    v
Container Registry
    |
    v
Deployment / GitOps
    |
    v
Kubernetes
```

---

# 122. Build Once, Deploy Many

A strong DevOps principle is:

```text
Build
  |
  v
Test
  |
  v
Scan
  |
  v
Publish
  |
  v
Promote Same Artifact
```

Avoid rebuilding a different binary/image for every environment.

Promote the same tested artifact through:

```text
Development
    |
    v
Testing
    |
    v
Staging
    |
    v
Production
```

---

# 123. Kubernetes Environments

Typical environments include:

```text
Development
Testing
Staging
Production
```

They can be separated using:

```text
Namespaces
Clusters
Contexts
GitOps
Helm
Kustomize
```

The appropriate boundary depends on isolation and compliance requirements.

---

# 124. Kubernetes and Helm

Helm is a package manager for Kubernetes.

A Helm chart can package multiple Kubernetes resources.

Conceptually:

```text
Helm Chart
   |
   +-- Deployment
   +-- Service
   +-- ConfigMap
   +-- RBAC
   +-- Other Resources
```

Helm is an ecosystem tool used with Kubernetes; it is not part of the Kubernetes control plane.

---

# 125. Kubernetes and Kustomize

Kustomize provides a way to customize Kubernetes manifests.

Example structure:

```text
base/
 |
 +-- deployment.yaml
 +-- service.yaml

overlays/
 |
 +-- dev/
 +-- staging/
 +-- production/
```

This can help maintain a common base with environment-specific configuration.

---

# 126. Production Principles

Use the following principles when designing Kubernetes workloads:

```text
1. Treat Pods as ephemeral.

2. Prefer Deployments for stateless applications.

3. Use StatefulSets when stable identity/storage semantics are actually required.

4. Expose applications through Services rather than Pod IPs.

5. Use readiness probes for traffic eligibility.

6. Use liveness probes carefully.

7. Use startup probes for slow-starting applications.

8. Define realistic resource requests.

9. Define appropriate resource limits.

10. Avoid mutable image tags.

11. Prefer immutable image versions or digests.

12. Use namespaces for logical organization and policy.

13. Apply RBAC least privilege.

14. Use dedicated ServiceAccounts.

15. Protect Secrets.

16. Use NetworkPolicies where appropriate.

17. Apply Pod security controls.

18. Monitor cluster and application health.

19. Centralize logs.

20. Back up critical control-plane state.

21. Back up persistent application data separately.

22. Test disaster recovery.

23. Spread critical workloads across failure domains.

24. Use controlled rolling deployments.

25. Define rollback procedures.

26. Treat Kubernetes manifests as code.

27. Store infrastructure definitions in version control.

28. Validate manifests before deployment.

29. Use CI/CD or GitOps for controlled delivery.

30. Remember that Running does not necessarily mean Ready.
```

---

# 127. Common Anti-Patterns

## 127.1 Using Pod IPs Directly

Avoid:

```text
http://10.42.1.23:8080
```

Pod IPs are ephemeral.

Prefer:

```text
http://payment-api:8080
```

through a Service.

---

## 127.2 Managing Application Pods Directly

For long-running applications, normally use:

```text
Deployment
StatefulSet
DaemonSet
```

rather than manually managing individual Pods.

---

## 127.3 No Resource Requests

Without appropriate requests, scheduling and capacity planning become less predictable.

Example:

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
```

Values should be based on measured workload behavior.

---

## 127.4 Excessive Resource Limits

Avoid unrealistic limits.

For example:

```text
Typical application usage = 500Mi
Configured limit = 64Gi
```

Such settings can hide capacity problems and make resource planning less meaningful.

---

## 127.5 Using `latest`

Avoid:

```yaml
image: myapp:latest
```

Prefer controlled release versions:

```yaml
image: myapp:1.5.0
```

or immutable digests.

---

## 127.6 Hard-Coded Secrets

Do not commit real production passwords into Git-managed manifests.

Prefer:

```text
Kubernetes Secrets
External Secret Managers
Cloud Secret Stores
Secret Operator Integrations
```

according to organizational requirements.

---

## 127.7 Treating Kubernetes as a Database

Kubernetes does not automatically provide application database HA.

Databases still require:

```text
Replication
Failover
Backups
Restore
Data Retention
Performance Management
```

---

## 127.8 No Probes

A running process is not necessarily a healthy application.

Use:

```text
Startup Probe
Readiness Probe
Liveness Probe
```

when they accurately represent application behavior.

---

## 127.9 No Network Controls

If all workloads can freely communicate, a compromised application may gain unnecessary lateral access.

Use NetworkPolicies where appropriate.

---

# 128. Troubleshooting Mental Model

Troubleshoot from the outside toward the application:

```text
External Traffic
      |
      v
Ingress / Gateway
      |
      v
Service
      |
      v
EndpointSlices
      |
      v
Pod
      |
      v
Container
      |
      v
Application
      |
      v
Dependency
```

---

# 129. Basic Troubleshooting Commands

```bash
kubectl get pods
kubectl get pods -o wide
kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs <pod> --previous
kubectl get events
kubectl get svc
kubectl get endpointslices
kubectl get deployment
kubectl describe deployment <deployment>
```

---

# 130. Troubleshooting Checklist

When an application is not working, check:

```text
[ ] Correct kubectl context
[ ] Correct namespace
[ ] Deployment exists
[ ] ReplicaSet exists
[ ] Desired replicas match available replicas
[ ] Pods are Running
[ ] Pods are Ready
[ ] Container logs
[ ] Previous container logs
[ ] Pod events
[ ] Image can be pulled
[ ] Service exists
[ ] Service selector is correct
[ ] EndpointSlices contain expected endpoints
[ ] Ingress/Gateway configuration
[ ] NetworkPolicy
[ ] DNS
[ ] Resource requests/limits
[ ] Node capacity
[ ] PVC status
[ ] Secrets
[ ] ConfigMaps
[ ] Application dependencies
```

---

# 131. Interview Questions

## Beginner

### What is Kubernetes?

Kubernetes is a container orchestration platform that manages containerized workloads using declarative resources and continuous reconciliation.

### What is a Kubernetes cluster?

A collection of control-plane and worker-node components that collectively run and manage Kubernetes workloads.

### What is a Pod?

The smallest deployable compute object in Kubernetes. A Pod can contain one or more tightly coupled containers.

### What is a Service?

A stable networking abstraction for reaching a group of Pods.

### What is a Namespace?

A logical partition used to organize and scope resources within a cluster.

---

## Intermediate

### What is a Deployment?

A controller resource that manages ReplicaSets and provides declarative rollout management for stateless workloads.

### What is a ReplicaSet?

A controller that maintains a desired number of matching Pods.

### What is a ConfigMap?

A resource for non-sensitive configuration data.

### What is a Secret?

A resource intended for sensitive configuration data.

### What is a StatefulSet?

A workload controller for applications that need stable identity and/or persistent storage semantics.

### What is a DaemonSet?

A workload controller that runs a Pod on each eligible node.

### What is a Job?

A workload controller for tasks that should run to completion.

### What is a CronJob?

A resource that creates Jobs on a schedule.

---

## Advanced

### Why is Kubernetes declarative?

Because users describe desired state and controllers continuously reconcile actual state toward that desired state.

### What is reconciliation?

The continuous process of comparing desired state with observed state and taking corrective action.

### What is the role of etcd?

It stores Kubernetes cluster state as the control-plane data store.

### What does the scheduler do?

It selects suitable nodes for Pods that have not yet been assigned to a node.

### What does kubelet do?

It runs on nodes and ensures assigned Pods are running according to their specifications.

### What is the difference between a Pod and a container?

A container is a runtime unit; a Pod is the Kubernetes scheduling and execution abstraction that can contain one or more containers sharing networking and other resources.

### Why should applications use Services instead of Pod IPs?

Pod IPs are ephemeral. Services provide a stable discovery and routing abstraction.

### What is the difference between readiness and liveness?

Readiness determines whether a workload should receive traffic. Liveness determines whether the container should be considered for restart.

### What is a startup probe?

A probe designed for applications that need substantial initialization time before normal liveness/readiness checks should take effect.

### What are requests and limits?

Requests influence scheduling and capacity planning. Limits constrain resource consumption.

### What is a CNI?

Container Network Interface, a standard interface used to integrate container networking implementations with Kubernetes.

### What is CSI?

Container Storage Interface, a standard interface used to integrate storage systems with Kubernetes.

### What is RBAC?

Role-Based Access Control, which defines which identities can perform which operations on which resources.

### What is a ServiceAccount?

An identity used by workloads running in Kubernetes.

### What are taints and tolerations?

Taints restrict ordinary scheduling onto nodes; matching tolerations allow Pods to tolerate those taints.

---

# 132. Key Relationships to Remember

```text
Cluster
 |
 +-- Control Plane
 |
 +-- Worker Nodes
       |
       +-- kubelet
       +-- Container Runtime
       +-- Pods
```

Application workload:

```text
Deployment
 |
 v
ReplicaSet
 |
 v
Pods
 |
 v
Containers
```

Networking:

```text
Ingress / Gateway
 |
 v
Service
 |
 v
Pods
```

Configuration:

```text
ConfigMap
 |
 +--> Pod

Secret
 |
 +--> Pod
```

Storage:

```text
Pod
 |
 v
PVC
 |
 v
PV
 |
 v
Storage Backend
```

Scheduling:

```text
Pod
 |
 v
Scheduler
 |
 +-- Requests
 +-- Labels
 +-- Affinity
 +-- Taints
 +-- Tolerations
 +-- Topology
 |
 v
Node
```

---

# 133. Complete Kubernetes Mental Model

```text
                         KUBERNETES
                              |
              +---------------+---------------+
              |                               |
              v                               v
        CONTROL PLANE                    WORKER NODES
              |                               |
      +-------+-------+                 +-----+------+
      |       |       |                 |            |
      v       v       v                 v            v
 API Server  etcd  Scheduler          kubelet     Runtime
      |
      v
 Controllers
      |
      v
 Desired State
      |
      v
 Reconciliation
      |
      v
 +----+---------------------------------------+
 |                                            |
 v                                            v
Workloads                                  Networking
 |                                            |
 +-- Deployment                              +-- Service
 +-- StatefulSet                             +-- Ingress
 +-- DaemonSet                               +-- Gateway API
 +-- Job                                     +-- CNI
 +-- CronJob                                 +-- NetworkPolicy
 |
 v
Pods
 |
 +-- Containers
 +-- Volumes
 +-- ConfigMaps
 +-- Secrets
 +-- ServiceAccounts
 +-- Probes
 +-- Resource Requests/Limits
```

---

# 134. Kubernetes Lifecycle

```text
CREATE CLUSTER
      |
      v
CONFIGURE CONTROL PLANE
      |
      v
JOIN / PROVIDE WORKER NODES
      |
      v
CONFIGURE NETWORKING
      |
      v
CONFIGURE STORAGE
      |
      v
DEPLOY APPLICATION
      |
      v
DEPLOYMENT
      |
      v
REPLICASET
      |
      v
PODS
      |
      v
CONTAINERS
      |
      v
SERVICE
      |
      v
INGRESS / GATEWAY
      |
      v
MONITOR
      |
      v
SCALE
      |
      v
ROLLING UPDATE
      |
      v
ROLLBACK IF REQUIRED
      |
      v
OPERATE / UPGRADE
      |
      v
DISASTER RECOVERY
```

---

# 135. Final Key Takeaways

```text
1. Kubernetes is a container orchestration platform.

2. K8s is the common abbreviation for Kubernetes.

3. Kubernetes is primarily declarative.

4. Desired state is central to Kubernetes.

5. Controllers continuously reconcile desired and actual state.

6. The Kubernetes API is the central interface to cluster resources.

7. The control plane manages cluster state and orchestration.

8. Worker nodes run application workloads.

9. etcd stores Kubernetes cluster state.

10. kube-scheduler selects nodes for unscheduled Pods.

11. kubelet manages Pods on worker nodes.

12. Container runtimes execute containers.

13. Pods are the smallest deployable compute objects.

14. Pods should generally be treated as ephemeral.

15. Containers inside a Pod share networking and can share volumes.

16. Deployments normally manage ReplicaSets.

17. ReplicaSets maintain desired Pod counts.

18. Services provide stable networking for Pods.

19. Pod IPs are ephemeral.

20. ConfigMaps store non-sensitive configuration.

21. Secrets are intended for sensitive configuration.

22. PersistentVolumeClaims request storage.

23. PersistentVolumes represent storage resources.

24. StorageClasses support storage provisioning models.

25. CSI integrates storage systems with Kubernetes.

26. StatefulSets provide stable workload identity/storage semantics.

27. DaemonSets run workloads across eligible nodes.

28. Jobs run tasks to completion.

29. CronJobs schedule Jobs.

30. Readiness determines traffic eligibility.

31. Liveness detects conditions where restarting may be appropriate.

32. Startup probes help slow-starting applications.

33. Resource requests influence scheduling.

34. Resource limits constrain resource consumption.

35. Ingress provides HTTP/HTTPS routing and requires an implementation/controller.

36. Gateway API is an important modern Kubernetes networking API.

37. CNI provides the networking integration model.

38. NetworkPolicies provide network access controls when supported by the networking implementation.

39. RBAC controls API permissions.

40. ServiceAccounts provide workload identity.

41. Taints restrict scheduling.

42. Tolerations allow workloads to tolerate matching taints.

43. Affinity and anti-affinity influence workload placement.

44. Kubernetes can self-heal controller-managed workloads.

45. Kubernetes supports horizontal and other forms of scaling.

46. Immutable image versions improve deployment reproducibility.

47. Kubernetes normally consumes images built by external build systems.

48. CI/CD and GitOps are common Kubernetes delivery patterns.

49. Helm packages Kubernetes resources.

50. Kustomize customizes Kubernetes manifests.

51. Kubernetes is more extensible and feature-rich than Docker Swarm.

52. Kubernetes also has greater operational complexity.

53. Pods are not virtual machines.

54. Kubernetes is not a replacement for application-level database replication.

55. Kubernetes is not automatically a complete enterprise secret-management solution.

56. Production Kubernetes requires security, monitoring, logging, backup, and disaster-recovery planning.

57. The most important mental model is:

    Desired State
          |
          v
    Kubernetes API
          |
          v
    Controllers
          |
          v
    Reconciliation
          |
          v
    Actual State
```

---

# 136. Related Kubernetes Knowledge

This fundamentals document should be followed by the more focused documents in this knowledge directory:

```text
cluster.md
control-plane.md
worker-node.md
pod.md
container.md
namespace.md
replicaset.md
deployment.md
service.md
configmap.md
secret.md
volume.md
pvc.md
statefulset.md
daemonset.md
job-cronjob.md
probes.md
resource-requests-limits.md
ingress.md
kubernetes-networking.md
kubernetes-storage.md
kubernetes-security.md
kubernetes-operations.md
kubernetes-troubleshooting.md
```

Recommended learning order:

```text
kubernetes-fundamentals.md
        |
        v
cluster.md
        |
        v
control-plane.md
        |
        v
worker-node.md
        |
        v
pod.md
        |
        v
container.md
        |
        v
namespace.md
        |
        v
replicaset.md
        |
        v
deployment.md
        |
        v
service.md
        |
        +-------------------+
        |                   |
        v                   v
configmap.md           secret.md
        |
        v
volume.md
        |
        v
pvc.md
        |
        v
statefulset.md
        |
        v
daemonset.md
        |
        v
job-cronjob.md
        |
        v
probes.md
        |
        v
resource-requests-limits.md
        |
        v
ingress.md
        |
        v
kubernetes-networking.md
        |
        v
kubernetes-storage.md
        |
        v
kubernetes-security.md
        |
        v
kubernetes-operations.md
        |
        v
kubernetes-troubleshooting.md
```

---

# 137. Quick Reference

## Core Commands

```bash
# Cluster
kubectl cluster-info
kubectl get nodes
kubectl get namespaces

# Pods
kubectl get pods
kubectl get pods -A
kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs <pod> --previous

# Deployments
kubectl get deployments
kubectl describe deployment <deployment>
kubectl rollout status deployment/<deployment>
kubectl rollout history deployment/<deployment>
kubectl rollout undo deployment/<deployment>

# Services
kubectl get services
kubectl describe service <service>

# Configuration
kubectl get configmaps
kubectl get secrets

# Storage
kubectl get pv
kubectl get pvc
kubectl get storageclass

# Troubleshooting
kubectl get events
kubectl describe node <node>
kubectl get pods -o wide

# Apply
kubectl apply -f <file-or-directory>

# Delete
kubectl delete -f <file-or-directory>

# Context
kubectl config get-contexts
kubectl config current-context
kubectl config use-context <context>
```

---

# 138. Practical Kubernetes Thought Process

When designing a Kubernetes application, think in this order:

```text
1. What is the workload?
        |
        +-- Stateless -> Deployment
        +-- Stateful  -> StatefulSet
        +-- Node agent -> DaemonSet
        +-- Batch      -> Job
        +-- Scheduled  -> CronJob

2. How many instances?
        |
        +-- replicas

3. How should it receive traffic?
        |
        +-- Service
        +-- Ingress / Gateway

4. What configuration does it need?
        |
        +-- ConfigMap
        +-- Secret

5. Does it need persistent data?
        |
        +-- Volume
        +-- PVC
        +-- StorageClass

6. How should it be scheduled?
        |
        +-- Requests
        +-- Limits
        +-- Labels
        +-- Affinity
        +-- Taints
        +-- Tolerations

7. How do we know it is healthy?
        |
        +-- Startup
        +-- Readiness
        +-- Liveness

8. How do we secure it?
        |
        +-- RBAC
        +-- ServiceAccount
        +-- NetworkPolicy
        +-- Pod security
        +-- Image security

9. How do we deploy it?
        |
        +-- CI/CD
        +-- Helm
        +-- Kustomize
        +-- GitOps

10. How do we operate it?
        |
        +-- Monitoring
        +-- Logging
        +-- Alerts
        +-- Backup
        +-- Disaster Recovery
```

---

> **Core Kubernetes principle: Define the desired state, store it through the Kubernetes API, and let controllers continuously reconcile the cluster toward that state.**
