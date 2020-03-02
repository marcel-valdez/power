import {Winner, MoveType, Side, PieceType} from '../core/power.common.mjs';
import {applyProps} from '../core/pieces.mjs';
import utils from '../core/utils.mjs';

const DEFAULT_STATE = Object.freeze({
  position: [0, 0], power: 0, side: Side.WHITE, canCastle: true
});

function King(state = DEFAULT_STATE) {
  const _state = Object.freeze(
    Object.assign({ type: PieceType.KING }, DEFAULT_STATE, state));

  applyProps(this, _state);

  this.copy = (newState) => {
    return new King(Object.assign({}, _state, newState));
  };

  this.markMoved = () => {
    return this.copy({ canCastle: false });
  };

  this.isAlly = (other) => this.side == other.side;

  this.computeMoveType = (board, x, y) => {
    const deltaX = Math.abs(x - this.x);
    const deltaY = Math.abs(y - this.y);

    if (x === this.x && y === this.y) {
      utils.warn('Tried to move King into same place.');
      return MoveType.INVALID; // Cannot stay in place
    }

    if (!board.isWithinBoundaries(x, y)) {
      utils.warn('Tried to move King outside of boundaries.');
      return MoveType.INVALID;
    }

    // handle castling
    if (this.canCastle && deltaY == 0 && deltaX > 1) {
      const midX = Math.min(this.x, x) + 1;
      if (board.containsPieceAt(midX, y)) {
        utils.warn('Kings cannot skip pieces.');
        return MoveType.INVALID;
      }

      const maybeRook = board.getPieceAt(x, y);
      if (!(typeof maybeRook === 'undefined') &&
          maybeRook.type == PieceType.ROOK &&
          this.isAlly(maybeRook) &&
          maybeRook.canCastle) {
        return MoveType.CASTLE;
      }
    }

    if (deltaX > 1 || deltaY > 1) {
      utils.warn('Tried to move king more than 1 square.');
      return MoveType.INVALID;
    }

    if (board.containsPieceAt(x, y)) {
      if (this.isAlly(board.getPieceAt(x, y))) {
        utils.warn('Kings cannot sacrifice allies.');
        return MoveType.INVALID;
      } else {
        return MoveType.ATTACK;
      }
    } else {
      return MoveType.MOVE;
    }
  };

  return this;
}

export { King };
