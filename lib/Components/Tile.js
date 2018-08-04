"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = function () {
    function Tile(tileText, posX, posY) {
        _classCallCheck(this, Tile);

        this.TEXT = tileText;
        this.POSITION_X = posX;
        this.POSITION_Y = posY;
        this.CROSSED = false;
        this.HOVERED = false;
    }

    _createClass(Tile, [{
        key: "getText",
        value: function getText() {
            return this.TEXT;
        }
    }, {
        key: "getPositionX",
        value: function getPositionX() {
            return this.POSITION_X;
        }
    }, {
        key: "getPositionY",
        value: function getPositionY() {
            return this.POSITION_Y;
        }
    }, {
        key: "getCrossed",
        value: function getCrossed() {
            return this.CROSSED;
        }
    }, {
        key: "crossTile",
        value: function crossTile() {
            this.CROSSED = true;
        }
    }, {
        key: "getHovered",
        value: function getHovered() {
            return this.HOVERED;
        }
    }]);

    return Tile;
}();

exports.default = Tile;