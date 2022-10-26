// const { ethers } = require("ethers");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
    const address = path.join(__dirname, '../', "tokenAddress.json");
    const rewardTokenAddress = JSON.parse(fs.readFileSync(address))["address"];
    console.log("Reward token address => ", rewardTokenAddress);

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(rewardTokenAddress,rewardTokenAddress);

    console.log("Staking contract address ", staking.address);

    const stakingAddress = path.join(__dirname, '../', "stakingAddress.json");
    fs.writeFileSync(stakingAddress, JSON.stringify({address: staking.address}));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });