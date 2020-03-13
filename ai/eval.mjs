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
  checkNotNullOrUndefined,
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

const getRookPositionMultiplier = (rook) => {
  const {x,y} = rook;
  let horizontalMultiplier = 0;
  let verticalMultiplier = 0;

  if (x === 2) {
    horizontalMultiplier += .25;
  } else if (x === 1 || x === 3) {
    horizontalMultiplier += .1;
  }

  if (rook.side === Side.WHITE) {
    if (y === 0) {
      verticalMultiplier += .25;
    } else if (y === 1) {
      verticalMultiplier += 0.5;
    }
  } else {
    if (y === 7) {
      verticalMultiplier += .25;
    } else if (y === 6) {
      verticalMultiplier += 0.5;
    }
  }

  return horizontalMultiplier + verticalMultiplier;
};


const getKnightPositionMultiplier = (knight) => {
  const {x,y} = knight;
  let horizontalMultiplier = 0;
  let verticalMultiplier = 0;

  if (x === 2) {
    horizontalMultiplier += .25;
  } else if (x === 1 || x === 3) {
    horizontalMultiplier += .1;
  }

  if (knight.side === Side.WHITE) {
    if (y === 0) {
      verticalMultiplier += .1;
    } else if (y === 2 || y === 3) {
      verticalMultiplier += 0.33;
    } else if (y === 1) {
      verticalMultiplier += 0.5;
    }
  } else {
    if (y === 7) {
      verticalMultiplier += .1;
    } else if (y === 5 || y === 4) {
      verticalMultiplier += 0.33;
    } else if (y === 6) {
      verticalMultiplier += 0.5;
    }
  }

  return horizontalMultiplier + verticalMultiplier;
};

const getPawnPositionMultiplier = (pawn) => {
  const {x,y} = pawn;
  let horizontalMultiplier = 0;
  let verticalMultiplier = 0;

  if (x === 2) {
    horizontalMultiplier += .25;
  } else if (x === 1 || x === 3) {
    horizontalMultiplier += .1;
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

const getMultiplierForPiece = (piece) => {
  checkNotNullOrUndefined(piece, 'Piece can\'t be null');
  let positionMultiplier = 0;
  switch(piece.type) {
  case PieceType.KNIGHT:
    positionMultiplier = getKnightPositionMultiplier(piece);
    break;
  case PieceType.ROOK:
    positionMultiplier = getRookPositionMultiplier(piece);
    break;
  case PieceType.PAWN:
    positionMultiplier = getPawnPositionMultiplier(piece);
    break;
  }
  return 1 + computeWinOdds(piece.power, 0) + positionMultiplier;
};

const getValueForPiece = (side, piece) => {
  checkNotNullOrUndefined(side, 'Side can\'t be null');
  checkNotNullOrUndefined(piece, 'Piece can\'t be null');
  if (utils.isNullOrUndefined(piece)) {
    return 0;
  }


  const pieceValue = PIECE_SCORES[piece.type];
  const pieceScore = pieceValue * getMultiplierForPiece(piece);
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
    .map((piece) => getValueForPiece(side, piece))
    .reduce((a, b) => a + b);

  return boardValue;
};

initialize();
