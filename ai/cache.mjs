import utils from '../core/utils.mjs';

export function Cache(maxEntries = 10000) {
  const genSize = Math.ceil(maxEntries / 4);
  utils.debug(
    'New cache with max entries:', maxEntries, 'and max gen size', genSize);
  let gen1 = new Map();
  let gen2 = new Map();
  let gen3 = new Map();
  let gen4 = new Map();

  this.clear = () => {
    gen1 = new Map();
    gen2 = new Map();
    gen3 = new Map();
    gen4 = new Map();
  };

  this.totalSize = () => gen1.size + gen2.size + gen3.size + gen4.size;

  const addToGen1 = (key, value) => {
    utils.debug('Cache: addToGen1', 'key', key, 'value', value);
    if (gen1.size >= genSize) {
      utils.debug('Cache: updating generations. Gen size: ', gen1.size);
      gen4 = gen3;
      gen3 = gen2;
      gen2 = gen1;
      gen1 = new Map();
    }
    gen1.set(key, value);
  };

  const addToGen2 = (key, value) => {
    if (gen2.size >= genSize) {
      gen4 = gen3;
      gen3 = gen2;
      gen2 = new Map();
    }
    gen2.set(key, value);
  };

  const addToGen3 = (key, value) => {
    if (gen3.size >= genSize) {
      gen4 = gen3;
      gen3 = new Map();
    }
    gen3.set(key, value);
  };

  this.set = (key, value) => {
    addToGen1(key, value);
    setTimeout(
      () => gen2.delete(key) || gen3.delete(key) || gen4.delete(key), 1);
  };

  this.get = (key) => {
    const gen1Value = gen1.get(key);
    if (typeof(gen1Value) !== 'undefined') {
      utils.debug('Cache: Found key', key, 'in gen1, value', gen1Value);
      return gen1Value;
    }

    const gen2Value = gen2.get(key);
    if (typeof(gen2Value) !== 'undefined') {
      utils.debug('Cache: Found key', key, 'in gen2, value', gen2Value);
      setTimeout(() => {
        gen2.delete(key);
        addToGen1(key, gen2Value);
      });
      return gen2Value;
    }

    const gen3Value = gen3.get(key);
    if (typeof(gen3Value) !== 'undefined') {
      utils.debug('Cache: Found key', key, 'in gen3, value', gen3Value);
      setTimeout(() => {
        gen3.delete(key);
        addToGen2(key, gen3Value);
      }, 1);
      return gen3Value;
    }

    const gen4Value = gen4.get(key);
    if (typeof(gen4Value) !== 'undefined') {
      utils.debug('Cache: Found key', key, 'in gen4, value', gen4Value);
      setTimeout(() => {
        gen4.delete(key);
        addToGen3(key, gen4Value);
      }, 1);
      return gen4Value;
    }

    utils.debug('Cache: No value found for key', key);
    return null;
  };
}
