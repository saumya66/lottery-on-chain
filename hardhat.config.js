require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork : "hardhat",
  networks :{
    rinkeby : {
      url : RINKEBY_RPC_URL,
      chainId : 4, 
      accounts : [PRIVATE_KEY],
      blockConfirmations : 2,
    }
  }
};
