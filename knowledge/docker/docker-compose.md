# Docker Compose

> **Docker Compose is a declarative tool for defining and running multi-container applications using a YAML configuration. It allows services, networks, volumes, environment variables, health checks, dependencies, and operational settings to be described as application infrastructure.**

This document covers Docker Compose from fundamentals through production-oriented usage, including Compose files, services, images, builds, ports, networks, volumes, environment configuration, secrets, configs, health checks, dependencies, profiles, scaling, development workflows, CI/CD, troubleshooting, security, and complete application architectures.

---

# 1. What Is Docker Compose?

Docker Compose lets you define multiple containers as one application stack.

Instead of running:

```bash
docker network create app-net

docker run ...
docker run ...
docker run ...
```

you can define:

```text
compose.yaml
```

and start the application with:

```bash
docker compose up
```

---

# 2. Compose Mental Model

```text
                 compose.yaml
                      │
                      ▼
                Compose Project
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
      API           DB          Frontend
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                   Networks
                      │
                      ▼
                   Volumes
```

Compose manages the relationships between the components.

---

# 3. Why Use Compose?

Compose is useful when an application needs multiple services:

```text
Frontend
Backend API
Database
Cache
Message Broker
Worker
Reverse Proxy
Monitoring
```

Compose provides a repeatable definition of the stack.

---

# 4. Compose File

Modern Docker Compose commonly uses:

```text
compose.yaml
```

or:

```text
compose.yml
```

You may also encounter:

```text
docker-compose.yml
docker-compose.yaml
```

in older projects.

---

# 5. Basic Compose File

Example:

```yaml
services:
  web:
    image: nginx:1.29
    ports:
      - "8080:80"
```

Start:

```bash
docker compose up
```

Stop:

```bash
docker compose down
```

---

# 6. Compose Project

A Compose application is a project.

Conceptually:

```text
Project
  │
  ├── Services
  ├── Networks
  ├── Volumes
  ├── Secrets
  └── Configs
```

Compose commonly creates project-scoped resource names automatically.

---

# 7. Compose Service

A service represents a containerized workload.

Example:

```yaml
services:
  api:
    image: mycompany/api:1.5.0
```

The service name is:

```text
api
```

Other services can normally use the service name for network discovery.

---

# 8. Multiple Services

Example:

```yaml
services:
  frontend:
    image: mycompany/frontend:1.0.0

  api:
    image: mycompany/api:1.5.0

  db:
    image: postgres:18
```

Architecture:

```text
Frontend
   │
   ▼
 API
   │
   ▼
 DB
```

---

# 9. Compose Service Name as DNS

If:

```yaml
services:
  api:
    image: myapi:1.0.0

  db:
    image: postgres:18
```

the API can normally connect to:

```text
db:5432
```

rather than:

```text
localhost:5432
```

---

# 10. `image`

Example:

```yaml
services:
  api:
    image: nginx:1.29
```

This tells Compose to use an existing image.

The image can come from:

```text
Docker Hub
Private Registry
Cloud Registry
Local Image Store
```

---

# 11. Private Registry Image

Example:

```yaml
services:
  api:
    image: registry.example.com/payments/api:1.5.0
```

Docker must have appropriate registry authentication.

---

# 12. `build`

Instead of pulling an existing image, Compose can build one.

Example:

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
```

Then:

```bash
docker compose build
```

or:

```bash
docker compose up --build
```

---

# 13. Build Context

Example:

```yaml
build:
  context: .
```

The context determines the files available to the Docker build.

Keep the context small using:

```text
.dockerignore
```

---

# 14. Custom Dockerfile

Example:

```yaml
services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile.production
```

This is useful when different services have separate source directories or Dockerfiles.

---

# 15. Build Arguments

Example:

```yaml
services:
  api:
    build:
      context: .
      args:
        APP_VERSION: "1.5.0"
```

Dockerfile:

```dockerfile
ARG APP_VERSION
```

Remember:

```text
ARG ≠ Secret
```

Do not put sensitive credentials in build arguments.

---

# 16. Compose `command`

Example:

```yaml
services:
  worker:
    image: myworker:1.0
    command: ["python", "worker.py"]
```

This overrides the image's default command.

---

# 17. Compose `entrypoint`

Example:

```yaml
services:
  api:
    image: myapi:1.0
    entrypoint: ["/app/start.sh"]
```

This overrides the image's configured entrypoint.

---

# 18. Command vs Entrypoint

Mental model:

```text
ENTRYPOINT
    │
    ▼
Main executable

CMD
    │
    ▼
Default arguments / command
```

Compose can override either.

---

# 19. Ports

Example:

```yaml
services:
  web:
    image: nginx:1.29
    ports:
      - "8080:80"
```

Flow:

```text
Host:8080
    │
    ▼
Container:80
```

---

# 20. Internal Ports vs Published Ports

A database might use:

```yaml
services:
  db:
    image: postgres:18
```

without:

```yaml
ports:
  - "5432:5432"
```

The API can still use:

```text
db:5432
```

if both services share a network.

---

# 21. Port Binding

You can bind to a specific host address:

```yaml
ports:
  - "127.0.0.1:8080:80"
```

This is useful when the service should be accessible only from the local host.

---

# 22. UDP Ports

Example:

```yaml
ports:
  - "5353:5353/udp"
```

---

# 23. Environment Variables

Example:

```yaml
services:
  api:
    image: myapi:1.0
    environment:
      APP_ENV: production
      LOG_LEVEL: info
```

The variables become available inside the container.

---

# 24. Environment Variable File

Example:

```yaml
services:
  api:
    env_file:
      - .env
```

The file can contain:

```text
APP_ENV=production
LOG_LEVEL=info
```

Do not put production secrets in an ordinary `.env` file committed to Git.

---

# 25. Compose `.env` File

Compose can also use `.env` for variable interpolation.

Example:

```text
IMAGE_TAG=1.5.0
```

Compose:

```yaml
services:
  api:
    image: myapi:${IMAGE_TAG}
```

Now:

```text
myapi:1.5.0
```

---

# 26. Variable Interpolation

Example:

```yaml
services:
  api:
    image: myapi:${IMAGE_TAG:-latest}
```

Meaning:

```text
Use IMAGE_TAG
or
use latest if it is not defined
```

Avoid accidental production deployment using `latest`.

---

# 27. Environment Precedence

Compose supports multiple sources of variable values.

Because precedence can become complex, verify effective configuration with:

```bash
docker compose config
```

Do not assume a value simply because it appears in one `.env` file.

---

# 28. Secrets vs Environment Variables

Environment variables are convenient:

```yaml
environment:
  DB_PASSWORD: ...
```

but secrets often deserve a stronger mechanism.

Prefer dedicated secret-management mechanisms for sensitive credentials.

---

# 29. Compose Secrets

Compose supports secrets.

Example:

```yaml
services:
  api:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

The exact runtime behavior depends on the Compose implementation and platform.

---

# 30. Secret File

A service may consume a secret as a file, conceptually:

```text
/run/secrets/db_password
```

The application can read the file rather than receiving the secret directly as an environment variable.

---

# 31. Do Not Commit Secrets

Avoid:

```text
password.txt
.env
private-key.pem
production-secrets.yaml
```

in source control.

Use:

```text
Secret Manager
CI/CD Secret Store
Cloud Secret Service
Vault
Platform Secret Mechanism
```

for production credentials.

---

# 32. Volumes

Compose can define named volumes.

Example:

```yaml
services:
  db:
    image: postgres:18
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

---

# 33. Volume Mental Model

```text
Postgres Container
      │
      ▼
/var/lib/postgresql/data
      │
      ▼
db-data
      │
      ▼
Persistent Storage
```

The volume survives container recreation.

---

# 34. Bind Mounts

Example:

```yaml
services:
  api:
    build: .
    volumes:
      - ./src:/app/src
```

This is common during development.

---

# 35. Read-Only Bind Mount

Example:

```yaml
services:
  api:
    volumes:
      - ./config:/app/config:ro
```

This prevents the container from modifying the mounted configuration.

---

# 36. Named Volume vs Bind Mount

```text
Named Volume
    │
    └── Docker-managed persistence

Bind Mount
    │
    └── Direct host filesystem mapping
```

Use the one that matches the requirement.

---

# 37. tmpfs

Compose can define temporary memory-backed storage where supported.

Conceptually:

```text
Application
    │
    ▼
/tmp
    │
    ▼
tmpfs
```

Useful for:

```text
Temporary Files
Caches
Runtime Scratch
```

---

# 38. Networks

Compose can define networks explicitly.

Example:

```yaml
services:
  api:
    networks:
      - backend

  db:
    networks:
      - backend

networks:
  backend:
```

---

# 39. Default Compose Network

If no custom networks are declared, Compose normally creates a project-scoped default network.

Services can communicate using service names.

Example:

```text
api → db:5432
```

---

# 40. Multiple Networks

Example:

```yaml
services:
  proxy:
    networks:
      - frontend

  api:
    networks:
      - frontend
      - backend

  db:
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

# 41. Network Segmentation

Multiple networks provide a simple segmentation pattern:

```text
Internet
   │
   ▼
Proxy
   │
frontend-net
   │
   ▼
API
   │
backend-net
   │
   ▼
DB
```

The database is not directly attached to the frontend network.

---

# 42. `depends_on`

Example:

```yaml
services:
  api:
    depends_on:
      - db

  db:
    image: postgres:18
```

This expresses a startup dependency.

---

# 43. Important `depends_on` Limitation

Basic:

```yaml
depends_on:
  - db
```

does not automatically mean:

```text
Database application is ready
```

It primarily expresses service startup ordering.

Use health checks and dependency conditions where supported.

---

# 44. Health Check

Example:

```yaml
services:
  db:
    image: postgres:18
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---

# 45. Dependency on Healthy Service

Example:

```yaml
services:
  api:
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:18
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

This is much stronger than simple startup ordering.

---

# 46. Health Check Mental Model

```text
Container Started
      │
      ▼
Process Running
      │
      ▼
Health Check
      │
      ├── Healthy
      │     │
      │     ▼
      │   Dependent Service
      │
      └── Unhealthy
```

---

# 47. Health Check vs Process Status

A container can be:

```text
Running
```

but:

```text
Unhealthy
```

Example:

```text
API process alive
     │
     X
Database connection broken
```

Health checks should represent meaningful service health.

---

# 48. Restart Policies

Example:

```yaml
services:
  api:
    restart: unless-stopped
```

Common values include:

```text
no
always
on-failure
unless-stopped
```

Exact behavior should be understood before using it in production.

---

# 49. Restart vs Health Check

These solve different problems.

```text
Healthcheck
   └── Reports service health

Restart policy
   └── Controls container restart behavior
```

A health check does not automatically guarantee that Compose will restart an unhealthy container.

---

# 50. Resource Limits

Compose can define resource-related settings.

Example:

```yaml
services:
  api:
    mem_limit: 512m
```

Exact supported fields and semantics can vary by Compose implementation and deployment mode.

For production orchestration, use the platform's native resource controls where appropriate.

---

# 51. CPU Limits

Example:

```yaml
services:
  api:
    cpus: 1.0
```

This can constrain CPU consumption in supported Docker environments.

---

# 52. PIDs Limit

Example:

```yaml
services:
  api:
    pids_limit: 200
```

Useful as a defense against uncontrolled process creation.

---

# 53. Read-Only Container

Example:

```yaml
services:
  api:
    read_only: true
```

Then provide writable temporary locations if required:

```yaml
tmpfs:
  - /tmp
```

---

# 54. Security Options

Compose can expose security-related runtime configuration depending on implementation.

Examples can include:

```text
no-new-privileges
capability controls
security profiles
read-only root
```

Use the least-privilege principle.

---

# 55. Capabilities

Linux capabilities can be dropped where supported.

Conceptually:

```text
Container
   │
   ├── Default capabilities
   │
   ▼
Drop unnecessary privileges
```

Avoid:

```text
privileged: true
```

unless the workload genuinely requires it.

---

# 56. Privileged Containers

Example:

```yaml
services:
  special:
    privileged: true
```

This significantly increases privileges.

Use only for specialized workloads.

---

# 57. Logging

Compose can configure logging options.

Example:

```yaml
services:
  api:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

Production environments may use centralized logging drivers or external log aggregation.

---

# 58. Logging Principle

Do not allow:

```text
Container
   │
   ▼
Unlimited Local Logs
   │
   ▼
Disk Full
```

Configure:

```text
Rotation
Retention
Centralization
Monitoring
```

---

# 59. Profiles

Compose profiles allow optional services.

Example:

```yaml
services:
  api:
    image: myapi:1.0

  adminer:
    image: adminer
    profiles:
      - debug
```

Normal:

```bash
docker compose up
```

Debug profile:

```bash
docker compose --profile debug up
```

---

# 60. Why Profiles Matter

Profiles can separate:

```text
Core Application
```

from:

```text
Optional Tools
Debugging
Local Development
Monitoring
Admin Interfaces
```

This avoids starting unnecessary services.

---

# 61. Development Profile

Example:

```yaml
profiles:
  - dev
```

Possible services:

```text
Adminer
Mailhog
Local Mock Service
Debug Dashboard
```

Do not enable insecure development tools in production.

---

# 62. Compose Override Pattern

A common development approach:

```text
compose.yaml
compose.dev.yaml
```

Base:

```text
Common configuration
```

Development:

```text
Debug settings
Bind mounts
Development ports
Hot reload
```

The exact merge behavior should be validated using:

```bash
docker compose config
```

---

# 63. Production Compose File

A production-oriented file might define:

```text
Immutable image
Versioned tags
No source bind mounts
Persistent volumes
Health checks
Resource limits
Secrets
Read-only filesystem
Controlled networks
```

---

# 64. Development Compose File

Development may use:

```text
Build from source
Bind mounts
Hot reload
Debug ports
Local databases
Developer tools
```

These should not automatically be copied into production.

---

# 65. Compose File Merging

Multiple Compose files can be used together.

Example:

```bash
docker compose \
  -f compose.yaml \
  -f compose.dev.yaml \
  up
```

This allows environment-specific customization.

---

# 66. Verify Effective Configuration

Always useful:

```bash
docker compose config
```

This renders the effective Compose configuration after processing supported interpolation and file merges.

Use it to debug:

```text
Environment Variables
Overrides
Networks
Volumes
Services
```

---

# 67. `docker compose up`

Basic:

```bash
docker compose up
```

Detached:

```bash
docker compose up -d
```

Rebuild:

```bash
docker compose up --build
```

Force recreation can be controlled with additional options when needed.

---

# 68. `docker compose down`

```bash
docker compose down
```

Stops and removes Compose-managed containers and networks created for the project.

Named volumes are normally retained unless explicitly requested for removal.

---

# 69. `docker compose down -v`

```bash
docker compose down -v
```

This can remove named volumes associated with the Compose project.

This is potentially destructive.

Never run blindly against production data.

---

# 70. `docker compose ps`

```bash
docker compose ps
```

Shows service/container status.

Useful for:

```text
Running
Exited
Health
Ports
```

---

# 71. `docker compose logs`

All services:

```bash
docker compose logs
```

Follow:

```bash
docker compose logs -f
```

Specific service:

```bash
docker compose logs -f api
```

---

# 72. `docker compose exec`

Execute inside a running service:

```bash
docker compose exec api sh
```

Database example:

```bash
docker compose exec db psql -U postgres
```

Use carefully in production.

---

# 73. `docker compose run`

Run a one-off container based on a service configuration.

Example:

```bash
docker compose run --rm api python manage.py migrate
```

This is useful for:

```text
Migrations
Admin Commands
One-Off Jobs
Debugging
```

---

# 74. `docker compose start` vs `up`

```bash
docker compose start
```

starts existing containers.

```bash
docker compose up
```

creates/recreates and starts services as needed.

---

# 75. `docker compose stop`

```bash
docker compose stop
```

Stops containers without removing the project resources.

---

# 76. `docker compose restart`

```bash
docker compose restart api
```

Restarts the specified service.

Useful after certain configuration or runtime changes, but recreate containers when configuration itself requires recreation.

---

# 77. `docker compose pull`

```bash
docker compose pull
```

Pulls service images from configured registries.

Useful before controlled deployments.

---

# 78. `docker compose build`

```bash
docker compose build
```

Builds services that use `build:`.

Use:

```bash
docker compose build --no-cache
```

when a clean build is intentionally required.

---

# 79. `docker compose push`

For services configured with registry-qualified images:

```bash
docker compose push
```

pushes images to their configured registries where applicable.

---

# 80. `docker compose config`

Example:

```bash
docker compose config
```

This is one of the most useful debugging commands.

It helps reveal:

```text
Resolved Variables
Merged Configuration
Networks
Volumes
Services
```

---

# 81. Compose Application Example

```yaml
services:
  frontend:
    image: mycompany/frontend:1.0.0
    ports:
      - "8080:80"
    depends_on:
      - api

  api:
    image: mycompany/api:1.5.0
    environment:
      DB_HOST: db
      DB_PORT: "5432"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: payments
      POSTGRES_USER: payments
      POSTGRES_PASSWORD: change-me
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U payments -d payments"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db-data:
```

For real production, replace inline credentials with an appropriate secret mechanism.

---

# 82. Application Architecture

```text
                  Host
                   │
              :8080│
                   ▼
              FRONTEND
                   │
                   ▼
                  API
                   │
                   ▼
             PostgreSQL
                   │
                   ▼
               db-data
```

---

# 83. Add Redis

Example:

```yaml
services:
  api:
    image: mycompany/api:1.5.0
    environment:
      REDIS_HOST: redis

  redis:
    image: redis:8
```

The API can connect to:

```text
redis:6379
```

without publishing Redis to the host.

---

# 84. Add Worker

```yaml
services:
  api:
    image: mycompany/api:1.5.0

  worker:
    image: mycompany/api:1.5.0
    command: ["python", "worker.py"]
```

Both can use the same application image with different commands.

---

# 85. Application + Worker + Queue + DB

```text
              API
               │
               ▼
             Redis
               │
               ▼
            Worker
               │
               ▼
              DB
```

This is a common asynchronous architecture.

---

# 86. Reverse Proxy

Add:

```yaml
services:
  proxy:
    image: nginx:1.29
    ports:
      - "80:80"
      - "443:443"
```

Then:

```text
Internet
   │
   ▼
Proxy
   │
   ▼
Frontend/API
```

---

# 87. Frontend/API/DB with Networks

```yaml
services:
  proxy:
    image: nginx:1.29
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

This is a strong basic segmentation pattern.

---

# 88. Compose DNS

Given:

```yaml
services:
  api:
  db:
```

Compose service discovery normally makes:

```text
db
```

resolvable from:

```text
api
```

Avoid:

```text
172.20.0.5
```

in application configuration.

---

# 89. Environment Separation

Example:

```text
compose.yaml
compose.dev.yaml
compose.test.yaml
compose.prod.yaml
```

Use shared configuration where appropriate and environment-specific overrides only where needed.

---

# 90. Development Workflow

Typical:

```text
Edit Code
   │
   ▼
Compose Build / Watch
   │
   ▼
Run Services
   │
   ▼
Test
   │
   ▼
Debug
```

Depending on the project, Compose features such as watch/development workflows may be used.

---

# 91. Hot Reload

A development service may use:

```yaml
volumes:
  - ./src:/app/src
```

and run a development server.

This enables source changes on the host to appear inside the container.

Do not use this pattern automatically in production.

---

# 92. Compose Watch

Modern Docker Compose versions can support development-oriented file synchronization/watch workflows.

Conceptually:

```text
Host Source
    │
    ▼
Compose Watch
    │
    ▼
Container
```

This can reduce the need for broad bind mounts in some development scenarios.

Check the Compose version's supported watch features before relying on them.

---

# 93. Test Environment

Compose is useful for integration tests.

Example:

```text
CI
 │
 ├── API
 ├── DB
 ├── Redis
 └── Mock Services
```

Then:

```bash
docker compose up -d
```

run tests:

```bash
pytest
```

and cleanup:

```bash
docker compose down -v
```

---

# 94. CI/CD Compose Pattern

```text
Git Push
   │
   ▼
CI
   │
   ▼
Build Images
   │
   ▼
Compose Up
   │
   ▼
Integration Tests
   │
   ▼
Scan / Package
   │
   ▼
Push Registry
```

---

# 95. Compose and Image Promotion

Build:

```text
myapi:build-1842
```

Test:

```text
Compose
```

Then promote the exact artifact:

```text
myapi:1.5.0
```

or deploy by digest.

Avoid rebuilding after successful integration testing.

---

# 96. Compose and Registries

Example:

```yaml
services:
  api:
    image: registry.example.com/payments/api:1.5.0
```

CI can:

```bash
docker compose pull
docker compose up -d
```

after authenticating to the registry.

---

# 97. Compose Scaling

Example:

```bash
docker compose up -d --scale worker=3
```

This can run multiple instances of a service.

Do not assume all applications support horizontal scaling safely.

---

# 98. Scaling Constraints

Before scaling:

```text
Is application stateless?
Is session state externalized?
Is shared storage safe?
Can the database handle connections?
Does the queue support multiple workers?
```

---

# 99. Stateless Application Scaling

Ideal:

```text
          Load Balancer
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
     API 1    API 2    API 3
       │        │        │
       └────────┼────────┘
                ▼
        Shared Database
```

Avoid storing session state only inside one container.

---

# 100. Stateful Service Scaling

Databases, brokers, and storage systems often require application-specific clustering.

Do not assume:

```bash
docker compose up --scale db=3
```

creates a highly available database.

It does not automatically configure database replication or consensus.

---

# 101. Compose Dependencies

Typical dependency chain:

```text
Proxy
  │
  ▼
API
  │
  ▼
DB
```

But `depends_on` should not be treated as a complete orchestration system.

Applications should still handle:

```text
Retries
Connection Failures
Startup Delays
Temporary Unavailability
```

---

# 102. Retry Logic

An API should be resilient to:

```text
DB temporarily unavailable
Redis restarting
Network delay
```

Example concept:

```text
Start
 │
 ▼
Connect DB
 │
 X
Retry
 │
 ▼
Connect
```

This is more robust than relying entirely on Compose startup order.

---

# 103. Graceful Shutdown

Containers should handle termination signals properly.

Compose can stop services, but the application must implement graceful shutdown.

Example:

```text
SIGTERM
   │
   ▼
Application
   │
   ├── Stop accepting work
   ├── Finish active work
   └── Close connections
```

---

# 104. `init`

For some workloads, using an init process can help manage child processes and signal behavior.

Example:

```yaml
services:
  worker:
    init: true
```

This is useful for applications that spawn child processes.

---

# 105. Health Check Example for HTTP

Example:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 10s
  timeout: 5s
  retries: 5
```

The image must contain the required command, such as `curl`.

---

# 106. Health Endpoint

A useful application endpoint:

```text
GET /health
```

or:

```text
GET /ready
```

Health semantics should be designed carefully.

---

# 107. Liveness vs Readiness

Conceptually:

```text
Liveness
 └── Is the process functioning?

Readiness
 └── Can it serve traffic now?
```

Compose health checks can help represent service health, but richer liveness/readiness orchestration is typically provided by platforms such as Kubernetes.

---

# 108. Compose and Production

Compose can be useful in:

```text
Development
Testing
Small Deployments
Single-Host Production
Local Integration Environments
```

For large production environments, teams often use:

```text
Kubernetes
ECS
Azure Container Apps
Cloud Run
Nomad
Docker Swarm
Other Orchestrators
```

Choose according to operational requirements.

---

# 109. Compose vs Docker Swarm

Compose:

```text
Application Definition
Single Host / Development
```

Swarm:

```text
Cluster
Multi-Host Services
Scheduling
Overlay Networking
```

Compose files can also be relevant to Swarm workflows, but the deployment semantics are not identical.

---

# 110. Compose vs Kubernetes

Compose:

```text
Simple
Developer Friendly
Local Multi-Container Apps
```

Kubernetes:

```text
Cluster Orchestration
Scheduling
Self-Healing
Services
Ingress
NetworkPolicy
Persistent Volumes
Autoscaling
```

Do not treat Compose YAML as equivalent to Kubernetes manifests.

---

# 111. Compose Security Checklist

```text
[ ] Do not commit secrets
[ ] Avoid privileged containers
[ ] Drop unnecessary capabilities
[ ] Use read-only mounts where possible
[ ] Avoid broad bind mounts
[ ] Do not mount Docker socket unnecessarily
[ ] Publish only required ports
[ ] Keep databases private
[ ] Use trusted images
[ ] Scan images
[ ] Pin production image versions/digests
[ ] Use non-root containers where supported
[ ] Configure resource limits
[ ] Configure log rotation
[ ] Use health checks
```

---

# 112. Compose Networking Checklist

```text
[ ] Use service names for discovery
[ ] Avoid hard-coded container IPs
[ ] Segment frontend/backend networks
[ ] Do not publish internal database ports unnecessarily
[ ] Check network overlap
[ ] Verify DNS
[ ] Verify application listening address
[ ] Use explicit host bindings for sensitive development ports
```

---

# 113. Compose Storage Checklist

```text
[ ] Use named volumes for persistent local data
[ ] Use bind mounts mainly for development or explicit host integration
[ ] Use read-only mounts where possible
[ ] Back up critical volumes
[ ] Test restores
[ ] Monitor disk usage
[ ] Avoid shared-write volumes without application support
[ ] Keep production and development data separate
```

---

# 114. Compose Configuration Checklist

```text
[ ] Use versioned images
[ ] Validate with docker compose config
[ ] Keep environment-specific overrides clear
[ ] Avoid hidden configuration
[ ] Document required variables
[ ] Use profiles for optional services
[ ] Keep Compose files maintainable
[ ] Use `.dockerignore`
[ ] Use secrets for sensitive data
```

---

# 115. Common Compose Anti-Patterns

## Using `latest` Everywhere

```yaml
image: myapi:latest
```

Problem:

```text
Unpredictable Artifact
```

Prefer controlled versioning.

---

## Putting Passwords in YAML

Bad:

```yaml
environment:
  DB_PASSWORD: super-secret
```

Use a secret mechanism instead.

---

# 116. Anti-Pattern: Hard-Coded Container IP

Bad:

```yaml
environment:
  DB_HOST: 172.20.0.5
```

Better:

```yaml
environment:
  DB_HOST: db
```

---

# 117. Anti-Pattern: Publishing Database Ports

Unnecessary:

```yaml
db:
  ports:
    - "5432:5432"
```

if only the API needs database access.

---

# 118. Anti-Pattern: Broad Bind Mounts

Dangerous:

```yaml
volumes:
  - /:/host
```

This exposes the host filesystem.

Use narrowly scoped mounts.

---

# 119. Anti-Pattern: Privileged by Default

Avoid:

```yaml
privileged: true
```

unless the workload explicitly requires elevated host capabilities.

---

# 120. Anti-Pattern: Treating `depends_on` as Readiness

Bad assumption:

```text
DB container started
    =
DB ready
```

Use:

```text
Health Check
+
Application Retry Logic
```

---

# 121. Anti-Pattern: Treating Compose as Full HA

Compose does not automatically provide:

```text
Multi-Host Failover
Consensus
Database Replication
Global Load Balancing
Automatic Cluster Scheduling
```

Choose an orchestrator/platform when those requirements exist.

---

# 122. Anti-Pattern: Data in Container Writable Layer

Bad:

```text
DB
 │
 ▼
Container Writable Layer
```

Better:

```text
DB
 │
 ▼
Persistent Storage
```

---

# 123. Anti-Pattern: One Huge Compose File

A massive file containing:

```text
50+ services
Multiple environments
Multiple teams
```

can become difficult to maintain.

Use clear project boundaries and reusable configuration where appropriate.

---

# 124. Compose Troubleshooting Flow

```text
Application Problem
       │
       ▼
docker compose ps
       │
       ▼
Check Logs
       │
       ▼
docker compose config
       │
       ▼
Check Network
       │
       ▼
Check Environment
       │
       ▼
Check Volumes
       │
       ▼
Check Health
       │
       ▼
Check Application
```

---

# 125. Service Not Starting

Check:

```bash
docker compose ps
docker compose logs service-name
```

Then inspect:

```text
Image
Command
Entrypoint
Environment
Volume
Permissions
Ports
```

---

# 126. Port Already in Use

Example:

```text
Bind for 0.0.0.0:8080 failed: port is already allocated
```

Check:

```bash
docker ps
```

or:

```bash
docker compose ps
```

Then change the host port or stop the conflicting service.

---

# 127. Environment Variable Not Applied

Run:

```bash
docker compose config
```

Check:

```text
Interpolation
env_file
environment
Shell Environment
Override Files
```

Then inspect the container:

```bash
docker compose exec api env
```

---

# 128. Database Connection Failure

Check:

```text
1. DB service running?
2. DB healthy?
3. API and DB on same network?
4. DB_HOST=db?
5. DB_PORT correct?
6. Credentials correct?
7. Database initialized?
```

---

# 129. DNS Troubleshooting

Inside API:

```bash
docker compose exec api getent hosts db
```

If:

```text
db → IP
```

works, DNS is likely functioning.

Then test the database port.

---

# 130. Volume Permission Failure

Check:

```bash
docker compose exec api id
docker compose config
docker inspect ...
```

Verify:

```text
UID
GID
Volume
Mount Path
Read-Only State
```

---

# 131. Health Check Failure

Check:

```bash
docker compose ps
docker compose logs db
```

Then inspect the health command.

Common mistakes:

```text
Command missing
Wrong port
Wrong credentials
Service not ready
Health endpoint incorrect
```

---

# 132. Image Pull Failure

Check:

```text
Registry Login
Repository
Tag
Network
Architecture
Registry Availability
```

Then:

```bash
docker compose pull
```

---

# 133. Build Failure

Check:

```text
Build Context
Dockerfile Path
.dockerignore
Build Arguments
Base Image
Network Access
Dependency Downloads
```

Use:

```bash
docker compose build
```

and inspect the first meaningful error.

---

# 134. Compose Config Validation

Always validate:

```bash
docker compose config
```

before debugging runtime behavior.

This catches many:

```text
YAML Errors
Interpolation Problems
Merge Problems
Missing Values
```

---

# 135. Compose Debugging Commands

Useful commands:

```bash
docker compose config
docker compose ps
docker compose logs
docker compose exec
docker compose top
docker compose images
docker compose port
docker compose events
```

Availability of individual commands depends on Compose version.

---

# 136. Compose Project Cleanup

Development cleanup:

```bash
docker compose down
```

Full project cleanup including named volumes:

```bash
docker compose down -v
```

Be extremely careful with:

```text
-v
```

because persistent data can be deleted.

---

# 137. Compose and CI Cleanup

A CI pipeline can use:

```bash
docker compose down -v --remove-orphans
```

after integration tests when the environment is disposable.

Do not copy this cleanup pattern blindly into production.

---

# 138. Orphan Containers

If Compose files change service definitions, old containers may remain.

Use:

```bash
docker compose down --remove-orphans
```

when appropriate.

---

# 139. Compose Resource Ownership

Compose creates resources associated with the project.

Conceptually:

```text
Project: payments
   │
   ├── payments-api
   ├── payments-db
   ├── payments_default
   └── payments_db-data
```

Naming can vary based on Compose configuration.

---

# 140. Compose Labels

Compose uses labels internally to associate resources with projects and services.

This helps Docker identify:

```text
Project
Service
Container
Network
Volume
```

Do not manually modify internal labels unless you understand the consequences.

---

# 141. Compose Environment Strategy

A mature setup might use:

```text
compose.yaml
compose.dev.yaml
compose.test.yaml
compose.prod.yaml
```

with:

```text
.env.example
```

documenting required variables.

---

# 142. `.env.example`

Example:

```text
APP_ENV=development
IMAGE_TAG=1.5.0
DB_NAME=payments
DB_USER=payments
```

Do not put actual production secrets in this file.

---

# 143. Documentation

A good Compose repository should document:

```text
Prerequisites
How to start
How to stop
Required variables
Ports
Volumes
Services
Health checks
Testing
Troubleshooting
Production limitations
```

---

# 144. Repository Structure

Example:

```text
project/
├── compose.yaml
├── compose.dev.yaml
├── compose.test.yaml
├── .env.example
├── .dockerignore
├── Dockerfile
├── api/
├── frontend/
├── scripts/
└── README.md
```

---

# 145. Compose and Makefile

Some teams wrap commands:

```makefile
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

test:
	docker compose run --rm api pytest
```

This provides a consistent developer interface.

---

# 146. Compose and Task Runners

Alternatives include:

```text
Make
Task
Just
Shell Scripts
CI Pipeline
```

The important principle is consistency and reproducibility.

---

# 147. Production Deployment Pattern

```text
Git
 │
 ▼
CI
 │
 ├── Build
 ├── Test
 ├── Scan
 ├── Sign
 └── Push
 │
 ▼
Registry
 │
 ▼
Deployment Host
 │
 ▼
docker compose pull
 │
 ▼
docker compose up -d
```

For larger environments, replace the deployment host with an orchestrator.

---

# 148. Production Compose Release

Use immutable image references where possible.

Example:

```yaml
services:
  api:
    image: registry.example.com/payments/api:1.5.0
```

For stronger immutability, record and deploy the exact digest associated with the release.

---

# 149. Deployment Verification

After:

```bash
docker compose up -d
```

verify:

```bash
docker compose ps
docker compose logs
```

Then test:

```text
Health
Connectivity
API
Database
External Dependencies
```

---

# 150. Compose Observability

Monitor:

```text
Container Status
CPU
Memory
Network
Disk
Logs
Health
Restart Count
Application Metrics
```

Compose is the application definition; observability still needs appropriate monitoring tools.

---

# 151. Complete Compose Architecture

```text
                         INTERNET
                            │
                            ▼
                      Reverse Proxy
                            │
                      frontend-net
                            │
                            ▼
                    ┌──────────────┐
                    │   Frontend   │
                    └──────┬───────┘
                           │
                           ▼
                         API
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
             Redis                   DB
                │                     │
                │                  db-data
                │                     │
                ▼                     ▼
             Worker              Persistent
                                 Storage
```

---

# 152. Complete Compose Lifecycle

```text
compose.yaml
     │
     ▼
Validate
     │
     ▼
Build / Pull
     │
     ▼
Create Networks
     │
     ▼
Create Volumes
     │
     ▼
Create Containers
     │
     ▼
Start Services
     │
     ▼
Health Checks
     │
     ▼
Application Running
     │
     ▼
Logs / Metrics
     │
     ▼
Stop / Restart
     │
     ▼
Update / Recreate
     │
     ▼
Cleanup
```

---

# 153. Compose Mental Model

```text
                COMPOSE FILE
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
     SERVICES     NETWORKS      VOLUMES
        │            │            │
        ▼            ▼            ▼
    CONTAINERS    DNS / ISOLATION PERSISTENCE
        │
        ├── Environment
        ├── Ports
        ├── Health
        ├── Resources
        ├── Security
        └── Dependencies
```

---

# 154. Production-Ready Compose Principles

```text
1. Keep images immutable and versioned.

2. Avoid latest in production.

3. Prefer image digests for strict reproducibility.

4. Keep secrets outside source control.

5. Use named volumes for persistent local state.

6. Avoid unnecessary published ports.

7. Segment networks.

8. Keep databases private.

9. Add meaningful health checks.

10. Use application retry logic.

11. Avoid privileged containers.

12. Run as non-root where practical.

13. Use read-only filesystems where compatible.

14. Configure resource and process limits.

15. Configure log rotation.

16. Back up persistent data.

17. Test restore procedures.

18. Validate with docker compose config.

19. Keep development and production configuration separate.

20. Use CI/CD to build, scan, sign, and publish images.

21. Deploy the same artifact that was tested.

22. Understand the limitations of single-host Compose.

23. Move to an orchestrator when multi-host HA, scheduling, or autoscaling becomes a requirement.
```

---

# 155. Interview Questions

## Beginner

### What is Docker Compose?

A declarative tool for defining and running multi-container applications.

### What file does Compose use?

Common modern names are `compose.yaml` or `compose.yml`.

### What is a Compose service?

A declarative definition of a containerized workload.

### What does `docker compose up` do?

It creates/recreates and starts the services defined by the Compose application as needed.

### What does `docker compose down` do?

It stops and removes Compose-managed containers and networks for the project.

---

## Intermediate

### How do services communicate in Compose?

They normally communicate over a Compose-managed network using service names through Docker DNS.

### What is `depends_on`?

A mechanism for expressing service dependencies and, with supported conditions, startup/health relationships.

### Does `depends_on` guarantee application readiness?

No. Use health checks and application retry logic.

### How do you persist database data?

Use a named volume or suitable external persistent storage.

### How do you expose a service?

Use the `ports` section.

### Can services communicate without published ports?

Yes. Services on the same Docker network can communicate internally.

---

## Advanced

### Why use multiple Compose networks?

To segment communication between tiers.

### What is the difference between `environment` and `env_file`?

Both provide environment variables, but `environment` defines values directly in the Compose file while `env_file` loads variables from a file.

### Why should secrets not be stored in `.env`?

`.env` is configuration convenience, not a secure secret-management system.

### What is the purpose of `docker compose config`?

To inspect the effective Compose configuration after interpolation and supported file merging.

### Why is Compose not equivalent to Kubernetes?

Compose primarily defines and runs multi-container applications, often on a single host; Kubernetes provides cluster orchestration, scheduling, service discovery, health management, scaling, and more.

### Does `docker compose --scale db=3` create a highly available database?

No. Scaling containers does not automatically configure database replication or consensus.

---

# 156. Final Key Takeaways

Remember:

```text
1. Compose defines multi-container applications declaratively.

2. Services are the primary building blocks.

3. Service names provide stable internal discovery.

4. Compose normally creates a project network.

5. Containers on the same network can communicate without publishing ports.

6. ports controls host-to-container exposure.

7. volumes provide persistent storage.

8. bind mounts are especially useful for development and explicit host integration.

9. secrets should be used for sensitive values where supported.

10. .env is configuration convenience, not a complete secret-management solution.

11. depends_on expresses dependency but should not replace application retry logic.

12. Health checks indicate service health.

13. Restart policies and health checks solve different problems.

14. profiles allow optional services such as debugging tools.

15. Multiple Compose files can separate development, testing, and production configuration.

16. docker compose config is one of the most valuable troubleshooting commands.

17. docker compose up creates/recreates and starts the stack.

18. docker compose down removes project containers and networks.

19. docker compose down -v can remove persistent volumes and is destructive.

20. Compose is excellent for local development and integration testing.

21. Compose can also support small/single-host production workloads.

22. Large multi-host production environments often require orchestration platforms.

23. Do not use latest as an uncontrolled production release identifier.

24. Prefer immutable image versions and digests.

25. Keep databases private unless external access is explicitly required.

26. Segment frontend, backend, and data networks.

27. Do not commit credentials.

28. Avoid privileged containers and broad host mounts.

29. Use resource and logging controls.

30. Back up persistent data.

31. Test restores.

32. Build once and deploy the same tested artifact.

33. Treat Compose as an application definition, not as a complete HA platform.
```

The core principle is:

```text
                  COMPOSE
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
     SERVICES     NETWORKS      VOLUMES
        │            │            │
        ▼            ▼            ▼
   CONTAINERS       DNS        PERSISTENCE
        │
        ├── Config
        ├── Secrets
        ├── Health
        ├── Resources
        └── Security
```

> **Docker Compose turns a collection of containers into a reproducible application stack. The real value is not simply starting multiple containers—it is defining their networking, storage, configuration, health, dependencies, security, and lifecycle in a consistent way.**

---

# 157. Related Knowledge

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
