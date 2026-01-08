# 📊 Analisis: Breakdown Pendapatan (Income Breakdown)

## 1. Definisi & Sumber Data

### Smart Contract (`getUserIncomeBreakdown`)
```solidity
// mynnCrypt.sol Line 589-607
function getUserIncomeBreakdown(string memory _userId) external view returns (
    uint,  // [0] referralIncome     ← Dari user.referralIncome
    uint,  // [1] levelIncome        ← Dari user.levelIncome (Upline)
    uint,  // [2] sponsorIncome      ← Dari user.sponsorIncome
    uint,  // [3] totalDonation      ← Dari MynnGift.getUserTotalDonation
    uint   // [4] royaltyIncome      ← Dari royaltyIncome[_userId] mapping
) {
    User memory user = userInfo[_userId];
    require(user.account != address(0), "Invalid user ID");

    return (
        user.referralIncome,                                    // [0]
        user.levelIncome,                                       // [1]
        user.sponsorIncome,                                     // [2]
        IMynnGift(mynnGiftWallet).getUserTotalDonation(...),   // [3]
        royaltyIncome[_userId]                                  // [4]
    );
}
```

### Frontend (`Dashboard.jsx` Line 1908-1913)
```jsx
const { data: incomeBreakdown } = useReadContract({
  ...mynncryptConfig,
  functionName: 'getUserIncomeBreakdown',
  args: userId ? [userId] : undefined,
  enabled: !!userId
});
```

---

## 2. Breakdown Items & Definisi

### [0] Referral Income (Pendapatan Referral)
- **Sumber**: User.referralIncome (stored in smart contract)
- **Dari mana**: Ketika member yang direferensikan (direct referral) melakukan registrasi
- **Persentase**: 91% dari fee registrasi (0.0044 opBNB) = 0.004004 opBNB per member
- **Cara dihitung**: Accumulated sejak member merekomendasikan ke orang lain
- **Tampilkan**: `ethers.formatEther(incomeBreakdown[0])`

### [1] Upline Income / Level Income (Pendapatan Upline)
- **Sumber**: User.levelIncome (stored in smart contract)
- **Dari mana**: Ketika downline (orang di bawah Anda) upgrade level
- **Persentase**: Bervariasi per level (lihat uplinePercents array)
- **Cara dihitung**: Dari fungsi `_distUpgrading` saat upgrade terjadi
- **Tampilkan**: `ethers.formatEther(incomeBreakdown[1])`
- **Contoh**: Level 2 upgrade = upline dapat 80% dari biaya upgrade

### [2] Sponsor Income (Pendapatan Sponsor)
- **Sumber**: User.sponsorIncome (stored in smart contract)
- **Dari mana**: Ketika orang yang Anda sponsor upgrade level
- **Persentase**: 10% dari biaya upgrade
- **Cara dihitung**: Dari fungsi `_distributeUplineSponsor`
- **Tampilkan**: Diambil dari incomeHistory (filter layer 1, incomeType SPONSOR)
  ```jsx
  const totalSponsor = incomeHistory
    .filter(item => item.incomeType === IncomeType.SPONSOR && item.layer === 1)
    .reduce((sum, item) => sum + parseFloat(item.amount), 0)
  ```
- **Catatan**: Disini tidak langsung pakai incomeBreakdown[2] karena perlu akurasi dari history

### [3] MynnGift Total Donation (Total Donasi MynnGift)
- **Sumber**: IMynnGift(mynnGiftWallet).getUserTotalDonation(user.account)
- **Dari mana**: Ketika user melakukan donasi di MynnGift (Rank 1-8)
- **Nilai**: Accumulation dari semua donasi (Rank 1 = 0.0081, Rank 8 = 8.472886094)
- **Catatan**: INI ADALAH PENGELUARAN BUKAN INCOME - harus dikurangi dari total, bukan ditambah
- **Tampilkan**: Tidak ditampilkan sebagai income (tapi bisa sebagai "Total Expenses")

### [4] Royalty Income (Pendapatan Royalty)
- **Sumber**: royaltyIncome[_userId] mapping
- **Dari mana**: Dari distribusi royalty otomatis (sistem memberikan reward ke top earners)
- **Persentase**: 3% dari upgrade fees (terbagi sesuai tier)
- **Cara dihitung**: `_distributeRoyalty` function
- **Status**: PENDING = belum di-claim (masih di smart contract)
- **Tampilkan**: `ethers.formatEther(incomeBreakdown[4])` = PENDING saja
- **Penting**: Setelah claim, ini jadi 0 dan masuk ke incomeHistory dengan layer 4

---

## 3. Breakdown Ditampilkan Di UI (Line 1981-2050)

```jsx
const renderIncomeBreakdown = () => (
  <div className="bg-[#1A3A6A]...">
    <h3>Income Breakdown</h3>
    
    {/* Card 1: Referral Income */}
    <div>
      <span>Referral Income</span>
      <span>{ethers.formatEther(incomeBreakdown[0])}</span>
      <text>"91% from direct referral member registration fees"</text>
    </div>
    
    {/* Card 2: Upline Income */}
    <div>
      <span>Upline Income</span>
      <span>{ethers.formatEther(incomeBreakdown[1])}</span>
      <text>"Income from upline network (matrix upgrades)"</text>
    </div>
    
    {/* Card 3: Sponsor Income */}
    <div>
      <span>Sponsor Income</span>
      <span>{totalSponsor.toFixed(4)}</span>
      <text>"Sponsor income (10% bonus from downline..."</text>
    </div>
    
    {/* Card 4: Royalty Income */}
    <div>
      <span>Royalty Income</span>
      <span>{ethers.formatEther(incomeBreakdown[4])}</span>  ← PENDING ONLY!
      <text>"Royalty income from network"</text>
    </div>
    
    {/* Card 5: MynnGift Stream A Income */}
    <div>
      <span>MynnGift Stream A Income</span>
      <span>{totalMynngiftIncome.toFixed(4)}</span>
      <text>"Total income from MynnGift (Rank 1-8)"</text>
    </div>
  </div>
)
```

---

## 4. ISSUE: Royalty Breakdown Tidak Mencerminkan Kenyataan

### Problem:
- **Breakdown[4] (Royalty)** hanya menunjukkan **PENDING** (belum di-claim)
- Setelah user claim royalty, pending jadi 0
- Tapi claimed royalty hilang dari breakdown ini

### Current Display:
```
Royalty Income: 0.000088 opBNB  ← PENDING (sebelum claim)
     ↓ (user klik Claim)
Royalty Income: 0 opBNB         ← CLAIMED tapi tidak tampil di breakdown!
```

### Solution:
Breakdown[4] harus menampilkan **CLAIMED + PENDING**, bukan cuma pending:

```jsx
const royaltyIncome = useMemo(() => {
  const pending = incomeBreakdown ? parseFloat(ethers.formatEther(incomeBreakdown[4])) : 0;
  const claimed = claimedRoyalty; // sudah dihitung dari incomeHistory
  return (pending + claimed).toFixed(4);
}, [incomeBreakdown, claimedRoyalty]);

// Di renderIncomeBreakdown:
<span>{royaltyIncome}</span>  // Tampil claimed + pending, stabil!
```

---

## 5. Kriteria & Kondisi Breakdown

| Item | Kriteria Munculnya | Calculated From | Updated Saat |
|------|------------------|-----------------|--------------|
| Referral | Always | Smart Contract (user.referralIncome) | Register referral |
| Upline | Always | Smart Contract (user.levelIncome) | Downline upgrade |
| Sponsor | Always | Income History (layer 1) | Sponsor upgrade |
| MynnGift Donation | Always (tapi label "Donation" bukan "Income") | Smart Contract (MynnGift) | Donate MynnGift |
| Royalty | Always | Smart Contract (royaltyIncome) + History | Royalty distributed & claimed |

---

## 6. Summary: Data Flow

```
Smart Contract State
├─ user.referralIncome        → Breakdown[0]
├─ user.levelIncome           → Breakdown[1]
├─ user.sponsorIncome         → Breakdown[2] (tapi pakai history)
├─ royaltyIncome[user]        → Breakdown[4] (PENDING)
└─ MynnGift.totalDonation     → Breakdown[3] (EXPENSES!)

Income History
├─ Layer 0 (Referral)         → Calculated in Sponsor Income
├─ Layer 1 (Sponsor)          → Calculated in Sponsor Income
├─ Layer 2-9 (MynnGift)       → FILTERED OUT (expenses)
├─ Layer 4 (Royalty Claimed)  → Calculated in Royalty Total
└─ Layer 10+ (Upline)         → Not separately tracked
```

---

## 7. Rekomendasi Perbaikan

### Priority 1: Fix Royalty Display
Breakdown[4] harus = CLAIMED + PENDING (stable setelah claim)

### Priority 2: Label MynnGift Donation
Ubah dari "MynnGift Income" jadi "MynnGift Expenses/Donations" (untuk clarity)

### Priority 3: Breakdown Detail
Tambahkan breakdown per level untuk MynnGift income (Rank 1-8 terpisah)

