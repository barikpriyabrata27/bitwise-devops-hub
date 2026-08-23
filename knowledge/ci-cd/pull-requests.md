# Pull Requests

## 1. What is a Pull Request?

A Pull Request (PR) is used to propose changes from one branch to another.

Example:

```text
feature
   |
   | Pull Request
   v
develop
```

With GitHub Flow:

```text
feature
   |
   | Pull Request
   v
main
```

The Pull Request allows changes to be reviewed before they are merged.

---

## 2. Pull Request Workflow

The workflow described in the notes can be represented as:

```text
Create Branch
      ↓
Develop / Make Changes
      ↓
Commit Changes
      ↓
Push Branch
      ↓
Create Pull Request
      ↓
Code Review
      ↓
Approval
      ↓
Merge
```

## 3. Create a Branch

A developer creates a branch for the work.

Example:

```bash
git checkout -b feature/login
```

## 4. Make Changes

The developer works on the required feature or fix in the new branch.

## 5. Commit Changes

The changes are committed.

```bash
git add .
git commit -m "Add login feature"
```

## 6. Push the Branch

The branch is pushed to the remote repository.

```bash
git push origin feature/login
```

## 7. Create the Pull Request

A Pull Request is created from the working branch to the target branch.

For Git Flow:

```text
feature/login
       |
       v
    develop
```

For GitHub Flow:

```text
feature/login
       |
       v
      main
```

## 8. Code Review

Other developers or reviewers inspect the changes.

They can:

- Review the code.
- Add comments.
- Request changes.
- Approve the Pull Request.

## 9. Approval

After the required reviews and checks are completed, the Pull Request can be approved.

## 10. Merge

The approved changes are merged into the target branch.

---

# Branch Protection

The notes also mention branch rules and branch-specific security.

A protected branch can prevent uncontrolled direct changes.

For example:

```text
Developer
    |
    v
Feature Branch
    |
    v
Pull Request
    |
    +---- Review
    |
    +---- Checks
    |
    +---- Approval
    |
    v
main
```

This provides additional control over important branches.

---

# Pull Requests and CI/CD

Pull Requests can be integrated with CI/CD checks.

A typical flow can be:

```text
Developer
    |
    v
Feature Branch
    |
    v
Pull Request
    |
    v
Build
    |
    v
Test
    |
    v
Scan
    |
    v
Review / Approval
    |
    v
Merge
```

The notes specifically mention GitHub automation facilities and GitHub Actions.

---

# Why Pull Requests Are Used

Based on the notes, Pull Requests provide a mechanism for controlled merging of branch changes.

They support:

- Code review
- Collaboration
- Branch-based development
- Approval before merging
- Integration with automation and security checks
- Controlled changes to important branches
