# Runners and Agents

## 1. What is a Runner or Agent?

A runner or agent is the machine or execution environment where CI/CD jobs actually run.

The CI/CD platform manages the pipeline, while the runner or agent executes the commands.

Example:

GitHub
  |
  v
GitHub Actions
  |
  v
Runner
  |
  +---- Checkout Code
  +---- Build
  +---- Test
  +---- Scan
  +---- Package

Jenkins:

Jenkins Controller
  |
  v
Agent
  |
  +---- Build
  +---- Test
  +---- Deploy

The important concept is:

The CI/CD controller orchestrates the work; the runner or agent executes the work.

---

## 2. Why Do We Need Runners or Agents?

A CI/CD platform needs compute resources to execute commands.

Examples:

    mvn clean package

    terraform plan

    docker build .

    ansible-playbook deploy.yml

These commands need:

- CPU
- Memory
- Operating system
- Network
- Required tools
- Credentials
- Workspace

The runner or agent provides that execution environment.

---

## 3. Basic Architecture

A typical CI/CD architecture looks like:

Git Repository
      |
      v
CI/CD Platform
      |
  +---+---+
  |       |
  v       v
Runner 1 Runner 2
  |       |
  v       v
Build   Deploy

The CI/CD platform decides:

What job should run?

The runner executes:

How should the job run?

---

## 4. Runner vs Agent

Different CI/CD platforms use different terminology.

| Platform | Execution Terminology |
|---|---|
| GitHub Actions | Runner |
| Jenkins | Agent |
| Bamboo | Agent |
| GitLab CI | Runner |
| Azure DevOps | Agent |

The underlying concept is similar:

CI/CD Controller
      |
      v
Execution Machine
      |
      v
Job

---

# GitHub Actions Runners

## 5. GitHub Actions Runner

GitHub Actions uses runners to execute workflow jobs.

Example:

    jobs:

      build:

        runs-on: ubuntu-latest

        steps:

          - uses: actions/checkout@v4

          - name: Build
            run: mvn clean package

Here:

    runs-on: ubuntu-latest

specifies the runner environment.

Flow:

GitHub Actions
      |
      v
Ubuntu Runner
      |
      v
Maven Build

---

## 6. GitHub-Hosted Runners

GitHub provides hosted runners that are managed by GitHub.

Example:

    runs-on: ubuntu-latest

Common operating-system choices include:

- Ubuntu/Linux
- Windows
- macOS

The exact available runner images and versions depend on GitHub's current offerings.

---

## 7. Advantages of GitHub-Hosted Runners

Advantages include:

- No infrastructure maintenance
- Easy setup
- Preconfigured environments
- Automatic provisioning
- Easy scaling
- Good GitHub Actions integration

You generally do not need to maintain the underlying VM yourself.

---

## 8. Disadvantages of GitHub-Hosted Runners

Possible limitations include:

- Limited customization
- Execution limits
- Network restrictions
- Private infrastructure access challenges
- Usage-based cost depending on plan and runner type
- Runner environments may be recreated between jobs

The exact limits depend on the GitHub plan and runner type.

---

## 9. Self-Hosted Runner

A self-hosted runner is a machine managed by the organization.

Example:

Company Network
      |
      v
Self-Hosted Runner
      |
      +---- Docker
      +---- Maven
      +---- Terraform
      +---- Ansible

GitHub Actions can send jobs to that runner.

---

## 10. Self-Hosted Runner Architecture

GitHub
   |
   v
GitHub Actions
   |
   v
Self-Hosted Runner
   |
   v
Company Network
   |
   +---- Internal Repository
   +---- Servers
   +---- Databases
   +---- Deployment Systems

This is useful when the pipeline needs access to private infrastructure.

---

## 11. Why Use Self-Hosted Runners?

Common reasons include:

- Private network access
- Custom software
- Special hardware
- Internal tools
- Custom security requirements
- Network restrictions
- Large build requirements

Example:

GitHub
   |
   v
Self-Hosted Runner
   |
   v
Internal Nexus

A GitHub-hosted runner may not have direct access to an internal Nexus server, while a properly configured self-hosted runner can.

---

## 12. Self-Hosted Runner Security

A self-hosted runner is part of your infrastructure.

Therefore it should be treated as a security-sensitive system.

Consider:

- Operating system hardening
- Patch management
- Network controls
- Least privilege
- Credential protection
- Monitoring
- Access control
- Isolation

Do not assume that a self-hosted runner is automatically secure simply because GitHub manages the workflow.

---

## 13. Runner Labels

Labels allow jobs to target appropriate runners.

Example:

    runs-on: [self-hosted, linux, docker]

Conceptually:

Job
 |
 v
Find Runner
 |
 +---- self-hosted
 +---- linux
 +---- docker
 |
 v
Matching Runner

Labels are useful when different runners have different capabilities.

---

## 14. Example Runner Categories

An organization may have:

- runner-linux
- runner-windows
- runner-docker
- runner-terraform
- runner-deployment

Then jobs can select the appropriate runner.

---

## 15. Runner Selection

Example:

    jobs:

      terraform:

        runs-on: [self-hosted, linux, terraform]

        steps:

          - uses: actions/checkout@v4

          - name: Terraform Plan
            run: terraform plan

The job is intended for a runner with the required labels.

---

## 16. Why Labels Matter

Suppose you have:

Runner A
  Linux
  Docker

Runner B
  Windows
  PowerShell

Runner C
  Linux
  Terraform

Then:

Docker Job
   |
   v
Runner A

Windows Job
   |
   v
Runner B

Terraform Job
   |
   v
Runner C

Labels make this selection possible.

---

# Jenkins Agents

## 17. Jenkins Controller and Agents

Jenkins commonly uses a controller-agent architecture.

Jenkins Controller
       |
       +---- Agent 1
       |
       +---- Agent 2
       |
       +---- Agent 3

The controller manages jobs and scheduling.

Agents execute the actual build steps.

---

## 18. Jenkins Controller

The Jenkins controller is responsible for tasks such as:

- Job scheduling
- Pipeline orchestration
- Configuration
- Plugin management
- Build coordination

The controller should generally not be overloaded with heavy builds when dedicated agents are available.

---

## 19. Jenkins Agent

A Jenkins agent performs the work assigned by Jenkins.

Example:

Jenkins Controller
       |
       v
Linux Agent
       |
       +---- Maven
       +---- Java
       +---- Docker

Another example:

Jenkins Controller
       |
       v
Windows Agent
       |
       +---- MSBuild
       +---- PowerShell

---

## 20. Jenkins Agent Labels

Jenkins agents can have labels.

Examples:

- linux
- docker
- maven
- windows
- deployment

A pipeline can select an appropriate node.

Example:

    pipeline {

        agent {
            label 'linux'
        }

        stages {

            stage('Build') {

                steps {

                    sh 'mvn clean package'

                }
            }
        }
    }

---

## 21. Jenkins Multiple Agents

A pipeline can use different agents for different stages.

Conceptually:

Build
 |
 +---- Linux Agent
 |
 v
Test
 |
 +---- Linux Agent
 |
 v
Deployment
 |
 +---- Deployment Agent

This allows specialized execution environments.

---

## 22. Jenkins Agent Example

    pipeline {

        agent none

        stages {

            stage('Build') {

                agent {
                    label 'maven'
                }

                steps {
                    sh 'mvn clean package'
                }
            }

            stage('Deploy') {

                agent {
                    label 'deployment'
                }

                steps {
                    sh './deploy.sh'
                }
            }
        }
    }

The pipeline uses different agents for different purposes.

---

# Bamboo Agents

## 23. Bamboo Agents

Bamboo also uses agents to execute builds and deployments.

Conceptually:

Bamboo Server
      |
      +---- Agent 1
      +---- Agent 2
      +---- Agent 3

Agents execute tasks assigned by Bamboo.

---

## 24. Bamboo Agent Types

Bamboo environments can use:

- Local agents
- Remote agents
- Elastic agents

The exact options depend on the Bamboo setup and version.

---

## 25. Local Agent

A local agent runs on the same machine or infrastructure as the Bamboo server.

Conceptually:

Bamboo Server
    |
    +---- Local Agent

This can be convenient but may not be ideal for large workloads.

---

## 26. Remote Agent

A remote agent runs on another machine.

Bamboo Server
      |
      v
Remote Agent
      |
      v
Build

This allows workloads to be distributed across multiple machines.

---

## 27. Elastic Agents

Elastic agents can be provisioned dynamically based on demand where the environment supports them.

Conceptually:

Build Queue
    |
    v
Bamboo
    |
    v
Create Agent
    |
    v
Run Build
    |
    v
Agent Released

This can improve resource utilization.

---

# Static and Dynamic Agents

## 28. Static vs Dynamic Agents

### Static Agent

A machine remains available.

Agent
 |
 +---- Always Available

### Dynamic Agent

A machine or execution environment is created when required.

Job
 |
 v
Provision Agent
 |
 v
Run Job
 |
 v
Remove / Release Agent

Dynamic execution can improve scalability.

---

## 29. Runner Lifecycle

A runner may follow this lifecycle:

Provision
   |
   v
Register
   |
   v
Idle
   |
   v
Job Assigned
   |
   v
Execute
   |
   v
Cleanup
   |
   v
Idle / Terminate

The exact lifecycle depends on the platform.

---

# Runner Workspace and Tools

## 30. Runner Workspace

A runner generally needs a workspace where the job executes.

Example:

Runner
 |
 +---- Workspace
        |
        +---- Source Code
        +---- Build Files
        +---- Test Results
        +---- Artifacts

After a job, workspace handling depends on the CI/CD platform and configuration.

---

## 31. Clean Workspace

A clean workspace can help avoid issues caused by previous jobs.

Example:

Old Build Files
      |
      v
Cleanup
      |
      v
Fresh Checkout
      |
      v
Build

This helps prevent stale files from affecting builds.

---

## 32. Runner Tools

A runner may need:

- Git
- Java
- Maven
- Python
- Docker
- Terraform
- Ansible
- kubectl
- Cloud CLI
- Security tools

Example:

Linux Runner
 |
 +---- Git
 +---- Java
 +---- Maven
 +---- Docker
 +---- Terraform
 +---- Ansible

---

## 33. Tool Version Management

Different projects may require different tool versions.

Example:

Project A
   → Java 17

Project B
   → Java 21

A runner should provide the required version or use an appropriate tool-management mechanism.

---

# Containers and Kubernetes

## 34. Containerized Build Environment

Instead of installing every tool directly on a runner, builds can execute inside containers.

Conceptually:

Runner
   |
   v
Docker
   |
   v
Build Container
   |
   +---- Java
   +---- Maven
   +---- Tools

This can provide more consistent build environments.

---

## 35. Docker Runner Model

Example:

CI Runner
    |
    v
Docker Container
    |
    v
Maven Build

The runner manages the job while the container provides the isolated execution environment.

---

## 36. Runner vs Container

These are not necessarily the same thing.

Runner:

Executes the CI job.

Container:

Provides an isolated execution environment.

Example:

Runner
   |
   v
Container
   |
   v
Build

A runner can execute jobs directly or use containers depending on the platform.

---

## 37. Runner vs Kubernetes Pod

In Kubernetes-based CI/CD:

CI/CD
  |
  v
Kubernetes
  |
  v
Pod
  |
  v
Job

The pod can act as the dynamic execution environment.

This is useful for scalable CI workloads.

---

## 38. Dynamic Kubernetes Runners

Conceptually:

Pipeline Job
     |
     v
Kubernetes
     |
     v
Create Pod
     |
     v
Execute Job
     |
     v
Pod Removed

This avoids maintaining a large number of permanently running agents.

---

# Scaling and Parallel Execution

## 39. Runner Scaling

Suppose:

10 jobs

but only:

2 runners

Then jobs may wait in a queue.

Jobs
 |
 v
Queue
 |
 +---- Runner 1
 |
 +---- Runner 2

More runners can increase parallel execution.

---

## 40. Parallel Jobs

With multiple runners:

                CI
                 |
       +---------+---------+
       |         |         |
       v         v         v
    Runner 1  Runner 2  Runner 3
       |         |         |
       v         v         v
     Build      Test      Scan

This can reduce pipeline execution time.

---

## 41. Runner Capacity

Runner capacity depends on:

- CPU
- Memory
- Disk
- Network
- Concurrent jobs
- Tool requirements

A runner with insufficient resources may cause:

- Slow builds
- Out of memory errors
- Disk-full errors
- Timeouts

---

## 42. Runner Queue

If all runners are busy:

Job
 |
 v
Queue
 |
 v
Wait
 |
 v
Runner Available
 |
 v
Execute

Monitoring queue time can help identify capacity problems.

---

## 43. Autoscaling Runners

A scalable CI system can provision runners based on demand.

Example:

Job Queue
    |
    v
Autoscaler
    |
    v
More Runners
    |
    v
Jobs Execute

When demand decreases:

No Jobs
    |
    v
Reduce Runners

---

## 44. Why Autoscaling Matters

Autoscaling can provide:

- Faster job execution
- Better resource utilization
- Reduced idle infrastructure
- Support for peak loads

It is especially useful for large CI environments.

---

# Runner Isolation and Security

## 45. Runner Isolation

Build jobs may execute untrusted or semi-trusted code.

Therefore isolation is important.

Possible approaches:

- Ephemeral runners
- Containers
- Virtual machines
- Kubernetes pods
- Restricted permissions

---

## 46. Ephemeral Runner

An ephemeral runner is created for a job and then removed.

Conceptually:

Job
 |
 v
Create Runner
 |
 v
Execute
 |
 v
Cleanup
 |
 v
Destroy Runner

This can reduce contamination between jobs.

---

## 47. Persistent Runner

A persistent runner remains available for multiple jobs.

Runner
 |
 +---- Job 1
 |
 +---- Job 2
 |
 +---- Job 3

This can be efficient, but cleanup and isolation become more important.

---

## 48. Ephemeral vs Persistent

| Feature | Ephemeral | Persistent |
|---|---|---|
| Isolation | Higher | Lower |
| Startup | Slower | Faster |
| Cleanup | Automatic by design | Must be managed |
| Security | Better isolation | Requires stronger controls |
| Resource Efficiency | Good when scaled | Good for steady workloads |
| Maintenance | Automated | More maintenance |

The best choice depends on the workload.

---

## 49. Self-Hosted Runner Security Risk

Consider a repository that executes:

    run: ./script.sh

If untrusted code can execute on a persistent self-hosted runner, it could potentially affect the runner environment.

Therefore:

Untrusted Code
      |
      v
Persistent Runner
      |
      X
Security Risk

Use appropriate isolation and access controls.

---

## 50. Pull Request Security

Be especially careful when workflows execute code from untrusted pull requests.

Example:

External PR
    |
    v
Workflow
    |
    v
Self-Hosted Runner

If the workflow executes attacker-controlled code with access to sensitive resources, the runner could be compromised.

---

## 51. Production Deployment Runner

Production deployment jobs may use a dedicated runner.

Example:

CI Runners
   |
   +---- Build
   +---- Test
   +---- Scan

Deployment Runner
   |
   +---- Production Deployment

This provides stronger separation.

---

## 52. Dedicated Deployment Agent

A deployment agent may have:

- Production network access
- Deployment credentials
- kubectl
- Cloud CLI
- Terraform
- Ansible

Therefore it should be strongly protected.

---

## 53. Least Privilege for Agents

A runner should have only the permissions it needs.

Example:

Build Runner
    |
    +---- Read Repository
    +---- Build
    +---- Test

It should not automatically have:

Production Administrator Access

unless required.

---

## 54. Deployment Runner Permissions

A production runner might need:

Deploy Permission

but not necessarily:

Full Cloud Account Administrator

permissions.

Use scoped identities and roles.

---

## 55. Runner Network Access

A runner may need access to:

- Git repository
- Artifact repository
- Container registry
- Cloud
- Kubernetes
- Servers
- Databases
- Security tools

Network access should be explicitly controlled.

---

## 56. Network Architecture

Example:

GitHub
   |
   v
Runner
   |
   +---- Nexus
   +---- Artifactory
   +---- Kubernetes
   +---- AWS

The runner becomes a bridge between the CI/CD platform and internal infrastructure.

Therefore its network permissions should be carefully designed.

---

## 57. Runner Internet Access

A build runner may need internet access to download dependencies.

Example:

Build Runner
   |
   +---- Internet

But production deployment runners may have more restricted network access.

Possible model:

Build Runner
   |
   +---- Internet

Deployment Runner
   |
   +---- Internal Network

---

## 58. Artifact Repository Access

A Maven build may require:

- Maven Central
- Nexus
- Artifactory

Example:

Runner
   |
   v
Maven
   |
   v
Nexus

The runner needs the appropriate credentials if the repository is private.

---

## 59. Container Registry Access

A Docker build might do:

    docker build .
    docker push <image>

Flow:

docker build
     |
     v
docker push
     |
     v
Container Registry

The runner needs permission to push images.

---

## 60. Cloud Access from Runner

A deployment runner may need cloud access.

Example:

Runner
   |
   v
AWS
   |
   +---- EKS
   +---- EC2
   +---- S3
   +---- IAM

Prefer short-lived or federated credentials where possible rather than storing long-lived access keys.

---

## 61. Kubernetes Access from Runner

A Kubernetes deployment job may use:

    kubectl apply -f deployment.yaml

The runner needs appropriate Kubernetes permissions.

Example:

Runner
   |
   v
Kubernetes API
   |
   v
Deployment

Do not give the runner unrestricted cluster-admin access unless absolutely necessary.

---

# Credentials and Secrets

## 62. Runner Credentials

Credentials may include:

- Cloud credentials
- Repository credentials
- Registry credentials
- SSH keys
- API tokens
- Kubernetes credentials

They should be protected using appropriate secret-management mechanisms.

---

## 63. Do Not Store Secrets on Runner Disk

Avoid unnecessary permanent files such as:

    /home/runner/password.txt

or:

    /tmp/production-token

Prefer:

Secret Store
    |
    v
Job

---

## 64. Runner Cleanup

After a job, consider:

- Workspace
- Temporary files
- Credentials
- Build output
- Logs

For ephemeral runners:

Job
 |
 v
Runner Destroyed

This naturally reduces persistent state.

---

# Runner Resource Management

## 65. Runner Disk Management

Large builds can consume significant disk space.

Monitor:

    df -h

and:

    du -sh *

Possible symptoms of disk exhaustion:

- Build failure
- Docker build failure
- Maven failure
- No space left on device

---

## 66. Runner CPU and Memory

Monitor:

    top

or:

    free -h

High resource usage can cause:

- Slow builds
- Out of memory errors
- Timeouts
- System instability

---

## 67. Runner Connectivity

If a runner cannot connect to the CI/CD platform:

Runner
   |
   X
CI/CD Platform

Check:

- DNS
- Network
- Firewall
- Proxy
- TLS
- Authentication
- Runner service

---

# Troubleshooting

## 68. GitHub Runner Troubleshooting

If a GitHub self-hosted runner is offline, check:

1. Machine is running
2. Runner service is running
3. Network connectivity
4. DNS
5. Firewall
6. Proxy
7. Runner registration
8. Repository or organization access
9. Runner labels
10. Runner logs

---

## 69. Jenkins Agent Troubleshooting

If a Jenkins agent is offline, check:

1. Agent machine
2. Jenkins connectivity
3. Java version
4. Agent service/process
5. SSH connectivity
6. Credentials
7. Network
8. Firewall
9. Disk
10. Workspace

---

## 70. Bamboo Agent Troubleshooting

Check:

1. Agent availability
2. Bamboo connectivity
3. Agent capabilities
4. Java/runtime requirements
5. Network
6. Credentials
7. Disk
8. CPU
9. Memory
10. Build logs

---

## 71. Agent Capability

A CI/CD system may need to know what tools an agent supports.

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
    MSBuild
    PowerShell

Jobs should be scheduled to agents with the required capabilities.

---

## 72. Jenkins Agent Capabilities

Jenkins labels can help represent capabilities.

Example:

    linux
    docker
    maven

Then:

    agent {
        label 'docker'
    }

The job is scheduled on a matching agent.

---

## 73. Bamboo Agent Capabilities

Bamboo can use agent capabilities to determine whether an agent is suitable for a task.

Conceptually:

Job Requirement
      |
      v
Agent Capability
      |
      v
Matching Agent

---

## 74. Runner Queue Management

If jobs remain queued:

Job
 |
 v
Queue
 |
 X
No Matching Runner

Possible causes:

- No runner available
- Wrong label
- Runner offline
- Insufficient capacity
- Runner busy
- Required capability missing

---

## 75. Wrong Label Problem

Example:

    runs-on: [self-hosted, terraform]

but no runner has:

    terraform

Then:

Job
 |
 v
No Matching Runner
 |
 v
Queued

Check runner labels.

---

## 76. Runner Version

Keep runner/agent software reasonably current and compatible with the CI/CD platform.

Old runner software can cause:

- Connection problems
- Unsupported features
- Security issues
- Unexpected failures

Use the platform's supported upgrade process.

---

## 77. Runner OS Updates

Self-hosted runners require operating-system maintenance.

Maintain:

- OS patches
- Security updates
- Runtime versions
- Docker
- Git
- Java
- Python
- Terraform
- Ansible

Do not treat the runner as a disposable machine unless it is actually ephemeral.

---

# Runner as Infrastructure

## 78. Runner Configuration as Code

Where practical, automate runner provisioning.

Example:

Terraform
   |
   v
Create VM
   |
   v
Install Runner
   |
   v
Configure Tools
   |
   v
Register Runner

This improves repeatability.

---

## 79. Immutable Runner Images

A more mature approach is to create standard runner images.

Example:

Base Image
   |
   +---- Git
   +---- Java
   +---- Maven
   +---- Docker
   +---- Terraform
   |
   v
Runner Image

New runners can then be created consistently.

---

## 80. Runner Configuration Management

Tools such as Ansible can configure runners.

Example:

VM
 |
 v
Ansible
 |
 +---- Install Git
 +---- Install Java
 +---- Install Maven
 +---- Install Docker
 +---- Configure Runner

This avoids manually configuring every machine.

---

## 81. Runner Monitoring

Monitor:

- Runner availability
- CPU
- Memory
- Disk
- Queue time
- Job duration
- Failure rate
- Network
- Agent health

Example:

Runner
 |
 +---- Online
 +---- CPU
 +---- Memory
 +---- Disk
 +---- Jobs

---

## 82. Runner Metrics

Useful CI metrics include:

- Queue time
- Build duration
- Runner utilization
- Job success rate
- Job failure rate
- Runner availability

For example:

Average Queue Time = 10 minutes

may indicate insufficient runner capacity.

---

## 83. Runner Scaling Strategy

A scalable architecture might be:

Small Load
   |
   v
2 Runners

High Load
   |
   v
10 Runners

Peak Load
   |
   v
20 Runners

Autoscaling can make this dynamic.

---

## 84. Runner Pools

Organizations may create separate runner pools.

Example:

CI Runner Pool
 |
 +---- Linux
 +---- Windows

Deployment Runner Pool
 |
 +---- DEV
 +---- PROD

Specialized Runner Pool
 |
 +---- GPU
 +---- Security

This provides better workload isolation.

---

## 85. Runner Pools by Environment

Another model:

- DEV Pool
- QA Pool
- UAT Pool
- PROD Pool

This can provide strong network and credential separation.

---

## 86. Runner Isolation by Environment

A useful enterprise pattern is:

DEV Runners
    |
    +---- DEV Access

QA Runners
    |
    +---- QA Access

UAT Runners
    |
    +---- UAT Access

PROD Runners
    |
    +---- PROD Access

This reduces accidental cross-environment access.

---

## 87. Production Runner Security

Production runners should generally have stronger controls:

- Restricted network
- Restricted users
- Minimal tools
- Least privilege
- Strong monitoring
- Limited repository access
- Protected secrets
- Ephemeral execution where practical

---

## 88. Runner and Approval

A runner executes the deployment after required approval.

Example:

Pipeline
   |
   v
Production Approval
   |
   v
Production Runner
   |
   v
Deploy

The runner should not bypass the approval process.

---

## 89. Runner and Environments

Example:

    jobs:

      deploy:

        environment: production

        runs-on: [self-hosted, production]

        steps:

          - name: Deploy
            run: ./deploy.sh

Conceptually:

Production Environment
        |
        v
Production Runner
        |
        v
Deployment

---

## 90. Runner and Secrets

Environment-specific secrets should be restricted.

Example:

DEV Runner
   |
   +---- DEV Secrets

PROD Runner
   |
   +---- PROD Secrets

Avoid giving a development runner access to production credentials.

---

## 91. Runner and Deployment Strategy

A deployment runner can implement:

- Rolling
- Blue-Green
- Canary
- Recreate

Example:

Production Runner
       |
       v
Canary Deployment
       |
       v
Monitor
       |
       v
Full Deployment

---

## 92. Runner and Rollback

The same or a dedicated runner can perform rollback.

Production Failure
       |
       v
Rollback Workflow
       |
       v
Production Runner
       |
       v
Previous Version

Rollback permissions should be carefully controlled.

---

# Enterprise CI/CD Architecture

## 93. Runner and CI/CD Architecture

A complete enterprise architecture might look like:

GitHub
   |
   v
GitHub Actions
   |
   +-------------------+
   |                   |
   v                   v
CI Runners        Security Runners
   |                   |
   v                   v
Build/Test            Scans
   |
   v
Artifact
   |
   v
Nexus / Artifactory
   |
   v
UAT
   |
   v
Approval
   |
   v
Production Runner
   |
   v
Production

The architecture separates general CI execution from sensitive deployment requirements.

---

## 94. Runner Selection Best Practices

Choose runners based on:

- Operating system
- Tools
- Network
- Security
- Workload
- Resource requirements
- Environment
- Compliance

Do not select a runner only because it is available.

---

## 95. Hosted vs Self-Hosted Runner

| Feature | Hosted | Self-Hosted |
|---|---|---|
| Maintenance | Platform-managed | Organization-managed |
| Customization | Limited | High |
| Private Network Access | Limited / depends on setup | Strong |
| Tool Control | Moderate | High |
| Infrastructure Management | Low | High |
| Security Responsibility | Shared with platform | More responsibility |
| Scaling | Often easier | Must design |
| Cost | Usage-based depending on platform | Infrastructure + maintenance |

---

## 96. When to Use Hosted Runners

Use hosted runners when:

- Standard build
- Public/accessible dependencies
- No special hardware
- No private network requirement
- Minimal infrastructure management desired

Example:

- Maven build
- Unit tests
- Static analysis

---

## 97. When to Use Self-Hosted Runners

Use self-hosted runners when:

- Private network access is required
- Custom software is required
- Special hardware is required
- Internal systems must be accessed
- Custom security controls are required
- Large persistent build requirements exist

---

## 98. Hosted + Self-Hosted Hybrid Model

An organization can use both.

Example:

GitHub Actions
      |
      +---- Hosted Runner
      |       |
      |       +---- Build
      |       +---- Unit Test
      |
      +---- Self-Hosted Runner
              |
              +---- Internal Deployment

This can provide flexibility.

---

## 99. Hybrid CI/CD Architecture

GitHub
   |
   v
GitHub Actions
   |
   +---------+---------+
   |                   |
   v                   v
Hosted Runner    Self-Hosted Runner
   |                   |
   v                   v
CI Build          Internal Systems
   |                   |
   +---------+---------+
             |
             v
          Artifact
             |
             v
           Deploy

---

# Security Best Practices

## 100. Runner Security Boundary

Think of a runner as a:

Code Execution Boundary

Any job executing on the runner may potentially access:

- Environment variables
- Files
- Network
- Tools
- Credentials available to the job

Therefore runner design is an important part of CI/CD security.

---

## 101. Common Runner Security Mistakes

### Mistake 1: Sharing Production Runner with Untrusted Builds

Bad:

Pull Request
     |
     v
Production Runner

Better:

Pull Request
     |
     v
Isolated CI Runner

### Mistake 2: Storing Permanent Secrets

Avoid unnecessary long-lived credentials on runner machines.

### Mistake 3: Excessive Permissions

Do not give every runner:

- Administrator
- Cluster Admin
- Cloud Admin

permissions.

### Mistake 4: Persistent Workspace

Old files can leak between jobs.

Use cleanup or ephemeral execution where appropriate.

### Mistake 5: No Patching

Self-hosted runners must be maintained.

---

## 102. Runner Troubleshooting Checklist

    [ ] Runner online
    [ ] Correct labels
    [ ] Required tools installed
    [ ] Correct tool versions
    [ ] CPU available
    [ ] Memory available
    [ ] Disk available
    [ ] Network available
    [ ] DNS working
    [ ] Firewall correct
    [ ] Credentials valid
    [ ] Workspace clean
    [ ] Runner service running
    [ ] CI/CD platform reachable
    [ ] Job permissions correct

---

## 103. Job Stuck in Queue

If a job is queued:

Check:
    |
    +---- Runner Online?
    |
    +---- Correct Label?
    |
    +---- Runner Busy?
    |
    +---- Required Capability?
    |
    +---- Runner Pool Available?

---

## 104. Job Starts but Fails Immediately

Check:

- Tool installation
- Environment variables
- Permissions
- Workspace
- Shell
- Operating system
- Dependencies

Example:

    mvn: command not found

This means Maven is not available in the runner environment or is not in PATH.

---

## 105. Docker Build Fails on Runner

Check:

- Docker installed
- Docker daemon running
- User permissions
- Disk space
- Network
- Registry credentials

Useful commands:

    docker version

    docker info

---

## 106. Terraform Job Fails

Check:

- Terraform version
- Cloud credentials
- Network
- Backend access
- Provider download
- State access
- Permissions

Useful command:

    terraform version

---

## 107. Maven Job Fails

Check:

- Java
- Maven
- JAVA_HOME
- Maven settings
- Nexus
- Network
- Dependencies

Useful commands:

    java -version

    mvn -version

---

## 108. Ansible Job Fails

Check:

- Ansible version
- SSH connectivity
- Inventory
- Credentials
- Target server
- Python on target
- Network

Useful command:

    ansible --version

---

## 109. Runner Environment Variables

A runner may expose environment variables.

Example:

    echo "$JAVA_HOME"

Avoid printing secrets.

Bad:

    echo "$PASSWORD"

Never expose sensitive values in logs.

---

## 110. Runner Workspace and Artifacts

A typical job may look like:

Workspace
 |
 +---- Source
 +---- target/
 +---- Test Results
 +---- Reports
 +---- Artifact

The CI/CD platform may upload selected files as artifacts.

---

## 111. Runner and Caching

Caching can speed up builds.

Example:

Runner
 |
 +---- Maven Cache
 +---- npm Cache
 +---- Docker Layers

Caching can reduce:

- Download time
- Build time
- Network traffic

But caches should not be treated as the source of truth.

---

## 112. Runner Cache Risks

A shared cache can create security or correctness concerns.

Consider:

Job A
  |
  v
Cache
  |
  v
Job B

Do not allow untrusted jobs to access sensitive cached data.

---

## 113. Runner and Artifact

Artifacts are different from caches.

Cache:

Used to speed up future builds.

Artifact:

Build output that may be consumed by later stages.

Cache:
  |
  v
Performance Optimization

Artifact:
  |
  v
Release / Deployment

---

## 114. Runner and Build Once, Deploy Many

Example:

Runner
   |
   v
Build
   |
   v
Artifact
   |
   v
Nexus
   |
   +---- DEV
   +---- QA
   +---- UAT
   +---- PROD

Different deployment jobs can retrieve the same artifact.

---

## 115. Runner and Pipeline Stages

Different stages may use different runners.

Build
 |
 +---- Build Runner

Security
 |
 +---- Security Runner

Deploy
 |
 +---- Production Runner

This provides workload and security separation.

---

# Governance and Lifecycle

## 116. Runner and CI/CD Governance

Runner management should include:

- Ownership
- Patching
- Access control
- Monitoring
- Capacity planning
- Security
- Lifecycle management
- Documentation

---

## 117. Runner Lifecycle Management

A mature organization should define:

Provision
   |
   v
Register
   |
   v
Configure
   |
   v
Monitor
   |
   v
Patch
   |
   v
Upgrade
   |
   v
Retire

---

## 118. Runner Documentation

Document:

- Runner name
- Operating system
- Purpose
- Labels
- Network
- Installed tools
- Owner
- Environment
- Security level
- Maintenance process

Example:

runner-prod-01

Purpose:
Production deployment

OS:
Linux

Labels:
self-hosted, linux, production

Access:
Production Kubernetes

Owner:
DevOps

---

## 119. Runner Naming

Use meaningful names.

Examples:

- ci-linux-01
- ci-linux-02
- deploy-dev-01
- deploy-prod-01
- terraform-runner-01
- security-runner-01

Avoid ambiguous names such as:

- server1
- machine2
- test

---

## 120. Runner Pools by Function

A mature setup might have:

CI Pool
 |
 +---- Build
 +---- Unit Test

Security Pool
 |
 +---- SAST
 +---- SCA
 +---- Container Scan

Deployment Pool
 |
 +---- DEV
 +---- QA
 +---- PROD

---

## 121. Runner and Disaster Recovery

For critical CI/CD systems, consider what happens if a runner fails.

Example:

Runner 1
   |
   X
Failure
   |
   v
Runner 2
   |
   v
Job

Multiple runners provide resilience.

---

## 122. Runner High Availability

Instead of:

One Runner

use:

Runner 1
Runner 2
Runner 3

for important workloads.

This reduces dependency on a single machine.

---

## 123. Runner Backup

For persistent runners, determine what needs backup.

Usually the runner itself should be reproducible rather than treated like a unique server.

Prefer:

Infrastructure as Code
+
Configuration Management
+
Runner Registration

over relying on a manual backup of one machine.

---

## 124. Runner as Code

A mature approach is:

Terraform
   |
   v
VM
   |
   v
Ansible
   |
   v
Runner

This allows the environment to be recreated.

---

## 125. Example Terraform Concept

Conceptually:

Terraform
   |
   +---- Create VM
   +---- Security Group
   +---- Network

Then:

Ansible
   |
   +---- Install Tools
   +---- Install Runner
   +---- Configure Runner

This creates a repeatable runner environment.

---

# Practical Enterprise Example

## 126. Example CI/CD Architecture

A practical architecture can be:

GitHub
   |
   v
GitHub Actions
   |
   +-------------------+
   |                   |
   v                   v
Hosted Runner     Self-Hosted Runner
   |                   |
   v                   v
CI Build          Internal Deployment
   |                   |
   v                   v
Test/Scan         Kubernetes/AWS
   |
   v
Nexus / Artifactory

This separates general CI execution from internal deployment requirements.

---

## 127. Recommended Runner Strategy

For a typical enterprise setup:

Pull Request
     |
     v
Hosted / Isolated CI Runner
     |
     +---- Build
     +---- Test
     +---- Scan
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
Protected Deployment Runner
     |
     v
Production

This is a strong security and operational model.

---

# Best Practices

## 128. Runner Best Practices

Follow these practices:

1. Use hosted runners when standard execution is sufficient.
2. Use self-hosted runners when private infrastructure or custom requirements demand them.
3. Use labels to target appropriate runners.
4. Separate CI and production deployment runners.
5. Use least-privilege credentials.
6. Prefer ephemeral runners for untrusted workloads where practical.
7. Keep self-hosted runners patched.
8. Monitor CPU, memory, disk, and availability.
9. Clean workspaces appropriately.
10. Avoid storing permanent secrets on runners.
11. Use infrastructure as code to provision runners.
12. Keep runner software updated.
13. Use dedicated runners for sensitive environments.
14. Avoid running untrusted PR code on privileged production runners.
15. Use multiple runners for availability.
16. Monitor queue time and capacity.
17. Document runner capabilities.
18. Restrict network access.
19. Use environment-specific access controls.
20. Treat runners as security boundaries.

---

# Interview Questions

## 129. What is a runner?

A runner is the execution environment where a CI/CD job runs.

---

## 130. What is a Jenkins agent?

A Jenkins agent is a machine or execution environment used by Jenkins to execute pipeline tasks.

---

## 131. What is the difference between Jenkins controller and agent?

Controller:
    Orchestrates / schedules

Agent:
    Executes

---

## 132. What is a GitHub Actions runner?

A machine or execution environment that executes GitHub Actions workflow jobs.

---

## 133. What is the difference between GitHub-hosted and self-hosted runners?

GitHub-hosted:
    Managed by GitHub

Self-hosted:
    Managed by organization

---

## 134. Why would you use a self-hosted runner?

Common reasons:

- Private network access
- Custom tools
- Special hardware
- Custom security requirements
- Internal infrastructure

---

## 135. What are runner labels?

Labels identify runner capabilities and help route jobs to appropriate runners.

---

## 136. What happens if no runner matches the job?

The job may remain queued until a suitable runner becomes available.

---

## 137. Why are ephemeral runners useful?

They provide stronger isolation and reduce persistent state between jobs.

---

## 138. Why should production runners be protected?

Because they may have:

- Production network access
- Production credentials
- Deployment permissions

---

## 139. What is the difference between a runner and a container?

Runner:
    Executes CI job

Container:
    Provides isolated execution environment

A runner can execute a containerized build.

---

## 140. Can Kubernetes be used for CI runners?

Yes. Kubernetes can dynamically provide pods as execution environments.

---

## 141. Why are runner labels important?

They ensure a job runs on a machine with the required operating system, tools, network access, or capabilities.

---

## 142. What should you check if a runner is offline?

Check:

- Machine
- Network
- DNS
- Firewall
- Runner service
- Authentication
- CI/CD connectivity
- Logs

---

## 143. Why should you avoid giving a runner cluster-admin or cloud-admin permissions?

Because compromise of the runner could then lead to compromise of the entire environment.

---

# Key Takeaway

A runner or agent is where the CI/CD work actually happens.

The basic architecture is:

Git
 |
 v
CI/CD Platform
 |
 v
Runner / Agent
 |
 +---- Checkout
 +---- Build
 +---- Test
 +---- Scan
 +---- Package
 +---- Deploy

The major concepts are:

Hosted Runner
    → Managed by CI/CD provider

Self-Hosted Runner
    → Managed by organization

Static Runner
    → Long-lived machine

Ephemeral Runner
    → Created for a job and removed afterward

Runner Label
    → Determines job compatibility

Runner Pool
    → Group of runners for a workload

Agent
    → CI/CD execution machine

Controller
    → Orchestrates jobs

For enterprise CI/CD:

                    GitHub
                       |
                       v
                 CI/CD Platform
                       |
             +---------+---------+
             |                   |
             v                   v
        CI Runner          Deployment Runner
             |                   |
             v                   v
        Build/Test          DEV / QA / PROD
             |                   |
             v                   v
          Artifact           Infrastructure
             |
             v
       Nexus / Artifactory

The most important security principle is:

Runner
   |
   v
Least Privilege
   |
   v
Minimum Required Access

The most important operational principle is:

Treat runners and agents as part of your CI/CD infrastructure and security boundary.

Give them only the tools, network access, credentials, and permissions they actually need.
