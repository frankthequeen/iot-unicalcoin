var Web3 = global.get('web3');
var fulfilled_array = [];

/* set ADDRESS:PORT connection to your Ethereum network */
var web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://ADDRESS:PORT'));

/* set ABI json content of your Smart Contract */
var abi = [ABI];

/* set 0xADDRESS of Owner, of Smart Contract, of this IoT device */
const addressOwner = '0xADDRESS';
var contractAddress = '0xADDRESS';
const myAddress = \"0xADDRESS\"; 

/* set PRIVATEKEY of this IoT device's Address */
const privateKey = 'PRIVATEKEY';

const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
var contract = new web3.eth.Contract(abi, contractAddress);

/*
FUNCTION
- monitors the transaction log
- adds to fulfilled_array a transaction when myAddress is the recipient
- sends a msg to the next node (LED) when myAddress is the recipient and addressOwner is the sender
*/
var subscription = web3.eth.subscribe('pendingTransactions', function (error, result) {
    if (!error)
        console.log(result);
})
.on('data', function (transaction) {

	web3.eth.getTransaction(transaction)
	.then(function (fulfilled) {

		if (fulfilled.to == myAddress) {
			if (fulfilled.from == addressOwner) {
				var temp = fulfilled.value;
				var msg2 = { payload: 1 };
				var value = temp / 100000000000000;
				msg.delay = value;
				node.send([[msg2], [msg]]);
			}
			else {
				fulfilled_array.push(fulfilled);
			}
		}
		
	})
	.catch(function (error) {
		console.log(error.message);
	}); 
	
});

/*
FUNCTION
- executes Smart Constract's getBet function
- then sends the receipt to the next node
*/
function Pay(fulfilled) {

	web3.eth.getTransactionCount(myAddress)
	.then(function (n) {
		
		contract.methods.getBet(fulfilled.from, myAddress)
		.send({
			from: web3.eth.defaultAccount,
			gas: '3000000',
			gasprice: web3.eth.gasPrice,
			value: fulfilled.value,
			nonce: n
		})
		.then(function (receipt) {
			
			console.log(receipt);
			node.send({ payload: receipt });
			
		})
		.catch(function (error) {
			console.log(error.message);
		});
		
	})
	
};

/*
CRON
- checks periodically fulfilled_array
- when not void executes Pay function
*/
setInterval(function () {
	if (fulfilled_array.length !== 0) {
		Pay(fulfilled_array.shift())
	}
}, 120000);
