// jshint esversion: 8

import utils from '../core/utils.mjs';

const { defer } = utils;

// Allows to execute tests one at a time.

function sequence() {
  const mutexes = [
    defer()
  ];
  mutexes[0].resolve(true);

  function sequential(fn) {
    const index = mutexes.length - 1;
    mutexes.push(defer());
    return async () => {
      utils.debug('[sequential] Waiting for turn');
      await mutexes[index].promise;
      let result;
      try {
        utils.debug('[sequential] RUNNING');
        result = await fn();
      } finally {
        utils.debug('[sequential] Finishing turn');
        mutexes[index + 1].resolve(true);
      }
      return result;
    };
  }

  return sequential;
}

export default sequence;