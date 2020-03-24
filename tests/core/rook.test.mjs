import {Rook} from '../../core/rook.mjs';
import {King} from '../../core/king.mjs';
import {Side, MoveType, PieceType} from '../../core/power.common.mjs';
import {addTest, assert} from '../../tests/test_framework.mjs';
import utils from '../../core/utils.mjs';


const VALID_MOVES = [
  // horizontal moves
  [0, 3],
  [1, 3],
  [2, 3],
  [4, 3],
  [5, 3],
  [6, 3],
  [7, 3],
  // vertical moves
  [3, 0],
  [3, 1],
  [3, 2],
  [3, 4],
  [3, 5],
  [3, 6],
  [3, 7]
];

const TWO_SQUARE_MOVES = [
  [1, 3], // left
  [3, 1], // up
  [5, 3], // right
  [3, 5], // down
];

addTest(
  'Can create Rook',
  () => {
    // given
    // when
    const target = new Rook();
    // then
    assert.equals(target.type, PieceType.ROOK);
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
    const target = new Rook({side: Side.WHITE});
    const ally = new Rook({side: Side.WHITE});
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
    const target = new Rook({position: [3,3]});
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
    const target = new Rook({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => false
    };
    // when
    const moveType = target.computeMoveType(board, 1, 1);
    // then
    assert.equals(moveType, MoveType.INVALID);
  }
);

addTest(
  'Can move x or y accross the whole board',
  () => {
    // given
    const target = new Rook({position: [3,3]});
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
  }
);

addTest(
  'Can identify invalid diagonal moves',
    () => {
    // given
    const target = new Rook({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false
    };
    [
      [0, 0],
      [1, 1],
      [2, 2],
      [4, 4],
      [5, 5],
      [6, 6],
      [7, 7],

      [7, 0],
      [6, 1],
      [5, 2],
      [4, 4],
      [2, 5],
      [1, 6],
      [0, 7]
    ].forEach(([x, y]) => {
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.INVALID);
    });
  }
);

addTest(
  'Can identify invalid L moves',
  () => {
    // given
    const target = new Rook({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x, y) => false
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
  'Can sacrifice ally',
  () => {
    // given
    const target = new Rook({position: [3,3]});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => dst['x'] === x && dst['y'] === y,
      getPieceAt: (x, y) => new Rook()
    };
    VALID_MOVES.forEach(([x,y]) => {
      dst['x'] = x;
      dst['y'] = y;
      // when
      const moveType = target.computeMoveType(board, x, y);
      // then
      assert.equals(moveType, MoveType.SACRIFICE);
    });
  });

addTest(
  'Can\'t sacrifice KING',
  () => {
    // given
    const target = new Rook({position: [3,3]});
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
    const target = new Rook({position: [3,3]});
    const dst = { x: null, y: null };
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => dst['x'] === x && dst['y'] === y,
      getPieceAt: (x, y) => new Rook({ side: Side.BLACK })
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
  'Can identify invalid skip piece move (two square)',
  () => {
    // given
    const dst = { y: null, x: null };
    const target = new Rook({position: [3,3]});
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
  'Can identify invalid skip piece attacks (two square)',
  () => {
    // given
    const target = new Rook({position: [3,3], side: Side.WHITE});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => true,
      getPieceAt: (x,y) => new Rook({side: Side.BLACK})
    };
    TWO_SQUARE_MOVES.forEach(([x, y]) => {
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
  'Can identify invalid skip piece sacrifices (two square)',
  () => {
    // given
    const target = new Rook({position: [3,3], side: Side.WHITE});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => true,
      getPieceAt: (x,y) => new Rook({side: Side.WHITE})
    };
    TWO_SQUARE_MOVES.forEach(([x, y]) => {
      assert.equals(
        // when
        target.computeMoveType(board, x, y),
        // then
        MoveType.INVALID,
        `Move from (3,3) to (${x}, ${y})`
      );
    });
  });
