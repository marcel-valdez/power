// jshint esversion: 6

import utils from '../core/utils.mjs';
import {
  GameStatus,
  MoveType,
  PieceType,
  Side
} from '../core/power.common.mjs';
import {
  computeWinOdds
} from '../core/board.mjs';
import {
  checkNotNullOrUndefined
} from '../core/preconditions.mjs';


export class BoardEvaluationError extends Error {
  constructor(message) {
    super(message);
  }
}

let PIECE_SCORES = {};
let PIECE_MOVES = {};

const PAWN_MOVES = [
  [ 0, 1 ], [ 0, 2 ],
  [ -1, 1 ], [ 1, 1 ],
];

const KNIGHT_MOVES = [
  // single square
  [0,1], [0,-1], [1,-1], [1,0], [1,1], [-1,-1], [-1,0], [-1,1],
  // two square
  [0,2], [0,-2], [2,-2], [2,0], [2,2], [-2,-2], [-2,0], [-2,2],
];

const ROOK_MOVES = [
  // vertical moves
  [0,1], [0,2], [0,3], [0,4], [0,5], [0,6], [0,7],
  [0,-1], [0,-2], [0,-3], [0,-4], [0,-5], [0,-6], [0,-7],
  // horizontal moves
  [1,0], [2,0], [3,0], [4,0], [5,0], [6,0], [7,0],
  [-1,0], [-2,0], [-3,0], [-4,0], [-5,0], [-6,0], [-7,0],
];

const KING_MOVES = [
  // single square
  [0,1], [0,-1], [1,-1], [1,0], [1,1], [-1,-1], [-1,0], [-1,1],
  // castle
  [-2,0], [2,0]
];

const initialize = () => {
  PIECE_SCORES[PieceType.PAWN] = 1.0;
  PIECE_SCORES[PieceType.KNIGHT] = 2.5;
  PIECE_SCORES[PieceType.ROOK] = 5.0;
  PIECE_SCORES[PieceType.KING] = ((1*8) + (2.5*2) + (5.0*2)) * 8;

  PIECE_MOVES[PieceType.PAWN] = PAWN_MOVES;
  PIECE_MOVES[PieceType.KNIGHT] = KNIGHT_MOVES;
  PIECE_MOVES[PieceType.ROOK] = ROOK_MOVES;
  PIECE_MOVES[PieceType.KING] = KING_MOVES;
};

const roundToMillis = (number) => {
  return Math.trunc(number * 1000) / 1000;
};

const getRookMultiplierForXY = (rook) => {
  checkNotNullOrUndefined(rook);
  const {x,y} = rook;
  let horizontalMultiplier = 0;
  let verticalMultiplier = 0;

  if (x === 2) {
    horizontalMultiplier += 0.25;
  } else if (x === 1 || x === 3) {
    horizontalMultiplier += 0.1;
  }

  if (rook.side === Side.WHITE) {
    if (y === 0) {
      verticalMultiplier += 0.25;
    } else if (y === 1) {
      verticalMultiplier += 0.5;
    }
  } else {
    if (y === 7) {
      verticalMultiplier += 0.25;
    } else if (y === 6) {
      verticalMultiplier += 0.5;
    }
  }

  return horizontalMultiplier + verticalMultiplier;
};

const getRookMovementMultiplier = (board, rook) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(rook);

  const rookActions = genActionsForPiece(board, rook);
  const actionsCount = rookActions.length;
  const usefulAttackCount = rookActions.filter(
    action => action.type === MoveType.ATTACK)
    .map(({dst}) => dst)
    .map(([x,y]) => {
      const defender = board.getPieceAt(x, y);
      if (defender.type === PieceType.KING) {
        return 4;
      }

      if (defender.type === PieceType.ROOK &&
          defender.power < rook.power) {
        return (rook.power - defender.power) * 2;
      }

      if (defender.type === PieceType.KNIGHT &&
          defender.power < rook.power) {
        return rook.power - defender.power;
      }

      return 0;
    })
    .reduce((a, b) => a + b, 0);


  return (actionsCount + usefulAttackCount / 20.0) / 2.0;
};

const getRookPositionMultiplier = (board, rook) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(rook);

  const xyMultiplier = getRookMultiplierForXY(rook);
  const movementMultiplier = getRookMovementMultiplier(board, rook);

  return movementMultiplier + xyMultiplier;
};

const getKnightMovementMultiplier = (board, knight) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(knight);

  const actions = genActionsForPiece(board, knight);
  const moveCount = actions.length;
  const usefulAttackCount = actions
    .filter((action) => action.type === MoveType.ATTACK)
    .map(({dst}) => dst)
    .map(([x,y]) => {
      const defender = board.getPieceAt(x,y);
      if (defender.type === PieceType.ROOK) {
        return 2 + (Math.max(0, knight.power - defender.power) * 3);
      }

      if (defender.type === PieceType.KING) {
        return 4;
      }

      if (defender.type === PieceType.KNIGHT &&
          defender.power < knight.power) {
        return (knight.power - defender.power) * 2;
      }

      if (defender.type === PieceType.PAWN &&
          defender.power < knight.power) {
        return knight.power - defender.power;
      }

      return 0;
    })
    .reduce((a, b) => a + b, 0);

  return ((moveCount + usefulAttackCount) / 20.0) / 2.0;
};

const getKnightXYMultiplier = (board, knight) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(knight);

  const {x,y} = knight;
  let horizontalMultiplier = 0;
  let verticalMultiplier = 0;

  if (x === 2) {
    horizontalMultiplier += 0.25;
  } else if (x === 1 || x === 3) {
    horizontalMultiplier += 0.1;
  }

  if (knight.side === Side.WHITE) {
    if (y === 0) {
      verticalMultiplier += 0.1;
    } else if (y === 1 || y === 3) {
      verticalMultiplier += 0.33;
    } else if (y === 2) {
      verticalMultiplier += 0.5;
    }
  } else {
    if (y === 7) {
      verticalMultiplier += 0.1;
    } else if (y === 6 || y === 4) {
      verticalMultiplier += 0.33;
    } else if (y === 5) {
      verticalMultiplier += 0.5;
    }
  }

  return horizontalMultiplier + verticalMultiplier;
};

const getKnightPositionMultiplier = (board, knight) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(knight);

  const xyMultiplier = getKnightXYMultiplier(board, knight);
  const moveMultiplier = getKnightMovementMultiplier(board, knight);
  return xyMultiplier + moveMultiplier;
};

const getPawnPositionMultiplier = (board, pawn) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(pawn);

  const {x,y} = pawn;
  let horizontalMultiplier = 0;
  let verticalMultiplier = 0;

  if (x === 2) {
    horizontalMultiplier += 0.25;
  } else if (x === 1 || x === 3) {
    horizontalMultiplier += 0.1;
  }

  if (pawn.side === Side.WHITE) {
    if (y === 5) {
      verticalMultiplier += 0.1;
    } else if (y === 4) {
      verticalMultiplier += 0.2;
    } else if (y === 3) {
      verticalMultiplier += 0.25;
    } else if (y === 2) {
      verticalMultiplier += 0.33;
    } else if (y === 1) {
      verticalMultiplier += 0.5;
    }
  } else {
    if (y === 2) {
      verticalMultiplier += 0.1;
    } else if (y === 3) {
      verticalMultiplier += 0.2;
    } else if (y === 4) {
      verticalMultiplier += 0.25;
    } else if (y === 5) {
      verticalMultiplier += 0.33;
    } else if (y === 6) {
      verticalMultiplier += 0.5;
    }
  }

  return horizontalMultiplier + verticalMultiplier;
};

const getMultiplierForPiece = (board, piece) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(piece);

  let positionMultiplier = 0;
  switch(piece.type) {
  case PieceType.KNIGHT:
    positionMultiplier = getKnightPositionMultiplier(board, piece);
    break;
  case PieceType.ROOK:
    positionMultiplier = getRookPositionMultiplier(board, piece);
    break;
  case PieceType.PAWN:
    positionMultiplier = getPawnPositionMultiplier(board, piece);
    break;
  }
  return roundToMillis(1 + computeWinOdds(piece.power, 0) + positionMultiplier);
};

const getValueForPiece = (board, side, piece) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(side);
  checkNotNullOrUndefined(piece);

  if (utils.isNullOrUndefined(piece)) {
    return 0;
  }

  const pieceValue = PIECE_SCORES[piece.type];
  const pieceScore = pieceValue * getMultiplierForPiece(board, piece);
  if (piece.side === side) {
    return pieceScore;
  } else {
    return -pieceScore;
  }
};

const gameEndedValue = (gameStatus, side) => {
  checkNotNullOrUndefined(gameStatus);
  checkNotNullOrUndefined(side);

  const winScore = PIECE_SCORES[PieceType.KING];
  if (gameStatus === GameStatus.WHITE_WON) {
    return side === Side.WHITE ? winScore : -winScore;
  } else if (gameStatus === GameStatus.BLACK_WON) {
    return side === Side.BLACK ? winScore : -winScore;
  } else {
    throw new BoardEvaluationError(
      `Invalid terminal game status: ${gameStatus}`);
  }
};

const genActionsForPiece = (board, piece) => {
  const {x, y} = piece;
  const pieceMoves = PIECE_MOVES[piece.type];
  return pieceMoves
    .map(([dx,dy]) => [
      dx,
      piece.side === Side.WHITE ? -dy : dy
    ])
    .map(([dx,dy]) => [x+dx, y+dy])
    .map(([x2, y2]) => ({
      src: [x, y],
      dst: [x2, y2],
      type: piece.computeMoveType(board, x2, y2)
    }))
    .filter((action) => action.type !== MoveType.INVALID);
};

export const genActions = (board, side) => {
  const sidePieces = board.getRows()
    .flat(2)
    .filter((piece) => piece !== null)
    .filter((piece) => piece.side === side);

  return sidePieces.map(
    (piece) => genActionsForPiece(board, piece))
    .flat(1);
};

export const evaluate = (board, side) => {
  checkNotNullOrUndefined(board);
  checkNotNullOrUndefined(side);

  if (board.gameStatus !== GameStatus.IN_PROGRESS) {
    return gameEndedValue(board.gameStatus, side);
  }

  const boardValue = board.getRows()
    .flat(2)
    .filter(utils.isNotNullOrUndefined)
    .map((piece) => getValueForPiece(board, side, piece))
    .reduce((a, b) => a + b, 0);

  return roundToMillis(boardValue);
};

initialize();
