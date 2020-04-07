// jshint esversion: 8

import express from 'express';
import getPort from 'get-port';
import http from 'http';
import io_server from 'socket.io';
import MatchmakingClient from '../../client/matchmakingClient.mjs';
import { Side } from '../../core/power.common.mjs';
import utils from '../../core/utils.mjs';
import { ClientState, MessageType } from '../../multiplayer/common.mjs';
import { addSetup, addTeardown, addTest, assert } from '../../tests/test_framework.mjs';
import sequence from '../sequential.mjs';
import FakeMatchmakingService from './fakeMatchmakingService.mjs';

const { resolveTimeout, defer, timeout } = utils;


const context = {
  app: null,
  server: null,
  io_server: null,
  target: null,
  port: null,
  fake_server: null
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
  context.io_server = io_server(
    context.server,
    {
      cookie: false,
      pingTimeout: 30000,
      pingInterval: 2000
    }
  );
  utils.debug('context.port');
  context.port = await getPort({
    port: 3000
  });

  utils.debug('context.fake_server');
  context.fake_server = new FakeMatchmakingService(context.io_server);
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


addSequentialTest('Test client can connect', async () => {
  // given
  const target = new MatchmakingClient({
    serverUrl: `http://localhost:${context.port}`
  });
  assert.equals(target.state, ClientState.DISCONNECTED);
  try {
    // when
    target.connect();
    // then
    await timeout(20);
    const gotConnected = await context.fake_server.isConnected(target.socket.id);
    assert.equals(gotConnected, true);
    assert.equals(target.state, ClientState.CONNECTED);
  } finally {
    target.disconnect();
  }
});

addSequentialTest('Test client can disconnect', async () => {
  // given
  const target = new MatchmakingClient({
    serverUrl: `http://localhost:${context.port}`
  });
  target.connect();
  await timeout(20);
  const isConnected = await context.fake_server.isConnected(target.socket.id);
  assert.equals(isConnected, true);
  assert.equals(target.state, ClientState.CONNECTED);
  const isDisconnectedPromise = context.fake_server.isDisconnected(target.socket.id);
  // when
  target.disconnect();
  // then
  const gotDisconnected = await isDisconnectedPromise;
  assert.equals(gotDisconnected, true);
  assert.equals(target.state, ClientState.DISCONNECTED);
});


addSequentialTest('Test client can findMatch', async () => {
  // given
  const target = new MatchmakingClient({
    serverUrl: `http://localhost:${context.port}`
  });
  target.connect();
  await timeout(20);
  await context.fake_server.isConnected(target.socket.id);

  try {
    // when
    target.findMatch();
    // then
    const sentFindMatch = await context.fake_server.didFindMatch(target.socket.id);
    assert.equals(sentFindMatch, true);
    assert.equals(target.state, ClientState.FINDING_MATCH);
  } finally {
    target.disconnect();
  }
});


addSequentialTest('Test client can issue move', async () => {
  // given
  const target = new MatchmakingClient({
    serverUrl: `http://localhost:${context.port}`
  });
  target.connect();
  try {
    await timeout(20);
    await context.fake_server.isConnected(target.socket.id);
    const action = { src: [0, 0], dst: [0, 1] };
    // when
    target.sendAction(action);
    // then
    const actualAction = await context.fake_server.getPlayerAction(target.socket.id);
    assert.deepEquals(actualAction, action);
  } finally {
    target.disconnect();
  }
});


addSequentialTest('Test client can send answer: match started', async () => {
  // given
  const event = defer();
  const inputMatch = { matchId: 123, opponentId: 456, playerSide: Side.WHITE };
  const target = new MatchmakingClient({
    onOpponentFound: event.resolve,
    serverUrl: `http://localhost:${context.port}`
  });
  target.connect();
  await timeout(20);
  try {
    const socket = await context.fake_server.getSocket(target.socket.id);
    // when
    socket.emit(MessageType.OPPONENT_FOUND, inputMatch);
    // then
    const eventValue = await resolveTimeout(event.promise);
    assert.deepEquals(eventValue, { playerSide: Side.WHITE });
  } finally {
    target.disconnect();
  }
});


addSequentialTest('Test client can send answer: board update', async () => {
  // given
  const event = defer();
  const update = { board: 'test-value' };
  const target = new MatchmakingClient({
    onBoardUpdate: event.resolve,
    serverUrl: `http://localhost:${context.port}`
  });
  target.connect();
  try {
    await timeout(20);
    const socket = await context.fake_server.getSocket(target.socket.id);
    // when
    socket.emit(MessageType.BOARD_UPDATE, update);
    // then
    const eventValue = await resolveTimeout(event.promise);
    assert.deepEquals(eventValue, update);
  } finally {
    target.disconnect();
  }
});
