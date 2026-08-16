# CD: Kubernetes

Deploying a released container image to a Kubernetes cluster.

Demonstrated in: [bitwise-devops-kubernates](https://github.com/barikpriyabrata27/bitwise-devops-kubernates)

Shape: GitHub Actions builds the image and pushes it to GHCR (CI/Release),
then a CD workflow on a self-hosted runner pulls the image into a local
`kind` cluster and rolls out the Deployment. See that repo's README and
[docs/diagrams.md](https://github.com/barikpriyabrata27/bitwise-devops-kubernates/blob/main/docs/diagrams.md)
for the full architecture.

Back to [CD overview](README.md).
