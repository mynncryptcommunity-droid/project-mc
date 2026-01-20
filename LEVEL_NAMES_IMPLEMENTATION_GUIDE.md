# Level Names Implementation Guide - Mining Theme

## Overview
All 12 levels have been renamed from generic (Copper, Bronze, Silver) to a **mining progression theme** that represents progression through a mining operation hierarchy.

---

## 📊 Level Structure (Mining Theme)

| Level | Icon | Name | Meaning |
|-------|------|------|---------|
| 1 | ⛏️ | Prospect | Awal eksplorasi - Mining journey begins |
| 2 | 🧭 | Surveyor | Mapping & orientasi sistem - Understanding system structure |
| 3 | 🚜 | Excavator | Mulai menggali struktur - Deepening participation |
| 4 | 🛠️ | Driller | Akses ke layer lebih dalam - **Stream A Entry** |
| 5 | 🪨 | Extractor | Pengambilan resource - Resource extraction phase |
| 6 | ⚙️ | Processor | Pemrosesan data / resource - Processing & optimization |
| 7 | 🧪 | Refiner | Penyaringan & efisiensi - Refinement & efficiency |
| 8 | 🔥 | Smelter | Transformasi tahap lanjut - **Stream B Entry** |
| 9 | 📐 | Engineer | Kontrol sistem - System control & design |
| 10 | 🖥️ | Operator | Eksekusi & monitoring - Execution & monitoring |
| 11 | 🪖 | Foreman | Koordinasi & oversight - Coordination & oversight |
| 12 | 🏔️ | Master Miner | Full system mastery - Full system mastery & expertise |

---

## ⚠️ IMPORTANT DISCLAIMER

All level displays include this disclaimer:

**"Level represents mining progression, not guaranteed outcomes."**

This appears below every level badge to emphasize:
- ✅ Progression system is real
- ✅ Mining metaphor is just visual representation
- ❌ No guarantees of profit
- ❌ Entry doesn't guarantee returns

---

## 📁 Files Created

### 1. `levelNamesConfig.js`
**Location:** `/frontend/src/config/levelNamesConfig.js`

**Exports:**
```javascript
// Get level name
getLevelName(levelNumber)          // Returns: "Prospect", "Surveyor", etc.

// Get full level info
getLevelInfo(levelNumber)          // Returns: { name, icon, description, color, ... }

// Get level icon
getLevelIcon(levelNumber)          // Returns: "⛏️", "🧭", etc.

// Get level color
getLevelColor(levelNumber)         // Returns: "#8B7355", "#A0A080", etc.

// Get all levels in order
getAllLevelNames()                 // Returns: Array of all 12 levels

// Check if Stream A/B entry
isStreamA(levelNumber)             // Returns: true if Level 4
isStreamB(levelNumber)             // Returns: true if Level 8

// Get disclaimer
LEVEL_DISCLAIMER                   // Returns: warning text

// Create badge props
createLevelBadgeProps(levelNumber) // Returns: props object for component
```

### 2. `LevelBadge.jsx`
**Location:** `/frontend/src/components/LevelBadge.jsx`

**Props:**
```jsx
<LevelBadge 
  levelNumber={4}                    // Required: 1-12
  showIcon={true}                    // Optional: Show/hide icon
  showDisclaimer={true}              // Optional: Show/hide disclaimer
  size="medium"                      // Optional: small, medium, large
  variant="default"                  // Optional: default, solid, outline
/>
```

**Output:**
- Displays level with icon and name
- Shows Stream A/B badge if applicable
- Shows description text
- Shows disclaimer warning

---

## 🚀 Usage Examples

### Example 1: Display User's Current Level
```jsx
import LevelBadge from './LevelBadge';

export default function UserProfile({ userLevel }) {
  return (
    <div>
      <h2>Your Level</h2>
      <LevelBadge 
        levelNumber={userLevel}
        showDisclaimer={true}
      />
    </div>
  );
}
```

### Example 2: Display Level in Dashboard Header
```jsx
import { getLevelInfo, LEVEL_DISCLAIMER } from '../config/levelNamesConfig';

export default function DashboardHeader({ userLevel }) {
  const levelInfo = getLevelInfo(userLevel);

  return (
    <div>
      <h1>
        {levelInfo.icon} {levelInfo.name}
      </h1>
      <p className="text-sm text-gray-400">{levelInfo.description}</p>
      <p className="text-xs text-yellow-600 mt-2">⚠️ {LEVEL_DISCLAIMER}</p>
    </div>
  );
}
```

### Example 3: Display All Levels (Progression View)
```jsx
import { getAllLevelNames } from '../config/levelNamesConfig';

export default function LevelProgression() {
  const allLevels = getAllLevelNames();

  return (
    <div className="grid grid-cols-4 gap-4">
      {allLevels.map(level => (
        <div key={level.number} className="p-3 border rounded">
          <span className="text-2xl">{level.icon}</span>
          <p className="font-semibold">{level.name}</p>
          <p className="text-xs text-gray-400">{level.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Check Stream Entry Points
```jsx
import { isStreamA, isStreamB } from '../config/levelNamesConfig';

export default function StreamSelector() {
  const streamAEntry = 4;
  const streamBEntry = 8;

  return (
    <div>
      {isStreamA(streamAEntry) && <p>✓ Stream A available</p>}
      {isStreamB(streamBEntry) && <p>✓ Stream B available</p>}
    </div>
  );
}
```

---

## 🎨 Visual Properties

### Level Colors (Mining Theme)
Each level has a specific color for visual hierarchy:

- **Level 1-3 (Early):** Earth tones (brown/tan)
- **Level 4-7 (Mid):** Warm tones (orange/gold)
- **Level 8-12 (Advanced):** Golden/premium tones

### Icons (Semantic Meanings)
Each icon represents a stage in mining progression:

- ⛏️ **Prospect** - Starting tools
- 🧭 **Surveyor** - Orientation/navigation
- 🚜 **Excavator** - Heavy machinery
- 🛠️ **Driller** - Precision tools
- 🪨 **Extractor** - Resource gathering
- ⚙️ **Processor** - Mechanical processing
- 🧪 **Refiner** - Purification/filtering
- 🔥 **Smelter** - Heat/transformation
- 📐 **Engineer** - Design/control
- 🖥️ **Operator** - System operation
- 🪖 **Foreman** - Authority/supervision
- 🏔️ **Master Miner** - Peak/mastery

---

## 📝 Disclaimer Text

The disclaimer appears with every level display:

**"Level represents mining progression, not guaranteed outcomes."**

This reminds users:
- Mining metaphor is visual representation only
- System progression is real, but outcomes aren't guaranteed
- No financial promises implied
- Educational representation of the system

---

## 🔧 Integration Points

### Where to Use LevelBadge Component:

1. **Dashboard.jsx**
   - Show current user level
   - Display in header
   - Show in level upgrade section

2. **Register.jsx**
   - Show available levels for new users
   - Display progression path

3. **HowItWorks.jsx**
   - Show all 12 levels in progression view
   - Explain level advancement

4. **TeamMatrix.jsx / TeamTree.jsx**
   - Show team member levels
   - Display hierarchy visually

5. **Upgrade Modal**
   - Show current level and next level
   - Display cost and benefits

---

## 💡 Best Practices

### DO ✅
- ✅ Always include disclaimer when showing levels to new users
- ✅ Use icons consistently throughout the app
- ✅ Show Stream A/B badges for Level 4 and 8
- ✅ Use getLevelInfo() for consistent data access
- ✅ Display description text to explain progression

### DON'T ❌
- ❌ Don't change level numbers (1-12 hardcoded in contract)
- ❌ Don't remove icons (they're part of the visual hierarchy)
- ❌ Don't forget the disclaimer (important for user education)
- ❌ Don't change Stream A/B entry levels (tied to costs)
- ❌ Don't hardcode level names (use config instead)

---

## 🧪 Testing Checklist

- [ ] All 12 levels display correctly with icons
- [ ] Colors are consistent and visible
- [ ] Disclaimer appears when expected
- [ ] Stream A/B badges show for Level 4 & 8
- [ ] getLevelName() returns correct names
- [ ] getLevelIcon() returns correct icons
- [ ] isStreamA(4) and isStreamB(8) return true
- [ ] LevelBadge component renders without errors
- [ ] Responsive on mobile (icons scale properly)
- [ ] Text colors contrast well with background

---

## 📞 Support & Troubleshooting

**Q: How do I change a level name?**
A: Edit `levelNamesConfig.js`, change the name property, redeploy frontend.

**Q: Will changing names affect smart contract?**
A: No. Contract uses numeric IDs only. Names are frontend display only.

**Q: Can users see these changes immediately?**
A: Yes. After deployment, clear browser cache (Cmd+Shift+R) to see new names.

**Q: What if I want different icons?**
A: Change emoji in `levelNamesConfig.js`. All UI automatically updates.

---

## 🚀 Deployment

1. **Files to commit:**
   ```bash
   frontend/src/config/levelNamesConfig.js
   frontend/src/components/LevelBadge.jsx
   ```

2. **Update existing components** to use new config:
   ```bash
   frontend/src/components/Dashboard.jsx
   frontend/src/components/Register.jsx
   frontend/src/components/HowItWorks.jsx
   ```

3. **Push to GitHub:**
   ```bash
   git add frontend/src/config/levelNamesConfig.js
   git add frontend/src/components/LevelBadge.jsx
   git commit -m "Add mining theme level names and LevelBadge component"
   git push origin main
   ```

4. **Vercel auto-deploys** - Changes live in production immediately

---

**Last Updated:** January 20, 2026  
**Status:** Ready for Implementation  
**Risk Level:** ZERO (frontend-only changes)  
**Smart Contract Impact:** NONE ✅
