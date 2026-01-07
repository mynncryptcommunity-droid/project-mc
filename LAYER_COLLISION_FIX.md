# Layer 4 Collision Issue - Analysis & Fix

## Problem
**Layer 4 digunakan untuk TWO DIFFERENT purposes:**

### Current Smart Contract Assignment:
- Layer 0 = Referral Income
- Layer 1 = Sponsor Income  
- **Layer 2-9 = MynnGift Levels 0-7** (Rank 1-8)
- **Layer 4 = Royalty Claim** ❌ **COLLISION!**
- Layer 10+ = Upline Income

### Evidence from Debug Panel:
```
Entry 0: layer: 4 (MynnGift Level 4!) - 0.008100 opBNB
Entry 4: layer: 4 (Royalty Claim!) - 0.000088 opBNB
```

Both entries have `layer: 4` but represent different income types!

## Why This Causes Issues

1. **MynnGift Levels 2-9 overlap with Royalty Layer 4**
   - Layer 4 in range [2-9] = MynnGift Level 4 (Rank 5)
   - Layer 4 outside context = Royalty Claim

2. **Frontend Filtering Breaks**
   - Filter logic `layer >= 2 && layer <= 9` can't distinguish between MynnGift and Royalty
   - Currently: Royalty (layer 4) gets filtered out as "MynnGift donation" when self-referential

3. **Income Calculation Incorrect**
   - Can't properly separate MynnGift income from Royalty income
   - Total income calculation mixes them up

## Solution

**Change Royalty Claim layer from 4 to 11** (above upline range)

### New Layer Assignment:
- Layer 0 = Referral Income
- Layer 1 = Sponsor Income
- Layer 2-9 = MynnGift Levels 0-7 (Rank 1-8)
- Layer 10+ = Upline Income
- **Layer 11 = Royalty Claim** ✅ (unique, no collision)

## Files to Modify

1. **Smart Contract**: `smart_contracts/contracts/mynnCrypt.sol`
   - Line 495: Change `incomeInfo[userId].push(Income(userId, 4, amount, block.timestamp));` 
   - To: `incomeInfo[userId].push(Income(userId, 11, amount, block.timestamp));`

2. **Frontend**: `frontend/src/components/Dashboard.jsx`
   - Update layer name mapping to recognize layer 11 as "Royalty Claim"
   - Update filter logic if needed to handle layer 11

## Expected Result

After fix:
- Entry 0: layer 4 (MynnGift Level 4) - 0.008100 opBNB ✅ Correctly identified
- Entry 4: layer 11 (Royalty Claim) - 0.000088 opBNB ✅ No more collision!
- Total Income: 0.008088 (referral from entries 2 & 3 + royalty from entry 4)
- Filtering works correctly: MynnGift (2-9) separated from Royalty (11)
