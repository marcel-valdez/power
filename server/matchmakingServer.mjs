// jshint esversion: 8

import Mutex from '../server/mutex.mjs';
import MatchmakingService from '../server/matchmakingService.mjs';
import Matchmaker from '../server/matchmaker.mjs';

export default class MatchmakingServer {
  constructor() {
    this.service = new MatchmakingService(new Matchmaker());
    this.mutex = new Mutex();
    this.started = false;
  }

  start(io) {
    if (this.started === true) {
      throw new Error('Server already started');
    }

    this.mutex.lock();
    try {
      if (this.started === true) {
        throw new Error('Server already started');
      }

      this.service.attach(io);
      this.started = true;
    } finally {
      this.mutex.unlock();
    }
  }
}