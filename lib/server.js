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

var PORT = 3000;

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

//Socket Work

var userCount = 0;

io.on('connection', function (socket) {
    var userID = userCount;
    userCount += 1;
    var You = {};
    var roomCode = "";

    socket.on('create_user', function (username) {
        users.push(new _User2.default(userID, username));
        You = users[users.length - 1];

        console.log("Created ID: " + userID + ", User " + username);
    });

    socket.on('create_room', function () {

        roomCode = "01";
        socket.join(roomCode);

        sessions.push(new _Session2.default(roomCode, [You]));
        console.log(sessions[sessions.length - 1]);
        io.in(roomCode).emit('new_game', sessions[sessions.length - 1], You);
    });

    socket.on('join_room', function (rc) {
        socket.join(rc);
        roomCode = rc;

        var s = getSessionByRoomCode(rc);
        console.log("Adding Player to Session " + s + " with Username: " + You.USERNAME);
        //sessions[s].addPlayer(You);
        addPlayerToSession(sessions[s], You);
    });

    socket.on('update_session', function (sesh) {
        var s = getSessionByRoomCode(sesh.ROOM_CODE);
        sessions[s] = sesh;
        //sessions[s].checkWin();
        if (checkWin(sessions[s])) {
            sessions[s].GAME_WON = true;
        }
        socket.to(roomCode).emit('session_updated', sessions[s]);
    });

    socket.on('disconnect', function () {
        var s = getSessionByRoomCode(roomCode);
        for (var p = 0; p < sessions[s].PLAYERS.length; p++) {
            if (sessions[s].PLAYERS[p].USERNAME === You.USERNAME) {
                sessions[s].PLAYERS.splice(p, 1);
            }
        }

        socket.to(roomCode).emit('session_updated', sessions[s]);
    });

    function addPlayerToSession(session, player) {

        session.PLAYERS.push(player);
        session.BOARDS.push(new _Board2.default(roomCode, session.TILE_LIST, 5, 5, player));

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

    function getTile(x, y, board) {

        for (var t = 0; t < board.BOARD.length; t++) {
            if (board.BOARD[t].POSITION_X === x && board.BOARD[t].POSITION_Y === y) {
                return board.BOARD[t];
            }
        }
    }

    function checkBoardForWin(board) {
        var win = false;

        console.log(board);

        for (var h = 0; h < 5; h++) {
            var w = true;
            for (var x = 0; x < 5; x++) {
                var tile = getTile(h, x, board);
                if (!tile.CROSSED) {
                    w = false;
                }
            }

            if (w) {
                win = true;
                console.log("Someone Won!");
            }
        }

        for (var v = 0; v < 5; v++) {
            var _w = true;
            for (var y = 0; y < 5; y++) {
                var _tile = getTile(y, v, board);
                if (!_tile.CROSSED) {
                    _w = false;
                }
            }

            if (_w) {
                win = true;
                console.log("Someone Won!");
            }
        }

        return win;
    }
});