"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = function () {
    function User(userID, username) {
        _classCallCheck(this, User);

        this.ID = userID;
        this.USERNAME = username;
    }

    _createClass(User, [{
        key: "getUsername",
        value: function getUsername() {
            return this.USERNAME;
        }
    }, {
        key: "getID",
        value: function getID() {
            return this.ID;
        }
    }, {
        key: "setUsername",
        value: function setUsername(username) {
            this.USERNAME = username;
        }
    }, {
        key: "setID",
        value: function setID(id) {
            this.ID = id;
        }
    }]);

    return User;
}();

exports.default = User;