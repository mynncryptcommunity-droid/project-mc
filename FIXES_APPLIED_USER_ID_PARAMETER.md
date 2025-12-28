# User ID Parameter Fix - Contract Integration Corrections

## Problem Summary

Dashboard showing N/A or zero values for all user data despite platform wallet being registered:
- Level: 0 (should be 1)
- Layer: N/A
- Upline: N/A  
- Direct Team: N/A
- Income data: All zeros

## Root Cause

Contract's `userInfo` function requires **STRING userId parameter** (like "A8888NR"), not wallet address.

**Smart Contract Mapping Structure:**
```solidity
mapping(address => string) public id;           // address → userId string
mapping(string => User) public userInfo;         // userId string → User struct ✅ KEY IS STRING!
mapping(string => address) public userIds;       // userId string → address
mapping(string => Income[]) public incomeInfo;   // userId string → Income array
```

Previous code was calling `userInfo(address)` which returns empty data because address is wrong key type.

## Solutions Applied

### 1. ✅ Fixed userInfo Contract Read (Line 700-715)
**Before:**
```javascript
args: address ? [address] : undefined,
enabled: !!address,
```

**After:**
```javascript
args: userId ? [userId] : undefined,
enabled: !!userId,
```

**Impact:** Now correctly fetches user data using string userId parameter.

### 2. ✅ Fixed getMatrixUsers Call (Line 1857)
**Before:**
```javascript
args: [address || '', BigInt(selectedLayer || 1)],
enabled: !!address && activeSection === 'timsaya',
```

**After:**
```javascript
args: [userId || '', BigInt(selectedLayer || 1)],
enabled: !!userId && activeSection === 'timsaya',
```

**Impact:** Matrix/Layer members now fetched with correct userId parameter.

### 3. ✅ Fixed upgrade Function (Line 1239)
**Before:**
```javascript
args: [address, BigInt(targetLevel - currentLevel)],
```

**After:**
```javascript
args: [userId, BigInt(targetLevel - currentLevel)],
```

**Impact:** Level upgrades now use correct userId parameter.

### 4. ✅ Fixed autoUpgrade Function (Line 1632)
**Before:**
```javascript
args: [address],
```

**After:**
```javascript
args: [userId],
```

**Impact:** Auto-upgrade feature now uses correct userId parameter.

### 5. ✅ Fixed getDirectTeamUsers Call (Line 1926)
**Before:**
```javascript
args: [address || ''],
enabled: !!address && activeSection === 'timsaya',
```

**After:**
```javascript
args: [userId || ''],
enabled: !!userId && activeSection === 'timsaya',
```

**Impact:** Direct team members now fetched with correct userId parameter.

## Correct Parameter Usage

### Functions Using ADDRESS (Correct):
- `id(address)` - Get userId from address ✅
- `getUserStatus(address)` - NobleGift status
- `getUserRank(address)` - NobleGift rank
- `getUserIncomePerRank(address, rank)` - NobleGift income
- `getUserIncomeBreakdown(address)` - NobleGift breakdown

### Functions Using STRING userId (Now Fixed):
- `userInfo(userId)` - User data ✅
- `getMatrixUsers(userId, layer)` - Layer members ✅
- `upgrade(userId, levels)` - Level upgrade ✅
- `autoUpgrade(userId)` - Auto upgrade ✅
- `getDirectTeamUsers(userId)` - Direct team ✅
- `incomeInfo(userId)` - Income history
- `getSelfIncome(userId)` - Self income

## Data Flow

```
Wallet Address
    ↓
id(address) → userId string ("A8888NR")
    ↓
userInfo(userId) → User struct [level, layer, upline, referrer, ...]
```

## Expected Results After Fix

Dashboard should now display:
- ✅ ID Pengguna: "A8888NR"
- ✅ Level: 1 (or actual registered level)
- ✅ Layer: Actual layer value
- ✅ Upline: Referrer address or ID
- ✅ Referrer: Registration referrer address or ID
- ✅ Direct Team: Count of direct referrals
- ✅ NobleGift Status: Rank, Status, Total Donasi, Total Pendapatan

## Testing

1. **Navigate to Dashboard** - Should show all user data populated
2. **Check Console** - Should show successful contract reads with userId parameter
3. **Test Upgrade** - Level upgrade should work with userId parameter
4. **Test Direct Team View** - Should load team members when viewing "Tims Saya" section
5. **Test Matrix View** - Should load layer members when viewing matrix section

## Files Modified

- `/Users/macbook/projects/project MC/MC/mc_frontend/src/components/Dashboard.jsx`
  - Lines 700-715: userInfo read
  - Line 1239: upgrade function
  - Line 1632: autoUpgrade function  
  - Line 1857: getMatrixUsers read
  - Line 1926: getDirectTeamUsers read

## Verification

All contract calls now use **userId (string)** for functions that require it, while functions that legitimately need **address** still receive address parameter.

Status: ✅ **READY FOR TESTING**
