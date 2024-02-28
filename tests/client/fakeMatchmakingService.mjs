// jshint esversion: 8


import utils from '../../core/utils.mjs';
import { MessageType, } from '../../multiplayer/common.mjs';
import Mutex from '../../server/mutex.mjs';
import { getResults } from '../test_framework.mjs';

const { resolveTimeout, defer } = utils;


async function debug(...args) {
  utils.debug('[FakeMatchmakingService] ', ...args);
}

export default class FakeMatchmakingService {
  constructor(io_server) {
    this.mutex = new Mutex();
    this.connections = {};
    this.foundMatches = {};
    this.playerActions = {};
    this.disconnections = {};
    this.sockets = {};

    io_server.on('connection', (socket) => {
      debug('New connection: ', socket.id);
      this._resolveConnected(socket.id);
      this._resolveSocket(socket.id, socket);

      socket.on(MessageType.FIND_MATCH, () => this._resolveFindMatch(socket.id));
      socket.on(MessageType.PLAYER_ACTION, (arg) => this._resolvePlayerAction(socket.id, arg));
      socket.on('disconnect', () => this._resolveDisconnected(socket.id));
    });
  }

  _get(id, map) {
    if (map[id] === null || map[id] === undefined) {
      this.mutex.lock();
      if (map[id] === null || map[id] === undefined) {
        map[id] = defer();
      }
      this.mutex.unlock();
    }

    return map[id];
  }

  async _awaitResolve(id, map, timeoutMs = 100) {
    let deferred = this._get(id, map);
    return await resolveTimeout(deferred.promise, timeoutMs);
  }

  _resolveConnected(id) {
    debug('[_resolveConnected]', id);
    this._get(id, this.connections).resolve(true);
  }

  async isConnected(id, timeoutMs = 100) {
    debug('[isConnected]', id);
    return await this._awaitResolve(id, this.connections, timeoutMs);
  }

  _resolveSocket(id, _socket) {
    debug('[_resolveSocket]', id);
    this._get(id, this.sockets).resolve(_socket);
  }

  async getSocket(id, timeoutMs = 100) {
    debug('[getSocket]', id);
    return await this._awaitResolve(id, this.sockets, timeoutMs);
  }

  _resolvePlayerAction(id, action) {
    debug('[_resolvePlayerAction]', id);
    this._get(id, this.playerActions).resolve(action);
  }

  async getPlayerAction(id, timeoutMs = 100) {
    debug('[getPlayerAction]', id);
    return await this._awaitResolve(id, this.playerActions, timeoutMs);
  }

  _resolveDisconnected(id) {
    debug('[_resolveDisconnected]', id);
    this._get(id, this.disconnections).resolve(true);
  }

  async isDisconnected(id, timeoutMs = 100) {
    debug('[isDisconnected]', id);
    return await this._awaitResolve(id, this.disconnections, timeoutMs);
  }

  _resolveFindMatch(id) {
    debug('[_resolveFindMatch]', id);
    this._get(id, this.foundMatches).resolve(true);
  }

  async didFindMatch(id, timeoutMs = 100) {
    debug('[didFindMatch]', id);
    return await this._awaitResolve(id, this.foundMatches, timeoutMs);
  }
}