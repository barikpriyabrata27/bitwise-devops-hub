# Kubernetes Jobs and CronJobs

## 1. Overview

**Jobs** and **CronJobs** are Kubernetes workload resources designed to run tasks that **complete**, rather than applications that run continuously.

They are commonly used for:

* Database migrations
* Batch processing
* Data processing
* Backups
* Cleanup tasks
* Report generation
* Scheduled maintenance
* File processing
* ETL workloads
* One-time administrative operations

The key distinction is:

```text
Deployment
    │
    └── Runs continuously

Job
    │
    └── Runs a task until completion

CronJob
    │
    └── Creates Jobs on a schedule
```

---

# 2. Job vs CronJob

A **Job** runs a task one or more times until the required completion condition is met.

A **CronJob** creates Jobs according to a schedule.

```text
                    Kubernetes
                        │
              ┌─────────┴─────────┐
              │                   │
             Job              CronJob
              │                   │
              ▼                   ▼
        Run task once       Schedule-based
              │                   │
              ▼                   ▼
             Pod             Creates Jobs
                                  │
                                  ▼
                                Pods
```

---

# 3. What Is a Kubernetes Job?

A **Job** creates one or more Pods and ensures that a specified number of them successfully terminate.

For example:

```text
Job
 │
 ├── Pod → Running → Succeeded
 │
 └── Job → Complete
```

If the Pod fails, Kubernetes can create another Pod according to the Job configuration.

A Job is therefore appropriate for workloads where:

> **The task should finish successfully and then stop.**

---

# 4. What Is a Kubernetes CronJob?

A **CronJob** creates Jobs on a repeating schedule.

For example:

```text
CronJob
   │
   ├── 01:00 → Job → Pod → Complete
   │
   ├── 02:00 → Job → Pod → Complete
   │
   ├── 03:00 → Job → Pod → Complete
   │
   └── ...
```

CronJobs are useful for scheduled operations such as:

```text
Every night
Every hour
Every Monday
Every month
```

---

# 5. Job Architecture

A Job does not normally run a container directly.

The relationship is:

```text
Job
 │
 ▼
Pod
 │
 ▼
Container
 │
 ▼
Application / Task
```

Example:

```text
Job: database-migration
        │
        ▼
Pod: database-migration-xxxxx
        │
        ▼
Container: migration
        │
        ▼
Migration Process
        │
        ▼
Completed
```

---

# 6. CronJob Architecture

A CronJob adds another layer:

```text
CronJob
   │
   │ Schedule
   ▼
  Job
   │
   ▼
  Pod
   │
   ▼
Container
```

For example:

```text
CronJob
   │
   │ Every day at 02:00
   ▼
Job
   │
   ▼
Backup Pod
   │
   ▼
Backup Container
```

---

# 7. Basic Job YAML

A simple Job:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: hello-job

spec:
  template:
    spec:
      restartPolicy: Never

      containers:
        - name: hello
          image: busybox:1.36
          command:
            - /bin/sh
            - -c
            - echo "Hello from Kubernetes Job"
```

Apply:

```bash
kubectl apply -f job.yaml
```

Check:

```bash
kubectl get jobs
```

Check Pods:

```bash
kubectl get pods
```

---

# 8. Understanding Job YAML

The main sections are:

```yaml
apiVersion: batch/v1
kind: Job

metadata:
  name: hello-job

spec:
  template:
    spec:
      restartPolicy: Never

      containers:
        - name: hello
          image: busybox:1.36
```

### `apiVersion`

```yaml
apiVersion: batch/v1
```

This is the stable API version for Jobs.

### `kind`

```yaml
kind: Job
```

Defines the resource as a Job.

### `metadata`

Contains information such as the Job name.

### `spec`

Defines the desired behavior of the Job.

### `template`

Defines the Pod that the Job creates.

---

# 9. Job Completion

A Job is considered complete when its required number of successful Pod completions has been reached.

Example:

```yaml
spec:
  completions: 1
```

This means one successful completion is required.

Architecture:

```text
Job
 │
 ▼
Pod
 │
 ▼
Task completes successfully
 │
 ▼
Job Complete
```

Check:

```bash
kubectl get jobs
```

Example:

```text
NAME         COMPLETIONS   DURATION   AGE
hello-job    1/1           5s         20s
```

---

# 10. `completions`

The `completions` field specifies how many successful Pod completions are required.

Example:

```yaml
spec:
  completions: 5
```

The Job needs five successful completions.

Conceptually:

```text
Job
 │
 ├── Pod 1 → Success
 ├── Pod 2 → Success
 ├── Pod 3 → Success
 ├── Pod 4 → Success
 └── Pod 5 → Success
          │
          ▼
       Job Complete
```

---

# 11. `parallelism`

`parallelism` controls how many Pods can run concurrently.

Example:

```yaml
spec:
  completions: 10
  parallelism: 3
```

This means:

* 10 successful completions are required.
* Up to 3 Pods can run at the same time.

Conceptually:

```text
10 Tasks Required

Batch 1:
Pod 1 ──┐
Pod 2 ──┼── Run in parallel
Pod 3 ──┘

Batch 2:
Pod 4
Pod 5
Pod 6

Batch 3:
Pod 7
Pod 8
Pod 9

Batch 4:
Pod 10
```

---

# 12. `completions` vs `parallelism`

| Field         | Meaning                                     |
| ------------- | ------------------------------------------- |
| `completions` | Total successful completions required       |
| `parallelism` | Maximum number of Pods running concurrently |

Example:

```yaml
spec:
  completions: 20
  parallelism: 5
```

means:

```text
20 successful tasks
        │
        ▼
Maximum 5 at a time
```

---

# 13. Job Failure Handling

Jobs can fail.

For example:

```text
Job
 │
 ▼
Pod
 │
 ▼
Application Error
 │
 ▼
Pod Failed
 │
 ▼
Job creates/retries another Pod
```

Kubernetes can retry failed Pods depending on the Job configuration.

---

# 14. `backoffLimit`

The `backoffLimit` specifies the number of retries before Kubernetes considers the Job failed.

Example:

```yaml
spec:
  backoffLimit: 3
```

Conceptually:

```text
Attempt 1 → Failed
Attempt 2 → Failed
Attempt 3 → Failed
Attempt 4 → Failed
       │
       ▼
Job Failed
```

The exact behavior also depends on how failures and retries are counted by the Job controller.

---

# 15. Example Job With Retry

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: retry-job

spec:
  backoffLimit: 3

  template:
    spec:
      restartPolicy: Never

      containers:
        - name: worker
          image: busybox:1.36
          command:
            - /bin/sh
            - -c
            - |
              echo "Processing task..."
              exit 1
```

The container intentionally exits with an error.

The Job controller retries according to its failure policy and `backoffLimit`.

---

# 16. Job `restartPolicy`

Job Pods support:

```text
Never
OnFailure
```

Example:

```yaml
restartPolicy: Never
```

or:

```yaml
restartPolicy: OnFailure
```

### Never

The failed Pod is not restarted in place; the Job controller can create another Pod.

### OnFailure

The container can be restarted within the same Pod when it fails.

---

# 17. Job Completion Modes

Kubernetes Jobs can use completion modes such as:

```text
NonIndexed
Indexed
```

The default is generally:

```yaml
completionMode: NonIndexed
```

For parallel workloads where each task needs a distinct index, an Indexed Job can be used.

---

# 18. Indexed Jobs

Example:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: indexed-job

spec:
  completions: 5
  parallelism: 2
  completionMode: Indexed

  template:
    spec:
      restartPolicy: Never

      containers:
        - name: worker
          image: busybox:1.36
          command:
            - /bin/sh
            - -c
            - |
              echo "Processing completion index: $JOB_COMPLETION_INDEX"
```

Kubernetes assigns completion indexes such as:

```text
0
1
2
3
4
```

This is useful for partitioned or sharded workloads.

---

# 19. Job TTL

Completed Jobs can accumulate in a cluster.

Kubernetes supports automatic cleanup using:

```yaml
ttlSecondsAfterFinished: 3600
```

Example:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: cleanup-job

spec:
  ttlSecondsAfterFinished: 3600

  template:
    spec:
      restartPolicy: Never

      containers:
        - name: cleanup
          image: busybox:1.36
          command:
            - /bin/sh
            - -c
            - echo "Cleanup completed"
```

The Job becomes eligible for cleanup after the configured period following completion.

---

# 20. Why Job Cleanup Matters

Without cleanup, historical Jobs can accumulate:

```text
Job 1
Job 2
Job 3
Job 4
...
Job 10000
```

This creates unnecessary Kubernetes objects.

TTL cleanup can help keep the cluster clean.

---

# 21. Basic CronJob YAML

A simple CronJob:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-cronjob

spec:
  schedule: "*/5 * * * *"

  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never

          containers:
            - name: hello
              image: busybox:1.36
              command:
                - /bin/sh
                - -c
                - echo "Hello from CronJob"
```

This runs approximately every five minutes.

---

# 22. Cron Schedule Format

CronJob schedules use cron syntax.

The general format is:

```text
┌───────────── minute
│ ┌─────────── hour
│ │ ┌───────── day of month
│ │ │ ┌─────── month
│ │ │ │ ┌───── day of week
│ │ │ │ │
* * * * *
```

Example:

```text
*/5 * * * *
```

means:

```text
Every 5 minutes
```

---

# 23. Common CronJob Schedules

### Every Minute

```text
* * * * *
```

### Every 5 Minutes

```text
*/5 * * * *
```

### Every Hour

```text
0 * * * *
```

### Every Day at Midnight

```text
0 0 * * *
```

### Every Day at 2 AM

```text
0 2 * * *
```

### Every Sunday at 3 AM

```text
0 3 * * 0
```

### First Day of Every Month at Midnight

```text
0 0 1 * *
```

---

# 24. CronJob Schedule Examples

| Schedule       | Meaning                  |
| -------------- | ------------------------ |
| `* * * * *`    | Every minute             |
| `*/5 * * * *`  | Every 5 minutes          |
| `0 * * * *`    | Every hour               |
| `0 0 * * *`    | Every day at midnight    |
| `0 2 * * *`    | Every day at 2 AM        |
| `0 3 * * 0`    | Every Sunday at 3 AM     |
| `0 0 1 * *`    | First day of every month |
| `30 1 * * 1-5` | 1:30 AM Monday-Friday    |

---

# 25. CronJob Time Zone

CronJob schedules can be associated with a time zone using the `timeZone` field on supported Kubernetes versions.

Example:

```yaml
spec:
  schedule: "0 2 * * *"
  timeZone: "Asia/Kolkata"
```

This means the schedule is interpreted using the specified time zone.

Always verify the Kubernetes version and supported time-zone behavior in the target cluster.

Avoid relying on implicit cluster/controller time-zone assumptions for critical schedules.

---

# 26. CronJob → Job → Pod

This relationship is extremely important.

```text
CronJob
   │
   │ Schedule triggers
   ▼
 Job
   │
   │ Creates
   ▼
 Pod
   │
   │ Runs
   ▼
Container
```

For example:

```text
CronJob: database-backup
        │
        │ 02:00 every day
        ▼
Job: database-backup-291827
        │
        ▼
Pod
        │
        ▼
Backup Container
        │
        ▼
Backup Complete
```

---

# 27. CronJob `jobTemplate`

The `jobTemplate` defines the Job that the CronJob creates.

Example:

```yaml
spec:
  schedule: "0 2 * * *"

  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never

          containers:
            - name: backup
              image: backup-tool:1.0
```

Think of it as:

```text
CronJob
   │
   └── Job Template
           │
           └── Pod Template
                   │
                   └── Container
```

---

# 28. CronJob Concurrency Policy

CronJobs may overlap if a previous Job is still running when the next scheduled time arrives.

Kubernetes provides:

```text
Allow
Forbid
Replace
```

through:

```yaml
concurrencyPolicy:
```

---

# 29. `Allow`

Example:

```yaml
concurrencyPolicy: Allow
```

Multiple Jobs can run concurrently.

Example:

```text
02:00 → Job 1 ────────────────►
03:00 → Job 2 ────────────────►
04:00 → Job 3 ────────────────►
```

This is the default behavior.

---

# 30. `Forbid`

Example:

```yaml
concurrencyPolicy: Forbid
```

If a previous Job is still running when the next schedule occurs, Kubernetes does not start a new Job for that scheduled occurrence.

Example:

```text
02:00 → Job 1 ───────────────────►
03:00 → Job 2 skipped
04:00 → Job 3 ───────────────────►
```

This is useful when overlapping executions could cause problems.

---

# 31. `Replace`

Example:

```yaml
concurrencyPolicy: Replace
```

If a previous Job is still running when a new scheduled execution is due, the running Job is replaced according to CronJob controller behavior.

Conceptually:

```text
02:00 → Job 1 ───────────────►
03:00 → Job 1 replaced
          │
          ▼
        Job 2
```

Use carefully because replacing an active workload may interrupt processing.

---

# 32. Choosing Concurrency Policy

| Policy    | Behavior             | Use Case                                  |
| --------- | -------------------- | ----------------------------------------- |
| `Allow`   | Jobs may overlap     | Independent tasks                         |
| `Forbid`  | Skip overlapping run | Backups/maintenance that must not overlap |
| `Replace` | Replace running Job  | Tasks where newest run should take over   |

For database backups, for example, `Forbid` may be more appropriate than `Allow` if concurrent backups are undesirable.

---

# 33. CronJob History Limits

CronJobs can retain completed and failed Jobs.

Configure:

```yaml
successfulJobsHistoryLimit: 3
failedJobsHistoryLimit: 1
```

Example:

```yaml
spec:
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
```

This keeps a limited history of completed Jobs.

---

# 34. Why History Limits Matter

Without limits:

```text
CronJob
 │
 ├── Job 1
 ├── Job 2
 ├── Job 3
 ├── ...
 └── Job 5000
```

With history limits:

```text
CronJob
 │
 ├── Recent successful Jobs
 └── Recent failed Jobs
```

This helps prevent unnecessary object accumulation.

---

# 35. Suspending a CronJob

A CronJob can be suspended.

Example:

```yaml
spec:
  suspend: true
```

This prevents new Jobs from being scheduled while allowing existing Jobs to continue according to their current lifecycle.

To resume:

```yaml
spec:
  suspend: false
```

Using kubectl:

```bash
kubectl patch cronjob backup-cron \
  -p '{"spec":{"suspend":true}}'
```

Resume:

```bash
kubectl patch cronjob backup-cron \
  -p '{"spec":{"suspend":false}}'
```

---

# 36. Starting a Job Manually From a CronJob

You may need to run a CronJob immediately without waiting for its schedule.

A common approach is:

```bash
kubectl create job \
  --from=cronjob/backup-cron \
  manual-backup
```

Then:

```bash
kubectl get jobs
```

This creates a separate Job using the CronJob's Job template.

---

# 37. CronJob Starting Deadline

CronJobs support:

```yaml
startingDeadlineSeconds:
```

This controls how long Kubernetes considers a missed scheduled run eligible to start.

Example:

```yaml
spec:
  startingDeadlineSeconds: 300
```

This can be useful when controller downtime or scheduling delays cause a scheduled execution to be missed.

For important schedules, understand how this interacts with your scheduling and failure-recovery requirements.

---

# 38. CronJob Suspend Example

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: report-generator

spec:
  schedule: "0 6 * * *"
  suspend: true

  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never

          containers:
            - name: report
              image: report-generator:1.0
```

The CronJob remains defined but will not create new scheduled Jobs while suspended.

---

# 39. Complete CronJob Example

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup

spec:
  schedule: "0 2 * * *"

  timeZone: "Asia/Kolkata"

  concurrencyPolicy: Forbid

  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3

  startingDeadlineSeconds: 600

  jobTemplate:
    spec:
      backoffLimit: 3

      ttlSecondsAfterFinished: 86400

      template:
        spec:
          restartPolicy: Never

          containers:
            - name: backup
              image: backup-tool:1.0.0

              resources:
                requests:
                  cpu: "100m"
                  memory: "128Mi"

                limits:
                  cpu: "500m"
                  memory: "512Mi"

              env:
                - name: BACKUP_ENV
                  value: "production"
```

This example demonstrates:

* Daily scheduling
* Time-zone configuration
* Preventing overlapping Jobs
* Job history retention
* Missed schedule handling
* Retry behavior
* Completed Job cleanup
* Resource configuration
* Environment variables

---

# 40. Job With ConfigMap

A Job can consume configuration from a ConfigMap.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: config-job

spec:
  template:
    spec:
      restartPolicy: Never

      containers:
        - name: worker
          image: my-worker:1.0

          envFrom:
            - configMapRef:
                name: worker-config
```

The same pattern used by Deployments can be used by Jobs.

---

# 41. Job With Secret

Sensitive values should be provided through Secrets.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: secure-job

spec:
  template:
    spec:
      restartPolicy: Never

      containers:
        - name: worker
          image: my-worker:1.0

          env:
            - name: API_TOKEN
              valueFrom:
                secretKeyRef:
                  name: api-secret
                  key: token
```

Do not hard-code sensitive credentials into Job manifests or container images.

---

# 42. Job With Volume

Jobs can use volumes.

Example:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: file-processing-job

spec:
  template:
    spec:
      restartPolicy: Never

      containers:
        - name: processor
          image: file-processor:1.0

          volumeMounts:
            - name: workdir
              mountPath: /work

      volumes:
        - name: workdir
          emptyDir: {}
```

For persistent data, use an appropriate persistent storage mechanism instead of relying on `emptyDir`.

---

# 43. Job Resource Management

Jobs can consume significant cluster resources.

Define requests and limits:

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"

  limits:
    cpu: "1"
    memory: "1Gi"
```

For parallel Jobs, remember:

```text
Per-Pod resources × Parallel Pods
```

Example:

```text
CPU request = 500m
Parallelism = 10

Potential concurrent CPU requests = 5 CPUs
```

This should be considered when planning cluster capacity.

---

# 44. Job Backoff and Idempotency

Jobs may retry.

Therefore, applications should ideally be **idempotent**.

Idempotent means running the same operation multiple times does not create an incorrect result.

For example:

```text
Bad:
Create duplicate database records every retry.

Better:
Check whether record already exists before creating it.
```

This is especially important for:

* Database migrations
* Payment processing
* Data imports
* External API calls
* File processing

---

# 45. Job Design for Failures

A robust Job should handle:

```text
Application Failure
       │
       ▼
Container Exit
       │
       ▼
Job Retry
       │
       ▼
Task Re-execution
```

The application should safely handle retry scenarios.

Consider:

* Duplicate execution
* Partial completion
* External API side effects
* Database transactions
* Temporary network failures

---

# 46. Job Timeouts

Jobs can use:

```yaml
activeDeadlineSeconds:
```

to limit how long a Job may remain active.

Example:

```yaml
spec:
  activeDeadlineSeconds: 3600
```

This limits the active lifetime of the Job to approximately one hour.

If the Job exceeds the configured deadline, Kubernetes terminates the Job according to Job controller behavior.

---

# 47. Job Example With Deadline

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-processing

spec:
  activeDeadlineSeconds: 1800
  backoffLimit: 3

  template:
    spec:
      restartPolicy: Never

      containers:
        - name: processor
          image: data-processor:1.0.0
```

This provides:

```text
Maximum active time = 30 minutes
Retry limit          = 3
```

---

# 48. Job and Node Scheduling

Jobs use the normal Kubernetes scheduling mechanisms.

You can specify:

* Node selectors
* Node affinity
* Tolerations
* Resource requests
* Resource limits

Example:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        workload: batch

      containers:
        - name: worker
          image: batch-worker:1.0
```

This can keep batch workloads on dedicated nodes.

---

# 49. Dedicated Batch Nodes

A cluster may use dedicated nodes for batch processing:

```text
Kubernetes Cluster
       │
       ├── Application Nodes
       │
       ├── Database Nodes
       │
       └── Batch Nodes
               │
               ├── Job
               ├── Job
               └── CronJob
```

This can help isolate resource-intensive batch workloads from user-facing applications.

---

# 50. Job Priority

Jobs can use Kubernetes PriorityClasses.

Example:

```yaml
priorityClassName: batch-high-priority
```

This can influence scheduling when cluster resources are constrained.

Use priority carefully because high-priority workloads can affect other workloads.

---

# 51. Jobs and Service Accounts

A Job can use a ServiceAccount.

Example:

```yaml
spec:
  template:
    spec:
      serviceAccountName: batch-worker
```

If the Job needs to communicate with the Kubernetes API, configure appropriate RBAC.

Architecture:

```text
Job
 │
 ▼
Pod
 │
 ▼
ServiceAccount
 │
 ▼
RBAC Permissions
 │
 ▼
Kubernetes API
```

Follow the principle of least privilege.

---

# 52. Job Security

Recommended practices:

* Run containers as non-root where possible.
* Use trusted images.
* Pin image versions.
* Avoid privileged containers.
* Restrict ServiceAccount permissions.
* Avoid hard-coded secrets.
* Use Secrets for sensitive data.
* Use read-only filesystems where practical.
* Define resource requests and limits.
* Scan images for vulnerabilities.

Example:

```yaml
securityContext:
  runAsNonRoot: true
  allowPrivilegeEscalation: false
```

---

# 53. CronJob Security

CronJobs require the same security considerations as other Kubernetes workloads.

Additionally:

* Review who can create/modify CronJobs.
* Protect scheduled tasks from unauthorized changes.
* Secure credentials used by scheduled jobs.
* Monitor Job failures.
* Prevent overlapping executions where unsafe.
* Control access to backup destinations.
* Avoid excessive permissions.

---

# 54. Database Backup CronJob

A common use case is automated database backup.

Architecture:

```text
                  CronJob
                     │
                     │ 02:00
                     ▼
                    Job
                     │
                     ▼
                    Pod
                     │
                     ▼
             Backup Container
                     │
                     ▼
              Database
                     │
                     ▼
              Backup Storage
```

Example:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup

spec:
  schedule: "0 2 * * *"
  concurrencyPolicy: Forbid

  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never

          containers:
            - name: backup
              image: database-backup:1.0.0
```

In production, authentication, storage, encryption, retention, and restore testing must also be addressed.

---

# 55. Database Migration Job

Database migrations are another common Job use case.

```text
Deployment
    │
    │ Application release
    ▼
Migration Job
    │
    ▼
Database
    │
    ▼
Migration Complete
    │
    ▼
Application Deployment
```

Example:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: database-migration

spec:
  backoffLimit: 2

  template:
    spec:
      restartPolicy: Never

      containers:
        - name: migration
          image: application:2.0.0
          command:
            - /app/migrate
```

Migration Jobs should be designed to handle retries safely.

---

# 56. Cleanup CronJob

A CronJob can periodically remove temporary data.

Example:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup

spec:
  schedule: "0 1 * * *"

  concurrencyPolicy: Forbid

  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never

          containers:
            - name: cleanup
              image: cleanup-tool:1.0.0
              command:
                - /bin/sh
                - -c
                - |
                  echo "Cleaning temporary data"
```

---

# 57. Report Generation CronJob

A scheduled report system could look like:

```text
CronJob
   │
   │ Every Monday 06:00
   ▼
Job
   │
   ▼
Report Generator
   │
   ├── Query Database
   ├── Generate Report
   └── Store Report
```

The Job terminates after successfully generating the report.

---

# 58. Batch Processing

Jobs are useful for large datasets.

Example:

```text
Dataset
   │
   ▼
Batch Job
   │
   ├── Partition 1
   ├── Partition 2
   ├── Partition 3
   └── Partition 4
          │
          ▼
       Results
```

For high-volume processing, use appropriate `parallelism`, resource limits, and workload partitioning.

---

# 59. Checking Jobs

List Jobs:

```bash
kubectl get jobs
```

Across all namespaces:

```bash
kubectl get jobs -A
```

Detailed information:

```bash
kubectl describe job <job-name>
```

Get YAML:

```bash
kubectl get job <job-name> -o yaml
```

---

# 60. Checking CronJobs

List CronJobs:

```bash
kubectl get cronjobs
```

Short form:

```bash
kubectl get cj
```

Detailed information:

```bash
kubectl describe cronjob <cronjob-name>
```

Get YAML:

```bash
kubectl get cronjob <cronjob-name> -o yaml
```

---

# 61. Checking Job Pods

Find Pods associated with a Job:

```bash
kubectl get pods
```

You can also inspect Job metadata and labels:

```bash
kubectl describe job <job-name>
```

Then view logs:

```bash
kubectl logs <pod-name>
```

---

# 62. Viewing Job Logs

For a completed Job:

```bash
kubectl logs <pod-name>
```

Follow logs:

```bash
kubectl logs -f <pod-name>
```

For a Pod with multiple containers:

```bash
kubectl logs <pod-name> -c <container-name>
```

---

# 63. Viewing Failed Job Logs

If a Job fails, first find its Pod:

```bash
kubectl get pods
```

Then:

```bash
kubectl logs <pod-name>
```

Also inspect:

```bash
kubectl describe job <job-name>
```

and:

```bash
kubectl describe pod <pod-name>
```

---

# 64. Job Status

Example:

```bash
kubectl get jobs
```

Output:

```text
NAME            COMPLETIONS   DURATION   AGE
data-import     1/1           30s        5m
```

A successful Job might show:

```text
1/1
```

A Job requiring multiple completions might show:

```text
5/10
```

---

# 65. CronJob Status

Example:

```bash
kubectl get cronjobs
```

Output may contain fields such as:

```text
NAME              SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE
database-backup   0 2 * * *     False     0        <time>
```

Important fields include:

* Schedule
* Suspend state
* Active Jobs
* Last scheduled time

---

# 66. Troubleshooting Jobs

Use this workflow:

```text
Job
 │
 ▼
Check Job Status
 │
 ▼
Check Job Events
 │
 ▼
Check Pod Status
 │
 ▼
Check Container Logs
 │
 ▼
Check Exit Code
 │
 ▼
Check Resources
 │
 ▼
Check Image
 │
 ▼
Check Configuration
```

Useful commands:

```bash
kubectl get jobs
kubectl describe job <job-name>
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl get events --sort-by=.lastTimestamp
```

---

# 67. Common Job Problem: Job Never Completes

Possible causes:

* Application is stuck.
* Container does not exit.
* External dependency is unavailable.
* Database query is taking too long.
* Application is waiting indefinitely.
* Incorrect command.

Check:

```bash
kubectl describe pod <pod-name>
```

and:

```bash
kubectl logs <pod-name>
```

Consider using:

```yaml
activeDeadlineSeconds: 3600
```

for tasks that should have a maximum execution time.

---

# 68. Common Job Problem: BackoffLimitExceeded

You may see:

```text
BackoffLimitExceeded
```

This means the Job has reached its configured failure retry threshold.

Check:

```bash
kubectl describe job <job-name>
```

Then inspect the failed Pod logs:

```bash
kubectl logs <pod-name>
```

Common causes:

* Application errors
* Invalid configuration
* Database connectivity problems
* Authentication failure
* Missing files
* Incorrect command
* Resource limits

---

# 69. Common Job Problem: ImagePullBackOff

Possible causes:

* Incorrect image name
* Invalid tag
* Private registry authentication failure
* Registry unavailable

Check:

```bash
kubectl describe pod <pod-name>
```

For private registries:

```yaml
imagePullSecrets:
  - name: registry-secret
```

---

# 70. Common Job Problem: OOMKilled

A Job may be terminated because the container exceeds its memory limit.

Check:

```bash
kubectl describe pod <pod-name>
```

Look for:

```text
Reason: OOMKilled
```

Review:

```yaml
resources:
  requests:
    memory: "512Mi"

  limits:
    memory: "1Gi"
```

Also investigate application memory usage before simply increasing the limit.

---

# 71. Common CronJob Problem: Jobs Are Not Starting

Check:

```bash
kubectl get cronjob <cronjob-name>
```

Then:

```bash
kubectl describe cronjob <cronjob-name>
```

Possible causes:

* CronJob is suspended.
* Invalid schedule.
* Incorrect time zone configuration.
* Controller issues.
* Concurrency policy.
* Starting deadline behavior.
* Resource/scheduling problems in created Jobs.

---

# 72. Common CronJob Problem: Jobs Overlap

If Jobs overlap unexpectedly, check:

```yaml
concurrencyPolicy: Allow
```

If overlapping executions are unsafe, consider:

```yaml
concurrencyPolicy: Forbid
```

Example:

```yaml
spec:
  schedule: "0 * * * *"
  concurrencyPolicy: Forbid
```

---

# 73. Common CronJob Problem: Too Many Jobs

Check:

```yaml
successfulJobsHistoryLimit: 3
failedJobsHistoryLimit: 1
```

You can also use Job TTL:

```yaml
ttlSecondsAfterFinished: 3600
```

These mechanisms help control completed Job retention.

---

# 74. Job vs Deployment

| Feature          | Job                        | Deployment                 |
| ---------------- | -------------------------- | -------------------------- |
| Purpose          | Complete a task            | Run long-lived application |
| Completion       | Yes                        | No                         |
| Restart/retry    | Yes                        | Yes                        |
| Typical workload | Batch processing           | Web application            |
| Pod lifecycle    | Ends after task completion | Continues running          |
| Scaling model    | Completions/parallelism    | Replicas                   |
| Example          | Database migration         | API server                 |

---

# 75. Job vs DaemonSet

| Feature           | Job                            | DaemonSet               |
| ----------------- | ------------------------------ | ----------------------- |
| Purpose           | Complete a task                | Run node-level service  |
| Runs continuously | Usually no                     | Usually yes             |
| Node-based        | No                             | Yes                     |
| Completion        | Yes                            | No                      |
| Typical use       | Batch task                     | Monitoring agent        |
| Scheduling        | Based on workload requirements | Based on eligible nodes |

---

# 76. CronJob vs DaemonSet

| Feature            | CronJob        | DaemonSet          |
| ------------------ | -------------- | ------------------ |
| Purpose            | Scheduled task | Node-level service |
| Execution          | Periodic       | Continuous         |
| Pod completion     | Yes            | No                 |
| Runs on every node | No             | Usually            |
| Example            | Nightly backup | Log collector      |

---

# 77. Job vs CronJob

| Feature            | Job                | CronJob                    |
| ------------------ | ------------------ | -------------------------- |
| Execution          | One-time/on-demand | Scheduled                  |
| Creates Jobs       | No                 | Yes                        |
| Uses cron schedule | No                 | Yes                        |
| Typical use        | Migration          | Daily backup               |
| Completion         | Yes                | Each created Job completes |

---

# 78. Deployment vs Job vs CronJob

```text
Deployment
   │
   └── "Keep my application running"

Job
   │
   └── "Run this task until it completes"

CronJob
   │
   └── "Run this task on a schedule"
```

This distinction is one of the most important Kubernetes workload concepts.

---

# 79. Jobs and CronJobs in CI/CD

Jobs can be useful in CI/CD workflows for:

* Database migrations
* Data initialization
* Smoke tests
* Integration tests
* One-time deployment tasks
* Post-deployment validation

Example:

```text
CI/CD Pipeline
      │
      ▼
Deploy Application
      │
      ▼
Run Migration Job
      │
      ▼
Run Validation Job
      │
      ▼
Deployment Complete
```

---

# 80. Job Best Practices

### 80.1 Make Jobs Idempotent

Design tasks so retries do not cause corruption or duplicate side effects.

### 80.2 Define Resource Requests

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
```

### 80.3 Define Appropriate Limits

```yaml
resources:
  limits:
    cpu: "1"
    memory: "1Gi"
```

### 80.4 Configure Retry Behavior

```yaml
backoffLimit: 3
```

### 80.5 Configure Timeouts

```yaml
activeDeadlineSeconds: 3600
```

### 80.6 Clean Up Completed Jobs

Use:

```yaml
ttlSecondsAfterFinished: 3600
```

when appropriate.

### 80.7 Secure Credentials

Use:

```text
Secrets
```

instead of hard-coded credentials.

---

# 81. CronJob Best Practices

### Use a Clear Schedule

Example:

```yaml
schedule: "0 2 * * *"
```

### Avoid Unnecessary Overlap

For non-concurrent workloads:

```yaml
concurrencyPolicy: Forbid
```

### Configure History Limits

```yaml
successfulJobsHistoryLimit: 3
failedJobsHistoryLimit: 3
```

### Consider Time Zones

For business-critical schedules:

```yaml
timeZone: "Asia/Kolkata"
```

or the appropriate organizational time zone.

### Monitor Failures

A scheduled Job that silently fails can result in missed backups or reports.

### Make Scheduled Tasks Idempotent

CronJobs can encounter retries or operational edge cases, so task logic should safely tolerate repeated execution where possible.

---

# 82. Production Backup Pattern

A robust backup architecture may look like:

```text
                     CronJob
                        │
                   Every Night
                        │
                        ▼
                       Job
                        │
                        ▼
                  Backup Pod
                        │
                        ▼
                 Backup Process
                        │
                        ▼
              Encrypted Storage
                        │
                        ▼
                 Backup Retention
```

Important considerations include:

* Encryption
* Access control
* Retention
* Monitoring
* Failure alerts
* Restore testing
* Storage capacity
* Network connectivity

> A backup system should be tested by performing actual restores. A successfully completed backup Job alone does not prove that the backup is recoverable.

---

# 83. Production Batch Processing Pattern

```text
                   CronJob
                      │
                      ▼
                     Job
                      │
              ┌───────┼───────┐
              ▼       ▼       ▼
            Pod 1   Pod 2   Pod 3
              │       │       │
              └───────┼───────┘
                      ▼
                  Data Store
```

Use:

```yaml
completions: 10
parallelism: 3
```

when the workload can safely be partitioned into ten tasks with up to three running simultaneously.

---

# 84. Complete Production-Oriented Job Example

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-migration

spec:
  completions: 1
  parallelism: 1
  backoffLimit: 3
  activeDeadlineSeconds: 1800
  ttlSecondsAfterFinished: 86400

  template:
    metadata:
      labels:
        app: data-migration

    spec:
      restartPolicy: Never

      containers:
        - name: migration
          image: example/migration:1.2.0

          envFrom:
            - configMapRef:
                name: migration-config

          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: password

          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"

            limits:
              cpu: "1"
              memory: "1Gi"

          securityContext:
            runAsNonRoot: true
            allowPrivilegeEscalation: false
```

---

# 85. Complete Production-Oriented CronJob Example

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-report

spec:
  schedule: "0 2 * * *"
  timeZone: "Asia/Kolkata"

  concurrencyPolicy: Forbid

  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3

  startingDeadlineSeconds: 900

  jobTemplate:
    spec:
      backoffLimit: 3
      activeDeadlineSeconds: 3600
      ttlSecondsAfterFinished: 86400

      template:
        metadata:
          labels:
            app: nightly-report

        spec:
          restartPolicy: Never

          containers:
            - name: report-generator
              image: example/report-generator:2.1.0

              resources:
                requests:
                  cpu: "250m"
                  memory: "256Mi"

                limits:
                  cpu: "1"
                  memory: "1Gi"

              securityContext:
                runAsNonRoot: true
                allowPrivilegeEscalation: false
```

---

# 86. Monitoring Jobs and CronJobs

Important metrics and signals include:

```text
Job Success
Job Failure
Job Duration
Pod Failure
Container Exit Code
Restart Count
CPU Usage
Memory Usage
Schedule Misses
Active Job Count
```

For CronJobs, monitor:

```text
Last Successful Run
Last Failed Run
Schedule Delays
Active Jobs
Missed Schedules
```

A production monitoring architecture might be:

```text
CronJob
   │
   ▼
Job
   │
   ├── Logs
   ├── Metrics
   └── Events
          │
          ▼
   Monitoring Platform
          │
          ▼
       Alerting
```

---

# 87. Alerting Recommendations

Consider alerts for:

* Job failures
* Repeated Job failures
* CronJob not running
* Backup Job failure
* Excessive Job duration
* OOMKilled containers
* Image pull failures
* Persistent scheduling failures
* Missed critical schedules

For business-critical CronJobs, monitoring only Kubernetes Pod status may not be enough. Also validate that the expected business result was produced.

---

# 88. Troubleshooting Checklist

```text
Job/CronJob Troubleshooting
│
├── Is the Job/CronJob created?
│
├── Is the CronJob suspended?
│
├── Is the schedule correct?
│
├── Is the time zone correct?
│
├── Is a concurrency policy preventing execution?
│
├── Was the Job created?
│
├── Is the Pod scheduled?
│
├── Is the image available?
│
├── Are configuration values correct?
│
├── Are Secrets available?
│
├── Is the application failing?
│
├── Are resources sufficient?
│
├── Is the Job timing out?
│
└── Is the application safe to retry?
```

---

# 89. Useful kubectl Command Reference

| Command                                               | Purpose                          |
| ----------------------------------------------------- | -------------------------------- |
| `kubectl get jobs`                                    | List Jobs                        |
| `kubectl get jobs -A`                                 | List Jobs across namespaces      |
| `kubectl describe job <name>`                         | Inspect Job                      |
| `kubectl get job <name> -o yaml`                      | Get Job YAML                     |
| `kubectl delete job <name>`                           | Delete Job                       |
| `kubectl get cronjobs`                                | List CronJobs                    |
| `kubectl get cj`                                      | Short form                       |
| `kubectl describe cronjob <name>`                     | Inspect CronJob                  |
| `kubectl get cronjob <name> -o yaml`                  | Get CronJob YAML                 |
| `kubectl delete cronjob <name>`                       | Delete CronJob                   |
| `kubectl get pods`                                    | List Pods                        |
| `kubectl describe pod <name>`                         | Inspect Job Pod                  |
| `kubectl logs <pod>`                                  | View Job logs                    |
| `kubectl get events --sort-by=.lastTimestamp`         | View events                      |
| `kubectl create job --from=cronjob/<name> <job-name>` | Manually create Job from CronJob |

---

# 90. Interview Questions

## What is a Kubernetes Job?

A Job creates Pods and ensures that a specified task successfully completes.

## What is a CronJob?

A CronJob creates Jobs according to a recurring schedule.

## What is the difference between a Job and a Deployment?

A Job is designed for tasks that finish, while a Deployment is designed to maintain continuously running application Pods.

## What is the difference between a Job and a CronJob?

A Job runs on demand or as a one-time workload. A CronJob creates Jobs periodically according to a schedule.

## What is `completions`?

It specifies how many successful Pod completions are required for a Job to be considered complete.

## What is `parallelism`?

It specifies the maximum number of Job Pods that can run concurrently.

## What is `backoffLimit`?

It controls how many Pod failures/retries are allowed before the Job is considered failed.

## What is `activeDeadlineSeconds`?

It limits how long a Job may remain active.

## What is `ttlSecondsAfterFinished`?

It allows completed Jobs to become eligible for automatic cleanup after a specified period.

## What is `concurrencyPolicy`?

It controls whether Jobs created by a CronJob can overlap.

The options are:

```text
Allow
Forbid
Replace
```

## What is the default CronJob concurrency policy?

The default is:

```text
Allow
```

## How do you prevent CronJobs from overlapping?

Use:

```yaml
concurrencyPolicy: Forbid
```

## How do you suspend a CronJob?

Set:

```yaml
suspend: true
```

or use:

```bash
kubectl patch cronjob <name> \
  -p '{"spec":{"suspend":true}}'
```

## How can you run a CronJob manually?

Create a Job from the CronJob:

```bash
kubectl create job \
  --from=cronjob/<cronjob-name> \
  <job-name>
```

## What is an Indexed Job?

An Indexed Job assigns completion indexes to successful completions, allowing workers to process distinct partitions or tasks.

## Why should Jobs be idempotent?

Because Jobs may retry after failures. An idempotent task can safely execute more than once without causing incorrect side effects.

## Can Jobs use ConfigMaps and Secrets?

Yes. Jobs use normal Pod configuration mechanisms, including ConfigMaps and Secrets.

## Can Jobs use Persistent Volumes?

Yes. Jobs can mount persistent storage when required.

## Can CronJobs run on specific nodes?

Yes. Their Pod template can use:

* `nodeSelector`
* Node affinity
* Taints and tolerations

## Can a Job have multiple containers?

Yes. A Job's Pod can contain multiple containers, although they should have a clear relationship to the task.

---

# 91. Quick Comparison

```text
┌──────────────┬─────────────────────────────────────┐
│ Deployment   │ Keep application running            │
├──────────────┼─────────────────────────────────────┤
│ DaemonSet    │ Run agent on eligible nodes         │
├──────────────┼─────────────────────────────────────┤
│ StatefulSet  │ Manage stateful workloads            │
├──────────────┼─────────────────────────────────────┤
│ Job          │ Run task until completion            │
├──────────────┼─────────────────────────────────────┤
│ CronJob      │ Run Jobs on a schedule               │
└──────────────┴─────────────────────────────────────┘
```

---

# 92. Key Takeaways

```text
Job
│
├── Runs a task
├── Creates Pods
├── Tracks successful completions
├── Supports retries
├── Supports parallelism
├── Can have execution deadlines
└── Can be automatically cleaned up


CronJob
│
├── Runs on a schedule
├── Creates Jobs
├── Supports concurrency policies
├── Supports history limits
├── Can be suspended
├── Supports time zones
└── Can create recurring batch workloads
```

The fundamental relationship is:

```text
CronJob
   │
   │ Schedule
   ▼
 Job
   │
   │ Creates
   ▼
 Pod
   │
   │ Runs
   ▼
Container
   │
   ▼
Task
   │
   ▼
Completed
```

The core rule to remember is:

> **Use a Job when you need a task to run until completion. Use a CronJob when you need that Job to run repeatedly on a schedule.**

For production workloads, combine Jobs and CronJobs with **resource management, retries, timeouts, cleanup policies, security controls, monitoring, alerting, and idempotent application design**.
