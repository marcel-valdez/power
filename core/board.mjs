import {Winner, PieceType, MoveType, Side} from '../core/power.common.mjs';
import utils from '../core/utils.mjs';
import {Knight} from '../core/knight.mjs';
import {Pawn} from '../core/pawn.mjs';

const STARTING_BOARD = Object.freeze([
  [
    null,
    new Knight({ position: [1, 0], side: Side.BLACK }),
    null,
    new Knight({ position: [3, 0], side: Side.BLACK }),
    null
  ],
  [
    new Pawn({ position: [0, 1], side: Side.BLACK }),
    new Pawn({ position: [1, 1], side: Side.BLACK }),
    new Pawn({ position: [2, 1], side: Side.BLACK }),
    new Pawn({ position: [3, 1], side: Side.BLACK }),
    new Pawn({ position: [4, 1], side: Side.BLACK }),
  ],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [
    new Pawn({ position: [0, 6], side: Side.WHITE }),
    new Pawn({ position: [1, 6], side: Side.WHITE }),
    new Pawn({ position: [2, 6], side: Side.WHITE }),
    new Pawn({ position: [3, 6], side: Side.WHITE }),
    new Pawn({ position: [4, 6], side: Side.WHITE }),
  ],
  [
    null,
    new Knight({ position: [1, 7], side: Side.WHITE }),
    null,
    new Knight({ position: [3, 7], side: Side.WHITE }),
    null
  ],
]);

function attack(attacker, defender) {
  let winner;
  if (attacker.type === PieceType.KING) {
    winner = determineWinner(attacker.power, 0);
  } else if (defender.type === PieceType.KING) {
    winner = determineWinner(0, defender.power);
  } else {
    winner = determineWinner(attacker.power, defender.power);
  }

  if (winner === Winner.ATTACKER) {
    return {
      result: winner,
      winner: attacker.copy({
        power: attacker.power - 1,
        position: defender.position
      })
    };
  } else {
    return {
      result: winner,
      winner: defender.copy({ power: defender.power - 1 })
    };
  }
}

function determineWinner(attackPower, defendPower) {
  const winOdds = computeWinOdds(attackPower, defendPower);
  if (realizeOdds(winOdds)) {
    return Winner.ATTACKER;
  } else {
    return Winner.DEFENDER;
  }
}

function computeWinOdds(attackPower, defendPower) {
  const delta = 1 + Math.abs(attackPower - defendPower);
  const odds = 1 / (2**delta);

  if (attackPower >= defendPower) {
    return 1 - odds;
  } else {
    return odds;
  }
}

function realizeOdds(winOdds) {
  return Math.random() < winOdds;
}

function computeSacrificePower(ownerPower, sacrificePower) {
  if (ownerPower < 0) {
    if (ownerPower > sacrificePower) {
      return ownerPower;
    } else if (ownerPower === sacrificePower) {
      return ownerPower + 1;
    } else {
      return ownerPower + (sacrificePower - ownerPower);
    }
  } else {
    if (sacrificePower < 0) {
      return ownerPower;
    } else {
      return ownerPower + sacrificePower + 1;
    }
  }
}

function promotePawn() {
  // TODO: Implement pawn promotion
}

function sacrifice(owner, sacrificed) {
  return owner.copy({
    power: computeSacrificePower(owner.power, sacrificed.power)
  });
}

function setPiece(rows, newPiece, x, y) {
  return rows.map((row, _y) => {
    if (_y === y) {
      return row.map((cell, _x) => {
        if (_x === x) {
          if (newPiece == null) {
            return null;
          } else {
            return newPiece.copy({ position: [_x, _y] });
          }
        } else {
          return cell;
        }
      });
    } else {
      return row;
    }
  });
}

function removePiece(squares, x, y) {
  return setPiece(squares, null, x, y);
}

function movePiece(squares, src, dst) {
  const [x1, y1] = src;
  const [x2, y2] = dst;
  const srcPiece = squares[y1][x1];
  if (srcPiece === null || srcPiece === undefined) {
    throw `There is no piece to move at (${src})!!`;
  }

  const pickedupPieceSquares = removePiece(squares, x1, y1);
  const movedPiece = srcPiece.copy({ position: dst });
  const droppedPieceSquares =
        setPiece(pickedupPieceSquares, movedPiece, x2, y2);

  let enPassant = null;
  if (movedPiece.type === PieceType.PAWN && Math.abs(y1 - y2) == 2) {
    enPassant = movedPiece;
  }

  return {
    squares: droppedPieceSquares,
    enPassant: movedPiece
  };
}

function Board(state = { squares: STARTING_BOARD, enPassant: null }) {
  const _state = Object.freeze(Object.assign({}, state));

  this.setup = () => {
    // NO-OP for now
  };

  Object.defineProperty(this, 'enPassant', {
    get() { return _state.enPassant; }
  });

  this.copy = (copyState = null) => {
    if (copyState === null) {
      return this;
    }

    const newState = Object.assign({}, _state, copyState);
    return new Board(newState);
  };

  const doMove = (src, dst) => {
    const { squares, enPassant } = movePiece(_state.squares, src, dst);
    return this.copy({ squares, enPassant });
  };

  const doAttack = (src, dst) => {
    const [x1, y1] = src;
    const [x2, y2] = dst;
    const srcPiece = this.getPieceAt(x1, y1);
    const dstPiece = this.getPieceAt(x2, y2);
    const result = attack(srcPiece, dstPiece);
      return this.copy({
        // remove piece from src
        squares: removePiece(
          // set winner piece at dst
          setPiece(_state.squares, result.winner, x2, y2),
          x1, y1),
        enPassant: null
      });
  };

  const doSacrifice = (src, dst) => {
    const [x1, y1] = src;
    const [x2, y2] = dst;
    const srcPiece = this.getPieceAt(x1, y1);
    const dstPiece = this.getPieceAt(x2, y2);
    const newPiece = sacrifice(srcPiece, dstPiece);
      return this.copy({
        squares: removePiece(
          setPiece(_state.squares, newPiece, x2, y2),
          x1, y1
        ),
        enPassant: null
      });
  };

  const doEnPassant = (src, dst) => {
    // HERE BE DRAGONS: UNTESTED CODE
    const [x1, y1] = src;
    const [x2, y2] = dst;
    const srcPiece = this.getPieceAt(x1, y1);
    const dstPiece = this.getPieceAt(x2, y2);
    const { result, winner } = attack(srcPiece, this.enPassant);
    let squares = null;
    if (result === Winner.ATTACKER) {
      // move attacking pawn
      squares = setPiece(
        removePiece(
          // kill en passant pawn
          removePiece(_state.squares, this.enPassant.x, this.enPassant.y),
          x1, y1),
        winner,
        x2, y2);
    } else {
      squares = setPiece(
        removePiece(_state.squares, x1, y1),
        winner,
        this.enPassant.x, this.enPassant.y);
    }

    return this.copy({
      squares,
      enPassant: null
    });
  };

  this.makeMove = (src, dst) => {
    const [x1, y1] = src;
    const [x2, y2] = dst;
    if (x1 === x2 && y1 === y2) {
      throw `Source (${src}) and destination (${dst}) for a move can't be the same.`;
    }

    const srcPiece = this.getPieceAt(x1, y1);
    const dstPiece = this.getPieceAt(x2, y2);
    if (srcPiece === null || srcPiece === undefined) {
      utils.warn(`There is no piece to move at (${src}).`);
      return this;
    }

    const moveType = srcPiece.computeMoveType(this, x2, y2);
    switch(moveType) {
    case MoveType.INVALID:
      utils.info(`Invalid move from (${src}) to (${dst})`);
      return this;
    case MoveType.ATTACK:
      return doAttack(src, dst);
    case MoveType.MOVE:
      return doMove(src, dst);
    case MoveType.SACRIFICE:
      return doSacrifice(src, dst);
    case MoveType.EN_PASSANT_ATTACK:
      return doEnPassant(src, dst);
    default:
      throw `${moveType} is not supported.`;
    }
  };

  this.getRow = (rowIdx) => {
    if (rowIdx < 0 || rowIdx > _state.squares.length) {
      throw `Row indices can only be values 0-7. Got: ${rowIdx}.`;
    }

    return Object.freeze(_state.squares[rowIdx]);
  };

  this.getRows = () => Object.freeze(_state.squares);

  this.getPieceAt = (x,y) => _state.squares[y][x];

  this.containsPieceAt = (x, y) => this.getPieceAt(x, y) !== null;

  this.isWithinBoundaries = (x, y) => x >= 0 && y >= 0 &&
    _state.squares.length > y && _state.squares[0].length > x;

  this.setup();
  return this;
}

export { Board, computeWinOdds, computeSacrificePower };
