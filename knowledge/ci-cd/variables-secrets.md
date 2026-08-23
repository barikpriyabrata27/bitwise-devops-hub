# Variables and Secrets

## 1. Introduction

CI/CD pipelines need configuration values and credentials to perform tasks such as:

- Selecting environments
- Setting application versions
- Configuring build tools
- Connecting to artifact repositories
- Accessing cloud platforms
- Authenticating with deployment systems
- Accessing APIs
- Connecting to external services

These values are commonly divided into:

```text
Configuration
    |
    +---- Variables
    |
    +---- Secrets
```

The key distinction is:

```text
Variable
    → Non-sensitive configuration

Secret
    → Sensitive information
```

---

# 2. What is a Pipeline Variable?

A pipeline variable is a value used to configure or control a pipeline.

Examples:

```text
APPLICATION_NAME=payment-service
ENVIRONMENT=dev
JAVA_VERSION=17
REGION=ap-south-1
```

Variables generally contain non-sensitive information.

Example:

```yaml
env:
  APP_NAME: payment-service
  ENVIRONMENT: dev
```

---

# 3. What is a Secret?

A secret is sensitive information required by a pipeline.

Examples:

```text
Password
API Token
Access Token
Private Key
Cloud Credential
SSH Key
Repository Credential
Database Password
```

Example:

```yaml
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
```

The actual secret value should not be stored directly in the workflow file.

---

# 4. Variable vs Secret

| Variable | Secret |
|---|---|
| Usually non-sensitive | Sensitive |
| Application name | Password |
| Environment name | API token |
| Region | Access key |
| Java version | Private key |
| Build configuration | Database credential |
| Can be visible | Should be protected |

Simple rule:

```text
If exposing the value would create a security problem,
treat it as a secret.
```

---

# 5. Why Variables Are Needed

Variables make pipelines reusable.

Instead of hard-coding:

```yaml
run: deploy payment-service-dev
```

we can use:

```yaml
env:
  APP_NAME: payment-service
  ENVIRONMENT: dev
```

Then:

```yaml
run: deploy "$APP_NAME" "$ENVIRONMENT"
```

The same pipeline can be adapted for different environments.

---

# 6. Why Secrets Are Needed

CI/CD pipelines often need access to protected systems.

For example:

```text
GitHub Actions
      |
      v
Cloud Account
      |
      v
AWS / Azure / GCP
```

or:

```text
GitHub Actions
      |
      v
Nexus / Artifactory
```

or:

```text
GitHub Actions
      |
      v
Production Server
```

Authentication may require:

```text
Username
Password
Token
Certificate
Private Key
```

These values should be stored securely.

---

# 7. Never Hard-Code Secrets

Do not do this:

```yaml
env:
  DB_PASSWORD: MyPassword123
```

Do not do this either:

```bash
docker login registry.example.com \
  -u admin \
  -p MyPassword123
```

Instead:

```yaml
env:
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

Secrets should be provided by the CI/CD secret-management mechanism.

---

# 8. Common Secret Types

CI/CD systems commonly manage:

```text
API Tokens
Cloud Credentials
SSH Keys
Certificates
Private Keys
Passwords
Database Credentials
Artifact Repository Credentials
Container Registry Credentials
Deployment Credentials
```

Example:

```text
Nexus Username
Nexus Password

AWS Credentials

Docker Registry Token

Production API Token
```

---

# 9. GitHub Actions Variables

GitHub Actions supports variables at different scopes.

Common scopes include:

```text
Repository
Organization
Environment
Workflow
Job
Step
```

For example:

```yaml
env:
  APP_NAME: payment-service
```

---

# 10. Workflow-Level Variables

Example:

```yaml
name: CI

on:
  push:
    branches:
      - main

env:
  APP_NAME: payment-service
  JAVA_VERSION: '17'

jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      - name: Display Configuration
        run: |
          echo "Application: $APP_NAME"
          echo "Java Version: $JAVA_VERSION"
```

The variables are available to the workflow according to their scope.

---

# 11. Job-Level Variables

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

The variable is available within that job.

---

# 12. Step-Level Variables

Example:

```yaml
steps:

  - name: Build

    env:
      BUILD_TYPE: release

    run: echo "$BUILD_TYPE"
```

The variable is scoped to that step.

---

# 13. Variable Scope

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

The narrower scope can be used when a value is required only for a particular job or step.

---

# 14. GitHub Actions Secrets

Secrets can be referenced using:

```yaml
${{ secrets.SECRET_NAME }}
```

Example:

```yaml
- name: Deploy
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
  run: ./deploy.sh
```

The workflow does not contain the actual token.

---

# 15. Repository Secrets

A repository secret is available to workflows within the appropriate repository context.

Example:

```text
Repository
    |
    +---- Secrets
            |
            +---- API_TOKEN
            +---- NEXUS_PASSWORD
            +---- CLOUD_TOKEN
```

A workflow can reference them using:

```yaml
${{ secrets.API_TOKEN }}
```

---

# 16. Organization Secrets

Organizations can define secrets that can be made available to selected repositories according to their configured access policies.

Conceptually:

```text
Organization
    |
    +---- Repository A
    |
    +---- Repository B
    |
    +---- Repository C
```

An organization-level secret can reduce duplication when the same secure configuration is legitimately shared across repositories.

Access should be restricted to only the repositories that need it.

---

# 17. Environment Secrets

Secrets can also be associated with a deployment environment.

For example:

```text
Environment: DEV
    |
    +---- DEV_API_TOKEN

Environment: QA
    |
    +---- QA_API_TOKEN

Environment: PROD
    |
    +---- PROD_API_TOKEN
```

This is useful when different environments require different credentials.

---

# 18. Environment-Specific Secrets

A common model is:

```text
DEV
 |
 +---- DEV credentials

QA
 |
 +---- QA credentials

UAT
 |
 +---- UAT credentials

PROD
 |
 +---- PROD credentials
```

The deployment job selects the appropriate environment.

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

The secret available to the production environment can differ from the one used by other environments.

---

# 19. Secret Scoping

Secrets should have the smallest practical scope.

Prefer:

```text
Production Secret
       |
       v
Production Environment
```

rather than:

```text
Production Secret
       |
       v
Every Repository
```

This follows the principle of least privilege.

---

# 20. Principle of Least Privilege

The principle is:

> Give a pipeline only the access it needs.

Example:

```text
Build Job
    |
    +---- Read source
    +---- Read dependencies

Deploy Job
    |
    +---- Deployment credentials
```

The build job should not automatically receive production deployment credentials if it does not need them.

---

# 21. Separate Build and Deployment Credentials

A secure pipeline can separate credentials.

```text
Build
 |
 +---- Read Repository
 +---- Read Nexus
 |
 v
Artifact

Deploy
 |
 +---- Deployment Credential
 |
 v
Production
```

This limits the impact if a build process is compromised.

---

# 22. Secret Rotation

Secrets should be rotated periodically and whenever compromise is suspected.

Example:

```text
Old Token
    |
    v
Rotate
    |
    v
New Token
    |
    v
Update CI/CD Secret
```

The application pipeline should continue using the secret reference rather than embedding the actual value.

---

# 23. Secret Expiration

Some credentials have expiration dates.

For example:

```text
API Token
    |
    v
Expires
    |
    v
Pipeline Authentication Failure
```

A good operational process tracks:

```text
Secret Owner
Expiration Date
Purpose
Scope
Rotation Process
```

---

# 24. Secret Masking

CI/CD platforms can mask recognized secret values in logs.

For example, instead of:

```text
API_TOKEN=abcdef123456
```

the log may display a masked value.

However:

> Secret masking should not be treated as a reason to print secrets intentionally.

Avoid commands such as:

```bash
echo "$API_TOKEN"
```

Even with masking enabled.

---

# 25. Secrets in Logs

Never intentionally print:

```text
Password
Token
Private Key
Cloud Credential
```

Bad:

```bash
echo "Password: $PASSWORD"
```

Better:

```bash
echo "Authentication configured"
```

Logs should contain useful diagnostic information without exposing sensitive data.

---

# 26. Secrets in Command Arguments

Be careful when passing secrets directly as command-line arguments.

For example:

```bash
some-command --password "$PASSWORD"
```

Depending on the environment and tooling, command arguments can sometimes be exposed through process listings or logs.

Prefer secure credential mechanisms supported by the tool.

---

# 27. Secrets in Files

Some tools require credentials through configuration files.

For example:

```text
settings.xml
credentials file
cloud configuration
SSH configuration
```

These files should:

- Be created securely during the job
- Have appropriate permissions
- Not be committed to Git
- Be deleted or cleaned up when appropriate

---

# 28. Maven Credentials

Maven may use `settings.xml` for repository credentials.

Example:

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

The actual values can come from CI/CD secrets.

Conceptually:

```text
GitHub Secret
      |
      v
Environment Variable
      |
      v
settings.xml
      |
      v
Maven
      |
      v
Nexus / Artifactory
```

---

# 29. Cloud Credentials

A pipeline may need access to a cloud provider.

For example:

```text
CI/CD
  |
  v
Cloud Authentication
  |
  v
AWS / Azure / GCP
```

Avoid hard-coding:

```text
Access Key
Secret Key
Password
```

Use secure credentials or preferably short-lived/federated authentication where supported by the platform and organization's security model.

---

# 30. OIDC and Short-Lived Credentials

Modern CI/CD systems can use identity federation such as OIDC instead of long-lived static credentials.

Conceptually:

```text
GitHub Actions
      |
      v
OIDC Identity Token
      |
      v
Cloud Identity Provider
      |
      v
Temporary Credentials
      |
      v
Cloud Resources
```

Benefits can include:

- Reduced long-lived secret storage
- Short-lived credentials
- Better control
- Reduced credential exposure

The exact configuration depends on the cloud provider.

---

# 31. Static Credentials vs Federated Authentication

### Static credential model

```text
CI/CD
  |
  v
Stored Secret
  |
  v
Cloud
```

The secret must be stored and rotated.

### Federated model

```text
CI/CD
  |
  v
Identity Token
  |
  v
Cloud Identity Provider
  |
  v
Temporary Access
```

The federated approach can reduce the need for long-lived credentials.

---

# 32. Jenkins Credentials

Jenkins provides a credentials-management mechanism.

Credentials can include:

```text
Username / Password
Secret Text
SSH Keys
Certificates
Cloud Credentials
```

A Jenkins pipeline can reference stored credentials instead of hard-coding them.

Conceptually:

```text
Jenkins
   |
   +---- Credentials Store
              |
              v
           Pipeline
              |
              v
         External System
```

---

# 33. Jenkins Credentials Example

A simplified example:

```groovy
pipeline {

    agent any

    stages {

        stage('Deploy') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'deploy-creds',
                        usernameVariable: 'DEPLOY_USER',
                        passwordVariable: 'DEPLOY_PASSWORD'
                    )
                ]) {

                    sh './deploy.sh'

                }
            }
        }
    }
}
```

The actual credential is stored in Jenkins rather than directly in the Jenkinsfile.

---

# 34. Bamboo Variables

Bamboo supports variables at different scopes.

Common concepts include:

```text
Global Variables
Plan Variables
Deployment Variables
Environment Variables
```

Sensitive values can be stored using Bamboo's secure-variable capabilities.

The exact configuration depends on the Bamboo version and deployment model.

---

# 35. Jenkins vs Bamboo vs GitHub Actions

| Concept | Jenkins | Bamboo | GitHub Actions |
|---|---|---|---|
| Pipeline config | Jenkinsfile / UI | Plans / configuration | YAML workflow |
| Credentials | Jenkins Credentials | Secure variables / credentials | Secrets |
| Variables | Environment / parameters | Variables | Variables / env |
| Environment-specific config | Pipeline/environment configuration | Deployment environments | Environments |
| Agents | Jenkins Agents | Bamboo Agents | Runners |
| Secret protection | Credentials Store | Secure Variables | Secrets |

---

# 36. Repository Variables vs Environment Variables

Repository-level configuration may apply broadly.

Environment-level configuration can be restricted to a specific deployment environment.

Example:

```text
Repository
    |
    +---- APP_NAME

DEV Environment
    |
    +---- DEV_URL
    +---- DEV_TOKEN

PROD Environment
    |
    +---- PROD_URL
    +---- PROD_TOKEN
```

This helps prevent accidental use of production credentials in development workflows.

---

# 37. Configuration Hierarchy

A useful conceptual model is:

```text
Organization
      |
      v
Repository
      |
      v
Environment
      |
      v
Workflow
      |
      v
Job
      |
      v
Step
```

Not every platform uses exactly the same hierarchy, but the principle is to keep configuration scoped appropriately.

---

# 38. Do Not Store Secrets in Git

Never commit files such as:

```text
.env
credentials.json
password.txt
private-key.pem
```

when they contain real secrets.

Instead:

```text
Secret Store
     |
     v
CI/CD Pipeline
     |
     v
Temporary Runtime Configuration
```

---

# 39. `.gitignore` and Secrets

`.gitignore` can help prevent accidental commits.

Example:

```text
.env
*.key
*.pem
credentials.json
```

However:

> `.gitignore` is not a secret-management solution.

A secret that has already been committed may remain in Git history.

---

# 40. If a Secret Is Accidentally Committed

Treat the secret as compromised.

Typical response:

```text
1. Revoke / rotate the secret
2. Create a replacement
3. Update CI/CD configuration
4. Investigate exposure
5. Remove the secret from repository history if required
6. Review logs and access
```

Do not assume that deleting the latest file version is enough.

---

# 41. Environment Configuration

A pipeline often needs different configuration for different environments.

Example:

```text
DEV
    APP_URL=https://dev.example.com

QA
    APP_URL=https://qa.example.com

PROD
    APP_URL=https://prod.example.com
```

These are configuration values, not necessarily secrets.

---

# 42. Configuration vs Secret Example

Consider:

```text
Application Name:
payment-service
```

This is normally configuration.

But:

```text
Database Password:
********
```

is sensitive.

Therefore:

```text
APP_NAME
    → Variable

DB_PASSWORD
    → Secret
```

---

# 43. Secret Naming

Use clear and consistent names.

Examples:

```text
NEXUS_USERNAME
NEXUS_PASSWORD

DOCKER_USERNAME
DOCKER_TOKEN

AWS_ROLE_ARN

API_TOKEN

DATABASE_PASSWORD
```

Avoid ambiguous names such as:

```text
KEY1
TOKEN2
PASS
```

Clear naming makes pipeline maintenance easier.

---

# 44. Environment Variable Naming

Use consistent naming conventions.

Example:

```text
APP_NAME
APP_VERSION
APP_ENV
JAVA_VERSION
AWS_REGION
NEXUS_URL
```

For secrets:

```text
NEXUS_PASSWORD
API_TOKEN
DB_PASSWORD
```

---

# 45. Secret Ownership

Important secrets should have an owner or responsible team.

For example:

```text
Secret
   |
   +---- Owner
   +---- Purpose
   +---- Scope
   +---- Expiration
   +---- Rotation Process
```

This helps with operational management.

---

# 46. Secret Rotation Process

A typical process:

```text
Identify Secret
      |
      v
Generate New Secret
      |
      v
Update Secret Store
      |
      v
Test Pipeline
      |
      v
Revoke Old Secret
      |
      v
Monitor
```

The exact order can vary depending on whether the system supports overlapping credentials.

---

# 47. Environment Isolation

Production credentials should be isolated from development.

Bad model:

```text
All Environments
       |
       v
Same Production Credential
```

Better:

```text
DEV
 |
 +---- DEV Credential

QA
 |
 +---- QA Credential

PROD
 |
 +---- PROD Credential
```

This limits the impact of a compromise.

---

# 48. Secret Access by Job

Not every job needs every secret.

Example:

```text
Build Job
   |
   +---- Maven credentials

Security Job
   |
   +---- Security service token

Deploy Job
   |
   +---- Deployment credentials
```

This is better than exposing all secrets to every job.

---

# 49. Build vs Deploy Separation

A secure pipeline can separate:

```text
Build
 |
 +---- Compile
 +---- Test
 +---- Scan
 +---- Package
 |
 v
Artifact
 |
 v
Deploy
 |
 +---- Deployment Credentials
```

The build stage should not need production credentials simply because the deploy stage does.

---

# 50. Secrets and Pull Requests

Be especially careful with secrets in pull-request workflows.

A pull request may contain code that has not yet been trusted.

Do not automatically expose powerful production secrets to untrusted code.

Conceptually:

```text
Untrusted Pull Request
        |
        X
Production Secrets
```

Instead:

```text
Pull Request
    |
    v
Build / Test
    |
    v
No Production Credentials
```

Production credentials should be available only to appropriately trusted deployment workflows.

---

# 51. Forked Pull Requests

Pull requests from forks require additional security consideration.

The workflow should not assume that code from an external fork is trusted.

A secure approach is:

```text
Fork PR
   |
   v
Limited CI
   |
   +---- Build
   +---- Test
   |
   X
Production Secrets
```

The exact behavior of secrets in forked pull-request workflows depends on the CI/CD platform and workflow configuration.

---

# 52. Secret Scanning

Organizations can use secret-scanning tools to detect accidentally committed credentials.

Conceptually:

```text
Git Commit
    |
    v
Secret Scan
    |
    +---- No Secret → Continue
    |
    +---- Secret Found → Block / Alert
```

Secret scanning should complement secure secret-management practices.

---

# 53. Pipeline Secret Flow

A secure pipeline should look like:

```text
Secret Store
      |
      v
CI/CD Platform
      |
      v
Job
      |
      v
Application / Tool
```

Not:

```text
Git Repository
      |
      v
Hard-Coded Password
      |
      v
Pipeline
```

---

# 54. Variables and Secrets in Docker

Do not bake secrets into Docker images.

Avoid:

```dockerfile
ENV DB_PASSWORD=mysecret
```

Because the secret can become part of image metadata or layers and may be exposed to anyone who can access the image.

Better:

```text
Container Image
    |
    +---- Application
    +---- Runtime
    |
    X---- No Production Secret
```

Then provide secrets at runtime through the deployment platform.

---

# 55. Variables and Secrets in Kubernetes

A typical Kubernetes model is:

```text
ConfigMap
    |
    +---- Non-sensitive configuration

Secret
    |
    +---- Sensitive configuration
```

Conceptually:

```text
Application Pod
      |
      +---- ConfigMap
      |
      +---- Secret
```

The exact security posture depends on cluster configuration and secret-management practices.

---

# 56. CI/CD → Kubernetes Secret Flow

```text
CI/CD
   |
   v
Deployment
   |
   v
Kubernetes
   |
   +---- ConfigMap
   |
   +---- Secret
   |
   v
Pod
```

The CI/CD system should not unnecessarily expose secrets during the deployment process.

---

# 57. Secrets and Artifact Repositories

A pipeline may need credentials to publish artifacts.

Example:

```text
GitHub Actions
      |
      v
Maven
      |
      v
Nexus / Artifactory
```

Credentials:

```text
NEXUS_USERNAME
NEXUS_PASSWORD
```

should be securely stored and injected into the pipeline.

---

# 58. Secrets and Container Registries

A pipeline may need credentials to push images.

Example:

```text
GitHub Actions
      |
      v
Docker Build
      |
      v
docker push
      |
      v
Container Registry
```

Use:

```text
Registry Token
```

rather than hard-coded passwords.

Where supported, use short-lived or federated authentication.

---

# 59. Example Secure Maven Pipeline

```yaml
name: Maven CI

on:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:

  build:

    runs-on: ubuntu-latest

    env:
      APP_NAME: payment-service

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
        env:
          REPO_USER: ${{ secrets.NEXUS_USERNAME }}
          REPO_PASSWORD: ${{ secrets.NEXUS_PASSWORD }}
        run: mvn clean deploy
```

The actual Maven `settings.xml` configuration would need to map those credentials to the repository server.

---

# 60. Example Secure Deployment Pipeline

```yaml
name: Deploy

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:

  deploy:

    environment: production

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: ./deploy.sh
```

The production environment can have:

```text
Protected Secrets
Required Reviewers
Deployment Rules
```

---

# 61. Common Mistakes

## Mistake 1: Hard-coding secrets

```yaml
password: mypassword
```

---

## Mistake 2: Printing secrets

```bash
echo "$TOKEN"
```

---

## Mistake 3: Storing secrets in Git

```text
credentials.json
.env
password.txt
```

---

## Mistake 4: Giving every job production credentials

```text
Build
Test
Scan
Deploy
   |
   +---- All receive PROD credentials
```

---

## Mistake 5: Reusing production credentials in DEV

```text
DEV
 |
 +---- PROD Credential
```

---

## Mistake 6: Never rotating credentials

Old credentials should not remain active indefinitely.

---

## Mistake 7: Treating `.gitignore` as secret management

`.gitignore` only helps prevent files from being committed. It does not protect secrets already exposed.

---

# 62. Troubleshooting Secret Issues

If a pipeline cannot authenticate, check:

```text
1. Secret name
2. Secret scope
3. Environment
4. Repository access
5. Permissions
6. Credential expiration
7. Token validity
8. Username/password
9. Authentication mechanism
10. External service availability
```

---

# 63. Debugging Without Exposing Secrets

Avoid:

```bash
echo "$PASSWORD"
```

Instead check whether the variable exists without displaying its value.

For example:

```bash
if [ -n "$PASSWORD" ]; then
  echo "Password is configured"
else
  echo "Password is missing"
fi
```

The goal is to troubleshoot safely.

---

# 64. Secure Pipeline Architecture

A mature pipeline can look like:

```text
                    Git
                     |
                     v
                Pull Request
                     |
                     v
                    CI
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Build       Test       Scan
          |          |          |
          +----------+----------+
                     |
                     v
                  Artifact
                     |
                     v
              Artifact Registry
                     |
                     v
                  Deploy
                     |
                     v
                Environment
                     |
              +------+------+
              |             |
              v             v
         Variables       Secrets
```

Secrets should be injected only where required.

---

# 65. Best Practices

Follow these practices:

1. Never hard-code secrets.
2. Use CI/CD secret stores.
3. Use environment-specific secrets where appropriate.
4. Follow least privilege.
5. Give secrets only to jobs that need them.
6. Rotate credentials regularly.
7. Prefer short-lived credentials where possible.
8. Use OIDC/federation where supported.
9. Never print secrets in logs.
10. Protect production environments.
11. Protect self-hosted runners.
12. Scan repositories for accidentally committed secrets.
13. Use `.gitignore` as an additional safeguard, not as a secret store.
14. Do not bake secrets into Docker images.
15. Keep secret names consistent and meaningful.
16. Track ownership and expiration.
17. Revoke compromised credentials immediately.
18. Review third-party actions before granting them access to secrets.

---

# 66. Interview Questions

## What is the difference between a variable and a secret?

A variable is normally used for non-sensitive configuration.

A secret contains sensitive information such as passwords, tokens, or private keys.

```text
Variable → Non-sensitive
Secret   → Sensitive
```

---

## Where should CI/CD secrets be stored?

They should be stored in secure credential or secret-management facilities provided by the CI/CD platform or organization.

Examples:

```text
GitHub Actions Secrets
Jenkins Credentials
Bamboo Secure Variables
Cloud Secret Managers
```

---

## Why should secrets not be stored in Git?

Because anyone with appropriate access to the repository or its history may be able to retrieve them.

---

## Is `.gitignore` enough to protect secrets?

No.

`.gitignore` helps prevent files from being accidentally committed, but it is not a secret-management mechanism.

---

## What should you do if a secret is committed to Git?

Treat it as compromised:

```text
Rotate / Revoke
      |
      v
Create New Secret
      |
      v
Update Secret Store
      |
      v
Investigate Exposure
```

Removing the file from the latest commit alone may not remove it from Git history.

---

## What is least privilege?

Give a pipeline only the permissions and credentials it actually requires.

---

## Why should build and deployment credentials be separated?

If the build process is compromised, separating deployment credentials can reduce the attacker's ability to access production.

---

## What is secret rotation?

Replacing an existing credential with a new credential and revoking the old one.

---

## What is OIDC in CI/CD?

OIDC can allow a CI/CD platform to authenticate to an external identity provider and obtain short-lived credentials without storing a long-lived cloud secret.

---

## Should secrets be stored inside Docker images?

No.

Secrets should normally be provided at runtime through an appropriate secret-management mechanism.

---

## What is the difference between repository and environment secrets?

Repository secrets can be used within the repository context.

Environment secrets are associated with a specific deployment environment and can be protected using environment controls.

---

## Why should production secrets not be available to pull-request builds?

Pull-request code may not be trusted. Exposing powerful production credentials to untrusted code increases the risk of credential theft and unauthorized access.

---

# 67. Key Takeaway

Variables and secrets are fundamental components of secure CI/CD pipelines.

Remember:

```text
Variable
    |
    +---- Non-sensitive configuration
```

```text
Secret
    |
    +---- Sensitive information
```

A secure pipeline should look like:

```text
                  CI/CD
                    |
          +---------+---------+
          |                   |
          v                   v
      Variables            Secrets
          |                   |
          v                   v
    Configuration       Authentication
          |                   |
          +---------+---------+
                    |
                    v
                  Job
                    |
                    v
               Build / Deploy
```

The most important rules are:

```text
Never hard-code secrets
        |
        v
Use secure secret stores
        |
        v
Use least privilege
        |
        v
Limit secret scope
        |
        v
Rotate credentials
        |
        v
Prefer short-lived credentials
        |
        v
Protect production
```

For a mature DevOps implementation:

```text
Git
 |
 v
CI/CD
 |
 +---- Variables
 |       |
 |       +---- Application configuration
 |
 +---- Secrets
 |       |
 |       +---- Authentication
 |
 v
Build
 |
 v
Artifact
 |
 v
Deploy
 |
 +---- DEV
 +---- QA
 +---- UAT
 +---- PROD
```

> **Variables configure the pipeline; secrets authenticate it. A secure CI/CD pipeline exposes each value only where and when it is required.**
