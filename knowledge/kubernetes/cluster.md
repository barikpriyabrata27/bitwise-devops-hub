# Kubernetes Cluster

> A Kubernetes cluster is the complete environment in which the Kubernetes control plane manages worker nodes and the workloads running on them.

---

## 1. What Is a Kubernetes Cluster?

A Kubernetes cluster is a group of machines and software components working together to provide a container orchestration platform.

At a high level:

```text
Kubernetes Cluster
|
+-- Control Plane
|
+-- Worker Nodes
    |
    +-- Pods
        |
        +-- Containers
```

The control plane makes cluster-level decisions, while worker nodes run application workloads.

---

## 2. Cluster Architecture

A simplified architecture looks like this:

```text
                         Kubernetes Cluster
                                |
                +---------------+---------------+
                |                               |
                v                               v
          Control Plane                    Worker Nodes
                |                               |
        +-------+--------+                +-----+-----+
        |       |        |                |     |     |
        v       v        v                v     v     v
   API Server  etcd  Scheduler         Node  Node  Node
                    Controllers          |     |     |
                                         v     v     v
                                        Pods  Pods  Pods
```

A production cluster normally has multiple worker nodes and may have multiple control-plane nodes for high availability.

---

## 3. Main Components of a Cluster

A Kubernetes cluster consists of:

### Control Plane

Responsible for managing cluster state and making orchestration decisions.

Typical components:

```text
kube-apiserver
etcd
kube-scheduler
kube-controller-manager
cloud-controller-manager
```

### Worker Nodes

Responsible for running workloads.

Typical components:

```text
kubelet
Container Runtime
kube-proxy (where used)
```

---

## 4. Control Plane vs Worker Node

| Area | Control Plane | Worker Node |
|---|---|---|
| Cluster management | Yes | No |
| API server | Yes | No |
| Scheduler | Yes | No |
| Controllers | Yes | No |
| etcd | Usually | No |
| Run application Pods | Generally not | Yes |
| kubelet | Usually no | Yes |
| Container runtime | May exist | Yes |
| Application workload | Normally avoided | Yes |

Modern Kubernetes allows control-plane nodes to run workloads if configured to do so, but production clusters often reserve them for control-plane responsibilities.

---

## 5. Cluster State

Kubernetes maintains a model of cluster state.

Examples include:

```text
Nodes
Pods
Deployments
Services
ConfigMaps
Secrets
Namespaces
PersistentVolumes
Jobs
```

Conceptually:

```text
Desired State
      |
      v
Kubernetes API
      |
      v
Cluster State
      |
      v
Controllers
      |
      v
Actual Resources
```

---

## 6. Desired State

Suppose you define:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: web

spec:
  replicas: 3
```

The desired state is:

```text
Deployment web
replicas = 3
```

Kubernetes continuously works toward maintaining that state.

---

## 7. Cluster Reconciliation

The cluster continuously reconciles desired and actual state.

```text
Desired State
     |
     v
API Server
     |
     v
Controller
     |
     v
Observe Cluster
     |
     v
Compare
   /   \
  /     \
Same   Different
 |         |
 v         v
Wait     Correct
           |
           v
       New State
```

This is one of the most important Kubernetes concepts.

---

## 8. API Server

The API server is the central communication point of the cluster.

Clients and components interact through it:

```text
kubectl
  |
  +-- CI/CD
  |
  +-- Controllers
  |
  +-- Scheduler
  |
  +-- Operators
  |
  v
kube-apiserver
```

The API server exposes Kubernetes resources through its API.

---

## 9. etcd

`etcd` is the key-value store used to persist Kubernetes cluster state.

Conceptually:

```text
Kubernetes API Server
          |
          v
         etcd
          |
          +-- Resource State
          +-- Metadata
          +-- Configuration
          +-- Cluster Information
```

### Why etcd Is Important

If the control-plane state is lost, cluster recovery can become difficult.

Production environments should have:

- Secure etcd access
- Backups
- Restore testing
- Encryption where appropriate
- Restricted administrative access
- Monitoring

---

## 10. kube-scheduler

The scheduler assigns unscheduled Pods to suitable nodes.

```text
Pod
 |
 | Not assigned
 v
Scheduler
 |
 +-- CPU
 +-- Memory
 +-- Requests
 +-- Node labels
 +-- Affinity
 +-- Anti-affinity
 +-- Taints
 +-- Tolerations
 +-- Topology
 |
 v
Selected Node
```

The scheduler decides placement; it does not directly run the container.

---

## 11. kube-controller-manager

The controller manager runs control loops.

Controllers observe resources and take corrective actions.

Examples include controllers for:

```text
Deployments
ReplicaSets
Nodes
Jobs
Namespaces
Endpoints / EndpointSlices
```

Conceptually:

```text
Observe
   |
   v
Compare
   |
   v
Correct
   |
   v
Observe Again
```

---

## 12. Cloud Controller Manager

In cloud environments, the cloud controller manager integrates Kubernetes with cloud-provider functionality.

Depending on the provider, it may support:

```text
Cloud Load Balancers
Node Metadata
Cloud Routes
Cloud Storage Integration
```

The exact functionality depends on the cloud platform.

---

## 13. Worker Nodes

Worker nodes provide compute capacity for application workloads.

```text
Worker Node
|
+-- kubelet
|
+-- Container Runtime
|
+-- kube-proxy / equivalent networking implementation
|
+-- Pods
```

A cluster normally has multiple worker nodes.

---

## 14. kubelet

The kubelet is the primary node agent.

It ensures that Pods assigned to the node are running according to their specifications.

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
Container
```

---

## 15. Container Runtime

The container runtime actually executes containers.

Kubernetes communicates with the runtime through the Container Runtime Interface (CRI).

Common runtimes include:

```text
containerd
CRI-O
```

The runtime handles operations such as:

- Pulling images
- Creating containers
- Starting containers
- Stopping containers
- Managing container lifecycle

---

## 16. kube-proxy

`kube-proxy` traditionally implements networking rules associated with Kubernetes Services.

Modern networking implementations can replace or bypass kube-proxy.

Therefore:

```text
Service Networking
```

does not always mean:

```text
kube-proxy
```

in every cluster.

---

## 17. Node Registration

A worker node becomes part of a Kubernetes cluster through the node registration process.

Conceptually:

```text
New Machine
    |
    v
Install Kubernetes Node Components
    |
    v
Configure kubelet
    |
    v
Connect to API Server
    |
    v
Node Registered
    |
    v
Scheduler Can Consider Node
```

The exact bootstrap mechanism depends on the Kubernetes distribution.

---

## 18. Node Object

Kubernetes represents a worker node as a Node API object.

View nodes:

```bash
kubectl get nodes
```

Example:

```text
NAME       STATUS   ROLES    AGE
worker-1   Ready    <none>   20d
worker-2   Ready    <none>   20d
worker-3   Ready    <none>   20d
```

---

## 19. Node Conditions

Nodes expose conditions that describe their health.

Examples include:

```text
Ready
MemoryPressure
DiskPressure
PIDPressure
NetworkUnavailable
```

Inspect a node:

```bash
kubectl describe node <node-name>
```

---

## 20. Ready Node

A node in the `Ready` condition generally indicates that the kubelet is reporting that the node is healthy enough to accept Pods.

However:

```text
Node Ready
```

does not mean:

```text
Every application on the node is healthy
```

Application health must be evaluated separately.

---

## 21. Node Capacity

Nodes expose resource information such as:

```text
CPU
Memory
Ephemeral Storage
Pods
```

View:

```bash
kubectl describe node <node-name>
```

You may see:

```text
Capacity
Allocatable
```

---

## 22. Capacity vs Allocatable

### Capacity

The total resource capacity recognized for the node.

### Allocatable

The amount Kubernetes makes available for Pods after reserving resources for node/system components and configuration.

Conceptually:

```text
Node Capacity
      |
      +-- System / Kubernetes Reservation
      |
      v
Allocatable
      |
      v
Pod Resources
```

---

## 23. Resource Requests and Scheduling

Suppose a Pod requests:

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
```

The scheduler considers whether a node has sufficient allocatable resources.

Important:

> Scheduling is based primarily on resource requests, not actual instantaneous usage.

---

## 24. Node Labels

Nodes can have labels:

```text
environment=production
zone=zone-a
workload=compute
```

View labels:

```bash
kubectl get nodes --show-labels
```

Labels can influence scheduling.

---

## 25. Node Selector

A Pod can request a particular node label.

Example:

```yaml
spec:
  nodeSelector:
    workload: compute
```

The Pod will only be considered for nodes matching that label.

---

## 26. Node Affinity

Node affinity provides more expressive placement rules.

Example:

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: workload
              operator: In
              values:
                - compute
```

Affinity can express:

```text
Required
Preferred
```

placement behavior.

---

## 27. Taints

Taints can prevent Pods from being scheduled onto a node unless they tolerate the taint.

Conceptually:

```text
Node
 |
 +-- Taint
       |
       v
   "Keep out"
```

Example concept:

```text
dedicated=database:NoSchedule
```

---

## 28. Tolerations

A Pod can tolerate a matching node taint.

Example:

```yaml
tolerations:
  - key: dedicated
    operator: Equal
    value: database
    effect: NoSchedule
```

Important:

> A toleration allows scheduling onto a tainted node. It does not automatically force scheduling there.

Use affinity or node selectors when you also need positive placement rules.

---

## 29. Node Maintenance

Before performing maintenance, workloads can be moved away from a node.

Common command:

```bash
kubectl cordon <node>
```

This prevents new Pods from being scheduled there.

To drain:

```bash
kubectl drain <node>
```

Draining attempts to evict eligible workloads so the node can be safely maintained.

After maintenance:

```bash
kubectl uncordon <node>
```

---

## 30. Cordon vs Drain

| Operation | Purpose |
|---|---|
| `cordon` | Prevent new scheduling |
| `drain` | Evict eligible workloads and prepare node for maintenance |
| `uncordon` | Allow scheduling again |

Conceptually:

```text
Normal
  |
  v
Cordon
  |
  v
No New Pods
  |
  v
Drain
  |
  v
Workloads Evicted
  |
  v
Maintenance
  |
  v
Uncordon
  |
  v
Scheduling Resumes
```

---

## 31. Pod Scheduling

The scheduling flow is approximately:

```text
Pod Created
    |
    v
API Server
    |
    v
Scheduler Watches
    |
    v
Find Suitable Node
    |
    v
Assign Pod to Node
    |
    v
kubelet Observes Assignment
    |
    v
Container Runtime
    |
    v
Container Starts
```

---

## 32. What Makes a Node Suitable?

The scheduler considers multiple constraints and preferences.

Examples:

```text
Resource Requests
Node Selectors
Node Affinity
Pod Affinity
Pod Anti-Affinity
Taints
Tolerations
Topology Constraints
Scheduling Policies
```

---

## 33. Pod Anti-Affinity

Anti-affinity can spread replicas across nodes.

Example:

```text
API Pod 1 -> Node A
API Pod 2 -> Node B
API Pod 3 -> Node C
```

This reduces the impact of a single-node failure.

---

## 34. Topology

Kubernetes can use topology information such as:

```text
Region
Zone
Node
```

This is useful for distributing workloads across failure domains.

Example:

```text
Region
 |
 +-- Zone A
 |    +-- Node 1
 |    +-- Node 2
 |
 +-- Zone B
      +-- Node 3
      +-- Node 4
```

---

## 35. High Availability

A highly available cluster avoids having a single point of failure in critical control-plane components.

A simplified HA architecture:

```text
                 Load Balancer
                       |
             +---------+---------+
             |         |         |
             v         v         v
          API-1     API-2     API-3
             |         |         |
             +---------+---------+
                       |
                     etcd
                 +-----+-----+
                 |     |     |
                 v     v     v
               etcd  etcd  etcd
```

The exact architecture depends on the Kubernetes distribution and infrastructure.

---

## 36. Why Multiple Control-Plane Nodes?

Multiple control-plane nodes improve availability.

If one control-plane node fails:

```text
Control Plane 1 -> Failed
Control Plane 2 -> Available
Control Plane 3 -> Available
```

The cluster can continue operating if quorum and other HA requirements remain satisfied.

---

## 37. etcd Quorum

In an HA etcd cluster, quorum is essential.

For an odd-sized cluster:

```text
3 members -> quorum = 2
5 members -> quorum = 3
7 members -> quorum = 4
```

General formula:

```text
Quorum = floor(N / 2) + 1
```

The goal is to tolerate failures while maintaining a majority.

---

## 38. Why Odd Numbers of etcd Members?

Odd-sized etcd clusters generally provide better failure tolerance per member.

For example:

```text
3 members -> tolerate 1 failure
5 members -> tolerate 2 failures
7 members -> tolerate 3 failures
```

Adding members increases operational and network overhead, so larger is not automatically better.

---

## 39. Control Plane High Availability

A simplified HA control plane can look like:

```text
                  Clients
                     |
                     v
              API Load Balancer
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Master-1   Master-2   Master-3
          |          |          |
          +----------+----------+
                     |
              HA etcd Cluster
```

The exact control-plane component distribution varies by architecture.

---

## 40. Worker Node High Availability

Application availability also depends on worker-node distribution.

Poor design:

```text
Node A
 |
 +-- All application replicas
```

Better:

```text
Node A -> Replica 1
Node B -> Replica 2
Node C -> Replica 3
```

Even better when possible:

```text
Zone A -> Replica 1
Zone B -> Replica 2
Zone C -> Replica 3
```

---

## 41. Cluster Networking

A Kubernetes cluster requires networking that supports the cluster's required communication model.

Common paths include:

```text
Pod -> Pod
Pod -> Service
Pod -> External Service
External Client -> Service / Gateway
Node -> Pod
```

The exact implementation is provided by the cluster networking solution.

---

## 42. Cluster DNS

Kubernetes clusters commonly use DNS-based service discovery.

Conceptually:

```text
Application Pod
      |
      v
Cluster DNS
      |
      v
Service Name
      |
      v
Service IP / Endpoint Resolution
```

CoreDNS is commonly used as the cluster DNS implementation.

---

## 43. Service Discovery

Suppose:

```text
Service = payment-api
Namespace = production
```

Applications can use:

```text
payment-api
```

or a fully qualified name such as:

```text
payment-api.production.svc.cluster.local
```

This avoids hard-coding Pod IP addresses.

---

## 44. ClusterIP

The default Kubernetes Service type is generally:

```text
ClusterIP
```

It provides an internal virtual IP for cluster access.

```text
Pod
 |
 v
ClusterIP Service
 |
 v
Backend Pods
```

---

## 45. NodePort

A NodePort exposes a Service on a port associated with nodes.

Conceptually:

```text
External Client
      |
      v
Node IP:NodePort
      |
      v
Service
      |
      v
Pods
```

NodePort is often useful as a building block but is not always the preferred direct public exposure mechanism.

---

## 46. LoadBalancer

A `LoadBalancer` Service can integrate with a cloud or external load-balancing implementation.

```text
Internet
   |
   v
Cloud Load Balancer
   |
   v
Service
   |
   v
Pods
```

Behavior depends on the infrastructure/provider.

---

## 47. Ingress and Gateway

A common HTTP architecture is:

```text
Internet
   |
   v
Ingress / Gateway
   |
   +-- payment-service
   +-- order-service
   +-- user-service
```

The Ingress or Gateway layer provides routing while Services provide stable backend endpoints.

---

## 48. Storage in a Cluster

Storage may involve:

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

A production cluster must consider:

- Availability
- Performance
- Backup
- Restore
- Failure domains
- Access modes
- Data lifecycle

---

## 49. Cluster Security

Cluster security spans multiple layers:

```text
Identity
   |
   v
Authentication
   |
   v
Authorization / RBAC
   |
   v
Admission
   |
   v
Pod Security
   |
   v
Network Policy
   |
   v
Image Security
   |
   v
Runtime Security
```

No single control provides complete security.

---

## 50. Authentication

Authentication answers:

```text
Who are you?
```

Potential identities include:

```text
Human User
Service Account
CI/CD System
Cloud Identity
External Identity Provider
```

---

## 51. Authorization

Authorization answers:

```text
What are you allowed to do?
```

RBAC is a primary Kubernetes authorization mechanism.

Example:

```text
User
 |
 v
Role / ClusterRole
 |
 v
Permissions
```

---

## 52. Admission Control

After authentication and authorization, Kubernetes can apply admission controls before accepting an API request.

Admission can be used for:

```text
Validation
Mutation
Policy Enforcement
Security Controls
```

Modern clusters commonly use admission controllers and/or policy frameworks.

---

## 53. Namespace-Level Isolation

Namespaces can provide logical separation:

```text
Cluster
 |
 +-- dev
 |
 +-- staging
 |
 +-- production
```

Additional controls can include:

```text
RBAC
ResourceQuota
LimitRange
NetworkPolicy
Pod Security
```

---

## 54. ResourceQuota

A ResourceQuota limits resource consumption within a namespace.

Conceptually:

```text
production namespace
 |
 +-- CPU quota
 +-- Memory quota
 +-- Pod quota
 +-- Object quotas
```

This helps prevent one team or namespace from consuming unlimited shared cluster resources.

---

## 55. LimitRange

A LimitRange can define default or boundary values for resources within a namespace.

It can help enforce consistent resource configuration.

Conceptually:

```text
Namespace
 |
 +-- Minimum resource
 +-- Maximum resource
 +-- Default request
 +-- Default limit
```

---

## 56. Cluster Autoscaling

A cluster can dynamically add or remove worker nodes when supported.

Example:

```text
Pods Pending
     |
     v
Insufficient Capacity
     |
     v
Cluster Autoscaler
     |
     v
New Worker Node
     |
     v
Pods Scheduled
```

Scale-down requires careful consideration of:

- Pod disruption
- Workload constraints
- Storage
- Node groups
- Availability zones

---

## 57. Horizontal Pod Autoscaler

The Horizontal Pod Autoscaler changes the number of workload replicas.

```text
CPU / Memory / Custom Metrics
            |
            v
           HPA
            |
            v
Replica Count
```

Example:

```text
3 Pods
  |
High Load
  |
  v
6 Pods
```

---

## 58. Vertical Pod Autoscaling

Vertical Pod Autoscaling can recommend or adjust resource requests/limits depending on configuration and operational model.

Conceptually:

```text
Observed Usage
      |
      v
VPA
      |
      v
Recommended / Adjusted Resources
```

It should be evaluated carefully for applications because resource changes can require Pod replacement.

---

## 59. Cluster Capacity Planning

Capacity planning considers:

```text
CPU
Memory
Storage
Network
Pod Density
Failure Capacity
Growth
System Reservations
```

A production cluster should maintain sufficient spare capacity to handle expected failures and bursts.

---

## 60. Cluster Upgrades

A Kubernetes upgrade should be planned carefully.

Typical sequence:

```text
Review Compatibility
      |
      v
Read Release Notes
      |
      v
Backup Critical State
      |
      v
Test in Non-Production
      |
      v
Upgrade Control Plane
      |
      v
Upgrade Worker Nodes
      |
      v
Validate Workloads
      |
      v
Monitor
```

The exact upgrade procedure depends on the Kubernetes distribution.

---

## 61. Version Skew

Kubernetes components have supported version-skew rules.

Examples of components to consider:

```text
API Server
kubelet
kubectl
Controller Manager
Scheduler
Cloud Components
CSI / CNI Components
```

Do not upgrade components arbitrarily. Follow the version-skew and distribution documentation.

---

## 62. Cluster Backup

A production backup strategy should consider at least:

```text
Kubernetes Control-Plane State
Persistent Application Data
Cluster Configuration
Secrets
Application Configuration
```

Backing up etcd alone does not automatically constitute a complete application disaster-recovery strategy.

---

## 63. Disaster Recovery

A useful DR model is:

```text
Failure
  |
  v
Detect
  |
  v
Assess
  |
  v
Recover Control Plane
  |
  v
Recover Storage
  |
  v
Recover Applications
  |
  v
Validate
  |
  v
Resume Operations
```

Recovery procedures should be tested regularly.

---

## 64. Monitoring a Cluster

Monitor at multiple layers.

### Control Plane

```text
API Server
Scheduler
Controllers
etcd
```

### Nodes

```text
CPU
Memory
Disk
Network
Pressure Conditions
```

### Workloads

```text
Pod Restarts
Readiness
Liveness
Latency
Errors
Throughput
```

### Kubernetes Resources

```text
Pending Pods
Failed Jobs
PVC Problems
Deployment Availability
Node Health
```

---

## 65. Logging

A production logging architecture commonly looks like:

```text
Application Containers
       |
       v
Node / Log Agent
       |
       v
Central Logging System
       |
       v
Search / Dashboards / Alerts
```

Common logging agents include:

```text
Fluent Bit
Fluentd
Vector
OpenTelemetry-based pipelines
```

The exact architecture depends on the organization's platform.

---

## 66. Metrics

A common metrics architecture is:

```text
Kubernetes / Applications
          |
          v
Metrics Collection
          |
          v
Prometheus-compatible System
          |
          v
Dashboards / Alerts
```

Common Kubernetes observability components include:

```text
Prometheus
Grafana
OpenTelemetry
Metrics Server
```

These solve different parts of the observability problem.

---

## 67. Cluster Observability

A mature observability model includes:

```text
Metrics
Logs
Traces
Events
Profiles (where needed)
```

Conceptually:

```text
                  Observability
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Metrics        Logs        Traces
          |            |            |
          +------------+------------+
                       |
                       v
                 Troubleshooting
```

---

## 68. Cluster Troubleshooting

A useful troubleshooting hierarchy is:

```text
Cluster
 |
 +-- Control Plane
 |
 +-- Nodes
 |
 +-- Networking
 |
 +-- Storage
 |
 +-- Workloads
 |
 +-- Application
```

Start broad and narrow down.

---

## 69. Basic Cluster Commands

```bash
kubectl cluster-info
kubectl version
kubectl get nodes
kubectl get nodes -o wide
kubectl get namespaces
kubectl get pods -A
kubectl get events -A
```

---

## 70. Inspect a Node

```bash
kubectl describe node <node-name>
```

Look for:

```text
Conditions
Capacity
Allocatable
Allocated Resources
Taints
Labels
Events
Pods
```

---

## 71. Check Node Utilization

If Metrics Server is available:

```bash
kubectl top nodes
```

Example:

```text
NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
worker-1   500m         25%    2Gi             40%
worker-2   700m         35%    3Gi             60%
```

Metrics availability depends on cluster configuration.

---

## 72. Check Pod Utilization

If Metrics Server is available:

```bash
kubectl top pods -A
```

This is useful for identifying workloads consuming significant resources.

---

## 73. Cluster Events

Events can reveal:

```text
Scheduling Failures
Image Pull Failures
Mount Failures
Node Problems
Evictions
```

Command:

```bash
kubectl get events -A
```

---

## 74. Pod Eviction

Kubernetes can evict Pods under certain node pressure or operational conditions.

Common causes can include:

```text
Memory Pressure
Disk Pressure
Node Maintenance
Resource Pressure
```

The exact behavior depends on QoS, priorities, disruption rules, and node conditions.

---

## 75. Quality of Service Classes

Kubernetes assigns Pods a QoS class based on their resource configuration.

Common classes:

```text
Guaranteed
Burstable
BestEffort
```

Resource configuration therefore affects more than scheduling; it can also influence behavior under resource pressure.

---

## 76. Pod Priority

Pods can have priorities.

Higher-priority workloads can receive preferential scheduling behavior and can influence preemption when enabled and appropriate.

Conceptually:

```text
High Priority Pod
       |
       v
Scheduler
       |
       v
Prefer Suitable Capacity
```

---

## 77. PodDisruptionBudget

A PodDisruptionBudget (PDB) can help maintain application availability during voluntary disruptions.

Example concept:

```text
Application
replicas = 5

PDB:
minimum available = 4
```

This helps protect against too many voluntary disruptions at once.

A PDB does not protect against every type of failure, including arbitrary node or infrastructure failures.

---

## 78. Cluster Reliability

Reliable clusters generally require:

```text
HA Control Plane
Multiple Worker Nodes
Failure-Domain Awareness
Pod Replication
Health Probes
Resource Planning
Backups
Monitoring
Disaster Recovery
Security
```

---

## 79. Cluster Security Checklist

```text
[ ] Secure API server access
[ ] Use strong authentication
[ ] Apply RBAC least privilege
[ ] Protect etcd
[ ] Encrypt sensitive data where required
[ ] Protect Secrets
[ ] Use dedicated ServiceAccounts
[ ] Apply Pod security controls
[ ] Use NetworkPolicies where appropriate
[ ] Scan container images
[ ] Keep components patched
[ ] Restrict privileged workloads
[ ] Monitor audit/security events
[ ] Secure node access
[ ] Protect kubeconfig files
```

---

## 80. Production Cluster Design

A simplified production architecture:

```text
                         Users / Systems
                                |
                                v
                       External Load Balancer
                                |
                                v
                     Kubernetes API / Gateway
                                |
                +---------------+---------------+
                |                               |
                v                               v
          Control Plane                     Worker Pool
          +----------+                  +------+------+------+
          | API      |                  | Node | Node | Node |
          | Scheduler|                  +------+------+------+
          | Controllers|                       |
          | etcd      |                        v
          +----------+                      Pods
                |
                v
        Cluster State
```

For real production systems, networking, storage, security, and observability add additional components.

---

## 81. Multi-Zone Cluster

A resilient cluster can distribute nodes across failure zones.

```text
                 Region
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
    Zone A       Zone B       Zone C
       |           |           |
     Nodes       Nodes       Nodes
       |           |           |
     Pods        Pods        Pods
```

Workload topology constraints and storage design should align with this architecture.

---

## 82. Workload Distribution

Suppose:

```text
Deployment replicas = 6
```

A resilient design might distribute them:

```text
Zone A -> 2 Pods
Zone B -> 2 Pods
Zone C -> 2 Pods
```

This reduces the impact of a zone failure.

---

## 83. Cluster vs Namespace

A cluster is the larger isolation and management boundary.

```text
Cluster
 |
 +-- Namespace A
 |     +-- Pods
 |     +-- Services
 |
 +-- Namespace B
       +-- Pods
       +-- Services
```

Namespaces are logical partitions inside a cluster.

---

## 84. Cluster vs Node

A cluster contains multiple nodes.

```text
Cluster
 |
 +-- Node 1
 |    +-- Pods
 |
 +-- Node 2
 |    +-- Pods
 |
 +-- Node 3
      +-- Pods
```

A node is compute capacity within the cluster.

---

## 85. Cluster vs Pod

```text
Cluster
 |
 +-- Node
      |
      +-- Pod
           |
           +-- Container
```

Think of the hierarchy as:

```text
Cluster
  -> Node
      -> Pod
          -> Container
```

---

## 86. Cluster Lifecycle

A simplified cluster lifecycle is:

```text
Provision Infrastructure
        |
        v
Install / Bootstrap Kubernetes
        |
        v
Configure Networking
        |
        v
Configure Storage
        |
        v
Configure Security
        |
        v
Deploy Workloads
        |
        v
Monitor
        |
        v
Scale
        |
        v
Upgrade
        |
        v
Backup / Recover
```

---

## 87. Kubernetes Cluster and CI/CD

A typical delivery architecture:

```text
Developer
    |
    v
Git
    |
    v
CI Pipeline
    |
    +-- Test
    +-- Build
    +-- Scan
    +-- Publish Image
    |
    v
Registry
    |
    v
GitOps / CD
    |
    v
Kubernetes API
    |
    v
Cluster
```

The cluster should generally consume tested, controlled artifacts rather than building application code itself.

---

## 88. GitOps Cluster Model

GitOps treats Git as a source of desired configuration.

```text
Git
 |
 v
Desired Kubernetes State
 |
 v
GitOps Controller
 |
 v
Kubernetes API
 |
 v
Cluster
 |
 v
Actual State
 |
 v
Reconciliation
```

This aligns naturally with Kubernetes' declarative model.

---

## 89. Cluster Upgrade Checklist

Before an upgrade:

```text
[ ] Read Kubernetes release notes
[ ] Check version-skew requirements
[ ] Check CNI compatibility
[ ] Check CSI compatibility
[ ] Check Ingress/Gateway compatibility
[ ] Check admission policies
[ ] Check operators
[ ] Check Helm charts
[ ] Back up critical state
[ ] Test upgrade in non-production
[ ] Review PodDisruptionBudgets
[ ] Verify capacity
[ ] Define rollback/recovery plan
```

After upgrade:

```text
[ ] API server healthy
[ ] Nodes Ready
[ ] Core DNS healthy
[ ] CNI healthy
[ ] CSI healthy
[ ] Workloads healthy
[ ] Ingress/Gateway healthy
[ ] Monitoring healthy
[ ] Logs flowing
[ ] Alerts normal
```

---

## 90. Common Cluster Problems

### API Server Unavailable

Possible causes:

```text
Control Plane Failure
Load Balancer Failure
Network Failure
Certificate Problem
Resource Exhaustion
```

Investigate control-plane health and API endpoint connectivity.

### Nodes Not Ready

Possible causes:

```text
kubelet failure
Container runtime failure
Network problem
Disk pressure
Memory pressure
Certificate problem
```

Use:

```bash
kubectl get nodes
kubectl describe node <node>
```

### Pods Stuck Pending

Possible causes:

```text
Insufficient Capacity
Taints
Affinity Rules
Unbound PVC
Topology Constraints
Scheduling Policies
```

Use:

```bash
kubectl describe pod <pod>
```

### Services Not Reachable

Check:

```text
Service
Selector
EndpointSlices
Pod Readiness
NetworkPolicy
DNS
Ingress / Gateway
CNI
```

---

## 91. Common Anti-Patterns

### Running Everything on One Node

Bad:

```text
Node A
 |
 +-- All critical workloads
```

A single node failure can affect the entire application.

Prefer multiple nodes and failure-domain distribution.

---

### No Capacity Headroom

If every node is operating at maximum capacity:

```text
Node Failure
   |
   v
No Space for Replacement Pods
```

Maintain appropriate spare capacity.

---

### Ignoring Failure Domains

Do not place all replicas in one zone if the application requires zone-level resilience.

---

### Treating a Cluster as Automatically Highly Available

Multiple nodes alone do not guarantee HA.

You must consider:

```text
Control Plane
etcd
Worker Nodes
Storage
Networking
Load Balancers
Applications
External Dependencies
```

---

### No Backup Testing

A backup that has never been restored is not a proven recovery strategy.

Test restore procedures.

---

### Giving Broad Cluster-Admin Access

Avoid:

```text
Everyone -> cluster-admin
```

Prefer least-privilege RBAC.

---

### Ignoring Resource Requests

Without requests, scheduling and capacity planning become less predictable.

---

### Ignoring Observability

A production cluster without metrics, logs, events, and alerts is difficult to operate safely.

---

## 92. Cluster Administration Commands

### Nodes

```bash
kubectl get nodes
kubectl get nodes -o wide
kubectl describe node <node>
kubectl label node <node> key=value
kubectl taint nodes <node> key=value:NoSchedule
```

### Maintenance

```bash
kubectl cordon <node>
kubectl drain <node>
kubectl uncordon <node>
```

### Cluster

```bash
kubectl cluster-info
kubectl get namespaces
kubectl get events -A
```

### Resource Usage

```bash
kubectl top nodes
kubectl top pods -A
```

Metrics commands require appropriate metrics support.

---

## 93. Useful Node Queries

List nodes:

```bash
kubectl get nodes
```

With labels:

```bash
kubectl get nodes --show-labels
```

Specific label:

```bash
kubectl get nodes -l workload=compute
```

Wide output:

```bash
kubectl get nodes -o wide
```

---

## 94. Useful Namespace Queries

List namespaces:

```bash
kubectl get namespaces
```

Pods in namespace:

```bash
kubectl get pods -n production
```

Services:

```bash
kubectl get svc -n production
```

Deployments:

```bash
kubectl get deployments -n production
```

---

## 95. Cluster Troubleshooting Flow

Use this mental model:

```text
Is the API reachable?
        |
        v
Are control-plane components healthy?
        |
        v
Are nodes Ready?
        |
        v
Is networking healthy?
        |
        v
Is storage healthy?
        |
        v
Are Pods scheduled?
        |
        v
Are Pods Ready?
        |
        v
Are Services exposing endpoints?
        |
        v
Is Ingress/Gateway routing?
        |
        v
Is the application healthy?
```

---

## 96. Production Readiness Checklist

### Cluster

```text
[ ] HA control plane where required
[ ] HA etcd where required
[ ] Multiple worker nodes
[ ] Failure-domain distribution
[ ] Capacity headroom
[ ] Tested upgrade process
```

### Networking

```text
[ ] CNI selected and supported
[ ] Cluster DNS healthy
[ ] Service networking tested
[ ] Ingress/Gateway configured
[ ] NetworkPolicies evaluated
```

### Storage

```text
[ ] CSI validated
[ ] StorageClasses defined
[ ] Backup strategy
[ ] Restore strategy
[ ] Failure-domain considerations
```

### Security

```text
[ ] RBAC
[ ] ServiceAccounts
[ ] Secrets protection
[ ] Pod security
[ ] NetworkPolicies
[ ] Image scanning
[ ] Node access security
```

### Observability

```text
[ ] Metrics
[ ] Logs
[ ] Events
[ ] Alerts
[ ] Dashboards
[ ] Audit/security visibility
```

### Disaster Recovery

```text
[ ] Control-plane backup
[ ] Application-data backup
[ ] Restore procedure
[ ] Recovery objectives
[ ] Regular DR testing
```

---

## 97. Interview Questions

### Beginner

**What is a Kubernetes cluster?**

A Kubernetes cluster is a group of control-plane and worker-node components that collectively manage and run containerized workloads.

**What is the control plane?**

The set of components responsible for managing cluster state, scheduling, APIs, and controllers.

**What is a worker node?**

A machine that provides compute capacity for running Kubernetes Pods.

**What is etcd?**

The consistent key-value data store used for Kubernetes cluster state.

**What does kubelet do?**

The kubelet is the node agent responsible for ensuring assigned Pods are running according to their specifications.

---

### Intermediate

**What happens when a Pod is created?**

A simplified flow is:

```text
API Request
   |
   v
API Server
   |
   v
Object Stored
   |
   v
Scheduler
   |
   v
Node Assignment
   |
   v
kubelet
   |
   v
Container Runtime
   |
   v
Container
```

**What is the difference between capacity and allocatable?**

Capacity represents total node resources recognized by Kubernetes; allocatable is the portion made available for Pods after reservations and system requirements.

**What is cordon?**

It marks a node unschedulable so new Pods are not placed there.

**What is drain?**

It evicts eligible workloads from a node so the node can be maintained.

**Why are etcd backups important?**

Because etcd contains critical Kubernetes control-plane state.

**Why use multiple worker nodes?**

To improve workload availability, provide capacity, and reduce the impact of individual node failures.

---

### Advanced

**Why does Kubernetes need a scheduler?**

Because Pods need to be assigned to suitable nodes based on resources and scheduling constraints.

**What happens when a worker node fails?**

Kubernetes detects node health changes and workload controllers can work to recreate controller-managed Pods on suitable nodes, subject to storage, topology, scheduling, and application constraints.

**Why is etcd quorum important?**

Distributed consensus requires a majority to continue safely. Losing quorum can prevent normal state changes.

**How many etcd members are needed for a 3-member cluster to maintain quorum?**

Two.

**Why are odd-sized etcd clusters common?**

They maximize failure tolerance without unnecessarily increasing the number of members.

**Does multiple worker nodes automatically mean high availability?**

No. HA also requires appropriate control-plane, storage, networking, application, and failure-domain design.

**What is the difference between a cluster and a namespace?**

A cluster is the overall Kubernetes environment; a namespace is a logical scope inside the cluster.

**What is the difference between a node and a Pod?**

A node is compute infrastructure; a Pod is a Kubernetes workload execution unit scheduled onto a node.

---

## 98. Key Relationships

### Cluster

```text
Cluster
 |
 +-- Control Plane
 |
 +-- Worker Nodes
```

### Control Plane

```text
Control Plane
 |
 +-- API Server
 +-- etcd
 +-- Scheduler
 +-- Controllers
 +-- Cloud Controller (when used)
```

### Worker Node

```text
Worker Node
 |
 +-- kubelet
 +-- Container Runtime
 +-- kube-proxy / Networking
 +-- Pods
```

### Workload

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

### Networking

```text
Ingress / Gateway
 |
 v
Service
 |
 v
Pods
```

### Storage

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

---

## 99. Complete Cluster Mental Model

```text
                         KUBERNETES CLUSTER
                                  |
              +-------------------+-------------------+
              |                                       |
              v                                       v
        CONTROL PLANE                            WORKER NODES
              |                                       |
      +-------+--------+                    +---------+---------+
      |       |        |                    |         |         |
      v       v        v                    v         v         v
 API Server  etcd  Scheduler              Node 1    Node 2    Node 3
      |                                      |         |         |
      v                                      +---------+---------+
 Controllers                                          |
      |                                                v
      v                                               Pods
 Desired State                                          |
      |                                                  v
      +---------------- Reconciliation ---------> Containers
                                                       |
                                                       +-- Volumes
                                                       +-- Config
                                                       +-- Secrets
                                                       +-- Probes
```

---

## 100. Final Key Takeaways

```text
1. A Kubernetes cluster is the complete environment for managing workloads.

2. The cluster consists primarily of a control plane and worker nodes.

3. The control plane manages cluster state.

4. Worker nodes provide workload compute capacity.

5. The API server is the primary API entry point.

6. etcd stores critical Kubernetes cluster state.

7. The scheduler assigns unscheduled Pods to suitable nodes.

8. Controllers continuously reconcile desired and actual state.

9. kubelet manages Pods on worker nodes.

10. The container runtime executes containers.

11. kube-proxy is commonly associated with Service networking, but modern networking implementations can replace it.

12. Nodes expose capacity and allocatable resources.

13. Resource requests influence scheduling.

14. Labels and affinity influence placement.

15. Taints restrict scheduling.

16. Tolerations allow Pods to tolerate matching taints.

17. Pod anti-affinity can distribute replicas.

18. Topology constraints can improve failure-domain resilience.

19. Cordon prevents new scheduling on a node.

20. Drain prepares a node for maintenance by evicting eligible workloads.

21. Uncordon allows scheduling again.

22. Multiple control-plane nodes can improve control-plane availability.

23. etcd requires quorum in an HA deployment.

24. Multiple worker nodes reduce the impact of individual node failures.

25. Multiple nodes alone do not guarantee application HA.

26. Storage must be designed for availability and recovery.

27. Networking must support Pod, Service, and external traffic requirements.

28. Cluster DNS provides service discovery.

29. Namespaces provide logical organization and scoping.

30. ResourceQuota and LimitRange help manage namespace resources.

31. HPA scales workload replicas.

32. Cluster autoscaling can change worker-node capacity.

33. Cluster upgrades must follow supported version-skew rules.

34. Backups must include both control-plane state and application data as appropriate.

35. Disaster recovery must be tested, not merely documented.

36. Monitoring should cover control plane, nodes, workloads, networking, and storage.

37. Logs, metrics, events, and traces provide complementary observability.

38. Security must cover identity, authorization, admission, workloads, networking, images, and nodes.

39. Kubernetes clusters should maintain capacity headroom.

40. The central cluster mental model is:

    Desired State
          |
          v
    Kubernetes API
          |
          v
    Controllers / Scheduler
          |
          v
    Worker Nodes
          |
          v
    Pods
          |
          v
    Containers
          |
          v
    Actual State
          |
          +------> Reconciliation
```

---

## 101. Quick Reference

### Cluster

```bash
kubectl cluster-info
kubectl version
kubectl get namespaces
kubectl get events -A
```

### Nodes

```bash
kubectl get nodes
kubectl get nodes -o wide
kubectl get nodes --show-labels
kubectl describe node <node>
kubectl top nodes
```

### Maintenance

```bash
kubectl cordon <node>
kubectl drain <node>
kubectl uncordon <node>
```

### Scheduling

```bash
kubectl get nodes --show-labels
kubectl get nodes -l workload=compute
```

### Workloads

```bash
kubectl get pods -A
kubectl get deployments -A
kubectl get daemonsets -A
kubectl get statefulsets -A
kubectl get jobs -A
kubectl get cronjobs -A
```

### Networking

```bash
kubectl get svc -A
kubectl get ingress -A
kubectl get endpointslices -A
```

### Storage

```bash
kubectl get pv
kubectl get pvc -A
kubectl get storageclass
```

### Troubleshooting

```bash
kubectl get events -A
kubectl describe node <node>
kubectl describe pod <pod> -n <namespace>
kubectl top nodes
kubectl top pods -A
```

---

> **Core Kubernetes cluster principle:** The control plane maintains the desired state of the cluster, while worker nodes provide the compute environment in which Pods run. The scheduler, controllers, kubelet, networking, storage, and supporting components continuously work together to keep the cluster operating toward that desired state.
