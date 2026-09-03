# Docker, Kind, Kubernetes & PowerShell Environment Verification Commands

> A practical command reference for verifying and troubleshooting a
> Windows development environment using Docker Desktop, kind,
> Kubernetes, kubectl, PowerShell, and a GitHub Actions self-hosted
> runner.

------------------------------------------------------------------------

## 1. Environment Architecture

The environment used in this project can be understood as:

``` text
Windows / PowerShell
        |
        v
Docker Desktop / Docker Engine
        |
        v
       kind
        |
        v
Kubernetes Cluster
        |
        +-------------------------------+
        |                               |
        v                               v
Control Plane                       Worker Nodes
                                        |
                              +---------+---------+
                              |                   |
                              v                   v
                           worker              worker2
                              |
                              v
                         Kubernetes
                              |
                    +---------+---------+
                    |                   |
                    v                   v
                Deployment           Service
                    |
                    v
                  Pods
                    |
                    v
              Python Application
                    |
                    v
               Smoke Test
```

### Important distinction

-   **Docker** manages containers and container images.
-   **kind** creates a Kubernetes cluster using Docker containers as
    nodes.
-   **Kubernetes** manages Pods, Deployments, Services, etc.
-   **kubectl** communicates with the Kubernetes API.
-   **PowerShell** is the Windows command shell used by the self-hosted
    GitHub Actions runner.
-   **GitHub Actions runner** executes CI/CD commands on the Windows
    machine.

------------------------------------------------------------------------

# 2. Docker Commands

## 2.1 Check Docker Version

``` powershell
docker --version
```

Detailed version information:

``` powershell
docker version
```

------------------------------------------------------------------------

## 2.2 Check Docker Engine

``` powershell
docker info
```

If Docker Desktop/Docker Engine is running, this displays engine
information.

------------------------------------------------------------------------

## 2.3 List Docker Images

``` powershell
docker images
```

or:

``` powershell
docker image ls
```

Example:

``` powershell
docker image ls
```

Useful columns include:

``` text
REPOSITORY
TAG
IMAGE ID
CREATED
SIZE
```

------------------------------------------------------------------------

## 2.4 Inspect an Image

``` powershell
docker image inspect IMAGE_NAME
```

Example:

``` powershell
docker image inspect ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest
```

------------------------------------------------------------------------

## 2.5 Show Image History

``` powershell
docker history IMAGE_NAME
```

Example:

``` powershell
docker history ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest
```

This is useful for understanding the image layers created from the
Dockerfile.

------------------------------------------------------------------------

## 2.6 Remove an Image

``` powershell
docker image rm IMAGE_NAME
```

Example:

``` powershell
docker image rm IMAGE_ID
```

------------------------------------------------------------------------

## 2.7 Remove Unused Images

``` powershell
docker image prune
```

------------------------------------------------------------------------

## 2.8 Clean Unused Docker Resources

``` powershell
docker system prune
```

> Be careful: this removes unused Docker resources.

------------------------------------------------------------------------

# 3. Docker Container Commands

## 3.1 List Running Containers

``` powershell
docker ps
```

------------------------------------------------------------------------

## 3.2 List All Containers

``` powershell
docker ps -a
```

------------------------------------------------------------------------

## 3.3 Display Containers in a Readable Format

``` powershell
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

------------------------------------------------------------------------

## 3.4 Inspect a Container

``` powershell
docker inspect CONTAINER_NAME
```

Example:

``` powershell
docker inspect docker-k8s-cicd-worker
```

------------------------------------------------------------------------

## 3.5 View Container Logs

``` powershell
docker logs CONTAINER_NAME
```

Follow logs:

``` powershell
docker logs -f CONTAINER_NAME
```

------------------------------------------------------------------------

## 3.6 View Processes Inside a Container

``` powershell
docker top CONTAINER_NAME
```

------------------------------------------------------------------------

## 3.7 Monitor Container Resource Usage

``` powershell
docker stats
```

Specific container:

``` powershell
docker stats CONTAINER_NAME
```

------------------------------------------------------------------------

# 4. Verify kind Node Containers

A kind Kubernetes cluster uses Docker containers as Kubernetes nodes.

List the containers belonging to the project:

``` powershell
docker ps --filter "name=docker-k8s-cicd"
```

Include stopped containers:

``` powershell
docker ps -a --filter "name=docker-k8s-cicd"
```

Readable format:

``` powershell
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" --filter "name=docker-k8s-cicd"
```

Expected nodes:

``` text
docker-k8s-cicd-control-plane
docker-k8s-cicd-worker
docker-k8s-cicd-worker2
```

### Concept

``` text
Docker container
      |
      +-- docker-k8s-cicd-control-plane
      |       |
      |       +-- Kubernetes control plane
      |
      +-- docker-k8s-cicd-worker
      |       |
      |       +-- Kubernetes worker
      |
      +-- docker-k8s-cicd-worker2
              |
              +-- Kubernetes worker
```

------------------------------------------------------------------------

# 5. kind Commands

## 5.1 Check kind Version

``` powershell
kind version
```

------------------------------------------------------------------------

## 5.2 List kind Clusters

``` powershell
kind get clusters
```

Expected:

``` text
docker-k8s-cicd
```

------------------------------------------------------------------------

## 5.3 List kind Nodes

``` powershell
kind get nodes --name docker-k8s-cicd
```

Expected:

``` text
docker-k8s-cicd-control-plane
docker-k8s-cicd-worker
docker-k8s-cicd-worker2
```

------------------------------------------------------------------------

## 5.4 Load a Docker Image into kind

``` powershell
kind load docker-image IMAGE_NAME --name docker-k8s-cicd
```

Example:

``` powershell
kind load docker-image ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest --name docker-k8s-cicd
```

For the actual project image:

``` powershell
kind load docker-image ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest --name docker-k8s-cicd
```

------------------------------------------------------------------------

## 5.5 Verify Images Inside a kind Node

``` powershell
docker exec docker-k8s-cicd-worker crictl images
```

Worker 2:

``` powershell
docker exec docker-k8s-cicd-worker2 crictl images
```

Control plane:

``` powershell
docker exec docker-k8s-cicd-control-plane crictl images
```

This helps verify that the image is actually available to the container
runtime inside the kind nodes.

------------------------------------------------------------------------

## 5.6 Export kind kubeconfig

``` powershell
kind export kubeconfig --name docker-k8s-cicd
```

------------------------------------------------------------------------

# 6. kubectl Verification

## 6.1 Check kubectl Client Version

``` powershell
kubectl version --client
```

------------------------------------------------------------------------

## 6.2 Check kubectl Configuration

``` powershell
kubectl config view
```

------------------------------------------------------------------------

## 6.3 List Kubernetes Contexts

``` powershell
kubectl config get-contexts
```

A context identifies which Kubernetes cluster and credentials kubectl
will use.

Example:

``` text
docker-desktop
kind-docker-k8s-cicd
```

------------------------------------------------------------------------

## 6.4 Check Current Context

``` powershell
kubectl config current-context
```

Expected for this project:

``` text
kind-docker-k8s-cicd
```

------------------------------------------------------------------------

## 6.5 Explicitly Use the kind Context

``` powershell
kubectl --context kind-docker-k8s-cicd get pods
```

This is useful because the machine can have more than one Kubernetes
context.

For example:

``` text
docker-desktop
        |
        +-- Docker Desktop Kubernetes

kind-docker-k8s-cicd
        |
        +-- Your kind cluster
```

Therefore:

``` powershell
kubectl --context kind-docker-k8s-cicd get pods
```

explicitly targets your kind cluster.

------------------------------------------------------------------------

# 7. Kubernetes Cluster Commands

## 7.1 Check Cluster Information

``` powershell
kubectl cluster-info
```

Explicit context:

``` powershell
kubectl --context kind-docker-k8s-cicd cluster-info
```

------------------------------------------------------------------------

# 8. Kubernetes Node Commands

## 8.1 List Nodes

``` powershell
kubectl --context kind-docker-k8s-cicd get nodes
```

------------------------------------------------------------------------

## 8.2 Detailed Node Information

``` powershell
kubectl --context kind-docker-k8s-cicd get nodes -o wide
```

------------------------------------------------------------------------

## 8.3 Describe a Node

``` powershell
kubectl --context kind-docker-k8s-cicd describe node docker-k8s-cicd-worker
```

Control plane:

``` powershell
kubectl --context kind-docker-k8s-cicd describe node docker-k8s-cicd-control-plane
```

Worker 2:

``` powershell
kubectl --context kind-docker-k8s-cicd describe node docker-k8s-cicd-worker2
```

------------------------------------------------------------------------

## 8.4 Show Node Labels

``` powershell
kubectl --context kind-docker-k8s-cicd get nodes --show-labels
```

This is useful for understanding:

``` yaml
nodeSelector:
  node-role.kubernetes.io/worker: "true"
```

------------------------------------------------------------------------

# 9. Kubernetes Pod Commands

## 9.1 List Pods

``` powershell
kubectl --context kind-docker-k8s-cicd get pods
```

------------------------------------------------------------------------

## 9.2 List Pods with Node Information

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -o wide
```

This shows which Kubernetes node is running each Pod.

------------------------------------------------------------------------

## 9.3 List Pods in All Namespaces

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -A
```

------------------------------------------------------------------------

## 9.4 Watch Pods

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -w
```

------------------------------------------------------------------------

## 9.5 Describe a Pod

``` powershell
kubectl --context kind-docker-k8s-cicd describe pod POD_NAME
```

Example:

``` powershell
kubectl --context kind-docker-k8s-cicd describe pod python-app-xxxx
```

------------------------------------------------------------------------

# 10. Pod Logs

## 10.1 View Logs

``` powershell
kubectl --context kind-docker-k8s-cicd logs POD_NAME
```

------------------------------------------------------------------------

## 10.2 Follow Logs

``` powershell
kubectl --context kind-docker-k8s-cicd logs -f POD_NAME
```

------------------------------------------------------------------------

## 10.3 Logs from a Specific Container

``` powershell
kubectl --context kind-docker-k8s-cicd logs POD_NAME -c CONTAINER_NAME
```

------------------------------------------------------------------------

## 10.4 Logs from Previous Container Instance

``` powershell
kubectl --context kind-docker-k8s-cicd logs POD_NAME --previous
```

Useful after crashes or restarts.

------------------------------------------------------------------------

# 11. Deployment Commands

## 11.1 List Deployments

``` powershell
kubectl --context kind-docker-k8s-cicd get deployments
```

------------------------------------------------------------------------

## 11.2 Detailed Deployment List

``` powershell
kubectl --context kind-docker-k8s-cicd get deployment -o wide
```

------------------------------------------------------------------------

## 11.3 Check python-app

``` powershell
kubectl --context kind-docker-k8s-cicd get deployment python-app
```

Expected:

``` text
python-app   4/4   4   4
```

------------------------------------------------------------------------

## 11.4 Describe Deployment

``` powershell
kubectl --context kind-docker-k8s-cicd describe deployment python-app
```

------------------------------------------------------------------------

## 11.5 Check Rollout

``` powershell
kubectl --context kind-docker-k8s-cicd rollout status deployment/python-app
```

------------------------------------------------------------------------

## 11.6 View Rollout History

``` powershell
kubectl --context kind-docker-k8s-cicd rollout history deployment/python-app
```

------------------------------------------------------------------------

## 11.7 Restart Deployment

``` powershell
kubectl --context kind-docker-k8s-cicd rollout restart deployment/python-app
```

------------------------------------------------------------------------

## 11.8 Undo a Deployment Rollout

``` powershell
kubectl --context kind-docker-k8s-cicd rollout undo deployment/python-app
```

------------------------------------------------------------------------

# 12. ReplicaSet Commands

List ReplicaSets:

``` powershell
kubectl --context kind-docker-k8s-cicd get replicasets
```

Short form:

``` powershell
kubectl --context kind-docker-k8s-cicd get rs
```

Detailed:

``` powershell
kubectl --context kind-docker-k8s-cicd get rs -o wide
```

Describe:

``` powershell
kubectl --context kind-docker-k8s-cicd describe rs REPLICASET_NAME
```

------------------------------------------------------------------------

# 13. Kubernetes Service Commands

## 13.1 List Services

``` powershell
kubectl --context kind-docker-k8s-cicd get services
```

Short form:

``` powershell
kubectl --context kind-docker-k8s-cicd get svc
```

------------------------------------------------------------------------

## 13.2 Detailed Service Information

``` powershell
kubectl --context kind-docker-k8s-cicd get svc -o wide
```

------------------------------------------------------------------------

## 13.3 Check python-app Service

``` powershell
kubectl --context kind-docker-k8s-cicd get svc python-app
```

The current project uses:

``` text
NodePort
5000:30080/TCP
```

------------------------------------------------------------------------

## 13.4 Describe Service

``` powershell
kubectl --context kind-docker-k8s-cicd describe svc python-app
```

------------------------------------------------------------------------

# 14. Service Endpoints

Check endpoints:

``` powershell
kubectl --context kind-docker-k8s-cicd get endpoints
```

Specific service:

``` powershell
kubectl --context kind-docker-k8s-cicd get endpoints python-app
```

EndpointSlices:

``` powershell
kubectl --context kind-docker-k8s-cicd get endpointslices
```

This helps verify that the Service has backend Pods.

------------------------------------------------------------------------

# 15. Test the Application with Port Forwarding

Start a port-forward:

``` powershell
kubectl --context kind-docker-k8s-cicd port-forward service/python-app 5001:5000
```

This means:

``` text
Windows localhost:5001
        |
        v
Kubernetes Service:5000
        |
        v
Python application Pods
```

Then open:

``` text
http://localhost:5001/
```

Health endpoint:

``` text
http://localhost:5001/healthz
```

Metrics:

``` text
http://localhost:5001/metrics
```

------------------------------------------------------------------------

# 16. Test Application Endpoints from PowerShell

Root endpoint:

``` powershell
Invoke-WebRequest http://127.0.0.1:5001/
```

Health:

``` powershell
Invoke-WebRequest http://127.0.0.1:5001/healthz
```

Metrics:

``` powershell
Invoke-WebRequest http://127.0.0.1:5001/metrics
```

------------------------------------------------------------------------

# 17. ConfigMap Commands

List ConfigMaps:

``` powershell
kubectl --context kind-docker-k8s-cicd get configmaps
```

Short form:

``` powershell
kubectl --context kind-docker-k8s-cicd get cm
```

Describe:

``` powershell
kubectl --context kind-docker-k8s-cicd describe configmap CONFIGMAP_NAME
```

View YAML:

``` powershell
kubectl --context kind-docker-k8s-cicd get configmap CONFIGMAP_NAME -o yaml
```

------------------------------------------------------------------------

# 18. Secret Commands

List Secrets:

``` powershell
kubectl --context kind-docker-k8s-cicd get secrets
```

Describe:

``` powershell
kubectl --context kind-docker-k8s-cicd describe secret SECRET_NAME
```

View YAML:

``` powershell
kubectl --context kind-docker-k8s-cicd get secret SECRET_NAME -o yaml
```

> Never expose production secret values in Git repositories, workflow
> logs, screenshots, or documentation.

------------------------------------------------------------------------

# 19. Namespace Commands

List namespaces:

``` powershell
kubectl --context kind-docker-k8s-cicd get namespaces
```

Short form:

``` powershell
kubectl --context kind-docker-k8s-cicd get ns
```

View resources in the default namespace:

``` powershell
kubectl --context kind-docker-k8s-cicd get all -n default
```

------------------------------------------------------------------------

# 20. See Kubernetes Resources Together

Very useful command:

``` powershell
kubectl --context kind-docker-k8s-cicd get all
```

With more information:

``` powershell
kubectl --context kind-docker-k8s-cicd get all -o wide
```

All namespaces:

``` powershell
kubectl --context kind-docker-k8s-cicd get all -A
```

------------------------------------------------------------------------

# 21. Kubernetes Events

List events:

``` powershell
kubectl --context kind-docker-k8s-cicd get events
```

Sort by timestamp:

``` powershell
kubectl --context kind-docker-k8s-cicd get events --sort-by=.lastTimestamp
```

All namespaces:

``` powershell
kubectl --context kind-docker-k8s-cicd get events -A --sort-by=.lastTimestamp
```

Events are especially useful for errors such as:

``` text
Pending
ImagePullBackOff
ErrImagePull
CrashLoopBackOff
FailedScheduling
```

------------------------------------------------------------------------

# 22. Resource Usage

If metrics-server is available:

``` powershell
kubectl --context kind-docker-k8s-cicd top nodes
```

Pod usage:

``` powershell
kubectl --context kind-docker-k8s-cicd top pods
```

------------------------------------------------------------------------

# 23. Inspect Resource Requests and Limits

View deployment YAML:

``` powershell
kubectl --context kind-docker-k8s-cicd get deployment python-app -o yaml
```

Search for resources:

``` powershell
kubectl --context kind-docker-k8s-cicd get deployment python-app -o yaml |
    Select-String -Pattern "requests|limits|cpu|memory"
```

------------------------------------------------------------------------

# 24. Kubernetes Labels

Node labels:

``` powershell
kubectl --context kind-docker-k8s-cicd get nodes --show-labels
```

Pod labels:

``` powershell
kubectl --context kind-docker-k8s-cicd get pods --show-labels
```

Labels are important for:

``` text
Selectors
Services
Deployments
Scheduling
Node selectors
```

------------------------------------------------------------------------

# 25. PowerShell Environment Verification

## 25.1 PowerShell Version

``` powershell
$PSVersionTable
```

Just the version:

``` powershell
$PSVersionTable.PSVersion
```

------------------------------------------------------------------------

## 25.2 Current Computer

``` powershell
$env:COMPUTERNAME
```

------------------------------------------------------------------------

## 25.3 Current User

``` powershell
whoami
```

or:

``` powershell
$env:USERNAME
```

------------------------------------------------------------------------

## 25.4 User Profile

``` powershell
$env:USERPROFILE
```

------------------------------------------------------------------------

## 25.5 Current Directory

``` powershell
Get-Location
```

or:

``` powershell
pwd
```

------------------------------------------------------------------------

## 25.6 Operating System Information

``` powershell
Get-ComputerInfo
```

------------------------------------------------------------------------

# 26. PowerShell PATH Verification

Display PATH:

``` powershell
$env:PATH
```

Display each PATH entry separately:

``` powershell
$env:PATH -split ';'
```

Find Docker:

``` powershell
Get-Command docker
```

Find kubectl:

``` powershell
Get-Command kubectl
```

Find kind:

``` powershell
Get-Command kind
```

Find PowerShell:

``` powershell
Get-Command powershell
```

------------------------------------------------------------------------

# 27. Kubernetes kubeconfig Verification

Check the KUBECONFIG environment variable:

``` powershell
$env:KUBECONFIG
```

If it is empty, kubectl normally uses the default kubeconfig location.

Check whether the default kubeconfig exists:

``` powershell
Test-Path "$HOME\.kube\config"
```

View contexts:

``` powershell
kubectl config get-contexts
```

View current context configuration:

``` powershell
kubectl config view --minify
```

Find the current API server:

``` powershell
kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}'
```

------------------------------------------------------------------------

# 28. Complete Docker + kind + Kubernetes Verification

Run:

``` powershell
Write-Host "=== Docker ==="
docker --version

Write-Host ""
Write-Host "=== Kind ==="
kind version

Write-Host ""
Write-Host "=== Kind Clusters ==="
kind get clusters

Write-Host ""
Write-Host "=== Kubernetes Context ==="
kubectl config current-context

Write-Host ""
Write-Host "=== Kubernetes Nodes ==="
kubectl --context kind-docker-k8s-cicd get nodes -o wide

Write-Host ""
Write-Host "=== Kubernetes Pods ==="
kubectl --context kind-docker-k8s-cicd get pods -o wide

Write-Host ""
Write-Host "=== Kubernetes Services ==="
kubectl --context kind-docker-k8s-cicd get svc
```

------------------------------------------------------------------------

# 29. Complete Application Verification

For the current `python-app`:

``` powershell
kubectl --context kind-docker-k8s-cicd get deployment python-app
```

Check rollout:

``` powershell
kubectl --context kind-docker-k8s-cicd rollout status deployment/python-app
```

Check Pods:

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -o wide
```

Check Service:

``` powershell
kubectl --context kind-docker-k8s-cicd get svc python-app
```

Check endpoints:

``` powershell
kubectl --context kind-docker-k8s-cicd get endpoints python-app
```

Check everything:

``` powershell
kubectl --context kind-docker-k8s-cicd get all -o wide
```

Check recent events:

``` powershell
kubectl --context kind-docker-k8s-cicd get events --sort-by=.lastTimestamp
```

------------------------------------------------------------------------

# 30. Self-Hosted GitHub Actions Runner Verification

List Actions runner services:

``` powershell
Get-Service | Where-Object {
    $_.Name -like "actions.runner*"
}
```

Get detailed information:

``` powershell
Get-CimInstance Win32_Service |
    Where-Object {
        $_.Name -like "actions.runner*"
    } |
    Select-Object Name, State, StartMode, StartName, PathName
```

For the current project, the runner service is expected to be similar
to:

``` text
actions.runner.barikpriyabrata27-bitwise-devops-kubernates.priyabrata_w
```

Expected:

``` text
State     = Running
StartMode = Auto
```

------------------------------------------------------------------------

# 31. Self-Hosted Runner Directory

Move to the runner directory:

``` powershell
Set-Location "D:\Learning\SelfHostedRunner\actions-runner"
```

Check location:

``` powershell
Get-Location
```

List files:

``` powershell
Get-ChildItem
```

------------------------------------------------------------------------

# 32. Verify Tools from the Runner Account

The runner must be able to access Docker, kubectl, kind, and kubeconfig.

Run:

``` powershell
whoami
```

``` powershell
docker --version
```

``` powershell
kubectl version --client
```

``` powershell
kind version
```

``` powershell
kubectl config current-context
```

Expected Kubernetes context:

``` text
kind-docker-k8s-cicd
```

This is particularly important for Windows self-hosted runners because
the service account's environment can differ from your interactive
PowerShell environment.

------------------------------------------------------------------------

# 33. GitHub Actions Runner Environment Verification

A temporary debugging step can be added to a workflow:

``` yaml
- name: Verify runner environment
  shell: powershell
  run: |
    Write-Host "=== User ==="
    whoami

    Write-Host ""
    Write-Host "=== Computer ==="
    $env:COMPUTERNAME

    Write-Host ""
    Write-Host "=== Working Directory ==="
    Get-Location

    Write-Host ""
    Write-Host "=== Docker ==="
    docker --version

    Write-Host ""
    Write-Host "=== Kind ==="
    kind version

    Write-Host ""
    Write-Host "=== Kubectl ==="
    kubectl version --client

    Write-Host ""
    Write-Host "=== Kubernetes Context ==="
    kubectl config current-context

    Write-Host ""
    Write-Host "=== Kind Clusters ==="
    kind get clusters

    Write-Host ""
    Write-Host "=== Kubernetes Nodes ==="
    kubectl --context kind-docker-k8s-cicd get nodes -o wide
```

This is useful when a command works manually but fails in GitHub
Actions.

------------------------------------------------------------------------

# 34. Docker Image Verification for GHCR

Check whether the image exists locally:

``` powershell
docker image ls
```

Search for the project image:

``` powershell
docker image ls "ghcr.io/barikpriyabrata27/bitwise-devops-kubernates"
```

Inspect:

``` powershell
docker image inspect "ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest"
```

Pull from GHCR:

``` powershell
docker pull "ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest"
```

Then load into kind:

``` powershell
kind load docker-image `
    "ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest" `
    --name docker-k8s-cicd
```

------------------------------------------------------------------------

# 35. Deployment Image Verification

Check the image configured in the Deployment:

``` powershell
kubectl --context kind-docker-k8s-cicd get deployment python-app -o jsonpath='{.spec.template.spec.containers[*].image}'
```

Expected:

``` text
ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest
```

Check the Pods' actual images:

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -o jsonpath='{range .items[*]}{.metadata.name}{" -> "}{.spec.containers[*].image}{"\n"}{end}'
```

------------------------------------------------------------------------

# 36. Verify Pod Placement

Show where Pods are running:

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -o wide
```

You should see the worker nodes in the `NODE` column.

For example:

``` text
NAME                       READY   STATUS    NODE
python-app-xxxxx           1/1     Running   docker-k8s-cicd-worker
python-app-yyyyy           1/1     Running   docker-k8s-cicd-worker2
```

This verifies that the Deployment's scheduling rules are working.

------------------------------------------------------------------------

# 37. Troubleshooting Sequence

When the application is not working, use this order:

## Step 1 --- Docker

``` powershell
docker info
```

``` powershell
docker ps
```

------------------------------------------------------------------------

## Step 2 --- kind

``` powershell
kind get clusters
```

``` powershell
kind get nodes --name docker-k8s-cicd
```

------------------------------------------------------------------------

## Step 3 --- Kubernetes Context

``` powershell
kubectl config current-context
```

``` powershell
kubectl config get-contexts
```

------------------------------------------------------------------------

## Step 4 --- Nodes

``` powershell
kubectl --context kind-docker-k8s-cicd get nodes -o wide
```

All nodes should normally be:

``` text
Ready
```

------------------------------------------------------------------------

## Step 5 --- Pods

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -o wide
```

------------------------------------------------------------------------

## Step 6 --- Events

``` powershell
kubectl --context kind-docker-k8s-cicd get events --sort-by=.lastTimestamp
```

------------------------------------------------------------------------

## Step 7 --- Describe

``` powershell
kubectl --context kind-docker-k8s-cicd describe pod POD_NAME
```

------------------------------------------------------------------------

## Step 8 --- Logs

``` powershell
kubectl --context kind-docker-k8s-cicd logs POD_NAME
```

------------------------------------------------------------------------

## Step 9 --- Deployment

``` powershell
kubectl --context kind-docker-k8s-cicd get deployment python-app
```

``` powershell
kubectl --context kind-docker-k8s-cicd rollout status deployment/python-app
```

------------------------------------------------------------------------

## Step 10 --- Service

``` powershell
kubectl --context kind-docker-k8s-cicd get svc python-app
```

------------------------------------------------------------------------

## Step 11 --- Endpoints

``` powershell
kubectl --context kind-docker-k8s-cicd get endpoints python-app
```

------------------------------------------------------------------------

## Step 12 --- Application

``` powershell
kubectl --context kind-docker-k8s-cicd port-forward service/python-app 5001:5000
```

Then:

``` powershell
Invoke-WebRequest http://127.0.0.1:5001/healthz
```

------------------------------------------------------------------------

# 38. Most Useful Commands for Daily Work

If you don't want to remember everything, start with these:

### Docker

``` powershell
docker ps
```

``` powershell
docker image ls
```

``` powershell
docker stats
```

### kind

``` powershell
kind get clusters
```

``` powershell
kind get nodes --name docker-k8s-cicd
```

### Kubernetes

``` powershell
kubectl config current-context
```

``` powershell
kubectl --context kind-docker-k8s-cicd get nodes
```

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -o wide
```

``` powershell
kubectl --context kind-docker-k8s-cicd get svc
```

``` powershell
kubectl --context kind-docker-k8s-cicd get all
```

### Troubleshooting

``` powershell
kubectl --context kind-docker-k8s-cicd get events --sort-by=.lastTimestamp
```

``` powershell
kubectl --context kind-docker-k8s-cicd describe pod POD_NAME
```

``` powershell
kubectl --context kind-docker-k8s-cicd logs POD_NAME
```

------------------------------------------------------------------------

# 39. One-Command Environment Check

For a quick health check of the entire environment:

``` powershell
Write-Host "===================================="
Write-Host " DOCKER"
Write-Host "===================================="
docker --version
docker info --format "Docker Server: {{.ServerVersion}}"

Write-Host ""
Write-Host "===================================="
Write-Host " KIND"
Write-Host "===================================="
kind version
kind get clusters
kind get nodes --name docker-k8s-cicd

Write-Host ""
Write-Host "===================================="
Write-Host " KUBERNETES CONTEXT"
Write-Host "===================================="
kubectl config current-context

Write-Host ""
Write-Host "===================================="
Write-Host " KUBERNETES NODES"
Write-Host "===================================="
kubectl --context kind-docker-k8s-cicd get nodes -o wide

Write-Host ""
Write-Host "===================================="
Write-Host " DEPLOYMENTS"
Write-Host "===================================="
kubectl --context kind-docker-k8s-cicd get deployments

Write-Host ""
Write-Host "===================================="
Write-Host " PODS"
Write-Host "===================================="
kubectl --context kind-docker-k8s-cicd get pods -o wide

Write-Host ""
Write-Host "===================================="
Write-Host " SERVICES"
Write-Host "===================================="
kubectl --context kind-docker-k8s-cicd get svc

Write-Host ""
Write-Host "===================================="
Write-Host " ENDPOINTS"
Write-Host "===================================="
kubectl --context kind-docker-k8s-cicd get endpoints

Write-Host ""
Write-Host "===================================="
Write-Host " RUNNER USER"
Write-Host "===================================="
whoami
```

------------------------------------------------------------------------

# 40. Quick Verification Checklist

Use this checklist whenever you want to verify the environment:

``` text
[ ] Docker Desktop is running
[ ] Docker Engine responds to docker info
[ ] kind cluster exists
[ ] Control-plane node exists
[ ] Worker node exists
[ ] Worker2 node exists
[ ] kubectl is installed
[ ] Current Kubernetes context is correct
[ ] Kubernetes API server is reachable
[ ] All nodes are Ready
[ ] Deployment exists
[ ] Deployment rollout is successful
[ ] Expected number of Pods are Running
[ ] Pods are on expected worker nodes
[ ] Service exists
[ ] Service has endpoints
[ ] Application responds through port-forward
[ ] /healthz works
[ ] / endpoint returns expected message
[ ] /metrics endpoint works
[ ] Docker image exists
[ ] Image is available inside kind nodes
[ ] GitHub Actions runner service is Running
[ ] Runner service uses the expected Windows account
[ ] Docker/kubectl/kind work from the runner account
```

------------------------------------------------------------------------

# 41. Mental Model to Remember

The complete relationship is:

``` text
                    WINDOWS
                       |
                       v
                 PowerShell
                       |
                       v
                Docker Desktop
                       |
                       v
                 Docker Engine
                       |
                       v
                     kind
                       |
          +------------+------------+
          |            |            |
          v            v            v
     Control Plane   Worker      Worker2
          |            |            |
          +------------+------------+
                       |
                       v
                  Kubernetes
                       |
             +---------+---------+
             |                   |
             v                   v
        Deployment            Service
             |
             v
           Pods
             |
             v
       Python Application
             |
             v
         Smoke Test
```

The troubleshooting hierarchy is:

``` text
PowerShell
    ↓
Docker
    ↓
kind
    ↓
Kubernetes Context
    ↓
Kubernetes Nodes
    ↓
Deployment
    ↓
Pods
    ↓
Service
    ↓
Endpoints
    ↓
Application
    ↓
Smoke Test
```

------------------------------------------------------------------------

# 42. Key Concepts

### Docker

> Builds, stores, and runs containers.

### Docker Image

> A packaged application/runtime filesystem used to create containers.

### GHCR

> Stores container images and other supported packages associated with
> GitHub.

### kind

> Creates local Kubernetes clusters using Docker containers as nodes.

### Kubernetes

> Orchestrates containers and manages resources such as Pods,
> Deployments, Services, ConfigMaps, and Secrets.

### kubectl

> Command-line client used to communicate with the Kubernetes API.

### Kubernetes Context

> Identifies the Kubernetes cluster and credentials kubectl should use.

For this project:

``` text
kind-docker-k8s-cicd
```

### PowerShell

> The command shell used by the Windows environment and the Windows
> self-hosted GitHub Actions runner.

### Self-hosted Runner

> A machine managed by you that executes GitHub Actions jobs.

------------------------------------------------------------------------

# 43. Recommended Daily Verification

Before working on the CD pipeline:

``` powershell
docker info
```

``` powershell
kind get clusters
```

``` powershell
kubectl config current-context
```

``` powershell
kubectl --context kind-docker-k8s-cicd get nodes
```

``` powershell
kubectl --context kind-docker-k8s-cicd get pods -o wide
```

``` powershell
kubectl --context kind-docker-k8s-cicd get svc
```

If all of these are healthy, your basic local Docker → kind → Kubernetes
environment is working.

------------------------------------------------------------------------

# 44. Final Architecture Summary

``` text
Developer
    |
    v
GitHub Repository
    |
    +-----------------------+
    |                       |
    v                       v
Dockerfile             Kubernetes YAML
    |                       |
    v                       |
Docker Image                |
    |                       |
    v                       |
GHCR                        |
    |                       |
    +-----------+-----------+
                |
                v
          GitHub Actions
                |
                v
       Windows Self-Hosted
             Runner
                |
        +-------+-------+
        |               |
        v               v
      Docker           kubectl
        |               |
        v               v
       kind       Kubernetes API
        |               |
        +-------+-------+
                |
                v
        docker-k8s-cicd
                |
       +--------+--------+
       |        |        |
       v        v        v
    Control  Worker   Worker2
     Plane
                |
                v
           python-app
                |
                v
             4 Pods
                |
                v
             Service
                |
                v
           Smoke Test
```

> **Remember:** Docker packages the application, GHCR stores the image,
> kind provides the local Kubernetes cluster, Kubernetes runs and
> manages the application, kubectl communicates with Kubernetes,
> PowerShell provides the Windows command environment, and the smoke
> test validates that the deployed application actually responds
> correctly.
