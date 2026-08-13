#!/usr/bin/env bash
# Resumes a previously stopped kind cluster (see stop-cluster.sh).
set -euo pipefail

CLUSTER_NAME="docker-k8s-cicd"

echo "Starting kind cluster containers for '${CLUSTER_NAME}'..."
docker start "${CLUSTER_NAME}-control-plane" "${CLUSTER_NAME}-worker" "${CLUSTER_NAME}-worker2"

# Docker Desktop's own single-node cluster can silently become the active context
kubectl config use-context "kind-${CLUSTER_NAME}"

echo "Waiting for the API server to become ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=120s

echo "Pods:"
kubectl get pods -o wide -l app=python-app
