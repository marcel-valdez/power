
const Winner = Object.freeze({
    ATTACKER: 'ATTACKER',
    DEFENDER: 'DEFENDER',
});

const MoveType = Object.freeze({
    MOVE: 'MOVE',
    ATTACK: 'ATTACK',
    INVALID: 'INVALID',
    SACRIFICE: 'SACRIFICE',
});

const Side = Object.freeze({
    WHITE: 'WHITE',
    BLACK: 'BLACK',
});

const PieceType = Object.freeze({
    PAWN: 'PAWN',
    KNIGHT: 'KNIGHT',
    ROOK: 'ROOK',
    KING: 'KING',
});

export {
    Winner,
    MoveType,
    Side,
    PieceType,
};
