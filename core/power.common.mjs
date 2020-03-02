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

export {
  Winner,
  MoveType,
  Side,
  PieceType,
};
