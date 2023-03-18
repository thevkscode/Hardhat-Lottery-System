# Hardhat Lottery System using Blockchain, Chainlink VRF, and Keepers

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Project Overview

This repository contains a Hardhat-based Lottery System that utilizes blockchain technology, Chainlink VRF, and Keepers.

- **Hardhat** is a development environment for building smart contracts on the Ethereum blockchain.
- **Lottery System** is a program that allows users to participate in a lottery by buying tickets.
- **Blockchain technology** is a decentralized digital ledger that allows for secure, transparent, and tamper-proof transactions.
- **Chainlink VRF** is a decentralized oracle that provides verifiable randomness.
- **Keepers** is a network of decentralized bots that perform tasks on the Ethereum blockchain.

The combination of these technologies ensures that the lottery system is fair, transparent, and secure. Hardhat provides a set of tools and features that make it easier to develop, test, and deploy smart contracts. Blockchain technology ensures that the process is transparent and tamper-proof. Chainlink VRF ensures that the selection of the winner is truly random and cannot be manipulated. Keepers can be used to automate tasks such as selecting a winner and distributing the prize.

## Prerequisites

In order to run this lottery system, you will need the following:

- Node.js
- Yarn
- Git
- Hardhat
- Hardhat Network
- Solidity
- Chainlink VRF
- Keepers

## Installation

To install this lottery system, follow these steps:

1. Clone the repository using `git clone https://github.com/your-username/hardhat-lottery-system.git`
2. Navigate to the directory using `cd hardhat-lottery-system`
3. Install the required packages using `yarn install`

## Configuration

Before running the lottery system, you will need to configure the Chainlink VRF and Keepers.

### Chainlink VRF

1. Create an account on [Chainlink](https://chain.link/)
2. Create a VRF job on Chainlink using the provided documentation
3. Copy the Job ID and Job Key and paste them in the `hardhat.config.js` file

### Keepers

1. Create an account on [KeeperDAO](https://app.keep3r.network/)
2. Fund your account with KPR tokens
3. Create a job on KeeperDAO using the provided documentation
4. Copy the job ID and paste it in the `hardhat.config.js` file

## Usage

To run the lottery system, follow these steps:

1. Start the Hardhat network using `npx hardhat node`
2. Deploy the smart contracts using `npx hardhat run scripts/deploy.js --network localhost`
3. Start the frontend using `yarn start`

## Contributing

If you would like to contribute to this repository, please follow these guidelines:

1. Fork the repository
2. Create a new branch using `git checkout -b my-new-feature`
3. Make your changes and commit them using `git commit -am 'Add some feature'`
4. Push your changes to your branch using `git push origin my-new-feature`
5. Create a pull request

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
