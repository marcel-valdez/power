const Winner = Object.freeze({
  ATTACKER: 'ATTACKER',
  DEFENDER: 'DEFENDER'
});

const MoveType = Object.freeze({
  MOVE: 'MOVE',
  ATTACK: 'ATTACK',
  INVALID: 'INVALID',
  SACRIFICE: 'SACRIFICE',
  PROMOTION: 'PROMOTION',
  EN_PASSANT_ATTACK: 'EN_PASSANT_ATTACK',
  PROMOTION_ATTACK: 'PROMOTION_ATTACK',
  CASTLE: 'CASTLE'
});

const Side = Object.freeze({
  WHITE: 'WHITE',
  BLACK: 'BLACK'
});

const PieceType = Object.freeze({
  PAWN: 'PAWN',
  KNIGHT: 'KNIGHT',
  ROOK: 'ROOK',
  KING: 'KING'
});

const GameStatus = Object.freeze({
  WHITE_WON: 'WHITE_WON',
  BLACK_WON: 'BLACK_WON',
  IN_PROGRESS: 'IN_PROGRESS'
});

export {
  GameStatus,
  Winner,
  MoveType,
  Side,
  PieceType,
};
