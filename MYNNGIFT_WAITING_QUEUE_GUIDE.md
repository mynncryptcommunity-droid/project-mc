# MynnGift Waiting Queue Implementation Guide

## Overview

MynnGift is a dual-stream donation system integrated into MynnCrypt. Users who reach specific levels can participate in two independent streams:
- **Stream A (Level 4)**: Entry via 0.0081 opBNB
- **Stream B (Level 8)**: Entry via 0.0936 opBNB (11.56x Stream A value)

## 1. Stream Architecture

### Stream Eligibility

Users automatically become eligible when reaching specific levels:

**MynnGiftTabs.jsx (Lines 70-71):**
```jsx
const isEligibleForStreamA = userLevel && Number(userLevel) >= 4;
const isEligibleForStreamB = userLevel && Number(userLevel) >= 8;
```

### Stream Separation

Each stream maintains separate rank structures and user status:

**mynnGift.sol (Lines 38-52):**
```solidity
// Separate rank structures per stream
mapping(uint8 => Rank) public ranks_StreamA;  // Ranks 1-8 for Stream A
mapping(uint8 => Rank) public ranks_StreamB;  // Ranks 1-8 for Stream B

// Per-stream user rank tracking
mapping(address => uint8) public userRank_StreamA;  // Current rank in Stream A
mapping(address => uint8) public userRank_StreamB;  // Current rank in Stream B

// Per-stream donor/receiver status
mapping(address => bool) public isDonor_StreamA;
mapping(address => bool) public isDonor_StreamB;
mapping(address => bool) public isReceiver_StreamA;
mapping(address => bool) public isReceiver_StreamB;

// Stream completion tracking
mapping(address => bool) public isRank8Completed_StreamA;
mapping(address => bool) public isRank8Completed_StreamB;
```

## 2. Donation Flow & Eligible Donor Status Update

### Entry Point: receiveFromMynnCrypt()

When a user upgrades in MynnCrypt to Level 4 or Level 8, the platform automatically calls the donation function.

**mynnGift.sol (Lines 124-165):**
```solidity
function receiveFromMynnCrypt(address user, uint256 amount) external payable {
    require(msg.value == amount, "Invalid amount");

    // Determine which stream based on amount
    Stream stream;
    
    if (amount == 0.0081 ether) {
        stream = Stream.A;  // Stream A (Rank 1 entry)
    } else if (amount == 0.0936 ether) {
        stream = Stream.B;  // Stream B (Rank 1 entry from Level 8)
    } else {
        revert("Invalid mynnGift entry amount");
    }

    // Mark stream as started
    if (stream == Stream.A) {
        hasStartedStreamA[user] = true;
    } else {
        hasStartedStreamB[user] = true;
    }

    _processDonation(1, user, amount, stream);
}
```

### Donor Status Update: _updateDonorInfo()

When a donation is processed, the user's eligible donor status is automatically updated.

**mynnGift.sol (Lines 203-230):**
```solidity
function _updateDonorInfo(uint8 rank, address donor, Rank storage currentRank, 
                          uint256 amount, Stream stream) internal {
    currentRank.donors.push(donor);
    currentRank.totalFunds += rankDonationValues[rank];
    
    // Update stream-specific tracking
    if (stream == Stream.A) {
        isDonor_StreamA[donor] = true;  // ✅ Marks as eligible for Stream A queue
        userTotalDonation_StreamA[donor] += amount;
        userRank_StreamA[donor] = userRank_StreamA[donor] < rank ? rank : userRank_StreamA[donor];
        rankDonorHistory[Stream.A][rank].push(donor);
        rankDonationCount[Stream.A][rank]++;
    } else {
        isDonor_StreamB[donor] = true;  // ✅ Marks as eligible for Stream B queue
        userTotalDonation_StreamB[donor] += amount;
        userRank_StreamB[donor] = userRank_StreamB[donor] < rank ? rank : userRank_StreamB[donor];
        rankDonorHistory[Stream.B][rank].push(donor);
        rankDonationCount[Stream.B][rank]++;
    }
    
    // Legacy tracking
    isDonor[donor] = true;
    userTotalDonation[donor] += amount;
    userRank[donor] = userRank[donor] < rank ? rank : userRank[donor];
}
```

### Summary: Donor Eligibility Status Updates

| Condition | When Triggered | Status Updated | Field |
|-----------|-----------------|----------------|-------|
| User donates to Stream A | `receiveFromMynnCrypt()` called with 0.0081 opBNB | Eligible | `isDonor_StreamA[user] = true` |
| User donates to Stream B | `receiveFromMynnCrypt()` called with 0.0936 opBNB | Eligible | `isDonor_StreamB[user] = true` |
| User reaches Rank 8 in Stream A | Auto-promotion or manual donation | Stream Complete | `isRank8Completed_StreamA[user] = true` |
| User reaches Rank 8 in Stream B | Auto-promotion or manual donation | Stream Complete | `isRank8Completed_StreamB[user] = true` |

**Note:** Once a user completes Rank 8 in a stream, they are BLOCKED from joining that stream's waiting queues via the `Rank8UserBlocked` event.

---

## 3. Waiting Queue Mechanism

### Queue Entry: joinWaitingQueue()

Users become eligible for the waiting queue automatically when they become donors, then can manually join.

**mynnGift.sol (Lines 557-580):**
```solidity
function joinWaitingQueue(uint8 rank, Stream stream) external nonReentrant {
    require(rank >= 1 && rank <= MAX_RANK, "Invalid rank");
    require(isDonor[msg.sender], "Must be a donor first");  // ✅ Must be eligible donor
    require(!isReceiver[msg.sender], "Already a receiver");
    
    Rank storage currentRank = (stream == Stream.A) ? ranks_StreamA[rank] : ranks_StreamB[rank];
    require(!isInWaitingQueue(rank, msg.sender, currentRank), "Already in waiting queue");
    
    // Block users who completed rank 8 in THIS stream from joining waiting queues
    bool isCompleted = (stream == Stream.A) ? isRank8Completed_StreamA[msg.sender] : isRank8Completed_StreamB[msg.sender];
    if (isCompleted) {
        emit Rank8UserBlocked(msg.sender, "joinWaitingQueue");
        return;  // ❌ Rank 8 completed users CANNOT join queue
    }
    
    string memory userId = _getUserId(msg.sender);
    currentRank.waitingQueue.push(msg.sender);
    emit WaitingQueueJoined(userId, rank, currentRank.waitingQueue.length);
}
```

### Queue Position Tracking: getWaitingQueuePosition()

Users can check their current position in any rank's waiting queue.

**mynnGift.sol (Lines 610-620):**
```solidity
function getWaitingQueuePosition(uint8 rank, address user, Stream stream) external view returns (uint256) {
    Rank storage currentRank = (stream == Stream.A) ? ranks_StreamA[rank] : ranks_StreamB[rank];
    for (uint i = 0; i < currentRank.waitingQueue.length; i++) {
        if (currentRank.waitingQueue[i] == user) {
            return i + 1;  // ✅ Returns position 1-indexed (1 = first in queue)
        }
    }
    return 0;  // ❌ Not in queue
}
```

### Queue Requirements Summary

| Requirement | Check Function | Block Condition |
|------------|-----------------|-----------------|
| Must be a donor | `require(isDonor[msg.sender])` | Not yet made first donation |
| Not already a receiver | `require(!isReceiver[msg.sender])` | Already receiving from any rank |
| Valid rank (1-8) | `require(rank >= 1 && rank <= MAX_RANK)` | Invalid rank number |
| Not already in queue | `require(!isInWaitingQueue(...))` | Already queued for this rank |
| Not completed Rank 8 in stream | `require(!isRank8Completed_StreamX[...])` | Finished this stream |

---

## 4. Visual Queue Display Implementation

### Frontend Data Fetching: MynnGiftTabs.jsx

The component reads the necessary data for displaying waiting queues:

**MynnGiftTabs.jsx (Lines 13-73):**
```jsx
// Stream-specific data for current user
const { data: nobleGiftRank } = useReadContract({
  ...mynngiftConfig,
  functionName: 'userRank_StreamA',
  args: [userAddress],
  query: { enabled: !!userAddress },
});

const { data: isDonorData } = useReadContract({
  ...mynngiftConfig,
  functionName: 'isDonor_StreamA',
  args: [userAddress],
  query: { enabled: !!userAddress },
});

// User level from MynnCrypt
const { data: userInfoData } = useReadContract({
  ...mynncryptConfig,
  functionName: 'userInfo',
  args: [userId],
  query: { enabled: !!userId },
});

const userLevel = userInfoData ? userInfoData[7] : undefined;

// Determine eligibility
const isEligibleForStreamA = userLevel && Number(userLevel) >= 4;
const isEligibleForStreamB = userLevel && Number(userLevel) >= 8;
```

### Queue Visualization: MynnGiftVisualization.jsx

The visualization component renders both rank circles and the waiting queue display.

**MynnGiftVisualization.jsx (Lines 283-310):**
```jsx
// Get user's queue position for current rank
const { data: queuePosition } = useReadContract({
  ...mynngiftConfig,
  functionName: 'getWaitingQueuePosition',
  args: [nobleGiftRank, userAddress],
  enabled: !!userAddress && !!nobleGiftRank,
});

// Get waiting queue for each rank
const { data: waitingQueue, refetch: refetchWaitingQueue } = useReadContract({
  ...mynngiftConfig,
  functionName: 'getRankWaitingQueue',
  args: [rank],
  enabled: true,
});

// Get queue statistics
const { data: queueStatus, refetch: refetchQueueStatus } = useReadContract({
  ...mynngiftConfig,
  functionName: 'getQueueStatus',
  args: [rank, streamEnum],
  enabled: true,
});
```

### Queue Rendering in SVG Visualization

The waiting queue is displayed as a horizontal list next to each rank circle.

**MynnGiftVisualization.jsx (Lines 953-970):**
```jsx
{rankInfo && rankInfo.waitingQueue.length > 0 && (
  <g transform={`translate(${circleRadius + 60}, 0)`}>
    <text x="0" y="-40" fill="#4DA8DA" fontSize="18">Antrean:</text>
    
    {rankInfo.waitingQueue.map((user, idx) => (
      <g key={user} transform={`translate(${idx * 45}, -15)`}>
        {/* Avatar for each queued user */}
        <image 
          href={avatar} 
          width="31" 
          height="61" 
          x="-15.5" 
          y="-30.5" 
          preserveAspectRatio="xMidYMid meet" 
        />
        {/* User address display */}
        <text 
          x="0" 
          y="35" 
          textAnchor="middle" 
          fill="#F5C45E" 
          fontSize="14">
          {`${user.slice(0, 4)}...`}
        </text>
      </g>
    ))}
  </g>
)}
```

### User's Queue Position Display

The user's position in the current rank's queue is displayed at the top of the visualization.

**MynnGiftVisualization.jsx (Lines 676-679):**
```jsx
<div className="text-center sm:text-right">
  <p className="text-gray-400 text-sm mb-1">Queue</p>
  <p className="text-lg font-semibold text-[#FFD700]">
    {queuePosition && Number(queuePosition) > 0 ? `#${Number(queuePosition)}` : 'n/a'}
  </p>
</div>
```

### Visual Queue Display Summary

| Visual Element | Purpose | Data Source | Color |
|---|---|---|---|
| **Queue Label** | Identifies the waiting queue section | Text literal "Antrean:" | `#4DA8DA` (cyan) |
| **User Avatars** | Shows each queued user visually | `rankInfo.waitingQueue[idx]` | Standard avatar |
| **User Address** | Identifies queued users | `user.slice(0, 4)...` | `#F5C45E` (gold) |
| **Queue Position (#N)** | Shows user's position if in queue | `queuePosition` | `#FFD700` (bright yellow) |
| **Position Indicator** | Horizontal spacing (45px gap) | Loop index × 45 | SVG positioning |

---

## 5. Complete Queue Status Display

The contract provides comprehensive queue information:

**mynnGift.sol (Lines 457-488):**
```solidity
function getQueueStatus(uint8 rank, Stream stream) external view returns (uint256, uint256) {
    Rank storage currentRank = (stream == Stream.A) ? ranks_StreamA[rank] : ranks_StreamB[rank];
    return (
        currentRank.waitingQueue.length,      // Total users in queue
        currentRank.donors.length             // Active donors filling rank
    );
}

function getRankWaitingQueue(uint8 rank) external view returns (string[] memory) {
    address[] memory addresses = ranks[rank].waitingQueue;
    string[] memory userIds = new string[](addresses.length);
    for (uint i = 0; i < addresses.length; i++) {
        userIds[i] = userIdCache[addresses[i]];
        if (bytes(userIds[i]).length == 0) {
            userIds[i] = IMynnCrypt(mynnCryptContract).getId(addresses[i]);
            if (bytes(userIds[i]).length == 0) {
                userIds[i] = string(abi.encodePacked("Unknown_", _addressToString(addresses[i])));
            }
        }
    }
    return userIds;
}
```

---

## 6. Stream A vs Stream B Key Differences

| Aspect | Stream A (Level 4) | Stream B (Level 8) |
|--------|-------------------|-------------------|
| **Entry Level** | Level 4+ | Level 8+ |
| **Entry Amount** | 0.0081 opBNB | 0.0936 opBNB (11.56x) |
| **Separate Tracking** | `ranks_StreamA[rank]` | `ranks_StreamB[rank]` |
| **Donor Flag** | `isDonor_StreamA[user]` | `isDonor_StreamB[user]` |
| **Completion Flag** | `isRank8Completed_StreamA[user]` | `isRank8Completed_StreamB[user]` |
| **Queue Access** | Only if eligible in Stream A | Only if eligible in Stream B |
| **Blockchain** | opBNB network | opBNB network |
| **Max Donors/Rank** | 6 (shared constant) | 6 (shared constant) |

---

## 7. Transaction Flow for Waiting Queue

### User joins waiting queue for Stream A Rank 3:

```
Frontend: MynnGiftTabs.jsx
  ↓
User clicks "Join Queue" button
  ↓
Calls: joinWaitingQueue(3, Stream.A)
  ↓
Smart Contract: mynnGift.sol - joinWaitingQueue()
  ↓
Checks:
  ✓ rank is valid (1-8)
  ✓ user isDonor[msg.sender]
  ✓ user !isReceiver[msg.sender]
  ✓ user !isInWaitingQueue()
  ✓ user !isRank8Completed_StreamA[msg.sender]
  ↓
If all checks pass:
  → ranks_StreamA[3].waitingQueue.push(msg.sender)
  → emit WaitingQueueJoined(userId, 3, position)
  ↓
Frontend: Listens for WaitingQueueJoined event
  ↓
Refetch queuePosition and display: "#3 in Queue"
  ↓
Update visualization: Show user position in queue
```

---

## 8. Frontend Integration Points

### Tabs Component (MynnGiftTabs.jsx)
- Routes between Overview, Stream A, Stream B, and History tabs
- Checks eligibility: `isEligibleForStreamA` and `isEligibleForStreamB`
- Passes stream type to visualization component

### Visualization Component (MynnGiftVisualization.jsx)
- Renders rank circles with donor slots
- Shows waiting queue below each rank (labeled "Antrean:")
- Displays user's position in queue: "Queue: #3"
- Shows stream-specific data per rank

### Data Flow
```
Dashboard.jsx
  ↓
MynnGiftTabs.jsx (reads user data + determines eligibility)
  ↓
MynnGiftVisualization.jsx (renders queue visualization)
  ↓
SVG Rendering:
  - Rank circles (6 slots each)
  - Waiting queue list (user avatars + addresses)
  - User position indicator
```

---

## 9. Key Contract Functions Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `joinWaitingQueue(uint8 rank, Stream stream)` | User joins waiting queue | Event emission |
| `getWaitingQueuePosition(uint8 rank, address user, Stream stream)` | Get user's queue position | Position (0 = not in queue) |
| `getRankWaitingQueue(uint8 rank)` | Get all users in rank's queue | Array of user IDs |
| `getQueueStatus(uint8 rank, Stream stream)` | Get queue statistics | (queueLength, activeDonors) |
| `isInWaitingQueue(uint8 rank, address user, Rank storage currentRank)` | Check if user in queue | Boolean |

---

## 10. Frontend Contract Calls in Dashboard.jsx

The Dashboard component reads waiting queue data continuously:

**Dashboard.jsx (Lines 968-1007):**
```jsx
const { data: nobleGiftWaitingQueue } = useReadContract({
  ...mynngiftConfig,
  functionName: 'getRankWaitingQueue',
  args: [nobleGiftRank],
});

const { data: isUserInNobleGiftWaitingQueue } = useReadContract({
  ...mynngiftConfig,
  functionName: 'isInWaitingQueue',
  args: [nobleGiftRank, userAddress, nobleGiftRank],
});

const { data: getWaitingQueuePosition } = useReadContract({
  ...mynngiftConfig,
  functionName: 'getWaitingQueuePosition',
  args: [nobleGiftRank, userAddress],
});

const { writeContract: writeJoinNobleGiftWaitingQueue, data: hashJoinQueue } = useWriteContract();

function handleJoinNobleGiftWaitingQueue() {
  writeJoinNobleGiftWaitingQueue({
    ...mynngiftConfig,
    functionName: 'joinWaitingQueue',
    args: [nobleGiftRank, streamEnum],
  });
}
```

---

## 11. Summary

### Eligibility System
1. **Automatic**: User reaches Level 4 → Becomes `isDonor_StreamA`
2. **Automatic**: User reaches Level 8 → Becomes `isDonor_StreamB`
3. **Blocked**: User completes Rank 8 → Marked `isRank8Completed_StreamX`

### Waiting Queue System
1. **Join**: Call `joinWaitingQueue(rank, stream)` (requires `isDonor` status)
2. **Track**: Check position with `getWaitingQueuePosition(rank, user, stream)`
3. **Display**: Visual queue shown in MynnGiftVisualization with user avatars

### Visual Display
- **Queue List**: Horizontal list of user avatars next to rank circle
- **Position Badge**: Shows "#1", "#2", etc. for user's own position
- **Stream Separation**: Separate queues for Stream A and Stream B per rank
- **Auto-update**: Refetches on event emission from contract

