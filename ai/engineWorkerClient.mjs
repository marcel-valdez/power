// jshint esversion: 8

import random from '../core/random.mjs';
import utils from '../core/utils.mjs';

const RNG = random();

async function debug(...args) {
  console.log('[EngineWorkerClient]', ...args);
}

async function log(...args) {
  utils.log('[EngineWorkerClient]', ...args);
}

async function warn(...args) {
  utils.warn('[EngineWorkerClient]', ...args);
}

async function error(...args) {
  utils.error('[EngineWorkerClient]', ...args);
}

export class EngineWorkerClient {
  constructor({
    onEngineMove = () => { }
  }) {
    this.onEngineMove = onEngineMove;
    this.worker = new Worker('ai/engineWorker.mjs', { type: 'module' });
    this.engineMoveId = 0;
  }

  _updateEngineMoveId() {
    debug('[_updateEngineMoveId]', this.engineMoveId);
    this.engineMoveId = Math.floor(RNG() * 10000000);
    return this.engineMoveId;
  }

  ignoreIncomingMove() {
    debug('[ignoreIncomingMove]', this.engineMoveId);
    this._updateEngineMoveId();
  }

  genMoveHandler(id, resolve, reject) {
    debug('[genMoveHandler]', id);
    const moveHandler = ({ data: action }) => {
      debug('[genMoveHandler] [moveHandler]', action);
      if (id !== action.engineMoveId) {
        debug(
          '[genMoveHandler] [moveHandler]',
          `The move with id ${action.engineMoveId} was ignored by handler for id ${id}`
        );
        return;
      }

      if (action.engineMoveId !== this.engineMoveId) {
        const msg =
          `Ignored AI's move with id: ${action.engineMoveId}, ` +
          `because we expected id: ${this.state.engineMoveId}`;
        reject(msg);
      } else {
        resolve(action);
      }

      this.worker.removeEventListener('message', moveHandler);
    };

    return moveHandler;
  }

  makeMove(board, cpuSide) {
    debug('[makeMove]');
    new Promise((resolve, reject) => {
      const moveId = this._updateEngineMoveId();
      this.worker.postMessage({
        board: board.toJson(),
        side: cpuSide,
        engineMoveId: moveId
      });
      this.worker.addEventListener(
        'message',
        this.genMoveHandler(moveId, resolve, reject));
    })
      .then(this.onEngineMove)
      .catch(warn);
  }
}

let client;
export default function (...args) {
  if (client === undefined || client === null) {
    client = new EngineWorkerClient(...args);
  }

  return client;
}