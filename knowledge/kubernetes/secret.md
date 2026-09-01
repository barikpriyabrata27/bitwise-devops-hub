# Kubernetes Secrets --- Complete Study & Reference Guide

> A comprehensive practical guide to Kubernetes Secrets: types,
> creation, YAML, encoding, mounting, environment variables,
> `stringData`, security, RBAC, ServiceAccounts, image pull secrets,
> TLS, Docker registry credentials, rotation, updates, immutable
> Secrets, troubleshooting, production best practices, hands-on labs,
> and interview questions.

------------------------------------------------------------------------

# 1. What Is a Kubernetes Secret?

A Kubernetes **Secret** is an API object used to store small amounts of
sensitive data such as:

-   passwords
-   API keys
-   tokens
-   SSH keys
-   TLS certificates
-   registry credentials
-   application credentials

Example:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  username: YWRtaW4=
  password: c2VjcmV0
```

The important mental model is:

``` text
Secret
   |
   +--> stored in Kubernetes API
   |
   +--> Pod consumes Secret
           |
           +--> environment variable
           |
           +--> mounted file
           |
           +--> imagePullSecrets
           |
           +--> ServiceAccount reference
```

------------------------------------------------------------------------

# 2. Why Use Secrets?

Applications frequently need credentials.

Without a Secret, people may be tempted to put credentials directly
into:

``` yaml
Deployment
ConfigMap
source code
Dockerfile
Git repository
shell scripts
```

That creates security and operational problems.

Instead:

``` text
Application configuration
        |
        +--> ConfigMap for non-sensitive values
        |
        +--> Secret for sensitive values
```

------------------------------------------------------------------------

# 3. Secret vs ConfigMap

This is one of the most important Kubernetes distinctions.

  Feature                 Secret                   ConfigMap
  ----------------------- ------------------------ -----------------------------
  Intended for            Sensitive data           Non-sensitive configuration
  Example                 Password                 Application mode
  API keys                Yes                      No
  TLS credentials         Yes                      No
  Environment variables   Yes                      Yes
  Volume mounting         Yes                      Yes
  Base64 representation   Common                   No
  Encryption at rest      Can be configured        Usually not sensitive
  Security controls       RBAC, encryption, etc.   RBAC, etc.

Important:

> **A Secret is not automatically secure just because it is called a
> Secret.**

------------------------------------------------------------------------

# 4. Base64 Is Not Encryption

This is one of the most important things to understand.

If you see:

``` yaml
data:
  password: c2VjcmV0
```

that is Base64 encoding.

Decode:

``` bash
echo c2VjcmV0
```

or:

``` bash
echo c2VjcmV0 | base64 -d
```

Result:

``` text
secret
```

Therefore:

``` text
Base64 != encryption
```

Anyone who can read the Secret data can decode it.

------------------------------------------------------------------------

# 5. Why Does Kubernetes Use Base64?

The `data` field of a Secret contains binary-safe data represented as
Base64.

This allows values such as:

``` text
password
certificate
private key
binary credentials
```

to be represented safely in the API object.

It does **not** provide confidentiality by itself.

------------------------------------------------------------------------

# 6. Secret Object Structure

Basic structure:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  username: YWRtaW4=
  password: c2VjcmV0
```

Main sections:

``` text
apiVersion
kind
metadata
type
data
```

There may also be:

``` yaml
stringData:
```

------------------------------------------------------------------------

# 7. `data` vs `stringData`

`data` expects Base64-encoded values.

Example:

``` yaml
data:
  username: YWRtaW4=
```

`stringData` accepts plain strings:

``` yaml
stringData:
  username: admin
```

Kubernetes converts the `stringData` values into the Secret's data
representation.

------------------------------------------------------------------------

# 8. Recommended Learning Pattern

For learning, `stringData` is convenient:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  username: admin
  password: my-password
```

For generated/manipulated manifests, you may encounter:

``` yaml
data:
```

with Base64 values.

------------------------------------------------------------------------

# 9. Never Commit Real Secrets to Git

Avoid:

``` yaml
stringData:
  password: MyRealProductionPassword
```

inside a Git repository.

Also avoid committing Base64 values such as:

``` yaml
data:
  password: TXlSZWFsUHJvZHVjdGlvblBhc3N3b3Jk
```

Base64 does not make the password safe.

------------------------------------------------------------------------

# 10. Create a Secret Imperatively

Example:

``` bash
kubectl create secret generic app-secret \
  --from-literal=username=admin \
  --from-literal=password='change-me'
```

Check:

``` bash
kubectl get secret app-secret
```

------------------------------------------------------------------------

# 11. Describe a Secret

``` bash
kubectl describe secret app-secret
```

Kubernetes intentionally does not display the Secret values in the
normal `describe` output.

You may see:

``` text
Name:         app-secret
Type:         Opaque
Data
====
username:     5 bytes
password:     10 bytes
```

------------------------------------------------------------------------

# 12. Get a Secret

``` bash
kubectl get secret app-secret
```

Example:

``` text
NAME          TYPE     DATA   AGE
app-secret    Opaque   2      1m
```

------------------------------------------------------------------------

# 13. Get Secret YAML

``` bash
kubectl get secret app-secret -o yaml
```

You may see:

``` yaml
data:
  password: ...
  username: ...
```

Remember:

``` text
Base64 encoded
≠
encrypted for the reader
```

------------------------------------------------------------------------

# 14. Decode a Secret

Example:

``` bash
kubectl get secret app-secret \
  -o jsonpath='{.data.password}'
```

Then decode the returned Base64 value.

PowerShell example:

``` powershell
[Text.Encoding]::UTF8.GetString(
    [Convert]::FromBase64String(
        (kubectl get secret app-secret -o jsonpath="{.data.password}")
    )
)
```

Be careful not to expose decoded secrets in terminal history,
screenshots, logs, or chat.

------------------------------------------------------------------------

# 15. Create Secret From a File

Example:

``` bash
kubectl create secret generic ssh-secret \
  --from-file=id_rsa=./id_rsa
```

The file contents become Secret data.

------------------------------------------------------------------------

# 16. Create Secret From an Environment File

Example file:

``` text
username=admin
password=change-me
```

Create:

``` bash
kubectl create secret generic app-secret \
  --from-env-file=.env
```

Treat the source file as sensitive.

------------------------------------------------------------------------

# 17. Secret Types

Kubernetes supports different Secret types.

Common examples:

``` text
Opaque
kubernetes.io/tls
kubernetes.io/dockerconfigjson
kubernetes.io/basic-auth
kubernetes.io/ssh-auth
kubernetes.io/service-account-token
```

Custom types are also possible.

------------------------------------------------------------------------

# 18. Opaque Secret

The default generic Secret type is:

``` yaml
type: Opaque
```

Used for arbitrary application credentials.

Example:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
type: Opaque
stringData:
  username: appuser
  password: change-me
```

------------------------------------------------------------------------

# 19. TLS Secret

TLS Secrets commonly use:

``` yaml
type: kubernetes.io/tls
```

Typical keys:

``` text
tls.crt
tls.key
```

Example:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: <base64-certificate>
  tls.key: <base64-private-key>
```

------------------------------------------------------------------------

# 20. Create TLS Secret

If you have:

``` text
tls.crt
tls.key
```

run:

``` bash
kubectl create secret tls my-tls \
  --cert=tls.crt \
  --key=tls.key
```

Verify:

``` bash
kubectl get secret my-tls
```

------------------------------------------------------------------------

# 21. Docker Registry Secret

For private container registries, Kubernetes can use:

``` text
kubernetes.io/dockerconfigjson
```

Example:

``` bash
kubectl create secret docker-registry regcred \
  --docker-server=<registry-server> \
  --docker-username=<username> \
  --docker-password='<password>' \
  --docker-email=<email>
```

The exact command options can vary by registry and Kubernetes tooling
version.

------------------------------------------------------------------------

# 22. Using Image Pull Secrets

Reference the registry Secret:

``` yaml
spec:
  imagePullSecrets:
    - name: regcred
```

Example:

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: private-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: private-app
  template:
    metadata:
      labels:
        app: private-app
    spec:
      imagePullSecrets:
        - name: regcred

      containers:
        - name: app
          image: private.example.com/team/app:v1
```

------------------------------------------------------------------------

# 23. Basic Auth Secret

Kubernetes provides a conventional type:

``` text
kubernetes.io/basic-auth
```

Example:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: basic-auth
type: kubernetes.io/basic-auth
stringData:
  username: admin
  password: change-me
```

The type documents the intended purpose and expected keys.

------------------------------------------------------------------------

# 24. SSH Auth Secret

For SSH credentials:

``` text
kubernetes.io/ssh-auth
```

Example:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: ssh-secret
type: kubernetes.io/ssh-auth
stringData:
  ssh-privatekey: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    ...
    -----END OPENSSH PRIVATE KEY-----
```

Never use a real private key in a learning document or public
repository.

------------------------------------------------------------------------

# 25. ServiceAccount Token Secrets

Historically, Kubernetes used Secret objects to hold ServiceAccount
tokens.

Modern Kubernetes commonly uses **short-lived, automatically mounted
projected ServiceAccount tokens** obtained through the TokenRequest
mechanism.

Do not assume every ServiceAccount has a long-lived token Secret
automatically created.

------------------------------------------------------------------------

# 26. ServiceAccount and Secret

A Pod can use:

``` yaml
serviceAccountName: app-sa
```

and Kubernetes can provide a ServiceAccount token to the Pod through
projected token mechanisms.

Example:

``` yaml
spec:
  serviceAccountName: app-sa
```

This is different from storing an arbitrary application password in a
Secret.

------------------------------------------------------------------------

# 27. Secret as Environment Variable

A Secret can be injected into a container as an environment variable.

Example:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-env-demo
spec:
  containers:
    - name: app
      image: nginx
      env:
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: username

        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: password
```

------------------------------------------------------------------------

# 28. What Happens Here?

Flow:

``` text
Secret
   |
   v
secretKeyRef
   |
   v
Container environment
   |
   v
DB_PASSWORD
```

Inside the container:

``` text
DB_PASSWORD=<secret-value>
```

------------------------------------------------------------------------

# 29. `envFrom`

You can import multiple keys from a Secret:

``` yaml
envFrom:
  - secretRef:
      name: app-secret
```

If Secret contains:

``` text
USERNAME
PASSWORD
API_KEY
```

those become environment variables.

Be careful with naming collisions and unintended exposure.

------------------------------------------------------------------------

# 30. Secret as a Volume

A Secret can be mounted as files.

Example:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-volume-demo
spec:
  containers:
    - name: app
      image: nginx
      volumeMounts:
        - name: secret-volume
          mountPath: /etc/app-secret
          readOnly: true

  volumes:
    - name: secret-volume
      secret:
        secretName: app-secret
```

------------------------------------------------------------------------

# 31. Resulting Files

If Secret contains:

``` text
username
password
```

the container can see:

``` text
/etc/app-secret/username
/etc/app-secret/password
```

The files contain the decoded Secret values.

------------------------------------------------------------------------

# 32. Environment Variable vs Volume

  -----------------------------------------------------------------------
  Method                              Behavior
  ----------------------------------- -----------------------------------
  Environment variable                Secret becomes process environment

  Volume                              Secret becomes files

  ImagePullSecrets                    Used by kubelet/runtime for
                                      registry authentication

  CSI integration                     Can retrieve secrets from external
                                      secret systems
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 33. Which Is Better: Env or Volume?

There is no universal answer.

Environment variables are convenient for applications expecting:

``` text
DB_PASSWORD
API_KEY
```

Files are useful for:

``` text
TLS certificates
private keys
large structured credentials
applications that read credential files
```

Volume-mounted Secrets can also be updated by Kubernetes.

------------------------------------------------------------------------

# 34. Secret Volume Updates

When a Secret mounted as a volume changes, Kubernetes can update the
projected files after a propagation delay.

Applications must still handle the change.

If the application reads the file only once during startup, updating the
file does not automatically mean the application reloads the credential.

------------------------------------------------------------------------

# 35. Environment Variable Updates

A Secret used as an environment variable does **not** dynamically update
the already-running process's environment.

If the Secret changes:

``` text
existing process
=
old environment value
```

Usually the Pod must be restarted to pick up the new environment value.

------------------------------------------------------------------------

# 36. Secret Rotation

Secret rotation means replacing an existing credential with a new
credential.

Example:

``` text
Old password
     |
     v
New password
```

A production rotation strategy should account for:

``` text
Secret update
application reload
connection pools
old credential validity
rollout
verification
rollback
```

------------------------------------------------------------------------

# 37. Basic Rotation Pattern

``` text
Create new credential
        |
        v
Update Secret
        |
        v
Restart/reload application
        |
        v
Verify
        |
        v
Revoke old credential
```

The exact sequence depends on the external system.

------------------------------------------------------------------------

# 38. Secret Rotation With Deployment

If the Secret is consumed as an environment variable, a common
operational approach is:

``` bash
kubectl apply -f secret.yaml
kubectl rollout restart deployment/my-app
```

Then:

``` bash
kubectl rollout status deployment/my-app
```

Do not restart blindly in systems where availability requirements
require a carefully controlled rollout.

------------------------------------------------------------------------

# 39. Secret Rotation With Mounted Files

For volume-mounted Secrets:

``` text
Secret updated
      |
      v
Kubernetes updates mounted files
      |
      v
Application must reload
```

If the application supports live credential reload, a restart may not be
necessary.

------------------------------------------------------------------------

# 40. `immutable: true`

Secrets can be made immutable:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: immutable-secret
immutable: true
type: Opaque
stringData:
  api-key: example
```

Once immutable, the data cannot be changed.

To change it, you generally need to create a replacement Secret.

------------------------------------------------------------------------

# 41. Why Use Immutable Secrets?

Benefits can include:

-   preventing accidental modification
-   reducing unnecessary update handling
-   clearer configuration lifecycle
-   reducing watches for immutable objects in large clusters

Use them when the Secret is intentionally versioned or static.

------------------------------------------------------------------------

# 42. Immutable Secret Trade-Off

If your application requires frequent credential rotation through the
same Secret object, immutability may not fit that workflow.

Instead, use versioned Secret names and controlled rollouts where
appropriate.

------------------------------------------------------------------------

# 43. Secret Names and Versioning

Example:

``` text
db-credentials-v1
db-credentials-v2
db-credentials-v3
```

A Deployment can move from:

``` text
v1
```

to:

``` text
v2
```

This can make rollouts and rollback strategies easier.

------------------------------------------------------------------------

# 44. Secret Security Model

Think of Secret security as multiple layers:

``` text
             Secret Security
                   |
       +-----------+-----------+
       |           |           |
      RBAC       Encryption   Access
       |         at Rest      Control
       |           |           |
       +-----------+-----------+
                   |
              Audit/Monitoring
```

A Secret object is only as secure as the surrounding Kubernetes security
configuration.

------------------------------------------------------------------------

# 45. Encryption at Rest

By default, storing a Secret in Kubernetes does not automatically mean
the data is encrypted at rest in every environment/configuration.

Kubernetes supports encryption at rest through API server encryption
configuration and external KMS providers.

The purpose is:

``` text
Protect stored Secret data
```

especially in:

``` text
etcd
```

and related storage paths.

------------------------------------------------------------------------

# 46. Why Encryption at Rest Matters

If an attacker obtains direct access to the underlying etcd data,
unencrypted Secret values can be exposed.

Encryption at rest provides an additional protection layer.

------------------------------------------------------------------------

# 47. Encryption Is Not Enough

Even with encryption at rest:

``` text
Authorized API reader
```

may be able to retrieve the Secret.

Therefore you still need:

``` text
RBAC
authentication
authorization
network security
audit logging
least privilege
```

------------------------------------------------------------------------

# 48. RBAC and Secrets

RBAC permissions can control whether an identity can:

``` text
get Secret
list Secret
watch Secret
create Secret
update Secret
patch Secret
delete Secret
```

Be careful with:

``` yaml
resources:
  - secrets
verbs:
  - get
  - list
  - watch
```

Those permissions can expose sensitive information.

------------------------------------------------------------------------

# 49. Why `list secrets` Is Sensitive

A user who can list Secrets can often retrieve metadata and encoded
values.

Therefore avoid broad permissions such as:

``` text
list secrets
```

unless genuinely required.

------------------------------------------------------------------------

# 50. Least Privilege

Prefer:

``` text
only required namespace
only required Secret
only required operation
```

rather than:

``` text
all Secrets
all namespaces
all operations
```

------------------------------------------------------------------------

# 51. Example RBAC Pattern

A ServiceAccount may need access to one Secret.

Instead of giving:

``` text
cluster-wide Secret access
```

use a namespaced Role where possible.

Example:

``` yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-app-secret
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    resourceNames: ["app-secret"]
    verbs: ["get"]
```

Then bind it to the required ServiceAccount.

------------------------------------------------------------------------

# 52. Secret Access and ServiceAccounts

Typical flow:

``` text
Pod
 |
 v
ServiceAccount
 |
 v
RBAC
 |
 v
Kubernetes API
 |
 v
Secret
```

But note:

> A Pod consuming a Secret through `secretKeyRef` or a Secret volume
> does not normally need permission to call the Kubernetes API to read
> that Secret itself.

The kubelet/control-plane machinery handles mounting/injection according
to the Pod specification and node authorization mechanisms.

------------------------------------------------------------------------

# 53. Important Security Distinction

There are two different models:

### Model A

Pod specification references:

``` yaml
secretKeyRef:
```

Kubernetes provides the value to the container.

### Model B

Application calls:

``` text
Kubernetes API
```

to retrieve Secret objects.

Model B requires the application's ServiceAccount to have appropriate
RBAC permissions.

Do not confuse the two.

------------------------------------------------------------------------

# 54. Secret Exposure Through Logs

Never do:

``` python
print(os.environ["DB_PASSWORD"])
```

or:

``` python
logger.info("password=%s", password)
```

Secrets can end up in:

``` text
application logs
central logging
debug traces
CI output
terminal history
monitoring systems
```

------------------------------------------------------------------------

# 55. Secret Exposure Through Commands

Be careful with:

``` bash
kubectl get secret ... -o yaml
```

and decoding commands.

Do not paste decoded production credentials into:

``` text
Slack
tickets
GitHub
chat
screenshots
documentation
```

------------------------------------------------------------------------

# 56. Secret Exposure in Process Environment

Environment variables may be accessible to processes/users depending on
the operating system, process model, debugging tools, and application
behavior.

For highly sensitive credentials, consider whether file-based or
external secret mechanisms better fit your threat model.

------------------------------------------------------------------------

# 57. Secret Exposure Through Core Dumps

Applications that generate core dumps can potentially capture sensitive
memory, including credentials.

Production systems should consider:

``` text
core dump policy
debugging tools
crash reporting
```

when handling sensitive data.

------------------------------------------------------------------------

# 58. Secret Exposure Through CI/CD

Bad pattern:

``` text
kubectl apply -f secret-with-password.yaml
```

where the file is committed to source control.

Better patterns include:

``` text
external secret manager
sealed/encrypted secret workflow
CI secret store
short-lived credentials
GitOps secret encryption
```

------------------------------------------------------------------------

# 59. External Secret Managers

Production environments often integrate Kubernetes with external secret
systems.

Examples include:

``` text
cloud secret managers
HashiCorp Vault
enterprise secret platforms
```

Kubernetes can then consume externally managed credentials through an
integration mechanism.

------------------------------------------------------------------------

# 60. External Secrets Operator

An external secrets operator can synchronize values from an external
secret manager into Kubernetes Secret objects.

Conceptual flow:

``` text
External Secret Manager
          |
          v
External Secrets Operator
          |
          v
Kubernetes Secret
          |
          v
Pod
```

The exact implementation depends on the operator and provider.

------------------------------------------------------------------------

# 61. Why External Secret Management?

Advantages can include:

-   centralized secret lifecycle
-   stronger access policies
-   auditing
-   rotation
-   cloud KMS integration
-   reduced plaintext secret storage in Git
-   separation between application manifests and credentials

------------------------------------------------------------------------

# 62. Sealed Secrets

Another approach is an encrypted secret manifest workflow.

Conceptually:

``` text
Plain secret
    |
    v
Encrypt
    |
    v
Safe-ish encrypted manifest in Git
    |
    v
Cluster controller
    |
    v
Kubernetes Secret
```

The exact security properties depend on key management and operational
practices.

------------------------------------------------------------------------

# 63. Secret Management Options

Common approaches:

``` text
Kubernetes Secret
External secret manager
External Secrets Operator
Sealed Secrets
SOPS/encrypted configuration
Cloud-specific secret integrations
```

Choose based on:

``` text
security requirements
rotation
audit
GitOps
cloud environment
operational complexity
```

------------------------------------------------------------------------

# 64. Secret in Git: The Fundamental Rule

Never treat:

``` text
Base64
```

as:

``` text
encryption
```

This is unsafe:

``` yaml
data:
  password: c2VjcmV0
```

if the manifest is publicly or broadly accessible.

------------------------------------------------------------------------

# 65. Secret Names Are Not Secret

A Secret's metadata is not necessarily confidential.

For example:

``` text
database-password
```

may reveal information even if the value is protected.

Avoid unnecessary disclosure of sensitive naming/context.

------------------------------------------------------------------------

# 66. Secret Size

Kubernetes Secrets are intended for relatively small pieces of sensitive
data.

Do not use Secrets as a general-purpose large file/object store.

For large artifacts, use appropriate storage.

------------------------------------------------------------------------

# 67. Secret Key Names

Example:

``` yaml
stringData:
  username: admin
  password: change-me
```

Key names should match what your application expects.

For TLS:

``` text
tls.crt
tls.key
```

For Docker registry credentials:

``` text
.dockerconfigjson
```

depending on Secret type.

------------------------------------------------------------------------

# 68. Secret Keys With Special Characters

If a Secret key contains characters that are awkward for environment
variable names, mounting it as a file may be easier.

Example:

``` text
tls.crt
tls.key
```

These naturally work as file names.

------------------------------------------------------------------------

# 69. Select One Secret Key

Instead of importing all keys:

``` yaml
envFrom:
```

you can select one:

``` yaml
env:
  - name: API_KEY
    valueFrom:
      secretKeyRef:
        name: app-secret
        key: api-key
```

This follows least privilege at the application configuration level.

------------------------------------------------------------------------

# 70. Mount Only Selected Keys

Example:

``` yaml
volumes:
  - name: secret-volume
    secret:
      secretName: app-secret
      items:
        - key: tls.crt
          path: tls.crt
```

Now only the selected Secret key is projected into the volume.

------------------------------------------------------------------------

# 71. Default File Permissions

Secret volumes are commonly mounted with restrictive permissions.

You can configure a default mode:

``` yaml
volumes:
  - name: secret-volume
    secret:
      secretName: app-secret
      defaultMode: 0400
```

The exact permissions should match the application's user/security
model.

------------------------------------------------------------------------

# 72. Secret Volume as Read-Only

A Secret volume is intended to be consumed as projected data.

Use:

``` yaml
volumeMounts:
  - name: secret-volume
    mountPath: /etc/secrets
    readOnly: true
```

This clearly communicates intent.

------------------------------------------------------------------------

# 73. Secret and SubPath Caveat

When Secret/config data is mounted using certain `subPath` patterns,
automatic update behavior differs.

If you require dynamic updates, understand the implications of `subPath`
before using it for Secret files.

------------------------------------------------------------------------

# 74. Secret and Namespace

Secrets are namespaced resources.

Example:

``` text
namespace: development
```

A Secret in:

``` text
development
```

is not automatically available to a Pod in:

``` text
production
```

------------------------------------------------------------------------

# 75. Same Secret Name in Different Namespaces

This is valid:

``` text
development/app-secret
production/app-secret
```

They are different objects.

The namespace is part of the resource identity.

------------------------------------------------------------------------

# 76. Get Secrets in a Namespace

``` bash
kubectl get secrets -n development
```

All namespaces:

``` bash
kubectl get secrets -A
```

Be careful with broad output because Secret metadata itself may be
sensitive.

------------------------------------------------------------------------

# 77. Secret and Pod Namespace

A Pod can normally reference Secrets in its own namespace.

For example:

``` yaml
secretKeyRef:
  name: app-secret
```

does not specify another namespace.

The referenced Secret is expected in the Pod's namespace.

------------------------------------------------------------------------

# 78. Secret and Deployment

Deployment:

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: python-app
  template:
    metadata:
      labels:
        app: python-app
    spec:
      containers:
        - name: python-app
          image: example/python-app:v1
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
```

------------------------------------------------------------------------

# 79. Deployment → ReplicaSet → Pod → Secret

This is important for your Kubernetes learning path.

``` text
Deployment
    |
    v
ReplicaSet
    |
    v
Pod
    |
    v
Container
    |
    +--> Secret
          |
          +--> environment
          |
          +--> files
```

The Secret itself is not "inside" the ReplicaSet.

The Pod template contains the reference.

------------------------------------------------------------------------

# 80. Secret and ReplicaSet

When you change:

``` yaml
secretKeyRef:
```

inside a Deployment Pod template, the Pod template changes and the
Deployment may create a new ReplicaSet.

But changing only the Secret object itself does **not** automatically
create a new ReplicaSet.

This distinction is important.

------------------------------------------------------------------------

# 81. Secret Update vs Deployment Update

### Change Secret

``` text
Secret changes
    |
    +--> mounted Secret files can update
    |
    +--> existing env values remain unchanged
```

### Change Deployment template

``` text
Deployment template changes
    |
    v
new ReplicaSet
    |
    v
new Pods
```

------------------------------------------------------------------------

# 82. Common Secret Checksum Pattern

A common Helm/Kubernetes deployment pattern is to put a hash of
Secret/ConfigMap content into a Pod template annotation.

Conceptually:

``` yaml
annotations:
  checksum/config: <hash>
```

When the Secret content changes:

``` text
hash changes
   |
   v
Pod template changes
   |
   v
new ReplicaSet
   |
   v
rolling restart
```

This is a deployment automation pattern, not a built-in requirement.

------------------------------------------------------------------------

# 83. Secret and Helm

Helm templates can reference Secret values, but avoid exposing plaintext
secrets through:

``` text
Helm values files
Git
rendered manifests
CI logs
```

Use an appropriate secure secret workflow.

------------------------------------------------------------------------

# 84. Secret and GitOps

GitOps introduces a special challenge:

``` text
Desired state
```

is normally stored in Git.

Do not simply put plaintext Kubernetes Secrets into the repository.

Common approaches include:

``` text
SOPS
Sealed Secrets
external secret manager
secret-encrypted GitOps workflows
```

------------------------------------------------------------------------

# 85. Secret and Docker Image

Never bake production credentials into an image:

``` dockerfile
ENV DB_PASSWORD=...
```

or:

``` dockerfile
COPY secret.txt /app/
```

Why?

Docker image layers and registries can preserve sensitive data.

Instead:

``` text
Image
+
runtime Secret
=
application
```

------------------------------------------------------------------------

# 86. Secret and ConfigMap Together

A common application architecture:

``` text
Deployment
 |
 +--> ConfigMap
 |      |
 |      +--> APP_ENV=production
 |      +--> LOG_LEVEL=INFO
 |
 +--> Secret
        |
        +--> DB_USERNAME
        +--> DB_PASSWORD
        +--> API_KEY
```

This cleanly separates ordinary configuration from credentials.

------------------------------------------------------------------------

# 87. Example Complete Application

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: python-app-secret
type: Opaque
stringData:
  DB_USERNAME: appuser
  DB_PASSWORD: change-me
  API_KEY: example-key
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: python-app
  template:
    metadata:
      labels:
        app: python-app
    spec:
      containers:
        - name: python-app
          image: example/python-app:v1

          envFrom:
            - secretRef:
                name: python-app-secret
```

------------------------------------------------------------------------

# 88. Better Least-Privilege Example

Instead of exposing all keys:

``` yaml
env:
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: python-app-secret
        key: DB_USERNAME

  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: python-app-secret
        key: DB_PASSWORD
```

This makes the Pod's intended Secret dependencies explicit.

------------------------------------------------------------------------

# 89. Secret as TLS Volume

Example:

``` yaml
volumes:
  - name: tls
    secret:
      secretName: my-tls
```

Mount:

``` yaml
volumeMounts:
  - name: tls
    mountPath: /etc/tls
    readOnly: true
```

The application can access:

``` text
/etc/tls/tls.crt
/etc/tls/tls.key
```

------------------------------------------------------------------------

# 90. Secret for Database Credentials

Secret:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  username: appuser
  password: change-me
```

Deployment:

``` yaml
env:
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: username

  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: password
```

------------------------------------------------------------------------

# 91. Secret for API Key

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: external-api
type: Opaque
stringData:
  api-key: change-me
```

Pod:

``` yaml
env:
  - name: API_KEY
    valueFrom:
      secretKeyRef:
        name: external-api
        key: api-key
```

------------------------------------------------------------------------

# 92. Secret for Private Registry

``` yaml
spec:
  imagePullSecrets:
    - name: regcred
```

The Pod can then pull from a registry requiring authentication, assuming
the credentials and registry configuration are correct.

------------------------------------------------------------------------

# 93. Troubleshooting: Secret Not Found

Symptom:

``` text
CreateContainerConfigError
```

or a Pod event indicating that the referenced Secret cannot be found.

Check:

``` bash
kubectl get secret app-secret
```

and:

``` bash
kubectl get pod <pod> -o yaml
```

Confirm:

``` text
Secret name
namespace
key name
```

------------------------------------------------------------------------

# 94. Troubleshooting: Wrong Secret Key

Secret:

``` yaml
stringData:
  password: change-me
```

Pod:

``` yaml
secretKeyRef:
  name: app-secret
  key: passwd
```

Problem:

``` text
passwd != password
```

Check:

``` bash
kubectl describe secret app-secret
```

------------------------------------------------------------------------

# 95. Troubleshooting: Wrong Namespace

Secret exists:

``` text
namespace: development
```

Pod exists:

``` text
namespace: production
```

The Pod cannot simply reference:

``` text
development/app-secret
```

as if it were a local Secret.

Create/provide the appropriate Secret in the Pod's namespace or use an
external secret mechanism.

------------------------------------------------------------------------

# 96. Troubleshooting: Environment Variable Not Updated

You updated:

``` text
Secret
```

but the application still sees the old value.

If the Secret is consumed as an environment variable, restart/recreate
the Pod.

For a Deployment:

``` bash
kubectl rollout restart deployment/<deployment>
```

Then:

``` bash
kubectl rollout status deployment/<deployment>
```

------------------------------------------------------------------------

# 97. Troubleshooting: Mounted Secret Not Updating

Check:

``` text
volume mount
subPath usage
Secret update
Pod status
application reload behavior
```

Kubernetes can update projected Secret files, but the application must
actually read/reload them.

------------------------------------------------------------------------

# 98. Troubleshooting: ImagePullBackOff

If a private image cannot be pulled:

``` bash
kubectl describe pod <pod>
```

Look for:

``` text
Failed to pull image
unauthorized
authentication required
```

Check:

``` bash
kubectl get secret regcred
```

and:

``` yaml
imagePullSecrets:
  - name: regcred
```

------------------------------------------------------------------------

# 99. Troubleshooting: Secret Data Looks Wrong

Check whether you accidentally:

``` text
double-encoded Base64
```

For example:

``` text
password
   |
   v
Base64
   |
   v
encoded again
```

The application may receive:

``` text
c2VjcmV0
```

instead of:

``` text
secret
```

------------------------------------------------------------------------

# 100. Troubleshooting: YAML Formatting

Multiline secrets such as certificates and private keys require careful
YAML formatting.

Example:

``` yaml
stringData:
  certificate: |
    -----BEGIN CERTIFICATE-----
    ...
    -----END CERTIFICATE-----
```

Be careful with:

``` text
indentation
line endings
trailing spaces
```

------------------------------------------------------------------------

# 101. Troubleshooting Commands

``` bash
kubectl get secrets
kubectl describe secret <secret>
kubectl get secret <secret> -o yaml
kubectl get pod <pod> -o yaml
kubectl describe pod <pod>
kubectl get events --sort-by='.lastTimestamp'
```

------------------------------------------------------------------------

# 102. Check Secret References

``` bash
kubectl get deployment <deployment> -o yaml
```

Search for:

``` text
secretKeyRef
secretRef
secretName
imagePullSecrets
```

------------------------------------------------------------------------

# 103. Check Pod Environment Configuration

You can inspect the Pod specification:

``` bash
kubectl get pod <pod> -o yaml
```

Be careful: this may show Secret references, though not necessarily the
decoded values.

------------------------------------------------------------------------

# 104. Do Not Print Secrets for Troubleshooting

Avoid:

``` bash
kubectl get secret app-secret -o jsonpath='{.data.password}' | base64 -d
```

in shared environments unless absolutely necessary.

Prefer checking:

``` text
key exists
Pod reference is correct
application receives expected behavior
```

without exposing the credential.

------------------------------------------------------------------------

# 105. Practical Lab 1 --- Create a Secret

Create:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  username: admin
  password: change-me
```

Apply:

``` bash
kubectl apply -f secret.yaml
```

------------------------------------------------------------------------

# 106. Practical Lab 2 --- Inspect Secret

``` bash
kubectl get secret app-secret
```

Then:

``` bash
kubectl describe secret app-secret
```

Notice that the Secret values are not printed by `describe`.

------------------------------------------------------------------------

# 107. Practical Lab 3 --- Inspect Encoded Data

``` bash
kubectl get secret app-secret -o yaml
```

You will see:

``` yaml
data:
```

with Base64 values.

Remember:

``` text
encoding != encryption
```

------------------------------------------------------------------------

# 108. Practical Lab 4 --- Use Secret as Environment Variable

Create:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-env
spec:
  containers:
    - name: app
      image: nginx
      env:
        - name: APP_USERNAME
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: username
```

Apply:

``` bash
kubectl apply -f secret-env.yaml
```

------------------------------------------------------------------------

# 109. Practical Lab 5 --- Use `envFrom`

``` yaml
envFrom:
  - secretRef:
      name: app-secret
```

Then inspect the application environment inside a test container.

Avoid using real credentials.

------------------------------------------------------------------------

# 110. Practical Lab 6 --- Mount Secret as Files

``` yaml
volumes:
  - name: secret-volume
    secret:
      secretName: app-secret

containers:
  - name: app
    image: nginx
    volumeMounts:
      - name: secret-volume
        mountPath: /etc/app-secret
        readOnly: true
```

Inspect:

``` text
/etc/app-secret/
```

------------------------------------------------------------------------

# 111. Practical Lab 7 --- TLS Secret

Create a test certificate/key pair.

Then:

``` bash
kubectl create secret tls demo-tls \
  --cert=tls.crt \
  --key=tls.key
```

Inspect:

``` bash
kubectl describe secret demo-tls
```

------------------------------------------------------------------------

# 112. Practical Lab 8 --- Image Pull Secret

Create a registry Secret using test credentials:

``` bash
kubectl create secret docker-registry regcred ...
```

Then reference:

``` yaml
imagePullSecrets:
  - name: regcred
```

Test only with credentials you are authorized to use.

------------------------------------------------------------------------

# 113. Practical Lab 9 --- Secret Rotation

1.  Create Secret `v1`.
2.  Deploy an application using it.
3.  Change the Secret.
4.  Observe environment-variable behavior.
5.  Restart the Deployment.
6.  Verify the new value.
7.  Compare with a mounted Secret file.

This demonstrates an important difference between:

``` text
environment injection
```

and:

``` text
volume projection
```

------------------------------------------------------------------------

# 114. Practical Lab 10 --- Immutable Secret

Create:

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: immutable-demo
immutable: true
type: Opaque
stringData:
  value: first-version
```

Try to modify it.

Observe that the data cannot be changed while the object remains
immutable.

------------------------------------------------------------------------

# 115. Practical Lab 11 --- Namespace Isolation

Create:

``` bash
kubectl create namespace secret-lab
```

Create a Secret there:

``` bash
kubectl create secret generic lab-secret \
  --from-literal=value=test \
  -n secret-lab
```

Then compare:

``` bash
kubectl get secret lab-secret -n secret-lab
kubectl get secret lab-secret -n default
```

This demonstrates namespace scope.

------------------------------------------------------------------------

# 116. Practical Lab 12 --- RBAC

Create:

``` text
ServiceAccount
Role
RoleBinding
```

where the Role allows:

``` text
get
```

on one named Secret.

Then test whether the ServiceAccount can:

``` bash
kubectl auth can-i get secret/app-secret \
  --as=system:serviceaccount:<namespace>:<serviceaccount>
```

Use least privilege.

------------------------------------------------------------------------

# 117. Secret Security Checklist

Before production:

``` text
[ ] No plaintext secrets in Git
[ ] No Base64 secrets committed as if encrypted
[ ] RBAC follows least privilege
[ ] Encryption at rest configured
[ ] Secret access audited
[ ] Rotation strategy defined
[ ] Credentials have appropriate expiration
[ ] Logs do not expose secrets
[ ] CI/CD does not print secrets
[ ] Images do not contain credentials
[ ] Debugging tools are controlled
[ ] Namespace boundaries are understood
```

------------------------------------------------------------------------

# 118. Production Best Practices

1.  Treat Kubernetes Secrets as sensitive data.
2.  Enable encryption at rest where appropriate.
3.  Use strong RBAC.
4.  Avoid cluster-wide Secret permissions.
5.  Never commit plaintext Secret manifests.
6.  Remember Base64 is not encryption.
7.  Prefer external secret management for mature production environments
    where appropriate.
8.  Rotate credentials.
9.  Use short-lived credentials where possible.
10. Avoid logging Secret values.

------------------------------------------------------------------------

# 119. More Production Best Practices

11. Use `readOnly: true` for Secret mounts.
12. Mount only required keys where practical.
13. Avoid `envFrom` when you need strict control over exposed keys.
14. Use immutable Secrets when appropriate.
15. Separate Secrets by application/environment.
16. Audit Secret access.
17. Protect CI/CD secret stores.
18. Avoid secrets in Docker images.
19. Control shell history and debugging output.
20. Plan rollback and rotation procedures.

------------------------------------------------------------------------

# 120. Secret Naming Strategy

Good:

``` text
python-app-db
python-app-api
python-app-tls
```

Environment-specific:

``` text
python-app-db
namespace: development
```

and:

``` text
python-app-db
namespace: production
```

Avoid embedding actual credential values in names.

------------------------------------------------------------------------

# 121. Secret Lifecycle

Think of a Secret as having a lifecycle:

``` text
Create
  |
  v
Store
  |
  v
Reference
  |
  v
Consume
  |
  v
Rotate
  |
  v
Revoke
  |
  v
Delete
```

Every stage needs security controls.

------------------------------------------------------------------------

# 122. Secret Rotation Lifecycle

``` text
Credential created
      |
      v
Secret stored
      |
      v
Application consumes
      |
      v
Rotation window
      |
      v
New credential
      |
      v
Secret updated
      |
      v
Application reload/restart
      |
      v
Old credential revoked
```

------------------------------------------------------------------------

# 123. Secret Deletion

Delete:

``` bash
kubectl delete secret app-secret
```

Be careful.

Pods that reference a deleted Secret can experience failures depending
on how the Secret is consumed and whether it is needed for startup or
ongoing operation.

------------------------------------------------------------------------

# 124. Secret Deletion and Existing Pods

If a Secret is used as an environment variable:

``` text
existing process
```

may continue to have the already-injected value until the Pod exits.

A new Pod requiring the deleted Secret can fail to start.

Therefore Secret deletion should be planned.

------------------------------------------------------------------------

# 125. Secret Data in etcd

Kubernetes stores API objects in its backing datastore, commonly etcd.

Therefore production security should include:

``` text
etcd security
encryption at rest
access controls
backup security
```

------------------------------------------------------------------------

# 126. Backups Can Contain Secrets

If your cluster backup contains Kubernetes API data, it may contain
Secrets.

Therefore secure:

``` text
etcd backups
snapshot storage
backup repositories
disaster recovery copies
```

with the same seriousness as the cluster itself.

------------------------------------------------------------------------

# 127. Disaster Recovery

When restoring a cluster:

``` text
Secrets
+
Deployments
+
ConfigMaps
+
RBAC
+
ServiceAccounts
```

may all be restored.

Therefore backup encryption and access control are critical.

------------------------------------------------------------------------

# 128. Secret and Audit Logging

Kubernetes audit logs can record API requests involving Secrets.

Audit logs themselves must be protected because excessive audit detail
or surrounding context can reveal sensitive information.

Design audit policies carefully.

------------------------------------------------------------------------

# 129. Secret and Node Security

When a Pod consumes a Secret, the node/kubelet is involved in delivering
the Secret to the Pod.

Therefore:

``` text
node compromise
```

can become a serious Secret confidentiality issue.

Protect:

``` text
worker nodes
kubelet
container runtime
host filesystem
```

------------------------------------------------------------------------

# 130. Secret and Pod Security

Pod security controls can reduce attack paths, but they do not replace
Secret-specific controls.

Use:

``` text
non-root containers
read-only filesystems where possible
restricted privileges
seccomp
capability dropping
RBAC
network controls
```

according to workload requirements.

------------------------------------------------------------------------

# 131. Secret and Network Security

A Secret may contain:

``` text
database password
API token
TLS private key
```

Even if the Secret is protected, the application may send the credential
to an external service.

Use appropriate:

``` text
TLS
network policies
egress controls
service authentication
```

------------------------------------------------------------------------

# 132. Secret and TLS

A TLS Secret often contains:

``` text
certificate
private key
```

The private key is highly sensitive.

Protect:

``` text
Secret
mount
application
node
backup
logs
```

------------------------------------------------------------------------

# 133. TLS Secret With Ingress

A common pattern:

``` text
Client
   |
 HTTPS
   |
   v
Ingress
   |
   v
TLS Secret
   |
   v
Certificate + Private Key
```

Ingress controllers can use the TLS Secret to terminate HTTPS, depending
on controller configuration.

------------------------------------------------------------------------

# 134. Secret and Service

A Kubernetes Service does not itself store application passwords.

Instead:

``` text
Service
=
network abstraction

Secret
=
credential/configuration object
```

They solve different problems.

------------------------------------------------------------------------

# 135. Secret and ConfigMap Architecture

``` text
                    Pod
                     |
          +----------+----------+
          |                     |
          v                     v
      ConfigMap               Secret
          |                     |
          v                     v
    non-sensitive           sensitive
    configuration           credentials
```

------------------------------------------------------------------------

# 136. Secret and PersistentVolume

A Secret is not a replacement for a PersistentVolume.

``` text
Secret
=
small sensitive configuration

PVC
=
persistent storage
```

If your application needs a database password:

``` text
Secret
```

If it needs persistent application data:

``` text
PVC
```

------------------------------------------------------------------------

# 137. Secret and Namespace

A production layout might be:

``` text
development
  |
  +-- python-app-secret

staging
  |
  +-- python-app-secret

production
  |
  +-- python-app-secret
```

Same name, different namespace, different values.

------------------------------------------------------------------------

# 138. Secret and Multi-Tenancy

In multi-tenant clusters:

``` text
Tenant A
   |
   +-- Secrets A

Tenant B
   |
   +-- Secrets B
```

RBAC and namespace isolation should prevent unauthorized access.

Avoid granting broad:

``` text
get secrets
list secrets
```

permissions.

------------------------------------------------------------------------

# 139. Common Mistake #1

Thinking:

``` text
Secret = encrypted password
```

Wrong.

Better:

``` text
Secret = Kubernetes API object intended for sensitive data
```

Security depends on:

``` text
RBAC
encryption at rest
node security
audit
secret-management practices
```

------------------------------------------------------------------------

# 140. Common Mistake #2

Putting Base64 credentials in Git.

Example:

``` yaml
data:
  password: c2VjcmV0
```

This is still a credential.

------------------------------------------------------------------------

# 141. Common Mistake #3

Logging Secret values.

Bad:

``` python
print(secret)
```

Never expose credentials unnecessarily.

------------------------------------------------------------------------

# 142. Common Mistake #4

Using `envFrom` Everywhere

This can expose every key in a Secret to the container.

Prefer explicit `secretKeyRef` when only a few values are needed.

------------------------------------------------------------------------

# 143. Common Mistake #5

Forgetting Namespace

Secret:

``` text
default/app-secret
```

Pod:

``` text
production
```

They are not the same resource.

------------------------------------------------------------------------

# 144. Common Mistake #6

Expecting Environment Variables to Auto-Refresh

Secret changes:

``` text
Secret = new value
```

Existing process:

``` text
environment = old value
```

Restart/reload as appropriate.

------------------------------------------------------------------------

# 145. Common Mistake #7

Putting Secrets in Docker Images

Bad:

``` dockerfile
COPY .env /app/.env
```

or:

``` dockerfile
ENV API_KEY=...
```

Images can be copied, cached, inspected, and stored in registries.

------------------------------------------------------------------------

# 146. Common Mistake #8

Giving Every ServiceAccount Secret Access

Avoid:

``` text
get secrets
list secrets
```

cluster-wide unless truly required.

Use least privilege.

------------------------------------------------------------------------

# 147. Common Mistake #9

Deleting a Secret During Production

A Secret may be required by:

``` text
Pod startup
image pulling
TLS
application connections
```

Plan deletion carefully.

------------------------------------------------------------------------

# 148. Common Mistake #10

No Rotation Strategy

Credentials should have an operational lifecycle.

Ask:

``` text
How is it created?
Who can access it?
How is it rotated?
How is it revoked?
How is it audited?
```

------------------------------------------------------------------------

# 149. Interview Question --- What Is a Kubernetes Secret?

Answer:

> A Kubernetes Secret is an API object designed to hold small amounts of
> sensitive data such as passwords, tokens, API keys, TLS certificates,
> and registry credentials.

------------------------------------------------------------------------

# 150. Interview Question --- Is Kubernetes Secret Encrypted?

Answer:

> A Secret's `data` field is Base64-encoded, which is not encryption.
> Encryption at rest can be configured for Kubernetes Secrets, including
> through API server encryption mechanisms and external KMS providers.

------------------------------------------------------------------------

# 151. Interview Question --- Secret vs ConfigMap?

Answer:

> ConfigMaps are intended for non-sensitive configuration, while Secrets
> are intended for sensitive data. Secrets still require proper RBAC and
> storage protection.

------------------------------------------------------------------------

# 152. Interview Question --- `data` vs `stringData`?

Answer:

> `data` contains Base64-encoded values. `stringData` accepts plain
> string values and Kubernetes converts them into the Secret data
> representation.

------------------------------------------------------------------------

# 153. Interview Question --- How Can a Pod Consume a Secret?

Three common patterns are:

``` text
environment variable
Secret volume
imagePullSecret
```

Applications can also interact with Secrets through the Kubernetes API
when RBAC permits it.

------------------------------------------------------------------------

# 154. Interview Question --- Does Secret Update Restart Pods?

Answer:

> No. Updating a Secret does not automatically restart Pods.
> Environment-variable consumers generally require a Pod restart to
> receive the new value. Mounted Secret volumes can receive updated
> projected data, subject to propagation and mount behavior.

------------------------------------------------------------------------

# 155. Interview Question --- How Do You Rotate a Secret?

Answer:

> Update or replace the credential, update the Kubernetes Secret or
> external secret source, reload/restart the application as required,
> verify the new credential works, and revoke the old credential.

------------------------------------------------------------------------

# 156. Interview Question --- What Is an Immutable Secret?

Answer:

> An immutable Secret is a Secret whose data cannot be changed after it
> is marked immutable. To change the data, a replacement Secret
> generally needs to be created.

------------------------------------------------------------------------

# 157. Interview Question --- What Is `Opaque`?

Answer:

> `Opaque` is the default generic Secret type for arbitrary application
> data.

------------------------------------------------------------------------

# 158. Interview Question --- What Is a TLS Secret?

Answer:

> A `kubernetes.io/tls` Secret conventionally contains a TLS certificate
> in `tls.crt` and a private key in `tls.key`.

------------------------------------------------------------------------

# 159. Interview Question --- What Is `imagePullSecrets`?

Answer:

> `imagePullSecrets` references a Secret containing registry
> authentication information so Kubernetes can authenticate when pulling
> private container images.

------------------------------------------------------------------------

# 160. Interview Question --- Are Secrets Namespace-Scoped?

Answer:

> Yes. Kubernetes Secrets are namespaced resources.

------------------------------------------------------------------------

# 161. Interview Question --- Can a Pod in Namespace A Directly Reference a Secret in Namespace B?

Answer:

> Not through the normal Pod Secret reference mechanism. The Secret is
> expected in the Pod's namespace. Cross-namespace access requires a
> different design, such as replication/synchronization or external
> secret management.

------------------------------------------------------------------------

# 162. Interview Question --- Why Is `list secrets` Dangerous?

Answer:

> Because Secret objects contain sensitive data. Broad read permissions
> can allow users or workloads to retrieve credentials across many
> Secrets.

------------------------------------------------------------------------

# 163. Interview Question --- Does a Pod Need RBAC to Mount a Secret?

Answer:

> A Pod consuming a Secret through its Pod specification does not
> normally need its application process to have Kubernetes API
> permission to read that Secret. Kubernetes handles the Secret
> delivery. RBAC becomes relevant if the workload itself calls the
> Kubernetes API to retrieve Secret objects.

------------------------------------------------------------------------

# 164. Interview Question --- How Do You Check a Secret?

Use:

``` bash
kubectl get secret <name>
kubectl describe secret <name>
kubectl get secret <name> -o yaml
```

Avoid unnecessarily decoding production values.

------------------------------------------------------------------------

# 165. Interview Question --- How Do You Create a Generic Secret?

``` bash
kubectl create secret generic app-secret \
  --from-literal=username=admin \
  --from-literal=password='change-me'
```

------------------------------------------------------------------------

# 166. Interview Question --- How Do You Create a TLS Secret?

``` bash
kubectl create secret tls my-tls \
  --cert=tls.crt \
  --key=tls.key
```

------------------------------------------------------------------------

# 167. Interview Question --- How Do You Create a Registry Secret?

``` bash
kubectl create secret docker-registry regcred ...
```

Then reference it through:

``` yaml
imagePullSecrets:
  - name: regcred
```

------------------------------------------------------------------------

# 168. Scenario --- Pod Says Secret Not Found

Troubleshoot:

``` text
1. Check Secret exists.
2. Check namespace.
3. Check Secret name.
4. Check Deployment/Pod reference.
5. Check events.
```

Commands:

``` bash
kubectl get secret <secret> -n <namespace>
kubectl describe pod <pod> -n <namespace>
```

------------------------------------------------------------------------

# 169. Scenario --- Wrong Password After Secret Update

If the password is injected as an environment variable:

``` text
Secret changed
      |
      X
existing process still has old env
```

Restart/recreate the Pod or perform an application-supported reload.

------------------------------------------------------------------------

# 170. Scenario --- Private Image Cannot Be Pulled

Check:

``` bash
kubectl describe pod <pod>
```

Look for:

``` text
ErrImagePull
ImagePullBackOff
unauthorized
```

Then verify:

``` yaml
imagePullSecrets:
  - name: regcred
```

and registry credentials.

------------------------------------------------------------------------

# 171. Scenario --- Secret Exists but Application Cannot Read File

Check:

``` text
volume
volumeMount
mountPath
Secret name
Secret key
file permissions
container user
```

------------------------------------------------------------------------

# 172. Scenario --- Secret Is Visible in Git

Immediately treat it as compromised.

Typical response:

``` text
1. Revoke/rotate the credential.
2. Remove it from active configuration.
3. Remove it from Git history where appropriate.
4. Audit access.
5. Replace with secure secret management.
```

Deleting the file from the latest Git commit alone does not erase
historical exposure.

------------------------------------------------------------------------

# 173. Scenario --- Need Dynamic Credential Rotation

Consider:

``` text
external secret manager
+
operator/integration
+
application reload
```

rather than relying on manually editing Kubernetes YAML.

------------------------------------------------------------------------

# 174. Scenario --- Need Different Password Per Environment

Use separate namespaces and environment-specific Secret sources:

``` text
development/db-secret
staging/db-secret
production/db-secret
```

or use an external secret management hierarchy.

------------------------------------------------------------------------

# 175. Scenario --- Need TLS Certificate Rotation

Use:

``` text
TLS Secret
+
certificate automation
+
application/controller reload
```

depending on your ingress/controller architecture.

------------------------------------------------------------------------

# 176. Scenario --- Need Application to Read Kubernetes Secrets Through API

Use:

``` text
ServiceAccount
+
Role
+
RoleBinding
```

and grant the smallest possible permissions.

For example:

``` text
get
```

on one named Secret rather than:

``` text
list all secrets
```

------------------------------------------------------------------------

# 177. Scenario --- Need to Prevent Secret Modification

Use:

``` yaml
immutable: true
```

when the lifecycle supports immutable credentials.

------------------------------------------------------------------------

# 178. Scenario --- Need Secret in Multiple Namespaces

Options include:

``` text
replicate it deliberately
external secret synchronization
environment-specific secret management
```

Avoid manually copying production credentials without a
lifecycle/rotation plan.

------------------------------------------------------------------------

# 179. Scenario --- Need to Store a Large Certificate Bundle

Secrets are intended for relatively small sensitive objects.

If the data becomes large or complex, reconsider the design and use
appropriate storage mechanisms.

------------------------------------------------------------------------

# 180. Complete Secret Architecture

``` text
                 External Secret Manager
                          |
                          v
                Secret Synchronization
                          |
                          v
                  Kubernetes Secret
                          |
              +-----------+-----------+
              |           |           |
              v           v           v
           Env Vars     Volume    Image Pull
              |           |           |
              +-----------+-----------+
                          |
                          v
                        Pod
                          |
                          v
                     Application
```

------------------------------------------------------------------------

# 181. Security Architecture

``` text
                    Secret
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
      RBAC        Encryption at Rest   Audit
       |               |               |
       +---------------+---------------+
                       |
                       v
                 Node / Kubelet
                       |
                       v
                      Pod
                       |
                       v
                  Application
```

------------------------------------------------------------------------

# 182. Secret + Deployment Architecture

``` text
             Deployment
                  |
                  v
              ReplicaSet
                  |
                  v
                 Pod
                  |
        +---------+---------+
        |                   |
        v                   v
    ConfigMap             Secret
        |                   |
        v                   v
non-sensitive            sensitive
configuration           credentials
        |                   |
        +---------+---------+
                  |
                  v
             Application
```

------------------------------------------------------------------------

# 183. Secret + Namespace Architecture

``` text
Cluster
 |
 +-- development
 |      |
 |      +-- app-secret
 |
 +-- staging
 |      |
 |      +-- app-secret
 |
 +-- production
        |
        +-- app-secret
```

Same Secret name does not imply same Secret object.

------------------------------------------------------------------------

# 184. Secret Management Decision Guide

Use a basic Kubernetes Secret when:

``` text
small internal workload
simple environment
controlled cluster
simple lifecycle
```

Consider external secret management when:

``` text
production
many teams
strict auditing
frequent rotation
central credential governance
multiple clusters
cloud KMS integration
```

------------------------------------------------------------------------

# 185. Final Kubernetes Secret Cheat Sheet

``` text
Secret
=
Kubernetes API object for sensitive data

data
=
Base64 representation

stringData
=
plain strings accepted during object creation/update

Base64
!=
encryption

Opaque
=
generic Secret

kubernetes.io/tls
=
TLS certificate/private key

kubernetes.io/dockerconfigjson
=
registry credentials

secretKeyRef
=
one Secret key as environment variable

envFrom
=
multiple Secret keys as environment variables

Secret volume
=
Secret keys exposed as files

imagePullSecrets
=
private registry authentication

immutable
=
Secret data cannot be changed

RBAC
=
controls API access

Encryption at rest
=
protects stored Secret data

External Secret Manager
=
centralized secret lifecycle
```

------------------------------------------------------------------------

# 186. Most Important Commands

``` bash
# Create generic Secret
kubectl create secret generic app-secret \
  --from-literal=username=admin \
  --from-literal=password='change-me'

# List Secrets
kubectl get secrets

# Describe
kubectl describe secret app-secret

# YAML
kubectl get secret app-secret -o yaml

# Namespace
kubectl get secret app-secret -n production

# Create TLS Secret
kubectl create secret tls my-tls \
  --cert=tls.crt \
  --key=tls.key

# Create registry Secret
kubectl create secret docker-registry regcred ...

# Delete
kubectl delete secret app-secret

# Check Pod references
kubectl get pod <pod> -o yaml

# Check Pod events
kubectl describe pod <pod>

# Restart Deployment after env-based Secret rotation
kubectl rollout restart deployment/<deployment>

# Verify rollout
kubectl rollout status deployment/<deployment>

# Test RBAC
kubectl auth can-i get secret/app-secret \
  --as=system:serviceaccount:<namespace>:<serviceaccount>
```

------------------------------------------------------------------------

# 187. Final Interview-Ready Explanation

> Kubernetes Secrets are namespaced API objects designed to hold small
> amounts of sensitive data such as passwords, API keys, tokens, TLS
> certificates, and registry credentials. Secret values stored in the
> `data` field are Base64-encoded, but Base64 is not encryption. Secrets
> can be consumed by Pods through environment variables, mounted files,
> or image-pull authentication. Proper Secret security requires RBAC,
> least privilege, encryption at rest, secure node and etcd protection,
> auditing, careful logging practices, and credential rotation. For
> production environments, external secret managers or encrypted GitOps
> workflows are often preferable for stronger lifecycle management. A
> Secret update does not automatically restart a Pod; environment-based
> consumers generally require a restart, while mounted Secret files can
> receive updated projected data and still require the application to
> reload it.

------------------------------------------------------------------------

# 188. The One Mental Model to Remember

``` text
                KUBERNETES SECRET
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
    Environment      Volume      Image Pull
       Variable        File          Auth
        |              |              |
        +--------------+--------------+
                       |
                       v
                      Pod
                       |
                       v
                 Application

Security:
    |
    +--> RBAC
    +--> Encryption at Rest
    +--> Least Privilege
    +--> Audit
    +--> Rotation
    +--> External Secret Management
```

The most important rule is:

> **A Kubernetes Secret is a mechanism for managing sensitive data, not
> a guarantee that the data is automatically encrypted or safe. Treat
> Base64 as encoding, and build security around RBAC, encryption, access
> control, rotation, and secure secret-management practices.**
