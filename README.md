# sapcc-hac-skill

> Pi agent skill for SAP Commerce Cloud – interact with your SAP CC instance via Groovy scripts and FlexibleSearch queries through the HAC.

[![npm](https://img.shields.io/badge/sapcc--hac--client-1.0.3-blue)](https://www.npmjs.com/package/sapcc-hac-client)
[![Agent Skill](https://img.shields.io/badge/pi--skill-1.0.0-green)](https://agentskills.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- 🔍 **FlexibleSearch queries** – retrieve products, orders, customers and any SAP CC type
- 🛠️ **Groovy scripts** – call Spring services, update data, trigger cronjobs, run ImpEx
- 🧠 **Smart routing** – the agent automatically picks FlexSearch or Groovy based on your request
- 🔐 **Secure config** – credentials from `.env` file, never hardcoded
- 📊 **Structured output** – always returns JSON for reliable agent parsing

---

## Installation

```bash
npx skills add github:eljoujat/sapcc-hac-skill
```

Or clone manually:

```bash
git clone https://github.com/eljoujat/sapcc-hac-skill ~/.pi/agent/skills/sapcc-hac-skill
cd ~/.pi/agent/skills/sapcc-hac-skill
npm install
```

---

## Configuration

Create a `.env` file in your project root:

```bash
cp ~/.pi/agent/skills/sapcc-hac-skill/.env.example .env
```

Fill in your SAP CC instance details:

```env
HAC_URL=https://backoffice.your-instance.commerce.ondemand.com
HAC_USERNAME=admin
HAC_PASSWORD=your_secure_password
HAC_IGNORE_SSL=false
HAC_TIMEOUT=30000
```

Verify the setup:

```bash
node ~/.pi/agent/skills/sapcc-hac-skill/scripts/setup.js
node ~/.pi/agent/skills/sapcc-hac-skill/scripts/execute.js --health-check
```

---

## Usage

Once installed, just ask your Pi agent naturally:

> *"Show me the last 10 orders"*
> *"Find the product with code LAPTOP_001"*
> *"How many active products are in the electronics catalog?"*
> *"Trigger the full reindex cronjob"*
> *"List all customers with loginDisabled=true"*

The skill will automatically decide whether to use FlexibleSearch or Groovy and execute the right operation.

---

## Direct CLI Usage

```bash
# FlexibleSearch query
node scripts/execute.js \
  --type flexsearch \
  --query "SELECT {pk},{code},{name[en]} FROM {Product} WHERE {code} LIKE '%LAPTOP%'"

# Groovy script (read-only)
node scripts/execute.js \
  --type groovy \
  --script "return spring.getBean('productService').toString()"

# Groovy from file (with commit)
node scripts/execute.js \
  --type groovy \
  --file /path/to/my-script.groovy \
  --commit

# JSON output
node scripts/execute.js --type flexsearch --query "..." --json

# Health check
node scripts/execute.js --health-check
```

---

## Architecture

```
sapcc-hac-skill/
├── SKILL.md                    # Agent skill definition (loaded by Pi)
├── package.json
├── .env.example                # Environment template
├── scripts/
│   ├── execute.js              # Main CLI: Groovy | FlexSearch execution
│   └── setup.js                # Dependency + config checker
└── references/
    ├── decision-guide.md       # When to use Groovy vs FlexSearch
    ├── flexsearch-guide.md     # FlexibleSearch syntax and examples
    ├── groovy-patterns.md      # Groovy patterns and Spring bean names
    └── sap-cc-types.md         # SAP CC type reference
```

The skill uses [`sapcc-hac-client`](https://www.npmjs.com/package/sapcc-hac-client) under the hood, which handles the full Spring Security authentication flow (CSRF, session cookies) against the HAC.

---

## .env Resolution Order

1. `--env-file <path>` (explicit CLI argument)
2. `.env` in current working directory (`process.cwd()`)
3. `.env` in the skill directory
4. Environment variables already set in the shell

---

## License

MIT © [Youssef El Jaoujat](https://github.com/eljoujat)
