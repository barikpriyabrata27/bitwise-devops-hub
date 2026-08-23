# Deployment Strategies

## 1. What is a Deployment Strategy?

A deployment strategy defines **how a new version of an application is released to an environment**.

It determines:

- How the new version is introduced
- How much traffic reaches the new version
- Whether the old version remains available
- How failures are detected
- How rollback is performed
- How deployment risk is controlled

Common deployment strategies are:

```text
Recreate
Rolling
Blue-Green
Canary
Immutable
```

---

# 2. Why Do We Need Deployment Strategies?

A simple deployment looks like:

```text
Version 1
    |
    v
Stop
    |
    v
Deploy Version 2
    |
    v
Start
```

This can cause downtime.

Modern deployment strategies try to reduce:

```text
Downtime
Deployment Risk
User Impact
Rollback Time
```

The strategy should be selected based on:

```text
Application Architecture
Traffic
Availability Requirements
Risk
Infrastructure
Rollback Requirements
Cost
```

---

# 3. Basic Deployment Flow

A CI/CD pipeline may look like:

```text
Git
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
Artifact
 |
 v
Deployment Strategy
 |
 v
Environment
```

The deployment strategy controls what happens after the artifact is ready.

---

# 4. Recreate Deployment

In a Recreate deployment:

```text
Old Version
     |
     v
Stop Old Version
     |
     v
Deploy New Version
     |
     v
Start New Version
```

There is generally a period where the old version is unavailable before the new version becomes available.

---

# 5. Recreate Example

Suppose we have:

```text
Version 1.0
Version 1.0
Version 1.0
```

Deployment:

```text
Stop All
   |
   v
No Application Instances
   |
   v
Deploy Version 1.1
   |
   v
Start Instances
```

The application may experience downtime.

---

# 6. Advantages of Recreate

Advantages:

- Simple
- Easy to understand
- Easy to implement
- No need to run old and new versions simultaneously
- Useful for environments where downtime is acceptable

---

# 7. Disadvantages of Recreate

Disadvantages:

- Downtime
- Higher user impact
- Not suitable for highly available applications
- Rollback can require another deployment
- Not ideal for critical production systems

---

# 8. When to Use Recreate

Recreate can be appropriate for:

```text
Development
Testing
Non-Critical Applications
Maintenance Windows
Applications Where Downtime Is Acceptable
```

---

# 9. Rolling Deployment

A Rolling deployment gradually replaces old instances with new instances.

Example:

```text
Initial:

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

Then:

```text
New
New
New
Old
```

Finally:

```text
New
New
New
New
```

---

# 10. Rolling Deployment Flow

```text
Old Version
    |
    v
Replace Some Instances
    |
    v
Health Check
    |
    v
Replace More Instances
    |
    v
Health Check
    |
    v
Replace Remaining Instances
    |
    v
New Version
```

---

# 11. Rolling Deployment Example

Suppose we have four instances:

```text
Instance 1 → v1
Instance 2 → v1
Instance 3 → v1
Instance 4 → v1
```

Deployment:

```text
Step 1:
v2
v1
v1
v1

Step 2:
v2
v2
v1
v1

Step 3:
v2
v2
v2
v1

Step 4:
v2
v2
v2
v2
```

---

# 12. Rolling Deployment Availability

One advantage is that some instances can remain available while others are updated.

```text
          Load Balancer
                |
        +-------+-------+
        |       |       |
        v       v       v
       v2      v1      v1
```

Traffic can continue while the deployment progresses.

The exact availability depends on the application and deployment configuration.

---

# 13. Rolling Deployment Advantages

Advantages:

- Reduced downtime
- Gradual deployment
- Uses existing infrastructure
- No need to maintain a completely separate environment
- Can support health checks between steps
- Lower infrastructure cost than blue-green in many cases

---

# 14. Rolling Deployment Disadvantages

Disadvantages:

- Old and new versions can run simultaneously
- Application compatibility may be required
- Rollback can be more complicated
- Database compatibility must be considered
- Deployment can take longer

---

# 15. Version Compatibility in Rolling Deployment

During deployment:

```text
v1
v1
v2
v2
```

Both versions may be active.

Therefore:

```text
v1 ↔ Database
v2 ↔ Database
```

must be compatible where necessary.

This is especially important for:

```text
Database Schema
APIs
Message Formats
Shared Storage
Caches
```

---

# 16. Blue-Green Deployment

Blue-green deployment maintains two environments:

```text
BLUE
    → Current Version

GREEN
    → New Version
```

Example:

```text
BLUE
 |
 +---- Version 1.0

GREEN
 |
 +---- Version 1.1
```

Initially:

```text
Users
  |
  v
BLUE
```

The new version is deployed to Green.

```text
Users
  |
  v
BLUE

GREEN
  |
  +---- Version 1.1
```

After validation, traffic switches to Green.

---

# 17. Blue-Green Traffic Switch

Before deployment:

```text
Users
  |
  v
BLUE
 |
 +---- v1
```

After deployment:

```text
Users
  |
  v
GREEN
 |
 +---- v2
```

Blue remains available for rollback.

---

# 18. Blue-Green Rollback

If Green fails:

```text
Users
  |
  v
GREEN
  |
  X
Failure
```

Traffic can be switched back:

```text
Users
  |
  v
BLUE
  |
  +---- v1
```

This can make rollback very fast.

---

# 19. Blue-Green Advantages

Advantages:

- Very fast traffic switching
- Simple rollback
- Old version remains available
- New version can be tested before traffic switch
- Reduced downtime
- Useful for critical applications

---

# 20. Blue-Green Disadvantages

Disadvantages:

- Requires additional infrastructure
- Higher resource cost
- Database compatibility can still be challenging
- Two environments must be managed
- Configuration must be synchronized carefully

---

# 21. Blue-Green Deployment Flow

```text
Current Production
      |
      v
BLUE = v1
      |
      |
      +------ Users
      |
      v
Deploy v2 to GREEN
      |
      v
Test GREEN
      |
      v
Approval
      |
      v
Switch Traffic
      |
      v
GREEN = Production
```

---

# 22. Canary Deployment

Canary deployment releases the new version to a small percentage of users or traffic first.

Example:

```text
v1 → 95% Traffic
v2 → 5% Traffic
```

If the new version is healthy:

```text
v1 → 75%
v2 → 25%
```

Then:

```text
v1 → 50%
v2 → 50%
```

Finally:

```text
v2 → 100%
```

---

# 23. Canary Deployment Flow

```text
Deploy v2
    |
    v
5% Traffic
    |
    v
Monitor
    |
    +---- Failure → Stop / Rollback
    |
    +---- Success
            |
            v
        25% Traffic
            |
            v
         Monitor
            |
            v
        50% Traffic
            |
            v
        100% Traffic
```

---

# 24. Why is it Called Canary?

The term comes from the historical concept of using canaries as an early warning signal in mines.

In software:

```text
Small Exposure
     |
     v
Observe
     |
     v
Detect Problems Early
```

The new release acts as the "canary."

---

# 25. Canary Metrics

Canary deployments should be monitored carefully.

Useful metrics include:

```text
Error Rate
Latency
Response Time
CPU
Memory
Request Rate
HTTP 5xx
Application Errors
Business Metrics
```

Example:

```text
v2
 |
 +---- Error Rate = 2%
 +---- Latency = Normal
 +---- Health = Good
```

The rollout can continue if the configured thresholds are satisfied.

---

# 26. Canary Rollback

If the canary fails:

```text
v1 → 95%
v2 → 5%
       |
       X
    Failure
       |
       v
v1 → 100%
v2 → 0%
```

Only a small portion of users may have been exposed to the faulty release.

---

# 27. Canary Advantages

Advantages:

- Low initial risk
- Limited user exposure
- Early detection
- Gradual rollout
- Data-driven deployment decisions
- Can reduce blast radius

---

# 28. Canary Disadvantages

Disadvantages:

- More complex
- Requires traffic management
- Requires strong monitoring
- Requires automated metrics
- More complicated release management
- May require service mesh or advanced load-balancing capabilities

---

# 29. Immutable Deployment

In an immutable deployment, the existing infrastructure is not modified in place.

Instead:

```text
Old Infrastructure
      |
      v
New Infrastructure
      |
      v
Deploy New Version
      |
      v
Switch Traffic
```

The old infrastructure can remain available until the new deployment is validated.

---

# 30. Immutable Infrastructure

The principle is:

> Instead of modifying existing infrastructure, create a new version and replace the old infrastructure.

Example:

```text
Old VM
 |
 +---- Application v1
```

Create:

```text
New VM
 |
 +---- Application v2
```

Then:

```text
Traffic
   |
   v
New VM
```

---

# 31. Immutable Deployment Advantages

Advantages:

- Consistent infrastructure
- Reduced configuration drift
- Easier rollback
- Reproducible deployments
- Better traceability
- Works well with infrastructure as code

---

# 32. Immutable Deployment Disadvantages

Disadvantages:

- Additional infrastructure may be required
- More resource consumption
- Infrastructure creation may take time
- Requires good automation
- Stateful systems require additional planning

---

# 33. Deployment Strategy Comparison

| Strategy | Downtime | Infrastructure | Rollback | Complexity |
|---|---|---|---|---|
| Recreate | Possible | Low | Redeploy | Low |
| Rolling | Low / None | Moderate | Moderate | Medium |
| Blue-Green | Very Low | Higher | Fast | Medium |
| Canary | Very Low | Moderate / High | Fast | High |
| Immutable | Very Low | Higher | Fast | Medium / High |

The actual behavior depends on the implementation.

---

# 34. Recreate vs Rolling

### Recreate

```text
Stop Old
   |
   v
Deploy New
```

### Rolling

```text
Old
Old
Old
Old
 |
 v
New
Old
Old
Old
 |
 v
New
New
Old
Old
 |
 v
New
New
New
New
```

Rolling reduces downtime but requires version compatibility.

---

# 35. Rolling vs Blue-Green

### Rolling

```text
Same Environment

v1 → v1 → v2 → v2
```

### Blue-Green

```text
BLUE  → v1

GREEN → v2
```

Blue-green typically requires more infrastructure but can provide a simpler and faster traffic switch.

---

# 36. Blue-Green vs Canary

### Blue-Green

Traffic generally switches between environments.

```text
100% → BLUE
```

then:

```text
100% → GREEN
```

### Canary

Traffic is gradually shifted.

```text
95% v1
 5% v2
```

then:

```text
75% v1
25% v2
```

then:

```text
50% v1
50% v2
```

then:

```text
100% v2
```

---

# 37. Canary vs Rolling

Both can gradually introduce a new version, but the focus is different.

### Rolling

Gradually replaces instances.

```text
v2
v1
v1
v1
```

### Canary

Gradually increases traffic exposure.

```text
v1 → 95%
v2 → 5%
```

Canary is more explicitly traffic/metric driven.

---

# 38. Deployment Strategy and Rollback

| Strategy | Typical Rollback |
|---|---|
| Recreate | Redeploy previous version |
| Rolling | Roll back deployment revision |
| Blue-Green | Switch traffic back |
| Canary | Stop new traffic / return to old version |
| Immutable | Deploy previous immutable artifact/environment |

---

# 39. Deployment Strategy and Database

Database compatibility is important for all strategies.

Especially:

```text
Rolling
Canary
Blue-Green
```

because multiple application versions may coexist.

Example:

```text
v1 Application
       |
       +----+
            |
         Database
            |
       +----+
       |
v2 Application
```

Both versions must work with the database during the transition when required.

---

# 40. Backward-Compatible Database Changes

A safer approach is:

```text
Database Expand
      |
      v
Deploy New Application
      |
      v
Migrate Data
      |
      v
Remove Old Structure Later
```

This is often called the:

```text
Expand and Contract
```

pattern.

---

# 41. Deployment Strategies and Kubernetes

Kubernetes commonly supports rolling updates.

A Deployment can define update behavior.

Example:

```yaml
strategy:
  type: RollingUpdate
```

The exact parameters can control how many pods are unavailable or available during the rollout.

---

# 42. Kubernetes Rolling Deployment

Conceptually:

```text
Pod v1
Pod v1
Pod v1
```

During rollout:

```text
Pod v2
Pod v1
Pod v1
```

Then:

```text
Pod v2
Pod v2
Pod v1
```

Finally:

```text
Pod v2
Pod v2
Pod v2
```

---

# 43. Kubernetes Recreate Strategy

Kubernetes also supports a recreate-style strategy.

Conceptually:

```text
Stop v1 Pods
      |
      v
Start v2 Pods
```

This can cause downtime and should be used only when appropriate.

---

# 44. Kubernetes Blue-Green Concept

Blue-green can be implemented using separate Kubernetes Deployments.

Example:

```text
Deployment-blue
    |
    +---- v1

Deployment-green
    |
    +---- v2
```

A Kubernetes Service can control which deployment receives traffic.

Conceptually:

```text
Service
   |
   +---- BLUE
```

Switch:

```text
Service
   |
   +---- GREEN
```

---

# 45. Kubernetes Canary Concept

Canary can be implemented using traffic routing.

Example:

```text
Service / Ingress
       |
       +---- v1 → 95%
       |
       +---- v2 → 5%
```

Traffic can gradually increase toward v2.

The exact implementation can use ingress controllers, service meshes, or platform-specific traffic-management capabilities.

---

# 46. Deployment Strategies and Docker

Docker provides the application packaging layer.

For example:

```text
Docker Image
      |
      v
Deployment Platform
      |
      +---- Rolling
      +---- Blue-Green
      +---- Canary
```

Docker itself does not define the complete deployment strategy.

The orchestration or deployment platform controls how containers are released.

---

# 47. Deployment Strategies and CI/CD

A CI/CD pipeline may implement:

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
Package
 |
 v
Deploy
 |
 v
Deployment Strategy
```

Example:

```text
Build Image
     |
     v
Push Registry
     |
     v
Canary Deployment
     |
     v
Monitor
     |
     v
Full Deployment
```

---

# 48. Deployment Strategy with GitHub Actions

A simplified rolling deployment might be:

```yaml
jobs:

  deploy:

    runs-on: ubuntu-latest

    steps:

      - name: Deploy
        run: kubectl apply -f deployment.yaml

      - name: Check Rollout
        run: kubectl rollout status deployment/payment-service
```

The Kubernetes Deployment configuration determines the rollout strategy.

---

# 49. Blue-Green Pipeline Example

Conceptually:

```text
Build
 |
 v
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
Monitor
```

The pipeline can then retain Blue for rollback.

---

# 50. Canary Pipeline Example

Conceptually:

```text
Build
 |
 v
Deploy Canary
 |
 v
Route 5% Traffic
 |
 v
Monitor
 |
 +---- Failure → Rollback
 |
 +---- Success
        |
        v
Increase Traffic
        |
        v
100%
```

---

# 51. Deployment Strategy Selection

Consider:

```text
1. Availability Requirements
2. Application Architecture
3. Traffic
4. Infrastructure Cost
5. Rollback Requirements
6. Monitoring Capability
7. Database Compatibility
8. Release Frequency
9. Operational Maturity
10. Business Risk
```

---

# 52. Choosing Recreate

Choose Recreate when:

```text
Downtime Is Acceptable
Application Is Non-Critical
Infrastructure Is Simple
Deployment Is Infrequent
```

Example:

```text
Internal Development Application
```

---

# 53. Choosing Rolling

Choose Rolling when:

```text
High Availability Is Required
Application Supports Multiple Versions
Infrastructure Is Already Available
Gradual Instance Replacement Is Suitable
```

Common use:

```text
Kubernetes Applications
Web Applications
Microservices
```

---

# 54. Choosing Blue-Green

Choose Blue-Green when:

```text
Fast Rollback Is Important
Downtime Must Be Minimized
Extra Infrastructure Is Available
New Version Can Be Tested Before Traffic Switch
```

Good for:

```text
Critical Applications
High-Availability Services
Major Releases
```

---

# 55. Choosing Canary

Choose Canary when:

```text
Risk Must Be Minimized
Traffic Can Be Controlled
Strong Monitoring Exists
Gradual User Exposure Is Desired
```

Good for:

```text
Large Applications
High-Traffic Services
Critical Releases
Frequent Deployments
```

---

# 56. Choosing Immutable Deployment

Choose Immutable when:

```text
Infrastructure as Code Is Mature
Reproducibility Is Important
Configuration Drift Must Be Minimized
Cloud Infrastructure Is Available
```

Common in:

```text
Cloud
Containers
Kubernetes
Terraform-Based Infrastructure
```

---

# 57. Deployment Strategy by Environment

Different environments can use different strategies.

Example:

```text
DEV
 |
 +---- Recreate

QA
 |
 +---- Rolling

UAT
 |
 +---- Rolling / Blue-Green

PROD
 |
 +---- Blue-Green / Canary
```

There is no requirement that every environment use the same strategy.

---

# 58. Low-Risk Deployment Model

A simple application might use:

```text
DEV
 |
 v
Rolling
 |
 v
QA
 |
 v
Rolling
 |
 v
PROD
 |
 v
Rolling
```

This can be sufficient when application risk and availability requirements are moderate.

---

# 59. High-Risk Deployment Model

A critical service may use:

```text
DEV
 |
 v
Rolling
 |
 v
QA
 |
 v
UAT
 |
 v
PROD
 |
 v
Canary
 |
 v
Monitor
 |
 v
Blue-Green / Full Rollout
```

The strategy can be more sophisticated as production risk increases.

---

# 60. Progressive Delivery

Progressive delivery means gradually exposing a new version while continuously validating it.

Conceptually:

```text
Deploy
  |
  v
Small Exposure
  |
  v
Measure
  |
  v
Increase Exposure
  |
  v
Measure
  |
  v
Full Deployment
```

Canary is a common progressive-delivery strategy.

---

# 61. Progressive Delivery Example

```text
v1 → 95%
v2 → 5%
      |
      v
Metrics OK
      |
      v
v1 → 75%
v2 → 25%
      |
      v
Metrics OK
      |
      v
v1 → 50%
v2 → 50%
      |
      v
Metrics OK
      |
      v
v2 → 100%
```

---

# 62. Automated Progressive Delivery

A mature system can automatically evaluate metrics.

```text
Deploy Canary
      |
      v
Collect Metrics
      |
      v
Evaluate
      |
 +----+----+
 |         |
 v         v
Pass      Fail
 |         |
 v         v
Increase  Rollback
Traffic
```

This reduces manual intervention.

---

# 63. Deployment Strategy and Monitoring

Monitoring is especially important for:

```text
Canary
Blue-Green
Rolling
```

Monitor:

```text
Availability
Error Rate
Latency
Throughput
Resource Utilization
Application Errors
Business KPIs
```

---

# 64. Health Checks

Deployment systems should use appropriate health checks.

Example:

```text
Liveness
Readiness
Startup
HTTP Health
Application Health
```

A deployment should not send traffic to an instance that is not ready to serve requests.

---

# 65. Readiness During Rolling Deployment

Conceptually:

```text
New Pod
   |
   v
Startup
   |
   v
Readiness Check
   |
   +---- Fail → Do Not Receive Traffic
   |
   +---- Pass → Receive Traffic
```

This helps protect users during rollout.

---

# 66. Deployment Failure

A deployment can fail because of:

```text
Application Bug
Configuration Error
Resource Shortage
Health Check Failure
Dependency Failure
Database Issue
Network Problem
Security Failure
```

A deployment strategy should define how failure is handled.

---

# 67. Failure Handling by Strategy

### Recreate

```text
Failure
 |
 v
Redeploy Previous Version
```

### Rolling

```text
Failure
 |
 v
Stop Rollout
 |
 v
Rollback
```

### Blue-Green

```text
Failure
 |
 v
Switch Traffic Back
```

### Canary

```text
Failure
 |
 v
Stop Canary
 |
 v
Return Traffic to Old Version
```

---

# 68. Deployment Strategy and Rollback Speed

Typical relative behavior:

```text
Blue-Green
    → Very Fast Traffic Switch

Canary
    → Very Fast Stop / Traffic Reversal

Rolling
    → Rollout Undo / Redeploy

Recreate
    → Redeploy Previous Version
```

Actual rollback time depends on infrastructure and automation.

---

# 69. Deployment Strategy and Cost

Approximate infrastructure considerations:

```text
Recreate
    → Low

Rolling
    → Moderate

Blue-Green
    → Higher

Canary
    → Moderate / Higher

Immutable
    → Higher During Replacement
```

Cost should be considered together with availability and risk.

---

# 70. Deployment Strategy and Complexity

Simple to complex:

```text
Recreate
    |
    v
Rolling
    |
    v
Blue-Green
    |
    v
Canary / Progressive Delivery
```

Complexity increases with:

```text
Traffic Management
Monitoring
Automation
Infrastructure
Release Coordination
```

---

# 71. Deployment Strategy and Microservices

Microservices can use different strategies per service.

Example:

```text
Service A
    → Rolling

Service B
    → Canary

Service C
    → Blue-Green
```

The strategy should match each service's risk and architecture.

---

# 72. Deployment Strategy and Monoliths

A monolithic application can also use:

```text
Rolling
Blue-Green
Canary
Recreate
```

The choice depends on infrastructure and application behavior.

---

# 73. Deployment Strategy and Serverless

Serverless platforms may provide deployment mechanisms such as:

```text
Traffic Splitting
Versioning
Aliases
Canary Releases
Blue-Green-like Routing
```

The exact strategy depends on the cloud platform.

---

# 74. Deployment Strategy and Feature Flags

Feature flags can be combined with deployment strategies.

Example:

```text
Deploy v2
    |
    v
Feature Disabled
    |
    v
Production
    |
    v
Enable for 5%
    |
    v
Monitor
    |
    v
Enable for 100%
```

This separates:

```text
Deployment
```

from:

```text
Feature Release
```

---

# 75. Deployment vs Release

These terms are often confused.

### Deployment

Putting software into an environment.

```text
Deploy v2
```

### Release

Making functionality available to users.

With feature flags:

```text
Deploy v2
      |
      v
Feature OFF
      |
      v
Release Feature
```

This allows teams to deploy before fully releasing functionality.

---

# 76. Deployment Strategy and Security

Security should be included in the deployment process.

Example:

```text
Build
 |
 v
Security Scan
 |
 v
Deploy
 |
 v
Runtime Monitoring
```

A canary deployment can also help detect unexpected behavior before full rollout.

---

# 77. Deployment Strategy and Compliance

Some organizations require:

```text
Approval
Change Record
Audit Trail
Release Record
Rollback Plan
```

before production deployment.

Deployment strategy does not replace governance controls.

---

# 78. Deployment Strategy Decision Matrix

| Requirement | Recreate | Rolling | Blue-Green | Canary | Immutable |
|---|---:|---:|---:|---:|---:|
| Simple | High | Medium | Medium | Low | Medium |
| Low downtime | Low | High | High | High | High |
| Fast rollback | Low | Medium | High | High | High |
| Low cost | High | High | Low | Medium | Medium |
| Gradual traffic | Low | Medium | Low | High | Depends |
| Extra infrastructure | Low | Low/Medium | High | Medium/High | High |
| Strong risk control | Low | Medium | High | Very High | High |

These are general characteristics; actual results depend on implementation.

---

# 79. Example Enterprise Deployment

A mature pipeline could look like:

```text
Git
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
 |
 v
Canary
 |
 v
5% Traffic
 |
 v
Monitor
 |
 v
25%
 |
 v
Monitor
 |
 v
50%
 |
 v
Monitor
 |
 v
100%
```

If problems occur:

```text
Canary
 |
 X
Failure
 |
 v
Rollback
 |
 v
Previous Version
```

---

# 80. Example Kubernetes Deployment

A basic rolling deployment:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: payment-service

spec:

  replicas: 4

  strategy:

    type: RollingUpdate

    rollingUpdate:

      maxUnavailable: 1
      maxSurge: 1

  selector:

    matchLabels:
      app: payment-service

  template:

    metadata:

      labels:
        app: payment-service

    spec:

      containers:

        - name: payment-service

          image: payment-service:1.2.0
```

The exact values should be chosen based on application availability and capacity requirements.

---

# 81. Rolling Deployment Parameters

Two common Kubernetes parameters are:

```text
maxUnavailable
maxSurge
```

### maxUnavailable

Controls how many pods can be unavailable during the update.

### maxSurge

Controls how many additional pods can be created above the desired replica count during the update.

Example:

```yaml
rollingUpdate:
  maxUnavailable: 1
  maxSurge: 1
```

This allows a controlled rolling update.

---

# 82. Kubernetes Health Checks

A deployment can use readiness probes.

Example:

```yaml
readinessProbe:

  httpGet:
    path: /health
    port: 8080

  initialDelaySeconds: 10
  periodSeconds: 5
```

A readiness probe helps determine whether a pod is ready to receive traffic.

---

# 83. Deployment Strategy with Health Validation

```text
Deploy New Version
       |
       v
Readiness Check
       |
       +---- Fail → Stop / Rollback
       |
       +---- Pass
              |
              v
          Receive Traffic
```

This is especially important for rolling and progressive deployments.

---

# 84. Deployment Strategy Best Practices

Follow these practices:

1. Choose the strategy based on risk.
2. Use versioned artifacts.
3. Keep artifacts immutable.
4. Use automated health checks.
5. Monitor during deployment.
6. Have a rollback strategy.
7. Test rollback.
8. Consider database compatibility.
9. Protect production.
10. Use approvals where required.
11. Keep deployment configuration in Git.
12. Automate deployment.
13. Avoid using `latest` as the only version identifier.
14. Use gradual rollout for high-risk changes.
15. Minimize blast radius.
16. Maintain deployment history.
17. Use infrastructure as code.
18. Keep environments consistent.
19. Use feature flags where appropriate.
20. Document the chosen strategy.

---

# 85. Common Mistakes

## Mistake 1: Choosing the Strategy Without Considering the Application

A strategy should match:

```text
Application
Traffic
Availability
Database
Infrastructure
```

---

## Mistake 2: No Rollback Plan

Every production deployment should have a recovery strategy.

---

## Mistake 3: No Monitoring

Canary deployment without monitoring is not meaningful.

```text
Canary
   |
   X
No Monitoring
```

The system cannot determine whether the release is healthy.

---

## Mistake 4: Using `latest`

Avoid:

```text
app:latest
```

as the only production identifier.

Prefer:

```text
app:1.2.0
```

or an immutable digest.

---

## Mistake 5: Ignoring Database Compatibility

Rolling, blue-green, and canary deployments can temporarily run multiple application versions.

---

## Mistake 6: Deploying Without Health Checks

A deployment should validate whether the new version is actually healthy.

---

# 86. Troubleshooting Deployment Problems

When a deployment fails, check:

```text
1. Application Logs
2. Deployment Events
3. Health Checks
4. Readiness
5. Liveness
6. Resource Availability
7. Network
8. Configuration
9. Secrets
10. Database
11. Dependencies
12. Container Image
13. Registry
14. Traffic Routing
15. Deployment History
```

---

# 87. Interview Questions

## What is a deployment strategy?

A deployment strategy defines how a new version is introduced into an environment.

---

## What is a rolling deployment?

A rolling deployment gradually replaces instances running the old version with instances running the new version.

---

## What is blue-green deployment?

Blue-green maintains two environments, one serving the current version and another hosting the new version. Traffic is switched after validation.

---

## What is canary deployment?

Canary deployment exposes the new version to a small percentage of traffic first and gradually increases exposure after monitoring the results.

---

## What is recreate deployment?

The old version is stopped before the new version is deployed.

---

## What is immutable deployment?

Immutable deployment creates new infrastructure or deployment units rather than modifying existing ones in place.

---

## Which deployment strategy provides the fastest rollback?

Blue-green can provide very fast rollback because traffic can often be switched back to the previous environment.

---

## What is the main disadvantage of blue-green?

It generally requires additional infrastructure and therefore can increase cost.

---

## What is the main advantage of canary deployment?

It limits the initial blast radius by exposing the new version to only a small percentage of traffic.

---

## What is the main disadvantage of canary deployment?

It requires sophisticated traffic management and strong monitoring.

---

## What is the difference between rolling and canary?

Rolling gradually replaces application instances.

Canary gradually increases traffic exposure to the new version.

---

## What is the difference between blue-green and canary?

Blue-green typically switches traffic between two environments.

Canary gradually shifts traffic from the old version to the new version.

---

## Why are health checks important?

They help determine whether the new version is ready and healthy before additional traffic or deployment progression occurs.

---

## Why is database compatibility important?

Deployment strategies can temporarily run multiple application versions, so both versions may need to work with the database during the transition.

---

## What is progressive delivery?

Progressive delivery gradually exposes a new release while continuously validating its health and performance.

---

# 88. Key Takeaway

A deployment strategy determines **how software moves from one version to another in an environment**.

The main strategies are:

```text
Recreate
   |
   +---- Stop old
   +---- Deploy new

Rolling
   |
   +---- Replace instances gradually

Blue-Green
   |
   +---- Maintain old + new
   +---- Switch traffic

Canary
   |
   +---- Small traffic
   +---- Monitor
   +---- Gradually increase

Immutable
   |
   +---- Create new deployment infrastructure
   +---- Switch to new version
```

A useful comparison is:

```text
                    Risk Control
                         ^
                         |
                    Canary
                         |
                  Blue-Green
                         |
                    Rolling
                         |
                    Recreate
                         |
                         +-----------------> Simplicity
```

A mature deployment process looks like:

```text
                    Git
                     |
                     v
                    CI
                     |
          +----------+----------+
          |          |          |
        Build       Test       Scan
          |          |          |
          +----------+----------+
                     |
                     v
                  Artifact
                     |
                     v
                 DEV / QA
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
             Deployment Strategy
                     |
          +----------+----------+
          |          |          |
       Rolling   Blue-Green   Canary
          |          |          |
          +----------+----------+
                     |
                     v
                 Monitoring
                     |
              +------+------+
              |             |
           Healthy        Failure
              |             |
              v             v
           Continue      Rollback
```

The most important principles are:

```text
Choose Strategy Based on Risk
          |
          v
Use Versioned Artifacts
          |
          v
Monitor Deployment
          |
          v
Validate Health
          |
          v
Limit Blast Radius
          |
          v
Have a Rollback Plan
```

> **The best deployment strategy is not necessarily the most advanced one. Choose the simplest strategy that provides the availability, risk control, rollback capability, and operational reliability your application requires.**
