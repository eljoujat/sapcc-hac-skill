---
name: sapcc-skill
description: SAP Commerce Cloud skill for querying, administrating and operating a SAP CC (Hybris / CCv2) instance. Use this skill when the user asks to query, inspect, modify or administrate SAP Commerce Cloud – e.g. find products, orders, customers, run ImpEx, check cronjobs, execute business logic, or retrieve platform data. Automatically selects Groovy or FlexSearch based on request complexity.
license: MIT
compatibility: Requires Node.js >= 18. SAP CC credentials must be set in .env (HAC_URL, HAC_USERNAME, HAC_PASSWORD). Dependencies are installed automatically on first use — no manual npm install needed.
metadata: {"author":"eljoujat","version":"2.0.0","homepage":"https://github.com/eljoujat/sapcc-skill","tags":["sapcommerce","hybris","groovy","flexiblesearch","ccv2","sap"]}
---

# SAP Commerce Cloud Skill

Interact with a SAP Commerce Cloud (Hybris/CCv2) instance using [`sapcc-hac-client`](https://www.npmjs.com/package/sapcc-hac-client) — currently supporting Groovy scripts and FlexibleSearch queries. Designed to be extended with additional SAP CC capabilities over time.

The skill automatically decides whether to use:
- **FlexibleSearch** – for data queries (SELECT/WHERE on SAP CC types)
- **Groovy script** – for complex logic, service calls, multi-step operations, or writes

Works with **Claude Code, Cursor, Copilot, Codex, Pi** and any agent compatible with the [Agent Skills](https://agentskills.io) format.

---

## Setup

Dependencies are **installed automatically** the first time `execute.js` runs — no manual `npm install` needed.

Create a `.env` file in your project root (or in the skill directory as fallback):

```bash
cp <skill-dir>/.env.example .env
# Then fill in your values
```

Required `.env` variables:
```
HAC_URL=https://backoffice.<your-instance>.commerce.ondemand.com
HAC_USERNAME=admin
HAC_PASSWORD=your_password
HAC_IGNORE_SSL=false     # set true for self-signed certs
HAC_TIMEOUT=30000
```

Verify setup:

```bash
node <skill-dir>/scripts/execute.js --health-check
```

---

## Decision Guide: FlexSearch vs Groovy

Read [references/decision-guide.md](references/decision-guide.md) for the full matrix.

**Quick rule:**

| Use FlexSearch when… | Use Groovy when… |
|---|---|
| Pure data retrieval (SELECT) | Business service calls (ProductService, OrderService…) |
| Simple WHERE conditions | Multi-step / conditional logic |
| Counting / listing items | Writes, creates, updates, deletes |
| Joining SAP CC types | Running ImpEx programmatically |
| Checking attribute values | Triggering cronjobs / business processes |
| Fast exploration | Complex calculations or transformations |

---

## Workflow

### Step 1 – Assess the request

Classify the user's intent into one of:
- `flexsearch` – data query, no side effects, can be expressed as a SELECT statement
- `groovy` – business logic, writes, service access, multi-type joins with business rules

If in doubt, prefer FlexSearch first; escalate to Groovy if the query returns insufficient data or requires logic.

### Step 2 – Compose the script or query

**For FlexSearch:** write a valid FlexibleSearch query.
- Always qualify attributes: `{product:pk}`, `{p:code}`, etc.
- Use `JOIN` syntax for related types
- Apply `WHERE` clauses with proper escaping
- Read [references/flexsearch-guide.md](references/flexsearch-guide.md) for syntax and common patterns

**For Groovy:** write a Groovy script.
- Use Spring beans via the `spring` variable: `spring.getBean('productService')`
- Use `catalogVersionService`, `userService`, `orderService`, etc.
- Return a value or use `println` for output
- Set `--commit` only when writing data
- Read [references/groovy-patterns.md](references/groovy-patterns.md) for patterns and Spring bean names

### Step 3 – Execute

```bash
# FlexibleSearch
node <skill-dir>/scripts/execute.js \
  --type flexsearch \
  --query "SELECT {pk},{code},{name[en]} FROM {Product} WHERE {code} LIKE '%LAPTOP%' ORDER BY {code} ASC" \
  --max-count 50

# Groovy (read-only)
node <skill-dir>/scripts/execute.js \
  --type groovy \
  --script "
    def ps = spring.getBean('productService')
    def cv = spring.getBean('catalogVersionService').getCatalogVersion('electronicsProductCatalog','Online')
    def p = ps.getProductForCode(cv, 'LAPTOP_001')
    return p?.name
  "

# Groovy (write – commit=true)
node <skill-dir>/scripts/execute.js \
  --type groovy \
  --commit \
  --script "
    def product = new de.hybris.platform.core.model.product.ProductModel()
    product.code = 'TEST_001'
    modelService.save(product)
    return 'saved'
  "

# From a .groovy file
node <skill-dir>/scripts/execute.js --type groovy --file /tmp/my-script.groovy

# JSON output (for programmatic use)
node <skill-dir>/scripts/execute.js --type flexsearch --query "..." --json
```

### Step 4 – Interpret and present results

**FlexSearch result** (JSON):
```json
{
  "success": true,
  "resultCount": 42,
  "executionTime": 123,
  "headers": ["pk","code","name[en]"],
  "rows": [["8796093055058","LAPTOP_001","Laptop Pro"]]
}
```

**Groovy result** (JSON):
```json
{
  "success": true,
  "executionResult": "Laptop Pro",
  "outputText": "",
  "stacktrace": ""
}
```

- Present tabular data as a Markdown table when `headers` and `rows` are available
- Highlight `success: false` with the `error` or `stacktrace` message
- When `resultCount` is 0, suggest query refinements

### Step 5 – Error handling

| Error | Action |
|---|---|
| `Missing required environment variables` | Ask user to fill `.env` (HAC_URL, HAC_USERNAME, HAC_PASSWORD) |
| `Authentification échouée` | Check credentials; try `--health-check` |
| `HTTP 403` | Check user permissions in HAC |
| FlexSearch syntax error | Fix query; check type names and attribute aliases |
| Groovy `MissingMethodException` | Check Spring bean name in [references/groovy-patterns.md](references/groovy-patterns.md) |
| `ECONNREFUSED` / `ETIMEDOUT` | Check HAC_URL reachability; try HAC_IGNORE_SSL=true for dev |

---

## Reference Files

Load these on-demand when needed:

| File | When to load |
|---|---|
| [references/decision-guide.md](references/decision-guide.md) | Complex cases where you're unsure of FlexSearch vs Groovy |
| [references/flexsearch-guide.md](references/flexsearch-guide.md) | Composing FlexibleSearch queries (syntax, types, joins, caveats) |
| [references/groovy-patterns.md](references/groovy-patterns.md) | Common Groovy patterns, Spring bean names, service examples |
| [references/sap-cc-types.md](references/sap-cc-types.md) | Common SAP CC type names, attributes and catalog structure |
