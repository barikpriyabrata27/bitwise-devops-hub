# docker-k8s-cicd

A minimal Python app with a full CI/CD pipeline: GitHub Actions builds a Docker
image and pushes it to GitHub Container Registry (GHCR), and a local
Kubernetes cluster (1 control-plane + 2 worker nodes, kind-based) pulls and
runs it, spread as 2 pods per worker node.

## Components

- `app/` – Flask "hello world" service (`/` and `/healthz`).
- `Dockerfile` – container image build.
- `.github/workflows/ci.yml` – builds the image and pushes to
  `ghcr.io/barikpriyabrata27/docker-k8s-cicd` on every push to `main`.
- `.github/workflows/cd.yml` – runs on a **self-hosted runner** on this
  machine, pulls the latest image, loads it into the local kind cluster and
  rolls out the deployment.
- `kind-config.yaml` – defines a kind cluster with 1 control-plane + 2 worker
  nodes.
- `k8s/deployment.yaml` – 4 replicas, scheduled only on worker nodes and
  spread evenly (2 pods per worker) via `topologySpreadConstraints`.
- `k8s/service.yaml` – NodePort service exposing the app on port `30080`.
- `scripts/setup-kind-cluster.sh` – one-shot script to create the cluster,
  label the worker nodes, and do an initial deploy.

## One-time local setup

1. Install Docker Desktop and enable WSL2/Hyper-V backend.
2. Install `kind` and `kubectl`.
3. Run:
   ```bash
   bash scripts/setup-kind-cluster.sh
   ```
4. Visit `http://localhost:30080` (kind maps the NodePort via the
   control-plane's port mappings if configured, otherwise use
   `kubectl port-forward svc/python-app 5000:5000`).

## CI/CD flow

1. Push to `main` → **CI** builds the image and pushes
   `ghcr.io/barikpriyabrata27/docker-k8s-cicd:latest` (and a short-SHA tag) to
   GHCR.
2. **CD** (triggered after CI succeeds) runs on a self-hosted runner
   registered on this machine — GitHub-hosted runners cannot reach a local
   cluster. It pulls the new image, loads it into kind, and updates the
   Deployment.

## Registering a self-hosted runner

In your GitHub repo: **Settings → Actions → Runners → New self-hosted
runner**, then follow the generated commands to install and start the runner
service on this machine. The runner must have Docker, `kind`, and `kubectl`
on its `PATH` and access to the kind cluster's kubeconfig.
