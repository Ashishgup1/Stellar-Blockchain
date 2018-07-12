// Initial requirements
let Stellar				= require('stellar-sdk'); // Stellar JS library
let request				= require('request-promise'); // Request library
let stellarUtility 		= require("./stellarUtilities.js"); // File containing Stellar utility functions for managing API
let Set					= require("collections/set"); 
let Engine 			 	= require('./engine.js');
let Buyer				= require('./Buyer.js');
let Seller				= require('./Seller.js');
let base58 				= require('bs58');
let bodyParser 			= require('body-parser');
let mysql 				= require ('mysql');
let	fs 					= require('fs');

function addSave(console){

console.save = function(data){
		msg = data + "\n";
		fs.appendFile("./log.txt", msg, function(){
			console.log(data);
		})
	}
}

addSave(console);

//Pricing Engine code
let historyList = new Array();

for(let i=0;i<10;i++)
{
	tempList = new Array();
	for(let j=0;j<300;j++)
	{
		tempList.push(300);
	}
	historyList.push(tempList);
}

let gparamList = new Array();

for(let i=0;i<200;i++)
{
	gparamList.push(i%10);
}

function PriceEngine(needbuyer, needseller, gParam) //Returns the optimal price for 
{

	var needb=parseFloat(needbuyer);
	var needs=parseFloat(needseller);

	//Need, Unique, ownerValue, Demand, Richness, Applicability, repeatedPurchase, gparam
	let q = 0.97
	let nHist = 200

	let buyer = new Buyer(historyList, nHist, q, gparamList, needb, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, gParam),	
		seller = new Seller(historyList, nHist, q, gparamList, needs, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, gParam);
	
	return Engine.transact_price(buyer, seller, historyList, gparamList).toFixed(2);
}

function saveRecord(priceSold, gparam, historyList, gparamList)
{
	if(priceSold != 0)
	{
		historyList[gparam].push(priceSold);
		gparamList.push(gparam);
	}
}

//Server Side code for elastic search

let sellerNeed = {};

var elasticsearch = require('elasticsearch');

let anoncnt = 1;

var client = new elasticsearch.Client({
	host: '10.4.100.238:9200',
	log: 'trace'
});

//Used to query database for keyword and return a list of possible usernames
async function getPossibleUserNames(keyword, needbuyer) { 

	var ans = await client.search({
		index: 'user_data',
		q: 'Keywords:' + keyword
	});

	var matches = new Set();

	let searchResults = "";
	for(var i = 0; i< ans.hits.hits.length; i++)
	{
		matches.add(ans.hits.hits[i]._source['username']);
	}

	var users = matches.toArray();
	console.log(users);
	console.log("****");
	for(var i=0;i<users.length;i++)
	{
		var name = users[i];

		if(sellerNeed[name] !== undefined && sellerNeed[name][keyword] !== undefined)
		{
			var needseller = sellerNeed[name][keyword];
			searchResults+= users[i] + ': ' +	PriceEngine(needbuyer, needseller, keytonum[keyword]) + ' ';
		}
	}

	return searchResults;
}

//Used to push a user data to elastic search
async function pushToElasticSearch(fileData) { 

	let count = {};

	try
	{
		count = await client.count({
		index: 'user_data'
		});
	}
	
	catch(err)
	{
		console.save(err);
		count.count = 0;
	}

	var obj = {
		index: 'user_data',
		type: 'user',
		id: count.count + 1
	};

	obj.body = fileData;
	client.create(obj, function(error) {
		if (error) {
			console.save('Error boi');
		} else {
			console.save('All is well boi');
		}
	});
}

let pairIssuer = Stellar.Keypair.fromSecret("SBB76ASGMOEU7M2RIE2DXWUNCYNPQDVJQNBEPLZHOO5NXPEWWGGFSFCJ");

let ZFCasset = new Stellar.Asset('ZFC', pairIssuer.publicKey());

//Code for encoding and decoding IPFS Hash

getBytes32FromIpfsHash = (ipfsListing) => { //Encode
	console.save(base58.decode(ipfsListing).slice(2).toString('hex'));
	return base58.decode(ipfsListing).slice(2).toString('hex');
}

getIpfsHashFromBytes32 = (bytes32Hex) => { //Decode 
	const hashHex = "1220" + bytes32Hex
	const hashBytes = Buffer.from(hashHex, 'hex');
	const hashStr = base58.encode(hashBytes)
	console.save(hashStr);
	return hashStr;
}

//Server Side code for Chat Engine

const alert = require ('alert-node')

const express = require('express')
const app = express()

var keys=0;
var users = {};
var timer = {};
var data_Acceptor = {};
var money_Acceptor = {};
var amnt = {};
var checkflag = {};
var inprocess = {};
var publickey = {};
var secretkey = {};
var filehash = {};
var keytonum = {};

users["Anonymous"]=null

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('index', {
		ip: ""
	})
})

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function ValidateIPaddress(ipaddress) {
	if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
		return (true)
	}
	return (false)
}

for(var key in inprocess)
	console.save(key);

server = app.listen(3000)

const io = require("socket.io")(server)

io.sockets.on('connection', (socket) => {

	socket.username = "Anonymous" + anoncnt;

	anoncnt++;

	socket.broadcast.emit('new_message', {
		message: socket.username + " has joined the chat",
		username: "Liveweaver"
	});

	socket.on('change_username', (data) => {
		if(data.username in users)
		{
			users[socket.username].emit("new_message", {
				message: "Username already taken",
				username: "Liveweaver"
			})
		}
		else
		{
			io.sockets.emit('new_message', {
				message: socket.username + " has changed his username to " + data.username,
				username: "Liveweaver"
			});

			delete users[socket.username];

			socket.username = data.username
			users[socket.username] = socket;
		}
	})

	users[socket.username] = socket;

	socket.on('new_message', async (data) => {

		var msg = data.message.trim();
		if(checkflag[socket.username]!=1)
		{
			if(msg.substr(0, 3) == "/w ") {
				msg = msg.substr(3);
				var ind = msg.indexOf(" ");
				if (ind !== -1) {
					var name = msg.substr(0, ind);
					var msg = msg.substr(ind + 1);
					if (name in users) {
						users[name].emit("new_message", {
							message: msg,
							username: socket.username + " whispered to you"// + name
						})
						users[data.name].emit("new_message", {
							message: msg,
							username: "You whispered to " + name
						})
						console.save("Whisper");
					} 
					else 
					{
						console.save(data.name);
						users[data.name].emit("new_message", {
							message: "Wrong username",
							username: "Liveweaver"
						})
						alert("Error", "Wrong username entered");
						console.save("User not found");
					}
				} 
				else 
				{
					console.save("Fail");
				}
			} 
			else if(msg.substr(0, 4)=="add ")
			{

				var message = msg.split(" ");

				var need = message[1];

				for(var i=2;i<message.length;i++)
				{
					var keyword = message[i];
					var pair1= Pair([socket.username, keyword]);
					var name = socket.username;
					sellerNeed[name] = {};
					sellerNeed[name][keyword] = need;
					if(keyword in keytonum)
						continue;
					keytonum[keyword]=keys++;
					keys%=11;	
				}

				let fileData = {
					username : socket.username,
					Keywords : keyword
				};

				await pushToElasticSearch(fileData);

				io.sockets.emit('new_message', {
					message: data.message,
					username: socket.username
				});
			}
			else if(msg.substr(0, 9)=="retrieve ")
			{
				var message = msg.split(" ");
				
				var need = message[1];

				var keyword = message[2];

				var usernames= await getPossibleUserNames(keyword, need);

				users[socket.username].emit('new_message', {
					message: "These usernames have the required information:\n" + usernames,
					username: "Liveweaver"
				});

			}
			else if(msg.substr(0,5)=="send ")
			{
				var user=msg.split(" ");
				var name=user[1];
				var amount=user[2];
				if(!(name in users))
				{
					users[socket.username].emit('new_message', {
					message: "Wrong username entered. Please try again.",
					username: "Liveweaver"
					});
				}
				else
				{
					users[name].emit('new_message', {
					message: socket.username+" is willing to send you " + amount +" ZFC in exchange of the data. Type \"Yes\" to accept, \"No\" to reject and \"Neg\" to negotiate",
					username: "Liveweaver"
					});
					money_Acceptor[socket.username]=name;
					data_Acceptor[name]=socket.username;
					amnt[socket.username]=amount;
					timer[socket.username]=Date.now();
				}
			}
			else if(msg=="Yes"||msg=="No"||msg.substr(0,3)=="Neg")
			{
				if(socket.username in data_Acceptor || socket.username in money_Acceptor)
				{
					var data_seller, data_acceptor;
					if(socket.username in data_Acceptor)
					{
						data_seller=socket.username;
						data_acceptor=data_Acceptor[data_seller];
					}
					else
					{
						data_acceptor=socket.username;
						data_seller=money_Acceptor[data_acceptor];
					}
					if(Date.now()-timer[data_acceptor]<=120000)
					{
						if(msg=="Yes")
						{
							users[data_seller].emit('new_message', 
							{
								message: "Transaction has been accepted. Enter your public, secret key and Hash of the file separated by one space each.",
								username: "Liveweaver"
							});
							users[data_acceptor].emit('new_message', 
							{
								message: "Transaction has been accepted. Enter your public and secret key separated by a space.",
								username: "Liveweaver"
							});
							checkflag[data_acceptor]=1;
							checkflag[data_seller]=1;
							inprocess[data_acceptor]=data_seller;
						}		
						else if(msg=="No")
						{
							users[data_acceptor].emit('new_message', 
							{
								message: "Transaction has been denied",
								username: "Liveweaver"
							});
							users[data_seller].emit('new_message', 
							{
								message: "Transaction has been denied",
								username: "Liveweaver"
							});
							delete money_Acceptor[data_acceptor];
							delete data_Acceptor[data_seller];
							delete timer[data_acceptor];
							delete amnt[data_acceptor];
							delete inprocess[data_acceptor];
						}	
						else
						{
							var message=msg.split(" ");
							var amount=message[1];
							amnt[data_acceptor]=amount;
							if(socket.username == data_seller)
							{
								users[data_acceptor].emit('new_message', 
								{
									message: data_seller + " is willing to sell his data at " + amount + "ZFCs. Type \"Yes\" to accept, \"No\" to reject and \"Neg\" to negotiate",
									username: "Liveweaver"
								});
							}
							else
							{
								users[data_seller].emit('new_message', 
								{
									message: data_acceptor + " is willing to send you " + amount + "ZFCs in exchange of the data. Type \"Yes\" to accept, \"No\" to reject and \"Neg\" to negotiate",
									username: "Liveweaver"
								});
							}
						}
					}
					else
					{
						users[socket.username].emit('new_message', 
						{
							message: "No valid transaction exists",
							username: "Liveweaver"
						});
					}
				}
				else
				{
					users[socket.username].emit('new_message', 
					{
						message: "No valid transaction exists",
						username: "Liveweaver"
					});
				}
			}
			else if(msg == "Create account")
			{
				console.save("Creation");
				let newKeyPair = Stellar.Keypair.random();
				await stellarUtility.createAndFundAccount(newKeyPair);
   				await stellarUtility.changeTrust(newKeyPair, "10000", ZFCasset);
    			await stellarUtility.sendAsset(pairIssuer, newKeyPair, '1000', ZFCasset);
    			await stellarUtility.showBalance(newKeyPair);
   				users[socket.username].emit('new_message', 
				{
					message: "New account created. Public Key: " + newKeyPair.publicKey() + " Secret Key: " + newKeyPair.secret(),
					username: "Liveweaver"
				});
			}
			else 
			{
				io.sockets.emit('new_message', {
					message: data.message,
					username: socket.username
				});
			}
		}
		else
		{
			console.save("Reached here");
			var message=msg.split(" ");
			var pub=message[0];
			var sec=message[1];
			if(socket.username in data_Acceptor)
			{
				var hash=message[2];
				console.save(socket.username);
				console.save(hash);
				filehash[socket.username]=hash;
			}

			publickey[socket.username]=pub;
			secretkey[socket.username]=sec;
			
			checkflag[socket.username]=0;
		}

		var temp={};

		for(var key in inprocess)
		{
			if(inprocess.hasOwnProperty(key))
			{
				if(key in publickey && inprocess[key] in publickey)
				{
					users[key].emit('new_message', 
					{
						message: "Transaction has started",
						username: "Liveweaver"
					});


					users[inprocess[key]].emit('new_message', 
					{
						message: "Transaction has started",
						username: "Liveweaver"
					});

					console.save(secretkey[key]);
					console.save(secretkey[inprocess[key]]);

					var moneySender=await Stellar.Keypair.fromSecret(secretkey[key]);

					console.save(moneySender.publicKey());

					var dataSender=await Stellar.Keypair.fromSecret(secretkey[inprocess[key]]);

					console.save(dataSender.publicKey());

					var escrow=await Stellar.Keypair.fromSecret("SD3CX5QBRCHLMFRICH6WAARYO3IFE2ZQRTAWKT65FATLF253E27HQNUP");

					console.save(escrow.publicKey());

					var money = amnt[key];

					console.save(money);

					var hash=filehash[inprocess[key]];

					console.save(hash);
					console.save(typeof hash);

					var encoded = getBytes32FromIpfsHash(hash);

					console.save(typeof money);

					await stellarUtility.transact(dataSender, escrow, moneySender, ZFCasset, money, encoded, "10000");

					var decoded = getIpfsHashFromBytes32(encoded);

					users[key].emit('new_message', 
					{
						message: "The IPFS Hash of the required file is: " + decoded,
						username: "Liveweaver"
					});


					users[inprocess[key]].emit('new_message', 
					{
						message: "You have received " + money + " ZFC tokens",
						username: "Liveweaver"
					});

					var intMoney = parseInt(money);

					console.log(intMoney);

					saveRecord(money, Seller.gparam,)

					delete money_Acceptor[key];
					delete data_Acceptor[inprocess[key]];
					delete timer[key];
					delete amnt[key];
					delete publickey[key];
					delete publickey[inprocess[key]];
					delete inprocess[key];
					temp[data_Acceptor[socket.username]];
				}
			}
		}

	})

	socket.on('typing', (data) => {
		socket.broadcast.emit('typing', {
			username: socket.username
		})
	})

	socket.on('disconnect', (data) => {

		delete users[socket.username];

		io.sockets.emit('new_message', {
			message: socket.username + " has left",
			username: "Liveweaver"
		});
	})

	socket.on('disconnecting', (data) => {
		socket.emit('new_message', {
			message: "Do you really want to quit?",
			username: "Liveweaver"
		});
	})

})
