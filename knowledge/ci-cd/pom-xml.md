# pom.xml

## 1. What is pom.xml?

`pom.xml` stands for **Project Object Model**.

It is the central configuration file of a Maven project.

The POM tells Maven:

- What the project is
- Which dependencies it needs
- Which version of the application is being built
- Which plugins should be used
- How the application should be built
- Which repositories should be used
- Which profiles are available
- How the project inherits configuration

A simplified relationship is:

```text
                pom.xml
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
  Dependencies   Plugins    Properties
       |           |           |
       +-----------+-----------+
                   |
                   v
                 Maven
                   |
                   v
             Build Artifact
```

---

# 2. Basic pom.xml Structure

A simple Maven POM can look like:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>myapp</artifactId>
    <version>1.0.0</version>

</project>
```

The important sections are:

```text
project
 |
 +-- modelVersion
 |
 +-- groupId
 |
 +-- artifactId
 |
 +-- version
 |
 +-- packaging
 |
 +-- properties
 |
 +-- dependencies
 |
 +-- dependencyManagement
 |
 +-- build
 |
 +-- profiles
 |
 +-- repositories
 |
 +-- parent
```

Not every POM needs every section.

---

# 3. `modelVersion`

Example:

```xml
<modelVersion>4.0.0</modelVersion>
```

This specifies the version of the Maven POM model being used.

For standard Maven projects, this is normally:

```text
4.0.0
```

---

# 4. `groupId`

Example:

```xml
<groupId>com.example</groupId>
```

`groupId` identifies the organization, company, team, or logical group responsible for the project.

For example:

```text
com.company
com.company.payment
org.example
```

A common convention is to use a reverse-domain-style name.

Example:

```text
com.example
```

---

# 5. `artifactId`

Example:

```xml
<artifactId>payment-service</artifactId>
```

`artifactId` identifies the specific application, library, or module.

For example:

```text
payment-service
customer-service
order-service
common-library
```

Together with the `groupId` and `version`, it identifies the Maven artifact.

---

# 6. `version`

Example:

```xml
<version>1.0.0</version>
```

The version identifies the particular release of the artifact.

For example:

```text
1.0.0
1.1.0
2.0.0
```

Maven also supports development versions such as:

```text
1.0.0-SNAPSHOT
```

The difference between SNAPSHOT and release versions is important for artifact management.

---

# 7. Maven Coordinates

The main Maven coordinates are:

```text
groupId
artifactId
version
```

Example:

```xml
<groupId>com.example</groupId>
<artifactId>payment-service</artifactId>
<version>1.2.0</version>
```

Conceptually:

```text
com.example : payment-service : 1.2.0
```

The coordinates are used to identify the artifact in Maven repositories.

---

# 8. Packaging

The `packaging` element specifies the type of artifact produced by the project.

Example:

```xml
<packaging>jar</packaging>
```

Common packaging types include:

```text
jar
war
pom
ear
```

### JAR

Commonly used for Java applications and libraries.

```xml
<packaging>jar</packaging>
```

### WAR

Commonly used for web applications deployed to a servlet container.

```xml
<packaging>war</packaging>
```

### POM

Used for projects that primarily contain Maven configuration, such as parent or aggregator projects.

```xml
<packaging>pom</packaging>
```

If packaging is not explicitly specified, Maven normally uses:

```text
jar
```

---

# 9. Complete Basic POM

Example:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>payment-service</artifactId>
    <version>1.0.0</version>

    <packaging>jar</packaging>

</project>
```

---

# 10. Properties

Properties allow values to be defined centrally in the POM.

Example:

```xml
<properties>
    <java.version>17</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
```

A property can then be referenced using:

```text
${property.name}
```

Example:

```xml
<properties>
    <java.version>17</java.version>
</properties>

<someConfiguration>
    ${java.version}
</someConfiguration>
```

Properties are useful for avoiding repeated values.

---

# 11. Java Version Configuration

A project may define the Java version using properties.

Example:

```xml
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
</properties>
```

Another commonly used configuration is:

```xml
<properties>
    <maven.compiler.release>17</maven.compiler.release>
</properties>
```

The exact configuration depends on the Maven compiler plugin and project requirements.

---

# 12. Dependencies

Dependencies define external libraries required by the application.

Example:

```xml
<dependencies>

    <dependency>
        <groupId>org.example</groupId>
        <artifactId>example-library</artifactId>
        <version>1.2.0</version>
    </dependency>

</dependencies>
```

Conceptually:

```text
Application
    |
    +---- Dependency A
    |
    +---- Dependency B
    |
    +---- Dependency C
```

Maven resolves these dependencies from configured repositories.

---

# 13. Dependency Coordinates

A dependency normally contains:

```text
groupId
artifactId
version
```

Example:

```xml
<dependency>
    <groupId>org.example</groupId>
    <artifactId>example-library</artifactId>
    <version>1.2.0</version>
</dependency>
```

These coordinates tell Maven exactly which artifact should be used.

---

# 14. Dependency Scope

Dependencies can have different scopes.

Example:

```xml
<dependency>
    <groupId>org.example</groupId>
    <artifactId>example-library</artifactId>
    <version>1.2.0</version>
    <scope>test</scope>
</dependency>
```

Common scopes include:

```text
compile
provided
runtime
test
```

---

## 14.1 Compile Scope

The default dependency scope is generally:

```text
compile
```

Example:

```xml
<scope>compile</scope>
```

The dependency is available during compilation and normally available at runtime.

---

## 14.2 Provided Scope

Example:

```xml
<scope>provided</scope>
```

This indicates that the runtime environment is expected to provide the dependency.

A common example is an API supplied by an application server.

---

## 14.3 Runtime Scope

Example:

```xml
<scope>runtime</scope>
```

The dependency is required at runtime but is not necessarily required to compile the application.

---

## 14.4 Test Scope

Example:

```xml
<scope>test</scope>
```

The dependency is available only during testing.

Typical examples include test frameworks.

---

# 15. Optional Dependencies

A dependency can be marked as optional.

Example:

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>optional-library</artifactId>
    <version>1.0.0</version>
    <optional>true</optional>
</dependency>
```

Optional dependencies are not automatically propagated to projects that depend on the current project.

---

# 16. Excluding a Transitive Dependency

Sometimes a dependency brings another dependency that the application does not want.

Example:

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>library-a</artifactId>
    <version>1.0.0</version>

    <exclusions>
        <exclusion>
            <groupId>org.example</groupId>
            <artifactId>library-b</artifactId>
        </exclusion>
    </exclusions>

</dependency>
```

This can be useful when resolving dependency conflicts or avoiding unwanted transitive dependencies.

---

# 17. Transitive Dependencies

A dependency can itself depend on other libraries.

Example:

```text
Application
    |
    v
Library A
    |
    v
Library B
    |
    v
Library C
```

If the application declares Library A, Maven can resolve the required transitive dependencies according to Maven's dependency-resolution rules.

The dependency tree can be inspected using:

```bash
mvn dependency:tree
```

---

# 18. Dependency Management

`dependencyManagement` is used to centrally manage dependency versions and configuration.

Example:

```xml
<dependencyManagement>

    <dependencies>

        <dependency>
            <groupId>org.example</groupId>
            <artifactId>common-library</artifactId>
            <version>2.0.0</version>
        </dependency>

    </dependencies>

</dependencyManagement>
```

A dependency can then be declared without repeating the version:

```xml
<dependency>
    <groupId>org.example</groupId>
    <artifactId>common-library</artifactId>
</dependency>
```

---

# 19. `dependencies` vs `dependencyManagement`

This is an important interview topic.

### `dependencies`

Actually declares dependencies required by the project.

Example:

```xml
<dependencies>

    <dependency>
        <groupId>org.example</groupId>
        <artifactId>common-library</artifactId>
        <version>2.0.0</version>
    </dependency>

</dependencies>
```

### `dependencyManagement`

Primarily manages dependency versions and configuration.

Example:

```xml
<dependencyManagement>

    <dependencies>

        <dependency>
            <groupId>org.example</groupId>
            <artifactId>common-library</artifactId>
            <version>2.0.0</version>
        </dependency>

    </dependencies>

</dependencyManagement>
```

A project still needs to declare the dependency under `dependencies` to actually use it.

---

# 20. Build Section

The `build` section controls build-related configuration.

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

The `build` section can contain:

- Plugins
- Plugin configuration
- Resources
- Final artifact name
- Build directories
- Plugin management

---

# 21. Maven Plugins in POM

Plugins provide build functionality.

Example:

```xml
<build>
    <plugins>

        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.13.0</version>
        </plugin>

    </plugins>
</build>
```

Plugins can perform tasks such as:

- Compilation
- Testing
- Packaging
- Code generation
- Code analysis
- Deployment

---

# 22. Plugin Configuration

Plugins can be configured using the `configuration` element.

Example:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.13.0</version>

    <configuration>
        <release>17</release>
    </configuration>

</plugin>
```

The configuration controls how the plugin behaves.

---

# 23. Plugin Executions

A plugin can be explicitly associated with lifecycle phases using executions.

Example:

```xml
<plugin>
    <groupId>org.example</groupId>
    <artifactId>example-plugin</artifactId>
    <version>1.0.0</version>

    <executions>

        <execution>
            <id>example-execution</id>

            <phase>verify</phase>

            <goals>
                <goal>check</goal>
            </goals>

        </execution>

    </executions>

</plugin>
```

Conceptually:

```text
Lifecycle Phase
      |
      v
   verify
      |
      v
Plugin Execution
      |
      v
     Goal
```

---

# 24. `pluginManagement`

`pluginManagement` is used to centrally define plugin configuration and versions.

Example:

```xml
<build>

    <pluginManagement>

        <plugins>

            <plugin>
                <groupId>org.example</groupId>
                <artifactId>example-plugin</artifactId>
                <version>1.0.0</version>
            </plugin>

        </plugins>

    </pluginManagement>

</build>
```

A plugin placed only inside `pluginManagement` is not necessarily executed.

It primarily provides configuration that can be inherited or referenced by child projects.

---

# 25. `pluginManagement` vs `plugins`

This is an important interview topic.

### `plugins`

Declares plugins that participate in the build.

```xml
<build>
    <plugins>
        ...
    </plugins>
</build>
```

### `pluginManagement`

Defines default plugin versions and configuration that can be reused.

```xml
<build>
    <pluginManagement>
        <plugins>
            ...
        </plugins>
    </pluginManagement>
</build>
```

Simple way to remember:

```text
plugins
    ↓
Use the plugin

pluginManagement
    ↓
Manage how the plugin should be configured
```

---

# 26. Repositories

A POM can define repositories from which Maven can retrieve artifacts.

Example:

```xml
<repositories>

    <repository>

        <id>company-repository</id>

        <url>
            https://repo.example.com/maven
        </url>

    </repository>

</repositories>
```

Repositories can provide dependencies and other Maven artifacts.

In enterprise environments, repositories are often managed using tools such as:

- Nexus
- Artifactory

---

# 27. Distribution Management

`distributionManagement` is commonly used to define where artifacts are published.

Example:

```xml
<distributionManagement>

    <repository>

        <id>releases</id>

        <url>
            https://repo.example.com/releases
        </url>

    </repository>

    <snapshotRepository>

        <id>snapshots</id>

        <url>
            https://repo.example.com/snapshots
        </url>

    </snapshotRepository>

</distributionManagement>
```

This is particularly relevant when using:

```bash
mvn deploy
```

---

# 28. Snapshot Repository vs Release Repository

Organizations commonly separate:

```text
Release Repository
Snapshot Repository
```

Example:

```text
Releases
    |
    +---- 1.0.0
    +---- 1.1.0
    +---- 2.0.0

Snapshots
    |
    +---- 1.0.0-SNAPSHOT
    +---- 1.1.0-SNAPSHOT
```

A release represents a stable version.

A SNAPSHOT represents a development version.

---

# 29. SNAPSHOT Version

Example:

```xml
<version>1.0.0-SNAPSHOT</version>
```

SNAPSHOT versions indicate that the artifact is still under development.

A SNAPSHOT may be updated over time.

For example:

```text
1.0.0-SNAPSHOT
```

can represent successive development builds.

---

# 30. Release Version

Example:

```xml
<version>1.0.0</version>
```

A release version normally represents a fixed version intended for consumption.

Once released, the artifact should generally be treated as immutable.

Conceptually:

```text
Development
    |
    v
1.0.0-SNAPSHOT
    |
    v
Release
    |
    v
1.0.0
```

---

# 31. Parent POM

A project can inherit configuration from a parent POM.

Example:

```xml
<parent>

    <groupId>com.example</groupId>

    <artifactId>company-parent</artifactId>

    <version>1.0.0</version>

</parent>
```

A parent POM can provide common configuration such as:

- Dependency versions
- Plugin versions
- Properties
- Build configuration
- Repository configuration

---

# 32. POM Inheritance

A child POM can inherit configuration from a parent.

Conceptually:

```text
Parent POM
    |
    +---- Common Properties
    +---- Dependency Management
    +---- Plugin Management
    +---- Build Configuration
    |
    v
Child POM
```

This helps avoid repeating common configuration across projects.

---

# 33. Parent POM vs Dependency Management

A parent POM provides inheritance.

`dependencyManagement` provides centralized dependency configuration.

Example:

```text
Parent POM
    |
    +---- Properties
    +---- Plugin Management
    +---- Dependency Management
    |
    v
Child Projects
```

A parent POM may itself contain a `dependencyManagement` section.

---

# 34. Multi-Module Maven Project

Maven can manage multiple modules from a parent project.

Example:

```text
company-application/
│
├── pom.xml
│
├── payment-service/
│   └── pom.xml
│
├── customer-service/
│   └── pom.xml
│
└── common-library/
    └── pom.xml
```

The parent POM can define:

```xml
<packaging>pom</packaging>

<modules>

    <module>payment-service</module>
    <module>customer-service</module>
    <module>common-library</module>

</modules>
```

---

# 35. Maven Aggregator

A POM that lists modules using the `modules` section can act as an aggregator.

Example:

```xml
<packaging>pom</packaging>

<modules>
    <module>payment-service</module>
    <module>customer-service</module>
</modules>
```

Maven can then build the modules as part of the reactor build.

---

# 36. Multi-Module Build

A multi-module project can be built from the parent directory.

Example:

```bash
mvn clean install
```

Conceptually:

```text
Parent POM
    |
    +---- Module A
    |
    +---- Module B
    |
    +---- Module C
```

Maven determines the module build order based on dependencies between modules.

---

# 37. POM Packaging for Parent Projects

Parent or aggregator projects commonly use:

```xml
<packaging>pom</packaging>
```

Example:

```xml
<project>

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>company-application</artifactId>
    <version>1.0.0</version>

    <packaging>pom</packaging>

    <modules>
        <module>service-a</module>
        <module>service-b</module>
    </modules>

</project>
```

---

# 38. Final Name

Maven can customize the generated artifact name using:

```xml
<build>

    <finalName>payment-service</finalName>

</build>
```

For example, the generated artifact may be:

```text
payment-service.jar
```

instead of using the default artifact naming convention.

---

# 39. Resources

Resources can be configured in the POM.

Example:

```xml
<build>

    <resources>

        <resource>
            <directory>src/main/resources</directory>
        </resource>

    </resources>

</build>
```

Resources are typically copied into the build output during the appropriate lifecycle phase.

---

# 40. Profiles

Profiles allow different configurations to be activated.

Example:

```xml
<profiles>

    <profile>

        <id>dev</id>

        <properties>
            <environment>development</environment>
        </properties>

    </profile>

    <profile>

        <id>prod</id>

        <properties>
            <environment>production</environment>
        </properties>

    </profile>

</profiles>
```

Activate a profile:

```bash
mvn package -Pdev
```

or:

```bash
mvn package -Pprod
```

---

# 41. Profile Activation

Profiles can be activated in different ways.

For example:

```text
Explicit activation
Property activation
JDK activation
Operating-system activation
File-based activation
```

Explicit activation:

```bash
mvn package -Pdev
```

The exact activation mechanism should be chosen according to project requirements.

---

# 42. Effective POM

Maven combines configuration from:

- Super POM
- Parent POM
- Current POM
- Profiles
- Other inherited configuration

The resulting configuration is called the **effective POM**.

You can inspect it using:

```bash
mvn help:effective-pom
```

This is useful for troubleshooting unexpected Maven behavior.

---

# 43. Super POM

Maven provides a default configuration called the **Super POM**.

Projects inherit default Maven behavior from it.

Conceptually:

```text
Super POM
    |
    v
Parent POM
    |
    v
Project POM
```

The effective POM represents the combined configuration after inheritance and profile processing.

---

# 44. POM Inheritance Example

Parent:

```xml
<project>

    <groupId>com.example</groupId>
    <artifactId>company-parent</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>17</java.version>
    </properties>

</project>
```

Child:

```xml
<project>

    <parent>

        <groupId>com.example</groupId>
        <artifactId>company-parent</artifactId>
        <version>1.0.0</version>

    </parent>

    <artifactId>payment-service</artifactId>

</project>
```

The child can inherit properties and other applicable configuration from the parent.

---

# 45. Common POM Structure

A realistic POM may look like:

```xml
<project>

    <modelVersion>4.0.0</modelVersion>

    <parent>
        ...
    </parent>

    <groupId>com.example</groupId>
    <artifactId>payment-service</artifactId>
    <version>1.0.0</version>

    <packaging>jar</packaging>

    <properties>
        ...
    </properties>

    <dependencies>
        ...
    </dependencies>

    <dependencyManagement>
        ...
    </dependencyManagement>

    <build>
        <plugins>
            ...
        </plugins>
    </build>

    <repositories>
        ...
    </repositories>

    <profiles>
        ...
    </profiles>

</project>
```

---

# 46. POM and CI/CD

The POM is an important part of the CI pipeline.

Example:

```text
Developer
    |
    v
Git
    |
    v
Pull Request
    |
    v
CI Runner
    |
    v
pom.xml
    |
    v
Maven
    |
    +---- Dependencies
    +---- Compile
    +---- Test
    +---- Package
    |
    v
Artifact
```

The POM therefore controls a significant portion of how Maven builds the application.

---

# 47. POM and Artifact Repository

The POM defines the project's artifact coordinates.

Example:

```xml
<groupId>com.example</groupId>
<artifactId>payment-service</artifactId>
<version>1.2.0</version>
```

This can result in:

```text
payment-service-1.2.0.jar
```

The artifact can then be published to an artifact repository.

```text
pom.xml
   |
   v
Maven Build
   |
   v
Artifact
   |
   v
Nexus / Artifactory
```

---

# 48. POM and Security

The POM should be treated as part of the application's supply chain.

It may contain:

- External dependencies
- Plugin versions
- Repository configuration
- Build configuration

Security concerns include:

- Vulnerable dependencies
- Malicious or compromised dependencies
- Outdated plugins
- Untrusted repositories

Tools such as dependency scanners and Software Composition Analysis tools can analyze Maven dependencies.

---

# 49. Dependency Version Management

Avoid unnecessarily repeating dependency versions throughout multiple POM files.

For example, instead of:

```xml
<dependency>
    <groupId>org.example</groupId>
    <artifactId>library-a</artifactId>
    <version>1.2.0</version>
</dependency>

<dependency>
    <groupId>org.example</groupId>
    <artifactId>library-b</artifactId>
    <version>1.2.0</version>
</dependency>
```

Centralized management can be used:

```xml
<dependencyManagement>

    <dependencies>

        <dependency>
            <groupId>org.example</groupId>
            <artifactId>library-a</artifactId>
            <version>1.2.0</version>
        </dependency>

        <dependency>
            <groupId>org.example</groupId>
            <artifactId>library-b</artifactId>
            <version>1.2.0</version>
        </dependency>

    </dependencies>

</dependencyManagement>
```

---

# 50. Common POM Mistakes

### Hard-coding the same version repeatedly

This can make version updates difficult.

### Using outdated dependencies

Old dependencies may contain known vulnerabilities.

### Missing plugin versions

Depending on Maven defaults or inherited configuration can make builds less predictable.

### Incorrect repository configuration

An incorrect repository URL or credentials can cause dependency-resolution failures.

### Mixing environment configuration into the artifact

Environment-specific values should generally be supplied appropriately during deployment rather than requiring a new application build for every environment.

### Excessive use of profiles

Too many profiles can make the build difficult to understand and maintain.

---

# 51. Troubleshooting POM Problems

## Validate the POM

Run:

```bash
mvn validate
```

---

## View the Effective POM

Run:

```bash
mvn help:effective-pom
```

This helps identify inherited or overridden configuration.

---

## View Dependencies

Run:

```bash
mvn dependency:tree
```

---

## View Dependency Updates

Depending on the plugins used by the project, Maven can be configured to inspect dependency updates.

---

## Run Maven with Debug Logging

For troubleshooting:

```bash
mvn -X clean package
```

`-X` enables Maven debug output.

---

## Run Maven with Error Details

```bash
mvn -e clean package
```

`-e` displays execution error details.

---

# 52. Common Maven Commands Related to POM

```bash
mvn validate
mvn clean
mvn compile
mvn test
mvn package
mvn verify
mvn install
mvn deploy
mvn dependency:tree
mvn help:effective-pom
mvn -X clean package
mvn -e clean package
```

---

# 53. Interview Questions

## What is `pom.xml`?

`pom.xml` is Maven's Project Object Model file. It contains project metadata, dependencies, plugins, build configuration and other Maven configuration.

---

## What are the main Maven coordinates?

The main coordinates are:

```text
groupId
artifactId
version
```

---

## What is the difference between `dependencies` and `dependencyManagement`?

`dependencies` declares dependencies that the project actually uses.

`dependencyManagement` centrally manages dependency versions and configuration.

---

## What is the difference between `plugins` and `pluginManagement`?

`plugins` declares plugins that participate in the build.

`pluginManagement` centrally defines plugin versions and configuration that can be inherited or reused.

---

## What is a parent POM?

A parent POM provides configuration that can be inherited by child Maven projects.

---

## What is a multi-module Maven project?

It is a Maven project containing multiple modules managed from a parent or aggregator POM.

Example:

```text
Parent
 |
 +---- Service A
 |
 +---- Service B
 |
 +---- Common Library
```

---

## What is `dependencyManagement` used for?

It is commonly used to centrally manage dependency versions, particularly across multiple modules.

---

## What is the purpose of `packaging`?

It specifies the type of artifact produced by the Maven project.

Examples:

```text
jar
war
pom
ear
```

---

## What is a SNAPSHOT version?

A SNAPSHOT version represents a development version that can change before becoming a final release.

Example:

```text
1.0.0-SNAPSHOT
```

---

## What is the difference between SNAPSHOT and Release?

```text
SNAPSHOT
    |
    +---- Development version
    +---- Can change
    +---- Usually stored in snapshot repository


Release
    |
    +---- Stable version
    +---- Should be treated as immutable
    +---- Usually stored in release repository
```

---

## What is the effective POM?

The effective POM is the resulting Maven configuration after Maven combines inherited configuration, parent POM configuration, profiles and the current POM.

Command:

```bash
mvn help:effective-pom
```

---

## How do you troubleshoot a Maven dependency conflict?

First inspect the dependency tree:

```bash
mvn dependency:tree
```

Then identify which dependency is introducing the conflicting version.

---

## How do you troubleshoot an unexpected Maven configuration?

Use:

```bash
mvn help:effective-pom
```

This helps identify inherited configuration, plugin configuration and property values.

---

# 54. Key Takeaway

The `pom.xml` is the central configuration point of a Maven project.

A simplified view is:

```text
                       pom.xml
                          |
        +-----------------+-----------------+
        |                 |                 |
        v                 v                 v
    Project          Dependencies        Plugins
   Metadata              |                 |
        |                 |                 |
        +-----------------+-----------------+
                          |
                          v
                        Maven
                          |
                          v
                       Build
                          |
                          v
                       Artifact
                          |
                          v
                  Nexus / Artifactory
```

The most important POM concepts to remember are:

```text
groupId
artifactId
version
packaging
properties
dependencies
dependencyManagement
build
plugins
pluginManagement
parent
modules
profiles
repositories
distributionManagement
```

For interviews, remember these key distinctions:

```text
dependencies
    → Dependencies actually used by the project

dependencyManagement
    → Centralized dependency version/configuration management

plugins
    → Plugins used by the build

pluginManagement
    → Centralized plugin configuration/version management

parent
    → Inherited project configuration

modules
    → Multi-module project structure

repositories
    → Where Maven retrieves artifacts

distributionManagement
    → Where Maven publishes artifacts
```

The overall Maven relationship is:

```text
                    pom.xml
                       |
                       v
                     Maven
                       |
          +------------+------------+
          |            |            |
          v            v            v
      Compile       Test        Package
          |            |            |
          +------------+------------+
                       |
                       v
                    Artifact
                       |
                       v
                Nexus / Artifactory
                       |
                       v
                    Deploy
```
