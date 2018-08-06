import User from './Components/User';
import Session from './Components/Session';
import Board from './Components/Board';

var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = 3001;

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

var maxCreationAttempts = 100;

var alphArray = [ "A", "B", "C", "D", "E", "F",
"G", "H", "I", "J", "K", "L",
"M", "N", "O", "P", "Q", "R",
"S", "T", "U", "V", "W", "X", "Y", "Z"];

//Socket Work

var userCount = 0;

io.on('connection', function(socket) {
    var userID = userCount;
    userCount+=1;
    var You = {};
    var roomCode = "";
    var gameWon = false;
    var gameWinner = {};

    socket.on('create_user', function(username) {
        users.push(new User(userID, username));
        You = users[users.length-1];

        console.log("Created ID: " + userID + ", User " + username);
    })

    socket.on('create_room', function(size) {

        let roomdupe = false;

        for (let g=0;g<maxCreationAttempts;g++) {
            roomCode = generateRoomCode();
            for (let sr=0;sr<sessions.length;sr++) {
                if (roomCode == sessions[sr].ROOM_CODE) {
                    roomdupe = true;
                }
            }
        }
        
        if (!roomdupe) {
            socket.join(roomCode);

            sessions.push(new Session(roomCode, [You], size, "DuckGame"));
            console.log(sessions[sessions.length-1]);
            io.in(roomCode).emit('new_game', sessions[sessions.length-1], You);
        }

        //roomCode = "01";
        

    })

    socket.on('join_room', function(rc) {
        socket.join(rc);
        roomCode = rc;

        let s = getSessionByRoomCode(rc);
        if (s != null && s != undefined) {
            console.log("Adding Player to Session " + s + " with Username: " + You.USERNAME);
            addPlayerToSession(sessions[s], You);
        }
        
        

    })

    socket.on('update_session', function(sesh) {
        let s = getSessionByRoomCode(sesh.ROOM_CODE);
        sessions[s] = sesh;
        //sessions[s].checkWin();
        if (checkWin(sessions[s])) {
            sessions[s].GAME_WON = true;
            let winner = getPlayerWon(sessions[s]);
            sessions[s].WINNER = winner;
            io.in(roomCode).emit('game_won', sessions[s]);
            console.log("Game Won By: " + winner.USERNAME);
        } else {
            io.in(roomCode).emit('session_updated', sessions[s]);
        }
        
    })

    socket.on('restart_game', function() {
        let s = getSessionByRoomCode(roomCode);

        if (sessions[s] != null && sessions[s] != undefined) {
            sessions[s].BOARDS = [];
            sessions[s].GAME_WON = false;
            sessions[s].WINNER = {};
            for (let p=0;p<sessions[s].PLAYERS.length;p++) {
                sessions[s].BOARDS.push(new Board(roomCode, sessions[s].TILE_LIST, sessions[s].BOARD_SIZE, sessions[s].BOARD_SIZE, sessions[s].PLAYERS[p]));
            }
        }

        io.in(roomCode).emit('session_updated', sessions[s]);
    })

    socket.on('disconnect', function() {
        let s = getSessionByRoomCode(roomCode);

        if (s != null && s != undefined) {

            for (let p=0;p<sessions[s].PLAYERS.length;p++) {
                if (sessions[s].PLAYERS[p].USERNAME === You.USERNAME) {
                    sessions[s].PLAYERS.splice(p, 1);
                }
            }
    
            socket.to(roomCode).emit('session_updated', sessions[s]);
        }

    })

    socket.on('disconnect_game', function() {
        let s = getSessionByRoomCode(roomCode);

        let hostDisconnect = false;

        if (s != null && s != undefined) {

            for (let p=0;p<sessions[s].PLAYERS.length;p++) {
                if (sessions[s].PLAYERS[p].USERNAME === You.USERNAME) {
                    if (sessions[s].PLAYER_HOST.USERNAME == You.USERNAME) {
                        hostDisconnect = true;
                        console.log("Host Disconnected");
                    }
                    sessions[s].PLAYERS.splice(p, 1);
                }
            }

            if (!hostDisconnect) {
                for (let b=0;b<sessions[s].BOARDS.length;b++) {
                    if (sessions[s].BOARDS[b].OWNER.USERNAME === You.USERNAME) {
                        sessions[s].BOARDS.splice(b, 1);
                    }
                }
            }
            
    
            
            if (!hostDisconnect) {
                socket.to(roomCode).emit('session_updated', sessions[s]);
                socket.emit("disconnected_game");
            } else {
                sessions[s] = {};
                io.in(roomCode).emit('session_updated', sessions[s]);
                io.in(roomCode).emit("disconnected_game");
            }

            socket.leave(roomCode);
            roomCode = "";
            
        }
    })

    function generateRoomCode() {

        let first = "";
        let second = "";
        let third = "";
        let fourth = "";
        let r = Math.floor(Math.random() * Math.floor(2));
        if (r >= 1) {
            first = Math.floor(Math.random() * Math.floor(10)).toString();
        }
        else {
            let nfirst = Math.floor(Math.random() * Math.floor(26));
            first = alphArray[nfirst];
        }
        r = Math.floor(Math.random() * Math.floor(2));
        if (r >= 1) {
            second = Math.floor(Math.random() * Math.floor(10)).toString();
        }
        else {
            let nsecond = Math.floor(Math.random() * Math.floor(26));
            second = alphArray[nsecond];
        }
        r = Math.floor(Math.random() * Math.floor(2));
        if (r >= 1) {
            third = Math.floor(Math.random() * Math.floor(10)).toString();
        }
        else {
            let nthird = Math.floor(Math.random() * Math.floor(26));
            third = alphArray[nthird];
        }
        r = Math.floor(Math.random() * Math.floor(2));
        if (r >= 1) {
            fourth = Math.floor(Math.random() * Math.floor(10)).toString();
        }
        else {
            let nfourth = Math.floor(Math.random() * Math.floor(26));
            fourth = alphArray[nfourth];
        }

        let concat = first + second + third + fourth;
        return concat;

        console.log(concat);

    }

    function addPlayerToSession(session, player) {

        //check for duplicate player names

        let dupes = false;
        let index = 0;
        for (let p=0;p<session.PLAYERS.length;p++) {

            if (session.PLAYERS[p].USERNAME === player.USERNAME) {
                dupes = true;
                index = p;
            }

        }

        if (dupes) {
            
            for (let b=0;b<session.BOARDS.length;b++) {
                if (session.BOARDS[b].OWNER.USERNAME == session.PLAYERS[index].USERNAME) {
                    session.BOARDS[b].OWNER = player;
                }
            }

            session.PLAYERS.splice(index, 1);
            session.PLAYERS.push(player);
        }
        else {
            session.PLAYERS.push(player);
            session.BOARDS.push(new Board(roomCode, session.TILE_LIST, session.BOARD_SIZE, session.BOARD_SIZE, player));
        }
       

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

    function getPlayerWon(session) {
        for (let b=0;b<session.BOARDS.length;b++) {
            if (checkBoardForWin(session.BOARDS[b])) {
                return session.BOARDS[b].OWNER;
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

        console.log("BRD: " + board.BOARD_WIDTH);
    
            for (let h=0;h<board.BOARD_WIDTH;h++) {
                let w=true;
                for (let x=0;x<board.BOARD_WIDTH;x++) {
                    let tile = getTile(h, x, board);
                    if(!tile.CROSSED) {
                        w = false;
                    }

                    
                }

                if(w) {
                    win = true;
                    console.log("Someone Won!");
                }
    
                
            }
    
            for (let v=0;v<board.BOARD_WIDTH;v++) {
                let w=true;
                for (let y=0;y<board.BOARD_WIDTH;y++) {
                    let tile = getTile(y, v, board);
                    if(!tile.CROSSED) {
                        w = false;
                    }

                    
                }

                if(w) {
                    win = true;
                    console.log("Someone Won!");
                }
    
                
            }

            let w = true;
            for (let d=0;d<board.BOARD_WIDTH;d++) {
                let tile = getTile(d, d, board);
                if (!tile.CROSSED) {
                    w = false;
                }
            }

            if(w) {
                win = true;
                console.log("Someone Won!");
            }

            w = true;
            let count = 0;
            for (let d=board.BOARD_WIDTH-1;d>=0;d--) {
                let tile = getTile(d, count, board);
                if (!tile.CROSSED) {
                    w = false;
                }
                count++;
            }

            if(w) {
                win = true;
                console.log("Someone Won!");
            }
    
            return win;
    }
})