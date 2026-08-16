# Build

The build step compiles or packages source code. It looks different per
repo/source-control shape, so each type has its own example repo:

| Repo type | What it demonstrates | Repo |
| --------- | --------------------- | ---- |
| C# | `dotnet build`/`dotnet publish` style build for a small C# app | [bitwise-devops-csharp](https://github.com/barikpriyabrata27/bitwise-devops-csharp) |
| Python | Dependency install + package/build for a small Python app | [bitwise-devops-python](https://github.com/barikpriyabrata27/bitwise-devops-python) |
| Java | Maven/Gradle-style build for a small Java app | [bitwise-devops-java](https://github.com/barikpriyabrata27/bitwise-devops-java) |
| Version-control-only | No build/CI at all — plain source control, useful as a baseline contrast | [bitwise-devops-vcs](https://github.com/barikpriyabrata27/bitwise-devops-vcs) |
| Monorepo | Multiple projects/services building independently from one repo | [bitwise-devops-monorepo](https://github.com/barikpriyabrata27/bitwise-devops-monorepo) |

Each repo's own README and CI workflow show the exact build commands and
triggers for that language/shape.

Next: [Security](security.md).
