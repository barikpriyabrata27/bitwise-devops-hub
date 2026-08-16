# Security

Security scanning runs after a successful build, before anything is packaged
or released. Typical checks demonstrated across the linked repos:

- **Dependency scanning** – flag known-vulnerable packages/libraries (e.g.
  `dotnet list package --vulnerable`, `pip-audit`, `npm audit`,
  Maven/Gradle dependency-check equivalents).
- **Static code analysis** – linting and static analysis for the language in
  question.
- **Container/IaC scanning** – for repos that ship a container or Terraform
  (e.g. [bitwise-devops-kubernates](https://github.com/barikpriyabrata27/bitwise-devops-kubernates),
  [bitwise-devops-terraform](https://github.com/barikpriyabrata27/bitwise-devops-terraform)),
  tools like Checkov/Trivy scan the Dockerfile/Terraform before deploy.

Security failures should block the pipeline before Zipping/Release, the same
way a failed build does.

Previous: [Build](build.md). Next: [Zipping](zipping.md).
