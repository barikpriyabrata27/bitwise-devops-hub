# Dockerfile

> **A Dockerfile is a text file containing declarative instructions used by a container image builder to construct a Docker image.**

This document provides a detailed guide to Dockerfiles: syntax, instructions, build context, caching, multi-stage builds, security, secrets, optimization, troubleshooting, and production patterns.

For the broader Docker platform, see [`docker-and-containers.md`](docker-and-containers.md).

---

# 1. What Is a Dockerfile?

A Dockerfile describes how to build a container image.

Conceptually:

```text
Dockerfile
    │
    ▼
Docker Build / BuildKit
    │
    ▼
Container Image
    │
    ▼
Container
```

Example:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY app.jar .

USER 10001

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

# 2. Dockerfile Mental Model

Remember:

```text
Dockerfile = Image Build Instructions

Image = Result of the Build

Container = Runtime Instance
```

Therefore:

```text
Dockerfile
    │
    ├── FROM
    ├── COPY
    ├── RUN
    ├── ENV
    ├── USER
    ├── ENTRYPOINT
    └── CMD
          │
          ▼
        IMAGE
          │
          ▼
      CONTAINER
```

---

# 3. Dockerfile Basic Syntax

Typical syntax:

```dockerfile
INSTRUCTION arguments
```

Examples:

```dockerfile
FROM ubuntu:24.04

WORKDIR /app

COPY . .

RUN apt-get update
```

Instructions are generally written in uppercase by convention, although Dockerfile instruction keywords are case-insensitive.

---

# 4. Comments

Use:

```dockerfile
# Install runtime dependencies
RUN apt-get update
```

Comments are useful for explaining non-obvious decisions.

Avoid excessive comments that simply repeat what the instruction already says.

---

# 5. Dockerfile File Name

The default file name is:

```text
Dockerfile
```

Build:

```bash
docker build -t myapp:1.0 .
```

A custom Dockerfile can be specified with:

```bash
docker build -f Dockerfile.prod -t myapp:1.0 .
```

---

# 6. Build Context

The final `.` in:

```bash
docker build -t myapp:1.0 .
```

represents the build context.

Conceptually:

```text
Project Directory
│
├── Dockerfile
├── source
├── pom.xml
├── README.md
└── .dockerignore
        │
        ▼
    Build Context
        │
        ▼
      Builder
```

Only files available to the build context can normally be referenced by `COPY` and `ADD`.

---

# 7. Why Build Context Matters

A large build context can cause:

```text
Slower Builds
More Data Transferred
Higher Resource Usage
Potential Accidental File Exposure
```

Keep the context small.

Use:

```text
.dockerignore
```

to exclude unnecessary files.

---

# 8. `.dockerignore`

Example:

```text
.git
.gitignore
node_modules
target
*.log
.env
*.pem
README.md
```

Benefits:

```text
Smaller Context
Faster Builds
Reduced Accidental Exposure
```

Important:

> `.dockerignore` is not a secret-management system. Sensitive files should not be placed in the build context unless there is a deliberate, secure reason.

---

# 9. `FROM`

`FROM` defines the base image for a build stage.

Example:

```dockerfile
FROM ubuntu:24.04
```

Java:

```dockerfile
FROM eclipse-temurin:21-jre
```

Node.js:

```dockerfile
FROM node:24-alpine
```

---

# 10. `FROM` and Multi-Stage Builds

A Dockerfile can contain multiple `FROM` instructions.

Example:

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

# Build application

FROM eclipse-temurin:21-jre

# Runtime image
```

Each `FROM` starts a new build stage.

---

# 11. `FROM scratch`

`scratch` represents an empty base.

Example:

```dockerfile
FROM scratch
COPY mybinary /mybinary
ENTRYPOINT ["/mybinary"]
```

It can be useful for statically linked binaries.

However:

```text
No Shell
No Package Manager
No Standard Userland
```

Therefore debugging and compatibility can be difficult.

---

# 12. Base Image Selection

Consider:

```text
Security
Compatibility
Support Lifecycle
Size
Architecture
Debugging Requirements
Operational Standards
```

Do not choose a base image solely because it is the smallest.

---

# 13. Pinning `FROM`

Less controlled:

```dockerfile
FROM ubuntu:latest
```

More controlled:

```dockerfile
FROM ubuntu:24.04
```

More reproducible:

```dockerfile
FROM ubuntu:24.04@sha256:...
```

Digest pinning improves reproducibility, but organizations need a process to update pinned images for security patches.

---

# 14. `AS`

Assign a name to a build stage:

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
```

Then reference it:

```dockerfile
COPY --from=build /src/target/app.jar /app/app.jar
```

---

# 15. `RUN`

`RUN` executes commands during image construction.

Example:

```dockerfile
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

The result becomes part of the image filesystem.

---

# 16. Why `RUN` Matters

`RUN` is used for:

```text
Installing Packages
Compiling Source
Generating Artifacts
Creating Directories
Setting Permissions
Building Applications
```

Example:

```dockerfile
RUN mvn package
```

---

# 17. Combine Related Package Operations

Instead of:

```dockerfile
RUN apt-get update
RUN apt-get install -y curl
```

prefer:

```dockerfile
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

Benefits:

```text
Package Metadata and Installation
in One Logical Build Step
```

This can prevent unnecessary package-manager cache from remaining in the resulting filesystem.

---

# 18. Do Not Use `apt-get upgrade` Blindly

Avoid patterns such as:

```dockerfile
RUN apt-get update && apt-get upgrade -y
```

unless your image maintenance strategy explicitly requires it.

Prefer:

```text
Use an updated base image
+
Install required packages
```

This makes base-image patching more predictable.

---

# 19. `COPY`

`COPY` copies files from the build context or another build stage into the image.

Example:

```dockerfile
COPY app.jar /app/app.jar
```

Multiple files:

```dockerfile
COPY package.json package-lock.json ./
```

---

# 20. `COPY --from`

Copy from another stage:

```dockerfile
COPY --from=build /src/target/app.jar /app/app.jar
```

This is central to multi-stage builds.

---

# 21. `COPY` from a Build Stage

Example:

```dockerfile
FROM node:24 AS build

WORKDIR /app
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
```

Final image contains the runtime artifact, not necessarily the entire Node.js build environment.

---

# 22. `ADD`

`ADD` can copy files and has additional behavior, including archive extraction in supported cases and URL-related behavior depending on syntax and builder.

Example:

```dockerfile
ADD archive.tar.gz /app/
```

For ordinary file copying, prefer:

```dockerfile
COPY
```

because the intent is clearer.

---

# 23. `COPY` vs `ADD`

| Instruction | Typical Use |
|---|---|
| `COPY` | Straightforward local file copying |
| `ADD` | Special archive or advanced behavior |

Rule of thumb:

> **Use `COPY` unless you specifically need `ADD` behavior.**

---

# 24. `WORKDIR`

Sets the working directory.

Example:

```dockerfile
WORKDIR /app
```

Subsequent instructions use this directory.

Example:

```dockerfile
WORKDIR /app
COPY app.jar .
```

This results in:

```text
/app/app.jar
```

---

# 25. Why `WORKDIR` Is Better Than `cd`

Avoid:

```dockerfile
RUN cd /app
```

because the directory change does not act as a persistent Dockerfile working-directory configuration.

Prefer:

```dockerfile
WORKDIR /app
```

---

# 26. `ENV`

Sets environment variables in the image configuration.

Example:

```dockerfile
ENV APP_ENV=production
ENV PORT=8080
```

Applications can read these at runtime.

---

# 27. Do Not Store Secrets in `ENV`

Bad:

```dockerfile
ENV DB_PASSWORD=SuperSecret
```

Problems:

```text
Secret Exposure
Image Metadata Exposure
Poor Rotation
Potential Registry Exposure
```

Use runtime secret-management mechanisms instead.

---

# 28. `ARG`

`ARG` defines a build-time variable.

Example:

```dockerfile
ARG APP_VERSION=1.0.0
```

Build:

```bash
docker build \
  --build-arg APP_VERSION=1.5.0 \
  -t myapp:1.5.0 .
```

---

# 29. `ARG` vs `ENV`

| ARG | ENV |
|---|---|
| Build-time variable | Runtime/default environment variable |
| Mainly available during build | Available to container process |
| Useful for build configuration | Useful for application configuration |
| Not a secret mechanism | Not a secret mechanism |

Do not use either as a secure storage mechanism for sensitive credentials.

---

# 30. `LABEL`

Adds metadata.

Example:

```dockerfile
LABEL \
  org.opencontainers.image.title="Payments API" \
  org.opencontainers.image.version="1.5.0" \
  org.opencontainers.image.revision="abc123"
```

Useful for:

```text
Traceability
Ownership
Version
Source
Documentation
Compliance
```

---

# 31. OCI Image Labels

Common OCI metadata conventions include:

```text
org.opencontainers.image.title
org.opencontainers.image.description
org.opencontainers.image.url
org.opencontainers.image.source
org.opencontainers.image.version
org.opencontainers.image.revision
org.opencontainers.image.created
org.opencontainers.image.licenses
```

Use metadata consistently across your organization.

---

# 32. `USER`

Specifies the default user for subsequent commands and container runtime.

Example:

```dockerfile
USER 10001
```

Prefer non-root execution when practical.

---

# 33. Why `USER` Matters

Root:

```text
Process
   │
   ▼
High Privileges
```

Non-root:

```text
Process
   │
   ▼
Reduced Privileges
```

A compromised application running with fewer privileges generally has fewer opportunities to affect the environment.

---

# 34. Creating a Non-Root User

Debian/Ubuntu-style example:

```dockerfile
RUN useradd --uid 10001 --create-home appuser

USER appuser
```

Alpine example:

```dockerfile
RUN adduser -D -u 10001 appuser

USER appuser
```

Exact commands depend on the base image.

---

# 35. `EXPOSE`

Documents an intended container port.

Example:

```dockerfile
EXPOSE 8080
```

Important:

> `EXPOSE` does not publish the port to the host.

Publishing is done at runtime:

```bash
docker run -p 8080:8080 myapp
```

---

# 36. `ENTRYPOINT`

Defines the primary executable.

Example:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

The container is designed to run this executable as its main process.

---

# 37. `CMD`

Defines default command or arguments.

Example:

```dockerfile
CMD ["--server.port=8080"]
```

Combined:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--server.port=8080"]
```

The resulting default execution is conceptually:

```text
java -jar app.jar --server.port=8080
```

---

# 38. `ENTRYPOINT` vs `CMD`

Simplified model:

```text
ENTRYPOINT = Main executable

CMD = Default arguments / fallback command
```

Example:

```dockerfile
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]
```

Runtime override:

```bash
docker run myapp --port 9090
```

---

# 39. Exec Form

Preferred:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Instead of:

```dockerfile
ENTRYPOINT java -jar app.jar
```

Exec form directly starts the executable and generally gives better signal handling.

---

# 40. Shell Form

Example:

```dockerfile
CMD java -jar app.jar
```

The command may run through a shell.

Shell behavior can affect:

```text
Signal Handling
Variable Expansion
Process Tree
Exit Status
```

Use shell form deliberately.

---

# 41. PID 1 and Dockerfile

If your application is the main process:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

the application becomes the primary container process.

This generally improves signal handling compared with unnecessary shell wrappers.

---

# 42. Shell Wrapper Anti-Pattern

Problematic:

```dockerfile
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]
```

This may introduce an extra process layer.

If a shell is not needed, prefer:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

If shell logic is required, implement signal handling correctly.

---

# 43. `HEALTHCHECK`

Defines a container health-check command.

Example:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1
```

A health check can report:

```text
Starting
Healthy
Unhealthy
```

---

# 44. Health Check Does Not Equal Restart

A health check reports health.

It does not automatically mean:

```text
Unhealthy → Docker restarts container
```

Restart behavior depends on the runtime/orchestration configuration.

---

# 45. Health Check Design

A good health check should be:

```text
Fast
Reliable
Meaningful
Lightweight
```

Avoid a check that depends on every external system unless that is specifically what "healthy" means for the workload.

---

# 46. `SHELL`

Changes the default shell used by shell-form commands.

Example:

```dockerfile
SHELL ["/bin/bash", "-c"]
```

This is useful when the base image or build requires a specific shell.

---

# 47. `ONBUILD`

`ONBUILD` defines instructions that execute when the image is used as a base for another build.

Example:

```dockerfile
ONBUILD COPY . /app
```

It can be useful for specialized base images, but hidden build behavior can make Dockerfiles harder to understand.

Use carefully.

---

# 48. `STOPSIGNAL`

Defines the signal used to stop the container.

Example:

```dockerfile
STOPSIGNAL SIGTERM
```

The correct signal depends on the application's process behavior.

---

# 49. `VOLUME`

Example:

```dockerfile
VOLUME ["/data"]
```

Historically used to declare mount points.

For modern applications, runtime-managed volumes and explicit deployment configuration are often clearer.

Do not use `VOLUME` as a substitute for a complete persistence design.

---

# 50. Dockerfile Instruction Categories

Conceptually:

```text
Build
├── FROM
├── RUN
├── COPY
├── ADD
├── ARG
└── ONBUILD

Metadata / Configuration
├── ENV
├── LABEL
├── WORKDIR
├── USER
├── EXPOSE
├── SHELL
├── STOPSIGNAL
└── VOLUME

Runtime
├── ENTRYPOINT
├── CMD
└── HEALTHCHECK
```

---

# 51. Dockerfile Layering

Some Dockerfile instructions affect filesystem layers.

For example:

```dockerfile
RUN ...
COPY ...
ADD ...
```

Metadata instructions may modify image configuration without necessarily adding filesystem content.

The build engine and image format determine the exact resulting representation.

---

# 52. Dockerfile Cache

Build caching is one of the most important Dockerfile optimization mechanisms.

Conceptually:

```text
Instruction
    │
    ▼
Cache Match?
 ┌──┴───┐
Yes     No
 │       │
 ▼       ▼
Reuse   Build
```

---

# 53. Cache-Friendly Dockerfile

For Maven:

```dockerfile
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package
```

If only source changes:

```text
pom.xml unchanged
      │
      ▼
Dependency Layer Cached
```

This can make builds much faster.

---

# 54. Poor Cache Ordering

Example:

```dockerfile
COPY . .
RUN mvn dependency:go-offline
RUN mvn package
```

Every source change can invalidate the layer containing dependency preparation.

A better design separates relatively stable dependency files from frequently changing source code.

---

# 55. Node.js Cache Pattern

Good pattern:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
```

Why?

```text
package*.json
    │
    ▼
Dependency Layer
    │
    ▼
Application Source
```

Source changes do not necessarily invalidate dependency installation.

---

# 56. Python Cache Pattern

Example:

```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
```

Dependency installation can remain cached when only application source changes.

---

# 57. Avoid Unnecessary Files in Images

Do not copy:

```text
.git
Tests not needed at runtime
Documentation
Local IDE Files
Logs
Temporary Files
Build Artifacts
Credentials
```

Use:

```text
.dockerignore
```

and multi-stage builds.

---

# 58. Multi-Stage Build Pattern

General model:

```text
Stage 1: Build
│
├── Compiler
├── Build Tool
├── Source
└── Dependencies
        │
        ▼
     Artifact
        │
        ▼
Stage 2: Runtime
│
├── Runtime
├── Artifact
└── Minimal Configuration
```

---

# 59. Build Stage Example

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /src

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests
```

---

# 60. Runtime Stage Example

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /src/target/*.jar app.jar

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Final image does not need Maven or the source tree.

---

# 61. Build Secrets

Do not do this:

```dockerfile
ARG NPM_TOKEN
RUN npm config set token "$NPM_TOKEN"
```

without understanding how the value may be exposed through build metadata or layers.

Use BuildKit secret mounts for sensitive build-time credentials.

Conceptually:

```text
Secret
   │
   ▼
Build Step
   │
   ▼
Dependency Download
   │
   ▼
Secret Not Stored in Final Image
```

---

# 62. BuildKit Secret Example

Example syntax:

```dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci
```

Build:

```bash
docker build \
  --secret id=npmrc,src=$HOME/.npmrc \
  -t myapp:1.0 .
```

The exact secret configuration depends on your BuildKit/Docker environment.

---

# 63. SSH Mounts

BuildKit can also provide SSH access during a build when needed.

Conceptually:

```text
SSH Credential
      │
      ▼
Build Step
      │
      ▼
Private Dependency
```

This avoids baking SSH credentials into the image.

---

# 64. Never Copy Credentials

Bad:

```dockerfile
COPY ~/.ssh /root/.ssh
```

or:

```dockerfile
COPY credentials.json /app/
```

This can permanently expose credentials through image layers.

Use secure build mechanisms or external secret systems.

---

# 65. Dockerfile Security Checklist

```text
[ ] Trusted base image
[ ] Controlled base version
[ ] Regular base updates
[ ] No secrets
[ ] Non-root user
[ ] Minimal packages
[ ] Multi-stage build where useful
[ ] Small build context
[ ] .dockerignore
[ ] Dependency versions controlled
[ ] Final image scanned
[ ] SBOM generated
[ ] Image signed
```

---

# 66. Package Installation Security

Avoid:

```dockerfile
RUN curl http://example.com/script.sh | sh
```

Risks include:

```text
Untrusted Transport
Uncontrolled Content
Supply-Chain Risk
Poor Reproducibility
```

Prefer:

```text
Trusted Package Repository
Pinned Versions
Verified Artifacts
```

When external downloads are required, validate source integrity and transport security.

---

# 67. Avoid `curl | bash`

Bad:

```dockerfile
RUN curl https://example.com/install.sh | bash
```

Better approaches include:

```text
Official Package Repository
Verified Release Artifact
Pinned Version
Checksum / Signature Verification
```

---

# 68. Package Manager Cache

Example:

```dockerfile
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

For language package managers, use their cache-control features where appropriate.

Examples:

```text
npm ci
pip --no-cache-dir
Maven dependency caching during build
```

Do not blindly disable useful BuildKit caches if they improve build performance without entering the final image.

---

# 69. Build Cache vs Image Cache

These are related but different concepts.

```text
Build Cache
    │
    └── Speeds up image construction

Image Layer Cache
    │
    └── Reuses existing image content
```

Modern BuildKit can use local and remote cache exporters/importers.

---

# 70. Buildx and Dockerfile

Example:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.example.com/myapp:1.0 \
  --push .
```

This can produce a multi-platform image index.

---

# 71. Multi-Platform Dockerfile

A well-designed Dockerfile should avoid assumptions tied to one CPU architecture.

Example:

```dockerfile
FROM --platform=$BUILDPLATFORM golang:1.24 AS build

ARG TARGETOS
ARG TARGETARCH

RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o /out/app .

FROM alpine:latest

COPY --from=build /out/app /app

ENTRYPOINT ["/app"]
```

The exact build strategy depends on the language and project.

---

# 72. `TARGETARCH` and `BUILDARCH`

BuildKit exposes platform-related build arguments.

Conceptually:

```text
BUILDPLATFORM
    │
    ▼
Builder Environment

TARGETPLATFORM
    │
    ▼
Final Image Platform
```

This is important for cross-compilation and multi-platform builds.

---

# 73. Dockerfile and Reproducibility

For predictable builds:

```text
Pin Dependencies
+
Control Base Images
+
Control Build Inputs
+
Avoid Random Downloads
+
Use Deterministic Build Steps
```

Example:

```dockerfile
FROM eclipse-temurin:21-jre@sha256:...
```

combined with pinned application dependencies.

---

# 74. Dockerfile and SBOM

An image's final contents should be represented in an SBOM.

Pipeline:

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
SBOM
   │
   ▼
Registry / Artifact Store
```

The SBOM should correspond to the exact image artifact being deployed.

---

# 75. Dockerfile and Provenance

Build provenance can connect:

```text
Repository
    │
    ▼
Commit
    │
    ▼
Dockerfile
    │
    ▼
Builder
    │
    ▼
Image Digest
```

This is important for enterprise software supply-chain security.

---

# 76. Dockerfile and Image Signing

The Dockerfile itself is not the image signature.

Typical flow:

```text
Dockerfile
   │
   ▼
Build Image
   │
   ▼
Image Digest
   │
   ▼
Sign Digest
   │
   ▼
Registry
```

Signing the exact image digest gives stronger integrity guarantees.

---

# 77. Dockerfile for Java Applications

Example:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/app.jar app.jar

RUN chown -R 10001:10001 /app

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

For production, prefer a multi-stage build when the image itself should perform compilation.

---

# 78. Java Multi-Stage Example

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /src

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /src/target/app.jar app.jar

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

# 79. JVM Container Considerations

For Java containers, consider:

```text
JDK vs JRE / Runtime Image
Heap Sizing
CPU Limits
Memory Limits
GC
Startup
Signals
Non-Root User
```

Modern JVMs are designed to understand container resource constraints, but application-level configuration still matters.

---

# 80. Node.js Dockerfile

Example:

```dockerfile
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

---

# 81. Python Dockerfile

Example:

```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src

USER 10001

EXPOSE 8000

CMD ["python", "-m", "src"]
```

For production, use an appropriate non-root user and application server strategy.

---

# 82. Go Dockerfile

Go is a strong candidate for multi-stage builds.

```dockerfile
FROM golang:1.24 AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o /out/app ./cmd/app

FROM scratch

COPY --from=build /out/app /app

ENTRYPOINT ["/app"]
```

The final image can be extremely small if the binary and runtime requirements permit it.

---

# 83. Static vs Dynamic Linking

For minimal images such as `scratch`, verify whether the application requires:

```text
Dynamic Libraries
CA Certificates
Timezone Data
DNS Configuration
System Files
```

A binary that compiles successfully is not automatically suitable for `scratch`.

---

# 84. CA Certificates

Applications making HTTPS calls may require CA certificate bundles.

A minimal image may need certificates added explicitly.

Example conceptually:

```text
Application
   │
   ▼
HTTPS
   │
   ▼
CA Certificate Bundle
```

Test outbound TLS connectivity in the actual runtime image.

---

# 85. Timezone Data

Some applications require timezone information.

Minimal images may not contain complete timezone databases.

If the application requires them:

```text
Add Required Timezone Data
```

Do not add large packages blindly; validate actual requirements.

---

# 86. Dockerfile and File Permissions

Example:

```dockerfile
COPY --chown=10001:10001 app.jar /app/app.jar
```

This can avoid a separate ownership-changing step.

Use ownership intentionally, especially when running as a non-root user.

---

# 87. `COPY --chmod`

Where supported:

```dockerfile
COPY --chmod=755 start.sh /usr/local/bin/start.sh
```

This can set permissions during the copy operation.

Use it to keep permission intent explicit.

---

# 88. Avoid Excessive `chmod 777`

Bad:

```dockerfile
RUN chmod -R 777 /app
```

This grants broad permissions unnecessarily.

Prefer:

```text
Correct Owner
+
Correct Group
+
Minimum Required Permissions
```

---

# 89. Dockerfile Directory Design

A clean application image might use:

```text
/app
├── app.jar
├── config/
└── logs/
```

But logs are generally better emitted to stdout/stderr rather than stored permanently inside the container filesystem.

---

# 90. Container Logging and Dockerfile

Prefer application configuration such as:

```text
stdout
stderr
```

rather than:

```text
/app/application.log
```

This enables the container runtime and external logging system to collect logs.

---

# 91. Health Endpoint

A Dockerfile health check might use:

```dockerfile
HEALTHCHECK CMD curl --fail http://localhost:8080/health || exit 1
```

But if the runtime image does not contain `curl`, use an appropriate available health-check mechanism or configure health checks externally.

Do not add a large debugging package solely to support a simplistic health check.

---

# 92. Dockerfile and Graceful Shutdown

The final executable should ideally receive termination signals directly.

Prefer:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

over unnecessary shell wrappers.

This supports graceful shutdown.

---

# 93. Dockerfile Quality Checklist

```text
Structure
[ ] Clear FROM
[ ] Clear WORKDIR
[ ] Minimal COPY
[ ] Explicit USER
[ ] Clear ENTRYPOINT/CMD

Performance
[ ] Good cache ordering
[ ] Small context
[ ] Multi-stage build
[ ] Minimal runtime image

Security
[ ] Trusted base
[ ] No secrets
[ ] Non-root
[ ] Minimal packages
[ ] Controlled dependencies

Operations
[ ] Correct ports documented
[ ] Health strategy
[ ] Logs to stdout/stderr
[ ] Graceful shutdown
[ ] Useful metadata
```

---

# 94. Common Dockerfile Anti-Patterns

## Anti-Pattern 1: Running as Root

```dockerfile
USER root
```

when there is no need.

---

## Anti-Pattern 2: Baking Secrets

```dockerfile
ENV API_KEY=...
```

---

## Anti-Pattern 3: Copying Everything

```dockerfile
COPY . .
```

without a proper `.dockerignore`.

---

## Anti-Pattern 4: Build Tools in Runtime

```text
Maven
JDK
npm
gcc
git
```

inside the final runtime image when they are not required.

---

## Anti-Pattern 5: `latest`

```dockerfile
FROM base:latest
```

without controlled update management.

---

## Anti-Pattern 6: Shell Wrapper

```dockerfile
ENTRYPOINT ["sh", "-c", "..."]
```

when direct exec form is sufficient.

---

## Anti-Pattern 7: Excessive Privileges

Running the application with root and unnecessary Linux capabilities.

---

# 95. Dockerfile Review Checklist

When reviewing a Dockerfile, ask:

```text
1. What is the base image?
2. Is the base image trusted and maintained?
3. Is the version controlled?
4. Can the image be multi-stage?
5. Is the build context minimal?
6. Is .dockerignore present?
7. Are dependencies pinned?
8. Are secrets excluded?
9. Does the container run as non-root?
10. Are filesystem permissions minimal?
11. Is caching optimized?
12. Is the runtime image minimal?
13. Is ENTRYPOINT correct?
14. Is CMD used appropriately?
15. Is health checking appropriate?
16. Are ports documented?
17. Are logs written to stdout/stderr?
18. Is graceful shutdown supported?
19. Is the image scanned?
20. Is SBOM/provenance/signing part of CI/CD?
```

---

# 96. Practical Production Dockerfile

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /src

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /src/target/app.jar app.jar

USER 10001

EXPOSE 8080

LABEL \
  org.opencontainers.image.title="Payments API" \
  org.opencontainers.image.version="1.0.0"

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

# 97. Building the Image

```bash
docker build \
  -t payments:1.0.0 \
  .
```

With a custom Dockerfile:

```bash
docker build \
  -f Dockerfile.prod \
  -t payments:1.0.0 \
  .
```

---

# 98. Inspecting the Image

```bash
docker image ls

docker image inspect payments:1.0.0

docker history payments:1.0.0
```

Questions to answer:

```text
How large?
Which layers?
Which base?
Which user?
Which entrypoint?
Which environment?
Which labels?
```

---

# 99. Running the Result

```bash
docker run \
  --name payments \
  -p 8080:8080 \
  payments:1.0.0
```

Then:

```bash
docker logs payments
```

---

# 100. Dockerfile Troubleshooting

## Build Fails at `COPY`

Check:

```text
Build Context
File Path
.dockerignore
Case Sensitivity
Stage Name
```

---

## Build Fails at `RUN`

Check:

```text
Base Image
Package Repository
Network
Command Syntax
Architecture
Permissions
```

---

## Container Starts Then Exits

Check:

```text
ENTRYPOINT
CMD
Application Startup
Environment
Dependencies
Logs
Exit Code
```

---

## Permission Denied

Check:

```text
USER
File Ownership
COPY --chown
Directory Permissions
Mounted Volumes
```

---

# 101. Dockerfile Security Pipeline

A mature workflow:

```text
Dockerfile
    │
    ▼
Lint / Policy Check
    │
    ▼
Build
    │
    ▼
Image Scan
    │
    ├── OS CVEs
    ├── App CVEs
    ├── Secrets
    └── Misconfiguration
    │
    ▼
SBOM
    │
    ▼
Provenance
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

---

# 102. Dockerfile Linting

Dockerfile linting can detect issues such as:

```text
Unpinned Base
Secrets
Bad Instruction Ordering
Root User
Unnecessary Packages
Poor Practices
```

Common tools include:

```text
Hadolint
Docker Scout
Trivy
Snyk
Checkov
```

Tool coverage varies; use them as complementary controls.

---

# 103. Dockerfile Policy as Code

Enterprise pipelines can enforce rules such as:

```text
Base image must be approved
USER must not be root
No secrets
No privileged assumptions
Required OCI labels
Allowed package repositories
Required health strategy
```

Conceptually:

```text
Dockerfile
    │
    ▼
Policy Engine
    │
 ┌──┴──┐
PASS  FAIL
 │      │
 ▼      ▼
Build  Stop
```

---

# 104. Dockerfile and CI/CD

Typical pipeline:

```text
Git Commit
    │
    ▼
Dockerfile Validation
    │
    ▼
Unit Tests
    │
    ▼
Image Build
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
Push
```

The Dockerfile becomes part of the software supply chain and should be reviewed like application code.

---

# 105. Dockerfile Change Review

A Dockerfile change can alter:

```text
Base OS
Runtime
Libraries
Privileges
Network Exposure
Startup Command
Filesystem Permissions
Security Posture
```

Therefore:

> Dockerfile changes deserve security and application review, not just syntax review.

---

# 106. Complete Dockerfile Mental Model

```text
                         DOCKERFILE
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
       FROM                 BUILD              CONFIG
        │                    │                    │
        │              ┌─────┼─────┐        ┌─────┼─────┐
        │              │     │     │        │     │     │
        ▼              ▼     ▼     ▼        ▼     ▼     ▼
    Base Image        RUN   COPY  ADD      ENV   USER  LABEL
        │
        ▼
   Build Stages
        │
        ▼
   Final Filesystem
        │
        ├── WORKDIR
        ├── Permissions
        └── Application
        │
        ▼
    ENTRYPOINT + CMD
        │
        ▼
       IMAGE
        │
        ▼
     CONTAINER
```

---

# 107. Complete Dockerfile Build Model

```text
SOURCE
  │
  ├── Application Code
  ├── Dependency Files
  ├── Dockerfile
  └── .dockerignore
  │
  ▼
BUILD CONTEXT
  │
  ▼
BUILDKIT
  │
  ├── Cache
  ├── Build Secrets
  ├── Build Args
  └── Multi-Stage Build
  │
  ▼
IMAGE
  │
  ├── Layers
  ├── Configuration
  ├── Metadata
  └── Digest
  │
  ▼
SECURITY
  │
  ├── Scan
  ├── SBOM
  ├── Provenance
  └── Sign
  │
  ▼
REGISTRY
  │
  ▼
CONTAINER
```

---

# 108. Key Takeaways

Remember:

```text
1. Dockerfile = Image Build Instructions

2. FROM Defines the Base / Build Stage

3. RUN Executes Build-Time Commands

4. COPY Adds Build Context Files

5. ADD Has Extra Behavior; Prefer COPY for Simple Copies

6. WORKDIR Defines Working Directory

7. ENV Defines Runtime Defaults

8. ARG Defines Build-Time Variables

9. USER Enables Least-Privilege Execution

10. EXPOSE Documents Container Ports

11. ENTRYPOINT Defines the Main Executable

12. CMD Provides Defaults / Arguments

13. HEALTHCHECK Reports Container Health

14. Multi-Stage Builds Keep Runtime Images Clean

15. .dockerignore Reduces Build Context

16. Dockerfile Ordering Affects Cache Efficiency

17. Never Bake Secrets into Images

18. Prefer Non-Root Containers

19. Use Trusted and Maintained Base Images

20. Scan, Generate SBOM, Track Provenance, and Sign Images
```

The core mental model is:

```text
DOCKERFILE
    │
    ▼
BUILD CONTEXT
    │
    ▼
BUILDKIT
    │
    ├── CACHE
    ├── SECRETS
    └── MULTI-STAGE
    │
    ▼
IMAGE
    │
    ├── LAYERS
    ├── CONFIG
    └── METADATA
    │
    ▼
SECURITY / SUPPLY CHAIN
    │
    ▼
REGISTRY
    │
    ▼
CONTAINER
```

> **A good Dockerfile is not simply one that builds successfully. It should produce a reproducible, secure, minimal, observable, and operationally predictable image.**

---

# 109. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`container.md`](container.md)
- [`image.md`](image.md)
- [`build.md`](build.md)
- [`run.md`](run.md)
- [`network.md`](network.md)
- [`volume.md`](volume.md)
- [`registry.md`](registry.md)
