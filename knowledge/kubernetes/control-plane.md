# Kubernetes Control Plane

> The Kubernetes control plane is the management layer of a Kubernetes cluster. It exposes the Kubernetes API, stores cluster state, schedules workloads, and runs controllers that continuously reconcile the desired state with the actual state.

---

## 1. What Is the Kubernetes Control Plane?

The control plane is responsible for making cluster-wide decisions and maintaining the desired state of the Kubernetes cluster.

At a high level:

```text
                    Kubernetes Cluster
                           |
             +-------------+-------------+
             |                           |
             v                           v
       CONTROL PLANE                WORKER NODES
             |                           |
      +------+-------+                   |
      |      |       |                   v
      v      v       v                  Pods
 API Server etcd  Scheduler
      |
      v
 Controllers
```

The control plane generally does **not** run the application workload itself in a typical production architecture. Worker nodes provide the compute capacity for application Pods.

---

# 2. Responsibilities of the Control Plane

The control plane performs several critical functions:

```text
API Management
Cluster State Management
Workload Scheduling
Controller Reconciliation
Node Management
Resource Management
Admission and Authorization
Cluster Coordination
```

The major components are:

```text
kube-apiserver
etcd
kube-scheduler
kube-controller-manager
cloud-controller-manager (when used)
```

---

# 3. Control Plane Architecture

A simplified architecture is:

```text
                         CONTROL PLANE
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
        kube-apiserver      etcd         kube-scheduler
             |
             v
    kube-controller-manager
             |
             v
   cloud-controller-manager
       (when applicable)
```

Worker nodes communicate with the control plane primarily through the Kubernetes API.

---

# 4. The Kubernetes API Server

The `kube-apiserver` is the central API component.

It acts as the front door to the Kubernetes control plane.

Clients and components communicate with Kubernetes through the API server:

```text
kubectl
   |
CI/CD
   |
GitOps Controller
   |
Operators
   |
Scheduler
   |
Controllers
   |
   v
kube-apiserver
```

The API server handles API requests and coordinates access to Kubernetes resources.

---

# 5. Why the API Server Is Important

The API server provides a common interface for:

```text
Users
Controllers
Schedulers
Operators
Automation
Kubernetes Components
```

Instead of components directly modifying each other's internal state, they interact through the Kubernetes API.

This creates a loosely coupled architecture.

---

# 6. API Server Request Flow

A simplified request flow is:

```text
Client
  |
  v
Authentication
  |
  v
Authorization
  |
  v
Admission
  |
  v
Validation
  |
  v
API Processing
  |
  v
etcd / Internal Processing
  |
  v
API Response
```

Not every request follows exactly the same internal path, but this is a useful conceptual model.

---

# 7. Authentication

Authentication answers:

```text
Who is making this request?
```

Possible identities include:

```text
Human User
ServiceAccount
Cloud Identity
OIDC Identity
CI/CD System
Other Authentication Providers
```

Example:

```text
Developer
   |
   v
kubectl
   |
   v
API Server
   |
   v
Authentication
```

---

# 8. Authorization

Authorization answers:

```text
What is this identity allowed to do?
```

A common mechanism is RBAC.

Example:

```text
Developer
    |
    v
Role
    |
    +-- get pods
    +-- list pods
    |
    v
Namespace: development
```

A user may be authenticated successfully but still be denied because they lack the required permission.

---

# 9. Admission Control

Admission control evaluates API requests after authentication and authorization and before the object is accepted.

Admission can:

```text
Validate
Mutate
Enforce Policies
Apply Security Rules
```

Conceptually:

```text
Request
   |
   v
Authentication
   |
   v
Authorization
   |
   v
Admission
   |
   v
API Object Accepted / Rejected
```

---

# 10. Validation

Kubernetes validates resource objects against the API schema and resource-specific rules.

For example:

```yaml
apiVersion: apps/v1
kind: Deployment
```

must contain fields that are valid for the `apps/v1` Deployment API.

Invalid requests are rejected.

---

# 11. API Resources

The API server exposes Kubernetes resources such as:

```text
Pods
Deployments
Services
Nodes
Namespaces
ConfigMaps
Secrets
Jobs
StatefulSets
DaemonSets
PersistentVolumes
PersistentVolumeClaims
```

Resources are organized into API groups and versions.

Examples:

```text
v1
apps/v1
batch/v1
networking.k8s.io/v1
```

---

# 12. API Groups

Kubernetes APIs are organized into groups.

Examples:

```text
Core API
apps
batch
networking.k8s.io
rbac.authorization.k8s.io
storage.k8s.io
policy
```

This organization allows Kubernetes to evolve APIs independently.

---

# 13. API Versioning

API versions commonly include:

```text
alpha
beta
stable / generally available
```

Conceptually:

```text
v1alpha1
    |
    v
v1beta1
    |
    v
v1
```

The exact lifecycle depends on the specific API.

Production workloads should prefer stable APIs whenever practical.

---

# 14. etcd

`etcd` is the distributed key-value store used by Kubernetes to persist cluster state.

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
```

The API server is the normal interface through which Kubernetes interacts with persisted state.

---

# 15. What Does etcd Store?

Conceptually, etcd stores information required to reconstruct Kubernetes cluster state.

Examples include:

```text
Pod Objects
Deployment Objects
Service Objects
Namespace Objects
Secret Objects
ConfigMap Objects
Node Objects
RBAC Objects
Custom Resources
```

It is not intended to be the application's general-purpose database.

---

# 16. Why etcd Is Critical

If etcd state is lost or corrupted, Kubernetes may lose critical control-plane information.

Therefore production environments should implement:

```text
Backups
Encryption
Access Control
Monitoring
Restore Testing
Disaster Recovery
```

---

# 17. etcd Consistency

etcd is designed for strongly consistent distributed state management.

In an HA deployment, etcd members use consensus to maintain consistent state.

A simplified model:

```text
Client Request
     |
     v
etcd Cluster
   /   |   \
  v    v    v
Member Member Member
   \    |    /
    \   |   /
     Consensus
```

---

# 18. etcd Quorum

For an odd number of etcd members:

```text
3 members -> quorum = 2
5 members -> quorum = 3
7 members -> quorum = 4
```

Formula:

```text
quorum = floor(N / 2) + 1
```

Without quorum, normal consensus-based writes cannot continue safely.

---

# 19. Why Odd-Sized etcd Clusters?

Odd-sized clusters provide efficient failure tolerance.

Example:

```text
3 members
 -> tolerate 1 failure

5 members
 -> tolerate 2 failures

7 members
 -> tolerate 3 failures
```

Adding members increases operational overhead, so larger clusters are not automatically better.

---

# 20. etcd Backup

A production backup strategy should include etcd snapshots where appropriate.

A conceptual workflow:

```text
etcd
 |
 v
Snapshot
 |
 v
Secure Backup Storage
 |
 v
Test Restore
 |
 v
Disaster Recovery
```

Backups should be:

```text
Encrypted
Access Controlled
Versioned
Stored Safely
Tested
```

---

# 21. kube-scheduler

The scheduler assigns unscheduled Pods to appropriate nodes.

Architecture:

```text
Unscheduled Pod
       |
       v
kube-scheduler
       |
       +-- Resource Requests
       +-- Node Constraints
       +-- Affinity
       +-- Anti-Affinity
       +-- Taints
       +-- Tolerations
       +-- Topology
       |
       v
Selected Node
```

---

# 22. Scheduler Does Not Start Containers

An important distinction:

```text
Scheduler
    |
    +-- Selects Node
```

It does not normally:

```text
Create Container
Start Container
```

After scheduling:

```text
Scheduler
   |
   v
Pod Assigned to Node
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

# 23. Scheduler Workflow

A simplified scheduling flow:

```text
Pod Created
    |
    v
Pod Has No Node
    |
    v
Scheduler Watches
    |
    v
Filter Candidate Nodes
    |
    v
Score / Select Suitable Node
    |
    v
Bind Pod to Node
    |
    v
kubelet Runs Pod
```

The exact internal scheduler framework is more sophisticated than this simplified model.

---

# 24. Scheduling Constraints

The scheduler considers information such as:

```text
CPU Requests
Memory Requests
Node Selector
Node Affinity
Pod Affinity
Pod Anti-Affinity
Taints
Tolerations
Topology Constraints
Priority
```

---

# 25. kube-controller-manager

The controller manager runs Kubernetes controllers.

Controllers are reconciliation loops.

Conceptually:

```text
Desired State
     |
     v
Controller
     |
     v
Observe Actual State
     |
     v
Compare
     |
     v
Take Action
     |
     +----------> Observe Again
```

---

# 26. Examples of Controllers

Controllers are responsible for different resource-management tasks.

Examples include:

```text
Deployment-related reconciliation
ReplicaSet
Node
Job
Namespace
Service / Endpoint-related behavior
PersistentVolume
```

The exact controller set depends on Kubernetes version and configuration.

---

# 27. Deployment Controller

A Deployment manages the desired state of application rollouts.

Conceptually:

```text
Deployment
    |
    v
ReplicaSet
    |
    v
Pods
```

When the Deployment changes:

```text
Deployment
    |
    v
New ReplicaSet
    |
    v
New Pods
```

The controller manages the transition.

---

# 28. ReplicaSet Controller

A ReplicaSet maintains the desired number of matching Pods.

Example:

```yaml
replicas: 3
```

If only two matching Pods exist:

```text
Desired = 3
Actual  = 2
```

The controller creates another Pod.

---

# 29. Node Controller

The node controller monitors node health and participates in handling node lifecycle conditions.

Conceptually:

```text
Node
 |
 v
Node Controller
 |
 +-- Healthy
 |
 +-- Unhealthy
 |
 +-- Unreachable
```

Node failure handling involves several Kubernetes components and workload controllers.

---

# 30. Job Controller

The Job controller manages workloads that should complete.

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
Success / Failure
```

The controller ensures the required completion behavior is achieved.

---

# 31. Namespace Controller

The namespace controller handles namespace lifecycle and related cleanup.

Conceptually:

```text
Namespace
 |
 v
Namespace Controller
 |
 v
Lifecycle / Cleanup
```

---

# 32. Cloud Controller Manager

The cloud controller manager is used when Kubernetes integrates with cloud-provider functionality.

Possible responsibilities include:

```text
Node Cloud Integration
Load Balancer Integration
Cloud Routes
Cloud Provider Metadata
```

---

# 33. Control Plane and Worker Nodes

The overall relationship is:

```text
                     CONTROL PLANE
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
     API Server        Scheduler       Controllers
          |
          v
         etcd
          |
          +-------------------------------+
                                          |
                                          v
                                   WORKER NODES
                                          |
                                  +-------+-------+
                                  |       |       |
                                  v       v       v
                                Node    Node    Node
                                  |       |       |
                                  v       v       v
                                Pods    Pods    Pods
```

---

# 34. How a Pod Gets Created

Suppose a user runs:

```bash
kubectl apply -f deployment.yaml
```

A simplified flow is:

```text
kubectl
   |
   v
API Server
   |
   v
Authentication
   |
   v
Authorization
   |
   v
Admission
   |
   v
Deployment Object
   |
   v
etcd
   |
   v
Deployment Controller
   |
   v
ReplicaSet
   |
   v
Pod
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

---

# 35. How Kubernetes Detects Failure

Suppose:

```text
Desired Pods = 3
Running Pods = 2
```

The controller observes the difference.

```text
Desired = 3
Actual  = 2
    |
    v
Controller
    |
    v
Create Replacement
```

Eventually:

```text
Desired = 3
Actual  = 3
```

---

# 36. Control Plane Reconciliation

The control plane is constantly processing changes.

```text
Watch Resources
      |
      v
Observe State
      |
      v
Compare Desired / Actual
      |
      v
Take Action
      |
      v
Update State
      |
      +----------> Watch Again
```

This is why Kubernetes is often described as a collection of control loops.

---

# 37. Watches

Kubernetes components often watch API resources for changes.

Conceptually:

```text
API Server
    |
    +---- Event ----> Controller
    |
    +---- Event ----> Scheduler
    |
    +---- Event ----> Other Components
```

This allows components to react to changes instead of continuously polling every object.

---

# 38. Kubernetes Events vs Watches

These are different concepts.

### Watch

A mechanism used by clients/components to observe API resource changes.

### Event

A Kubernetes resource used to record noteworthy occurrences.

Example:

```text
Watch:
"Deployment changed"

Event:
"Failed to pull image"
```

---

# 39. API Server as the Coordination Point

A useful mental model is:

```text
                    API Server
                  /     |      \
                 /      |       \
                v       v        v
          Scheduler  Controllers  Users
                \       |        /
                 \      |       /
                  \     |      /
                       etcd
```

Most control-plane interactions are coordinated through the API server.

---

# 40. Control Plane Security

The control plane is a highly sensitive part of the cluster.

Protect:

```text
API Server
etcd
Control Plane Nodes
Kubeconfigs
Certificates
Service Account Credentials
Administrative Access
```

Use:

```text
Least Privilege
Strong Authentication
RBAC
Network Restrictions
Encryption
Audit Logging
Patching
Monitoring
```

---

# 41. API Server Security

Important controls include:

```text
Authentication
Authorization
Admission
TLS
Audit Logging
Network Access Control
Rate / Resource Protection
```

The API server should not be unnecessarily exposed to untrusted networks.

---

# 42. etcd Security

etcd requires particularly strong protection because it contains cluster state.

Consider:

```text
TLS
Encryption at Rest
Network Isolation
Authentication
Authorization
Backups
Access Monitoring
```

---

# 43. Control Plane Certificates

Kubernetes commonly uses TLS certificates for secure component communication.

Certificates may be involved in communication between:

```text
kubectl <-> API Server
kubelet <-> API Server
API Server <-> etcd
Control Plane Components
```

Certificate management depends on the cluster distribution and bootstrap method.

---

# 44. Control Plane High Availability

A production HA control plane commonly has multiple control-plane nodes.

Example:

```text
                   API Load Balancer
                          |
             +------------+------------+
             |            |            |
             v            v            v
          CP-1         CP-2         CP-3
             |            |            |
             +------------+------------+
                          |
                     etcd Cluster
```

The exact topology depends on whether etcd is colocated or externally managed.

---

# 45. API Server HA

Multiple API server instances can provide availability:

```text
Clients
   |
   v
Load Balancer
   |
   +-- API Server 1
   +-- API Server 2
   +-- API Server 3
```

If one API server becomes unavailable, traffic can be routed to another healthy instance.

---

# 46. Scheduler HA

Multiple scheduler instances can be configured for high availability.

Typically, scheduler instances coordinate so that only the active scheduler performs scheduling work at a given time.

Conceptually:

```text
Scheduler 1 -- Active
Scheduler 2 -- Standby
Scheduler 3 -- Standby
```

The exact leader-election behavior depends on configuration and Kubernetes version.

---

# 47. Controller Manager HA

Similarly, multiple controller-manager instances can be deployed for high availability with leader election.

Conceptually:

```text
Controller Manager 1 -- Active
Controller Manager 2 -- Standby
Controller Manager 3 -- Standby
```

This allows another instance to take over if the active instance fails.

---

# 48. Leader Election

Leader election prevents multiple instances of components that require a single active leader from performing duplicate control actions simultaneously.

Conceptually:

```text
Component Instances
        |
        v
Leader Election
        |
        +-- Leader
        |
        +-- Followers
```

If the leader fails:

```text
Leader Failure
      |
      v
Election
      |
      v
New Leader
```

---

# 49. Control Plane Failure Scenarios

## API Server Failure

```text
API Server 1 -> Failed
API Server 2 -> Available
API Server 3 -> Available
```

Existing workloads may continue running on worker nodes while control-plane API availability is degraded, but management and reconciliation capabilities can be affected.

---

## Scheduler Failure

If the scheduler is unavailable:

```text
Existing Pods -> Continue Running
New Unscheduled Pods -> May Remain Pending
```

When the scheduler returns, pending Pods can be scheduled.

---

## Controller Manager Failure

Existing Pods generally continue running.

However:

```text
Reconciliation -> Degraded
New Replacement Pods -> May Not Be Created
Some Controllers -> Not Processing
```

When a healthy controller-manager instance returns, reconciliation resumes.

---

## etcd Failure

etcd failure is particularly serious because cluster state persistence depends on it.

Without a healthy etcd quorum:

```text
Control Plane State Changes -> Can Fail
```

Existing containers may continue running temporarily, but cluster management and reconciliation can be severely affected.

---

# 50. What Happens if the Entire Control Plane Goes Down?

If the control plane becomes unavailable while worker nodes remain healthy:

```text
Existing Containers
       |
       v
May continue running
```

But many control-plane functions become unavailable:

```text
kubectl operations
Scheduling
Controller Reconciliation
API Requests
Scaling
Rollouts
```

The exact impact depends on which components are unavailable and for how long.

This is why control-plane HA is important for production clusters.

---

# 51. Control Plane and Self-Healing

Self-healing depends heavily on control-plane components.

Example:

```text
Pod Failure
    |
    v
Controller
    |
    v
Detect Difference
    |
    v
Create Replacement
    |
    v
Scheduler
    |
    v
Select Node
    |
    v
kubelet
    |
    v
Start Container
```

If the control plane is unavailable, this reconciliation process can be interrupted.

---

# 52. Control Plane and Scaling

Suppose an HPA changes:

```text
replicas: 3 -> 8
```

The flow is conceptually:

```text
Metrics
   |
   v
HPA
   |
   v
Deployment / ReplicaSet Desired State
   |
   v
Controller
   |
   v
New Pods
   |
   v
Scheduler
   |
   v
Worker Nodes
```

The control plane coordinates the scaling operation.

---

# 53. Control Plane and Rolling Updates

A Deployment update:

```text
api:1.0 -> api:2.0
```

can result in:

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
Readiness
     |
     v
Old ReplicaSet Scales Down
```

The control plane coordinates the desired state transitions.

---

# 54. Control Plane and Service Discovery

When workload membership changes:

```text
Pod Added
Pod Removed
Pod Becomes Ready
Pod Becomes Not Ready
```

Kubernetes updates relevant service discovery state.

This enables Services to route traffic toward appropriate backend endpoints.

---

# 55. Control Plane and Storage

The control plane manages storage resources such as:

```text
PersistentVolume
PersistentVolumeClaim
StorageClass
VolumeAttachment
```

Storage provisioning and attachment may involve external CSI controllers and node-side CSI components.

---

# 56. Control Plane and Custom Resources

Kubernetes is extensible.

Custom Resource Definitions (CRDs) allow new API resource types.

Example:

```text
Kubernetes API
      |
      +-- Deployment
      +-- Service
      +-- Pod
      |
      +-- Custom Resource
```

Operators can then watch custom resources and reconcile them.

---

# 57. Operators

An Operator extends the Kubernetes control-loop model.

Example:

```text
Custom Resource
      |
      v
Operator
      |
      v
Observe State
      |
      v
Take Action
      |
      v
Managed Application
```

Operators are commonly used for complex systems such as databases, messaging systems, and platform services.

---

# 58. Control Plane Extensibility

Kubernetes can be extended through:

```text
CRDs
Operators
Admission Webhooks
API Aggregation
Controllers
Schedulers / Scheduler Plugins
CSI
CNI
Cloud Integrations
```

This extensibility is one reason Kubernetes has a large ecosystem.

---

# 59. Admission Webhooks

Admission webhooks allow external services to participate in admission processing.

Conceptually:

```text
API Request
    |
    v
API Server
    |
    v
Admission Webhook
    |
    v
Allow / Deny / Modify
```

They can support policy and mutation use cases.

Production webhook design should consider:

```text
Availability
Timeouts
Failure Policy
Security
Latency
Circular Dependencies
```

---

# 60. Control Plane Observability

Monitor:

### API Server

```text
Request Rate
Latency
Errors
Availability
Resource Consumption
```

### etcd

```text
Health
Latency
Leader Status
Disk
Database Size
Network
```

### Scheduler

```text
Scheduling Rate
Scheduling Latency
Errors
Pending Pods
```

### Controllers

```text
Work Queue
Reconciliation Rate
Errors
Latency
```

---

# 61. Control Plane Logs

Control-plane logs are useful for diagnosing:

```text
Authentication Failures
Authorization Failures
Admission Problems
Scheduling Failures
Controller Errors
etcd Connectivity
Certificate Problems
Leader Election
```

The exact logging configuration depends on how the cluster is deployed.

---

# 62. Control Plane Metrics

Metrics can help identify:

```text
API saturation
Slow requests
etcd latency
Scheduler delays
Controller queue growth
Resource pressure
```

Metrics are particularly important because control-plane failures can otherwise appear indirectly through workload symptoms.

---

# 63. API Server Troubleshooting

Check:

```bash
kubectl cluster-info
kubectl get --raw='/readyz?verbose'
kubectl get --raw='/livez?verbose'
```

Depending on the Kubernetes version and access configuration, health endpoints may provide useful diagnostic information.

---

# 64. etcd Troubleshooting

Important areas include:

```text
Member Health
Leader Status
Disk Latency
Database Size
Network Connectivity
Certificate Validity
Quorum
```

Do not expose etcd unnecessarily to application networks.

---

# 65. Scheduler Troubleshooting

If Pods remain Pending:

```bash
kubectl get pods
kubectl describe pod <pod-name>
```

Inspect events for:

```text
Insufficient CPU
Insufficient Memory
Taint
Affinity
Topology
PVC
Other Scheduling Constraints
```

---

# 66. Controller Troubleshooting

Symptoms can include:

```text
Deployment not progressing
Replica count not correcting
Jobs not completing
Nodes not handled correctly
Resources stuck
```

Investigate:

```text
Controller logs
API server health
Events
Resource status
Controller permissions
Admission policies
```

---

# 67. Control Plane Resource Management

Control-plane nodes need sufficient:

```text
CPU
Memory
Disk
Network
```

Poor control-plane resource allocation can cause:

```text
API Latency
Scheduler Delays
Controller Delays
etcd Performance Problems
```

---

# 68. Control Plane Disk Usage

Control-plane disk capacity is particularly important for:

```text
etcd
Logs
Container Images (if applicable)
Temporary Files
System Data
```

etcd performance can be sensitive to disk latency.

---

# 69. Control Plane Network Requirements

Control-plane components need reliable communication.

Important paths include:

```text
kubectl -> API Server
API Server -> etcd
API Server -> kubelet
Scheduler -> API Server
Controllers -> API Server
Worker Nodes -> API Server
```

Network restrictions must allow required traffic while minimizing unnecessary exposure.

---

# 70. Control Plane Certificates and Rotation

Certificates expire.

Production operations should include:

```text
Certificate Inventory
Expiration Monitoring
Rotation Procedures
Testing
```

A certificate expiration can cause apparently unrelated cluster failures.

---

# 71. Control Plane Upgrade

A simplified upgrade sequence:

```text
Review Version Compatibility
        |
        v
Backup / Recovery Check
        |
        v
Upgrade Control Plane Components
        |
        v
Validate API
        |
        v
Validate etcd
        |
        v
Validate Scheduler
        |
        v
Validate Controllers
        |
        v
Upgrade Worker Nodes
```

Always follow the supported procedure for the Kubernetes distribution being used.

---

# 72. Control Plane Upgrade Risks

Potential problems include:

```text
API Version Compatibility
Version Skew
CRD Compatibility
Admission Webhooks
CNI Compatibility
CSI Compatibility
Operator Compatibility
Certificate Problems
```

Test upgrades in non-production first.

---

# 73. Control Plane Backup and DR Checklist

```text
[ ] etcd backup
[ ] Backup stored securely
[ ] Encryption enabled where required
[ ] Restore procedure documented
[ ] Restore procedure tested
[ ] Control-plane certificates accounted for
[ ] Cluster configuration documented
[ ] Infrastructure recovery documented
[ ] Application data backup handled separately
```

---

# 74. Control Plane Security Checklist

```text
[ ] API server access restricted
[ ] Strong authentication
[ ] Least-privilege RBAC
[ ] TLS configured
[ ] etcd protected
[ ] Secrets protected
[ ] Audit logging
[ ] Admission policies
[ ] Control-plane nodes hardened
[ ] Administrative access controlled
[ ] Certificates monitored
[ ] Components patched
```

---

# 75. Common Control Plane Anti-Patterns

## Single Control-Plane Node for Critical Production

Problem:

```text
Control Plane -> Single Failure Point
```

Prefer an HA architecture when availability requirements justify it.

---

## Exposing etcd Publicly

Avoid unnecessary external exposure.

etcd contains sensitive cluster state.

---

## Giving Everyone cluster-admin

Problem:

```text
Any Compromised Account
        |
        v
Entire Cluster
```

Use least-privilege RBAC.

---

## Ignoring Certificate Expiration

Expired certificates can break:

```text
API Access
kubelet Communication
etcd Communication
Component Communication
```

Monitor certificate expiry.

---

## No etcd Backup

Without backups, control-plane recovery becomes much harder.

---

## No Restore Testing

A backup is not enough.

Test:

```text
Backup
 |
 v
Restore
 |
 v
Validate
```

---

## Running Control Plane Without Resource Headroom

Resource starvation can impact the entire cluster.

---

# 76. Control Plane vs Data Plane

A useful distinction is:

### Control Plane

Makes decisions and manages state.

```text
API Server
Scheduler
Controllers
etcd
```

### Data Plane

Runs application workloads and handles their runtime traffic.

```text
Worker Nodes
Pods
Containers
Networking
Storage
```

Conceptually:

```text
             CONTROL PLANE
                  |
          Makes Decisions
                  |
                  v
              DATA PLANE
                  |
          Runs Workloads
```

---

# 77. Control Plane vs Worker Node

| Capability | Control Plane | Worker Node |
|---|---|---|
| Kubernetes API | Yes | No |
| etcd | Yes | No |
| Scheduling | Yes | No |
| Controllers | Yes | No |
| kubelet | Usually no | Yes |
| Container runtime | Optional/implementation dependent | Yes |
| Run application Pods | Normally avoided in dedicated designs | Yes |
| Cluster-wide decisions | Yes | No |

---

# 78. Example: Application Deployment

Suppose a developer wants:

```text
payment-api = 5 replicas
```

The control plane processes:

```text
Deployment
    |
    v
ReplicaSet
    |
    v
5 Pods Desired
    |
    v
Scheduler
    |
    v
Node Selection
```

Worker nodes then execute:

```text
kubelet
   |
   v
Container Runtime
   |
   v
Payment API Containers
```

---

# 79. Example: Node Failure

Suppose:

```text
Node A
 |
 +-- Payment Pod
```

Node A fails.

The control plane observes the node state and workload consequences.

```text
Node Failure
    |
    v
Node Health Changes
    |
    v
Controllers / Scheduler
    |
    v
Replacement Placement
    |
    v
New Worker Node / Existing Capacity
    |
    v
Replacement Pod
```

Exact recovery depends on controller type, storage, topology, disruption policies, and available capacity.

---

# 80. Example: API Server Failure

Suppose one API server fails:

```text
API-1 -> Down
API-2 -> Healthy
API-3 -> Healthy
```

With an appropriate load-balancing architecture:

```text
Client
  |
  v
Load Balancer
  |
  +--> API-2
  |
  +--> API-3
```

The cluster can continue serving API traffic.

---

# 81. Example: Scheduler Failure

If all scheduler instances become unavailable:

```text
Existing Pods
   |
   v
Continue Running
```

But:

```text
New Unscheduled Pods
   |
   v
Remain Pending
```

until scheduling functionality returns.

---

# 82. Example: Controller Manager Failure

If controllers stop:

```text
Existing Containers
      |
      v
May Continue Running
```

But reconciliation is reduced:

```text
Failed Pods
   |
   X
Replacement May Not Be Created
```

When controllers return, reconciliation resumes.

---

# 83. Example: etcd Quorum Loss

Suppose:

```text
3 etcd members
```

and:

```text
2 members fail
```

Remaining:

```text
1 member
```

Quorum requires:

```text
2
```

Therefore normal consensus operations cannot continue.

This illustrates why etcd availability is critical.

---

# 84. Control Plane Mental Model

The easiest way to remember the control plane is:

```text
API Server
   |
   +-- "What does the cluster want?"
   |
   v
etcd
   |
   +-- "What state is stored?"
   |
   v
Scheduler
   |
   +-- "Where should Pods run?"
   |
   v
Controllers
   |
   +-- "Does actual state match desired state?"
   |
   v
Worker Nodes
   |
   +-- "Run the workloads"
```

---

# 85. Complete Control Plane Flow

```text
                       USER / AUTOMATION
                              |
                              v
                       kube-apiserver
                              |
            +-----------------+-----------------+
            |                 |                 |
            v                 v                 v
       Authentication    Authorization      Admission
                              |
                              v
                         API Object
                              |
                              v
                             etcd
                              |
                 +------------+------------+
                 |                         |
                 v                         v
            Controllers                Scheduler
                 |                         |
                 v                         v
          Desired State              Node Selection
                 |                         |
                 +------------+------------+
                              |
                              v
                         Worker Node
                              |
                              v
                           kubelet
                              |
                              v
                      Container Runtime
                              |
                              v
                         Application
```

---

# 86. Practical Troubleshooting Flow

When something appears wrong:

```text
1. Can I reach the API server?
        |
        v
2. Is the API server healthy?
        |
        v
3. Is etcd healthy?
        |
        v
4. Is the scheduler healthy?
        |
        v
5. Are controllers healthy?
        |
        v
6. Are worker nodes Ready?
        |
        v
7. Are Pods scheduled?
        |
        v
8. Are Pods Ready?
        |
        v
9. Is networking healthy?
        |
        v
10. Is storage healthy?
        |
        v
11. Is the application healthy?
```

---

# 87. Useful Commands

## API Server

```bash
kubectl cluster-info
kubectl get --raw='/readyz?verbose'
kubectl get --raw='/livez?verbose'
```

## Cluster

```bash
kubectl get nodes
kubectl get pods -A
kubectl get events -A
```

## Scheduling

```bash
kubectl get pods -A --field-selector=status.phase=Pending
kubectl describe pod <pod> -n <namespace>
```

## Control Plane Resources

```bash
kubectl get pods -n kube-system
kubectl get events -n kube-system
```

The exact location and management of control-plane components varies by Kubernetes distribution.

---

# 88. Production Control Plane Checklist

## Availability

```text
[ ] HA API servers
[ ] HA scheduler
[ ] HA controller manager
[ ] HA etcd
[ ] Load balancing
[ ] Failure-domain awareness
```

## Performance

```text
[ ] Sufficient CPU
[ ] Sufficient memory
[ ] Fast storage for etcd
[ ] Adequate network
[ ] Monitoring
```

## Security

```text
[ ] Authentication
[ ] RBAC
[ ] TLS
[ ] Admission controls
[ ] Audit logging
[ ] Restricted etcd access
[ ] Hardened control-plane nodes
```

## Recovery

```text
[ ] etcd backups
[ ] Backup retention
[ ] Restore testing
[ ] DR documentation
[ ] Certificate recovery plan
```

## Operations

```text
[ ] Upgrade procedure
[ ] Version compatibility review
[ ] Certificate monitoring
[ ] Capacity monitoring
[ ] Alerting
[ ] Incident procedures
```

---

# 89. Interview Questions

## Beginner

### What is the Kubernetes control plane?

The control plane is the management layer that exposes the Kubernetes API, stores cluster state, schedules workloads, and runs controllers that reconcile desired and actual state.

### What are the main control-plane components?

```text
kube-apiserver
etcd
kube-scheduler
kube-controller-manager
cloud-controller-manager (when used)
```

### What is the API server?

The central Kubernetes API component through which clients and cluster components interact with Kubernetes resources.

### What is etcd?

The consistent key-value store used to persist Kubernetes cluster state.

### What does the scheduler do?

It assigns unscheduled Pods to suitable worker nodes.

### What does the controller manager do?

It runs controllers that continuously reconcile resources toward their desired state.

---

## Intermediate

### Does the scheduler start containers?

No. The scheduler selects a node. The kubelet and container runtime on that node handle Pod/container execution.

### What happens if the scheduler is down?

Existing Pods can generally continue running, but new unscheduled Pods may remain Pending.

### What happens if the controller manager is down?

Existing workloads may continue running, but reconciliation activities such as replacement or desired-state correction can be delayed.

### What happens if the API server is unavailable?

API operations and many control-plane interactions become unavailable. Existing workloads may continue running depending on the failure and duration.

### Why is etcd so important?

It stores critical Kubernetes control-plane state.

### What is quorum?

The minimum majority of distributed members required to maintain consensus operations.

### Why are odd numbers common for etcd?

They provide efficient failure tolerance while limiting unnecessary member overhead.

---

## Advanced

### How does a Deployment create Pods?

```text
Deployment
   |
   v
Deployment Controller
   |
   v
ReplicaSet
   |
   v
Pods
   |
   v
Scheduler
   |
   v
Node
```

### How does Kubernetes self-heal?

Controllers compare desired and observed state and create/update/delete resources as necessary to reconcile differences.

### What is leader election?

A mechanism that allows multiple instances of a component to coordinate so that one acts as the active leader while others remain available to take over.

### Why should etcd not be exposed publicly?

Because it contains sensitive cluster state and is a critical control-plane component.

### What is the difference between control plane and data plane?

The control plane makes cluster-management decisions; the data plane runs application workloads and handles their runtime traffic.

### Can a Kubernetes cluster run workloads if the control plane is temporarily unavailable?

Existing workloads may continue running on healthy nodes, but scheduling, reconciliation, API operations, scaling, and other management functions can be impaired.

---

# 90. Key Relationships

## API

```text
kubectl
  |
  v
API Server
  |
  +-- Authentication
  +-- Authorization
  +-- Admission
  |
  v
Kubernetes Resources
```

## State

```text
API Server
    |
    v
  etcd
```

## Scheduling

```text
Pod
 |
 v
Scheduler
 |
 v
Node
```

## Reconciliation

```text
Desired State
     |
     v
Controller
     |
     v
Actual State
     |
     v
Correction
```

## Execution

```text
Node
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

# 91. Final Key Takeaways

```text
1. The control plane is the management layer of Kubernetes.

2. The API server is the central API entry point.

3. etcd stores critical cluster state.

4. The scheduler assigns unscheduled Pods to nodes.

5. Controllers reconcile desired and actual state.

6. The cloud controller manager integrates cloud-provider functionality when used.

7. Authentication determines who is making a request.

8. Authorization determines what the identity can do.

9. Admission can validate, mutate, or enforce policy.

10. API resources are organized into groups and versions.

11. The API server is the main coordination point between Kubernetes components.

12. etcd should be protected with strong security controls.

13. etcd quorum is required for normal consensus operations.

14. Odd-sized etcd clusters are commonly used for efficient failure tolerance.

15. The scheduler chooses placement; kubelet executes the Pod.

16. Controllers are control loops.

17. Watches allow components to observe resource changes.

18. Events are records of noteworthy occurrences and are different from watches.

19. Leader election supports HA for components that require a single active leader.

20. Multiple API servers can improve API availability.

21. Multiple scheduler/controller-manager instances can improve control-plane availability.

22. Existing workloads may continue running during some control-plane failures.

23. Control-plane failure can impair scheduling and reconciliation.

24. etcd quorum loss is particularly serious.

25. Control-plane nodes require sufficient CPU, memory, storage, and network resources.

26. etcd storage performance matters.

27. Certificate expiration can cause major control-plane failures.

28. Control-plane security requires authentication, authorization, TLS, admission, audit, and restricted access.

29. CRDs and Operators extend Kubernetes control-plane behavior.

30. Admission webhooks can implement external policy and mutation.

31. Control-plane observability should include API server, etcd, scheduler, and controller metrics/logs.

32. Control-plane backups and restore testing are essential for production.

33. A highly available control plane requires coordinated design across API servers, scheduler, controllers, etcd, networking, and load balancing.

34. The core control-plane mental model is:

       API Server
          |
          +---- etcd
          |
          +---- Scheduler
          |
          +---- Controllers
          |
          v
       Worker Nodes
          |
          v
        Pods

35. The fundamental Kubernetes pattern remains:

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
             +----> Reconcile
```

---

# 92. Quick Reference

| Component | Primary Responsibility |
|---|---|
| kube-apiserver | Kubernetes API and request processing |
| etcd | Persistent cluster state |
| kube-scheduler | Pod placement |
| kube-controller-manager | Resource reconciliation |
| cloud-controller-manager | Cloud-provider integration |
| kubelet | Node-level Pod lifecycle |
| Container Runtime | Container execution |
| kube-proxy / networking | Service/networking implementation |

### Control Plane Flow

```text
Client
  |
  v
API Server
  |
  +--> Authentication
  +--> Authorization
  +--> Admission
  |
  v
etcd
  |
  +--> Controllers
  |
  +--> Scheduler
  |
  v
Worker Nodes
  |
  v
Pods
```

---

> **Core control-plane principle:** The Kubernetes control plane does not simply "run containers." It maintains the desired state of the cluster by exposing the API, persisting state, scheduling workloads, and continuously reconciling resources through controllers. The worker nodes then execute the workloads selected by that control plane.
