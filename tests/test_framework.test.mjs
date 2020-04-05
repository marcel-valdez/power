// jshint esversion: 8

import utils from '../core/utils.mjs';
import { addSetup, addTeardown, addTest, assert } from '../tests/test_framework.mjs';

const context = {
  setupValue: null,
  setupValue_2: null,
  teardownValue: null
};

const expected = {
  setupValue: "setupValue should be set before tests run",
  setupValue_2: "setupValue_2 should be set before tests run",
  teardownValue: "teardownValue should be set by a test and available for teardown"
};

addSetup(
  async () => {
    // given
    await utils.timeout(10);
    // when
    context.setupValue = expected.setupValue;
  }
);

addSetup(
  async () => {
    // given
    await utils.timeout(10);
    // when
    context.setupValue_2 = expected.setupValue_2;
  }
);

addTeardown(
  async () => {
    // then
    assert.equals(context.teardownValue, expected.teardownValue);
  }
);

addTest('Tests should run after setup is finished', () => {
  // given
  // when
  const actual = context.setupValue;
  // then
  assert.equals(actual, expected.setupValue);
});

addTest('Tests should run after ALL setups execute', () => {
  // given
  // when
  const actual = context.setupValue_2;
  // then
  assert.equals(actual, expected.setupValue_2);
});

addTest('Tests should run before teardown', () => {
  // when
  context.teardownValue = expected.teardownValue;
});

addTest('Test it fails on different arrays', () => {
  // given
  [
    [[], [0]],
    [[0], [1]],
    [[0], [0, 1]],
    [[0, 1], [0]],
    [[0, 0], [0, 1]],
  ].forEach(([a, b]) => {
    // when
    let error = null;
    try {
      assert.deepEquals(a, b);
    } catch (e) {
      error = e;
    }
    // then
    if (error === null || typeof (error) === 'undefined') {
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

addTest('Can test promises', () => {
  return new Promise((resolve) => {
    assert.equals(1, 1);
    resolve(true);
  });
});
