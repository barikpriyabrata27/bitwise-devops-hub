# Dynamic Application Security Testing (DAST)

> **DAST (Dynamic Application Security Testing)** is a security testing technique that evaluates a running application from the outside by interacting with its exposed interfaces and looking for vulnerabilities in its runtime behavior.

DAST is commonly described as **black-box application security testing** because the scanner generally does not need access to the application's source code. It interacts with the application through HTTP/HTTPS and other exposed interfaces, similar to an external attacker.

---

# 1. Overview

A traditional application security pipeline may look like:

```text
                        SOURCE CODE
                             │
                             ▼
                           SAST
                             │
                             ▼
                          BUILD
                             │
                             ▼
                           SCA
                             │
                             ▼
                      APPLICATION
                             │
                             ▼
                    DEPLOY TO TEST
                             │
                             ▼
                           DAST
                             │
                             ▼
                     SECURITY GATE
                             │
                       ┌─────┴─────┐
                       │           │
                      FAIL        PASS
                       │           │
                       ▼           ▼
                     STOP       RELEASE
```

The important distinction is:

```text
SAST
 │
 └── Looks at the application internally
     └── Source / bytecode / code structure


DAST
 │
 └── Looks at the application externally
     └── HTTP / HTTPS / APIs / runtime behavior
```

---

# 2. What Problem Does DAST Solve?

DAST answers a question that source-code scanning cannot fully answer:

> **"When this application is actually running, can an attacker interact with it in a way that exposes a security weakness?"**

DAST can help identify:

- Missing security headers
- Weak authentication controls
- Broken authorization
- Injection vulnerabilities
- Cross-site scripting
- Session-management weaknesses
- Information disclosure
- Insecure cookies
- Server misconfiguration
- Exposed administrative interfaces
- Unexpected HTTP methods
- API security weaknesses

OWASP's Web Security Testing Guide organizes application security testing around information gathering, configuration, identity management, authentication, authorization, session management, input validation, error handling, cryptography, business logic, client-side testing, and API testing.

---

# 3. What Does "Dynamic" Mean?

The word **dynamic** means that the application is running while the security test is being performed.

## Static Testing

```text
Source Code
     │
     ▼
   SAST
     │
     ▼
Security Findings
```

## Dynamic Testing

```text
Application
     │
     ▼
Running Server
     │
     ▼
HTTP Requests
     │
     ▼
HTTP Responses
     │
     ▼
DAST Scanner
     │
     ▼
Security Findings
```

The scanner interacts with the application and observes how it responds.

---

# 4. DAST as an External Attacker

A simplified DAST interaction looks like:

```text
                 DAST Scanner
                      │
                      │ HTTP Request
                      ▼
              ┌───────────────┐
              │               │
              │  Application  │
              │               │
              └───────────────┘
                      │
                      │ HTTP Response
                      ▼
                 DAST Scanner
                      │
                      ▼
               Analyze Result
```

The scanner may:

1. Discover application endpoints.
2. Identify parameters.
3. Observe HTTP requests and responses.
4. Analyze headers and cookies.
5. Submit test inputs.
6. Compare responses.
7. Identify suspicious behavior.
8. Report potential vulnerabilities.

---

# 5. How DAST Works

A simplified DAST process is:

```text
             Target Application
                     │
                     ▼
              1. Discover
                     │
                     ▼
              2. Crawl / Spider
                     │
                     ▼
              3. Identify Inputs
                     │
                     ▼
              4. Passive Scan
                     │
                     ▼
              5. Active Scan
                     │
                     ▼
              6. Analyze Responses
                     │
                     ▼
              7. Correlate Findings
                     │
                     ▼
              8. Risk Evaluation
                     │
                     ▼
              9. Security Report
```

---

# 6. Application Discovery

Before testing vulnerabilities, a DAST tool needs to understand the application's attack surface.

For example:

```text
/
├── /login
├── /logout
├── /users
├── /products
├── /orders
├── /admin
├── /api
│   ├── /users
│   ├── /products
│   └── /orders
└── /search
```

The more of the application the scanner understands, the greater its potential coverage.

---

# 7. Crawling / Spidering

A crawler follows links and application paths to discover functionality.

```text
https://example.com
       │
       ├── /login
       │      │
       │      └── /forgot-password
       │
       ├── /products
       │      │
       │      └── /products/123
       │
       └── /account
              │
              ├── /profile
              └── /orders
```

The scanner builds an understanding of the application's reachable attack surface.

Modern applications may require browser-based crawling because a traditional crawler may not discover all functionality generated dynamically by JavaScript.

---

# 8. Identify Inputs

Applications accept input through many locations.

```text
URL Parameters
     │
     ├── ?id=123
     └── ?search=phone

Form Fields
     │
     ├── username
     ├── password
     └── email

HTTP Headers
     │
     ├── User-Agent
     ├── Referer
     └── Authorization

Cookies
     │
     └── session_id

JSON Body
     │
     ├── userId
     ├── amount
     └── productId
```

These inputs are important because attackers can manipulate them.

---

# 9. Passive Scanning

Passive scanning observes traffic without deliberately attacking the application.

```text
Request
   │
   ▼
Application
   │
   ▼
Response
   │
   ▼
Passive Analysis
```

The scanner may inspect:

- HTTP headers
- Cookies
- TLS-related behavior
- Security headers
- Information disclosure
- Session attributes
- Response content
- Technology fingerprints

Passive scanning is generally less intrusive because it does not need to inject aggressive attack payloads.

---

# 10. Active Scanning

Active scanning goes further.

The scanner sends specially crafted requests designed to test whether a vulnerability may exist.

```text
Normal Request
      │
      ▼
Application
      │
      ▼
Normal Response


Test Request
      │
      ▼
Application
      │
      ▼
Unexpected / Vulnerable Response?
      │
      ▼
Potential Finding
```

Examples of active testing categories include:

- Injection
- Cross-site scripting
- Path traversal
- Command injection
- Authentication weaknesses
- Security misconfiguration
- HTTP method issues
- Input validation problems

Active scans can modify application state, consume resources, or trigger workflows. They should therefore normally run against controlled test or staging environments unless explicitly authorized for production.

---

# 11. Passive vs Active Scanning

| Characteristic | Passive Scan | Active Scan |
|---|---|---|
| Sends normal traffic | Yes | Not necessarily |
| Attempts attack payloads | No | Yes |
| Intrusiveness | Lower | Higher |
| Finds configuration issues | Yes | Yes |
| Tests input validation | Limited | Stronger |
| Production suitability | Often safer | Requires caution |
| CI/CD suitability | Very high | High with controlled environments |
| Risk of changing application state | Low | Potentially higher |

A common strategy is:

```text
Production
   │
   └── Passive / non-intrusive testing

Test / Staging
   │
   └── Active DAST
```

---

# 12. Authentication in DAST

One of the biggest challenges in DAST is authenticated testing.

Consider:

```text
Public Application
        │
        ├── /login
        ├── /products
        └── /about
```

A scanner can usually discover these without credentials.

But:

```text
Authenticated Application
        │
        ├── /account
        ├── /profile
        ├── /orders
        ├── /payments
        └── /admin
```

may require authentication.

Without authentication:

```text
DAST
 │
 ▼
Login
 │
 X
 │
 └── Cannot reach protected endpoints
```

With properly configured authentication:

```text
DAST
 │
 ▼
Authenticate
 │
 ▼
Obtain Session
 │
 ▼
Access Protected Application
 │
 ▼
Scan
```

Therefore:

> **A DAST scan is only as good as the application surface it can actually reach.**

---

# 13. Authenticated vs Unauthenticated DAST

## Unauthenticated DAST

Tests the application as an anonymous user.

```text
Internet
   │
   ▼
Application
   │
   ▼
Public Attack Surface
```

Useful for:

- Login pages
- Public APIs
- Public content
- Public endpoints
- HTTP configuration

## Authenticated DAST

Tests the application after logging in.

```text
DAST
 │
 ▼
Login
 │
 ▼
Authenticated Session
 │
 ▼
Protected APIs
 │
 ▼
Protected Application
```

Useful for:

- User dashboards
- Account management
- Order management
- Admin interfaces
- Internal APIs
- Role-specific functionality

A mature DAST strategy often needs both.

---

# 14. Role-Based DAST

Authentication alone is not enough.

Consider:

```text
                    Application
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
        User          Manager          Admin
          │              │              │
          ▼              ▼              ▼
       Role A          Role B          Role C
```

Different roles can have different permissions.

For example:

```text
User
 └── Can view own orders

Manager
 └── Can view team orders

Admin
 └── Can manage all orders
```

A serious security test should consider whether one role can access another role's resources.

This is particularly important for authorization and access-control testing.

---

# 15. Authentication vs Authorization

These concepts are different.

## Authentication

> **Who are you?**

```text
Username + Password
        │
        ▼
     Identity
```

## Authorization

> **What are you allowed to do?**

```text
Authenticated User
        │
        ▼
Permissions
        │
        ▼
Allowed / Denied
```

A DAST scan can test aspects of both, but complex authorization testing frequently requires application-specific configuration and manual security testing.

---

# 16. DAST for REST APIs

DAST is not limited to traditional HTML applications.

Modern applications frequently expose APIs:

```text
Frontend
    │
    ▼
 REST API
    │
    ├── GET /users
    ├── POST /users
    ├── GET /orders
    ├── POST /orders
    └── DELETE /orders/{id}
```

API security testing can examine:

- Authentication
- Authorization
- Input validation
- HTTP methods
- Error handling
- Rate limiting
- Data exposure
- Injection
- Object-level authorization
- API configuration

---

# 17. OpenAPI-Based DAST

APIs are easier to scan when an API specification is available.

```text
openapi.yaml
     │
     ▼
DAST Scanner
     │
     ▼
API Endpoints
     │
     ├── GET
     ├── POST
     ├── PUT
     ├── PATCH
     └── DELETE
```

An OpenAPI specification can provide:

- Endpoint definitions
- HTTP methods
- Parameters
- Request schemas
- Response schemas
- Authentication requirements

This can significantly improve API coverage.

---

# 18. DAST for Single-Page Applications

Modern applications may use:

- React
- Angular
- Vue
- Next.js
- Other JavaScript frameworks

A simple link crawler may not discover all application functionality.

```text
Browser
   │
   ▼
JavaScript Application
   │
   ├── API Call
   ├── API Call
   ├── Dynamic Route
   └── Client-Side Action
```

Modern DAST tools may provide browser-based crawling or JavaScript-aware capabilities.

> **The scanner needs to understand the application's actual attack surface, not just the HTML returned by the first request.**

---

# 19. DAST for Microservices

Modern systems often look like:

```text
                    Frontend
                       │
                       ▼
                  API Gateway
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Service A    Service B    Service C
          │            │            │
          ▼            ▼            ▼
       Database      Cache       External API
```

DAST can test externally exposed services.

Each service may have:

- Different authentication
- Different APIs
- Different authorization
- Different technology
- Different attack surfaces

Therefore, DAST configuration needs to reflect the architecture.

---

# 20. What Vulnerabilities Can DAST Find?

DAST can help identify classes of issues such as:

- Injection
- Cross-site scripting
- Path traversal
- Security misconfiguration
- Security-header problems
- Cookie-security issues
- Information disclosure
- Authentication weaknesses
- Some authorization weaknesses
- API security weaknesses
- Insecure HTTP methods
- Error-handling issues

DAST tools differ in the vulnerabilities they detect and the quality of their evidence.

---

# 21. Injection

Examples include:

- SQL injection
- Command injection
- LDAP injection
- Template injection

Conceptually:

```text
User Input
    │
    ▼
Application
    │
    ▼
Unsafe Interpretation
    │
    ▼
Potential Injection
```

---

# 22. Cross-Site Scripting

DAST can test whether attacker-controlled input is reflected or executed in unsafe contexts.

```text
User Input
    │
    ▼
Application
    │
    ▼
HTML Response
    │
    ▼
Browser
```

Potentially unsafe output handling can result in XSS.

---

# 23. Path Traversal

A vulnerable application may allow manipulation of file paths.

```text
Request
   │
   ▼
File Path
   │
   ▼
Application
   │
   ▼
Unexpected File Access
```

---

# 24. Security Headers

DAST can inspect HTTP responses for security-related headers.

Examples include:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

The appropriate headers depend on the application.

---

# 25. Cookie Security

DAST can inspect cookies for attributes such as:

```text
Secure
HttpOnly
SameSite
```

For example:

```text
Set-Cookie:
session=abc123;
Secure;
HttpOnly;
SameSite=Lax
```

These attributes help reduce certain classes of attacks when configured appropriately.

---

# 26. TLS / HTTPS Configuration

DAST or associated security testing can identify weaknesses in transport security.

```text
HTTP
 │
 └── Redirect?
       │
       ▼
HTTPS
 │
 ├── Certificate
 ├── TLS Configuration
 └── Security Headers
```

Transport-security testing may also be performed by dedicated infrastructure/security tools.

---

# 27. Error Handling

Applications should not expose sensitive internal details.

Bad example:

```text
HTTP 500

Database connection failed:
jdbc:mysql://internal-db-01:3306/customer
Username: application_user
Stack trace:
...
```

A DAST scanner may identify information disclosure through verbose error responses.

---

# 28. Information Disclosure

Potentially sensitive information can include:

- Internal hostnames
- Stack traces
- Software versions
- Debug information
- File paths
- API keys
- Internal URLs
- Configuration details

DAST can help identify some of these exposures.

---

# 29. Attack Surface Coverage

One of the most important DAST concepts is:

> **What did the scanner actually test?**

Suppose the application contains:

```text
100 endpoints
```

but the scanner discovers:

```text
40 endpoints
```

Then:

```text
DAST Result
     ≠
Complete Application Security
```

The scanner may have excellent detection capability but poor coverage.

Therefore, teams should monitor:

```text
Application Attack Surface
          │
          ▼
DAST Discovered Surface
          │
          ▼
Coverage Gap
```

Coverage is a major part of DAST quality.

---

# 30. DAST Coverage

Coverage can include:

- URLs
- Endpoints
- APIs
- Parameters
- HTTP methods
- Authentication states
- User roles
- Application workflows
- JavaScript routes
- Error paths

A mature program should continuously improve coverage.

---

# 31. DAST Testing Environments

DAST is commonly performed against:

```text
Developer Environment
        │
        ▼
Integration Environment
        │
        ▼
QA / Test Environment
        │
        ▼
Staging
        │
        ▼
Production
```

The depth of testing should depend on risk.

---

# 32. Production DAST

Production testing requires special care.

Aggressive active scanning can potentially:

- Modify data
- Create accounts
- Trigger workflows
- Send emails
- Generate transactions
- Affect performance

Therefore:

```text
Production
   │
   ├── Passive / low-impact scanning
   │
   └── Carefully controlled active tests
```

For aggressive active testing:

```text
Dedicated Test Environment
          │
          ▼
       Active DAST
```

---

# 33. Popular DAST Tools

The DAST market contains both **open-source** and **commercial enterprise** tools.

There is no single tool that is best for every organization. The right choice depends on:

- Application architecture
- Web vs API coverage
- Authentication requirements
- CI/CD integration
- Manual penetration-testing requirements
- Scale of the application portfolio
- False-positive tolerance
- Reporting requirements
- Compliance requirements
- Budget
- Cloud vs self-hosted deployment

| Tool | Type | Best Known For | Typical Usage |
|---|---|---|---|
| **OWASP ZAP** | Open Source | CI/CD automation and flexible scanning | DevSecOps, CI pipelines, learning |
| **Burp Suite** | Commercial + Community | Manual testing + automated scanning | Penetration testing, AppSec |
| **Invicti** | Commercial | Automated enterprise scanning and proof-based validation | Enterprise AppSec |
| **Acunetix** | Commercial | Automated web vulnerability scanning | Web application security |
| **StackHawk** | Commercial | Developer-focused CI/CD DAST | DevSecOps |
| **Rapid7 InsightAppSec** | Commercial | Enterprise DAST | Enterprise security |
| **HCL AppScan** | Commercial | Enterprise application security testing | Large enterprises |
| **Qualys WAS** | Commercial | Web application scanning | Enterprise vulnerability management |
| **Veracode DAST** | Commercial | DAST within an AppSec platform | Enterprise AppSec |
| **Checkmarx DAST** | Commercial | DAST integrated with broader AppSec | Enterprise DevSecOps |
| **Detectify** | SaaS | Automated external application testing | Internet-facing applications |
| **Aikido DAST** | Commercial | Developer-oriented application security | SMB / mid-market / DevSecOps |
| **Akto** | Commercial | API-focused security testing | API security |
| **Nuclei** | Open Source | Template-based security testing | Security engineering / custom scanning |

---

# 34. OWASP ZAP

**OWASP ZAP — Zed Attack Proxy**

### Category

```text
Open Source
        +
DAST
        +
Web Security Proxy
        +
CI/CD Automation
```

### Best For

- DevSecOps pipelines
- Learning DAST
- Open-source environments
- GitHub Actions
- Docker-based scanning
- Web application testing
- API testing
- Security automation

### Typical Flow

```text
GitHub Actions
      │
      ▼
Deploy Test Application
      │
      ▼
OWASP ZAP
      │
      ├── Spider
      ├── Passive Scan
      ├── Active Scan
      └── API Scan
      │
      ▼
DAST Report
      │
      ▼
Security Gate
```

### Example

```bash
zap-baseline.py \
  -t https://test.example.com
```

### Strengths

- Open source
- No license cost
- Highly scriptable
- Docker support
- CI/CD friendly
- Large ecosystem
- Good learning platform

### Limitations

- Requires more tuning than many commercial platforms
- Authentication can require configuration
- False-positive management requires engineering effort
- Complex business logic still requires human testing

### Best Fit

> **Teams starting their DevSecOps journey or organizations wanting an open-source DAST solution.**

---

# 35. Burp Suite

**Burp Suite**, from PortSwigger, is one of the best-known platforms for web application security testing.

It combines:

```text
Manual Testing
      +
Proxy
      +
Crawler
      +
Scanner
      +
Automation
      +
Extensions
```

### Best For

- Penetration testers
- Security engineers
- Manual application testing
- Advanced web testing
- Automated DAST
- API testing
- Security research

### Typical Architecture

```text
                 Browser
                    │
                    ▼
              Burp Proxy
                    │
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼
       Repeater  Scanner  Intruder
          │         │         │
          └─────────┼─────────┘
                    ▼
               Application
```

### Best Fit

> **Organizations where automated DAST and hands-on penetration testing need to coexist.**

---

# 36. Invicti

**Invicti** is a commercial web application security platform known for automated scanning and proof-based validation.

### Best For

- Enterprise DAST
- Large application portfolios
- Automated vulnerability validation
- Reducing false-positive triage
- CI/CD integration

A major concept is:

```text
Detect
  │
  ▼
Validate
  │
  ▼
Provide Evidence
  │
  ▼
Developer Remediation
```

### Best Fit

> **Large organizations that need automated DAST across many applications and want strong vulnerability validation.**

---

# 37. Acunetix

**Acunetix** is a commercial automated web vulnerability scanner.

It is commonly positioned around:

- Automated web scanning
- API testing
- Web application vulnerability detection
- Scheduled scanning
- Reporting

Typical flow:

```text
Web Application
       │
       ▼
Acunetix
       │
       ├── Crawl
       ├── Discover
       ├── Scan
       └── Report
```

### Best Fit

> **Organizations looking for an automated commercial web application scanner.**

---

# 38. StackHawk

**StackHawk** focuses heavily on developer-oriented DAST and API security within CI/CD.

### Best For

- DevSecOps
- API-first applications
- Developer workflows
- CI/CD pipelines
- Shift-left security

Typical workflow:

```text
Developer
    │
    ▼
Git Push
    │
    ▼
CI/CD
    │
    ▼
StackHawk
    │
    ▼
DAST
    │
    ▼
Finding
    │
    ▼
Developer
```

### Best Fit

> **Modern engineering organizations that want DAST tightly integrated with CI/CD and developer workflows.**

---

# 39. Rapid7 InsightAppSec

**Rapid7 InsightAppSec** provides enterprise DAST capabilities and integrates with the broader Rapid7 security ecosystem.

### Best For

- Enterprise environments
- Large-scale application scanning
- Centralized security operations
- Organizations already using Rapid7

Typical architecture:

```text
Applications
     │
     ├── Application A
     ├── Application B
     ├── Application C
     └── Application D
             │
             ▼
       InsightAppSec
             │
             ▼
      Central Dashboard
             │
             ▼
      Risk Management
```

---

# 40. HCL AppScan

**HCL AppScan** is an enterprise application security testing platform.

### Best For

- Large enterprises
- Enterprise application portfolios
- Centralized security teams
- Application security governance

It can be part of a broader AppSec program covering multiple stages of the SDLC.

---

# 41. Qualys Web Application Scanning

**Qualys Web Application Scanning (WAS)** provides web application security scanning within the broader Qualys cloud security platform.

### Best For

- Enterprise vulnerability management
- Organizations already using Qualys
- Centralized security visibility
- Web application scanning

Typical model:

```text
Qualys Platform
      │
      ├── Infrastructure
      ├── Cloud
      ├── Endpoints
      ├── Vulnerabilities
      └── Web Applications
               │
               ▼
              WAS
```

---

# 42. Veracode DAST

**Veracode** provides DAST capabilities as part of a broader application security platform.

```text
Veracode
   │
   ├── SAST
   ├── DAST
   ├── SCA
   └── Application Security
```

### Best Fit

> **Organizations looking for a broader AppSec platform rather than a standalone DAST scanner.**

---

# 43. Checkmarx DAST

**Checkmarx** provides DAST alongside other application security capabilities.

```text
Source
  │
  ├── SAST
  ├── SCA
  └── Secrets
        │
        ▼
      Build
        │
        ▼
      DAST
        │
        ▼
   AppSec Platform
```

### Best Fit

> **Organizations already standardizing on Checkmarx for application security.**

---

# 44. Detectify

**Detectify** is a SaaS-based application security platform focused on external-facing assets and automated security testing.

```text
Internet-Facing Application
          │
          ▼
       Detectify
          │
          ▼
   Security Findings
```

### Best Fit

> **Teams that need automated external application and attack-surface security testing.**

---

# 45. Aikido DAST

**Aikido Security** provides DAST as part of a broader developer-oriented security platform.

```text
                 Aikido
                   │
      ┌────────────┼────────────┐
      │            │            │
     SAST         SCA          DAST
      │            │            │
      └────────────┼────────────┘
                   │
                   ▼
             Security Dashboard
```

### Best Fit

> **Small and mid-sized engineering teams looking for a consolidated AppSec platform.**

---

# 46. Akto

**Akto** is particularly relevant for **API security testing**.

```text
Frontend
   │
   ▼
API Gateway
   │
   ├── REST API
   ├── GraphQL
   └── Microservices
```

API-focused testing may examine:

- Authentication
- Authorization
- API schemas
- API parameters
- Object-level authorization
- API configuration
- Sensitive data exposure

### Best Fit

> **API-first organizations where traditional web crawling does not provide sufficient API coverage.**

---

# 47. Nuclei

**Nuclei** is an open-source, template-driven security scanner.

It is important to understand that Nuclei is **not a traditional full DAST platform in exactly the same sense as ZAP, Burp, or enterprise DAST products**.

It is better thought of as:

```text
Template-Based
Security Scanner
       │
       ▼
HTTP Requests
       │
       ▼
Target
       │
       ▼
Match Conditions
       │
       ▼
Finding
```

It is useful for:

- Custom security checks
- Vulnerability research
- Security engineering
- CI/CD automation
- Reconnaissance
- Known vulnerability detection

### Best Fit

> **Security engineers who want highly customizable, template-driven scanning.**

---

# 48. Practical Tool Comparison

| Tool | Open Source | Automation | Manual Testing | CI/CD | Enterprise Scale | API Focus |
|---|---:|---:|---:|---:|---:|---:|
| **OWASP ZAP** | Yes | High | High | Very High | Medium | High |
| **Burp Suite** | Limited | Very High | Very High | High | Very High | Very High |
| **Invicti** | No | Very High | Low/Medium | High | Very High | High |
| **Acunetix** | No | Very High | Low/Medium | High | High | High |
| **StackHawk** | No | High | Low/Medium | Very High | High | Very High |
| **Rapid7 InsightAppSec** | No | High | Low/Medium | High | Very High | High |
| **HCL AppScan** | No | High | Medium | High | Very High | High |
| **Qualys WAS** | No | High | Low/Medium | Medium | Very High | Medium |
| **Veracode DAST** | No | High | Low/Medium | High | Very High | Medium |
| **Checkmarx DAST** | No | High | Low/Medium | High | Very High | High |
| **Detectify** | No | High | Low | Medium | High | Medium |
| **Aikido DAST** | No | High | Low | High | Medium | High |
| **Akto** | No | High | Medium | High | High | Very High |
| **Nuclei** | Yes | Very High | Medium | Very High | Medium | High |

> These ratings are practical positioning rather than standardized benchmark scores. Tool capabilities change over time, so verify current features during procurement.

---

# 49. How to Choose a DAST Tool

Instead of asking:

> **"Which DAST tool is the best?"**

Ask:

> **"Which DAST capability do we need?"**

---

## Scenario 1 — Learning DevSecOps

Recommended:

```text
OWASP ZAP
```

Why?

- Free
- Open source
- Easy to experiment with
- Docker support
- CI/CD integration
- Large community

---

## Scenario 2 — Penetration Testing

Recommended:

```text
Burp Suite
```

Why?

```text
Proxy
 +
Repeater
 +
Intruder
 +
Scanner
 +
Extensions
 +
Manual Testing
```

---

## Scenario 3 — Enterprise Automated DAST

Consider:

```text
Invicti
Acunetix
Rapid7 InsightAppSec
HCL AppScan
Qualys WAS
Veracode DAST
Checkmarx DAST
```

Selection should depend on:

- Application count
- Authentication requirements
- Reporting
- Integrations
- Compliance
- Deployment model
- Security-team workflow

---

## Scenario 4 — Developer-Centric DevSecOps

Consider:

```text
StackHawk
OWASP ZAP
Burp Suite DAST
```

The focus is:

```text
Developer
   │
   ▼
Commit
   │
   ▼
CI/CD
   │
   ▼
DAST
   │
   ▼
Finding
   │
   ▼
Developer
```

---

## Scenario 5 — API-First Organization

Consider:

```text
StackHawk
Akto
Burp Suite
OWASP ZAP
```

API coverage should be evaluated carefully.

For an API-first application, don't assume that a traditional web crawler will discover every important endpoint.

---

# 50. Recommended Enterprise Strategy

A mature organization does not necessarily choose one tool.

A combination can make more sense:

```text
                    Application Security
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
       Automated         Manual          API
         DAST             Testing        Security
           │               │               │
           ▼               ▼               ▼
       ZAP / Invicti    Burp Suite     Akto / StackHawk
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
                    Security Program
```

For example:

```text
CI/CD
  │
  └── ZAP / StackHawk
          │
          ▼
      Continuous DAST


Security Team
  │
  └── Burp Suite
          │
          ▼
      Deep Manual Testing


API Security
  │
  └── API-focused tooling
          │
          ▼
      API Security Testing
```

This layered approach is often more effective than expecting one scanner to discover every type of vulnerability.

---

# 51. DAST in CI/CD

A practical CI/CD pipeline can look like:

```text
                  Pull Request
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
                  Deploy to Test
                       │
                       ▼
                  Start Application
                       │
                       ▼
                      DAST
                       │
                       ▼
                Security Evaluation
                       │
                ┌──────┴──────┐
                │             │
               FAIL          PASS
                │             │
                ▼             ▼
              Stop          Deploy
                             │
                             ▼
                         Production
```

---

# 52. GitHub Actions Example

A simplified DAST workflow using ZAP can look like:

```yaml
name: DAST

on:
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  dast:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Start application
        run: |
          docker compose up -d

      - name: Wait for application
        run: |
          curl --retry 10 --retry-delay 5 --retry-all-errors \
            http://localhost:8080/health

      - name: Run ZAP baseline scan
        run: |
          docker run --rm \
            --network host \
            -v "${{ github.workspace }}:/zap/wrk/:rw" \
            ghcr.io/zaproxy/zaproxy:stable \
            zap-baseline.py \
            -t http://localhost:8080 \
            -r zap-report.html

      - name: Upload DAST report
        uses: actions/upload-artifact@v4
        with:
          name: dast-report
          path: zap-report.html
```

This is a starting point.

A production pipeline should additionally define:

- Scan scope
- Authentication
- API definitions
- Alert thresholds
- False-positive handling
- Report retention
- Security gates
- Environment isolation

---

# 53. DAST Security Gates

A DAST pipeline should have explicit rules.

Example:

```text
DAST
 │
 ▼
Findings
 │
 ▼
Severity / Risk
 │
 ├── Informational ──► Report
 │
 ├── Low ────────────► Report / Review
 │
 ├── Medium ─────────► Review / Policy
 │
 ├── High ───────────► Usually Block
 │
 └── Critical ───────► Block
```

However, severity alone should not determine every decision.

Consider:

```text
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
Application Context
   │
   ▼
Risk Decision
```

---

# 54. False Positives

DAST scanners can report findings that are not actual exploitable vulnerabilities.

```text
Scanner Finding
      │
      ▼
Developer Review
      │
      ▼
Is it valid?
      │
 ┌────┴────┐
 │         │
YES        NO
 │         │
 ▼         ▼
Remediate  Mark False Positive
```

False positives should be managed rather than simply ignored.

A mature process records:

- Finding
- Reason
- Evidence
- Decision
- Owner
- Date
- Exception/expiration if applicable

---

# 55. False Negatives

A more dangerous situation is:

> **The scanner does not detect a vulnerability that actually exists.**

Possible reasons include:

- Endpoint not discovered
- Authentication failure
- Unsupported technology
- Complex application workflow
- Scanner limitations
- Business logic
- Custom authorization model
- Rate limiting
- WAF interference
- JavaScript-heavy application
- API not included in scan scope

Therefore:

```text
No DAST Finding
       ≠
No Vulnerability
```

---

# 56. DAST Limitations

## Limited Source-Code Visibility

DAST normally does not know the internal source-code structure.

## Coverage Problems

If the scanner cannot reach an endpoint, it cannot test it.

## Business Logic

Automated scanners generally struggle with complex business rules.

For example:

```text
Step 1 → Add Product
Step 2 → Pay
Step 3 → Confirm Order
```

What happens if someone attempts:

```text
Step 1 → Confirm Order
```

Business-logic vulnerabilities frequently require human reasoning.

## Race Conditions

Race conditions can require carefully synchronized requests and application-specific understanding.

## Zero-Day Vulnerabilities

Automated scanners generally rely heavily on known patterns and detection logic. They cannot guarantee detection of unknown vulnerabilities.

---

# 57. DAST vs Penetration Testing

These are related but not identical.

| DAST | Penetration Testing |
|---|---|
| Highly automated | Human-driven |
| Repeatable | Exploratory |
| Good for CI/CD | Usually scheduled |
| Broad baseline coverage | Deep targeted testing |
| Limited business context | Strong business context |
| Faster | Slower |
| Continuous | Periodic |
| Tool-driven | Skill-driven |

The best approach is:

```text
Automated DAST
      +
Manual Security Testing
      +
Penetration Testing
```

Automated tools do not replace expert reasoning about business logic and application context.

---

# 58. DAST vs SAST

| SAST | DAST |
|---|---|
| Static | Dynamic |
| Source/code oriented | Running application oriented |
| Usually white/gray-box | Usually black-box |
| Does not require running application | Requires running target |
| Finds code-level weaknesses | Finds runtime weaknesses |
| Early in SDLC | Later in test/deployment stages |
| Can identify vulnerable code paths | Tests externally observable behavior |

Example:

```text
SAST:
"Your source code constructs a SQL query unsafely."

DAST:
"When I send this input to the running application,
the application behaves as if the input altered the query."
```

---

# 59. DAST vs SCA

```text
SCA
 │
 └── "Which dependencies are vulnerable?"

DAST
 │
 └── "How does the running application behave when tested?"
```

They address different risks.

---

# 60. DAST vs Container Scanning

```text
Container Scanning
 │
 └── Container Image
      ├── OS Packages
      ├── Runtime
      └── Image Components


DAST
 │
 └── Running Application
      ├── HTTP
      ├── APIs
      ├── Authentication
      ├── Sessions
      └── Runtime Behavior
```

Both should be used as complementary controls.

---

# 61. DAST and WAF

A Web Application Firewall sits between users and the application.

```text
Internet
    │
    ▼
   WAF
    │
    ▼
Application
```

DAST operates differently:

```text
DAST
 │
 ▼
WAF
 │
 ▼
Application
```

A WAF may block scanner payloads:

```text
DAST
 │
 ▼
WAF
 │
 X
Blocked
```

The scanner may therefore report:

```text
No vulnerability observed
```

when the application itself could still be vulnerable behind the WAF.

Therefore:

> **DAST results must be interpreted in the context of the network controls between the scanner and application.**

---

# 62. DAST and Secrets

DAST may identify exposed secrets in:

- HTML
- JavaScript
- API responses
- Error messages
- Configuration endpoints
- Public files

However:

> **DAST should not replace dedicated secrets scanning.**

Use:

```text
Secrets Scanning
       +
DAST
```

---

# 63. DAST Maturity Model

## Level 1 — Manual Testing

```text
Tester
  │
  ▼
Application
```

## Level 2 — Automated Baseline

```text
CI/CD
  │
  ▼
DAST
  │
  ▼
Report
```

## Level 3 — Security Gate

```text
DAST
 │
 ▼
Risk Evaluation
 │
 ├── PASS
 └── FAIL
```

## Level 4 — Authenticated DAST

```text
DAST
 │
 ▼
Authentication
 │
 ▼
Protected Application
```

## Level 5 — API + Role Coverage

```text
DAST
 │
 ├── Public
 ├── User
 ├── Manager
 ├── Admin
 └── APIs
```

## Level 6 — Continuous Security

```text
CI/CD
  │
  ├── SAST
  ├── SCA
  ├── Container Scan
  └── DAST
          │
          ▼
     Continuous
     Monitoring
```

---

# 64. Recommended DAST Strategy

## Pull Request

```text
SAST
SCA
Secrets Scan
```

## Build

```text
Container Scan
```

## Integration / Test

```text
DAST Baseline
```

## Staging

```text
Authenticated DAST
API DAST
Active Scan
```

## Production

```text
Carefully controlled
low-impact scanning
+
Continuous monitoring
```

---

# 65. DAST Reporting

A useful DAST report should contain:

```text
Finding
│
├── Title
├── Severity
├── URL
├── HTTP Method
├── Parameter
├── Evidence
├── Description
├── Impact
├── Remediation
├── References
├── First Seen
├── Last Seen
└── Status
```

For developers, the most important information is:

```text
What is wrong?
       │
       ▼
Where is it?
       │
       ▼
Why does it matter?
       │
       ▼
How do I fix it?
```

---

# 66. Example Finding

```text
Finding:
Missing Content-Security-Policy Header

Severity:
Medium

Endpoint:
https://test.example.com/

Evidence:
HTTP response does not contain a Content-Security-Policy header.

Risk:
The absence of an appropriate CSP may increase exposure to certain
client-side injection scenarios.

Recommendation:
Define and deploy an appropriate Content-Security-Policy based on
the application's actual resource requirements.

Status:
Open
```

---

# 67. DAST Remediation Lifecycle

```text
DAST Finding
     │
     ▼
Developer Notification
     │
     ▼
Validate Finding
     │
     ▼
Determine Root Cause
     │
     ▼
Implement Fix
     │
     ▼
Run Tests
     │
     ▼
Run DAST Again
     │
     ▼
Verify Remediation
     │
     ▼
Close Finding
```

Continuous feedback loop:

```text
SCAN
  ↓
FIND
  ↓
FIX
  ↓
RESCAN
  ↓
VERIFY
  ↓
IMPROVE
  ↓
SCAN AGAIN
```

---

# 68. Emergency Vulnerability Handling

```text
Critical Finding
      │
      ▼
Security Alert
      │
      ▼
Risk Assessment
      │
      ▼
Immediate Mitigation
      │
      ├── Code Fix
      ├── WAF Rule
      ├── Configuration Change
      └── Temporary Isolation
      │
      ▼
Permanent Fix
      │
      ▼
Verification Scan
```

---

# 69. DAST Tool Selection Checklist

## Application Support

- [ ] Traditional web applications
- [ ] REST APIs
- [ ] GraphQL
- [ ] Single-page applications
- [ ] JavaScript-heavy applications
- [ ] Microservices

## Authentication

- [ ] Form authentication
- [ ] OAuth
- [ ] OpenID Connect
- [ ] JWT
- [ ] API keys
- [ ] Session cookies
- [ ] Multi-factor authentication workflows

## Scanning

- [ ] Spidering
- [ ] Browser-based crawling
- [ ] Passive scanning
- [ ] Active scanning
- [ ] API scanning
- [ ] Authenticated scanning
- [ ] Role-based scanning
- [ ] Scheduled scanning

## DevSecOps

- [ ] GitHub Actions
- [ ] Jenkins
- [ ] GitLab CI
- [ ] Azure DevOps
- [ ] Docker
- [ ] Kubernetes
- [ ] REST API
- [ ] CLI

## Reporting

- [ ] HTML
- [ ] JSON
- [ ] SARIF
- [ ] CI/CD annotations
- [ ] Jira integration
- [ ] GitHub integration
- [ ] Vulnerability tracking
- [ ] Compliance reporting

## Enterprise

- [ ] Central dashboard
- [ ] RBAC
- [ ] Multi-team support
- [ ] Asset inventory
- [ ] Scan scheduling
- [ ] Historical findings
- [ ] Risk prioritization
- [ ] Exception management

---

# 70. Recommended Learning Order

For learning purposes:

```text
1. OWASP ZAP
       │
       ▼
2. Burp Suite
       │
       ▼
3. DAST in GitHub Actions
       │
       ▼
4. Authenticated DAST
       │
       ▼
5. API DAST
       │
       ▼
6. Enterprise DAST
       │
       ├── Invicti
       ├── Acunetix
       ├── Rapid7
       ├── HCL AppScan
       └── Qualys WAS
```

This gives you the underlying DAST concepts first rather than simply learning product screens.

---

# 71. Interview Questions

## Beginner

### What is DAST?

DAST is dynamic application security testing performed against a running application to identify security vulnerabilities through its externally observable behavior.

### Why is DAST called black-box testing?

Because the scanner generally tests the application without requiring access to its source code.

### Does DAST require the application to be running?

Yes. DAST targets a running application or service.

### What is the difference between SAST and DAST?

SAST analyzes application code or related representations without running the application, while DAST interacts with the running application from the outside.

---

## Intermediate

### What is crawling in DAST?

Crawling or spidering is the process of discovering URLs, resources, forms, endpoints, and other application functionality that the scanner can reach.

### What is passive scanning?

Analyzing application traffic and responses without intentionally sending attack payloads.

### What is active scanning?

Sending specially crafted requests to test whether potential vulnerabilities can be triggered.

### Why is authentication important in DAST?

Without authentication, a scanner may be unable to reach protected application functionality and therefore may have incomplete coverage.

### What is authenticated DAST?

DAST performed using valid application credentials or another supported authentication mechanism so protected functionality can be tested.

---

## Advanced

### Why can a DAST scan pass while the application is still vulnerable?

Because DAST coverage is not necessarily complete. The scanner may not discover an endpoint, authenticate correctly, understand a workflow, or detect a business-logic vulnerability.

### Can DAST detect business-logic vulnerabilities?

Some simple cases may be identified, but complex business-logic vulnerabilities usually require application-specific reasoning and manual testing.

### Should DAST run against production?

Low-impact or passive testing may be appropriate depending on the organization and approval. Aggressive active testing should generally be performed against controlled environments unless explicitly authorized and carefully configured.

### Why is DAST not a replacement for penetration testing?

DAST provides repeatable automated coverage, while penetration testing uses human reasoning to investigate application-specific behavior, business logic, authorization, chaining, and attack paths.

### How do you improve DAST coverage?

Use:

- Authentication
- API specifications
- Proper crawling
- Browser-based discovery where required
- Multiple user roles
- Explicit scan scopes
- Test data
- Application-specific configuration
- Manual testing for uncovered areas

---

# 72. Practical Example

Consider an e-commerce application:

```text
https://shop.example.com
       │
       ├── /login
       ├── /products
       ├── /cart
       ├── /checkout
       ├── /orders
       └── /api
              ├── /products
              ├── /cart
              └── /orders
```

An unauthenticated scan may reach:

```text
/login
/products
/api/products
```

After authentication:

```text
/cart
/checkout
/orders
/api/cart
/api/orders
```

A role-based scan might additionally test:

```text
Admin
  │
  └── /admin
       ├── /users
       ├── /products
       └── /reports
```

The resulting strategy becomes:

```text
                     Application
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
         Anonymous       User         Admin
             │            │            │
             ▼            ▼            ▼
          DAST         DAST          DAST
             │            │            │
             └────────────┼────────────┘
                          ▼
                     Consolidated
                        Report
```

This is much stronger than simply pointing a scanner at the application's home page.

---

# 73. Best Practices

## Scope

- Clearly define the target.
- Scan the correct environment.
- Include APIs.
- Include authenticated areas.
- Include relevant user roles.

## Authentication

- Use dedicated test accounts.
- Avoid using real production credentials.
- Rotate test credentials.
- Verify session handling.
- Verify logout/session expiration behavior.

## Scanning

- Start with passive/baseline scanning.
- Progress to controlled active scanning.
- Configure scan policies.
- Avoid destructive operations.
- Monitor application performance.

## CI/CD

- Run DAST automatically.
- Publish reports.
- Define security gates.
- Track findings between builds.
- Avoid blocking pipelines on every informational finding.
- Define explicit exception processes.

## Coverage

- Monitor discovered endpoints.
- Use OpenAPI specifications for APIs.
- Test authenticated functionality.
- Test important user roles.
- Review areas that automation cannot reach.

## Risk

- Validate findings.
- Prioritize exploitable vulnerabilities.
- Consider business impact.
- Track remediation.
- Rescan after fixes.

---

# 74. Complete DevSecOps Security Pipeline

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
                    Container Scanning
                             │
                             ▼
                         Container
                             │
                             ▼
                     Deploy to Test
                             │
                             ▼
                      Start Application
                             │
                             ▼
                            DAST
                             │
                             ▼
                       Security Gate
                             │
                       ┌─────┴─────┐
                       │           │
                      FAIL        PASS
                       │           │
                       ▼           ▼
                     Stop       Production
                                   │
                                   ▼
                               Monitoring
```

---

# 75. DAST in the DevSecOps Knowledge Base

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
        │              Container Scan             │
        │                    │                    │
        └──────────────┬─────┴────────────────────┘
                       │
                       ▼
                 Security Gates
                       │
                       ▼
                  Production
```

Related documents:

- [`README.md`](README.md)
- [`devsecops.md`](devsecops.md)
- [`sast.md`](sast.md)
- [`sca.md`](sca.md)
- [`container-scanning.md`](container-scanning.md)
- [`secrets-scanning.md`](secrets-scanning.md)

---

# 76. Quick Reference

```text
DAST
│
├── Dynamic
│   └── Tests a running application
│
├── Black Box
│   └── Does not normally require source code
│
├── Discovery
│   ├── Crawl
│   ├── Spider
│   ├── API Definition
│   └── Browser-Based Discovery
│
├── Testing
│   ├── Passive Scan
│   └── Active Scan
│
├── Authentication
│   ├── Anonymous
│   ├── Authenticated
│   └── Role-Based
│
├── Targets
│   ├── Web Applications
│   ├── REST APIs
│   ├── SPAs
│   └── Microservices
│
├── Finds
│   ├── Injection
│   ├── XSS
│   ├── Security Headers
│   ├── Cookie Issues
│   ├── Information Disclosure
│   ├── Configuration Issues
│   └── Other Runtime Weaknesses
│
├── Automation
│   ├── CI/CD
│   ├── ZAP
│   ├── API Scanning
│   └── Security Gates
│
└── Limitations
    ├── Coverage
    ├── Business Logic
    ├── Race Conditions
    ├── Authentication Complexity
    └── False Negatives
```

---

# 77. Key Takeaway

> **DAST does not ask whether your source code looks secure. It asks what happens when a real client interacts with your running application.**

A mature DAST implementation combines:

```text
Application
    +
Discovery
    +
Authentication
    +
Passive Scanning
    +
Active Scanning
    +
API Testing
    +
Role-Based Testing
    +
Security Gates
    +
Continuous Remediation
    +
Manual Security Testing
```

The most important principle is:

> **A DAST scan is only as valuable as the application surface, authentication states, workflows, and APIs that it actually tests.**

Automated DAST should therefore be treated as a **continuous security control and baseline**, not as proof that an application contains no vulnerabilities.

---

# 78. Final DAST Mental Model

```text
                         RUNNING APPLICATION
                                  │
                                  ▼
                           ┌──────────────┐
                           │   DISCOVERY  │
                           └──────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
                Anonymous      User Role      Admin Role
                    │             │             │
                    └─────────────┼─────────────┘
                                  ▼
                           ┌──────────────┐
                           │    CRAWL     │
                           └──────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │ INPUTS/APIs  │
                           └──────┬───────┘
                                  │
                         ┌────────┴────────┐
                         │                 │
                         ▼                 ▼
                  PASSIVE SCAN       ACTIVE SCAN
                         │                 │
                         └────────┬────────┘
                                  ▼
                           ┌──────────────┐
                           │   FINDINGS   │
                           └──────┬───────┘
                                  │
                                  ▼
                           RISK EVALUATION
                                  │
                         ┌────────┴────────┐
                         │                 │
                        FAIL              PASS
                         │                 │
                         ▼                 ▼
                       FIX /            RELEASE /
                     MITIGATE           DEPLOY
                         │
                         ▼
                       RESCAN
```

**Core principle:**

> **Discover → Authenticate → Crawl → Test → Analyze → Gate → Fix → Rescan**

This is the core lifecycle you should remember when designing a dynamic application security testing strategy.
