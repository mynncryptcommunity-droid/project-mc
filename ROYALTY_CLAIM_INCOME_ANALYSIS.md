# 🔍 Analisis: Royalty Claim & Income Display Issue

## 📊 Masalah yang Dilaporkan

1. **Total Income berkurang** setelah claim royalty
   - Before: 0.0081 opBNB
   - After: 0.0080 opBNB
   - Claimed amount: 0.000088 opBNB
   - Total berkurang lebih dari yang di-claim!

2. **Income History tidak menampilkan** transaksi claim royalty

---

## 🔎 ROOT CAUSE ANALYSIS

### Masalah #1: Total Income Berkurang (Double-Counting Issue)

#### Data Flow:

**Smart Contract - mynnCrypt.sol (Lines 477-495):**
```solidity
function claimRoyalty() external nonReentrant {
    string memory userId = id[msg.sender];
    require(bytes(userId).length != 0, "Register First");
    require(royaltyIncome[userId] > 0, "No royalty to claim");

    uint amount = royaltyIncome[userId];
    royaltyIncome[userId] = 0;  // ✅ Clear royalty mapping
    
    // ✅ BUG: Tidak update userInfo[userId].totalIncome!
    // ✅ BUG: Tidak kurangi userInfo[userId].totalIncome!
    // Amount sudah included di totalIncome saat distribution
    
    userInfo[userId].royaltyIncome = 0;  // ✅ Clear struct field
    // ❌ MASALAH: totalIncome di struct TIDAK DIUBAH

    bool success;
    (success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Royalty claim transfer failed");
    
    // ✅ Add to income history
    incomeInfo[userId].push(Income(userId, 4, amount, block.timestamp));
    
    emit RoyaltyClaimed(userId, amount);
}
```

#### Masalahnya:

**userInfo struct menyimpan:**
- `totalIncome` - Accumulative total (sudah termasuk semua royalty yang pernah didapat)
- `royaltyIncome` - Current pending royalty (saat ini)

**Saat claim royalty:**
1. ✅ Clear `royaltyIncome[userId]` (mapping - ini benar)
2. ✅ Clear `userInfo[userId].royaltyIncome` (struct - ini benar)
3. ❌ **TAPI: Tidak clear atau kurangi `userInfo[userId].totalIncome`** (MASALAH!)

**Hasilnya:**
- Frontend baca `userInfo[userId].totalIncome` yang MASIH TERMASUK royalty yang sudah di-claim
- **Royalty terlihat seperti hilang dari totalIncome** ketika kenyataannya hanya "di-move" ke wallet

---

### Masalah #2: Income History Tidak Menampilkan Claim Royalty

#### Data Flow:

**Smart Contract - Setelah Claim:**
```solidity
// Line 493-494: Menambah ke incomeInfo
incomeInfo[userId].push(Income(userId, 4, amount, block.timestamp));
// Type 4 = Royalty claim
```

**Frontend - Dashboard.jsx:**
```jsx
// Line 1096-1099: Fetch income history
const { data: incomeHistoryRaw } = useReadContract({
  ...mynncryptConfig,
  functionName: 'getIncome',
  args: userId !== undefined && userId !== null ? [userId] : undefined,
  enabled: !!userId,
});
```

**Masalahnya di Frontend Processing (Lines 1129-1160):**
```jsx
if (incomeHistoryRaw && Array.isArray(incomeHistoryRaw)) {
    const processedHistory = incomeHistoryRaw.map(income => {
        // ...processing...
        // ✅ Line 1149: Recognize type 4 as Royalty
        if (lyr === 4) return IncomeType.ROYALTY;
        // ...
    });
    
    // ✅ Sudah ada logic untuk type 4
    // Tapi mungkin ada issue di display logic
}
```

#### Kemungkinan Penyebab:

1. **Income tidak di-push ke incomeInfo?** → Check SC behavior
2. **Frontend tidak merefresh dengan baik?** → Check refetch logic
3. **Display filter/condition salah?** → Check income history rendering

---

## 📈 Detailed Analysis: How totalIncome is Calculated

### Smart Contract Structure:

```solidity
struct User {
    uint totalIncome;        // ← Accumulative (semua yang pernah dapat)
    uint totalDeposit;
    uint royaltyIncome;      // ← Current pending (belum claim)
    uint referralIncome;
    uint levelIncome;
    uint sponsorIncome;
}

mapping(string => uint) public royaltyIncome;  // ← Current pending (mapping version)
mapping(string => Income[]) public incomeInfo; // ← History (semua transaksi)
```

### Saat Distribution (Ranking):
```solidity
// Line 266-272 (mynnGift.sol)
if (stream == Stream.A) {
    userTotalIncome_StreamA[receiver] += receiverShare;
    userIncomePerRank_StreamA[receiver][rank] += receiverShare;
} else if (stream == Stream.B) {
    userTotalIncome_StreamB[receiver] += receiverShare;
    userIncomePerRank_StreamB[receiver][rank] += receiverShare;
}
```

### Saat Royalty Distribution:
```solidity
// mynnCrypt.sol: Royalty distribution (in auto-distribution function)
userInfo[userId].totalIncome += royaltyAmount;
userInfo[userId].royaltyIncome += royaltyAmount;
royaltyIncome[userId] += royaltyAmount;
```

### Saat Claim Royalty:
```solidity
// Line 486-487
uint amount = royaltyIncome[userId];
royaltyIncome[userId] = 0;           // ✅ Clear pending
userInfo[userId].royaltyIncome = 0;  // ✅ Clear pending in struct
// ❌ BUKAN: userInfo[userId].totalIncome -= amount;
// ✅ Harusnya TIDAK dikurangi (karena totalIncome = historical record)
```

---

## ✅ DIAGNOSIS: Ini BUKAN Bug, Ini DESIGN!

### Konsep yang Benar:

**totalIncome = Historical record (total semua yang pernah dapat)**
**royaltyIncome = Pending (yang belum di-claim)**

Saat claim royalty:
1. Uang dikirim ke wallet user ✅
2. Pending royalty di-clear ✅
3. Historical totalIncome tetap (karena record) ✅

---

## 🎯 Penyebab Kebingungan User

### Skenario:
1. User dapat royalty: totalIncome 0.0081, royaltyIncome 0.000088
2. User claim royalty (0.000088)
3. totalIncome → 0.0080? ❌ Ini aneh!

### Penjelasan:

**Kemungkinan 1: Income sedang di-distribute**
- Saat user claim, ada donation/distribution masuk
- Tapi allocation ke user berkurang
- Contoh: Distributor berubah, share berbeda

**Kemungkinan 2: Ada bug dalam royalty distribution**
- Royalty di-distribute ke user tapi tidak sebanding
- Atau ada fee/deduction yang tidak visible

**Kemungkinan 3: Frontend display bug**
- `totalIncome` display dari mana?
- Apakah dari `userInfo.totalIncome` atau calculated?

---

## 🔧 Yang Harus Kita Cek

### 1. Verify Smart Contract Royalty Distribution Logic
```solidity
// Cari function yang distribute royalty
// Check: Berapa amount yang masuk ke userInfo.totalIncome?
// Check: Apakah sudah akurat dengan royaltyIncome?
```

### 2. Verify Frontend Display Logic
```jsx
// Cek di Dashboard.jsx:
// - totalIncome display dari mana?
// - Apakah ada calculation yang salah?
// - Apakah getRoyaltyIncome juga di-display?
```

### 3. Check Income History Processing
```jsx
// Cek apakah incomeHistoryRaw properly fetch
// Cek apakah type 4 entries muncul
// Cek refetch timing
```

---

## ✅ ROOT CAUSE FOUND!

### Smart Contract - mynnCrypt.sol Line 589-607

```solidity
function getUserIncomeBreakdown(string memory _userId) external view returns (
    uint,  // [0] referralIncome
    uint,  // [1] levelIncome  
    uint,  // [2] sponsorIncome
    uint,  // [3] totalDonation (from MynnGift)
    uint   // [4] royaltyIncome ← DARI MAPPING (current pending)
) {
    User memory user = userInfo[_userId];
    require(user.account != address(0), "Invalid user ID");

    return (
        user.referralIncome,         // Tidak berubah
        user.levelIncome,            // Tidak berubah
        user.sponsorIncome,          // Tidak berubah
        IMynnGift(mynnGiftWallet).getUserTotalDonation(user.account),
        royaltyIncome[_userId]       // ← MAPPING (cleared setelah claim)
    );
}
```

### Frontend - Dashboard.jsx Line 1873-1880

```jsx
const calculateTotalIncome = useMemo(() => {
    const referral = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[0])) : 0;
    const upline = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[1])) : 0;
    const sponsor = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[2])) : 0;
    const royalty = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[4])) : 0;
    
    // ❌ TOTAL = referral + upline + sponsor + royalty
    // ❌ Jika royalty di-claim → royaltyIncome[userId] = 0
    // ❌ Maka royalty di calculateTotalIncome → 0
    // ❌ Total berkurang!
    return (referral + sponsor + upline + royalty).toFixed(4);
}, [incomeBreakdown]);
```

---

## 🔴 MASALAH UTAMA

### calculateTotalIncome = Pending Income (BUKAN Historical Total!)

**Frontend error:**
```
calculateTotalIncome = referral + sponsor + upline + PENDING_royalty
```

**Harusnya:**
```
calculateTotalIncome = referral + sponsor + upline + (TOTAL_royalty - CLAIMED_royalty)
```

Atau lebih sederhana:
```
calculateTotalIncome = referral + sponsor + upline + CLAIMED_royalty + PENDING_royalty
```

---

## 🎯 Masalah #2: Income History Tidak Muncul

**Smart Contract - claimRoyalty() Line 493-494:**
```solidity
incomeInfo[userId].push(Income(userId, 4, amount, block.timestamp));
// Type 4 = Royalty claim
```

✅ Sudah di-push ke incomeInfo

**Frontend - Dashboard.jsx Line 1149:**
```jsx
if (lyr === 4) return IncomeType.ROYALTY;
```

✅ Sudah handle type 4

**Kemungkinan Masalah:**
1. Refetch `refetchIncomeHistory` tidak trigger setelah claim
2. Atau ada timing issue
3. Atau display filter exclude type 4

---

## 🔧 SOLUSI

### Solusi #1: Fix calculateTotalIncome Logic

**Change from:**
```jsx
// Current pending calculation
const royalty = incomeBreakdown[4];
return (referral + sponsor + upline + royalty).toFixed(4);
```

**Change to:**
```jsx
// Track from incomeHistory (includes claimed + pending)
const claimedRoyalty = useMemo(() => {
  return incomeHistory
    .filter(income => income.type === 4) // Type 4 = Royalty
    .reduce((sum, income) => sum + parseFloat(ethers.formatEther(income.amount)), 0);
}, [incomeHistory]);

const pendingRoyalty = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[4])) : 0;

return (referral + sponsor + upline + claimedRoyalty + pendingRoyalty).toFixed(4);
```

### Solusi #2: Fix Income History Refetch

**Ensure after claim:**
```jsx
// In claimRoyalty useEffect
if (isConfirmedClaimRoyalty) {
  // Refetch BOTH:
  refetchIncomeHistory();  // ← History dari incomeInfo
  refetchUserIncomeBreakdown(); // ← Breakdown dari getUserIncomeBreakdown
}
```

---

## 📝 Implementation Plan

### Step 1: Fix calculateTotalIncome
- Add claimedRoyalty calculation from incomeHistory
- Update formula to include both claimed + pending

### Step 2: Verify Refetch Logic
- Ensure refetchIncomeHistory happens after claim
- Add timeout if needed for block confirmation

### Step 3: Test
- Claim royalty
- Verify totalIncome does NOT decrease
- Verify incomeHistory shows claim entry

---

## 🎓 Key Insights

1. **Problem: calculateTotalIncome includes PENDING royalty** → Becomes 0 after claim
2. **Solution: Include CLAIMED royalty from history** → Stays same after claim
3. **Income History: Already records Type 4** → Just need proper refetch timing

