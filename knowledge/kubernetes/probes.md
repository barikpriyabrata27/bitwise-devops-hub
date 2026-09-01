# Kubernetes Probes --- Complete Study & Reference Guide

> A practical, detailed guide to Kubernetes container probes: startup,
> readiness, liveness, gRPC, HTTP, TCP, exec probes, timing behavior,
> failure modes, rollout interactions, troubleshooting, production best
> practices, YAML examples, and interview questions.

------------------------------------------------------------------------

# 1. What Is a Kubernetes Probe?

A **Kubernetes Probe** is a health check performed by the kubelet to
determine the state of a container.

Kubernetes provides three main probe types:

``` text
Startup Probe
Readiness Probe
Liveness Probe
```

They answer three different questions:

``` text
Startup:
"Has the application successfully started?"

Readiness:
"Can this application receive traffic right now?"

Liveness:
"Is this application still functioning, or should it be restarted?"
```

This distinction is one of the most important Kubernetes concepts.

------------------------------------------------------------------------

# 2. Why Do We Need Probes?

A container being in the `Running` state does not necessarily mean the
application inside it is healthy.

For example:

``` text
Container process
      |
      v
    RUNNING
      |
      X
Application is actually stuck
```

The process may still exist while:

-   the application is deadlocked
-   the application cannot serve requests
-   dependencies are temporarily unavailable
-   initialization is incomplete
-   the application has entered an unrecoverable state

Probes give Kubernetes application-level health information.

------------------------------------------------------------------------

# 3. The Three Main Probes

## Startup Probe

Answers:

> Has the application finished starting?

Used mainly for slow-starting applications.

------------------------------------------------------------------------

## Readiness Probe

Answers:

> Should this Pod receive traffic right now?

A failed readiness probe removes the Pod from Service endpoints.

------------------------------------------------------------------------

## Liveness Probe

Answers:

> Is this container alive enough to continue running?

Repeated liveness failure causes kubelet to restart the container.

------------------------------------------------------------------------

# 4. Simple Mental Model

Remember:

``` text
STARTUP
   |
   | application started?
   v
READINESS
   |
   | ready for traffic?
   v
LIVENESS
   |
   | still healthy?
   v
KEEP RUNNING
```

But technically, startup, readiness, and liveness are independent probe
configurations with specific interactions.

------------------------------------------------------------------------

# 5. The Most Important Difference

Suppose an application is:

``` text
Running
but
not ready
```

Kubernetes can keep the container running while preventing traffic from
reaching it.

This is what **readiness** is for.

Suppose an application is:

``` text
Running
but
stuck
```

A failing **liveness** probe can cause the container to be restarted.

------------------------------------------------------------------------

# 6. Probe Execution

For container probes, the kubelet performs the configured health checks.

Conceptually:

``` text
Node
 |
 +-- kubelet
       |
       +-- Pod
            |
            +-- Container
                 |
                 +-- probe
```

The kubelet uses the probe result to update container/Pod health
behavior.

------------------------------------------------------------------------

# 7. Probe Types

Kubernetes supports several probe mechanisms:

``` text
HTTP GET
TCP Socket
gRPC
Exec
```

Depending on Kubernetes version/configuration, probe behavior and
supported fields can evolve, so always validate against the Kubernetes
version running your cluster.

------------------------------------------------------------------------

# 8. HTTP Probe

An HTTP probe sends an HTTP request to the container.

Example:

``` yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
```

Kubernetes expects a successful HTTP response according to probe
semantics.

Typical applications expose:

``` text
/health
/healthz
/live
/ready
```

The endpoint names are application conventions; Kubernetes does not
require those exact paths.

------------------------------------------------------------------------

# 9. HTTP Probe Example

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:stable
          ports:
            - containerPort: 80
          readinessProbe:
            httpGet:
              path: /
              port: 80
```

The kubelet checks the container through the configured HTTP probe.

------------------------------------------------------------------------

# 10. HTTP Probe Parameters

Example:

``` yaml
httpGet:
  path: /health
  port: 8080
  scheme: HTTP
  httpHeaders:
    - name: X-Health-Check
      value: kubernetes
```

Important fields include:

``` text
path
port
scheme
httpHeaders
```

------------------------------------------------------------------------

# 11. HTTP Status Codes

Probe success is based on Kubernetes probe semantics, not simply:

``` text
"Did TCP connect?"
```

For HTTP probes, successful HTTP responses are generally in the expected
success range; redirects and other responses can have specific probe
behavior.

Do not design a health endpoint that requires:

-   user authentication
-   interactive login
-   unstable external dependencies

unless that is deliberately part of the health model.

------------------------------------------------------------------------

# 12. TCP Probe

A TCP probe attempts to establish a TCP connection.

Example:

``` yaml
livenessProbe:
  tcpSocket:
    port: 8080
```

If the connection succeeds, the probe succeeds.

If the port cannot be reached, the probe fails.

------------------------------------------------------------------------

# 13. TCP Probe Example

``` yaml
readinessProbe:
  tcpSocket:
    port: 5432
  initialDelaySeconds: 5
  periodSeconds: 10
```

TCP is useful when:

-   the application doesn't expose HTTP
-   you only need to verify that a socket is accepting connections
-   the protocol is not HTTP

------------------------------------------------------------------------

# 14. TCP Probe Limitation

TCP only answers:

> Can I establish a TCP connection?

It does not prove:

> Is the application logically healthy?

For example:

``` text
TCP port open
       |
       v
Application deadlocked
```

The TCP check may still succeed.

For application-level health, HTTP/gRPC or a carefully designed exec
check may provide more information.

------------------------------------------------------------------------

# 15. Exec Probe

An exec probe executes a command inside the container.

Example:

``` yaml
livenessProbe:
  exec:
    command:
      - cat
      - /tmp/healthy
```

If the command exits successfully, the probe succeeds.

Non-zero exit status generally means failure.

------------------------------------------------------------------------

# 16. Exec Probe Example

``` yaml
readinessProbe:
  exec:
    command:
      - sh
      - -c
      - test -f /tmp/ready
```

This can be useful for applications where health is naturally
represented by local state.

However, exec probes have overhead and can be fragile if they depend on
shell commands or utilities that are not present in minimal images.

------------------------------------------------------------------------

# 17. Exec Probe Best Practice

Avoid unnecessarily complicated commands such as:

``` yaml
command:
  - sh
  - -c
  - curl http://localhost:8080/health | grep OK
```

Problems can include:

-   shell availability
-   curl not installed
-   grep not installed
-   quoting issues
-   unnecessary process overhead

Prefer a native HTTP/gRPC probe when practical.

------------------------------------------------------------------------

# 18. gRPC Probe

Kubernetes supports gRPC health checking.

Example:

``` yaml
livenessProbe:
  grpc:
    port: 50051
```

This is useful for applications implementing the standard gRPC health
checking protocol.

------------------------------------------------------------------------

# 19. gRPC Probe Example

``` yaml
readinessProbe:
  grpc:
    port: 50051
    service: my.application.Service
```

The application must implement compatible gRPC health behavior.

gRPC probes are particularly useful for native gRPC services where HTTP
health endpoints are not otherwise available.

------------------------------------------------------------------------

# 20. Probe Comparison

  Probe   Checks                 Good for
  ------- ---------------------- ----------------------------
  HTTP    HTTP endpoint          Web/API apps
  TCP     TCP connection         TCP services
  gRPC    gRPC health protocol   gRPC applications
  Exec    Command result         Local/custom health checks

------------------------------------------------------------------------

# 21. Startup Probe

A startup probe is designed for slow-starting containers.

Example:

``` yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
```

This gives the application a startup window.

------------------------------------------------------------------------

# 22. Why Startup Probe Exists

Suppose:

``` text
Application startup = 3 minutes
```

but:

``` text
liveness probe starts immediately
```

A poorly configured liveness probe could conclude:

``` text
application unhealthy
```

and repeatedly restart it before startup completes.

This can create:

``` text
restart
  |
  v
startup
  |
  v
liveness failure
  |
  v
restart
  |
  v
startup
```

This is a **restart loop**.

Startup probes prevent liveness/readiness checks from being used
prematurely during startup when configured appropriately.

------------------------------------------------------------------------

# 23. Startup Probe Interaction

When a startup probe is configured:

``` text
Container starts
      |
      v
Startup probe runs
      |
      +---- FAIL ----> continue startup window
      |
      +---- SUCCESS --> startup complete
                              |
                  +-----------+-----------+
                  |                       |
             Liveness                 Readiness
               active                   active
```

The kubelet does not run liveness/readiness probes until the startup
probe has succeeded.

------------------------------------------------------------------------

# 24. Startup Probe Failure

If the startup probe keeps failing until its failure threshold is
reached, the container is restarted.

Example:

``` yaml
startupProbe:
  httpGet:
    path: /health
    port: 8080
  periodSeconds: 10
  failureThreshold: 30
```

A rough maximum startup allowance is:

``` text
periodSeconds × failureThreshold
```

Here:

``` text
10 × 30 = 300 seconds
```

approximately five minutes, subject to probe timing behavior.

------------------------------------------------------------------------

# 25. Readiness Probe

Readiness determines whether a Pod should receive traffic.

Example:

``` yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5
```

If readiness fails:

``` text
Pod remains running
but
Pod is removed from applicable Service endpoints
```

------------------------------------------------------------------------

# 26. Readiness Is Not Restart

This is critical.

A failed readiness probe does **not normally restart the container**.

Instead:

``` text
Readiness FAIL
      |
      v
Pod not ready
      |
      v
Service stops routing normal traffic to it
```

The container can continue running.

------------------------------------------------------------------------

# 27. Readiness Example

Imagine:

``` text
Pod A = ready
Pod B = ready
Pod C = not ready
```

Service:

``` text
Service
 |
 +-- Pod A
 +-- Pod B
```

Pod C is not included as a normal ready endpoint.

------------------------------------------------------------------------

# 28. Readiness During Temporary Dependency Failure

Suppose an API requires a dependency:

``` text
API
 |
 v
Database
```

If the database is temporarily unavailable, you may want the API to:

``` text
remain running
but
stop receiving new traffic
```

Readiness can be appropriate.

Be careful, however, about making readiness depend on every downstream
dependency, because this can cause cascading traffic removal.

------------------------------------------------------------------------

# 29. Liveness Probe

Liveness determines whether a container should be restarted.

Example:

``` yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  periodSeconds: 10
  failureThreshold: 3
```

If the application consistently fails the liveness probe:

``` text
kubelet
  |
  v
restart container
```

------------------------------------------------------------------------

# 30. Liveness Should Detect Unrecoverable States

Good liveness question:

> Is the process alive and capable of recovering without a restart?

Bad liveness question:

> Is every dependency in the entire system healthy?

If liveness depends on too many external systems, a temporary dependency
outage can cause unnecessary restarts.

------------------------------------------------------------------------

# 31. Liveness vs Readiness

The easiest way to remember:

``` text
Liveness
    =
Should I restart this container?

Readiness
    =
Should I send traffic to this Pod?
```

------------------------------------------------------------------------

# 32. Startup vs Liveness

``` text
Startup:
"Has it started?"

Liveness:
"After starting, is it still functioning?"
```

Startup protects slow initialization.

Liveness detects runtime failure.

------------------------------------------------------------------------

# 33. Readiness vs Startup

``` text
Startup:
initialization health

Readiness:
traffic eligibility
```

A Pod may be:

``` text
Running
Startup successful
Not Ready
```

That is perfectly valid.

------------------------------------------------------------------------

# 34. Pod Conditions

Pod status can include conditions such as:

``` text
PodScheduled
Initialized
ContainersReady
Ready
```

Probe results influence readiness/container health behavior and
therefore can affect Pod conditions.

Inspect:

``` bash
kubectl get pod <pod> -o yaml
```

or:

``` bash
kubectl describe pod <pod>
```

------------------------------------------------------------------------

# 35. Container State vs Probe State

Do not confuse:

``` text
container state
```

with:

``` text
probe result
```

A container can be:

``` text
Running
```

while readiness is:

``` text
False
```

A container can be repeatedly restarted because liveness fails.

------------------------------------------------------------------------

# 36. Probe Timing Parameters

Important fields:

``` yaml
initialDelaySeconds:
periodSeconds:
timeoutSeconds:
successThreshold:
failureThreshold:
```

For startup probes, `failureThreshold` and `periodSeconds` are
particularly important when defining the startup window.

------------------------------------------------------------------------

# 37. `initialDelaySeconds`

Defines how long to wait before the first probe is initiated after the
container starts.

Example:

``` yaml
initialDelaySeconds: 20
```

Conceptually:

``` text
container starts
      |
      | 20 seconds
      v
first probe
```

With startup probes, carefully consider whether you need a large initial
delay; often the startup probe itself is a better way to represent slow
startup.

------------------------------------------------------------------------

# 38. `periodSeconds`

Controls how frequently the probe is performed.

Example:

``` yaml
periodSeconds: 10
```

Conceptually:

``` text
probe
  |
10 sec
  |
probe
  |
10 sec
  |
probe
```

------------------------------------------------------------------------

# 39. `timeoutSeconds`

Maximum amount of time the probe can take before it is considered
unsuccessful.

Example:

``` yaml
timeoutSeconds: 2
```

If the health check does not complete within the timeout, it is
considered failed.

Choose this based on realistic application behavior.

------------------------------------------------------------------------

# 40. `failureThreshold`

Number of consecutive failures generally required before the probe is
considered failed for its purpose.

Example:

``` yaml
failureThreshold: 3
```

Conceptually:

``` text
FAIL
FAIL
FAIL
 |
 v
Probe failure action
```

Exact state transitions depend on probe type and configuration.

------------------------------------------------------------------------

# 41. `successThreshold`

Number of consecutive successes generally required to transition a
failed probe back to success.

Example:

``` yaml
successThreshold: 2
```

For many probe configurations, the default is 1.

There are restrictions on `successThreshold` for some probe
types/states; consult the Kubernetes API documentation for the exact
version you use.

------------------------------------------------------------------------

# 42. Probe Timing Example

Suppose:

``` yaml
periodSeconds: 10
failureThreshold: 3
```

A simplified mental model is:

``` text
t=0    FAIL
t=10   FAIL
t=20   FAIL
       |
       v
threshold reached
```

Do not treat this as an exact wall-clock guarantee because probe
scheduling and execution have implementation details.

------------------------------------------------------------------------

# 43. Probe Configuration Example

``` yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
  successThreshold: 1
```

Read it as:

``` text
Wait ~30s before starting checks.
Check every ~10s.
Allow ~2s for each check.
Require 3 consecutive failures to fail.
Require 1 success to recover.
```

------------------------------------------------------------------------

# 44. Complete Example: All Three Probes

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: example/api:1.0
          ports:
            - containerPort: 8080

          startupProbe:
            httpGet:
              path: /startup
              port: 8080
            periodSeconds: 10
            failureThreshold: 30

          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 3

          livenessProbe:
            httpGet:
              path: /live
              port: 8080
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
```

------------------------------------------------------------------------

# 45. Health Endpoint Design

A good application may expose:

``` text
/live
/ready
/startup
```

Each endpoint should have a clear responsibility.

Example:

``` text
/live
  |
  +-- process/event loop healthy?

/ready
  |
  +-- can this instance serve traffic?

/startup
  |
  +-- initialization completed?
```

These are conceptual examples, not Kubernetes-mandated endpoint names.

------------------------------------------------------------------------

# 46. Liveness Endpoint Design

Liveness should generally be cheap.

Example:

``` text
GET /live
     |
     +-- process responding?
     |
     +-- internal state not permanently broken?
     |
     +-- return 200
```

Avoid making liveness call:

``` text
database
cache
third-party API
payment gateway
```

unless you have a very deliberate reason.

------------------------------------------------------------------------

# 47. Readiness Endpoint Design

Readiness can be more application-aware.

Example:

``` text
GET /ready
     |
     +-- initialized?
     +-- required local resources available?
     +-- accepting requests?
     |
     +-- return success
```

Whether to check external dependencies depends on your architecture.

------------------------------------------------------------------------

# 48. Startup Endpoint Design

Startup should represent:

``` text
application initialization complete
```

It can account for:

-   migrations
-   cache initialization
-   large model loading
-   configuration loading
-   local data preparation

Again, keep the check itself reliable and inexpensive.

------------------------------------------------------------------------

# 49. Should Readiness Check the Database?

There is no universal answer.

### Possible approach

``` text
Readiness = database reachable
```

Useful when the application genuinely cannot serve useful requests
without the database.

### Possible alternative

``` text
Readiness = application process is ready
```

while application-level retries handle temporary database problems.

Choose based on failure behavior.

------------------------------------------------------------------------

# 50. Cascading Failure Warning

Consider:

``` text
Database outage
      |
      v
All API readiness checks fail
      |
      v
All API Pods removed from Service
      |
      v
No API traffic handled
```

This may be correct---or it may make recovery worse.

Even worse:

``` text
Database outage
      |
      v
Liveness fails
      |
      v
All Pods restart
      |
      v
Database receives reconnect storm
```

This is why liveness should be conservative.

------------------------------------------------------------------------

# 51. Readiness Is a Traffic Control Mechanism

A useful mental model:

``` text
Readiness
    =
"Keep me out of traffic"
```

It does not necessarily mean:

``` text
"Kill me"
```

------------------------------------------------------------------------

# 52. Liveness Is a Recovery Mechanism

Another mental model:

``` text
Liveness
    =
"Restart me if I am irrecoverably stuck"
```

Do not use liveness simply because a health endpoint exists.

------------------------------------------------------------------------

# 53. Startup Is a Startup Guard

``` text
Startup
    =
"Don't judge my liveness/readiness
     until I have finished starting."
```

This is particularly useful for:

-   JVM applications
-   large Python applications
-   ML models
-   applications with migrations
-   applications with slow caches
-   applications restoring large state

------------------------------------------------------------------------

# 54. Probes and Deployment Rollouts

Readiness is especially important during rolling updates.

Suppose:

``` text
old Pod = Ready
new Pod = Not Ready
```

The Service continues using ready endpoints while the new Pod
initializes.

This helps avoid sending traffic to an application before it is ready.

------------------------------------------------------------------------

# 55. Rolling Update Mental Model

``` text
Old Pod
   |
 READY
   |
Traffic

New Pod
   |
 STARTING
   |
Not Ready
   |
Startup succeeds
   |
READY
   |
Traffic
```

The Deployment controller uses readiness-related Pod state as part of
rollout progress behavior.

------------------------------------------------------------------------

# 56. `minReadySeconds`

Deployment supports:

``` yaml
minReadySeconds: 10
```

This controls how long a newly ready Pod must remain ready before it is
considered available for Deployment progress purposes.

This is different from the readiness probe itself.

------------------------------------------------------------------------

# 57. Probe vs `minReadySeconds`

### Readiness probe

Answers:

``` text
Can traffic be sent to this Pod?
```

### `minReadySeconds`

Answers approximately:

``` text
Has this Pod remained ready long enough
to count as available for the Deployment?
```

They solve different problems.

------------------------------------------------------------------------

# 58. Probes and Services

A Service selects Pods through labels.

Readiness determines whether the Pod is considered an eligible endpoint
for normal Service traffic.

Conceptually:

``` text
Service
   |
   +-- Ready Pod A
   +-- Ready Pod B
   |
   X-- Not Ready Pod C
```

------------------------------------------------------------------------

# 59. EndpointSlices

Modern Kubernetes uses **EndpointSlices** to represent Service
endpoints.

Inspect:

``` bash
kubectl get endpointslices -n <namespace>
```

Describe:

``` bash
kubectl describe endpointslice <name> -n <namespace>
```

When troubleshooting readiness and Service traffic, EndpointSlices can
show which endpoints are ready.

------------------------------------------------------------------------

# 60. Probes and Ingress

Ingress traffic generally reaches Services, which then route to eligible
endpoints.

A typical path:

``` text
Client
  |
  v
Load Balancer / Ingress
  |
  v
Service
  |
  v
Ready Pod
```

Readiness therefore plays an important role in preventing traffic from
reaching Pods that are not ready.

------------------------------------------------------------------------

# 61. Probes and Gateway API

The same broad principle applies with Gateway API:

``` text
Client
  |
  v
Gateway
  |
  v
Route
  |
  v
Service
  |
  v
Ready workload endpoints
```

The exact routing behavior depends on the Gateway implementation.

------------------------------------------------------------------------

# 62. Probe Failures and Events

When a probe fails, inspect:

``` bash
kubectl describe pod <pod> -n <namespace>
```

Look at the Events section.

You may see messages indicating:

``` text
Liveness probe failed
Readiness probe failed
Startup probe failed
```

------------------------------------------------------------------------

# 63. Probe Failure Troubleshooting

Start with:

``` bash
kubectl get pod <pod> -n <namespace>
```

Then:

``` bash
kubectl describe pod <pod> -n <namespace>
```

Then logs:

``` bash
kubectl logs <pod> -n <namespace>
```

If restarted:

``` bash
kubectl logs <pod> -n <namespace> --previous
```

------------------------------------------------------------------------

# 64. Check Restart Count

``` bash
kubectl get pods -n <namespace>
```

Example:

``` text
NAME    READY   STATUS    RESTARTS
api     1/1     Running   5
```

A high restart count is a strong reason to inspect liveness/startup
configuration and application logs.

------------------------------------------------------------------------

# 65. Check Pod YAML

``` bash
kubectl get pod <pod> -n <namespace> -o yaml
```

Inspect:

``` yaml
spec:
  containers:
    - name: api
      livenessProbe:
      readinessProbe:
      startupProbe:
```

Also inspect status:

``` yaml
status:
  containerStatuses:
```

------------------------------------------------------------------------

# 66. Test the Endpoint Manually

If the probe is:

``` yaml
httpGet:
  path: /health
  port: 8080
```

you can test from inside the Pod/network environment.

For example, if a shell/tool exists:

``` bash
kubectl exec -it <pod> -n <namespace> -- \
  curl -v http://127.0.0.1:8080/health
```

Do not assume `curl` exists in minimal images.

------------------------------------------------------------------------

# 67. Debugging Without Curl

If the application image does not contain debugging tools, use a
dedicated temporary debugging Pod/container.

Possible tools:

``` text
curl
wget
nc
nslookup
dig
```

Do not add large debugging packages to production images merely for
troubleshooting.

------------------------------------------------------------------------

# 68. Probe Port Confusion

Suppose:

``` yaml
ports:
  - containerPort: 8080
```

and:

``` yaml
readinessProbe:
  httpGet:
    port: 8080
```

The health probe targets the configured container port.

Remember that:

``` text
containerPort
```

is descriptive metadata for many purposes; it does not itself make the
application listen on that port.

The application must actually listen there.

------------------------------------------------------------------------

# 69. Named Ports

You can use named ports in probes.

Example:

``` yaml
ports:
  - name: http
    containerPort: 8080

readinessProbe:
  httpGet:
    path: /ready
    port: http
```

This can make manifests easier to maintain.

------------------------------------------------------------------------

# 70. HTTP Probe Scheme

Example:

``` yaml
httpGet:
  path: /health
  port: 8443
  scheme: HTTPS
```

Use HTTPS when the application expects TLS on that endpoint.

Do not simply use HTTPS because the external Service uses HTTPS; the
probe targets the container endpoint according to its configuration.

------------------------------------------------------------------------

# 71. HTTP Headers

Example:

``` yaml
httpGet:
  path: /health
  port: 8080
  httpHeaders:
    - name: X-Health-Check
      value: kubernetes
```

Headers can help applications distinguish probe requests.

Avoid secrets or sensitive authentication material in probe
configuration unless absolutely necessary.

------------------------------------------------------------------------

# 72. Probe Redirects

HTTP probe redirect behavior has Kubernetes-specific semantics.

If you design health endpoints, avoid unnecessary redirects such as:

``` text
/health
   |
   301
   v
/login
```

A health endpoint should normally be direct, deterministic, and cheap.

------------------------------------------------------------------------

# 73. Host Header

HTTP probes have configurable HTTP request behavior.

If the application requires a particular virtual host, configure the
request appropriately rather than assuming the Service DNS name will be
used as the HTTP Host header.

This matters with:

-   virtual hosts
-   reverse proxies
-   multi-tenant web servers

------------------------------------------------------------------------

# 74. Probe Authentication

Health endpoints should ideally be designed so kubelet can call them
reliably.

Avoid complex authentication dependencies for basic liveness.

If authentication is mandatory, design a stable mechanism appropriate
for the cluster architecture.

Do not place reusable secrets directly into manifests just to make a
health check work.

------------------------------------------------------------------------

# 75. Probe Security

Health endpoints can expose sensitive information.

Avoid returning:

``` text
database passwords
tokens
stack traces
internal credentials
```

A health endpoint should normally return a minimal status.

Example:

``` json
{
  "status": "ok"
}
```

------------------------------------------------------------------------

# 76. Probe Performance

Probes run repeatedly.

A probe that performs expensive work can create significant overhead.

Bad:

``` text
Every 1 second
  |
  +-- run complex database query
  +-- call 5 APIs
  +-- scan filesystem
```

Better:

``` text
Cheap local health check
```

------------------------------------------------------------------------

# 77. Probe Frequency

Do not automatically use:

``` yaml
periodSeconds: 1
```

for every workload.

High-frequency probes can create:

-   CPU overhead
-   network traffic
-   load on dependencies
-   log noise

Use a frequency appropriate to the application's failure detection
needs.

------------------------------------------------------------------------

# 78. Probe Timeout

Do not set:

``` yaml
timeoutSeconds: 1
```

without understanding the application.

If the endpoint sometimes takes 1.5 seconds under normal load, the probe
can become unstable.

Probe thresholds should reflect realistic performance characteristics.

------------------------------------------------------------------------

# 79. Flapping Readiness

A readiness probe can repeatedly switch:

``` text
Ready
Not Ready
Ready
Not Ready
```

This is called readiness flapping.

Possible causes:

-   unstable dependency
-   timeout too aggressive
-   overloaded application
-   health endpoint too expensive
-   insufficient resources
-   intermittent network issue

------------------------------------------------------------------------

# 80. Flapping Liveness

Liveness flapping is more dangerous:

``` text
healthy
   |
probe timeout
   |
restart
   |
healthy
   |
probe timeout
   |
restart
```

This can create an unnecessary restart loop.

Tune liveness conservatively.

------------------------------------------------------------------------

# 81. Probe and CPU Starvation

An overloaded container may fail its probe because it cannot respond
quickly enough.

Before changing probe thresholds, investigate:

``` bash
kubectl top pod <pod> -n <namespace>
```

if metrics are available.

Also inspect:

``` text
CPU requests
CPU limits
memory
application latency
node pressure
```

------------------------------------------------------------------------

# 82. Probe and Memory Pressure

Memory pressure can cause:

-   application slowdown
-   OOM kills
-   probe timeouts
-   container restarts

Check:

``` bash
kubectl describe pod <pod> -n <namespace>
```

Look for:

``` text
OOMKilled
```

Do not misdiagnose every failed liveness probe as a probe configuration
problem.

------------------------------------------------------------------------

# 83. Probe and OOMKilled

A Pod may show:

``` text
Last State:
  Terminated
  Reason: OOMKilled
```

In that case, the immediate problem may be memory exhaustion rather than
liveness.

Check:

``` bash
kubectl get pod <pod> -o yaml
```

and:

``` bash
kubectl describe pod <pod>
```

------------------------------------------------------------------------

# 84. Probe and Application Startup

A common mistake:

``` yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
```

while the application needs:

``` text
90 seconds
```

to start.

Better:

``` text
startupProbe
+
readinessProbe
+
livenessProbe
```

with realistic thresholds.

------------------------------------------------------------------------

# 85. Probe and Database Migrations

Applications that run migrations during startup may take much longer
than usual.

A startup probe can allow the application time to complete
initialization.

Example:

``` text
Container starts
      |
      v
Migration
      |
      v
Application initialized
      |
      v
Startup succeeds
      |
      v
Readiness succeeds
```

------------------------------------------------------------------------

# 86. Probe and JVM Applications

JVM applications may have:

-   class loading
-   JIT compilation
-   cache initialization
-   dependency initialization

Startup probes can be useful.

Do not simply increase `initialDelaySeconds` indefinitely; model the
startup process.

------------------------------------------------------------------------

# 87. Probe and ML Applications

Large ML applications can take significant time to:

-   load models
-   initialize GPU
-   load tokenizer/data
-   establish connections

A startup probe can be particularly useful.

Readiness should indicate:

``` text
model loaded
+
server able to accept requests
```

------------------------------------------------------------------------

# 88. Probe and Stateful Applications

Stateful applications may have more complex readiness conditions.

For example:

``` text
database starts
      |
      v
recovery
      |
      v
accepting connections
```

Readiness should reflect whether the instance should receive application
traffic.

------------------------------------------------------------------------

# 89. Probe and Graceful Shutdown

Probes also interact conceptually with shutdown.

When a Pod is terminating:

``` text
termination begins
      |
      v
Pod removed from traffic path
      |
      v
application termination
```

Applications should handle termination gracefully.

Do not depend solely on probe failures to implement graceful shutdown.

------------------------------------------------------------------------

# 90. Readiness During Shutdown

Kubernetes service endpoint management and Pod termination mechanisms
help stop traffic to terminating Pods.

Applications should still:

-   handle SIGTERM
-   stop accepting new work
-   finish in-flight work when possible
-   exit within termination grace period

------------------------------------------------------------------------

# 91. Probe and `terminationGracePeriodSeconds`

Example:

``` yaml
terminationGracePeriodSeconds: 30
```

This controls how long Kubernetes generally gives the Pod to terminate
gracefully.

Probe configuration and shutdown behavior should be designed together.

------------------------------------------------------------------------

# 92. Probe and `preStop`

A lifecycle hook can be used for shutdown preparation.

Example:

``` yaml
lifecycle:
  preStop:
    exec:
      command:
        - /bin/sh
        - -c
        - sleep 5
```

Do not use arbitrary sleeps as a substitute for understanding endpoint
draining and application shutdown.

------------------------------------------------------------------------

# 93. Probe and Rolling Deployments

A robust rolling deployment typically needs:

``` text
startupProbe
readinessProbe
livenessProbe
+
appropriate Deployment strategy
+
graceful shutdown
```

This reduces the chance of:

-   premature traffic
-   premature restart
-   service interruption
-   slow rollout detection

------------------------------------------------------------------------

# 94. Probe and `kubectl rollout status`

Use:

``` bash
kubectl rollout status deployment/api
```

If a rollout is stuck, inspect:

``` bash
kubectl get pods
kubectl describe pod <pod>
kubectl get events
```

A common cause is that new Pods never become Ready.

------------------------------------------------------------------------

# 95. Probe Failure Can Block a Rollout

Example:

``` text
New Pod
  |
Readiness FAIL
  |
Not Available
  |
Deployment waits
```

If enough Pods cannot become Ready, a rollout may fail to progress.

This is why readiness is a deployment-safety mechanism, not just a
health indicator.

------------------------------------------------------------------------

# 96. Common Failure: Wrong Path

Manifest:

``` yaml
path: /health
```

Application exposes:

``` text
/healthz
```

Result:

``` text
404
```

Fix either:

``` text
probe path
```

or:

``` text
application endpoint
```

------------------------------------------------------------------------

# 97. Common Failure: Wrong Port

Application listens:

``` text
8080
```

Probe checks:

``` text
8000
```

Result:

``` text
connection refused
```

Verify:

``` bash
kubectl exec <pod> -- ...
```

and inspect application configuration.

------------------------------------------------------------------------

# 98. Common Failure: HTTP vs HTTPS

Application expects:

``` text
HTTPS :8443
```

Probe uses:

``` yaml
scheme: HTTP
```

Result:

``` text
probe failure
```

Configure the correct scheme.

------------------------------------------------------------------------

# 99. Common Failure: Health Endpoint Depends on Authentication

If:

``` text
/health
```

requires authentication, kubelet may receive:

``` text
401 Unauthorized
```

Design a suitable health endpoint or configure the probe appropriately.

------------------------------------------------------------------------

# 100. Common Failure: Health Endpoint Redirects

Example:

``` text
/health
  |
  v
/login
```

This is usually a poor health endpoint design.

Keep health endpoints direct and deterministic.

------------------------------------------------------------------------

# 101. Common Failure: Exec Command Missing

Example:

``` yaml
exec:
  command:
    - curl
    - localhost:8080/health
```

Minimal image:

``` text
curl: command not found
```

The probe fails.

Use HTTP probe where possible or ensure the required executable is
intentionally present.

------------------------------------------------------------------------

# 102. Common Failure: Probe Too Aggressive

Example:

``` yaml
timeoutSeconds: 1
failureThreshold: 1
```

A single temporary delay causes failure.

For liveness, this can cause unnecessary restarts.

For readiness, it can cause traffic flapping.

Tune based on real behavior.

------------------------------------------------------------------------

# 103. Common Failure: Probe Too Lenient

Example:

``` yaml
failureThreshold: 30
periodSeconds: 60
```

The system may take a long time to detect a genuinely dead application.

Health detection should balance:

``` text
false positives
vs
detection latency
```

------------------------------------------------------------------------

# 104. Probe Design Principle

Think:

``` text
Fast enough to detect meaningful failure
+
stable enough to avoid false positives
+
cheap enough to run continuously
```

------------------------------------------------------------------------

# 105. Liveness Anti-Pattern

Bad:

``` text
/liveness
    |
    +-- check database
    +-- check Redis
    +-- check Kafka
    +-- check external payment API
    +-- check third-party service
```

If one dependency fails:

``` text
Liveness FAIL
   |
   v
Restart
```

This can make an external outage much worse.

------------------------------------------------------------------------

# 106. Better Liveness

Prefer:

``` text
/liveness
    |
    +-- process healthy?
    +-- internal state recoverable?
```

Use readiness for traffic eligibility when appropriate.

------------------------------------------------------------------------

# 107. Readiness Anti-Pattern

Bad:

``` text
Readiness = every possible dependency must be healthy
```

This can remove every Pod from traffic during a single dependency
outage.

Instead, decide what the application actually needs to serve useful
traffic.

------------------------------------------------------------------------

# 108. Startup Anti-Pattern

Bad:

``` text
startupProbe:
  periodSeconds: 1
  failureThreshold: 100000
```

This technically creates a huge startup window but hides genuine startup
failures.

Set a realistic maximum.

------------------------------------------------------------------------

# 109. Probe Endpoint Must Be Reliable

A health endpoint should not:

-   allocate huge amounts of memory
-   perform expensive computation
-   wait indefinitely
-   depend on user-specific state
-   return random results
-   generate excessive logs

It should be predictable.

------------------------------------------------------------------------

# 110. Probe and Logging

If a probe runs every 5 seconds:

``` text
12 probes/minute
720 probes/hour
```

per Pod.

If every request creates an INFO log line, large clusters can generate
substantial noise.

Consider appropriate logging levels and access-log filtering.

------------------------------------------------------------------------

# 111. Probe and Metrics

Monitor:

``` text
probe failures
container restarts
Pod readiness
startup duration
application latency
OOM kills
```

Probe failures should be correlated with application metrics rather than
analyzed in isolation.

------------------------------------------------------------------------

# 112. Useful Commands

List Pods:

``` bash
kubectl get pods -A
```

Describe Pod:

``` bash
kubectl describe pod <pod> -n <namespace>
```

Get YAML:

``` bash
kubectl get pod <pod> -n <namespace> -o yaml
```

Logs:

``` bash
kubectl logs <pod> -n <namespace>
```

Previous container logs:

``` bash
kubectl logs <pod> -n <namespace> --previous
```

Events:

``` bash
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

------------------------------------------------------------------------

# 113. Check Restarts

``` bash
kubectl get pods -n <namespace>
```

or:

``` bash
kubectl get pods -n <namespace> -o wide
```

Look at:

``` text
RESTARTS
```

A growing restart count should trigger investigation.

------------------------------------------------------------------------

# 114. Check Deployment

``` bash
kubectl get deployment api -n production
```

Then:

``` bash
kubectl describe deployment api -n production
```

And:

``` bash
kubectl rollout status deployment/api -n production
```

------------------------------------------------------------------------

# 115. Check EndpointSlices

``` bash
kubectl get endpointslices -n production
```

Then:

``` bash
kubectl describe endpointslice <name> -n production
```

This is particularly useful when:

``` text
Pod is running
but
Service does not receive traffic
```

------------------------------------------------------------------------

# 116. Check Service

``` bash
kubectl get svc api -n production
```

``` bash
kubectl describe svc api -n production
```

Verify:

``` text
selector
port
targetPort
```

and compare them with Pod labels and actual listening ports.

------------------------------------------------------------------------

# 117. Debugging Workflow

When a Pod is not receiving traffic:

``` text
Pod exists?
   |
   v
Pod Running?
   |
   v
Readiness = True?
   |
   v
EndpointSlice contains ready endpoint?
   |
   v
Service selector correct?
   |
   v
Service port correct?
   |
   v
NetworkPolicy?
   |
   v
Application responding?
```

------------------------------------------------------------------------

# 118. Debugging Workflow for Restarts

``` text
Container restarting?
       |
       v
kubectl describe pod
       |
       +--> Liveness failure?
       |
       +--> Startup failure?
       |
       +--> OOMKilled?
       |
       +--> CrashLoopBackOff?
       |
       v
Check current logs
       |
       v
Check previous logs
       |
       v
Check resource usage
       |
       v
Check application health endpoint
```

------------------------------------------------------------------------

# 119. `CrashLoopBackOff` and Probes

`CrashLoopBackOff` is not itself a probe failure.

It means Kubernetes is repeatedly restarting a container and backing off
between restarts.

Possible causes include:

-   application crashes
-   liveness probe failures
-   startup probe failures
-   bad configuration
-   missing files
-   dependency failures
-   OOM kills

Always inspect the actual termination reason.

------------------------------------------------------------------------

# 120. `ContainerCreating` vs Probe

If a Pod is stuck in:

``` text
ContainerCreating
```

probes may not yet be the main issue.

Investigate:

-   image pull
-   volume mount
-   CNI/network setup
-   secrets/configmaps
-   runtime errors

Probe failures are more relevant after the container starts and checks
begin.

------------------------------------------------------------------------

# 121. `Pending` vs Probe

A Pod in:

``` text
Pending
```

usually has not started its container.

Possible causes:

-   insufficient resources
-   scheduling constraints
-   affinity
-   taints/tolerations
-   PVC binding
-   admission issues

Probes generally are not the first thing to investigate.

------------------------------------------------------------------------

# 122. Probe Failure and NetworkPolicy

A kubelet probe is directed toward the Pod/container according to
Kubernetes probe semantics.

NetworkPolicy behavior around probes can depend on cluster networking
implementation and traffic path.

Do not assume a NetworkPolicy change is harmless to probes.

If a probe unexpectedly fails after network-policy changes, investigate
the actual traffic path and CNI behavior.

------------------------------------------------------------------------

# 123. Probe and Host Network

Pods using:

``` yaml
hostNetwork: true
```

have different networking behavior.

Probe behavior can therefore differ from a normal Pod network setup.

Be especially careful with:

-   port conflicts
-   address binding
-   node-local services

------------------------------------------------------------------------

# 124. Probe and Sidecars

With multiple containers:

``` text
Pod
├── application
└── sidecar
```

probes are configured per container.

A sidecar's health does not automatically mean the application container
is healthy.

Define probes for the containers where health detection is needed.

------------------------------------------------------------------------

# 125. Probe and Init Containers

Init containers run before application containers.

Normal application probes are configured on regular containers.

If initialization is long, init containers can be used for
initialization work, while startup probes can protect slow-starting
application containers.

------------------------------------------------------------------------

# 126. Probe and Multi-Container Pods

Example:

``` yaml
containers:
  - name: app
    image: example/app
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080

  - name: sidecar
    image: example/sidecar
```

The Pod's overall readiness behavior can involve container readiness.

Understand which container's health is affecting the Pod's `Ready`
condition.

------------------------------------------------------------------------

# 127. Probe and Sidecar Dependency

Suppose:

``` text
Application
    |
    v
Proxy sidecar
```

If the application depends on the sidecar to function, consider whether
readiness should represent:

``` text
application ready
+
required sidecar path ready
```

Avoid creating circular health dependencies.

------------------------------------------------------------------------

# 128. Probe and Service Meshes

Service meshes can add sidecars and traffic management.

Health checking may involve:

``` text
kubelet
   |
   v
Pod/container
   |
   +-- application
   +-- proxy
```

Understand how the mesh handles:

-   health checks
-   traffic interception
-   ports
-   startup ordering
-   readiness

Exact behavior is mesh-specific.

------------------------------------------------------------------------

# 129. Probe and TLS

For HTTPS probes:

``` yaml
httpGet:
  path: /health
  port: 8443
  scheme: HTTPS
```

Ensure the container is actually serving TLS there.

The probe configuration should match the application's listening
interface/port and TLS behavior.

------------------------------------------------------------------------

# 130. Probe and IPv4/IPv6

If your application binds only to:

``` text
127.0.0.1
```

versus:

``` text
0.0.0.0
```

probe connectivity can behave differently depending on the probe path
and network configuration.

For production, verify the actual bind address.

------------------------------------------------------------------------

# 131. Probe and Binding Address

Common issue:

``` text
Application:
127.0.0.1:8080
```

but expected network behavior requires:

``` text
0.0.0.0:8080
```

An external client may fail even though a local check succeeds.

Understand where the probe originates and what address it targets.

------------------------------------------------------------------------

# 132. Probe and Named Ports

Recommended:

``` yaml
ports:
  - name: http
    containerPort: 8080

readinessProbe:
  httpGet:
    path: /ready
    port: http
```

This reduces hard-coded port duplication.

------------------------------------------------------------------------

# 133. Probe and Config Changes

If you change:

``` text
health endpoint
port
TLS
application startup time
```

update the probe configuration together.

A deployment can be perfectly healthy from the application's perspective
but continuously fail because the probe definition is stale.

------------------------------------------------------------------------

# 134. Probe and Version Compatibility

Probe fields are part of Kubernetes API behavior.

Before using newer probe features:

``` text
check Kubernetes version
check API documentation
check distribution support
```

This is especially important for features added or enhanced in newer
releases.

------------------------------------------------------------------------

# 135. Probe API Structure

Typical container configuration:

``` yaml
spec:
  containers:
    - name: app
      image: example/app:1.0

      startupProbe:
        ...

      readinessProbe:
        ...

      livenessProbe:
        ...
```

Each probe has a handler and timing configuration.

------------------------------------------------------------------------

# 136. Probe Handler Concept

A probe generally consists of:

``` text
Handler
+
Timing
+
Thresholds
```

Handler:

``` text
HTTP
TCP
gRPC
Exec
```

Timing:

``` text
period
timeout
initial delay
```

Threshold:

``` text
success
failure
```

------------------------------------------------------------------------

# 137. Generic Probe Template

``` yaml
readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
  successThreshold: 1
```

Use this as a starting structure, not a universal production
configuration.

------------------------------------------------------------------------

# 138. Production Probe Strategy

A common strategy:

``` text
Startup:
    protect slow startup

Readiness:
    protect traffic

Liveness:
    recover from unrecoverable hangs
```

This gives each probe a distinct responsibility.

------------------------------------------------------------------------

# 139. Example Production Configuration

``` yaml
startupProbe:
  httpGet:
    path: /startup
    port: http
  periodSeconds: 10
  failureThreshold: 30

readinessProbe:
  httpGet:
    path: /ready
    port: http
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 3

livenessProbe:
  httpGet:
    path: /live
    port: http
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
```

Adjust based on application behavior.

------------------------------------------------------------------------

# 140. Probe Design for Fast Applications

For a fast API:

``` text
startup = 2 sec
readiness = cheap
liveness = cheap
```

You may not need complex startup logic.

The configuration can be simpler.

------------------------------------------------------------------------

# 141. Probe Design for Slow Applications

For a slow application:

``` text
startup = 2 minutes
```

Use:

``` text
startupProbe
+
readinessProbe
+
livenessProbe
```

rather than making liveness itself extremely lenient.

------------------------------------------------------------------------

# 142. Probe Design for Batch Jobs

A batch workload may not need HTTP readiness/liveness at all.

For Jobs, focus on:

``` text
process exit status
completion
failure
retries
```

Do not add probes automatically just because a workload is in
Kubernetes.

------------------------------------------------------------------------

# 143. Probe Design for Worker Processes

For a worker:

``` text
HTTP health endpoint
```

may be possible.

Alternatively:

``` text
exec
```

or:

``` text
gRPC
```

may better represent health.

The key is to measure something meaningful.

------------------------------------------------------------------------

# 144. Probe Design for Databases

Databases require careful health semantics.

A TCP check proves:

``` text
port accepts TCP
```

but not necessarily:

``` text
database ready for application queries
```

A native health mechanism can be more meaningful if available.

Be conservative with liveness.

------------------------------------------------------------------------

# 145. Probe Design for Message Consumers

A consumer could expose:

``` text
/ready
```

only when:

``` text
consumer initialized
+
required connection established
+
able to process messages
```

But avoid making liveness depend on a broker's temporary outage unless
restarting the consumer is genuinely the desired recovery behavior.

------------------------------------------------------------------------

# 146. Probe and Backpressure

If an application is overloaded, readiness may be used in some
architectures to temporarily remove instances from traffic.

But this should be deliberate.

Do not create a health endpoint that oscillates based on tiny
queue-length changes.

Use proper load shedding/backpressure mechanisms where appropriate.

------------------------------------------------------------------------

# 147. Probe and Autoscaling

Readiness/liveness are not autoscaling metrics.

Do not use:

``` text
liveness failures
```

as a substitute for:

``` text
CPU utilization
memory
requests per second
queue depth
custom application metrics
```

Autoscaling is a separate concern.

------------------------------------------------------------------------

# 148. Probe and HPA

HPA typically uses resource or custom metrics.

Probe state can indirectly affect observed workload behavior, but probes
are not themselves the primary scaling signal.

------------------------------------------------------------------------

# 149. Probe and PDB

A PodDisruptionBudget controls voluntary disruption availability.

Readiness affects whether a Pod is considered available in relevant
Kubernetes mechanisms.

Therefore, poorly designed readiness can interact with availability
calculations.

Use PDB and readiness intentionally together.

------------------------------------------------------------------------

# 150. Probe and PDB Warning

If many Pods become:

``` text
Not Ready
```

a PDB can make voluntary disruptions harder to perform.

This is another reason not to create overly sensitive readiness checks.

------------------------------------------------------------------------

# 151. Probe and Scheduling

Probes do not determine where a Pod is scheduled.

Scheduling uses:

-   resource requests
-   node selectors
-   affinity
-   taints/tolerations
-   topology constraints
-   scheduling policies

Probe health comes into play after workload execution begins.

------------------------------------------------------------------------

# 152. Probe and Resource Requests

Probe behavior can be affected by resource starvation.

A production health strategy should therefore consider:

``` text
CPU request
memory request
CPU limit
memory limit
node pressure
```

------------------------------------------------------------------------

# 153. Probe and Node Failure

If a node itself fails, probe results from that node may no longer be
meaningful.

Kubernetes node health mechanisms detect node problems independently.

Do not use application probes as a replacement for node health
monitoring.

------------------------------------------------------------------------

# 154. Probe and Kubelet

The kubelet is central to container probe execution.

Conceptually:

``` text
Kubelet
   |
   +-- inspect container
   |
   +-- execute configured probe
   |
   +-- record result
   |
   +-- take appropriate action
```

This is why probe troubleshooting often starts at the Pod/container
level.

------------------------------------------------------------------------

# 155. Probe and API Server

The kubelet obtains Pod configuration from the Kubernetes control plane
and reports status back.

A simplified flow:

``` text
API Server
    |
    v
Kubelet
    |
    v
Container
    |
    v
Probe
    |
    v
Kubelet updates Pod status
```

The probe itself is not an API-server HTTP request to your application.

------------------------------------------------------------------------

# 156. Probe and Service Traffic

Do not confuse:

``` text
kubelet probe
```

with:

``` text
Service traffic
```

The kubelet's health check and application client traffic are different
paths.

This matters when diagnosing:

``` text
probe works
but Service traffic fails
```

or:

``` text
Service traffic works
but probe fails
```

------------------------------------------------------------------------

# 157. Probe Troubleshooting Matrix

  -----------------------------------------------------------------------
  Symptom                             Likely areas
  ----------------------------------- -----------------------------------
  Pod Running, Not Ready              readiness endpoint/port,
                                      dependencies, policy

  Container restarting                liveness/startup, crash, OOM

  Startup probe failing               startup time, endpoint, port

  404 probe failure                   wrong path

  Connection refused                  wrong port/bind/listener

  Timeout                             application overload/network

  401/403                             authentication/authorization design

  Exec command failed                 missing executable/permissions

  Service no traffic                  readiness, selector, EndpointSlice

  Rollout stuck                       new Pods not becoming Ready
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 158. Probe Troubleshooting Checklist

``` text
[ ] Correct probe type?
[ ] Correct path?
[ ] Correct port?
[ ] Correct scheme?
[ ] Correct named port?
[ ] Correct endpoint?
[ ] Application actually listening?
[ ] Correct bind address?
[ ] Health endpoint fast?
[ ] Health endpoint deterministic?
[ ] Authentication interfering?
[ ] Startup time realistic?
[ ] Timeout realistic?
[ ] Failure threshold realistic?
[ ] Readiness dependency design correct?
[ ] Liveness dependency design safe?
[ ] Resource starvation?
[ ] OOMKilled?
[ ] NetworkPolicy/CNI issue?
[ ] Sidecar/service mesh behavior?
[ ] Events checked?
[ ] Current/previous logs checked?
```

------------------------------------------------------------------------

# 159. Best Practices

## 1. Use startup probes for genuinely slow startup

Do not abuse huge liveness delays.

## 2. Keep liveness conservative

Restart only when restart is a useful recovery action.

## 3. Use readiness for traffic control

Not readiness = don't send traffic.

## 4. Keep probes cheap

They run repeatedly.

## 5. Make endpoints deterministic

Avoid random/slow health checks.

## 6. Avoid dependency chains in liveness

External outages should not necessarily restart every Pod.

## 7. Test probes under load

A probe that works only on an idle laptop may fail in production.

------------------------------------------------------------------------

# 160. More Best Practices

## 8. Monitor probe failures

Treat repeated failures as operational signals.

## 9. Version health endpoints deliberately

Changing `/ready` behavior can affect deployments.

## 10. Avoid secrets in probes

Keep health checks simple.

## 11. Use named ports

They reduce configuration duplication.

## 12. Validate rollout behavior

Test upgrades and rollback scenarios.

## 13. Test slow startup

Simulate realistic cold starts.

## 14. Test dependency outages

Understand what readiness and liveness do during failures.

------------------------------------------------------------------------

# 161. Health Endpoint Contract

Define an explicit application contract.

Example:

``` text
GET /live

200 = process healthy
5xx = process cannot recover normally
```

``` text
GET /ready

200 = safe to receive traffic
5xx = should not receive traffic
```

``` text
GET /startup

200 = initialization complete
5xx = still starting / startup failed
```

The exact status codes and endpoint names are application design
decisions.

------------------------------------------------------------------------

# 162. Probe Contract During Dependency Failure

Document:

``` text
Database unavailable:
    readiness = ?
    liveness = ?
```

``` text
Redis unavailable:
    readiness = ?
    liveness = ?
```

``` text
Third-party API unavailable:
    readiness = ?
    liveness = ?
```

This prevents developers from accidentally turning every dependency
failure into a container restart.

------------------------------------------------------------------------

# 163. Probe Contract During Maintenance

Suppose:

``` text
application maintenance mode
```

Should readiness become false?

Maybe.

Should liveness become false?

Usually not merely because maintenance mode is active.

This illustrates why readiness and liveness must have different
semantics.

------------------------------------------------------------------------

# 164. Probe and Graceful Degradation

If an application can serve partial functionality during dependency
failure:

``` text
Database down
    |
    v
API can serve cached/read-only data
```

it may be better for readiness to remain successful.

Health design should reflect actual application capabilities, not an
idealized dependency graph.

------------------------------------------------------------------------

# 165. Probe and Zero-Downtime Deployments

A well-designed readiness probe helps ensure:

``` text
New Pod
   |
   v
Initialize
   |
   v
Ready
   |
   v
Traffic
```

rather than:

``` text
New Pod
   |
   v
Traffic immediately
   |
   X
Application not initialized
```

------------------------------------------------------------------------

# 166. Probe and Blue/Green Deployments

In blue/green deployments:

``` text
Blue = current
Green = new
```

Green should become healthy/ready before receiving production traffic.

Probes provide one important health signal for that transition.

------------------------------------------------------------------------

# 167. Probe and Canary Deployments

For canaries:

``` text
95% -> stable
5%  -> canary
```

The canary must first become ready.

Probe success does not prove business correctness, however.

Combine health probes with:

-   metrics
-   error rates
-   latency
-   synthetic checks
-   business KPIs

------------------------------------------------------------------------

# 168. Probe Is Not Full Observability

A successful liveness probe does not mean:

``` text
customers are happy
```

It only means the configured health condition is satisfied.

You still need:

``` text
logs
metrics
traces
alerts
synthetic tests
```

------------------------------------------------------------------------

# 169. Probe Is Not a Business Health Check by Default

A server returning:

``` text
HTTP 200
```

may still have:

``` text
incorrect pricing
failed transactions
wrong data
```

Health probes should focus on operational health.

Business correctness requires additional monitoring.

------------------------------------------------------------------------

# 170. Probe Testing

Before production, test:

``` text
Normal startup
Slow startup
Dependency unavailable
Application deadlock
High CPU
High memory
Network interruption
Health endpoint failure
Port failure
Graceful shutdown
Rolling deployment
Rollback
```

Record expected behavior.

------------------------------------------------------------------------

# 171. Example Failure Test

Normal:

``` text
/live -> 200
/ready -> 200
```

Simulate application stuck:

``` text
/live -> timeout
```

Expected:

``` text
container restart
```

Simulate temporary dependency failure:

``` text
/ready -> failure
/live -> 200
```

Expected:

``` text
Pod stays running
Pod stops receiving normal traffic
```

This demonstrates the difference between readiness and liveness.

------------------------------------------------------------------------

# 172. Example Startup Test

Application:

``` text
startup = 120 seconds
```

Configure:

``` yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080
  periodSeconds: 10
  failureThreshold: 20
```

Conceptually allows roughly:

``` text
10 × 20 = 200 seconds
```

for startup probe failures before restart.

Then:

``` text
startup success
      |
      v
liveness/readiness become active
```

------------------------------------------------------------------------

# 173. Example Readiness Test

Start three replicas:

``` text
Pod A Ready
Pod B Ready
Pod C Ready
```

Make Pod C fail readiness:

``` text
Pod A Ready
Pod B Ready
Pod C NotReady
```

Service should normally route only to eligible ready endpoints.

Verify with:

``` bash
kubectl get endpointslices -n <namespace>
```

------------------------------------------------------------------------

# 174. Example Liveness Test

Configure a liveness endpoint that can deliberately fail in a controlled
test environment.

Observe:

``` bash
kubectl get pod -w
```

Watch:

``` text
RESTARTS
```

Then inspect:

``` bash
kubectl describe pod <pod>
```

This helps validate that the restart behavior is actually what you
expect.

------------------------------------------------------------------------

# 175. Probe Interview Questions

## Q1. What are Kubernetes probes?

Health checks used by the kubelet to determine container/application
health.

## Q2. What are the three main probes?

``` text
startup
readiness
liveness
```

## Q3. What does readiness do?

Controls whether a Pod should be considered eligible to receive traffic.

## Q4. Does readiness failure restart the container?

Normally no.

## Q5. What does liveness do?

Detects conditions under which the container should be restarted.

------------------------------------------------------------------------

# 176. More Interview Questions

## Q6. Why use startupProbe?

To protect slow-starting applications from being judged by
liveness/readiness before initialization is complete.

## Q7. What happens when startupProbe succeeds?

Startup checking is considered complete, and liveness/readiness probes
can begin operating.

## Q8. What happens if startupProbe continually fails?

Once the configured failure threshold is reached, the container is
restarted.

## Q9. What probe should control traffic?

Readiness.

## Q10. What probe can restart a container?

Liveness, and startup failure can also result in restart.

------------------------------------------------------------------------

# 177. Interview Question: TCP vs HTTP

### TCP probe

Checks:

``` text
Can I establish a TCP connection?
```

### HTTP probe

Checks:

``` text
Does the application respond appropriately to an HTTP request?
```

HTTP generally provides a richer application-level signal.

------------------------------------------------------------------------

# 178. Interview Question: Exec vs HTTP

### Exec

Runs a command inside the container.

Advantages:

``` text
custom local checks
```

Disadvantages:

``` text
process overhead
tool availability
shell issues
```

### HTTP

Advantages:

``` text
simple
application-level
native Kubernetes probe handler
```

Use the simplest reliable mechanism.

------------------------------------------------------------------------

# 179. Interview Question: Why Not Use Liveness for Everything?

Because liveness failure causes restarts.

If liveness depends on:

``` text
database
Redis
Kafka
external API
```

a temporary dependency outage can cause widespread unnecessary restarts.

Use readiness for traffic availability where appropriate.

------------------------------------------------------------------------

# 180. Interview Question: Pod Running but Not Ready

Answer:

> A container can be running while its readiness probe is failing. In
> that state Kubernetes can keep the container running but exclude the
> Pod from normal Service traffic.

------------------------------------------------------------------------

# 181. Interview Question: Pod Restarting Every Few Seconds

Investigate:

``` text
livenessProbe
startupProbe
application crash
OOMKilled
configuration
```

Commands:

``` bash
kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs <pod> --previous
```

------------------------------------------------------------------------

# 182. Interview Question: Readiness Is Green but Service Fails

Investigate beyond probes:

``` text
Service selector
Service port
targetPort
EndpointSlice
DNS
NetworkPolicy
CNI
application response
```

Readiness only answers the health condition represented by the probe.

------------------------------------------------------------------------

# 183. Interview Question: How Do You Calculate Startup Window?

A useful approximation is:

``` text
periodSeconds × failureThreshold
```

For example:

``` yaml
periodSeconds: 10
failureThreshold: 30
```

gives roughly:

``` text
300 seconds
```

of allowed probe failures.

Explain that this is a mental-model approximation rather than an exact
wall-clock guarantee.

------------------------------------------------------------------------

# 184. Interview Question: InitialDelay vs StartupProbe

### Initial delay

Delays the first probe.

### Startup probe

Provides a dedicated startup health phase and prevents
liveness/readiness from judging the container until startup succeeds.

For applications with highly variable or long startup, startupProbe is
generally a better model.

------------------------------------------------------------------------

# 185. Interview Question: What Is Probe Flapping?

Repeated transitions:

``` text
Success
Failure
Success
Failure
```

Possible causes:

-   unstable application
-   aggressive timeout
-   insufficient resources
-   dependency instability
-   expensive health endpoint

It can cause traffic instability or repeated restarts.

------------------------------------------------------------------------

# 186. Interview Question: Should Liveness Check Database?

Usually, not by default.

A database outage is often an external dependency problem, not evidence
that the application process itself requires restart.

Use readiness or application-level resilience when appropriate.

------------------------------------------------------------------------

# 187. Interview Question: Can a Probe Use a Named Port?

Yes.

Example:

``` yaml
ports:
  - name: http
    containerPort: 8080

readinessProbe:
  httpGet:
    path: /ready
    port: http
```

------------------------------------------------------------------------

# 188. Interview Question: What Happens to Service Traffic When Readiness Fails?

The Pod becomes not ready and is normally excluded from the set of ready
Service endpoints.

This is why readiness is central to safe rolling deployments.

------------------------------------------------------------------------

# 189. Interview Question: What Happens During Container Startup?

If there is no startup probe:

``` text
liveness/readiness
```

can begin according to their configured timing.

If a startup probe exists:

``` text
startup probe
     |
     v
success
     |
     v
liveness/readiness operate
```

------------------------------------------------------------------------

# 190. Interview Question: Probe Failed With Connection Refused

Likely causes:

``` text
wrong port
application not listening
wrong bind address
application startup incomplete
TLS mismatch
container process failure
```

Check:

``` bash
kubectl describe pod <pod>
kubectl logs <pod>
```

------------------------------------------------------------------------

# 191. Interview Question: Probe Failed With 404

Likely:

``` text
wrong health path
```

Example:

``` text
Probe:
GET /health

Application:
GET /healthz
```

Fix the contract.

------------------------------------------------------------------------

# 192. Interview Question: Probe Failed With Timeout

Investigate:

``` text
application latency
CPU starvation
memory pressure
network behavior
timeoutSeconds
health endpoint complexity
```

Do not immediately increase timeout without identifying the cause.

------------------------------------------------------------------------

# 193. Interview Question: Probe Failed After NetworkPolicy Change

Investigate:

``` text
probe traffic path
CNI behavior
policy rules
Pod networking
```

Do not assume all probe traffic behaves exactly like ordinary Service
traffic.

------------------------------------------------------------------------

# 194. Interview Question: Can Readiness Be False While Container Is Running?

Yes.

This is a normal and useful state:

``` text
Container = Running
Readiness = False
```

For example:

``` text
application is warming cache
```

------------------------------------------------------------------------

# 195. Interview Question: Can Liveness Be Successful While Readiness Is False?

Yes.

Example:

``` text
Application process = healthy
Dependency needed for traffic = unavailable
```

Then:

``` text
liveness = success
readiness = failure
```

This allows the process to remain alive without receiving normal
traffic.

------------------------------------------------------------------------

# 196. Interview Question: Can Startup Be Successful While Readiness Is False?

Yes.

Startup means initialization has completed.

Readiness means traffic can currently be served.

An application can be initialized but temporarily unavailable.

------------------------------------------------------------------------

# 197. Probe Decision Table

  -----------------------------------------------------------------------
  Situation         Startup           Readiness         Liveness
  ----------------- ----------------- ----------------- -----------------
  Starting          Fail/unknown      Not ready         Not evaluated
                                                        until startup
                                                        succeeds if
                                                        startup probe
                                                        configured

  Started, healthy  Success           Success           Success

  Started,          Success           Fail              Usually success
  temporarily                                           
  unavailable                                           

  Deadlocked        Success           Fail              Fail

  Dependency outage Success           Depends on app    Usually success
                                      design            

  Startup takes     Fail until ready  Not evaluated     Not evaluated
  long                                until startup     until startup
                                      succeeds if       succeeds if
                                      startup probe     startup probe
                                      configured        configured
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 198. Golden Rule

The most important rule:

``` text
Readiness failure -> stop traffic

Liveness failure -> restart

Startup failure -> keep waiting/restart after threshold
```

This is the foundation of Kubernetes probe design.

------------------------------------------------------------------------

# 199. Production Checklist

Before deploying a workload with probes:

``` text
[ ] Startup behavior measured
[ ] Startup probe designed if needed
[ ] Readiness endpoint defined
[ ] Liveness endpoint defined
[ ] Probe endpoints are cheap
[ ] Correct ports configured
[ ] Correct paths configured
[ ] HTTP/TCP/gRPC/exec choice justified
[ ] Timeouts tested
[ ] Thresholds tested
[ ] Resource starvation tested
[ ] Dependency outage behavior tested
[ ] Rolling update tested
[ ] Rollback tested
[ ] Shutdown tested
[ ] Probe failures monitored
```

------------------------------------------------------------------------

# 200. Final Mental Model

Remember Kubernetes probes as three questions:

``` text
             APPLICATION
                  |
        +---------+---------+
        |         |         |
        v         v         v
     STARTUP   READINESS  LIVENESS
        |         |         |
        v         v         v
    "Started?" "Traffic?" "Restart?"
        |         |         |
        v         v         v
    initialization   routing   recovery
```

Or even simpler:

``` text
STARTUP
"Have I started?"

READINESS
"Can I receive traffic?"

LIVENESS
"Should I be restarted?"
```

------------------------------------------------------------------------

# 201. Final Takeaway

Kubernetes probes are not merely "health checks."

They are **control signals** that influence workload behavior:

``` text
Startup
    -> protects initialization

Readiness
    -> controls traffic eligibility

Liveness
    -> enables automatic recovery
```

A strong production design gives each probe a distinct responsibility.

The safest general pattern is:

``` text
                    Container starts
                           |
                           v
                     Startup Probe
                           |
                     startup succeeds
                           |
              +------------+------------+
              |                         |
              v                         v
       Readiness Probe            Liveness Probe
              |                         |
        traffic control             recovery
              |                         |
              v                         v
        Service routing           container restart
```

The most important principle is:

> **Do not make liveness more aggressive than necessary. A bad liveness
> probe can turn a temporary application or dependency problem into a
> restart storm.**

And:

> **Use readiness to decide whether the workload should receive traffic,
> not whether the process deserves to live.**

Once you understand those two ideas, the rest of Kubernetes probe
behavior becomes much easier to reason about.
