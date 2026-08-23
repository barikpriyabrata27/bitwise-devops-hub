# Continuous Delivery and Continuous Deployment

## 1. What is Continuous Delivery?

**Continuous Delivery (CD)** is the practice of keeping application changes in a state where they can be released to an environment whenever the organization chooses.

The CI process validates the code and produces a deployable artifact.

```text
Source Code
    |
    v
CI
    |
    +---- Build
    +---- Test
    +---- Quality
    +---- Security
    +---- Package
    |
    v
Deployable Artifact
    |
    v
Continuous Delivery
    |
    v
Ready for Deployment
```

The key idea is:

> The software is always kept ready for release.

---

# 2. What is Continuous Deployment?

**Continuous Deployment** goes one step further.

When the automated pipeline successfully validates a change, the change can be automatically deployed to the target environment without requiring a manual release decision.

```text
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
Deploy
```

The deployment is triggered automatically when the required conditions are satisfied.

---

# 3. Continuous Delivery vs Continuous Deployment

The terms are closely related but have an important difference.

### Continuous Delivery

The application is automatically built, tested and prepared for deployment.

A manual decision may still be required before production deployment.

```text
Code
  |
  v
CI
  |
  v
Artifact
  |
  v
Ready
  |
  | Manual Approval
  v
Production
```

### Continuous Deployment

The validated change is automatically deployed.

```text
Code
  |
  v
CI
  |
  v
Artifact
  |
  v
Automatic Deployment
  |
  v
Production
```

### Simple distinction

```text
Continuous Delivery
        |
        v
Always ready to deploy


Continuous Deployment
        |
        v
Automatically deployed
```

---

# 4. CI/CD Relationship

CI and CD are parts of the same software delivery process.

A complete pipeline can look like:

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
CI
    |
    +---- Build
    +---- Test
    +---- Quality
    +---- Security
    +---- Package
    |
    v
Artifact
    |
    v
CD
    |
    +---- Deploy
    |
    v
Environment
```

---

# 5. Complete CI/CD Flow

A typical enterprise flow is:

```text
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
Deploy
```

This represents the overall lifecycle:

```text
Build → Test → Scan → Package → Publish → Deploy
```

Each stage provides a validation or delivery function.

---

# 6. Build

The application is compiled or otherwise prepared for execution.

Example for a Maven application:

```bash
mvn clean package
```

The result can be a deployable artifact such as:

```text
myapp.jar
```

---

# 7. Test

Automated tests validate the application.

Examples include:

* Unit tests
* Integration tests
* Other automated test suites

A failed test can stop the pipeline depending on the configured quality gates.

```text
Build
  |
  v
Test
  |
  +---- PASS → Continue
  |
  +---- FAIL → Stop / Report
```

---

# 8. Scan

Security and quality checks can be performed before the artifact is published.

Examples include:

* SAST
* SCA
* Dependency scanning
* Secret scanning
* Container scanning
* Static code analysis

Example:

```text
Build
  |
  v
Test
  |
  v
Security Scan
  |
  +---- PASS
  |
  +---- FAIL
```

---

# 9. Package

After the application passes the required checks, it can be packaged.

Examples:

```text
myapp.jar
myapp.war
application.zip
container image
```

The package becomes a deployable artifact.

---

# 10. Publish

The generated artifact can be published to an artifact repository.

Example:

```text
Build
  |
  v
Package
  |
  v
myapp.jar
  |
  v
Nexus / Artifactory
```

The artifact repository provides a central location for storing and retrieving build artifacts.

The detailed artifact-management concepts are covered separately in:

```text
artifact-version-management.md
nexus-artifactory.md
```

---

# 11. Deployment

Deployment takes the validated artifact and makes it available in an environment.

Example:

```text
Artifact
   |
   v
Deployment
   |
   v
DEV
```

A deployment can then progress through multiple environments.

---

# 12. Environments

A typical enterprise application can have several environments.

For example:

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
PROD
```

The exact environments depend on the organization's development and release process.

### DEV

Used primarily for development and early validation.

### QA

Used for testing and quality validation.

### UAT

Used for user or business acceptance testing where applicable.

### PROD

The production environment used by end users.

Detailed environment configuration belongs in:

```text
environments.md
```

---

# 13. Environment Promotion

An artifact can be promoted through environments.

For example:

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

A key principle is that the artifact that passed validation should be promoted rather than unnecessarily rebuilding different versions for each environment.

Conceptually:

```text
Build Once
    |
    v
Artifact
    |
    +----> DEV
    |
    +----> QA
    |
    +----> UAT
    |
    +----> PROD
```

---

# 14. Continuous Delivery Flow

A Continuous Delivery pipeline can look like:

```text
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
Publish Artifact
  |
  v
Deploy to Environment
  |
  v
Approval
  |
  v
Production
```

The final production step may require manual approval.

---

# 15. Continuous Deployment Flow

With Continuous Deployment, the production deployment can be automated.

```text
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
Deploy
  |
  v
Production
```

The pipeline automatically proceeds when all configured conditions pass.

---

# 16. Approvals

Organizations may require manual approvals before promoting an application to a sensitive environment.

For example:

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
 v
PROD
```

Approvals are useful when the organization requires a human decision before production deployment.

Detailed approval mechanisms are covered in:

```text
approvals.md
```

---

# 17. Deployment Gates

A deployment gate is a condition that must be satisfied before deployment or promotion continues.

Examples include:

* Automated tests pass
* Security checks pass
* Quality gate passes
* Required approval is obtained
* Environment is available
* Required configuration is present

Example:

```text
Artifact
   |
   v
Deployment Gate
   |
   +---- PASS → Deploy
   |
   +---- FAIL → Stop
```

---

# 18. Release Readiness

Before production deployment, the pipeline or release process may validate several conditions.

Example:

```text
Build          → PASS
Tests          → PASS
Security       → PASS
Quality        → PASS
Artifact       → AVAILABLE
Approval       → COMPLETE
                    |
                    v
              Release Ready
```

This helps prevent incomplete or invalid releases from reaching production.

---

# 19. Deployment Strategies

CD can use different deployment strategies.

Common strategies include:

* Rolling deployment
* Blue-Green deployment
* Canary deployment
* Recreate deployment

The detailed strategies should be maintained in:

```text
deployment-strategies.md
```

---

# 20. Rollback

A deployment can sometimes introduce a problem.

The delivery process should therefore provide a way to return to a known-good version.

Conceptually:

```text
Version 1
   |
   v
Version 2
   |
   v
Problem Detected
   |
   v
Rollback
   |
   v
Version 1
```

Rollback mechanisms depend on the deployment platform and release architecture.

Detailed rollback procedures belong in:

```text
rollback.md
```

---

# 21. Artifact-Based Deployment

A strong CI/CD model separates **building** from **deploying**.

Instead of rebuilding the application for every environment:

```text
Source
  |
  v
Build
  |
  v
Artifact
  |
  +---- DEV
  +---- QA
  +---- UAT
  +---- PROD
```

The same validated artifact can be promoted through environments.

This provides consistency between environments.

---

# 22. Configuration vs Artifact

Application configuration may vary between environments.

For example:

```text
DEV
  database = dev-db

QA
  database = qa-db

PROD
  database = prod-db
```

The application artifact can remain the same while environment-specific configuration is supplied during deployment.

This is one reason variables, secrets and environment configuration are important parts of CD.

---

# 23. Secrets During Deployment

Deployment pipelines may require credentials or sensitive values.

Examples:

```text
Database credentials
API tokens
Cloud credentials
SSH keys
Deployment credentials
```

These values should be managed securely rather than hard-coded into the application or pipeline.

Detailed secret management belongs in:

```text
variables-secrets.md
pipeline-security.md
```

---

# 24. CD and Infrastructure

A CD pipeline can deploy applications to infrastructure such as:

```text
Virtual Machines
Containers
Kubernetes
Cloud Platforms
Serverless Platforms
```

For example:

```text
Artifact
   |
   v
Container Image
   |
   v
Container Platform
   |
   v
Application
```

Infrastructure provisioning itself can be handled separately using tools such as Terraform or other infrastructure automation tools.

---

# 25. Application Delivery vs Infrastructure Provisioning

These are related but different activities.

### Infrastructure Provisioning

Creates or changes infrastructure.

Example:

```text
Terraform
    |
    v
VPC
Subnet
EC2
Load Balancer
```

### Application Deployment

Deploys the application onto existing infrastructure.

Example:

```text
Application Artifact
       |
       v
Application Platform
       |
       v
Running Application
```

A complete DevOps workflow can use both.

---

# 26. CI/CD Example

A complete enterprise example:

```text
Developer
    |
    v
GitHub
    |
    v
Pull Request
    |
    v
CI
    |
    +---- Maven Build
    +---- Unit Tests
    +---- SonarQube
    +---- Security Scan
    |
    v
Package
    |
    v
Nexus / Artifactory
    |
    v
Deploy DEV
    |
    v
Automated Tests
    |
    v
Deploy QA
    |
    v
Approval
    |
    v
Deploy PROD
```

---

# 27. Continuous Delivery vs Continuous Deployment — Interview Answer

### What is Continuous Delivery?

Continuous Delivery means that software changes are automatically built, tested and prepared so they are always in a deployable state. Production deployment may still require a manual approval.

### What is Continuous Deployment?

Continuous Deployment automatically deploys validated changes to the target environment without requiring a manual production release decision.

### What is the main difference?

The main difference is the **manual decision point before deployment**.

```text
Continuous Delivery:

CI → Artifact → Ready → Manual Approval → Production


Continuous Deployment:

CI → Artifact → Automatic Deployment → Production
```

---

# 28. CI/CD Pipeline Summary

The overall process can be summarized as:

```text
                 CI
                  |
                  v
Code → Build → Test → Scan → Package
                                      |
                                      v
                              Publish Artifact
                                      |
                                      v
                                     CD
                                      |
                                      v
                                  Deploy DEV
                                      |
                                      v
                                  Deploy QA
                                      |
                                      v
                              Approval / Gate
                                      |
                                      v
                                  Deploy PROD
```

---

# 29. Key Takeaway

CI and CD together create an automated path from source-code change to running application.

```text
Code
  |
  v
Continuous Integration
  |
  +---- Build
  +---- Test
  +---- Quality
  +---- Security
  +---- Package
  |
  v
Artifact
  |
  v
Continuous Delivery / Deployment
  |
  +---- Environment Promotion
  +---- Approvals / Gates
  +---- Deployment
  +---- Rollback
  |
  v
Production
```

The core distinction is:

**Continuous Delivery keeps the software ready to deploy.**

**Continuous Deployment automatically deploys validated changes.**
