# Inventory & Accounting System Invariants

This document defines **hard rules** for the Inventory and Sales system.

These rules must **never be broken by any code change**.

If a change violates any invariant, the change must be rejected.

---

# 1. Inventory Invariants

## 1.1 Stock Can Never Be Negative

At no time may inventory stock go below zero.

Every deduction must verify that available stock is sufficient before applying changes.

Violation Consequence:

• corrupted inventory state
• impossible reconciliation
• incorrect COGS calculations

---

## 1.2 FIFO Is the Only Deduction Strategy

Stock must always be deducted using FIFO (First In First Out).

Rules:

• oldest batch must be consumed first
• partial batch consumption must be recorded
• batch boundaries must be preserved

Violation Consequence:

• incorrect COGS
• accounting errors

---

## 1.3 Every Stock Change Must Be Recorded

Every stock change must generate a ledger entry in:

stock_movements

Types include:

• PURCHASE_INCREASE
• SALE_DEDUCTION
• MANUAL_ADJUSTMENT

No stock change may occur without a ledger record.

Violation Consequence:

• loss of audit trail
• impossible reconciliation

---

# 2. Financial Invariants

## 2.1 Revenue Must Equal Sum of Sale Items

For every sale:

sale.revenue must equal

SUM(item.sellPrice * item.quantity)

This must always be validated.

---

## 2.2 COGS Must Equal Sum of Consumed Batch Costs

COGS must always be derived from actual FIFO batch consumption.

COGS must equal:

SUM(batch.buyPrice * batch.quantityTaken)

If COGS differs from batch consumption, financial reports are invalid.

---

## 2.3 Gross Profit Must Always Match the Formula

grossProfit must always equal:

grossProfit = revenue - cogs

This value must never be manually set without recalculation.

---

## 2.4 Financial Numbers Must Use Exact Precision

Currency values must not rely on floating point math.

Approved approaches:

• integer minor units (cents)
• decimal arithmetic library

Floating point math is forbidden for financial totals.

---

# 3. Transaction Invariants

## 3.1 Sale Creation Must Be Atomic

The entire sale creation process must run inside a single database transaction.

This includes:

• sale record creation
• sale items creation
• batch deductions
• stock movement ledger entries

If any step fails, the transaction must rollback.

---

## 3.2 Inventory Locks Must Be Short

Row locks (`FOR UPDATE`) must only be held during the actual deduction step.

Dry-run calculations must NOT lock rows.

Violation Consequence:

• deadlocks
• performance collapse under load

---

# 4. Multi-Tenant Invariants

## 4.1 Tenant Isolation Must Be Enforced Everywhere

Every query involving business data must filter by:

tenantId

Repositories must enforce tenant filtering automatically.

Violation Consequence:

• cross-tenant data leakage
• catastrophic security failure

---

# 5. Analytics Invariants

## 5.1 Summary Tables Are Cache Only

Tables such as:

sales_summaries

must never be treated as the source of truth.

They are only cached analytics.

The source of truth remains:

sales
sales_items
sales_item_batches
stock_movements

---

# 6. Domain Vocabulary

Domain terms must remain stable and meaningful.

Examples:

quantityTaken = units consumed from a batch

Do not rename domain terms without architectural review.

Changing vocabulary breaks system comprehension and debugging.
