import {PieceType} from '../core/power.common.mjs';
import utils from '../core/utils.mjs';

const applyProps = (piece, state) => {

  piece.toJson = () => state;

  piece.constructor.fromJson = (json) => {
    return new piece.constructor(json);
  };

  Object.defineProperty(piece, 'canCastle', {
    get() {
      return typeof state.canCastle !== 'undefined' && state.canCastle;
    }
  });

  Object.defineProperty(piece, 'x', {
    get() { return state.position[0]; }
  });

  Object.defineProperty(piece, 'y', {
    get() { return state.position[1]; }
  });

  Object.defineProperty(piece, 'side', {
    get() { return state.side; }
  });

  Object.defineProperty(piece, 'power', {
    get() { return state.power; }
  });

  Object.defineProperty(piece, 'type', {
    get() { return state.type; }
  });

  piece.markMoved = () => piece;

  piece.isBasicValidMove = (board, x, y) => {
    if (x === piece.x && y === piece.y) {
      utils.warn(`Tried to move ${piece.type} into same place.`);
      return false; // Cannot stay in place
    }

    if (!board.isWithinBoundaries(x, y)) {
      utils.warn(`Tried to move ${piece.type} outside of boundaries.`);
      return false;
    }

    if (board.containsPieceAt(x, y)) {
      const targetPiece = board.getPieceAt(x, y);
      if (piece.isAlly(targetPiece) && targetPiece.type == PieceType.KING) {
        return false;
      }
    }

    return true;
  };
};

export { applyProps };
