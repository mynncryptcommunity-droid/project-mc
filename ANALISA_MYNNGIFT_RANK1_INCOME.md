# Analisa MynnGift: Pendapatan User di Rank 1 (Stream A & B) 💰

## Overview
Analisa detail tentang bagaimana user mendapat income di **Rank 1** MynnGift untuk **Stream A** dan **Stream B**.
Fokus pada distribusi income ketika rank 1 completed (6 donors masuk).

---

## 📊 Rank 1 Configuration

### Stream A (Entry dari Level 4)
```
Entry Amount:        0.0081 opBNB
Max Donors per Rank: 6
Total Funds Rank 1:  6 × 0.0081 = 0.0486 opBNB
```

### Stream B (Entry dari Level 8)
```
Entry Amount:        0.0936 opBNB
Max Donors per Rank: 6
Total Funds Rank 1:  6 × 0.0936 = 0.5616 opBNB
```

---

## 💵 Distribution Model Rank 1

Ketika **6 donor** masuk ke **Rank 1**, maka totalFunds akan **completed** dan di-distribute:

### **Total Funds = 6 × Entry Amount**

```
Receiver Share:    50%  → User di waiting queue Rank 1
Promotion Share:   45%  → Promotion pool (untuk auto-promote)
Fee:               5%   → Platform
  ├─ Gas Subsidy:  10% dari fee = 0.5% dari total
  └─ Platform Fee: 90% dari fee = 4.5% dari total
```

---

## 🎯 Simulasi Income: Rank 1 Stream A

### **Entry & Accumulation Phase**

```
Donor 1 masuk: 0.0081 opBNB  (rank belum complete)
Donor 2 masuk: 0.0081 opBNB  (rank belum complete)
Donor 3 masuk: 0.0081 opBNB  (rank belum complete)
Donor 4 masuk: 0.0081 opBNB  (rank belum complete)
Donor 5 masuk: 0.0081 opBNB  (rank belum complete)
Donor 6 masuk: 0.0081 opBNB  ← RANK COMPLETE ✅
────────────────────────────
Total Funds:   0.0486 opBNB
```

### **Distribution Phase (Rank Complete)**

```
Receiver Share = 0.0486 × 50% = 0.0243 opBNB ⭐⭐⭐

Promotion Share = 0.0486 × 45% = 0.021870 opBNB
  (Add ke promotion pool)

Fee = 0.0486 × 5% = 0.00243 opBNB
  ├─ Gas Subsidy = 0.00243 × 10% = 0.000243 opBNB (Add ke gas subsidy pool)
  └─ Platform Fee = 0.00243 × 90% = 0.002187 opBNB
```

### **Who Gets What?**

#### **User di Waiting Queue (First in queue = RECEIVER)**
- Amount: **0.0243 opBNB** ⭐⭐⭐
- Status: Menjadi isReceiver_StreamA = true
- Next: Auto-promote ke Rank 2

```
User Income (Rank 1 Receiver): 0.0243 opBNB
```

#### **Promotion Pool**
- Amount: 0.021870 opBNB
- Purpose: Fund untuk auto-promote ke rank berikutnya
- User yang menerima: User yang dikembalikan ke waiting queue untuk next rank

#### **Gas Subsidy Pool**
- Amount: 0.000243 opBNB
- Purpose: Backup fund jika promotion pool tidak cukup

#### **Platform (Sharefee)**
- Amount: 0.002187 opBNB
- Purpose: Revenue untuk platform

---

## 🎯 Simulasi Income: Rank 1 Stream B

### **Entry & Accumulation Phase**

```
Donor 1 masuk: 0.0936 opBNB  (rank belum complete)
Donor 2 masuk: 0.0936 opBNB  (rank belum complete)
Donor 3 masuk: 0.0936 opBNB  (rank belum complete)
Donor 4 masuk: 0.0936 opBNB  (rank belum complete)
Donor 5 masuk: 0.0936 opBNB  (rank belum complete)
Donor 6 masuk: 0.0936 opBNB  ← RANK COMPLETE ✅
────────────────────────────
Total Funds:   0.5616 opBNB
```

### **Distribution Phase (Rank Complete)**

```
Receiver Share = 0.5616 × 50% = 0.2808 opBNB ⭐⭐⭐⭐

Promotion Share = 0.5616 × 45% = 0.252720 opBNB
  (Add ke promotion pool)

Fee = 0.5616 × 5% = 0.02808 opBNB
  ├─ Gas Subsidy = 0.02808 × 10% = 0.002808 opBNB (Add ke gas subsidy pool)
  └─ Platform Fee = 0.02808 × 90% = 0.025272 opBNB
```

### **Who Gets What?**

#### **User di Waiting Queue (First in queue = RECEIVER)**
- Amount: **0.2808 opBNB** ⭐⭐⭐⭐
- Status: Menjadi isReceiver_StreamB = true
- Next: Auto-promote ke Rank 2

```
User Income (Rank 1 Receiver): 0.2808 opBNB
```

#### **Promotion Pool**
- Amount: 0.252720 opBNB
- Purpose: Fund untuk auto-promote ke rank berikutnya (Rank 2 entry: 0.252288)
- Status: Cukup untuk promote!

#### **Gas Subsidy Pool**
- Amount: 0.002808 opBNB
- Purpose: Backup fund

#### **Platform (Sharefee)**
- Amount: 0.025272 opBNB
- Purpose: Revenue untuk platform

---

## 📈 Comparison: Stream A vs Stream B (Rank 1)

| Aspek | Stream A | Stream B | Multiplier |
|-------|----------|---------|-----------|
| **Entry Amount** | 0.0081 | 0.0936 | **11.555x** |
| **Total Funds (6 donors)** | 0.0486 | 0.5616 | **11.555x** |
| **Receiver Share (50%)** | **0.0243** | **0.2808** | **11.555x** |
| **Promotion Share (45%)** | 0.021870 | 0.252720 | **11.555x** |
| **Platform Fee (4.5%)** | 0.002187 | 0.025272 | **11.555x** |
| **Gas Subsidy (0.5%)** | 0.000243 | 0.002808 | **11.555x** |

**Key Insight:** Stream B adalah **perfect scaled version** dari Stream A dengan 11.555x multiplier di semua kategori!

---

## 🔄 Auto-Promotion Mechanics

Setelah menerima payout Rank 1, user **otomatis di-promote ke Rank 2** menggunakan promotion pool:

### **Stream A: Rank 1 → Rank 2**
```
User menerima:       0.0243 opBNB (Rank 1 receiver payout)
Promotion Pool:      0.021870 opBNB (dari Rank 1 completion)
Rank 2 Entry Cost:   0.02187 opBNB

Status: Cukup untuk promote ke Rank 2 ✅
        (0.021870 ≈ 0.02187, sisa 0.000000 opBNB)
```

### **Stream B: Rank 1 → Rank 2**
```
User menerima:       0.2808 opBNB (Rank 1 receiver payout)
Promotion Pool:      0.252720 opBNB (dari Rank 1 completion)
Rank 2 Entry Cost:   0.252288 opBNB

Status: Cukup untuk promote ke Rank 2 ✅
        (0.252720 > 0.252288, sisa 0.000432 opBNB)
```

**Formula untuk Auto-Promote:**
```
IF promotionPool >= rankDonationValues[nextRank]:
  Gunakan promotionPool untuk donate ke next rank
  User auto-promoted
ELSE:
  Gunakan gasSubsidyPool untuk cover shortfall
  User auto-promoted dengan backup
```

---

## 💰 User Income Flow: Rank 1 Complete

### **Stream A Complete Flow**

```
┌─────────────────────────────────────────────────┐
│ 6 Donors enter Rank 1 Stream A                   │
│ Total: 6 × 0.0081 = 0.0486 opBNB                │
└─────────────────────────────────────────────────┘
                          ↓
         ┌────────────────────────────────┐
         │ DISTRIBUTION (when 6th donor)  │
         └────────────────────────────────┘
         ↓                ↓              ↓
    RECEIVER (50%)   PROMOTION    PLATFORM (5%)
    0.0243 opBNB     (45%)         ├─ Fee: 0.002187
    ⭐⭐⭐          0.021870      ├─ Gas: 0.000243
                                  └─ Total: 0.00243
         ↓
    USER RECEIVES
    0.0243 opBNB
         ↓
    Auto-Promote to Rank 2
    (using 0.021870 from promotion pool)
```

### **Stream B Complete Flow**

```
┌─────────────────────────────────────────────────┐
│ 6 Donors enter Rank 1 Stream B                   │
│ Total: 6 × 0.0936 = 0.5616 opBNB                │
└─────────────────────────────────────────────────┘
                          ↓
         ┌────────────────────────────────┐
         │ DISTRIBUTION (when 6th donor)  │
         └────────────────────────────────┘
         ↓                ↓              ↓
    RECEIVER (50%)   PROMOTION    PLATFORM (5%)
    0.2808 opBNB     (45%)         ├─ Fee: 0.025272
    ⭐⭐⭐⭐        0.252720      ├─ Gas: 0.002808
                                  └─ Total: 0.02808
         ↓
    USER RECEIVES
    0.2808 opBNB
         ↓
    Auto-Promote to Rank 2
    (using 0.252720 from promotion pool)
```

---

## 🎯 User Income Scenarios

### **Scenario 1: User masuk Rank 1 sebagai Donor 1 (First)**

**Timeline:**
```
1. User masuk Rank 1 Stream A sebagai Donor 1
   - Donation: 0.0081 opBNB
   - User balance: -0.0081 opBNB (outflow)
   
2. Donor 2-5 masuk (user menunggu)
   - User balance: Still -0.0081 opBNB
   
3. Donor 6 masuk (Rank 1 complete)
   - Distribution happens
   - User di waiting queue → RECEIVER
   - User balance: -0.0081 + 0.0243 = +0.0162 opBNB ✅
   
4. Auto-promote to Rank 2
   - User masuk Rank 2 sebagai donor
```

**Net Income Rank 1:** 
```
Income: 0.0243 opBNB
Cost: 0.0081 opBNB
Profit: 0.0162 opBNB (200% ROI on entry) ⭐
```

### **Scenario 2: User masuk Rank 1 sebagai Donor 6 (Last)**

**Timeline:**
```
1. Donor 1-5 sudah masuk (waiting)
2. User masuk sebagai Donor 6 → Rank 1 COMPLETE
3. Distribution:
   - First in queue (Donor 1) dapat 0.0243 opBNB
   - Donor 2-6 masuk waiting queue untuk Rank 2
   - User (Donor 6) tidak dapat income dari Rank 1 receiver
   - User hanya dapat dari promotion pool saat Rank 2 complete
```

**Net Income Rank 1:**
```
Cost: 0.0081 opBNB
Income from receiver: 0 opBNB (jadi waiting queue untuk Rank 2)
Profit: -0.0081 opBNB (yet to receive from Rank 2) ⏳
```

---

## 📊 Income Summary: Rank 1

### **As Receiver (Position 1 in Waiting Queue)**

| Stream | Amount | Notes |
|--------|--------|-------|
| **Stream A** | **0.0243 opBNB** | ROI: 200% dari entry |
| **Stream B** | **0.2808 opBNB** | ROI: 200% dari entry |

### **Pools Generated**

| Pool | Stream A | Stream B | Notes |
|------|----------|---------|-------|
| **Promotion** | 0.021870 | 0.252720 | Fund auto-promote |
| **Gas Subsidy** | 0.000243 | 0.002808 | Backup fund |
| **Platform** | 0.002187 | 0.025272 | Platform revenue |

### **Total Generated (All sources)**

```
Stream A Rank 1:
├─ Receiver: 0.0243 opBNB
├─ Promotion: 0.021870 opBNB
├─ Gas Subsidy: 0.000243 opBNB
└─ Platform: 0.002187 opBNB
   Total: 0.0486 opBNB (6 × 0.0081)

Stream B Rank 1:
├─ Receiver: 0.2808 opBNB
├─ Promotion: 0.252720 opBNB
├─ Gas Subsidy: 0.002808 opBNB
└─ Platform: 0.025272 opBNB
   Total: 0.5616 opBNB (6 × 0.0936)
```

---

## 🔍 Key Findings

### **1. Receiver Income (What User Gets)**
```
Position 1: Most valuable
├─ Stream A: 0.0243 opBNB
└─ Stream B: 0.2808 opBNB (11.555x besar!)

Position 2-6: Waiting queue, akan dapat income di rank berikutnya
```

### **2. Promotion Pool Effect**
```
Stream A: 0.021870 opBNB
├─ Rank 2 entry cost: 0.02187
└─ Status: Exactly enough untuk auto-promote ✅

Stream B: 0.252720 opBNB
├─ Rank 2 entry cost: 0.252288
└─ Status: Sedikit lebih, ada sisa untuk next cycle
```

### **3. Auto-Promotion Guaranteed**
```
Promotion pool ALWAYS cukup untuk promote ke Rank 2!
(45% dari 6 donations > Rank 2 entry cost)

Jika shortage, gas subsidy pool cover.
Jika keduanya tidak cukup: Fund dari platform atau block promotion.
```

### **4. Stream B Advantage**
```
Stream A Rank 1 Receiver: 0.0243 opBNB
Stream B Rank 1 Receiver: 0.2808 opBNB

11.555x lebih besar! ⭐⭐⭐⭐

Lebih banyak sedikit user bisa menjadi receiver di Stream B.
```

---

## 💡 Conclusion

**User Income di Rank 1 MynnGift:**

1. **Receiver Position adalah key income** (0.0243 untuk A, 0.2808 untuk B)
2. **Auto-promotion guaranteed** (promotion pool selalu sufficient)
3. **Stream B 11.555x lebih profitable** per cycle
4. **Waiting queue mechanics** memastikan fairness (FIFO)
5. **Promotion pool** self-sustaining untuk rank progression

**Best Strategy:**
- Masuk lebih awal di Rank 1 → Higher chance jadi receiver
- Stream B priority → Income 11.555x lebih besar
- Complete cycle cepat → Faster progression to higher ranks

---

**Generated: January 9, 2026**  
**Basis: MynnGift.sol distribution logic**
