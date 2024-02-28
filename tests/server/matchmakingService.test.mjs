// jshint esversion: 8

import express from 'express';
import getPort from 'get-port';
import http from 'http';
import io from 'socket.io';
import io_client from 'socket.io-client';
import { isNullOrUndefined } from 'util';
import utils from '../../core/utils.mjs';
import { MessageType } from '../../multiplayer/common.mjs';
import Matchmaker from '../../server/matchmaker.mjs';
import MatchmakingService from '../../server/matchmakingService.mjs';
import { addSetup, addTeardown, addTest, assert } from '../../tests/test_framework.mjs';
import sequence from '../sequential.mjs';

const { resolveTimeout, timeout, defer } = utils;

const context = {
  app: null,
  server: null,
  io_server: null,
  target: null
};

const sequential = sequence();

function addSequentialTest(title, testFn) {
  addTest(title, sequential(testFn));
}


addSetup(async () => {
  utils.debug('START: Server setup');
  utils.debug('context.app');
  context.app = express();
  utils.debug('context.server');
  context.server = http.Server(context.app);
  utils.debug('context.io_server');
  context.io_server = io(
    context.server,
    {
      cookie: false,
      pingTimeout: 30000,
      pingInterval: 2000
    }
  );
  utils.debug('context.target');
  context.target = new MatchmakingService(
    new Matchmaker()
  );
  utils.debug('context.target.attach');
  context.target.attach(context.io_server);
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

function newIoClient() {
  return io_client(`http://localhost:${context.port}/multiplayer`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
    autoConnect: false,
    query: ''
  });
}

async function withClients(clients, fn) {
  clients.filter(c => !isNullOrUndefined(c))
    .forEach(c => c.connect());
  let value = defer();
  try {
    await fn();
    value.resolve();
  } catch(e) {
    value.resolve();
    throw e;
  } finally {
    await resolveTimeout(value.promise, 3000);
    utils.debug('[withClients] Disconnecting clients');
    clients.filter(c => !isNullOrUndefined(c))
      .forEach(c => c.connected && c.disconnect());
  }
}

addSequentialTest(
  'Test a player can connect to the service',
  async () => {
    // given
    const connected = defer();
    const client = newIoClient();
    client.on('connect', () => {
      connected.resolve(true);
    });
    return withClients(
      [client],
      async () => {
        // then
        assert.equals(
          await resolveTimeout(connected.promise, 100),
          true
        );
      }
    );
  }
);

addSequentialTest(
  'Test a player is removed from queue upon disconnect',
  async () => {
    // given
    const opponentFoundA = defer();
    const opponentFoundB = defer();
    const clientA = newIoClient();
    const clientB = newIoClient();

    return withClients(
      [clientA, clientB],
      async () => {
        clientA.on(MessageType.OPPONENT_FOUND, opponentFoundA.resolve);
        clientB.on(MessageType.OPPONENT_FOUND, opponentFoundB.resolve);
        clientA.emit(MessageType.FIND_MATCH);
        await timeout(10);
        // when
        clientA.disconnect();
        await timeout(10);
        clientB.emit(MessageType.FIND_MATCH);
        // then
        await timeout(10);
        const actualA = await resolveTimeout(opponentFoundA.promise, 10);
        assert.equals(actualA.name, 'TimeoutError');

        const actualB = await resolveTimeout(opponentFoundB.promise, 10);
        assert.equals(actualB.name, 'TimeoutError');
      });
  }
);

addSequentialTest(
  'Test two players can be matched together',
  async () => {
    // given
    const opponentFoundA = defer();
    const opponentFoundB = defer();
    const clientA = newIoClient();
    const clientB = newIoClient();

    return withClients(
      [clientA, clientB],
      async () => {
        clientA.on(MessageType.OPPONENT_FOUND, opponentFoundA.resolve);
        clientB.on(MessageType.OPPONENT_FOUND, opponentFoundB.resolve);
        // when
        clientA.emit(MessageType.FIND_MATCH);
        await timeout(20);
        clientB.emit(MessageType.FIND_MATCH);
        // then
        const actualA = await resolveTimeout(opponentFoundA.promise, 20);
        assert.notNull(actualA.matchId);
        assert.notNull(actualA.opponentId);
        assert.notNull(actualA.playerSide);

        const actualB = await resolveTimeout(opponentFoundB.promise, 20);
        assert.notNull(actualB.matchId);
        assert.notNull(actualB.opponentId);
        assert.notNull(actualB.playerSide);
      });
  });


addSequentialTest(
  'Test two players can play together',
  async () => {
    // given
    const sender = newIoClient();
    const senderOpp = defer();
    const senderUpdate = defer();

    const receiver = newIoClient();
    const receiverOpp = defer();
    const receiverUpdate = defer();

    return withClients(
      [sender, receiver],
      async () => {
        sender.on(MessageType.OPPONENT_FOUND, senderOpp.resolve);
        sender.on(MessageType.BOARD_UPDATE, senderUpdate.resolve);
        receiver.on(MessageType.BOARD_UPDATE, receiverUpdate.resolve);

        sender.emit(MessageType.FIND_MATCH);
        await timeout(10);
        receiver.emit(MessageType.FIND_MATCH);
        const senderMatch = await resolveTimeout(senderOpp.promise, 40);
        await resolveTimeout(receiverOpp.promise, 40);

        // when
        sender.emit(MessageType.PLAYER_ACTION, {
          matchId: senderMatch.matchId,
          opponentId: senderMatch.opponentId,
          src: [0, 0],
          dst: [0, 1],
          promotion: null,
          resign: false
        });

        // then
        const receiverBoard = await resolveTimeout(receiverUpdate.promise, 100);
        assert.notNull(receiverBoard.board);
        assert.notNull(receiverBoard.board.squares);
        assert.notNull(receiverBoard.src);
        assert.notNull(receiverBoard.dst);
        const senderBoard = await resolveTimeout(senderUpdate.promise, 100);
        assert.notNull(senderBoard.board);
        assert.notNull(senderBoard.board.squares);
        assert.notNull(senderBoard.src);
        assert.notNull(senderBoard.dst);
      });
  });