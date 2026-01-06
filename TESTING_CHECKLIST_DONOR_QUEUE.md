# ✅ DONOR-QUEUE TRANSITION VERIFICATION CHECKLIST

## 📋 QUICK ANSWER TO YOUR QUESTION

**Q: Ketika donor slot full dan distribusi selesai, apakah mereka pindah ke queue?**
**A: ✅ YA, BENAR! Mereka HARUS pindah ke queue.**

**Q: Jika pindah ke queue, apakah slot donor harus kosong secara visual?**
**A: ✅ YA, BENAR! Slot HARUS kosong (biru) untuk menunjukkan transisi.**

---

## 🧪 TESTING CHECKLIST - STREAM A (Level 4)

### Part 1: Setup & Initial State
- [ ] User account siap untuk upgrade ke Level 4
- [ ] MynnGift contract deployed di opBNB
- [ ] Frontend MynnGiftTabs sudah connect ke contract
- [ ] Stream A tab accessible

### Part 2: Donor Collection (First Slot Filling)
- [ ] User 1 upgrade ke Level 4 (send 0.0081 opBNB)
  - [ ] Transaction successful
  - [ ] MynnGift receive event emitted
  - [ ] User 1 muncul di Rank 1 Slot 1 (ORANGE color)
  - [ ] Counter update: "1/6 Slots"
  
- [ ] User 2 upgrade ke Level 4
  - [ ] User 2 muncul di Rank 1 Slot 2 (ORANGE)
  - [ ] Counter update: "2/6 Slots"
  
- [ ] User 3 upgrade ke Level 4
  - [ ] Counter: "3/6 Slots"
  - [ ] Queue masih kosong (no avatars below rank circle)
  
- [ ] User 4 upgrade
  - [ ] Counter: "4/6 Slots"
  
- [ ] User 5 upgrade
  - [ ] Counter: "5/6 Slots"

### Part 3: Full Rank & Distribution Trigger
- [ ] User 6 upgrade ke Level 4
  - [ ] Transaction sent: 0.0081 opBNB
  - [ ] Event: DonationReceived (User 6)
  - [ ] Counter update: "6/6 Slots" ← PENUH!
  - [ ] Rank 1 circle glow change (yellow/gold) ← FULL indicator
  - [ ] Text "Full" appears on rank circle
  
- [ ] Wait for contract processing
  - [ ] Backend: _processFullRank() executed
  - [ ] Backend: Receiver picked from queue (if exists)
  - [ ] ⏱️ ~5-10 seconds for events to emit

### Part 4: Distribution Events & Queue Update
- [ ] Check event logs:
  - [ ] `DonationReceived` event for User 6 ✅
  - [ ] `ReceiverStatusUpdated` event ✅ (if receiver exists)
  - [ ] `WaitingQueueJoined` event x5 or x6 ✅
  - [ ] `RankCycleCompleted` event ✅
  
- [ ] Queue display updated:
  - [ ] "Queue:" label appears below rank circle
  - [ ] 6 avatars appear with addresses (0x12..., 0x34..., etc)
  - [ ] Position badges show: #1, #2, #3, #4, #5, #6
  
- [ ] **CRITICAL VERIFICATION - SLOT VISUAL CHANGE**
  - [ ] All 6 slots turn BLUE (#335580) ✅
  - [ ] No more ORANGE slots visible ✅
  - [ ] Counter shows: "0/6 Slots" ✅
  - [ ] Animation played: slot from orange → blue ✅

### Part 5: Post-Distribution State Verification
- [ ] Verify Rank 1 state:
  - [ ] Donor slots: 0/6 (all blue)
  - [ ] Queue: 6 users waiting
  - [ ] Circle back to normal color (cyan/teal)
  - [ ] "Full" text disappears
  
- [ ] Check ex-donor details:
  - [ ] Each ex-donor in queue has correct position
  - [ ] Queue list shows: User 1, User 2, User 3, User 4, User 5, User 6
  - [ ] Order matches push order (first in queue = first pushed)

### Part 6: New Donor Entry (Cycle Restart)
- [ ] User 7 upgrades ke Level 4
  - [ ] New donor can enter Slot 1 (blue → orange) ✅
  - [ ] Counter: "1/6 Slots"
  - [ ] User 7 appears ORANGE in slot
  - [ ] Queue unaffected: still 6 users waiting
  
- [ ] User 8 upgrades
  - [ ] Slot 2 now occupied (orange)
  - [ ] Counter: "2/6 Slots"

### Part 7: Receiver Auto-Promotion
- [ ] When next 4 users donate (to complete Rank 1 again)
- [ ] Rank 1 full again (6 new donors + queued receiver)
- [ ] First receiver in queue gets picked
  - [ ] Center circle shows receiver (GREEN, with avatar)
  - [ ] 50% funds transferred (check balance)
  - [ ] New queue formed from current donors
  - [ ] Receiver promoted to Rank 2 (auto-promotion)

---

## 🧪 TESTING CHECKLIST - STREAM B (Level 8)

### Part 1: Initial Setup
- [ ] Different wallet for Stream B testing
- [ ] User upgraded to Level 8 in MynnCrypt
- [ ] Ready to enter Stream B

### Part 2: Stream B Entry
- [ ] User 1 (Stream B) upgrades
  - [ ] MynnCrypt sends 0.0936 opBNB to MynnGift
  - [ ] Stream detection: 0.0936 → Stream.B ✅
  - [ ] User 1 appears in Rank 1 Stream B tab (SEPARATE from Stream A) ✅
  - [ ] Counter: "1/6 Slots"
  
- [ ] **CRITICAL:** Verify Stream Separation
  - [ ] Stream A Rank 1: Shows ex-donors in queue from earlier
  - [ ] Stream B Rank 1: Shows ONLY User 1 as donor (clean)
  - [ ] NO mixing between Stream A and Stream B ✅
  - [ ] Two independent visualizations side by side

### Part 3: Stream B Full Cycle (Same as Stream A)
- [ ] User 2-6 (Stream B) upgrade (0.0936 each)
  - [ ] 6 users fill Rank 1 Stream B
  - [ ] Counter: "6/6 Slots"
  - [ ] Circle turns FULL (gold)
  
- [ ] Distribution triggered:
  - [ ] Receiver picked (if queue exists)
  - [ ] Event: WaitingQueueJoined x6
  - [ ] All 6 slots turn BLUE ✅
  - [ ] Queue shows 6 ex-donors
  - [ ] Counter: "0/6 Slots"

### Part 4: Stream Independence Verification
- [ ] At this point, verify:
  - [ ] Stream A Rank 1: May have different state (partial filled, etc)
  - [ ] Stream B Rank 1: Reset state (0/6 slots, 6 in queue)
  - [ ] Both tabs show independent data ✅
  - [ ] Switch between tabs: data persists correctly ✅

---

## 🎨 VISUAL CHECKLIST

### Color Verification:

**Slot Status Colors:**
- [ ] Empty slot: `#335580` (Dark Blue) ✅
- [ ] Occupied slot: `#E78B48` (Orange) ✅
- [ ] Current user slot: `#00FF00` (Green) ✅
- [ ] Rank circle normal: `#4DA8DA` (Cyan) ✅
- [ ] Rank circle full: `#FFD700` (Gold) ✅
- [ ] Queue text: `#4DA8DA` (Cyan) ✅

**Avatar Display:**
- [ ] Donor avatar: 28x28 pixels with address label ✅
- [ ] Queue avatar: 31x61 pixels with address label ✅
- [ ] Center receiver: 60x60 pixels (GREEN circle behind) ✅
- [ ] Address format: "0x12..." (first 4 chars) ✅

---

## 🔄 STATE TRANSITION VERIFICATION

### Timeline Verification:

```
T0: Rank N empty (0/6)
    Slots: [Blue] [Blue] [Blue] [Blue] [Blue] [Blue]
    Queue: empty
    
T1: After User 1 donation
    Slots: [Orange] [Blue] [Blue] [Blue] [Blue] [Blue]
    Queue: empty
    Counter: 1/6
    
T2-T4: Users 2-5 donate
    Slots: [Orange] [Orange] [Orange] [Orange] [Orange] [Blue]
    Queue: empty
    Counter: 5/6
    
T5: User 6 donates (triggers full)
    Slots: [Orange] [Orange] [Orange] [Orange] [Orange] [Orange]
    Queue: empty
    Counter: 6/6 ← FULL INDICATOR SHOWS
    Circle: Gold glow
    
T6: Distribution processing (wait ~5-10s)
    Backend: Running _processFullRank()
    
T7: Distribution complete (CRITICAL MOMENT)
    Slots: [Blue] [Blue] [Blue] [Blue] [Blue] [Blue] ✅
    Queue: [0x1234] [0x5678] [0x9abc] [0xdef0] [0xabcd] [0xef01]
    Counter: 0/6 ✅
    Circle: Cyan (normal)
    Text "Full": GONE
    Animation: Slots transition orange → blue
```

**CRITICAL VERIFICATION POINT:** Between T5 and T7, ALL slots must change from ORANGE to BLUE!

---

## 🐛 BUG DETECTION CHECKLIST

### ❌ If you see these, something is WRONG:

- [ ] **SLOT NOT BLUE AFTER DISTRIBUTION**
  - [ ] Slot still shows orange after queue update
  - [ ] Issue: donors array not cleared
  - [ ] Check: `_resetRank()` function
  
- [ ] **DONORS NOT IN QUEUE AFTER FULL**
  - [ ] Slots are blue but no queue appears
  - [ ] Issue: Push to queue logic failed
  - [ ] Check: Loop in `_processFullRank()` lines 324-337
  
- [ ] **DUPLICATE IN QUEUE**
  - [ ] Same donor appears twice in queue
  - [ ] Issue: Donor already in queue, not checking `!isInWaitingQueue()`
  - [ ] Check: Condition before push
  
- [ ] **STREAM A/B MIXED**
  - [ ] Users from Stream B appear in Stream A queue
  - [ ] Issue: Not using correct stream rank structure
  - [ ] Check: `ranks_StreamA` vs `ranks_StreamB` mapping
  
- [ ] **COUNTER NOT UPDATING**
  - [ ] Counter shows "6/6" even after reset
  - [ ] Counter doesn't change when new donor enters
  - [ ] Issue: Frontend not refetching `rankInfo.donors.length`
  - [ ] Check: Event listener trigger for refetch
  
- [ ] **RECEIVER CENTER NOT SHOWING**
  - [ ] Distribution happened but no green center circle
  - [ ] Issue: `lastReceiver` state not updated
  - [ ] Check: Event: ReceiverStatusUpdated listener
  
- [ ] **ANIMATION NOT PLAYING**
  - [ ] Slot color changes instant, no animation
  - [ ] Not critical, but check CSS transitions
  - [ ] Check: MynnGiftVisualization.jsx className
  
- [ ] **EVENT NOT EMITTING**
  - [ ] No events in blockchain explorer logs
  - [ ] Issue: Contract call failed silently
  - [ ] Check: Contract transaction receipt
  - [ ] Check: Gas estimation

---

## 📊 DATA VERIFICATION CHECKLIST

### Smart Contract State (for debugging):

```javascript
// Query after full rank:
const donors = await mynngift.getRankDonors(1, Stream.A);
console.log("Donors:", donors);  // Should be: []

const queue = await mynngift.getRankWaitingQueue(1, Stream.A);
console.log("Queue:", queue);    // Should be: [0x1, 0x2, 0x3, 0x4, 0x5, 0x6]

const slots = await mynngift.getQueueStatus(1, Stream.A);
console.log("Status:", slots);   // Should be: [6, 0] (6 in queue, 0 donors)

// Verify per-stream independence:
const donorsB = await mynngift.getRankDonors(1, Stream.B);
console.log("Stream B Donors:", donorsB);  // Separate from Stream A
```

### Frontend State (for debugging):

```javascript
// In browser console:
rankInfo.donors.length        // Should be: 0 after reset
rankInfo.waitingQueue.length  // Should be: 6 after distribution
rankInfo.isFull               // Should be: false after reset
rankInfo.totalFunds           // Should be: 0 after reset
```

---

## ✅ FINAL VERIFICATION CHECKLIST

- [ ] Full cycle complete: 6 donors → distribution → 6 in queue
- [ ] All 6 slots BLUE after distribution
- [ ] Queue displays 6 ex-donors with correct positions
- [ ] Stream A and Stream B completely separate
- [ ] New donors can enter blue slots for next cycle
- [ ] Queue position updates correctly for promoted receiver
- [ ] All events emitted correctly (check logs)
- [ ] No data mixing between streams
- [ ] Performance: Distribution completes in <10 seconds
- [ ] Mobile responsive: Slots and queue visible on mobile
- [ ] Dark mode colors: All colors visible in dark theme

---

## 📝 TEST REPORT TEMPLATE

```
TEST DATE: [YYYY-MM-DD]
TESTER: [Name]
ENVIRONMENT: [testnet/mainnet]

STREAM A (Level 4):
├─ Setup: ✅ / ❌
├─ Collection Phase: ✅ / ❌
│  └─ Comment: [any issues]
├─ Full & Distribution: ✅ / ❌
│  └─ Slot Blue: ✅ / ❌
│  └─ Queue Shows: ✅ / ❌
├─ Post-Reset: ✅ / ❌
└─ Cycle Restart: ✅ / ❌

STREAM B (Level 8):
├─ Setup: ✅ / ❌
├─ Collection Phase: ✅ / ❌
├─ Full & Distribution: ✅ / ❌
│  └─ Slot Blue: ✅ / ❌
├─ Stream Separation: ✅ / ❌
└─ Cycle Restart: ✅ / ❌

VISUAL VERIFICATION:
├─ Colors Correct: ✅ / ❌
├─ Animation Smooth: ✅ / ❌
├─ Text Readable: ✅ / ❌
└─ Mobile Responsive: ✅ / ❌

BUGS FOUND:
├─ [Bug 1]: [Description]
├─ [Bug 2]: [Description]
└─ None: ✅

RECOMMENDATION: [PASS / NEEDS FIXING / PARTIAL]

NOTES:
[Additional observations]
```

---

## 🎓 REFERENCE POINTS FOR VERIFICATION

**Smart Contract Files:**
- [ ] [smart_contracts/contracts/mynnGift.sol](smart_contracts/contracts/mynnGift.sol#L324-L337) - Donor to queue push logic
- [ ] [smart_contracts/contracts/mynnGift.sol](smart_contracts/contracts/mynnGift.sol#L404-L412) - Reset logic

**Frontend Files:**
- [ ] [frontend/src/components/MynnGiftVisualization.jsx](frontend/src/components/MynnGiftVisualization.jsx#L919-L950) - Slot rendering
- [ ] [frontend/src/components/MynnGiftVisualization.jsx](frontend/src/components/MynnGiftVisualization.jsx#L937-L950) - Queue rendering

**Event Listeners:**
- [ ] `DonationReceived` - Update slots
- [ ] `WaitingQueueJoined` - Update queue
- [ ] `RankCycleCompleted` - Refetch rank data
- [ ] `ReceiverStatusUpdated` - Update center receiver

---

**Status:** Ready for Testing ✅
**Priority:** HIGH (Critical for system integrity)
**Last Updated:** 6 January 2026
