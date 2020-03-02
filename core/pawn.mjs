import {Winner, MoveType, Side, PieceType} from '../core/power.common.mjs';
import {applyProps} from '../core/pieces.mjs';
import utils from '../core/utils.mjs';

const DEFAULT_STATE = Object.freeze({
  position: [0, 0], power: 0, side: Side.WHITE
});

function Pawn(state = DEFAULT_STATE) {
  const _state = Object.freeze(
    Object.assign({ type: PieceType.PAWN }, DEFAULT_STATE, state));

  applyProps(this, _state);

  this.copy = (newState) => {
    return new Pawn(Object.assign({}, _state, newState));
  };

  this.isAlly = (other) => this.side === other.side;

  this.isFoe = (other) => !this.isAlly(other);

  const handleDiagonalMove = (board, x, y) => {
    if (!board.containsPieceAt(x, y)) {
      const enPassant = board.enPassant;
      const boardHasEnPassant = enPassant && this.isFoe(enPassant);
      if (boardHasEnPassant) {
        const enPassantAligns = enPassant.x == x &&
              ((this.side == Side.WHITE && y == enPassant.y - 1) ||
               (this.side == Side.BLACK && y == enPassant.y + 1));
        if (enPassantAligns) {
          return MoveType.EN_PASSANT_ATTACK;
        }
      }
      utils.warn('Cannot move in diagonal. Only attack or sacrifice.');
      return MoveType.INVALID;
    } else {
      const otherPiece = board.getPieceAt(x, y);
      if (this.isAlly(otherPiece)) {
        return MoveType.SACRIFICE;
      } else {
        if ((y === 0 && this.side === Side.WHITE) ||
            (y === 7 && this.side === Side.BLACK)) {
          return MoveType.PROMOTION_ATTACK;
        } else {
          return MoveType.ATTACK;
        }
      }
    }
  };

  const isInvalidTranslation = (board, x, y) => {
    const deltaX = Math.abs(x - this.x);
    const deltaY = Math.abs(y - this.y);

    if (x === this.x && y === this.y) {
      utils.warn('Tried to move Pawn into same place.');
      return true; // Cannot stay in place
    }

    if (!board.isWithinBoundaries(x, y)) {
      utils.warn('Tried to move Pawn outside of boundaries.');
      return true;
    }

    if ((this.side === Side.WHITE && y > this.y) ||
        (this.side === Side.BLACK && y < this.y)) {
      utils.warn('Illegal move: Tried to move Pawn backwards.');
      return true;
    }

    if (deltaX > 0 && deltaY === 0) {
      utils.warn('Illegal move: Tried to move Pawn sideways.');
      return true;
    }

    if (deltaY > 2) {
      utils.warn('Tried to move Pawn more than two squares away.');
      return true; // Cannot move more than 2 squares
    }

    if (deltaX > 1) {
      utils.warn('Pawns cannot move more than 1 square in x-axis.');
      return true;
    }

    if (deltaX === 1 && deltaY >= 2) {
      utils.warn('Pawns cannot move in L patterns.');
      return true; // L moves not allowed
    }

    return false;
  };

  const handleForwardsMove = (board, x, y) => {
    const deltaX = Math.abs(x - this.x);
    const deltaY = Math.abs(y - this.y);

    if (deltaY === 2) {
      if ((this.side === Side.WHITE && board.containsPieceAt(x, y + 1)) ||
          (this.side === Side.BLACK && board.containsPieceAt(x, y - 1))) {
        utils.warn('Pawns cannot skip pieces');
        return MoveType.INVALID;
      }
    }

    // Single square moveType.
    if (deltaY >= 1) {
      if (board.containsPieceAt(x, y)) {
        utils.warn('Pawns cannot attack immediate squares.');
        return MoveType.INVALID; // Cannot attack immediate squares.
      } else {
        if ((this.side === Side.WHITE && y === 0) ||
            (this.side === Side.BLACK && y === 7)) {
          return MoveType.PROMOTION;
        } else {
          return MoveType.MOVE;
        }
      }
    }

    utils.warn(
      `Illegal pawn move from (${this.x},${this.y}) to (${x},${y}).`);
    return MoveType.INVALID;
  };

  this.computeMoveType = (board, x, y) => {
    const deltaX = Math.abs(x - this.x);
    const deltaY = Math.abs(y - this.y);

    if (isInvalidTranslation(board, x, y)) {
      return MoveType.INVALID;
    }

    if (deltaX === 1 && deltaY === 1) {
      return handleDiagonalMove(board, x, y);
    }

    return handleForwardsMove(board, x, y);
  };

  return this;
}

export { Pawn };
