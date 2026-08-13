#!/usr/bin/env bash
# Stops (docker stop) the kind cluster's containers to free CPU/RAM after testing.
# The cluster config, images, and deployed manifests are preserved; use
# start-cluster.sh to resume without recreating anything.
set -euo pipefail

CLUSTER_NAME="docker-k8s-cicd"

echo "Stopping kind cluster containers for '${CLUSTER_NAME}'..."
docker stop "${CLUSTER_NAME}-control-plane" "${CLUSTER_NAME}-worker" "${CLUSTER_NAME}-worker2"

echo "Done. Containers are stopped (not deleted). Run scripts/start-cluster.sh to resume."
