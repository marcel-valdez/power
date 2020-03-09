import {addTest, assert} from '../../tests/test_framework.mjs';
import {Cache} from '../../ai/cache.mjs';

addTest('Can cache a single value', () => {
  // given
  const cache = new Cache(4);
  // when
  cache.set('key', 'value');
  const actual = cache.get('key');
  // the
  assert.equals(actual, 'value');
});

addTest('Respects cache limit (size: 8, insert: 7)', () => {
  // given
  const cache = new Cache(8);
  for(let i = 0; i < 7; i++) {
    cache.set(i, `${i}`);
  }
  // when
  const actual = cache.get(0);
  // then
  assert.equals(actual, '0');
});

addTest('Respects cache limit (size: 8, insert: 9)', () => {
  // given
  const cache = new Cache(8);
  // when
  for(let i = 0; i < 9; i++) {
    cache.set(i, `${i}`);
  }
  // then we lose the last 25% of entries
  checkCache(cache, 2, 8);
});

addTest('Respects cache limit (size: 8, insert: 10)', () => {
  // given
  const cache = new Cache(8);
  // when
  for(let i = 0; i < 10; i++) {
    cache.set(i, `${i}`);
  }
  // then
  checkCache(cache, 2, 8);
});


addTest('Respects cache limit (size: 8, insert: 8)', () => {
  // given
  const cache = new Cache(8);
  // when
  for(let i = 0; i < 8; i++) {
    cache.set(i, `${i}`);
  }
  // then
  checkCache(cache, 0, 8);
});

function checkCache(cache, deleted, kept) {
  for (let i = 0; i < deleted; i++) {
    assert.equals(cache.get(i), null);
  }

  for (let i = deleted; i < kept; i++) {
    const actual = cache.get(i);
    assert.equals(actual, `${i}`);
  }
}
