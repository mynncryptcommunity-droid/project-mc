# 🔴 CRITICAL BUG FOUND: ClaimRoyalty Logic Error

## Problem Statement

Saat user **claim royalty**, seharusnya:
- ✅ `royaltyIncome` berkurang (dikirim ke user)
- ✅ `totalIncome` tetap atau berkurang sesuai logika bisnis
- ✅ BNB masuk ke user wallet

**Tapi yang terjadi:**
- ❌ `totalIncome` **BERTAMBAH** (malah naik!)
- ❌ `royaltyIncome` **BERTAMBAH** (malah naik!)
- ✅ BNB masuk ke user wallet (ini benar)

---

## 🐛 Root Cause

**File:** `smart_contracts/contracts/mynnCrypt.sol`  
**Function:** `claimRoyalty()` (Line 477-492)

**Code yang salah:**
```solidity
function claimRoyalty() external nonReentrant {
    string memory userId = id[msg.sender];
    require(bytes(userId).length != 0, "Register First");
    require(royaltyIncome[userId] > 0, "No royalty to claim");

    uint amount = royaltyIncome[userId];
    royaltyIncome[userId] = 0;                           // ✅ Correct: Reset mapping
    userInfo[userId].totalIncome += amount;              // ❌ WRONG: += instead of -=
    userInfo[userId].royaltyIncome += amount;            // ❌ WRONG: += instead of -=

    bool success;
    (success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Royalty claim transfer failed");
    emit RoyaltyClaimed(userId, amount);
}
```

---

## 📊 Comparison dengan Income Distribution

### Saat Royalty Distributed (Line 469):
```solidity
function _distributeShareToUser(string memory _userId, uint _share) private {
    User storage user = userInfo[_userId];
    uint maxIncome = (user.totalDeposit * royaltyMaxPercent) / 100;
    uint available = maxIncome - user.royaltyIncome;
    uint actualShare = _share > available ? available : _share;
    royaltyIncome[_userId] += actualShare;             // ✅ ADD to mapping
    userInfo[_userId].royaltyIncome += actualShare;    // ✅ ADD to struct
    emit RoyaltyReward(_userId, actualShare);
    if (_share > actualShare) royaltyPool += (_share - actualShare);
}
```

### Saat Royalty Claimed (Line 485-486):
```solidity
userInfo[userId].totalIncome += amount;       // ❌ SHOULD BE -= (decrease, not increase)
userInfo[userId].royaltyIncome += amount;     // ❌ SHOULD BE -= or = 0
```

---

## 💡 Logic Analysis

### Income Categories:
- `totalIncome` = sum of all income (referral + upline + sponsor + royalty)
- `royaltyIncome` = portion of income dari royalty distribution
- Other incomes (referralIncome, levelIncome, etc.) = other portions

### When Royalty is Distributed:
```
royaltyIncome[userA] = 0
→ User A gets 0.1 BNB royalty distribution
→ royaltyIncome[userA] += 0.1  (now = 0.1)
→ userInfo[userA].royaltyIncome += 0.1  (now = 0.1)
→ userInfo[userA].totalIncome += 0.1   (track all income)
```

### When Royalty is Claimed:
```
royaltyIncome[userA] = 0.1
→ User A claim royalty
→ amount = 0.1
→ Send 0.1 BNB to user
→ royaltyIncome[userA] = 0  (withdraw complete)
→ userInfo[userA].royaltyIncome -= 0.1  (remove from available pool)
→ userInfo[userA].totalIncome -= 0.1    (remove from total - it was already counted)
```

---

## ✅ The Fix

**Change lines 485-486 from:**
```solidity
userInfo[userId].totalIncome += amount;      // Wrong: increase
userInfo[userId].royaltyIncome += amount;    // Wrong: increase
```

**To:**
```solidity
// Option A: Decrease (subtract from totals since already counted)
userInfo[userId].totalIncome -= amount;
userInfo[userId].royaltyIncome -= amount;

// Option B: Set to 0 (simpler, since mapping already reset)
// (Just keep line 484 which sets royaltyIncome[userId] = 0)
// For struct, either -= or leave as-is depending on income tracking logic
```

**Recommended fix (simpler & clearer):**
```solidity
function claimRoyalty() external nonReentrant {
    string memory userId = id[msg.sender];
    require(bytes(userId).length != 0, "Register First");
    require(royaltyIncome[userId] > 0, "No royalty to claim");

    uint amount = royaltyIncome[userId];
    
    // Clear the mappings and struct
    royaltyIncome[userId] = 0;
    userInfo[userId].royaltyIncome = 0;    // ✅ Set to 0 instead of +=
    // Don't modify totalIncome - already counted in distribution
    
    // Transfer BNB to user
    bool success;
    (success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Royalty claim transfer failed");
    
    emit RoyaltyClaimed(userId, amount);
}
```

---

## 🎯 Expected Behavior After Fix

### Before Claim:
```
- totalIncome = 1.0 BNB
- royaltyIncome = 0.1 BNB (portion of totalIncome)
- royaltyIncome[mapping] = 0.1 BNB
```

### After Claim (with fix):
```
- totalIncome = 1.0 BNB (unchanged, royalty was already included)
- royaltyIncome = 0 BNB (cleared)
- royaltyIncome[mapping] = 0 BNB (cleared)
- User wallet += 0.1 BNB (received)
```

---

## 📝 Implementation Steps

1. **Fix the smart contract** (lines 485-486)
2. **Recompile** the contract
3. **Redeploy** to blockchain (new deployment needed)
4. **Update frontend** ABI with new contract address
5. **Test** claim royalty again - income should decrease properly

---

## Impact Assessment

**Severity:** 🔴 CRITICAL
- User income accounting is wrong
- Dashboard shows incorrect totalIncome
- Income history may be confusing

**Affected:** Any user who claims royalty will see income metrics increase instead of decrease

**Fix Effort:** ⚠️ REQUIRES NEW DEPLOYMENT
- Smart contract must be redeployed
- Frontend ABI must be updated
- Cannot patch live contract
