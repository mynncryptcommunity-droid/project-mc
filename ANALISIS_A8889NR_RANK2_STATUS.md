# Analisis Status User A8889NR di Rank 2 - Stream A & B

## Skenario yang Diberikan
- User: **A8889NR**
- Status Saat Ini: **Rank 8** (40 total users di rank 8 termasuk A8889NR)
- Pertanyaan: Apakah A8889NR di Rank 2 sebagai **DONOR** atau di **WAITING QUEUE**?

---

## Mekanisme MynnGift - Alur User Naik Rank

### Fase 1: User Menjadi DONOR
```
User mendonasikan BNB ke Rank X
→ Slot Donor ada (< 6 donors)?
  ✅ YES: User menjadi DONOR di Rank X
  ❌ NO:  User masuk WAITING QUEUE di Rank X
```

### Fase 2: User Menjadi RECEIVER
```
User sudah menjadi DONOR di Rank X
→ Rank X PENUH (6 donors)?
  ✅ YES: Rank diolah, funds didistribusi
          User (sebagai DONOR) otomatis dipromosi ke Rank X+1
  ❌ NO:  Tunggu sampai Rank penuh
```

### Fase 3: AUTO PROMOTION
Saat user menerima funds sebagai RECEIVER di Rank X:
```
_autoPromote dipanggil
→ User otomatis didonasikan ke Rank X+1 (pakai promotion pool)
```

---

## Smart Contract Logic - Kunci Yang Penting

### 1. **_processFullRank() - Baris 380-412**

Saat Rank X PENUH (6 donors), ada 2 hal penting:

**A. Proses Receiver Share:**
```javascript
for setiap donor di Rank X:
  - Jika donor belum pernah menerima di Rank ini
  - Jika donor belum completed Rank 8 di stream ini
  MAKA: donor menerima funds dan
        _autoPromote(donor, X, stream) dipanggil
```

**B. Tambah ke Queue Rank X+1:**
```javascript
for setiap donor di Rank X:
  if (!isRank8Completed[donor]) AND (!sudah di queue Rank X):
    waitingQueue[X].push(donor)
```

### 2. **_autoPromote() - Baris 305-370**

```javascript
_autoPromote(user, currentRank, stream):
  nextRank = currentRank + 1
  
  Jika nextRank <= 8:
    Ambil dari promotionPool: rankDonationValues[nextRank]
    CALL: _processDonation(nextRank, user, amount, stream)
      → Ini membuat user DONOR di Rank X+1
      → BUKAN QUEUE, tapi DONOR SLOT
```

---

## Jawaban Untuk User A8889NR

### ✅ **JIKA A8889NR sudah completed Rank 8:**
```
User A8889NR di Rank 2:
  - Dipindahkan dari QUEUE (jika ada)
  - BLOCKED dari auto-promotion
  - Tidak bisa terima funds lagi
```

### ✅ **JIKA A8889NR BELUM completed Rank 8:**

#### Di Rank 2 Stream A:
```
Status: DONOR (bukan QUEUE)

Alasan:
1. User mula-mula donasi/masuk Rank 2
2. Jika Rank 2 penuh (6 donors):
   - User menerima funds (RECEIVER)
   - _autoPromote(user, 2, StreamA) dipanggil
   - Otomatis donasi ke Rank 3 pakai promotion pool
   - User menjadi DONOR Rank 3 (BUKAN di queue)

3. Proses repeat: Rank 3 penuh
   - User menerima funds → RECEIVER Rank 3
   - Auto promote ke Rank 4 → DONOR Rank 4
   - ... continue sampai Rank 8
```

#### Di Rank 2 Stream B:
```
Status: SAMA seperti Stream A (juga DONOR)

Mengapa beda dengan QUEUE?
- User di Rank 2 sebagai DONOR pasal dari Rank 1
- Saat Rank 1 penuh, donors ditambahkan ke queue Rank 1
  TAPI ini queue untuk NEXT CYCLE, bukan Rank 2
- Untuk masuk Rank 2 sebagai DONOR, user harus:
  1. Terima funds di Rank 1 (auto-promote)
  2. Masuk Rank 2 sebagai DONOR (bukan queue)
```

---

## Simulasi Perjalanan User A8889NR - Dari Rank 1 ke Rank 8

### Timeline (Simplified):

| Fase | Rank | Status | Event | Next |
|------|------|--------|-------|------|
| 1 | 1 | DONOR | Menjadi donor di Rank 1 | Tunggu Rank 1 penuh |
| 2 | 1 | DONOR+RECEIVER | Rank 1 penuh, terima funds | Auto-promote |
| 3 | 2 | DONOR | Auto-promoted ke Rank 2 via promotion pool | Tunggu Rank 2 penuh |
| 4 | 2 | DONOR+RECEIVER | Rank 2 penuh, terima funds | Auto-promote |
| 5 | 3 | DONOR | Auto-promoted ke Rank 3 | Tunggu penuh |
| 6 | 3 | DONOR+RECEIVER | Rank 3 penuh, terima funds | Auto-promote |
| ... | ... | ... | ... | ... |
| 15 | 8 | DONOR | Auto-promoted ke Rank 8 | Terima funds? |
| 16 | 8 | DONOR+RECEIVER | Rank 8 penuh, terima funds | COMPLETED! ✅ |

---

## Kesimpulan Jawaban

### **Pertanyaan: Apakah A8889NR di Rank 2 sebagai DONOR atau QUEUE?**

### **Jawaban: A8889NR adalah DONOR di Rank 2 (bukan di QUEUE)**

#### Alasan:
1. **Auto-Promotion System**: Saat user menerima funds di Rank N, mereka otomatis di-donate ke Rank N+1 pakai promotion pool
2. **DONOR dari Rank 1**: Ketika A8889NR menerima di Rank 1, dia langsung menjadi DONOR Rank 2 (promotion)
3. **Waiting Queue ≠ Donor Slots**: 
   - QUEUE = menunggu di Rank yang sudah penuh
   - DONOR = punya slot di Rank untuk berkontribusi
4. **User yang di QUEUE** = mereka yang masuk Rank tapi slot penuh, harus tunggu sampai Rank dapat processed

---

## Catatan Penting - QUEUE vs DONOR

### **Kapan User Masuk QUEUE?**
```
User A masuk Rank 2
→ Rank 2 sudah punya 6 donors?
  ✅ YES: User A masuk WAITING QUEUE Rank 2
  ❌ NO:  User A menjadi DONOR Rank 2
```

### **Kapan User Jadi DONOR?**
```
User A melakukan auto-promote dari Rank 1
→ Masuk Rank 2 sebagai DONOR (via promotion pool)
→ Rank 2 bisa masih kosong atau sudah ada donors
   (TAPI selalu ada slot karena baru keluar dari Rank 1)
```

---

## Konteks Rank 1 Dengan 31 Users

Dari console log sebelumnya:
```
waitingQueue1: Array(31)  ← 31 users menunggu di Rank 1
```

Ini berarti:
- **Rank 1 PENUH** (6 donors) + **31 di QUEUE** = sudah diproses berkali-kali
- Setiap kali Rank 1 diproses:
  - 1 user dapat funds (RECEIVER)
  - 6 donors dipromosikan otomatis ke Rank 2 sebagai DONOR
  - Rank 1 di-reset, siap round berikutnya

**Kesimpulan**: Users dari Rank 1 yang dipromosikan ke Rank 2 adalah **DONOR**, bukan di QUEUE.

---

## Visual Diagram - Status di Setiap Rank

```
Rank 1:  [6 DONORS] + [31 in QUEUE] ← Waiting their turn to be DONOR
  ↓ (auto-promote)
Rank 2:  [6 DONORS] + [0+ in QUEUE]
  ↓ (auto-promote)
Rank 3:  [6 DONORS] + [0+ in QUEUE]
  ↓ (auto-promote)
...
Rank 8:  [6 DONORS] + [40 total at Rank 8?]

User A8889NR: Currently at Rank 8
- If at Rank 8 as DONOR: Waiting to be selected as RECEIVER
- If at Rank 8 as in QUEUE: Rank 8 penuh, waiting to receive
```

---

## Simulasi Kasus A8889NR Specifik

### **Jika A8889NR sudah sampai Rank 8:**

Di Rank 2 Stream A:
- Status: **DONOR** (bukan QUEUE)
- Donor dari: Rank 1 promotion
- Sudah terima funds atau belum: **SUDAH** (karena naik ke Rank 3)

Di Rank 2 Stream B:
- Status: **DONOR** (bukan QUEUE)
- Donor dari: Rank 1 promotion
- Sudah terima funds atau belum: **SUDAH** (karena naik ke Rank 3)

### **Saat ini di Rank 8:**
- Kalau ada 40 users, bisa berarti:
  - 6 DONORS sedang active
  - 34 di WAITING QUEUE menunggu menjadi DONOR / RECEIVER
  
- Atau kalau Rank 8 sudah completed cycle berkali-kali:
  - Total 40 users pernah menjadi DONOR Rank 8 (dari ranking history)

---

## Rekomendasi Verifikasi

Untuk memastikan status A8889NR benar-benar DONOR di Rank 2:

1. **Check dari smart contract:**
```solidity
// Apakah A8889NR di ranks_StreamA[2].donors?
ranks_StreamA[2].donors.includes(addressA8889NR)
→ True = DONOR

// Apakah A8889NR di ranks_StreamA[2].waitingQueue?  
ranks_StreamA[2].waitingQueue.includes(addressA8889NR)
→ True = QUEUE
```

2. **Check income:**
```solidity
// Jika sudah pernah terima di Rank 2
userIncomePerRank_StreamA[A8889NR][2] > 0
→ True = Sudah RECEIVER (dan sudah promoted)
```

3. **Check current rank:**
```solidity
userRank_StreamA[A8889NR]
→ 8 (confirmed sudah di Rank 8)
```
