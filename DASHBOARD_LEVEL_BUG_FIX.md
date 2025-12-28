# Dashboard Level Bug Fix - Array Index Correction

## Problem
Dashboard menampilkan level yang salah: **17658** (atau angka sangat besar)
- User A8888NR seharusnya belum upgrade (level 1 atau 0)
- Tapi menampilkan level 17658

## Root Cause
**Array indexing salah di Dashboard.jsx!**

Struct User di smart contract memiliki urutan fields:
```solidity
struct User {
    uint totalIncome;        // index 0
    uint totalDeposit;       // index 1
    uint royaltyIncome;      // index 2
    uint referralIncome;     // index 3
    uint levelIncome;        // index 4
    uint sponsorIncome;      // index 5
    uint start;              // index 6
    uint level;              // index 7  ← LEVEL DI SINI!
    uint directTeam;         // index 8
    uint totalMatrixTeam;    // index 9
    uint8 layer;             // index 10
    address account;         // index 11
    string id;               // index 12
    string referrer;         // index 13
    string upline;           // index 14
    string[] directTeamMembers; // index 15
}
```

Tapi kode lama mengakses:
```javascript
// SALAH!
const level = userInfoRaw[6]  // ← Ini adalah field "start" bukan "level"!
const rawRoyaltyIncome = userInfoRaw[12]  // ← Ini adalah field "id" bukan "royaltyIncome"!
const rawReferralIncome = userInfoRaw[13]  // ← Ini adalah field "referrer" bukan "referralIncome"!
const rawSponsorIncome = userInfoRaw[15]  // ← Ini benar untuk directTeamMembers!
```

Jadi `userInfoRaw[6]` adalah nilai `start` (timestamp), yang kemungkinan bernilai 17658... (dalam satuan epoch time), bukan level!

## Solution
Fix semua index di Dashboard.jsx:

### userInfo useMemo (lines 715-771)
```javascript
// BENAR!
const rawRoyaltyIncome = safeConvertToBigInt(userInfoRaw[2]);      // royaltyIncome
const rawReferralIncome = safeConvertToBigInt(userInfoRaw[3]);     // referralIncome
const rawSponsorIncome = safeConvertToBigInt(userInfoRaw[5]);      // sponsorIncome
const rawLevelIncome = safeConvertToBigInt(userInfoRaw[4]);        // levelIncome
const level = userInfoRaw[7] ? Number(userInfoRaw[7]) : 0;        // LEVEL

return {
  account: userInfoRaw[11],                    // account
  id: userInfoRaw[12],                         // id
  referrer: userInfoRaw[13],                   // referrer
  upline: userInfoRaw[14],                     // upline
  layer: userInfoRaw[10],                      // layer
  start: userInfoRaw[6],                       // start
  level: userInfoRaw[7],                       // LEVEL ✓
  directTeam: userInfoRaw[8],                  // directTeam
  directTeamMembers: userInfoRaw[15],          // directTeamMembers
  totalIncome: userInfoRaw[0],                 // totalIncome
  totalDeposit: userInfoRaw[1],                // totalDeposit
  totalMatrixTeam: userInfoRaw[9],             // totalMatrixTeam
  royaltyIncome: correctedRoyaltyIncome,
  referralIncome: correctedReferralIncome,
  sponsorIncome: rawSponsorIncome,
  levelIncome: rawLevelIncome,
};
```

### uplineInfo useMemo (lines 783-809)
Fixed same index issues for upline info

### referrerInfo useMemo (lines 814-840)
Fixed same index issues for referrer info

## Changes Made
- **File**: [`mc_frontend/src/components/Dashboard.jsx`](mc_frontend/src/components/Dashboard.jsx)
- **Lines**: 715-840 (userInfo, uplineInfo, referrerInfo memoized values)
- **Changes**:
  1. Corrected array indexes untuk userInfo struct fields
  2. Corrected array indexes untuk uplineInfo struct fields
  3. Corrected array indexes untuk referrerInfo struct fields
  4. Added comments dokumentasi struct field order

## Expected Results
- Level akan menampilkan: **1** (or correct level)
- Start akan menampilkan: timestamp yang benar
- Semua income fields akan benar
- Account, ID, referrer, upline akan benar
- directTeamMembers akan benar

## Testing
Setelah fix:
1. Refresh dashboard
2. A8888NR level harus menampilkan: **1** (tidak upgrade yet)
3. Start harus menampilkan timestamp (misalnya: 1765815691)
4. Semua income harus menampilkan nilai yang sesuai

## Files Modified
- [Dashboard.jsx](mc_frontend/src/components/Dashboard.jsx) - Lines 715-840

## Why This Bug Happened
Kemungkinan:
1. Smart contract struct User fields ditambah di tengah (misalnya sponsorIncome ditambah di index 5)
2. Frontend code tidak diupdate dengan index yang benar
3. Array indexing dihitung manual tanpa reference ke struct order yang benar

## Prevention
Untuk masa depan:
- Generate ABI parser yang otomatis mengekstrak field names dari struct
- Atau gunakan Solidity tuple unpacking di ABI yang lebih explicit
- Test dengan actual contract data sebelum production
