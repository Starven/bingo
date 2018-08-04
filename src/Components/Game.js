"use strict";


var socket = io();

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


var TILE_WIDTH = canvas.width / 5;
var TILE_HEIGHT = canvas.height / 5;

var User = {};
var Session = {};
var gameStart = false;

var playerListButtonHover = false;
var onGameScreen = true;
var closeUpScreen = false;
var selectedTile = {};

var mousePos = { 'x' : 0, 'y': 0};

function onUsername() {
    var username = document.getElementById("username-input").value;
    var logindiv = document.getElementById("login-container");
    var createjoindiv = document.getElementById("create-join-container");

    logindiv.classList.add("hidden");

    createjoindiv.classList.remove("hidden");

    socket.emit('create_user', username);
}

function listScreen() {

    var createjoindiv = document.getElementById("create-join-container");
    var listdiv = document.getElementById("list-screen-container");

    createjoindiv.classList.add("hidden");
    listdiv.classList.remove("hidden");

    //socket.emit('create_user', username);
}

function createGame() {
    socket.emit('create_room');
}

function joinGame() {
    let rc = document.getElementById("roomCode").value;
    socket.emit('join_game', rc);
}

function joinGame() {
    var roomCode = document.getElementById("roomCode").value;

    socket.emit('join_room', roomCode);
}

function render() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function renderPlayerScreen() {
    context.fillStyle = "rgba(0, 0, 0, 0.9)";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function renderTile(x, y, text) {

    let tile = getTile(text);

   // console.log(tile);


    if (tile.HOVERED) {
        context.fillStyle = "rgb(65, 65, 65)";
    } else {
        context.fillStyle = "#FFFFFF";
    }

    if (tile.CROSSED) {
        context.fillStyle = "rgb(65, 65, 130)";
    }
    
    context.fillRect(x, y, TILE_WIDTH, TILE_HEIGHT);

    if (tile.HOVERED) {
        context.fillStyle = "#FFFFFF";
    } else {
        context.fillStyle = "#000000";
    }

    if (tile.CROSSED) {
        context.fillStyle = "rgb(255, 255, 255)";
    }

    

    context.font = "30px Arial";
    context.textAlign = "center";
    context.fillText(text, x + (TILE_WIDTH / 2), y + (TILE_HEIGHT / 2));

}

function renderTilePreview(x, y, text, player) {

    let tile = getTileFromOwner(text, player);

    context.fillStyle = "rgb(255,255,255)";

    if (tile.CROSSED) {
        context.fillStyle = "rgb(65, 65, 130)";
    }
    
    context.fillRect(x, y, 25, 25);

}

function renderBoard(board) {

    context.fillStyle = "#000000";
    context.fillRect(0,0,(TILE_WIDTH * 5), (TILE_HEIGHT * 5));

    let count = 0;

    for (let x=0;x<board.BOARD_WIDTH;x++) {
        for (let y=0;y<board.BOARD_HEIGHT;y++) {

            renderTile((x * TILE_WIDTH), (y * TILE_HEIGHT), board.BOARD[count].TEXT);
            count++;
        }
    }

    if (playerListButtonHover) {
        context.fillStyle = "rgb(160,10,10)";
    } else {
        context.fillStyle = "rgb(10,10,10)";
    }
    
    context.fillRect(0,0,25,25);
    context.fillStyle = "rgb(255,255,255)";
    context.font = "15px Arial";
    context.fillText(Session.PLAYERS.length, 15, 15);

    if (closeUpScreen) {

        context.fillStyle = "rgba(0,0,0,0.9)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        let xoffset = (canvas.width - canvas.height) / 2;

        context.fillStyle = "rgb(255,255,255)";
        context.fillRect(0 + xoffset, 0, canvas.height, canvas.height);

        context.fillStyle = "rgb(0,0,0)";
        context.font = "30px Arial";
        context.fillText(selectedTile.TEXT, canvas.width / 2, canvas.height / 2 - 100);

        if (selectedTile.CROSSED) {
            context.fillStyle = "rgb(130, 65, 65)";
        } else {
            context.fillStyle = "rgb(65, 65, 130)";
        }

        context.fillRect(xoffset, canvas.height - 200 , canvas.height / 2, 200);

        context.fillStyle = "rgb(255,255,255)";
        context.font = "30px Arial";
        if (!selectedTile.CROSSED) {
            context.fillText("CROSS SQUARE", xoffset + (canvas.height / 4), canvas.height - 100);
        } else {
            context.fillText("UNCROSS SQUARE", xoffset + (canvas.height / 4), canvas.height - 100);
        }
        

        context.fillStyle = "rgb(90,90,90)";
        context.fillRect(xoffset + (canvas.height / 2) , canvas.height - 200, canvas.height / 2, 200);
        context.fillStyle = "rgb(255,255,255)";
        context.font = "30px Arial";
        context.fillText("CANCEL", xoffset + (canvas.height / 2) + (canvas.height / 4), canvas.height - 100);


    }

}


function renderBoardPreview(board, ix, iy) {

    context.fillStyle = "#000000";
    context.fillRect(ix,iy,(25 * 5), (25 * 5));

    let count = 0;

    for (let x=0;x<board.BOARD_WIDTH;x++) {
        for (let y=0;y<board.BOARD_HEIGHT;y++) {

            renderTilePreview(ix + (x * 25), iy + (y * 25), board.BOARD[count].TEXT, board.OWNER);
            count++;
        }
    }

}

function renderPlayerList() {

    let xPadding = 100;
    let yPadding = 200;

    for (let p=0;p<Session.PLAYERS.length;p++) {

        context.fillStyle = "rgb(175,175,175)";
        context.font = "30px Arial";
        context.fillText(Session.PLAYERS[p].USERNAME, xPadding, yPadding + (p * yPadding));

        let player = Session.PLAYERS[p];

        let board = getBoardByOwner(player);

        renderBoardPreview(board, xPadding + 100, (yPadding - (yPadding / 4)) + (p * yPadding));

    }

    if (playerListButtonHover) {
        context.fillStyle = "rgb(160,10,10)";
    } else {
        context.fillStyle = "rgb(10,10,10)";
    }
    
    context.fillRect(0,0,25,25);
    context.fillStyle = "rgb(255,255,255)";
    context.font = "15px Arial";
    context.fillText(Session.PLAYERS.length, 15, 15);
}


// helper functions

function getBoardByOwner(user) {
    for (let b=0;b<Session.BOARDS.length;b++) {
        if (user.USERNAME === Session.BOARDS[b].OWNER.USERNAME) {
         //   console.log("yeah I returned a board: " + Session.BOARDS[b]);
            return Session.BOARDS[b];
            
        }
    }
}

function getTile(text){

    let board = getBoardByOwner(User);

    for (let t=0;t<board.BOARD.length;t++) {

        if (board.BOARD[t].TEXT == text) {
            return board.BOARD[t];
        }
    }
}

function getTileFromOwner(text, player){

    let board = getBoardByOwner(player);

    for (let t=0;t<board.BOARD.length;t++) {

        if (board.BOARD[t].TEXT == text) {
            return board.BOARD[t];
        }
    }
}

function getTileByXY(x, y){

    let board = getBoardByOwner(User);

    for (let t=0;t<board.BOARD.length;t++) {

        if (board.BOARD[t].POSITION_X == x && board.BOARD[t].POSITION_Y == y) {
            return board.BOARD[t];
        }
    }
}

function checkHoverOverTiles(mx, my) {

    let board = getBoardByOwner(User);

    for (let x=0;x<board.BOARD_WIDTH;x++) {
        for (let y=0;y<board.BOARD_HEIGHT;y++) {

            let tile = getTileByXY(x,y);

            if (mx >= x * TILE_WIDTH && mx <= (x * TILE_WIDTH) + TILE_WIDTH &&
        my >= (y * TILE_HEIGHT) && my <= (y * TILE_HEIGHT) + TILE_HEIGHT) {
                
                tile.HOVERED = true;
                document.getElementById("canvas").style.cursor = "pointer";
            } else {
                tile.HOVERED = false;
                document.getElementById("canvas").style.cursor = "pointer";
            }
            render();
            renderBoard(board);

        }
    }

}

function checkHoverOverPList(mx, my) {

    let board = getBoardByOwner(User);

    if (mx >= 0 && mx <= 15 && my >= 0 && my <= 15) {
        playerListButtonHover = true;
    } else {
        playerListButtonHover = false;
    }

    render();
    if (onGameScreen) {
        renderBoard(board);
    } else {
        render();
        renderBoard(board);
        renderPlayerScreen();
        renderPlayerList();
    }
}

function clickTiles(mx, my) {

    let board = getBoardByOwner(User);

    for (let x=0;x<board.BOARD_WIDTH;x++) {
        for (let y=0;y<board.BOARD_HEIGHT;y++) {

            let tile = getTileByXY(x,y);

            if (mx >= x * TILE_WIDTH && mx <= (x * TILE_WIDTH) + TILE_WIDTH &&
        my >= (y * TILE_HEIGHT) && my <= (y * TILE_HEIGHT) + TILE_HEIGHT) {
                selectedTile = tile;
                closeUpScreen = true;
                document.getElementById("canvas").style.cursor = "pointer";
            }
            
          //  socket.emit("update_session", Session);

            render();
            renderBoard(board);

        }
    }

}

function clickButton(mx, my) {

    let xoffset = (canvas.width - canvas.height) / 2;


    let board = getBoardByOwner(User);

    if (mx >= xoffset && mx <= (xoffset + canvas.height / 2) &&
    my >= canvas.height - 200 && my <= canvas.height) {
        selectedTile.CROSSED = !selectedTile.CROSSED;
        selectedTile = {};
        closeUpScreen = false;
    } else if (mx >= (xoffset + canvas.height / 2) && mx <= (xoffset + canvas.height) &&
    my >= canvas.height - 200 && my <= canvas.height) {
        selectedTile = {};
        closeUpScreen = false;
    }

    render();
    renderBoard(board);

    socket.emit("update_session", Session);

    
}


//oh shit lol

document.addEventListener("mousemove", function(e) {
    e.preventDefault();

    let rect = canvas.getBoundingClientRect();

    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    if (gameStart) {
        if (mx > 15 && my > 15 && onGameScreen == true) {
            if (closeUpScreen) {
                // do hover stuff here 
            } else {
                checkHoverOverTiles(mx, my);
            }
            playerListButtonHover = false;
        } else {
            checkHoverOverPList(mx, my);
        }
       
    }
});

document.addEventListener("mousedown", function(e) {
    e.preventDefault;

    let rect = canvas.getBoundingClientRect();

    let mx = e.clientX;
    let my = e.clientY;

    if (gameStart) {
        if (mx > 15 && my > 15 && onGameScreen == true) {
            if (!closeUpScreen) {
                clickTiles(mx, my);
            } else {
                clickButton(mx, my);
            }
            
            playerListButtonHover = false;
        } else {
            if (onGameScreen == false) {
                onGameScreen = true;
            } else {
                onGameScreen = false;
            }

        let board = getBoardByOwner(User);
           
        render();
        renderBoard(board);

        if (onGameScreen == false) {
            renderPlayerScreen();
            renderPlayerList();
        }

        }
    }
})

//socket calls

socket.on('new_game', function(session, you) {

  //  console.log("HAHHAA");

    var createjoindiv = document.getElementById("create-join-container");
    var gamediv = document.getElementById("game-screen-container");

    createjoindiv.classList.add("hidden");
    gamediv.classList.remove("hidden");

    Session = session;
    User = you;
    gameStart = true;

  //  console.log("User: " + User);

    render();

    let board = getBoardByOwner(User);

    //console.log(board);

    renderBoard(board);

    
})

socket.on('player_joined', function(session) {


    Session = session;

    render();

    let board = getBoardByOwner(User);


    if(onGameScreen) {
        renderBoard(board);
    }
    

})

socket.on("session_updated", function(session) {

    Session = session;

    render();

    let board = getBoardByOwner(User);


    if(onGameScreen) {
        renderBoard(board);
    }

    if (Session.GAME_WON) {
        console.log("Game has been won!");
    }
})

