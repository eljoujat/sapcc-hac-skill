# Decision Guide: FlexSearch vs Groovy

## When to use FlexibleSearch

FlexibleSearch is ideal when:

- You need to **retrieve data** without side effects
- The logic can be expressed as a **SELECT query** on SAP CC types
- You want **multiple rows** of structured results
- Performance matters (FlexSearch is indexed and optimized)
- You need to **join** multiple SAP CC types

### FlexSearch examples

| Request | Query |
|---|---|
| Find product by code | `SELECT {pk},{code} FROM {Product} WHERE {code}='MY_CODE'` |
| List all orders for a customer | `SELECT {o:pk},{o:code} FROM {Order AS o} JOIN {User AS u} ON {o:user}={u:pk} WHERE {u:uid}='john@example.com'` |
| Count active products | `SELECT COUNT(*) FROM {Product} WHERE {catalogVersion} IN ({{ SELECT {pk} FROM {CatalogVersion} WHERE {active}=1 }})` |
| Search by name (contains) | `SELECT {pk},{name[en]} FROM {Product} WHERE {name[en]} LIKE '%Laptop%'` |
| Find orders in date range | `SELECT {pk},{code},{date} FROM {Order} WHERE {date} >= ?startDate AND {date} <= ?endDate` |
| List all active users | `SELECT {pk},{uid},{name} FROM {Customer} WHERE {loginDisabled}=0` |

---

## When to use Groovy

Groovy is necessary when:

- You need to call **SAP CC Spring services** (ProductService, OrderService, etc.)
- The logic involves **conditions, loops, or transformations** that SQL can't express
- You need to **write/modify data** (creates, updates, deletes)
- You need to trigger **cronjobs or business processes**
- You need to import data via **ImpEx**
- You need to navigate **complex object graphs** (e.g. price entries, classifications)

### Groovy examples

| Request | Approach |
|---|---|
| Get product with all details | `productService.getProductForCode(catalogVersion, code)` |
| Recalculate prices | `priceService.getWebPriceForProduct(...)` |
| Trigger a cronjob | `cronJobService.performCronJob(cronJob, true)` |
| Import ImpEx data | `importService.importData(importConfig)` |
| Read cart / order totals | `orderService.getOrderForCode(...)` |
| Update a product attribute | `modelService.save(product)` (with `--commit`) |

---

## Edge cases

| Scenario | Decision |
|---|---|
| User asks for "count of products in catalog X" | FlexSearch — `SELECT COUNT(*)` |
| User asks to "activate a product" | Groovy (write) with `--commit` |
| User asks for "all orders with their line items" | FlexSearch with JOIN |
| User asks to "send a confirmation email" | Groovy — service call |
| User asks for "all payment transactions today" | FlexSearch |
| User asks to "reindex the solr catalog" | Groovy — `solrIndexerOperationService` |
| User asks for "product stock levels" | FlexSearch on StockLevel type, or Groovy for availability via service |
