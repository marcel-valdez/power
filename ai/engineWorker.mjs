// jshint esversion: 6

import utils from '../core/utils.mjs';
import {Engine} from '../ai/engine.mjs';
import {Board} from '../core/board.mjs';
import {Side} from '../core/power.common.mjs';


const logResults = (result, engine) => {
  utils.info('Result:', JSON.stringify(result));
  utils.info('Time:', engine.lastDuration() / 1000, 's');
  utils.info('Cache hits:', engine.cacheHits);
  utils.info('White cache size:', engine.whiteCache.totalSize());
  utils.info('Black cache size:', engine.blackCache.totalSize());
};

// TODO: The engine's playing side should be dynamically set through a message
// TODO: The engine's playing strength (maxDepth) should be dynamically set by
//       the user, through a message.
const engine = new Engine({ maxDepth: 3, playingSide: Side.BLACK });
onmessage = ({data: message}) => {
  const { board, side, engineMoveId } = message;
  new Promise((resolve, reject) => {
    utils.enableLogging();
    utils.info('Computing my next move...');
    utils.disableLogging();
    setTimeout(() => resolve(engine.computeMove(Board.fromJson(board))), 1);
  }).then((result) => {
    result.action.engineMoveId = engineMoveId;
    postMessage(result.action);
    utils.enableLogging();
    logResults(result, engine);
    utils.disableLogging();
  });
};
