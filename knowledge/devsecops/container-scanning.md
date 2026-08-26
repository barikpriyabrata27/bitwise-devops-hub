# Container Scanning

> Container scanning is the process of analyzing container images for vulnerabilities, insecure configurations, exposed secrets, and other security risks before the images are deployed.

---

# 📚 Overview

Containers package an application together with its runtime dependencies, libraries, configuration, and operating-system components.

This makes application delivery consistent and portable, but it also creates a security responsibility:

> **A vulnerable application inside a secure container is still vulnerable, and a secure application inside a vulnerable container is also a risk.**

Container scanning helps identify these issues before a container image reaches production.

A typical container security flow is:

```text
Source Code
     │
     ▼
Application Build
     │
     ▼
Dockerfile
     │
     ▼
Container Image
     │
     ▼
Container Scan
     │
     ├───────────────┐
     │               │
     ▼               ▼
 Vulnerabilities   Misconfiguration
     │               │
     └───────┬───────┘
             ▼
       Security Gate
             │
       ┌─────┴─────┐
       │           │
      FAIL        PASS
       │           │
       ▼           ▼
     Stop       Push Image
     Build          │
                    ▼
                Registry
                    │
                    ▼
                Deployment
```

---

# 🎯 Why Container Scanning Is Important

A container image can contain many components besides your application.

For example:

```text
Container Image
│
├── Application
│
├── Application Dependencies
│
├── Runtime
│
├── OS Packages
│
├── System Libraries
│
├── Configuration
│
└── Other Files
```

Any of these components can contain vulnerabilities.

For example:

```text
Application
    │
    └── Uses Java 21
            │
            └── Uses Maven dependencies
                    │
                    └── Uses Linux base image
                            │
                            └── Contains OS packages
```

A vulnerability in any layer can potentially introduce risk.

---

# 🏗️ Container Image Layers

Container images are generally composed of multiple filesystem layers.

For example:

```text
┌───────────────────────────────┐
│       Application Layer       │
├───────────────────────────────┤
│       Dependency Layer        │
├───────────────────────────────┤
│       Runtime Layer           │
├───────────────────────────────┤
│       OS Package Layer        │
├───────────────────────────────┤
│       Base Image              │
└───────────────────────────────┘
```

A scanner can analyze these layers to identify vulnerable packages and components.

---

# 🔍 What Does Container Scanning Detect?

Container scanning can identify several categories of security problems.

## 1. OS Package Vulnerabilities

The base image may contain vulnerable packages.

Examples:

```text
Ubuntu
Debian
Alpine
Red Hat UBI
Amazon Linux
```

A scanner may report:

```text
Package: openssl
Version: x.y.z
Severity: HIGH
CVE: CVE-XXXX-XXXXX
Fixed Version: x.y.z+1
```

---

## 2. Application Dependency Vulnerabilities

Container scanning can sometimes identify application dependencies embedded inside the image.

For example:

```text
Application
    │
    ├── Spring Framework
    ├── Jackson
    ├── Log4j
    └── Other Libraries
```

For dedicated dependency analysis, however, **SCA should normally be used as well**.

See:

**[`sca.md`](sca.md)**

---

# 3. Base Image Vulnerabilities

The base image is one of the most important parts of container security.

Example:

```dockerfile
FROM ubuntu:22.04
```

If the base image contains vulnerable packages, the resulting application image can inherit those vulnerabilities.

Therefore:

> **Keep base images updated and use trusted, minimal base images.**

---

# 4. Misconfiguration

Some container scanners can identify insecure configurations.

Examples include:

* Running as root
* Excessive privileges
* Insecure Dockerfile instructions
* Missing health checks
* Writable sensitive directories
* Unnecessary packages
* Insecure file permissions

Example:

```dockerfile
USER root
```

Running an application as root may increase the impact of a container compromise.

Prefer:

```dockerfile
USER appuser
```

when practical.

---

# 5. Secrets

A container image may accidentally contain:

```text
API Keys
Passwords
Private Keys
Tokens
Cloud Credentials
Certificates
```

Example:

```dockerfile
COPY application.properties /app/
```

If `application.properties` contains credentials, those credentials may become part of the image.

Secrets should instead be injected securely at runtime.

See:

**[`secrets-scanning.md`](secrets-scanning.md)**

---

# 6. Malware and Suspicious Files

Some security platforms can also identify suspicious files or known malware signatures.

This capability depends on the scanner.

---

# 🐳 Dockerfile Security

Container security begins before the image is built.

A Dockerfile should follow secure development practices.

## Avoid

```dockerfile
FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y curl

COPY . /app

USER root

CMD ["./application"]
```

Problems may include:

* Mutable `latest` tag
* Excess packages
* Root execution
* Large build context
* Potentially unnecessary files
* Lack of dependency cleanup

---

# ✅ Better Approach

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/application.jar application.jar

RUN useradd --system --create-home appuser

USER appuser

ENTRYPOINT ["java", "-jar", "application.jar"]
```

The exact base image and user-management commands depend on the chosen distribution.

The important principles are:

* Use a trusted base image
* Minimize installed packages
* Run as a non-root user
* Copy only required artifacts
* Avoid unnecessary files
* Keep the image small
* Update dependencies regularly

---

# 📦 Minimal Images

Smaller images generally have fewer packages and therefore potentially fewer components that can contain vulnerabilities.

A common progression is:

```text
Large OS Image
      │
      ▼
Minimal OS Image
      │
      ▼
Distroless Image
      │
      ▼
Application + Required Runtime Only
```

However, smaller does not automatically mean secure.

The image must still be:

* Supported
* Maintained
* Patched
* Compatible with the application
* Scanned

---

# 🏷️ Image Tags

Avoid relying only on mutable tags such as:

```text
latest
```

Prefer controlled versioning:

```text
myapp:1.4.2
```

or immutable image digests:

```text
myapp@sha256:<digest>
```

This improves reproducibility and helps ensure that the exact image tested is the image deployed.

---

# 🔐 Container Image Registry

A typical secure flow is:

```text
Developer
    │
    ▼
Git Repository
    │
    ▼
CI Pipeline
    │
    ▼
Build Image
    │
    ▼
Scan Image
    │
    ▼
Security Gate
    │
    ▼
Container Registry
    │
    ▼
Deployment
```

Examples of container registries include:

* GitHub Container Registry
* Amazon Elastic Container Registry
* Azure Container Registry
* Google Artifact Registry
* Docker Hub
* Harbor

---

# 🚦 Container Security Gate

The scanner produces findings.

The CI/CD pipeline can use those findings to decide whether the image should continue.

Example:

```text
Container Scan
      │
      ▼
Findings?
      │
      ▼
┌─────────────────────┐
│ Severity Evaluation │
└──────────┬──────────┘
           │
     ┌─────┼───────────┐
     │     │           │
     ▼     ▼           ▼
    LOW  MEDIUM    HIGH/CRITICAL
     │     │           │
     ▼     ▼           ▼
   Warn  Review        FAIL
                       │
                       ▼
                   Stop Build
```

A production organization should define these thresholds explicitly.

For example:

```text
CRITICAL vulnerability
        │
        ▼
Pipeline FAIL
```

Another organization may allow a vulnerability if:

* There is no available fix
* It is not exploitable in the application's environment
* A compensating control exists
* The risk has been formally accepted

Security gates should therefore be **risk-based**, not blindly scanner-based.

---

# 🛠️ Popular Container Scanning Tools

Some commonly used tools include:

| Tool           | Primary Use                                                        |
| -------------- | ------------------------------------------------------------------ |
| Trivy          | Vulnerability, configuration, secret and related security scanning |
| Grype          | Container and filesystem vulnerability scanning                    |
| Docker Scout   | Container image analysis and supply-chain insights                 |
| Clair          | Container vulnerability analysis                                   |
| Anchore        | Container and software supply-chain security                       |
| Snyk Container | Container vulnerability management                                 |
| Prisma Cloud   | Cloud-native and container security                                |
| Aqua Security  | Container and cloud-native security                                |

The best tool depends on the organization's ecosystem and security requirements.

---

# 🔎 Trivy

Trivy is a popular open-source security scanner.

It can scan:

* Container images
* Filesystems
* Git repositories
* Kubernetes configurations
* Infrastructure-as-Code
* Vulnerabilities
* Secrets
* Misconfigurations

Example:

```bash
trivy image myapp:1.0.0
```

Example with severity filtering:

```bash
trivy image --severity HIGH,CRITICAL myapp:1.0.0
```

A CI pipeline can use the scanner's exit code to determine whether the build should fail.

---

# 🔄 Container Scanning in GitHub Actions

A simplified GitHub Actions workflow can look like:

```yaml
name: Container Security

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  container-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build image
        run: |
          docker build -t myapp:${{ github.sha }} .

      - name: Scan image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          format: table
          severity: HIGH,CRITICAL
          exit-code: '1'
```

The important concept is:

```text
Build
  │
  ▼
Scan
  │
  ▼
HIGH / CRITICAL?
  │
 ┌┴─────────┐
 │          │
YES         NO
 │          │
 ▼          ▼
FAIL       PASS
```

For production repositories, pin actions to trusted immutable versions or commit SHAs according to your organization's supply-chain policy rather than blindly using floating references.

---

# 🧪 Example Pipeline

A more complete pipeline could look like:

```text
                    Pull Request
                         │
                         ▼
                  Secrets Scanning
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
                  Build Container
                         │
                         ▼
                Container Scanning
                         │
                         ▼
                   Security Gate
                         │
                    ┌────┴────┐
                    │         │
                   FAIL      PASS
                    │         │
                    ▼         ▼
                  Stop      Push Image
                              │
                              ▼
                         Container Registry
                              │
                              ▼
                           Deploy
```

---

# 🔐 Container Signing

Scanning answers:

> **"Does this image contain known security problems?"**

Signing answers a different question:

> **"Can I verify that this is the image produced by a trusted build process?"**

A modern container supply chain can therefore look like:

```text
Build
  │
  ▼
Scan
  │
  ▼
Generate SBOM
  │
  ▼
Sign Image
  │
  ▼
Push Registry
  │
  ▼
Verify During Deployment
```

Tools such as **Sigstore Cosign** can be used for container image signing and verification.

---

# 📋 SBOM

**SBOM = Software Bill of Materials**

An SBOM describes the components contained in software.

For a container, this could include:

```text
Container Image
│
├── Base OS
│
├── OS Packages
│
├── Application Runtime
│
├── Application Libraries
│
└── Application Components
```

An SBOM makes it easier to answer:

> "Which applications contain this vulnerable component?"

Common SBOM formats include:

* SPDX
* CycloneDX

SBOM generation can be integrated into CI/CD.

---

# 🔄 Continuous Container Scanning

Scanning only during image creation is not enough.

Consider:

```text
Day 1
Image built
     │
     ▼
No known vulnerabilities
```

Later:

```text
Day 30
New CVE published
     │
     ▼
Existing image becomes vulnerable
```

Therefore:

```text
Build-Time Scan
       +
Registry Monitoring
       +
Continuous Vulnerability Management
```

should be considered for production environments.

---

# ⚠️ Common Container Security Mistakes

## 1. Using `latest`

```dockerfile
FROM ubuntu:latest
```

This makes builds less predictable.

---

## 2. Running as root

```dockerfile
USER root
```

Use a dedicated non-root user whenever possible.

---

## 3. Ignoring scanner findings

A scan is useful only when findings are reviewed and remediated.

---

## 4. Scanning only the application

The base image and operating-system packages also matter.

---

## 5. Using outdated base images

A secure application can still inherit vulnerabilities from an old base image.

---

## 6. Putting secrets inside images

Never bake credentials into an image.

Bad:

```dockerfile
ENV DATABASE_PASSWORD=secret123
```

Better:

```text
Container
   │
   ▼
Runtime Secret
   │
   ├── Kubernetes Secret
   ├── Cloud Secret Manager
   └── External Secrets System
```

---

## 7. Installing unnecessary packages

Every additional package increases the attack surface.

---

## 8. Ignoring false positives

Scanner output must be validated.

Not every finding represents an exploitable vulnerability in the actual application environment.

---

# 🧠 Container Scanning vs SCA

These two controls are related but not identical.

| Area                     | Container Scanning       | SCA                   |
| ------------------------ | ------------------------ | --------------------- |
| Primary Target           | Container image          | Software dependencies |
| OS Packages              | Yes                      | Usually no            |
| Application Dependencies | Often                    | Yes                   |
| Base Image               | Yes                      | No                    |
| Dependency Tree          | Limited / tool-dependent | Strong                |
| License Analysis         | Tool-dependent           | Common                |
| Dockerfile Configuration | Tool-dependent           | No                    |
| Runtime Image            | Yes                      | No                    |

A strong DevSecOps pipeline can use both.

```text
Application Source
       │
       ├──────────► SCA
       │
       ▼
    Container
       │
       └──────────► Container Scan
```

---

# 🧠 Container Scanning vs SAST

These also solve different problems.

```text
Source Code
     │
     └──────► SAST
                  │
                  ▼
           Code Vulnerabilities


Container Image
     │
     └──────► Container Scan
                  │
                  ▼
          Image Vulnerabilities
```

Example:

```text
SAST:
"Your application constructs an unsafe SQL query."

Container Scan:
"Your container contains a vulnerable OpenSSL package."
```

Both findings are important, but they require different remediation.

---

# 🧠 Container Scanning vs DAST

DAST works against the running application.

Container scanning works primarily against the image and its contents.

```text
Container Image
      │
      ▼
Container Scan
      │
      ▼
Image Security
```

versus:

```text
Running Application
      │
      ▼
DAST
      │
      ▼
Runtime Application Security
```

Therefore, these controls complement each other.

---

# 🏗️ Recommended Container Security Lifecycle

A mature approach looks like:

```text
1. Choose Trusted Base Image
             │
             ▼
2. Build Minimal Image
             │
             ▼
3. Run as Non-Root
             │
             ▼
4. Scan Image
             │
             ▼
5. Generate SBOM
             │
             ▼
6. Apply Security Gate
             │
             ▼
7. Sign Image
             │
             ▼
8. Push to Registry
             │
             ▼
9. Verify Before Deployment
             │
             ▼
10. Continuously Monitor
```

---

# 🏆 Best Practices

## Base Image

* Use trusted images.
* Prefer maintained images.
* Keep images updated.
* Avoid unnecessary packages.
* Consider minimal or distroless images where appropriate.
* Pin versions or otherwise ensure reproducibility.

## Dockerfile

* Run applications as non-root.
* Use multi-stage builds where appropriate.
* Avoid embedding secrets.
* Minimize the build context.
* Use `.dockerignore`.
* Avoid unnecessary tools and packages.

## CI/CD

* Scan every relevant image build.
* Fail builds based on defined security policies.
* Generate SBOMs where required.
* Sign trusted images.
* Store scan results.
* Track remediation.

## Registry

* Use access controls.
* Protect production repositories.
* Enable vulnerability monitoring where available.
* Use immutable tags or digests where practical.
* Restrict who can push images.

## Runtime

* Use least privilege.
* Restrict container capabilities.
* Use read-only filesystems where practical.
* Apply network policies.
* Monitor runtime behavior.
* Continuously manage vulnerabilities.

---

# 🚀 Production-Grade Container Security

A mature container security architecture can look like:

```text
                         SOURCE
                           │
                           ▼
                    Git Repository
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
          SAST            SCA       Secrets Scan
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                         BUILD
                           │
                           ▼
                    Container Image
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
                    ┌──────┴──────┐
                    │             │
                   FAIL          PASS
                    │             │
                    ▼             ▼
                  Stop       Sign Image
                                  │
                                  ▼
                           Container Registry
                                  │
                                  ▼
                           Admission Policy
                                  │
                                  ▼
                              Kubernetes
                                  │
                                  ▼
                            Running App
                                  │
                                  ▼
                                DAST
                                  │
                                  ▼
                            Monitoring
```

---

# 📊 Container Security Checklist

Before deploying a container image, consider:

* Is the base image trusted?
* Is the base image maintained?
* Is the image version controlled?
* Is the image scanned?
* Are HIGH and CRITICAL vulnerabilities addressed?
* Are false positives reviewed?
* Is the application running as non-root?
* Are unnecessary packages removed?
* Are secrets excluded from the image?
* Is an SBOM generated?
* Is the image signed?
* Is the registry secured?
* Is the image immutable?
* Is the image continuously monitored?
* Are runtime security controls enabled?

---

# 🎓 Interview Questions

## Beginner

### What is container scanning?

Container scanning is the process of analyzing container images for vulnerabilities, misconfigurations, secrets, and other security risks.

### Why is container scanning required?

Because container images can contain vulnerable OS packages, application dependencies, runtimes, configuration, and other components.

### What is a base image?

A base image provides the initial filesystem and runtime environment from which another container image is built.

### Why should containers not normally run as root?

Running as root can increase the impact of a container compromise because the application has greater privileges inside the container.

---

# 🎓 Intermediate

### What is the difference between SCA and container scanning?

SCA focuses primarily on software dependencies, while container scanning examines the container image and can include OS packages, application components, configurations, and other image contents.

### What is a CVE?

A **CVE (Common Vulnerabilities and Exposures)** is a standardized identifier assigned to a publicly known cybersecurity vulnerability.

Example:

```text
CVE-2026-XXXXX
```

### What is CVSS?

**CVSS (Common Vulnerability Scoring System)** provides a standardized way to represent the severity of vulnerabilities.

The score should be considered alongside environmental and business context rather than used as the only decision factor.

### Why are minimal images useful?

They reduce the number of components and packages that need to be maintained and potentially attacked.

---

# 🎓 Advanced

### Should every HIGH vulnerability fail the pipeline?

Not necessarily.

The decision should consider:

* Exploitability
* Exposure
* Business impact
* Availability of a fix
* Compensating controls
* Application context
* Risk acceptance

### Why scan an image if SCA already scans dependencies?

Because the container contains more than application dependencies.

For example:

```text
Container
│
├── OS packages
├── Runtime
├── Application dependencies
├── Configuration
└── Other files
```

SCA may identify dependency vulnerabilities, while container scanning can identify issues in the broader image.

### Why generate an SBOM?

An SBOM provides visibility into the components contained in software and makes vulnerability tracking and supply-chain analysis easier.

### Why sign container images?

Signing helps establish provenance and allows deployment systems to verify that an image originated from a trusted source and has not been replaced or tampered with.

---

# 📌 Quick Reference

```text
CONTAINER SCANNING
        │
        ├── Base Image
        │
        ├── OS Packages
        │
        ├── Application Components
        │
        ├── Vulnerabilities
        │
        ├── Misconfigurations
        │
        ├── Secrets
        │
        └── Supply Chain
```

Recommended lifecycle:

```text
Build
  ↓
Scan
  ↓
SBOM
  ↓
Security Gate
  ↓
Sign
  ↓
Registry
  ↓
Verify
  ↓
Deploy
  ↓
Monitor
```

---

# 🔗 Related Knowledge

* [`README.md`](README.md)
* [`devsecops.md`](devsecops.md)
* [`sast.md`](sast.md)
* [`dast.md`](dast.md)
* [`sca.md`](sca.md)
* [`secrets-scanning.md`](secrets-scanning.md)

---

# 📖 Key Takeaway

> **Container scanning is one layer of a broader container security strategy.**

A secure container lifecycle should combine:

```text
Secure Dockerfile
        +
Trusted Base Image
        +
Minimal Image
        +
SCA
        +
Container Scanning
        +
Secrets Scanning
        +
SBOM
        +
Image Signing
        +
Security Gates
        +
Secure Runtime
        +
Continuous Monitoring
```

The objective is not simply to produce a container that **passes a scanner**.

The objective is to build a container supply chain where:

> **Only trusted, understood, scanned, and appropriately governed artifacts progress toward production.**
