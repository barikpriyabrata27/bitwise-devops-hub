# Containers

> **A container is an isolated process environment created from a container image. It packages an application's user-space dependencies while sharing the host operating system kernel.**

This document focuses specifically on **containers**: what they are, how they work, how they are created and managed, how processes and filesystems behave inside them, how networking and storage are attached, and how to operate them securely.

For the broader Docker platform, see [`docker-and-containers.md`](docker-and-containers.md).

---

# 1. What Is a Container?

A container is a running or stopped instance of a container image.

Conceptually:

```text
Container Image
      │
      ▼
  Container
      │
      ▼
Application Process
```

Example:

```bash
docker run nginx
```

This creates a container from the `nginx` image and starts its main process.

---

# 2. Container Mental Model

Remember:

```text
Image
  │
  ▼
Container
  │
  ├── Process
  ├── Filesystem
  ├── Network
  ├── Environment
  ├── Resource Limits
  └── Security Context
```

A container is therefore more than a filesystem.

It is an execution environment for one or more processes.

---

# 3. Container vs Image

| Image | Container |
|---|---|
| Packaged artifact | Runtime instance |
| Read-only image layers | Image layers + writable runtime layer |
| Stored locally or in registry | Managed by container runtime |
| Created by build | Created from image |
| Can create many containers | Represents one container instance |

Mental model:

```text
Image
 │
 ├── Container A
 ├── Container B
 └── Container C
```

All three can be created from the same image.

---

# 4. Container vs Virtual Machine

A container normally does not contain a complete guest operating system.

```text
Virtual Machine:

Host
 │
 └── Hypervisor
       │
       └── VM
            ├── Guest OS
            └── Application
```

Container:

```text
Host OS
 │
 └── Container
      └── Application Process
```

The container uses isolation mechanisms provided by the host kernel.

---

# 5. Container Lifecycle

A simplified lifecycle:

```text
Created
   │
   ▼
Running
   │
   ├── Paused
   │      │
   │      ▼
   │    Running
   │
   ▼
Stopped
   │
   ▼
Removed
```

Common commands:

```bash
docker create
docker start
docker stop
docker restart
docker pause
docker unpause
docker rm
```

---

# 6. `docker create`

`docker create` creates the container without starting its main process.

Example:

```bash
docker create --name web nginx
```

Conceptually:

```text
Image
  │
  ▼
Container Created
  │
  ▼
Not Running
```

Start it separately:

```bash
docker start web
```

---

# 7. `docker run`

`docker run` is commonly used to create and start a container.

Example:

```bash
docker run --name web nginx
```

Conceptually:

```text
Image
  │
  ▼
Create Container
  │
  ▼
Configure Container
  │
  ▼
Start Main Process
  │
  ▼
Running Container
```

---

# 8. Detached vs Foreground Mode

Foreground:

```bash
docker run nginx
```

The command attaches the terminal to the container process.

Detached:

```bash
docker run -d nginx
```

The container runs in the background.

Check it with:

```bash
docker ps
```

---

# 9. Container Names

A container can have a human-readable name.

```bash
docker run --name web nginx
```

Then:

```bash
docker logs web
docker inspect web
docker stop web
docker rm web
```

Without a supplied name, Docker can generate a name automatically.

---

# 10. Container ID

Every container has an identifier.

Example:

```text
8f3a1c...
```

Commands can use either:

```text
Container Name
```

or:

```text
Container ID
```

Example:

```bash
docker stop web
```

or:

```bash
docker stop 8f3a1c
```

---

# 11. Main Container Process

A container normally remains alive while its main process is running.

Example:

```bash
docker run ubuntu
```

If the default command exits immediately:

```text
Container
   │
   ▼
Main Process Starts
   │
   ▼
Process Exits
   │
   ▼
Container Stops
```

This is why an interactive shell or long-running application is commonly used when starting a container.

---

# 12. PID 1

Inside a container, the main process normally appears as PID 1.

Example:

```text
Container
│
└── PID 1
     │
     └── Application
```

PID 1 has special responsibilities around:

- Signal handling
- Child processes
- Process cleanup
- Container shutdown

Applications should be designed to handle termination signals correctly.

---

# 13. Signal Handling

When stopping a container:

```bash
docker stop myapp
```

Docker normally requests graceful termination before forcefully killing the process if it does not exit within the configured grace period.

Conceptually:

```text
docker stop
    │
    ▼
Termination Signal
    │
    ▼
Application Cleanup
    │
    ▼
Process Exit
```

Applications should handle signals such as `SIGTERM` appropriately.

---

# 14. Graceful Shutdown

A good containerized application should:

```text
Receive Shutdown
      │
      ▼
Stop Accepting New Work
      │
      ▼
Finish Existing Work
      │
      ▼
Close Connections
      │
      ▼
Flush Required State
      │
      ▼
Exit
```

This is particularly important in orchestrated environments.

---

# 15. Container Restart

Example:

```bash
docker restart myapp
```

Conceptually:

```text
Running
   │
   ▼
Stop
   │
   ▼
Start
   │
   ▼
Running
```

Restart policies can automate this behavior.

---

# 16. Restart Policies

Examples:

```bash
docker run --restart no myapp
docker run --restart on-failure myapp
docker run --restart always myapp
docker run --restart unless-stopped myapp
```

The policy determines when Docker attempts to restart the container.

In Kubernetes, workload recovery is normally handled by Kubernetes rather than Docker restart policies.

---

# 17. Container Filesystem

A container's filesystem can be thought of as:

```text
Container
│
├── Image Layers
│
├── Writable Container Layer
│
└── Mounted Storage
      ├── Volume
      └── Bind Mount
```

The image layers are read-only.

The container can have a writable layer for runtime changes.

---

# 18. Writable Container Layer

Suppose the image contains:

```text
/app/config.json
```

A process changes it inside the container.

The change is normally stored in the container's writable layer rather than changing the original image.

Conceptually:

```text
Image
  │
  └── config.json
        │
        ▼
Container Writable Layer
        │
        └── Modified config.json
```

---

# 19. Ephemeral Container Storage

If data exists only in the writable container layer:

```text
Container
   │
   ▼
Data
   │
   ▼
Container Removed
   │
   ▼
Data Lost
```

Therefore, important persistent data should not normally live only in the container writable layer.

---

# 20. Volumes

For persistent data:

```text
Container
    │
    ▼
Volume
    │
    ▼
Persistent Storage
```

Example:

```bash
docker volume create app-data

docker run \
  --mount source=app-data,target=/data \
  myapp
```

Volumes are especially useful for databases and other stateful workloads.

---

# 21. Bind Mounts

A bind mount maps a host path into a container.

Example:

```bash
docker run \
  --mount type=bind,source="$(pwd)",target=/app \
  myapp
```

Conceptually:

```text
Host Directory
      │
      ▼
Bind Mount
      │
      ▼
Container Directory
```

Bind mounts are common in development.

---

# 22. Temporary Filesystems

A container can use temporary in-memory storage where appropriate.

Conceptually:

```text
Container
   │
   ▼
tmpfs
   │
   ▼
Memory-backed Temporary Data
```

Temporary storage is useful for data that should not persist beyond the container lifecycle.

---

# 23. Container Environment Variables

Environment variables provide runtime configuration.

Example:

```bash
docker run \
  -e APP_ENV=production \
  -e PORT=8080 \
  myapp
```

Inside the container:

```text
APP_ENV=production
PORT=8080
```

Environment variables are useful for configuration, but sensitive values require careful secret-management practices.

---

# 24. Environment Files

Docker can load environment variables from a file.

Example:

```text
APP_ENV=production
LOG_LEVEL=info
```

Then:

```bash
docker run --env-file .env myapp
```

Do not commit production secrets into `.env` files.

---

# 25. Container Networking

Each container can have its own network namespace.

Conceptually:

```text
Host
 │
 ├── Container A
 │      └── Network Namespace
 │
 └── Container B
        └── Network Namespace
```

Containers can communicate through Docker networks.

---

# 26. Container IP Addresses

A container can receive an IP address on a Docker network.

Example:

```text
Docker Network
      │
      ├── web → 172.x.x.x
      └── api → 172.x.x.x
```

Avoid hardcoding container IP addresses when Docker's DNS/service naming can be used instead.

---

# 27. Container-to-Container Communication

On a user-defined network:

```text
web
 │
 ▼
Docker Network
 │
 ▼
api
```

The application can typically use:

```text
api:8080
```

rather than:

```text
172.x.x.x:8080
```

This makes the deployment more resilient to container replacement.

---

# 28. Port Publishing

Example:

```bash
docker run -p 8080:80 nginx
```

Conceptually:

```text
Host
8080
 │
 ▼
Docker Port Mapping
 │
 ▼
Container
80
```

The application still listens on port 80 inside the container.

---

# 29. Container Port vs Host Port

```text
Host Port
   │
   ▼
8080
   │
   ▼
Container Port
   │
   ▼
80
```

Command:

```bash
-p 8080:80
```

Format:

```text
host-port:container-port
```

---

# 30. Binding to a Specific Host Interface

Port publishing can be restricted to a specific host address.

Conceptually:

```text
127.0.0.1:8080
       │
       ▼
Container:80
```

This can prevent exposure on every host network interface.

Use carefully according to the required access model.

---

# 31. Container DNS

Docker networks can provide DNS-based service discovery.

Example:

```text
frontend
   │
   │ DNS: backend
   ▼
backend
```

This is preferable to relying on dynamic container IP addresses.

---

# 32. Container Names vs Service Names

In simple Docker setups, container names can be used for communication on appropriate user-defined networks.

In Docker Compose, service names are commonly used:

```yaml
services:
  api:
    image: my-api

  web:
    image: my-web
```

The web service can typically reach:

```text
http://api:8080
```

---

# 33. Container Network Modes

Common Docker network modes include:

```text
bridge
host
none
```

Other modes and user-defined networks are available depending on the environment.

---

# 34. Bridge Network

The bridge network is commonly used for standalone containers.

Conceptually:

```text
Host
 │
 ▼
Docker Bridge
 │
 ├── Container A
 └── Container B
```

User-defined bridge networks provide useful DNS-based communication between containers.

---

# 35. Host Network

With host networking, the container uses the host's network namespace.

Conceptually:

```text
Host Network
     │
     └── Container
```

This reduces network isolation.

Use it only when there is a clear requirement.

---

# 36. None Network

A container can be started without normal network connectivity:

```bash
docker run --network none myapp
```

Conceptually:

```text
Container
   │
   └── No Normal Network
```

This can be useful for workloads that do not need networking.

---

# 37. Container Resource Limits

Containers can have resource constraints.

Example:

```bash
docker run \
  --cpus=1 \
  --memory=512m \
  myapp
```

Conceptually:

```text
Container
│
├── CPU Limit
└── Memory Limit
```

Resource limits help protect the host and neighboring workloads.

---

# 38. CPU Limits

Example:

```bash
docker run --cpus=2 myapp
```

This constrains CPU consumption according to Docker's resource-control configuration.

CPU shares, quotas, and related controls provide additional mechanisms.

---

# 39. Memory Limits

Example:

```bash
docker run --memory=512m myapp
```

A memory limit can reduce the risk of a container consuming excessive host memory.

Applications should still be configured with appropriate runtime memory settings.

---

# 40. PIDs Limit

Containers can also be limited in the number of processes they create.

Conceptually:

```text
Container
   │
   ▼
PID Limit
   │
   ▼
Maximum Processes
```

This can help mitigate process-exhaustion scenarios.

---

# 41. Container Isolation

Container isolation combines multiple mechanisms:

```text
Namespaces
+
cgroups
+
Capabilities
+
Seccomp
+
Security Profiles
+
Filesystem Isolation
```

No single mechanism provides complete security.

---

# 42. Linux Namespaces

Common namespaces include:

```text
PID
Network
Mount
IPC
UTS
User
Cgroup
```

They isolate different views of system resources.

---

# 43. PID Namespace

A PID namespace gives the container its own process numbering.

Conceptually:

```text
Host
│
├── Host PID 1000
│
└── Container
     └── PID 1
```

The same process can have different PID values depending on the namespace.

---

# 44. Network Namespace

A network namespace isolates:

```text
Network Interfaces
Routing Tables
Ports
Network Addresses
```

Conceptually:

```text
Container
 │
 └── Network Namespace
       ├── eth0
       ├── routes
       └── ports
```

---

# 45. Mount Namespace

Mount namespaces provide an isolated view of filesystem mounts.

This contributes to the container filesystem model.

---

# 46. User Namespace

User namespaces can map identities between container and host.

Conceptually:

```text
Container UID
     │
     ▼
User Namespace
     │
     ▼
Host UID
```

This can strengthen isolation when configured appropriately.

---

# 47. cgroups

cgroups control and account for resource usage.

Conceptually:

```text
Host
│
├── Container A
│    ├── CPU
│    └── Memory
│
└── Container B
     ├── CPU
     └── Memory
```

This prevents a workload from freely consuming all available resources when appropriate limits are configured.

---

# 48. Linux Capabilities

Traditional root privileges are divided into capabilities.

Containers can drop unnecessary capabilities.

Conceptually:

```text
Container
   │
   ▼
Capabilities
   │
   ├── Required
   └── Dropped
```

Least privilege is the preferred approach.

---

# 49. Seccomp

**Seccomp** can restrict system calls available to a container process.

Conceptually:

```text
Application
    │
    ▼
System Call
    │
    ▼
Seccomp Policy
    │
    ├── Allowed
    └── Blocked
```

Docker can use a default seccomp profile, and organizations can apply customized profiles when necessary.

---

# 50. AppArmor and SELinux

Linux security frameworks can provide additional mandatory access controls.

Examples:

```text
AppArmor
SELinux
```

Conceptually:

```text
Container
   │
   ▼
Security Profile
   │
   ▼
Allowed Resource Access
```

The exact mechanism depends on the host operating system and configuration.

---

# 51. Running as Non-Root

A container should normally run the application as a non-root user when possible.

Dockerfile example:

```dockerfile
USER 10001
```

Conceptually:

```text
Container
   │
   ▼
Non-Root Process
```

This reduces the impact of some application compromises.

---

# 52. Privileged Containers

Avoid:

```bash
docker run --privileged myapp
```

unless there is a well-understood requirement.

Privileged mode can substantially increase access to host resources.

---

# 53. Read-Only Root Filesystem

Example:

```bash
docker run --read-only myapp
```

Conceptually:

```text
Root Filesystem
      │
      ▼
Read Only
```

Temporary writable locations can be provided separately when needed.

---

# 54. Container Capabilities and Privilege

Security principle:

```text
Required Privileges
       │
       ▼
Minimum Capabilities
       │
       ▼
Reduced Attack Surface
```

Avoid granting broad privileges simply because an application fails under restricted settings.

Investigate the actual requirement instead.

---

# 55. Container Security Context

A container's security posture can include:

```text
User
Capabilities
Seccomp
AppArmor / SELinux
Filesystem Permissions
Network Access
Resource Limits
Read-Only Root Filesystem
```

These controls should be designed together.

---

# 56. Container Health Checks

A container can define or use a health check.

Example:

```dockerfile
HEALTHCHECK \
  CMD curl --fail http://localhost:8080/health || exit 1
```

Conceptually:

```text
Container
   │
   ▼
Health Check
   │
   ├── Healthy
   └── Unhealthy
```

Health status is useful operationally, but a health check does not itself restart a container.

Restart/orchestration policies determine recovery behavior.

---

# 57. Container Logs

Use:

```bash
docker logs myapp
```

A common pattern is:

```text
Application
   │
   ├── stdout
   └── stderr
        │
        ▼
Container Runtime
        │
        ▼
Log Collection
```

Avoid putting credentials into logs.

---

# 58. Container Statistics

Use:

```bash
docker stats
```

This can provide runtime resource information such as:

```text
CPU
Memory
Network I/O
Block I/O
PIDs
```

Useful for diagnosing resource consumption.

---

# 59. Container Inspection

Use:

```bash
docker inspect myapp
```

Useful information can include:

```text
Image
State
Network
Mounts
Environment
Ports
Runtime Configuration
```

Inspect output carefully because environment variables can contain sensitive values.

---

# 60. Executing Commands Inside Containers

Example:

```bash
docker exec -it myapp sh
```

This creates an additional process inside the running container.

Conceptually:

```text
Running Container
       │
       ▼
docker exec
       │
       ▼
Additional Process
```

This is useful for troubleshooting.

It should not be the normal mechanism for making production changes.

---

# 61. `docker exec` vs `docker attach`

`docker exec` starts a new process.

```bash
docker exec -it myapp sh
```

`docker attach` connects to the existing main process's standard streams.

Conceptually:

```text
exec
 └── New Process

attach
 └── Existing Main Process
```

For troubleshooting, `exec` is generally safer and more flexible.

---

# 62. Container Process Inspection

Commands such as:

```bash
docker top myapp
```

can show processes running inside the container.

Conceptually:

```text
Container
   │
   ├── PID 1
   ├── Worker
   └── Helper
```

Ideally, container processes should be understood and intentionally designed.

---

# 63. One Process per Container

A common recommendation is:

> **Prefer one primary concern or service per container.**

Example:

```text
web-container
   └── Web Server

api-container
   └── API

worker-container
   └── Worker
```

This is a design principle, not an absolute rule.

Some workloads intentionally use multiple processes or sidecar/helper patterns.

---

# 64. Containerized Application Design

A good containerized application often follows:

```text
Stateless Process
      │
      ├── External Configuration
      ├── External Secrets
      ├── External Persistent Storage
      └── External Observability
```

This allows the container to remain replaceable.

---

# 65. Immutable Container Pattern

Avoid:

```text
Running Container
     │
     ├── apt install
     ├── edit config
     └── manual patch
```

Prefer:

```text
Source
  │
  ▼
Dockerfile
  │
  ▼
New Image
  │
  ▼
New Container
```

This makes deployments repeatable.

---

# 66. Container Identity

Containers have:

```text
Name
ID
Image Reference
Labels
Network Identity
Filesystem
Runtime State
```

Container IP addresses may change when containers are recreated.

Therefore, applications should use stable service discovery mechanisms rather than hardcoded container IPs.

---

# 67. Labels

Docker supports labels for metadata.

Example:

```bash
docker run \
  --label app=payments \
  --label environment=production \
  myapp
```

Labels can help with:

- Organization
- Automation
- Filtering
- Operations
- Inventory

---

# 68. Container Metadata

Useful metadata includes:

```text
Application
Environment
Version
Owner
Team
Build ID
Commit SHA
```

Example:

```text
com.example.app=payments
com.example.version=1.4.2
com.example.commit=abc123
```

Metadata improves traceability.

---

# 69. Container and Image Tags

A container can be created from:

```text
myapp:1.4.2
```

The image reference identifies the image at creation time.

For stronger deployment traceability, record the image digest as well.

---

# 70. Image Digest and Container Identity

Example:

```text
myapp:1.4.2
     │
     ▼
sha256:abcdef...
```

The digest identifies image content.

A production system can record:

```text
Application
Version
Image Digest
Commit SHA
Build ID
```

This improves auditability.

---

# 71. Container Runtime vs Application Runtime

Do not confuse:

```text
Container Runtime
```

with:

```text
Application Runtime
```

Example:

```text
Container Runtime
 └── runc / compatible runtime

Application Runtime
 └── JVM
```

For a Java application:

```text
Linux Kernel
   │
   ▼
Container Runtime
   │
   ▼
Java Process
   │
   ▼
JVM
   │
   ▼
Application
```

---

# 72. Java Container Example

Suppose:

```text
app.jar
```

is placed inside an image.

The container might run:

```bash
java -jar app.jar
```

Conceptually:

```text
Container
   │
   ▼
PID 1
   │
   ▼
JVM
   │
   ▼
app.jar
```

The JAR is application content; the JVM is the application runtime.

---

# 73. Container Startup

A typical Java container:

```text
docker run
    │
    ▼
Container Created
    │
    ▼
JVM Starts
    │
    ▼
Spring / Application Starts
    │
    ▼
Port 8080 Listening
    │
    ▼
Ready
```

Startup failures should be investigated through container state and logs.

---

# 74. Container Exit Codes

When the main process exits, the container records an exit status.

Examples:

```text
0   → Successful exit
non-zero → Error / failure
```

Check:

```bash
docker ps -a
docker inspect myapp
```

Exit codes are useful for troubleshooting.

---

# 75. OOMKilled

If a container exceeds its memory limit, the process may be terminated due to an out-of-memory condition.

Conceptually:

```text
Application
   │
   ▼
Memory Usage
   │
   ▼
Limit Exceeded
   │
   ▼
OOM Kill
   │
   ▼
Container Stops / Restarts
```

Check container state and runtime events when diagnosing this.

---

# 76. Container Events

Docker can expose runtime events.

Example:

```bash
docker events
```

This can help diagnose:

```text
Container Created
Container Started
Container Stopped
Container Died
Network Connected
Volume Mounted
```

---

# 77. Container Networking Troubleshooting

Use:

```bash
docker network ls
docker network inspect <network>
docker inspect <container>
```

Check:

```text
Network Membership
DNS
IP Address
Published Ports
Application Listening Address
```

---

# 78. Container Storage Troubleshooting

Check mounts:

```bash
docker inspect <container>
```

Verify:

```text
Volume exists
Mount target is correct
Permissions are correct
Application uses expected path
```

A container may appear healthy while writing data to the wrong location.

---

# 79. Permission Problems

Common issue:

```text
Host Directory
      │
      ▼
Bind Mount
      │
      ▼
Container User
      │
      ▼
Permission Denied
```

The container's user identity and host filesystem permissions must be compatible.

Prefer explicit user and ownership management rather than running as root simply to bypass permissions.

---

# 80. Container Environment Troubleshooting

Inspect:

```bash
docker inspect myapp
```

or execute:

```bash
docker exec myapp env
```

Check:

```text
Environment Variables
Configuration Paths
Service URLs
Ports
Runtime Flags
```

Be careful not to expose secrets while collecting diagnostics.

---

# 81. Container Dependency Troubleshooting

If the application cannot reach a dependency:

```text
Application
   │
   ▼
DNS
   │
   ▼
Network
   │
   ▼
Port
   │
   ▼
Dependency
```

Check each layer independently.

---

# 82. Container Restart Loop

A container repeatedly starting and stopping may indicate:

```text
Application Crash
Configuration Error
Missing Dependency
Invalid Secret
Port Conflict
Memory Limit
Permission Problem
Health / Orchestration Issue
```

Investigate:

```bash
docker ps -a
docker logs myapp
docker inspect myapp
```

---

# 83. Container Resource Monitoring

Useful signals:

```text
CPU
Memory
Network
Disk I/O
PIDs
Restart Count
Exit Code
```

A healthy operational model combines:

```text
Metrics
+
Logs
+
Events
+
Traces
```

---

# 84. Container Observability

A production container should integrate with observability systems.

```text
Container
   │
   ├── Logs
   ├── Metrics
   └── Traces
        │
        ▼
Observability Platform
```

The container itself should not be the permanent storage location for operational telemetry.

---

# 85. Container Security Scanning

Containers should be scanned before deployment.

Typical pipeline:

```text
Dockerfile
   │
   ▼
Build
   │
   ▼
Image
   │
   ▼
Image Scanner
   │
   ├── OS Packages
   ├── Application Dependencies
   ├── Secrets
   └── Misconfiguration
   │
   ▼
Security Gate
```

Common tools include:

```text
Trivy
Grype
Docker Scout
Clair
JFrog Xray
```

---

# 86. Container Vulnerability Remediation

If an image contains a vulnerable package:

```text
Image
  │
  ▼
Vulnerable Package
  │
  ▼
Update Base Image / Dependency
  │
  ▼
Rebuild
  │
  ▼
Rescan
  │
  ▼
Promote
```

Do not manually patch a running production container as the normal remediation strategy.

---

# 87. Container Image Signing

A container can be signed:

```text
Image
  │
  ▼
Signing
  │
  ▼
Registry
  │
  ▼
Verification
  │
  ▼
Deployment
```

Common technologies include:

```text
Cosign
Sigstore
Notary
```

Signing supports supply-chain integrity and provenance.

---

# 88. SBOM and Containers

An SBOM describes image contents:

```text
Image
 │
 ├── Base OS
 ├── Runtime
 ├── Application
 ├── Libraries
 └── Packages
```

If a critical vulnerability is announced:

```text
CVE
 │
 ▼
Component
 │
 ▼
SBOM Search
 │
 ▼
Affected Images
```

This accelerates incident response.

---

# 89. Secrets in Containers

Never bake long-lived secrets into images.

Bad:

```dockerfile
ENV DB_PASSWORD=real-secret
```

or:

```dockerfile
COPY secret.txt /app/
```

Better:

```text
Container
    │
    ▼
Runtime Secret Injection
    │
    ▼
Secret Manager
```

Secrets scanning should also scan Dockerfiles, build context, and repositories.

---

# 90. Build-Time vs Runtime Secrets

Build-time secret:

```text
Build
 │
 └── Temporary Credential
```

Runtime secret:

```text
Running Container
 │
 └── Application Credential
```

Both require protection.

Build secrets should not become image layers.

Runtime secrets should not be stored in the image.

---

# 91. Container Root Filesystem Security

A useful production pattern:

```text
Root Filesystem
      │
      ▼
Read Only
      │
      ├── Temporary Writable Mount
      └── Persistent Volume
```

This reduces the ability of a compromised process to modify arbitrary files.

---

# 92. Container Security Checklist

```text
[ ] Trusted base image
[ ] Image scanned
[ ] Dependencies scanned
[ ] Secrets scanned
[ ] Non-root user
[ ] Minimal capabilities
[ ] No unnecessary privileged mode
[ ] Read-only filesystem where practical
[ ] CPU limits
[ ] Memory limits
[ ] Network restrictions
[ ] Secure secrets
[ ] Image signing / verification
[ ] SBOM
[ ] Logging and monitoring
```

---

# 93. Container Anti-Patterns

## Running as Root

```text
USER root
```

when unnecessary.

## Privileged Mode

```bash
--privileged
```

without a strong requirement.

## Hardcoded Secrets

```text
PASSWORD=...
```

inside the image.

## Persistent State in Container Layer

```text
Container filesystem
   └── Important database data
```

## Manual Production Modification

```text
docker exec
   └── edit production files
```

## Floating Image Tags

```text
myapp:latest
```

without controlled promotion.

## No Resource Limits

A single container can consume excessive resources.

---

# 94. Container Best Practices

## Build

```text
Small Image
+
Multi-Stage Build
+
Pinned Base
+
Security Scan
```

## Runtime

```text
Non-Root
+
Least Privilege
+
Resource Limits
+
Read-Only Root
```

## Configuration

```text
Runtime Configuration
+
Secret Manager
```

## Operations

```text
Logs
+
Metrics
+
Health Checks
+
Controlled Restarts
```

## Supply Chain

```text
Trusted Registry
+
SBOM
+
Signing
+
Verification
```

---

# 95. Containers in CI/CD

Typical pipeline:

```text
Git
 │
 ▼
Application Build
 │
 ▼
Docker Build
 │
 ▼
Container Image
 │
 ├── SAST
 ├── SCA
 ├── Secret Scan
 └── Image Scan
 │
 ▼
SBOM
 │
 ▼
Sign
 │
 ▼
Registry
 │
 ▼
Deploy
```

---

# 96. Container Promotion

A strong model:

```text
Build Image Once
      │
      ▼
Scan
      │
      ▼
Sign
      │
      ▼
Registry
      │
      ▼
Development
      │
      ▼
Testing
      │
      ▼
Production
```

Avoid rebuilding the same application separately for each environment when artifact promotion is the intended strategy.

---

# 97. Container and Kubernetes

Docker can create and test containers locally.

Kubernetes manages workloads at cluster scale.

Conceptually:

```text
Docker
 │
 └── Build / Test Image

Registry
 │
 └── Store Image

Kubernetes
 │
 └── Run / Scale / Manage Workload
```

The Kubernetes node runtime does not need to be Docker Engine.

Modern Kubernetes environments commonly use CRI-compatible runtimes such as containerd or CRI-O.

---

# 98. Container vs Pod

Container:

```text
Container
 └── Application Process
```

Kubernetes Pod:

```text
Pod
 ├── Container
 └── Optional Sidecars
```

A pod is a Kubernetes abstraction that groups one or more containers sharing certain resources such as network namespace and volumes.

---

# 99. Container Replacement

A key cloud-native principle:

```text
Old Container
      │
      ▼
Terminate
      │
      ▼
New Container
      │
      ▼
Same Image / Configuration
```

The application should not depend on a specific container instance.

---

# 100. Stateless Container Architecture

Ideal pattern:

```text
                 Load Balancer
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
      Container   Container   Container
          │           │           │
          └───────────┼───────────┘
                      ▼
                External Data
```

Any container can handle a request.

---

# 101. Stateful Container Architecture

For stateful workloads:

```text
Container
   │
   ▼
Persistent Volume
   │
   ▼
Durable Storage
```

Operational requirements include:

```text
Backup
Recovery
Replication
Storage Availability
Consistency
```

---

# 102. Container Networking Security

Restrict unnecessary communication.

Example:

```text
Frontend
   │
   ▼
API
   │
   ▼
Database
```

Prefer:

```text
Frontend → API
API → Database
```

rather than:

```text
Frontend → Database
```

Network segmentation reduces attack paths.

---

# 103. Container Resource Security

A compromised or buggy application can consume resources.

Use:

```text
CPU Limits
Memory Limits
PID Limits
Storage Controls
Network Controls
```

Conceptually:

```text
Container
   │
   ├── CPU
   ├── Memory
   ├── Processes
   └── Network
```

---

# 104. Container Host Security

Containers share the host kernel.

Therefore:

> **Container security depends partly on host security.**

A compromised host can undermine container isolation.

Protect:

```text
Host OS
Docker Engine / Runtime
Kernel
Registry Credentials
Management APIs
```

---

# 105. Docker Socket Security

Be careful with:

```text
/var/run/docker.sock
```

Giving a container access to the Docker socket can effectively grant very powerful control over the Docker host.

Avoid mounting the Docker socket into containers unless the use case is fully understood and appropriately secured.

---

# 106. Container Escape

A container escape occurs when an attacker breaks out of intended container isolation and gains access to the host or other resources.

Possible risk factors include:

```text
Kernel Vulnerabilities
Privileged Containers
Excessive Capabilities
Unsafe Runtime Configuration
Host Mounts
Docker Socket Exposure
```

Defenses include:

```text
Patched Host
+
Least Privilege
+
Minimal Capabilities
+
Security Profiles
+
Non-Root
+
Restricted Mounts
```

---

# 107. Host Mount Risks

Dangerous example:

```bash
-v /:/host
```

This exposes the host filesystem to the container.

Host filesystem mounts should be minimized and carefully controlled.

---

# 108. Container Lifecycle vs Application Lifecycle

These are different:

```text
Container Lifecycle
Created → Started → Stopped → Removed
```

Application lifecycle:

```text
Starting → Initializing → Ready → Serving → Shutting Down
```

Health checks and graceful shutdown help connect these concepts.

---

# 109. Container Dependency Startup

Suppose:

```text
API
 │
 ▼
Database
```

Starting both containers does not necessarily mean:

```text
Database Ready
```

The API may need retry logic or health-aware orchestration.

A robust application should tolerate dependency startup ordering and transient failures.

---

# 110. Twelve-Factor Principles and Containers

Containers work well with principles such as:

```text
Configuration in Environment
Stateless Processes
Logs as Event Streams
Build / Release / Run Separation
Disposable Processes
```

This is one reason containers are popular for cloud-native applications.

---

# 111. Build / Release / Run

A useful model:

```text
BUILD
  │
  ▼
Image
  │
  ▼
RELEASE
  │
  ▼
Image + Environment Configuration
  │
  ▼
RUN
  │
  ▼
Container
```

The image should represent the built artifact.

Environment-specific settings should generally be supplied separately.

---

# 112. Container Artifact Traceability

For production, track:

```text
Git Commit
     │
     ▼
Build ID
     │
     ▼
Image Tag
     │
     ▼
Image Digest
     │
     ▼
Deployment
     │
     ▼
Running Container
```

This allows teams to answer:

> Which source commit produced this running container?

---

# 113. Container Debugging Decision Tree

```text
Container Problem
      │
      ▼
Is it running?
      │
 ┌────┴─────┐
 │          │
 No        Yes
 │          │
 ▼          ▼
Logs      App Response?
 │          │
 ▼       ┌──┴───┐
Exit     No     Yes
Code      │      │
 │        ▼      ▼
 ▼      Network  Healthy
Config  / Port
```

Then investigate:

```text
Image
Process
Environment
Network
Volume
Resources
Dependencies
```

---

# 114. Common Commands Cheat Sheet

```bash
# Create
docker create --name app myapp:1.0

# Run
docker run -d --name app myapp:1.0

# List
docker ps
docker ps -a

# Start / Stop
docker start app
docker stop app
docker restart app

# Remove
docker rm app

# Logs
docker logs app
docker logs -f app

# Execute
docker exec -it app sh

# Inspect
docker inspect app

# Processes
docker top app

# Resources
docker stats app

# Events
docker events

# Network
docker network ls
docker network inspect app-net

# Volumes
docker volume ls
docker volume inspect app-data
```

---

# 115. Practical Example: Java Container

Dockerfile:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY app.jar .

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build:

```bash
docker build -t payments:1.0 .
```

Run:

```bash
docker run \
  -d \
  --name payments \
  -p 8080:8080 \
  --memory=512m \
  --cpus=1 \
  payments:1.0
```

Inspect:

```bash
docker ps
docker logs payments
docker inspect payments
```

---

# 116. Practical Example: Application + Database

```text
Docker Network
│
├── API Container
│      │
│      └── api:8080
│
└── Database Container
       │
       └── db:5432
```

API configuration:

```text
DB_HOST=db
DB_PORT=5432
```

Database storage:

```text
db
 │
 ▼
Persistent Volume
```

This separates:

```text
Application
Network
Configuration
Persistent Data
```

---

# 117. Practical Example: Development Environment

```text
Developer Machine
       │
       ▼
Docker Compose
       │
       ├── Frontend
       ├── Backend
       ├── Database
       └── Redis
```

Benefits:

- Reproducible development
- Easier onboarding
- Isolated dependencies
- Consistent service versions

---

# 118. Practical Example: Production Flow

```text
Developer
    │
    ▼
Git
    │
    ▼
CI
    │
    ├── Test
    ├── SAST
    ├── SCA
    └── Secret Scan
    │
    ▼
Docker Build
    │
    ▼
Image Scan
    │
    ▼
SBOM
    │
    ▼
Sign
    │
    ▼
Registry
    │
    ▼
Kubernetes
    │
    ▼
Pod
    │
    ▼
Container
```

---

# 119. Interview Questions

## Beginner

### What is a container?

A container is an isolated process environment created from a container image.

### Why does a container stop when the main process exits?

Because the container lifecycle is tied to its primary process.

### What is the difference between `docker create` and `docker run`?

`docker create` creates a stopped container; `docker run` generally creates and starts it.

### What is a container image?

A packaged filesystem and metadata used to create containers.

---

## Intermediate

### Why are containers considered ephemeral?

Because containers are commonly designed to be replaced rather than modified and preserved as permanent servers.

### Where should persistent data be stored?

In volumes or external durable storage rather than only in the container writable layer.

### What are namespaces?

Kernel isolation mechanisms that provide separate views of resources such as processes, networking, and mounts.

### What are cgroups?

Kernel resource-control mechanisms used to account for and limit resources such as CPU and memory.

---

## Advanced

### Why should a container normally run as non-root?

To reduce the privileges available to a compromised application and limit potential impact.

### What is the difference between a container runtime and an application runtime?

The container runtime creates and manages the isolated process environment; the application runtime executes the application, such as the JVM for Java.

### What happens when `docker stop` is executed?

Docker requests graceful termination of the main process and, if it does not terminate within the grace period, forcefully terminates it.

### Why is mounting the Docker socket dangerous?

Access to the Docker daemon socket can provide powerful control over the host's containers and potentially the host itself.

### How would you troubleshoot a container that repeatedly exits?

```text
docker ps -a
      │
      ▼
docker logs
      │
      ▼
Exit Code
      │
      ▼
docker inspect
      │
      ▼
Configuration
      │
      ▼
Dependencies / Resources
```

---

# 120. Container Security Mental Model

```text
                         CONTAINER
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
        PROCESS           NETWORK          FILESYSTEM
            │                │                │
            ▼                ▼                ▼
       PID Namespace    Network NS       Mount NS
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                       SECURITY CONTEXT
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        Non-Root        Capabilities      Seccomp
             │               │               │
             └───────────────┼───────────────┘
                             ▼
                          cgroups
                             │
                             ▼
                       Resource Limits
                             │
                             ▼
                          HOST OS
```

---

# 121. Complete Container Mental Model

```text
                         CONTAINER
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
   PROCESS               FILESYSTEM             NETWORK
       │                     │                     │
       ▼                     ▼                     ▼
     PID 1              Image Layers          Network NS
       │                Writable Layer             │
       │                Volumes                    ▼
       │                                         DNS
       │                                         Ports
       │
       ▼
   APPLICATION
       │
       ├── Environment
       ├── Configuration
       ├── Secrets
       └── Dependencies
       │
       ▼
   SECURITY
       │
       ├── Non-Root
       ├── Capabilities
       ├── Seccomp
       ├── AppArmor / SELinux
       └── Read-Only FS
       │
       ▼
   RESOURCE CONTROL
       │
       ├── CPU
       ├── Memory
       └── PIDs
       │
       ▼
   OBSERVABILITY
       │
       ├── Logs
       ├── Metrics
       └── Health
```

---

# 122. Final Key Takeaways

Remember these principles:

```text
1. Container = Isolated Process Environment

2. Image → Container

3. Container Lifecycle Follows Main Process

4. Containers Share the Host Kernel

5. Namespaces Provide Isolation

6. cgroups Provide Resource Control

7. Use Volumes for Persistent Data

8. Use Networks for Service Communication

9. Use Runtime Configuration Instead of Baking Configuration into Images

10. Never Bake Long-Lived Secrets into Images

11. Prefer Non-Root Containers

12. Avoid Privileged Containers

13. Use Resource Limits

14. Treat Containers as Replaceable

15. Rebuild Images Instead of Manually Patching Containers

16. Scan, Sign, and Track Container Images

17. Protect the Host and Container Runtime

18. Use Stable Service Discovery Instead of Hardcoded Container IPs
```

The most important mental model is:

```text
IMAGE
  │
  ▼
CONTAINER
  │
  ├── PROCESS
  ├── FILESYSTEM
  ├── NETWORK
  ├── CONFIGURATION
  ├── STORAGE
  ├── SECURITY CONTEXT
  └── RESOURCE LIMITS
  │
  ▼
APPLICATION
```

And the production lifecycle:

```text
SOURCE
  │
  ▼
BUILD
  │
  ▼
IMAGE
  │
  ▼
SCAN
  │
  ▼
SIGN
  │
  ▼
REGISTRY
  │
  ▼
DEPLOY
  │
  ▼
CONTAINER
  │
  ├── MONITOR
  ├── LOG
  ├── HEALTH CHECK
  └── REPLACE
```

> **The container should be treated as a disposable, reproducible execution unit—not as a server that is manually maintained.**

---

# 123. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`image.md`](image.md)
- [`dockerfile.md`](dockerfile.md)
- [`build.md`](build.md)
- [`run.md`](run.md)
- [`network.md`](network.md)
- [`volume.md`](volume.md)
- [`registry.md`](registry.md)
