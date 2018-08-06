import Board from './Board';
import Tile from './Tile';

class Session{
    constructor(roomCode, players, size, listName) {
        this.ROOM_CODE = roomCode;
        this.PLAYERS = players;

        this.BOARD_SIZE = size;

        this.PLAYER_HOST = players[0];
/*
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

                        */

    if (listName == "Fortnite") {
        this.TILE_LIST = ["Open a Chest", "Open Ammo Crate", "Eliminate Opponent", "Shotgun Elim", "SMG Elim",
        "Find a Llama", "Use a Rift","AR Elim", "Pistol Elim", "Explosive Elim", 
        "Trap Kill", "Revive Teammate", "Reach Top 10", "Sniper Elim", "Full Health & Shields",
        "Drop Tilted Towers", "Drop Dusty Divot", "Drop Retail Row", "Drop Risky Reels", "Take Fall Damage",
        "Dance with Opponent", "Take Trap Damage", "Reach the Build Limit", "Eat an Apple", "Eat a Mushroom"];
    } else {
        this.TILE_LIST = ["Quack", "Fall to your Death", "Win a Round", "Win a Game", "Shotgun Kill",
                        "Mind Control Opponent", "Net Gun Opponent","Stomp Kill", "Survive a Bullet", "Grenade Kill", 
                        "Environmental Death", "Kill it with Fire", "Open a Locked Door", "Sniper Kill", "Pistol Kill",
                        "Kill Player through Door", "Sword Kill", "Item Kill", "Steal Opponents Hat", "Convert Opponent",
                        "One Shot Two Ducks", "Win Round with 0 Kills", "Chainsaw Kill", "Kill Every Enemy in a Round", "DUCK a bullet"];
    }

                       

        this.BOARDS = [];
        this.BOARDS.push(new Board(roomCode, this.TILE_LIST, this.BOARD_SIZE, this.BOARD_SIZE, this.PLAYER_HOST));

        this.GAME_WON = false;
        this.WINNER = {};

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
        this.BOARDS.push(new Board(this.ROOM_CODE, this.TILE_LIST, 3, 3, player));
    }

    getRoomCode() {
        return this.ROOM_CODE;
    }

   
}

export default Session;