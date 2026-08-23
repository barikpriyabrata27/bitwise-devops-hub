# Pipeline YAML

## 1. What is Pipeline YAML?

Pipeline YAML is a YAML-based configuration used to define CI/CD automation.

Instead of manually configuring every pipeline step through a graphical interface, the pipeline can be written as code and stored in Git.

A typical pipeline contains:

```text
Trigger
   |
   v
Jobs / Stages
   |
   v
Steps
   |
   +---- Build
   +---- Test
   +---- Scan
   +---- Package
   +---- Publish
   +---- Deploy
```

GitHub Actions is one example of a CI/CD platform that uses YAML workflows.

---

# 2. Why Pipeline as Code?

Pipeline configuration can be treated like application code.

Instead of:

```text
Manually configure CI/CD server
```

we can use:

```text
Pipeline YAML
      |
      v
Git Repository
      |
      v
Code Review
      |
      v
CI/CD Platform
```

Benefits include:

- Version control
- Code review
- Change history
- Reproducibility
- Easier collaboration
- Easier rollback
- Consistent pipeline configuration

---

# 3. Pipeline YAML Example

A simple GitHub Actions pipeline:

```yaml
name: CI

on:
  push:
    branches:
      - main

jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Build
        run: mvn clean package
```

The structure is:

```text
Workflow
   |
   +---- name
   |
   +---- on
   |
   +---- jobs
           |
           +---- build
                  |
                  +---- runs-on
                  |
                  +---- steps
```

---

# 4. YAML Basics

YAML stands for:

```text
YAML Ain't Markup Language
```

YAML is designed to be human-readable.

It uses:

- Indentation
- Key/value pairs
- Lists
- Objects/maps

Example:

```yaml
name: Java CI
```

Here:

```text
name → key
Java CI → value
```

---

# 5. YAML Indentation

YAML uses indentation to represent hierarchy.

Example:

```yaml
jobs:

  build:

    steps:

      - name: Build
        run: mvn package
```

Conceptually:

```text
jobs
 |
 +---- build
        |
        +---- steps
               |
               +---- name
               +---- run
```

Incorrect indentation can cause YAML parsing errors.

Use spaces consistently.

Avoid mixing tabs and spaces.

---

# 6. YAML Key-Value Pair

Example:

```yaml
name: CI
```

Another example:

```yaml
runs-on: ubuntu-latest
```

The structure is:

```text
key: value
```

---

# 7. YAML Lists

A list is represented using `-`.

Example:

```yaml
branches:
  - main
  - develop
```

Conceptually:

```text
branches
   |
   +---- main
   +---- develop
```

Another example:

```yaml
steps:

  - name: Checkout
    uses: actions/checkout@v4

  - name: Build
    run: mvn package
```

---

# 8. YAML Comments

Comments start with `#`.

Example:

```yaml
# Build application

- name: Build
  run: mvn package
```

Comments are ignored by the YAML parser.

They can be used to explain pipeline logic.

---

# 9. Pipeline Structure

A common CI/CD pipeline can be represented as:

```text
Pipeline
   |
   +---- Trigger
   |
   +---- Stage / Job
   |       |
   |       +---- Step
   |       +---- Step
   |
   +---- Stage / Job
   |       |
   |       +---- Step
   |       +---- Step
   |
   +---- Deployment
```

The exact terminology differs between CI/CD platforms.

For GitHub Actions, the core structure is:

```text
Workflow
   |
   +---- Event
   |
   +---- Jobs
           |
           +---- Steps
```

---

# 10. Workflow Name

Example:

```yaml
name: Java CI
```

The workflow name identifies the pipeline.

Other examples:

```yaml
name: Build and Test
```

```yaml
name: Security Scan
```

```yaml
name: Production Deployment
```

---

# 11. Trigger Configuration

The trigger determines when the pipeline starts.

Example:

```yaml
on:
  push:
    branches:
      - main
```

Another example:

```yaml
on:
  pull_request:
    branches:
      - main
```

Another:

```yaml
on:
  workflow_dispatch:
```

---

# 12. Multiple Triggers

A workflow can have multiple events.

Example:

```yaml
on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

  workflow_dispatch:
```

The workflow can then run for:

```text
Push to main
Pull Request to main
Manual execution
```

---

# 13. Branch Filters

A pipeline can be restricted to specific branches.

Example:

```yaml
on:
  push:
    branches:
      - main
      - develop
```

This means the workflow runs for pushes to:

```text
main
develop
```

---

# 14. Branch Pattern Matching

GitHub Actions also supports branch patterns.

Example:

```yaml
on:
  push:
    branches:
      - 'release/**'
```

This can match branches such as:

```text
release/1.0
release/2.0
release/2.1
```

The exact pattern syntax should follow the CI/CD platform's documentation.

---

# 15. Path Filters

A workflow can be triggered based on changed files.

Example:

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'pom.xml'
```

This can be useful when a repository contains multiple components.

For example:

```text
Repository
   |
   +---- application/
   |
   +---- terraform/
   |
   +---- documentation/
```

A pipeline can be configured to run only when relevant files change.

---

# 16. Job Definition

A job can be defined as:

```yaml
jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Build
        run: mvn clean package
```

Here:

```text
jobs
 |
 +---- build
        |
        +---- runs-on
        |
        +---- steps
```

---

# 17. Runner Configuration

The `runs-on` property determines where the job executes.

Example:

```yaml
runs-on: ubuntu-latest
```

Conceptually:

```text
GitHub Actions
      |
      v
Ubuntu Runner
      |
      v
Job
```

Other operating systems can be selected according to the platform's supported runner environments.

---

# 18. Steps

Example:

```yaml
steps:

  - name: Checkout
    uses: actions/checkout@v4

  - name: Build
    run: mvn clean package

  - name: Test
    run: mvn test
```

The steps execute in order within the job unless conditions or other workflow behavior changes execution.

---

# 19. `run` vs `uses`

Two common ways to define a step are:

### `run`

Executes a command.

```yaml
- name: Build
  run: mvn clean package
```

### `uses`

Uses a reusable action.

```yaml
- name: Checkout
  uses: actions/checkout@v4
```

Simple distinction:

```text
run
  → Execute command

uses
  → Use reusable action
```

---

# 20. Multiple Commands

Multiple commands can be written using `|`.

Example:

```yaml
- name: Build
  run: |
    mvn clean
    mvn package
```

Another example:

```yaml
- name: Validate
  run: |
    terraform fmt -check
    terraform validate
```

---

# 21. Job Dependencies

Jobs can depend on other jobs using `needs`.

Example:

```yaml
jobs:

  build:

    runs-on: ubuntu-latest

    steps:
      - run: mvn package

  test:

    needs: build

    runs-on: ubuntu-latest

    steps:
      - run: mvn test
```

Flow:

```text
Build
  |
  v
Test
```

---

# 22. Multiple Dependencies

Example:

```yaml
jobs:

  build:
    runs-on: ubuntu-latest
    steps:
      - run: mvn package

  security:
    runs-on: ubuntu-latest
    steps:
      - run: ./security-scan.sh

  deploy:

    needs:
      - build
      - security

    runs-on: ubuntu-latest

    steps:
      - run: ./deploy.sh
```

Flow:

```text
        +---- Build -----+
        |                |
        |                v
        |              Deploy
        |                ^
        |                |
        +--- Security ---+
```

---

# 23. Environment Variables

Variables can be defined at workflow level.

Example:

```yaml
env:

  APP_NAME: payment-service
  JAVA_VERSION: '17'
```

These variables can be used by jobs and steps according to their scope.

---

# 24. Job-Level Variables

Example:

```yaml
jobs:

  build:

    runs-on: ubuntu-latest

    env:
      APP_ENV: dev

    steps:

      - name: Display Environment
        run: echo "$APP_ENV"
```

The variable is available to the job's steps.

---

# 25. Step-Level Variables

Example:

```yaml
steps:

  - name: Build

    env:
      BUILD_TYPE: release

    run: echo "$BUILD_TYPE"
```

The variable is limited to that step.

---

# 26. Variable Scope

Conceptually:

```text
Workflow
   |
   +---- Workflow Variables
   |
   +---- Job
          |
          +---- Job Variables
          |
          +---- Step
                 |
                 +---- Step Variables
```

A more specific scope can override a broader configuration depending on the platform's rules.

---

# 27. Secrets

Sensitive values should be stored as secrets.

Example:

```yaml
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
```

Examples of sensitive information:

```text
Passwords
API Tokens
Cloud Credentials
SSH Keys
Repository Credentials
Deployment Credentials
```

Never commit secrets directly into pipeline YAML.

---

# 28. Pipeline Parameters

Some CI/CD platforms support parameters or inputs.

For GitHub Actions, manual workflows can define inputs.

Example:

```yaml
on:

  workflow_dispatch:

    inputs:

      environment:

        description: Environment

        required: true
```

A user can select or provide the input when starting the workflow manually.

---

# 29. Conditional Execution

The `if` expression can control whether a step or job executes.

Example:

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: ./deploy.sh
```

Conceptually:

```text
Condition
   |
   +---- TRUE  → Execute
   |
   +---- FALSE → Skip
```

---

# 30. Conditional Deployment

Example:

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: ./deploy.sh
```

This can prevent deployment from feature branches.

A common conceptual model is:

```text
feature/*
    |
    v
Build + Test

main
    |
    v
Build + Test + Deploy
```

---

# 31. Matrix Configuration

A matrix allows the same job to run with multiple configurations.

Example:

```yaml
strategy:

  matrix:
    java:
      - '17'
      - '21'
```

The pipeline can then run tests against both Java versions.

Conceptually:

```text
Test Job
   |
   +---- Java 17
   |
   +---- Java 21
```

---

# 32. Matrix Example

```yaml
jobs:

  test:

    runs-on: ubuntu-latest

    strategy:

      matrix:
        java: ['17', '21']

    steps:

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: ${{ matrix.java }}

      - name: Test
        run: mvn test
```

---

# 33. Build → Test → Scan → Package

A common CI pipeline can be represented as:

```text
Build
  |
  v
Test
  |
  v
Security / Quality Scan
  |
  v
Package
```

Example:

```yaml
jobs:

  ci:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Build
        run: mvn compile

      - name: Test
        run: mvn test

      - name: Package
        run: mvn package
```

Scanning tools can be added according to organizational requirements.

---

# 34. Build → Test → Publish

Example:

```yaml
jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Build
        run: mvn clean package

      - name: Publish
        run: mvn deploy
```

Flow:

```text
Checkout
   |
   v
Build
   |
   v
Package
   |
   v
Publish
```

---

# 35. Build → Test → Docker → Registry

A containerized pipeline can look like:

```text
Checkout
   |
   v
Maven Build
   |
   v
Test
   |
   v
Docker Build
   |
   v
Image Scan
   |
   v
Docker Push
```

Example:

```yaml
steps:

  - name: Checkout
    uses: actions/checkout@v4

  - name: Maven Build
    run: mvn clean package

  - name: Docker Build
    run: docker build -t payment-service:1.0.0 .

  - name: Docker Push
    run: docker push registry.example.com/payment-service:1.0.0
```

Credentials should be supplied securely.

---

# 36. Artifact Passing Between Jobs

Separate jobs run in separate execution environments.

If one job creates a file that another job needs, the file may need to be explicitly transferred.

Example:

```text
Build Job
   |
   v
Upload Artifact
   |
   v
Test / Deploy Job
   |
   v
Download Artifact
```

Example:

```yaml
- name: Upload Artifact
  uses: actions/upload-artifact@v4
  with:
    name: application
    path: target/*.jar
```

Then:

```yaml
- name: Download Artifact
  uses: actions/download-artifact@v4
  with:
    name: application
```

---

# 37. Build Once, Deploy Many

A strong CI/CD principle is:

```text
Build Once
    |
    v
Artifact
    |
    v
Deploy Many
```

Example:

```text
Git
 |
 v
Build
 |
 v
Artifact
 |
 v
Repository
 |
 +---- DEV
 |
 +---- QA
 |
 +---- UAT
 |
 +---- PROD
```

The same artifact should ideally be promoted through environments.

---

# 38. Pipeline Stages

Some CI/CD platforms explicitly use stages.

Conceptually:

```text
Stage 1
Build

Stage 2
Test

Stage 3
Scan

Stage 4
Package

Stage 5
Deploy
```

GitHub Actions uses jobs rather than a top-level `stages` keyword.

Stages can instead be represented using jobs and `needs`.

Example:

```text
Build Job
    |
    v
Test Job
    |
    v
Scan Job
    |
    v
Deploy Job
```

---

# 39. Parallel Execution

Independent jobs can run in parallel.

Example:

```text
             Build
               |
               v
        +------+------+ 
        |             |
        v             v
      Unit Test    Security Scan
        |             |
        +------+------+
               |
               v
             Deploy
```

Parallel execution can reduce overall pipeline duration.

---

# 40. Sequential Execution

If a job depends on another:

```yaml
test:
  needs: build
```

the jobs execute sequentially:

```text
Build
  |
  v
Test
  |
  v
Deploy
```

The pipeline should use dependencies according to the actual workflow requirements.

---

# 41. Fail-Fast Principle

A CI/CD pipeline should generally stop progression when a critical validation fails.

Example:

```text
Build
  |
  v
Test
  |
  X
Failure
  |
  v
Stop
```

For example:

```text
Build ✓
Test ✓
Security Scan ✗
       |
       v
Deployment blocked
```

This prevents known-invalid code from progressing.

---

# 42. Continue-on-Error

Some platforms support allowing a step to fail without failing the complete job.

In GitHub Actions:

```yaml
- name: Optional Check
  continue-on-error: true
  run: ./optional-check.sh
```

This should be used carefully.

Critical security or quality checks should not normally be ignored simply to make a pipeline pass.

---

# 43. Timeouts

Jobs can have timeouts.

Example:

```yaml
jobs:

  build:

    timeout-minutes: 15

    runs-on: ubuntu-latest

    steps:
      - run: mvn clean verify
```

This prevents an unexpectedly hanging job from consuming resources indefinitely.

---

# 44. Concurrency

Concurrency controls can prevent unnecessary overlapping runs.

Conceptually:

```text
Commit A
   |
   v
Pipeline A
   |
   v
Running

Commit B
   |
   v
Pipeline B
```

A concurrency policy can determine whether an older run should be cancelled when a newer run starts.

This is especially useful for deployment workflows.

---

# 45. Reusable Workflows

A large organization may have many repositories with similar pipelines.

Instead of duplicating the same YAML everywhere:

```text
Repository A
      |
      +---- CI Workflow

Repository B
      |
      +---- CI Workflow

Repository C
      |
      +---- CI Workflow
```

a reusable workflow can centralize common logic:

```text
             Reusable Workflow
              /      |      \
             /       |       \
            v        v        v
          Repo A   Repo B   Repo C
```

This improves consistency and reduces duplication.

---

# 46. Pipeline YAML and Git

Pipeline YAML should normally be stored in Git.

Example:

```text
Repository
   |
   +---- Application Code
   |
   +---- Dockerfile
   |
   +---- .github/workflows/
              |
              +---- ci.yml
              +---- deploy.yml
```

A pipeline change then follows the normal Git workflow:

```text
Branch
  |
  v
Change YAML
  |
  v
Pull Request
  |
  v
Review
  |
  v
Merge
```

---

# 47. Code Review for Pipeline Changes

Pipeline files should be reviewed just like application code.

For example:

```text
Developer
   |
   v
Modify pipeline.yml
   |
   v
Pull Request
   |
   v
Review
   |
   v
CI Validation
   |
   v
Merge
```

This is especially important because pipeline code can have access to:

```text
Secrets
Cloud Accounts
Production Systems
Deployment Credentials
```

---

# 48. YAML Validation

Before committing a YAML pipeline, validate:

```text
Syntax
Indentation
Keys
Values
Expressions
Action versions
Job dependencies
Secrets
Permissions
```

A syntax error can prevent the workflow from starting.

---

# 49. Common YAML Errors

### Incorrect indentation

Incorrect:

```yaml
jobs:
build:
  runs-on: ubuntu-latest
```

Correct:

```yaml
jobs:

  build:
    runs-on: ubuntu-latest
```

---

# 50. Missing Colon

Incorrect:

```yaml
name CI
```

Correct:

```yaml
name: CI
```

---

# 51. Incorrect List Syntax

Incorrect:

```yaml
branches:
main
develop
```

Correct:

```yaml
branches:
  - main
  - develop
```

---

# 52. Incorrect Job Dependency

Incorrect:

```yaml
deploy:
needs: build
```

Correct:

```yaml
deploy:
  needs: build
```

Indentation defines the relationship.

---

# 53. YAML Expressions

GitHub Actions uses expressions such as:

```yaml
${{ github.ref }}
```

Other examples:

```yaml
${{ github.sha }}
```

```yaml
${{ github.actor }}
```

```yaml
${{ secrets.API_TOKEN }}
```

```yaml
${{ matrix.java }}
```

Expressions allow workflow data to be used dynamically.

---

# 54. Common GitHub Context Values

Examples include:

```text
github.ref
github.sha
github.actor
github.repository
github.event_name
github.run_number
```

For example:

```yaml
- name: Display Commit
  run: echo "${{ github.sha }}"
```

This prints the commit identifier associated with the workflow execution.

---

# 55. Unique Build Version

A pipeline can use the Git commit SHA as a unique identifier.

Example:

```yaml
- name: Build Image
  run: |
    docker build \
      -t payment-service:${{ github.sha }} .
```

This produces an image conceptually like:

```text
payment-service:a1b2c3d...
```

This improves traceability between:

```text
Git Commit
    |
    v
Pipeline Run
    |
    v
Docker Image
    |
    v
Deployment
```

---

# 56. Versioning Pipeline Artifacts

A pipeline can use:

```text
Git Tag
Commit SHA
Release Version
Build Number
```

For example:

```text
Git Tag:
v1.2.0

Maven:
payment-service-1.2.0.jar

Docker:
payment-service:1.2.0
```

This provides traceability.

---

# 57. Pipeline and Artifact Repository

A complete Maven pipeline can be:

```text
Git
 |
 v
GitHub Actions
 |
 v
Checkout
 |
 v
Maven
 |
 +---- Compile
 +---- Test
 +---- Scan
 +---- Package
 |
 v
JAR
 |
 v
Nexus / Artifactory
```

The repository stores the versioned artifact.

---

# 58. Pipeline and Docker Registry

For containerized applications:

```text
Git
 |
 v
GitHub Actions
 |
 v
Build
 |
 v
Docker Image
 |
 v
Security Scan
 |
 v
Container Registry
 |
 v
Deployment
```

---

# 59. Pipeline and Terraform

Infrastructure pipelines can use:

```text
Git
 |
 v
Pipeline
 |
 +---- terraform fmt
 +---- terraform validate
 +---- terraform plan
 |
 v
Approval
 |
 v
terraform apply
 |
 v
Cloud
```

A production pipeline should normally protect `terraform apply` using appropriate permissions and approval controls.

---

# 60. Pipeline and Ansible

A deployment pipeline can execute:

```text
Git
 |
 v
Pipeline
 |
 v
Ansible
 |
 v
Target Servers
```

Example:

```yaml
- name: Deploy Application
  run: ansible-playbook deploy.yml
```

---

# 61. Environment-Based Pipeline

A common model is:

```text
             Build
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

Pipeline YAML can use environment-specific configuration and protected environments.

---

# 62. Production Deployment Protection

A secure pipeline should not necessarily allow every developer to deploy directly to production.

A typical model:

```text
Developer
    |
    v
Pull Request
    |
    v
CI
    |
    v
Build / Test / Scan
    |
    v
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
Approval
    |
    v
PROD
```

---

# 63. Pipeline Security

Pipeline YAML should follow security principles such as:

```text
Least Privilege
Secure Secrets
Protected Branches
Protected Environments
Trusted Actions
Secure Runners
Artifact Integrity
Dependency Security
```

Avoid giving every job administrative permissions.

---

# 64. Least-Privilege Permissions

Example:

```yaml
permissions:
  contents: read
```

If a job only needs to read repository content, it should not receive unnecessary write permissions.

Conceptually:

```text
Required Access
      |
      v
Grant Only That Access
```

---

# 65. Third-Party Actions

Example:

```yaml
- uses: third-party/action@v1
```

Before using a third-party action:

```text
Review Source
     |
     v
Review Permissions
     |
     v
Review Version
     |
     v
Review Maintenance
     |
     v
Use Carefully
```

Pipeline YAML can execute code, so third-party actions should be treated as code dependencies.

---

# 66. Self-Hosted Runner Considerations

A self-hosted runner may have access to:

```text
Internal Network
Cloud Resources
Secrets
Deployment Systems
Databases
```

Therefore:

```text
Untrusted Code
      |
      X
Powerful Self-Hosted Runner
```

should be avoided.

Self-hosted runners require:

- Patching
- Monitoring
- Access control
- Isolation
- Credential protection
- Cleanup

---

# 67. Pipeline Logging

Pipeline logs should provide enough information to troubleshoot failures.

However, sensitive information should never be intentionally printed.

Avoid:

```bash
echo "$PASSWORD"
```

Use:

```text
Safe Logging
    |
    +---- Build status
    +---- Test results
    +---- Deployment status
    +---- Error details
```

Do not expose secrets in logs.

---

# 68. Pipeline Notifications

CI/CD platforms can be integrated with notification systems.

Examples:

```text
Slack
Email
Microsoft Teams
Incident Management Tools
```

Conceptually:

```text
Pipeline
   |
   +---- Success → Notification
   |
   +---- Failure → Notification
```

Notifications should be actionable rather than excessively noisy.

---

# 69. Pipeline Failure Handling

A good pipeline should make failures easy to understand.

Example:

```text
Build ✓
Test ✓
Security Scan ✗
        |
        v
Pipeline Failed
        |
        v
Notification
        |
        v
Developer Investigates
```

The pipeline should not silently ignore critical failures.

---

# 70. Retry Strategy

Some operations can fail due to temporary conditions.

Examples:

```text
Network failure
Temporary service unavailable
Transient dependency issue
```

Retries may be appropriate for selected operations.

However, retries should not be used to hide genuine application or deployment failures.

---

# 71. Complete CI Pipeline Example

```yaml
name: CI

on:
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: maven

      - name: Build and Test
        run: mvn clean verify
```

Flow:

```text
Pull Request
     |
     v
Checkout
     |
     v
Java Setup
     |
     v
Maven Build
     |
     v
Tests
```

---

# 72. Complete Build → Scan → Publish Example

```yaml
name: Build and Publish

on:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: maven

      - name: Build
        run: mvn clean package

      - name: Test
        run: mvn test

      - name: Security Scan
        run: ./security-scan.sh

      - name: Publish
        run: mvn deploy
```

---

# 73. Complete Multi-Job Example

```yaml
name: CI/CD

on:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Build
        run: mvn clean package


  security:

    runs-on: ubuntu-latest

    steps:

      - name: Security Scan
        run: ./security-scan.sh


  deploy:

    needs:
      - build
      - security

    runs-on: ubuntu-latest

    steps:

      - name: Deploy
        run: ./deploy.sh
```

Flow:

```text
        +---- Build -------+
        |                  |
        |                  v
        |                Deploy
        |                  ^
        |                  |
        +---- Security ----+
```

---

# 74. Recommended Pipeline Structure

A mature CI/CD pipeline can be organized as:

```text
Trigger
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
Security Scan
   |
   v
Package
   |
   v
Publish Artifact
   |
   v
Build Container
   |
   v
Image Scan
   |
   v
Publish Image
   |
   v
Deploy DEV
   |
   v
Deploy QA
   |
   v
Deploy UAT
   |
   v
Approval
   |
   v
Deploy PROD
```

Not every application requires every stage.

---

# 75. Pipeline YAML Best Practices

Recommended practices:

1. Store pipeline files in Git.
2. Review pipeline changes through pull requests.
3. Keep workflows focused.
4. Reuse common workflow logic where appropriate.
5. Use least-privilege permissions.
6. Store secrets securely.
7. Avoid hard-coded credentials.
8. Pin or carefully manage action versions.
9. Use meaningful job and step names.
10. Fail fast on critical validation failures.
11. Use caching where appropriate.
12. Use artifact versioning.
13. Keep build and deployment concerns clear.
14. Protect production environments.
15. Keep pipeline logs useful but free from secrets.

---

# 76. Common Pipeline YAML Mistakes

### Mistake 1: Incorrect indentation

```yaml
jobs:
build:
```

instead of:

```yaml
jobs:

  build:
```

### Mistake 2: Hard-coded secrets

```yaml
password: mypassword
```

### Mistake 3: Excessive permissions

```yaml
permissions: write-all
```

when only read access is required.

### Mistake 4: Uncontrolled production deployment

```text
Every push
   |
   v
Production
```

without appropriate protection.

### Mistake 5: Rebuilding for every environment

```text
DEV Build
QA Build
UAT Build
PROD Build
```

instead of:

```text
Single Build
     |
     v
Same Artifact
     |
     +---- DEV
     +---- QA
     +---- UAT
     +---- PROD
```

---

# 77. Pipeline YAML Troubleshooting Checklist

When a pipeline fails, check:

```text
1. YAML syntax
2. Indentation
3. Trigger configuration
4. Branch filters
5. Job dependencies
6. Runner availability
7. Action versions
8. Environment variables
9. Secrets
10. Permissions
11. Network connectivity
12. Build tools
13. Artifact repository
14. Deployment configuration
15. Application logs
```

---

# 78. Interview Questions

## What is Pipeline as Code?

Pipeline as Code means defining CI/CD automation in version-controlled configuration files.

---

## Why use YAML for CI/CD?

YAML is human-readable and allows pipeline configuration to be stored, reviewed, versioned, and maintained as code.

---

## What is a workflow?

In GitHub Actions, a workflow is the complete YAML-defined automation process.

---

## What is a job?

A job is a group of steps executed together on a runner.

---

## What is a step?

A step is an individual operation within a job.

---

## What is the difference between `run` and `uses`?

```text
run
    → Executes a command

uses
    → Uses a reusable action
```

---

## What is `needs`?

`needs` defines a dependency between jobs.

Example:

```yaml
deploy:
  needs: build
```

---

## How can jobs run in parallel?

Jobs without dependencies can execute independently and may run concurrently.

---

## How can jobs run sequentially?

Use dependencies such as:

```yaml
needs: build
```

---

## What is a matrix strategy?

A matrix allows a job to execute against multiple configurations.

Example:

```yaml
matrix:
  java: ['17', '21']
```

---

## How should secrets be stored?

Secrets should be stored in secure secret-management facilities such as GitHub Actions Secrets, rather than directly in YAML.

---

## What is the purpose of `permissions`?

It controls the permissions available to the workflow token.

The recommended approach is least privilege.

---

## How do you pass an artifact from one job to another?

Upload the artifact in one job and download it in another.

Example:

```text
Build Job
    |
    v
upload-artifact
    |
    v
Deploy Job
    |
    v
download-artifact
```

---

## How do you prevent deployment from feature branches?

Use branch conditions, environments, protected branches, or deployment rules.

---

## How do you protect production deployment?

Use mechanisms such as:

```text
Protected Environment
Required Approvals
Protected Branch
Least-Privilege Credentials
Deployment Rules
```

---

## Why should pipeline YAML be stored in Git?

Because it provides:

```text
Version Control
Code Review
Audit History
Collaboration
Rollback
Reproducibility
```

---

# 79. Key Takeaway

Pipeline YAML allows CI/CD automation to be defined as code.

The basic model is:

```text
YAML
 |
 v
Workflow
 |
 v
Trigger
 |
 v
Jobs
 |
 v
Steps
 |
 v
Runner
```

A complete pipeline can look like:

```text
Git
 |
 v
Pull Request
 |
 v
CI
 |
 +---- Checkout
 +---- Build
 +---- Test
 +---- Scan
 |
 v
Package
 |
 v
Publish Artifact
 |
 v
Build Image
 |
 v
Scan Image
 |
 v
Registry
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

The important concepts to remember are:

```text
Workflow
    → Complete pipeline definition

Trigger
    → Determines when the workflow starts

Job
    → Collection of steps

Step
    → Individual operation

Runner
    → Execution environment

Action
    → Reusable automation component

needs
    → Defines job dependency

if
    → Controls conditional execution

env
    → Defines environment variables

secrets
    → Stores sensitive values

matrix
    → Runs jobs across multiple configurations

artifact
    → Build output that can be transferred or retained

permissions
    → Controls access available to the workflow
```

The key DevOps principle is:

```text
Pipeline as Code
       |
       v
Version Controlled
       |
       v
Code Reviewed
       |
       v
Secure
       |
       v
Repeatable
       |
       v
Automated
```

> **A well-designed YAML pipeline turns the CI/CD process into version-controlled, reviewable, repeatable and automated code.**
