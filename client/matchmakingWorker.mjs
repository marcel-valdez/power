// jshint esversion: 8

/**
 * Web worker to interface with the matchmaking server without affecting
 * web page performance.
 */

import utils from '../core/utils.mjs';

import MatchmakingClient from './matchmakingClient.mjs';
import { ClientEvent, ClientAction } from '../multiplayer/common.mjs';
import { checkNotNullOrUndefined } from '../core/preconditions.mjs';


async function debug(...args) {
  utils.debug('[matchmakingWorker]', ...args);
}

async function warn(...args) {
  utils.warn('[matchmakingWorker]', ...args);
}

async function log(...args) {
  utils.log('[matchmakingWorker]', ...args);
}

async function error(...args) {
  utils.error('[matchmakingWorker]', ...args);
}


function onConnected() {
  debug('[onConnected]');
  postMessage(ClientEvent.CONNECTED);
}

function onDisconnected() {
  debug('[onDisconnected]');
  postMessage(ClientEvent.DISCONNECTED);
}

function onOpponentFound(...args) {
  debug('[onOpponentFound]');
  postMessage([ClientEvent.MATCH_STARTED, ...args]);
}

function onBoardUpdate(...args) {
  debug('[onBoardUpdate]');
  postMessage([ClientEvent.BOARD_UPDATED, ...args]);
}

const client = new MatchmakingClient({
  onConnected,
  onDisconnected,
  onOpponentFound,
  onBoardUpdate
});

onmessage = function ([type, ...data]) {
  checkNotNullOrUndefined(type);
  debug('[onmessage]', type);
  switch (type) {
    case ClientAction.CONNECT:
      client.connect();
      break;
    case ClientAction.DISCONNECT:
      client.disconnect();
      break;
    case ClientAction.FIND_MATCH:
      client.findMatch();
      break;
    case ClientAction.SEND_MOVE:
      checkNotNullOrUndefined(data);
      client.sendAction(...data);
      break;
    case ClientAction.RESIGN:
      client.sendAction({ resign: true });
      break;
    default:
      error('Unsupported message type', type);
      break;
  }
};
