import {Winner, MoveType, Side, PieceType} from '../core/power.common.mjs';
import {applyProps} from '../core/pieces.mjs';
import utils from '../core/utils.mjs';

const DEFAULT_STATE = Object.freeze({
  position: [0, 0], power: 0, side: Side.WHITE, canCastle: true
});

function Rook(state = DEFAULT_STATE) {
  const _state = Object.freeze(
    Object.assign({ type: PieceType.ROOK }, DEFAULT_STATE, state));

  applyProps(this, _state);

  this.copy = (newState) => {
    return new Rook(Object.assign({}, _state, newState));
  };

  this.markMoved = () => {
    return this.copy({ canCastle: false });
  };

  this.isAlly = (other) => this.side == other.side;

  this.computeMoveType = (board, x, y) => {
    const deltaX = Math.abs(x - this.x);
    const deltaY = Math.abs(y - this.y);

    if (x === this.x && y === this.y) {
      utils.warn('Tried to move Rook into same place.');
      return MoveType.INVALID; // Cannot stay in place
    }

    if (!board.isWithinBoundaries(x, y)) {
      utils.warn('Tried to move Rook outside of boundaries.');
      return MoveType.INVALID;
    }

    if (deltaX > 0 && deltaY > 0) {
      utils.warn('Tried to move rook in a non-straight line.');
      return MoveType.INVALID;
    }

    if (deltaX > 1) {
      // check for pieces along the way on row
      const start = Math.min(this.x, x);
      const end = Math.max(this.x, x);
      for(let i = start + 1; i < end; i++) {
        if (board.containsPieceAt(i, y)) {
          utils.warn("Rooks can't skip pieces.");
          return MoveType.INVALID;
        }
      }
    }

    if (deltaY > 1) {
      // check for pieces along the way on column
      const start = Math.min(this.y, y);
      const end = Math.max(this.y, y);
      for(let i = start + 1; i < end; i++) {
        if (board.containsPieceAt(x, i)) {
          utils.warn("Rooks can't skip pieces.");
          return MoveType.INVALID;
        }
      }
    }

    if (board.containsPieceAt(x, y)) {
      if (this.isAlly(board.getPieceAt(x, y))) {
        return MoveType.SACRIFICE;
      } else {
        return MoveType.ATTACK;
      }
    } else {
      return MoveType.MOVE;
    }
  };

  return this;
}

export { Rook };
