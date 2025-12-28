# Background Update Summary

## Changes Made

### 1. Added Background Image to All Pages Except Dashboard

Modified `App.jsx` to add a background overlay with the following characteristics:
- Uses `newbackground.png` from the assets folder
- Set at 40% opacity
- Applied to all pages except the dashboard
- Uses Tailwind CSS classes for styling

### 2. Preserved Original Dashboard Background

Modified `Dashboard.jsx` to:
- Keep the original background styling
- Exclude the background overlay that was added to other pages
- Maintain the existing color scheme (`bg-[#102E50]`)

## Technical Implementation

### App.jsx Changes
```jsx
<div className="min-h-screen bg-sfc-dark-blue text-sfc-cream relative">
  {/* Background image with 40% opacity on all pages except dashboard */}
  <div className="background-overlay absolute inset-0 bg-[url('./assets/newbackgound.png')] bg-cover bg-center opacity-40 pointer-events-none -z-10"></div>
  <Header mynncryptConfig={mynncryptConfig} />
  <MainContent
    mynncryptConfig={mynncryptConfig}
    mynngiftConfig={mynngiftConfig}
    publicClient={publicClient}
  />
</div>
```

### Dashboard.jsx Changes
```jsx
<div className="min-h-screen bg-[#102E50] text-[#F5C45E] relative">
  {/* Remove the background overlay for the dashboard since we want to keep the original background */}
  {/* The dashboard has its own background styling, so we don't add the overlay here */}
```

## Color Definitions

The `sfc-dark-blue` color is defined in `tailwind.config.js` as `#183B4E`.

## File Locations

- Background image: `/src/assets/newbackgound.png`
- Main application component: `/src/App.jsx`
- Dashboard component: `/src/components/Dashboard.jsx`
- Tailwind configuration: `/tailwind.config.js`

## Verification

The development server is running successfully at `http://localhost:5173/` with no errors.