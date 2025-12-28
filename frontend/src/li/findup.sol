// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface INobleGift {
    function receiveFromFindup(address user, uint256 amount) external payable;
    function getUserTotalDonation(address user) external view returns (uint256);
}

/**
 * @title Findup
 * @dev A multi-level marketing contract with referral, sponsor, upline, royalty, and noblegift rewards.
 */
contract Findup is ReentrancyGuard, Ownable {
    address private sharefee; // Same as platformWallet in NobleGift.sol
    address private noblegiftWallet;
    uint public royaltyPool;
    string private defaultReferralId;
    uint8 private constant maxLayers = 24;
    uint[5] private royaltyPercent = [28, 25, 20, 15, 12];
    uint[5] private royaltyLvl = [8, 9, 10, 11, 12];
    uint private constant royaltyMaxPercent = 200;
    uint private constant directRequired = 2;
    uint[12] private levels = [4.4e15, 7.20e15, 12e15, 27e15, 50.4e15, 102e15, 174e15, 312e15, 816e15, 1488e15, 2760e15, 5520e15];
    uint[12] private uplinePercents = [0, 80, 80, 50, 80, 80, 80, 80, 80, 80, 80, 80];
    uint256 public platformIncome;
    
    // Constants for layer types
    uint8 private constant LAYER_REFERRAL = 0;
    uint8 private constant LAYER_SPONSOR = 1;
    uint8 private constant LAYER_OFFSET_UPLINE = 10; // Offset untuk upline layers

    struct User {
        address account;
        string id;
        string referrer;
        string upline;
        uint8 layer;
        uint start;
        uint level;
        uint directTeam;
        string[] directTeamMembers;
        uint totalMatrixTeam;
        uint totalIncome;
        uint totalDeposit;
        uint royaltyIncome;
        uint referralIncome;
        uint levelIncome;
    }

    struct Income {
        string id;
        uint layer;
        uint amount;
        uint time;
    }

    struct Activity {
        string id;
        uint level;
    }

    uint public nextUserId = 8889;
    uint public startTime;
    uint public totalUsers;
    uint[5] public royalty;
    string[] public globalUsers;
    mapping(uint => string[]) public royaltyUsers;
    mapping(string => uint) public royaltyIncome;
    uint public royaltyLastDist;
    mapping(string => User) public userInfo;
    mapping(string => Income[]) public incomeInfo;
    Activity[] public activity;
    mapping(string => mapping(uint => string[])) public teams;
    mapping(string => uint) public matrixDirect;
    mapping(address => string) public id;
    mapping(string => address) public userIds;
    mapping(string => uint) public claimableRoyalty;
    mapping(string => mapping(uint => uint)) public userLevelIncome;

    event ReferralDistribution(string indexed userId, string indexed referrerId, uint amount);
    event TotalRoyaltyDistributed(uint totalAmount, uint totalRecipients, uint timestamp);
    event SharefeeDistribution(string indexed userId, address indexed sharefee, uint amount);
    event UserUpgraded(string indexed userId, uint newLevel, uint amount);
    event RoyaltyClaimed(string indexed userId, uint amount);
    event NoblegiftDistribution(string indexed userId, address indexed receiver, uint amount);
    event Upgraded(string indexed id, uint newLevel, uint cost);
    event DebugTransfer(string purpose, address indexed to, uint amount);
    event DebugUpline(string userId, string uplineId, uint amount, bool success);
    event UplineDistribution(string indexed userId, string indexed uplineId, uint amount);
    event SponsorDistribution(string indexed userId, string indexed sponsorId, uint amount);
    event UplineReward(string indexed userId, string indexed uplineId, uint amount);
    event SponsorReward(string indexed userId, string indexed sponsorId, uint amount);
    event RoyaltyReward(string indexed userId, uint amount);
    event FundsDistributed(address indexed to, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);

    /**
     * @dev Constructor to initialize the contract.
     * @param _defaultReferralId The default referral ID (e.g., A8889NR).
     * @param _sharefee Address to receive sharefee (same as platformWallet in NobleGift).
     * @param _noblegiftWallet Address of the NobleGift contract.
     * @param _owner Owner address.
     */
    constructor(string memory _defaultReferralId, address _sharefee, address _noblegiftWallet, address _owner) {
        require(_sharefee != address(0), "Invalid sharefee address");
        require(_noblegiftWallet != address(0), "Invalid noblegift wallet address");
        defaultReferralId = _defaultReferralId;
        sharefee = _sharefee;
        noblegiftWallet = _noblegiftWallet;
        royaltyLastDist = block.timestamp;
        startTime = block.timestamp;
        nextUserId = 8889;

        _initializeUser(_defaultReferralId, _defaultReferralId, _owner, 0, 1);
        id[_owner] = _defaultReferralId;
        userIds[_defaultReferralId] = _owner;
        totalUsers = 1;
        emit DebugTransfer("Constructor Deployed", address(this), 0);

        _transferOwnership(_owner);
    }

    receive() external payable {}

    /**
     * @dev Registers a new user.
     * @param _ref Referrer ID.
     * @param _newAcc New user address.
     */
    function register(string memory _ref, address _newAcc) external payable nonReentrant {
        require(_newAcc != address(0), "Invalid address");
        require(bytes(id[_newAcc]).length == 0, "Already Registered");
        require(bytes(userInfo[_ref].id).length > 0 || keccak256(bytes(_ref)) == keccak256(bytes(defaultReferralId)), "Invalid Referrer");
        require(bytes(_ref).length > 0, "Referrer ID cannot be empty");

        bool isSuper = msg.sender == owner() && (block.timestamp - startTime) < 3 hours;
        uint newIdNum = nextUserId;
        nextUserId++;

        uint _inAmt = levels[0];
        if (!isSuper) require(msg.value == _inAmt, "Invalid value");

        bool isDefaultReferral = keccak256(bytes(_ref)) == keccak256(bytes(defaultReferralId));
        uint8 referrerLayer = isDefaultReferral ? userInfo[defaultReferralId].layer : uint8(userInfo[_ref].layer + 1 > maxLayers ? maxLayers : userInfo[_ref].layer + 1);
        string memory newId = _generateUserId(referrerLayer, newIdNum, isDefaultReferral);

        _initializeUser(newId, _ref, _newAcc, _inAmt, referrerLayer);
        _handleFunds(newId, _inAmt, isSuper);
        _updateUserNetwork(newId, _ref);

        id[_newAcc] = newId;
        userIds[newId] = _newAcc;
    }

    function _initializeUser(string memory _userId, string memory _ref, address _newAcc, uint _inAmt, uint8 _layer) private {
        User storage user = userInfo[_userId];
        user.id = _userId;
        user.referrer = _ref;
        user.account = _newAcc;
        user.start = block.timestamp;
        user.level = 1;
        user.totalDeposit = _inAmt;
        user.layer = _layer;
    }

    function _handleFunds(string memory _userId, uint _inAmt, bool _isSuper) private {
        uint referralAmount = (_inAmt * 91) / 100;
        uint royaltyAmount = (_inAmt * 3) / 100;
        uint sharefeeAmount = _inAmt - referralAmount - royaltyAmount;
        bool success;

        _distributeRoyalty(royaltyAmount);

        if (!_isSuper) {
            if (keccak256(bytes(userInfo[_userId].referrer)) == keccak256(bytes(defaultReferralId))) {
                uint totalSharefee = sharefeeAmount + referralAmount;
                (success, ) = payable(sharefee).call{value: totalSharefee}("");
                require(success, "Sharefee transfer failed");
                platformIncome += totalSharefee;
                emit SharefeeDistribution(_userId, sharefee, totalSharefee);
            } else {
                string memory refId = userInfo[_userId].referrer;
                User storage referrer = userInfo[refId];
                (success, ) = payable(referrer.account).call{value: referralAmount}("");
                require(success, "Referral transfer failed");
                referrer.totalIncome += referralAmount;
                referrer.referralIncome += referralAmount;
                userLevelIncome[refId][0] += referralAmount;
                incomeInfo[refId].push(Income(_userId, 0, referralAmount, block.timestamp));
                emit ReferralDistribution(_userId, refId, referralAmount);

                (success, ) = payable(sharefee).call{value: sharefeeAmount}("");
                require(success, "Sharefee transfer failed");
                platformIncome += sharefeeAmount;
                emit SharefeeDistribution(_userId, sharefee, sharefeeAmount);
            }
        }
    }

    function _updateUserNetwork(string memory _userId, string memory _ref) private {
        if (totalUsers > 0 && keccak256(bytes(_ref)) != keccak256(bytes(defaultReferralId))) {
            _placeInMatrix(_userId, _ref);
            _updateReferrer(_userId, _ref);
        }
        globalUsers.push(_userId);
        totalUsers += 1;
        activity.push(Activity(_userId, 1));
    }

    function _updateReferrer(string memory _userId, string memory _ref) private {
        User storage referrer = userInfo[_ref];
        for (uint i = 0; i < referrer.directTeamMembers.length; i++) {
            if (keccak256(bytes(referrer.directTeamMembers[i])) == keccak256(bytes(_userId))) return;
        }
        referrer.directTeamMembers.push(_userId);
        referrer.directTeam += 1;
    }

    function _placeInMatrix(string memory _user, string memory _ref) private {
        string memory upline = _findUpline(_ref);
        if (bytes(upline).length != 0) {
            userInfo[_user].upline = upline;
            userInfo[upline].directTeam += 1;
            userInfo[upline].directTeamMembers.push(_user);
            _updateMatrixTeams(_user, upline);
        }
    }

    function _findUpline(string memory _ref) private view returns (string memory) {
        if (userInfo[_ref].directTeam < 2) return _ref;

        for (uint i = 0; i < maxLayers; i++) {
            if (teams[_ref][i + 1].length >= 2 ** (i + 2)) continue;
            for (uint j = 0; j < teams[_ref][i].length; j++) {
                string memory temp = teams[_ref][i][j];
                if (userInfo[temp].directTeam < 2) return temp;
            }
        }
        return "";
    }

    function _updateMatrixTeams(string memory _user, string memory _upline) private {
        string memory upline = _upline;
        for (uint i = 0; i < maxLayers; i++) {
            if (bytes(upline).length == 0 || keccak256(bytes(upline)) == keccak256(bytes(defaultReferralId))) break;
            userInfo[upline].totalMatrixTeam += 1;
            teams[upline][i].push(_user);
            upline = userInfo[upline].upline;
        }
    }

    /**
     * @dev Upgrades user level(s).
     * @param _id User ID.
     * @param _lvls Number of levels to upgrade.
     */
    function upgrade(string memory _id, uint _lvls) external payable nonReentrant {
        User storage user = userInfo[_id];
        require(bytes(user.referrer).length > 0, "Register First");
        require(_lvls > 0 && user.level + _lvls <= levels.length, "Invalid Levels");
        require(msg.sender == user.account, "Only User");

        uint totalCost = 0;
        for (uint i = 0; i < _lvls; i++) {
            totalCost += levels[user.level + i];
        }
        require(msg.value >= totalCost, "Insufficient payment");

        uint refund = msg.value - totalCost;
        if (refund > 0) {
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }

        for (uint i = 0; i < _lvls; i++) {
            user.totalDeposit += levels[user.level];
            _processUpgrade(_id, user.level, false);
            user.level += 1;
            _updateRoyaltyUsers(_id, user.level);
        }

        emit UserUpgraded(_id, user.level, totalCost);
    }

    function _processUpgrade(string memory _id, uint _level, bool _isSuper) private {
        if (!_isSuper) {
            uint amount = levels[_level];
            string memory uplineId = _distUpgrading(_id, _level);
            uint uplineAmount = (amount * uplinePercents[_level]) / 100;
            uint sponsorAmount = (amount * 10) / 100;
            uint royaltyAmount = (amount * 3) / 100;
            uint noblegiftAmount = _level == 3 ? (amount * 30) / 100 : 0;
            bool success;

            emit DebugTransfer("Contract Before", address(this), address(this).balance);

            string memory sponsorId = bytes(uplineId).length != 0 && keccak256(bytes(uplineId)) != keccak256(bytes(defaultReferralId)) 
                ? userInfo[uplineId].referrer 
                : defaultReferralId;
            require(bytes(sponsorId).length > 0, "Invalid sponsor ID");
            require(userIds[sponsorId] != address(0), "Sponsor ID not associated with any account");
            if (keccak256(bytes(sponsorId)) != keccak256(bytes(defaultReferralId))) {
                _distributeUplineSponsor(sponsorId, amount);
                incomeInfo[sponsorId].push(Income(_id, 1, sponsorAmount, block.timestamp));
                emit SponsorDistribution(_id, sponsorId, sponsorAmount);
            } else {
                address defaultReferrerAccount = userIds[defaultReferralId];
                emit DebugTransfer("Sponsor to Default Referrer Before", defaultReferrerAccount, sponsorAmount);
                (success, ) = payable(defaultReferrerAccount).call{value: sponsorAmount}("");
                require(success, "Default referrer transfer for sponsor failed");
                emit SharefeeDistribution(_id, defaultReferrerAccount, sponsorAmount);
                emit SponsorDistribution(_id, defaultReferralId, sponsorAmount);
                emit SponsorReward(_id, defaultReferralId, sponsorAmount);
                emit DebugTransfer("Sponsor to Default Referrer After", defaultReferrerAccount, sponsorAmount);
                userInfo[defaultReferralId].totalIncome += sponsorAmount;
                incomeInfo[defaultReferralId].push(Income(_id, 1, sponsorAmount, block.timestamp));
            }

            _distributeRoyalty(royaltyAmount);

            if (noblegiftAmount > 0) {
                emit DebugTransfer("Noblegift Before", noblegiftWallet, noblegiftAmount);
                (success, ) = payable(noblegiftWallet).call{value: noblegiftAmount}(
                    abi.encodeWithSignature("receiveFromFindup(address,uint256)", userInfo[_id].account, noblegiftAmount)
                );
                require(success, "Noblegift transfer failed");
                emit NoblegiftDistribution(_id, noblegiftWallet, noblegiftAmount);
                emit DebugTransfer("Noblegift After", noblegiftWallet, noblegiftAmount);
                incomeInfo[_id].push(Income(_id, _level, noblegiftAmount, block.timestamp));
            }

            uint totalDeductions = uplineAmount + sponsorAmount + royaltyAmount + noblegiftAmount;
            uint sharefeeAmount = amount - totalDeductions;
            if (sharefeeAmount > 0) {
                emit DebugTransfer("Sharefee Before", sharefee, sharefeeAmount);
                (success, ) = payable(sharefee).call{value: sharefeeAmount}("");
                require(success, "Sharefee transfer failed");
                emit SharefeeDistribution(_id, sharefee, sharefeeAmount);
                emit DebugTransfer("Sharefee After", sharefee, sharefeeAmount);
                platformIncome += sharefeeAmount;
            }

            emit DebugTransfer("Contract After", address(this), address(this).balance);

            uint totalDistributed = uplineAmount + sponsorAmount + royaltyAmount + noblegiftAmount + sharefeeAmount;
            require(totalDistributed == amount, "Distribution mismatch");
        }
    }

    function _distUpgrading(string memory _user, uint _level) private returns (string memory) {
        string memory uplineId = userInfo[_user].upline;
        uint amount = levels[_level];
        uint uplineAmount = (amount * uplinePercents[_level]) / 100;
        bool success;

        if (bytes(uplineId).length == 0) {
            emit DebugTransfer("Upline to Sharefee Before", sharefee, uplineAmount);
            (success, ) = payable(sharefee).call{value: uplineAmount}("");
            require(success, "Sharefee transfer failed");
            emit SharefeeDistribution(_user, sharefee, uplineAmount);
            emit DebugTransfer("Upline to Sharefee After", sharefee, uplineAmount);
            platformIncome += uplineAmount;
            return "";
        }

        while (bytes(uplineId).length != 0 && keccak256(bytes(uplineId)) != keccak256(bytes(defaultReferralId))) {
            User storage upline = userInfo[uplineId];
            if (upline.level >= _level + 1 && upline.directTeam >= 2) {
                emit DebugTransfer("Upline Before", upline.account, uplineAmount);
                (success, ) = payable(upline.account).call{value: uplineAmount}("");
                require(success, "Upline transfer failed");
                emit UplineReward(_user, uplineId, uplineAmount);
                emit UplineDistribution(_user, uplineId, uplineAmount);
                emit DebugTransfer("Upline After", upline.account, uplineAmount);
                userInfo[uplineId].totalIncome += uplineAmount;
                userInfo[uplineId].levelIncome += uplineAmount;
                incomeInfo[uplineId].push(Income(_user, _level + LAYER_OFFSET_UPLINE, uplineAmount, block.timestamp));
                return uplineId;
            }
            uplineId = userInfo[uplineId].upline;
        }

        emit DebugTransfer("Upline to Sharefee Before", sharefee, uplineAmount);
        (success, ) = payable(sharefee).call{value: uplineAmount}("");
        require(success, "Sharefee transfer failed");
        emit SharefeeDistribution(_user, sharefee, uplineAmount);
        emit DebugTransfer("Upline to Sharefee After", sharefee, uplineAmount);
        platformIncome += uplineAmount;
        return "";
    }

    /**
     * @dev Distributes sponsor reward (10% of upgrade amount).
     * @param _sponsorId Sponsor ID.
     * @param amount Upgrade amount.
     */
    function _distributeUplineSponsor(string memory _sponsorId, uint256 amount) private {
        uint sponsorAmount = (amount * 10) / 100;
        address payable sponsorAccount = payable(userInfo[_sponsorId].account);
        require(sponsorAccount != address(0), "Sponsor ID not found");

        bool success;
        emit DebugTransfer("Sponsor to Upline Before", sponsorAccount, sponsorAmount);
        (success, ) = sponsorAccount.call{value: sponsorAmount}("");
        require(success, "Sponsor transfer failed");
        emit DebugTransfer("Sponsor to Upline After", sponsorAccount, sponsorAmount);
        userInfo[_sponsorId].totalIncome += sponsorAmount;
        incomeInfo[_sponsorId].push(Income("", 1, sponsorAmount, block.timestamp));
        emit SponsorReward("", _sponsorId, sponsorAmount);
    }

    function _distributeRoyalty(uint _royaltyAmount) private {
        uint totalEligible = _countEligibleRoyaltyUsers();
        if (totalEligible > 0) {
            uint share = _royaltyAmount / totalEligible;
            _distributeRoyaltyShares(share);
            emit TotalRoyaltyDistributed(_royaltyAmount, totalEligible, block.timestamp);
        } else {
            royaltyPool += _royaltyAmount;
        }
    }

    function _countEligibleRoyaltyUsers() private view returns (uint) {
        uint total = 0;
        for (uint i = 0; i < royaltyLvl.length; i++) {
            total += getRoyaltyUsers(i).length;
        }
        return total;
    }

    function _distributeRoyaltyShares(uint _share) private {
        for (uint i = 0; i < royaltyLvl.length; i++) {
            _distributeToLevel(i, _share);
        }
    }

    function _distributeToLevel(uint _level, uint _share) private {
        string[] memory users = getRoyaltyUsers(_level);
        for (uint j = 0; j < users.length; j++) {
            _distributeShareToUser(users[j], _share);
        }
    }

    function _distributeShareToUser(string memory _userId, uint _share) private {
        User storage user = userInfo[_userId];
        uint maxIncome = (user.totalDeposit * royaltyMaxPercent) / 100;
        uint available = maxIncome - user.royaltyIncome;
        uint actualShare = _share > available ? available : _share;
        royaltyIncome[_userId] += actualShare;
        userInfo[_userId].royaltyIncome += actualShare;
        emit RoyaltyReward(_userId, actualShare);
        if (_share > actualShare) royaltyPool += (_share - actualShare);
    }

    function claimRoyalty() external nonReentrant {
        string memory userId = id[msg.sender];
        require(bytes(userId).length != 0, "Register First");
        require(royaltyIncome[userId] > 0, "No royalty to claim");

        uint amount = royaltyIncome[userId];
        royaltyIncome[userId] = 0;
        userInfo[userId].totalIncome += amount;
        userInfo[userId].royaltyIncome += amount;

        bool success;
        (success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Royalty claim transfer failed");
        emit RoyaltyClaimed(userId, amount);
    }

    function _updateRoyaltyUsers(string memory _id, uint _newLevel) private {
        for (uint i = 0; i < royaltyLvl.length; i++) {
            if (userInfo[_id].level == royaltyLvl[i]) {
                _removeFromRoyaltyUsers(_id, i);
            }
        }
        for (uint i = 0; i < royaltyLvl.length; i++) {
            if (_newLevel == royaltyLvl[i]) {
                royaltyUsers[i].push(_id);
            }
        }
    }

    function _removeFromRoyaltyUsers(string memory _userId, uint _levelIndex) private {
        string[] storage users = royaltyUsers[_levelIndex];
        for (uint i = 0; i < users.length; i++) {
            if (keccak256(bytes(users[i])) == keccak256(bytes(_userId))) {
                users[i] = users[users.length - 1];
                users.pop();
                break;
            }
        }
    }

    function getRoyaltyUsers(uint _level) public view returns (string[] memory) {
        string[] memory users = new string[](royaltyUsers[_level].length);
        uint count = 0;

        for (uint i = 0; i < royaltyUsers[_level].length; i++) {
            string memory userId = royaltyUsers[_level][i];
            if (_isEligibleForRoyalty(userId, _level)) {
                users[count] = userId;
                count++;
            }
        }

        string[] memory eligibleUsers = new string[](count);
        for (uint i = 0; i < count; i++) {
            eligibleUsers[i] = users[i];
        }
        return eligibleUsers;
    }

    function _isEligibleForRoyalty(string memory _userId, uint _level) private view returns (bool) {
        User memory user = userInfo[_userId];
        return user.level == royaltyLvl[_level] &&
               user.directTeam >= directRequired &&
               user.royaltyIncome < (user.totalDeposit * royaltyMaxPercent) / 100;
    }

    function _generateUserId(uint8 _layer, uint _idNum, bool _isDefaultReferral) private pure returns (string memory) {
        string memory layerLetter = _layerToLetter(_layer);
        string memory idStr = _uintToString(_idNum);
        string memory status = _isDefaultReferral ? "NR" : "WR";
        return string(abi.encodePacked(layerLetter, idStr, status));
    }

    function _layerToLetter(uint8 _layer) private pure returns (string memory) {
        require(_layer >= 1 && _layer <= maxLayers, "Invalid layer");
        bytes1 letter = bytes1(uint8(64 + _layer));
        return string(abi.encodePacked(letter));
    }

    function _uintToString(uint256 _value) private pure returns (string memory) {
        if (_value == 0) return "0";
        uint256 temp = _value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (_value > 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (_value % 10)));
            _value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Returns income breakdown for a user.
     * @param _userId User ID.
     * @return referralIncome Income from registration referrals.
     * @return uplineIncome Income from upline rewards.
     * @return sponsorIncomeAmount Income from sponsor rewards.
     * @return noblegiftIncome Income from noblegift donations.
     * @return royaltyIncomeReturn Income from royalty rewards.
     */
    function getUserIncomeBreakdown(string memory _userId) external view returns (
        uint referralIncome,
        uint uplineIncome,
        uint sponsorIncomeAmount,
        uint noblegiftIncome,
        uint royaltyIncomeReturn
    ) {
        User memory user = userInfo[_userId];
        require(user.account != address(0), "Invalid user ID");

        uint sponsorTotal = 0;
        uint uplineIncomeAmount = 0;
        for (uint i = 0; i < incomeInfo[_userId].length; i++) {
            if (incomeInfo[_userId][i].layer == LAYER_SPONSOR) {
                sponsorTotal += incomeInfo[_userId][i].amount;
            } else if (incomeInfo[_userId][i].layer >= LAYER_OFFSET_UPLINE) {
                uplineIncomeAmount += incomeInfo[_userId][i].amount;
            }
        }

        return (
            user.referralIncome,
            uplineIncomeAmount,
            sponsorTotal,
            INobleGift(noblegiftWallet).getUserTotalDonation(user.account),
            royaltyIncome[_userId]
        );
    }

    function getLevelCost(uint256 _level) external view returns (uint256) {
        require(_level > 0 && _level <= levels.length, "Invalid level");
        return levels[_level - 1];
    }

    function getPlatformIncome() external view returns (uint256) {
        return platformIncome;
    }

    function totalNobleGiftDonations(string memory _userId) external view returns (uint256) {
        address userAddress = userIds[_userId];
        require(userAddress != address(0), "Invalid user ID");
        return INobleGift(noblegiftWallet).getUserTotalDonation(userAddress);
    }

    function getRoyaltyIncome(string memory _userId) external view returns (uint) {
        return royaltyIncome[_userId];
    }

    function getMatrixUsers(string memory _user, uint _layer) external view returns (User[] memory) {
        User[] memory users = new User[](teams[_user][_layer].length);

        for (uint i = 0; i < teams[_user][_layer].length; i++) {
            users[i] = userInfo[teams[_user][_layer][i]];
        }
        return users;
    }

    function getIncome(string memory _user) external view returns (Income[] memory) {
        return incomeInfo[_user];
    }

    function getMatrixDirect(string memory _user) external view returns (string[] memory) {
        return teams[_user][0];
    }

    function getDirectTeamUsers(string memory _user) external view returns (User[] memory) {
        User[] memory users = new User[](userInfo[_user].directTeamMembers.length);
        for (uint i = 0; i < userInfo[_user].directTeamMembers.length; i++) {
            users[i] = userInfo[userInfo[_user].directTeamMembers[i]];
        }
        return users;
    }

    function getLevels() external view returns (uint[12] memory, uint[12] memory) {
        return (levels, uplinePercents);
    }

    function getRecentActivities(uint _num) external view returns (Activity[] memory) {
        Activity[] memory _activity = new Activity[](activity.length > _num ? _num : activity.length);
        if (activity.length > _num) {
            uint taken = 0;
            for (uint i = activity.length; i > activity.length - _num; i--) {
                _activity[taken] = activity[i - 1];
                taken++;
            }
        } else {
            for (uint i = 0; i < activity.length; i++) {
                _activity[i] = activity[i];
            }
        }
        return _activity;
    }

    function getLevelIncome(string memory _id) external view returns (uint[12] memory) {
        uint[12] memory income;
        for (uint i = 0; i < 12; i++) {
            income[i] = userLevelIncome[_id][i];
        }
        return income;
    }

    function getBalance(address _address) public view returns (uint256) {
        return _address.balance;
    }

    function getDefaultRefer() public view returns (string memory) {
        return defaultReferralId;
    }

    function getSharefee() public view returns (address) {
        return sharefee;
    }

    function getNoblegiftWallet() external view returns (address) {
        return noblegiftWallet;
    }

    function checkContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Withdraws remaining funds to a specified address (owner only).
     * @param _to Recipient address.
     */
    function withdrawRemainingFunds(address payable _to) external onlyOwner nonReentrant {
        require(_to != address(0), "Invalid recipient address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available to withdraw");

        bool success;
        emit DebugTransfer("Withdraw Remaining Funds Before", _to, balance);
        (success, ) = _to.call{value: balance}("");
        require(success, "Withdrawal failed");
        emit FundsWithdrawn(_to, balance);
        emit DebugTransfer("Withdraw Remaining Funds After", _to, balance);
    }

    function setSharefee(address _newSharefee) external onlyOwner {
        require(_newSharefee != address(0), "Invalid address");
        sharefee = _newSharefee;
        emit SharefeeUpdated(_newSharefee);
    }

    function setNoblegiftWallet(address _newNoblegiftWallet) external onlyOwner {
        require(_newNoblegiftWallet != address(0), "Invalid address");
        noblegiftWallet = _newNoblegiftWallet;
    }

    function setDefaultReferralId(string memory _newDefaultReferralId) external onlyOwner {
        require(userIds[_newDefaultReferralId] != address(0), "Invalid default referral ID");
        defaultReferralId = _newDefaultReferralId;
    }

    event SharefeeUpdated(address indexed newSharefee);
}