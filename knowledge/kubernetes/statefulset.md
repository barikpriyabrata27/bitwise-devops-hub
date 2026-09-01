# Kubernetes StatefulSet --- Complete Study & Reference Guide

> A comprehensive practical guide to Kubernetes StatefulSets: stable
> identity, stable network names, persistent storage, ordered deployment
> and termination, rolling updates, partitions, PVC templates, headless
> Services, Pod identity, StatefulSet update strategies, scaling,
> failure recovery, troubleshooting, production patterns, hands-on labs,
> and interview questions.

------------------------------------------------------------------------

# 1. What Is a StatefulSet?

A **StatefulSet** is a Kubernetes workload controller designed for
applications that require stable identity and/or persistent storage.

Typical examples:

``` text
Databases
Message brokers
Distributed databases
ZooKeeper-like systems
Kafka-like systems
Search clusters
Storage systems
Clustered applications
```

The key difference from a Deployment is:

``` text
Deployment
=
interchangeable Pods

StatefulSet
=
Pods with stable identity
```

------------------------------------------------------------------------

# 2. Why Do We Need StatefulSets?

Deployments are excellent for stateless applications.

Example:

``` text
web-7d8f6
web-7d8f6
web-7d8f6
```

These Pods are generally interchangeable.

But a database cluster may require:

``` text
db-0
db-1
db-2
```

where each member has a stable identity.

StatefulSet provides that identity.

------------------------------------------------------------------------

# 3. StatefulSet Mental Model

``` text
StatefulSet
     |
     +----> Pod 0
     |
     +----> Pod 1
     |
     +----> Pod 2
```

Instead of random names, Pods have predictable ordinal identities:

``` text
app-0
app-1
app-2
```

------------------------------------------------------------------------

# 4. StatefulSet vs Deployment

  -----------------------------------------------------------------------
  Feature                 Deployment              StatefulSet
  ----------------------- ----------------------- -----------------------
  Pod identity            Usually interchangeable Stable

  Pod names               Generated with          Predictable ordinal
                          ReplicaSet hash         

  Stable storage identity Not automatic           Supported through PVC
                                                  templates

  Ordered startup         No                      Supported

  Ordered termination     No                      Supported

  Common use              Stateless apps          Stateful/distributed
                                                  apps

  Stable network identity Service-based           Commonly with Headless
                                                  Service
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 5. StatefulSet Does Not Automatically Make an Application Stateful

This is extremely important.

Creating:

``` yaml
kind: StatefulSet
```

does not magically make an application:

``` text
database-safe
distributed
HA
consistent
durable
```

The application itself must understand how to use:

``` text
stable identity
persistent storage
replication
leader election
quorum
```

------------------------------------------------------------------------

# 6. StatefulSet Basic Architecture

``` text
                  StatefulSet
                       |
          +------------+------------+
          |            |            |
          v            v            v
        Pod-0        Pod-1        Pod-2
          |            |            |
          v            v            v
        PVC-0        PVC-1        PVC-2
          |            |            |
          v            v            v
      Persistent    Persistent    Persistent
       Storage       Storage       Storage
```

------------------------------------------------------------------------

# 7. StatefulSet and Headless Service

A StatefulSet commonly works with a **Headless Service**.

``` text
Headless Service
       |
       +--> Pod-0
       +--> Pod-1
       +--> Pod-2
```

Headless Service:

``` yaml
clusterIP: None
```

provides DNS-based discovery of individual StatefulSet Pods.

------------------------------------------------------------------------

# 8. Stable Pod Identity

Suppose:

``` yaml
metadata:
  name: database
```

and:

``` yaml
replicas: 3
```

Pods are typically:

``` text
database-0
database-1
database-2
```

The ordinal identity is stable.

------------------------------------------------------------------------

# 9. Pod Identity Survives Pod Replacement

Suppose:

``` text
database-1
```

is deleted.

StatefulSet creates another Pod with:

``` text
database-1
```

The new Pod has the same logical ordinal identity.

However, its Pod IP can change.

Therefore:

``` text
Pod name
=
stable identity

Pod IP
=
not stable
```

------------------------------------------------------------------------

# 10. Stable Network Identity

With a governing Headless Service:

``` text
database
```

a StatefulSet Pod can have a stable DNS identity based on its Pod name
and Service.

Conceptually:

``` text
database-0.database.default.svc.cluster.local
database-1.database.default.svc.cluster.local
database-2.database.default.svc.cluster.local
```

The exact DNS suffix depends on the namespace and cluster domain.

------------------------------------------------------------------------

# 11. Why Stable Network Identity Matters

Distributed applications may need to know:

``` text
Who am I?
Who is node 0?
Who is node 1?
Who is node 2?
```

Stable identities allow applications to form predictable cluster
membership.

Example:

``` text
db-0
db-1
db-2
```

------------------------------------------------------------------------

# 12. Stable Storage

StatefulSets commonly use:

``` yaml
volumeClaimTemplates:
```

This creates a PVC for each Pod.

Example:

``` text
db-0 -> data-db-0
db-1 -> data-db-1
db-2 -> data-db-2
```

------------------------------------------------------------------------

# 13. PVC Template

Example:

``` yaml
volumeClaimTemplates:
  - metadata:
      name: data

    spec:
      accessModes:
        - ReadWriteOnce

      resources:
        requests:
          storage: 10Gi
```

For 3 replicas, Kubernetes creates a separate PVC for each StatefulSet
Pod.

------------------------------------------------------------------------

# 14. StatefulSet Storage Mental Model

``` text
StatefulSet
    |
    +--> Pod db-0 --> PVC data-db-0
    |
    +--> Pod db-1 --> PVC data-db-1
    |
    +--> Pod db-2 --> PVC data-db-2
```

Each identity gets its own storage claim.

------------------------------------------------------------------------

# 15. PVC Names

If StatefulSet:

``` text
name: database
```

and volumeClaimTemplate:

``` text
name: data
```

Pods:

``` text
database-0
database-1
database-2
```

PVCs are typically named:

``` text
data-database-0
data-database-1
data-database-2
```

------------------------------------------------------------------------

# 16. StatefulSet Does Not Provide Storage by Itself

StatefulSet creates PVC objects from templates.

A StorageClass/provisioner normally provisions the actual storage.

Architecture:

``` text
StatefulSet
     |
     v
PVC
     |
     v
StorageClass / Provisioner
     |
     v
PersistentVolume
     |
     v
Storage backend
```

------------------------------------------------------------------------

# 17. StorageClass

A StorageClass defines a class of dynamically provisioned storage.

Example:

``` yaml
storageClassName: standard
```

The actual StorageClass name depends on your cluster.

Check:

``` bash
kubectl get storageclass
```

------------------------------------------------------------------------

# 18. Access Modes

Common access modes include:

``` text
ReadWriteOnce (RWO)
ReadOnlyMany (ROX)
ReadWriteMany (RWX)
ReadWriteOncePod (RWOP)
```

Support depends on the storage driver.

Do not assume every storage backend supports every access mode.

------------------------------------------------------------------------

# 19. StatefulSet Example

``` yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web

spec:
  serviceName: web
  replicas: 3

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
          image: nginx:1.27

          ports:
            - name: http
              containerPort: 80

          volumeMounts:
            - name: data
              mountPath: /data

  volumeClaimTemplates:
    - metadata:
        name: data

      spec:
        accessModes:
          - ReadWriteOnce

        resources:
          requests:
            storage: 1Gi
```

------------------------------------------------------------------------

# 20. Governing Service

The `serviceName` field identifies the governing Service for the
StatefulSet.

Example:

``` yaml
serviceName: web
```

Typically this points to a Headless Service:

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  clusterIP: None
  selector:
    app: web
  ports:
    - name: http
      port: 80
```

------------------------------------------------------------------------

# 21. Complete StatefulSet + Headless Service

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: database
spec:
  clusterIP: None

  selector:
    app: database

  ports:
    - name: db
      port: 5432
      targetPort: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database

spec:
  serviceName: database
  replicas: 3

  selector:
    matchLabels:
      app: database

  template:
    metadata:
      labels:
        app: database

    spec:
      containers:
        - name: database
          image: example/database:1.0

          ports:
            - name: db
              containerPort: 5432

          volumeMounts:
            - name: data
              mountPath: /var/lib/database

  volumeClaimTemplates:
    - metadata:
        name: data

      spec:
        accessModes:
          - ReadWriteOnce

        resources:
          requests:
            storage: 10Gi
```

------------------------------------------------------------------------

# 22. StatefulSet Creation Order

By default, StatefulSets use ordered Pod management.

For a StatefulSet with:

``` text
replicas: 3
```

Pods are normally created in ordinal order:

``` text
database-0
database-1
database-2
```

With the default `OrderedReady` Pod management policy, the next Pod is
created after the previous one is considered ready.

------------------------------------------------------------------------

# 23. Parallel Pod Management

StatefulSets also support:

``` yaml
podManagementPolicy: Parallel
```

Example:

``` yaml
spec:
  podManagementPolicy: Parallel
```

This allows StatefulSet Pods to be started or stopped without waiting
for ordinal ordering.

Use it only when the application does not require strict ordered
management.

------------------------------------------------------------------------

# 24. OrderedReady vs Parallel

``` text
OrderedReady
=
ordered lifecycle management

Parallel
=
Pods can be created/terminated without ordinal waiting
```

Default:

``` text
OrderedReady
```

------------------------------------------------------------------------

# 25. StatefulSet Termination Order

With ordered management, termination generally proceeds in reverse
ordinal order.

Example:

``` text
database-2
database-1
database-0
```

This can matter for distributed systems.

------------------------------------------------------------------------

# 26. Why Reverse Termination?

Distributed applications may have dependencies.

For example:

``` text
leader
followers
```

or:

``` text
coordinators
workers
```

The application may expect members to leave the cluster in a particular
order.

------------------------------------------------------------------------

# 27. Scaling StatefulSet

Initial:

``` yaml
replicas: 2
```

Pods:

``` text
db-0
db-1
```

Scale:

``` bash
kubectl scale statefulset database --replicas=4
```

New Pods:

``` text
db-2
db-3
```

------------------------------------------------------------------------

# 28. Scaling Down

From:

``` text
db-0
db-1
db-2
db-3
```

scale to:

``` text
replicas: 2
```

Pods removed are normally the highest ordinals first:

``` text
db-3
db-2
```

Remaining:

``` text
db-0
db-1
```

------------------------------------------------------------------------

# 29. What Happens to PVCs When Scaling Down?

This is an important StatefulSet behavior.

Scaling down does not automatically mean the associated PVCs are
immediately deleted.

For example:

``` text
db-0 -> data-db-0
db-1 -> data-db-1
db-2 -> data-db-2
```

After scaling from 3 to 2, the PVC for `db-2` may remain.

This protects persistent data from automatic loss.

------------------------------------------------------------------------

# 30. PVC Retention Policies

StatefulSets support PVC retention policies.

Example:

``` yaml
persistentVolumeClaimRetentionPolicy:
  whenDeleted: Retain
  whenScaled: Retain
```

Possible policies include:

``` text
Retain
Delete
```

depending on the lifecycle event.

------------------------------------------------------------------------

# 31. Why PVC Retention Matters

Without careful storage lifecycle planning:

``` text
scale down
```

could create unexpected storage behavior.

For databases, retaining PVCs is often desirable.

Always understand your storage and backup strategy.

------------------------------------------------------------------------

# 32. StatefulSet Update Strategy

StatefulSets support update strategies including:

``` text
RollingUpdate
OnDelete
```

Default:

``` text
RollingUpdate
```

------------------------------------------------------------------------

# 33. RollingUpdate

Example:

``` yaml
updateStrategy:
  type: RollingUpdate
```

When the Pod template changes, StatefulSet performs an ordered update.

Conceptually:

``` text
old db-2
old db-1
old db-0

update one
wait

new db-2

then next
```

The exact ordering is controlled by StatefulSet semantics and
configuration.

------------------------------------------------------------------------

# 34. Partitioned Rolling Updates

StatefulSets support:

``` yaml
rollingUpdate:
  partition: 2
```

This can be used to control which ordinals are updated.

Example:

``` text
partition = 2
```

Higher ordinals are updated first, while lower ordinals remain on the
old revision until the partition changes.

This is useful for staged rollouts.

------------------------------------------------------------------------

# 35. StatefulSet `OnDelete`

Example:

``` yaml
updateStrategy:
  type: OnDelete
```

The controller updates the StatefulSet revision, but existing Pods are
not automatically recreated just because the template changed.

Pods are replaced when they are manually deleted or otherwise recreated.

------------------------------------------------------------------------

# 36. StatefulSet Revision

StatefulSets use ControllerRevisions to track Pod template revisions.

Check:

``` bash
kubectl get controllerrevision
```

This helps Kubernetes manage updates and rollback-related state.

------------------------------------------------------------------------

# 37. StatefulSet Rollout Status

Use:

``` bash
kubectl rollout status statefulset/database
```

This shows rollout progress.

------------------------------------------------------------------------

# 38. StatefulSet Rollback

If a rollout has a problem, inspect:

``` bash
kubectl rollout history statefulset/database
```

Depending on the situation and Kubernetes version, rollback/revision
management may require explicit handling.

Do not assume rollback is identical to Deployment behavior.

------------------------------------------------------------------------

# 39. StatefulSet and Pod Ordinals

Each StatefulSet Pod has an ordinal.

For:

``` text
database-0
database-1
database-2
```

the ordinals are:

``` text
0
1
2
```

These identify the Pod's position in the StatefulSet.

------------------------------------------------------------------------

# 40. Start Ordinal

Modern Kubernetes supports configuring the starting ordinal for
StatefulSet Pods.

Example:

``` yaml
ordinals:
  start: 10
```

The resulting Pods can begin with:

``` text
database-10
database-11
database-12
```

Use this only when your application architecture requires it.

------------------------------------------------------------------------

# 41. StatefulSet and Identity

The stable identity can be thought of as:

``` text
StatefulSet name
+
ordinal
```

For example:

``` text
database-0
```

This identity is more important than the Pod IP.

------------------------------------------------------------------------

# 42. Pod IP Can Change

Suppose:

``` text
database-0
IP = 10.244.1.10
```

Pod is deleted.

Replacement:

``` text
database-0
IP = 10.244.3.15
```

Stable:

``` text
database-0
```

Changed:

``` text
Pod IP
```

------------------------------------------------------------------------

# 43. DNS and StatefulSet

A common pattern:

``` text
database-0.database
database-1.database
database-2.database
```

or fully qualified:

``` text
database-0.database.default.svc.cluster.local
```

This gives applications predictable network names.

------------------------------------------------------------------------

# 44. StatefulSet + Headless Service Architecture

``` text
                 Headless Service
                       |
          +------------+------------+
          |            |            |
          v            v            v
       db-0          db-1         db-2
          |            |            |
          v            v            v
       PVC-0         PVC-1        PVC-2
```

This is one of the most important StatefulSet patterns.

------------------------------------------------------------------------

# 45. StatefulSet and Service Are Different

StatefulSet:

``` text
workload lifecycle
identity
storage claims
ordered management
```

Service:

``` text
network access
service discovery
load distribution
```

They complement each other.

------------------------------------------------------------------------

# 46. StatefulSet and Deployment

Deployment:

``` text
web
web
web
```

StatefulSet:

``` text
db-0
db-1
db-2
```

Use StatefulSet when identity/storage/order matters.

------------------------------------------------------------------------

# 47. StatefulSet and ReplicaSet

Deployment uses:

``` text
Deployment
    |
    v
ReplicaSet
    |
    v
Pods
```

StatefulSet manages its Pods directly through StatefulSet controller
mechanisms rather than creating a ReplicaSet as Deployments do.

------------------------------------------------------------------------

# 48. StatefulSet and PVC

Typical architecture:

``` text
StatefulSet
     |
     +--> db-0 --> PVC
     |
     +--> db-1 --> PVC
     |
     +--> db-2 --> PVC
```

Each Pod gets its own claim from the volumeClaimTemplate.

------------------------------------------------------------------------

# 49. StatefulSet and StorageClass

``` text
StatefulSet
    |
    v
volumeClaimTemplates
    |
    v
PVC
    |
    v
StorageClass
    |
    v
Dynamic Provisioner
    |
    v
Persistent Storage
```

------------------------------------------------------------------------

# 50. StatefulSet and ConfigMap

A StatefulSet can use ConfigMaps for configuration.

Example:

``` yaml
envFrom:
  - configMapRef:
      name: database-config
```

or:

``` yaml
volumes:
  - name: config
    configMap:
      name: database-config
```

------------------------------------------------------------------------

# 51. StatefulSet and Secret

Databases often need credentials.

Example:

``` yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: database-secret
        key: password
```

Architecture:

``` text
StatefulSet
 |
 +--> Secret
 |
 +--> PVC
 |
 +--> Headless Service
```

------------------------------------------------------------------------

# 52. StatefulSet and Resource Requests/Limits

Example:

``` yaml
resources:
  requests:
    cpu: 500m
    memory: 1Gi

  limits:
    cpu: 1
    memory: 2Gi
```

Stateful workloads should have carefully planned resource reservations
because:

``` text
memory pressure
CPU starvation
eviction
```

can cause serious application-level problems.

------------------------------------------------------------------------

# 53. StatefulSet and Readiness Probe

Readiness is especially important for distributed systems.

Example:

``` yaml
readinessProbe:
  exec:
    command:
      - sh
      - -c
      - /usr/local/bin/check-ready
```

A Pod may be:

``` text
Running
```

but not yet ready to participate in application traffic.

------------------------------------------------------------------------

# 54. StatefulSet and Liveness Probe

Liveness determines whether Kubernetes should restart a container.

Example:

``` yaml
livenessProbe:
  exec:
    command:
      - sh
      - -c
      - /usr/local/bin/check-health
```

Be careful with aggressive liveness probes for databases.

An incorrect liveness probe can cause restart loops.

------------------------------------------------------------------------

# 55. Startup Probe

Slow-starting databases may benefit from:

``` yaml
startupProbe:
```

This prevents liveness checks from killing the container before
initialization completes.

------------------------------------------------------------------------

# 56. StatefulSet and Pod Disruption Budget

For distributed workloads, consider:

``` text
PodDisruptionBudget
```

A PDB can limit voluntary disruptions.

Example:

``` yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: database-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: database
```

A PDB does not protect against every type of failure.

------------------------------------------------------------------------

# 57. StatefulSet and Anti-Affinity

For high availability, distribute replicas across nodes.

Example:

``` yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          topologyKey: kubernetes.io/hostname
          labelSelector:
            matchLabels:
              app: database
```

This reduces the chance that all replicas land on one node.

------------------------------------------------------------------------

# 58. StatefulSet and Topology Spread

You can use:

``` yaml
topologySpreadConstraints:
```

to distribute replicas across:

``` text
nodes
zones
regions
```

depending on cluster topology.

This is often useful for highly available stateful applications.

------------------------------------------------------------------------

# 59. StatefulSet Scheduling

Stateful workloads need more than just:

``` text
replicas: 3
```

Consider:

``` text
node capacity
storage topology
anti-affinity
topology spread
PodDisruptionBudget
zone distribution
```

------------------------------------------------------------------------

# 60. StatefulSet Storage Topology

Some storage systems are tied to specific:

``` text
node
zone
region
```

The scheduler must place Pods where their volumes can be attached.

StorageClass and CSI driver behavior matters.

------------------------------------------------------------------------

# 61. StatefulSet and CSI

Modern Kubernetes storage commonly uses CSI drivers.

Conceptual flow:

``` text
StatefulSet
   |
   v
PVC
   |
   v
CSI
   |
   v
Storage backend
```

Examples include cloud block storage and distributed storage systems.

------------------------------------------------------------------------

# 62. StatefulSet Does Not Equal Database HA

Three database Pods do not automatically mean:

``` text
HA
```

You still need:

``` text
replication
quorum
leader election
failure handling
backup
restore
```

The database software must support these concepts.

------------------------------------------------------------------------

# 63. Example Database Cluster

Conceptually:

``` text
             StatefulSet
                  |
       +----------+----------+
       |          |          |
       v          v          v
      db-0       db-1       db-2
       |          |          |
      PVC        PVC        PVC
       |          |          |
       +----------+----------+
                  |
             Replication
```

------------------------------------------------------------------------

# 64. Leader and Follower

A distributed database might use:

``` text
db-0 = leader
db-1 = follower
db-2 = follower
```

But Kubernetes itself does not decide which Pod is the database leader.

The database software does.

------------------------------------------------------------------------

# 65. Quorum

A distributed system may require quorum.

For:

``` text
3 nodes
```

a majority is:

``` text
2
```

For:

``` text
5 nodes
```

a majority is:

``` text
3
```

Kubernetes does not automatically implement your application's quorum
protocol.

------------------------------------------------------------------------

# 66. Stable Identity Helps Cluster Membership

Applications can use:

``` text
db-0
db-1
db-2
```

to build a known set of cluster members.

This is why StatefulSets are useful for distributed systems.

------------------------------------------------------------------------

# 67. StatefulSet and Network Policies

NetworkPolicy should allow required communication between replicas.

For example:

``` text
db-0 <--> db-1
db-0 <--> db-2
db-1 <--> db-2
```

if the database requires peer communication.

------------------------------------------------------------------------

# 68. StatefulSet and Service Types

You may use multiple Services.

Example:

``` text
Headless Service
=
individual Pod discovery

ClusterIP Service
=
client access to database cluster
```

This can separate:

``` text
cluster membership
```

from:

``` text
application client traffic
```

------------------------------------------------------------------------

# 69. Example Two-Service Database Pattern

``` text
                 Client
                   |
                   v
             database-client
                ClusterIP
                   |
          +--------+--------+
          |        |        |
          v        v        v
        db-0     db-1     db-2

Headless Service:
database
   |
   +--> db-0
   +--> db-1
   +--> db-2
```

Whether this architecture is appropriate depends on the database.

------------------------------------------------------------------------

# 70. StatefulSet and DNS Records

Headless Service DNS can provide:

``` text
service-level discovery
```

and StatefulSet Pod-specific records can provide:

``` text
individual member discovery
```

This distinction is important.

------------------------------------------------------------------------

# 71. StatefulSet Service Discovery

Application can discover:

``` text
database
```

for the Service.

Or individual members:

``` text
database-0.database
database-1.database
database-2.database
```

------------------------------------------------------------------------

# 72. StatefulSet Example With Redis-Like Cluster

Conceptually:

``` text
redis-0
redis-1
redis-2
```

Each Pod:

``` text
stable identity
persistent volume
```

Headless Service:

``` text
redis
```

The Redis software is responsible for cluster membership and
replication.

------------------------------------------------------------------------

# 73. StatefulSet Example With Kafka-Like Cluster

Conceptually:

``` text
broker-0
broker-1
broker-2
```

Each broker can have:

``` text
stable identity
persistent storage
stable DNS
```

The Kafka software handles:

``` text
replication
partitions
leader election
```

Kubernetes provides the underlying workload and networking primitives.

------------------------------------------------------------------------

# 74. StatefulSet Example With Elasticsearch-Like Cluster

``` text
es-0
es-1
es-2
```

Each can have:

``` text
PVC
stable identity
network identity
```

The application handles cluster state.

------------------------------------------------------------------------

# 75. StatefulSet Lifecycle

``` text
Create StatefulSet
       |
       v
Create db-0
       |
       v
db-0 Ready
       |
       v
Create db-1
       |
       v
db-1 Ready
       |
       v
Create db-2
       |
       v
db-2 Ready
```

Default ordered behavior follows StatefulSet lifecycle semantics.

------------------------------------------------------------------------

# 76. StatefulSet Pod Replacement

``` text
db-1
 |
 X
deleted
 |
 v
new db-1
 |
 v
same ordinal identity
 |
 v
new Pod IP
```

Storage and network identity can be preserved through the StatefulSet
pattern.

------------------------------------------------------------------------

# 77. StatefulSet During Node Failure

Suppose:

``` text
Node A:
db-0

Node B:
db-1

Node C:
db-2
```

Node A fails.

Kubernetes may eventually recreate `db-0` on another eligible node,
subject to:

``` text
node recovery
scheduler
volume attachment
storage constraints
readiness
application behavior
```

The PVC remains associated with the StatefulSet Pod identity according
to storage lifecycle behavior.

------------------------------------------------------------------------

# 78. StatefulSet During Storage Failure

If a volume cannot attach:

``` text
Pod may remain Pending
```

Check:

``` bash
kubectl describe pod <pod>
kubectl describe pvc <pvc>
kubectl get pv
kubectl get events
```

------------------------------------------------------------------------

# 79. StatefulSet Pending Pod Troubleshooting

If:

``` text
db-1
Pending
```

check:

``` bash
kubectl describe pod db-1
```

Look for:

``` text
FailedScheduling
volume binding
node constraints
insufficient resources
taints
affinity
```

------------------------------------------------------------------------

# 80. PVC Troubleshooting

Check:

``` bash
kubectl get pvc
```

If:

``` text
Pending
```

check:

``` bash
kubectl describe pvc <pvc>
kubectl get storageclass
kubectl get pv
```

------------------------------------------------------------------------

# 81. StatefulSet Service Troubleshooting

Check:

``` bash
kubectl get svc
kubectl get endpointslices
```

For Headless Service:

``` bash
kubectl get svc database
```

should show:

``` text
CLUSTER-IP
None
```

------------------------------------------------------------------------

# 82. DNS Troubleshooting

From a temporary Pod:

``` bash
kubectl run dns-test \
  --image=busybox:1.36 \
  --rm -it -- sh
```

Then:

``` bash
nslookup database
```

and:

``` bash
nslookup database-0.database
```

------------------------------------------------------------------------

# 83. StatefulSet Pod Not Ready

Check:

``` bash
kubectl get pods
kubectl describe pod <pod>
kubectl logs <pod>
```

Investigate:

``` text
startup
readiness
configuration
storage
cluster membership
DNS
credentials
application logs
```

------------------------------------------------------------------------

# 84. StatefulSet Rollout Stuck

Check:

``` bash
kubectl rollout status statefulset/database
```

Then:

``` bash
kubectl get pods
kubectl describe pod <pod>
kubectl logs <pod>
kubectl get events --sort-by='.lastTimestamp'
```

------------------------------------------------------------------------

# 85. Common Problem: One Pod Blocks the Rollout

With ordered rolling behavior, one unhealthy ordinal can prevent later
updates.

Example:

``` text
db-0 updated
db-0 healthy

db-1 updated
db-1 unhealthy

db-2
not updated
```

Investigate the failing Pod before forcing changes.

------------------------------------------------------------------------

# 86. Common Problem: Wrong Headless Service

StatefulSet:

``` yaml
serviceName: database
```

Service:

``` text
db-service
```

This mismatch can break the expected StatefulSet DNS identity pattern.

Make sure `serviceName` references the intended governing Service.

------------------------------------------------------------------------

# 87. Common Problem: Service Selector Wrong

Service:

``` yaml
selector:
  app: database
```

Pods:

``` yaml
labels:
  app: db
```

Result:

``` text
no endpoints
```

------------------------------------------------------------------------

# 88. Common Problem: StorageClass Missing

PVC:

``` text
Pending
```

Check:

``` bash
kubectl get storageclass
```

If the requested StorageClass does not exist, dynamic provisioning may
fail.

------------------------------------------------------------------------

# 89. Common Problem: Volume Attach Failure

Check:

``` bash
kubectl describe pod <pod>
kubectl get events --sort-by='.lastTimestamp'
```

Look for:

``` text
FailedAttachVolume
FailedMount
Multi-Attach
```

The exact event depends on the storage implementation.

------------------------------------------------------------------------

# 90. Common Problem: RWO Volume on Multiple Nodes

With a storage backend supporting only:

``` text
ReadWriteOnce
```

a volume may not be mountable simultaneously on multiple nodes.

Do not assume RWO means "read-write by exactly one process"; its precise
semantics depend on Kubernetes/storage implementation, but it commonly
constrains writable attachment to one node.

------------------------------------------------------------------------

# 91. Common Problem: Deleting StatefulSet

Before deleting:

``` bash
kubectl delete statefulset database
```

understand what happens to:

``` text
Pods
PVCs
PVs
storage backend
```

StatefulSet deletion and PVC deletion are separate lifecycle concerns.

Do not assume deleting the StatefulSet automatically destroys persistent
data.

------------------------------------------------------------------------

# 92. Safe StatefulSet Deletion Planning

Before destructive operations:

``` text
1. Confirm backups
2. Check PVCs
3. Check PVs
4. Check retention policies
5. Understand storage reclaim policy
6. Confirm application recovery procedure
```

------------------------------------------------------------------------

# 93. Backup Is Mandatory for Important Data

A StatefulSet is not a backup solution.

You still need:

``` text
database backups
snapshot strategy
off-cluster copies
restore testing
```

------------------------------------------------------------------------

# 94. Disaster Recovery

For production stateful applications, plan:

``` text
backup
restore
replication
failure recovery
regional recovery
storage recovery
DNS recovery
```

Test the recovery process.

------------------------------------------------------------------------

# 95. StatefulSet Security

Consider:

``` text
Secrets
NetworkPolicy
TLS
RBAC
Pod Security
non-root containers
read-only filesystems where possible
resource limits
image security
```

------------------------------------------------------------------------

# 96. StatefulSet With Secret

Example:

``` yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: database-secret
        key: password
```

Never put plaintext credentials directly in a public manifest
repository.

------------------------------------------------------------------------

# 97. StatefulSet With ConfigMap

Example:

``` yaml
envFrom:
  - configMapRef:
      name: database-config
```

Use ConfigMap for non-sensitive configuration.

Use Secret for sensitive values.

------------------------------------------------------------------------

# 98. StatefulSet Security Context

Example:

``` yaml
securityContext:
  runAsNonRoot: true
```

Container-specific security settings may also be required.

Always verify that the actual database image supports the chosen
security context.

------------------------------------------------------------------------

# 99. StatefulSet and Pod Security

Production workloads should consider:

``` text
least privilege
non-root execution
capability dropping
seccomp
read-only root filesystem
resource limits
```

Application compatibility must be tested.

------------------------------------------------------------------------

# 100. StatefulSet and NetworkPolicy

Example concept:

``` text
Client namespace
       |
       v
Database Service
       |
       v
Database Pods

Database Pods
   <--> peer communication
```

NetworkPolicy should allow only required paths.

------------------------------------------------------------------------

# 101. StatefulSet and TLS

For sensitive distributed systems:

``` text
client
  |
 TLS
  v
Service
  |
 TLS
  v
Database
```

Certificates can be stored in Kubernetes Secrets or managed through a
certificate management system.

------------------------------------------------------------------------

# 102. StatefulSet and Monitoring

Monitor:

``` text
Pod health
storage latency
storage capacity
replication lag
leader status
quorum
CPU
memory
network
restart count
PVC status
```

Kubernetes metrics alone are not enough for database health.

------------------------------------------------------------------------

# 103. StatefulSet and Logging

Use:

``` bash
kubectl logs <pod>
```

But also use application-specific logging/monitoring systems.

For distributed systems, correlate logs by:

``` text
Pod name
ordinal
node
cluster member ID
request ID
```

------------------------------------------------------------------------

# 104. StatefulSet and Autoscaling

Horizontal scaling of stateful systems is not equivalent to stateless
scaling.

Do not blindly apply:

``` text
HPA
```

to databases.

The application must understand:

``` text
new member
rebalance
replication
partition assignment
quorum
```

------------------------------------------------------------------------

# 105. StatefulSet Scaling Is Application-Aware

Example:

``` text
Scale 3 -> 5
```

Kubernetes creates:

``` text
db-3
db-4
```

But the database software must decide:

``` text
How to join cluster?
How to replicate?
How to rebalance?
```

------------------------------------------------------------------------

# 106. StatefulSet and PDB

For 3 replicas:

``` yaml
minAvailable: 2
```

This helps limit voluntary disruption.

But if the application requires quorum, design the PDB around the
application's actual failure model.

------------------------------------------------------------------------

# 107. StatefulSet and Node Maintenance

Before draining a node containing stateful workloads:

``` bash
kubectl drain <node>
```

understand:

``` text
PDB
volume attachment
storage topology
application quorum
replication
```

A node drain is not automatically safe for every database.

------------------------------------------------------------------------

# 108. StatefulSet and Storage Backups

Use storage snapshots where supported.

But database-consistent backups may require application-aware
procedures.

For databases:

``` text
filesystem snapshot
```

is not automatically equivalent to:

``` text
transactionally consistent backup
```

------------------------------------------------------------------------

# 109. StatefulSet and Readiness

A database might be:

``` text
process running
```

but not:

``` text
ready to accept application traffic
```

Use application-aware readiness checks.

------------------------------------------------------------------------

# 110. StatefulSet and Liveness Caution

Avoid probes that interpret temporary database overload as permanent
failure.

Bad liveness design:

``` text
database slow
    |
    v
liveness fails
    |
    v
restart
    |
    v
database recovers slowly
    |
    v
probe fails again
```

This can create a restart storm.

------------------------------------------------------------------------

# 111. StatefulSet and Startup Probe

Use startup probes for:

``` text
large databases
recovery after crash
WAL/log replay
index recovery
large data sets
```

when startup can legitimately take a long time.

------------------------------------------------------------------------

# 112. StatefulSet and Resource Requests

Example:

``` yaml
resources:
  requests:
    cpu: "1"
    memory: "2Gi"
```

Requests help the scheduler find a node with enough capacity.

------------------------------------------------------------------------

# 113. StatefulSet and Resource Limits

Example:

``` yaml
limits:
  cpu: "2"
  memory: "4Gi"
```

Be careful with memory limits for databases.

An OOM kill can be much more disruptive than temporary CPU contention.

------------------------------------------------------------------------

# 114. StatefulSet and QoS

Container resource configuration influences Pod QoS class.

For critical stateful workloads, understand whether the resulting QoS
class matches your reliability goals.

------------------------------------------------------------------------

# 115. StatefulSet and Node Affinity

Use node affinity when storage or workload requirements demand it.

Example:

``` yaml
nodeAffinity:
```

Possible use cases:

``` text
SSD nodes
specific zones
special hardware
storage locality
```

------------------------------------------------------------------------

# 116. StatefulSet and Taints/Tolerations

Dedicated database nodes can be configured using:

``` text
taints
+
tolerations
```

This can isolate stateful workloads from general applications.

------------------------------------------------------------------------

# 117. StatefulSet and Pod Anti-Affinity

Prefer spreading database replicas:

``` text
Node A -> db-0
Node B -> db-1
Node C -> db-2
```

rather than:

``` text
Node A -> db-0
Node A -> db-1
Node A -> db-2
```

This improves resilience against node failure.

------------------------------------------------------------------------

# 118. StatefulSet and Zone Distribution

For a multi-zone cluster:

``` text
Zone A -> db-0
Zone B -> db-1
Zone C -> db-2
```

This can improve availability.

But storage replication and database replication must also support the
topology.

------------------------------------------------------------------------

# 119. StatefulSet Production Architecture

``` text
                         Clients
                            |
                            v
                    Client Service
                       ClusterIP
                            |
               +------------+------------+
               |            |            |
               v            v            v
             db-0         db-1         db-2
               |            |            |
              PVC          PVC          PVC
               |            |            |
               +------------+------------+
                            |
                       Application
                       Replication
```

Headless Service:

``` text
database
```

provides stable member discovery.

------------------------------------------------------------------------

# 120. Complete Production-Style Example

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: database
spec:
  clusterIP: None

  selector:
    app: database

  ports:
    - name: db
      port: 5432
      targetPort: db
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database

spec:
  serviceName: database

  replicas: 3

  podManagementPolicy: OrderedReady

  updateStrategy:
    type: RollingUpdate

  selector:
    matchLabels:
      app: database

  template:
    metadata:
      labels:
        app: database

    spec:
      terminationGracePeriodSeconds: 60

      containers:
        - name: database
          image: example/database:1.0

          ports:
            - name: db
              containerPort: 5432

          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "1"
              memory: "2Gi"

          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: password

          readinessProbe:
            exec:
              command:
                - sh
                - -c
                - /usr/local/bin/check-ready
            periodSeconds: 10

          startupProbe:
            exec:
              command:
                - sh
                - -c
                - /usr/local/bin/check-started
            periodSeconds: 10
            failureThreshold: 30

          volumeMounts:
            - name: data
              mountPath: /var/lib/database

  volumeClaimTemplates:
    - metadata:
        name: data

      spec:
        accessModes:
          - ReadWriteOnce

        resources:
          requests:
            storage: 20Gi
```

------------------------------------------------------------------------

# 121. Apply StatefulSet

``` bash
kubectl apply -f statefulset.yaml
```

Watch:

``` bash
kubectl get pods -w
```

------------------------------------------------------------------------

# 122. Check StatefulSet

``` bash
kubectl get statefulset
```

or:

``` bash
kubectl get sts
```

------------------------------------------------------------------------

# 123. Describe StatefulSet

``` bash
kubectl describe statefulset database
```

Check:

``` text
replicas
serviceName
pod management policy
update strategy
volumeClaimTemplates
conditions
events
```

------------------------------------------------------------------------

# 124. Check StatefulSet Pods

``` bash
kubectl get pods -l app=database
```

Expected:

``` text
database-0
database-1
database-2
```

------------------------------------------------------------------------

# 125. Check PVCs

``` bash
kubectl get pvc
```

Expected pattern:

``` text
data-database-0
data-database-1
data-database-2
```

------------------------------------------------------------------------

# 126. Check PVs

``` bash
kubectl get pv
```

You should see PersistentVolumes bound to the PVCs if dynamic
provisioning is working.

------------------------------------------------------------------------

# 127. Check StorageClass

``` bash
kubectl get storageclass
```

------------------------------------------------------------------------

# 128. Check Service

``` bash
kubectl get svc database
```

For a Headless Service:

``` text
CLUSTER-IP
None
```

------------------------------------------------------------------------

# 129. Check EndpointSlices

``` bash
kubectl get endpointslices \
  -l kubernetes.io/service-name=database
```

------------------------------------------------------------------------

# 130. Test Stateful DNS

Create test Pod:

``` bash
kubectl run dns-test \
  --image=busybox:1.36 \
  --rm -it -- sh
```

Then:

``` bash
nslookup database
```

and:

``` bash
nslookup database-0.database
```

------------------------------------------------------------------------

# 131. Test All Stateful Pod DNS Names

``` bash
nslookup database-0.database
nslookup database-1.database
nslookup database-2.database
```

Verify that the expected records resolve in your cluster.

------------------------------------------------------------------------

# 132. Scale StatefulSet

``` bash
kubectl scale statefulset database --replicas=5
```

Watch:

``` bash
kubectl get pods -w
```

New Pods:

``` text
database-3
database-4
```

------------------------------------------------------------------------

# 133. Scale Down

``` bash
kubectl scale statefulset database --replicas=3
```

Observe:

``` text
database-4
database-3
```

being removed according to StatefulSet lifecycle semantics.

Check PVCs afterward:

``` bash
kubectl get pvc
```

------------------------------------------------------------------------

# 134. Delete One Stateful Pod

``` bash
kubectl delete pod database-1
```

Watch:

``` bash
kubectl get pods -w
```

A replacement should use:

``` text
database-1
```

------------------------------------------------------------------------

# 135. Verify Stable Identity After Deletion

Before deletion:

``` text
database-1
```

After recreation:

``` text
database-1
```

The Pod IP may be different.

This demonstrates:

``` text
stable identity
!=
stable IP
```

------------------------------------------------------------------------

# 136. Verify Persistent Storage

Write a test file to the mounted volume:

``` bash
kubectl exec database-0 -- sh -c \
  'echo hello > /data/test.txt'
```

Delete the Pod:

``` bash
kubectl delete pod database-0
```

After replacement:

``` bash
kubectl exec database-0 -- cat /data/test.txt
```

Whether this exact test works depends on your example image and mount
path, but the goal is to verify that the replacement Pod reuses the same
PVC.

------------------------------------------------------------------------

# 137. Inspect PVC Association

``` bash
kubectl get pvc
```

Then:

``` bash
kubectl describe pvc data-database-0
```

This shows storage binding information.

------------------------------------------------------------------------

# 138. Rolling Update Lab

Change:

``` yaml
image: example/database:1.1
```

Apply:

``` bash
kubectl apply -f statefulset.yaml
```

Watch:

``` bash
kubectl rollout status statefulset/database
```

and:

``` bash
kubectl get pods -w
```

------------------------------------------------------------------------

# 139. Partitioned Update Lab

Configure:

``` yaml
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    partition: 2
```

Update the image.

Observe which ordinals update.

Then reduce:

``` text
partition
```

to progressively roll the remaining Pods.

------------------------------------------------------------------------

# 140. OnDelete Lab

Configure:

``` yaml
updateStrategy:
  type: OnDelete
```

Change the container image.

Observe that existing Pods do not automatically restart merely because
the template changed.

Delete one Pod:

``` bash
kubectl delete pod database-0
```

Observe that the replacement uses the updated template.

------------------------------------------------------------------------

# 141. Parallel Management Lab

Set:

``` yaml
podManagementPolicy: Parallel
```

Scale the StatefulSet.

Observe that Pods can be created without strict ordinal readiness
sequencing.

Only use this when your application supports it.

------------------------------------------------------------------------

# 142. Storage Failure Lab

Use a test StatefulSet with an intentionally invalid StorageClass.

Observe:

``` text
PVC Pending
Pod Pending
```

Then inspect:

``` bash
kubectl describe pvc <pvc>
kubectl describe pod <pod>
```

Fix the StorageClass.

------------------------------------------------------------------------

# 143. Selector Failure Lab

Change Service:

``` yaml
selector:
  app: wrong
```

Then:

``` bash
kubectl get endpointslices
```

Observe the loss of expected endpoints.

Fix the selector.

------------------------------------------------------------------------

# 144. Readiness Failure Lab

Make the readiness probe fail.

Observe:

``` bash
kubectl get pods
kubectl get endpointslices
```

The Pod can be running while not serving normal Service traffic.

------------------------------------------------------------------------

# 145. Node Failure Lab

If you have a safe test cluster:

1.  Spread StatefulSet replicas across nodes.
2.  Simulate node unavailability.
3.  Observe Pod scheduling.
4.  Observe volume attachment.
5.  Observe readiness.
6.  Observe application recovery.

Never perform destructive node tests on production without a validated
plan.

------------------------------------------------------------------------

# 146. StatefulSet Troubleshooting Commands

``` bash
kubectl get sts

kubectl describe sts <statefulset>

kubectl get pods -o wide

kubectl describe pod <pod>

kubectl logs <pod>

kubectl get pvc

kubectl describe pvc <pvc>

kubectl get pv

kubectl get storageclass

kubectl get svc

kubectl get endpointslices

kubectl describe endpointslice <slice>

kubectl get events --sort-by='.lastTimestamp'

kubectl rollout status statefulset/<name>
```

------------------------------------------------------------------------

# 147. Troubleshooting Decision Tree

``` text
Stateful Pod not running
          |
          v
Pod Pending?
     |
   Yes
     |
     +--> Resources?
     +--> Storage?
     +--> Scheduling?
     +--> Affinity?
     +--> Taints?
     +--> Volume topology?
     |
    No
     |
     v
Pod Running but not Ready?
     |
   Yes
     |
     +--> Readiness probe
     +--> Application startup
     +--> Cluster membership
     +--> DNS
     +--> Configuration
     |
    No
     |
     v
Service not reachable?
     |
     +--> Selector
     +--> EndpointSlices
     +--> DNS
     +--> NetworkPolicy
     +--> Service ports
```

------------------------------------------------------------------------

# 148. Interview Question --- What Is StatefulSet?

Answer:

> StatefulSet is a Kubernetes workload controller designed for
> applications that require stable Pod identity, stable network identity
> and/or persistent storage. It supports ordered lifecycle management
> and per-Pod persistent volume claims.

------------------------------------------------------------------------

# 149. Interview Question --- StatefulSet vs Deployment?

Answer:

> Deployment is primarily intended for interchangeable stateless Pods,
> while StatefulSet provides stable ordinal identity and integrates with
> persistent storage and ordered lifecycle behavior for stateful or
> distributed workloads.

------------------------------------------------------------------------

# 150. Interview Question --- Why Does StatefulSet Use Pod Names Like `db-0`?

Answer:

> StatefulSet assigns each Pod a stable ordinal identity, allowing
> distributed applications to refer to members predictably.

------------------------------------------------------------------------

# 151. Interview Question --- What Happens When `db-1` Is Deleted?

Answer:

> StatefulSet recreates the missing ordinal, typically with the same Pod
> name `db-1`. Its Pod IP may change.

------------------------------------------------------------------------

# 152. Interview Question --- Does StatefulSet Give Stable Pod IPs?

Answer:

> No. Pod IPs can change. StatefulSet provides stable identity, while
> stable DNS naming is commonly provided using a governing Headless
> Service.

------------------------------------------------------------------------

# 153. Interview Question --- Why Use a Headless Service?

Answer:

> A Headless Service (`clusterIP: None`) supports direct endpoint
> discovery rather than providing a normal virtual ClusterIP. It is
> commonly used with StatefulSets so individual Pods can be discovered
> through DNS.

------------------------------------------------------------------------

# 154. Interview Question --- What Is `serviceName`?

Answer:

> `serviceName` identifies the governing Service associated with the
> StatefulSet and is commonly the name of its Headless Service used for
> stable network identity.

------------------------------------------------------------------------

# 155. Interview Question --- What Is `volumeClaimTemplates`?

Answer:

> `volumeClaimTemplates` defines a template from which Kubernetes
> creates a separate PVC for each StatefulSet Pod.

------------------------------------------------------------------------

# 156. Interview Question --- Does StatefulSet Create PVs?

Answer:

> StatefulSet creates PVCs from its volumeClaimTemplates. A
> StorageClass/provisioner may then dynamically create the underlying
> PersistentVolumes.

------------------------------------------------------------------------

# 157. Interview Question --- What Happens to PVCs When StatefulSet Scales Down?

Answer:

> PVCs are generally retained rather than automatically deleted merely
> because the replica count decreases. StatefulSet PVC retention
> policies can be configured for specific lifecycle behavior.

------------------------------------------------------------------------

# 158. Interview Question --- What Is `podManagementPolicy`?

Answer:

> It controls whether StatefulSet Pods are managed in ordered fashion
> (`OrderedReady`) or without ordinal waiting (`Parallel`).

------------------------------------------------------------------------

# 159. Interview Question --- What Is `OrderedReady`?

Answer:

> It manages Pods in ordinal order and waits for the preceding Pod to
> become ready before progressing to the next Pod.

------------------------------------------------------------------------

# 160. Interview Question --- What Is `Parallel`?

Answer:

> It allows StatefulSet Pods to be created or terminated without waiting
> for ordinal readiness sequencing.

------------------------------------------------------------------------

# 161. Interview Question --- What Is StatefulSet RollingUpdate?

Answer:

> RollingUpdate updates StatefulSet Pods according to StatefulSet's
> ordered update semantics, normally proceeding from the highest ordinal
> toward the lowest.

------------------------------------------------------------------------

# 162. Interview Question --- What Is a StatefulSet Partition?

Answer:

> A RollingUpdate partition allows staged updates by controlling the
> lowest ordinal that is automatically updated. Higher ordinals are
> updated while lower ordinals remain on the previous revision until the
> partition is changed.

------------------------------------------------------------------------

# 163. Interview Question --- What Is `OnDelete`?

Answer:

> With OnDelete, changes to the Pod template do not automatically
> replace existing Pods. Pods must be deleted or otherwise recreated to
> receive the new template.

------------------------------------------------------------------------

# 164. Interview Question --- Does StatefulSet Provide Replication?

Answer:

> Kubernetes creates multiple Pods, but application-level data
> replication is the responsibility of the stateful application or
> database system.

------------------------------------------------------------------------

# 165. Interview Question --- Does StatefulSet Make a Database Highly Available?

Answer:

> No. StatefulSet provides workload primitives such as identity, storage
> and lifecycle ordering. Database replication, quorum, leader election,
> failover and backup must be provided by the database system and
> operational design.

------------------------------------------------------------------------

# 166. Interview Question --- Why Is StatefulSet Useful for Databases?

Answer:

> Databases often require stable member identity and persistent storage.
> StatefulSet can provide predictable Pod identities and per-Pod PVCs,
> which are useful building blocks for database clusters.

------------------------------------------------------------------------

# 167. Interview Question --- Why Not Use Deployment for a Database?

Answer:

> A Deployment can run a database, but it does not inherently provide
> the stable ordinal identity and per-Pod persistent storage model that
> many clustered stateful applications require.

------------------------------------------------------------------------

# 168. Interview Question --- StatefulSet vs ReplicaSet?

Answer:

> ReplicaSet maintains a desired number of interchangeable Pods.
> StatefulSet maintains Pods with stable ordinal identities and supports
> stateful lifecycle and storage patterns.

------------------------------------------------------------------------

# 169. Interview Question --- Can StatefulSet Use a Normal ClusterIP Service?

Answer:

> Yes. StatefulSet Pods can be exposed through normal Services. A
> Headless Service is commonly used when individual Pod discovery and
> stable DNS identities are required.

------------------------------------------------------------------------

# 170. Interview Question --- Why Do StatefulSet Pods Need Stable DNS?

Answer:

> Distributed applications may need to identify individual cluster
> members. Stable DNS names allow members to discover one another even
> if Pod IPs change.

------------------------------------------------------------------------

# 171. Interview Question --- What Happens to Data When a Stateful Pod Is Deleted?

Answer:

> If the Pod uses a persistent volume through its StatefulSet PVC, the
> storage claim and underlying data can remain available for the
> replacement Pod, subject to storage lifecycle configuration and
> application behavior.

------------------------------------------------------------------------

# 172. Interview Question --- What Happens If a Node Hosting a Stateful Pod Fails?

Answer:

> Kubernetes can recreate the Pod on another eligible node, but recovery
> also depends on storage attachment, topology constraints, scheduling,
> readiness and the application's own recovery behavior.

------------------------------------------------------------------------

# 173. Interview Question --- Why Is My StatefulSet Pod Pending?

Check:

``` text
CPU/memory
PVC
StorageClass
PV
volume binding
node affinity
taints
tolerations
storage topology
Pod anti-affinity
```

------------------------------------------------------------------------

# 174. Interview Question --- Why Is My PVC Pending?

Check:

``` bash
kubectl describe pvc <pvc>
kubectl get storageclass
kubectl get pv
```

Possible causes:

``` text
no StorageClass
invalid StorageClass
provisioner unavailable
capacity issue
topology constraints
storage backend failure
```

------------------------------------------------------------------------

# 175. Interview Question --- Why Is My StatefulSet Stuck During Rollout?

Check:

``` text
Pod readiness
application startup
storage
image
configuration
probe
cluster quorum
logs
```

One unhealthy Pod can prevent ordered rollout progression.

------------------------------------------------------------------------

# 176. Interview Question --- StatefulSet vs Headless Service?

They solve different problems.

``` text
StatefulSet
=
stable workload identity/storage/lifecycle

Headless Service
=
network discovery
```

They are frequently used together.

------------------------------------------------------------------------

# 177. Interview Question --- StatefulSet vs PVC?

``` text
StatefulSet
=
workload management

PVC
=
persistent storage request
```

A StatefulSet can create PVCs using:

``` text
volumeClaimTemplates
```

------------------------------------------------------------------------

# 178. Interview Question --- Can StatefulSet Be Stateless?

Technically yes, but that is usually unnecessary.

If you do not need:

``` text
stable identity
ordered lifecycle
per-Pod persistent storage
```

a Deployment is often simpler.

------------------------------------------------------------------------

# 179. Interview Question --- What Is the Most Important StatefulSet Concept?

Answer:

> Stable identity.

Think:

``` text
db-0
db-1
db-2
```

rather than:

``` text
random interchangeable Pods
```

------------------------------------------------------------------------

# 180. Production Best Practices

1.  Use StatefulSet only when its features are required.
2.  Use a Headless Service for stable member discovery when appropriate.
3.  Use `volumeClaimTemplates` for per-Pod persistent storage.
4.  Use application-aware readiness probes.
5.  Use startup probes for slow initialization.
6.  Configure resource requests and limits carefully.
7.  Spread replicas across nodes/zones.
8.  Use PodDisruptionBudgets where appropriate.
9.  Use NetworkPolicies.
10. Secure credentials with Secrets.

------------------------------------------------------------------------

# 181. More Production Best Practices

11. Use TLS for sensitive communication.
12. Monitor storage latency and capacity.
13. Monitor application replication and quorum.
14. Back up important data.
15. Test restores.
16. Understand PVC retention.
17. Understand StorageClass behavior.
18. Test node and storage failure.
19. Avoid aggressive liveness probes.
20. Document recovery procedures.

------------------------------------------------------------------------

# 182. StatefulSet Security Checklist

``` text
[ ] Secrets used for credentials
[ ] TLS configured where required
[ ] NetworkPolicy configured
[ ] Least privilege
[ ] Non-root where supported
[ ] Secure images
[ ] Resource limits
[ ] Pod security controls
[ ] Restricted network exposure
[ ] Backups protected
```

------------------------------------------------------------------------

# 183. StatefulSet Reliability Checklist

``` text
[ ] Multiple replicas where appropriate
[ ] Replicas distributed across nodes
[ ] Zone distribution where appropriate
[ ] Persistent storage
[ ] Storage backups
[ ] Application replication
[ ] Quorum understood
[ ] Readiness probe
[ ] Startup probe
[ ] PDB
[ ] Failure testing
```

------------------------------------------------------------------------

# 184. StatefulSet Operations Checklist

``` text
[ ] Check StatefulSet
[ ] Check Pods
[ ] Check PVCs
[ ] Check PVs
[ ] Check StorageClass
[ ] Check Service
[ ] Check EndpointSlices
[ ] Check DNS
[ ] Check events
[ ] Check application logs
```

------------------------------------------------------------------------

# 185. StatefulSet Command Cheat Sheet

``` bash
# List StatefulSets
kubectl get statefulsets

# Short form
kubectl get sts

# Describe
kubectl describe sts <name>

# Get YAML
kubectl get sts <name> -o yaml

# List StatefulSet Pods
kubectl get pods -l app=<label>

# Watch Pods
kubectl get pods -w

# Scale
kubectl scale sts <name> --replicas=3

# Rollout status
kubectl rollout status sts/<name>

# Rollout history
kubectl rollout history sts/<name>

# PVCs
kubectl get pvc

# PVs
kubectl get pv

# StorageClasses
kubectl get storageclass

# Services
kubectl get svc

# EndpointSlices
kubectl get endpointslices

# Logs
kubectl logs <pod>

# Previous container logs
kubectl logs <pod> --previous

# Pod details
kubectl describe pod <pod>

# Events
kubectl get events --sort-by='.lastTimestamp'

# Execute command
kubectl exec -it <pod> -- sh
```

------------------------------------------------------------------------

# 186. StatefulSet Quick Comparison

``` text
Deployment
    |
    +--> interchangeable Pods
    +--> ReplicaSet
    +--> stateless applications

StatefulSet
    |
    +--> stable Pod identity
    +--> ordinal names
    +--> per-Pod PVCs
    +--> ordered lifecycle
    +--> stateful/distributed applications
```

------------------------------------------------------------------------

# 187. The Most Important Architecture

``` text
                  StatefulSet
                       |
          +------------+------------+
          |            |            |
          v            v            v
        db-0         db-1         db-2
          |            |            |
          v            v            v
       PVC-0         PVC-1        PVC-2
          |            |            |
          +------------+------------+
                       |
                       v
                Persistent Storage

                  Headless Service
                       |
          +------------+------------+
          |            |            |
          v            v            v
        db-0         db-1         db-2
```

------------------------------------------------------------------------

# 188. Final Mental Model

Remember these four things:

``` text
1. Stable identity
   db-0
   db-1
   db-2

2. Stable discovery
   Headless Service + DNS

3. Stable storage
   volumeClaimTemplates + PVCs

4. Ordered lifecycle
   creation/update/termination semantics
```

------------------------------------------------------------------------

# 189. StatefulSet vs Deployment --- Final Memory Trick

Think:

``` text
Deployment:

"Any healthy Pod can serve."

StatefulSet:

"This specific Pod identity matters."
```

Deployment:

``` text
web-abc
web-xyz
web-pqr
```

StatefulSet:

``` text
db-0
db-1
db-2
```

------------------------------------------------------------------------

# 190. Complete Kubernetes Stateful Application Stack

``` text
                         Client
                           |
                           v
                    Client Service
                       ClusterIP
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
           db-0          db-1          db-2
             |             |             |
             v             v             v
           PVC-0         PVC-1         PVC-2
             |             |             |
             +-------------+-------------+
                           |
                    Persistent Storage

Headless Service:
database
    |
    +--> db-0
    +--> db-1
    +--> db-2

Secrets:
    |
    +--> credentials

ConfigMap:
    |
    +--> configuration

NetworkPolicy:
    |
    +--> allowed traffic

Monitoring:
    |
    +--> database health
    +--> replication
    +--> storage
    +--> quorum
```

------------------------------------------------------------------------

# 191. Final Interview-Ready Explanation

> A Kubernetes StatefulSet is a workload controller designed for
> stateful and distributed applications that require stable identity,
> stable network discovery and/or persistent storage. StatefulSet Pods
> receive predictable ordinal names such as `database-0`, `database-1`,
> and `database-2`. A governing Headless Service is commonly used to
> provide stable DNS-based discovery of individual Pods.
> `volumeClaimTemplates` creates a separate PVC for each StatefulSet
> Pod, allowing each member to have persistent storage. StatefulSets
> also support ordered or parallel Pod management, rolling updates,
> partitioned updates, and configurable PVC retention behavior. However,
> StatefulSet does not itself provide database replication, quorum,
> leader election, backups, or high availability; those responsibilities
> belong to the stateful application and the overall platform design.

------------------------------------------------------------------------

# 192. One-Line Summary

> **StatefulSet = stable identity + stable discovery + per-Pod
> persistent storage + controlled lifecycle for stateful workloads.**
