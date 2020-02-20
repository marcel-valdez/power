window.di.inject(({
    Knight,
    MoveType,
    Winner,
    Side,
    addTest,
    assert,
}) => {
    addTest(
        'Can create Knight',
        () => {
            // given
            // when
            const knight = Knight();
            // then
            assert.equals(knight.x, 0);
            assert.equals(knight.y, 0);
        }
    );
});
