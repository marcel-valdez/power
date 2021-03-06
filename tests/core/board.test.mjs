// jshint esversion: 6

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


addTest('Can create board', () => {
  // given
  // when
  const board = new Board();
  // then
  assert.notNull(board);
  assert.areSame(board.gameStatus, GameStatus.IN_PROGRESS);
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

// TODO: Add test for en-passant attack (pawn)

addTest('Can promote piece', () => {
  // given
  const pawn = new Pawn({ position: [0, 1]});
  const board = new Board({
    squares: [
      [ null ],
      [ pawn ],
    ]
  });
  // when
  const actualBoard = board.makeMove([0, 1], [0, 0]);
  // then
  assert.equals(actualBoard.getPieceAt(0, 0).type, PieceType.PAWN);
  assert.equals(actualBoard.pendingPromotion, true);
});

addTest('Can set promoted piece', () => {
  // given
  const pawn = new Pawn({ position: [0, 1]});
  const board = new Board({
    squares: [
      [ null ],
      [ pawn ],
    ]
  });
  const promotionBoard = board.makeMove([0, 1], [0, 0]);
  // when
  const promotedBoard = promotionBoard.setPromotion(PieceType.KNIGHT);
  // then
  assert.equals(promotedBoard.getPieceAt(0, 0).type, PieceType.KNIGHT);
  assert.equals(promotedBoard.pendingPromotion, false);
});

addTest('Can promote piece via attack', () => {
  // given
  const blackPawn = new Pawn({ side: Side.BLACK, position: [0, 0]});
  const whitePawn = new Pawn({ position: [1, 1]});
  const board = new Board({
    squares: [
      [ blackPawn, null ],
      [ null, whitePawn ],
    ]
  });
  // when
  const actualBoard = board.makeMove([1, 1], [0, 0]);
  // then
  // 1. the pawn should be moved to the top
  assert.equals(actualBoard.getPieceAt(0, 0).type, PieceType.PAWN);
  // 2. an external field called "promotion" should be set to true
  assert.equals(actualBoard.pendingPromotion, true);
});

addTest('Can castle the king', () => {
  // given
  const king = new King({ position: [2, 0]});
  const leftRook = new Rook({ position: [0, 0]});
  const rightRook = new Rook({ position: [4, 0]});
  const board = new Board({
    squares: [
      [ leftRook, null, king, null, rightRook ],
    ]
  });

  [
    { kingDst: [0, 0], rookDst: [1,0] },
    { kingDst: [4, 0], rookDst: [3,0] }
  ].forEach(({ kingDst, rookDst }) => {
    const [kingX, kingY] = kingDst;
    const [rookX, rookY] = rookDst;
    // when
    const actualBoard = board.makeMove([2, 0], kingDst);
    // then
    const actualRook = actualBoard.getPieceAt(rookX, rookY);
    const actualKing = actualBoard.getPieceAt(kingX, kingY);

    assert.equals(actualRook.type, PieceType.ROOK);
    assert.equals(actualKing.type, PieceType.KING);
    assert.equals(actualRook.canCastle, false);
    assert.equals(actualKing.canCastle, false);
  });
});

addTest('Can set game ending King vs King (black win)', () => {
  // given
  const whiteKing = new King({
    position: [0, 0],
    side: Side.WHITE,
    power: -200
  });
  const blackKing = new King({
    position: [0, 1],
    side: Side.BLACK,
    power: 200
  });
  const board = new Board({
    squares: [
      [ whiteKing ],
      [ blackKing ],
    ]
  });
  // when
  const endBoard = board.makeMove([0, 1], [0, 0]);
  // then
  assert.equals(endBoard.gameStatus, GameStatus.BLACK_WON);
});

addTest('Can set game ending King vs King (white win)', () => {
  // given
  const whiteKing = new King({
    position: [0, 0],
    side: Side.WHITE,
    power: 200
  });
  const blackKing = new King({
    position: [0, 1],
    side: Side.BLACK,
    power: -200
  });
  const board = new Board({
    squares: [
      [ whiteKing ],
      [ blackKing ],
    ]
  });
  // when
  const endBoard = board.makeMove([0, 1], [0, 0]);
  // then
  assert.equals(endBoard.gameStatus, GameStatus.WHITE_WON);
});


addTest('Can set game ending Rook vs King (white win)', () => {
  // given
  const whiteTower = new Rook({
    position: [0, 0],
    side: Side.WHITE
  });
  const blackKing = new King({
    position: [0, 1],
    side: Side.BLACK,
    power: -200
  });
  const board = new Board({
    squares: [
      [ whiteTower ],
      [ blackKing ],
    ]
  });
  // when
  const endBoard = board.makeMove([0, 1], [0, 0]);
  // then
  assert.equals(endBoard.gameStatus, GameStatus.WHITE_WON);
});

addTest('Can set game ending Rook vs King (black win)', () => {
  // given
  const blackRook = new Rook({
    position: [0, 0],
    side: Side.BLACK
  });
  const whiteKing = new King({
    position: [0, 1],
    side: Side.WHITE,
    power: -200
  });
  const board = new Board({
    squares: [
      [ blackRook ],
      [ whiteKing ],
    ]
  });
  // when
  const endBoard = board.makeMove([0, 0], [0, 1]);
  // then
  assert.equals(endBoard.gameStatus, GameStatus.BLACK_WON);
});

addTest('Can serialize to JSON', () => {
  // given
  const pawn = new Pawn({ side: Side.WHITE });
  const knight = new Knight();
  const rook = new Rook({ side: Side.BLACK });
  const king = new King();
  const expected = {
    gameStatus: GameStatus.IN_PROGRESS,
    squares: [
      [ null, pawn.toJson(), null ],
      [ rook.toJson(), null, king.toJson() ],
    ],
    enPassant: knight.toJson(),
    promotion: null
  };
  const board = new Board({
    squares: [
      [null, pawn, null],
      [rook, null, king]
    ],
    enPassant: knight,
    promotion: null
  });
  // when
  const serialized = board.toJson();
  // then
  assert.deepEquals(serialized, expected);
});


addTest('Can deserialize from JSON', () => {
  // given
  const pawn = new Pawn({ side: Side.WHITE });
  const knight = new Knight();
  const rook = new Rook({ side: Side.BLACK });
  const king = new King();
  const expectedRows = [
    [null, pawn, null],
    [rook, null, king]
  ];
  const input = {
    gameStatus: GameStatus.IN_PROGRESS,
    squares: [
      [ null, pawn.toJson(), null ],
      [ rook.toJson(), null, king.toJson() ]
    ],
    enPassant: knight.toJson(),
    promotion: null
  };
  // when
  const board = Board.fromJson(input);
  // then
  assert.equals(board.gameStatus, GameStatus.IN_PROGRESS);
  assert.equals(board.pendingPromotion, false);
  utils.enableDebug();
  assert.deepEquals(board.enPassant, knight);
  assert.deepEquals(board.getRows(), expectedRows);
});

addTest('Can serialize and deserialize and serialize back', () => {
  // given
  const pawn = new Pawn({ side: Side.WHITE });
  const knight = new Knight();
  const rook = new Rook({ side: Side.BLACK });
  const king = new King();
  const board = new Board({
    gameStatus: GameStatus.IN_PROGRESS,
    squares: [
      [null, pawn, null],
      [rook, null, king]
    ],
    enPassant: knight,
    promotion: null
  });
  const jsonBoard = board.toJson();
  // when
  const actual = Board.fromJson(jsonBoard);
  // then
  assert.deepEquals(actual, board);
});
