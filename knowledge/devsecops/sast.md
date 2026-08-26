# Static Application Security Testing (SAST)

> **SAST (Static Application Security Testing)** analyzes application source code, bytecode, or intermediate representations without requiring the application to be running, with the goal of identifying security weaknesses as early as possible in the software lifecycle.

SAST is one of the core application-security controls in a DevSecOps program.

```text
Developer
   │
   ▼
Source Code
   │
   ▼
   SAST
   │
   ├── Finding
   │     │
   │     ▼
   │   Developer Fix
   │
   └── Clean
         │
         ▼
       Build
```

The fundamental idea is:

> **Find security problems in code before the vulnerable code reaches production.**

---

# 1. What Is SAST?

SAST examines the internals of an application.

It can analyze:

- Source code
- Bytecode
- Intermediate representations
- Framework-specific structures
- Data flow
- Control flow
- Dependencies in some tools
- Security-sensitive API usage
- Configuration in some tools

Unlike DAST, SAST does not normally need a deployed application.

```text
SAST

Source Code
    │
    ▼
Static Analysis
    │
    ├── Syntax
    ├── Control Flow
    ├── Data Flow
    ├── Taint Analysis
    └── Security Rules
    │
    ▼
Security Findings
```

---

# 2. SAST in DevSecOps

A typical DevSecOps pipeline can look like:

```text
Developer
    │
    ▼
Git Push
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
Test
    │
    ▼
DAST
    │
    ▼
Release
```

SAST is generally one of the earliest automated security checks.

---

# 3. Why SAST Is Important

Finding a vulnerability late can be expensive.

Consider:

```text
Developer writes vulnerable code
            │
            ▼
        Build passes
            │
            ▼
       Application deployed
            │
            ▼
      Vulnerability discovered
            │
            ▼
        Emergency fix
```

With SAST:

```text
Developer writes vulnerable code
            │
            ▼
           SAST
            │
            ▼
        Finding
            │
            ▼
      Developer fixes code
            │
            ▼
        Build continues
```

The earlier feedback loop is usually cheaper and faster.

---

# 4. SAST vs DAST

| SAST | DAST |
|---|---|
| Static | Dynamic |
| Analyzes code | Tests running application |
| Does not normally require deployment | Requires running target |
| Usually white/gray-box | Usually black-box |
| Finds code-level weaknesses | Finds runtime weaknesses |
| Early in SDLC | Later in SDLC |
| Can inspect code paths | Observes externally visible behavior |
| Can identify dangerous data flows | Tests actual HTTP/API behavior |

Example:

```text
SAST:
"User-controlled data reaches a SQL execution API without
appropriate protection."

DAST:
"When I send specially crafted input to the running application,
the response indicates potentially unsafe query behavior."
```

Both are complementary.

---

# 5. SAST vs SCA

These are often confused.

## SAST

Looks primarily at:

```text
Application Code
```

## SCA

Looks primarily at:

```text
Third-Party Dependencies
```

Example:

```text
Application
   │
   ├── Your Code
   │      └── SAST
   │
   └── Libraries
          └── SCA
```

A mature DevSecOps pipeline usually uses both.

---

# 6. SAST vs Code Review

Code review and SAST are also different.

```text
Code Review
    │
    └── Human reasoning


SAST
    │
    └── Automated analysis
```

Human review can understand:

- Business logic
- Design intent
- Architecture
- Context

SAST is good at:

- Repeating known checks
- Searching large codebases
- Tracking data flow
- Detecting coding patterns
- Providing fast automated feedback

The strongest approach combines both.

---

# 7. What Does SAST Analyze?

A SAST engine can analyze multiple representations.

```text
Source Code
     │
     ▼
Parser
     │
     ▼
AST
     │
     ├── Control Flow
     ├── Data Flow
     ├── Call Graph
     └── Taint Tracking
     │
     ▼
Security Rules
     │
     ▼
Findings
```

---

# 8. Lexical Analysis

The first layer can involve understanding tokens.

Example:

```java
String query = "SELECT * FROM users WHERE id=" + userId;
```

The analyzer can recognize:

```text
String
Identifier
=
String Literal
+
Identifier
;
```

This is useful, but token matching alone is not enough for sophisticated security analysis.

---

# 9. Parsing

The parser converts source code into a structured representation.

Example:

```java
result = execute(query);
```

Conceptually:

```text
Assignment
│
├── Variable: result
│
└── Call
    │
    ├── Function: execute
    └── Argument: query
```

This structured representation allows the analyzer to reason about code relationships.

---

# 10. Abstract Syntax Tree (AST)

An **AST** represents source code as a tree.

Example:

```java
String name = request.getParameter("name");
```

Simplified AST:

```text
VariableDeclaration
│
├── Type: String
├── Name: name
└── Initializer
    │
    └── MethodCall
        ├── Object: request
        ├── Method: getParameter
        └── Argument: "name"
```

ASTs are fundamental to many static-analysis systems.

---

# 11. Control Flow

Control-flow analysis examines how execution can move through code.

Example:

```java
if (authenticated) {
    accessAccount();
} else {
    deny();
}
```

Conceptually:

```text
Start
  │
  ▼
authenticated?
  │
 ┌┴────────────┐
 │             │
Yes            No
 │             │
 ▼             ▼
access()      deny()
 │             │
 └──────┬──────┘
        ▼
       End
```

This helps a security analyzer reason about reachable behavior.

---

# 12. Data Flow

Data-flow analysis tracks how values move through an application.

Example:

```java
String input = request.getParameter("name");
String output = process(input);
response.getWriter().write(output);
```

Conceptually:

```text
HTTP Request
     │
     ▼
User Input
     │
     ▼
process()
     │
     ▼
output
     │
     ▼
HTTP Response
```

SAST can analyze whether untrusted data reaches security-sensitive operations.

---

# 13. Taint Analysis

Taint analysis is one of the most important concepts in modern SAST.

The analyzer marks data from an untrusted source as **tainted**.

```text
SOURCE
  │
  ▼
Tainted Data
  │
  ▼
Propagation
  │
  ▼
SINK
```

For example:

```text
request.getParameter()
        │
        ▼
     userInput
        │
        ▼
    buildQuery()
        │
        ▼
   executeQuery()
```

If the tainted data reaches a dangerous sink without sufficient sanitization or validation, SAST can report a finding.

---

# 14. Sources

A **source** is a location where potentially untrusted data enters an application.

Examples:

```text
HTTP Parameters
HTTP Headers
Cookies
Request Body
File Uploads
Environment Variables
Message Queues
Database Records
External APIs
```

Example:

```java
String id = request.getParameter("id");
```

The request parameter may be treated as a source.

---

# 15. Sinks

A **sink** is a security-sensitive operation.

Examples:

```text
SQL Execution
HTML Output
OS Command Execution
File Access
LDAP Query
Template Rendering
Deserialization
Redirect
```

Example:

```java
statement.executeQuery(query);
```

The execution API may be considered a sink.

---

# 16. Source → Propagation → Sink

A classic SAST pattern is:

```text
SOURCE
  │
  ▼
User Input
  │
  ▼
Variable
  │
  ▼
Function A
  │
  ▼
Function B
  │
  ▼
SINK
```

The analyzer asks:

> **Can untrusted data travel from the source to the sink without an effective security control?**

This is much more powerful than simply searching for suspicious strings.

---

# 17. Sanitizers

A sanitizer or validation step may change the analysis.

Conceptually:

```text
SOURCE
  │
  ▼
Tainted Data
  │
  ▼
Validation / Encoding
  │
  ▼
Sink
```

The exact treatment depends on the vulnerability and the analyzer's rules.

For example, HTML output encoding may reduce XSS risk, while SQL parameterization is a more appropriate defense for SQL injection.

---

# 18. Example: SQL Injection

Potentially unsafe code:

```java
String id = request.getParameter("id");

String query =
    "SELECT * FROM users WHERE id=" + id;

statement.executeQuery(query);
```

Conceptual SAST flow:

```text
request.getParameter("id")
            │
            ▼
          id
            │
            ▼
      String Concatenation
            │
            ▼
          query
            │
            ▼
executeQuery(query)
            │
            ▼
        SQL Sink
```

A SAST tool may identify this as a potential SQL injection.

A safer pattern is parameterized SQL:

```java
PreparedStatement ps =
    connection.prepareStatement(
        "SELECT * FROM users WHERE id = ?"
    );

ps.setString(1, id);
```

The exact recommendation depends on the framework and database API.

---

# 19. Example: Cross-Site Scripting

Potentially unsafe:

```java
String name = request.getParameter("name");

response.getWriter().write(
    "<h1>Hello " + name + "</h1>"
);
```

Conceptual flow:

```text
HTTP Parameter
      │
      ▼
     name
      │
      ▼
HTML Construction
      │
      ▼
HTTP Response
      │
      ▼
Potential XSS
```

The correct mitigation depends on context and may involve appropriate output encoding and framework-safe rendering.

---

# 20. Example: Command Injection

Potentially dangerous:

```java
String host = request.getParameter("host");

Runtime.getRuntime().exec(
    "ping " + host
);
```

Conceptually:

```text
Request Parameter
       │
       ▼
      host
       │
       ▼
String Concatenation
       │
       ▼
OS Command
       │
       ▼
Potential Command Injection
```

Safer designs avoid constructing shell commands from untrusted input and use safe APIs with strict allowlists where appropriate.

---

# 21. Authentication Analysis

SAST can identify some authentication-related weaknesses.

Examples:

- Weak password handling
- Hardcoded credentials
- Insecure authentication logic
- Dangerous session handling
- Missing authentication checks on sensitive operations

Example:

```java
if (request.getParameter("admin").equals("true")) {
    openAdminPanel();
}
```

A static analyzer may identify suspicious authorization logic.

However, application-level authorization correctness often requires runtime and manual testing too.

---

# 22. Authorization

Authentication asks:

> **Who are you?**

Authorization asks:

> **What are you allowed to do?**

Potentially unsafe:

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable String id) {
    return userService.find(id);
}
```

The important question may be:

```text
Does the current user have permission
to access this specific user ID?
```

SAST may identify missing or suspicious authorization patterns, but complete authorization testing often requires DAST and manual testing.

---

# 23. Hardcoded Secrets

Example:

```java
String apiKey =
    "sk-example-secret";
```

A SAST or secrets scanner may identify this.

Better:

```text
Application
     │
     ▼
Secret Manager
     │
     ▼
Runtime Secret
```

Secrets should not be embedded in source code.

---

# 24. Cryptography

SAST tools may detect insecure cryptographic patterns.

Examples can include:

```text
Weak Hashing
Weak Encryption
Hardcoded Keys
Insecure Randomness
Deprecated Algorithms
```

For example, using a general-purpose cryptographic hash for password storage can be inappropriate.

Password hashing should use an appropriate password-hashing algorithm and configuration.

---

# 25. Insecure Randomness

Security-sensitive tokens should not use predictable randomness.

Potentially unsafe:

```java
new Random().nextInt();
```

For security-sensitive purposes, a cryptographically secure random generator should be used.

SAST rules can identify certain insecure random APIs.

---

# 26. Path Traversal

Potentially unsafe:

```java
String filename =
    request.getParameter("file");

File file = new File(
    "/documents/" + filename
);
```

Conceptual flow:

```text
HTTP Parameter
      │
      ▼
   filename
      │
      ▼
File Path Construction
      │
      ▼
File Access
```

SAST can identify potentially dangerous data flow.

---

# 27. Unsafe Deserialization

Deserialization can become dangerous when untrusted input is converted into objects using unsafe mechanisms.

Conceptually:

```text
Untrusted Input
      │
      ▼
Deserializer
      │
      ▼
Object
      │
      ▼
Potential Exploitation
```

SAST can identify certain dangerous deserialization APIs and patterns.

---

# 28. Open Redirect

Potentially unsafe:

```java
String target =
    request.getParameter("url");

response.sendRedirect(target);
```

Conceptual flow:

```text
User Input
    │
    ▼
Redirect Target
    │
    ▼
sendRedirect()
```

Applications should validate redirect targets appropriately.

---

# 29. Security Misconfiguration

Some static analyzers can inspect configuration files.

Examples:

```text
application.yml
application.properties
web.xml
Dockerfile
Kubernetes YAML
Terraform
```

Examples of issues can include:

- Debug mode
- Weak TLS configuration
- Overly permissive settings
- Insecure defaults
- Exposed management endpoints

Dedicated IaC and configuration scanners are often used alongside SAST.

---

# 30. SAST Analysis Techniques

Modern SAST engines can use several techniques.

```text
                 SAST ENGINE
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
   Pattern        Data Flow      Control Flow
   Matching       Analysis       Analysis
      │              │              │
      └──────────────┼──────────────┘
                     │
                     ▼
                Taint Analysis
                     │
                     ▼
                Rule Engine
                     │
                     ▼
                  Finding
```

---

# 31. Pattern Matching

The simplest form of static analysis is pattern matching.

Example:

```text
eval(...)
```

or:

```text
Runtime.getRuntime().exec(...)
```

The tool can search for dangerous constructs.

Advantages:

- Fast
- Simple
- Easy to explain

Limitations:

- Can generate false positives
- Can miss indirect data flow
- Does not always understand context

---

# 32. Semantic Analysis

Semantic analysis attempts to understand what code means rather than simply matching text.

For example:

```java
String value = request.getParameter("id");

String query = buildQuery(value);

execute(query);
```

A semantic analyzer can potentially understand:

```text
value
  ↓
buildQuery
  ↓
query
  ↓
execute
```

This provides stronger security analysis.

---

# 33. Interprocedural Analysis

Interprocedural analysis tracks data across function or method boundaries.

Example:

```java
String input =
    request.getParameter("name");

String cleaned =
    normalize(input);

String result =
    buildResponse(cleaned);

send(result);
```

The analyzer may need to reason across:

```text
Controller
    ↓
normalize()
    ↓
buildResponse()
    ↓
send()
```

This is important for real-world applications because security-sensitive data rarely stays inside a single method.

---

# 34. Call Graph

A call graph describes which functions can call which other functions.

```text
Controller
    │
    ├── authenticate()
    │
    └── processRequest()
             │
             ├── validate()
             │
             ├── service()
             │      │
             │      └── repository()
             │
             └── response()
```

SAST engines can use call-graph information to improve analysis.

---

# 35. Control Flow Graph

A Control Flow Graph (CFG) represents possible execution paths.

Example:

```text
          Start
            │
            ▼
         Validate
          /     \
       Pass     Fail
        │         │
        ▼         ▼
      Execute    Reject
        │         │
        └────┬────┘
             ▼
            End
```

CFGs help analyzers reason about conditions and reachable code.

---

# 36. Data Flow Graph

A Data Flow Graph focuses on how data moves.

```text
Request
  │
  ▼
input
  │
  ├── normalize()
  │
  ▼
query
  │
  ▼
database
```

SAST can combine control-flow and data-flow information.

---

# 37. Rule Engines

SAST tools generally use rules or queries that describe security patterns.

A conceptual rule might say:

```text
IF
  data comes from an untrusted HTTP source
AND
  data reaches a SQL execution sink
AND
  no approved sanitization exists
THEN
  report SQL Injection
```

Modern tools may represent these rules using specialized query languages or rule systems.

---

# 38. CodeQL

**CodeQL** is a semantic code analysis technology from GitHub.

Its conceptual model is:

```text
Source Code
     │
     ▼
CodeQL Database
     │
     ▼
Queries
     │
     ▼
Results
```

CodeQL treats code as data that can be queried.

This allows security researchers and engineers to write queries for complex code patterns and data flows.

### Strengths

- Deep semantic analysis
- Powerful query language
- Strong integration with GitHub
- Supports custom security queries
- Good for large codebases

### Typical Use

```text
Pull Request
     │
     ▼
CodeQL Analysis
     │
     ▼
Security Findings
     │
     ▼
Developer
```

---

# 39. Semgrep

**Semgrep** is a lightweight code-analysis tool that uses patterns to identify code constructs.

Conceptually:

```text
Source Code
     │
     ▼
Semgrep Rule
     │
     ▼
Pattern Match
     │
     ▼
Finding
```

It supports:

- Security rules
- Bug finding
- Custom rules
- CI/CD integration
- Developer workflows

Semgrep is particularly useful when teams want to create organization-specific rules.

---

# 40. SonarQube

**SonarQube** provides static code analysis covering code quality and security-related issues.

It can be used to:

- Identify bugs
- Detect code smells
- Find certain security vulnerabilities
- Enforce quality gates
- Provide developer feedback

A simplified flow:

```text
Repository
    │
    ▼
SonarQube Analysis
    │
    ├── Bugs
    ├── Code Smells
    └── Security Issues
    │
    ▼
Quality Gate
```

Important distinction:

> **SonarQube is broader than a pure security-only SAST tool because it also focuses heavily on code quality.**

---

# 41. Checkmarx

**Checkmarx** provides enterprise application-security capabilities including SAST.

Typical enterprise positioning:

```text
Application Security
       │
       ├── SAST
       ├── SCA
       ├── DAST
       └── Other AppSec Controls
```

It is commonly used in larger organizations requiring centralized AppSec governance.

---

# 42. Fortify

**OpenText Fortify** is an enterprise application security platform with static analysis capabilities.

It is commonly associated with:

- Enterprise SAST
- Centralized security management
- Compliance
- Large application portfolios
- Custom security policies

---

# 43. Veracode

**Veracode** provides application-security testing capabilities including static analysis.

Typical model:

```text
Application
     │
     ├── SAST
     ├── DAST
     ├── SCA
     └── AppSec Management
```

It is useful for organizations seeking a broader application-security platform.

---

# 44. SAST Tool Landscape

A practical grouping:

| Tool | Positioning | Strength |
|---|---|---|
| **CodeQL** | Semantic analysis | Deep code/data-flow queries |
| **Semgrep** | Developer-focused static analysis | Fast custom rules |
| **SonarQube** | Code quality + security | Quality gates and developer feedback |
| **Checkmarx** | Enterprise AppSec | Enterprise SAST and platform integration |
| **Fortify** | Enterprise AppSec | Mature static analysis and governance |
| **Veracode** | Enterprise AppSec | Managed application security platform |

Tool capabilities change over time, so organizations should validate current language coverage, analysis depth, integrations, licensing, and deployment options during selection.

---

# 45. Open Source vs Commercial SAST

## Open / Community-Oriented

Examples:

```text
Semgrep
CodeQL
SonarQube Community
```

Advantages:

- Lower entry cost
- Customization
- Developer experimentation
- CI/CD flexibility

Considerations:

- Engineering effort
- Enterprise governance
- Support
- Coverage
- Advanced features

## Commercial

Examples:

```text
Checkmarx
Fortify
Veracode
```

Advantages:

- Enterprise support
- Centralized management
- Governance
- Reporting
- Integrations
- Policy management

Considerations:

- Licensing cost
- Platform complexity
- Vendor dependency

---

# 46. SAST Language Coverage

Before selecting a SAST tool, verify support for your actual technology stack.

Example:

```text
Java
Spring
JavaScript
TypeScript
Python
C#
Go
C/C++
Kotlin
PHP
Ruby
```

Also verify framework support.

For example:

```text
Java
  │
  └── Spring Boot
         │
         ├── REST
         ├── Security
         └── JPA
```

A tool that supports Java but has weak understanding of the frameworks used by your application may produce less useful results.

---

# 47. Framework Awareness

Modern applications use frameworks heavily.

Example:

```text
Spring Controller
       │
       ▼
Service
       │
       ▼
Repository
       │
       ▼
Database
```

A mature analyzer should understand common framework patterns.

Framework-aware analysis can reduce false positives and improve data-flow accuracy.

---

# 48. SAST False Positives

A false positive occurs when the scanner reports a security issue that is not actually exploitable or relevant.

Example:

```text
Scanner:
"Potential SQL Injection"

Developer:
"Input is already safely parameterized."
```

Process:

```text
Finding
   │
   ▼
Review
   │
   ├── True Positive ──► Fix
   │
   └── False Positive ─► Suppress / Tune
```

---

# 49. SAST False Negatives

A false negative occurs when a real vulnerability is not detected.

Possible causes:

- Unsupported language
- Unsupported framework
- Incomplete analysis
- Complex data flow
- Dynamic behavior
- Custom framework
- Missing source code
- Incorrect configuration
- Tool limitation

Therefore:

> **A clean SAST result does not prove the application is secure.**

---

# 50. SAST Baselines

Existing repositories may already contain thousands of findings.

If every finding immediately fails CI:

```text
Legacy Repository
       │
       ▼
SAST
       │
       ▼
10,000 Findings
       │
       ▼
Pipeline Blocked
```

A practical approach is to establish a baseline:

```text
Existing Findings
       │
       ▼
Baseline
       │
       ▼
New Code
       │
       ▼
New Findings
       │
       ▼
Security Gate
```

The goal is:

> **Do not allow the security posture of new code to get worse.**

Existing technical debt should then be reduced progressively.

---

# 51. New-Code Security

A useful policy is:

```text
Old Findings
     │
     └── Track / Remediate

New Code
     │
     └── Must Meet Security Standard
```

This is often more practical than trying to eliminate every historical issue immediately.

---

# 52. SAST in Pull Requests

One of the best places to run SAST is the pull request.

```text
Developer
   │
   ▼
Pull Request
   │
   ▼
SAST
   │
   ├── Finding
   │     │
   │     ▼
   │   Fix PR
   │
   └── Clean
         │
         ▼
       Review
```

This gives developers rapid feedback.

---

# 53. SAST in CI/CD

A typical pipeline:

```text
Git Push
   │
   ▼
SAST
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

For large projects, SAST can also run on scheduled full scans while pull requests use faster incremental analysis.

---

# 54. Incremental vs Full Scan

## Incremental Scan

Analyzes changed code or affected areas.

```text
PR
 │
 ▼
Changed Files
 │
 ▼
Fast SAST
```

Advantages:

- Faster
- Developer-friendly
- Good for pull requests

## Full Scan

Analyzes the entire project.

```text
Repository
    │
    ▼
Full SAST
```

Advantages:

- Broader coverage
- Finds issues missed by incremental analysis
- Useful for scheduled scans

A mature strategy can use both.

---

# 55. SAST Security Gate

Example:

```text
SAST
 │
 ▼
Findings
 │
 ▼
Filter
 │
 ▼
Severity / Confidence
 │
 ├── Critical + High ──► Block
 │
 ├── Medium ───────────► Review
 │
 └── Low ──────────────► Report
```

The exact thresholds should be defined by organizational policy.

---

# 56. Severity and Confidence

Some tools distinguish between:

```text
Severity
```

and:

```text
Confidence
```

For example:

```text
Critical Severity
+
High Confidence
=
Strong Candidate for Blocking
```

Whereas:

```text
Medium Severity
+
Low Confidence
=
Manual Review
```

This can reduce unnecessary pipeline failures.

---

# 57. Developer Feedback

A useful SAST finding should provide:

```text
Title
   │
   ▼
Severity
   │
   ▼
Location
   │
   ▼
Code Path
   │
   ▼
Why It Is Dangerous
   │
   ▼
Remediation
   │
   ▼
Reference
```

Example:

```text
SQL Injection

File:
UserRepository.java

Line:
42

Source:
request.getParameter("id")

Sink:
executeQuery()

Recommendation:
Use a parameterized query.
```

---

# 58. IDE Integration

SAST feedback can also appear before code reaches CI/CD.

```text
Developer IDE
      │
      ▼
Static Analysis
      │
      ▼
Security Warning
      │
      ▼
Developer Fix
```

This is another form of shift-left security.

---

# 59. SAST and Developer Workflow

An effective workflow should be:

```text
Write Code
    │
    ▼
IDE Feedback
    │
    ▼
Commit
    │
    ▼
Pull Request
    │
    ▼
SAST
    │
    ▼
Review
    │
    ▼
Merge
```

Security becomes part of normal development rather than a separate security event.

---

# 60. SAST and GitHub

A GitHub-based workflow can include:

```text
GitHub
  │
  ├── Pull Request
  │      │
  │      ├── CodeQL
  │      ├── Semgrep
  │      └── Other SAST
  │
  └── Main Branch
         │
         └── Full Security Scan
```

Results can be surfaced through the repository's security features depending on the selected tool and integration.

---

# 61. Example GitHub Actions Structure

```yaml
name: SAST

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  sast:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run static analysis
        run: |
          echo "Run approved SAST tool here"

      - name: Evaluate security gate
        run: |
          echo "Apply organization security policy"
```

For production use, use the official action or CLI for the selected scanner and follow the organization's action-pinning and supply-chain policies.

---

# 62. CodeQL Conceptual Workflow

```text
Repository
    │
    ▼
Build / Extract
    │
    ▼
CodeQL Database
    │
    ▼
Security Queries
    │
    ▼
Analysis
    │
    ▼
Findings
```

The key concept is:

> **CodeQL turns code into a queryable representation and then executes security queries against that representation.**

---

# 63. Semgrep Conceptual Workflow

```text
Source Code
     │
     ▼
Semgrep Parser
     │
     ▼
Rules
     │
     ▼
Pattern Matching
     │
     ▼
Findings
```

Custom rules can help organizations detect their own coding standards.

---

# 64. Custom SAST Rules

Organizations often need rules beyond vendor defaults.

Example:

```text
Company Rule:

Do not use:
LegacyCrypto.encrypt()

Use:
ApprovedCryptoService.encrypt()
```

Conceptually:

```text
Code
 │
 ▼
Custom Rule
 │
 ├── Violation ──► Finding
 │
 └── Compliant ──► Continue
```

Custom rules are especially valuable for enforcing internal secure-coding standards.

---

# 65. SAST Rule Tuning

A mature SAST implementation requires tuning.

```text
Initial Scan
    │
    ▼
Findings
    │
    ├── True Positive
    ├── False Positive
    ├── Not Applicable
    └── Duplicate
    │
    ▼
Rule Tuning
    │
    ▼
Improved Signal
```

The objective is:

> **High-value findings with manageable noise.**

---

# 66. SAST and Legacy Applications

Legacy applications often have:

```text
Large Codebase
+
Old Frameworks
+
Technical Debt
+
Many Findings
```

Do not attempt a "fix everything immediately" strategy without prioritization.

A practical approach:

```text
Baseline
   │
   ▼
Prioritize Critical/High
   │
   ▼
Fix New Code
   │
   ▼
Reduce Historical Debt
   │
   ▼
Improve Rules
```

---

# 67. SAST in Monorepos

Large repositories may contain:

```text
repo/
├── frontend/
├── backend/
├── services/
├── libraries/
└── infrastructure/
```

SAST strategy should account for:

- Multiple languages
- Different build systems
- Different teams
- Shared libraries
- Generated code
- Third-party code

---

# 68. Generated Code

Generated code can produce noisy findings.

Examples:

```text
OpenAPI Generated Clients
ORM Generated Classes
Build-Generated Code
Framework Artifacts
```

Organizations may exclude or separately manage generated code when appropriate.

Do not blindly exclude large portions of the codebase without understanding the security implications.

---

# 69. Third-Party Source Code

If third-party source code is included in the repository, decide whether it should be analyzed.

```text
Your Code
   │
   └── Primary SAST Target

Third-Party Code
   │
   └── Usually handled through dependency/SCA controls
```

The correct strategy depends on how the code is consumed and maintained.

---

# 70. SAST and Build Accuracy

Some advanced SAST tools perform better when they understand the actual build.

For example:

```text
Source
   │
   ▼
Build System
   │
   ▼
Dependencies
   │
   ▼
Compiler / Analyzer
   │
   ▼
Static Analysis
```

Incorrect project configuration can lead to incomplete analysis.

Therefore:

> **A successful SAST job does not necessarily mean that the entire application was analyzed correctly.**

Always verify scan coverage.

---

# 71. SAST Coverage

Important questions include:

- Which repositories are covered?
- Which branches are covered?
- Which languages are covered?
- Which frameworks are supported?
- Is generated code included?
- Are test files included?
- Are all modules analyzed?
- Is the full dependency graph available?
- Are native components included?
- Are custom rules enabled?

Coverage is as important as detection quality.

---

# 72. SAST Limitations

SAST cannot replace every security control.

Limitations include:

- Business logic
- Runtime configuration
- Infrastructure behavior
- External service behavior
- Deployment issues
- Authentication configuration
- Complex authorization behavior
- Race conditions
- Environment-specific vulnerabilities
- Some runtime-only issues

Therefore:

```text
SAST
 +
SCA
 +
Secrets
 +
IaC
 +
Container
 +
DAST
 +
Manual Testing
```

is stronger than SAST alone.

---

# 73. SAST and Business Logic

Consider:

```text
if (balance >= amount) {
    withdraw(amount);
}
```

The code may look correct.

But perhaps:

```text
Request A: withdraw ₹100
Request B: withdraw ₹100
```

arrive simultaneously.

A race condition may allow both requests to succeed.

This type of business/race behavior may require runtime testing and manual analysis.

---

# 74. SAST and Runtime Configuration

Source code may be secure while deployment configuration is not.

Example:

```text
Application Code
      │
      ▼
Secure
      │
      ▼
Deployment
      │
      ▼
Debug Mode Enabled
```

This is why DevSecOps combines:

```text
SAST
+
IaC Scanning
+
Configuration Security
+
DAST
```

---

# 75. SAST and Secure Coding Standards

SAST can enforce organizational coding standards.

Examples:

```text
No raw SQL concatenation
No weak cryptography
No hardcoded secrets
No unsafe deserialization
No insecure random APIs
No dangerous process execution
```

This turns security guidance into automated policy.

---

# 76. Secure Coding Rule Lifecycle

A good internal rule lifecycle is:

```text
Security Requirement
       │
       ▼
Secure Coding Rule
       │
       ▼
SAST Implementation
       │
       ▼
CI/CD
       │
       ▼
Developer Feedback
       │
       ▼
Metrics
       │
       ▼
Rule Improvement
```

---

# 77. SAST Governance

Enterprise SAST programs should define:

- Mandatory repositories
- Supported languages
- Required scan frequency
- Severity thresholds
- Security gates
- Exceptions
- False-positive process
- Remediation SLAs
- Ownership
- Reporting

---

# 78. Exception Management

Not every finding can be fixed immediately.

A mature exception should include:

```text
Finding
  │
  ├── Business Justification
  ├── Risk Assessment
  ├── Compensating Controls
  ├── Owner
  ├── Expiration Date
  └── Approval
```

Avoid permanent unexplained suppressions.

---

# 79. SAST Metrics

Useful metrics include:

## Scan Coverage

```text
Repositories Scanned
--------------------
Total Repositories
```

## Critical Findings

```text
Open Critical Findings
```

## Mean Time to Remediate

```text
Finding Created
       │
       ▼
Finding Closed
```

## New-Code Findings

Track security issues introduced by new changes.

## False Positive Rate

Track how many findings require dismissal.

## Rule Effectiveness

Measure whether custom rules detect meaningful issues.

---

# 80. SAST Maturity Model

## Level 1 — Manual

```text
Occasional Code Review
```

## Level 2 — Automated

```text
SAST in CI
```

## Level 3 — Pull Request Security

```text
PR
 │
 └── SAST
```

## Level 4 — Risk-Based Gates

```text
SAST
 │
 ▼
Policy
 │
 ├── Pass
 └── Fail
```

## Level 5 — Developer-Centric

```text
IDE
 +
PR
 +
CI
 +
Custom Rules
 +
Security Champions
```

## Level 6 — Continuous Improvement

```text
Metrics
  │
  ▼
Rule Tuning
  │
  ▼
Better Signal
  │
  ▼
Lower Risk
```

---

# 81. Recommended SAST Strategy

A practical enterprise strategy can be:

```text
IDE
 │
 └── Fast developer feedback
       │
       ▼
Pull Request
 │
 └── Incremental SAST
       │
       ▼
Main Branch
 │
 └── Full SAST
       │
       ▼
Scheduled
 │
 └── Deep / Complete Scan
```

This balances speed and coverage.

---

# 82. SAST Tool Selection Checklist

## Languages

- [ ] Java
- [ ] JavaScript
- [ ] TypeScript
- [ ] Python
- [ ] C#
- [ ] Go
- [ ] C/C++
- [ ] Kotlin
- [ ] PHP
- [ ] Ruby

## Frameworks

- [ ] Spring
- [ ] .NET
- [ ] React
- [ ] Angular
- [ ] Node.js
- [ ] Django
- [ ] Flask
- [ ] Express

## Analysis

- [ ] AST
- [ ] Data flow
- [ ] Control flow
- [ ] Taint analysis
- [ ] Interprocedural analysis
- [ ] Call graph
- [ ] Custom rules

## CI/CD

- [ ] GitHub Actions
- [ ] Jenkins
- [ ] GitLab CI
- [ ] Azure DevOps
- [ ] CLI
- [ ] API

## Developer Experience

- [ ] IDE integration
- [ ] Pull request comments
- [ ] Inline findings
- [ ] Remediation guidance
- [ ] Suppression workflow

## Enterprise

- [ ] Central dashboard
- [ ] RBAC
- [ ] Policy management
- [ ] Exceptions
- [ ] Audit trail
- [ ] Reporting
- [ ] SLA tracking

---

# 83. Recommended Learning Order

For learning SAST:

```text
1. Understand Static Analysis
        │
        ▼
2. Learn AST
        │
        ▼
3. Learn Control Flow
        │
        ▼
4. Learn Data Flow
        │
        ▼
5. Learn Source / Sink
        │
        ▼
6. Learn Taint Analysis
        │
        ▼
7. Learn Security Rules
        │
        ▼
8. Use Semgrep
        │
        ▼
9. Learn CodeQL
        │
        ▼
10. Integrate SAST into CI/CD
        │
        ▼
11. Build Custom Rules
        │
        ▼
12. Implement Security Gates
```

---

# 84. Practical Example: Java Application

Suppose we have:

```text
Spring Boot
     │
     ├── Controller
     ├── Service
     ├── Repository
     └── Database
```

A request arrives:

```text
GET /users?id=123
```

Code:

```java
@GetMapping("/users")
public User getUser(
    @RequestParam String id
) {
    return service.find(id);
}
```

Then:

```java
public User find(String id) {
    return repository.find(id);
}
```

Then:

```java
public User find(String id) {
    String query =
        "SELECT * FROM users WHERE id=" + id;

    return jdbc.execute(query);
}
```

A sophisticated SAST analyzer may build:

```text
HTTP Request
     │
     ▼
@RequestParam id
     │
     ▼
Controller
     │
     ▼
Service.find()
     │
     ▼
Repository.find()
     │
     ▼
String Concatenation
     │
     ▼
jdbc.execute()
     │
     ▼
SQL Sink
```

This is the power of data-flow analysis.

---

# 85. Practical Secure Version

```java
public User find(String id) {

    String query =
        "SELECT * FROM users WHERE id = ?";

    return jdbc.query(
        query,
        id
    );
}
```

The security model becomes:

```text
User Input
    │
    ▼
Parameterized Query
    │
    ▼
Database
```

The input is treated as data rather than executable query syntax.

---

# 86. Practical DevSecOps SAST Pipeline

```text
Developer
    │
    ▼
IDE
    │
    ▼
Git Commit
    │
    ▼
Pull Request
    │
    ▼
Incremental SAST
    │
    ▼
Review
    │
    ▼
Merge
    │
    ▼
Full SAST
    │
    ▼
Security Gate
    │
    ▼
Build
```

---

# 87. SAST Finding Lifecycle

```text
Detected
   │
   ▼
Triaged
   │
   ├── False Positive
   │
   ├── Accepted Risk
   │
   └── True Positive
          │
          ▼
       Assigned
          │
          ▼
       Remediated
          │
          ▼
       Rescanned
          │
          ▼
        Closed
```

---

# 88. Common SAST Anti-Patterns

## Anti-Pattern 1: Run SAST Only Before Production

This defeats the purpose of early feedback.

## Anti-Pattern 2: Block Every Finding

This creates developer resistance.

## Anti-Pattern 3: Ignore False Positives

This creates alert fatigue.

## Anti-Pattern 4: Never Tune Rules

Default rules may not fit your architecture.

## Anti-Pattern 5: No Ownership

Every meaningful finding needs an owner.

## Anti-Pattern 6: No Baseline for Legacy Code

Thousands of old findings can make the tool unusable.

## Anti-Pattern 7: Assume Clean SAST Means Secure

SAST cannot test everything.

## Anti-Pattern 8: Scan Without Verifying Coverage

A successful scanner run may still have incomplete analysis.

---

# 89. SAST and the Four Questions

Whenever you evaluate a SAST finding, ask:

```text
1. WHERE does the data come from?
             │
             ▼
2. HOW does the data flow?
             │
             ▼
3. WHERE does the data end up?
             │
             ▼
4. WHAT security control protects the sink?
```

Example:

```text
HTTP Request
     │
     ▼
User Input
     │
     ▼
Service
     │
     ▼
SQL Query
     │
     ▼
Database
```

Then ask:

> Is the data parameterized, validated, encoded, authorized, or otherwise protected appropriately?

---

# 90. Final SAST Mental Model

```text
                         SOURCE CODE
                              │
                              ▼
                          PARSING
                              │
                              ▼
                            AST
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
            Control Flow   Data Flow    Call Graph
                 │            │            │
                 └────────────┼────────────┘
                              ▼
                        Taint Analysis
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
                  SOURCE               SINK
                    │                   │
                    └───────┬───────────┘
                            ▼
                     Security Rules
                            │
                            ▼
                         FINDING
                            │
                            ▼
                    Developer Feedback
                            │
                            ▼
                         REMEDIATE
                            │
                            ▼
                          RESCAN
```

---

# 91. Quick Reference

```text
SAST
│
├── Static
│   └── Analyzes code without running the application
│
├── Inputs
│   ├── Source Code
│   ├── Bytecode
│   └── Intermediate Representation
│
├── Analysis
│   ├── Parsing
│   ├── AST
│   ├── Control Flow
│   ├── Data Flow
│   ├── Call Graph
│   └── Taint Analysis
│
├── Security Concepts
│   ├── Source
│   ├── Sink
│   ├── Sanitizer
│   └── Data Flow
│
├── Finds
│   ├── Injection
│   ├── XSS
│   ├── Command Injection
│   ├── Path Traversal
│   ├── Unsafe Deserialization
│   ├── Weak Cryptography
│   ├── Hardcoded Secrets
│   └── Other Coding Weaknesses
│
├── Tools
│   ├── CodeQL
│   ├── Semgrep
│   ├── SonarQube
│   ├── Checkmarx
│   ├── Fortify
│   └── Veracode
│
├── CI/CD
│   ├── IDE
│   ├── Pull Request
│   ├── Main Branch
│   └── Scheduled Full Scan
│
└── Limitations
    ├── Business Logic
    ├── Runtime Behavior
    ├── Configuration
    ├── False Positives
    └── False Negatives
```

---

# 92. Key Takeaway

> **SAST analyzes the application's internal code and data flows to identify security weaknesses before the application is deployed.**

Remember the core model:

```text
SOURCE
   │
   ▼
PARSE
   │
   ▼
AST / CODE MODEL
   │
   ▼
CONTROL FLOW + DATA FLOW
   │
   ▼
SOURCE → PROPAGATION → SINK
   │
   ▼
SECURITY RULE
   │
   ▼
FINDING
   │
   ▼
FIX
   │
   ▼
RESCAN
```

The most important concepts to understand are:

```text
AST
+
Control Flow
+
Data Flow
+
Source / Sink
+
Taint Analysis
+
Security Rules
+
CI/CD Integration
+
Risk-Based Gates
```

And remember:

> **SAST is an early detection control, not proof that an application is secure.**

A mature DevSecOps program combines SAST with:

```text
Threat Modeling
      +
Secure Coding
      +
SAST
      +
SCA
      +
Secrets Scanning
      +
IaC Scanning
      +
Container Scanning
      +
DAST
      +
Manual Testing
      +
Runtime Security
```

---

# 93. Related Knowledge

- [`README.md`](README.md)
- [`devsecops.md`](devsecops.md)
- [`dast.md`](dast.md)
- [`sca.md`](sca.md)
- [`container-scanning.md`](container-scanning.md)
- [`secrets-scanning.md`](secrets-scanning.md)
