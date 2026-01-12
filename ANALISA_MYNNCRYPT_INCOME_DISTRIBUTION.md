# Analisa MynnCrypt: Distribusi Pendapatan User Stream A & B 💰

## Overview
MynnCrypt adalah kontrak untuk **upgrade level** (Level 1-12) yang juga menyediakan income distribution untuk user.
Setiap upgrade level memiliki distribusi income dengan **pemotongan spesial di Level 4 dan Level 8** untuk MynnGift.

---

## 📊 Income Sources di MynnCrypt

User dapat menerima income dari berbagai sumber:

```
1. Referral Income (91% ke referrer, jika ada referrer)
2. Upline Income (uplinePercents[level]%)
3. Sponsor Income (10%)
4. Royalty Income (3%, tapi didistribusikan ke pool)
5. MynnGift Income (dari MynnGift kontrak)
```

### View Function untuk Melihat Income User:

```solidity
function getUserIncomeBreakdown(string memory _userId) 
returns (
    uint referralIncome,      // Dari referral new user
    uint levelIncome,         // Dari upline distribution
    uint sponsorIncome,       // Dari sponsor distribution
    uint mynnGiftDonation,    // Dari MynnGift kontrak
    uint royaltyIncome        // Dari royalty distribution
)
```

---

## 🎯 Distribusi per Level Upgrade (MynnCrypt)

### **Upline Percents per Level**
```
Level: [0, 80, 80, 50, 80, 80, 80, 50, 80, 80, 80, 80]

Level 1: 0%   (entry level)
Level 2: 80%  (high upline)
Level 3: 80%
Level 4: 50%  (+ 30% to MynnGift Stream A)
Level 5: 80%
Level 6: 80%
Level 7: 80%
Level 8: 50%  (+ 30% to MynnGift Stream B)
Level 9: 80%
Level 10: 80%
Level 11: 80%
Level 12: 80%
```

---

## 📈 Simulasi Income User dengan Upgrade Level 1 → 8

### **Skenario 1: User dengan Referral Network**

Asumsi:
- User dengan upline yang qualified (level ≥ target level + 1, direct team ≥ 2)
- Menerima upline income sepenuhnya

#### Level 2 Upgrade: 0.000007200 opBNB
```
Upline (80%):     0.00000576 → Diterima Upline ✓
Sponsor (10%):    0.00000072 → Diterima Sponsor ✓
Royalty (3%):     0.00000022 → Royalty Pool
MynnGift (0%):    0
Sharefee (7%):    0.00000504 → Platform
─────────────────────────────────────
User terima dari upline line: 0 (user adalah pembayar)
User dapat dari referral new: Jika ada yang register pakai ref
```

#### Level 4 Upgrade: 0.000027 opBNB ⭐ Stream A Entry
```
Upline (50%):     0.0000135 → Diterima Upline ✓
Sponsor (10%):    0.0000027 → Diterima Sponsor ✓
Royalty (3%):     0.00000081 → Royalty Pool
MynnGift (30%):   0.0000081 → MynnGift Stream A Rank 1 ⭐
Sharefee (7%):    0.00000189 → Platform
─────────────────────────────────────
User terima dari upline: 0 (user pembayar)
User dapat dari MynnGift:
  - Langsung: 0.0000081 (entry ke Rank 1)
  - Income dari MynnGift: Mulai menerima reward jika ada receiver
```

#### Level 8 Upgrade: 0.000312 opBNB ⭐⭐ Stream B Entry
```
Upline (50%):     0.000156 → Diterima Upline ✓
Sponsor (10%):    0.0000312 → Diterima Sponsor ✓
Royalty (3%):     0.00000936 → Royalty Pool
MynnGift (30%):   0.0000936 → MynnGift Stream B Rank 1 ⭐⭐
Sharefee (7%):    0.00021840 → Platform
─────────────────────────────────────
User terima dari upline: 0 (user pembayar)
User dapat dari MynnGift:
  - Langsung: 0.0000936 (entry ke Stream B Rank 1)
  - Income dari MynnGift: Mulai menerima reward jika ada receiver
```

---

## 💡 Income User dari MynnGift (Stream A & B)

### **User Income dari MynnGift**

Di MynnGift, user dapat income dari berbagai cara:

#### **1. As Receiver (Penerima di Rank)**

Ketika user menjadi receiver di suatu rank, user mendapat **50%** dari donation amount.

**Stream A Example (Rank 1):**
- 6 donors masuk ke Rank 1 dengan masing-masing 0.0081 opBNB
- Total: 6 × 0.0081 = 0.0486 opBNB
- Receiver mendapat: 0.0486 × 50% = **0.0243 opBNB** ⭐

**Stream B Example (Rank 1):**
- 6 donors masuk ke Rank 1 dengan masing-masing 0.0936 opBNB
- Total: 6 × 0.0936 = 0.5616 opBNB
- Receiver mendapat: 0.5616 × 50% = **0.2808 opBNB** ⭐⭐

#### **2. As Promotion Pool Recipient**

User yang sudah complete rank dapat claim dari promotion pool.
- 45% dari setiap donation masuk pool
- Distribution tergantung mechanics (bisa ada bagi rata atau weighted)

#### **3. As Upline/Network**

Jika user adalah upline dari receiver, bisa mendapat passive income dari network mereka.

---

## 🎯 Total Income User: Simulasi Lengkap

### **User Profile:**
- Non-referral (no upline/sponsor)
- Upgrade Level 1 → 8
- Masuk MynnGift Stream A di Level 4
- Masuk MynnGift Stream B di Level 8

### **Income Breakdown:**

#### **From MynnCrypt Upgrade:**
```
Level 2: 0 (pembayar, tidak ada upline)
Level 3: 0 (pembayar, tidak ada upline)
Level 4: 0 (pembayar) + 0.0000081 → MynnGift ⭐
Level 5: 0 (pembayar, tidak ada upline qualified)
Level 6: 0 (pembayar, tidak ada upline qualified)
Level 7: 0 (pembayar, tidak ada upline qualified)
Level 8: 0 (pembayar) + 0.0000936 → MynnGift ⭐⭐
────────────────
Total dari MynnCrypt: 0 opBNB (semua ke platform karena non-referral)
MynnGift Entry: 0.0000081 + 0.0000936 = 0.0001017 opBNB ⭐
```

#### **From MynnGift (Potential Income):**

Jika user menjadi receiver di ranks:

**Stream A:**
```
Rank 1 Receiver: 0.0486 × 50% = 0.0243 opBNB
Rank 2 Receiver: 0.059049 × 50% = 0.02952 opBNB
... (sampai Rank 8)
Total jika receiver semua rank: SANGAT BESAR
```

**Stream B:**
```
Rank 1 Receiver: 0.5616 × 50% = 0.2808 opBNB ⭐⭐
Rank 2 Receiver: 0.680778 × 50% = 0.340389 opBNB
... (sampai Rank 8)
Total jika receiver semua rank: JAUH LEBIH BESAR dari Stream A
```

---

## 📊 Income Comparison: Stream A vs Stream B

### **Entry Cost & Potential**

| Aspek | Stream A | Stream B | Multiplier |
|-------|----------|---------|-----------|
| Entry Amount | 0.0081 opBNB | 0.0936 opBNB | 11.555x |
| Rank 1 Receiver | 0.0243 opBNB | 0.2808 opBNB | 11.555x |
| Rank 8 Total | 8.472886094 | 98.102221 | 11.555x |

**Insight:**
- **Stream B mendominasi** dalam hal earning potential
- User di Stream B bisa earn **11.555x lebih besar** dibanding Stream A untuk posisi yang sama
- Tapi Stream B butuh Level 8 untuk entry (lebih expensive upgrade)

---

## 🎯 User Income Path: Optimal Strategy

### **Path 1: Focus on One Stream (Recommended)**

**Stream B Focus:**
```
Upgrade L1→L8 (Total Cost: 0.000798 opBNB)
├─ Enter MynnGift Stream B
├─ Complete Rank 1-8 Stream B
├─ Potential Income: Multiple 50% receiver payouts
├─ Potential from Ranks: Very High (11.555x Stream A)
└─ Best for: Maximum earning potential
```

**Estimated Earnings (if receiver 2-3 ranks):**
```
Rank 1: 0.2808 opBNB
Rank 2: 0.340389 opBNB
─────────────────────
Total: ~0.6 opBNB ✅ (759% ROI on upgrade cost)
```

### **Path 2: Both Streams**

```
Level 4 → Stream A Entry
Level 8 → Stream B Entry

Income dari kedua stream:
├─ Stream A: Rank 1-8
├─ Stream B: Rank 1-8
└─ Kombinasi income sangat besar
```

---

## 📈 View Functions untuk Check User Income

```solidity
// Di MynnCrypt
function getUserIncomeBreakdown(string _userId) 
  returns (referralIncome, levelIncome, sponsorIncome, mynnGiftDonation, royaltyIncome)

function getRoyaltyIncome(string _userId) returns uint

function getIncome(string _userId) returns Income[]

// Di MynnGift
function getPlatformIncome_StreamA() returns uint256

function getPlatformIncome_StreamB() returns uint256

function getUserTotalIncome_StreamA(address user) returns uint256

function getUserTotalIncome_StreamB(address user) returns uint256
```

---

## 💼 Summary: Income Distribution

### **User Mendapat Income Dari:**

1. **Referral Income** 
   - Dapat 91% ketika ada yang register dengan referrer user
   - Non-referral → 0

2. **Upline Income**
   - Dapat jika ada downline upgrade level lebih tinggi
   - Presentase tergantung uplinePercents[level]
   - Non-referral → 0

3. **Sponsor Income**
   - Dapat 10% dari sponsor rewards
   - Dari struktur sponsor network
   - Non-referral → 0

4. **MynnGift Income** ⭐⭐⭐
   - Entry bonus: Langsung dapat 30% dari level upgrade
   - Receiver payout: 50% dari rank donations
   - Promotion pool share: 45% dari donations (distributed)
   - Gas subsidy: 0.5% dari donations
   - **Ini adalah income terbesar untuk non-referral user!**

5. **Royalty Income**
   - Dapat dari royalty pool distribution
   - Jika reach level 8, 9, 10, 11, atau 12
   - Percentage: 28%, 25%, 20%, 15%, 12% (berdasarkan level)

---

## 🎯 Kesimpulan

**MynnCrypt Income Distribution untuk User:**

```
┌─────────────────────────────────────────────────┐
│ Non-Referral User: Fokus ke MynnGift Income     │
├─────────────────────────────────────────────────┤
│ Level 1-8 Upgrade Cost: 0.000798 opBNB         │
│ MynnGift Entry (L4+L8): 0.0001017 opBNB        │
│                                                  │
│ Potential Income (if 2 ranks receiver):         │
│ Stream B: ~0.6 opBNB = 750% ROI ✅            │
│                                                  │
│ Referral Network Users: Dapat upline income     │
│ tapi harus kuatkan downline mereka              │
└─────────────────────────────────────────────────┘
```

**Stream A vs Stream B:**
- **Stream A**: Sudah profitable di Level 4, tapi income kecil
- **Stream B**: Profitable di Level 8, income **11.555x besar**, more competitive
- **Recommended**: Fokus Stream B untuk ROI lebih optimal

---

**Generated: January 9, 2026**  
**Basis: MynnCrypt.sol + MynnGift.sol contract analysis**
