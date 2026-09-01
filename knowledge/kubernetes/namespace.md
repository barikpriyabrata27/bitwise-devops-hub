# Kubernetes Namespaces --- Complete Study & Reference Guide

> A practical, detailed guide to Kubernetes Namespaces: concepts,
> architecture, YAML, commands, RBAC, quotas, networking, security,
> troubleshooting, production practices, and interview questions.

------------------------------------------------------------------------

## 1. What Is a Kubernetes Namespace?

A **Namespace** is a Kubernetes API mechanism used to logically isolate
and organize resources inside a single Kubernetes cluster.

Think of a cluster as a large building:

-   **Cluster** = the entire building
-   **Namespace** = a separate room/floor
-   **Pod/Deployment/Service** = objects inside the room
-   **RBAC** = who is allowed to enter or modify things
-   **ResourceQuota** = how much electricity/water/space the room may
    consume
-   **LimitRange** = default/min/max resource rules for objects in the
    room

Namespaces are primarily useful for:

1.  Multi-team environments
2.  Environment separation
3.  Access control
4.  Resource quotas
5.  Policy application
6.  Operational organization
7.  Avoiding naming collisions

A namespace is **not a VM, container, or network by itself**. It is a
logical scope for Kubernetes API objects.

------------------------------------------------------------------------

# 2. Why Do We Need Namespaces?

Without namespaces, many resources would share one global namespace.

For example, two teams might both want:

``` yaml
metadata:
  name: api
```

Namespaces allow:

``` text
team-a/api
team-b/api
```

Both can exist simultaneously because the names are unique **within
their respective namespaces**.

Namespaces therefore provide a scope such as:

``` text
cluster
├── namespace: development
│   ├── deployment/api
│   ├── service/api
│   └── configmap/app-config
│
├── namespace: staging
│   ├── deployment/api
│   ├── service/api
│   └── configmap/app-config
│
└── namespace: production
    ├── deployment/api
    ├── service/api
    └── configmap/app-config
```

------------------------------------------------------------------------

# 3. Namespace vs Cluster

A Kubernetes cluster is the complete Kubernetes environment.

A namespace is a logical partition inside that cluster.

``` text
Kubernetes Cluster
│
├── Namespace A
│   ├── Pods
│   ├── Deployments
│   ├── Services
│   └── ConfigMaps
│
├── Namespace B
│   ├── Pods
│   ├── Deployments
│   ├── Services
│   └── Secrets
│
└── Namespace C
    └── ...
```

A namespace does **not** create separate:

-   Kubernetes control planes
-   Worker nodes
-   Kernels
-   Virtual networks
-   Physical infrastructure

Unless additional technologies/policies are configured, workloads in
different namespaces can still communicate with each other.

------------------------------------------------------------------------

# 4. Namespace Is an API Scope

This is one of the most important concepts.

Some Kubernetes resources are **namespaced**.

Examples:

-   Pod
-   Deployment
-   ReplicaSet
-   Service
-   ConfigMap
-   Secret
-   ServiceAccount
-   Role
-   RoleBinding
-   Job
-   CronJob
-   StatefulSet
-   PersistentVolumeClaim
-   NetworkPolicy

Other resources are **cluster-scoped**.

Examples:

-   Node
-   Namespace
-   PersistentVolume
-   ClusterRole
-   ClusterRoleBinding
-   StorageClass
-   CustomResourceDefinition
-   ClusterIssuer (when defined as a cluster-scoped CRD)

The distinction can be checked with:

``` bash
kubectl api-resources
```

You will see a column indicating whether a resource is namespaced.

------------------------------------------------------------------------

# 5. Namespaced vs Cluster-Scoped Resources

## Namespaced resource

Example:

``` yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: application-config
  namespace: development
```

The ConfigMap belongs to:

``` text
development/application-config
```

Another namespace can have:

``` text
production/application-config
```

------------------------------------------------------------------------

## Cluster-scoped resource

A Node is not inside a namespace:

``` bash
kubectl get nodes
```

You do not use:

``` bash
kubectl get nodes -n production
```

because Nodes are cluster-scoped.

Likewise:

``` bash
kubectl get persistentvolumes
kubectl get storageclass
kubectl get clusterroles
```

are cluster-level operations.

------------------------------------------------------------------------

# 6. Default Namespaces

A Kubernetes cluster commonly contains:

``` bash
kubectl get namespaces
```

Typical namespaces include:

``` text
default
kube-system
kube-public
kube-node-lease
```

## default

The `default` namespace exists so that users can create resources
without explicitly choosing a namespace.

For example:

``` bash
kubectl create deployment nginx --image=nginx
```

normally creates the Deployment in:

``` text
default
```

## kube-system

Contains Kubernetes system components and other cluster-level
infrastructure workloads.

Examples can include:

-   CoreDNS
-   kube-proxy
-   metrics components
-   cloud-provider components
-   networking components

Exact contents depend on the Kubernetes distribution and installed
components.

## kube-public

A namespace intended for publicly readable information.

It is generally not where application workloads should be deployed.

## kube-node-lease

Contains Lease objects associated with Nodes. These help Kubernetes
track node heartbeats efficiently.

------------------------------------------------------------------------

# 7. Creating a Namespace

## Imperative method

``` bash
kubectl create namespace development
```

Short form:

``` bash
kubectl create ns development
```

------------------------------------------------------------------------

## Declarative method

Create:

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
```

Save it as:

``` text
namespace.yaml
```

Apply:

``` bash
kubectl apply -f namespace.yaml
```

Verify:

``` bash
kubectl get namespace
```

------------------------------------------------------------------------

# 8. Namespace YAML Explained

Example:

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
```

### apiVersion

Namespace is part of the core Kubernetes API:

``` yaml
apiVersion: v1
```

### kind

``` yaml
kind: Namespace
```

### metadata.name

``` yaml
metadata:
  name: development
```

This creates:

``` text
Namespace: development
```

------------------------------------------------------------------------

# 9. Namespace Lifecycle

A namespace normally goes through:

``` text
Active
  |
  | deletion requested
  v
Terminating
  |
  | resources/finalizers cleaned up
  v
Deleted
```

Check:

``` bash
kubectl get ns
```

Example:

``` text
NAME           STATUS        AGE
development    Active        10m
production     Active        2h
old-project    Terminating   5m
```

------------------------------------------------------------------------

# 10. Deleting a Namespace

``` bash
kubectl delete namespace development
```

This is a **dangerous command**.

Deleting a namespace generally causes namespaced resources within it to
be deleted as part of namespace cleanup.

For example:

``` text
development
├── Deployment
├── Pods
├── Services
├── ConfigMaps
├── Secrets
├── Jobs
└── PVCs
```

can be affected when the namespace is deleted.

Always verify the namespace before executing destructive commands.

------------------------------------------------------------------------

# 11. The `-n` / `--namespace` Option

Most namespaced kubectl commands support:

``` bash
-n <namespace>
```

Example:

``` bash
kubectl get pods -n development
```

Equivalent:

``` bash
kubectl get pods --namespace=development
```

Deployment:

``` bash
kubectl get deployments -n production
```

Services:

``` bash
kubectl get services -n production
```

ConfigMaps:

``` bash
kubectl get configmaps -n production
```

------------------------------------------------------------------------

# 12. Listing Resources Across All Namespaces

Use:

``` bash
kubectl get pods -A
```

or:

``` bash
kubectl get pods --all-namespaces
```

Example:

``` text
NAMESPACE       NAME                         READY
default         frontend-abc                 1/1
development     api-xyz                      2/2
production      payment-service-123          3/3
kube-system     coredns-xxxx                 1/1
```

This is extremely useful for troubleshooting.

------------------------------------------------------------------------

# 13. Current kubectl Namespace

You can check your current context:

``` bash
kubectl config current-context
```

View contexts:

``` bash
kubectl config get-contexts
```

The namespace is part of the Kubernetes context configuration.

A context conceptually contains:

``` text
Context
├── Cluster
├── User
└── Namespace
```

------------------------------------------------------------------------

# 14. Setting a Default Namespace for a Context

Instead of repeatedly typing:

``` bash
kubectl get pods -n development
```

you can configure the current context:

``` bash
kubectl config set-context --current --namespace=development
```

Now:

``` bash
kubectl get pods
```

will operate in:

``` text
development
```

Check:

``` bash
kubectl config view --minify
```

------------------------------------------------------------------------

# 15. Important: Default Namespace Is a kubectl Context Setting

This does **not** mean the cluster has changed.

It only changes the namespace kubectl uses by default for that context.

For example:

``` text
Cluster
│
├── development
├── staging
└── production
```

Your kubectl context might point to:

``` text
cluster = my-cluster
user = admin
namespace = development
```

Changing the context namespace does not move resources.

------------------------------------------------------------------------

# 16. Creating an Application in a Namespace

Example:

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: development
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:stable
          ports:
            - containerPort: 80
```

Apply:

``` bash
kubectl apply -f deployment.yaml
```

Check:

``` bash
kubectl get deployment -n development
kubectl get pods -n development
```

------------------------------------------------------------------------

# 17. Namespace Does Not Automatically Apply to Child Objects in Every Situation

This is a common YAML misunderstanding.

If you specify:

``` yaml
metadata:
  namespace: development
```

on a Deployment, the Deployment is in `development`.

The Pods created by that Deployment are also created in the Deployment's
namespace.

Conceptually:

``` text
Deployment development/web
        |
        v
ReplicaSet development/web-xxxxx
        |
        v
Pods development/web-xxxxx
```

You normally do not need to specify the namespace separately in the Pod
template.

------------------------------------------------------------------------

# 18. Services and Namespaces

Services are namespaced.

Suppose:

``` text
development/api
production/api
```

Both can exist.

A Service name alone is therefore not globally unique.

The DNS identity normally includes the namespace:

``` text
api.development.svc.cluster.local
```

and:

``` text
api.production.svc.cluster.local
```

This is extremely important for service discovery.

------------------------------------------------------------------------

# 19. Namespace and Kubernetes DNS

Kubernetes DNS commonly follows this pattern:

``` text
<service>.<namespace>.svc.<cluster-domain>
```

Example:

``` text
api.development.svc.cluster.local
```

Breakdown:

``` text
api
│
└── Service name

development
│
└── Namespace

svc
│
└── Service DNS zone

cluster.local
│
└── Cluster DNS domain (commonly configured this way)
```

The actual cluster domain can differ.

------------------------------------------------------------------------

# 20. Short DNS Names

From a Pod in the same namespace:

``` text
api
```

may resolve to the Service.

From another namespace, you can use:

``` text
api.development
```

or:

``` text
api.development.svc
```

or the full name:

``` text
api.development.svc.cluster.local
```

Exact search-domain behavior is provided through the Pod's DNS
configuration.

------------------------------------------------------------------------

# 21. Namespace Does NOT Equal Network Isolation

This is one of the most important interview concepts.

Creating:

``` text
namespace-a
namespace-b
```

does **not automatically block network traffic** between them.

For example:

``` text
Pod A
namespace-a
    |
    | network traffic
    v
Pod B
namespace-b
```

Whether this traffic is allowed depends on the networking implementation
and policies.

To restrict traffic, Kubernetes **NetworkPolicy** can be used when
supported by the cluster's network plugin.

------------------------------------------------------------------------

# 22. Namespace vs NetworkPolicy

Think of the distinction:

``` text
Namespace
    =
logical/API organization

NetworkPolicy
    =
network traffic authorization
```

Example:

``` text
Namespace: production
    |
    +-- API Pods
    +-- Database Pods
    +-- Frontend Pods

NetworkPolicy:
    frontend -> api       ALLOW
    api      -> database  ALLOW
    frontend -> database  DENY
```

The namespace alone does not express those traffic rules.

------------------------------------------------------------------------

# 23. Namespace and RBAC

Namespaces work closely with Kubernetes RBAC.

A:

``` text
Role
```

is namespaced.

A:

``` text
RoleBinding
```

is namespaced.

A:

``` text
ClusterRole
```

is cluster-scoped.

A:

``` text
ClusterRoleBinding
```

is cluster-scoped.

Example:

``` text
Namespace: development

Role
  |
  v
RoleBinding
  |
  v
User/ServiceAccount
```

This can give a user permissions only within `development`.

------------------------------------------------------------------------

# 24. Role Example

``` yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: development
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
```

This Role allows reading Pods in `development`.

It does not automatically grant permissions in:

``` text
production
staging
```

------------------------------------------------------------------------

# 25. RoleBinding Example

``` yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
  namespace: development
subjects:
  - kind: User
    name: developer
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

The binding associates the Role with a user.

------------------------------------------------------------------------

# 26. Role vs ClusterRole

## Role

Namespace-scoped authorization rules.

``` text
Role
  |
  +-- development
```

## ClusterRole

Cluster-scoped authorization object.

It can define permissions that are used through:

-   ClusterRoleBinding
-   RoleBinding

A ClusterRole can therefore be reused to grant permissions within a
particular namespace through a RoleBinding.

------------------------------------------------------------------------

# 27. ResourceQuota

Namespaces are commonly combined with **ResourceQuota**.

ResourceQuota limits aggregate resource consumption within a namespace.

Example:

``` yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: development
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
```

This establishes namespace-level aggregate limits.

------------------------------------------------------------------------

# 28. ResourceQuota Mental Model

Suppose:

``` text
development quota:
CPU requests = 4
Memory requests = 8Gi
```

Workloads inside that namespace collectively consume from the quota.

``` text
Namespace development
│
├── Pod A
│   ├── CPU request: 1
│   └── Memory request: 2Gi
│
├── Pod B
│   ├── CPU request: 2
│   └── Memory request: 4Gi
│
└── Remaining
    ├── CPU request: 1
    └── Memory: 2Gi
```

------------------------------------------------------------------------

# 29. LimitRange

`LimitRange` applies constraints/defaults to individual resources in a
namespace.

Example:

``` yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: resource-limits
  namespace: development
spec:
  limits:
    - type: Container
      default:
        cpu: "500m"
        memory: "512Mi"
      defaultRequest:
        cpu: "100m"
        memory: "128Mi"
      max:
        cpu: "2"
        memory: 2Gi
```

It can establish:

-   Default requests
-   Default limits
-   Maximum values
-   Minimum values

depending on configuration.

------------------------------------------------------------------------

# 30. ResourceQuota vs LimitRange

  -----------------------------------------------------------------------
  Feature                 ResourceQuota           LimitRange
  ----------------------- ----------------------- -----------------------
  Scope                   Namespace               Namespace

  Main purpose            Aggregate resource      Per-object/container
                          consumption             constraints/defaults

  Example                 Namespace max 20 CPU    Container max 2 CPU

  Controls totals         Yes                     No

  Sets defaults           No                      Yes
  -----------------------------------------------------------------------

They are often used together.

------------------------------------------------------------------------

# 31. Namespace and Secrets

Secrets are namespaced.

Example:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
  namespace: production
type: Opaque
```

A Pod in `production` can reference that Secret by name.

A Pod in another namespace cannot simply reference:

``` text
database-secret
```

as if it were a cluster-wide Secret.

Secrets are API objects with namespace scope.

------------------------------------------------------------------------

# 32. Namespace and ConfigMaps

ConfigMaps are also namespaced.

``` text
development/app-config
production/app-config
```

These can have the same name because they belong to different
namespaces.

------------------------------------------------------------------------

# 33. Namespace and ServiceAccounts

ServiceAccounts are namespaced.

Example:

``` bash
kubectl create serviceaccount app-sa -n development
```

A Pod can use:

``` yaml
spec:
  serviceAccountName: app-sa
```

The ServiceAccount must exist in the Pod's namespace.

------------------------------------------------------------------------

# 34. Namespace and PersistentVolumeClaims

PVCs are namespaced.

``` text
production/my-pvc
```

A PVC belongs to a namespace.

PersistentVolumes (PVs), however, are cluster-scoped.

This creates an important relationship:

``` text
Namespace
   |
   +-- PVC
          |
          v
       PersistentVolume
       (cluster-scoped)
```

------------------------------------------------------------------------

# 35. Namespace and Persistent Volumes

Remember:

``` text
PVC = namespaced
PV  = cluster-scoped
```

Example:

``` bash
kubectl get pvc -n production
kubectl get pv
```

Not:

``` bash
kubectl get pv -n production
```

because PVs are not namespaced.

------------------------------------------------------------------------

# 36. Namespace and Nodes

Nodes are cluster-scoped.

A Pod belongs to a namespace.

A Node does not.

Therefore:

``` text
Node-1
│
├── Pod A (development)
├── Pod B (production)
└── Pod C (staging)
```

A single node can host Pods from many namespaces.

------------------------------------------------------------------------

# 37. Namespace Does Not Create Dedicated Nodes

This:

``` text
production namespace
```

does not automatically mean:

``` text
production nodes
```

If you need workload placement, use mechanisms such as:

-   node labels
-   node affinity
-   pod affinity/anti-affinity
-   taints
-   tolerations
-   topology spread constraints

Example:

``` yaml
spec:
  nodeSelector:
    workload: production
```

------------------------------------------------------------------------

# 38. Namespace and Scheduling

The Kubernetes scheduler does not schedule "a namespace."

It schedules Pods.

Namespace-level policies can influence what Pods are allowed to request
or create, but scheduling ultimately operates on Pods and cluster
resources.

------------------------------------------------------------------------

# 39. Namespace Labels

Namespaces can have labels.

Example:

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    environment: production
    team: payments
```

Labels are useful for:

-   Policy selection
-   Organization
-   Automation
-   NetworkPolicy selectors
-   Admission policies
-   Reporting

------------------------------------------------------------------------

# 40. Namespace Annotations

Namespaces can also contain annotations.

Example:

``` yaml
metadata:
  name: production
  annotations:
    owner: payments-team
```

Annotations are metadata intended for tools/controllers rather than
label-based selection.

------------------------------------------------------------------------

# 41. Labels vs Annotations

## Labels

Used for identifying/selecting objects.

Example:

``` yaml
labels:
  environment: production
```

A selector can match:

``` text
environment=production
```

## Annotations

Used for arbitrary metadata.

Example:

``` yaml
annotations:
  owner: payments-team
```

Annotations are generally not used for label selectors.

------------------------------------------------------------------------

# 42. Namespace Selectors in NetworkPolicy

Namespace labels become particularly useful with NetworkPolicy.

Example:

``` yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-production
  namespace: database
spec:
  podSelector:
    matchLabels:
      app: postgres
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              environment: production
```

This means traffic can be selected based on namespace labels, assuming
the network implementation enforces the NetworkPolicy.

------------------------------------------------------------------------

# 43. Namespace Selector vs Pod Selector

A NetworkPolicy can use:

``` yaml
namespaceSelector:
```

to select namespaces.

It can use:

``` yaml
podSelector:
```

to select Pods.

It can combine them.

This is powerful for defining rules such as:

``` text
Allow Pods labeled app=api
from namespaces labeled environment=production
```

------------------------------------------------------------------------

# 44. Namespace Isolation Pattern

A common production model:

``` text
cluster
│
├── ingress
│
├── monitoring
│
├── development
│
├── staging
│
└── production
```

Each namespace can have:

-   RBAC
-   ResourceQuota
-   LimitRange
-   NetworkPolicy
-   application workloads
-   ConfigMaps
-   Secrets
-   Services

------------------------------------------------------------------------

# 45. Environment Namespaces

One possible model:

``` text
development
staging
production
```

This is simple and easy to understand.

But it is not automatically the best design.

For large organizations, team-oriented namespaces can sometimes be
better:

``` text
payments-dev
payments-prod
orders-dev
orders-prod
```

or combinations based on organizational boundaries.

------------------------------------------------------------------------

# 46. Namespace Design Principles

Good namespace design should consider:

1.  Ownership
2.  Security boundary
3.  RBAC boundary
4.  Resource management
5.  Deployment lifecycle
6.  Operational responsibility
7.  Network policies
8.  Cost allocation
9.  Compliance requirements

Do not create namespaces merely because "more namespaces is better."

------------------------------------------------------------------------

# 47. Namespace Is Not a Hard Security Boundary

Namespaces improve logical isolation, but they should not automatically
be treated as equivalent to:

-   separate clusters
-   separate cloud accounts
-   separate VPCs
-   separate physical infrastructure

For strong isolation requirements, separate clusters or
infrastructure-level controls may be appropriate.

------------------------------------------------------------------------

# 48. Namespace vs Separate Cluster

## Namespace

Advantages:

-   Lower overhead
-   Shared control plane
-   Shared worker infrastructure
-   Easy resource sharing
-   Convenient multi-tenancy

Disadvantages:

-   Weaker isolation than separate clusters
-   Shared cluster failure domain
-   Shared cluster control plane
-   Requires careful RBAC and policy configuration

## Separate cluster

Advantages:

-   Stronger isolation
-   Independent cluster lifecycle
-   Independent control-plane configuration
-   Reduced blast radius

Disadvantages:

-   Higher cost
-   More operational overhead
-   More infrastructure to maintain

------------------------------------------------------------------------

# 49. Multi-Tenancy

Namespaces are often used for **soft multi-tenancy**.

Example:

``` text
Cluster
│
├── Team A namespace
│
├── Team B namespace
│
└── Team C namespace
```

Controls can include:

``` text
RBAC
+
ResourceQuota
+
LimitRange
+
NetworkPolicy
+
Admission policies
+
Pod Security controls
```

A secure multi-tenant design usually requires several controls together.

------------------------------------------------------------------------

# 50. Pod Security and Namespaces

Modern Kubernetes supports **Pod Security Admission**.

Namespaces can be labeled to define Pod Security Standards enforcement
levels.

Typical levels are:

``` text
privileged
baseline
restricted
```

Example:

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
```

The exact policy behavior depends on the configured Kubernetes version
and admission configuration.

------------------------------------------------------------------------

# 51. Pod Security Namespace Labels

Common label forms include:

``` text
pod-security.kubernetes.io/enforce
pod-security.kubernetes.io/audit
pod-security.kubernetes.io/warn
```

Values can include:

``` text
privileged
baseline
restricted
```

These provide different enforcement/audit/warning behaviors.

------------------------------------------------------------------------

# 52. Namespace Finalizers

A namespace can have finalizers.

Finalizers allow controllers to perform cleanup before an object is
completely removed.

During deletion, you may see:

``` text
STATUS: Terminating
```

for a long time.

One possible reason is a finalizer that cannot complete.

------------------------------------------------------------------------

# 53. Why Can a Namespace Get Stuck in Terminating?

Common causes include:

-   Resources that cannot be deleted
-   API discovery problems
-   Broken/unavailable aggregated APIs
-   Controllers that are no longer functioning
-   Finalizers that cannot complete
-   Custom resources/controllers with cleanup dependencies

Do not immediately remove finalizers blindly.

First determine why cleanup is blocked.

------------------------------------------------------------------------

# 54. Inspect a Namespace

``` bash
kubectl describe namespace development
```

Or:

``` bash
kubectl get namespace development -o yaml
```

Look for:

``` yaml
metadata:
  finalizers:
```

and:

``` yaml
status:
  phase: Terminating
```

------------------------------------------------------------------------

# 55. Finding Resources in a Namespace

Basic:

``` bash
kubectl get all -n development
```

Important caveat:

`kubectl get all` does **not** literally mean every resource type.

It is a convenience collection of commonly used resources.

For deeper investigation, enumerate API resources:

``` bash
kubectl api-resources --verbs=list --namespaced -o name
```

Then query relevant resources.

------------------------------------------------------------------------

# 56. Find Namespaced Resource Types

Useful command:

``` bash
kubectl api-resources --namespaced=true
```

Cluster-scoped:

``` bash
kubectl api-resources --namespaced=false
```

This is an excellent troubleshooting and learning command.

------------------------------------------------------------------------

# 57. Query Every Namespaced Resource

A common diagnostic pattern:

``` bash
for resource in $(kubectl api-resources --namespaced=true --verbs=list -o name); do
  kubectl get "$resource" -n development --ignore-not-found
done
```

This can help locate objects that are preventing namespace cleanup.

The exact behavior can vary with custom resources and API discovery.

------------------------------------------------------------------------

# 58. Namespace and ResourceQuota Inspection

``` bash
kubectl get resourcequota -n development
```

Detailed:

``` bash
kubectl describe resourcequota -n development
```

You may see:

``` text
Resource      Used    Hard
requests.cpu  2       4
requests.mem  4Gi     8Gi
```

------------------------------------------------------------------------

# 59. Namespace and LimitRange Inspection

``` bash
kubectl get limitrange -n development
```

Detailed:

``` bash
kubectl describe limitrange -n development
```

This is useful when a Pod creation request unexpectedly fails because of
resource constraints/defaults.

------------------------------------------------------------------------

# 60. Namespace and RBAC Troubleshooting

Check Roles:

``` bash
kubectl get roles -n development
```

RoleBindings:

``` bash
kubectl get rolebindings -n development
```

Check permissions:

``` bash
kubectl auth can-i get pods -n development
```

As a particular user:

``` bash
kubectl auth can-i get pods \
  -n development \
  --as=developer
```

------------------------------------------------------------------------

# 61. Namespace and Service Troubleshooting

List services:

``` bash
kubectl get svc -n development
```

Inspect:

``` bash
kubectl describe svc api -n development
```

Check EndpointSlices:

``` bash
kubectl get endpointslices -n development
```

This helps distinguish application/service problems from namespace
issues.

------------------------------------------------------------------------

# 62. Namespace and Events

Events are often useful:

``` bash
kubectl get events -n development
```

Sort by creation time:

``` bash
kubectl get events -n development \
  --sort-by='.lastTimestamp'
```

Depending on Kubernetes version and event representation, fields may
vary.

------------------------------------------------------------------------

# 63. Namespace and Pods

List:

``` bash
kubectl get pods -n development
```

Wide output:

``` bash
kubectl get pods -n development -o wide
```

Detailed:

``` bash
kubectl describe pod <pod-name> -n development
```

Logs:

``` bash
kubectl logs <pod-name> -n development
```

------------------------------------------------------------------------

# 64. Namespace and Deployments

``` bash
kubectl get deployments -n development
```

Detailed:

``` bash
kubectl describe deployment web -n development
```

Rollout:

``` bash
kubectl rollout status deployment/web -n development
```

History:

``` bash
kubectl rollout history deployment/web -n development
```

------------------------------------------------------------------------

# 65. Namespace and Jobs

``` bash
kubectl get jobs -n development
```

CronJobs:

``` bash
kubectl get cronjobs -n development
```

Describe:

``` bash
kubectl describe job <job-name> -n development
```

------------------------------------------------------------------------

# 66. Namespace and StatefulSets

``` bash
kubectl get statefulsets -n production
```

StatefulSets are namespaced.

Their Pods and associated namespaced objects are normally managed within
the same namespace.

------------------------------------------------------------------------

# 67. Namespace and Ingress

Ingress objects are namespaced.

Example:

``` bash
kubectl get ingress -n production
```

An Ingress normally references Services in the same namespace.

Cross-namespace references are not something to assume is universally
allowed; behavior depends on the API/controller and configuration.

------------------------------------------------------------------------

# 68. Namespace and Gateway API

Gateway API introduces resources with different scopes.

For example:

-   GatewayClass is cluster-scoped.
-   Gateway is typically namespaced.
-   HTTPRoute is typically namespaced.

This is another reason to learn resource scope rather than memorizing
only resource names.

------------------------------------------------------------------------

# 69. Namespace and Custom Resources

Custom Resources can be either:

-   namespaced
-   cluster-scoped

depending on the CustomResourceDefinition.

For example, a CRD might define:

``` yaml
spec:
  scope: Namespaced
```

or:

``` yaml
spec:
  scope: Cluster
```

You can inspect CRDs:

``` bash
kubectl get crd
```

------------------------------------------------------------------------

# 70. Namespace and Operators

Kubernetes operators may be installed:

-   in one namespace
-   across selected namespaces
-   cluster-wide

The operator's scope depends on how it is designed/configured.

For example:

``` text
operator namespace
    |
    +-- controller
    |
    +-- watches application namespaces
```

Do not assume that an operator only affects its own namespace.

------------------------------------------------------------------------

# 71. Namespace and Controllers

Controllers watch Kubernetes API resources.

Some controllers operate:

``` text
cluster-wide
```

Others watch:

``` text
specific namespaces
```

This is implementation-dependent.

A namespace is therefore an API visibility/scope mechanism, but
controller scope depends on controller configuration and permissions.

------------------------------------------------------------------------

# 72. Namespace and Admission Controllers

Admission controls can enforce namespace-specific requirements.

Examples:

-   Required labels
-   Allowed registries
-   Resource requirements
-   Security policies
-   Naming conventions
-   Approved configurations

Modern clusters may use:

-   built-in admission mechanisms
-   ValidatingAdmissionPolicy
-   external admission webhooks
-   policy engines

------------------------------------------------------------------------

# 73. Namespace Labels as Policy Inputs

A common architecture is:

``` text
Namespace
    |
    +-- labels
           |
           +-- admission policy
           +-- NetworkPolicy
           +-- Pod Security
           +-- automation
```

Example:

``` yaml
labels:
  environment: production
  team: payments
  security-tier: high
```

Policies/controllers can use those labels to determine behavior.

------------------------------------------------------------------------

# 74. Namespace and Cost Allocation

Namespaces can help organize cost reporting.

Example:

``` text
production
  team=payments

production
  team=orders
```

Resource consumption can be aggregated by namespace.

For accurate cost allocation, additional observability/cost tooling is
usually required.

Namespace itself does not automatically produce a cloud billing
boundary.

------------------------------------------------------------------------

# 75. Namespace and Resource Ownership

A useful convention:

``` yaml
metadata:
  labels:
    team: payments
    environment: production
```

This makes ownership easier to understand.

You can query:

``` bash
kubectl get ns \
  -l team=payments
```

------------------------------------------------------------------------

# 76. Namespace Naming Rules

Namespace names generally follow DNS-label style constraints.

Good examples:

``` text
development
staging
production
payments
payments-prod
team-a
```

Avoid confusing names such as:

``` text
My Production Namespace
```

Use lowercase, simple, predictable names.

------------------------------------------------------------------------

# 77. Naming Convention Example

One practical scheme:

``` text
<team>-<environment>
```

Examples:

``` text
payments-dev
payments-stage
payments-prod

orders-dev
orders-stage
orders-prod
```

Another scheme:

``` text
<environment>
```

with team labels:

``` text
production
  team=payments
```

The best choice depends on organizational and security requirements.

------------------------------------------------------------------------

# 78. Namespace and CI/CD

CI/CD pipelines frequently deploy to specific namespaces.

Example:

``` bash
kubectl apply -f manifests/ \
  --namespace=staging
```

Production:

``` bash
kubectl apply -f manifests/ \
  --namespace=production
```

This reduces the chance of accidentally deploying to the wrong
environment when combined with appropriate RBAC and pipeline controls.

------------------------------------------------------------------------

# 79. Namespace in Kubernetes Manifests

You can specify:

``` yaml
metadata:
  namespace: production
```

But many teams use tools such as:

-   Helm
-   Kustomize
-   GitOps systems

to determine namespaces at deployment time.

For example, the same base manifests can be promoted into:

``` text
development
staging
production
```

using environment-specific configuration.

------------------------------------------------------------------------

# 80. Namespace and Kustomize

A Kustomization can define:

``` yaml
namespace: development
```

This can apply a namespace transformation to namespaced resources.

This is useful when maintaining one base configuration and multiple
environments.

------------------------------------------------------------------------

# 81. Namespace and Helm

Helm releases are associated with namespaces.

Example:

``` bash
helm install my-app ./chart \
  --namespace production \
  --create-namespace
```

List releases:

``` bash
helm list -n production
```

Helm's namespace behavior and chart templates should still be understood
separately from Kubernetes namespace mechanics.

------------------------------------------------------------------------

# 82. Namespace and GitOps

GitOps systems commonly model:

``` text
Git repository
   |
   v
desired state
   |
   v
namespace
   |
   v
Kubernetes resources
```

Namespaces become useful deployment boundaries for teams/environments.

------------------------------------------------------------------------

# 83. Cross-Namespace Resource Access

A resource in one namespace can sometimes refer to another namespace's
resource through an explicit mechanism, but you should never assume that
all Kubernetes references are cross-namespace.

Examples:

-   DNS can resolve Services in other namespaces.
-   RBAC can grant permissions across namespaces.
-   NetworkPolicy can select Pods in other namespaces.
-   Some APIs explicitly prohibit cross-namespace references.

Always check the specific API.

------------------------------------------------------------------------

# 84. Cross-Namespace Service Communication

Suppose:

``` text
frontend
namespace: web
```

needs:

``` text
api
namespace: backend
```

The Service DNS can be:

``` text
api.backend.svc.cluster.local
```

Conceptually:

``` text
web/frontend
      |
      | DNS + network
      v
backend/api Service
      |
      v
backend/api Pods
```

NetworkPolicy may still deny the traffic.

------------------------------------------------------------------------

# 85. Namespace and DNS Are Different Systems

Do not confuse:

``` text
Namespace
```

with:

``` text
DNS zone
```

Kubernetes DNS uses namespace information to construct Service DNS
names, but namespace itself is an API grouping mechanism.

------------------------------------------------------------------------

# 86. Namespace and NetworkPolicy Example

Suppose:

``` text
namespace: frontend
namespace: backend
```

Network policy in backend:

``` yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: backend
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: frontend
```

Label the frontend namespace:

``` bash
kubectl label namespace frontend name=frontend
```

The policy can then select it.

------------------------------------------------------------------------

# 87. Default-Deny Pattern

A common security approach is to start with:

``` text
default deny
```

and explicitly allow required traffic.

Example:

``` yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

This selects all Pods in the namespace.

Whether all desired traffic is actually blocked depends on the
NetworkPolicy implementation and policy semantics.

------------------------------------------------------------------------

# 88. Namespace Resource Lifecycle

A namespace often acts as a lifecycle boundary:

``` text
Create namespace
       |
       v
Deploy resources
       |
       v
Operate application
       |
       v
Retire application
       |
       v
Delete namespace
```

This can make environment teardown convenient.

However, persistent storage and external cloud resources may require
separate lifecycle handling.

------------------------------------------------------------------------

# 89. Important PVC Deletion Consideration

Deleting a namespace deletes its PVC objects.

What happens to the underlying storage depends on:

-   StorageClass
-   PersistentVolume reclaim policy
-   CSI driver
-   external storage system
-   provider behavior

Do not assume that deleting a namespace always means physical storage is
immediately destroyed.

------------------------------------------------------------------------

# 90. Namespace and PersistentVolume Reclaim Policy

Common PV reclaim policies include:

``` text
Retain
Delete
```

`Retain` can preserve the PV/storage for manual recovery.

`Delete` can cause the associated storage resource to be deleted
depending on the provisioner.

Always understand this before deleting production namespaces.

------------------------------------------------------------------------

# 91. Namespace Deletion Safety Checklist

Before:

``` bash
kubectl delete namespace production
```

check:

``` bash
kubectl get all -n production
kubectl get pvc -n production
kubectl get secrets -n production
kubectl get configmaps -n production
kubectl get networkpolicies -n production
kubectl get resourcequota -n production
kubectl get limitrange -n production
```

Also inspect:

``` bash
kubectl get events -n production
```

and any external resources managed by operators.

------------------------------------------------------------------------

# 92. Common Namespace Mistake #1

### Mistake

Running:

``` bash
kubectl get pods
```

and assuming there are no Pods.

### Reality

You may simply be looking at the wrong namespace.

Try:

``` bash
kubectl get pods -A
```

------------------------------------------------------------------------

# 93. Common Namespace Mistake #2

### Mistake

Creating a Service in:

``` text
development
```

and trying to find it from:

``` text
production
```

using only:

``` text
api
```

### Better

Use:

``` text
api.development
```

or:

``` text
api.development.svc.cluster.local
```

------------------------------------------------------------------------

# 94. Common Namespace Mistake #3

### Mistake

Assuming namespace provides network isolation.

### Reality

Namespaces are not sufficient network isolation.

Use:

``` text
NetworkPolicy
```

with a network implementation that supports/enforces it.

------------------------------------------------------------------------

# 95. Common Namespace Mistake #4

### Mistake

Assuming namespace provides complete security isolation.

### Reality

A namespace is one security boundary among several.

Combine:

``` text
RBAC
+
Pod Security
+
NetworkPolicy
+
Admission policies
+
Resource controls
```

as appropriate.

------------------------------------------------------------------------

# 96. Common Namespace Mistake #5

### Mistake

Using:

``` bash
kubectl delete namespace production
```

without checking dependencies.

### Result

You may unintentionally remove many application resources.

Always treat namespace deletion as a potentially large blast-radius
operation.

------------------------------------------------------------------------

# 97. Common Namespace Mistake #6

### Mistake

Trying:

``` bash
kubectl get nodes -n production
```

### Why it is wrong

Nodes are cluster-scoped.

Use:

``` bash
kubectl get nodes
```

------------------------------------------------------------------------

# 98. Common Namespace Mistake #7

### Mistake

Assuming PVs are namespaced.

### Reality

PVC:

``` text
namespaced
```

PV:

``` text
cluster-scoped
```

------------------------------------------------------------------------

# 99. Useful Namespace Commands Cheat Sheet

``` bash
# List namespaces
kubectl get ns

# Create namespace
kubectl create ns development

# Describe namespace
kubectl describe ns development

# Namespace YAML
kubectl get ns development -o yaml

# Delete namespace
kubectl delete ns development

# Pods in namespace
kubectl get pods -n development

# Everything commonly shown by get all
kubectl get all -n development

# All Pods in all namespaces
kubectl get pods -A

# Events
kubectl get events -n development

# Resource quotas
kubectl get resourcequota -n development

# Limit ranges
kubectl get limitrange -n development

# Network policies
kubectl get networkpolicy -n development

# Roles
kubectl get roles -n development

# RoleBindings
kubectl get rolebindings -n development

# PVCs
kubectl get pvc -n development

# Services
kubectl get svc -n development

# Ingress
kubectl get ingress -n development

# Current context
kubectl config current-context

# Set default namespace
kubectl config set-context --current --namespace=development

# API resource scope
kubectl api-resources
```

------------------------------------------------------------------------

# 100. Useful Namespace Troubleshooting Workflow

When something appears to be missing:

## Step 1 --- Check current context

``` bash
kubectl config current-context
```

## Step 2 --- Check namespace

``` bash
kubectl config view --minify
```

## Step 3 --- Search all namespaces

``` bash
kubectl get pods -A
```

## Step 4 --- Inspect target namespace

``` bash
kubectl get all -n <namespace>
```

## Step 5 --- Check events

``` bash
kubectl get events -n <namespace>
```

## Step 6 --- Check policies

``` bash
kubectl get networkpolicy -n <namespace>
```

## Step 7 --- Check quotas

``` bash
kubectl get resourcequota -n <namespace>
kubectl get limitrange -n <namespace>
```

## Step 8 --- Check permissions

``` bash
kubectl auth can-i <verb> <resource> -n <namespace>
```

------------------------------------------------------------------------

# 101. Namespace Troubleshooting Decision Tree

``` text
Resource missing?
       |
       v
Check current context
       |
       v
Check namespace
       |
       +---- Wrong namespace?
       |       |
       |       +--> use -n <namespace>
       |
       v
Does resource exist?
       |
       +---- No --> check manifests / controllers
       |
       v
Resource exists?
       |
       v
Check events
       |
       v
Check RBAC
       |
       v
Check quota / limits
       |
       v
Check network policies
       |
       v
Check application-specific configuration
```

------------------------------------------------------------------------

# 102. Namespace Architecture Example

A production cluster might look like:

``` text
Kubernetes Cluster
│
├── kube-system
│   ├── CoreDNS
│   ├── kube-proxy
│   └── cluster infrastructure
│
├── ingress
│   └── ingress/gateway components
│
├── monitoring
│   ├── metrics
│   └── observability components
│
├── development
│   └── application workloads
│
├── staging
│   └── application workloads
│
└── production
    └── application workloads
```

Each application namespace can have:

``` text
RBAC
ResourceQuota
LimitRange
NetworkPolicy
Pod Security
Services
Deployments
Secrets
ConfigMaps
PVCs
```

------------------------------------------------------------------------

# 103. Namespace as a Policy Boundary

A powerful mental model is:

``` text
Namespace
    |
    +-- Identity boundary
    |      └── RBAC
    |
    +-- Resource boundary
    |      ├── ResourceQuota
    |      └── LimitRange
    |
    +-- Network policy boundary
    |      └── NetworkPolicy
    |
    +-- Security policy boundary
    |      └── Pod Security / admission
    |
    +-- Operational boundary
           └── ownership / lifecycle
```

This is much more accurate than thinking:

> "A namespace is just a folder."

It behaves more like a logical API and policy boundary.

------------------------------------------------------------------------

# 104. Namespace Does Not Physically Contain Pods

This is another useful mental model.

A namespace is represented in Kubernetes API state.

The actual Pod process runs:

``` text
Node
  |
  +-- container runtime
        |
        +-- Pod
```

The Pod's API object contains:

``` yaml
metadata:
  namespace: production
```

So namespace association is an API-level concept, while the actual
workload executes on a node.

------------------------------------------------------------------------

# 105. Namespace and Control Plane

Namespaces are stored and managed through Kubernetes API resources.

Conceptually:

``` text
kubectl
   |
   v
API Server
   |
   v
cluster state
   |
   +-- Namespace objects
   +-- Pod objects
   +-- Service objects
   +-- Deployment objects
```

Controllers watch the API and reconcile desired state.

------------------------------------------------------------------------

# 106. Namespace Creation Does Not Create Infrastructure

When you run:

``` bash
kubectl create namespace production
```

Kubernetes does not normally:

-   create a VM
-   create a worker node
-   create a VPC
-   create a subnet
-   create a new control plane
-   reserve CPU automatically

It creates a Kubernetes Namespace API object.

Additional controllers may react to it if configured.

------------------------------------------------------------------------

# 107. Namespace and Quota Admission

ResourceQuota can influence admission.

For example, if a namespace has:

``` text
requests.cpu = 4
```

and existing workloads consume the full quota, a new workload requesting
additional CPU may be rejected.

This happens during API admission rather than waiting for the scheduler
to fail later.

------------------------------------------------------------------------

# 108. Namespace and LimitRange Admission

LimitRange can provide defaults.

Suppose a Pod specifies no CPU request.

A LimitRange may inject a default request depending on configuration.

That affects:

-   scheduling
-   quota accounting
-   resource behavior

Therefore, when debugging unexpected resource values, inspect:

``` bash
kubectl get limitrange -n <namespace> -o yaml
```

------------------------------------------------------------------------

# 109. Namespace and Service Discovery

Namespace is fundamental to Kubernetes service naming.

Example:

``` text
frontend namespace
    |
    | calls
    v
api.backend.svc.cluster.local
```

This lets multiple namespaces have Services with identical names:

``` text
frontend/api
backend/api
payments/api
```

------------------------------------------------------------------------

# 110. Namespace and Service Name Collision

This is allowed:

``` text
development/api
production/api
```

But this is not allowed within the same namespace:

``` text
development/api
development/api
```

Names are unique within their applicable resource scope.

------------------------------------------------------------------------

# 111. Namespace and Object References

Many Kubernetes references use only an object name because the
referenced object is expected to be in the same namespace.

For cross-namespace operations, the API may require:

-   an explicit namespace
-   DNS name
-   reference object
-   special cross-namespace mechanism

Always check the specific API specification.

------------------------------------------------------------------------

# 112. Namespace and Secrets Security

Although Secrets are namespaced, namespace separation alone should not
be treated as sufficient secret isolation.

Use:

-   least-privilege RBAC
-   encryption at rest where appropriate
-   restricted ServiceAccounts
-   admission policies
-   external secret-management systems when appropriate
-   careful logging practices

Avoid giving broad:

``` text
get secrets
```

permissions unnecessarily.

------------------------------------------------------------------------

# 113. Namespace and ServiceAccount Security

Prefer dedicated ServiceAccounts.

Instead of:

``` text
many workloads -> one highly privileged ServiceAccount
```

use:

``` text
frontend -> frontend-sa
api      -> api-sa
worker   -> worker-sa
```

and grant only required permissions.

------------------------------------------------------------------------

# 114. Namespace and RBAC Least Privilege

A good design:

``` text
developer
   |
   +-- read deployments
   +-- read pods
   +-- read logs
   |
   X-- cannot modify production secrets
```

This can be implemented with namespace-scoped Roles/RoleBindings and
appropriate cluster-level policies.

------------------------------------------------------------------------

# 115. Namespace and Production Access

For sensitive namespaces:

``` text
production
```

consider:

-   restricted RBAC
-   separate deployment identities
-   strong audit controls
-   NetworkPolicy
-   Pod Security
-   admission policies
-   resource quotas
-   controlled CI/CD access

Do not rely only on naming a namespace "production."

------------------------------------------------------------------------

# 116. Namespace and Audit

Kubernetes audit logging can record API requests.

This is useful for understanding:

``` text
Who
did what
to which resource
in which namespace
and when
```

Namespace is an important dimension when analyzing API activity.

------------------------------------------------------------------------

# 117. Namespace and Observability

Monitoring systems commonly add namespace as a dimension.

Metrics may be grouped by:

``` text
namespace
pod
container
service
deployment
```

This helps answer:

-   Which namespace consumes the most CPU?
-   Which namespace has failing Pods?
-   Which team owns a workload?
-   Which environment is unhealthy?

------------------------------------------------------------------------

# 118. Namespace and Logging

Logs are often tagged with:

``` text
namespace
pod
container
node
```

This makes namespace-based investigation very effective.

Example:

``` text
namespace=production
app=payments
```

can be used to filter logs.

------------------------------------------------------------------------

# 119. Namespace and Network Topology

Namespaces do not necessarily map to:

``` text
subnets
```

or:

``` text
VPCs
```

A CNI plugin typically manages Pod networking independently of
Kubernetes namespace boundaries.

Therefore:

``` text
namespace A
namespace B
```

may share the same Pod network.

NetworkPolicy provides logical traffic controls on supported
implementations.

------------------------------------------------------------------------

# 120. Namespace and CNI

CNI is responsible for implementing Pod networking.

Namespace is primarily a Kubernetes API abstraction.

Conceptually:

``` text
Namespace
    |
    | API organization
    v
Pod object
    |
    | scheduled to
    v
Node
    |
    | networking configured by
    v
CNI
```

Do not confuse namespace with Linux network namespace.

------------------------------------------------------------------------

# 121. Kubernetes Namespace vs Linux Network Namespace

These are completely different concepts.

### Kubernetes Namespace

``` text
Kubernetes API object
```

Used for:

-   resource scope
-   organization
-   RBAC
-   policy

### Linux network namespace

``` text
Linux kernel networking isolation
```

Used for:

-   network interfaces
-   routing tables
-   ports
-   network stack isolation

A Kubernetes Pod usually gets its own network namespace, depending on
Pod networking architecture.

The word "namespace" therefore has two different meanings in Kubernetes
discussions.

------------------------------------------------------------------------

# 122. Kubernetes Namespace vs Linux PID Namespace

Linux also has namespaces such as:

-   network namespace
-   PID namespace
-   mount namespace
-   IPC namespace
-   UTS namespace
-   user namespace

These are kernel isolation mechanisms.

Kubernetes Namespace is not one of those Linux namespaces.

------------------------------------------------------------------------

# 123. Very Important Interview Distinction

Question:

> Does Kubernetes Namespace isolate network traffic?

Correct answer:

> Not by itself. Kubernetes Namespace provides API/resource scope.
> Network isolation requires NetworkPolicy and an implementation that
> supports/enforces it.

Question:

> Is Kubernetes Namespace the same as Linux network namespace?

Correct answer:

> No. They are different concepts.

------------------------------------------------------------------------

# 124. Namespace and Cluster DNS Search

A Pod's DNS configuration commonly includes search domains that make
short names convenient.

Conceptually:

``` text
<namespace>.svc.cluster.local
svc.cluster.local
cluster.local
```

The exact `/etc/resolv.conf` contents depend on Pod DNS configuration.

Inspect:

``` bash
kubectl exec -n development <pod> -- cat /etc/resolv.conf
```

------------------------------------------------------------------------

# 125. Namespace and DNS Debugging

If:

``` bash
curl http://api
```

fails, determine whether:

1.  Service exists
2.  Service is in the expected namespace
3.  DNS works
4.  Endpoints exist
5.  NetworkPolicy permits traffic
6.  Application listens on expected port

Commands:

``` bash
kubectl get svc -n backend
kubectl get endpointslices -n backend
```

Then test:

``` bash
nslookup api.backend.svc.cluster.local
```

from an appropriate debugging Pod.

------------------------------------------------------------------------

# 126. Namespace and NetworkPolicy Debugging

When cross-namespace traffic fails:

``` text
frontend
   |
   X
backend
```

check:

``` bash
kubectl get networkpolicy -A
```

Then inspect:

``` bash
kubectl describe networkpolicy <name> -n backend
```

Check namespace labels:

``` bash
kubectl get namespace frontend --show-labels
```

Remember that NetworkPolicy semantics are directional:

-   ingress controls incoming traffic
-   egress controls outgoing traffic

------------------------------------------------------------------------

# 127. Namespace and Default-Deny Security Model

A strong pattern for sensitive environments:

``` text
Namespace created
      |
      v
Apply default-deny NetworkPolicy
      |
      v
Apply explicit allow rules
      |
      v
Deploy workloads
```

This creates an allow-list style network model.

------------------------------------------------------------------------

# 128. Namespace Bootstrapping

A mature platform may automatically create:

``` text
Namespace
├── labels
├── ResourceQuota
├── LimitRange
├── NetworkPolicies
├── RBAC
├── Pod Security labels
└── observability configuration
```

This can be done through:

-   GitOps
-   operators
-   platform automation
-   admission/policy systems

------------------------------------------------------------------------

# 129. Namespace Template Concept

For each new team/environment:

``` text
namespace
+
resource quota
+
limit range
+
network policies
+
RBAC
+
security labels
```

This provides consistent governance.

------------------------------------------------------------------------

# 130. Namespace Governance Example

``` text
Namespace: payments-prod

Labels:
  team=payments
  environment=production
  security-tier=high

Policies:
  Pod Security = restricted
  Network = default deny

Resources:
  CPU quota
  Memory quota

RBAC:
  Developers = limited
  CI/CD = deployment permissions
  Operations = operational access
```

------------------------------------------------------------------------

# 131. Namespace Anti-Patterns

Avoid:

### Anti-pattern 1

Creating a namespace for every tiny component without a reason.

### Anti-pattern 2

Using namespaces as the only security mechanism.

### Anti-pattern 3

Giving every namespace unrestricted cluster-admin permissions.

### Anti-pattern 4

Deleting namespaces without understanding storage/external dependencies.

### Anti-pattern 5

Using inconsistent naming conventions.

### Anti-pattern 6

Assuming namespace boundaries automatically create network boundaries.

------------------------------------------------------------------------

# 132. How Many Namespaces Should You Create?

There is no universal number.

Create namespaces based on meaningful boundaries such as:

-   Team
-   Environment
-   Application lifecycle
-   Security boundary
-   Resource ownership
-   Compliance
-   Operational responsibility

Avoid both extremes:

``` text
1 namespace for everything
```

and:

``` text
1000 namespaces for trivial organization
```

unless the architecture genuinely requires it.

------------------------------------------------------------------------

# 133. Namespace Scalability

Namespaces are Kubernetes API objects.

Large clusters may contain many namespaces, but practical scalability
depends on the overall number of:

-   namespaces
-   Pods
-   Services
-   API objects
-   controllers
-   policies
-   events
-   workloads

Namespace count alone is not a useful capacity metric.

------------------------------------------------------------------------

# 134. Namespace and Quotas for Multi-Tenant Clusters

Example:

``` text
Team A
  Namespace A
  CPU quota = 20
  Memory quota = 40Gi

Team B
  Namespace B
  CPU quota = 10
  Memory quota = 20Gi
```

This prevents one namespace from consuming unlimited requested
resources, assuming quotas are correctly configured.

------------------------------------------------------------------------

# 135. Namespace and Priority

ResourceQuota is not the same as scheduling priority.

Namespace quota answers:

> How much aggregate resource consumption is allowed?

PriorityClass answers:

> How important is a Pod relative to other Pods for
> scheduling/preemption?

These are different concepts.

------------------------------------------------------------------------

# 136. Namespace and Resource Requests

Quota often tracks requests and/or limits.

Example:

``` yaml
resources:
  requests:
    cpu: 500m
    memory: 256Mi
```

A namespace quota may account for these values.

This is why a Pod can fail admission because a namespace quota is
exhausted even though a node appears to have free capacity.

------------------------------------------------------------------------

# 137. Namespace and Node Capacity

These are different levels:

``` text
Cluster
  |
  +-- Namespace quota
         |
         +-- Workloads
                |
                v
              Nodes
```

A namespace can have quota lower than cluster capacity.

Conversely, the cluster can have insufficient actual capacity even when
namespace quota permits additional workloads.

------------------------------------------------------------------------

# 138. Namespace Quota Does Not Reserve Nodes

Suppose:

``` text
namespace quota = 100 CPU
```

That does not mean:

``` text
100 CPU reserved exclusively for that namespace
```

Quota is a usage/admission limit, not necessarily a physical
reservation.

------------------------------------------------------------------------

# 139. Namespace and LimitRange Do Not Guarantee Performance

A LimitRange can constrain requests/limits, but it does not guarantee:

-   CPU availability
-   latency
-   dedicated nodes
-   network bandwidth
-   storage IOPS

For performance isolation, additional architecture is required.

------------------------------------------------------------------------

# 140. Namespace and Dedicated Nodes

If a production namespace needs dedicated nodes, combine namespace
organization with:

``` text
node labels
+
nodeSelector/affinity
+
taints/tolerations
```

Example:

``` text
Nodes:
  node1 workload=general
  node2 workload=production

Pod:
  nodeSelector:
    workload: production
```

Namespace itself does not enforce this.

------------------------------------------------------------------------

# 141. Namespace and Taints

A node can be tainted:

``` text
workload=production:NoSchedule
```

A Pod must tolerate it:

``` yaml
tolerations:
  - key: workload
    operator: Equal
    value: production
    effect: NoSchedule
```

This can help create dedicated node pools.

------------------------------------------------------------------------

# 142. Namespace and ResourceQuota for Object Counts

ResourceQuota can also limit object counts in supported configurations.

Examples may include:

``` text
pods
services
secrets
configmaps
persistentvolumeclaims
```

This can prevent runaway object creation.

Example concept:

``` yaml
hard:
  pods: "50"
  services: "20"
```

------------------------------------------------------------------------

# 143. Namespace and Service Count

A quota can help prevent a team from accidentally creating excessive
Services.

This is useful in shared clusters because every object can create
operational overhead.

------------------------------------------------------------------------

# 144. Namespace and API Access

Namespace scope is also important for API authorization.

Example:

``` text
GET /api/v1/namespaces/development/pods
```

Conceptually targets Pods in:

``` text
development
```

Whereas Nodes are accessed as cluster-scoped resources.

------------------------------------------------------------------------

# 145. Namespace in Kubernetes Object Identity

For namespaced resources, identity is approximately:

``` text
(resource type, namespace, name)
```

For example:

``` text
Deployment
development
web
```

is distinct from:

``` text
Deployment
production
web
```

------------------------------------------------------------------------

# 146. Namespace and `kubectl get`

Compare:

``` bash
kubectl get deployment web -n development
```

with:

``` bash
kubectl get deployment web -n production
```

Same resource name.

Different namespace.

Therefore:

``` text
development/web
production/web
```

are different objects.

------------------------------------------------------------------------

# 147. Namespace and Resource URLs

The Kubernetes API often represents namespaced resources in paths like:

``` text
/apis/apps/v1/namespaces/development/deployments/web
```

The namespace is part of the resource path.

Cluster-scoped resources have no namespace segment.

------------------------------------------------------------------------

# 148. Namespace and Namespaced Custom Resources

If a CRD defines:

``` yaml
spec:
  scope: Namespaced
```

then an object might be:

``` yaml
apiVersion: example.com/v1
kind: MyApplication
metadata:
  name: app1
  namespace: production
```

If the CRD is cluster-scoped, the object cannot have normal namespace
scope.

------------------------------------------------------------------------

# 149. Namespace and Controllers Watching Multiple Namespaces

A controller may be configured to watch:

``` text
all namespaces
```

or:

``` text
selected namespaces
```

This matters when debugging:

> "I created the CR, but the controller isn't acting on it."

Check the controller's scope and permissions.

------------------------------------------------------------------------

# 150. Namespace and CRD Scope

CRD itself:

``` text
Cluster-scoped
```

CR instances may be:

``` text
Namespaced
```

or:

``` text
Cluster-scoped
```

depending on:

``` yaml
spec:
  scope:
```

This distinction is frequently tested in Kubernetes interviews.

------------------------------------------------------------------------

# 151. Namespace and Operators: Practical Example

Suppose an operator manages databases.

Architecture:

``` text
database-operator
      |
      +-- watches namespace: database-prod
      |
      +-- watches namespace: database-dev
```

The operator can create resources in those namespaces if its
ServiceAccount/RBAC permits it.

------------------------------------------------------------------------

# 152. Namespace and SecurityContext

Namespace is not a replacement for:

``` text
securityContext
```

SecurityContext controls workload/container-level security settings such
as:

-   user/group
-   privilege settings
-   Linux capabilities
-   filesystem behavior

Namespace provides broader API scope.

Use both where appropriate.

------------------------------------------------------------------------

# 153. Namespace and Pod Security Standards

A namespace can be labeled to enforce a baseline security posture.

Example:

``` yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: baseline
```

For more restrictive workloads:

``` yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted
```

Validate your workloads before applying strict enforcement in
production.

------------------------------------------------------------------------

# 154. Namespace and Secrets: Cross-Namespace Myth

This does not work as a normal Pod reference:

``` yaml
secret:
  secretName: production/database-secret
```

for a Pod in another namespace.

Instead, Secrets normally need to exist in the Pod's namespace, or you
need an external mechanism/controller to synchronize or inject them.

------------------------------------------------------------------------

# 155. Namespace and ConfigMap: Cross-Namespace Myth

Similarly, a Pod in:

``` text
development
```

cannot simply mount:

``` text
production/app-config
```

as a normal ConfigMap reference.

ConfigMaps are namespaced.

------------------------------------------------------------------------

# 156. Namespace and ServiceAccount: Cross-Namespace Myth

A Pod's ServiceAccount belongs to the Pod's namespace.

You cannot simply configure:

``` yaml
serviceAccountName: production/admin
```

for a Pod in another namespace.

Design RBAC around namespace-local ServiceAccounts and explicitly
granted permissions.

------------------------------------------------------------------------

# 157. Namespace and RoleBinding Scope

A RoleBinding is namespaced.

It can reference a Role in the same namespace or a ClusterRole.

This makes the following pattern powerful:

``` text
ClusterRole
      |
      +--> RoleBinding in namespace A
      |
      +--> RoleBinding in namespace B
```

The same reusable permission definition can be applied to multiple
namespaces.

------------------------------------------------------------------------

# 158. ClusterRole + RoleBinding Example

``` yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: development
subjects:
  - kind: User
    name: developer
roleRef:
  kind: ClusterRole
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

Although the ClusterRole is cluster-scoped, this RoleBinding grants its
permissions within the binding's namespace.

------------------------------------------------------------------------

# 159. Namespace and ClusterRoleBinding

A ClusterRoleBinding grants permissions cluster-wide.

Example concept:

``` text
ClusterRole
    |
    v
ClusterRoleBinding
    |
    v
User
```

This is significantly broader than a namespace-specific RoleBinding.

Use carefully.

------------------------------------------------------------------------

# 160. Namespace and `kubectl auth can-i`

Check:

``` bash
kubectl auth can-i create deployments -n production
```

Check all:

``` bash
kubectl auth can-i --list -n production
```

This is one of the best commands for namespace/RBAC troubleshooting.

------------------------------------------------------------------------

# 161. Namespace and Impersonation

Administrators can test access:

``` bash
kubectl auth can-i get pods \
  -n production \
  --as=user@example.com
```

This helps validate namespace-specific RBAC without logging in as that
user.

------------------------------------------------------------------------

# 162. Namespace and ServiceAccount Testing

Example:

``` bash
kubectl auth can-i get secrets \
  -n production \
  --as=system:serviceaccount:production:app-sa
```

This can reveal whether an application identity has excessive
permissions.

------------------------------------------------------------------------

# 163. Namespace Security Checklist

For production namespaces consider:

``` text
[ ] RBAC configured
[ ] Least privilege
[ ] Dedicated ServiceAccounts
[ ] NetworkPolicy
[ ] Default-deny where appropriate
[ ] Pod Security configuration
[ ] ResourceQuota
[ ] LimitRange
[ ] Audit/observability
[ ] Naming/ownership labels
[ ] Storage lifecycle understood
[ ] CI/CD access controlled
```

------------------------------------------------------------------------

# 164. Recommended Namespace Labels

A practical baseline:

``` yaml
labels:
  environment: production
  team: payments
  cost-center: payments
```

For security/policy-driven clusters, additional labels may include:

``` yaml
labels:
  security-tier: restricted
```

Do not add labels merely for decoration; define a consistent
organizational standard.

------------------------------------------------------------------------

# 165. Example Production Namespace

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: payments-prod
  labels:
    environment: production
    team: payments
    pod-security.kubernetes.io/enforce: restricted
```

Then apply supporting controls:

``` text
ResourceQuota
LimitRange
NetworkPolicy
RBAC
Monitoring
Logging
```

------------------------------------------------------------------------

# 166. Example ResourceQuota

``` yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: payments-quota
  namespace: payments-prod
spec:
  hard:
    requests.cpu: "8"
    requests.memory: 16Gi
    limits.cpu: "16"
    limits.memory: 32Gi
    pods: "50"
```

Tune these values based on actual workload requirements.

------------------------------------------------------------------------

# 167. Example LimitRange

``` yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: payments-limits
  namespace: payments-prod
spec:
  limits:
    - type: Container
      default:
        cpu: "1"
        memory: 1Gi
      defaultRequest:
        cpu: "250m"
        memory: 256Mi
      max:
        cpu: "4"
        memory: 8Gi
```

------------------------------------------------------------------------

# 168. Example Default-Deny NetworkPolicy

``` yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: payments-prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

Add explicit allow policies afterward.

------------------------------------------------------------------------

# 169. Example Namespace Bootstrap Bundle

A mature deployment process might apply:

``` text
01-namespace.yaml
02-resourcequota.yaml
03-limitrange.yaml
04-networkpolicy-default-deny.yaml
05-networkpolicy-allow.yaml
06-serviceaccounts.yaml
07-rbac.yaml
08-application.yaml
```

The exact ordering can vary with your deployment tooling.

------------------------------------------------------------------------

# 170. Namespace Operational Runbook

When onboarding a new namespace:

1.  Create namespace.
2.  Add standard labels.
3.  Configure Pod Security posture.
4.  Create ResourceQuota.
5.  Create LimitRange.
6.  Configure RBAC.
7.  Create ServiceAccounts.
8.  Apply NetworkPolicies.
9.  Configure observability.
10. Deploy workloads.
11. Validate DNS/service discovery.
12. Validate resource consumption.
13. Validate RBAC.
14. Validate network isolation.

------------------------------------------------------------------------

# 171. Namespace Troubleshooting: "Pod Not Found"

Run:

``` bash
kubectl get pods -A | grep <pod-name>
```

If found:

``` text
wrong namespace
```

If not found:

``` text
check deployment
check ReplicaSet
check Job
check events
check manifest
```

------------------------------------------------------------------------

# 172. Namespace Troubleshooting: "Forbidden"

Example:

``` text
Error from server (Forbidden)
```

Check:

``` bash
kubectl auth can-i <verb> <resource> -n <namespace>
```

Then inspect:

``` bash
kubectl get role -n <namespace>
kubectl get rolebinding -n <namespace>
```

------------------------------------------------------------------------

# 173. Namespace Troubleshooting: "Quota Exceeded"

Inspect:

``` bash
kubectl describe resourcequota -n <namespace>
```

Look at:

``` text
Used
Hard
```

Then identify workloads consuming resources.

Possible solutions:

-   Reduce requests
-   Scale down
-   Increase quota
-   Remove unused objects
-   Fix incorrect defaults

------------------------------------------------------------------------

# 174. Namespace Troubleshooting: "Pod Rejected"

Check:

``` bash
kubectl get events -n <namespace>
```

Possible reasons:

-   ResourceQuota
-   LimitRange
-   Pod Security
-   admission policy
-   RBAC
-   invalid configuration

The Kubernetes API server generally returns useful admission error
messages.

------------------------------------------------------------------------

# 175. Namespace Troubleshooting: "Network Doesn't Work"

Do not blame the namespace immediately.

Check:

``` text
1. Service
2. Endpoints/EndpointSlices
3. DNS
4. Pod readiness
5. NetworkPolicy
6. CNI
7. routing
8. application listening port
```

Namespace is only one dimension.

------------------------------------------------------------------------

# 176. Namespace Troubleshooting: "Namespace Stuck Terminating"

Start:

``` bash
kubectl get ns <namespace> -o yaml
```

Then inspect:

``` bash
kubectl get events -n <namespace>
```

Check remaining resources:

``` bash
kubectl api-resources --namespaced=true --verbs=list -o name
```

Look for:

-   unavailable APIs
-   remaining objects
-   finalizers

Avoid blindly deleting finalizers.

------------------------------------------------------------------------

# 177. Finalizers: Why Blind Removal Is Dangerous

A finalizer can indicate:

> "Do not completely delete this object until cleanup is performed."

Removing it manually may bypass required cleanup.

Possible consequences:

-   orphaned external resources
-   inconsistent controller state
-   leaked cloud resources
-   broken operator state

Use manual finalizer removal only after understanding the
controller/resource lifecycle.

------------------------------------------------------------------------

# 178. Namespace and External Resources

A namespace may contain Kubernetes objects managed by controllers that
create external resources such as:

-   cloud load balancers
-   databases
-   DNS records
-   disks
-   object storage
-   certificates

Deleting the namespace may trigger cleanup, but exact behavior depends
on the controller.

Always understand ownership before deleting a namespace.

------------------------------------------------------------------------

# 179. Namespace and LoadBalancer Services

A Service of type:

``` yaml
type: LoadBalancer
```

is namespaced.

The associated cloud load balancer may be an external resource.

Therefore:

``` text
Kubernetes Service
       |
       v
Cloud Load Balancer
```

has different lifecycle semantics.

Do not assume the external resource is simply "inside" the namespace.

------------------------------------------------------------------------

# 180. Namespace and Ingress Controller

An Ingress object is namespaced.

The Ingress Controller itself may run:

-   cluster-wide
-   in a dedicated namespace
-   with selected namespace watches

Therefore:

``` text
Ingress object
```

and:

``` text
Ingress Controller
```

are separate concepts.

------------------------------------------------------------------------

# 181. Namespace and CoreDNS

CoreDNS is usually deployed in a system namespace.

It serves DNS for Services and other Kubernetes DNS records across
namespaces.

Example:

``` text
application Pod
      |
      v
CoreDNS
      |
      v
Service DNS
```

Namespaces are encoded into Service DNS names.

------------------------------------------------------------------------

# 182. Namespace and Kubernetes API Discovery

Use:

``` bash
kubectl api-resources
```

to learn:

-   resource names
-   short names
-   API groups
-   namespaced vs cluster-scoped status

This is one of the best commands for understanding Kubernetes
architecture.

------------------------------------------------------------------------

# 183. Namespace and `kubectl explain`

Use:

``` bash
kubectl explain namespace
```

More:

``` bash
kubectl explain namespace.metadata
```

For YAML fields:

``` bash
kubectl explain resourcequota.spec
```

This uses Kubernetes API schema information.

------------------------------------------------------------------------

# 184. Namespace Object Structure

A simplified namespace object:

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    environment: production
status:
  phase: Active
```

The object can also contain:

-   UID
-   creationTimestamp
-   resourceVersion
-   managedFields
-   finalizers

------------------------------------------------------------------------

# 185. Namespace UID

Every namespace has a unique UID.

Even if a namespace is deleted and recreated with the same name:

``` text
production
```

the new object receives a new UID.

This matters to controllers and object references.

------------------------------------------------------------------------

# 186. Namespace ResourceVersion

Kubernetes objects have resource versions used by the API machinery for
concurrency/resource state handling.

You generally should not manually manipulate:

``` yaml
resourceVersion:
```

in ordinary manifests.

------------------------------------------------------------------------

# 187. Namespace ManagedFields

Modern Kubernetes objects may contain:

``` yaml
metadata:
  managedFields:
```

These record field ownership information used by server-side apply and
related API machinery.

Usually you do not include managedFields in source manifests.

------------------------------------------------------------------------

# 188. Namespace and Declarative Management

Prefer declarative management for production:

``` bash
kubectl apply -f namespace.yaml
```

or GitOps.

Benefits:

-   repeatability
-   version control
-   review
-   auditability
-   consistency

------------------------------------------------------------------------

# 189. Namespace and GitOps Best Practice

A Git repository might contain:

``` text
clusters/
  production/
    namespaces/
      payments.yaml
      orders.yaml
```

or:

``` text
platform/
  namespaces/
    payments/
      namespace.yaml
      quota.yaml
      limitrange.yaml
      networkpolicy.yaml
```

This makes governance reproducible.

------------------------------------------------------------------------

# 190. Namespace and Environment Promotion

Example:

``` text
Git
 |
 +--> development
 |
 +--> staging
 |
 +--> production
```

Use environment-specific policies and quotas.

Do not assume that simply changing the namespace is enough to make a
workload production-ready.

------------------------------------------------------------------------

# 191. Namespace and Secrets Management

For production, consider integrating with:

-   cloud secret managers
-   external secret operators
-   Vault-like systems
-   sealed/encrypted secret workflows

Kubernetes namespace scope is useful, but secret lifecycle and
encryption requirements may require more.

------------------------------------------------------------------------

# 192. Namespace and Compliance

Namespaces can help separate workloads by compliance requirements.

For example:

``` text
regulated-prod
general-prod
```

But namespace separation alone does not guarantee compliance.

You may also need:

-   node isolation
-   encryption
-   access controls
-   audit logging
-   network segmentation
-   storage controls
-   cloud account/project boundaries

------------------------------------------------------------------------

# 193. Namespace and Blast Radius

Namespaces can reduce operational blast radius.

For example:

``` bash
kubectl delete deployment api -n development
```

is more narrowly scoped than an uncontrolled cluster-wide operation.

However:

``` bash
kubectl delete namespace development
```

has a much larger blast radius within that namespace.

Use explicit namespace flags in automation.

------------------------------------------------------------------------

# 194. Production kubectl Safety

For destructive commands, always verify:

``` bash
kubectl config current-context
kubectl config view --minify
```

and:

``` bash
kubectl get ns
```

before executing them.

A common operational failure is running a valid command against the
wrong cluster or namespace.

------------------------------------------------------------------------

# 195. Namespace Context Prompting

Many engineers configure their shell prompt to display:

``` text
cluster
namespace
```

Example concept:

``` text
prod-cluster [production] $
```

This reduces accidental operations against the wrong namespace.

Tools such as kubectx/kubens can also make context/namespace switching
easier, subject to organizational policy.

------------------------------------------------------------------------

# 196. Namespace and Multiple Clusters

Remember:

``` text
cluster A / production
cluster B / production
```

are completely different namespaces in different clusters.

Namespace names have no global uniqueness across clusters.

------------------------------------------------------------------------

# 197. Namespace and Context

A kubectl context can point to:

``` text
cluster = cluster-a
namespace = production
user = alice
```

Another context can point to:

``` text
cluster = cluster-b
namespace = production
user = alice
```

The namespace name is meaningful only within its cluster.

------------------------------------------------------------------------

# 198. Namespace vs Project in OpenShift

If you work with OpenShift, you will often hear:

``` text
Project
```

A Project is closely related to Kubernetes Namespace but adds
OpenShift-specific behavior and concepts.

Do not assume that every Kubernetes distribution uses identical
terminology.

------------------------------------------------------------------------

# 199. Namespace and Virtual Clusters

Some platforms provide virtual-cluster or tenant abstractions above
namespaces.

These may offer stronger isolation than a plain namespace.

Examples include virtual control planes or Kubernetes-as-a-service
tenant models.

Namespace remains the standard Kubernetes primitive for namespaced API
resource scope.

------------------------------------------------------------------------

# 200. Namespace Design Decision Matrix

  Requirement                  Namespace useful? Additional control
  -------------------------- ------------------- ------------------------
  Team organization                          Yes Labels/RBAC
  Environment separation                     Yes CI/CD
  Resource quotas                            Yes ResourceQuota
  Default resource values                    Yes LimitRange
  Network isolation                       Partly NetworkPolicy
  API authorization                          Yes RBAC
  Pod security                               Yes Pod Security/admission
  Dedicated nodes              No, not by itself Affinity/taints
  VPC isolation                               No Cloud networking
  Strong cluster isolation                    No Separate cluster
  Cost organization                          Yes Cost tooling
  Lifecycle grouping                         Yes GitOps/automation

------------------------------------------------------------------------

# 201. Namespace Production Blueprint

A strong baseline:

``` text
                 Kubernetes Cluster
                         |
                  payments-prod
                         |
       +-----------------+-----------------+
       |                 |                 |
      RBAC           ResourceQuota     LimitRange
       |                 |                 |
       +-----------------+-----------------+
                         |
                  NetworkPolicy
                         |
                   Pod Security
                         |
                 Application Pods
                         |
              Services / Ingress
                         |
                   Observability
```

This is a much more complete isolation model than namespace alone.

------------------------------------------------------------------------

# 202. Namespace Interview Questions

## Q1. What is a Kubernetes Namespace?

A logical scope for organizing and isolating namespaced Kubernetes API
resources within a cluster.

## Q2. Is a namespace a VM?

No.

## Q3. Does a namespace create a network?

No.

## Q4. Does a namespace isolate network traffic?

Not by itself.

## Q5. Which resources are namespaced?

Examples:

-   Pods
-   Deployments
-   Services
-   ConfigMaps
-   Secrets
-   PVCs
-   Roles
-   RoleBindings

## Q6. Which resources are cluster-scoped?

Examples:

-   Nodes
-   Namespaces
-   PersistentVolumes
-   StorageClasses
-   ClusterRoles
-   ClusterRoleBindings
-   CRDs

------------------------------------------------------------------------

# 203. More Interview Questions

## Q7. Can two namespaces have Services with the same name?

Yes.

Example:

``` text
dev/api
prod/api
```

## Q8. Can a Pod in one namespace access a Service in another?

Yes, subject to networking and policy. Kubernetes DNS supports
namespace-qualified Service names.

## Q9. Can a Pod directly mount a Secret from another namespace?

Not as a normal Secret reference. Secrets are namespaced.

## Q10. Does deleting a namespace delete its Pods?

The namespace lifecycle includes cleanup of namespaced resources. Treat
namespace deletion as destructive.

## Q11. Is a PVC namespaced?

Yes.

## Q12. Is a PV namespaced?

No. PV is cluster-scoped.

------------------------------------------------------------------------

# 204. Advanced Interview Questions

## Q13. What is the difference between Kubernetes Namespace and Linux network namespace?

Kubernetes Namespace is an API resource scope. Linux network namespace
is a kernel-level networking isolation mechanism.

## Q14. Can a ClusterRole be used in a namespace?

Yes. A RoleBinding in a namespace can reference a ClusterRole and grant
its permissions within that namespace.

## Q15. Can namespaces provide multi-tenancy?

Yes, especially soft multi-tenancy, but secure multi-tenancy normally
requires additional controls.

## Q16. What happens if a namespace is stuck in Terminating?

Investigate remaining resources, API discovery problems, controllers,
and finalizers.

## Q17. Does a namespace reserve CPU?

No. ResourceQuota limits aggregate usage; it does not automatically
reserve physical CPU.

------------------------------------------------------------------------

# 205. Scenario-Based Interview Question

### Scenario

Developer says:

> "My Pod doesn't exist."

You run:

``` bash
kubectl get pods
```

Nothing appears.

What do you do?

### Answer

First check:

``` bash
kubectl config current-context
```

Then:

``` bash
kubectl get pods -A
```

If the Pod appears in another namespace, the issue is likely an
incorrect namespace/context.

------------------------------------------------------------------------

# 206. Scenario: Cross-Namespace Communication Fails

Architecture:

``` text
frontend namespace
       |
       v
backend namespace
```

DNS resolves, but connection fails.

Investigate:

``` text
1. Service
2. EndpointSlices
3. Pod readiness
4. NetworkPolicy
5. CNI
6. Service port/targetPort
7. Application listener
```

Do not assume the namespace itself blocks traffic.

------------------------------------------------------------------------

# 207. Scenario: New Deployment Rejected

Error indicates quota exceeded.

Check:

``` bash
kubectl describe resourcequota -n production
```

Then:

``` text
current usage
vs
hard limit
```

Check LimitRange too:

``` bash
kubectl describe limitrange -n production
```

Determine whether defaults are causing unexpectedly high requests.

------------------------------------------------------------------------

# 208. Scenario: Production Namespace Stuck Terminating

Investigation:

``` bash
kubectl get ns production -o yaml
```

Then identify remaining namespaced resources.

Also inspect API discovery:

``` bash
kubectl api-resources --namespaced=true
```

Look for unavailable APIs/controllers.

Only after understanding the cause should you consider manual finalizer
intervention.

------------------------------------------------------------------------

# 209. Scenario: Need Developer Access Only to Dev

Recommended approach:

``` text
Role
+
RoleBinding
+
development namespace
```

Avoid:

``` text
ClusterRoleBinding -> cluster-admin
```

unless genuinely required.

------------------------------------------------------------------------

# 210. Scenario: Need Same Permissions in 20 Namespaces

One option:

``` text
ClusterRole
      |
      +--> RoleBinding namespace A
      +--> RoleBinding namespace B
      +--> RoleBinding namespace C
```

This avoids duplicating the permission definition while retaining
namespace-scoped bindings.

------------------------------------------------------------------------

# 211. Scenario: Need Network Isolation Between Teams

Use:

``` text
Namespaces
+
NetworkPolicies
```

Potential design:

``` text
team-a namespace
    X
team-b namespace
```

with explicit allow rules.

If strong infrastructure isolation is required, evaluate separate
clusters or network/infrastructure boundaries.

------------------------------------------------------------------------

# 212. Namespace Best Practices

### 1. Use meaningful boundaries

Create namespaces for real organizational/security/lifecycle reasons.

### 2. Standardize labels

Use:

``` text
team
environment
cost-center
```

as appropriate.

### 3. Use RBAC

Never rely on namespace naming for access control.

### 4. Use NetworkPolicy

When network isolation is required.

### 5. Use ResourceQuota

Control aggregate resource usage.

### 6. Use LimitRange

Control defaults and per-container limits.

### 7. Use Pod Security

Apply appropriate security standards.

### 8. Use GitOps/declarative management

Version-control namespace configuration.

### 9. Make deletion difficult

Protect production namespace deletion through process/RBAC.

### 10. Monitor namespace health

Track:

-   CPU
-   memory
-   Pod failures
-   quota usage
-   events
-   network errors

------------------------------------------------------------------------

# 213. Namespace Security Layering

A good security architecture:

``` text
                    Cluster
                       |
                  Namespace
                       |
          +------------+------------+
          |            |            |
         RBAC      NetworkPolicy   Quota
          |            |            |
     API access     Traffic      Resources
          |
     Pod Security
          |
     Workload security
```

No single mechanism provides complete isolation.

------------------------------------------------------------------------

# 214. Namespace Learning Checklist

You should be able to explain:

``` text
[ ] What a namespace is
[ ] Why namespaces exist
[ ] Namespaced vs cluster-scoped resources
[ ] default namespace
[ ] kube-system
[ ] kube-public
[ ] kube-node-lease
[ ] namespace YAML
[ ] kubectl -n
[ ] kubectl context namespace
[ ] namespace labels
[ ] namespace annotations
[ ] namespace deletion
[ ] finalizers
[ ] ResourceQuota
[ ] LimitRange
[ ] RBAC
[ ] Role
[ ] RoleBinding
[ ] ClusterRole
[ ] ClusterRoleBinding
[ ] NetworkPolicy
[ ] Pod Security
[ ] Service DNS
[ ] cross-namespace communication
[ ] PVC vs PV
[ ] Namespace vs Linux namespace
[ ] troubleshooting
[ ] multi-tenancy
[ ] production design
```

------------------------------------------------------------------------

# 215. Practical Lab

Create:

``` text
dev
prod
```

Commands:

``` bash
kubectl create ns dev
kubectl create ns prod
```

Create Deployments:

``` bash
kubectl create deployment nginx \
  --image=nginx \
  -n dev

kubectl create deployment nginx \
  --image=nginx \
  -n prod
```

Notice both are allowed:

``` text
dev/nginx
prod/nginx
```

Check:

``` bash
kubectl get deployments -A
```

------------------------------------------------------------------------

# 216. Practical Lab: Services

Create Services:

``` bash
kubectl expose deployment nginx \
  --port=80 \
  -n dev

kubectl expose deployment nginx \
  --port=80 \
  -n prod
```

Now there are:

``` text
nginx.dev.svc.cluster.local
nginx.prod.svc.cluster.local
```

The same Service name exists in two namespaces.

------------------------------------------------------------------------

# 217. Practical Lab: ResourceQuota

Create:

``` yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    pods: "5"
```

Apply:

``` bash
kubectl apply -f quota.yaml
```

Inspect:

``` bash
kubectl describe resourcequota dev-quota -n dev
```

------------------------------------------------------------------------

# 218. Practical Lab: LimitRange

Create:

``` yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
  namespace: dev
spec:
  limits:
    - type: Container
      default:
        cpu: "500m"
        memory: 512Mi
```

Apply:

``` bash
kubectl apply -f limitrange.yaml
```

Inspect:

``` bash
kubectl describe limitrange dev-limits -n dev
```

------------------------------------------------------------------------

# 219. Practical Lab: RBAC

Create a Role allowing Pod reads:

``` yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: dev
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
```

Then bind it to a user or ServiceAccount.

Test with:

``` bash
kubectl auth can-i list pods -n dev
```

------------------------------------------------------------------------

# 220. Practical Lab: Namespace Labels

``` bash
kubectl label namespace dev environment=development
kubectl label namespace prod environment=production
```

Check:

``` bash
kubectl get namespaces --show-labels
```

Use these labels later in NetworkPolicy or policy systems.

------------------------------------------------------------------------

# 221. Practical Lab: Compare Scopes

Run:

``` bash
kubectl api-resources --namespaced=true
```

Then:

``` bash
kubectl api-resources --namespaced=false
```

Pick resources and verify:

``` bash
kubectl get pods -n dev
kubectl get nodes
kubectl get pvc -n dev
kubectl get pv
```

This exercise builds a strong understanding of Kubernetes API scope.

------------------------------------------------------------------------

# 222. Mental Model to Remember

The simplest accurate model is:

``` text
Kubernetes Cluster
│
├── Cluster-scoped resources
│   ├── Nodes
│   ├── PVs
│   ├── StorageClasses
│   ├── ClusterRoles
│   └── CRDs
│
└── Namespaces
    │
    ├── Pods
    ├── Deployments
    ├── Services
    ├── Secrets
    ├── ConfigMaps
    ├── PVCs
    ├── Roles
    ├── RoleBindings
    └── NetworkPolicies
```

------------------------------------------------------------------------

# 223. The Five Most Important Namespace Concepts

If you remember only five things:

## 1. Namespace is an API scope

It groups namespaced Kubernetes resources.

## 2. Namespace is not a cluster

It does not create independent infrastructure.

## 3. Namespace is not network isolation

Use NetworkPolicy for network controls.

## 4. Namespace works with RBAC

Roles and RoleBindings can limit access to a namespace.

## 5. Namespace works with resource governance

Use:

``` text
ResourceQuota
+
LimitRange
```

to control resource usage.

------------------------------------------------------------------------

# 224. One-Minute Interview Answer

If asked:

> "Explain Kubernetes Namespace."

A strong answer is:

> A Kubernetes Namespace is a logical scope within a cluster used to
> organize and isolate namespaced API resources such as Pods,
> Deployments, Services, ConfigMaps, Secrets, and PVCs. It allows
> different teams or environments to use the same resource names while
> maintaining separate API scopes. Namespaces also provide a natural
> boundary for RBAC, resource quotas, limit ranges, security policies,
> and network policies. However, a namespace by itself is not a hard
> network or infrastructure isolation boundary. Stronger isolation may
> require NetworkPolicy, dedicated nodes, separate clusters, or
> cloud-level controls.

------------------------------------------------------------------------

# 225. Final Namespace Architecture

Think of Kubernetes namespaces as a **platform governance boundary**,
not merely a folder.

``` text
                         Kubernetes Cluster
                                |
                 +--------------+--------------+
                 |              |              |
             Namespace A    Namespace B    Namespace C
                 |              |              |
              Team A         Team B         Team C
                 |              |              |
          +------+------+ +-----+------+ +-----+------+
          |      |      | |     |      | |     |      |
        RBAC   Quota  Policy  RBAC   Quota  RBAC   Quota
          |      |      |       |      |      |      |
          +------+------+       +------+------+------+
                 |
             Workloads
                 |
        +--------+--------+
        |        |        |
       Pods   Services   PVCs
        |
      Nodes
        |
       CNI
        |
     Network
```

The key relationship is:

``` text
Namespace
   ↓
API/resource scope
   ↓
RBAC + quotas + policies + security + ownership
   ↓
Workloads
```

------------------------------------------------------------------------

# 226. Quick Reference

## Create

``` bash
kubectl create namespace mynamespace
```

## List

``` bash
kubectl get namespaces
```

## Inspect

``` bash
kubectl describe namespace mynamespace
```

## YAML

``` bash
kubectl get namespace mynamespace -o yaml
```

## Use namespace

``` bash
kubectl get pods -n mynamespace
```

## All namespaces

``` bash
kubectl get pods -A
```

## Set current namespace

``` bash
kubectl config set-context --current --namespace=mynamespace
```

## Delete

``` bash
kubectl delete namespace mynamespace
```

## Namespaced resources

``` bash
kubectl api-resources --namespaced=true
```

## Cluster-scoped resources

``` bash
kubectl api-resources --namespaced=false
```

## Quota

``` bash
kubectl get resourcequota -n mynamespace
```

## LimitRange

``` bash
kubectl get limitrange -n mynamespace
```

## RBAC

``` bash
kubectl get role,rolebinding -n mynamespace
```

## NetworkPolicy

``` bash
kubectl get networkpolicy -n mynamespace
```

## Permission test

``` bash
kubectl auth can-i --list -n mynamespace
```

------------------------------------------------------------------------

# 227. Final Takeaway

A Kubernetes Namespace is best understood as:

> **A logical, API-level boundary used to scope Kubernetes resources and
> apply organizational, authorization, resource, security, and
> operational controls within a cluster.**

It is **not**:

-   a VM
-   a node
-   a network
-   a subnet
-   a VPC
-   a Linux network namespace
-   a complete security boundary
-   a separate Kubernetes cluster

The most important architecture is:

``` text
                  CLUSTER
                     |
                NAMESPACE
                     |
       +-------------+-------------+
       |             |             |
      RBAC        QUOTAS        POLICIES
       |             |             |
       +-------------+-------------+
                     |
                 WORKLOADS
                     |
              +------+------+
              |             |
             PODS        SERVICES
              |
             CNI
              |
           NETWORK
```

Once this mental model is clear, many Kubernetes topics become easier to
understand because you can always ask:

1.  **Is this resource namespaced or cluster-scoped?**
2.  **Who can access it?** → RBAC
3.  **How much can it consume?** → ResourceQuota / LimitRange
4.  **Who can communicate with it?** → NetworkPolicy
5.  **What security standard applies?** → Pod Security / admission
6.  **Where does the actual workload run?** → Node
7.  **How does networking actually work?** → CNI / Service / DNS

That is the core of Kubernetes Namespace architecture.
