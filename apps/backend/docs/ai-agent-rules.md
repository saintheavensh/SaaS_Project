# AI Development Rules for This Repository

The AI agent assisting development must follow these rules strictly.

Failure to follow these rules invalidates the code change.

---

# 1. Architecture Must Not Be Changed

The system architecture is fixed:

Controller → Service → Repository → Database

The AI agent must NOT:

• introduce new architecture patterns
• move business logic to controllers
• add new layers without approval

---

# 2. Database Schema Changes Require Explicit Approval

The AI agent must NOT:

• create new tables
• rename columns
• change field types
• create migrations

unless explicitly instructed by the developer.

---

# 3. Domain Vocabulary Must Not Be Renamed

The AI agent must NOT rename domain terms such as:

• quantityTaken
• cogs
• revenue
• grossProfit
• stock_movements

Renaming domain terms without approval is forbidden.

---

# 4. Financial Logic Must Not Be Modified

The AI agent must NOT change the following formulas:

grossProfit = revenue - cogs

COGS must always come from FIFO batch consumption.

Any change to financial logic requires explicit instruction.

---

# 5. Inventory Logic Must Not Be Modified

The AI agent must NOT change:

InventoryService.deductStockFIFO

or alter FIFO logic unless explicitly instructed.

Inventory deduction is a critical system component.

---

# 6. One Step Per Commit

The AI agent must follow incremental commits:

1 change = 1 commit.

After each step the agent must stop and wait for confirmation.

---

# 7. No Silent Refactors

The AI agent must NOT:

• refactor large sections of code
• rename files
• reorganize folders

without explicit instruction.

---

# 8. Explain Before Changing

Before modifying any core logic the AI agent must:

1. explain the proposed change
2. explain why it is necessary
3. wait for approval

Only then may the code be modified.

---

# 9. Safety Priority

When uncertain, the AI agent must:

• ask questions
• avoid making assumptions
• avoid modifying core systems

Safety and stability are more important than speed.
