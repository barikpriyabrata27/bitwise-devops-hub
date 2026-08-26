# Docker Images

> **A Docker image is a packaged, immutable-style artifact containing a filesystem, application dependencies, metadata, and configuration used to create containers.**

This document focuses specifically on **Docker images**: their structure, layers, tags, digests, manifests, building, caching, optimization, security, distribution, and troubleshooting.

For the broader Docker platform, see [`docker-and-containers.md`](docker-and-containers.md).

---

# 1. What Is a Docker Image?

A Docker image is a package used to create containers.

Conceptually:

```text
Source Code
    │
    ▼
Dockerfile
    │
    ▼
Docker Build
    │
    ▼
Docker Image
    │
    ▼
Container
```

An image commonly contains:

```text
Application
Runtime
Libraries
Operating-system user-space files
Metadata
Configuration
```

---

# 2. Image Mental Model

Remember:

```text
Dockerfile = Instructions

Image = Packaged Artifact

Container = Running Instance
```

Therefore:

```text
Dockerfile
    │
    ▼
   Build
    │
    ▼
  Image
    │
    ├── Container A
    ├── Container B
    └── Container C
```

One image can create many containers.

---

# 3. Image vs Container

| Image | Container |
|---|---|
| Packaged artifact | Runtime instance |
| Read-only-style layers | Image layers + writable container layer |
| Stored locally or in registry | Runs on a container host |
| Created by build | Created from image |
| Can be shared | Represents one workload instance |
| Versioned by tags/digests | Has its own container ID/name |

Mental model:

```text
Image = Template / Artifact
Container = Instance
```

---

# 4. Why Images Matter

Images solve the "works on my machine" problem by packaging an application environment.

Without an image:

```text
Developer
  │
  ├── Java Version
  ├── Libraries
  ├── OS Packages
  └── Configuration
```

Different environments may behave differently.

With an image:

```text
Build Once
    │
    ▼
Container Image
    │
    ├── Dev
    ├── Test
    └── Production
```

The same artifact can be promoted across environments.

---

# 5. Image Lifecycle

A typical lifecycle:

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
Image
  │
  ▼
Scan
  │
  ▼
Tag
  │
  ▼
Push
  │
  ▼
Registry
  │
  ▼
Pull
  │
  ▼
Container
```

---

# 6. Image Components

Conceptually, an image contains:

```text
Image
│
├── Filesystem Layers
│
├── Configuration
│
├── Metadata
│
├── Architecture
│
├── OS
│
├── Environment
│
├── Entrypoint / Command
│
└── Labels
```

The exact internal representation is defined by OCI image specifications and Docker's implementation.

---

# 7. Image Layers

Docker images are commonly constructed from layers.

Example:

```text
Application Layer
-------------------------
Dependency Layer
-------------------------
Runtime Layer
-------------------------
Base Image Layer
-------------------------
```

Each filesystem layer represents changes from the previous layer.

---

# 8. Layer Mental Model

Suppose a Dockerfile contains:

```dockerfile
FROM ubuntu:24.04

RUN apt-get update && apt-get install -y curl

COPY app /app

CMD ["/app/start.sh"]
```

Conceptually:

```text
Layer: Application Files
        │
Layer: curl Installation
        │
Layer: Ubuntu Base
```

The exact layer behavior depends on the build instructions and build engine.

---

# 9. Why Layers Exist

Layers provide benefits such as:

- Build caching
- Reuse
- Faster distribution
- Deduplication
- Incremental image transfer

For example:

```text
Image A
├── Base Layer
├── Runtime Layer
└── App A Layer

Image B
├── Base Layer  ← Shared
├── Runtime Layer  ← Shared
└── App B Layer
```

Shared content can reduce storage and transfer requirements.

---

# 10. Image Layer Immutability

Image layers are treated as read-only filesystem content.

When a container changes a file:

```text
Image Layer
     │
     ▼
Container Writable Layer
```

The original image remains unchanged.

---

# 11. Copy-on-Write

Containers commonly use copy-on-write behavior.

Conceptually:

```text
Read:
Container
   │
   ▼
Image Layer

Write:
Container
   │
   ▼
Writable Layer
```

This allows many containers to share the same image content.

---

# 12. Image ID

A local Docker image has an image identifier.

Example:

```text
sha256:...
```

This identifies the image's local content/configuration representation.

For registry distribution and exact content references, image digests are especially important.

---

# 13. Image Tag

An image tag is a human-friendly reference.

Example:

```text
myapp:1.5.0
```

Here:

```text
myapp
  └── Repository

1.5.0
  └── Tag
```

A tag can point to different image content over time unless immutability is enforced.

---

# 14. `latest` Tag

Example:

```text
myapp:latest
```

Important:

> `latest` does not inherently mean "newest."

It is simply a tag.

It does not guarantee:

```text
Newest
Stable
Secure
Production Approved
```

Production deployments should use controlled versioning.

---

# 15. Image Digest

An image digest identifies content using a cryptographic digest.

Example:

```text
myapp@sha256:abcdef...
```

Compare:

```text
myapp:1.5.0
```

with:

```text
myapp@sha256:abcdef...
```

The tag is a mutable reference unless protected.

The digest provides a content-addressed reference.

---

# 16. Tag vs Digest

| Tag | Digest |
|---|---|
| Human-friendly | Content-addressed |
| Easier to read | Precise |
| Can move | Identifies specific content |
| Useful for releases | Useful for immutable deployment references |

Strong production pattern:

```text
Version Tag
    +
Image Digest
```

---

# 17. Repository

A repository groups image versions under a common name.

Example:

```text
company/payments
```

Possible tags:

```text
company/payments:1.0.0
company/payments:1.1.0
company/payments:2.0.0
```

---

# 18. Fully Qualified Image Name

Example:

```text
registry.example.com/team/payments:1.5.0
```

Components:

```text
registry.example.com
        │
        └── Registry

team/payments
        │
        └── Repository

1.5.0
        │
        └── Tag
```

---

# 19. Docker Hub Image Reference

A common image:

```bash
docker pull nginx:latest
```

For official images, Docker can resolve the image through Docker Hub according to Docker's registry defaults.

---

# 20. Private Registry Reference

Example:

```bash
docker pull registry.example.com/payments/api:1.5.0
```

Flow:

```text
Docker Client
     │
     ▼
Private Registry
     │
     ▼
Image
```

Authentication is normally required for private repositories.

---

# 21. Base Image

A Dockerfile normally starts with a base image:

```dockerfile
FROM eclipse-temurin:21-jre
```

or:

```dockerfile
FROM ubuntu:24.04
```

The base image provides foundational filesystem and runtime content.

---

# 22. Base Image Selection

Consider:

```text
Security
Size
Support Lifecycle
Compatibility
Package Availability
Architecture
Operational Requirements
```

Do not choose a base image only because it is small.

---

# 23. Full OS vs Minimal Images

Traditional base:

```text
Ubuntu
Debian
Rocky Linux
```

Minimal approaches:

```text
Slim Images
Alpine
Distroless
Minimal Runtime Images
```

Trade-offs can include:

```text
Size
Compatibility
Debugging Tools
Package Availability
Security Maintenance
```

---

# 24. Distroless Images

Distroless images generally contain only the components required to run an application rather than a full general-purpose Linux userland.

Conceptually:

```text
Application
   +
Runtime
   +
Required Libraries
```

Benefits:

- Smaller attack surface
- Fewer packages
- Fewer unnecessary utilities

Trade-off:

- Debugging can be harder because common shell utilities may be absent.

---

# 25. Alpine Images

Alpine Linux is a popular small Linux distribution used for container images.

Benefits can include:

```text
Small Size
Minimal Userland
```

However:

> Small image size does not automatically mean better compatibility or security.

Applications should be tested carefully, especially where libc compatibility matters.

---

# 26. Slim Images

Slim variants remove unnecessary packages from a larger distribution.

Example conceptually:

```text
Full Base
   │
   ▼
Slim Base
   │
   ▼
Application
```

They often provide a balance between:

```text
Compatibility
+
Smaller Size
```

---

# 27. Multi-Stage Images

Multi-stage builds separate build and runtime environments.

Example:

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /src
COPY . .
RUN mvn package

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /src/target/app.jar .

USER 10001

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

---

# 28. Why Multi-Stage Builds Matter

Without multi-stage builds:

```text
Runtime Image
├── Application
├── JDK
├── Maven
├── Build Tools
└── Source
```

With multi-stage builds:

```text
Runtime Image
├── Application
├── Runtime
└── Required Libraries
```

Benefits:

- Smaller image
- Lower attack surface
- Fewer unnecessary packages
- Cleaner production runtime

---

# 29. Image Size

Large images can cause:

```text
Longer Pull Time
More Registry Storage
Longer Deployment
Larger Attack Surface
More Vulnerability Scan Findings
```

Image size should be optimized without sacrificing compatibility or maintainability.

---

# 30. Finding Large Image Layers

Useful command:

```bash
docker history myapp:1.0
```

This can help identify which Dockerfile instructions contribute to image size.

For deeper analysis, image inspection tools can analyze layers and package contents.

---

# 31. Docker History

Example:

```bash
docker history myapp:1.0
```

Conceptually:

```text
IMAGE
│
├── Layer
├── Layer
├── Layer
└── Layer
```

It can show:

```text
Layer Size
Command / Created By
```

Do not assume `docker history` alone reveals every piece of provenance or every build detail.

---

# 32. Dockerfile Instructions and Layers

Common instructions:

```dockerfile
FROM
RUN
COPY
ADD
WORKDIR
ENV
ARG
USER
EXPOSE
ENTRYPOINT
CMD
LABEL
```

Some instructions create filesystem changes and therefore contribute to image content.

Metadata-only instructions can affect configuration without necessarily creating filesystem layers.

---

# 33. RUN and Layers

Example:

```dockerfile
RUN apt-get update
RUN apt-get install -y curl
```

This can create separate build steps and layers.

Often better:

```dockerfile
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

This can avoid retaining package-manager cache in the resulting filesystem.

---

# 34. Image Cache

Build systems cache reusable build results.

Conceptually:

```text
Dockerfile
   │
   ▼
Instruction
   │
   ▼
Cache?
  ┌┴┐
 Yes No
  │   │
  ▼   ▼
Reuse Build
```

Caching can significantly reduce build time.

---

# 35. Build Cache Invalidation

If an earlier Dockerfile instruction changes:

```text
Changed Layer
     │
     ▼
Subsequent Layers
     │
     ▼
May Need Rebuild
```

Therefore Dockerfile instruction ordering matters.

---

# 36. Good Dockerfile Ordering

For a dependency-based application, a common pattern is:

```dockerfile
COPY dependency-file .
RUN install-dependencies

COPY application-source .
RUN build
```

Why?

```text
Dependency Files
   │
   ▼
Dependency Layer
   │
   ▼
Application Source
```

If only source code changes, the dependency layer may remain cached.

---

# 37. Image Reproducibility

A reproducible build should aim to produce predictable output from controlled inputs.

Important inputs include:

```text
Source
Dockerfile
Base Image
Dependencies
Build Toolchain
Build Arguments
```

Pinning versions and controlling external dependencies improves reproducibility.

---

# 38. Pinning Base Images

Instead of:

```dockerfile
FROM ubuntu:latest
```

prefer a controlled version:

```dockerfile
FROM ubuntu:24.04
```

For stronger reproducibility, organizations can pin the base image by digest.

Example conceptually:

```dockerfile
FROM ubuntu:24.04@sha256:...
```

Digest pinning must be balanced with an update process so security patches are not missed.

---

# 39. Dependency Pinning

Example:

```text
Spring Boot 3.x
```

is less precise than:

```text
Spring Boot 3.5.4
```

Pinning application dependencies improves reproducibility.

Dependency management tools such as Maven, Gradle, npm, pip, and others provide their own lock/version mechanisms.

---

# 40. Image Metadata

Images can contain metadata such as:

```text
Architecture
OS
Config
Entrypoint
Command
Environment
Working Directory
User
Labels
History
```

Inspect with:

```bash
docker inspect myapp:1.0
```

---

# 41. Image Labels

Labels add metadata.

Example:

```dockerfile
LABEL \
  org.opencontainers.image.title="Payments API" \
  org.opencontainers.image.version="1.5.0" \
  org.opencontainers.image.revision="abc123"
```

Useful metadata includes:

```text
Title
Version
Source Repository
Revision
Vendor
Build Date
Documentation URL
```

OCI annotations provide standardized metadata conventions.

---

# 42. OCI Image Specification

**OCI = Open Container Initiative**

OCI defines standards for container images and runtimes.

Important image concepts include:

```text
Image Manifest
Image Configuration
Filesystem Layers
Image Index
Content Digests
```

This allows different tools to interoperate.

---

# 43. Image Manifest

An image manifest describes image content.

Conceptually:

```text
Manifest
│
├── Config Descriptor
└── Layer Descriptors
      ├── Layer 1
      ├── Layer 2
      └── Layer 3
```

Each descriptor includes content-addressed information such as digests and sizes.

---

# 44. Image Configuration

The image configuration can describe runtime defaults such as:

```text
Environment
Entrypoint
Command
Working Directory
User
Health Check
```

Conceptually:

```text
Image
 ├── Layers
 └── Configuration
```

---

# 45. Image Index

A multi-platform image can use an image index.

Conceptually:

```text
Image Index
│
├── linux/amd64
│     └── Manifest
│
├── linux/arm64
│     └── Manifest
│
└── other platforms
      └── Manifest
```

The registry can select the appropriate platform-specific image.

---

# 46. Multi-Platform Images

Example:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.example.com/myapp:1.0 \
  --push .
```

Conceptually:

```text
myapp:1.0
   │
   ├── amd64
   └── arm64
```

This is useful when supporting different CPU architectures.

---

# 47. Architecture

Common architectures include:

```text
amd64
arm64
```

An image built only for one architecture may not run on another without emulation or a compatible build.

Check image/platform information with Docker tooling.

---

# 48. Buildx

`docker buildx` provides advanced build functionality.

Common capabilities include:

```text
Multi-Platform Builds
Advanced Cache
BuildKit
Remote Builders
Export Options
```

Example:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:1.0 \
  --push .
```

---

# 49. Image Pull

Example:

```bash
docker pull nginx:1.29
```

Conceptually:

```text
Registry
   │
   ▼
Manifest
   │
   ▼
Layers
   │
   ▼
Local Image Store
```

The runtime downloads only the content needed for the selected platform and layers not already available locally.

---

# 50. Image Push

Example:

```bash
docker push registry.example.com/myapp:1.0
```

Conceptually:

```text
Local Image
    │
    ▼
Registry Authentication
    │
    ▼
Manifest + Layers
    │
    ▼
Registry
```

---

# 51. Image Pull Policy Concept

A deployment system decides when to pull an image.

Common conceptual strategies:

```text
Always
If Not Present
Never
```

The exact options depend on the platform.

Kubernetes has its own image pull policy behavior.

---

# 52. Image Registry

A registry stores and distributes images.

Examples include:

```text
Docker Hub
Amazon ECR
Azure Container Registry
Google Artifact Registry
GitHub Container Registry
GitLab Container Registry
Harbor
JFrog Artifactory
```

Registry capabilities may include:

```text
Authentication
Authorization
Scanning
Replication
Retention
Signing
Audit
```

---

# 53. Registry and Image Naming

Example:

```text
ghcr.io/company/payments:1.5.0
```

Breakdown:

```text
ghcr.io
   │
   └── Registry

company/payments
   │
   └── Repository

1.5.0
   │
   └── Tag
```

---

# 54. Image Distribution

A typical enterprise flow:

```text
Developer
   │
   ▼
Build
   │
   ▼
Image
   │
   ▼
Security Scan
   │
   ▼
Registry
   │
   ├── Dev
   ├── Test
   └── Production
```

---

# 55. Image Promotion

Prefer promoting the same image:

```text
Image Digest
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

rather than rebuilding separately for each environment.

---

# 56. Image Retention

Registries can accumulate many images:

```text
Version 1
Version 2
Version 3
...
Version 500
```

Retention policies can remove obsolete artifacts.

Consider retaining:

```text
Production Versions
Rollback Versions
Security Investigation Artifacts
Required Compliance Artifacts
```

---

# 57. Image Garbage Collection

On a local Docker host, unused images can consume disk space.

Examples:

```bash
docker image prune
```

or:

```bash
docker system prune
```

Use cleanup commands carefully.

---

# 58. Image Security

Image security should cover:

```text
Base Image
OS Packages
Application Dependencies
Configuration
Secrets
Build Process
Provenance
Registry
Runtime
```

Image security is part of the software supply chain.

---

# 59. Vulnerability Scanning

Image scanners inspect packages and dependencies.

Common tools:

```text
Trivy
Grype
Docker Scout
Clair
JFrog Xray
```

Typical flow:

```text
Image
  │
  ▼
Scanner
  │
  ├── OS Vulnerabilities
  ├── Library Vulnerabilities
  ├── Secrets
  └── Misconfiguration
```

---

# 60. CVE and Image Security

A vulnerability may exist in:

```text
Base OS Package
Application Dependency
Runtime Library
System Library
```

Example:

```text
Image
 │
 └── openssl
       │
       └── Vulnerable Version
```

Remediation:

```text
Update
  │
  ▼
Rebuild
  │
  ▼
Rescan
```

---

# 61. Image Scanning Is Not Enough

A scanner is only one control.

A secure image lifecycle includes:

```text
Secure Source
+
Dependency Management
+
Dockerfile Security
+
Image Scanning
+
SBOM
+
Signing
+
Provenance
+
Runtime Security
```

---

# 62. Secrets in Images

Never place long-lived secrets into an image.

Bad:

```dockerfile
ENV API_KEY=secret
```

Bad:

```dockerfile
COPY private-key.pem /app/
```

Even if the file is later deleted, it may remain in an earlier image layer.

---

# 63. Why Deleting a Secret Is Not Enough

Example:

```dockerfile
COPY secret.txt /tmp/
RUN rm /tmp/secret.txt
```

Conceptually:

```text
Layer 1
 └── secret.txt

Layer 2
 └── secret deleted
```

The original layer may still contain the secret.

Better:

```text
Do not put the secret into the image
```

Use secure build or runtime secret mechanisms.

---

# 64. Build Secrets

BuildKit supports controlled secret use during builds.

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

The goal is to prevent the secret from becoming part of the resulting image.

---

# 65. Image SBOM

**SBOM = Software Bill of Materials**

An SBOM lists software components inside an image.

Example:

```text
Image
 │
 ├── Ubuntu
 ├── OpenSSL
 ├── curl
 ├── Java
 ├── Spring
 └── Application Libraries
```

SBOMs improve:

```text
Inventory
Vulnerability Response
Compliance
Supply-Chain Visibility
```

---

# 66. Image Signing

Images can be signed.

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

Technologies include:

```text
Cosign
Sigstore
Notary
```

---

# 67. Image Provenance

Provenance answers questions such as:

```text
Who built this image?
From which source?
Which commit?
Which build system?
When?
With which workflow?
```

Conceptually:

```text
Source Commit
      │
      ▼
CI Build
      │
      ▼
Image
      │
      ▼
Provenance Attestation
```

This supports software supply-chain security.

---

# 68. Image Verification

A deployment system can enforce:

```text
Trusted Registry?
      │
      ▼
Signed?
      │
      ▼
Trusted Signer?
      │
      ▼
Expected Digest?
      │
      ▼
Deploy
```

This reduces the risk of unauthorized image substitution.

---

# 69. Trusted Base Images

Organizations often maintain approved base-image policies.

Example:

```text
Approved:
- Internal Java Runtime
- Approved Debian Base
- Approved Distroless Base
```

Benefits:

```text
Consistent Security
Centralized Patching
Compliance
Faster Builds
```

---

# 70. Base Image Updates

Suppose:

```text
Production Image
    │
    ▼
Old Base Image
    │
    ▼
New CVE
```

Remediation:

```text
Update Base
   │
   ▼
Rebuild Application Image
   │
   ▼
Scan
   │
   ▼
Test
   │
   ▼
Promote
```

The application itself may not have changed, but the image must be rebuilt.

---

# 71. Image Refresh Strategy

A mature organization regularly rebuilds images to consume:

```text
OS Security Updates
Runtime Updates
Dependency Updates
Base Image Improvements
Security Fixes
```

A "no source code change" period does not mean the image should never change.

---

# 72. Image Immutability

An image should be treated as an immutable artifact after publication.

Prefer:

```text
Build New Image
```

instead of:

```text
Modify Existing Image
```

This improves:

```text
Reproducibility
Auditability
Rollback
Traceability
```

---

# 73. Image Versioning Strategy

Example:

```text
payments:1.5.0
```

Possible additional references:

```text
payments:1.5
payments:stable
payments:production
```

Be careful with mutable aliases.

A deployment should record the exact digest used.

---

# 74. Semantic Versioning

Applications may use:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
2.4.1
```

The image tag can follow application release conventions.

However, image versioning should be aligned with the organization's release and rollback strategy.

---

# 75. Git Commit Tags

Another approach:

```text
myapp:git-abc123
```

This can directly link an image to a source revision.

A strong traceability model can combine:

```text
Release Version
+
Git SHA
+
Image Digest
```

---

# 76. Image Labels for Traceability

Example:

```dockerfile
LABEL \
  org.opencontainers.image.source="https://github.com/example/payments" \
  org.opencontainers.image.revision="abc123" \
  org.opencontainers.image.version="1.5.0"
```

This makes image metadata more useful for operations and audits.

---

# 77. Image Optimization Checklist

```text
[ ] Choose appropriate base image
[ ] Use multi-stage builds
[ ] Remove unnecessary packages
[ ] Avoid package caches
[ ] Use .dockerignore
[ ] Order Dockerfile for caching
[ ] Avoid build tools in runtime image
[ ] Remove unnecessary files
[ ] Scan the final image
```

---

# 78. `.dockerignore`

Example:

```text
.git
.gitignore
node_modules
target
*.log
.env
README.md
```

Benefits:

```text
Smaller Build Context
Faster Builds
Reduced Accidental File Exposure
```

It is not a replacement for proper secret management.

---

# 79. Image Size vs Security

A small image can have:

```text
Fewer Packages
Smaller Attack Surface
Faster Distribution
```

But:

```text
Small ≠ Automatically Secure
```

A tiny image with an unpatched vulnerable library is still vulnerable.

---

# 80. Image Performance

Large images can increase:

```text
Pull Time
Startup Time
Registry Traffic
Storage
Deployment Duration
```

Optimized images improve deployment efficiency.

---

# 81. Image Caching in CI/CD

CI systems can cache:

```text
Build Layers
Dependencies
Base Images
Intermediate Images
```

This can significantly reduce build time.

However, cache sources must be trusted.

Do not allow untrusted build content to poison a production build cache without appropriate controls.

---

# 82. Remote Build Cache

Modern BuildKit supports advanced cache mechanisms.

Conceptually:

```text
CI Runner
   │
   ▼
BuildKit
   │
   ├── Local Cache
   └── Remote Cache
```

Remote cache can accelerate builds across ephemeral CI runners.

---

# 83. Image Build Context Security

The build context can contain sensitive files.

Example:

```text
project/
├── source
├── Dockerfile
├── .env
├── private-key.pem
└── credentials
```

Without appropriate `.dockerignore` and build design, unnecessary files can be sent to the builder.

Never assume a file is safe simply because it is not copied by `COPY`.

---

# 84. `COPY` vs `ADD`

Prefer:

```dockerfile
COPY
```

for straightforward file copying.

`ADD` has additional behavior such as archive extraction.

Example:

```dockerfile
COPY app.jar /app/
```

Use the simplest instruction that expresses the intent.

---

# 85. Image ENTRYPOINT and CMD

Image configuration can define:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

and:

```dockerfile
CMD ["--server.port=8080"]
```

Conceptually:

```text
ENTRYPOINT
     +
CMD
     │
     ▼
Default Container Command
```

These settings are image metadata.

---

# 86. `ENTRYPOINT` vs `CMD`

Simplified:

```text
ENTRYPOINT = Main executable / fixed behavior

CMD = Default arguments / default command
```

Example:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--server.port=8080"]
```

Then:

```bash
docker run myapp --server.port=9090
```

can override the default arguments.

Exact command-line behavior depends on shell vs exec forms and runtime invocation.

---

# 87. Exec Form

Prefer:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

over:

```dockerfile
ENTRYPOINT java -jar app.jar
```

The exec form starts the executable directly and generally provides better signal behavior.

---

# 88. Image WORKDIR

Example:

```dockerfile
WORKDIR /app
```

This defines the working directory for subsequent Dockerfile instructions and the container's default process context.

It is preferable to repeatedly using:

```dockerfile
RUN cd /app
```

because `RUN cd` does not persist as a Dockerfile working directory setting.

---

# 89. Image USER

Example:

```dockerfile
USER 10001
```

This specifies the default user for subsequent container execution.

A production image should generally define a non-root user when practical.

---

# 90. EXPOSE

Example:

```dockerfile
EXPOSE 8080
```

This documents the intended container port.

It does not publish the port to the host.

Publishing happens at runtime:

```bash
docker run -p 8080:8080 myapp
```

---

# 91. Image ENV

Example:

```dockerfile
ENV APP_ENV=production
```

This creates default environment configuration in the image.

Do not use `ENV` for long-lived secrets.

---

# 92. Image ARG

Example:

```dockerfile
ARG APP_VERSION
```

Build arguments are available during image build.

Example:

```bash
docker build \
  --build-arg APP_VERSION=1.5.0 \
  -t myapp:1.5.0 .
```

Do not assume build arguments are appropriate for secrets because build metadata/history may expose values depending on the build process.

---

# 93. Image Build Metadata

Modern build systems can attach metadata such as:

```text
Source Revision
Build Time
Builder
Provenance
SBOM
```

This supports software supply-chain visibility.

---

# 94. Image Content Addressability

Container images use content-addressed objects.

Conceptually:

```text
Content
   │
   ▼
Hash
   │
   ▼
Digest
   │
   ▼
Content Identity
```

If content changes, its digest changes.

This is a foundational property of container image distribution.

---

# 95. Layer Deduplication

Suppose:

```text
Application A
└── Ubuntu Base

Application B
└── Ubuntu Base
```

If the same base layer is used:

```text
Ubuntu Base Layer
       ▲
       │
 ┌─────┴─────┐
 │           │
App A       App B
```

The content can be shared locally or in registry storage.

---

# 96. Image Pull Efficiency

When pulling an image:

```text
Local Cache
    │
    ▼
Already Have Layer?
  ┌──┴──┐
 Yes   No
  │     │
  ▼     ▼
Reuse  Download
```

Layer reuse reduces network traffic.

---

# 97. Image Export and Import

Docker can export/import images in appropriate formats.

Examples:

```bash
docker save -o myapp.tar myapp:1.0
docker load -i myapp.tar
```

This can be useful for disconnected environments or controlled artifact transfer.

Do not confuse:

```text
docker save
```

with:

```text
docker export
```

`docker save` works with images; `docker export` exports a container filesystem and does not preserve image history/metadata in the same way.

---

# 98. Image vs Container Export

```text
docker save
    │
    ▼
Image Archive
```

while:

```text
docker export
    │
    ▼
Container Filesystem Archive
```

They serve different purposes.

---

# 99. Image Retagging

Example:

```bash
docker tag myapp:1.0 registry.example.com/myapp:1.0
```

This creates another tag/reference to the same local image content.

Then:

```bash
docker push registry.example.com/myapp:1.0
```

---

# 100. Image Removal

Example:

```bash
docker rmi myapp:1.0
```

Docker may prevent removal if the image is still referenced by containers or other constraints.

Use:

```bash
docker image ls
```

to inspect local images.

---

# 101. Dangling Images

A dangling image may be an untagged image left behind after builds or tag changes.

List images:

```bash
docker image ls
```

Clean unused dangling images:

```bash
docker image prune
```

Use cleanup carefully.

---

# 102. Image Inspection

Useful commands:

```bash
docker image inspect myapp:1.0
docker history myapp:1.0
docker image ls
```

These help answer:

```text
What is the image?
How large is it?
What configuration does it contain?
What layers exist?
```

---

# 103. Image Troubleshooting

When an image fails to run:

```text
1. Is the image present?
2. Is the tag correct?
3. Is the architecture compatible?
4. Is the entrypoint correct?
5. Are required files present?
6. Are permissions correct?
7. Are required libraries present?
8. Are environment variables supplied?
9. Is the expected port configured?
10. Is the image itself vulnerable or corrupted?
```

---

# 104. Architecture Mismatch

Example:

```text
Image → linux/amd64

Host → linux/arm64
```

The image may fail to run without a compatible image variant or emulation.

For multi-platform deployments, publish an image index containing the required architectures.

---

# 105. Missing Shared Library

Minimal images can fail if a required library is missing.

Example:

```text
Application
   │
   ▼
Missing libc / library
   │
   ▼
Startup Failure
```

This is one reason compatibility testing is important when moving from a full base image to a minimal or distroless image.

---

# 106. Image Debugging Strategy

If a minimal production image is hard to debug:

```text
Production Image
      │
      ▼
Use Compatible Debug Image / Ephemeral Debug Environment
```

Do not automatically add debugging tools permanently to the production image.

Keep runtime images minimal where practical.

---

# 107. Image Security Pipeline

A mature image pipeline:

```text
Source
  │
  ▼
Dockerfile Validation
  │
  ▼
Build
  │
  ▼
Image Scan
  │
  ├── CVEs
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

# 108. Image Policy Gates

A CI/CD system may reject an image if:

```text
Critical Vulnerability
Secret Detected
Unapproved Base Image
Unsigned Image
Unknown Provenance
Untrusted Registry
Policy Violation
```

Example:

```text
Image
 │
 ▼
Security Policy
 │
 ├── PASS → Registry
 │
 └── FAIL → Pipeline Stops
```

---

# 109. Vulnerability Exceptions

Sometimes a vulnerability cannot immediately be fixed.

An enterprise exception process should capture:

```text
CVE
Affected Image
Business Owner
Reason
Compensating Controls
Risk Acceptance
Expiration Date
Remediation Plan
```

Avoid permanent "ignore" rules without governance.

---

# 110. Image Scanning Frequency

Scanning can happen at multiple points:

```text
Build Time
Registry Push
Deployment Time
Scheduled Rescan
```

Scheduled rescans matter because:

```text
Image unchanged
      │
      ▼
New CVE published
      │
      ▼
Previously safe image becomes vulnerable
```

---

# 111. Container Image Incident Response

If a production image is found vulnerable:

```text
Identify Image
    │
    ▼
Find Affected Components
    │
    ▼
Check SBOM
    │
    ▼
Assess Exposure
    │
    ▼
Patch / Rebuild
    │
    ▼
Scan
    │
    ▼
Sign
    │
    ▼
Redeploy
```

For high-severity issues, consider accelerated emergency deployment procedures.

---

# 112. Image Supply Chain

The supply chain can be represented as:

```text
Developer
   │
   ▼
Source Repository
   │
   ▼
Build System
   │
   ▼
Base Image
   │
   ▼
Dependencies
   │
   ▼
Container Image
   │
   ▼
Registry
   │
   ▼
Deployment
```

Each stage can introduce risk.

---

# 113. Trusted Build

A trusted image pipeline should control:

```text
Source
Build Runner
Dependencies
Base Images
Build Secrets
Registry
Signing Keys
Provenance
```

The image should have a verifiable path from source to deployment.

---

# 114. Image Security Best Practices

```text
1. Use trusted base images.
2. Pin important versions.
3. Regularly refresh base images.
4. Use multi-stage builds.
5. Run as non-root.
6. Do not bake secrets into images.
7. Scan images.
8. Generate SBOMs.
9. Sign images.
10. Verify signatures where possible.
11. Record image digests.
12. Use approved registries.
13. Remove unnecessary packages.
14. Keep runtime images minimal.
15. Track image provenance.
```

---

# 115. Practical Java Image

Example:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/payments.jar app.jar

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build:

```bash
docker build -t payments:1.0.0 .
```

Inspect:

```bash
docker image inspect payments:1.0.0
```

Run:

```bash
docker run \
  --name payments \
  -p 8080:8080 \
  payments:1.0.0
```

---

# 116. Practical Multi-Stage Java Image

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /src

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /src/target/*.jar app.jar

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Flow:

```text
Source
 │
 ▼
Maven Build Image
 │
 ▼
JAR
 │
 ▼
Java Runtime Image
 │
 ▼
Final Image
```

---

# 117. Practical Node.js Image

Example:

```dockerfile
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

USER node

CMD ["node", "dist/server.js"]
```

The exact base and runtime strategy should follow the application's compatibility and security requirements.

---

# 118. Image Checklist for Production

```text
Build
[ ] Reproducible
[ ] Versioned
[ ] Appropriate base
[ ] Multi-stage where useful
[ ] Minimal runtime

Security
[ ] No secrets
[ ] Non-root
[ ] Vulnerability scan
[ ] SBOM
[ ] Provenance
[ ] Signature

Distribution
[ ] Trusted registry
[ ] Controlled tags
[ ] Digest recorded
[ ] Retention policy

Operations
[ ] Metadata
[ ] Health check where useful
[ ] Logging
[ ] Monitoring
[ ] Rollback image available
```

---

# 119. Common Image Anti-Patterns

## `FROM latest`

```dockerfile
FROM ubuntu:latest
```

Problem:

```text
Build result can change unexpectedly.
```

Prefer controlled versions and a regular update process.

---

## Secrets in Dockerfile

```dockerfile
ENV PASSWORD=secret
```

Problem:

```text
Secret can become part of image configuration/history.
```

---

## Installing Everything

```text
Compiler
Debugger
Package Manager
Shell Tools
Source Code
Build Cache
```

Problem:

```text
Larger Image
Larger Attack Surface
```

Use multi-stage builds.

---

## One Huge RUN Script

Large complicated build commands can be difficult to maintain and troubleshoot.

Use clear, intentional Dockerfile steps while still considering layer and cache behavior.

---

## Manual Image Modification

Do not treat an image as a mutable server.

Build a new image instead.

---

# 120. Interview Questions

## Beginner

### What is a Docker image?

A packaged artifact used to create containers.

### What is the difference between an image and a container?

An image is the packaged artifact; a container is an instance created from it.

### What is a Docker image layer?

A filesystem change layer that contributes to the image filesystem.

### What is a Docker tag?

A human-readable reference to image content.

---

## Intermediate

### Why are Docker images layered?

Layers enable caching, reuse, deduplication, and efficient distribution.

### What is the difference between a tag and digest?

A tag is a human-friendly reference that can move; a digest identifies specific content.

### Why should `latest` not be blindly used in production?

It is mutable and does not guarantee a particular version or security state.

### What is a multi-stage build?

A build using multiple stages so build-time dependencies can be excluded from the final runtime image.

---

## Advanced

### What is an OCI image manifest?

A descriptor structure that references image configuration and filesystem layers.

### What is an image index?

A higher-level structure that can reference platform-specific image manifests.

### Why can deleting a secret in a later Dockerfile instruction be unsafe?

Because the secret may remain in an earlier image layer.

### Why is digest pinning useful?

It identifies exact image content and improves deployment reproducibility.

### Why is image scanning insufficient by itself?

It detects known issues but does not replace secure source code, dependency management, build security, provenance, signing, runtime controls, and monitoring.

---

# 121. Complete Image Mental Model

```text
                         DOCKER IMAGE
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
       CONFIG              MANIFEST            LAYERS
          │                   │                   │
          │                   │          ┌────────┼────────┐
          │                   │          │        │        │
          ▼                   ▼          ▼        ▼        ▼
      Entrypoint           Digests    Base     Runtime    App
      CMD                  Descriptors Layer    Layer     Layer
      ENV
      USER
      WORKDIR
          │
          └───────────────────┬───────────────────┘
                              ▼
                         IMAGE DIGEST
                              │
                              ▼
                           REGISTRY
                              │
                              ▼
                          CONTAINER
```

---

# 122. Complete Image Supply-Chain Model

```text
                         SOURCE
                           │
                           ▼
                       Dockerfile
                           │
                           ▼
                     Build System
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Base Image   Dependencies   Build Tools
              │            │            │
              └────────────┼────────────┘
                           ▼
                          IMAGE
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           Scan          SBOM       Provenance
              │            │            │
              └────────────┼────────────┘
                           ▼
                         SIGN
                           │
                           ▼
                        REGISTRY
                           │
                           ▼
                       VERIFY
                           │
                           ▼
                        DEPLOY
                           │
                           ▼
                       CONTAINER
```

---

# 123. Image Lifecycle Summary

```text
1. Define Dockerfile
        │
        ▼
2. Select Base Image
        │
        ▼
3. Build
        │
        ▼
4. Create Layers
        │
        ▼
5. Produce Image
        │
        ▼
6. Scan
        │
        ▼
7. Generate SBOM
        │
        ▼
8. Generate Provenance
        │
        ▼
9. Sign
        │
        ▼
10. Push to Registry
        │
        ▼
11. Promote
        │
        ▼
12. Pull
        │
        ▼
13. Run as Container
```

---

# 124. Key Takeaways

Remember these principles:

```text
1. Image = Packaged Deployment Artifact

2. Container = Runtime Instance of Image

3. Images Are Layered

4. Layers Enable Caching and Reuse

5. Tags Are References

6. Digests Identify Exact Content

7. latest Is Not Automatically "Newest"

8. Multi-Stage Builds Reduce Runtime Image Size

9. Base Images Matter for Security

10. Do Not Put Secrets in Images

11. Scan Images for Vulnerabilities

12. Generate an SBOM

13. Track Provenance

14. Sign and Verify Images

15. Promote the Same Image Across Environments

16. Record the Production Image Digest

17. Refresh Images Regularly for Security Updates

18. Treat Published Images as Immutable Artifacts
```

The core mental model is:

```text
DOCKERFILE
    │
    ▼
   BUILD
    │
    ▼
   IMAGE
    │
    ├── Layers
    ├── Config
    ├── Metadata
    └── Digest
    │
    ▼
 REGISTRY
    │
    ▼
 CONTAINER
```

> **The image is the immutable-style artifact that connects application source code to a reproducible container runtime.**

---

# 125. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`container.md`](container.md)
- [`dockerfile.md`](dockerfile.md)
- [`build.md`](build.md)
- [`run.md`](run.md)
- [`network.md`](network.md)
- [`volume.md`](volume.md)
- [`registry.md`](registry.md)
