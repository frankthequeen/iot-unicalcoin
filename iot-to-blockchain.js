var Web3 = global.get('web3');

/* set ADDRESS:PORT connection to your Ethereum network */
var web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://ADDRESS:PORT'));

/* set ABI json content of your Smart Contract */
var abi = [ABI];

/* set 0xADDRESS of Owner, of Smart Contract */
const addressOwner = '0xADDRESS';
var contractAddress = '0xADDRESS';

/* set PRIVATEKEY of this IoT device's Address */
const privateKey = 'PRIVATEKEY';

const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
var contract = new web3.eth.Contract(abi, contractAddress);

/*
FUNCTION ON TRIGGER
- checks if rolling the dice resulted in an even number
- then executes Smart Constract's redistribute function
- then sends to the Redistribute.returnValues._winner address (one of the LEDs) a transaction to turn on it
*/
var mod = msg.payload % 2;

node.send({ payload: mod });

contract.methods.redistribute(mod)
.send({
	from: web3.eth.defaultAccount,
	gas: '2000000',
})
.then(function (receipt) {

	console.log(receipt);

	var winner = receipt.events.Redistribute.returnValues._winner;
	node.send({ payload: receipt.events.Redistribute.returnValues._winner });

	web3.eth.sendTransaction({
		from: web3.eth.defaultAccount,
		gas: '2000000',
		to: winner,
		value: '1000000000000000000'
	})
	.then(function (receipt) {
		console.log(receipt);
	});

});
