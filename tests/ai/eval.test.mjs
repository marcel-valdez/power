import {
  Board,
  computeWinOdds,
  computeSacrificePower
} from '../../core/board.mjs';
import {Rook} from '../../core/rook.mjs';
import {King} from '../../core/king.mjs';
import {Knight} from '../../core/knight.mjs';
import {Pawn} from '../../core/pawn.mjs';
import {PieceType, Side, GameStatus} from '../../core/power.common.mjs';
import {addTest, assert} from '../../tests/test_framework.mjs';
import utils from '../../core/utils.mjs';
import {evaluate, genActions} from '../../ai/eval.mjs';

const PIECE_SCORES = {
  'PAWN': 1.0,
  'KNIGHT': 2.5,
  'ROOK': 5.0,
  'KING': ((1*8) + (2.5*2) + (5.0*2))*8
};


const whtPawn = (x, y, power = 0) =>
  new Pawn({ side: Side.WHITE, position: [x,y], power });

const blkPawn = (x, y, power = 0) =>
  new Pawn({ side: Side.BLACK, position: [x,y], power });

const whtKnight = (x, y, power = 0) =>
  new Knight({ side: Side.WHITE, position: [x,y], power });

const blkKnight = (x, y, power = 0) =>
  new Knight({ side: Side.BLACK, position: [x,y], power });

const whtRook = (x, y, power = 0) =>
  new Rook({ side: Side.WHITE, position: [x,y], power });

const blkRook = (x, y, power = 0) =>
  new Rook({ side: Side.BLACK, position: [x,y], power });

const whtKing = (x, y, power = 0) =>
  new King({ side: Side.WHITE, position: [x,y], power });

const blkKing = (x, y, power = 0) =>
  new King({ side: Side.BLACK, position: [x,y], power });



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
        score: 1.0
      },
      {
        board: [ new Rook({ side: Side.WHITE }) ],
        score: 5.0
      },
      {
        board: [ new Knight({ side: Side.WHITE }) ],
        score: 2.5
      },
      {
        board: [ new King({ side: Side.WHITE }) ],
        score: ((1*8) + (2.5*2) + (5.0*2))*8
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
        score: -1.0
      },
      {
        board: [ new Rook({ side: Side.BLACK }) ],
        score: -5.0
      },
      {
        board: [ new Knight({ side: Side.BLACK }) ],
        score: -2.5
      },
      {
        board: [ new King({ side: Side.BLACK }) ],
        score: -(((1*8) + (2.5*2) + (5.0*2))*8)
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
        score: -1.0
      },
      {
        board: [ new Rook({ side: Side.WHITE }) ],
        score: -5.0
      },
      {
        board: [ new Knight({ side: Side.WHITE }) ],
        score: -2.5
      },
      {
        board: [ new King({ side: Side.WHITE }) ],
        score: -(((1*8) + (2.5*2) + (5.0*2))*8)
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
        score: 1.0
      },
      {
        board: [ new Rook({ side: Side.BLACK }) ],
        score: 5.0
      },
      {
        board: [ new Knight({ side: Side.BLACK }) ],
        score: 2.5
      },
      {
        board: [ new King({ side: Side.BLACK }) ],
        score: ((1*8) + (2.5*2) + (5.0*2))*8
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
        score: 0.5
      },
      {
        board: [ new Rook({ power: -1 }) ],
        score: 2.5
      },
      {
        board: [ new Knight({ power: -1 }) ],
        score: 1.25
      },
      {
        board: [ new King({ power: -1 }) ],
        score: ((1*8) + (2.5*2) + (5.0*2))*4
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
        score: -0.25
      },
      {
        board: [ new Rook({ side: Side.BLACK, power: -2 }) ],
        score: -1.25
      },
      {
        board: [ new Knight({ side: Side.BLACK, power: -2 }) ],
        score: -0.625
      },
      {
        board: [ new King({ side: Side.BLACK, power: -2 }) ],
        // the weaker the king, the more worthwhile it is to attack him
        // but then it also means that the enemy has "more value"
        score: -((1*8) + (2.5*2) + (5.0*2))*2
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
          { src: [1,2], dst: [1,1] },
          { src: [1,2], dst: [1,0] },
          { src: [1,2], dst: [0,1] },
          { src: [1,2], dst: [2,1] }
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
          { src: [2,2], dst: [1,1] },
          { src: [2,2], dst: [1,2] },
          { src: [2,2], dst: [2,1] },
          { src: [2,2], dst: [4,0] },
          { src: [2,2], dst: [4,2] },
          { src: [2,2], dst: [0,4] },
          { src: [2,2], dst: [2,4] },
          { src: [2,2], dst: [3,3] },
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
          { src: [2,3], dst: [2,0] },
          { src: [2,3], dst: [2,1] },
          { src: [2,3], dst: [2,2] },
          { src: [2,3], dst: [2,4] },
          { src: [2,3], dst: [0,3] },
          { src: [2,3], dst: [1,3] },
          { src: [2,3], dst: [3,3] },
          { src: [2,3], dst: [4,3] },
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
          { src: [2,3], dst: [2,2] },
          { src: [2,3], dst: [2,4] },
          { src: [2,3], dst: [3,4] },
          { src: [2,3], dst: [3,3] },
          { src: [2,3], dst: [3,2] },
          { src: [2,3], dst: [1,4] },
          { src: [2,3], dst: [1,3] },
          { src: [2,3], dst: [1,2] },
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
