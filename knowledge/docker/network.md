# Docker Networking

> **Docker networking provides communication between containers, the host, and external networks while controlling connectivity, addressing, service discovery, and isolation.**

This document explains Docker networking from fundamentals through production patterns, including bridge networks, user-defined networks, DNS, port publishing, network namespaces, IPAM, host and none networking, overlay networking, security, troubleshooting, and real-world architectures.

---

# 1. What Is Docker Networking?

A container needs networking to communicate with:

```text
Container
   │
   ├── Another Container
   ├── Docker Host
   └── External Network / Internet
```

Docker networking provides the mechanisms required for these communication paths.

---

# 2. Docker Networking Mental Model

A useful model is:

```text
Application
    │
    ▼
Container Network Namespace
    │
    ▼
Virtual Network Interface
    │
    ▼
Docker Network
    │
    ├── Container
    ├── Container
    └── Gateway
    │
    ▼
Host / External Network
```

---

# 3. Network Namespace

On Linux, containers normally receive their own network namespace.

Conceptually:

```text
Host Network Namespace
        │
        ├── eth0
        ├── docker interfaces
        └── host routes
             │
             ▼
Container Network Namespace
        │
        ├── eth0
        ├── loopback
        └── routes
```

This provides network isolation.

---

# 4. Container `eth0`

Inside a typical container:

```bash
ip addr
```

you may see:

```text
lo
eth0
```

The container's `eth0` is connected to the Docker networking infrastructure.

The exact interface names and implementation details can vary by platform and runtime.

---

# 5. Docker Network Drivers

Docker supports different network drivers.

Common drivers include:

```text
bridge
host
none
overlay
macvlan
ipvlan
```

The most common standalone Docker application pattern is:

```text
bridge
```

---

# 6. Default Bridge Network

Docker normally provides a default bridge network.

Conceptually:

```text
Host
 │
 ▼
Docker Bridge
 │
 ├── Container A
 ├── Container B
 └── Container C
```

Containers attached to this network can communicate according to Docker's networking behavior and configured rules.

---

# 7. User-Defined Bridge Network

Create:

```bash
docker network create app-net
```

Run:

```bash
docker run -d \
  --name web \
  --network app-net \
  nginx
```

Another container:

```bash
docker run -d \
  --name api \
  --network app-net \
  myapi:1.0
```

Now both containers are connected to the same user-defined network.

---

# 8. Why User-Defined Networks Are Preferred

User-defined bridge networks provide useful features such as:

```text
Container Name Resolution
Better Isolation
Explicit Network Membership
Flexible Configuration
```

For application stacks, prefer explicitly created networks instead of relying on the legacy default bridge behavior.

---

# 9. Container-to-Container Communication

Example:

```text
web
 │
 ▼
api
 │
 ▼
db
```

If all are attached to:

```text
app-net
```

the application can generally connect to:

```text
api:8080
db:5432
```

rather than hard-coding container IP addresses.

---

# 10. Docker Embedded DNS

Docker provides embedded DNS for containers on user-defined networks.

Example:

```text
Container: payments
        │
        │ DNS lookup: db
        ▼
Docker DNS
        │
        ▼
Container: db
```

This allows service names to remain stable even if container IP addresses change.

---

# 11. Why Not Hard-Code Container IPs?

Bad:

```text
DB_HOST=172.18.0.5
```

The IP may change when the container is recreated.

Better:

```text
DB_HOST=db
```

The name remains tied to the container/network identity.

---

# 12. Network Creation

Basic:

```bash
docker network create app-net
```

Inspect:

```bash
docker network inspect app-net
```

List:

```bash
docker network ls
```

Remove:

```bash
docker network rm app-net
```

---

# 13. Network Inspect

Example:

```bash
docker network inspect app-net
```

Useful information includes:

```text
Network ID
Driver
Subnet
Gateway
Connected Containers
IP Addresses
Options
```

---

# 14. Network Membership

A container can be connected to a network when it starts:

```bash
docker run -d \
  --name api \
  --network app-net \
  myapi:1.0
```

A running container can also be connected:

```bash
docker network connect app-net api
```

Disconnect:

```bash
docker network disconnect app-net api
```

---

# 15. One Container, Multiple Networks

A container can connect to multiple Docker networks.

Example:

```text
             ┌── frontend-net
             │
Application ─┤
             │
             └── backend-net
```

This is useful for controlled communication paths.

Example:

```text
Frontend
   │
   ▼
API
   │
   ▼
Database
```

The API can be attached to both networks while the database remains isolated from the frontend network.

---

# 16. Network Segmentation

A useful architecture:

```text
Internet
   │
   ▼
Reverse Proxy
   │
   ▼
Frontend / API Network
   │
   ▼
Backend Network
   │
   ▼
Database
```

The database does not need direct exposure to the internet.

---

# 17. Port Publishing

A container port is internal to the container network unless published.

Example:

```bash
docker run -d \
  --name web \
  -p 8080:80 \
  nginx
```

Flow:

```text
Host:8080
    │
    ▼
Container:80
    │
    ▼
Nginx
```

---

# 18. Port Mapping Syntax

General:

```text
-p HOST_PORT:CONTAINER_PORT
```

Example:

```bash
-p 8080:8080
```

means:

```text
Host TCP 8080
       │
       ▼
Container TCP 8080
```

---

# 19. UDP Port Publishing

Example:

```bash
docker run \
  -p 5353:5353/udp \
  mydns
```

Explicit protocol:

```text
tcp
udp
```

---

# 20. Publish to Loopback Only

Example:

```bash
docker run \
  -p 127.0.0.1:8080:8080 \
  myapp
```

This limits host access to the local machine's loopback interface.

Useful for:

```text
Development
Local Admin Interfaces
Internal Host-Only Services
```

---

# 21. Publish on All Relevant Host Interfaces

Example:

```bash
docker run \
  -p 8080:8080 \
  myapp
```

This commonly publishes the port on the host's available interfaces according to Docker's configuration.

Use explicit host binding when exposure must be tightly controlled.

---

# 22. `EXPOSE` Is Not Port Publishing

Dockerfile:

```dockerfile
EXPOSE 8080
```

does not itself make the application reachable from outside the container.

Runtime:

```bash
docker run -p 8080:8080 myapp
```

publishes the port.

Remember:

```text
EXPOSE = Metadata / Documentation

-p = Runtime Port Publishing
```

---

# 23. Container Port vs Host Port

These can be different.

```bash
docker run \
  -p 9000:8080 \
  myapp
```

means:

```text
Host:9000
   │
   ▼
Container:8080
```

The application still listens on port `8080` inside the container.

---

# 24. Application Listening Address

An application may listen on:

```text
127.0.0.1
```

or:

```text
0.0.0.0
```

Inside a container, if an application only listens on its own loopback interface, other containers or published host connections may not be able to reach it as expected.

For many server applications, configure the service to listen on:

```text
0.0.0.0
```

when it needs to accept connections through the container network.

---

# 25. `localhost` in a Container

Important:

```text
localhost
```

inside a container means:

```text
That Same Container
```

It does not mean:

```text
Docker Host
```

and it does not mean:

```text
Another Container
```

Example:

```text
API Container
    │
    └── localhost:5432
           │
           └── API container itself
```

To reach the database container, use the database service/container name on a shared network.

---

# 26. Container-to-Host Communication

The exact method depends on platform and Docker configuration.

On Docker Desktop, special host gateway names may be available.

A common explicit approach is:

```bash
docker run \
  --add-host=host.docker.internal:host-gateway \
  myapp
```

Then:

```text
host.docker.internal
```

can be used where supported.

Do not assume this behaves identically on every Docker environment.

---

# 27. Bridge Network Architecture

Conceptually:

```text
                  Docker Host
                       │
                Virtual Bridge
                       │
          ┌────────────┼────────────┐
          │            │            │
       Container A  Container B  Container C
          │            │            │
        eth0         eth0         eth0
```

On Linux, Docker commonly implements bridge networking using Linux networking primitives such as virtual Ethernet pairs, bridges, routing, and firewall/NAT mechanisms.

---

# 28. Virtual Ethernet Pair

A container's network namespace can be connected to the host using a virtual Ethernet pair.

Conceptually:

```text
Container Namespace
       │
      eth0
       │
       │ veth pair
       │
       ▼
Host Namespace
       │
       ▼
Docker Bridge
```

One end lives in the container namespace and the other on the host side.

---

# 29. NAT and Port Publishing

Docker may use host networking/NAT mechanisms to implement published ports.

Conceptually:

```text
Client
  │
  ▼
Host Port
  │
  ▼
NAT / Forwarding
  │
  ▼
Container IP:Port
```

The exact implementation can depend on Docker version, platform, firewall backend, and networking configuration.

---

# 30. IP Addressing

Docker networks normally use private address ranges.

Example:

```text
Network:
172.20.0.0/16

Gateway:
172.20.0.1

Container:
172.20.0.2
```

Do not assume these exact addresses.

Inspect the actual network:

```bash
docker network inspect app-net
```

---

# 31. Subnet

A subnet defines the address range available to a network.

Example:

```bash
docker network create \
  --subnet 172.30.0.0/16 \
  app-net
```

Conceptually:

```text
172.30.0.0/16
      │
      ├── Gateway
      ├── Container A
      ├── Container B
      └── Container C
```

---

# 32. Gateway

A Docker network generally has a gateway through which containers can reach other networks.

Example:

```text
Container
172.30.0.2
     │
     ▼
Gateway
172.30.0.1
     │
     ▼
External Network
```

---

# 33. IPAM

Docker networking uses IP address management mechanisms to allocate addresses.

IPAM handles concepts such as:

```text
Subnet
Gateway
IP Allocation
Address Pools
```

Custom IPAM configuration may be used for specialized environments.

---

# 34. Static Container IP

You can assign an IP on a custom network.

Example:

```bash
docker network create \
  --subnet 172.30.0.0/16 \
  app-net
```

Then:

```bash
docker run -d \
  --name db \
  --network app-net \
  --ip 172.30.0.10 \
  postgres:18
```

Use static container IPs only when there is a real requirement.

Prefer service/container names for application discovery.

---

# 35. Why Static IPs Are Usually Discouraged

Static IPs introduce:

```text
Configuration Coupling
Address Management
Migration Complexity
Recreation Problems
```

Better:

```text
db:5432
```

than:

```text
172.30.0.10:5432
```

for normal application communication.

---

# 36. Custom Network Subnet

Example:

```bash
docker network create \
  --driver bridge \
  --subnet 10.50.0.0/24 \
  --gateway 10.50.0.1 \
  app-net
```

Check:

```bash
docker network inspect app-net
```

Be careful to avoid overlapping with:

```text
Corporate Networks
VPNs
Cloud VPCs
Host Networks
Other Docker Networks
```

---

# 37. Network Address Overlap

Suppose:

```text
Corporate VPN:
10.50.0.0/16
```

and Docker uses:

```text
10.50.0.0/24
```

This can create routing ambiguity.

Choose Docker subnets carefully in enterprise environments.

---

# 38. DNS Service Discovery

Example:

```text
Network: app-net

web
api
db
```

The API can use:

```text
db
```

as a hostname.

Conceptually:

```text
api
 │
 └── DNS query: db
          │
          ▼
     Docker DNS
          │
          ▼
     db container IP
```

---

# 39. Container Name as DNS Name

Example:

```bash
docker run -d \
  --name database \
  --network app-net \
  postgres:18
```

Other containers on the network can generally resolve:

```text
database
```

through Docker's embedded DNS.

---

# 40. Network Aliases

A container can have network aliases.

Conceptually:

```text
database
db
postgres
    │
    ▼
Same Network Endpoint
```

Aliases are useful when applications expect specific service names.

---

# 41. DNS Aliases Example

Example:

```bash
docker network connect \
  --alias db \
  app-net \
  postgres
```

Now the connected container can be discoverable using the configured alias on that network.

---

# 42. Multiple Networks and DNS

A container connected to multiple networks may have different names or aliases associated with those networks.

This is another reason to design network membership intentionally.

---

# 43. Network Isolation

A container only communicates over networks to which it is connected, subject to host firewall and routing configuration.

Example:

```text
frontend
   │
   ▼
frontend-net

database
   │
   ▼
backend-net
```

If frontend is not connected to backend-net, direct database connectivity is not normally available through that Docker network.

---

# 44. Three-Tier Network Design

A common standalone Docker architecture:

```text
                    Internet
                       │
                       ▼
                 Reverse Proxy
                       │
                frontend-net
                       │
                       ▼
                     API
                       │
                 backend-net
                       │
                       ▼
                   Database
```

Database is not published to the host.

---

# 45. Example Three-Tier Setup

Create networks:

```bash
docker network create frontend-net
docker network create backend-net
```

Proxy:

```bash
docker run -d \
  --name proxy \
  --network frontend-net \
  -p 80:80 \
  nginx
```

API:

```bash
docker run -d \
  --name api \
  --network frontend-net \
  myapi:1.0
```

Connect API to backend:

```bash
docker network connect backend-net api
```

Database:

```bash
docker run -d \
  --name db \
  --network backend-net \
  -v db-data:/var/lib/postgresql/data \
  postgres:18
```

Now:

```text
Proxy → API → DB
```

---

# 46. Network Exposure Principle

Only expose the edge service:

```text
Internet
   │
   ▼
Proxy
   │
   ▼
API
   │
   ▼
DB
```

Avoid:

```text
Internet
 ├── Proxy
 ├── API
 └── DB
```

unless there is a specific requirement.

---

# 47. Host Network Driver

Example:

```bash
docker run \
  --network host \
  myapp
```

On Linux, the container shares the host network namespace.

Consequences:

```text
No normal container-specific IP
Host network stack is shared
Port publishing behaves differently
Isolation is reduced
```

Use for specialized workloads, not as a default.

---

# 48. Host Networking Caveat

Host networking behavior differs across:

```text
Linux
Docker Desktop
Windows
macOS
```

Always verify platform-specific behavior before using it in a cross-platform workflow.

---

# 49. None Network

Example:

```bash
docker run \
  --network none \
  alpine
```

The container has only limited local networking, such as loopback, rather than a normal Docker network connection.

Useful for:

```text
Offline Processing
Isolation
Security Testing
Batch Computation
```

---

# 50. Overlay Network

Overlay networks are primarily associated with multi-host container networking.

Conceptually:

```text
Host A
 └── Containers
       │
       ▼
     Overlay
       │
       ▼
Host B
 └── Containers
```

Docker Swarm can use overlay networking for service-to-service communication across hosts.

---

# 51. Overlay Network Architecture

```text
             Overlay Network
          ┌────────────────────┐
          │                    │
          ▼                    ▼
       Host A               Host B
          │                    │
      Container A          Container B
```

The underlying hosts can communicate while the overlay presents a logical shared network.

---

# 52. Docker Swarm and Overlay

Example:

```bash
docker network create \
  --driver overlay \
  app-net
```

An overlay network can be used by Swarm services.

The exact requirements depend on whether the network is intended for standalone containers or Swarm services.

---

# 53. Overlay vs Bridge

| Bridge | Overlay |
|---|---|
| Typically single Docker host | Multi-host capable |
| Common standalone Docker | Common with Swarm |
| Simple | More complex |
| Local networking | Distributed networking |

---

# 54. Macvlan

Macvlan can give containers identities directly on a physical network.

Conceptually:

```text
Physical LAN
    │
    ├── Host
    ├── Container A
    └── Container B
```

This can be useful for specialized legacy or network appliance workloads.

It introduces additional operational complexity.

---

# 55. IPVLAN

IPVLAN is another Linux networking technology that can be used by Docker for specialized network designs.

It can be useful when:

```text
Physical Network Integration
Large Addressing Requirements
Network Appliance Scenarios
```

are important.

---

# 56. Bridge vs Macvlan vs Host

```text
Bridge
 └── Stronger container abstraction

Host
 └── Shares host network namespace

Macvlan
 └── Container appears more directly on physical network
```

Choose based on the actual network requirement.

---

# 57. Network Driver Selection

A simple decision model:

```text
Need normal single-host container networking?
        │
        ▼
      Bridge

Need multi-host Swarm networking?
        │
        ▼
      Overlay

Need host network stack?
        │
        ▼
      Host

Need no network?
        │
        ▼
      None

Need direct L2/L3 integration?
        │
        ▼
   Macvlan / IPVLAN
```

---

# 58. Docker Compose Networking

Compose automatically creates a project network in common configurations.

Example:

```yaml
services:
  api:
    image: myapi:1.0

  db:
    image: postgres:18
```

The services can generally communicate using service names:

```text
api
db
```

---

# 59. Compose Service Discovery

Conceptually:

```text
api
 │
 ▼
db:5432
 │
 ▼
PostgreSQL
```

No hard-coded container IP is required.

---

# 60. Compose Custom Networks

Example:

```yaml
services:
  proxy:
    image: nginx
    networks:
      - frontend

  api:
    image: myapi:1.0
    networks:
      - frontend
      - backend

  db:
    image: postgres:18
    networks:
      - backend

networks:
  frontend:
  backend:
```

Architecture:

```text
Proxy
  │
frontend
  │
 API
  │
backend
  │
 DB
```

---

# 61. Network Aliases in Compose

Compose can define aliases so a service is reachable under additional DNS names.

This can help with:

```text
Legacy Applications
Migration
Compatibility
Environment Standardization
```

---

# 62. External Networks in Compose

Compose can attach services to an already-created Docker network.

Conceptually:

```yaml
networks:
  shared:
    external: true
```

This is useful when multiple Compose projects need controlled communication.

---

# 63. Cross-Compose Project Communication

Example:

```text
Project A
 └── API
       │
       ▼
shared-net
       ▲
       │
Project B
 └── Database
```

Use shared external networks carefully to avoid unnecessary coupling.

---

# 64. Network Troubleshooting

When connectivity fails, check:

```text
1. Is the container running?
2. Is the application listening?
3. Is the container on the expected network?
4. Is DNS resolving?
5. Is the correct port used?
6. Is the host port published?
7. Is the service listening on 0.0.0.0?
8. Are firewall rules blocking traffic?
9. Are networks overlapping?
10. Is the target service healthy?
```

---

# 65. Check Container Networks

```bash
docker inspect myapp
```

Look under:

```text
NetworkSettings
```

You can identify:

```text
Networks
IP Address
Gateway
Aliases
```

---

# 66. Check Network Details

```bash
docker network inspect app-net
```

Look for:

```text
Containers
Subnet
Gateway
Driver
```

---

# 67. Test DNS

From a container that has DNS tools:

```bash
getent hosts db
```

or:

```bash
nslookup db
```

or:

```bash
dig db
```

Availability depends on the container image.

---

# 68. Test TCP Connectivity

If tools are available:

```bash
nc -zv db 5432
```

or:

```bash
curl http://api:8080/health
```

These tests separate:

```text
DNS Problem
```

from:

```text
TCP / Application Problem
```

---

# 69. DNS Works but Connection Fails

Example:

```text
db → resolves correctly
      │
      ▼
TCP connection fails
```

Investigate:

```text
Port
Application Listening
Firewall
Container Health
Network Membership
```

---

# 70. Connection Refused

Usually means the destination is reachable but no process is accepting connections on that address/port.

Check:

```text
Application Startup
Listening Port
Listening Address
Container Health
```

---

# 71. Connection Timeout

Often indicates:

```text
Routing
Firewall
Network Isolation
Wrong Address
Service Not Reachable
```

Check Docker network membership and host/network policy.

---

# 72. DNS Resolution Failure

Possible causes:

```text
Containers not on same user-defined network
Wrong service/container name
Network disconnected
DNS configuration issue
Application using wrong hostname
```

---

# 73. Port Mapping Problem

Example:

```bash
docker run -p 8080:8080 myapp
```

but application listens on:

```text
9090
```

Result:

```text
Host 8080 → Container 8080
                    │
                    X
             Application:9090
```

Correct mapping:

```bash
docker run -p 8080:9090 myapp
```

---

# 74. `docker port`

Check published ports:

```bash
docker port myapp
```

Example output may show:

```text
8080/tcp -> 0.0.0.0:8080
```

This helps verify host-to-container publishing.

---

# 75. Host Firewall

Docker networking can interact with:

```text
iptables
nftables
firewalld
ufw
Cloud Security Groups
Corporate Firewalls
```

A container networking problem may actually be a host or external firewall issue.

---

# 76. VPN Interactions

Corporate VPNs can introduce routing conflicts with Docker subnets.

Example:

```text
VPN:
172.16.0.0/12

Docker:
172.18.0.0/16
```

The ranges overlap.

Symptoms can include:

```text
Unreachable Services
Wrong Routes
Timeouts
```

Use non-overlapping Docker network ranges where possible.

---

# 77. Network Security

Container networking should follow:

```text
Least Connectivity
```

Only allow:

```text
Required Source
        │
        ▼
Required Destination
        │
        ▼
Required Port
```

Avoid unrestricted flat networks.

---

# 78. Flat Network Anti-Pattern

```text
One Network
 │
 ├── Proxy
 ├── API
 ├── Admin
 ├── Database
 ├── Monitoring
 └── Miscellaneous
```

Every component may become unnecessarily reachable.

Prefer segmentation.

---

# 79. Segmented Network Pattern

```text
frontend-net
    │
    ├── Proxy
    └── API

backend-net
    │
    ├── API
    └── DB

monitoring-net
    │
    ├── Monitoring
    └── Exporters
```

Only components requiring multiple zones join multiple networks.

---

# 80. Network Security and Published Ports

Remember:

```text
Same Docker Network
      ≠
Internet Exposure
```

A container can communicate internally without having its port published to the host.

This is a key security advantage of internal application networking.

---

# 81. Internal Services

Example:

```bash
docker run -d \
  --name db \
  --network backend-net \
  postgres:18
```

No:

```bash
-p 5432:5432
```

The database is not intentionally published to the Docker host through a port mapping.

The API can still access:

```text
db:5432
```

from the shared backend network.

---

# 82. Network Isolation and `--network`

Example:

```bash
docker run \
  --network none \
  batch-job
```

The application cannot normally reach external network services.

This can be useful for:

```text
Untrusted Processing
Offline Jobs
Security Testing
```

---

# 83. Egress Control

Docker standalone networking does not automatically provide a complete enterprise egress-policy framework.

For stronger controls, consider:

```text
Host Firewall
Network Firewall
Proxy
Cloud Network Policies
Orchestrator Network Policies
```

---

# 84. Container Network Security Layers

```text
Application
    │
    ▼
Container Namespace
    │
    ▼
Docker Network
    │
    ▼
Host Firewall
    │
    ▼
Cloud / Corporate Network
    │
    ▼
Internet
```

Security must be considered across all layers.

---

# 85. Network Performance

Performance can be affected by:

```text
NAT
Virtual Interfaces
Encryption
Overlay Networking
DNS
MTU
CPU
Host Network
External Firewall
```

Do not optimize prematurely.

Measure first.

---

# 86. MTU

MTU defines the maximum packet size for a network interface.

Incorrect MTU configuration can cause:

```text
Fragmentation
Packet Loss
Timeouts
Unexpected Application Failures
```

This is particularly important with:

```text
VPNs
Overlay Networks
Cloud Networks
Encrypted Tunnels
```

---

# 87. Network Latency

Container-to-container communication on the same host is typically efficient, but still passes through virtual networking infrastructure.

Cross-host networking introduces additional:

```text
Network Hops
Latency
Failure Domains
```

---

# 88. Network Monitoring

Monitor:

```text
Network I/O
Connections
DNS
Packet Errors
Latency
Drops
Throughput
```

At the Docker level:

```bash
docker stats
```

For deeper diagnosis, use host networking tools and observability platforms.

---

# 89. Network Inspection Tools

Useful Linux tools include:

```bash
ip addr
ip route
ss -lntp
ss -ntp
ip neigh
```

Depending on the image, tools may not be installed inside containers.

Run them on the host or use dedicated diagnostic containers when appropriate.

---

# 90. `ss`

Check listening sockets:

```bash
ss -lntp
```

Check active connections:

```bash
ss -ntp
```

Useful for identifying whether a service is actually listening.

---

# 91. `ip route`

Check routing:

```bash
ip route
```

Useful when investigating:

```text
Gateway
Subnet
Default Route
Routing Conflicts
```

---

# 92. `ip addr`

Check interfaces:

```bash
ip addr
```

Useful for:

```text
Container IP
Interface State
Subnet
```

---

# 93. Network Namespace Debugging

Advanced Linux debugging can inspect the network namespace associated with a container.

Conceptually:

```text
Docker Container
      │
      ▼
Network Namespace
      │
      ├── Interfaces
      ├── Routes
      └── Sockets
```

This is useful for deep networking investigations.

---

# 94. Network Driver Selection for Production

Ask:

```text
Single host?
Multi-host?
Need direct LAN integration?
Need host networking?
Need complete isolation?
Need orchestrator networking?
```

Then select:

```text
bridge
overlay
host
none
macvlan
ipvlan
```

based on the requirement.

---

# 95. Docker Network Lifecycle

```text
Create
  │
  ▼
Connect Containers
  │
  ▼
Run Workloads
  │
  ▼
Disconnect
  │
  ▼
Remove Network
```

Commands:

```bash
docker network create
docker network connect
docker network disconnect
docker network rm
```

---

# 96. Network Cleanup

A network cannot normally be removed while it still has attached containers.

Check:

```bash
docker network inspect app-net
```

Disconnect containers:

```bash
docker network disconnect app-net api
```

Then remove:

```bash
docker network rm app-net
```

---

# 97. Pruning Networks

Docker supports network pruning for unused networks.

Use carefully in shared development environments.

Do not prune networks that active workloads depend on.

---

# 98. Network Naming Strategy

Use meaningful names:

```text
frontend-net
backend-net
monitoring-net
```

Avoid:

```text
network1
network2
test123
```

Clear naming improves operations and troubleshooting.

---

# 99. Environment Network Strategy

Development:

```text
dev-frontend
dev-backend
```

Testing:

```text
test-frontend
test-backend
```

Production:

```text
prod-frontend
prod-backend
```

In larger environments, orchestration platforms usually provide stronger network abstraction.

---

# 100. Docker Network vs Kubernetes Network

Docker:

```text
Docker Network
    │
    └── Container Connectivity
```

Kubernetes:

```text
Kubernetes Network
    │
    ├── Pod Networking
    ├── Services
    ├── NetworkPolicy
    └── CNI
```

Docker networking concepts remain useful because container networking is still built on fundamental Linux networking concepts.

---

# 101. Docker Network vs Cloud VPC

Do not confuse:

```text
Docker Network
```

with:

```text
Cloud VPC / VNet
```

They operate at different layers.

Conceptually:

```text
Cloud VPC
   │
   ▼
Host / VM Network
   │
   ▼
Docker Network
   │
   ▼
Container
```

---

# 102. Network Layering

A useful mental model:

```text
Internet
   │
   ▼
Cloud / Corporate Network
   │
   ▼
Host Network
   │
   ▼
Docker Network
   │
   ▼
Container Network Namespace
   │
   ▼
Application Socket
```

A connectivity problem can occur at any layer.

---

# 103. Common Networking Mistakes

## Using `localhost` for Another Container

Wrong:

```text
DB_HOST=localhost
```

Correct:

```text
DB_HOST=db
```

when both are on the same Docker network.

---

## Publishing Internal Services

Unnecessary:

```bash
-p 5432:5432
```

for a database that only needs application access.

---

## Hard-Coding Container IPs

Avoid:

```text
172.20.0.5
```

Prefer:

```text
db
```

---

## Overlapping Subnets

Avoid Docker networks that conflict with:

```text
VPN
Cloud
Corporate
Host
```

routes.

---

# 104. Practical Troubleshooting Flow

```text
Cannot Reach Service
        │
        ▼
Is Container Running?
        │
        ▼
Is Application Listening?
        │
        ▼
Correct Container Port?
        │
        ▼
Same Network?
        │
        ▼
DNS Resolves?
        │
        ▼
TCP Connects?
        │
        ▼
Firewall / Routing?
        │
        ▼
Application Protocol?
```

---

# 105. Example: API Cannot Reach DB

Suppose:

```text
API
 │
 X
 ▼
DB
```

Check:

```bash
docker network inspect backend-net
```

Confirm both are attached.

Then:

```bash
docker exec api getent hosts db
```

Then test:

```bash
docker exec api nc -zv db 5432
```

If DNS works but TCP fails, inspect:

```text
DB startup
DB listening port
DB health
Network membership
Firewall
```

---

# 106. Example: Browser Cannot Reach API

Check:

```text
Browser
   │
   ▼
Host Port
   │
   ▼
Container Port
   │
   ▼
Application
```

Verify:

```bash
docker port api
docker logs api
```

Then verify application listening address:

```text
0.0.0.0:8080
```

rather than only:

```text
127.0.0.1:8080
```

inside the container.

---

# 107. Example: Container Cannot Reach Internet

Check:

```text
1. Network driver
2. Default route
3. DNS
4. Host firewall
5. Proxy
6. VPN
7. Corporate policy
```

Test DNS separately from external HTTP connectivity.

---

# 108. DNS vs Internet Connectivity

Test:

```text
DNS:
db → IP

External:
example.com → HTTP connection
```

If DNS works but HTTP fails:

```text
Routing / Firewall / Proxy
```

may be the issue.

If DNS fails:

```text
DNS configuration / network
```

may be the issue.

---

# 109. Proxy Environments

Enterprise environments may require:

```text
HTTP_PROXY
HTTPS_PROXY
NO_PROXY
```

for applications to reach external services.

Make sure `NO_PROXY` includes internal service names and domains where appropriate.

Example concept:

```text
NO_PROXY=db,api,.internal.example
```

---

# 110. Network Security Checklist

```text
[ ] Use user-defined networks
[ ] Avoid unnecessary published ports
[ ] Avoid hard-coded container IPs
[ ] Use service/container names
[ ] Segment frontend/backend/database
[ ] Avoid exposing databases
[ ] Avoid overlapping subnets
[ ] Restrict host mounts
[ ] Review firewall rules
[ ] Review VPN interactions
[ ] Control egress where required
[ ] Monitor network traffic
[ ] Use TLS for sensitive application traffic
```

---

# 111. Network Architecture Example

```text
                         INTERNET
                            │
                            ▼
                     HOST / FIREWALL
                            │
                         :443
                            │
                            ▼
                     ┌─────────────┐
                     │   PROXY     │
                     └──────┬──────┘
                            │
                     frontend-net
                            │
                            ▼
                     ┌─────────────┐
                     │     API     │
                     └──────┬──────┘
                            │
                     backend-net
                            │
                            ▼
                     ┌─────────────┐
                     │     DB      │
                     └─────────────┘
```

Only the proxy needs external exposure.

---

# 112. Monitoring Architecture

```text
Containers
   │
   ├── Logs
   ├── Metrics
   └── Network Stats
          │
          ▼
Observability Platform
          │
          ├── Dashboards
          ├── Alerts
          └── Troubleshooting
```

Network health should be monitored as part of overall application observability.

---

# 113. Network Security Layers

```text
Layer 1 → Application Authentication
Layer 2 → Container Network Segmentation
Layer 3 → Host Firewall
Layer 4 → Cloud / Corporate Firewall
Layer 5 → TLS / Encryption
Layer 6 → Monitoring / Detection
```

No single layer should be treated as the complete security boundary.

---

# 114. Production Networking Best Practices

```text
1. Prefer user-defined bridge networks for standalone application stacks.

2. Use service/container names instead of IP addresses.

3. Publish only externally required ports.

4. Bind sensitive development services to localhost where appropriate.

5. Keep databases on private networks.

6. Use multiple networks to segment tiers.

7. Avoid unnecessary host networking.

8. Avoid --privileged networking unless required.

9. Avoid mounting the Docker socket.

10. Avoid overlapping Docker subnets with enterprise/VPN routes.

11. Keep network names meaningful.

12. Inspect networks during troubleshooting.

13. Separate DNS problems from TCP problems.

14. Separate TCP problems from application protocol problems.

15. Control outbound traffic where required.

16. Use TLS for sensitive traffic.

17. Monitor network performance and errors.

18. Treat container IPs as ephemeral.

19. Design for container recreation.

20. Use orchestration networking for complex multi-host production systems.
```

---

# 115. Common Interview Questions

## Beginner

### What is Docker networking?

It is the set of mechanisms Docker uses to connect containers with each other, the host, and external networks while providing isolation and addressing.

### What is the default Docker network?

Docker commonly creates a default `bridge` network for standalone containers.

### What does `-p 8080:80` mean?

Host port `8080` is published to container port `80`.

### Does `EXPOSE` publish a port?

No. It documents a container port; `-p` performs runtime port publishing.

### What does `localhost` mean inside a container?

The container itself.

---

## Intermediate

### Why use a user-defined bridge network?

It provides explicit network membership and convenient container/service name resolution.

### How do containers discover each other?

On user-defined networks, Docker's embedded DNS can resolve container/service names.

### Why should you avoid container IPs?

Container IPs can change when containers are recreated.

### Can one container join multiple networks?

Yes.

### Why would you use multiple networks?

To segment communication and reduce unnecessary connectivity.

---

## Advanced

### What is a network namespace?

A Linux isolation mechanism providing a separate network stack for a process/container.

### What is a veth pair?

A virtual Ethernet pair connects network namespaces, commonly linking a container interface to the host side.

### What is IPAM?

IP Address Management; it handles network address allocation such as subnets, gateways, and container IPs.

### What is an overlay network?

A logical network that can provide container connectivity across multiple hosts, commonly used with Docker Swarm.

### Bridge vs host network?

Bridge provides a separate container network environment; host networking shares the host network namespace on supported Linux configurations.

### Why is a Docker subnet overlapping a corporate VPN problematic?

Routing can become ambiguous, causing traffic to be sent to the wrong network.

### Why should databases normally not have published ports?

They usually only need to be reachable by application services, reducing external attack surface.

---

# 116. Complete Docker Networking Mental Model

```text
                              INTERNET
                                  │
                                  ▼
                         HOST / CLOUD NETWORK
                                  │
                                  ▼
                           DOCKER HOST
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
            frontend-net                     backend-net
                  │                               │
                  ▼                               ▼
              PROXY ───────────────► API ───────► DB
                  │                               │
                  │                               │
              Published                         Private
                :443                           :5432
                  │                               │
                  └───────────────┬───────────────┘
                                  │
                             CONTAINERS
                                  │
                         Network Namespaces
                                  │
                         Virtual Interfaces
                                  │
                              Docker DNS
                                  │
                              IPAM / Routes
```

---

# 117. Complete Connectivity Model

```text
Application
    │
    ▼
Socket
    │
    ▼
Container Network Namespace
    │
    ▼
eth0
    │
    ▼
Docker Network
    │
    ├── DNS
    ├── IPAM
    ├── Routing
    └── Isolation
    │
    ▼
Host Networking
    │
    ├── Firewall
    ├── NAT
    └── Routing
    │
    ▼
External Network
```

---

# 118. Network Troubleshooting Mental Model

Always work from inside out:

```text
1. Process
   │
   ▼
2. Listening Socket
   │
   ▼
3. Container Interface
   │
   ▼
4. Container Network
   │
   ▼
5. DNS / Routing
   │
   ▼
6. Host Firewall / NAT
   │
   ▼
7. External Network
```

This prevents random troubleshooting.

---

# 119. Final Key Takeaways

Remember:

```text
1. Docker networking connects containers, hosts, and external systems.

2. Containers normally receive isolated network namespaces.

3. User-defined bridge networks are a strong default for standalone application stacks.

4. Docker provides embedded DNS for container/service discovery on user-defined networks.

5. Use names such as db:5432 instead of container IP addresses.

6. Container IPs should generally be treated as ephemeral.

7. -p publishes a container port to the host.

8. EXPOSE does not publish a port.

9. localhost inside a container means that container.

10. An application usually needs to listen on the appropriate container interface, often 0.0.0.0 for server workloads.

11. A container can connect to multiple networks.

12. Multiple networks are useful for application-tier segmentation.

13. Databases should normally remain on private networks.

14. Avoid publishing ports that external clients do not need.

15. Bridge networking is common for single-host Docker.

16. Overlay networking supports multi-host scenarios such as Docker Swarm.

17. Host networking reduces network isolation.

18. None networking provides strong network isolation for suitable workloads.

19. Macvlan and IPVLAN are specialized network integration options.

20. IPAM manages subnets, gateways, and address allocation.

21. Avoid overlapping Docker networks with VPN or corporate network ranges.

22. DNS problems, TCP problems, and application problems should be diagnosed separately.

23. Network security requires segmentation, firewalling, and controlled exposure.

24. Docker networking is only one layer of the overall network architecture.

25. For complex production clusters, orchestration platforms provide higher-level networking capabilities.
```

The core idea is:

```text
CONTAINER
   │
   ▼
NETWORK NAMESPACE
   │
   ▼
DOCKER NETWORK
   │
   ├── DNS
   ├── IPAM
   ├── ROUTING
   └── ISOLATION
   │
   ▼
HOST NETWORK
   │
   ▼
EXTERNAL NETWORK
```

> **Good Docker networking is not about giving every container connectivity. It is about giving each workload exactly the connectivity it needs, while keeping addressing stable, exposure controlled, and troubleshooting predictable.**

---

# 120. Related Knowledge

- [`README.md`](README.md)
- [`docker-and-containers.md`](docker-and-containers.md)
- [`container.md`](container.md)
- [`image.md`](image.md)
- [`dockerfile.md`](dockerfile.md)
- [`build.md`](build.md)
- [`run.md`](run.md)
- [`volume.md`](volume.md)
- [`registry.md`](registry.md)
