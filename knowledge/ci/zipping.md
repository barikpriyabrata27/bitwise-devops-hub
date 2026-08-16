# Zipping

Once a build passes security checks, it's packaged into a single, versioned,
deployable artifact. What "zipping" means depends on the target:

- **Plain apps (C#, Python, Java)** – a zip/tarball of the published output,
  or a language-native package (NuGet, wheel, JAR).
- **Containers** – a Docker image is the artifact instead of a zip; see
  [bitwise-devops-kubernates](https://github.com/barikpriyabrata27/bitwise-devops-kubernates)
  for a build-and-push-to-GHCR example.
- **NAS/PCF deployments** – usually a plain zip/tarball of the app plus any
  deployment descriptor, copied or pushed to the target.

The goal is always the same: one immutable, versioned artifact that Release
can publish and CD can deploy without rebuilding.

See [bitwise-devops-csharp](https://github.com/barikpriyabrata27/bitwise-devops-csharp)'s
`zipping` job for a concrete example: `dotnet publish` followed by zipping the
output with a run-numbered version.

Previous: [Security](security.md). Next: [Release](release.md).
