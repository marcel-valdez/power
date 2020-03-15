import {
  GameStatus,
  MoveType,
  PieceType,
  Side
} from '../core/power.common.mjs';

const PIECE_TYPE_HASH = {};
const SIDE_HASH = {};

function initialize() {
  PIECE_TYPE_HASH[PieceType.PAWN] = 0b00;
  PIECE_TYPE_HASH[PieceType.KNIGHT] = 0b01;
  PIECE_TYPE_HASH[PieceType.ROOK] = 0b10;
  PIECE_TYPE_HASH[PieceType.KING] = 0b11;

  SIDE_HASH[Side.WHITE] = 0b0;
  SIDE_HASH[Side.BLACK] = 0b1;
}

initialize();

const pieceHash = (piece) => {
  if (piece === null) {
    return 1 << 6;
  }

  // Hash: 0000##
  const pieceTypeHash = PIECE_TYPE_HASH[piece.type];
  // Hash: 000#00
  const pieceSideHash = SIDE_HASH[piece.side] << 2;
  // Hash: ###000
  let powerHash = Math.min(Math.abs(piece.power), 3);
  if (piece.power < 0) {
    powerHash = powerHash & 0b100;
  }
  powerHash = powerHash << 3;
  // total bits: 111111 (6 bits, Max value: 2^7 - 1 = 127)
  return pieceTypeHash | pieceSideHash | powerHash;
};

const computeRowHash = (row) => {
  // total bits: 6 * 5 = 30 bits
  return row.map((cell) => pieceHash(cell))
    .map((hash, index) => hash << (index * 6))
    .reduce((a, b) => a | b);
};

export const computeBoardHash = (board) => {
  // total bits: 8 rows * 30 per row = 240 bits
  // max value: 2 ^ 241 - 1 (cannot be represented in an int)
  return board.getRows()
    .map(row => computeRowHash(row))
    .map(x => BigInt(x))
  // shift each by 30 bits to put them at their respective bit position
    .map((hash, index) => hash << (BigInt(30) * BigInt(index)))
  // OR them to get the final UNIQUE hash
    .reduce((a, b) => a | b);
};
