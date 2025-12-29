import React, { useState } from 'react';
import { useReadContract, useWatchContractEvent, useAccount, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { parseAbiItem } from 'viem';
import MynnGiftVisualization from './MynnGiftVisualization';

const MynnGiftTabs = ({ mynngiftConfig, mynncryptConfig }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { address: userAddress } = useAccount();

  // Fetch MynnGift data - STREAM SPECIFIC
  const { data: nobleGiftRank, isLoading: rankLoading, error: rankError } = useReadContract({
    ...mynngiftConfig,
    functionName: 'userRank_StreamA',
    args: [userAddress],
    query: { enabled: !!userAddress },
  });

  const { data: userTotalIncome, isLoading: incomeLoading, error: incomeError } = useReadContract({
    ...mynngiftConfig,
    functionName: 'userTotalIncome_StreamA',
    args: [userAddress],
    query: { enabled: !!userAddress },
  });

  const { data: userTotalDonation, isLoading: donationLoading, error: donationError } = useReadContract({
    ...mynngiftConfig,
    functionName: 'userTotalDonation_StreamA',
    args: [userAddress],
    query: { enabled: !!userAddress },
  });

  // First, get the userId from the address
  const { data: userId } = useReadContract({
    ...mynncryptConfig,
    functionName: 'id',
    args: [userAddress],
    query: { enabled: !!userAddress },
  });

  // Get user's current level from MynnCrypt using userId
  const { data: userInfoData, isLoading: levelLoading, error: levelError } = useReadContract({
    ...mynncryptConfig,
    functionName: 'userInfo',
    args: [userId],
    query: { enabled: !!userId },
  });

  // Extract level from user info
  const userLevel = userInfoData ? userInfoData[7] : undefined; // level is at index 7 in User struct

  // Check if user is active in MynnGift Stream A (either donor or receiver)
  const { data: isReceiverData } = useReadContract({
    ...mynngiftConfig,
    functionName: 'isReceiver_StreamA',
    args: [userAddress],
    query: { enabled: !!userAddress },
  });

  const { data: isDonorData } = useReadContract({
    ...mynngiftConfig,
    functionName: 'isDonor_StreamA',
    args: [userAddress],
    query: { enabled: !!userAddress },
  });

  const isActiveInMynnGift = isReceiverData || isDonorData;

  // Determine which streams user is eligible for
  const isEligibleForStreamA = userLevel && Number(userLevel) >= 4;
  const isEligibleForStreamB = userLevel && Number(userLevel) >= 8;

  // Debug logging
  React.useEffect(() => {
    if (userAddress) {
      console.log('=== MynnGiftTabs Debug ===');
      console.log('User Address:', userAddress);
      console.log('User Level Status:', { levelLoading, levelError: levelError?.message || 'none', userLevel: userLevel ? Number(userLevel) : 'undefined' });
      console.log('Is Active in MynnGift:', isActiveInMynnGift, '(isReceiver:', isReceiverData, ', isDonor:', isDonorData, ')');
      console.log('Stream Eligibility:', { isEligibleForStreamA, isEligibleForStreamB });
      console.log('MynnGift Data:');
      console.log('  - Rank:', nobleGiftRank ? Number(nobleGiftRank) : 'undefined');
      console.log('  - Total Income:', userTotalIncome ? ethers.formatEther(userTotalIncome) : 'undefined', 'Wei');
      console.log('  - Total Donation:', userTotalDonation ? ethers.formatEther(userTotalDonation) : 'undefined', 'Wei');
      console.log('Loading States:');
      console.log('  - rankLoading:', rankLoading, 'rankError:', rankError?.message || 'none');
      console.log('  - incomeLoading:', incomeLoading, 'incomeError:', incomeError?.message || 'none');
      console.log('  - donationLoading:', donationLoading, 'donationError:', donationError?.message || 'none');
      console.log('  - levelLoading:', levelLoading, 'levelError:', levelError?.message || 'none');
      console.log('=========================');
    }
  }, [userAddress, nobleGiftRank, userTotalIncome, userTotalDonation, userLevel, isReceiverData, isDonorData, rankLoading, rankError, incomeLoading, incomeError, donationLoading, donationError, levelLoading, levelError, isEligibleForStreamA, isEligibleForStreamB]);

  // Tab styling
  const tabBaseStyle = "px-4 py-3 rounded-lg transition-all duration-300 font-semibold";
  const tabActiveStyle = "bg-gradient-to-r from-[#DDA853] to-[#E5C893] text-[#183B4E] shadow-lg";
  const tabInactiveStyle = "bg-[#102E50]/50 text-[#F5C45E] hover:bg-[#4DA8DA]/20";

  return (
    <div className="mynngift-tabs-container bg-gradient-to-b from-[#1A3A6A] to-[#102E50] p-4 sm:p-8 rounded-xl shadow-2xl w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#4DA8DA]/30 pb-4">
        {/* Overview Tab */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`${tabBaseStyle} ${activeTab === 'overview' ? tabActiveStyle : tabInactiveStyle}`}
        >
          📊 Overview
        </button>

        {/* Stream A Tab */}
        {isEligibleForStreamA && (
          <button
            onClick={() => setActiveTab('streamA')}
            className={`${tabBaseStyle} ${activeTab === 'streamA' ? tabActiveStyle : tabInactiveStyle}`}
          >
            🏆 Stream A (L4)
          </button>
        )}

        {/* Stream B Tab */}
        {isEligibleForStreamB && (
          <button
            onClick={() => setActiveTab('streamB')}
            className={`${tabBaseStyle} ${activeTab === 'streamB' ? tabActiveStyle : tabInactiveStyle}`}
          >
            🏆 Stream B (L8)
          </button>
        )}

        {/* History Tab */}
        <button
          onClick={() => setActiveTab('history')}
          className={`${tabBaseStyle} ${activeTab === 'history' ? tabActiveStyle : tabInactiveStyle}`}
        >
          📈 History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <OverviewTab
            nobleGiftRank={nobleGiftRank}
            userTotalIncome={userTotalIncome}
            userTotalDonation={userTotalDonation}
            userLevel={userLevel}
            isEligibleForStreamA={isEligibleForStreamA}
            isEligibleForStreamB={isEligibleForStreamB}
            userAddress={userAddress}
            rankLoading={rankLoading}
            rankError={rankError}
            incomeLoading={incomeLoading}
            incomeError={incomeError}
            donationLoading={donationLoading}
            donationError={donationError}
            levelLoading={levelLoading}
            levelError={levelError}
            isReceiverData={isReceiverData}
            isDonorData={isDonorData}
          />
        )}

        {/* STREAM A TAB */}
        {activeTab === 'streamA' && (
          <div className="stream-visualization">
            <h3 className="text-2xl font-bold text-[#F5C45E] mb-4">🏆 MynnGift Stream A (Level 4)</h3>
            <p className="text-gray-300 mb-6 text-sm">
              This is your first MynnGift stream, started when you reached Level 4. 
              Progress through Ranks 1-8 and earn from each cycle.
            </p>
            <MynnGiftVisualization 
              mynngiftConfig={mynngiftConfig}
              userAddress={userAddress}
              streamType="streamA"
              streamLabel="Stream A"
            />
          </div>
        )}

        {/* STREAM B TAB */}
        {activeTab === 'streamB' && (
          <div className="stream-visualization">
            <h3 className="text-2xl font-bold text-[#F5C45E] mb-4">🏆 MynnGift Stream B (Level 8)</h3>
            <p className="text-gray-300 mb-6 text-sm">
              This is your second independent MynnGift stream, started when you reached Level 8. 
              Both streams progress independently and can be monitored separately.
            </p>
            <MynnGiftVisualization 
              mynngiftConfig={mynngiftConfig}
              userAddress={userAddress}
              streamType="streamB"
              streamLabel="Stream B"
            />
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <IncomeHistoryTab userAddress={userAddress} mynngiftConfig={mynngiftConfig} mynncryptConfig={mynncryptConfig} />
        )}

        {/* FALLBACK - Show old visualization if no tab selected */}
        {!['overview', 'streamA', 'streamB', 'history'].includes(activeTab) && (
          <MynnGiftVisualization 
            mynngiftConfig={mynngiftConfig}
          />
        )}
      </div>
    </div>
  );
};

/**
 * OVERVIEW TAB - Dashboard showing both streams summary
 */
const OverviewTab = ({
  nobleGiftRank,
  userTotalIncome,
  userTotalDonation,
  userLevel,
  isEligibleForStreamA,
  isEligibleForStreamB,
  userAddress,
  rankLoading,
  rankError,
  incomeLoading,
  incomeError,
  donationLoading,
  donationError,
  levelLoading,
  levelError,
  isReceiverData,
  isDonorData,
}) => {
  return (
    <div className="overview-tab space-y-6">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#F5C45E] via-[#E78B48] to-[#F5C45E] bg-clip-text text-transparent mb-2">
          🎯 MynnGift Dashboard
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-[#4DA8DA] to-[#F5C45E] rounded-full mx-auto"></div>
      </div>

      {/* Eligibility Info */}
      <div className="bg-[#102E50]/50 p-4 rounded-lg border border-[#4DA8DA]/30 text-sm text-gray-300">
        <p className="mb-2">
          <span className="font-semibold text-[#4DA8DA]">Current Level:</span> {userLevel ? Number(userLevel) : 'Loading...'}
        </p>
        <p>
          <span className="font-semibold text-[#4DA8DA]">Active Streams:</span>{' '}
          {isEligibleForStreamA && <span className="text-[#F5C45E]">A (L4)</span>}
          {isEligibleForStreamA && isEligibleForStreamB && <span className="text-gray-400 mx-1">+</span>}
          {isEligibleForStreamB && <span className="text-[#F5C45E]">B (L8)</span>}
          {!isEligibleForStreamA && !isEligibleForStreamB && <span className="text-gray-500">None yet</span>}
        </p>
      </div>

      {/* Streams Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stream A Card */}
        {isEligibleForStreamA && (
          <StreamStatusCard
            title="Stream A"
            level="Level 4"
            subtitle="🏆 First MynnGift Stream"
            rank={nobleGiftRank}
            totalIncome={userTotalIncome}
            totalDonation={userTotalDonation}
            streamType="A"
          />
        )}

        {/* Stream B Card */}
        {isEligibleForStreamB && (
          <StreamStatusCard
            title="Stream B"
            level="Level 8"
            subtitle="🏆 Second MynnGift Stream"
            rank={nobleGiftRank}
            totalIncome={userTotalIncome}
            totalDonation={userTotalDonation}
            streamType="B"
          />
        )}
      </div>

      {/* Combined Stats */}
      {(isEligibleForStreamA || isEligibleForStreamB) && (
        <div className="bg-gradient-to-br from-[#102E50] via-[#1A3A6A] to-[#102E50] p-6 rounded-xl border border-[#4DA8DA]/40 shadow-xl">
          <h3 className="text-xl font-bold text-[#F5C45E] mb-4">📊 Combined MynnGift Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Total Income</p>
              <p className="text-xl font-bold text-[#00FF88]">
                {userTotalIncome !== undefined ? ethers.formatEther(userTotalIncome) : '0'} opBNB
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Donated</p>
              <p className="text-xl font-bold text-[#F5C45E]">
                {userTotalDonation !== undefined ? ethers.formatEther(userTotalDonation) : '0'} opBNB
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Streams</p>
              <p className="text-xl font-bold text-[#4DA8DA]">
                {(isEligibleForStreamA ? 1 : 0) + (isEligibleForStreamB ? 1 : 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!isEligibleForStreamA && !isEligibleForStreamB && (
        <div className="bg-blue-900/30 border border-blue-500/50 p-6 rounded-lg text-center text-gray-300">
          <p className="text-lg font-semibold text-[#4DA8DA]">ℹ️ Not Yet Eligible</p>
          <p className="mt-2">Reach Level 4 to start your first MynnGift stream (Stream A)!</p>
        </div>
      )}
    </div>
  );
};

/**
 * STREAM STATUS CARD - Individual stream info
 */
const StreamStatusCard = ({
  title,
  level,
  subtitle,
  rank,
  totalIncome,
  totalDonation,
  streamType,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#102E50] via-[#1A3A6A] to-[#102E50] p-6 rounded-xl border border-[#4DA8DA]/40 shadow-xl hover:shadow-2xl hover:border-[#4DA8DA]/60 transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-[#F5C45E] mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{level}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="space-y-3 border-t border-[#4DA8DA]/20 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Current Rank:</span>
          <span className="text-lg font-bold text-[#F5C45E]">
            {rank ? Number(rank) : '-'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Income:</span>
          <span className="text-lg font-bold text-[#00FF88]">
            {totalIncome !== undefined ? ethers.formatEther(totalIncome) : '0'} opBNB
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Donated:</span>
          <span className="text-lg font-bold text-[#F5C45E]">
            {totalDonation !== undefined ? ethers.formatEther(totalDonation) : '0'} opBNB
          </span>
        </div>
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-[#4DA8DA] to-[#00FF88] text-[#102E50] font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
        View Details →
      </button>
    </div>
  );
};

/**
 * INCOME HISTORY TAB - Timeline of all transactions
 */
const IncomeHistoryTab = ({ userAddress, mynngiftConfig, mynncryptConfig }) => {
  const [transactionHistory, setTransactionHistory] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const publicClient = usePublicClient();

  // Fetch user ID first
  const { data: userId } = useReadContract({
    ...mynncryptConfig,
    functionName: 'id',
    args: [userAddress],
    query: { enabled: !!userAddress },
  });

  // Fetch historical events on component mount
  React.useEffect(() => {
    const fetchHistoricalEvents = async () => {
      if (!publicClient || !userAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Fetching historical DonationReceived events...');
        
        const logs = await publicClient.getLogs({
          address: mynngiftConfig.address,
          event: parseAbiItem('event DonationReceived(string userId, uint8 indexed rank, uint256 amount)'),
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        console.log('📊 Found events:', logs);

        const transactions = logs.map((log) => {
          const userId = log.args.userId;
          const rank = Number(log.args.rank);
          const amount = log.args.amount;
          
          // Stream ditentukan berdasarkan AMOUNT, bukan rank
          // Stream A: 0.0081 ether (Level 4)
          // Stream B: 0.0936 ether (Level 8)
          const amountValue = BigInt(amount);
          const streamA = BigInt('8100000000000000'); // 0.0081 ether
          const streamB = BigInt('93600000000000000'); // 0.0936 ether
          
          let streamType = 'Unknown';
          if (amountValue === streamA) {
            streamType = 'A';
          } else if (amountValue === streamB) {
            streamType = 'B';
          } else {
            // Jika tidak match, hitung berdasarkan multiplier
            const ratio = amountValue / streamA;
            streamType = ratio >= 10n ? 'B' : 'A';
          }
          
          console.log(`📌 Rank ${rank}, Amount: ${ethers.formatEther(amount)} opBNB -> Stream ${streamType}`);
          
          return {
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            type: 'DONATE',
            rank: rank,
            amount: ethers.formatEther(amount),
            stream: streamType,
            userId: userId,
            hash: log.transactionHash,
          };
        });

        setTransactionHistory(transactions.reverse()); // Newest first
        console.log('✅ Loaded transactions:', transactions);
      } catch (error) {
        console.error('❌ Error fetching historical events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalEvents();
  }, [publicClient, userAddress]);

  // Watch for NEW DonationReceived events
  useWatchContractEvent({
    ...mynngiftConfig,
    eventName: 'DonationReceived',
    onLogs: (logs) => {
      console.log('🆕 New DonationReceived events:', logs);
      const newTransactions = logs.map((log) => {
        const amount = log.args.amount;
        
        // Stream ditentukan berdasarkan AMOUNT
        const amountValue = BigInt(amount);
        const streamA = BigInt('8100000000000000'); // 0.0081 ether
        const streamB = BigInt('93600000000000000'); // 0.0936 ether
        
        let streamType = 'Unknown';
        if (amountValue === streamA) {
          streamType = 'A';
        } else if (amountValue === streamB) {
          streamType = 'B';
        } else {
          const ratio = amountValue / streamA;
          streamType = ratio >= 10n ? 'B' : 'A';
        }
        
        return {
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          type: 'DONATE',
          rank: Number(log.args.rank),
          amount: ethers.formatEther(log.args.amount),
          stream: streamType,
          userId: log.args.userId,
          hash: log.transactionHash,
        };
      });
      setTransactionHistory((prev) => [...newTransactions, ...prev]);
    },
  });

  // Fallback: Show message if no history
  const mockHistory = transactionHistory.length > 0 ? transactionHistory : [
    { date: '—', type: 'NO_DATA', rank: 0, amount: 0, stream: '—' },
  ];

  return (
    <div className="income-history space-y-4">
      <h3 className="text-2xl font-bold text-[#F5C45E] mb-6">📈 Income History</h3>

      {mockHistory.length > 0 && mockHistory[0].type !== 'NO_DATA' ? (
        <div className="space-y-2">
          {mockHistory.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#102E50]/50 rounded-lg border-l-4 border-[#4DA8DA] hover:bg-[#1A3A6A] transition-colors duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {item.type === 'RECEIVE' && '✅ Received Income'}
                    {item.type === 'DONATE' && '💛 Donated'}
                    {item.type === 'JOIN_QUEUE' && '🚶 Joined Queue'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Rank {item.rank} • Stream {item.stream} • {item.date}
                  </p>
                </div>
                <span className="text-lg font-bold text-[#F5C45E]">
                  {item.amount > 0 ? `${item.amount} opBNB` : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>📋 No transaction history yet</p>
          <p className="text-xs mt-2">Transactions will appear when you make donations in your stream</p>
        </div>
      )}
    </div>
  );
};

export default MynnGiftTabs;
