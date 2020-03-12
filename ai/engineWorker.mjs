import utils from '../core/utils.mjs';
import {Engine} from '../ai/engine.mjs';
import {Board} from '../core/board.mjs';
import {Side} from '../core/power.common.mjs';

utils.disableLogging();
// TODO: The engine's playing side should be dynamically set through a message
const engine = new Engine({ maxDepth: 4, playingSide: Side.BLACK });

onmessage = ({data: message}) => {
  const { board, side } = message;
  utils.enableLogging();
  utils.info('Computing my next move...');
  utils.disableLogging();
  const result = engine.computeMove(Board.fromJson(board));
  utils.enableLogging();
  postMessage(result.action);
  utils.info('Result:', JSON.stringify(result));
  utils.info('Time:', engine.lastDuration() / 1000, 's');
  utils.info('Cache hits:', engine.cacheHits);
  utils.info('White cache size:', engine.whiteCache.totalSize());
  utils.info('Black cache size:', engine.blackCache.totalSize());
  utils.disableLogging();
};
