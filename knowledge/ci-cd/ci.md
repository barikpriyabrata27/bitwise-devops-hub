# Continuous Integration (CI)

## 1. What is Continuous Integration?

**Continuous Integration (CI)** is the practice of frequently integrating code changes into a shared repository and automatically validating those changes through an automated pipeline.

The main objective of CI is to identify problems early rather than discovering them much later during release or deployment.

A typical CI flow is:

```text
Developer
    |
    v
Feature Branch
    |
    v
Commit
    |
    v
Push
    |
    v
Pull Request
    |
    v
CI Pipeline
    |
    +---- Build
    |
    +---- Unit Test
    |
    +---- Code Quality
    |
    +---- Security Checks
    |
    v
Validation Result
```

---

# 2. Why CI is Important

Without CI, developers may work independently for a long time and integrate their changes only near the end of a release.

This can result in:

* Integration conflicts
* Broken builds
* Failed tests
* Dependency problems
* Code-quality issues
* Security issues
* Difficult troubleshooting

CI reduces these problems by validating changes frequently.

---

# 3. Main Goals of CI

The main goals of Continuous Integration are:

### Frequent Integration

Developers integrate changes frequently instead of keeping changes isolated for a long period.

### Early Feedback

The pipeline provides feedback soon after a change is pushed.

### Automated Validation

Builds and tests are performed automatically.

### Consistent Build Process

The same automated process can be used to build and validate the application.

### Reduced Integration Risk

Problems are identified while the change is still relatively small.

---

# 4. Typical CI Pipeline

A typical CI pipeline can be represented as:

```text
Source Code
     |
     v
Checkout
     |
     v
Build
     |
     v
Unit Tests
     |
     v
Code Quality
     |
     v
Security Scan
     |
     v
Package
     |
     v
Publish Artifact
```

The exact stages depend on the project and organization.

---

# 5. CI Trigger

A CI pipeline needs a trigger.

Common triggers include:

* Push
* Pull Request
* Merge
* Scheduled execution
* Manual execution
* Webhook

For example:

```text
Developer Push
      |
      v
GitHub
      |
      v
CI Trigger
      |
      v
Pipeline
```

A Pull Request can also trigger CI:

```text
Pull Request
      |
      v
CI Pipeline
      |
      +---- Build
      +---- Test
      +---- Scan
      |
      v
PR Status
```

---

# 6. Checkout

The first major step of many CI pipelines is checking out the source code.

Conceptually:

```text
Git Repository
      |
      v
CI Runner / Agent
      |
      v
Source Code
```

The CI system obtains the required branch or commit and prepares the workspace.

---

# 7. Build

The build stage verifies that the application can be built successfully.

For a Java/Maven application, for example:

```bash
mvn clean package
```

The exact Maven lifecycle and commands are covered in the Maven documentation.

The important CI concept is:

```text
Source Code
     |
     v
Build
     |
     +---- Success
     |
     +---- Failure
```

If the build fails, subsequent stages may be stopped depending on the pipeline configuration.

---

# 8. Testing

Automated tests are an important part of CI.

Common categories include:

### Unit Tests

Test individual components or units of code.

### Integration Tests

Test interactions between components or services.

### Other Automated Tests

Organizations may also include additional automated test suites depending on the application.

Typical flow:

```text
Build
  |
  v
Unit Tests
  |
  v
Integration Tests
  |
  v
Next Stage
```

---

# 9. Code Quality

CI pipelines can include automated code-quality checks.

Examples include:

* Linting
* Static analysis
* Code coverage
* SonarQube analysis

Conceptually:

```text
Build
  |
  v
Test
  |
  v
Code Quality
  |
  v
Continue / Fail
```

A project can define quality gates that determine whether the pipeline is allowed to continue.

---

# 10. Security Checks in CI

Security checks can also be integrated into CI.

Examples include:

* SAST
* SCA
* Dependency scanning
* Secret scanning
* Container scanning

A simplified pipeline:

```text
Build
  |
  v
Test
  |
  v
Code Quality
  |
  v
Security Scan
  |
  v
Package
```

The detailed security concepts belong in `pipeline-security.md` and the DevSecOps documentation.

---

# 11. Package

After successful validation, the application can be packaged.

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
Scan
  |
  v
Package
```

For a Java application, the result might be:

```text
myapp.jar
```

The generated package can then become an artifact.

---

# 12. Artifact

An artifact is a build output produced by the CI process.

Examples:

```text
myapp.jar
myapp.war
application.zip
container image
```

A typical flow is:

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

Artifact management is covered separately in:

```text
artifact-version-management.md
nexus-artifactory.md
```

---

# 13. CI and Pull Requests

CI is commonly integrated with Pull Requests.

Example:

```text
Developer
    |
    v
Feature Branch
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
    |
    v
Status
```

The Pull Request can show whether the required checks succeeded or failed.

This allows a team to detect problems before merging changes into an important branch.

---

# 14. CI Quality Gate

A quality gate is a condition that must be satisfied before the pipeline can continue.

For example:

```text
Build       → PASS
Unit Test   → PASS
Quality     → PASS
Security    → PASS
                |
                v
           Quality Gate
                |
                v
             Continue
```

If a required check fails:

```text
Security Scan → FAIL
       |
       v
Quality Gate → FAIL
       |
       v
Pipeline Stops
```

The exact quality-gate rules depend on the organization and project.

---

# 15. CI Failure

A CI pipeline can fail for many reasons.

Examples:

### Build Failure

```text
Compilation Error
Dependency Error
Build Configuration Error
```

### Test Failure

```text
Unit Test Failure
Integration Test Failure
```

### Quality Failure

```text
Quality Gate Failure
Code Analysis Failure
```

### Security Failure

```text
Vulnerability Found
Secret Detected
Security Policy Failure
```

The pipeline should provide logs that help developers identify the cause.

---

# 16. CI Feedback

One of the major benefits of CI is fast feedback.

Example:

```text
Developer
    |
    v
Push Code
    |
    v
CI Pipeline
    |
    v
Failure
    |
    v
Developer receives feedback
    |
    v
Fix Code
    |
    v
Push Again
```

The shorter the feedback cycle, the easier it generally is to identify the change responsible for the failure.

---

# 17. CI and Branching Strategy

CI works with different branching strategies.

### Git Flow

```text
feature
   |
   v
develop
   |
   v
release
   |
   v
main
```

CI can run on feature branches, Pull Requests, development branches and release branches according to the team's pipeline configuration.

### GitHub Flow

```text
feature
   |
   v
Pull Request
   |
   v
main
```

CI can validate the Pull Request before it is merged.

### Trunk-Based Development

```text
short-lived branch
       |
       v
     trunk
```

Frequent CI execution helps validate frequent integration into the trunk.

---

# 18. CI Environment

A CI pipeline executes in a controlled execution environment.

This may be:

* Hosted runner
* Self-hosted runner
* Build agent
* Containerized environment
* Virtual machine

Conceptually:

```text
Git Repository
      |
      v
CI Runner / Agent
      |
      +---- Source
      +---- Tools
      +---- Dependencies
      |
      v
Pipeline Execution
```

Runner and agent concepts are covered separately in `runners-agents.md`.

---

# 19. CI Variables and Secrets

CI pipelines often require configuration values and credentials.

Examples:

```text
Variables
    |
    +---- Environment name
    +---- Build configuration
    +---- Version

Secrets
    |
    +---- Tokens
    +---- Passwords
    +---- API credentials
```

Sensitive values should not be hard-coded into source code or pipeline definitions.

Detailed handling belongs in:

```text
variables-secrets.md
```

---

# 20. CI and Maven

For a Java/Maven application, a simplified CI flow can be:

```text
Git Push
    |
    v
Checkout
    |
    v
Maven Build
    |
    v
Unit Tests
    |
    v
Code Quality
    |
    v
Security
    |
    v
Package
    |
    v
Artifact
```

For example:

```bash
mvn clean verify
```

or a project-specific Maven command.

The exact Maven lifecycle is covered in `maven.md`.

---

# 21. CI vs CD

CI and CD are related but different concepts.

### CI

Focuses primarily on integrating and validating code changes.

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
```

### CD

Continues from the validated artifact toward deployment.

```text
Artifact
   |
   v
Deploy
   |
   v
Environment
```

A complete pipeline can therefore be:

```text
Code
  |
  v
CI
  |
  +---- Build
  +---- Test
  +---- Scan
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

The distinction between Continuous Delivery and Continuous Deployment is covered in `cd.md`.

---

# 22. CI Best Practices

### Integrate Frequently

Avoid keeping large changes isolated for long periods.

### Automate Tests

Tests should run automatically rather than relying only on manual testing.

### Fail Fast

Run important validation early so failures are discovered quickly.

### Keep Builds Reproducible

The same source and configuration should produce a predictable result.

### Keep Pipelines Maintainable

Avoid unnecessarily complicated pipeline logic.

### Protect Secrets

Never expose credentials in source code or pipeline logs.

### Provide Useful Logs

Pipeline failures should provide enough information to troubleshoot the problem.

### Keep Feedback Fast

Developers should receive CI results quickly enough to act on them.

---

# 23. Example Enterprise CI Pipeline

A more complete enterprise CI pipeline may look like:

```text
Developer
    |
    v
Git Push / Pull Request
    |
    v
Checkout
    |
    v
Build
    |
    v
Unit Test
    |
    v
Code Quality
    |
    v
SAST
    |
    v
SCA
    |
    v
Package
    |
    v
Artifact Repository
```

Possible technologies in different stages include:

```text
Git / GitHub
     |
GitHub Actions / Jenkins / Bamboo
     |
Maven
     |
SonarQube
     |
SAST / SCA tools
     |
Nexus / Artifactory
```

The actual tools depend on the organization's technology stack.

---

# 24. Interview Questions

## What is Continuous Integration?

Continuous Integration is the practice of frequently integrating code changes and automatically building and validating those changes.

## Why is CI important?

CI provides early feedback and helps identify build, test, quality and security problems before changes are integrated into important branches.

## What are typical CI stages?

A typical CI pipeline may contain:

```text
Checkout
Build
Test
Code Quality
Security
Package
Publish Artifact
```

## Can CI run on a Pull Request?

Yes. CI can be triggered when a Pull Request is created or updated.

## What happens when a CI check fails?

Depending on the pipeline configuration, the pipeline can stop and report the failure. The developer can investigate the logs, fix the issue and push a new change.

## What is a CI quality gate?

A quality gate is a set of conditions that must be satisfied before the pipeline is allowed to continue.

## What is the difference between CI and CD?

CI focuses on integrating and validating code changes. CD focuses on delivering or deploying validated artifacts to environments.

## What is an artifact?

An artifact is a build output produced by the build process, such as a JAR, WAR, ZIP package or container image.

---

# 25. Key Takeaway

The main purpose of CI is to create a **fast, repeatable and automated feedback loop** for code changes.

```text
Code Change
    |
    v
CI Trigger
    |
    v
Build
    |
    v
Test
    |
    v
Quality
    |
    v
Security
    |
    v
Package
    |
    v
Artifact
```

CI helps the team discover problems early and provides confidence that changes are ready for the next stage of the delivery process.
