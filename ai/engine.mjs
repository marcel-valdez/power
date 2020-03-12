import utils from '../core/utils.mjs';
import {
  GameStatus,
  MoveType,
  PieceType,
  Side
} from '../core/power.common.mjs';
import {
  Board,
  computeWinOdds,
  computeSacrificePower,
  computePieceWinOdds
} from '../core/board.mjs';
import {
  checkNotNullOrUndefined,
} from '../core/preconditions.mjs';
import {Cache} from '../ai/cache.mjs';
import {genActions, evaluate} from '../ai/eval.mjs';

/**
 * MinMax Power Engine.
 * It uses traditional minmax algorithm to calculate the next move.
 *
 * Efficiency:
 * - In order to avoid re-evaluating the exact same board more than once
 *   it hashes results from different runs that lead to the same board
 *   this is done by creating a unique hash value for each board and
 *   storing the results from that.
 */

const PIECE_TYPE_HASH = {};
const SIDE_HASH = {};

function initialize() {
  PIECE_TYPE_HASH[PieceType.PAWN] = 0b00;
  PIECE_TYPE_HASH[PieceType.KNIGHT] = 0b01;
  PIECE_TYPE_HASH[PieceType.ROOK] = 0b10;
  PIECE_TYPE_HASH[PieceType.KING] = 0b11;

  SIDE_HASH[Side.WHITE] = 0b0;
  SIDE_HASH[Side.BLACK] = 0b1;
}

initialize();

const pieceHash = (piece) => {
  if (piece === null) {
    return 1 << 6;
  }

  // Hash: 0000##
  const pieceTypeHash = PIECE_TYPE_HASH[piece.type];
  // Hash: 000#00
  const pieceSideHash = SIDE_HASH[piece.side] << 2;
  // Hash: ###000
  let powerHash = Math.min(Math.abs(piece.power), 3);
  if (piece.power < 0) {
    powerHash = powerHash & 0b100;
  }
  powerHash = powerHash << 3;
  // total bits: 111111 (6 bits, Max value: 2^7 - 1 = 127)
  return pieceTypeHash | pieceSideHash | powerHash;
};

const computeRowHash = (row) => {
  // total bits: 6 * 5 = 30 bits
  return row.map((cell) => pieceHash(cell))
    .map((hash, index) => hash << (index * 6))
    .reduce((a, b) => a | b);
};

export const computeBoardHash = (board) => {
  // total bits: 8 rows * 30 per row = 240 bits
  // max value: 2 ^ 241 - 1 (cannot be represented in an int)
  return board.getRows()
    .map(row => computeRowHash(row))
    .map(x => BigInt(x))
  // shift each by 30 bits to put them at their respective bit position
    .map((hash, index) => hash << (30n * BigInt(index)))
  // OR them to get the final UNIQUE hash
    .reduce((a, b) => a | b);
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

export function Engine({maxDepth = 3}) {
  const _maxDepth = maxDepth;
  const _whiteCache = new Cache(10000);
  const _blackCache = new Cache(10000);
  this.whiteCache = _whiteCache;
  this.blackCache = _blackCache;
  this.cacheHits = 0;

  let startTime = 0;
  let endTime = 0;
  this.lastDuration = () => {
    return endTime - startTime;
  };

  const nextSide = (side) => {
    return side === Side.WHITE ? Side.BLACK : Side.WHITE;
  };

  let cacheReqSide = null;

  this.computeMove = (
    board,
    reqSide,
    state,
    depth = 0) => {
      if (depth == 0) {
        this.cacheHits = 0;
        startTime = new Date();
        if (cacheReqSide !== reqSide) {
          resetCache();
          cacheReqSide = reqSide;
        }
      }

      if (board.gameStatus !== GameStatus.IN_PROGRESS || depth > _maxDepth) {
        return {
          score: evaluate(board, reqSide),
          action: null,
          depth
        };
      }

      let { alpha = -1000, beta = 1000, curSide = reqSide } = state || {};
      const boardHash = computeBoardHash(board);
      const cachedResult = getCachedResult(boardHash, curSide);
      if (cachedResult !== null && typeof(cachedResult) !== 'undefined') {
        if (cachedResult.depth <= depth) {
          this.cacheHits++;
          return cachedResult;
        }
      }

      const isMax = curSide === reqSide;
      const isMin = !isMax;
      const validActions = genActions(board, curSide);
      shuffleArray(validActions);
      let bestScore = isMax ? -1000 : 1000;
      let bestAction = null;
      for(let i = 0; i < validActions.length; i++) {
        const {src, dst} = validActions[i];
        // TODO: This performs actual fights, but we should instead create
        // both possibilities loss and win.
        const nextState = { alpha, beta, curSide: nextSide(curSide) };
        const moveBoard = board.makeMove(src, dst);
        const { score, action } =
              this.computeMove(moveBoard, reqSide, nextState, depth + 1);

        if (isMax && bestScore < score) {
          bestScore = score;
          bestAction = validActions[i];
          alpha = Math.max(alpha, bestScore);
          if (beta <= alpha) {
            break;
          }
        } else if (isMin && bestScore > score) {
          bestScore = score;
          bestAction = validActions[i];
          beta = Math.min(beta, bestScore);
          if (beta <= alpha) {
            break;
          }
        }
      }

      const result = { score: bestScore, action: bestAction, depth };
      cacheResult(boardHash, curSide, result);
      if (depth === 0) {
        endTime = new Date();
      }
      return result;
    };

  const resetCache = () => {
    _whiteCache.clear();
    _blackCache.clear();
    this.cacheHits = 0;
  };

  const getCachedResult = (boardHash, side) => {
    if (side === Side.WHITE) {
      return _whiteCache.get(boardHash);
    } else {
      return _blackCache.set(boardHash);
    }
  };

  const cacheResult = (boardHash, side, result) => {
    if (side === Side.WHITE) {
      _whiteCache.set(boardHash, result);
    } else {
      _blackCache.set(boardHash, result);
    }
  };
}
