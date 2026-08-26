# DevSecOps Knowledge Base

> A practical knowledge base for understanding, implementing, and automating security throughout the software development and delivery lifecycle.

## 📚 Overview

**DevSecOps** integrates security practices into the existing **Development + Operations + CI/CD** processes.

Instead of treating security as a final activity before production, DevSecOps introduces security controls throughout the Software Development Lifecycle (SDLC).

```text
                           DEVSECOPS
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
       PLAN                   CODE                   BUILD
        │                      │                      │
        │                      ├── SAST              ├── SCA
        │                      ├── Secrets Scan      ├── Container Scan
        │                      └── Secure Review     └── Artifact Security
        │
        ▼
       TEST
        │
        ├── DAST
        ├── Security Testing
        └── Penetration Testing
        │
        ▼
      RELEASE
        │
        ├── Security Gates
        ├── Artifact Validation
        └── Secure Deployment
        │
        ▼
     OPERATE
        │
        ├── Monitoring
        ├── Vulnerability Management
        └── Continuous Improvement
```

The objective is simple:

> **Find security problems as early as possible, automate security checks where practical, and prevent vulnerable software from progressing through the delivery pipeline.**

---

# 🎯 Goals of This Knowledge Base

This section is designed to help developers, DevOps engineers, DevSecOps engineers, architects, and security engineers understand:

* What DevSecOps is
* Why security needs to be integrated into CI/CD
* Where different security tools fit in the pipeline
* How security scanning works
* How to integrate security tools into GitHub Actions
* How to establish security quality gates
* How to manage vulnerabilities
* How to secure software dependencies and containers
* How to prevent secrets from entering source control
* How to build a practical DevSecOps pipeline

---

# 🏗️ DevSecOps Security Layers

DevSecOps is not a single tool or scan.

It is a collection of security practices applied at different stages of the software lifecycle.

```text
┌─────────────────────────────────────────────────────────────┐
│                         PLAN                                │
│                                                             │
│  Threat Modeling • Security Requirements • Risk Assessment │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         CODE                                │
│                                                             │
│  Secure Coding • Code Review • SAST • Secrets Scanning     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        BUILD                                │
│                                                             │
│  SCA • Dependency Scanning • Container Scanning • SBOM      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         TEST                                │
│                                                             │
│  DAST • Security Tests • API Security Testing • Pen Test    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       RELEASE                               │
│                                                             │
│  Security Gates • Artifact Validation • Secure Deployment   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    OPERATE & MONITOR                        │
│                                                             │
│  Monitoring • Vulnerability Management • Incident Response  │
└─────────────────────────────────────────────────────────────┘
```

---

# 🔐 Core DevSecOps Knowledge Areas

This directory currently contains the following core topics.

| Document                                         | Topic              | Primary Purpose                                                  |
| ------------------------------------------------ | ------------------ | ---------------------------------------------------------------- |
| [`devsecops.md`](devsecops.md)                   | DevSecOps          | Understand the overall DevSecOps philosophy and lifecycle        |
| [`sast.md`](sast.md)                             | SAST               | Analyze source code without executing the application            |
| [`dast.md`](dast.md)                             | DAST               | Test a running application for security vulnerabilities          |
| [`sca.md`](sca.md)                               | SCA                | Identify vulnerabilities in third-party dependencies             |
| [`container-scanning.md`](container-scanning.md) | Container Scanning | Identify vulnerabilities and security issues in container images |
| [`secrets-scanning.md`](secrets-scanning.md)     | Secrets Scanning   | Detect credentials, API keys, tokens, and other secrets          |
| `README.md`                                      | Knowledge Base     | Navigate and understand the DevSecOps topics                     |

---

# 🔎 Understanding the Different Scans

One of the most important concepts in DevSecOps is understanding that different scanners solve different problems.

```text
                         APPLICATION
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
           SOURCE           DEPENDENCIES    RUNNING APP
             CODE               │               │
              │                 │               │
              ▼                 ▼               ▼
            SAST                SCA            DAST
              │                 │               │
              ▼                 ▼               ▼
       Code vulnerabilities  Library      Runtime /
                             vulnerabilities API vulnerabilities
```

Additionally:

```text
SOURCE CODE
     │
     └──────► Secrets Scanning
                    │
                    ▼
               Credentials
               API Keys
               Tokens
               Private Keys


APPLICATION
     │
     └──────► Container Build
                    │
                    ▼
              Container Image
                    │
                    └──────► Container Scanning
```

---

# 🧩 SAST

**Static Application Security Testing**

SAST analyzes application source code or compiled representations without requiring the application to be running.

Typical findings include:

* SQL injection patterns
* Cross-site scripting patterns
* Command injection
* Insecure API usage
* Weak cryptography
* Unsafe coding patterns
* Hardcoded security-sensitive values

See:

**[`sast.md`](sast.md)**

---

# 🌐 DAST

**Dynamic Application Security Testing**

DAST tests an application while it is running.

A DAST scanner interacts with the application from an external perspective and looks for security weaknesses exposed through the application's runtime behavior.

Typical targets include:

* Web applications
* REST APIs
* Authentication flows
* HTTP endpoints
* Input validation
* Session management
* Security headers

See:

**[`dast.md`](dast.md)**

---

# 📦 SCA

**Software Composition Analysis**

Modern applications depend heavily on third-party libraries and open-source components.

SCA helps identify:

* Vulnerable dependencies
* Outdated packages
* Known CVEs
* Transitive dependencies
* License risks
* Dependency relationships
* Supply-chain risks

See:

**[`sca.md`](sca.md)**

---

# 🐳 Container Scanning

Modern applications are frequently packaged as container images.

Container scanning analyzes container images for security issues such as:

* Vulnerable operating-system packages
* Vulnerable application dependencies
* Outdated base images
* Known CVEs
* Misconfigurations
* Embedded secrets
* Risky packages

See:

**[`container-scanning.md`](container-scanning.md)**

---

# 🔑 Secrets Scanning

Secrets scanning attempts to identify sensitive credentials accidentally committed to source control.

Examples include:

* API keys
* Cloud credentials
* Access tokens
* Database passwords
* Private keys
* Authentication tokens
* Service credentials

A secret should never be treated as safe simply because it is hidden inside configuration files.

See:

**[`secrets-scanning.md`](secrets-scanning.md)**

---

# 🔄 Typical DevSecOps CI/CD Pipeline

A practical pipeline can look like this:

```text
Developer
    │
    ▼
Git Push / Pull Request
    │
    ▼
┌──────────────────────────────┐
│        SOURCE CONTROLS       │
│                              │
│ • Branch Protection          │
│ • Code Review                │
│ • Secrets Scanning           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         CODE ANALYSIS        │
│                              │
│ • SAST                       │
│ • Secure Coding Checks       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       DEPENDENCY CHECK       │
│                              │
│ • SCA                        │
│ • Dependency Vulnerabilities │
│ • License Checks             │
└──────────────┬───────────────┘
               │
               ▼
             BUILD
               │
               ▼
┌──────────────────────────────┐
│      CONTAINER SECURITY      │
│                              │
│ • Image Build                │
│ • Container Scan             │
│ • SBOM                       │
└──────────────┬───────────────┘
               │
               ▼
        Security Gate
               │
        ┌──────┴──────┐
        │             │
       FAIL          PASS
        │             │
        ▼             ▼
     Stop Build     Deploy
                      │
                      ▼
              ┌───────────────┐
              │      DAST     │
              │               │
              │ Running App   │
              │ Security Test │
              └───────┬───────┘
                      │
                      ▼
                Security Gate
                      │
                      ▼
                  Production
                      │
                      ▼
             Monitor & Improve
```

---

# 🚦 Security Gates

Security tools become much more useful when their results influence the pipeline.

A simple security-gate model can be:

```text
                         Scan
                           │
                           ▼
                    Vulnerabilities?
                           │
                 ┌─────────┴─────────┐
                 │                   │
                YES                  NO
                 │                   │
                 ▼                   ▼
          Check Severity          Continue
                 │
        ┌────────┼────────┐
        │        │        │
       LOW     MEDIUM    HIGH/CRITICAL
        │        │        │
        ▼        ▼        ▼
      Warn     Review      FAIL
```

The exact policy should depend on the organization's risk tolerance, application criticality, exploitability, and environment.

---

# 🛠️ Common DevSecOps Tools

The tools below are examples rather than mandatory choices.

| Security Area            | Example Tools                                      |
| ------------------------ | -------------------------------------------------- |
| SAST                     | Semgrep, CodeQL, SonarQube                         |
| DAST                     | OWASP ZAP, Burp Suite                              |
| SCA                      | OWASP Dependency-Check, Snyk, Dependabot           |
| Container Scanning       | Trivy, Grype, Docker Scout                         |
| Secrets Scanning         | Gitleaks, GitHub Secret Scanning                   |
| IaC Security             | Checkov, Trivy, tfsec                              |
| SBOM                     | Syft, CycloneDX                                    |
| CI/CD                    | GitHub Actions, Jenkins, GitLab CI, Azure DevOps   |
| Image Signing            | Cosign                                             |
| Vulnerability Management | Dependency-Track and other vulnerability platforms |

Tool selection should be based on the application's technology stack, organization requirements, existing CI/CD platform, compliance needs, and operational model.

---

# ☁️ GitHub Actions Integration

A DevSecOps implementation can be integrated directly into a GitHub Actions workflow.

A simplified pipeline might look like:

```text
Pull Request
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
Container Build
     │
     ▼
Container Scan
     │
     ▼
Security Gate
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
Production
```

The individual knowledge documents provide more detail about implementing each security control.

---

# 📊 Security Findings

Not every scanner finding should automatically block a pipeline.

A useful vulnerability-management process considers:

* Severity
* Exploitability
* Business impact
* Application exposure
* Environment
* Internet accessibility
* Availability of a fix
* Compensating controls
* False-positive probability
* Accepted risk

Example:

```text
Finding
   │
   ▼
Validate Finding
   │
   ▼
Determine Severity
   │
   ▼
Assess Business Risk
   │
   ├───────────────┐
   │               │
   ▼               ▼
Fix Immediately   Accept / Mitigate
   │               │
   └───────┬───────┘
           ▼
       Track Result
```

---

# 🧠 DevSecOps Principles

The key principles behind this knowledge base are:

### 1. Shift Left

Find and fix security problems as early as possible.

### 2. Automate

Automate repeatable security checks within CI/CD.

### 3. Security as Code

Treat security policies and controls as version-controlled, repeatable configurations.

### 4. Continuous Security

Security should continue after deployment through monitoring, vulnerability management, and incident response.

### 5. Developer Enablement

Security should provide developers with actionable feedback rather than simply blocking delivery.

### 6. Risk-Based Security

Not every finding has the same business impact.

### 7. Defense in Depth

Use multiple complementary security controls instead of depending on a single scanner.

### 8. Secure the Supply Chain

Secure source code, dependencies, build systems, artifacts, containers, and deployment environments.

---

# 🔗 Relationship Between the Knowledge Documents

Think of the individual documents as layers:

```text
                    DEVSECOPS
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
       CODE           BUILD             TEST
        │               │                │
        ▼               ▼                ▼
      SAST             SCA             DAST
        │               │
        │               ▼
        │          Container Scan
        │
        ▼
 Secrets Scanning
```

Each technology answers a different question:

| Question                                   | Security Control   |
| ------------------------------------------ | ------------------ |
| Is my source code vulnerable?              | SAST               |
| Are my dependencies vulnerable?            | SCA                |
| Does my container contain vulnerabilities? | Container Scanning |
| Did someone commit a secret?               | Secrets Scanning   |
| Is my running application vulnerable?      | DAST               |

---

# 🏆 Recommended Learning Path

If you are new to DevSecOps, study the documents in this order:

```text
1. devsecops.md
       │
       ▼
2. secrets-scanning.md
       │
       ▼
3. sast.md
       │
       ▼
4. sca.md
       │
       ▼
5. container-scanning.md
       │
       ▼
6. dast.md
```

This order moves from the overall concept → source-code security → dependency and artifact security → runtime security.

---

# 🎓 What You Should Be Able to Explain

After completing this section, you should be able to explain:

* What DevSecOps means
* DevOps vs DevSecOps
* Shift-left security
* Secure SDLC
* Security gates
* SAST
* DAST
* SCA
* Container scanning
* Secrets scanning
* Vulnerability management
* CVE and CVSS concepts
* Software supply-chain security
* SBOM
* Security automation
* CI/CD security
* GitHub Actions security integration
* Security quality gates
* False positives
* Risk acceptance
* Security remediation
* Continuous security

---

# 💬 Interview Perspective

A good DevSecOps engineer should not simply know the names of security tools.

You should be able to answer:

> **What security problem does this tool solve, where does it run in the pipeline, what does it detect, and what should happen when it finds a vulnerability?**

For example:

```text
SAST
 │
 ├── What?       Source-code analysis
 ├── When?       Pull Request / Build
 ├── Detects?    Code-level vulnerabilities
 └── Action?     Fix before merge/release


SCA
 │
 ├── What?       Dependency analysis
 ├── When?       Build / PR
 ├── Detects?    Vulnerable dependencies
 └── Action?     Upgrade / mitigate dependency


Container Scan
 │
 ├── What?       Container image analysis
 ├── When?       Image build
 ├── Detects?    OS/package/image vulnerabilities
 └── Action?     Fix base image/package


DAST
 │
 ├── What?       Running application testing
 ├── When?       Test environment
 ├── Detects?    Runtime/web vulnerabilities
 └── Action?     Fix application/API issue


Secrets Scan
 │
 ├── What?       Credential detection
 ├── When?       Commit / PR / repository
 ├── Detects?    Tokens, keys, passwords
 └── Action?     Revoke + rotate + remove
```

---

# 📌 Quick Reference

```text
DevSecOps
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
│   ├── Security Testing
│   └── Penetration Testing
│
├── RELEASE
│   ├── Security Gates
│   ├── Artifact Security
│   └── Secure Deployment
│
└── OPERATE
    ├── Monitoring
    ├── Vulnerability Management
    ├── Incident Response
    └── Continuous Improvement
```

---

# 📖 Further Reading

Recommended sources for deeper study:

* OWASP DevSecOps Guideline
* OWASP CI/CD Security Cheat Sheet
* OWASP Developer Guide
* OWASP DevSecOps Verification Standard
* OWASP Software Assurance Maturity Model (SAMM)
* OWASP Application Security Verification Standard (ASVS)

---

## 🚀 Next

Start with:

**[`devsecops.md`](devsecops.md)**

Then move through:

```text
devsecops
    ↓
secrets-scanning
    ↓
sast
    ↓
sca
    ↓
container-scanning
    ↓
dast
```

The goal is to build a complete understanding of how these controls work **individually and together as one DevSecOps security pipeline**.
