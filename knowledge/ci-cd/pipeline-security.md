# Pipeline Security

## 1. What is CI/CD Pipeline Security?

CI/CD pipeline security means protecting the entire software delivery process from source code to production.

A typical pipeline is:

Developer
   |
   v
Git Repository
   |
   v
CI Pipeline
   |
   +---- Build
   +---- Test
   +---- Security Scan
   |
   v
Artifact Repository
   |
   v
CD Pipeline
   |
   +---- Deploy
   |
   v
Production

Security must be considered at every stage.

---

## 2. Why is Pipeline Security Important?

A CI/CD pipeline has access to important resources such as:

- Source code
- Artifact repositories
- Cloud accounts
- Kubernetes clusters
- Deployment servers
- Databases
- API credentials
- Production environments

If the pipeline is compromised, an attacker may be able to compromise the application or infrastructure.

Therefore:

> CI/CD pipelines are part of the organization's security boundary.

---

## 3. Main Areas of Pipeline Security

Important areas include:

- Source code security
- Authentication
- Authorization
- Secrets management
- Dependency security
- Code scanning
- Container security
- Infrastructure security
- Artifact security
- Runner security
- Pipeline permissions
- Environment protection
- Deployment approvals
- Audit logging

---

# Source Code Security

## 4. Protect the Git Repository

The repository should have appropriate controls.

Examples:

- Branch protection
- Pull request reviews
- Required status checks
- CODEOWNERS
- Protected branches
- Limited write permissions
- Audit logs

The goal is to prevent unauthorized changes from reaching the pipeline.

---

## 5. Branch Protection

Important branches such as:

- main
- master
- release
- production

should be protected.

Example:

Developer
   |
   v
Feature Branch
   |
   v
Pull Request
   |
   +---- Review
   +---- Build
   +---- Test
   +---- Security Scan
   |
   v
main

Developers should generally not bypass the required checks.

---

## 6. Pull Request Security

A pull request should go through automated checks before merging.

Example:

Pull Request
    |
    +---- Build
    +---- Unit Test
    +---- SAST
    +---- Dependency Scan
    +---- Secret Scan
    |
    v
Approval
    |
    v
Merge

This prevents many problems before code reaches the main branch.

---

# Authentication and Authorization

## 7. Authentication

Authentication answers:

> Who are you?

Examples:

- Username/password
- SSH key
- Access token
- OAuth
- OpenID Connect
- Service account

---

## 8. Authorization

Authorization answers:

> What are you allowed to do?

Example:

Developer:
    Read repository
    Create branch
    Create PR

DevOps:
    Manage pipeline
    Manage runners

Deployment identity:
    Deploy application

Production administrator:
    Administrative access

Authentication and authorization are different concepts.

---

## 9. Least Privilege

The principle of least privilege means:

> Give an identity only the permissions required to perform its task.

Example:

A build job may need:

    Read source code
    Download dependencies
    Upload build artifact

It may not need:

    Production administrator access

---

## 10. Pipeline Permissions

Pipeline jobs should receive only the permissions they require.

Bad design:

Pipeline
   |
   +---- Full Cloud Administrator
   +---- Full Kubernetes Administrator
   +---- Full Repository Administrator

Better:

Pipeline
   |
   +---- Read Repository
   +---- Push Artifact
   +---- Deploy Application

---

# Secrets Management

## 11. What is a Secret?

A secret is sensitive information used by applications or pipelines.

Examples:

- Password
- API token
- SSH private key
- Cloud credential
- Database password
- Registry password
- Kubernetes credential

---

## 12. Never Hardcode Secrets

Bad:

    password = "MyPassword123"

Bad:

    AWS_SECRET_ACCESS_KEY=xxxxxxxx

Secrets should not be committed into Git.

---

## 13. Why Hardcoded Secrets Are Dangerous

Suppose:

Developer
   |
   v
Git Commit
   |
   v
Secret
   |
   v
Git Repository

Even if the secret is later deleted from the latest version, it may still exist in Git history.

Therefore:

> Never commit secrets into source control.

---

## 14. Use Secret Management

Secrets should be stored in secure secret-management systems.

Examples:

- GitHub Actions Secrets
- Jenkins Credentials
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Kubernetes Secrets

Conceptually:

Secret Store
     |
     v
Pipeline
     |
     v
Application / Deployment

---

## 15. Secret Injection

A pipeline can retrieve a secret when required.

Example concept:

Pipeline
   |
   v
Secret Store
   |
   v
Secret
   |
   v
Deployment

The secret should not be permanently stored on the runner.

---

## 16. Secret Rotation

Secrets should be rotated periodically.

Example:

Old Credential
      |
      v
Rotation
      |
      v
New Credential

Rotation reduces the impact of compromised credentials.

---

## 17. Short-Lived Credentials

Prefer short-lived credentials when possible.

Example:

Pipeline
   |
   v
Authenticate
   |
   v
Temporary Credential
   |
   v
Deploy
   |
   v
Credential Expires

This is safer than maintaining permanent credentials.

---

# GitHub Actions Security

## 18. GitHub Actions Permissions

GitHub Actions workflows can use the GITHUB_TOKEN.

Its permissions should be limited to what the workflow requires.

Conceptually:

    permissions:
      contents: read

Instead of giving unnecessary write permissions.

---

## 19. Read vs Write Permissions

For example:

Read:

    contents: read

Write:

    contents: write

The workflow should use the minimum required permission.

---

## 20. GitHub Actions Secrets

Secrets can be stored at different scopes depending on the GitHub configuration.

Examples:

- Repository secrets
- Organization secrets
- Environment secrets

Conceptually:

Organization
     |
     +---- Repository
              |
              +---- Environment
                       |
                       +---- Secret

---

## 21. Environment Protection

Production environments can have additional protection.

Example:

Pipeline
   |
   v
Production Environment
   |
   +---- Approval
   +---- Protected Secrets
   +---- Deployment Rules
   |
   v
Production

This prevents an uncontrolled deployment.

---

# Jenkins Security

## 22. Jenkins Credentials

Jenkins provides credential management for pipeline authentication.

Credentials may include:

- Username/password
- SSH keys
- API tokens
- Cloud credentials
- Certificates

Credentials should be stored using Jenkins' credential management rather than hardcoded in Jenkinsfiles.

---

## 23. Jenkins Credentials Example

Conceptually:

    credentials('nexus-credentials')

The pipeline references the credential instead of storing the actual password in the Jenkinsfile.

---

## 24. Jenkins Agent Security

Jenkins agents should follow least privilege.

A build agent should not automatically have production administrator access.

Example:

Build Agent
   |
   +---- Build
   +---- Test

Deployment Agent
   |
   +---- Deployment

Separating agents can reduce risk.

---

# Dependency Security

## 25. Dependency Risk

Applications depend on external libraries.

Example:

Application
   |
   +---- Spring
   +---- Jackson
   +---- Log4j
   +---- Other Libraries

A vulnerable dependency can introduce security risks.

---

## 26. Software Composition Analysis

SCA tools identify vulnerable dependencies.

Example:

Source Code
    |
    v
Dependency Scan
    |
    +---- Dependency Name
    +---- Version
    +---- Vulnerability
    +---- Severity
    |
    v
Report

Examples of SCA-related tools include:

- Dependabot
- Black Duck
- Snyk
- OWASP Dependency-Check

---

## 27. Dependency Scanning in CI

Example pipeline:

Checkout
   |
   v
Build
   |
   v
Dependency Scan
   |
   v
Test
   |
   v
Package

The pipeline can fail when a vulnerability exceeds the organization's allowed threshold.

---

# Static Application Security Testing

## 28. SAST

SAST stands for:

> Static Application Security Testing

It analyzes source code without executing the application.

Example:

Source Code
    |
    v
SAST
    |
    v
Security Findings

It can identify issues such as:

- SQL injection patterns
- Hardcoded credentials
- Unsafe coding patterns
- Security vulnerabilities

---

## 29. SAST in Pipeline

Typical flow:

Checkout
   |
   v
Build
   |
   v
SAST
   |
   v
Unit Tests
   |
   v
Package

Examples of tools include:

- SonarQube
- CodeQL
- Checkmarx
- Fortify

---

# Secret Scanning

## 30. Secret Scanning

Secret scanning detects credentials accidentally committed into source code.

Example:

    AWS Access Key
    API Token
    Private Key
    Password

Flow:

Git
 |
 v
Secret Scanner
 |
 +---- Secret Found
 |
 v
Pipeline Failure

---

## 31. Why Secret Scanning Is Important

Consider:

Developer
   |
   v
Commit
   |
   v
API Token
   |
   v
GitHub

An attacker who discovers the token may use it.

Therefore secret scanning should be part of CI/CD security.

---

# Container Security

## 32. Container Image Security

If the application is packaged into a Docker image, the image should be scanned.

Example:

Source
   |
   v
Docker Build
   |
   v
Container Image
   |
   v
Image Scan
   |
   v
Registry

---

## 33. Container Image Vulnerability Scanning

The scanner checks:

- Operating system packages
- Application dependencies
- Known vulnerabilities
- Configuration issues

Example:

Container Image
    |
    v
Scanner
    |
    +---- CVE
    +---- Package
    +---- Severity
    |
    v
Report

---

## 34. Container Image Best Practices

Use:

- Minimal base images
- Trusted base images
- Updated dependencies
- Non-root users
- Image scanning
- Signed images where appropriate
- Immutable version tags

Avoid:

    latest

for production deployments when immutable versioning is required.

Prefer:

    myapp:1.4.2

or:

    myapp:<commit-sha>

---

# Artifact Security

## 35. Artifact Repository Security

Build artifacts should be stored in controlled repositories.

Examples:

- Nexus
- Artifactory

Flow:

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

---

## 36. Artifact Integrity

The artifact deployed to production should be the same artifact that passed CI validation.

Preferred model:

Build Once
   |
   v
Artifact
   |
   +---- DEV
   +---- QA
   +---- UAT
   +---- PROD

Do not rebuild the application separately for every environment unless there is a specific reason.

---

## 37. Artifact Versioning

Artifacts should have unique versions.

Example:

    myapp-1.2.0.jar

or:

    myapp-1.2.0-build-154.jar

This makes releases traceable.

---

## 38. Artifact Promotion

A good release process is:

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

The same artifact is promoted through environments.

---

# Runner Security

## 39. Runner Security

The runner is an important security boundary.

It may have access to:

- Source code
- Secrets
- Network
- Cloud
- Kubernetes
- Artifact repositories

Therefore it must be protected.

---

## 40. Self-Hosted Runner Risks

A compromised workflow could potentially execute commands on a self-hosted runner.

Example:

Untrusted PR
     |
     v
Workflow
     |
     v
Privileged Runner
     |
     v
Production Network

This is dangerous.

Use:

- Isolated runners
- Least privilege
- Restricted network
- Ephemeral runners
- Protected environments

---

## 41. Separate CI and Deployment Runners

Recommended:

CI Runner
   |
   +---- Build
   +---- Test
   +---- Scan

Deployment Runner
   |
   +---- Deploy

Production deployment runners should have stronger security controls.

---

# Pipeline Security

## 42. Secure Pipeline Configuration

Pipeline configuration files should also be treated as code.

Examples:

- GitHub Actions YAML
- Jenkinsfile
- Bamboo Specs
- GitLab CI YAML

Changes to these files should go through code review.

---

## 43. Protect Pipeline Configuration

A malicious pipeline change could potentially execute:

    curl ...
    rm ...
    cloud CLI commands
    deployment commands

Therefore pipeline files should be protected using:

- Pull requests
- Code review
- Branch protection
- Required status checks
- CODEOWNERS

---

## 44. Do Not Trust Pipeline Input

Pipeline parameters can sometimes come from:

- Pull requests
- Branch names
- Commit messages
- User input
- Webhooks
- External systems

Never blindly execute untrusted input.

---

## 45. Command Injection

Bad example:

    run: echo $USER_INPUT

If input is not properly handled, malicious input may result in command execution.

Be careful when constructing shell commands from external input.

---

## 46. Shell Injection Prevention

Prefer controlled commands and validated parameters.

Instead of dynamically constructing arbitrary shell commands:

    command="$USER_INPUT"
    eval "$command"

use explicit logic.

Validate:

- Allowed values
- File names
- Environment names
- Versions
- Deployment targets

---

# Pull Request and Fork Security

## 47. Forked Repository Risk

A pull request from a fork may contain code controlled by an external contributor.

Example:

External Fork
     |
     v
Pull Request
     |
     v
CI Pipeline

The workflow may execute code from the pull request.

Therefore sensitive secrets should not automatically be exposed.

---

## 48. Secrets and Pull Requests

Be careful about exposing secrets to untrusted pull requests.

Bad model:

External PR
    |
    v
Workflow
    |
    +---- Production Secret
    |
    v
Privileged Runner

Better:

External PR
    |
    v
Isolated CI
    |
    +---- No Production Secrets

---

# Environment Security

## 49. Environment Separation

Separate:

- DEV
- QA
- UAT
- PROD

Example:

DEV
 |
 +---- DEV Credentials

QA
 |
 +---- QA Credentials

PROD
 |
 +---- PROD Credentials

Do not share production credentials with lower environments.

---

## 50. Production Approval

A production deployment should usually require controlled approval.

Example:

Pipeline
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
Production

---

## 51. Deployment Gates

A deployment gate can check:

- Tests passed
- Security scan passed
- Quality gate passed
- Approval received
- Artifact exists
- Required environment is available

Example:

    Build
      |
      v
    Test
      |
      v
    Security
      |
      v
    Quality Gate
      |
      v
    Approval
      |
      v
    Deploy

---

# Infrastructure Security

## 52. Infrastructure as Code Security

Infrastructure code should also be scanned.

Examples:

- Terraform
- CloudFormation
- Kubernetes YAML
- Ansible

Possible issues include:

- Public storage
- Open security groups
- Excessive IAM permissions
- Unencrypted resources
- Privileged containers

---

## 53. Terraform Security

Example:

Terraform
   |
   v
Security Scan
   |
   v
Findings

Tools may include:

- Checkov
- tfsec
- Terrascan

The exact tool depends on the organization's standards.

---

## 54. Kubernetes Security

Kubernetes manifests should be checked for:

- Privileged containers
- Running as root
- Excessive permissions
- Insecure network configuration
- Missing resource limits
- Unsafe security contexts

Flow:

Kubernetes YAML
      |
      v
Security Scan
      |
      v
Deployment

---

# IAM and Cloud Security

## 55. Cloud IAM

CI/CD pipelines often need cloud permissions.

Example:

Pipeline
   |
   v
AWS
   |
   +---- S3
   +---- EKS
   +---- EC2

Use IAM roles and policies to restrict access.

---

## 56. Avoid Long-Lived Cloud Keys

Avoid storing permanent credentials such as:

    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY

when a safer short-lived authentication method is available.

Prefer:

- IAM roles
- OIDC
- Short-lived tokens
- Workload identity

---

## 57. OIDC

OIDC stands for:

> OpenID Connect

It can allow CI/CD systems to authenticate to cloud providers without storing long-lived cloud credentials.

Conceptually:

GitHub Actions
      |
      v
OIDC Token
      |
      v
Cloud IAM
      |
      v
Temporary Credentials
      |
      v
AWS

This can significantly reduce credential-management risk.

---

# Logging and Auditing

## 58. Pipeline Logs

Pipeline logs should provide enough information to troubleshoot jobs.

But logs should not expose secrets.

Good:

    Deploying application version 1.2.4

Bad:

    Password = MySecretPassword

---

## 59. Secret Masking

CI/CD platforms should mask sensitive values in logs when supported.

Example:

Actual:

    token=abc123xyz

Log:

    token=********

Do not rely only on masking. Avoid printing secrets in the first place.

---

## 60. Audit Logs

Track important activities such as:

- Pipeline changes
- Repository changes
- Permission changes
- Credential changes
- Production deployments
- Runner registration
- Environment changes

Audit logs help determine:

Who did what and when?

---

# Security Gates

## 61. Security Gate

A security gate determines whether the pipeline can continue.

Example:

Build
 |
 v
Security Scan
 |
 +---- PASS ----> Continue
 |
 +---- FAIL ----> Stop

---

## 62. Severity Threshold

Organizations may define thresholds.

Example:

LOW
    → Continue

MEDIUM
    → Review

HIGH
    → Fail

CRITICAL
    → Fail

The exact policy depends on organizational requirements.

---

## 63. Quality Gate

Tools such as SonarQube can enforce quality gates.

Example:

Code
 |
 v
SonarQube
 |
 v
Quality Gate
 |
 +---- PASS
 |
 +---- FAIL

A failed quality gate can prevent the pipeline from continuing.

---

# Supply Chain Security

## 64. Software Supply Chain

The software supply chain includes:

Developer
   |
   v
Source Code
   |
   v
Dependencies
   |
   v
Build System
   |
   v
Artifact
   |
   v
Container
   |
   v
Deployment

Every stage can introduce risk.

---

## 65. Supply Chain Risks

Examples:

- Compromised dependency
- Malicious package
- Compromised build runner
- Modified artifact
- Compromised container image
- Stolen credentials
- Malicious pipeline change

---

## 66. Supply Chain Protection

Controls include:

- Dependency scanning
- Secret scanning
- SAST
- SCA
- Container scanning
- Artifact signing
- Protected branches
- Build isolation
- Least privilege
- Provenance
- Audit logs

---

# Artifact Signing

## 67. Artifact Signing

Artifacts can be cryptographically signed.

Conceptually:

Build
 |
 v
Artifact
 |
 v
Sign
 |
 v
Repository
 |
 v
Verify
 |
 v
Deploy

The signature helps verify that the artifact came from a trusted build process.

---

## 68. Container Image Signing

Container images can also be signed.

Example:

Build
 |
 v
Container Image
 |
 v
Sign
 |
 v
Registry
 |
 v
Verify
 |
 v
Deploy

This helps improve supply-chain integrity.

---

# Secure CI/CD Flow

## 69. Recommended Secure Pipeline

A secure pipeline can look like:

Developer
    |
    v
Feature Branch
    |
    v
Pull Request
    |
    +---- Code Review
    |
    +---- Build
    |
    +---- Unit Test
    |
    +---- SAST
    |
    +---- SCA
    |
    +---- Secret Scan
    |
    +---- Container Scan
    |
    v
Merge
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
Approval
    |
    v
PROD

---

# Security Best Practices

## 70. Pipeline Security Best Practices

1. Protect important branches.
2. Require pull requests.
3. Require code reviews.
4. Use least privilege.
5. Never hardcode secrets.
6. Use secret-management systems.
7. Rotate credentials.
8. Prefer short-lived credentials.
9. Use OIDC where appropriate.
10. Scan dependencies.
11. Scan source code.
12. Scan secrets.
13. Scan container images.
14. Scan infrastructure code.
15. Protect pipeline configuration.
16. Separate CI and production deployment runners.
17. Restrict production credentials.
18. Protect production environments.
19. Require production approval where appropriate.
20. Monitor and audit pipeline activity.
21. Keep runners patched.
22. Use ephemeral runners where practical.
23. Restrict network access.
24. Protect artifacts.
25. Use immutable artifact versions.
26. Consider artifact/image signing.
27. Never expose secrets in logs.
28. Validate external input.
29. Treat pull requests from forks carefully.
30. Review security findings before deployment.

---

# Common Security Mistakes

## 71. Hardcoded Password

Bad:

    DB_PASSWORD="password123"

Better:

    Retrieve from secret store.

---

## 72. Production Credentials in CI

Bad:

    All CI jobs
       |
       v
    Production Credentials

Better:

    Production Deployment Job
       |
       v
    Protected Production Secret

---

## 73. Excessive IAM Permissions

Bad:

    CI Pipeline
       |
       v
    AdministratorAccess

Better:

    CI Pipeline
       |
       v
    Specific IAM Role
       |
       +---- Required Actions Only

---

## 74. Untrusted PR on Production Runner

Bad:

External PR
    |
    v
Production Runner
    |
    v
Production Credentials

Better:

External PR
    |
    v
Isolated CI Runner
    |
    v
No Production Credentials

---

## 75. Rebuilding for Each Environment

Risky model:

Build
 |
 +---- Build DEV
 |
 +---- Build QA
 |
 +---- Build PROD

Better:

Build Once
 |
 v
Artifact
 |
 +---- DEV
 +---- QA
 +---- UAT
 +---- PROD

This improves consistency and traceability.

---

# Security Interview Questions

## 76. What is CI/CD pipeline security?

It is the practice of protecting source code, pipeline configuration, runners, credentials, artifacts, infrastructure, and deployment environments throughout the software delivery lifecycle.

---

## 77. What is least privilege?

Giving users, jobs, runners, and services only the permissions they need.

---

## 78. Why should secrets not be stored in Git?

Because Git history can retain the secret and unauthorized users may gain access to it.

---

## 79. How do you manage secrets in CI/CD?

Use secure secret-management mechanisms such as:

- GitHub Secrets
- Jenkins Credentials
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

---

## 80. What is SAST?

SAST stands for Static Application Security Testing.

It analyzes source code for security vulnerabilities without executing the application.

---

## 81. What is SCA?

SCA stands for Software Composition Analysis.

It analyzes third-party dependencies for known vulnerabilities and licensing information.

---

## 82. Why scan Docker images?

To identify vulnerabilities in:

- OS packages
- Application dependencies
- Libraries
- Base images

---

## 83. Why should production runners be isolated?

Because they may have access to production systems and credentials.

---

## 84. What is OIDC in CI/CD?

OIDC can allow a CI/CD platform to authenticate to cloud providers using short-lived credentials instead of storing long-lived cloud access keys.

---

## 85. What is a security gate?

A security gate determines whether the pipeline can proceed based on security or quality criteria.

Example:

Security Scan
    |
    +---- PASS → Continue
    |
    +---- FAIL → Stop

---

## 86. Why is artifact integrity important?

The artifact deployed to production should be the same trusted artifact that passed CI validation.

---

# Key Takeaway

CI/CD security is not just about scanning source code.

It covers the entire delivery chain:

Source Code
    |
    v
Pipeline
    |
    v
Runner
    |
    v
Dependencies
    |
    v
Build
    |
    v
Security Scans
    |
    v
Artifact
    |
    v
Registry
    |
    v
Deployment
    |
    v
Production

The most important principles are:

1. Least privilege
2. Secure secrets management
3. Protected source code
4. Protected pipeline configuration
5. Secure runners
6. Dependency scanning
7. SAST
8. Secret scanning
9. Container scanning
10. Infrastructure scanning
11. Protected artifacts
12. Environment separation
13. Production approval
14. Short-lived credentials
15. Continuous monitoring and auditing

A strong enterprise CI/CD security model is:

Git
 |
 v
Pull Request
 |
 +---- Review
 +---- Build
 +---- Test
 +---- SAST
 +---- SCA
 +---- Secret Scan
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
Approval
 |
 v
Protected Production Runner
 |
 v
Production

The key principle is:

Secure the pipeline itself, not only the application being built.
