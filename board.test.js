window.di.inject(({
    power: {
        Board,
    },
    testing: {
        addTest,
        assert,
        debug,
    }
}) => {
    addTest('Can create board', () => {
        // given
        // when
        const board = new Board();
        // then
        assert.notNull(board);
    });
});
