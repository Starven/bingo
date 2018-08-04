import Board from './Board';
import Tile from './Tile';

class Session{
    constructor(roomCode, players) {
        this.ROOM_CODE = roomCode;
        this.PLAYERS = players;

        this.PLAYER_HOST = players[0];

        this.TILE_LIST = ["1", "2", "3", "4", "5",
                            "6", "7", "8", "9", "10",
                        "11", "12", "13", "14", "15",
                        "16", "17", "18", "19", "20",
                        "21", "22", "23", "24", "25",
                        "26", "27", "28", "29", "30",
                        "31", "32", "33", "34", "35",
                        "36", "37", "38", "39", "40",
                        "41", "42", "43", "44", "45",
                        "46", "47", "48", "49", "50"];

        this.BOARDS = [];
        this.BOARDS.push(new Board(roomCode, this.TILE_LIST, 5, 5, this.PLAYER_HOST));

        this.GAME_WON = false;

        this.checkWin = function() {
            for (let b=0;b<this.BOARDS.length;b++) {
                if (this.BOARDS[b].checkForWin()) {
                    return true;
                }
            }
    
            return false;
        }
    }

    getBoard() {
        return this.BOARDS;
    }

    addPlayer(player) {
        this.PLAYERS.push(player);
        this.BOARDS.push(new Board(this.ROOM_CODE, this.TILE_LIST, 5, 5, player));
    }

    getRoomCode() {
        return this.ROOM_CODE;
    }

   
}

export default Session;