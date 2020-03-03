# Missing Features

- [DONE] ~~Change the way we highlight the squares of the last move to something more
  intuitive.~~
  - Effort: XS-
  - Value: High
  - Fix bug where if you click the piece you want to move, we no longer highlight the
    piece that was previously moved.
- [DONE] ~~When clicking a piece, highlight the valid squares the piece can move to.~~
  - Effort: S
  - Value: Very high
  - Also highlight with green the square the mouse hovers over if it can move there
    and highlight with red when it is invalid.
- [DONE] ~~Indicate on the piece square what its current power is.~~
  - Effort: S
  - Value: Very High
- Indicate what the probability of winning is when attacking a piece.
  - Effort: S
  - Value: Very High
  - We could show the probability when you click on a piece and then hover over an enemy
    piece.
- Allow the user to undo an action.
  - Effort: S+
  - Value: Very High
  - Ambiguity: Very Low, we use the previous state and restore when the button is
  clicked, this is very easy to implement.
- Declare a winner when the game ends.
  - Effort: S
  - Value: High
- Provide feedback to the user when an invalid action is taken.
  - Effort: S+
  - Value: Medium to High.
  - Ambiguity: Very Low.
- Use animations for battles.
  - Effort: M
  - Value: Medium to High
  - Suggestion: "Vibrate" the battling pieces and then fade out the one that lost.
- Improve UI to make it more user-friendly (mobile and web).
  - Effort: L-
  - Value: Very High
  - Ambiguity: Medium to High
  - Suggestion: lichess.org UI is pretty simple & good, we can borrow their ideas.
- Multi-player Capabilities
  - Effort: XXL
  - Value: Very High
  - Ambiguity: High
  - Incremental delivery:
    - Two people can play together, nothing is recorded, nothing is stored.
      - Effort: M+
      - Value: High
      - Ambiguity: Medium to Low
      - A lot of tooling exist for simple P2P interactions, we could use that.
    - We keep track of people's ELO as they play together.
      - Effort: L-
      - Value: High
      - Ambiguity: Medium to High
      - A lot of tooling exists to store simple values. ELO can be calculated on the
        client-side, but this would require us to obfuscate the JS code so that users
        can't hack the system, at this point we need to setup some sort of server-side
        processing.
    - Implement a simple match-making mechanism so people can play together.
      - Effort: M+
      - Value: High
      - Ambiguity: High
      - The simplest thing is to implement this in such a way that we exponentially
        double the ELO gap every X seconds when "waiting" for an opponent.
- Figure out how to monetize the multi-player game.
  - Effort: L
  - Value: Very High
  - Ambiguity: High