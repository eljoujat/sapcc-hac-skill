# sapcc-skill — SAP Commerce Cloud Agent Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/eljoujat/sapcc-skill?style=flat&logo=github)](https://github.com/eljoujat/sapcc-skill/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/eljoujat/sapcc-skill?style=flat&logo=github)](https://github.com/eljoujat/sapcc-skill/network/members)
[![Latest Release](https://img.shields.io/github/v/release/eljoujat/sapcc-skill?logo=github)](https://github.com/eljoujat/sapcc-skill/releases/latest)
[![Last Commit](https://img.shields.io/github/last-commit/eljoujat/sapcc-skill?logo=github)](https://github.com/eljoujat/sapcc-skill/commits/main)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-2ea44f)](https://agentskills.io)
[![npm](https://img.shields.io/badge/powered%20by-sapcc--hac--client-blue)](https://www.npmjs.com/package/sapcc-hac-client)

**English** · [العربية](README_AR.md)

A skill that turns natural-language requests into **Groovy scripts** or **FlexibleSearch queries** and executes them live on a SAP Commerce Cloud (Hybris / CCv2) instance. The agent automatically picks the right tool based on your intent — no manual query writing needed. Built on top of [`sapcc-hac-client`](https://www.npmjs.com/package/sapcc-hac-client), and designed to grow into a full SAP CC operations skill.

Works with **Claude Code, Cursor, GitHub Copilot, Codex, Pi** and any agent compatible with the [Agent Skills](https://agentskills.io) format.

---

## ✨ Highlights

- 🧠 **Smart routing** — the agent automatically decides between FlexibleSearch (data queries) and Groovy (business logic, writes, service calls) based on your request
- 🔍 **FlexibleSearch** — query any SAP CC type with SELECT/JOIN/WHERE; results returned as structured rows
- 🛠️ **Groovy scripts** — call Spring services (`productService`, `orderService`…), trigger cronjobs, run ImpEx, or modify data with `--commit`
- 🔐 **Secure by design** — credentials live in `.env`, never hardcoded; `.env` is gitignored
- 📊 **Structured JSON output** — every response is valid JSON for reliable agent parsing and Markdown table rendering
- ⚡ **Health check** — one command to verify connectivity and credentials before anything else
- 📚 **Rich reference docs** — decision guide, FlexSearch syntax, Groovy patterns, and SAP CC type reference all bundled

---

## 🚀 Installation

### 1. Install the skill

```bash
# Any agent (Claude Code, Cursor, Copilot, Pi, ...)
npx skills add github:eljoujat/sapcc-skill
```

```bash
# Manual install — Pi
git clone https://github.com/eljoujat/sapcc-skill.git \
  ~/.pi/agent/skills/sapcc-skill
cd ~/.pi/agent/skills/sapcc-skill && npm install
```

```bash
# Manual install — Claude Code / Codex
git clone https://github.com/eljoujat/sapcc-skill.git \
  ~/.claude/skills/sapcc-skill
cd ~/.claude/skills/sapcc-skill && npm install
```

### 2. Configure credentials

Create a `.env` file in your **project root** (the skill also accepts one in its own directory as fallback):

```bash
cp ~/.pi/agent/skills/sapcc-skill/.env.example .env
```

Fill in your values:

```env
HAC_URL=https://backoffice.your-instance.commerce.ondemand.com
HAC_USERNAME=admin
HAC_PASSWORD=your_secure_password
HAC_IGNORE_SSL=false      # set true for self-signed / dev certificates
HAC_TIMEOUT=30000         # ms; increase for slow instances
```

### 3. Verify

```bash
node <skill-dir>/scripts/setup.js                      # checks deps + .env
node <skill-dir>/scripts/execute.js --health-check     # tests authentication
```

---

## ⚡ Quick Start

Once installed, just ask the agent naturally:

> *"Show me the 10 most recent orders"*
> *"Find the product with code LAPTOP_001 and its price entries"*
> *"How many active products are in the electronics catalog?"*
> *"List all customers with login disabled"*
> *"Trigger the full Solr reindex cronjob"*
> *"Run an ImpEx to update the stock level for SKU ABC-123"*

The skill plans, executes, and returns results — no SQL or Groovy knowledge required.

---

## 🗺️ How the Agent Decides: FlexSearch vs Groovy

| Use **FlexibleSearch** when… | Use **Groovy** when… |
|---|---|
| Pure data retrieval (SELECT) | Business service calls (ProductService, OrderService…) |
| Simple WHERE conditions | Multi-step / conditional logic |
| Counting / listing items | Writes, creates, updates, deletes |
| Joining SAP CC types | Running ImpEx programmatically |
| Checking attribute values | Triggering cronjobs / business processes |
| Fast, read-only exploration | Complex calculations or transformations |

Full decision matrix in [references/decision-guide.md](references/decision-guide.md).

---

## 🔧 Direct CLI Usage

The skill exposes a thin CLI in `scripts/execute.js`:

```bash
# FlexibleSearch query
node <skill-dir>/scripts/execute.js \
  --type flexsearch \
  --query "SELECT {pk},{code},{name[en]} FROM {Product} WHERE {code} LIKE '%LAPTOP%'" \
  --max-count 50

# Groovy (read-only)
node <skill-dir>/scripts/execute.js \
  --type groovy \
  --script "def ps = spring.getBean('productService'); return ps.class.simpleName"

# Groovy from file — with DB commit
node <skill-dir>/scripts/execute.js \
  --type groovy \
  --file /path/to/script.groovy \
  --commit

# Force JSON output (for programmatic use)
node <skill-dir>/scripts/execute.js --type flexsearch --query "..." --json

# Health check
node <skill-dir>/scripts/execute.js --health-check
```

### Response format

**FlexibleSearch:**
```json
{
  "success": true,
  "resultCount": 42,
  "executionTime": 123,
  "headers": ["PK", "p_code", "p_name"],
  "rows": [["8796093055058", "LAPTOP_001", "Laptop Pro"]]
}
```

**Groovy:**
```json
{
  "success": true,
  "executionResult": "DefaultProductService",
  "outputText": "Processing...\n",
  "stacktrace": ""
}
```

---

## 🔄 How it Works

```
User request
     │
     ▼
Agent analyzes intent
     │
     ├── data query? ──► FlexibleSearch query
     │                         │
     └── logic / write? ──► Groovy script
                               │
                         scripts/execute.js
                               │
                     sapcc-hac-client (npm)
                               │
                   HAC Spring Security auth
                    (CSRF + session cookies)
                               │
                      POST /hac/console/...
                               │
                         JSON result
                               │
                     Agent formats & presents
```

The authentication flow (CSRF token, JSESSIONID, ROUTE cookie) is fully managed by [`sapcc-hac-client`](https://www.npmjs.com/package/sapcc-hac-client).

---

## 📚 Reference Files

The skill loads these on-demand when needed:

| File | When the agent reads it |
|---|---|
| [references/decision-guide.md](references/decision-guide.md) | Complex cases where FlexSearch vs Groovy is ambiguous |
| [references/flexsearch-guide.md](references/flexsearch-guide.md) | FlexibleSearch syntax, type names, join examples, caveats |
| [references/groovy-patterns.md](references/groovy-patterns.md) | Spring bean names, service patterns, ImpEx, cronjobs |
| [references/sap-cc-types.md](references/sap-cc-types.md) | SAP CC type reference (Product, Order, User, StockLevel…) |

---

## 🏗️ Project Structure

```
sapcc-skill/
├── SKILL.md                    # Agent Skills definition (loaded by any compatible agent)
├── package.json                # Dependency: sapcc-hac-client
├── .env.example                # Credentials template
├── .gitignore                  # Excludes .env and node_modules
├── README.md                   # This file (English)
├── README_AR.md                # Arabic / العربية
├── scripts/
│   ├── execute.js              # CLI: FlexSearch | Groovy execution
│   └── setup.js                # Dependency + .env health checker
└── references/
    ├── decision-guide.md       # FlexSearch vs Groovy matrix
    ├── flexsearch-guide.md     # FlexibleSearch syntax + 30+ examples
    ├── groovy-patterns.md      # Groovy + Spring bean patterns
    └── sap-cc-types.md         # SAP CC type reference
```

---

## 🤝 Agent Compatibility

| Agent | Supported | Install path |
|---|---|---|
| **Pi** | ✅ | `~/.pi/agent/skills/sapcc-skill/` |
| **Claude Code** | ✅ | `~/.claude/skills/sapcc-skill/` |
| **Cursor** | ✅ | `~/.cursor/skills/sapcc-skill/` |
| **GitHub Copilot** | ✅ | `.github/skills/sapcc-skill/` |
| **Codex** | ✅ | `~/.codex/skills/sapcc-skill/` |
| **OpenClaw / Hermes** | ✅ | `~/.agents/skills/sapcc-skill/` |
| Any [Agent Skills](https://agentskills.io)-compatible agent | ✅ | Per-agent skills directory |

---

## 🔒 .env Resolution Order

The script resolves credentials in this order (first match wins):

1. `--env-file <path>` — explicit CLI argument
2. `.env` in the current working directory (`process.cwd()`)
3. `.env` in the skill directory itself
4. Environment variables already set in the shell (CI/CD)

---

## 🐛 Troubleshooting

| Error | Fix |
|---|---|
| `Missing required environment variables` | Fill in `.env` with HAC_URL, HAC_USERNAME, HAC_PASSWORD |
| `Authentification échouée` | Check credentials; try `--health-check`; verify HAC URL |
| `HTTP 403` | The HAC user lacks scripting/console permissions |
| `ECONNREFUSED` / `ETIMEDOUT` | Check network; try `HAC_IGNORE_SSL=true` for dev |
| FlexSearch syntax error | Check type names and attribute aliases in [flexsearch-guide.md](references/flexsearch-guide.md) |
| Groovy `MissingMethodException` | Verify bean name in [groovy-patterns.md](references/groovy-patterns.md) |
| `sapcc-hac-client not found` | Run `npm install` in the skill directory |

---

## 📄 License

MIT © [Youssef El Jaoujat](https://github.com/eljoujat)

---

<sub>Powered by <a href="https://www.npmjs.com/package/sapcc-hac-client">sapcc-hac-client</a> · Compatible with the <a href="https://agentskills.io">Agent Skills</a> standard</sub>
