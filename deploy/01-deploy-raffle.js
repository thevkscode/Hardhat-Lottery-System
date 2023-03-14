const { network, ethers } = require("hardhat");
const {
    developmentChains,
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    VRF_SUB_FUND_AMOUNT,
} = require("../helper-hardhat-config");
require("dotenv").config();
const { verify } = require("../utils/verify");
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const waitBlockConfirmation = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS;
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;
    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
        //fund the subscription
        //usually you'd need the link token on a real network
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }
    const entranceFee = networkConfig[chainId]["entranceFee"];
    const gasLane = networkConfig[chainId]["gasLane"];
    const callbackGasLimit = networkConfig[chainId]["callBackGasLimit"];
    const interval = networkConfig[chainId]["interval"];
    log("--------------------------------------------------");
    //all these arguments are constructor parameters
    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ];
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfiramtions: waitBlockConfirmation,
    });
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock");
        await vrfCoordinatorV2.addConsumer(subscriptionId, raffle.address);
    }
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(raffle.address, args);
    }
    log("----------------------------------------------------");
};
module.exports.tags = ["all", "raffle"];
