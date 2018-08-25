pragma solidity ^0.4.19;
import 'zeppelin/contracts/lifecycle/Pausable.sol';

contract TodoList is Pausable{

    mapping(address => uint) private userAddressToIndex;
    address[] private userAddresses;
    bytes[] private ipfsHashes;

    constructor() public {
        userAddresses.push(owner);
        userAddressToIndex[owner] = userAddresses.length - 1;
    }

    function hasUser(address userAddress) public view returns(bool hasIndeed)
    {
        return (userAddressToIndex[userAddress] > 0 || userAddress == userAddresses[0]);
    }

    // Add a new item
    function addTask(bytes ipfsHash) public whenNotPaused returns (bool success) {
        if(hasUser(msg.sender) == false){
            userAddresses.push(msg.sender);
            userAddressToIndex[msg.sender] = userAddresses.length - 1;
        }
        uint oldCount = ipfsHashes.length;
        ipfsHashes.push(ipfsHash);
        return oldCount<ipfsHashes.length;
    }

    function getUserCount() public view whenNotPaused returns(uint count)
    {
        return userAddresses.length;
    }


    function getTasksCount() public view whenNotPaused returns (uint count) {
        return ipfsHashes.length;
    }

    function getTaskByIndex(uint index) public view whenNotPaused returns (bytes ipfsHash){
        return ipfsHashes[index];
    }

    function getUserAddressByIndex(uint index) public view whenNotPaused returns(address userAddress) {
        require(index < userAddresses.length);

        return(userAddresses[index]);
    }

    function deleteTodoItemByIndex(uint index) public whenNotPaused returns(bool result) {
        if (index >= ipfsHashes.length) return;

        for (uint i = index; i<ipfsHashes.length-1; i++){
            ipfsHashes[i] = ipfsHashes[i+1];
        }
        ipfsHashes.length--;

        return(true);
    }

}

