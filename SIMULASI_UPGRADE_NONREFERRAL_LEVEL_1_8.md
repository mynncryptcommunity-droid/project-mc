# Simulasi Distribusi Upgrade Level 1 → Level 8 (NON-REFERRAL) 💰

## Overview
Simulasi untuk user **NON-REFERRAL** (tidak punya upline/sponsor).
Semua reward (upline, sponsor) masuk ke **platform** KECUALI **royalty pool (3%)**.

---

## 📊 Level Costs

```
Level: [4.4e15, 7.20e15, 12e15, 27e15, 50.4e15, 102e15, 174e15, 312e15]

Level 1: 0.0000044 opBNB
Level 2: 0.000007200 opBNB
Level 3: 0.000012 opBNB
Level 4: 0.000027 opBNB ⭐ (+ 30% → MynnGift Stream A)
Level 5: 0.0000504 opBNB
Level 6: 0.000102 opBNB
Level 7: 0.000174 opBNB
Level 8: 0.000312 opBNB ⭐ (+ 30% → MynnGift Stream B)
```

---

## ⚙️ Distribution Model (Non-Referral)

Untuk user tanpa upline/sponsor, setiap upgrade didistribusikan:

```
100% dari upgrade cost

├─ Upline:     uplinePercents[level] % → PLATFORM ⭐
├─ Sponsor:    10% → PLATFORM ⭐
├─ Royalty:    3% → ROYALTY POOL (tidak ke platform)
├─ NobleGift:  30% (HANYA di Level 3) → NobleGift contract
├─ MynnGift:   30% (HANYA di Level 4 & 8) → MynnGift contract
└─ Sharefee:   Sisanya → PLATFORM ⭐
```

**Rumus Platform Income:**
```
Platform = Upline + Sponsor + Sharefee (+ MynnGift 4.5% fee later)
```

---

## 🎯 Perhitungan Detail per Level

### **Level 1 → 2: 0.0000044 opBNB**
```
Upline:        0.0000044 × 80% = 0.00000352 → PLATFORM
Sponsor:       0.0000044 × 10% = 0.00000044 → PLATFORM
Royalty:       0.0000044 × 3%  = 0.00000013 → Royalty Pool
NobleGift:     0 (level ≠ 3)
MynnGift:      0 (level ≠ 4,8)
Sharefee:      0.0000044 × 7%  = 0.00000031 → PLATFORM
─────────────────────────────────────────────────
PLATFORM TOTAL: 0.00000352 + 0.00000044 + 0.00000031 = 0.00000427 opBNB ⭐
ROYALTY POOL:   0.00000013 opBNB
```

---

### **Level 2 → 3: 0.000007200 opBNB**
```
Upline:        0.000007200 × 80% = 0.00000576 → PLATFORM
Sponsor:       0.000007200 × 10% = 0.00000072 → PLATFORM
Royalty:       0.000007200 × 3%  = 0.00000022 → Royalty Pool
NobleGift:     0 (level ≠ 3)
MynnGift:      0
Sharefee:      0.000007200 × 7% = 0.00000504 → PLATFORM
─────────────────────────────────────────────────
PLATFORM TOTAL: 0.00000576 + 0.00000072 + 0.00000504 = 0.00001152 opBNB ⭐
ROYALTY POOL:   0.00000022 opBNB
```

---

### **Level 3 → 4: 0.000012 opBNB** ⭐ NobleGift 30%
```
Upline:        0.000012 × 50% = 0.000006 → PLATFORM
Sponsor:       0.000012 × 10% = 0.0000012 → PLATFORM
Royalty:       0.000012 × 3%  = 0.00000036 → Royalty Pool
NobleGift:     0.000012 × 30% = 0.0000036 → NobleGift contract ⭐
MynnGift:      0
Sharefee:      0.000012 × 7%  = 0.00000084 → PLATFORM
─────────────────────────────────────────────────
PLATFORM TOTAL: 0.000006 + 0.0000012 + 0.00000084 = 0.0000080400 opBNB ⭐
ROYALTY POOL:   0.00000036 opBNB
NOBLEGIFT:      0.0000036 opBNB
```

---

### **Level 4 → 5: 0.000027 opBNB** ⭐⭐ MynnGift Stream A 30%
```
Upline:        0.000027 × 80% = 0.0000216 → PLATFORM
Sponsor:       0.000027 × 10% = 0.0000027 → PLATFORM
Royalty:       0.000027 × 3%  = 0.00000081 → Royalty Pool
NobleGift:     0
MynnGift:      0.000027 × 30% = 0.0000081 → MynnGift Stream A (Rank 1) ⭐⭐
Sharefee:      0.000027 × 7%  = 0.00000189 → PLATFORM
─────────────────────────────────────────────────
PLATFORM TOTAL: 0.0000216 + 0.0000027 + 0.00000189 = 0.0000262 opBNB ⭐
ROYALTY POOL:   0.00000081 opBNB
MYNNGIFT A:     0.0000081 opBNB → Platform dapat 4.5% = 0.0003645 opBNB (later) ⭐⭐
```

---

### **Level 5 → 6: 0.0000504 opBNB**
```
Upline:        0.0000504 × 80% = 0.00004032 → PLATFORM
Sponsor:       0.0000504 × 10% = 0.00000504 → PLATFORM
Royalty:       0.0000504 × 3%  = 0.00000151 → Royalty Pool
NobleGift:     0
MynnGift:      0
Sharefee:      0.0000504 × 7%  = 0.00003528 → PLATFORM
─────────────────────────────────────────────────
PLATFORM TOTAL: 0.00004032 + 0.00000504 + 0.00003528 = 0.00008064 opBNB ⭐
ROYALTY POOL:   0.00000151 opBNB
```

---

### **Level 6 → 7: 0.000102 opBNB**
```
Upline:        0.000102 × 80% = 0.0000816 → PLATFORM
Sponsor:       0.000102 × 10% = 0.0000102 → PLATFORM
Royalty:       0.000102 × 3%  = 0.00000306 → Royalty Pool
NobleGift:     0
MynnGift:      0
Sharefee:      0.000102 × 7%  = 0.00007140 → PLATFORM
─────────────────────────────────────────────────
PLATFORM TOTAL: 0.0000816 + 0.0000102 + 0.00007140 = 0.0001632 opBNB ⭐
ROYALTY POOL:   0.00000306 opBNB
```

---

### **Level 7 → 8: 0.000174 opBNB**
```
Upline:        0.000174 × 80% = 0.0001392 → PLATFORM
Sponsor:       0.000174 × 10% = 0.0000174 → PLATFORM
Royalty:       0.000174 × 3%  = 0.00000522 → Royalty Pool
NobleGift:     0
MynnGift:      0
Sharefee:      0.000174 × 7%  = 0.00012180 → PLATFORM
─────────────────────────────────────────────────
PLATFORM TOTAL: 0.0001392 + 0.0000174 + 0.00012180 = 0.0002784 opBNB ⭐
ROYALTY POOL:   0.00000522 opBNB
```

---

### **Level 8 → 9: 0.000312 opBNB** ⭐⭐ MynnGift Stream B 30%
```
Upline:        0.000312 × 80% = 0.0002496 → PLATFORM
Sponsor:       0.000312 × 10% = 0.0000312 → PLATFORM
Royalty:       0.000312 × 3%  = 0.00000936 → Royalty Pool
NobleGift:     0
MynnGift:      0.000312 × 30% = 0.0000936 → MynnGift Stream B (Rank 1) ⭐⭐
Sharefee:      0.000312 × 7%  = 0.00021840 → PLATFORM
─────────────────────────────────────────────────
PLATFORM TOTAL: 0.0002496 + 0.0000312 + 0.00021840 = 0.0005 opBNB ⭐
ROYALTY POOL:   0.00000936 opBNB
MYNNGIFT B:     0.0000936 opBNB → Platform dapat 4.5% = 0.004212 opBNB (later) ⭐⭐
```

---

## 📈 RINGKASAN TOTAL PLATFORM INCOME

### **Direct dari Findup Upgrade (Upline + Sponsor + Sharefee):**

| Level | From → To | Cost | Platform Income |
|-------|-----------|------|-----------------|
| 1 | 1 → 2 | 0.0000044 | 0.00000427 ⭐ |
| 2 | 2 → 3 | 0.000007200 | 0.00001152 ⭐ |
| 3 | 3 → 4 | 0.000012 | 0.0000080400 ⭐ |
| 4 | 4 → 5 | 0.000027 | 0.0000262 ⭐ |
| 5 | 5 → 6 | 0.0000504 | 0.00008064 ⭐ |
| 6 | 6 → 7 | 0.000102 | 0.0001632 ⭐ |
| 7 | 7 → 8 | 0.000174 | 0.0002784 ⭐ |
| 8 | 8 → 9 | 0.000312 | 0.0005 ⭐ |

**Subtotal Findup:** 
```
0.00000427 + 0.00001152 + 0.0000080400 + 0.0000262 + 0.00008064 
+ 0.0001632 + 0.0002784 + 0.0005

= 0.00095007 opBNB ⭐
```

### **Indirect dari MynnGift (4.5% dari entry points):**

```
Stream A Entry (Level 4): 0.0000081 × 4.5% = 0.0003645 opBNB ⭐⭐
Stream B Entry (Level 8): 0.0000936 × 4.5% = 0.004212 opBNB ⭐⭐
─────────────────────────────────────────────────
Subtotal MynnGift:                             0.0045765 opBNB
```

### **🎯 GRAND TOTAL Platform Income:**
```
Findup Direct:    0.00095007 opBNB
MynnGift Indirect: 0.0045765 opBNB
─────────────────────────────────────
TOTAL:            0.00552657 opBNB ✅✅✅
```

---

## 📊 Bonus: Royalty Pool

Semua level berkontribusi ke royalty pool:

| Level | Royalty (3%) |
|-------|-------------|
| 1 → 2 | 0.00000013 |
| 2 → 3 | 0.00000022 |
| 3 → 4 | 0.00000036 |
| 4 → 5 | 0.00000081 |
| 5 → 6 | 0.00000151 |
| 6 → 7 | 0.00000306 |
| 7 → 8 | 0.00000522 |
| 8 → 9 | 0.00000936 |

**Total Royalty Pool:**
```
0.00002067 opBNB
```

---

## 📊 Visual Breakdown

```
┌──────────────────────────────────────────────────────────┐
│ NON-REFERRAL USER: Level 1 → Level 8                     │
│ (Semua reward ke platform, royalty pool terpisah)        │
└──────────────────────────────────────────────────────────┘

PLATFORM INCOME BREAKDOWN:

Findup Direct (Upline + Sponsor + Sharefee):
├─ Level 1→2:  0.00000427 opBNB (97% ke platform, 3% royalty)
├─ Level 2→3:  0.00001152 opBNB
├─ Level 3→4:  0.0000080400 opBNB (+ 30% ke NobleGift)
├─ Level 4→5:  0.0000262 opBNB (+ 30% ke MynnGift A)
├─ Level 5→6:  0.00008064 opBNB
├─ Level 6→7:  0.0001632 opBNB
├─ Level 7→8:  0.0002784 opBNB
└─ Level 8→9:  0.0005 opBNB (+ 30% ke MynnGift B)
   ├─────────────────────────
   └─ Subtotal: 0.00095007 opBNB ⭐

MynnGift Indirect (4.5% dari entry points):
├─ Stream A:   0.0003645 opBNB ⭐⭐
└─ Stream B:   0.004212 opBNB ⭐⭐
   ├─────────────────────────
   └─ Subtotal: 0.0045765 opBNB

ROYALTY POOL (3% dari setiap level):
└─ Total: 0.00002067 opBNB ✅

┌──────────────────────────────────────────────────────────┐
│ TOTAL PLATFORM INCOME: 0.00552657 opBNB                  │
│ (Findup: 0.00095007 + MynnGift: 0.0045765)              │
│ PLUS ROYALTY POOL: 0.00002067 opBNB (separate)          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔍 Comparison: Platform Income vs Total Upgrade Cost

```
Total Upgrade Cost (Level 1→8):
= 0.0000044 + 0.000007200 + 0.000012 + 0.000027 + 0.0000504 
  + 0.000102 + 0.000174 + 0.000312
= 0.000798 opBNB

Platform Income (Findup + MynnGift):
= 0.00552657 opBNB

Effective Rate:
= 0.00552657 / 0.000798 × 100 = 692%

Ini tinggi karena MynnGift juga memberikan income tambahan!
```

---

## 📝 Kesimpulan

**Untuk 1 user non-referral yang upgrade Level 1 → Level 8:**

| Item | Nilai |
|------|-------|
| **Total Upgrade Cost** | 0.000798 opBNB |
| **Platform Income (Findup)** | 0.00095007 opBNB |
| **Platform Income (MynnGift)** | 0.0045765 opBNB |
| **TOTAL Platform Income** | **0.00552657 opBNB** ✅ |
| **Royalty Pool** | 0.00002067 opBNB |
| **Total all (Platform + Royalty)** | **0.00554724 opBNB** |

### Key Insights:

1. **97% upgrade cost masuk ke platform** (Upline + Sponsor + Sharefee)
2. **3% masuk ke Royalty Pool** (tidak bisa diklaim langsung)
3. **30% di Level 4 dan 8 untuk MynnGift entry**, tapi juga membuat platform dapat fee 4.5%
4. **Effective rate platform 69.2%** dari total upgrade cost
5. **Level 8 paling menguntungkan** untuk MynnGift income (0.004212 opBNB dari Stream B)

---

**Generated: January 9, 2026**  
**Basis: findup.sol upgrade logic (non-referral path) + MynnGift.sol distribution**
