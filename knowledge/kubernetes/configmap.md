# Kubernetes ConfigMap

## 1. Overview

A **ConfigMap** is a Kubernetes API object used to store **non-confidential configuration data** separately from application code and container images.

ConfigMaps allow applications to consume configuration values without rebuilding or modifying the container image.

Typical configuration stored in a ConfigMap includes:

* Application settings
* Environment-specific values
* Configuration files
* Feature flags
* URLs and endpoints
* Log levels
* Command-line arguments
* Application properties

> **Important:** ConfigMaps are intended for non-sensitive data. Passwords, API keys, tokens, certificates, and other confidential information should be stored in a **Kubernetes Secret** instead.

---

## 2. Why Use ConfigMaps?

Without ConfigMaps, configuration is often hard-coded into:

* Application source code
* Dockerfiles
* Container images
* Deployment manifests

This creates unnecessary coupling between application code and environment-specific configuration.

For example, an application might require different API endpoints:

```text
Development:
https://dev-api.example.com

Testing:
https://test-api.example.com

Production:
https://api.example.com
```

Instead of creating three different container images, the same image can be deployed to all environments while the configuration is supplied through ConfigMaps.

### Benefits

* Separates configuration from application code
* Allows the same container image to be reused
* Makes environment-specific configuration easier
* Simplifies application deployment
* Supports configuration through environment variables
* Supports configuration files
* Makes Kubernetes manifests more maintainable

---

# 3. ConfigMap Structure

A basic ConfigMap looks like this:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: application-config
data:
  APP_NAME: "my-application"
  ENVIRONMENT: "production"
  LOG_LEVEL: "info"
```

### Important Fields

| Field                | Description                                  |
| -------------------- | -------------------------------------------- |
| `apiVersion`         | Kubernetes API version                       |
| `kind`               | Object type; for ConfigMap it is `ConfigMap` |
| `metadata.name`      | Name of the ConfigMap                        |
| `metadata.namespace` | Namespace where the ConfigMap exists         |
| `data`               | Key-value configuration data                 |
| `binaryData`         | Binary configuration data                    |

---

# 4. Creating a ConfigMap

There are several ways to create a ConfigMap.

## 4.1 Using a YAML Manifest

Create a file named:

```text
configmap.yaml
```

Example:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_NAME: "Kubernetes Application"
  ENVIRONMENT: "production"
  LOG_LEVEL: "info"
  SERVER_PORT: "8080"
```

Apply it:

```bash
kubectl apply -f configmap.yaml
```

Verify:

```bash
kubectl get configmap
```

or:

```bash
kubectl get cm
```

---

# 5. Viewing a ConfigMap

List ConfigMaps:

```bash
kubectl get configmaps
```

Get details:

```bash
kubectl describe configmap app-config
```

Display the complete object:

```bash
kubectl get configmap app-config -o yaml
```

---

# 6. Creating ConfigMap Using kubectl

ConfigMaps can also be created directly from the command line.

## 6.1 From Literal Values

```bash
kubectl create configmap app-config \
  --from-literal=APP_NAME="My Application" \
  --from-literal=ENVIRONMENT="production" \
  --from-literal=LOG_LEVEL="info"
```

Verify:

```bash
kubectl get configmap app-config -o yaml
```

---

# 7. Creating ConfigMap From a File

Suppose we have:

```text
application.properties
```

with:

```properties
application.name=myapp
application.environment=production
application.log.level=info
```

Create the ConfigMap:

```bash
kubectl create configmap app-config \
  --from-file=application.properties
```

The resulting ConfigMap stores the file content as a key.

You can verify it using:

```bash
kubectl get configmap app-config -o yaml
```

---

# 8. Creating ConfigMap From an Environment File

Suppose we have:

```text
app.env
```

containing:

```text
APP_NAME=myapp
ENVIRONMENT=production
LOG_LEVEL=info
SERVER_PORT=8080
```

Create the ConfigMap:

```bash
kubectl create configmap app-config \
  --from-env-file=app.env
```

This creates individual key-value entries.

---

# 9. Using ConfigMap as Environment Variables

One of the most common ways to consume a ConfigMap is through environment variables.

Example ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_NAME: "myapp"
  ENVIRONMENT: "production"
  LOG_LEVEL: "info"
```

Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp

  template:
    metadata:
      labels:
        app: myapp

    spec:
      containers:
        - name: myapp
          image: nginx:latest

          env:
            - name: APP_NAME
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: APP_NAME

            - name: ENVIRONMENT
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: ENVIRONMENT

            - name: LOG_LEVEL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: LOG_LEVEL
```

Inside the container, the application can access:

```bash
echo $APP_NAME
echo $ENVIRONMENT
echo $LOG_LEVEL
```

---

# 10. Import All ConfigMap Values as Environment Variables

Instead of defining every environment variable individually, use:

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

Example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 2

  selector:
    matchLabels:
      app: myapp

  template:
    metadata:
      labels:
        app: myapp

    spec:
      containers:
        - name: myapp
          image: nginx:latest

          envFrom:
            - configMapRef:
                name: app-config
```

Every key in the ConfigMap becomes an environment variable.

For example:

```text
APP_NAME
ENVIRONMENT
LOG_LEVEL
SERVER_PORT
```

---

# 11. Using ConfigMap as a Volume

ConfigMaps can also be mounted as files inside a container.

Example:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  application.properties: |
    application.name=myapp
    application.environment=production
    application.log.level=info
```

Mount it in a Pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: configmap-pod
spec:
  containers:
    - name: application
      image: nginx:latest

      volumeMounts:
        - name: config-volume
          mountPath: /etc/app-config

  volumes:
    - name: config-volume
      configMap:
        name: app-config
```

The file will be available inside the container under:

```text
/etc/app-config/application.properties
```

---

# 12. ConfigMap With Multiple Configuration Files

A ConfigMap can contain multiple files.

Example:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: application-config
data:
  application.properties: |
    server.port=8080
    application.name=myapp

  logging.properties: |
    logging.level=INFO

  feature-flags.properties: |
    feature.new-ui=true
    feature.payment-v2=false
```

When mounted as a volume:

```text
/etc/config/
├── application.properties
├── logging.properties
└── feature-flags.properties
```

---

# 13. Mounting a Specific ConfigMap Key

Sometimes you don't want every ConfigMap key to become a file.

You can select specific keys using `items`.

```yaml
volumes:
  - name: config-volume
    configMap:
      name: app-config
      items:
        - key: application.properties
          path: application.properties
```

This gives you more control over which configuration files are mounted.

---

# 14. ConfigMap With `subPath`

A ConfigMap file can also be mounted at a specific file path.

Example:

```yaml
volumeMounts:
  - name: config-volume
    mountPath: /etc/myapp/application.properties
    subPath: application.properties
```

Volume:

```yaml
volumes:
  - name: config-volume
    configMap:
      name: app-config
```

This approach is useful when an application expects configuration at a specific path.

> **Important:** ConfigMap updates are not automatically reflected in a container when a ConfigMap key is mounted using `subPath`.

---

# 15. ConfigMap and Namespaces

ConfigMaps are **namespaced resources**.

For example:

```bash
kubectl create configmap app-config \
  --from-literal=ENVIRONMENT=production \
  -n production
```

Check ConfigMaps in a namespace:

```bash
kubectl get configmaps -n production
```

Get a specific ConfigMap:

```bash
kubectl get configmap app-config -n production
```

A Pod in another namespace cannot directly reference this ConfigMap.

---

# 16. ConfigMap and Deployment

A common Kubernetes architecture looks like:

```text
                ┌─────────────────────┐
                │     ConfigMap       │
                │                     │
                │ APP_NAME            │
                │ LOG_LEVEL           │
                │ API_URL             │
                └──────────┬──────────┘
                           │
                           │
                           ▼
                ┌─────────────────────┐
                │     Deployment      │
                │                     │
                │      ReplicaSet     │
                └──────────┬──────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │      Pods      │
                  │                │
                  │  Application   │
                  └────────────────┘
```

The Deployment references the ConfigMap and Kubernetes makes the configuration available to the container.

---

# 17. Updating a ConfigMap

Edit a ConfigMap:

```bash
kubectl edit configmap app-config
```

Alternatively, modify the YAML file and apply it again:

```bash
kubectl apply -f configmap.yaml
```

Verify:

```bash
kubectl get configmap app-config -o yaml
```

---

# 18. ConfigMap Update Behavior

How an application receives an updated ConfigMap depends on how it consumes the ConfigMap.

### Environment Variables

If ConfigMap values are injected as environment variables:

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

existing containers **do not automatically receive updated environment variables**.

The Pod generally needs to be recreated.

For example:

```bash
kubectl rollout restart deployment myapp
```

### Mounted Volume

When a ConfigMap is mounted as a volume, Kubernetes can update the mounted files after the ConfigMap changes.

However:

* Applications may need to reload the file.
* The update is not necessarily instantaneous.
* `subPath` mounts do not receive ConfigMap updates automatically.

---

# 19. ConfigMap Immutability

Kubernetes supports immutable ConfigMaps.

Example:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
immutable: true

data:
  APP_NAME: "myapp"
  ENVIRONMENT: "production"
```

Once created, the data cannot be changed.

To change it, you must create a new ConfigMap.

### Why Use Immutable ConfigMaps?

Benefits include:

* Prevents accidental modification
* Improves configuration consistency
* Reduces risk of unexpected application behavior
* Useful for production environments
* Helps ensure Pods reference a stable configuration

---

# 20. ConfigMap Size Limit

ConfigMaps are not intended for storing large amounts of data.

Kubernetes documents a maximum size of approximately **1 MiB** for a ConfigMap.

For large configuration files, consider alternatives such as:

* Object storage
* External configuration systems
* Persistent volumes
* Application-specific configuration services

---

# 21. ConfigMap vs Secret

ConfigMap and Secret serve different purposes.

| Feature               | ConfigMap                   | Secret                |
| --------------------- | --------------------------- | --------------------- |
| Purpose               | Non-sensitive configuration | Sensitive information |
| Passwords             | ❌ No                        | ✅ Yes                 |
| API tokens            | ❌ No                        | ✅ Yes                 |
| URLs                  | ✅ Yes                       | Sometimes             |
| Log level             | ✅ Yes                       | ❌ Usually unnecessary |
| Feature flags         | ✅ Yes                       | ❌ Usually unnecessary |
| Configuration files   | ✅ Yes                       | ✅ If sensitive        |
| Environment variables | ✅ Yes                       | ✅ Yes                 |

Example:

```text
ConfigMap
   ├── APP_NAME
   ├── LOG_LEVEL
   ├── API_URL
   └── FEATURE_FLAG

Secret
   ├── DATABASE_USERNAME
   ├── DATABASE_PASSWORD
   ├── API_TOKEN
   └── TLS_PRIVATE_KEY
```

> **Rule:** If disclosure of the value could compromise security, don't put it in a ConfigMap.

---

# 22. ConfigMap vs Hard-Coded Configuration

### Without ConfigMap

```text
Docker Image
     │
     ├── Application
     └── Production Configuration
```

Changing the configuration may require rebuilding the image.

### With ConfigMap

```text
Docker Image
     │
     └── Application

ConfigMap
     │
     └── Environment-specific Configuration
```

The same image can be deployed to multiple environments.

```text
                 Same Docker Image
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Dev CM       Test CM      Prod CM
          │            │            │
          ▼            ▼            ▼
       Dev Pod      Test Pod      Prod Pod
```

---

# 23. ConfigMap Best Practices

## 23.1 Don't Store Secrets

Avoid:

```yaml
data:
  DB_PASSWORD: "SuperSecretPassword"
```

Use a Secret instead.

---

## 23.2 Use Meaningful Names

Prefer:

```text
payment-service-config
```

instead of:

```text
config1
```

---

## 23.3 Keep Configuration Environment-Specific

For example:

```text
payment-service-config-dev
payment-service-config-test
payment-service-config-prod
```

or use separate namespaces with the same ConfigMap name.

---

## 23.4 Avoid Excessive Configuration

ConfigMaps should contain configuration required by applications.

Avoid turning them into a general-purpose data store.

---

## 23.5 Consider Immutable ConfigMaps

For stable production configurations:

```yaml
immutable: true
```

can help prevent accidental changes.

---

## 23.6 Use Versioned Configuration When Appropriate

For important production deployments, versioned names can make configuration changes more controlled.

Example:

```text
payment-config-v1
payment-config-v2
payment-config-v3
```

Deployments can explicitly reference the required version.

---

# 24. Troubleshooting ConfigMaps

## Check Whether the ConfigMap Exists

```bash
kubectl get configmap app-config
```

If it is in another namespace:

```bash
kubectl get configmap app-config -n production
```

---

## Check ConfigMap Contents

```bash
kubectl describe configmap app-config
```

or:

```bash
kubectl get configmap app-config -o yaml
```

---

## Check Pod Environment Variables

```bash
kubectl exec -it <pod-name> -- env
```

Filter a specific variable:

```bash
kubectl exec -it <pod-name> -- env | grep APP_NAME
```

---

## Check Mounted Configuration

```bash
kubectl exec -it <pod-name> -- ls -l /etc/app-config
```

Read the file:

```bash
kubectl exec -it <pod-name> -- cat /etc/app-config/application.properties
```

---

# 25. Common Problems

### Problem 1: ConfigMap Not Found

Error:

```text
configmap "app-config" not found
```

Possible causes:

* ConfigMap doesn't exist.
* ConfigMap is in another namespace.
* ConfigMap name is incorrect.

Check:

```bash
kubectl get configmaps
kubectl get configmap app-config -n <namespace>
```

---

### Problem 2: Environment Variable Is Missing

Check the Deployment:

```bash
kubectl get deployment myapp -o yaml
```

Verify:

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

Then inspect the Pod:

```bash
kubectl exec -it <pod-name> -- env
```

---

### Problem 3: Configuration File Is Missing

Check the volume:

```bash
kubectl describe pod <pod-name>
```

Verify:

```yaml
volumes:
  - name: config-volume
    configMap:
      name: app-config
```

Also verify the mount:

```yaml
volumeMounts:
  - name: config-volume
    mountPath: /etc/app-config
```

---

### Problem 4: Updated Configuration Is Not Visible

Determine how the ConfigMap is consumed.

If it is an environment variable:

```yaml
envFrom:
```

restart the workload:

```bash
kubectl rollout restart deployment myapp
```

If it is a volume mount, check the mounted file and whether the application reloads configuration.

---

# 26. Useful kubectl Commands

| Command                                                 | Purpose              |
| ------------------------------------------------------- | -------------------- |
| `kubectl get configmaps`                                | List ConfigMaps      |
| `kubectl get cm`                                        | Short form           |
| `kubectl get cm app-config`                             | Get a ConfigMap      |
| `kubectl get cm app-config -o yaml`                     | Display YAML         |
| `kubectl describe cm app-config`                        | Show details         |
| `kubectl create cm app-config --from-literal=KEY=VALUE` | Create from literal  |
| `kubectl create cm app-config --from-file=config.txt`   | Create from file     |
| `kubectl create cm app-config --from-env-file=.env`     | Create from env file |
| `kubectl edit cm app-config`                            | Edit ConfigMap       |
| `kubectl delete cm app-config`                          | Delete ConfigMap     |

---

# 27. Complete Example

## ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webapp-config
data:
  APP_NAME: "Web Application"
  ENVIRONMENT: "production"
  LOG_LEVEL: "info"
  API_URL: "https://api.example.com"
```

Apply:

```bash
kubectl apply -f configmap.yaml
```

## Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 2

  selector:
    matchLabels:
      app: webapp

  template:
    metadata:
      labels:
        app: webapp

    spec:
      containers:
        - name: webapp
          image: nginx:latest

          envFrom:
            - configMapRef:
                name: webapp-config
```

Apply:

```bash
kubectl apply -f deployment.yaml
```

Verify:

```bash
kubectl get pods
```

Find the Pod:

```bash
kubectl get pods -l app=webapp
```

Check configuration:

```bash
kubectl exec -it <pod-name> -- env
```

---

# 28. Configuration Flow

The overall flow is:

```text
             ┌───────────────────────┐
             │      ConfigMap        │
             │                       │
             │ APP_NAME              │
             │ ENVIRONMENT           │
             │ LOG_LEVEL             │
             │ API_URL               │
             └───────────┬───────────┘
                         │
                         │ Reference
                         ▼
             ┌───────────────────────┐
             │      Deployment       │
             │                       │
             │   envFrom / volume    │
             └───────────┬───────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │     Pod      │
                  │              │
                  │ Application  │
                  └──────────────┘
```

---

# 29. Production Considerations

Before using ConfigMaps in production, consider:

* Keep secrets out of ConfigMaps.
* Use namespaces to separate environments.
* Use meaningful ConfigMap names.
* Review RBAC permissions for ConfigMaps.
* Avoid storing very large configuration files.
* Consider immutable ConfigMaps for stable configuration.
* Use GitOps/IaC to manage ConfigMap manifests.
* Avoid manually editing production ConfigMaps where possible.
* Have a controlled rollout strategy for configuration changes.
* Make applications capable of safely reloading configuration when required.
* Consider versioning configuration for critical workloads.

---

# 30. Interview Questions

### What is a ConfigMap?

A ConfigMap is a Kubernetes API object used to store non-confidential configuration data separately from application code and container images.

### Can ConfigMaps store passwords?

They technically can store arbitrary key-value data, but **they should not be used for passwords or other sensitive information**. Kubernetes Secrets are intended for that purpose.

### How can a Pod consume a ConfigMap?

A Pod can consume a ConfigMap through:

1. Individual environment variables
2. All keys using `envFrom`
3. Mounted volumes
4. Configuration files

### Are ConfigMaps namespace-specific?

Yes. ConfigMaps are namespaced Kubernetes resources.

### What happens when a ConfigMap changes?

The behavior depends on how the ConfigMap is consumed. Environment variables already present in running containers do not automatically change. Volume-mounted ConfigMap data can be updated by Kubernetes, subject to the mounting method and application behavior.

### What is the difference between ConfigMap and Secret?

ConfigMaps are intended for non-sensitive configuration, while Secrets are intended for sensitive data such as passwords, tokens, and keys.

### Can a ConfigMap be immutable?

Yes. Kubernetes supports:

```yaml
immutable: true
```

### What is `envFrom`?

`envFrom` imports all key-value pairs from a ConfigMap as environment variables.

Example:

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

### What is `configMapKeyRef`?

`configMapKeyRef` imports a specific key from a ConfigMap.

Example:

```yaml
env:
  - name: LOG_LEVEL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: LOG_LEVEL
```

---

# 31. Quick Reference

```text
ConfigMap
│
├── Purpose
│   └── Store non-sensitive configuration
│
├── Creation
│   ├── YAML
│   ├── --from-literal
│   ├── --from-file
│   └── --from-env-file
│
├── Consumption
│   ├── env
│   ├── envFrom
│   └── Volume Mount
│
├── Configuration
│   ├── Key-value pairs
│   └── Configuration files
│
├── Scope
│   └── Namespace
│
├── Security
│   └── Do not store secrets
│
└── Management
    ├── kubectl
    ├── YAML
    ├── GitOps
    └── Kubernetes API
```

---

# 32. Summary

A **Kubernetes ConfigMap** provides a clean way to separate application configuration from application code and container images.

The most common patterns are:

```yaml
# Specific environment variable
env:
  - name: LOG_LEVEL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: LOG_LEVEL
```

```yaml
# Import all ConfigMap values
envFrom:
  - configMapRef:
      name: app-config
```

```yaml
# Mount ConfigMap as files
volumes:
  - name: config-volume
    configMap:
      name: app-config
```

The key principle is:

> **Use ConfigMaps for non-sensitive configuration and Secrets for sensitive information.**

ConfigMaps are an essential Kubernetes building block for creating portable, environment-independent applications and maintaining clean separation between application code and deployment configuration.
