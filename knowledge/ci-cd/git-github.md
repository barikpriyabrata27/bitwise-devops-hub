# Git

## 1. What is Git?

Git is a version control system used to manage changes to source code and other project files.

### Key points from the notes

- Git is used for version control.
- Git helps manage different versions of code.
- Git supports branching and merging.
- Developers can work independently on different branches.
- Changes can later be merged into another branch.

## 2. Git Flow

Git Flow is a branching model mentioned in the notes as suitable for relatively heavy projects.

The important long-lived branches are:

- `main`
- `develop`

Developers create additional branches from `develop`, such as feature and hotfix branches.

Example:

```text
develop
   |
   +---- feature
   |
   +---- hotfix
```

After the work is completed, the branches are merged using Pull Requests.

## 3. GitHub

GitHub is described in the notes as providing:

- Version control
- Collaboration facilities
- Project management facilities
- Automation facilities

### Version Control

GitHub repositories provide a place to store and manage Git-based source code.

### Collaboration

Teams can collaborate using repositories, branches and Pull Requests.

### Project Management

GitHub provides project-management capabilities involving organizations, groups, teams and members.

### Automation

GitHub provides automation facilities, including GitHub Actions.

## 4. Git vs GitHub

### Git

Git is the version control system.

### GitHub

GitHub is a platform that provides Git repository hosting together with collaboration, project-management and automation facilities.

## 5. GitHub Security and Management

The notes mention that GitHub can provide facilities for:

- Managing organizations
- Managing groups/teams
- Managing members
- Managing repositories
- Managing secrets and variables
- Managing runners
- Branch rules
- Security features such as Dependabot and CodeQL
