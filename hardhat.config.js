require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            chainId: 11155111,
            accounts: [SEPOLIA_PRIVATE_KEY],
            blockConfirmations: 10,
            saveDeployments: true,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            chainId: 5,
            accounts: [GOERLI_PRIVATE_KEY],
            blockConfirmations: 6,
            saveDeployments: true,
        },
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
            blockConfirmations: 1,
        },
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: ETHERSCAN_API_KEY,
        customChains: [
            {
                network: "goerli",
                chainId: 5,
                urls: {
                    apiURL: `https://api-goerli.etherscan.io/${ETHERSCAN_API_KEY}`,
                    browserURL: "https://goerli.etherscan.io",
                },
            },
            {
                network: "sepolia",
                chainId: 11155111,
                urls: {
                    apiURL: `https://api-sepolia.etherscan.io/${ETHERSCAN_API_KEY}`,
                    browserURL: "https://sepolia.etherscan.io",
                },
            },
        ],
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
            {
                version: "0.4.24",
            },
        ],
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-reporter.txt",
        noColors: true,
    },
    contractSizer: {
        runOnCompile: false,
        only: ["Raffle"],
    },
    namedAccounts: {
        deployer: {
            default: 0, //here this will by default take the first account as deployer
            1: 0, //similarly on mainnet it will take the first account as deployer.Note thought that depedending on how network are configured,the accoutn 0 on one network can be different on other network
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 500000, //500 sec max for running tests
    },
};
