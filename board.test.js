
import {Board} from './board.js';
import {Knight} from './knight.js';
import {addTest, debug, assert} from './test_framework.js';


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
    const actual = board.getPieceAt(0, 1);
    // then
    assert.areSame(actual, knight);
});

addTest('Can move piece', () => {
    // given
    const knight = new Knight();
    const board = new Board({
        squares: [
            [ null ],
            [ knight ],
        ]
    });
    assert.areSame(board.getPieceAt(0, 1), knight);
    // when
    const actualBoard = board.movePiece([0, 1], [0, 0]);
    // then
    assert.areSame(actualBoard.getPieceAt(0, 0), knight);
});
