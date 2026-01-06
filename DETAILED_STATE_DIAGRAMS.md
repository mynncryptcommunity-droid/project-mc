# 🔄 DETAILED STATE DIAGRAMS - Donor Slot Lifecycle

## STATE MACHINE 1: Single Slot Lifecycle

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     COMPLETE SLOT STATE MACHINE                             │
└────────────────────────────────────────────────────────────────────────────┘

                          ┏━━━━━━━━━━━━━━━┓
                          ┃    [EMPTY]    ┃ ← Initial state
                          ┃  Color: BLUE  ┃
                          ┃  #335580      ┃
                          ┗━━━━━━━━━━━━━━━┛
                                 │
                                 │ Event: User donates
                                 │ Amount: 0.0081 (StreamA)
                                 │         OR 0.0936 (StreamB)
                                 │
                                 ▼
                          ┏━━━━━━━━━━━━━━━┓
                          ┃  [OCCUPIED]   ┃ ← Donor in slot
                          ┃  Color: ORG   ┃
                          ┃  #E78B48      ┃
                          ┃  Avatar + ID  ┃
                          ┗━━━━━━━━━━━━━━━┛
                                 │
                                 │ Repeat for 2-5 more users
                                 ▼
                  (Multiple donors filling slots)
                                 │
                                 │ 6th donor enters
                                 ▼
                          ┏━━━━━━━━━━━━━━━┓
                          ┃     [FULL]    ┃ ← Rank 6/6
                          ┃  Color: GOLD  ┃
                          ┃  #FFD700      ┃
                          ┃ Glow animation┃
                          ┗━━━━━━━━━━━━━━━┛
                                 │
                                 │ Event: _processFullRank()
                                 │         triggered
                                 │
                         ┌───────┴────────┐
                         │                │
                    (BACKEND PROCESSING)
                 ┌─────────────────────────────────┐
                 │ 1. Pick receiver from queue      │
                 │ 2. Calculate payouts            │
                 │ 3. Transfer funds               │
                 │ 4. Emit events                  │
                 │ 5. Push donors to queue         │
                 │ 6. DELETE donors array          │ ← CRITICAL
                 │ 7. Reset totalFunds             │
                 │ 8. Preserve waitingQueue        │
                 └─────────────────────────────────┘
                                 │
                                 ▼
                          ┏━━━━━━━━━━━━━━━┓
                          ┃  [RESET]      ┃ ← After distribution
                          ┃  Color: BLUE  ┃
                          ┃  #335580      ┃ ← Back to empty!
                          ┃  Animation    ┃
                          ┗━━━━━━━━━━━━━━━┛
                                 │
                                 │ Event: RankCycleCompleted
                                 │        Frontend refetch
                                 │
                    ┌────────────┴─────────────────┐
                    │                              │
              Case 1: Cycle continues        Case 2: Rank 8 Complete
                    │                         (User blocked from
              Next cycle ready                 queue next time)
                    │                              │
                    ▼                              ▼
         ┌──────────────────┐          ┌──────────────────┐
         │ NEW DONOR ENTERS │          │  [CYCLE_COMPLETE]│
         │ (Back to TOP)    │          │  User promoted   │
         │ Orange slot      │          │  to next rank    │
         └──────────────────┘          └──────────────────┘
                    ▲                              │
                    │                              │
                    └──────────────────────────────┘
                         Repeat for
                      Rank 1-8 Cycle
                      (8 rounds total)
```

---

## STATE MACHINE 2: Per-Stream Rank Evolution

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    STREAM A FULL PROGRESSION (8 Ranks)                      │
└────────────────────────────────────────────────────────────────────────────┘

              STREAM A: Level 4 Entry (0.0081 opBNB)
              
    Rank 1           Rank 2           Rank 3    ...    Rank 8
  [CYCLE 1]       [CYCLE 2]        [CYCLE 3]        [CYCLE 8]
    
    ┌──────────┐   ┌──────────┐    ┌──────────┐     ┌──────────┐
    │ [EMPTY] │   │ [EMPTY] │    │ [EMPTY] │     │ [EMPTY] │
    │         │   │         │    │         │     │         │
    │  6 Slot  ▲   │  6 Slot  ▲    │  6 Slot  ▲      │  6 Slot  ▲
    │ Donors   │   │ Donors   │    │ Donors   │      │ Donors   │
    │ Collect  │   │ Collect  │    │ Collect  │      │ Collect  │
    │         │   │         │    │         │      │         │
    └──────────┘   └──────────┘    └──────────┘     └──────────┘
         │              │              │                │
         │ FULL         │ FULL         │ FULL           │ FULL
         ▼              ▼              ▼                ▼
    ┌──────────┐   ┌──────────┐    ┌──────────┐     ┌──────────┐
    │DISTRIBUTE│   │DISTRIBUTE│    │DISTRIBUTE│     │DISTRIBUTE│
    │          │   │          │    │          │     │          │
    │Pick From │   │Pick From │    │Pick From │     │Pick From │
    │Rank 2    │   │Rank 3    │    │Rank 4    │     │Rank 8    │
    │Queue     │   │Queue     │    │Queue     │     │Queue     │
    │          │   │          │    │          │     │          │
    │50% to    │   │50% to    │    │50% to    │     │50% to    │
    │Receiver  │   │Receiver  │    │Receiver  │     │Receiver  │
    │          │   │          │    │          │     │          │
    │Ex-Donor→ │   │Ex-Donor→ │    │Ex-Donor→ │     │Ex-Donor→ │
    │Rank 2 Q  │   │Rank 3 Q  │    │Rank 4 Q  │     │BLOCKED!  │
    │          │   │          │    │          │     │isRank8   │
    │Rank 1    │   │Rank 2    │    │Rank 3    │     │Complete  │
    │RESET ✅  │   │RESET ✅  │    │RESET ✅  │     │RESET ✅  │
    │[EMPTY]   │   │[EMPTY]   │    │[EMPTY]   │     │[EMPTY]   │
    │          │   │          │    │          │     │          │
    │Queue: 6  │   │Queue: 6  │    │Queue: 6  │     │Queue: 5  │
    │1st→Rank2 │   │1st→Rank3 │    │1st→Rank4 │     │1st→DONE! │
    │2nd→Rank2 │   │2nd→Rank3 │    │2nd→Rank4 │     │2nd→DONE! │
    │...       │   │...       │    │...       │     │...       │
    │6th→Rank2 │   │6th→Rank3 │    │6th→Rank4 │     │6th→DONE! │
    │          │   │          │    │          │     │          │
    └──────────┘   └──────────┘    └──────────┘     └──────────┘
         │              │              │                │
         │ User 1→6 from│ User 1→6 from │ User 1→6 from  │ STREAM
         │ Rank 1 wait  │ Rank 2 wait  │ Rank 3 wait    │ COMPLETE!
         │ In Rank 2Q   │ In Rank 3Q   │ In Rank 4Q     │
         └──────────────┴──────────────┴────────────────┘
                        │
                        │ Cycle repeats
                        ▼
         STREAM A RANK 1-8 COMPLETE ✅
         user.isRank8Completed_StreamA = true
         Can continue to STREAM B (if Level 8)
         Blocked from Rank 8 queue in Stream A


┌────────────────────────────────────────────────────────────────────────────┐
│                    STREAM B FULL PROGRESSION (8 Ranks)                      │
└────────────────────────────────────────────────────────────────────────────┘

              STREAM B: Level 8 Entry (0.0936 opBNB)
              INDEPENDENT from Stream A! ✅
              
    Rank 1           Rank 2           Rank 3    ...    Rank 8
  [CYCLE 1]       [CYCLE 2]        [CYCLE 3]        [CYCLE 8]
  
    [Same flow as Stream A, but with]
    [separate rankdonors, waitingQueue]
    [isRank8Completed_StreamB flag]
```

---

## STATE MACHINE 3: Queue Position Progression

```
┌────────────────────────────────────────────────────────────────────────────┐
│               WAITING QUEUE POSITION & AUTO-PROMOTION                      │
└────────────────────────────────────────────────────────────────────────────┘

Initial Queue (after Rank N distribution):
┌──────────────────────────────────────────────────────────────┐
│  Queue[Rank N]                                               │
├──────────────────────────────────────────────────────────────┤
│ [0] 0xAAA → Position #1 (Next receiver)                      │
│ [1] 0xBBB → Position #2                                      │
│ [2] 0xCCC → Position #3                                      │
│ [3] 0xDDD → Position #4                                      │
│ [4] 0xEEE → Position #5                                      │
│ [5] 0xFFF → Position #6                                      │
│ [6] 0xGGG → Position #7 (from prev donors)                   │
│ [7] 0xHHH → Position #8                                      │
└──────────────────────────────────────────────────────────────┘

When Rank N full again (new cycle):

Event: _processFullRank() triggered
    │
    ├─ Pick receiver: 0xAAA (from queue[0])
    ├─ Remove from queue: [0] = removed
    │
    └─ Queue shifts automatically:
    
┌──────────────────────────────────────────────────────────────┐
│  Queue[Rank N] AFTER REMOVAL                                │
├──────────────────────────────────────────────────────────────┤
│ [0] 0xBBB → Position #1 (NEW next receiver) ✅              │
│ [1] 0xCCC → Position #2 (moved up from #3)                  │
│ [2] 0xDDD → Position #3                                      │
│ [3] 0xEEE → Position #4                                      │
│ [4] 0xFFF → Position #5                                      │
│ [5] 0xGGG → Position #6 (moved up from #7)                  │
│ [6] 0xHHH → Position #7                                      │
│ [7] NEW_DONOR1 → Position #8 (from Rank N donors)           │
│ [8] NEW_DONOR2 → Position #9                                │
│ ...                                                          │
└──────────────────────────────────────────────────────────────┘

Process repeats for Rank N+1:
    
    0xBBB → Promoted to Rank N+1 (auto-promotion via _autoPromote)
    │
    ├─ Funds from promotion pool used
    ├─ Becomes first donor in Rank N+1
    ├─ Can donate again to Rank N (back to queue)
    │
    └─ If Rank N+1 = Rank 8:
       └─ Mark: isRank8Completed_StreamX[0xBBB] = true
          (Block from further queue participation in this stream)


EXAMPLE POSITION QUERY:
    
User 0xDDD calls: getWaitingQueuePosition(rank=5, user=0xDDD, stream=A)
    │
    └─ Return: position = 2 (0-based index in queue array)
       Display: "You are #3 in queue"
       
When 0xBBB removed next cycle:
User 0xDDD calls: getWaitingQueuePosition(rank=5, user=0xDDD, stream=A)
    │
    └─ Return: position = 1 (moved up!)
       Display: "You are #2 in queue" (promoted by 1 spot)

```

---

## STATE MACHINE 4: Donor Status Transitions

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    DONOR STATUS PROGRESSION (Per Stream)                    │
└────────────────────────────────────────────────────────────────────────────┘

                          START (User Level 1)
                                  │
                                  │ Upgrade to Level 4
                                  ▼
                    ┌─────────────────────────┐
                    │ ENTER STREAM A (0.0081) │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┏━━━━━━━━━━━━━━━━━━━━━━━┓
                    ┃ isDonor_StreamA = true ┃ ← Status 1
                    ┃ (Eligible for Queue)   ┃
                    ┗━━━━━━━━━━━━━━━━━━━━━━━┛
                                  │
                                  │ Manual join queue OR
                                  │ Auto-promotion from receiver
                                  ▼
                    ┏━━━━━━━━━━━━━━━━━━━━━━━┓
                    ┃ inWaitingQueue[5] =    ┃ ← Status 2
                    ┃ true (Rank 5 for A)    ┃
                    ┗━━━━━━━━━━━━━━━━━━━━━━━┛
                                  │
                                  │ Picked as receiver
                                  │ from queue
                                  ▼
                    ┏━━━━━━━━━━━━━━━━━━━━━━━┓
                    ┃ isReceiver_StreamA =   ┃ ← Status 3
                    ┃ true (Get 50% funds)   ┃
                    ┗━━━━━━━━━━━━━━━━━━━━━━━┛
                                  │
                    ┌─────────────┴──────────────────┐
                    │                                │
              If Rank 5-7               If Rank 8 (Final)
              │                                │
              ▼                                ▼
         ┏──────────────┐          ┏───────────────────────┓
         │ AUTO-PROMOTE │          │ RANK 8 COMPLETION     │
         │ to Rank 6    │          │ (Final rank)          │
         │ (from pool)  │          └───────────────────────┘
         └──────────────┘                   │
              │                             ▼
              │                  ┏──────────────────────┓
              │                  ┃isRank8Completed_    ┃ ← Status 4
              │                  ┃ StreamA = true      ┃ (FINAL)
              │                  ┗──────────────────────┘
              │                             │
              │                  ┌──────────┴─────────┐
              │                  │                    │
              │           Can promote   BLOCKED from
              │           to Stream B   further queue
              │           (if Level 8)  in Stream A
              │                  │                    │
              │                  │                    │
         Cycle 1→2→3→4→5→6→7→8   │        (Can only
         (Back to status 1         │         receive income)
          for Rank 6, etc)         │
                                   ▼
                        ┌──────────────────────┐
                        │ STREAM A COMPLETE    │
                        │ Can move to B        │
                        │ (Must be Level 8+)   │
                        └──────────────────────┘
                                   │
                   (Repeat same flow for Stream B with)
                   (isRank8Completed_StreamB flag)


Legend:
━━━ = Final state (cannot change)
─── = Intermediate state (can change)
┃   = Eligible status marker
```

---

## STATE MACHINE 5: Complete Cycle Timeline

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      COMPLETE DONATION CYCLE (One Rank)                    │
└────────────────────────────────────────────────────────────────────────────┘

Time    Event Description          Smart Contract      Frontend       Visual
────────────────────────────────────────────────────────────────────────────

T=0     Initial State              donors: []          [Empty]        🔵🔵
        Ready to receive           queue: []           No queue       🔵🔵
                                                                      🔵🔵

T=1     User 1 donates             donors: [1]         Update         🟠🔵
        (0.0081 opBNB)             queue: []           slots          🔵🔵
                                                       Counter: 1/6   🔵🔵

T=2-4   Users 2-5 donate           donors: [1-5]       Populate       🟠🟠
        (Each 0.0081 opBNB)        queue: []           more slots     🟠🟠
                                                       Counter: 5/6   🔵🔵

T=5     User 6 donates             donors: [1-6]       FULL!          🟠🟠
        RANK FULL! (6/6)           queue: []           Gold glow      🟠🟠
                                                       "Full" text    🟠🟠
                                                       Counter: 6/6

T=6     _processFullRank()         Processing...       ⏳ Loading      🟠🟠
        triggered                                      Events...      🟠🟠
                                                                      🟠🟠

T=7     Pick receiver              receivers: []       Show center    🟠🟠
        from queue                 (or new)            GREEN circle   🟠🟠
                                                       with avatar    🟠🟠

T=8     Transfer 50% to            isReceiver: true    Update total   🟠🟠
        receiver                   funds: 50%          income         🟠🟠
                                                                      🟠🟠

T=9     Emit events:               Events:             Refetch data   🔄
        -DonationReceived           ✓ Donated           from contract  🔄
        -ReceiverStatusUpdated      ✓ Received
        -WaitingQueueJoined ×6      ✓ Joined queue

T=10    PUSH donors → queue        donors: still [1-6] Preparing      🟠🟠
        (before delete)            queue: [1-6]        animation      🟠🟠
                                                       (color change) 🟠🟠

T=11    DELETE donors array        donors: []          Slot colors    🔵🔵
        RESET totalFunds=0         queue: [1-6]        change:        🔵🔵
        Preserve queue             totalFunds: 0       Orange→Blue    🔵🔵

T=12    Emit RankCycleCompleted    Event: Complete     Display queue  🔵🔵
        Rank reset finished        cycleNumber++       avatars        🔵🔵
                                                       Update counter 🔵🔵
                                                       0/6            🔵🔵

T=13    Frontend refetch           New state:          Queue shows    🔵🔵
        from contract              donors: []          6 ex-donors    🔵🔵
                                   queue: [1-6]        with positions🔵🔵

T=14    State ready for            donors: []          Ready for      🔵🔵
        next donors                queue: [1-6]        new donors     🔵🔵
                                                       Visual: BLUE   🔵🔵

T=15    User 7 donates             donors: [7]         Slot 1: filled 🟠🔵
        (new cycle starts)         queue: [1-6]        Color: orange  🔵🔵
                                                       Counter: 1/6   🔵🔵
        ...
        (Repeat for users 8-11)

T=20    All 6 slots full again     donors: [7-12]      FULL again!    🟠🟠
        (New cycle complete)       queue: [1-6+7-12]   Repeat T=6-15  🟠🟠
```

---

## STATE MACHINE 6: Stream Separation Guarantee

```
┌────────────────────────────────────────────────────────────────────────────┐
│              DUAL STREAM INDEPENDENCE (RACE CONDITION SAFE)                 │
└────────────────────────────────────────────────────────────────────────────┘

Scenario: Two users simultaneously:
  User A: Stream A Rank 1 (0.0081)
  User B: Stream B Rank 1 (0.0936)

INDEPENDENT STORAGE:

    mapping(uint8 => Rank) ranks_StreamA;
    │
    ├─ ranks_StreamA[1].donors = [UserA1, UserA2, ...]
    ├─ ranks_StreamA[1].queue = [...]
    ├─ ranks_StreamA[1].totalFunds
    │
    └─ NO INTERACTION WITH ranks_StreamB[1]

    mapping(uint8 => Rank) ranks_StreamB;
    │
    ├─ ranks_StreamB[1].donors = [UserB1, UserB2, ...]
    ├─ ranks_StreamB[1].queue = [...]
    ├─ ranks_StreamB[1].totalFunds
    │
    └─ NO INTERACTION WITH ranks_StreamA[1]

    mapping(address => bool) isDonor_StreamA;
    │
    ├─ isDonor_StreamA[UserA1] = true
    ├─ isDonor_StreamA[UserB1] = false (different stream!)
    │
    └─ INDEPENDENT from isDonor_StreamB

    mapping(address => bool) isDonor_StreamB;
    │
    ├─ isDonor_StreamB[UserA1] = false (different stream!)
    ├─ isDonor_StreamB[UserB1] = true
    │
    └─ User can be donor in BOTH streams simultaneously!

CONCURRENT PROCESSING:

Time  Stream A                    Stream B
────  ──────────────────────────  ──────────────────────
T=0   UserA6 donates              UserB6 donates
      donors_A[1] = [A1-A6]       donors_B[1] = [B1-B6]
      
T=1   _processFullRank(A)         _processFullRank(B)
      (THREAD 1)                  (THREAD 2)
      
T=2   Emit A events              Emit B events
      queue_A[1] += A1-A6        queue_B[1] += B1-B6
      reset_A[1]                 reset_B[1]
      
T=3   donors_A[1] = []           donors_B[1] = []
      (independent!)             (independent!)
      
T=4   Frontend refetch A         Frontend refetch B
      Queue_A shows [A1-A6]       Queue_B shows [B1-B6]
      Slots_A = BLUE             Slots_B = BLUE
      (NO MIXING!) ✅            (NO MIXING!) ✅

VALIDATION:
✓ Stream A and Stream B use completely separate data structures
✓ No shared state between streams
✓ Each stream has independent donors array
✓ Each stream has independent waiting queue
✓ No possibility of donor mixing
✓ Frontend can display both independently
✓ Race conditions impossible (different storage locations)
```

---

## 📊 SUMMARY TABLE

| State | Slot Color | Donors | Queue | Status | Next |
|-------|-----------|--------|-------|--------|------|
| **EMPTY** | 🔵 Blue | 0/6 | - | Collecting | Filling |
| **FILLING** | 🟠 Orange | 1-5/6 | - | In progress | Filling |
| **FULL** | 🟡 Gold | 6/6 | - | Ready dist | Distributing |
| **DISTRIBUTING** | 🟠 Orange | 6/6 | Growing | Processing | Resetting |
| **RESET** | 🔵 Blue | 0/6 | 6+ | Complete | Collecting |
| **NEXT CYCLE** | 🟠 Orange | 1+/6 | 6+ | New donors | Filling |

---

**All States Verified ✅**
**No Mixing Between Streams ✅**
**Slot Color Changes Correct ✅**
**Cycle Repeats Properly ✅**
