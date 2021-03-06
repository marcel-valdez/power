// jshint esversion: 6

import {Knight} from '../../core/knight.mjs';
import {King} from '../../core/king.mjs';
import {Side, MoveType, PieceType} from '../../core/power.common.mjs';
import {addTest, assert} from '../../tests/test_framework.mjs';
import utils from '../../core/utils.mjs';


const TWO_SQUARE_MOVES = [
  [1, 3], // left
  [3, 1], // down
  [5, 3], // right
  [3, 5], // up
  [5, 5], // right diagonal up
  [1, 1], // left diagonal down
  [1, 5], // left diagonal up
  [5, 1], // right diagonal down
];

const ONE_SQUARE_MOVES = [
  [2, 3], // left
  [3, 2], // down
  [4, 3], // right
  [3, 4], // up
  [4, 4], // right diagonal up
  [2, 2], // left diagonal down
  [2, 4], // left diagonal up
  [4, 2], // right diagonal down
];

addTest(
  'Can create Knight',
  () => {
    // given
    // when
    const target = new Knight();
    // then
    assert.equals(target.type, PieceType.KNIGHT);
    assert.equals(target.x, 0);
    assert.equals(target.y, 0);
    assert.equals(target.power, 0);
    assert.equals(target.side, Side.WHITE);
  }
);

addTest(
  'Can identify ally',
  () => {
    // given
    const target = new Knight({side: Side.WHITE});
    const ally = new Knight({side: Side.WHITE});
    // when
    const isAlly = target.isAlly(ally);
    // then
    assert.equals(isAlly, true);
  }
);

addTest(
  'Can identify stationary invalid move',
  () => {
    // given
    const target = new Knight({position: [3,3]});
    // when
    const moveType = target.computeMoveType({}, 3, 3);
    // then
    assert.equals(moveType, MoveType.INVALID);
  }
);

addTest(
  'Can identify out of boundaries move',
  () => {
    // given
    const target = new Knight({position: [3,3]});
    const board = {
      isWithinBoundaries: () => false
    };
    // when
    const moveType = target.computeMoveType(board, 1, 1);
    // then
    assert.equals(moveType, MoveType.INVALID);
  }
);

addTest(
  'Can identify move x too far by 1',
  () => {
    // given
    const target = new Knight({position: [3,3]});
    const board = {
      isWithinBoundaries: () => true
    };
    // when
    const moveType = target.computeMoveType(board, 6, 3);
    // then
    assert.equals(moveType, MoveType.INVALID);
  }
);

addTest(
  'Can identify move y too far by 1',
  () => {
    // given
    const target = new Knight({position: [3,3]});
    const board = {
      isWithinBoundaries: () => true
    };
    // when
    const moveType = target.computeMoveType(board, 3, 6);
    // then
    assert.equals(moveType, MoveType.INVALID);
  }
);

addTest(
  'Can identify invalid L moves',
  () => {
    // given
    const target = new Knight({position: [3,3]});
    const board = {
      isWithinBoundaries: () => true
    };
    // when
    // then
    [
      [4, 5], // _|
      [2, 5], // |_
      [2, 1], // |-
      [4, 1], // -|
      [5, 4], // __|
      [1, 4], // |__
      [1, 2], // |--
      [5, 2], // --|
    ].forEach(([x, y]) => assert.equals(
      target.computeMoveType(board, x, y),
      MoveType.INVALID,
      `Move from (3,3) to (${x}, ${y})`
    ));
  }
);

addTest(
  'Can identify valid single square moves',
  () => {
    // given
    const target = new Knight({position: [3,3]});
    const board = {
      isWithinBoundaries: () => true,
      containsPieceAt: () => false
    };
    // when
    ONE_SQUARE_MOVES.forEach(([x, y]) => assert.equals(
      target.computeMoveType(board, 3, 4),
      // then
      MoveType.MOVE,
      `Move from (3,3) to (${x}, ${y})`
    ));
  }
);

addTest(
  'Can identify square occupied (single square move)',
  () => {
    // given
    const target = new Knight({position: [3,3]});
    const board = {
      isWithinBoundaries: () => true,
      containsPieceAt: () => true
    };
    // when
    const moveType = target.computeMoveType(board, 3, 4);
    // then
    assert.equals(moveType, MoveType.INVALID);
  }
);

addTest(
  'Can identify valid two-square moves',
  () => {
    // given
    const state = {
      square: [0,0]
    };
    const target = new Knight({position: [3,3]});
    const board = {
      isWithinBoundaries: () => true,
      containsPieceAt: (x,y) => {
        utils.debug(`containsPieceAt(${x},${y})`);
        const result = x !== state.square[0] || y !== state.square[1];
        utils.debug(`result: ${result}`);
        return result;
      }
    };
    // when
    // then
    TWO_SQUARE_MOVES.forEach(([x, y]) => {
      state.square = [x,y];
      assert.equals(
        target.computeMoveType(board, x, y),
        MoveType.MOVE,
        `Move from (3,3) to (${x}, ${y})`
      );
    });
  });

addTest(
  'Can identify valid two-square attacks',
  () => {
    // given
    const target = new Knight({position: [3,3], side: Side.WHITE});
    const board = {
      isWithinBoundaries: () => true,
      containsPieceAt: () => true,
      getPieceAt: () => new Knight({side: Side.BLACK})
    };
    // when
    // then
    TWO_SQUARE_MOVES.forEach(([x, y]) => {
      assert.equals(
        target.computeMoveType(board, x, y),
        MoveType.ATTACK,
        `Move from (3,3) to (${x}, ${y})`
      );
    });
  });

addTest(
  'Can identify valid two-square sacrifices',
  () => {
    // given
    const target = new Knight({position: [3,3], side: Side.WHITE});
    const board = {
      isWithinBoundaries: () => true,
      containsPieceAt: () => true,
      getPieceAt: () => new Knight({side: Side.WHITE})
    };
    // when
    // then
    TWO_SQUARE_MOVES.forEach(([x, y]) => {
      assert.equals(
        target.computeMoveType(board, x, y),
        MoveType.SACRIFICE,
        `Move from (3,3) to (${x}, ${y})`
      );
    });
  });

addTest(
  'Can identify invalid two-square KING sacrifices',
  () => {
    // given
    const target = new Knight({position: [3,3], side: Side.WHITE});
    const board = {
      isWithinBoundaries: () => true,
      containsPieceAt: () => true,
      getPieceAt: () => new King({side: Side.WHITE})
    };
    // when
    // then
    TWO_SQUARE_MOVES.forEach(([x, y]) => {
      assert.equals(
        target.computeMoveType(board, x, y),
        MoveType.INVALID,
        `Move from (3,3) to (${x}, ${y})`
      );
    });
  });
