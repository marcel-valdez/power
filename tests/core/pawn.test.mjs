import {Pawn} from '../../core/pawn.mjs';
import {Winner, Side, MoveType} from '../../core/power.common.mjs';
import {addTest, assert} from '../../tests/test_framework.mjs';
import utils from '../../core/utils.mjs';

addTest(
  'Can create Pawn',
  () => {
    // given
    // when
    const target = new Pawn();
    // then
    assert.equals(target.x, 0);
    assert.equals(target.y, 0);
    assert.equals(target.power, 0);
    assert.equals(target.side, Side.WHITE);
  });

addTest(
  'Can identify ally',
  () => {
    // given
    const target = new Pawn({side: Side.WHITE});
    const ally = new Pawn({side: Side.WHITE});
    // when
    const isAlly = target.isAlly(ally);
    // then
    assert.equals(isAlly, true);
  });

addTest(
  'Can identify stationary invalid move',
  () => {
    // given
    const target = new Pawn({position: [3,3]});
    // when
    const moveType = target.computeMoveType({
      containsPieceAt: (x,y) => false
    }, 3, 3);
    // then
    assert.equals(moveType, MoveType.INVALID);
  });

addTest(
  'Can identify out of boundaries move',
  () => {
    // given
    const target = new Pawn({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => false,
      containsPieceAt: (x,y) => false
    };

    assert.equals(
      // when
      target.computeMoveType(board, 1, 1),
      // then
      MoveType.INVALID);
  });

addTest(
  'Can identify move y too far by 1',
  () => {
    // given
    const target = new Pawn({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false,
    };

    assert.equals(
      // when
      target.computeMoveType(board, 3, 0),
      // then
      MoveType.INVALID);
  });

addTest(
  'Can identify move backwards invalid (white)',
  () => {
    // given
    const target = new Pawn({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x, y) => false
    };

    assert.equals(
      // when
      target.computeMoveType(board, 3, 4),
      // then
      MoveType.INVALID);

    assert.equals(
      // when
      target.computeMoveType(board, 3, 5),
      // then
      MoveType.INVALID);
  });

addTest(
  'Can identify move backwards invalid (black)',
  () => {
    // given
    const target = new Pawn({position: [3,3], side: Side.BLACK});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x, y) => false
    };

    assert.equals(
      // when
      target.computeMoveType(board, 3, 2),
      // then
      MoveType.INVALID);

    assert.equals(
      // when
      target.computeMoveType(board, 3, 1),
      // then
      MoveType.INVALID);
  });

addTest(
  'Can identify move right not allowed',
  () => {
    // given
    const target = new Pawn({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false
    };

    assert.equals(
      // when
      target.computeMoveType(board, 4, 3),
      // then
      MoveType.INVALID);

    assert.equals(
      // when
      target.computeMoveType(board, 5, 3),
      // then
      MoveType.INVALID);
  });

addTest(
  'Can identify move left not allowed',
  () => {
    // given
    const target = new Pawn({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false
    };
    assert.equals(
      // when
      target.computeMoveType(board, 2, 3),
      // then
      MoveType.INVALID);

    assert.equals(
      // when
      target.computeMoveType(board, 1, 3),
      // then
      MoveType.INVALID);
  });

addTest(
  'Can identify invalid L moves',
  () => {
    // given
    const target = new Pawn({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true
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
  });

addTest(
  'Can identify invalid diagonal moves',
  () => {
    // given
    const target = new Pawn({position: [3,3], side: Side.WHITE});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false
    };

    [
      [2, 2],
      [1, 1],
      [4, 4],
      [5, 5],
    ].forEach(([x, y]) =>
      assert.equals(
        // when
        target.computeMoveType(board, x, y),
        // then
        MoveType.INVALID,
        `From (3,3) to (${x},${y})`
      ));
  });

addTest(
  'Can identify invalid move due to square occupied (single square move)',
  () => {
    // given
    const target = new Pawn({position: [3,3]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => true
    };
    // when
    const moveType = target.computeMoveType(board, 3, 2);
    // then
    assert.equals(moveType, MoveType.INVALID);
  });

addTest(
  'Can identify invalid move due to square occupied (two square move)',
  () => {
    // given
    const target = new Pawn({position: [3,3]});

    assert.equals(
      // when
      target.computeMoveType({
        isWithinBoundaries: (x,y) => true,
        containsPieceAt: (x,y) => x == 3 && y == 2
      }, 3, 1),
      // then
      MoveType.INVALID);

    assert.equals(
      // when
      target.computeMoveType({
        isWithinBoundaries: (x,y) => true,
        containsPieceAt: (x,y) => x == 3 && y == 1
      }, 3, 1),
      // then
      MoveType.INVALID);
  });

addTest(
  'Can identify valid attacks (white)',
  () => {
    // given
    const target = new Pawn({position: [3,3], side: Side.WHITE});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => true,
      getPieceAt: (x,y) => new Pawn({side: Side.BLACK})
    };

    assert.equals(
      // when
      target.computeMoveType(board, 2, 2),
      // then
      MoveType.ATTACK
    );

    assert.equals(
      // when
      target.computeMoveType(board, 4, 2),
      // then
      MoveType.ATTACK
    );
  });

addTest(
  'Can identify valid attacks (black)',
  () => {
    // given
    const target = new Pawn({position: [3,3], side: Side.BLACK});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => true,
      getPieceAt: (x,y) => new Pawn({side: Side.WHITE})
    };

    assert.equals(
      // when
      target.computeMoveType(board, 4, 4),
      // then
      MoveType.ATTACK
    );

    assert.equals(
      // when
      target.computeMoveType(board, 2, 4),
      // then
      MoveType.ATTACK
    );
  });

addTest(
  'Can identify valid sacrifices (white)',
  () => {
    // given
    const target = new Pawn({position: [3,3], side: Side.WHITE});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => true,
      getPieceAt: (x,y) => new Pawn({side: Side.WHITE})
    };

    assert.equals(
      // when
      target.computeMoveType(board, 2, 2),
      // then
      MoveType.SACRIFICE
    );

    assert.equals(
      // when
      target.computeMoveType(board, 4, 2),
      // then
      MoveType.SACRIFICE
    );
  });

addTest(
  'Can identify valid sacrifices (black)',
  () => {
    // given
    const target = new Pawn({position: [3,3], side: Side.BLACK});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => true,
      getPieceAt: (x,y) => new Pawn({side: Side.BLACK})
    };

    assert.equals(
      // when
      target.computeMoveType(board, 4, 4),
      // then
      MoveType.SACRIFICE
    );

    assert.equals(
      // when
      target.computeMoveType(board, 2, 4),
      // then
      MoveType.SACRIFICE
    );
  });

addTest(
  'Can identify promotion move.',
  () => {
    // given
    const target = new Pawn({position: [1,1]});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false
    };
    assert.equals(
      // when
      target.computeMoveType(board, 1, 0),
      // then
      MoveType.PROMOTION);
  });

addTest(
  'Can identify en-passant attack (white).',
  () => {
    // given
    const target = new Pawn({ side: Side.WHITE, position: [3,3] });
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false,
      enPassant: new Pawn({ side: Side.BLACK, position: [2,3] })
    };
    assert.equals(
      // when
      target.computeMoveType(board, 2, 2),
      // then
      MoveType.EN_PASSANT_ATTACK);
  });

addTest(
  'Can identify en-passant attack (black).',
  () => {
    // given
    const target = new Pawn({ side: Side.BLACK, position: [3,3] });
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => false,
      enPassant: new Pawn({ side: Side.WHITE, position: [4,3] })
    };
    assert.equals(
      // when
      target.computeMoveType(board, 4, 4),
      // then
      MoveType.EN_PASSANT_ATTACK);
  });

addTest(
  'Can identify a promotion attack (white)',
  () => {
    // given
    const target = new Pawn({position: [3,1], side: Side.WHITE});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => x == 4 && y == 0,
      getPieceAt: (x,y) => new Pawn({side: Side.BLACK})
    };

    assert.equals(
      // when
      target.computeMoveType(board, 4, 0),
      // then
      MoveType.PROMOTION_ATTACK
    );
  });

addTest(
  'Can identify a promotion attack (black)',
  () => {
    // given
    const target = new Pawn({position: [6,6], side: Side.BLACK});
    const board = {
      isWithinBoundaries: (x,y) => true,
      containsPieceAt: (x,y) => x == 7 && y == 7,
      getPieceAt: (x,y) => new Pawn({side: Side.WHITE})
    };

    assert.equals(
      // when
      target.computeMoveType(board, 7, 7),
      // then
      MoveType.PROMOTION_ATTACK
    );
  });
