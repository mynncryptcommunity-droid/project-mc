# Dashboard Level Disclaimer Integration Guide

## Overview
The level disclaimer message has been integrated into the dashboard tooltip system. This guide shows how to add the disclaimer display to your Dashboard component.

---

## Components & Configuration

### 1. **levelNamesConfig.js**
- Contains all 12 level definitions
- Export: `LEVEL_DISCLAIMER = "Level represents mining progression, not guaranteed outcomes."`

### 2. **dashboardTooltipsConfig.js**
- Contains all dashboard tooltips
- New export: `getLevelDisclaimer()` - Returns the disclaimer text
- Updated: `createDashboardTooltipProps()` - Marks disclaimers as critical priority

### 3. **LevelDisclaimerBanner.jsx**
- Reusable component to display the disclaimer
- Props:
  - `className` - Additional CSS classes
  - `position` - top/bottom (visual positioning)
  - `variant` - warning/info/neutral (styling)

---

## Implementation Steps

### Step 1: Import Components in Dashboard.jsx

```jsx
// Add imports at top of Dashboard.jsx
import LevelDisclaimerBanner from './LevelDisclaimerBanner';
import Tooltip from './Tooltip';
import { getLevelDisclaimer } from '../config/dashboardTooltipsConfig';
import { getLevelName, getLevelInfo } from '../config/levelNamesConfig';
```

### Step 2: Add Disclaimer Banner at Dashboard Top

Place this near the dashboard header or where you display the current level:

```jsx
{/* Level Disclaimer Banner */}
<div className="mb-6">
  <LevelDisclaimerBanner 
    variant="warning"
    className="mb-4"
  />
</div>
```

### Step 3: Display Current Level with Name & Icon

```jsx
{/* Current Level Display with Icon */}
<div className="flex items-center gap-3 mb-6">
  <div className="text-4xl">
    {getLevelInfo(userLevel)?.icon}
  </div>
  <div>
    <h2 className="text-2xl font-bold text-sfc-gold">
      {getLevelName(userLevel)}
    </h2>
    <p className="text-sm text-gray-400">
      Level {userLevel} of 12
    </p>
    <Tooltip 
      content={getLevelDisclaimer()}
      icon="ℹ️"
      position="bottom"
    />
  </div>
</div>
```

### Step 4: Add Disclaimer to Level Upgrade Section

When showing upgrade information:

```jsx
{/* Level Upgrade Section */}
<div className="mb-6">
  <h3 className="text-lg font-semibold text-sfc-cream mb-3">
    📈 Next Level: {getLevelName(userLevel + 1)}
  </h3>
  
  {/* Disclaimer before upgrade */}
  <LevelDisclaimerBanner 
    variant="info"
    className="mb-4"
  />
  
  {/* Upgrade details */}
  <div className="bg-sfc-dark-blue/50 p-4 rounded-lg border border-sfc-gold/30">
    <p className="text-sfc-cream/80">
      Cost: {upgradeCost} BNB
    </p>
    <p className="text-xs text-yellow-600 mt-2">
      ⚠️ {getLevelDisclaimer()}
    </p>
  </div>
</div>
```

### Step 5: Add Disclaimer to Queue Status Display

When showing queue position:

```jsx
{/* Queue Status with Disclaimer */}
<div className="mb-6">
  <h3 className="text-lg font-semibold text-sfc-cream mb-3">
    📍 Your Status
  </h3>
  
  <LevelDisclaimerBanner 
    variant="warning"
    className="mb-4"
  />
  
  <div className="grid grid-cols-3 gap-4">
    <div className="bg-green-900/20 p-3 rounded border border-green-600">
      <p className="text-xs text-green-400">Donated</p>
      <p className="text-lg font-bold text-green-300">✓</p>
    </div>
    <div className="bg-blue-900/20 p-3 rounded border border-blue-600">
      <p className="text-xs text-blue-400">In Queue</p>
      <p className="text-lg font-bold text-blue-300">{queuePosition}</p>
    </div>
    <div className="bg-yellow-900/20 p-3 rounded border border-yellow-600">
      <p className="text-xs text-yellow-400">Receiver</p>
      <p className="text-lg font-bold text-yellow-300">🎁</p>
    </div>
  </div>
</div>
```

### Step 6: Add Inline Disclaimers Throughout Dashboard

For any major section, add inline disclaimer:

```jsx
{/* Any Income Display */}
<div className="mb-6">
  <h3 className="text-lg font-semibold text-sfc-cream mb-3">
    💰 Income Breakdown
  </h3>
  
  {/* Inline disclaimer text */}
  <p className="text-xs text-yellow-600 mb-3 flex items-center gap-2">
    <span>⚠️</span>
    <span>{getLevelDisclaimer()}</span>
  </p>
  
  {/* Income details */}
  {/* ... income content ... */}
</div>
```

---

## Usage Examples

### Example 1: Dashboard Header Section
```jsx
export default function DashboardHeader({ userLevel }) {
  return (
    <div>
      {/* Main Disclaimer Banner */}
      <LevelDisclaimerBanner 
        variant="warning"
        className="mb-6"
      />
      
      {/* Level Info */}
      <div className="flex items-center gap-4 bg-sfc-dark-blue/50 p-6 rounded-lg border border-sfc-gold/20">
        <div className="text-5xl">
          {getLevelInfo(userLevel)?.icon}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-sfc-gold">
            {getLevelName(userLevel)}
          </h1>
          <p className="text-sm text-gray-400">
            Level {userLevel} of 12 - Mining Progression
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Dashboard Stats Section
```jsx
{/* Dashboard Stats with Disclaimers */}
<div className="grid grid-cols-3 gap-4 mb-6">
  <div className="bg-sfc-dark-blue/50 p-4 rounded border border-sfc-gold/30">
    <p className="text-xs text-gray-400">Current Level</p>
    <p className="text-2xl font-bold text-sfc-gold">
      {getLevelName(userLevel)}
    </p>
    <p className="text-xs text-yellow-600 mt-2">
      ⚠️ Progression only
    </p>
  </div>
  
  <div className="bg-sfc-dark-blue/50 p-4 rounded border border-sfc-gold/30">
    <p className="text-xs text-gray-400">Total Income</p>
    <p className="text-2xl font-bold text-sfc-gold">
      {userIncome} BNB
    </p>
    <p className="text-xs text-yellow-600 mt-2">
      ⚠️ Not guaranteed
    </p>
  </div>
  
  <div className="bg-sfc-dark-blue/50 p-4 rounded border border-sfc-gold/30">
    <p className="text-xs text-gray-400">Queue Position</p>
    <p className="text-2xl font-bold text-sfc-gold">
      #{queuePosition}
    </p>
    <p className="text-xs text-yellow-600 mt-2">
      ⚠️ Automatic only
    </p>
  </div>
</div>
```

---

## Styling Options

### Variant: Warning (Default)
```jsx
<LevelDisclaimerBanner variant="warning" />
// Yellow background, yellow left border, yellow text
```

### Variant: Info
```jsx
<LevelDisclaimerBanner variant="info" />
// Blue background, blue left border, blue text
```

### Variant: Neutral
```jsx
<LevelDisclaimerBanner variant="neutral" />
// Gray background, gray left border, gray text
```

### Custom Styling
```jsx
<LevelDisclaimerBanner 
  className="mt-4 mb-6"
  variant="warning"
/>
```

---

## Placement Strategy

**Recommended Placement in Dashboard:**

1. **Top Priority (Always Visible):**
   - Dashboard header (above fold)
   - Near current level display
   - Before upgrade button

2. **High Priority:**
   - Queue status section
   - Income breakdown section
   - Stream entry section

3. **Medium Priority:**
   - Team structure display
   - History sections
   - Settings/profile

4. **Optional:**
   - Tooltips (in-app help)
   - Modals
   - Expandable sections

---

## Text References

### Main Disclaimer
```
"Level represents mining progression, not guaranteed outcomes."
```

### Related Disclaimers (from config)
```
"Entry does not guarantee rewards or returns."
"These rewards are calculated automatically by the contract."
"No admin can change payouts or queue positions."
```

---

## Integration Checklist

- [ ] Import LevelDisclaimerBanner in Dashboard.jsx
- [ ] Import getLevelDisclaimer, getLevelName, getLevelInfo
- [ ] Add disclaimer banner at dashboard top
- [ ] Add level name & icon display with mining theme
- [ ] Add inline disclaimers in major sections
- [ ] Test on mobile (responsive)
- [ ] Test accessibility (contrast, readability)
- [ ] Verify positioning (not blocking content)
- [ ] Commit changes to GitHub
- [ ] Deploy to production

---

## Testing Checklist

- [ ] Disclaimer text displays correctly
- [ ] Icon (⚠️) renders properly
- [ ] Color variants (warning/info/neutral) work
- [ ] Responsive on mobile
- [ ] Text is readable against background
- [ ] Multiple disclaimers don't clutter UI
- [ ] Tooltips still work alongside disclaimers
- [ ] No console errors

---

## Best Practices

✅ **DO:**
- Include disclaimer at top of dashboard
- Repeat in key sections (level, upgrade, income)
- Use consistent emoji (⚠️)
- Ensure high contrast
- Position before action buttons
- Keep text consistent

❌ **DON'T:**
- Hide disclaimer in tooltips only
- Change the disclaimer text
- Make disclaimer optional/toggleable
- Place after critical information
- Use different wording in different places
- Reduce disclaimer prominence

---

## Deployment

```bash
# Add files
git add frontend/src/components/LevelDisclaimerBanner.jsx
git add frontend/src/config/dashboardTooltipsConfig.js  # (updated)

# Update Dashboard.jsx after integration
git add frontend/src/components/Dashboard.jsx

# Commit
git commit -m "Add level disclaimer banner to dashboard with mining theme integration"

# Push
git push origin main
```

---

## Support

**Question:** How often should I show the disclaimer?  
**Answer:** At least once at dashboard top, then 2-3 more times in key sections

**Question:** Can users dismiss the disclaimer?  
**Answer:** No. It should always be visible as a reminder

**Question:** Can I change the disclaimer text?  
**Answer:** Edit in levelNamesConfig.js, but keep message similar

**Question:** Will this affect performance?  
**Answer:** No. It's a lightweight component with no API calls

---

**Last Updated:** January 20, 2026  
**Status:** Ready for Dashboard Integration  
**Files:** 3 (LevelDisclaimerBanner.jsx, dashboardTooltipsConfig.js, levelNamesConfig.js)  
**Risk Level:** ZERO ✅
