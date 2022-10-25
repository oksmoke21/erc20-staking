// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error Staking__TransferFailed();
error Staking__ZeroAmount();

contract Staking is ReentrancyGuard{
    IERC20 public s_stakingToken;
    IERC20 public s_rewardToken;
    
    event staked_tokens(uint amount);
    event unstaked_tokens(uint amount);

    uint public s_totalSupply;
    uint public s_rewardPerTokenStored;
    uint public s_lastUpdateTime;
    uint public constant REWARD_RATE = 100; // reward tokens emited per second

    mapping(address => uint) public s_balances; // mapping of an address to how much they staked
    mapping(address => uint) public s_rewards; // mapping of how much rewards each address has been paid
    mapping(address => uint) public s_userRewardPerTokenPaid; // mapping of an address to how much they staked

    modifier updateRewards(address account) {
        // reward per token staked?
        s_rewardPerTokenStored = rewardPerToken();
        s_lastUpdateTime = block.timestamp;
        s_rewards[account] = earned(account);
        s_userRewardPerTokenPaid[account] = s_rewardPerTokenStored;
        _;
    }

    modifier moreThanZero(uint amount) {
        if(amount == 0) {
            revert Staking__ZeroAmount();
        }
        _;
    }

    constructor(address stakingToken, address rewardToken) {
        s_stakingToken = IERC20(stakingToken);
        s_rewardToken = IERC20(rewardToken);
    }

    function rewardPerToken() public view returns (uint) { 
        if(s_totalSupply == 0) { // if there's nothing staked
            return s_rewardPerTokenStored;
        }
        uint timedReward = (((block.timestamp - s_lastUpdateTime)*REWARD_RATE*1e18)/s_totalSupply);
        return s_rewardPerTokenStored + timedReward;
    }

    function earned(address account) public view returns(uint) {
        uint currentBalance = s_balances[account];
        uint amountPaid = s_userRewardPerTokenPaid[account];
        uint currentRewardPerToken = rewardPerToken();
        uint pastRewards = s_rewards[account];
        uint earnedReward = pastRewards + (currentBalance * (currentRewardPerToken - amountPaid))/1e18;
        return earnedReward;
    }

    function stake(uint amount) external updateRewards(msg.sender) moreThanZero(amount) nonReentrant() {
        s_balances[msg.sender] += amount;
        s_totalSupply += amount;
        emit staked_tokens(amount);
        bool success = s_stakingToken.transferFrom(msg.sender, address(this), amount);
        if(!success){
            revert Staking__TransferFailed();
        }
    }

    function unstake(uint amount) external updateRewards(msg.sender) moreThanZero(amount) nonReentrant() {
        s_balances[msg.sender] -= amount;
        s_totalSupply -= amount;
        emit unstaked_tokens(amount);
        bool success = s_stakingToken.transfer(msg.sender, amount);
        if(!success){
            revert Staking__TransferFailed(); 
        }
    }

    function claimReward() external updateRewards(msg.sender) {
        uint rewards = s_rewards[msg.sender];
        bool success = s_rewardToken.transfer(msg.sender, rewards);
        if(!success) {
            revert Staking__TransferFailed();
        }
    }
}