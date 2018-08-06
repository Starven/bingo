"use strict";


var socket = io();

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


var TILE_WIDTH = canvas.width / 5;
var TILE_HEIGHT = (canvas.height - 25) / 5;

var BOARD_SIZE = 5;

var User = {};
var Session = {};
var gameStart = false;
var gameEnd = false;

var playerListButtonHover = false;
var playerDisconnectButtonHover = false;
var onGameScreen = true;
var closeUpScreen = false;
var selectedTile = {};

var mousePos = { 'x' : 0, 'y': 0};

/*var button = { 'x' : 0, 'y' : 0,
            'width' : 0, 'height' : 0,
            'colour' : "", 'hovered-colour' : "",
            }; */ 

//define buttons



var button_restartGame = {};
var button_disconnectGame = {};

initButtons();

function initButtons() {

    //Restart Game Button

    
    button_restartGame.x = canvas.width / 2 - (canvas.width / 6);
    button_restartGame.y = (canvas.height / 2) + (canvas.height / 6);
    button_restartGame.width = canvas.width / 6;
    button_restartGame.height = canvas.height / 12;
    button_restartGame.colour = "rgb(130,255,130)";
    button_restartGame.hovered_colour = "rgb(130, 130, 255)";
    button_restartGame.hovering = false;
    button_restartGame.clicked = function() {
        socket.emit('restart_game');
    }

    //Disconnect Game Button (post-win)

    
    button_disconnectGame.x = canvas.width / 2;
    button_disconnectGame.y = (canvas.height / 2) + (canvas.height / 6);
    button_disconnectGame.width = canvas.width / 6;
    button_disconnectGame.height = canvas.height / 12;
    button_disconnectGame.colour = "rgb(255,130,130)";
    button_disconnectGame.hovered_colour = "rgb(130, 130, 255)";
    button_disconnectGame.hovering = false;
    button_disconnectGame.clicked = function() {
        socket.emit('disconnect_game');
    }
}



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
    socket.emit('create_room', BOARD_SIZE);
}

function joinGame() {
    let rc = document.getElementById("roomCode").value;
    socket.emit('join_game', rc);
}

function joinGame() {
    var roomCode = document.getElementById("roomCode").value;

    socket.emit('join_room', roomCode);
}

function boardSize(number) {

    var fivediv = document.getElementById("sel_5");
    var threediv = document.getElementById("sel_3");

    if (number == '3') {

        fivediv.classList.add("not_selected");
        fivediv.classList.remove("selected");

        threediv.classList.add("selected");
        threediv.classList.remove("not_selected");

        BOARD_SIZE = 3;

    } else {
        
        fivediv.classList.remove("not_selected");
        fivediv.classList.add("selected");

        threediv.classList.remove("selected");
        threediv.classList.add("not_selected");

        BOARD_SIZE = 5;
    }
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
    context.strokeStyle = "rgb(0,0,0)";

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
    
    context.strokeRect(x, y, TILE_WIDTH, TILE_HEIGHT);

    if (tile.HOVERED) {
        context.fillStyle = "#FFFFFF";
    } else {
        context.fillStyle = "#000000";
    }

    if (tile.CROSSED) {
        context.fillStyle = "rgb(255, 255, 255)";
    }

    

    context.font = "15px Arial";
    context.textAlign = "center";
    context.fillText(text, x + (TILE_WIDTH / 2), y + (TILE_HEIGHT / 2));

}

function renderTilePreview(x, y, text, player, dim) {

    let tile = getTileFromOwner(text, player);

    context.fillStyle = "rgb(255,255,255)";

    if (tile.CROSSED) {
        context.fillStyle = "rgb(65, 65, 130)";
    }
    
    context.fillRect(x, y, dim, dim);

}

function renderBoard(board) {

    context.fillStyle = "#000000";
    context.fillRect(0,0,(TILE_WIDTH * board.BOARD_WIDTH), (TILE_HEIGHT * board.BOARD_HEIGHT));

    let count = 0;

    for (let x=0;x<board.BOARD_WIDTH;x++) {
        for (let y=0;y<board.BOARD_HEIGHT;y++) {

            renderTile((x * TILE_WIDTH), (y * TILE_HEIGHT) + 25, board.BOARD[count].TEXT);
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
    context.fillText(Session.PLAYERS.length, 15, 18);

    context.font = "15px Arial";
    context.fillText("#" + Session.ROOM_CODE, 55, 18);

    if (playerDisconnectButtonHover) {
        context.fillStyle = "rgb(160,10,10)";
    } else {
        context.fillStyle = "rgb(10,10,10)";
    }
    context.fillRect(canvas.width - 25,0,25,25);
    context.fillStyle = "rgb(255,255,255)";
    context.font = "15px Arial";
    context.fillText("X", canvas.width - 15, 18);

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

        context.fillRect(xoffset, canvas.height - (canvas.height / 6), canvas.height / 2, (canvas.height / 6));

        context.fillStyle = "rgb(255,255,255)";
        context.font = "15px Arial";
        if (!selectedTile.CROSSED) {
            context.fillText("CROSS SQUARE", xoffset + (canvas.height / 4), canvas.height - 100);
        } else {
            context.fillText("UNCROSS SQUARE", xoffset + (canvas.height / 4), canvas.height - 100);
        }
        

        context.fillStyle = "rgb(90,90,90)";
        context.fillRect(xoffset + (canvas.height / 2) , canvas.height - (canvas.height / 6), canvas.height / 2, (canvas.height / 6));
        
        context.fillStyle = "rgb(255,255,255)";
        context.font = "30px Arial";
        context.fillText("CANCEL", xoffset + (canvas.height / 2) + (canvas.height / 4), canvas.height - 100);


    } else if(gameEnd) {
        context.fillStyle = "rgba(0,0,0,0.9)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "rgb(255,255,255)";
        context.font = "30px Arial";
        context.fillText(Session.WINNER.USERNAME + " got BINGO!", 0 + canvas.width / 2, 0 + canvas.height / 2);


        if (Session.PLAYER_HOST.USERNAME == User.USERNAME) {

            if (button_restartGame.hovering) {
                context.fillStyle = button_restartGame.hovered_colour;
            } else {
                context.fillStyle = button_restartGame.colour;
            }
            
            context.fillRect(button_restartGame.x, button_restartGame.y, button_restartGame.width, button_restartGame.height);
            //context.fillRect(canvas.width / 2 - (canvas.width / 6), (canvas.height / 2) + (canvas.height / 6), canvas.width / 6, canvas.height / 12);


            context.fillStyle = "rgb(255,255,255)";
            context.font = "15px Arial";
            context.fillText("New Game", button_restartGame.x + (button_restartGame.width / 2), button_restartGame.y + (button_restartGame.height / 2), button_restartGame.width, button_restartGame.height);

        } else {
            context.fillStyle = "rgb(148, 148, 148)";
            context.fillRect(canvas.width / 2 - (canvas.width / 6), (canvas.height / 2) + (canvas.height / 6), canvas.width / 6, canvas.height / 12);

            context.fillStyle = "rgb(255,255,255)";
            context.font = "15px Arial";
            context.fillText("Waiting For Host", canvas.width / 2 - (canvas.width / 12), (canvas.height / 2) + (canvas.height / 6) + ((canvas.height / 12) / 2), canvas.width / 6, canvas.height / 12);
        }
     

        if (button_disconnectGame.hovering) {
            context.fillStyle = button_disconnectGame.hovered_colour;
        } else {
            context.fillStyle = button_disconnectGame.colour;
        }
        context.fillRect(button_disconnectGame.x, button_disconnectGame.y, button_disconnectGame.width, button_disconnectGame.height);
        //        context.fillRect(canvas.width / 2, (canvas.height / 2) + (canvas.height / 6), canvas.width / 6, canvas.height / 12);


        context.fillStyle = "rgb(255,255,255)";
        context.font = "15px Arial";
        context.fillText("Disconnect", button_disconnectGame.x + (button_disconnectGame.width / 2), button_disconnectGame.y + (button_disconnectGame.height / 2), button_disconnectGame.width, button_disconnectGame.height);

    }

}


function renderBoardPreview(board, ix, iy, height) {

    context.fillStyle = "#000000";
    context.fillRect(ix,iy + 25, height, height);

    let tileDim = height / board.BOARD_WIDTH;

    let count = 0;

    for (let x=0;x<board.BOARD_WIDTH;x++) {
        for (let y=0;y<board.BOARD_HEIGHT;y++) {

            renderTilePreview(ix + (x * tileDim), iy + (y * tileDim) + 25, board.BOARD[count].TEXT, board.OWNER, tileDim);
            count++;
        }
    }

}

function renderPlayerList() {

    let maxBoardSize = (25 * 5);
    let xPadding = 300;
    let yPadding = 0;
    let textYPadding = 45;
    let h = canvas.height / Session.PLAYERS.length;

    if (h > maxBoardSize) {
        h = maxBoardSize;
    }

    let yo = 0;
    for (let p=0;p<Session.PLAYERS.length;p++) {

        
        if (p > 0) {
            if (p % 2 == 0) {
                
                context.fillStyle = "rgb(175,175,175)";
                context.font = "30px Arial";
                context.fillText(Session.PLAYERS[p].USERNAME, 45, textYPadding + (yo * h) + 25);
        

                let player = Session.PLAYERS[p];

                let board = getBoardByOwner(player);

                renderBoardPreview(board, (canvas.width / 2) - h - 15, yo * h, h - 10);
            } else {
                context.fillStyle = "rgb(175,175,175)";
                context.font = "30px Arial";
                //context.fillText(Session.PLAYERS[p].USERNAME, 450, textYPadding + (p-1 * h) + 25);
                context.fillText(Session.PLAYERS[p].USERNAME, (canvas.width / 2) + 45, textYPadding + (yo * h) + 25);
        

                let player = Session.PLAYERS[p];

                let board = getBoardByOwner(player);

                renderBoardPreview(board, canvas.width - h - 15, yo * h, h - 10);
                yo += 1;
            }
        } else {
            context.fillStyle = "rgb(175,175,175)";
            context.font = "30px Arial";
            context.fillText(Session.PLAYERS[p].USERNAME, 45, textYPadding + (p * h) + 25);
            
    
            let player = Session.PLAYERS[p];
    
            let board = getBoardByOwner(player);
    
            renderBoardPreview(board, (canvas.width / 2) - h - 15, yo * h, h - 10);
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

    if (mx >= 0 && mx <= 25 && my >= 0 && my <= 25) {
        playerListButtonHover = true;
    } else {
        playerListButtonHover = false;
    }

    if (mx >= canvas.width - 25 && mx <= canvas.width && my >= 0 && my <= 25) {
        playerDisconnectButtonHover = true;
    } else {
        playerDisconnectButtonHover = false;
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

function clickEndButton(mx, my) {

    if (mx >= button_restartGame.x && mx <= button_restartGame.x + button_restartGame.width &&
        my >= button_restartGame.y && my <= button_restartGame.y + button_restartGame.height) {

            if (Session.PLAYER_HOST.USERNAME == User.USERNAME) {
                button_restartGame.clicked();
            } 
            

    } else if (mx >= button_disconnectGame.x && mx <= button_disconnectGame.x + button_disconnectGame.width &&
    my >= button_disconnectGame.y && my <= button_disconnectGame.y + button_disconnectGame.height) {
            button_disconnectGame.clicked();
    }
}

function hoverEndButton(mx, my) {

    let hovering = false;
    let board = getBoardByOwner(User);

    if (mx >= button_restartGame.x && mx <= button_restartGame.x + button_restartGame.width &&
        my >= button_restartGame.y && my <= button_restartGame.y + button_restartGame.height) {

            if (Session.PLAYER_HOST.USERNAME == User.USERNAME) {
                hovering = true;
                button_restartGame.hovering = true;
                button_disconnectGame.hovering = false;
                
            } 
            

    } else if (mx >= button_disconnectGame.x && mx <= button_disconnectGame.x + button_disconnectGame.width &&
    my >= button_disconnectGame.y && my <= button_disconnectGame.y + button_disconnectGame.height) {
            hovering = true;
            button_restartGame.hovering = false;
            button_disconnectGame.hovering = true;
    }

    if (!hovering) {
        document.getElementById("canvas").style.cursor = "default";
        button_restartGame.hovering = false;
        button_disconnectGame.hovering = false;
    } else {
        document.getElementById("canvas").style.cursor = "pointer";
  
    }
    render();
    renderBoard(board);
}

function restartGame() {
    socket.emit("restart_game");
}

function disconnectGame() {
    socket.emit("disconnect_game");
}


window.addEventListener("resize", function(e) {


    if (gameStart) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        let board = getBoardByOwner(User);
    
        TILE_WIDTH = canvas.width / board.BOARD_WIDTH;
        TILE_HEIGHT = (canvas.height - 25) / board.BOARD_HEIGHT;

        render();
        renderBoard(board);
    }
    

});

//oh shit lol

document.addEventListener("mousemove", function(e) {
    e.preventDefault();

    let rect = canvas.getBoundingClientRect();

    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    if (gameStart) {
        if (mx > 25 && my > 25 && onGameScreen == true) {
            if (closeUpScreen && !gameEnd) {
                // do hover stuff here 
            } else if(gameEnd) {
                hoverEndButton(mx, my);
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
        if (mx > 25 && my > 25 && onGameScreen == true) {
            if (!closeUpScreen && !gameEnd) {
                clickTiles(mx, my);
            } else if(gameEnd) {
                clickEndButton(mx, my);
            } else {
                clickButton(mx, my);
            }
            
            playerListButtonHover = false;
        } else {
            if (mx <= 25) {
                if (onGameScreen == false) {
                    onGameScreen = true;
                } else {
                    onGameScreen = false;
                }
            } else if (mx >= canvas.width - 25) {
                socket.emit('disconnect_game');
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
    var screenlist = document.getElementById("list-screen-container");
    var gamediv = document.getElementById("game-screen-container");

    createjoindiv.classList.add("hidden");
    gamediv.classList.remove("hidden");
    screenlist.classList.add("hidden");

    Session = session;
    User = you;
    gameStart = true;

    let board = getBoardByOwner(User);

    console.log(board.BOARD_WIDTH);

    TILE_WIDTH = canvas.width / board.BOARD_WIDTH;
    TILE_HEIGHT = (canvas.height - 25) / board.BOARD_HEIGHT;

  //  console.log("User: " + User);

    render();

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

    console.log("Winner: " + session.WINNER.USERNAME);

    render();

    let board = getBoardByOwner(User);


    if(onGameScreen) {
        renderBoard(board);
    }

    if (Session.GAME_WON) {
        console.log("Game has been won!");
        gameEnd = true;
    } else {
        gameEnd = false;
        render();
        renderBoard(board);
    }
})

socket.on("game_won", function(session) {
    console.log("Game won by " + session.WINNER.USERNAME);
    Session = session;
    gameEnd = true;
})

socket.on("disconnected_game", function() {
    var logindiv = document.getElementById("login-container");
    var gamediv = document.getElementById("game-screen-container");

    logindiv.classList.remove("hidden");
    gamediv.classList.add("hidden");

    Session = {};

    gameStart = false;
    gameEnd = false;
})



