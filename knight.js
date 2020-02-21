import {Winner, MoveType, Side, PieceType} from './power.common.js';
import {applyProps} from './pieces.js';

function Knight(state = {
    position: [0,0], power: 0, alive: true, side: Side.WHITE
}) {
    const _state = Object.assign({ type: PieceType.KNIGHT }, state);
    applyProps(this, _state);

    this.copy = (newState) => {
        const copyState = Object.assign({}, _state, newState)
        return new Knight(copyState);
    }

    this.reducePower = () => this.copy({ power: this.power - 1 });

    this.kill = () => this.copy({ alive: false, power: 0, position: [-1, -1] });

    this.isAlly = (other) => this.side == other.side;

    this.isFoe = (other) => !this.isAlly(other);

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
            (deltaX === 0 && !board.containsPieceAt(x, this.y + (y - this.y)/2)) // Vertical skip, no piece.
            || (deltaY === 0 && !board.containsPieceAt(this.x + (x - this.x)/2, y)) // Horizontal skip, no piece.
            || (deltaY > 1 && deltaX > 1 && !board.containsPieceAt(this.x + (x - this.x)/2, this.y + (y - this.y)/2)) // Diagonal skip, no piece.
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

export { Knight };

