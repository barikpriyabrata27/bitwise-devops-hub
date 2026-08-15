#!/usr/bin/env bash
# Verifies the app through its Kubernetes Service without requiring a public endpoint.
set -euo pipefail

SERVICE_NAME="${1:-python-app}"
LOCAL_PORT="${SMOKE_TEST_PORT:-5001}"

cleanup() {
  if [[ -n "${PORT_FORWARD_PID:-}" ]]; then
    kill "${PORT_FORWARD_PID}" 2>/dev/null || true
    wait "${PORT_FORWARD_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

kubectl rollout status "deployment/${SERVICE_NAME}" --timeout=120s
kubectl port-forward "service/${SERVICE_NAME}" "${LOCAL_PORT}:5000" >/tmp/${SERVICE_NAME}-port-forward.log 2>&1 &
PORT_FORWARD_PID=$!

for attempt in {1..20}; do
  if curl --fail --silent --show-error "http://127.0.0.1:${LOCAL_PORT}/healthz" | grep -q '"status":"ok"'; then
    break
  fi
  if [[ "${attempt}" == "20" ]]; then
    cat "/tmp/${SERVICE_NAME}-port-forward.log" >&2 || true
    exit 1
  fi
  sleep 1
done

curl --fail --silent --show-error "http://127.0.0.1:${LOCAL_PORT}/" | grep -q '"message":"Hello from docker-k8s-cicd!"'
curl --fail --silent --show-error "http://127.0.0.1:${LOCAL_PORT}/metrics" | grep -q '^http_requests_total '
echo "Smoke test passed for service/${SERVICE_NAME}."