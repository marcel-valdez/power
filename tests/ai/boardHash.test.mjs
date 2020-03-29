// jshint esversion: 6

import {addTest, assert} from '../../tests/test_framework.mjs';
import {computeBoardHash} from '../../ai/boardHash.mjs';
import {
  blkPawn, blkKnight, blkRook, whtPawn, whtKing
} from '../../tests/power_test_utils.mjs';
import {Board} from '../../core/board.mjs';

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
