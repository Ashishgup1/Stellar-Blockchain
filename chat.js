$(function(){

	var message = $("#message")
	var username = $("#username")
	var send_message = $("#send_message")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")
	var hiddenInput = $("#address")
	var ip = hiddenInput.attr("value")

	var socket = io.connect("http://192.168.137.31:3000");

	function ValidateIPaddress(ipaddress) {  
	  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
	    return (true)  
	  }   
	  return (false)  
	}  

	message.keypress(function(event){
		console.log(event);
		if(event.which == 13)
		{
			var possibleIp = message.val();
			socket.emit('new_message', {message : message.val(), ip: ip, name:username.val()})
		}
	})

	send_message.on("click", function(){
		var possibleIp = message.val();
		socket.emit('new_message', {message : message.val(), ip: ip, name:username.val()})
	})

	socket.on("new_message", (data) => {

		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
	})

	send_username.click(function(){
		socket.emit('change_username', {username : username.val()})
	})

	message.bind("keypress", () => {
		socket.emit('typing')
	})

	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})

	socket.on('disconnect', (data) => {
	 	socket.emit('disconnect', {name: username.val()})
  	});

});
