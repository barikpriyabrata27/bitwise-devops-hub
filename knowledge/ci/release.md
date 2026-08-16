# Release

Release publishes the artifact produced by Zipping somewhere consumable by
CD:

- **Container registry** (e.g. GHCR) for container-based deployments —
  see [bitwise-devops-kubernates](https://github.com/barikpriyabrata27/bitwise-devops-kubernates).
- **Package feed** (NuGet/PyPI/Maven-style feed) for library-style repos.
- **GitHub Release / artifact storage** for zipped app packages consumed by
  NAS/PCF-style deployments.

A release should be immutable and traceable back to the exact commit/build
that produced it (tag, version number, or digest).

See [bitwise-devops-csharp](https://github.com/barikpriyabrata27/bitwise-devops-csharp)'s
`release` job for a concrete example: it attaches the zipped artifact to a
GitHub Release tagged with the build version.

Previous: [Zipping](zipping.md). Next: [CD](../cd/README.md).
