# SAP Commerce Cloud – Common Types Reference

## Catalog Structure

```
Catalog
  └── CatalogVersion (Staged / Online)
        └── Product / Category / Media
```

| Attribute | Type | Example |
|---|---|---|
| `Catalog.id` | String | `electronicsProductCatalog` |
| `CatalogVersion.version` | String | `Staged`, `Online` |
| `CatalogVersion.active` | Boolean | `true` for Online |

---

## Product Hierarchy

| Type | Extends | Use |
|---|---|---|
| `Product` | `Item` | Base product |
| `VariantProduct` | `Product` | Product variant (size, color…) |
| `GenericVariantProduct` | `VariantProduct` | Generic variant |

### Key Product attributes

| Attribute | Type | Description |
|---|---|---|
| `code` | String | Unique product code |
| `name` | LocalizedString | Product name |
| `description` | LocalizedString | Description |
| `approvalStatus` | ArticleApprovalStatus | `check`, `approved`, `unapproved` |
| `catalogVersion` | CatalogVersion | Associated catalog version |
| `supercategories` | Collection\<Category\> | Direct categories |
| `unit` | Unit | Unit of measure |
| `europe1Prices` | Collection\<PriceRow\> | Price rows |

---

## Order Structure

| Type | Extends | Use |
|---|---|---|
| `AbstractOrder` | `Item` | Base order/cart |
| `Order` | `AbstractOrder` | Placed order |
| `Cart` | `AbstractOrder` | Shopping cart |
| `Quote` | `AbstractOrder` | B2B quote |
| `OrderEntry` | `AbstractOrderEntry` | Order line item |
| `CartEntry` | `AbstractOrderEntry` | Cart line item |

### Key Order attributes

| Attribute | Type | Description |
|---|---|---|
| `code` | String | Order number |
| `user` | User | Customer |
| `date` | Date | Order date |
| `status` | OrderStatus | `CREATED`, `PAYMENT_AUTHORIZED`, etc. |
| `totalPrice` | Double | Total including tax |
| `currency` | Currency | Order currency |
| `deliveryAddress` | Address | Delivery address |
| `paymentAddress` | Address | Payment address |
| `entries` | Collection\<AbstractOrderEntry\> | Line items |
| `versionID` | String | Null for real orders (not saved carts) |

### OrderStatus values

`CREATED`, `CHECKED_VALID`, `PAYMENT_AUTHORIZED`, `PAYMENT_CAPTURED`, `FRAUD_CHECKED`, `PENDING_APPROVAL`, `APPROVED`, `SUSPENDED`, `APPROVED_QUOTE`, `SENT_TO_WAREHOUSE`, `READY`, `PICKUP_COMPLETE`, `COMPLETED`, `CANCELLED`

---

## User Structure

| Type | Extends | Use |
|---|---|---|
| `Principal` | `Item` | Base principal |
| `User` | `Principal` | Base user |
| `Customer` | `User` | B2C customer |
| `Employee` | `User` | Back-office user |
| `UserGroup` | `Principal` | User group |
| `B2BCustomer` | `Customer` | B2B customer |
| `B2BUnit` | `UserGroup` | B2B organization unit |

### Key User attributes

| Attribute | Type | Description |
|---|---|---|
| `uid` | String | Login / email |
| `name` | String | Display name |
| `loginDisabled` | Boolean | Whether account is locked |
| `customerID` | String | B2C customer ID |
| `groups` | Collection\<UserGroup\> | Group membership |
| `defaultShipmentAddress` | Address | Default shipping |
| `defaultPaymentAddress` | Address | Default payment |

---

## Payment & Commerce

| Type | Description |
|---|---|
| `PaymentTransaction` | Payment transaction record |
| `PaymentTransactionEntry` | Individual transaction step (auth, capture…) |
| `PaymentInfo` | Payment method info |
| `CreditCardPaymentInfo` | Credit card details |
| `DebitPaymentInfo` | Debit / bank transfer |

---

## Media

| Type | Description |
|---|---|
| `Media` | Single media file |
| `MediaContainer` | Group of media (multiple formats) |
| `MediaFormat` | Media format definition (thumbnail, detail…) |
| `MediaContext` | Media context |

---

## CMS Types

| Type | Description |
|---|---|
| `CMSSite` | Website definition |
| `ContentCatalog` | Content catalog |
| `ContentPage` | CMS page |
| `CMSNavigationNode` | Navigation tree node |
| `AbstractCMSComponent` | Base CMS component |
| `SimpleBannerComponent` | Banner component |

---

## Workflow & Jobs

| Type | Description |
|---|---|
| `CronJob` | Scheduled job instance |
| `Job` | Job definition |
| `Trigger` | Cron trigger (schedule) |
| `BusinessProcess` | Business process instance |
| `Task` | Task within a business process |

### CronJob status values

`UNKNOWN`, `RUNNING`, `FINISHED`, `ABORTED`, `PAUSED`

### CronJob result values

`UNKNOWN`, `SUCCESS`, `ERROR`, `FAILURE`

---

## Stock & Pricing

| Type | Description |
|---|---|
| `Warehouse` | Warehouse / stock location |
| `StockLevel` | Stock entry per product/warehouse |
| `PriceRow` | Price entry (price list) |
| `DiscountRow` | Discount entry |
| `TaxRow` | Tax entry |
| `Currency` | Currency definition |
| `Unit` | Unit of measure |

---

## Internationalization

| Type | Description |
|---|---|
| `Language` | Language (isocode: `en`, `fr`, `de`) |
| `Currency` | Currency (isocode: `USD`, `EUR`) |
| `Country` | Country |
| `Region` | Region/state |
