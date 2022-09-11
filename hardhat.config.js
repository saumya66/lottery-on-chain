// require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks:{
    hardhat: {
      chainId : 31337,
      blockConfirmations : 1,
    },
    rinkeby:{                         //staging tests will run on rinkeby 
      url : RINKEBY_RPC_URL,
      account : [PRIVATE_KEY],
      chainId : 4,
      blockConfirmations : 3
    },
    goerli:{
      url: "https://goerli.infura.io/v3/",
      account : [PRIVATE_KEY],
      chainId : 5,
      blockConfirmations : 3,
    }
  },
  namedAccounts : {
    deployer :{
      default : 0
    },
    player : {
      default : 1
    }
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
  },
  etherscan: {
      apiKey: ETHERSCAN_API_KEY,
  },
};
