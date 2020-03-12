import utils from '../core/utils.mjs';
import {addTest, assert} from '../tests/test_framework.mjs';

addTest('Test it fails on different arrays', () => {
  // given
  [
    [ [], [0] ],
    [ [0], [1] ],
    [ [0], [0,1] ],
    [ [0,1], [0] ],
    [ [0,0], [0,1] ],
  ].forEach(([a, b]) => {
    // when
    let error = null;
    try {
      assert.deepEquals(a, b);
    } catch(e) {
      error = e;
    }
    // then
    if (error === null || typeof(error) === 'undefined') {
      throw new Error('Error should not be null.');
    }
  });
});

addTest('Test undefined equals undefined', () => {
  assert.equals(undefined, undefined);
});

addTest('Test null equals null', () => {
  assert.equals(null, null);
});

addTest('Does not compare functions', () => {
  assert.deepEquals(
    { x: (a) => a + 1, y: 1 },
    { x: (b) => b + 1, y: 1 }
  );
});

addTest('Compares function keys', () => {
  assert.throws(() =>
    assert.deepEquals(
      { z: (a) => a + 1, y: 1 },
      { x: (b) => b + 1, y: 1 }
    ));
});

addTest('Compares scalar values', () => {
  assert.throws(() =>
    assert.deepEquals(
      { z: (a) => a + 1, y: 1 },
      { x: (b) => b + 1, y: 2 }
    ));
});
