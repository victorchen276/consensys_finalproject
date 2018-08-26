pragma solidity ^0.4.19;
import 'zeppelin/contracts/lifecycle/Pausable.sol';

/** @title TodoList . */
contract TodoList is Pausable{

    mapping(address => uint) private userAddressToIndex;
    address[] private userAddresses;
    bytes[] private ipfsHashes;


    constructor() public {
        userAddresses.push(owner);
        userAddressToIndex[owner] = userAddresses.length - 1;
    }

    /** @dev check if the given user address has been store or a new user
      * @param userAddress input ETH address.
      * @return hasIndeed true when user address has already stored.
      */
    function hasUser(address userAddress) public view returns(bool hasIndeed)
    {
        return (userAddressToIndex[userAddress] > 0 || userAddress == userAddresses[0]);
    }

    /** @dev create a new task
      * @param ipfsHash ipfs hash of new task
      * @return success true when the ipfs hash is store in the contract
      */
    function addTask(bytes ipfsHash) public whenNotPaused returns (bool success) {
        if(hasUser(msg.sender) == false){
            userAddresses.push(msg.sender);
            userAddressToIndex[msg.sender] = userAddresses.length - 1;
        }
        uint oldCount = ipfsHashes.length;
        ipfsHashes.push(ipfsHash);
        return oldCount<ipfsHashes.length;
    }

    /** @dev get total number of users
      * @return count return the count of userAddresses array
      */
    function getUserCount() public view whenNotPaused returns(uint count)
    {
        return userAddresses.length;
    }

    /** @dev get total number of tasks
      * @return count  the length of ipfsHashes array
      */
    function getTasksCount() public view whenNotPaused returns (uint count) {
        return ipfsHashes.length;
    }

    /** @dev get total number of tasks
     * @param index the index of task
     * @return count return the length of ipfsHashes array
     */
    function getTaskByIndex(uint index) public view whenNotPaused returns (bytes ipfsHash){
        require(index > 0);
        require(index < ipfsHashes.length);
        return ipfsHashes[index];
    }

    /** @dev get a stored user adress
     * @param index the index of address
     * @return count  the count of ipfsHashes array
     */
    function getUserAddressByIndex(uint index) public view whenNotPaused returns(address userAddress) {
        require(index > 0);
        require(index < userAddresses.length);
        return(userAddresses[index]);
    }

    /** @dev delete a task
     * @param index the index of task
     * @return result true if the the task is deleted
     */
    function deleteTaskByIndex(uint index) public onlyOwner whenNotPaused returns(bool result) {
        require(index > 0);
        require(index < ipfsHashes.length);

        for (uint i = index; i<ipfsHashes.length-1; i++){
            ipfsHashes[i] = ipfsHashes[i+1];
        }
        ipfsHashes.length--;

        return(true);
    }

}

