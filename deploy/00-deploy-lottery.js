const {network, ethers} = require('hardhat');
const { developmentChains } = require('../hardhat-helper.config');


const BASE_FEE = ethers.utils.parseEther("0.25");//from docs
const GAS_PRICE_LINK =  1e9; 

module.exports = async({getNamedAccounts, deployments}) =>{
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
 
    if(developmentChains.includes(network.name)){
        await deploy("VRFCoordinatorV2Mock",{
            from : deployer,
            args : [BASE_FEE,GAS_PRICE_LINK],
            log : true,
            waitConfirmations : network.config.blockConfirmations
        })
    }

}

module.exports.tags = ["all", "mocks"]