# Kubernetes Worker Node

> A Kubernetes worker node is a machine that provides compute capacity for running Pods. The kubelet manages Pods on the node, the container runtime executes containers, and the node participates in Kubernetes networking and storage.

---

## 1. What Is a Worker Node?

A worker node is a machine that runs application workloads in a Kubernetes cluster.

At a high level:

```text
Kubernetes Cluster
|
+-- Control Plane
|
+-- Worker Nodes
    |
    +-- Node 1
    |    +-- kubelet
    |    +-- Container Runtime
    |    +-- Networking
    |    +-- Pods
    |
    +-- Node 2
    |    +-- kubelet
    |    +-- Container Runtime
    |    +-- Networking
    |    +-- Pods
    |
    +-- Node 3
         +-- kubelet
         +-- Container Runtime
         +-- Networking
         +-- Pods
```

Worker nodes are where the actual application processes normally execute.

---

# 2. Worker Node Responsibilities

A worker node is responsible for:

```text
Running Pods
Starting Containers
Stopping Containers
Monitoring Containers
Reporting Node Status
Mounting Storage
Participating in Networking
Executing Probes
Managing Local Resources
```

The main node-side components are:

```text
kubelet
Container Runtime
kube-proxy (where used)
CNI components
CSI node components
Operating System
```

---

# 3. Worker Node Architecture

A simplified node architecture:

```text
                       WORKER NODE
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
       kubelet       Container Runtime    Networking
          |                 |                 |
          |                 v                 |
          |             Containers           |
          |                                   |
          +-----------------+-----------------+
                            |
                            v
                           Pods
```

Storage components may also run on the node:

```text
CSI Node Plugin
      |
      v
Persistent Volumes
```

---

# 4. Worker Node and Control Plane

The relationship is:

```text
                  CONTROL PLANE
                       |
                       v
                 Kubernetes API
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

The control plane makes cluster-level decisions, while the worker node executes assigned workloads.

---

# 5. kubelet

The kubelet is the primary Kubernetes node agent.

It runs on each worker node.

Its core responsibility is to ensure that Pods assigned to the node are running and healthy according to their specifications.

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

# 6. kubelet Responsibilities

The kubelet performs tasks including:

```text
Pod Lifecycle Management
Container Lifecycle Management
Health Monitoring
Volume Mount Coordination
Status Reporting
Image Management Coordination
Probe Execution
Node Status Reporting
```

It does not act as the cluster scheduler.

---

# 7. kubelet Does Not Schedule Pods

The scheduler selects the node.

```text
Pod
 |
 v
Scheduler
 |
 v
Worker Node
 |
 v
kubelet
 |
 v
Container Runtime
```

This distinction is important:

```text
Scheduler -> WHERE should the Pod run?

kubelet -> Make sure the Pod runs HERE.
```

---

# 8. Container Runtime

The container runtime executes containers on the worker node.

Kubernetes communicates with the runtime through the Container Runtime Interface (CRI).

Common runtimes include:

```text
containerd
CRI-O
```

The runtime handles operations such as:

```text
Pull Image
Create Container
Start Container
Stop Container
Remove Container
Manage Container Lifecycle
```

---

# 9. Container Runtime Architecture

```text
kubelet
   |
   | CRI
   v
Container Runtime
   |
   +-- Image Management
   +-- Container Lifecycle
   |
   v
Containers
```

---

# 10. CRI

CRI means:

```text
Container Runtime Interface
```

It provides the interface between Kubernetes node components and the container runtime.

Conceptually:

```text
Kubernetes
    |
    v
kubelet
    |
    v
CRI
    |
    v
Container Runtime
```

---

# 11. Container Image Lifecycle

When a Pod requires an image:

```text
Pod Specification
      |
      v
kubelet
      |
      v
Container Runtime
      |
      v
Container Registry
      |
      v
Container Image
      |
      v
Local Node Storage
      |
      v
Container
```

If the image is already present and the pull policy permits reuse, the runtime may not need to download it again.

---

# 12. Image Pull

Example:

```yaml
containers:
  - name: payment-api
    image: registry.example.com/payment-api:1.5.0
```

The runtime pulls the image when required.

Possible failures include:

```text
Wrong Image Name
Wrong Tag
Registry Unavailable
Authentication Failure
Network Failure
Architecture Mismatch
Rate Limiting
Certificate Problem
```

---

# 13. ImagePullBackOff

A common Pod problem is:

```text
ImagePullBackOff
```

This generally means Kubernetes is repeatedly unable to obtain the required image and is backing off between attempts.

Investigate:

```bash
kubectl describe pod <pod-name>
```

Look at the Events section.

---

# 14. Node Registration

A worker node must register with the Kubernetes control plane.

Conceptually:

```text
Machine
   |
   v
Install Node Components
   |
   v
Configure kubelet
   |
   v
Connect to API Server
   |
   v
Node Object
   |
   v
Node Ready
```

The exact bootstrap process depends on the Kubernetes distribution.

---

# 15. Node Object

Kubernetes represents each node as a Node API object.

View nodes:

```bash
kubectl get nodes
```

Example:

```text
NAME       STATUS   ROLES    AGE
worker-1   Ready    <none>   30d
worker-2   Ready    <none>   30d
worker-3   Ready    <none>   30d
```

---

# 16. Node Status

A node reports information including:

```text
Conditions
Capacity
Allocatable
Addresses
Info
Pod Capacity
```

Inspect:

```bash
kubectl describe node <node-name>
```

---

# 17. Node Conditions

Important conditions include:

```text
Ready
MemoryPressure
DiskPressure
PIDPressure
NetworkUnavailable
```

Conceptually:

```text
Node
 |
 +-- Ready
 +-- MemoryPressure
 +-- DiskPressure
 +-- PIDPressure
 +-- NetworkUnavailable
```

---

# 18. Ready Condition

A healthy node normally reports:

```text
Ready = True
```

This means the kubelet is reporting that the node is healthy enough to accept workloads.

It does not mean:

```text
Every Pod is healthy
```

or:

```text
Every application is functioning
```

---

# 19. MemoryPressure

A node may report memory pressure when available memory is too low according to kubelet eviction and node-pressure thresholds.

Potential effects include:

```text
Pod Eviction
Scheduling Impact
Application Performance Problems
```

Investigate:

```bash
kubectl describe node <node>
kubectl top node
```

when metrics are available.

---

# 20. DiskPressure

Disk pressure can occur when node storage becomes constrained.

Possible causes:

```text
Container Images
Container Logs
Ephemeral Storage
Temporary Files
Application Files
```

Potential effects include:

```text
Pod Eviction
Image Pull Problems
Container Creation Problems
```

---

# 21. PIDPressure

PID pressure occurs when the node approaches process ID limits.

Possible causes include:

```text
Too Many Processes
Process Leaks
Runaway Workloads
Incorrect Resource Behavior
```

---

# 22. Node Capacity

Nodes expose capacity such as:

```text
CPU
Memory
Ephemeral Storage
Pods
```

Example conceptual model:

```text
Node Capacity
|
+-- CPU
+-- Memory
+-- Ephemeral Storage
+-- Pod Capacity
```

---

# 23. Capacity vs Allocatable

### Capacity

Total resource capacity recognized by Kubernetes.

### Allocatable

Resource capacity available for Pods after accounting for node/system reservations and configuration.

```text
Total Capacity
      |
      +-- OS / Kubernetes / System Reservation
      |
      v
Allocatable
      |
      v
Pod Resources
```

This distinction is important for scheduling and capacity planning.

---

# 24. Resource Requests on a Node

Suppose a Pod requests:

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
```

The scheduler evaluates whether the target node has sufficient allocatable resources.

Important:

> Scheduling primarily uses resource requests rather than instantaneous resource consumption.

---

# 25. Resource Limits on a Node

A Pod can also define limits:

```yaml
resources:
  limits:
    cpu: "1"
    memory: "1Gi"
```

The runtime and operating system enforce resource behavior according to Kubernetes and container-runtime mechanisms.

---

# 26. CPU Units

Kubernetes CPU can be expressed using:

```text
1 CPU
500m
250m
100m
```

Where:

```text
1000m = 1 CPU
```

Therefore:

```text
500m = 0.5 CPU
250m = 0.25 CPU
```

---

# 27. Memory Units

Memory can be specified using units such as:

```text
Mi
Gi
M
G
```

For example:

```text
256Mi
512Mi
1Gi
2Gi
```

Use consistent units when defining production resource policies.

---

# 28. Pod Capacity

A node has a maximum Pod capacity based on cluster/node configuration.

Conceptually:

```text
Node
 |
 +-- CPU Capacity
 +-- Memory Capacity
 +-- Storage Capacity
 +-- Pod Capacity
```

A node can become unable to schedule additional Pods even if CPU or memory appears available if Pod-count capacity is exhausted.

---

# 29. Node Labels

Labels provide metadata about nodes.

Example:

```text
environment=production
zone=zone-a
workload=compute
instance-type=large
```

View labels:

```bash
kubectl get nodes --show-labels
```

---

# 30. Node Selector

A Pod can request a node with a specific label:

```yaml
spec:
  nodeSelector:
    workload: compute
```

The scheduler only considers matching nodes.

---

# 31. Node Affinity

Node affinity provides more expressive placement behavior.

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

Affinity supports more complex requirements and preferences.

---

# 32. Taints

A taint can prevent ordinary Pods from being scheduled onto a node.

Example:

```text
dedicated=database:NoSchedule
```

Conceptually:

```text
Node
 |
 +-- Taint
      |
      v
  "Keep out"
```

---

# 33. Tolerations

A Pod can tolerate a matching taint:

```yaml
tolerations:
  - key: dedicated
    operator: Equal
    value: database
    effect: NoSchedule
```

Important:

> A toleration permits the Pod to tolerate the taint; it does not by itself force the Pod onto that node.

---

# 34. Node Maintenance

Before maintenance:

```bash
kubectl cordon <node>
```

This prevents new scheduling.

Then:

```bash
kubectl drain <node>
```

This attempts to evict eligible workloads.

After maintenance:

```bash
kubectl uncordon <node>
```

---

# 35. Cordon

Cordon marks a node as unschedulable.

```text
Node
 |
 +-- Unschedulable = true
```

Existing Pods normally remain running.

New Pods will not normally be scheduled onto the cordoned node.

---

# 36. Drain

Drain prepares a node for maintenance.

```text
Node
 |
 +-- Cordon
 |
 +-- Evict eligible Pods
 |
 v
Maintenance
```

Drain behavior can be affected by:

```text
PodDisruptionBudget
DaemonSets
Local Storage
Pod Controller
Force Options
Unmanaged Pods
```

Always review the command before using aggressive drain options.

---

# 37. Uncordon

After maintenance:

```bash
kubectl uncordon <node>
```

This makes the node schedulable again.

```text
Unschedulable
     |
     v
Uncordon
     |
     v
Schedulable
```

---

# 38. Node Scheduling Flow

The complete simplified flow:

```text
Pod Created
    |
    v
API Server
    |
    v
Scheduler
    |
    v
Select Worker Node
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

# 39. Pod Lifecycle on a Worker Node

A Pod assigned to a node goes through a process such as:

```text
Pod Assignment
      |
      v
kubelet Detects Pod
      |
      v
Prepare Pod
      |
      v
Mount Volumes
      |
      v
Pull Images
      |
      v
Create Containers
      |
      v
Start Containers
      |
      v
Run Probes
      |
      v
Report Status
```

---

# 40. Pod Sandbox

Container runtimes create a Pod sandbox/network namespace according to the CRI and networking implementation.

Conceptually:

```text
Pod
 |
 +-- Pod Sandbox
 |
 +-- Container A
 +-- Container B
```

Containers in the same Pod share the Pod's network namespace.

---

# 41. Pod Networking on a Node

A simplified model:

```text
Pod
 |
 v
Pod Network Namespace
 |
 v
CNI
 |
 v
Node Network
 |
 v
Cluster Network
```

The exact implementation depends on the CNI plugin.

---

# 42. CNI

CNI means:

```text
Container Network Interface
```

It provides the standard interface used by Kubernetes/container runtimes to configure networking.

Examples of Kubernetes networking implementations include:

```text
Calico
Cilium
Flannel
Cloud-provider networking
```

---

# 43. CNI Responsibilities

Depending on the implementation, CNI components can:

```text
Create Pod Network Interfaces
Assign Pod IPs
Configure Routes
Configure Network Policies
Connect Pods to the Cluster Network
```

Not every CNI provides every feature in the same way.

---

# 44. Node Networking

A node normally has networking components such as:

```text
Node Interface
Pod Interfaces
CNI Configuration
Routing
Service Networking
```

Conceptually:

```text
Pod
 |
 v
CNI
 |
 v
Node Network
 |
 v
Cluster Network
```

---

# 45. kube-proxy

Where used, kube-proxy implements Service-related networking rules on nodes.

Conceptually:

```text
Client Pod
    |
    v
Service
    |
    v
Node Networking Rules
    |
    v
Backend Pod
```

Modern Kubernetes networking solutions may provide Service functionality without kube-proxy.

---

# 46. Storage on Worker Nodes

Pods may use persistent storage.

A simplified architecture:

```text
Pod
 |
 v
kubelet
 |
 v
CSI Node Plugin
 |
 v
Storage Backend
```

For a Kubernetes PVC:

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
CSI / Storage Backend
```

---

# 47. CSI

CSI means:

```text
Container Storage Interface
```

CSI allows storage providers to integrate with Kubernetes.

Node-side CSI components commonly help with:

```text
Mount
Unmount
Stage
Unstage
Attach-related workflows
```

Exact behavior depends on the CSI implementation.

---

# 48. Ephemeral Storage

Worker nodes also provide local ephemeral storage.

Used for things such as:

```text
Container Writable Layers
Logs
EmptyDir Volumes
Temporary Files
```

Ephemeral storage is not equivalent to durable persistent storage.

---

# 49. emptyDir

An `emptyDir` volume provides temporary shared storage for containers in a Pod.

```yaml
volumes:
  - name: shared-data
    emptyDir: {}
```

Conceptually:

```text
Pod
 |
 +-- Container A
 |
 +-- Container B
 |
 +-- emptyDir
```

The data normally exists for the lifetime of the Pod.

---

# 50. Local Storage Considerations

Node-local storage can be lost when:

```text
Pod Is Deleted
Node Fails
Node Is Replaced
Workload Moves
```

Do not use ephemeral/local storage as a substitute for persistent application data unless that behavior is explicitly intended.

---

# 51. Kubelet Probes

The kubelet executes and manages container probes.

Common probe types:

```text
Startup
Readiness
Liveness
```

Conceptually:

```text
kubelet
 |
 +-- Startup Probe
 +-- Readiness Probe
 +-- Liveness Probe
```

---

# 52. Readiness on a Node

If a container is running but not ready:

```text
Container = Running
Pod = Not Ready
```

The Service should not normally send traffic to that Pod through normal endpoint readiness behavior.

---

# 53. Liveness on a Node

If a liveness probe fails according to the configured thresholds:

```text
Liveness Failure
      |
      v
kubelet / Container Runtime
      |
      v
Container Restart
```

The exact restart behavior depends on the Pod's restart policy and container lifecycle.

---

# 54. Startup Probe

Startup probes protect slow-starting applications.

```text
Container Starts
      |
      v
Startup Probe
      |
      +-- Failing -> Give Startup Time
      |
      v
Startup Succeeds
      |
      v
Normal Liveness / Readiness
```

---

# 55. Restart Policy

Pods can have restart policies such as:

```text
Always
OnFailure
Never
```

For typical long-running workload controllers such as Deployments, `Always` is generally used.

---

# 56. Node Eviction

When a node experiences pressure, kubelet can evict Pods according to Kubernetes eviction behavior.

Pressure can include:

```text
Memory
Disk
Inodes
PID
```

Eviction decisions are influenced by:

```text
Resource Usage
QoS Class
Priority
Requests
Node Conditions
Eviction Thresholds
```

---

# 57. QoS Classes

Pods are classified into:

```text
Guaranteed
Burstable
BestEffort
```

Resource configuration affects QoS classification.

This can influence eviction behavior under node resource pressure.

---

# 58. Guaranteed QoS

A Pod generally qualifies for Guaranteed QoS when its containers have appropriate CPU and memory requests and limits configured equally.

Example:

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

---

# 59. Burstable QoS

A Pod is commonly Burstable when it has resource requests/limits but does not meet the criteria for Guaranteed.

Example:

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "1"
    memory: "1Gi"
```

---

# 60. BestEffort QoS

A Pod with no CPU or memory requests/limits is generally classified as BestEffort.

Example:

```yaml
containers:
  - name: app
    image: example/app:1.0
```

BestEffort workloads are generally more vulnerable during resource pressure than higher-QoS workloads.

---

# 61. Node Pressure and Eviction

A simplified flow:

```text
Node Resource Pressure
        |
        v
kubelet Detects Pressure
        |
        v
Eviction Logic
        |
        v
Select Workloads
        |
        v
Evict Pods
        |
        v
Controllers Recreate Them Elsewhere
```

This assumes suitable cluster capacity is available.

---

# 62. Pod Priority

Pod priority can influence scheduling and preemption.

Example:

```text
Critical Workload
      |
      v
High Priority
      |
      v
Scheduler
```

Priority should be used carefully because preemption can affect other workloads.

---

# 63. PodDisruptionBudget and Worker Nodes

PodDisruptionBudgets can protect availability during voluntary disruptions.

Example:

```text
5 replicas
 |
 +-- PDB: minAvailable = 4
```

When draining nodes, the PDB may limit simultaneous voluntary disruptions.

A PDB does not prevent arbitrary infrastructure failures.

---

# 64. Node Failure

Suppose:

```text
Node A
 |
 +-- Pod 1
 +-- Pod 2
```

Node A fails.

The control plane detects node health changes.

If the workloads are managed by controllers:

```text
Node Failure
    |
    v
Workload State Changes
    |
    v
Controller
    |
    v
Replacement Pods
    |
    v
Other Nodes
```

Recovery depends on available capacity, topology, storage, and workload design.

---

# 65. Node Maintenance Flow

A recommended high-level flow:

```text
Check Node
   |
   v
Cordon
   |
   v
Review Workloads
   |
   v
Drain
   |
   v
Maintenance
   |
   v
Health Validation
   |
   v
Uncordon
   |
   v
Monitor
```

---

# 66. Node Resource Reservation

Production nodes should reserve resources for:

```text
Operating System
kubelet
Container Runtime
System Daemons
Networking
Logging
Monitoring
```

This prevents workloads from consuming every available resource.

---

# 67. System Reserved

Kubernetes node configuration can reserve resources for system processes.

Conceptually:

```text
Node Capacity
 |
 +-- System Reserved
 |
 +-- Kubernetes Reserved
 |
 +-- Eviction Headroom
 |
 v
Pod Allocatable
```

Exact configuration depends on the Kubernetes distribution and node setup.

---

# 68. Node Allocatable

The allocatable value is the amount of node resource intended to be available for Pods.

View:

```bash
kubectl describe node <node>
```

Look for:

```text
Capacity
Allocatable
```

---

# 69. Node Capacity Planning

A node should not be planned at 100% utilization.

Consider:

```text
Normal Workload
Peak Workload
Node Failure
System Overhead
DaemonSets
Rolling Updates
Autoscaling
```

Example:

```text
3 nodes
 |
 +-- Normal load = 60%
 |
 +-- Failure of 1 node
 |
 v
Remaining nodes must absorb workloads
```

This is why headroom is important.

---

# 70. DaemonSets on Worker Nodes

DaemonSets are commonly used for node-level agents.

Examples:

```text
Logging Agent
Monitoring Agent
Security Agent
Network Agent
Storage Agent
```

Architecture:

```text
DaemonSet
 |
 +-- Node 1 -> Agent
 +-- Node 2 -> Agent
 +-- Node 3 -> Agent
```

DaemonSets consume node resources and must be included in capacity planning.

---

# 71. Node-Level Observability

Typical node monitoring includes:

```text
CPU
Memory
Disk
Filesystem
Network
Processes
Container Restarts
Pod Count
Pressure Conditions
```

---

# 72. `kubectl top nodes`

If Metrics Server or compatible metrics infrastructure is installed:

```bash
kubectl top nodes
```

Example:

```text
NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
worker-1   750m         37%    3Gi             45%
worker-2   900m         45%    4Gi             60%
worker-3   500m         25%    2Gi             35%
```

This provides current usage information, not a complete capacity-planning solution.

---

# 73. Node Logs

Troubleshooting often requires:

```text
kubelet Logs
Container Runtime Logs
CNI Logs
CSI Logs
Operating System Logs
```

The exact commands depend on the operating system and Kubernetes distribution.

On systemd-based Linux systems, examples may include:

```bash
journalctl -u kubelet
```

---

# 74. Worker Node Troubleshooting

A useful flow:

```text
Node Not Ready
     |
     v
Check Node Conditions
     |
     v
Check kubelet
     |
     v
Check Container Runtime
     |
     v
Check CNI
     |
     v
Check Disk / Memory
     |
     v
Check Certificates
     |
     v
Check Network
```

---

# 75. Node Not Ready

Possible causes:

```text
kubelet Failure
Container Runtime Failure
Network Failure
Disk Pressure
Memory Pressure
PID Pressure
Certificate Expiration
OS Failure
CNI Failure
```

Start with:

```bash
kubectl get nodes
kubectl describe node <node>
```

---

# 76. Kubelet Troubleshooting

Check:

```text
Is kubelet running?
Can kubelet reach API server?
Are certificates valid?
Can kubelet communicate with runtime?
Are resources available?
Are there filesystem issues?
```

On systemd systems:

```bash
systemctl status kubelet
journalctl -u kubelet
```

---

# 77. Container Runtime Troubleshooting

Check:

```text
Runtime Process
Socket
Images
Container State
Disk Space
Runtime Logs
```

The exact commands depend on the runtime.

For example, with containerd, tooling may include:

```bash
crictl ps
crictl images
```

when `crictl` is configured.

---

# 78. CNI Troubleshooting

If Pods cannot communicate:

```text
Check CNI Pods
Check Pod IP Assignment
Check Routes
Check Node Network
Check Network Policies
Check CNI Logs
```

Useful commands:

```bash
kubectl get pods -A
kubectl get nodes -o wide
```

CNI-specific commands depend on the networking solution.

---

# 79. Storage Troubleshooting on a Node

Possible problems:

```text
Volume Mount Failure
CSI Plugin Failure
Permission Problem
Network Storage Problem
Disk Full
Node Attachment Problem
```

Investigate:

```bash
kubectl describe pod <pod>
kubectl get pods -n kube-system
kubectl get pvc -A
```

---

# 80. Disk Full Troubleshooting

If a node is running out of disk:

```text
Check Container Images
Check Container Logs
Check Ephemeral Storage
Check EmptyDir
Check OS Filesystems
Check Runtime Storage
```

Node disk pressure can lead to evictions.

---

# 81. Memory Problem Troubleshooting

If a node has memory pressure:

```text
Check Top Pods
Check Container Limits
Check Application Memory
Check DaemonSets
Check System Processes
```

Use:

```bash
kubectl top node
kubectl top pods -A
```

when metrics are available.

---

# 82. CPU Saturation

High CPU can cause:

```text
Application Latency
Scheduling Pressure
Slow Probes
Node Performance Problems
```

Check:

```bash
kubectl top node
kubectl top pods -A
```

Then identify workloads with excessive CPU usage.

---

# 83. Node Network Troubleshooting

Check:

```text
Node Interface
Routes
DNS
CNI
Firewall
Security Groups
Network Policies
Service Routing
```

The exact commands are OS- and CNI-dependent.

---

# 84. Node Security

Worker nodes are security-sensitive because they run application workloads.

Protect:

```text
Operating System
kubelet
Container Runtime
Node Credentials
Filesystem
Network
Privileged Containers
Kernel
```

---

# 85. Worker Node Hardening

Typical practices include:

```text
Minimal OS
Regular Patching
Restricted SSH
Strong Access Controls
Disk Encryption Where Required
Secure kubelet Configuration
Container Runtime Hardening
Kernel Hardening
Security Monitoring
```

---

# 86. Privileged Containers

Privileged containers can have significantly increased access to the underlying node.

Avoid privileged workloads unless required.

Use:

```text
Pod Security Controls
Security Context
Least Privilege
Capabilities Restrictions
```

---

# 87. Security Context

A Pod/container can define security settings.

Example:

```yaml
securityContext:
  runAsNonRoot: true
  allowPrivilegeEscalation: false
```

Additional settings can control:

```text
User
Group
Capabilities
Filesystem
Privilege Escalation
Seccomp
```

---

# 88. Node Access

Restrict administrative access to worker nodes.

Avoid:

```text
Everyone -> SSH -> Every Node
```

Prefer:

```text
Controlled Access
Central Identity
Bastion / Management Path
Auditing
Least Privilege
```

---

# 89. Kubelet Security

The kubelet exposes APIs used for node management.

Protect:

```text
Authentication
Authorization
TLS
Network Access
Certificate Rotation
```

Do not expose kubelet management interfaces unnecessarily.

---

# 90. Worker Node Lifecycle

A node can go through:

```text
Provision
   |
   v
Bootstrap
   |
   v
Register
   |
   v
Ready
   |
   v
Run Workloads
   |
   v
Maintenance
   |
   v
Drain
   |
   v
Remove / Replace
```

---

# 91. Adding a Worker Node

Simplified process:

```text
Provision VM / Bare Metal
       |
       v
Install OS
       |
       v
Install Node Components
       |
       v
Configure Runtime
       |
       v
Configure kubelet
       |
       v
Join Cluster
       |
       v
Node Ready
```

The actual join process depends on the Kubernetes distribution.

---

# 92. Removing a Worker Node

A safe conceptual process is:

```text
Check Workloads
     |
     v
Cordon
     |
     v
Drain
     |
     v
Validate Workloads
     |
     v
Remove Node
     |
     v
Decommission Machine
```

Do not simply power off a production node without considering workload and storage implications.

---

# 93. Node Pools

Cloud Kubernetes platforms commonly group similar worker nodes into node pools.

Example:

```text
Cluster
 |
 +-- General Pool
 |    +-- Node
 |    +-- Node
 |
 +-- Compute Pool
 |    +-- Node
 |    +-- Node
 |
 +-- Memory Pool
      +-- Node
      +-- Node
```

Node pools simplify:

```text
Scaling
Instance Selection
Workload Placement
Cost Management
Upgrade Management
```

---

# 94. Dedicated Worker Nodes

A workload can be given dedicated nodes using:

```text
Labels
Taints
Tolerations
Affinity
```

Example:

```text
Database Nodes
 |
 +-- Taint: dedicated=database
 |
 +-- Label: workload=database
```

Database Pods can then use matching tolerations and affinity.

---

# 95. GPU Worker Nodes

GPU workloads often require specialized worker nodes.

Conceptually:

```text
GPU Node
 |
 +-- GPU Device
 |
 +-- Device Plugin
 |
 +-- GPU Workload
```

Kubernetes device plugins expose specialized hardware resources to Pods.

---

# 96. Device Plugins

Device plugins allow Kubernetes to advertise specialized hardware.

Examples:

```text
GPU
FPGA
Specialized Accelerators
```

Conceptually:

```text
Hardware
   |
   v
Device Plugin
   |
   v
Kubernetes Node Resources
   |
   v
Scheduler
   |
   v
Pod
```

---

# 97. Huge Pages and Specialized Resources

Kubernetes can expose certain specialized node resources, such as huge pages, to workloads.

These capabilities are useful for specialized performance-sensitive applications.

---

# 98. Worker Node and Autoscaling

A cluster autoscaler may add nodes when Pods cannot be scheduled.

```text
Pending Pods
     |
     v
Insufficient Capacity
     |
     v
Cluster Autoscaler
     |
     v
Add Worker Node
     |
     v
Scheduler
     |
     v
Pods Run
```

Nodes may later be removed when capacity is no longer needed.

---

# 99. Node Scale Down

Scale-down requires checking:

```text
Pod Eviction
PodDisruptionBudget
Local Storage
DaemonSets
Affinity
Topology
Persistent Storage
Workload Availability
```

The autoscaler should not simply remove a node without respecting workload constraints.

---

# 100. Worker Node and Rolling Updates

During application deployment:

```text
Deployment
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

The node may simultaneously run:

```text
Old Version Pods
New Version Pods
DaemonSets
System Pods
```

Capacity planning must account for rollout overhead.

---

# 101. Worker Node and DaemonSets

Every eligible node may run:

```text
Logging Agent
Monitoring Agent
Security Agent
CNI Agent
CSI Agent
```

Therefore node capacity must account for system and platform workloads.

---

# 102. Worker Node and Namespaces

Namespaces are cluster-level logical scopes.

A worker node can run Pods from multiple namespaces:

```text
Worker Node
 |
 +-- Pod -> production
 +-- Pod -> staging
 +-- Pod -> development
```

Namespace boundaries do not automatically isolate workloads at the node level.

Security controls must be applied separately.

---

# 103. Worker Node and NetworkPolicy

NetworkPolicy can control traffic involving Pods on the node, depending on the CNI.

Example:

```text
Frontend Pod
      |
      v
API Pod
      |
      v
Database Pod
```

NetworkPolicy can restrict unwanted paths.

---

# 104. Worker Node and Service Traffic

A Pod on a worker node can access a Service.

```text
Pod A
 |
 v
Service
 |
 v
Pod B
```

The Service routing implementation may involve:

```text
kube-proxy
or
CNI / eBPF / Other Networking Implementation
```

---

# 105. Worker Node and DNS

Pods typically use cluster DNS.

```text
Pod
 |
 v
DNS
 |
 v
Service
 |
 v
Backend
```

If DNS fails, applications may experience:

```text
Service Discovery Failures
Dependency Connection Failures
External Name Resolution Failures
```

---

# 106. Worker Node and Time Synchronization

Correct node time is important for:

```text
TLS
Certificates
Logs
Distributed Systems
Authentication
Monitoring
```

Production nodes should have reliable time synchronization.

---

# 107. Worker Node Operating System

Kubernetes worker nodes commonly use Linux.

The OS provides:

```text
Kernel
Processes
Networking
Filesystem
Security Controls
Device Management
```

Some Kubernetes environments can also use Windows worker nodes for Windows workloads.

---

# 108. Linux Kernel Importance

Containers rely heavily on kernel capabilities.

Important areas include:

```text
Namespaces
cgroups
Networking
Filesystem
Security Modules
Process Management
```

Kernel configuration and version can therefore affect container workloads.

---

# 109. cgroups

Linux control groups (`cgroups`) provide resource control mechanisms used by container runtimes and Kubernetes.

They help manage:

```text
CPU
Memory
Process Limits
Other Resources
```

Conceptually:

```text
Node
 |
 +-- cgroup
      |
      +-- Container
```

---

# 110. Linux Namespaces

Linux namespaces provide isolation between processes.

Containers can use namespaces for:

```text
Process
Network
Mount
IPC
UTS
User
```

A Pod's network namespace is shared by its containers.

---

# 111. Worker Node and Containers

The relationship is:

```text
Worker Node
 |
 +-- Operating System
 |
 +-- kubelet
 |
 +-- Container Runtime
 |
 +-- CNI
 |
 +-- CSI
 |
 +-- Pods
      |
      +-- Container
      +-- Container
```

---

# 112. Node-Level Logging Architecture

A common model:

```text
Application Container
        |
        v
Container Logs
        |
        v
Node Log Agent
        |
        v
Central Logging
```

Node-level agents are often deployed through DaemonSets.

---

# 113. Node-Level Monitoring Architecture

```text
Worker Node
 |
 +-- Metrics
 +-- Logs
 +-- Events
 +-- Runtime State
 |
 v
Monitoring Agent
 |
 v
Central Monitoring
```

---

# 114. Common Worker Node Problems

| Problem | Possible Causes |
|---|---|
| Node NotReady | kubelet, runtime, network, certificates |
| ImagePullBackOff | Registry/image/auth/network |
| OOMKilled | Memory limit or memory pressure |
| DiskPressure | Full filesystem |
| MemoryPressure | Low available memory |
| PIDPressure | Too many processes |
| Pod Pending | Scheduling constraints/capacity |
| Pod networking failure | CNI/network policy |
| Volume mount failure | CSI/storage |
| High CPU | Workload/system saturation |
| DNS failure | CoreDNS/network/CNI |
| Container crash | Application/runtime/config |

---

# 115. Worker Node Troubleshooting Checklist

```text
[ ] Is the node Ready?
[ ] What are the node conditions?
[ ] Is kubelet healthy?
[ ] Is the container runtime healthy?
[ ] Is the node low on CPU?
[ ] Is the node low on memory?
[ ] Is the node low on disk?
[ ] Is there PID pressure?
[ ] Is CNI healthy?
[ ] Is CSI healthy?
[ ] Are Pods scheduled?
[ ] Are Pods Ready?
[ ] Are images available?
[ ] Are probes failing?
[ ] Are NetworkPolicies blocking traffic?
[ ] Are volumes mounting?
[ ] Are node certificates valid?
[ ] Are DaemonSets consuming capacity?
[ ] Are system processes consuming resources?
```

---

# 116. Useful Commands

## Nodes

```bash
kubectl get nodes
kubectl get nodes -o wide
kubectl get nodes --show-labels
kubectl describe node <node>
```

## Utilization

```bash
kubectl top nodes
kubectl top pods -A
```

## Scheduling

```bash
kubectl get pods -A
kubectl get pods -A --field-selector=status.phase=Pending
```

## Maintenance

```bash
kubectl cordon <node>
kubectl drain <node>
kubectl uncordon <node>
```

## Events

```bash
kubectl get events -A
```

## Node Systemd

```bash
systemctl status kubelet
journalctl -u kubelet
```

## Runtime

When `crictl` is configured:

```bash
crictl ps
crictl ps -a
crictl images
```

---

# 117. Production Worker Node Checklist

## Compute

```text
[ ] Correct CPU size
[ ] Correct memory size
[ ] Capacity headroom
[ ] Failure-domain distribution
[ ] Autoscaling where required
```

## Operating System

```text
[ ] Supported OS
[ ] Regular patching
[ ] Time synchronization
[ ] Security hardening
[ ] Disk encryption where required
```

## Kubernetes

```text
[ ] kubelet healthy
[ ] Supported version
[ ] Correct certificates
[ ] Runtime healthy
[ ] CNI healthy
[ ] CSI healthy
```

## Security

```text
[ ] Restricted node access
[ ] Secure kubelet
[ ] Container runtime hardening
[ ] Pod security
[ ] Privileged workload control
```

## Observability

```text
[ ] Node metrics
[ ] Container metrics
[ ] Logs
[ ] Alerts
[ ] Disk monitoring
[ ] Memory monitoring
```

---

# 118. Worker Node Design Example

A production node can conceptually look like:

```text
                         WORKER NODE
                              |
        +---------------------+---------------------+
        |                     |                     |
        v                     v                     v
     kubelet            Container Runtime          CNI
        |                     |                     |
        |                     v                     |
        |                 Containers                |
        |                                           |
        +---------------------+---------------------+
                              |
                              v
                             Pods
                              |
               +--------------+--------------+
               |              |              |
               v              v              v
           Application     Sidecar        Agent
```

Additional node components may include CSI plugins, logging agents, monitoring agents, and security agents.

---

# 119. Worker Node vs Control Plane

| Feature | Worker Node | Control Plane |
|---|---|---|
| Runs application Pods | Yes | Normally avoided in dedicated designs |
| kubelet | Yes | May exist depending on architecture |
| Container runtime | Yes | May exist depending on architecture |
| Scheduler | No | Yes |
| Controller Manager | No | Yes |
| API Server | No | Yes |
| etcd | No | Yes / external |
| Provides compute | Yes | Primarily management |
| Executes containers | Yes | Not normally the purpose |

---

# 120. Worker Node vs Pod

```text
Worker Node
 |
 +-- Pod 1
 |    +-- Container
 |
 +-- Pod 2
 |    +-- Container
 |    +-- Sidecar
 |
 +-- Pod 3
      +-- Container
```

A node is the infrastructure; a Pod is the Kubernetes workload unit.

---

# 121. Worker Node vs Container

```text
Worker Node
     |
     v
Pod
     |
     v
Container
```

Containers execute inside Pods, and Pods execute on worker nodes.

---

# 122. Worker Node Failure Recovery

A good recovery strategy includes:

```text
Detect
 |
 v
Cordon / Isolate
 |
 v
Drain if Possible
 |
 v
Recover / Replace Node
 |
 v
Validate
 |
 v
Uncordon
 |
 v
Monitor
```

For a hard infrastructure failure, automated workload rescheduling may happen without an orderly drain.

---

# 123. Worker Node Security Model

Think in layers:

```text
Physical / Cloud Infrastructure
        |
        v
Operating System
        |
        v
Kernel
        |
        v
Container Runtime
        |
        v
kubelet
        |
        v
Pod Security
        |
        v
Application
```

Each layer needs appropriate controls.

---

# 124. Worker Node Mental Model

The easiest way to remember the worker node is:

```text
Control Plane
     |
     | "Run this Pod here"
     v
kubelet
     |
     | "Make the Pod real"
     v
Container Runtime
     |
     | "Run the container"
     v
Container
     |
     v
Application
```

At the same time:

```text
CNI -> Networking
CSI -> Storage
kubelet -> Lifecycle / Probes
OS -> Kernel / Resources
```

---

# 125. Complete Worker Node Flow

```text
                       CONTROL PLANE
                             |
                             v
                        API Server
                             |
                             v
                         kubelet
                             |
                +------------+------------+
                |            |            |
                v            v            v
             Probes       Volumes       Runtime
                             |            |
                             v            v
                            CSI       Containers
                             |
                             v
                         Storage

                CNI
                 |
                 v
              Networking
```

---

# 126. Practical Troubleshooting Flow

When a node has a problem:

```text
Node NotReady?
     |
     v
Check Conditions
     |
     v
Check kubelet
     |
     v
Check Container Runtime
     |
     v
Check CNI
     |
     v
Check CSI
     |
     v
Check CPU / Memory / Disk / PID
     |
     v
Check Certificates
     |
     v
Check Network
     |
     v
Check OS / Kernel
```

---

# 127. Interview Questions

## Beginner

### What is a Kubernetes worker node?

A machine that provides compute capacity for running Kubernetes Pods.

### What runs on a worker node?

Typically:

```text
kubelet
Container Runtime
Networking Components
Storage Components
Pods
```

### What is kubelet?

The node agent responsible for managing Pods assigned to the node.

### What is a container runtime?

The software responsible for creating and running containers.

### What is CRI?

Container Runtime Interface, the interface through which Kubernetes integrates with container runtimes.

---

## Intermediate

### Does kubelet schedule Pods?

No. The scheduler selects a node; kubelet manages the Pod after it is assigned to that node.

### What happens when a Pod is assigned to a node?

The kubelet observes the assignment, prepares the Pod, works with networking/storage components, asks the runtime to create containers, and reports status.

### What is the difference between capacity and allocatable?

Capacity is total recognized node capacity; allocatable is what is made available to Pods after reservations and configuration.

### What is cordon?

Marks a node unschedulable for new Pods.

### What is drain?

Evicts eligible workloads from a node for maintenance.

### What is uncordon?

Makes a node schedulable again.

### What is ImagePullBackOff?

A state indicating repeated image-pull failure with increasing retry delays.

---

## Advanced

### What happens if a worker node fails?

The control plane detects node health changes. Controller-managed workloads can be recreated on suitable nodes, provided capacity, storage, topology, and workload constraints allow it.

### What is node pressure?

A condition where a node is experiencing resource constraints such as memory, disk, or PID pressure.

### What is the relationship between CNI and worker nodes?

CNI components configure Pod networking on worker nodes.

### What is the relationship between CSI and worker nodes?

CSI node components help mount and manage storage for Pods on worker nodes.

### Why are DaemonSets important to worker-node design?

They commonly run node-level agents such as logging, monitoring, networking, and security components, consuming resources that must be included in capacity planning.

### Why should nodes have resource headroom?

Headroom allows nodes to absorb workload spikes, rolling updates, DaemonSets, and failures without immediately exhausting capacity.

### Why is a worker node a security boundary?

It hosts workloads and has access to runtime, kernel, network, storage, and Kubernetes node credentials. Compromise can affect workloads running on the node.

---

# 128. Key Relationships

## Node Execution

```text
Pod
 |
 v
kubelet
 |
 v
CRI
 |
 v
Container Runtime
 |
 v
Container
```

## Networking

```text
Pod
 |
 v
CNI
 |
 v
Node Network
 |
 v
Cluster Network
```

## Storage

```text
Pod
 |
 v
kubelet
 |
 v
CSI
 |
 v
Storage Backend
```

## Scheduling

```text
Pod
 |
 v
Scheduler
 |
 v
Worker Node
 |
 v
kubelet
```

## Pressure

```text
Node Pressure
 |
 +-- Memory
 +-- Disk
 +-- PID
 |
 v
kubelet
 |
 v
Eviction
```

---

# 129. Final Key Takeaways

```text
1. Worker nodes provide compute capacity for Kubernetes workloads.

2. Pods normally run on worker nodes.

3. kubelet is the primary node agent.

4. The scheduler chooses which node receives a Pod.

5. kubelet ensures assigned Pods are running.

6. The container runtime executes containers.

7. Kubernetes communicates with runtimes through CRI.

8. containerd and CRI-O are common container runtimes.

9. CNI provides the cluster networking integration.

10. CSI provides storage integration.

11. kube-proxy may implement Service networking, depending on the cluster networking architecture.

12. Nodes are represented as Kubernetes Node objects.

13. Nodes expose Capacity and Allocatable resources.

14. Scheduling considers resource requests.

15. Node labels influence placement.

16. Node affinity provides advanced placement rules.

17. Taints restrict scheduling.

18. Tolerations allow Pods to tolerate matching taints.

19. Cordon prevents new scheduling.

20. Drain prepares nodes for maintenance.

21. Uncordon enables scheduling again.

22. kubelet executes startup, readiness, and liveness probes.

23. Nodes can experience memory, disk, and PID pressure.

24. Kubelet can evict Pods under node pressure.

25. QoS classes influence workload behavior during resource pressure.

26. DaemonSets commonly provide node-level agents.

27. Node capacity must include system and DaemonSet overhead.

28. Worker nodes should maintain capacity headroom.

29. Worker nodes need secure operating systems and runtimes.

30. kubelet access must be protected.

31. Privileged containers increase node risk.

32. Node maintenance should normally use cordon and drain.

33. Node failures can trigger workload recovery through Kubernetes controllers.

34. Persistent data should not rely on node-local ephemeral storage unless explicitly designed that way.

35. Worker nodes should be distributed across failure domains for resilient applications.

36. Node pools simplify workload placement and scaling.

37. Specialized nodes can support GPUs and other devices through device plugins.

38. Cluster autoscaling can add or remove worker nodes.

39. Node observability should include CPU, memory, disk, network, processes, and Pod health.

40. Worker-node troubleshooting should start with Node conditions, kubelet, runtime, networking, storage, and resource pressure.

41. The core worker-node model is:

       Scheduler
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
      Containers
          |
          v
     Application

42. Supporting node systems provide:

       CNI -> Networking
       CSI -> Storage
       OS  -> Kernel / Resources
       Agents -> Monitoring / Logging / Security
```

---

# 130. Quick Reference

## Node

```bash
kubectl get nodes
kubectl get nodes -o wide
kubectl get nodes --show-labels
kubectl describe node <node>
```

## Resource Usage

```bash
kubectl top nodes
kubectl top pods -A
```

## Maintenance

```bash
kubectl cordon <node>
kubectl drain <node>
kubectl uncordon <node>
```

## Events

```bash
kubectl get events -A
```

## Kubelet

```bash
systemctl status kubelet
journalctl -u kubelet
```

## Container Runtime

If `crictl` is configured:

```bash
crictl ps
crictl ps -a
crictl images
```

## Pods on a Node

```bash
kubectl get pods -A -o wide
```

## Nodes by Label

```bash
kubectl get nodes -l workload=compute
```

---

> **Core worker-node principle:** The worker node is the execution layer of Kubernetes. The control plane decides what should happen, the scheduler determines where workloads should run, and the worker node—with kubelet, the container runtime, networking, storage, and the operating system—makes those workloads actually run.
