//Raffle
//Enter the lottery(paying some amount)
//Pick a random winner(verifiably random)
//winner to be selected every X minures->compeletely automated
//chainlink oracle->Randomness,Automated execution
//SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;
// import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol"; //for fulfillRandomWords()
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol"; //for requesting random winner
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol"; //to impliment checkUpkeep ()and performUpkeep()
// import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
error Raffle__NotEnoughEthEntered();
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currbalance, uint256 numPLayers, uint256 rafflestate);

/**@title A sample Raffle Contract
 * @author Vivek Singh
 *@notice This contract is for creating an untamprable decetralized smart contract
 *@dev this implements chainlink vrf v2 and chainlink keepers
 */
contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
    /*Type declaration*/
    enum RaffleState {
        OPEN,
        CALCULATING
    }
    //uint256=>OPEN=0&&CALCULATING=1
    /*State Variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane; //the keyhash
    uint64 private immutable i_subscriptionId; //the vrf subId
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable i_callbackGasLimit; //help to protect from spending more than the acceptable gas
    uint32 private constant NUM_WORDS = 1; //how many random numbers we want to generate at a time
    //lottery variables
    address private s_recentWinner;
    // uint256 private s_state; //to pending,open,closed,calculating
    //better way to keep tack of all these is enum
    /**Enum is used to create custom types with a finite set of 'constant values */
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;
    /*events */
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    /*Functions */
    constructor(
        address vrfCoordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane, //keyHash
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2); //vrfcoordinator is the address of contract that does the random number verification
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp; //intialize with current time stamp
        i_interval = interval;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        //since msg.sender is not a payable address so we
        //need to typecast it to payable
        s_players.push(payable(msg.sender)); //since the msg.sender is payable
        //Emit an event when  we update a dynamic array or mapping
        //Named event with function name reversed
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev this is the function that the Chainlink keeper nodes call
     * they look for the `upkeepNeeded` return true
     * following should be true in order to return true:
     * 1.Our time interval should have passed
     * 2.The lottery should have atleast 1 player adn have some ETH
     * 3.Our supscription is funded with LINK
     * 4.The Lottery should be in an "open" state
     */
    function checkUpkeep(
        bytes memory /*checkData*/
    ) public view override returns (bool upkeepNeeded, bytes memory /*performData*/) {
        bool isOPen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOPen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "0x0");
    }

    /**chainlinkvrf is 2 transaction process which make it more reliable */
    function performUpkeep(bytes calldata /*performData*/) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        //this requestRandomWords() function returns a uint256 request id
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            //all these parameters are on chainlink vrf documentation
            i_gasLane, //gasLane or keyHash
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        //This is redundant!!
        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /*requestId*/, //this means that requestId is needed but not in use
        uint256[] memory randomWords
    ) internal override {
        //using modulo function to keep the randomNumber in range of size
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        //reset the state
        s_raffleState = RaffleState.OPEN;
        //reset the player array
        s_players = new address payable[](0);
        //reset time stamp
        s_lastTimeStamp = block.timestamp;
        //transfer money to recentwinner
        (bool success, ) = payable(recentWinner).call{value: address(this).balance}("");
        //require(success )
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /*Pure/Virtual function */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
