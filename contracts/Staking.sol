// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Staking
 * @dev A contract for staking NORU tokens to earn rewards.
 * Rewards could be more NORU tokens or other benefits.
 */
contract Staking is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable noruToken; // The NORU token contract
    IERC20 public immutable rewardToken; // Could be NORU itself or another token

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public rewardsEarned; // Simplified; real reward calculation is complex

    uint256 public totalStaked;
    uint256 public rewardRatePerSecond; // e.g., rewards per token per second (scaled)
    uint256 public lastUpdateTime;      // Timestamp of the last global reward update

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _noruTokenAddress, address _rewardTokenAddress) Ownable(msg.sender) {
        require(_noruTokenAddress != address(0), "Staking: Noru token address cannot be zero");
        require(_rewardTokenAddress != address(0), "Staking: Reward token address cannot be zero");
        noruToken = IERC20(_noruTokenAddress);
        rewardToken = IERC20(_rewardTokenAddress);
        lastUpdateTime = block.timestamp;
        // Set an initial reward rate (e.g., by owner)
        // rewardRatePerSecond = INITIAL_RATE;
    }

    // --- Staking Logic ---

    /**
     * @dev Allows a user to stake NORU tokens.
     * The user must first approve this contract to spend their NORU tokens.
     * @param amount The amount of NORU tokens to stake.
     */
    function stake(uint256 amount) public nonReentrant whenNotPaused {
        require(amount > 0, "Staking: Cannot stake 0 tokens");
        _updateRewards(msg.sender); // Update rewards for the user before staking

        noruToken.transferFrom(msg.sender, address(this), amount);

        stakedBalance[msg.sender] += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Allows a user to unstake their NORU tokens.
     * @param amount The amount of NORU tokens to unstake.
     */
    function unstake(uint256 amount) public nonReentrant whenNotPaused {
        require(amount > 0, "Staking: Cannot unstake 0 tokens");
        require(stakedBalance[msg.sender] >= amount, "Staking: Insufficient staked balance");
        _updateRewards(msg.sender); // Update rewards for the user before unstaking

        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;

        noruToken.transfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    // --- Rewards Logic (Simplified Example) ---

    /**
     * @dev Updates rewards for a specific user.
     * This is a simplified model. Real reward calculation often involves more complex formulas
     * considering time staked, reward per block/second, etc.
     */
    function _updateRewards(address user) internal {
        if (block.timestamp > lastUpdateTime && totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - lastUpdateTime;
            // Simplified: distribute rewards proportionally to stake.
            // This is a basic example and may not be fair or precise in all scenarios.
            // A more robust system might track rewardsPerTokenStaked.
            if (stakedBalance[user] > 0) {
                 uint256 userShare = (stakedBalance[user] * (10**18)) / totalStaked; // scaled percentage
                 uint256 rewardAmount = (timeElapsed * rewardRatePerSecond * userShare) / (10**18) ;
                 rewardsEarned[user] += rewardAmount;
            }
        }
        // For a global update, this should be handled carefully if rewardRatePerSecond changes
        // lastUpdateTime = block.timestamp; // This would be global, needs careful placement
    }
    // Global update should happen before any state change that affects reward calculation
    // function updateGlobalRewardIndex() internal {
    //    if (block.timestamp > lastUpdateTime) { ... }
    //    lastUpdateTime = block.timestamp;
    // }


    /**
     * @dev Allows a user to claim their accumulated rewards.
     */
    function claimRewards() public nonReentrant whenNotPaused {
        _updateRewards(msg.sender); // Ensure rewards are up-to-date
        uint256 rewardAmount = rewardsEarned[msg.sender];
        require(rewardAmount > 0, "Staking: No rewards to claim");

        rewardsEarned[msg.sender] = 0;
        rewardToken.transfer(msg.sender, rewardAmount);

        emit RewardsClaimed(msg.sender, rewardAmount);
    }

    /**
     * @dev View function to check pending rewards for a user.
     * This is a read-only estimate and doesn't trigger state changes.
     */
    function getPendingRewards(address user) public view returns (uint256) {
        uint256 pending = rewardsEarned[user];
        if (block.timestamp > lastUpdateTime && totalStaked > 0 && stakedBalance[user] > 0) {
            uint256 timeElapsed = block.timestamp - lastUpdateTime;
            uint256 userShare = (stakedBalance[user] * (10**18)) / totalStaked;
            pending += (timeElapsed * rewardRatePerSecond * userShare) / (10**18);
        }
        return pending;
    }


    // --- Admin Functions ---

    /**
     * @dev Updates the reward rate. Only callable by the owner.
     * @param _newRate The new reward rate per second (scaled).
     */
    function setRewardRate(uint256 _newRate) public onlyOwner {
        // Consider updating global reward calculations before changing rate
        // updateGlobalRewardIndex();
        lastUpdateTime = block.timestamp; // Reset before rate change for fairness
        rewardRatePerSecond = _newRate;
        emit RewardRateUpdated(_newRate);
    }

    /**
     * @dev Pauses staking and unstaking operations. Only callable by the owner.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses staking and unstaking operations. Only callable by the owner.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Allows owner to withdraw any reward tokens accidentally sent to this contract
     * or to fund the contract with reward tokens.
     * @param tokenAddress The address of the token to withdraw (should be rewardToken).
     * @param amount The amount to withdraw.
     */
    function emergencyWithdrawRewardTokens(address tokenAddress, uint256 amount) public onlyOwner {
        require(tokenAddress == address(rewardToken), "Staking: Can only withdraw reward token");
        IERC20(tokenAddress).transfer(owner(), amount);
    }
}
