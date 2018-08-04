"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //Clients board, generates and randomises tiles from selected list

var _Tile = require("./Tile");

var _Tile2 = _interopRequireDefault(_Tile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Board = function () {
    function Board(roomCode, tileList, boardWidth, boardHeight, owner) {
        _classCallCheck(this, Board);

        this.BOARD_WIDTH = boardWidth;
        this.BOARD_HEIGHT = boardHeight;

        this.roomCode = roomCode;
        this.tileList = tileList;

        this.BOARD = [];
        this.OWNER = owner;
        this.generateBoardFromList();

        this.checkForWin = function () {
            //check horizontal win

            var win = false;

            for (var h = 0; h < 5; h++) {
                var w = true;
                for (var x = 0; x < 5; x++) {
                    var tile = getTile(h, x);
                    if (!tile.CROSSED) {
                        w = false;
                    }
                }

                if (w) {
                    win = true;
                }
            }

            for (var v = 0; v < 5; v++) {
                var _w = true;
                for (var y = 0; y < 5; y++) {
                    var _tile = getTile(y, v);
                    if (!_tile.CROSSED) {
                        _w = false;
                    }
                }

                if (_w) {
                    win = true;
                }
            }

            return win;
        };
    }

    _createClass(Board, [{
        key: "generateBoardFromList",
        value: function generateBoardFromList() {

            var range = this.tileList.length;
            var usedIndexes = [];
            var posX = 0;
            var posY = 0;
            var index = 0;

            var count = 0;

            var sortedArray = this.shuffleArray(this.tileList);

            for (var x = 0; x < this.BOARD_WIDTH; x++) {
                for (var y = 0; y < this.BOARD_HEIGHT; y++) {

                    if (count == 12) {
                        this.BOARD.push(new _Tile2.default("", x, y));
                    } else {
                        this.BOARD.push(new _Tile2.default(this.tileList[count], x, y));
                    }

                    count++;
                }
            }
        }
    }, {
        key: "getTile",
        value: function getTile(x, y) {
            for (var t = 0; t < this.BOARD.length; t++) {
                if (this.BOARD[t].POSITION_X === x && this.BOARD[t].POSITION_Y === y) {
                    return this.BOARD[t];
                }
            }
        }
    }, {
        key: "shuffleArray",
        value: function shuffleArray(a) {

            for (var i = a.length - 1; i >= 0; i--) {
                var randomIndex = Math.floor(Math.random() * (a.length - 1) + 0);
                var itemAtIndex = a[randomIndex];

                a[randomIndex] = a[i];
                a[i] = itemAtIndex;
            }

            return a;
        }
    }]);

    return Board;
}();

exports.default = Board;