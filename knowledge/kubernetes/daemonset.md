# Kubernetes DaemonSet

## 1. Overview

A **DaemonSet** is a Kubernetes workload resource that ensures a copy of a Pod runs on **all or selected nodes** in a Kubernetes cluster.

DaemonSets are commonly used for node-level services such as:

* Log collection agents
* Monitoring agents
* Security agents
* Storage daemons
* Network plugins
* Node maintenance utilities
* System-level services

The key idea is:

> **A DaemonSet ensures that a Pod is present on every node that matches its scheduling rules.**

---

# 2. Why Use a DaemonSet?

Suppose a Kubernetes cluster has five worker nodes:

```text
Kubernetes Cluster

Node 1 ──► Monitoring Agent
Node 2 ──► Monitoring Agent
Node 3 ──► Monitoring Agent
Node 4 ──► Monitoring Agent
Node 5 ──► Monitoring Agent
```

Instead of manually creating five Pods, a DaemonSet automatically maintains one Pod on each eligible node.

If a new node joins the cluster:

```text
New Node 6
    │
    ▼
DaemonSet detects node
    │
    ▼
Creates DaemonSet Pod
```

If a node is removed:

```text
Node 3 removed
      │
      ▼
DaemonSet Pod disappears with node
```

This makes DaemonSets ideal for node-level workloads.

---

# 3. DaemonSet Architecture

A simplified architecture looks like this:

```text
                    Kubernetes Cluster
                           │
                           ▼
                      DaemonSet
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Node 1        Node 2        Node 3
             │             │             │
             ▼             ▼             ▼
        Daemon Pod     Daemon Pod     Daemon Pod
```

The DaemonSet controller continuously works to maintain the desired state.

---

# 4. Basic DaemonSet YAML

A basic DaemonSet looks like this:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nginx-daemonset
spec:
  selector:
    matchLabels:
      app: nginx-daemon

  template:
    metadata:
      labels:
        app: nginx-daemon

    spec:
      containers:
        - name: nginx
          image: nginx:1.27
```

Apply it:

```bash
kubectl apply -f daemonset.yaml
```

---

# 5. Understanding the DaemonSet Structure

The important sections are:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nginx-daemonset

spec:
  selector:
    matchLabels:
      app: nginx-daemon

  template:
    metadata:
      labels:
        app: nginx-daemon

    spec:
      containers:
        - name: nginx
          image: nginx:1.27
```

### `apiVersion`

Defines the Kubernetes API version:

```yaml
apiVersion: apps/v1
```

### `kind`

Specifies that the resource is a DaemonSet:

```yaml
kind: DaemonSet
```

### `metadata`

Contains resource metadata:

```yaml
metadata:
  name: nginx-daemonset
```

### `selector`

Determines which Pods belong to the DaemonSet.

```yaml
selector:
  matchLabels:
    app: nginx-daemon
```

### `template`

Defines the Pod that should run on eligible nodes.

---

# 6. DaemonSet Pod Placement

Unlike a Deployment, you normally do not specify:

```yaml
replicas: 5
```

for a DaemonSet.

Instead, Kubernetes determines the number of Pods based on eligible nodes.

For example:

```text
3 eligible nodes
      │
      ▼
3 DaemonSet Pods
```

If the cluster changes:

```text
3 Nodes → 3 Pods

5 Nodes → 5 Pods

10 Nodes → 10 Pods
```

Subject to the DaemonSet's scheduling constraints.

---

# 7. DaemonSet vs Deployment

DaemonSet and Deployment are both workload controllers, but they serve different purposes.

| Feature        | Deployment                                 | DaemonSet                     |
| -------------- | ------------------------------------------ | ----------------------------- |
| Main purpose   | Run application replicas                   | Run node-level Pods           |
| Replica count  | Explicitly specified                       | Usually one per eligible node |
| Node awareness | Not inherently node-specific               | Yes                           |
| New node       | Does not automatically get a dedicated Pod | Automatically gets a Pod      |
| Typical use    | Web applications                           | Monitoring/logging agents     |
| Scaling        | Based on replica count                     | Based on eligible nodes       |

### Deployment

```text
Deployment
    │
    ├── Pod
    ├── Pod
    ├── Pod
    └── Pod
```

### DaemonSet

```text
DaemonSet
    │
    ├── Node 1 → Pod
    ├── Node 2 → Pod
    ├── Node 3 → Pod
    └── Node 4 → Pod
```

---

# 8. Common DaemonSet Use Cases

## 8.1 Log Collection

A logging agent can run on every node.

```text
Node 1 ──► Log Agent
Node 2 ──► Log Agent
Node 3 ──► Log Agent
```

Examples of workloads that can follow this pattern include:

* Fluent Bit
* Fluentd
* Filebeat
* Node-level log collectors

---

## 8.2 Monitoring Agents

Monitoring agents can collect node-level metrics.

```text
Node
 │
 ├── CPU Metrics
 ├── Memory Metrics
 ├── Disk Metrics
 └── Network Metrics
       │
       ▼
 Monitoring Agent
```

A DaemonSet ensures the agent is available on every eligible node.

---

## 8.3 Security Agents

Security software may need to run on every node.

Examples:

* Runtime security agents
* Host monitoring agents
* Vulnerability/security sensors

---

## 8.4 Storage Agents

Some distributed storage systems use node-level agents.

```text
Node 1 ── Storage Agent
Node 2 ── Storage Agent
Node 3 ── Storage Agent
```

---

## 8.5 Network Agents

Kubernetes networking components may require node-level Pods.

For example:

```text
Node 1 ── Network Agent
Node 2 ── Network Agent
Node 3 ── Network Agent
```

---

# 9. Checking DaemonSets

List DaemonSets:

```bash
kubectl get daemonsets
```

Short form:

```bash
kubectl get ds
```

Example output:

```text
NAME              DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE
nginx-daemonset   3         3         3       3            3
```

---

# 10. Describe a DaemonSet

Use:

```bash
kubectl describe daemonset nginx-daemonset
```

This can show:

* Desired number of Pods
* Current Pods
* Ready Pods
* Updated Pods
* Available Pods
* Node selectors
* Events
* Pod template

---

# 11. Get DaemonSet YAML

```bash
kubectl get daemonset nginx-daemonset -o yaml
```

This is useful when troubleshooting configuration and scheduling.

---

# 12. View DaemonSet Pods

List Pods using labels:

```bash
kubectl get pods -l app=nginx-daemon
```

Example:

```text
NAME                       READY   STATUS    NODE
nginx-daemonset-abc12      1/1     Running   worker-01
nginx-daemonset-def34      1/1     Running   worker-02
nginx-daemonset-ghi56      1/1     Running   worker-03
```

---

# 13. DaemonSet and Labels

Labels are important because the DaemonSet selector uses them to identify its Pods.

Example:

```yaml
selector:
  matchLabels:
    app: monitoring-agent

template:
  metadata:
    labels:
      app: monitoring-agent
```

The selector and Pod labels must match.

A mismatch can cause the DaemonSet to behave incorrectly or fail validation.

---

# 14. DaemonSet on Selected Nodes

A DaemonSet does not always need to run on every node.

You can use:

* `nodeSelector`
* Node affinity
* Taints and tolerations

to control placement.

---

# 15. Using nodeSelector

Example:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitoring-agent

spec:
  selector:
    matchLabels:
      app: monitoring-agent

  template:
    metadata:
      labels:
        app: monitoring-agent

    spec:
      nodeSelector:
        node-role: monitoring

      containers:
        - name: agent
          image: monitoring-agent:1.0
```

Only nodes with:

```text
node-role=monitoring
```

will run the DaemonSet Pod.

---

# 16. Labeling a Node

Add a label:

```bash
kubectl label node worker-01 node-role=monitoring
```

Verify:

```bash
kubectl get nodes --show-labels
```

Now the DaemonSet can schedule onto matching nodes.

---

# 17. Node Affinity

Node affinity provides more flexible scheduling rules.

Example:

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: node-role
              operator: In
              values:
                - monitoring
```

This means the DaemonSet Pod can only run on nodes labeled:

```text
node-role=monitoring
```

---

# 18. DaemonSet and Taints/Tolerations

Nodes can be tainted to prevent ordinary workloads from being scheduled.

Example:

```bash
kubectl taint nodes worker-01 dedicated=system:NoSchedule
```

A DaemonSet can tolerate this taint:

```yaml
tolerations:
  - key: dedicated
    operator: Equal
    value: system
    effect: NoSchedule
```

This allows the DaemonSet Pod to run on the tainted node.

---

# 19. Why Tolerations Are Important for DaemonSets

Node-level agents often need to run on special nodes.

For example:

```text
Control Plane Node
       │
       │ Tainted
       ▼
System Agent
       │
       ▼
DaemonSet Pod
```

A logging or monitoring DaemonSet may need to run on control-plane nodes as well as worker nodes.

A toleration can allow that.

---

# 20. DaemonSet on Control Plane Nodes

Depending on the Kubernetes distribution and node taints, control-plane nodes may be protected with taints.

A DaemonSet can tolerate appropriate control-plane taints.

Example:

```yaml
tolerations:
  - key: node-role.kubernetes.io/control-plane
    operator: Exists
    effect: NoSchedule
```

This allows the DaemonSet Pod to be considered for scheduling on nodes with that taint.

> Always verify the actual taints in your cluster before defining tolerations.

Check:

```bash
kubectl describe nodes
```

---

# 21. DaemonSet and Host Filesystems

Node-level agents sometimes need access to files on the host.

Example:

```yaml
volumeMounts:
  - name: varlog
    mountPath: /var/log

volumes:
  - name: varlog
    hostPath:
      path: /var/log
```

This allows the container to access the node's `/var/log`.

A typical logging architecture is:

```text
Node
│
├── /var/log
│      │
│      ▼
│   DaemonSet
│   Log Agent
│      │
│      ▼
│ Logging Backend
```

---

# 22. hostPath Considerations

`hostPath` provides direct access to a path on the Kubernetes node.

Example:

```yaml
volumes:
  - name: host-data
    hostPath:
      path: /var/lib/myapp
```

Because `hostPath` exposes node filesystem content, it should be used carefully.

Potential risks include:

* Security exposure
* Host filesystem modification
* Node-specific dependencies
* Permission problems
* Portability issues

Use the minimum required host paths and mount them read-only where possible.

---

# 23. Read-Only Host Mount

If the agent only needs to read node data:

```yaml
volumeMounts:
  - name: varlog
    mountPath: /var/log
    readOnly: true
```

This reduces the possibility of accidental modification.

---

# 24. DaemonSet Resource Requests and Limits

DaemonSet Pods should have appropriate resource requests and limits.

Example:

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"

  limits:
    cpu: "500m"
    memory: "256Mi"
```

This is especially important because the workload runs across many nodes.

For example:

```text
100 MiB × 100 nodes
       │
       ▼
~10 GiB cluster-wide memory allocation
```

Even a small per-node resource requirement can become significant at cluster scale.

---

# 25. DaemonSet Update Strategy

DaemonSets support update strategies.

The main strategies are:

```text
RollingUpdate
OnDelete
```

---

# 26. RollingUpdate

`RollingUpdate` gradually replaces existing Pods.

Example:

```yaml
updateStrategy:
  type: RollingUpdate
```

This is commonly used for production workloads.

Conceptually:

```text
Old Pod
   │
   ▼
Replace
   │
   ▼
New Pod
   │
   ▼
Next Node
```

---

# 27. OnDelete

With:

```yaml
updateStrategy:
  type: OnDelete
```

existing DaemonSet Pods are not automatically replaced when the Pod template changes.

They are replaced when they are manually deleted.

Example:

```bash
kubectl delete pod <daemonset-pod>
```

The DaemonSet controller then creates a new Pod using the updated template.

---

# 28. RollingUpdate Configuration

A DaemonSet can control the rolling update behavior.

Example:

```yaml
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
```

This limits the number of unavailable DaemonSet Pods during the update.

---

# 29. maxUnavailable

Example:

```yaml
rollingUpdate:
  maxUnavailable: 1
```

If there are 10 eligible nodes, Kubernetes will update the DaemonSet progressively while respecting the configured availability constraint.

It helps reduce service disruption during upgrades.

---

# 30. DaemonSet Revision History

Kubernetes maintains revision information for workload updates.

Check:

```bash
kubectl rollout history daemonset monitoring-agent
```

This can help understand changes to the DaemonSet's Pod template.

---

# 31. DaemonSet Rollout Status

Check rollout progress:

```bash
kubectl rollout status daemonset monitoring-agent
```

Example:

```text
daemon set "monitoring-agent" successfully rolled out
```

---

# 32. Rolling Back a DaemonSet

Depending on the available revision history, a DaemonSet can be rolled back.

Example:

```bash
kubectl rollout undo daemonset monitoring-agent
```

You can specify a revision:

```bash
kubectl rollout undo daemonset monitoring-agent --to-revision=2
```

Verify:

```bash
kubectl rollout status daemonset monitoring-agent
```

---

# 33. DaemonSet Scheduling

The DaemonSet controller creates Pods for nodes that satisfy its scheduling requirements.

Factors can include:

* Node selectors
* Node affinity
* Taints and tolerations
* Resource availability
* Pod scheduling constraints
* Node conditions

The simplified process is:

```text
DaemonSet
    │
    ▼
Find eligible nodes
    │
    ├── Node 1 ──► Create Pod
    ├── Node 2 ──► Create Pod
    ├── Node 3 ──► Create Pod
    └── Node 4 ──► Create Pod
```

---

# 34. DaemonSet and New Nodes

One of the most useful properties of a DaemonSet is automatic handling of new nodes.

Example:

```text
Initial Cluster

Node 1 → Pod
Node 2 → Pod
Node 3 → Pod
```

A new node joins:

```text
Node 4 joins
      │
      ▼
DaemonSet detects it
      │
      ▼
Pod created on Node 4
```

Final state:

```text
Node 1 → Pod
Node 2 → Pod
Node 3 → Pod
Node 4 → Pod
```

---

# 35. DaemonSet and Node Removal

When a node leaves the cluster, its DaemonSet Pod is no longer needed on that node.

Example:

```text
Node 3 → Pod
    │
    ▼
Node removed
    │
    ▼
Pod disappears with node
```

The DaemonSet continues maintaining Pods on remaining eligible nodes.

---

# 36. DaemonSet and Multiple Containers

A DaemonSet Pod can contain multiple containers.

Example:

```yaml
containers:
  - name: monitoring-agent
    image: monitoring-agent:1.0

  - name: exporter
    image: metrics-exporter:1.0
```

This can be useful when multiple closely related node-level functions need to run together.

However, avoid adding unrelated containers just because the DaemonSet runs on every node.

---

# 37. DaemonSet Health Probes

DaemonSet containers can use:

* Startup probes
* Readiness probes
* Liveness probes

Example:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
```

Readiness:

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

Health probes help Kubernetes determine the state of node-level agents.

---

# 38. DaemonSet Security

DaemonSets often have elevated access because they interact with the node.

Therefore, security should be carefully designed.

Recommended practices:

* Run as non-root where possible.
* Drop unnecessary Linux capabilities.
* Use read-only filesystem where possible.
* Use read-only host mounts when possible.
* Avoid privileged mode unless absolutely required.
* Restrict RBAC permissions.
* Use trusted container images.
* Scan images for vulnerabilities.
* Restrict host filesystem access.
* Use Pod Security controls appropriate to the workload.

---

# 39. Privileged DaemonSets

Some infrastructure workloads require:

```yaml
securityContext:
  privileged: true
```

This provides extensive access to the host.

Because this is highly sensitive, use privileged mode only when required by the application's architecture.

Prefer narrower permissions where possible.

---

# 40. RBAC and DaemonSets

A DaemonSet may need access to Kubernetes APIs.

For example, a monitoring agent might need to discover:

* Pods
* Nodes
* Services
* Metrics

Use a dedicated:

```text
ServiceAccount
     │
     ▼
Role / ClusterRole
     │
     ▼
RoleBinding / ClusterRoleBinding
```

Example:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: monitoring-agent
```

Then configure the DaemonSet:

```yaml
spec:
  template:
    spec:
      serviceAccountName: monitoring-agent
```

Grant only the permissions required.

---

# 41. DaemonSet Networking

DaemonSet Pods use the normal Kubernetes Pod networking model unless special networking configuration is specified.

A DaemonSet can also be configured with:

```yaml
hostNetwork: true
```

This makes the Pod use the host's network namespace.

Example:

```yaml
spec:
  template:
    spec:
      hostNetwork: true
```

This can be useful for certain node-level networking agents, but it increases coupling to the host and requires careful security and port management.

---

# 42. DaemonSet and Host PID

Some node-level agents need visibility into host processes.

They may use:

```yaml
hostPID: true
```

Example:

```yaml
spec:
  template:
    spec:
      hostPID: true
```

This is a sensitive capability and should only be enabled when required.

---

# 43. DaemonSet and Host IPC

Some specialized node-level workloads may require:

```yaml
hostIPC: true
```

This allows sharing the host IPC namespace.

Again, use it only when required.

---

# 44. Complete DaemonSet Example

The following example demonstrates a more realistic node-level monitoring agent:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-monitor
  namespace: monitoring

spec:
  selector:
    matchLabels:
      app: node-monitor

  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1

  template:
    metadata:
      labels:
        app: node-monitor

    spec:
      serviceAccountName: node-monitor

      tolerations:
        - operator: Exists

      containers:
        - name: node-monitor
          image: example/node-monitor:1.0.0

          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"

            limits:
              cpu: "500m"
              memory: "256Mi"

          securityContext:
            runAsNonRoot: true
            allowPrivilegeEscalation: false

          livenessProbe:
            httpGet:
              path: /health
              port: 8080

          readinessProbe:
            httpGet:
              path: /ready
              port: 8080

          volumeMounts:
            - name: host-logs
              mountPath: /var/log
              readOnly: true

      volumes:
        - name: host-logs
          hostPath:
            path: /var/log
```

> The image name and configuration in this example are illustrative. Replace them with the actual image and configuration required by your monitoring solution.

---

# 45. Checking DaemonSet Status

Use:

```bash
kubectl get daemonset node-monitor -n monitoring
```

Example:

```text
NAME          DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE
node-monitor  5         5         5       5            5
```

The fields provide a quick health overview.

### DESIRED

Number of nodes where a DaemonSet Pod should exist.

### CURRENT

Number of currently running DaemonSet Pods.

### READY

Number of Pods passing readiness requirements.

### UP-TO-DATE

Number of Pods using the current Pod template.

### AVAILABLE

Number of Pods available according to the workload's availability state.

---

# 46. Troubleshooting DaemonSets

When a DaemonSet is not running correctly, follow this workflow:

```text
Check DaemonSet
      │
      ▼
Check Desired vs Current
      │
      ▼
Check Pod Status
      │
      ▼
Check Node Eligibility
      │
      ▼
Check Taints/Tolerations
      │
      ▼
Check Node Selector/Affinity
      │
      ▼
Check Events
      │
      ▼
Check Container Logs
      │
      ▼
Check Resources
      │
      ▼
Check Security/RBAC
```

---

# 47. Troubleshooting Commands

Check DaemonSet:

```bash
kubectl get daemonset
```

Describe:

```bash
kubectl describe daemonset <daemonset-name>
```

Check Pods:

```bash
kubectl get pods -o wide
```

Check events:

```bash
kubectl get events --sort-by=.lastTimestamp
```

Check logs:

```bash
kubectl logs <pod-name>
```

Check previous logs:

```bash
kubectl logs <pod-name> --previous
```

Check nodes:

```bash
kubectl get nodes
```

Check node details:

```bash
kubectl describe node <node-name>
```

---

# 48. Common Problem: Pod Not Running on a Node

Possible causes:

* Node does not match `nodeSelector`.
* Node does not match node affinity.
* Node has a taint.
* DaemonSet does not have the required toleration.
* Node is NotReady.
* Resource constraints prevent scheduling.
* Pod security restrictions prevent creation.

Start with:

```bash
kubectl describe daemonset <daemonset-name>
```

Then:

```bash
kubectl describe node <node-name>
```

---

# 49. Common Problem: Desired and Current Counts Differ

Example:

```text
DESIRED   CURRENT
5         4
```

This means the DaemonSet expects five Pods but currently has four.

Investigate:

```bash
kubectl get pods -o wide
```

and:

```bash
kubectl get events --sort-by=.lastTimestamp
```

Look for:

* Scheduling failures
* Image pull failures
* Admission/security errors
* Resource shortages
* Node readiness issues

---

# 50. Common Problem: CrashLoopBackOff

If a DaemonSet Pod is repeatedly crashing:

```bash
kubectl get pods
```

Then:

```bash
kubectl logs <pod-name>
```

For the previous instance:

```bash
kubectl logs <pod-name> --previous
```

Also inspect:

```bash
kubectl describe pod <pod-name>
```

Potential causes include:

* Incorrect configuration
* Invalid arguments
* Missing permissions
* Missing host files
* Incorrect volume mounts
* Application crash
* Insufficient resources

---

# 51. Common Problem: ImagePullBackOff

Check:

```bash
kubectl describe pod <pod-name>
```

Possible causes:

* Invalid image name
* Invalid tag
* Private registry authentication failure
* Registry unavailable
* Network connectivity problems

If using a private registry, verify:

```yaml
imagePullSecrets:
  - name: registry-secret
```

---

# 52. DaemonSet and Rolling Updates

A safe production update might look like:

```text
Version 1
│
├── Node 1 → v1
├── Node 2 → v1
├── Node 3 → v1
└── Node 4 → v1
        │
        ▼
Rolling Update
        │
        ▼
├── Node 1 → v2
├── Node 2 → v2
├── Node 3 → v1
└── Node 4 → v1
        │
        ▼
├── Node 1 → v2
├── Node 2 → v2
├── Node 3 → v2
└── Node 4 → v2
```

This helps reduce the risk of updating every node-level agent simultaneously.

---

# 53. DaemonSet Best Practices

## 53.1 Use DaemonSets for Node-Level Workloads

Good examples:

```text
Monitoring Agent
Logging Agent
Security Agent
Storage Agent
Network Agent
```

Do not use a DaemonSet simply because you need multiple application replicas.

For normal stateless applications, use a Deployment.

---

## 53.2 Define Resource Requests and Limits

Always consider the cluster-wide impact.

Example:

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
```

---

## 53.3 Use Health Probes

Configure:

* Startup probe
* Readiness probe
* Liveness probe

when supported by the application.

---

## 53.4 Use Controlled Updates

Prefer:

```yaml
updateStrategy:
  type: RollingUpdate
```

for workloads that need controlled upgrades.

---

## 53.5 Minimize Privileges

Avoid:

```yaml
privileged: true
```

unless absolutely necessary.

---

## 53.6 Minimize Host Access

If the agent needs `/var/log`, don't automatically mount:

```text
/
```

Mount only the required path.

---

## 53.7 Use Read-Only Mounts

If the application only needs to read host data:

```yaml
readOnly: true
```

---

## 53.8 Use Versioned Images

Prefer:

```yaml
image: example/agent:1.5.2
```

instead of:

```yaml
image: example/agent:latest
```

This improves deployment reproducibility.

---

# 54. DaemonSet vs Job vs CronJob

These resources serve different purposes.

| Resource    | Purpose                                 |
| ----------- | --------------------------------------- |
| DaemonSet   | Long-running Pod on nodes               |
| Job         | Run a task until completion             |
| CronJob     | Run Jobs on a schedule                  |
| Deployment  | Maintain stateless application replicas |
| StatefulSet | Manage stateful applications            |

Example:

```text
DaemonSet
   └── "Run an agent on every node"

Job
   └── "Run this task once"

CronJob
   └── "Run this task every night"

Deployment
   └── "Run 5 replicas of my web application"

StatefulSet
   └── "Run my stateful database workload"
```

---

# 55. DaemonSet vs StatefulSet

A DaemonSet is node-oriented.

A StatefulSet is identity/storage-oriented.

### DaemonSet

```text
Node 1 → Agent
Node 2 → Agent
Node 3 → Agent
```

### StatefulSet

```text
Pod 0 → Persistent Identity
Pod 1 → Persistent Identity
Pod 2 → Persistent Identity
```

Use the resource that matches the workload's behavior.

---

# 56. Important DaemonSet Fields

| Field                | Purpose                            |
| -------------------- | ---------------------------------- |
| `apiVersion`         | API version                        |
| `kind`               | Resource type                      |
| `metadata`           | Resource metadata                  |
| `spec.selector`      | Identifies DaemonSet Pods          |
| `spec.template`      | Defines Pod specification          |
| `updateStrategy`     | Controls updates                   |
| `nodeSelector`       | Limits nodes                       |
| `affinity`           | Advanced node selection            |
| `tolerations`        | Allows scheduling on tainted nodes |
| `containers`         | Defines containers                 |
| `resources`          | CPU/memory requirements            |
| `volumes`            | Defines volumes                    |
| `volumeMounts`       | Mounts volumes                     |
| `securityContext`    | Security configuration             |
| `serviceAccountName` | Service account used by Pods       |

---

# 57. Useful kubectl Commands

| Command                             | Purpose                           |
| ----------------------------------- | --------------------------------- |
| `kubectl get daemonsets`            | List DaemonSets                   |
| `kubectl get ds`                    | Short form                        |
| `kubectl get ds -A`                 | List DaemonSets across namespaces |
| `kubectl describe ds <name>`        | Detailed information              |
| `kubectl get ds <name> -o yaml`     | Display YAML                      |
| `kubectl get pods -o wide`          | Show Pods and nodes               |
| `kubectl get pods -l <label>`       | Find DaemonSet Pods               |
| `kubectl rollout status ds/<name>`  | Check rollout                     |
| `kubectl rollout history ds/<name>` | View revisions                    |
| `kubectl rollout undo ds/<name>`    | Roll back                         |
| `kubectl logs <pod>`                | View logs                         |
| `kubectl describe pod <pod>`        | Debug Pod                         |
| `kubectl describe node <node>`      | Inspect node                      |
| `kubectl get events`                | Check cluster events              |

---

# 58. Interview Questions

### What is a DaemonSet?

A DaemonSet is a Kubernetes workload controller that ensures a Pod runs on all or selected nodes matching its scheduling requirements.

### Why would you use a DaemonSet?

Common use cases include:

* Log collection
* Monitoring
* Security agents
* Storage agents
* Network agents
* Node-level utilities

### How is a DaemonSet different from a Deployment?

A Deployment manages a desired number of application replicas, while a DaemonSet typically maintains one Pod on each eligible node.

### Does a DaemonSet use replicas?

The number of DaemonSet Pods is generally determined by the number of eligible nodes rather than a user-specified replica count.

### What happens when a new node joins?

The DaemonSet controller schedules a Pod onto the new eligible node.

### What happens when a node is removed?

The DaemonSet Pod associated with that node disappears along with the node.

### Can a DaemonSet run only on selected nodes?

Yes. You can use:

* `nodeSelector`
* Node affinity
* Taints and tolerations

### Can a DaemonSet run on tainted nodes?

Yes, if its Pod specification has the appropriate tolerations.

### What is `updateStrategy`?

It controls how changes to the DaemonSet Pod template are applied.

The common strategies are:

```text
RollingUpdate
OnDelete
```

### What is `maxUnavailable`?

It controls the maximum number of DaemonSet Pods that can be unavailable during a rolling update.

### Can a DaemonSet have multiple containers?

Yes. A DaemonSet Pod can contain multiple containers.

### Can DaemonSets use volumes?

Yes. They can use Kubernetes volumes, including host-level volumes where required.

### Why are DaemonSets commonly used for logging?

Because a logging agent can run on each node and collect logs generated on that node.

### Can DaemonSets run on control-plane nodes?

Yes, provided the Pods satisfy the node's scheduling requirements, including any taints through appropriate tolerations.

---

# 59. Real-World Example: Node Log Collection

Consider a cluster:

```text
                 Kubernetes Cluster
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
    Worker 1         Worker 2         Worker 3
       │                │                │
       ▼                ▼                ▼
  Log Agent        Log Agent        Log Agent
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                 Logging Backend
```

The DaemonSet guarantees that each eligible node has a log collection agent.

This is one of the most common real-world DaemonSet patterns.

---

# 60. Real-World Example: Monitoring

A monitoring DaemonSet can collect node-level metrics:

```text
Worker Node
│
├── CPU
├── Memory
├── Disk
├── Network
└── Processes
       │
       ▼
 Monitoring Agent
       │
       ▼
 Metrics Backend
```

Every eligible node gets its own monitoring agent.

---

# 61. DaemonSet Operational Checklist

Before deploying a DaemonSet to production, verify:

* [ ] Workload genuinely requires node-level execution.
* [ ] Pod selector and labels match.
* [ ] Container image is trusted and versioned.
* [ ] Resource requests are defined.
* [ ] Resource limits are appropriate.
* [ ] Health probes are configured where appropriate.
* [ ] Node selectors/affinity are correct.
* [ ] Tolerations are intentionally configured.
* [ ] Host filesystem access is minimized.
* [ ] Host mounts are read-only where possible.
* [ ] Privileged mode is avoided unless required.
* [ ] Security context is configured.
* [ ] ServiceAccount permissions follow least privilege.
* [ ] Update strategy is appropriate.
* [ ] Rollout behavior has been tested.
* [ ] Logging and monitoring are available.

---

# 62. Quick Reference Architecture

```text
                         Kubernetes Cluster
                                │
                                ▼
                           DaemonSet
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
             Node 1          Node 2          Node 3
                │               │               │
                ▼               ▼               ▼
           ┌─────────┐     ┌─────────┐     ┌─────────┐
           │   Pod   │     │   Pod   │     │   Pod   │
           │         │     │         │     │         │
           │ Agent   │     │ Agent   │     │ Agent   │
           └─────────┘     └─────────┘     └─────────┘
```

---

# 63. Key Takeaways

```text
DaemonSet
│
├── Runs Pods on all or selected nodes
│
├── Automatically handles new eligible nodes
│
├── Commonly used for node-level agents
│
├── Does not normally use replicas
│
├── Supports nodeSelector and node affinity
│
├── Supports taints and tolerations
│
├── Supports RollingUpdate and OnDelete
│
├── Can use volumes and host-level resources
│
├── Requires careful security configuration
│
└── Should have appropriate resource and health settings
```

The core principle is:

> **Use a DaemonSet when a workload needs to run continuously on each eligible Kubernetes node.**

Typical examples are **logging agents, monitoring agents, security agents, storage agents, and network-related components**.
