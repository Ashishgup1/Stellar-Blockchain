const alert = require ('alert-node')

const express = require('express')
const app = express()

var users = {};

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

server = app.listen(3000)

const io = require("socket.io")(server)

io.sockets.on('connection', (socket) => {

    console.log('New user connected')

    socket.username = "Anonymous"

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
          socket.username = data.username
          users[socket.username] = socket;
        }
    })

    users[socket.username] = socket;

    socket.on('new_message', (data) => {
        var msg = data.message.trim();
        if (msg.substr(0, 3) == "/w ") {
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
            } else {
                console.log("Fail");
            }
        } else {
            io.sockets.emit('new_message', {
                message: data.message,
                username: socket.username
            });
        }

    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {
            username: socket.username
        })
    })

    socket.on('disconnect', (data) => {
        io.sockets.emit('new_message', {
              message: socket.username + " has left",
              username: "Liveweaver"
          });
    })

})
