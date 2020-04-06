// jshint esversion: 8

import express from 'express';
import getPort from 'get-port';
import http from 'http';
import io_server from 'socket.io';
import MatchmakingClient from '../../client/matchmakingClient.mjs';
import utils from '../../core/utils.mjs';
import Matchmaker from '../../server/matchmaker.mjs';
import MatchmakingService from '../../server/matchmakingService.mjs';
import { addSetup, addTeardown, addTest, assert } from '../../tests/test_framework.mjs';

const { resolveTimeout, defer, timeout } = utils;

const context = {
  app: null,
  server: null,
  io_server: null,
  target: null
};

const mutexes = [
  defer()
];
mutexes[0].resolve(true);

// Allows to execute tests one at a time.
function exclusive(fn) {
  const index = mutexes.length - 1;
  mutexes.push(defer());
  return async () => {
    console.log('[exclusive] Waiting for turn');
    await mutexes[index].promise;
    let result;
    try {
      console.log('[exclusive] RUNNING');
      result = await fn();
    } finally {
      console.log('[exclusive] Finishing turn');
      mutexes[index + 1].resolve(true);
    }
    return result;
  };
}


addSetup(async () => {
  utils.debug('START: Server setup');
  utils.debug('context.app');
  context.app = express();
  utils.debug('context.server');
  context.server = http.Server(context.app);
  utils.debug('context.io_server');
  context.io_server = io_server(
    context.server,
    {
      cookie: false,
      pingTimeout: 30000,
      pingInterval: 2000
    }
  );
  utils.debug('context.target');
  context.service = new MatchmakingService(
    new Matchmaker()
  );
  utils.debug('context.service.attach');
  context.service.attach(context.io_server);
  utils.debug('context.port');
  context.port = await getPort({
    port: 3000
  });
  utils.debug(`context.server.listen on ${context.port}`);
  context.server.listen(context.port);
  utils.debug('END: Server setup');
});


addTeardown(async () => {
  utils.debug('START: Server teardown');
  utils.debug('context.io_server.close');

  await resolveTimeout(async () => context.io_server.close(), 1000);
  utils.debug('context.server.close');
  await resolveTimeout(async () => context.server.close(), 1000);
  utils.debug('DONE: Server Teardown');
});


function createClient(args) {
  return new MatchmakingClient(
    Object.assign(
      {},
      args,
      {
        serverUrl: `http://localhost:${context.port}/multiplayer`
      }));
}


function makeEvents(size) {
  const events = [];
  for (let i = 0; i < size; i++) {
    const event = defer();
    events[i] = {
      handler: event.resolve,
      promise: event.promise
    };
  }

  return events;
}


addTest('Test a client can connect to the server', exclusive(async () => {
  // given a client & server
  const client = createClient();
  try {
    // when the client connects
    client.connect();
    // then its socket is connected
    await timeout(40);
    assert.equals(client.socket.connected, true);
  } finally {
    client.disconnect();
  }
}));


addTest('Test two clients can find a match', exclusive(async () => {
  // given two clients are connected to the server
  const oppFoundEvent_1 = defer();
  const client_1 = createClient({
    onOpponentFound: oppFoundEvent_1.resolve,
    onBoardUpdate: () => {
      utils.debug('[A] client_1.onBoardUpdate');
    }
  });
  const oppFoundEvent_2 = defer();
  const client_2 = createClient({
    onOpponentFound: oppFoundEvent_2.resolve,
    onBoardUpdate: () => {
      utils.debug('[B] client_1.onBoardUpdate');
    }
  });
  try {
    client_1.connect();
    client_2.connect();
    await timeout(20);
    //   and one of them starts finding a match
    client_1.findMatch();
    await timeout(20);
    // when a second client starts finding a match
    client_2.findMatch();
    await timeout(20);
    // then they both are told they found an opponent
    const oppFoundValue_1 = await resolveTimeout(oppFoundEvent_1.promise);
    assert.notNull(oppFoundValue_1.playerSide);
    const oppFoundValue_2 = await resolveTimeout(oppFoundEvent_2.promise);
    assert.notNull(oppFoundValue_2.playerSide);
  } finally {
    client_1.disconnect();
    client_2.disconnect();
  }
}));


addTest('Test two clients can find a match and issue a move', exclusive(async () => {
  // given two clients connected
  const connectionEvents = makeEvents(2);
  const oppFoundEvents = makeEvents(2);
  const boardUpdateEvents = makeEvents(2);
  const client_1 = createClient({
    onConnected: connectionEvents[0].handler,
    onOpponentFound: oppFoundEvents[0].handler,
    onBoardUpdate: (...args) => {
      utils.debug('client_1.onBoardUpdate');
      boardUpdateEvents[0].handler(...args);
    }
  });
  const client_2 = createClient({
    onConnected: connectionEvents[1].handler,
    onOpponentFound: oppFoundEvents[1].handler,
    onBoardUpdate: (...args) => {
      utils.debug('client_2.onBoardUpdate');
      boardUpdateEvents[1].handler(...args);
    }
  });
  client_1.connect();
  client_2.connect();
  try {
    await resolveTimeout(Promise.all([
      connectionEvents[0].promise, connectionEvents[1].promise
    ]));
    //   and found a match for each other
    client_1.findMatch();
    await timeout(20);
    client_2.findMatch();
    await resolveTimeout(Promise.all([
      oppFoundEvents[0].promise, oppFoundEvents[1].promise
    ]));
    // when one of the clients issues a move
    client_1.sendAction({
      src: [0, 0],
      dst: [0, 1]
    });
    // then they both get an updated board representing the move
    const boardUpdates = await resolveTimeout(Promise.all([
      boardUpdateEvents[0].promise, boardUpdateEvents[1].promise
    ]));

    assert.notNull(boardUpdates.forEach);

    boardUpdates.forEach(boardUpdate => {
      assert.deepEquals(boardUpdate.src, [0, 0]);
      assert.deepEquals(boardUpdate.dst, [0, 1]);
      assert.deepEquals(boardUpdate.src, [0, 0]);
      assert.deepEquals(boardUpdate.dst, [0, 1]);
      assert.notNull(boardUpdate.board);
    });
  } finally {
    client_1.disconnect();
    client_2.disconnect();
  }
}));
