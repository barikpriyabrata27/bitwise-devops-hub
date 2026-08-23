# Environments

## 1. What is an Environment?

An environment is a specific runtime or deployment target where an application is built, tested, validated, or operated.

Common environments include:

```text
DEV
QA
UAT
STAGING
PROD
```

A typical promotion flow is:

```text
Developer
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
 STAGING
    |
    v
 Approval
    |
    v
   PROD
```

Not every organization uses all of these environments.

---

# 2. Why Do We Need Multiple Environments?

Multiple environments allow teams to validate software before exposing it to production users.

For example:

```text
Development
    |
    v
Testing
    |
    v
User Acceptance
    |
    v
Production
```

Each environment can have a different purpose.

```text
DEV
    → Development

QA
    → Functional / Integration Testing

UAT
    → Business Validation

STAGING
    → Production-like Validation

PROD
    → Real Users
```

---

# 3. Common Environment Types

## DEV

Used primarily by developers.

Typical activities:

```text
Development
Debugging
Initial Testing
Integration
```

---

## QA

Used by testing teams.

Typical activities:

```text
Functional Testing
Integration Testing
Regression Testing
Automation Testing
```

---

## UAT

UAT means:

```text
User Acceptance Testing
```

This environment is used to validate whether the application meets business requirements.

---

## STAGING

Staging is generally designed to closely resemble production.

It can be used for:

```text
Final Validation
Release Verification
Production-like Testing
Deployment Verification
```

---

## PROD

Production is the live environment used by real users or business processes.

Production changes should normally have stronger controls.

---

# 4. Environment Promotion

Promotion means moving a tested artifact or release from one environment to another.

Example:

```text
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
PROD
```

A key principle is:

> Promote the same validated artifact instead of rebuilding it for every environment.

---

# 5. Build Once, Deploy Many

A recommended CI/CD model is:

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
     |
     +---- DEV
     |
     +---- QA
     |
     +---- UAT
     |
     +---- PROD
```

For example:

```text
payment-service-1.2.0.jar
```

should ideally be the same artifact promoted through the environments.

For containerized applications:

```text
payment-service:1.2.0
```

can be promoted through environments.

---

# 6. Why Rebuilding for Each Environment Is Risky

Consider:

```text
Build for DEV
    |
    v
DEV Artifact

Build again for QA
    |
    v
QA Artifact

Build again for PROD
    |
    v
PROD Artifact
```

The artifacts may differ.

This makes it harder to guarantee that the exact artifact tested in QA is the one deployed to production.

Better:

```text
Single Build
     |
     v
Single Artifact
     |
     +---- DEV
     +---- QA
     +---- UAT
     +---- PROD
```

---

# 7. Environment-Specific Configuration

The application may use different configuration in different environments.

Example:

```text
DEV
    API_URL=https://dev.example.com

QA
    API_URL=https://qa.example.com

UAT
    API_URL=https://uat.example.com

PROD
    API_URL=https://api.example.com
```

The application artifact can remain the same while configuration changes by environment.

---

# 8. Configuration vs Application Artifact

A useful model is:

```text
Application Artifact
        |
        +---- Same Artifact
        |
        v
Environment Configuration
        |
        +---- DEV
        +---- QA
        +---- UAT
        +---- PROD
```

For example:

```text
payment-service-1.2.0.jar
```

can be deployed to multiple environments with different configuration.

---

# 9. Environment Variables

Environment variables can provide environment-specific configuration.

Example:

```text
APP_ENV=dev
```

DEV:

```text
APP_ENV=dev
API_URL=https://dev.example.com
```

QA:

```text
APP_ENV=qa
API_URL=https://qa.example.com
```

PROD:

```text
APP_ENV=prod
API_URL=https://api.example.com
```

---

# 10. Environment-Specific Secrets

Different environments should generally use different credentials.

Example:

```text
DEV
 |
 +---- DEV_API_TOKEN
 +---- DEV_DB_PASSWORD

QA
 |
 +---- QA_API_TOKEN
 +---- QA_DB_PASSWORD

PROD
 |
 +---- PROD_API_TOKEN
 +---- PROD_DB_PASSWORD
```

This provides environment isolation.

---

# 11. Why Production Credentials Should Be Isolated

Avoid:

```text
DEV
 |
 +---- Production Credentials
```

Instead:

```text
DEV
 |
 +---- DEV Credentials

PROD
 |
 +---- PROD Credentials
```

If a development environment is compromised, production credentials should not automatically be exposed.

---

# 12. Environment Isolation

A mature architecture attempts to isolate environments.

For example:

```text
DEV Infrastructure
      |
      X
      |
QA Infrastructure
      |
      X
      |
PROD Infrastructure
```

Isolation can exist at different levels:

```text
Network
Credentials
Cloud Accounts
Namespaces
Databases
Servers
Clusters
Permissions
```

The exact architecture depends on organizational requirements.

---

# 13. Separate Cloud Accounts

Some organizations use separate cloud accounts or subscriptions for environments.

Example:

```text
Cloud Organization
       |
       +---- DEV Account
       |
       +---- QA Account
       |
       +---- UAT Account
       |
       +---- PROD Account
```

Benefits can include:

- Stronger isolation
- Separate permissions
- Reduced blast radius
- Easier cost tracking
- Better security boundaries

---

# 14. Separate Kubernetes Namespaces

An organization may also separate environments using namespaces.

Example:

```text
Kubernetes Cluster
       |
       +---- dev
       |
       +---- qa
       |
       +---- uat
       |
       +---- prod
```

Depending on the security requirements, separate clusters may provide stronger isolation than namespaces alone.

---

# 15. Environment Promotion Flow

A typical pipeline may look like:

```text
Pull Request
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
Scan
     |
     v
Package
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
Approval
     |
     v
PROD
```

---

# 16. DEV Environment

DEV is usually the earliest deployment environment.

Typical flow:

```text
Developer
    |
    v
Feature Branch
    |
    v
CI
    |
    v
Build
    |
    v
DEV
```

The purpose is rapid feedback.

---

# 17. QA Environment

QA provides a controlled environment for testing.

Flow:

```text
Build
  |
  v
DEV
  |
  v
QA
  |
  +---- Functional Testing
  +---- Integration Testing
  +---- Regression Testing
```

---

# 18. UAT Environment

UAT validates business requirements.

Flow:

```text
QA
 |
 v
UAT
 |
 +---- Business Validation
 +---- User Acceptance
```

The application should normally be sufficiently stable before reaching UAT.

---

# 19. Staging Environment

Staging is often designed to resemble production.

Example:

```text
STAGING
    |
    +---- Similar Application Version
    +---- Similar Infrastructure
    +---- Similar Configuration
    +---- Similar Deployment Process
```

The goal is to discover release issues before production.

---

# 20. Production Environment

Production is the live environment.

Typical requirements include stronger:

```text
Access Control
Monitoring
Logging
Approval
Security
Backup
Rollback
Change Management
```

Production deployment should be carefully controlled.

---

# 21. GitHub Actions Environments

GitHub Actions supports environments.

Example:

```yaml
jobs:

  deploy:

    environment: production

    runs-on: ubuntu-latest

    steps:

      - name: Deploy
        run: ./deploy.sh
```

The `production` environment can have environment-specific configuration and protection rules.

---

# 22. Environment Variables in GitHub Actions

Example:

```yaml
jobs:

  deploy:

    environment: production

    runs-on: ubuntu-latest

    steps:

      - name: Deploy
        env:
          API_URL: ${{ vars.API_URL }}
        run: ./deploy.sh
```

The variable can be configured for the selected environment.

---

# 23. Environment Secrets in GitHub Actions

Example:

```yaml
jobs:

  deploy:

    environment: production

    runs-on: ubuntu-latest

    steps:

      - name: Deploy
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}
        run: ./deploy.sh
```

The environment can provide its own secret value.

---

# 24. GitHub Actions Environment Protection

A production environment can have protection rules.

Conceptually:

```text
Deployment Job
      |
      v
Production Environment
      |
      v
Approval / Protection
      |
      v
Production Deployment
```

This prevents an unrestricted automated deployment from immediately changing production.

---

# 25. Environment Approvals

Approvals are often used before production deployment.

Example:

```text
CI
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
UAT
 |
 v
Approval
 |
 v
PROD
```

Approval mechanisms depend on the CI/CD platform and organizational configuration.

---

# 26. Environment Promotion vs Deployment

These terms are related but not identical.

### Deployment

Installing or running an application version in an environment.

```text
Artifact
   |
   v
DEV
```

### Promotion

Approving or moving an already validated version to another environment.

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

---

# 27. Release Promotion

Example:

```text
Application Version: 1.2.0

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

The same version is promoted.

This gives traceability.

---

# 28. Artifact Traceability

A mature CI/CD system should allow us to answer:

```text
Which Git commit produced this artifact?
Which pipeline built it?
Which version is running in QA?
Which version is running in PROD?
Who approved the production deployment?
```

Example:

```text
Git Commit
    |
    v
Pipeline Run
    |
    v
Artifact 1.2.0
    |
    +---- DEV
    +---- QA
    +---- UAT
    +---- PROD
```

---

# 29. Environment Promotion with Nexus

For Maven applications:

```text
Git
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
 +---- DEV
 +---- QA
 +---- UAT
 +---- PROD
```

Nexus or another artifact repository can maintain versioned artifacts.

---

# 30. Environment Promotion with Docker

For containerized applications:

```text
Git
 |
 v
Docker Build
 |
 v
Image
 |
 v
Container Registry
 |
 +---- DEV
 +---- QA
 +---- UAT
 +---- PROD
```

Example:

```text
payment-service:1.2.0
```

The same image can be promoted.

---

# 31. Environment Configuration in Kubernetes

A Kubernetes deployment can use environment-specific configuration.

Conceptually:

```text
Application
     |
     +---- ConfigMap
     |
     +---- Secret
     |
     v
Pod
```

For example:

```text
DEV Namespace
    |
    +---- DEV ConfigMap
    +---- DEV Secret

PROD Namespace
    |
    +---- PROD ConfigMap
    +---- PROD Secret
```

---

# 32. Environment Configuration with Terraform

Terraform can manage infrastructure for different environments.

Example:

```text
Terraform
    |
    +---- DEV
    |
    +---- QA
    |
    +---- PROD
```

Possible approaches include:

```text
Separate State
Separate Variables
Separate Workspaces
Separate Accounts
Separate Modules
```

The exact strategy should be selected based on the organization's infrastructure design.

---

# 33. Environment Configuration with Ansible

Ansible can use different variables for different environments.

Conceptually:

```text
Ansible
   |
   +---- DEV Variables
   |
   +---- QA Variables
   |
   +---- PROD Variables
```

For example:

```text
DEV
    app_port=8080

PROD
    app_port=8080
```

The application configuration may differ even if the deployment process is the same.

---

# 34. Environment Naming

Use clear and consistent environment names.

Common examples:

```text
dev
qa
uat
staging
prod
```

Avoid inconsistent names such as:

```text
development
dev1
test-new
qa-final
prod-new
```

unless there is a specific organizational reason.

---

# 35. Environment Naming Convention

A possible standard:

```text
DEV
QA
UAT
STG
PROD
```

or:

```text
dev
qa
uat
staging
prod
```

The important point is consistency.

---

# 36. Environment Variables Naming

Use predictable names.

Example:

```text
APP_ENV
APP_NAME
APP_VERSION
API_URL
DB_HOST
DB_NAME
LOG_LEVEL
```

Environment-specific values can then be supplied separately.

---

# 37. Environment-Specific Database

Applications commonly use separate databases.

Example:

```text
DEV
 |
 +---- DEV Database

QA
 |
 +---- QA Database

UAT
 |
 +---- UAT Database

PROD
 |
 +---- PROD Database
```

Production data should not normally be exposed to lower environments without appropriate controls.

---

# 38. Production Data Protection

Avoid using production data directly in development or test environments without appropriate:

```text
Authorization
Masking
Anonymization
Privacy Controls
Security Controls
```

Environment separation should protect both infrastructure and data.

---

# 39. Environment Access Control

Different teams may have different access.

Example:

```text
DEV
 |
 +---- Developers
 +---- DevOps

QA
 |
 +---- QA
 +---- DevOps

PROD
 |
 +---- Limited Operations
 +---- DevOps
 +---- Approved Personnel
```

Access should follow least privilege.

---

# 40. Production Access

Production should generally have stricter access controls.

A common model:

```text
Developer
    |
    X
Direct Production Access

Developer
    |
    v
Pull Request
    |
    v
CI/CD
    |
    v
Approval
    |
    v
Production
```

This improves auditability and reduces direct manual changes.

---

# 41. Environment Drift

Environment drift occurs when environments become different over time.

Example:

```text
DEV
    Java 17

QA
    Java 17

PROD
    Java 11
```

This can cause:

```text
Works in DEV
     |
     v
Fails in PROD
```

---

# 42. Preventing Environment Drift

Use automation and infrastructure as code.

Examples:

```text
Terraform
Ansible
Kubernetes
CI/CD
Configuration Management
```

Conceptually:

```text
Infrastructure as Code
        |
        v
Consistent Environment
```

---

# 43. Environment Parity

Environment parity means keeping environments sufficiently similar where practical.

Example:

```text
DEV
 |
 +---- Java 17
 +---- PostgreSQL 15

QA
 |
 +---- Java 17
 +---- PostgreSQL 15

PROD
 |
 +---- Java 17
 +---- PostgreSQL 15
```

This reduces environment-specific failures.

Perfect parity is not always practical, but important differences should be intentional and documented.

---

# 44. Production-Like Staging

Staging should ideally resemble production.

Example:

```text
STAGING
   |
   +---- Same Application Version
   +---- Similar Infrastructure
   +---- Similar Network
   +---- Similar Deployment Process
```

This provides a final validation opportunity.

---

# 45. Environment Lifecycle

An environment can move through:

```text
Provision
   |
   v
Configure
   |
   v
Deploy
   |
   v
Test
   |
   v
Monitor
   |
   v
Update
   |
   v
Retire
```

Infrastructure automation can help manage this lifecycle.

---

# 46. Ephemeral Environments

Some organizations create temporary environments for pull requests or feature branches.

Example:

```text
Pull Request #123
       |
       v
Temporary Environment
       |
       v
Testing
       |
       v
Environment Destroyed
```

This is known as an ephemeral environment.

It can reduce interference between development efforts.

---

# 47. Preview Environments

A preview environment provides a temporary deployment for reviewing changes.

Example:

```text
Feature Branch
      |
      v
Pull Request
      |
      v
Preview Environment
      |
      v
Review
```

After the pull request is closed:

```text
Preview Environment
      |
      v
Destroy
```

---

# 48. Environment Lifecycle Automation

A pipeline can automate:

```text
Create
   |
   v
Deploy
   |
   v
Test
   |
   v
Destroy
```

This is particularly useful for temporary environments.

---

# 49. Environment Promotion Rules

Organizations may define rules such as:

```text
DEV
 |
 +---- Automatic

QA
 |
 +---- Automatic after CI

UAT
 |
 +---- Testing / Business Validation

PROD
 |
 +---- Approval Required
```

The exact rules depend on release policy.

---

# 50. Automatic vs Manual Promotion

### Automatic

```text
Build
 |
 v
DEV
 |
 v
QA
```

Useful when fast feedback is desired.

### Manual

```text
UAT
 |
 v
Approval
 |
 v
PROD
```

Useful when stronger release control is required.

---

# 51. Environment Gates

An environment gate is a control that must be satisfied before deployment proceeds.

Examples:

```text
Approval
Successful Tests
Security Scan
Change Window
Required Review
```

Conceptually:

```text
Deployment
    |
    v
Environment Gate
    |
    +---- PASS → Continue
    |
    +---- FAIL → Stop
```

---

# 52. Environment and Change Management

Production deployments may be associated with change-management processes.

Example:

```text
Release
   |
   v
Change Request
   |
   v
Approval
   |
   v
Production Deployment
```

The exact process depends on organizational policy.

---

# 53. Environment Monitoring

Each environment should have appropriate monitoring.

Examples:

```text
Application Logs
Metrics
Health Checks
Alerts
Performance Monitoring
Infrastructure Monitoring
```

Production normally requires the strongest monitoring and alerting.

---

# 54. Environment Health Checks

Before promotion, a pipeline may validate application health.

Example:

```text
Deploy DEV
    |
    v
Health Check
    |
    +---- PASS → Continue
    |
    +---- FAIL → Stop
```

Example command:

```bash
curl -f https://dev.example.com/health
```

---

# 55. Smoke Testing

Smoke tests are quick checks to confirm that the deployment is functioning at a basic level.

Example:

```text
Deploy
  |
  v
Application Starts
  |
  v
Health Endpoint
  |
  v
Basic API Test
```

If smoke testing fails:

```text
Deployment
    |
    X
Smoke Test Failed
    |
    v
Stop / Rollback
```

---

# 56. Environment Validation

Before promotion, validate:

```text
Application Health
Configuration
Dependencies
Database Connectivity
API Connectivity
Security Checks
Smoke Tests
```

---

# 57. Environment and Rollback

Each environment should have a rollback strategy.

Example:

```text
Deploy Version 1.2.0
       |
       v
Health Check
       |
       X
Failure
       |
       v
Rollback
       |
       v
Version 1.1.0
```

Rollback mechanisms depend on the deployment technology.

---

# 58. Environment and Deployment Strategy

Different environments can use different deployment strategies.

Example:

```text
DEV
    → Rolling Deployment

QA
    → Rolling Deployment

UAT
    → Blue/Green

PROD
    → Blue/Green / Canary
```

The strategy should match risk and business requirements.

---

# 59. Environment and Secrets

A secure model is:

```text
DEV
 |
 +---- DEV Secrets

QA
 |
 +---- QA Secrets

UAT
 |
 +---- UAT Secrets

PROD
 |
 +---- PROD Secrets
```

Never assume that the same credential should be reused across all environments.

---

# 60. Environment and Variables

Similarly:

```text
DEV
 |
 +---- API_URL
 +---- LOG_LEVEL
 +---- FEATURE_FLAG

PROD
 |
 +---- API_URL
 +---- LOG_LEVEL
 +---- FEATURE_FLAG
```

Values can differ while the variable names remain consistent.

---

# 61. Environment and Feature Flags

Feature flags can control functionality by environment.

Example:

```text
DEV
    NEW_FEATURE=true

QA
    NEW_FEATURE=true

PROD
    NEW_FEATURE=false
```

This allows teams to test a feature before enabling it for production users.

Feature flags should still be managed carefully to avoid configuration complexity.

---

# 62. Environment Promotion Example

Suppose version:

```text
payment-service:2.0.0
```

is created.

Promotion:

```text
Build
 |
 v
payment-service:2.0.0
 |
 v
DEV
 |
 +---- Smoke Test ✓
 |
 v
QA
 |
 +---- Regression Test ✓
 |
 v
UAT
 |
 +---- Business Approval ✓
 |
 v
PROD
```

The same image is promoted.

---

# 63. End-to-End Environment Flow

```text
                    Git
                     |
                     v
               Pull Request
                     |
                     v
                    CI
                     |
        +------------+------------+
        |            |            |
        v            v            v
      Build         Test         Scan
        |            |            |
        +------------+------------+
                     |
                     v
                  Package
                     |
                     v
               Artifact/Image
                     |
                     v
               Artifact Registry
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

# 64. Recommended Environment Strategy

A practical enterprise model is:

```text
DEV
 |
 +---- Rapid Development
 +---- Automatic Deployment

QA
 |
 +---- Automated Testing
 +---- Integration Testing

UAT
 |
 +---- Business Validation
 +---- Release Validation

STAGING
 |
 +---- Production-like Testing

PROD
 |
 +---- Controlled Deployment
 +---- Approval
 +---- Monitoring
 +---- Rollback
```

Not every project needs every environment.

---

# 65. Best Practices

Follow these practices:

1. Define clear purposes for each environment.
2. Use consistent environment naming.
3. Keep environments sufficiently similar where practical.
4. Use infrastructure as code.
5. Separate environment-specific configuration.
6. Separate environment-specific secrets.
7. Never use production credentials in lower environments unnecessarily.
8. Promote the same artifact between environments.
9. Avoid rebuilding artifacts for every environment.
10. Protect production deployments.
11. Use approvals where required.
12. Monitor environment health.
13. Automate deployments.
14. Automate rollback where practical.
15. Track which version is deployed in each environment.
16. Prevent configuration drift.
17. Use least-privilege access.
18. Protect production data.
19. Use smoke tests after deployment.
20. Document environment dependencies.

---

# 66. Common Mistakes

## Mistake 1: Different artifacts per environment

Bad:

```text
DEV Build
QA Build
PROD Build
```

Better:

```text
Single Build
     |
     v
Single Artifact
     |
     +---- DEV
     +---- QA
     +---- UAT
     +---- PROD
```

---

## Mistake 2: Shared production credentials

Bad:

```text
DEV
 |
 +---- PROD Credential
```

Better:

```text
DEV
 |
 +---- DEV Credential

PROD
 |
 +---- PROD Credential
```

---

## Mistake 3: Manual configuration drift

Bad:

```text
DEV → Manually configured
QA → Manually configured
PROD → Manually configured
```

Better:

```text
Infrastructure as Code
       |
       v
Consistent Configuration
```

---

## Mistake 4: Direct production changes

Bad:

```text
Developer
   |
   v
Production Server
```

Better:

```text
Developer
   |
   v
Git
   |
   v
CI/CD
   |
   v
Approval
   |
   v
Production
```

---

## Mistake 5: No health validation

Bad:

```text
Deploy
  |
  v
Next Environment
```

Better:

```text
Deploy
  |
  v
Health Check
  |
  v
Smoke Test
  |
  v
Next Environment
```

---

# 67. Troubleshooting Environment Problems

When an application works in DEV but fails in PROD, compare:

```text
Application Version
Java / Runtime Version
Configuration
Environment Variables
Secrets
Database
Network
DNS
Firewall
Dependencies
Infrastructure
Permissions
External Services
```

A useful approach is:

```text
DEV
 |
 v
Compare
 |
 v
QA
 |
 v
Compare
 |
 v
PROD
```

Look for intentional and unintentional differences.

---

# 68. Interview Questions

## What is an environment in CI/CD?

An environment is a specific deployment/runtime target used for development, testing, validation, staging, or production.

---

## Why do we need multiple environments?

To validate software progressively before exposing it to production users.

---

## What are common environments?

```text
DEV
QA
UAT
STAGING
PROD
```

---

## What is UAT?

UAT stands for:

```text
User Acceptance Testing
```

It is used to validate that the application meets business requirements.

---

## What is staging?

Staging is typically a production-like environment used for final validation before production.

---

## What is environment promotion?

Promotion means moving an already validated application version or artifact from one environment to another.

---

## What does "Build Once, Deploy Many" mean?

Build the application once and promote the same artifact through multiple environments.

```text
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

---

## Why should we avoid rebuilding for every environment?

Because rebuilding can produce different artifacts, making it harder to guarantee that the artifact tested in QA is the same one deployed to production.

---

## How are environment-specific configurations managed?

Using mechanisms such as:

```text
Environment Variables
Configuration Files
ConfigMaps
Secret Stores
CI/CD Environment Variables
```

---

## Why should production credentials be isolated?

To reduce the impact of a compromise in development or testing environments.

---

## What is environment drift?

Environment drift occurs when environments become unintentionally different in software versions, configuration, infrastructure, or dependencies.

---

## How can environment drift be reduced?

Use:

```text
Infrastructure as Code
Configuration Management
Automated Deployment
Version Control
Standardized Environments
```

---

## What is an ephemeral environment?

A temporary environment created for a specific purpose, such as a pull request or feature branch, and destroyed after use.

---

## What is a preview environment?

A temporary deployment that allows developers or reviewers to test a change before it is merged or released.

---

## How can GitHub Actions use environments?

A job can specify:

```yaml
environment: production
```

The environment can provide environment-specific configuration and protection rules.

---

## How do you protect production deployment?

Use mechanisms such as:

```text
Protected Environment
Required Approval
Protected Branch
Least-Privilege Credentials
Deployment Rules
```

---

## How do you know which version is running in production?

Use artifact/version traceability:

```text
Git Commit
    |
    v
Pipeline
    |
    v
Artifact / Image
    |
    v
Production
```

---

# 69. Key Takeaway

Environments provide controlled stages through which software progresses from development to production.

The fundamental model is:

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
STAGING
 |
 v
PROD
```

A mature CI/CD pipeline should:

```text
Build Once
    |
    v
Create Versioned Artifact
    |
    v
Store Artifact
    |
    v
Deploy DEV
    |
    v
Validate
    |
    v
Promote QA
    |
    v
Validate
    |
    v
Promote UAT
    |
    v
Approval
    |
    v
Promote PROD
```

Environment configuration should be separated from the application artifact:

```text
Same Artifact
     |
     +---- DEV Configuration
     |
     +---- QA Configuration
     |
     +---- UAT Configuration
     |
     +---- PROD Configuration
```

Secrets should also be isolated:

```text
DEV Secrets
QA Secrets
UAT Secrets
PROD Secrets
```

The most important principles are:

```text
Environment Isolation
        |
        v
Configuration Separation
        |
        v
Secret Separation
        |
        v
Build Once
        |
        v
Promote Same Artifact
        |
        v
Automated Validation
        |
        v
Controlled Production
```

> **An environment is not just a server or namespace. It is a controlled deployment context with its own infrastructure, configuration, access, secrets, validation and operational rules.**
