# MynnGift Distribution Analysis & Architecture

## 1. DISTRIBUSI DANA SAAT TIDAK ADA PENERIMA (NO RECEIVER)

### Skenario
Ketika rank cycle diselesaikan (6 donor sudah terkumpul) tetapi tidak ada penerima (waiting queue kosong):

### Flow Distribusi
```solidity
if (currentRank.waitingQueue.length == 0) {
    _transferToPlatformWallet(totalFunds);
    emit NoReceiverAllFundsToPlatform(totalFunds, rank);
}
```

**Hasil:** Semua dana (100%) ke Platform Wallet

---

## 2. DISTRIBUSI DANA DENGAN PENERIMA (WITH RECEIVER)

Ketika ada penerima (waiting queue tidak kosong):

### Breakdown Distribusi

**Total Funds = Jumlah dari semua donasi donor**

```
Total Funds
├── Receiver Share: 50%
├── Promotion Share: 45%
└── Fee Share: 5%
    ├── Gas Subsidy: 10% dari Fee = 0.5% dari Total
    └── Platform Fee: 90% dari Fee = 4.5% dari Total
```

### Tabel Detail Distribusi

| Komponen | Persen | Tujuan | Smart Contract |
|----------|--------|--------|------------------|
| **Receiver** | 50% | User di waiting queue | `_processReceiverShare()` |
| **Promotion Pool** | 45% | Promotion wallet | `promotionPool +=` |
| **Gas Subsidy** | 0.5% | Gas subsidy pool | `gasSubsidyPool +=` |
| **Platform Fee** | 4.5% | Platform wallet | `_transferToPlatformWallet()` |

### Smart Contract Code (Lines 365-376)

```solidity
uint256 receiverShare = (totalFunds * RECEIVER_SHARE) / 100;      // 50%
uint256 promotionShare = (totalFunds * PROMOTION_SHARE) / 100;    // 45%
uint256 fee = (totalFunds * FEE_SHARE) / 100;                     // 5%
uint256 subsidy = (fee * GAS_SUBSIDY_PERCENT) / 100;              // 10% dari 5% = 0.5%
uint256 platformFee = fee - subsidy;                              // 90% dari 5% = 4.5%

gasSubsidyPool += subsidy;                    // ✅ Ke Gas Subsidy Pool
emit GasSubsidyPoolUpdated(gasSubsidyPool, "Subsidy Added");

promotionPool += promotionShare;              // ✅ Ke Promotion Pool
emit PromotionPoolUpdated(promotionPool, "Promotion Share Added");

uint256 remainingShare = _processReceiverShare(currentRank, receiverShare, rank, stream);
if (remainingShare > 0) {
    platformFee += remainingShare;            // ✅ Sisa ke Platform Fee
}
_transferToPlatformWallet(platformFee);       // ✅ Ke Platform Wallet
```

---

## 3. PERGESERAN DONOR KE ANTRIAN (Donor → Waiting Queue)

Setelah rank cycle selesai, semua donor otomatis dipindahkan ke antrian rank berikutnya:

### Smart Contract Code (Lines 378-390)

```solidity
// Add donors to waiting queue for next rank
for (uint i = 0; i < currentRank.donors.length; i++) {
    address donor = currentRank.donors[i];
    
    // Check if donor already completed Rank 8 in this stream
    bool isCompleted = (stream == Stream.A) 
        ? isRank8Completed_StreamA[donor] 
        : isRank8Completed_StreamB[donor];
    
    if (!isCompleted && !isInWaitingQueue(rank, donor, currentRank)) {
        string memory donorId = _getUserId(donor);
        currentRank.waitingQueue.push(donor);
        emit WaitingQueueJoined(donorId, rank, currentRank.waitingQueue.length);
    }
}
```

### Kondisi Donor Tidak Pindah Antrian
Donor TIDAK pindah antrian jika:
1. **Sudah completed Rank 8** (`isRank8Completed_StreamA/B` = true)
   - Mereka sudah selesai stream, exit sistem
2. **Sudah di antrian** 
   - Tidak akan double entry

---

## 4. KONTRIBUSI GAS SUBSIDY POOL

### Dari Mana Gas Subsidy Berasal?
- **Sumber:** 10% dari Fee Share (0.5% dari Total Funds)
- **Accumulation:** Setiap rank cycle dengan receiver

### Untuk Apa Gas Subsidy Digunakan?
Dari mynnGift.sol lines 320-339:

```solidity
// Saat promosi rank (rank shortfall coverage)
if (shortfallAmount > 0) {
    // Saat tidak ada donor cukup untuk promosi
    if (gasSubsidyPool >= shortfall) {
        gasSubsidyPool -= shortfall;     // ✅ Ambil dari pool
        emit GasSubsidyPoolUpdated(gasSubsidyPool, "Shortfall Covered");
    }
}
```

### Penggunaan Gas Subsidy
- Menutupi shortfall saat promosi otomatis
- Menjamin promosi berjalan meski tidak ada donor cukup
- Subsidi biaya gas untuk memproses transaksi

---

## 5. RINGKASAN ALIRAN DANA

```
Donasi (6 Donor) = 100%
│
├─ Saat NO RECEIVER (Waiting Queue Kosong)
│  └─ 100% → Platform Wallet
│
└─ Saat WITH RECEIVER (Waiting Queue Ada)
   ├─ 50% → Receiver (User di queue rank berikutnya)
   ├─ 45% → Promotion Pool (untuk next rank)
   ├─ 0.5% → Gas Subsidy Pool
   └─ 4.5% → Platform Wallet
```

---

## 6. CONSTANTS DALAM SMART CONTRACT

```solidity
uint8 public constant MAX_DONORS_PER_RANK = 6;        // 6 donor per rank
uint256 public constant RECEIVER_SHARE = 50;          // 50%
uint256 public constant PROMOTION_SHARE = 45;         // 45%
uint256 public constant FEE_SHARE = 5;                // 5%
uint256 public constant GAS_SUBSIDY_PERCENT = 10;     // 10% dari fee
```

---

## 7. EVENTS UNTUK TRACKING

| Event | Trigger | Info |
|-------|---------|------|
| `GasSubsidyPoolUpdated` | Gas subsidy accumulate/usage | New balance + action |
| `PromotionPoolUpdated` | Promotion share accumulate | New balance + action |
| `NoReceiverAllFundsToPlatform` | No receiver scenario | All funds to platform |
| `WaitingQueueJoined` | Donor → Queue | User ID + queue position |
| `RankCycleCompleted` | Cycle selesai | Rank + cycle number |

---

## KESIMPULAN

### Gas Subsidy
- ✅ **Ada untuk gas** - 10% dari 5% fee = 0.5% dari total dana
- ✅ **Accumulates** setiap cycle dengan receiver
- ✅ **Used for** shortfall coverage saat promosi otomatis
- ✅ **Pool Management** - dapat di-withdraw excess oleh owner

### No Receiver Scenario
- ✅ **Semua dana ke Platform** - tidak ada distribusi receiver
- ✅ **Donor tetap pindah antrian** (kecuali sudah completed Rank 8)
- ✅ **Gas subsidy tidak accumulate** - karena no receiver

### Donor Flow
- 6 donor → Rank cycle complete
- Donor otomatis pindah ke waiting queue rank berikutnya
- Mereka menjadi "receiver candidates" untuk rank berikutnya
- Cycle berulang sampai completed Rank 8
