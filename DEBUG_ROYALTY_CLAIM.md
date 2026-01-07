# 🔍 Debugging: Royalty Claim Not Appearing in Income History

## Problem
- Claim Royalty transaction: ✅ **Success**
- Amount transferred: ✅ 0.000088 BNB received
- Income History: ❌ **No royalty entry showing**

---

## Investigation Steps

### Step 1: Open Browser Console
1. Open your browser's **Developer Tools** (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Keep this open while performing steps below

### Step 2: Claim Royalty & Observe Logs

**You should see logs in this order:**

```
1. [tx submitted]
   Claim royalty transaction sent! Waiting for confirmation...

2. [tx confirmed - wait 1.5s]
   ✅ Claim Royalty transaction confirmed, waiting for block state update...
   ✅ Now refetching user data after state update...

3. [refetch income history]
   📊 Income History Raw Data: [...]
   
4. [processing each entry]
   📝 Processing income entry 0: {...}
   📝 Processing income entry 1: {...}
   etc...
```

---

## What To Look For

### ✅ If Royalty Claim IS Appearing

Look for logs like:
```
📝 Processing income entry 2: {
  id: "YourUserId",
  layer: 4,              ← Should be 4 for royalty!
  amount: "88000000000000000",
  time: 1704604359
}

  Layer: 4, SenderId: YourUserId, ReceiverId: YourUserId
  → Mapped to ROYALTY ✅

✅ Processed income entry: {
  senderId: "YourUserId",
  receiverId: "YourUserId",
  incomeType: 4,         ← Should be 4 (IncomeType.ROYALTY)
  amount: "0.000088",
  timestamp: 1704604359000,
  layer: 4
}
```

**Then check:** 
- Does it appear in the Income History table on screen?
- If NOT, might be a filtering/display issue

### ❌ If Royalty Claim IS NOT Appearing

Look for logs like:
```
📊 Income History Raw Data: [
  {...entry 0...},
  {...entry 1...}
  // NO entry with layer: 4
]
```

**If this happens:**
1. **Contract Issue** - royalty not being pushed to incomeInfo
2. **RPC/Cache Issue** - getIncome not returning updated data
3. **Refetch Timing** - data refetched too early before block update

---

## Debug Checklist

After claiming royalty, check each:

- [ ] Transaction shows **Status: Success** ✅
- [ ] BNB received in wallet ✅
- [ ] Console shows "Income History Raw Data" with **layer: 4** entry
- [ ] Console shows **"→ Mapped to ROYALTY ✅"** 
- [ ] Console shows **"Processed income entry"** with **incomeType: 4**
- [ ] Income History table shows **"Royalty"** type
- [ ] Amount in history matches claimed amount

---

## Common Issues & Solutions

### Issue #1: No Layer 4 Entry in Raw Data

**Log shows:**
```
📊 Income History Raw Data: [
  {id: "user", layer: 0, amount: "..."},
  {id: "user", layer: 1, amount: "..."},
  // NO layer: 4
]
```

**Possible Causes:**
- Smart contract didn't push to incomeInfo
- RPC provider not synced yet
- getIncome function issue

**Solution:**
- Wait a few blocks (15-30 seconds)
- Manually refetch: Press F5 to refresh page
- Check contract on block explorer

---

### Issue #2: Has Layer 4 But Filtered Out

**Log shows:**
```
📝 Processing income entry 2: {
  id: "YourUserId",
  layer: 4,
  amount: "..."
}

  Layer: 4, SenderId: YourUserId, ReceiverId: YourUserId
  ✅ Filtering out MynnGift donation (self-referential)
```

**Problem:**
- Income has layer 4 ✅
- But being filtered out ❌
- **Because senderId === receiverId (self-referential)**

**Analysis:**
- For royalty claim: both are the SAME user (self-referential is correct!)
- Current filter is too aggressive
- Filter currently: `if (layer >= 2 && layer <= 9 && senderId === receiverId) → skip`
- This skips layer 4 if self-referential! ❌

**Fix Needed:**
- Don't filter layer 4 (royalty) even if self-referential
- Only filter layers 2-3, 5-9 (MynnGift levels)

---

### Issue #3: Has Layer 4 But Showing in Table as "Referral"

**Log shows:**
```
✅ Processed income entry: {
  incomeType: 1,  ← Should be 4!
  ...
}
```

**Problem:**
- Layer value not being read correctly
- Mapping layer 4 to REFERRAL instead of ROYALTY

**Possible Cause:**
- income.layer field not matching struct order
- Struct might be: {id, layer, amount, time}
- But frontend reading different order?

---

## Quick Test

**Paste this in console** (Developer Tools → Console):
```javascript
// Check if royalty type exists
console.log('IncomeType.ROYALTY =', 4);

// Look at last refetched data
console.log('Check console logs above for "Income History Raw Data"');
console.log('Look for entry with layer: 4');
```

---

## Logs to Share

If issue persists, share:

1. **Browser Console Logs** (F12 → Console, copy all after claiming)
2. **Transaction Hash**: 0x458a67fb295d9f8c0cf504d6d91e22c144b5f05a7ea8f0db8dc6690438f4cb59
3. **User ID** (if comfortable)
4. **Screenshot** of Income History table

---

## Expected Flow

```
┌─────────────────────────────────┐
│ User Claims Royalty             │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ TX Submitted                    │
│ (hash sent to chain)            │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ TX Confirmed                    │
│ (mined in block)                │
│ - royaltyIncome[user] = 0       │
│ - incomeInfo push(type 4)       │
│ - BNB transferred               │
└────────────┬────────────────────┘
             ↓
      ⏳ WAIT 1.5s
      (block state update)
             ↓
┌─────────────────────────────────┐
│ Refetch getIncome()             │
│ (should return type 4 entry)    │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Process & Map to IncomeType.ROYALTY
│ (layer 4 → ROYALTY)             │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Display in Income History       │
│ Type: "Royalty"                 │
│ Amount: 0.000088 opBNB          │
│ Status: Sukses                  │
└─────────────────────────────────┘
```

---

## Next Steps

1. **Try claiming again** with new debug logs visible
2. **Check console output** at each stage
3. **Share logs** if problem persists
4. **Possible fix**: Adjust filter to not exclude layer 4 entries

