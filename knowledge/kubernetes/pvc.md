# Kubernetes PersistentVolumeClaim (PVC) --- Complete Study & Reference Guide

> A practical, detailed guide to Kubernetes PersistentVolumeClaims:
> PV/PVC architecture, StorageClasses, dynamic provisioning, access
> modes, volume modes, binding, CSI, reclaim policies, StatefulSets,
> expansion, snapshots, cloning, troubleshooting, security, production
> practices, YAML examples, labs, and interview questions.

------------------------------------------------------------------------

# 1. What Is a PersistentVolumeClaim?

A **PersistentVolumeClaim (PVC)** is a Kubernetes API object through
which a workload requests persistent storage.

The easiest mental model is:

``` text
Pod
 |
 | asks for storage
 v
PVC
 |
 | binds to
 v
PV
 |
 | backed by
 v
Actual Storage
```

A PVC is therefore a **request for storage**, not the physical storage
itself.

------------------------------------------------------------------------

# 2. Why Do We Need PVCs?

Containers are generally considered ephemeral.

If a container is recreated:

``` text
Container A
    |
    v
Container deleted
    |
    v
Container B
```

data stored only inside the container filesystem may disappear.

Persistent storage separates application lifecycle from container
lifecycle.

``` text
Pod lifecycle
     |
     X
     |
Persistent storage
     |
     v
Data survives container replacement
```

The exact persistence behavior depends on the storage backend and
reclaim/lifecycle configuration.

------------------------------------------------------------------------

# 3. PVC vs PV

This is the most important distinction.

## PVC

A **PersistentVolumeClaim** is:

> A request for storage by a user/workload.

## PV

A **PersistentVolume** is:

> A Kubernetes representation of persistent storage that can satisfy a
> claim.

Think:

``` text
PVC = "I need 100 GiB"

PV = "I provide 100 GiB"

Storage = "The actual disk/filesystem/block storage"
```

------------------------------------------------------------------------

# 4. PVC Mental Model

Imagine renting an apartment.

``` text
PVC
=
"I need a 2-bedroom apartment."

PV
=
"Here is an available 2-bedroom apartment."

Storage backend
=
"The actual building."
```

The application usually interacts with the PVC through a Pod.

------------------------------------------------------------------------

# 5. PVC Is Namespaced

A PVC is a **namespaced resource**.

Example:

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
  namespace: production
```

Therefore:

``` text
production/app-data
```

is different from:

``` text
development/app-data
```

------------------------------------------------------------------------

# 6. PV Is Cluster-Scoped

A PersistentVolume is **not namespaced**.

Use:

``` bash
kubectl get pv
```

not:

``` bash
kubectl get pv -n production
```

Remember:

``` text
PVC = namespaced
PV  = cluster-scoped
```

This is a very common Kubernetes interview question.

------------------------------------------------------------------------

# 7. Storage Architecture

A simplified architecture:

``` text
                     Kubernetes Cluster
                            |
                     +------+------+
                     |             |
                    Pod           Pod
                     |             |
                    PVC           PVC
                     |             |
                     v             v
                    PV            PV
                     |             |
                     +------+------+
                            |
                       Storage backend
                            |
             +--------------+--------------+
             |              |              |
          Cloud disk     NFS/Ceph       SAN/etc.
```

Modern Kubernetes commonly uses **CSI drivers** to integrate with
storage systems.

------------------------------------------------------------------------

# 8. StorageClass

A **StorageClass** describes a class/type of storage and commonly
enables dynamic provisioning.

Example:

``` yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: example.com/csi
parameters:
  type: ssd
```

A PVC can request:

``` yaml
storageClassName: fast
```

------------------------------------------------------------------------

# 9. Static vs Dynamic Provisioning

There are two broad approaches.

## Static provisioning

Administrator creates PVs first:

``` text
Admin
 |
 v
PV
 |
 v
PVC
 |
 v
Pod
```

## Dynamic provisioning

PVC requests storage:

``` text
PVC
 |
 v
StorageClass
 |
 v
CSI provisioner
 |
 v
PV
 |
 v
Storage
```

Dynamic provisioning is the common approach in modern clusters.

------------------------------------------------------------------------

# 10. Dynamic Provisioning

Example PVC:

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  storageClassName: fast
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
```

The storage system can dynamically provision the required volume.

Conceptually:

``` text
PVC
 |
 | request 100Gi
 v
StorageClass
 |
 v
CSI Controller
 |
 v
Cloud/storage API
 |
 v
Volume created
 |
 v
PV created
 |
 v
PVC bound
```

------------------------------------------------------------------------

# 11. PVC YAML Structure

Typical PVC:

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
  namespace: production
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast
  resources:
    requests:
      storage: 100Gi
```

Important fields:

``` text
metadata.name
metadata.namespace
spec.accessModes
spec.storageClassName
spec.resources.requests.storage
```

------------------------------------------------------------------------

# 12. `apiVersion`

PVC uses the core Kubernetes API:

``` yaml
apiVersion: v1
```

------------------------------------------------------------------------

# 13. `kind`

``` yaml
kind: PersistentVolumeClaim
```

This tells Kubernetes that the object is a PVC.

------------------------------------------------------------------------

# 14. PVC Name

``` yaml
metadata:
  name: app-data
```

The name must be unique within its namespace.

You can have:

``` text
development/app-data
production/app-data
```

------------------------------------------------------------------------

# 15. Storage Request

Example:

``` yaml
resources:
  requests:
    storage: 100Gi
```

This means:

> The workload requests 100 GiB of storage.

It is a storage capacity request, not a CPU/memory request.

------------------------------------------------------------------------

# 16. Storage Units

Kubernetes storage commonly uses:

``` text
Ki
Mi
Gi
Ti
Pi
Ei
```

and decimal units such as:

``` text
K
M
G
T
P
E
```

Be careful about the distinction between binary and decimal units.

Common examples:

``` text
10Gi
100Gi
1Ti
```

------------------------------------------------------------------------

# 17. Access Modes

PVC access modes describe how a volume can be mounted.

Common modes:

``` text
ReadWriteOnce
ReadOnlyMany
ReadWriteMany
```

Newer Kubernetes/storage implementations may also support:

``` text
ReadWriteOncePod
```

The actual supported modes depend on the storage driver/backend.

------------------------------------------------------------------------

# 18. ReadWriteOnce --- RWO

``` text
ReadWriteOnce
```

means the volume can be mounted read-write by a single **node**.

Important:

> RWO is not exactly the same as "only one Pod."

Multiple Pods on the same node may potentially use the volume, depending
on the storage implementation and mount behavior.

This distinction is important.

------------------------------------------------------------------------

# 19. ReadOnlyMany --- ROX

``` text
ReadOnlyMany
```

means the volume can be mounted read-only by multiple nodes.

Availability depends on the storage backend and CSI driver.

Not every storage system supports ROX.

------------------------------------------------------------------------

# 20. ReadWriteMany --- RWX

``` text
ReadWriteMany
```

allows the volume to be mounted read-write by multiple nodes.

Typical technologies that may support this include:

-   NFS
-   CephFS
-   enterprise shared filesystems
-   some cloud file services

Support depends on the CSI driver.

------------------------------------------------------------------------

# 21. ReadWriteOncePod --- RWOP

``` text
ReadWriteOncePod
```

provides stronger single-Pod semantics than RWO.

It is intended to ensure the volume is mounted read-write by only one
Pod at a time across the cluster, subject to CSI/storage support and
Kubernetes version requirements.

Use it when true single-Pod attachment semantics are required.

------------------------------------------------------------------------

# 22. Access Mode Comparison

  Mode   Concept
  ------ --------------------------------
  RWO    Read/write from one node
  ROX    Read-only from multiple nodes
  RWX    Read/write from multiple nodes
  RWOP   Read/write by one Pod

Do not assume every StorageClass supports every mode.

------------------------------------------------------------------------

# 23. Access Modes Are Not Performance Guarantees

Access mode tells you about attachment/mount semantics.

It does not guarantee:

-   IOPS
-   latency
-   throughput
-   replication
-   durability
-   backup
-   availability

Those properties come from the storage implementation.

------------------------------------------------------------------------

# 24. VolumeMode

PVCs can use:

``` text
Filesystem
Block
```

## Filesystem

The volume is presented as a filesystem.

``` yaml
volumeMode: Filesystem
```

This is the common default.

## Block

The volume is exposed as a raw block device.

``` yaml
volumeMode: Block
```

Useful for applications that manage their own block-level storage.

------------------------------------------------------------------------

# 25. Filesystem Volume

Typical:

``` yaml
volumeMode: Filesystem
```

The application sees something like:

``` text
/mnt/data
```

The storage is mounted as a filesystem.

------------------------------------------------------------------------

# 26. Raw Block Volume

Example:

``` yaml
volumeMode: Block
```

The application receives a block device rather than a mounted
filesystem.

This requires application support for raw block devices.

------------------------------------------------------------------------

# 27. PVC Binding

PVC lifecycle commonly includes:

``` text
Pending
Bound
Lost
```

The normal successful lifecycle is:

``` text
Pending
   |
   v
Bound
```

------------------------------------------------------------------------

# 28. Pending PVC

A PVC in:

``` text
Pending
```

means it has not successfully obtained a suitable volume.

Possible causes:

-   no matching PV
-   StorageClass problem
-   CSI driver problem
-   topology constraints
-   insufficient capacity
-   unsupported access mode
-   provisioning failure
-   delayed binding behavior

------------------------------------------------------------------------

# 29. Bound PVC

``` text
PVC
 |
 v
PV
```

When bound, the PVC has an associated PV.

Check:

``` bash
kubectl get pvc -n production
```

Example:

``` text
NAME       STATUS   VOLUME     CAPACITY
app-data   Bound    pvc-123    100Gi
```

------------------------------------------------------------------------

# 30. PVC Status

Useful command:

``` bash
kubectl get pvc -n production
```

More detail:

``` bash
kubectl describe pvc app-data -n production
```

The Events section is especially useful for provisioning failures.

------------------------------------------------------------------------

# 31. PVC and PV Relationship

A simplified relationship:

``` text
Namespace: production

PVC:
app-data
   |
   | bound to
   v
PV:
pvc-123
   |
   | backed by
   v
Actual volume
```

The PVC is the application's storage request.

------------------------------------------------------------------------

# 32. PVC and Pod

A Pod normally references a PVC.

Example:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: nginx
      volumeMounts:
        - name: data
          mountPath: /data

  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: app-data
```

------------------------------------------------------------------------

# 33. Pod → PVC → PV

The full chain:

``` text
Pod
 |
 | claimName
 v
PVC
 |
 | bound to
 v
PV
 |
 v
CSI / storage backend
 |
 v
Actual storage
```

Memorize this.

------------------------------------------------------------------------

# 34. `volumeMounts` vs `volumes`

Two separate sections exist.

Container:

``` yaml
volumeMounts:
  - name: data
    mountPath: /data
```

Pod:

``` yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: app-data
```

The names must match:

``` text
data
```

------------------------------------------------------------------------

# 35. Complete Pod + PVC Example

PVC:

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

Pod:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: nginx
      volumeMounts:
        - name: data
          mountPath: /data

  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: app-data
```

------------------------------------------------------------------------

# 36. What Happens During Pod Restart?

Suppose:

``` text
Pod A
 |
 v
PVC
 |
 v
PV
```

Pod A is deleted.

A replacement Pod can mount the same PVC, assuming storage
attachment/mount constraints permit it.

``` text
Pod A
   X
   |
   v
PVC
 |
 v
PV
 |
 v
Pod B
```

This is one of the main reasons persistent storage exists.

------------------------------------------------------------------------

# 37. Container Restart vs Pod Replacement

If only the container restarts:

``` text
Pod remains
PVC remains mounted
```

If the Pod is deleted and recreated:

``` text
PVC remains
new Pod mounts same PVC
```

assuming the PVC itself has not been deleted and storage can be
attached/mounted.

------------------------------------------------------------------------

# 38. PVC Does Not Belong to a Container

A PVC belongs to a namespace.

A Pod references it.

Therefore:

``` text
PVC
 |
 +-- Pod A
 |
 +-- Pod B
```

may be possible depending on access mode/storage behavior.

The PVC is not intrinsically tied to one container.

------------------------------------------------------------------------

# 39. PVC and Deployment

A Deployment can use a PVC.

Example:

``` text
Deployment
    |
    +-- Pod
    |    |
    |    +-- PVC
    |
    +-- Pod
         |
         +-- PVC
```

Whether multiple replicas can safely use one PVC depends on the storage
access mode and application behavior.

------------------------------------------------------------------------

# 40. RWO and Deployments

A common problem:

``` text
Deployment replicas = 3
PVC = RWO
```

If all replicas need simultaneous read/write access and are spread
across different nodes, the storage may not support that arrangement.

The result can be:

``` text
Pod A -> volume attached
Pod B -> cannot attach
Pod C -> cannot attach
```

depending on the backend.

For shared read/write access, consider RWX-compatible storage or a
different architecture.

------------------------------------------------------------------------

# 41. StatefulSet and PVC

StatefulSets are particularly important for persistent storage.

A StatefulSet can use:

``` yaml
volumeClaimTemplates:
```

to create a PVC per Pod.

Example:

``` text
StatefulSet
   |
   +-- Pod-0
   |     |
   |     +-- PVC data-pod-0
   |
   +-- Pod-1
         |
         +-- PVC data-pod-1
```

This gives each replica its own storage identity.

------------------------------------------------------------------------

# 42. `volumeClaimTemplates`

Example:

``` yaml
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
            storage: 100Gi
```

------------------------------------------------------------------------

# 43. StatefulSet Storage Identity

For three replicas:

``` text
database-0 -> data-database-0
database-1 -> data-database-1
database-2 -> data-database-2
```

This is different from having all replicas share one PVC.

------------------------------------------------------------------------

# 44. Why StatefulSets Use PVC Templates

Stateful applications often require:

``` text
Pod identity
+
stable network identity
+
stable storage identity
```

StatefulSet provides mechanisms for these stable identities.

------------------------------------------------------------------------

# 45. PVC Retention and StatefulSets

StatefulSet PVC behavior should be understood carefully.

Depending on Kubernetes version and StatefulSet configuration, PVC
retention policies can control whether PVCs are retained or deleted when
StatefulSet or Pod lifecycle events occur.

Do not assume:

``` text
delete StatefulSet
=
delete all PVCs
```

Always inspect the actual configuration and Kubernetes version.

------------------------------------------------------------------------

# 46. Reclaim Policy

PV has a reclaim policy.

Common values:

``` text
Retain
Delete
```

This is a property of the PV/StorageClass behavior and affects what
happens after the claim is released.

------------------------------------------------------------------------

# 47. Retain

Conceptually:

``` text
PVC deleted
   |
   v
PV released
   |
   v
Storage retained
```

The data/storage is preserved for administrative recovery or reuse
workflows.

This is often useful for important production data.

------------------------------------------------------------------------

# 48. Delete

Conceptually:

``` text
PVC deleted
   |
   v
PV released
   |
   v
Provisioned storage deleted
```

Exact behavior depends on the storage provisioner.

For dynamically provisioned cloud volumes, Delete is commonly used when
automatic cleanup is desired.

------------------------------------------------------------------------

# 49. Reclaim Policy Warning

Never choose:

``` text
Delete
```

simply because it is convenient.

For production databases, understand:

``` text
PVC lifecycle
+
PV reclaim policy
+
StorageClass
+
CSI driver
+
cloud/storage backend
+
backup strategy
```

------------------------------------------------------------------------

# 50. PVC Deletion

Command:

``` bash
kubectl delete pvc app-data -n production
```

This deletes the Kubernetes PVC object.

It does **not** mean you should automatically assume physical data is
destroyed.

The final outcome depends on:

-   PV reclaim policy
-   dynamic provisioning
-   CSI driver
-   backend
-   snapshots/backups

------------------------------------------------------------------------

# 51. PVC Deletion and Data Safety

Before deleting a production PVC:

``` text
1. Check PV
2. Check reclaim policy
3. Check backups
4. Check snapshots
5. Check application state
6. Check whether another Pod uses it
```

Useful commands:

``` bash
kubectl get pvc app-data -n production
kubectl get pv <pv-name> -o yaml
```

------------------------------------------------------------------------

# 52. StorageClass

StorageClass provides a way to describe storage classes.

Example conceptual classes:

``` text
fast-ssd
standard
archive
shared-filesystem
```

A cluster might have:

``` text
StorageClass
├── fast-ssd
├── standard
└── shared-rwx
```

------------------------------------------------------------------------

# 53. StorageClass Parameters

Example:

``` yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: example.com/csi
parameters:
  type: ssd
```

Parameters are driver-specific.

Do not copy parameters from one cloud/provider to another without
understanding the CSI driver.

------------------------------------------------------------------------

# 54. `storageClassName`

PVC:

``` yaml
storageClassName: fast
```

requests a volume from that StorageClass.

If omitted, Kubernetes may use the cluster's default StorageClass, if
one is configured and the PVC semantics allow it.

------------------------------------------------------------------------

# 55. Default StorageClass

A cluster can have a default StorageClass.

Inspect:

``` bash
kubectl get storageclass
```

You may see an annotation indicating the default.

A PVC without an explicit `storageClassName` can then use the default
class.

------------------------------------------------------------------------

# 56. Explicit vs Default StorageClass

Explicit:

``` yaml
storageClassName: fast
```

Advantages:

-   predictable
-   portable within your platform conventions
-   clear intent

Default:

``` yaml
# storageClassName omitted
```

Advantages:

-   simpler manifests
-   environment can choose its default

For production, make the choice deliberate.

------------------------------------------------------------------------

# 57. Empty StorageClass Name

There is an important distinction between:

``` yaml
storageClassName: ""
```

and omitting:

``` yaml
storageClassName
```

An empty string can explicitly request no StorageClass for static
provisioning scenarios.

Omission can allow default StorageClass behavior.

Do not treat them as identical.

------------------------------------------------------------------------

# 58. Volume Binding Mode

StorageClass can define:

``` text
Immediate
WaitForFirstConsumer
```

These affect when dynamic provisioning/binding occurs.

------------------------------------------------------------------------

# 59. Immediate Binding

With:

``` yaml
volumeBindingMode: Immediate
```

volume provisioning/binding can happen as soon as the PVC is created.

This may be fine for storage without topology constraints.

------------------------------------------------------------------------

# 60. WaitForFirstConsumer

With:

``` yaml
volumeBindingMode: WaitForFirstConsumer
```

volume provisioning/binding waits until a Pod consuming the PVC is
created and scheduling information is available.

This can help topology-aware storage.

------------------------------------------------------------------------

# 61. Why WaitForFirstConsumer Matters

Suppose:

``` text
Storage available in zone A
Pod scheduled in zone B
```

A topology-aware storage system may need to know where the Pod will run
before provisioning the volume.

The flow becomes:

``` text
PVC
 |
 v
Pod created
 |
 v
Scheduler considers placement
 |
 v
Storage provisioned/bound appropriately
```

------------------------------------------------------------------------

# 62. Storage Topology

Modern storage systems can have topology constraints such as:

``` text
zone-a
zone-b
zone-c
```

A volume may only be attachable in certain locations.

This is one reason `WaitForFirstConsumer` is important for many
topology-aware environments.

------------------------------------------------------------------------

# 63. CSI

**Container Storage Interface (CSI)** is the standard interface
Kubernetes uses to integrate with external storage systems.

Conceptually:

``` text
Kubernetes
    |
    v
CSI driver
    |
    v
Storage system
```

Examples of storage systems include:

-   cloud block storage
-   cloud file storage
-   SAN
-   NAS
-   distributed storage

------------------------------------------------------------------------

# 64. CSI Components

A CSI deployment commonly has:

``` text
CSI controller components
CSI node components
```

Controller-side operations can include:

-   create volume
-   delete volume
-   attach
-   snapshot
-   expand

Node-side operations can include:

-   mount
-   unmount
-   filesystem operations
-   node-stage/node-publish operations

Exact components depend on the CSI driver.

------------------------------------------------------------------------

# 65. CSI Controller

Conceptually:

``` text
Kubernetes API
      |
      v
CSI controller
      |
      v
Storage backend API
```

It can manage volume lifecycle operations.

------------------------------------------------------------------------

# 66. CSI Node Plugin

Usually runs on nodes where Pods may consume storage.

Conceptually:

``` text
Node
 |
 +-- CSI node plugin
 |
 +-- Pod
      |
      +-- mounted volume
```

The node plugin helps make the volume available to workloads on that
node.

------------------------------------------------------------------------

# 67. CSI StorageClass

A StorageClass typically identifies a CSI provisioner.

Example:

``` yaml
provisioner: example.csi.storage
```

The actual name is driver-specific.

------------------------------------------------------------------------

# 68. Check CSI Drivers

``` bash
kubectl get csidrivers
```

This can help identify installed CSI drivers.

------------------------------------------------------------------------

# 69. Check StorageClasses

``` bash
kubectl get storageclass
```

Detailed:

``` bash
kubectl describe storageclass fast
```

Look for:

``` text
Provisioner
Parameters
ReclaimPolicy
VolumeBindingMode
AllowVolumeExpansion
```

------------------------------------------------------------------------

# 70. PV Inspection

``` bash
kubectl get pv
```

Detailed:

``` bash
kubectl describe pv <pv-name>
```

YAML:

``` bash
kubectl get pv <pv-name> -o yaml
```

Important fields include:

``` text
capacity
accessModes
persistentVolumeReclaimPolicy
storageClassName
claimRef
nodeAffinity
csi
```

------------------------------------------------------------------------

# 71. PVC Inspection

``` bash
kubectl get pvc -n production
```

Detailed:

``` bash
kubectl describe pvc app-data -n production
```

Look for:

``` text
Status
Volume
Capacity
Access Modes
StorageClass
Events
```

------------------------------------------------------------------------

# 72. PVC Events

Events are often the fastest way to diagnose provisioning problems.

``` bash
kubectl describe pvc app-data -n production
```

Look at:

``` text
Events:
```

Possible messages can indicate:

-   provisioning failed
-   no matching volume
-   driver unavailable
-   topology issue
-   insufficient storage
-   authorization problem

------------------------------------------------------------------------

# 73. PVC Troubleshooting: Pending

If:

``` bash
kubectl get pvc
```

shows:

``` text
Pending
```

check:

``` bash
kubectl describe pvc <pvc> -n <namespace>
```

Then:

``` bash
kubectl get storageclass
```

Then:

``` bash
kubectl get pv
```

If dynamic provisioning is expected, inspect the CSI controller.

------------------------------------------------------------------------

# 74. Pending PVC Decision Tree

``` text
PVC Pending
    |
    v
Is StorageClass correct?
    |
    +-- No --> fix class
    |
    v
Does dynamic provisioning exist?
    |
    +-- No --> check static PV
    |
    v
CSI driver healthy?
    |
    +-- No --> inspect CSI
    |
    v
Access mode supported?
    |
    v
Topology compatible?
    |
    v
Capacity available?
```

------------------------------------------------------------------------

# 75. PVC Troubleshooting: Pod Pending

Sometimes the PVC is:

``` text
Bound
```

but the Pod is:

``` text
Pending
```

Possible reasons:

-   node scheduling
-   volume topology
-   attachment limits
-   node affinity
-   taints/tolerations
-   insufficient CPU/memory
-   storage attachment failure

Do not assume the PVC is the problem merely because the Pod uses
storage.

------------------------------------------------------------------------

# 76. PVC Troubleshooting: Mount Failure

Pod may show:

``` text
ContainerCreating
```

or volume-related Events.

Check:

``` bash
kubectl describe pod <pod> -n <namespace>
```

Look for:

``` text
FailedMount
FailedAttachVolume
```

Then inspect CSI components and node-level conditions.

------------------------------------------------------------------------

# 77. PVC Troubleshooting: Multi-Attach

A common problem with RWO-style storage:

``` text
Volume already attached to node A
Pod now needs it on node B
```

You may see errors related to:

``` text
Multi-Attach
```

Investigate:

-   Pod placement
-   volume attachment
-   previous Pod termination
-   StatefulSet behavior
-   storage backend

------------------------------------------------------------------------

# 78. RWO Is Not "One Pod"

Remember:

``` text
RWO = one node
```

not necessarily:

``` text
RWO = one Pod
```

If you need:

``` text
one Pod only
```

consider:

``` text
RWOP
```

when supported.

------------------------------------------------------------------------

# 79. PVC Expansion

Some StorageClasses allow volume expansion.

Check:

``` bash
kubectl get storageclass
```

and:

``` bash
kubectl describe storageclass <name>
```

Look for:

``` text
AllowVolumeExpansion: true
```

------------------------------------------------------------------------

# 80. Expanding a PVC

Example:

``` yaml
spec:
  resources:
    requests:
      storage: 200Gi
```

If the PVC was:

``` text
100Gi
```

you may be able to increase it to:

``` text
200Gi
```

subject to StorageClass/CSI support.

------------------------------------------------------------------------

# 81. PVC Expansion Limitation

In general, shrinking an existing PVC is not supported through the
normal PVC resize workflow.

Think:

``` text
100Gi
   |
   v
200Gi
```

is supported when configured.

But:

``` text
200Gi
   |
   v
100Gi
```

is not the normal supported resize operation.

------------------------------------------------------------------------

# 82. Filesystem Expansion

For filesystem volumes, expansion may involve:

``` text
backend volume expansion
+
filesystem expansion
```

CSI and kubelet components coordinate according to the driver's
capabilities.

Verify the filesystem actually reports the expanded capacity.

------------------------------------------------------------------------

# 83. Block Volume Expansion

Raw block volumes have different semantics because there is no
filesystem to resize.

The application may need to recognize the larger block device.

Driver support is important.

------------------------------------------------------------------------

# 84. PVC Expansion Workflow

Conceptually:

``` text
Edit PVC
   |
   v
New requested capacity
   |
   v
CSI controller expands backend
   |
   v
Node-side expansion if required
   |
   v
Filesystem grows if applicable
   |
   v
PVC reports new capacity
```

------------------------------------------------------------------------

# 85. Check PVC Capacity

``` bash
kubectl get pvc app-data -n production
```

Detailed:

``` bash
kubectl describe pvc app-data -n production
```

Inside the Pod:

``` bash
df -h /data
```

if it is a filesystem volume.

------------------------------------------------------------------------

# 86. Volume Snapshots

Kubernetes supports volume snapshots through the **VolumeSnapshot** API
provided by the snapshot ecosystem/CSI drivers.

Conceptually:

``` text
PVC
 |
 v
VolumeSnapshot
 |
 v
Storage backend snapshot
```

This is different from a Kubernetes backup of the entire application.

------------------------------------------------------------------------

# 87. Snapshot Use Cases

Snapshots can be useful for:

-   point-in-time recovery
-   testing
-   cloning
-   backups
-   migration workflows

But a snapshot is not automatically a complete disaster-recovery
strategy.

------------------------------------------------------------------------

# 88. Snapshot Classes

The snapshot ecosystem includes:

``` text
VolumeSnapshotClass
VolumeSnapshot
VolumeSnapshotContent
```

depending on the installed snapshot components.

Check:

``` bash
kubectl get volumesnapshotclass
kubectl get volumesnapshot -A
```

if the feature is installed.

------------------------------------------------------------------------

# 89. PVC From Snapshot

A new PVC can sometimes be created from a snapshot.

Conceptually:

``` text
Existing PVC
     |
     v
Snapshot
     |
     v
New PVC
     |
     v
New Pod
```

This depends on CSI/storage support.

------------------------------------------------------------------------

# 90. PVC Cloning

Some CSI drivers support cloning a PVC.

Conceptually:

``` text
PVC A
 |
 v
PVC B
```

The clone starts as a copy of the source volume's data.

This is useful for:

-   test environments
-   database clones
-   development
-   recovery workflows

Support is CSI-driver dependent.

------------------------------------------------------------------------

# 91. Snapshot vs Clone

### Snapshot

``` text
point-in-time storage image
```

### Clone

``` text
new volume initialized from an existing volume
```

Both are storage-backend features exposed through Kubernetes APIs.

------------------------------------------------------------------------

# 92. PVC and Backup

A PVC is not itself a backup.

This is critical.

``` text
PVC
=
live storage

Backup
=
recoverable copy
```

Production systems need an explicit backup/restore strategy.

------------------------------------------------------------------------

# 93. Database Backup

For databases, storage snapshots alone may not always be sufficient.

Depending on the database, use:

-   application-consistent backups
-   transaction logs
-   database-native dumps
-   snapshots
-   replication
-   offsite copies

A crash-consistent disk snapshot is not automatically equivalent to a
logically consistent database backup.

------------------------------------------------------------------------

# 94. Storage Durability

PVC does not guarantee durability by itself.

Durability depends on:

``` text
storage backend
+
replication
+
failure domain
+
backup
+
snapshot
+
recovery design
```

------------------------------------------------------------------------

# 95. PVC and High Availability

A PVC can persist data, but persistence does not automatically make an
application highly available.

Example:

``` text
One Pod
   |
   v
One PVC
```

If the application is not replicated appropriately, the application can
still be unavailable.

HA is an application/architecture concern.

------------------------------------------------------------------------

# 96. PVC and Replication

Some storage backends provide replication.

For example:

``` text
Volume
 |
 +--> replica A
 +--> replica B
 +--> replica C
```

This is backend-specific.

Do not assume every PVC is automatically replicated.

------------------------------------------------------------------------

# 97. PVC and Storage Class Performance

Different StorageClasses may offer:

``` text
standard
fast
premium
archive
shared
```

They can differ in:

-   IOPS
-   throughput
-   latency
-   durability
-   availability
-   encryption
-   cost

The StorageClass is therefore an important architectural decision.

------------------------------------------------------------------------

# 98. PVC and Cost

Storage costs can depend on:

``` text
capacity
performance tier
IOPS
throughput
snapshots
replication
data transfer
provisioned vs consumed capacity
```

A PVC requesting:

``` text
1Ti
```

may incur costs even if the application only writes:

``` text
100Gi
```

depending on the backend billing model.

------------------------------------------------------------------------

# 99. PVC and Encryption

Storage encryption may occur:

``` text
application
  |
  v
filesystem
  |
  v
volume
  |
  v
storage backend
```

Encryption capabilities depend on:

-   CSI driver
-   cloud provider
-   storage backend
-   encryption key management

PVC itself does not automatically guarantee encryption.

------------------------------------------------------------------------

# 100. PVC Security

Security considerations include:

-   RBAC
-   namespace access
-   storage backend permissions
-   encryption
-   Pod security
-   filesystem permissions
-   SELinux/AppArmor where applicable
-   backup access
-   snapshot access

------------------------------------------------------------------------

# 101. PVC and RBAC

PVCs are Kubernetes API objects.

Users need appropriate RBAC permissions to:

``` text
get
list
create
update
delete
```

PVCs.

Example:

``` bash
kubectl auth can-i create pvc -n production
```

------------------------------------------------------------------------

# 102. PVC and Secret Credentials

Some storage integrations require credentials or secrets.

CSI drivers may use Kubernetes Secrets for:

-   storage authentication
-   cloud credentials
-   mount credentials

The exact mechanism is driver-specific.

Treat these Secrets as sensitive.

------------------------------------------------------------------------

# 103. PVC and Namespace

A PVC belongs to one namespace.

A Pod can reference a PVC in its own namespace.

A Pod in:

``` text
development
```

cannot simply use:

``` text
production/app-data
```

as a normal PVC reference.

------------------------------------------------------------------------

# 104. Cross-Namespace PVC Access

There is no normal cross-namespace PVC reference mechanism for a Pod.

If multiple namespaces need access to the same underlying data, consider
architecture such as:

-   RWX storage with separate claims/workflows
-   replicated data
-   external storage service
-   application-level sharing

Do not try to bypass namespace scoping.

------------------------------------------------------------------------

# 105. One PVC Mounted by Multiple Pods

Possible if:

``` text
storage access mode
+
CSI driver
+
backend
+
application behavior
```

allow it.

Example:

``` text
PVC RWX
 |
 +-- Pod A
 +-- Pod B
 +-- Pod C
```

All Pods can potentially access the same filesystem.

------------------------------------------------------------------------

# 106. Shared Storage Warning

RWX does not automatically make an application safe for concurrent
access.

For example:

``` text
Pod A writes file
Pod B writes same file
```

can cause application-level corruption.

Storage-level sharing and application-level concurrency safety are
separate concerns.

------------------------------------------------------------------------

# 107. PVC and File Locking

Applications using shared filesystems may depend on:

-   file locking
-   POSIX semantics
-   consistency guarantees
-   filesystem behavior

Verify that the backend supports what the application requires.

------------------------------------------------------------------------

# 108. PVC and Local Volumes

Kubernetes can use local storage.

A local PV is tied to a node.

Conceptually:

``` text
PV
 |
 +-- node-1 local disk
```

If the node fails:

``` text
node-1
   X
```

the volume may become unavailable.

Local storage therefore has different availability characteristics from
network-attached storage.

------------------------------------------------------------------------

# 109. Local PV and Node Affinity

Local PersistentVolumes commonly use node affinity so Kubernetes knows
where the storage exists.

This can constrain scheduling.

Conceptually:

``` text
PV
 |
 +-- nodeAffinity = node-1
```

Pod consuming that volume needs compatible placement.

------------------------------------------------------------------------

# 110. Local vs Network Storage

  Feature           Local storage           Network/cloud storage
  ----------------- ----------------------- ------------------------
  Latency           Often low               Depends
  Node dependence   High                    Usually lower
  Failover          More complex            Backend dependent
  Portability       Lower                   Often higher
  HA                Requires architecture   Backend may provide it

------------------------------------------------------------------------

# 111. PVC and Node Affinity

A PV can have:

``` yaml
nodeAffinity:
```

This is particularly important for:

-   local PVs
-   topology-aware volumes
-   zonal storage

A Pod can become unschedulable if its required volume is unavailable in
eligible nodes.

------------------------------------------------------------------------

# 112. PVC and Zones

Cloud block volumes are often zonal.

Example:

``` text
Volume -> zone-a
Pod    -> zone-b
```

Depending on storage behavior, this may be impossible.

Storage topology and scheduler behavior must work together.

------------------------------------------------------------------------

# 113. PVC and Multi-Zone Applications

For multi-zone StatefulSets, consider:

``` text
Pod 0 -> zone-a -> volume-a
Pod 1 -> zone-b -> volume-b
Pod 2 -> zone-c -> volume-c
```

Storage topology and StatefulSet scheduling need careful design.

------------------------------------------------------------------------

# 114. PVC and Volume Attachment

For attachable storage, Kubernetes may use `VolumeAttachment` objects.

Inspect:

``` bash
kubectl get volumeattachments
```

These are cluster-scoped.

They can help diagnose attachment problems.

------------------------------------------------------------------------

# 115. VolumeAttachment

Conceptually:

``` text
PV
 |
 v
VolumeAttachment
 |
 v
Node
 |
 v
Pod
```

This is particularly useful when diagnosing:

``` text
volume cannot attach
```

------------------------------------------------------------------------

# 116. PVC and CSI Driver Health

If dynamic provisioning or mounting fails, inspect CSI components.

For example:

``` bash
kubectl get pods -A | grep csi
```

Then inspect relevant controller/node Pods.

Exact names depend on the CSI driver.

------------------------------------------------------------------------

# 117. PVC and StorageClass Troubleshooting

Check:

``` bash
kubectl get storageclass
```

Then:

``` bash
kubectl describe storageclass <class>
```

Verify:

``` text
provisioner
parameters
reclaim policy
volume binding mode
expansion support
```

------------------------------------------------------------------------

# 118. PVC Troubleshooting Commands

``` bash
kubectl get pvc -A
kubectl describe pvc <pvc> -n <namespace>

kubectl get pv
kubectl describe pv <pv>

kubectl get storageclass
kubectl describe storageclass <class>

kubectl get volumeattachments
```

Then inspect Pod events:

``` bash
kubectl describe pod <pod> -n <namespace>
```

------------------------------------------------------------------------

# 119. PVC Troubleshooting Workflow

``` text
PVC problem
    |
    v
kubectl get pvc
    |
    v
Pending or Bound?
    |
    +-- Pending
    |     |
    |     +--> describe PVC
    |     +--> StorageClass
    |     +--> CSI controller
    |     +--> capacity/topology
    |
    +-- Bound
          |
          +--> Pod events
          +--> attach
          +--> mount
          +--> permissions
          +--> filesystem
```

------------------------------------------------------------------------

# 120. PVC Pending: Static Provisioning

If no dynamic provisioning is configured, a matching PV may need to
exist.

Example:

``` text
PVC:
100Gi
RWO
storageClass=manual

PV:
100Gi
RWO
storageClass=manual
```

Then Kubernetes can bind them if all relevant requirements match.

------------------------------------------------------------------------

# 121. Static PV Example

``` yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-pv
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /data/app
```

`hostPath` is generally unsuitable for production multi-node persistent
storage.

It is mainly useful for local/dev scenarios and has important
security/availability implications.

------------------------------------------------------------------------

# 122. Static PVC Example

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  resources:
    requests:
      storage: 100Gi
```

Kubernetes can bind it to a compatible PV.

------------------------------------------------------------------------

# 123. PVC Selector

A PVC can use selectors in certain static provisioning scenarios.

Example:

``` yaml
selector:
  matchLabels:
    environment: production
```

This can constrain which PVs are eligible.

Be careful when combining selectors with dynamic provisioning; a
selector can prevent automatic provisioning in cases where no matching
PV exists.

------------------------------------------------------------------------

# 124. PVC and `volumeName`

A PVC can explicitly reference a PV:

``` yaml
volumeName: app-pv
```

This is useful for specific static-binding scenarios.

Do not use this casually with dynamically provisioned storage.

------------------------------------------------------------------------

# 125. PVC Binding Rules

PVC/PV matching can consider properties such as:

``` text
capacity
access modes
volume mode
storage class
selectors
volume name
topology/affinity
```

Exact matching behavior is governed by Kubernetes API/storage binding
rules.

------------------------------------------------------------------------

# 126. PVC Capacity Matching

If PVC requests:

``` text
100Gi
```

a PV with:

``` text
50Gi
```

cannot satisfy it.

A PV with:

``` text
200Gi
```

may satisfy a 100Gi claim if other requirements match.

------------------------------------------------------------------------

# 127. PVC and Access Mode Matching

If PVC requires:

``` text
RWX
```

but PV supports only:

``` text
RWO
```

they cannot satisfy each other.

StorageClass dynamic provisioning must also be able to provide the
requested access mode.

------------------------------------------------------------------------

# 128. PVC and VolumeMode Matching

A PVC requesting:

``` yaml
volumeMode: Block
```

needs compatible storage.

A filesystem-oriented volume is not automatically equivalent to a raw
block volume.

------------------------------------------------------------------------

# 129. PVC and StorageClass Matching

A PVC requesting:

``` yaml
storageClassName: fast
```

will not normally bind to a PV from:

``` text
slow
```

unless the relevant configuration explicitly allows matching behavior.

Storage class is an important binding attribute.

------------------------------------------------------------------------

# 130. PVC Binding Is Usually One-to-One

A PV generally binds to one PVC at a time.

Conceptually:

``` text
PVC A ---- PV A
PVC B ---- PV B
```

A single PV is not normally shared by multiple PVCs simultaneously
through ordinary binding.

Shared application access should instead be designed through storage
capabilities such as RWX or an external data service.

------------------------------------------------------------------------

# 131. PVC and `claimRef`

When a PV is bound, its metadata can contain:

``` yaml
claimRef:
```

identifying the PVC.

Inspect:

``` bash
kubectl get pv <pv> -o yaml
```

------------------------------------------------------------------------

# 132. Released PV

After a PVC is deleted, a PV may enter:

``` text
Released
```

depending on its lifecycle/reclaim configuration.

This means the PV was previously bound and is no longer bound to the
claim.

It does not necessarily mean it is immediately reusable.

------------------------------------------------------------------------

# 133. Failed PV

A PV can enter:

``` text
Failed
```

when an error occurs during its lifecycle.

Investigate:

``` bash
kubectl describe pv <pv>
```

and the relevant storage controller/CSI driver.

------------------------------------------------------------------------

# 134. PVC Lifecycle

Simplified:

``` text
          create PVC
               |
               v
            Pending
               |
        provisioning/binding
               |
               v
             Bound
               |
        PVC deleted/released
               |
               v
         PV lifecycle depends
         on reclaim policy
```

------------------------------------------------------------------------

# 135. PVC and Garbage Collection

Kubernetes object garbage collection and storage lifecycle are related
but not identical.

Deleting:

``` text
Pod
```

does not normally delete its PVC merely because the Pod references it.

Deleting:

``` text
PVC
```

can trigger PV/storage lifecycle behavior.

------------------------------------------------------------------------

# 136. PVC and Pod Deletion

Important:

``` text
Delete Pod
    |
    X
PVC remains
```

This is a core persistence concept.

------------------------------------------------------------------------

# 137. PVC and Deployment Deletion

Generally:

``` text
Delete Deployment
    |
    v
Pods deleted
    |
    v
PVC remains
```

unless the PVC is separately managed/deleted or a higher-level mechanism
explicitly handles its lifecycle.

------------------------------------------------------------------------

# 138. PVC and Helm

Helm charts commonly create PVCs.

Example:

``` bash
helm install database ./chart \
  --namespace production
```

Be careful when uninstalling:

``` bash
helm uninstall database
```

PVC behavior depends on how the chart defines and manages the PVC.

Never assume Helm uninstall automatically deletes or preserves every
storage object.

------------------------------------------------------------------------

# 139. PVC and GitOps

PVC definitions should usually be declarative and version controlled.

Example:

``` text
applications/
  database/
    pvc.yaml
    statefulset.yaml
```

Storage lifecycle should be intentionally documented.

------------------------------------------------------------------------

# 140. PVC and Disaster Recovery

A production storage strategy should answer:

``` text
What if the Pod dies?
What if the node dies?
What if the volume is corrupted?
What if the zone fails?
What if the cluster is lost?
What if the region fails?
```

A PVC primarily solves:

``` text
workload/container lifecycle persistence
```

It does not automatically solve every disaster scenario.

------------------------------------------------------------------------

# 141. Backup Strategy

A mature strategy may include:

``` text
Live PVC
   |
   +--> Snapshot
   |
   +--> Backup
   |
   +--> Offsite copy
   |
   +--> Restore testing
```

The important part is not merely taking backups, but periodically
testing restoration.

------------------------------------------------------------------------

# 142. RPO and RTO

Storage architecture should define:

### RPO

How much data can you afford to lose?

Example:

``` text
RPO = 15 minutes
```

### RTO

How quickly must the service recover?

Example:

``` text
RTO = 1 hour
```

PVC configuration alone does not determine RPO/RTO.

------------------------------------------------------------------------

# 143. PVC and Application Consistency

For databases, distinguish:

``` text
crash-consistent
```

from:

``` text
application-consistent
```

A raw storage snapshot may capture data at a point in time without
coordinating with the database transaction state.

Use database-native mechanisms where required.

------------------------------------------------------------------------

# 144. PVC and SecurityContext

Filesystem permissions can be affected by:

``` yaml
securityContext:
```

Example:

``` yaml
securityContext:
  fsGroup: 2000
```

Whether ownership/permissions are changed as expected depends on
Kubernetes and storage implementation behavior.

------------------------------------------------------------------------

# 145. PVC and `fsGroup`

Some workloads need:

``` yaml
securityContext:
  fsGroup: 2000
```

so mounted filesystem content is accessible to the application group.

But storage drivers can differ in how they handle ownership changes.

Test with the actual CSI driver.

------------------------------------------------------------------------

# 146. PVC and Read-Only Mount

A Pod can mount a volume read-only.

Example:

``` yaml
volumeMounts:
  - name: data
    mountPath: /data
    readOnly: true
```

This is separate from the storage access mode.

You can have a volume with a read/write-capable access mode but mount it
read-only in a particular container.

------------------------------------------------------------------------

# 147. Access Mode vs Mount ReadOnly

Important distinction:

``` text
Access mode
=
storage capability

readOnly volumeMount
=
how this Pod/container mounts it
```

They are not the same setting.

------------------------------------------------------------------------

# 148. PVC and `subPath`

A volume can be mounted at a subdirectory:

``` yaml
volumeMounts:
  - name: data
    mountPath: /app/data
    subPath: application
```

This can be useful but has lifecycle/security considerations.

Understand how the directory is created and what happens when it does
not exist.

------------------------------------------------------------------------

# 149. PVC and Multiple Containers

A Pod can mount the same PVC into multiple containers:

``` text
Pod
├── app
│    └── /data
└── sidecar
     └── /shared
```

This is useful for patterns such as:

-   log processing
-   file transformation
-   shared workspace

Application-level concurrency still matters.

------------------------------------------------------------------------

# 150. PVC and Init Containers

An init container can prepare a mounted volume:

``` text
PVC
 |
 v
Init container
 |
 +-- create directories
 +-- initialize files
 |
 v
Application container
```

This can be useful for initialization.

------------------------------------------------------------------------

# 151. PVC and Readiness

Storage mounting problems can prevent a Pod from becoming healthy.

But do not confuse:

``` text
storage mount failure
```

with:

``` text
readiness probe failure
```

Investigate Pod Events first.

------------------------------------------------------------------------

# 152. PVC and Liveness

Do not generally make liveness depend directly on a storage operation
unless the application cannot recover without it.

For example:

``` text
storage temporarily slow
```

should not automatically cause:

``` text
container restart
```

unless restart is actually the appropriate recovery.

------------------------------------------------------------------------

# 153. PVC and Node Failure

With network-attached storage, a volume may be detached from a failed
node and attached elsewhere, depending on backend capabilities.

With local storage:

``` text
node failure
=
storage availability problem
```

The recovery characteristics differ significantly.

------------------------------------------------------------------------

# 154. PVC and Volume Attachment Limits

Cloud nodes may have limits on how many volumes can be attached.

You may have:

``` text
Node attachment limit = 25
```

but require:

``` text
30 volumes
```

Some Pods can become unschedulable or fail attachment.

Check node/storage documentation and events.

------------------------------------------------------------------------

# 155. PVC and Storage Capacity

Dynamic provisioning can fail when the backend has insufficient
capacity.

Possible symptom:

``` text
PVC Pending
```

with provisioning events.

Storage capacity is distinct from:

``` text
CPU
memory
```

and is managed by the storage subsystem.

------------------------------------------------------------------------

# 156. PVC and StorageClass Parameters

Never blindly change:

``` yaml
parameters:
```

because they are CSI-driver-specific.

For example, parameters may control:

``` text
disk type
replication
filesystem
performance tier
encryption
zone
```

Always consult your driver documentation.

------------------------------------------------------------------------

# 157. PVC and Filesystem Type

Storage can use filesystems such as:

``` text
ext4
xfs
```

or backend-specific filesystems.

The filesystem choice can affect:

-   performance
-   features
-   compatibility
-   operational procedures

Do not change filesystem settings without understanding the storage
backend.

------------------------------------------------------------------------

# 158. PVC and Mount Options

PV/storage configuration can include mount options depending on the
volume type/driver.

Example concept:

``` text
mountOptions:
  - ...
```

These are backend/filesystem specific.

------------------------------------------------------------------------

# 159. PVC and Storage Performance

A database PVC should be selected based on:

``` text
IOPS
latency
throughput
capacity
durability
availability
```

Do not select storage solely based on:

``` text
100Gi
```

Capacity is only one dimension.

------------------------------------------------------------------------

# 160. PVC and Database Architecture

For databases:

``` text
StatefulSet
    |
    +-- Pod 0 -> PVC 0
    +-- Pod 1 -> PVC 1
    +-- Pod 2 -> PVC 2
```

The database's replication layer should usually be understood separately
from storage replication.

------------------------------------------------------------------------

# 161. Storage Replication vs Database Replication

These are different.

### Storage replication

``` text
Volume
 |
 +-- storage replica A
 +-- storage replica B
```

### Database replication

``` text
Database
 |
 +-- primary
 +-- replica
 +-- replica
```

You may need both, but they solve different failure modes.

------------------------------------------------------------------------

# 162. PVC and Encryption at Rest

For sensitive workloads:

``` text
PVC
 |
 v
Encrypted storage
 |
 v
KMS/key management
```

Confirm:

-   encryption enabled
-   key ownership
-   key rotation
-   backup encryption
-   snapshot encryption

PVC alone does not answer these questions.

------------------------------------------------------------------------

# 163. PVC and Compliance

If storage contains regulated/sensitive data, evaluate:

``` text
encryption
access
audit
retention
backup
data residency
deletion
snapshot security
```

Namespace and PVC naming do not provide compliance automatically.

------------------------------------------------------------------------

# 164. PVC Naming Convention

Good examples:

``` text
database-data
postgres-data
payments-data
cache-data
```

For StatefulSets, use predictable claim template names:

``` text
data
```

which become identity-specific PVC names.

------------------------------------------------------------------------

# 165. PVC Labels

Use labels where useful:

``` yaml
metadata:
  labels:
    app: payments
    environment: production
    data-class: critical
```

Labels can help with:

-   inventory
-   automation
-   reporting
-   cost management

------------------------------------------------------------------------

# 166. PVC Annotations

Annotations can carry tool-specific metadata.

Be careful with annotations used by storage operators or backup systems.

Do not copy vendor-specific annotations without understanding their
behavior.

------------------------------------------------------------------------

# 167. PVC and Monitoring

Monitor:

``` text
PVC capacity
filesystem usage
volume latency
IOPS
throughput
errors
volume health
provisioning failures
attachment failures
```

A PVC being `Bound` does not mean it has sufficient free space.

------------------------------------------------------------------------

# 168. PVC Capacity vs Filesystem Usage

Kubernetes may report:

``` text
PVC capacity = 100Gi
```

while the filesystem is:

``` text
used = 95Gi
free = 5Gi
```

Monitor actual filesystem usage from inside the workload or through
storage monitoring.

------------------------------------------------------------------------

# 169. PVC Full Disk Problem

If a volume fills:

``` text
100Gi
 |
 +-- 100Gi used
 |
 +-- 0Gi free
```

the application can fail even though:

``` text
PVC status = Bound
```

`Bound` only indicates claim/binding state, not free space.

------------------------------------------------------------------------

# 170. Disk Usage Check

Inside a filesystem-mounted Pod:

``` bash
df -h
```

Specific mount:

``` bash
df -h /data
```

Directory usage:

``` bash
du -sh /data/*
```

depending on image/tool availability.

------------------------------------------------------------------------

# 171. PVC Expansion vs Cleanup

If storage is full, options include:

``` text
1. Clean unnecessary data
2. Increase PVC size
3. Change retention policy
4. Archive old data
5. Fix runaway logs
```

Expansion requires StorageClass/CSI support.

------------------------------------------------------------------------

# 172. PVC and Log Storage

Avoid blindly writing unlimited application logs to a PVC.

Prefer centralized logging where appropriate.

A PVC is usually for application state, not necessarily a replacement
for a logging platform.

------------------------------------------------------------------------

# 173. PVC and Temporary Storage

Do not use PVC automatically for every temporary file.

Kubernetes also has:

``` text
emptyDir
ephemeral storage
```

Use persistent storage when data must survive Pod lifecycle.

------------------------------------------------------------------------

# 174. PVC vs `emptyDir`

  Feature                 PVC                           emptyDir
  ----------------------- ----------------------------- ---------------------
  Survives Pod deletion   Usually yes                   No
  Persistent backend      Yes                           Node local
  Provisioning            PV/CSI                        Automatic
  Good for                Persistent application data   Temporary workspace
  Shared across Pods      Depends on access mode        Pod-local

------------------------------------------------------------------------

# 175. PVC vs ConfigMap

ConfigMap is for configuration data.

PVC is for persistent application data.

Do not store large mutable application datasets in ConfigMaps.

------------------------------------------------------------------------

# 176. PVC vs Secret

Secret is for sensitive configuration/data.

PVC is for persistent storage.

A database password belongs in a Secret, not as a general-purpose
replacement for storage.

------------------------------------------------------------------------

# 177. PVC vs HostPath

`hostPath` directly exposes a node filesystem path.

PVC abstracts persistent storage through Kubernetes storage APIs.

For production multi-node systems, CSI-backed storage is usually
preferable to arbitrary hostPath usage.

------------------------------------------------------------------------

# 178. PVC vs Local PV

Local PV is still represented through Kubernetes PV/PVC abstractions but
is physically tied to a node.

This provides better Kubernetes storage semantics than arbitrary
hostPath, while retaining node-local failure characteristics.

------------------------------------------------------------------------

# 179. PVC and Storage Migration

Moving data between storage classes is not simply:

``` yaml
storageClassName: new
```

StorageClass is generally not something you casually change on an
existing PVC.

Migration may require:

``` text
snapshot
or
backup/restore
or
application-level replication
or
copy data to a new PVC
```

------------------------------------------------------------------------

# 180. PVC Migration Pattern

Conceptually:

``` text
Old PVC
   |
   v
Snapshot/backup/copy
   |
   v
New PVC
   |
   v
New workload
```

Test the migration and rollback path.

------------------------------------------------------------------------

# 181. PVC and StorageClass Immutability

Many PVC fields are not freely mutable after binding.

In particular, do not expect to change fundamental binding
characteristics such as:

``` text
storage class
access mode
volume mode
```

on an existing bound PVC.

For major changes, create a new PVC and migrate data.

------------------------------------------------------------------------

# 182. PVC Expansion Is Special

Although many PVC properties are constrained after creation, storage
capacity can often be increased when the StorageClass supports
expansion.

This is why:

``` text
resize
```

is treated differently from changing the storage class.

------------------------------------------------------------------------

# 183. PVC and Reclaim Policy Changes

Administrators can sometimes modify PV reclaim policy.

Before changing it:

``` bash
kubectl get pv <pv> -o yaml
```

Understand the desired data lifecycle.

For production, changes should be controlled and reviewed.

------------------------------------------------------------------------

# 184. PVC and Orphaned Storage

A poorly designed lifecycle can create:

``` text
orphaned volumes
```

or:

``` text
orphaned cloud disks
```

Track:

``` text
PVC
PV
cloud volume ID
application owner
environment
```

through labels/metadata and platform tooling.

------------------------------------------------------------------------

# 185. PVC and Cost Governance

For large clusters, track:

``` text
namespace
PVC
storage class
capacity
actual usage
team
environment
cost
```

This helps identify:

``` text
unused PVCs
oversized volumes
old snapshots
expensive storage classes
```

------------------------------------------------------------------------

# 186. Unused PVC Detection

A PVC can remain:

``` text
Bound
```

even when no active Pod uses it.

That does not necessarily mean it is safe to delete.

Before deletion, determine:

``` text
owner
application
backup state
recovery requirement
last use
```

------------------------------------------------------------------------

# 187. PVC and Orphaned Claims

Common scenario:

``` text
Application deleted
PVC remains
```

This can be intentional.

For stateful applications, retaining PVCs can be a safety feature.

But stale claims can also accumulate costs.

------------------------------------------------------------------------

# 188. Production Storage Lifecycle

A good lifecycle:

``` text
Provision
   |
   v
Use
   |
   v
Monitor
   |
   v
Backup
   |
   v
Resize/migrate when needed
   |
   v
Retire
   |
   v
Validate retention/deletion
```

------------------------------------------------------------------------

# 189. Production PVC Checklist

``` text
[ ] Correct StorageClass
[ ] Correct access mode
[ ] Correct volume mode
[ ] Capacity sized correctly
[ ] Performance tier appropriate
[ ] Encryption configured
[ ] Backup strategy exists
[ ] Restore tested
[ ] Reclaim policy understood
[ ] Topology understood
[ ] CSI driver supported
[ ] Expansion supported if needed
[ ] Monitoring configured
[ ] Cost monitored
[ ] Ownership documented
```

------------------------------------------------------------------------

# 190. Production Database PVC Checklist

``` text
[ ] StatefulSet architecture reviewed
[ ] One PVC per replica where appropriate
[ ] Storage performance tested
[ ] IOPS/latency tested
[ ] Backup tested
[ ] Restore tested
[ ] Snapshot strategy defined
[ ] RPO defined
[ ] RTO defined
[ ] Multi-zone behavior tested
[ ] Storage failure tested
[ ] Node failure tested
[ ] Volume expansion tested
[ ] Application consistency understood
```

------------------------------------------------------------------------

# 191. Common Mistake #1

### Mistake

Thinking:

``` text
PVC = actual disk
```

### Correct

``` text
PVC = request for persistent storage
PV = Kubernetes storage resource
Backend = actual storage
```

------------------------------------------------------------------------

# 192. Common Mistake #2

### Mistake

Thinking:

``` text
PVC is cluster-scoped
```

### Correct

``` text
PVC = namespaced
PV = cluster-scoped
```

------------------------------------------------------------------------

# 193. Common Mistake #3

### Mistake

Thinking:

``` text
RWO = one Pod
```

### Correct

``` text
RWO = read/write from one node
```

For stronger single-Pod semantics, consider RWOP if supported.

------------------------------------------------------------------------

# 194. Common Mistake #4

### Mistake

Thinking:

``` text
Bound = data is backed up
```

### Correct

``` text
Bound = claim is associated with a volume
```

Backups are separate.

------------------------------------------------------------------------

# 195. Common Mistake #5

### Mistake

Deleting PVC without checking reclaim policy.

### Risk

Storage/data may be deleted depending on the storage lifecycle.

------------------------------------------------------------------------

# 196. Common Mistake #6

### Mistake

Using RWO PVC for multiple replicas across nodes.

### Result

Potential attachment/mount failures.

Use storage architecture appropriate for the application's sharing
requirements.

------------------------------------------------------------------------

# 197. Common Mistake #7

### Mistake

Assuming PVC provides HA.

### Correct

PVC provides persistence, not complete application availability.

------------------------------------------------------------------------

# 198. Common Mistake #8

### Mistake

Assuming a PVC being Bound means the disk has free space.

### Correct

Check actual filesystem usage:

``` bash
df -h
```

------------------------------------------------------------------------

# 199. Common Mistake #9

### Mistake

Assuming StorageClass can be freely changed after binding.

### Correct

For major storage-class changes, create/migrate to a new PVC.

------------------------------------------------------------------------

# 200. Common Mistake #10

### Mistake

Using hostPath as production persistent storage without understanding
node dependency.

### Correct

Use an appropriate CSI/storage architecture for production.

------------------------------------------------------------------------

# 201. PVC Interview Questions

## Q1. What is a PVC?

A PersistentVolumeClaim is a namespaced Kubernetes request for
persistent storage.

## Q2. What is a PV?

A PersistentVolume is a cluster-scoped Kubernetes representation of
persistent storage.

## Q3. What is the relationship?

``` text
Pod -> PVC -> PV -> Storage backend
```

------------------------------------------------------------------------

# 202. Interview Questions: Access Modes

## Q4. What is RWO?

Read/write from a single node.

## Q5. What is RWX?

Read/write from multiple nodes, if supported.

## Q6. What is ROX?

Read-only from multiple nodes, if supported.

## Q7. What is RWOP?

Read/write by a single Pod, subject to supported Kubernetes/CSI
behavior.

------------------------------------------------------------------------

# 203. Interview Question: RWO vs RWOP

### RWO

``` text
one node
```

### RWOP

``` text
one Pod
```

This distinction is important.

------------------------------------------------------------------------

# 204. Interview Question: PVC vs PV

Answer:

> A PVC is a namespaced request for storage made by a workload/user. A
> PV is a cluster-scoped Kubernetes storage resource that satisfies that
> request. With dynamic provisioning, a StorageClass and CSI driver can
> create the underlying storage and PV automatically.

------------------------------------------------------------------------

# 205. Interview Question: Static vs Dynamic Provisioning

### Static

Administrator creates PVs.

``` text
PV -> PVC
```

### Dynamic

PVC triggers provisioning through StorageClass/CSI.

``` text
PVC -> StorageClass -> CSI -> PV -> storage
```

------------------------------------------------------------------------

# 206. Interview Question: What Is StorageClass?

A StorageClass defines a class of storage and the
provisioner/configuration used to dynamically provision volumes.

------------------------------------------------------------------------

# 207. Interview Question: What Is CSI?

CSI is the Container Storage Interface used to integrate Kubernetes with
storage systems through standardized storage operations.

------------------------------------------------------------------------

# 208. Interview Question: What Is `WaitForFirstConsumer`?

A StorageClass volume binding mode that delays provisioning/binding
until a consuming Pod exists, helping storage provisioning account for
Pod scheduling/topology.

------------------------------------------------------------------------

# 209. Interview Question: Why Is `WaitForFirstConsumer` Useful?

Because storage may be topology constrained.

Example:

``` text
Volume -> zone A
Pod    -> zone B
```

The scheduler/storage system needs compatible placement.

------------------------------------------------------------------------

# 210. Interview Question: Does Deleting a Pod Delete Its PVC?

Normally no.

``` text
Pod deleted
   |
   v
PVC remains
```

------------------------------------------------------------------------

# 211. Interview Question: Does Deleting a PVC Delete the PV?

It depends on the PV reclaim policy and storage provisioning behavior.

Common policies:

``` text
Retain
Delete
```

------------------------------------------------------------------------

# 212. Interview Question: Does PVC Guarantee Data Backup?

No.

PVC provides persistent storage, not backup.

------------------------------------------------------------------------

# 213. Interview Question: Can Two Pods Use One PVC?

Yes, if the storage backend/access mode permits it and the application
safely supports concurrent access.

------------------------------------------------------------------------

# 214. Interview Question: Can Pods in Different Namespaces Use the Same PVC?

Not directly through the normal PVC reference mechanism.

PVCs are namespaced.

------------------------------------------------------------------------

# 215. Interview Question: Why Is PVC Pending?

Possible causes:

``` text
No matching PV
StorageClass problem
CSI provisioning failure
Unsupported access mode
Topology problem
Insufficient capacity
Invalid configuration
```

Start with:

``` bash
kubectl describe pvc <pvc> -n <namespace>
```

------------------------------------------------------------------------

# 216. Interview Question: Pod Is Pending But PVC Is Bound

Possible causes:

``` text
node scheduling
volume topology
attachment limits
node affinity
taints
CPU/memory
storage attachment
```

Inspect:

``` bash
kubectl describe pod <pod> -n <namespace>
```

------------------------------------------------------------------------

# 217. Interview Question: PVC Bound but Pod Cannot Start

Investigate:

``` text
FailedAttachVolume
FailedMount
permissions
filesystem
CSI node plugin
node condition
```

Use:

``` bash
kubectl describe pod <pod> -n <namespace>
```

------------------------------------------------------------------------

# 218. Interview Question: Multi-Attach Error

Usually investigate whether a single-node-attached volume is being
requested by workloads on multiple nodes.

Check:

``` text
RWO
volume attachment
Pod placement
previous Pod
StatefulSet behavior
```

------------------------------------------------------------------------

# 219. Interview Question: Can You Shrink a PVC?

Normal Kubernetes PVC resizing is for increasing capacity; shrinking an
existing PVC is not the standard supported resize workflow.

For downsizing:

``` text
create smaller PVC
+
migrate data
```

------------------------------------------------------------------------

# 220. Interview Question: Can You Expand a PVC?

Yes, when the StorageClass/CSI driver supports volume expansion.

Check:

``` bash
kubectl get storageclass
kubectl describe storageclass <class>
```

------------------------------------------------------------------------

# 221. Interview Question: PVC vs emptyDir

``` text
emptyDir
=
temporary Pod-local storage

PVC
=
persistent storage backed by PV/storage system
```

------------------------------------------------------------------------

# 222. Interview Question: PVC vs HostPath

``` text
hostPath
=
direct node filesystem path

PVC
=
Kubernetes persistent storage abstraction
```

PVC is generally more portable and manageable for production storage
architectures.

------------------------------------------------------------------------

# 223. Interview Question: What Is `volumeClaimTemplates`?

A StatefulSet field used to create PVCs for each StatefulSet Pod.

Example:

``` text
database-0 -> data-database-0
database-1 -> data-database-1
```

------------------------------------------------------------------------

# 224. Interview Question: What Happens When a StatefulSet Pod Is Recreated?

Its identity and associated PVC can allow the replacement Pod to use the
same persistent storage, subject to StatefulSet and storage lifecycle
configuration.

------------------------------------------------------------------------

# 225. Scenario Interview Question

### Scenario

PVC:

``` text
100Gi RWO
```

Deployment:

``` text
replicas: 3
```

Pods are distributed across three nodes.

What could happen?

Answer:

The storage backend may not allow the same RWO volume to be attached
read-write to multiple nodes. Some replicas may fail to mount the
volume.

Possible solutions include:

-   use RWX-compatible storage if shared access is truly required
-   use separate PVCs per replica
-   use StatefulSet
-   redesign the application storage model

------------------------------------------------------------------------

# 226. Scenario: PVC Pending

You see:

``` text
NAME       STATUS
app-data   Pending
```

What do you check?

``` bash
kubectl describe pvc app-data -n production
kubectl get storageclass
kubectl get pv
```

Then inspect the relevant CSI controller and events.

------------------------------------------------------------------------

# 227. Scenario: Volume Mount Failure

Pod:

``` text
ContainerCreating
```

Events:

``` text
FailedMount
```

Check:

``` bash
kubectl describe pod <pod> -n <namespace>
kubectl get pvc -n <namespace>
kubectl get pv
kubectl get volumeattachments
```

Then inspect CSI node/controller logs as appropriate.

------------------------------------------------------------------------

# 228. Scenario: Disk Full

PVC:

``` text
100Gi Bound
```

Application reports:

``` text
No space left on device
```

Check inside the Pod:

``` bash
df -h
```

Then investigate:

``` text
application data growth
logs
temporary files
retention
PVC expansion
```

------------------------------------------------------------------------

# 229. Scenario: Need More Storage

Current:

``` text
100Gi
```

Need:

``` text
200Gi
```

Check:

``` bash
kubectl describe storageclass <class>
```

for expansion support.

Then update the PVC request if supported.

Verify:

``` bash
kubectl get pvc
```

and inside the filesystem:

``` bash
df -h
```

------------------------------------------------------------------------

# 230. Scenario: Need Shared Storage

Requirement:

``` text
10 Pods
3 nodes
all need read/write
```

A single RWO volume is generally not appropriate.

Consider:

``` text
RWX-capable storage
```

or an application-level shared data architecture.

------------------------------------------------------------------------

# 231. Scenario: Need One Storage Volume per Replica

Use:

``` text
StatefulSet
+
volumeClaimTemplates
```

rather than a single shared PVC.

------------------------------------------------------------------------

# 232. Scenario: Production PVC Deletion

Before:

``` bash
kubectl delete pvc database-data -n production
```

check:

``` bash
kubectl get pvc database-data -n production
kubectl get pv
kubectl get pv <pv-name> -o yaml
```

Verify:

``` text
reclaim policy
backup
snapshot
application state
ownership
```

------------------------------------------------------------------------

# 233. Scenario: Need Disaster Recovery

Do not simply say:

``` text
PVC provides persistence
```

A good answer includes:

``` text
PVC
+
storage replication where appropriate
+
snapshots
+
backups
+
offsite copies
+
restore testing
+
defined RPO/RTO
```

------------------------------------------------------------------------

# 234. Practical Lab 1 --- Create PVC

Create:

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: test-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

Apply:

``` bash
kubectl apply -f pvc.yaml
```

Check:

``` bash
kubectl get pvc
```

------------------------------------------------------------------------

# 235. Practical Lab 2 --- Mount PVC

Create:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: storage-test
spec:
  containers:
    - name: app
      image: nginx
      volumeMounts:
        - name: data
          mountPath: /data

  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: test-data
```

Apply:

``` bash
kubectl apply -f pod.yaml
```

------------------------------------------------------------------------

# 236. Practical Lab 3 --- Write Data

Execute:

``` bash
kubectl exec storage-test -- \
  sh -c 'echo "persistent data" > /data/test.txt'
```

Verify:

``` bash
kubectl exec storage-test -- cat /data/test.txt
```

------------------------------------------------------------------------

# 237. Practical Lab 4 --- Delete Pod

``` bash
kubectl delete pod storage-test
```

Recreate the Pod.

Then:

``` bash
kubectl exec storage-test -- cat /data/test.txt
```

The data should remain if the PVC and backend are intact.

This demonstrates the fundamental purpose of persistent storage.

------------------------------------------------------------------------

# 238. Practical Lab 5 --- Inspect PV

``` bash
kubectl get pv
```

Find the PV bound to:

``` text
test-data
```

Then:

``` bash
kubectl describe pv <pv-name>
```

Observe:

``` text
Capacity
Access Modes
Reclaim Policy
StorageClass
Claim
```

------------------------------------------------------------------------

# 239. Practical Lab 6 --- Inspect StorageClass

``` bash
kubectl get storageclass
```

Then:

``` bash
kubectl describe storageclass <class>
```

Find:

``` text
Provisioner
ReclaimPolicy
VolumeBindingMode
AllowVolumeExpansion
```

------------------------------------------------------------------------

# 240. Practical Lab 7 --- Resize

Only if the StorageClass supports expansion.

Change:

``` yaml
storage: 1Gi
```

to:

``` yaml
storage: 2Gi
```

Apply:

``` bash
kubectl apply -f pvc.yaml
```

Check:

``` bash
kubectl get pvc
```

Then verify from inside the Pod:

``` bash
df -h /data
```

------------------------------------------------------------------------

# 241. Practical Lab 8 --- StatefulSet

Create a StatefulSet with:

``` yaml
volumeClaimTemplates:
```

and:

``` text
replicas: 3
```

Then:

``` bash
kubectl get pvc
```

Observe three separate claims.

This is one of the best labs for understanding StatefulSet storage.

------------------------------------------------------------------------

# 242. Practical Lab 9 --- Delete StatefulSet

Before deleting:

``` bash
kubectl get pvc
```

Delete the StatefulSet and inspect PVCs.

This helps you understand actual PVC retention behavior rather than
relying on assumptions.

------------------------------------------------------------------------

# 243. Practical Lab 10 --- Storage Failure Investigation

Intentionally use an invalid StorageClass in a test environment:

``` yaml
storageClassName: does-not-exist
```

Create the PVC.

Then:

``` bash
kubectl describe pvc <pvc>
```

Observe the Events.

Restore the correct StorageClass afterward.

------------------------------------------------------------------------

# 244. Storage Troubleshooting Cheat Sheet

``` bash
# PVCs
kubectl get pvc -A

# PVC details
kubectl describe pvc <name> -n <namespace>

# PVs
kubectl get pv

# PV details
kubectl describe pv <name>

# StorageClasses
kubectl get storageclass

# StorageClass details
kubectl describe storageclass <name>

# CSI drivers
kubectl get csidrivers

# Volume attachments
kubectl get volumeattachments

# Pod storage errors
kubectl describe pod <pod> -n <namespace>

# Namespace events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

------------------------------------------------------------------------

# 245. Storage Troubleshooting Mental Model

Always work through:

``` text
PVC
 |
 | Bound?
 v
PV
 |
 | Correct StorageClass?
 v
CSI
 |
 | Provisioned?
 v
Volume
 |
 | Attached?
 v
Node
 |
 | Mounted?
 v
Pod
 |
 | Filesystem usable?
 v
Application
```

This prevents random troubleshooting.

------------------------------------------------------------------------

# 246. Production Architecture Example

``` text
                    Application
                         |
                       Pod
                         |
                       PVC
                         |
                        PV
                         |
                    CSI Driver
                         |
                  Storage Backend
                         |
        +----------------+----------------+
        |                |                |
     Replica A        Replica B        Replica C
        |                |                |
      Zone A           Zone B           Zone C
```

The actual architecture varies by storage system.

------------------------------------------------------------------------

# 247. Storage Governance Model

A mature Kubernetes platform may provide:

``` text
Namespace
   |
   +-- ResourceQuota
   |
   +-- PVC policy
   |
   +-- approved StorageClasses
   |
   +-- backup policy
   |
   +-- encryption
   |
   +-- monitoring
```

This provides more reliable storage governance than allowing arbitrary
storage configurations.

------------------------------------------------------------------------

# 248. StorageClass Selection Matrix

  Requirement           Possible choice
  --------------------- -------------------------------------
  General application   Standard block storage
  High IOPS database    Performance/SSD tier
  Shared filesystem     RWX-capable file storage
  Local low-latency     Local PV
  Archive               Low-cost archival tier
  Highly critical       Replicated/durable backend + backup

These are architectural categories, not universal provider names.

------------------------------------------------------------------------

# 249. PVC Design Questions

Before creating a PVC, ask:

``` text
1. How much capacity?
2. How fast must it be?
3. RWO/RWX/ROX/RWOP?
4. Filesystem or block?
5. Which StorageClass?
6. Which failure domains?
7. Is encryption required?
8. Is expansion required?
9. What is the backup strategy?
10. What is the reclaim policy?
11. Who owns it?
12. How will it be monitored?
13. What happens during node failure?
14. What happens during zone failure?
15. What happens when the application is deleted?
```

------------------------------------------------------------------------

# 250. Final Mental Model

Remember the storage chain:

``` text
                 USER / APPLICATION
                         |
                         v
                        PVC
                "I need storage"
                         |
                         v
                   StorageClass
                "What kind?"
                         |
                         v
                       CSI
                "Provision/manage"
                         |
                         v
                        PV
                "Kubernetes volume"
                         |
                         v
                 STORAGE BACKEND
                "Actual persistent data"
```

For a running workload:

``` text
Pod
 |
 v
PVC
 |
 v
PV
 |
 v
CSI
 |
 v
Disk / filesystem / storage service
```

------------------------------------------------------------------------

# 251. The Five Most Important PVC Concepts

## 1. PVC is a request

``` text
PVC = request
PV  = volume
```

## 2. PVC is namespaced

``` text
PVC -> namespace
PV  -> cluster
```

## 3. StorageClass enables dynamic provisioning

``` text
PVC -> StorageClass -> CSI -> PV
```

## 4. Access modes matter

``` text
RWO
RWX
ROX
RWOP
```

Support depends on the backend/driver.

## 5. Persistence is not backup

``` text
PVC != backup
```

You need an explicit recovery strategy.

------------------------------------------------------------------------

# 252. One-Minute Interview Answer

If asked:

> "Explain Kubernetes PVC."

A strong answer is:

> A PersistentVolumeClaim is a namespaced Kubernetes object used by
> workloads to request persistent storage. The claim can be statically
> bound to an existing PersistentVolume or dynamically provisioned
> through a StorageClass and CSI driver. The Pod references the PVC,
> which binds to a PV backed by an actual storage system. PVCs support
> access modes such as RWO, RWX, ROX, and, where supported, RWOP, as
> well as filesystem or raw-block volume modes. PVCs provide persistent
> storage across container and Pod replacement, but they do not
> themselves provide backup, disaster recovery, or high availability.

------------------------------------------------------------------------

# 253. Final Takeaway

The most important architecture to remember is:

``` text
                     Kubernetes
                         |
                        Pod
                         |
                   PersistentVolumeClaim
                         |
                  "storage request"
                         |
                         v
                    PersistentVolume
                         |
                   "storage resource"
                         |
                         v
                    CSI Driver
                         |
                         v
                 Actual Storage System
```

And the lifecycle:

``` text
Create PVC
    |
    v
Pending
    |
    | provisioning/binding
    v
Bound
    |
    v
Pod mounts volume
    |
    v
Application uses data
    |
    v
Pod can be replaced
    |
    v
Same PVC can be reused
    |
    v
PVC eventually retired
    |
    v
PV/storage lifecycle determined
by reclaim policy and backend
```

The key principle is:

> **A PVC gives a workload a persistent storage interface. It does not
> by itself guarantee backup, replication, encryption, high
> availability, or disaster recovery. Those properties come from the
> StorageClass, CSI driver, storage backend, and the surrounding
> operational architecture.**

If you understand:

``` text
PVC
 ↓
PV
 ↓
StorageClass
 ↓
CSI
 ↓
Storage backend
```

and:

``` text
RWO / RWX / ROX / RWOP
```

plus:

``` text
Pending / Bound
```

and:

``` text
Retain / Delete
```

you have the foundation needed to understand Kubernetes persistent
storage.
