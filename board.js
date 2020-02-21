import {Winner, PieceType} from './power.common.js';

const log = (msg) => console && console.log(msg);

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
            attacker: attacker.reducePower(),
            defender: defender.kill(),
        }
    } else {
        return {
            result: winner,
            attacker: attacker.kill(),
            defender: defender.reducePower(),
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
    let odds = 0.5;
    const delta = Math.abs(attackPower - defendPower);
    for (const i = 0; i < delta; i++) {
        odds = odds / 2;
    }

    if (attackPower >= defendPower) {
        return 1 - odds;
    } else {
        return odds;
    }
}

function realizeOdds(winOdds) {
    return getRandomNumber(1, 10000) <= winOdds * 10000;
}


function sacrifice(owner, sacrificed) {
    return {
        owner: owner.copy({ power: owner.power + sacrificed.power }),
        sacrificed: sacrificed.kill(),
    };
}

function move(
    piece,
    from = [fromX = 0, fromY = 0] = [],
    to = [toX = 0, toY = 0] = []) {
}

function Board(state = { squares: []}) {
    const _state = Object.assign({}, state);

    this.setup = () => {
        // NO-OP for now
    };

    this.movePiece = (from, to) => {
        // get the piece at 'from'
        const piece = getPieceAt(...from);
        if (!piece) {
             log(`There is no piece to move at (${...from}).`);
             return this;
        }
        // get the move type according to destination
        const moveType = piece.computeMoveType(...to);
        switch(moveType) {
            case MoveType.INVALID:
                log(`Invalid move from (${...from}) to (${...to})`);
                return this;
                break;
            case MoveType.ATTACK:
                break;
            case MoveType.MOVE:
                // create new state variable using every variable EXCEPT
                // the thing that changed (rows and columns where the piece)
                // moved
                break;
            case MoveType.SACRIFICE:
                break;
        }
        // execute the method that corresponds to the move type
        // return new board with the result
        throw "Not implemented yet";
    };

    this.getPieceAt = (x,y) => {
        return _state.squares[y][x];
    };

    this.containsPieceAt = (x, y) => {
        return this.getPieceAt(x, y) !== null;
    };

    this.isWithinBoundaries = (x, y) => {
        throw "Not implemented yet";
    };

    this.setup();
    return this;
}

export { Board };
