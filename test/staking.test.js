const hre = require("hardhat");
const { ethers } = require("hardhat");
const { moveBlocks } = require('../utils/move_blocks');
const { moveTime } = require('../utils/move_time');
// can also use @openzeppelin/test-helpers for moving time and blocks

const SECONDS_IN_A_DAY = 86400;

describe("Staking test", async function() {
    let staking, rewardToken, stakeAmount, stakingContractAddress, rewardTokenContractAddress, address;
    
    beforeEach(async () => {
        const _owner = await hre.ethers.getSigners();
        const _address = _owner[0].address;
        address = _address;

        const RewardTokenHRE = await hre.ethers.getContractFactory("RewardToken");
        rewardToken = await RewardTokenHRE.deploy();
        console.log("Reward Token contract deployed to => ", rewardToken.address);

        const StakingHRE = await ethers.getContractFactory("Staking");
        staking = await StakingHRE.deploy(rewardToken.address, rewardToken.address);
        console.log("Staking contract deployed to => ", staking.address);

        stakingContractAddress = staking.address;
        rewardTokenContractAddress = rewardToken.address;

        stakeAmount = ethers.utils.parseEther("1000");
    });
    
    it("allows users to stake and claim rewards", async() => {
        await rewardToken.approve(stakingContractAddress, stakeAmount);

        const staked = await staking.stake(stakeAmount);
        await staked.wait(); // waits for the transaction block to be mined before executing remaining code

        const startingEarned = await staking.earned(address);
        console.log("Earned rewards at t = 0: ", ethers.utils.formatEther(startingEarned));
        
        const stakedMoney = await rewardToken.balanceOf(stakingContractAddress);
        console.log("Balance of staking contract after staking: ", ethers.utils.formatEther(stakedMoney));
        
        const leftMoney = await rewardToken.balanceOf(address);
        console.log("Tokens left: ", ethers.utils.formatEther(leftMoney));
        
        // await moveTime(SECONDS_IN_A_DAY*180); // can only test with local testnets
        // await moveBlocks(1); // can only test with local testnets
        
        // const laterEarned = await staking.earned(address);
        // console.log("Earned rewards at t = 1 day: ", ethers.utils.formatEther(laterEarned));
    });
});