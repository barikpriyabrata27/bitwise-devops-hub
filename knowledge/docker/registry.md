# Docker Registry

> **A container registry is a service that stores, manages, distributes, and secures container images and related OCI artifacts so that development, CI/CD pipelines, and runtime platforms can reliably consume the same immutable application artifacts.**

This document covers Docker/container registries from fundamentals through enterprise usage, including image naming, tags, digests, authentication, push/pull workflows, private registries, Docker Hub, GitHub Container Registry, AWS ECR, Azure Container Registry, Google Artifact Registry, Harbor, OCI concepts, security, signing, SBOMs, retention, replication, CI/CD, and troubleshooting.

---

# 1. What Is a Container Registry?

A container registry is a repository for container images.

Conceptually:

```text
Developer / CI
      │
      ▼
   Build Image
      │
      ▼
 Push
      │
      ▼
┌───────────────────┐
│ Container Registry│
└─────────┬─────────┘
          │
          ▼
      Pull Image
          │
          ▼
 Runtime Platform
```

Examples:

```text
Docker Hub
GitHub Container Registry
Amazon ECR
Azure Container Registry
Google Artifact Registry
Harbor
Self-Hosted OCI Registries
```

---

# 2. Why Do We Need a Registry?

A registry provides a central location for distributing images.

Without a registry:

```text
Developer
   │
   └── Local Image
```

With a registry:

```text
Developer
   │
   ▼
Registry
   │
   ├── CI/CD
   ├── Test
   ├── Staging
   └── Production
```

The same image artifact can move through the delivery pipeline.

---

# 3. Registry Mental Model

Think of:

```text
Source Code
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
    ├── Tags
    ├── Digests
    ├── Layers
    ├── Metadata
    ├── Manifests
    └── Security Information
    │
    ▼
Deployment
```

---

# 4. Image Registry vs Image Repository

A registry is the service.

A repository is a logical location within that registry.

Example:

```text
Registry:
ghcr.io

Repository:
my-org/payments

Image:
ghcr.io/my-org/payments:1.5.0
```

Conceptually:

```text
Registry
   │
   └── Repository
          │
          ├── Tag 1.4.0
          ├── Tag 1.5.0
          └── Tag latest
```

---

# 5. Image Name Anatomy

Example:

```text
ghcr.io/my-org/payments:1.5.0
```

Break it down:

```text
ghcr.io
   │
   └── Registry Host

my-org
   │
   └── Organization / Namespace

payments
   │
   └── Repository

1.5.0
   │
   └── Tag
```

---

# 6. Docker Hub Image Name

Example:

```text
nginx:1.29
```

Docker uses Docker Hub by default when no registry host is specified and the image reference resolves there.

A fully qualified reference can be:

```text
docker.io/library/nginx:1.29
```

---

# 7. Private Registry Image Name

Example:

```text
registry.example.com/payments/api:1.5.0
```

Breakdown:

```text
registry.example.com
        │
        ▼
   Private Registry

payments/api
        │
        ▼
Repository

1.5.0
  │
  ▼
Tag
```

---

# 8. Registry Port

A registry can run on a custom port.

Example:

```text
registry.example.com:5000/payments/api:1.0.0
```

Here:

```text
registry.example.com:5000
```

is the registry endpoint.

---

# 9. Registry vs Docker Engine

They are different components.

```text
Docker Engine
    │
    ├── Builds Images
    ├── Runs Containers
    └── Pulls / Pushes Images
             │
             ▼
       Container Registry
```

Docker Engine is the runtime/client environment.

The registry stores and distributes images.

---

# 10. Basic Registry Workflow

```text
Dockerfile
    │
    ▼
docker build
    │
    ▼
Local Image
    │
    ▼
docker tag
    │
    ▼
docker push
    │
    ▼
Registry
    │
    ▼
docker pull
    │
    ▼
Runtime
```

---

# 11. Build an Image

Example:

```bash
docker build -t payments:1.0.0 .
```

Local image:

```text
payments:1.0.0
```

---

# 12. Tag for a Registry

Suppose registry is:

```text
registry.example.com
```

Tag:

```bash
docker tag \
  payments:1.0.0 \
  registry.example.com/payments/api:1.0.0
```

Now the same image has a registry-qualified reference.

---

# 13. Login

Example:

```bash
docker login
```

For a private registry:

```bash
docker login registry.example.com
```

Docker stores authentication information according to the configured Docker credential mechanism.

---

# 14. Push an Image

```bash
docker push \
  registry.example.com/payments/api:1.0.0
```

Conceptually:

```text
Local Image
    │
    ▼
Upload Layers
    │
    ▼
Upload Manifest
    │
    ▼
Registry
```

---

# 15. Pull an Image

```bash
docker pull \
  registry.example.com/payments/api:1.0.0
```

Conceptually:

```text
Registry
   │
   ▼
Manifest
   │
   ▼
Required Layers
   │
   ▼
Local Image Store
```

---

# 16. Run an Image from a Registry

```bash
docker run \
  registry.example.com/payments/api:1.0.0
```

If the image is not local, Docker can pull it according to its configured image resolution and pull behavior.

---

# 17. Pull vs Run

```bash
docker pull IMAGE
```

means:

```text
Download Image
```

while:

```bash
docker run IMAGE
```

means:

```text
Obtain Image if Needed
+
Create Container
+
Start Container
```

---

# 18. Image Tags

Examples:

```text
1.0.0
1.1.0
2.0.0
latest
main
dev
staging
production
```

A tag is a human-friendly reference to an image manifest.

---

# 19. Tags Are Mutable

Important:

```text
payments:1.0.0
```

is a tag.

A registry can potentially move a tag to another image unless repository policies prevent it.

Therefore:

```text
Tag ≠ Immutable Identity
```

---

# 20. `latest` Is Just a Tag

A common misconception:

```text
latest = newest image
```

Not necessarily.

`latest` is simply a tag name.

For example:

```text
payments:latest
```

can point to whatever image a publisher currently associates with that tag.

---

# 21. Why `latest` Can Be Dangerous

Production:

```text
deploy payments:latest
```

can produce different results over time.

Today:

```text
latest → Image A
```

Later:

```text
latest → Image B
```

Therefore production deployments should generally use controlled versions and/or digests.

---

# 22. Semantic Version Tags

Good:

```text
1.5.0
1.5
1
```

Depending on your release strategy.

Example:

```text
payments:1.5.0
```

This communicates application version clearly.

---

# 23. Git Commit Tags

Another useful convention:

```text
payments:git-a8f41c2
```

This connects an image to source control.

Example:

```text
Git Commit
   │
   ▼
Build
   │
   ▼
payments:git-a8f41c2
```

---

# 24. Build Metadata Tags

Organizations may use:

```text
payments:1.5.0
payments:build-1842
payments:git-a8f41c2
```

Multiple tags can refer to the same image.

---

# 25. Image Digest

A digest identifies content cryptographically.

Example:

```text
sha256:abcdef123456...
```

An image can be referenced as:

```text
registry.example.com/payments/api@sha256:abcdef...
```

This provides immutable content addressing.

---

# 26. Tag vs Digest

| Tag | Digest |
|---|---|
| Human-friendly | Content-addressed |
| Can move | Identifies exact content |
| Easy for development | Strong for production |
| Version-like | Cryptographic identity |

---

# 27. Production Deployment by Digest

Example:

```bash
docker pull \
  registry.example.com/payments/api@sha256:abcdef...
```

This ensures the runtime references the exact image content represented by that digest.

---

# 28. Best Practice: Version + Digest

Human-readable:

```text
payments:1.5.0
```

Immutable identity:

```text
sha256:...
```

Deployment records can preserve both:

```text
Version: 1.5.0
Digest: sha256:...
```

---

# 29. Registry Manifests

A registry stores an image manifest describing the image content.

Conceptually:

```text
Manifest
   │
   ├── Config
   ├── Layer 1
   ├── Layer 2
   ├── Layer 3
   └── Platform Information
```

The runtime uses the manifest to determine which content to retrieve.

---

# 30. Image Layers

Container images are commonly composed of layers.

Example:

```text
Application Layer
Dependency Layer
Runtime Layer
Base OS Layer
```

When pushing:

```text
Docker
  │
  ▼
Registry
  │
  ├── Layer A
  ├── Layer B
  ├── Layer C
  └── Manifest
```

---

# 31. Layer Reuse

Suppose:

```text
Image A
 ├── Base
 ├── Runtime
 └── App A

Image B
 ├── Base
 ├── Runtime
 └── App B
```

The registry can store shared layers once.

This reduces storage and transfer requirements.

---

# 32. Push Optimization

When pushing:

```text
Docker Client
    │
    ▼
Check Existing Layers
    │
    ├── Already Present → Skip
    │
    └── Missing → Upload
```

This is why rebuilding similar images can still result in efficient registry transfers.

---

# 33. Pull Optimization

Similarly:

```text
Docker Client
    │
    ▼
Check Local Layers
    │
    ├── Present → Reuse
    │
    └── Missing → Download
```

---

# 34. OCI

OCI stands for:

**Open Container Initiative**

OCI defines standards around container images and runtimes.

Important specifications include:

```text
Image Specification
Runtime Specification
Distribution Specification
```

Modern container ecosystems use OCI-compatible formats extensively.

---

# 35. OCI Registry

An OCI-compatible registry can store OCI artifacts and images.

This means the ecosystem extends beyond:

```text
Docker-specific images
```

to broader:

```text
OCI artifacts
```

---

# 36. OCI Artifacts

Registries can store artifacts such as:

```text
Container Images
Helm Charts
SBOMs
Signatures
Attestations
Other OCI-compatible artifacts
```

Exact support depends on the registry.

---

# 37. Docker Registry HTTP API

Registries expose APIs for operations such as:

```text
Catalog / Repository Operations
Manifest Retrieval
Blob Retrieval
Blob Upload
Authentication
```

The exact API behavior depends on registry implementation and specification support.

---

# 38. Docker Distribution Registry

Docker provides an open-source registry implementation commonly known as:

```text
Distribution Registry
```

It can be self-hosted.

Conceptually:

```text
Docker Client
      │
      ▼
Private Registry
      │
      ▼
Storage Backend
```

---

# 39. Self-Hosted Registry

A simple private registry can be run with:

```bash
docker run -d \
  --name registry \
  -p 5000:5000 \
  registry:3
```

This is suitable for experimentation and controlled environments.

For production, secure authentication, TLS, storage, backups, access control, and operational policies are required.

---

# 40. Push to Local Registry

Tag:

```bash
docker tag \
  payments:1.0.0 \
  localhost:5000/payments:1.0.0
```

Push:

```bash
docker push \
  localhost:5000/payments:1.0.0
```

---

# 41. Pull from Local Registry

```bash
docker pull \
  localhost:5000/payments:1.0.0
```

Run:

```bash
docker run \
  localhost:5000/payments:1.0.0
```

---

# 42. Registry Storage

A registry needs persistent storage.

Conceptually:

```text
Registry
   │
   ▼
Storage Backend
   │
   ├── Image Blobs
   ├── Manifests
   └── Metadata
```

A production registry should not depend on ephemeral container storage.

---

# 43. Registry Data Loss

If registry storage is lost:

```text
Registry
   │
   X
Storage Lost
```

images may become unavailable.

Therefore registries need:

```text
Persistent Storage
Backup
Replication
Disaster Recovery
```

---

# 44. Registry TLS

Production registries should use TLS:

```text
Docker Client
      │
    HTTPS
      │
      ▼
Registry
```

Avoid sending registry credentials over insecure transport.

---

# 45. Registry Authentication

Common authentication mechanisms include:

```text
Username / Password
Personal Access Tokens
Cloud IAM
OIDC / Identity Integration
Robot Accounts
Service Principals
Workload Identity
```

The exact mechanism depends on the registry.

---

# 46. Authentication vs Authorization

Authentication:

```text
Who are you?
```

Authorization:

```text
What are you allowed to do?
```

Example:

```text
Developer
 └── Pull payments

CI
 └── Push payments

Production Runtime
 └── Pull payments only
```

---

# 47. Least Privilege

A production runtime should generally need:

```text
PULL
```

not:

```text
PUSH
DELETE
ADMIN
```

CI/CD may need:

```text
PUSH
```

but should not automatically have unrestricted registry administration.

---

# 48. Robot / Service Accounts

For automation:

```text
CI/CD
   │
   ▼
Service Account
   │
   ▼
Registry
```

Prefer dedicated machine identities rather than personal developer credentials.

---

# 49. Credential Rotation

Registry credentials should be:

```text
Short-Lived Where Possible
Rotated
Audited
Stored Securely
Scoped
```

Avoid hard-coding credentials in:

```text
Dockerfiles
Git Repositories
CI Logs
Shell Scripts
Container Images
```

---

# 50. Docker Login Credentials

`docker login` configures registry authentication for Docker CLI usage.

Credential handling depends on Docker's credential store configuration.

For CI/CD, prefer the CI platform's secure credential mechanism.

---

# 51. CI/CD Registry Flow

```text
Git Push
   │
   ▼
CI Pipeline
   │
   ├── Build
   ├── Test
   ├── Scan
   ├── Sign
   └── Push
          │
          ▼
      Registry
          │
          ▼
      Deployment
```

---

# 52. CI Image Tagging Strategy

Example:

```text
payments:1.5.0
payments:git-a8f41c2
payments:build-1842
```

CI should generate traceable image identifiers.

---

# 53. Avoid CI Overwriting Release Tags

Risky:

```text
Every build
   │
   ▼
payments:latest
```

Better:

```text
Build 1842
   │
   ▼
payments:build-1842
```

Then a controlled release can move:

```text
production
```

or another release tag.

---

# 54. Immutable Release Tags

A strong enterprise policy can prevent tags such as:

```text
1.5.0
```

from being overwritten.

Then:

```text
1.5.0 → Immutable
```

This improves reproducibility.

---

# 55. Registry Promotion

A common promotion model:

```text
Build
 │
 ▼
CI Registry Repository
 │
 ▼
Scan / Test
 │
 ▼
Promotion
 │
 ▼
Production Repository
```

Another model keeps one repository and promotes by deployment metadata.

Choose according to governance and registry capabilities.

---

# 56. Build Once, Deploy Many

A key CI/CD principle:

```text
Source
  │
  ▼
Build Once
  │
  ▼
Image
  │
  ▼
Registry
  │
  ├── Dev
  ├── Test
  ├── Stage
  └── Production
```

Do not rebuild a supposedly identical production image from source if the goal is artifact immutability.

---

# 57. Same Image Across Environments

Use:

```text
Same Image
   │
   ├── Development Configuration
   ├── Test Configuration
   └── Production Configuration
```

This reduces:

```text
Environment Drift
```

---

# 58. Registry and Supply Chain

A registry is part of the software supply chain.

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
Registry
  │
  ▼
Deployment
```

Security should cover the entire path.

---

# 59. Image Vulnerability Scanning

Registries may integrate vulnerability scanning.

Conceptually:

```text
Image
  │
  ▼
Registry
  │
  ▼
Scanner
  │
  ├── OS Vulnerabilities
  ├── Library Vulnerabilities
  └── Severity
```

Examples of scanning technologies include:

```text
Trivy
Grype
Clair
Cloud-native registry scanners
```

Use the scanner supported by your organization's platform.

---

# 60. Scan on Push

A common policy:

```text
Image Push
   │
   ▼
Automatic Scan
   │
   ├── Pass → Available
   │
   └── Fail → Block / Quarantine / Alert
```

The exact enforcement depends on registry and policy tooling.

---

# 61. Vulnerability Severity

Common severity levels:

```text
Critical
High
Medium
Low
Unknown
```

Organizations should define policies such as:

```text
No Critical vulnerabilities
No High vulnerabilities above accepted exception threshold
```

---

# 62. Vulnerability Exceptions

Sometimes a vulnerability cannot immediately be fixed.

Use controlled exceptions:

```text
Vulnerability
    │
    ▼
Risk Assessment
    │
    ▼
Exception
    │
    ├── Owner
    ├── Reason
    ├── Expiration
    └── Compensating Controls
```

Avoid permanent blanket exceptions.

---

# 63. SBOM

SBOM means:

**Software Bill of Materials**

It describes software components contained in an artifact.

Conceptually:

```text
Container Image
     │
     ▼
SBOM
     │
     ├── OS Packages
     ├── Libraries
     ├── Versions
     └── Dependencies
```

---

# 64. Why SBOM Matters

If a new vulnerability is discovered:

```text
CVE
 │
 ▼
Which images contain affected component?
 │
 ▼
SBOM / Inventory
 │
 ▼
Affected Deployments
```

This improves vulnerability response.

---

# 65. SBOM Formats

Common formats include:

```text
CycloneDX
SPDX
```

Tools such as:

```text
Syft
Trivy
Build tooling
Registry platforms
```

can generate or consume SBOM information.

---

# 66. Image Signing

Image signing provides a way to establish trust in an image artifact.

Conceptually:

```text
Image
  │
  ▼
Signature
  │
  ▼
Registry
  │
  ▼
Deployment Verification
```

---

# 67. Cosign

`cosign` is widely used for container image signing and verification.

Conceptually:

```text
Build
 │
 ▼
Image
 │
 ▼
cosign sign
 │
 ▼
Registry
 │
 ▼
cosign verify
 │
 ▼
Deployment
```

---

# 68. Why Sign Images?

Signing can help answer:

```text
Who produced this artifact?
Was it modified?
Is it from an approved build system?
```

Signing should be combined with identity and policy verification.

---

# 69. Provenance

Provenance provides information about how an artifact was built.

Conceptually:

```text
Source Commit
     │
     ▼
Build Pipeline
     │
     ▼
Builder Identity
     │
     ▼
Image
     │
     ▼
Provenance Attestation
```

---

# 70. SLSA

SLSA is a framework for improving software supply-chain security.

It addresses areas such as:

```text
Build Integrity
Provenance
Source / Build Trust
Artifact Verification
```

It can complement:

```text
Image Signing
SBOM
CI/CD Security
```

---

# 71. Registry as a Trust Boundary

A registry can be a controlled boundary:

```text
Untrusted Build Output
        │
        ▼
Security Controls
        │
        ├── Scan
        ├── Sign
        ├── SBOM
        ├── Policy
        └── Approval
        │
        ▼
Trusted Artifact
```

---

# 72. Image Promotion Policy

Example:

```text
Build
 │
 ▼
Scan
 │
 ▼
Test
 │
 ▼
Sign
 │
 ▼
Promote
 │
 ▼
Production
```

This is stronger than allowing arbitrary production image pushes.

---

# 73. Private Registry

A private registry is appropriate when images contain:

```text
Proprietary Code
Internal Applications
Sensitive Components
Enterprise Software
```

Access should be controlled through identity and authorization.

---

# 74. Docker Hub

urlDocker Hubhttps://hub.docker.com/ is a widely used public container registry.

Typical workflow:

```bash
docker login
docker tag myapp:1.0 username/myapp:1.0
docker push username/myapp:1.0
```

Docker Hub supports public and private repositories depending on account and plan configuration.

---

# 75. GitHub Container Registry

urlGitHub Container Registryhttps://ghcr.io/ is GitHub's container/package registry.

Typical image reference:

```text
ghcr.io/OWNER/IMAGE:TAG
```

Common enterprise use:

```text
GitHub Repository
       │
       ▼
GitHub Actions
       │
       ▼
GHCR
       │
       ▼
Deployment
```

---

# 76. Amazon Elastic Container Registry

urlAmazon ECRhttps://aws.amazon.com/ecr/ is AWS's managed container registry service.

Typical architecture:

```text
AWS Account
    │
    ▼
ECR Repository
    │
    ├── Image
    ├── Tags
    └── Digests
```

Authentication is integrated with AWS identity mechanisms.

---

# 77. Azure Container Registry

urlAzure Container Registryhttps://azure.microsoft.com/products/container-registry/ is Microsoft's managed container registry.

Typical flow:

```text
Azure DevOps / GitHub Actions
          │
          ▼
        ACR
          │
          ▼
Azure Container Apps / AKS / VMs
```

Azure identity and access controls can be used to manage registry access.

---

# 78. Google Artifact Registry

urlGoogle Artifact Registryhttps://cloud.google.com/artifact-registry is Google's managed artifact repository service.

It supports container images and other artifact types.

Typical flow:

```text
Cloud Build / CI
      │
      ▼
Artifact Registry
      │
      ▼
GKE / Cloud Run / Other Runtime
```

---

# 79. Harbor

urlHarborhttps://goharbor.io/ is an open-source registry platform commonly used for private enterprise registries.

It can provide capabilities such as:

```text
Private Repositories
RBAC
Vulnerability Scanning Integration
Image Replication
Signing / Trust Features
Project Management
```

Capabilities depend on the deployed Harbor version and configuration.

---

# 80. Registry Comparison

| Registry | Typical Use |
|---|---|
| Docker Hub | Public / general-purpose image distribution |
| GitHub Container Registry | GitHub-centric development and CI/CD |
| Amazon ECR | AWS environments |
| Azure Container Registry | Azure environments |
| Google Artifact Registry | Google Cloud environments |
| Harbor | Self-hosted enterprise registry |
| Docker Distribution | Lightweight self-hosted registry implementation |

---

# 81. Cloud Registry Selection

A practical rule:

```text
AWS-heavy environment
      │
      ▼
ECR

Azure-heavy environment
      │
      ▼
ACR

Google Cloud-heavy environment
      │
      ▼
Artifact Registry

GitHub-centric workflow
      │
      ▼
GHCR

Self-hosted / multi-cloud requirement
      │
      ▼
Harbor / OCI-compatible registry
```

This is a starting point, not a universal rule.

---

# 82. Registry Replication

Enterprise registries may replicate images:

```text
Registry A
    │
    ▼
Replication
    │
    ▼
Registry B
```

Use cases:

```text
Disaster Recovery
Multi-Region
Multi-Cloud
Edge Locations
Data Residency
```

---

# 83. Registry Geo-Replication

Conceptually:

```text
              Global Registry
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Region A  Region B  Region C
```

This can reduce pull latency and improve availability depending on the platform.

---

# 84. Registry Caching / Pull Through Cache

A registry can sometimes act as a cache:

```text
Runtime
   │
   ▼
Enterprise Registry
   │
   ├── Cached Image
   │
   └── Upstream Registry
```

Benefits:

```text
Reduced External Dependency
Faster Pulls
Centralized Policy
Reduced Internet Traffic
```

---

# 85. Pull-Through Cache

Example use case:

```text
Developer
   │
   ▼
Corporate Registry
   │
   ▼
Docker Hub
```

The organization can control and cache upstream images.

---

# 86. Registry Retention

Registries accumulate images.

Example:

```text
payments:build-1001
payments:build-1002
payments:build-1003
...
payments:build-9000
```

Without retention:

```text
Storage Usage ↑
```

---

# 87. Retention Policy

Example:

```text
Keep:
- Last 30 release images
- All production versions
- Images from last 90 days

Delete:
- Old untagged images
- Expired build artifacts
```

Actual policy should match compliance and rollback requirements.

---

# 88. Untagged Images

An image manifest may become untagged when a tag is moved or deleted.

These artifacts can consume storage.

Registry cleanup should distinguish:

```text
Untagged
Unused
Referenced
Production
```

before deletion.

---

# 89. Registry Garbage Collection

Some registry implementations support garbage collection to reclaim blobs that are no longer referenced.

Conceptually:

```text
Tags / Manifests
      │
      ▼
Referenced Blobs
      │
      └── Keep

Unreferenced Blobs
      │
      ▼
Garbage Collection
      │
      ▼
Delete
```

The exact process depends on the registry implementation.

---

# 90. Registry Storage Optimization

Reduce unnecessary storage by:

```text
Using Efficient Base Images
Layer Reuse
Retention Policies
Removing Unused Artifacts
Avoiding Duplicate Builds
```

---

# 91. Image Size and Registry

Large images cause:

```text
Slow Push
Slow Pull
More Storage
Longer Deployment
More Network Traffic
```

Optimize with:

```text
Multi-Stage Builds
Minimal Runtime Images
Dependency Cleanup
`.dockerignore`
```

---

# 92. Registry Availability

Production deployment depends on registry availability.

If:

```text
Runtime
  │
  ▼
Needs Image
  │
  X
Registry unavailable
```

new deployments or scaling operations may fail.

Existing containers may continue running if their images are already local.

---

# 93. Registry Dependency Strategy

For critical systems consider:

```text
High Availability
Replication
Regional Registry
Local Cache
Disaster Recovery
Image Pre-Pull
```

---

# 94. Image Pre-Pulling

A runtime can pre-pull critical images:

```text
Registry
   │
   ▼
Host Cache
   │
   ▼
Deployment
```

This can reduce startup latency and dependency on immediate registry availability.

---

# 95. Registry Access from Production

Production runtime identity should generally have:

```text
Pull
```

permission only.

Example:

```text
Production Node
      │
      ▼
Registry
      │
      └── PULL
```

Avoid:

```text
PUSH
DELETE
ADMIN
```

unless specifically required.

---

# 96. CI Registry Access

CI usually needs:

```text
Authenticate
Build
Push
Read
```

Potentially:

```text
Scan
Sign
Promote
```

CI credentials should be scoped to the repositories they need.

---

# 97. Developer Registry Access

Developers may need:

```text
Pull
Push to development repositories
```

They should not automatically receive:

```text
Production Delete
Registry Administration
Production Promotion
```

---

# 98. Registry RBAC

Role-based access control can define:

```text
Developer
CI Service Account
Security Scanner
Release Manager
Production Runtime
Registry Administrator
```

Each role should have minimum required privileges.

---

# 99. Registry Audit Logs

Enterprise registries may provide auditing for:

```text
Login
Push
Pull
Delete
Permission Changes
Repository Creation
Tag Changes
```

Audit data supports:

```text
Security Investigations
Compliance
Operational Troubleshooting
```

---

# 100. Image Deletion

Deleting:

```text
payments:1.0.0
```

may remove only a tag reference, depending on registry behavior.

The underlying blobs may remain if referenced by other manifests or until garbage collection.

Always understand your registry's deletion semantics.

---

# 101. Registry Disaster Recovery

A registry DR strategy should protect:

```text
Image Data
Manifests
Metadata
Access Configuration
Repository Configuration
Secrets / Credentials
```

Test restoration periodically.

---

# 102. Registry Migration

Typical migration:

```text
Old Registry
    │
    ▼
Pull / Copy
    │
    ▼
New Registry
    │
    ▼
Verify Digest
    │
    ▼
Update Deployments
```

Tools such as registry-native replication or image-copy utilities can simplify migrations.

---

# 103. Preserve Digests During Migration

When moving images:

```text
Old Registry
   │
   ▼
Image Digest
   │
   ▼
New Registry
   │
   ▼
Compare Digest
```

Matching digests provide confidence that the content is unchanged.

---

# 104. Registry Security Threats

Common threats include:

```text
Stolen Credentials
Malicious Image Push
Compromised CI
Image Tampering
Malicious Dependencies
Vulnerable Base Images
Unauthorized Pull
Registry Misconfiguration
Excessive Permissions
```

---

# 105. Registry Security Controls

Use:

```text
TLS
Authentication
RBAC
Least Privilege
Image Scanning
SBOM
Signing
Provenance
Audit Logs
Retention
Replication
Backup
```

---

# 106. Supply Chain Attack Model

```text
Developer
    │
    ▼
Source
    │
    ▼
CI
    │
    X  ← Compromise
    │
    ▼
Malicious Image
    │
    ▼
Registry
    │
    ▼
Production
```

Controls should detect or prevent compromise before deployment.

---

# 107. Trusted Build Pipeline

```text
Source
  │
  ▼
Trusted CI
  │
  ├── Tests
  ├── SAST
  ├── Dependency Scan
  ├── Image Scan
  ├── SBOM
  ├── Sign
  └── Provenance
  │
  ▼
Registry
  │
  ▼
Policy Verification
  │
  ▼
Production
```

---

# 108. Image Admission Policy

A deployment platform can enforce rules such as:

```text
Only trusted registry
Only signed images
No critical vulnerabilities
Approved repository
Approved digest
Required provenance
```

This creates a stronger supply-chain boundary.

---

# 109. Kubernetes Registry Workflow

Typical:

```text
Developer
   │
   ▼
CI
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

Kubernetes nodes pull images from the configured registry.

---

# 110. Kubernetes `imagePullPolicy`

Kubernetes can control when an image is pulled.

Conceptually:

```text
Always
IfNotPresent
Never
```

The exact behavior also depends on image tags and Kubernetes version/runtime semantics.

Production deployments should use deliberate image versioning and digest pinning where appropriate.

---

# 111. Image Pull Secrets

Private registries require authentication.

Kubernetes can use:

```text
imagePullSecrets
```

or platform-native identity mechanisms depending on the environment.

Conceptually:

```text
Pod
 │
 ▼
Registry Credentials / Workload Identity
 │
 ▼
Private Registry
```

---

# 112. Registry and Docker Compose

Compose can reference private images:

```yaml
services:
  api:
    image: registry.example.com/payments/api:1.5.0
```

Docker must have appropriate registry credentials before pulling.

---

# 113. Registry Naming Convention

A strong enterprise convention might be:

```text
registry.example.com/
  team/
    application/
      version
```

Example:

```text
registry.example.com/payments/api:1.5.0
```

---

# 114. Environment Tags

Avoid making environment names the only identity:

```text
payments:production
```

because the underlying content can change.

Prefer:

```text
payments:1.5.0
```

plus deployment metadata indicating:

```text
environment=production
```

---

# 115. Recommended Tag Strategy

A practical strategy:

```text
Release:
payments:1.5.0

Commit:
payments:git-a8f41c2

Build:
payments:build-1842

Optional channel:
payments:stable
```

Use immutable release controls where possible.

---

# 116. Registry Naming Example

```text
registry.example.com/
├── payments/
│   ├── api
│   ├── worker
│   └── frontend
│
├── orders/
│   ├── api
│   └── worker
│
└── platform/
    ├── nginx
    └── sidecar
```

This provides clear ownership boundaries.

---

# 117. Registry Repository Ownership

Each repository should have:

```text
Owner
Team
Lifecycle
Security Policy
Retention Policy
Access Policy
```

Ownership prevents abandoned repositories from accumulating indefinitely.

---

# 118. Image Lifecycle

```text
Build
  │
  ▼
Scan
  │
  ▼
Push
  │
  ▼
Test
  │
  ▼
Sign
  │
  ▼
Promote
  │
  ▼
Deploy
  │
  ▼
Monitor
  │
  ▼
Retain
  │
  ▼
Retire
```

---

# 119. Registry Governance

Enterprise governance should define:

```text
Who can create repositories?
Who can push?
Who can delete?
Who can promote?
How long are images retained?
Which scanners are mandatory?
Are signatures required?
Are SBOMs required?
Which registries are approved?
```

---

# 120. Registry Checklist

```text
[ ] Approved registry
[ ] TLS enabled
[ ] Authentication configured
[ ] RBAC configured
[ ] CI service accounts
[ ] Runtime pull-only identities
[ ] Image naming convention
[ ] Version tagging
[ ] Digest tracking
[ ] Immutable release policy
[ ] Vulnerability scanning
[ ] SBOM
[ ] Image signing
[ ] Provenance
[ ] Audit logs
[ ] Retention policy
[ ] Backup
[ ] Replication where required
[ ] Disaster recovery
```

---

# 121. Troubleshooting: `docker push` Denied

Example:

```text
denied: requested access to the resource is denied
```

Check:

```text
1. docker login
2. Registry hostname
3. Repository name
4. User permissions
5. Token scope
6. Repository existence
```

---

# 122. Troubleshooting: Unauthorized

Example:

```text
unauthorized: authentication required
```

Try:

```bash
docker login registry.example.com
```

Then:

```bash
docker push registry.example.com/team/app:1.0.0
```

For CI, verify the machine identity and token permissions.

---

# 123. Troubleshooting: Manifest Unknown

Example:

```text
manifest unknown
```

Usually indicates:

```text
Wrong Repository
Wrong Tag
Wrong Registry
Image Not Pushed
Image Deleted
```

Verify:

```text
Repository
Tag
Digest
```

---

# 124. Troubleshooting: Image Pull Failure

Check:

```text
Registry DNS
Network Connectivity
Authentication
Repository Permissions
Image Tag
Image Architecture
Registry Availability
```

---

# 125. Troubleshooting: Wrong Architecture

Suppose:

```text
Build → amd64
Runtime → arm64
```

The image may not run as expected.

Use multi-platform builds when required.

---

# 126. Multi-Platform Images

A registry can store a multi-platform image index.

Conceptually:

```text
Image Reference
      │
      ▼
Manifest Index
      │
      ├── linux/amd64
      ├── linux/arm64
      └── other platforms
```

The runtime selects the appropriate platform image.

---

# 127. Docker Buildx

For multi-platform images:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.example.com/payments/api:1.5.0 \
  --push .
```

This builds and pushes a multi-platform image result.

---

# 128. Why Multi-Platform Matters

Modern environments can include:

```text
x86_64 / amd64
ARM64
Cloud ARM instances
Apple Silicon
Edge devices
```

A registry can provide one logical image reference with platform-specific manifests.

---

# 129. Registry Manifest List / Image Index

Conceptually:

```text
payments:1.5.0
      │
      ▼
Image Index
   ├── amd64 digest
   ├── arm64 digest
   └── other platform digest
```

This makes platform selection transparent to the runtime.

---

# 130. Image Digest and Multi-Platform Images

There can be:

```text
Index Digest
```

and:

```text
Platform-specific Image Digest
```

Understand which digest your deployment platform records.

---

# 131. Registry Performance

Registry performance depends on:

```text
Image Size
Layer Count
Layer Reuse
Network Latency
Registry Location
Storage Backend
Compression
Concurrent Pulls
```

For large fleets, caching and regional replication can significantly help.

---

# 132. Image Pull Storm

During a large deployment:

```text
1000 Nodes
   │
   ▼
1000 Image Pulls
   │
   ▼
Registry Load
```

Mitigation:

```text
Registry Scaling
Caching
Pre-Pulling
Rolling Deployment
Regional Replicas
```

---

# 133. Registry Rate Limits

Public registries may enforce:

```text
Pull Limits
Rate Limits
Authentication Requirements
```

For large enterprise deployments, use an appropriate authenticated registry or pull-through cache.

---

# 134. Dependency on Public Registries

Production workloads should not blindly depend on:

```text
Internet
   │
   ▼
Public Registry
```

for every deployment.

Consider:

```text
Private Mirror
Pull-Through Cache
Enterprise Registry
Artifact Replication
```

---

# 135. Base Image Governance

Organizations can control approved base images:

```text
Approved Base Image
        │
        ▼
Development
        │
        ▼
CI
        │
        ▼
Application Image
```

This improves:

```text
Security
Consistency
Patch Management
Compliance
```

---

# 136. Base Image Updates

A vulnerable base image may affect many application images.

Conceptually:

```text
Base Image
    │
    ├── App A
    ├── App B
    ├── App C
    └── App D
```

Organizations need visibility into which images depend on vulnerable base layers.

---

# 137. Registry Metadata

Useful metadata can include:

```text
Owner
Team
Application
Version
Git Commit
Build Number
Environment
Source Repository
Build Pipeline
SBOM
Signature
Provenance
```

Labels and OCI annotations can help connect artifacts to their origin.

---

# 138. Image Labels

Docker image labels can include metadata such as:

```text
org.opencontainers.image.source
org.opencontainers.image.version
org.opencontainers.image.revision
```

These standard-style OCI annotations help improve traceability.

---

# 139. Traceability

A strong chain is:

```text
Production Container
      │
      ▼
Image Digest
      │
      ▼
Image Tag
      │
      ▼
Build ID
      │
      ▼
Git Commit
      │
      ▼
Source Code
```

This is extremely useful during incidents.

---

# 140. Incident Response

Suppose a vulnerability affects:

```text
library-x < 3.2.0
```

Use:

```text
SBOM / Registry Inventory
       │
       ▼
Find affected images
       │
       ▼
Find deployments
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
Redeploy
```

---

# 141. Registry and Zero Trust

A registry should not be considered trusted merely because it is internal.

Use:

```text
Identity
Authorization
Artifact Verification
Network Security
Scanning
Audit
```

to establish trust.

---

# 142. Registry Security Architecture

```text
                    Registry
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      Auth           Scan           Audit
        │              │              │
        ▼              ▼              ▼
       RBAC          CVEs          Logs
        │              │
        └──────┬───────┘
               ▼
             Sign
               │
               ▼
          Policy Check
               │
               ▼
           Deployment
```

---

# 143. Complete Registry Architecture

```text
                         SOURCE CODE
                              │
                              ▼
                         CI / BUILDER
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
                  TEST       SCAN      SBOM
                    │         │         │
                    └─────────┼─────────┘
                              ▼
                            SIGN
                              │
                              ▼
                    ┌──────────────────┐
                    │ CONTAINER REGISTRY│
                    └────────┬─────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
                 ▼           ▼           ▼
              DEV/TEST    STAGING    PRODUCTION
                 │           │           │
                 └───────────┼───────────┘
                             ▼
                          RUNTIME
```

---

# 144. Complete Registry Lifecycle

```text
BUILD
  │
  ▼
TAG
  │
  ▼
SCAN
  │
  ▼
SBOM
  │
  ▼
SIGN
  │
  ▼
PUSH
  │
  ▼
STORE
  │
  ▼
PROMOTE
  │
  ▼
PULL
  │
  ▼
DEPLOY
  │
  ▼
MONITOR
  │
  ▼
PATCH
  │
  ▼
RETIRE
```

---

# 145. Production Registry Strategy

A mature organization generally wants:

```text
Approved Registry
       │
       ├── Private Repositories
       ├── RBAC
       ├── TLS
       ├── Vulnerability Scanning
       ├── SBOM
       ├── Signing
       ├── Provenance
       ├── Immutable Releases
       ├── Retention
       ├── Replication
       ├── Backup
       └── Audit
```

---

# 146. Registry vs Artifact Repository

Modern artifact platforms may store:

```text
Container Images
Helm Charts
Maven Packages
npm Packages
Python Packages
Generic Artifacts
```

A container registry can therefore be part of a larger enterprise artifact-management platform.

---

# 147. Registry and DevSecOps

Registry security fits into DevSecOps:

```text
PLAN
 │
 ▼
CODE
 │
 ▼
BUILD
 │
 ▼
TEST
 │
 ▼
SCAN
 │
 ▼
PACKAGE
 │
 ▼
REGISTRY
 │
 ▼
SIGN
 │
 ▼
DEPLOY
 │
 ▼
MONITOR
```

---

# 148. Registry Governance Policy Example

```text
1. Production images must come from approved registries.

2. Production images must use immutable release identifiers.

3. Critical vulnerabilities require remediation or approved exception.

4. Production images should have SBOM information.

5. Production artifacts should be signed.

6. Runtime identities receive pull-only permissions.

7. CI identities receive push permissions only for required repositories.

8. Registry access is audited.

9. Retention policies are mandatory.

10. Registry data is backed up according to business requirements.
```

---

# 149. Interview Questions

## Beginner

### What is a container registry?

A service that stores and distributes container images and related artifacts.

### What is Docker Hub?

A public container registry platform commonly used to distribute Docker images.

### What does `docker push` do?

Uploads image content and its manifest to a registry.

### What does `docker pull` do?

Downloads the required image content from a registry.

### What is an image tag?

A human-readable reference associated with an image manifest.

---

## Intermediate

### Why are tags not immutable?

A registry can move a tag to a different image unless immutability policies prevent it.

### What is an image digest?

A content-addressed cryptographic identifier for image content.

### Why use digests in production?

They identify the exact image content being deployed.

### What is a private registry?

A registry whose access is controlled rather than publicly available.

### What is a registry repository?

A logical collection/location for related image versions and manifests.

---

## Advanced

### What is OCI?

The Open Container Initiative, which defines open standards for container images, runtimes, and distribution.

### What is an image manifest?

Metadata describing an image configuration and its content layers.

### What is a multi-platform image?

An image reference that points to platform-specific image manifests through an image index/manifest list.

### Why is image signing useful?

It provides a mechanism to verify artifact authenticity and establish trust in the producer.

### What is an SBOM?

A Software Bill of Materials describing software components and dependencies in an artifact.

### What is image provenance?

Information describing where and how an artifact was built.

### Why use a pull-through cache?

To reduce external registry dependency, improve pull performance, and centralize image access.

### Why does registry retention matter?

Without cleanup, old images and unreferenced artifacts can consume large amounts of storage.

---

# 150. Final Key Takeaways

Remember:

```text
1. A registry stores and distributes container images.

2. Docker Engine and the registry are different components.

3. A repository is a logical location inside a registry.

4. Image references commonly contain registry, namespace, repository, and tag.

5. Tags are human-friendly but can be mutable.

6. latest is just a tag; it is not automatically the newest image.

7. Digests provide immutable content-addressed identity.

8. Production deployments should strongly prefer controlled versions and digest pinning where appropriate.

9. Registries store manifests and image layers.

10. Layers can be shared across images.

11. OCI provides open standards for container artifacts and distribution.

12. Private registries protect proprietary images.

13. Authentication determines identity; authorization determines permissions.

14. Use least-privilege registry access.

15. Runtime identities should generally have pull-only access.

16. CI identities need push access only to required repositories.

17. Never hard-code registry credentials in Dockerfiles or source code.

18. Use TLS for registry communication.

19. Vulnerability scanning should be integrated into the image lifecycle.

20. SBOMs improve software-component visibility.

21. Image signing improves artifact trust.

22. Provenance improves build traceability.

23. Build once and deploy the same artifact across environments.

24. Registry retention prevents uncontrolled storage growth.

25. Registry replication can improve availability and reduce geographic latency.

26. Pull-through caching can reduce dependency on public registries.

27. Registry storage itself needs backup and disaster recovery.

28. Multi-platform images support architectures such as amd64 and arm64.

29. Image digests are especially valuable during incident investigation.

30. A registry is a critical part of the software supply chain.

31. Secure the path from source to build to registry to deployment.

32. Treat the registry as a governed enterprise artifact platform, not merely a file store.
```

The core concept is:

```text
SOURCE
  │
  ▼
BUILD
  │
  ▼
IMAGE
  │
  ├── TAG
  ├── DIGEST
  ├── MANIFEST
  ├── LAYERS
  ├── SBOM
  ├── SIGNATURE
  └── PROVENANCE
  │
  ▼
REGISTRY
  │
  ├── STORE
  ├── SCAN
  ├── GOVERN
  ├── REPLICATE
  └── RETAIN
  │
  ▼
PULL
  │
  ▼
DEPLOY
```

> **A container registry is the distribution and trust center for container artifacts. A mature registry strategy combines reliable storage and distribution with identity, access control, vulnerability scanning, SBOMs, signing, provenance, retention, replication, and disaster recovery.**

---

# 151. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`container.md`](container.md)
- [`image.md`](image.md)
- [`dockerfile.md`](dockerfile.md)
- [`build.md`](build.md)
- [`run.md`](run.md)
- [`network.md`](network.md)
- [`volume.md`](volume.md)
