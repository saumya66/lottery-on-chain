//SPDX-License-Identifier:MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Lottery__NotEnoughETH(); //declaring potential errors here that could occur in the contract
error Lottery__LotterWinningTransferFailed();
error Lottery__NotOpen();
error Lottery__UpkeepNotNeeded(uint256 numOfPlayers, uint256 lotteryState ,uint256 balance);  

contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface{
    
    enum LotteryState{ OPEN, CLOSED, CALCULATING }

    uint256 private immutable i_entranceFee; //we used immuntable as it saves gas and also it needs to be set just once
    address payable[] private s_players; 
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    address private s_recentWinner;
    LotteryState private s_lotteryState;
    uint256 private s_lastBlockTimeStamp;
    uint256 private immutable i_interval;

    //immutable variable are those which are going to remain same, while storage variable are basically state variables
    //which will change

    event EnteredLottery(address indexed addr);
    event RequestedLotteryWinner(uint256 indexed id);
    event WinnerPicked(address indexed winner);
    
    constructor(address vrfCoordinatorV2, uint256 entranceFee, bytes32 gasLane, uint64 subscriptionId, uint32 callbackGasLimit, uint256 interval) VRFConsumerBaseV2(vrfCoordinatorV2){
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);//contract
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lastBlockTimeStamp = block.timestamp;
        i_interval = interval;
    }

    //to make the entrace fee public
    function seeEntranceFee() public view returns(uint256){
        return i_entranceFee;
    }

    function enterLottery() public payable{
        if(msg.value < i_entranceFee){
            revert Lottery__NotEnoughETH();
        }
        if(s_lotteryState != LotteryState.OPEN){
            revert Lottery__NotOpen();
        }
        s_players.push(payable(msg.sender));//type casted to make the address of sender payable
        emit EnteredLottery(msg.sender);
    }

  
    function checkUpkeep(bytes memory /* checkData */) public override returns (bool upkeepNeeded, bytes memory /* performData */) {
        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
        bool isOpen = LotteryState.OPEN == s_lotteryState; //checking if lottery is open
        bool hasTimePassed = block.timestamp - s_lastBlockTimeStamp > i_interval; //checking if set time has passed to reveal winner
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && hasTimePassed && hasPlayers && hasBalance);
    }
    
    function performUpkeep(bytes calldata /* performData */) external override{
        (bool upkeepNeeded, ) = checkUpkeep("");
        if(!upkeepNeeded)revert Lottery__UpkeepNotNeeded(s_players.length, uint256(s_lotteryState), address(this).balance);
        s_lotteryState = LotteryState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
                            i_gasLane,
                            i_subscriptionId,
                            REQUEST_CONFIRMATIONS,
                            i_callbackGasLimit,
                            NUM_WORDS
                            );
        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWords(uint256  /*requestId*/, uint256[] memory randomWords) internal override {
        //randomWords will be an array, but we are requesting just one random no. in NUM_WORDS so we will use the first index 
        //this can be pretty big so we will mod of current players arrays length to get a valid player index
        uint256 winnerIndex = randomWords[0] % s_players.length;
        address payable winnerAddress = s_players[winnerIndex]; 
        s_lotteryState = LotteryState.OPEN;
        s_players = new address payable[](0);
        s_lastBlockTimeStamp = block.timestamp;
        s_recentWinner = winnerAddress;
        (bool success,) = winnerAddress.call{value : address(this).balance}("");//sending all balance in this contract to this address
        if(!success)revert Lottery__LotterWinningTransferFailed();
        emit WinnerPicked(winnerAddress);
    }


    /*
    * @dev These are various getter functions.
    */
    function getPlayer(uint256 index) public view returns(address payable){
        return s_players[index];
    }

    function getRecentWinner() public view returns(address){
        return s_recentWinner;
    }

    function getLotteryState() public view returns(LotteryState){
        return s_lotteryState;
    }

    function getNumOfPlayers() public view returns(uint256){
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns(uint256){
        return s_lastBlockTimeStamp;
    }

    function getRequestConfirmations() public view returns(uint256){
        return REQUEST_CONFIRMATIONS;
    }

    function getNumWords() public pure returns (uint256) {// here it's pure inste 
        return NUM_WORDS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }
}
