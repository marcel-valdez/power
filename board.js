import {Winner, PieceType, MoveType} from './power.common.js';
import utils from './utils.js';

const EMPTY_BOARD = Object.freeze([
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
]);

function attack(attacker, defender) {
    let winner;
    if (isKingVsNonKing(attacker, defender)) {
        const king = defender.type === PieceType.KING ? defender : attacker;
        winner = determineWinner(king.power, 0);
    } else {
        winner = determineWinner(attacker.power, defender.power);
    }

    if (winner === Winner.ATTACKER) {
        return {
            result: winner,
            winner: attacker.copy({ power: attacker.power - 1 }),
        }
    } else {
        return {
            result: winner,
            winner: defender.copy({ power: defender.power - 1 }),
        }
    }
}

function isKingVsNonKing(attacker, defender) {
    return attacker.type !== defender.type &&
        attacker.type === PieceType.KING ||
        defender.type === PieceType.KING;
}

function determineWinner(attackPower, defendPower) {
    const winOdds = computeWinOdds(attackPower, defendPower);
    if (realizeOdds(winOdds)) {
        return Winner.ATTACKER;
    } else {
        return Winner.DEFENDER;
    }
}

function computeWinOdds(attackPower, defendPower) {
    const delta = 1 + Math.abs(attackPower - defendPower);
    const odds = 1 / (2**delta);

    if (attackPower >= defendPower) {
        return 1 - odds;
    } else {
        return odds;
    }
}

function realizeOdds(winOdds) {
    return Math.random() < winOdds;
}

function computeSacrificePower(ownerPower, sacrificePower) {
    if (ownerPower < 0) {
        if (ownerPower > sacrificePower) {
            return ownerPower;
        } else if (ownerPower === sacrificePower) {
            return ownerPower + 1;
        } else {
            return ownerPower + (sacrificePower - ownerPower);
        }
    } else {
        if (sacrificePower < 0) {
            return ownerPower;
        } else {
            return ownerPower + sacrificePower + 1;
        }
    }
}

function promotePawn() {
    // TODO: Implement pawn promotion
}

function sacrifice(owner, sacrificed) {
    return owner.copy({ power: computeSacrificePower(owner.power, sacrificed.power) });
}

function setPiece(rows, newPiece, x, y) {
    return rows.map((row, rowIdx) => {
        if (rowIdx === y) {
            return row.map((cell, colIdx) => {
                if (colIdx === x) {
                    return newPiece;
                } else {
                    return cell;
                }
            });
        } else {
            return row;
        }
    });
}

function removePiece(squares, x, y) {
    return setPiece(squares, null, x, y);
}

function movePiece(squares, src, dst) {
    const [x1, y1] = src;
    const [x2, y2] = dst;
    const srcPiece = squares[y1][x1];
    if (srcPiece === null || srcPiece === undefined) {
        throw `There is no piece to move at (${src})!!`;
    }

    const pickedupPieceSquares = removePiece(squares, x1, y1);
    const movedPiece = srcPiece.copy({ position: dst });
    const droppedPieceSquares = setPiece(pickedupPieceSquares, movedPiece, x2, y2);
    return droppedPieceSquares;
}

function Board(state = { squares: EMPTY_BOARD}) {
    const _state = Object.freeze(Object.assign({}, state));

    this.setup = () => {
        // NO-OP for now
    };


    this.copy = (copyState = null) => {
        if (copyState === null) {
            return this;
        }

        const newState = Object.assign({}, _state, copyState);
        return new Board(newState);
    }

    this.makeMove = (src, dst) => {
        const [x1, y1] = src;
        const [x2, y2] = dst;
        if (x1 === x2 && y1 === y2) {
            throw `Source (${src}) and destination (${dst}) for a move can't be the same.`;
        }

        const srcPiece = this.getPieceAt(x1, y1);
        const dstPiece = this.getPieceAt(x2, y2);
        if (srcPiece === null || srcPiece === undefined) {
            utils.warn(`There is no piece to move at (${src}).`);
            return this;
        }

        const moveType = srcPiece.computeMoveType(this, x2, y2);
        let newBoard = null;
        switch(moveType) {
            case MoveType.INVALID:
                utils.info(`Invalid move from (${src}) to (${dst})`);
                newBoard = this;
                break;
            case MoveType.ATTACK:
                const result = attack(srcPiece, dstPiece);
                return this.copy({
                    squares: removePiece(
                        setPiece(_state.squares, result.winner, x2, y2),
                        x1, y1)
                });
                break;
            case MoveType.MOVE:
                newBoard = this.copy({
                    squares: movePiece(_state.squares, src, dst)
                });
                break;
            case MoveType.SACRIFICE:
                const newPiece = sacrifice(srcPiece, dstPiece);
                newBoard = this.copy({
                    squares: removePiece(
                        setPiece(_state.squares, newPiece, x2, y2),
                        x1, y1
                    )
                });
                break;
            default:
                throw `${moveType} is not supported.`;
        }

        return newBoard;
    };

    this.getRow = (rowIdx) => {
        if (rowIdx < 0 || rowIdx > _state.squares.length) {
            throw `Row indices can only be values 0-7. Got: ${rowIdx}.`;
        }

        return Object.freeze(_state.squares[rowIdx]);
    };

    this.getRows = () => {
        return Object.freeze(_state.squares);
    };

    this.getPieceAt = (x,y) => _state.squares[y][x];

    this.containsPieceAt = (x, y) => this.getPieceAt(x, y) !== null;

    this.isWithinBoundaries = (x, y) => {
        return x >= 0 && y >= 0 &&
            _state.squares.length > y && _state.squares[0].length > x;
    };

    this.setup();
    return this;
}

export { Board, computeWinOdds, computeSacrificePower };
