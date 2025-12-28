# 🔧 NobleGift Menu - Code Structure & Files

## 📁 File Organization

```
mc_frontend/src/
├── components/
│   ├── Dashboard.jsx .......................... Main dashboard component
│   │   ├── Line 21: Import NobleGiftVisualization
│   │   ├── Line 3007: GiftIcon button (menu item)
│   │   ├── Line 2796: case 'noblegift': render logic
│   │   └── Line 866-901: Smart contract reads (rank, status, queue)
│   │
│   └── NobleGiftVisualization.jsx ........... NobleGift visualization component
│       ├── Line 1-100: Animated components (Coin, User, Queue)
│       ├── Line 120-250: Smart contract reads
│       ├── Line 300-500: Event listeners & data processing
│       ├── Line 600-700: SVG canvas rendering
│       └── Line 978: Recent events log
│
├── assets/
│   ├── bnb-gold.png .......................... Animated donation coin
│   ├── avatar.png ............................ User avatar
│   ├── promotion-rank-[1-8].png ............ Rank tier images
│   ├── platform.png .......................... Platform wallet icon
│   └── [other images]
│
└── hooks/
    └── [Potential custom hooks for noble gift]
```

---

## 🎯 Key Components Explained

### 1. **Dashboard.jsx** - Entry Point
```javascript
// Line 3007: Menu Button
<button
  onClick={() => { setActiveSection('noblegift'); setIsSidebarOpen(false); } }
  className="sidebar-item w-full flex items-center..."
>
  <GiftIcon className="w-6 h-6" />
  <span>NobleGift</span>
</button>

// Line 2796-2804: Render Logic
case 'noblegift':
  return (
    <NobleGiftVisualization
      mynngiftConfig={mynngiftConfig}
      userAddress={address}
      mynncryptUserId={userId}
    />
  );
```

### 2. **NobleGiftVisualization.jsx** - Main Component

#### A. Animated Components (Top-level)
```javascript
// Line 23-52: AnimatedCoin Component
// - Shows BNB coin animation from one position to another
// - Duration: 1000ms (1 second)
// - Used for donation flow visualization

// Line 55-90: AnimatedUserMovingIcon Component
// - Shows user avatar moving to promotion rank
// - Duration: 1500ms (1.5 seconds)
// - Shows wallet address label

// Line 93-125: AnimatedQueueUser Component
// - Shows user joining waiting queue
// - Fade in/out effect
// - Queue position indicator
```

#### B. Smart Contract Reads (Lines 140-250)
```javascript
// User's NobleGift Data
getUserRank(userAddress) - Current rank
getUserStatus(userAddress) - Active/Inactive status
getWaitingQueuePosition(rank, userAddress) - Queue position
getRankDonors(rank) - Donors in rank
getRankWaitingQueue(rank) - Queue members
getRankReceiverHistory(rank) - History of receivers
getRankTotalDonation(rank) - Total donations to rank
getRankIncomeDistribution(rank) - Income breakdown
```

#### C. Event Listeners (Lines 300-400)
```javascript
// Smart Contract Events
useWatchContractEvent({
  eventName: 'UserJoinedQueue',
  onLogs: (logs) => {
    // User joined queue - refetch queue data
    refetchWaitingQueue();
  }
})

useWatchContractEvent({
  eventName: 'PromotionBonusIssued',
  onLogs: (logs) => {
    // User promoted - refetch rank & status
    refetchRank();
    refetchStatus();
  }
})

useWatchContractEvent({
  eventName: 'ReceiverIncomeIssued',
  onLogs: (logs) => {
    // Income paid - add to events, update total
    addRecentEvent(logs);
    refetchTotalIncome();
  }
})
```

#### D. State Management (Lines 400-550)
```javascript
// Animation Queue
const [animationQueue, setAnimationQueue] = useState([]);
// Stores pending animations (coins, users moving)

// Recent Events Log
const [recentEvents, setRecentEvents] = useState([]);
// Stores recent smart contract events

// Current Rank State
const [currentRankState, setCurrentRankState] = useState(null);
// Stores rank data, donors, queue info

// Gas Subsidy Pool
const [gasSubsidyPool, setGasSubsidyPool] = useState(null);
// Tracks available gas subsidy
```

#### E. Rendering (Lines 600-1000)
```javascript
// Line 627: Main Container
<div className="noblegift-visualization-container bg-[#1A3A6A] p-6">
  <h2>Perjalanan NobleGift</h2>
  
  {/* User Status Summary */}
  <div className="user-status-summary">
    Current Rank: {nobleGiftRank}
    Status: {nobleGiftStatus ? 'Active' : 'Inactive'}
    Progress: {progressBar}
  </div>

  {/* SVG Visualization Canvas */}
  <svg className="visualization-canvas">
    {/* Render all 8 ranks with icons */}
    {ranks.map((rank) => (
      <RankVisualization
        rank={rank}
        donors={rankDonors[rank]}
        queue={rankQueue[rank]}
      />
    ))}
    
    {/* Render animated coins/users */}
    {animationQueue.map((anim) => (
      anim.type === 'coin' ? <AnimatedCoin /> : <AnimatedUserMovingIcon />
    ))}
  </svg>

  {/* Recent Events Log */}
  <div className="recent-events mt-8">
    {recentEvents.map((event) => (
      <EventItem event={event} />
    ))}
  </div>
</div>
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Smart Contract (MynnGift at 0x5FbDB2315678afecb...)      │
└──────────────┬──────────────────────────────────────────┘
               │
               ├─ getUserRank(address)
               ├─ getUserStatus(address)
               ├─ getRankDonors(rank)
               ├─ getRankWaitingQueue(rank)
               ├─ gasSubsidyPool
               └─ totalReceivers
               │
               ↓
┌─────────────────────────────────────────────────────────┐
│ NobleGiftVisualization.jsx                               │
│                                                         │
│ Reads Data: useReadContract hooks                       │
│ Listens Events: useWatchContractEvent                   │
│ Processes Data: Helper functions                        │
│ Manages State: useState for animations & events        │
└──────────────┬──────────────────────────────────────────┘
               │
               ├─ User Status Section
               ├─ Animated Visualization Canvas
               └─ Recent Events Log
               │
               ↓
┌─────────────────────────────────────────────────────────┐
│ User Interface (Beautiful SVG & React Components)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Smart Contract Integration

### Contract Configuration
```javascript
// From Dashboard.jsx
const mynngiftConfig = {
  address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  abi: MYNNGIFT_ABI, // Imported from contract
};

// Pass to NobleGiftVisualization
<NobleGiftVisualization mynngiftConfig={mynngiftConfig} />
```

### Function Calls in Component
```javascript
// Example: Get user's rank
const { data: nobleGiftRank } = useReadContract({
  ...mynngiftConfig,
  functionName: 'getUserRank',
  args: [userAddress],
  enabled: !!userAddress,
});

// Example: Listen for events
useWatchContractEvent({
  ...mynngiftConfig,
  eventName: 'PromotionBonusIssued',
  onLogs: (logs) => {
    // Handle event
    refetchNobleGiftRank();
  },
  enabled: !!userAddress,
});
```

---

## 🎨 Styling & CSS

### Tailwind Classes Used:
```javascript
// Container
className="noblegift-visualization-container bg-[#1A3A6A] p-6"
// → Blue background with padding

// Text
className="text-3xl font-bold text-[#F5C45E]"
// → Gold text, large, bold

// Cards
className="bg-[#102E50] rounded-lg border border-[#4DA8DA]/30"
// → Dark blue card with light blue border

// Animations
className="animate-bounce"
// → Bouncing animation for events
```

### Custom CSS (if needed):
```css
.spin-coin {
  animation: spin 1s linear infinite;
}

.animated-coin {
  filter: drop-shadow(0 0 5px #F5C45E);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 🔌 Props & Configuration

### NobleGiftVisualization Props:
```javascript
<NobleGiftVisualization
  mynngiftConfig={{
    address: string,
    abi: ABI_ARRAY
  }}
  userAddress={string} // Wallet address
  mynncryptUserId={string} // MynnCrypt user ID
/>
```

### Internal Configuration:
```javascript
// Rank colors
const rankColors = [
  '#FF6B6B', // Rank 1
  '#4ECDC4', // Rank 2
  '#45B7D1', // Rank 3
  // ... up to Rank 8
];

// Animation timing
const COIN_ANIMATION_DURATION = 1000;
const USER_ANIMATION_DURATION = 1500;
const QUEUE_ANIMATION_DURATION = 1000;

// Canvas size
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 2400;
```

---

## ⚙️ Key Functions

### Animation Functions:
```javascript
// Add animation to queue
const addAnimation = (animation) => {
  setAnimationQueue([...animationQueue, animation]);
};

// Remove animation when done
const removeAnimation = (animationId) => {
  setAnimationQueue(queue => 
    queue.filter(a => a.id !== animationId)
  );
};
```

### Event Processing:
```javascript
// Handle UserJoinedQueue event
const handleUserJoinedQueue = (event) => {
  const { user, rank } = event.args;
  
  // Add animation
  addAnimation({
    type: 'queue',
    user,
    rank
  });
  
  // Refetch data
  refetchWaitingQueue();
  
  // Add to events log
  addRecentEvent({
    type: 'UserJoinedQueue',
    user,
    rank,
    timestamp: Date.now()
  });
};
```

---

## 🐛 Debugging Tips

### Check Console Logs:
```javascript
console.log('User Rank:', nobleGiftRank);
console.log('Animation Queue:', animationQueue);
console.log('Recent Events:', recentEvents);
console.log('Contract Reads:', {
  status: nobleGiftStatus,
  rank: nobleGiftRank,
  queue: nobleGiftWaitingQueue
});
```

### Browser DevTools:
- **Network Tab:** Check contract calls
- **React DevTools:** Inspect component state
- **Console:** Look for contract errors
- **Performance Tab:** Check animation frame rate

---

## 🚀 Performance Tips

1. **Optimization:**
   - Memoize expensive calculations
   - Use useCallback for event handlers
   - Limit animation queue size

2. **Data Loading:**
   - Cache contract reads
   - Don't overfetch
   - Use selective refetch

3. **Rendering:**
   - SVG for vector graphics (scalable)
   - CSS animations for smoothness
   - RequestAnimationFrame for custom animations

---

## 📝 Code Checklist

- [ ] All imports present
- [ ] Contract config correct
- [ ] Event listeners enabled
- [ ] Animation states managed
- [ ] Recent events logged
- [ ] SVG canvas renders
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable

---

## 🎓 To Learn More

1. Check NobleGiftVisualization.jsx for full implementation
2. Review smart contract functions being called
3. Test event listeners with contract events
4. Monitor animation performance
5. Check responsive design on mobile

**Happy coding!** 🚀
