const path = require('path'); // Path module
const express = require('express') // Express web server framework
const http = require('http') // node http module
const moment = require('moment'); // to display timestamp 
const socketio = require('socket.io'); // socket.io is used to create a websocket server
const PORT = process.env.PORT || 3030; // Port number
const app = express(); // Create an express app
const server = http.createServer(app); // Create a server
const io = socketio(server); // Create a socket.io server

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public folder

//initializing the rooms array, which will contain all the rooms
let rooms = {};
let socketroom = {};
let socketname = {};

//initializing the user video and audio sockets
let micSocket = {};
let videoSocket = {};

//connecting to the socket
io.on('connect', socket => {

    //if someone joins the room, the server receives the room id and the user name
    socket.on("join room", (roomid, username) => {
        //console log if someone joins the room
        console.log(username + " joined the room " + roomid);
        console.log('------------------------------');
        socket.join(roomid);
        socketroom[socket.id] = roomid;
        socketname[socket.id] = username;
        //enabling the video and audio of the user
        micSocket[socket.id] = 'on';
        videoSocket[socket.id] = 'on';

        //print the room id and the user name in the console if the user joins the room
        if (rooms[roomid] && rooms[roomid].length > 0) {
            rooms[roomid].push(socket.id);
            socket.to(roomid).emit('message', `${username} joined the room.`, 'Notification', moment().format(
                "h:mm a"
            ));
            io.to(socket.id).emit('join room', rooms[roomid].filter(pid => pid != socket.id), socketname, micSocket, videoSocket);
        }
        else {
            rooms[roomid] = [socket.id];
            io.to(socket.id).emit('join room');
        }
        //counting the number of users in the room
        io.to(roomid).emit('user count', rooms[roomid].length);

    });

    //users action
    socket.on('action', msg => {
        if (msg == 'mute') {
            micSocket[socket.id] = 'off';
            console.log(socketname[socket.id] + ' is muted');
        }
        else if (msg == 'unmute') {
            micSocket[socket.id] = 'on';
            console.log(socketname[socket.id] + ' is unmuted');
        }
        else if (msg == 'videoon') {
            videoSocket[socket.id] = 'on';
            console.log(socketname[socket.id] + `'s video on`);
        }
        else if (msg == 'videooff') {
            videoSocket[socket.id] = 'off';
            console.log(socketname[socket.id] + `'s video off`);
        }

        socket.to(socketroom[socket.id]).emit('action', msg, socket.id);
    })

    //video offer and answer
    socket.on('video-offer', (offer, sid) => {
        socket.to(sid).emit('video-offer', offer, socket.id, socketname[socket.id], micSocket[socket.id], videoSocket[socket.id]);
    })

    socket.on('video-answer', (answer, sid) => {
        socket.to(sid).emit('video-answer', answer, socket.id);
    })

    //ice candidates
    /*represents a candidate Interactive Connectivity Establishment (ICE) configuration which 
    may be used to establish an RTCPeerConnection . An ICE candidate describes the protocols 
    and routing needed for WebRTC to be able to communicate with a remote device*/
    socket.on('new icecandidate', (candidate, sid) => {
        socket.to(sid).emit('new icecandidate', candidate, socket.id);
    })

    socket.on('message', (msg, username, roomid) => {
        //if someone send a message, the console will log the message
        io.to(roomid).emit('message', msg, username, moment().format(
            "h:mm a"
        ) 
    );
    console.log(username,':', msg);
    console.log('------------------------------');
})

    //if someone leaves the room, the server will receive it and notify the other users
    socket.on('disconnect', () => {
        if (!socketroom[socket.id]) return;
        socket.to(socketroom[socket.id]).emit('message', `${socketname[socket.id]} left the chat.`, `Notification`, moment().format(
            "h:mm a"
        ));
        socket.to(socketroom[socket.id]).emit('remove peer', socket.id);
        var index = rooms[socketroom[socket.id]].indexOf(socket.id);
        rooms[socketroom[socket.id]].splice(index, 1);
        io.to(socketroom[socket.id]).emit('user count', rooms[socketroom[socket.id]].length);
        delete socketroom[socket.id];
        //if someone disconnects, write in console log with his username
        console.log(socketname[socket.id], "disconnected from the room");
        console.log('------------------------------');

    });
})


server.listen(PORT, () => console.log(`Server is started and running on port ${PORT}`));