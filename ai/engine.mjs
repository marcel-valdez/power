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
  checkArgument
} from '../core/preconditions.mjs';
import {Cache} from '../ai/cache.mjs';
import {genActions, evaluate} from '../ai/eval.mjs';
import {computeBoardHash} from '../ai/boardHash.mjs';

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


const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

export function Engine({maxDepth = 3, playingSide = null}) {
  checkArgument(() => maxDepth >= 0, 'Depth can\'t be less than 0');
  checkArgument(() => playingSide === Side.WHITE || playingSide === Side.BLACK,
    'Side needs to be Side.WHITE or Side.BLACK');

  const _maxDepth = maxDepth;
  const _whiteCache = new Cache(10000);
  const _blackCache = new Cache(10000);

  // START: analytics
  this.whiteCache = _whiteCache;
  this.blackCache = _blackCache;
  this.cacheHits = 0;
  let startTime = 0;
  let endTime = 0;
  this.lastDuration = () => {
    return endTime - startTime;
  };
  // END: analytics


  const nextSide = (side) => {
    return side === Side.WHITE ? Side.BLACK : Side.WHITE;
  };

  this.computeMove = (
    board,
    state,
    depth = 0) => {
    if (depth == 0) {
      this.cacheHits = 0;
      startTime = new Date();
    }

    if (board.gameStatus !== GameStatus.IN_PROGRESS || depth > _maxDepth) {
      return {
        score: evaluate(board, playingSide),
        action: null,
        depth
      };
    }

    let { alpha = -1000, beta = 1000, curSide = playingSide } = state || {};
    const boardHash = computeBoardHash(board);
    const cachedResult = getCachedResult(boardHash, curSide);
    if (cachedResult !== null && typeof(cachedResult) !== 'undefined') {
      if (cachedResult.depth <= depth) {
        this.cacheHits++;
        return cachedResult;
      }
    }

    const isMax = curSide === playingSide;
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
              this.computeMove(moveBoard, nextState, depth + 1);

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
