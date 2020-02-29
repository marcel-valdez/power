# Power: The strategy game

Power is a turn-based strategy game where the goal is to kill the enemy King.

It has some similarities to chess, except when you "kill" a piece there is a probability that you lose the "battle" and lose your attacking piece.


## Types of Moves

- **Move**: The piece moves from one square to another. Different pieces have different movement patterns.
- **Attack**: The piece attacks an enemy piece, if it "wins" the battle, it will occupy the enemy's position. If it loses, the enemy stays put and becomes "weak". Different pieces have different attack patterns (directions in which they can attack).
  - If a weak piece attacks an equally weak or strong piece, then the odds of beating each other is 50%.
  - If a weak piece is attacked (or attacks) a healthy enemy piece, then it has 25% chance of winning the battle.
    - If the weak piece survives and attacks yet again, it will have 12.5% chance of winning another battle against another healthy enemy.
- **Sacrifice**: A piece can sacrifice an ally to make itself stronger in battles, this takes up a
turn and the sacrificed piece goes away. The King can't sacrifice anyone.
  - If a weak piece sacrifices an ally to make itself healthy, it will again have 50% chance of
  beating a healthy enemy.
  - If a healthy piece sacrifices an ally to make itself strong, it will have 75% chance of beating
  a healthy enemy.
    - If the strong piece survives the battle, it will go back to having 50% chance of beating a
    healthy enemy.
  - If a strong piece sacrifices yet another ally, it will have 87.5% chance of beating a healthy
  enemy.
    - If the stronger piece survives the battle, it will go back to having 75% chance of beating a
    healthy enemy.
    - If the stronger piece attacks a strong piece, it will have 75% chance of beating it.
    - If the stronger piece attacks a weak piece, it will have 93.75% chance of beating it.
    - And so forth...

## Pieces

- **Pawn**:
  - It can move forwards 1 or 2 of squares.
  - It can only attack an enemy that is directly next to it in a front diagonal.
    - If it passes an enemy pawn when moving 2 squares, the enemy pawn can attack it "en passant",
    meaning the enemy can attack the pawn as if it had only moved 1 square forwards, if the enemy
    wins the battle, then the enemy moves 1 square diagonally forwards as if it had done a normal
    attack.
  - It can only sacrifice an ally that is directly next to it in diagonal.
  - If it reaches the other end of the board, it can be converted into a Knight or Rook.

- **Knight**:
  - It can move one square in any direction.
  - It can move 2 squares in any direction if there is a piece in the direction it is moved and the destination square is empty.
  - It can attack an enemy that is behind a piece in any direction.
  - It can sacrifice an ally that is behind a piece in any direction.

- **Rook**:
  - It can move any numbers of squares vertically or horizontally (without skipping pieces).
  - It can attack enemies at any distance vertically or horizontally (without skipping pieces).
  - It can sacrifice an ally at any distance vertically or horizontally (without skipping pieces).

- **King**:
  - It can move one square in any direction.
  - It can attack enemies one square in any direction.
    - When attacked by an enemy, the probability of winning is *purely* determined by the health of the king, the health of the attacking piece does not matter.
    - For example: A healthy king has 50% chance of defeating a strong enemy, but also has 50% chance of defeating a weak enemy.
    - For example: A weak king has 25% chance of defeating a weaker enemy.
  - It cannot sacrifice allies.

## Board

- The board is a 5x8 square board.
