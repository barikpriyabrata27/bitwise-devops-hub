# Kubernetes Deployments

> A Kubernetes Deployment is a workload controller used to manage stateless application Pods declaratively. It maintains the desired number of replicas, manages ReplicaSets, supports rolling updates and rollbacks, and continuously reconciles the desired state with the actual state.

---

## 1. What Is a Deployment?

A Deployment manages a set of identical application Pods.

The relationship is:

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

For example:

```yaml
replicas: 3
```

means the Deployment declares that three matching Pods should normally exist.

---

# 2. Why Use Deployments?

Deployments provide:

```text
Declarative Management
Replica Management
Rolling Updates
Rollback
Self-Healing
Version History
Scaling
Update Strategy
```

Instead of manually creating Pods:

```text
kubectl run app
```

you define the desired state:

```yaml
replicas: 3
image: myapp:2.0
```

Kubernetes continuously works toward that state.

---

# 3. Deployment Architecture

```text
                    Deployment
                         |
                         v
                    ReplicaSet
                         |
              +----------+----------+
              |          |          |
              v          v          v
            Pod A      Pod B      Pod C
              |          |          |
              v          v          v
          Container  Container  Container
```

During an update:

```text
Deployment
    |
    +-- Old ReplicaSet
    |      +-- Old Pods
    |
    +-- New ReplicaSet
           +-- New Pods
```

---

# 4. Deployment API

A typical Deployment uses:

```yaml
apiVersion: apps/v1
kind: Deployment
```

Example:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: payment-api

spec:
  replicas: 3

  selector:
    matchLabels:
      app: payment-api

  template:
    metadata:
      labels:
        app: payment-api

    spec:
      containers:
        - name: payment-api
          image: example/payment-api:1.0
```

---

# 5. Deployment Structure

The major sections are:

```text
Deployment
 |
 +-- apiVersion
 +-- kind
 +-- metadata
 |
 +-- spec
      |
      +-- replicas
      +-- selector
      +-- strategy
      +-- template
           |
           +-- metadata
           +-- spec
```

The `template` defines the Pods that the Deployment manages.

---

# 6. Deployment vs Pod

A Pod is an execution unit.

A Deployment is a controller.

```text
Deployment
    |
    v
Desired State
    |
    v
ReplicaSet
    |
    v
Pods
```

Use a Deployment when you need:

```text
Multiple Replicas
Self-Healing
Rolling Updates
Rollback
Scaling
```

---

# 7. Deployment vs ReplicaSet

A ReplicaSet maintains a desired number of matching Pods.

A Deployment manages ReplicaSets.

```text
Deployment
    |
    v
ReplicaSet
    |
    v
Pods
```

The Deployment adds higher-level rollout and revision management.

---

# 8. Desired State

Suppose:

```yaml
replicas: 3
```

The desired state is:

```text
3 Pods
```

If only two exist:

```text
Desired = 3
Actual  = 2
```

The controller works to create another Pod.

Eventually:

```text
Desired = 3
Actual  = 3
```

---

# 9. Deployment Controller

The Deployment controller continuously reconciles the Deployment.

Conceptually:

```text
Desired State
      |
      v
Deployment Controller
      |
      v
Observe ReplicaSets / Pods
      |
      v
Compare
      |
      v
Take Action
      |
      +-------> Observe Again
```

This is the Kubernetes reconciliation model.

---

# 10. Replica Management

If:

```yaml
replicas: 5
```

the Deployment ultimately manages five desired application Pods through its ReplicaSet.

```text
Deployment
    |
    v
ReplicaSet
    |
    +-- Pod 1
    +-- Pod 2
    +-- Pod 3
    +-- Pod 4
    +-- Pod 5
```

---

# 11. Self-Healing

Suppose one Pod fails:

```text
Before:
Pod 1
Pod 2
Pod 3
```

Pod 2 fails:

```text
Pod 1
Pod 3
```

The controller detects:

```text
Desired = 3
Actual = 2
```

and creates a replacement.

```text
Pod 1
Pod 3
Pod 4
```

---

# 12. Deployment Scaling

Scale using:

```bash
kubectl scale deployment payment-api --replicas=5
```

Or modify the manifest:

```yaml
spec:
  replicas: 5
```

The Deployment updates its desired state.

---

# 13. Scaling Down

Example:

```bash
kubectl scale deployment payment-api --replicas=2
```

The controller reduces the number of Pods toward two.

```text
5 Pods
  |
  v
3 Pods
  |
  v
2 Pods
```

The exact termination order depends on Kubernetes/controller behavior and Pod configuration.

---

# 14. Horizontal Pod Autoscaling

Deployments commonly work with HPA.

```text
Metrics
   |
   v
HPA
   |
   v
Deployment replicas
   |
   v
ReplicaSet
   |
   v
Pods
```

Example:

```text
CPU > Target
   |
   v
Increase replicas
```

---

# 15. Deployment and HPA

A typical architecture:

```text
                   HPA
                    |
                    v
               Deployment
                    |
                    v
                ReplicaSet
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Pod       Pod       Pod
```

The HPA modifies the desired replica count; the Deployment and ReplicaSet create/remove Pods accordingly.

---

# 16. Deployment Selector

Example:

```yaml
selector:
  matchLabels:
    app: payment-api
```

The selector must match the Pod template labels:

```yaml
template:
  metadata:
    labels:
      app: payment-api
```

This relationship is critical.

---

# 17. Selector and Template

Correct:

```yaml
selector:
  matchLabels:
    app: payment-api

template:
  metadata:
    labels:
      app: payment-api
```

Conceptually:

```text
Deployment Selector
        |
        v
Pod Template Labels
        |
        v
Managed Pods
```

---

# 18. Why Selectors Matter

The Deployment uses its selector to identify the Pods belonging to its ReplicaSet.

A mismatch can prevent the Deployment from managing the intended Pods correctly.

Always keep selectors stable and carefully designed.

---

# 19. Pod Template

The Pod template defines:

```text
Container Image
Container Ports
Environment Variables
Resources
Probes
Volumes
Security Context
ServiceAccount
Affinity
Tolerations
Topology Rules
```

Changes to the Pod template can create a new Deployment revision.

---

# 20. Deployment Revision

When the Pod template changes:

```text
Deployment
    |
    +-- Revision 1
    |
    +-- Revision 2
```

For example:

```text
image: payment-api:1.0
```

changes to:

```text
image: payment-api:2.0
```

This creates a new rollout revision.

---

# 21. Rolling Update

The default Deployment strategy is generally:

```text
RollingUpdate
```

Conceptually:

```text
Old Pods
Old Pods
Old Pods

      |
      v

New Pod
Old Pod
Old Pod

      |
      v

New Pod
New Pod
Old Pod

      |
      v

New Pod
New Pod
New Pod
```

The goal is to replace old Pods progressively.

---

# 22. Rolling Update Benefits

Rolling updates can provide:

```text
Minimal Downtime
Controlled Replacement
Gradual Rollout
Rollback Capability
Version History
```

They are widely used for stateless applications.

---

# 23. Rolling Update Configuration

Example:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
```

---

# 24. maxUnavailable

`maxUnavailable` controls how many desired Pods can be unavailable during the update.

Example:

```yaml
maxUnavailable: 1
```

With:

```text
replicas = 5
```

the rollout can proceed while allowing an appropriate number of unavailable replicas according to the strategy.

---

# 25. maxSurge

`maxSurge` controls how many Pods can temporarily exist above the desired replica count during an update.

Example:

```yaml
maxSurge: 1
```

For:

```text
replicas = 5
```

the rollout may temporarily create an additional Pod while replacing old ones.

---

# 26. maxUnavailable vs maxSurge

| Setting | Controls |
|---|---|
| maxUnavailable | Temporary unavailable Pods |
| maxSurge | Temporary extra Pods |

Example:

```text
Desired = 5
maxSurge = 1
```

Temporary total can reach approximately:

```text
6 Pods
```

subject to rollout state and readiness.

---

# 27. Rolling Update Example

Suppose:

```text
replicas = 4
maxSurge = 1
maxUnavailable = 1
```

Conceptually:

```text
Initial:
Old Old Old Old

Start:
New Old Old Old Old

Progress:
New New Old Old

Progress:
New New New Old

Complete:
New New New New
```

Actual transitions depend on readiness and controller behavior.

---

# 28. Recreate Strategy

A Deployment can use:

```yaml
strategy:
  type: Recreate
```

Conceptually:

```text
Old Pods
   |
   v
Delete Old Pods
   |
   v
Create New Pods
```

This can cause downtime.

It may be appropriate when old and new versions cannot safely coexist.

---

# 29. RollingUpdate vs Recreate

| Feature | RollingUpdate | Recreate |
|---|---|---|
| Gradual replacement | Yes | No |
| Old/new coexist | Usually | No |
| Downtime | Can be minimized | Expected |
| Rollout control | High | Simple |
| Typical use | Stateless apps | Incompatible versions |

---

# 30. Deployment Rollout

Check rollout status:

```bash
kubectl rollout status deployment/payment-api
```

View rollout history:

```bash
kubectl rollout history deployment/payment-api
```

---

# 31. Rollout History

A Deployment can maintain revision history.

Example:

```text
Revision 1 -> image 1.0
Revision 2 -> image 1.1
Revision 3 -> image 2.0
```

This enables rollback to an earlier revision.

---

# 32. Rollback

Rollback:

```bash
kubectl rollout undo deployment/payment-api
```

Rollback to a specific revision:

```bash
kubectl rollout undo deployment/payment-api --to-revision=2
```

Always validate rollout history before selecting a revision.

---

# 33. Rollout Status

Use:

```bash
kubectl rollout status deployment/payment-api
```

Example conceptual output:

```text
Waiting for deployment "payment-api" rollout to finish...
deployment "payment-api" successfully rolled out
```

---

# 34. Rollout Pause

A rollout can be paused:

```bash
kubectl rollout pause deployment/payment-api
```

Resume:

```bash
kubectl rollout resume deployment/payment-api
```

This can be useful for controlled multi-step updates.

---

# 35. Deployment Conditions

Deployment status can provide conditions such as:

```text
Available
Progressing
ReplicaFailure
```

Inspect:

```bash
kubectl describe deployment <deployment>
```

---

# 36. Progressing

A Deployment can report progressing behavior while a rollout is occurring.

Typical causes include:

```text
New ReplicaSet Created
Pods Being Created
Pods Becoming Ready
Old ReplicaSet Scaling Down
```

---

# 37. Available

Availability indicates whether enough replicas are considered available according to the Deployment's state and availability configuration.

Do not confuse:

```text
Available
```

with:

```text
Application is perfect
```

Application-level health still requires monitoring and probes.

---

# 38. Progress Deadline

A Deployment can define:

```yaml
progressDeadlineSeconds: 600
```

This helps Kubernetes identify stalled rollout progress.

A rollout can fail to progress because of:

```text
Bad Image
Probe Failure
Insufficient Capacity
Scheduling Constraints
Admission Policy
Configuration Error
```

---

# 39. Revision History Limit

Deployment history can be controlled using:

```yaml
revisionHistoryLimit: 10
```

This limits retained old ReplicaSets.

Higher values preserve more history but can increase object/storage overhead.

---

# 40. Min Ready Seconds

A Deployment can use:

```yaml
minReadySeconds: 10
```

This requires a newly created Pod to remain Ready for the specified duration before it is considered available for rollout progress.

This can help prevent very quickly failing Pods from being treated as stable too early.

---

# 41. Deployment Availability

Deployment availability depends on:

```text
Replica Count
Pod Readiness
Update Strategy
PodDisruptionBudget
Node Capacity
Scheduling
Application Health
```

A Deployment with three replicas is not automatically highly available if all replicas run on one failure-prone node.

---

# 42. Pod Anti-Affinity with Deployment

For resilience:

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          topologyKey: kubernetes.io/hostname
          labelSelector:
            matchLabels:
              app: payment-api
```

This encourages replicas to spread across nodes.

---

# 43. Topology Spread with Deployment

Example concept:

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: payment-api
```

This can distribute replicas across zones.

---

# 44. Deployment and PodDisruptionBudget

A PDB can protect replicas during voluntary disruptions.

```text
Deployment
 |
 +-- 5 Pods
 |
 +-- PDB
      |
      +-- minAvailable: 4
```

During node maintenance, the PDB can limit simultaneous voluntary disruptions.

---

# 45. Deployment and Services

A common production architecture:

```text
                Service
                   |
         +---------+---------+
         |         |         |
         v         v         v
       Pod       Pod       Pod
         ^         ^         ^
         |         |         |
         +---------+---------+
                   |
               ReplicaSet
                   |
               Deployment
```

The Service selects Pods using labels.

---

# 46. Deployment and Ingress

Typical request flow:

```text
Client
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

The Deployment manages the Pods behind the Service.

---

# 47. Deployment and ConfigMap

Configuration can be provided through:

```text
ConfigMap
    |
    v
Pod Template
    |
    v
Container
```

If the ConfigMap is mounted as files, applications may observe changes depending on how they consume the files.

Environment-variable values generally require Pod replacement to update because they are injected at container startup.

---

# 48. Deployment and Secret

Sensitive configuration can be provided through:

```text
Secret
   |
   v
Pod
   |
   v
Container
```

Do not put passwords directly into Deployment YAML committed to source control.

Use appropriate secret-management practices.

---

# 49. Deployment and Resource Requests

Example:

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
```

Requests help the scheduler determine suitable nodes.

They also improve capacity planning.

---

# 50. Deployment and Resource Limits

Example:

```yaml
resources:
  limits:
    cpu: "1"
    memory: "512Mi"
```

Limits can help protect nodes from unbounded container resource consumption.

However, poorly selected limits can cause throttling or OOM kills.

---

# 51. Deployment and Probes

A production Deployment should normally define appropriate probes.

```yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080

readinessProbe:
  httpGet:
    path: /ready
    port: 8080

livenessProbe:
  httpGet:
    path: /health
    port: 8080
```

Use probes based on actual application semantics.

---

# 52. Why Readiness Is Critical During Rollouts

Suppose a new Pod starts but is not ready:

```text
New Pod
 |
 +-- Running
 +-- Not Ready
```

The rollout should not treat it as fully available simply because the container process started.

Readiness provides an application-level signal.

---

# 53. Bad Rollout Scenario

Suppose:

```text
New image
   |
   v
Application starts
   |
   v
Readiness fails
```

The Deployment may become stuck progressing.

Investigate:

```bash
kubectl rollout status deployment/<name>
kubectl describe deployment <name>
kubectl describe pod <pod>
kubectl logs <pod>
```

---

# 54. Deployment Update by Image

A common command:

```bash
kubectl set image deployment/payment-api \
  payment-api=example/payment-api:2.0
```

Then:

```bash
kubectl rollout status deployment/payment-api
```

---

# 55. Declarative Update

Preferred GitOps-style approach:

```yaml
spec:
  template:
    spec:
      containers:
        - name: payment-api
          image: example/payment-api:2.0
```

Then:

```bash
kubectl apply -f deployment.yaml
```

The manifest remains the source of desired configuration.

---

# 56. Image Tagging

Avoid using:

```text
latest
```

for production deployments when deterministic versioning is required.

Prefer:

```text
payment-api:2.4.1
```

or an immutable image digest:

```text
payment-api@sha256:<digest>
```

This improves reproducibility.

---

# 57. Deployment and Immutable Images

Immutable image references help ensure:

```text
Same Version
      |
      v
Same Artifact
```

This is valuable for:

```text
Rollback
Auditing
Reproducibility
Incident Investigation
Supply Chain Security
```

---

# 58. Deployment Rollout with CI/CD

Typical pipeline:

```text
Developer
    |
    v
Git Commit
    |
    v
CI Build
    |
    v
Tests
    |
    v
Container Image
    |
    v
Registry
    |
    v
Deployment Manifest Update
    |
    v
Kubernetes
    |
    v
Deployment Rollout
```

---

# 59. GitOps Deployment

A GitOps model commonly looks like:

```text
Git Repository
      |
      v
Desired Kubernetes Manifests
      |
      v
GitOps Controller
      |
      v
Kubernetes API
      |
      v
Deployment
      |
      v
Pods
```

Examples of GitOps tools include:

```text
Argo CD
Flux
```

---

# 60. Deployment and Canary Releases

A single Deployment can perform rolling updates, but advanced canary patterns often use additional controllers, Services, or traffic-management mechanisms.

Conceptually:

```text
Service
 |
 +-- Stable Pods
 |
 +-- Canary Pods
```

Traffic can then be controlled according to the chosen platform/tooling.

---

# 61. Blue-Green Deployment

A blue-green model commonly uses separate workload versions:

```text
Service
 |
 +-- Blue Deployment
 |
 +-- Green Deployment
```

Traffic is switched between versions.

Example:

```text
Before:
Service -> Blue

After:
Service -> Green
```

This generally requires more infrastructure capacity than a simple rolling update.

---

# 62. Deployment Strategies

Common application rollout strategies include:

```text
Rolling Update
Recreate
Blue-Green
Canary
Progressive Delivery
```

Kubernetes Deployments directly provide RollingUpdate and Recreate; other strategies are commonly implemented using additional resources or tooling.

---

# 63. Deployment Rollback Strategy

A production rollback plan should define:

```text
When to Roll Back
Who Can Roll Back
How to Roll Back
How to Validate
How to Communicate
```

Example:

```text
New Version
    |
    v
Error Rate Increases
    |
    v
Rollback
    |
    v
Previous Revision
    |
    v
Validate
```

---

# 64. Rollback Is Not Always Enough

A rollback may not solve:

```text
Database Schema Changes
Persistent Data Changes
External API Changes
Infrastructure Problems
Configuration Changes
```

Always consider compatibility between application versions and dependencies.

---

# 65. Database Changes During Deployment

A safer migration model can be:

```text
Backward-Compatible Schema
       |
       v
Deploy Application
       |
       v
Migrate Data
       |
       v
Remove Old Compatibility
```

Avoid deployments where the old application immediately becomes incompatible with the new database schema unless the rollout strategy explicitly supports it.

---

# 66. Deployment Failure Causes

Common causes:

```text
Bad Image
Image Registry Failure
Insufficient Resources
Failed Readiness Probe
Failed Liveness Probe
Bad Environment Variable
Missing Secret
Missing ConfigMap
Admission Policy
Security Context
Scheduling Constraint
PVC Failure
Network Dependency
Application Startup Failure
```

---

# 67. Deployment Troubleshooting

Start with:

```bash
kubectl get deployment <name>
kubectl describe deployment <name>
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
```

Then inspect ReplicaSets:

```bash
kubectl get rs
```

Then Pods:

```bash
kubectl get pods
kubectl describe pod <pod>
kubectl logs <pod>
```

---

# 68. Deployment Events

Events can show:

```text
FailedCreate
FailedScheduling
Pulling
Pulled
Created
Started
Unhealthy
FailedMount
```

Use:

```bash
kubectl describe deployment <deployment>
kubectl describe pod <pod>
kubectl get events -A
```

---

# 69. Deployment Not Progressing

Possible causes:

```text
New Pods Never Ready
No Capacity
Image Cannot Pull
Invalid Configuration
Admission Rejection
PDB / Availability Constraints
Scheduling Constraints
Application Crash
Probe Failure
```

Check:

```bash
kubectl rollout status deployment/<name>
kubectl get pods
kubectl describe pod <pod>
kubectl logs <pod>
```

---

# 70. Deployment and ReplicaSet Troubleshooting

Check:

```bash
kubectl get rs
kubectl describe rs <replicaset>
```

Look for:

```text
Desired
Current
Ready
Available
Events
```

A Deployment may have multiple ReplicaSets because of rollout history.

---

# 71. Old ReplicaSets

During normal operation, old ReplicaSets can remain scaled down.

Example:

```text
Deployment
 |
 +-- RS revision 1 -> 0 Pods
 +-- RS revision 2 -> 0 Pods
 +-- RS revision 3 -> 3 Pods
```

The revision history limit controls how many old ReplicaSets are retained.

---

# 72. Deployment Rollout History

Inspect:

```bash
kubectl rollout history deployment/payment-api
```

For a specific revision:

```bash
kubectl rollout history deployment/payment-api --revision=3
```

Useful for determining what changed between versions.

---

# 73. Deployment Annotations

Kubernetes commonly records rollout revision information in Deployment-related metadata.

Custom annotations can also be used for:

```text
Ownership
Release Information
CI/CD Metadata
Change Tracking
```

Avoid storing secrets in annotations.

---

# 74. Deployment Labels

Good labels make workloads easier to operate.

Example:

```yaml
labels:
  app.kubernetes.io/name: payment-api
  app.kubernetes.io/component: api
  app.kubernetes.io/part-of: payments
  app.kubernetes.io/version: "2.0"
```

The Kubernetes recommended label conventions can help standardize application metadata.

---

# 75. Deployment Namespace

Deployments are namespaced resources.

Example:

```bash
kubectl get deployments -n production
```

A Deployment and its Pods normally belong to the same namespace.

---

# 76. Deployment ResourceQuota

Namespaces can have quotas.

Example:

```text
Namespace
 |
 +-- ResourceQuota
 |
 +-- Deployment
      |
      +-- Pods
```

If quota is exhausted, creating additional Pods may fail.

---

# 77. Deployment LimitRange

A LimitRange can provide default or constrained resource settings.

This can affect Deployment-created Pods if the namespace has appropriate policies.

---

# 78. Deployment and Scheduling

The Pod template can contain:

```text
nodeSelector
nodeAffinity
podAffinity
podAntiAffinity
tolerations
topologySpreadConstraints
priorityClassName
```

These influence where replicas can run.

---

# 79. Deployment and Node Failure

Suppose:

```text
3 replicas
 |
 +-- Node A
 +-- Node A
 +-- Node B
```

Node A fails.

If enough capacity exists:

```text
Replacement Pod
       |
       v
Node B / Node C
```

The Deployment's desired replica count remains three.

---

# 80. Deployment and Availability Zones

For high availability:

```text
Zone A -> Pod 1
Zone B -> Pod 2
Zone C -> Pod 3
```

Use topology rules to reduce the risk of losing all replicas during a zone failure.

---

# 81. Deployment and Graceful Shutdown

During rollout or scale-down:

```text
Pod Selected for Termination
        |
        v
Termination Signal
        |
        v
Application Cleanup
        |
        v
Container Exit
```

Correct shutdown behavior is important for:

```text
HTTP Connections
Message Processing
Database Transactions
File Writes
Caches
```

---

# 82. Deployment and Connection Draining

Readiness and graceful termination should work together.

Conceptually:

```text
Pod
 |
 +-- Readiness -> Not Ready
 |
 v
Stop New Traffic
 |
 v
Graceful Shutdown
 |
 v
Terminate
```

This helps reduce dropped requests during rolling updates.

---

# 83. Deployment and PDB During Maintenance

A Deployment with:

```text
replicas = 5
PDB minAvailable = 4
```

can limit voluntary disruption.

This is especially important when nodes are being drained.

---

# 84. Deployment and Autoscaling

Deployment and HPA can work together:

```text
Deployment
   ^
   |
HPA
   ^
   |
Metrics
```

Avoid manually changing replicas continuously while HPA is actively managing the replica count.

The HPA should generally be the controller of that field when it is configured to manage it.

---

# 85. Deployment and VPA

Vertical Pod Autoscaler can recommend or modify resource requests/limits depending on its configuration.

Conceptually:

```text
Metrics
   |
   v
VPA
   |
   v
Pod Resources
   |
   v
Deployment
```

VPA and HPA can interact, so resource scaling strategy should be designed carefully.

---

# 86. Deployment and Cluster Autoscaler

The three layers can interact:

```text
HPA
 |
 v
More Pods
 |
 v
Pending Pods
 |
 v
Cluster Autoscaler
 |
 v
More Nodes
 |
 v
Scheduler
 |
 v
Pods Run
```

This is a common cloud-native scaling pattern.

---

# 87. Deployment Capacity Planning

Consider:

```text
Current replicas
Rolling update surge
DaemonSet overhead
System reservations
HPA maximum
Node failures
Zone failures
PDB requirements
```

Example:

```text
replicas = 10
maxSurge = 20%
```

The cluster may need temporary capacity beyond the steady-state 10 replicas.

---

# 88. Deployment Security

Production Deployments should consider:

```text
Image Security
RBAC
ServiceAccount
Pod Security
NetworkPolicy
Secrets
SecurityContext
Resource Limits
Admission Policies
```

---

# 89. Image Security

Use:

```text
Trusted Registry
Image Scanning
Signed Images
SBOM
Immutable Digests
Minimal Base Images
Regular Updates
```

The exact security tooling depends on the organization.

---

# 90. Deployment Security Context

A common baseline:

```yaml
securityContext:
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault
```

Container-level controls can include:

```yaml
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

Validate compatibility with the application.

---

# 91. ServiceAccount

Example:

```yaml
spec:
  template:
    spec:
      serviceAccountName: payment-api
```

Use a dedicated identity when the application needs Kubernetes API access.

---

# 92. Deployment and RBAC

The Deployment itself does not automatically grant application permissions.

The Pod's ServiceAccount determines API permissions.

```text
Deployment
    |
    v
Pod
    |
    v
ServiceAccount
    |
    v
Role / ClusterRole
    |
    v
Permissions
```

---

# 93. Deployment and NetworkPolicy

NetworkPolicies can restrict Pod traffic.

Example:

```text
Internet
   |
   v
Ingress
   |
   v
Payment Pods
   |
   v
Database Pods
```

Policies can restrict which workloads can communicate.

---

# 94. Deployment Observability

Monitor:

```text
Desired Replicas
Current Replicas
Ready Replicas
Available Replicas
Unavailable Replicas
Rollout Duration
Pod Restarts
Error Rate
Latency
CPU
Memory
```

Kubernetes state metrics and application metrics should be monitored together.

---

# 95. Deployment SLO Considerations

For critical services, define targets around:

```text
Availability
Latency
Error Rate
Deployment Success Rate
Rollback Time
Recovery Time
```

A Deployment being technically successful does not guarantee the application meets its SLO.

---

# 96. Deployment Production Checklist

```text
[ ] Correct apiVersion
[ ] Stable selector
[ ] Meaningful labels
[ ] Appropriate replica count
[ ] Resource requests
[ ] Resource limits
[ ] Readiness probe
[ ] Liveness probe where appropriate
[ ] Startup probe where required
[ ] Graceful shutdown
[ ] Security context
[ ] Dedicated ServiceAccount
[ ] Secrets handled securely
[ ] ConfigMaps managed
[ ] RollingUpdate configured appropriately
[ ] maxSurge reviewed
[ ] maxUnavailable reviewed
[ ] PodDisruptionBudget for critical workloads
[ ] Topology spread / anti-affinity
[ ] Image pinned to version/digest
[ ] Rollback strategy
[ ] Monitoring
[ ] Alerting
[ ] Logging
```

---

# 97. Deployment Anti-Patterns

## Using `latest`

```text
image: myapp:latest
```

can make deployments less deterministic.

Prefer versioned tags or immutable digests.

---

## No Readiness Probe

A process may be running before it is ready to handle traffic.

---

## Aggressive Liveness Probe

An overly aggressive probe can repeatedly restart healthy-but-slow applications.

---

## No Resource Requests

This makes scheduling and capacity planning less predictable.

---

## No Rollback Plan

Every production rollout should have a clear recovery strategy.

---

## Single Replica for Critical Services

One Pod provides little resilience to:

```text
Node Failure
Pod Failure
Maintenance
Rollout
```

Use multiple replicas when availability requirements demand it.

---

## All Replicas on One Node

Three replicas on one node can still produce a single failure domain.

Use topology-aware scheduling where appropriate.

---

## Mixing Unrelated Applications

A Deployment should normally represent one coherent application workload.

---

# 98. Useful Commands

## Deployments

```bash
kubectl get deployments
kubectl get deployment <name>
kubectl describe deployment <name>
```

## Pods

```bash
kubectl get pods
kubectl get pods -l app=payment-api
```

## ReplicaSets

```bash
kubectl get rs
kubectl describe rs <name>
```

## Rollout

```bash
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
kubectl rollout pause deployment/<name>
kubectl rollout resume deployment/<name>
kubectl rollout undo deployment/<name>
```

## Scaling

```bash
kubectl scale deployment/<name> --replicas=5
```

## Image Update

```bash
kubectl set image deployment/<name> \
  <container>=<image>:<tag>
```

## Events

```bash
kubectl get events -A
```

---

# 99. Deployment Troubleshooting Commands

A practical sequence:

```bash
kubectl get deployment <name>
kubectl describe deployment <name>
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
kubectl get rs
kubectl get pods -l app=<label>
kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs <pod> --previous
kubectl get events -A
```

---

# 100. Deployment Troubleshooting Matrix

| Symptom | Likely Areas |
|---|---|
| Deployment stuck | Pods not Ready, scheduling, image, probes |
| Pods Pending | Resources, affinity, taints, storage |
| Pods CrashLoopBackOff | Application, config, probes |
| ImagePullBackOff | Image, registry, credentials |
| Rollout timeout | Readiness, capacity, application |
| Old Pods remain | Rollout still progressing or blocked |
| Too many Pods | HPA, manual scaling, controller state |
| Rollback fails | Dependency/schema/config compatibility |
| No traffic | Readiness, Service selector, network |
| Pods restart | Liveness, OOM, application crash |

---

# 101. Example Production Deployment

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: payment-api
  namespace: production
  labels:
    app.kubernetes.io/name: payment-api
    app.kubernetes.io/component: api

spec:
  replicas: 3

  revisionHistoryLimit: 5

  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1

  selector:
    matchLabels:
      app.kubernetes.io/name: payment-api

  template:
    metadata:
      labels:
        app.kubernetes.io/name: payment-api

    spec:
      serviceAccountName: payment-api

      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault

      containers:
        - name: payment-api
          image: registry.example.com/payment-api:2.4.1

          ports:
            - name: http
              containerPort: 8080

          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "1"
              memory: "512Mi"

          readinessProbe:
            httpGet:
              path: /ready
              port: http
            periodSeconds: 10

          livenessProbe:
            httpGet:
              path: /health
              port: http
            periodSeconds: 20

          startupProbe:
            httpGet:
              path: /startup
              port: http
            periodSeconds: 5
            failureThreshold: 30

          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL

      terminationGracePeriodSeconds: 30
```

This is an illustrative production-style example. Adjust values for the actual application.

---

# 102. Deployment Flow From Git to Pod

```text
Developer
    |
    v
Git
    |
    v
CI Pipeline
    |
    +-- Build
    +-- Test
    +-- Scan
    +-- Package
    |
    v
Container Registry
    |
    v
Deployment Manifest
    |
    v
Kubernetes API
    |
    v
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

---

# 103. Rolling Update Flow

```text
Deployment Revision 1
        |
        v
Change Image
        |
        v
Deployment Revision 2
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
Scale Down Old ReplicaSet
        |
        v
Revision 2 Active
```

---

# 104. Rollback Flow

```text
Current Revision
      |
      v
Problem Detected
      |
      v
kubectl rollout undo
      |
      v
Previous Revision
      |
      v
Previous ReplicaSet
      |
      v
Replacement Pods
      |
      v
Validate
```

---

# 105. Self-Healing Flow

```text
Desired Replicas = 3
        |
        v
Actual Replicas = 2
        |
        v
ReplicaSet Controller
        |
        v
Create Pod
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
Container
        |
        v
Actual Replicas = 3
```

---

# 106. Deployment and Failure Domains

A resilient Deployment should consider:

```text
Node
Zone
Region
Rack
Availability Domain
```

Example:

```text
Zone A -> Pod 1
Zone B -> Pod 2
Zone C -> Pod 3
```

The goal is to avoid concentrating all replicas in one failure domain.

---

# 107. Deployment and Stateful Applications

Deployments are primarily intended for stateless applications.

Examples:

```text
REST API
Web Frontend
Stateless Worker
Microservice
```

Stateful applications may be better suited to:

```text
StatefulSet
Operator
Managed Database
```

depending on the architecture.

---

# 108. Deployment and Jobs

Do not use a Deployment for a task that should run once and exit.

Use:

```text
Job
```

instead.

```text
Deployment -> Long-running application
Job        -> Completion-oriented task
```

---

# 109. Deployment and DaemonSet

Do not use a Deployment when the requirement is:

```text
One Pod per eligible node
```

Use:

```text
DaemonSet
```

instead.

---

# 110. Deployment and StatefulSet

Use StatefulSet when workloads need features such as:

```text
Stable Network Identity
Stable Storage Association
Ordered Deployment
Ordered Scaling
```

according to StatefulSet semantics.

---

# 111. Deployment Mental Model

The easiest way to remember a Deployment:

```text
Deployment
    |
    | "I want N replicas of this Pod template"
    v
ReplicaSet
    |
    | "Keep N matching Pods"
    v
Pods
    |
    v
Containers
```

During updates:

```text
Deployment
 |
 +-- Old ReplicaSet
 |
 +-- New ReplicaSet
```

---

# 112. Complete Deployment Mental Model

```text
                         Deployment
                              |
                +-------------+-------------+
                |                           |
                v                           v
          Desired State                Rollout Strategy
                |                           |
                v                           v
           ReplicaSet                 RollingUpdate
                |                     /     |     \
                v                    /      |      \
              Pods               Surge  Unavailable  Readiness
                |
                v
            Containers
```

---

# 113. Practical Troubleshooting Flow

```text
Deployment Problem
       |
       v
Check Deployment
       |
       v
Check Rollout Status
       |
       v
Check ReplicaSets
       |
       v
Check Pods
       |
       v
Check Pod Events
       |
       +-- Scheduling?
       |
       +-- Image?
       |
       +-- Config?
       |
       +-- Probes?
       |
       +-- Resources?
       |
       +-- Storage?
       |
       +-- Security?
       |
       +-- Network?
       |
       v
Check Application Logs
       |
       v
Validate Service Traffic
```

---

# 114. Interview Questions

## Beginner

### What is a Deployment?

A Kubernetes controller that manages stateless application Pods declaratively.

### What does a Deployment manage?

It manages ReplicaSets, which maintain the desired number of Pods.

### What is the default Deployment strategy?

`RollingUpdate`.

### What is a ReplicaSet?

A controller that maintains a desired number of matching Pods.

### Why use a Deployment instead of a Pod?

Deployments provide self-healing, scaling, rolling updates, and rollback capabilities.

---

## Intermediate

### What happens when a Pod managed by a Deployment fails?

The ReplicaSet notices the reduced number of matching Pods and creates a replacement.

### What is `maxSurge`?

It controls how many additional Pods can temporarily be created above the desired replica count during a rolling update.

### What is `maxUnavailable`?

It controls how many desired Pods can temporarily be unavailable during a rolling update.

### What is Recreate?

A Deployment strategy that removes old Pods before creating new ones.

### What is rollout history?

The history of Deployment revisions maintained through ReplicaSets.

### How do you roll back a Deployment?

```bash
kubectl rollout undo deployment/<name>
```

---

## Advanced

### How does a Deployment perform a rolling update?

A change to the Pod template creates a new ReplicaSet. Kubernetes progressively scales the new ReplicaSet up and the old ReplicaSet down according to the update strategy and Pod readiness.

### Why are readiness probes important during rolling updates?

They tell Kubernetes when new Pods are actually ready to serve traffic, preventing an application process that merely started from being treated as fully available.

### How does HPA interact with Deployment?

HPA can adjust the Deployment's desired replica count based on metrics, while the Deployment/ReplicaSet creates or removes Pods.

### What happens if a rollout gets stuck?

Investigate:

```text
Pods
Readiness
Scheduling
Image Pulling
Resources
Admission
Configuration
Events
```

### Why can a Deployment have multiple ReplicaSets?

Each Pod-template revision can correspond to a ReplicaSet. Old ReplicaSets may be retained for rollback history.

### Can a Deployment guarantee zero downtime?

Not by itself. Availability depends on replicas, readiness, application behavior, capacity, update strategy, topology, disruption policies, and dependencies.

### Why should image tags be immutable or pinned?

To make deployments reproducible and ensure that a rollback or redeployment refers to the intended artifact.

---

# 115. Key Relationships

## Deployment

```text
Deployment
 |
 v
ReplicaSet
 |
 v
Pods
```

## Rollout

```text
Deployment
 |
 +-- Old ReplicaSet
 |
 +-- New ReplicaSet
```

## Service

```text
Service
 |
 v
Pod Selector
 |
 +-- Deployment Pods
```

## Autoscaling

```text
Metrics
 |
 v
HPA
 |
 v
Deployment replicas
 |
 v
ReplicaSet
 |
 v
Pods
```

## Cluster Autoscaling

```text
HPA
 |
 v
More Pods
 |
 v
Pending
 |
 v
Cluster Autoscaler
 |
 v
More Nodes
 |
 v
Scheduler
 |
 v
Pods
```

---

# 116. Final Key Takeaways

```text
1. A Deployment is a Kubernetes controller for declaratively managing stateless application Pods.

2. A Deployment manages ReplicaSets.

3. ReplicaSets maintain the desired number of matching Pods.

4. Deployments provide self-healing through the ReplicaSet.

5. Deployments support scaling.

6. Deployments support rolling updates.

7. Deployments support rollback.

8. The Pod template defines the application Pods.

9. Changes to the Pod template create new rollout revisions.

10. The Deployment selector must correctly match the Pod template labels.

11. RollingUpdate is the common default strategy.

12. Recreate deletes old Pods before creating new ones.

13. maxSurge controls temporary extra Pods during a rollout.

14. maxUnavailable controls temporary unavailable Pods during a rollout.

15. Readiness probes are important for safe rollouts.

16. Liveness probes can restart unhealthy containers.

17. Startup probes protect slow-starting applications.

18. Deployment replicas should be distributed across failure domains when availability matters.

19. PodDisruptionBudget can protect against excessive voluntary disruptions.

20. HPA can modify Deployment replica count.

21. Cluster Autoscaler can add nodes when Pods cannot be scheduled due to capacity.

22. Resource requests are important for scheduling and capacity planning.

23. Resource limits can protect nodes but must be selected carefully.

24. Versioned or immutable images improve reproducibility.

25. `latest` is generally a poor production image reference when deterministic deployments are required.

26. Rollback is not always sufficient when database or external dependencies have changed incompatibly.

27. Deployments are primarily suited to stateless applications.

28. StatefulSet is generally more appropriate for workloads requiring stable identity/storage semantics.

29. Job is appropriate for completion-oriented tasks.

30. DaemonSet is appropriate for one Pod per eligible node.

31. A Deployment does not itself provide a stable network endpoint; Services normally provide that function.

32. A successful Kubernetes rollout does not automatically mean the application meets business SLOs.

33. Production Deployments should include resource management, probes, security, observability, and rollback planning.

34. The core Deployment model is:

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

35. During an update:

       Deployment
          |
          +-- Old ReplicaSet
          |
          +-- New ReplicaSet
                   |
                   v
              New Pods

36. The central principle is:

       Deployment declares the desired application state.
       ReplicaSet maintains the desired Pod count.
       Kubernetes continuously reconciles actual state toward desired state.
```

---

# 117. Quick Reference

## Create / Apply

```bash
kubectl apply -f deployment.yaml
```

## View

```bash
kubectl get deployments
kubectl get deployment <name>
kubectl describe deployment <name>
```

## Rollout

```bash
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
kubectl rollout pause deployment/<name>
kubectl rollout resume deployment/<name>
kubectl rollout undo deployment/<name>
```

## Scale

```bash
kubectl scale deployment/<name> --replicas=5
```

## Update Image

```bash
kubectl set image deployment/<name> \
  <container>=<image>:<tag>
```

## Pods

```bash
kubectl get pods
kubectl get pods -l app=<label>
kubectl describe pod <pod>
kubectl logs <pod>
```

## ReplicaSets

```bash
kubectl get rs
kubectl describe rs <name>
```

## Events

```bash
kubectl get events -A
```

---

> **Core Deployment principle:** A Deployment is the declarative controller that turns an application Pod template and desired replica count into a continuously reconciled workload. It uses ReplicaSets to maintain Pods and provides controlled rollout, scaling, and rollback capabilities for stateless applications.
