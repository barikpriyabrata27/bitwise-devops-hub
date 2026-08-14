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
- [Repository diagrams](docs/diagrams.md) – architecture, CI/CD, Kubernetes,
  runtime, image build, rollout, and cluster lifecycle diagrams.
- [Extra repository and operations guide](docs/README_Extra.md) – repository
  details, diagram explanations, Kubernetes options, and cluster patching.
- [Interactive Kubernetes and CI/CD interview lab](docs/interview.html) –
  100-question practice and timed interview quiz with rotating attempts.

### Opening the interview lab

To make the quiz available to visitors, enable GitHub Pages in the repository:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and the `/docs` folder, then select **Save**.
4. Open `https://barikpriyabrata27.github.io/docker-k8s-cicd/interview.html`.

The quiz loads its question bank from JSON, so it must be opened through GitHub
Pages or another web server. Clicking the HTML file in the normal GitHub source
browser will show the file instead of running the quiz.

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

## Pausing/resuming the cluster (save resources between test sessions)

The kind cluster nodes are just Docker containers. When you're done testing:

```bash
bash scripts/stop-cluster.sh   # docker stop the 3 node containers
bash scripts/start-cluster.sh  # docker start them, wait for Ready, show pods
```

This preserves the cluster, deployed manifests, and loaded images — no
need to recreate anything. Full teardown (`kind delete cluster --name
docker-k8s-cicd`) is only needed if you want to remove it entirely.

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
