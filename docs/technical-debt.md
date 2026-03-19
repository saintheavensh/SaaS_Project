# 📌 Technical Debt Log (Final – Clean & Structured)

---

## 🧱 Module: Inventory

### 1. Type Safety (any / unknown)
**Issue**
- `tx as any`
- `tx?: any`

**Risk**
- Type safety bypass
- Bug tidak terdeteksi saat compile

**Plan**
- Standardisasi ke type `Database`
- Hilangkan semua `as any`

**Priority:** 🟡 Medium  
**When:** Setelah inventory module stable  

---

### 2. Naming Inconsistency (buyPrice vs costPrice)
**Issue**
- `buyPrice` digunakan di inventory
- `costPrice` digunakan di sales (`sales_item_batches`)

**Risk**
- Membingungkan developer
- Potensi bug saat reporting

**Plan**
- Standardisasi ke satu istilah (`costPrice`)

**Priority:** 🟡 Medium  
**When:** Refactor phase  

---

### 3. Stock Ledger Schema Inconsistency
**Issue**
- `stock_ledger.buyPrice` → text  
- `batches.buyPrice` → numeric  

**Risk**
- Query tidak optimal
- Potensi error saat agregasi

**Plan**
- Migrasi semua ke numeric

**Priority:** 🟢 Low  
**When:** Next DB migration  

---

### 4. Stock Ledger Type (Enum Improvement)
**Issue**
```ts
type: text('type')
```
**Risk**
- Tidak ada constraint value
- Potensi typo (IN / in / Out)

**Plan**
- Gunakan enum:
    IN
    OUT
    ADJUSTMENT
(future: RETURN, TRANSFER)

**Priority:** 🟡 Medium
**When:** Schema cleanup

### 5. FIFO Comment Mismatch

**Issue**
- Comment masih menyebut single batch
- Implementasi sudah multi-batch FIFO

**Risk**
- Misleading developer
- Debugging sulit

**Plan**
- Update comment sesuai implementasi

**Priority:** 🟢 Low

### 6. TenantId Usage

**Reality**
- Sudah di-handle di repository layer ✔

**Plan**
- Dokumentasikan sebagai design decision

**Priority:** 🟢 Low

### 7. Internal Validation (Inventory / Ledger)

**Issue**
- Beberapa method belum memiliki guard:
    - productId kosong
    - type undefined

**Risk**
- Error jika dipakai di luar flow utama

**Plan**
- Tambahkan minimal validation di internal layer

**Priority:** 🟢 Low

💰 Module: Sales
### 8. Sell Price Strategy ⚠️

**Status**

✔ Soft guard sudah ada (logging)

**Issue**
- Belum ada enforcement
- Belum configurable

**Risk**
- Potensi kerugian tanpa kontrol

**Plan**
- Level 1: Soft guard (✔ DONE)
- Level 2: Minimum margin config
- Level 3: Approval system

**Priority:** 🔴 High

### 9. Logging Persistence (SELL_BELOW_COST)

**Issue**
- Logging masih console / basic logger

**Risk**
- Tidak persistent
- Tidak bisa dianalisis di production

**Plan**
- Integrasi ke logging system (pino / winston / ELK)
- Atau simpan ke audit table

**Priority:** 🟡 Medium

### 10. Discount Strategy Limitation

**Issue**
- Hanya menggunakan “first discount found”
- Tidak deterministic

**Risk**
- Diskon tidak optimal
- Behavior tidak konsisten

**Plan**
- Implement:
    - best discount selection
    - stacking rules

**Priority:** 🟡 Medium

### 11. sales_item_batches Growth (Scalability)

**Issue**
- 1 item → multi batch

**Risk**
- Table cepat besar
- Query berat

**Plan**
- Tambahkan index:
    - (tenantId, batchId)
    - (tenantId, saleItemId)
- Pertimbangkan archiving

**Priority:** 🟡 Medium

### 12. Batch Traceability

**Status**
✔ SUDAH FIXED

**Note**
Sudah audit-ready
Tidak lagi technical debt

🧮 Module: Financial
### 13. Floating Precision (parseFloat)

**Issue**
- Menggunakan parseFloat

**Risk**
- Precision error (financial)

**Plan**
- Gunakan decimal.js / big.js

**Priority:** 🟡 Medium

### 14. Minor Unit vs Decimal Inconsistency

**Issue**
- Service → minor unit ✔
- DB → numeric ✔
- API → masih campur

**Risk**
- Inconsistency antar layer

**Plan**
- Standardisasi:
    - Service → minor unit
    - DB → numeric
    - API → decimal string

**Priority:** 🟡 Medium

### 15. Margin Visibility (Feature Gap)

**Issue**
- Margin belum disimpan / diexpose

**Risk**
- Tidak bisa analisa profit detail

**Plan**
- Tambahkan marginCents
- Expose ke reporting

**Priority:** 🟡 Medium

### 16. Financial Invariant Check ⚠️

**Issue**
- Belum ada validasi:
    - grossProfit === revenue - cogs

**Risk**
- Data mismatch sulit dideteksi

**Plan**
- Tambahkan invariant check di service layer

**Priority:** 🟡 Medium

⚙️ Module: Repository / Performance
### 17. Dynamic Import in Repository

**Issue**
- await import('drizzle-orm')

**Risk**
- Overhead async
- Tidak konsisten

**Plan**
- Ganti ke static import

**Priority:** 🟢 Low

### 18. Aggregation in JS (Not SQL)

**Issue**
- Menggunakan .reduce(...)

**Risk**
- Tidak scalable

**Plan**
- Gunakan SQL:
    - SUM(quantity * buy_price)

**Priority:** 🟡 Medium

📊 Module: Logging / Observability
### 19. Logger Implementation (Basic)

**Issue**
- Masih console-based logger

**Risk**
- Tidak scalable untuk production

**Plan**
- Gunakan logger library (pino / winston)
- Support transport (file / cloud)

**Priority:** 🟡 Medium

### 20. Logging Environment Awareness

**Issue**
- Belum ada control berdasarkan environment

**Risk**
- Noise di production

**Plan**
- Tambahkan log level via env

**Priority:** 🟢 Low

### 21. Logging Payload Standardization

**Issue**
- Payload belum memiliki schema baku

**Risk**
- Sulit dianalisis

**Plan**
- Define logging contract:
    - event
    - context
    - metadata

**Priority:** 🟡 Medium

🕒 Module: Time & Aggregation
### 22. Timezone Handling Strategy ⚠️

**Issue**
- Aggregation menggunakan UTC
- Belum aware tenant timezone

**Risk**
- Laporan tidak sesuai hari operasional lokal

**Plan**
- Tambahkan tenant.timezone
- Timezone-aware aggregation

**Priority:** 🟡 Medium

### 23. salesCount Semantics

**Issue**
- salesCount += 1 (per transaction)
- Belum jelas definisinya

**Risk**
- Ambiguity di reporting

**Plan**
- Define:
    - transactionCount
    - atau itemCount

**Priority:** 🟢 Low

### 24. Numeric String Arithmetic

**Issue**
- DB menggunakan numeric (string di TS)
- Digabung dengan SQL arithmetic

**Risk**
- Implicit casting
- Potensi misuse

**Plan**
- Dokumentasikan contract:
    - DB → numeric
    - Service → minor unit

**Priority:** 🟡 Medium

### 25. Aggregation Placement Coupling ⚠️

**Issue**
- Aggregation dilakukan di SalesService

**Risk**
- Tight coupling
- Sulit scaling ke event-driven architecture

**Plan**
- Introduce event:
    - SALE_CREATED
- Pindahkan ke async handler / worker

**Risk**
Ambiguity di reporting

**Plan**
Define:
    - transactionCount
    - atau itemCount

**Priority:** 🟢 Low

### 24. Numeric String Arithmetic

**Issue**
- DB menggunakan numeric (string di TS)
- Digabung dengan SQL arithmetic

**Risk**
- Implicit casting
- Potensi misuse

**Plan**
- Dokumentasikan contract:
    - DB → numeric
    - Service → minor unit

**Priority:** 🟡 Medium

### 25. Aggregation Placement Coupling ⚠️

**Issue**
- Aggregation dilakukan di SalesService

**Risk**
- Tight coupling
- Sulit scaling ke event-driven architecture

**Plan**
- Introduce event:
    - SALE_CREATED
- Pindahkan ke async handler / worker

**Priority:** 🟡 Medium