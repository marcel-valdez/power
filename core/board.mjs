// jshint esversion: 7

import {Knight} from '../core/knight.mjs';
import {
  Winner,
  PieceType,
  MoveType,
  Side,
  GameStatus,
} from '../core/power.common.mjs';
import {Rook} from '../core/rook.mjs';
import {Pawn} from '../core/pawn.mjs';
import {King} from '../core/king.mjs';
import utils from '../core/utils.mjs';

export const EngineOutcome = {
  NONE: 'NONE',
  ALWAYS_WIN: 'ALWAYS_WIN',
  ALWAYS_LOSE: 'ALWAYS_LOSE'
};

const STARTING_BOARD = Object.freeze([
  [
    new Rook({ position: [0, 0], side: Side.BLACK }),
    new Knight({ position: [1, 0], side: Side.BLACK }),
    new King({ position: [2, 0], side: Side.BLACK }),
    new Knight({ position: [3, 0], side: Side.BLACK }),
    new Rook({ position: [4, 0], side: Side.BLACK }),
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
    new Rook({ position: [0, 7], side: Side.WHITE }),
    new Knight({ position: [1, 7], side: Side.WHITE }),
    new King({ position: [2, 7], side: Side.WHITE }),
    new Knight({ position: [3, 7], side: Side.WHITE }),
    new Rook({ position: [4, 7], side: Side.WHITE })
  ],
]);

function attack(attacker, defender, predefinedOutcome = EngineOutcome.NONE) {
  let winner = null;
  if (predefinedOutcome === EngineOutcome.ALWAYS_WIN) {
    winner = Winner.ATTACKER;
  } else if (predefinedOutcome === EngineOutcome.ALWAYS_LOSE) {
    winner = Winner.DEFENDER;
  } else {
    winner = determineWinner(attacker, defender, predefinedOutcome);
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

function determineWinner(attacker, defender) {
  const winOdds = computePieceWinOdds(attacker, defender);
  if (realizeOdds(winOdds)) {
    return Winner.ATTACKER;
  } else {
    return Winner.DEFENDER;
  }
}

function computePieceWinOdds(attacker, defender) {
  let attackerPower = attacker.power;
  let defenderPower = defender.power;
  if (attacker.type === PieceType.KING && defender.type !== PieceType.KING) {
    defenderPower = 0;
  } else if (defender.type === PieceType.KING &&
             attacker.type !== PieceType.KING) {
    attackerPower = 0;
  }

  return computeWinOdds(attackerPower, defenderPower);
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
            return newPiece.copy({ position: [_x, _y] }).markMoved();
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

  // DRAGONS BE HERE, UNTESTED CODE
  // TODO: Test this if statement
  let enPassant = null;
  if (movedPiece.type === PieceType.PAWN && Math.abs(y1 - y2) == 2) {
    enPassant = movedPiece;
  }

  return {
    squares: droppedPieceSquares,
    enPassant
  };
}

const DEFAULT_BOARD_STATE = {
  squares: STARTING_BOARD,
  enPassant: null,
  promotion: null,
  gameStatus: GameStatus.IN_PROGRESS
};

function Board(state = DEFAULT_BOARD_STATE) {

  const _state = Object.freeze(Object.assign({}, DEFAULT_BOARD_STATE, state));

  Object.defineProperty(this, 'enPassant', {
    get() { return _state.enPassant; }
  });

  Object.defineProperty(this, 'pendingPromotion', {
    get() { return _state.promotion !== null; }
  });

  Object.defineProperty(this, 'gameStatus', {
    get() { return _state.gameStatus; }
  });

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

  const doMove = (src, dst) => {
    const { squares, enPassant } = movePiece(_state.squares, src, dst);
    return this.copy({ squares, enPassant });
  };

  const computeGameStatus = (outcome, attacker, defender) => {
    let gameStatus = this.gameStatus;
    if (outcome.result === Winner.ATTACKER &&
        defender.type === PieceType.KING) {
      gameStatus = outcome.winner.side === Side.WHITE ?
        GameStatus.WHITE_WON : GameStatus.BLACK_WON;
    }

    if (outcome.result === Winner.DEFENDER &&
        attacker.type === PieceType.KING) {
      gameStatus = outcome.winner.side === Side.BLACK ?
        GameStatus.BLACK_WON : GameStatus.WHITE_WON;
    }

    return gameStatus;
  };

  const doAttack = (src, dst, predefinedOutcome = EngineOutcome) => {
    const [x1, y1] = src;
    const [x2, y2] = dst;
    const attacker = this.getPieceAt(x1, y1);
    const defender = this.getPieceAt(x2, y2);
    const result = attack(attacker, defender, predefinedOutcome);

    return this.copy({
      // remove piece from src
      squares: removePiece(
        // set winner piece at dst
        setPiece(_state.squares, result.winner, x2, y2),
        x1, y1),
      enPassant: null,
      gameStatus: computeGameStatus(result, attacker, defender)
    });
  };

  const doSacrifice = (src, dst) => {
    const [x1, y1] = src;
    const [x2, y2] = dst;
    const srcPiece = this.getPieceAt(x1, y1);
    const dstPiece = this.getPieceAt(x2, y2);

    // The king can't be sacrificed.
    if (dstPiece.type === PieceType.KING) {
      return this;
    }

    const newPiece = sacrifice(srcPiece, dstPiece);
    return this.copy({
      squares: removePiece(
        setPiece(_state.squares, newPiece, x2, y2),
        x1, y1
      ),
      enPassant: null
    });
  };

  const doEnPassantAttack = (src, dst, predefinedOutcome = EngineOutcome.NONE) => {
    // HERE BE DRAGONS: UNTESTED CODE
    const [x1, y1] = src;
    const [x2, y2] = dst;
    const srcPiece = this.getPieceAt(x1, y1);
    const { result, winner } = attack(srcPiece, this.enPassant, predefinedOutcome);
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

  const doPromotion = (src, dst) => {
    const [x2, y2] = dst;
    const movedPawn = doMove(src, dst);
    return movedPawn.copy({
      promotion: movedPawn.getPieceAt(x2, y2)
    });
  };

  const doPromotionAttack = (src, dst, predefinedOutcome = EngineOutcome.NONE) => {
    const [x2, y2] = dst;
    const atkBoard = doAttack(src, dst, predefinedOutcome);
    const winner = atkBoard.getPieceAt(x2, y2);
    const defender = this.getPieceAt(x2, y2);
    if (winner.type === PieceType.PAWN) {
      return doPromotion(src, dst).copy({
        gameStatus: computeGameStatus(
          { result: Winner.ATTACKER, winner },
          winner,
          defender)
      });
    } else {
      return atkBoard;
    }
  };

  const doCastle = (src, dst) => {
    const [x1] = src;
    const [x2, y2] = dst;
    const {squares: origSquares} = _state;
    const rook = this.getPieceAt(x2, y2);

    const rookX = Math.min(x1, x2) + 1;
    const { squares: movedKingSquares, enPassant } =
          movePiece(origSquares, src, dst);
    const castledSquares = setPiece(movedKingSquares, rook, rookX, y2);
    return this.copy({ squares: castledSquares, enPassant });
  };

  this.makeMove = (src, dst, predefinedOutcome = EngineOutcome.NONE) => {
    const [x1, y1] = src;
    const [x2, y2] = dst;
    if (x1 === x2 && y1 === y2) {
      throw `Source (${src}) and destination (${dst}) for a move can't be the same.`;
    }

    const srcPiece = this.getPieceAt(x1, y1);
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
      return doAttack(src, dst, predefinedOutcome);
    case MoveType.MOVE:
      return doMove(src, dst);
    case MoveType.SACRIFICE:
      return doSacrifice(src, dst);
    case MoveType.EN_PASSANT_ATTACK:
      return doEnPassantAttack(src, dst, predefinedOutcome);
    case MoveType.PROMOTION:
      return doPromotion(src, dst);
    case MoveType.PROMOTION_ATTACK:
      return doPromotionAttack(src, dst, predefinedOutcome);
    case MoveType.CASTLE:
      return doCastle(src, dst);
    default:
      throw `${moveType} is not supported.`;
    }
  };

  this.setPromotion = (pieceType = PieceType.ROOK) => {
    const [x,y] = [ _state.promotion.x, _state.promotion.y ];
    const promotionSide = _state.promotion.side;
    let promotedPiece;
    if (pieceType === PieceType.ROOK) {
      promotedPiece = new Rook({
        side: promotionSide,
        position: [x, y],
        power: 0
      });
    } else {
      promotedPiece = new Knight({
        side: promotionSide,
        position: [x, y],
        power: 0
      });
    }

    const newSquares =
          setPiece(_state.squares, promotedPiece, x, y);
    return this.copy({
      squares: newSquares,
      promotion: null
    });
  };

  this.copy = (copyState = null) => {
    if (copyState === null) {
      return this;
    }

    const newState = Object.assign({}, _state, copyState);
    return new Board(newState);
  };

  this.toJson = () => {
    const squares = this.getRows().map(
      row =>
        row.map(cell => {
          if (cell === null) {
            return null;
          } else {
            return cell.toJson();
          }
        }));

    const enPassant = _state.enPassant ? _state.enPassant.toJson() : null;
    const promotion = _state.promotion ? _state.promotion.toJson() : null;

    return {
      squares,
      enPassant,
      promotion,
      gameStatus: _state.gameStatus
    };
  };

  return this;
}

const fromJsonCell = (cellState) => {
  if (cellState === null) {
    return null;
  }

  switch(cellState.type) {
  case PieceType.PAWN:
    return Pawn.fromJson(cellState);
  case PieceType.KNIGHT:
    return Knight.fromJson(cellState);
  case PieceType.ROOK:
    return Rook.fromJson(cellState);
  case PieceType.KING:
    return King.fromJson(cellState);
  default:
    throw Error(`Unknown piece type: ${cellState.type}`);
  }
};

Board.fromJson = ({ squares, enPassant, promotion, gameStatus }) => {
  const bSquares = squares.map(
    (row) => row.map(cell => fromJsonCell(cell)));
  const bEnPassant = fromJsonCell(enPassant);
  const bPromotion = fromJsonCell(promotion);

  return new Board({
    squares: bSquares,
    enPassant: bEnPassant,
    promotion: bPromotion,
    gameStatus
  });
};

export {
  Board,
  computeWinOdds,
  computeSacrificePower,
  computePieceWinOdds,
};
