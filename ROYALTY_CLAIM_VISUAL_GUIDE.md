# 📊 Royalty Claim: Visual Explanation

## Problem Diagram

```
┌─────────────────────────────────────────────────────┐
│ USER RECEIVES ROYALTY (0.000088 opBNB)             │
├─────────────────────────────────────────────────────┤
│ Smart Contract State:                               │
│  • royaltyIncome[user] = 0.000088 (PENDING)         │
│  • incomeInfo[user] = [] (EMPTY)                    │
│                                                      │
│ Frontend Display:                                    │
│  • calculateTotalIncome = 0.0081                    │
│    (referral + sponsor + upline + pending_royalty) │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ USER CLAIMS ROYALTY                                │
├─────────────────────────────────────────────────────┤
│ Smart Contract Actions:                             │
│  1. royaltyIncome[user] = 0 (CLEARED)              │
│  2. incomeInfo[user].push({type:4, amt:0.000088})  │
│  3. Send 0.000088 to user wallet                    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ ❌ PROBLEM (OLD CODE)                              │
├─────────────────────────────────────────────────────┤
│ Frontend Refetch:                                   │
│  • royaltyIncome[user] = 0 (cleared)               │
│  • incomeInfo[user] = [{type:4, ...}]              │
│                                                      │
│ calculateTotalIncome (OLD):                         │
│  = referral + sponsor + upline + royalty            │
│  = referral + sponsor + upline + 0                  │
│  = 0.0080  ❌ DECREASED!                           │
│                                                      │
│ Income History:                                      │
│  ✅ Shows royalty claim (but total decreased!)      │
└─────────────────────────────────────────────────────┘
```

---

## Solution Diagram

```
┌─────────────────────────────────────────────────────┐
│ ✅ SOLUTION (NEW CODE)                              │
├─────────────────────────────────────────────────────┤
│ Frontend Refetch:                                   │
│  • royaltyIncome[user] = 0 (cleared)               │
│  • incomeInfo[user] = [{type:4, amt:0.000088}]     │
│                                                      │
│ claimedRoyalty:                                     │
│  = sum of all incomeHistory entries with type 4    │
│  = 0.000088 (from history)                         │
│                                                      │
│ pendingRoyalty:                                     │
│  = royaltyIncome[user]                             │
│  = 0 (from breakdown)                              │
│                                                      │
│ calculateTotalIncome (NEW):                         │
│  = referral + sponsor + upline + (claimed + pending)│
│  = referral + sponsor + upline + (0.000088 + 0)    │
│  = 0.0081  ✅ SAME!                                │
│                                                      │
│ Income History:                                      │
│  ✅ Shows royalty claim                             │
│  ✅ Total stays correct                             │
└─────────────────────────────────────────────────────┘
```

---

## Data Source Comparison

### BEFORE FIX
```javascript
calculateTotalIncome = referral + sponsor + upline + PENDING_ONLY
                     ┌────────────────────────────────────────┐
                     │ getUserIncomeBreakdown()                │
                     │ [0] referralIncome                     │
                     │ [1] levelIncome                        │
                     │ [2] sponsorIncome                      │
                     │ [3] totalDonation                      │
                     │ [4] royaltyIncome ← MAPPING (pending)  │
                     └────────────────────────────────────────┘
Problem: After claim, [4] becomes 0, total decreases!
```

### AFTER FIX
```javascript
calculateTotalIncome = referral + sponsor + upline + (CLAIMED + PENDING)
                     ┌──────────────────────┐
                     │ getUserIncomeBreakdown│
                     │ [0] referral         │
                     │ [1] level            │
                     │ [2] sponsor          │  ← PENDING_ROYALTY
                     │ [3] totalDonation    │
                     │ [4] royaltyIncome    │
                     └──────────────────────┘
                                +
                     ┌──────────────────────┐
                     │ incomeHistory        │
                     │ filter(type === 4)   │  ← CLAIMED_ROYALTY
                     │ sum(amount)          │
                     └──────────────────────┘

Result: Same total before and after claim!
```

---

## Timeline Visualization

### Scenario: User Receives & Claims 0.000088 opBNB Royalty

```
STEP 1: Royalty Distribution
┌─────────────────────────────────────────────────────────┐
│ royaltyIncome[user]   = 0 → 0.000088 (PENDING)        │
│ incomeHistory[user]   = [] (empty)                      │
│ calculateTotalIncome  = 0.0000 → 0.0081 (gained 0.81%) │
└─────────────────────────────────────────────────────────┘

STEP 2: User Clicks "Claim Royalty"
┌─────────────────────────────────────────────────────────┐
│ Smart Contract:                                         │
│  1. amount = royaltyIncome[user] = 0.000088             │
│  2. royaltyIncome[user] = 0 (clear pending)            │
│  3. incomeHistory.push({type:4, amt:0.000088})         │
│  4. payable(user).call{value: 0.000088}                │
│  5. emit RoyaltyClaimed(user, 0.000088)                │
└─────────────────────────────────────────────────────────┘

STEP 3: Frontend Refetch (with FIX)
┌─────────────────────────────────────────────────────────┐
│ From getUserIncomeBreakdown:                            │
│  pendingRoyalty = 0 (cleared)                          │
│                                                          │
│ From getIncome (incomeHistory):                         │
│  claimedRoyalty = 0.000088 (filter type 4)             │
│                                                          │
│ calculateTotalIncome:                                   │
│  = referral + sponsor + upline + (0.000088 + 0)        │
│  = 0.0081 ✅ SAME!                                      │
│                                                          │
│ Income History Display:                                 │
│  [New Entry] Royalty: 0.000088 opBNB                   │
│  User's Wallet: +0.000088 opBNB                        │
└─────────────────────────────────────────────────────────┘
```

---

## Code Change Visualization

```javascript
// ❌ OLD LOGIC
const calculateTotalIncome = useMemo(() => {
  const referral = ...;
  const upline = ...;
  const sponsor = ...;
  const royalty = incomeBreakdown[4];  // ❌ PENDING ONLY
  
  return (referral + sponsor + upline + royalty).toFixed(4);
}, [incomeBreakdown]);

//                           ↓↓↓ AFTER CLAIM ↓↓↓
// royalty = 0 ❌ → Total DECREASES


// ✅ NEW LOGIC
const claimedRoyalty = useMemo(() => {
  return incomeHistory
    .filter(income => income.incomeType === 4)  // Type 4 = Royalty
    .reduce((sum, income) => sum + parseFloat(income.amount), 0);
}, [incomeHistory]);

const calculateTotalIncome = useMemo(() => {
  const referral = ...;
  const upline = ...;
  const sponsor = ...;
  const pendingRoyalty = incomeBreakdown[4];     // PENDING
  
  const totalRoyalty = claimedRoyalty + pendingRoyalty;  // ✅ BOTH!
  return (referral + sponsor + upline + totalRoyalty).toFixed(4);
}, [incomeBreakdown, claimedRoyalty]);

//                           ↓↓↓ AFTER CLAIM ↓↓↓
// totalRoyalty = 0.000088 + 0 = 0.000088 ✅ → Total STABLE
```

---

## State Machine Diagram

```
               User Joins
                   ↓
        ┌───────────────────────┐
        │  No Royalty Income    │
        │  claimed = 0          │
        │  pending = 0          │
        │  total = 0            │
        └───────────────────────┘
                   ↓
        ┌───────────────────────┐
        │ Royalty Distributed   │
        │  claimed = 0          │
        │  pending = 0.000088   │  ← Awaiting claim
        │  total = 0.0081       │
        └───────────────────────┘
                   ↓
           [User Claims]
                   ↓
        ┌───────────────────────┐
        │ Royalty Claimed       │
        │  claimed = 0.000088   │  ← In history
        │  pending = 0          │
        │  total = 0.0081       │  ✅ SAME!
        └───────────────────────┘
                   ↓
        ┌───────────────────────┐
        │ New Royalty Earned    │
        │  claimed = 0.000088   │
        │  pending = 0.00005    │  ← New pending
        │  total = 0.0082       │  ✅ Increases correctly
        └───────────────────────┘
```

---

## Formula Comparison

```
╔════════════════════════════════════════════════════════════╗
║ TOTAL INCOME FORMULA COMPARISON                           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ ❌ OLD (BUGGY):                                           ║
║    TotalIncome = Referral + Sponsor + Upline + Pending   ║
║                                                            ║
║    Problem: Pending → 0 after claim → Total decreases     ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ ✅ NEW (FIXED):                                           ║
║    TotalRoyalty = Claimed + Pending                       ║
║    TotalIncome = Referral + Sponsor + Upline + TotalRoyalty
║                                                            ║
║    Solution: Claimed stays in total → Stable             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## Impact Summary

| Metric | Before Fix | After Fix | Status |
|--------|-----------|-----------|--------|
| Total before claim | 0.0081 | 0.0081 | ✅ Same |
| Total after claim | 0.0080 ❌ | 0.0081 ✅ | Fixed |
| Income history | Shows claim | Shows claim | ✅ Works |
| User confusion | HIGH | LOW | ✅ Better |
| Smart contract changes | N/A | None | ✅ Frontend only |

---

*This diagram helps visualize why total income was decreasing and how the fix resolves it by tracking both claimed and pending royalty.*
