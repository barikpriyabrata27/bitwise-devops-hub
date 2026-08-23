# Pull Requests

## 1. What is a Pull Request?

A **Pull Request (PR)** is a request to merge changes from one branch into another branch.

A Pull Request provides a controlled mechanism for:

* Reviewing code
* Running automated checks
* Discussing changes
* Requesting modifications
* Approving changes
* Merging changes into the target branch

A Pull Request is **not the same as a Git merge**.

Git performs the actual merge operation, while GitHub provides the Pull Request workflow around that merge.

---

## 2. Basic Pull Request Flow

A typical Pull Request workflow is:

```text
Developer
    |
    v
Feature Branch
    |
    | Make changes
    v
Commit
    |
    v
Push Branch
    |
    v
Pull Request
    |
    +---- Code Review
    |
    +---- CI Checks
    |
    +---- Security Checks
    |
    +---- Approval
    |
    v
Merge
    |
    v
Target Branch
```

---

## 3. Creating a Pull Request

Assume the developer is implementing a login feature.

Create a feature branch:

```bash
git switch -c feature/login
```

Make the required changes.

Stage the changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Add login feature"
```

Push the branch:

```bash
git push -u origin feature/login
```

A Pull Request can then be created from:

```text
feature/login
        |
        v
     develop
```

for Git Flow, or:

```text
feature/login
        |
        v
       main
```

for GitHub Flow.

---

# 4. Source Branch and Target Branch

Every Pull Request has two important branches.

### Source Branch

The branch containing the changes.

Example:

```text
feature/login
```

### Target Branch

The branch into which the changes will be merged.

Example:

```text
develop
```

or:

```text
main
```

Conceptually:

```text
Source Branch              Target Branch

feature/login  ----------> develop
```

---

# 5. Pull Request Lifecycle

A Pull Request generally follows this lifecycle:

```text
Create PR
   |
   v
CI Checks
   |
   v
Code Review
   |
   v
Changes Requested?
   |
   +---- Yes ----> Developer Updates Branch
   |                    |
   |                    v
   |               CI Runs Again
   |                    |
   |                    v
   +---------------- Review
   |
   +---- No ----> Approval
                       |
                       v
                     Merge
```

---

# 6. Code Review

Code review is one of the primary purposes of a Pull Request.

Reviewers examine the proposed changes before they are merged.

Reviewers may check:

* Correctness
* Code quality
* Maintainability
* Security
* Test coverage
* Error handling
* Naming conventions
* Performance
* Configuration changes
* Unnecessary changes

A reviewer can:

* Approve the Pull Request
* Comment on the changes
* Request changes

---

# 7. Requested Changes

A reviewer may identify an issue and request changes.

Example:

```text
Developer
    |
    v
Pull Request
    |
    v
Code Review
    |
    v
Changes Requested
    |
    v
Developer fixes code
    |
    v
Push new commit
    |
    v
CI runs again
    |
    v
Review again
```

The developer normally does not need to create a new Pull Request.

New commits pushed to the same source branch are automatically associated with the existing Pull Request.

---

# 8. Pull Requests and CI

Pull Requests can trigger CI pipelines.

For example:

```text
Pull Request
      |
      v
Checkout Code
      |
      v
Build
      |
      v
Unit Tests
      |
      v
Code Quality
      |
      v
Security Scan
      |
      v
Result
```

The Pull Request can display the status of these checks.

A team can configure branch protection so that required checks must pass before merging.

GitHub Actions supports workflows that can build and test Pull Requests.

---

# 9. Pull Request Checks

Typical checks include:

### Build

Verify that the application can be compiled or packaged.

### Unit Tests

Verify individual components of the application.

### Integration Tests

Verify interaction between components or services.

### Code Quality

Examples:

* Linting
* Code coverage
* Static analysis
* SonarQube

### Security

Examples:

* SAST
* SCA
* Secret scanning
* Dependency scanning
* Container scanning

A typical enterprise Pull Request might therefore look like:

```text
Pull Request
     |
     +---- Build
     |
     +---- Unit Test
     |
     +---- Integration Test
     |
     +---- SonarQube
     |
     +---- Dependency Scan
     |
     +---- Security Scan
     |
     v
  Review
     |
     v
  Approval
     |
     v
   Merge
```

---

# 10. Branch Protection

Important branches such as `main` should normally be protected.

Without protection:

```text
Developer
    |
    | Direct Push
    v
  main
```

With branch protection:

```text
Developer
    |
    v
Feature Branch
    |
    v
Pull Request
    |
    +---- Required Checks
    |
    +---- Required Review
    |
    v
  main
```

Branch protection can be used to enforce policies such as:

* Pull Request requirement
* Required approvals
* Required status checks
* Restrictions on who can push
* Restrictions on force pushes
* Restrictions on branch deletion

---

# 11. Required Approvals

An organization can require one or more reviewers to approve a Pull Request.

Example:

```text
Pull Request
     |
     v
Reviewer 1 ---- Approved
     |
Reviewer 2 ---- Approved
     |
     v
Merge Allowed
```

The exact approval requirement depends on repository and branch rules.

---

# 12. CODEOWNERS

GitHub supports a `CODEOWNERS` file to define people or teams responsible for reviewing specific parts of a repository.

Example:

```text
# CODEOWNERS

*.java          @backend-team
*.yaml          @devops-team
.github/        @devops-team
```

This can automatically request reviews from the appropriate owners.

---

# 13. Draft Pull Request

A **Draft Pull Request** indicates that the changes are still being developed and are not yet ready for final review.

Example:

```text
Developer
    |
    v
Draft PR
    |
    | Continue development
    v
Ready for Review
    |
    v
Review
    |
    v
Merge
```

Draft PRs are useful when developers want early feedback without indicating that the work is complete.

---

# 14. Pull Request Comments

Reviewers can comment on specific lines of code.

This allows discussions to remain associated with the exact change being reviewed.

Example:

```text
Reviewer:
"Can this exception be handled here?"

Developer:
"Updated the error handling and added a test."
```

This creates a useful historical record of the review.

---

# 15. Pull Request Conversations

A Pull Request can contain discussions involving:

* Developers
* Reviewers
* QA
* Security
* DevOps
* Architects

The discussion provides context for why a change was made.

---

# 16. Updating a Pull Request

Suppose a reviewer requests a change.

The developer modifies the source branch:

```bash
git add .
git commit -m "Fix review comments"
git push
```

The existing Pull Request is automatically updated.

The workflow becomes:

```text
Existing PR
     |
     v
Review
     |
     v
Changes Requested
     |
     v
Developer Fix
     |
     v
Push
     |
     v
CI
     |
     v
Review Again
```

---

# 17. Pull Request Merge Strategies

GitHub can provide different ways of merging a Pull Request.

The commonly encountered strategies are:

1. Create a merge commit
2. Squash and merge
3. Rebase and merge

---

## 17.1 Merge Commit

A merge commit preserves the branch history and creates a merge commit.

Conceptually:

```text
A---B---C--------M
     \           /
      D---E-----/
```

Advantages:

* Preserves the branch history.
* Clearly records the merge event.

Disadvantages:

* Can create a more complex history.

---

## 17.2 Squash and Merge

Multiple commits from the Pull Request are combined into a single commit before being added to the target branch.

Example:

```text
Feature branch:

A---B---C---D
        \ 
         PR

After squash:

A---B---S
```

Advantages:

* Keeps the target branch history clean.
* Combines multiple development commits into one logical change.

Useful when a feature branch contains many small commits such as:

```text
Fix typo
Fix test
Fix review comment
Update code
Fix build
```

These can become one meaningful commit.

---

## 17.3 Rebase and Merge

The feature branch commits are replayed on top of the latest target branch.

Conceptually:

```text
Before:

A---B---C
     \
      D---E

After rebase:

A---B---C---D'---E'
```

The commit IDs change because the commits are recreated on a new base.

This can produce a linear history.

---

# 18. Merge vs Rebase in Pull Requests

### Merge

Combines histories.

```text
A---B---C------M
     \        /
      D------E
```

### Rebase

Moves/replays commits onto a new base.

```text
A---B---C---D'---E'
```

### Important

Rebase rewrites commit history.

Therefore, force-pushing rebased branches should be handled carefully, particularly when other developers are working on the same branch.

---

# 19. Pull Request Merge Conflicts

A merge conflict can occur when changes from different branches modify the same part of a file in incompatible ways.

Example:

```text
main
 |
 A---B
      \
       feature
```

If both branches modify the same lines differently, Git may not know which change should be retained.

The developer must resolve the conflict.

Typical process:

```text
Pull Request
     |
     v
Conflict detected
     |
     v
Update local branch
     |
     v
Resolve conflicts
     |
     v
Test
     |
     v
Push changes
     |
     v
CI
     |
     v
Review
     |
     v
Merge
```

---

# 20. Keeping a Feature Branch Updated

Before merging, a developer may update the feature branch with the latest target-branch changes.

For example:

```bash
git fetch origin
git rebase origin/main
```

or, depending on the team's strategy:

```bash
git fetch origin
git merge origin/main
```

The choice between merge and rebase should follow the team's branching policy.

---

# 21. Pull Request and Branch Strategy

The target branch depends on the branching strategy.

### Git Flow

```text
feature/login
      |
      v
   develop
```

For a release:

```text
release
    |
    v
  main
```

### GitHub Flow

```text
feature/login
      |
      v
    main
```

### Trunk-Based Development

Short-lived branches are integrated frequently into the central trunk.

---

# 22. Pull Request and Release Flow

A larger CI/CD workflow can look like:

```text
Developer
    |
    v
Feature Branch
    |
    v
Pull Request
    |
    +---- Build
    +---- Test
    +---- Security Scan
    +---- Code Quality
    |
    v
Approval
    |
    v
Merge
    |
    v
Build Artifact
    |
    v
Deploy
```

The Pull Request therefore acts as an important quality and control point before code enters the target branch.

---

# 23. Pull Request Best Practices

### Keep PRs focused

A Pull Request should ideally represent one logical change.

Avoid combining unrelated changes.

### Keep PRs reasonably small

Smaller PRs are generally easier to review.

### Write a meaningful title

Example:

```text
Add authentication API validation
```

is better than:

```text
Changes
```

### Explain the change

The description should explain:

* What changed
* Why it changed
* How it was tested
* Any important deployment considerations

### Include tests

New functionality should normally include appropriate tests.

### Resolve review comments

Review comments should be addressed before final merge.

### Keep the branch updated

Follow the team's policy for merging or rebasing changes from the target branch.

---

# 24. Pull Request Checklist

Before merging:

```text
[ ] Code changes are complete
[ ] Unit tests pass
[ ] Integration tests pass where applicable
[ ] Code quality checks pass
[ ] Security checks pass
[ ] Required reviewers have approved
[ ] Review comments are resolved
[ ] Merge conflicts are resolved
[ ] Branch is up to date according to team policy
[ ] Documentation is updated where required
```

---

# 25. Interview Questions

## What is a Pull Request?

A Pull Request is a mechanism for proposing and reviewing changes from one branch before merging them into another branch.

## Does creating a Pull Request automatically merge the code?

No.

A Pull Request is a proposal for merging. The repository's review, approval, check, and merge policies determine when the changes can be merged.

## What happens when a reviewer requests changes?

The developer updates the source branch and pushes new commits. The existing Pull Request is updated and the checks/review can run again.

## What is the difference between a Draft PR and a normal PR?

A Draft PR indicates that the changes are not yet ready for final review or merging.

## Why protect the main branch?

Branch protection helps prevent uncontrolled direct changes and can require reviews and automated checks before changes are merged.

## What are common Pull Request merge strategies?

* Merge commit
* Squash and merge
* Rebase and merge

## What is a merge conflict?

A merge conflict occurs when Git cannot automatically reconcile conflicting changes between branches.

## Can a Pull Request trigger CI?

Yes. CI systems can be configured to run builds, tests, security scans, and other checks when Pull Requests are created or updated. GitHub Actions supports this workflow.

---

# 26. Key Takeaway

A Pull Request is more than simply a way to merge code.

In an enterprise DevOps workflow, it can act as a **quality gate**:

```text
Code
  |
  v
Feature Branch
  |
  v
Pull Request
  |
  +---- Code Review
  |
  +---- Build
  |
  +---- Test
  |
  +---- Code Quality
  |
  +---- Security
  |
  +---- Approval
  |
  v
Merge
  |
  v
CI/CD Pipeline
```

The goal is to ensure that changes are reviewed, validated, and controlled before they become part of an important branch.
