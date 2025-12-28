import React, { useState, useEffect, useCallback } from 'react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { ethers } from 'ethers';
import { UsersIcon, ArrowUpCircleIcon, CurrencyDollarIcon, MegaphoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

// Komponen sederhana untuk koin animasi
const AnimatedCoin = ({ id, startX, startY, endX, endY, onAnimationEnd, duration = 1000, children }) => {
  const [position, setPosition] = useState({ x: startX, y: startY });

  useEffect(() => {
    // Minimalisasi re-render jika posisi sudah di akhir
    if (position.x === endX && position.y === endY) return;

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      setPosition({
        x: startX + (endX - startX) * progress,
        y: startY + (endY - startY) * progress,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onAnimationEnd) {
        onAnimationEnd(id);
      }
    };

    requestAnimationFrame(animate);
  }, [startX, startY, endX, endY, duration, onAnimationEnd, id]);

  return (
    <g transform={`translate(${position.x}, ${position.y})`} className="animated-coin">
      {children}
    </g>
  );
};

// Komponen untuk animasi user avatar saat promosi rank
const AnimatedUserMovingIcon = ({ id, startX, startY, endX, endY, onAnimationEnd, duration = 1500, userAddress }) => {
  const [position, setPosition] = useState({ x: startX, y: startY });

  useEffect(() => {
    if (position.x === endX && position.y === endY) return;

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      setPosition({
        x: startX + (endX - startX) * progress,
        y: startY + (endY - startY) * progress,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onAnimationEnd) {
        onAnimationEnd(id);
      }
    };

    requestAnimationFrame(animate);
  }, [startX, startY, endX, endY, duration, onAnimationEnd, id]);

  return (
    <g transform={`translate(${position.x}, ${position.y})`} className="animated-user-moving-icon">
      <circle cx="0" cy="0" r="12" fill="#102E50" stroke="#F5C45E" strokeWidth="2" />
      <UsersIcon className="text-white w-5 h-5" x="-10" y="-10" />
      <text x="0" y="18" textAnchor="middle" fill="#F5C45E" fontSize="8">
        {userAddress ? `${userAddress.slice(0, 4)}...` : ''}
      </text>
    </g>
  );
};

// Komponen untuk animasi user avatar saat bergabung antrean
const AnimatedQueueUser = ({ id, startX, startY, endX, endY, onAnimationEnd, duration = 1000, userAddress }) => {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      setPosition({
        x: startX + (endX - startX) * progress,
        y: startY + (endY - startY) * progress,
      });
      // Fade out towards the end of the animation
      setOpacity(1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onAnimationEnd) {
        onAnimationEnd(id);
      }
    };

    requestAnimationFrame(animate);
  }, [startX, startY, endX, endY, duration, onAnimationEnd, id]);

  return (
    <g transform={`translate(${position.x}, ${position.y})`} opacity={opacity} className="animated-queue-user">
      <circle cx="0" cy="0" r="7" fill="#4DA8DA" stroke="#102E50" strokeWidth="1" />
      <UsersIcon className="text-white w-2.5 h-2.5" x="-5" y="-5" />
      <text x="0" y="10" textAnchor="middle" fill="#102E50" fontSize="6">
        {userAddress ? `${userAddress.slice(0, 4)}...` : ''}
      </text>
    </g>
  );
};

const NobleGiftVisualization = ({ mynngiftConfig, userAddress, mynncryptUserId }) => {
  // State lokal untuk data visualisasi
  const [ranksData, setRanksData] = useState({}); // Akan menyimpan data donor, waiting queue untuk setiap rank
  const [currentRankState, setCurrentRankState] = useState(null); // Untuk rank user sendiri
  const [animationQueue, setAnimationQueue] = useState([]); // Untuk mengelola antrean animasi
  const [animatedCoins, setAnimatedCoins] = useState({});
  const [userPromotingAnimation, setUserPromotingAnimation] = useState(null); // State untuk animasi promosi rank user
  const [isProcessingCycle, setIsProcessingCycle] = useState({}); // State untuk melacak rank yang sedang memproses siklus
  const [animatedQueueUsers, setAnimatedQueueUsers] = useState({}); // State untuk animasi user masuk antrean
  const [displayedActivities, setDisplayedActivities] = useState([]); // State untuk riwayat aktivitas yang ditampilkan

  // Posisi tetap untuk wallet dan user (bisa disesuaikan)
  const promotionWalletX = 900; // Posisi ikon megafon
  const promotionWalletY = 100;
  const platformWalletX = 900; // Posisi ikon gedung
  const platformWalletY = 200;

  // --- 1. Ambil Data Awal dan Real-time dari Kontrak --- //

  // User's NobleGift Rank
  const { data: nobleGiftRank, refetch: refetchNobleGiftRank } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserRank',
    args: [userAddress],
    enabled: !!userAddress,
  });

  // User's NobleGift Status
  const { data: nobleGiftStatus, refetch: refetchNobleGiftStatus } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserStatus',
    args: [userAddress],
    enabled: !!userAddress,
  });

  // Ambil nilai MAX_DONORS_PER_RANK dari kontrak
  const { data: maxDonorsPerRank } = useReadContract({
    ...mynngiftConfig,
    functionName: 'MAX_DONORS_PER_RANK',
    enabled: true,
  });

  // Ambil nilai gasSubsidyPool
  const { data: gasSubsidyPool, refetch: refetchGasSubsidyPool } = useReadContract({
    ...mynngiftConfig,
    functionName: 'gasSubsidyPool',
    enabled: true,
  });

  // Ambil nilai totalReceivers
  const { data: totalReceivers, refetch: refetchTotalReceivers } = useReadContract({
    ...mynngiftConfig,
    functionName: 'totalReceivers',
    enabled: true,
  });

  // Ambil data untuk setiap Rank (misalnya, Rank 1-8)
  // Ini bisa dilakukan dalam loop atau secara individual tergantung kebutuhan visual
  const { data: rank1Queue, refetch: refetchRank1Queue } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankWaitingQueue',
    args: [1],
    enabled: true,
  });
  // TODO: Tambahkan pengambilan data untuk rank lainnya jika diperlukan untuk visualisasi awal

  // Array untuk menyimpan hasil useReadContract untuk setiap rank
  const rankReads = Array.from({ length: 8 }, (_, i) => {
    const rank = i + 1;
    const { data: currentDonors, refetch: refetchCurrentDonors } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getRankDonors',
      args: [rank],
      enabled: true,
    });
    const { data: waitingQueue, refetch: refetchWaitingQueue } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getRankWaitingQueue',
      args: [rank],
      enabled: true,
    });
    const { data: currentRankStatus, refetch: refetchCurrentRankStatus } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getCurrentRankStatus',
      args: [rank],
      enabled: true,
    });
    const { data: queueStatus, refetch: refetchQueueStatus } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getQueueStatus',
      args: [rank],
      enabled: true,
    });
    const { data: rankDonationValue, refetch: refetchRankDonationValue } = useReadContract({
      ...mynngiftConfig,
      functionName: 'rankDonationValues',
      args: [rank],
      enabled: true,
    });
    const { data: currentRankCycle, refetch: refetchCurrentRankCycle } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getCurrentRankCycle',
      args: [rank],
      enabled: true,
    });


    return {
      rank,
      currentDonors: currentDonors || [],
      waitingQueue: waitingQueue || [],
      currentRankStatus: currentRankStatus,
      queueStatus: queueStatus,
      rankDonationValue: rankDonationValue,
      currentRankCycle: currentRankCycle,
      refetchCurrentDonors,
      refetchWaitingQueue,
      refetchCurrentRankStatus,
      refetchQueueStatus,
      refetchRankDonationValue,
      refetchCurrentRankCycle,
    };
  });

  // Gunakan useEffect untuk memproses data rank yang diambil dan memperbarui state ranksData
  useEffect(() => {
    const newRanksData = {};
    rankReads.forEach(data => {
      const isFull = maxDonorsPerRank !== undefined && data.currentDonors.length === Number(maxDonorsPerRank);
      newRanksData[data.rank] = {
        donors: data.currentDonors,
        waitingQueue: data.waitingQueue,
        totalFunds: data.currentRankStatus ? data.currentRankStatus[1] : BigInt(0),
        targetFunds: data.currentRankStatus ? data.currentRankStatus[2] : BigInt(0),
        remainingSlots: data.currentRankStatus ? data.currentRankStatus[3] : 0,
        queueLength: data.queueStatus ? data.queueStatus[0] : BigInt(0),
        activeDonorsInQueue: data.queueStatus ? data.queueStatus[1] : BigInt(0),
        rankDonationValue: data.rankDonationValue,
        currentRankCycle: data.currentRankCycle,
        isFull: isFull,
        refetchDonors: data.refetchCurrentDonors,
        refetchWaitingQueue: data.refetchWaitingQueue,
        refetchCurrentRankStatus: data.refetchCurrentRankStatus,
        refetchQueueStatus: data.refetchQueueStatus,
        refetchRankDonationValue: data.refetchRankDonationValue,
        refetchCurrentRankCycle: data.refetchCurrentRankCycle,
      };
    });
    setRanksData(newRanksData);

    // Ambil data detail untuk rank pengguna saat ini
    if (nobleGiftRank !== undefined && nobleGiftRank !== null && newRanksData[Number(nobleGiftRank)]) {
      setCurrentRankState(newRanksData[Number(nobleGiftRank)]);
    }
  }, [nobleGiftRank, maxDonorsPerRank, ...rankReads.flatMap(r => [r.currentDonors, r.waitingQueue, r.currentRankStatus, r.queueStatus, r.rankDonationValue, r.currentRankCycle])]);

  // --- 2. Dengarkan Event Real-time untuk Animasi --- //

  // Event: DonationReceived
  useWatchContractEvent({
    ...mynngiftConfig,
    eventName: 'DonationReceived',
    onLogs(logs) {
      logs.forEach(async log => {
        const { donor, rank: eventRank, amount: eventAmount } = log.args;
        console.log(`DonationReceived: ${donor} donated ${ethers.formatEther(eventAmount)} to Rank ${eventRank}`);
        const rankInfo = ranksData[Number(eventRank)];
        if (rankInfo && rankInfo.refetchDonors) {
          await rankInfo.refetchDonors();
        }
        setAnimationQueue(prev => [...prev, { type: 'DONATION', donor, rank: Number(eventRank), amount: eventAmount }]);
      });
    },
  });

  // Event: WaitingQueueJoined
  useWatchContractEvent({
    ...mynngiftConfig,
    eventName: 'WaitingQueueJoined',
    onLogs(logs) {
      logs.forEach(async log => {
        const { user: eventUser, rank: eventRank } = log.args;
        console.log(`WaitingQueueJoined: ${eventUser} joined queue for Rank ${eventRank}`);
        const rankInfo = ranksData[Number(eventRank)];
        if (rankInfo && rankInfo.refetchWaitingQueue) {
          await rankInfo.refetchWaitingQueue();
        }
        setAnimationQueue(prev => [...prev, { type: 'JOIN_QUEUE', user: eventUser, rank: Number(eventRank) }]);
      });
    },
  });

  // Event: ReceiverStatusUpdated
  useWatchContractEvent({
    ...mynngiftConfig,
    eventName: 'ReceiverStatusUpdated',
    onLogs(logs) {
      logs.forEach(async log => {
        const { user: eventUser, rank: receivedRank, amount: eventAmount } = log.args; // 'rank' here is the rank they received FROM
        console.log(`ReceiverStatusUpdated: ${eventUser} received ${ethers.formatEther(eventAmount)} from Rank ${receivedRank}`);

        const rankInfo = ranksData[Number(receivedRank)];
        if (rankInfo && rankInfo.refetchWaitingQueue) {
          await rankInfo.refetchWaitingQueue();
        }

        const oldUserRank = nobleGiftRank ? Number(nobleGiftRank) : 0;

        await refetchNobleGiftStatus();
        await refetchNobleGiftRank();

        // Jika user adalah user dashboard dan rank-nya naik, tambahkan event promosi
        // Perhatikan: nobleGiftRank di sini sudah yang terbaru setelah refetch
        if (eventUser.toLowerCase() === userAddress.toLowerCase() && nobleGiftRank !== undefined && Number(nobleGiftRank) > oldUserRank) {
            setAnimationQueue(prev => [...prev, { 
                type: 'USER_RANK_PROMOTE', 
                user: eventUser, 
                fromRank: oldUserRank, 
                toRank: Number(nobleGiftRank) 
            }]);
        }

        setAnimationQueue(prev => [...prev, { type: 'RECEIVE_FUNDS', user: eventUser, rank: Number(receivedRank), amount: eventAmount }]);
      });
    },
  });

  // Event: RankCycleCompleted & RankReset
  useWatchContractEvent({
    ...mynngiftConfig,
    eventName: 'RankCycleCompleted', // atau RankReset
    onLogs(logs) {
      logs.forEach(async log => {
        const { rank: eventRank, cycleNumber: eventCycleNumber, donors: eventDonors } = log.args; // atau totalDonors dari RankReset
        console.log(`RankCycleCompleted: Rank ${eventRank} completed cycle ${eventCycleNumber}`);
        setIsProcessingCycle(prev => ({ ...prev, [Number(eventRank)]: true })); // Set processing true

        const rankInfo = ranksData[Number(eventRank)];
        if (rankInfo && rankInfo.refetchDonors && rankInfo.refetchCurrentRankStatus && rankInfo.refetchWaitingQueue) {
          await rankInfo.refetchDonors();
          await rankInfo.refetchCurrentRankStatus();
          await rankInfo.refetchWaitingQueue();
        }
        setAnimationQueue(prev => [...prev, { type: 'RANK_CYCLE_COMPLETE', rank: Number(eventRank), cycleNumber: Number(eventCycleNumber), donors: eventDonors }]);
      });
    },
  });

  // --- 3. Logika & Komponen Visualisasi --- //

  // Fungsi untuk mendapatkan koordinat pusat Rank
  const getRankCoordinates = useCallback((rank) => {
    const col = (rank - 1) % 2;
    const row = Math.floor((rank - 1) / 2);
    const x = 250 + col * 700;
    const y = 150 + row * 550;
    return { x, y };
  }, []);

  // Fungsi untuk menjalankan animasi dari antrean
  useEffect(() => {
    if (animationQueue.length > 0) {
      const nextAnimation = animationQueue[0];

      console.log('Memicu animasi:', nextAnimation.type, nextAnimation);

      const animationId = Date.now().toString(); // ID unik untuk animasi
      let startX, startY, endX, endY;
      let coinColor = "#F5C45E"; // Warna koin default


      switch (nextAnimation.type) {
        case 'DONATION':
          // Koin dari 'user' ke Rank
          startX = 150; // Contoh posisi awal di kiri
          startY = 500; // Contoh posisi awal di tengah tinggi
          const targetRankCoords = getRankCoordinates(nextAnimation.rank);
          endX = targetRankCoords.x;
          endY = targetRankCoords.y;
          coinColor = "#F5C45E"; // Koin emas
          setAnimatedCoins(prev => ({
            ...prev,
            [animationId]: { startX, startY, endX, endY, color: coinColor, amount: nextAnimation.amount, type: 'DONATION' }
          }));
          break;
        case 'RECEIVE_FUNDS':
          // Koin dari Rank ke 'user'
          const sourceRankCoords = getRankCoordinates(nextAnimation.rank);
          startX = sourceRankCoords.x;
          startY = sourceRankCoords.y;
          endX = 150; // Contoh posisi akhir di kiri (kembali ke user)
          endY = 500; // Contoh posisi akhir di tengah tinggi
          coinColor = "#00FF00"; // Koin hijau untuk penerima
          setAnimatedCoins(prev => ({
            ...prev,
            [animationId]: { startX, startY, endX, endY, color: coinColor, amount: nextAnimation.amount, type: 'RECEIVE' }
          }));

          break;
        case 'RANK_CYCLE_COMPLETE':
          // Distribusi dana ke Promotion Wallet, Platform Wallet, dan Penerima
          const completedRankCoords = getRankCoordinates(nextAnimation.rank);
          const totalFunds = ranksData[nextAnimation.rank]?.totalFunds; // Ambil total dana dari state
          if (totalFunds) {
            const promotionShare = (totalFunds * 45n) / 100n;
            const feeShare = (totalFunds * 5n) / 100n;
            const receiverShare = (totalFunds * 50n) / 100n; // 50% untuk penerima

            // Animasi ke Penerima (generik)
            setAnimatedCoins(prev => ({
              ...prev,
              [`${animationId}-receiver`]: { startX: completedRankCoords.x, startY: completedRankCoords.y, endX: 700, endY: 700, color: "#00FF00", amount: receiverShare, type: 'RECEIVER_SHARE' } // Posisi generik di bawah untuk penerima
            }));
            
            // Animasi ke Promotion Wallet
            setAnimatedCoins(prev => ({
              ...prev,
              [`${animationId}-promo`]: { startX: completedRankCoords.x, startY: completedRankCoords.y, endX: 1300, endY: 50, color: "#4DA8DA", amount: promotionShare, type: 'PROMOTION' }
            }));
            // Animasi ke Platform Wallet
            setAnimatedCoins(prev => ({
              ...prev,
              [`${animationId}-plat`]: { startX: completedRankCoords.x, startY: completedRankCoords.y, endX: 1300, endY: 600, color: "#4DA8DA", amount: feeShare, type: 'PLATFORM' }
            }));
          }
          break;
        case 'JOIN_QUEUE':
          const queueRankCoords = getRankCoordinates(nextAnimation.rank);
          // Posisi awal dari user avatar statis
          startX = 150;
          startY = 500;
          // Posisi akhir di dekat antrean Rank
          endX = queueRankCoords.x + 70;
          endY = queueRankCoords.y + 20;
          setAnimatedQueueUsers(prev => ({
            ...prev,
            [animationId]: { startX, startY, endX, endY, userAddress: nextAnimation.user }
          }));
          break;
        case 'USER_RANK_PROMOTE':
            const fromRankCoords = getRankCoordinates(nextAnimation.fromRank);
            const toRankCoords = getRankCoordinates(nextAnimation.toRank);
            setUserPromotingAnimation({
                id: animationId,
                startX: fromRankCoords.x,
                startY: fromRankCoords.y,
                endX: toRankCoords.x,
                endY: toRankCoords.y,
                userAddress: nextAnimation.user
            });
            break;
        default:
          break;
      }

      const animationDuration = 2000; // Contoh durasi animasi
      const timer = setTimeout(() => {
        const completedAnimation = animationQueue[0];
        setAnimationQueue(prev => prev.slice(1));

        // Tambahkan animasi yang selesai ke riwayat aktivitas yang ditampilkan
        setDisplayedActivities(prev => {
            const newActivities = [completedAnimation, ...prev];
            // Batasi jumlah aktivitas yang ditampilkan (misal, 10-15 terakhir)
            return newActivities.slice(0, 15);
        });

        // Hapus koin yang sudah selesai animasi dari state
        setAnimatedCoins(prev => {
          const newCoins = { ...prev };
          delete newCoins[animationId];
          delete newCoins[`${animationId}-promo`];
          delete newCoins[`${animationId}-plat`];
          delete newCoins[`${animationId}-receiver`]; // Hapus koin penerima
          return newCoins;
        });
        // Hapus animasi user jika sudah selesai
        if(completedAnimation.type === 'USER_RANK_PROMOTE') {
            setUserPromotingAnimation(null);
        }
        // Set processing cycle to false after animation completes
        if (completedAnimation.type === 'RANK_CYCLE_COMPLETE') {
            setIsProcessingCycle(prev => ({ ...prev, [Number(completedAnimation.rank)]: false }));
            // Refetch gasSubsidyPool after a cycle completes as platform fees go into it
            refetchGasSubsidyPool();
        }
        // Refetch totalReceivers after a receiver status update, as a new receiver may be added
        if (completedAnimation.type === 'RECEIVE_FUNDS') {
          refetchTotalReceivers();
        }
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [animationQueue, ranksData, getRankCoordinates, userAddress, nobleGiftRank, refetchGasSubsidyPool, refetchTotalReceivers, promotionWalletX, promotionWalletY, platformWalletX, platformWalletY]);

  // Fungsi callback ketika animasi koin selesai
  const handleCoinAnimationEnd = useCallback((id) => {
    setAnimatedCoins(prev => {
      const newCoins = { ...prev };
      delete newCoins[id];
      return newCoins;
    });
  }, []);

  // Fungsi callback ketika animasi promosi user selesai
  const handleUserPromotionAnimationEnd = useCallback((id) => {
    // Hanya set null jika ID yang selesai cocok
    if(userPromotingAnimation && userPromotingAnimation.id === id) {
        setUserPromotingAnimation(null);
    }
  }, [userPromotingAnimation]);

  // Fungsi callback ketika animasi user masuk antrean selesai
  const handleQueueUserAnimationEnd = useCallback((id) => {
    setAnimatedQueueUsers(prev => {
      const newUsers = { ...prev };
      delete newUsers[id];
      return newUsers;
    });
  }, []);

  // Fungsi untuk mendapatkan nama Rank
  const getNobleGiftRankName = useCallback((rank) => {
    const nobleGiftRankNames = {
      1: 'Squire', 2: 'Knight', 3: 'Baron', 4: 'Viscount',
      5: 'Earl', 6: 'Marquis', 7: 'Duke', 8: 'Archon',
    };
    return nobleGiftRankNames[rank] || 'N/A';
  }, []);

  // Komponen render untuk visualisasi
  return (
    <div className="noblegift-visualization-container bg-[#1A3A6A] p-6 rounded-lg shadow-lg min-h-[2100px] flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-[#F5C45E] mb-8">Perjalanan NobleGift</h2>

      {/* Tampilan Ringkasan Status Anda */}
      <div className="user-status-summary text-white text-lg mb-8 p-4 bg-[#102E50] rounded-lg shadow-md w-full max-w-lg text-center">
        <p>Status Anda: <span className="font-semibold text-[#4DA8DA]">{nobleGiftStatus || 'Memuat...'}</span></p>
        <p>Rank Anda: <span className="font-semibold text-[#F5C45E]">{nobleGiftRank ? `${getNobleGiftRankName(Number(nobleGiftRank))} (Rank ${nobleGiftRank})` : 'Memuat...'}</span></p>
        {gasSubsidyPool !== undefined && (
          <div className="mt-2 text-sm">
            <p>Gas Subsidy Pool: <span className="font-semibold text-[#00FF00]">{ethers.formatEther(gasSubsidyPool)} ETH</span></p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min((Number(ethers.formatEther(gasSubsidyPool)) / MAX_GAS_SUBSIDY_POOL_TARGET) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-right text-gray-400 text-xs">Target: {MAX_GAS_SUBSIDY_POOL_TARGET} ETH</p>
          </div>
        )}
        {totalReceivers !== undefined && (
          <p className="mt-2">Total Penerima: <span className="font-semibold text-[#4DA8DA]">{Number(totalReceivers)}</span></p>
        )}
      </div>

      {/* Area SVG untuk Visualisasi Alur Rank */}
      <div className="relative w-full bg-[#102E50] rounded-lg border border-[#4DA8DA]/30 overflow-hidden flex items-center justify-center min-h-[2100px]">
        <svg className="absolute w-full h-full" viewBox="0 0 1400 2100"> {/* Perbesar viewBox untuk menampung 8 rank */}
          {/* Definisi gradien untuk visualisasi */} 
          <defs>
            <linearGradient id="rankGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4DA8DA" />
              <stop offset="100%" stopColor="#F5C45E" />
            </linearGradient>
            <linearGradient id="userRankGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5C45E" />
              <stop offset="100%" stopColor="#E78B48" />
            </linearGradient>
            <linearGradient id="fullRankGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF00" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Representasi user statis */}
          <g transform="translate(150, 500)" className="user-avatar-container">
            <circle cx="0" cy="0" r="30" fill="#F5C45E" stroke="#E78B48" strokeWidth="2" />
            <UsersIcon className="text-[#102E50] w-12 h-12" x="-24" y="-24" />
            <text x="0" y="45" textAnchor="middle" fill="#F5C45E" fontSize="12">
              {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Your Wallet'}
            </text>
          </g>

          {/* Garis penghubung antar Rank (sederhana) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const rank = i + 1;
            const circleRadius = 200; // Define locally for line calculations
            if (rank < 8) { // Gambar garis ke rank berikutnya
              const currentRankCoords = getRankCoordinates(rank);
              const nextRankCoords = getRankCoordinates(rank + 1);

              // Untuk Rank genap, garisnya menuju Rank berikutnya di baris baru
              if (rank % 2 === 0) { 
                // Garis vertikal dan horizontal untuk melompat ke baris berikutnya
                return (
                  <path
                    key={`line-${rank}`}
                    d={`M ${currentRankCoords.x + circleRadius} ${currentRankCoords.y} V ${nextRankCoords.y} H ${nextRankCoords.x - circleRadius}`}
                    stroke="#4DA8DA" strokeWidth="2" strokeDasharray="4 4"
                    fill="none"
                  />
                );
              } else {
                // Garis horizontal antar rank di baris yang sama
                return (
                  <path
                    key={`line-${rank}`}
                    d={`M ${currentRankCoords.x + circleRadius} ${currentRankCoords.y} L ${nextRankCoords.x - circleRadius} ${nextRankCoords.y}`}
                    stroke="#4DA8DA" strokeWidth="2" strokeDasharray="4 4"
                    fill="none"
                  />
                );
              }
            }
            return null;
          })}

          {Array.from({ length: 8 }).map((_, i) => {
            const rank = i + 1;
            const rankInfo = ranksData[rank];
            const isUserCurrentRank = nobleGiftRank && Number(nobleGiftRank) === rank;
            const isRankProcessing = isProcessingCycle[rank];
            
            const col = (rank - 1) % 2;
            const row = Math.floor((rank - 1) / 2);
            const x = 250 + col * 700;
            const y = 150 + row * 550;
            const circleRadius = 200;
            const slotRadius = 35;
            const slotPositions = [
              { dx: 0, dy: -140 }, { dx: 120, dy: -70 }, { dx: 120, dy: 70 },
              { dx: 0, dy: 140 }, { dx: -120, dy: 70 }, { dx: -120, dy: -70 }
            ];

            return ( 
              <g key={rank} transform={`translate(${x}, ${y})`}> 
                <circle
                  cx="0" cy="0" r={circleRadius}
                  fill={isUserCurrentRank ? 'url(#userRankGlow)' : 
                        (isRankProcessing ? 'rgba(245, 196, 94, 0.2)' : 
                        (rankInfo?.isFull ? 'url(#fullRankGlow)' : 'rgba(77, 168, 218, 0.1)'))}
                  stroke={isUserCurrentRank ? '#F5C45E' : 
                          (isRankProcessing ? '#E78B48' : 
                          (rankInfo?.isFull ? '#00FF00' : '#4DA8DA'))}
                  strokeWidth={isUserCurrentRank ? '4' : (isRankProcessing || rankInfo?.isFull ? '3' : '2')}
                  className="transition-all duration-300 ease-in-out transform hover:scale-105"
                  filter={isRankProcessing ? 'url(#glow)' : ''}
                />
                
                <text x="0" y="-100" textAnchor="middle" fill={isUserCurrentRank || isRankProcessing ? '#102E50' : '#F5C45E'} fontSize="36" fontWeight="bold">
                  Rank {rank}
                </text>
                <text x="0" y="-50" textAnchor="middle" fill={isUserCurrentRank || isRankProcessing ? '#102E50' : '#4DA8DA'} fontSize="24">
                  {rankInfo?.rankDonationValue ? `${ethers.formatEther(rankInfo.rankDonationValue)} ETH` : 'Memuat...'}
                </text>
                {maxDonorsPerRank !== undefined && (
                  <text x="0" y="-10" textAnchor="middle" fill={isUserCurrentRank || isRankProcessing ? '#102E50' : '#F5C45E'} fontSize="20">
                    {rankInfo?.donors ? `${rankInfo.donors.length}/${Number(maxDonorsPerRank)} Slots` : 'Memuat...'}
                  </text>
                )}

                {slotPositions.map((pos, idx) => {
                  const donorAddress = rankInfo?.donors[idx];
                  const isCurrentUserDonor = donorAddress && userAddress && donorAddress.toLowerCase() === userAddress.toLowerCase();
                  return (
                    <g key={idx} transform={`translate(${pos.dx}, ${pos.dy})`}>
                      <circle
                        cx="0" cy="0" r={slotRadius}
                        fill={donorAddress ? (isCurrentUserDonor ? '#00FF00' : '#E78B48') : '#335580'} 
                        stroke="#F5C45E" strokeWidth="1"
                      />
                      {donorAddress && (
                        <>
                          <UsersIcon className="text-white w-14 h-14" x="-14" y="-14" />
                          <text x="0" y="20" textAnchor="middle" fill="#102E50" fontSize="16">
                            {`${donorAddress.slice(0, 4)}...`}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}

                {rankInfo && rankInfo.waitingQueue.length > 0 && (
                  <g transform={`translate(${circleRadius + 60}, 0)`}> 
                    <text x="0" y="-40" fill="#4DA8DA" fontSize="18">Antrean:</text>
                    {rankInfo.waitingQueue.slice(0, 3).map((user, idx) => (
                      <g key={user} transform={`translate(0, ${-15 + (idx * 40)})`}> 
                        <circle cx="0" cy="0" r="20" fill="#4DA8DA" stroke="#102E50" strokeWidth="1" /> 
                        <UsersIcon className="text-white w-10 h-10" x="-10" y="-10" /> 
                        <text x="0" y="25" textAnchor="middle" fill="#F5C45E" fontSize="14">
                          {`${user.slice(0, 4)}...`}
                        </text>
                      </g>
                    ))}
                    {rankInfo.waitingQueue.length > 3 && (
                      <text x="0" y={-15 + (3 * 40)} fill="#F5C45E" fontSize="16">...dan {rankInfo.waitingQueue.length - 3} lainnya</text> 
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* Ikon Wallet (Promotion dan Platform) */}
          <g transform="translate(1300, 50)">
            <MegaphoneIcon className="text-[#4DA8DA] w-12 h-12" /> 
            <text x="0" y="-30" textAnchor="middle" fill="#4DA8DA" fontSize="14">Promotion</text>
          </g>

          <g transform="translate(1300, 600)">
            <BuildingOfficeIcon className="text-[#4DA8DA] w-12 h-12" /> 
            <text x="0" y="-30" textAnchor="middle" fill="#4DA8DA" fontSize="14">Platform</text>
          </g>

          {/* Render koin animasi yang sedang berjalan */}
          {Object.entries(animatedCoins).map(([id, coin]) => (
            <AnimatedCoin
              key={id}
              id={id}
              startX={coin.startX}
              startY={coin.startY}
              endX={coin.endX}
              endY={coin.endY}
              duration={1500} 
              onAnimationEnd={handleCoinAnimationEnd}
            >
              <circle cx="0" cy="0" r="8" fill={coin.color} stroke="#fff" strokeWidth="1" />
            </AnimatedCoin>
          ))}

          {/* Render animasi promosi user jika aktif */}
          {userPromotingAnimation && (
              <AnimatedUserMovingIcon
                  id={userPromotingAnimation.id}
                  startX={userPromotingAnimation.startX}
                  startY={userPromotingAnimation.startY}
                  endX={userPromotingAnimation.endX}
                  endY={userPromotingAnimation.endY}
                  userAddress={userPromotingAnimation.userAddress}
                  onAnimationEnd={handleUserPromotionAnimationEnd}
              />
          )}

          {/* Render animasi user masuk antrean jika aktif */}
          {Object.entries(animatedQueueUsers).map(([id, userAnim]) => (
            <AnimatedQueueUser
              key={id}
              id={id}
              startX={userAnim.startX}
              startY={userAnim.startY}
              endX={userAnim.endX}
              endY={userAnim.endY}
              userAddress={userAnim.userAddress}
              onAnimationEnd={handleQueueUserAnimationEnd}
            />
          ))}

          {/* Notifikasi Animasi (misal, teks "Donasi Masuk!") */}
          {animationQueue.length > 0 && (
            <div xmlns="http://www.w3.org/1999/xhtml" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500/80 text-white px-4 py-2 rounded-lg text-xl animate-bounce">
              {animationQueue[0].type === 'DONATION' && `Donasi diterima! dari ${animationQueue[0].donor.slice(0, 6)}...`} 
              {animationQueue[0].type === 'RECEIVE_FUNDS' && `Dana diterima! oleh ${animationQueue[0].user.slice(0, 6)}...`} 
              {animationQueue[0].type === 'JOIN_QUEUE' && `Antrean bergabung! oleh ${animationQueue[0].user.slice(0, 6)}...`} 
              {animationQueue[0].type === 'RANK_CYCLE_COMPLETE' && `Siklus Rank ${animationQueue[0].rank} selesai! Distribusi dana.`} 
              {animationQueue[0].type === 'USER_RANK_PROMOTE' && `Selamat! ${animationQueue[0].user.slice(0, 6)}... Naik ke Rank ${animationQueue[0].toRank}!`} 
            </div>
          )}
        </svg>
      </div>

      {/* Area untuk Menampilkan Histori Event NobleGift Terakhir */}
      <div className="recent-events mt-8 w-full max-w-4xl bg-[#102E50] p-4 rounded-lg border border-[#4DA8DA]/30">
        <h3 className="text-xl font-semibold text-[#F5C45E] mb-4">Aktivitas NobleGift Terakhir</h3>
        <ul className="text-sm text-gray-300">
          {displayedActivities.map((anim, index) => (
            <li key={index} className="mb-1">
              {anim.type === 'DONATION' && `Donor ${anim.donor.slice(0,6)}...${anim.donor.slice(-4)} berdonasi ke Rank ${anim.rank} (${ethers.formatEther(anim.amount)} ETH)`}
              {anim.type === 'JOIN_QUEUE' && `User ${anim.user.slice(0,6)}...${anim.user.slice(-4)} masuk antrean Rank ${anim.rank}`} 
              {anim.type === 'RECEIVE_FUNDS' && `User ${anim.user.slice(0,6)}...${anim.user.slice(-4)} menerima ${ethers.formatEther(anim.amount)} ETH dari Rank ${anim.rank}`}
              {anim.type === 'RANK_CYCLE_COMPLETE' && `Siklus Rank ${anim.rank} selesai.`}
              {anim.type === 'USER_RANK_PROMOTE' && `User ${anim.user.slice(0,6)}... berhasil promosi ke Rank ${anim.toRank}.`}
            </li>
          ))}
          {displayedActivities.length === 0 && <li className="text-center text-gray-500">Tidak ada aktivitas baru...</li>}
        </ul>
      </div>
    </div>
  );
};

// Define a target for the gas subsidy pool progress bar (example value)
const MAX_GAS_SUBSIDY_POOL_TARGET = 10; // In ETH, adjust as needed

export default NobleGiftVisualization; 