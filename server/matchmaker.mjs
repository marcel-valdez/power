// jshint esversion: 8

import { Board } from '../core/board.mjs';
import Mutex from '../server/mutex.mjs';
import utils from '../core/utils.mjs';
import { checkNotNullOrUndefined } from '../core/preconditions.mjs';
import { Side } from '../core/power.common.mjs';

const { isNullOrUndefined } = utils;

// TODO: This is doing two distinct things, matching two users
// and performing user actions on their respective match.
// We should at the very least delegate match-playing to
// another class.
export default class Matchmaker {
  constructor({ playerQueue, matches } = {}) {
    this.playersMutex = new Mutex();
    this.matchesMutex = new Mutex();
    this.matches = matches || {};
    this.playerQueue = playerQueue || [];
  }


  async findOpponent({ id, opponentFound }) {
    checkNotNullOrUndefined(id);
    checkNotNullOrUndefined(opponentFound);

    const opponent = await this._dequeuePlayer();
    if (isNullOrUndefined(opponent) || opponent.id === id) {
      this._enqueuePlayer({ id, opponentFound });
      // TODO: Start a promise that will wait 4 hours
      // and then remove the player from the queue
      return false;
    } else {
      const match = this._createMatch(id, opponent.id);
      opponentFound({
        matchId: match.id,
        opponentId: opponent.id,
        playerSide: match.white === id ? Side.WHITE : Side.BLACK
      });
      opponent.opponentFound({
        matchId: match.id,
        opponentId: id,
        playerSide: match.white === opponent.id ? Side.WHITE : Side.BLACK
      });

      return true;
    }
  }


  async _dequeuePlayer() {
    let player = null;
    if (this.playerQueue.length > 0) {
      this.playersMutex.lock();
      try {
        if (this.playerQueue.length > 0) {
          player = this.playerQueue.shift();
        }
      } finally {
        this.playersMutex.unlock();
      }
    }

    return player;
  }


  async removePlayerFromQueue(id) {
    this.playersMutex.lock();
    try {
      const newPlayerQueue = this.playerQueue.filter(p => p.id !== id);
      const oldPlayerQueue = this.playerQueue;
      this.playerQueue = newPlayerQueue;

      return newPlayerQueue.length === oldPlayerQueue.length;
    } finally {
      this.playersMutex.unlock();
    }
  }


  async _enqueuePlayer(player) {
    checkNotNullOrUndefined(player);
    if (this.playerQueue.find(p => p.id === player.id) !== undefined) {
      return false;
    }

    this.playersMutex.lock();
    try {
      if (this.playerQueue.find(p => p.id === player.id) !== undefined) {
        return false;
      }

      this.playerQueue.push(player);
    } finally {
      this.playersMutex.unlock();
    }


    return true;
  }


  getMatch(matchId) {
    checkNotNullOrUndefined(matchId);
    return this.matches[matchId];
  }

  _createMatch(player1, player2) {
    const match = this._genMatch(player1, player2);
    this._updateMatch(match);
    return match;
  }

  _genMatch(player1, player2) {
    const id = this._genMatchId(player1, player2);
    const { player1Side, player2Side } = this._genPlayerSides();
    return {
      id,
      board: new Board(),
      white: player1Side === Side.WHITE ? player1 : player2,
      black: player2Side === Side.BLACK ? player2 : player1
    };
  }


  performUserAction(
    matchId,
    { src = null, dst = null, promotion = null, resign = false }) {

    const origMatch = this.getMatch(matchId);

    if (resign === true) {

    } else {
      let newBoard = origMatch.board.makeMove(src, dst);
      if (newBoard.pendingPromotion) {
        checkNotNullOrUndefined(promotion);
        newBoard = newBoard.setPromotion(promotion);
      }

      const newMatch = Object.assign({}, origMatch, { board: newBoard });
      this._updateMatch(newMatch);
      return newMatch;
    }
  }


  _updateMatch(match) {
    checkNotNullOrUndefined(match);
    checkNotNullOrUndefined(match.id);
    checkNotNullOrUndefined(match.board);
    checkNotNullOrUndefined(match.white);
    checkNotNullOrUndefined(match.black);

    this.matchesMutex.lock();
    try {
      this.matches[match.id] = match;
    } finally {
      this.matchesMutex.unlock();
    }
  }


  _genMatchId(player1, player2) {
    return player1 + '' + player2;
  }


  _genPlayerSides() {
    const player1IsWhite = Math.random() >= 0.5;
    return {
      player1Side: player1IsWhite ? Side.WHITE : Side.BLACK,
      player2Side: player1IsWhite ? Side.BLACK : Side.WHITE
    };
  }
}
