// Initial requirements
let Stellar        = require('stellar-sdk'); // Stellar JS library
let request        = require('request-promise'); // Request library
let stellarUtility = require("./stellarUtilities.js"); // File containing Stellar utility functions for managing API

//Server Side code for elastic search

var elasticsearch = require('elasticsearch');

let anoncnt = 1;

var client = new elasticsearch.Client({
	host: '10.4.100.238:9200',
	log: 'trace'
});

async function getPossibleUserNames(keyword) { //Used to query database for keyword and return a list of possible usernames

	var ans = await client.search({
		index: 'user_data',
		q: 'Keywords:' + keyword
	});

	let searchResults = "";
	for(var i = 0; i< ans.hits.hits.length; i++)
	{
		searchResults += ans.hits.hits[i]._source['username'] + '\n';
	}

	return searchResults;
}

async function pushToElasticSearch(fileData) { //Used to push a user data to elastic search

	let count = {};

	try
	{
		count = await client.count({
		index: 'user_data'
		});
	}
	
	catch(err)
	{
		console.log(err);
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
			console.log('Error boi');
		} else {
			console.log('All is well boi');
		}
	});
}

let pairIssuer  = Stellar.Keypair.random();

let ZFCasset = new Stellar.Asset('ZFC', "GCFGNW3ISQSECA5EM3AHRKBBXBR33O5CS5YMR3WRAI42K4BQDR7YEHK3");
//Server Side code for Chat Engine

const alert = require ('alert-node')

const express = require('express')
const app = express()

var users = {};
var timer = {};
var buyer = {};
var sender = {};
var checkflag = {};
var inprocess = {};
var publickey = {};
var secretkey = {};

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
	console.log(key);

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
						console.log("Whisper");
					} 
					else 
					{
						console.log(data.name);
						users[data.name].emit("new_message", {
							message: "Wrong username",
							username: "Liveweaver"
						})
						alert("Error", "Wrong username entered");
						console.log("User not found");
					}
				} 
				else 
				{
					console.log("Fail");
				}
			} 
			else if(msg.substr(0, 4)=="add ")
			{
				var keywords=msg.substr(4);

				let fileData = {
					username : socket.username,
					Keywords : keywords
				};

				await pushToElasticSearch(fileData);

				io.sockets.emit('new_message', {
					message: data.message,
					username: socket.username
				});
			}
			else if(msg.substr(0, 9)=="retrieve ")
			{
				var keywords=msg.substr(9);

				var usernames= await getPossibleUserNames(keywords);

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
				users[name].emit('new_message', {
					message: socket.username+" wants to send you " + amount +" ZFC in exchange of the data, do you want to proceed with the transaction? (Press Y/N)",
					username: "Liveweaver"
				});
				sender[socket.username]=name;
				buyer[name]=socket.username;
				timer[socket.username]=Date.now();
			}
			else if(msg=="Y"||msg=="N")
			{
				if(socket.username in buyer)
				{
					if(Date.now()-timer[buyer[socket.username]]<=60000)
					{
						if(msg=="Y")
						{
							users[socket.username].emit('new_message', 
							{
								message: "Transaction has been accepted. Enter your public and secret key separated by a space.",
								username: "Liveweaver"
							});
							users[buyer[socket.username]].emit('new_message', 
							{
								message: socket.username+" has accepted the transaction. Enter your public and secret key separated by a space.",
								username: "Liveweaver"
							});
							checkflag[buyer[socket.username]]=1;
							checkflag[socket.username]=1;
							inprocess[buyer[socket.username]]=socket.username;
						}		
						else
						{
							users[socket.username].emit('new_message', 
							{
								message: "Transaction has been denied",
								username: "Liveweaver"
							});
							users[buyer[socket.username]].emit('new_message', 
							{
								message: socket.username+" has denied the transaction",
								username: "Liveweaver"
							});
							delete sender[buyer[socket.username]];
							delete buyer[socket.username];
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
			console.log("Reached here");
			var message=msg.split(" ");
			var pub=message[0];
			var sec=message[1];
			publickey[socket.username]=pub;
			secretkey[socket.username]=sec;
			
			checkflag[socket.username]=0;
		}

		for(var key in inprocess)
		{
			if(inprocess.hasOwnProperty(key))
			{
				if(key in publickey && inprocess[key] in publickey)
				{
					console.log(secretkey[key]);
					console.log(secretkey[inprocess[key]]);

					var seller=await Stellar.Keypair.fromSecret(secretkey[key]);

					console.log(seller.publicKey());

					var buyer1=await Stellar.Keypair.fromSecret(secretkey[inprocess[key]]);

					console.log(buyer1.publicKey());

					var escrow=await Stellar.Keypair.fromSecret("SD43FQLUGBQT5ZOLGR2IZQ6V5PB2ME4DYBWKVUNGP7NM6OWPOZ4D2QLY");

					console.log(escrow.publicKey());

					stellarUtility.transact(seller, escrow, buyer1, ZFCasset, "100", "10000");

					// users[socket.username].emit('new_message', 
					// {
					// 	message: seller.publicKey() + " & " + Stellar.Keypair.fromSecret(seller.secret()).publicKey(),
					// 	username: "Liveweaver"
					// });

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
