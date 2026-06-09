# FlexibleSearch Guide

FlexibleSearch is a SQL-like query language built into SAP Commerce Cloud. It runs against the Hybris type system (not raw SQL tables).

---

## Basic Syntax

```sql
SELECT {alias:attribute}, {alias2:attribute}
FROM {TypeName AS alias}
JOIN {OtherType AS alias2} ON {alias:ref}={alias2:pk}
WHERE {alias:attribute} = ?param
ORDER BY {alias:attribute} ASC
```

### Key rules

- Always wrap attribute references in `{ }`: `{product:code}`
- Type names use PascalCase: `Product`, `Order`, `Customer`
- Alias with `AS`: `{Product AS p}`
- Localized attributes use `[locale]`: `{p:name[en]}`
- Subqueries use `{{ }}` (double braces)
- Use `?param` for parameter binding (HAC console: just inline values directly)

---

## Common Types

| Type | Description |
|---|---|
| `Product` | Products |
| `VariantProduct` | Product variants |
| `Category` | Categories |
| `Catalog` | Catalogs |
| `CatalogVersion` | Catalog versions (Staged/Online) |
| `Order` | Customer orders |
| `OrderEntry` | Order line items |
| `Cart` | Shopping carts |
| `CartEntry` | Cart line items |
| `Customer` | B2C customers |
| `Employee` | Back-office users |
| `User` | Base user type |
| `UserGroup` | User groups |
| `Address` | Addresses |
| `StockLevel` | Stock entries |
| `PriceRow` | Price entries |
| `DiscountRow` | Discount entries |
| `Tax` | Taxes |
| `PaymentTransaction` | Payment transactions |
| `CronJob` | Scheduled jobs |
| `BusinessProcess` | Business process instances |
| `MediaContainer` | Media containers |
| `Media` | Media files |
| `CMSSite` | CMS websites |
| `ContentPage` | CMS pages |

---

## Common Queries

### Products

```sql
-- Find product by exact code
SELECT {pk},{code},{name[en]} FROM {Product} WHERE {code}='LAPTOP_001'

-- Search products in a catalog
SELECT {p:pk},{p:code},{p:name[en]}
FROM {Product AS p}
JOIN {CatalogVersion AS cv} ON {p:catalogVersion}={cv:pk}
JOIN {Catalog AS c} ON {cv:catalog}={c:pk}
WHERE {c:id}='electronicsProductCatalog'
  AND {cv:version}='Online'
ORDER BY {p:code}

-- Products approved and active
SELECT {pk},{code} FROM {Product}
WHERE {approvalStatus}='approved'
  AND {catalogVersion} IN (
    {{ SELECT {pk} FROM {CatalogVersion} WHERE {active}=1 }}
  )

-- Count products by catalog version
SELECT {cv:version}, COUNT({p:pk})
FROM {Product AS p}
JOIN {CatalogVersion AS cv} ON {p:catalogVersion}={cv:pk}
GROUP BY {cv:pk},{cv:version}
```

### Orders

```sql
-- Find order by code
SELECT {pk},{code},{status},{totalPrice}
FROM {Order}
WHERE {code}='ORDER123'
  AND {versionID} IS NULL

-- Orders for a customer
SELECT {o:pk},{o:code},{o:date},{o:totalPrice}
FROM {Order AS o}
JOIN {Customer AS c} ON {o:user}={c:pk}
WHERE {c:uid}='customer@example.com'
  AND {o:versionID} IS NULL
ORDER BY {o:date} DESC

-- Recent orders (today)
SELECT {pk},{code},{date},{totalPrice},{status}
FROM {Order}
WHERE {date} >= TO_DATE(SYSDATE)
  AND {versionID} IS NULL
ORDER BY {date} DESC

-- Order line items
SELECT {oe:entryNumber},{p:code},{p:name[en]},{oe:quantity},{oe:totalPrice}
FROM {OrderEntry AS oe}
JOIN {Order AS o} ON {oe:order}={o:pk}
JOIN {Product AS p} ON {oe:product}={p:pk}
WHERE {o:code}='ORDER123'
```

### Customers / Users

```sql
-- Find customer by email
SELECT {pk},{uid},{name},{loginDisabled}
FROM {Customer}
WHERE {uid}='customer@example.com'

-- List all customers in a usergroup
SELECT {u:pk},{u:uid},{u:name}
FROM {Customer AS u}
JOIN {PrincipalGroupRelation AS pgr} ON {pgr:source}={u:pk}
JOIN {UserGroup AS ug} ON {pgr:target}={ug:pk}
WHERE {ug:uid}='customergroup'

-- Locked accounts
SELECT {pk},{uid},{name},{loginDisabled}
FROM {Customer}
WHERE {loginDisabled}=1
ORDER BY {name}
```

### Stock

```sql
-- Stock for a product in a warehouse
SELECT {sl:pk},{sl:productCode},{sl:available},{sl:reserved}
FROM {StockLevel AS sl}
JOIN {Warehouse AS w} ON {sl:warehouse}={w:pk}
WHERE {sl:productCode}='LAPTOP_001'
  AND {w:code}='default'

-- Out of stock products
SELECT DISTINCT {p:code},{p:name[en]}
FROM {Product AS p}
JOIN {StockLevel AS sl} ON {sl:productCode}={p:code}
WHERE {sl:available}=0
```

### Prices

```sql
-- Price entries for a product
SELECT {pr:pk},{pr:price},{pr:currency},{pr:minqtd},{pr:unit}
FROM {PriceRow AS pr}
JOIN {Product AS p} ON {pr:product}={p:pk}
WHERE {p:code}='LAPTOP_001'
ORDER BY {pr:minqtd}
```

### CronJobs

```sql
-- All cronjobs and their status
SELECT {pk},{code},{status},{result},{startTime},{endTime}
FROM {CronJob}
ORDER BY {startTime} DESC

-- Failed cronjobs in the last 24h
SELECT {pk},{code},{status},{result},{startTime}
FROM {CronJob}
WHERE {result}='FAILURE'
  AND {startTime} >= SYSDATE - 1
ORDER BY {startTime} DESC
```

---

## Tips and Caveats

- **versionID IS NULL** – always filter orders/quotes with `{versionID} IS NULL` to exclude saved-cart versions
- **Localized attributes** – use `{name[en]}` not `{name}`; the locale must match installed languages
- **NULL checks** – use `IS NULL` / `IS NOT NULL`, not `= NULL`
- **Date functions** – Oracle syntax: `SYSDATE`, `TRUNC(SYSDATE)`, `TO_DATE(...)`; MySQL: `NOW()`, `DATE(...)`
- **LIKE** is case-sensitive in some DB configs; use `LOWER({code}) LIKE LOWER('%term%')` for safety
- **Subqueries** use `{{ ... }}` (double braces), not single
- **MAX rows** – default 200; increase with `--max-count` for large exports
