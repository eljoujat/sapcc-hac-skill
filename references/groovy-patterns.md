# Groovy Patterns for SAP Commerce Cloud

Groovy scripts run in the HAC scripting console with access to the Spring application context via the implicit `spring` variable.

---

## Implicit Variables

| Variable | Type | Description |
|---|---|---|
| `spring` | `ApplicationContext` | Spring application context |
| `modelService` | `ModelService` | Save/remove models (injected) |

> **Note:** `modelService` may not be directly available. Always get it via `spring.getBean('modelService')`.

---

## Core Service Patterns

### Get a Spring bean

```groovy
def productService = spring.getBean('productService')
def modelService   = spring.getBean('modelService')
```

### ProductService – read product

```groovy
def productService      = spring.getBean('productService')
def catalogVersionService = spring.getBean('catalogVersionService')

def cv = catalogVersionService.getCatalogVersion('electronicsProductCatalog', 'Online')
def product = productService.getProductForCode(cv, 'LAPTOP_001')

return """
code: ${product.code}
name: ${product.name}
approved: ${product.approvalStatus}
"""
```

### OrderService – read order

```groovy
def orderService = spring.getBean('orderService')
def order = orderService.getOrderForCode('ORDER_123')

return """
code: ${order.code}
status: ${order.status}
total: ${order.totalPrice} ${order.currency?.isocode}
entries: ${order.entries?.size()}
"""
```

### UserService – read/find user

```groovy
def userService = spring.getBean('userService')
def customer = userService.getUserForUID('customer@example.com')

return "name=${customer.name}, disabled=${customer.loginDisabled}"
```

### CatalogVersionService

```groovy
def cvService = spring.getBean('catalogVersionService')
def allVersions = cvService.getAllCatalogVersions()
allVersions.each { cv ->
    println "${cv.catalog.id} / ${cv.version} (active=${cv.active})"
}
```

---

## Write Operations (use --commit)

### Update a product attribute

```groovy
def productService        = spring.getBean('productService')
def catalogVersionService = spring.getBean('catalogVersionService')
def modelService          = spring.getBean('modelService')

def cv = catalogVersionService.getCatalogVersion('electronicsProductCatalog', 'Online')
def product = productService.getProductForCode(cv, 'LAPTOP_001')

product.setApprovalStatus(de.hybris.platform.catalog.enums.ArticleApprovalStatus.APPROVED)
modelService.save(product)

return "Updated: ${product.code}"
```

### Create a new model

```groovy
def modelService = spring.getBean('modelService')
def flexibleSearchService = spring.getBean('flexibleSearchService')

// Example: create a user group
def ug = modelService.create(de.hybris.platform.core.model.security.PrincipalGroupModel.class)
ug.setUid('my-new-group')
modelService.save(ug)
return "Created: ${ug.uid}"
```

### ImpEx import

```groovy
def importService = spring.getBean('importService')

def impexContent = """
INSERT_UPDATE Product;code[unique=true];name[lang=en];catalogVersion(catalog(id),version)[unique=true]
;TEST_PRODUCT_001;Test Product;electronicsProductCatalog:Staged
"""

def importConfig = new de.hybris.platform.impex.jalo.imp.ImpExImportConfig()
importConfig.setData(new de.hybris.platform.util.CSVReader(new java.io.StringReader(impexContent)))
importConfig.setRemoveOnSuccess(false)
importConfig.setValidationMode(de.hybris.platform.impex.jalo.imp.ImpExImportConfig.ValidationMode.RELAXED)

def result = importService.importData(importConfig)
return "Imported – errors: ${result.hasUnresolvedLines()}"
```

---

## FlexibleSearch from Groovy

```groovy
def flexibleSearchService = spring.getBean('flexibleSearchService')

def query = new de.hybris.platform.servicelayer.search.FlexibleSearchQuery(
    "SELECT {pk},{code} FROM {Product} WHERE {code} LIKE ?code"
)
query.addQueryParameter('code', '%LAPTOP%')

def result = flexibleSearchService.search(query)
result.result.each { product ->
    println "${product.code}"
}
return "Found: ${result.totalCount}"
```

---

## CronJob Operations

### Trigger a cronjob manually

```groovy
def cronJobService = spring.getBean('cronJobService')
def flexibleSearchService = spring.getBean('flexibleSearchService')

def q = new de.hybris.platform.servicelayer.search.FlexibleSearchQuery(
    "SELECT {pk} FROM {CronJob} WHERE {code}='myCronJobCode'"
)
def result = flexibleSearchService.search(q)
def cronJob = result.result?.first()

if (cronJob) {
    cronJobService.performCronJob(cronJob, true)
    return "Triggered: ${cronJob.code}"
} else {
    return "CronJob not found"
}
```

### Check cronjob status

```groovy
def flexibleSearchService = spring.getBean('flexibleSearchService')

def q = new de.hybris.platform.servicelayer.search.FlexibleSearchQuery(
    "SELECT {pk},{code},{status},{result},{startTime},{endTime} FROM {CronJob} ORDER BY {startTime} DESC"
)
q.setCount(10)
def results = flexibleSearchService.search(q)

results.result.each { cj ->
    println "${cj.code} | ${cj.status} | ${cj.result} | ${cj.startTime}"
}
```

---

## Solr / Search Index

```groovy
// Trigger full index
def solrFacetSearchConfigService = spring.getBean('solrFacetSearchConfigService')
def solrIndexerOperationService  = spring.getBean('solrIndexerOperationService')

def configs = solrFacetSearchConfigService.getAllSolrFacetSearchConfigs()
configs.each { config ->
    println "Indexing: ${config.name}"
    solrIndexerOperationService.fullIndex(config)
}
return "Indexing triggered for ${configs.size()} configs"
```

---

## Print vs Return

- `println "..."` → appears in `outputText` field of the result
- `return value` → appears in `executionResult` field of the result
- Use `println` for multiple lines, `return` for a single final value

```groovy
// Both at once
println "Processing..."
def count = 0
// ... do work ...
println "Done: ${count} items"
return count   // executionResult = count, outputText = "Processing...\nDone: N items"
```

---

## Common Bean Names

| Bean name | Service |
|---|---|
| `productService` | ProductService |
| `catalogVersionService` | CatalogVersionService |
| `catalogService` | CatalogService |
| `orderService` | OrderService |
| `userService` | UserService |
| `modelService` | ModelService |
| `flexibleSearchService` | FlexibleSearchService |
| `importService` | ImportService |
| `cronJobService` | CronJobService |
| `mediaService` | MediaService |
| `priceService` | PriceService |
| `stockService` | StockService |
| `sessionService` | SessionService |
| `i18NService` | I18NService |
| `typeService` | TypeService |
| `solrIndexerOperationService` | SolrIndexerOperationService |
| `businessProcessService` | BusinessProcessService |
| `cartService` | CartService |
| `checkoutService` | CheckoutService |
| `paymentService` | PaymentService |
| `addressService` | AddressService |
| `baseStoreService` | BaseStoreService |
| `baseSiteService` | BaseSiteService |
| `cmsSiteService` | CMSSiteService |

---

## Error Handling

```groovy
try {
    def productService = spring.getBean('productService')
    def cv = spring.getBean('catalogVersionService').getCatalogVersion('myCatalog', 'Online')
    def product = productService.getProductForCode(cv, 'MY_CODE')
    return product?.name ?: 'Product not found'
} catch (de.hybris.platform.catalog.jalo.CatalogManager.CatalogVersionNotFoundException e) {
    return "Catalog version not found: ${e.message}"
} catch (Exception e) {
    return "Error: ${e.class.simpleName}: ${e.message}"
}
```
