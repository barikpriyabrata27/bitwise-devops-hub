# Approvals

## 1. What is an Approval in CI/CD?

An approval is a control that requires a person or authorized group to review and approve a pipeline operation before it continues.

Approvals are commonly used before sensitive activities such as:

- Production deployment
- Infrastructure changes
- Database changes
- Security-sensitive operations
- Major releases

A typical flow is:

```text
Build
  |
  v
Test
  |
  v
Scan
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

The approval acts as a **gate** between stages.

---

# 2. Why Do We Need Approvals?

Automation is useful, but some changes have a high business or operational impact.

For example:

```text
Developer
    |
    v
Git Push
    |
    v
CI/CD
    |
    v
Production
```

Allowing every change to reach production automatically may not be appropriate for every organization.

A controlled model can be:

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
Testing
    |
    v
UAT
    |
    v
Approval
    |
    v
Production
```

Approval provides an additional control before a high-impact operation.

---

# 3. Approval as a Gate

An approval can be viewed as a gate:

```text
Pipeline
   |
   v
Approval Gate
   |
   +---- Approved ----> Continue
   |
   +---- Rejected ----> Stop
```

The pipeline should not proceed until the required approval condition is satisfied.

---

# 4. Typical Production Approval Flow

A common enterprise flow is:

```text
Pull Request
      |
      v
Code Review
      |
      v
CI
      |
      +---- Build
      +---- Test
      +---- Scan
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
Production Approval
      |
      v
PROD
```

---

# 5. Automatic vs Manual Deployment

There are two common approaches.

## Automatic Deployment

```text
Build
  |
  v
Test
  |
  v
Deploy
```

The pipeline proceeds automatically when all required checks pass.

## Manual Approval

```text
Build
  |
  v
Test
  |
  v
Approval
  |
  v
Deploy
```

A person must approve before deployment proceeds.

---

# 6. Where Should Approvals Be Used?

Approvals are commonly used before:

```text
Production Deployment
Infrastructure Changes
Database Changes
Major Releases
Security-Sensitive Operations
```

They are less commonly required for every development build because excessive approvals can slow down development.

---

# 7. Example Environment Promotion

```text
DEV
 |
 | Automatic
 v
QA
 |
 | Automatic / Controlled
 v
UAT
 |
 | Manual Approval
 v
PROD
```

A common enterprise approach is:

```text
Lower Environments
    |
    +---- More Automation
    |
    v
Production
    |
    +---- Stronger Controls
```

---

# 8. Approval Responsibility

The person approving a deployment should have the appropriate authority.

Depending on the organization, approval may come from:

```text
Application Owner
Release Manager
Product Owner
QA Lead
Operations Team
DevOps Team
Change Manager
Business Owner
```

The exact responsibility depends on organizational policy.

---

# 9. Separation of Duties

A useful security principle is **Separation of Duties**.

The person who creates a change should not necessarily be the only person who can approve and deploy that same change.

Example:

```text
Developer
    |
    v
Creates Change
    |
    v
Pull Request
    |
    v
Reviewer
    |
    v
Approval
    |
    v
Production
```

This reduces the risk of unauthorized changes.

---

# 10. Approval and Pull Requests

Pull requests provide an early review point.

Example:

```text
Feature Branch
      |
      v
Pull Request
      |
      +---- Code Review
      +---- CI
      +---- Tests
      +---- Security Checks
      |
      v
Merge
```

Production approval is a separate control.

```text
Pull Request Approval
        |
        v
Code Can Be Merged

Production Approval
        |
        v
Code Can Be Deployed
```

These two approvals serve different purposes.

---

# 11. Code Review vs Deployment Approval

### Code Review

Focuses on:

```text
Code Quality
Design
Functionality
Security
Maintainability
```

### Deployment Approval

Focuses on:

```text
Release Readiness
Business Impact
Environment
Change Window
Operational Risk
```

They should not automatically be treated as the same control.

---

# 12. Approval and UAT

UAT can provide business validation.

Typical flow:

```text
QA
 |
 v
UAT
 |
 +---- Business Validation
 |
 v
Approval
 |
 v
PROD
```

The approval can confirm that the release is ready for production.

---

# 13. Approval and Change Management

Some organizations require an approved change request before production deployment.

Example:

```text
Release
   |
   v
Change Request
   |
   v
Review
   |
   v
Approval
   |
   v
Production Deployment
```

The CI/CD pipeline can be integrated with organizational change-management processes where appropriate.

---

# 14. Approval and Change Windows

Production deployments may be restricted to approved time windows.

Example:

```text
Release Ready
     |
     v
Approval
     |
     v
Change Window
     |
     v
Production Deployment
```

This can reduce operational risk for critical systems.

---

# 15. GitHub Actions Environments

GitHub Actions supports deployment environments.

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

The `production` environment can be configured with protection rules.

---

# 16. Protected GitHub Environment

A production environment can be configured with controls such as:

```text
Required Reviewers
Deployment Branch Rules
Environment Secrets
Environment Variables
```

Conceptually:

```text
Deployment Job
      |
      v
Production Environment
      |
      v
Protection Rules
      |
      v
Approval
      |
      v
Deployment
```

---

# 17. GitHub Actions Required Reviewers

A production environment can require designated reviewers before a deployment job proceeds.

Conceptually:

```text
Pipeline
   |
   v
Production Environment
   |
   v
Required Reviewer
   |
   +---- Approve
   |       |
   |       v
   |    Deploy
   |
   +---- Reject
           |
           v
         Stop
```

The exact configuration should follow the GitHub environment settings used by the repository.

---

# 18. Environment-Specific Approval

Different environments can have different controls.

Example:

```text
DEV
 |
 +---- No Approval

QA
 |
 +---- No Approval

UAT
 |
 +---- QA / Business Validation

PROD
 |
 +---- Required Approval
```

This balances automation with risk control.

---

# 19. Approval with `workflow_dispatch`

A workflow can also be started manually.

Example:

```yaml
on:
  workflow_dispatch:
```

This is useful for manually initiated operations such as:

```text
Deployment
Rollback
Maintenance
Infrastructure Operation
```

Manual triggering is not the same as an approval gate.

For example:

```text
Manual Trigger
    |
    v
Workflow Starts
```

whereas:

```text
Workflow
    |
    v
Approval Gate
    |
    v
Continue
```

---

# 20. Manual Deployment vs Approval

These concepts are different.

### Manual Deployment

Someone starts the workflow manually.

```text
User
 |
 v
Start Workflow
 |
 v
Deploy
```

### Approval

The workflow is already running but waits for an authorized person to approve a protected action.

```text
Pipeline
 |
 v
Approval
 |
 +---- Approved
 |
 v
Deploy
```

A system can use both.

---

# 21. Multi-Level Approvals

Some organizations require more than one approval.

Example:

```text
UAT
 |
 v
QA Approval
 |
 v
Business Approval
 |
 v
Operations Approval
 |
 v
PROD
```

The exact number of approvals should be based on risk and organizational policy.

---

# 22. Approval Workflow

A multi-stage process may look like:

```text
Release Candidate
       |
       v
QA Validation
       |
       v
Business Validation
       |
       v
Change Approval
       |
       v
Production
```

Each gate addresses a different concern.

---

# 23. Approval Rejection

An approver may reject a deployment.

Flow:

```text
Pipeline
    |
    v
Approval
    |
    X
Rejected
    |
    v
Pipeline Stops
```

Possible next steps:

```text
Fix Issue
Reschedule
Create New Release
Cancel Release
Rollback Previous Change
```

---

# 24. Approval Timeout

Depending on the CI/CD platform and implementation, an approval may have a time limit or become invalid when the deployment context changes.

Conceptually:

```text
Waiting for Approval
       |
       v
Timeout
       |
       v
Deployment Does Not Proceed
```

This prevents old approval decisions from remaining valid indefinitely.

---

# 25. Approval Audit Trail

Production approvals should ideally be auditable.

Useful information includes:

```text
Who approved?
When?
What version?
What environment?
What change?
Which pipeline run?
Which Git commit?
```

Example:

```text
Commit
  |
  v
Pipeline Run
  |
  v
Artifact 1.2.0
  |
  v
Production Approval
  |
  +---- Approved by: Authorized Reviewer
  +---- Date/Time: Recorded
  |
  v
Production
```

---

# 26. Approval and Traceability

A mature CI/CD system should allow the organization to trace:

```text
Git Commit
    |
    v
Pull Request
    |
    v
CI Pipeline
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
```

This helps with troubleshooting, auditing, and compliance.

---

# 27. Approval and Artifact Version

Approval should apply to a specific release or artifact where possible.

Example:

```text
Version 1.2.0
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

If a new artifact is created:

```text
Version 1.2.1
```

the previous approval should not automatically be assumed to apply to the new version.

---

# 28. Approval and Build Once, Deploy Many

A strong model is:

```text
Build
 |
 v
Artifact 1.2.0
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

The approved artifact is the same artifact that was tested.

---

# 29. Avoid Approving an Unstable Artifact

A production approval should normally happen after appropriate validation.

Avoid:

```text
Build
 |
 v
Approval
 |
 v
Test
 |
 v
Production
```

Prefer:

```text
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
```

---

# 30. Approval and Security Scans

Security checks should generally happen before production approval.

Example:

```text
Build
 |
 v
Unit Test
 |
 v
Security Scan
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

If a critical security issue is found:

```text
Security Scan
      |
      X
Critical Finding
      |
      v
Deployment Blocked
```

---

# 31. Approval and Quality Gates

A quality gate can automatically determine whether a pipeline is eligible for promotion.

Example:

```text
Build
 |
 v
Tests
 |
 v
Quality Gate
 |
 +---- Pass → Continue
 |
 +---- Fail → Stop
```

Approval is different:

```text
Approval Gate
 |
 +---- Human decision
```

A mature pipeline may use both.

---

# 32. Automated Gate vs Human Approval

### Automated Gate

Examples:

```text
Unit Tests
Security Scan
Code Quality
Vulnerability Threshold
Health Check
```

### Human Gate

Examples:

```text
Business Approval
Release Approval
Change Approval
Production Approval
```

Together:

```text
Automated Validation
        |
        v
Human Approval
        |
        v
Production
```

---

# 33. Approval and Deployment Strategies

Different deployment strategies may require different approval models.

For example:

```text
Blue/Green
    |
    +---- Approval before switch

Canary
    |
    +---- Approval before increasing traffic

Rolling
    |
    +---- Automated health checks
```

Approval should be placed at the point where it provides meaningful risk control.

---

# 34. Approval Before Infrastructure Changes

Infrastructure changes can also require approval.

Example:

```text
Terraform Plan
      |
      v
Review
      |
      v
Approval
      |
      v
Terraform Apply
```

This is useful for high-risk production infrastructure changes.

---

# 35. Terraform Approval Flow

A common production workflow:

```text
terraform fmt
      |
      v
terraform validate
      |
      v
terraform plan
      |
      v
Review Plan
      |
      v
Approval
      |
      v
terraform apply
```

The exact controls depend on the organization's infrastructure governance.

---

# 36. Approval Before Database Changes

Database changes can have significant impact.

Example:

```text
Migration
   |
   v
Validation
   |
   v
Approval
   |
   v
Production Database
```

Migration tools such as Liquibase can be integrated into controlled deployment pipelines.

---

# 37. Approval and Rollback

An approval should not eliminate the need for rollback planning.

Before production deployment:

```text
Release
   |
   +---- Validation
   +---- Approval
   +---- Rollback Plan
   |
   v
Production
```

A production release should have a known recovery strategy.

---

# 38. Approval and Rollback Decision

After deployment:

```text
Production
    |
    v
Health Check
    |
    +---- Healthy → Continue
    |
    +---- Unhealthy
              |
              v
           Rollback
```

Rollback can be automated or manually authorized depending on the system.

---

# 39. Who Should Approve?

The appropriate approver depends on the organization's governance.

Possible roles:

```text
Application Owner
Release Manager
Product Owner
QA Lead
Operations Lead
DevOps Lead
Change Manager
Business Owner
```

The approval responsibility should be explicitly defined.

---

# 40. Avoid Single-Person Dependency

For critical systems, avoid relying on only one person to approve every production deployment.

Consider:

```text
Primary Approver
      |
      +---- Backup Approver
```

This reduces deployment delays caused by absence or unavailability.

---

# 41. Approval and On-Call Operations

For critical production systems, the operations or on-call team may need to be aware of releases.

Example:

```text
Release
   |
   v
Approval
   |
   v
On-Call Awareness
   |
   v
Production
```

This helps ensure someone is available to respond if the deployment causes issues.

---

# 42. Approval During Business Hours

Some organizations restrict production changes to defined windows.

Example:

```text
Approved Change
      |
      v
Maintenance Window
      |
      v
Production Deployment
```

Emergency procedures may use a separate process.

---

# 43. Emergency Changes

Some organizations support emergency production changes.

A simplified process may be:

```text
Production Incident
      |
      v
Emergency Change
      |
      v
Emergency Approval
      |
      v
Deployment
      |
      v
Post-Change Review
```

The exact process depends on organizational policy.

---

# 44. Approval and Compliance

Approvals can help organizations demonstrate that production changes were reviewed and authorized.

Audit information can include:

```text
Release Version
Git Commit
Pipeline Run
Approver
Timestamp
Environment
Deployment Result
```

This is especially useful in regulated environments.

---

# 45. Approval and Change History

Because pipeline configuration is stored in Git, we can also track changes to the pipeline itself.

Example:

```text
Pipeline YAML Change
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

Then:

```text
Application Release
       |
       v
Production Approval
```

This creates two useful audit trails:

```text
Pipeline Configuration History
Application Release History
```

---

# 46. Approval Notifications

Approvers may need notifications.

Examples:

```text
Email
Slack
Microsoft Teams
CI/CD Platform Notification
Incident Management System
```

Conceptually:

```text
Pipeline
   |
   v
Approval Required
   |
   v
Notification
   |
   v
Approver
   |
   v
Approve / Reject
```

Notifications should provide enough context for a decision.

---

# 47. What Should an Approver Check?

Before approving production deployment, an approver may verify:

```text
Application Version
Git Commit
Test Results
Security Scan
UAT Result
Change Request
Deployment Window
Known Issues
Rollback Plan
Business Readiness
```

The exact checklist depends on organizational policy.

---

# 48. Example Approval Checklist

```text
Production Approval Checklist

[ ] Correct application version
[ ] Correct artifact/image
[ ] CI passed
[ ] Tests passed
[ ] Security scans passed
[ ] UAT completed
[ ] Change request approved
[ ] Deployment window confirmed
[ ] Monitoring available
[ ] Rollback plan available
[ ] Required stakeholders informed
```

---

# 49. Approval Does Not Mean Testing Is Complete

Approval should not replace automated validation.

Bad:

```text
Build
 |
 v
Human Approval
 |
 v
Production
```

Better:

```text
Build
 |
 v
Automated Tests
 |
 v
Security Scan
 |
 v
UAT
 |
 v
Human Approval
 |
 v
Production
```

Automation catches technical issues.

Human approval addresses release readiness and business risk.

---

# 50. Approval Gate Example

A complete production gate:

```text
                Production Candidate
                         |
                         v
                    Unit Tests
                         |
                         v
                    Integration
                         |
                         v
                    Security Scan
                         |
                         v
                        UAT
                         |
                         v
                  Approval Gate
                         |
                +--------+--------+
                |                 |
                v                 v
             Approved          Rejected
                |                 |
                v                 v
              PROD              Stop
```

---

# 51. GitHub Actions Example

A simple production deployment workflow:

```yaml
name: Production Deployment

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
        run: ./deploy.sh
```

The `production` environment can be configured with the appropriate protection rules.

---

# 52. GitHub Actions Approval Concept

Conceptually:

```text
Manual / Automated Trigger
          |
          v
       Deploy Job
          |
          v
     Production Environment
          |
          v
    Required Reviewer
          |
     +----+----+
     |         |
     v         v
  Approve    Reject
     |         |
     v         v
  Deploy     Stop
```

The exact UI and configuration depend on GitHub's environment settings.

---

# 53. Jenkins Approval Concept

Jenkins Pipeline can include an input step.

Example:

```groovy
stage('Production Approval') {

    steps {

        input message: 'Approve production deployment?'

    }
}
```

Conceptually:

```text
Pipeline
   |
   v
Approval
   |
   +---- Proceed
   |
   +---- Abort
```

Production credentials should still be protected appropriately.

---

# 54. Jenkins Production Example

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

        stage('Production Approval') {
            steps {
                input message: 'Approve production deployment?'
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

This demonstrates the concept of a human gate inside a Jenkins pipeline.

---

# 55. Bamboo Approval Concept

Bamboo can support deployment controls and environment-based deployment workflows.

A conceptual flow is:

```text
Build
 |
 v
Artifact
 |
 v
QA
 |
 v
UAT
 |
 v
Deployment Approval / Control
 |
 v
PROD
```

The exact implementation depends on Bamboo configuration and version.

---

# 56. Approval Strategy by Environment

A practical strategy may be:

```text
DEV
 |
 +---- Automatic

QA
 |
 +---- Automatic

UAT
 |
 +---- Automated + Business Validation

PROD
 |
 +---- Required Approval
```

This reduces unnecessary manual intervention while maintaining production control.

---

# 57. Approval and Continuous Delivery

Continuous Delivery does not necessarily mean every change automatically reaches production.

It means the software is kept in a releasable state.

A pipeline can therefore be:

```text
Commit
 |
 v
Build
 |
 v
Test
 |
 v
Package
 |
 v
Ready for Production
 |
 v
Approval
 |
 v
Production
```

The approval acts as the final release decision.

---

# 58. Continuous Deployment vs Continuous Delivery

### Continuous Delivery

```text
Code
 |
 v
Automated Validation
 |
 v
Production Ready
 |
 v
Approval
 |
 v
Production
```

### Continuous Deployment

```text
Code
 |
 v
Automated Validation
 |
 v
Production
```

Continuous Deployment generally removes the manual production approval when the organization's controls allow fully automated release.

---

# 59. Risk-Based Approval

Not every change needs the same level of approval.

Example:

```text
Low-Risk Change
    |
    +---- Automated Deployment

Medium-Risk Change
    |
    +---- One Approval

High-Risk Change
    |
    +---- Multiple Reviews
    +---- Change Management
    +---- Maintenance Window
```

A risk-based approach can balance speed and control.

---

# 60. Approval and Feature Flags

Feature flags can reduce release risk.

Example:

```text
Deploy Application
       |
       v
Feature Disabled
       |
       v
Production
       |
       v
Gradually Enable Feature
```

The application can be deployed before the feature is enabled for users.

---

# 61. Approval and Canary Deployment

A canary deployment may use approval between traffic stages.

Example:

```text
Deploy Version 2.0
       |
       v
5% Traffic
       |
       v
Health Check
       |
       v
Approval
       |
       v
25% Traffic
       |
       v
Health Check
       |
       v
100% Traffic
```

The exact process depends on the deployment platform.

---

# 62. Approval and Blue/Green Deployment

Blue/green deployment can also include an approval before switching traffic.

```text
Blue
 |
 +---- Current Version

Green
 |
 +---- New Version
```

Flow:

```text
Deploy Green
     |
     v
Test Green
     |
     v
Approval
     |
     v
Switch Traffic
     |
     v
Green Becomes Active
```

---

# 63. Approval and Rolling Deployment

Rolling deployments gradually replace instances.

Example:

```text
Old Version
   |
   v
Replace Instance 1
   |
   v
Health Check
   |
   v
Replace Instance 2
   |
   v
Health Check
```

Approval may happen before starting the rollout or at selected stages.

---

# 64. Approval and Rollback

A good release process should connect approval with rollback planning.

```text
Approval
   |
   v
Production Deployment
   |
   v
Health Check
   |
   +---- PASS → Continue
   |
   +---- FAIL → Rollback
```

This is especially important for high-risk releases.

---

# 65. Approval Documentation

For every important production deployment, maintain enough information to answer:

```text
What was deployed?
Why was it deployed?
Who approved it?
When was it deployed?
Which artifact was used?
Which Git commit produced it?
What environment was changed?
Was the deployment successful?
Was rollback required?
```

---

# 66. Common Approval Mistakes

## Mistake 1: Approving Without Reviewing

An approval should be meaningful.

The approver should have enough context to make an informed decision.

---

## Mistake 2: Same Person Does Everything

Avoid:

```text
Developer
   |
   +---- Writes Code
   +---- Approves
   +---- Deploys Production
```

where organizational policy requires separation of duties.

---

## Mistake 3: Approval Before Validation

Avoid:

```text
Build
 |
 v
Approval
 |
 v
Test
```

Prefer:

```text
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
```

---

## Mistake 4: Approval for Every Small Change

Too many manual gates can slow development without reducing meaningful risk.

Use approvals where they provide value.

---

## Mistake 5: Production Secrets Available During Approval

Do not unnecessarily expose production credentials to the approval or pre-production stages.

Secrets should be scoped to the job and environment that actually needs them.

---

## Mistake 6: No Audit Trail

Important approvals should be traceable.

---

# 67. Troubleshooting Approval Problems

If a deployment is stuck waiting for approval, check:

```text
1. Correct environment
2. Required reviewers
3. Reviewer permissions
4. Branch restrictions
5. Workflow status
6. Environment protection rules
7. Approval configuration
8. Deployment conditions
```

---

# 68. If Approval Is Rejected

Follow the organization's release process.

Typical flow:

```text
Rejected
   |
   +---- Investigate
   |
   +---- Fix
   |
   +---- Rebuild / Validate
   |
   +---- New Release
   |
   v
Approval Again
```

Do not simply bypass the approval without understanding why it was rejected.

---

# 69. Approval Checklist for DevOps Engineers

Before enabling production deployment:

```text
[ ] Pipeline passed
[ ] Unit tests passed
[ ] Integration tests passed
[ ] Security scans passed
[ ] Artifact version verified
[ ] UAT completed
[ ] Production environment selected
[ ] Production secrets protected
[ ] Change request completed if required
[ ] Approval configured
[ ] Monitoring available
[ ] Rollback plan available
```

---

# 70. Best Practices

Follow these principles:

1. Use approvals for high-risk operations.
2. Keep lower environments highly automated.
3. Protect production environments.
4. Use separation of duties where required.
5. Use least-privilege permissions.
6. Approve a specific version or release.
7. Validate before requesting approval.
8. Maintain an audit trail.
9. Define clear approval responsibilities.
10. Avoid unnecessary manual gates.
11. Protect production secrets.
12. Keep rollback procedures ready.
13. Notify relevant stakeholders.
14. Use change windows when required.
15. Use risk-based approval policies.
16. Automate technical validation.
17. Use human approval for business or operational decisions that require it.
18. Do not bypass failed quality or security gates simply to obtain approval.

---

# 71. Recommended Enterprise Flow

A mature production release can look like:

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
Code Review
    |
    v
CI
    |
    +---- Build
    +---- Unit Test
    +---- Code Quality
    +---- Security Scan
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
    +---- Automated Testing
    |
    v
UAT
    |
    +---- Business Validation
    |
    v
Production Approval
    |
    +---- Release Review
    +---- Change Approval
    +---- Rollback Check
    |
    v
PROD
    |
    v
Health Check
    |
    +---- Success
    |
    +---- Failure → Rollback
```

---

# 72. Key Takeaway

Approvals provide a controlled decision point in a CI/CD pipeline.

The basic model is:

```text
Automated Validation
        |
        v
Approval Gate
        |
        +---- Approved
        |       |
        |       v
        |    Production
        |
        +---- Rejected
                |
                v
              Stop
```

A good CI/CD process balances automation and control:

```text
DEV
 |
 +---- High Automation
 |
 v
QA
 |
 +---- Automated Testing
 |
 v
UAT
 |
 +---- Business Validation
 |
 v
PROD Approval
 |
 +---- Human Control
 |
 v
PROD
```

Remember:

```text
Automated Checks
    → Technical Validation

Human Approval
    → Release / Business / Operational Decision

Environment Protection
    → Prevents Unauthorized Deployment

Separation of Duties
    → Reduces Risk

Audit Trail
    → Provides Traceability

Rollback Plan
    → Provides Recovery
```

The key principle is:

> **Automate everything that can be reliably validated automatically, and introduce human approval where business, operational, security, or compliance risk requires a deliberate decision.**
