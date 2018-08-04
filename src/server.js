import User from './Components/User';
import Session from './Components/Session';
import Board from './Components/Board';

var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = 3000;

app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
})

http.listen(PORT, function(){
    console.log("Listening on " + PORT);
})

//Variables

var users = [];
var sessions = [];

//Socket Work

var userCount = 0;

io.on('connection', function(socket) {
    var userID = userCount;
    userCount+=1;
    var You = {};
    var roomCode = "";

    socket.on('create_user', function(username) {
        users.push(new User(userID, username));
        You = users[users.length-1];

        console.log("Created ID: " + userID + ", User " + username);
    })

    socket.on('create_room', function() {

        roomCode = "01";
        socket.join(roomCode);

        sessions.push(new Session(roomCode, [You]));
        console.log(sessions[sessions.length-1]);
        io.in(roomCode).emit('new_game', sessions[sessions.length-1], You);

    })

    socket.on('join_room', function(rc) {
        socket.join(rc);
        roomCode = rc;

        let s = getSessionByRoomCode(rc);
        console.log("Adding Player to Session " + s + " with Username: " + You.USERNAME);
        //sessions[s].addPlayer(You);
        addPlayerToSession(sessions[s], You);
        

    })

    socket.on('update_session', function(sesh) {
        let s = getSessionByRoomCode(sesh.ROOM_CODE);
        sessions[s] = sesh;
        //sessions[s].checkWin();
        if (checkWin(sessions[s])) {
            sessions[s].GAME_WON = true;
        }
        socket.to(roomCode).emit('session_updated', sessions[s]);
    })

    socket.on('disconnect', function() {
        let s = getSessionByRoomCode(roomCode);
        for (let p=0;p<sessions[s].PLAYERS.length;p++) {
            if (sessions[s].PLAYERS[p].USERNAME === You.USERNAME) {
                sessions[s].PLAYERS.splice(p, 1);
            }
        }

        socket.to(roomCode).emit('session_updated', sessions[s]);


    })

    function addPlayerToSession(session, player) {

        session.PLAYERS.push(player);
        session.BOARDS.push(new Board(roomCode, session.TILE_LIST, 5, 5, player));

        socket.emit('new_game', session, You);
        socket.to(roomCode).emit('player_joined', session);
    }


    function getSessionByRoomCode(rc) {
        for (let s=0;s<sessions.length;s++) {
            if (sessions[s].ROOM_CODE == rc) {
                return s;
            }
        }
    }

    function checkWin(session) {
        for (let b=0;b<session.BOARDS.length;b++) {
            if (checkBoardForWin(session.BOARDS[b])) {
                return true;
            }
        }
    }

    function getTile(x, y, board) {
        
        for (let t=0;t<board.BOARD.length;t++) {
            if (board.BOARD[t].POSITION_X === x && board.BOARD[t].POSITION_Y === y) {
                return board.BOARD[t];
            }
        }
    }

    function checkBoardForWin(board) {
        let win = false;

        console.log(board);
    
            for (let h=0;h<5;h++) {
                let w=true;
                for (let x=0;x<5;x++) {
                    let tile = getTile(h, x, board)
                    if(!tile.CROSSED) {
                        w = false;
                    }

                    
                }

                if(w) {
                    win = true;
                    console.log("Someone Won!");
                }
    
                
            }
    
            for (let v=0;v<5;v++) {
                let w=true;
                for (let y=0;y<5;y++) {
                    let tile = getTile(y, v, board)
                    if(!tile.CROSSED) {
                        w = false;
                    }

                    
                }

                if(w) {
                    win = true;
                    console.log("Someone Won!");
                }
    
                
            }
    
            return win;
    }
})