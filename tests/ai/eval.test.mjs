// jshint esversion: 6

import {Board} from '../../core/board.mjs';
import {Rook} from '../../core/rook.mjs';
import {King} from '../../core/king.mjs';
import {Knight} from '../../core/knight.mjs';
import {Pawn} from '../../core/pawn.mjs';
import {Side, MoveType} from '../../core/power.common.mjs';
import {addTest, assert} from '../../tests/test_framework.mjs';
import {evaluate, genActions} from '../../ai/eval.mjs';
import utils from '../../core/utils.mjs';
import {
  blkPawn, blkKnight, blkRook, whtPawn, whtKnight, whtKing, whtRook
} from '../../tests/power_test_utils.mjs';


utils.disableWarning();
addTest('evaluate: Starting board has score of 0.0', () => {
  // given
  const startingBoard = new Board();
  // when
  const actual = evaluate(startingBoard, Side.WHITE);
  // then
  assert.equals(actual, 0.0);
});

addTest(
  'evaluate: evaluate board on a piece basis (white piece, white turn)',
  () => {
    [
      {
        board: [ new Pawn({ side: Side.WHITE }) ],
        score: 1.5
      },
      {
        board: [ new Rook({ side: Side.WHITE }) ],
        score: 8.75
      },
      {
        board: [ new Knight({ side: Side.WHITE }) ],
        score: 4.0
      },
      {
        board: [ new King({ side: Side.WHITE }) ],
        score: ((1*8) + (2.5*2) + (5.0*2))*12
      }
    ].forEach(({ board, score: expected }) => {

      // given
      const startingBoard = new Board({
        squares: board
      });
      // when
      const actual = evaluate(startingBoard, Side.WHITE);
      // then
      assert.equals(actual, expected);
    });
  });

addTest(
  'evaluate: evaluate board on a piece basis (black pieces, white turn)',
  () => {
    [
      {
        board: [ new Pawn({ side: Side.BLACK }) ],
        score: -1.5
      },
      {
        board: [ new Rook({ side: Side.BLACK }) ],
        score: -7.5
      },
      {
        board: [ new Knight({ side: Side.BLACK }) ],
        score: -3.75
      },
      {
        board: [ new King({ side: Side.BLACK }) ],
        score: -(((1*8) + (2.5*2) + (5.0*2))*12)
      }
    ].forEach(({ board, score: expected }) => {

      // given
      const startingBoard = new Board({
        squares: board
      });
      // when
      const actual = evaluate(startingBoard, Side.WHITE);
      // then
      assert.equals(actual, expected);
    });
  });

addTest(
  'evaluate: evaluate board on a piece basis (white piece, black turn)',
  () => {
    [
      {
        board: [ new Pawn({ side: Side.WHITE }) ],
        score: -1.5
      },
      {
        board: [ new Rook({ side: Side.WHITE }) ],
        score: -8.75
      },
      {
        board: [ new Knight({ side: Side.WHITE }) ],
        score: -4
      },
      {
        board: [ new King({ side: Side.WHITE }) ],
        score: -(((1*8) + (2.5*2) + (5.0*2))*12)
      }
    ].forEach(({ board, score: expected }) => {

      // given
      const startingBoard = new Board({
        squares: board
      });
      // when
      const actual = evaluate(startingBoard, Side.BLACK);
      // then
      assert.equals(actual, expected);
    });
  });

addTest(
  'evaluate: evaluate board on a piece basis (black pieces, black turn)',
  () => {
    [
      {
        board: [ new Pawn({ side: Side.BLACK }) ],
        score: 1.5
      },
      {
        board: [ new Rook({ side: Side.BLACK }) ],
        score: 7.5
      },
      {
        board: [ new Knight({ side: Side.BLACK }) ],
        score: 3.75
      },
      {
        board: [ new King({ side: Side.BLACK }) ],
        score: ((1*8) + (2.5*2) + (5.0*2))*12
      }
    ].forEach(({ board, score: expected }) => {

      // given
      const startingBoard = new Board({
        squares: board
      });
      // when
      const actual = evaluate(startingBoard, Side.BLACK);
      // then
      assert.equals(actual, expected);
    });
  });

addTest(
  'evaluate: evaluate board on a piece power basis (power: -1)',
  () => {
    [
      {
        board: [
          new Pawn({ power: -1 })
        ],
        score: 1.25
      },
      {
        board: [ new Rook({ power: -1 }) ],
        score: 7.5
      },
      {
        board: [ new Knight({ power: -1 }) ],
        score: 3.375
      },
      {
        board: [ new King({ power: -1 }) ],
        score: ((1*8) + (2.5*2) + (5.0*2))*10
      }
    ].forEach(({ board, score: expected }) => {

      // given
      const startingBoard = new Board({
        squares: board
      });
      // when
      const actual = evaluate(startingBoard, Side.WHITE);
      // then
      assert.equals(actual, expected);
    });
  });

addTest(
  'evaluate: evaluate board on a piece power basis (power: -2)',
  () => {
    [
      {
        board: [
          new Pawn({ side: Side.BLACK, power: -2 })
        ],
        score: -1.125
      },
      {
        board: [ new Rook({ side: Side.BLACK, power: -2 }) ],
        score: -5.625
      },
      {
        board: [ new Knight({ side: Side.BLACK, power: -2 }) ],
        score: -2.812
      },
      {
        board: [ new King({ side: Side.BLACK, power: -2 }) ],
        // the weaker the king, the more worthwhile it is to attack him
        // but then it also means that the enemy has "more value"
        score: -((1*8) + (2.5*2) + (5.0*2))*9
      }
    ].forEach(({ board, score: expected }) => {

      // given
      const startingBoard = new Board({
        squares: board
      });
      // when
      const actual = evaluate(startingBoard, Side.WHITE);
      // then
      assert.equals(actual, expected);
    });
  });


addTest(
  'computeActions: Gets all possible actions for pawn',
  () => {
    [
      {
        board: [
          [ null, null, null ],
          [ blkPawn(0, 1), null, blkPawn(2, 1) ],
          [ null, whtPawn(1, 2), null ]
        ],
        actions: [
          { src: [1,2], dst: [1,1], type: MoveType.MOVE },
          { src: [1,2], dst: [1,0], type: MoveType.PROMOTION },
          { src: [1,2], dst: [0,1], type: MoveType.ATTACK },
          { src: [1,2], dst: [2,1], type: MoveType.ATTACK }
        ]
      }
    ].map(({ board: squares, actions }) => {
      // given
      const board = new Board({ squares });
      // when
      const actualActions = genActions(board, Side.WHITE);
      // thenn
      assert.deepEquals(actualActions, actions);
    });
  });


addTest(
  'computeActions: Gets all possible actions for knight',
  () => {
    [
      {
        board: [
          [ null, null,           null,           null,           null ],
          [ null, null,           null,           whtKnight(3,1), null ],
          [ null, null,           blkKnight(2,2), whtKnight(3,2), null ],
          [ null, whtKnight(1,3), whtKnight(2,3), null,           null ],
          [ null, null,           null,           null,           null ],
        ],
        actions: [
          { src: [2,2], dst: [2,1], type: MoveType.MOVE },
          { src: [2,2], dst: [3,3], type: MoveType.MOVE },
          { src: [2,2], dst: [1,1], type: MoveType.MOVE },
          { src: [2,2], dst: [1,2], type: MoveType.MOVE },
          { src: [2,2], dst: [2,4], type: MoveType.MOVE },
          { src: [2,2], dst: [4,0], type: MoveType.MOVE },
          { src: [2,2], dst: [4,2], type: MoveType.MOVE },
          { src: [2,2], dst: [0,4], type: MoveType.MOVE },
        ]
      }
    ].map(({ board: squares, actions }) => {
      // given
      const board = new Board({ squares });
      // when
      const actualActions = genActions(board, Side.BLACK);
      // then
      assert.deepEquals(actualActions, actions);
    });
  });

addTest(
  'computeActions: Gets all possible actions for rook',
  () => {
    [
      {
        board: [
          [ null, null, null,         null, null ],
          [ null, null, null,         null, null ],
          [ null, null, null,         null, null ],
          [ null, null, blkRook(2,3), null, whtRook(4,3) ],
          [ null, null, whtRook(2,4), null, null ],
          [ null, null, null,         null, null ],
        ],
        actions: [
          { src: [2,3], dst: [2,4], type: MoveType.ATTACK },
          { src: [2,3], dst: [2,2], type: MoveType.MOVE },
          { src: [2,3], dst: [2,1], type: MoveType.MOVE },
          { src: [2,3], dst: [2,0], type: MoveType.MOVE },
          { src: [2,3], dst: [3,3], type: MoveType.MOVE },
          { src: [2,3], dst: [4,3], type: MoveType.ATTACK },
          { src: [2,3], dst: [1,3], type: MoveType.MOVE },
          { src: [2,3], dst: [0,3], type: MoveType.MOVE },
        ]
      }
    ].map(({ board: squares, actions }) => {
      // given
      const board = new Board({ squares });
      // when
      const actualActions = genActions(board, Side.BLACK);
      // thenn
      assert.deepEquals(actualActions, actions);
    });
  });

addTest(
  'computeActions: Gets all possible actions for king',
  () => {
    [
      {
        board: [
          [ null, null, null,         null, null ],
          [ null, null, null,         null, null ],
          [ null, null, null,         null, null ],
          [ null, null, whtKing(2,3), null, blkRook(4,3) ],
          [ null, null, blkRook(2,4), null, null ],
          [ null, null, null,         null, null ],
        ],
        actions: [
          { src: [2,3], dst: [2,2], type: MoveType.MOVE },
          { src: [2,3], dst: [2,4], type: MoveType.ATTACK },
          { src: [2,3], dst: [3,4], type: MoveType.MOVE },
          { src: [2,3], dst: [3,3], type: MoveType.MOVE },
          { src: [2,3], dst: [3,2], type: MoveType.MOVE },
          { src: [2,3], dst: [1,4], type: MoveType.MOVE },
          { src: [2,3], dst: [1,3], type: MoveType.MOVE },
          { src: [2,3], dst: [1,2], type: MoveType.MOVE },
        ]
      }
    ].map(({ board: squares, actions }) => {
      // given
      const board = new Board({ squares });
      // when
      const actualActions = genActions(board, Side.WHITE);
      // then
      assert.deepEquals(actualActions, actions);
    });
  });
