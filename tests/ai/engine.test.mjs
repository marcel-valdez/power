import utils from '../../core/utils.mjs';
import {Board} from '../../core/board.mjs';
import {Rook} from '../../core/rook.mjs';
import {King} from '../../core/king.mjs';
import {Knight} from '../../core/knight.mjs';
import {Pawn} from '../../core/pawn.mjs';
import {Side, GameStatus, MoveType} from '../../core/power.common.mjs';
import {addTest, assert} from '../../tests/test_framework.mjs';
import {Engine} from '../../ai/engine.mjs';
import {
  blkPawn, blkKnight, blkRook, whtPawn, whtKnight, whtKing, whtRook,
  blkKing
} from '../../tests/power_test_utils.mjs';


addTest('Engine.computeMove: first move', () => {
  // given
  const board = new Board();
  const maxDepth = 3;
  const engine = new Engine({ maxDepth, playingSide: Side.WHITE });
  // when
  utils.disableLogging();
  const result = engine.computeMove(board);
  utils.enableLogging();
  // then
  assert.notNull(result);
  assert.notNull(result.score);
  assert.notNull(result.action);
});

addTest('Engine.computeMove: caches results.', () => {return;
  // given
  const board = new Board();
  const maxDepth = 1;
  const engine = new Engine({ maxDepth, playingSide: Side.WHITE });
  utils.disableLogging();
  const original = engine.computeMove(board);
  const prevCacheHits = engine.cacheHits;
  // when
  const result = engine.computeMove(board);
  utils.enableLogging();
  // then
  assert.equals(engine.cacheHits, prevCacheHits + 1);
  assert.areSame(result, original);
});

addTest('Engine.computeMove: makes obvious moves.', () => {return;
  [
    {
      squares: [
        [ blkRook(0,0), null,         null ],
        [ null,         blkKing(1,1,-3), null ],
        [ whtPawn(0,2), whtKing(1,2), null ]
      ],
      action: { src: [0,2], dst: [1,1], type: MoveType.ATTACK }
    },
    {
      squares: [
        [ blkKing(0,0), null,         null ],
        [ null,         blkRook(1,1,-4), null ],
        [ whtPawn(0,2), null,         whtKing(2,2) ]
      ],
      action: { src: [0,2], dst: [1,1], type: MoveType.ATTACK }
    },
    {
      squares: [
        [ blkKing(0,0), null,           null ],
        [ blkPawn(0,1), blkKnight(1,1), blkKnight(2,1) ],
        [ whtKing(0,2), whtPawn(1,2),   null ]
      ],
      action: { src: [1,2], dst: [2,1], type: MoveType.ATTACK }
    }
  ].forEach(({ squares, action: expected }, index) => {
    const board = new Board({ squares });
    for (let i = 0; i < 10; i++) {
      // given
      const engine = new Engine({ maxDepth: 3, playingSide: Side.WHITE });
      // when
      utils.disableLogging();
      const result = engine.computeMove(board);
      utils.enableLogging();
      // then
      assert.deepEquals(
        result.action,
        expected,
        `Test case #${index} failed on iteration ${i}`);
    }
  });
});
