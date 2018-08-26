pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/TodoList.sol";


contract TestTodoList {
    TodoList todo = TodoList(DeployedAddresses.TodoList());

    function testUserCanAddTodoItem() public {
        address add = msg.sender;
        bytes memory fakeIPFSHash = new bytes(4);
        uint8 i;
        for(i=0 ; i<4 ; i++){
            fakeIPFSHash[i] = "a";
        }
        bool result = todo.addTask(fakeIPFSHash);
        Assert.equal(result, true, "expect true");
    }
    function testGetTaskByIndex() public {
        bytes memory storedIpfsHash = todo.getTaskByIndex(0);
        bytes memory fakeIPFSHash = new bytes(4);

        for(uint i=0 ; i<4 ; i++){
            fakeIPFSHash[i] = "a";
        }
        bool result = true;
        if (fakeIPFSHash.length != storedIpfsHash.length)
            result = false;
        for (uint n = 0; n < fakeIPFSHash.length; n ++)
            if (fakeIPFSHash[n] != storedIpfsHash[n])
                result = false;

        Assert.equal(result, true, "expect true");

    }

    function testUserCount() public {
        bool expected = true;
        uint256 count = todo.getUserCount();
//        should have 2 user. 1 owner and a new user from above method

        bool bResult = (count>0);
        Assert.equal(bResult, expected, "expect 1 user");
    }

    function testDeleteTask() public {
        bool result = todo.deleteTaskByIndex(0);
        uint count = todo.getTasksCount();
        uint expected = 0;
        Assert.equal(count, expected, "expect 0 task");

    }

    function testHasUser() public {
        address ownerAdd = todo.owner();
        bool result = todo.hasUser(ownerAdd);
        Assert.equal(result, true, "expect has owner");
    }




}
