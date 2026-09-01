# Kubernetes Volumes --- Complete Study & Reference Guide

> A comprehensive practical guide to Kubernetes storage and volumes:
> container storage, volume types, `emptyDir`, `hostPath`, `configMap`,
> `secret`, PersistentVolume (PV), PersistentVolumeClaim (PVC),
> StorageClass, dynamic provisioning, access modes, reclaim policies,
> CSI, snapshots, StatefulSets, storage topology, troubleshooting,
> hands-on labs, production practices, and interview questions.

------------------------------------------------------------------------

# 1. What Is a Kubernetes Volume?

A Kubernetes **Volume** provides storage that can be mounted into a
container.

Containers have an ephemeral filesystem.

If a container is restarted, data stored only inside the container
filesystem may be lost.

Kubernetes Volumes provide different ways to manage data lifecycle.

------------------------------------------------------------------------

# 2. Why Do We Need Volumes?

Without a Volume:

``` text
Pod
 |
 +--> Container
       |
       +--> Container filesystem
```

If the container is recreated:

``` text
Old container
     |
     X
     |
New container
```

Data written only to the old container filesystem may disappear.

With a Volume:

``` text
Pod
 |
 +--> Container
 |      |
 |      +--> /data
 |
 +--> Volume
        |
        +--> Storage
```

The storage lifecycle can be different from the container lifecycle.

------------------------------------------------------------------------

# 3. Container Filesystem vs Volume

Container filesystem:

``` text
Container
   |
   +--> writable layer
```

Volume:

``` text
Container
   |
   +--> mount
          |
          v
        Volume
```

A Volume can provide a storage location independent of the container's
writable layer.

------------------------------------------------------------------------

# 4. Pod-Level Volume

Volumes are defined in the Pod specification.

Example:

``` yaml
spec:
  volumes:
    - name: data
      emptyDir: {}
```

Then mount it into a container:

``` yaml
containers:
  - name: app

    volumeMounts:
      - name: data
        mountPath: /data
```

The names must match:

``` text
volumes.name
=
volumeMounts.name
```

------------------------------------------------------------------------

# 5. Basic Volume Architecture

``` text
Pod
 |
 +----------------------+
 |                      |
 v                      v
Container            Volume
   |                    |
   | mount              |
   +--------------------+
```

The Volume is attached/mounted into the container through:

``` yaml
volumeMounts:
```

------------------------------------------------------------------------

# 6. Volume vs VolumeMount

These are different concepts.

## Volume

Defines the storage source:

``` yaml
volumes:
  - name: data
    emptyDir: {}
```

## VolumeMount

Defines where the storage appears inside the container:

``` yaml
volumeMounts:
  - name: data
    mountPath: /data
```

Mental model:

``` text
volumes
=
"What storage?"

volumeMounts
=
"Where should it appear?"
```

------------------------------------------------------------------------

# 7. Common Kubernetes Storage Types

Important categories include:

``` text
emptyDir
hostPath
ConfigMap
Secret
projected
PersistentVolume
PersistentVolumeClaim
CSI volumes
Ephemeral volumes
```

The exact available volume plugins depend on Kubernetes and the
installed CSI drivers.

------------------------------------------------------------------------

# 8. `emptyDir`

`emptyDir` creates temporary storage for a Pod.

Example:

``` yaml
volumes:
  - name: scratch
    emptyDir: {}
```

Mount:

``` yaml
volumeMounts:
  - name: scratch
    mountPath: /scratch
```

------------------------------------------------------------------------

# 9. `emptyDir` Lifecycle

The storage exists while the Pod exists.

Conceptually:

``` text
Pod created
   |
   v
emptyDir created
   |
   v
Containers use it
   |
   v
Pod removed
   |
   v
emptyDir removed
```

Therefore:

``` text
emptyDir
=
Pod-lifetime storage
```

------------------------------------------------------------------------

# 10. `emptyDir` Use Cases

Good use cases:

``` text
temporary files
cache
scratch space
sharing files between containers
processing intermediate data
```

Example:

``` text
Container A
    |
    +--> /shared/output.txt
              ^
              |
           emptyDir
              |
              v
Container B
```

------------------------------------------------------------------------

# 11. `emptyDir` With Memory

You can use:

``` yaml
emptyDir:
  medium: Memory
```

This uses memory-backed storage.

Example:

``` yaml
volumes:
  - name: cache
    emptyDir:
      medium: Memory
```

Be careful with size and resource planning.

------------------------------------------------------------------------

# 12. `emptyDir` Size Limit

Example:

``` yaml
emptyDir:
  sizeLimit: 1Gi
```

This can limit the volume size where supported.

For memory-backed `emptyDir`, usage consumes memory resources.

------------------------------------------------------------------------

# 13. `emptyDir` Is Not Persistent Storage

Do not use:

``` text
emptyDir
```

for important database data.

Use:

``` text
PVC
```

when data must survive Pod replacement.

------------------------------------------------------------------------

# 14. `hostPath`

`hostPath` mounts a path from the Kubernetes node filesystem.

Example:

``` yaml
volumes:
  - name: host-data
    hostPath:
      path: /var/lib/myapp
      type: DirectoryOrCreate
```

------------------------------------------------------------------------

# 15. `hostPath` Architecture

``` text
Node
 |
 +--> /var/lib/myapp
          ^
          |
       hostPath
          |
          v
         Pod
```

------------------------------------------------------------------------

# 16. Why `hostPath` Can Be Dangerous

A Pod scheduled to another node may see a different filesystem.

Example:

``` text
Node A
  /data = application files

Node B
  /data = empty/different files
```

If the Pod moves:

``` text
Node A
  |
  X
  |
Node B
```

the data may not be available in the expected way.

------------------------------------------------------------------------

# 17. `hostPath` Use Cases

Potential use cases:

``` text
node-level agents
logging agents
monitoring agents
specialized infrastructure workloads
development/testing
```

It is usually not the first choice for portable application persistence.

------------------------------------------------------------------------

# 18. Security Risk of `hostPath`

A `hostPath` mount can expose node filesystem data to a container.

For example:

``` text
hostPath:
  /etc
```

could expose sensitive host configuration.

Avoid broad host filesystem access.

------------------------------------------------------------------------

# 19. ConfigMap as a Volume

A ConfigMap can be mounted as files.

Example:

``` yaml
volumes:
  - name: config
    configMap:
      name: app-config
```

Mount:

``` yaml
volumeMounts:
  - name: config
    mountPath: /etc/myapp
```

------------------------------------------------------------------------

# 20. Secret as a Volume

A Secret can also be mounted as files.

Example:

``` yaml
volumes:
  - name: secret
    secret:
      secretName: app-secret
```

Mount:

``` yaml
volumeMounts:
  - name: secret
    mountPath: /etc/secrets
    readOnly: true
```

------------------------------------------------------------------------

# 21. Projected Volumes

Projected volumes combine multiple sources into one directory.

For example:

``` text
Secret
ConfigMap
Downward API
ServiceAccount token
```

Conceptually:

``` text
Projected Volume
      |
      +--> Secret
      +--> ConfigMap
      +--> Downward API
      +--> Token
```

------------------------------------------------------------------------

# 22. Persistent Storage

For important data, Kubernetes commonly uses:

``` text
PersistentVolume (PV)
+
PersistentVolumeClaim (PVC)
```

Architecture:

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
Storage Backend
```

------------------------------------------------------------------------

# 23. PersistentVolume

A **PersistentVolume (PV)** represents storage available to the
Kubernetes cluster.

Conceptually:

``` text
PV
=
storage resource
```

A PV can be statically created or dynamically provisioned.

------------------------------------------------------------------------

# 24. PersistentVolumeClaim

A **PersistentVolumeClaim (PVC)** is a request for storage.

Conceptually:

``` text
PVC
=
application's request for storage
```

Example:

``` yaml
resources:
  requests:
    storage: 10Gi
```

------------------------------------------------------------------------

# 25. PV vs PVC

Think:

``` text
PV
=
"What storage exists?"

PVC
=
"What storage does my application request?"
```

Architecture:

``` text
Application
     |
     v
    PVC
     |
     v
    PV
     |
     v
Storage backend
```

------------------------------------------------------------------------

# 26. Why Use PVC Instead of Directly Referencing Storage?

The application can request:

``` text
10Gi
ReadWriteOnce
specific storage class
```

without needing to know the physical storage details.

This creates a useful abstraction:

``` text
Application
    |
    v
   PVC
    |
    v
Storage implementation
```

------------------------------------------------------------------------

# 27. PVC Example

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

------------------------------------------------------------------------

# 28. Using PVC in a Pod

``` yaml
apiVersion: v1
kind: Pod

metadata:
  name: storage-test

spec:
  containers:
    - name: app
      image: nginx:1.27

      volumeMounts:
        - name: data
          mountPath: /data

  volumes:
    - name: data

      persistentVolumeClaim:
        claimName: app-data
```

------------------------------------------------------------------------

# 29. PV/PVC Architecture

``` text
                 Kubernetes
                     |
       +-------------+-------------+
       |                           |
       v                           v
      Pod                         PVC
       |                           |
       | uses                      | binds
       v                           v
    Volume  --------------------> PV
                                   |
                                   v
                             Storage Backend
```

------------------------------------------------------------------------

# 30. StorageClass

A StorageClass describes a class of storage.

Example:

``` yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass

metadata:
  name: fast-storage

provisioner: example.com/csi

parameters:
  type: fast
```

Actual parameters depend on the CSI driver.

------------------------------------------------------------------------

# 31. Why StorageClass?

Without dynamic provisioning, administrators may have to create PVs
manually.

With StorageClass:

``` text
PVC
 |
 v
StorageClass
 |
 v
Provisioner
 |
 v
New storage
```

------------------------------------------------------------------------

# 32. Dynamic Provisioning

Example:

``` yaml
storageClassName: fast-storage
```

in a PVC.

Kubernetes can request the provisioner to create storage dynamically.

Architecture:

``` text
PVC
 |
 v
StorageClass
 |
 v
CSI Provisioner
 |
 v
Storage backend
```

------------------------------------------------------------------------

# 33. Static Provisioning

Administrator creates:

``` text
PV
```

before the application creates a PVC.

Architecture:

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

------------------------------------------------------------------------

# 34. Dynamic vs Static Provisioning

  Feature            Static        Dynamic
  ------------------ ------------- ---------------------------
  PV creation        Manual        Automatically provisioned
  StorageClass       Optional      Commonly used
  Operations         More manual   More automated
  Cloud-native use   Less common   Very common

------------------------------------------------------------------------

# 35. Storage Lifecycle

Typical dynamic provisioning flow:

``` text
PVC created
     |
     v
StorageClass selected
     |
     v
CSI provisioner receives request
     |
     v
Storage created
     |
     v
PV created
     |
     v
PVC bound
     |
     v
Pod mounts PVC
```

------------------------------------------------------------------------

# 36. PVC States

Common PVC phases:

``` text
Pending
Bound
Lost
```

Check:

``` bash
kubectl get pvc
```

------------------------------------------------------------------------

# 37. PV States

Common PV phases include:

``` text
Available
Bound
Released
Failed
```

Check:

``` bash
kubectl get pv
```

------------------------------------------------------------------------

# 38. PVC Pending

If PVC is:

``` text
Pending
```

investigate:

``` bash
kubectl describe pvc <name>
kubectl get storageclass
kubectl get pv
```

Possible causes:

``` text
no StorageClass
wrong StorageClass
provisioner unavailable
insufficient storage
topology constraints
access mode mismatch
backend failure
```

------------------------------------------------------------------------

# 39. PVC Bound

Example:

``` text
NAME       STATUS   VOLUME
app-data   Bound    pvc-xxxx
```

This means the claim is associated with a PV.

------------------------------------------------------------------------

# 40. StorageClass Default

A cluster may have a default StorageClass.

Check:

``` bash
kubectl get storageclass
```

Look for:

``` text
(default)
```

A PVC that omits `storageClassName` may use the default StorageClass
when one is configured.

------------------------------------------------------------------------

# 41. Explicit StorageClass

For predictable production behavior, specify:

``` yaml
storageClassName: fast-storage
```

when appropriate.

------------------------------------------------------------------------

# 42. `storageClassName: ""`

An explicit empty string has special meaning and can prevent automatic
default StorageClass selection.

Use this intentionally, not accidentally.

------------------------------------------------------------------------

# 43. Access Modes

Important access modes:

``` text
ReadWriteOnce (RWO)
ReadOnlyMany (ROX)
ReadWriteMany (RWX)
ReadWriteOncePod (RWOP)
```

Support depends on the storage implementation.

------------------------------------------------------------------------

# 44. ReadWriteOnce

``` text
RWO
=
volume can be mounted read-write by one node
```

The precise behavior depends on the storage implementation and
Kubernetes semantics.

Do not interpret RWO simply as "only one process."

------------------------------------------------------------------------

# 45. ReadOnlyMany

``` text
ROX
=
multiple nodes can mount the volume read-only
```

The storage backend must support this mode.

------------------------------------------------------------------------

# 46. ReadWriteMany

``` text
RWX
=
multiple nodes can mount the volume read-write
```

Commonly used for shared filesystems.

Not all block storage systems support RWX.

------------------------------------------------------------------------

# 47. ReadWriteOncePod

``` text
RWOP
=
volume mounted read-write by a single Pod
```

This is stricter than RWO.

Support depends on the CSI driver and Kubernetes version.

------------------------------------------------------------------------

# 48. Access Mode Does Not Guarantee Application Safety

Even if storage supports:

``` text
RWX
```

multiple applications writing the same files does not automatically make
the application safe.

Application-level:

``` text
locking
consistency
concurrency
data format
```

still matter.

------------------------------------------------------------------------

# 49. Reclaim Policy

PV reclaim policy controls what happens to storage after a claim is
released.

Common policies:

``` text
Retain
Delete
```

The behavior depends on the storage provisioner and resource.

------------------------------------------------------------------------

# 50. Retain

``` yaml
persistentVolumeReclaimPolicy: Retain
```

The PV/storage is retained after the PVC is released.

Useful when protecting important data from automatic deletion.

------------------------------------------------------------------------

# 51. Delete

``` yaml
persistentVolumeReclaimPolicy: Delete
```

The associated dynamically provisioned storage can be deleted when the
claim lifecycle causes the PV to be deleted.

Exact behavior depends on the provisioner.

Use carefully.

------------------------------------------------------------------------

# 52. Reclaim Policy Mental Model

``` text
PVC
 |
 v
PV
 |
 v
Storage

PVC deleted
 |
 +--> Retain
 |      |
 |      +--> preserve storage/PV for recovery
 |
 +--> Delete
        |
        +--> storage may be deleted
```

------------------------------------------------------------------------

# 53. Volume Binding Mode

StorageClasses can define:

``` yaml
volumeBindingMode:
```

Common modes:

``` text
Immediate
WaitForFirstConsumer
```

------------------------------------------------------------------------

# 54. Immediate Binding

``` yaml
volumeBindingMode: Immediate
```

The volume can be provisioned/bound when the PVC is created.

This can be problematic if storage has topology restrictions.

------------------------------------------------------------------------

# 55. WaitForFirstConsumer

``` yaml
volumeBindingMode: WaitForFirstConsumer
```

Storage provisioning/binding can be delayed until a Pod using the PVC is
scheduled.

This allows Kubernetes to consider:

``` text
node
zone
topology
```

before selecting/provisioning storage.

------------------------------------------------------------------------

# 56. Why `WaitForFirstConsumer` Matters

Example:

``` text
Volume available in Zone A
Pod scheduled in Zone B
```

If storage cannot cross zones, the Pod may fail.

Topology-aware binding helps avoid this mismatch.

------------------------------------------------------------------------

# 57. Volume Topology

Storage can be constrained by:

``` text
node
zone
region
```

CSI drivers can advertise topology information.

Kubernetes scheduler uses relevant topology information to place Pods
appropriately.

------------------------------------------------------------------------

# 58. CSI

CSI stands for:

``` text
Container Storage Interface
```

CSI provides a standard interface for storage systems to integrate with
Kubernetes.

Architecture:

``` text
Kubernetes
    |
    v
CSI Driver
    |
    v
Storage Backend
```

------------------------------------------------------------------------

# 59. CSI Driver

A CSI driver manages storage operations such as:

``` text
provision
attach
mount
unmount
expand
snapshot
```

Capabilities depend on the specific driver.

------------------------------------------------------------------------

# 60. Why CSI Matters

CSI allows Kubernetes to work with many storage systems without
embedding vendor-specific storage logic directly into the Kubernetes
core.

------------------------------------------------------------------------

# 61. CSI Architecture

Conceptually:

``` text
Kubernetes API
      |
      v
Kubernetes Controllers
      |
      v
CSI Components
      |
      v
CSI Driver
      |
      v
Storage Platform
```

------------------------------------------------------------------------

# 62. Common CSI Components

Depending on the implementation, you may encounter components such as:

``` text
external-provisioner
external-attacher
external-resizer
external-snapshotter
node plugin
controller plugin
```

The exact deployment varies by driver.

------------------------------------------------------------------------

# 63. CSI Node Plugin

The node component handles operations required on individual Kubernetes
nodes.

Conceptually:

``` text
Node
 |
 +--> CSI node plugin
        |
        +--> mount storage
        +--> unmount storage
```

------------------------------------------------------------------------

# 64. CSI Controller Components

Controller-side components can handle operations such as:

``` text
dynamic provisioning
attachment
resizing
snapshot coordination
```

depending on installed sidecars and driver capabilities.

------------------------------------------------------------------------

# 65. Volume Expansion

Some storage classes support expanding PVCs.

Example:

``` yaml
allowVolumeExpansion: true
```

Then a PVC can potentially be increased:

``` text
10Gi
  |
  v
20Gi
```

Support depends on the StorageClass and CSI driver.

------------------------------------------------------------------------

# 66. Expanding a PVC

Example:

``` bash
kubectl edit pvc app-data
```

Change:

``` yaml
storage: 10Gi
```

to:

``` yaml
storage: 20Gi
```

Check:

``` bash
kubectl get pvc
```

Do not reduce a PVC size. Kubernetes generally supports expansion, not
shrinking.

------------------------------------------------------------------------

# 67. Filesystem Expansion

Increasing the underlying volume does not always mean the application
immediately sees additional filesystem space.

Depending on the filesystem and CSI driver, filesystem expansion may
also be required.

Check:

``` bash
df -h
```

inside the container when troubleshooting.

------------------------------------------------------------------------

# 68. Volume Snapshots

Kubernetes can integrate with CSI volume snapshots.

Conceptual architecture:

``` text
PVC
 |
 v
VolumeSnapshot
 |
 v
Storage snapshot
```

A VolumeSnapshot is a point-in-time storage operation when supported by
the CSI driver.

------------------------------------------------------------------------

# 69. VolumeSnapshotClass

A `VolumeSnapshotClass` defines how snapshots are created for a storage
driver.

Conceptually:

``` text
VolumeSnapshot
      |
      v
VolumeSnapshotClass
      |
      v
CSI Driver
      |
      v
Storage Snapshot
```

------------------------------------------------------------------------

# 70. Restore From Snapshot

A snapshot can be used as a source for a new PVC where supported.

Conceptually:

``` text
Snapshot
   |
   v
New PVC
   |
   v
New Pod
```

------------------------------------------------------------------------

# 71. Snapshot Is Not Automatically a Database Backup

Important:

``` text
storage snapshot
!=
application-consistent database backup
```

For databases, understand:

``` text
transaction consistency
WAL/logs
quiescing
application-aware backup
```

------------------------------------------------------------------------

# 72. Ephemeral Volumes

Some workloads need storage that follows the Pod lifecycle.

Examples can include:

``` text
emptyDir
CSI ephemeral volumes
generic ephemeral volumes
```

These are different from long-lived PVC-based storage.

------------------------------------------------------------------------

# 73. Generic Ephemeral Volumes

A generic ephemeral volume can be defined through a volume source and is
associated with the Pod lifecycle.

Conceptually:

``` text
Pod
 |
 v
Ephemeral volume
 |
 v
storage resource
```

Use cases include temporary per-Pod storage provided by a CSI driver.

------------------------------------------------------------------------

# 74. Persistent vs Ephemeral

``` text
Ephemeral
=
temporary / Pod lifecycle

Persistent
=
data expected to survive Pod replacement
```

Examples:

``` text
emptyDir
=
ephemeral

PVC
=
persistent
```

------------------------------------------------------------------------

# 75. Volume Mount Options

A volume can be mounted with options such as:

``` yaml
readOnly: true
```

Example:

``` yaml
volumeMounts:
  - name: config
    mountPath: /etc/config
    readOnly: true
```

Use read-only mounts wherever the application does not need write
access.

------------------------------------------------------------------------

# 76. `subPath`

You can mount a subdirectory/file from a volume.

Example:

``` yaml
volumeMounts:
  - name: config
    mountPath: /etc/app/config.yaml
    subPath: config.yaml
```

Be careful with `subPath` behavior, especially when expecting mounted
ConfigMap/Secret updates to propagate.

------------------------------------------------------------------------

# 77. `mountPropagation`

Advanced workloads may use:

``` yaml
mountPropagation:
```

Possible values include:

``` text
None
HostToContainer
Bidirectional
```

This is an advanced feature and should be used only when required.

------------------------------------------------------------------------

# 78. File Permissions

Storage may appear with specific:

``` text
UID
GID
permissions
```

Applications can fail if they cannot write to the mounted directory.

Troubleshoot with:

``` bash
kubectl exec <pod> -- id
kubectl exec <pod> -- ls -la /data
```

------------------------------------------------------------------------

# 79. Security Context and Volumes

You may need:

``` yaml
securityContext:
  runAsUser: 1000
  runAsGroup: 1000
  fsGroup: 1000
```

Whether `fsGroup` changes volume permissions depends on volume type and
CSI driver behavior.

------------------------------------------------------------------------

# 80. Read-Only Root Filesystem

For security:

``` yaml
securityContext:
  readOnlyRootFilesystem: true
```

Then provide writable locations through volumes such as:

``` text
emptyDir
```

Example:

``` text
Container root filesystem
        |
        +--> read-only

Writable:
        |
        +--> /tmp -> emptyDir
        +--> /data -> PVC
```

------------------------------------------------------------------------

# 81. StatefulSet + PVC

StatefulSets commonly use:

``` yaml
volumeClaimTemplates:
```

Architecture:

``` text
StatefulSet
 |
 +--> db-0 --> PVC data-db-0
 |
 +--> db-1 --> PVC data-db-1
 |
 +--> db-2 --> PVC data-db-2
```

------------------------------------------------------------------------

# 82. Why StatefulSet Uses Per-Pod Volumes

Suppose:

``` text
db-0
db-1
db-2
```

Each database member can have its own storage:

``` text
db-0 -> data-db-0
db-1 -> data-db-1
db-2 -> data-db-2
```

This preserves the relationship between:

``` text
Pod identity
+
storage identity
```

------------------------------------------------------------------------

# 83. Deployment + Shared PVC

A Deployment may mount a PVC, but storage semantics depend on access
mode and backend.

For example:

``` text
3 Pods
   |
   +--> same PVC
```

may work with RWX storage.

But:

``` text
RWO
```

may prevent multiple Pods on different nodes from mounting the volume
read-write.

------------------------------------------------------------------------

# 84. Shared Storage

For applications needing multiple Pods to access the same files:

``` text
Pod A
  \
   \
    +--> RWX Volume
   /
  /
Pod B
```

The storage backend must support RWX.

Examples of suitable storage technologies depend on your environment.

------------------------------------------------------------------------

# 85. Local Persistent Volumes

Kubernetes can use local storage through Local PersistentVolumes.

Conceptually:

``` text
Node A
  |
  +--> local disk
        |
        v
       PV
```

Local storage is tied to a node.

If that node fails:

``` text
application recovery
```

may be significantly more complicated.

------------------------------------------------------------------------

# 86. Local Storage vs Network Storage

``` text
Local Storage
=
physically attached to node

Network/Distributed Storage
=
accessible through storage network/system
```

Local storage can provide excellent performance but introduces placement
and failure considerations.

------------------------------------------------------------------------

# 87. Storage Performance

Important storage metrics:

``` text
IOPS
throughput
latency
queue depth
capacity
```

For databases:

``` text
latency
```

can be particularly important.

------------------------------------------------------------------------

# 88. Storage Capacity Planning

Do not only calculate:

``` text
current data
```

Also consider:

``` text
growth
logs
indexes
temporary files
backups
compaction
replication
headroom
```

Example:

``` text
Current data = 100Gi
Growth = 20Gi/month

Do not provision exactly 100Gi.
```

------------------------------------------------------------------------

# 89. Storage Monitoring

Monitor:

``` text
PVC capacity
filesystem usage
volume latency
IOPS
throughput
inode usage
Pod mount failures
storage backend health
```

------------------------------------------------------------------------

# 90. Common Storage Failure Modes

``` text
PVC Pending
PV Pending
FailedMount
FailedAttachVolume
Multi-Attach error
permission denied
filesystem full
inode exhaustion
storage backend unavailable
topology mismatch
```

------------------------------------------------------------------------

# 91. `FailedMount`

Check:

``` bash
kubectl describe pod <pod>
```

Look for:

``` text
FailedMount
```

Then inspect:

``` bash
kubectl get pvc
kubectl get pv
kubectl get storageclass
```

------------------------------------------------------------------------

# 92. `FailedAttachVolume`

Possible causes include:

``` text
storage backend failure
volume attachment problem
node issue
access mode conflict
CSI driver problem
```

Check:

``` bash
kubectl get volumeattachments
```

if the environment uses them.

------------------------------------------------------------------------

# 93. Multi-Attach Error

A common scenario:

``` text
RWO volume
   |
   +--> Node A
```

Pod moves to:

``` text
Node B
```

while the volume is still attached to Node A.

The CSI/storage system may report a multi-attach problem.

Investigate:

``` bash
kubectl describe pod <pod>
kubectl get volumeattachments
```

------------------------------------------------------------------------

# 94. Permission Denied

Example:

``` text
application cannot write /data
```

Check:

``` bash
kubectl exec <pod> -- id
kubectl exec <pod> -- ls -ld /data
```

Review:

``` text
runAsUser
runAsGroup
fsGroup
volume permissions
storage driver behavior
```

------------------------------------------------------------------------

# 95. Disk Full

Inside Pod:

``` bash
df -h
```

Check inode usage:

``` bash
df -i
```

A filesystem can run out of inodes even when free space remains.

------------------------------------------------------------------------

# 96. PVC Pending Troubleshooting Workflow

``` text
PVC Pending
    |
    v
kubectl describe pvc
    |
    +--> StorageClass?
    |
    +--> Provisioner?
    |
    +--> Capacity?
    |
    +--> Access mode?
    |
    +--> Topology?
    |
    +--> CSI driver?
```

------------------------------------------------------------------------

# 97. StorageClass Troubleshooting

Run:

``` bash
kubectl get storageclass
kubectl describe storageclass <name>
```

Check:

``` text
provisioner
parameters
reclaimPolicy
volumeBindingMode
allowVolumeExpansion
```

------------------------------------------------------------------------

# 98. PV Troubleshooting

Run:

``` bash
kubectl get pv
kubectl describe pv <name>
```

Check:

``` text
phase
capacity
access modes
claim
storageClass
reclaim policy
node affinity
events
```

------------------------------------------------------------------------

# 99. PVC Troubleshooting

Run:

``` bash
kubectl get pvc
kubectl describe pvc <name>
```

Check:

``` text
status
volume
capacity
access modes
storageClass
events
```

------------------------------------------------------------------------

# 100. CSI Troubleshooting

First:

``` bash
kubectl get csidrivers
```

Then inspect CSI Pods:

``` bash
kubectl get pods -A | grep -i csi
```

On Windows PowerShell, you can use:

``` powershell
kubectl get pods -A | Select-String -Pattern "csi"
```

Then inspect relevant logs:

``` bash
kubectl logs <csi-pod> -n <namespace>
```

------------------------------------------------------------------------

# 101. Volume Attachment Troubleshooting

Check:

``` bash
kubectl get volumeattachments
```

Describe:

``` bash
kubectl describe volumeattachment <name>
```

Look for:

``` text
attach error
node
driver
volume handle
```

------------------------------------------------------------------------

# 102. Pod Storage Troubleshooting

Use:

``` bash
kubectl describe pod <pod>
```

Pay special attention to:

``` text
Volumes
Mounts
Events
FailedMount
FailedAttachVolume
```

------------------------------------------------------------------------

# 103. Verify Mount From Inside Pod

``` bash
kubectl exec -it <pod> -- sh
```

Then:

``` bash
df -h
mount
ls -la /data
```

------------------------------------------------------------------------

# 104. Verify Write Access

Inside the container:

``` bash
touch /data/test.txt
```

If it fails:

``` text
permission
read-only mount
filesystem
storage backend
```

may be responsible.

------------------------------------------------------------------------

# 105. Complete PVC Example

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim

metadata:
  name: app-data

spec:
  accessModes:
    - ReadWriteOnce

  storageClassName: standard

  resources:
    requests:
      storage: 10Gi
```

------------------------------------------------------------------------

# 106. Complete Pod + PVC Example

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: storage-demo
spec:
  containers:
    - name: app
      image: nginx:1.27

      volumeMounts:
        - name: data
          mountPath: /data

  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: app-data
```

------------------------------------------------------------------------

# 107. Complete `emptyDir` Example

``` yaml
apiVersion: v1
kind: Pod

metadata:
  name: emptydir-demo

spec:
  containers:

    - name: writer
      image: busybox:1.36

      command:
        - sh
        - -c
        - |
          echo "hello" > /shared/message.txt
          sleep 3600

      volumeMounts:
        - name: shared
          mountPath: /shared

    - name: reader
      image: busybox:1.36

      command:
        - sh
        - -c
        - |
          sleep 5
          cat /shared/message.txt
          sleep 3600

      volumeMounts:
        - name: shared
          mountPath: /shared

  volumes:
    - name: shared
      emptyDir: {}
```

------------------------------------------------------------------------

# 108. Complete ConfigMap Volume Example

``` yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: app-config

data:
  app.conf: |
    PORT=5000
    MODE=production
---
apiVersion: v1
kind: Pod

metadata:
  name: config-volume-demo

spec:
  containers:
    - name: app
      image: nginx:1.27

      volumeMounts:
        - name: config
          mountPath: /etc/myapp
          readOnly: true

  volumes:
    - name: config
      configMap:
        name: app-config
```

------------------------------------------------------------------------

# 109. Complete Secret Volume Example

``` yaml
apiVersion: v1
kind: Secret

metadata:
  name: app-secret

type: Opaque

stringData:
  password: super-secret-value
---
apiVersion: v1
kind: Pod

metadata:
  name: secret-volume-demo

spec:
  containers:
    - name: app
      image: nginx:1.27

      volumeMounts:
        - name: secrets
          mountPath: /etc/secrets
          readOnly: true

  volumes:
    - name: secrets
      secret:
        secretName: app-secret
```

------------------------------------------------------------------------

# 110. Static PV Example

The exact PV configuration depends on the storage backend.

Example conceptual structure:

``` yaml
apiVersion: v1
kind: PersistentVolume

metadata:
  name: example-pv

spec:
  capacity:
    storage: 10Gi

  accessModes:
    - ReadWriteOnce

  persistentVolumeReclaimPolicy: Retain

  storageClassName: manual

  hostPath:
    path: /mnt/data
```

> `hostPath` PVs are primarily suitable for controlled
> development/testing or specific node-local use cases. They are
> generally not a production replacement for a proper CSI-backed storage
> system.

------------------------------------------------------------------------

# 111. Static PV + PVC

``` yaml
apiVersion: v1
kind: PersistentVolume

metadata:
  name: example-pv

spec:
  capacity:
    storage: 10Gi

  accessModes:
    - ReadWriteOnce

  persistentVolumeReclaimPolicy: Retain

  storageClassName: manual

  hostPath:
    path: /mnt/data
---
apiVersion: v1
kind: PersistentVolumeClaim

metadata:
  name: example-pvc

spec:
  storageClassName: manual

  accessModes:
    - ReadWriteOnce

  resources:
    requests:
      storage: 5Gi
```

------------------------------------------------------------------------

# 112. StorageClass Example

A real StorageClass must use the provisioner installed in your cluster.

Generic example:

``` yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass

metadata:
  name: fast-storage

provisioner: example.com/csi-driver

parameters:
  type: fast

reclaimPolicy: Delete

volumeBindingMode: WaitForFirstConsumer

allowVolumeExpansion: true
```

Do not copy the example provisioner name into a real cluster unless that
CSI driver actually exists.

------------------------------------------------------------------------

# 113. StatefulSet Storage Example

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

        storageClassName: standard

        resources:
          requests:
            storage: 10Gi
```

This creates separate claims for StatefulSet members.

------------------------------------------------------------------------

# 114. StatefulSet Storage Architecture

``` text
StatefulSet
    |
    +--> database-0 --> data-database-0
    |
    +--> database-1 --> data-database-1
    |
    +--> database-2 --> data-database-2
```

Each claim can be backed by a different PV/storage resource.

------------------------------------------------------------------------

# 115. Storage and Deployment

Deployment:

``` text
Deployment
   |
   +--> Pod A
   +--> Pod B
   +--> Pod C
```

If all Pods need the same writable data:

``` text
shared storage
```

may be required.

If each Pod needs its own data:

``` text
StatefulSet
```

is usually a better pattern.

------------------------------------------------------------------------

# 116. Storage and Service

Service does not provide storage.

Service:

``` text
network access
service discovery
```

Volume:

``` text
storage
```

PVC:

``` text
storage request
```

------------------------------------------------------------------------

# 117. Storage and Secret

Secret can be mounted as files:

``` text
Secret
  |
  v
Volume
  |
  v
Container
```

But Secret volume is not a general persistent data volume.

------------------------------------------------------------------------

# 118. Storage and ConfigMap

ConfigMap volume:

``` text
configuration files
```

PVC:

``` text
persistent application data
```

Do not use ConfigMap as a database storage mechanism.

------------------------------------------------------------------------

# 119. Volume Security Checklist

``` text
[ ] Avoid unnecessary hostPath
[ ] Use readOnly mounts where possible
[ ] Restrict container privileges
[ ] Use proper filesystem permissions
[ ] Protect sensitive Secret data
[ ] Avoid exposing host filesystem
[ ] Use trusted CSI drivers
[ ] Monitor storage access
```

------------------------------------------------------------------------

# 120. Production Storage Checklist

``` text
[ ] Correct StorageClass
[ ] Correct access mode
[ ] Correct reclaim policy
[ ] Correct volume binding mode
[ ] Storage topology understood
[ ] CSI driver healthy
[ ] Capacity monitored
[ ] Backup strategy
[ ] Restore tested
[ ] Expansion strategy
[ ] Failure recovery tested
```

------------------------------------------------------------------------

# 121. Backup Checklist

For important data:

``` text
[ ] Automated backups
[ ] Off-cluster copy
[ ] Retention policy
[ ] Encryption
[ ] Restore testing
[ ] Recovery documentation
[ ] RPO defined
[ ] RTO defined
```

------------------------------------------------------------------------

# 122. RPO and RTO

## RPO

Recovery Point Objective:

``` text
How much data can we afford to lose?
```

## RTO

Recovery Time Objective:

``` text
How quickly must the service recover?
```

Storage architecture should support the application's RPO/RTO.

------------------------------------------------------------------------

# 123. Volume Failure Decision Tree

``` text
Pod cannot use storage
        |
        v
Is Pod Pending?
   |
   +--> Yes
   |     |
   |     +--> PVC Pending?
   |     +--> Scheduling?
   |     +--> Topology?
   |
   +--> No
         |
         v
      FailedMount?
         |
         +--> permissions
         +--> filesystem
         +--> CSI
         +--> mount configuration
         |
         v
      FailedAttach?
         |
         +--> node
         +--> attachment
         +--> access mode
         +--> CSI
```

------------------------------------------------------------------------

# 124. Hands-On Lab 1 --- `emptyDir`

Create:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-lab
spec:
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "sleep 3600"]
      volumeMounts:
        - name: scratch
          mountPath: /scratch
  volumes:
    - name: scratch
      emptyDir: {}
```

Apply:

``` bash
kubectl apply -f emptydir.yaml
```

Test:

``` bash
kubectl exec emptydir-lab -- sh -c "echo hello > /scratch/test.txt"
kubectl exec emptydir-lab -- cat /scratch/test.txt
```

------------------------------------------------------------------------

# 125. Hands-On Lab 2 --- PVC

Create a PVC:

``` bash
kubectl apply -f pvc.yaml
```

Check:

``` bash
kubectl get pvc
```

Then:

``` bash
kubectl describe pvc <name>
```

------------------------------------------------------------------------

# 126. Hands-On Lab 3 --- Mount PVC

Create a Pod using the PVC.

Check:

``` bash
kubectl get pod
kubectl describe pod <pod>
```

Then:

``` bash
kubectl exec -it <pod> -- sh
```

Inside:

``` bash
df -h
touch /data/test.txt
```

------------------------------------------------------------------------

# 127. Hands-On Lab 4 --- Persistence

Write:

``` bash
echo "persistent data" > /data/test.txt
```

Delete the Pod:

``` bash
kubectl delete pod <pod>
```

Create a replacement Pod using the same PVC.

Verify:

``` bash
cat /data/test.txt
```

Expected:

``` text
persistent data
```

assuming the same PVC remains available.

------------------------------------------------------------------------

# 128. Hands-On Lab 5 --- PVC Expansion

Check StorageClass:

``` bash
kubectl get storageclass
```

Verify:

``` text
allowVolumeExpansion: true
```

Increase:

``` text
1Gi -> 2Gi
```

Then:

``` bash
kubectl get pvc
```

and:

``` bash
kubectl describe pvc <name>
```

------------------------------------------------------------------------

# 129. Hands-On Lab 6 --- ConfigMap Volume

Create ConfigMap:

``` bash
kubectl create configmap app-config \
  --from-literal=mode=production
```

Mount it as a volume.

Check:

``` bash
kubectl exec <pod> -- cat /etc/config/mode
```

------------------------------------------------------------------------

# 130. Hands-On Lab 7 --- Secret Volume

Create:

``` bash
kubectl create secret generic app-secret \
  --from-literal=password=my-password
```

Mount it.

Check:

``` bash
kubectl exec <pod> -- ls -la /etc/secrets
```

Avoid exposing secret values in terminal history or shared logs.

------------------------------------------------------------------------

# 131. Hands-On Lab 8 --- StatefulSet PVCs

Create a StatefulSet with:

``` yaml
replicas: 3
volumeClaimTemplates:
```

Then:

``` bash
kubectl get pods
kubectl get pvc
```

Expected:

``` text
database-0
database-1
database-2
```

and:

``` text
data-database-0
data-database-1
data-database-2
```

------------------------------------------------------------------------

# 132. Hands-On Lab 9 --- Delete Stateful Pod

Delete:

``` bash
kubectl delete pod database-1
```

Watch:

``` bash
kubectl get pods -w
```

Verify:

``` text
database-1
```

returns.

Then inspect:

``` bash
kubectl get pvc
```

------------------------------------------------------------------------

# 133. Hands-On Lab 10 --- Storage Failure

Create a PVC using an invalid StorageClass.

Observe:

``` text
Pending
```

Then:

``` bash
kubectl describe pvc <name>
```

Identify the event explaining why provisioning failed.

------------------------------------------------------------------------

# 134. Hands-On Lab 11 --- Permission Failure

Run a Pod as a non-root user and mount a writable volume.

Test:

``` bash
touch /data/test
```

If permission is denied, investigate:

``` text
UID
GID
fsGroup
volume permissions
CSI behavior
```

------------------------------------------------------------------------

# 135. Hands-On Lab 12 --- Disk Usage

Inside a Pod:

``` bash
df -h
df -i
```

Understand:

``` text
space usage
inode usage
```

------------------------------------------------------------------------

# 136. Hands-On Lab 13 --- VolumeAttachment

For CSI-backed storage:

``` bash
kubectl get volumeattachments
```

Describe relevant resources:

``` bash
kubectl describe volumeattachment <name>
```

Understand which node currently has the attachment.

------------------------------------------------------------------------

# 137. Hands-On Lab 14 --- Headless Stateful Storage

Create:

``` text
Headless Service
+
StatefulSet
+
PVC template
```

Verify:

``` text
db-0
db-1
db-2
```

and:

``` text
PVC per Pod
```

Then test DNS.

------------------------------------------------------------------------

# 138. Storage Command Cheat Sheet

``` bash
# PVCs
kubectl get pvc

# Detailed PVC
kubectl describe pvc <name>

# PVs
kubectl get pv

# Detailed PV
kubectl describe pv <name>

# StorageClasses
kubectl get storageclass

# Detailed StorageClass
kubectl describe storageclass <name>

# CSI drivers
kubectl get csidrivers

# Volume attachments
kubectl get volumeattachments

# Detailed attachment
kubectl describe volumeattachment <name>

# Pods
kubectl get pods -o wide

# Pod details
kubectl describe pod <pod>

# Pod logs
kubectl logs <pod>

# Execute
kubectl exec -it <pod> -- sh

# Events
kubectl get events --sort-by='.lastTimestamp'

# StatefulSets
kubectl get sts

# StatefulSet details
kubectl describe sts <name>
```

------------------------------------------------------------------------

# 139. Important Storage Objects

Remember these:

``` text
Pod
 |
 v
Volume
 |
 v
PVC
 |
 v
PV
 |
 v
StorageClass / CSI
 |
 v
Storage Backend
```

Not every Volume uses all these objects.

For example:

``` text
emptyDir
```

does not use:

``` text
PVC
PV
StorageClass
```

------------------------------------------------------------------------

# 140. Storage Type Decision Guide

Use:

``` text
Need temporary Pod storage?
        |
        v
     emptyDir

Need node filesystem?
        |
        v
     hostPath
     (carefully)

Need configuration files?
        |
        v
     ConfigMap volume

Need credentials?
        |
        v
     Secret volume

Need persistent application data?
        |
        v
     PVC

Need per-Pod persistent storage?
        |
        v
     StatefulSet + PVC template
```

------------------------------------------------------------------------

# 141. Interview Question --- What Is a Kubernetes Volume?

Answer:

> A Kubernetes Volume provides storage that can be mounted into
> containers in a Pod. Different volume types have different lifecycles
> and storage semantics.

------------------------------------------------------------------------

# 142. Interview Question --- Volume vs VolumeMount?

Answer:

> `volumes` defines the storage source, while `volumeMounts` defines
> where that volume is mounted inside the container.

------------------------------------------------------------------------

# 143. Interview Question --- What Is `emptyDir`?

Answer:

> `emptyDir` is temporary Pod-scoped storage that is created when the
> Pod is assigned to a node and removed when the Pod is removed.

------------------------------------------------------------------------

# 144. Interview Question --- Does `emptyDir` Survive Container Restart?

Answer:

> Generally yes, because its lifecycle is associated with the Pod rather
> than an individual container. It does not survive deletion of the Pod.

------------------------------------------------------------------------

# 145. Interview Question --- What Is `hostPath`?

Answer:

> `hostPath` mounts a path from the Kubernetes node filesystem into a
> Pod. It is useful for certain node-level workloads but introduces
> portability and security concerns.

------------------------------------------------------------------------

# 146. Interview Question --- What Is PV?

Answer:

> A PersistentVolume is a Kubernetes storage resource representing
> provisioned persistent storage.

------------------------------------------------------------------------

# 147. Interview Question --- What Is PVC?

Answer:

> A PersistentVolumeClaim is a request for persistent storage made by an
> application.

------------------------------------------------------------------------

# 148. Interview Question --- PV vs PVC?

Answer:

> PV represents available/provisioned storage, while PVC represents the
> application's request for storage.

------------------------------------------------------------------------

# 149. Interview Question --- What Is StorageClass?

Answer:

> StorageClass defines a class of storage and commonly specifies the CSI
> provisioner and parameters used for dynamic provisioning.

------------------------------------------------------------------------

# 150. Interview Question --- What Is Dynamic Provisioning?

Answer:

> Dynamic provisioning automatically creates/provisions storage in
> response to a PVC request, using a StorageClass and storage
> provisioner.

------------------------------------------------------------------------

# 151. Interview Question --- What Is Static Provisioning?

Answer:

> Static provisioning means administrators create PV resources in
> advance and PVCs subsequently bind to suitable PVs.

------------------------------------------------------------------------

# 152. Interview Question --- What Is RWO?

Answer:

> ReadWriteOnce generally allows a volume to be mounted read-write by a
> single node. Exact behavior depends on Kubernetes and the storage
> implementation.

------------------------------------------------------------------------

# 153. Interview Question --- What Is RWX?

Answer:

> ReadWriteMany allows a volume to be mounted read-write by multiple
> nodes when the storage backend supports it.

------------------------------------------------------------------------

# 154. Interview Question --- What Is RWOP?

Answer:

> ReadWriteOncePod is a stricter access mode that limits read-write
> mounting to a single Pod, subject to storage driver support.

------------------------------------------------------------------------

# 155. Interview Question --- What Is a Reclaim Policy?

Answer:

> A PV reclaim policy controls what happens to the PV and associated
> storage after its claim is released. Common policies include Retain
> and Delete.

------------------------------------------------------------------------

# 156. Interview Question --- Retain vs Delete?

Answer:

``` text
Retain
=
preserve storage for manual recovery/reuse

Delete
=
allow associated provisioned storage to be deleted
```

The exact behavior depends on the provisioner.

------------------------------------------------------------------------

# 157. Interview Question --- What Is CSI?

Answer:

> Container Storage Interface is a standard interface that allows
> storage systems to integrate with Kubernetes.

------------------------------------------------------------------------

# 158. Interview Question --- What Is `WaitForFirstConsumer`?

Answer:

> It delays volume binding/provisioning until a Pod using the PVC is
> scheduled, allowing Kubernetes to consider topology and scheduling
> constraints.

------------------------------------------------------------------------

# 159. Interview Question --- Why Is Storage Topology Important?

Answer:

> Some storage is available only in particular nodes or zones.
> Kubernetes must place Pods where their volumes can be attached and
> mounted.

------------------------------------------------------------------------

# 160. Interview Question --- Can PVCs Be Expanded?

Answer:

> PVC expansion is supported when the StorageClass and CSI driver
> support it. The StorageClass commonly needs
> `allowVolumeExpansion: true`.

------------------------------------------------------------------------

# 161. Interview Question --- Can PVCs Be Shrunk?

Answer:

> Kubernetes generally supports volume expansion, not shrinking an
> existing PVC. Reducing requested storage is not a normal supported
> workflow.

------------------------------------------------------------------------

# 162. Interview Question --- Does Deleting a PVC Delete Data?

Answer:

> It depends on the PV reclaim policy and storage provisioner. `Retain`
> is designed to preserve the PV/storage, while `Delete` may remove
> dynamically provisioned storage.

------------------------------------------------------------------------

# 163. Interview Question --- Does Deleting a Pod Delete PVC Data?

Answer:

> No, a PVC is a separate Kubernetes object. Deleting a Pod does not
> normally delete its PVC.

------------------------------------------------------------------------

# 164. Interview Question --- Does StatefulSet Delete PVCs?

Answer:

> StatefulSet storage lifecycle is separate from Pod lifecycle, and PVC
> retention behavior can be configured. Do not assume StatefulSet
> deletion automatically destroys persistent data.

------------------------------------------------------------------------

# 165. Interview Question --- Why Is My PVC Pending?

Answer:

Check:

``` text
StorageClass
provisioner
capacity
access mode
topology
CSI driver
events
```

Use:

``` bash
kubectl describe pvc <name>
```

------------------------------------------------------------------------

# 166. Interview Question --- Why Is My Pod FailedMount?

Answer:

Investigate:

``` text
PVC/PV status
CSI driver
mount configuration
permissions
filesystem
node
volume attachment
```

Start with:

``` bash
kubectl describe pod <pod>
```

------------------------------------------------------------------------

# 167. Interview Question --- Why Does RWO Cause Problems With Deployment?

Answer:

> RWO commonly restricts writable attachment to one node. If multiple
> Deployment Pods using the same PVC are scheduled across nodes, the
> storage backend may not permit all of them to mount it read-write.

------------------------------------------------------------------------

# 168. Interview Question --- When Should I Use StatefulSet?

Answer:

> Use StatefulSet when individual Pods require stable identity and/or
> dedicated persistent storage, particularly for stateful or distributed
> applications.

------------------------------------------------------------------------

# 169. Interview Question --- Volume vs PVC?

Answer:

``` text
Volume
=
Pod storage mechanism

PVC
=
request for persistent storage
```

A PVC itself is not mounted directly; a Pod references the PVC through a
volume source.

------------------------------------------------------------------------

# 170. Interview Question --- Is a ConfigMap a Persistent Volume?

Answer:

> No. A ConfigMap can be projected or mounted as files, but it is
> intended for configuration rather than general persistent application
> data.

------------------------------------------------------------------------

# 171. Interview Question --- Is a Secret a Persistent Volume?

Answer:

> No. A Secret can be exposed to a container through a volume, but its
> purpose is to provide sensitive configuration data, not
> general-purpose persistent storage.

------------------------------------------------------------------------

# 172. Interview Question --- Is `hostPath` Persistent?

Answer:

> The files can persist on the node filesystem, but the storage is tied
> to that node and therefore is not equivalent to portable cluster-level
> persistent storage.

------------------------------------------------------------------------

# 173. Interview Question --- What Happens When a Pod Moves to Another Node?

It depends on the volume type.

``` text
emptyDir
=
new Pod gets new emptyDir

hostPath
=
sees destination node's path

PVC-backed storage
=
storage may be attached/mounted on new node if supported
```

------------------------------------------------------------------------

# 174. Interview Question --- What Is VolumeSnapshot?

Answer:

> A VolumeSnapshot is a Kubernetes resource used with supported CSI
> drivers to request a point-in-time snapshot of a persistent volume.

------------------------------------------------------------------------

# 175. Interview Question --- Is Snapshot a Backup?

Answer:

> Not necessarily. A snapshot can be part of a backup strategy, but
> application-consistent backups and off-site copies may still be
> required.

------------------------------------------------------------------------

# 176. Interview Question --- What Is the Most Important Storage Mental Model?

Remember:

``` text
Volume
=
storage exposed to Pod

PVC
=
storage request

PV
=
storage resource

StorageClass
=
storage provisioning policy/class

CSI
=
storage integration interface
```

------------------------------------------------------------------------

# 177. Final Architecture

``` text
                         Application Pod
                              |
                              v
                           Volume
                              |
                              v
                             PVC
                              |
                              v
                             PV
                              |
                              v
                        StorageClass
                              |
                              v
                         CSI Driver
                              |
                              v
                       Storage Backend
```

Not every workload uses every layer.

For example:

``` text
emptyDir
```

can be:

``` text
Pod
 |
 v
emptyDir
```

------------------------------------------------------------------------

# 178. Final Memory Trick

Remember:

``` text
emptyDir
=
temporary

hostPath
=
node filesystem

ConfigMap
=
configuration

Secret
=
sensitive configuration

PVC
=
storage request

PV
=
persistent storage resource

StorageClass
=
storage provisioning class

CSI
=
storage integration
```

------------------------------------------------------------------------

# 179. One-Line Summary

> **Kubernetes Volumes provide storage to Pods; for persistent
> application data, the standard abstraction is usually PVC → PV →
> StorageClass/CSI → storage backend.**

------------------------------------------------------------------------

# 180. Final Production Mental Model

``` text
             Application
                  |
                  v
                 Pod
                  |
                  v
                Volume
                  |
                  v
                 PVC
                  |
                  v
                  PV
                  |
                  v
             StorageClass
                  |
                  v
              CSI Driver
                  |
                  v
           Storage Backend
                  |
        +---------+---------+
        |                   |
        v                   v
     Replication         Backup
        |                   |
        v                   v
    High Availability   Disaster Recovery
```

> **Kubernetes manages the storage abstraction and lifecycle
> integration; the storage platform provides the actual persistence, and
> the application remains responsible for data consistency, replication,
> backup correctness, and recovery design.**
