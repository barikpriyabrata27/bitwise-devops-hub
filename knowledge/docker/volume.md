# Docker Volumes and Storage

> **Docker storage determines where container data lives, how long it survives, how it is shared, and how it is backed up or restored.**

This document covers Docker's writable container layer, named volumes, bind mounts, tmpfs mounts, storage drivers, permissions, persistence, database workloads, backup and restore, performance, security, troubleshooting, and production patterns.

---

# 1. Why Docker Storage Matters

Containers are designed to be replaceable.

```text
Container
   │
   └── Can be destroyed and recreated
```

But application data may need to survive:

```text
Container Replacement
        │
        ▼
     Same Data
```

Therefore:

```text
Application
    │
    ▼
Persistent Storage
```

must normally be separated from the container lifecycle.

---

# 2. Container Filesystem Mental Model

A running container can be viewed conceptually as:

```text
Read-Only Image Layers
        │
        ▼
Container Writable Layer
        │
        ├── Temporary Changes
        └── Runtime Files
```

Mounted storage can sit alongside the writable layer:

```text
Container
   │
   ├── Writable Layer
   │
   ├── Named Volume
   │
   ├── Bind Mount
   │
   └── tmpfs
```

---

# 3. Image Layers

Docker images are normally composed of layers.

Conceptually:

```text
Application Layer
      │
Dependency Layer
      │
Base Image Layer
```

These layers are reused by containers.

The image itself should be treated as immutable.

---

# 4. Container Writable Layer

When a container modifies a file that comes from the image, Docker may store the modification in the container's writable layer.

Example:

```text
Image:
 /app/config.json
       │
       ▼
Container modifies file
       │
       ▼
Writable Layer
```

This data belongs to that container.

---

# 5. Why Writable Layer Is Not Persistent Storage

Suppose:

```text
Container A
   │
   └── Writes /data/file.db
```

Then:

```bash
docker rm container-a
```

The container filesystem is removed.

Therefore:

```text
Container Writable Layer
        ≠
Persistent Application Storage
```

Use volumes or other external storage for data that must survive container replacement.

---

# 6. Docker Storage Options

The major options are:

```text
1. Named Volumes
2. Bind Mounts
3. tmpfs Mounts
4. Container Writable Layer
5. Volume Drivers / External Storage
```

---

# 7. Named Volumes

Create:

```bash
docker volume create app-data
```

Use:

```bash
docker run \
  --mount type=volume,src=app-data,dst=/data \
  myapp
```

The data survives container removal.

---

# 8. Named Volume Mental Model

```text
Container
    │
    ▼
/data
    │
    ▼
Docker Named Volume
    │
    ▼
Persistent Host Storage
```

The container can be recreated while the volume remains.

---

# 9. List Volumes

```bash
docker volume ls
```

Inspect:

```bash
docker volume inspect app-data
```

Remove:

```bash
docker volume rm app-data
```

---

# 10. Volume Lifecycle

```text
Create Volume
     │
     ▼
Attach to Container
     │
     ▼
Write Data
     │
     ▼
Remove Container
     │
     ▼
Volume Still Exists
     │
     ▼
Attach to New Container
```

This is the key benefit of named volumes.

---

# 11. Named Volume Example

```bash
docker volume create postgres-data
```

Run:

```bash
docker run -d \
  --name postgres \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:18
```

Remove container:

```bash
docker rm -f postgres
```

The volume can still contain the database data.

---

# 12. Reuse the Volume

Start a replacement:

```bash
docker run -d \
  --name postgres-new \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:18
```

The new container can access the existing volume data.

---

# 13. Bind Mounts

A bind mount maps a host filesystem path into a container.

Example:

```bash
docker run \
  --mount type=bind,src="$(pwd)",dst=/app \
  myapp
```

Conceptually:

```text
Host Directory
      │
      ▼
Container /app
```

---

# 14. Bind Mount Use Cases

Common uses:

```text
Source Code
Development
Configuration Files
Local Certificates
Specific Host Data
Debugging
```

Bind mounts are especially useful when the host needs direct access to the same files.

---

# 15. Bind Mount vs Named Volume

| Feature | Named Volume | Bind Mount |
|---|---|---|
| Managed by Docker | Yes | No |
| Host path controlled directly | No | Yes |
| Good for application data | Yes | Sometimes |
| Good for source code | Sometimes | Yes |
| Portable across hosts | Easier | More host-specific |
| Host filesystem exposure | Lower | Higher |

---

# 16. `-v` vs `--mount`

Short syntax:

```bash
docker run \
  -v app-data:/data \
  myapp
```

Explicit syntax:

```bash
docker run \
  --mount type=volume,src=app-data,dst=/data \
  myapp
```

For complex production configurations, `--mount` is often easier to read.

---

# 17. Read-Only Mount

Example:

```bash
docker run \
  --mount type=bind,src="$(pwd)/config",dst=/app/config,readonly \
  myapp
```

The application can read configuration but cannot modify the mounted host files.

---

# 18. Read-Only Named Volume Mount

A volume can also be mounted read-only:

```bash
docker run \
  --mount type=volume,src=config-data,dst=/config,readonly \
  myapp
```

This is useful when multiple containers consume shared configuration or reference data.

---

# 19. tmpfs

A tmpfs mount provides temporary writable storage.

Example:

```bash
docker run \
  --tmpfs /tmp \
  myapp
```

Data is temporary and is not persisted as normal volume data.

---

# 20. tmpfs Use Cases

Good candidates:

```text
Temporary Files
Caches
Runtime Scratch Space
Sensitive Temporary Data
Writable /tmp for Read-Only Containers
```

Example:

```bash
docker run \
  --read-only \
  --tmpfs /tmp \
  myapp
```

---

# 21. Read-Only Root + tmpfs

A hardened pattern:

```bash
docker run \
  --read-only \
  --tmpfs /tmp \
  myapp
```

Conceptually:

```text
Container Root
     │
     └── Read Only

/tmp
     │
     └── Temporary Writable Storage
```

---

# 22. Storage Comparison

```text
Container Writable Layer
 └── Temporary container-specific changes

Named Volume
 └── Persistent Docker-managed data

Bind Mount
 └── Direct host filesystem mapping

tmpfs
 └── Temporary memory-backed storage
```

---

# 23. When to Use Each

```text
Need persistent application data?
        │
        ▼
     Volume

Need direct host filesystem access?
        │
        ▼
   Bind Mount

Need temporary writable storage?
        │
        ▼
      tmpfs

Need only temporary container changes?
        │
        ▼
Writable Layer
```

---

# 24. Storage Drivers

Docker uses storage drivers to manage image layers and container filesystems.

Examples include:

```text
overlay2
```

on many modern Linux installations.

Storage-driver availability and defaults vary by platform and Docker environment.

---

# 25. Overlay Filesystem Concept

A simplified model:

```text
Upper Layer
   │
   ▼
Container Writable Layer
   │
   ▼
Lower Layers
   │
   ├── Image Layer
   ├── Base Layer
   └── Other Layers
```

The application sees a unified filesystem.

---

# 26. Copy-on-Write

Docker image layers are commonly used with copy-on-write behavior.

Conceptually:

```text
Image File
   │
   ▼
Read
   │
   └── Use lower layer

Modify
   │
   ▼
Copy / Store Change
   │
   ▼
Writable Layer
```

This allows many containers to share image data efficiently.

---

# 27. Why Volumes Can Be Faster for Some Workloads

Heavy write workloads can behave differently when using a volume rather than the container writable layer.

Common candidates:

```text
Databases
Large Persistent Files
High-Write Workloads
```

Actual performance depends on:

```text
Filesystem
Storage Driver
Host
Disk
Docker Platform
Workload
```

Always benchmark real workloads.

---

# 28. Database Storage

Databases require persistent storage.

Bad pattern:

```text
Database
   │
   ▼
Container Writable Layer
```

Better:

```text
Database
   │
   ▼
Named Volume / External Storage
```

---

# 29. PostgreSQL Example

```bash
docker volume create postgres-data
```

Then:

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=example \
  --mount type=volume,src=postgres-data,dst=/var/lib/postgresql/data \
  postgres:18
```

For production, use proper secret management rather than putting real passwords directly in commands.

---

# 30. MySQL Example

Typical pattern:

```bash
docker volume create mysql-data
```

Then:

```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=example \
  --mount type=volume,src=mysql-data,dst=/var/lib/mysql \
  mysql:8.4
```

The exact image tag and environment variables should match the selected image documentation.

---

# 31. Database Container Principle

Remember:

```text
Database Container
      │
      ▼
Application Process
      │
      ▼
Persistent Volume
      │
      ▼
Host / External Storage
```

The container should not be the source of persistence.

---

# 32. Database Backup

A volume is not a backup.

Important distinction:

```text
Volume
  └── Persistence

Backup
  └── Recovery Copy
```

You still need:

```text
Backup
Replication
Restore Testing
Retention
Monitoring
```

---

# 33. Volume Backup Concept

A common approach is to mount the volume into a temporary container and archive its contents.

Example:

```bash
docker run --rm \
  --mount type=volume,src=app-data,dst=/data,readonly \
  --mount type=bind,src="$(pwd)",dst=/backup \
  alpine \
  tar czf /backup/app-data.tar.gz -C /data .
```

This is a generic filesystem backup example.

For databases, application-aware/database-native backups are often preferable.

---

# 34. Volume Restore Concept

Create a new volume:

```bash
docker volume create app-data-restored
```

Then restore:

```bash
docker run --rm \
  --mount type=volume,src=app-data-restored,dst=/data \
  --mount type=bind,src="$(pwd)",dst=/backup \
  alpine \
  tar xzf /backup/app-data.tar.gz -C /data
```

Always validate ownership and application compatibility after restoration.

---

# 35. Database-Native Backup

For databases, prefer database-aware tools where appropriate.

Examples:

```text
PostgreSQL → pg_dump / pg_basebackup
MySQL → mysqldump / physical backup tools
MongoDB → mongodump
```

These understand database consistency better than blindly copying live files.

---

# 36. Backup Consistency

A filesystem copy of a live database may be inconsistent.

Potential pattern:

```text
Application Writes
      │
      ▼
Database Files Changing
      │
      ▼
Filesystem Copy
      │
      ▼
Inconsistent Backup
```

Use database-native backup procedures or coordinated snapshots.

---

# 37. Volume Snapshots

Some storage platforms support snapshots.

Conceptually:

```text
Volume
  │
  ▼
Snapshot
  │
  ├── Backup
  └── Restore Point
```

Snapshots can be useful but are not automatically a complete backup strategy.

---

# 38. Backup Strategy

A production storage strategy should define:

```text
What is backed up?
How often?
Where?
How long retained?
Encrypted?
Off-host?
Off-region?
How restored?
Who can restore?
```

---

# 39. 3-2-1 Backup Principle

A common backup principle:

```text
3 copies of data
2 different storage/media types
1 copy offsite
```

Adapt this to organizational requirements.

---

# 40. Volume Permissions

A common problem:

```text
Permission denied
```

Possible causes:

```text
Container User
Host Directory Owner
Volume Ownership
Filesystem Permissions
SELinux/AppArmor
Read-Only Mount
```

---

# 41. Container User

Example:

```bash
docker run \
  --user 10001:10001 \
  myapp
```

The process runs with the specified UID/GID.

The mounted storage must allow that user to access required files.

---

# 42. Bind Mount Ownership

Suppose host directory:

```text
./data
```

is owned by:

```text
UID 1000
```

but the container runs as:

```text
UID 10001
```

The application may receive:

```text
Permission denied
```

Plan ownership and permissions deliberately.

---

# 43. Named Volume Ownership

Some application images initialize volume contents or permissions automatically.

Do not assume every image behaves the same way.

Check the image's documented:

```text
USER
ENTRYPOINT
Volume Path
Initialization Logic
Permissions
```

---

# 44. SELinux Considerations

On SELinux-enabled systems, bind mounts may require appropriate labeling.

Docker supports mount options such as:

```text
:z
:Z
```

for SELinux relabeling in environments where these options apply.

Use carefully because they affect host filesystem labeling.

---

# 45. Storage Security

Protect persistent data using:

```text
Least Privilege
Filesystem Permissions
Encryption
Access Controls
Backups
Monitoring
```

Do not assume a Docker volume automatically encrypts data at rest.

Encryption depends on the underlying storage and platform.

---

# 46. Sensitive Data in Volumes

Examples:

```text
Database Files
Certificates
Private Keys
Application Secrets
User Data
```

Treat volumes containing sensitive information as sensitive infrastructure assets.

---

# 47. Volume Access by Multiple Containers

A volume can be mounted into multiple containers.

Example:

```text
Container A
     │
     ├──────┐
            ▼
        Shared Volume
            ▲
     ┌──────┘
     │
Container B
```

Whether simultaneous access is safe depends on the application and filesystem semantics.

---

# 48. Shared Volume Anti-Pattern

Do not assume:

```text
Multiple containers
      │
      ▼
Same volume
```

is safe for arbitrary applications.

Potential problems:

```text
Concurrent Writes
File Locking
Corruption
Unexpected State
Permission Conflicts
```

Use shared storage only when the applications are designed for it.

---

# 49. Read-Only Shared Data

A safer pattern for shared reference data:

```text
Producer
   │
   ▼
Volume
   │
   ├── Read-only → Consumer A
   └── Read-only → Consumer B
```

This reduces accidental modification.

---

# 50. Volume Drivers

Docker supports volume drivers for storage integrations.

Conceptually:

```text
Docker Volume
      │
      ▼
Volume Driver
      │
      ▼
External Storage
```

Possible backends depend on the environment and available plugins.

---

# 51. External Storage

Enterprise environments may use:

```text
NFS
Cloud Block Storage
Cloud File Storage
SAN
NAS
CSI-backed storage in Kubernetes
Vendor Storage Platforms
```

The exact integration depends on the deployment platform.

---

# 52. Local Volume Driver

The default local volume is typically stored on the Docker host.

Conceptually:

```text
Container
    │
    ▼
Docker Volume
    │
    ▼
Host Disk
```

If the host is lost, the volume may be lost unless the host storage itself is protected.

---

# 53. Host Failure

Standalone Docker:

```text
Docker Host
   │
   ├── Container
   └── Local Volume
```

If the host fails:

```text
Container unavailable
Volume potentially unavailable
```

Therefore production stateful systems need a host-level or external storage recovery strategy.

---

# 54. Stateful Containers and HA

A local Docker volume does not automatically provide:

```text
Replication
Failover
Multi-host Access
High Availability
```

These require additional infrastructure.

---

# 55. Stateful Architecture

Simple:

```text
Container
   │
   ▼
Local Volume
```

More resilient:

```text
Container
   │
   ▼
External Persistent Storage
   │
   ├── Replication
   ├── Snapshots
   └── Backup
```

---

# 56. Docker Storage and Kubernetes

Docker:

```text
Named Volume
```

Kubernetes:

```text
PersistentVolume
PersistentVolumeClaim
StorageClass
```

The concepts are related:

```text
Container
   │
   ▼
Persistent Storage
```

but Kubernetes provides a more declarative storage abstraction.

---

# 57. Bind Mount Security Risk

Dangerous:

```bash
docker run \
  -v /:/host \
  myapp
```

This exposes the host filesystem.

Avoid broad host mounts.

Prefer:

```text
Specific directory
Specific purpose
Read-only where possible
```

---

# 58. Docker Socket Is Not Normal Storage

Avoid confusing:

```text
/var/run/docker.sock
```

with application storage.

Mounting the Docker socket gives a container access to the Docker daemon and can be highly privileged.

---

# 59. Storage and Container Lifecycle

Remember:

```text
docker stop
    │
    ▼
Container stopped
    │
    └── Volume remains

docker rm
    │
    ▼
Container removed
    │
    └── Named volume normally remains unless explicitly removed

docker volume rm
    │
    ▼
Persistent data removed
```

Be careful with destructive operations.

---

# 60. Anonymous Volumes

A Docker image may declare a volume.

Example:

```dockerfile
VOLUME /data
```

Docker may create an anonymous volume when the container is created.

Anonymous volumes can be harder to manage than deliberately named volumes.

Prefer explicit named volumes when persistence matters.

---

# 61. Named vs Anonymous Volumes

| Named | Anonymous |
|---|---|
| Explicit name | Generated identity |
| Easier to reuse | Easier to forget |
| Easier operations | More cleanup complexity |
| Good for intentional persistence | Often image/runtime-created |

---

# 62. Volume Naming

Good:

```text
payments-prod-data
postgres-prod-data
jenkins-home
```

Poor:

```text
volume1
test
foo
```

Meaningful names simplify operations and backup policies.

---

# 63. Environment-Specific Volumes

Avoid accidentally sharing production and development data.

Example:

```text
payments-dev-data
payments-test-data
payments-prod-data
```

Do not mount production volumes into development containers casually.

---

# 64. Storage Migration

A common migration pattern:

```text
Old Volume
    │
    ▼
Backup / Copy
    │
    ▼
New Volume
    │
    ▼
Restore
    │
    ▼
New Container
```

Validate:

```text
Permissions
Ownership
Application Version
Data Integrity
Performance
```

---

# 65. Volume Migration Between Hosts

Conceptually:

```text
Host A
  │
  ▼
Volume Backup
  │
  ▼
Transfer
  │
  ▼
Host B
  │
  ▼
Restore Volume
```

For large production data sets, external storage replication or snapshot technology is generally preferable to manual archive transfer.

---

# 66. Volume Encryption

Options may include:

```text
Encrypted Host Disk
Encrypted Cloud Volume
Encrypted Network Storage
Application-Level Encryption
Backup Encryption
```

Docker itself should not be assumed to provide universal encryption at rest for every storage backend.

---

# 67. Performance Considerations

Storage performance depends on:

```text
IOPS
Throughput
Latency
Filesystem
Host Disk
Storage Driver
Volume Backend
Network
Container Platform
```

A volume that performs well for one workload may perform poorly for another.

---

# 68. Database Performance

Databases are sensitive to:

```text
Latency
fsync Behavior
IOPS
Random Reads/Writes
Filesystem Semantics
Disk Durability
```

Use appropriate storage rather than assuming any Docker volume is production-grade database storage.

---

# 69. Development Bind Mount Performance

Bind mounts can behave differently on:

```text
Linux
macOS
Windows
Docker Desktop
```

Large source trees can experience slower filesystem operations depending on the host platform.

For development, optimize only after measuring actual workload performance.

---

# 70. Build vs Runtime Storage

Do not confuse:

```text
Build Storage
```

with:

```text
Runtime Persistent Storage
```

Build cache:

```text
Docker Build
   │
   ▼
Build Cache
```

Runtime data:

```text
Container
   │
   ▼
Volume
```

They serve different purposes.

---

# 71. Temporary Runtime Data

Use:

```text
tmpfs
```

or:

```text
container writable layer
```

for data that does not need persistence.

Examples:

```text
Temporary Files
Caches
Generated Scratch Files
```

---

# 72. Cache Data

Caches often do not need durable persistence.

Example:

```text
Application
   │
   ▼
Cache
   │
   ▼
tmpfs / ephemeral storage
```

If the cache is lost, the application should be able to rebuild it.

---

# 73. Persistent vs Ephemeral Data

Classify data:

```text
Ephemeral
 ├── Temporary files
 ├── Cache
 └── Runtime scratch

Persistent
 ├── Database
 ├── User uploads
 ├── Business records
 └── Durable application state
```

This classification should drive storage design.

---

# 74. Storage Architecture

```text
Application Container
        │
        ├── /tmp
        │     └── tmpfs
        │
        ├── /app
        │     └── Image / writable layer
        │
        └── /data
              └── Named Volume
                    │
                    ▼
                 Host / External Storage
```

---

# 75. Web Application Example

```text
Reverse Proxy
     │
     ▼
Application
     │
     ├── /tmp → tmpfs
     │
     ├── /config → read-only mount
     │
     └── /uploads → persistent volume
```

This separates temporary, configuration, and persistent data.

---

# 76. Upload Storage

For user-uploaded files:

```text
Application
    │
    ▼
Object Storage
```

is often preferable at scale to keeping large uploads only on a local Docker host volume.

Examples:

```text
S3-compatible Object Storage
Cloud Object Storage
Enterprise Object Storage
```

---

# 77. Why Object Storage for Large Files?

Object storage can provide:

```text
Scalability
Replication
Durability
Lifecycle Policies
Off-host Storage
Independent Application Scaling
```

This avoids tying application data to one Docker host.

---

# 78. Twelve-Factor Storage Principle

Application containers should generally avoid relying on local ephemeral filesystem state for important business data.

Prefer:

```text
Application
   │
   ├── Database
   ├── Object Storage
   └── External Persistent Services
```

---

# 79. Volume Backup Automation

A mature platform should automate:

```text
Backup
Verification
Retention
Encryption
Monitoring
Restore Testing
```

Do not depend on manually remembered commands for critical data.

---

# 80. Restore Testing

A backup is not proven until restored.

Test:

```text
Backup
  │
  ▼
Restore
  │
  ▼
Start Application
  │
  ▼
Validate Data
  │
  ▼
Measure Recovery Time
```

---

# 81. RPO and RTO

Storage planning should define:

### RPO

**Recovery Point Objective**

How much data loss is acceptable?

Example:

```text
RPO = 15 minutes
```

### RTO

**Recovery Time Objective**

How quickly must the service recover?

Example:

```text
RTO = 1 hour
```

---

# 82. Storage Disaster Recovery

A production storage strategy may look like:

```text
Primary Volume
      │
      ├── Snapshot
      ├── Backup
      └── Replication
              │
              ▼
        Secondary Location
```

---

# 83. Storage Monitoring

Monitor:

```text
Disk Usage
Volume Size
IOPS
Latency
Throughput
Errors
Inodes
Backup Status
Snapshot Status
```

A container can be healthy while its storage is approaching exhaustion.

---

# 84. Disk Exhaustion

Symptoms:

```text
Application Errors
Database Failures
Container Crashes
Unable to Write Files
Log Failures
```

Check host disk usage and Docker storage usage.

Useful:

```bash
docker system df
```

---

# 85. Docker Disk Usage

Run:

```bash
docker system df
```

This can show disk consumption by:

```text
Images
Containers
Local Volumes
Build Cache
```

---

# 86. Volume Inspection

```bash
docker volume inspect app-data
```

Useful for finding:

```text
Driver
Mountpoint
Name
Options
Labels
```

---

# 87. Volume Cleanup

Unused volumes can accumulate.

List:

```bash
docker volume ls
```

Remove specific volume:

```bash
docker volume rm app-data
```

Prune unused volumes carefully:

```bash
docker volume prune
```

This is destructive.

---

# 88. Safe Cleanup Principle

Before deleting a volume:

```text
1. Identify owner
2. Confirm application
3. Confirm environment
4. Check backup
5. Check active mounts
6. Confirm retention requirement
7. Delete
```

---

# 89. Volume Labels

Volumes can be labeled:

```bash
docker volume create \
  --label environment=production \
  --label application=payments \
  payments-data
```

Labels help with:

```text
Inventory
Automation
Operations
Cleanup Policies
```

---

# 90. Storage Access Pattern

Think in terms of:

```text
Who
 │
 ▼
Which Container
 │
 ▼
Which Path
 │
 ▼
Which Storage
 │
 ▼
Read or Write?
```

This makes permissions and security easier to reason about.

---

# 91. Least Privilege for Storage

Prefer:

```text
Read-only
```

when a container only needs to read data.

Example:

```bash
--mount type=volume,src=config,dst=/config,readonly
```

This reduces accidental or malicious modification.

---

# 92. Storage Isolation

Do not unnecessarily share:

```text
Production Volume
```

with:

```text
Development Container
```

or:

```text
Untrusted Workload
```

Storage access can become a data isolation boundary.

---

# 93. Secret Storage

Avoid storing secrets casually in:

```text
Source Code
Images
Writable Layers
Unprotected Volumes
Logs
```

Use appropriate secret-management mechanisms.

---

# 94. Configuration Storage

Configuration can often be mounted read-only:

```text
Host / Config Store
       │
       ▼
Container /config
       │
       └── Read Only
```

Sensitive configuration should use secure secret/configuration management.

---

# 95. Storage and Immutable Containers

A hardened container can use:

```text
Read-only Root
      │
      ├── tmpfs /tmp
      │
      ├── Read-only Config
      │
      └── Persistent Data Volume
```

This provides a clean separation:

```text
Code → Immutable
Temp → Ephemeral
Data → Persistent
```

---

# 96. Production Storage Pattern

```text
             CONTAINER
                 │
        ┌────────┼────────┐
        │        │        │
        ▼        ▼        ▼
      /app      /tmp     /data
        │        │        │
      Image    tmpfs    Volume
                         │
                         ▼
                   Persistent Storage
```

---

# 97. Multi-Container Storage Pattern

```text
                 Shared Data
                     │
              ┌──────┴──────┐
              ▼             ▼
           App A          App B
              │             │
              └──────┬──────┘
                     ▼
                  Volume
```

Only use shared write access when application semantics support it.

---

# 98. Storage and Scaling

If application instances scale:

```text
App 1 ──┐
App 2 ──┼──► Shared External Storage
App 3 ──┘
```

A local Docker volume may not be available to all instances on different hosts.

This is a major reason scalable applications often use:

```text
Database
Object Storage
Distributed File Storage
```

instead of host-local volumes.

---

# 99. Local Volume Scaling Limitation

Example:

```text
Host A
 └── App A
     └── local-volume

Host B
 └── App B
     └── different local-volume
```

The data is not automatically shared.

For multi-host scaling, use an appropriate shared or distributed storage solution.

---

# 100. Stateful Scaling

Do not assume:

```text
3 Database Containers
      │
      ▼
Same Volume
```

automatically creates a highly available database.

High availability requires database-aware replication and coordination.

---

# 101. Storage Failure Domains

Consider:

```text
Container
Host
Disk
Storage System
Availability Zone
Region
```

A robust design understands which failures each layer can survive.

---

# 102. Storage Durability

Durability is different from persistence.

```text
Persistence
 └── Data survives container removal

Durability
 └── Data survives failures according to storage guarantees
```

A local volume may provide persistence but limited durability against host failure.

---

# 103. Storage Availability

A storage system can be:

```text
Persistent
but unavailable
```

or:

```text
Available
but not durable
```

Production designs must consider both.

---

# 104. Storage Decision Matrix

| Requirement | Recommended Starting Point |
|---|---|
| Temporary files | tmpfs |
| Local application persistence | Named volume |
| Development source code | Bind mount |
| Read-only configuration | Read-only bind/volume |
| Large user files | Object storage |
| Database data | Persistent volume / managed DB |
| Multi-host persistent state | External/distributed storage |
| Temporary cache | tmpfs or ephemeral storage |

---

# 105. Common Storage Anti-Patterns

## Storing Database Data Only in Writable Layer

Problem:

```text
Container Removal → Data Loss
```

---

## Mounting `/` from Host

Problem:

```text
Massive Host Exposure
```

---

## Sharing Production Volumes with Developers

Problem:

```text
Data Leakage
Corruption
Accidental Modification
```

---

## Treating Volume as Backup

Problem:

```text
No Independent Recovery Copy
```

---

## Blindly Copying Live Database Files

Problem:

```text
Potentially Inconsistent Backup
```

---

# 106. Storage Troubleshooting Decision Tree

```text
Application Cannot Read/Write
          │
          ▼
Is Path Mounted?
     ┌────┴────┐
    No        Yes
    │           │
  Fix       Is Mount RO?
                │
          ┌─────┴─────┐
         Yes          No
          │            │
        Fix        Permissions
                       │
                       ▼
                  User / UID?
                       │
                       ▼
                 SELinux / ACL?
                       │
                       ▼
                  Disk Space?
                       │
                       ▼
                 Application?
```

---

# 107. Permission Troubleshooting

Check container user:

```bash
docker exec myapp id
```

Check mount:

```bash
docker inspect myapp
```

Check host directory:

```bash
ls -ld ./data
```

Then compare:

```text
UID
GID
Permissions
Mount Mode
```

---

# 108. Read-Only Failure Troubleshooting

If application says:

```text
Read-only file system
```

identify the path:

```text
/app/cache
/tmp
/var/run/app
```

Then decide:

```text
Should it persist?
   │
   ├── Yes → Volume
   │
   └── No  → tmpfs
```

Avoid making the entire root filesystem writable just to solve one missing path.

---

# 109. Volume Not Found

Check:

```bash
docker volume ls
```

Then:

```bash
docker volume inspect app-data
```

A container referencing the wrong volume name may start with a different volume or fail depending on the configuration.

---

# 110. Data Appears Missing

Check:

```text
Correct volume?
Correct mount path?
Correct container?
Correct environment?
Correct Docker host?
Correct volume driver?
```

A common operational mistake is checking a volume on the wrong Docker host.

---

# 111. Data Exists on Host but Not in Container

Possible causes:

```text
Wrong mount source
Wrong destination path
Bind mount mismatch
Permissions
Container using a different volume
Application using a different path
```

Inspect:

```bash
docker inspect myapp
```

---

# 112. Data Exists in Container but Not Host Path

If using a named volume:

```text
Container path
    │
    ▼
Named volume
    │
    ▼
Docker-managed mountpoint
```

Do not assume the path maps directly to your current working directory.

Use:

```bash
docker volume inspect app-data
```

---

# 113. Volume Backup Verification

After backup:

```text
[ ] Archive exists
[ ] Archive is readable
[ ] Expected files present
[ ] Size is plausible
[ ] Integrity checked
[ ] Restore tested
```

---

# 114. Storage Observability

Track:

```text
Volume Capacity
Disk Capacity
IOPS
Latency
Errors
Backup Age
Restore Success
```

Alert before:

```text
100% Disk Usage
```

is reached.

---

# 115. Production Storage Checklist

```text
[ ] Classify data as ephemeral or persistent
[ ] Use named volumes for intentional local persistence
[ ] Use bind mounts only when host access is required
[ ] Use read-only mounts where possible
[ ] Use tmpfs for appropriate temporary data
[ ] Run applications with correct UID/GID
[ ] Plan SELinux/AppArmor requirements
[ ] Protect sensitive storage
[ ] Monitor disk usage
[ ] Monitor I/O
[ ] Back up critical data
[ ] Test restores
[ ] Define RPO
[ ] Define RTO
[ ] Avoid relying on one host for critical state
[ ] Consider external storage for multi-host workloads
[ ] Avoid unnecessary shared-write volumes
```

---

# 116. Storage Architecture Checklist

```text
Application
    │
    ├── Code
    │     └── Image
    │
    ├── Temporary
    │     └── tmpfs
    │
    ├── Configuration
    │     └── Read-only mount
    │
    ├── Persistent local data
    │     └── Named volume
    │
    └── Large scalable data
          └── External/Object Storage
```

---

# 117. Backup Architecture

```text
Primary Storage
      │
      ├── Snapshot
      │
      ├── Backup
      │      │
      │      ▼
      │   Off-host
      │      │
      │      ▼
      │   Off-site
      │
      └── Replication
```

---

# 118. Storage Security Architecture

```text
Container
   │
   ▼
Least-Privilege User
   │
   ▼
Read-Only Where Possible
   │
   ▼
Controlled Volume
   │
   ▼
Encrypted Storage
   │
   ▼
Protected Backup
```

---

# 119. Storage Lifecycle

```text
Create
  │
  ▼
Mount
  │
  ▼
Use
  │
  ▼
Monitor
  │
  ▼
Backup
  │
  ▼
Snapshot / Replicate
  │
  ▼
Migrate / Restore
  │
  ▼
Retire
  │
  ▼
Secure Delete
```

---

# 120. Interview Questions

## Beginner

### What happens to data written to a container's writable layer when the container is removed?

It is normally lost with the container.

### What is a Docker volume?

A Docker-managed storage abstraction that can persist data independently of a container.

### What is a bind mount?

A direct mapping of a host filesystem path into a container.

### What is tmpfs?

Temporary storage that is not persisted as a normal Docker volume.

### What does `-v app-data:/data` do?

It mounts the named volume `app-data` at `/data`.

---

## Intermediate

### Why use volumes for databases?

They allow database data to survive container replacement and provide a clearer persistence boundary.

### Volume vs bind mount?

A volume is Docker-managed; a bind mount maps a host path directly.

### Why is a volume not a backup?

A volume is the live data location. If it is corrupted or deleted, the data can be lost.

### Why are container IPs ephemeral?

Containers can be recreated and receive different network identities; similarly, containers should not be treated as permanent hosts.

---

## Advanced

### What is copy-on-write?

A mechanism where image data is shared and modifications are stored in an upper writable layer rather than changing the underlying image layers.

### Why might databases perform differently on volumes versus the container writable layer?

Storage driver behavior and copy-on-write overhead can affect write-heavy workloads; actual performance depends on the host and storage backend.

### Why can local volumes be problematic for multi-host scaling?

A local volume belongs to a specific Docker host unless an external/shared storage mechanism is used.

### Why should database backups be application-aware?

A raw filesystem copy of a live database can capture inconsistent state.

### What is RPO?

The maximum acceptable amount of data loss measured in time.

### What is RTO?

The target time required to restore service after a failure.

---

# 121. Complete Docker Storage Mental Model

```text
                         APPLICATION
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
             CODE          TEMP DATA      PERSISTENT DATA
               │              │              │
             IMAGE          tmpfs         VOLUME / EXTERNAL
               │              │              │
               │              │              ▼
               │              │        STORAGE PLATFORM
               │              │              │
               │              │       ┌──────┼──────┐
               │              │       │      │      │
               │              │    Disk   Snapshot Backup
               │              │
               └──────────────┴──────────────┐
                                              ▼
                                         CONTAINER
```

---

# 122. Complete Storage Layer Model

```text
Application
    │
    ▼
Container Filesystem
    │
    ├── Image Layers
    │
    ├── Writable Layer
    │
    ├── Named Volumes
    │
    ├── Bind Mounts
    │
    └── tmpfs
            │
            ▼
       Host / External Storage
            │
            ├── Filesystem
            ├── Block Storage
            ├── Network Storage
            └── Object Storage
```

---

# 123. Final Key Takeaways

Remember:

```text
1. Containers are disposable; important data should not depend on the container writable layer.

2. Named volumes are Docker-managed persistent storage.

3. Bind mounts map host filesystem paths directly into containers.

4. tmpfs provides temporary writable storage.

5. Use read-only mounts whenever write access is unnecessary.

6. Use a read-only root filesystem where application compatibility permits.

7. Databases require deliberate persistent storage.

8. A volume is persistence, not a backup.

9. Backups should be independent and restorable.

10. Database-native backups are often preferable for live databases.

11. Container and volume permissions must match the application UID/GID.

12. SELinux/AppArmor policies can affect mounted storage.

13. Do not expose broad host directories to containers.

14. Do not casually share production volumes across unrelated workloads.

15. Local volumes are tied to a Docker host.

16. Multi-host applications often need external or distributed storage.

17. Large scalable user files often belong in object storage.

18. Monitor capacity, I/O, errors, and backup health.

19. Define RPO and RTO for critical workloads.

20. Test restores instead of assuming backups work.

21. Separate code, temporary data, configuration, and persistent data.

22. Treat storage as part of the application's architecture, not merely a Docker option.

23. Storage durability and storage persistence are different concepts.

24. A production storage design must account for container failure, host failure, storage failure, and disaster recovery.
```

The core principle is:

```text
CODE
 │
 ▼
IMAGE
 │
 ▼
CONTAINER
 │
 ├── Temporary → tmpfs
 │
 ├── Configuration → Read-Only Mount
 │
 └── Persistent Data → Volume / External Storage
                              │
                              ├── Backup
                              ├── Snapshot
                              └── Replication
```

> **The container should be disposable; the data should have an explicit lifecycle. Good Docker storage design separates immutable application code, ephemeral runtime data, configuration, and durable business data.**

---

# 124. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`container.md`](container.md)
- [`image.md`](image.md)
- [`dockerfile.md`](dockerfile.md)
- [`build.md`](build.md)
- [`run.md`](run.md)
- [`network.md`](network.md)
- [`registry.md`](registry.md)
