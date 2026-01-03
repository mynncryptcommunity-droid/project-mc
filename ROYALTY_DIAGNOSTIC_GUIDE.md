# Diagnostic Guide - Royalty Income Tidak Ada (User A8889NR)

## 🔍 Analisis Sistem Royalty

### Alur Royalty Distribution:

```
┌─ Aktivitas Platform (Upgrade, Register, dll)
│
├─→ _distributeRoyalty() dipanggil
│    ├─ _countEligibleRoyaltyUsers() - Hitung user level 8-12
│    └─ _distributeRoyaltyShares() - Bagikan ke setiap level
│
└─→ _distributeToLevel() untuk setiap level
    ├─ getRoyaltyUsers(level) - Get semua user di level tsb
    └─→ _distributeShareToUser() untuk setiap user
        ├─ Cek: maxIncome = totalDeposit × 200%
        ├─ Cek: available = maxIncome - currentRoyaltyIncome
        └─ Add: royaltyIncome[userId] += share
```

---

## ⚠️ Potential Issues untuk User A8889NR

### Issue #1: User Tidak Terdaftar di royaltyUsers Array
**Lokasi:** mynnCrypt.sol Line 493-502 (`_updateRoyaltyUsers`)

```solidity
function _updateRoyaltyUsers(string memory _id, uint _newLevel) private {
    // Step 1: Remove dari level lama
    for (uint i = 0; i < royaltyLvl.length; i++) {
        if (userInfo[_id].level == royaltyLvl[i]) {  // Check old level
            _removeFromRoyaltyUsers(_id, i);
        }
    }
    // Step 2: Add ke level baru
    for (uint i = 0; i < royaltyLvl.length; i++) {
        if (_newLevel == royaltyLvl[i]) {  // Check new level
            royaltyUsers[i].push(_id);  // ← User ditambah di sini
        }
    }
}
```

**royaltyLvl = [8, 9, 10, 11, 12]**
```
Index 0 = Level 8
Index 1 = Level 9
Index 2 = Level 10
Index 3 = Level 11
Index 4 = Level 12
```

**User A8889NR (Level 8):**
- Harus di: `royaltyUsers[0]` (index 0 untuk level 8)
- Jika tidak ada di sana, tidak akan terima distribusi!

### Issue #2: _updateRoyaltyUsers Hanya Dipanggil Saat Upgrade
**Lokasi:** mynnCrypt.sol Line 295

```solidity
function upgradeMultipleLevel(uint _lvls) external payable nonReentrant {
    // ... 
    for (uint i = 0; i < _lvls; i++) {
        user.level += 1;
        _updateRoyaltyUsers(_id, user.level);  // ← Hanya saat upgrade!
    }
}
```

**Skenario Problem:**
1. User register dengan level 1 → tidak dipanggil (hanya upgrade yang panggil ini)
2. User upgrade ke level 8 → `_updateRoyaltyUsers(_id, 8)` dipanggil ✅
3. User seharusnya ada di `royaltyUsers[0]`

**Tapi jika:**
- User tidak pernah upgrade ke 8 (langsung masuk level 8?) → tidak di-add!
- Atau ada bug di upgrade logic → user tidak ter-list!

### Issue #3: Distribusi Belum Terjadi Sejak User Level 8
```
Timeline:
Day 1: User A8889NR upgrade ke level 8
       → _updateRoyaltyUsers() add ke royaltyUsers[0]
       
Day 2-N: Belum ada aktivitas platform yang trigger distribusi
       → royaltyIncome tetap 0
```

---

## 🧪 Debugging Checklist

### Untuk Owner/Admin:

**Check 1: Apakah user terdaftar di royaltyUsers?**
```javascript
// Contract call:
getRoyaltyUsers(0)  // Level 8 users (index 0)

// Check if A8889NR ada di list
Expected: Array containing "A8889NR"
Actual: ? (perlu di-check)
```

**Check 2: User info di blockchain**
```javascript
// Contract call:
getUserInfo("A8889NR")

// Expected:
level: 8
royaltyIncome: 0
totalDeposit: 0.3814

// Check jika ada issue
```

**Check 3: Royalty pool balance**
```javascript
// Contract call:
royaltyPool

// Jika ada nilai > 0:
// Ada royalty yang tidak ter-distribute (mungkin 0 eligible users)
```

---

## 🔧 Kemungkinan Solusi

### Solusi #1: User Belum Ada di royaltyUsers (Paling Mungkin)
**Masalah:** User tidak ter-register di list saat upgrade

**Fix Options:**
1. **Re-upgrade:** User upgrade level (dari 8 ke 9, atau 7 ke 8)
   - Ini akan trigger `_updateRoyaltyUsers()`
   - User akan ter-add ke list
   - Distribusi berikutnya akan masuk

2. **Admin Force Add:** (Jika ada admin function)
   - Manually call `_updateRoyaltyUsers()` untuk user
   - Atau add ke `royaltyUsers[0]` langsung

3. **Check Contract:** 
   - Lihat jika ada issue di upgrade logic
   - Cek jika `_updateRoyaltyUsers` ter-skip

### Solusi #2: Distribusi Belum Terjadi
**Masalah:** Tidak ada aktivitas yang trigger `_distributeRoyalty()`

**Fix:**
- Tunggu ada user lain yang upgrade/register
- Atau admin trigger distribusi jika ada admin function

### Solusi #3: Frontend Data Not Synced
**Masalah:** Frontend menampilkan 0 tapi blockchain punya nilai

**Fix:**
- Hard refresh page
- Clear cache
- Disconnect/reconnect wallet
- Atau check blockchain directly via Etherscan

---

## 📊 Detailed Calculation untuk User A8889NR

**Data User:**
```
totalDeposit: 0.3814 opBNB = 381400000000000000 wei
level: 8
royaltyIncome (current): 0
royaltyIncome (max allowed): totalDeposit × 200 / 100 = 0.7628 opBNB
```

**Jika distribusi masuk 0.1 opBNB:**
```
share = 0.1 / totalEligibleUsers
// Misal ada 5 user level 8-12, share = 0.02 opBNB per user

Untuk A8889NR:
maxIncome = 0.7628
available = 0.7628 - 0 = 0.7628
actualShare = min(0.02, 0.7628) = 0.02
royaltyIncome += 0.02
// Result: 0.02 opBNB
```

---

## ✅ Recommended Actions

### Untuk User:
1. ✅ Pastikan sudah level 8 → **Already Yes**
2. ✅ Pastikan sudah upgrade ke level 8 (bukan langsung level 8) → **Check**
3. ⏳ Tunggu ada aktivitas platform (orang lain upgrade)
4. 🔄 Atau minta admin untuk trigger distribusi
5. 🔄 Atau user re-upgrade (7→8 atau 8→9) untuk force update list

### Untuk Dev/Admin:
```javascript
// Step 1: Check apakah user ada di list
const royalty8Users = await contract.getRoyaltyUsers(0);
const userExists = royalty8Users.includes("A8889NR");
console.log("User in royalty list:", userExists);

// Step 2: Jika tidak ada, manually add
if (!userExists) {
  // Option A: User re-upgrade (recommended)
  // Option B: Admin manually call _updateRoyaltyUsers (if exposed)
}

// Step 3: Trigger distribution jika ada aktivitas
// Atau tunggu next upgrade/registration event
```

---

## 🎯 Most Likely Root Cause

**Based on analysis:**

1. ✅ User A8889NR level 8 - sesuai syarat
2. ✅ User belum mencapai royalty cap (0 < 0.7628)
3. ❌ User belum terima distribusi royalty (royaltyIncome = 0)
4. 🔴 **Kemungkinan:** User tidak ter-register di `royaltyUsers[0]` list

**Why?**
- Jika user tidak di-list, `_countEligibleRoyaltyUsers()` tidak menghitung dia
- Distribusi bypass karena `totalEligible = 0` atau user tidak termasuk
- Result: `royaltyIncome` tetap 0

---

## 📝 Summary

**Syarat Claim Royalty untuk User A8889NR:**
1. ✅ Level 8 atau 12 → **PASS** (Level 8)
2. ❌ royaltyIncome > 0 → **FAIL** (0.0000 opBNB)
3. ✅ royaltyIncome < maxCap → **PASS** (0 < 0.7628)

**Why royaltyIncome = 0?**
- Kemungkinan A: User tidak ter-register di royaltyUsers list
- Kemungkinan B: Belum ada distribusi sejak user level 8
- Kemungkinan C: Data sync issue di frontend

**Next Step:**
- Verify apakah user ada di `getRoyaltyUsers(0)` (level 8 list)
- Jika tidak ada, user perlu re-upgrade atau admin add ke list
- Jika ada, tunggu distribusi dari aktivitas platform

**Timeline Royalty:**
- Registrasi → tidak auto masuk royalty list
- Upgrade ke level 8 → auto masuk ke list
- Distribusi → tunggu ada aktivitas lain
- Claim → ketika royaltyIncome > 0

---

**Status User A8889NR:** Menunggu distribusi royalty atau perlu di-register di royalty users list.
