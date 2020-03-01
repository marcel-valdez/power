import {Winner, MoveType, Side, PieceType} from '../core/power.common.mjs';
import {applyProps} from '../core/pieces.mjs';
import utils from '../core/utils.mjs';

const DEFAULT_STATE = Object.freeze({
  position: [0, 0], power: 0, alive: true, side: Side.WHITE
});

function Knight(state = DEFAULT_STATE) {
  const _state = Object.freeze(
    Object.assign({ type: PieceType.KNIGHT }, DEFAULT_STATE, state));

  applyProps(this, _state);

  this.copy = (newState) => new Knight(Object.assign({}, _state, newState));

  this.isAlly = (other) => this.side == other.side;

  this.computeMoveType = (board, x, y) => {
    const deltaX = Math.abs(x - this.x);
    const deltaY = Math.abs(y - this.y);

    if (x === this.x && y === this.y) {
      utils.warn('Tried to move Knight into same place.');
      return MoveType.INVALID; // Cannot stay in place
    }

    if (!board.isWithinBoundaries(x, y)) {
      utils.warn('Tried to move Knight outside of boundaries.');
      return MoveType.INVALID;
    }

    if (deltaX > 2 || deltaY > 2) {
      utils.warn('Tried to move Knight more than two squares away.');
      return MoveType.INVALID; // Cannot move more than 2 squares
    }

    if ((deltaX == 1 && deltaY == 2) || (deltaY == 1 && deltaX == 2)) {
      utils.warn('L moves not allowed for Knights.');
      return MoveType.INVALID; // L moves not allowed
    }

    if (deltaX <= 1 && deltaY <= 1) { // Single square moveType.
      if (board.containsPieceAt(x, y)) {
        utils.warn('Knights cannot attack immediate squares.');
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
      utils.warn('Tried skip square with Knight without a piece in between.');
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

