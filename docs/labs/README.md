# Hands-On DevOps Labs

The interview quiz in [../interview.html](../interview.html) is paired with the runnable exercises below. Run the commands from the repository root.

## 1. Application validation

```bash
pip install -r app/requirements.txt
python -m pytest app/test_app.py
python app/app.py
```

In a second terminal, verify `http://127.0.0.1:5000/healthz` and `http://127.0.0.1:5000/metrics`.

Related topics: CI/CD, observability, health probes, and container testing.

## 2. Container build

```bash
docker build -t docker-k8s-cicd:local .
docker run --rm -p 5000:5000 docker-k8s-cicd:local
```

The image runs as a non-root user. Inspect the response and metrics endpoint before stopping it.

Related topics: Dockerfiles, non-root containers, image validation, and artifact versioning.

## 3. Helm rendering

```bash
helm lint helm/docker-k8s-cicd
helm template docker-k8s-cicd helm/docker-k8s-cicd --values helm/docker-k8s-cicd/values-kind.yaml
```

Compare the output with [../../k8s](../../k8s). Change `replicaCount`, resource limits, or the NetworkPolicy setting and render again.

Related topics: Helm charts, values, Services, resource controls, readiness/liveness probes, and NetworkPolicy.

## 4. Local Kubernetes deployment

```bash
./scripts/setup-kind-cluster.sh
./scripts/smoke-test.sh
```

The setup script creates Kind workers, loads the local image, deploys the application, and verifies the health, root, and metrics endpoints through the Service.

Related topics: Kind, deployments, topology spread, Services, rollouts, and smoke testing.

## 5. Controlled troubleshooting

Change the `/healthz` path in a local copy of [../../k8s/deployment.yaml](../../k8s/deployment.yaml), apply it, and inspect the resulting Pods and events:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl get pods
kubectl describe pod -l app=python-app
kubectl get events --sort-by=.lastTimestamp
```

Restore the correct health check, apply the manifest, and use `kubectl rollout status deployment/python-app` to confirm recovery.