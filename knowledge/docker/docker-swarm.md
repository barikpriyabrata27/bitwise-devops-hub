# Docker Swarm

> **Docker Swarm is Docker's native container orchestration technology for running services across a cluster of Docker Engine nodes. It provides scheduling, service replication, rolling updates, overlay networking, service discovery, secrets, configs, and built-in cluster management.**

This document covers Docker Swarm from fundamentals through production concepts, including cluster architecture, manager and worker nodes, Raft, services, tasks, replicas, scheduling, overlay networks, ingress routing mesh, secrets, configs, rolling updates, rollback, health/restart behavior, placement constraints, node labels, scaling, high availability, security, troubleshooting, and production architecture.

---

# 1. What Is Docker Swarm?

Docker Swarm is a cluster and orchestration mode built into Docker Engine.

It allows multiple Docker hosts to operate as one logical cluster.

```text
Docker Host 1
Docker Host 2
Docker Host 3
       │
       ▼
  Swarm Cluster
```

Instead of manually running containers on individual hosts, you define desired services.

---

# 2. Why Use Docker Swarm?

Swarm provides:

```text
Cluster Management
Service Scheduling
Replication
Service Discovery
Overlay Networking
Load Balancing
Rolling Updates
Rollback
Secrets
Configs
Node Management
```

It is simpler than many larger orchestration platforms while still providing core cluster orchestration features.

---

# 3. Swarm Mental Model

```text
                    SWARM CLUSTER
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       Manager        Manager        Worker
          │              │              │
          └──────────────┼──────────────┘
                         │
                      Services
                         │
                         ▼
                       Tasks
                         │
                         ▼
                     Containers
```

---

# 4. Swarm vs Docker Engine

Normal Docker Engine:

```text
Host
 │
 ├── Container
 ├── Container
 └── Container
```

Swarm mode:

```text
Cluster
 │
 ├── Node
 │    ├── Task
 │    └── Task
 │
 ├── Node
 │    └── Task
 │
 └── Node
      └── Task
```

Swarm adds cluster-level orchestration.

---

# 5. Swarm Node

A node is a Docker Engine host participating in the Swarm.

A node can be:

```text
Manager
Worker
```

A manager can also execute workloads by default.

---

# 6. Manager Node

Managers maintain cluster state and perform orchestration.

Responsibilities include:

```text
Cluster State
Scheduling
Service Management
Node Management
Raft Consensus
```

A manager can also run tasks unless configured otherwise.

---

# 7. Worker Node

Workers execute tasks assigned by managers.

Conceptually:

```text
Manager
   │
   ▼
Schedule Task
   │
   ▼
Worker
   │
   ▼
Container
```

Workers do not participate in manager consensus.

---

# 8. Manager and Worker Architecture

```text
                 Manager
              /     |      \
             /      |       \
            ▼       ▼        ▼
        Worker   Worker    Worker
          │        │         │
        Task     Task      Task
          │        │         │
      Container Container Container
```

---

# 9. Manager Quorum

Managers use Raft consensus to maintain cluster state.

For production:

```text
3 Managers
5 Managers
7 Managers
```

are common odd-number configurations.

Avoid unnecessary manager counts.

---

# 10. Why Odd Number of Managers?

Suppose:

```text
3 managers
```

Majority:

```text
2
```

If one fails:

```text
2 available
```

the cluster can still maintain quorum.

For:

```text
4 managers
```

majority is:

```text
3
```

If one fails:

```text
3 available
```

same fault tolerance as 3 managers, but with an additional node to manage.

---

# 11. Manager Quorum Table

| Managers | Quorum | Manager Failures Tolerated |
|---:|---:|---:|
| 1 | 1 | 0 |
| 3 | 2 | 1 |
| 5 | 3 | 2 |
| 7 | 4 | 3 |

The important concept is majority consensus.

---

# 12. Raft

Swarm managers use Raft consensus to replicate cluster state.

Conceptually:

```text
Manager A
    │
    ├── Cluster State
    │
Manager B
    │
    ├── Cluster State
    │
Manager C
    │
    └── Cluster State
```

The managers maintain a consistent view of the desired cluster state.

---

# 13. Raft Leader

Among managers, one manager acts as the Raft leader for coordinating state changes.

Conceptually:

```text
Manager A
   │
   ▼
Leader
 │     │
 ▼     ▼
M2    M3
```

If the leader fails, the remaining managers can elect another leader when quorum is available.

---

# 14. What Happens If Manager Quorum Is Lost?

Suppose:

```text
3 Managers
```

and:

```text
2 Managers fail
```

Only:

```text
1 Manager
```

remains.

Quorum is lost.

Existing worker tasks may continue running, but cluster management operations requiring manager consensus can be unavailable until quorum is restored.

---

# 15. Manager Failure vs Worker Failure

Manager failure:

```text
Control Plane Problem
```

Worker failure:

```text
Workload Execution Problem
```

With sufficient manager quorum, Swarm can continue managing the cluster after a manager failure.

If a worker fails, Swarm can reschedule its desired tasks elsewhere when possible.

---

# 16. Initialize a Swarm

On the first manager:

```bash
docker swarm init
```

Docker turns the host into a Swarm manager.

---

# 17. Get Worker Join Command

On the manager:

```bash
docker swarm join-token worker
```

This returns a command that workers can use to join.

---

# 18. Get Manager Join Command

```bash
docker swarm join-token manager
```

This provides a manager join command.

Protect manager join credentials.

---

# 19. Join a Worker

On the worker:

```bash
docker swarm join \
  --token <TOKEN> \
  <MANAGER-IP>:2377
```

The worker becomes part of the cluster.

---

# 20. Join a Manager

```bash
docker swarm join \
  --token <MANAGER_TOKEN> \
  <MANAGER-IP>:2377
```

The node joins as a manager.

---

# 21. List Nodes

On a manager:

```bash
docker node ls
```

Example:

```text
ID       HOSTNAME   STATUS   AVAILABILITY   MANAGER STATUS
abc      manager1   Ready    Active         Leader
def      manager2   Ready    Active         Reachable
ghi      worker1    Ready    Active
```

---

# 22. Node Availability

A Swarm node can have availability such as:

```text
Active
Pause
Drain
```

---

# 23. Active Node

```bash
docker node update \
  --availability active \
  worker1
```

An active node can receive tasks according to scheduling rules.

---

# 24. Pause Node

A paused node does not receive new tasks, but existing tasks can continue.

Conceptually:

```text
Existing Tasks → Continue
New Tasks      → Not Scheduled
```

---

# 25. Drain Node

Drain prevents scheduling and moves running tasks away from the node where possible.

```bash
docker node update \
  --availability drain \
  worker1
```

This is useful before:

```text
Maintenance
OS Upgrade
Docker Upgrade
Hardware Work
```

---

# 26. Manager Availability

Managers can also be drained:

```bash
docker node update \
  --availability drain \
  manager1
```

This affects workload placement while the node continues participating in manager functions.

---

# 27. Promote Worker to Manager

```bash
docker node promote worker1
```

The node becomes a manager.

---

# 28. Demote Manager

```bash
docker node demote manager1
```

This changes the node's role.

Be careful when reducing manager count because quorum requirements must remain satisfied.

---

# 29. Leave the Swarm

Worker:

```bash
docker swarm leave
```

Manager:

```bash
docker swarm leave
```

A manager may require additional handling if it is part of an active manager quorum.

---

# 30. Force Leave

A manager can use:

```bash
docker swarm leave --force
```

This is potentially disruptive and should be used carefully.

---

# 31. Swarm Service

A service describes the desired state of a workload.

Example:

```bash
docker service create \
  --name web \
  nginx:1.29
```

Swarm creates a service and schedules a task.

---

# 32. Service vs Container

In standalone Docker:

```text
Container
```

is the primary execution object.

In Swarm:

```text
Service
   │
   ▼
Tasks
   │
   ▼
Containers
```

The service represents the desired state.

---

# 33. Task

A task is a scheduled instance of a service.

Example:

```text
Service:
web replicas=3

Tasks:
web.1
web.2
web.3
```

Each task normally corresponds to a container execution.

---

# 34. Service Replicas

Create three replicas:

```bash
docker service create \
  --name web \
  --replicas 3 \
  nginx:1.29
```

Architecture:

```text
Web Service
   │
   ├── Task 1
   ├── Task 2
   └── Task 3
```

---

# 35. Desired State

Swarm follows a reconciliation model.

Desired:

```text
replicas = 3
```

Current:

```text
replicas = 2
```

Swarm attempts to create another task.

---

# 36. Reconciliation

```text
Desired State
      │
      ▼
Compare
      │
      ▼
Current State
      │
      ▼
Difference
      │
      ▼
Scheduler
      │
      ▼
Action
```

This is a fundamental orchestration concept.

---

# 37. Scale a Service

```bash
docker service scale \
  web=5
```

Now desired replicas:

```text
5
```

Swarm schedules additional tasks.

---

# 38. Inspect Service

```bash
docker service inspect web
```

For readable output:

```bash
docker service inspect \
  --pretty web
```

---

# 39. List Services

```bash
docker service ls
```

Example:

```text
ID     NAME   MODE        REPLICAS   IMAGE
abc    web    replicated  3/3        nginx:1.29
```

---

# 40. List Service Tasks

```bash
docker service ps web
```

Example:

```text
NAME       NODE       CURRENT STATE
web.1      worker1    Running
web.2      worker2    Running
web.3      worker3    Running
```

---

# 41. Service Modes

Two important service modes are:

```text
replicated
global
```

---

# 42. Replicated Service

Example:

```bash
docker service create \
  --name api \
  --replicas 5 \
  myapi:1.0
```

Swarm attempts to maintain:

```text
5 tasks
```

across eligible nodes.

---

# 43. Global Service

A global service runs one task on every eligible node.

Example:

```bash
docker service create \
  --mode global \
  --name agent \
  myagent:1.0
```

If there are:

```text
5 eligible nodes
```

there will normally be:

```text
5 tasks
```

---

# 44. Replicated vs Global

| Mode | Behavior |
|---|---|
| Replicated | Desired number of tasks |
| Global | One task per eligible node |

Global services are useful for:

```text
Monitoring Agents
Log Collectors
Node-Level Services
Security Agents
```

---

# 45. Service Update

Update image:

```bash
docker service update \
  --image myapi:2.0 \
  api
```

Swarm can perform a rolling update depending on configured update parameters.

---

# 46. Rolling Update

Conceptually:

```text
Version 1
 ├── Task 1
 ├── Task 2
 └── Task 3
        │
        ▼
Update
        │
        ▼
Version 2
 ├── Task 1
 ├── Task 2
 └── Task 3
```

Tasks are replaced according to the service's update policy.

---

# 47. Update Parallelism

Example:

```bash
docker service update \
  --update-parallelism 1 \
  --image myapi:2.0 \
  api
```

This limits how many tasks are updated at once.

---

# 48. Update Delay

Example:

```bash
docker service update \
  --update-delay 10s \
  --image myapi:2.0 \
  api
```

This introduces a delay between task updates.

---

# 49. Update Failure Action

Swarm can be configured to:

```text
continue
pause
rollback
```

depending on update configuration.

A production deployment should define an intentional failure policy.

---

# 50. Update Monitor

An update monitor period can be configured so Swarm evaluates whether updated tasks remain healthy during the update.

The exact behavior depends on the service's update configuration.

---

# 51. Update Order

Swarm supports update strategies such as:

```text
stop-first
start-first
```

depending on service configuration and workload needs.

---

# 52. Stop-First

Conceptually:

```text
Old Task
   │
   ▼
Stop
   │
   ▼
New Task
```

This is simple but can temporarily reduce capacity.

---

# 53. Start-First

Conceptually:

```text
Old Task
   │
   ├───────────────┐
   │               │
   ▼               ▼
Keep          Start New
                 │
                 ▼
              Healthy
                 │
                 ▼
              Stop Old
```

This can reduce downtime but requires enough resources and supports workloads appropriately.

---

# 54. Rollback

If an update fails:

```bash
docker service rollback api
```

Swarm can revert the service to its previous configuration.

---

# 55. Automatic Rollback

A service can be configured to automatically roll back when an update fails.

Conceptually:

```text
Version 1
   │
   ▼
Deploy Version 2
   │
   ▼
Failure
   │
   ▼
Rollback
   │
   ▼
Version 1
```

---

# 56. Rollback Strategy

Production should define:

```text
Update Policy
Failure Threshold
Monitor Period
Rollback Policy
```

This turns deployment into a controlled process.

---

# 57. Service Restart Policy

Swarm services can define restart behavior.

Conceptually:

```text
Task fails
   │
   ▼
Restart Policy
   │
   ├── Restart
   └── Do Not Restart
```

Restart policy can consider:

```text
Condition
Delay
Maximum Attempts
Window
```

---

# 58. Restart vs Rescheduling

These are related but different.

```text
Task failure on same node
       │
       ▼
Restart behavior
```

If the node itself is unavailable:

```text
Node failure
       │
       ▼
Scheduler
       │
       ▼
New task elsewhere
```

---

# 59. Service Endpoint

Swarm provides service discovery.

A service can be addressed by its service name.

Example:

```text
api
```

Applications can communicate using the service name rather than individual task IP addresses.

---

# 60. VIP Endpoint Mode

Swarm can provide a virtual IP for a service.

Conceptually:

```text
Client
  │
  ▼
Service VIP
  │
  ├── Task 1
  ├── Task 2
  └── Task 3
```

Swarm routes traffic to service tasks.

---

# 61. DNSRR Endpoint Mode

Swarm also supports DNS round-robin endpoint mode.

Conceptually:

```text
DNS
 │
 ├── Task IP 1
 ├── Task IP 2
 └── Task IP 3
```

The client receives task addresses rather than a single service VIP.

---

# 62. VIP vs DNSRR

| VIP | DNSRR |
|---|---|
| Service virtual IP | Task IPs |
| Swarm load balancing | Client-side selection |
| Simple service access | Useful for systems needing task addresses |

Choose according to application requirements.

---

# 63. Overlay Network

Overlay networks allow containers on different Swarm nodes to communicate.

```text
Node 1                Node 2
┌─────────┐            ┌─────────┐
│ Task A  │────────────│ Task B  │
└─────────┘  Overlay   └─────────┘
```

---

# 64. Create Overlay Network

```bash
docker network create \
  --driver overlay \
  app-net
```

Services can attach to it.

---

# 65. Attach Service to Network

```bash
docker service create \
  --name api \
  --network app-net \
  myapi:1.0
```

Another service:

```bash
docker service create \
  --name db \
  --network app-net \
  postgres:18
```

---

# 66. Cross-Node Communication

```text
Manager / Worker 1
       │
      Task A
       │
       │ Overlay
       ▼
Manager / Worker 2
       │
      Task B
```

Overlay networking abstracts the physical node boundary.

---

# 67. Ingress Network

Swarm creates an ingress network for routing published service ports.

Conceptually:

```text
Client
  │
  ▼
Any Swarm Node
  │
  ▼
Ingress Routing Mesh
  │
  ▼
Service Task
```

---

# 68. Routing Mesh

Suppose:

```bash
docker service create \
  --name web \
  --publish 8080:80 \
  --replicas 3 \
  nginx:1.29
```

A client can potentially connect to:

```text
Node1:8080
Node2:8080
Node3:8080
```

and Swarm's routing mesh can forward traffic to an available service task.

---

# 69. Routing Mesh Mental Model

```text
               Client
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      Node1     Node2     Node3
        │         │         │
        └─────────┼─────────┘
                  ▼
             Routing Mesh
                  │
          ┌───────┼───────┐
          ▼       ▼       ▼
        Task1   Task2   Task3
```

---

# 70. Host Mode Publishing

Swarm also supports publishing in host mode.

Conceptually:

```text
Client
  │
  ▼
Specific Node
  │
  ▼
Local Task
```

This can be useful when applications need direct node-level exposure.

It changes the traffic behavior compared with routing mesh.

---

# 71. Published Ports

Example:

```bash
docker service create \
  --name web \
  --publish published=8080,target=80 \
  nginx:1.29
```

Meaning:

```text
Published port: 8080
Container target port: 80
```

---

# 72. Swarm Load Balancing

Swarm can distribute service traffic across tasks.

Conceptually:

```text
Request
   │
   ▼
Service
   │
   ├── Task 1
   ├── Task 2
   └── Task 3
```

This provides built-in service-level load distribution.

---

# 73. Secrets

Swarm has a native secret mechanism.

Create:

```bash
printf 'super-secret' | \
docker secret create db_password -
```

List:

```bash
docker secret ls
```

---

# 74. Attach Secret to Service

```bash
docker service create \
  --name api \
  --secret db_password \
  myapi:1.0
```

The secret is made available to the task through the Swarm secret mechanism.

---

# 75. Secret File

Inside the container, a Swarm secret is typically exposed as a file under:

```text
/run/secrets/
```

Example:

```text
/run/secrets/db_password
```

---

# 76. Secret Security Principle

Prefer:

```text
Secret
  │
  ▼
Protected Secret Store
  │
  ▼
Service
```

instead of:

```text
Password
  │
  ▼
Environment Variable
  │
  ▼
Compose / Shell / Logs
```

Swarm secrets help reduce accidental exposure.

---

# 77. Secret Lifecycle

```text
Create
  │
  ▼
Store
  │
  ▼
Attach to Service
  │
  ▼
Task
  │
  ▼
Application
```

Deleting or rotating secrets should be planned carefully.

---

# 78. Secret Rotation

A common pattern:

```text
Old Secret
   │
   ▼
Create New Secret
   │
   ▼
Update Service
   │
   ▼
New Tasks
   │
   ▼
Remove Old Secret
```

Because Swarm secrets are immutable objects, replacement is generally used for rotation.

---

# 79. Configs

Swarm configs are designed for non-secret configuration data.

Create:

```bash
docker config create nginx.conf ./nginx.conf
```

List:

```bash
docker config ls
```

---

# 80. Attach Config

```bash
docker service create \
  --name proxy \
  --config source=nginx.conf,target=/etc/nginx/nginx.conf \
  nginx:1.29
```

---

# 81. Secret vs Config

| Secret | Config |
|---|---|
| Sensitive data | Non-sensitive configuration |
| Passwords | Config files |
| Tokens | Nginx config |
| Certificates/private material where appropriate | Application settings |

Never use configs as a substitute for secret protection.

---

# 82. Node Labels

Node labels help control scheduling.

Example:

```bash
docker node update \
  --label-add zone=west \
  worker1
```

Then schedule based on:

```text
zone=west
```

---

# 83. Placement Constraints

Example:

```bash
docker service create \
  --name api \
  --constraint 'node.labels.zone == west' \
  myapi:1.0
```

Only nodes matching the constraint are eligible.

---

# 84. Placement Preferences

Swarm also supports placement preferences to influence distribution.

Conceptually:

```text
Prefer spread across:
zone
rack
datacenter
```

This can improve workload distribution.

---

# 85. Constraint vs Preference

Constraint:

```text
MUST match
```

Preference:

```text
TRY to distribute according to preference
```

Do not use a preference when a hard requirement is necessary.

---

# 86. Manager Placement

By default, managers can run tasks.

For dedicated control-plane managers:

```bash
docker node update \
  --availability drain \
  manager1
```

Repeat for appropriate managers.

This leaves managers focused on cluster management.

---

# 87. Worker Node Labels

Example:

```text
node.labels.type=compute
node.labels.type=storage
node.labels.zone=west
node.labels.environment=production
```

Labels can represent infrastructure characteristics.

---

# 88. Stateful Workloads in Swarm

Stateful services need special care.

Example:

```text
Database
    │
    ▼
Persistent Volume
```

If a task moves:

```text
Worker A
   │
   ▼
Worker B
```

the storage must still be available.

---

# 89. Local Volume Limitation

A local Docker volume belongs to a node.

If:

```text
DB Task → Worker A
```

and the task moves to:

```text
Worker B
```

the local volume data may not be available there.

Use:

```text
Shared Storage
Replicated Storage
Application-Level Replication
```

when required.

---

# 90. Swarm and Shared Storage

Possible storage patterns include:

```text
NFS
Distributed Storage
Cloud Block Storage with appropriate attachment semantics
Storage Plugins
Application-Level Replication
```

Choose based on workload and cloud/platform architecture.

---

# 91. Database HA

Do not assume Swarm replicas provide database HA.

This:

```text
--replicas 3 postgres
```

does not automatically create:

```text
PostgreSQL cluster
```

Database replication must be implemented using database-native or specialized technology.

---

# 92. Stateless Services

Swarm works naturally with stateless services:

```text
API
Frontend
Web Server
Worker
```

Example:

```text
API x 5
```

can be distributed across nodes.

---

# 93. Service Update with Environment Variables

Example:

```bash
docker service update \
  --env-add LOG_LEVEL=debug \
  api
```

Swarm updates the service configuration and may recreate tasks.

---

# 94. Remove Environment Variable

Depending on command semantics:

```bash
docker service update \
  --env-rm LOG_LEVEL \
  api
```

Always inspect the resulting service configuration.

---

# 95. Add Port

Example:

```bash
docker service update \
  --publish-add published=8080,target=80 \
  web
```

---

# 96. Remove Port

Example:

```bash
docker service update \
  --publish-rm 8080 \
  web
```

Exact identifier syntax should be verified for the configured published port.

---

# 97. Service Update by Image Digest

A stronger deployment pattern is to reference an immutable image digest.

Conceptually:

```text
registry.example.com/api@sha256:...
```

This reduces ambiguity around mutable tags.

---

# 98. Image Registry Authentication

Swarm nodes need access to private images.

A service can be created or updated with registry authentication propagation where supported:

```bash
docker service create \
  --with-registry-auth \
  --name api \
  registry.example.com/api:1.0
```

This allows Swarm to pass registry credentials needed by nodes to pull the image.

Use carefully and follow your organization's credential-management policies.

---

# 99. Rolling Update with Registry

```text
CI
 │
 ▼
Build
 │
 ▼
Scan
 │
 ▼
Push
 │
 ▼
Registry
 │
 ▼
Swarm Service Update
 │
 ▼
Rolling Deployment
```

---

# 100. Swarm Deployment Workflow

```text
Source
  │
  ▼
CI
  │
  ├── Test
  ├── Build
  ├── Scan
  └── Push
  │
  ▼
Registry
  │
  ▼
Swarm
  │
  ▼
Service Update
  │
  ▼
Rolling Tasks
```

---

# 101. Swarm and Docker Compose

Compose can define application services.

Swarm can orchestrate services across a cluster.

A Compose-style stack file can be deployed to Swarm using:

```bash
docker stack deploy
```

---

# 102. Stack

A stack is a collection of Swarm services managed as an application.

Example:

```bash
docker stack deploy \
  -c compose.yaml \
  payments
```

---

# 103. Stack Mental Model

```text
Stack: payments
       │
       ├── frontend
       ├── api
       ├── worker
       ├── redis
       └── db
```

---

# 104. List Stacks

```bash
docker stack ls
```

---

# 105. List Stack Services

```bash
docker stack services payments
```

---

# 106. List Stack Tasks

```bash
docker stack ps payments
```

---

# 107. Remove Stack

```bash
docker stack rm payments
```

This removes the stack's Swarm services.

Understand the storage implications separately before removing stateful workloads.

---

# 108. Stack Deploy

Example:

```yaml
services:
  web:
    image: nginx:1.29
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

Deploy:

```bash
docker stack deploy \
  -c compose.yaml \
  webapp
```

---

# 109. `deploy` Section

The `deploy` section contains Swarm-oriented deployment settings.

Examples:

```yaml
deploy:
  replicas: 3
  update_config:
    parallelism: 1
  restart_policy:
    condition: on-failure
```

Some Compose fields are meaningful for local Compose but are not necessarily used by Swarm in the same way.

---

# 110. Compose vs Stack Semantics

Important:

```text
docker compose up
```

and:

```text
docker stack deploy
```

are not identical execution models.

A Compose file may contain settings that are ignored or interpreted differently by Swarm.

Always validate the target platform.

---

# 111. Swarm Service Constraints in Stack

Example:

```yaml
services:
  api:
    image: myapi:1.0
    deploy:
      placement:
        constraints:
          - node.labels.zone == west
```

This is a Swarm-oriented configuration.

---

# 112. Swarm Replicas in Stack

```yaml
services:
  api:
    image: myapi:1.0
    deploy:
      replicas: 5
```

Swarm attempts to maintain five tasks.

---

# 113. Swarm Update Configuration

Example:

```yaml
deploy:
  update_config:
    parallelism: 1
    delay: 10s
    order: start-first
    failure_action: rollback
```

This defines controlled rolling updates.

---

# 114. Swarm Rollback Configuration

Example:

```yaml
deploy:
  rollback_config:
    parallelism: 1
    delay: 5s
    order: stop-first
```

This controls how rollback tasks are replaced.

---

# 115. Swarm Restart Policy

Example:

```yaml
deploy:
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
    window: 60s
```

This defines service task restart behavior.

---

# 116. Swarm Resource Reservations

A service can define resource reservations.

Conceptually:

```text
Reservation
   │
   ▼
Scheduler
   │
   ▼
Find node with capacity
```

Example:

```yaml
deploy:
  resources:
    reservations:
      cpus: "0.5"
      memory: 256M
```

---

# 117. Swarm Resource Limits

Example:

```yaml
deploy:
  resources:
    limits:
      cpus: "1.0"
      memory: 512M
```

This can protect the node from uncontrolled resource consumption.

---

# 118. Reservations vs Limits

Reservation:

```text
Minimum scheduling requirement
```

Limit:

```text
Maximum resource consumption
```

Both serve different purposes.

---

# 119. Generic Resource Scheduling

Swarm supports resource-aware scheduling concepts.

Examples can include:

```text
CPU
Memory
Generic resources
```

Use these when workloads require specific node capabilities.

---

# 120. Node Maintenance

Before maintenance:

```bash
docker node update \
  --availability drain \
  worker1
```

Verify:

```bash
docker node ps worker1
```

Then perform maintenance.

After maintenance:

```bash
docker node update \
  --availability active \
  worker1
```

---

# 121. Node Failure

Suppose:

```text
worker1
  ├── api.1
  └── api.2
```

fails.

Swarm detects the node failure and attempts to create replacement tasks on other eligible nodes.

---

# 122. Desired Replica Recovery

Desired:

```text
api = 5
```

After node failure:

```text
Running = 3
```

Swarm attempts:

```text
Create 2 replacement tasks
```

subject to available capacity and placement constraints.

---

# 123. High Availability Architecture

A common production topology:

```text
             Load Balancer
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Worker1  Worker2  Worker3
          │        │        │
          └────────┼────────┘
                   │
                Services
                   │
            ┌──────┴──────┐
            ▼             ▼
           API           Worker
```

Managers:

```text
Manager1
Manager2
Manager3
```

should be distributed across failure domains where possible.

---

# 124. Manager HA

Recommended conceptual pattern:

```text
AZ / Zone A → Manager 1
AZ / Zone B → Manager 2
AZ / Zone C → Manager 3
```

This reduces the chance that a single failure domain destroys quorum.

---

# 125. Worker HA

Workers should also be distributed across:

```text
Availability Zones
Racks
Failure Domains
```

when infrastructure supports it.

---

# 126. Placement for Fault Tolerance

Use labels:

```text
zone=a
zone=b
zone=c
```

Then use placement preferences/constraints to distribute replicas.

Avoid placing all replicas on one failure domain.

---

# 127. Anti-Affinity Concept

The goal:

```text
API Replica 1 → Node A
API Replica 2 → Node B
API Replica 3 → Node C
```

rather than:

```text
Node A
 ├── API 1
 ├── API 2
 └── API 3
```

The second arrangement creates a single-node failure risk.

---

# 128. Swarm Security

Important security areas:

```text
Manager Authentication
Node Certificates
TLS
Encrypted Control Plane
Encrypted Overlay Traffic
Secrets
RBAC-like operational controls
Firewall
Least Privilege
Registry Security
```

---

# 129. Swarm Node Certificates

Swarm uses TLS-based node identity and certificates for cluster communication.

The manager acts as a certificate authority for the Swarm cluster.

Certificates are rotated according to Swarm configuration.

---

# 130. Swarm Control Traffic

Important Swarm ports commonly include:

```text
2377/tcp
7946/tcp
7946/udp
4789/udp
```

Typical roles:

```text
2377 → Swarm management
7946 → Node communication
4789 → Overlay network traffic
```

Exact firewall rules should match your topology and Docker documentation.

---

# 131. Firewall Principle

Do not expose all Swarm ports to the Internet.

Prefer:

```text
Private Network
   │
   ├── Manager
   ├── Worker
   └── Worker
```

with tightly controlled firewall rules.

---

# 132. Encrypted Overlay Network

Overlay networks can use encryption.

Example:

```bash
docker network create \
  --driver overlay \
  --opt encrypted \
  secure-net
```

Encryption introduces overhead, so evaluate performance requirements.

---

# 133. Swarm Secrets Security

Swarm secrets are designed so that secret data is distributed only to services that need it.

Do not log secret contents.

Avoid:

```text
echo $PASSWORD
```

in production scripts and logs.

---

# 134. Registry Security in Swarm

Swarm nodes must pull trusted images.

Use:

```text
Private Registry
TLS
Authentication
Image Scanning
Image Signing
Immutable Tags/Digests
```

where appropriate.

---

# 135. Swarm Supply Chain

```text
Source
  │
  ▼
CI
  │
  ├── Test
  ├── Scan
  ├── SBOM
  └── Sign
  │
  ▼
Registry
  │
  ▼
Swarm
  │
  ▼
Tasks
```

---

# 136. Swarm Logging

Swarm does not replace your logging platform.

Use:

```text
Centralized Log Collection
ELK / OpenSearch
Loki
Cloud Logging
Splunk
Other Enterprise Platforms
```

depending on your environment.

---

# 137. Swarm Monitoring

Monitor:

```text
Node Health
Manager Quorum
Service Replicas
Task Restarts
CPU
Memory
Disk
Network
Container Health
Deployment Status
```

---

# 138. Swarm Metrics

Useful operational metrics include:

```text
Desired Replicas
Running Replicas
Failed Tasks
Restart Count
Node Availability
Resource Utilization
Network Errors
Disk Capacity
```

---

# 139. Swarm Event Troubleshooting

Use:

```bash
docker events
```

to observe Docker events.

Service-specific inspection:

```bash
docker service ps api
docker service inspect api --pretty
```

---

# 140. Service Task Failure

Example:

```text
api.3
  │
  ▼
Failed
```

Run:

```bash
docker service ps api --no-trunc
```

This can expose useful error information.

---

# 141. Task Stuck in Pending

Possible reasons:

```text
No Eligible Node
Insufficient CPU
Insufficient Memory
Constraint Conflict
Node Drained
Image Pull Problem
Port Conflict
Resource Reservation
```

---

# 142. Constraint Conflict

Suppose:

```text
constraint:
node.labels.zone == east
```

but no node has:

```text
zone=east
```

Then tasks cannot be scheduled.

Check:

```bash
docker node inspect <node>
```

and node labels.

---

# 143. Insufficient Resources

If:

```text
Required memory = 4 GB
```

but eligible nodes have:

```text
2 GB available
```

the task may remain pending.

Check:

```text
Node resources
Service reservations
Placement constraints
```

---

# 144. Port Conflict

Host-mode published ports can create placement constraints.

If a service requires:

```text
host port 8080
```

and the port is already occupied on a node, the task may not schedule there.

---

# 145. Image Pull Failure

Check:

```text
Registry access
Credentials
Network
Image tag
Digest
Node architecture
```

Use:

```bash
docker service ps api --no-trunc
```

---

# 146. Node Not Ready

Check:

```bash
docker node ls
```

Then inspect:

```bash
docker node inspect worker1
```

On the node also check:

```bash
docker info
```

and Docker daemon logs.

---

# 147. Manager Quorum Troubleshooting

Check:

```bash
docker node ls
```

Look for:

```text
Leader
Reachable
Unavailable
```

If quorum is lost, avoid destructive reinitialization until the cluster state and recovery options are understood.

---

# 148. Do Not Blindly `swarm init`

If an existing cluster loses quorum, running:

```bash
docker swarm init
```

on an arbitrary node can create a new cluster rather than recover the original cluster state.

Treat manager recovery as a controlled disaster-recovery operation.

---

# 149. Swarm Backup

Back up manager state as part of a production DR strategy.

Swarm's manager state includes critical cluster information.

Backup procedures should follow Docker's documented Swarm disaster-recovery process and be tested regularly.

---

# 150. Disaster Recovery

Plan for:

```text
Manager Failure
Worker Failure
Node Loss
Registry Failure
Storage Failure
Network Partition
Datacenter Failure
Credential Loss
```

Document:

```text
RTO
RPO
Recovery Procedure
Backup Location
Owner
Validation Steps
```

---

# 151. Swarm Manager Data

Manager state contains information needed to reconstruct the cluster's control state.

Protect it with:

```text
Backups
Restricted Access
Secure Storage
Recovery Testing
```

---

# 152. Swarm Upgrade Strategy

Before upgrading Docker Engine:

```text
Check Compatibility
Drain Node
Upgrade Node
Validate
Activate Node
Move to Next Node
```

For managers, preserve quorum during the maintenance process.

---

# 153. Rolling Node Maintenance

Example:

```text
Worker 1
   │
   ▼
Drain
   │
   ▼
Upgrade
   │
   ▼
Validate
   │
   ▼
Active
   │
   ▼
Worker 2
```

This reduces disruption.

---

# 154. Manager Maintenance

For three managers:

```text
M1
M2
M3
```

do not take down multiple managers simultaneously if that would destroy quorum.

Maintain:

```text
Majority
```

throughout planned maintenance.

---

# 155. Swarm and Stateful Storage

A production database should consider:

```text
Data durability
Replication
Backup
Restore
Failover
Node affinity
Storage availability
```

Do not rely only on container restart behavior.

---

# 156. External Load Balancer

A common production architecture:

```text
Internet
   │
   ▼
External Load Balancer
   │
   ├── Swarm Node 1
   ├── Swarm Node 2
   └── Swarm Node 3
            │
            ▼
          Service
```

This can provide:

```text
TLS Termination
Health Checks
Global Routing
WAF
DDoS Protection
```

depending on the load balancer.

---

# 157. Ingress Routing Mesh vs External Load Balancer

Routing mesh:

```text
Docker Swarm Feature
```

External load balancer:

```text
Infrastructure / Cloud Feature
```

They can be combined.

---

# 158. Production Network Architecture

```text
                    Internet
                       │
                       ▼
                External LB / WAF
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Swarm Node   Swarm Node   Swarm Node
          │            │            │
          └────────────┼────────────┘
                       ▼
                    Overlay
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
         API         Worker        Proxy
                       │
                       ▼
                  Data Services
```

---

# 159. Swarm Service Discovery

Example:

```text
api
db
redis
```

Applications can use service names.

```text
api → db:5432
api → redis:6379
```

This avoids coupling the application to task IP addresses.

---

# 160. Service Name Stability

Tasks can change:

```text
Task 1 IP
Task 2 IP
Task 3 IP
```

but:

```text
Service Name
```

remains stable.

This is a major orchestration benefit.

---

# 161. Node vs Service vs Task

Remember:

```text
Node
 └── Physical / VM Docker host

Service
 └── Desired workload definition

Task
 └── Scheduled service instance

Container
 └── Runtime execution of task
```

---

# 162. Swarm Reconciliation Example

Desired:

```text
web replicas = 3
```

Current:

```text
Task 1 Running
Task 2 Running
Task 3 Failed
```

Swarm:

```text
Detect Difference
       │
       ▼
Schedule Replacement
       │
       ▼
Task 4 Running
```

Desired state becomes satisfied again.

---

# 163. Service Update Example

Initial:

```text
api:1.0
replicas=4
```

Update:

```text
api:2.0
```

Swarm:

```text
Task 1 → 2.0
Task 2 → 2.0
Task 3 → 2.0
Task 4 → 2.0
```

according to update policy.

---

# 164. Failed Deployment Example

```text
api:1.0
   │
   ▼
Deploy api:2.0
   │
   ▼
Health / Task Failures
   │
   ▼
Rollback Policy
   │
   ▼
api:1.0
```

This is why update and rollback policies matter.

---

# 165. Canary Deployment Concept

Swarm does not provide a complete first-class canary deployment workflow like some dedicated progressive-delivery platforms.

A canary strategy may be implemented through:

```text
Separate Services
Traffic Routing
External Load Balancer
Labels
Controlled Replica Changes
```

Use a dedicated progressive-delivery solution if advanced traffic management is required.

---

# 166. Blue-Green Deployment Concept

A blue-green pattern can be built with:

```text
blue-api
green-api
```

and an external traffic switch:

```text
Load Balancer
     │
     ├── Blue
     └── Green
```

Swarm provides the service primitives, while traffic control is usually handled separately.

---

# 167. Swarm and CI/CD

Typical pipeline:

```text
Git Push
   │
   ▼
CI
   │
   ├── Unit Test
   ├── Build
   ├── SAST
   ├── Image Scan
   ├── SBOM
   └── Push
   │
   ▼
Registry
   │
   ▼
Swarm Deploy
   │
   ▼
Rolling Update
   │
   ▼
Smoke Test
```

---

# 168. Deployment Verification

After deployment:

```bash
docker service ls
```

Then:

```bash
docker service ps api
```

Verify:

```text
Desired = Running
```

and inspect application health.

---

# 169. Swarm Deployment Checklist

```text
[ ] Image exists in registry
[ ] Image version/digest verified
[ ] Registry credentials available
[ ] Manager quorum healthy
[ ] Worker nodes healthy
[ ] Resources available
[ ] Placement constraints valid
[ ] Network available
[ ] Secrets available
[ ] Configs available
[ ] Update policy defined
[ ] Rollback policy defined
[ ] Health checks configured
[ ] Monitoring ready
[ ] Backup available
```

---

# 170. Swarm Security Checklist

```text
[ ] Managers on private network
[ ] Firewall configured
[ ] TLS/node identity protected
[ ] Join tokens protected
[ ] Registry access secured
[ ] Images scanned
[ ] Images signed where required
[ ] Secrets used for sensitive values
[ ] No privileged containers unless required
[ ] Least privilege
[ ] Overlay encryption considered
[ ] Audit/logging enabled
[ ] Manager backups protected
[ ] Recovery procedure tested
```

---

# 171. Swarm Production Checklist

```text
[ ] 3+ managers for HA
[ ] Managers distributed across failure domains
[ ] Workers distributed across failure domains
[ ] Resource reservations
[ ] Resource limits
[ ] Health checks
[ ] Restart policies
[ ] Rolling updates
[ ] Automatic rollback where appropriate
[ ] Placement strategy
[ ] External load balancing where needed
[ ] Persistent storage strategy
[ ] Database HA strategy
[ ] Centralized logging
[ ] Monitoring
[ ] Registry HA
[ ] Disaster recovery
[ ] Upgrade runbook
```

---

# 172. Common Swarm Anti-Patterns

## One Manager for Production

```text
1 Manager
```

creates a single control-plane failure point.

Prefer multiple managers for HA.

---

## Even Number of Managers Without a Reason

```text
4 Managers
```

does not automatically provide better failure tolerance than:

```text
3 Managers
```

because quorum still requires a majority.

---

# 173. Anti-Pattern: Running All Replicas on One Node

Bad:

```text
Worker1
 ├── API 1
 ├── API 2
 └── API 3
```

Node failure:

```text
All replicas lost
```

Prefer distribution across failure domains.

---

# 174. Anti-Pattern: Using Local Volumes for Movable Stateful Tasks

Bad:

```text
DB Task
  │
  ▼
Local Volume
```

then freely rescheduling the task to another node.

The data may not follow the task.

---

# 175. Anti-Pattern: Treating Replicas as Database Replication

Bad assumption:

```text
postgres replicas=3
```

means:

```text
three-node database cluster
```

It does not.

---

# 176. Anti-Pattern: Ignoring Manager Quorum

Do not perform maintenance that causes:

```text
Quorum Loss
```

unless following a deliberate recovery procedure.

---

# 177. Anti-Pattern: Exposing Management Ports Publicly

Do not expose:

```text
2377
7946
4789
```

to the public Internet without a very specific, secured architecture.

---

# 178. Anti-Pattern: Storing Secrets in Environment Variables

For sensitive production data, prefer Swarm secrets or an external secret-management platform.

---

# 179. Anti-Pattern: Using Mutable Tags Without Control

Bad:

```text
api:latest
```

Better:

```text
api:1.5.0
```

Best for strict reproducibility:

```text
api@sha256:...
```

---

# 180. Anti-Pattern: No Rollback Plan

Every production update should answer:

```text
How do we detect failure?
How do we stop rollout?
How do we rollback?
How do we verify recovery?
```

---

# 181. Swarm Troubleshooting Flow

```text
Service Problem
      │
      ▼
docker service ls
      │
      ▼
docker service ps SERVICE
      │
      ▼
--no-trunc
      │
      ▼
Inspect Node
      │
      ▼
Check Logs
      │
      ▼
Check Registry
      │
      ▼
Check Network
      │
      ▼
Check Resources
      │
      ▼
Check Constraints
```

---

# 182. Service Not Reaching Desired Replicas

Check:

```bash
docker service ps api --no-trunc
```

Look for:

```text
Rejected
Failed
Pending
Shutdown
```

Then identify the scheduling or runtime error.

---

# 183. Task Rejected

Common reasons:

```text
Port Conflict
Constraint Conflict
Insufficient Resources
Unsupported Platform
Missing Capability
Node Availability
```

---

# 184. Task Keeps Restarting

Check:

```text
Application Exit Code
Health Check
Environment Variables
Secrets
Configuration
Dependency Availability
```

Then:

```bash
docker service ps api --no-trunc
```

---

# 185. Service Is Running but Inaccessible

Check:

```text
Published Port
Routing Mesh
Firewall
External Load Balancer
Application Listening Port
Network
```

---

# 186. Service-to-Service Connection Failure

Check:

```text
Same Overlay Network?
Correct Service Name?
Correct Port?
DNS?
Firewall?
Application Binding?
```

---

# 187. Overlay Network Failure

Check:

```text
Node Connectivity
Firewall
4789/udp
7946/tcp
7946/udp
MTU
Encryption Overhead
Docker Daemon Health
```

Network configuration must match the infrastructure.

---

# 188. Registry Pull Failure on Worker

A common situation:

```text
Manager can pull
Worker cannot pull
```

Check:

```text
Worker → Registry connectivity
Registry credentials
DNS
TLS trust
Architecture
```

---

# 189. Secret Not Available

Check:

```text
Secret exists
Secret attached to service
Service updated after secret change
Expected mount path
Application permissions
```

---

# 190. Config Not Updated

Configs are immutable objects.

A common update pattern is:

```text
Create New Config
       │
       ▼
Update Service
       │
       ▼
New Tasks
       │
       ▼
Remove Old Config
```

---

# 191. Node Drain Troubleshooting

If a node has no tasks:

```text
Availability = drain
```

This may be intentional.

Check:

```bash
docker node inspect worker1
```

and:

```bash
docker node ls
```

---

# 192. Manager Leader Troubleshooting

Check:

```bash
docker node ls
```

A healthy manager set should show:

```text
Leader
Reachable
Reachable
```

for a three-manager cluster.

---

# 193. Network Partition

Suppose:

```text
Manager A
   X
Manager B
   │
Manager C
```

Raft behavior depends on which side maintains quorum.

The side without quorum cannot safely make manager-state changes.

This is why network reliability between managers is critical.

---

# 194. Swarm and Split Brain

Raft consensus helps prevent multiple managers from independently committing conflicting cluster state.

Maintaining quorum is central to this protection.

---

# 195. Swarm Cluster Architecture

```text
                  SWARM CLUSTER
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
     Manager 1      Manager 2      Manager 3
        │              │              │
        └──────────────┼──────────────┘
                       │
                     Raft
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Worker 1       Worker 2       Worker 3
        │              │              │
      Tasks          Tasks          Tasks
        │              │              │
     Containers     Containers     Containers
```

---

# 196. Swarm Application Architecture

```text
                    External LB
                         │
                         ▼
                  Published Service
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
           API.1       API.2       API.3
             │           │           │
             └───────────┼───────────┘
                         │
                    Overlay Net
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
            Redis                  DB
```

---

# 197. Complete Swarm Lifecycle

```text
CREATE CLUSTER
      │
      ▼
JOIN NODES
      │
      ▼
CREATE NETWORK
      │
      ▼
CREATE SECRETS / CONFIGS
      │
      ▼
CREATE SERVICE
      │
      ▼
SCHEDULE TASKS
      │
      ▼
RUN CONTAINERS
      │
      ▼
HEALTH / RESTART
      │
      ▼
SCALE
      │
      ▼
ROLLING UPDATE
      │
      ▼
ROLLBACK IF REQUIRED
      │
      ▼
MONITOR
      │
      ▼
MAINTAIN / UPGRADE
      │
      ▼
DISASTER RECOVERY
```

---

# 198. Swarm vs Compose vs Kubernetes

| Capability | Docker Compose | Docker Swarm | Kubernetes |
|---|---|---|---|
| Multi-container app | Yes | Yes | Yes |
| Multi-host orchestration | Limited | Yes | Yes |
| Built into Docker Engine | Compose plugin/tool | Yes | No |
| Service scheduling | Basic | Yes | Yes |
| Replicas | Limited/local | Yes | Yes |
| Rolling updates | Limited | Yes | Yes |
| Overlay networking | Docker networking | Yes | Kubernetes networking |
| Secrets | Compose support | Native Swarm secrets | Native secrets |
| Configs | Yes | Native Swarm configs | ConfigMaps |
| Autoscaling | Limited | Limited | Extensive |
| Ecosystem | Simple | Smaller | Very large |
| Operational complexity | Low | Medium | High |

---

# 199. When to Use Swarm

Swarm can be attractive when you need:

```text
Simple Docker-native orchestration
Small/medium clusters
Straightforward service deployment
Built-in Docker networking
Rolling updates
Secrets/configs
Low operational complexity
```

---

# 200. When to Consider Kubernetes

Consider Kubernetes when requirements include:

```text
Large Multi-Cluster Operations
Advanced Autoscaling
Rich Scheduling
Extensive Ecosystem
Advanced Networking
Operator-Based Platforms
Complex Policy
Multi-Tenant Platform Engineering
```

The right choice depends on operational and organizational requirements.

---

# 201. Interview Questions

## Beginner

### What is Docker Swarm?

Docker's native clustering and orchestration technology for managing services across multiple Docker Engine nodes.

### What is a Swarm manager?

A node that participates in cluster control and Raft consensus and performs orchestration.

### What is a worker?

A node that executes service tasks.

### What is a service?

A desired-state definition for a workload.

### What is a task?

A scheduled instance of a service.

---

## Intermediate

### What is a replica?

A desired number of task instances for a replicated service.

### What is a global service?

A service that runs one task on every eligible node.

### What is an overlay network?

A virtual network that enables container communication across Swarm nodes.

### What is routing mesh?

Swarm's ingress mechanism that can route published service traffic from nodes to service tasks.

### What is `docker stack deploy`?

A command used to deploy a stack of services to a Swarm cluster using a Compose-style file.

---

## Advanced

### Why does Swarm use Raft?

To maintain consistent manager state and provide consensus.

### Why should managers usually be deployed in odd numbers?

To maximize quorum fault tolerance relative to manager count.

### What happens when manager quorum is lost?

Existing workloads may continue, but cluster management operations requiring consensus can be unavailable until quorum is restored.

### Does a Swarm replica provide database replication?

No. Replicas are service task instances; database replication must be configured separately.

### What is the difference between VIP and DNSRR?

VIP provides a service virtual IP with Swarm-level routing, while DNSRR returns task addresses for client-side selection.

### Why use node labels?

To influence or constrain task placement according to node characteristics.

### What is the difference between constraints and preferences?

Constraints are hard scheduling requirements; preferences influence distribution without being absolute requirements.

### Why are Swarm secrets better than plain environment variables for sensitive data?

They provide a dedicated secret distribution mechanism rather than treating sensitive values as ordinary service configuration.

---

# 202. Final Key Takeaways

Remember:

```text
1. Swarm is Docker's native container orchestration technology.

2. A Swarm consists of manager and worker nodes.

3. Managers maintain cluster state.

4. Managers use Raft consensus.

5. Workers execute tasks.

6. A service defines desired workload state.

7. A task is a scheduled service instance.

8. Replicas define the desired number of task instances.

9. Global services run one task per eligible node.

10. Swarm reconciles desired state with actual state.

11. Managers need quorum for reliable control-plane operation.

12. Three managers can tolerate one manager failure.

13. Five managers can tolerate two manager failures.

14. Worker failure can cause tasks to be rescheduled.

15. Overlay networks connect services across nodes.

16. Swarm provides service discovery.

17. VIP and DNSRR are different endpoint modes.

18. Routing mesh handles published service traffic.

19. Secrets provide a dedicated mechanism for sensitive values.

20. Configs provide non-secret configuration distribution.

21. Node labels influence scheduling.

22. Constraints are hard placement requirements.

23. Preferences influence placement distribution.

24. Resource reservations influence scheduling.

25. Resource limits constrain runtime resource consumption.

26. Rolling updates reduce deployment disruption.

27. Rollback protects against failed updates.

28. Health checks improve service-state visibility.

29. Restart policies control task restart behavior.

30. Compose and Swarm are related but have different execution models.

31. docker stack deploy deploys services to a Swarm cluster.

32. Swarm replicas do not automatically create database replication.

33. Stateful workloads require a deliberate storage strategy.

34. Local volumes can create node-affinity concerns.

35. Managers should be distributed across failure domains.

36. Workers should also be distributed across failure domains.

37. Protect manager quorum during maintenance.

38. Do not expose Swarm management ports unnecessarily.

39. Secure registry access.

40. Prefer versioned or digest-pinned images.

41. Use image scanning, SBOMs, and signing as appropriate.

42. Centralized logging and monitoring remain necessary.

43. Back up manager state and test recovery.

44. Do not blindly reinitialize a cluster after quorum loss.

45. Swarm is simpler than Kubernetes but has a smaller ecosystem.

46. Use Swarm when its operational simplicity matches your requirements.

47. Move to a richer orchestrator when scheduling, autoscaling, networking, or platform requirements exceed Swarm's strengths.
```

The core mental model is:

```text
                    SWARM
                      │
             ┌────────┴────────┐
             ▼                 ▼
          MANAGERS          WORKERS
             │                 │
            RAFT              TASKS
             │                 │
             ▼                 ▼
        DESIRED STATE       CONTAINERS
             │
             ▼
         SCHEDULER
             │
             ▼
        RECONCILIATION
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
    NETWORK STORAGE SECURITY
```

> **Docker Swarm turns multiple Docker Engine hosts into a coordinated cluster. The key concepts are desired state, managers, Raft quorum, services, tasks, replicas, scheduling, overlay networking, and controlled service updates.**

---

# 203. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`container.md`](container.md)
- [`image.md`](image.md)
- [`dockerfile.md`](dockerfile.md)
- [`build.md`](build.md)
- [`run.md`](run.md)
- [`network.md`](network.md)
- [`volume.md`](volume.md)
- [`registry.md`](registry.md)
- [`docker-compose.md`](docker-compose.md)
