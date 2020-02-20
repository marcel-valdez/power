window.di.inject(_ => {
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

    return {
        Winner,
        MoveType,
        Side
    };
});
