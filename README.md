# bitwise-devops-hub

Root/index repository for a set of small, focused example repositories used to
learn and demonstrate different CI approaches and deployment targets. Each
linked repository is self-contained (its own README, pipeline, and manifests)
so it can be studied or reused independently.

All linked repos below are private under the `barikpriyabrata27` GitHub
account.

## CI understanding examples

Small repos that each illustrate a different source-control/CI shape.

| # | Type | Repo |
| - | ---- | ---- |
| 1 | C# small repo | [bitwise-devops-csharp](https://github.com/barikpriyabrata27/bitwise-devops-csharp) |
| 2 | Python small repo | [bitwise-devops-python](https://github.com/barikpriyabrata27/bitwise-devops-python) |
| 3 | Java small repo | [bitwise-devops-java](https://github.com/barikpriyabrata27/bitwise-devops-java) |
| 4 | Version-control-only repo (no build/CI) | [bitwise-devops-vcs](https://github.com/barikpriyabrata27/bitwise-devops-vcs) |
| 5 | Monorepo example | [bitwise-devops-monorepo](https://github.com/barikpriyabrata27/bitwise-devops-monorepo) |

## Deployment examples

Small repos that each illustrate deploying an app to a different target.

| # | Target | Repo |
| - | ------ | ---- |
| 1 | NAS deployment (Windows) | [bitwise-devops-nasw](https://github.com/barikpriyabrata27/bitwise-devops-nasw) |
| 2 | NAS deployment (Linux) | [bitwise-devops-nasl](https://github.com/barikpriyabrata27/bitwise-devops-nasl) |
| 3 | PCF (Pivotal/Tanzu Application Service) deployment | [bitwise-devops-pcf](https://github.com/barikpriyabrata27/bitwise-devops-pcf) |
| 4 | Kubernetes deployment | [bitwise-devops-kubernates](https://github.com/barikpriyabrata27/bitwise-devops-kubernates) |
| 5 | AWS deployment | [bitwise-devops-aws](https://github.com/barikpriyabrata27/bitwise-devops-aws) |
| 6 | GCP deployment | [bitwise-devops-gcp](https://github.com/barikpriyabrata27/bitwise-devops-gcp) |
| 7 | Cloud Run deployment | [bitwise-devops-cloudrun](https://github.com/barikpriyabrata27/bitwise-devops-cloudrun) |

## Shared infrastructure

| Purpose | Repo |
| ------- | ---- |
| Terraform modules used across the deployment examples | [terraform_module](https://github.com/barikpriyabrata27/terraform_module) |

## Status

The Kubernetes deployment example (`bitwise-devops-kubernates`) already
contains a working Flask app + Docker + kind CI/CD pipeline, migrated from
this repository's previous history. The rest of the linked repos are freshly
created placeholders (`README.md` only) and still need their example
content, pipelines, and manifests filled in.
