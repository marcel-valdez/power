window.di.inject(({Winner, MoveType, Side}) => {
    const xProp = {
        get() { return this.state.position[0]; }
    };

    const yProp = {
        get() { return this.state.position[1]; }
    };

    function Knight(state = {
        position: [0,0], power: 0, alive: true, side: Side.WHITE
        }) {
            this.state = Object.assign({}, state);

            this.copy = (newState) => {
                const copyState = Object.assign({}, this.state, newState)
                return Knight(copyState);
            }

            Object.defineProperty(this, 'x', xProp);
            Object.defineProperty(this, 'y', yProp);

            this.reducePower = () => this.copy({ power: this.state.power - 1 });

            this.isAlive = () => this.state.isAlive;

            this.kill = () => this.copy({ isAlive: false, power: 0, position: [-1, -1] });

            this.isAlly = (other) => this.state.side == other.state.side;

            this.isEnemy = (other) => !this.isAlly(other);

            this.computeMoveType = (board, x, y) => {
                const deltaX = Math.abs(x - this.x);
                const deltaY = Math.abs(y - this.y);

                if (x == this.x && y == this.y) {
                    return MoveType.INVALID; // Cannot stay in place
                }

                if (!board.isWithinBoundaries(x, y)) {
                    return MoveType.INVALID;
                }

                if (deltaX > 2 || deltaY > 2) {
                    return MoveType.INVALID; // Cannot move more than 2 squares
                }

                if ((deltaX == 1 && deltaY == 2) || (deltaY == 1 && deltaX == 2)) {
                    return MoveType.INVALID; // L moves not allowed
                }

                if (deltaX <= 1 && deltaY <= 1) { // Single square moveType.
                    if (board.containsPieceAt(x, y)) {
                        return MoveType.INVALID; // Cannot attack immediate squares.
                    } else {
                        return MoveType.MOVE;
                    }
                }

                if (
                    (deltaX == 0 && !board.containsPieceAt(x, this.y + (y - this.y))) // Vertical skip, no piece.
                || (deltaY == 0 && !board.containsPieceAt(this.x + (x - this.x), y)) // Horizontal skip, no piece.
                ) {
                    return MoveType.INVALID;
                } else {
                    if (board.containsPieceAt(x, y)) {
                        if (this.isAlly(board.getPieceAt(x, y))) {
                            return MoveType.SACRIFICE;
                        } else {
                            return MoveType.ATTACK;
                        }
                    } else {
                        return MoveType.MOVE;
                    }
                }
            };

            return this;
    }

    return {
        Knight,
    };
});
