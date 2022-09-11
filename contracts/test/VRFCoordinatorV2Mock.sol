//SPDX-License-Identifier:MIT

pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

//Here we have added the mock VRF contract from chainlink so that we can deploy this contract
//on our local network for our Lottery contract to use it in our local hardhat environment