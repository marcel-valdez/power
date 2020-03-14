# Missing Features

## Local Gameplay Features

- [Bug] When a user undos an action WHILE the AI is thinking, the AI
  still tries to move the original board, we need to "forget" about the
  AI's previous response.
  - Effort: S
  - Value: Medium to High.
  - Suggestion: Keep track of a "compute move ID" which we keep in the state
    only if the response from the engine matches that ID we will use the
    AI's response.
    - Possible issue: If we issue a second calculation request, the Engine
    will use the previous start timer to start the request, we need to
    make the start time a value that is store on a per-request basis, which
    means we need better state management functions, so that we can easily
    extract, pass & read values from the state, there are too many parameters
    right now.
- [Feature] Use animations for battles.
  - Effort: M
  - Value: Medium to High
  - Suggestion: "Vibrate" the battling pieces and then fade out the one that
    lost.
    - When the defender wins:
      - The attacker fades out and at the same time the defender stops
        vibrating.
    - When the attacker wins:
      1. At the same time that the defender fades out, the attacker stops
         vibrating.
      2. Once the defender has faded out, the attacker disappears.
      3. Then instantly reappears in the defender's position.
- [Feature] Add resign button to give up.
  - Effort: S
  - Value: Medium
- [Feature] Allow the user to redo an action.
  - Effort: XS+
  - Value: Medium
  - Ambiguity: Very Low, we use the previous state and restore when the button
    is clicked, this is very easy to implement.
- [Feature] Improve UI to make it more user-friendly (mobile and web).
  - Effort: L-
  - Value: Very High
  - Ambiguity: Medium to High
  - Suggestion:
  - lichess.org UI is pretty simple & good, we can borrow their ideas.
- [Feature] Provide feedback to the user when an invalid action is taken.
  - Effort: S+
  - Value: Medium to Low.
  - Ambiguity: Very Low.

## Multi-player Gameplay Features

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
  - Ambiguity: Very High

## Done Features

- [DONE] ~~AI that plays the game well enough to be challenging~~
  - Effort: M+
  - Value: Very High
  - Ambiguity: Medium to High
- [DONE] ~~Allow the user to undo an action.~~
  - Effort: S+
  - Value: Very High
  - Ambiguity: Very Low, we use the previous state and restore when the button
    is clicked, this is very easy to implement.
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
- [DONE] ~~Indicate what the probability of winning is when attacking a piece.~~
  - Effort: S
  - Value: Very High
  - We could show the probability when you click on a piece and then hover over an enemy
    piece.
- ~~[DONE] Declare a winner when the game ends.~~
  - Effort: S
  - Value: Very High
