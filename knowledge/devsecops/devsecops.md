# DevSecOps

> **DevSecOps** integrates security into the Development and Operations lifecycle so that security becomes a continuous, automated, shared responsibility rather than a final checkpoint before production.

DevSecOps combines:

```text
Development
     +
Security
     +
Operations
     +
Automation
     +
Continuous Feedback
```

The fundamental objective is:

> **Build secure software, detect security risks early, automate security controls where practical, and continuously manage security throughout the application's lifecycle.**

---

# 1. What Is DevSecOps?

Traditional software delivery often looked like:

```text
Plan
  ↓
Develop
  ↓
Build
  ↓
Test
  ↓
Security Review
  ↓
Deploy
  ↓
Operate
```

Security was frequently concentrated near the end.

DevSecOps changes the model:

```text
                 SECURITY
                    │
                    ▼
Plan ──► Code ──► Build ──► Test ──► Release ──► Operate
  ▲       ▲        ▲         ▲          ▲           ▲
  │       │        │         │          │           │
  └───────┴────────┴─────────┴──────────┴───────────┘
                    CONTINUOUS FEEDBACK
```

Security controls are introduced throughout the lifecycle.

---

# 2. DevSecOps vs DevOps

## DevOps

DevOps focuses on improving collaboration and automation between development and operations.

```text
Development
     │
     ▼
    CI/CD
     │
     ▼
 Operations
```

## DevSecOps

DevSecOps adds security as an integrated responsibility.

```text
             Security
                │
                ▼
Development ──► CI/CD ──► Operations
```

The goal is not to create a completely separate security pipeline.

Instead:

> **Security controls become part of the existing software delivery pipeline.**

---

# 3. Core DevSecOps Principles

The major principles are:

1. Shift Left
2. Automate Security
3. Security as Code
4. Continuous Security
5. Shared Responsibility
6. Risk-Based Decisions
7. Defense in Depth
8. Secure Software Supply Chain
9. Developer Enablement
10. Continuous Improvement

---

# 4. Shift Left

**Shift Left** means identifying security issues earlier in the development lifecycle.

Traditional model:

```text
Developer
   │
   ▼
Build
   │
   ▼
Test
   │
   ▼
Security Review
   │
   ▼
Production
```

Shift-left model:

```text
Developer
   │
   ├── Secure Coding
   ├── Secrets Scanning
   ├── SAST
   └── Dependency Checks
        │
        ▼
      Build
        │
        ├── SCA
        └── Container Scan
        │
        ▼
      Test
        │
        └── DAST
        │
        ▼
    Production
```

The earlier a vulnerability is found, the easier it is generally to understand and fix.

---

# 5. Shift Everywhere

Shift-left should not mean:

> "Security happens only during coding."

A mature DevSecOps model applies security throughout the lifecycle.

```text
PLAN
 │
 ├── Threat Modeling
 ├── Security Requirements
 └── Risk Assessment
 │
 ▼
CODE
 │
 ├── Secure Coding
 ├── SAST
 └── Secrets Scanning
 │
 ▼
BUILD
 │
 ├── SCA
 ├── SBOM
 └── Container Scanning
 │
 ▼
TEST
 │
 ├── DAST
 ├── Security Tests
 └── Penetration Testing
 │
 ▼
RELEASE
 │
 ├── Security Gates
 ├── Artifact Verification
 └── Deployment Controls
 │
 ▼
OPERATE
 │
 ├── Monitoring
 ├── Vulnerability Management
 └── Incident Response
```

---

# 6. Secure SDLC

DevSecOps is closely related to the **Secure Software Development Lifecycle (SSDLC)**.

A simplified lifecycle is:

```text
Requirements
     │
     ▼
Design
     │
     ▼
Development
     │
     ▼
Build
     │
     ▼
Testing
     │
     ▼
Release
     │
     ▼
Deployment
     │
     ▼
Operations
     │
     ▼
Retirement
```

Security activities should be associated with each stage.

---

# 7. Security in the Planning Stage

Security should begin before code is written.

Activities include:

- Security requirements
- Risk assessment
- Threat modeling
- Data classification
- Compliance requirements
- Authentication requirements
- Authorization requirements
- Privacy considerations
- Security architecture

Example:

```text
Business Requirement
       │
       ▼
Security Requirement
       │
       ▼
Architecture Decision
       │
       ▼
Implementation
```

---

# 8. Threat Modeling

Threat modeling asks:

> **"How could this system be attacked, and what can we do about those threats?"**

A simplified process is:

```text
System
  │
  ▼
Identify Assets
  │
  ▼
Identify Entry Points
  │
  ▼
Identify Threats
  │
  ▼
Assess Risk
  │
  ▼
Define Mitigations
  │
  ▼
Implement Controls
```

Threat modeling can identify security requirements before implementation.

Common approaches include STRIDE and attack-tree analysis.

---

# 9. Security Architecture

Security architecture considers how components interact.

Example:

```text
Internet
   │
   ▼
WAF / CDN
   │
   ▼
API Gateway
   │
   ▼
Application
   │
   ├──────────► Authentication
   │
   ├──────────► Authorization
   │
   ▼
Database
```

Security architecture should address:

- Trust boundaries
- Identity
- Network segmentation
- Encryption
- Secrets
- Data protection
- Logging
- Monitoring
- Availability
- Failure behavior

---

# 10. Secure Coding

Developers should implement security controls directly in application code.

Important areas include:

- Input validation
- Output encoding
- Authentication
- Authorization
- Session management
- Error handling
- Secure cryptography
- Secure file handling
- Secure API design
- Dependency management

Security should not rely entirely on scanners.

> **Automated tools find many problems, but secure design and secure coding prevent them from being introduced.**

---

# 11. Source Code Security

Source code can be analyzed using SAST.

```text
Source Code
     │
     ▼
    SAST
     │
     ▼
Security Findings
     │
     ▼
Developer Fix
```

Common SAST capabilities include detection of:

- Injection patterns
- Unsafe APIs
- Weak cryptography
- Security-sensitive coding errors
- Dangerous data flows
- Hardcoded credentials
- Insecure configuration

See:

**[`sast.md`](sast.md)**

---

# 12. Secrets Security

Secrets should never be committed into source repositories.

Examples include:

```text
API Keys
Passwords
Cloud Credentials
Private Keys
Tokens
Database Credentials
Certificates
```

A DevSecOps pipeline can use secrets scanning:

```text
Git Commit
    │
    ▼
Secrets Scan
    │
    ├── Secret Found ──► Block
    │
    └── Clean ─────────► Continue
```

Dedicated secrets scanning should complement secure secret storage and runtime secret injection.

See:

**[`secrets-scanning.md`](secrets-scanning.md)**

---

# 13. Dependency Security

Modern applications depend on third-party libraries.

Example:

```text
Application
    │
    ├── Framework
    ├── Authentication Library
    ├── HTTP Client
    ├── Logging Library
    └── Database Driver
```

A vulnerability in a dependency can affect the application.

SCA helps identify:

- Vulnerable dependencies
- Transitive dependencies
- Known CVEs
- Outdated components
- License risks
- Dependency relationships

See:

**[`sca.md`](sca.md)**

---

# 14. Container Security

Applications are increasingly packaged as containers.

A container may contain:

```text
Application
   +
Runtime
   +
Libraries
   +
OS Packages
   +
Configuration
```

Container scanning can identify vulnerabilities and misconfigurations.

```text
Container Build
      │
      ▼
Container Scan
      │
      ▼
Security Gate
```

See:

**[`container-scanning.md`](container-scanning.md)**

---

# 15. Dynamic Application Security Testing

DAST tests the application while it is running.

```text
Application
     │
     ▼
Deploy to Test
     │
     ▼
DAST
     │
     ├── Crawl
     ├── Passive Scan
     ├── Active Scan
     └── API Testing
     │
     ▼
Security Findings
```

DAST can identify runtime weaknesses that may not be visible through source-code analysis.

See:

**[`dast.md`](dast.md)**

---

# 16. Core DevSecOps Security Controls

A practical DevSecOps program commonly combines:

| Security Control | Main Question |
|---|---|
| Threat Modeling | How could the system be attacked? |
| Secure Coding | Is the application designed and coded securely? |
| SAST | Is the source code vulnerable? |
| Secrets Scanning | Did someone expose a credential? |
| SCA | Are dependencies vulnerable? |
| IaC Scanning | Is infrastructure configuration insecure? |
| Container Scanning | Is the image vulnerable or misconfigured? |
| SBOM | What components are inside the software? |
| DAST | Is the running application vulnerable? |
| Penetration Testing | Can a skilled attacker exploit the system? |
| Runtime Monitoring | What is happening in production? |

---

# 17. DevSecOps CI/CD Pipeline

A complete pipeline can look like:

```text
                         Developer
                             │
                             ▼
                         Git Push
                             │
                             ▼
                    ┌─────────────────┐
                    │ Secrets Scanning│
                    └────────┬────────┘
                             │
                             ▼
                           SAST
                             │
                             ▼
                            SCA
                             │
                             ▼
                           Build
                             │
                             ▼
                       Unit Tests
                             │
                             ▼
                    Container Build
                             │
                             ▼
                  Container Scanning
                             │
                             ▼
                           SBOM
                             │
                             ▼
                       Security Gate
                             │
                             ▼
                       Push Artifact
                             │
                             ▼
                     Deploy to Test
                             │
                             ▼
                            DAST
                             │
                             ▼
                       Security Gate
                             │
                             ▼
                         Staging
                             │
                             ▼
                    Approval / Policy
                             │
                             ▼
                       Production
                             │
                             ▼
                 Monitor / Respond / Improve
```

---

# 18. Pull Request Security

A pull request is an excellent place for fast security feedback.

Typical checks:

```text
Pull Request
     │
     ├── Secrets Scan
     ├── SAST
     ├── SCA
     ├── IaC Scan
     └── Unit / Security Tests
```

The goal is fast feedback.

A developer should ideally learn about a security problem before the change is merged.

---

# 19. Build-Time Security

During the build:

```text
Source
  │
  ▼
Compile
  │
  ├── Dependency Check
  ├── SCA
  ├── SAST
  └── Security Tests
  │
  ▼
Artifact
```

Artifacts may include:

- JAR files
- WAR files
- NPM packages
- Python packages
- Container images
- Binary artifacts

---

# 20. Artifact Security

The artifact produced by CI/CD should be treated as a security-sensitive object.

A mature supply chain can look like:

```text
Source
  │
  ▼
Build
  │
  ▼
Test
  │
  ▼
Scan
  │
  ▼
SBOM
  │
  ▼
Sign
  │
  ▼
Registry
  │
  ▼
Verify
  │
  ▼
Deploy
```

This creates stronger confidence that the artifact being deployed is the artifact that was built and approved.

---

# 21. Software Supply Chain Security

Modern software depends on many external components:

```text
Developer
   │
   ▼
Source Repository
   │
   ├── Dependencies
   ├── Build Tools
   ├── CI/CD Actions
   ├── Container Images
   └── External Services
```

Each dependency creates potential supply-chain risk.

Important controls include:

- Dependency pinning
- Dependency scanning
- Trusted package repositories
- SBOM
- Artifact signing
- Provenance
- Protected CI/CD
- Least privilege
- Secrets protection

---

# 22. SBOM

**SBOM = Software Bill of Materials**

An SBOM describes the components contained in software.

Example:

```text
Application
│
├── Java 21
├── Spring Framework
├── Jackson
├── PostgreSQL Driver
├── OpenSSL
└── Linux Packages
```

Common SBOM formats include:

- SPDX
- CycloneDX

SBOMs improve visibility and vulnerability response.

---

# 23. Artifact Signing

Scanning answers:

> **"Does this artifact contain known security problems?"**

Signing answers:

> **"Can I verify where this artifact came from and whether it was altered?"**

A secure flow is:

```text
Build
  │
  ▼
Scan
  │
  ▼
SBOM
  │
  ▼
Sign
  │
  ▼
Registry
  │
  ▼
Verify
  │
  ▼
Deploy
```

Tools such as Sigstore Cosign can be used for container image signing and verification.

---

# 24. Infrastructure as Code Security

Infrastructure can also contain security vulnerabilities.

Examples:

```text
Terraform
CloudFormation
Kubernetes YAML
Helm
Ansible
```

Example:

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: app
      securityContext:
        privileged: true
```

IaC scanning can identify insecure configurations before deployment.

Typical tools include:

- Checkov
- Trivy
- tfsec
- KICS

---

# 25. Kubernetes Security

For Kubernetes environments, DevSecOps should consider:

```text
Source
  │
  ▼
Container
  │
  ▼
Kubernetes Manifest
  │
  ▼
Admission Policy
  │
  ▼
Cluster
  │
  ▼
Runtime
```

Security areas include:

- Pod security
- RBAC
- Network policies
- Secrets
- Service accounts
- Image security
- Admission controls
- Resource limits
- Runtime monitoring

---

# 26. Cloud Security

DevSecOps extends into cloud environments.

```text
Application
     │
     ▼
Cloud Infrastructure
     │
     ├── IAM
     ├── Network
     ├── Storage
     ├── Compute
     └── Managed Services
```

Security should cover:

- IAM
- Least privilege
- Network security
- Encryption
- Logging
- Monitoring
- Configuration management
- Cloud security posture

---

# 27. Identity and Access Management

Identity is a major DevSecOps concern.

The principle is:

> **Give users, applications, pipelines, and services only the permissions they need.**

Example:

```text
Developer
   │
   ├── Source Repository
   └── Development Environment

CI/CD
   │
   ├── Build Registry
   └── Deployment Target

Production Service
   │
   └── Required Production Resources
```

Avoid:

```text
CI/CD
  │
  └── Administrator Everywhere
```

---

# 28. Secrets Management

Secrets should be stored in dedicated secret-management systems rather than source code.

Examples include:

- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- Kubernetes Secrets with appropriate protection

Typical flow:

```text
Application
     │
     ▼
Secret Request
     │
     ▼
Secret Manager
     │
     ▼
Credential
     │
     ▼
Application
```

The secret should not need to be committed into Git.

---

# 29. Security Testing Strategy

A mature DevSecOps program uses multiple testing layers:

```text
                   SECURITY TESTING
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
     STATIC           DYNAMIC           MANUAL
       │                 │                 │
       ▼                 ▼                 ▼
     SAST               DAST           Pentest
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
                   Risk Assessment
```

No single scanner can identify every vulnerability.

---

# 30. Security Gates

Security findings become meaningful when they influence delivery decisions.

Example:

```text
Security Scan
      │
      ▼
Findings
      │
      ▼
Risk Evaluation
      │
 ┌────┴───────────────┐
 │                    │
PASS                  FAIL
 │                    │
 ▼                    ▼
Continue           Stop Pipeline
```

---

# 31. Risk-Based Security Gates

A mature organization should avoid:

```text
Any Finding = Build Failure
```

Instead:

```text
Finding
   │
   ▼
Severity
   +
Exploitability
   +
Exposure
   +
Business Impact
   +
Compensating Controls
   +
Fix Availability
   │
   ▼
Risk Decision
```

For example:

```text
Critical + Exploitable
        │
        ▼
       FAIL


Low + No Exploit Path
        │
        ▼
      Review
```

Exact thresholds should be defined by organizational policy.

---

# 32. Vulnerability Management

Finding a vulnerability is only the beginning.

A complete process is:

```text
Discover
   │
   ▼
Validate
   │
   ▼
Prioritize
   │
   ▼
Assign
   │
   ▼
Remediate
   │
   ▼
Verify
   │
   ▼
Close
```

A vulnerability should have an owner and a defined remediation path.

---

# 33. Vulnerability Severity

Common severity considerations include:

- Criticality
- Exploitability
- Internet exposure
- Business impact
- Data sensitivity
- Availability of a fix
- Compensating controls
- Environment

CVSS can help standardize vulnerability severity, but the score should not be treated as the only risk signal.

---

# 34. False Positives

Security scanners can produce false positives.

Process:

```text
Finding
   │
   ▼
Validate
   │
   ├── True Positive ──► Remediate
   │
   └── False Positive ─► Document / Suppress
```

Suppressions should be:

- Justified
- Reviewed
- Traceable
- Time-bound where appropriate

---

# 35. Developer Experience

DevSecOps should not become:

> "Security blocks every deployment."

Instead:

```text
Scanner
   │
   ▼
Actionable Finding
   │
   ├── What is wrong?
   ├── Where is it?
   ├── Why does it matter?
   └── How do I fix it?
```

Good security tooling should provide developers with useful feedback.

---

# 36. Security Champions

A **Security Champion** is typically a developer or engineer who helps promote security practices within a development team.

Example:

```text
                Security Team
                      │
                      ▼
              Security Champions
                /      |      \
               /       |       \
              ▼        ▼        ▼
           Team A    Team B    Team C
```

Security Champions can help:

- Review security findings
- Promote secure coding
- Coordinate with security teams
- Participate in threat modeling
- Improve developer awareness

---

# 37. Security Culture

Technology alone does not create DevSecOps.

A successful program requires:

```text
People
  +
Process
  +
Technology
```

Teams should understand:

> **Security is everyone's responsibility.**

Development, security, operations, architecture, and platform teams should collaborate rather than operate as isolated silos.

---

# 38. DevSecOps Tools

A typical tool landscape includes:

| Area | Example Tools |
|---|---|
| Source Control | GitHub, GitLab, Bitbucket |
| CI/CD | GitHub Actions, Jenkins, GitLab CI, Azure DevOps |
| SAST | CodeQL, Semgrep, SonarQube |
| DAST | OWASP ZAP, Burp Suite, Invicti, StackHawk |
| SCA | Dependabot, Snyk, OWASP Dependency-Check |
| Secrets | Gitleaks, GitHub Secret Scanning |
| Container Security | Trivy, Grype, Docker Scout |
| IaC Security | Checkov, Trivy, KICS |
| SBOM | Syft, CycloneDX |
| Image Signing | Cosign |
| Secrets Management | Vault, AWS Secrets Manager, Azure Key Vault |
| Kubernetes Security | Kyverno, OPA Gatekeeper, Trivy |
| Monitoring | Prometheus, Grafana, SIEM platforms |

Tool selection should be based on requirements rather than simply choosing the largest number of security tools.

---

# 39. GitHub Actions DevSecOps Pipeline

A practical GitHub Actions architecture might be:

```text
Pull Request
     │
     ├── Secrets Scan
     ├── SAST
     ├── SCA
     ├── IaC Scan
     └── Tests
     │
     ▼
    Merge
     │
     ▼
    Build
     │
     ├── Container Build
     ├── Container Scan
     └── SBOM
     │
     ▼
 Security Gate
     │
     ▼
 Push Artifact
     │
     ▼
 Deploy Test
     │
     ▼
    DAST
     │
     ▼
 Security Gate
     │
     ▼
   Staging
     │
     ▼
 Approval / Policy
     │
     ▼
 Production
```

---

# 40. Example GitHub Actions Structure

A repository could organize security workflows like:

```text
.github/
└── workflows/
    ├── ci.yml
    ├── sast.yml
    ├── sca.yml
    ├── secrets.yml
    ├── container-scan.yml
    ├── dast.yml
    └── security.yml
```

Alternatively, related checks can be consolidated into fewer workflows.

The important thing is that the security controls are:

- Version controlled
- Repeatable
- Automated
- Reviewable
- Auditable

---

# 41. DevSecOps Pipeline Example

A conceptual workflow:

```yaml
name: DevSecOps

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
      - name: Secrets scan
        run: echo "Run secrets scanner"

  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SAST
        run: echo "Run SAST"

  sca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SCA
        run: echo "Run dependency scan"

  build:
    needs:
      - secrets
      - sast
      - sca
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: echo "Build application"

  container:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build container
        run: docker build -t myapp:${{ github.sha }} .

      - name: Container scan
        run: echo "Run container scanner"

  deploy-test:
    needs: container
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: echo "Deploy to test environment"

  dast:
    needs: deploy-test
    runs-on: ubuntu-latest
    steps:
      - name: DAST
        run: echo "Run DAST"
```

This is a conceptual example. Production workflows should use approved security actions and pin third-party actions according to organizational supply-chain policy.

---

# 42. CI/CD Security

The CI/CD system itself is part of the attack surface.

A compromised pipeline could:

```text
Source
  │
  ▼
CI/CD
  │
  ▼
Malicious Artifact
  │
  ▼
Production
```

Therefore, protect:

- Workflow files
- Runner infrastructure
- Secrets
- Tokens
- Service accounts
- Build artifacts
- Package repositories
- Deployment credentials

---

# 43. CI/CD Least Privilege

A pipeline should receive only the permissions it needs.

Bad:

```text
CI/CD
  │
  └── Full Cloud Administrator
```

Better:

```text
Build Job
  └── Read Source

Image Job
  └── Push Registry

Deployment Job
  └── Deploy Specific Application
```

This reduces blast radius if a job is compromised.

---

# 44. Branch Protection

Security-sensitive repositories should protect important branches.

Controls can include:

- Pull requests
- Required reviews
- Required status checks
- Restricted direct pushes
- Signed commits where appropriate
- CODEOWNERS
- Security checks

Example:

```text
Developer
   │
   ▼
Pull Request
   │
   ├── Review
   ├── SAST
   ├── SCA
   ├── Secrets
   └── Tests
   │
   ▼
Approved
   │
   ▼
Merge
```

---

# 45. Policy as Code

Security policies can be expressed as code.

Example concept:

```text
Policy
  │
  ├── No privileged containers
  ├── Images must be scanned
  ├── Critical vulnerabilities blocked
  ├── Production deployments require approval
  └── Only approved registries allowed
```

Policy-as-code provides:

- Version control
- Automation
- Repeatability
- Auditability
- Consistency

Common policy technologies include:

- Open Policy Agent (OPA)
- Rego
- Kyverno

---

# 46. Continuous Monitoring

Security does not end at deployment.

Production should be monitored for:

- Suspicious activity
- Vulnerability exposure
- Authentication anomalies
- Unauthorized changes
- Configuration drift
- Runtime threats
- Service abuse

Conceptually:

```text
Production
    │
    ▼
Monitoring
    │
    ▼
Security Events
    │
    ▼
Detection
    │
    ▼
Response
    │
    ▼
Improvement
```

---

# 47. Runtime Security

Build-time security cannot detect every runtime threat.

Runtime controls may include:

- WAF
- IDS/IPS
- Runtime container security
- Endpoint security
- SIEM
- EDR
- Network monitoring
- Application monitoring

The goal is defense in depth.

---

# 48. Incident Response

When a security event occurs:

```text
Detect
  │
  ▼
Analyze
  │
  ▼
Contain
  │
  ▼
Eradicate
  │
  ▼
Recover
  │
  ▼
Learn
  │
  ▼
Improve Controls
```

DevSecOps creates a feedback loop between incidents and development.

For example:

```text
Production Incident
       │
       ▼
Root Cause
       │
       ▼
New Security Test
       │
       ▼
CI/CD Security Gate
       │
       ▼
Future Prevention
```

---

# 49. Compliance and Governance

DevSecOps can support compliance by making security controls:

- Automated
- Repeatable
- Auditable
- Traceable

Examples of governance requirements may cover:

- Access control
- Vulnerability management
- Change management
- Logging
- Data protection
- Software supply chain
- Security testing
- Incident response

Compliance requirements should be translated into actionable engineering controls.

---

# 50. Metrics and KPIs

A DevSecOps program should measure outcomes, not simply scanner counts.

Useful metrics include:

## Mean Time to Remediate

```text
Finding Created
       │
       ▼
Finding Closed
       │
       ▼
Remediation Time
```

## Vulnerability Aging

How long vulnerabilities remain open.

## Security Defect Escape Rate

Security issues discovered after release.

## Scan Coverage

Percentage of applications and repositories covered by security controls.

## Pipeline Security Coverage

Percentage of pipelines implementing required security checks.

## False Positive Rate

How many reported findings are not actual vulnerabilities.

## Critical Vulnerability SLA

Time required to remediate critical issues.

---

# 51. DevSecOps Maturity Model

A simple maturity model:

## Level 1 — Ad Hoc

```text
Manual Security Reviews
```

Security is mostly reactive.

## Level 2 — Basic Automation

```text
SAST
SCA
Secrets Scanning
```

Some checks are automated.

## Level 3 — Integrated

```text
SAST
SCA
Secrets
Container
DAST
```

Security is integrated into CI/CD.

## Level 4 — Risk-Based

```text
Security Gates
+
Risk Prioritization
+
Central Vulnerability Management
```

## Level 5 — Continuous Security

```text
Plan
 ↓
Code
 ↓
Build
 ↓
Test
 ↓
Release
 ↓
Operate
 ↓
Monitor
 ↓
Improve
 └───────────────►
```

Security becomes a continuous engineering capability.

---

# 52. DevSecOps Anti-Patterns

## Anti-Pattern 1: Security at the End

```text
Develop
  ↓
Build
  ↓
Deploy
  ↓
Security
```

This creates expensive late-stage findings.

---

## Anti-Pattern 2: Tool Explosion

```text
10 Security Tools
       │
       ▼
No Ownership
       │
       ▼
Thousands of Findings
```

More tools do not automatically mean better security.

---

## Anti-Pattern 3: Ignore Findings

```text
Scanner
  ↓
1000 Findings
  ↓
Nobody Fixes Them
```

This creates alert fatigue.

---

## Anti-Pattern 4: Block Everything

```text
Any Finding
     │
     ▼
Pipeline FAIL
```

This can cause developers to bypass security controls.

---

## Anti-Pattern 5: Security Team Only

Security should not be isolated from engineering.

---

## Anti-Pattern 6: Production-Only Testing

Security testing should happen throughout the lifecycle.

---

## Anti-Pattern 7: Secrets in CI/CD Logs

Never expose credentials through build output.

---

# 53. Defense in Depth

No single security control is sufficient.

```text
                    Security
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
     Code            Build            Runtime
       │               │                │
       ▼               ▼                ▼
     SAST             SCA              WAF
     Secrets          Container        Monitoring
     Review           SBOM             Detection
```

If one control misses a vulnerability, another layer may detect or mitigate it.

---

# 54. DevSecOps Reference Architecture

```text
                              USERS
                                │
                                ▼
                           CDN / WAF
                                │
                                ▼
                         API / Gateway
                                │
                                ▼
                         APPLICATION
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
          Services          Database          External APIs
             │
             ▼
          Containers
             │
             ▼
         Kubernetes
             │
             ▼
          Cloud


                  SOFTWARE SUPPLY CHAIN
                           │
                           ▼
Developer ──► Git ──► CI/CD ──► Registry ──► Deploy
                  │
                  ├── SAST
                  ├── SCA
                  ├── Secrets
                  ├── IaC
                  ├── Container
                  ├── SBOM
                  ├── Signing
                  └── DAST
```

---

# 55. Complete DevSecOps Lifecycle

```text
                         PLAN
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
       Requirements   Threat Model   Risk
             │            │            │
             └────────────┼────────────┘
                          ▼
                         CODE
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Secure Code     SAST        Secrets
                          │
                          ▼
                         BUILD
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
            SCA        Container      SBOM
                       Scanning
             │            │            │
             └────────────┼────────────┘
                          ▼
                         TEST
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
           DAST      Security Tests  Pentest
                          │
                          ▼
                        RELEASE
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Security Gate  Signing     Approval
                          │
                          ▼
                       DEPLOY
                          │
                          ▼
                       OPERATE
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Monitoring   Vulnerability   Incident
                     Management      Response
                          │
                          ▼
                       IMPROVE
                          │
                          └──────────► PLAN
```

---

# 56. Real-World Example

Consider an online banking application.

```text
Customer
   │
   ▼
Mobile / Web Application
   │
   ▼
API Gateway
   │
   ├── Authentication
   ├── Account Service
   ├── Payment Service
   └── Notification Service
   │
   ▼
Databases
```

A DevSecOps approach might include:

```text
Developer
   │
   ├── Secure Coding
   ├── SAST
   ├── Secrets Scanning
   └── SCA
   │
   ▼
Build
   │
   ├── Container Scan
   ├── SBOM
   └── Artifact Signing
   │
   ▼
Test
   │
   ├── DAST
   ├── API Security
   └── Security Tests
   │
   ▼
Staging
   │
   └── Penetration Testing
   │
   ▼
Production
   │
   ├── WAF
   ├── Monitoring
   ├── SIEM
   └── Incident Response
```

---

# 57. How the Core Knowledge Documents Fit Together

```text
                         DEVSECOPS
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
       CODE                 BUILD                TEST
        │                    │                    │
        ▼                    ▼                    ▼
      SAST                  SCA                  DAST
        │                    │                    │
        ├──────────────┐     ▼                    │
        │              │ Container Scan           │
        ▼              │                          │
 Secrets Scanning      │                          │
        │              │                          │
        └──────────────┼──────────────────────────┘
                       │
                       ▼
                 Security Gates
                       │
                       ▼
                   Production
```

The individual knowledge documents explain each capability in detail.

---

# 58. DevSecOps vs AppSec

These terms overlap but are not identical.

## Application Security

Application Security focuses primarily on protecting applications from security threats.

## DevSecOps

DevSecOps focuses on integrating security into the software delivery and operational lifecycle.

```text
AppSec
 │
 ├── Secure Coding
 ├── SAST
 ├── DAST
 ├── SCA
 └── Penetration Testing


DevSecOps
 │
 ├── AppSec
 ├── CI/CD Security
 ├── Supply Chain Security
 ├── Infrastructure Security
 ├── Cloud Security
 ├── Runtime Security
 └── Continuous Feedback
```

DevSecOps therefore extends beyond traditional application security.

---

# 59. DevSecOps vs DevOps vs SecOps

| Area | DevOps | SecOps | DevSecOps |
|---|---|---|---|
| Development | Strong | Limited | Strong |
| Operations | Strong | Strong | Strong |
| Security | Integrated operationally | Primary focus | Integrated throughout |
| CI/CD | Strong | Limited | Strong |
| Secure Coding | Limited | Limited | Strong |
| SAST/SCA | Optional | Optional | Common |
| Runtime Security | Strong | Strong | Strong |
| Supply Chain | Growing | Moderate | Strong |
| Developer Security | Moderate | Limited | Strong |
| Security Automation | Strong | Strong | Strong |

---

# 60. DevSecOps Team Model

A mature organization often uses a collaborative model:

```text
                    Security Team
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
           AppSec     CloudSec    SecOps
              │          │          │
              └──────────┼──────────┘
                         │
                         ▼
                  Platform / DevOps
                         │
                         ▼
                   Development
```

The goal is collaboration, not ownership silos.

---

# 61. Recommended Implementation Roadmap

An organization should avoid trying to implement every control simultaneously.

## Phase 1 — Foundation

```text
Source Control
     │
     ├── Branch Protection
     ├── Code Review
     └── Secrets Scanning
```

## Phase 2 — Code Security

```text
SAST
+
SCA
```

## Phase 3 — Build Security

```text
Container Scanning
+
SBOM
```

## Phase 4 — Runtime/Application Security

```text
DAST
+
API Security
```

## Phase 5 — Supply Chain

```text
Signing
+
Provenance
+
Policy as Code
```

## Phase 6 — Continuous Security

```text
Monitoring
+
Vulnerability Management
+
Incident Response
```

---

# 62. Practical First DevSecOps Pipeline

For a team starting from zero:

```text
Git Push
   │
   ▼
Secrets Scan
   │
   ▼
SAST
   │
   ▼
SCA
   │
   ▼
Build
   │
   ▼
Container Scan
   │
   ▼
Deploy Test
   │
   ▼
DAST
   │
   ▼
Security Gate
   │
   ▼
Deploy
```

This provides a strong foundation without creating excessive complexity.

---

# 63. Best Practices

## People

- Make security a shared responsibility.
- Train developers.
- Establish Security Champions.
- Encourage security ownership.

## Process

- Integrate security into existing workflows.
- Define security policies.
- Establish vulnerability SLAs.
- Create exception processes.
- Perform threat modeling.

## Technology

- Automate repeatable controls.
- Use multiple security layers.
- Secure CI/CD.
- Protect secrets.
- Generate SBOMs.
- Sign artifacts.
- Monitor production.

## Governance

- Define risk thresholds.
- Track vulnerabilities.
- Measure remediation.
- Audit security controls.
- Review exceptions.

---

# 64. Common Interview Questions

## Beginner

### What is DevSecOps?

DevSecOps is the integration of security practices into development, CI/CD, deployment, and operations so that security becomes a continuous and shared responsibility.

### What does Shift Left mean?

Shift Left means moving security activities earlier in the software lifecycle so issues can be identified closer to the time they are introduced.

### Is DevSecOps just adding security tools to CI/CD?

No. Tools are only one part. DevSecOps also includes culture, processes, secure design, governance, risk management, supply-chain security, and continuous feedback.

### What are the main DevSecOps security controls?

Common controls include SAST, SCA, secrets scanning, IaC scanning, container scanning, SBOM, DAST, security testing, artifact signing, and runtime monitoring.

---

## Intermediate

### Why are SAST and DAST both required?

SAST analyzes source code, while DAST tests a running application. They identify different classes of vulnerabilities.

### Why is SCA important?

Modern applications rely heavily on third-party dependencies. SCA identifies known vulnerabilities and risks in those components.

### What is a security gate?

A security gate is a CI/CD decision point where security findings are evaluated against defined policies before delivery continues.

### Why is risk-based gating better than blocking every finding?

Because vulnerabilities differ in severity, exploitability, exposure, business impact, and availability of remediation.

---

## Advanced

### How would you implement DevSecOps in an organization?

A strong answer should cover:

1. Understand the existing SDLC and CI/CD.
2. Establish security requirements and threat modeling.
3. Protect source control and secrets.
4. Add SAST and SCA.
5. Add IaC and container scanning.
6. Introduce SBOM and artifact security.
7. Add DAST to test environments.
8. Establish risk-based gates.
9. Implement vulnerability management.
10. Add runtime monitoring and incident feedback.
11. Measure outcomes.
12. Continuously improve.

### What is the biggest challenge in DevSecOps?

Usually not the technology.

Common challenges include:

- Developer adoption
- Tool overload
- False positives
- Poor ownership
- Inadequate security knowledge
- Slow remediation
- Weak CI/CD security
- Lack of executive support

### How do you prevent DevSecOps from slowing developers down?

Use:

- Fast feedback
- Risk-based gates
- Developer-friendly reports
- Automated remediation where possible
- Baseline management
- Clear exception processes
- Appropriate severity thresholds

---

# 65. DevSecOps Metrics

A useful dashboard might track:

```text
Repositories Covered
        │
        ▼
Security Scan Coverage
        │
        ▼
Findings
        │
        ▼
Critical / High Findings
        │
        ▼
Mean Time to Remediate
        │
        ▼
Security Defect Escape Rate
        │
        ▼
Risk Reduction
```

The ultimate objective is not:

> "How many scans did we run?"

It is:

> **"How effectively are we reducing security risk while maintaining delivery velocity?"**

---

# 66. Final DevSecOps Mental Model

Think about DevSecOps as five connected layers:

```text
┌───────────────────────────────────────────────┐
│                    PEOPLE                     │
│ Developers • Security • Operations • Champions│
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│                    PROCESS                    │
│ SDLC • Risk • Governance • Remediation        │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│                  AUTOMATION                   │
│ CI/CD • Security Gates • Policy as Code       │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│                  SECURITY                     │
│ SAST • SCA • DAST • Secrets • Containers      │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│                  OPERATIONS                   │
│ Monitoring • Detection • Response • Learning  │
└───────────────────────────────────────────────┘
```

---

# 67. Quick Reference

```text
DEVSECOPS
│
├── PLAN
│   ├── Security Requirements
│   ├── Threat Modeling
│   └── Risk Assessment
│
├── CODE
│   ├── Secure Coding
│   ├── Code Review
│   ├── SAST
│   └── Secrets Scanning
│
├── BUILD
│   ├── SCA
│   ├── Dependency Scanning
│   ├── SBOM
│   └── Container Scanning
│
├── TEST
│   ├── DAST
│   ├── API Security
│   ├── Security Tests
│   └── Penetration Testing
│
├── RELEASE
│   ├── Security Gates
│   ├── Artifact Signing
│   ├── Provenance
│   └── Policy
│
├── DEPLOY
│   ├── Least Privilege
│   ├── Admission Controls
│   └── Secure Configuration
│
└── OPERATE
    ├── Monitoring
    ├── Vulnerability Management
    ├── Incident Response
    └── Continuous Improvement
```

---

# 68. Key Takeaway

> **DevSecOps is not a security tool, a pipeline stage, or a security team's responsibility. It is an engineering approach for continuously managing security throughout the software lifecycle.**

The core model is:

```text
PLAN
  ↓
DESIGN SECURELY
  ↓
CODE SECURELY
  ↓
SCAN
  ↓
BUILD SECURELY
  ↓
TEST
  ↓
VERIFY
  ↓
RELEASE
  ↓
DEPLOY
  ↓
MONITOR
  ↓
RESPOND
  ↓
LEARN
  ↓
IMPROVE
  └──────────────────► PLAN
```

The strongest DevSecOps programs combine:

```text
People
  +
Secure Process
  +
Automation
  +
Security Engineering
  +
Risk Management
  +
Continuous Feedback
```

The goal is not to make security a blocker.

> **The goal is to make secure software the natural outcome of the software delivery process.**

---

# 69. Related Knowledge

- [`README.md`](README.md)
- [`sast.md`](sast.md)
- [`dast.md`](dast.md)
- [`sca.md`](sca.md)
- [`container-scanning.md`](container-scanning.md)
- [`secrets-scanning.md`](secrets-scanning.md)
