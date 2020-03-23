/*
    Created by github.com/64chill
*/

// import our libraries
const INIT_VARIABLES = require('./init_variables')
const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const gameArea = require('./gameArea');

// start our socket
io.on('connection', (client) => {
    client.emit('openRooms');
    client.on("openRoomsRequest", ()=>{
        client.emit("openRooms" , gameArea.getFreeRoomsNoList()); 
    })

    client.on('addNewRoom', (data) =>{
        gameArea.addRoom();
        io.emit("openRooms" , gameArea.getFreeRoomsNoList()); // send to all clients
      });

    client.on('joinRoom', (data)=>{
        let joined = gameArea.joinRoom(client.id, data);
        if (joined){
            io.emit("openRooms" , gameArea.getFreeRoomsNoList()); // send to all clients
            client.emit("roomJoined", {no: data, sign: joined.join_sign} ); // tells that user has joined a room and the number
            // set that user is able to play a move at the begining of the game
            if(joined.nextp !== null){
                io.to(joined.nextp).emit('nextpChange', true);
            }
            if(joined.gamefull){
                io.to(joined.p1).emit("gameIsFull");
                io.to(joined.p2).emit("gameIsFull");
            }
        }       
    });

    client.on('send_move', (data)=>{
        let move = gameArea.sendMove(data.rid, client.id, data.move);
        if(move){
            move.p1 === move.nextp?io.to(move.p1).emit('nextpChange', true):io.to(move.p1).emit('nextpChange', false)
            move.p2 === move.nextp?io.to(move.p2).emit('nextpChange', true):io.to(move.p2).emit('nextpChange', false)
            fieldsData = {"X": move.X, "O" : move.O};

            io.to(move.p1).emit('gameFieldsChange', fieldsData );
            io.to(move.p2).emit('gameFieldsChange', fieldsData );
            // check if game is won
            if(move.win){
                io.to(move.p1).emit('gameEnd', move.win );
                io.to(move.p2).emit('gameEnd', move.win );
            } else if(move.draw){
                io.to(move.p1).emit('gameDraw', move.draw );
                io.to(move.p2).emit('gameDraw', move.draw );
            }
        }
    });

    client.on('disconnect',()=>{
        otherPlayerInGame = gameArea.disconnectPlayer(client.id);
        if(otherPlayerInGame){
            io.to(otherPlayerInGame).emit("GameCanceled");
        }
    });
});
io.listen(INIT_VARIABLES.socket_port);

