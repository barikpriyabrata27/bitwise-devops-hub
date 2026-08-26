# Docker and Containers

> **Docker is a platform for building, packaging, distributing, and running applications as containers. Containers provide process-level isolation while sharing the host operating system kernel.**

This document is the foundation for the Docker knowledge section.

It explains the overall Docker ecosystem first. The related documents go deeper into individual topics such as images, Dockerfiles, networking, volumes, registries, and container execution.

---

# 1. What Is Docker?

Docker is a containerization platform.

The basic idea is:

```text
Application Code
      +
Dependencies
      +
Runtime
      +
Configuration
      │
      ▼
   Container Image
      │
      ▼
    Container
      │
      ▼
     Host
```

Instead of installing an application's dependencies directly on a server, Docker packages the application and its required runtime components into an image.

That image can then be used to create containers consistently across environments.

---

# 2. The Basic Docker Mental Model

Remember these five concepts:

```text
Dockerfile
    │
    ▼
Image
    │
    ▼
Container
    │
    ▼
Network / Volume / Config
    │
    ▼
Running Application
```

And:

```text
Dockerfile = Instructions
Image      = Package / Template
Container  = Running Instance
Registry   = Image Storage
Docker     = Platform / Tooling
```

---

# 3. Why Containers?

Traditional deployment:

```text
Server
│
├── Java
├── Node.js
├── Python
├── Libraries
├── Configuration
└── Application
```

Problems can include:

- Dependency conflicts
- Different runtime versions
- "Works on my machine"
- Difficult environment reproduction
- Manual server configuration

Containerized deployment:

```text
Host
│
├── Container A
│    └── Application A
│
├── Container B
│    └── Application B
│
└── Container C
     └── Application C
```

Each application can carry its own user-space dependencies and runtime environment.

---

# 4. Containerization

Containerization packages an application with the components required to run it.

Conceptually:

```text
Application
   +
Libraries
   +
Runtime
   +
Configuration
   │
   ▼
Container Image
```

The image is then instantiated as a container.

---

# 5. Containers vs Virtual Machines

This is one of the most important Docker concepts.

## Virtual Machine

```text
Physical / Cloud Host
│
├── Hypervisor
│    │
│    ├── VM 1
│    │    ├── Guest OS
│    │    └── Application
│    │
│    └── VM 2
│         ├── Guest OS
│         └── Application
```

Each VM normally includes a complete guest operating system.

## Container

```text
Host Operating System
│
├── Container 1
│    └── Application
│
├── Container 2
│    └── Application
│
└── Container 3
     └── Application
```

Containers share the host kernel while maintaining process and resource isolation.

---

# 6. Containers vs VMs Comparison

| Feature | Containers | Virtual Machines |
|---|---|---|
| Isolation | Process-level | Hardware/VM-level |
| Guest OS | Usually no separate guest OS | Yes |
| Startup | Usually fast | Usually slower |
| Resource overhead | Lower | Higher |
| Density | Generally higher | Generally lower |
| Kernel | Shares host kernel | Guest kernel |
| Packaging | Application + user-space dependencies | Full OS + application |
| Typical use | Microservices, CI/CD, cloud workloads | Full OS isolation, legacy workloads |

Containers are not simply "small VMs."

---

# 7. Container Isolation

Linux containers rely on kernel mechanisms such as:

```text
Namespaces
+
cgroups
+
Capabilities
+
Security Profiles
+
Filesystem Isolation
```

These mechanisms work together to isolate workloads.

---

# 8. Linux Namespaces

Namespaces provide isolation of system resources.

Common namespace types include:

```text
PID
Network
Mount
UTS
IPC
User
Cgroup
```

For example, PID namespaces allow a container to have its own process view.

Conceptually:

```text
Host
│
├── Host PID namespace
│
└── Container PID namespace
      │
      ├── Process 1
      ├── Process 2
      └── Process 3
```

---

# 9. PID 1 in a Container

The first process in a container normally has PID 1 inside the container's PID namespace.

Example:

```text
Container
│
└── PID 1
     │
     └── Application
```

PID 1 has special process-management responsibilities.

This is one reason applications running as PID 1 should handle:

- Signals
- Child processes
- Shutdown
- Zombie process reaping

Container behavior depends on the runtime and process model.

---

# 10. Network Namespace

A container can have its own network namespace.

Conceptually:

```text
Host Network
     │
     ▼
Virtual Ethernet
     │
     ▼
Container Network Namespace
     │
     ├── eth0
     ├── IP Address
     └── Routing
```

Docker networking builds on Linux networking mechanisms.

---

# 11. Mount Namespace

Mount namespaces provide filesystem mount isolation.

Conceptually:

```text
Host Filesystem
      │
      ▼
Container Filesystem View
```

The container sees a filesystem constructed from its image and mounted resources.

---

# 12. User Namespace

User namespaces can map container users to different host identities.

This can improve isolation when configured and supported appropriately.

Conceptually:

```text
Container User
      │
      ▼
User Namespace Mapping
      │
      ▼
Host Identity
```

Not every Docker deployment uses user namespace remapping by default.

---

# 13. cgroups

**cgroups (control groups)** provide resource accounting and control.

They can be used for resources such as:

```text
CPU
Memory
PIDs
Block I/O
```

Conceptually:

```text
Host
│
├── Container A
│     └── CPU / Memory Limit
│
└── Container B
      └── CPU / Memory Limit
```

This helps prevent one workload from consuming unlimited host resources.

---

# 14. Resource Limits

Example:

```bash
docker run --memory=512m --cpus=1 myapp
```

Conceptually:

```text
Container
   │
   ├── CPU <= 1
   └── Memory <= 512 MB
```

Exact behavior depends on host operating system and Docker/runtime configuration.

---

# 15. Docker Architecture

A simplified architecture:

```text
                    Docker CLI
                        │
                        ▼
                  Docker API
                        │
                        ▼
                 Docker Engine
                        │
              ┌─────────┼─────────┐
              │         │         │
              ▼         ▼         ▼
           Images    Containers  Networks
              │         │         │
              └─────────┼─────────┘
                        ▼
                     Volumes
```

Docker's architecture has evolved over time, and modern Docker uses components such as containerd and OCI-compatible runtimes under the engine.

---

# 16. Docker Client

The Docker CLI is commonly invoked as:

```bash
docker
```

Examples:

```bash
docker ps
docker images
docker build
docker run
docker pull
docker push
```

The CLI communicates with the Docker Engine/API.

---

# 17. Docker Engine

Docker Engine provides the core Docker functionality.

It is responsible for operations such as:

```text
Image Management
Container Management
Network Management
Volume Management
API Access
```

Conceptually:

```text
docker CLI
    │
    ▼
Docker Engine
    │
    ▼
Container Runtime
    │
    ▼
Container
```

---

# 18. Docker Daemon

The Docker daemon is commonly referred to as:

```text
dockerd
```

It manages Docker resources and listens for Docker API requests.

Conceptually:

```text
docker CLI
    │
    ▼
dockerd
    │
    ├── Images
    ├── Containers
    ├── Networks
    └── Volumes
```

Modern Docker installations also use lower-level components such as containerd.

---

# 19. containerd

**containerd** is a container runtime management component widely used in the container ecosystem.

Conceptually:

```text
Docker Engine
      │
      ▼
  containerd
      │
      ▼
 OCI Runtime
      │
      ▼
 Container Process
```

containerd handles many lifecycle and image-related responsibilities.

---

# 20. OCI

**OCI = Open Container Initiative**

OCI defines standards around container images and runtimes.

Important concepts include:

```text
OCI Image Specification
OCI Runtime Specification
```

This helps different tools interoperate.

Conceptually:

```text
Docker
Podman
containerd
Kubernetes Ecosystem
       │
       ▼
      OCI
       │
       ▼
Common Container Standards
```

---

# 21. runc

**runc** is a commonly used OCI-compatible low-level runtime.

Conceptually:

```text
Container Management
        │
        ▼
     containerd
        │
        ▼
       runc
        │
        ▼
 Linux Kernel
```

The exact runtime stack can vary by environment.

---

# 22. Image

A Docker image is an immutable-style package containing the filesystem and metadata needed to create a container.

Conceptually:

```text
Image
│
├── Application
├── Runtime
├── Libraries
├── Files
└── Metadata
```

An image is not the running application.

It is used to create containers.

---

# 23. Container

A container is a running or stopped instance created from an image.

```text
Image
  │
  ├── Container A
  ├── Container B
  └── Container C
```

The same image can create multiple containers.

---

# 24. Image vs Container

| Image | Container |
|---|---|
| Template/package | Runtime instance |
| Immutable-style artifact | Has writable runtime state |
| Stored in registry/local cache | Exists on host/runtime |
| Created by build | Created by run/create |
| Can create many containers | One instance of an image |

Mental model:

```text
Image = Class
Container = Object
```

This is an analogy, not an exact implementation detail.

---

# 25. Dockerfile

A Dockerfile describes how an image is built.

Example:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY app.jar .

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Flow:

```text
Dockerfile
    │
    ▼
docker build
    │
    ▼
Image
```

Dockerfiles have their own detailed document in this knowledge section.

---

# 26. Build Context

When you run:

```bash
docker build -t myapp .
```

the final `.` identifies the build context.

Conceptually:

```text
Current Directory
       │
       ▼
Build Context
       │
       ▼
Dockerfile
       │
       ▼
Build
```

The `.dockerignore` file can exclude unnecessary files from the context.

---

# 27. .dockerignore

Example:

```text
.git
node_modules
target
*.log
.env
```

Benefits include:

- Smaller build context
- Faster builds
- Reduced accidental secret exposure
- Cleaner builds

Important:

> `.dockerignore` is not a security boundary for files already accessible to the build process. It is primarily a mechanism for controlling the build context.

---

# 28. Image Layers

Docker images are commonly composed of layers.

Example:

```text
Application Layer
-----------------
Dependency Layer
-----------------
Runtime Layer
-----------------
Base Image Layer
```

Conceptually:

```text
Layer 4
Layer 3
Layer 2
Layer 1
```

Layers enable caching and efficient image distribution.

---

# 29. Copy-on-Write

Containers commonly use a writable layer on top of image layers.

Conceptually:

```text
Container Writable Layer
------------------------
Image Layer 3
------------------------
Image Layer 2
------------------------
Image Layer 1
```

When a container modifies a file from a lower read-only layer, the runtime can use copy-on-write behavior.

---

# 30. Image Immutability

A useful container principle is:

> **Build once, run consistently.**

Instead of modifying containers manually:

```text
Running Container
    │
    └── Manual Changes
```

prefer:

```text
Source
  │
  ▼
New Image
  │
  ▼
New Container
```

This creates reproducible deployments.

---

# 31. Container Lifecycle

A container can move through states such as:

```text
Created
   │
   ▼
Running
   │
   ├── Paused
   │
   └── Stopped
         │
         ▼
       Removed
```

Typical commands:

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

# 32. docker create vs docker run

`docker create` creates a container without starting it.

```bash
docker create nginx
```

`docker run` generally creates and starts a container.

```bash
docker run nginx
```

Conceptually:

```text
docker create
      │
      ▼
   Created

docker run
      │
      ▼
 Created + Started
```

---

# 33. Running a Container

Basic example:

```bash
docker run nginx
```

A more practical example:

```bash
docker run -d --name web -p 8080:80 nginx
```

Meaning:

```text
-d
 └── Detached mode

--name web
 └── Container name

-p 8080:80
 └── Host port 8080 → Container port 80
```

---

# 34. Port Mapping

Containers have their own network namespace.

Example:

```text
Host
Port 8080
    │
    ▼
Docker Port Mapping
    │
    ▼
Container
Port 80
```

Command:

```bash
docker run -p 8080:80 nginx
```

This does not mean the application itself changed from port 80 to 8080.

The host exposes 8080 and forwards traffic to container port 80.

---

# 35. EXPOSE vs -p

Dockerfile:

```dockerfile
EXPOSE 8080
```

This documents the intended container port.

It does not automatically publish that port to the host.

Publishing happens through runtime configuration:

```bash
docker run -p 8080:8080 myapp
```

Remember:

```text
EXPOSE = Metadata / Documentation
-p      = Publish / Port Mapping
```

---

# 36. Environment Variables

Containers often receive configuration through environment variables.

Example:

```bash
docker run \
  -e APP_ENV=production \
  -e LOG_LEVEL=info \
  myapp
```

Conceptually:

```text
Image
  │
  ▼
Container
  │
  └── Environment
        ├── APP_ENV
        └── LOG_LEVEL
```

Avoid putting secrets directly into Dockerfiles or images.

---

# 37. Environment-Specific Configuration

A common pattern:

```text
Same Image
    │
    ├── Development Config
    ├── Test Config
    └── Production Config
```

The image remains the same while environment-specific configuration is supplied at runtime.

This supports:

> **Build once, deploy many times.**

---

# 38. Volumes

Containers are designed to be replaceable.

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
docker volume create dbdata
docker run -v dbdata:/var/lib/postgresql/data postgres
```

Volumes have their own detailed document.

---

# 39. Bind Mounts

A bind mount maps a host path into a container.

Example:

```bash
docker run -v $(pwd):/app myapp
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

Bind mounts are useful in development but require careful permission and security handling.

---

# 40. Container Networking

Docker provides networking mechanisms so containers can communicate.

Common network concepts:

```text
Bridge
Host
None
Overlay
Custom Networks
```

For example:

```text
Frontend Container
       │
       ▼
Docker Network
       │
       ▼
Backend Container
```

Networking has a dedicated document.

---

# 41. Container-to-Container Communication

On a user-defined Docker network:

```text
frontend
    │
    ▼
backend
```

Applications can generally communicate using container/service names when Docker's embedded DNS is available.

Example:

```text
http://backend:8080
```

rather than hardcoding an IP address.

---

# 42. Docker Compose

Docker Compose defines multi-container applications.

Example:

```yaml
services:
  web:
    image: nginx

  api:
    image: my-api

  db:
    image: postgres
```

Conceptually:

```text
Compose
   │
   ├── Web
   ├── API
   └── Database
```

Compose is useful for local development, testing, and simple multi-container environments.

---

# 43. Docker Compose Architecture

```text
docker compose
      │
      ▼
Compose File
      │
      ├── Services
      ├── Networks
      ├── Volumes
      └── Configuration
      │
      ▼
Docker Engine
      │
      ▼
Containers
```

---

# 44. Container Logs

A common command:

```bash
docker logs myapp
```

Containers should normally write application logs to standard output/error where practical.

```text
Application
   │
   ├── stdout
   └── stderr
        │
        ▼
Docker Logging
```

External log aggregation can then collect the output.

---

# 45. Logging Principle

Prefer:

```text
Application
    │
    ▼
stdout / stderr
    │
    ▼
Container Runtime
    │
    ▼
Log Collector
```

rather than relying on local files inside ephemeral containers.

For applications requiring file-based logging, carefully design persistence and log collection.

---

# 46. Container Exec

You can execute a command inside a running container:

```bash
docker exec -it myapp sh
```

Conceptually:

```text
Host
  │
  ▼
Docker Engine
  │
  ▼
Running Container
  │
  ▼
Shell / Process
```

This is useful for debugging.

Avoid making manual production changes through `docker exec` as a deployment strategy.

---

# 47. Inspecting Containers

Useful command:

```bash
docker inspect myapp
```

It can expose configuration and metadata such as:

```text
Network
Mounts
Environment
Image
State
Ports
Runtime Configuration
```

Be careful when inspecting environments containing secrets because output may reveal sensitive values.

---

# 48. Listing Containers

Running containers:

```bash
docker ps
```

All containers:

```bash
docker ps -a
```

Conceptually:

```text
docker ps
   │
   ▼
Container Inventory
```

---

# 49. Listing Images

```bash
docker images
```

or:

```bash
docker image ls
```

Conceptually:

```text
Local Image Store
│
├── nginx
├── redis
└── myapp
```

---

# 50. Pulling Images

```bash
docker pull nginx
```

Flow:

```text
Docker Client
     │
     ▼
Registry
     │
     ▼
Image
     │
     ▼
Local Image Store
```

---

# 51. Pushing Images

```bash
docker push registry.example.com/myapp:1.0
```

Flow:

```text
Local Image
     │
     ▼
Registry Authentication
     │
     ▼
Registry
```

A registry stores and distributes container images.

---

# 52. Container Registry

A container registry is a service for storing and distributing images.

Examples include:

```text
Docker Hub
Amazon ECR
Azure Container Registry
Google Artifact Registry
GitHub Container Registry
GitLab Container Registry
JFrog Artifactory
Harbor
```

Registry concepts are covered in detail in `registry.md`.

---

# 53. Image Tags

Example:

```text
myapp:1.4.2
```

Components:

```text
myapp
  │
  └── Repository

1.4.2
  │
  └── Tag
```

Tags are human-friendly references.

Important:

> Tags are mutable references unless the registry/platform policy makes them immutable.

---

# 54. Image Digests

An image digest identifies content by cryptographic digest.

Example conceptually:

```text
myapp@sha256:<digest>
```

This provides stronger content identity than a mutable tag.

Compare:

```text
myapp:latest
```

with:

```text
myapp@sha256:...
```

For supply-chain-sensitive deployments, digest pinning can improve reproducibility and integrity.

---

# 55. latest Tag

A common mistake is assuming:

```text
latest = newest
```

`latest` is simply a tag.

It does not inherently guarantee:

- Newest version
- Secure version
- Stable version
- Immutable version

Production deployments should use controlled versioning and, where appropriate, digests.

---

# 56. Base Images

A Dockerfile commonly starts with:

```dockerfile
FROM ubuntu:24.04
```

or:

```dockerfile
FROM eclipse-temurin:21-jre
```

The base image provides foundational filesystem and runtime components.

Conceptually:

```text
Application
   │
   ▼
Application Image
   │
   ▼
Base Image
```

Base-image security is therefore part of container security.

---

# 57. Minimal Base Images

Smaller images can reduce:

```text
Attack Surface
Image Size
Network Transfer
Package Count
```

Examples of approaches include:

```text
Slim Images
Distroless Images
Minimal Runtime Images
```

But smaller does not automatically mean secure.

Security still requires:

```text
Updates
Scanning
Correct Configuration
Least Privilege
```

---

# 58. Multi-Stage Builds

Multi-stage builds separate build-time and runtime environments.

Example:

```dockerfile
FROM maven:... AS build

WORKDIR /src
COPY . .
RUN mvn package

FROM eclipse-temurin:...-jre

WORKDIR /app
COPY --from=build /src/target/app.jar .
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Conceptually:

```text
Build Image
   │
   ▼
Compile
   │
   ▼
Artifact
   │
   ▼
Runtime Image
```

Benefits include:

- Smaller runtime image
- Fewer build tools in production
- Reduced attack surface

---

# 59. Container Security

Containerization is not automatically secure.

Security should include:

```text
Image Scanning
+
Secrets Scanning
+
Dependency Scanning
+
Least Privilege
+
Runtime Security
+
Network Security
+
Supply-Chain Security
```

---

# 60. Run as Non-Root

Avoid running applications as root when unnecessary.

Dockerfile example:

```dockerfile
RUN useradd --create-home appuser
USER appuser
```

Conceptually:

```text
Container
   │
   ▼
Non-Root User
   │
   ▼
Application
```

This reduces the impact of some application-level compromises.

---

# 61. Docker Capabilities

Linux capabilities divide traditional root privileges into smaller units.

A container can be granted or restricted from capabilities.

Conceptually:

```text
Container
   │
   ▼
Linux Capabilities
   │
   ├── Allowed
   └── Dropped
```

A least-privilege approach is preferable.

---

# 62. Privileged Containers

Avoid:

```bash
docker run --privileged ...
```

unless there is a strong, understood requirement.

Privileged containers receive significantly broader access to host resources.

Security principle:

> **Do not grant privileges that the workload does not need.**

---

# 63. Read-Only Root Filesystem

Where possible:

```bash
docker run --read-only myapp
```

Conceptually:

```text
Container Filesystem
       │
       ▼
Read Only
       │
       ├── Application
       └── Runtime
```

Writable data can be provided through appropriate volumes or temporary filesystems.

---

# 64. Resource Controls

Security and reliability both benefit from resource limits.

Example:

```bash
docker run \
  --cpus=1 \
  --memory=512m \
  myapp
```

This can reduce the impact of runaway processes.

---

# 65. Health Checks

A container can define a health check.

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

Health status can be consumed by orchestration and operational tooling.

---

# 66. Restart Policies

Example:

```bash
docker run --restart unless-stopped myapp
```

Common policies include:

```text
no
on-failure
always
unless-stopped
```

These affect container restart behavior.

In orchestrated environments, the orchestrator usually manages workload recovery.

---

# 67. Docker and Kubernetes

Docker and Kubernetes are not the same thing.

```text
Docker
  │
  ├── Build Images
  ├── Run Containers
  ├── Manage Local Containers
  └── Developer Tooling
```

Kubernetes:

```text
Kubernetes
  │
  ├── Orchestration
  ├── Scheduling
  ├── Service Discovery
  ├── Scaling
  ├── Rolling Updates
  └── Workload Management
```

Kubernetes can run OCI-compatible container workloads through supported container runtimes.

---

# 68. Docker in a Kubernetes Workflow

A common historical workflow:

```text
Dockerfile
    │
    ▼
Docker Build
    │
    ▼
Container Image
    │
    ▼
Registry
    │
    ▼
Kubernetes
    │
    ▼
Pod
```

Modern Kubernetes environments do not require the Docker Engine itself as the node runtime.

The important artifact is the container image.

---

# 69. Pod vs Container

In Kubernetes:

```text
Pod
│
├── Container A
└── Container B
```

A pod is a Kubernetes scheduling/deployment unit and can contain one or more containers.

Most application pods contain one primary application container, but sidecars and helper containers are also common.

---

# 70. Docker vs Podman

Both provide container tooling.

Conceptually:

```text
Docker
   │
   └── Docker Engine ecosystem

Podman
   │
   └── Daemonless container tooling
```

Podman emphasizes daemonless and rootless workflows.

Both support OCI-oriented container images and runtimes.

The choice depends on platform, operational model, ecosystem integration, and organizational requirements.

---

# 71. Container Portability

A major container benefit is packaging consistency.

```text
Developer Machine
       │
       ▼
Container Image
       │
       ▼
CI
       │
       ▼
Registry
       │
       ▼
Test Environment
       │
       ▼
Production
```

The same image can move across environments.

---

# 72. Build Once, Deploy Many

A strong CI/CD principle:

```text
Source
  │
  ▼
Build
  │
  ▼
Image
  │
  ▼
Scan
  │
  ▼
Registry
  │
  ├── Dev
  ├── Test
  └── Production
```

Avoid rebuilding the application separately for each environment when the goal is to promote the same artifact.

---

# 73. Container Image Promotion

Example:

```text
myapp:1.5.0
     │
     ▼
Development
     │
     ▼
Testing
     │
     ▼
Security Approval
     │
     ▼
Production
```

The artifact remains the same while deployment configuration changes by environment.

---

# 74. Image Versioning

Prefer controlled versioning.

Examples:

```text
myapp:1.5.0
myapp:1.5
myapp:release-2026-08-26
```

For strong artifact identity:

```text
myapp@sha256:...
```

A common strategy is:

```text
Human-readable tag
+
Immutable digest
```

---

# 75. Docker Build Cache

Docker can reuse previous build layers.

Conceptually:

```text
Layer 1 ── Cached
Layer 2 ── Cached
Layer 3 ── Changed
Layer 4 ── Rebuilt
```

This can make builds much faster.

Dockerfile instruction ordering affects cache effectiveness.

---

# 76. BuildKit

Modern Docker builds commonly use **BuildKit**.

BuildKit provides capabilities such as:

- Efficient builds
- Parallel build operations
- Improved caching
- Build secrets
- SSH forwarding
- Multi-platform builds

Conceptually:

```text
Docker Build
    │
    ▼
 BuildKit
    │
    ├── Cache
    ├── Secrets
    ├── Parallelism
    └── Multi-platform
```

---

# 77. Build Secrets

Build-time credentials should not be copied into image layers.

Conceptually:

```text
Build Secret
     │
     ▼
Build Step
     │
     ▼
Artifact
```

The secret should not become part of the resulting image.

Modern BuildKit supports controlled secret mounts for build operations.

---

# 78. Multi-Platform Images

A single image reference can support multiple architectures.

Examples:

```text
linux/amd64
linux/arm64
```

Conceptually:

```text
Image
 │
 ├── amd64 Variant
 └── arm64 Variant
```

A registry can store a multi-platform image index that points to architecture-specific manifests.

---

# 79. Docker Desktop

Docker Desktop provides a developer-oriented Docker environment on supported operating systems.

It commonly includes:

```text
Docker Engine
Docker CLI
Docker Compose
Build tooling
Developer UI
```

On non-Linux hosts, Docker Desktop typically runs Linux containers inside a lightweight Linux environment/VM.

---

# 80. Docker on Linux

On Linux:

```text
Docker CLI
    │
    ▼
Docker Engine
    │
    ▼
Linux Kernel
    │
    ▼
Containers
```

Containers directly use Linux kernel primitives through the runtime stack.

---

# 81. Docker on Windows and macOS

Docker Linux containers need a Linux kernel.

Docker Desktop therefore provides a Linux environment for Linux containers on Windows and macOS.

Conceptually:

```text
Windows / macOS
      │
      ▼
Docker Desktop
      │
      ▼
Linux Environment
      │
      ▼
Containers
```

The implementation details vary by platform.

---

# 82. Container Runtime

A container runtime is responsible for creating and managing container processes.

A simplified stack:

```text
Docker CLI
    │
    ▼
Docker Engine
    │
    ▼
containerd
    │
    ▼
OCI Runtime
    │
    ▼
Linux Kernel
    │
    ▼
Container Process
```

The exact stack can differ between environments.

---

# 83. Container Filesystem

A container filesystem is constructed from:

```text
Image Layers
      +
Writable Layer
      +
Volumes / Mounts
```

Conceptually:

```text
Container
│
├── Image filesystem
│
├── Writable layer
│
└── Mounted volumes
```

---

# 84. Ephemeral Containers

Containers are often designed to be replaceable.

Instead of:

```text
Container
  │
  └── Permanent State
```

prefer:

```text
Container
  │
  ├── Stateless Application
  │
  └── External Persistent Storage
```

This model works especially well with orchestration platforms.

---

# 85. Stateful Containers

Some applications require persistent data.

Examples:

```text
Database
Message Queue
Search Engine
```

A common model is:

```text
Container
   │
   ▼
Persistent Volume
```

However, running stateful workloads in containers requires careful storage, backup, recovery, and operational planning.

---

# 86. Configuration vs Data

Separate:

```text
Application Image
```

from:

```text
Configuration
```

and:

```text
Persistent Data
```

Conceptually:

```text
              Image
                │
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼
     Code     Config    Data
```

This separation improves portability and operational consistency.

---

# 87. Container Security Supply Chain

A secure container lifecycle:

```text
Source
  │
  ▼
Dockerfile
  │
  ▼
Build
  │
  ▼
SAST
  │
  ▼
SCA
  │
  ▼
Image Scan
  │
  ▼
SBOM
  │
  ▼
Sign / Attest
  │
  ▼
Registry
  │
  ▼
Deploy
```

Container security starts before the container runs.

---

# 88. Image Scanning

Image scanners inspect:

```text
OS Packages
Application Dependencies
Libraries
Configuration
Secrets
Malware Indicators
```

Common tools include:

```text
Trivy
Grype
Docker Scout
Clair
JFrog Xray
```

Image scanning is covered more deeply in the DevSecOps/container-security knowledge section.

---

# 89. Container Image Signing

Images can be signed to establish provenance and integrity.

Conceptually:

```text
Image
   │
   ▼
Sign
   │
   ▼
Registry
   │
   ▼
Verify
   │
   ▼
Deploy
```

Tools and ecosystems include:

```text
Sigstore
Cosign
Notary
```

The exact implementation depends on the organization's supply-chain architecture.

---

# 90. SBOM for Container Images

An SBOM can describe the components inside an image.

```text
Container Image
      │
      ▼
SBOM
      │
      ├── OS Packages
      ├── Application Libraries
      ├── Runtime Components
      └── Versions
```

This helps answer:

> "What is actually inside this production image?"

---

# 91. Container Registry as a Security Boundary

A registry can provide:

```text
Authentication
Authorization
Scanning
Signing / Verification
Retention
Replication
Access Control
Audit
```

Therefore the registry is more than a file store.

It is an important software supply-chain component.

---

# 92. Container Cleanup

Unused containers and images consume disk space.

Useful commands:

```bash
docker container prune
docker image prune
docker system prune
```

Use cleanup commands carefully, especially on shared development or build hosts.

---

# 93. Docker System Resources

Docker manages several resource categories:

```text
Images
Containers
Networks
Volumes
Build Cache
```

A useful mental model:

```text
Docker
│
├── Images
├── Containers
├── Networks
├── Volumes
└── Build Cache
```

---

# 94. Common Docker Commands

## Version

```bash
docker version
docker info
```

## Containers

```bash
docker ps
docker ps -a
docker run
docker create
docker start
docker stop
docker restart
docker rm
```

## Images

```bash
docker images
docker pull
docker build
docker tag
docker push
docker rmi
```

## Logs / Inspection

```bash
docker logs
docker inspect
docker stats
docker top
```

## Shell

```bash
docker exec -it <container> sh
```

## Networks

```bash
docker network ls
docker network inspect
docker network create
```

## Volumes

```bash
docker volume ls
docker volume create
docker volume inspect
```

---

# 95. Basic Docker Workflow

```bash
# Build
docker build -t myapp:1.0 .

# Run
docker run -d --name myapp -p 8080:8080 myapp:1.0

# Check
docker ps

# Logs
docker logs myapp

# Inspect
docker inspect myapp

# Stop
docker stop myapp

# Remove
docker rm myapp
```

---

# 96. Complete Application Flow

```text
Developer
    │
    ▼
Source Code
    │
    ▼
Dockerfile
    │
    ▼
docker build
    │
    ▼
Image
    │
    ▼
Security Scans
    │
    ▼
Registry
    │
    ▼
docker pull
    │
    ▼
Container
    │
    ├── Network
    ├── Volume
    ├── Environment
    └── Runtime Limits
    │
    ▼
Application
```

---

# 97. Docker in CI/CD

A typical pipeline:

```text
Git Push
   │
   ▼
Build
   │
   ▼
Unit Tests
   │
   ▼
SAST
   │
   ▼
SCA
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
Push Registry
   │
   ▼
Deploy
```

---

# 98. Docker Build vs Application Build

These are related but different.

For a Java application:

```text
Maven
   │
   ▼
app.jar
```

Then:

```text
Docker Build
   │
   ▼
Container Image
```

Conceptually:

```text
Source
  │
  ▼
Application Build
  │
  ▼
Artifact
  │
  ▼
Docker Build
  │
  ▼
Image
```

A multi-stage Dockerfile can combine these stages.

---

# 99. Where Does the JAR Come From?

This is a common practical question.

There are two common approaches.

## Approach 1: Build Outside Docker

```text
Source
  │
  ▼
Maven
  │
  ▼
app.jar
  │
  ▼
Docker Build
  │
  ▼
Image
```

## Approach 2: Build Inside Docker

```text
Source
  │
  ▼
Docker Build
  │
  ├── Build Stage
  │     └── Maven
  │          └── app.jar
  │
  └── Runtime Stage
        └── app.jar
```

This is the purpose of multi-stage builds.

---

# 100. Docker and Kubernetes Deployment

Typical enterprise flow:

```text
Developer
    │
    ▼
Git
    │
    ▼
CI/CD
    │
    ▼
Application Build
    │
    ▼
Docker Image
    │
    ▼
Security Scanning
    │
    ▼
Container Registry
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

The container image is the deployment artifact.

---

# 101. Docker Security Checklist

## Image

- [ ] Use trusted base images
- [ ] Keep images updated
- [ ] Scan images
- [ ] Minimize packages
- [ ] Use multi-stage builds
- [ ] Avoid unnecessary tools

## Runtime

- [ ] Run as non-root
- [ ] Drop unnecessary capabilities
- [ ] Avoid privileged mode
- [ ] Set resource limits
- [ ] Use read-only filesystem where practical
- [ ] Restrict network access

## Secrets

- [ ] Never hardcode secrets
- [ ] Use secret managers
- [ ] Avoid secrets in image layers
- [ ] Protect CI/CD credentials

## Supply Chain

- [ ] Use trusted registries
- [ ] Scan dependencies
- [ ] Generate SBOMs
- [ ] Sign images
- [ ] Verify provenance

---

# 102. Common Docker Anti-Patterns

## Anti-Pattern 1: Treating Containers Like VMs

Containers are process-oriented workloads, not miniature servers.

## Anti-Pattern 2: Running Everything as Root

Use least privilege.

## Anti-Pattern 3: Storing Data Inside the Container

Use volumes or external storage for persistent data.

## Anti-Pattern 4: Using `latest` in Production

Use controlled versioning and, where appropriate, digests.

## Anti-Pattern 5: Putting Secrets in Dockerfiles

Secrets can become part of build history or image metadata/layers.

## Anti-Pattern 6: Installing Build Tools in Runtime Images

Use multi-stage builds.

## Anti-Pattern 7: Making Manual Changes Inside Containers

Rebuild the image instead.

## Anti-Pattern 8: Using `--privileged` Without Need

This increases host exposure.

## Anti-Pattern 9: Ignoring Image Scanning

Base images and packages can contain vulnerabilities.

## Anti-Pattern 10: Treating Container Security as Runtime-Only

Security starts during source, dependency, build, and image creation.

---

# 103. Docker Troubleshooting Model

When a container does not work, inspect from outside to inside:

```text
1. Image
      │
      ▼
2. Container State
      │
      ▼
3. Logs
      │
      ▼
4. Environment
      │
      ▼
5. Ports
      │
      ▼
6. Network
      │
      ▼
7. Volumes
      │
      ▼
8. Application Process
```

Useful commands:

```bash
docker ps -a
docker logs <container>
docker inspect <container>
docker stats <container>
docker exec -it <container> sh
```

---

# 104. Troubleshooting: Container Exits Immediately

Example:

```text
docker run myapp

Container
   │
   ▼
Starts
   │
   ▼
Application exits
   │
   ▼
Container stops
```

Remember:

> A container normally lives as long as its main process lives.

Check:

```bash
docker ps -a
docker logs myapp
```

---

# 105. Troubleshooting: Port Not Accessible

Check:

```text
Application Listening Port
          │
          ▼
Container Port
          │
          ▼
Docker Port Mapping
          │
          ▼
Host Port
          │
          ▼
Firewall / Network
```

Example:

```bash
docker run -p 8080:8080 myapp
```

Verify the application is actually listening on the expected interface and port inside the container.

---

# 106. Troubleshooting: Container Cannot Reach Another Container

Check:

```text
Same Network?
     │
     ▼
DNS Name?
     │
     ▼
Correct Port?
     │
     ▼
Application Listening?
     │
     ▼
Firewall / Policy?
```

Use:

```bash
docker network ls
docker network inspect <network>
```

---

# 107. Troubleshooting: Data Disappeared

If data was stored only inside the container's writable layer:

```text
Container Removed
      │
      ▼
Data Lost
```

Persistent data should use:

```text
Volume
```

or an external storage service.

---

# 108. Troubleshooting: Image Is Too Large

Inspect:

```text
Base Image
Dependencies
Build Tools
Caches
Unnecessary Files
```

Solutions:

```text
Smaller Base
+
Multi-Stage Build
+
.dockerignore
+
Dependency Cleanup
+
Package Cleanup
```

---

# 109. Docker and Microservices

Containers are commonly used for microservices.

Example:

```text
                     API Gateway
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
          User         Order        Payment
         Service       Service       Service
             │            │            │
             ▼            ▼            ▼
           DB            DB           DB
```

Each service can be packaged as a separate image.

---

# 110. Containers and Scalability

One image can create many container instances:

```text
Image
 │
 ├── Container 1
 ├── Container 2
 ├── Container 3
 └── Container 4
```

An orchestrator can then schedule and scale these instances.

---

# 111. Stateless Application Pattern

Ideal containerized application:

```text
Request
   │
   ▼
Container
   │
   ▼
External Database / Cache / Storage
```

The container can be destroyed and recreated without losing important business data.

This enables:

```text
Scale Out
Rolling Updates
Self-Healing
Replacement
```

---

# 112. Container Readiness

A running process does not necessarily mean the application is ready.

```text
Container Running
       │
       ▼
Application Starting
       │
       ▼
Dependencies Connecting
       │
       ▼
Application Ready
```

Health checks and orchestration readiness mechanisms help distinguish these states.

---

# 113. Container Security Layers

Think in layers:

```text
Layer 1 ─ Source Security
Layer 2 ─ Dependency Security
Layer 3 ─ Dockerfile Security
Layer 4 ─ Image Security
Layer 5 ─ Registry Security
Layer 6 ─ Runtime Security
Layer 7 ─ Network Security
Layer 8 ─ Host Security
Layer 9 ─ Orchestration Security
```

No single control is sufficient.

---

# 114. Docker Knowledge Map

```text
Docker
│
├── Fundamentals
│   └── docker-and-containers.md
│
├── Containers
│   └── container.md
│
├── Images
│   └── image.md
│
├── Dockerfile
│   └── dockerfile.md
│
├── Build
│   └── build.md
│
├── Run
│   └── run.md
│
├── Networking
│   └── network.md
│
├── Volumes
│   └── volume.md
│
└── Registry
    └── registry.md
```

This document is the foundation; the remaining files should provide deeper, focused coverage.

---

# 115. Interview Questions

## Beginner

### What is Docker?

Docker is a containerization platform used to build, package, distribute, and run applications as containers.

### What is a container?

A container is an isolated process environment created from a container image.

### What is an image?

An image is a packaged filesystem and metadata used to create containers.

### What is the difference between an image and a container?

An image is the package/template; a container is an instance created from that image.

---

## Intermediate

### Why are containers lighter than VMs?

Containers share the host kernel rather than requiring a separate guest operating system for each workload.

### What are namespaces?

Linux namespaces isolate views of system resources such as processes, networking, mounts, and users.

### What are cgroups?

cgroups control and account for resource usage such as CPU and memory.

### What is a Dockerfile?

A Dockerfile contains instructions used to build a container image.

### What is a registry?

A registry stores and distributes container images.

---

## Advanced

### What happens when you run `docker run`?

Conceptually:

```text
Image
 │
 ▼
Create Container
 │
 ▼
Configure
 │
 ▼
Start Process
 │
 ▼
Running Container
```

### What happens internally when a container starts?

A simplified view:

```text
Docker API
   │
   ▼
Docker Engine
   │
   ▼
containerd
   │
   ▼
OCI Runtime
   │
   ▼
Linux Kernel
   │
   ▼
Container Process
```

### Why does deleting a secret from a Dockerfile not necessarily make it safe?

Because build history and image layers may preserve content from earlier build steps.

### Why should containers be immutable?

Immutable-style deployments improve reproducibility, consistency, rollback, and operational reliability.

---

# 116. Key Docker Commands Cheat Sheet

```bash
# Version / information
docker version
docker info

# Images
docker image ls
docker pull nginx
docker build -t myapp:1.0 .
docker tag myapp:1.0 registry.example.com/myapp:1.0
docker push registry.example.com/myapp:1.0

# Containers
docker run nginx
docker run -d --name web -p 8080:80 nginx
docker ps
docker ps -a
docker stop web
docker start web
docker restart web
docker rm web

# Logs / inspection
docker logs web
docker inspect web
docker stats web
docker top web

# Execute
docker exec -it web sh

# Networks
docker network ls
docker network create app-net
docker network inspect app-net

# Volumes
docker volume ls
docker volume create app-data
docker volume inspect app-data

# Cleanup
docker container prune
docker image prune
docker system prune
```

---

# 117. Final Docker Mental Model

```text
                           DOCKER
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
          Dockerfile        Image          Registry
              │               │               │
              ▼               ▼               │
            Build        Container           │
                              │               │
                    ┌─────────┼─────────┐     │
                    │         │         │     │
                    ▼         ▼         ▼     │
                 Network    Volume    Config  │
                    │         │         │     │
                    └─────────┼─────────┘     │
                              ▼               │
                         Application          │
                              │               │
                              ▼               │
                          Runtime             │
                              │               │
                              ▼               │
                           Host OS ◄──────────┘
```

The complete lifecycle is:

```text
SOURCE CODE
    │
    ▼
DOCKERFILE
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
REGISTRY
    │
    ▼
PULL
    │
    ▼
CONTAINER
    │
    ├── NETWORK
    ├── VOLUME
    ├── CONFIG
    └── RESOURCE LIMITS
    │
    ▼
APPLICATION
```

---

# 118. Key Takeaways

Remember these points:

### 1. Docker is not a VM

```text
Container ≠ VM
```

Containers share the host kernel.

### 2. Image and container are different

```text
Image → Container
```

### 3. Dockerfile creates images

```text
Dockerfile → docker build → Image
```

### 4. Containers run processes

```text
Container → Main Process
```

### 5. Persistent data should be externalized

```text
Container → Volume / External Storage
```

### 6. Configuration should be injected

```text
Image + Runtime Configuration
```

### 7. Registries distribute images

```text
Build → Registry → Deploy
```

### 8. Security starts before runtime

```text
Source
+
Dependencies
+
Dockerfile
+
Image
+
Registry
+
Runtime
```

### 9. Containers should generally be replaceable

```text
Old Container
     │
     ▼
New Container
```

rather than manually modifying production containers.

### 10. The image is the deployment artifact

```text
Build Once
   │
   ▼
Scan
   │
   ▼
Promote
   │
   ▼
Deploy
```

---

# 119. Related Knowledge

- [`README.md`](README.md)
- [`container.md`](container.md)
- [`image.md`](image.md)
- [`dockerfile.md`](dockerfile.md)
- [`build.md`](build.md)
- [`run.md`](run.md)
- [`network.md`](network.md)
- [`volume.md`](volume.md)
- [`registry.md`](registry.md)
