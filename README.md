# Todo list on ETH and IPFS

This project is simple Todo List. Users are able to add a new todo item, change its status and delete an item.
It demonstrates how to interact with Eth smart contract by adding and deleting the data into Eth blockchain. It also demontrates how to use ipfs to store data and its javascript library. The ETH smart contract stores the ipfs hashes of all todo items. the data fo todo items are in JSON format and are stored on IPFS.

How to run:<br/>
1: download the source code<br/>
2: in the source code directory， run following commands<br/>
	(1)npm install<br/>
	(2)truflle compile<br/>
	(3)truffle migrate(please make sure Ganache is running and is using port 8545 as required)<br/>
	(4)npm run dev<br/>
	the server should listen port 8080. If 8080 is not avaliable, it should use the next avaliable port which is 8081.<br/>
3: improt a private key from Ganache into the Matemask and choose this account as current account in Matemask<br/>
4: in broswer, use http://localhost:8080 to access the userinface<br/>
On top of the page, it shows the address of current account. You can add new todo item by clicking the add button. Metamask will ask your permission to sign the transcation. Once it finishes the transcation, the ipfs hask will be stored in the smart contract and the JSON object will be stored on IPFS.
	
