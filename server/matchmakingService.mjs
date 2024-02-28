// jshint esversion: 8

import { checkNotNullOrUndefined } from '../core/preconditions.mjs';
import utils from '../core/utils.mjs';
import { MessageType } from '../multiplayer/common.mjs';

async function debug(...args) {
  await utils.debug('[MatchmakingService]', ...args);
}

async function log(...args) {
  await utils.log('[MatchmakingService]', ...args);
}

export default class MatchmakingService {
  constructor(matchmaker) {
    checkNotNullOrUndefined(matchmaker);
    this.matchmaker = matchmaker;
  }

  attach(io) {
    const multiplayer = io.of('/multiplayer');
    multiplayer.on('connection', (socket) => {
      debug('connection:', socket.id);
      socket.on(MessageType.FIND_MATCH, () => {
        debug(`player ${socket.id} is looking for a match.`);
        this.matchmaker.findOpponent({
          id: socket.id,
          opponentFound: (match) => {
            debug(`[opponentFound] socket[${socket.id}].join(${match.matchId})`);
            socket.join(match.matchId);
            socket.emit(MessageType.OPPONENT_FOUND, match);
          }
        });
      });

      socket.on(MessageType.PLAYER_ACTION, (data) => {
        const {
          matchId,
          opponentId,
          src = null,
          dst = null,
          promotion = null,
          resign = false
        } = data;

        debug(
          `socket.id: ${socket.id}`,
          `\n  opponentId: ${opponentId}`,
          `\n  matchId: ${matchId}`,
          `\n  src: ${src} dst: ${dst} promotion: ${promotion} resign: ${resign}`);

        if (resign === true) {
          // TODO: This should also be a board update where the board state is set to ended
          // where the opponent's side wins.
          io.to(opponentId)
            .emit(MessageType.OPPONENT_ACTION, { resign });
        } else {
          debug('this.matchmaker.performUserAction');
          const { board } =
            this.matchmaker.performUserAction(matchId, { src, dst, promotion });
          debug('board.toJson');
          const payload = { board: board.toJson(), src, dst };
          // Inform both players of the new board (post-move)
          // debug('socket.emit MessageType.BOARD_UPDATE');
          // socket.emit(MessageType.BOARD_UPDATE, payload);
          debug(`multiplayer.to(${matchId}).emit MessageType.BOARD_UPDATE`);
          multiplayer.to(matchId).emit(MessageType.BOARD_UPDATE, payload);
        }
      });

      socket.on('disconnect', () => {
        debug('[disconnect]', socket.id);
        // When a player disconnects, regardless of reason, remove the player from the queue.
        this.matchmaker.removePlayerFromQueue(socket.id);
        // TODO: If this player was in a match, then tell their opponent that they left.
        // TODO: Handle what to do about a match where the opponent left.
      });
    });
  }
}
