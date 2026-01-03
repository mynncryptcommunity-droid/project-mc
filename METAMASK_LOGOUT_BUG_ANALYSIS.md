# 🔴 MetaMask Logout Bug Analysis - Tree View Menu Click

## 🎯 Problem Description
Saat user membuka menu "Tree View" (atau menu sidebar lainnya), MetaMask tiba-tiba logout dan meminta connect lagi.

## 🔍 Root Cause Analysis

### **Ditemukan 3 Masalah Utama:**

### 1. **Sidebar Overlay Mengganggu MetaMask Dialog**
**File**: `frontend/src/components/Dashboard.jsx` (Line 313-317)

```jsx
{isSidebarOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
    onClick={() => setIsSidebarOpen(false)}  // ❌ PROBLEM!
  />
)}
```

**Masalah:**
- Overlay dengan `z-40` berada di bawah modal MetaMask (biasanya `z-1000`)
- Saat user mengklik menu item yang membuka wallet dialog, click event bisa tertangkap overlay
- Overlay `onClick` handler bisa trigger closing action yang tidak diinginkan

### 2. **Pointer Events Tidak Diatur dengan Benar**
**File**: `frontend/src/pages/dashboardadmin.jsx` (Line 338)

```jsx
style={
  typeof window !== 'undefined' && window.innerWidth < 768
    ? { pointerEvents: isSidebarOpen ? 'auto' : 'none' }  // ⚠️ TIMING ISSUE
    : { pointerEvents: 'auto' }
}
```

**Masalah:**
- `pointerEvents` hanya dikontrol pada sidebar saat mobile
- Overlay backdrop TIDAK punya `pointerEvents: none` saat tidak digunakan
- Bisa memblok interaksi MetaMask dialog

### 3. **Event Propagation dari Menu Item ke Overlay**
**File**: `frontend/src/components/Dashboard.jsx` (Line 3094-3100)

```jsx
<button
  onClick={() => { setActiveSection('treeview'); setIsSidebarOpen(false); } }
  className={...}
>
  <TreeView .../>
</button>
```

**Masalah:**
- Saat sidebar dibuka dan user klik menu item
- Click event trigger `setIsSidebarOpen(false)` 
- Tapi overlay masih ada dan mungkin intercept MetaMask popup

## 📊 Skenario Bug Step-by-Step

```
1. User di Dashboard
2. User klik "Tree View" menu button
3. Sidebar toggle buka (isSidebarOpen = true)
4. Overlay backdrop muncul (z-40)
5. User klik "Tree View" menu item
6. setActiveSection('treeview') trigger
7. setIsSidebarOpen(false) trigger
8. MetaMask dialog mencoba muncul (z-1000)
9. Overlay backdrop masih processing click
10. Event propagation terputus / dialog tidak muncul properly
11. Connection state berfluktuasi → logout terjadi
```

## 🛠️ Solusi yang Diperlukan

### **Fix 1: Add Event Propagation Prevention**
```jsx
{isSidebarOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    onClick={(e) => {
      e.stopPropagation();  // ✅ Prevent event propagation
      setIsSidebarOpen(false);
    }}
    style={{ pointerEvents: 'auto' }}  // ✅ Ensure overlay is clickable
  />
)}
```

### **Fix 2: Ensure Menu Items Don't Propagate to Overlay**
```jsx
<button
  onClick={(e) => {
    e.stopPropagation();  // ✅ Prevent bubbling
    setActiveSection('treeview');
    setIsSidebarOpen(false);
  }}
  className={...}
>
  Tree View
</button>
```

### **Fix 3: Delay Sidebar Close to Allow Dialog Popup**
```jsx
onClick={() => {
  setActiveSection('treeview');
  // Delay closing sidebar to allow MetaMask dialog to appear first
  setTimeout(() => {
    setIsSidebarOpen(false);
  }, 100);  // ✅ Give MetaMask time to render dialog
}}
```

### **Fix 4: Add Z-Index Guard for Modal Dialogs**
Pastikan MetaMask dialog selalu di atas dengan memberikan z-index yang sangat tinggi untuk Wagmi provider.

## 📝 Technical Details

### **Why MetaMask Disconnect:**
- MetaMask popup memerlukan user interaction untuk tetap terhubung
- Jika event handling tidak sempurna, wallet connection handler bisa terputus
- Overlay blocking atau event prevention yang salah → connection reset

### **Why Tree View Triggers It:**
- Tree View memerlukan wagmi `useReadContract` hooks
- Menu sidebar navigation bisa trigger wallet state re-evaluation
- Jika terjadi race condition antara sidebar close dan wallet dialog, connection hilang

## ✅ Files to Fix

1. `/frontend/src/components/Dashboard.jsx` - Sidebar & Overlay
2. `/frontend/src/pages/dashboardadmin.jsx` - Overlay handling
3. Wagmi Provider config - Ensure modal z-index

## 🔧 Implementation Priority
- **High**: Add `stopPropagation()` to menu items
- **High**: Fix overlay pointer events
- **Medium**: Add setTimeout delay for sidebar close
- **Low**: Z-index optimization

---
**Status**: 🔴 Analysis Complete - Ready for Implementation
