"""Create a deterministic 1,000-question DevOps interview bank.

The committed base bank remains intact. This generator adds category-balanced,
scenario-oriented questions so topic coverage can be extended without hand
editing a large JSON document.
"""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
QUESTION_FILE = ROOT / "interview-questions.json"
TARGET_COUNT = 1060

TOPICS = [
    ("Git and Source Control", "Git branch", "an isolated line of development", "protect main and release branches"),
    ("Git and Source Control", "pull request", "reviewing and approving a proposed change before merge", "require reviews and status checks"),
    ("Git and Source Control", "semantic version", "communicating compatibility through major, minor, and patch releases", "publish immutable release tags"),
    ("Git and Source Control", "merge conflict", "resolving overlapping changes that Git cannot combine automatically", "review the resulting code and run tests"),
    ("Git and Source Control", "trunk-based development", "integrating small changes frequently on a shared mainline", "keep feature branches short-lived"),
    ("CI/CD", "continuous integration", "automatically validating changes as they are integrated", "run tests on every pull request"),
    ("CI/CD", "continuous delivery", "keeping changes validated and ready for controlled release", "separate build promotion from production approval"),
    ("CI/CD", "artifact versioning", "making builds traceable and reproducible", "use immutable version identifiers"),
    ("CI/CD", "deployment approval", "requiring an accountable decision before sensitive promotion", "record the approval in the delivery system"),
    ("CI/CD", "rollback plan", "returning a service to a known healthy version after a failed release", "test rollback before an incident occurs"),
    ("GitHub Actions", "workflow", "orchestrating automation in response to repository events", "pin action versions and restrict permissions"),
    ("GitHub Actions", "job matrix", "testing across supported combinations of versions or platforms", "keep the matrix limited to meaningful combinations"),
    ("GitHub Actions", "artifact upload", "passing build outputs and reports between jobs", "give artifacts a versioned, discoverable name"),
    ("GitHub Actions", "environment protection", "gating deployments with environment-specific approvals and rules", "separate production secrets from lower environments"),
    ("GitHub Actions", "OIDC integration", "obtaining short-lived cloud credentials without stored cloud keys", "scope trust policy claims to the repository and branch"),
    ("Maven", "pom.xml", "declaring project metadata, dependencies, and build plugins", "keep versions centralized in dependency management"),
    ("Maven", "dependencyManagement", "standardizing dependency versions across child modules", "update shared versions through review and testing"),
    ("Maven", "Maven profile", "applying environment-specific build configuration", "avoid placing secrets directly in profiles"),
    ("Maven", "SNAPSHOT version", "identifying a mutable development build", "publish immutable versions for released software"),
    ("Maven", "multi-module build", "building related components with shared configuration and dependency order", "keep module boundaries clear"),
    ("Nexus and Artifactory", "artifact repository", "storing and distributing versioned build packages", "require authenticated publishing"),
    ("Nexus and Artifactory", "repository proxy", "caching approved upstream dependencies for reliable builds", "define allowed upstream sources"),
    ("Nexus and Artifactory", "hosted repository", "publishing internally produced packages", "enforce immutable release versions"),
    ("Nexus and Artifactory", "repository cleanup policy", "removing obsolete artifacts while retaining required releases", "align retention with compliance requirements"),
    ("Nexus and Artifactory", "artifact promotion", "moving a verified build through controlled repository stages", "promote the same immutable artifact rather than rebuilding"),
    ("Bamboo", "Bamboo plan", "defining a repeatable build and test workflow", "keep credentials out of build scripts"),
    ("Bamboo", "Bamboo deployment project", "promoting a build artifact across deployment environments", "add approvals for production environments"),
    ("Bamboo", "Bamboo agent", "executing build jobs on designated worker infrastructure", "isolate agents that handle sensitive workloads"),
    ("Bamboo", "Bamboo variable", "parameterizing a plan or deployment without duplicating configuration", "store sensitive values in protected secret storage"),
    ("Bamboo", "deployment release", "tracking a specific build artifact through an environment", "record the source revision and artifact version"),
    ("Terraform", "Terraform provider", "translating declarative resources into platform API operations", "pin provider versions and review upgrades"),
    ("Terraform", "Terraform module", "reusing a tested infrastructure pattern", "version modules and expose a narrow interface"),
    ("Terraform", "remote state backend", "sharing infrastructure state safely among collaborators", "enable encryption and state locking"),
    ("Terraform", "state lock", "preventing concurrent state writes during infrastructure changes", "investigate a stale lock before force-unlocking"),
    ("Terraform", "workspace", "separating state for distinct environments or contexts", "use explicit environment naming and access controls"),
    ("Terraform", "terraform plan", "reviewing proposed infrastructure changes before apply", "treat destructive changes as a review gate"),
    ("Terraform", "terraform import", "bringing an existing resource under Terraform management", "write matching configuration before relying on the import"),
    ("Terraform", "drift detection", "identifying changes made outside declared infrastructure code", "investigate and reconcile drift through reviewed code"),
    ("AWS", "VPC", "providing an isolated virtual network for cloud resources", "design address ranges before creating subnets"),
    ("AWS", "public subnet", "hosting resources that require a route to an internet gateway", "expose only necessary ports through security controls"),
    ("AWS", "private subnet", "isolating internal resources from direct inbound internet access", "use controlled outbound access when required"),
    ("AWS", "NAT gateway", "allowing private workloads outbound internet access without direct inbound exposure", "place it according to availability and cost requirements"),
    ("AWS", "route table", "directing traffic between subnets and network destinations", "review routes whenever network reachability changes"),
    ("AWS", "security group", "filtering allowed inbound and outbound traffic for attached resources", "use narrowly scoped rules instead of broad CIDR ranges"),
    ("AWS", "IAM role", "granting temporary, scoped permissions to a workload or identity", "use least privilege and avoid long-lived keys"),
    ("AWS", "EC2 instance profile", "delivering an IAM role to a virtual machine", "avoid embedding access keys in the instance"),
    ("AWS", "Auto Scaling group", "maintaining desired EC2 capacity based on health and scaling policy", "ensure the launch template is versioned"),
    ("AWS", "CloudTrail", "recording AWS API activity for audit and investigation", "protect logs from modification and retain them appropriately"),
    ("Ansible", "inventory", "identifying managed hosts and their groups", "keep environment inventory under version control"),
    ("Ansible", "playbook", "declaring repeatable configuration tasks in YAML", "make tasks idempotent where possible"),
    ("Ansible", "role", "packaging reusable tasks, variables, templates, and handlers", "keep each role focused on one responsibility"),
    ("Ansible", "handler", "running a deferred action only when notified by a changed task", "use handlers for service restarts"),
    ("Ansible", "Ansible Vault", "encrypting sensitive variables and files", "manage vault access separately from source access"),
    ("Ansible", "AWX", "providing centralized job execution, scheduling, and access control for Ansible", "use job templates with credential boundaries"),
    ("Docker and Containers", "Dockerfile", "defining repeatable instructions for building a container image", "keep runtime images minimal"),
    ("Docker and Containers", "multi-stage build", "excluding build tools from the final runtime image", "copy only the required artifacts to the final stage"),
    ("Docker and Containers", ".dockerignore", "excluding unnecessary files from the image build context", "exclude local secrets and build outputs"),
    ("Docker and Containers", "container registry", "storing and distributing container images", "use immutable tags or digests for deployment"),
    ("Docker and Containers", "image digest", "identifying an exact immutable container image", "deploy a reviewed digest for production"),
    ("Docker and Containers", "container scan", "finding known vulnerabilities in image layers and packages", "block or review releases that exceed policy thresholds"),
    ("Helm", "Helm chart", "packaging Kubernetes resources with templated configuration", "version charts independently from applications"),
    ("Helm", "values file", "supplying environment-specific inputs to a chart", "keep secrets outside ordinary values files"),
    ("Helm", "Helm template", "rendering Kubernetes manifests from chart logic and values", "render and review output before deployment"),
    ("Helm", "Helm release", "tracking an installed chart instance in a cluster", "use a predictable release name and namespace"),
    ("Helm", "chart dependency", "including another chart as part of a deployment package", "pin dependency versions and review upgrades"),
    ("DevSecOps", "SAST", "analyzing source code for security weaknesses before runtime", "run it early in pull-request validation"),
    ("DevSecOps", "software composition analysis", "finding vulnerable or unapproved open-source dependencies", "review transitive dependencies as well as direct ones"),
    ("DevSecOps", "DAST", "testing a running application for externally observable weaknesses", "run it against a controlled test environment"),
    ("DevSecOps", "secret scanning", "detecting exposed credentials, tokens, or private keys", "rotate any exposed secret even after removal"),
    ("DevSecOps", "SBOM", "recording the components included in a software artifact", "generate it during the build and retain it with the release"),
    ("DevSecOps", "image signing", "verifying the origin and integrity of a container artifact", "enforce signature verification before deployment"),
    ("Authentication and Authorization", "authentication", "verifying the identity of a user or workload", "use strong factors and centralized identity where possible"),
    ("Authentication and Authorization", "authorization", "deciding which actions an authenticated identity may perform", "assign permissions through least-privilege roles"),
    ("Authentication and Authorization", "OAuth", "delegating access to a resource without sharing a user password", "restrict scopes to the minimum required"),
    ("Authentication and Authorization", "OpenID Connect", "federating identity through signed tokens", "validate issuer, audience, and token expiry"),
    ("Authentication and Authorization", "single sign-on", "centralizing access through a common identity provider", "require multi-factor authentication for privileged access"),
    ("Authentication and Authorization", "credential rotation", "limiting the useful lifetime of a secret or key", "automate rotation and test consumers before expiry"),
    ("Kubernetes Operations", "readiness probe", "preventing traffic from reaching a container that is not ready", "make the check represent real serving readiness"),
    ("Kubernetes Operations", "liveness probe", "restarting a container that is no longer healthy", "avoid checks that fail during normal slow startup"),
    ("Kubernetes Operations", "resource request", "reserving scheduler capacity for a workload", "base values on observed workload demand"),
    ("Kubernetes Operations", "resource limit", "bounding resource consumption by a container", "set memory limits carefully to avoid OOM kills"),
    ("Kubernetes Operations", "horizontal pod autoscaler", "adjusting replica counts from observed metrics", "verify metrics and capacity before enabling it"),
    ("Kubernetes Networking", "ClusterIP Service", "providing an internal stable endpoint for matching Pods", "select Pods with explicit labels"),
    ("Kubernetes Networking", "Ingress", "routing HTTP or HTTPS requests to Kubernetes Services", "configure TLS and controller-specific policies"),
    ("Kubernetes Networking", "NetworkPolicy", "controlling permitted Pod ingress and egress connections", "start with explicit required traffic paths"),
    ("Kubernetes Networking", "headless Service", "providing DNS discovery of individual Pods without a virtual IP", "use it for stateful peer discovery when needed"),
    ("Kubernetes Storage", "PersistentVolumeClaim", "requesting durable storage for a workload", "choose an access mode suitable for the workload"),
    ("Kubernetes Storage", "StorageClass", "defining how persistent volumes are provisioned", "make reclaim and expansion policy explicit"),
    ("Kubernetes Security", "Kubernetes RBAC", "controlling Kubernetes API access through roles and bindings", "grant only required verbs and resource types"),
    ("Kubernetes Security", "service account", "providing a workload identity for Kubernetes API access", "disable automatic token mounting when not needed"),
    ("Kubernetes Security", "Pod Security Standards", "restricting risky Pod security settings", "enforce the appropriate profile per namespace"),
    ("Observability", "structured logging", "making log fields queryable and consistent across services", "include correlation identifiers without recording secrets"),
    ("Observability", "distributed tracing", "following a request across service boundaries", "propagate trace context consistently"),
    ("Observability", "service level objective", "setting a reliability target for a user-visible service", "alert on error-budget burn rather than every event"),
    ("Production Troubleshooting", "incident timeline", "recording observed events and actions during an outage", "keep timestamps and sources precise"),
    ("Production Troubleshooting", "root cause analysis", "identifying the underlying conditions that caused an incident", "separate evidence from assumptions"),
]

QUESTION_FORMS = [
    ("What is {term} primarily used for?", "{purpose}", "It is a type of Docker image layer", "It is a replacement for source control", "It is an AWS network boundary"),
    ("Which outcome best describes using {term}?", "{purpose}", "It removes the need for testing", "It grants unrestricted administrator access", "It eliminates all operational monitoring"),
    ("During a production design review, why would a team choose {term}?", "To support {purpose}", "To bypass approval and audit controls", "To avoid versioning deployed software", "To expose all internal services publicly"),
    ("Which practice is most appropriate when adopting {term}?", "{practice}", "Store production secrets in source code", "Apply changes directly without review", "Use broad permanent credentials"),
    ("What risk is reduced by using {term} correctly?", "Inconsistent, untraceable, or insecure delivery and operations", "The need to observe production behavior", "The need for source control", "The need to understand application dependencies"),
    ("How should a team validate {term} before a production rollout?", "Test the expected behavior and review the resulting configuration or artifacts", "Skip validation to reduce delivery time", "Use only a local administrator account", "Disable logs during the rollout"),
    ("Which statement about {term} is accurate?", "It supports {purpose}", "It should always contain plaintext secrets", "It makes access controls unnecessary", "It replaces all deployment automation"),
    ("What is a common anti-pattern involving {term}?", "Using it without review, ownership, or appropriate access control", "Documenting its purpose and operating procedure", "Testing it in a non-production environment", "Tracking its configuration in version control"),
    ("What operational evidence would help confirm that {term} is working as intended?", "Relevant logs, metrics, test results, or audited configuration changes", "The absence of all monitoring data", "An unreviewed change in production", "A copied password in a ticket"),
    ("Why is governance important for {term}?", "It ensures {purpose} remains secure, repeatable, and auditable", "It allows teams to skip security checks", "It removes responsibility for production changes", "It makes rollback impossible"),
]


def make_question(identifier, category, term, purpose, practice, form):
    question, correct, wrong_one, wrong_two, wrong_three = form
    return {
        "id": identifier,
        "category": category,
        "difficulty": "Intermediate" if identifier % 3 else "Advanced",
        "question": question.format(term=term, purpose=purpose, practice=practice),
        "options": [
            correct.format(term=term, purpose=purpose, practice=practice),
            wrong_one,
            wrong_two,
            wrong_three,
        ],
        "answer": 0,
        "explanation": f"{term} is used for {purpose}. In production, teams should {practice}; this makes the implementation safer, repeatable, and easier to audit.",
    }


def main():
    questions = json.loads(QUESTION_FILE.read_text(encoding="utf-8"))
    base_questions = [question for question in questions if question.get("id", 0) <= 100]
    generated = []
    identifier = 101
    for category, term, purpose, practice in TOPICS:
        for form in QUESTION_FORMS:
            generated.append(make_question(identifier, category, term, purpose, practice, form))
            identifier += 1
            if len(base_questions) + len(generated) == TARGET_COUNT:
                break
        if len(base_questions) + len(generated) == TARGET_COUNT:
            break

    if len(base_questions) + len(generated) != TARGET_COUNT:
        raise ValueError("Topic catalogue does not provide enough generated questions")

    QUESTION_FILE.write_text(json.dumps(base_questions + generated, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(base_questions) + len(generated)} questions in {QUESTION_FILE}")


if __name__ == "__main__":
    main()