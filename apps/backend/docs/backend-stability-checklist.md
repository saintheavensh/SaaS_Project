# Backend Stability Checklist

This checklist must be respected for all changes affecting inventory, sales, or financial calculations.

The AI agent must verify these rules before writing or modifying code.

---

## Transaction Safety

* All sale creation logic must run inside a single database transaction.
* No inventory mutation may occur outside the transaction boundary.
* Any failure must rollback the entire transaction.

---

## FIFO Integrity

* Inventory must only be deducted using FIFO batch logic.
* No alternative deduction strategy is allowed.
* Batch consumption must be recorded in `sales_item_batches`.

---

## Ledger Integrity

* Every stock change must generate a `stock_movements` record.
* No stock mutation is allowed without ledger entry.

---

## Financial Integrity

* COGS must equal the sum of consumed batches.
* grossProfit must equal revenue minus COGS.
* Currency calculations must not use floating-point arithmetic.

---

## Tenant Isolation

* Every repository query must include tenantId filtering.
* Cross-tenant data access is strictly forbidden.

---

## Performance Safety

* Database row locks must be minimal and short-lived.
* Dry-run calculations must not lock rows.
* Large transactions must avoid unnecessary database round-trips.

---

## Architectural Discipline

AI agents are not allowed to:

* refactor module structures
* rename domain concepts
* introduce new architectural patterns

unless explicitly instructed.
