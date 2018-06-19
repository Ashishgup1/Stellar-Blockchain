const express = require('express')
const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

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

io.on('connection', (socket) => {
  console.log('New user connected')  

  socket.username="Anonymous"

  socket.on('change_username', (data) => {
    socket.username=data.username
  })

  socket.on('new_message', (data) => {
    io.sockets.emit('new_message', {message : data.message, username : socket.username});
    /*if(isNumeric(data.message))
    {
        if(data.message<100)
          io.sockets.emit('new_message', {message : "Token amount too low", username : "Liveweaver"});

        if(data.message>=100)
          io.sockets.emit('new_message', {message : "Sufficient Tokens", username : "Liveweaver"});
    }*/

    if(ValidateIPaddress(data.message))
    {
          io.sockets.emit('new_message', {message : "Connecting to IP " + data.message, username : "Liveweaver"});
    }
  })

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', {username: socket.username})
  })
})

