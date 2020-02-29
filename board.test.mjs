import {
  Board,
  computeWinOdds,
  computeSacrificePower
} from './board.mjs';
import {Knight} from './knight.mjs';
import {PieceType, Side} from './power.common.mjs'
import {addTest, assert} from './test_framework.mjs';
import utils from './utils.mjs';


addTest('Can create board', () => {
  // given
  // when
  const board = new Board();
  // then
  assert.notNull(board);
});

addTest('Can get piece', () => {
  // given
  const knight = new Knight();
  const board = new Board({
    squares: [
      [ null ],
      [ knight ],
    ]
  });
  // when
  const actualPiece = board.getPieceAt(0, 1);
  // then
  assert.areSame(actualPiece, knight);
});

addTest('Can get row', () => {
  // given
  const squares = [
    [ null ],
    [ new Knight() ],
  ];
  const board = new Board({ squares });
  // when
  const row0 = board.getRow(0);
  const row1 = board.getRow(1);
  // then
  assert.areSame(row0, squares[0]);
  assert.areSame(row1, squares[1]);
});

addTest('Can move piece', () => {
  // given
  utils.enableDebug();
  const knight = new Knight({position: [0, 1]});
  const board = new Board({
    squares: [
      [ null ],
      [ knight ],
    ]
  });
  assert.areSame(board.getPieceAt(0, 1), knight);
  assert.equals(board.getPieceAt(0, 0), null);
  // when
  const actualBoard = board.makeMove([0, 1], [0, 0]);
  // then
  assert.areSame(actualBoard.getPieceAt(0, 0).type, PieceType.KNIGHT);
});

addTest('Can kill piece', () => {
  // given
  utils.enableDebug();
  const attacker = new Knight({position: [0, 0], side: Side.WHITE});
  const ignored = new Knight({position: [0, 1], side: Side.BLACK});
  const defender = new Knight({position: [0, 2], side: Side.BLACK});
  const board = new Board({
    squares: [
      [ attacker ],
      [ ignored ],
      [ defender ],
    ]
  });
  assert.areSame(board.getPieceAt(0, 0), attacker);
  assert.areSame(board.getPieceAt(0, 1), ignored);
  assert.areSame(board.getPieceAt(0, 2), defender);
  // when
  const actualBoard = board.makeMove([0, 0], [0, 2]);
  // then
  assert.areSame(actualBoard.getPieceAt(0, 2).power, -1);
});

addTest('Can compute win odds', () => {
  // given
  [
    [-2, -2, 0.5],
    [-1, -1, 0.5],
    [0, 0, 0.5],
    [1, 1, 0.5],
    [2, 2, 0.5],

    [-2, -1, 0.25],
    [-1, 0, 0.25],
    [0, 1, 0.25],
    [1, 2, 0.25],
    [2, 3, 0.25],

    [-1, 1, 0.125],
    [-2, 0, 0.125],
    [0, 2, 0.125],
    [1, 3, 0.125],
    [2, 4, 0.125],

    [-2, -3, 0.75],
    [-1, -2, 0.75],
    [0, -1, 0.75],
    [1, 0, 0.75],
    [2, 1, 0.75],

    [-2, -4, 0.875],
    [-1, -3, 0.875],
    [0, -2, 0.875],
    [1, -1, 0.875],
    [2, 0, 0.875],
  ].map(([attackPower, defendPower, expectedOdds]) => {
    // when
    const actualOdds = computeWinOdds(attackPower, defendPower);
    // then
    assert.equals(actualOdds, expectedOdds);
  });
});

addTest('Can sacrifice piece', () => {
  // given
  utils.enableDebug();
  const attacker = new Knight({position: [0, 0], side: Side.WHITE});
  const ignored = new Knight({position: [0, 1], side: Side.BLACK});
  const sacrificed = new Knight({position: [0, 2], side: Side.WHITE});
  const board = new Board({
    squares: [
      [ attacker ],
      [ ignored ],
      [ sacrificed ],
    ]
  });
  assert.areSame(board.getPieceAt(0, 0), attacker);
  assert.areSame(board.getPieceAt(0, 1), ignored);
  assert.areSame(board.getPieceAt(0, 2), sacrificed);
  // when
  const actualBoard = board.makeMove([0, 0], [0, 2]);
  // then
  assert.equals(actualBoard.getPieceAt(0, 2).power, 1);
});

addTest('Can compute sacrifice power', () => {
  // given
  [
    [-2, -2, -1],
    [-1, -1, 0],
    [0, 0, 1],
    [1, 1, 3],
    [2, 2, 5],

    [-2, -1, -1],
    [-1, 0, 0],
    [0, 1, 2],
    [1, 2, 4],
    [2, 3, 6],

    [-1, 1, 1],
    [-2, 0, 0],
    [0, 2, 3],
    [1, 3, 5],
    [2, 4, 7],

    [-2, -3, -2],
    [-1, -2, -1],
    [0, -1, 0],
    [1, 0, 2],
    [2, 1, 4],

    [-2, -4, -2],
    [-1, -3, -1],
    [0, -2, 0],
    [1, -1, 1],
    [2, 0, 3],
    [2, 1, 4],
  ].map(([attackPower, sacrificedPower, expectedPower]) => {
    // when
    const actualPower = computeSacrificePower(attackPower, sacrificedPower);
    // then
    assert.equals(
      actualPower,
      expectedPower,
      `owner: ${attackPower}, sacrifice: ${sacrificedPower}`);
  });
});
