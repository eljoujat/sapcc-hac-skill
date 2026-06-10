# Contributing to sapcc-skill

Thank you for taking the time to contribute! 🎉

This document describes how to report bugs, suggest features, and submit changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Development Setup](#development-setup)
- [Commit Message Convention](#commit-message-convention)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you agree to uphold it.

---

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/sapcc-skill.git
   cd sapcc-skill
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Configure credentials** (see [README.md](README.md#setup)):
   ```bash
   cp .env.example .env
   # fill in HAC_URL, HAC_USERNAME, HAC_PASSWORD
   ```
5. **Run the health check**:
   ```bash
   node scripts/execute.js --health-check
   ```

---

## Reporting Bugs

Before opening a bug report, please:
- Search [existing issues](https://github.com/eljoujat/sapcc-skill/issues) to avoid duplicates
- Check the [Troubleshooting section](README.md#troubleshooting) in the README

When opening a bug report, use the **Bug Report** issue template and include:
- Node.js version (`node --version`)
- SAP Commerce Cloud version if known
- The exact command or script you ran
- The full error output (redact passwords!)

---

## Suggesting Features

Use the **Feature Request** issue template. Describe:
- The problem you're trying to solve
- Your proposed solution or approach
- Any alternatives you've considered

Given that this skill is designed to grow into a full SAP CC operations skill,
feature suggestions for new capabilities (Cloud Portal API, monitoring, ImpEx
orchestration…) are especially welcome.

---

## Submitting a Pull Request

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes
3. Test manually with `node scripts/execute.js --health-check`
4. Commit using [Conventional Commits](#commit-message-convention)
5. Push and open a PR against `main`
6. Fill in the PR template

---

## Development Setup

| Script | Description |
|---|---|
| `npm run setup` | Check dependencies and `.env` |
| `npm test` | Run health check against SAP CC |
| `node scripts/execute.js --type flexsearch --query "..."` | Test a FlexibleSearch query |
| `node scripts/execute.js --type groovy --script "..."` | Test a Groovy script |

---

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

| Type | When to use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change with no new feature or fix |
| `chore` | Build, deps, tooling |
| `perf` | Performance improvement |

Examples:
```
feat(groovy): add support for --timeout flag
fix(flexsearch): handle NULL values in WHERE clause
docs: add Cloud Portal API integration guide
chore: bump sapcc-hac-client to 1.1.0
```

---

## Questions?

Open a [Discussion](https://github.com/eljoujat/sapcc-skill/discussions) or reach out at **youssef.el.jaoujat@gmail.com**.
