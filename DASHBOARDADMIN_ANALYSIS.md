# 📊 Analisis File dashboardadmin.jsx

## **1. STRUKTUR & NAVIGASI HALAMAN**

Dashboard Admin memiliki **5 section utama** yang bisa diakses melalui sidebar menu:

```
SIDEBAR_MENU = [
  ✅ overview          → "Ringkasan"
  ✅ user-management   → "Manajemen Pengguna"
  ✅ finance           → "Keuangan & Pendapatan"
  ✅ settings          → "Pengaturan Kontrak"
  ✅ activity-logs     → "Aktivitas & Log"
]
```

---

## **2. ROLE & ACCESS CONTROL**

### **Admin Roles (ada akses full)**
```javascript
OWNER_WALLETS = [
  "0x2F9B65D8384f9Bc47d84F99ADfCce8B10b21699B",  // ownerw
  "0x2f48b3F7D3b2233ba1cFb2e077cF2E703eFcD7b5"   // ownera
]
```

### **Investor Roles (akses terbatas - 10% view)**
```javascript
INVESTOR1_WALLETS = ["0x3A3214EbC975F7761288271aeBf72caB946a8b83"]
INVESTOR2_WALLETS = ["0xb3174FB5f5FEAB8245B910Ba792c0AD25B024871"]
```

### **Access Logic**
```
- Role OWNER   → 100% akses semua data & fungsi
- Role INVESTOR1/2 → 10% view (income multiplier 0.1x)
- Role UNKNOWN → Akses ditolak "Wallet Anda tidak terdaftar"
```

---

## **3. SECTION 1: OVERVIEW (RINGKASAN)**

### **Display Components**
```
📊 Total Pendapatan Platform
   ├─ MynnCrypt + MynnGift combined
   ├─ Format: opBNB + USD + IDR (real-time conversion)
   └─ Source: CoinGecko API (BNB price)

👥 Total Pengguna
   ├─ Count dari MynnCrypt
   └─ Display: Simple number

🎁 Penerima NobleGift
   ├─ Total receivers
   ├─ Format: opBNB + conversion
   └─ Source: MynnGift contract

💰 Saldo Share Fee (NobleGift)
   ├─ Current balance
   └─ Format: opBNB + conversion

⚡ Saldo Gas Subsidy Pool
   ├─ Current balance
   └─ Format: opBNB + conversion

💳 Saldo Kontrak (Findup)
   ├─ MynnCrypt contract balance
   └─ Format: opBNB + conversion
```

### **Recent Events Display**
```
📌 SharefeeDistribution Events (last 5)
   - userId, sharefee amount, transaction amount
   
📌 NoblegiftDistribution Events (last 5)
   - userId, receiver, amount
```

### **Smart Contract Functions Called (READ)**
```
✅ MynnCrypt:
   - totalUsers()                    → Total registered users
   - getPlatformIncome()             → Platform fee income
   - checkContractBalance()          → Contract balance
   - SharefeeDistribution() [EVENT]  → Monitor sharefee distributions
   - NoblegiftDistribution() [EVENT] → Monitor noblegift distributions

✅ MynnGift:
   - getTotalReceivers()             → Total completed rank 1 receivers
   - getShareFeeBalance()            → Share fee pool balance
   - getGasSubsidyPoolBalance()      → Gas subsidy pool balance
   - getPlatformIncome()             → Platform income from ranks
```

---

## **4. SECTION 2: MANAJEMEN PENGGUNA**

### **Features**
```
🔍 User Search by ID
   - Input: User ID (any format)
   - Output: User information card
```

### **User Details Display**
```
📋 User Information:
   - Alamat (Wallet address)
   - Referrer (Who referred this user)
   - Upline (Direct sponsor)
   - Level (Current level)
   - Direct Team (Count)
   - Total Matrix Team (Amount in opBNB)
   - Total Deposit (opBNB)
   - Total Income (opBNB)
   - Royalty Income (opBNB)
   - Referral Income (opBNB)
   - Level Income (opBNB)
```

### **Smart Contract Functions Called (READ)**
```
✅ MynnCrypt:
   - userInfo(userID) → Struct containing:
     {
       uint256 id;
       address account;
       address referrer;
       address upline;
       uint256 level;
       uint256 directTeam;
       uint256 totalMatrixTeam;
       uint256 totalDeposit;
       uint256 totalIncome;
       uint256 royaltyIncome;
       uint256 referralIncome;
       uint256 levelIncome;
     }
```

---

## **5. SECTION 3: KEUANGAN & PENDAPATAN**

### **Display Metrics**
```
📊 Total Platform Income
   ├─ MynnCrypt + MynnGift combined
   └─ Format: opBNB + USD + IDR

💎 Pendapatan Platform (Findup)
   ├─ MynnCrypt only
   └─ Source: getPlatformIncome()

💰 Royalty Pool (Findup)
   ├─ Available for distribution
   └─ Source: royaltyPool()

🏦 Saldo Kontrak Findup
   ├─ Contract balance
   └─ Source: checkContractBalance()

💳 Saldo Share Fee (NobleGift)
   ├─ Current share fee pool
   └─ Source: getShareFeeBalance()

⚡ Saldo Gas Subsidy Pool
   ├─ Current gas subsidy pool
   └─ Source: getGasSubsidyPoolBalance()

🎁 Pendapatan NobleGift
   ├─ Platform income from ranks
   └─ Source: getPlatformIncome()
```

### **Admin Actions (WRITE)**

#### **1. Tarik Dana Sisa (Findup)**
```javascript
Function: withdrawRemainingFunds(address recipient)
Contract: MynnCrypt
Input: recipient wallet address
Action: Withdraw all remaining funds from MynnCrypt
State: Shows transaction hash, loading state, error message
```

#### **2. Tarik Kelebihan Share Fee (NobleGift)**
```javascript
Function: withdrawExcessShareFeeBalance(uint256 amount)
Contract: MynnGift
Input: amount in opBNB
Action: Withdraw excess share fee to admin
State: Shows transaction hash, loading state, error message
Requirement: amount > 0
```

#### **3. Isi Saldo Share Fee (NobleGift)**
```javascript
Function: topUpShareFeeBalance()
Contract: MynnGift
Input: amount (sent as value in transaction)
Action: Top up share fee pool for distribution
State: Shows transaction hash, loading state, error message
Requirement: amount > 0
```

#### **4. Tarik Kelebihan Gas Subsidy**
```javascript
Function: withdrawExcessGasSubsidy(uint256 amount)
Contract: MynnGift
Input: amount in opBNB
Action: Withdraw excess gas subsidy pool
State: Shows transaction hash, loading state, error message
Requirement: amount > 0
```

### **Smart Contract Functions Called (READ)**
```
✅ MynnCrypt:
   - getPlatformIncome()       → Total fees collected
   - royaltyPool()             → Royalty pool balance
   - checkContractBalance()    → Current contract balance

✅ MynnGift:
   - getShareFeeBalance()      → Share fee pool balance
   - getGasSubsidyPoolBalance() → Gas subsidy pool balance
   - getPlatformIncome()       → Platform income
```

### **Smart Contract Functions Called (WRITE)**
```
✅ MynnCrypt:
   - withdrawRemainingFunds(address) → Withdraw sisa dana

✅ MynnGift:
   - withdrawExcessShareFeeBalance(uint256)
   - topUpShareFeeBalance() [value: amount]
   - withdrawExcessGasSubsidy(uint256)
```

---

## **6. SECTION 4: PENGATURAN KONTRAK**

### **MynnCrypt Settings**

#### **1. Default Referral ID**
```javascript
Get: getDefaultRefer()              → Current default referrer ID
Set: setDefaultRefer(uint256 id)    → Set new default referrer ID
Use: When user registers without referrer
```

#### **2. Sharefee Address**
```javascript
Get: getSharefee()                  → Current sharefee collector address
Set: setSharefee(address)           → Set new sharefee address
Use: Where sharefee payments go
```

#### **3. NobleGift Wallet Address**
```javascript
Get: getNoblegiftWallet()           → Current noblegift wallet
Set: setNoblegiftWallet(address)    → Set new noblegift wallet
Use: Where noblegift funds are collected
```

### **MynnGift Settings**

#### **1. Platform Wallet Address**
```javascript
Get: platformWallet()               → Current platform wallet
Set: setPlatformWallet(address)     → Set new platform wallet
Use: Where platform fees go
```

#### **2. Promotion Wallet Address**
```javascript
Get: promotionWallet()              → Current promotion wallet
Set: setPromotionWallet(address)    → Set new promotion wallet
Use: Where promotion funds go (45% of rank income)
```

### **Smart Contract Functions Called (READ)**
```
✅ MynnCrypt:
   - getDefaultRefer()         → Current default referral ID
   - getSharefee()             → Current sharefee address
   - getNoblegiftWallet()      → Current noblegift wallet

✅ MynnGift:
   - platformWallet()          → Current platform wallet
   - promotionWallet()         → Current promotion wallet
```

### **Smart Contract Functions Called (WRITE)**
```
✅ MynnCrypt:
   - setDefaultRefer(uint256 id)
   - setSharefee(address)
   - setNoblegiftWallet(address)

✅ MynnGift:
   - setPlatformWallet(address)
   - setPromotionWallet(address)
```

---

## **7. SECTION 5: AKTIVITAS & LOG**

### **Display**
```
📊 Recent Activities Table
   - User ID
   - Level
   - Limit: 20 most recent activities
```

### **Smart Contract Functions Called (READ)**
```
✅ MynnCrypt:
   - getRecentActivities(uint256 count) → Last N activities
```

---

## **8. UTILITY FUNCTIONS**

### **Price Conversion**
```javascript
fetchPrice() → CoinGecko API
  {
    opbnbPriceUSD: BNB/USD rate
    opbnbPriceIDR: BNB/IDR rate
    Update every 3 minutes
  }

renderWithKurs(amount, opbnbPriceUSD, opbnbPriceIDR)
  → Display amount in:
    - opBNB (main)
    - USD conversion
    - IDR conversion
```

### **Role-Based Display**
```javascript
getRoleByWallet(wallet)
  - "owner"     → Full access (100% view)
  - "investor1" → Limited access (10% view)
  - "investor2" → Limited access (10% view)
  - "unknown"   → Denied access

IncomeBreakdown()
  - Owner sees: 100% actual income
  - Investor sees: 10% of actual income
```

---

## **9. SUMMARY - TOTAL SMART CONTRACT CALLS**

### **MynnCrypt Contract Functions**
```
READ (7 functions):
  ✅ totalUsers()
  ✅ getPlatformIncome()
  ✅ checkContractBalance()
  ✅ royaltyPool()
  ✅ getSharefee()
  ✅ getDefaultRefer()
  ✅ getNoblegiftWallet()
  ✅ userInfo(uint256 id)
  ✅ getRecentActivities(uint256 count)

WRITE (3 functions):
  ✅ withdrawRemainingFunds(address)
  ✅ setDefaultRefer(uint256)
  ✅ setSharefee(address)
  ✅ setNoblegiftWallet(address)

EVENTS (2 events):
  ✅ SharefeeDistribution(uint256 userId, uint256 sharefee, uint256 amount)
  ✅ NoblegiftDistribution(uint256 userId, address receiver, uint256 amount)
```

### **MynnGift Contract Functions**
```
READ (5 functions):
  ✅ getPlatformIncome()
  ✅ getShareFeeBalance()
  ✅ getGasSubsidyPoolBalance()
  ✅ getTotalReceivers()
  ✅ platformWallet()
  ✅ promotionWallet()
  ✅ owner()

WRITE (4 functions):
  ✅ withdrawExcessShareFeeBalance(uint256)
  ✅ topUpShareFeeBalance() [payable]
  ✅ withdrawExcessGasSubsidy(uint256)
  ✅ setPlatformWallet(address)
  ✅ setPromotionWallet(address)
```

---

## **10. DATA FLOW DIAGRAM**

```
┌─────────────────────┐
│  DashboardAdmin     │
│  (Main Component)   │
└──────────┬──────────┘
           │
    ┌──────┼──────────┐────────────┬──────────┐
    │      │          │            │          │
    ▼      ▼          ▼            ▼          ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────────┐ ┌───────────┐
│Overview│ │User  │ │Finance│ │Contract  │ │Activity   │
│Section │ │Mgmt  │ │&      │ │Settings  │ │Logs       │
│        │ │      │ │Income │ │          │ │           │
└────────┘ └──────┘ └──────┘ └──────────┘ └───────────┘
    │         │        │           │            │
    └─────────┴────────┴───────────┴────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   Smart Contracts   │
    │                     │
    │  MynnCrypt.sol      │
    │  MynnGift.sol       │
    └─────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌──────────────┐  ┌──────────────┐
│opBNB Network │  │CoinGecko API │
│(Blockchain)  │  │(Price Data)  │
└──────────────┘  └──────────────┘
```

---

## **11. KEY FEATURES**

✅ **Real-time BNB Pricing** (USD + IDR every 3 minutes)
✅ **Role-Based Access Control** (Owner vs Investors)
✅ **Complete User Information** (Full user profile lookup)
✅ **Financial Management** (Withdraw & Top-up pools)
✅ **Contract Settings Management** (Update key addresses)
✅ **Event Monitoring** (Track distributions)
✅ **Activity Logging** (Recent user activities)
✅ **Transaction State Management** (Loading, Success, Error)

---

## **12. ERROR HANDLING**

```javascript
User Not Found
  → "Pengguna tidak ditemukan atau terjadi kesalahan"

Transaction Failure
  → Display error message from contract
  
Owner Loading Error
  → "Error memalu alamat owner kontrak"

Price Fetch Error
  → "Gagal memuat kurs BNB"

Activity Load Error
  → "Error memuat aktivitas"

Access Denied
  → "Wallet Anda tidak terdaftar sebagai admin atau investor"
```

