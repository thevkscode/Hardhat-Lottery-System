const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const BASE_FEE = ethers.utils.parseEther("0.25"); //0.25 is the premium.I cost 0.25 LINK per request
const GAS_PRICE_LINK = 1e9; //link per gas.calculated value based on gas price of chain
//chainlink nodes pay the gas fee to gice us randomnedd & do external execution
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const args = [BASE_FEE, GAS_PRICE_LINK];
    if (chainId == "31337") {
        log("local network detected! Deploying mocks");
        //deploy a mock vrfcoordinator
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        });
        log("Mocks Deployed!");
        log("------------------------------------------------");
    }
};
module.exports.tags = ["all", "mocks"];
