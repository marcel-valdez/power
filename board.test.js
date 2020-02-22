import {Board} from './board.js';
import {Knight} from './knight.js';
import {PieceType} from './power.common.js'
import {addTest, assert} from './test_framework.js';
import utils from './utils.js';


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
    const actualPiece = board.getPieceAt(0, 1);
    // then
    assert.areSame(actualPiece, knight);
});

addTest('Can move piece', () => {
    // given
    utils.enableDebug();
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
