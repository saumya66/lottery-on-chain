//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract FundPool{
    mapping(address => uint256) public fundersTofunded;
    address[] public funders;
    address owner;

    constructor(){
        owner = msg.sender;
    }

    function fund() public payable{
        fundersTofunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    
}