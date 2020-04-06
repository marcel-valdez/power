// jshint esversion: 8
import { addTest, assert } from '../../tests/test_framework.mjs';
import utils from '../../core/utils.mjs';
import Matchmaker from '../../server/matchmaker.mjs';

const { timeout } = utils;

addTest(
  'Can wait for opponent',
  () => {
    // given
    const target = new Matchmaker();
    const player =
      { id: 123, opponentFound: ({ opponentId }) => player.opponent = opponentId };
    // when
    target.findOpponent(player);
    // then
    assert.equals(player.opponent, undefined);
  }
);

addTest(
  'Can\'t matchmake a player against themselves',
  async () => {
    // given
    const target = new Matchmaker();
    const player =
      { id: 123, opponentFound: ({ opponentId }) => player.opponent = opponentId };

    await target.findOpponent(player);
    await timeout(10);
    // when
    const foundOpponent = await target.findOpponent(player);
    // then
    assert.equals(foundOpponent, false);
    assert.isNull(player.opponent);
  }
);


addTest(
  'Can Match-make two opponents',
  async () => {
    // given
    const target = new Matchmaker();
    const player1 =
      { id: 123, opponentFound: ({ opponentId }) => player1.opponent = opponentId };
    const player2 =
      { id: 456, opponentFound: ({ opponentId }) => player2.opponent = opponentId };

    await target.findOpponent(player1);

    // when
    await target.findOpponent(player2);
    // then
    assert.equals(player1.opponent, player2.id);
    assert.equals(player2.opponent, player1.id);
  }
);

addTest(
  'Can Match-make three opponents',
  async () => {
    // given
    const target = new Matchmaker();
    const player1 =
      { id: 123, opponentFound: ({ opponentId: id }) => player1.opponent = id };
    const player2 =
      { id: 456, opponentFound: ({ opponentId: id }) => player2.opponent = id };
    const player3 =
      { id: 789, opponentFound: ({ opponentId: id }) => player3.opponent = id };

    await target.findOpponent(player1);
    await target.findOpponent(player2);
    // when
    await target.findOpponent(player3);
    // then
    assert.equals(player1.opponent, player2.id);
    assert.equals(player2.opponent, player1.id);
    assert.equals(player3.opponent, undefined);
  });

addTest('Can get match between two players',
  () => {
    // given
    const matchId = 'p1p2';
    const target = new Matchmaker();
    const storedMatch = target._createMatch('p1', 'p2');
    // when
    const match = target.getMatch(matchId);
    // then
    assert.notNull(match);
    assert.equals(match, storedMatch);
    assert.notNull(match.board);
  });

addTest('Gets the same instance if requested twice',
  () => {
    // given
    const player1Id = '123';
    const player2Id = '456';
    const target = new Matchmaker();
    const theMatch = target.getMatch(player1Id, player2Id);
    // when
    const otherMatch = target.getMatch(player1Id, player2Id);
    // then
    assert.areSame(theMatch, otherMatch);
  });

addTest(
  'Performing a user action returns the updated match state',
  () => {
    // given
    const target = new Matchmaker();
    const origMatch = target._createMatch('p1', 'p2');
    const matchId = origMatch.id;
    assert.notNull(origMatch.board.getPieceAt(0, 0));
    // when
    const match = target.performUserAction(matchId, {
      src: [0, 0], dst: [0, 1]
    });
    // then
    assert.notNull(match);
    assert.notNull(match.board);
    assert.notDeepEquals(match.board.getRows(), origMatch.board.getRows());
    assert.isNull(match.board.getPieceAt(0, 0));
    assert.notNull(origMatch.board.getPieceAt(0, 0));
    assert.equals(
      match.board.getPieceAt(0, 1).type,
      origMatch.board.getPieceAt(0, 0).type);
  }
);

addTest(
  'Performing a user action updates the stored match',
  () => {
    // given
    const target = new Matchmaker();
    const origMatch = target._createMatch('p1', 'p2');
    const matchId = origMatch.id;
    const updatedMatch = target.performUserAction(matchId, {
      src: [0, 0], dst: [0, 1]
    });
    // when
    const storedMatch = target.getMatch(matchId);
    // then
    assert.notNull(storedMatch);
    assert.notNull(storedMatch.board);
    assert.areSame(storedMatch, updatedMatch);
  }
);