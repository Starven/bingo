class User{
    constructor(userID, username){

        this.ID = userID;
        this.USERNAME = username;

    }

    getUsername() {
        return this.USERNAME;
    }

    getID() {
        return this.ID;
    }

    setUsername(username) {
        this.USERNAME = username;
    }

    setID(id) {
        this.ID = id;
    }
}

export default User;