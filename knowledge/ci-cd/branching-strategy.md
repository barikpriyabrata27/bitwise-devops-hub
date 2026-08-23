# Branching Strategies

The notes identify three important branching strategies:

1. Git Flow
2. GitHub Flow
3. Trunk-Based Development

---

## 1. Git Flow

The notes describe Git Flow as suitable for a relatively heavy project.

There are two important long-lived branches:

```text
main
develop
```

The `develop` branch is used for development.

Developers create additional branches from `develop`, such as:

```text
develop
   |
   +---- feature
   |
   +---- hotfix
```

These branches are merged using Pull Requests.

After the required merges are completed, a release branch can be created from `develop` and eventually merged into `main`.

Example:

```text
develop
   |
   +---- feature
   |
   +---- hotfix
   |
   v
release
   |
   v
main
```

### Git Flow characteristics

- `main` is the stable/release branch.
- `develop` is the development branch.
- Feature and hotfix branches are created from the development branch.
- Pull Requests are used for merging.
- A release branch can be used before merging into `main`.

---

## 2. GitHub Flow

The notes describe GitHub Flow as simpler than Git Flow.

There is one primary long-lived branch:

```text
main
```

Developers create branches from `main`.

Example:

```text
main
  |
  +---- feature
  |
  +---- hotfix
```

After the work is completed, a Pull Request is created and the changes are merged into `main`.

Example:

```text
feature
   |
   | Pull Request
   v
 main
```

### GitHub Flow characteristics

- `main` is the primary long-lived branch.
- Feature branches are created from `main`.
- Pull Requests are used to merge changes.
- The model is simpler than Git Flow.

---

## 3. Trunk-Based Development

Trunk-Based Development is another branching strategy mentioned in the notes.

The approach focuses on a central trunk/main branch and development branches that are integrated into it.

Conceptually:

```text
             feature
                |
                v
main -----------+----------- main
                |
             feature
```

The emphasis is on working around the central branch rather than maintaining many long-lived branches.

---

## 4. Comparison

### Git Flow

```text
main
 |
develop
 |
 +-- feature
 +-- hotfix
 |
release
 |
main
```

Suitable for a more structured release process.

### GitHub Flow

```text
main
 |
 +-- feature
 |
 Pull Request
 |
 main
```

A simpler branching model.

### Trunk-Based Development

```text
main / trunk
     |
  short-lived
    branches
     |
     v
   main
```

Focuses on the central trunk/main branch.

---

## 5. Choosing the Strategy

From the notes:

- **Git Flow** → suitable for relatively heavy projects.
- **GitHub Flow** → simpler model with `main` as the primary long-lived branch.
- **Trunk-Based Development** → focuses on the central trunk/main branch.
