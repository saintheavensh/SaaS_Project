# FINANCIAL SAFETY AUDIT REPORT

## 1. Safe Modules
The following modules strictly follow the minor-unit currency pattern or do not handle price arithmetic:

*   **Sales Service ([sales.service.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/modules/sales/service/sales.service.ts))**: SUCCESSFULLY REFACTORED. All arithmetic for `totalRevenue`, `totalCogs`, and `grossProfit` now uses [decimalToMinorUnit](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/core/utils/currency.ts#6-17) and integer accumulators.
*   **Sales Repository ([sales.repository.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/modules/sales/repository/sales.repository.ts))**: SUCCESSFULLY REFACTORED. Interfaces now accept `string` for all financial fields, preventing implicit float casting.
*   **Inventory Service ([inventory/service.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/modules/inventory/service.ts))**: SAFE. Does not perform price arithmetic. Prices are handled as strings and passed through to the repository. Stock logic is strictly integer-based.
*   **Inventory Repository ([inventory/repository.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/modules/inventory/repository.ts))**: SAFE. Exact string pass-through for `buyPrice` and `sellPrice`.
*   **Ledger Repository (`ledger/repository.ts`)**: SAFE. Tracks only integer quantities (`delta`). No price information is stored or calculated.
*   **Products Repository ([products/repository.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/modules/products/repository.ts))**: SAFE. No price arithmetic performed.

---

## 2. Violations
No direct JavaScript floating-point arithmetic violations were found in the current codebase after the recent refactor. However, some modules perform implicit "magic" that bypasses the [currency.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/core/utils/currency.ts) utility.

### A. Sales Summary Repository ([sales-summary.repository.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/modules/sales/repository/sales-summary.repository.ts))
*   **File Path**: [apps/backend/src/modules/sales/repository/sales-summary.repository.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/modules/sales/repository/sales-summary.repository.ts)
*   **Code Snippet (Line 70)**: 
    ```typescript
    totalCogs: sum(sql`${salesItemBatches.quantity} * ${salesItemBatches.buyPrice}`)
    ```
*   **Why it is unsafe**: While Postgres `numeric` multiplication is exact, this arithmetic happens entirely in SQL, bypassing the centralized [currency.ts](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/core/utils/currency.ts) conversion. This makes it difficult to audit and ensure consistency if the "minor-unit" rule changes or if additional rounding logic is required.

---

## 3. SQL Arithmetic Risks
The following locations perform price multiplication directly in the database:

1.  **SalesSummaryRepository.calculateMetrics (Line 70)**:
    `sum(sql`${salesItemBatches.quantity} * ${salesItemBatches.buyPrice}`)`
2.  **SalesSummaryRepository.getProductSalesStats (Line 102)**:
    `sum(sql`${salesItems.quantity} * ${salesItems.sellPrice}`)`

*Risk*: These operations depend on Postgres `numeric` column behavior. While technically safe for precision, they violate the architectural rule that "All financial arithmetic must occur in the Service Layer/Utility".

---

## 4. Precision Risks
*   **Casting at Boundaries**: In `SalesSummaryRepository.calculateMetrics`, the values returned by `sum()` (which are strings from Postgres) are passed directly to [safeSubtract](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/core/utils/currency.ts#26-35). This is safe, but any future developer might be tempted to use `Number(val)` instead of [decimalToMinorUnit(val)](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/core/utils/currency.ts#6-17) if they need to do further math.
*   **Quantity as Number**: Throughout the system, `quantity` is handled as a JS `number`. While it is validated as an integer by Zod, any multiplication of `quantity * priceCents` must ensure the result doesn't exceed `Number.MAX_SAFE_INTEGER` (approx 90 trillion cents), which is sufficient for this SaaS scale.

---

## 5. Recommended Fixes

### Fix 1: Centralize Summary Math
Instead of performing multiplication in SQL, fetch the rows (or aggregates of quantities per unit price) and perform the multiplication in the Service Layer using [decimalToMinorUnit](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/core/utils/currency.ts#6-17).

**Proposed Refactor for [SalesSummaryRepository](file:///c:/Users/riyan/OneDrive/Documents/VsCode/my-saas-app/apps/backend/src/modules/sales/repository/sales-summary.repository.ts#9-115)**:
```typescript
// Instead of SQL sum(qty * price)
// Fetch quantities and unit prices, then:
let totalCogsCents = 0;
for (const row of rows) {
    const unitPriceCents = decimalToMinorUnit(row.buyPrice);
    totalCogsCents += unitPriceCents * row.quantity;
}
return minorUnitToDecimal(totalCogsCents);
```

### Fix 2: Enforcement via Linting
Add a custom ESLint rule (or a `grep`-based CI check) that forbids `sellPrice *`, `buyPrice *`, and `Number(sellPrice)` project-wide.

---

**AUDIT CONCLUSION**: The core Sales engine is now safe. The only outstanding architectural "leak" is the SQL-level arithmetic in the summary repository.

READY FOR CURRENCY PRECISION IMPLEMENTATION
