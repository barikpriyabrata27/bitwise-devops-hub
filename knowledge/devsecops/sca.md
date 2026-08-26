# Software Composition Analysis (SCA)

> **Software Composition Analysis (SCA)** identifies, inventories, and assesses the security and licensing risks of third-party and open-source software components used by an application.

Modern applications rarely consist only of code written by the organization.

A typical application may contain:

```text
Application
│
├── Organization Code
│
├── Frameworks
├── Open-Source Libraries
├── Runtime Components
├── Build Plugins
├── Transitive Dependencies
└── Container / OS Packages
```

SCA helps answer:

> **"What software components are we using, which versions are present, and what security or licensing risks do they introduce?"**

---

# 1. What Is SCA?

SCA analyzes software dependencies and component inventories.

A simplified flow is:

```text
Source Repository
       │
       ▼
Dependency Manifest
       │
       ▼
Dependency Resolution
       │
       ▼
Component Inventory
       │
       ├── Vulnerability Analysis
       ├── License Analysis
       ├── Version Analysis
       └── Supply-Chain Analysis
       │
       ▼
Security Findings
       │
       ▼
Remediation
```

Examples of dependency manifests include:

```text
pom.xml
package.json
package-lock.json
requirements.txt
poetry.lock
go.mod
go.sum
build.gradle
packages.config
*.csproj
Gemfile
Gemfile.lock
```

---

# 2. Why SCA Is Important

Modern applications depend heavily on external components.

For example:

```text
Banking Application
│
├── Spring Boot
├── Jackson
├── PostgreSQL Driver
├── Logging Library
├── JSON Library
└── Authentication Libraries
```

Even if the organization's own code is secure, a vulnerable dependency can introduce risk.

Example:

```text
Your Application
      │
      ▼
Library X 1.2.3
      │
      ▼
Known Vulnerability
      │
      ▼
Application Exposure
```

SCA helps identify this relationship.

---

# 3. SCA in DevSecOps

A typical pipeline:

```text
Developer
   │
   ▼
Git Push
   │
   ▼
SCA
   │
   ▼
Security Gate
   │
   ├── Fail
   │
   └── Pass
   │
   ▼
Build
```

SCA is often run during pull requests and CI builds.

It can also run continuously or on a scheduled basis because vulnerability databases and dependency risk change over time.

---

# 4. SCA vs SAST

These are complementary.

| SAST | SCA |
|---|---|
| Analyzes application code | Analyzes software components |
| Focuses on coding weaknesses | Focuses on dependency/component risk |
| SQL injection | Vulnerable dependency |
| XSS | Vulnerable library |
| Command injection | Vulnerable transitive dependency |
| Hardcoded security patterns | License risk |
| Data-flow analysis | Component inventory |

Example:

```text
Application
│
├── Your Java Code
│       └── SAST
│
└── Spring / Jackson / Other Libraries
        └── SCA
```

---

# 5. SCA vs Container Scanning

SCA normally focuses on application dependencies.

Container scanning can analyze the broader image:

```text
Container Image
│
├── Application
├── Application Dependencies
├── Runtime
├── OS Packages
└── System Libraries
```

Therefore:

```text
SCA
  └── Application dependency risk

Container Scan
  └── Image / OS / package risk
```

There can be overlap, and modern tools increasingly combine both capabilities.

---

# 6. SCA vs SBOM

These concepts are closely related but not identical.

## SCA

A security and risk analysis capability.

```text
Components
    │
    ▼
Vulnerability / License Analysis
```

## SBOM

A structured inventory of software components.

```text
Application
    │
    ▼
SBOM
    │
    ├── Component A
    ├── Component B
    ├── Component C
    └── Component D
```

A useful model is:

```text
SCA
 │
 ├── Discover Components
 ├── Analyze Vulnerabilities
 ├── Analyze Licenses
 └── Support Remediation

SBOM
 │
 └── Describe What Components Exist
```

An SCA platform may generate or consume SBOMs.

---

# 7. Direct Dependencies

A direct dependency is explicitly declared by the application.

Example:

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>...</version>
</dependency>
```

Conceptually:

```text
Application
     │
     └── Spring Core
```

The application directly requested the component.

---

# 8. Transitive Dependencies

A transitive dependency is introduced through another dependency.

Example:

```text
Application
    │
    ▼
Library A
    │
    ▼
Library B
    │
    ▼
Library C
```

The application may have declared only:

```text
Library A
```

but the build system may also include:

```text
Library B
Library C
```

This is one of the most important reasons SCA is necessary.

---

# 9. Dependency Tree

A dependency tree makes relationships visible.

Example:

```text
my-application
│
├── spring-web
│   ├── spring-core
│   └── spring-beans
│
├── jackson-databind
│   ├── jackson-core
│   └── jackson-annotations
│
└── postgres-driver
```

SCA can analyze the complete resolved dependency graph.

---

# 10. Why Transitive Dependencies Matter

Suppose:

```text
Application
   │
   ▼
Framework A
   │
   ▼
Library B
   │
   ▼
Library C 1.4.0
```

Library C contains a known vulnerability.

The developer may never have explicitly added Library C.

Nevertheless:

```text
Application
     │
     ▼
Framework A
     │
     ▼
Library B
     │
     ▼
Vulnerable C
```

The application may still be affected.

---

# 11. Dependency Resolution

Build tools resolve dependency graphs.

For example:

```text
pom.xml
   │
   ▼
Maven
   │
   ▼
Dependency Graph
   │
   ▼
Resolved Versions
   │
   ▼
Application Build
```

The declared version and the final resolved version are not always the same concept.

SCA should ideally analyze the actual resolved dependency set.

---

# 12. Dependency Lock Files

Many ecosystems use lock files.

Examples:

```text
package-lock.json
yarn.lock
pnpm-lock.yaml
poetry.lock
Gemfile.lock
go.sum
```

Lock files can help ensure reproducible dependency resolution.

Conceptually:

```text
Manifest
   │
   ▼
Dependency Resolution
   │
   ▼
Lock File
   │
   ▼
Repeatable Build
```

---

# 13. Vulnerability Databases

SCA tools correlate components with vulnerability intelligence.

Sources may include:

- CVE records
- Vendor advisories
- GitHub advisories
- Ecosystem advisories
- OSV
- Vendor security databases
- Commercial vulnerability intelligence

The exact coverage depends on the SCA provider.

---

# 14. CVE

**CVE = Common Vulnerabilities and Exposures**

A CVE identifier provides a standardized reference for a publicly known vulnerability.

Conceptually:

```text
Component
    │
    ▼
Version
    │
    ▼
Known Vulnerability
    │
    ▼
CVE
```

Example format:

```text
CVE-YYYY-NNNNN
```

A CVE is an identifier, not by itself a complete risk assessment.

---

# 15. CVSS

**CVSS = Common Vulnerability Scoring System**

CVSS provides a standardized way to represent vulnerability severity.

A simplified view:

```text
Vulnerability
      │
      ▼
CVSS Score
      │
      ▼
Severity
```

Common severity bands include:

```text
None
Low
Medium
High
Critical
```

Organizations should combine CVSS with business context and exploitability rather than treating the score as the only risk signal.

---

# 16. EPSS

**EPSS = Exploit Prediction Scoring System**

EPSS attempts to estimate the likelihood that a vulnerability will be exploited in the wild.

Conceptually:

```text
CVSS
  │
  ├── Severity
  │
  ▼
EPSS
  │
  └── Exploitation Likelihood
```

Using both can improve prioritization.

---

# 17. KEV

The **CISA Known Exploited Vulnerabilities (KEV) Catalog** identifies vulnerabilities known to be exploited in the wild.

A useful prioritization model is:

```text
Known Exploited
       +
High Impact
       +
Application Exposure
       │
       ▼
Urgent Remediation
```

Organizations should use authoritative and current vulnerability intelligence when defining remediation priorities.

---

# 18. Vulnerability Matching

SCA must map a dependency to known vulnerabilities.

Conceptually:

```text
Component
    │
    ├── Name
    ├── Version
    ├── Package Ecosystem
    └── Identifier
    │
    ▼
Vulnerability Database
    │
    ▼
Matching Advisory
```

Accurate component identification is therefore critical.

---

# 19. Package Identifiers

Different ecosystems identify components differently.

Examples include:

```text
Maven coordinates
npm package names
PyPI package names
Go modules
NuGet package IDs
Ruby gems
OS packages
```

Some modern systems use **PURLs (Package URLs)** to represent packages in a standardized form.

Conceptually:

```text
Package
   │
   ▼
PURL
   │
   ▼
Vulnerability Correlation
```

---

# 20. Vulnerability Reachability

Not every vulnerable dependency is necessarily exploitable by the application.

Example:

```text
Application
   │
   ▼
Library
   │
   └── Vulnerable Function
             │
             ▼
        Never Called
```

A mature SCA capability may analyze reachability.

Conceptually:

```text
Known Vulnerability
       │
       ▼
Is vulnerable code reachable?
       │
   ┌───┴────┐
   │        │
  Yes       No
   │        │
   ▼        ▼
Higher    Lower
Priority  Priority
```

Reachability analysis can significantly improve prioritization, although exact capabilities vary by tool and language.

---

# 21. Exploitability

Risk depends on more than a CVE score.

Consider:

```text
Vulnerability
      │
      ├── Is vulnerable component present?
      ├── Is vulnerable code reachable?
      ├── Is the application exposed?
      ├── Is exploitation practical?
      ├── Is exploit code available?
      └── What is the business impact?
```

This produces a better remediation decision.

---

# 22. License Analysis

SCA is not only about security.

Open-source components have licenses.

Examples include:

```text
MIT
Apache-2.0
BSD
GPL
LGPL
MPL
```

Organizations may have policies regarding which licenses are acceptable.

Example:

```text
Dependency
   │
   ▼
License
   │
   ▼
Policy
   │
   ├── Approved
   ├── Review Required
   └── Restricted
```

Legal and licensing decisions should involve the appropriate legal/compliance stakeholders.

---

# 23. License Compatibility

A dependency can create obligations depending on:

- License type
- How software is distributed
- How the component is linked or used
- Modification
- Packaging
- Organizational policy

Do not assume:

```text
Open Source = No Restrictions
```

Open-source software still has license terms.

---

# 24. License Policy

An organization may define:

```text
Allowed
├── MIT
├── Apache-2.0
└── BSD

Review
├── LGPL
└── MPL

Restricted
└── Organization-specific prohibited licenses
```

The exact policy must be determined by the organization's legal and compliance requirements.

---

# 25. Open-Source Software Supply Chain

Modern applications depend on a large ecosystem.

```text
Developer
   │
   ▼
Package Registry
   │
   ▼
Open-Source Package
   │
   ▼
Application
   │
   ▼
Production
```

Supply-chain attacks can target:

- Package maintainers
- Package registries
- Build systems
- CI/CD
- Dependencies
- Developer accounts
- Publishing credentials

SCA provides visibility but is only one part of supply-chain security.

---

# 26. Dependency Confusion

Dependency confusion occurs when a build system retrieves an unintended package because of package naming or repository-resolution behavior.

Conceptually:

```text
Internal Package Name
        │
        ▼
Dependency Resolver
        │
        ├── Internal Repository
        │
        └── Public Repository
                │
                ▼
          Malicious Package
```

Controls can include:

- Private package registries
- Repository priority controls
- Namespace controls
- Package allowlists
- Dependency verification

---

# 27. Typosquatting

Attackers may create packages with names similar to legitimate packages.

Example:

```text
legitimate-package
legitmate-package
```

A developer may accidentally install the malicious package.

Controls include:

- Approved package repositories
- Dependency review
- Package reputation
- Lock files
- SCA
- Automated dependency policies

---

# 28. Malicious Packages

Not all supply-chain risks are known CVEs.

A package can be malicious without having a traditional vulnerability record.

Example:

```text
Developer
   │
   ▼
Malicious Package
   │
   ▼
Build
   │
   ▼
Application
   │
   ▼
Credential Theft
```

This is why supply-chain security must go beyond CVE scanning.

---

# 29. Dependency Pinning

A dependency should ideally be controlled rather than silently changing.

Example:

```text
Risky:

library: latest
```

Better:

```text
library: 2.7.4
```

Even better for some environments:

```text
Pinned Version
+
Integrity Verification
+
Controlled Update Process
```

Exact strategies vary by ecosystem.

---

# 30. Automated Dependency Updates

Tools can create pull requests for dependency updates.

Conceptually:

```text
New Version Available
       │
       ▼
Automated Update
       │
       ▼
Pull Request
       │
       ├── Tests
       ├── SAST
       ├── SCA
       └── Security Checks
       │
       ▼
Review
       │
       ▼
Merge
```

This reduces dependency-update friction.

---

# 31. Dependabot

**GitHub Dependabot** can identify outdated or vulnerable dependencies and create pull requests in supported workflows.

Conceptually:

```text
Repository
    │
    ▼
Dependabot
    │
    ▼
Dependency Update PR
    │
    ▼
CI Tests
    │
    ▼
Review
```

It is particularly convenient for GitHub repositories.

---

# 32. Renovate

**Renovate** is an automated dependency-update tool that supports many ecosystems and repository platforms.

Typical workflow:

```text
Dependency Update
       │
       ▼
Renovate
       │
       ▼
Pull Request
       │
       ▼
CI/CD
       │
       ▼
Merge
```

Renovate provides extensive configuration options for update grouping and scheduling.

---

# 33. Snyk

**Snyk** provides developer-oriented security capabilities including open-source dependency analysis.

Conceptually:

```text
Application
   │
   ▼
Snyk
   │
   ├── Dependencies
   ├── Vulnerabilities
   ├── Fix Recommendations
   └── Monitoring
```

It can integrate into developer workflows and CI/CD.

---

# 34. OWASP Dependency-Check

**OWASP Dependency-Check** is an open-source tool designed to identify known vulnerabilities in project dependencies.

Typical flow:

```text
Build
  │
  ▼
Dependency-Check
  │
  ▼
CVE Matching
  │
  ▼
Report
```

It is particularly common in Java/Maven and related build environments, though its capabilities extend beyond a single ecosystem.

---

# 35. GitHub Dependency Graph

GitHub can maintain a dependency graph for repositories and use dependency information for security features.

Conceptually:

```text
Repository
    │
    ▼
Dependency Graph
    │
    ├── Direct Dependencies
    ├── Transitive Dependencies
    └── Dependency Updates
```

This can provide useful visibility before introducing a dedicated enterprise SCA platform.

---

# 36. GitHub Advanced Security

GitHub Advanced Security provides security capabilities that can include:

- Code scanning
- Secret scanning
- Dependency review
- Dependency-related security features

The exact feature set depends on the GitHub plan and repository configuration.

---

# 37. SCA Tool Landscape

Common tools include:

| Tool | Typical Strength |
|---|---|
| **Snyk Open Source** | Developer-focused dependency security |
| **GitHub Dependabot** | Dependency updates and GitHub integration |
| **GitHub Dependency Review** | PR dependency-change visibility |
| **OWASP Dependency-Check** | Open-source dependency vulnerability scanning |
| **Renovate** | Flexible automated dependency updates |
| **Mend** | Enterprise open-source governance |
| **JFrog Xray** | Artifact/repository and component security |
| **Black Duck** | Enterprise open-source risk and license management |
| **Sonatype Lifecycle** | Component governance and supply-chain security |
| **Trivy** | Broad vulnerability scanning including packages and images |

Capabilities overlap, and many tools now combine SCA with SBOM, container, IaC, or broader software-supply-chain capabilities.

---

# 38. SCA Tool Selection

Consider:

```text
Languages
   │
   ▼
Package Ecosystems
   │
   ▼
Vulnerability Intelligence
   │
   ▼
License Analysis
   │
   ▼
Reachability
   │
   ▼
SBOM
   │
   ▼
CI/CD Integration
   │
   ▼
Developer Experience
   │
   ▼
Enterprise Governance
```

Do not choose an SCA tool only because it reports the highest number of vulnerabilities.

---

# 39. Dependency Review in Pull Requests

Suppose a pull request changes:

```text
spring-core
2.7.x → 2.7.y
```

Dependency review can answer:

```text
What changed?
       │
       ▼
Which component?
       │
       ▼
Which version?
       │
       ▼
Does the new version introduce risk?
```

This is especially useful for preventing risky dependencies from being introduced through pull requests.

---

# 40. SCA Security Gate

A simple policy:

```text
Dependency Scan
      │
      ▼
Vulnerability
      │
      ▼
Risk Evaluation
      │
 ┌────┴───────────────┐
 │                    │
Pass                 Fail
 │                    │
 ▼                    ▼
Build              Block
```

A mature policy may consider:

```text
Severity
+
Exploitability
+
Reachability
+
Exposure
+
Fix Availability
+
Business Impact
```

---

# 41. Avoiding "CVSS = Block"

A common anti-pattern is:

```text
CVSS >= 7
     │
     ▼
Always Block
```

This can create unnecessary pipeline failures.

A better approach:

```text
CVSS
 +
Exploit Intelligence
 +
Reachability
 +
Exposure
 +
Business Context
 =
Risk
```

---

# 42. Vulnerability Remediation

A vulnerability can usually be addressed by:

```text
1. Upgrade Dependency
2. Apply Vendor Patch
3. Replace Dependency
4. Remove Unused Dependency
5. Apply Temporary Mitigation
6. Accept Risk with Approval
```

Preferred order often starts with removing or upgrading the vulnerable component when practical.

---

# 43. Dependency Upgrade

Example:

```text
Current:
library 1.4.0

Fixed:
library 1.4.3
```

The remediation may be:

```text
1. Update version
2. Resolve dependency graph
3. Run tests
4. Run SAST
5. Run SCA
6. Build
7. Deploy
```

---

# 44. Dependency Replacement

If a component is abandoned:

```text
Application
   │
   ▼
Unmaintained Library
```

The better long-term approach may be:

```text
Application
   │
   ▼
Supported Alternative
```

SCA should therefore support architectural decisions, not just patching.

---

# 45. Removing Unused Dependencies

Unused dependencies increase attack surface.

Example:

```text
Application
│
├── Required Library A
├── Required Library B
└── Unused Library C
```

Remove:

```text
Library C
```

This reduces:

```text
Dependency Count
Attack Surface
Maintenance Burden
```

---

# 46. Dependency Freshness

Security risk can increase when dependencies remain outdated.

A useful metric is:

```text
Dependency Age
```

For example:

```text
Current Version
      │
      ▼
Available Version
      │
      ▼
Gap
```

Organizations can establish update policies for critical dependencies.

---

# 47. End-of-Life Components

An application may depend on:

```text
Framework
     │
     ▼
End-of-Life Version
```

Even without a known CVE, this can create risk because security fixes may no longer be available.

SCA and software inventory processes should help identify unsupported components.

---

# 48. Vulnerability Exceptions

Sometimes a dependency cannot immediately be upgraded.

An exception should capture:

```text
Dependency
Vulnerability
Business Justification
Risk
Compensating Control
Owner
Expiration
Approval
```

Example:

```text
CVE
 │
 ▼
Cannot Upgrade Immediately
 │
 ▼
Temporary Mitigation
 │
 ▼
Exception
 │
 ▼
Expiry
 │
 ▼
Reassessment
```

---

# 49. Vulnerability Suppression

Suppression should not mean:

```text
Ignore Forever
```

A mature process is:

```text
Finding
   │
   ▼
Validate
   │
   ▼
Suppress if justified
   │
   ▼
Document
   │
   ▼
Review periodically
```

---

# 50. SCA and SBOM Generation

A pipeline can generate an SBOM:

```text
Source
   │
   ▼
Build
   │
   ▼
Dependency Resolution
   │
   ▼
SBOM
   │
   ├── Component
   ├── Version
   ├── License
   └── Relationship
```

Common formats:

```text
SPDX
CycloneDX
```

---

# 51. SBOM Example

A simplified SBOM:

```text
Application: payments-service

Components:

1. spring-core
   Version: X.Y.Z

2. jackson-databind
   Version: X.Y.Z

3. postgresql
   Version: X.Y.Z

4. logback
   Version: X.Y.Z
```

Real SBOMs contain substantially more metadata.

---

# 52. SBOM Use Cases

An SBOM can support:

- Vulnerability response
- Dependency inventory
- License management
- Customer security questionnaires
- Regulatory requirements
- Incident response
- Supply-chain visibility

Example:

```text
New Critical Vulnerability
       │
       ▼
Search SBOM Inventory
       │
       ▼
Which applications contain it?
       │
       ▼
Prioritize remediation
```

---

# 53. Vulnerability Response Using SBOM

Imagine a critical vulnerability is announced.

Without an inventory:

```text
"Which applications use this library?"
      │
      ▼
Manual Investigation
```

With SBOM:

```text
CVE
 │
 ▼
Component
 │
 ▼
SBOM Search
 │
 ▼
Affected Applications
 │
 ▼
Owners
 │
 ▼
Remediation
```

This can dramatically improve response speed.

---

# 54. SCA and Containers

Modern applications often package application dependencies into container images.

```text
Application
   │
   ▼
Dependencies
   │
   ▼
Container Build
   │
   ▼
Image
   │
   ▼
Registry
```

Security may require both:

```text
SCA
+
Container Scanning
```

---

# 55. OS Packages vs Application Packages

Container images can contain:

```text
Application Packages
   +
OS Packages
```

Example:

```text
Node.js Application
│
├── npm packages
│
└── Alpine/Debian packages
```

Application SCA and container scanning can cover different layers.

---

# 56. Multi-Layer Dependency Model

Think of the software supply chain as layers:

```text
Application
    │
    ▼
Application Dependencies
    │
    ▼
Runtime
    │
    ▼
OS Packages
    │
    ▼
Base Image
    │
    ▼
Infrastructure
```

Each layer can introduce risk.

---

# 57. Dependency Provenance

A mature supply chain asks:

> **Where did this component come from?**

Questions include:

- Which repository?
- Which package registry?
- Which version?
- Which publisher?
- Was integrity verified?
- Which build produced it?
- Which artifact was deployed?

This extends SCA into broader supply-chain security.

---

# 58. Artifact Integrity

Dependency security can be strengthened with integrity controls.

Conceptually:

```text
Package
   │
   ▼
Integrity Check
   │
   ▼
Trusted Artifact
```

Examples of mechanisms include:

- Checksums
- Signatures
- Trusted registries
- Provenance attestations

---

# 59. Dependency Confusion Controls

Useful controls include:

```text
Private Registry
       +
Scoped Namespaces
       +
Repository Priority
       +
Package Allowlist
       +
Dependency Review
       +
Lock Files
```

CI/CD should avoid accidentally resolving internal packages from untrusted public repositories.

---

# 60. SCA in Java/Maven

Typical files:

```text
pom.xml
```

Useful commands:

```bash
mvn dependency:tree
```

Conceptually:

```text
pom.xml
   │
   ▼
Maven
   │
   ▼
Dependency Tree
   │
   ▼
SCA
```

Example dependency relationship:

```text
Application
  │
  └── spring-web
       └── spring-core
```

---

# 61. SCA in Node.js

Typical files:

```text
package.json
package-lock.json
```

Dependency tree:

```bash
npm ls
```

Conceptually:

```text
package.json
     │
     ▼
npm
     │
     ▼
package-lock.json
     │
     ▼
Resolved Dependencies
     │
     ▼
SCA
```

---

# 62. SCA in Python

Typical files:

```text
requirements.txt
pyproject.toml
poetry.lock
```

A modern Python project should ideally use a controlled dependency-resolution strategy.

Conceptually:

```text
pyproject.toml
      │
      ▼
Dependency Resolver
      │
      ▼
Lock / Resolved Set
      │
      ▼
SCA
```

---

# 63. SCA in .NET

Typical files:

```text
*.csproj
packages.config
packages.lock.json
```

Conceptually:

```text
Project
  │
  ▼
NuGet
  │
  ▼
Resolved Packages
  │
  ▼
SCA
```

---

# 64. SCA in Go

Typical files:

```text
go.mod
go.sum
```

Go modules make dependency versions explicit.

Conceptually:

```text
go.mod
  │
  ▼
Go Modules
  │
  ▼
Resolved Dependencies
  │
  ▼
SCA
```

---

# 65. SCA in CI/CD

A practical pipeline:

```text
Pull Request
     │
     ▼
Dependency Review
     │
     ▼
SCA
     │
     ▼
Security Gate
     │
     ▼
Build
     │
     ▼
Container
     │
     ▼
Container Scan
```

---

# 66. Example GitHub Actions SCA Workflow

Conceptual example:

```yaml
name: Dependency Security

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  sca:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run dependency analysis
        run: |
          echo "Run approved SCA tool here"

      - name: Apply policy
        run: |
          echo "Evaluate vulnerabilities and licenses"
```

For production use, use the selected SCA provider's official action or CLI and apply organization-specific action-pinning policies.

---

# 67. Dependency Review Gate

A PR might introduce:

```text
New dependency:
example-library 1.0.0
```

The dependency review process should ask:

```text
Is it new?
     │
     ▼
Is it vulnerable?
     │
     ▼
What license does it use?
     │
     ▼
Is it approved?
     │
     ▼
Does it introduce unacceptable risk?
```

---

# 68. SCA Policy as Code

Dependency policies can be automated.

Example:

```text
IF
  dependency has Critical vulnerability
AND
  fix is available
THEN
  block merge
```

Another:

```text
IF
  dependency uses restricted license
THEN
  require approval
```

This creates consistent policy enforcement.

---

# 69. Vulnerability Prioritization

A useful prioritization model:

```text
                 Vulnerability
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
     Severity      Exploitability   Reachability
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                    Exposure
                       │
                       ▼
                Business Impact
                       │
                       ▼
                    Priority
```

---

# 70. Example Prioritization

### Finding A

```text
Critical CVE
+
Internet-facing service
+
Known exploitation
+
Reachable vulnerable code
```

Priority:

```text
URGENT
```

### Finding B

```text
Medium CVE
+
Internal tool
+
Vulnerable code unreachable
+
No known exploitation
```

Priority:

```text
PLANNED
```

This is why context matters.

---

# 71. SCA Dashboard

An enterprise dashboard may track:

```text
Applications
    │
    ├── Critical Vulnerabilities
    ├── High Vulnerabilities
    ├── Outdated Dependencies
    ├── Unsupported Components
    ├── License Issues
    └── Remediation SLA
```

Useful metrics:

- Vulnerabilities by severity
- Vulnerabilities by application
- Vulnerabilities by team
- Dependency age
- Unsupported components
- Fixable vulnerabilities
- Mean time to remediate
- License policy violations

---

# 72. SCA Metrics

## Dependency Coverage

```text
Applications with SCA
---------------------
Total Applications
```

## Critical Vulnerability Aging

How long critical dependency vulnerabilities remain open.

## Dependency Freshness

Average age or lag of dependencies.

## Fix Availability

Percentage of findings with an available fixed version.

## Remediation Rate

```text
Closed Findings
---------------
Opened Findings
```

## License Compliance

Number of unresolved policy violations.

---

# 73. SCA Maturity Model

## Level 1 — Manual

```text
Developers Manually Check Dependencies
```

## Level 2 — Automated Scanning

```text
CI
 │
 └── SCA
```

## Level 3 — Pull Request Integration

```text
PR
 │
 └── Dependency Review
```

## Level 4 — Risk-Based Gates

```text
SCA
 │
 ▼
Risk Policy
 │
 ├── Pass
 └── Fail
```

## Level 5 — SBOM and Supply Chain

```text
SCA
+
SBOM
+
Provenance
+
Artifact Integrity
```

## Level 6 — Continuous Dependency Management

```text
Detect
  │
  ▼
Prioritize
  │
  ▼
Update
  │
  ▼
Test
  │
  ▼
Deploy
  │
  ▼
Monitor
```

---

# 74. SCA Anti-Patterns

## Anti-Pattern 1: Scan Only Direct Dependencies

Transitive dependencies can also introduce vulnerabilities.

## Anti-Pattern 2: Ignore License Risk

Security is not the only component risk.

## Anti-Pattern 3: Block Every CVE

Context and exploitability matter.

## Anti-Pattern 4: Never Update Dependencies

Security debt accumulates.

## Anti-Pattern 5: Ignore End-of-Life Components

Unsupported software may remain risky even without a current CVE.

## Anti-Pattern 6: No Ownership

Every finding needs an owner.

## Anti-Pattern 7: Manual Inventory

Large organizations cannot reliably maintain dependency inventories manually.

## Anti-Pattern 8: Ignore Supply-Chain Attacks

Known-CVE scanning alone cannot detect every malicious package.

---

# 75. SCA Best Practices

## Dependency Management

- Keep dependencies current.
- Remove unused dependencies.
- Use lock files where appropriate.
- Pin or otherwise control versions.
- Review dependency changes.

## Security

- Scan direct and transitive dependencies.
- Monitor vulnerability intelligence continuously.
- Prioritize exploitable vulnerabilities.
- Track remediation SLAs.
- Use SBOMs.

## Supply Chain

- Use trusted registries.
- Control repository resolution.
- Verify artifact integrity.
- Protect package publishing.
- Secure CI/CD.

## Governance

- Define license policy.
- Define vulnerability thresholds.
- Create exception processes.
- Assign ownership.
- Measure remediation.

---

# 76. End-to-End SCA Lifecycle

```text
DEPENDENCY DECLARED
        │
        ▼
DEPENDENCY RESOLVED
        │
        ▼
COMPONENT INVENTORY
        │
        ▼
VULNERABILITY MATCHING
        │
        ▼
LICENSE ANALYSIS
        │
        ▼
RISK PRIORITIZATION
        │
        ▼
SECURITY GATE
        │
        ├── PASS
        │
        └── FAIL
              │
              ▼
          REMEDIATION
              │
              ▼
        DEPENDENCY UPDATE
              │
              ▼
             TEST
              │
              ▼
            RESCAN
              │
              ▼
            RELEASE
              │
              ▼
          CONTINUOUS MONITORING
```

---

# 77. Complete Software Supply Chain Model

```text
                         SOURCE
                           │
                           ▼
                      APPLICATION
                           │
                           ▼
                    DEPENDENCIES
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Direct       Transitive     Runtime
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                          SCA
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
            CVE         License        SBOM
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                     Risk Assessment
                           │
                           ▼
                       CI/CD Gate
                           │
                           ▼
                         BUILD
                           │
                           ▼
                      CONTAINER
                           │
                           ▼
                    IMAGE SCANNING
                           │
                           ▼
                         RELEASE
```

---

# 78. Real-World Example

Consider an e-commerce application:

```text
E-Commerce
│
├── Spring Boot
├── Jackson
├── PostgreSQL Driver
├── Redis Client
├── Logging Framework
└── Payment SDK
```

The payment SDK introduces:

```text
Payment SDK
    │
    ▼
Dependency A
    │
    ▼
Dependency B
    │
    ▼
Vulnerable Library
```

The developer may never see Dependency B directly.

SCA discovers:

```text
Application
    │
    ▼
Payment SDK
    │
    ▼
Dependency A
    │
    ▼
Vulnerable Dependency B
```

The team can then:

```text
Identify
   │
   ▼
Prioritize
   │
   ▼
Upgrade Payment SDK
   │
   ▼
Retest
   │
   ▼
Rescan
```

---

# 79. Incident Response with SCA

Suppose a critical vulnerability is announced:

```text
Critical Vulnerability
       │
       ▼
Component X
       │
       ▼
Search Dependency Inventory
       │
       ▼
Affected Applications
       │
       ▼
Application Owners
       │
       ▼
Remediation
```

An accurate component inventory can significantly reduce the time needed to determine exposure.

---

# 80. SCA and Continuous Monitoring

A dependency can become vulnerable after the application was deployed.

Example:

```text
Day 1
Application deployed
      │
      ▼
No Known CVE
```

Later:

```text
Day 30
New CVE Published
      │
      ▼
Dependency Becomes Vulnerable
```

Therefore:

> **SCA should not be treated as a one-time build activity.**

Continuous monitoring is important for deployed software inventories.

---

# 81. SCA and Runtime Exposure

Consider:

```text
Vulnerable Dependency
        │
        ├── Internet-facing
        │
        └── Internal-only
```

The same CVE may have different risk depending on exposure.

Therefore:

```text
Component Risk
+
Application Context
+
Exposure
=
Actual Risk
```

---

# 82. SCA and Cloud-Native Applications

Cloud-native applications often have:

```text
Microservice A
 ├── Dependencies

Microservice B
 ├── Dependencies

Microservice C
 ├── Dependencies
```

The number of components can grow rapidly.

Centralized SCA and SBOM management becomes increasingly valuable.

---

# 83. SCA for Microservices

A useful model:

```text
                         Application
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
          Service A        Service B       Service C
              │               │               │
              ▼               ▼               ▼
          Dependencies    Dependencies    Dependencies
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                             SCA
                              │
                              ▼
                         Risk Platform
```

Each service should have clear ownership.

---

# 84. SCA and Monorepos

A monorepo may contain:

```text
repo/
├── frontend/
├── backend/
├── service-a/
├── service-b/
├── shared-library/
└── tools/
```

SCA should understand which dependency belongs to which deployable component.

This improves ownership and remediation.

---

# 85. SCA and Build Artifacts

Dependency analysis can occur at multiple points:

```text
Manifest
   │
   ▼
Resolved Dependencies
   │
   ▼
Build Artifact
   │
   ▼
Container Image
```

Analyzing both declared and built components can reveal differences between intended and actual software composition.

---

# 86. SCA and Build Reproducibility

A reproducible build helps establish:

```text
Source
 +
Dependency Versions
 +
Build Tool Versions
 =
Predictable Artifact
```

Lock files, pinned build tools, controlled repositories, and provenance mechanisms can strengthen reproducibility.

---

# 87. SCA and Artifact Provenance

A stronger supply-chain model is:

```text
Source
  │
  ▼
Trusted Build
  │
  ▼
Dependency Set
  │
  ▼
Artifact
  │
  ▼
SBOM
  │
  ▼
Provenance
  │
  ▼
Signed Artifact
  │
  ▼
Deployment
```

This provides stronger evidence about what was built and where it came from.

---

# 88. SCA Interview Questions

## Beginner

### What is SCA?

SCA identifies third-party and open-source software components and evaluates their security, licensing, and supply-chain risks.

### Why is SCA important?

Applications depend heavily on external libraries, and vulnerabilities in those libraries can affect the application even when the organization's own code is secure.

### What is a direct dependency?

A dependency explicitly declared by the application.

### What is a transitive dependency?

A dependency introduced indirectly through another dependency.

---

## Intermediate

### What is the difference between SAST and SCA?

SAST analyzes application code for coding and security weaknesses, while SCA analyzes third-party components and their associated risks.

### What is an SBOM?

A Software Bill of Materials is a structured inventory of software components and their relationships.

### What is CVSS?

CVSS is a standardized vulnerability severity scoring system.

### What is dependency reachability?

It is the analysis of whether vulnerable functionality in a dependency can actually be reached or exercised by the application.

---

## Advanced

### Why shouldn't every high-CVSS vulnerability block a pipeline?

Because actual risk depends on exploitability, reachability, exposure, business impact, compensating controls, and other context.

### How would you implement SCA in CI/CD?

A strong answer includes:

1. Dependency discovery.
2. Direct and transitive dependency analysis.
3. Vulnerability matching.
4. License analysis.
5. Risk-based security gates.
6. Automated dependency updates.
7. SBOM generation.
8. Continuous monitoring.
9. Vulnerability ownership and SLAs.
10. Exception management.

### How would you handle a critical vulnerable transitive dependency?

```text
Identify dependency path
        │
        ▼
Validate exposure
        │
        ▼
Check fixed versions
        │
        ▼
Upgrade direct dependency
        │
        ▼
Run tests
        │
        ▼
Rescan
        │
        ▼
Deploy
```

If no fix exists, apply appropriate mitigation and manage the risk through an approved exception process.

---

# 89. SCA Decision Framework

When an SCA finding appears, ask:

```text
1. WHAT component is affected?
             │
             ▼
2. WHICH version is present?
             │
             ▼
3. HOW is it introduced?
   Direct or Transitive?
             │
             ▼
4. WHAT vulnerability exists?
             │
             ▼
5. IS vulnerable code reachable?
             │
             ▼
6. IS the application exposed?
             │
             ▼
7. IS exploitation known?
             │
             ▼
8. IS a fixed version available?
             │
             ▼
9. WHAT is the business impact?
             │
             ▼
10. WHAT is the remediation?
```

---

# 90. Final SCA Mental Model

```text
                         APPLICATION
                              │
                              ▼
                        DEPENDENCIES
                              │
                ┌─────────────┴─────────────┐
                │                           │
             Direct                    Transitive
                │                           │
                └─────────────┬─────────────┘
                              ▼
                        COMPONENT GRAPH
                              │
                              ▼
                             SCA
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
     Vulnerabilities       Licenses             SBOM
          │                   │                   │
          ▼                   ▼                   ▼
      CVE/CVSS             Policy            Inventory
          │
          ▼
      Exploitability
          │
          ▼
      Reachability
          │
          ▼
        Exposure
          │
          ▼
         Risk
          │
          ▼
     Remediation
          │
          ▼
        Rescan
```

---

# 91. Quick Reference

```text
SCA
│
├── Purpose
│   ├── Component Inventory
│   ├── Vulnerability Detection
│   ├── License Analysis
│   └── Supply-Chain Visibility
│
├── Dependencies
│   ├── Direct
│   └── Transitive
│
├── Security Intelligence
│   ├── CVE
│   ├── CVSS
│   ├── EPSS
│   └── KEV
│
├── Analysis
│   ├── Dependency Graph
│   ├── Reachability
│   ├── Version Analysis
│   └── License Analysis
│
├── Supply Chain
│   ├── Dependency Confusion
│   ├── Typosquatting
│   ├── Malicious Packages
│   ├── Integrity
│   └── Provenance
│
├── Artifacts
│   ├── SBOM
│   ├── SPDX
│   └── CycloneDX
│
├── Tools
│   ├── Snyk
│   ├── Dependabot
│   ├── Dependency Review
│   ├── OWASP Dependency-Check
│   ├── Renovate
│   ├── Mend
│   ├── Black Duck
│   ├── Sonatype
│   ├── JFrog Xray
│   └── Trivy
│
└── CI/CD
    ├── Pull Request
    ├── Security Gate
    ├── Dependency Updates
    ├── SBOM
    └── Continuous Monitoring
```

---

# 92. Key Takeaway

> **SCA gives an organization visibility and control over the open-source and third-party components that make up its software.**

Remember:

```text
DEPENDENCY
    │
    ▼
IDENTIFY
    │
    ▼
VERSION
    │
    ▼
VULNERABILITY
    │
    ▼
REACHABILITY
    │
    ▼
EXPOSURE
    │
    ▼
RISK
    │
    ▼
REMEDIATE
    │
    ▼
RESCAN
```

And remember the larger DevSecOps relationship:

```text
                    DEVSECOPS
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
      SAST             SCA              DAST
       │                │                │
   Your Code       Dependencies      Running App
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                 Security Gates
                        │
                        ▼
                     Release
```

The strongest SCA programs do not simply count CVEs.

They answer:

> **What components do we have, which risks affect them, which applications are exposed, how important are those risks, and how quickly can we remediate them?**

---

# 93. Related Knowledge

- [`README.md`](README.md)
- [`devsecops.md`](devsecops.md)
- [`sast.md`](sast.md)
- [`dast.md`](dast.md)
- [`container-scanning.md`](container-scanning.md)
- [`secrets-scanning.md`](secrets-scanning.md)
