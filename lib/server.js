'use strict';

var _User = require('./Components/User');

var _User2 = _interopRequireDefault(_User);

var _Session = require('./Components/Session');

var _Session2 = _interopRequireDefault(_Session);

var _Board = require('./Components/Board');

var _Board2 = _interopRequireDefault(_Board);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var PORT = 3001;

app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

http.listen(PORT, function () {
    console.log("Listening on " + PORT);
});

//Variables

var users = [];
var sessions = [];

var maxCreationAttempts = 100;

var alphArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

//Socket Work

var userCount = 0;

io.on('connection', function (socket) {
    var userID = userCount;
    userCount += 1;
    var You = {};
    var roomCode = "";
    var gameWon = false;
    var gameWinner = {};

    socket.on('create_user', function (username) {
        users.push(new _User2.default(userID, username));
        You = users[users.length - 1];

        console.log("Created ID: " + userID + ", User " + username);
    });

    socket.on('create_room', function (size) {

        var roomdupe = false;

        for (var g = 0; g < maxCreationAttempts; g++) {
            roomCode = generateRoomCode();
            for (var sr = 0; sr < sessions.length; sr++) {
                if (roomCode == sessions[sr].ROOM_CODE) {
                    roomdupe = true;
                }
            }
        }

        if (!roomdupe) {
            socket.join(roomCode);

            sessions.push(new _Session2.default(roomCode, [You], size, "DuckGame"));
            console.log(sessions[sessions.length - 1]);
            io.in(roomCode).emit('new_game', sessions[sessions.length - 1], You);
        }

        //roomCode = "01";

    });

    socket.on('join_room', function (rc) {
        socket.join(rc);
        roomCode = rc;

        var s = getSessionByRoomCode(rc);
        if (s != null && s != undefined) {
            console.log("Adding Player to Session " + s + " with Username: " + You.USERNAME);
            addPlayerToSession(sessions[s], You);
        }
    });

    socket.on('update_session', function (sesh) {
        var s = getSessionByRoomCode(sesh.ROOM_CODE);
        sessions[s] = sesh;
        //sessions[s].checkWin();
        if (checkWin(sessions[s])) {
            sessions[s].GAME_WON = true;
            var winner = getPlayerWon(sessions[s]);
            sessions[s].WINNER = winner;
            io.in(roomCode).emit('game_won', sessions[s]);
            console.log("Game Won By: " + winner.USERNAME);
        } else {
            io.in(roomCode).emit('session_updated', sessions[s]);
        }
    });

    socket.on('restart_game', function () {
        var s = getSessionByRoomCode(roomCode);

        if (sessions[s] != null && sessions[s] != undefined) {
            sessions[s].BOARDS = [];
            sessions[s].GAME_WON = false;
            sessions[s].WINNER = {};
            for (var p = 0; p < sessions[s].PLAYERS.length; p++) {
                sessions[s].BOARDS.push(new _Board2.default(roomCode, sessions[s].TILE_LIST, sessions[s].BOARD_SIZE, sessions[s].BOARD_SIZE, sessions[s].PLAYERS[p]));
            }
        }

        io.in(roomCode).emit('session_updated', sessions[s]);
    });

    socket.on('disconnect', function () {
        var s = getSessionByRoomCode(roomCode);

        if (s != null && s != undefined) {

            for (var p = 0; p < sessions[s].PLAYERS.length; p++) {
                if (sessions[s].PLAYERS[p].USERNAME === You.USERNAME) {
                    sessions[s].PLAYERS.splice(p, 1);
                }
            }

            socket.to(roomCode).emit('session_updated', sessions[s]);
        }
    });

    socket.on('disconnect_game', function () {
        var s = getSessionByRoomCode(roomCode);

        var hostDisconnect = false;

        if (s != null && s != undefined) {

            for (var p = 0; p < sessions[s].PLAYERS.length; p++) {
                if (sessions[s].PLAYERS[p].USERNAME === You.USERNAME) {
                    if (sessions[s].PLAYER_HOST.USERNAME == You.USERNAME) {
                        hostDisconnect = true;
                        console.log("Host Disconnected");
                    }
                    sessions[s].PLAYERS.splice(p, 1);
                }
            }

            if (!hostDisconnect) {
                for (var b = 0; b < sessions[s].BOARDS.length; b++) {
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
    });

    function generateRoomCode() {

        var first = "";
        var second = "";
        var third = "";
        var fourth = "";
        var r = Math.floor(Math.random() * Math.floor(2));
        if (r >= 1) {
            first = Math.floor(Math.random() * Math.floor(10)).toString();
        } else {
            var nfirst = Math.floor(Math.random() * Math.floor(26));
            first = alphArray[nfirst];
        }
        r = Math.floor(Math.random() * Math.floor(2));
        if (r >= 1) {
            second = Math.floor(Math.random() * Math.floor(10)).toString();
        } else {
            var nsecond = Math.floor(Math.random() * Math.floor(26));
            second = alphArray[nsecond];
        }
        r = Math.floor(Math.random() * Math.floor(2));
        if (r >= 1) {
            third = Math.floor(Math.random() * Math.floor(10)).toString();
        } else {
            var nthird = Math.floor(Math.random() * Math.floor(26));
            third = alphArray[nthird];
        }
        r = Math.floor(Math.random() * Math.floor(2));
        if (r >= 1) {
            fourth = Math.floor(Math.random() * Math.floor(10)).toString();
        } else {
            var nfourth = Math.floor(Math.random() * Math.floor(26));
            fourth = alphArray[nfourth];
        }

        var concat = first + second + third + fourth;
        return concat;

        console.log(concat);
    }

    function addPlayerToSession(session, player) {

        //check for duplicate player names

        var dupes = false;
        var index = 0;
        for (var p = 0; p < session.PLAYERS.length; p++) {

            if (session.PLAYERS[p].USERNAME === player.USERNAME) {
                dupes = true;
                index = p;
            }
        }

        if (dupes) {

            for (var b = 0; b < session.BOARDS.length; b++) {
                if (session.BOARDS[b].OWNER.USERNAME == session.PLAYERS[index].USERNAME) {
                    session.BOARDS[b].OWNER = player;
                }
            }

            session.PLAYERS.splice(index, 1);
            session.PLAYERS.push(player);
        } else {
            session.PLAYERS.push(player);
            session.BOARDS.push(new _Board2.default(roomCode, session.TILE_LIST, session.BOARD_SIZE, session.BOARD_SIZE, player));
        }

        socket.emit('new_game', session, You);
        socket.to(roomCode).emit('player_joined', session);
    }

    function getSessionByRoomCode(rc) {
        for (var s = 0; s < sessions.length; s++) {
            if (sessions[s].ROOM_CODE == rc) {
                return s;
            }
        }
    }

    function checkWin(session) {
        for (var b = 0; b < session.BOARDS.length; b++) {
            if (checkBoardForWin(session.BOARDS[b])) {
                return true;
            }
        }
    }

    function getPlayerWon(session) {
        for (var b = 0; b < session.BOARDS.length; b++) {
            if (checkBoardForWin(session.BOARDS[b])) {
                return session.BOARDS[b].OWNER;
            }
        }
    }

    function getTile(x, y, board) {

        for (var t = 0; t < board.BOARD.length; t++) {
            if (board.BOARD[t].POSITION_X === x && board.BOARD[t].POSITION_Y === y) {
                return board.BOARD[t];
            }
        }
    }

    function checkBoardForWin(board) {
        var win = false;

        console.log("BRD: " + board.BOARD_WIDTH);

        for (var h = 0; h < board.BOARD_WIDTH; h++) {
            var _w = true;
            for (var x = 0; x < board.BOARD_WIDTH; x++) {
                var tile = getTile(h, x, board);
                if (!tile.CROSSED) {
                    _w = false;
                }
            }

            if (_w) {
                win = true;
                console.log("Someone Won!");
            }
        }

        for (var v = 0; v < board.BOARD_WIDTH; v++) {
            var _w2 = true;
            for (var y = 0; y < board.BOARD_WIDTH; y++) {
                var _tile = getTile(y, v, board);
                if (!_tile.CROSSED) {
                    _w2 = false;
                }
            }

            if (_w2) {
                win = true;
                console.log("Someone Won!");
            }
        }

        var w = true;
        for (var d = 0; d < board.BOARD_WIDTH; d++) {
            var _tile2 = getTile(d, d, board);
            if (!_tile2.CROSSED) {
                w = false;
            }
        }

        if (w) {
            win = true;
            console.log("Someone Won!");
        }

        w = true;
        var count = 0;
        for (var _d = board.BOARD_WIDTH - 1; _d >= 0; _d--) {
            var _tile3 = getTile(_d, count, board);
            if (!_tile3.CROSSED) {
                w = false;
            }
            count++;
        }

        if (w) {
            win = true;
            console.log("Someone Won!");
        }

        return win;
    }
});