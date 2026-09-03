# Helm Charts — Complete Learning Guide

> A practical and conceptual guide to Helm, Helm Charts, templating, values, releases, dependencies, environments, and Kubernetes deployments.

---

# 1. What is Helm?

**Helm is a package manager for Kubernetes.**

Just as:

```text
apt       → Linux packages
npm       → Node.js packages
pip       → Python packages
maven     → Java packages
```

Helm provides a package-management mechanism for Kubernetes applications.

A Helm package is called a **Helm Chart**.

Officially, a chart is a collection of files describing a related set of Kubernetes resources.

For example:

```text
Helm Chart
    |
    +-- Deployment
    +-- Service
    +-- ConfigMap
    +-- Secret
    +-- Ingress
    +-- ServiceAccount
    +-- PVC
    +-- HPA
```

Helm takes those templates and values and renders Kubernetes manifests that are submitted to the Kubernetes API.

---

# 2. Why Do We Need Helm?

Without Helm, you might have:

```text
k8s/
├── deployment.yaml
├── service.yaml
├── configmap.yaml
├── secret.yaml
├── ingress.yaml
└── hpa.yaml
```

You would then execute:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

This works.

But imagine you have:

```text
Development
Staging
Production
```

and each environment needs different:

```text
replicas
image tag
resources
hostname
environment variables
database configuration
```

You could maintain separate YAML files for everything.

That becomes difficult to maintain.

Helm solves this by allowing you to create **templates** and provide different **values**.

---

# 3. The Core Helm Concept

The most important concept is:

```text
                    Helm Chart
                        |
             +----------+----------+
             |                     |
             ▼                     ▼
        Templates              values.yaml
             |                     |
             +----------+----------+
                        |
                        ▼
                 Helm rendering
                        |
                        ▼
              Kubernetes YAML
                        |
                        ▼
                Kubernetes API
                        |
                        ▼
                     Pods
```

The template describes:

> "What should Kubernetes resources look like?"

The values describe:

> "What configuration should this deployment use?"

---

# 4. Helm vs Docker vs Kubernetes

This distinction is extremely important.

## Dockerfile

A Dockerfile builds your application container.

```text
Dockerfile
    ↓
Docker build
    ↓
Container Image
```

Example:

```text
python:3.12
Flask
app.py
requirements.txt
```

---

## Helm Chart

A Helm chart describes how that container should be deployed to Kubernetes.

```text
Helm Chart
    ↓
Kubernetes resources
    ↓
Deployment
Service
ConfigMap
Ingress
etc.
```

---

## Kubernetes

Kubernetes actually runs the application.

```text
Container Image
       +
Kubernetes Configuration
       ↓
Kubernetes
       ↓
Pods
```

Therefore:

```text
Dockerfile
    ↓
Container Image
    ↓
GHCR
    ↓
Helm Chart
    ↓
Kubernetes
    ↓
Pods
```

### Important

**Helm does NOT replace Docker.**

Helm and Docker solve different problems.

---

# 5. Helm Chart vs Terraform Module

A useful mental model is:

```text
Helm Chart
     ≈
Terraform Module
```

Both package reusable configuration.

But their purposes differ.

| Helm                    | Terraform                      |
| ----------------------- | ------------------------------ |
| Kubernetes applications | Infrastructure                 |
| Kubernetes resources    | Cloud/infrastructure resources |
| Deployment              | VPC                            |
| Service                 | Subnet                         |
| Ingress                 | Load balancer                  |
| ConfigMap               | IAM                            |
| HPA                     | Database                       |
| `values.yaml`           | Variables                      |
| `helm install`          | `terraform apply`              |

Terraform may also manage Helm releases using the Helm provider.

A common architecture is:

```text
Terraform
    ↓
Infrastructure
    ↓
Kubernetes Cluster
    ↓
Helm
    ↓
Application
```

---

# 6. Creating Your First Helm Chart

Install Helm and verify it:

```bash
helm version
```

Create a chart:

```bash
helm create python-app
```

Helm generates a starter chart structure.

Official Helm documentation recommends `helm create` as a convenient way to start chart development.

---

# 7. Helm Chart Directory Structure

A typical chart looks like:

```text
python-app/
│
├── Chart.yaml
├── values.yaml
│
├── charts/
│
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── serviceaccount.yaml
    ├── hpa.yaml
    ├── _helpers.tpl
    └── NOTES.txt
```

There can also be optional files such as:

```text
README.md
LICENSE
values.schema.json
```

---

# 8. Chart.yaml

`Chart.yaml` describes the chart itself.

Example:

```yaml
apiVersion: v2
name: python-app
description: A Helm chart for deploying a Python application

type: application

version: 0.1.0

appVersion: "1.0.0"
```

Important fields:

### `apiVersion`

Identifies the chart API version.

For modern Helm charts, this is commonly:

```yaml
apiVersion: v2
```

### `name`

The chart name:

```yaml
name: python-app
```

### `description`

Human-readable description.

### `type`

Usually:

```yaml
type: application
```

A chart can also be a library chart.

### `version`

This is the **chart version**.

Example:

```yaml
version: 0.1.0
```

It describes changes to the Helm chart.

### `appVersion`

This represents the application version.

Example:

```yaml
appVersion: "2.5.1"
```

Do not confuse:

```text
chart version
```

with:

```text
application version
```

---

# 9. values.yaml

`values.yaml` contains default configuration values for the chart.

Example:

```yaml
replicaCount: 4

image:
  repository: ghcr.io/barikpriyabrata27/bitwise-devops-kubernates
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: NodePort
  port: 5000
  nodePort: 30080
```

The templates consume these values.

For example:

```yaml
replicas: {{ .Values.replicaCount }}
```

If:

```yaml
replicaCount: 4
```

then Helm renders:

```yaml
replicas: 4
```

---

# 10. Why values.yaml is Powerful

Suppose:

```yaml
replicaCount: 4
```

Production might use:

```yaml
replicaCount: 4
```

Staging:

```yaml
replicaCount: 2
```

Development:

```yaml
replicaCount: 1
```

You can maintain:

```text
values.yaml
values-dev.yaml
values-staging.yaml
values-prod.yaml
```

Then:

```bash
helm upgrade --install python-app ./python-app \
  -f values-prod.yaml
```

Values supplied with `-f` and `--set` can override the chart's defaults, with more specific overrides taking precedence.

---

# 11. Helm Templates

The `templates/` directory contains Kubernetes manifests with Helm template expressions.

Example:

```yaml
apiVersion: apps/v1

kind: Deployment

metadata:
  name: {{ include "python-app.fullname" . }}

spec:
  replicas: {{ .Values.replicaCount }}

  selector:
    matchLabels:
      app: {{ include "python-app.name" . }}

  template:
    metadata:
      labels:
        app: {{ include "python-app.name" . }}

    spec:
      containers:
        - name: python-app

          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"

          imagePullPolicy: {{ .Values.image.pullPolicy }}

          ports:
            - containerPort: 5000
```

The important expressions are:

```text
{{ ... }}
```

These are Helm template expressions.

---

# 12. What Does `.Values` Mean?

`.Values` represents configuration supplied to the chart.

Example:

```yaml
replicaCount: 4
```

Then:

```yaml
replicas: {{ .Values.replicaCount }}
```

becomes:

```yaml
replicas: 4
```

Another example:

```yaml
image:
  repository: nginx
  tag: "1.27"
```

Template:

```yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

Result:

```yaml
image: "nginx:1.27"
```

---

# 13. Built-in Helm Objects

Helm provides several built-in objects.

Important ones include:

```text
.Values
.Release
.Chart
.Capabilities
.Files
.Template
```

---

## `.Values`

Chart configuration.

```yaml
{{ .Values.image.repository }}
```

---

## `.Release`

Information about the current Helm release.

Examples:

```yaml
{{ .Release.Name }}
```

```yaml
{{ .Release.Namespace }}
```

```yaml
{{ .Release.Revision }}
```

The revision increases when a release is upgraded.

---

## `.Chart`

Information from `Chart.yaml`.

Example:

```yaml
{{ .Chart.Name }}
```

```yaml
{{ .Chart.Version }}
```

---

## `.Capabilities`

Information about the Kubernetes/Helm environment.

For example:

```yaml
{{ .Capabilities.KubeVersion }}
```

---

# 14. `_helpers.tpl`

You will frequently see:

```text
templates/_helpers.tpl
```

This file contains reusable template helpers.

Example:

```yaml
{{- define "python-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}
```

Then you can use:

```yaml
{{ include "python-app.name" . }}
```

instead of repeating complicated expressions.

This makes charts easier to maintain.

Helm's best-practice guidance recommends namespacing defined templates because template names can be globally accessible across charts and subcharts.

---

# 15. `templates/NOTES.txt`

`NOTES.txt` contains instructions displayed after installation.

For example:

```text
Your application has been deployed.

Run:

kubectl port-forward service/python-app 5000:5000
```

After:

```bash
helm install python-app ./python-app
```

Helm can display these notes to the user.

---

# 16. Helm Release

A very important concept:

**Chart ≠ Release**

A chart is the package.

A release is an installed instance of that chart.

Example:

```text
Chart:
python-app
```

You install it:

```bash
helm install dev-python ./python-app
```

Now:

```text
Chart
  ↓
Release: dev-python
```

Install the same chart again:

```bash
helm install prod-python ./python-app
```

Now:

```text
Same Chart
   │
   ├── Release: dev-python
   │
   └── Release: prod-python
```

Each release can have different configuration.

---

# 17. Helm Install

Basic syntax:

```bash
helm install RELEASE_NAME CHART
```

Example:

```bash
helm install python-app ./python-app
```

With custom values:

```bash
helm install python-app ./python-app \
  -f values-prod.yaml
```

Or:

```bash
helm install python-app ./python-app \
  --set replicaCount=4
```

Helm supports both values files and `--set` overrides.

---

# 18. Helm List

See installed releases:

```bash
helm list
```

For a namespace:

```bash
helm list -n production
```

Example:

```text
NAME         NAMESPACE   REVISION   STATUS
python-app   default     1          deployed
```

---

# 19. Helm Upgrade

Change an existing release:

```bash
helm upgrade python-app ./python-app
```

With a values file:

```bash
helm upgrade python-app ./python-app \
  -f values-prod.yaml
```

---

# 20. Helm Upgrade --install

One of the most useful commands in CI/CD:

```bash
helm upgrade --install python-app ./python-app
```

Meaning:

```text
Does release exist?
       |
   +---+---+
   |       |
  Yes      No
   |       |
Upgrade   Install
```

This makes CI/CD scripts easier.

---

# 21. Helm Rollback

Suppose:

```text
Revision 1 → working
Revision 2 → working
Revision 3 → broken
```

You can roll back:

```bash
helm rollback python-app 2
```

Now:

```text
Revision 3
   ↓
Rollback
   ↓
Revision 2 configuration
```

This is one of Helm's major advantages over simply applying raw YAML files.

---

# 22. Helm History

See release history:

```bash
helm history python-app
```

Example:

```text
REVISION   STATUS
1          superseded
2          superseded
3          deployed
```

---

# 23. Helm Status

```bash
helm status python-app
```

Shows information about the release.

---

# 24. Helm Get Values

See values used by a release:

```bash
helm get values python-app
```

You can also retrieve all values:

```bash
helm get values python-app --all
```

---

# 25. Helm Get Manifest

One of the most useful learning commands:

```bash
helm get manifest python-app
```

This shows the Kubernetes manifests generated for the release.

This is extremely useful because it lets you see:

```text
Helm Template
      ↓
Rendered Kubernetes YAML
```

The official Helm documentation describes `helm get manifest` as a way to retrieve the Kubernetes resources generated for a release.

---

# 26. Helm Template

You can render a chart without installing it:

```bash
helm template python-app ./python-app
```

This is excellent for learning.

It lets you see:

```text
values.yaml
     +
templates/
     ↓
Rendered YAML
```

without actually deploying anything.

---

# 27. Helm Dry Run

You can test an installation/upgrade:

```bash
helm install python-app ./python-app \
  --dry-run \
  --debug
```

This is useful for troubleshooting template rendering.

However, a successful rendering does not guarantee that Kubernetes will accept every resulting resource.

---

# 28. Helm Lint

Check a chart:

```bash
helm lint ./python-app
```

This can catch common chart problems before deployment.

Typical CI/CD flow:

```text
helm lint
    ↓
helm template
    ↓
helm upgrade --install
```

---

# 29. Packaging a Chart

You can package a chart:

```bash
helm package ./python-app
```

This produces something similar to:

```text
python-app-0.1.0.tgz
```

The `.tgz` file is a packaged Helm chart.

So:

```text
Chart directory
      ↓
helm package
      ↓
python-app-0.1.0.tgz
```

---

# 30. Chart Repository

Charts can be distributed through chart repositories.

Conceptually:

```text
Chart Source
     ↓
Package
     ↓
Chart Repository
     ↓
helm pull / helm install
```

Modern Helm can also work with OCI registries.

This is important because Helm charts can be distributed similarly to other packages.

---

# 31. Chart Dependencies

A chart can depend on other charts.

Example:

```text
my-application
      |
      +-- Redis
      |
      +-- PostgreSQL
      |
      +-- RabbitMQ
```

The dependency charts can be placed under:

```text
charts/
```

Helm supports subcharts/dependencies as part of the chart structure.

---

# 32. Environment-Specific Values

A professional setup might look like:

```text
python-app/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
├── values-prod.yaml
└── templates/
```

Base:

```yaml
replicaCount: 1
```

Production:

```yaml
replicaCount: 4
```

Then:

```bash
helm upgrade --install python-app ./python-app \
  -f values-prod.yaml
```

This lets you use one chart for multiple environments.

---

# 33. Image Configuration

A common pattern:

```yaml
image:
  repository: ghcr.io/company/python-app
  tag: "1.5.2"
  pullPolicy: IfNotPresent
```

Template:

```yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

Result:

```yaml
image: "ghcr.io/company/python-app:1.5.2"
```

This creates a clean separation:

```text
Application build
        ↓
Container image
        ↓
GHCR

Deployment configuration
        ↓
Helm
```

---

# 34. Helm + GHCR

Your current project already uses GHCR.

You could eventually have:

```text
GitHub
│
├── Source Code
│
├── Container Image
│      ↓
│     GHCR
│
└── Helm Chart
       ↓
      Helm Registry
```

The CI pipeline builds the image:

```text
Dockerfile
    ↓
Docker build
    ↓
GHCR
```

The CD pipeline deploys it:

```text
Helm Chart
    +
Image Tag
    ↓
Kubernetes
```

---

# 35. Helm in Your Current Project

You currently have:

```text
k8s/
├── deployment.yaml
└── service.yaml
```

These can become:

```text
helm/
└── python-app/
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
        ├── deployment.yaml
        └── service.yaml
```

Your current Deployment contains:

```yaml
replicas: 4
```

Helm could change this to:

```yaml
replicas: {{ .Values.replicaCount }}
```

and:

```yaml
image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
```

Your `values.yaml` could contain:

```yaml
replicaCount: 4

image:
  repository: ghcr.io/barikpriyabrata27/bitwise-devops-kubernates
  tag: latest

service:
  type: NodePort
  port: 5000
  nodePort: 30080
```

---

# 36. Your Current Deployment vs Helm

## Current approach

```text
deployment.yaml
service.yaml
       ↓
kubectl apply
       ↓
Kubernetes
```

## Helm approach

```text
values.yaml
     +
templates/
     +
Chart.yaml
     ↓
Helm
     ↓
Rendered Kubernetes YAML
     ↓
Kubernetes
```

---

# 37. Helm and Kubernetes Namespaces

You can deploy a release into a namespace:

```bash
helm install python-app ./python-app \
  --namespace production \
  --create-namespace
```

Then:

```bash
helm list -n production
```

and:

```bash
kubectl get pods -n production
```

The release belongs to that namespace.

---

# 38. Helm and Secrets

Helm can template Kubernetes Secret resources.

Example:

```yaml
apiVersion: v1
kind: Secret

metadata:
  name: {{ include "python-app.fullname" . }}

type: Opaque

stringData:
  username: {{ .Values.database.username | quote }}
```

However:

**Do not treat `values.yaml` as a secure secret store.**

Avoid committing plaintext production passwords to Git.

For production environments, consider dedicated secret-management systems such as:

```text
External Secrets
Vault
Cloud secret managers
Sealed Secrets
```

---

# 39. Helm Hooks

Helm supports lifecycle hooks.

Examples include:

```text
pre-install
post-install
pre-upgrade
post-upgrade
pre-delete
post-delete
```

Hooks can be used for tasks such as:

```text
Database migration
Initialization
Post-deployment tasks
```

Use hooks carefully because they introduce additional deployment behavior.

---

# 40. Helm Template Functions

Helm templates provide many functions.

Examples:

```yaml
{{ quote .Values.name }}
```

```yaml
{{ default "python-app" .Values.name }}
```

```yaml
{{ required "image.tag is required" .Values.image.tag }}
```

```yaml
{{ .Values.name | upper }}
```

The pipe:

```text
|
```

passes the result of one function into another.

Example:

```yaml
{{ .Values.name | quote }}
```

---

# 41. Conditionals

You can conditionally create resources.

Example:

```yaml
{{- if .Values.ingress.enabled }}

apiVersion: networking.k8s.io/v1
kind: Ingress

...

{{- end }}
```

Values:

```yaml
ingress:
  enabled: true
```

If:

```yaml
enabled: false
```

the Ingress isn't rendered.

---

# 42. Loops

Helm templates support iteration.

Example:

```yaml
{{- range .Values.env }}

- name: {{ .name }}
  value: {{ .value | quote }}

{{- end }}
```

Values:

```yaml
env:
  - name: APP_ENV
    value: production

  - name: LOG_LEVEL
    value: info
```

This can generate:

```yaml
- name: APP_ENV
  value: "production"

- name: LOG_LEVEL
  value: "info"
```

---

# 43. `toYaml`

A very useful Helm function:

```yaml
{{- toYaml .Values.resources | nindent 12 }}
```

Values:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi

  limits:
    cpu: 500m
    memory: 512Mi
```

This allows structured YAML from `values.yaml` to be inserted into templates.

---

# 44. `include`

Reusable helpers can be called with:

```yaml
{{ include "python-app.fullname" . }}
```

This is frequently used for:

```text
names
labels
selectors
annotations
```

---

# 45. Helm Dependency Management

Modern charts can declare dependencies in `Chart.yaml`.

Conceptually:

```yaml
dependencies:
  - name: redis
    version: "..."
    repository: "..."
```

Then:

```bash
helm dependency update
```

Helm retrieves the required chart dependencies.

---

# 46. Subcharts

Suppose your application uses Redis.

You could have:

```text
parent chart
   |
   +-- application
   |
   +-- redis subchart
```

The parent chart can provide configuration for the subchart.

This is useful for complex application stacks.

---

# 47. Helm Repository vs Container Registry

Do not confuse these.

## Container Registry

Stores container images:

```text
GHCR
Docker Hub
ECR
GCR
ACR
```

Example:

```text
ghcr.io/company/python-app:1.2.0
```

## Helm Chart Repository / OCI Registry

Stores Helm charts.

Example conceptually:

```text
company/python-app
```

A chart can be packaged as:

```text
python-app-1.2.0.tgz
```

So:

```text
Container Registry
        ↓
Container Images

Helm Repository / OCI Registry
        ↓
Helm Charts
```

---

# 48. Helm in CI/CD

A typical CI/CD pipeline can look like:

```text
Developer
    ↓
Git Push
    ↓
GitHub
    ↓
CI
    |
    +-- Test
    |
    +-- Docker Build
    |
    +-- Push Image
    |
    ▼
   GHCR
    |
    ▼
   CD
    |
    +-- Helm Lint
    |
    +-- Helm Template
    |
    +-- Helm Upgrade --Install
    |
    ▼
Kubernetes
    |
    ▼
Pods
```

---

# 49. Recommended Helm CD Pipeline

A production-oriented sequence could be:

```bash
helm lint ./helm/python-app

helm template python-app ./helm/python-app \
  -f ./helm/python-app/values-prod.yaml

helm upgrade --install python-app ./helm/python-app \
  --namespace production \
  --create-namespace \
  -f ./helm/python-app/values-prod.yaml \
  --wait \
  --timeout 5m
```

Then verify:

```bash
kubectl get pods -n production
```

and:

```bash
kubectl rollout status deployment/python-app \
  -n production
```

---

# 50. Helm `--wait`

When using:

```bash
helm upgrade --install ... --wait
```

Helm waits for resources to reach their expected ready state before considering the operation successful, subject to the timeout.

This can be useful in CI/CD.

However, application-level validation is still useful.

For example:

```text
Helm deployment successful
        ↓
Pods ready
        ↓
Smoke test
        ↓
Application actually responds
```

---

# 51. Helm + Smoke Tests

Your current project already has a smoke test.

Currently:

```text
kubectl deployment
      ↓
port-forward
      ↓
/healthz
      ↓
/
      ↓
/metrics
```

With Helm:

```text
helm upgrade --install
        ↓
Kubernetes rollout
        ↓
Smoke test
        ↓
Application validation
```

So Helm does not eliminate your smoke test.

It changes how the Kubernetes resources are deployed.

---

# 52. Helm Rollback vs Kubernetes Rollout

These are related but different.

Kubernetes:

```bash
kubectl rollout undo deployment/python-app
```

works with Deployment revisions.

Helm:

```bash
helm rollback python-app 2
```

rolls back the Helm release to an earlier revision.

If Helm manages the deployment, Helm rollback is usually the higher-level deployment operation.

---

# 53. Helm Revision

Every release has revisions.

Example:

```text
Revision 1
    ↓
helm install

Revision 2
    ↓
helm upgrade

Revision 3
    ↓
helm upgrade

Revision 4
    ↓
helm upgrade
```

You can inspect them:

```bash
helm history python-app
```

This gives Helm its release-management capability.

---

# 54. Helm Does Not Replace Kubernetes

Helm is not a Kubernetes cluster.

Helm does not:

```text
run containers
schedule pods
provide networking
manage nodes
```

Kubernetes does those things.

Helm primarily helps you:

```text
package
template
install
upgrade
rollback
manage
```

Kubernetes applications.

---

# 55. Helm Does Not Replace kubectl

They have different purposes.

### kubectl

Direct Kubernetes management:

```bash
kubectl get pods
kubectl describe pod
kubectl logs
kubectl delete pod
kubectl apply
```

### Helm

Application release management:

```bash
helm install
helm upgrade
helm rollback
helm history
helm status
```

You will normally use both.

---

# 56. Helm Mental Model

The most useful mental model is:

```text
                    Helm
                      |
          +-----------+-----------+
          |                       |
          ▼                       ▼
       Chart                   Release
          |                       |
          |                 installed instance
          |
     +----+----+
     |         |
     ▼         ▼
Templates    Values
     |         |
     +----+----+
          |
          ▼
    Rendered YAML
          |
          ▼
     Kubernetes
          |
          ▼
         Pods
```

---

# 57. Most Important Files

Remember these first:

```text
Chart.yaml
    ↓
Information about the chart

values.yaml
    ↓
Default configuration

templates/
    ↓
Kubernetes resource templates

charts/
    ↓
Dependencies / subcharts

templates/_helpers.tpl
    ↓
Reusable template helpers

templates/NOTES.txt
    ↓
Post-install user instructions
```

---

# 58. Most Important Commands

Learn these first:

```bash
helm version
```

```bash
helm create python-app
```

```bash
helm lint ./python-app
```

```bash
helm template python-app ./python-app
```

```bash
helm install python-app ./python-app
```

```bash
helm list
```

```bash
helm status python-app
```

```bash
helm get values python-app
```

```bash
helm get manifest python-app
```

```bash
helm upgrade python-app ./python-app
```

```bash
helm upgrade --install python-app ./python-app
```

```bash
helm history python-app
```

```bash
helm rollback python-app 1
```

```bash
helm uninstall python-app
```

---

# 59. Helm Learning Sequence

Do not try to learn everything simultaneously.

Use this sequence:

## Level 1 — Fundamentals

Learn:

```text
Helm
Chart
Release
values.yaml
templates/
Chart.yaml
```

---

## Level 2 — Templates

Learn:

```text
.Values
.Release
.Chart
{{ }}
if
range
include
define
```

---

## Level 3 — Operations

Learn:

```text
install
upgrade
rollback
history
status
get
uninstall
```

---

## Level 4 — Environment Management

Learn:

```text
values-dev.yaml
values-staging.yaml
values-prod.yaml
```

---

## Level 5 — Advanced

Learn:

```text
Dependencies
Subcharts
Hooks
OCI registries
Chart signing
Schema validation
Library charts
Security
CI/CD
```

---

# 60. Practical Exercise for Your Project

Your current project is an excellent candidate for converting to Helm.

Current:

```text
k8s/
├── deployment.yaml
└── service.yaml
```

Create:

```text
helm/
└── python-app/
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
        ├── deployment.yaml
        ├── service.yaml
        └── _helpers.tpl
```

Start with:

```bash
helm create python-app
```

Then simplify the generated chart.

Move your existing Kubernetes Deployment into:

```text
templates/deployment.yaml
```

Move your Service into:

```text
templates/service.yaml
```

Convert hard-coded values such as:

```yaml
replicas: 4
```

into:

```yaml
replicas: {{ .Values.replicaCount }}
```

Convert:

```yaml
image: ghcr.io/barikpriyabrata27/bitwise-devops-kubernates:latest
```

into:

```yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

Then put:

```yaml
replicaCount: 4

image:
  repository: ghcr.io/barikpriyabrata27/bitwise-devops-kubernates
  tag: latest
```

in:

```text
values.yaml
```

Test:

```bash
helm lint ./helm/python-app
```

Then:

```bash
helm template python-app ./helm/python-app
```

Inspect the generated YAML.

Finally:

```bash
helm upgrade --install python-app ./helm/python-app
```

---

# 61. The One Sentence to Remember

If you remember only one thing:

> **A Helm chart is a reusable, configurable package of Kubernetes resource templates that Helm renders and manages as a release.**

And remember the complete DevOps relationship:

```text
             APPLICATION
                  │
                  ▼
             Dockerfile
                  │
                  ▼
            Docker Image
                  │
                  ▼
                 GHCR
                  │
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   Kubernetes           Helm Chart
   Resources            Templates
                            │
                            ▼
                     Helm Release
                            │
                            ▼
                       Kubernetes
                            │
                            ▼
                           Pods
```

### Docker

**Packages the application.**

### GHCR

**Stores the container image.**

### Helm

**Packages/manages the Kubernetes application deployment.**

### Kubernetes

**Runs the application.**

---

# 62. Official References

For continued learning, use the official Helm documentation:

* Helm documentation: https://helm.sh/docs/
* Chart template guide: https://helm.sh/docs/chart_template_guide/
* Chart best practices: https://helm.sh/docs/chart_best_practices/
* Helm commands: https://helm.sh/docs/helm/

The official documentation is the best reference for current Helm behavior, syntax, and best practices.
