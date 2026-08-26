# Secrets Scanning

> **Secrets scanning** detects credentials, tokens, API keys, private keys, passwords, connection strings, and other sensitive authentication material that may accidentally be exposed in source code, configuration, commits, build artifacts, or Git history.

Secrets are different from ordinary vulnerabilities.

A vulnerable library can often be patched.

A leaked credential may already be usable by an attacker.

Therefore:

> **Treat exposed secrets as potentially compromised credentials, not merely as code findings.**

---

# 1. What Is Secrets Scanning?

Secrets scanning looks for sensitive values in software repositories and development artifacts.

Typical targets include:

```text
Source Code
Configuration Files
Environment Files
Git Commits
Git History
Pull Requests
CI/CD Logs
Build Artifacts
Container Layers
Documentation
```

Examples of secrets:

```text
API Keys
Access Tokens
Cloud Credentials
Database Passwords
Private Keys
OAuth Secrets
JWT Signing Keys
SSH Keys
Webhook Secrets
Connection Strings
Certificates
Service Account Credentials
```

---

# 2. Why Secrets Scanning Matters

Consider:

```text
Developer
   │
   ▼
API Key accidentally committed
   │
   ▼
Git Repository
   │
   ▼
Public / Compromised Repository
   │
   ▼
Attacker
   │
   ▼
Unauthorized Access
```

The problem is not limited to the current file.

Git history may preserve the secret even after the developer deletes it.

```text
Commit 1 ── Secret Added
Commit 2 ── Secret Deleted
Commit 3 ── Current Code
                  │
                  ▼
            Git History
                  │
                  ▼
             Secret Still Exists
```

---

# 3. Secrets Scanning vs SAST

These controls overlap but have different purposes.

| SAST | Secrets Scanning |
|---|---|
| Finds insecure code patterns | Finds exposed secrets |
| SQL injection | API key |
| XSS | Password |
| Command injection | Private key |
| Unsafe deserialization | Cloud token |
| Data-flow analysis | Credential pattern detection |

A mature pipeline uses both:

```text
Code
 │
 ├── SAST
 │
 └── Secrets Scanning
```

---

# 4. Secrets Scanning vs SCA

SCA asks:

> What third-party components are we using and are they vulnerable?

Secrets scanning asks:

> Did sensitive credentials get exposed?

```text
SCA
 └── Dependency Risk

Secrets Scanning
 └── Credential Exposure
```

---

# 5. Types of Secrets

## API Keys

Example:

```text
API_KEY=xxxxxxxxxxxxxxxx
```

## Access Tokens

```text
ACCESS_TOKEN=xxxxxxxx
```

## Passwords

```text
DB_PASSWORD=xxxxxxxx
```

## Private Keys

```text
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
```

## Cloud Credentials

Examples include credentials for:

```text
AWS
Azure
Google Cloud
```

## Database Credentials

```text
postgres://user:password@host/database
```

## OAuth Secrets

```text
CLIENT_SECRET=xxxxxxxx
```

## Signing Keys

Used for:

```text
JWT
SAML
Certificates
Application Signing
```

---

# 6. Structured vs Unstructured Secrets

A secret can appear in structured configuration:

```yaml
database:
  password: "secret-value"
```

or unstructured source:

```java
String token = "secret-value";
```

Scanning tools need to support both.

---

# 7. High-Entropy Secrets

Some scanners use entropy analysis.

Conceptually:

```text
Random-looking String
        │
        ▼
High Entropy
        │
        ▼
Potential Secret
```

Example:

```text
a8F7kL9mQ2xP7vR4zT1n
```

High entropy does not prove that something is a secret.

Therefore:

```text
Entropy
+
Pattern
+
Context
=
Better Detection
```

---

# 8. Pattern-Based Detection

Many secrets have recognizable formats.

Conceptually:

```text
Pattern
   │
   ▼
Potential Credential
   │
   ▼
Context Validation
   │
   ▼
Finding
```

Examples:

```text
Private key headers
Cloud credential formats
Known token prefixes
Connection-string patterns
```

Exact patterns vary by provider and tool.

---

# 9. Generic vs Provider-Specific Detection

## Generic

Looks for:

```text
password=
secret=
token=
api_key=
```

This can produce many false positives.

## Provider-Specific

Looks for known credential formats associated with a service.

Provider-aware detection generally provides stronger signal.

---

# 10. False Positives

Example:

```text
password = "example-password"
```

This may be:

```text
Documentation
Test Data
Example Configuration
```

rather than a real credential.

A good scanner should provide mechanisms to:

- Validate findings
- Suppress false positives
- Mark test credentials
- Configure exclusions
- Use allowlists carefully

---

# 11. The Most Important Rule

If a real secret is discovered:

> **Assume it may be compromised.**

Do not simply:

```text
Delete the line
```

Instead:

```text
Detect
  │
  ▼
Revoke / Rotate
  │
  ▼
Remove from Source
  │
  ▼
Clean History if Required
  │
  ▼
Investigate Usage
  │
  ▼
Monitor
```

---

# 12. Secret Rotation

Suppose:

```text
AWS Credential
     │
     ▼
Committed to Git
```

Do:

```text
1. Revoke / Disable Credential
2. Create Replacement Credential
3. Update Application
4. Remove Old Credential
5. Scan Repository and History
6. Investigate Potential Use
```

The order matters.

Simply deleting the credential from the repository does not make the old credential safe.

---

# 13. Why Git History Matters

Consider:

```text
Commit A
   │
   └── secret.txt contains credential

Commit B
   │
   └── secret.txt deleted
```

Current working tree:

```text
No secret
```

Git history:

```text
Secret still available
```

Therefore:

> **Secrets scanning should consider history, not only the current branch.**

---

# 14. Git Objects and History

Git stores commits and objects.

Conceptually:

```text
Working Tree
     │
     ▼
Commit
     │
     ▼
Git Object Database
     │
     ▼
History
```

Removing a secret from the latest file does not automatically erase every historical object containing it.

---

# 15. Pre-Commit Scanning

One of the earliest controls is pre-commit scanning.

```text
Developer
    │
    ▼
git commit
    │
    ▼
Secret Scanner
    │
    ├── Secret Found ──► Block Commit
    │
    └── Clean ─────────► Commit
```

Advantages:

- Very fast feedback
- Secret prevented from entering repository history

Limitations:

- Can be bypassed
- Does not replace server-side scanning
- Developers may use multiple workflows

---

# 16. Pre-Push Scanning

Another option:

```text
Developer
   │
   ▼
git push
   │
   ▼
Secret Scan
   │
   ├── Finding ──► Block Push
   │
   └── Clean ────► Push
```

This provides another local control.

---

# 17. CI/CD Scanning

Server-side scanning is essential.

```text
Git Push
   │
   ▼
CI
   │
   ▼
Secrets Scanner
   │
   ├── Secret ──► Fail
   │
   └── Clean ───► Continue
```

This protects against:

- Bypassed local hooks
- New contributors
- Automation
- Alternative Git clients
- Direct pushes

---

# 18. Pull Request Scanning

A pull request can be scanned before merge.

```text
Pull Request
      │
      ▼
Secret Scan
      │
      ├── Finding ──► Block / Review
      │
      └── Clean ────► Merge
```

This is one of the most useful controls for preventing secrets from reaching the main branch.

---

# 19. Repository History Scanning

A periodic full scan can inspect history.

```text
Repository
    │
    ▼
All Branches
    │
    ▼
Git History
    │
    ▼
Secret Scanner
    │
    ▼
Potential Exposure
```

This is important for legacy repositories.

---

# 20. Gitleaks

**Gitleaks** is a widely used open-source secret-scanning tool.

Conceptually:

```text
Git Repository
      │
      ▼
Gitleaks
      │
      ├── Current Files
      ├── Commits
      └── Git History
      │
      ▼
Findings
```

It can be used in:

- Local development
- Git hooks
- CI/CD
- Repository audits

---

# 21. TruffleHog

**TruffleHog** is another commonly used secrets-detection tool.

A conceptual workflow:

```text
Repository
    │
    ▼
TruffleHog
    │
    ├── Pattern Detection
    ├── Entropy / Heuristics
    └── Verification Capabilities
    │
    ▼
Potential Secrets
```

It is useful for repository and history scanning.

---

# 22. GitHub Secret Scanning

GitHub provides **Secret Scanning** for supported repositories and plans.

Conceptually:

```text
GitHub Repository
       │
       ▼
Secret Scanning
       │
       ├── Pattern Detection
       ├── Push Protection
       └── Alerts
```

A major benefit is platform-level integration.

---

# 23. GitHub Push Protection

Push protection can prevent certain secrets from being pushed.

Conceptually:

```text
git push
   │
   ▼
GitHub
   │
   ▼
Secret Detection
   │
   ├── Secret Detected
   │       │
   │       ▼
   │   Push Blocked
   │
   └── Clean
           │
           ▼
        Push Accepted
```

This is stronger than discovering the secret only after it reaches the remote repository.

---

# 24. Provider Verification

Some secret scanners can verify whether a detected credential is active.

Conceptually:

```text
Potential Secret
       │
       ▼
Verification
       │
   ┌───┴────┐
   │        │
Active    Invalid
   │        │
   ▼        ▼
Critical   Lower
Priority   Priority
```

Verification must be performed carefully to avoid triggering harmful actions or exposing the secret further.

---

# 25. Secret Exposure Severity

A useful model:

```text
Detected String
      │
      ▼
Is it a real secret?
      │
   ┌──┴───┐
   │      │
 No      Yes
   │      │
   ▼      ▼
Ignore   Is it active?
             │
          ┌──┴───┐
          │      │
         No     Yes
          │      │
          ▼      ▼
       Review   Urgent
```

Additional factors:

- Privilege
- Scope
- Environment
- Expiration
- Exposure duration
- Internet exposure
- Potential blast radius

---

# 26. Secret Scope

Not all credentials have equal impact.

Example:

```text
Read-only API Key
      │
      ▼
Limited Scope
```

versus:

```text
Cloud Administrator Credential
      │
      ▼
Broad Privileges
```

Risk depends heavily on privilege and scope.

---

# 27. Least Privilege

Secrets should have only the permissions they need.

Bad:

```text
Application
   │
   ▼
Administrator Credential
   │
   ▼
Everything
```

Better:

```text
Application
   │
   ▼
Application-Specific Identity
   │
   ▼
Required Permissions Only
```

Secret scanning detects exposure, while IAM and access-control practices reduce blast radius.

---

# 28. Static Secrets vs Dynamic Credentials

## Static Secret

```text
API Key
   │
   ▼
Stored
   │
   ▼
Reused
```

## Dynamic Credential

```text
Application
   │
   ▼
Identity Provider / Secret System
   │
   ▼
Short-Lived Credential
   │
   ▼
Use
   │
   ▼
Expire
```

Dynamic credentials generally reduce long-term credential exposure.

---

# 29. Secret Management

Instead of:

```text
Source Code
   │
   └── PASSWORD=secret
```

Use:

```text
Application
     │
     ▼
Secret Manager
     │
     ▼
Runtime Secret
```

Common secret-management technologies include:

- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager
- Kubernetes Secrets with appropriate protection
- Enterprise secret-management platforms

---

# 30. Environment Variables

A common pattern is:

```text
Application
    │
    ▼
Environment Variable
    │
    ▼
Runtime Credential
```

Example:

```text
DATABASE_PASSWORD
```

This is generally preferable to hardcoding secrets in source.

However:

> **Environment variables are not automatically a complete secret-management solution.**

They can appear in logs, process inspection, debugging output, or deployment configuration if handled carelessly.

---

# 31. Kubernetes Secrets

Kubernetes supports Secret objects.

Conceptually:

```text
Secret Store / CI
       │
       ▼
Kubernetes Secret
       │
       ▼
Pod
       │
       ▼
Application
```

Important:

> Kubernetes Secret objects should not be treated as automatically secure simply because the value is represented as a Secret.

Organizations should protect:

- etcd
- RBAC
- Encryption at rest
- Access
- Audit logs
- Secret delivery

External secret-management integrations can provide stronger operational controls.

---

# 32. Secret Manager Pattern

A stronger cloud-native architecture:

```text
                    Secret Manager
                          │
                          ▼
                    Application
                          │
                          ▼
                       Runtime
```

The application authenticates using an identity rather than embedding a long-lived credential.

Example:

```text
Workload Identity
      │
      ▼
Secret Manager
      │
      ▼
Database Credential
```

---

# 33. CI/CD Secrets

CI/CD systems often need credentials.

Examples:

```text
Cloud Credentials
Registry Credentials
Signing Keys
Deployment Tokens
Package Registry Tokens
API Tokens
```

Do not place them directly in workflow files.

Bad:

```yaml
env:
  TOKEN: "actual-secret"
```

Better:

```text
CI/CD Secret Store
        │
        ▼
Workflow
        │
        ▼
Runtime Injection
```

---

# 34. Secret Masking

CI/CD systems should mask secrets in logs.

Conceptually:

```text
Secret
  │
  ▼
Command
  │
  ▼
Log
  │
  ▼
Masked Value
```

But masking is not a substitute for safe scripting.

Avoid:

```bash
echo "$SECRET"
```

and avoid accidentally including secrets in command output.

---

# 35. Logs Can Leak Secrets

Potential leakage paths include:

```text
Application Logs
CI Logs
Debug Logs
Error Messages
HTTP Traces
Monitoring
Screenshots
Support Tickets
```

Example:

```text
Authorization: Bearer <token>
```

must not be written to logs.

---

# 36. Secret Exposure Through Errors

Bad:

```text
Exception:
Connection failed:
postgres://admin:password@database
```

Better:

```text
Database connection failed
```

Error handling should avoid revealing credentials.

---

# 37. Secrets in URLs

Avoid putting credentials in URLs.

Bad:

```text
https://user:password@example.com
```

URLs can be captured by:

```text
Logs
Browser History
Proxy Logs
Monitoring
Tracing
Analytics
```

Use secure authentication mechanisms instead.

---

# 38. Secrets in Configuration Files

Bad:

```yaml
database:
  username: admin
  password: real-password
```

Better:

```yaml
database:
  username: ${DB_USERNAME}
  password: ${DB_PASSWORD}
```

And inject values securely at runtime.

---

# 39. Secrets in Dockerfiles

Bad:

```dockerfile
ENV API_KEY=real-secret
```

This can create image-layer and metadata exposure.

Better approaches include:

```text
Runtime Secret Injection
BuildKit Secret Mounts
External Secret Management
Workload Identity
```

Build-time secrets should be handled carefully so they do not become part of the final image.

---

# 40. Docker Image History

A dangerous pattern:

```dockerfile
RUN echo "secret" > /tmp/key
RUN rm /tmp/key
```

Deleting the file later does not necessarily mean the secret was absent from previous image layers.

Therefore:

> **Never assume that deleting a secret in a later Docker layer removes the historical exposure.**

---

# 41. GitHub Actions Secrets

A conceptual workflow:

```yaml
steps:
  - name: Deploy
    env:
      API_TOKEN: ${{ secrets.API_TOKEN }}
    run: ./deploy.sh
```

The secret is supplied at runtime rather than committed to the repository.

Additional controls should include:

- Least privilege
- Environment protection
- Restricted workflows
- Review of untrusted pull requests
- Secret rotation

---

# 42. Forked Pull Requests

Fork-based workflows require special care.

A pull request from an untrusted fork should not automatically receive privileged secrets.

Conceptually:

```text
External PR
    │
    ▼
Workflow
    │
    ├── Untrusted Code
    │
    └── Privileged Secrets
             │
             ▼
        Dangerous
```

CI/CD workflows should be designed so untrusted code cannot freely access sensitive credentials.

---

# 43. Secret Injection Threat

Consider:

```text
Pull Request
   │
   ▼
Malicious Code
   │
   ▼
CI Runner
   │
   ▼
Secret Available
   │
   ▼
Exfiltration
```

Therefore:

> **Secret security is also CI/CD security.**

---

# 44. Secret Rotation Strategy

A practical rotation lifecycle:

```text
Create
  │
  ▼
Store Securely
  │
  ▼
Use
  │
  ▼
Monitor
  │
  ▼
Rotate
  │
  ▼
Revoke Old Credential
```

For highly privileged credentials, shorter lifetimes are generally preferable.

---

# 45. Emergency Secret Rotation

When a secret is discovered in Git:

```text
1. STOP treating it as trusted
2. Identify credential owner
3. Revoke / disable
4. Create replacement
5. Update consumers
6. Remove secret from source
7. Scan Git history
8. Investigate access logs
9. Assess blast radius
10. Document incident
```

Do not wait for repository cleanup before revoking an active credential.

---

# 46. Git History Cleanup

Sometimes organizations need to remove secrets from Git history.

Possible approaches include history-rewriting tools such as:

```text
git filter-repo
```

History rewriting must be planned carefully because it affects:

- Commit hashes
- Branches
- Clones
- Forks
- Tags
- Developer workflows

And:

> **History cleanup does not replace credential rotation.**

---

# 47. Secret Scanning Scope

A mature program scans:

```text
Current Files
     +
Git History
     +
Pull Requests
     +
Branches
     +
CI/CD
     +
Artifacts
     +
Container Images
```

Exact coverage depends on the organization and toolset.

---

# 48. Secret Detection Lifecycle

```text
                    DETECT
                      │
                      ▼
                 VALIDATE
                      │
             ┌────────┴────────┐
             │                 │
          False             Real
          Positive           Secret
             │                 │
             ▼                 ▼
          Suppress          Revoke
                               │
                               ▼
                            Rotate
                               │
                               ▼
                             Remove
                               │
                               ▼
                           Investigate
                               │
                               ▼
                            Monitor
```

---

# 49. Secrets Scanning Policy

An organization should define:

```text
What counts as a secret?
What repositories are scanned?
Are Git histories scanned?
Are pushes blocked?
Which findings block CI?
Who owns incidents?
How quickly must secrets be rotated?
How are exceptions handled?
How are false positives managed?
```

---

# 50. Blocking Policy

A practical policy:

```text
Secret Detected in New Code
          │
          ▼
       Block PR
```

For historical findings:

```text
Existing Secret
      │
      ▼
Incident / Remediation Workflow
```

Avoid blocking the entire repository indefinitely because of old findings without a remediation strategy.

---

# 51. Baselines

Legacy repositories may contain many findings.

A baseline can separate:

```text
Historical Findings
        │
        └── Remediation Backlog

New Findings
        │
        └── Block / Review
```

But real credentials should still be rotated even if they are "baseline" findings.

---

# 52. Secret Allowlisting

Some strings are intentionally public or non-sensitive.

Examples:

```text
Public API Identifier
Test Placeholder
Documentation Example
Dummy Token
```

Allowlisting can reduce noise.

However:

> **Avoid broad allowlists that hide entire files or directories unless there is a strong reason.**

Prefer precise, auditable exclusions.

---

# 53. Test Credentials

Test credentials can still create risk.

Bad:

```text
test-user / real-production-password
```

Better:

```text
Disposable Test Credential
```

Ideally:

```text
Test Environment
   │
   ▼
Synthetic Credentials
   │
   ▼
Limited Permissions
```

Never use production credentials for ordinary tests.

---

# 54. Secret Scanning in CI/CD Architecture

```text
                   Git Repository
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       Pre-Commit      Pull Request     CI
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  Secret Scanner
                         │
                         ▼
                     Findings
                         │
               ┌─────────┴─────────┐
               │                   │
             Block              Alert
               │                   │
               ▼                   ▼
          Developer             Security
```

---

# 55. Recommended Tooling

Common tools include:

| Tool | Typical Use |
|---|---|
| **Gitleaks** | Git repository and history secret detection |
| **TruffleHog** | Secret discovery and verification-oriented scanning |
| **GitHub Secret Scanning** | Platform-integrated repository secret detection |
| **GitHub Push Protection** | Prevent certain secrets from being pushed |
| **GitLab Secret Detection** | GitLab-integrated secret scanning |
| **Detect Secrets** | Open-source secret detection |
| **Cloud-provider secret scanners** | Provider-specific credential detection |

Tool capabilities and licensing change over time, so validate current features for your environment.

---

# 56. Choosing a Secret Scanner

Consider:

```text
Detection Accuracy
        │
        ▼
Provider Coverage
        │
        ▼
Git History Support
        │
        ▼
Verification
        │
        ▼
CI/CD Integration
        │
        ▼
Developer Experience
        │
        ▼
False Positive Controls
        │
        ▼
Enterprise Governance
```

---

# 57. Gitleaks in CI

Conceptual workflow:

```text
Git Push
   │
   ▼
Checkout
   │
   ▼
Gitleaks
   │
   ├── Secret Found ──► Fail
   │
   └── Clean ─────────► Continue
```

Example structure:

```yaml
name: Secret Scan

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  secrets:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run secret scan
        run: |
          echo "Run approved secret scanner here"
```

For production, use the selected scanner's official action or CLI and apply the organization's action-pinning policy.

---

# 58. Git Hooks

A local hook can provide fast feedback.

Conceptually:

```text
.git/hooks/pre-commit
        │
        ▼
Secret Scanner
        │
        ├── Finding ──► Commit Blocked
        │
        └── Clean ────► Commit Allowed
```

This is useful but should not be the only control.

---

# 59. CI Logs and Secrets

Avoid commands such as:

```bash
set -x
```

when secret-bearing variables are in scope.

Also avoid:

```bash
curl -H "Authorization: Bearer $TOKEN" ...
```

if the command or tool could echo the full request.

Prefer tools and CI features that support secret masking and safe logging.

---

# 60. Secret Leakage Through Artifacts

A secret may enter:

```text
Build Artifact
Test Report
Coverage Report
Debug Bundle
Archive
Log File
```

Example:

```text
build/
 ├── report.html
 └── config-dump.txt
```

Scanning should consider generated artifacts where appropriate.

---

# 61. Secret Leakage Through Source Maps

Frontend applications can accidentally expose sensitive information through:

```text
JavaScript Bundles
Source Maps
Configuration
Embedded Tokens
```

A secret embedded in client-side code should be considered public because users can retrieve browser-delivered code.

---

# 62. Frontend Secrets

Important principle:

> **Anything delivered to a browser should be assumed visible to the user.**

Therefore:

```text
Browser
   │
   └── Public Configuration
```

while:

```text
Backend
   │
   └── Secret Credentials
```

Sensitive credentials should normally remain server-side.

---

# 63. Secret Scanning and Infrastructure as Code

IaC files can contain secrets.

Examples:

```text
Terraform
CloudFormation
Kubernetes YAML
Helm Values
Ansible
```

Bad:

```yaml
password: real-secret
```

Better:

```text
Reference Secret Manager
```

Secrets scanning should cover infrastructure repositories as well.

---

# 64. Secret Scanning and Terraform

Avoid:

```hcl
password = "actual-password"
```

Prefer:

```text
Terraform
   │
   ▼
Secret Manager
   │
   ▼
Runtime / Resource
```

Also protect Terraform state because state files can contain sensitive values.

---

# 65. Secret Scanning and Terraform State

A common mistake is:

```text
terraform.tfstate
```

being treated as harmless.

State can contain sensitive configuration.

Controls include:

- Secure remote state
- Encryption
- Access control
- Audit logging
- Restricted storage
- Avoiding unnecessary secret persistence

---

# 66. Secret Scanning and Kubernetes

Avoid storing plaintext credentials in:

```text
values.yaml
deployment.yaml
```

Instead use controlled secret references.

A stronger pattern is:

```text
External Secret Manager
          │
          ▼
External Secrets Integration
          │
          ▼
Kubernetes Secret
          │
          ▼
Pod
```

---

# 67. Secret Scanning and Cloud Credentials

Cloud credentials deserve special attention because compromise can create broad access.

Prefer:

```text
Workload Identity
       │
       ▼
Cloud API
```

over:

```text
Static Cloud Access Key
       │
       ▼
Application
```

Where supported, short-lived identity-based credentials reduce long-lived secret exposure.

---

# 68. Secret Scanning and Service Accounts

Service accounts should follow:

```text
Least Privilege
+
Short Credential Lifetime
+
Restricted Scope
+
Rotation
+
Monitoring
```

A leaked low-privilege service identity is generally less damaging than a leaked administrator identity.

---

# 69. Secret Exposure Monitoring

After rotation, investigate whether the credential was used.

Conceptually:

```text
Secret Exposed
     │
     ▼
Credential Logs
     │
     ▼
Usage Analysis
     │
     ├── No Suspicious Activity
     │
     └── Suspicious Activity
              │
              ▼
         Incident Response
```

Examples of telemetry:

```text
Cloud Audit Logs
API Access Logs
Authentication Logs
Database Audit Logs
```

---

# 70. Secret Incident Response

A secrets incident may follow:

```text
Detection
   │
   ▼
Containment
   │
   ▼
Credential Revocation
   │
   ▼
Rotation
   │
   ▼
Evidence Collection
   │
   ▼
Impact Assessment
   │
   ▼
Eradication
   │
   ▼
Recovery
   │
   ▼
Lessons Learned
```

---

# 71. Secret Blast Radius

Ask:

```text
What can this credential access?
```

For example:

```text
Credential
   │
   ├── Production
   ├── Development
   ├── Database
   ├── Storage
   └── CI/CD
```

The more systems a credential can access, the larger the blast radius.

---

# 72. Secret Inventory

Organizations should know:

```text
Which secrets exist?
Where are they stored?
Who owns them?
Which applications use them?
When were they created?
When do they expire?
How are they rotated?
```

Secret management systems can provide this inventory more reliably than repository scanning alone.

---

# 73. Secrets Scanning Limitations

Secret scanners cannot guarantee detection of every secret.

Reasons include:

- Unknown formats
- Encoded secrets
- Encrypted content
- Custom credential formats
- Secrets split across files
- Dynamic generation
- False positives
- Secrets outside scanned systems

Therefore:

```text
Secret Scanning
+
Secret Management
+
Least Privilege
+
Rotation
+
Monitoring
```

is stronger than scanning alone.

---

# 74. Common Anti-Patterns

## Anti-Pattern 1: Delete the Secret and Do Nothing Else

Wrong:

```text
Delete Secret
```

Correct:

```text
Revoke
+
Rotate
+
Remove
+
Investigate
```

## Anti-Pattern 2: Scan Only the Current Branch

Git history may contain secrets.

## Anti-Pattern 3: Store Production Secrets in .env

`.env` files can be accidentally committed.

## Anti-Pattern 4: Put Secrets in Dockerfiles

Image layers can preserve them.

## Anti-Pattern 5: Put Secrets in Frontend Code

Browser-delivered code is visible.

## Anti-Pattern 6: Use Long-Lived Administrator Credentials

This increases blast radius.

## Anti-Pattern 7: Trust CI Masking

Masked logs do not make an exposed credential safe.

## Anti-Pattern 8: Ignore Historical Secrets

An old credential may still be active.

---

# 75. Best Practices

## Detection

- Scan before commit.
- Scan pull requests.
- Scan CI/CD.
- Scan Git history.
- Scan infrastructure repositories.
- Scan artifacts where appropriate.

## Prevention

- Use secret managers.
- Use short-lived credentials.
- Use workload identities.
- Apply least privilege.
- Enable push protection where available.

## Response

- Revoke exposed credentials.
- Rotate credentials.
- Investigate usage.
- Remove secrets from source.
- Clean history when necessary.
- Document incidents.

---

# 76. Enterprise Secrets Architecture

A strong architecture:

```text
                    Developer
                        │
                        ▼
                 Local Secret Scan
                        │
                        ▼
                    Git Push
                        │
                        ▼
                 Platform Protection
                        │
                        ▼
                  Pull Request Scan
                        │
                        ▼
                     CI/CD
                        │
                        ▼
                 Secret Management
                        │
              ┌─────────┼─────────┐
              │         │         │
              ▼         ▼         ▼
           Vault     Cloud SM   Key Vault
              │         │         │
              └─────────┼─────────┘
                        ▼
                     Runtime
                        │
                        ▼
                    Monitoring
```

---

# 77. Secret Lifecycle

```text
CREATE
  │
  ▼
STORE
  │
  ▼
DISTRIBUTE
  │
  ▼
USE
  │
  ▼
MONITOR
  │
  ▼
ROTATE
  │
  ▼
REVOKE
  │
  ▼
DESTROY
```

Security should cover the complete lifecycle.

---

# 78. Secrets Scanning Maturity Model

## Level 1 — Manual

```text
Developers Search for Secrets
```

## Level 2 — CI Scanning

```text
Pipeline
   │
   └── Secret Scanner
```

## Level 3 — Developer Prevention

```text
Pre-Commit
+
PR
+
CI
```

## Level 4 — Platform Protection

```text
Push Protection
+
Centralized Alerts
```

## Level 5 — Secret Management

```text
Secret Scanner
+
Vault / Cloud Secret Manager
+
Rotation
+
Least Privilege
```

## Level 6 — Identity-Based Security

```text
Workload Identity
+
Short-Lived Credentials
+
Automated Rotation
+
Continuous Monitoring
```

---

# 79. Metrics

Useful metrics include:

## Secret Detection Rate

```text
Secrets Detected
----------------
Scans Performed
```

## Mean Time to Revoke

```text
Detection
   │
   ▼
Credential Revoked
```

This is one of the most important incident metrics.

## Mean Time to Remediate

```text
Detection
   │
   ▼
Source Cleaned
```

## Secret-Free PR Rate

Track how many PRs pass secret checks without remediation.

## Historical Exposure

Track outstanding credentials found in repository history.

---

# 80. Practical GitHub Workflow

```text
Developer
   │
   ▼
Create Code
   │
   ▼
Pre-Commit Secret Scan
   │
   ▼
Push
   │
   ▼
GitHub Push Protection
   │
   ▼
Pull Request
   │
   ▼
Secret Scan
   │
   ▼
SAST + SCA
   │
   ▼
Review
   │
   ▼
Merge
   │
   ▼
Deploy
```

This creates multiple defensive layers.

---

# 81. Practical Incident Example

Suppose a developer accidentally commits:

```text
CLOUD_ACCESS_KEY=real-secret
```

The scanner reports:

```text
Secret detected
```

Correct response:

```text
Scanner Alert
     │
     ▼
Identify Credential
     │
     ▼
Revoke Credential
     │
     ▼
Create Replacement
     │
     ▼
Update Application
     │
     ▼
Remove Secret from Code
     │
     ▼
Check Git History
     │
     ▼
Check Cloud Audit Logs
     │
     ▼
Assess Unauthorized Activity
```

The important lesson:

> **Repository cleanup is not credential remediation.**

---

# 82. Secrets Scanning Decision Framework

When a finding appears:

```text
1. Is this actually a secret?
          │
          ▼
2. Is it active?
          │
          ▼
3. What privilege does it have?
          │
          ▼
4. Where has it been exposed?
          │
          ▼
5. Is it present in Git history?
          │
          ▼
6. Can it be revoked immediately?
          │
          ▼
7. What systems could it access?
          │
          ▼
8. Is suspicious usage visible?
          │
          ▼
9. Does history need cleanup?
          │
          ▼
10. What control prevents recurrence?
```

---

# 83. Final Secrets Scanning Mental Model

```text
                     SECRET
                       │
                       ▼
                    DETECT
                       │
             ┌─────────┴─────────┐
             │                   │
          Current             History
             │                   │
             └─────────┬─────────┘
                       ▼
                    VALIDATE
                       │
                       ▼
                  REAL SECRET?
                       │
                       ▼
                    REVOKE
                       │
                       ▼
                    ROTATE
                       │
                       ▼
                    REMOVE
                       │
                       ▼
                INVESTIGATE
                       │
                       ▼
                 CLEAN HISTORY
                       │
                       ▼
                    MONITOR
                       │
                       ▼
                  PREVENT AGAIN
```

---

# 84. Quick Reference

```text
SECRETS SCANNING
│
├── Detect
│   ├── API Keys
│   ├── Tokens
│   ├── Passwords
│   ├── Private Keys
│   ├── Cloud Credentials
│   └── Connection Strings
│
├── Locations
│   ├── Source
│   ├── Git History
│   ├── Pull Requests
│   ├── CI/CD
│   ├── Artifacts
│   ├── Containers
│   └── IaC
│
├── Techniques
│   ├── Pattern Matching
│   ├── Entropy
│   ├── Provider Detection
│   └── Verification
│
├── Tools
│   ├── Gitleaks
│   ├── TruffleHog
│   ├── GitHub Secret Scanning
│   ├── GitHub Push Protection
│   └── Other Platform Scanners
│
├── Prevention
│   ├── Secret Managers
│   ├── Least Privilege
│   ├── Short-Lived Credentials
│   ├── Workload Identity
│   └── Push Protection
│
└── Response
    ├── Revoke
    ├── Rotate
    ├── Remove
    ├── Investigate
    ├── Monitor
    └── Prevent Recurrence
```

---

# 85. Key Takeaway

> **Secrets scanning detects exposed credentials, but secure secret management prevents those credentials from becoming a long-term security problem.**

Remember:

```text
DON'T:
Source Code
    │
    └── Secret

DO:
Application
    │
    ▼
Identity / Secret Manager
    │
    ▼
Short-Lived Runtime Credential
```

And when a real credential is exposed:

```text
DETECT
  ↓
REVOKE
  ↓
ROTATE
  ↓
REMOVE
  ↓
INVESTIGATE
  ↓
MONITOR
  ↓
PREVENT
```

The strongest DevSecOps approach combines:

```text
Secrets Scanning
        +
Secret Management
        +
Least Privilege
        +
Short-Lived Credentials
        +
CI/CD Protection
        +
Git History Scanning
        +
Monitoring
```

---

# 86. Related Knowledge

- [`README.md`](README.md)
- [`devsecops.md`](devsecops.md)
- [`sast.md`](sast.md)
- [`sca.md`](sca.md)
- [`dast.md`](dast.md)
- [`container-scanning.md`](container-scanning.md)
