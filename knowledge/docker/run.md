# Docker Run

> **`docker run` creates and starts a container from a Docker image, while allowing you to configure its runtime behavior such as networking, environment variables, storage, resources, security, logging, and restart policy.**

This document focuses specifically on **Docker container runtime configuration with `docker run`**.

For image construction, see [`build.md`](build.md).  
For Dockerfile instructions, see [`dockerfile.md`](dockerfile.md).  
For container fundamentals, see [`container.md`](container.md).

---

# 1. What Is `docker run`?

The basic command is:

```bash
docker run IMAGE
```

Example:

```bash
docker run nginx
```

Conceptually:

```text
Docker Image
     │
     ▼
docker run
     │
     ├── Create Container
     ├── Configure Runtime
     ├── Start Process
     └── Attach / Detach
            │
            ▼
        Running Container
```

---

# 2. `docker run` Mental Model

Remember:

```text
docker build
    │
    ▼
Image
    │
    ▼
docker run
    │
    ▼
Container
    │
    ▼
Process
```

The image provides the packaged application.

`docker run` supplies runtime configuration.

---

# 3. Basic Syntax

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

Example:

```bash
docker run -d --name web nginx:1.29
```

Breakdown:

```text
docker run
   │
   ├── -d
   │    └── Detached mode
   │
   ├── --name web
   │    └── Container name
   │
   └── nginx:1.29
        └── Image
```

---

# 4. Create vs Start vs Run

These commands are related but different.

```text
docker create
     │
     ▼
Create Container
```

```text
docker start
     │
     ▼
Start Existing Container
```

```text
docker run
     │
     ├── Create
     └── Start
```

Therefore:

> **`docker run` is effectively a create-and-start operation with runtime options.**

---

# 5. Run a Simple Container

```bash
docker run nginx
```

Docker:

```text
1. Finds the image locally
2. Pulls it if required
3. Creates a container
4. Configures its runtime
5. Starts the container process
```

---

# 6. Image Pull During `docker run`

If the image does not exist locally:

```text
docker run nginx
      │
      ▼
Local Image?
   ┌──┴──┐
 Yes    No
  │      │
  ▼      ▼
Reuse   Pull
          │
          ▼
        Create
          │
          ▼
        Start
```

The exact pull behavior depends on image references and Docker configuration.

---

# 7. Container Name

Example:

```bash
docker run --name payments payments:1.0
```

Without `--name`, Docker can generate a name.

A meaningful name makes operations easier:

```bash
docker logs payments
docker exec -it payments sh
docker inspect payments
docker stop payments
```

---

# 8. Detached Mode

Use:

```bash
docker run -d nginx
```

`-d` means detached mode.

The command returns while the container continues running in the background.

---

# 9. Foreground Mode

Without `-d`:

```bash
docker run nginx
```

The terminal attaches to the container's output.

Useful for:

```text
Development
Debugging
Quick Tests
```

---

# 10. Attach vs Detach

Detached:

```bash
docker run -d nginx
```

Attach later:

```bash
docker attach <container>
```

For logs, prefer:

```bash
docker logs <container>
```

because `docker logs` does not take over the process's interactive attachment in the same way.

---

# 11. Interactive Mode

Use:

```bash
docker run -it ubuntu bash
```

Options:

```text
-i = Keep STDIN open
-t = Allocate pseudo-TTY
```

Common combination:

```bash
-it
```

---

# 12. Interactive Shell Example

```bash
docker run --rm -it ubuntu:24.04 bash
```

This starts a temporary interactive Ubuntu container.

Exit:

```bash
exit
```

With `--rm`, the container is automatically removed after it exits.

---

# 13. `--rm`

Example:

```bash
docker run --rm alpine echo "hello"
```

The container is removed after it stops.

Useful for:

```text
One-Time Commands
Testing
Build Helpers
CLI Utilities
Temporary Containers
```

Avoid `--rm` when you need the stopped container for later inspection.

---

# 14. Run a Command

Example:

```bash
docker run --rm alpine uname -a
```

The image's default command can be overridden.

Conceptually:

```text
Image
  │
  └── Default CMD
        │
        ▼
docker run command
        │
        ▼
Override
```

---

# 15. `ENTRYPOINT` and `docker run`

Suppose:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--server.port=8080"]
```

Then:

```bash
docker run myapp
```

uses the default CMD.

But:

```bash
docker run myapp --server.port=9090
```

can replace the default arguments.

---

# 16. Port Publishing

A container port is not automatically exposed to the host.

Use:

```bash
docker run -p 8080:8080 myapp
```

Meaning:

```text
Host Port 8080
      │
      ▼
Container Port 8080
```

---

# 17. Port Syntax

General:

```text
-p HOST_PORT:CONTAINER_PORT
```

Example:

```bash
docker run -p 8080:80 nginx
```

Flow:

```text
Browser
  │
  ▼
Host:8080
  │
  ▼
Container:80
  │
  ▼
Nginx
```

---

# 18. Bind Port to Specific Host Interface

Example:

```bash
docker run -p 127.0.0.1:8080:8080 myapp
```

This makes the published port reachable only through the host loopback interface.

Compare with:

```bash
docker run -p 8080:8080 myapp
```

which typically publishes on the host's available interfaces according to Docker's networking behavior.

---

# 19. Publish Multiple Ports

```bash
docker run \
  -p 8080:8080 \
  -p 8443:8443 \
  myapp
```

Example:

```text
Host 8080 → Container 8080
Host 8443 → Container 8443
```

---

# 20. UDP Ports

Specify UDP:

```bash
docker run -p 5353:5353/udp myapp
```

TCP is the usual default.

---

# 21. `EXPOSE` vs `-p`

Dockerfile:

```dockerfile
EXPOSE 8080
```

means:

```text
Documentation / Image Metadata
```

Runtime:

```bash
docker run -p 8080:8080 myapp
```

means:

```text
Actually Publish the Port
```

Therefore:

```text
EXPOSE ≠ Publish
```

---

# 22. Environment Variables

Example:

```bash
docker run \
  -e APP_ENV=production \
  myapp
```

Multiple variables:

```bash
docker run \
  -e APP_ENV=production \
  -e PORT=8080 \
  myapp
```

---

# 23. Environment Variable from Host

Example:

```bash
docker run \
  -e APP_ENV \
  myapp
```

Docker can take the value from the host environment when configured this way.

---

# 24. Environment File

Example:

```bash
docker run \
  --env-file .env \
  myapp
```

Example `.env`:

```text
APP_ENV=production
PORT=8080
LOG_LEVEL=info
```

Do not put sensitive production credentials into casually managed `.env` files.

---

# 25. Runtime Configuration

A major container principle is:

```text
Image
   │
   ▼
Immutable Application Artifact
   │
   ▼
Runtime Configuration
   │
   ├── ENV
   ├── Secrets
   ├── Volumes
   ├── Network
   └── Resources
```

This allows the same image to run in multiple environments.

---

# 26. Environment vs Secret

Normal configuration:

```text
APP_ENV=production
LOG_LEVEL=info
```

Sensitive data:

```text
DB_PASSWORD
API_TOKEN
PRIVATE_KEY
```

Do not treat ordinary environment variables as a secure secret-management system.

Use dedicated secret mechanisms for sensitive values.

---

# 27. Volume Mount

Example:

```bash
docker run \
  -v mydata:/data \
  alpine
```

This creates or uses a named Docker volume.

Flow:

```text
Docker Volume
     │
     ▼
Container /data
```

---

# 28. Bind Mount

Example:

```bash
docker run \
  -v "$(pwd)":/app \
  myapp
```

A host directory is mounted into the container.

Conceptually:

```text
Host Directory
      │
      ▼
Container /app
```

Useful for:

```text
Development
Source Code
Configuration
Specific Host Files
```

---

# 29. `--mount`

More explicit syntax:

```bash
docker run \
  --mount type=volume,src=mydata,dst=/data \
  alpine
```

Bind mount:

```bash
docker run \
  --mount type=bind,src="$(pwd)",dst=/app \
  myapp
```

`--mount` is often easier to read in complex configurations.

---

# 30. Read-Only Mount

Example:

```bash
docker run \
  --mount type=bind,src="$(pwd)/config",dst=/app/config,readonly \
  myapp
```

The container can read the files but cannot modify the mounted host data.

---

# 31. Read-Only Root Filesystem

Example:

```bash
docker run \
  --read-only \
  myapp
```

The container's root filesystem becomes read-only.

If the application requires temporary writable space, use a temporary filesystem:

```bash
docker run \
  --read-only \
  --tmpfs /tmp \
  myapp
```

---

# 32. Tmpfs

Example:

```bash
docker run \
  --tmpfs /tmp \
  myapp
```

Data exists in memory or temporary host-managed storage and is not persisted as normal container filesystem data.

Useful for:

```text
Temporary Files
Sensitive Temporary Data
Applications Requiring Writable /tmp
```

---

# 33. Named Volume vs Bind Mount

| Named Volume | Bind Mount |
|---|---|
| Managed by Docker | Managed by host filesystem |
| Good for persistent application data | Good for development/configuration |
| Docker controls storage location | User chooses host path |
| Easier portability | More host-specific |

---

# 34. Working Directory

Override image working directory:

```bash
docker run \
  -w /app \
  myapp
```

Equivalent conceptually to:

```text
Process Working Directory
      │
      ▼
/app
```

---

# 35. User

Override the image user:

```bash
docker run \
  --user 10001:10001 \
  myapp
```

This is useful when testing least-privilege behavior.

---

# 36. Container Hostname

Example:

```bash
docker run \
  --hostname payments-01 \
  myapp
```

Inside the container:

```bash
hostname
```

returns the configured hostname.

---

# 37. Container DNS

Containers connected to Docker networks can resolve other containers through Docker's embedded DNS in user-defined networks.

Example:

```text
payments
    │
    ▼
database
```

Application can often connect using:

```text
database:5432
```

rather than an IP address.

---

# 38. Network Selection

Default:

```bash
docker run myapp
```

Use a specific network:

```bash
docker run \
  --network app-net \
  myapp
```

---

# 39. Create a Network

```bash
docker network create app-net
```

Then:

```bash
docker run -d \
  --name db \
  --network app-net \
  postgres:18
```

and:

```bash
docker run -d \
  --name payments \
  --network app-net \
  payments:1.0
```

The application can use:

```text
db:5432
```

as the database endpoint.

---

# 40. Network Isolation

Containers can be separated into networks.

Example:

```text
Frontend Network
      │
      ▼
Backend Network
      │
      ▼
Database Network
```

Network design should follow application communication requirements.

---

# 41. Host Network

Example:

```bash
docker run \
  --network host \
  myapp
```

The container shares the host's network namespace on supported Linux environments.

Trade-offs:

```text
Less Network Isolation
Potentially Simpler Networking
Platform-Specific Behavior
```

Use deliberately.

---

# 42. None Network

Example:

```bash
docker run \
  --network none \
  alpine
```

The container gets no normal external network connectivity.

Useful for:

```text
Isolation
Offline Processing
Security-Sensitive Jobs
```

---

# 43. Restart Policies

Example:

```bash
docker run \
  --restart unless-stopped \
  myapp
```

Common policies:

```text
no
always
on-failure
unless-stopped
```

---

# 44. `--restart no`

Default behavior is generally:

```text
Container exits
    │
    ▼
Remain stopped
```

Useful for one-time jobs.

---

# 45. `--restart on-failure`

Example:

```bash
docker run \
  --restart on-failure:5 \
  myapp
```

The container can restart when it exits with a failure status, subject to the configured retry count.

---

# 46. `--restart always`

Example:

```bash
docker run \
  --restart always \
  myapp
```

Docker attempts to restart the container when it stops.

Use carefully; an application that continuously crashes can create a restart loop.

---

# 47. `--restart unless-stopped`

Example:

```bash
docker run \
  --restart unless-stopped \
  myapp
```

This is commonly used for long-running services on Docker hosts.

---

# 48. Resource Limits

Containers share host resources.

Without limits:

```text
Container
   │
   ├── CPU
   └── Memory
```

A workload can potentially consume excessive resources.

Use:

```text
CPU Limits
Memory Limits
PID Limits
```

where appropriate.

---

# 49. Memory Limit

Example:

```bash
docker run \
  --memory 512m \
  myapp
```

This limits the container's memory according to Docker's runtime configuration.

---

# 50. Memory + Swap

Example:

```bash
docker run \
  --memory 512m \
  --memory-swap 512m \
  myapp
```

The exact semantics depend on host kernel and Docker configuration.

Resource limits should be tested under realistic workloads.

---

# 51. CPU Limit

Example:

```bash
docker run \
  --cpus 1.5 \
  myapp
```

This constrains CPU consumption.

---

# 52. CPU Shares / Weight

Docker also supports CPU scheduling controls such as CPU weight.

These controls are different from a hard CPU limit.

Conceptually:

```text
CPU Limit
   └── Maximum allocation

CPU Weight
   └── Relative priority under contention
```

---

# 53. CPU Pinning

Example:

```bash
docker run \
  --cpuset-cpus="0,1" \
  myapp
```

This restricts the container to selected CPUs.

Useful for:

```text
Performance Isolation
Specialized Workloads
Benchmarking
```

---

# 54. PID Limit

Example:

```bash
docker run \
  --pids-limit 200 \
  myapp
```

This limits the number of processes the container can create.

It can help reduce process-exhaustion risks.

---

# 55. Ulimits

Example:

```bash
docker run \
  --ulimit nofile=65535:65535 \
  myapp
```

Ulimits control process-level resource limits.

Common examples:

```text
Open Files
Processes
Core Dumps
```

---

# 56. Shared Memory

Containers may use `/dev/shm`.

Configure size:

```bash
docker run \
  --shm-size=256m \
  myapp
```

This can matter for:

```text
Browsers
Databases
Parallel Processing
Applications Using Shared Memory
```

---

# 57. Logging Driver

Docker can configure logging drivers.

Example:

```bash
docker run \
  --log-driver json-file \
  myapp
```

Other environments may use drivers such as:

```text
local
syslog
journald
fluentd
gelf
awslogs
splunk
```

Available options depend on Docker and host configuration.

---

# 58. Log Rotation

For the `json-file` driver, configure limits where appropriate.

Example:

```bash
docker run \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp
```

This helps prevent container logs from consuming unlimited disk space.

---

# 59. Application Logging Principle

Prefer:

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
Logging System
```

Avoid relying on log files inside the ephemeral container filesystem.

---

# 60. Labels

Runtime labels:

```bash
docker run \
  --label team=payments \
  --label environment=production \
  myapp
```

Useful for:

```text
Organization
Automation
Operations
Filtering
Inventory
```

---

# 61. Environment File + Labels

Example:

```bash
docker run \
  --env-file production.env \
  --label app=payments \
  --label environment=production \
  myapp:1.5.0
```

This makes runtime configuration and metadata explicit.

---

# 62. Container Capabilities

Linux containers can run with a reduced set of capabilities.

Example:

```bash
docker run \
  --cap-drop ALL \
  myapp
```

Then add only what is required:

```bash
docker run \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  myapp
```

Use capability changes only after understanding the application's requirements.

---

# 63. Why Capabilities Matter

Root inside a container is not equivalent to unrestricted host root, but excessive privileges can still increase risk.

Principle:

```text
Required Capability
       │
       ▼
Grant Only What Is Needed
```

---

# 64. `--privileged`

Example:

```bash
docker run --privileged myapp
```

This grants broad additional privileges and changes isolation characteristics significantly.

Avoid it unless the workload genuinely requires it.

---

# 65. `--security-opt`

Security options can configure runtime security behavior.

Examples can involve:

```text
Seccomp
AppArmor
SELinux
```

Example:

```bash
docker run \
  --security-opt no-new-privileges:true \
  myapp
```

---

# 66. No New Privileges

Example:

```bash
docker run \
  --security-opt no-new-privileges:true \
  myapp
```

This helps prevent processes from gaining additional privileges through mechanisms such as setuid binaries.

It is a useful defense-in-depth control.

---

# 67. Seccomp

Docker can use seccomp profiles to restrict system calls.

Conceptually:

```text
Container Process
      │
      ▼
System Calls
      │
      ▼
Seccomp Policy
   ┌──┴───┐
Allow   Block
```

This reduces the kernel attack surface.

---

# 68. AppArmor / SELinux

Depending on the Linux host:

```text
AppArmor
SELinux
```

can provide mandatory access controls.

Docker runtime security should be aligned with the host security architecture.

---

# 69. Read-Only Root Filesystem

Example:

```bash
docker run \
  --read-only \
  myapp
```

Combine with writable temporary areas:

```bash
docker run \
  --read-only \
  --tmpfs /tmp \
  myapp
```

This can significantly reduce opportunities for filesystem tampering.

---

# 70. Dropping Capabilities + Read-Only

A stronger runtime pattern:

```bash
docker run \
  --read-only \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  myapp
```

Add only the permissions and writable locations the application actually needs.

---

# 71. Health Checks at Runtime

If the image has a `HEALTHCHECK`, Docker tracks container health.

Inspect:

```bash
docker inspect myapp
```

Look for health status information.

---

# 72. Runtime Health Check Override

You can disable an image-defined health check:

```bash
docker run \
  --no-healthcheck \
  myapp
```

Use this deliberately; disabling health checks can remove an important operational signal.

---

# 73. Stop Timeout

Docker can give a process time to shut down gracefully.

Example:

```bash
docker stop -t 30 myapp
```

Conceptually:

```text
SIGTERM
   │
   ▼
Graceful Shutdown
   │
   ▼
Timeout
   │
   ▼
SIGKILL if still running
```

The exact signal behavior depends on the runtime and container process.

---

# 74. Graceful Shutdown

A good containerized application should:

```text
Receive SIGTERM
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
Exit
```

Avoid unnecessary shell wrappers that interfere with signal propagation.

---

# 75. Init Process

Some applications need an init process to handle child processes and signal forwarding.

Docker can use:

```bash
docker run --init myapp
```

This adds an init process in supported Docker configurations.

Useful for workloads that spawn child processes.

---

# 76. Process Model

A container is fundamentally a process isolation mechanism.

Conceptually:

```text
Container
   │
   └── PID 1
        │
        ├── Child
        ├── Child
        └── Child
```

PID 1 has special signal and child-reaping responsibilities on Linux.

---

# 77. Runtime Filesystem

At runtime:

```text
Image Layers
    │
    ▼
Container Writable Layer
    │
    ├── Temporary Changes
    └── Runtime Files
```

Container filesystem changes disappear when the container is removed unless persisted externally.

---

# 78. Persistent Data

For persistent data:

```text
Container
    │
    ▼
Named Volume
    │
    ▼
Host Storage
```

Example:

```bash
docker run \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:18
```

---

# 79. Stateful vs Stateless Containers

Stateless:

```text
Container
   │
   └── Application
```

Data usually lives outside the container.

Stateful:

```text
Container
   │
   └── Application
         │
         ▼
       Volume
```

For production databases, evaluate whether Docker standalone is appropriate versus an orchestrated or managed database service.

---

# 80. Bind Mount Security

A bind mount can expose host files to the container.

Dangerous example:

```bash
docker run \
  -v /:/host \
  myapp
```

This provides extremely broad host filesystem access.

Avoid unnecessary host mounts.

---

# 81. Docker Socket

Mounting:

```bash
-v /var/run/docker.sock:/var/run/docker.sock
```

can allow a container to communicate with the Docker daemon.

This is highly privileged and can effectively provide broad control over the Docker host.

Avoid unless absolutely necessary and properly isolated.

---

# 82. Environment Variable Leakage

Be careful with:

```bash
docker inspect
```

Environment variables configured on a container may be visible through container metadata to users with sufficient Docker access.

Do not treat environment variables as secret storage merely because they are not visible in the application source.

---

# 83. Container Name Conflicts

Example:

```bash
docker run --name payments payments:1.0
```

If `payments` already exists:

```text
Name Conflict
```

Check:

```bash
docker ps -a
```

Remove or rename the existing container.

---

# 84. Port Conflicts

If host port `8080` is already in use:

```bash
docker run -p 8080:8080 myapp
```

may fail.

Use another host port:

```bash
docker run -p 8081:8080 myapp
```

Now:

```text
Host 8081 → Container 8080
```

---

# 85. Container Exit

List stopped containers:

```bash
docker ps -a
```

Inspect:

```bash
docker inspect myapp
```

Check logs:

```bash
docker logs myapp
```

Check exit code:

```bash
docker inspect \
  --format='{{.State.ExitCode}}' \
  myapp
```

---

# 86. Common Exit Codes

Examples:

```text
0    → Normal completion

1    → Generic application error

125  → Docker run itself failed

126  → Command cannot be invoked

127  → Command not found

137  → Often SIGKILL / possible OOM

143  → Often SIGTERM
```

Exit codes should be interpreted in context.

---

# 87. OOMKilled

Inspect:

```bash
docker inspect myapp
```

Look for:

```text
OOMKilled
```

If the process exceeds its memory constraints, it may be terminated.

Troubleshooting:

```text
Check Memory Limit
Check Application Memory
Check JVM / Runtime Settings
Check Workload
Check Host Memory
```

---

# 88. `docker stats`

Monitor resource usage:

```bash
docker stats
```

Example information:

```text
CPU
Memory
Network I/O
Block I/O
PIDs
```

Useful for runtime troubleshooting.

---

# 89. `docker top`

View processes:

```bash
docker top myapp
```

This can help identify:

```text
Main Process
Child Processes
Process IDs
```

---

# 90. `docker exec`

Execute a command in a running container:

```bash
docker exec myapp ls /app
```

Interactive shell:

```bash
docker exec -it myapp sh
```

Use `exec` for debugging, not as the normal application startup mechanism.

---

# 91. Minimal Images and `docker exec`

A distroless image may not contain:

```text
sh
bash
ls
curl
ps
```

Therefore:

```bash
docker exec -it myapp sh
```

may fail.

This is one reason production debugging should use appropriate external observability and specialized debugging techniques.

---

# 92. `docker logs`

Example:

```bash
docker logs myapp
```

Follow:

```bash
docker logs -f myapp
```

Show timestamps:

```bash
docker logs -t myapp
```

Limit recent logs:

```bash
docker logs --tail 100 myapp
```

---

# 93. Inspect Runtime Configuration

Useful:

```bash
docker inspect myapp
```

You can inspect:

```text
Network
Mounts
Environment
Entrypoint
Command
State
Health
Labels
Resources
```

---

# 94. Runtime Configuration Summary

A production `docker run` may configure:

```text
Identity
├── Name
├── Hostname
└── User

Networking
├── Ports
├── Network
├── DNS
└── Hostname

Storage
├── Volumes
├── Bind Mounts
├── tmpfs
└── Read-Only Root

Resources
├── Memory
├── CPU
├── PIDs
└── Ulimits

Security
├── Capabilities
├── Seccomp
├── AppArmor / SELinux
├── No New Privileges
└── Privileged Mode

Lifecycle
├── Restart
├── Stop Timeout
└── Init

Observability
├── Logs
├── Health
└── Labels
```

---

# 95. Production `docker run` Example

Example:

```bash
docker run -d \
  --name payments \
  --restart unless-stopped \
  --read-only \
  --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --memory 512m \
  --cpus 1.0 \
  --pids-limit 200 \
  -e APP_ENV=production \
  -p 127.0.0.1:8080:8080 \
  payments:1.5.0
```

This is an example pattern, not a universal production command.

Always test application compatibility before applying restrictive settings.

---

# 96. Production Runtime Principles

A production container should generally aim for:

```text
Non-Root
Least Privilege
Minimal Writable Filesystem
Controlled Resources
Explicit Network Exposure
Controlled Restart Policy
Centralized Logging
Health Monitoring
Immutable Image
Externalized Configuration
Secure Secrets
```

---

# 97. Development `docker run`

Development often needs:

```text
Source Bind Mount
Interactive Mode
Port Publishing
Environment File
Debug Port
Fast Restart
```

Example:

```bash
docker run --rm -it \
  --name payments-dev \
  -p 8080:8080 \
  -v "$(pwd)":/workspace \
  --env-file .env.dev \
  payments-dev:latest
```

Development and production runtime settings should not be assumed to be identical.

---

# 98. Database Example

Example PostgreSQL container:

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=example \
  -v postgres-data:/var/lib/postgresql/data \
  -p 127.0.0.1:5432:5432 \
  postgres:18
```

For real environments, use secure secret management instead of putting actual passwords directly in the command line.

---

# 99. Application + Database

Create network:

```bash
docker network create app-net
```

Database:

```bash
docker run -d \
  --name db \
  --network app-net \
  -v db-data:/var/lib/postgresql/data \
  postgres:18
```

Application:

```bash
docker run -d \
  --name payments \
  --network app-net \
  -e DB_HOST=db \
  -e DB_PORT=5432 \
  payments:1.5.0
```

The application can resolve:

```text
db
```

through the user-defined Docker network.

---

# 100. Reverse Proxy Example

```text
Internet
   │
   ▼
Host:443
   │
   ▼
Nginx Container
   │
   ▼
Application Container
   │
   ▼
Database
```

Typical runtime configuration:

```text
Nginx
 └── Published ports

Application
 └── Internal network

Database
 └── Internal network + volume
```

---

# 101. Network Security Pattern

Avoid exposing every service:

```text
Bad:

Internet
 │
 ├── Web
 ├── App
 └── Database
```

Prefer:

```text
Internet
 │
 ▼
Web
 │
 ▼
App
 │
 ▼
Database
```

Only publish ports that external clients actually need.

---

# 102. Runtime Secrets

Possible secret mechanisms include:

```text
Docker secrets in Swarm
External Secret Managers
Kubernetes Secrets + External Secret Systems
Cloud Secret Managers
Vault
```

The appropriate solution depends on the orchestration and deployment environment.

---

# 103. Runtime Configuration vs Image Rebuild

Suppose production changes:

```text
DB_HOST
```

Do not rebuild the image simply because the runtime endpoint changed.

Prefer:

```text
Same Image
   │
   ├── Dev DB_HOST
   ├── Test DB_HOST
   └── Prod DB_HOST
```

This supports immutable deployment artifacts.

---

# 104. Container Lifecycle

A container moves through states such as:

```text
Created
   │
   ▼
Running
   │
   ├── Paused
   │
   ▼
Stopped
   │
   ▼
Removed
```

Commands:

```bash
docker create
docker start
docker stop
docker restart
docker rm
```

`docker run` combines creation and startup.

---

# 105. Stop vs Kill

Graceful:

```bash
docker stop myapp
```

Forceful:

```bash
docker kill myapp
```

Prefer `stop` for normal operations.

Use `kill` when graceful shutdown is unavailable or the process is stuck.

---

# 106. Restart

```bash
docker restart myapp
```

This effectively stops and starts the container according to Docker's restart behavior.

It does not create a new container identity.

---

# 107. Remove

```bash
docker rm myapp
```

Force removal:

```bash
docker rm -f myapp
```

Be careful with volumes and persistent data.

---

# 108. Container Identity

A container has:

```text
Container ID
Name
Image Reference
Created Time
Network Identity
Filesystem State
```

Recreating a container gives it a new container identity.

The image can remain the same.

---

# 109. Immutable Image, Disposable Container

A common container principle:

```text
Image
  │
  ▼
Container
  │
  ▼
Work
  │
  ▼
Replace Container
```

Do not manually repair production containers as if they were traditional servers.

Prefer:

```text
Fix Source / Image
      │
      ▼
Build New Image
      │
      ▼
Replace Container
```

---

# 110. Container Recreation

Suppose:

```text
payments:1.0
```

has a bug.

Preferred:

```text
Source Fix
   │
   ▼
Build payments:1.0.1
   │
   ▼
Test
   │
   ▼
Stop Old Container
   │
   ▼
Run New Container
```

This provides traceability.

---

# 111. Runtime Configuration Drift

Manual changes inside a running container create drift.

Example:

```bash
docker exec payments sh
# manually modify files
```

Now:

```text
Running Container
    ≠
Original Image
```

Prefer changing the Dockerfile/application and rebuilding.

---

# 112. Runtime Debugging vs Permanent Changes

`docker exec` is excellent for:

```text
Inspecting
Testing
Debugging
```

But changes made inside a container should generally not be considered production configuration.

Use source-controlled configuration and image builds for permanent changes.

---

# 113. `docker run` Security Checklist

```text
[ ] Use trusted image
[ ] Prefer exact version
[ ] Record image digest
[ ] Run as non-root
[ ] Drop unnecessary capabilities
[ ] Avoid --privileged
[ ] Use no-new-privileges
[ ] Consider read-only root filesystem
[ ] Mount only required host paths
[ ] Avoid Docker socket mounts
[ ] Limit CPU
[ ] Limit memory
[ ] Limit PIDs
[ ] Publish only required ports
[ ] Use secure secrets
[ ] Configure log rotation
[ ] Configure restart policy
[ ] Monitor health
```

---

# 114. Common `docker run` Anti-Patterns

## `--privileged` Everywhere

```bash
docker run --privileged myapp
```

Problem:

```text
Excessive Privileges
```

---

## Publishing Everything

```bash
-p 0.0.0.0:5432:5432
```

for a database that should be internal.

Problem:

```text
Unnecessary Network Exposure
```

---

## Host Root Mount

```bash
-v /:/host
```

Problem:

```text
Extremely Broad Host Access
```

---

## Docker Socket Mount

```bash
-v /var/run/docker.sock:/var/run/docker.sock
```

Problem:

```text
Potential Broad Docker Host Control
```

---

## Running as Root

```bash
--user root
```

without need.

---

## No Resource Limits

A runaway container can consume excessive host resources.

---

# 115. Troubleshooting Decision Tree

```text
Container Does Not Start
        │
        ▼
Is Image Available?
   ┌────┴────┐
  No        Yes
   │          │
 Pull       Inspect
              │
              ▼
       Is Command Correct?
          ┌───┴───┐
         No      Yes
          │        │
       Fix       Check
                 Logs
                   │
                   ▼
             Resource / Network /
             Permission / Config
```

---

# 116. Container Starts Then Stops

Check:

```bash
docker ps -a
docker logs myapp
docker inspect myapp
```

Questions:

```text
Did the application crash?
Did the command finish?
Was a required environment variable missing?
Was a file missing?
Was the process killed?
Was it OOMKilled?
```

---

# 117. Cannot Connect to Port

Check:

```text
1. Application listening address
2. Container port
3. `-p` mapping
4. Firewall
5. Network
6. Application startup
7. Health
```

Example:

```bash
docker port myapp
```

---

# 118. Cannot Connect Between Containers

Check:

```text
1. Same Docker network?
2. Correct container name?
3. Correct port?
4. Application listening on correct interface?
5. DNS resolution?
6. Firewall/security configuration?
```

Example:

```bash
docker exec payments getent hosts db
```

The availability of `getent` depends on the image.

---

# 119. Volume Permission Problem

Symptoms:

```text
Permission denied
```

Check:

```text
Container USER
Host Directory Ownership
Volume Ownership
Mount Mode
Read-Only Settings
```

Potential solution:

```dockerfile
COPY --chown=10001:10001 ...
```

or correctly initialize volume ownership.

---

# 120. Read-Only Filesystem Failure

If:

```bash
docker run --read-only myapp
```

fails, identify which paths need temporary or persistent writes.

Use:

```text
--tmpfs
Named Volume
Read-Write Mount
```

only where required.

---

# 121. Memory Failure

Check:

```bash
docker stats
docker inspect myapp
```

Look for:

```text
Memory Limit
OOMKilled
Application Heap
Workload Size
```

---

# 122. CPU Throttling

If performance is poor:

```text
Check CPU Limit
Check CPU Usage
Check Host Contention
Check Application Threads
```

A too-low CPU limit can make an otherwise healthy application appear slow.

---

# 123. Restart Loop

Symptoms:

```text
Container starts
    │
    ▼
Container exits
    │
    ▼
Restart
    │
    ▼
Exits again
```

Check:

```bash
docker logs myapp
docker inspect myapp
```

Look for:

```text
Application Error
Missing Configuration
Dependency Failure
Health Failure
OOM
Bad Entrypoint
```

---

# 124. Production Run Example with Environment and Volume

```bash
docker run -d \
  --name payments \
  --restart unless-stopped \
  --network app-net \
  --env-file production.env \
  --mount type=volume,src=payments-data,dst=/var/lib/payments \
  --read-only \
  --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --memory 1g \
  --cpus 2 \
  -p 127.0.0.1:8080:8080 \
  payments:1.5.0
```

This demonstrates a hardened pattern, but every option must be validated against the application's needs.

---

# 125. `docker run` and CI/CD

For test jobs:

```bash
docker run --rm \
  --network test-net \
  myapp:test
```

The CI pipeline can:

```text
Build
 │
 ▼
Run Container
 │
 ▼
Smoke Test
 │
 ▼
Integration Test
 │
 ▼
Stop / Remove
```

---

# 126. Runtime Smoke Test

Example:

```bash
docker run -d \
  --name myapp-test \
  -p 18080:8080 \
  myapp:test
```

Then:

```bash
curl http://localhost:18080/health
```

Finally:

```bash
docker rm -f myapp-test
```

This verifies that the image can actually start.

---

# 127. Runtime Security Pipeline

```text
IMAGE
  │
  ▼
docker run / Deployment
  │
  ├── Non-Root
  ├── Capabilities
  ├── Seccomp
  ├── Read-Only
  ├── Resource Limits
  └── Network Restrictions
  │
  ▼
RUNNING CONTAINER
  │
  ├── Logs
  ├── Metrics
  ├── Health
  └── Runtime Security
```

---

# 128. `docker run` vs Kubernetes

`docker run` is useful for:

```text
Local Development
Testing
Small Standalone Hosts
Troubleshooting
Simple Services
```

Kubernetes adds:

```text
Scheduling
Self-Healing
Rolling Updates
Service Discovery
Secrets
ConfigMaps
Horizontal Scaling
Desired-State Management
```

Conceptually:

```text
docker run
    │
    └── One Host / Direct Runtime Control

Kubernetes
    │
    └── Cluster / Declarative Orchestration
```

---

# 129. Docker Run and Desired State

`docker run` is imperative:

```text
"Start this container with these options."
```

Kubernetes is declarative:

```text
"I want three replicas of this workload."
```

The orchestrator continuously works toward the desired state.

---

# 130. Docker Run Command Composition

A complex command can be mentally grouped as:

```bash
docker run \
  [IDENTITY] \
  [LIFECYCLE] \
  [NETWORK] \
  [STORAGE] \
  [CONFIGURATION] \
  [SECURITY] \
  [RESOURCES] \
  [OBSERVABILITY] \
  IMAGE \
  [COMMAND]
```

Example:

```bash
docker run -d \
  --name payments \
  --restart unless-stopped \
  --network app-net \
  --mount type=volume,src=payments-data,dst=/data \
  --env-file production.env \
  --read-only \
  --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --memory 512m \
  --cpus 1 \
  -p 127.0.0.1:8080:8080 \
  payments:1.5.0
```

---

# 131. Complete `docker run` Mental Model

```text
                         docker run
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       IMAGE             IDENTITY           LIFECYCLE
          │                  │                  │
          │                  ├── Name           ├── Restart
          │                  └── Hostname       ├── Init
          │                                     └── Stop
          │
          ├──────────────────┬──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       NETWORK            STORAGE          CONFIGURATION
          │                  │                  │
       Ports              Volumes              ENV
       DNS                Bind Mounts          Secrets
       Network            tmpfs                User
       Mode               Read-Only            Workdir
          │
          ├──────────────────┬──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       RESOURCES          SECURITY         OBSERVABILITY
          │                  │                  │
       CPU                 Caps               Logs
       Memory              Seccomp            Health
       PIDs                AppArmor           Stats
       Ulimits             No-New-Privs       Labels
          │
          └──────────────────┬──────────────────┘
                             ▼
                         CONTAINER
                             │
                             ▼
                           PROCESS
```

---

# 132. Complete Runtime Lifecycle

```text
IMAGE
  │
  ▼
docker run
  │
  ▼
CREATE CONTAINER
  │
  ├── Filesystem
  ├── Network
  ├── Environment
  ├── Mounts
  ├── Resources
  └── Security
  │
  ▼
START PID 1
  │
  ▼
RUN
  │
  ├── Logs
  ├── Metrics
  ├── Health
  └── Application Work
  │
  ▼
STOP
  │
  ▼
REMOVE / RECREATE
```

---

# 133. Production Runtime Checklist

```text
Identity
[ ] Meaningful name
[ ] Correct image version
[ ] Image digest recorded

Networking
[ ] Only required ports published
[ ] Correct network
[ ] Internal services not unnecessarily exposed
[ ] DNS/service names correct

Storage
[ ] Persistent data externalized
[ ] Required mounts read-only
[ ] No unnecessary host paths
[ ] No Docker socket unless absolutely required

Security
[ ] Non-root
[ ] Drop capabilities
[ ] No privileged mode
[ ] No-new-privileges
[ ] Read-only root where possible
[ ] Appropriate seccomp/AppArmor/SELinux

Resources
[ ] Memory limit
[ ] CPU limit
[ ] PID limit
[ ] Ulimits if required

Lifecycle
[ ] Restart policy
[ ] Graceful shutdown
[ ] Stop timeout
[ ] Init process if needed

Observability
[ ] Logs
[ ] Log rotation
[ ] Health check
[ ] Metrics
[ ] Labels
```

---

# 134. Interview Questions

## Beginner

### What does `docker run` do?

It creates and starts a container from an image with specified runtime configuration.

### What is `-d`?

Detached mode.

### What does `-p 8080:8080` mean?

It publishes host port `8080` to container port `8080`.

### What does `--rm` do?

It removes the container automatically after it exits.

### What does `-it` mean?

Interactive STDIN plus a pseudo-TTY.

---

## Intermediate

### What is the difference between `docker run` and `docker create`?

`docker create` creates a container without starting it; `docker run` creates and starts it.

### What is the difference between a volume and bind mount?

A volume is Docker-managed storage; a bind mount maps a host path.

### What does `--restart unless-stopped` do?

It configures Docker to restart the container unless it has been intentionally stopped, subject to Docker's restart behavior.

### What is `--read-only`?

It makes the container root filesystem read-only.

---

## Advanced

### Why should production containers avoid `--privileged`?

It grants broad additional privileges and weakens isolation.

### Why drop Linux capabilities?

To reduce the privileges available to a compromised process.

### Why use `no-new-privileges`?

To prevent processes from gaining additional privileges through mechanisms such as setuid.

### Why is mounting `/var/run/docker.sock` dangerous?

It can provide broad control over the Docker daemon and therefore potentially the host.

### Why should application logs go to stdout/stderr?

It allows the container runtime and external logging systems to collect them consistently.

### Why should containers be treated as disposable?

The image should be the source of truth; permanent manual changes inside running containers create configuration drift.

---

# 135. Key Takeaways

Remember:

```text
1. docker run creates and starts a container.

2. The image provides the application artifact.

3. Runtime options provide environment-specific configuration.

4. -d runs in detached mode.

5. -it provides interactive terminal behavior.

6. --rm removes temporary containers after exit.

7. -p publishes container ports.

8. EXPOSE does not publish ports.

9. -e and --env-file configure environment variables.

10. Volumes persist data beyond the container lifecycle.

11. Bind mounts expose host paths and should be used carefully.

12. --read-only reduces writable filesystem attack surface.

13. --tmpfs provides temporary writable storage.

14. --network controls network attachment.

15. User-defined networks provide useful container-to-container DNS.

16. --restart controls container restart behavior.

17. CPU, memory and PID limits protect host resources.

18. Run as non-root where possible.

19. Drop unnecessary capabilities.

20. Avoid --privileged.

21. Avoid unnecessary Docker socket mounts.

22. Use no-new-privileges where appropriate.

23. Log to stdout/stderr.

24. Monitor health and resources.

25. Prefer graceful shutdown.

26. Treat containers as disposable runtime instances.

27. Fix applications by rebuilding images, not manually modifying production containers.

28. Record the exact image digest for production deployments.

29. Use the same image across environments and change runtime configuration instead of rebuilding unnecessarily.

30. `docker run` is imperative runtime configuration; orchestration platforms provide higher-level desired-state management.
```

The core runtime flow is:

```text
IMAGE
  │
  ▼
docker run
  │
  ├── Network
  ├── Storage
  ├── Environment
  ├── Resources
  ├── Security
  ├── Lifecycle
  └── Observability
  │
  ▼
CONTAINER
  │
  ▼
APPLICATION PROCESS
  │
  ├── Logs
  ├── Health
  ├── Metrics
  └── Work
  │
  ▼
STOP / RECREATE
```

> **`docker run` is the bridge between a static container image and a configured runtime workload. A production-quality run configuration should explicitly control networking, storage, resources, security, lifecycle, and observability.**

---

# 136. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`container.md`](container.md)
- [`image.md`](image.md)
- [`dockerfile.md`](dockerfile.md)
- [`build.md`](build.md)
- [`network.md`](network.md)
- [`volume.md`](volume.md)
- [`registry.md`](registry.md)
