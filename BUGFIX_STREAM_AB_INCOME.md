# BUG REPORT: Stream A & Stream B Platform Income Showing Same Value

## Problem
Dashboard menampilkan Platform Income Stream A dan Stream B dengan nilai yang sama (0.0486 opBNB), padahal seharusnya berbeda.

**Expected:**
- Platform Income Stream A: 0.0486 opBNB
- Platform Income Stream B: 0.5616 opBNB (11.555 × lebih besar)

**Actual:**
- Platform Income Stream A: 0.0486 opBNB  
- Platform Income Stream B: 0.0486 opBNB ❌ (SAMA)

## Root Cause
Masalahnya ada di smart contract **MynnGift.sol** - ada bug di `rankDonationValues` mapping:

### Bug Details
File: `/Users/macbook/projects/project MC/MC/smart_contracts/contracts/mynnGift.sol`

**Problem:** `rankDonationValues` adalah mapping **global yang hanya mendukung Stream A**:
```solidity
mapping(uint8 => uint256) public rankDonationValues;  // ❌ Hanya Stream A
```

Hanya didefinisikan dengan nilai Stream A:
```solidity
rankDonationValues[1] = 0.0081 ether;   // Stream A Rank 1
rankDonationValues[2] = 0.02187 ether;  // Stream A Rank 2
// ... dst untuk rank 1-8
```

**Digunakan di:**
1. **Line 237** - `_updateDonorInfo()`: 
   ```solidity
   uint256 donationValue = rankDonationValues[rank];  // ❌ Selalu Stream A!
   currentRank.totalFunds += donationValue;
   ```

2. **Line 352** - `_autoPromote()`:
   ```solidity
   uint256 donationValue = rankDonationValues[nextRank];  // ❌ Selalu Stream A!
   ```

3. **Line 809** - `getCurrentRankStatus()`:
   ```solidity
   rankDonationValues[rank] * MAX_DONORS_PER_RANK;  // ❌ Selalu Stream A!
   ```

### Dampak
- Stream B Rank 1 target funds menunjukkan 0.0486 opBNB (Stream A value)
- Seharusnya 0.0936 × 6 = 0.5616 opBNB
- Ini menyebabkan totalFunds dan platform income Stream B salah

## Solution Applied

### Step 1: Add Stream-Specific Donation Values Mapping
File: `/Users/macbook/projects/project MC/MC/smart_contracts/contracts/mynnGift.sol`

**Line 48** - Tambah mapping baru:
```solidity
mapping(Stream => mapping(uint8 => uint256)) public rankDonationValues_ByStream;
```

### Step 2: Initialize Stream B Donation Values in Constructor
**Lines 126-131** - Tambah Stream B values (11.555 × Stream A):
```solidity
// Stream B: Entry amount 0.0936 opBNB (30% of Level 8 cost: 0.312)
rankDonationValues_ByStream[Stream.B][1] = 0.0936 ether;
rankDonationValues_ByStream[Stream.B][2] = 0.252288 ether;
rankDonationValues_ByStream[Stream.B][3] = 0.680778 ether;
rankDonationValues_ByStream[Stream.B][4] = 1.838305 ether;
rankDonationValues_ByStream[Stream.B][5] = 4.968531 ether;
rankDonationValues_ByStream[Stream.B][6] = 13.414217 ether;
rankDonationValues_ByStream[Stream.B][7] = 36.260287 ether;
rankDonationValues_ByStream[Stream.B][8] = 98.102221 ether;
```

### Step 3: Update _updateDonorInfo() to Use Correct Values
**Line 237** - Pilih value berdasarkan stream:
```solidity
uint256 donationValue = (stream == Stream.A) ? rankDonationValues[rank] : rankDonationValues_ByStream[Stream.B][rank];
```

### Step 4: Update _autoPromote() to Use Correct Values  
**Line 352** - Pilih value berdasarkan stream:
```solidity
uint256 donationValue = (stream == Stream.A) ? rankDonationValues[nextRank] : rankDonationValues_ByStream[Stream.B][nextRank];
```

### Step 5: Update getCurrentRankStatus() to Use Correct Values
**Line 809** - Pilih value berdasarkan stream:
```solidity
((stream == Stream.A) ? rankDonationValues[rank] : rankDonationValues_ByStream[Stream.B][rank]) * MAX_DONORS_PER_RANK
```

## Compilation & Deployment Status
- ✅ Contract compiled successfully
- ⏳ **Pending:** Deploy ke localhost
- ⏳ **Pending:** Copy new ABI ke frontend
- ⏳ **Pending:** Restart frontend dev server
- ⏳ **Pending:** Test dengan actual Stream B donations

## Next Steps
1. Start hardhat node (kalau belum running):
   ```bash
   cd smart_contracts && npx hardhat node
   ```

2. Deploy updated contract:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. Copy new ABI:
   ```bash
   cp smart_contracts/artifacts/contracts/mynnGift.sol/MynnGift.json frontend/src/abis/MynnGift.json
   ```

4. Restart frontend:
   ```bash
   cd frontend && npm run dev
   ```

5. Verify di dashboard:
   - Stream A Income: 0.0486 opBNB
   - Stream B Income: 0.5616 opBNB (atau lebih jika ada lebih banyak distribution cycles)

## Test Verification
Setelah deploy, jalankan test untuk verify nilai:
```bash
cd smart_contracts
npx hardhat run check-income.js --network localhost
npx hardhat run check-ranks.js --network localhost
```

Expected output (setelah reset atau distribution baru):
```
Stream B Rank 1 Target: 0.5616 opBNB (bukan 0.0486)
Platform Income Stream B: Berbeda dari Stream A
```

## Files Modified
1. `/Users/macbook/projects/project MC/MC/smart_contracts/contracts/mynnGift.sol`
   - Line 48: Tambah mapping
   - Lines 126-131: Initialize Stream B values
   - Line 237: Update _updateDonorInfo()
   - Line 352: Update _autoPromote()
   - Line 809: Update getCurrentRankStatus()

## Summary
Bug adalah ketergantungan pada single global `rankDonationValues` yang hanya mengakomodasi Stream A. Dengan menambahkan `rankDonationValues_ByStream` 2D mapping, sekarang kedua stream dapat memiliki nilai donation yang berbeda dan terpisah, menghasilkan platform income yang akurat untuk masing-masing stream.
