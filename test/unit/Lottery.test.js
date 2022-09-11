const { assert, expect } = require('chai');
const {network, getNamedAccounts, deployments, ethers} = require('hardhat');
const { developmentChains, networkConfig } = require('../../hardhat-helper.config')
 

if(!developmentChains.includes(network.name))
    describe.skip
else {
    describe("Lottery", async function(){
        let lottery, vrfCoordinatorV2Mock;
        const chainId = network.config.chainId;
        const lotteryEntranceFee = etwork.config.entranceFee;
        beforeEach(async function(){
            const {deployer} = await getNamedAccounts();
            await deployments.fixture(['all'])//run all contracts deployments codes with tag = 'all'
            lottery = await ethers.getContract('Lottery', deployer);
            vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', deployer);
        })
        
        describe("contract", async function(){
            it("Lottery Constructor initialized perfectly!", async function(){
                const lotteryState = await lottery.getLotteryState();
                const interval = await lottery.getInterval();
                assert.equal(lotteryState.toString(),"0");
                assert.equal(interval.toString(), networkConfig[chainId]["interval"])
            })
            
        })

        describe("enterLottery", async function(){
            it("Can't enter lottery without paying enough!", async function(){
                await expect(lottery.enterLottery()).to.be.revertedWith("Lottery__NotEnoughETH"); //expecting this error, if so then our test passes.
            })
            // it("Storing players successfully!", async function(){
            //     await lottery.enterLottery({value:lotteryEntranceFee});
            //     const firstPlayer = await lottery.getPlayer(0);
            //     assert.equal(firstPlayer,deployer);
            // })
        })
    })
}