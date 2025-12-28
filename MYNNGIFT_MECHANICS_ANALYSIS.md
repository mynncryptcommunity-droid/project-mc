# 📊 MynnGift vs MynnCrypt: Detailed Mechanics Analysis

## **1. TERMINOLOGY CLARIFICATION**

### **Level (MynnCrypt - Smart Contract)**
- User progression dalam MynnCrypt
- Range: Level 1 - 12
- **Upgrade cost meningkat exponentially**
  - Level 1: 0.0044 opBNB (registration)
  - Level 2: 0.0072 opBNB
  - Level 12: 7.3728 opBNB
- **User bisa punya multiple levels melalui level upgrade**
- **Trigger MynnGift entry saat Level 4 & Level 8**

### **Rank (MynnGift - Smart Contract)**
- **Separate dari Level MynnCrypt**
- Range: Rank 1 - 8
- **Sequential progression dalam MynnGift**
  - Rank 1 → Rank 2 → ... → Rank 8
- **User naik rank otomatis setelah selesai di rank sebelumnya**
- **Rank 8 selesai = User keluar dari MynnGift total**

---

## **2. CURRENT MYNNCRAFT STRUCTURE**

```
MynnCrypt (Levels 1-12)
│
├─ Level 1-3: No MynnGift
├─ Level 4: ✅ Enter MynnGift (First Stream)
│           └─ Amount: 0.0081 opBNB per rank
├─ Level 5-7: Tidak ada action MynnGift
├─ Level 8: ✅ Enter MynnGift (Second Stream)  
│           └─ Amount: 0.0081 opBNB per rank
└─ Level 9-12: Tidak ada action MynnGift
```

---

## **3. RANK MECHANISM (6 DONORS + 1 RECEIVER)**

### **Per Rank Flow:**

```
RANK CYCLE STRUCTURE:
┌─────────────────────────────────────────────────────┐
│                    RANK N                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  STATUS: 6 DONORS NEEDED + 1 RECEIVER               │
│                                                     │
│  🚶 Step 1: 6 Donators masuk (Sequential)          │
│     Donor 1: Donate 0.0081 opBNB                   │
│     Donor 2: Donate 0.0081 opBNB                   │
│     Donor 3: Donate 0.0081 opBNB                   │
│     Donor 4: Donate 0.0081 opBNB                   │
│     Donor 5: Donate 0.0081 opBNB                   │
│     Donor 6: Donate 0.0081 opBNB                   │
│     ↓                                              │
│     TOTAL COLLECTED: 0.0486 opBNB (6 × 0.0081)    │
│                                                     │
│  🎁 Step 2: Donor #1 menjadi RECEIVER              │
│     • Dapat: 50% dari total = 0.0243 opBNB         │
│     • Auto-promoted ke Rank N+1                    │
│                                                     │
│  💰 Distribution:                                  │
│     • Receiver: 50% = 0.0243 opBNB                │
│     • Promotion Pool: 45% = 0.02187 opBNB          │
│     • Gas Subsidy: 5% of fee → subsidize users    │
│     • Platform Fee: Remainder                      │
│                                                     │
│  🚶 Step 3: Remaining 5 Donors → Waiting Queue    │
│     └─ Masuk antrian Rank N+1                      │
│        Akan menjadi donators di rank berikutnya    │
│                                                     │
│  🔄 Step 4: Rank N FULL → RESET               │
│     • Clear donors list                           │
│     • Preserve waiting queue untuk fairness        │
│     • Start collecting new donors                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **Complete Rank Cycle:**

```
USER JOURNEY DALAM 1 RANK:

User A (Level 4)
│
├─ Status: NEW_TO_MYNNGIFT
├─ Rank: 1
├─ Position: Waiting to become donor
│
├─ 🎯 STEP 1: Masuk sebagai DONOR (1st of 6)
│  └─ Donate 0.0081 opBNB untuk Rank 1
│
├─ ⏳ STEP 2: Menunggu 5 donor lainnya
│  └─ Current: 1/6 donors
│
├─ ✅ STEP 3: Rank 1 FULL (6 donors collected)
│  └─ User A menjadi RECEIVER (karena donor pertama)
│     Receive: 0.0243 opBNB (50% dari 0.0486)
│
├─ 🚀 STEP 4: AUTO-PROMOTE ke Rank 2
│  ├─ Previous Status: COMPLETED RANK 1
│  ├─ New Status: IN_QUEUE for Rank 2
│  └─ Waiting untuk menjadi donor di Rank 2
│
├─ Repeat Steps 1-4 untuk Rank 2...8
│
└─ 🏆 STEP FINAL: Complete Rank 8
   └─ User KELUAR dari MynnGift
      Status: RANK_8_COMPLETED
      Total Income: Sum of all 8 ranks
      Blocked: Tidak bisa join MynnGift lagi
```

---

## **4. CRITICAL DISTINCTION: SINGLE vs MULTIPLE STREAMS**

### **User at Level 4:**
```
MynnCrypt Stream:
├─ Level: 4
└─ Status: In Progress

MynnGift Stream A:
├─ Entry: Level 4 upgrade
├─ Rank: 1-8 progression
├─ Amount per rank: 0.0081 opBNB
├─ Total potential income: 8 × 0.0243 = 0.1944 opBNB
└─ Status: ACTIVE (in Rank X)
```

### **User at Level 12:**
```
MynnCrypt Stream:
├─ Level: 12
└─ Status: MAX

MynnGift Stream A (FROM LEVEL 4):
├─ Entry: Level 4 upgrade (Past)
├─ Rank: 1-8 progression
├─ Status: COMPLETED ✅ (exited MynnGift)
├─ Total earned: 0.1944 opBNB
└─ Blocked: Cannot rejoin

MynnGift Stream B (FROM LEVEL 8):
├─ Entry: Level 8 upgrade (Past or Recent)
├─ Rank: 1-8 progression
├─ Status: ACTIVE or COMPLETED
├─ Total earned: 0.1944 opBNB (if complete) or partial
└─ Note: Could still be in progress

TOTAL MynnGift Potential:
└─ Up to 2 × 0.1944 = 0.3888 opBNB
```

---

## **5. KEY MECHANISMS**

### **Automatic Promotion:**
```
✅ When 6 donors reach for Rank N:
   → 1st donor (RECEIVER) auto-promoted to Rank N+1
   → Removed from Rank N
   → Added to waiting queue of Rank N+1
   → 2nd-6th donors → waiting queue of Rank N+1
   → Rank N resets, ready for new donors
```

### **Waiting Queue Logic:**
```
📋 Waiting Queue Rules:
   • Fair queue preservation (FIFO)
   • User's position decides when they become next donor
   • Cannot skip or prioritize
   • User status visible in queue position
```

### **Exit Condition:**
```
🚪 User exits MynnGift ONLY WHEN:
   └─ Successfully completed Rank 8
   └─ Becomes receiver of Rank 8
   └─ Auto-promoted from Rank 8 → BLOCKED
   └─ Status: isRank8Completed[address] = true
```

### **Rank 8 Completed Blocking:**
```
🔒 After Rank 8 Completion:
   ├─ User can NEVER join waiting queues again
   ├─ Blocked from being donor/receiver in any rank
   ├─ All MynnGift income stream TERMINATED
   └─ Note: Smart contract checks: !isRank8Completed[donor]
```

---

## **6. INCOME DISTRIBUTION PER RANK**

### **Example: Rank 1 (Amount: 0.0081 opBNB)**

```
Total per 6 donors: 0.0486 opBNB (6 × 0.0081)

Distribution:
├─ RECEIVER (1st donor):        0.0243 opBNB (50%)
├─ PROMOTION_POOL:              0.02187 opBNB (45%)
├─ GAS_SUBSIDY:                 0.0008775 opBNB (5% of 10%)
└─ PLATFORM_FEE:                0.00428 opBNB (5% balance)

Cumulative (Rank 1-8):
├─ Receiver Income: 0.0243 × 8 = 0.1944 opBNB
├─ Promotion Pool: Accumulates for distribution
└─ Gas Subsidy: Accumulates for user transactions
```

### **Donation Values per Rank:**
```
Rank 1: 0.0081 opBNB       (× 6.27^0)
Rank 2: 0.02187 opBNB      (× 6.27^1)
Rank 3: 0.059049 opBNB     (× 6.27^2)
Rank 4: 0.1594323 opBNB    (× 6.27^3)
Rank 5: 0.43046721 opBNB   (× 6.27^4)
Rank 6: 1.162261467 opBNB  (× 6.27^5)
Rank 7: 3.138105961 opBNB  (× 6.27^6)
Rank 8: 8.472886094 opBNB  (× 6.27^7)

Pattern: Each rank ≈ 2.7x more than previous
Curve: Exponential progression
```

---

## **7. USER SCENARIOS**

### **Scenario A: User at Level 4 (Just Entered MynnGift)**
```
Status Overview:
├─ MynnCrypt Level: 4
├─ MynnGift Entry: YES (Stream A Started)
├─ Current Rank: 1 (or in queue)
├─ Stream B: NOT STARTED (waiting for Level 8)
├─ Eligible for: Rank 1-8 (Stream A only)
└─ Potential Income: 0.1944 opBNB (if complete Stream A)

Active Monitoring:
├─ Stream A Progress: Which rank? What position in queue?
├─ Expected income: Based on current rank
└─ Blocked streams: None
```

### **Scenario B: User at Level 8 (After Level 4)**
```
Status Overview:
├─ MynnCrypt Level: 8
├─ Stream A: Somewhere in Rank 1-8
├─ Stream B: JUST STARTED (new entry point)
├─ Eligible: Both Stream A & Stream B progressing
└─ Potential Income: Up to 0.3888 opBNB

Active Monitoring:
├─ Stream A: "How far am I? Position in Rank X?"
├─ Stream B: "Just entered, where in Rank 1?"
├─ Which stream more advanced?
├─ When will each stream complete?
└─ Total combined income tracking
```

### **Scenario C: User at Level 12 (Max Level)**
```
Status Overview A (From Level 4):
├─ Stream A: Status = COMPLETED ✅ or IN_PROGRESS
├─ If Completed: Total earned = 0.1944 opBNB
├─ If In Progress: Partially earned + remaining ranks

Status Overview B (From Level 8):
├─ Stream B: Status = COMPLETED ✅ or IN_PROGRESS
├─ If Completed: Total earned = 0.1944 opBNB
├─ If In Progress: Partially earned + remaining ranks

Blocking Rules:
├─ Stream A Rank 8 → BLOCKED forever
├─ Stream B Rank 8 → BLOCKED forever
└─ Cannot enter new ranks once Rank 8 completed

Monitoring Needs:
├─ Which stream completed first?
├─ Which stream still active?
├─ Total earned from both streams?
├─ When will second stream complete?
└─ Once both complete, NO MORE MynnGift income
```

---

## **8. TECHNICAL DIFFERENCES**

| Aspect | Level (MynnCrypt) | Rank (MynnGift) |
|--------|-------------------|-----------------|
| Range | 1-12 | 1-8 |
| Progression | Cumulative upgrade | Sequential progression |
| Entry Point | User pays upgrade cost | Auto-trigger at L4 & L8 |
| Income Type | Direct sponsorship | Donation-based queue |
| Exit Condition | Never (stays at max) | Rank 8 completion |
| Multiplicity | One per user | Up to 2 streams (L4 & L8) |
| Blocking | Never blocked | Blocked after Rank 8 |
| Cost model | Exponential (doubles) | Exponential (2.7x) |

---

## **9. DATA STRUCTURE NEEDED FOR UI**

```javascript
MynnGiftUserStatus {
  userId: string,
  level: number,              // Current MynnCrypt level
  
  // Stream A (from Level 4)
  streamA: {
    status: "NOT_STARTED" | "ACTIVE" | "COMPLETED" | "BLOCKED",
    currentRank: 1-8 | null,
    queuePosition: number,
    totalDonated: number,
    totalReceived: number,
    incomeHistory: [
      { rank, receivedAmount, date },
      ...
    ],
    completionDate: timestamp
  },
  
  // Stream B (from Level 8)
  streamB: {
    status: "NOT_STARTED" | "ACTIVE" | "COMPLETED" | "BLOCKED",
    currentRank: 1-8 | null,
    queuePosition: number,
    totalDonated: number,
    totalReceived: number,
    incomeHistory: [
      { rank, receivedAmount, date },
      ...
    ],
    completionDate: timestamp
  },
  
  // Combined stats
  totalMynnGiftIncome: number,
  activeStreams: number,
  completedStreams: number,
  nextExpectedIncome: {
    stream: "A" | "B",
    estimatedAmount: number,
    estimatedDate: timestamp
  }
}
```

---

## **10. CRITICAL INSIGHTS FOR UI**

✅ **Users need clear distinction between Streams**
- Stream A vs Stream B are INDEPENDENT
- Can progress at different speeds
- Different earning potentials

✅ **Queue position is EVERYTHING**
- Position determines when user becomes donor
- When donor → when receiver → when promoted
- Directly impacts when income is received

✅ **Rank 8 is a HARD EXIT**
- No rejoin
- User is permanently blocked
- Different from Level (which never blocks)

✅ **Exponential curve is aggressive**
- Rank 8 needs 0.004844 opBNB in donations (vs 0.0081 for Rank 1)
- But receiver gets 4.236 opBNB (vs 0.0243 for Rank 1)
- Users need education on this curve

✅ **Completion tracking is complex**
- Need to track completion per stream
- Different completion dates for Stream A vs B
- Impact on blocker status

---

## **RECOMMENDED UI STRUCTURE**

See next section for detailed UI recommendations...
