window.di.inject(({
    power: {Winner}
}) => {
    function computeWinOdds(attackPower, defendPower) {
        let odds = 0.5;
        // TODO: Check if piece is the king.
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

    function determineWinner(attackPower, defendPower) {
        const winOdds = computeWinOdds(attackPower, defendPower);
        if (realizeOdds(winOdds)) {
            return Winner.ATTACKER;
        } else {
            return Winner.DEFENDER;
        }
    }

    function attack(attacker, defender) {
        const winner = determineWinner(attacker.power, defender.power);
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
        const _state = Object.assign({}, state, { squares: []});

        this.setup = () => {
            throw "Not implemented yet";
        };

        this.movePiece = (from, to) => {
            throw "Not implemented yet";
        };

        this.getPieceAt = (x,y) => {
            throw "Not implemented yet";
        };

        this.containsPieceAt = (x, y) => {
            throw "Not implemented yet";
        };

        this.isWithinBoundaries = (x, y) => {
            throw "Not implemented yet";
        };

        return this;
    }

    return {
        power: {
            Board,
        }
    };
});
