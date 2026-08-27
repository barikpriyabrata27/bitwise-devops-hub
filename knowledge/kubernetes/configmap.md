# Kubernetes ConfigMap

A **ConfigMap** is a Kubernetes API object used to store and manage **non-confidential configuration data** separately from application code and container images.

The main purpose of a ConfigMap is to allow the same application image to run in different environments with different configurations.

> **Build the application once, configure it differently for each environment.**

---

## Table of Contents

- [1. What is a ConfigMap?](#1-what-is-a-configmap)
- [2. Why Do We Need ConfigMaps?](#2-why-do-we-need-configmaps)
- [3. ConfigMap Architecture](#3-configmap-architecture)
- [4. What Can Be Stored in a ConfigMap?](#4-what-can-be-stored-in-a-configmap)
- [5. ConfigMap vs Secret](#5-configmap-vs-secret)
- [6. ConfigMap YAML Structure](#6-configmap-yaml-structure)
- [7. Creating a ConfigMap](#7-creating-a-configmap)
- [8. Using ConfigMap as Environment Variables](#8-using-configmap-as-environment-variables)
- [9. Using envFrom](#9-using-envfrom)
- [10. Using ConfigMap as a Volume](#10-using-configmap-as-a-volume)
- [11. ConfigMap with Multiple Files](#11-configmap-with-multiple-files)
- [12. Creating ConfigMap from a File](#12-creating-configmap-from-a-file)
- [13. Creating ConfigMap from a Directory](#13-creating-configmap-from-a-directory)
- [14. Creating ConfigMap from an Environment File](#14-creating-configmap-from-an-environment-file)
- [15. ConfigMap Namespaces](#15-configmap-namespaces)
- [16. Updating a ConfigMap](#16-updating-a-configmap)
- [17. ConfigMap and Environment Variable Updates](#17-configmap-and-environment-variable-updates)
- [18. ConfigMap Volume Updates](#18-configmap-volume-updates)
- [19. Immutable ConfigMap](#19-immutable-configmap)
- [20. ConfigMap Size Limit](#20-configmap-size-limit)
- [21. data and binaryData](#21-data-and-binarydata)
- [22. ConfigMap with Deployment](#22-configmap-with-deployment)
- [23. Complete Example](#23-complete-example)
- [24. Common Mistakes](#24-common-mistakes)
- [25. Best Practices](#25-best-practices)
- [26. Troubleshooting](#26-troubleshooting)
- [27. Useful kubectl Commands](#27-useful-kubectl-commands)
- [28. Interview Questions](#28-interview-questions)
- [29. ConfigMap Mental Model](#29-configmap-mental-model)
- [30. Summary](#30-summary)

---

# 1. What is a ConfigMap?

A ConfigMap is a Kubernetes object that stores **non-sensitive configuration information**.

For example:

```text
APP_ENV=production
LOG_LEVEL=info
DATABASE_HOST=postgres
DATABASE_PORT=5432
API_URL=https://api.example.com
