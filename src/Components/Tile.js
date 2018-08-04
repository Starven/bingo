class Tile{
    constructor(tileText, posX, posY) {

        this.TEXT = tileText;
        this.POSITION_X = posX;
        this.POSITION_Y = posY;
        this.CROSSED = false;
        this.HOVERED = false;
    }

    getText() {
        return this.TEXT;
    }

    getPositionX() {
        return this.POSITION_X;
    }

    getPositionY() {
        return this.POSITION_Y;
    }

    getCrossed() {
        return this.CROSSED;
    }

    crossTile(){
        this.CROSSED = true;
    }

    getHovered() {
        return this.HOVERED;
    }
}

export default Tile;