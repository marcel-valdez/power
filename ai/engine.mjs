import utils from '../core/utils.mjs';
import {
  GameStatus,
  MoveType,
  PieceType,
  Side
} from '../core/power.common.mjs';
import {
  Board,
  computeSacrificePower,
  computePieceWinOdds,
  EngineOutcome
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

  let _maxDepth = maxDepth;
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

  const computePossibleBoards = (board, action) => {
    const { src, dst, type } = action;

    switch(type) {
    case MoveType.MOVE:
    case MoveType.CASTLE:
      return [{
        boards: [board.makeMove(src, dst)],
        odds: 1.0
      }];
    case MoveType.ATTACK: {
      const attackWinOdds =
        computePieceWinOdds(board.getPieceAt(...src), board.getPieceAt(...dst));
      return [
        {
          boards: [board.makeMove(src, dst, EngineOutcome.ALWAYS_WIN)],
          odds: attackWinOdds
        },
        {
          boards: [board.makeMove(src, dst, EngineOutcome.ALWAYS_LOSE)],
          odds: 1 - attackWinOdds
        }
      ];
    }
    case MoveType.EN_PASSANT_ATTACK: {
      const [x1,y1] = src;
      const [x2,y2] = dst;
      const attacker = board.getPieceAt(x1,y1);
      let enPassantPiece = board.getPieceAt(x2, y1);
      const attackWinOdds =
        computePieceWinOdds(attacker, enPassantPiece);
      return [
        {
          boards: [board.makeMove(src, dst, EngineOutcome.ALWAYS_WIN)],
          odds: attackWinOdds
        },
        {
          boards: [board.makeMove(src, dst, EngineOutcome.ALWAYS_LOSE)],
          odds: 1 - attackWinOdds
        }
      ];
    }
    case MoveType.PROMOTION_ATTACK:
      const promoAttackWinOdds =
        computePieceWinOdds(board.getPieceAt(...src), board.getPieceAt(...dst));
      const promoBoard = board.makeMove(src, dst, EngineOutcome.ALWAYS_WIN);
      return [
        {
          boards: [board.makeMove(src, dst, EngineOutcome.ALWAYS_LOSE)],
          odds: 1 - promoAttackWinOdds
        },
        {
          boards: [
            promoBoard.setPromotion(PieceType.ROOK),
            promoBoard.setPromotion(PieceType.KNIGHT)
          ],
          odds: promoAttackWinOdds
        }
      ];
    case MoveType.SACRIFICE:
      // only one possible board
      return [{
        boards: [board.makeMove(src, dst)],
        odds: 1.0
      }];
    case MoveType.PROMOTION:
      const promotionPending = board.makeMove(src, dst);
      return [
        {
          boards: [
            promotionPending.setPromotion(PieceType.ROOK),
            promotionPending.setPromotion(PieceType.KNIGHT)
          ],
          odds: 1.0
        }
      ];
    default:
      throw new Error(`Invalid move type: ${type}`);
    }
  };

  /**
   * Evaluates multiple boards and returns the one with the best value.
   */
  const computeBestBoard = (boards, state, depth, limitDepth) => {
    checkNotNullOrUndefined(boards);
    checkNotNullOrUndefined(state);
    checkNotNullOrUndefined(depth);

    const isMax = playingSide === state.curSide;
    const isMin = !isMax;
    return boards.map(board =>
      doComputeMove(board, state, depth, limitDepth)
    ).reduce((a, b) =>
      (isMax && a.score >= b.score) ||
               (isMin && a.score <= b.score) ? a : b);
  };

  this.computeMove = (board,
    state = { alpha: -1000, beta: 1000, curSide: playingSide },
    depth = 0) => {
    if (depth == 0) {
      this.cacheHits = 0;
      startTime = new Date();
    }

    const pieceCount = board.getRows().flat(2)
      .filter(cell => cell !== null).length;
    let limitDepth = maxDepth;
    if (pieceCount <= 15) {
      limitDepth = Math.ceil(maxDepth * 1.2);
    }

    if (pieceCount <= 10) {
      limitDepth = Math.ceil(maxDepth * 1.33);
    }

    if (pieceCount <= 5) {
      limitDepth = Math.ceil(maxDepth * 1.5);
    }

    return doComputeMove(board, state, depth, limitDepth);
  };

  const doComputeMove = (board, state, depth, limitDepth) => {

    if (board.gameStatus !== GameStatus.IN_PROGRESS || depth > maxDepth) {
      return {
        score: evaluate(board, playingSide),
        action: null,
        depth
      };
    }

    let { alpha = -1000, beta = 1000, curSide = playingSide } = state;
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

      const possibilities = computePossibleBoards(board, validActions[i]);
      const nextState = { alpha, beta, curSide: nextSide(curSide) };

      const score =
              possibilities.map(({ boards, odds }) => {
                const { score: possibleScore } =
                      computeBestBoard(boards, nextState, depth + 1, limitDepth);
                return {
                  possibleScore,
                  odds
                };
              }).map(({ possibleScore, odds }) => possibleScore * odds)
                .reduce((a, b) => a + b);

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
