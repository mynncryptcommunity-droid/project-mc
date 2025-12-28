// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IFindup {
    function id(address _address) external view returns (string memory);
}

contract NobleGift is ReentrancyGuard, Ownable {
    struct Rank {
        address[] donors;
        address[] waitingQueue;
        uint256 totalFunds;
    }

    uint8 public constant MAX_RANK = 8;
    uint8 public constant MAX_DONORS_PER_RANK = 6;
    uint256 public constant RECEIVER_SHARE = 50;
    uint256 public constant PROMOTION_SHARE = 45;
    uint256 public constant FEE_SHARE = 5;
    uint256 public constant GAS_SUBSIDY_PERCENT = 10;
    uint256 public constant MAX_SUBSIDY_PER_TX = 0.01 ether;
    uint256 public constant MIN_GAS_SUBSIDY_POOL = 0.1 ether;

    mapping(uint8 => Rank) public ranks;
    mapping(uint8 => uint256) public rankDonationValues;
    mapping(uint8 => address[]) public rankDonorHistory;
    mapping(uint8 => uint256) public rankDonationCount;
    mapping(uint8 => uint256) public currentRankCycle;
    mapping(address => uint256) public userTotalDonation;
    mapping(address => uint256) public userTotalIncome;
    mapping(address => mapping(uint8 => uint256)) public userIncomePerRank;
    mapping(address => uint8) public userRank;
    mapping(address => bool) public isDonor;
    mapping(address => bool) public isReceiver;
    mapping(uint8 => address[]) public rankReceiverHistory;
    mapping(address => string) private userIdCache;
    uint256 public gasSubsidyPool;
    uint256 public promotionPool;
    address public platformWallet; // Same as sharefee in Findup.sol
    address public findupContract;
    uint256 public totalReceivers;
    uint256 public platformIncome; // Track platform income

    event DonationReceived(string userId, uint8 indexed rank, uint256 amount);
    event GasSubsidyPaid(address indexed user, uint256 amount);
    event GasSubsidyPoolUpdated(uint256 newBalance, string action);
    event PromotionPoolUpdated(uint256 newBalance, string action);
    event PlatformFundsTransferred(address indexed wallet, uint256 amount);
    event WaitingQueueJoined(string userId, uint8 indexed rank, uint256 position);
    event NoReceiverAllFundsToPlatform(uint256 totalAmount, uint8 indexed rank);
    event ReceiverStatusUpdated(string userId, uint8 indexed rank, uint256 amount);
    event RankCycleCompleted(uint8 indexed rank, uint256 cycleNumber, address[] donors);
    event RankReset(uint8 indexed rank, uint256 totalDonors);
    event AutoPromotedToNextRank(string userId, uint8 indexed newRank, uint256 amount);
    event UserIdCacheUpdated(address indexed user, string userId);

    constructor(
        address /*initialOwner*/,
        address _platformWallet,
        address _findupContract
    ) {
        require(_platformWallet != address(0), "Invalid platform wallet address");
        require(_findupContract != address(0), "Invalid findup contract address");
        platformWallet = _platformWallet;
        findupContract = _findupContract;
        
        rankDonationValues[1] = 0.0081 ether;
        rankDonationValues[2] = 0.02187 ether;
        rankDonationValues[3] = 0.059049 ether;
        rankDonationValues[4] = 0.1594323 ether;
        rankDonationValues[5] = 0.43046721 ether;
        rankDonationValues[6] = 1.162261467 ether;
        rankDonationValues[7] = 3.138105961 ether;
        rankDonationValues[8] = 8.472886094 ether;
    }

    receive() external payable {
        _transferToPlatformWallet(msg.value);
        emit PlatformFundsTransferred(platformWallet, msg.value);
    }

    function receiveFromFindup(address user, uint256 amount) external payable nonReentrant {
        require(msg.value == amount, "Invalid amount");
        string memory userId = _getUserId(user);
        _processDonation(1, user);
        emit DonationReceived(userId, 1, amount);
    }

    function donateToRank(uint8 rank) external payable nonReentrant {
        uint256 gasStart = gasleft();
        require(rank >= 1 && rank <= MAX_RANK, "Invalid rank");
        require(msg.value == rankDonationValues[rank], "Incorrect donation amount");

        _processDonation(rank, msg.sender);

        uint256 gasUsedInWei = (gasStart - gasleft()) * tx.gasprice;
        uint256 subsidyAmount = gasUsedInWei + (gasUsedInWei / 10);
        subsidyAmount = subsidyAmount > MAX_SUBSIDY_PER_TX ? MAX_SUBSIDY_PER_TX : subsidyAmount;

        if (gasSubsidyPool >= subsidyAmount) {
            gasSubsidyPool -= subsidyAmount;
            (bool success, ) = msg.sender.call{value: subsidyAmount}("");
            if (success) {
                emit GasSubsidyPaid(msg.sender, subsidyAmount);
                emit GasSubsidyPoolUpdated(gasSubsidyPool, "Subsidy Paid");
            }
        }
    }

    function updateUserIdCache(address user) external nonReentrant {
        require(user != address(0), "Invalid address");
        string memory userId = IFindup(findupContract).id(user);
        if (bytes(userId).length == 0) {
            userId = string(abi.encodePacked("Unknown_", _addressToString(user)));
        }
        userIdCache[user] = userId;
        emit UserIdCacheUpdated(user, userId);
    }

    function withdrawExcessPromotionPool(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(promotionPool >= amount, "Insufficient promotion pool");
        promotionPool -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit PromotionPoolUpdated(promotionPool, "Excess Withdrawn");
    }

    function withdrawExcessGasSubsidy(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(gasSubsidyPool >= MIN_GAS_SUBSIDY_POOL + amount, "Insufficient excess funds");
        gasSubsidyPool -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit GasSubsidyPoolUpdated(gasSubsidyPool, "Excess Withdrawn");
    }

    function withdrawRemainingBalance() external onlyOwner nonReentrant {
        uint256 remainingBalance = address(this).balance - (promotionPool + gasSubsidyPool);
        require(remainingBalance > 0, "No remaining balance to withdraw");
        (bool success, ) = msg.sender.call{value: remainingBalance}("");
        require(success, "Withdrawal failed");
        emit PlatformFundsTransferred(msg.sender, remainingBalance);
    }

    function _transferToPlatformWallet(uint256 amount) internal {
        if (amount > 0) {
            platformIncome += amount; // Track platform income
            (bool success, ) = platformWallet.call{value: amount}("");
            require(success, "Transfer to platform wallet failed");
            emit PlatformFundsTransferred(platformWallet, amount);
        }
    }

    function _updateDonorInfo(uint8 rank, address donor, Rank storage currentRank) internal {
        currentRank.donors.push(donor);
        currentRank.totalFunds += rankDonationValues[rank];
        isDonor[donor] = true;
        userTotalDonation[donor] += rankDonationValues[rank];
        userRank[donor] = userRank[donor] < rank ? rank : userRank[donor];
        
        rankDonorHistory[rank].push(donor);
        rankDonationCount[rank]++;
    }

    function _processReceiverShare(
        Rank storage currentRank,
        uint256 receiverShare,
        uint8 rank
    ) internal returns (uint256 remainingShare) {
        if (currentRank.waitingQueue.length > 0) {
            address receiver = currentRank.waitingQueue[0];
            string memory receiverId = _getUserId(receiver);
            isReceiver[receiver] = true;
            userTotalIncome[receiver] += receiverShare;
            userIncomePerRank[receiver][rank] += receiverShare;
            totalReceivers += 1;
            rankReceiverHistory[rank].push(receiver);
            _removeFromQueue(currentRank, 0);
            (bool success, ) = payable(receiver).call{value: receiverShare}("");
            require(success, "Transfer failed");
            emit ReceiverStatusUpdated(receiverId, userRank[receiver], receiverShare);

            if (rank < MAX_RANK) {
                _autoPromote(receiver, rank);
            }
            return 0;
        }
        return receiverShare;
    }

    function _autoPromote(address user, uint8 currentRank) internal {
        uint8 nextRank = currentRank + 1;
        if (nextRank <= MAX_RANK) {
            uint256 donationValue = rankDonationValues[nextRank];
            string memory userId = _getUserId(user);
            
            if (promotionPool >= donationValue) {
                promotionPool -= donationValue;
                _processDonation(nextRank, user);
                emit AutoPromotedToNextRank(userId, nextRank, donationValue);
                emit PromotionPoolUpdated(promotionPool, "Promotion Deducted");
            } else {
                uint256 shortfall = donationValue - promotionPool;
                require(gasSubsidyPool >= shortfall, "Insufficient funds in gas subsidy pool");
                promotionPool = 0;
                gasSubsidyPool -= shortfall;
                _processDonation(nextRank, user);
                emit AutoPromotedToNextRank(userId, nextRank, donationValue);
                emit PromotionPoolUpdated(promotionPool, "Promotion Deducted");
                emit GasSubsidyPoolUpdated(gasSubsidyPool, "Shortfall Covered");
            }
        }
    }

    function _processFullRank(Rank storage currentRank, uint8 rank) internal returns (bool) {
        if (currentRank.donors.length != MAX_DONORS_PER_RANK) {
            return false;
        }

        uint256 totalFunds = currentRank.totalFunds;
        
        if (currentRank.waitingQueue.length == 0) {
            _transferToPlatformWallet(totalFunds);
            emit NoReceiverAllFundsToPlatform(totalFunds, rank);
        } else {
            uint256 receiverShare = (totalFunds * RECEIVER_SHARE) / 100;
            uint256 promotionShare = (totalFunds * PROMOTION_SHARE) / 100;
            uint256 fee = (totalFunds * FEE_SHARE) / 100;
            uint256 subsidy = (fee * GAS_SUBSIDY_PERCENT) / 100;
            uint256 platformFee = fee - subsidy;
            
            gasSubsidyPool += subsidy;
            emit GasSubsidyPoolUpdated(gasSubsidyPool, "Subsidy Added");

            promotionPool += promotionShare;
            emit PromotionPoolUpdated(promotionPool, "Promotion Share Added");

            uint256 remainingShare = _processReceiverShare(currentRank, receiverShare, rank);
            if (remainingShare > 0) {
                platformFee += remainingShare;
            }
            _transferToPlatformWallet(platformFee);
        }

        for (uint i = 0; i < currentRank.donors.length; i++) {
            address donor = currentRank.donors[i];
            if (!isReceiver[donor] && !isInWaitingQueue(rank, donor)) {
                string memory donorId = _getUserId(donor);
                currentRank.waitingQueue.push(donor);
                emit WaitingQueueJoined(donorId, rank, currentRank.waitingQueue.length);
            }
        }

        _resetRank(currentRank, rank);
        return true;
    }

    function _processDonation(uint8 rank, address donor) internal {
        Rank storage currentRank = ranks[rank];
        string memory donorId = _getUserId(donor);
        
        _updateDonorInfo(rank, donor, currentRank);
        
        _processFullRank(currentRank, rank);
        
        emit DonationReceived(donorId, rank, rankDonationValues[rank]);
    }

    function _removeFromQueue(Rank storage rank, uint256 index) internal {
        require(index < rank.waitingQueue.length, "Invalid index");
        for (uint i = index; i < rank.waitingQueue.length - 1; i++) {
            rank.waitingQueue[i] = rank.waitingQueue[i + 1];
        }
        rank.waitingQueue.pop();
    }

    function _resetRank(Rank storage rank, uint8 currentRank) internal {
        // Only reset donors and totalFunds, preserve waitingQueue for fairness
        currentRankCycle[currentRank]++;
        address[] memory completedDonors = rank.donors;
        emit RankReset(currentRank, completedDonors.length);
        emit RankCycleCompleted(currentRank, currentRankCycle[currentRank], completedDonors);
        delete rank.donors;
        rank.totalFunds = 0;
    }

    function _getUserId(address user) internal returns (string memory) {
        string memory cachedId = userIdCache[user];
        if (bytes(cachedId).length > 0) {
            return cachedId;
        }
        string memory userId = IFindup(findupContract).id(user);
        if (bytes(userId).length == 0) {
            userId = string(abi.encodePacked("Unknown_", _addressToString(user)));
        }
        userIdCache[user] = userId;
        emit UserIdCacheUpdated(user, userId);
        return userId;
    }

    function _addressToString(address _addr) private pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        uint256 value = uint256(uint160(_addr));
        for (uint i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[(value >> (8 * (19 - i) + 4)) & 0xf];
            str[3 + i * 2] = alphabet[(value >> (8 * (19 - i))) & 0xf];
        }
        return string(str);
    }

    function getUserStatus(address user) external view returns (string memory) {
        string memory userId = userIdCache[user];
        if (bytes(userId).length == 0) {
            userId = IFindup(findupContract).id(user);
            if (bytes(userId).length == 0) {
                userId = string(abi.encodePacked("Unknown_", _addressToString(user)));
            }
        }
        if (isDonor[user] && isReceiver[user]) return string(abi.encodePacked("Donor & Penerima (", userId, ")"));
        if (isDonor[user]) return string(abi.encodePacked("Donor (", userId, ")"));
        if (isReceiver[user]) return string(abi.encodePacked("Penerima (", userId, ")"));
        return string(abi.encodePacked("Tidak Aktif (", userId, ")"));
    }

    function getUserRank(address user) external view returns (uint8) {
        return userRank[user];
    }

    function getUserTotalDonation(address user) external view returns (uint256) {
        return userTotalDonation[user];
    }

    function getUserTotalIncome(address user) external view returns (uint256) {
        return userTotalIncome[user];
    }

    function getUserIncomePerRank(address user, uint8 rank) external view returns (uint256) {
        require(rank >= 1 && rank <= MAX_RANK, "Invalid rank");
        return userIncomePerRank[user][rank];
    }

    function getUserIncomeBreakdown(address user) external view returns (uint256[8] memory) {
        uint256[8] memory breakdown;
        for (uint8 i = 1; i <= MAX_RANK; i++) {
            breakdown[i-1] = userIncomePerRank[user][i];
        }
        return breakdown;
    }

    function getRankDonors(uint8 rank) external view returns (string[] memory) {
        address[] memory addresses = ranks[rank].donors;
        string[] memory userIds = new string[](addresses.length);
        for (uint i = 0; i < addresses.length; i++) {
            userIds[i] = userIdCache[addresses[i]];
            if (bytes(userIds[i]).length == 0) {
                userIds[i] = IFindup(findupContract).id(addresses[i]);
                if (bytes(userIds[i]).length == 0) {
                    userIds[i] = string(abi.encodePacked("Unknown_", _addressToString(addresses[i])));
                }
            }
        }
        return userIds;
    }

    function getRankWaitingQueue(uint8 rank) external view returns (string[] memory) {
        address[] memory addresses = ranks[rank].waitingQueue;
        string[] memory userIds = new string[](addresses.length);
        for (uint i = 0; i < addresses.length; i++) {
            userIds[i] = userIdCache[addresses[i]];
            if (bytes(userIds[i]).length == 0) {
                userIds[i] = IFindup(findupContract).id(addresses[i]);
                if (bytes(userIds[i]).length == 0) {
                    userIds[i] = string(abi.encodePacked("Unknown_", _addressToString(addresses[i])));
                }
            }
        }
        return userIds;
    }

    function getRankReceiverHistory(uint8 rank) external view returns (string[] memory) {
        address[] memory addresses = rankReceiverHistory[rank];
        string[] memory userIds = new string[](addresses.length);
        for (uint i = 0; i < addresses.length; i++) {
            userIds[i] = userIdCache[addresses[i]];
            if (bytes(userIds[i]).length == 0) {
                userIds[i] = IFindup(findupContract).id(addresses[i]);
                if (bytes(userIds[i]).length == 0) {
                    userIds[i] = string(abi.encodePacked("Unknown_", _addressToString(addresses[i])));
                }
            }
        }
        return userIds;
    }

    function getTotalReceivers() external view returns (uint256) {
        return totalReceivers;
    }

    function getPromotionPoolBalance() external view returns (uint256) {
        return promotionPool;
    }

    function getGasSubsidyPoolBalance() external view returns (uint256) {
        return gasSubsidyPool;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getPlatformIncome() external view returns (uint256) {
        return platformIncome;
    }

    function setPlatformWallet(address _newPlatformWallet) external onlyOwner {
        require(_newPlatformWallet != address(0), "Invalid address");
        platformWallet = _newPlatformWallet;
    }

    function setFindupContract(address _newFindupContract) external onlyOwner {
        require(_newFindupContract != address(0), "Invalid address");
        findupContract = _newFindupContract;
    }

    function joinWaitingQueue(uint8 rank) external nonReentrant {
        require(rank >= 1 && rank <= MAX_RANK, "Invalid rank");
        require(isDonor[msg.sender], "Must be a donor first");
        require(!isReceiver[msg.sender], "Already a receiver");
        require(!isInWaitingQueue(rank, msg.sender), "Already in waiting queue");
        
        Rank storage currentRank = ranks[rank];
        string memory userId = _getUserId(msg.sender);
        currentRank.waitingQueue.push(msg.sender);
        emit WaitingQueueJoined(userId, rank, currentRank.waitingQueue.length);
    }

    function isInWaitingQueue(uint8 rank, address user) public view returns (bool) {
        Rank storage currentRank = ranks[rank];
        for (uint i = 0; i < currentRank.waitingQueue.length; i++) {
            if (currentRank.waitingQueue[i] == user) {
                return true;
            }
        }
        return false;
    }

    function getWaitingQueuePosition(uint8 rank, address user) external view returns (uint256) {
        Rank storage currentRank = ranks[rank];
        for (uint i = 0; i < currentRank.waitingQueue.length; i++) {
            if (currentRank.waitingQueue[i] == user) {
                return i + 1;
            }
        }
        return 0;
    }

    function getRankDonorHistory(uint8 rank) external view returns (string[] memory) {
        address[] memory addresses = rankDonorHistory[rank];
        string[] memory userIds = new string[](addresses.length);
        for (uint i = 0; i < addresses.length; i++) {
            userIds[i] = userIdCache[addresses[i]];
            if (bytes(userIds[i]).length == 0) {
                userIds[i] = IFindup(findupContract).id(addresses[i]);
                if (bytes(userIds[i]).length == 0) {
                    userIds[i] = string(abi.encodePacked("Unknown_", _addressToString(addresses[i])));
                }
            }
        }
        return userIds;
    }

    function getRankDonationCount(uint8 rank) external view returns (uint256) {
        return rankDonationCount[rank];
    }

    function getCurrentRankCycle(uint8 rank) external view returns (uint256) {
        return currentRankCycle[rank];
    }

    function getQueueStatus(uint8 rank) external view returns (
        uint256 queueLength,
        uint256 activeDonors,
        uint256 totalDonationsInRank,
        uint256 cycleNumber
    ) {
        Rank storage currentRank = ranks[rank];
        return (
            currentRank.waitingQueue.length,
            currentRank.donors.length,
            currentRank.totalFunds,
            currentRankCycle[rank]
        );
    }

    function getDetailedQueuePosition(uint8 rank, address user) external view returns (
        uint256 position,
        bool isInQueue,
        bool isActiveRankDonor,
        uint256 estimatedWaitTime
    ) {
        Rank storage currentRank = ranks[rank];
        
        position = 0;
        isInQueue = false;
        for (uint i = 0; i < currentRank.waitingQueue.length; i++) {
            if (currentRank.waitingQueue[i] == user) {
                position = i + 1;
                isInQueue = true;
                break;
            }
        }
        
        isActiveRankDonor = false;
        for (uint i = 0; i < currentRank.donors.length; i++) {
            if (currentRank.donors[i] == user) {
                isActiveRankDonor = true;
                break;
            }
        }
        
        if (position > 0 && currentRankCycle[rank] > 0) {
            estimatedWaitTime = position * (block.timestamp / currentRankCycle[rank]);
        } else {
            estimatedWaitTime = 0;
        }
    }

    function getCurrentRankStatus(uint8 rank) external view returns (
        string[] memory currentDonors,
        uint256 currentFunds,
        uint256 targetFunds,
        uint256 remainingSlots
    ) {
        Rank storage currentRank = ranks[rank];
        string[] memory userIds = new string[](currentRank.donors.length);
        for (uint i = 0; i < currentRank.donors.length; i++) {
            userIds[i] = userIdCache[currentRank.donors[i]];
            if (bytes(userIds[i]).length == 0) {
                userIds[i] = IFindup(findupContract).id(currentRank.donors[i]);
                if (bytes(userIds[i]).length == 0) {
                    userIds[i] = string(abi.encodePacked("Unknown_", _addressToString(currentRank.donors[i])));
                }
            }
        }
        return (
            userIds,
            currentRank.totalFunds,
            rankDonationValues[rank] * MAX_DONORS_PER_RANK,
            MAX_DONORS_PER_RANK - currentRank.donors.length
        );
    }
}