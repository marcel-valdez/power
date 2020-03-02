import {King} from '../../core/king.mjs';
import {Rook} from '../../core/rook.mjs';
import {Winner, Side, MoveType, PieceType} from '../../core/power.common.mjs';
import {addTest, assert} from '../../tests/test_framework.mjs';
import utils from '../../core/utils.mjs';

const VALID_MOVES = [
  [2, 3], // left
  [3, 2], // down
  [4, 3], // right
  [3, 4], // up
  [4, 4], // right diagonal up
  [2, 2], // left diagonal down
  [2, 4], // left diagonal up
  [4, 2], // right diagonal down
];

const TWO_SQUARE_MOVES = [
  [1, 3], // left
  [3, 1], // up
  [5, 3], // right
  [3, 5], // down
  [5, 5], // right diagonal up
  [1, 1], // left diagonal down
  [1, 5], // left diagonal up
  [5, 1], // right diagonal down
];

addTest(
  'Can create King',
  () => {
    // given
    // when
    const target = new King();
    // then
    assert.equals(target.type, PieceType.KING);
    assert.equals(target.x, 0);
    assert.equals(target.y, 0);
    assert.equals(target.power, 0);
    assert.equals(target.side, Side.WHITE);
  });

addTest(
  'Can identify ally',
  () => {
    // given
    const target = new King({side: Side.WHITE});
    const ally = new King({side: Side.WHITE});
    // when
    const isAlly = target.isAlly(ally);
    // then
    assert.equals(isAlly, true);
  });

addTest(
  'Can identify stationary invalid move',
  () => {
    // given
    const target = new King({position: [3,3]});
    // when
    const moveType = target.computeMoveType({}, 3, 3);
    // then
    assert.equals(moveType, MoveType.INVALID);
  });

addTest(
  'Can identify out of boundaries move',
  () => {
    // given
    const target = new King({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => false
    };
    // when
    const moveType = target.computeMoveType(board, 1, 1);
    // then
    assert.equals(moveType, MoveType.INVALID);
  });

addTest(
  'Can move in any direction 1 square',
  () => {
    // given
    const target = new King({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false
    };
    VALID_MOVES.forEach(([x, y]) => {
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.MOVE);
    });
  });

addTest(
  'Can detect invalid sacrifices (all)',
  () => {
    // given
    const target = new King({position: [3,3]});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => dst['x'] === x && dst['y'] === y,
      getPieceAt: (x, y) => new King()
    };
    VALID_MOVES.forEach(([x,y]) => {
      dst['x'] = x;
      dst['y'] = y;
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.INVALID);
    });
  });

addTest(
  'Can attack enemies',
    () => {
    // given
    const target = new King({position: [3,3]});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => dst['x'] === x && dst['y'] === y,
      getPieceAt: (x, y) => new King({ side: Side.BLACK })
    };

    VALID_MOVES.forEach(([x,y]) => {
      dst['x'] = x;
      dst['y'] = y;
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.ATTACK);
    });
  });

addTest(
  'Can identify invalid 2 square moves',
  () => {
    // given
    const dst = { y: null, x: null };
    const target = new King({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => !(x == dst['x'] && y == dst['y'])
    };
    TWO_SQUARE_MOVES.forEach(([x, y]) => {
      dst['x'] = x;
      dst['y'] = y;
      assert.equals(
        // when
        target.computeMoveType(board, x, y),
        // then
        MoveType.INVALID,
        `Move from (3,3) to (${x}, ${y})`
      );
    });
  });

addTest(
  'Can identify valid castle move',
  () => {
    // given
    const target = new King({position: [3,3]});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => dst['x'] === x && dst['y'] === y,
      getPieceAt: (x, y) => new Rook()
    };
    [ [1, 3], [5, 3] ].forEach(([x,y]) => {
      dst['x'] = x;
      dst['y'] = y;
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.CASTLE);
    });
  });

addTest(
  'Can identify invalid castle move (piece in between)',
  () => {
    // given
    const target = new King({position: [3,3]});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => true,
      getPieceAt: (x, y) => new Rook()
    };
    [ [1, 3], [5, 3] ].forEach(([x,y]) => {
      dst['x'] = x;
      dst['y'] = y;
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.INVALID);
    });
  });

addTest(
  'Can identify invalid castle move (marked moved rook)',
  () => {
    // given
    const target = new King({position: [3,3]});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => dst['x'] === x && dst['y'] === y,
      getPieceAt: (x, y) => (new Rook()).markMoved()
    };
    [ [1, 3], [5, 3] ].forEach(([x,y]) => {
      dst['x'] = x;
      dst['y'] = y;
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.INVALID);
    });
  });

addTest(
  'Can identify invalid castle move (marked moved king)',
  () => {
    // given
    const target = new King({position: [3,3], canCastle: false});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => dst['x'] === x && dst['y'] === y,
      getPieceAt: (x, y) => new Rook()
    };
    [ [1, 3], [5, 3] ].forEach(([x,y]) => {
      dst['x'] = x;
      dst['y'] = y;
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.INVALID);
    });
  });

addTest(
  'Can identify invalid castle move (enemy rook)',
  () => {
    // given
    const target = new King({position: [3,3]});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => dst['x'] === x && dst['y'] === y,
      getPieceAt: (x, y) => new Rook({ side: Side.BLACK })
    };
    [ [1, 3], [5, 3] ].forEach(([x,y]) => {
      dst['x'] = x;
      dst['y'] = y;
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.INVALID);
    });
  });
