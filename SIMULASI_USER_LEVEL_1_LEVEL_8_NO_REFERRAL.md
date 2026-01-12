# Simulasi Perhitungan: User Level 1 → Level 8 (Non-Referral) 🎯

## Overview
Simulasi ini menunjukkan perjalanan user dari Level 1 sampai Level 8 **tanpa referral** dan menghitung berapa penghasilan platform (fee) di setiap tahapan.

---

## 📊 Level Costs & Entry Values

### Level Costs (dari findup.sol)
| Level | Biaya (opBNB) | Biaya (Wei) | Catatan |
|-------|---------------|------------|---------|
| 1 | 0.0000044 | 4.4e15 | Mulai di sini |
| 2 | 0.000007200 | 7.2e15 | |
| 3 | 0.000012 | 12e15 | |
| 4 | 0.000027 | 27e15 | **Stream A Entry** → 30% = 0.0081 opBNB |
| 5 | 0.0000504 | 50.4e15 | |
| 6 | 0.000102 | 102e15 | |
| 7 | 0.000174 | 174e15 | |
| 8 | 0.000312 | 312e15 | **Stream B Entry** → 30% = 0.0936 opBNB |

### Entry Points (ke MynnGift.sol)
- **Level 4 → Stream A**: 30% dari Level 4 cost = **0.0081 opBNB** (Rank 1 Stream A)
- **Level 8 → Stream B**: 30% dari Level 8 cost = **0.0936 opBNB** (Rank 1 Stream B)

---

## 💰 Distribution Model

Ketika user masuk ke rank:
- **50%** → Receiver (user sebelumnya yang completed rank)
- **45%** → Promotion Pool (untuk benefit lain)
- **5%** → Platform Fee
  - 10% dari fee → Gas Subsidy = **0.5%** dari total
  - 90% dari fee → Platform Income = **4.5%** dari total

### Perhitungan Platform Income:
```
Platform Income = Entry Amount × 4.5%
```

---

## 🚀 Simulasi Perjalanan User Lengkap

### **FASE 1: Level 1 - 3** (Tidak ada entry ke MynnGift)
❌ User hanya bayar level upgrade, tidak masuk ke sistem gift (belum Level 4)

| Level | Biaya | Tujuan | MynnGift Entry |
|-------|-------|--------|----------------|
| 1 → 2 | 0.0000044 | Basic | ❌ Tidak |
| 2 → 3 | 0.000007200 | Upgrade | ❌ Tidak |
| 3 → 4 | 0.000012 | Upgrade | ❌ Tidak |

**Total biaya Level 1-3: 0.0000236 opBNB**  
**Platform Income dari Phase 1: 0 opBNB** ✗

---

### **FASE 2: Level 4** ⭐ STREAM A DIMULAI

#### User mencapai Level 4 dan masuk Stream A (Rank 1)

**Entry ke Stream A (Rank 1):**
- Amount: **0.0081 opBNB**
- Source: 30% dari Level 4 cost (0.000027)

**Distribution:**
```
Total: 0.0081 opBNB
├─ Receiver (50%):      0.00405 opBNB
├─ Promotion (45%):     0.003645 opBNB  
└─ Fee (5%):            0.000405 opBNB
   ├─ Gas Subsidy:      0.0000405 opBNB (10% dari fee)
   └─ PLATFORM INCOME:  0.0003645 opBNB ⭐
```

**Platform Income Rank 1 Stream A: 0.0003645 opBNB**

---

### **FASE 3: Level 5 - 7** (Stream A Rank Progression)

Setelah complete Rank 1, user perlu donate untuk next ranks di Stream A.

#### Rank 2 Stream A
- **Entry Amount**: 0.02187 opBNB
- **Platform Income**: 0.02187 × 4.5% = **0.0009841 opBNB** ⭐

#### Rank 3 Stream A
- **Entry Amount**: 0.059049 opBNB
- **Platform Income**: 0.059049 × 4.5% = **0.00265721 opBNB** ⭐

#### Rank 4 Stream A
- **Entry Amount**: 0.1594323 opBNB
- **Platform Income**: 0.1594323 × 4.5% = **0.00716544 opBNB** ⭐

#### Rank 5 Stream A
- **Entry Amount**: 0.43046721 opBNB
- **Platform Income**: 0.43046721 × 4.5% = **0.01937102 opBNB** ⭐

#### Rank 6 Stream A
- **Entry Amount**: 1.162261467 opBNB
- **Platform Income**: 1.162261467 × 4.5% = **0.05230177 opBNB** ⭐

#### Rank 7 Stream A
- **Entry Amount**: 3.138105961 opBNB
- **Platform Income**: 3.138105961 × 4.5% = **0.14121477 opBNB** ⭐

**Subtotal Platform Income (Rank 1-7 Stream A):**
```
0.0003645 + 0.0009841 + 0.00265721 + 0.00716544 + 0.01937102 + 0.05230177 + 0.14121477
= 0.22309932 opBNB ⭐ ⭐
```

---

### **FASE 4: Level 8** ⭐⭐ STREAM B STARTS

User mencapai Level 8 dan **secara bersamaan**:
1. Melanjutkan **Rank 8 di Stream A**
2. **Mulai Rank 1 di Stream B** (dengan entry 0.0936 opBNB)

#### Rank 8 Stream A (Final Rank)
- **Entry Amount**: 8.472886094 opBNB
- **Platform Income**: 8.472886094 × 4.5% = **0.38127987 opBNB** ⭐

#### Rank 1 Stream B (New Stream Start)
- **Entry Amount**: 0.0936 opBNB (11.555x lebih besar dari Stream A)
- **Platform Income**: 0.0936 × 4.5% = **0.004212 opBNB** ⭐

**Stream B Platform Income:**
```
Rank 1: 0.004212 opBNB
```

---

## 📈 RINGKASAN TOTAL PLATFORM INCOME

### **Breakdown per Rank:**

| Rank | Stream | Amount (opBNB) | Platform Fee (4.5%) |
|------|--------|----------------|-------------------|
| 1 | A | 0.0081 | 0.0003645 ⭐ |
| 2 | A | 0.02187 | 0.0009841 ⭐ |
| 3 | A | 0.059049 | 0.00265721 ⭐ |
| 4 | A | 0.1594323 | 0.00716544 ⭐ |
| 5 | A | 0.43046721 | 0.01937102 ⭐ |
| 6 | A | 1.162261467 | 0.05230177 ⭐ |
| 7 | A | 3.138105961 | 0.14121477 ⭐ |
| 8 | A | 8.472886094 | 0.38127987 ⭐ |
| **1** | **B** | **0.0936** | **0.004212** ⭐ |

### **Total Stream A (Rank 1-8):**
```
0.22309932 + 0.38127987 = 0.60437919 opBNB
```

### **Total Stream B (Rank 1):**
```
0.004212 opBNB
```

### **🎯 GRAND TOTAL PLATFORM INCOME:**
```
Stream A: 0.60437919 opBNB
Stream B: 0.004212 opBNB
─────────────────────────────
TOTAL:   0.60858919 opBNB ✅✅✅
```

---

## 📊 Visual Representation

```
┌─────────────────────────────────────────────────┐
│ USER JOURNEY: Level 1 → Level 8 (Non-Referral)  │
└─────────────────────────────────────────────────┘

Level 1-3
├─ No MynnGift Entry
├─ Total Cost: 0.0000236 opBNB
└─ Platform Income: 0 ❌

Level 4 (Stream A Entry)
├─ Rank 1 Stream A: 0.0081 → Fee: 0.0003645 ⭐
├─ Rank 2 Stream A: 0.02187 → Fee: 0.0009841 ⭐
├─ Rank 3 Stream A: 0.059049 → Fee: 0.00265721 ⭐
└─ Rank 4 Stream A: 0.1594323 → Fee: 0.00716544 ⭐

Level 5
├─ Rank 5 Stream A: 0.43046721 → Fee: 0.01937102 ⭐
└─ Rank 6 Stream A: 1.162261467 → Fee: 0.05230177 ⭐

Level 6
└─ Rank 7 Stream A: 3.138105961 → Fee: 0.14121477 ⭐

Level 7
└─ (No new MynnGift entry, waiting for Level 8)

Level 8 (Stream B Entry)
├─ Rank 8 Stream A: 8.472886094 → Fee: 0.38127987 ⭐
└─ Rank 1 Stream B: 0.0936 → Fee: 0.004212 ⭐

┌─────────────────────────────────────────────────┐
│ TOTAL PLATFORM INCOME: 0.60858919 opBNB        │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Detail Breakdown Platform Income

### Stream A Income (Rank 1-8)
```
Rank 1: 0.0081        × 4.5% = 0.0003645
Rank 2: 0.02187       × 4.5% = 0.0009841
Rank 3: 0.059049      × 4.5% = 0.00265721
Rank 4: 0.1594323     × 4.5% = 0.00716544
Rank 5: 0.43046721    × 4.5% = 0.01937102
Rank 6: 1.162261467   × 4.5% = 0.05230177
Rank 7: 3.138105961   × 4.5% = 0.14121477
Rank 8: 8.472886094   × 4.5% = 0.38127987
                              ─────────────
                    Subtotal: 0.60437919 opBNB
```

### Stream B Income (Rank 1)
```
Rank 1: 0.0936        × 4.5% = 0.004212 opBNB
```

### Grand Total
```
Stream A + Stream B = 0.60437919 + 0.004212 = 0.60858919 opBNB
```

---

## ⚙️ Asumsi Simulasi

✅ **Assumptions:**
1. User **tidak punya referral** → Tidak ada referral fee/bonus
2. User **langsung donate tanpa menunggu** untuk setiap rank
3. User **always menjadi receiver** setelah complete rank (50% share)
4. Tidak ada **auto-promotion** dari donation
5. Platform **hanya dapat fee 4.5%** dari setiap entry
6. Calculation based on **actual contract values** di MynnGift.sol
7. Level costs dari **findup.sol**

---

## 📝 Kesimpulan

Jika **1 user tanpa referral** menyelesaikan perjalanan dari **Level 1 sampai Level 8**, maka:

| Metrik | Nilai |
|--------|-------|
| **Total Platform Income** | **0.60858919 opBNB** |
| **Stream A Contribution** | **0.60437919 opBNB** (99.3%) |
| **Stream B Contribution** | **0.004212 opBNB** (0.7%) |
| **Average per Rank** | **0.067620 opBNB** |
| **Most Profitable Rank** | **Rank 8 Stream A** (0.38127987 opBNB) |
| **Least Profitable Rank** | **Rank 1 Stream A** (0.0003645 opBNB) |

---

**Generated: January 9, 2026**  
**Basis: MynnGift.sol + findup.sol contract analysis**
