//Clients board, generates and randomises tiles from selected list

import Tile from './Tile';

class Board {
    constructor(roomCode, tileList, boardWidth, boardHeight, owner) {
        this.BOARD_WIDTH = boardWidth;
        this.BOARD_HEIGHT = boardHeight;

        this.roomCode = roomCode;
        this.tileList = tileList;

        this.BOARD = [];
        this.OWNER = owner;
        this.generateBoardFromList();

        this.checkForWin = function() {
            //check horizontal win
    
            let win = false;
    
            for (let h=0;h<5;h++) {
                let w=true;
                for (let x=0;x<5;x++) {
                    let tile = getTile(h, x)
                    if(!tile.CROSSED) {
                        w = false;
                    }
                }
    
                if(w) {
                    win = true;
                }
            }
    
            for (let v=0;v<5;v++) {
                let w=true;
                for (let y=0;y<5;y++) {
                    let tile = getTile(y, v)
                    if(!tile.CROSSED) {
                        w = false;
                    }
                }
    
                if(w) {
                    win = true;
                }
            }
    
            return win;
        }
    }

    generateBoardFromList() {

        let range = this.tileList.length;
        let usedIndexes = [];
        let posX = 0;
        let posY = 0;
        var index = 0;

        var count = 0;

        var sortedArray = this.shuffleArray(this.tileList);
        

        for (let x=0;x<this.BOARD_WIDTH;x++) {
            for (let y=0;y<this.BOARD_HEIGHT;y++) {

                if (count == 12) {
                    this.BOARD.push(new Tile("", x, y));
                } else {
                    this.BOARD.push(new Tile(this.tileList[count], x, y));
                }

                count++;

            }
        }

    }

    getTile(x, y) {
        for (let t=0;t<this.BOARD.length;t++) {
            if (this.BOARD[t].POSITION_X === x && this.BOARD[t].POSITION_Y === y) {
                return this.BOARD[t];
            }
        }
    }

    shuffleArray(a) {

        for (let i=a.length-1;i>=0;i--) {
            let randomIndex = Math.floor((Math.random() * (a.length -1)) + 0);
            let itemAtIndex = a[randomIndex];

            a[randomIndex] = a[i];
            a[i] = itemAtIndex;
        }

        return a;
    }

    


}

export default Board;