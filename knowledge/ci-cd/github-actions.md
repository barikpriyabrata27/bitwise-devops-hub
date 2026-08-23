# GitHub Actions

## 1. What is GitHub Actions?

GitHub Actions is GitHub's native automation and CI/CD platform.

It allows us to automate activities such as:

- Building applications
- Running unit tests
- Performing code-quality checks
- Running security scans
- Packaging applications
- Publishing artifacts
- Building Docker images
- Deploying applications
- Running infrastructure automation
- Running scheduled jobs

A simplified flow is:

```text
Developer
    |
    v
GitHub Repository
    |
    v
GitHub Actions
    |
    +---- Build
    +---- Test
    +---- Scan
    +---- Package
    +---- Publish
    +---- Deploy
