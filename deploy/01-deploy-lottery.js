const {network, ethers} = require('hardhat');
const { developmentChains, networkConfig } = require('../hardhat-helper.config');
const {verify} = require('../utils/verify');

const VRF_SUB_FUND_AMOUNT = "1000000000000000000000"

module.exports = async({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    let vrfCoordinatorV2Address, subscriptionId;
    let chainId = network.config.chainId;
    if(developmentChains.includes(network.name))
    {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

        //we need a subscriptionId by creating a subscription and paying some link to it on the website,
        //but we can do that, get that id and use it on our testnet but what to do on our local network.
        //Simple, we will just do what happens under the hood in the website, i.e call the 
        //createSubscription and fund function. 
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.events[0].args.subId; //createSubscription function emits a event with the subscriptionId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
    }
    else{
        vrfCoordinatorV2Address = networkConfig[network.config.chainId]["vrfCoordinatorV2"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }

    const entranceFee = networkConfig[chainId]["entranceFee"];
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    const gasLane = networkConfig[chainId]["gasLane"];
    const interval = networkConfig[chainId]["interval"];

    const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId,  callbackGasLimit,interval];
    const lotteryDeploy = await deploy("Lottery",{
        from : deployer,
        args : args,//these will go into the constructor at the time of deployment
        waitConfirmations : network.config.blockConfirmations,
        log : true,
    })

    console.log("Verifying the contract now on etherscan...");

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("True...")
        await verify(lotteryDeploy.address, args);
    }
    log("------------------------------------------------------------")
}


module.exports.tags = ["all","lottery"]