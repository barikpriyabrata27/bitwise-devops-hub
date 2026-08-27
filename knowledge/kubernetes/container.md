# Kubernetes Container

A **container** is the runtime unit inside a Kubernetes Pod that actually runs an application process.

Kubernetes does not normally manage containers directly. Instead, Kubernetes manages **Pods**, and Pods contain one or more containers.

> **Pod is the Kubernetes workload unit; Container is the process execution unit inside the Pod.**

---

# Table of Contents

- [1. What is a Container?](#1-what-is-a-container)
- [2. Container vs Pod](#2-container-vs-pod)
- [3. Container Architecture](#3-container-architecture)
- [4. How Kubernetes Runs a Container](#4-how-kubernetes-runs-a-container)
- [5. Container Image](#5-container-image)
- [6. Container Runtime](#6-container-runtime)
- [7. Container Lifecycle](#7-container-lifecycle)
- [8. Container States](#8-container-states)
- [9. Container Specification](#9-container-specification)
- [10. Basic Container Example](#10-basic-container-example)
- [11. Container Image Configuration](#11-container-image-configuration)
- [12. Image Pull Policy](#12-image-pull-policy)
- [13. Container Ports](#13-container-ports)
- [14. Environment Variables](#14-environment-variables)
- [15. ConfigMap and Containers](#15-configmap-and-containers)
- [16. Secret and Containers](#16-secret-and-containers)
- [17. Container Commands](#17-container-commands)
- [18. Command vs Args](#18-command-vs-args)
- [19. Container Resources](#19-container-resources)
- [20. Container Probes](#20-container-probes)
- [21. Container Security Context](#21-container-security-context)
- [22. Container Filesystem](#22-container-filesystem)
- [23. Container Volumes](#23-container-volumes)
- [24. Container Networking](#24-container-networking)
- [25. Multiple Containers in a Pod](#25-multiple-containers-in-a-pod)
- [26. Sidecar Pattern](#26-sidecar-pattern)
- [27. Init Containers](#27-init-containers)
- [28. Container Restart Policy](#28-container-restart-policy)
- [29. Container Lifecycle Hooks](#29-container-lifecycle-hooks)
- [30. Container Logging](#30-container-logging)
- [31. Container Security Best Practices](#31-container-security-best-practices)
- [32. Container Resource Best Practices](#32-container-resource-best-practices)
- [33. Troubleshooting Containers](#33-troubleshooting-containers)
- [34. Useful kubectl Commands](#34-useful-kubectl-commands)
- [35. Container vs Virtual Machine](#35-container-vs-virtual-machine)
- [36. Container vs Image](#36-container-vs-image)
- [37. Interview Questions](#37-interview-questions)
- [38. Container Mental Model](#38-container-mental-model)
- [39. Summary](#39-summary)

---

# 1. What is a Container?

A container is an isolated execution environment that packages and runs an application process along with its required runtime dependencies.

For example:

```text
Application
    |
    +-- Application Code
    +-- Runtime
    +-- Libraries
    +-- Dependencies
    +-- Configuration
