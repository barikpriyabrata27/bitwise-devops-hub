# Nexus and Artifactory

## 1. What is an Artifact Repository?

An **artifact repository** is a centralized system used to store, manage, and distribute software artifacts and dependencies.

Examples include:

- Sonatype Nexus Repository
- JFrog Artifactory

Artifacts can include:

- JAR files
- WAR files
- ZIP files
- Docker images
- Python packages
- npm packages
- NuGet packages
- Helm charts
- Other build outputs

A simplified flow is:

```text
Developer
    |
    v
   Git
    |
    v
CI/CD Pipeline
    |
    v
   Build
    |
    v
 Artifact
    |
    v
Nexus / Artifactory
    |
    +---- DEV
    +---- QA
    +---- UAT
    +---- PROD
```

---

## 2. Why Do We Need an Artifact Repository?

Without an artifact repository, build outputs may need to be stored manually or distributed between systems.

An artifact repository provides a central location to:

- Store artifacts
- Download artifacts
- Store dependencies
- Publish build outputs
- Manage artifact versions
- Control access
- Maintain artifact history
- Support CI/CD pipelines
- Promote artifacts between environments

Conceptually:

```text
             Artifact Repository
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
    Storage      Download       Upload
       |             |             |
       +-------------+-------------+
                     |
                     v
                   CI/CD
```

---

# 3. Nexus vs Artifactory

Two commonly used enterprise artifact repository products are:

```text
Sonatype Nexus Repository
JFrog Artifactory
```

Both can be used to:

- Store artifacts
- Proxy external repositories
- Host internal packages
- Manage dependencies
- Integrate with CI/CD
- Control access
- Support multiple package formats

Conceptually:

```text
                Artifact Repository
                       |
             +---------+---------+
             |                   |
             v                   v
          Nexus             Artifactory
```

They solve similar problems, although their features, terminology, integrations, and administration capabilities differ.

---

# 4. Nexus Repository

**Nexus Repository** is an artifact repository platform from Sonatype.

It can store and serve many package formats.

Examples include:

- Maven
- npm
- Docker
- NuGet
- PyPI
- Helm

A simplified Maven flow is:

```text
Maven Project
     |
     v
   Maven
     |
     +------ Download Dependency
     |
     +------ Upload Artifact
     |
     v
   Nexus
```

---

# 5. Artifactory

**JFrog Artifactory** is an artifact repository platform from JFrog.

It supports multiple package formats and can be integrated into CI/CD pipelines.

Examples include:

- Maven
- Docker
- npm
- NuGet
- PyPI
- Helm

Simplified flow:

```text
Maven Project
     |
     v
   Maven
     |
     +------ Download Dependency
     |
     +------ Upload Artifact
     |
     v
 Artifactory
```

---

# 6. Repository Types

A common repository model contains three important concepts:

```text
Hosted
Proxy
Group / Virtual
```

Different products may use slightly different terminology.

---

# 7. Hosted Repository

A **hosted repository** stores artifacts owned or published by your organization.

Example:

```text
Company Application
        |
        v
      Build
        |
        v
company-payment-service-1.2.0.jar
        |
        v
Hosted Repository
```

The repository contains internally published artifacts.

For example:

```text
releases/
    payment-service/
        1.0.0/
        1.1.0/
        1.2.0/
```

---

# 8. Proxy Repository

A **proxy repository** acts as an intermediary for an external repository.

For example:

```text
Maven Project
     |
     v
Company Repository
     |
     v
Proxy Repository
     |
     v
External Repository
```

Instead of every developer or CI runner directly accessing an external repository, the organization can configure the internal repository to proxy it.

Benefits can include:

- Centralized access
- Caching
- Reduced external traffic
- Better control
- Consistent dependency access

---

# 9. Group / Virtual Repository

A **group** or **virtual** repository can provide a single URL through which multiple repositories can be accessed.

For example:

```text
                Maven
                  |
                  v
          Group / Virtual Repo
             /          \
            /            \
           v              v
      Hosted Repo      Proxy Repo
```

The developer or CI system can use one repository URL instead of configuring multiple repository URLs.

---

# 10. Hosted + Proxy + Group Example

A typical enterprise Maven setup might look like:

```text
                         Maven
                           |
                           v
                   Group / Virtual
                     Repository
                    /           \
                   /             \
                  v               v
             Hosted Repo      Proxy Repo
                  |                |
                  v                v
             Internal         Maven Central
             Artifacts        / External Repo
```

This provides a centralized access point for both internal and external dependencies.

---

# 11. Release Repository

A release repository stores finalized artifacts.

Example:

```text
payment-service-1.0.0.jar
payment-service-1.1.0.jar
payment-service-1.2.0.jar
```

Release artifacts should normally be immutable.

Once:

```text
1.2.0
```

is published, its contents should not normally be replaced with different contents.

---

# 12. Snapshot Repository

A snapshot repository stores development artifacts.

Example:

```text
payment-service-1.3.0-SNAPSHOT
```

A SNAPSHOT represents a version that is still under development.

Example:

```text
Development
     |
     v
1.3.0-SNAPSHOT
     |
     +---- Build
     +---- Test
     +---- Build
     +---- Test
```

Snapshot artifacts may be updated during development.

---

# 13. Release vs Snapshot

| Feature | Release | Snapshot |
|---|---|---|
| Purpose | Stable release | Development |
| Example | `1.2.0` | `1.3.0-SNAPSHOT` |
| Mutable | Normally no | Can change |
| Usage | Production/stable | Development/testing |
| Repository | Release repo | Snapshot repo |

A common setup is:

```text
Artifact Repository
        |
        +---- Releases
        |
        +---- Snapshots
```

---

# 14. Maven Repository Structure

A Maven repository organizes artifacts using Maven coordinates.

For example:

```text
groupId:
com.example

artifactId:
payment-service

version:
1.2.0
```

The repository structure can conceptually look like:

```text
com/
└── example/
    └── payment-service/
        └── 1.2.0/
            ├── payment-service-1.2.0.jar
            ├── payment-service-1.2.0.pom
            └── metadata
```

The exact files and metadata depend on the repository and artifact.

---

# 15. Maven Coordinates

The primary Maven coordinates are:

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

These coordinates identify the artifact.

---

# 16. Publishing a Maven Artifact

A Maven project can publish an artifact using:

```bash
mvn deploy
```

A simplified flow is:

```text
Source Code
     |
     v
Maven Build
     |
     v
Compile
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
mvn deploy
     |
     v
Nexus / Artifactory
```

---

# 17. Downloading Dependencies

Maven can download dependencies from a repository.

Example:

```xml
<dependency>
    <groupId>org.example</groupId>
    <artifactId>example-library</artifactId>
    <version>1.2.0</version>
</dependency>
```

Flow:

```text
pom.xml
   |
   v
Maven
   |
   v
Repository
   |
   v
Dependency
   |
   v
Local ~/.m2/repository
```

---

# 18. Local Repository and Remote Repository

Maven uses a local repository on the machine.

Usually:

```text
~/.m2/repository
```

A remote repository can be:

```text
Nexus
Artifactory
Maven Central
```

The flow is:

```text
                Maven
                  |
         +--------+--------+
         |                 |
         v                 v
 Local Repository      Remote Repository
   ~/.m2/repository    Nexus / Artifactory
```

The local repository can cache dependencies downloaded from remote repositories.

---

# 19. Repository Configuration in pom.xml

A Maven POM can define repositories.

Example:

```xml
<repositories>

    <repository>

        <id>company-repository</id>

        <url>
            https://repo.example.com/repository/maven-public/
        </url>

    </repository>

</repositories>
```

The repository `id` is important because it can be associated with credentials in Maven's `settings.xml`.

---

# 20. Distribution Management

`distributionManagement` is commonly used to define where Maven publishes artifacts.

Example:

```xml
<distributionManagement>

    <repository>

        <id>releases</id>

        <url>
            https://repo.example.com/repository/maven-releases/
        </url>

    </repository>

    <snapshotRepository>

        <id>snapshots</id>

        <url>
            https://repo.example.com/repository/maven-snapshots/
        </url>

    </snapshotRepository>

</distributionManagement>
```

The repository IDs can correspond to credentials configured in `settings.xml`.

---

# 21. `settings.xml`

Maven can use a `settings.xml` file for environment-specific configuration.

Common locations include:

```text
~/.m2/settings.xml
```

It can contain configuration such as:

- Repository credentials
- Servers
- Mirrors
- Profiles
- Repository settings
- Proxy configuration

A simplified example:

```xml
<settings>

    <servers>

        <server>

            <id>releases</id>

            <username>${env.REPO_USER}</username>

            <password>${env.REPO_PASSWORD}</password>

        </server>

    </servers>

</settings>
```

Credentials should be handled securely.

Do not commit passwords or access tokens directly into Git.

---

# 22. Why Credentials Should Not Be in pom.xml

Avoid:

```xml
<username>myuser</username>
<password>mypassword</password>
```

inside a project POM.

The POM is usually stored in source control.

Instead, credentials should be provided securely through mechanisms such as:

```text
settings.xml
Environment variables
CI/CD secret stores
Credential managers
```

---

# 23. Maven `settings.xml` and Server IDs

The `id` in `pom.xml` or repository configuration can correspond to a server entry in `settings.xml`.

Example repository:

```xml
<repository>

    <id>company-releases</id>

    <url>
        https://repo.example.com/releases/
    </url>

</repository>
```

Corresponding server:

```xml
<server>

    <id>company-releases</id>

    <username>${env.REPO_USER}</username>
    <password>${env.REPO_PASSWORD}</password>

</server>
```

The IDs need to correspond so Maven can select the appropriate credentials.

---

# 24. CI/CD and Artifact Repository

A CI pipeline commonly interacts with the artifact repository at two points.

### Download Dependencies

```text
CI Runner
    |
    v
Maven
    |
    v
Nexus / Artifactory
    |
    v
Dependencies
```

### Publish Artifact

```text
CI Runner
    |
    v
Maven
    |
    v
Build Artifact
    |
    v
Nexus / Artifactory
```

---

# 25. Complete CI/CD Flow

A typical Java CI/CD pipeline can look like:

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
CI Pipeline
    |
    +---- Checkout
    |
    +---- Compile
    |
    +---- Unit Test
    |
    +---- Code Quality
    |
    +---- Security Scan
    |
    +---- Package
    |
    v
Artifact
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

# 26. Build Once, Deploy Many

A strong CI/CD principle is:

> **Build once and deploy the same artifact to multiple environments.**

Example:

```text
Git
 |
 v
CI Build
 |
 v
payment-service-1.2.0.jar
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

The artifact should not normally be rebuilt separately for every environment.

---

# 27. Artifact Promotion

Artifact promotion means moving the same artifact through different environments or repository stages.

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

The artifact remains the same.

Only its deployment state or environment changes.

---

# 28. Promotion vs Rebuild

### Rebuild for each environment

```text
Source
 |
 +---- DEV Build → Artifact A
 |
 +---- QA Build  → Artifact B
 |
 +---- PROD Build → Artifact C
```

Artifacts A, B and C may not be identical.

### Promote the same artifact

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

The second approach provides better consistency and traceability.

---

# 29. Repository Access Control

Artifact repositories should have controlled access.

Typical permissions include:

```text
Read
Write
Delete
Admin
```

For example:

```text
Developer
    |
    +---- Read dependencies

CI Service Account
    |
    +---- Read dependencies
    +---- Publish artifacts

Repository Administrator
    |
    +---- Manage repositories
    +---- Manage permissions
```

Access should follow the principle of least privilege.

---

# 30. CI Service Account

A CI pipeline commonly uses a service account to access the artifact repository.

Example:

```text
CI Pipeline
    |
    v
Service Account
    |
    v
Nexus / Artifactory
```

The service account may have permission to:

```text
Download dependencies
Publish artifacts
```

It should not automatically have administrative permissions.

---

# 31. Repository Security

Important security controls include:

- Authentication
- Authorization
- TLS/HTTPS
- Access control
- Secret management
- Audit logging
- Vulnerability scanning
- Artifact integrity
- Repository administration controls

Avoid storing repository passwords directly in source code.

---

# 32. Repository and Dependency Security

An artifact repository can act as a controlled gateway for dependencies.

Conceptually:

```text
Developer / CI
      |
      v
Internal Repository
      |
      v
External Repository
```

The organization can centralize dependency access and apply organizational controls.

Dependency scanning can also help identify vulnerable components.

---

# 33. Proxy Repository and Caching

A proxy repository can cache external dependencies.

Example:

```text
First Request

Maven
  |
  v
Proxy Repository
  |
  v
External Repository
  |
  v
Dependency
```

The dependency may then be cached:

```text
Later Request

Maven
  |
  v
Proxy Repository
  |
  v
Cached Dependency
```

Benefits can include:

- Reduced external downloads
- Faster builds
- Centralized dependency access
- Better resilience when external repositories are temporarily unavailable

---

# 34. Why Organizations Use Internal Repositories

Organizations may use internal artifact repositories to:

- Store proprietary artifacts
- Proxy public dependencies
- Control external dependency access
- Improve build reliability
- Manage versions
- Support CI/CD
- Enforce access controls
- Maintain auditability

A typical setup is:

```text
                   Developers
                       |
                       v
                     CI/CD
                       |
                       v
              Internal Repository
                 /           \
                /             \
               v               v
          Internal         External
          Artifacts       Dependencies
                              |
                              v
                       Public Repository
```

---

# 35. Artifact Retention

Artifact repositories can accumulate many versions.

Example:

```text
1.0.0
1.1.0
1.2.0
1.3.0
1.4.0
1.5.0
```

Repositories may use cleanup or retention policies.

For example:

```text
Keep:
- All releases
- Last 20 snapshots

Delete:
- Old unused snapshots
```

The exact policy depends on organizational requirements.

Retention policies should preserve artifacts required for rollback, audit, and compliance.

---

# 36. Immutable Releases

A release artifact should normally be immutable.

For example:

```text
payment-service-1.2.0.jar
```

Once published, it should not be replaced with a different binary.

If the application changes, publish a new version:

```text
payment-service-1.2.1.jar
```

or:

```text
payment-service-1.3.0.jar
```

depending on the type of change.

---

# 37. Artifact Integrity

Repositories can store or expose checksums for artifacts.

For example:

```text
SHA-256
```

Conceptually:

```text
Artifact
   |
   v
Calculate Checksum
   |
   v
Compare
   |
   +---- Match
   |
   +---- Mismatch → Investigate
```

Checksums can help detect unexpected changes or corruption.

---

# 38. Repository Availability and Build Reliability

If the artifact repository is unavailable, builds may fail when dependencies cannot be downloaded.

A proxy/cache can reduce dependency on external repositories.

Example:

```text
CI
 |
 v
Internal Repository
 |
 +---- Cached dependency → available
 |
 +---- Not cached
          |
          v
      External Repo
```

Good repository availability is therefore important for CI/CD.

---

# 39. Nexus / Artifactory in the Developer Workflow

A developer may have:

```text
Source Code
    |
    v
pom.xml
    |
    v
Maven
    |
    v
Internal Repository
    |
    v
Dependencies
```

After making changes:

```text
Code
 |
 v
mvn clean package
 |
 v
Artifact
```

The artifact can then be published through the appropriate CI/CD process.

---

# 40. Nexus / Artifactory in the CI Workflow

A CI pipeline may perform:

```text
Checkout
   |
   v
Maven
   |
   +---- Download Dependencies
   |
   +---- Compile
   |
   +---- Test
   |
   +---- Scan
   |
   +---- Package
   |
   v
Artifact
   |
   v
Nexus / Artifactory
```

---

# 41. Example Maven Configuration

A project may have:

```xml
<project>

    <groupId>com.example</groupId>
    <artifactId>payment-service</artifactId>
    <version>1.2.0</version>

    <distributionManagement>

        <repository>

            <id>releases</id>

            <url>
                https://repo.example.com/repository/releases/
            </url>

        </repository>

        <snapshotRepository>

            <id>snapshots</id>

            <url>
                https://repo.example.com/repository/snapshots/
            </url>

        </snapshotRepository>

    </distributionManagement>

</project>
```

Then:

```bash
mvn deploy
```

can publish the artifact to the configured repository.

---

# 42. Example CI/CD Repository Flow

```text
                 GitHub
                    |
                    v
               CI Pipeline
                    |
                    v
                  Maven
                    |
          +---------+---------+
          |                   |
          v                   v
     Dependencies          Build
          |                   |
          v                   v
   Nexus / Artifactory     Artifact
                              |
                              v
                       Nexus / Artifactory
                              |
                              v
                           Deploy
```

---

# 43. Troubleshooting Dependency Download Failure

If Maven cannot download a dependency, check:

1. Repository URL
2. Network connectivity
3. Repository availability
4. Authentication
5. Authorization
6. Dependency coordinates
7. Repository configuration
8. `settings.xml`
9. Proxy configuration
10. Local Maven cache

Useful command:

```bash
mvn -X clean package
```

The debug output can provide additional information.

---

# 44. Troubleshooting Authentication Failure

Possible causes:

- Incorrect username
- Incorrect password/token
- Missing server configuration
- Incorrect server ID
- Expired credentials
- Insufficient repository permissions

Check that the repository ID matches the corresponding server ID.

Example:

```xml
<server>
    <id>releases</id>
    ...
</server>
```

and:

```xml
<repository>
    <id>releases</id>
    ...
</repository>
```

---

# 45. Troubleshooting 401 / 403 Errors

A `401` commonly indicates an authentication problem.

A `403` commonly indicates an authorization or permission problem.

Conceptually:

```text
401
 |
 +---- Who are you?
      Authentication problem


403
 |
 +---- You are authenticated,
      but do not have permission.
```

Check:

- Credentials
- Token
- Server ID
- User permissions
- Repository permissions

---

# 46. Troubleshooting 404 Errors

A `404` can indicate that the requested artifact or repository path does not exist.

Check:

- `groupId`
- `artifactId`
- `version`
- Repository URL
- Repository path
- Snapshot vs release repository

Example:

```text
Requested:
1.2.0

Available:
1.2.1
```

The dependency resolution will fail because the requested version is unavailable.

---

# 47. Snapshot vs Release Repository Troubleshooting

A common mistake is trying to publish a SNAPSHOT to a release repository.

Example:

```text
1.2.0-SNAPSHOT
```

should normally go to:

```text
Snapshot Repository
```

While:

```text
1.2.0
```

should normally go to:

```text
Release Repository
```

Conceptually:

```text
1.2.0-SNAPSHOT
       |
       v
Snapshot Repository


1.2.0
       |
       v
Release Repository
```

---

# 48. Repository Best Practices

Recommended practices:

1. Separate snapshot and release repositories.
2. Make release artifacts immutable.
3. Use HTTPS.
4. Use service accounts for CI/CD.
5. Apply least-privilege access.
6. Store credentials securely.
7. Use retention policies.
8. Maintain artifact traceability.
9. Scan dependencies where appropriate.
10. Avoid rebuilding the same release for different environments.
11. Use the same artifact across environments.
12. Monitor repository health and availability.

---

# 49. Complete Enterprise Example

A typical enterprise architecture can look like:

```text
                         Developers
                              |
                              v
                           GitHub
                              |
                              v
                        Pull Request
                              |
                              v
                        CI Pipeline
                              |
                              v
                           Maven
                              |
                 +------------+------------+
                 |                         |
                 v                         v
          Download Dependencies         Build
                 |                         |
                 v                         v
         Nexus / Artifactory          Test / Scan
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
                                      Promotion
                                           |
                         +-----------------+-----------------+
                         |                 |                 |
                         v                 v                 v
                        DEV               QA                UAT
                                                           |
                                                           v
                                                          PROD
```

---

# 50. Nexus vs Artifactory - High-Level Comparison

| Area | Nexus | Artifactory |
|---|---|---|
| Artifact Repository | Yes | Yes |
| Maven | Yes | Yes |
| Docker | Yes | Yes |
| npm | Yes | Yes |
| Python | Yes | Yes |
| Proxy Repositories | Yes | Yes |
| Hosted Repositories | Yes | Yes |
| Group/Virtual Repositories | Yes | Yes |
| CI/CD Integration | Yes | Yes |
| Enterprise Access Control | Yes | Yes |

Both are capable artifact repository solutions. The appropriate choice depends on organizational requirements, existing tooling, licensing, integrations, administration needs, and operational preferences.

---

# 51. Interview Questions

## What is an artifact repository?

An artifact repository is a centralized system used to store, manage, and distribute software artifacts and dependencies.

Examples include:

```text
Nexus
Artifactory
```

---

## Why do we need Nexus or Artifactory?

They provide centralized storage and distribution of artifacts and dependencies and support CI/CD workflows.

---

## What is a hosted repository?

A hosted repository stores artifacts owned or published by the organization.

---

## What is a proxy repository?

A proxy repository acts as an intermediary between clients and an external repository and can cache externally retrieved artifacts.

---

## What is a group or virtual repository?

It provides a single access point for multiple repositories, such as hosted and proxy repositories.

---

## What is the difference between snapshot and release repositories?

Snapshot repositories store development versions.

Release repositories store finalized versions.

```text
Snapshot:
1.2.0-SNAPSHOT

Release:
1.2.0
```

---

## Why should release artifacts be immutable?

Immutability ensures that a particular version always represents the same binary, improving reproducibility and traceability.

---

## What is artifact promotion?

Artifact promotion means moving the same artifact through environments such as:

```text
DEV → QA → UAT → PROD
```

without rebuilding it.

---

## Why is Build Once, Deploy Many important?

It ensures that the artifact tested in one environment is the same artifact deployed to later environments.

---

## Where are Maven credentials commonly configured?

Maven credentials can be configured through mechanisms such as:

```text
settings.xml
Environment variables
CI/CD secret stores
```

Credentials should not be hard-coded into source-controlled POM files.

---

## What is the purpose of `distributionManagement`?

It defines repositories where Maven can publish artifacts, commonly separating release and snapshot repositories.

---

## What is the purpose of `repositories` in `pom.xml`?

It defines repositories from which Maven can retrieve dependencies and other artifacts.

---

## What is the purpose of `settings.xml`?

`settings.xml` provides environment-specific Maven configuration such as:

- Credentials
- Servers
- Mirrors
- Profiles
- Proxy settings

---

## What is the difference between Nexus and Artifactory?

Both are artifact repository platforms that can store and distribute software artifacts and dependencies and integrate with CI/CD systems.

Their specific features, administration, integrations, and licensing differ.

---

## How would you troubleshoot a Maven dependency download failure?

Check:

```text
Repository URL
Credentials
Permissions
Dependency coordinates
settings.xml
Network
Proxy
Repository availability
```

A useful command is:

```bash
mvn -X clean package
```

---

## What is the difference between HTTP 401 and 403?

Generally:

```text
401 → Authentication problem

403 → Authorization / permission problem
```

---

## What can cause a 404 when downloading an artifact?

Possible causes include:

- Incorrect artifact version
- Incorrect repository URL
- Artifact does not exist
- Incorrect groupId
- Incorrect artifactId
- Snapshot/release repository mismatch

---

# 52. Key Takeaway

Nexus and Artifactory provide a central place to manage artifacts and dependencies.

The key concepts are:

```text
                  Artifact Repository
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
           Hosted        Proxy       Group/Virtual
             |             |             |
             v             v             v
        Internal       External      Combined
        Artifacts     Dependencies    Access
```

For Maven:

```text
pom.xml
   |
   v
Maven
   |
   +---- Download Dependencies
   |
   +---- Build
   |
   +---- Test
   |
   +---- Package
   |
   v
Artifact
   |
   v
Nexus / Artifactory
```

The most important CI/CD principle is:

```text
             Build Once
                 |
                 v
             Artifact
                 |
                 v
        Nexus / Artifactory
                 |
       +---------+---------+
       |         |         |
       v         v         v
      DEV       QA       UAT
                           |
                           v
                          PROD
```

Remember:

```text
Hosted
    → Stores internally published artifacts

Proxy
    → Proxies/caches external repositories

Group / Virtual
    → Provides combined access to multiple repositories

Snapshot
    → Development artifact

Release
    → Stable artifact

Repository
    → Stores and distributes artifacts

Promotion
    → Moves the same artifact through environments

Build Once
    → Build the application one time

Deploy Many
    → Promote the same artifact
```

The ideal enterprise flow is:

```text
Git
 |
 v
CI
 |
 v
Maven
 |
 +---- Download Dependencies
 +---- Compile
 +---- Test
 +---- Scan
 +---- Package
 |
 v
Versioned Artifact
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

> **The artifact repository is the bridge between the build process and reliable artifact-based deployment.**
