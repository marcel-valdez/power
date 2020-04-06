// jshint esversion: 8

import io from 'socket.io-client';
import { checkNotNullOrUndefined } from '../core/preconditions.mjs';
import utils from '../core/utils.mjs';
import { ClientState, MessageType } from '../multiplayer/common.mjs';

const { isNullOrUndefined } = utils;

async function debug(...args) {
  await utils.debug('[MatchmakingClient]', ...args);
}

async function warn(...args) {
  await utils.warn('[MatchmakingClient]', ...args);
}

async function error(...args) {
  await utils.error('[MatchmakingClient]', ...args);
}

async function log(...args) {
  await utils.log('[MatchmakingClient]', ...args);
}

const IO_CONFIG = {
  pingTimeout: 30000,
  pingInterval: 2000,
  autoReconnect: false,
  autoConnect: false,
  forceNew: true
};


export default class MatchmakingClient {
  constructor({
    onConnected = () => {},
    onDisconnected = () => {},
    onOpponentFound = () => {},
    onBoardUpdate = () => {},
    serverUrl = "/multiplayer",
    state = ClientState.DISCONNECTED
  }) {
    checkNotNullOrUndefined(serverUrl);
    checkNotNullOrUndefined(state);

    this.state = state;
    this.serverUrl = serverUrl;
    this.match = null;
    this.onConnected = onConnected;
    this.onDisconnected = onDisconnected;
    this.onOpponentFound = onOpponentFound;
    this.onBoardUpdate = onBoardUpdate;
  }


  connect() {
    this.socket = io(this.serverUrl, IO_CONFIG);
    this._configConnection(this.socket);
    this._configOpponentFound(this.socket);
    this._configBoardUpdate(this.socket);
    log('[connect] socket.connect()');
    this.socket.connect();
  }


  _configConnection(socket) {
    checkNotNullOrUndefined(socket);
    socket.on('connect', () => {
      log('[_configConnection] connected');
      this.state = ClientState.CONNECTED;
      try {
        this.onConnected(socket.id);
      } catch (e) {
        log('Error while calling onConected handler', e.stack);
      }
    });

    socket.on('disconnect', () => {
      log('[_configConnection] disconnected');
      this.state = ClientState.DISCONNECTED;
      try {
        this.onDisconnected();
      } catch (e) {
        warn('Error while calling onDisconected handler\n', e.stack);
      }
    });
  }


  disconnect() {
    if (this.socket.connected) {
      log('[disconnect] socket.disconnect()');
      this.socket.disconnect();
    }
  }


  findMatch() {
    log('[findMatch] Finding match.');
    this.socket.emit(MessageType.FIND_MATCH);
    this.state = ClientState.FINDING_MATCH;
  }


  _configOpponentFound(socket) {
    checkNotNullOrUndefined(socket);
    socket.on(MessageType.OPPONENT_FOUND, (match) => {
      const { matchId, opponentId, playerSide } = match;
      log(`[_configOpponentFound] matchId: ${matchId}`,
        `  opponentId: ${opponentId}`,
        `  playerSide: ${playerSide}`);
      this.match = match;
      this.state = ClientState.MATCH_STARTED;
      try {
        this.onOpponentFound({ playerSide });
      } catch (e) {
        warn('Error while calling onOpponentFound handler\n', e.stack);
      }
    });
  }


  sendAction(action = { src: null, dst: null, promotion: null, resign: false }) {
    if (isNullOrUndefined(action)) {
      error('[sendAction] Action was null, cannot send.');
      checkNotNullOrUndefined(action);
    } else {
      const payload = Object.assign({}, this.match, action);
      this.socket.emit(MessageType.PLAYER_ACTION, payload);
    }
  }


  _configBoardUpdate(socket) {
    checkNotNullOrUndefined(socket);
    socket.on(MessageType.BOARD_UPDATE, (data) => {
      log('[_configBoardUpdate] Received board update');
      try {
        this.onBoardUpdate(data);
      } catch (e) {
        warn('Error while calling onBoardUpdate handler\n', e.stack);
      }
    });
  }
}
