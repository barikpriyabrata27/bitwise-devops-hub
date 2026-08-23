# Bamboo CI/CD

## 1. What is Bamboo?

Bamboo is a CI/CD tool developed by Atlassian.

It can automate:

- Source code checkout
- Build
- Unit testing
- Code quality checks
- Security scanning
- Artifact creation
- Artifact publishing
- Deployment
- Release workflows

A typical Bamboo pipeline looks like:

Developer
    |
    v
Git Repository
    |
    v
Bamboo
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
Artifact Repository
    |
    v
Deployment
    |
    v
Environment

---

# 2. Bamboo in CI/CD

Bamboo can be used to implement both Continuous Integration and Continuous Delivery.

Continuous Integration:

Developer
    |
    v
Commit
    |
    v
Bamboo
    |
    +---- Checkout
    +---- Build
    +---- Test
    +---- Scan
    |
    v
Artifact

Continuous Delivery:

Artifact
    |
    v
Bamboo
    |
    +---- DEV
    +---- QA
    +---- UAT
    +---- PROD

---

# 3. Bamboo Architecture

A simplified Bamboo architecture is:

Bamboo Server
      |
      +----------------+
      |                |
      v                v
Local Agent       Remote Agent
      |                |
      v                v
   Build             Build

The Bamboo Server coordinates the CI/CD process.

Agents execute the actual build and deployment tasks.

---

# 4. Bamboo Server

The Bamboo Server is responsible for orchestration.

It manages things such as:

- Plans
- Jobs
- Stages
- Builds
- Deployments
- Agents
- Permissions
- Variables
- Results
- Logs

Conceptually:

Bamboo Server
     |
     +---- Plans
     |
     +---- Agents
     |
     +---- Builds
     |
     +---- Deployments
     |
     +---- Variables
     |
     +---- Results

---

# 5. Bamboo Agent

A Bamboo Agent is the execution environment where tasks actually run.

Example:

Bamboo Server
      |
      v
Bamboo Agent
      |
      +---- Git
      +---- Java
      +---- Maven
      +---- Docker
      +---- Ansible

The agent needs the tools required by the jobs assigned to it.

---

# 6. Local Agent

A local agent runs on the same machine as the Bamboo Server.

Conceptually:

Bamboo Server
      |
      +---- Local Agent

The local agent can execute builds directly.

Local agents can be useful for smaller installations.

However, running heavy builds on the same machine as the Bamboo Server may consume resources needed by Bamboo itself.

---

# 7. Remote Agent

A remote agent runs on a different machine.

Example:

Bamboo Server
      |
      v
Remote Agent
      |
      v
Build

This allows build workloads to be distributed across multiple machines.

Example:

Bamboo Server
      |
      +---- Linux Agent
      |
      +---- Windows Agent
      |
      +---- Docker Agent
      |
      +---- Deployment Agent

---

# 8. Why Use Multiple Agents?

Multiple agents allow Bamboo to execute jobs in parallel.

Example:

Bamboo
  |
  +---- Agent 1 → Build
  |
  +---- Agent 2 → Test
  |
  +---- Agent 3 → Security Scan

This can reduce pipeline execution time.

---

# 9. Bamboo Plan

A Plan defines the overall CI build configuration in Bamboo.

A plan contains:

- Source repository
- Build configuration
- Stages
- Jobs
- Tasks
- Triggers
- Variables
- Requirements

Conceptually:

Plan
 |
 +---- Source
 |
 +---- Stages
 |
 +---- Jobs
 |
 +---- Tasks
 |
 +---- Triggers
 |
 +---- Variables

---

# 10. Bamboo Project

A Project is a logical grouping of related Bamboo Plans.

Example:

Project: Payment Application

    |
    +---- Payment CI
    |
    +---- Payment Release
    |
    +---- Payment Deployment

Another project could contain plans for another application.

---

# 11. Project vs Plan

Project:

    Groups related plans.

Plan:

    Defines the build process.

Example:

Project
    |
    +---- Plan A
    +---- Plan B
    +---- Plan C

---

# 12. Bamboo Stage

A Stage is a logical section of a Bamboo Plan.

Example:

Plan
 |
 +---- Build Stage
 |
 +---- Test Stage
 |
 +---- Package Stage

Stages help organize the pipeline.

---

# 13. Bamboo Job

A Job contains the tasks that Bamboo executes.

Example:

Stage: Build

    Job: Maven Build

        Task 1 → Checkout
        Task 2 → Maven Build
        Task 3 → Unit Test

Conceptually:

Stage
   |
   +---- Job
           |
           +---- Task
           +---- Task
           +---- Task

---

# 14. Bamboo Task

A Task is an individual action executed by a Bamboo Job.

Examples:

- Checkout code
- Run Maven
- Execute shell script
- Run Docker command
- Run tests
- Publish artifact

Example:

Job
 |
 +---- Checkout
 |
 +---- Maven Build
 |
 +---- Unit Test

---

# 15. Project → Plan → Stage → Job → Task

This hierarchy is very important.

Project
   |
   v
Plan
   |
   v
Stage
   |
   v
Job
   |
   v
Task

Example:

Payment Project
    |
    v
Payment CI Plan
    |
    v
Build Stage
    |
    v
Maven Build Job
    |
    +---- Checkout
    +---- mvn clean
    +---- mvn test
    +---- mvn package

---

# 16. Bamboo Plan Example

A typical Java application plan could be:

Project
   |
   v
Application CI Plan
   |
   +---- Build Stage
   |       |
   |       +---- Checkout
   |       +---- Maven Build
   |
   +---- Test Stage
   |       |
   |       +---- Unit Test
   |       +---- Integration Test
   |
   +---- Security Stage
   |       |
   |       +---- SAST
   |       +---- Dependency Scan
   |
   +---- Package Stage
           |
           +---- Create Artifact
           +---- Publish Artifact

---

# 17. Bamboo Build

A build is an execution of a Bamboo Plan.

Example:

Plan:

    Payment-CI

Build:

    Payment-CI #125

Another execution:

    Payment-CI #126

Each build has its own result and logs.

---

# 18. Build Number

Bamboo can assign build numbers to executions.

Example:

    Build #100
    Build #101
    Build #102

Build numbers help identify individual executions.

---

# 19. Build Result

A Bamboo build can have statuses such as:

- Successful
- Failed
- In progress
- Cancelled

Example:

Build
   |
   +---- Success
   |
   +---- Failure

The result determines whether downstream stages or deployments can continue.

---

# 20. Bamboo Build Workflow

A typical build workflow is:

Commit
   |
   v
Trigger
   |
   v
Checkout
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

---

# 21. Source Code Integration

Bamboo can integrate with source-control systems.

Common examples include:

- Git
- Bitbucket
- Other supported repositories

Typical flow:

Developer
   |
   v
Git Repository
   |
   v
Bamboo
   |
   v
Checkout

---

# 22. Git Integration

A Bamboo plan can be configured to retrieve source code from Git.

Example:

Git Repository
    |
    v
Bamboo Plan
    |
    v
Agent Workspace

The agent checks out the required branch or revision.

---

# 23. Branch Builds

Bamboo can create builds for branches depending on the configuration.

Example:

main
 |
 +---- Build

feature/login
 |
 +---- Build

feature/payment
 |
 +---- Build

This allows development branches to be validated automatically.

---

# 24. Build Triggers

A trigger determines when Bamboo should start a build.

Examples:

- Repository changes
- Scheduled trigger
- Manual trigger
- Other supported events

Example:

Git Commit
    |
    v
Trigger
    |
    v
Bamboo Build

---

# 25. Repository Trigger

A repository trigger starts a build when new changes are detected.

Example:

Developer
   |
   v
git push
   |
   v
Repository
   |
   v
Bamboo Trigger
   |
   v
Build

This is commonly used for CI.

---

# 26. Scheduled Trigger

A build can also run on a schedule.

Example:

Every night:

    01:00 AM
       |
       v
Bamboo Build
       |
       v
Tests

Scheduled builds can be useful for:

- Regression testing
- Nightly builds
- Security scans
- Maintenance jobs

---

# 27. Manual Trigger

A user can manually start a Bamboo build.

Example:

User
 |
 v
Run Plan
 |
 v
Bamboo
 |
 v
Build

This can be useful for:

- Release builds
- Troubleshooting
- Manual deployments
- Emergency operations

---

# 28. Bamboo Variables

Variables allow configuration values to be reused.

Examples:

- Application version
- Environment
- Repository URL
- Artifact name
- Deployment target

Conceptually:

Variable:

    app.version = 1.5.0

Pipeline:

    Build
       |
       v
    Package 1.5.0

---

# 29. Variable Scopes

Variables can be defined at different levels depending on the Bamboo configuration.

Examples:

- Global variables
- Project variables
- Plan variables
- Deployment variables
- Job variables

Use the narrowest appropriate scope.

---

# 30. Secrets and Password Variables

Sensitive information should not be stored as normal plain-text variables.

Examples:

- Password
- API token
- SSH key
- Cloud credential

Use Bamboo's supported secure credential mechanisms.

Conceptually:

Secure Credential
       |
       v
Bamboo Job
       |
       v
Deployment

---

# 31. Maven Integration

Bamboo can execute Maven builds.

Example:

Checkout
   |
   v
Maven
   |
   v
Build
   |
   v
Test
   |
   v
Package

Typical command:

    mvn clean test

or:

    mvn clean package

---

# 32. Maven Artifact

A Maven build may produce:

    target/myapp-1.0.0.jar

The artifact can then be published to a repository.

Example:

Maven
   |
   v
JAR
   |
   v
Nexus / Artifactory

---

# 33. Build and Test

A typical Bamboo Java build:

Checkout
   |
   v
mvn clean
   |
   v
mvn test
   |
   v
mvn package

If tests fail:

Build
   |
   v
Test
   |
   X
Failure

The pipeline should normally stop or prevent promotion.

---

# 34. Code Quality

Bamboo can execute code-quality tools.

Example:

Build
   |
   v
SonarQube
   |
   v
Quality Gate

If the quality gate fails:

Pipeline
   |
   v
STOP

---

# 35. Security Scanning

Security tools can be integrated into Bamboo.

Examples:

- SonarQube
- Veracode
- Black Duck
- CodeQL where supported through the organization's setup
- Dependency scanning tools

Example:

Build
   |
   v
Security Scan
   |
   +---- PASS
   |
   +---- FAIL

---

# 36. Bamboo and Artifact Repositories

Bamboo can work with artifact repositories such as:

- Nexus
- Artifactory

Typical flow:

Build
   |
   v
Artifact
   |
   v
Nexus / Artifactory
   |
   v
Deployment

The repository becomes the central location for build artifacts.

---

# 37. Build Once, Deploy Many

A recommended CI/CD pattern is:

Build Once
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
PROD

The same artifact should be promoted through environments.

---

# 38. Bamboo Deployment Projects

Bamboo can use deployment projects to define how artifacts are deployed to environments.

Conceptually:

Plan
 |
 v
Artifact
 |
 v
Deployment Project
 |
 +---- DEV
 +---- QA
 +---- UAT
 +---- PROD

---

# 39. Deployment Environment

An environment represents a target deployment location.

Examples:

- DEV
- QA
- UAT
- Production

Example:

Deployment Project
      |
      +---- DEV
      |
      +---- QA
      |
      +---- PROD

Each environment can have its own configuration.

---

# 40. Deployment Flow

A typical flow:

Build
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
Production

Approvals or gates may be introduced before sensitive environments.

---

# 41. Deployment Variables

Different environments may require different values.

Example:

DEV:

    database.host = dev-db

QA:

    database.host = qa-db

PROD:

    database.host = prod-db

The application artifact can remain the same while environment-specific configuration changes.

---

# 42. Deployment Permissions

Production deployments should be restricted.

Example:

Developer
    |
    X
Production Deployment

Authorized Release User
    |
    v
Production Deployment

Use appropriate Bamboo permissions and organizational controls.

---

# 43. Deployment Approvals

A production deployment may require approval.

Example:

UAT
 |
 v
Approval
 |
 v
Production

This provides an additional control before production deployment.

---

# 44. Bamboo Artifacts

Artifacts are outputs produced by a build.

Examples:

- JAR
- WAR
- ZIP
- Docker-related build output
- Test reports
- Deployment packages

Example:

Build
 |
 v
Artifact
 |
 v
Deployment

---

# 45. Artifact Definition

A plan can define which files should be treated as artifacts.

Example:

    target/*.jar

The resulting artifact can then be made available to downstream processes depending on the Bamboo configuration.

---

# 46. Artifact Dependencies

A deployment process can consume artifacts produced by a build plan.

Conceptually:

CI Plan
   |
   v
Artifact
   |
   v
Deployment
   |
   v
Environment

This creates a relationship between build and deployment.

---

# 47. Bamboo Release Flow

A release process can look like:

Developer
   |
   v
Git
   |
   v
Bamboo CI
   |
   +---- Build
   +---- Test
   +---- Scan
   |
   v
Artifact
   |
   v
Bamboo Deployment
   |
   +---- DEV
   +---- QA
   +---- UAT
   +---- PROD

---

# 48. Bamboo and Docker

Bamboo can execute Docker commands when Docker is available on the agent.

Example:

Build Agent
   |
   v
Docker
   |
   v
Container Image
   |
   v
Container Registry

Typical operations include:

    docker build

    docker tag

    docker push

---

# 49. Bamboo and Kubernetes

Bamboo can be used to automate Kubernetes deployments.

Conceptually:

Bamboo
   |
   v
Agent
   |
   v
kubectl
   |
   v
Kubernetes
   |
   v
Pods

The agent needs appropriate Kubernetes credentials and network access.

---

# 50. Bamboo and Ansible

Bamboo can execute Ansible playbooks.

Example:

Bamboo
   |
   v
Agent
   |
   v
Ansible
   |
   v
Servers

Example command:

    ansible-playbook deploy.yml

The agent needs appropriate SSH credentials and network access.

---

# 51. Bamboo and AWS

Bamboo can be used as part of AWS deployment workflows.

Example:

Bamboo
   |
   v
Agent
   |
   v
AWS CLI
   |
   v
AWS

Possible targets include:

- EC2
- S3
- EKS
- Other AWS services

Use appropriate IAM permissions.

---

# 52. Bamboo and Terraform

Bamboo can execute Terraform commands.

Typical flow:

Checkout
   |
   v
terraform init
   |
   v
terraform plan
   |
   v
Approval
   |
   v
terraform apply

Terraform should use appropriate cloud credentials and state management.

---

# 53. Bamboo Specs

Bamboo configurations can be managed using Bamboo Specs.

Bamboo Specs allow configuration to be represented as code.

Conceptually:

Git
 |
 v
Bamboo Specs
 |
 v
Bamboo
 |
 v
Plan / Deployment

This supports configuration-as-code practices.

---

# 54. Why Use Bamboo Specs?

Benefits include:

- Version control
- Reviewable configuration
- Repeatability
- Automation
- Easier recovery
- Reduced manual configuration

Instead of configuring everything manually in the UI, pipeline configuration can be maintained as code.

---

# 55. Bamboo Specs Workflow

Example:

Developer
   |
   v
Git
   |
   v
Bamboo Specs
   |
   v
Review
   |
   v
Bamboo
   |
   v
Plan

This brings CI/CD configuration into the software development workflow.

---

# 56. Bamboo Agent Capabilities

Agents can have capabilities representing installed tools.

Example:

Agent 1:

    Java
    Maven
    Docker

Agent 2:

    Python
    Terraform
    Ansible

Agent 3:

    Windows
    PowerShell
    MSBuild

Bamboo can use these capabilities to select suitable agents.

---

# 57. Agent Requirements

A job may require specific capabilities.

Example:

Job:

    Maven Build

Required:

    Java
    Maven

Bamboo should select an agent capable of executing those tasks.

---

# 58. Agent Pools

Organizations may organize agents into logical groups.

Example:

CI Agents
   |
   +---- Linux Agent
   +---- Linux Agent
   +---- Windows Agent

Deployment Agents
   |
   +---- DEV
   +---- QA
   +---- PROD

This helps separate workloads.

---

# 59. Parallel Execution

Multiple agents allow jobs to execute in parallel.

Example:

Bamboo
   |
   +---- Agent 1 → Build
   +---- Agent 2 → Test
   +---- Agent 3 → Security

This can reduce overall pipeline duration.

---

# 60. Bamboo Build Queue

If all suitable agents are busy:

Job
 |
 v
Queue
 |
 v
Wait
 |
 v
Agent Available
 |
 v
Execute

Long queue times can indicate insufficient capacity.

---

# 61. Bamboo Elastic Agents

Bamboo can support elastic agent models where agents can be provisioned dynamically in supported environments.

Conceptually:

Build Queue
   |
   v
Bamboo
   |
   v
Provision Agent
   |
   v
Run Build
   |
   v
Release Agent

Dynamic agents can help handle variable workloads.

---

# 62. Static vs Elastic Agents

Static agent:

    Long-running machine

Elastic agent:

    Dynamically provisioned execution environment

Static:

    Faster startup
    More persistent infrastructure

Elastic:

    Better scalability
    Potentially better resource utilization

---

# 63. Bamboo Notifications

Bamboo can provide build and deployment notifications depending on configuration.

Examples:

- Email
- Other integrated notification mechanisms

Typical event:

Build Failed
    |
    v
Notification
    |
    v
Development Team

---

# 64. Build Logs

Bamboo provides build logs that help troubleshoot failures.

Example:

Build
 |
 v
Task 1
 |
 v
Task 2
 |
 X
Task 3 Failed
 |
 v
Build Log

Logs can help determine:

- Which task failed
- Error message
- Command executed
- Agent used
- Build context

---

# 65. Bamboo Troubleshooting

When a build fails, check:

1. Build logs
2. Agent status
3. Agent capabilities
4. Source checkout
5. Tool versions
6. Environment variables
7. Credentials
8. Network connectivity
9. Artifact repository
10. Disk space

---

# 66. Maven Build Failure

If Maven fails:

Check:

    java -version

    mvn -version

Also check:

- JAVA_HOME
- Maven settings
- Nexus/Artifactory
- Network
- Dependency resolution
- POM configuration

---

# 67. Git Checkout Failure

If Git checkout fails, check:

- Repository URL
- Credentials
- Branch
- SSH/HTTPS connectivity
- Agent network
- Repository permissions

Flow:

Bamboo
   |
   v
Git Repository
   |
   X
Checkout Failed

---

# 68. Agent Offline

If an agent is unavailable:

Bamboo
   |
   X
Agent Offline

Check:

- Agent machine
- Network
- Bamboo connectivity
- Agent service
- Java/runtime
- Firewall
- Logs

---

# 69. Job Waiting in Queue

Possible causes:

- No free agent
- Wrong agent requirement
- Agent offline
- Missing capability
- Agent capacity issue

Example:

Job
 |
 v
Queue
 |
 X
No Matching Agent

---

# 70. Artifact Publishing Failure

If artifact publishing fails:

Check:

- Nexus/Artifactory connectivity
- Repository URL
- Credentials
- Artifact path
- Version
- Network
- Repository permissions

---

# 71. Deployment Failure

If deployment fails:

Check:

- Artifact availability
- Target environment
- Credentials
- Network
- Deployment scripts
- Configuration
- Application logs
- Health checks

---

# 72. Bamboo Security

Bamboo should be secured like any other CI/CD platform.

Important controls include:

- Authentication
- Authorization
- Least privilege
- Credential management
- Agent security
- Repository security
- Pipeline security
- Production permissions
- Auditability

---

# 73. Bamboo Credentials

Credentials should not be hardcoded into build scripts.

Avoid:

    password=MyPassword

Prefer:

Secure Credential
      |
      v
Bamboo
      |
      v
Build / Deployment

---

# 74. Least Privilege

A Bamboo job should have only the permissions required for its task.

Example:

Build Job:

    Read Source
    Build
    Test
    Publish Artifact

Deployment Job:

    Read Artifact
    Deploy

Avoid giving all jobs full production access.

---

# 75. Production Security

Production deployments should be protected.

Example:

CI
 |
 v
Artifact
 |
 v
UAT
 |
 v
Approval
 |
 v
Production

Production credentials should only be available to the required deployment process.

---

# 76. Bamboo and Pipeline Security

Pipeline configuration should be protected because it can execute commands on agents.

Example:

Pipeline
   |
   v
Agent
   |
   v
Shell Commands

A malicious pipeline modification could execute dangerous commands.

Therefore:

- Protect source repositories
- Review pipeline changes
- Limit permissions
- Protect credentials
- Restrict production access

---

# 77. Bamboo and Branching Strategy

Bamboo works well with Git branching strategies.

Example:

main
 |
 +---- release
 |
 +---- feature/login
 |
 +---- feature/payment

Feature branches can trigger CI builds.

The main branch can have stricter validation.

---

# 78. Bamboo Pull Request Workflow

A typical workflow:

Developer
   |
   v
Feature Branch
   |
   v
Pull Request
   |
   v
Bamboo CI
   |
   +---- Build
   +---- Test
   +---- Scan
   |
   v
Code Review
   |
   v
Merge

---

# 79. Bamboo CI/CD with Git

Complete flow:

Git
 |
 v
Bamboo
 |
 +---- Checkout
 |
 +---- Build
 |
 +---- Test
 |
 +---- Scan
 |
 +---- Package
 |
 v
Artifact Repository
 |
 v
Deployment

---

# 80. Bamboo vs Jenkins

Both can provide CI/CD automation.

| Area | Bamboo | Jenkins |
|---|---|---|
| Vendor | Atlassian | Jenkins community |
| CI/CD | Yes | Yes |
| Agents | Yes | Yes |
| Pipelines | Yes | Yes |
| Deployment | Yes | Yes |
| Plugin Ecosystem | Integrated Atlassian ecosystem | Very large plugin ecosystem |
| Configuration as Code | Bamboo Specs | Jenkinsfile / Configuration as Code options |
| Atlassian Integration | Strong | Possible through integrations |

The best choice depends on the organization's ecosystem and requirements.

---

# 81. Bamboo vs GitHub Actions

| Area | Bamboo | GitHub Actions |
|---|---|---|
| Platform | Atlassian | GitHub |
| Pipeline | Plans | Workflows |
| Execution | Agents | Runners |
| Configuration | UI / Specs | YAML |
| GitHub Integration | Through integration | Native |
| Deployment | Yes | Yes |
| Hosted Execution | Environment dependent | GitHub-hosted runners |
| Self-Hosted Execution | Agents | Self-hosted runners |

---

# 82. Bamboo vs Jenkins vs GitHub Actions

Conceptual mapping:

Bamboo:
    Plan → Stage → Job → Task

Jenkins:
    Pipeline → Stage → Steps

GitHub Actions:
    Workflow → Job → Step

Execution:

Bamboo:
    Agent

Jenkins:
    Agent

GitHub Actions:
    Runner

---

# 83. Example Enterprise Bamboo Architecture

A typical enterprise setup could be:

Developer
    |
    v
Git / Bitbucket
    |
    v
Bamboo
    |
    +-----------------------+
    |                       |
    v                       v
CI Agents              Deployment Agents
    |                       |
    v                       v
Build/Test/Scan         DEV/QA/UAT/PROD
    |
    v
Nexus / Artifactory
    |
    v
Deployment

---

# 84. Bamboo CI Pipeline Example

A Java application:

Git
 |
 v
Checkout
 |
 v
Maven Clean
 |
 v
Compile
 |
 v
Unit Test
 |
 v
SonarQube
 |
 v
Dependency Scan
 |
 v
Package
 |
 v
Publish Artifact

---

# 85. Bamboo CD Pipeline Example

Artifact
 |
 v
DEV
 |
 v
Smoke Test
 |
 v
QA
 |
 v
Integration Test
 |
 v
UAT
 |
 v
Approval
 |
 v
PROD
 |
 v
Health Check

---

# 86. Bamboo with Nexus

Example:

Bamboo
   |
   v
Maven Build
   |
   v
JAR
   |
   v
Nexus
   |
   v
Deployment

Nexus provides centralized artifact storage.

---

# 87. Bamboo with Artifactory

Similar flow:

Bamboo
   |
   v
Build
   |
   v
Artifact
   |
   v
Artifactory
   |
   v
Deployment

---

# 88. Bamboo with Docker

Example:

Git
 |
 v
Bamboo
 |
 v
Docker Build
 |
 v
Image Scan
 |
 v
Docker Registry
 |
 v
Deployment

---

# 89. Bamboo with Kubernetes

Example:

Git
 |
 v
Bamboo
 |
 v
Build Image
 |
 v
Registry
 |
 v
Kubernetes
 |
 v
Deployment

Bamboo can execute kubectl, Helm, scripts, or other deployment mechanisms depending on the implementation.

---

# 90. Bamboo with Ansible

Example:

Git
 |
 v
Bamboo
 |
 v
Ansible Playbook
 |
 v
Target Servers

This can be used for configuration management and application deployment.

---

# 91. Bamboo with Terraform

Example:

Git
 |
 v
Bamboo
 |
 v
Terraform Plan
 |
 v
Approval
 |
 v
Terraform Apply
 |
 v
Cloud Infrastructure

Terraform state should be managed securely and separately from the pipeline workspace.

---

# 92. Bamboo Release Management

A release process can include:

Build
 |
 v
Artifact
 |
 v
Release
 |
 +---- DEV
 +---- QA
 +---- UAT
 +---- PROD

Each environment can have different permissions and variables.

---

# 93. Deployment Strategy in Bamboo

Bamboo can orchestrate different deployment strategies depending on the infrastructure.

Examples:

- Recreate
- Rolling
- Blue-Green
- Canary

The actual traffic management is generally handled by the target platform, load balancer, Kubernetes, service mesh, or deployment scripts.

Bamboo acts as the automation/orchestration layer.

---

# 94. Bamboo and Rollback

Rollback can be automated through Bamboo.

Example:

Production
   |
   v
Version 2
   |
   X
Failure
   |
   v
Rollback Plan
   |
   v
Version 1

Rollback may involve:

- Redeploying previous artifact
- Kubernetes rollback
- Restoring configuration
- Running rollback scripts

Database rollback requires special care.

---

# 95. Bamboo Deployment Variables

Example:

DEV:

    APP_ENV=dev

QA:

    APP_ENV=qa

UAT:

    APP_ENV=uat

PROD:

    APP_ENV=prod

The same deployment process can use different environment-specific values.

---

# 96. Bamboo and Environment Promotion

A controlled promotion flow:

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

Promotion should occur only when required checks pass.

---

# 97. Bamboo Pipeline as Code

Pipeline configuration can be version-controlled using Bamboo Specs.

Conceptually:

Git
 |
 +---- bamboo-specs
 |
 v
Review
 |
 v
Bamboo
 |
 v
Plan

Benefits:

- Version history
- Pull request review
- Repeatability
- Auditability
- Easier recovery

---

# 98. Bamboo Best Practices

1. Use version-controlled Bamboo Specs where appropriate.
2. Keep plans modular.
3. Use meaningful plan names.
4. Use separate agents for specialized workloads.
5. Define agent capabilities correctly.
6. Use least privilege.
7. Protect production deployments.
8. Store secrets securely.
9. Do not hardcode credentials.
10. Use artifact repositories.
11. Build once and deploy many.
12. Use immutable artifact versions.
13. Add automated tests.
14. Add security scanning.
15. Monitor build failures.
16. Monitor agent health.
17. Keep agents patched.
18. Use appropriate deployment approvals.
19. Maintain rollback procedures.
20. Document the CI/CD architecture.

---

# 99. Bamboo Troubleshooting Checklist

    [ ] Bamboo Server available
    [ ] Agent online
    [ ] Correct agent capability
    [ ] Repository accessible
    [ ] Credentials valid
    [ ] Git checkout successful
    [ ] Java available
    [ ] Maven available
    [ ] Required tools installed
    [ ] Network available
    [ ] Disk space available
    [ ] Build variables correct
    [ ] Artifact repository reachable
    [ ] Artifact published
    [ ] Deployment target reachable
    [ ] Deployment credentials valid
    [ ] Health checks successful

---

# 100. Bamboo Interview Questions

## What is Bamboo?

Bamboo is an Atlassian CI/CD automation tool used to automate build, test, release, and deployment workflows.

## What is a Bamboo Plan?

A Plan defines the configuration of a build process.

## What is a Stage?

A Stage is a logical section of a Bamboo Plan.

## What is a Job?

A Job contains tasks that are executed by an agent.

## What is a Task?

A Task is an individual action executed within a Job.

## What is a Bamboo Agent?

A machine or execution environment that executes Bamboo tasks.

## What is the difference between a local and remote agent?

A local agent runs with the Bamboo Server installation, while a remote agent runs on a separate machine.

## What are agent capabilities?

Agent capabilities describe the software, tools, or characteristics available on an agent.

## Why are agent capabilities important?

They allow Bamboo to select an agent that can satisfy a job's requirements.

## What is a Bamboo Deployment Project?

It defines how build artifacts are deployed to environments.

## What is Bamboo Specs?

Bamboo Specs is a configuration-as-code approach for defining Bamboo plans and deployment configuration.

## Why use Bamboo Specs?

It allows CI/CD configuration to be version-controlled, reviewed, and reproduced.

## How does Bamboo integrate with Git?

Bamboo can monitor repositories, check out source code, build branches, and trigger CI workflows based on repository changes.

## How does Bamboo integrate with Maven?

Bamboo can execute Maven commands such as:

    mvn clean test

    mvn clean package

## How does Bamboo work with Nexus?

Bamboo can publish build artifacts to Nexus and later retrieve them for deployment.

## How do you secure Bamboo credentials?

Use Bamboo's secure credential mechanisms rather than hardcoding credentials in scripts or configuration.

## How do you deploy to production securely?

Use:

- Protected permissions
- Secure credentials
- Approval gates
- Separate deployment agents
- Environment-specific configuration
- Monitoring
- Rollback procedures

---

# 101. Important Bamboo Concepts

Remember this hierarchy:

Project
   |
   v
Plan
   |
   v
Stage
   |
   v
Job
   |
   v
Task

And the execution model:

Bamboo Server
      |
      v
Agent
      |
      v
Job
      |
      v
Tasks

And the deployment model:

Plan
 |
 v
Artifact
 |
 v
Deployment Project
 |
 +---- DEV
 +---- QA
 +---- UAT
 +---- PROD

---

# 102. Complete Bamboo CI/CD Flow

A complete enterprise flow can look like:

Developer
    |
    v
Feature Branch
    |
    v
Pull Request
    |
    v
Git Repository
    |
    v
Bamboo Trigger
    |
    v
Bamboo Plan
    |
    v
Build Stage
    |
    +---- Checkout
    +---- Compile
    +---- Unit Test
    |
    v
Security Stage
    |
    +---- SAST
    +---- Dependency Scan
    +---- Secret Scan
    |
    v
Package Stage
    |
    +---- JAR / WAR
    |
    v
Nexus / Artifactory
    |
    v
Deployment Project
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
    |
    v
Health Check
    |
    +---- Success
    |
    +---- Failure
              |
              v
          Rollback

---

# 103. Bamboo Mental Model

Think of Bamboo like this:

Bamboo Server
    |
    |  "What needs to happen?"
    |
    v
Plan
    |
    v
Stage
    |
    v
Job
    |
    v
Task
    |
    |  "Where should it execute?"
    |
    v
Agent
    |
    |  "What should it execute?"
    |
    v
Commands / Tools
    |
    v
Artifact
    |
    v
Deployment

The most important distinction is:

Bamboo Server = Orchestration

Bamboo Agent = Execution

Plan = Pipeline definition

Stage = Logical phase

Job = Unit of execution

Task = Individual action

Artifact = Build output

Deployment Project = Deployment process

Environment = Deployment target

---

# 104. Key Takeaway

Bamboo is an enterprise CI/CD platform that can automate the complete software delivery lifecycle.

The core architecture is:

Git
 |
 v
Bamboo
 |
 v
Plan
 |
 v
Stage
 |
 v
Job
 |
 v
Task
 |
 v
Agent
 |
 v
Build/Test/Scan
 |
 v
Artifact
 |
 v
Nexus / Artifactory
 |
 v
Deployment Project
 |
 +---- DEV
 +---- QA
 +---- UAT
 +---- PROD

The most important concepts to remember are:

- Bamboo Server orchestrates.
- Bamboo Agents execute.
- Projects group Plans.
- Plans define CI processes.
- Stages organize Plans.
- Jobs contain Tasks.
- Tasks perform individual actions.
- Artifacts are build outputs.
- Deployment Projects manage deployments.
- Environments represent deployment targets.
- Agent capabilities help select the correct agent.
- Bamboo Specs provides configuration as code.
- Variables provide reusable configuration.
- Secure credentials protect sensitive information.
- Approvals protect sensitive deployments.
- Artifact repositories store build outputs.
- Rollback provides recovery from failed deployments.

The overall principle is:

> Bamboo automates the path from source code to a tested, versioned artifact and ultimately to controlled deployment across environments.
