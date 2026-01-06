# 🐛 BUG FOUND: Frontend Donor Slot Not Clearing After Distribution

## 🚨 MASALAH UTAMA

Frontend menggunakan **function yang SALAH** untuk mengambil data donor saat ini:

### ❌ Yang Sekarang Digunakan (WRONG):
```jsx
// MynnGiftVisualization.jsx Line 295
const { data: currentDonors, refetch: refetchCurrentDonors } = useReadContract({
  functionName: 'getRankDonorHistory',  // ← WRONG! Ini HISTORY (accumulated)
  args: [rank, streamEnum],
  enabled: true,
});
```

### ✅ Yang Seharusnya Digunakan (CORRECT):
```jsx
const { data: currentDonors, refetch: refetchCurrentDonors } = useReadContract({
  functionName: 'getRankDonors',  // ← CORRECT! Ini CURRENT donors only
  args: [rank, streamEnum],
  enabled: true,
});
```

---

## 🔍 PENJELASAN MASALAH

### Smart Contract Logic:

**`getRankDonorHistory()` (Line 627 di mynnGift.sol):**
```solidity
function getRankDonorHistory(uint8 rank, Stream stream) external view returns (string[] memory) {
    address[] memory addresses = rankDonorHistory[stream][rank];  // ← ACCUMULATED HISTORY
    // ...returns all donors yang pernah donate, tidak pernah di-clear...
}
```

**`getRankDonors()` (function yang seharusnya ada):**
```solidity
function getRankDonors(uint8 rank, Stream stream) external view returns (address[] memory) {
    Rank storage currentRank = (stream == Stream.A) ? ranks_StreamA[rank] : ranks_StreamB[rank];
    return currentRank.donors;  // ← CURRENT DONORS ONLY, reset setelah distribusi
}
```

---

## 📊 PERBEDAAN DATA

### Skenario: Rank 1 Selesai Distribusi

**rankDonorHistory[A][1]** (Accumulative):
```
[0xAAA, 0xBBB, 0xCCC, 0xDDD, 0xEEE, 0xFFF]  // Cycle 1 donors
[0xGGG, 0xHHH, 0xIII, 0xJJJ, 0xKKK, 0xLLL]  // Cycle 2 donors
[0xMMM, 0xNNN, 0xOOO, 0xPPP, 0xQQQ, 0xRRR]  // Cycle 3 donors
...
→ TOTAL: 18+ donors (NEVER CLEARED)
```

**ranks_StreamA[1].donors** (Current):
```
Sebelum distribusi:   [0xMMM, 0xNNN, 0xOOO, 0xPPP, 0xQQQ, 0xRRR] (6 donors)
Setelah distribusi:   [] (EMPTY - di-delete)  ← CORRECT
```

---

## ❌ APA YANG TERJADI SEKARANG (BUG)

```
1. Rank 1 isi dengan 6 donors baru (Cycle 3)
   Frontend display: 6 slot orange ✓ (benar)

2. rankDonorHistory sudah ada data dari Cycle 1 & 2
   Frontend display: Stale data + Cycle 3 (campur-campur)

3. Distribusi selesai → delete donors[]
   Smart Contract: donors = [] ✓
   Frontend: Masih display history data ✗ (tidak update)

4. Event RankCycleCompleted
   Frontend memanggil refetchDonors() (refetch getRankDonorHistory)
   Data masih ada (history) → SLOT MASIH ORANGE ✗

5. Donor TIDAK PINDAH KE QUEUE di UI
   Terlihat seperti: "Slot masih ada donor lama"
```

---

## 🔧 SOLUSI

### Step 1: Check Apakah Function `getRankDonors()` Ada di Smart Contract

```bash
grep -n "getRankDonors" smart_contracts/contracts/mynnGift.sol
```

### Step 2: Jika TIDAK ada, implementasi function baru:

```solidity
// Add to mynnGift.sol
function getRankDonors(uint8 rank, Stream stream) external view returns (address[] memory) {
    Rank storage currentRank = (stream == Stream.A) ? ranks_StreamA[rank] : ranks_StreamB[rank];
    return currentRank.donors;
}
```

### Step 3: Update Frontend untuk menggunakan function yang benar:

Dari:
```jsx
functionName: 'getRankDonorHistory',
```

Menjadi:
```jsx
functionName: 'getRankDonors',
```

---

## 📝 IMPLEMENTASI DETAIL

### File: mynnGift.sol

**Location:** Tambahkan setelah function `getRankDonorHistory()` (line ~637)

```solidity
function getRankDonors(uint8 rank, Stream stream) external view returns (address[] memory) {
    Rank storage currentRank = (stream == Stream.A) ? ranks_StreamA[rank] : ranks_StreamB[rank];
    return currentRank.donors;
}

function getRankDonorsB(uint8 rank, Stream stream) external view returns (address[] memory) {
    Rank storage currentRank = (stream == Stream.A) ? ranks_StreamA[rank] : ranks_StreamB[rank];
    return currentRank.donors;
}
```

### File: MynnGiftVisualization.jsx

**Location:** Line 295

```jsx
// BEFORE:
const { data: currentDonors, refetch: refetchCurrentDonors } = useReadContract({
  ...mynngiftConfig,
  functionName: 'getRankDonorHistory',
  args: [rank, streamEnum],
  enabled: true,
});

// AFTER:
const { data: currentDonors, refetch: refetchCurrentDonors } = useReadContract({
  ...mynngiftConfig,
  functionName: 'getRankDonors',  // ← CHANGE HERE
  args: [rank, streamEnum],
  enabled: true,
});
```

---

## ✅ HASIL YANG DIHARAPKAN SETELAH FIX

### Sebelum Distribusi:
```
Smart Contract:
├─ ranks_StreamA[1].donors = [0xAAA, 0xBBB, 0xCCC, 0xDDD, 0xEEE, 0xFFF]
├─ rankDonorHistory = [long history...]

Frontend (getRankDonors):
└─ Display: 6 slot ORANGE ✓
```

### Setelah Distribusi:
```
Smart Contract:
├─ ranks_StreamA[1].donors = [] (DELETED)
├─ ranks_StreamA[1].waitingQueue = [0xAAA, 0xBBB, ...]
├─ rankDonorHistory = [long history...] (unchanged)

Frontend (getRankDonors):
├─ Refetch getRankDonors() → [] (empty)
└─ Display: 6 slot BIRU ✓ (CORRECT!)
```

---

## 🎯 TESTING AFTER FIX

1. ✅ User 1-6 donate (6 slot ORANGE)
2. ✅ Rank full, distribusi triggered
3. ✅ Event `RankCycleCompleted` emitted
4. ✅ Frontend refetch `getRankDonors()`
5. ✅ Data donors: [] (empty)
6. ✅ 6 slot turn BLUE ← CORRECT!
7. ✅ Queue shows 6 ex-donors
8. ✅ User 7 donates, slot 1 turn ORANGE ← New cycle starts

---

## 📋 VERIFICATION CHECKLIST

- [ ] Check if `getRankDonors()` function exists in mynnGift.sol
- [ ] If not, add the function
- [ ] Update MynnGiftVisualization.jsx line 295
- [ ] Deploy smart contract (if added function)
- [ ] Test on testnet with full cycle
- [ ] Verify slot colors change correctly

---

## 🔗 RELATED DISCUSSIONS

This explains why:
- ✅ Smart contract logic is CORRECT (donors cleared after distribution)
- ❌ Frontend UI shows WRONG data (using history instead of current)
- ✅ System works in backend but looks broken in frontend

The gap between smart contract and frontend needs to be closed by using the correct read function.
