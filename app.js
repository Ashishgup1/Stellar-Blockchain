const express = require('express')
const app = express()

var users = {};
app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index', {
        ip: ""
    })
})

// app.get("/:ip", (req,res) =>{
//       console.log(req.params.ip);
//       for(var i=0;i<ips.length;i++)
//       {
//         if(ips[i] == req.params.ip)
//         {
//           console.log(req.params.ip);
//           res.render("index", {ip:req.params.ip});
//           break;
//         }
//       }
// });

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function ValidateIPaddress(ipaddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
        return (true)
    }
    //alert("You have entered an invalid IP address!")  
    return (false)
}

server = app.listen(3000)

const io = require("socket.io")(server)

io.sockets.on('connection', (socket) => {

    console.log('New user connected')

    socket.username = "Anonymous"

    socket.on('change_username', (data) => {
        socket.username = data.username
        console.log(socket.username);
        users[socket.username] = socket;
    })
    users[socket.username] = socket;
    // console.log(users);
    socket.on('new_message', (data) => {
        var msg = data.message.trim();
        if (msg.substr(0, 3) == "/w ") {
            msg = msg.substr(3);
            var ind = msg.indexOf(" ");
            if (ind !== -1) {
                var name = msg.substr(0, ind);
                var msg = msg.substr(ind + 1);
                if (name in users) {
                    console.log(data.name);
                    users[name].emit("new_message", {
                        message: msg,
                        username: socket.username
                    })
                    users[data.name].emit("new_message", {
                        message: msg,
                        username: socket.username
                    })
                    console.log("Whisper");
                } 
                else 
                {
                    console.log("User not found");
                }
            } else {
                console.log("Fail");
            }
        } else {
            io.sockets.emit('new_message', {
                message: data.message,
                username: socket.username
            });
        }

        // if(ValidateIPaddress(data.message))
        // {
        //       // io.sockets.emit('new_message', {message : "Chat room for" + socket.username + " on requested IP has been created.", username : "Liveweaver"});

        // }
        // else
        // {
        //       io.sockets.emit('new_message', {message : data.message, username : socket.username});
        // }
        // if(isNumeric(data.message))
        // {
        //     if(data.message<100)
        //       io.sockets.emit('new_message', {message : "Token amount too low", username : "Liveweaver"});

        //     if(data.message>=100)
        //       io.sockets.emit('new_message', {message : "Sufficient Tokens", username : "Liveweaver"});
        // }

    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {
            username: socket.username
        })
    })
})
