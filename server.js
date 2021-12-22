const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const { v4: uuid4 } = require('uuid');
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug : true
})
app.use(express.static('public'));
app.use('/peerjs', peerServer);
app.get('/',(req, res) => {
    res.redirect(`/${uuid4()}`);
});


app.get('/:room', (req, res) => {
    res.render('room',{ roomId: req.params.room });
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log("Joined Room");
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);
        })
    });
}); 

server.listen(3000);