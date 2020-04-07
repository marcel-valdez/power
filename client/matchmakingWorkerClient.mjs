// jshint esversion: 8

import utils from '../core/utils.mjs';
import { ClientAction } from '../multiplayer/common.mjs';


async function debug(...args) {
  await utils.debug('[MatchmakingWorkerClient]', ...args);
}

async function log(...args) {
  await utils.log('[MatchmakingWorkerClient]', ...args);
}

async function error(...args) {
  await utils.error('[MatchmakingWorkerClient]', ...args);
}


/**
 * Adapter between the matchmaking web worker and the main app UI.
 */
export class MatchmakingWorkerClient {
  constructor({
    onConnected = () => { },
    onDisconnected = () => { },
    onMatchStarted = () => { },
    onBoardUpdate = () => { }
  }) {
    this.worker = new Worker('multiplayer/matchmakingWorker.mjs', { type: 'module' });
    this.onConnected = onConnected;
    this.onDisconnected = onDisconnected;
    this.onMatchStarted = onMatchStarted;
    this.onBoardUpdate = onBoardUpdate;
    this.config(this.worker);
  }

  connect() {
    debug('[connect]');
    this.worker.postMessage(ClientAction.CONNECT);
  }

  disconnect() {
    debug('[disconnect]');
    this.worker.postMessage(ClientAction.DISCONNECT);
  }

  findMatch() {
    debug('[findMatch]');
    this.worker.postMessage(ClientAction.FIND_MATCH);
  }

  resign() {
    debug('[resign]');
    this.worker.postMessage(ClientAction.RESIGN);
  }

  sendMove(action) {
    debug('[sendMove]', action);
    this.worker.postMessage(ClientAction.SEND_MOVE, action);
  }

  handleMessage(type, ...args) {
    debug('[handleMessage]', type);
    switch (type) {
      case ClientEvent.CONNECTED:
        this.onConnected();
        break;
      case ClientEvent.DISCONNECTED:
        this.onDisconnected();
        break;
      case ClientEvent.MATCH_STARTED:
        this.onMatchStarted(...args);
        break;
      case ClientEvent.BOARD_UPDATED:
        this.onBoardUpdate(...args);
        break;
      default:
        error('Unknown type:', type);
        throw Error('Unknown message type: ' + type);
    }
  }

  config(worker) {
    worker.addEventListener(
      'message',
      ([type, ...args]) => this.handleMessage(type, ...args)
    );
  }
}

let client;


export default function (...args) {
  if (client === null || client === undefined) {
    client = new MatchmakingWorkerClient(...args);
  }

  return client;
}
