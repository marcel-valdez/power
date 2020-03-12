import utils from '../../core/utils.mjs';
import {Board} from '../../core/board.mjs';
import {Rook} from '../../core/rook.mjs';
import {King} from '../../core/king.mjs';
import {Knight} from '../../core/knight.mjs';
import {Pawn} from '../../core/pawn.mjs';
import {Side, GameStatus} from '../../core/power.common.mjs';
import {addTest, assert} from '../../tests/test_framework.mjs';
import {computeBoardHash, Engine} from '../../ai/engine.mjs';
import {
  blkPawn, blkKnight, blkRook, whtPawn, whtKnight, whtKing, whtRook,
  blkKing
} from '../../tests/power_test_utils.mjs';


addTest('computeBoardHash: 1 empty cell', () => {
  // given
  const board = {
    getRows: () => [[ null ]]
  };
  // when
  const hash = computeBoardHash(board);
  // then
  assert.equals(hash, 64n);
});

addTest('computeBoardHash: 1 pawn', () => {
  // given
  const board = {
    getRows: () => [[ whtPawn(0,0) ]]
  };
  // when
  const hash = computeBoardHash(board);
  // then
  assert.equals(hash, 0n);
});

addTest('computeBoardHash: 1 rook', () => {
  // given
  const board = {
    getRows: () => [[ blkRook(0,0) ]]
  };
  // when
  const hash = computeBoardHash(board);
  // then
  assert.equals(hash, 6n);
});

addTest('computeBoardHash: 1 knight', () => {
  // given
  const board = {
    getRows: () => [[ blkKnight(0,0) ]]
  };
  // when
  const hash = computeBoardHash(board);
  // then
  assert.equals(hash, 5n);
});


addTest('computeBoardHash: 1 king', () => {
  // given
  const board = {
    getRows: () => [[ whtKing(0,0) ]]
  };
  // when
  const hash = computeBoardHash(board);
  // then
  assert.equals(hash, 3n);
});

addTest('computeBoardHash: 1 row = [pawn, king]', () => {
  // given
  const board = {
    getRows: () => [[ whtPawn(), whtKing() ]]
  };
  // when
  const hash = computeBoardHash(board);
  // then
  assert.equals(hash, 192n);
});

addTest('computeBoardHash: 2 rows = [pawn], [king]', () => {
  // given
  const board = {
    getRows: () => [[ whtPawn() ], [ whtKing() ]]
  };
  // when
  const hash = computeBoardHash(board);
  // then
  assert.equals(hash, 3221225472n);
});

addTest('computeBoardHash: 1 row, piece order matters within row', () =>
        checkBoardsHaveDifferentHash(
          [[ whtPawn(), whtKing() ]], [[ whtKing(), whtPawn() ]]));

addTest(
  'computeBoardHash: 2 rows = [pawn], [king] order matters between rows',
  () =>
    checkBoardsHaveDifferentHash(
      [[ whtPawn() ], [ whtKing() ]],
      [[ whtKing() ], [ whtPawn() ]]
    ));


addTest('computeBoardHash: side matters', () =>
  checkBoardsHaveDifferentHash(
    [[ whtPawn(0,0) ]],
    [[ blkPawn(0,0) ]]
  ));

addTest('computeBoardHash: power matters', () => {
  checkBoardsHaveDifferentHash(
    [[ whtPawn(0,0,1) ]],
    [[ whtPawn(0,0,2) ]]
  );
});

addTest('computeBoardHash: nulls matter within row', () => {
  checkBoardsHaveDifferentHash(
    [[ null, whtPawn(0,0,1) ]],
    [[ whtPawn(0,0,1), null ]]
  );

  checkBoardsHaveDifferentHash(
    [[ whtPawn(0,0,1) ]],
    [[ whtPawn(0,0,1), null ]]
  );

  checkBoardsHaveDifferentHash(
    [[ null, whtPawn(0,0,1) ]],
    [[ whtPawn(0,0,1) ]]
  );
});

addTest('computeBoardHash: nulls matter between rows', () => {
  checkBoardsHaveDifferentHash(
    [[null], [ whtPawn(0,0,1) ]],
    [[ whtPawn(0,0,1) ], [null]]
  );

  checkBoardsHaveDifferentHash(
    [[ whtPawn(0,0,1) ]],
    [[ whtPawn(0,0,1) ], [null]]
  );

  checkBoardsHaveDifferentHash(
    [[null], [ whtPawn(0,0,1) ]],
    [[ whtPawn(0,0,1) ]]
  );
});

addTest('computeBoardHash: full board', () => {
  // given
  const board = new Board();
  // when
  const hash = computeBoardHash(board);
  // then
  assert.equals(
    hash,
    55665658484300068272458368540268988915894031340655202377169557817422150n);
});

addTest('Engine.computeMove: first move', () => {
  // given
  const board = new Board();
  const maxDepth = 3;
  const engine = new Engine({ maxDepth });
  // when
  utils.info('[START] engine.computeMove');
  utils.disableLogging();
  const result = engine.computeMove(board, Side.WHITE);
  utils.enableLogging();
  utils.info('[END] engine.computeMove');
  // then
  utils.info('depth:', maxDepth);
  utils.info('cacheHits:', engine.cacheHits);
  utils.info('whiteCache:', engine.whiteCache.totalSize());
  utils.info('blackCache:', engine.blackCache.totalSize());
  utils.info('duration seconds:', engine.lastDuration() / 1000);
  utils.info('result:', JSON.stringify(result));
  assert.notNull(result);
  assert.notNull(result.score);
  assert.notNull(result.action);
});

addTest('Engine.computeMove: caches results', () => {
  // given
  const board = new Board();
  const maxDepth = 3;
  const engine = new Engine({ maxDepth });
  utils.disableLogging();
  const original = engine.computeMove(board, Side.WHITE);
  const prevCacheHits = engine.cacheHits;
  // when
  const result = engine.computeMove(board, Side.WHITE);
  utils.enableLogging();
  // then
  assert.equals(engine.cacheHits, prevCacheHits + 1);
  assert.areSame(result, original);
});

function checkBoardsHaveDifferentHash(squaresA, squaresB) {
  // given
  const boardA = {
    getRows: () => squaresA
  };
  const boardB = {
    getRows: () => squaresB
  };
  // when
  const hashA = computeBoardHash(boardA);
  const hashB = computeBoardHash(boardB);
  // then
  assert.notEquals(hashA, hashB);
}
