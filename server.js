// Import the express module, which is a web application framework for Node.js
const express = require("express");
// Import the path module, which provides utilities for working with file and directory paths
const path = require("path");

// Create an instance of an express application
var app = express();

// Make the express application listen for requests on port 3000 and log a message to the console when it starts listening
var server = app.listen(3000, function () {
  console.log("Listening on port 3000");
});


// Import the socket.io module and initialize it with the server instance and an options object
// The options object has a property allowEIO3 set to true, which allows the use of Engine.IO protocol version 3
const io = require("socket.io")(server, {
  allowEIO3: true, // false by default
});

// Use the express.static middleware to serve static files
// Here it's configured to serve files from the directory where the script is running
app.use(express.static(path.join(__dirname, "")));


//All user connections of all the meeting_ids are stored in this array
var userConnections = [];


// Listen for the "connection" event on the io object
// This event is emitted when a client connects to the server
io.on('connection', function (socket) {
  // Log a message to the console when a client connects
  console.log("Socket id is "+ socket.id);
  socket.on('userconnect', function (data) {
    console.log("User Connected", data.displayName, data.meetingid);

    //Other users in the same meeting 
    other_users = userConnections.filter(p => p.meeting_id == data.meetingid);
    console.log('Other Users: ',other_users);

    userConnections.push({
      socket_id: socket.id,
      user_id: data.displayName,
      meeting_id: data.meetingid
    });

    console.log('UserConnections: ',userConnections);

    other_users.forEach(user => {
      socket.to(user.socket_id).emit('inform_others_about_me', {
        other_users_id: data.displayName,
        connId: socket.id
      });
    });


    socket.emit('inform_others_about_me', other_users);


    socket.on('SDPProcess', function (data) {
      console.log("SDP Process", data.message, data.to_connid);
      socket.to(data.to_connid).emit('SDPProcess', {
        message: data.message,
        from_connid: socket.id
      });
    });

  });

});