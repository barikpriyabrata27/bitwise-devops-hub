#!/usr/bin/env bash
# Creates a local kind cluster: 1 control-plane + 2 worker nodes,
# labels the workers, and applies the k8s manifests.
set -euo pipefail

CLUSTER_NAME="docker-k8s-cicd"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Creating kind cluster '${CLUSTER_NAME}'..."
kind create cluster --config "${SCRIPT_DIR}/kind-config.yaml"

echo "Labeling worker nodes..."
for node in $(kubectl get nodes -o name | grep worker); do
  kubectl label "${node}" node-role.kubernetes.io/worker=true --overwrite
done

echo "Cluster nodes:"
kubectl get nodes -o wide

echo "Building and loading local image (first run, before CI/CD exists yet)..."
docker build -t ghcr.io/barikpriyabrata27/docker-k8s-cicd:latest "${SCRIPT_DIR}"
kind load docker-image ghcr.io/barikpriyabrata27/docker-k8s-cicd:latest --name "${CLUSTER_NAME}"

echo "Applying manifests..."
kubectl apply -f "${SCRIPT_DIR}/k8s/deployment.yaml"
kubectl apply -f "${SCRIPT_DIR}/k8s/service.yaml"

echo "Waiting for rollout..."
kubectl rollout status deployment/python-app

echo "Pods per node:"
kubectl get pods -o wide -l app=python-app

echo "Verifying application endpoints..."
"${SCRIPT_DIR}/scripts/smoke-test.sh"
