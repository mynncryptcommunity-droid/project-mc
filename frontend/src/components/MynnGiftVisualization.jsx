import React, { useState, useEffect, useCallback } from 'react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { ethers } from 'ethers';
import { UsersIcon, ArrowUpCircleIcon, CurrencyDollarIcon, MegaphoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

// Renamed from NobleGiftVisualization to MynnGiftVisualization for branding consistency

// Impor gambar dari folder assets
import bnbGold from '../assets/bnb-gold.png';
import avatar from '../assets/avatar.png';
import promotionRank2 from '../assets/promotion-rank-2.png';
import promotionRank3 from '../assets/promotion-rank-3.png';
import promotionRank4 from '../assets/promotion-rank-4.png';
import promotionRank5 from '../assets/promotion-rank-5.png';
import promotionRank6 from '../assets/promotion-rank-6.png';
import promotionRank7 from '../assets/promotion-rank-7.png';
import promotionRank8 from '../assets/promotion-rank-8.png';
import platformImg from '../assets/platform.png';

// Untuk animasi spin-coin pada koin bnb-gold, pastikan style CSS global sudah diimport jika style JSX tidak didukung oleh framework.

// Komponen sederhana untuk koin animasi dengan gambar BNB Gold
const AnimatedCoin = ({ id, startX, startY, endX, endY, onAnimationEnd, duration = 1000 }) => {
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
    <g transform={`translate(${position.x}, ${position.y})`} className="animated-coin">
      <image href={bnbGold} width="100" height="100" x="-50" y="-50" preserveAspectRatio="xMidYMid meet" className="spin-coin" />
    </g>
  );
};

// Komponen untuk animasi user avatar saat promosi rank dengan gambar kustom
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
      <image href={avatar} width="30" height="60" x="-15" y="-30" preserveAspectRatio="xMidYMid meet" />
      <text x="0" y="40" textAnchor="middle" fill="#F5C45E" fontSize="8">
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
        y: startY + (endY - startY) * progress - 200,
      });
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
      <image href={avatar} width="31" height="61" x="-15.5" y="-30.5" preserveAspectRatio="xMidYMid meet" />
      <text x="0" y="35" textAnchor="middle" fill="#102E50" fontSize="8">
        {userAddress ? `${userAddress.slice(0, 4)}...` : ''}
      </text>
    </g>
  );
};

const NobleGiftVisualization = ({ mynngiftConfig, userAddress, streamType, streamLabel }) => {
  // Convert streamType to enum value (0 = A, 1 = B)
  const streamEnum = streamType === 'streamA' ? 0 : 1;
  
  // State lokal untuk data visualisasi
  const [ranksData, setRanksData] = useState({});
  // const [currentRankState, setCurrentRankState] = useState(null);
  const [animationQueue, setAnimationQueue] = useState([]);
  const [animatedCoins, setAnimatedCoins] = useState({});
  const [userPromotingAnimation, setUserPromotingAnimation] = useState(null);
  const [isProcessingCycle, setIsProcessingCycle] = useState({});
  const [animatedQueueUsers, setAnimatedQueueUsers] = useState({});
  const [displayedActivities, setDisplayedActivities] = useState([]);

  // --- 1. Fungsi koordinat rank ---
  const getRankCoordinates = useCallback((rank) => {
    const xLeft = 250;
    const xRight = 950; // 250 + 700 (consistent with original horizontal spacing)
    const yBase = 150;
    const yStep = 550; // (consistent with original vertical spacing)

    let x, y;

    switch (rank) {
      case 1: x = xLeft; y = yBase; break;
      case 2: x = xRight; y = yBase; break;
      case 3: x = xRight; y = yBase + yStep; break;
      case 4: x = xLeft; y = yBase + yStep; break;
      case 5: x = xLeft; y = yBase + 2 * yStep; break;
      case 6: x = xRight; y = yBase + 2 * yStep; break;
      case 7: x = xRight; y = yBase + 3 * yStep; break;
      case 8: x = xLeft; y = yBase + 3 * yStep; break;
      default: x = 0; y = 0; // Fallback for unexpected rank
    }
    return { x, y };
  }, []);

  // --- 2. Hitung posisi wallet setelah fungsi tersedia ---
  const rank4 = getRankCoordinates(4);
  const rank5 = getRankCoordinates(5);
  const rank6 = getRankCoordinates(6);
  const rank7 = getRankCoordinates(7);

  const promotionWalletX = (rank4.x + rank6.x) / 2;
  const promotionWalletY = (rank4.y + rank6.y) / 2;
  const platformWalletX = (rank5.x + rank7.x) / 2;
  const platformWalletY = (rank5.y + rank7.y) / 2;

  // Perbaiki: gunakan 8x useReadContract secara eksplisit untuk receiver history dengan stream parameter
  const { data: receiverHistory1 } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankReceiverHistory',
    args: [1, streamEnum],
    enabled: true,
  });
  const { data: receiverHistory2 } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankReceiverHistory',
    args: [2, streamEnum],
    enabled: true,
  });
  const { data: receiverHistory3 } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankReceiverHistory',
    args: [3, streamEnum],
    enabled: true,
  });
  const { data: receiverHistory4 } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankReceiverHistory',
    args: [4, streamEnum],
    enabled: true,
  });
  const { data: receiverHistory5 } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankReceiverHistory',
    args: [5, streamEnum],
    enabled: true,
  });
  const { data: receiverHistory6 } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankReceiverHistory',
    args: [6, streamEnum],
    enabled: true,
  });
  const { data: receiverHistory7 } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankReceiverHistory',
    args: [7, streamEnum],
    enabled: true,
  });
  const { data: receiverHistory8 } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getRankReceiverHistory',
    args: [8, streamEnum],
    enabled: true,
  });
  const receiverHistories = [
    receiverHistory1 || [],
    receiverHistory2 || [],
    receiverHistory3 || [],
    receiverHistory4 || [],
    receiverHistory5 || [],
    receiverHistory6 || [],
    receiverHistory7 || [],
    receiverHistory8 || [],
  ];

     

  // --- 1. Ambil Data Awal dan Real-time dari Kontrak --- //

  // User's status as donor/receiver
  const { data: isDonorStream, refetch: refetchIsDonor } = useReadContract({
    ...mynngiftConfig,
    functionName: streamType === 'streamA' ? 'isDonor_StreamA' : 'isDonor_StreamB',
    args: [userAddress],
    enabled: !!userAddress,
    watch: true,  // ✅ Real-time update
  });

  const { data: isReceiverStream, refetch: refetchIsReceiver } = useReadContract({
    ...mynngiftConfig,
    functionName: streamType === 'streamA' ? 'isReceiver_StreamA' : 'isReceiver_StreamB',
    args: [userAddress],
    enabled: !!userAddress,
    watch: true,  // ✅ Real-time update
  });

  // Debug: Log status changes
  useEffect(() => {
    console.log('📊 STATUS DEBUG:', {
      isDonorStream,
      isReceiverStream,
      queuePosition: queuePosition ? Number(queuePosition) : null,
      nobleGiftRank: nobleGiftRank ? Number(nobleGiftRank) : null,
    });
  }, [isDonorStream, isReceiverStream, queuePosition, nobleGiftRank]);

  // User's NobleGift Status
  const { data: nobleGiftStatus, refetch: refetchNobleGiftStatus } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getUserStatus',
    args: [userAddress],
    enabled: !!userAddress,
    watch: true,  // ✅ Real-time update for status changes
  });

  // User's NobleGift Rank (needed for stream visualization)
  const { data: nobleGiftRank, refetch: refetchNobleGiftRank } = useReadContract({
    ...mynngiftConfig,
    functionName: streamType === 'streamA' ? 'getUserRank_StreamA' : 'getUserRank_StreamB',
    args: [userAddress],
    enabled: !!userAddress,
    watch: true,  // ✅ Real-time update for rank changes
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
    watch: true,  // ✅ Watch for real-time updates
  });

  // Ambil nilai totalReceivers
  const { data: totalReceivers, refetch: refetchTotalReceivers } = useReadContract({
    ...mynngiftConfig,
    functionName: 'totalReceivers',
    enabled: true,
    watch: true,  // ✅ Watch for real-time updates
  });

  // Tambahkan hook untuk mengambil posisi antrean user
  const { data: queuePosition, refetch: refetchQueuePosition } = useReadContract({
    ...mynngiftConfig,
    functionName: 'getWaitingQueuePosition',
    args: [nobleGiftRank, userAddress],
    enabled: !!userAddress && !!nobleGiftRank,
    watch: true,  // ✅ Real-time update for queue position
  });

  // Ambil data untuk setiap Rank
  const rankReads = Array.from({ length: 8 }, (_, i) => {
    const rank = i + 1;
    const { data: currentDonors, refetch: refetchCurrentDonors } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getRankDonorHistory',
      args: [rank, streamEnum],
      enabled: true,
    });
    const { data: waitingQueue, refetch: refetchWaitingQueue } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getRankWaitingQueueByStream',
      args: [rank, streamEnum],
      enabled: true,
    });
    const { data: currentRankStatus, refetch: refetchCurrentRankStatus } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getCurrentRankStatus',
      args: [rank, streamEnum],
      enabled: true,
    });
    const { data: queueStatus, refetch: refetchQueueStatus } = useReadContract({
      ...mynngiftConfig,
      functionName: 'getQueueStatus',
      args: [rank, streamEnum],
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
      args: [rank, streamEnum],
      enabled: true,
    });

    return {
      rank,
      currentDonors: currentDonors || [],
      waitingQueue: waitingQueue || [],
      currentRankStatus: currentRankStatus,
      queueStatus: queueStatus,
      // Apply stream-specific multiplier: Stream B is 0.0936/0.0081 = ~11.56x Stream A
      rankDonationValue: rankDonationValue && streamEnum === 1 ? (BigInt(rankDonationValue) * 93600000000000000n / 8100000000000000n) : rankDonationValue,
      currentRankCycle: currentRankCycle,
      refetchCurrentDonors,
      refetchWaitingQueue,
      refetchCurrentRankStatus,
      refetchQueueStatus,
      refetchRankDonationValue,
      refetchCurrentRankCycle,
    };
  });

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

    if (nobleGiftRank !== undefined && nobleGiftRank !== null && newRanksData[Number(nobleGiftRank)]) {
      // setCurrentRankState(newRanksData[Number(nobleGiftRank)]);
    }
    console.log('Receiver Histories:', receiverHistories);
    receiverHistories.forEach((history, index) => {
      console.log(`Rank ${index + 1} Receiver History:`, history);
      if (history.length > 0) {
        console.log(`Last Receiver for Rank ${index + 1}:`, history[history.length - 1]);
      }
    });
  }, [nobleGiftRank, maxDonorsPerRank, ...rankReads.flatMap(r => [r.currentDonors, r.waitingQueue, r.currentRankStatus, r.queueStatus, r.rankDonationValue, r.currentRankCycle]), ...receiverHistories]);

  // --- 2. Dengarkan Event Real-time untuk Animasi --- //

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

  useWatchContractEvent({
    ...mynngiftConfig,
    eventName: 'ReceiverStatusUpdated',
    onLogs(logs) {
      logs.forEach(async log => {
        const { user: eventUser, rank: receivedRank, amount: eventAmount } = log.args;
        console.log(`ReceiverStatusUpdated: ${eventUser} received ${ethers.formatEther(eventAmount)} from Rank ${receivedRank}`);

        const rankInfo = ranksData[Number(receivedRank)];
        if (rankInfo && rankInfo.refetchWaitingQueue) {
          await rankInfo.refetchWaitingQueue();
        }

        const oldUserRank = nobleGiftRank ? Number(nobleGiftRank) : 0;

        await refetchNobleGiftStatus();
        await refetchNobleGiftRank();

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

  useWatchContractEvent({
    ...mynngiftConfig,
    eventName: 'RankCycleCompleted',
    onLogs(logs) {
      // Use for...of instead of forEach to properly await async operations
      (async () => {
        for (const log of logs) {
          const { rank: eventRank, cycleNumber: eventCycleNumber, donors: eventDonors } = log.args;
          console.log(`RankCycleCompleted: Rank ${eventRank} completed cycle ${eventCycleNumber}`);
          setIsProcessingCycle(prev => ({ ...prev, [Number(eventRank)]: true }));

          const rankInfo = ranksData[Number(eventRank)];
          if (rankInfo && rankInfo.refetchDonors && rankInfo.refetchCurrentRankStatus && rankInfo.refetchWaitingQueue) {
            await rankInfo.refetchDonors();
            await rankInfo.refetchCurrentRankStatus();
            await rankInfo.refetchWaitingQueue();
          }
          
          // CRITICAL: Refetch user's own status and queue position - MUST AWAIT
          console.log('🔄 Refetching user status after rank cycle...');
          await refetchIsDonor();
          await refetchIsReceiver();
          await refetchQueuePosition();
          await refetchNobleGiftRank();
          await refetchNobleGiftStatus();
          console.log('✅ User status refetch complete');
          
          // Also refetch next rank's data to show it's ready for new donors
          const nextRank = Number(eventRank) + 1;
          if (nextRank <= 8) {
            const nextRankInfo = ranksData[nextRank];
            if (nextRankInfo && nextRankInfo.refetchDonors && nextRankInfo.refetchWaitingQueue) {
              // Small delay to allow contract to fully process
              await new Promise(resolve => setTimeout(resolve, 500));
              await nextRankInfo.refetchDonors();
              await nextRankInfo.refetchWaitingQueue();
            }
          }
          
          // Refetch gas subsidy pool when rank cycle completes
          if (refetchGasSubsidyPool) {
            await refetchGasSubsidyPool();
          }
          setAnimationQueue(prev => [...prev, { type: 'RANK_CYCLE_COMPLETE', rank: Number(eventRank), cycleNumber: Number(eventCycleNumber), donors: eventDonors }]);
        }
      })();
    },
  });

  // --- 3. Logika & Komponen Visualisasi --- //

  useEffect(() => {
    if (animationQueue.length > 0) {
      const nextAnimation = animationQueue[0];
      console.log('Memicu animasi:', nextAnimation.type, nextAnimation);

      const animationId = Date.now().toString();
      let startX, startY, endX, endY;
      let coinColor = "#F5C45E";

      switch (nextAnimation.type) {
        case 'DONATION':
          startX = 150;
          startY = 410;
          {
            const targetRankCoords = getRankCoordinates(nextAnimation.rank);
            endX = targetRankCoords.x;
            endY = targetRankCoords.y - 180;
          }
          coinColor = "#F5C45E";
          setAnimatedCoins(prev => ({
            ...prev,
            [animationId]: { startX, startY, endX, endY, color: coinColor, amount: nextAnimation.amount, type: 'DONATION' }
          }));
          break;
        case 'RECEIVE_FUNDS':
          {
            const sourceRankCoords = getRankCoordinates(nextAnimation.rank);
            startX = sourceRankCoords.x;
            startY = sourceRankCoords.y;
            endX = 150;
            endY = 500;
          }
          coinColor = "#00FF00";
          setAnimatedCoins(prev => ({
            ...prev,
            [animationId]: { startX, startY, endX, endY, color: coinColor, amount: nextAnimation.amount, type: 'RECEIVE' }
          }));
          break;
        case 'RANK_CYCLE_COMPLETE':
          {
            const completedRankCoords = getRankCoordinates(nextAnimation.rank);
            const totalFunds = ranksData[nextAnimation.rank]?.totalFunds;
            if (totalFunds) {
              const promotionShare = (totalFunds * 45n) / 100n;
              const feeShare = (totalFunds * 5n) / 100n;
              const receiverShare = (totalFunds * 50n) / 100n;

              setAnimatedCoins(prev => ({
                ...prev,
                [`${animationId}-receiver`]: { startX: completedRankCoords.x, startY: completedRankCoords.y, endX: 600, endY: 2400, color: "#00FF00", amount: receiverShare, type: 'RECEIVER_SHARE' }
              }));
              setAnimatedCoins(prev => ({
                ...prev,
                [`${animationId}-promo`]: { startX: completedRankCoords.x, startY: completedRankCoords.y, endX: promotionWalletX, endY: promotionWalletY, color: "#4DA8DA", amount: promotionShare, type: 'PROMOTION' }
              }));
              setAnimatedCoins(prev => ({
                ...prev,
                [`${animationId}-plat`]: { startX: completedRankCoords.x, startY: completedRankCoords.y, endX: platformWalletX, endY: platformWalletY, color: "#4DA8DA", amount: feeShare, type: 'PLATFORM' }
              }));
            }
          }
          break;
        case 'JOIN_QUEUE':
          {
            const queueRankCoords = getRankCoordinates(nextAnimation.rank);
            const circleRadius = 200; // radius lingkaran rank
            startX = 150;
            startY = 500;
            endX = queueRankCoords.x + circleRadius + 60;
            endY = queueRankCoords.y;
          }
          setAnimatedQueueUsers(prev => ({
            ...prev,
            [animationId]: { startX, startY, endX, endY, userAddress: nextAnimation.user }
          }));
          break;
        case 'USER_RANK_PROMOTE':
          {
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
          }
          break;
      }

      const animationDuration = 2000;
      const timer = setTimeout(() => {
        const completedAnimation = animationQueue[0];
        setAnimationQueue(prev => prev.slice(1));
        setDisplayedActivities(prev => [completedAnimation, ...prev].slice(0, 15));
        setAnimatedCoins(prev => {
          const newCoins = { ...prev };
          delete newCoins[animationId];
          delete newCoins[`${animationId}-promo`];
          delete newCoins[`${animationId}-plat`];
          delete newCoins[`${animationId}-receiver`];
          return newCoins;
        });
        if (completedAnimation.type === 'USER_RANK_PROMOTE') setUserPromotingAnimation(null);
        if (completedAnimation.type === 'RANK_CYCLE_COMPLETE') {
          setIsProcessingCycle(prev => ({ ...prev, [Number(completedAnimation.rank)]: false }));
          refetchGasSubsidyPool();
        }
        if (completedAnimation.type === 'RECEIVE_FUNDS') refetchTotalReceivers();
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [animationQueue, ranksData, getRankCoordinates, userAddress, nobleGiftRank, refetchGasSubsidyPool, refetchTotalReceivers, promotionWalletX, promotionWalletY, platformWalletX, platformWalletY]);

  const handleCoinAnimationEnd = useCallback((id) => {
    setAnimatedCoins(prev => {
      const newCoins = { ...prev };
      delete newCoins[id];
      return newCoins;
    });
  }, []);

  const handleUserPromotionAnimationEnd = useCallback((id) => {
    if (userPromotingAnimation && userPromotingAnimation.id === id) setUserPromotingAnimation(null);
  }, [userPromotingAnimation]);

  const handleQueueUserAnimationEnd = useCallback((id) => {
    setAnimatedQueueUsers(prev => {
      const newUsers = { ...prev };
      delete newUsers[id];
      return newUsers;
    });
  }, []);

  const getNobleGiftRankName = useCallback((rank) => {
    const nobleGiftRankNames = {
      1: 'Squire', 2: 'Knight', 3: 'Baron', 4: 'Viscount',
      5: 'Earl', 6: 'Marquis', 7: 'Duke', 8: 'Archon',
    };
    return nobleGiftRankNames[rank] || 'N/A';
  }, []);

  // Determine user role based on donor/receiver status
  const getUserRoleStatus = useCallback(() => {
    // Priority: Check queue position first
    if (queuePosition && Number(queuePosition) > 0) {
      return { role: 'IN QUEUE', color: '#4DA8DA', icon: '⏳', description: `Position #${Number(queuePosition)}` };
    } else if (isReceiverStream) {
      return { role: 'RECEIVER', color: '#00FF88', icon: '💚', description: 'Receiving funds' };
    } else if (isDonorStream) {
      return { role: 'DONOR', color: '#F5C45E', icon: '💛', description: 'Contributing to rank' };
    } else {
      return { role: 'INACTIVE', color: '#999999', icon: '⭕', description: 'Not active in this stream' };
    }
  }, [isDonorStream, isReceiverStream, queuePosition]);

  // Fungsi untuk translate status dari bahasa Indonesia ke Inggris
  const formatStatusDisplay = useCallback((status) => {
    if (!status) return 'Loading...';
    const statusMap = {
      'tidak aktif': 'Not Active',
      'Tidak Aktif': 'Not Active',
      'aktif': 'Active',
      'Aktif': 'Active',
    };
    return statusMap[status] || status; // Return original if not found in map
  }, []);

  // Fungsi untuk mendapatkan gambar berdasarkan rank
  const getPromotionImage = (rank) => {
    switch (rank) {
      case 2: return promotionRank2;
      case 3: return promotionRank3;
      case 4: return promotionRank4;
      case 5: return promotionRank5;
      case 6: return promotionRank6;
      case 7: return promotionRank7;
      case 8: return promotionRank8;
      default: return promotionRank2; // Default fallback untuk rank 1 atau undefined
    }
  };

  return (
    <div className="noblegift-visualization-container bg-gradient-to-b from-[#1A3A6A] to-[#102E50] p-4 sm:p-8 rounded-xl shadow-2xl min-h-0 flex flex-col items-center justify-center w-full">
      {/* Header dengan Gradient */}
      <div className="w-full text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#F5C45E] via-[#E78B48] to-[#F5C45E] bg-clip-text text-transparent mb-2 drop-shadow-lg">🏆 MynnGift Journey</h2>
        <div className="h-1 w-24 bg-gradient-to-r from-[#4DA8DA] to-[#F5C45E] rounded-full mx-auto"></div>
      </div>

      {/* Tampilan Ringkasan Status Anda - Enhanced */}
      <div className="user-status-summary text-white mb-8 p-6 bg-gradient-to-br from-[#102E50] via-[#1A3A6A] to-[#102E50] rounded-xl shadow-xl border border-[#4DA8DA]/40 w-full max-w-2xl hover:shadow-2xl hover:border-[#4DA8DA]/60 transition-all duration-300 ease-out">
        {/* Status Row */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4 gap-4">
          <div className="text-center sm:text-left">
            <p className="text-gray-400 text-sm mb-1">Your Status</p>
            <p className="text-lg font-semibold text-[#4DA8DA]">{formatStatusDisplay(nobleGiftStatus)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">Your Rank</p>
            <p className="text-lg font-semibold text-[#F5C45E]">{nobleGiftRank ? `${getNobleGiftRankName(Number(nobleGiftRank))} (Rank ${nobleGiftRank})` : 'Loading...'}</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-gray-400 text-sm mb-1">Queue</p>
            <p className="text-lg font-semibold text-[#FFD700]">{queuePosition && Number(queuePosition) > 0 ? `#${Number(queuePosition)}` : 'n/a'}</p>
          </div>
          <div className="text-center sm:text-right">
            {(() => {
              const roleStatus = getUserRoleStatus();
              return (
                <>
                  <p className="text-gray-400 text-sm mb-1">Your Role</p>
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <span style={{ color: roleStatus.color }} className="text-lg">{roleStatus.icon}</span>
                    <p className="text-lg font-semibold" style={{ color: roleStatus.color }}>{roleStatus.role}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{roleStatus.description}</p>
                </>
              );
            })()}
          </div>
        </div>

        <div className="border-t border-[#4DA8DA]/20 pt-4"></div>

        {/* Gas Subsidy Pool - Enhanced */}
        {gasSubsidyPool !== undefined && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-[#4DA8DA]">💰 Gas Subsidy Pool</p>
              <span className="text-lg font-bold text-[#F5C45E]">{ethers.formatEther(gasSubsidyPool)} opBNB</span>
            </div>

            {/* Enhanced Progress Bar with Gradient */}
            <div className="relative w-full bg-gradient-to-r from-[#1A3A6A] to-[#102E50] rounded-full h-6 border border-[#4DA8DA]/30 overflow-hidden shadow-inner">
              {/* Animated gradient fill */}
              <div
                className="h-full rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{
                  width: `${Math.min((Number(ethers.formatEther(gasSubsidyPool)) / MAX_GAS_SUBSIDY_POOL_TARGET) * 100, 100)}%`,
                  backgroundImage: 'linear-gradient(90deg, #4DA8DA, #00FF88, #FFD700, #F5C45E)',
                  boxShadow: '0 0 20px rgba(77, 168, 218, 0.8), inset 0 0 10px rgba(0, 255, 136, 0.4)'
                }}
              ></div>

              {/* Milestone Markers */}
              <div className="absolute inset-0 flex w-full h-full">
                {[25, 50, 75, 100].map((milestone) => (
                  <div
                    key={milestone}
                    className="flex-1 border-r border-[#4DA8DA]/20 last:border-r-0"
                    style={{ width: '25%' }}
                  >
                    <div className="flex items-center justify-center h-full text-white text-xs font-bold opacity-60">
                      {milestone}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Info */}
            <div className="mt-3 flex justify-between items-center text-xs">
              <span className="text-gray-400">Target: {MAX_GAS_SUBSIDY_POOL_TARGET} opBNB</span>
              <span className="text-[#00FF88] font-semibold">
                {Math.min((Number(ethers.formatEther(gasSubsidyPool)) / MAX_GAS_SUBSIDY_POOL_TARGET) * 100, 100).toFixed(1)}% Complete
              </span>
            </div>
          </div>
        )}

        {/* Total Receivers */}
        {totalReceivers !== undefined && (
          <div className="mt-4 text-center p-3 bg-[#4DA8DA]/10 rounded-lg">
            <p className="text-sm">Total Recipients: <span className="font-semibold text-[#4DA8DA]">{Number(totalReceivers)}</span></p>
          </div>
        )}
      </div>

      {/* Area SVG untuk Visualisasi Alur Rank - Enhanced */}
      <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-b from-[#102E50] to-[#0A1E2E] rounded-xl border border-[#4DA8DA]/40 overflow-hidden flex flex-col items-center justify-center aspect-[3/6] min-h-0 shadow-2xl hover:border-[#4DA8DA]/60 transition-all duration-300">
        <svg className="w-full h-full" viewBox="0 -200 1200 2400" preserveAspectRatio="xMidYMid meet">
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
            <linearGradient id="rankGradientLux" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A3A6A" />
              <stop offset="60%" stopColor="#4DA8DA" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dropShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
              <feOffset dx="4" dy="4" result="offsetBlur" />
              <feMerge>
                <feMergeNode in="offsetBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowLux">
              <feGaussianBlur stdDeviation="16" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="bgPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="#4DA8DA" opacity="0.08" />
              <rect x="0" y="0" width="60" height="60" fill="none" stroke="#4DA8DA" strokeWidth="0.5" opacity="0.04" />
            </pattern>
          </defs>

          {/* Representasi user statis */}
          <g transform="translate(150, 400)" className="user-avatar-container">
            <image href={bnbGold} width="80" height="80" x="-40" y="-40" preserveAspectRatio="xMidYMid meet" />
            <text x="0" y="45" textAnchor="middle" fill="#F5C45E" fontSize="12">
              {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Your Wallet'}
            </text>
          </g>

          {/* Garis penghubung antar Rank */}
          {Array.from({ length: 8 }).map((_, i) => {
            const rank = i + 1;
            const circleRadius = 200;
            if (rank < 8) {
              const currentRankCoords = getRankCoordinates(rank);
              const nextRankCoords = getRankCoordinates(rank + 1);
              let pathD = "";

              switch (rank) {
                case 1: // Rank 1 (left) to Rank 2 (right) - Horizontal
                case 5: // Rank 5 (left) to Rank 6 (right) - Horizontal
                  pathD = `M ${currentRankCoords.x + circleRadius} ${currentRankCoords.y} L ${nextRankCoords.x - circleRadius} ${nextRankCoords.y}`;
                  break;
                case 3: // Rank 3 (right) to Rank 4 (left) - Horizontal
                case 7: // Rank 7 (right) to Rank 8 (left) - Horizontal
                  pathD = `M ${currentRankCoords.x - circleRadius} ${currentRankCoords.y} L ${nextRankCoords.x + circleRadius} ${nextRankCoords.y}`;
                  break;
                case 2: // Rank 2 (right) to Rank 3 (right) - Vertical
                case 4: // Rank 4 (left) to Rank 5 (left) - Vertical
                case 6: // Rank 6 (right) to Rank 7 (right) - Vertical
                  pathD = `M ${currentRankCoords.x} ${currentRankCoords.y + circleRadius} L ${nextRankCoords.x} ${nextRankCoords.y - circleRadius}`;
                  break;
                default:
                  pathD = "";
              }

              return (
                <path
                  key={`line-${rank}`}
                  d={pathD}
                  stroke="#4DA8DA" strokeWidth="2" strokeDasharray="8 8" strokeDashoffset="0">
                  <animate attributeName="stroke-dashoffset" values="0;16" dur="1.2s" repeatCount="indefinite" />
                </path>
              );
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
            // Ambil penerima terakhir dari receiverHistories
            const receiverHistory = receiverHistories[i];
            const lastReceiver = receiverHistory && receiverHistory.length > 0 ? receiverHistory[receiverHistory.length - 1] : null;

            let displayedRank = rank;
            if (rank === 3) {
              displayedRank = 4;
            } else if (rank === 4) {
              displayedRank = 3;
            } else if (rank === 7) {
              displayedRank = 8;
            } else if (rank === 8) {
              displayedRank = 7;
            }

            return (
              <g key={rank} transform={`translate(${x}, ${y})`}>
                {lastReceiver && (
                  <g>
                    <image
                      href={avatar}
                      x={-30}
                      y={-circleRadius-80}
                      width={60}
                      height={60}
                      style={{ filter: 'drop-shadow(0 0 8px #FFD700)' }}
                    />
                    <text
                      x="0"
                      y={-circleRadius-30}
                      textAnchor="middle"
                      fill="#FFD700"
                      fontSize="18"
                      fontWeight="bold"
                      filter="url(#glowLux)"
                    >
                      {lastReceiver.slice(0, 6)}...
                    </text>
                  </g>
                )}
                <circle
                  cx="0" cy="0" r={circleRadius}
                  fill={isUserCurrentRank ? 'url(#userRankGlow)' :
                        (isRankProcessing ? 'rgba(245, 196, 94, 0.2)' :
                        (rankInfo?.isFull ? 'url(#fullRankGlow)' : 'url(#rankGradientLux)'))}
                  stroke={isUserCurrentRank ? '#FFD700' :
                          (isRankProcessing ? '#E78B48' :
                          (rankInfo?.isFull ? '#FFD700' : '#4DA8DA'))}
                  strokeWidth={isUserCurrentRank ? '7' : (isRankProcessing || rankInfo?.isFull ? '5' : '3')}
                  filter={isUserCurrentRank ? 'url(#glowLux)' : (rankInfo?.isFull ? 'url(#glowLux)' : 'url(#dropShadow)')}
                  className={isUserCurrentRank ? 'animate-pulse-lux' : 'transition-all duration-300 ease-in-out transform hover:scale-105'}
                />
                <ellipse cx="0" cy={-circleRadius/2} rx={circleRadius*0.7} ry={circleRadius*0.25} fill="#fff" opacity="0.13" />
                {isUserCurrentRank && (
                  <g transform="translate(0, -240)">
                    <text x="0" y="0" textAnchor="middle" fontSize="48" fill="#FFD700" filter="url(#glowLux)">👑</text>
                  </g>
                )}
                {rank === 8 && (
                  <g>
                    <text x="0" y={-circleRadius-30} textAnchor="middle" fontSize="32" fill="#FFD700" opacity="0.7">★</text>
                    <text x="0" y={-circleRadius-60} textAnchor="middle" fontSize="18" fill="#FFD700" opacity="0.5">LUX</text>
                  </g>
                )}
                {rankInfo?.isFull && (
                  <text x="0" y={circleRadius-30} textAnchor="middle" fontSize="22" fill="#FFD700" fontWeight="bold" filter="url(#glowLux)">Full</text>
                )}
                <title>{`Rank ${displayedRank}\nDonors: ${rankInfo?.donors?.length || 0}\nQueue: ${rankInfo?.waitingQueue?.length || 0}\nFunds: ${rankInfo?.totalFunds ? ethers.formatEther(rankInfo.totalFunds) : 0} opBNB`}</title>
                <text x="0" y="-40" textAnchor="middle" fill={isUserCurrentRank || isRankProcessing ? '#102E50' : '#F5C45E'} fontSize="36" fontWeight="bold">
                  Rank {displayedRank}
                </text>
                {/* Background untuk text agar lebih readable */}
                <rect x="-80" y="-18" width="160" height="40" fill="#102E50" opacity="0.7" rx="8" ry="8" />
                <text x="0" y="10" textAnchor="middle" fill={isUserCurrentRank || isRankProcessing ? '#FFD700' : '#F5C45E'} fontSize="28" fontWeight="bold" fontFamily="monospace">
                  {rankInfo?.rankDonationValue ? `${ethers.formatEther(rankInfo.rankDonationValue)} opBNB` : 'Loading...'}
                </text>
                {maxDonorsPerRank !== undefined && (
                  <text x="0" y="60" textAnchor="middle" fill={isUserCurrentRank || isRankProcessing ? '#102E50' : '#F5C45E'} fontSize="20">
                    {rankInfo?.donors ? `${rankInfo.donors.length}/${Number(maxDonorsPerRank)} Slots` : 'Loading...'}
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
                          <image href={avatar} width="28" height="28" x="-14" y="-14" preserveAspectRatio="xMidYMid meet" />
                          <text x="0" y="20" textAnchor="middle" fill="#102E50" fontSize="16">
                            {`${donorAddress.slice(0, 4)}...`}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
                {rankInfo && rankInfo.waitingQueue.length > 0 && rankInfo.waitingQueue.length < 6 && (
                  <g transform={`translate(${circleRadius + 60}, 0)`}>
                    <text x="0" y="-40" fill="#4DA8DA" fontSize="18">Queue:</text>
                    {rankInfo.waitingQueue.map((user, idx) => (
                      <g key={user} transform={`translate(${idx * 45}, -15)`}>
                        <image href={avatar} width="31" height="61" x="-15.5" y="-30.5" preserveAspectRatio="xMidYMid meet" />
                        <text x="0" y="35" textAnchor="middle" fill="#F5C45E" fontSize="14">
                          {`${user.slice(0, 4)}...`}
                        </text>
                        {userAddress && user.toLowerCase() === userAddress.toLowerCase() && (
                          <circle cx="0" cy="0" r="20" fill="none" stroke="#FFD700" strokeWidth="2" />
                        )}
                      </g>
                    ))}
                  </g>
                )}
                {rankInfo && rankInfo.waitingQueue.length >= 6 && (
                  <g transform={`translate(${circleRadius + 60}, 0)`}>
                    <text x="0" y="-40" fill="#4DA8DA" fontSize="16">Queue:</text>
                    <text x="0" y="5" textAnchor="middle" fill="#FFD700" fontSize="14" fontWeight="bold">
                      {rankInfo.waitingQueue.length} waiting
                    </text>
                    <text x="0" y="25" textAnchor="middle" fill="#4DA8DA" fontSize="12">
                      {queuePosition && Number(queuePosition) > 0 ? `You #${Number(queuePosition)}` : ''}
                    </text>
                  </g>
                )}
                {/* Tambahkan slot penerima di tengah lingkaran rank */}
                {lastReceiver && (
                  <g>
                    <circle cx="0" cy="0" r={60} fill="#00FF00" stroke="#F5C45E" strokeWidth="3" filter="url(#glowLux)" />
                    <image href={avatar} width="60" height="60" x="-30" y="-30" preserveAspectRatio="xMidYMid meet" />
                    <text x="0" y="50" textAnchor="middle" fill="#102E50" fontSize="18">
                      {lastReceiver.slice(0, 8)}...
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Ikon Wallet (Promotion dan Platform) */}
          <g transform={`translate(${promotionWalletX}, ${promotionWalletY})`}>
            <image
              href={nobleGiftRank && nobleGiftRank >= 2 ? getPromotionImage(Number(nobleGiftRank)) : promotionRank2}
              width="150"
              height="150"
              x="-75"
              y="-75"
              preserveAspectRatio="xMidYMid meet"
              filter="url(#dropShadow)"
            />
            <text x="0" y="80" textAnchor="middle" fill="#4DA8DA" fontSize="14">
              {nobleGiftRank ? getNobleGiftRankName(Number(nobleGiftRank)) : 'Promotion'}
            </text>
          </g>
          <g transform={`translate(${platformWalletX}, ${platformWalletY})`}>
            <image
              href={platformImg}
              width="150"
              height="150"
              x="-75"
              y="-75"
              preserveAspectRatio="xMidYMid meet"
              filter="url(#dropShadow)"
            />
            <text x="0" y="80" textAnchor="middle" fill="#4DA8DA" fontSize="14">Platform</text>
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
            />
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

          {/* Background pattern SVG */}
          <rect x="100" y="200" width="1000" height="2200" fill="url(#bgPattern)" />
        </svg>
          {/* Notifikasi Animasi dengan Styling yang Lebih Baik */}
          {animationQueue.length > 0 && (
            <div xmlns="http://www.w3.org/1999/xhtml" className="absolute bottom-6 right-6 px-6 py-4 rounded-xl text-white text-lg font-semibold shadow-2xl animate-bounce border-l-4 backdrop-blur-sm"
              style={{
                backgroundColor: animationQueue[0].type === 'DONATION' ? 'rgba(212, 175, 55, 0.95)' :
                               animationQueue[0].type === 'RECEIVE_FUNDS' ? 'rgba(0, 255, 136, 0.95)' :
                               animationQueue[0].type === 'JOIN_QUEUE' ? 'rgba(77, 168, 218, 0.95)' :
                               animationQueue[0].type === 'RANK_CYCLE_COMPLETE' ? 'rgba(255, 215, 0, 0.95)' :
                               animationQueue[0].type === 'USER_RANK_PROMOTE' ? 'rgba(138, 43, 226, 0.95)' : 'rgba(77, 168, 218, 0.95)',
                borderColor: animationQueue[0].type === 'DONATION' ? '#F5C45E' :
                            animationQueue[0].type === 'RECEIVE_FUNDS' ? '#00FF88' :
                            animationQueue[0].type === 'JOIN_QUEUE' ? '#4DA8DA' :
                            animationQueue[0].type === 'RANK_CYCLE_COMPLETE' ? '#FFD700' :
                            animationQueue[0].type === 'USER_RANK_PROMOTE' ? '#8A2BE2' : '#4DA8DA'
              }}
            >
              {animationQueue[0].type === 'DONATION' && `💛 Donation received from ${animationQueue[0].donor ? animationQueue[0].donor.slice(0, 6) : '-'}...`}
              {animationQueue[0].type === 'RECEIVE_FUNDS' && `✅ Funds received by ${animationQueue[0].user ? animationQueue[0].user.slice(0, 6) : '-'}...`}
              {animationQueue[0].type === 'JOIN_QUEUE' && `🚶 Joined queue from ${animationQueue[0].user ? animationQueue[0].user.slice(0, 6) : '-'}...`}
              {animationQueue[0].type === 'RANK_CYCLE_COMPLETE' && `🏁 Rank ${animationQueue[0].rank} cycle completed!`}
              {animationQueue[0].type === 'USER_RANK_PROMOTE' && `🏆 Congratulations! Promoted to Rank ${animationQueue[0].toRank}!`}
            </div>
          )}
      </div>

      {/* Waiting Queue Details - New Section */}
      {nobleGiftRank && ranksData[Number(nobleGiftRank)] && ranksData[Number(nobleGiftRank)].waitingQueue.length > 0 && (
        <div className="waiting-queue-details mt-8 w-full max-w-4xl bg-gradient-to-br from-[#102E50] via-[#1A3A6A] to-[#102E50] p-6 rounded-xl border border-[#4DA8DA]/40 shadow-xl hover:shadow-2xl hover:border-[#4DA8DA]/60 transition-all duration-300">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#F5C45E] to-[#4DA8DA] bg-clip-text text-transparent mb-5">⏳ Queue Details</h3>
          
          {/* Queue Summary */}
          <div className="mb-6 p-4 bg-[#102E50]/50 rounded-lg border border-[#4DA8DA]/30">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">CURRENT RANK</p>
                <p className="text-2xl font-bold text-[#F5C45E]">{getNobleGiftRankName(Number(nobleGiftRank))}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">YOUR POSITION</p>
                <p className="text-2xl font-bold text-[#FFD700]">#{Number(queuePosition) || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">QUEUE LENGTH</p>
                <p className="text-2xl font-bold text-[#4DA8DA]">{ranksData[Number(nobleGiftRank)].waitingQueue.length}</p>
              </div>
            </div>
            
            {queuePosition && Number(queuePosition) <= 3 && (
              <div className="text-center p-3 bg-[#F5C45E]/20 rounded-lg border border-[#F5C45E]/50">
                <p className="text-[#F5C45E] font-semibold">🎯 You're close! Position #{Number(queuePosition)} will receive funds soon!</p>
              </div>
            )}
          </div>

          {/* Waiting Queue List */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#4DA8DA] mb-4">Queue Order (By User ID)</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ranksData[Number(nobleGiftRank)].waitingQueue.map((userAddress, index) => {
                const isCurrentUser = userAddress && userAddress.toLowerCase() === (userAddress || '').toLowerCase();
                const position = index + 1;
                return (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                      isCurrentUser 
                        ? 'bg-[#F5C45E]/20 border-[#F5C45E] text-[#F5C45E]' 
                        : 'bg-[#102E50]/50 border-[#4DA8DA] hover:bg-[#1A3A6A] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          position === 1 ? 'bg-[#FFD700] text-[#102E50]' : 'bg-[#4DA8DA] text-white'
                        }`}>
                          {position}
                        </div>
                        <div>
                          <p className="text-xs opacity-75">User ID</p>
                          <p className="font-mono font-semibold">{userAddress.slice(0, 8)}...{userAddress.slice(-6)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {position === 1 && <span className="inline-block px-3 py-1 bg-[#FFD700] text-[#102E50] rounded-full text-xs font-bold">NEXT RECEIVER</span>}
                        {isCurrentUser && <span className="inline-block px-3 py-1 bg-[#F5C45E] text-[#102E50] rounded-full text-xs font-bold">YOU</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated Payment Info */}
          {ranksData[Number(nobleGiftRank)] && (
            <div className="mt-6 p-4 bg-[#102E50]/50 rounded-lg border border-[#4DA8DA]/30">
              <p className="text-xs text-gray-400 mb-2">RANK PROGRESS</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#1A3A6A] rounded-full h-3 overflow-hidden border border-[#4DA8DA]/30">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4DA8DA] to-[#F5C45E] transition-all duration-500"
                    style={{
                      width: `${(ranksData[Number(nobleGiftRank)].donors.length / Number(maxDonorsPerRank || 6)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-[#F5C45E]">
                  {ranksData[Number(nobleGiftRank)].donors.length}/{Number(maxDonorsPerRank || 6)} Donors
                </span>
              </div>
              {ranksData[Number(nobleGiftRank)].donors.length === Number(maxDonorsPerRank || 6) && (
                <p className="text-xs text-[#00FF88] font-semibold mt-2">✅ Rank is FULL! Payments will be distributed soon!</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent MynnGift Activity History - Enhanced */}
      <div className="recent-events mt-8 w-full max-w-4xl bg-gradient-to-br from-[#102E50] via-[#1A3A6A] to-[#102E50] p-6 rounded-xl border border-[#4DA8DA]/40 shadow-xl hover:shadow-2xl hover:border-[#4DA8DA]/60 transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#F5C45E] to-[#4DA8DA] bg-clip-text text-transparent mb-5">📊 Recent MynnGift Activity</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {displayedActivities.length > 0 ? (
            displayedActivities.map((anim, index) => (
              <div key={index} className="p-3 bg-[#102E50]/50 rounded-lg border-l-4 border-[#4DA8DA] hover:bg-[#1A3A6A] transition-colors duration-200 text-sm text-gray-200">
                {anim.type === 'DONATION' && `💛 Donor ${anim.donor ? anim.donor.slice(0,6) : '-'}...${anim.donor ? anim.donor.slice(-4) : ''} donated to Rank ${anim.rank} (${ethers.formatEther(anim.amount)} opBNB)`}
                {anim.type === 'JOIN_QUEUE' && `🚶 User ${anim.user ? anim.user.slice(0,6) : '-'}...${anim.user ? anim.user.slice(-4) : ''} joined queue for Rank ${anim.rank}`}
                {anim.type === 'RECEIVE_FUNDS' && `✅ User ${anim.user ? anim.user.slice(0,6) : '-'}...${anim.user ? anim.user.slice(-4) : ''} received ${ethers.formatEther(anim.amount)} opBNB from Rank ${anim.rank}`}
                {anim.type === 'RANK_CYCLE_COMPLETE' && `🎯 Rank ${anim.rank} cycle completed.`}
                {anim.type === 'USER_RANK_PROMOTE' && `🏆 User ${anim.user ? anim.user.slice(0,6) : '-'}... promoted to Rank ${anim.toRank}.`}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">📭 No recent activity...</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Define a target for the gas subsidy pool progress bar
const MAX_GAS_SUBSIDY_POOL_TARGET = 10; // In opBNB, adjust as needed

export default NobleGiftVisualization;

<style>
{`
@keyframes spin-coin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(77, 168, 218, 0.8); }
  50% { box-shadow: 0 0 30px rgba(77, 168, 218, 1); }
}

@keyframes slide-in {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.spin-coin {
  animation: spin-coin 1.2s linear infinite;
  transform-origin: 50% 50%;
}

.user-status-summary {
  animation: slide-in 0.6s ease-out;
}

.recent-events {
  animation: slide-in 0.8s ease-out;
}

.recent-events li, .recent-events div {
  transition: all 0.3s ease;
}

.recent-events li:hover, .recent-events div:hover {
  transform: translateX(4px);
}

/* Smooth scrollbar for recent activities */
.recent-events::-webkit-scrollbar {
  width: 6px;
}

.recent-events::-webkit-scrollbar-track {
  background: rgba(77, 168, 218, 0.1);
  border-radius: 10px;
}

.recent-events::-webkit-scrollbar-thumb {
  background: rgba(77, 168, 218, 0.5);
  border-radius: 10px;
}

.recent-events::-webkit-scrollbar-thumb:hover {
  background: rgba(77, 168, 218, 0.8);
}

/* Card hover effects */
.user-status-summary:hover,
.recent-events:hover {
  transform: translateY(-2px);
}

/* Progress bar shimmer effect */
@keyframes progress-shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

/* Mobile optimization */
@media (max-width: 640px) {
  .noblegift-visualization-container {
    padding: 12px;
  }
  
  .user-status-summary {
    padding: 12px;
  }
  
  .recent-events {
    padding: 12px;
  }
}
`}
</style>