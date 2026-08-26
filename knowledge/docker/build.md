# Docker Build

> **Docker build is the process of transforming a Dockerfile, build context, dependencies, and build inputs into a container image.**

This document focuses specifically on the **Docker image build process**: BuildKit, build context, cache, layers, multi-stage builds, Buildx, secrets, SSH mounts, multi-platform builds, reproducibility, performance, CI/CD integration, security, and troubleshooting.

For Dockerfile syntax, see [`dockerfile.md`](dockerfile.md).

---

# 1. What Is Docker Build?

A simplified build flow is:

```text
Source Code
    │
    ▼
Dockerfile
    │
    ▼
Build Context
    │
    ▼
Docker Build / BuildKit
    │
    ▼
Container Image
```

Example:

```bash
docker build -t myapp:1.0 .
```

The `.` represents the build context.

---

# 2. Docker Build Mental Model

Think of the build as:

```text
INPUTS
  │
  ├── Dockerfile
  ├── Source Code
  ├── Dependencies
  ├── Base Images
  ├── Build Arguments
  └── Build Secrets
       │
       ▼
     BUILDER
       │
       ├── Cache
       ├── Build Steps
       └── Build Stages
       │
       ▼
     IMAGE
       │
       ├── Layers
       ├── Configuration
       └── Metadata
```

---

# 3. Basic `docker build`

Example:

```bash
docker build -t myapp:1.0 .
```

Breakdown:

```text
docker build
    │
    ├── -t myapp:1.0
    │       └── Image name/tag
    │
    └── .
            └── Build context
```

---

# 4. Tagging During Build

Example:

```bash
docker build \
  -t payments:1.0.0 \
  .
```

Multiple tags can reference the same resulting image:

```bash
docker build \
  -t payments:1.0.0 \
  -t payments:latest \
  .
```

For controlled production releases, avoid relying only on mutable tags such as `latest`.

---

# 5. Custom Dockerfile

If the file is not named `Dockerfile`:

```bash
docker build \
  -f Dockerfile.prod \
  -t payments:1.0.0 \
  .
```

The build context remains the final argument.

---

# 6. Build Context

Example:

```bash
docker build -t myapp:1.0 .
```

The current directory becomes the build context.

Conceptually:

```text
project/
├── Dockerfile
├── src/
├── pom.xml
├── README.md
└── .dockerignore
       │
       ▼
Build Context
```

The builder receives the context needed for the build.

---

# 7. Why Build Context Matters

A large context can cause:

```text
Slower Build Startup
More Data Transfer
More Storage
More Processing
Potential Accidental File Exposure
```

Example of a bad context:

```text
project/
├── .git/
├── node_modules/
├── target/
├── logs/
├── backups/
├── secrets/
└── source/
```

Use `.dockerignore`.

---

# 8. `.dockerignore`

Example:

```text
.git
.gitignore
node_modules
target
build
dist
*.log
.env
*.pem
coverage
.idea
.vscode
```

Benefits:

```text
Smaller Context
Faster Builds
Reduced Accidental Exposure
```

---

# 9. Build Context Is Not the Same as Image Contents

Important distinction:

```text
Build Context
     │
     ▼
Files Available to Build
```

does not mean:

```text
Everything in Context
     │
     ▼
Final Image
```

Only files explicitly used by Dockerfile instructions or build mechanisms become part of the image.

However, sensitive files should still be excluded from the context.

---

# 10. BuildKit

Modern Docker builds commonly use **BuildKit**.

BuildKit provides advanced build functionality such as:

```text
Parallel Build Steps
Improved Cache
Multi-Platform Builds
Secret Mounts
SSH Mounts
Cache Mounts
Build Graph Optimization
Provenance
SBOM Support
```

Conceptually:

```text
Docker CLI
    │
    ▼
BuildKit
    │
    ▼
Image
```

---

# 11. BuildKit vs Legacy Builder

Legacy Docker builds were more linear and had fewer advanced features.

BuildKit provides:

```text
Better Caching
Parallelism
Secure Build Secrets
Advanced Mounts
Multi-Platform Support
Improved Output Options
```

Modern Docker environments generally use BuildKit by default.

---

# 12. Build Graph

A useful mental model is:

```text
Dockerfile
   │
   ▼
Build Graph
   │
   ├── Stage A
   │     ├── Step 1
   │     └── Step 2
   │
   ├── Stage B
   │     └── Step 3
   │
   └── Final Stage
         └── Step 4
```

BuildKit can optimize execution based on dependencies between build operations.

---

# 13. Build Stages

Example:

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /src
COPY . .
RUN mvn package

FROM eclipse-temurin:21-jre

COPY --from=build /src/target/app.jar /app/app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

There are two stages:

```text
Stage 1 → Build
Stage 2 → Runtime
```

---

# 14. Why Multi-Stage Builds Matter

Without multi-stage:

```text
Final Image
├── JDK
├── Maven
├── Source
├── Build Cache
└── Application
```

With multi-stage:

```text
Final Image
├── Runtime
└── Application
```

Benefits:

```text
Smaller Image
Fewer Packages
Lower Attack Surface
Cleaner Runtime
```

---

# 15. Build Cache

Build caching avoids repeating unchanged work.

Conceptually:

```text
Build Step
    │
    ▼
Cache Match?
  ┌──┴──┐
 Yes   No
  │     │
  ▼     ▼
Reuse  Execute
```

Example:

```dockerfile
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package
```

If `pom.xml` has not changed, dependency preparation can remain cached.

---

# 16. Cache Invalidation

If an earlier build input changes:

```text
Changed Step
    │
    ▼
Cache Miss
    │
    ▼
Following Dependent Steps
    │
    ▼
May Rebuild
```

Therefore:

> **Dockerfile ordering has a major impact on build performance.**

---

# 17. Cache-Friendly Dockerfile

Maven:

```dockerfile
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package
```

Node:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
```

Python:

```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
```

The principle is:

```text
Stable Inputs
     │
     ▼
Expensive Work
     │
     ▼
Frequently Changing Inputs
```

---

# 18. Build Cache Sources

Cache can come from:

```text
Local Builder
Local Image Layers
Remote Registry
CI Cache
BuildKit Cache Export
```

Modern BuildKit can import and export cache across build environments.

---

# 19. Local Cache

A developer machine may already have:

```text
Base Image
Dependency Layers
Previous Build Layers
```

A rebuild can reuse these.

This is why:

```bash
docker build .
```

can become much faster after the first build.

---

# 20. Remote Cache

CI runners are often ephemeral.

Without remote cache:

```text
New CI Runner
     │
     ▼
Rebuild Everything
```

With remote cache:

```text
New CI Runner
     │
     ▼
Pull Cache
     │
     ▼
Reuse Build Work
```

This can substantially reduce CI build time.

---

# 21. BuildKit Cache Mounts

BuildKit supports cache mounts.

Example:

```dockerfile
RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests
```

The cache can persist Maven dependency downloads across builds without becoming part of the final image filesystem.

---

# 22. npm Cache Mount

Example:

```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

This can speed up repeated dependency installation.

---

# 23. pip Cache Mount

Example:

```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

The cache is used for build performance and should not be confused with final image content.

---

# 24. Cache Mount vs Image Layer

Important:

```text
Cache Mount
    │
    └── Build Performance Data
```

versus:

```text
Image Layer
    │
    └── Final Image Filesystem Content
```

A cache mount should not be treated as application data.

---

# 25. Build Secrets

Never bake credentials into the image.

Bad:

```dockerfile
ARG NPM_TOKEN
RUN npm config set token "$NPM_TOKEN"
```

Better:

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

---

# 26. Why Build Secrets Matter

A normal:

```dockerfile
ARG SECRET
```

or:

```dockerfile
ENV SECRET=...
```

should not be treated as secure secret storage.

Sensitive values can potentially appear in:

```text
Image Configuration
Build Metadata
History
Logs
Intermediate Artifacts
```

Use dedicated secret mounts and secret managers.

---

# 27. SSH Mounts

BuildKit can expose SSH credentials to a specific build step.

Example concept:

```dockerfile
RUN --mount=type=ssh \
    git clone git@github.com:company/private-repo.git
```

Build:

```bash
docker buildx build \
  --ssh default \
  -t myapp:1.0 \
  .
```

This is useful for private Git dependencies.

---

# 28. Build Context Security

Do not assume:

```text
"If I don't COPY it, it is harmless."
```

Sensitive files in the build context can still create risks.

Use:

```text
.dockerignore
```

and keep credentials outside the build context whenever possible.

---

# 29. Build Arguments

Example:

```dockerfile
ARG APP_VERSION
RUN echo "$APP_VERSION"
```

Build:

```bash
docker build \
  --build-arg APP_VERSION=1.5.0 \
  -t myapp:1.5.0 .
```

Build arguments are useful for configuration, but not for secrets.

---

# 30. Automatic Platform Arguments

BuildKit can provide platform information such as:

```text
BUILDPLATFORM
TARGETPLATFORM
BUILDOS
BUILDARCH
TARGETOS
TARGETARCH
```

This is useful for cross-platform builds.

---

# 31. Multi-Platform Build

Example:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.example.com/myapp:1.0 \
  --push \
  .
```

Conceptually:

```text
Image Index
│
├── linux/amd64
└── linux/arm64
```

---

# 32. Why Multi-Platform Builds Matter

Different environments may use:

```text
x86-64
ARM64
```

For example:

```text
Cloud x86 Servers
Apple Silicon Developers
ARM Cloud Instances
Edge Devices
```

A multi-platform image allows the runtime to select the correct platform variant.

---

# 33. Buildx

`docker buildx` provides extended BuildKit functionality.

Common uses:

```text
Multi-Platform Builds
Remote Builders
Advanced Cache
Multiple Output Formats
Build Attestations
```

Example:

```bash
docker buildx build \
  --platform linux/amd64 \
  -t myapp:1.0 \
  .
```

---

# 34. Builder Instances

Buildx can use builder instances.

Conceptually:

```text
Docker CLI
    │
    ▼
Buildx
    │
    ▼
Builder
    │
    ├── Local
    ├── Container
    └── Remote
```

The builder may run on a different environment from the Docker CLI.

---

# 35. Inspecting Builders

Useful command:

```bash
docker buildx ls
```

This shows available builder instances and their platforms.

---

# 36. Creating a Builder

Example:

```bash
docker buildx create \
  --name multiarch \
  --use
```

Inspect:

```bash
docker buildx inspect --bootstrap
```

The exact builder configuration depends on the environment.

---

# 37. Build Output Types

A build can produce different outputs.

Conceptually:

```text
Build
 │
 ├── Docker Image
 ├── OCI Layout
 ├── Local Files
 └── Tar Archive
```

The appropriate output depends on the workflow.

---

# 38. `--load`

For a local Docker Engine workflow:

```bash
docker buildx build \
  --load \
  -t myapp:1.0 \
  .
```

This loads the result into the local Docker image store when supported by the builder/output configuration.

---

# 39. `--push`

For registry publishing:

```bash
docker buildx build \
  --push \
  -t registry.example.com/myapp:1.0 \
  .
```

This is commonly used for multi-platform builds.

---

# 40. `--output`

BuildKit supports explicit output configuration.

Conceptually:

```text
Build
 │
 ├── Local
 ├── Registry
 ├── OCI
 └── Docker
```

The exact `--output` syntax depends on the desired exporter.

---

# 41. Build to Registry

A common CI pattern:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.example.com/payments:1.5.0 \
  --push \
  .
```

Flow:

```text
CI
 │
 ▼
BuildKit
 │
 ▼
Image Index
 │
 ▼
Registry
```

---

# 42. Build Once, Promote Many Times

A strong deployment pattern is:

```text
Build
 │
 ▼
Image Digest
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
 ├── Development
 ├── Testing
 └── Production
```

Do not rebuild the application independently for each environment unless there is a deliberate reason.

---

# 43. Reproducible Builds

A reproducible build aims to make output predictable from controlled inputs.

Control:

```text
Source
Dockerfile
Base Image
Dependencies
Build Tools
Build Arguments
External Downloads
```

---

# 44. Base Image Pinning

Less reproducible:

```dockerfile
FROM eclipse-temurin:21-jre
```

More precise:

```dockerfile
FROM eclipse-temurin:21-jre@sha256:...
```

Digest pinning identifies exact base-image content.

But:

> **Pinned does not mean permanently secure.**

Pinned images must still be updated when security fixes become available.

---

# 45. Dependency Pinning

Examples:

```text
Maven Version
Gradle Version
npm package versions
Python package versions
Go modules
```

Use appropriate lock/version mechanisms.

---

# 46. External Downloads

Risky:

```dockerfile
RUN curl https://example.com/latest.tar.gz | tar -xz
```

The content may change without your Dockerfile changing.

Prefer:

```text
Pinned Version
Verified Checksum
Verified Signature
Trusted Source
```

---

# 47. Deterministic Build Inputs

A useful model:

```text
Same Source
+
Same Dockerfile
+
Same Dependencies
+
Same Base
+
Same Build Configuration
       │
       ▼
Predictable Image
```

Perfect byte-for-byte reproducibility may require additional control over timestamps, toolchains, and build metadata.

---

# 48. Build Provenance

Modern BuildKit can generate provenance information.

Conceptually:

```text
Source
 │
 ▼
Builder
 │
 ├── Dockerfile
 ├── Build Inputs
 └── Build Configuration
 │
 ▼
Image
 │
 ▼
Provenance
```

This helps establish where an artifact came from.

---

# 49. SBOM During Build

Build workflows can generate an SBOM describing the resulting image.

Conceptually:

```text
Build
 │
 ▼
Image
 │
 ▼
SBOM
 │
 ├── OS Packages
 ├── Libraries
 └── Application Components
```

The SBOM should correspond to the exact image artifact.

---

# 50. Build Attestations

Attestations can associate additional metadata with an image.

Examples:

```text
Provenance
SBOM
Build Metadata
```

These improve software supply-chain visibility.

---

# 51. Build Security Pipeline

A mature pipeline:

```text
Source
  │
  ▼
Dockerfile Lint
  │
  ▼
Build
  │
  ├── Trusted Base
  ├── Build Secrets
  └── Controlled Dependencies
  │
  ▼
Image
  │
  ├── Vulnerability Scan
  ├── SBOM
  └── Provenance
  │
  ▼
Sign
  │
  ▼
Registry
```

---

# 52. Build Performance

Build time depends on:

```text
Build Context Size
Dockerfile Ordering
Cache Hit Rate
Dependency Downloads
Compilation
Compression
Network
Builder Resources
Multi-Platform Targets
```

---

# 53. Improving Build Performance

Use:

```text
Small Context
.dockerignore
Good Cache Ordering
BuildKit
Cache Mounts
Remote Cache
Multi-Stage Builds
Parallelizable Steps
Nearby Registry
Efficient CI Runners
```

---

# 54. Build Context Optimization

Bad:

```text
1 GB Build Context
```

Good:

```text
Only Required Source and Build Files
```

Measure the context and exclude:

```text
.git
node_modules
target
logs
coverage
IDE files
local credentials
```

---

# 55. Dockerfile Ordering for Performance

General rule:

```text
Least Frequently Changing
          │
          ▼
Most Expensive
          │
          ▼
Most Frequently Changing
```

Example:

```dockerfile
COPY package*.json ./
RUN npm ci

COPY src ./src
RUN npm run build
```

---

# 56. Parallel Build Work

BuildKit can optimize independent build operations.

Multi-stage builds can sometimes contain independent stages:

```text
Stage A ──┐
          ├── Final
Stage B ──┘
```

The builder can execute independent work efficiently.

---

# 57. Build Cache Reliability

Do not make correctness depend on cache.

The cache is an optimization.

A build should still succeed when:

```text
Cache = Empty
```

This is especially important in CI/CD.

---

# 58. Cache Poisoning Considerations

Remote or shared caches can introduce supply-chain risk if untrusted inputs can populate them.

Use:

```text
Trusted Builders
Controlled Cache Sources
Scoped Cache
Secure Registry
Build Isolation
```

---

# 59. CI/CD Build Architecture

Example:

```text
Developer
   │
   ▼
Git
   │
   ▼
CI Runner
   │
   ▼
BuildKit
   │
   ├── Cache
   ├── Secrets
   └── Build Context
   │
   ▼
Image
   │
   ▼
Security Gates
   │
   ▼
Registry
```

---

# 60. Ephemeral CI Runners

Many CI systems create a fresh runner for each build.

Without cache:

```text
Fresh Runner
   │
   ▼
Download Everything
   │
   ▼
Build
```

With remote cache:

```text
Fresh Runner
   │
   ▼
Import Cache
   │
   ▼
Reuse
   │
   ▼
Build
```

---

# 61. Registry as Build Cache

BuildKit can use a registry-backed cache in supported configurations.

Conceptually:

```text
CI Runner
   │
   ├── Pull Cache
   │
   ▼
Build
   │
   └── Push Updated Cache
```

This can be very useful for distributed CI.

---

# 62. Build Matrix

For multiple platforms or variants:

```text
Build Matrix
│
├── amd64
├── arm64
├── development
└── production
```

Avoid creating unnecessary variants.

Prefer a small, well-defined artifact matrix.

---

# 63. Build Arguments for Variants

Example:

```dockerfile
ARG APP_ENV=production
```

Build:

```bash
docker build \
  --build-arg APP_ENV=production \
  -t myapp:1.0 .
```

Use build arguments for build-time differences.

Runtime environment should normally be configured when the container is deployed.

---

# 64. Build-Time vs Runtime Configuration

Build-time:

```text
Compiler Options
Artifact Version
Optional Build Features
```

Runtime:

```text
Database URL
Environment
Feature Flags
Service Endpoints
Secrets
```

Avoid rebuilding an image merely because a database URL changes between environments.

---

# 65. Build Once, Configure at Runtime

Preferred:

```text
One Image
   │
   ├── Dev Config
   ├── Test Config
   └── Prod Config
```

Rather than:

```text
Dev Image
Test Image
Prod Image
```

for the same application artifact.

---

# 66. Build Security: Trusted Sources

Control:

```text
Base Images
Package Repositories
Git Dependencies
Build Plugins
Download URLs
```

A secure Dockerfile can still produce a risky image if its dependencies are untrusted.

---

# 67. Build Security: Least Privilege

The build environment should also be protected.

Consider:

```text
Builder Permissions
Registry Credentials
Cloud Credentials
SSH Keys
Secret Mounts
Network Access
```

Do not give build jobs broader permissions than necessary.

---

# 68. Build Security: Network Access

Builds often require external network access:

```text
Maven Central
npm Registry
PyPI
OS Repositories
Git Repositories
```

Where possible:

```text
Use Trusted Mirrors
Use Dependency Proxies
Pin Versions
Validate Artifacts
```

Enterprise environments often use internal artifact repositories.

---

# 69. Build Security: Dependency Proxy

Example:

```text
Build
 │
 ▼
Internal Repository
 │
 ├── Maven Proxy
 ├── npm Proxy
 └── PyPI Proxy
 │
 ▼
External Sources
```

Benefits can include:

```text
Central Governance
Caching
Availability
Audit
Security Scanning
```

---

# 70. Build Security: Base Image Governance

Enterprise pattern:

```text
Upstream Base
      │
      ▼
Security Team
      │
      ▼
Approved Base
      │
      ▼
Application Teams
```

Application teams consume approved bases rather than selecting arbitrary images.

---

# 71. Rebuilding for Security

Suppose:

```text
Image A
   │
   └── Base Package Vulnerability
```

Fix:

```text
Update Base
   │
   ▼
Rebuild
   │
   ▼
Scan
   │
   ▼
Sign
   │
   ▼
Deploy
```

The source code may remain unchanged.

---

# 72. Scheduled Image Rebuilds

A mature organization can rebuild periodically:

```text
Daily / Weekly
      │
      ▼
Rebuild
      │
      ▼
Rescan
      │
      ▼
Publish if Approved
```

This helps consume updated base images and dependencies.

---

# 73. Build Failure Classification

When a build fails, classify it:

```text
Context Error
Dockerfile Error
Dependency Error
Network Error
Authentication Error
Architecture Error
Resource Error
Cache Error
Security Policy Failure
Registry Error
```

This makes troubleshooting faster.

---

# 74. Build Logs

Build logs can show:

```text
Step
Command
Cache Hit
Cache Miss
Download
Compile
Error
```

Use clear build output in CI.

Avoid printing:

```text
Secrets
Tokens
Private Keys
Credentials
```

---

# 75. Build Debugging

Useful approaches:

```text
Inspect Dockerfile
Check Build Context
Disable / Reconsider Cache
Build a Single Stage
Test Base Image
Run Failed Command Separately
Inspect Dependencies
Check Architecture
```

For advanced BuildKit debugging, inspect builder configuration and build logs.

---

# 76. Reproduce CI Build Locally

A strong troubleshooting pattern:

```text
CI Failure
   │
   ▼
Same Dockerfile
   │
   ▼
Same Build Arguments
   │
   ▼
Same Target Platform
   │
   ▼
Local / Dedicated Builder
```

This can isolate CI-specific issues.

---

# 77. Build Resource Limits

Builds may consume:

```text
CPU
Memory
Disk
Network
```

Large builds can fail because of:

```text
Out of Memory
Disk Full
Network Timeout
Builder Resource Limits
```

Monitor the builder environment.

---

# 78. Build Disk Usage

Image builds can leave:

```text
Cached Layers
Intermediate Layers
Unused Images
Build Cache
```

Inspect and clean according to the environment's lifecycle.

For local Docker environments, use appropriate prune commands carefully.

---

# 79. Buildx Disk Usage

BuildKit cache can be inspected with appropriate buildx tooling.

Conceptually:

```text
Builder
 │
 ├── Images
 ├── Cache
 └── Intermediate Data
```

Avoid aggressive cleanup during active builds.

---

# 80. Build Cache Strategy in CI

A practical strategy:

```text
Main Branch
   │
   ▼
Build + Push Cache
   │
   ▼
Feature Branch
   │
   ▼
Import Main Cache
   │
   ▼
Build Changed Layers
```

This can accelerate feature builds while keeping cache sources controlled.

---

# 81. Docker Build and Git

A good CI build ties:

```text
Git Commit
    │
    ▼
Docker Build
    │
    ▼
Image Tag
    │
    ▼
Image Digest
```

Example tag:

```text
myapp:git-abc123
```

Production should additionally record the exact digest.

---

# 82. Image Digest After Build

After building:

```bash
docker image inspect myapp:1.0
```

For registry-published artifacts, the registry digest is the authoritative content reference for the published image.

Use digest references for precise deployment tracking.

---

# 83. Build and Image Signing

The typical order is:

```text
Build
  │
  ▼
Push
  │
  ▼
Get Image Digest
  │
  ▼
Sign Digest
```

Do not sign a mutable tag as if the tag itself were immutable.

---

# 84. Build and Vulnerability Scanning

Typical flow:

```text
Build
  │
  ▼
Image
  │
  ▼
Scan
  │
 ┌┴──────┐
Pass    Fail
 │        │
 ▼        ▼
Push    Stop
```

In some architectures, images are pushed to a quarantine registry before promotion.

---

# 85. Build and DAST

DAST is generally performed against a running application, not merely against the Docker build.

Typical security pipeline:

```text
Source
 │
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
Deploy Test Environment
 │
 ▼
DAST
```

This distinction is important:

```text
Image Scan → Image / Packages

DAST → Running Application
```

---

# 86. Build and Container Testing

A robust image pipeline may test:

```text
Image Build
    │
    ▼
Container Start
    │
    ▼
Health Check
    │
    ▼
Smoke Test
    │
    ▼
Integration Test
    │
    ▼
Security Test
```

This validates the actual runtime artifact.

---

# 87. Build and Kubernetes

A typical pipeline:

```text
Git
 │
 ▼
Docker Build
 │
 ▼
Image Registry
 │
 ▼
Kubernetes Deployment
 │
 ▼
Pod
 │
 ▼
Container
```

The image should be built before deployment.

---

# 88. Build and Helm

Example flow:

```text
Docker Build
   │
   ▼
Image Digest
   │
   ▼
Helm Values
   │
   ▼
Kubernetes Deployment
```

Prefer deploying the exact image digest when the platform and release process support it.

---

# 89. Build Promotion

Example:

```text
Build Image
   │
   ▼
Scan
   │
   ▼
Sign
   │
   ▼
Dev
   │
   ▼
Test
   │
   ▼
Prod
```

The same image digest should move through environments.

---

# 90. Build Governance

Enterprise build governance may define:

```text
Approved Base Images
Approved Registries
Allowed Build Tools
Required Scans
Required SBOM
Required Provenance
Required Signing
Retention
Exception Process
```

---

# 91. Build Policy Example

A policy could require:

```text
IF
  Base Image = approved
AND
  Critical CVEs = 0
AND
  Secrets = 0
AND
  SBOM = present
AND
  Provenance = present
AND
  Signature = valid
THEN
  Promote
ELSE
  Reject
```

---

# 92. Build Pipeline Example

```text
                    GIT
                     │
                     ▼
              Dockerfile Check
                     │
                     ▼
                  BuildKit
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
      Cache        Secrets      Sources
        │            │            │
        └────────────┼────────────┘
                     ▼
                   IMAGE
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
        Scan        SBOM    Provenance
          │          │          │
          └──────────┼──────────┘
                     ▼
                   SIGN
                     │
                     ▼
                 REGISTRY
                     │
                     ▼
                 DEPLOY
```

---

# 93. Practical Java Build

Dockerfile:

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /src

COPY pom.xml .

RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline

COPY src ./src

RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /src/target/app.jar app.jar

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

This combines:

```text
Multi-Stage Build
+
Cache Mount
+
Non-Root Runtime
```

---

# 94. Practical Node Build

```dockerfile
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json .

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json .

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

---

# 95. Practical Multi-Platform Go Build

```dockerfile
FROM --platform=$BUILDPLATFORM golang:1.24 AS build

ARG TARGETOS
ARG TARGETARCH

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 \
    GOOS=$TARGETOS \
    GOARCH=$TARGETARCH \
    go build -o /out/app ./cmd/app

FROM scratch

COPY --from=build /out/app /app

ENTRYPOINT ["/app"]
```

Build:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.example.com/myapp:1.0 \
  --push \
  .
```

---

# 96. Build Troubleshooting Checklist

```text
[ ] Is the Dockerfile correct?
[ ] Is the build context correct?
[ ] Is .dockerignore excluding required files?
[ ] Is the base image available?
[ ] Is the platform correct?
[ ] Are package repositories reachable?
[ ] Are credentials available?
[ ] Are build secrets configured?
[ ] Is the cache valid?
[ ] Is the builder healthy?
[ ] Is disk space sufficient?
[ ] Is memory sufficient?
[ ] Are dependency versions valid?
[ ] Is the final stage copying the expected artifact?
[ ] Is the resulting image runnable?
```

---

# 97. Common Build Errors

## `COPY failed`

Possible causes:

```text
Wrong Context
Wrong Path
.dockerignore
Case Sensitivity
Missing File
```

---

## Package Download Failure

Possible causes:

```text
Network
Repository Outage
Authentication
Proxy
Certificate
Dependency Version
```

---

## Out of Memory

Possible causes:

```text
Large Compilation
Too Many Parallel Tasks
Large Build Context
Insufficient Builder Memory
```

---

## No Space Left on Device

Check:

```text
Image Layers
Build Cache
Builder Disk
Registry Cache
```

---

# 98. Cache Problems

If a build behaves unexpectedly:

```text
Check Dockerfile
Check Inputs
Check Cache
Rebuild Without Cache if Necessary
```

Example:

```bash
docker build --no-cache -t myapp:debug .
```

Use `--no-cache` for diagnosis, not as the default performance strategy.

---

# 99. Build With Specific Target

Multi-stage Dockerfiles can define a target.

Example:

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
FROM eclipse-temurin:21-jre AS runtime
```

Build a specific stage:

```bash
docker build \
  --target build \
  -t myapp:build .
```

This can be useful for debugging or specialized CI workflows.

---

# 100. Development Target

Example:

```dockerfile
FROM node:24 AS development

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]

FROM node:24 AS production
...
```

Then:

```bash
docker build --target development -t myapp:dev .
```

---

# 101. Build and Testing Stage

A Dockerfile can include a test stage:

```dockerfile
FROM build AS test

RUN mvn test
```

Then:

```bash
docker build \
  --target test \
  -t myapp:test \
  .
```

This can integrate container image construction with automated testing.

---

# 102. Separate Test and Runtime Stages

Conceptually:

```text
Build
 │
 ├── Test
 │
 └── Runtime
```

The runtime stage does not need:

```text
Test Frameworks
Build Tools
Source Code
```

---

# 103. Build Target Architecture

A useful enterprise Dockerfile can support:

```text
development
test
production
debug
```

But avoid excessive stage complexity.

Each stage should have a clear purpose.

---

# 104. Docker Build and Debugging

A useful approach:

```text
Full Build Fails
     │
     ▼
Build Individual Stage
     │
     ▼
Inspect Intermediate Files
     │
     ▼
Validate Dependencies
     │
     ▼
Continue to Final Stage
```

Intermediate stages can be valuable debugging environments.

---

# 105. Build Output and Artifacts

Depending on the build workflow, BuildKit can produce:

```text
Container Image
OCI Image
Local Files
Tar Archive
Cache
SBOM
Provenance
```

Choose outputs intentionally.

---

# 106. Build Artifact Naming

A useful tagging model:

```text
myapp:1.5.0
myapp:git-abc123
```

And record:

```text
Image Digest
```

Example conceptual metadata:

```text
Version: 1.5.0
Commit: abc123
Digest: sha256:...
```

---

# 107. Build Artifact Traceability

Strong traceability:

```text
Git Commit
    │
    ▼
CI Build ID
    │
    ▼
Docker Image
    │
    ▼
Image Digest
    │
    ▼
SBOM
    │
    ▼
Provenance
    │
    ▼
Signature
    │
    ▼
Deployment
```

---

# 108. Build Reproducibility vs Build Speed

There can be trade-offs:

```text
Maximum Reproducibility
        ↕
Maximum Freshness
        ↕
Maximum Build Speed
```

A mature pipeline balances:

```text
Pinned Inputs
+
Scheduled Updates
+
Efficient Cache
```

---

# 109. Build Freshness

A cached build can be fast but may reuse old dependencies.

Security-sensitive pipelines should define when to refresh:

```text
Base Image
Dependencies
Package Metadata
Build Tools
```

Use scheduled rebuilds or controlled cache invalidation where appropriate.

---

# 110. Build Without Cache

Example:

```bash
docker build \
  --no-cache \
  -t myapp:1.0 \
  .
```

Use when:

```text
Debugging Cache
Testing Fresh Dependencies
Validating Base Updates
```

Do not make every production CI build `--no-cache` unless there is a specific reason.

---

# 111. Build Pull Policy for Base Images

Depending on the build command and cache state, the builder may reuse an existing base image.

For controlled freshness, consider:

```bash
docker build --pull -t myapp:1.0 .
```

This asks the builder to attempt to pull a newer version of referenced base images.

If the base is digest-pinned, the digest remains the exact content reference.

---

# 112. `--pull` vs `--no-cache`

These solve different problems.

```text
--pull
   └── Refresh base image references

--no-cache
   └── Avoid normal build cache reuse
```

They can be combined when a completely fresh build is required:

```bash
docker build \
  --pull \
  --no-cache \
  -t myapp:1.0 \
  .
```

---

# 113. Build Security Gates

Example:

```text
Build
 │
 ▼
Scan
 │
 ├── Critical CVE? → STOP
 ├── Secret? → STOP
 ├── Unapproved Base? → STOP
 ├── Missing SBOM? → STOP
 └── Missing Signature? → STOP
 │
 ▼
Promote
```

Exact policy thresholds should be defined by the organization.

---

# 114. Build and DAST Positioning

Remember:

```text
Docker Build
     │
     ▼
Container Image
     │
     ▼
Deploy Test Environment
     │
     ▼
Running Application
     │
     ▼
DAST
```

DAST does not replace image scanning.

They test different layers.

---

# 115. Build and Security Testing Layers

A comprehensive pipeline can include:

```text
Source
 │
 ├── SAST
 ├── SCA
 └── Secret Scan
 │
 ▼
Docker Build
 │
 ├── Dockerfile Lint
 └── Image Scan
 │
 ▼
Container
 │
 ├── Runtime Security
 └── Configuration Checks
 │
 ▼
Running Application
 │
 └── DAST
```

---

# 116. Build and Supply-Chain Security

A secure build should answer:

```text
What source was built?
Which Dockerfile?
Which base image?
Which dependencies?
Which builder?
Which secrets were used?
Which image digest resulted?
Was it scanned?
Was an SBOM generated?
Was provenance generated?
Was the image signed?
```

This is the foundation of container supply-chain security.

---

# 117. Enterprise Build Architecture

```text
                   SOURCE CONTROL
                         │
                         ▼
                    CI PIPELINE
                         │
               ┌─────────┼─────────┐
               │         │         │
               ▼         ▼         ▼
            SAST        SCA      Secrets
               │         │         │
               └─────────┼─────────┘
                         ▼
                       BUILDKIT
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
       Base Images     Cache        Secrets
           │             │             │
           └─────────────┼─────────────┘
                         ▼
                       IMAGE
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
         Scan          SBOM       Provenance
           │             │             │
           └─────────────┼─────────────┘
                         ▼
                       SIGN
                         │
                         ▼
                     REGISTRY
                         │
                         ▼
                      DEPLOY
```

---

# 118. Build Best Practices

```text
1. Use BuildKit.
2. Keep build context small.
3. Maintain a good .dockerignore.
4. Order Dockerfile instructions for cache efficiency.
5. Use multi-stage builds.
6. Use cache mounts for dependency-heavy builds.
7. Use remote cache in ephemeral CI where appropriate.
8. Use BuildKit secret mounts for build credentials.
9. Avoid ARG/ENV for secrets.
10. Pin important dependencies.
11. Control base-image versions.
12. Refresh base images regularly.
13. Support required target architectures.
14. Generate SBOM and provenance.
15. Scan the final image.
16. Sign the final artifact.
17. Record the image digest.
18. Promote the same image across environments.
19. Keep builds reproducible.
20. Treat the builder as part of the software supply chain.
```

---

# 119. Common Build Anti-Patterns

## Rebuilding Every Environment

```text
Dev Image
Test Image
Prod Image
```

for the same source.

Prefer:

```text
One Image
    │
    ▼
Promote
```

---

## `--no-cache` Everywhere

This destroys most cache benefits.

Use it for specific troubleshooting or freshness requirements.

---

## Secrets in Build Args

```bash
docker build --build-arg PASSWORD=...
```

Do not treat this as secure secret handling.

---

## Huge Build Context

```text
Entire Repository
+
.git
+
Dependencies
+
Logs
+
Credentials
```

Use `.dockerignore`.

---

## Unverified Downloads

```dockerfile
RUN curl ... | sh
```

Prefer verified and pinned artifacts.

---

## Uncontrolled Base Images

```dockerfile
FROM something:latest
```

without governance.

---

# 120. Build Review Checklist

```text
Build Inputs
[ ] Source controlled
[ ] Dockerfile reviewed
[ ] Build context minimal
[ ] .dockerignore present
[ ] Base image trusted
[ ] Dependencies controlled

Build Process
[ ] BuildKit enabled
[ ] Cache strategy defined
[ ] Build secrets secured
[ ] Multi-stage build considered
[ ] Target platforms defined

Security
[ ] Dockerfile linting
[ ] Image scanning
[ ] Secret scanning
[ ] SBOM
[ ] Provenance
[ ] Signing

Operations
[ ] Image tagged
[ ] Digest recorded
[ ] Registry configured
[ ] Promotion process defined
[ ] Rollback artifact retained
```

---

# 121. Interview Questions

## Beginner

### What does `docker build` do?

It uses a Dockerfile and build context to construct a container image.

### What is the build context?

The set of files made available to the build.

### Why is `.dockerignore` important?

It reduces build context size and helps prevent unnecessary files from entering the build process.

### What is BuildKit?

A modern Docker build engine that provides advanced caching, parallelism, mounts, multi-platform builds, and supply-chain features.

---

## Intermediate

### Why does Dockerfile ordering matter?

Because cache invalidation can force later steps to rebuild.

### What is a multi-stage build?

A Dockerfile with multiple build stages that allows build dependencies to be excluded from the final runtime image.

### What is a cache mount?

A BuildKit mount used to persist reusable build data, such as package-manager caches, without making it part of the final image.

### Why should build secrets not use `ARG`?

Because build arguments are not designed as secure secret storage and values may be exposed through build metadata or other build outputs.

---

## Advanced

### What is the difference between `--pull` and `--no-cache`?

`--pull` asks the builder to refresh referenced base images; `--no-cache` disables normal cache reuse for build steps.

### Why is remote cache useful in CI?

Ephemeral runners start without local cache, so remote cache can reuse expensive previous build work.

### What is a multi-platform image?

An image reference that can resolve to platform-specific image manifests, such as `linux/amd64` and `linux/arm64`.

### Why should production deploy by digest?

A digest identifies exact image content and avoids ambiguity caused by mutable tags.

### How does DAST relate to Docker build?

Docker build produces the image; DAST normally runs against the deployed application. Image scanning and DAST address different security layers.

---

# 122. Complete Docker Build Mental Model

```text
                         DOCKER BUILD
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
      DOCKERFILE          BUILD CONTEXT        BASE IMAGE
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                           BUILDKIT
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
           CACHE           SECRETS          BUILD ARGS
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                         BUILD STAGES
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
                BUILD                  RUNTIME
                  │                       │
                  └───────────┬───────────┘
                              ▼
                            IMAGE
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
             SCAN            SBOM        PROVENANCE
               │              │              │
               └──────────────┼──────────────┘
                              ▼
                            SIGN
                              │
                              ▼
                          REGISTRY
                              │
                              ▼
                           DEPLOY
```

---

# 123. Complete CI/CD Build Model

```text
GIT
 │
 ▼
VALIDATE
 │
 ├── Dockerfile Lint
 ├── SAST
 ├── SCA
 └── Secret Scan
 │
 ▼
BUILD
 │
 └── BuildKit
      │
      ├── Cache
      ├── Build Secrets
      ├── Dependencies
      └── Base Image
      │
      ▼
IMAGE
 │
 ├── Image Scan
 ├── SBOM
 └── Provenance
 │
 ▼
SIGN
 │
 ▼
REGISTRY
 │
 ▼
TEST ENVIRONMENT
 │
 ├── Smoke Tests
 ├── Integration Tests
 └── DAST
 │
 ▼
PROMOTE
 │
 ▼
PRODUCTION
```

---

# 124. Final Key Takeaways

Remember:

```text
1. Docker Build transforms build inputs into an image.

2. The build context determines which files are available.

3. .dockerignore keeps the context small and safer.

4. BuildKit is the modern build engine.

5. Dockerfile ordering strongly affects cache efficiency.

6. Cache is an optimization, not a correctness requirement.

7. Multi-stage builds separate build and runtime environments.

8. Cache mounts speed dependency-heavy builds.

9. Build secrets should use secure secret mounts.

10. Build arguments are not secret storage.

11. Buildx enables advanced BuildKit workflows.

12. Multi-platform builds support different CPU architectures.

13. Pinning improves reproducibility.

14. Pinned images still need security updates.

15. Remote cache is valuable for ephemeral CI runners.

16. Build provenance connects an image to its source and builder.

17. SBOM provides component inventory.

18. Image scanning identifies known vulnerabilities.

19. Image signing protects artifact integrity.

20. Build once and promote the same image across environments.

21. Record the exact production image digest.

22. DAST belongs against the running application, not merely the image.

23. The build system itself is part of the software supply chain.
```

The core flow is:

```text
SOURCE
  │
  ▼
DOCKERFILE + CONTEXT
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
  ├── SCAN
  ├── SBOM
  ├── PROVENANCE
  └── SIGN
  │
  ▼
REGISTRY
  │
  ▼
DEPLOY
  │
  ▼
RUNNING CONTAINER
```

> **A production-grade Docker build is not just a successful `docker build`. It is a controlled, repeatable, secure process that produces a traceable image artifact ready for promotion and deployment.**

---

# 125. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`container.md`](container.md)
- [`image.md`](image.md)
- [`dockerfile.md`](dockerfile.md)
- [`run.md`](run.md)
- [`network.md`](network.md)
- [`volume.md`](volume.md)
- [`registry.md`](registry.md)
