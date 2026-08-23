# Artifact & Version Management

## 1. What is an Artifact?

An **artifact** is a build output produced by a software build process.

Examples include:

- JAR
- WAR
- ZIP
- TAR
- Docker image
- Python package
- npm package
- Binary executable

For a Java/Maven application, a typical artifact may be:

```text
payment-service-1.2.0.jar
```

A simplified flow is:

```text
Source Code
    |
    v
   Build
    |
    v
 Artifact
    |
    v
Artifact Repository
```

---

## 2. Why Artifact Management is Important

In a CI/CD environment, artifacts should be stored centrally so that the same build output can be used across environments.

For example:

```text
Developer
    |
    v
Git
    |
    v
CI Build
    |
    v
Artifact
    |
    v
Nexus / Artifactory
    |
    +---- DEV
    |
    +---- QA
    |
    +---- UAT
    |
    +---- PROD
```

The important principle is:

> **Build once, promote the same artifact through environments.**

This helps ensure that the artifact tested in QA is the same artifact deployed to production.

---

# 3. What is Artifact Versioning?

Artifact versioning identifies different versions of an application or library.

For example:

```text
payment-service-1.0.0.jar
payment-service-1.1.0.jar
payment-service-1.2.0.jar
payment-service-2.0.0.jar
```

Each version represents a particular state of the application.

---

# 4. Maven Artifact Coordinates

A Maven artifact is primarily identified by:

```text
groupId
artifactId
version
```

Example:

```xml
<groupId>com.example</groupId>
<artifactId>payment-service</artifactId>
<version>1.2.0</version>
```

Conceptually:

```text
com.example : payment-service : 1.2.0
```

These coordinates are used to identify the artifact in Maven repositories.

---

# 5. Artifact Naming

A typical Maven JAR name is:

```text
artifactId-version.jar
```

For example:

```text
payment-service-1.2.0.jar
```

Where:

```text
payment-service → artifactId

1.2.0 → version
```

---

# 6. Versioning Strategy

A version should clearly communicate the evolution of the application.

A commonly used approach is:

```text
MAJOR.MINOR.PATCH
```

For example:

```text
1.4.2
```

Where:

```text
1 → MAJOR
4 → MINOR
2 → PATCH
```

This approach is commonly known as **Semantic Versioning**.

---

# 7. Semantic Versioning

Semantic Versioning generally follows:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
2.5.3
```

### MAJOR

Increment when there are incompatible or breaking changes.

Example:

```text
1.5.0
   |
   v
2.0.0
```

---

### MINOR

Increment when new functionality is added in a backward-compatible way.

Example:

```text
1.4.0
   |
   v
1.5.0
```

---

### PATCH

Increment when backward-compatible bug fixes are released.

Example:

```text
1.4.2
   |
   v
1.4.3
```

---

# 8. Version Increment Example

Consider:

```text
1.2.3
```

A breaking change may result in:

```text
2.0.0
```

A backward-compatible feature may result in:

```text
1.3.0
```

A bug fix may result in:

```text
1.2.4
```

Conceptually:

```text
              1.2.3
                |
       +--------+--------+
       |        |        |
       v        v        v
    2.0.0    1.3.0    1.2.4
   Breaking   Feature    Fix
```

---

# 9. SNAPSHOT Versions

Maven supports development versions using the `SNAPSHOT` suffix.

Example:

```text
1.0.0-SNAPSHOT
```

A SNAPSHOT represents a version that is still under development.

It can change as new builds are produced.

Example:

```text
1.0.0-SNAPSHOT
       |
       +---- Build 101
       |
       +---- Build 102
       |
       +---- Build 103
```

The exact repository representation of snapshots is managed by Maven and the artifact repository.

---

# 10. Release Versions

A release version represents a finalized version.

Example:

```text
1.0.0
```

Compared with:

```text
1.0.0-SNAPSHOT
```

A release should generally be treated as immutable.

Conceptually:

```text
Development
     |
     v
1.0.0-SNAPSHOT
     |
     | Release
     v
1.0.0
```

---

# 11. SNAPSHOT vs Release

| Feature | SNAPSHOT | Release |
|---|---|---|
| Purpose | Development | Stable release |
| Example | `1.0.0-SNAPSHOT` | `1.0.0` |
| Can change | Yes | Should not change |
| Repository | Snapshot repository | Release repository |
| Usage | Development/testing | Production/stable consumption |

A common repository structure is:

```text
Repository
    |
    +---- Releases
    |
    +---- Snapshots
```

---

# 12. Release Repository

A release repository stores finalized artifacts.

Example:

```text
payment-service-1.0.0.jar
payment-service-1.1.0.jar
payment-service-2.0.0.jar
```

Once published, a release artifact should not normally be overwritten.

This makes deployments reproducible.

---

# 13. Snapshot Repository

A snapshot repository stores development artifacts.

Example:

```text
payment-service-1.2.0-SNAPSHOT
```

The artifact may be updated by subsequent development builds.

Snapshot repositories are generally intended for development and testing rather than permanent production releases.

---

# 14. Artifact Repository

An artifact repository is a central system used to store and distribute build artifacts.

Examples include:

- Nexus Repository
- JFrog Artifactory

Conceptually:

```text
                 Artifact Repository
                         |
             +-----------+-----------+
             |                       |
             v                       v
        Dependencies             Artifacts
             |                       |
             v                       v
          Download                Publish
```

---

# 15. Artifact Repository in CI/CD

A typical CI/CD process is:

```text
Developer
    |
    v
Git Push
    |
    v
CI Pipeline
    |
    v
Build
    |
    v
Test
    |
    v
Package
    |
    v
Artifact
    |
    v
Nexus / Artifactory
    |
    v
Deployment
```

---

# 16. Build Once, Deploy Many

One of the important CI/CD principles is:

> **Build once and deploy the same artifact to multiple environments.**

Example:

```text
Source Code
    |
    v
CI Build
    |
    v
payment-service-1.2.0.jar
    |
    v
Artifact Repository
    |
    +---- DEV
    |
    +---- QA
    |
    +---- UAT
    |
    +---- PROD
```

The application should not normally be rebuilt separately for every environment.

Instead:

```text
Same Artifact
      |
      +---- DEV
      +---- QA
      +---- UAT
      +---- PROD
```

Environment-specific configuration should be supplied appropriately during deployment.

---

# 17. Why Rebuilding for Each Environment is Risky

Consider:

```text
Build for DEV
    |
    v
Artifact A

Build for QA
    |
    v
Artifact B

Build for PROD
    |
    v
Artifact C
```

Artifact A, B and C may differ.

This can create uncertainty about what was actually tested.

A better approach is:

```text
Build Once
    |
    v
Artifact A
    |
    +---- DEV
    |
    +---- QA
    |
    +---- UAT
    |
    +---- PROD
```

The same artifact is promoted through the pipeline.

---

# 18. Build Number vs Application Version

These are not necessarily the same thing.

### Application Version

Represents the software release.

Example:

```text
1.4.2
```

### Build Number

Identifies a particular CI build.

Example:

```text
Build #1523
```

Conceptually:

```text
Application Version
       |
       v
     1.4.2
       |
       +---- Build #1520
       +---- Build #1521
       +---- Build #1522
       +---- Build #1523
```

A project can use both application version and CI build number.

---

# 19. Git Commit vs Artifact Version

A Git commit identifies a specific source-code state.

An artifact version identifies a build output.

For example:

```text
Git Commit
    |
    v
abc1234
    |
    v
CI Build
    |
    v
Artifact
    |
    v
payment-service-1.2.0.jar
```

It is useful for CI/CD systems to maintain traceability between:

```text
Git Commit
      |
      v
CI Build
      |
      v
Artifact
      |
      v
Deployment
```

---

# 20. Traceability

A good CI/CD system should allow you to answer:

> Which source code produced this artifact?

and:

> Which artifact is currently deployed?

For example:

```text
Git Commit
   |
   v
Build #1523
   |
   v
payment-service-1.2.0.jar
   |
   v
Production
```

This provides deployment traceability.

---

# 21. Version in Maven `pom.xml`

The application version is commonly defined in `pom.xml`.

Example:

```xml
<groupId>com.example</groupId>
<artifactId>payment-service</artifactId>
<version>1.2.0</version>
```

Maven can then generate an artifact such as:

```text
payment-service-1.2.0.jar
```

---

# 22. Changing the Maven Version

A version can be changed in `pom.xml`.

For example:

```xml
<version>1.2.0</version>
```

to:

```xml
<version>1.3.0</version>
```

The next build will produce an artifact associated with version `1.3.0`.

Example:

```text
Before:
payment-service-1.2.0.jar

After:
payment-service-1.3.0.jar
```

Version changes should normally follow the project's agreed versioning strategy.

---

# 23. Maven Versions in Multi-Module Projects

In a multi-module project, multiple modules may share a common version.

Example:

```text
company-application
    |
    +---- payment-service
    |
    +---- customer-service
    |
    +---- common-library
```

The parent POM may define:

```xml
<version>1.5.0</version>
```

Child modules can inherit the parent version.

This helps keep module versions consistent.

---

# 24. Version Management Using a Parent POM

Example parent:

```xml
<project>

    <groupId>com.example</groupId>
    <artifactId>company-parent</artifactId>
    <version>1.5.0</version>
    <packaging>pom</packaging>

</project>
```

A child project can inherit from it:

```xml
<parent>

    <groupId>com.example</groupId>
    <artifactId>company-parent</artifactId>
    <version>1.5.0</version>

</parent>
```

This reduces repeated configuration.

---

# 25. Version Management and CI/CD

A CI pipeline can automate version management.

Example:

```text
Git Commit
    |
    v
CI Pipeline
    |
    v
Determine Version
    |
    v
Update/Build
    |
    v
Test
    |
    v
Package
    |
    v
Publish Artifact
```

The exact versioning mechanism depends on the team's release strategy.

---

# 26. Version from Git Tags

Git tags can be used as release markers.

Example:

```text
Git
 |
 +---- v1.0.0
 |
 +---- v1.1.0
 |
 +---- v1.2.0
```

A CI pipeline can use a Git tag as part of its release process.

For example:

```text
Git Tag
   |
   v
v1.2.0
   |
   v
CI Build
   |
   v
Artifact
   |
   v
1.2.0 Release
```

This provides a strong connection between source control and artifact versioning.

---

# 27. Tagging a Release

A release can be tagged in Git:

```bash
git tag v1.2.0
git push origin v1.2.0
```

The CI pipeline can then recognize the tag and perform a release build.

A common flow is:

```text
Code
 |
 v
Merge to Main
 |
 v
Create Tag
 |
 v
v1.2.0
 |
 v
CI
 |
 v
Build
 |
 v
Test
 |
 v
Package
 |
 v
Publish
```

---

# 28. Versioning Strategy Example

Suppose the current version is:

```text
1.4.2
```

### Bug Fix

```text
1.4.3
```

### New Backward-Compatible Feature

```text
1.5.0
```

### Breaking Change

```text
2.0.0
```

This provides a predictable way to communicate changes.

---

# 29. Artifact Promotion

Artifact promotion means moving the same artifact through environments or repository stages.

Example:

```text
Artifact
   |
   v
DEV
   |
   v
QA
   |
   v
UAT
   |
   v
PROD
```

The artifact itself remains the same.

Only its deployment status or environment changes.

---

# 30. Promotion vs Rebuild

### Rebuild

```text
Source
  |
  +---- DEV Build → Artifact A
  |
  +---- QA Build  → Artifact B
  |
  +---- PROD Build → Artifact C
```

### Promotion

```text
Source
  |
  v
Single Build
  |
  v
Artifact A
  |
  +---- DEV
  |
  +---- QA
  |
  +---- UAT
  |
  +---- PROD
```

Promotion is generally preferred because it improves consistency and traceability.

---

# 31. Immutable Artifacts

An immutable artifact is an artifact that is not changed after it is published.

For example:

```text
payment-service-1.2.0.jar
```

Once published as a release, the contents should not be replaced with different contents.

If the code changes, create another version:

```text
payment-service-1.2.1.jar
```

or:

```text
payment-service-1.3.0.jar
```

depending on the type of change.

---

# 32. Why Immutable Artifacts Matter

Immutable artifacts improve:

- Reproducibility
- Traceability
- Rollback
- Security
- Deployment consistency

Example:

```text
Production
    |
    v
payment-service-1.2.0.jar
```

If a rollback is required:

```text
payment-service-1.1.0.jar
```

can be deployed, assuming it is compatible and available.

---

# 33. Artifact Retention

Artifact repositories can contain many versions.

Example:

```text
1.0.0
1.1.0
1.2.0
1.3.0
1.4.0
1.5.0
```

Repositories often use retention policies to remove old artifacts that are no longer needed.

Retention should be designed carefully so that required rollback versions remain available.

---

# 34. Artifact Metadata

An artifact repository may store metadata associated with an artifact.

This can include information such as:

- Artifact coordinates
- Version
- Checksums
- Repository location
- Build metadata
- Publication information

This metadata helps with artifact identification and integrity.

---

# 35. Artifact Integrity

Artifacts can be associated with checksums such as:

```text
SHA-256
```

A checksum can help verify that an artifact has not been altered unexpectedly.

Conceptually:

```text
Artifact
   |
   v
Checksum
   |
   v
Compare
   |
   +---- Match → Expected artifact
   |
   +---- Mismatch → Investigate
```

---

# 36. Artifact Security

Artifact management should consider:

- Dependency vulnerabilities
- Artifact integrity
- Repository access control
- Authentication
- Authorization
- Artifact signing where required
- Secure transport
- Repository security

A secure CI/CD pipeline should control who can publish production artifacts.

---

# 37. Artifact Repository Access

A typical enterprise setup may look like:

```text
Developer
    |
    v
Git
    |
    v
CI Runner
    |
    v
Build
    |
    v
Artifact Repository
```

The CI runner may have permission to:

```text
Download dependencies
Publish build artifacts
```

Access should follow the principle of least privilege.

---

# 38. Release Flow

A typical release process can be:

```text
Feature Development
       |
       v
Pull Request
       |
       v
Code Review
       |
       v
Merge
       |
       v
CI Build
       |
       v
Tests
       |
       v
Security / Quality Checks
       |
       v
Version
       |
       v
Package
       |
       v
Publish Artifact
       |
       v
Deploy
```

---

# 39. Example Maven Release Flow

Suppose the current development version is:

```text
1.3.0-SNAPSHOT
```

After development and validation:

```text
1.3.0-SNAPSHOT
       |
       v
Release
       |
       v
1.3.0
```

Then development can continue toward:

```text
1.4.0-SNAPSHOT
```

A simplified flow:

```text
1.3.0-SNAPSHOT
       |
       | Release
       v
     1.3.0
       |
       v
1.4.0-SNAPSHOT
```

The exact release process depends on the team's Maven and CI/CD tooling.

---

# 40. Example CI/CD Artifact Flow

```text
Developer
    |
    v
Git Push
    |
    v
Pull Request
    |
    v
CI
    |
    +---- Compile
    |
    +---- Unit Test
    |
    +---- Code Quality
    |
    +---- Security Scan
    |
    v
Package
    |
    v
payment-service-1.2.0.jar
    |
    v
Nexus / Artifactory
    |
    v
DEV
    |
    v
QA
    |
    v
UAT
    |
    v
PROD
```

---

# 41. Rollback Using Artifacts

One advantage of versioned artifacts is easier rollback.

Suppose:

```text
Production → 1.2.0
```

A new release is deployed:

```text
Production → 1.3.0
```

If a problem occurs:

```text
1.3.0
   |
   v
Rollback
   |
   v
1.2.0
```

The previous artifact can be redeployed if it is still available and compatible.

---

# 42. Artifact Naming Example

For a Maven project:

```text
groupId:    com.example
artifactId: payment-service
version:    1.2.0
packaging:  jar
```

The resulting artifact can be:

```text
payment-service-1.2.0.jar
```

For a SNAPSHOT:

```text
payment-service-1.3.0-SNAPSHOT
```

The repository may store the snapshot using Maven's snapshot metadata and timestamped snapshot artifacts.

---

# 43. Good Version Management Practices

Recommended practices include:

1. Define a clear versioning strategy.
2. Use consistent version numbers.
3. Separate SNAPSHOT and release artifacts.
4. Avoid overwriting release artifacts.
5. Build once and promote the same artifact.
6. Maintain traceability from Git commit to deployment.
7. Keep important rollback versions.
8. Control artifact repository access.
9. Scan dependencies and artifacts where appropriate.
10. Automate release processes where practical.

---

# 44. Common Mistakes

### Rebuilding for Every Environment

This can result in different artifacts being tested and deployed.

Prefer:

```text
Build Once → Promote
```

---

### Overwriting Release Artifacts

Avoid replacing:

```text
1.2.0
```

with different content.

Create a new version instead.

---

### Using Unclear Versioning

Avoid arbitrary versions such as:

```text
final
latest
new
latest-final
```

Use a predictable versioning strategy.

---

### Losing Build Traceability

You should be able to determine:

```text
Artifact
   |
   v
CI Build
   |
   v
Git Commit
```

---

### Deleting All Previous Artifacts

Do not remove every historical artifact without considering rollback and audit requirements.

---

# 45. Artifact Management Best-Practice Flow

```text
Git
 |
 v
Commit
 |
 v
CI Build
 |
 v
Version
 |
 v
Test
 |
 v
Scan
 |
 v
Package
 |
 v
Artifact
 |
 v
Repository
 |
 v
Promote
 |
 +---- DEV
 |
 +---- QA
 |
 +---- UAT
 |
 +---- PROD
```

---

# 46. Interview Questions

## What is an artifact?

An artifact is a build output produced by a software build process, such as a JAR, WAR, ZIP, binary, or container image.

---

## What is artifact versioning?

Artifact versioning assigns a unique version to a build output so that different releases can be identified and managed.

---

## What are Maven coordinates?

The primary Maven coordinates are:

```text
groupId
artifactId
version
```

---

## What is the difference between SNAPSHOT and Release?

A SNAPSHOT represents a development version that may change.

A release represents a finalized version that should generally remain immutable.

---

## What is Semantic Versioning?

Semantic Versioning uses:

```text
MAJOR.MINOR.PATCH
```

For example:

```text
2.4.1
```

---

## When do you increment MAJOR?

Normally when introducing breaking or incompatible changes.

Example:

```text
1.5.0 → 2.0.0
```

---

## When do you increment MINOR?

Normally when adding backward-compatible functionality.

Example:

```text
1.5.0 → 1.6.0
```

---

## When do you increment PATCH?

Normally for backward-compatible bug fixes.

Example:

```text
1.5.2 → 1.5.3
```

---

## What is an artifact repository?

An artifact repository is a system used to store, manage and distribute build artifacts and dependencies.

Examples:

```text
Nexus
Artifactory
```

---

## What does "Build Once, Deploy Many" mean?

It means the application is built once and the same artifact is promoted through environments such as:

```text
DEV → QA → UAT → PROD
```

instead of rebuilding separately for each environment.

---

## Why are immutable artifacts important?

They improve:

- Reproducibility
- Traceability
- Deployment consistency
- Rollback
- Security

---

## What is the difference between application version and build number?

The application version identifies the software release.

The build number identifies a particular CI build.

Example:

```text
Application Version: 1.2.0
Build Number:       1523
```

---

## How are Git and artifact versions related?

Git identifies source-code history, while the artifact version identifies the resulting build output.

A CI/CD system should maintain traceability:

```text
Git Commit
    |
    v
CI Build
    |
    v
Artifact
    |
    v
Deployment
```

---

## How would you roll back an application?

Deploy a previously validated artifact version from the artifact repository.

Example:

```text
Current: 1.3.0
    |
    v
Rollback
    |
    v
1.2.0
```

---

# 47. Key Takeaway

Artifact and version management provide a controlled way to identify, store, promote and deploy build outputs.

The most important concepts are:

```text
Artifact
    |
    v
Version
    |
    v
Repository
    |
    v
Promotion
    |
    +---- DEV
    +---- QA
    +---- UAT
    +---- PROD
```

Remember:

```text
Artifact
    → Build output

Version
    → Identifies a particular release

SNAPSHOT
    → Development version

Release
    → Stable version

Repository
    → Stores artifacts

Promotion
    → Moves the same artifact through environments

Build Once
    → Create the artifact once

Deploy Many
    → Promote the same artifact
```

The ideal CI/CD flow is:

```text
Git
 |
 v
CI Build
 |
 v
Test
 |
 v
Scan
 |
 v
Package
 |
 v
Versioned Artifact
 |
 v
Artifact Repository
 |
 v
DEV
 |
 v
QA
 |
 v
UAT
 |
 v
PROD
```

The key principle is:

> **Build once, store the artifact, and promote the same artifact through all environments.**
