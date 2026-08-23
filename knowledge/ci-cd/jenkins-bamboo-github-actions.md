# Jenkins, Bamboo and GitHub Actions

## 1. Introduction

Jenkins, Bamboo, and GitHub Actions are CI/CD automation platforms.

They can automate activities such as:

- Building applications
- Running tests
- Performing code-quality checks
- Running security scans
- Creating artifacts
- Publishing artifacts
- Deploying applications
- Running scheduled jobs
- Executing automation scripts

A simplified CI/CD flow is:

```text
Developer
    |
    v
Git Repository
    |
    v
CI/CD Platform
    |
    +---- Build
    +---- Test
    +---- Scan
    +---- Package
    +---- Publish
    +---- Deploy
```

The three tools provide similar CI/CD capabilities, but their architecture, configuration, integrations, and operational models differ.

---

# 2. Jenkins

**Jenkins** is an open-source automation server widely used for CI/CD.

Jenkins can automate almost any build, test, deployment, or automation process.

A simplified architecture is:

```text
Developer
    |
    v
Git Repository
    |
    v
Jenkins
    |
    +---- Build
    +---- Test
    +---- Scan
    +---- Package
    +---- Deploy
```

Jenkins is highly extensible through plugins.

---

# 3. Jenkins Architecture

A Jenkins installation can contain:

```text
                    Jenkins Controller
                           |
              +------------+------------+
              |                         |
              v                         v
          Agent 1                    Agent 2
              |                         |
              v                         v
           Build                     Build
           Test                      Test
```

The Jenkins controller manages the Jenkins environment.

Agents execute workloads.

Depending on the Jenkins setup and version, terminology and architecture can vary, but the basic idea remains:

```text
Controller
    |
    +---- Manage jobs
    +---- Schedule work
    +---- Coordinate builds
    |
    v
Agents
    |
    +---- Execute builds
    +---- Run tests
    +---- Run deployment tasks
```

---

# 4. Jenkins Controller

The Jenkins controller is responsible for coordinating Jenkins operations.

It can handle:

- Job configuration
- Pipeline orchestration
- Scheduling
- Credentials management
- Plugin management
- Build coordination
- Agent management

The controller should generally avoid performing heavy build workloads when dedicated agents are available.

---

# 5. Jenkins Agent

A Jenkins agent is a machine or execution environment where build steps run.

An agent can contain:

```text
Java
Maven
Git
Docker
Python
Terraform
Ansible
```

depending on the pipeline requirements.

Example:

```text
Jenkins Controller
        |
        +---- Linux Agent
        |
        +---- Windows Agent
        |
        +---- Docker-based Agent
```

---

# 6. Jenkins Job

A Jenkins job defines an automated task.

Examples:

```text
Build Application
Run Unit Tests
Deploy Application
Run Security Scan
Build Docker Image
Run Terraform
```

A job can be triggered by:

- Git changes
- Webhooks
- Scheduled execution
- Manual execution
- Another job
- Pipeline events

---

# 7. Jenkins Pipeline

A Jenkins Pipeline defines a CI/CD workflow as code.

A common file is:

```text
Jenkinsfile
```

Example:

```groovy
pipeline {

    agent any

    stages {

        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }

    }
}
```

The pipeline defines stages and steps.

---

# 8. Jenkinsfile

A `Jenkinsfile` is normally stored in the source-code repository.

Example:

```text
my-project/
├── src/
├── pom.xml
└── Jenkinsfile
```

This is an example of **Pipeline as Code**.

The pipeline configuration is version-controlled along with the application.

---

# 9. Jenkins Declarative Pipeline

Jenkins supports declarative pipeline syntax.

Example:

```groovy
pipeline {

    agent any

    stages {

        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }

        stage('Deploy') {
            steps {
                sh './deploy.sh'
            }
        }

    }
}
```

The structure is:

```text
pipeline
   |
   +---- agent
   |
   +---- stages
           |
           +---- Build
           +---- Test
           +---- Deploy
```

---

# 10. Jenkins Plugins

Jenkins has a large plugin ecosystem.

Plugins can provide integration with:

- Git
- GitHub
- Bitbucket
- Maven
- Docker
- Kubernetes
- SonarQube
- Nexus
- Artifactory
- AWS
- Slack
- Security tools

The exact plugin requirements depend on the environment.

---

# 11. Jenkins Strengths

Jenkins is commonly known for:

- Open-source availability
- Large plugin ecosystem
- High customization
- Pipeline as Code
- Broad integration capabilities
- Support for many build technologies
- Self-hosted deployment options

---

# 12. Jenkins Challenges

Jenkins can also introduce operational responsibilities.

Organizations may need to manage:

- Jenkins servers
- Agents
- Plugins
- Upgrades
- Security
- Credentials
- Backup
- High availability
- Infrastructure
- Monitoring

The operational model depends on whether Jenkins is self-managed or hosted through another platform.

---

# 13. Bamboo

**Bamboo** is Atlassian's CI/CD automation server.

It integrates particularly well with the Atlassian ecosystem.

A simplified flow is:

```text
Git / Bitbucket
       |
       v
    Bamboo
       |
       +---- Build
       +---- Test
       +---- Package
       +---- Deploy
```

---

# 14. Bamboo Architecture

A simplified Bamboo environment contains:

```text
                 Bamboo Server
                      |
          +-----------+-----------+
          |                       |
          v                       v
      Agent 1                  Agent 2
          |                       |
          v                       v
       Build                   Build
```

Bamboo coordinates build and deployment activities while agents execute workloads.

---

# 15. Bamboo Plan

A Bamboo **Plan** defines a CI build process.

A plan can contain:

- Stages
- Jobs
- Tasks

Conceptually:

```text
Plan
 |
 +---- Stage
        |
        +---- Job
              |
              +---- Task
              +---- Task
```

---

# 16. Bamboo Stage

A stage groups jobs that belong to a logical part of the build.

Example:

```text
Plan
 |
 +---- Build Stage
 |
 +---- Test Stage
 |
 +---- Package Stage
```

---

# 17. Bamboo Job

A job contains tasks that are executed together.

Example:

```text
Build Job
 |
 +---- Checkout
 +---- Maven Compile
 +---- Maven Test
```

---

# 18. Bamboo Task

A task is an individual operation.

Examples:

```text
Checkout source
Run Maven
Run shell script
Run security scan
Publish artifact
```

Conceptually:

```text
Plan
  |
  v
Stage
  |
  v
Job
  |
  v
Tasks
```

---

# 19. Bamboo Deployment Project

Bamboo can also define deployment workflows.

For example:

```text
Build
  |
  v
Artifact
  |
  v
Deployment Project
  |
  +---- DEV
  |
  +---- QA
  |
  +---- PROD
```

This separates the build process from environment deployment.

---

# 20. Bamboo Strengths

Bamboo is commonly associated with:

- Atlassian ecosystem integration
- Bitbucket integration
- Build and deployment workflows
- Environment-based deployment configuration
- Plan-based CI/CD
- Integration with other Atlassian tools

---

# 21. Bamboo Challenges

Bamboo can require:

- Server administration
- Agent management
- Configuration
- Maintenance
- Licensing considerations
- Integration management

The operational model depends on how Bamboo is deployed and managed.

---

# 22. GitHub Actions

**GitHub Actions** is GitHub's native automation platform.

It allows workflows to be defined directly inside a GitHub repository.

Workflows are normally stored under:

```text
.github/workflows/
```

Example:

```text
project/
├── src/
├── pom.xml
└── .github/
    └── workflows/
        └── ci.yml
```

---

# 23. GitHub Actions Workflow

A GitHub Actions workflow is defined using YAML.

Example:

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
   +---- Event
   |
   +---- Jobs
           |
           +---- Steps
```

---

# 24. GitHub Actions Events

A workflow can be triggered by events.

Examples include:

```text
push
pull_request
workflow_dispatch
schedule
release
workflow_call
```

Example:

```yaml
on:
  push:
    branches:
      - main
```

The workflow runs when a push occurs to `main`.

---

# 25. GitHub Actions Job

A job is a collection of steps executed on a runner.

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
```

Conceptually:

```text
Workflow
   |
   v
Job
   |
   +---- Step
   +---- Step
   +---- Step
```

---

# 26. GitHub Actions Step

A step performs an individual operation.

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

A step can:

- Execute a command
- Use an action
- Set environment variables
- Perform a script
- Run tests
- Publish artifacts

---

# 27. GitHub Actions Runner

A **runner** is the execution environment where GitHub Actions jobs run.

Example:

```yaml
runs-on: ubuntu-latest
```

This means the job runs on a Linux runner provided by GitHub.

GitHub Actions also supports self-hosted runners.

Conceptually:

```text
GitHub Actions
      |
      v
   Runner
      |
      +---- Build
      +---- Test
      +---- Scan
      +---- Deploy
```

---

# 28. GitHub-Hosted Runner

GitHub can provide hosted execution environments.

Example:

```yaml
runs-on: ubuntu-latest
```

Other operating systems can also be selected depending on GitHub's supported runner images.

Advantages include:

- No runner infrastructure to maintain
- Easy setup
- Integration with GitHub
- Standardized environments

---

# 29. Self-Hosted Runner

An organization can also provide its own runner infrastructure.

Example:

```text
GitHub
   |
   v
Self-Hosted Runner
   |
   +---- Internal Network
   +---- Custom Tools
   +---- Private Resources
```

Self-hosted runners are useful when workflows need access to internal resources or specialized environments.

They introduce additional responsibilities for:

- Security
- Patching
- Availability
- Maintenance
- Access control

---

# 30. GitHub Actions Marketplace

GitHub Actions provides reusable actions that can be used in workflows.

Example:

```yaml
- uses: actions/checkout@v4
```

An action can encapsulate reusable automation functionality.

Examples include actions for:

- Checking out code
- Setting up Java
- Setting up Python
- Building Docker images
- Uploading artifacts
- Deploying applications

Actions should be selected carefully and kept updated.

---

# 31. GitHub Actions Secrets

GitHub Actions supports encrypted secrets.

Example:

```yaml
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
```

Secrets should be used for sensitive information such as:

```text
Passwords
Tokens
Cloud credentials
API keys
Repository credentials
```

Secrets should not be hard-coded in workflow files.

---

# 32. GitHub Actions Variables

Non-sensitive configuration can be stored as variables.

Example:

```yaml
env:
  APP_NAME: payment-service
```

Sensitive values should use secrets rather than ordinary variables.

Conceptually:

```text
Configuration
    |
    +---- Variables
    |       |
    |       +---- Non-sensitive
    |
    +---- Secrets
            |
            +---- Sensitive
```

---

# 33. Jenkins vs Bamboo vs GitHub Actions

| Feature | Jenkins | Bamboo | GitHub Actions |
|---|---|---|---|
| Provider | Open source project | Atlassian | GitHub |
| Configuration | Jenkinsfile / UI | Plans / UI | YAML |
| Native GitHub Integration | Possible | Possible | Excellent |
| Native Bitbucket Integration | Possible | Strong | Possible |
| Self-hosted | Yes | Yes | Yes |
| Hosted execution | Depends on setup | Depends on setup | Yes |
| Plugin / Action ecosystem | Large plugins | Atlassian integrations | Actions ecosystem |
| Pipeline as Code | Yes | Supported | Yes |
| Runner / Agent model | Agents | Agents | Runners |
| Cloud integration | Broad | Broad | Broad |

The best choice depends on the organization's existing tools, infrastructure, security requirements, team skills, cost, and operational model.

---

# 34. Configuration Comparison

### Jenkins

```text
Repository
    |
    +---- Jenkinsfile
    |
    v
Jenkins
```

### Bamboo

```text
Repository
    |
    v
Bamboo Plan
    |
    v
Bamboo Server
```

### GitHub Actions

```text
Repository
    |
    +---- .github/workflows/*.yml
    |
    v
GitHub Actions
```

---

# 35. Pipeline as Code

Pipeline as Code means defining CI/CD workflows as files stored in source control.

Examples:

```text
Jenkins
    → Jenkinsfile

GitHub Actions
    → .github/workflows/*.yml
```

Bamboo can also support configuration stored or linked through source-controlled configuration depending on the setup.

Benefits include:

- Version control
- Code review
- Change history
- Reproducibility
- Collaboration
- Easier rollback of pipeline changes

---

# 36. Jenkins Example

Example `Jenkinsfile`:

```groovy
pipeline {

    agent any

    stages {

        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }

        stage('Publish') {
            steps {
                sh 'mvn deploy'
            }
        }

    }
}
```

Flow:

```text
Build
  |
  v
Test
  |
  v
Publish
```

---

# 37. Bamboo Example

A conceptual Bamboo plan could contain:

```text
Plan: Payment Service CI

Stage: Build
    |
    +---- Job: Build
            |
            +---- Checkout
            +---- Maven Compile
            +---- Unit Test

Stage: Package
    |
    +---- Job: Package
            |
            +---- Maven Package
            +---- Publish Artifact
```

The exact Bamboo configuration depends on the Bamboo version and organizational setup.

---

# 38. GitHub Actions Example

```yaml
name: CI

on:
  pull_request:
    branches:
      - main

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

      - name: Build and Test
        run: mvn clean verify
```

Flow:

```text
Pull Request
     |
     v
GitHub Actions
     |
     v
Checkout
     |
     v
Java Setup
     |
     v
Maven Build/Test
```

---

# 39. CI/CD Integration with Maven

All three platforms can run Maven commands.

Example:

```bash
mvn clean verify
```

The flow is:

```text
Git
 |
 v
CI/CD Platform
 |
 +---- Jenkins
 |
 +---- Bamboo
 |
 +---- GitHub Actions
 |
 v
Maven
 |
 v
Build / Test
```

---

# 40. CI/CD Integration with Docker

All three platforms can execute Docker commands or integrate with container tooling.

Example:

```bash
docker build -t payment-service:1.0.0 .
docker push registry.example.com/payment-service:1.0.0
```

Flow:

```text
CI/CD Platform
      |
      v
Docker Build
      |
      v
Container Image
      |
      v
Registry
```

---

# 41. CI/CD Integration with Terraform

CI/CD platforms can also execute Terraform workflows.

Example:

```bash
terraform init
terraform validate
terraform plan
terraform apply
```

Conceptually:

```text
Git
 |
 v
CI/CD
 |
 v
Terraform
 |
 v
Cloud Infrastructure
```

Approvals and security controls should be applied carefully before production infrastructure changes.

---

# 42. CI/CD Integration with Ansible

CI/CD platforms can execute Ansible automation.

Example:

```bash
ansible-playbook deploy.yml
```

Flow:

```text
CI/CD
   |
   v
Ansible
   |
   v
Target Servers
```

This can be used for configuration management and deployment automation.

---

# 43. CI/CD Security

Regardless of the platform, CI/CD pipelines should protect:

- Credentials
- Tokens
- Secrets
- Build infrastructure
- Deployment credentials
- Artifact repositories
- Cloud accounts

A secure pipeline should follow:

```text
Least Privilege
      |
      v
Secure Secrets
      |
      v
Protected Branches
      |
      v
Code Review
      |
      v
Security Scanning
      |
      v
Controlled Deployment
```

---

# 44. Credentials Management

Credentials should not be hard-coded.

Avoid:

```yaml
password: MyPassword123
```

or:

```groovy
def password = "MyPassword123"
```

Instead, use the credential-management mechanisms provided by the CI/CD platform.

Examples:

```text
Jenkins Credentials
Bamboo Variables / Secure Variables
GitHub Actions Secrets
```

---

# 45. Webhooks

CI/CD systems can be triggered by Git events.

For example:

```text
Developer
    |
    v
git push
    |
    v
GitHub
    |
    v
Webhook
    |
    v
CI/CD Platform
    |
    v
Pipeline
```

This allows CI pipelines to start automatically after source-code changes.

---

# 46. Pull Request CI

A common practice is to run CI validation for pull requests.

Example:

```text
Developer
    |
    v
Pull Request
    |
    v
CI
    |
    +---- Build
    +---- Unit Test
    +---- Code Scan
    +---- Security Scan
    |
    v
Pass / Fail
```

This helps detect problems before merging code into the main branch.

---

# 47. Main Branch CI/CD

After code is merged:

```text
Pull Request
    |
    v
Review
    |
    v
Merge
    |
    v
Main Branch
    |
    v
CI/CD
```

The pipeline may then:

```text
Build
Test
Scan
Package
Publish
Deploy
```

---

# 48. Jenkins vs GitHub Actions Example

### Jenkins

```text
GitHub
   |
   v
Webhook
   |
   v
Jenkins
   |
   v
Jenkinsfile
   |
   v
Agent
```

### GitHub Actions

```text
GitHub
   |
   v
Workflow Event
   |
   v
GitHub Actions
   |
   v
Workflow YAML
   |
   v
Runner
```

Both implement the same general CI/CD concept with different platforms and configuration models.

---

# 49. Bamboo vs GitHub Actions Example

### Bamboo

```text
Bitbucket / Git
       |
       v
Bamboo Plan
       |
       v
Bamboo Agent
       |
       v
Build / Test / Deploy
```

### GitHub Actions

```text
GitHub
   |
   v
Workflow
   |
   v
Runner
   |
   v
Build / Test / Deploy
```

---

# 50. Choosing Between Jenkins, Bamboo and GitHub Actions

Consider the following factors:

```text
Source Control
Infrastructure
Team Skills
Cost
Security
Existing Tools
Cloud Strategy
Plugin / Action Requirements
Operational Overhead
Compliance
```

Example considerations:

### Jenkins

Good fit when:

```text
Highly customized CI/CD
Large existing Jenkins ecosystem
Self-hosted infrastructure
Complex integrations
```

### Bamboo

Good fit when:

```text
Strong Atlassian ecosystem
Existing Bamboo investment
Bitbucket-centric workflows
```

### GitHub Actions

Good fit when:

```text
GitHub is the primary source platform
GitHub-native workflows are preferred
Managed runners are useful
Workflow-as-code is desired
```

These are general considerations; the right choice depends on the organization's environment.

---

# 51. Migration Example

An organization may migrate from Jenkins to GitHub Actions.

Existing:

```text
GitHub
   |
   v
Jenkins
   |
   v
Jenkinsfile
```

New:

```text
GitHub
   |
   v
GitHub Actions
   |
   v
workflow.yml
```

The business process may remain similar:

```text
Build
Test
Scan
Package
Publish
Deploy
```

Only the automation platform changes.

---

# 52. Pipeline Portability

A good pipeline should separate business logic from platform-specific syntax where practical.

For example, the core process may be:

```text
1. Checkout
2. Build
3. Test
4. Scan
5. Package
6. Publish
7. Deploy
```

The implementation differs:

```text
Jenkins      → Jenkinsfile
Bamboo       → Plan / Tasks
GitHub       → Workflow YAML
```

---

# 53. Common CI/CD Platform Comparison

```text
                 CI/CD
                   |
        +----------+----------+
        |          |          |
        v          v          v
     Jenkins     Bamboo    GitHub Actions
        |          |          |
        v          v          v
 Jenkinsfile     Plan      Workflow YAML
        |          |          |
        v          v          v
    Agents       Agents     Runners
```

---

# 54. Interview Questions

## What is Jenkins?

Jenkins is an open-source automation server commonly used for CI/CD.

---

## What is Bamboo?

Bamboo is Atlassian's CI/CD automation server.

---

## What is GitHub Actions?

GitHub Actions is GitHub's native automation platform for implementing CI/CD workflows and other repository automation.

---

## What is a Jenkinsfile?

A `Jenkinsfile` is a pipeline definition stored as code, commonly in the source repository.

---

## What is a GitHub Actions workflow?

A workflow is a YAML-defined automation process stored under:

```text
.github/workflows/
```

---

## What is a Jenkins agent?

A Jenkins agent is an execution environment where Jenkins jobs or pipeline steps run.

---

## What is a GitHub Actions runner?

A runner is the execution environment where a GitHub Actions job runs.

---

## What is a Bamboo agent?

A Bamboo agent is an execution environment that runs Bamboo build tasks.

---

## What is Pipeline as Code?

Pipeline as Code means defining CI/CD automation in version-controlled files.

Examples:

```text
Jenkins      → Jenkinsfile
GitHub       → workflow YAML
```

---

## What is the difference between Jenkins and GitHub Actions?

Jenkins is an automation server that is commonly self-managed and highly customizable.

GitHub Actions is integrated directly into GitHub and uses repository-based YAML workflows with hosted or self-hosted runners.

---

## What is the difference between Jenkins and Bamboo?

Both can provide CI/CD automation using agents and pipeline/build configurations.

Jenkins is open-source and has a large plugin ecosystem.

Bamboo is an Atlassian product with strong integration into the Atlassian ecosystem.

---

## Which is better: Jenkins or GitHub Actions?

There is no universal answer.

The choice depends on:

```text
Existing infrastructure
Source control
Team expertise
Security requirements
Operational overhead
Cost
Integrations
Customization requirements
```

---

## What is a runner or agent?

It is the execution environment where CI/CD commands actually run.

```text
Controller / Platform
       |
       v
Agent / Runner
       |
       v
Build / Test / Deploy
```

---

## How does CI start automatically after a Git push?

A common mechanism is:

```text
Git Push
   |
   v
Webhook / Event
   |
   v
CI/CD Platform
   |
   v
Pipeline
```

---

## How should secrets be handled in CI/CD?

Secrets should be stored in secure credential or secret-management systems provided by the platform or organization.

They should not be hard-coded into:

```text
Source Code
Dockerfiles
Jenkinsfiles
Workflow YAML
Scripts
```

---

# 55. Key Takeaway

Jenkins, Bamboo and GitHub Actions are CI/CD automation platforms.

The common concept is:

```text
Git
 |
 v
CI/CD Platform
 |
 +---- Build
 +---- Test
 +---- Scan
 +---- Package
 +---- Publish
 +---- Deploy
```

Their configuration models differ:

```text
Jenkins
    |
    v
Jenkinsfile
    |
    v
Agent


Bamboo
    |
    v
Plan / Stage / Job / Task
    |
    v
Agent


GitHub Actions
    |
    v
Workflow YAML
    |
    v
Runner
```

Remember the core terminology:

```text
Jenkins
    → Controller + Agents + Jenkinsfile

Bamboo
    → Server + Agents + Plans

GitHub Actions
    → Workflows + Jobs + Steps + Runners
```

A modern CI/CD pipeline can be represented as:

```text
                         Git
                          |
                          v
                    Pull Request
                          |
                          v
                         CI
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
       Build            Test            Scan
          |               |               |
          +---------------+---------------+
                          |
                          v
                       Package
                          |
                          v
                    Artifact/Image
                          |
                          v
                 Nexus / Registry
                          |
                          v
                      Deploy
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
         DEV             QA             UAT
                                          |
                                          v
                                         PROD
```

> **Jenkins, Bamboo and GitHub Actions are different implementations of the same fundamental CI/CD goal: automatically and reliably move software from source control through build, test, validation, packaging and deployment.**
