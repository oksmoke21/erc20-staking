const { ethers } = require("ethers");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const RewardToken = await hre.ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy();

    console.log("Contract deployed to => ", rewardToken.address);
    console.log("Total reward token supply => ", ethers.utils.formatEther(await rewardToken.totalSupply()));

    const address = path.join(__dirname, '../', "tokenAddress.json");
    fs.writeFileSync(address, JSON.stringify({address: rewardToken.address}));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });