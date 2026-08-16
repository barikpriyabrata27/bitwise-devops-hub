# CD (Continuous Deployment)

CD takes a released artifact and gets it running on a target. Each target
has its own small example repo:

| # | Destination | Doc | Repo |
| - | ----------- | --- | ---- |
| 1 | NAS (Windows) | [nas-windows.md](nas-windows.md) | [bitwise-devops-nasw](https://github.com/barikpriyabrata27/bitwise-devops-nasw) |
| 2 | NAS (Linux) | [nas-linux.md](nas-linux.md) | [bitwise-devops-nasl](https://github.com/barikpriyabrata27/bitwise-devops-nasl) |
| 3 | PCF (Pivotal/Tanzu Application Service) | [pcf.md](pcf.md) | [bitwise-devops-pcf](https://github.com/barikpriyabrata27/bitwise-devops-pcf) |
| 4 | Kubernetes | [kubernetes.md](kubernetes.md) | [bitwise-devops-kubernates](https://github.com/barikpriyabrata27/bitwise-devops-kubernates) |
| 5 | AWS | [aws.md](aws.md) | [bitwise-devops-aws](https://github.com/barikpriyabrata27/bitwise-devops-aws) |
| 6 | GCP | [gcp.md](gcp.md) | [bitwise-devops-gcp](https://github.com/barikpriyabrata27/bitwise-devops-gcp) |
| 7 | Cloud Run | [cloudrun.md](cloudrun.md) | [bitwise-devops-cloudrun](https://github.com/barikpriyabrata27/bitwise-devops-cloudrun) |

AWS and GCP both consume shared Terraform modules from
[bitwise-devops-terraform](https://github.com/barikpriyabrata27/bitwise-devops-terraform)
instead of duplicating infrastructure code.

Previous: [CI](../ci/README.md).
