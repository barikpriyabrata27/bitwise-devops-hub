# Kubernetes Pods

> A Pod is the smallest deployable unit in Kubernetes. It represents one or more containers that are scheduled and managed together on the same node and share networking, storage volumes, and lifecycle characteristics.

---

## 1. What Is a Pod?

A Pod is the fundamental execution unit in Kubernetes.

```text
Kubernetes Cluster
 |
 +-- Worker Node
      |
      +-- Pod
           |
           +-- Container
           |
           +-- Container
```

Most application Pods contain one main application container.

Some Pods contain multiple containers that work closely together.

---

# 2. Why Kubernetes Uses Pods

Kubernetes does not schedule individual containers directly.

Instead:

```text
Scheduler
    |
    v
Pod
    |
    +-- Container A
    +-- Container B
```

The Pod is the scheduling and lifecycle unit.

This allows closely related containers to:

- Share a network namespace
- Share volumes
- Start and stop together
- Communicate through localhost
- Be managed as one workload unit

---

# 3. Pod Architecture

A simplified Pod looks like:

```text
                       POD
                        |
          +-------------+-------------+
          |                           |
          v                           v
     Shared Network              Shared Volumes
          |                           |
          v                           v
   +------+------+                +------+
   |             |                | Data |
   v             v                +------+
Container A   Container B
```

Containers inside the same Pod share the Pod network namespace.

---

# 4. Pod vs Container

These are different concepts.

### Container

A process packaged with its dependencies and isolated using container technology.

### Pod

A Kubernetes abstraction that manages one or more related containers.

```text
Pod
 |
 +-- Container
```

or:

```text
Pod
 |
 +-- Application Container
 +-- Sidecar Container
```

---

# 5. Pod vs Virtual Machine

| Feature | Pod | Virtual Machine |
|---|---|---|
| Unit | Kubernetes workload | Virtualized machine |
| OS | Shares node kernel in typical Linux containers | Has guest OS |
| Startup | Usually fast | Usually slower |
| Isolation | Container/process isolation | Hardware/VM isolation |
| Networking | Pod network namespace | Virtual NIC |
| Resource overhead | Lower | Higher |
| Scheduling | Kubernetes | Hypervisor/cloud platform |

Pods and VMs solve different layers of the infrastructure problem.

---

# 6. Single-Container Pod

The most common application pattern is:

```text
Pod
 |
 +-- Application Container
```

Example:

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: web

spec:
  containers:
    - name: web
      image: nginx:latest
```

---

# 7. Multi-Container Pod

A Pod can contain multiple containers.

Example:

```text
Pod
 |
 +-- Application
 |
 +-- Sidecar
```

Common use cases include:

```text
Logging
Proxying
Security
Metrics
Configuration
Service Mesh
```

---

# 8. Pod Design Principle

A useful rule is:

> Put containers in the same Pod when they need to be scheduled, networked, and managed together.

Do not put unrelated applications into the same Pod merely because they are deployed at the same time.

---

# 9. Pod Lifecycle

A simplified lifecycle is:

```text
Pod Created
    |
    v
Pending
    |
    v
Scheduled
    |
    v
Container Creation
    |
    v
Running
    |
    +-- Ready
    |
    v
Succeeded / Failed
```

The exact lifecycle depends on the workload and container behavior.

---

# 10. Pod Phases

Kubernetes exposes Pod phases such as:

```text
Pending
Running
Succeeded
Failed
Unknown
```

These are high-level lifecycle indicators.

They should not be confused with container states or readiness.

---

# 11. Pending

A Pod can remain Pending when:

```text
No Suitable Node
Insufficient CPU
Insufficient Memory
Taints
Affinity Constraints
Topology Constraints
Unbound Storage
Image Preparation
```

Check:

```bash
kubectl describe pod <pod>
```

The Events section is often especially useful.

---

# 12. Running

A Pod is in the Running phase when it has been scheduled and at least one container is running or is in the process of starting.

Running does not necessarily mean:

```text
Application is Ready
```

Readiness must be evaluated separately.

---

# 13. Succeeded

A Pod may reach Succeeded when all containers have terminated successfully according to the Pod's workload semantics.

This is common with:

```text
Jobs
Batch Processing
One-Time Tasks
```

---

# 14. Failed

A Pod may reach Failed when its containers terminate unsuccessfully according to the Pod lifecycle semantics.

Investigate:

```bash
kubectl describe pod <pod>
kubectl logs <pod>
```

---

# 15. Unknown

Unknown can occur when Kubernetes cannot reliably determine the Pod's current state, often because of communication problems with the node.

Investigate:

```text
Node Health
kubelet
Network
Control Plane Connectivity
```

---

# 16. Pod Conditions

Pod conditions provide more detailed information than the Pod phase.

Common conditions include:

```text
PodScheduled
Initialized
ContainersReady
Ready
```

Conceptually:

```text
Pod
 |
 +-- Scheduled
 +-- Initialized
 +-- ContainersReady
 +-- Ready
```

---

# 17. Pod Ready vs Running

This distinction is extremely important.

```text
Running != Ready
```

Example:

```text
Pod
 |
 +-- Container Running
 |
 +-- Readiness Probe Failing
 |
 v
Pod Not Ready
```

A Pod can be running but excluded from normal Service traffic because it is not Ready.

---

# 18. Pod IP

Pods normally receive their own IP address.

Example:

```text
Pod A -> 10.244.1.10
Pod B -> 10.244.1.11
```

Pod IPs are generally ephemeral.

Do not hard-code Pod IPs for application communication.

Use:

```text
Service
DNS
```

instead.

---

# 19. Pod Networking

All containers within the same Pod share the Pod network namespace.

Therefore:

```text
Container A
    |
    +-- localhost
    |
Container B
```

Container A can reach Container B using:

```text
localhost:<port>
```

provided the application is listening appropriately.

---

# 20. Containers in the Same Pod

Example:

```text
Pod IP: 10.244.1.20

Container A -> port 8080
Container B -> port 9090
```

Both containers use the same Pod network namespace.

Therefore:

```text
localhost:8080
localhost:9090
```

refer to the same Pod network environment.

---

# 21. Port Conflicts in a Pod

Because containers share the Pod network namespace, two containers cannot normally bind the same IP/port combination.

Bad:

```text
Container A -> 8080
Container B -> 8080
```

Good:

```text
Container A -> 8080
Container B -> 9090
```

---

# 22. Pod Storage

Containers in a Pod can share volumes.

```text
Pod
 |
 +-- Container A
 |
 +-- Container B
 |
 +-- Shared Volume
```

Example:

```yaml
volumes:
  - name: shared-data
    emptyDir: {}
```

Then mount it into multiple containers.

---

# 23. emptyDir

`emptyDir` provides temporary storage for a Pod.

```yaml
volumes:
  - name: shared
    emptyDir: {}
```

The volume exists for the Pod's lifetime.

It can be used for:

```text
Temporary Files
Shared Files
Scratch Space
Container Coordination
```

It should not normally be used for durable application data.

---

# 24. Persistent Storage in Pods

For durable storage:

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

A Pod normally consumes persistent storage through a PVC.

Example:

```yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: app-data
```

---

# 25. Pod Environment Variables

Environment variables can be defined directly:

```yaml
env:
  - name: APP_ENV
    value: production
```

Or loaded from:

```text
ConfigMap
Secret
```

Example:

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

---

# 26. ConfigMap in a Pod

ConfigMaps provide non-sensitive configuration.

Example:

```yaml
envFrom:
  - configMapRef:
      name: application-config
```

Or mounted as a file:

```yaml
volumes:
  - name: config
    configMap:
      name: application-config
```

---

# 27. Secret in a Pod

Secrets are intended for sensitive configuration.

Example:

```yaml
envFrom:
  - secretRef:
      name: database-credentials
```

Secrets still require appropriate access control and encryption practices.

Do not assume a Kubernetes Secret is automatically safe simply because its type is `Secret`.

---

# 28. Pod Security Context

A Pod can define security settings.

Example:

```yaml
securityContext:
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault
```

Security contexts can help control:

```text
User
Group
Capabilities
Privilege Escalation
Filesystem Access
Seccomp
```

---

# 29. Container Security Context

Security settings can also be configured per container.

Example:

```yaml
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

Use least privilege whenever practical.

---

# 30. Pod Service Account

A Pod can run using a Kubernetes ServiceAccount.

Example:

```yaml
serviceAccountName: application
```

The ServiceAccount can be granted permissions through RBAC.

Conceptually:

```text
Pod
 |
 v
ServiceAccount
 |
 v
RBAC
 |
 v
Kubernetes API Permissions
```

---

# 31. Avoid Default Credentials When Possible

Applications should use dedicated ServiceAccounts when they need Kubernetes API access.

Avoid granting unnecessary permissions.

Bad:

```text
Application
 |
 v
cluster-admin
```

Better:

```text
Application
 |
 v
Dedicated ServiceAccount
 |
 v
Least-Privilege Role
```

---

# 32. Pod Restart Policy

Pod restart policies include:

```text
Always
OnFailure
Never
```

For long-running controller-managed applications, `Always` is common.

Jobs commonly use different lifecycle semantics.

---

# 33. Pod Container States

Containers can have states such as:

```text
Waiting
Running
Terminated
```

Example:

```text
Container
 |
 +-- Waiting
 |
 +-- Running
 |
 +-- Terminated
```

This is different from the Pod phase.

---

# 34. Waiting State

A container may be Waiting because:

```text
Image Pulling
Image Pull Failure
Backoff
Startup Preparation
```

Inspect:

```bash
kubectl describe pod <pod>
```

---

# 35. Running State

A container is Running when the runtime reports that it has started.

This does not guarantee application readiness.

```text
Container Running
       |
       v
Readiness Probe
       |
       +-- Pass -> Ready
       |
       +-- Fail -> Not Ready
```

---

# 36. Terminated State

A container can terminate with:

```text
Exit Code
Reason
Signal
Start Time
Finish Time
```

Inspect:

```bash
kubectl describe pod <pod>
```

and:

```bash
kubectl logs <pod>
```

---

# 37. OOMKilled

A common container termination reason is:

```text
OOMKilled
```

This usually indicates the container was killed because it exceeded its memory limit or the node experienced memory pressure, depending on the circumstances.

Investigate:

```bash
kubectl describe pod <pod>
kubectl top pod <pod>
```

when metrics are available.

---

# 38. CrashLoopBackOff

`CrashLoopBackOff` means a container is repeatedly failing and Kubernetes is backing off before restarting it again.

Common causes:

```text
Application Crash
Configuration Error
Missing Secret
Missing ConfigMap
Wrong Command
Dependency Failure
Incorrect Probe
Permission Problem
```

Use:

```bash
kubectl logs <pod>
kubectl logs <pod> --previous
kubectl describe pod <pod>
```

---

# 39. ImagePullBackOff

This occurs when the image cannot be pulled successfully.

Check:

```text
Image Name
Image Tag
Registry
Credentials
Network
Image Architecture
```

Commands:

```bash
kubectl describe pod <pod>
```

---

# 40. Pod Restart Count

Check:

```bash
kubectl get pods
```

Example:

```text
NAME          READY   STATUS             RESTARTS
payment-api   1/1     Running            0
worker        1/1     Running            5
```

Repeated restarts may indicate:

```text
Application Crash
OOMKilled
Probe Failure
Configuration Error
Dependency Failure
```

---

# 41. Readiness Probe

A readiness probe determines whether the application is ready to receive traffic.

Example:

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
```

Conceptually:

```text
Probe Pass
   |
   v
Pod Ready
   |
   v
Service Can Route Traffic
```

---

# 42. Liveness Probe

A liveness probe determines whether the container should be considered unhealthy enough to restart.

Example:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
```

Conceptually:

```text
Liveness Failure
      |
      v
Container Restart
```

---

# 43. Startup Probe

Startup probes protect slow-starting applications.

Example:

```yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080
```

Flow:

```text
Container Starts
      |
      v
Startup Probe
      |
      v
Startup Successful
      |
      +--> Readiness / Liveness
```

---

# 44. Probe Types

Probes can commonly use:

```text
HTTP
TCP
gRPC
Exec
```

Choose the probe type based on the application.

---

# 45. Probe Timing

Probe configuration can include:

```text
initialDelaySeconds
periodSeconds
timeoutSeconds
successThreshold
failureThreshold
```

Example:

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
```

Poorly configured probes can cause unnecessary restarts or traffic removal.

---

# 46. Readiness vs Liveness

| Probe | Main Question | Typical Action |
|---|---|---|
| Readiness | Can this container receive traffic? | Remove from ready endpoints |
| Liveness | Is this container healthy enough to keep running? | Restart container |
| Startup | Has this container finished starting? | Delay normal probe behavior |

---

# 47. Probes and Services

A simplified flow:

```text
Pod
 |
 +-- Readiness Probe
 |
 +-- Ready
      |
      v
Service Endpoint
      |
      v
Traffic
```

If readiness fails:

```text
Pod
 |
 +-- Not Ready
      |
      v
Removed from normal ready endpoints
```

---

# 48. Pod Resource Requests

Example:

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
```

Requests influence scheduling.

The scheduler looks for a node with sufficient allocatable capacity.

---

# 49. Pod Resource Limits

Example:

```yaml
resources:
  limits:
    cpu: "1"
    memory: "512Mi"
```

Limits define resource ceilings according to Kubernetes/runtime/OS mechanisms.

Memory limits are especially important because exceeding them can result in an OOM kill.

---

# 50. QoS Classes

Kubernetes classifies Pods into:

```text
Guaranteed
Burstable
BestEffort
```

Resource requests and limits influence the classification.

This affects behavior under resource pressure.

---

# 51. Guaranteed Pod

A typical Guaranteed configuration:

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

For multi-container Pods, the QoS classification considers all relevant containers.

---

# 52. Burstable Pod

A Pod with resource requests/limits that does not qualify for Guaranteed is commonly Burstable.

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

# 53. BestEffort Pod

A Pod with no CPU or memory requests/limits is generally BestEffort.

Example:

```yaml
containers:
  - name: app
    image: example/app:1.0
```

---

# 54. Pod Priority

Pods can be assigned priority classes.

Example concept:

```text
High Priority
Medium Priority
Low Priority
```

Priority can influence scheduling and preemption.

Use priority carefully because preemption can displace lower-priority workloads.

---

# 55. Pod Affinity

Pod affinity can encourage Pods to be placed near other Pods.

Example concept:

```text
API Pod
   |
   +-- Prefer same zone as cache
```

Useful for:

```text
Latency
Locality
Co-location
```

---

# 56. Pod Anti-Affinity

Pod anti-affinity can spread replicas.

Example:

```text
Replica 1 -> Node A
Replica 2 -> Node B
Replica 3 -> Node C
```

This can improve availability.

---

# 57. Topology Spread Constraints

Topology spread constraints can distribute Pods across failure domains.

Example:

```text
Zone A -> 2 Pods
Zone B -> 2 Pods
Zone C -> 2 Pods
```

This can reduce concentration of replicas in one zone or node.

---

# 58. Pod Scheduling Constraints

Pods can use:

```text
nodeSelector
nodeAffinity
podAffinity
podAntiAffinity
topologySpreadConstraints
tolerations
priority
resources
```

These collectively influence placement.

---

# 59. Pod Names

Pods have unique names within their namespace.

Example:

```text
payment-api-6f8d9c7b7d-x8k2m
```

Pods created by Deployments often receive generated names.

---

# 60. Pod Labels

Labels identify and group Pods.

Example:

```yaml
labels:
  app: payment-api
  environment: production
```

Labels are used by:

```text
Services
Deployments
Selectors
NetworkPolicies
Monitoring
Automation
```

---

# 61. Pod Selectors

A Service can select Pods:

```yaml
selector:
  app: payment-api
```

Conceptually:

```text
Service
 |
 +-- selector: app=payment-api
 |
 +-- Pod A
 +-- Pod B
 +-- Pod C
```

---

# 62. Pod Annotations

Annotations store metadata that is not normally used as a selector.

Example:

```yaml
annotations:
  owner: platform-team
```

Annotations are often used by:

```text
Ingress Controllers
Monitoring Systems
Operators
Automation
Platform Tools
```

---

# 63. Pod Namespace

Every normal Pod belongs to a namespace.

Example:

```text
production
 |
 +-- payment-api
 +-- order-api
```

Namespace affects:

```text
Names
RBAC
Quotas
NetworkPolicy Scope
Resource Management
```

---

# 64. Pod Manifest

A simple Pod manifest:

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: web

spec:
  containers:
    - name: web
      image: nginx:1.27
      ports:
        - containerPort: 80
```

---

# 65. Pod Manifest Structure

```text
Pod YAML
 |
 +-- apiVersion
 +-- kind
 +-- metadata
 |    +-- name
 |    +-- namespace
 |    +-- labels
 |    +-- annotations
 |
 +-- spec
      +-- containers
      +-- volumes
      +-- securityContext
      +-- affinity
      +-- tolerations
      +-- serviceAccount
```

---

# 66. `kubectl apply`

Create/update a Pod from a manifest:

```bash
kubectl apply -f pod.yaml
```

Check:

```bash
kubectl get pod web
```

Describe:

```bash
kubectl describe pod web
```

---

# 67. `kubectl run`

For quick testing:

```bash
kubectl run nginx --image=nginx
```

This is useful for temporary experiments but production workloads are generally managed through declarative manifests and workload controllers.

---

# 68. Get Pods

```bash
kubectl get pods
```

Across all namespaces:

```bash
kubectl get pods -A
```

Wide output:

```bash
kubectl get pods -o wide
```

---

# 69. Describe a Pod

```bash
kubectl describe pod <pod-name>
```

Useful information includes:

```text
Node
IP
Containers
Images
Environment
Volumes
Conditions
Events
Probes
Restart Count
```

---

# 70. Pod Logs

Basic logs:

```bash
kubectl logs <pod>
```

Specific container:

```bash
kubectl logs <pod> -c <container>
```

Previous container instance:

```bash
kubectl logs <pod> --previous
```

---

# 71. Execute Commands in a Pod

```bash
kubectl exec -it <pod> -- /bin/sh
```

Specific container:

```bash
kubectl exec -it <pod> -c <container> -- /bin/sh
```

Use this carefully in production.

Debug containers and ephemeral containers may be preferable for troubleshooting when the application image lacks diagnostic tools.

---

# 72. Port Forwarding

For temporary local access:

```bash
kubectl port-forward pod/<pod-name> 8080:8080
```

This creates a local tunnel to the Pod.

It is useful for:

```text
Development
Debugging
Testing
```

It is not a production exposure mechanism.

---

# 73. Copy Files

You can copy files using:

```bash
kubectl cp <namespace>/<pod>:/path/file ./file
```

This is useful for diagnostics but should not replace proper application storage or artifact handling.

---

# 74. Delete a Pod

```bash
kubectl delete pod <pod>
```

If a Pod is managed by a Deployment, ReplicaSet, StatefulSet, or another controller, it may be recreated.

---

# 75. Standalone Pods vs Managed Pods

### Standalone Pod

```text
Pod
```

If it dies, Kubernetes does not necessarily create a replacement.

### Deployment-managed Pod

```text
Deployment
 |
 v
ReplicaSet
 |
 v
Pod
```

The controller maintains the desired replica count.

For production applications, use workload controllers rather than unmanaged Pods in most cases.

---

# 76. Pods and Deployments

Typical architecture:

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

The Deployment manages rollout and desired replica state.

---

# 77. Pods and StatefulSets

Stateful workloads may use:

```text
StatefulSet
 |
 +-- Pod-0
 +-- Pod-1
 +-- Pod-2
```

StatefulSets provide stable identities and ordered behavior according to their configuration.

---

# 78. Pods and DaemonSets

DaemonSets run Pods on eligible nodes.

```text
DaemonSet
 |
 +-- Node 1 -> Pod
 +-- Node 2 -> Pod
 +-- Node 3 -> Pod
```

Common for node-level agents.

---

# 79. Pods and Jobs

Jobs create Pods for completion-oriented work.

```text
Job
 |
 v
Pod
 |
 v
Complete
```

Examples:

```text
Database Migration
Batch Processing
Data Export
One-Time Task
```

---

# 80. Pods and CronJobs

CronJobs create Jobs according to a schedule.

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

Example use cases:

```text
Nightly Cleanup
Scheduled Reports
Backups
Periodic Data Processing
```

---

# 81. Pod Lifecycle Controllers

Pods are commonly managed by:

```text
Deployment
StatefulSet
DaemonSet
Job
CronJob
Operator
```

Controllers provide desired-state management around Pods.

---

# 82. Pod Deletion

When a Pod is deleted:

```text
Deletion Request
      |
      v
Graceful Termination
      |
      v
Container Stop
      |
      v
Pod Removed
```

Termination behavior can involve:

```text
PreStop Hook
SIGTERM
terminationGracePeriodSeconds
SIGKILL
```

---

# 83. Graceful Shutdown

Applications should handle termination signals properly.

Conceptually:

```text
Pod Termination
      |
      v
SIGTERM
      |
      v
Application Cleanup
      |
      v
Exit
```

If the application does not terminate within the configured grace period, the container can be forcibly terminated.

---

# 84. terminationGracePeriodSeconds

Example:

```yaml
spec:
  terminationGracePeriodSeconds: 30
```

This gives the application time to shut down gracefully.

Use an appropriate value based on application behavior.

---

# 85. Lifecycle Hooks

Kubernetes supports container lifecycle hooks such as:

```text
postStart
preStop
```

Example:

```yaml
lifecycle:
  preStop:
    exec:
      command:
        - /bin/sh
        - -c
        - "sleep 5"
```

Hooks should be used carefully because they add lifecycle complexity.

---

# 86. Sidecar Pattern

A sidecar container supports the primary application.

```text
Pod
 |
 +-- Main Application
 |
 +-- Sidecar
```

Examples:

```text
Proxy
Log Processor
Configuration Agent
Security Agent
```

Sidecars share the Pod's network and can share volumes.

---

# 87. Ambassador Pattern

An ambassador container can act as a proxy for communication.

```text
Application
    |
    v
Ambassador
    |
    v
External Service
```

This can simplify application communication patterns.

---

# 88. Adapter Pattern

An adapter container can transform application output into a format expected by another system.

```text
Application
    |
    v
Adapter
    |
    v
Monitoring / External System
```

---

# 89. Init Containers

Init containers run before application containers.

```text
Pod
 |
 +-- Init Container
 |
 +-- Init Container
 |
 +-- Application Container
```

They are useful for:

```text
Initialization
Dependency Preparation
Configuration Generation
Database Setup
Permissions
```

---

# 90. Init Container Example

```yaml
initContainers:
  - name: init-config
    image: busybox
    command:
      - sh
      - -c
      - "echo initializing"
```

Application containers start only after init containers complete successfully.

---

# 91. Init Container vs Sidecar

| Feature | Init Container | Sidecar |
|---|---|---|
| Runs before app | Yes | Usually no |
| Continues running | No | Usually yes |
| Initialization | Excellent | Possible |
| Shared volume | Yes | Yes |
| Shared network | Yes | Yes |

---

# 92. Ephemeral Containers

Ephemeral containers are intended primarily for debugging running Pods.

Conceptually:

```text
Pod
 |
 +-- Application Container
 |
 +-- Ephemeral Debug Container
```

They are useful when the main image does not contain tools such as:

```text
Shell
curl
netstat
dig
tcpdump
```

Use appropriate security controls.

---

# 93. Pod Debugging

A common troubleshooting sequence:

```text
kubectl get pod
      |
      v
kubectl describe pod
      |
      v
kubectl logs
      |
      v
kubectl logs --previous
      |
      v
Check Events
      |
      v
Check Resources
      |
      v
Check Probes
      |
      v
Check Network
      |
      v
Check Storage
```

---

# 94. Pod Events

Events often reveal the immediate reason for a problem.

Example categories:

```text
Scheduled
Pulled
Created
Started
Failed
Unhealthy
Killing
Evicted
FailedScheduling
FailedMount
```

Command:

```bash
kubectl describe pod <pod>
```

---

# 95. Pod Networking Troubleshooting

Check:

```text
Pod IP
Service
DNS
CNI
NetworkPolicy
Routes
Container Listening Port
```

Commands:

```bash
kubectl get pod -o wide
kubectl get svc
kubectl get endpointslices
```

---

# 96. Pod Storage Troubleshooting

Check:

```text
PVC
PV
StorageClass
CSI
Mount Events
Permissions
```

Commands:

```bash
kubectl get pvc
kubectl get pv
kubectl describe pod <pod>
```

---

# 97. Pod Security Troubleshooting

Check:

```text
SecurityContext
ServiceAccount
RBAC
Pod Security
Capabilities
Filesystem Permissions
NetworkPolicy
```

A security policy can cause a Pod to be rejected before it even starts.

---

# 98. Pod Scheduling Troubleshooting

If Pending:

```bash
kubectl describe pod <pod>
```

Look for:

```text
Insufficient CPU
Insufficient Memory
Taint
Affinity
Anti-Affinity
Topology
PVC
Priority
```

---

# 99. Pod Resource Troubleshooting

If a Pod is slow or unstable:

```text
Check CPU
Check Memory
Check Requests
Check Limits
Check Node Pressure
Check Restarts
```

Commands:

```bash
kubectl top pod <pod>
kubectl describe pod <pod>
```

when metrics are available.

---

# 100. Pod Anti-Patterns

## Treating Pod IP as Permanent

Bad:

```text
Application -> Pod IP
```

Prefer:

```text
Application -> Service DNS
```

---

## Running Production Applications as Standalone Pods

Bad:

```text
kubectl run application
```

and relying on a single unmanaged Pod.

Prefer:

```text
Deployment
StatefulSet
DaemonSet
Job
```

depending on workload type.

---

## Putting Unrelated Applications in One Pod

Bad:

```text
Pod
 |
 +-- App A
 +-- App B
 +-- App C
```

unless they genuinely need to share lifecycle/network/storage.

---

## No Resource Requests

Without requests, scheduling and capacity planning become less predictable.

---

## Bad Probes

A liveness probe that is too aggressive can cause:

```text
Healthy Application
       |
       v
Probe Timeout
       |
       v
Restart
       |
       v
Repeated Failure
```

---

## Using Secrets Directly in Images

Never bake credentials into container images.

Prefer:

```text
Secret
 |
 v
Pod
```

---

# 101. Pod Security Checklist

```text
[ ] Run as non-root where possible
[ ] Drop unnecessary Linux capabilities
[ ] Disable privilege escalation where possible
[ ] Use seccomp
[ ] Avoid privileged containers
[ ] Restrict hostPath
[ ] Use read-only root filesystem where practical
[ ] Use dedicated ServiceAccounts
[ ] Apply least-privilege RBAC
[ ] Apply NetworkPolicies where appropriate
[ ] Scan container images
[ ] Keep images updated
```

---

# 102. Pod Production Checklist

```text
[ ] Managed by an appropriate controller
[ ] Resource requests defined
[ ] Resource limits reviewed
[ ] Readiness probe
[ ] Liveness probe where appropriate
[ ] Startup probe for slow applications
[ ] Graceful shutdown
[ ] Security context
[ ] ServiceAccount
[ ] ConfigMap / Secret strategy
[ ] Persistent storage if required
[ ] Labels
[ ] Appropriate affinity/topology
[ ] PodDisruptionBudget for critical workloads
[ ] Observability
[ ] Logging
[ ] NetworkPolicy where appropriate
```

---

# 103. Pod Availability Design

Suppose:

```text
Application replicas = 3
```

A resilient architecture can distribute them:

```text
Zone A -> Pod 1
Zone B -> Pod 2
Zone C -> Pod 3
```

Use:

```text
Topology Spread Constraints
Pod Anti-Affinity
PodDisruptionBudget
```

as appropriate.

---

# 104. Pod and Service Architecture

Typical application:

```text
                   Service
                      |
             +--------+--------+
             |        |        |
             v        v        v
           Pod A    Pod B    Pod C
             |        |        |
          Container Container Container
```

The Service provides a stable access point while Pods remain replaceable.

---

# 105. Pod and Ingress Architecture

```text
Internet
   |
   v
Ingress / Gateway
   |
   v
Service
   |
   +-- Pod
   +-- Pod
   +-- Pod
```

The Pod should not normally be directly exposed as the public endpoint.

---

# 106. Pod and Config Architecture

```text
ConfigMap
    |
    v
Pod
    |
    +-- Environment Variables
    |
    +-- Mounted Files
```

Sensitive data:

```text
Secret
    |
    v
Pod
```

---

# 107. Pod and Storage Architecture

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
CSI
 |
 v
Storage Backend
```

The Pod consumes the claim rather than normally managing the underlying storage directly.

---

# 108. Pod and Node Architecture

```text
Cluster
 |
 +-- Worker Node
      |
      +-- Pod A
      |    +-- Container
      |
      +-- Pod B
      |    +-- Container
      |
      +-- Pod C
           +-- Container
```

A Pod is scheduled to exactly one node at a time.

---

# 109. Pod and Controller Architecture

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

Controllers maintain desired state.

---

# 110. Complete Pod Mental Model

```text
                       POD
                        |
        +---------------+---------------+
        |               |               |
        v               v               v
    Networking       Storage         Lifecycle
        |               |               |
        v               v               v
     Pod IP          Volumes          Probes
        |               |               |
        +---------------+---------------+
                        |
                        v
                    Containers
                        |
              +---------+---------+
              |                   |
              v                   v
         Application            Sidecar
```

---

# 111. Complete Pod Lifecycle Flow

```text
User / Controller
       |
       v
API Server
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
       +--> Volumes
       |
       +--> CNI
       |
       +--> Runtime
       |
       v
Pod Sandbox
       |
       v
Init Containers
       |
       v
Application Containers
       |
       +--> Startup Probe
       +--> Readiness Probe
       +--> Liveness Probe
       |
       v
Running / Ready
       |
       v
Termination
       |
       v
Succeeded / Failed
```

---

# 112. Pod Troubleshooting Flow

```text
Pod Problem
    |
    +-- Pending?
    |      |
    |      +-- Scheduling / Storage / Constraints
    |
    +-- ImagePullBackOff?
    |      |
    |      +-- Image / Registry / Credentials
    |
    +-- CrashLoopBackOff?
    |      |
    |      +-- Logs / Config / Probes / Dependencies
    |
    +-- Not Ready?
    |      |
    |      +-- Readiness Probe / Dependency / App
    |
    +-- OOMKilled?
    |      |
    |      +-- Memory / Limits / Application
    |
    +-- Network Problem?
    |      |
    |      +-- DNS / Service / CNI / Policy
    |
    +-- Volume Problem?
           |
           +-- PVC / PV / CSI / Permissions
```

---

# 113. Interview Questions

## Beginner

### What is a Pod?

The smallest deployable unit in Kubernetes, containing one or more containers that share networking and storage and are managed together.

### Why doesn't Kubernetes schedule containers directly?

The Pod provides the lifecycle, networking, storage, and scheduling boundary for one or more closely related containers.

### Can a Pod have multiple containers?

Yes.

### Do containers in a Pod share an IP?

Yes. They share the Pod network namespace.

### Can containers in the same Pod communicate using localhost?

Yes, provided they use different ports when necessary.

---

## Intermediate

### What is the difference between Pod phase and container state?

Pod phase is a high-level Pod lifecycle classification, while container state describes an individual container as Waiting, Running, or Terminated.

### What is the difference between Running and Ready?

Running means the Pod has reached the running lifecycle phase; Ready indicates the Pod is considered ready to receive traffic according to its readiness conditions.

### What is a readiness probe?

A health check used to determine whether the application should receive traffic.

### What is a liveness probe?

A health check used to determine whether a container should be restarted.

### What is a startup probe?

A probe used to determine whether a slow-starting container has successfully initialized before normal readiness/liveness behavior takes over.

### Why use init containers?

To perform initialization tasks before application containers start.

### What is a sidecar?

A secondary container in the same Pod that supports the primary application.

---

## Advanced

### Why are Pods considered ephemeral?

Pods can be deleted, recreated, rescheduled, or replaced. Their IP addresses and local state should generally not be treated as permanent.

### How do Services relate to Pods?

Services provide stable access to groups of Pods selected by labels.

### How does a Deployment manage Pods?

A Deployment manages ReplicaSets, which maintain the desired number of Pods.

### What happens when a Pod fails?

If managed by a controller, the controller typically creates a replacement according to its desired state.

### Why should applications not depend on Pod IPs?

Pod IPs can change when Pods are recreated or rescheduled. Services and DNS provide stable discovery.

### What is CrashLoopBackOff?

A backoff state indicating that a container is repeatedly failing and Kubernetes is delaying subsequent restart attempts.

### What is OOMKilled?

A container termination condition indicating that the process was killed because of memory exhaustion/limit enforcement in the relevant circumstances.

### What is the purpose of a PodDisruptionBudget?

To limit voluntary disruptions to a workload so a configured level of availability can be maintained.

---

# 114. Key Relationships

## Pod

```text
Pod
 |
 +-- Container
 +-- Container
```

## Network

```text
Pod
 |
 +-- Shared Network Namespace
 |
 +-- Container A
 +-- Container B
```

## Storage

```text
Pod
 |
 +-- Volume
```

## Controller

```text
Deployment
 |
 v
ReplicaSet
 |
 v
Pods
```

## Service

```text
Service
 |
 v
Pod Selector
 |
 +-- Pod
 +-- Pod
 +-- Pod
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
 |
 v
kubelet
```

---

# 115. Final Key Takeaways

```text
1. A Pod is the smallest deployable unit in Kubernetes.

2. Kubernetes schedules Pods, not individual containers.

3. A Pod can contain one or multiple containers.

4. Containers in a Pod share the network namespace.

5. Containers in the same Pod can communicate through localhost.

6. Containers in a Pod can share volumes.

7. Pods receive IP addresses that should be treated as ephemeral.

8. Services provide stable access to changing Pods.

9. Pod phase and container state are different concepts.

10. Running does not necessarily mean Ready.

11. Readiness controls whether a Pod should receive traffic.

12. Liveness can trigger container restarts.

13. Startup probes protect slow-starting applications.

14. Init containers run before application containers.

15. Sidecars run alongside the main application container.

16. Ephemeral containers can assist with debugging.

17. Resource requests influence scheduling.

18. Resource limits constrain resource usage.

19. Pod QoS classes include Guaranteed, Burstable, and BestEffort.

20. Pod priority can influence scheduling and preemption.

21. Affinity and anti-affinity influence Pod placement.

22. Topology spread constraints can improve failure-domain distribution.

23. Pods should normally be managed by controllers for production workloads.

24. Deployments manage ReplicaSets and Pods.

25. StatefulSets provide stable identity for stateful workloads.

26. DaemonSets place Pods on eligible nodes.

27. Jobs manage completion-oriented Pods.

28. CronJobs create Jobs according to schedules.

29. Pod termination can involve SIGTERM and graceful shutdown.

30. Lifecycle hooks can run during container lifecycle transitions.

31. ConfigMaps provide non-sensitive configuration.

32. Secrets provide a Kubernetes mechanism for sensitive configuration but still require strong security controls.

33. ServiceAccounts provide workload identities for Kubernetes API access.

34. Security contexts can reduce container privileges.

35. NetworkPolicy can restrict Pod traffic depending on the CNI.

36. Persistent storage should use appropriate Kubernetes storage mechanisms rather than relying on ephemeral Pod storage.

37. `kubectl describe pod` is one of the most useful troubleshooting commands.

38. `kubectl logs --previous` is valuable for crash-looping containers.

39. Pending Pods should be investigated through scheduler events and constraints.

40. The central Pod mental model is:

       Controller
           |
           v
          Pod
           |
      +----+----+
      |         |
      v         v
  Container  Container
      |         |
      +----+----+
           |
       Shared Network
           |
       Shared Volumes

41. The core principle is:

       Pods are replaceable execution units.
       Services provide stable access.
       Controllers maintain desired state.
```

---

# 116. Quick Reference

## Create

```bash
kubectl apply -f pod.yaml
kubectl run nginx --image=nginx
```

## Inspect

```bash
kubectl get pods
kubectl get pods -A
kubectl get pod <pod> -o wide
kubectl describe pod <pod>
```

## Logs

```bash
kubectl logs <pod>
kubectl logs <pod> -c <container>
kubectl logs <pod> --previous
```

## Execute

```bash
kubectl exec -it <pod> -- /bin/sh
```

## Port Forward

```bash
kubectl port-forward pod/<pod> 8080:8080
```

## Resources

```bash
kubectl top pod <pod>
kubectl top pods -A
```

## Events

```bash
kubectl get events -A
```

## Delete

```bash
kubectl delete pod <pod>
```

---

> **Core Pod principle:** A Pod is the Kubernetes unit of scheduling and execution. It provides a shared network and storage context for one or more closely related containers, while controllers such as Deployments, StatefulSets, DaemonSets, and Jobs manage Pods according to the desired state of the application.
