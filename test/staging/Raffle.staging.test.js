const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", () => {
          let raffle, raffleEntranceFee, deployer;
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              raffle = await ethers.getContract("Raffle", deployer);
              raffleEntranceFee = await raffle.getEntranceFee();
          });
          describe("fulfillRandomWords", function () {
              it("works with live Chainlink keepers and Chainlink VRF,we get a random winner", async () => {
                  console.log("Setting up test...");
                  //enter thr raffle
                  const startingTimeStamp = await raffle.getLatestTimeStamp();
                  const accounts = await ethers.getSigners();
                  //setup listener before we enter the raffle
                  //Just in case blockchain moves really fast
                  console.log("Setting up listener...");
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!");
                          try {
                              const recentWinner = await raffle.getRecentWinner();
                              const raffleState = await raffle.getRaffleState();
                              const winnerEndingBalance = await accounts[0].getBalance();
                              const endingTimeStamp = await raffle.getLatestTimeStamp();
                              await expect(raffle.getPlayer(0)).to.be.reverted;
                              assert.equal(recentWinner.toString(), accounts[0].address);
                              assert.equal(raffleState, 0);
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              );
                              assert(endingTimeStamp > startingTimeStamp);
                              resolve();
                          } catch (error) {
                              console.log(error);
                              reject(error);
                          }
                      });
                      //Then entering the raffle
                      console.log("Entering Raffle...");
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
                      console.log("Connected!");
                      await tx.wait(1);
                      console.log("Ok,time to wait...");
                      const winnerStartingBalance = await accounts[0].getBalance();
                      //and this code WONT complete until our listener has finished listening!
                  });
              });
          });
      });
/**To test this on testnet we need
 * 1.Get our SubId for Chainlink VRF
 * 2.Deploy our contract using that SubId
 * 3.Register the contract with Chainlink VRF and it's subId
 * 4.Register the contract with Chainlink Keepers
 * 5.Run staging test
 * syntest:yarn hardhat test --netwrok goerli/sepolia
 */
