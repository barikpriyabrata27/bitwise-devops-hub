# Rollback

## 1. What is Rollback?

Rollback is the process of returning an application, deployment, configuration, or infrastructure to a previously known-good state after a problem occurs.

A simple example:

```text
Version 1.1.0
      |
      v
Production
      |
      v
Deploy 1.2.0
      |
      v
Problem Detected
      |
      v
Rollback
      |
      v
Version 1.1.0
```

The objective is to restore service safely and quickly.

---

# 2. Why Do We Need Rollback?

Even after testing, production deployments can fail.

Possible causes include:

```text
Application Bug
Configuration Error
Infrastructure Problem
Database Issue
Dependency Failure
Security Issue
Performance Problem
Incorrect Deployment
External Service Failure
```

A rollback provides a recovery mechanism.

```text
Deployment
    |
    v
Problem
    |
    v
Rollback
    |
    v
Known-Good Version
```

---

# 3. Rollback vs Fix Forward

There are two common approaches when a production deployment fails.

## Rollback

Return to the previous known-good version.

```text
1.1.0
  |
  v
1.2.0
  |
  X
  |
  v
Rollback
  |
  v
1.1.0
```

## Fix Forward

Fix the problem and deploy a new version.

```text
1.1.0
  |
  v
1.2.0
  |
  X
  |
  v
1.2.1
  |
  v
Production
```

The appropriate approach depends on the incident, deployment strategy, and organizational process.

---

# 4. Rollback Decision

A rollback decision should normally be based on the severity and impact of the problem.

Example:

```text
Problem Detected
      |
      v
Assess Impact
      |
      +---- Low Impact
      |       |
      |       v
      |    Fix Forward
      |
      +---- High Impact
              |
              v
           Rollback
```

Examples of situations where rollback may be appropriate:

```text
Application Unavailable
Critical Functional Failure
Severe Performance Degradation
Critical Security Issue
Incorrect Production Configuration
Major Deployment Failure
```

---

# 5. Rollback Flow

A basic rollback process:

```text
Deployment
    |
    v
Health Check
    |
    v
Problem?
    |
   YES
    |
    v
Assess Impact
    |
    v
Rollback Decision
    |
    v
Restore Previous Version
    |
    v
Health Check
    |
    v
Service Restored
```

---

# 6. Known-Good Version

Rollback depends on having a known-good version.

Example:

```text
Version 1.0.0 → Good
Version 1.1.0 → Good
Version 1.2.0 → Problem
```

Rollback target:

```text
Version 1.1.0
```

The previous version should be identifiable and available.

---

# 7. Version Traceability

A mature CI/CD pipeline should be able to identify:

```text
Git Commit
    |
    v
Pipeline Run
    |
    v
Artifact Version
    |
    v
Environment
```

For example:

```text
Git Commit
abc123
   |
   v
Build #452
   |
   v
payment-service:1.2.0
   |
   v
Production
```

If version `1.2.0` fails, the pipeline should know which previous version was deployed.

---

# 8. Rollback and Build Once, Deploy Many

Rollback works best when artifacts are immutable and versioned.

Example:

```text
Artifact Repository

payment-service:1.0.0
payment-service:1.1.0
payment-service:1.2.0
```

Production:

```text
Current:
1.2.0

Previous:
1.1.0
```

Rollback:

```text
1.2.0
  |
  v
1.1.0
```

The previous artifact is reused instead of being rebuilt.

---

# 9. Never Rebuild the Rollback Artifact

Avoid:

```text
Old Source Code
      |
      v
Rebuild
      |
      v
Rollback
```

The rebuilt artifact may not be identical to the original artifact.

Prefer:

```text
Previously Built Artifact
      |
      v
Artifact Repository
      |
      v
Rollback
```

This provides stronger traceability and consistency.

---

# 10. Immutable Artifacts

An immutable artifact is an artifact that is not modified after it has been published.

Example:

```text
payment-service:1.2.0
```

Once published, the contents should not be replaced with something else under the same version.

This makes rollback more reliable.

---

# 11. Rollback with Maven

For a Maven application:

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
Nexus / Artifactory
```

Suppose:

```text
1.1.0 → Previous Good
1.2.0 → Current Bad
```

Rollback means redeploying:

```text
1.1.0
```

from the artifact repository.

```text
Nexus
 |
 +---- payment-service-1.1.0.jar
 +---- payment-service-1.2.0.jar
```

---

# 12. Rollback with Nexus / Artifactory

A typical artifact repository may contain:

```text
payment-service
 |
 +---- 1.0.0
 +---- 1.1.0
 +---- 1.2.0
```

Production currently uses:

```text
1.2.0
```

Rollback:

```text
1.2.0
   |
   v
1.1.0
```

The existing `1.1.0` artifact is reused.

---

# 13. Docker Rollback

For Docker:

```text
Container Registry
 |
 +---- payment-service:1.0.0
 +---- payment-service:1.1.0
 +---- payment-service:1.2.0
```

Production:

```text
1.2.0
```

Rollback:

```text
1.1.0
```

The deployment is updated to use the previous image.

---

# 14. Docker Image Tags

Avoid using only:

```text
latest
```

for production rollback.

Instead use immutable version identifiers:

```text
payment-service:1.2.0
```

or preferably an immutable image digest where appropriate:

```text
payment-service@sha256:<digest>
```

This makes it possible to identify exactly which image was deployed.

---

# 15. Docker Rollback Flow

```text
Build Image
    |
    v
Push Registry
    |
    v
Deploy 1.2.0
    |
    v
Problem
    |
    v
Deploy 1.1.0
    |
    v
Health Check
```

---

# 16. Kubernetes Rollback

Kubernetes deployments maintain rollout history when configured appropriately.

A deployment can be rolled back to a previous revision.

Conceptually:

```text
Revision 1
    |
    v
Revision 2
    |
    v
Revision 3
    |
    X
Problem
    |
    v
Rollback
    |
    v
Revision 2
```

A commonly used command is:

```bash
kubectl rollout undo deployment/payment-service
```

This rolls back to the previous revision.

---

# 17. Kubernetes Rollout Status

After deployment:

```bash
kubectl rollout status deployment/payment-service
```

This can be used to monitor rollout progress.

A typical flow is:

```text
Deploy
  |
  v
rollout status
  |
  +---- Success
  |
  +---- Failure
          |
          v
       Rollback
```

---

# 18. Kubernetes Rollout History

A deployment's rollout history can be inspected using:

```bash
kubectl rollout history deployment/payment-service
```

This helps identify available revisions.

Conceptually:

```text
Deployment
 |
 +---- Revision 1
 +---- Revision 2
 +---- Revision 3
```

The exact history available depends on deployment configuration.

---

# 19. Kubernetes Rollback to a Specific Revision

A specific revision can be selected when required.

Example:

```bash
kubectl rollout undo deployment/payment-service --to-revision=2
```

This can be useful when the immediately previous revision is not the desired rollback target.

---

# 20. Kubernetes Rollback Flow

```text
New Version
     |
     v
Deployment
     |
     v
Rollout
     |
     v
Health Check
     |
     X
Failure
     |
     v
kubectl rollout undo
     |
     v
Previous Revision
     |
     v
Health Check
```

---

# 21. Rollback in CI/CD

Rollback can be implemented as a dedicated pipeline.

Example:

```text
Production
    |
    v
Incident
    |
    v
Rollback Workflow
    |
    v
Select Previous Version
    |
    v
Deploy
    |
    v
Validate
```

A dedicated rollback workflow can make recovery faster and more controlled.

---

# 22. Manual Rollback

A manual rollback requires an authorized person to initiate the operation.

Example:

```text
Incident
   |
   v
Engineer
   |
   v
Start Rollback
   |
   v
Previous Version
```

Manual rollback can be useful for high-risk environments where human confirmation is required.

---

# 23. Automated Rollback

Some systems can automatically rollback when health checks fail.

Example:

```text
Deploy
  |
  v
Health Check
  |
  X
Failure
  |
  v
Automatic Rollback
  |
  v
Previous Version
```

Automation can reduce recovery time, but the rollback conditions must be carefully designed.

---

# 24. Automatic Rollback Example

Conceptually:

```text
Deploy Version 2.0
       |
       v
Health Check
       |
       +---- PASS
       |      |
       |      v
       |    Continue
       |
       +---- FAIL
              |
              v
          Rollback
```

The health check might evaluate:

```text
HTTP Status
Application Health
Error Rate
Latency
Pod Health
CPU / Memory
Business Metrics
```

---

# 25. Rollback Thresholds

Automated rollback should use meaningful thresholds.

Example:

```text
Error Rate > 10%
        |
        v
Rollback
```

or:

```text
Health Check Failure
        |
        v
Rollback
```

Thresholds should be based on the application's operational requirements.

---

# 26. Rollback vs Restart

Rollback and restart are different.

### Restart

Restarts the current version.

```text
Version 1.2.0
     |
     v
Restart
     |
     v
Version 1.2.0
```

### Rollback

Changes to a previous version.

```text
Version 1.2.0
     |
     v
Rollback
     |
     v
Version 1.1.0
```

A restart does not fix a defective release.

---

# 27. Rollback vs Redeploy

Redeployment means deploying an application version again.

Example:

```text
1.2.0
  |
  v
Redeploy 1.2.0
```

Rollback means moving to an earlier known-good version:

```text
1.2.0
  |
  v
Rollback
  |
  v
1.1.0
```

---

# 28. Rollback and Configuration

A deployment may fail because of configuration rather than application code.

Example:

```text
Application Version
        |
        v
Configuration
        |
        X
Wrong Configuration
```

Rollback may require restoring:

```text
Application
+
Configuration
```

not just the application binary.

---

# 29. Configuration Versioning

Configuration should also be version-controlled where appropriate.

Example:

```text
Application 1.1
Configuration 1.1

Application 1.2
Configuration 1.2
```

This provides better rollback consistency.

---

# 30. Database Rollback

Database rollback is more complicated than application rollback.

Example:

```text
Application 1.2
       |
       v
Database Migration
       |
       v
Production
```

If the application fails:

```text
Application Rollback
```

does not necessarily mean:

```text
Database Rollback
```

is safe.

---

# 31. Why Database Rollback Is Difficult

Suppose a release performs:

```sql
ALTER TABLE customer
ADD COLUMN new_status;
```

The new application may depend on that column.

If we immediately rollback the application:

```text
Application 1.2
      |
      v
Database Schema 2
```

to:

```text
Application 1.1
      |
      v
Database Schema 1
```

the older application may or may not work with the changed schema.

Therefore database rollback requires careful design.

---

# 32. Backward-Compatible Database Changes

A safer strategy is often:

```text
Database Change
      |
      v
Backward-Compatible
      |
      v
Deploy Application
      |
      v
Remove Old Schema Later
```

This allows application rollback without immediately breaking compatibility.

---

# 33. Expand and Contract Pattern

A common database migration strategy is:

```text
Expand
   |
   v
Deploy
   |
   v
Migrate
   |
   v
Contract
```

### Expand

Add new structures without removing old ones.

### Deploy

Deploy code that can work with the new structure.

### Migrate

Move or transform data.

### Contract

Remove obsolete structures later.

This can make rollback safer.

---

# 34. Liquibase and Rollback

Liquibase can manage database changesets.

Conceptually:

```text
Git
 |
 v
Liquibase Changeset
 |
 v
Database
```

Liquibase also supports rollback functionality for supported changes.

However:

> Database rollback must be designed and tested carefully. Not every database change is safely reversible.

---

# 35. Application Rollback + Database Migration

A release might contain:

```text
Application
    |
    +---- Code
    |
    +---- Database Changes
```

A safe deployment strategy should understand the dependency:

```text
Database Compatibility
        |
        v
Application Version
```

The rollback plan must consider both.

---

# 36. Rollback and Data Changes

Data modifications may not be reversible.

Example:

```text
Old Data
   |
   v
Transformation
   |
   v
New Data
```

Rolling back the application may not restore the old data.

Therefore:

```text
Application Rollback
```

and:

```text
Data Recovery
```

should be treated as separate concerns.

---

# 37. Backup and Recovery

For critical systems, backups provide another recovery mechanism.

Example:

```text
Production
    |
    v
Backup
    |
    v
Failure
    |
    v
Restore
```

Rollback and restore are different.

```text
Rollback
    → Return application/deployment to previous version

Restore
    → Recover data/system state from backup
```

---

# 38. Rollback and Backup Strategy

A mature production system may use:

```text
Application Versioning
        +
Artifact Repository
        +
Database Backup
        +
Infrastructure as Code
        +
Monitoring
        +
Rollback Procedure
```

Together these provide stronger recovery capability.

---

# 39. Terraform Rollback

Terraform does not work exactly like application deployment rollback.

For infrastructure:

```text
Terraform Code
     |
     v
terraform plan
     |
     v
terraform apply
```

If the desired configuration changes back to a previous known-good state:

```text
Previous Terraform Configuration
        |
        v
terraform plan
        |
        v
Review
        |
        v
terraform apply
```

The exact rollback behavior depends on the infrastructure changes.

---

# 40. Terraform State

Terraform maintains state representing managed infrastructure.

Rollback should not be approached as simply "restore an old state file."

Instead:

```text
Desired Configuration
       |
       v
terraform plan
       |
       v
Review Changes
       |
       v
terraform apply
```

State must be handled carefully.

---

# 41. Ansible Rollback

Ansible can support rollback through playbooks and deployment logic.

Example:

```text
deploy.yml
rollback.yml
```

Conceptually:

```text
Deploy
  |
  v
Application
  |
  X
Failure
  |
  v
rollback.yml
  |
  v
Previous Version
```

Rollback logic should be tested before production incidents occur.

---

# 42. Rollback and Git

Git can help identify previous application versions.

Example:

```text
main

A --- B --- C --- D
              |
              v
          Current Release
```

Tags are particularly useful:

```text
v1.0.0
v1.1.0
v1.2.0
```

A rollback target can be associated with a known release tag.

---

# 43. Git Revert vs Deployment Rollback

These are not the same.

### Git Revert

Creates a new commit that reverses a previous change.

```text
A
 |
 v
B
 |
 v
C
 |
 v
Revert C
 |
 v
D
```

### Deployment Rollback

Deploys a previously known-good artifact/version.

```text
1.1.0
 |
 v
1.2.0
 |
 X
 |
 v
Deploy 1.1.0
```

A Git revert does not automatically mean production has been rolled back.

---

# 44. Git Reset vs Rollback

`git reset` changes branch history and should be used carefully, especially on shared branches.

For production recovery, it is generally preferable to use controlled versioning and deployment mechanisms rather than rewriting shared Git history.

---

# 45. Release Tags and Rollback

Tags provide convenient release identifiers.

Example:

```text
v1.0.0
v1.1.0
v1.2.0
```

Production:

```text
v1.2.0
```

Rollback:

```text
v1.1.0
```

This improves traceability.

---

# 46. Rollback and Artifact Repository

A good artifact repository should retain previous releases.

Example:

```text
Nexus / Artifactory

payment-service
 |
 +---- 1.0.0
 +---- 1.1.0
 +---- 1.2.0
 +---- 1.3.0
```

If `1.3.0` fails:

```text
Rollback → 1.2.0
```

---

# 47. Rollback and Container Registry

Similarly:

```text
Container Registry

payment-service
 |
 +---- 1.0.0
 +---- 1.1.0
 +---- 1.2.0
```

Current:

```text
1.2.0
```

Rollback:

```text
1.1.0
```

---

# 48. Rollback and Blue/Green Deployment

Blue/green deployment can make rollback relatively fast.

```text
BLUE
 |
 +---- Version 1.1

GREEN
 |
 +---- Version 1.2
```

Traffic:

```text
Users
  |
  v
BLUE
```

After validation:

```text
Users
  |
  v
GREEN
```

If Green fails:

```text
Users
  |
  v
BLUE
```

Traffic can be switched back.

---

# 49. Rollback and Canary Deployment

Canary deployment releases a new version to a small percentage of traffic.

```text
Version 1.2
 |
 +---- 5% Traffic
 |
 +---- 95% Version 1.1
```

If problems are detected:

```text
5% Traffic
    |
    X
    |
    v
Stop Canary
```

Traffic remains on the known-good version.

---

# 50. Rollback and Rolling Deployment

Rolling deployment gradually replaces old instances.

```text
Old
Old
Old
Old
```

Then:

```text
New
Old
Old
Old
```

Then:

```text
New
New
Old
Old
```

Eventually:

```text
New
New
New
New
```

If failures occur during rollout, the deployment system may stop or roll back according to its configured behavior.

---

# 51. Rollback Strategy Comparison

| Strategy | Rollback Approach |
|---|---|
| Rolling | Restore previous version / rollout revision |
| Blue/Green | Switch traffic back |
| Canary | Stop/reduce new-version traffic |
| Recreate | Redeploy previous version |
| Immutable Deployment | Deploy previous immutable artifact |

---

# 52. Rollback Monitoring

After rollback, verify:

```text
Application Health
Error Rate
Latency
CPU
Memory
Database Connectivity
External Services
User Transactions
Logs
```

Rollback is not complete merely because the deployment command succeeded.

---

# 53. Post-Rollback Validation

Example:

```text
Rollback
   |
   v
Application Health
   |
   v
Smoke Test
   |
   v
Monitoring
   |
   v
Confirm Recovery
```

Useful checks include:

```text
HTTP Health Endpoint
Critical API
Database Connectivity
Authentication
Important Business Transaction
```

---

# 54. Rollback Communication

During a production incident, stakeholders may need to know:

```text
What happened?
What version failed?
Was rollback initiated?
What version is now running?
Is service restored?
What happens next?
```

A simple communication flow:

```text
Incident
   |
   v
Notification
   |
   v
Rollback
   |
   v
Recovery
   |
   v
Status Update
```

---

# 55. Rollback and Incident Management

For serious failures:

```text
Production Failure
       |
       v
Incident Created
       |
       v
Impact Assessment
       |
       v
Rollback
       |
       v
Service Recovery
       |
       v
Root Cause Analysis
```

Rollback restores service; it does not necessarily identify the root cause.

---

# 56. Rollback and Root Cause Analysis

After recovery:

```text
Rollback
   |
   v
Service Restored
   |
   v
Investigate
   |
   v
Root Cause
   |
   v
Corrective Action
```

Possible corrective actions:

```text
Code Fix
Pipeline Improvement
Test Improvement
Monitoring Improvement
Configuration Fix
Infrastructure Change
Security Improvement
```

---

# 57. Rollback Testing

A rollback procedure should be tested.

Do not wait for a production incident to discover:

```text
Rollback Script Does Not Work
```

Test:

```text
Deployment
   |
   v
Simulated Failure
   |
   v
Rollback
   |
   v
Validation
```

---

# 58. Rollback Drill

A rollback drill can validate:

```text
Artifact Availability
Rollback Procedure
Credentials
Deployment Access
Database Compatibility
Monitoring
Communication
Recovery Time
```

This improves operational readiness.

---

# 59. Rollback Time

A useful metric is how quickly the system can recover.

Example:

```text
Failure Detected
      |
      v
Rollback Started
      |
      v
Service Restored
```

Important measurements include:

```text
Detection Time
Decision Time
Rollback Time
Recovery Time
```

---

# 60. RTO and Rollback

RTO means:

```text
Recovery Time Objective
```

It represents the target time for restoring service after a disruption.

For example:

```text
RTO = 30 minutes
```

The rollback process should be capable of meeting the required recovery objectives where rollback is the chosen recovery mechanism.

---

# 61. Rollback Runbook

A rollback runbook should contain:

```text
1. When to rollback
2. Who can authorize rollback
3. Previous version identification
4. Rollback command/process
5. Validation steps
6. Monitoring steps
7. Communication procedure
8. Escalation procedure
9. Database considerations
10. Recovery confirmation
```

---

# 62. Example Rollback Runbook

```text
Step 1
Identify failed release.

Step 2
Confirm production impact.

Step 3
Identify last known-good version.

Step 4
Confirm rollback authorization.

Step 5
Deploy previous artifact/image.

Step 6
Run health checks.

Step 7
Run smoke tests.

Step 8
Monitor metrics and logs.

Step 9
Confirm service recovery.

Step 10
Create incident / RCA if required.
```

---

# 63. Example GitHub Actions Rollback Workflow

A rollback workflow can be manually triggered.

```yaml
name: Rollback

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:

  rollback:

    environment: production

    runs-on: ubuntu-latest

    steps:

      - name: Rollback Application
        run: ./rollback.sh
```

The actual rollback script should select and deploy the intended previous version.

---

# 64. Rollback with a Version Input

A workflow can accept a version to deploy.

Example:

```yaml
name: Rollback

on:

  workflow_dispatch:

    inputs:

      version:

        description: Version to deploy

        required: true

jobs:

  rollback:

    environment: production

    runs-on: ubuntu-latest

    steps:

      - name: Rollback
        run: ./deploy.sh "${{ inputs.version }}"
```

This allows an authorized operator to select a specific version.

The deployment script must validate the supplied version.

---

# 65. Rollback Workflow Design

A robust rollback workflow can be:

```text
Manual Trigger
      |
      v
Select Version
      |
      v
Validate Version
      |
      v
Production Approval
      |
      v
Deploy
      |
      v
Health Check
      |
      v
Smoke Test
      |
      v
Monitor
```

---

# 66. Rollback Security

Rollback operations should be protected.

Consider:

```text
Authentication
Authorization
Production Environment Protection
Audit Logging
Approval
Least Privilege
```

Do not allow unauthorized users to rollback production.

---

# 67. Rollback Credentials

Rollback should use the same principle of least privilege as normal deployment.

For example:

```text
Rollback Job
    |
    +---- Deployment Credential
```

Do not give the rollback job unnecessary administrative access.

---

# 68. Rollback and Secrets

Rollback may require environment-specific credentials.

For example:

```text
Production Rollback
       |
       v
Production Deployment Secret
```

The secret should be scoped to the production environment and job that needs it.

---

# 69. Rollback and Pipeline Permissions

A rollback workflow should have only the permissions required for the rollback operation.

For example:

```yaml
permissions:
  contents: read
```

Additional permissions should be granted only when required by the deployment mechanism.

---

# 70. Rollback and Production Protection

A rollback is itself a production change.

Therefore:

```text
Rollback
    |
    v
Production Environment
    |
    v
Protection Rules
```

A rollback should not automatically bypass production controls unless the organization's emergency process explicitly allows it.

---

# 71. Emergency Rollback

During a major outage, a faster emergency procedure may be required.

Example:

```text
Critical Incident
      |
      v
Incident Commander
      |
      v
Emergency Rollback
      |
      v
Service Recovery
```

Emergency access should still be auditable.

---

# 72. Rollback and Post-Incident Review

After recovery:

```text
Incident
   |
   v
Rollback
   |
   v
Recovery
   |
   v
Post-Incident Review
```

Review:

```text
Why did deployment fail?
Why wasn't it detected earlier?
Was rollback fast enough?
Did monitoring work?
Did the rollback procedure work?
How can recurrence be prevented?
```

---

# 73. Common Rollback Mistakes

## Mistake 1: No Previous Artifact

If the previous artifact has been deleted, rollback becomes more difficult.

---

## Mistake 2: Using `latest`

Using only:

```text
latest
```

makes version identification and rollback harder.

Prefer versioned images.

---

## Mistake 3: Rebuilding During Rollback

Do not unnecessarily rebuild an old version.

Use the previously published artifact.

---

## Mistake 4: Ignoring Database Changes

Application rollback may not be enough if the database schema changed.

---

## Mistake 5: No Validation After Rollback

Always verify that the service has actually recovered.

---

## Mistake 6: No Rollback Permissions

The team may discover during an incident that nobody has the required permissions.

---

## Mistake 7: Untested Rollback

A rollback procedure that has never been tested may fail during a real incident.

---

# 74. Troubleshooting Rollback Failure

If rollback itself fails, check:

```text
1. Previous artifact exists
2. Artifact is accessible
3. Correct version selected
4. Registry/repository available
5. Deployment credentials valid
6. Environment accessible
7. Database compatibility
8. Configuration compatibility
9. Health checks
10. Network connectivity
11. Resource availability
12. Deployment permissions
```

---

# 75. Rollback Decision Tree

```text
Production Problem
       |
       v
Is service impacted?
       |
   +---+---+
   |       |
  NO      YES
   |       |
Monitor   Assess
           |
           v
     Is rollback safe?
           |
       +---+---+
       |       |
      YES      NO
       |       |
       v       v
   Rollback   Fix Forward
       |       |
       +---+---+
           |
           v
        Validate
           |
           v
        Monitor
```

---

# 76. Rollback Strategy for Maven Application

Example:

```text
Current:
payment-service-1.2.0.jar

Previous:
payment-service-1.1.0.jar
```

Failure:

```text
1.2.0
 |
 X
```

Rollback:

```text
1.1.0
 |
 v
Production
```

The artifact is retrieved from Nexus or Artifactory rather than rebuilt.

---

# 77. Rollback Strategy for Docker

Example:

```text
Current Image:
payment-service:1.2.0

Previous Image:
payment-service:1.1.0
```

Rollback:

```text
Deploy payment-service:1.1.0
```

Then:

```text
Health Check
     |
     v
Smoke Test
     |
     v
Recovery
```

---

# 78. Rollback Strategy for Kubernetes

Example:

```bash
kubectl rollout undo deployment/payment-service
```

Then:

```bash
kubectl rollout status deployment/payment-service
```

The objective is:

```text
Failed Revision
      |
      v
Previous Revision
      |
      v
Healthy Deployment
```

---

# 79. Rollback Strategy for Terraform

For infrastructure:

```text
Current Infrastructure
       |
       v
Problem
       |
       v
Identify Previous Desired Configuration
       |
       v
terraform plan
       |
       v
Review
       |
       v
terraform apply
```

Do not blindly manipulate Terraform state to simulate rollback.

---

# 80. Rollback Strategy for Ansible

A deployment can provide a dedicated rollback playbook:

```text
deploy.yml
rollback.yml
```

Flow:

```text
Deploy
  |
  v
Problem
  |
  v
rollback.yml
  |
  v
Previous Version
```

The rollback playbook should be tested independently.

---

# 81. Rollback and Deployment Strategy Summary

```text
Rolling
    → Restore previous version/revision

Blue/Green
    → Switch traffic back

Canary
    → Stop or reverse traffic to new version

Immutable
    → Deploy previous immutable artifact
```

---

# 82. Best Practices

Follow these rollback practices:

1. Always maintain a known-good version.
2. Store artifacts in a reliable repository.
3. Use immutable artifacts.
4. Use versioned Docker images.
5. Avoid relying only on `latest`.
6. Keep release history.
7. Tag releases.
8. Test rollback procedures.
9. Monitor deployments.
10. Use health checks.
11. Have a documented rollback runbook.
12. Consider database compatibility.
13. Protect rollback operations.
14. Use least-privilege credentials.
15. Maintain audit logs.
16. Validate after rollback.
17. Communicate during major incidents.
18. Perform post-incident analysis.
19. Measure recovery time.
20. Automate rollback where it is safe and reliable.

---

# 83. Interview Questions

## What is rollback?

Rollback is the process of returning an application or deployment to a previous known-good state after a failure.

---

## What is the difference between rollback and fix forward?

```text
Rollback
    → Return to previous version

Fix Forward
    → Correct the problem and deploy a new version
```

---

## Why is Build Once, Deploy Many useful for rollback?

Because the exact artifact tested earlier can be reused during rollback without rebuilding it.

---

## Why should artifacts be immutable?

Immutable artifacts provide predictable and traceable deployment behavior.

---

## How do you rollback a Docker deployment?

Deploy the previously known-good image version or digest.

Example:

```text
Current → 1.2.0
Rollback → 1.1.0
```

---

## How do you rollback a Kubernetes deployment?

A common command is:

```bash
kubectl rollout undo deployment/<deployment-name>
```

Then verify:

```bash
kubectl rollout status deployment/<deployment-name>
```

---

## What is the difference between restart and rollback?

```text
Restart
    → Restarts the same version

Rollback
    → Deploys a previous version
```

---

## What is the difference between Git revert and deployment rollback?

Git revert creates a new Git commit that reverses a previous change.

Deployment rollback deploys a previous known-good application artifact.

They are related but are not the same operation.

---

## Why is database rollback difficult?

Database changes may not be safely reversible and the previous application version may not be compatible with the new schema.

---

## What is Build Once, Deploy Many?

Build the application once and promote the same artifact through environments.

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

## What is a rollback runbook?

A documented procedure describing:

```text
When to rollback
Who can rollback
Which version to use
How to rollback
How to validate
How to communicate
```

---

## What should you do if rollback fails?

Check:

```text
Artifact
Credentials
Environment
Configuration
Database
Network
Permissions
Deployment System
```

Escalate according to the incident-management process.

---

# 84. Key Takeaway

Rollback is a critical part of reliable CI/CD.

The basic principle is:

```text
Deploy
  |
  v
Monitor
  |
  v
Failure
  |
  v
Rollback
  |
  v
Known-Good Version
  |
  v
Validate
  |
  v
Recover
```

A mature rollback architecture looks like:

```text
                    Git
                     |
                     v
                  Build
                     |
                     v
             Versioned Artifact
                     |
                     v
            Artifact Repository
                     |
          +----------+----------+
          |          |          |
          v          v          v
         DEV        QA         UAT
                                |
                                v
                              PROD
                                |
                                v
                         Health Monitoring
                                |
                         +------+------+
                         |             |
                       Healthy       Failure
                         |             |
                         v             v
                      Continue      Rollback
                                       |
                                       v
                               Previous Artifact
                                       |
                                       v
                                  Validation
```

The most important principles are:

```text
Known-Good Version
        |
        v
Immutable Artifact
        |
        v
Version Traceability
        |
        v
Fast Rollback
        |
        v
Health Validation
        |
        v
Monitoring
```

Remember:

> **Rollback is not simply "go back to the previous code." It is a controlled recovery process that restores a known-good application, configuration, and deployment state while considering database compatibility, infrastructure, security, monitoring, and business impact.**
