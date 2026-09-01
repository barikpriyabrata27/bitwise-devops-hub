# Kubernetes Resource Requests and Limits --- Complete Study & Reference Guide

> A comprehensive practical guide to Kubernetes CPU and memory resource
> requests and limits, scheduling, QoS classes, OOMKilled, throttling,
> LimitRange, ResourceQuota, HPA/VPA interactions, troubleshooting,
> production practices, YAML examples, hands-on labs, and interview
> questions.

------------------------------------------------------------------------

# 1. What Are Resource Requests and Limits?

Kubernetes allows you to specify how much CPU and memory a container:

-   **requests** --- asks Kubernetes to reserve/consider this amount for
    scheduling
-   **limits** --- places an upper bound on the resource usage for the
    container

Example:

``` yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

Think of it as:

``` text
REQUEST
"What does this container need for scheduling?"

LIMIT
"How much is this container allowed to use?"
```

------------------------------------------------------------------------

# 2. Why Resource Management Matters

Without resource controls, one workload can consume excessive node
resources.

Example:

``` text
Node
 |
 +-- Application A
 |      |
 |      +-- CPU 90%
 |
 +-- Application B
 |
 +-- Application C
```

A badly behaved workload can create:

-   CPU contention
-   memory pressure
-   OOM kills
-   Pod eviction
-   unpredictable performance
-   scheduling failures

Resource requests and limits make workload resource behavior more
predictable.

------------------------------------------------------------------------

# 3. The Core Mental Model

Remember:

``` text
REQUEST
   |
   v
Scheduler uses it for placement

LIMIT
   |
   v
Runtime/kernel enforcement
```

For memory:

``` text
request = scheduling/resource accounting baseline
limit   = memory ceiling
```

For CPU:

``` text
request = scheduling/resource accounting baseline
limit   = CPU ceiling
```

------------------------------------------------------------------------

# 4. Container-Level Resources

Resources are normally specified under each container:

``` yaml
spec:
  containers:
    - name: app
      image: nginx
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 512Mi
```

A Pod can contain multiple containers.

Each container can have its own requests and limits.

------------------------------------------------------------------------

# 5. Pod Resource Requests

For scheduling and resource accounting, Kubernetes considers the
resource requirements of the Pod's containers.

For ordinary containers, a useful simplified model is:

``` text
Pod CPU request
≈ sum of container CPU requests

Pod memory request
≈ sum of container memory requests
```

Example:

``` text
Container A:
CPU request = 100m
Memory request = 128Mi

Container B:
CPU request = 200m
Memory request = 256Mi
```

Pod total:

``` text
CPU request = 300m
Memory request = 384Mi
```

Init containers have special scheduling semantics; see the dedicated
section below.

------------------------------------------------------------------------

# 6. CPU Units

Kubernetes CPU is measured in CPU cores.

Examples:

``` text
1 CPU
500m
250m
100m
50m
```

The `m` means **millicpu**.

Therefore:

``` text
1000m = 1 CPU
500m  = 0.5 CPU
250m  = 0.25 CPU
100m  = 0.1 CPU
50m   = 0.05 CPU
```

------------------------------------------------------------------------

# 7. CPU Examples

``` yaml
requests:
  cpu: 100m
```

means:

``` text
0.1 CPU
```

This:

``` yaml
requests:
  cpu: "1"
```

means:

``` text
1 CPU
```

And:

``` yaml
limits:
  cpu: "2"
```

means:

``` text
2 CPU
```

------------------------------------------------------------------------

# 8. Memory Units

Memory can be specified using decimal or binary units.

Common binary units:

``` text
Ki
Mi
Gi
Ti
```

Examples:

``` text
128Mi
256Mi
512Mi
1Gi
2Gi
```

Common decimal units include:

``` text
K
M
G
T
```

For Kubernetes configuration, binary units such as `Mi` and `Gi` are
commonly used for memory.

------------------------------------------------------------------------

# 9. `Mi` vs `M`

These are not the same.

Binary:

``` text
1Mi = 1024² bytes
```

Decimal:

``` text
1M = 1,000,000 bytes
```

Similarly:

``` text
1Gi = 1024³ bytes
1G  = 1,000,000,000 bytes
```

For predictable infrastructure configuration, use the intended unit
explicitly.

------------------------------------------------------------------------

# 10. Requests Example

``` yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
```

Interpretation:

``` text
CPU:
scheduler should account for 100m

Memory:
scheduler should account for 128Mi
```

------------------------------------------------------------------------

# 11. Limits Example

``` yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
```

Interpretation:

``` text
CPU:
container has a CPU ceiling of 500m

Memory:
container has a memory ceiling of 512Mi
```

The exact runtime enforcement mechanism differs by resource.

------------------------------------------------------------------------

# 12. Requests and Scheduling

Suppose a node has:

``` text
4 CPU
```

and currently scheduled workloads request:

``` text
3 CPU
```

A new Pod requests:

``` text
1 CPU
```

The scheduler can consider:

``` text
3 + 1 = 4 CPU
```

subject to other scheduling constraints and allocatable capacity.

------------------------------------------------------------------------

# 13. Important: Requests Are Not Simply "Guaranteed Usage"

A request is not a promise that the application continuously consumes
that amount of CPU.

Example:

``` yaml
requests:
  cpu: 500m
```

The application might actually consume:

``` text
50m
```

most of the time.

The request primarily affects scheduling and resource accounting.

------------------------------------------------------------------------

# 14. CPU Can Burst Above Request

Suppose:

``` yaml
requests:
  cpu: 100m

limits:
  cpu: 500m
```

The container can use more than:

``` text
100m
```

when CPU is available, up to its configured limit.

Conceptually:

``` text
0 ---- 100m -------- 500m
      request         limit
```

------------------------------------------------------------------------

# 15. Memory Is Different

Memory is not safely "burstable" in the same way CPU is.

Example:

``` yaml
requests:
  memory: 128Mi

limits:
  memory: 512Mi
```

The Pod is scheduled based on its request, but the container can consume
memory up to its limit.

If it attempts to exceed the memory limit, the container can be
terminated with:

``` text
OOMKilled
```

------------------------------------------------------------------------

# 16. CPU vs Memory

  Resource   Request                 Limit behavior
  ---------- ----------------------- -----------------------------------
  CPU        Scheduling/accounting   CPU can be throttled
  Memory     Scheduling/accounting   Excess can result in OOM kill
  CPU        Compressible            Usually throttled
  Memory     Incompressible          Cannot be compressed indefinitely

This distinction is extremely important.

------------------------------------------------------------------------

# 17. CPU Is a Compressible Resource

If CPU demand exceeds the CPU limit:

``` text
Container wants:
800m

Limit:
500m
```

the workload is generally throttled toward its configured CPU limit.

It does not normally get killed simply because it requested more CPU
than its limit.

------------------------------------------------------------------------

# 18. Memory Is an Incompressible Resource

Memory cannot be throttled in the same simple way.

If a container exceeds its memory limit:

``` text
Memory usage:
600Mi

Memory limit:
512Mi
```

the kernel/cgroup enforcement can trigger an OOM kill.

You may see:

``` text
Reason: OOMKilled
Exit Code: 137
```

------------------------------------------------------------------------

# 19. What Is OOMKilled?

OOM means:

``` text
Out Of Memory
```

If a container exceeds its memory limit or the node experiences memory
pressure and the kernel needs to reclaim memory, processes can be
terminated.

For a container-level memory limit breach, Kubernetes may report:

``` text
OOMKilled
```

------------------------------------------------------------------------

# 20. OOMKilled Example

``` yaml
resources:
  limits:
    memory: 128Mi
```

Application grows:

``` text
50Mi
80Mi
100Mi
120Mi
128Mi
...
```

If it attempts to exceed the allowed memory and the kernel kills it:

``` text
OOMKilled
```

------------------------------------------------------------------------

# 21. Exit Code 137

A common symptom of an OOM kill is:

``` text
Exit Code: 137
```

This corresponds to:

``` text
128 + SIGKILL(9) = 137
```

Do not assume every exit code 137 situation is identical without
checking the container state and events.

------------------------------------------------------------------------

# 22. Check for OOMKilled

``` bash
kubectl describe pod <pod>
```

Look for:

``` text
Last State:
  Terminated:
    Reason: OOMKilled
```

You can also inspect:

``` bash
kubectl get pod <pod> -o yaml
```

------------------------------------------------------------------------

# 23. CPU Throttling

Suppose:

``` yaml
limits:
  cpu: 500m
```

but the application tries to consume:

``` text
900m
```

The runtime can throttle CPU usage.

The application may experience:

``` text
higher latency
slower processing
reduced throughput
```

without being killed solely because CPU demand exceeded the limit.

------------------------------------------------------------------------

# 24. CPU Request vs CPU Limit Example

``` yaml
resources:
  requests:
    cpu: 250m
  limits:
    cpu: 1000m
```

Interpretation:

``` text
Scheduler accounts for:
250m

Container CPU ceiling:
1000m
```

If the node has spare CPU, the workload may burst above 250m.

------------------------------------------------------------------------

# 25. Memory Request vs Memory Limit Example

``` yaml
resources:
  requests:
    memory: 256Mi
  limits:
    memory: 1Gi
```

Interpretation:

``` text
Scheduling/accounting:
256Mi

Memory ceiling:
1Gi
```

If the process reaches the memory ceiling, OOM behavior can occur.

------------------------------------------------------------------------

# 26. Request Greater Than Limit

A container cannot normally have:

``` yaml
requests:
  cpu: 500m
limits:
  cpu: 250m
```

or:

``` yaml
requests:
  memory: 512Mi
limits:
  memory: 256Mi
```

because:

``` text
request > limit
```

is invalid.

The request must be less than or equal to the limit.

------------------------------------------------------------------------

# 27. Common Configuration Pattern

A common configuration is:

``` yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

This gives:

``` text
minimum scheduling/accounting expectation
        |
        v
       100m CPU
       128Mi RAM

maximum configured ceiling
        |
        v
       500m CPU
       512Mi RAM
```

------------------------------------------------------------------------

# 28. Should Requests Equal Limits?

Not always.

Example:

``` yaml
requests:
  cpu: 100m
limits:
  cpu: 500m
```

allows CPU bursting.

But:

``` yaml
requests:
  cpu: 500m
limits:
  cpu: 500m
```

makes the CPU allocation more predictable.

The correct choice depends on workload behavior and reliability
requirements.

------------------------------------------------------------------------

# 29. Guaranteed QoS Pattern

For a container to contribute to a Pod's **Guaranteed** QoS
classification, CPU and memory requests and limits need to be specified
and equal for every container in the Pod.

Example:

``` yaml
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

This is a common pattern for Guaranteed QoS.

------------------------------------------------------------------------

# 30. Burstable QoS Pattern

A Pod is commonly classified as **Burstable** when it has some resource
requests/limits configured but does not meet the requirements for
Guaranteed QoS.

Example:

``` yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

This is a typical Burstable configuration.

------------------------------------------------------------------------

# 31. BestEffort QoS

A Pod is **BestEffort** when none of its containers have CPU or memory
requests or limits.

Example:

``` yaml
containers:
  - name: app
    image: nginx
```

No resource settings.

The Pod can be classified as:

``` text
BestEffort
```

------------------------------------------------------------------------

# 32. Three Kubernetes QoS Classes

``` text
Guaranteed
     |
     v
Burstable
     |
     v
BestEffort
```

But these are not simply "performance tiers."

They are Pod QoS classifications that affect behavior during resource
pressure, especially eviction ordering.

------------------------------------------------------------------------

# 33. QoS Summary

  QoS          Resource configuration
  ------------ -----------------------------------------------------
  Guaranteed   CPU/memory requests = limits for every container
  Burstable    Some requests/limits configured, but not Guaranteed
  BestEffort   No CPU/memory requests or limits

------------------------------------------------------------------------

# 34. QoS and Eviction

During node memory pressure, Kubernetes may evict Pods.

QoS class is one factor in eviction behavior.

A simplified mental model is:

``` text
BestEffort
    |
    v
more vulnerable during pressure

Burstable
    |
    v
depends on usage vs requests and other factors

Guaranteed
    |
    v
generally strongest protection
```

Do not interpret QoS as an absolute guarantee that a Pod can never be
evicted.

------------------------------------------------------------------------

# 35. Memory Pressure

Suppose:

``` text
Node memory:
8Gi

Workloads:
consume nearly all memory
```

The node may enter:

``` text
MemoryPressure
```

Kubernetes may evict Pods to protect node stability.

------------------------------------------------------------------------

# 36. Requests and Eviction

Requests influence eviction decisions for Burstable workloads.

A useful conceptual model is:

``` text
actual memory usage
        vs
memory request
```

A workload consuming significantly above its request can become a
stronger eviction candidate than a workload operating within its
request, all else being equal.

The actual eviction algorithm considers multiple factors.

------------------------------------------------------------------------

# 37. Node Allocatable

Nodes have resources such as:

``` text
Capacity
Allocatable
```

Example:

``` text
Capacity:
8 CPU

Allocatable:
7.5 CPU
```

The difference may account for:

-   system processes
-   Kubernetes components
-   reserved resources
-   eviction thresholds

Scheduling works with allocatable resources rather than blindly using
raw hardware capacity.

------------------------------------------------------------------------

# 38. Check Node Resources

``` bash
kubectl describe node <node>
```

Look for:

``` text
Capacity:
Allocatable:
```

------------------------------------------------------------------------

# 39. Check Node Usage

If metrics-server is installed:

``` bash
kubectl top node
```

Example:

``` text
NAME     CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
node1    1200m        30%    3Gi             38%
```

------------------------------------------------------------------------

# 40. Check Pod Usage

``` bash
kubectl top pods
```

Or:

``` bash
kubectl top pods -A
```

This shows current observed usage, not configured requests/limits.

------------------------------------------------------------------------

# 41. Requests vs Actual Usage

Example:

``` text
Request:
100m CPU

Actual:
40m CPU
```

This does not mean the request should automatically be reduced.

Requests should reflect realistic resource needs and desired scheduling
behavior.

------------------------------------------------------------------------

# 42. Over-Requesting Resources

Suppose an application normally needs:

``` text
100m CPU
```

but request is:

``` text
2 CPU
```

Then the scheduler may reserve/account for much more CPU than the
workload normally needs.

Result:

``` text
poor bin packing
lower cluster utilization
Pods remain Pending unnecessarily
higher infrastructure cost
```

------------------------------------------------------------------------

# 43. Under-Requesting Resources

Suppose application needs:

``` text
500m CPU
```

but request is:

``` text
50m
```

The scheduler may pack too many workloads onto nodes.

Possible result:

``` text
CPU contention
latency
throttling
unpredictable performance
```

Under-requesting can be just as problematic as over-requesting.

------------------------------------------------------------------------

# 44. Memory Under-Requesting

Suppose application normally requires:

``` text
500Mi
```

but request is:

``` text
128Mi
```

Many such Pods may be packed onto the same node.

During pressure:

``` text
actual usage >> request
```

can increase eviction risk.

------------------------------------------------------------------------

# 45. Memory Over-Requesting

Suppose:

``` text
actual = 200Mi
request = 2Gi
```

The scheduler may consider the Pod much more expensive than necessary.

This can cause:

``` text
Pending Pods
low utilization
more nodes required
higher cost
```

------------------------------------------------------------------------

# 46. How to Choose Requests

A practical process:

``` text
Deploy
   |
   v
Measure real usage
   |
   v
Observe p50/p95/p99
   |
   v
Set request based on workload behavior
   |
   v
Monitor
   |
   v
Tune
```

Do not choose requests purely by guesswork for important production
workloads.

------------------------------------------------------------------------

# 47. How to Choose CPU Requests

Consider:

-   normal CPU usage
-   sustained CPU usage
-   latency requirements
-   burst behavior
-   autoscaling behavior
-   startup behavior

Example:

``` text
Normal:
100m

p95:
180m

p99:
250m
```

A reasonable request might be around a measured operational target
rather than blindly choosing `100m` or `250m`.

------------------------------------------------------------------------

# 48. How to Choose Memory Requests

Memory is often more closely tied to application footprint.

Measure:

``` text
baseline memory
working set
peak memory
GC behavior
cache behavior
startup memory
```

Memory usage can vary significantly depending on workload and runtime.

------------------------------------------------------------------------

# 49. How to Choose Memory Limits

Memory limits should account for legitimate workload peaks without
allowing one container to destabilize the node.

Example:

``` text
normal:
300Mi

peak:
450Mi

limit:
512Mi
```

This is only an example; actual values should come from measurements and
failure testing.

------------------------------------------------------------------------

# 50. Avoid Arbitrary Limits

Bad practice:

``` yaml
limits:
  memory: 64Mi
```

just because:

``` text
"small containers are better"
```

If the application genuinely needs 200Mi, an artificially low limit can
cause:

``` text
OOMKilled
CrashLoopBackOff
```

------------------------------------------------------------------------

# 51. CPU Limit Caveat

CPU limits can cause throttling.

For latency-sensitive workloads, an overly restrictive CPU limit can
result in:

``` text
CPU throttling
latency spikes
slow request handling
timeouts
```

Therefore, CPU limits should be chosen deliberately.

------------------------------------------------------------------------

# 52. CPU Requests Are Important for Scheduling

Example:

``` yaml
requests:
  cpu: 1
```

means a Pod requires significant CPU scheduling capacity.

If no node has enough allocatable CPU:

``` text
Pod = Pending
```

even if the cluster has plenty of total CPU spread across nodes.

------------------------------------------------------------------------

# 53. Fragmentation

Suppose:

``` text
Node A:
400m free

Node B:
400m free

Node C:
400m free
```

A Pod requests:

``` text
1 CPU
```

Total free CPU:

``` text
1.2 CPU
```

But no individual node has:

``` text
1 CPU
```

The Pod may remain Pending.

This is resource fragmentation.

------------------------------------------------------------------------

# 54. Requests and Scheduling Constraints

Scheduling considers more than CPU/memory.

It can also consider:

``` text
nodeSelector
node affinity
taints/tolerations
topology spread
Pod affinity/anti-affinity
volume constraints
architecture
OS
```

Therefore:

``` text
enough CPU
```

does not guarantee:

``` text
Pod can schedule
```

------------------------------------------------------------------------

# 55. Example: Requests + Node Selector

``` yaml
resources:
  requests:
    cpu: 500m
    memory: 512Mi

nodeSelector:
  workload: app
```

The scheduler needs an eligible node satisfying:

``` text
workload=app
```

and sufficient allocatable CPU/memory.

------------------------------------------------------------------------

# 56. Init Container Resource Requests

Init containers have special resource accounting.

For CPU/memory scheduling, Kubernetes considers:

-   the sum of regular container requests/limits
-   the highest request/limit among init containers

The effective Pod requirement for a resource is based on the appropriate
maximum between those calculations.

Conceptually:

``` text
Effective Pod request
=
max(
    sum(app container requests),
    max(init container request)
)
```

This matters when an init container needs large temporary resources.

------------------------------------------------------------------------

# 57. Example: Init Container

``` yaml
initContainers:
  - name: migration
    image: migration:v1
    resources:
      requests:
        cpu: 1
        memory: 1Gi

containers:
  - name: app
    image: app:v1
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
```

The Pod's scheduling requirement can be strongly influenced by the init
container.

------------------------------------------------------------------------

# 58. Sidecar Containers

Suppose:

``` text
App:
100m CPU
128Mi

Sidecar:
50m CPU
64Mi
```

Approximate combined regular-container requests:

``` text
150m CPU
192Mi
```

Therefore, sidecars matter for scheduling and cost.

------------------------------------------------------------------------

# 59. Resource Requests and Sidecars

Common sidecars include:

-   service mesh proxies
-   logging agents
-   security agents
-   telemetry collectors

If your application request is:

``` text
500m
```

but sidecars consume:

``` text
200m
```

the Pod's total resource requirements can be substantially higher.

------------------------------------------------------------------------

# 60. ResourceQuota

A namespace can enforce aggregate resource limits through:

``` text
ResourceQuota
```

Example:

``` yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
```

This limits aggregate consumption/accounting within the namespace.

------------------------------------------------------------------------

# 61. Why ResourceQuota Matters

Without quotas:

``` text
Team A
   |
   +-- many Pods

Team B
   |
   +-- many Pods

Team C
   |
   +-- many Pods
```

One namespace/team can consume disproportionate cluster resources.

ResourceQuota provides namespace-level governance.

------------------------------------------------------------------------

# 62. ResourceQuota and Requests

If a quota requires or tracks:

``` text
requests.cpu
requests.memory
```

then Pods may need explicit requests.

A Pod creation can fail when namespace quota would be exceeded.

------------------------------------------------------------------------

# 63. LimitRange

A namespace can also define:

``` text
LimitRange
```

It can provide:

-   default requests
-   default limits
-   minimum values
-   maximum values
-   request/limit relationships

Example:

``` yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: resource-defaults
spec:
  limits:
    - type: Container
      default:
        cpu: 500m
        memory: 512Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
```

------------------------------------------------------------------------

# 64. LimitRange vs ResourceQuota

### LimitRange

Controls/defaults resources for individual containers or Pods within a
namespace.

### ResourceQuota

Controls aggregate resource consumption across a namespace.

Mental model:

``` text
LimitRange
=
per-object rules/defaults

ResourceQuota
=
namespace-wide total
```

------------------------------------------------------------------------

# 65. Example Combination

``` text
Namespace
 |
 +-- LimitRange
 |      |
 |      +-- defaults/limits per container
 |
 +-- ResourceQuota
        |
        +-- total namespace allowance
```

Both are commonly used together.

------------------------------------------------------------------------

# 66. What Happens When You Omit Resources?

If there is no LimitRange and you omit:

``` yaml
resources:
```

the container may have no CPU/memory requests or limits.

The Pod can become:

``` text
BestEffort
```

if no container has any CPU/memory resources configured.

If a LimitRange applies defaults, omitted values may be automatically
populated during admission.

------------------------------------------------------------------------

# 67. Admission and Defaulting

The final Pod specification can differ from the YAML you wrote because
admission mechanisms may inject or default resources.

Inspect the actual object:

``` bash
kubectl get pod <pod> -o yaml
```

Look under:

``` yaml
resources:
```

------------------------------------------------------------------------

# 68. Resource Requests and QoS

Example 1:

``` yaml
requests:
  cpu: 100m
  memory: 128Mi
limits:
  cpu: 500m
  memory: 512Mi
```

Typically:

``` text
Burstable
```

Example 2:

``` yaml
requests:
  cpu: 500m
  memory: 512Mi
limits:
  cpu: 500m
  memory: 512Mi
```

Typically:

``` text
Guaranteed
```

Example 3:

``` yaml
# no CPU/memory resources
```

Typically:

``` text
BestEffort
```

------------------------------------------------------------------------

# 69. Resource Requests and HPA

Horizontal Pod Autoscaler can use resource metrics such as CPU
utilization.

A common configuration is:

``` yaml
resources:
  requests:
    cpu: 100m
```

with HPA targeting CPU utilization.

Why?

CPU utilization can be calculated relative to the CPU request.

Conceptually:

``` text
CPU utilization
=
actual CPU usage / requested CPU
```

------------------------------------------------------------------------

# 70. HPA Example

Suppose:

``` text
CPU request = 100m
```

and actual usage:

``` text
75m
```

Then:

``` text
75 / 100 = 75%
```

If HPA target is:

``` text
60%
```

the HPA may increase replicas, subject to its algorithm and
configuration.

------------------------------------------------------------------------

# 71. HPA and Missing Requests

If the HPA uses CPU utilization relative to requests, missing CPU
requests can prevent meaningful utilization calculation for affected
containers and can interfere with autoscaling behavior.

Therefore define appropriate CPU requests when using request-based CPU
utilization autoscaling.

------------------------------------------------------------------------

# 72. HPA and Memory

HPA can also use memory utilization metrics.

Again, the metric configuration and availability matter.

Memory-based autoscaling should be designed carefully because memory is
not always directly proportional to request rate.

------------------------------------------------------------------------

# 73. Resource Requests and VPA

Vertical Pod Autoscaler (VPA) can recommend or adjust CPU/memory
requests and, depending on configuration, limits.

Conceptually:

``` text
Metrics
   |
   v
VPA
   |
   v
recommend resource values
   |
   v
Pod specification
```

VPA and HPA can interact in complex ways, especially if both attempt to
control the same resource dimension.

------------------------------------------------------------------------

# 74. HPA vs VPA

### HPA

Changes:

``` text
number of Pods
```

### VPA

Changes:

``` text
resources per Pod
```

Mental model:

``` text
HPA -> horizontal
       more/fewer Pods

VPA -> vertical
       bigger/smaller Pods
```

------------------------------------------------------------------------

# 75. Resource Requests and Cluster Autoscaler

If Pods cannot schedule because of insufficient node capacity:

``` text
Pod Pending
   |
   v
Cluster Autoscaler
   |
   v
may add node(s)
```

Resource requests therefore influence whether the cluster autoscaler
sees a need for additional capacity.

------------------------------------------------------------------------

# 76. Cluster Autoscaler Example

Suppose:

``` text
New Pod request:
2 CPU
```

Existing nodes:

``` text
Node A: 1 CPU available
Node B: 1 CPU available
```

The Pod cannot be split across nodes.

If the cluster autoscaler is configured and the Pod is otherwise
schedulable on a new node, it may add capacity.

------------------------------------------------------------------------

# 77. Resource Requests and Cost

Cloud cost is affected by:

``` text
number of nodes
node sizes
utilization
requested resources
autoscaling
overhead
```

Over-requesting resources can cause:

``` text
more nodes
=
higher cost
```

------------------------------------------------------------------------

# 78. Resource Efficiency

Good resource management aims for:

``` text
enough resources
+
safe headroom
+
high utilization
+
predictable performance
```

Not:

``` text
maximum requests
```

and not:

``` text
minimum possible requests
```

------------------------------------------------------------------------

# 79. Requests and Bin Packing

The scheduler tries to place workloads efficiently according to
scheduling logic and configured scoring strategies.

Example:

``` text
Node A
4 CPU
8Gi

Pod:
500m
512Mi
```

Requests help Kubernetes understand how much capacity remains for
placement.

------------------------------------------------------------------------

# 80. Limits and Overcommit

A node can have total container limits greater than node capacity.

For example:

``` text
Node:
4 CPU

Pods:
Pod A limit = 2 CPU
Pod B limit = 2 CPU
Pod C limit = 2 CPU
```

Total limits:

``` text
6 CPU
```

This is possible depending on requests and configuration.

Requests influence scheduling; limits represent possible maximum
consumption.

------------------------------------------------------------------------

# 81. CPU Overcommit

Example:

``` text
Node:
4 CPU

Pod A:
request 500m
limit 2 CPU

Pod B:
request 500m
limit 2 CPU

Pod C:
request 500m
limit 2 CPU

Pod D:
request 500m
limit 2 CPU
```

Total requests:

``` text
2 CPU
```

Total limits:

``` text
8 CPU
```

This is an example of CPU overcommit.

Actual performance depends on workload demand.

------------------------------------------------------------------------

# 82. Memory Overcommit

Memory overcommit is riskier.

If:

``` text
Node:
4Gi

Pod limits total:
8Gi
```

and all workloads simultaneously approach their limits, the node can
experience memory pressure.

This can result in:

``` text
OOM behavior
eviction
node instability
```

Memory should therefore be managed conservatively.

------------------------------------------------------------------------

# 83. Requests and Limits in Production

A common production starting point:

``` yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

But this is only a template.

Do not copy these numbers blindly.

Measure your workload.

------------------------------------------------------------------------

# 84. Example Python Application

For your Python web application:

``` yaml
resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 128Mi
```

This can be a reasonable learning-lab configuration if the application
actually fits within it.

For production, measure real usage before deciding.

------------------------------------------------------------------------

# 85. Python Memory Considerations

Python applications can have memory behavior influenced by:

-   interpreter overhead
-   imported libraries
-   worker count
-   request concurrency
-   caches
-   temporary objects
-   framework
-   garbage collection
-   native extensions

Therefore, a very small memory limit can cause unexpected OOM kills.

------------------------------------------------------------------------

# 86. Python CPU Considerations

CPU needs can depend on:

-   request rate
-   JSON processing
-   encryption
-   compression
-   image processing
-   background jobs
-   Python worker model
-   native libraries

Measure actual CPU usage rather than assuming all Python applications
need the same resources.

------------------------------------------------------------------------

# 87. Resource Example for a Web App

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
          image: example/python-app:v1.0.0

          ports:
            - containerPort: 5000

          resources:
            requests:
              cpu: 100m
              memory: 128Mi

            limits:
              cpu: 500m
              memory: 512Mi
```

------------------------------------------------------------------------

# 88. Resource Example With Probes

``` yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi

  limits:
    cpu: 500m
    memory: 512Mi

readinessProbe:
  httpGet:
    path: /healthz
    port: 5000
  initialDelaySeconds: 3
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /healthz
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 10
```

Resource configuration and probes solve different problems.

------------------------------------------------------------------------

# 89. Resource Requests Do Not Make an Application Healthy

A Pod can have perfect resources:

``` text
CPU request = correct
Memory request = correct
```

and still fail because of:

``` text
application bug
image failure
configuration
network
probe
dependency
```

Resources are one part of workload configuration.

------------------------------------------------------------------------

# 90. Resource Limits Do Not Prevent All Node Problems

Limits constrain containers, but nodes can still experience pressure
because of:

-   many workloads
-   system processes
-   filesystem pressure
-   daemon workloads
-   kernel memory
-   storage usage
-   misconfigured workloads

Monitor the whole node.

------------------------------------------------------------------------

# 91. Ephemeral Storage Resources

Kubernetes also supports resource requests/limits for ephemeral storage.

Example:

``` yaml
resources:
  requests:
    ephemeral-storage: 1Gi
  limits:
    ephemeral-storage: 2Gi
```

This is separate from CPU and memory.

------------------------------------------------------------------------

# 92. Ephemeral Storage Includes

Depending on workload and node configuration, ephemeral storage can
include things such as:

``` text
container writable layer
emptyDir
logs
temporary local storage
```

Use appropriate configuration for workloads with substantial local disk
usage.

------------------------------------------------------------------------

# 93. Huge Pages

Kubernetes can also support huge page resources on appropriately
configured nodes.

Example concepts:

``` text
hugepages-2Mi
hugepages-1Gi
```

These are advanced resource-management topics.

------------------------------------------------------------------------

# 94. Extended Resources

Nodes can advertise custom resources such as:

``` text
example.com/gpu
```

or hardware-specific resources.

A Pod can request them:

``` yaml
resources:
  limits:
    example.com/gpu: 1
```

Extended resources are useful for GPUs and specialized hardware.

------------------------------------------------------------------------

# 95. GPU Example

A GPU workload may request:

``` yaml
resources:
  limits:
    nvidia.com/gpu: 1
```

The exact resource name depends on the device plugin and cluster
configuration.

------------------------------------------------------------------------

# 96. Resource Namespaces

Resource requests and limits apply at the container level but are
governed by namespace-level mechanisms such as:

``` text
LimitRange
ResourceQuota
```

This creates multiple resource-management layers:

``` text
Container
   |
   v
Pod
   |
   v
Namespace
   |
   v
Node
   |
   v
Cluster
```

------------------------------------------------------------------------

# 97. Resource Management Layers

### Container

``` text
requests
limits
```

### Pod

``` text
combined resource requirement
```

### Namespace

``` text
LimitRange
ResourceQuota
```

### Node

``` text
capacity
allocatable
actual usage
pressure
```

### Cluster

``` text
autoscaling
capacity
cost
```

------------------------------------------------------------------------

# 98. Check Resource Configuration

``` bash
kubectl get pod <pod> -o yaml
```

or:

``` bash
kubectl describe pod <pod>
```

Look for:

``` text
Requests:
Limits:
```

------------------------------------------------------------------------

# 99. Check Deployment Resources

``` bash
kubectl describe deployment <deployment>
```

Look at:

``` text
Pod Template
Containers
Requests
Limits
```

------------------------------------------------------------------------

# 100. Check Resource Usage

``` bash
kubectl top pods
```

and:

``` bash
kubectl top nodes
```

Compare:

``` text
configured request
configured limit
actual usage
```

------------------------------------------------------------------------

# 101. Check Pod QoS

``` bash
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'
```

Possible output:

``` text
Guaranteed
```

or:

``` text
Burstable
```

or:

``` text
BestEffort
```

------------------------------------------------------------------------

# 102. Check Node Allocatable

``` bash
kubectl describe node <node>
```

Look for:

``` text
Capacity:
Allocatable:
```

------------------------------------------------------------------------

# 103. Check Pod Resource Requests

A useful inspection command:

``` bash
kubectl get pod <pod> -o jsonpath='{.spec.containers[*].resources}'
```

------------------------------------------------------------------------

# 104. Check All Pods in Namespace

``` bash
kubectl get pods -o wide
```

Then inspect resource definitions:

``` bash
kubectl describe pods
```

For larger environments, use metrics and monitoring systems rather than
manually inspecting every Pod.

------------------------------------------------------------------------

# 105. Troubleshooting: Pod Pending

If:

``` text
STATUS = Pending
```

and scheduling is failing, inspect:

``` bash
kubectl describe pod <pod>
```

Look at:

``` text
Events:
```

Possible message:

``` text
Insufficient cpu
```

or:

``` text
Insufficient memory
```

------------------------------------------------------------------------

# 106. Pending Due to CPU

Example:

``` text
Pod request:
2 CPU

Largest eligible node:
1 CPU available
```

The Pod cannot schedule.

Solutions may include:

``` text
add capacity
reduce request if incorrectly sized
change scheduling constraints
use larger nodes
```

Do not simply reduce requests unless measurement shows it is safe.

------------------------------------------------------------------------

# 107. Pending Due to Memory

Example:

``` text
Pod request:
4Gi

Available allocatable memory:
2Gi
```

The Pod remains Pending.

Investigate:

``` bash
kubectl describe pod <pod>
kubectl describe node <node>
```

------------------------------------------------------------------------

# 108. Troubleshooting: OOMKilled

Run:

``` bash
kubectl describe pod <pod>
```

Look for:

``` text
Reason: OOMKilled
```

Then inspect:

``` bash
kubectl get pod <pod> -o yaml
```

and:

``` bash
kubectl top pod <pod>
```

if metrics are available.

------------------------------------------------------------------------

# 109. OOMKilled Troubleshooting Flow

``` text
OOMKilled
   |
   v
Check memory limit
   |
   v
Check actual usage
   |
   v
Check application memory behavior
   |
   +-- memory leak?
   |
   +-- workload spike?
   |
   +-- cache too large?
   |
   +-- worker count too high?
   |
   +-- limit too low?
```

------------------------------------------------------------------------

# 110. OOMKilled: Do Not Immediately Increase the Limit

Increasing:

``` yaml
limits:
  memory: 2Gi
```

may hide a memory leak.

First determine:

``` text
Why did memory grow?
```

Then decide whether to:

``` text
fix application
or
increase legitimate capacity
```

------------------------------------------------------------------------

# 111. Troubleshooting: CPU Throttling

If application latency increases:

``` text
Check CPU usage
Check CPU limit
Check throttling metrics
Check node contention
```

A very low CPU limit can cause sustained throttling.

------------------------------------------------------------------------

# 112. CPU Throttling Symptoms

Possible symptoms:

``` text
high latency
slow requests
timeouts
low throughput
application appears "stuck" under load
```

The container may still be:

``` text
Running
Ready
```

while performance is poor.

------------------------------------------------------------------------

# 113. Requests Too High

Symptoms:

``` text
Pods Pending
nodes look underutilized
cluster needs more nodes
```

Possible cause:

``` text
requests are significantly above actual needs
```

Validate with historical metrics before reducing.

------------------------------------------------------------------------

# 114. Requests Too Low

Symptoms:

``` text
many Pods packed onto nodes
CPU contention
memory pressure
latency
evictions
```

Possible cause:

``` text
requests are significantly below actual requirements
```

------------------------------------------------------------------------

# 115. Limits Too Low

Symptoms:

``` text
OOMKilled
CPU throttling
slow application
CrashLoopBackOff
```

The correct response depends on whether the workload is legitimately
under-provisioned or incorrectly designed.

------------------------------------------------------------------------

# 116. Limits Too High

Very high limits can reduce protection against noisy neighbors.

For memory:

``` text
large limits
+
many Pods
=
greater possible node pressure
```

For CPU, large limits may allow bursty workloads to compete heavily when
CPU is available.

------------------------------------------------------------------------

# 117. Production Resource Tuning

Use this loop:

``` text
Measure
  |
  v
Analyze
  |
  v
Set request/limit
  |
  v
Load test
  |
  v
Deploy
  |
  v
Monitor
  |
  v
Tune
```

Resource configuration should be treated as an engineering parameter,
not a one-time guess.

------------------------------------------------------------------------

# 118. Resource Profiles

You can maintain profiles for workloads.

### Small web service

``` text
CPU request: 100m
Memory request: 128Mi
```

### Medium API

``` text
CPU request: 250m
Memory request: 512Mi
```

### Heavy worker

``` text
CPU request: 1
Memory request: 1Gi
```

These are examples only.

Actual values should be based on measurement.

------------------------------------------------------------------------

# 119. Startup Resource Usage

Some applications use more resources during startup:

``` text
startup memory = 400Mi
steady-state memory = 200Mi
```

If limit is:

``` text
256Mi
```

the application may OOM during startup even though steady-state memory
is lower.

This is why startup testing matters.

------------------------------------------------------------------------

# 120. JVM Example

Java applications may have:

``` text
heap
metaspace
thread stacks
native memory
```

A container memory limit must account for more than just the Java heap.

The same general principle applies to other runtimes.

------------------------------------------------------------------------

# 121. Node.js Example

Node.js applications have:

``` text
heap
native memory
buffers
libraries
```

A memory limit that is too close to the expected heap can still cause
OOM behavior.

------------------------------------------------------------------------

# 122. Python Example

Python applications may have:

``` text
interpreter
objects
allocator arenas
native libraries
worker processes
```

If multiple worker processes run inside one container, memory usage can
multiply.

------------------------------------------------------------------------

# 123. Multi-Process Container

Suppose one container starts:

``` text
4 worker processes
```

and each uses:

``` text
100Mi
```

The total process memory can approach:

``` text
400Mi
```

plus runtime/application overhead.

A:

``` text
256Mi
```

limit may be insufficient.

------------------------------------------------------------------------

# 124. Resource Requests and Multiple Containers

Suppose a Pod contains:

``` text
app:
request 500m
memory 512Mi

proxy:
request 100m
memory 128Mi
```

Approximate Pod requests:

``` text
CPU:
600m

Memory:
640Mi
```

This is important when sidecars are injected automatically.

------------------------------------------------------------------------

# 125. Service Mesh Resource Impact

A service mesh proxy may add:

``` text
CPU
memory
network overhead
```

Therefore, after sidecar injection, verify actual Pod resources.

------------------------------------------------------------------------

# 126. ResourceQuota Example

``` yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
spec:
  hard:
    pods: "50"
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
```

Apply:

``` bash
kubectl apply -f quota.yaml
```

------------------------------------------------------------------------

# 127. LimitRange Example

``` yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: container-defaults
  namespace: production
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      default:
        cpu: 500m
        memory: 512Mi
```

Apply:

``` bash
kubectl apply -f limitrange.yaml
```

------------------------------------------------------------------------

# 128. Verify LimitRange

``` bash
kubectl get limitrange -n production
kubectl describe limitrange container-defaults -n production
```

------------------------------------------------------------------------

# 129. Verify ResourceQuota

``` bash
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
```

Observe:

``` text
Used
Hard
```

------------------------------------------------------------------------

# 130. Practical Lab 1 --- Basic Requests and Limits

Create:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
    - name: app
      image: nginx
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 256Mi
```

Apply:

``` bash
kubectl apply -f resource-demo.yaml
```

------------------------------------------------------------------------

# 131. Practical Lab 2 --- Inspect Resources

``` bash
kubectl describe pod resource-demo
```

Look for:

``` text
Requests:
  cpu: 100m
  memory: 128Mi

Limits:
  cpu: 500m
  memory: 256Mi
```

------------------------------------------------------------------------

# 132. Practical Lab 3 --- Check QoS

``` bash
kubectl get pod resource-demo -o jsonpath='{.status.qosClass}'
```

Expected:

``` text
Burstable
```

because requests and limits differ.

------------------------------------------------------------------------

# 133. Practical Lab 4 --- Guaranteed QoS

Create:

``` yaml
resources:
  requests:
    cpu: 500m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

Then:

``` bash
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'
```

Expected:

``` text
Guaranteed
```

assuming all containers satisfy the requirements.

------------------------------------------------------------------------

# 134. Practical Lab 5 --- BestEffort QoS

Create a Pod without CPU/memory resources.

Then:

``` bash
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'
```

Expected:

``` text
BestEffort
```

assuming no admission defaults are applied.

------------------------------------------------------------------------

# 135. Practical Lab 6 --- CPU Request Scheduling

Create a Pod with a deliberately high CPU request for your test cluster:

``` yaml
resources:
  requests:
    cpu: "100"
```

Then:

``` bash
kubectl get pod
kubectl describe pod <pod>
```

Observe:

``` text
Pending
```

and inspect scheduling events.

Delete the test Pod afterward.

------------------------------------------------------------------------

# 136. Practical Lab 7 --- Memory OOM

Use a test image/application that deliberately allocates memory.

Configure:

``` yaml
limits:
  memory: 64Mi
```

Run it and observe:

``` bash
kubectl describe pod <pod>
```

Look for:

``` text
OOMKilled
```

Only perform this in a disposable test environment.

------------------------------------------------------------------------

# 137. Practical Lab 8 --- ResourceQuota

Create:

``` yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: demo-quota
spec:
  hard:
    requests.cpu: "1"
    requests.memory: 1Gi
    pods: "5"
```

Then create Pods until the quota is reached.

Observe admission failures.

------------------------------------------------------------------------

# 138. Practical Lab 9 --- LimitRange Defaults

Create:

``` yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: defaults
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      default:
        cpu: 500m
        memory: 512Mi
```

Then create a Pod without explicit resources.

Inspect:

``` bash
kubectl get pod <pod> -o yaml
```

Observe the applied defaults.

------------------------------------------------------------------------

# 139. Practical Lab 10 --- Compare Usage

If metrics-server is available:

``` bash
kubectl top pods
```

Compare:

``` text
actual usage
```

against:

``` text
requests
limits
```

This is one of the most valuable exercises for understanding resource
tuning.

------------------------------------------------------------------------

# 140. Practical Lab 11 --- Deployment Resources

Create:

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resource-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: resource-web
  template:
    metadata:
      labels:
        app: resource-web
    spec:
      containers:
        - name: web
          image: nginx
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

Then:

``` bash
kubectl get deployment
kubectl get rs
kubectl get pods
```

Observe that resources are part of the Pod template.

------------------------------------------------------------------------

# 141. Practical Lab 12 --- Change Resource Requests

Change:

``` yaml
requests:
  cpu: 100m
```

to:

``` yaml
requests:
  cpu: 250m
```

Apply the Deployment.

Observe the rollout:

``` bash
kubectl rollout status deployment/resource-web
```

Because the Pod template changed, the Deployment creates a new
ReplicaSet revision.

------------------------------------------------------------------------

# 142. Resource Troubleshooting Cheat Sheet

``` bash
# Current Pod usage
kubectl top pods

# Node usage
kubectl top nodes

# Pod details
kubectl describe pod <pod>

# Pod YAML
kubectl get pod <pod> -o yaml

# Deployment details
kubectl describe deployment <deployment>

# QoS
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'

# Node capacity/allocatable
kubectl describe node <node>

# Quota
kubectl get resourcequota
kubectl describe resourcequota <quota>

# LimitRange
kubectl get limitrange
kubectl describe limitrange <limitrange>

# Events
kubectl get events --sort-by='.lastTimestamp'
```

------------------------------------------------------------------------

# 143. Troubleshooting Decision Tree

``` text
Pod problem
    |
    v
Pending?
    |
    +-- Yes
    |    |
    |    +--> describe Pod
    |    +--> FailedScheduling?
    |    +--> insufficient CPU?
    |    +--> insufficient memory?
    |
    +-- Running but unstable
         |
         +--> OOMKilled?
         |      |
         |      +--> memory limit
         |      +--> actual usage
         |
         +--> slow?
                |
                +--> CPU throttling
                +--> CPU limit
                +--> CPU contention
```

------------------------------------------------------------------------

# 144. Common Mistake #1

Setting:

``` yaml
requests:
  cpu: 4
  memory: 8Gi
```

for every tiny application.

Why bad?

``` text
scheduler sees huge requirement
```

Result:

``` text
poor utilization
Pending Pods
high cost
```

------------------------------------------------------------------------

# 145. Common Mistake #2

Setting tiny memory limits:

``` yaml
limits:
  memory: 32Mi
```

for a large runtime.

Result:

``` text
OOMKilled
CrashLoopBackOff
```

------------------------------------------------------------------------

# 146. Common Mistake #3

Using only limits and no requests.

Example:

``` yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
```

Depending on Kubernetes behavior, the effective request may be affected
by the specified limit, and the Pod QoS will not be BestEffort.

Do not assume "no requests" means "zero resource consideration."

Always inspect the actual Pod specification after admission if you need
certainty.

------------------------------------------------------------------------

# 147. Common Mistake #4

Assuming CPU limit equals guaranteed CPU.

Example:

``` yaml
limits:
  cpu: 500m
```

A limit is a ceiling, not the same thing as a scheduling guarantee.

The request is the important scheduling/accounting value.

------------------------------------------------------------------------

# 148. Common Mistake #5

Assuming memory request prevents OOM.

Example:

``` yaml
requests:
  memory: 512Mi
```

does not mean:

``` text
application can never exceed 512Mi
```

The memory limit is the relevant container ceiling.

------------------------------------------------------------------------

# 149. Common Mistake #6

Ignoring Sidecars

You calculate:

``` text
App:
500m / 512Mi
```

but a proxy is injected:

``` text
Proxy:
200m / 256Mi
```

Now the Pod resource requirements are significantly higher.

Always inspect the final Pod.

------------------------------------------------------------------------

# 150. Common Mistake #7

Ignoring Startup Peaks

Application:

``` text
steady:
200Mi

startup:
500Mi
```

Limit:

``` text
256Mi
```

Result:

``` text
startup OOM
```

Measure startup behavior.

------------------------------------------------------------------------

# 151. Common Mistake #8

Treating Resources as Static Forever

Application traffic changes.

Dependencies change.

Libraries change.

Node sizes change.

Therefore resource values should be reviewed periodically.

------------------------------------------------------------------------

# 152. Production Monitoring

Monitor:

``` text
CPU usage
memory working set
CPU throttling
OOM kills
evictions
request/limit ratios
Pod restarts
Pending Pods
node pressure
```

------------------------------------------------------------------------

# 153. Recommended Resource Dashboard

Useful panels:

``` text
CPU usage vs request
CPU usage vs limit
Memory usage vs request
Memory usage vs limit
CPU throttling
OOMKilled count
Pod restart count
Pending Pods
Node allocatable
Node utilization
```

------------------------------------------------------------------------

# 154. Resource Alert Examples

Potential alerts:

``` text
Pod repeatedly OOMKilled
```

``` text
CPU throttling persistently high
```

``` text
Pending Pods due to insufficient CPU
```

``` text
Node memory pressure
```

``` text
ResourceQuota near exhaustion
```

------------------------------------------------------------------------

# 155. Requests and SLOs

Resource tuning should support application SLOs.

For example:

``` text
SLO:
p95 latency < 200ms
```

If CPU limits cause throttling and latency becomes:

``` text
p95 = 500ms
```

the resource configuration may need adjustment.

Resources should be tied to performance objectives.

------------------------------------------------------------------------

# 156. Capacity Planning

Suppose:

``` text
100 Pods
```

each request:

``` text
100m CPU
```

Total:

``` text
10 CPU
```

plus:

``` text
system overhead
DaemonSets
headroom
```

You need enough node allocatable capacity.

Capacity planning starts with requests.

------------------------------------------------------------------------

# 157. Capacity Planning Formula

Simplified:

``` text
Total requested CPU
=
sum of Pod CPU requests
```

and:

``` text
Total requested memory
=
sum of Pod memory requests
```

Then account for:

``` text
node overhead
DaemonSets
system reserved resources
failure headroom
autoscaling
```

------------------------------------------------------------------------

# 158. Failure Headroom

Do not run every node at 100% utilization.

For example:

``` text
Normal utilization:
60–70%
```

can provide room for:

``` text
traffic spikes
Pod replacement
node failure
rolling updates
```

Actual targets depend on workload and environment.

------------------------------------------------------------------------

# 159. Rolling Update Resource Impact

This is particularly important with Deployments.

Suppose:

``` text
replicas = 10
```

and:

``` text
maxSurge = 25%
```

During rollout, additional Pods can exist.

Therefore cluster capacity must account for rollout surge.

``` text
10 normal Pods
+
up to surge Pods
```

Resource requests of the new Pods can temporarily increase cluster
demand.

------------------------------------------------------------------------

# 160. Your Python-App Example

If you have:

``` yaml
replicas: 4
```

and:

``` yaml
requests:
  cpu: 50m
  memory: 64Mi
limits:
  cpu: 200m
  memory: 128Mi
```

Normal requested resources are approximately:

``` text
CPU:
4 × 50m = 200m

Memory:
4 × 64Mi = 256Mi
```

Potential configured limits are:

``` text
CPU:
4 × 200m = 800m

Memory:
4 × 128Mi = 512Mi
```

During a Deployment rollout, `maxSurge` can temporarily increase the
number of Pods and therefore the requested/limited resource totals.

------------------------------------------------------------------------

# 161. Resource Requests and Your Pending Pods

If a Pod is Pending because of:

``` text
Insufficient cpu
```

look at:

``` bash
kubectl describe pod <pod>
```

Then compare the Pod request with:

``` bash
kubectl describe node <node>
```

especially:

``` text
Allocatable
Allocated resources
```

------------------------------------------------------------------------

# 162. Resource Requests and Node Selector

A Pod might request:

``` text
100m CPU
```

and the cluster might have plenty of CPU overall.

But if:

``` yaml
nodeSelector:
  workload: worker
```

only one small node matches, that Pod can still remain Pending.

Therefore:

``` text
resource availability
+
scheduling constraints
```

must both be satisfied.

------------------------------------------------------------------------

# 163. Resource Requests and Topology

Topology constraints can further restrict placement.

Example:

``` yaml
topologySpreadConstraints:
  - topologyKey: kubernetes.io/hostname
    maxSkew: 1
    whenUnsatisfiable: DoNotSchedule
```

The scheduler must satisfy both:

``` text
resource requirements
```

and:

``` text
topology requirements
```

where applicable.

------------------------------------------------------------------------

# 164. Resource Limits and Node Pressure

Suppose many Pods have large memory limits.

Even if requests are low, actual memory usage can rise.

Then:

``` text
Node memory pressure
```

can occur.

This is why memory overcommit requires care.

------------------------------------------------------------------------

# 165. Resource Requests and Guaranteed Capacity

If a workload requires predictable CPU and memory capacity, using equal
requests and limits can produce Guaranteed QoS.

Example:

``` yaml
resources:
  requests:
    cpu: 1
    memory: 1Gi
  limits:
    cpu: 1
    memory: 1Gi
```

This does not mean the application cannot be evicted under every
circumstance; node-level failures and system conditions still matter.

------------------------------------------------------------------------

# 166. Production Strategy: Stateless API

Example starting point:

``` yaml
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 1
    memory: 512Mi
```

Then measure:

``` text
CPU p95/p99
memory p95/p99
latency
throughput
```

Tune accordingly.

------------------------------------------------------------------------

# 167. Production Strategy: Worker

A background worker may be CPU-heavy:

``` yaml
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 2
    memory: 1Gi
```

Again, these are example values, not universal recommendations.

------------------------------------------------------------------------

# 168. Production Strategy: Memory-Heavy Service

``` yaml
resources:
  requests:
    cpu: 500m
    memory: 2Gi
  limits:
    cpu: 1
    memory: 4Gi
```

The scheduler sees:

``` text
2Gi memory request
```

and needs a suitable node.

------------------------------------------------------------------------

# 169. Resource Management Golden Rules

1.  Always understand the workload before choosing numbers.
2.  Set realistic CPU requests.
3.  Set realistic memory requests.
4.  Set memory limits carefully.
5.  Treat CPU limits carefully because throttling can affect latency.
6.  Measure actual usage.
7.  Account for sidecars.
8.  Account for startup spikes.
9.  Use ResourceQuota for namespace governance.
10. Use LimitRange for namespace defaults/constraints.

------------------------------------------------------------------------

# 170. More Golden Rules

11. Monitor OOMKilled.
12. Monitor CPU throttling.
13. Monitor Pending Pods.
14. Monitor node memory pressure.
15. Account for Deployment surge.
16. Account for DaemonSet overhead.
17. Don't blindly copy resource values.
18. Revisit resource values after application changes.
19. Load-test before major production changes.
20. Connect resource tuning to SLOs and capacity planning.

------------------------------------------------------------------------

# 171. Interview Question --- What Is a Resource Request?

Answer:

> A resource request specifies the amount of CPU or memory that
> Kubernetes uses when making scheduling and resource-accounting
> decisions for a container.

------------------------------------------------------------------------

# 172. Interview Question --- What Is a Resource Limit?

Answer:

> A resource limit specifies an upper bound on a container's resource
> consumption. CPU can be throttled when usage reaches the configured
> limit, while exceeding a memory limit can result in an OOM kill.

------------------------------------------------------------------------

# 173. Interview Question --- Request vs Limit?

Answer:

``` text
Request:
used primarily for scheduling/accounting

Limit:
maximum configured resource usage
```

------------------------------------------------------------------------

# 174. Interview Question --- What Happens If CPU Limit Is Exceeded?

The container is generally throttled rather than killed solely because
it exceeded its CPU limit.

------------------------------------------------------------------------

# 175. Interview Question --- What Happens If Memory Limit Is Exceeded?

The container can be terminated by the kernel's OOM mechanism, and
Kubernetes may report:

``` text
OOMKilled
```

------------------------------------------------------------------------

# 176. Interview Question --- What Is CPU Throttling?

CPU throttling occurs when a container is prevented from consuming CPU
beyond its configured CPU limit during a scheduling period.

It can reduce throughput and increase latency.

------------------------------------------------------------------------

# 177. Interview Question --- What Is OOMKilled?

It means a process/container was killed due to an out-of-memory
condition.

For containers, this can happen when memory usage exceeds its configured
memory limit.

------------------------------------------------------------------------

# 178. Interview Question --- What Is QoS?

Kubernetes Pod QoS classification categorizes Pods based on their CPU
and memory resource configuration.

The classes are:

``` text
Guaranteed
Burstable
BestEffort
```

------------------------------------------------------------------------

# 179. Interview Question --- How Do You Get Guaranteed QoS?

For a Pod to be Guaranteed, every container must have CPU and memory
requests and limits, and for each container:

``` text
request = limit
```

------------------------------------------------------------------------

# 180. Interview Question --- What Is BestEffort?

A Pod is BestEffort when none of its containers have CPU or memory
requests or limits, assuming no admission mechanism adds them.

------------------------------------------------------------------------

# 181. Interview Question --- What Is Burstable?

A Pod is Burstable when it has some CPU/memory resource configuration
but does not satisfy the conditions for Guaranteed.

------------------------------------------------------------------------

# 182. Interview Question --- What Does Scheduler Use?

The scheduler considers resource requests, along with many other
constraints, when deciding whether a Pod can fit on a node.

------------------------------------------------------------------------

# 183. Interview Question --- Does Scheduler Use Limits?

Resource requests are central to scheduling decisions. Limits represent
possible maximum usage and are not simply treated as the same thing as
requests.

------------------------------------------------------------------------

# 184. Interview Question --- Can Total Limits Exceed Node Capacity?

Yes, depending on requests and configuration. This is a form of
overcommit.

However, excessive memory overcommit can create serious node-pressure
risks.

------------------------------------------------------------------------

# 185. Interview Question --- Can Total Requests Exceed Node Capacity?

A Pod cannot be scheduled onto a node if its effective resource requests
cannot fit within the node's available allocatable resources.

Across the cluster, total requested resources can exceed a single node's
capacity because Pods are distributed across nodes.

------------------------------------------------------------------------

# 186. Interview Question --- Why Is My Pod Pending?

One possible reason is:

``` text
Insufficient cpu
```

or:

``` text
Insufficient memory
```

But also check:

``` text
nodeSelector
affinity
taints
topology
volumes
quotas
```

Use:

``` bash
kubectl describe pod <pod>
```

------------------------------------------------------------------------

# 187. Interview Question --- What Is ResourceQuota?

ResourceQuota limits aggregate resource consumption within a namespace.

Examples:

``` text
total CPU requests
total memory requests
total CPU limits
total memory limits
Pod count
```

------------------------------------------------------------------------

# 188. Interview Question --- What Is LimitRange?

LimitRange defines per-container/per-Pod resource constraints and can
provide default requests and limits.

------------------------------------------------------------------------

# 189. Interview Question --- LimitRange vs ResourceQuota?

``` text
LimitRange
=
individual object defaults/constraints

ResourceQuota
=
namespace aggregate limit
```

------------------------------------------------------------------------

# 190. Interview Question --- Why Set CPU Requests?

CPU requests help the scheduler make informed placement decisions and
provide a basis for resource accounting and request-relative utilization
metrics.

------------------------------------------------------------------------

# 191. Interview Question --- Why Set Memory Requests?

Memory requests help the scheduler reserve/account for expected memory
demand and influence behavior during node pressure and eviction
decisions.

------------------------------------------------------------------------

# 192. Interview Question --- Why Not Set Requests Extremely Low?

Because the scheduler may overpack nodes.

This can cause:

``` text
contention
memory pressure
eviction
performance degradation
```

------------------------------------------------------------------------

# 193. Interview Question --- Why Not Set Requests Extremely High?

Because Pods may remain Pending even though the cluster has sufficient
aggregate resources, and the cluster may require unnecessary nodes.

------------------------------------------------------------------------

# 194. Interview Question --- Why Not Set Memory Limits Extremely Low?

Because legitimate application memory usage can exceed the limit and
trigger:

``` text
OOMKilled
```

------------------------------------------------------------------------

# 195. Interview Question --- Why Can CPU Limits Hurt Performance?

Because the container may be throttled when it reaches its CPU limit,
potentially causing:

``` text
latency
throughput reduction
timeouts
```

------------------------------------------------------------------------

# 196. Interview Question --- How Do You Check Actual Usage?

If metrics-server is installed:

``` bash
kubectl top pods
kubectl top nodes
```

For production analysis, use historical monitoring data.

------------------------------------------------------------------------

# 197. Interview Question --- How Do You Check Resource Configuration?

``` bash
kubectl describe pod <pod>
```

or:

``` bash
kubectl get pod <pod> -o yaml
```

------------------------------------------------------------------------

# 198. Scenario --- Pod Is Pending With Insufficient CPU

Answer:

1.  Check Pod request.
2.  Check node allocatable CPU.
3.  Check allocated resources.
4.  Check node selector/affinity/topology.
5.  Determine whether request is correctly sized.
6.  Add capacity or adjust configuration if justified.

------------------------------------------------------------------------

# 199. Scenario --- Pod Is OOMKilled

Answer:

1.  Inspect `kubectl describe pod`.
2.  Confirm `OOMKilled`.
3.  Check memory limit.
4.  Check actual memory usage.
5.  Check application memory behavior.
6.  Check startup/traffic spikes.
7.  Fix memory leak or increase legitimate capacity.
8.  Monitor after the change.

------------------------------------------------------------------------

# 200. Scenario --- CPU Usage Is High but Pod Is Not OOMKilled

High CPU is not a memory problem.

Investigate:

``` text
CPU request
CPU limit
CPU throttling
node contention
application workload
```

------------------------------------------------------------------------

# 201. Scenario --- CPU Usage Is Low but Pod Is Pending

Possible cause:

``` text
request is high
```

The scheduler cares about requested resources for placement, not simply
current CPU usage.

Example:

``` text
Actual:
50m

Request:
2 CPU
```

The Pod can remain Pending if no eligible node has 2 CPU available.

------------------------------------------------------------------------

# 202. Scenario --- Node Has Free CPU but Pod Is Pending

Check:

``` text
nodeSelector
affinity
taints
topology spread
Pod anti-affinity
resource fragmentation
```

Free CPU alone does not guarantee scheduling.

------------------------------------------------------------------------

# 203. Scenario --- Memory Usage Is Below Limit but Pod Is Evicted

Eviction can happen due to node-level resource pressure and eviction
policy.

A container being below its own memory limit does not guarantee immunity
from node eviction.

Check:

``` bash
kubectl describe pod <pod>
kubectl describe node <node>
```

------------------------------------------------------------------------

# 204. Scenario --- Deployment Rollout Fails After Resource Increase

Suppose you change:

``` text
memory request:
256Mi -> 2Gi
```

The new Pods may not schedule.

The Deployment can remain partially rolled out.

Check:

``` bash
kubectl get deployment
kubectl get rs
kubectl get pods
kubectl describe pod <pending-pod>
```

------------------------------------------------------------------------

# 205. Scenario --- Rolling Update Creates Pending Pods

Possible cause:

``` text
old Pods consume capacity
+
new surge Pods require additional resources
```

For example:

``` text
replicas = 4
maxSurge = 25%
```

can temporarily create a fifth Pod.

If the cluster has insufficient capacity, the surge Pod can remain
Pending.

------------------------------------------------------------------------

# 206. Scenario --- ResourceQuota Prevents New Pods

If:

``` text
namespace quota reached
```

new Pod creation may fail.

Check:

``` bash
kubectl describe resourcequota -n <namespace>
```

and:

``` bash
kubectl describe rs <rs>
```

or:

``` bash
kubectl describe deployment <deployment>
```

------------------------------------------------------------------------

# 207. Scenario --- LimitRange Changes Your Pod

You submit:

``` yaml
resources: {}
```

but the resulting Pod has:

``` yaml
requests:
limits:
```

A namespace LimitRange may have applied defaults.

Inspect:

``` bash
kubectl get pod <pod> -o yaml
```

------------------------------------------------------------------------

# 208. Scenario --- Sidecar Injection Changes Scheduling

Your original application requests:

``` text
100m CPU
128Mi
```

A sidecar is automatically injected with:

``` text
100m CPU
128Mi
```

The effective Pod resource requirement is now larger.

This can change:

``` text
scheduling
cost
QoS
autoscaling
```

------------------------------------------------------------------------

# 209. Scenario --- HPA Is Not Scaling on CPU

Check:

``` text
CPU requests
metrics-server/metrics pipeline
HPA configuration
target utilization
```

If CPU utilization is request-relative, missing or inappropriate CPU
requests can prevent meaningful scaling behavior.

------------------------------------------------------------------------

# 210. Scenario --- Application Is Slow After Adding CPU Limit

Possible:

``` text
CPU throttling
```

Check CPU throttling metrics and compare:

``` text
actual usage
request
limit
latency
```

Do not assume the application code became slower.

------------------------------------------------------------------------

# 211. Scenario --- Application Keeps Restarting

Check:

``` bash
kubectl get pods
kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs <pod> --previous
```

Look for:

``` text
OOMKilled
CrashLoopBackOff
probe failure
application errors
```

------------------------------------------------------------------------

# 212. Scenario --- Requests and Limits Are Both 1 CPU

Example:

``` yaml
requests:
  cpu: 1
limits:
  cpu: 1
```

The Pod contributes to Guaranteed QoS if memory is also configured with
equal request/limit and all containers satisfy the QoS requirements.

CPU cannot burst above 1 CPU.

------------------------------------------------------------------------

# 213. Scenario --- Request 100m, Limit 1 CPU

Example:

``` yaml
requests:
  cpu: 100m
limits:
  cpu: 1
```

The Pod is commonly Burstable.

It can potentially use more CPU than its request when capacity is
available, up to the limit.

------------------------------------------------------------------------

# 214. Scenario --- Request 1Gi, Limit 1Gi

For memory:

``` yaml
requests:
  memory: 1Gi
limits:
  memory: 1Gi
```

The scheduler accounts for 1Gi, and the container has a 1Gi memory
limit.

------------------------------------------------------------------------

# 215. Resource Management Architecture

``` text
                    Cluster
                       |
        +--------------+--------------+
        |                             |
      Node A                        Node B
        |                             |
   Allocatable                    Allocatable
        |                             |
   +----+----+                    +---+---+
   |         |                    |       |
  Pod A     Pod B                Pod C   Pod D
   |         |                    |       |
resources  resources          resources resources
requests   limits             requests limits
```

The scheduler places Pods based on resource requests plus other
constraints.

------------------------------------------------------------------------

# 216. Complete Resource Flow

``` text
Container resources
       |
       v
Pod effective resources
       |
       v
Scheduler
       |
       v
Node allocatable
       |
       v
Kubelet / cgroups
       |
       +--> CPU enforcement
       |
       +--> Memory enforcement
       |
       v
Application
```

------------------------------------------------------------------------

# 217. Resource Requests + Deployment + ReplicaSet

``` text
Deployment
    |
    v
ReplicaSet
    |
    v
Pod template
    |
    +-- CPU request/limit
    +-- Memory request/limit
    |
    v
Pod
    |
    v
Scheduler
    |
    v
Node
```

When a Deployment rollout changes resource configuration, the Pod
template changes and a new ReplicaSet is normally created.

------------------------------------------------------------------------

# 218. Resource Configuration and Your Current Kubernetes Learning

The important chain is:

``` text
Deployment
   |
   v
ReplicaSet
   |
   v
Pod
   |
   +--> Requests
   |      |
   |      v
   |   Scheduler
   |
   +--> Limits
          |
          v
      Runtime/cgroups
          |
          +--> CPU throttling
          |
          +--> Memory OOM
```

This connects resource management directly to the Deployment/ReplicaSet
concepts.

------------------------------------------------------------------------

# 219. Final Cheat Sheet

``` text
REQUEST
=
scheduler/accounting baseline

LIMIT
=
configured maximum

CPU > limit
=
throttling

Memory > limit
=
possible OOMKilled

Guaranteed
=
requests == limits for CPU + memory on every container

Burstable
=
some resource configuration, not Guaranteed

BestEffort
=
no CPU/memory requests or limits

ResourceQuota
=
namespace aggregate resource governance

LimitRange
=
per-object defaults/constraints

kubectl top
=
actual usage (if metrics available)

kubectl describe pod
=
requests/limits + events + status
```

------------------------------------------------------------------------

# 220. Final Interview-Ready Explanation

> Kubernetes resource requests and limits control how CPU and memory are
> allocated and constrained for containers. Requests are primarily used
> by the scheduler when deciding where a Pod can run and also
> participate in resource accounting and autoscaling calculations.
> Limits define the configured ceiling for resource usage. CPU is
> generally throttled when constrained by its limit, whereas exceeding a
> memory limit can result in an OOM kill. Kubernetes assigns Pods a QoS
> class---Guaranteed, Burstable, or BestEffort---based on their resource
> configuration, and this classification can influence behavior during
> node resource pressure. Namespace-level controls such as LimitRange
> and ResourceQuota provide defaults, constraints, and aggregate
> governance. In production, requests and limits should be based on
> measured workload behavior, startup and peak usage, sidecar overhead,
> SLOs, and capacity requirements rather than arbitrary values.

------------------------------------------------------------------------

# 221. The One Mental Model to Remember

``` text
              RESOURCE MANAGEMENT
                       |
          +------------+------------+
          |                         |
       REQUEST                    LIMIT
          |                         |
          v                         v
     SCHEDULER                 ENFORCEMENT
          |                         |
          v                  +------+------+
     "Can it fit?"           |             |
                             v             v
                           CPU           Memory
                             |             |
                             v             v
                        Throttling      OOMKill
```

And at cluster level:

``` text
Container
    |
    v
Pod
    |
    v
Request
    |
    v
Scheduler
    |
    v
Node Allocatable
    |
    v
Placement
```

The most important distinction is:

> **Requests influence where a Pod can be scheduled; limits constrain
> how much resource the container can consume.**
