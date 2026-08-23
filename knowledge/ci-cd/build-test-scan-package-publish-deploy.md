# Build → Test → Scan → Package → Publish → Deploy

## 1. Overview

A typical CI/CD pipeline takes source code through a series of stages before the application reaches an environment.

The overall flow is:

```text
Build
  ↓
Test
  ↓
Scan
  ↓
Package
  ↓
Publish
  ↓
Deploy
```

A more complete enterprise flow can be:

```text
Developer
    |
    v
Git Repository
    |
    v
Pull Request
    |
    v
Build
    |
    v
Test
    |
    v
Code Quality / Security Scan
    |
    v
Package
    |
    v
Publish Artifact
    |
    v
Deploy
    |
    v
Environment
```

Each stage has a specific responsibility.

---

# 2. Build

The **Build** stage converts source code into a form that can be tested and eventually packaged.

For example, in a Java/Maven application:

```text
Source Code
     |
     v
Maven Build
     |
     v
Compiled Application
```

Example:

```bash
mvn clean compile
```

Depending on the project, the build may also resolve dependencies, compile source code and execute build plugins.

### Build objectives

* Verify that the source code can be built.
* Resolve required dependencies.
* Detect compilation errors.
* Produce build outputs required by later stages.

Example:

```text
Source
  |
  v
Compile
  |
  +---- Success
  |
  +---- Failure
```

A failed build normally prevents the pipeline from continuing.

---

# 3. Test

After the application is successfully built, automated tests can be executed.

Typical tests include:

* Unit tests
* Integration tests
* Other automated tests required by the application

Example:

```text
Build
  |
  v
Unit Tests
  |
  v
Integration Tests
```

A test failure should normally stop or fail the relevant pipeline stage.

```text
Test
  |
  +---- PASS → Continue
  |
  +---- FAIL → Pipeline Failure
```

---

# 4. Scan

Scanning is performed to identify quality and security problems before the application is published or deployed.

Possible checks include:

* Static code analysis
* SAST
* SCA
* Dependency scanning
* Secret scanning
* Container scanning

Example:

```text
Build
  |
  v
Test
  |
  v
Scan
  |
  +---- PASS → Continue
  |
  +---- FAIL → Stop / Report
```

---

# 5. Code Quality

Code-quality analysis can be included in the scan stage.

For example:

```text
Source
  |
  v
Build
  |
  v
Test
  |
  v
SonarQube
  |
  v
Quality Gate
```

A quality gate can determine whether the pipeline is allowed to continue.

Example:

```text
Quality Gate
     |
     +---- PASS → Continue
     |
     +---- FAIL → Stop
```

---

# 6. Security Scanning

Security checks help identify vulnerabilities before deployment.

A pipeline can include:

```text
SAST
  |
  v
SCA
  |
  v
Secret Scan
  |
  v
Container Scan
```

### SAST

Static Application Security Testing analyzes source code or compiled code for security weaknesses.

### SCA

Software Composition Analysis examines application dependencies and their associated vulnerabilities.

### Secret Scanning

Detects credentials or other sensitive information accidentally committed to source control.

### Container Scanning

Analyzes container images for known vulnerabilities.

Detailed security concepts should be maintained in the DevSecOps and pipeline-security documentation.

---

# 7. Package

After the application passes the required validation stages, it can be packaged.

Examples:

```text
myapp.jar
myapp.war
application.zip
container image
```

Example flow:

```text
Source
  |
  v
Build
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
myapp.jar
```

The package becomes the deployable artifact.

---

# 8. Artifact

An **artifact** is an output produced by the build/package process.

Examples:

```text
JAR
WAR
ZIP
Container Image
Binary
```

An artifact should have a version that allows the team to identify exactly what was built.

For example:

```text
myapp-1.2.0.jar
```

Artifact and version management are covered in:

```text
artifact-version-management.md
```

---

# 9. Publish

After packaging, the artifact can be uploaded to an artifact repository.

Typical repositories include:

* Nexus
* Artifactory

Example:

```text
Package
   |
   v
myapp-1.2.0.jar
   |
   v
Nexus / Artifactory
```

The repository becomes the central location from which the artifact can later be retrieved for deployment.

---

# 10. Why Publish Artifacts?

Publishing artifacts provides several benefits:

* Centralized artifact storage
* Version tracking
* Controlled access
* Reproducible deployments
* Ability to promote artifacts between environments
* Separation of build and deployment

Instead of rebuilding the application for every environment:

```text
Build Once
    |
    v
Artifact
    |
    +---- DEV
    +---- QA
    +---- UAT
    +---- PROD
```

The same validated artifact can be promoted through the environments.

---

# 11. Deploy

The final stage is deployment.

Deployment takes the validated artifact and makes it available in the target environment.

Example:

```text
Nexus / Artifactory
       |
       v
    Artifact
       |
       v
    Deploy
       |
       v
      DEV
```

The deployment target could be:

* Virtual machine
* Container platform
* Kubernetes
* Cloud platform
* Serverless platform

---

# 12. Environment Promotion

A common enterprise flow is:

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

Each environment can have its own validation and approval requirements.

For example:

```text
DEV
 |
 v
Automated Testing
 |
 v
QA
 |
 v
UAT
 |
 v
Manual Approval
 |
 v
PROD
```

---

# 13. Complete Pipeline

Putting all stages together:

```text
                         CI
                          |
                          v
Source Code
    |
    v
Build
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
Publish
    |
    v
Artifact Repository
    |
    v
                         CD
                          |
                          v
                       Deploy
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
                     Approval
                          |
                          v
                        PROD
```

---

# 14. Example Maven Pipeline

For a Java/Maven application, the flow might look like:

```text
Git Push
   |
   v
Checkout
   |
   v
mvn clean
   |
   v
mvn test
   |
   v
Code Quality
   |
   v
Security Scan
   |
   v
mvn package
   |
   v
myapp.jar
   |
   v
Nexus
   |
   v
Deploy
```

The exact commands depend on the project's Maven configuration.

---

# 15. Build Once, Deploy Many

One of the important principles in CI/CD is:

> Build the application once and promote the resulting artifact.

Example:

```text
                 Build
                   |
                   v
             myapp-1.2.0.jar
                   |
        +----------+----------+
        |          |          |
        v          v          v
       DEV        QA         UAT
                              |
                              v
                             PROD
```

This avoids creating different binaries for different environments.

---

# 16. Configuration Between Environments

The artifact can remain the same while configuration changes between environments.

For example:

```text
Application Artifact
        |
        +---- DEV configuration
        |
        +---- QA configuration
        |
        +---- UAT configuration
        |
        +---- PROD configuration
```

Example:

```text
DEV  → dev-db
QA   → qa-db
UAT  → uat-db
PROD → prod-db
```

Environment-specific configuration should not normally require rebuilding the application.

---

# 17. Secrets During Deployment

Deployment may require sensitive information such as:

```text
Database credentials
API tokens
Cloud credentials
SSH credentials
Service credentials
```

These should be stored using appropriate secret-management mechanisms rather than hard-coded in source code or pipeline definitions.

Related documentation:

```text
variables-secrets.md
pipeline-security.md
```

---

# 18. Failure Handling

Each stage can fail.

### Build failure

```text
Build
  |
  X
Compilation / Dependency Error
```

### Test failure

```text
Test
  |
  X
Test Failure
```

### Scan failure

```text
Security Scan
  |
  X
Policy / Vulnerability Failure
```

### Package failure

```text
Package
  |
  X
Packaging Error
```

### Publish failure

```text
Nexus / Artifactory
  |
  X
Upload / Authentication Error
```

### Deployment failure

```text
Deploy
  |
  X
Environment / Configuration / Application Error
```

The pipeline should provide logs and status information for troubleshooting.

---

# 19. Quality Gates

Quality gates can exist at different points.

Example:

```text
Build
  |
  v
Test
  |
  v
Quality Gate
  |
  v
Security Gate
  |
  v
Publish
```

A gate can prevent the pipeline from progressing when a required condition is not satisfied.

---

# 20. Manual Approval

Some organizations require manual approval before production.

Example:

```text
DEV
 |
 v
QA
 |
 v
UAT
 |
 v
Manual Approval
 |
 +---- Approved → PROD
 |
 +---- Rejected → Stop
```

This is more commonly associated with Continuous Delivery than fully automated Continuous Deployment.

---

# 21. Deployment Strategies

The deployment stage can use different strategies.

Common examples:

### Rolling

Replace application instances gradually.

```text
Old Old Old
   |
   v
New Old Old
   |
   v
New New Old
   |
   v
New New New
```

### Blue-Green

Maintain two environments and switch traffic between them.

```text
Blue  → Current
Green → New
```

After validation:

```text
Traffic
   |
   v
Green
```

### Canary

Send a small percentage of traffic to the new version first.

```text
Version 1 → 90%
Version 2 → 10%
```

If successful, traffic can gradually move to the new version.

Detailed deployment strategies belong in:

```text
deployment-strategies.md
```

---

# 22. Rollback

If a deployment causes a problem, the system may need to return to the previous known-good version.

Example:

```text
Version 1
   |
   v
Version 2
   |
   v
Problem
   |
   v
Rollback
   |
   v
Version 1
```

A reliable artifact repository makes rollback easier because the previous artifact can be retrieved.

Detailed rollback concepts belong in:

```text
rollback.md
```

---

# 23. CI/CD Tools

Different tools can participate in different stages.

Example enterprise toolchain:

```text
Git / GitHub
      |
      v
GitHub Actions / Jenkins / Bamboo
      |
      v
Maven
      |
      v
SonarQube
      |
      v
Security Tools
      |
      v
Nexus / Artifactory
      |
      v
Docker / Kubernetes / Cloud
```

The exact toolchain depends on the organization.

---

# 24. Example Enterprise Flow

Consider a developer making a change to an application.

```text
1. Developer creates feature branch
             |
             v
2. Developer commits changes
             |
             v
3. Pull Request
             |
             v
4. CI Pipeline
             |
             +---- Build
             +---- Test
             +---- Quality
             +---- Security
             |
             v
5. Package
             |
             v
6. Publish artifact
             |
             v
7. Deploy DEV
             |
             v
8. Validate
             |
             v
9. Deploy QA
             |
             v
10. UAT
             |
             v
11. Approval
             |
             v
12. Deploy PROD
```

---

# 25. Interview Questions

## What are the typical stages of a CI/CD pipeline?

A common sequence is:

```text
Build
Test
Scan
Package
Publish
Deploy
```

The exact stages depend on the application and organization.

## Why separate build and deployment?

Separating build and deployment allows the same validated artifact to be promoted through multiple environments.

## What is an artifact?

An artifact is the output produced by the build/package process that can be stored and later deployed.

## Why use Nexus or Artifactory?

They provide centralized artifact storage and allow teams to manage and retrieve versioned build outputs.

## Why should we build once and deploy many?

Building once and promoting the same artifact helps ensure that the artifact tested in earlier environments is the same artifact deployed to later environments.

## What happens if the security scan fails?

The pipeline can fail or stop at the configured security gate, preventing the artifact from progressing until the issue is addressed or an authorized exception is applied.

## What happens if deployment fails?

The pipeline reports the failure and the team investigates the deployment logs. Depending on the deployment strategy, the system may roll back to a previous known-good version.

---

# 26. Key Takeaway

The complete CI/CD lifecycle can be summarized as:

```text
                  CI
                   |
                   v
Code
 |
 v
Build
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
Publish
 |
 v
Artifact Repository
 |
 v
                  CD
                   |
                   v
Deploy
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

**Build → Test → Scan → Package → Publish → Deploy**

The pipeline should produce a validated, versioned artifact and then move that artifact through the required environments using appropriate quality gates, approvals and deployment controls.
