# Maven

## 1. What is Maven?

**Apache Maven** is a build automation and dependency management tool commonly used for Java applications.

Maven helps automate activities such as:

- Compiling source code
- Running tests
- Managing dependencies
- Packaging applications
- Executing build plugins
- Publishing artifacts

A simplified Maven flow is:

```text
Source Code
    |
    v
  Maven
    |
    +---- Compile
    |
    +---- Test
    |
    +---- Package
    |
    +---- Verify
    |
    v
 Artifact
```

---

## 2. Why Maven is Used

Without a build automation tool, developers would have to manually manage activities such as:

- Downloading libraries
- Managing library versions
- Compiling source code
- Running tests
- Creating application packages
- Executing build-related tasks

Maven provides a standardized way to automate these activities.

---

## 3. Maven Project Structure

A typical Maven project follows a standard directory structure:

```text
my-application/
│
├── pom.xml
│
└── src/
    ├── main/
    │   ├── java/
    │   └── resources/
    │
    └── test/
        ├── java/
        └── resources/
```

### `src/main/java`

Contains application source code.

### `src/main/resources`

Contains application resources.

### `src/test/java`

Contains test source code.

### `src/test/resources`

Contains test resources.

### `pom.xml`

Contains Maven project configuration.

---

## 4. What is POM?

POM stands for:

**Project Object Model**

The `pom.xml` file describes the Maven project and provides information required to build it.

A basic POM looks like:

```xml
<project>
    <groupId>com.example</groupId>
    <artifactId>myapp</artifactId>
    <version>1.0.0</version>
</project>
```

The POM can contain:

- Project coordinates
- Dependencies
- Plugins
- Properties
- Build configuration
- Profiles
- Repository configuration

Detailed `pom.xml` concepts are covered separately in:

```text
pom-xml.md
```

---

## 5. Maven Coordinates

Maven identifies an artifact using coordinates.

The most important coordinates are:

```text
groupId
artifactId
version
```

Example:

```xml
<groupId>com.example</groupId>
<artifactId>myapp</artifactId>
<version>1.0.0</version>
```

Conceptually:

```text
com.example : myapp : 1.0.0
```

These coordinates identify a particular artifact and version.

---

## 6. Maven Lifecycle

Maven provides predefined build lifecycles.

The most commonly used lifecycle is the **default lifecycle**.

Important phases include:

```text
validate
   ↓
compile
   ↓
test
   ↓
package
   ↓
verify
   ↓
install
   ↓
deploy
```

When a later phase is executed, Maven executes the required earlier phases in order.

For example:

```bash
mvn package
```

causes Maven to execute the phases required to reach `package`.

---

## 7. Important Maven Phases

### `validate`

Validates that the project is correct and that all required information is available.

```bash
mvn validate
```

---

### `compile`

Compiles the main source code.

```bash
mvn compile
```

Conceptually:

```text
Java Source
    |
    v
 Compile
    |
    v
Compiled Classes
```

---

### `test`

Runs the project's tests.

```bash
mvn test
```

Flow:

```text
Compile
   |
   v
 Test
   |
   +---- PASS
   |
   +---- FAIL
```

---

### `package`

Packages the compiled application into its distributable format.

For example:

```text
JAR
WAR
```

Command:

```bash
mvn package
```

Flow:

```text
Source
  |
  v
Compile
  |
  v
Test
  |
  v
Package
  |
  v
myapp.jar
```

---

### `verify`

Runs checks that verify the package is valid and meets the configured requirements.

```bash
mvn verify
```

---

### `install`

Installs the generated artifact into the local Maven repository.

```bash
mvn install
```

The local repository is commonly located at:

```text
~/.m2/repository
```

Flow:

```text
Project
   |
   v
 Build
   |
   v
Artifact
   |
   v
Local Maven Repository
```

---

### `deploy`

Publishes the artifact to a configured remote repository.

```bash
mvn deploy
```

Flow:

```text
Project
   |
   v
 Build
   |
   v
Artifact
   |
   v
Remote Repository
```

A remote repository can be Nexus or Artifactory.

---

## 8. Maven Lifecycle Flow

A simplified lifecycle is:

```text
validate
   |
   v
compile
   |
   v
test
   |
   v
package
   |
   v
verify
   |
   v
install
   |
   v
deploy
```

For example:

```bash
mvn deploy
```

Maven executes the required preceding phases before reaching `deploy`.

---

## 9. Clean Lifecycle

Maven also provides a separate **clean lifecycle**.

The common command is:

```bash
mvn clean
```

It removes generated build output.

Typically, the following directory is removed:

```text
target/
```

Example:

```text
Before:

project/
└── target/
    ├── classes/
    └── test-classes/

mvn clean

After:

project/
└── target/
```

---

## 10. `mvn clean package`

A very common command is:

```bash
mvn clean package
```

Conceptually:

```text
clean
  |
  v
validate
  |
  v
compile
  |
  v
test
  |
  v
package
```

The result may be:

```text
target/myapp-1.0.0.jar
```

---

## 11. `mvn clean install`

Another common command is:

```bash
mvn clean install
```

Conceptually:

```text
clean
  |
  v
compile
  |
  v
test
  |
  v
package
  |
  v
verify
  |
  v
install
  |
  v
Local Repository
```

The generated artifact is installed into the local Maven repository.

---

## 12. `mvn clean deploy`

For publishing an artifact to a configured remote repository:

```bash
mvn clean deploy
```

Conceptually:

```text
clean
  |
  v
compile
  |
  v
test
  |
  v
package
  |
  v
verify
  |
  v
install
  |
  v
deploy
  |
  v
Remote Repository
```

---

## 13. Maven Dependency Management

Maven manages project dependencies.

Example:

```xml
<dependency>
    <groupId>org.example</groupId>
    <artifactId>example-library</artifactId>
    <version>1.2.0</version>
</dependency>
```

Instead of manually downloading the library, Maven resolves the dependency based on the project's configuration.

---

## 14. Dependency Resolution

A simplified dependency-resolution flow is:

```text
pom.xml
   |
   v
Dependency
   |
   v
Maven Repository
   |
   v
Download Dependency
   |
   v
Build
```

Dependencies can come from configured repositories.

---

## 15. Local Maven Repository

Maven maintains a local repository on the developer or CI machine.

A common location is:

```text
~/.m2/repository
```

It can contain:

- Downloaded dependencies
- Previously installed artifacts
- Repository metadata

Example:

```text
~/.m2/
└── repository/
    └── com/
        └── example/
            └── library/
```

The local repository acts as a cache and also stores artifacts installed using:

```bash
mvn install
```

---

## 16. Remote Maven Repository

A remote repository stores and provides Maven artifacts.

Examples include:

- Maven Central
- Nexus
- Artifactory

Conceptually:

```text
                 Maven
                   |
        +----------+----------+
        |                     |
        v                     v
 Download Dependencies    Publish Artifacts
        |                     |
        +----------+----------+
                   |
                   v
            Remote Repository
```

---

## 17. Maven Plugins

Maven uses plugins to perform many build-related operations.

Plugins can provide functionality for:

- Compilation
- Testing
- Packaging
- Code analysis
- Documentation
- Deployment

A plugin can be configured in `pom.xml`.

Example:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.example</groupId>
            <artifactId>example-plugin</artifactId>
            <version>1.0.0</version>
        </plugin>
    </plugins>
</build>
```

---

## 18. Maven Goals

A **goal** represents a specific task provided by a Maven plugin.

A Maven plugin goal can be invoked using:

```text
plugin:goal
```

For example:

```bash
mvn compiler:compile
```

Here:

```text
compiler
   |
   v
Plugin

compile
   |
   v
Goal
```

---

## 19. Lifecycle Phase vs Plugin Goal

These two concepts should not be confused.

### Lifecycle Phase

A predefined step in a Maven lifecycle.

Examples:

```text
compile
test
package
verify
```

### Plugin Goal

A specific task provided by a plugin.

Example:

```text
compiler:compile
```

Conceptually:

```text
Maven Lifecycle
      |
      v
   compile
      |
      v
Plugin Goal
      |
      v
compiler:compile
```

---

## 20. Maven Dependency Scopes

Maven dependencies can have different scopes.

Common scopes include:

```text
compile
provided
runtime
test
```

### Compile

Available during compilation and normally available at runtime.

### Provided

Expected to be supplied by the runtime environment.

### Runtime

Required at runtime but not necessarily during compilation.

### Test

Required only during testing.

Example:

```xml
<scope>test</scope>
```

---

## 21. Dependency Tree

Maven can display the project's dependency tree.

Command:

```bash
mvn dependency:tree
```

Example:

```text
myapp
 |
 +-- library-A
 |     |
 |     +-- library-B
 |
 +-- library-C
```

This is useful for troubleshooting dependency conflicts.

---

## 22. Dependency Conflicts

A project can indirectly depend on different versions of the same library.

Example:

```text
Application
   |
   +---- Library A
   |       |
   |       +---- common-lib 1.0
   |
   +---- Library B
           |
           +---- common-lib 2.0
```

When this occurs, Maven's dependency-resolution mechanism determines which version is selected.

The dependency tree can help identify where the dependency came from.

```bash
mvn dependency:tree
```

---

## 23. Maven Profiles

Maven profiles allow different build configurations to be activated under different conditions.

Example:

```xml
<profiles>

    <profile>
        <id>dev</id>
    </profile>

    <profile>
        <id>prod</id>
    </profile>

</profiles>
```

A profile can be activated using:

```bash
mvn package -Pdev
```

or:

```bash
mvn package -Pprod
```

Profiles should be used carefully so that environment-specific configuration does not unnecessarily become part of the application artifact.

---

## 24. Maven Properties

Properties can centralize configuration values in `pom.xml`.

Example:

```xml
<properties>
    <java.version>17</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
```

Properties can then be referenced elsewhere in the POM.

Detailed POM configuration belongs in:

```text
pom-xml.md
```

---

## 25. Maven Wrapper

The **Maven Wrapper** allows a project to use a defined Maven version without requiring developers or CI runners to install that version globally.

Typical files are:

```text
mvnw
mvnw.cmd
.mvn/
```

Linux/macOS:

```bash
./mvnw clean package
```

Windows:

```cmd
mvnw.cmd clean package
```

This can improve build consistency between developer machines and CI environments.

---

## 26. Maven in CI/CD

Maven is commonly used as part of a CI pipeline.

Example:

```text
Git Push
    |
    v
CI Runner
    |
    v
Maven
    |
    +---- Compile
    +---- Test
    +---- Verify
    +---- Package
    |
    v
Artifact
```

A more complete pipeline can be:

```text
GitHub
   |
   v
CI Pipeline
   |
   v
mvn clean verify
   |
   v
Code Quality
   |
   v
Security Scan
   |
   v
mvn package
   |
   v
Artifact
   |
   v
Nexus / Artifactory
```

---

## 27. Maven and Java Version

A Maven project may require a particular Java version.

For example:

```text
Project
   |
   +---- Maven
   |
   +---- Java 17
```

If the CI runner uses an incompatible Java version, the build may fail.

Therefore, the Java version used by the developer and CI environment should be compatible with the project requirements.

---

## 28. Maven and Artifact Versioning

A Maven project normally defines its artifact version in `pom.xml`.

Example:

```xml
<version>1.2.0</version>
```

This may produce:

```text
myapp-1.2.0.jar
```

Artifact and version-management concepts are covered separately in:

```text
artifact-version-management.md
```

---

## 29. Maven and Nexus / Artifactory

Maven can perform two important repository operations.

### Download dependencies

```text
Maven
  |
  v
Nexus / Artifactory
  |
  v
Dependency
```

### Publish artifacts

```text
Maven
  |
  v
Artifact
  |
  v
Nexus / Artifactory
```

Detailed repository concepts belong in:

```text
nexus-artifactory.md
```

---

## 30. Maven in the Complete CI/CD Flow

Maven can participate in several CI/CD stages:

```text
Git
 |
 v
CI
 |
 v
Maven
 |
 +---- Compile
 +---- Test
 +---- Verify
 +---- Package
 |
 v
Artifact
 |
 v
Nexus / Artifactory
 |
 v
CD
 |
 v
Deploy
```

---

## 31. Maven Troubleshooting

### Dependency Resolution Failure

Possible causes:

- Incorrect dependency coordinates
- Repository unavailable
- Network problem
- Authentication problem
- Artifact not available

### Compilation Failure

Possible causes:

- Source-code errors
- Incorrect Java version
- Missing dependency
- Plugin configuration problem

### Test Failure

Possible causes:

- Application defect
- Incorrect test configuration
- Environment issue
- Dependency incompatibility

### Plugin Failure

Possible causes:

- Incorrect plugin configuration
- Incompatible plugin version
- Repository problem
- Missing plugin

### Dependency Conflict

Useful command:

```bash
mvn dependency:tree
```

---

## 32. Important Maven Commands

| Command | Purpose |
|---|---|
| `mvn clean` | Remove generated build output |
| `mvn validate` | Validate the project |
| `mvn compile` | Compile source code |
| `mvn test` | Run tests |
| `mvn package` | Create the application package |
| `mvn verify` | Run verification checks |
| `mvn install` | Install artifact into local repository |
| `mvn deploy` | Publish artifact to remote repository |
| `mvn dependency:tree` | Display dependency tree |

---

# 33. Interview Questions

## What is Maven?

Maven is a build automation and dependency-management tool commonly used for Java applications.

## What is `pom.xml`?

`pom.xml` is the Maven Project Object Model file that defines project configuration, dependencies, plugins and other build information.

## What are the important Maven lifecycle phases?

Common phases include:

```text
validate
compile
test
package
verify
install
deploy
```

## What happens when you execute `mvn package`?

Maven executes the required lifecycle phases up to `package` and creates the project's packaged artifact.

## What is the difference between `package` and `install`?

`package` creates the packaged artifact.

`install` executes the required preceding phases and installs the artifact into the local Maven repository.

```text
package
   |
   v
Artifact
   |
   v
install
   |
   v
Local Repository
```

## What is the difference between `install` and `deploy`?

`install` puts the artifact in the local Maven repository.

`deploy` publishes the artifact to a configured remote repository.

```text
Artifact
   |
   +---- install → Local Repository
   |
   +---- deploy  → Remote Repository
```

## What is Maven's local repository?

It is the local repository used by Maven to store downloaded dependencies and locally installed artifacts.

A common location is:

```text
~/.m2/repository
```

## What is a Maven dependency?

A dependency is an external library or component required by the project.

## What is a Maven plugin?

A Maven plugin provides goals that perform specific build-related tasks.

## What is the difference between a lifecycle phase and a plugin goal?

A lifecycle phase is a predefined step in a Maven lifecycle.

A plugin goal is a specific task provided by a plugin.

Example:

```text
Lifecycle phase:
compile

Plugin goal:
compiler:compile
```

## What does `mvn clean package` do?

It removes previous build output and then executes the lifecycle required to package the application.

## What does `mvn clean install` do?

It cleans the previous build, executes the required lifecycle through `install`, and installs the resulting artifact into the local Maven repository.

## What does `mvn clean deploy` do?

It cleans the previous build, executes the required lifecycle through `deploy`, and publishes the resulting artifact to the configured remote repository.

## How do you troubleshoot a dependency conflict?

A useful first step is:

```bash
mvn dependency:tree
```

This displays the dependency hierarchy and helps identify where conflicting dependencies originate.

---

# 34. Key Takeaway

Maven provides a standardized way to build and manage Java applications.

The important concepts are:

```text
                    Maven
                      |
          +-----------+-----------+
          |                       |
          v                       v
    Build Lifecycle       Dependency Management
          |                       |
          v                       v
 compile/test/package       Dependencies
          |
          v
       Artifact
          |
          v
 Local / Remote Repository
```

A typical Maven CI/CD flow is:

```text
Git
 |
 v
Maven
 |
 +---- Compile
 +---- Test
 +---- Verify
 +---- Package
 |
 v
Artifact
 |
 v
Nexus / Artifactory
 |
 v
Deployment
```

The most important commands to remember are:

```bash
mvn clean
mvn compile
mvn test
mvn package
mvn verify
mvn install
mvn deploy
```

The key distinction is:

```text
package → creates the artifact

install  → puts the artifact in the local repository

deploy   → publishes the artifact to a remote repository
```
