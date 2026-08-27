# Kubernetes Knowledge Hub

A structured, practical Kubernetes knowledge base covering Kubernetes fundamentals, architecture, workloads, networking, storage, security, operations, troubleshooting, and production concepts.

---

## 📚 Contents

### 1. Kubernetes Fundamentals

| Topic | File | Description |
|---|---|---|
| Kubernetes Fundamentals | [`kubernetes-fundamentals.md`](./kubernetes-fundamentals.md) | Core Kubernetes concepts, architecture, objects, declarative configuration, reconciliation, and the Kubernetes API |
| Cluster | [`cluster.md`](./cluster.md) | Kubernetes cluster architecture, control plane, worker nodes, desired state, reconciliation, and cluster components |
| Control Plane | [`control-plane.md`](./control-plane.md) | API Server, etcd, Scheduler, Controller Manager, and other control-plane components |
| Worker Node | [`worker-node.md`](./worker-node.md) | Worker-node architecture, kubelet, container runtime, kube-proxy, and node lifecycle |
| Container | [`container.md`](./container.md) | Containers in Kubernetes, container lifecycle, images, runtimes, and container configuration |

---

### 2. Kubernetes Workloads

| Topic | File | Description |
|---|---|---|
| Pod | [`pod.md`](./pod.md) | Smallest deployable Kubernetes unit, pod lifecycle, multi-container pods, networking, and configuration |
| ReplicaSet | [`replicaset.md`](./replicaset.md) | Maintaining the desired number of pod replicas and supporting application availability |
| Deployment | [`deployment.md`](./deployment.md) | Declarative application deployments, rolling updates, rollbacks, scaling, and deployment strategies |
| StatefulSet | [`statefulset.md`](./statefulset.md) | Managing stateful applications with stable identities, storage, and ordered deployment |
| DaemonSet | [`daemonset.md`](./daemonset.md) | Running one pod on every eligible node and common DaemonSet use cases |
| Job & CronJob | [`job-cronjob.md`](./job-cronjob.md) | Running one-time and scheduled batch workloads |

---

### 3. Kubernetes Configuration

| Topic | File | Description |
|---|---|---|
| ConfigMap | [`configmap.md`](./configmap.md) | Managing non-sensitive application configuration |
| Secret | [`secret.md`](./secret.md) | Managing sensitive configuration such as passwords, tokens, and certificates |
| Resource Requests & Limits | [`resource-requests-limits.md`](./resource-requests-limits.md) | CPU/memory requests, limits, scheduling, QoS, and resource management |
| Probes | [`probes.md`](./probes.md) | Liveness, readiness, and startup probes for application health management |
| Namespace | [`namespace.md`](./namespace.md) | Logical isolation, resource organization, and multi-team/multi-environment Kubernetes usage |

---

### 4. Kubernetes Networking

| Topic | File | Description |
|---|---|---|
| Kubernetes Networking | [`kubernetes-networking.md`](./kubernetes-networking.md) | Pod networking, Services, DNS, CNI, network communication, and network architecture |
| Service | [`service.md`](./service.md) | Exposing applications using ClusterIP, NodePort, LoadBalancer, and related service concepts |
| Ingress | [`ingress.md`](./ingress.md) | HTTP/HTTPS routing, ingress controllers, host/path-based routing, and external access |

---

### 5. Kubernetes Storage

| Topic | File | Description |
|---|---|---|
| Kubernetes Storage | [`kubernetes-storage.md`](./kubernetes-storage.md) | Kubernetes storage architecture and persistent data management |
| Volume | [`volume.md`](./volume.md) | Pod volumes and different Kubernetes volume types |
| PersistentVolumeClaim | [`pvc.md`](./pvc.md) | Persistent storage requests, PersistentVolumes, StorageClasses, and dynamic provisioning |

---

### 6. Kubernetes Security

| Topic | File | Description |
|---|---|---|
| Kubernetes Security | [`kubernetes-security.md`](./kubernetes-security.md) | Kubernetes security architecture, authentication, authorization, RBAC, secrets, pod security, and network security |

---

### 7. Kubernetes Operations

| Topic | File | Description |
|---|---|---|
| Kubernetes Operations | [`kubernetes-operations.md`](./kubernetes-operations.md) | Day-to-day cluster administration, deployments, scaling, upgrades, maintenance, and operational practices |
| Kubernetes Troubleshooting | [`kubernetes-troubleshooting.md`](./kubernetes-troubleshooting.md) | Systematic troubleshooting of pods, nodes, deployments, networking, storage, and cluster issues |

---

# 🏗️ Kubernetes Architecture

A Kubernetes environment can be broadly divided into two major areas:

```text
                    Kubernetes Cluster
                           |
            +--------------+--------------+
            |                             |
       Control Plane                  Worker Nodes
            |                             |
    +-------+-------+              +------+------+
    |       |       |              |             |
 API     Scheduler Controllers    Kubelet    Container
Server                  Manager                 Runtime
    |                                   |
  etcd                              Pods
