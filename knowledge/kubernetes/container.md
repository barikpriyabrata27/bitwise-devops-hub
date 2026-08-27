# Kubernetes Container

## 1. Overview

A **Container** is the fundamental unit used to run application workloads inside Kubernetes Pods.

Kubernetes does not normally run containers directly. Instead, containers run **inside Pods**, and Kubernetes manages those Pods through higher-level resources such as:

* Deployment
* StatefulSet
* DaemonSet
* Job
* CronJob
* ReplicaSet

A container packages an application together with its required runtime, libraries, dependencies, and configuration so that it can run consistently across environments.

---

## 2. What Is a Container?

A container is an isolated process that runs an application and its dependencies.

For example:

```text
Application
    │
    ├── Application Code
    ├── Runtime
    ├── Libraries
    ├── Dependencies
    └── Configuration
            │
            ▼
        Container
```

Containers are created from **container images**.

Common container image formats and registries include:

* Docker images
* OCI images
* Container registries
* Private enterprise registries

Examples:

```text
nginx:latest
redis:7
postgres:16
ubuntu:24.04
```

---

# 3. Container vs Pod

A common Kubernetes misconception is that a container and a Pod are the same thing.

They are not.

```text
Kubernetes Cluster
        │
        ▼
       Pod
        │
        ├── Container 1
        │
        ├── Container 2
        │
        └── Shared Volumes
```

A **Pod** is the smallest deployable unit in Kubernetes.

A Pod can contain:

* One container
* Multiple containers

The most common pattern is one main application container per Pod.

---

# 4. Basic Kubernetes Container Definition

A container is defined inside the `containers` section of a Pod specification.

Example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
    - name: nginx
      image: nginx:latest
```

Here:

```yaml
containers:
  - name: nginx
    image: nginx:latest
```

defines a container named `nginx` using the `nginx:latest` image.

---

# 5. Container Image

The `image` field specifies the container image that Kubernetes should run.

Example:

```yaml
containers:
  - name: web
    image: nginx:1.27
```

Image names generally follow:

```text
registry/repository/image:tag
```

For example:

```text
docker.io/library/nginx:1.27
```

A private registry might look like:

```text
registry.example.com/myteam/myapp:1.0.0
```

---

# 6. Container Name

Each container in a Pod must have a unique name.

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0
```

The name is used when interacting with the container.

For example:

```bash
kubectl logs <pod-name> -c application
```

or:

```bash
kubectl exec -it <pod-name> -c application -- /bin/sh
```

---

# 7. Container Ports

Container ports can be documented in the Pod specification.

Example:

```yaml
containers:
  - name: web
    image: nginx:latest
    ports:
      - containerPort: 80
```

This indicates that the container listens on port `80`.

Important:

> `containerPort` does not itself publish the container to the outside world.

To expose an application, Kubernetes normally uses a **Service**.

Example:

```text
             Service
                │
                │ port 80
                ▼
              Pod
                │
                ▼
        Container :80
```

---

# 8. Environment Variables

Containers can receive configuration through environment variables.

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0
    env:
      - name: APP_ENV
        value: "production"

      - name: LOG_LEVEL
        value: "info"
```

Inside the container:

```bash
echo $APP_ENV
echo $LOG_LEVEL
```

Output:

```text
production
info
```

---

# 9. Environment Variables From ConfigMap

A container can consume configuration from a ConfigMap.

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0
    envFrom:
      - configMapRef:
          name: app-config
```

Specific values can also be referenced:

```yaml
env:
  - name: LOG_LEVEL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: LOG_LEVEL
```

---

# 10. Environment Variables From Secret

Sensitive configuration should normally be stored in Kubernetes Secrets.

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0
    env:
      - name: DB_PASSWORD
        valueFrom:
          secretKeyRef:
            name: database-secret
            key: password
```

This allows the application to access the password without hard-coding it in the container image.

---

# 11. Container Command

Kubernetes allows you to override the default command defined by the container image.

Example:

```yaml
containers:
  - name: app
    image: ubuntu:24.04
    command:
      - "/bin/bash"
      - "-c"
      - "echo Hello Kubernetes"
```

The `command` field corresponds conceptually to the container's entrypoint.

---

# 12. Container Arguments

Arguments can be specified using the `args` field.

Example:

```yaml
containers:
  - name: app
    image: ubuntu:24.04
    command:
      - "/bin/sh"
      - "-c"
    args:
      - "echo Hello Kubernetes"
```

A useful pattern is:

```yaml
command:
  - "/app/server"

args:
  - "--port=8080"
  - "--environment=production"
```

---

# 13. Command vs Args

The distinction is important.

| Kubernetes Field | Purpose                        |
| ---------------- | ------------------------------ |
| `command`        | Overrides the image ENTRYPOINT |
| `args`           | Overrides the image CMD        |

Example Dockerfile:

```dockerfile
ENTRYPOINT ["/app/server"]
CMD ["--port=8080"]
```

Kubernetes:

```yaml
command:
  - "/app/server"

args:
  - "--port=9090"
```

The resulting process is effectively:

```text
/app/server --port=9090
```

---

# 14. Container Working Directory

You can specify the working directory of a container.

Example:

```yaml
containers:
  - name: app
    image: myapp:1.0
    workingDir: /app
```

The application starts with:

```text
Working Directory: /app
```

---

# 15. Volume Mounts

Containers can mount Kubernetes volumes.

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0

    volumeMounts:
      - name: app-data
        mountPath: /data

volumes:
  - name: app-data
    emptyDir: {}
```

Inside the container:

```text
/data
```

is backed by the Kubernetes volume.

---

# 16. Read-Only Volume Mount

A volume can be mounted as read-only.

```yaml
volumeMounts:
  - name: config
    mountPath: /etc/app
    readOnly: true
```

This is useful for configuration files that the application should not modify.

---

# 17. Container Resource Requests and Limits

Kubernetes allows CPU and memory requirements to be specified for containers.

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0

    resources:
      requests:
        cpu: "250m"
        memory: "256Mi"

      limits:
        cpu: "500m"
        memory: "512Mi"
```

### Requests

A request represents the amount of resources Kubernetes should consider when scheduling the Pod.

```text
CPU Request    = 250m
Memory Request = 256Mi
```

### Limits

A limit places an upper bound on resource consumption.

```text
CPU Limit    = 500m
Memory Limit = 512Mi
```

---

# 18. CPU Units

Kubernetes CPU is commonly specified using:

```text
m
```

which means millicpu.

Examples:

```text
100m  = 0.1 CPU
250m  = 0.25 CPU
500m  = 0.5 CPU
1000m = 1 CPU
```

Example:

```yaml
resources:
  requests:
    cpu: "250m"
```

---

# 19. Memory Units

Memory can be specified using units such as:

```text
Mi
Gi
Ki
```

Examples:

```text
128Mi
256Mi
512Mi
1Gi
2Gi
```

Example:

```yaml
resources:
  limits:
    memory: "512Mi"
```

---

# 20. Container Security Context

Kubernetes provides security settings for containers.

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0

    securityContext:
      runAsNonRoot: true
      allowPrivilegeEscalation: false
```

Additional options include:

```yaml
securityContext:
  runAsUser: 1000
  runAsGroup: 1000
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
```

These settings can help reduce the security impact of a compromised container.

---

# 21. Running as Non-Root

Applications should preferably run as a non-root user where possible.

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0

    securityContext:
      runAsNonRoot: true
```

A more explicit configuration:

```yaml
securityContext:
  runAsUser: 1000
  runAsGroup: 1000
  runAsNonRoot: true
```

---

# 22. Read-Only Root Filesystem

A container's root filesystem can be made read-only.

```yaml
securityContext:
  readOnlyRootFilesystem: true
```

This can improve security by preventing applications from modifying the container filesystem.

Applications that need temporary write access can use an `emptyDir` volume:

```yaml
volumeMounts:
  - name: tmp
    mountPath: /tmp

volumes:
  - name: tmp
    emptyDir: {}
```

---

# 23. Container Lifecycle

A container generally goes through lifecycle states such as:

```text
Created
   │
   ▼
Running
   │
   ├──────────────┐
   │              │
   ▼              ▼
Succeeded       Failed
```

Kubernetes continuously monitors containers and takes actions based on the Pod's configuration.

For workloads managed by Deployments, failed Pods are generally recreated to maintain the desired state.

---

# 24. Container Restart Policy

A Pod has a `restartPolicy`.

Common values are:

```text
Always
OnFailure
Never
```

Example:

```yaml
spec:
  restartPolicy: Always
```

For Pods managed by Deployments, the normal restart policy is:

```text
Always
```

---

# 25. Container Lifecycle Hooks

Kubernetes supports lifecycle hooks.

The main hooks are:

* `postStart`
* `preStop`

Example:

```yaml
containers:
  - name: application
    image: myapp:1.0

    lifecycle:
      postStart:
        exec:
          command:
            - "/bin/sh"
            - "-c"
            - "echo Container started"

      preStop:
        exec:
          command:
            - "/bin/sh"
            - "-c"
            - "echo Container stopping"
```

### postStart

Runs after the container is created.

### preStop

Runs before the container is terminated.

---

# 26. Container Probes

Kubernetes provides health probes to determine application health.

The main probes are:

```text
Startup Probe
Readiness Probe
Liveness Probe
```

---

# 27. Liveness Probe

A **liveness probe** determines whether a container is still functioning.

Example:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
```

If the liveness probe repeatedly fails, Kubernetes can restart the container.

Use liveness probes for:

> "Is my application still alive?"

---

# 28. Readiness Probe

A **readiness probe** determines whether a container is ready to receive traffic.

Example:

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

If readiness fails, Kubernetes removes the Pod from the endpoints of applicable Services.

Use readiness probes for:

> "Can my application handle requests right now?"

---

# 29. Startup Probe

A **startup probe** is useful for applications that take a long time to start.

Example:

```yaml
startupProbe:
  httpGet:
    path: /health
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
```

This gives the application additional time to start before liveness and readiness checks become important.

---

# 30. Probe Comparison

| Probe     | Purpose                                           | Typical Action      |
| --------- | ------------------------------------------------- | ------------------- |
| Startup   | Determine whether application has started         | Delays other probes |
| Readiness | Determine whether application can receive traffic | Controls traffic    |
| Liveness  | Determine whether application is functioning      | Can trigger restart |

A common configuration is:

```text
          Container
              │
              ▼
       Startup Probe
              │
              ▼
     Application Started
          /       \
         /         \
        ▼           ▼
 Readiness       Liveness
    │                │
    ▼                ▼
Traffic         Restart if
Allowed?        unhealthy
```

---

# 31. Container Probe Types

Probes can use several mechanisms.

### HTTP GET

```yaml
httpGet:
  path: /health
  port: 8080
```

### TCP Socket

```yaml
tcpSocket:
  port: 8080
```

### Exec

```yaml
exec:
  command:
    - /bin/sh
    - -c
    - "test -f /tmp/healthy"
```

### gRPC

For applications exposing a gRPC health service, Kubernetes also supports gRPC probes.

---

# 32. Multiple Containers in a Pod

A Pod can contain multiple containers.

Example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:

    - name: application
      image: myapp:1.0

    - name: sidecar
      image: logging-agent:1.0
```

The containers share the Pod's:

* Network namespace
* IP address
* Ports
* Volumes when mounted

They can communicate using:

```text
localhost
```

---

# 33. Sidecar Container Pattern

A common multi-container pattern is the **sidecar**.

Example:

```text
                 Pod
        ┌──────────────────────┐
        │                      │
        │  Application         │
        │  Container           │
        │       │              │
        │       │ Logs         │
        │       ▼              │
        │  Sidecar             │
        │  Container           │
        │                      │
        └──────────────────────┘
```

The sidecar can perform supporting functions such as:

* Log processing
* Proxying
* Metrics collection
* Configuration synchronization
* Security functions

---

# 34. Container Networking

Containers inside the same Pod share the Pod's network namespace.

For example:

```text
Pod IP: 10.10.1.20

Container 1 ─────┐
                 │
                 ├── Shared Network Namespace
                 │
Container 2 ─────┘
```

If one container listens on:

```text
localhost:8080
```

another container in the same Pod can access it using:

```text
localhost:8080
```

Container ports must still avoid conflicts within the shared network namespace.

---

# 35. Container Filesystem

Containers have their own filesystem view based on their image and writable container layer.

Example:

```text
Container
│
├── /
├── /bin
├── /etc
├── /app
├── /var
└── /tmp
```

The container filesystem is generally ephemeral.

When the container is removed, changes made only to the container's writable layer can be lost.

For persistent data, use Kubernetes volumes or external storage.

---

# 36. Persistent Data

Do not depend on the container filesystem for important persistent data.

Bad pattern:

```text
Container
   │
   └── /data
       └── Important Database Data
```

Better:

```text
Container
   │
   └── /data
          │
          ▼
     Persistent Volume
          │
          ▼
     Persistent Storage
```

For databases and stateful applications, Kubernetes Persistent Volumes and StatefulSets are commonly used.

---

# 37. Container Image Pull Policy

Kubernetes provides the `imagePullPolicy` field.

Example:

```yaml
containers:
  - name: app
    image: myapp:1.0
    imagePullPolicy: IfNotPresent
```

Common values:

```text
Always
IfNotPresent
Never
```

### Always

Kubernetes attempts to pull the image whenever a container is launched, subject to image resolution and caching behavior.

### IfNotPresent

Pull the image only if it is not already present on the node.

### Never

Never attempt to pull the image.

---

# 38. Image Pull Secrets

Private container registries may require authentication.

Kubernetes can use an image pull secret.

Example:

```yaml
spec:
  imagePullSecrets:
    - name: registry-secret

  containers:
    - name: application
      image: registry.example.com/myteam/myapp:1.0
```

The Secret contains credentials required to pull the image.

---

# 39. Container Lifecycle and Termination

When Kubernetes needs to terminate a container, it normally gives the application an opportunity to shut down gracefully.

A simplified flow is:

```text
Termination Requested
        │
        ▼
   preStop Hook
        │
        ▼
 SIGTERM
        │
        ▼
 Graceful Shutdown
        │
        ▼
 SIGKILL if
 still running
```

Applications should handle termination signals properly.

This is particularly important for:

* HTTP services
* Databases
* Message consumers
* Long-running workers

---

# 40. Graceful Shutdown

Applications should stop accepting new work and finish or safely abandon existing work when receiving termination signals.

For example:

```text
SIGTERM
   │
   ├── Stop accepting new requests
   ├── Finish current requests
   ├── Close database connections
   ├── Flush logs
   └── Exit
```

This reduces the possibility of:

* Dropped requests
* Corrupted data
* Incomplete transactions
* Lost messages

---

# 41. Container Security Best Practices

### Run as Non-Root

```yaml
securityContext:
  runAsNonRoot: true
```

### Disable Privilege Escalation

```yaml
securityContext:
  allowPrivilegeEscalation: false
```

### Use Read-Only Root Filesystem

```yaml
securityContext:
  readOnlyRootFilesystem: true
```

### Drop Linux Capabilities

Where appropriate:

```yaml
securityContext:
  capabilities:
    drop:
      - ALL
```

### Use Trusted Images

Use:

* Minimal images
* Official images where appropriate
* Scanned images
* Pinned versions
* Approved enterprise registries

Avoid relying on:

```text
latest
```

for production deployments when deterministic versioning is important.

Prefer:

```text
myapp:1.4.2
```

or an immutable image digest.

---

# 42. Container Logging

Applications running in containers should generally write logs to:

```text
stdout
stderr
```

Example:

```bash
echo "Application started"
echo "Error occurred" >&2
```

Kubernetes can then collect the container logs.

View logs:

```bash
kubectl logs <pod-name>
```

For a specific container:

```bash
kubectl logs <pod-name> -c <container-name>
```

Follow logs:

```bash
kubectl logs -f <pod-name>
```

---

# 43. Container Monitoring

Container resource usage can be inspected with:

```bash
kubectl top pod
```

For a specific namespace:

```bash
kubectl top pods -n production
```

Depending on the Kubernetes environment, additional monitoring systems may provide:

* CPU utilization
* Memory utilization
* Network traffic
* Restart counts
* Application metrics
* Container health

---

# 44. Debugging Containers

### Check Pod Status

```bash
kubectl get pods
```

### Get Detailed Information

```bash
kubectl describe pod <pod-name>
```

### View Logs

```bash
kubectl logs <pod-name>
```

### View Logs From Previous Container Instance

If the container restarted:

```bash
kubectl logs <pod-name> --previous
```

### Execute a Command

```bash
kubectl exec -it <pod-name> -- /bin/sh
```

For multiple containers:

```bash
kubectl exec -it <pod-name> -c <container-name> -- /bin/sh
```

---

# 45. Common Container States

You may see statuses such as:

```text
Waiting
Running
Terminated
```

Example:

```bash
kubectl get pod <pod-name> -o wide
```

Detailed information:

```bash
kubectl describe pod <pod-name>
```

can reveal:

* Image errors
* Startup failures
* Probe failures
* Resource problems
* Scheduling issues
* Volume problems
* Permission errors

---

# 46. Common Container Problems

## ImagePullBackOff

Example:

```text
ImagePullBackOff
```

Possible causes:

* Image does not exist
* Incorrect image name
* Incorrect tag
* Private registry authentication failure
* Registry unavailable

Check:

```bash
kubectl describe pod <pod-name>
```

---

## CrashLoopBackOff

Example:

```text
CrashLoopBackOff
```

This means the container is repeatedly starting and failing.

Check:

```bash
kubectl logs <pod-name>
```

Then:

```bash
kubectl logs <pod-name> --previous
```

Also inspect:

```bash
kubectl describe pod <pod-name>
```

Common causes include:

* Application configuration error
* Invalid command
* Missing environment variable
* Missing file
* Application crash
* Failed dependency
* Incorrect permissions
* Failed health checks

---

# 47. OOMKilled

A container may be terminated because it exceeded its memory limit.

You may see:

```text
Reason: OOMKilled
```

Check:

```bash
kubectl describe pod <pod-name>
```

Review:

```yaml
resources:
  requests:
    memory: "256Mi"

  limits:
    memory: "512Mi"
```

Possible solutions:

* Investigate memory leaks
* Optimize application memory usage
* Adjust resource limits
* Adjust resource requests
* Review workload behavior

---

# 48. Container Exit Codes

When a container terminates, Kubernetes can report an exit code.

Example:

```bash
kubectl describe pod <pod-name>
```

You may see:

```text
Exit Code: 1
```

Exit codes can help identify application failures.

A common convention is:

```text
0       Successful completion
Non-zero Failure
```

The exact meaning of a non-zero code depends on the application.

---

# 49. Container Security and Privileged Mode

Containers can be configured with elevated privileges.

Example:

```yaml
securityContext:
  privileged: true
```

This should generally be avoided unless there is a specific, well-understood requirement.

Privileged containers have significantly greater access to the underlying host.

Use the principle of least privilege.

---

# 50. Complete Pod Example

The following example demonstrates several important container concepts:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: application-pod

spec:
  containers:
    - name: application
      image: myapp:1.0.0

      ports:
        - containerPort: 8080

      env:
        - name: APP_ENV
          value: "production"

      resources:
        requests:
          cpu: "250m"
          memory: "256Mi"

        limits:
          cpu: "500m"
          memory: "512Mi"

      securityContext:
        runAsNonRoot: true
        allowPrivilegeEscalation: false

      readinessProbe:
        httpGet:
          path: /ready
          port: 8080
        periodSeconds: 10

      livenessProbe:
        httpGet:
          path: /health
          port: 8080
        periodSeconds: 10

      volumeMounts:
        - name: application-data
          mountPath: /data

  volumes:
    - name: application-data
      emptyDir: {}
```

---

# 51. Container in a Deployment

In real-world Kubernetes environments, containers are usually managed through higher-level workload resources.

Example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp

spec:
  replicas: 3

  selector:
    matchLabels:
      app: webapp

  template:
    metadata:
      labels:
        app: webapp

    spec:
      containers:
        - name: webapp
          image: nginx:1.27

          ports:
            - containerPort: 80
```

Architecture:

```text
Deployment
    │
    ▼
ReplicaSet
    │
    ├──────────┬──────────┐
    ▼          ▼          ▼
   Pod        Pod        Pod
    │          │          │
    ▼          ▼          ▼
Container   Container   Container
```

---

# 52. Container vs Virtual Machine

Containers and virtual machines provide different levels of isolation.

```text
Virtual Machines

┌─────────────────────────────┐
│ VM                          │
│ ┌─────────────┐             │
│ │ Application  │             │
│ ├─────────────┤             │
│ │ Guest OS     │             │
│ └─────────────┘             │
└─────────────────────────────┘


Containers

┌─────────────────────────────┐
│ Container                   │
│ ┌─────────────┐             │
│ │ Application  │             │
│ └─────────────┘             │
│ Shared Host Kernel          │
└─────────────────────────────┘
```

Containers typically provide:

* Faster startup
* Lower overhead
* Efficient resource utilization
* Application portability

Virtual machines generally provide:

* Stronger isolation boundary
* Complete guest operating system
* Higher resource overhead

---

# 53. Container Best Practices

## Use Small Images

Smaller images generally mean:

* Faster downloads
* Faster startup
* Smaller attack surface
* Easier scanning

---

## Pin Image Versions

Prefer:

```yaml
image: myapp:1.2.3
```

over:

```yaml
image: myapp:latest
```

For highly controlled deployments, consider immutable image digests.

---

## Run as Non-Root

```yaml
securityContext:
  runAsNonRoot: true
```

---

## Define Resource Requests and Limits

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"

  limits:
    cpu: "500m"
    memory: "512Mi"
```

---

## Configure Health Probes

Use:

* Startup probe for slow-starting applications
* Readiness probe for traffic readiness
* Liveness probe for application health

---

## Externalize Configuration

Use:

```text
ConfigMap → Non-sensitive configuration
Secret    → Sensitive configuration
```

Avoid hard-coding environment-specific values into images.

---

## Don't Store Persistent Data in the Container Layer

Use:

```text
PersistentVolume
External Database
Object Storage
Managed Storage
```

where appropriate.

---

# 54. Useful kubectl Commands

| Command                                            | Purpose                            |
| -------------------------------------------------- | ---------------------------------- |
| `kubectl get pods`                                 | List Pods                          |
| `kubectl describe pod <pod>`                       | Detailed Pod/container information |
| `kubectl logs <pod>`                               | View container logs                |
| `kubectl logs -f <pod>`                            | Follow logs                        |
| `kubectl logs <pod> --previous`                    | View logs from previous container  |
| `kubectl logs <pod> -c <container>`                | View specific container logs       |
| `kubectl exec -it <pod> -- /bin/sh`                | Open a shell                       |
| `kubectl exec -it <pod> -c <container> -- /bin/sh` | Shell into specific container      |
| `kubectl top pod`                                  | View Pod resource usage            |
| `kubectl get pod <pod> -o yaml`                    | View Pod definition                |
| `kubectl delete pod <pod>`                         | Delete Pod                         |
| `kubectl get events`                               | View cluster events                |

---

# 55. Troubleshooting Workflow

When a container is not working correctly, use this workflow:

```text
1. Check Pod status
        │
        ▼
2. kubectl describe pod
        │
        ▼
3. Check container logs
        │
        ▼
4. Check previous logs
        │
        ▼
5. Check events
        │
        ▼
6. Check image
        │
        ▼
7. Check environment variables
        │
        ▼
8. Check volumes
        │
        ▼
9. Check probes
        │
        ▼
10. Check CPU / Memory
```

Useful commands:

```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl logs <pod-name> --previous
kubectl get events --sort-by=.lastTimestamp
kubectl top pod <pod-name>
```

---

# 56. Container Architecture Summary

```text
                    Kubernetes Cluster
                           │
                           ▼
                         Node
                           │
                           ▼
                          Pod
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
          Application             Sidecar
           Container             Container
                 │                   │
                 └─────────┬─────────┘
                           │
                    Shared Network
                    Shared Volumes
```

Kubernetes manages the Pod, while the container runtime is responsible for running the actual containers.

---

# 57. Key Concepts to Remember

```text
Container
   │
   ├── Runs application
   ├── Created from image
   ├── Lives inside a Pod
   ├── Can expose ports
   ├── Can consume ConfigMaps
   ├── Can consume Secrets
   ├── Can mount volumes
   ├── Has resource requests/limits
   ├── Can have health probes
   ├── Can have security settings
   └── Produces logs
```

---

# 58. Interview Questions

### What is a container in Kubernetes?

A container is a runnable application process packaged with its dependencies and executed inside a Kubernetes Pod.

### Can a Pod contain multiple containers?

Yes. A Pod can contain one or multiple containers. Containers in the same Pod share the Pod's network namespace and can share mounted volumes.

### What is the difference between a Pod and a container?

A container is the application execution unit, while a Pod is Kubernetes' smallest deployable unit that provides the environment in which one or more containers run.

### What is a container image?

A container image is a packaged, immutable artifact containing an application, its runtime, libraries, and required filesystem content.

### What is `containerPort`?

`containerPort` documents the port on which a container is expected to listen. It does not by itself expose the application outside the Pod.

### What is `command`?

`command` overrides the container image's default entrypoint.

### What is `args`?

`args` overrides the default arguments/CMD supplied by the container image.

### What is a readiness probe?

A readiness probe determines whether a container is ready to receive traffic.

### What is a liveness probe?

A liveness probe determines whether a container is functioning properly and can cause Kubernetes to restart it when it repeatedly fails.

### What is a startup probe?

A startup probe determines whether a slow-starting application has successfully started before liveness and readiness probing takes over.

### What is `CrashLoopBackOff`?

It indicates that a container is repeatedly starting and terminating, and Kubernetes is backing off between restart attempts.

### What is `ImagePullBackOff`?

It indicates that Kubernetes is unable to pull the required container image and is retrying with increasing delays.

### Why should containers not normally run as root?

Running as non-root reduces the potential impact of application compromise and follows the principle of least privilege.

### Where should persistent application data be stored?

Persistent data should normally be stored using Kubernetes persistent storage or external storage rather than the container's ephemeral writable layer.

---

# 59. Quick Reference YAML

A production-oriented container specification commonly looks like:

```yaml
containers:
  - name: application
    image: registry.example.com/team/application:1.0.0

    ports:
      - containerPort: 8080

    envFrom:
      - configMapRef:
          name: application-config

    resources:
      requests:
        cpu: "250m"
        memory: "256Mi"

      limits:
        cpu: "500m"
        memory: "512Mi"

    securityContext:
      runAsNonRoot: true
      allowPrivilegeEscalation: false

    startupProbe:
      httpGet:
        path: /health
        port: 8080

    readinessProbe:
      httpGet:
        path: /ready
        port: 8080

    livenessProbe:
      httpGet:
        path: /health
        port: 8080

    volumeMounts:
      - name: app-data
        mountPath: /data
```

---

# 60. Summary

A Kubernetes **container** is the runtime unit that executes an application inside a Pod.

The most important concepts are:

* Containers run inside Pods.
* Containers are created from container images.
* Pods can contain one or multiple containers.
* Containers can consume ConfigMaps and Secrets.
* Containers can mount Kubernetes volumes.
* Resource requests and limits control resource scheduling and consumption.
* Readiness, liveness, and startup probes help Kubernetes manage application health.
* Security contexts help enforce least privilege.
* Container filesystems are generally ephemeral.
* Important persistent data should use persistent storage.
* Applications should log to standard output/error.
* Production containers should use trusted, versioned images.
* Containers should preferably run as non-root.
* Proper graceful shutdown handling is important for reliable workloads.

> **Core Kubernetes principle:** Package the application in a reliable container image, run it inside a Pod, externalize configuration, define resource and health requirements, apply appropriate security controls, and let Kubernetes manage the desired state of the workload.
