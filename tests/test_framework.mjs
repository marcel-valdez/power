// jshint esversion: 8

import utils from '../core/utils.mjs';

const isBrowser = typeof document !== 'undefined';

class AssertionError extends Error {
  constructor(message) {
    super(message);
  }
}

const write = (msg, elementId = null) => {
  if(!isBrowser) return;
  let element = null;
  if (elementId === null) {
    element = document.querySelector('body');
  } else {
    element = document.getElementById(elementId);
  }

  const escaped = msg.replace(/\n/g, '<BR>');
  element.innerHTML += `${escaped}`;
};

function docReady(fn) {
  // see if DOM is already available
  if (isBrowser) {
    if (document.readyState === 'complete' ||
        document.readyState === 'interactive') {
      // call on next available tick
      setTimeout(fn, 1);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  } else {
    setTimeout(fn, 1);
  }
}

let testEntriesElementId = 'test-framework-entries';
const setTestEntriesElementId = (id) => {
  testEntriesElementId = id;
};

const tests = [];

function defer() {
  const deferred = {
    promise: null,
    resolve: null,
    isResolved: false,
    reject: null,
    isRejected: false
  };

  deferred.promise = new Promise((_resolve, _reject) => {
    deferred.resolve = (value) => {
      if (!deferred.isResolved && !deferred.isRejected) {
        utils.debug(`Deferred promise resolved with: ${value}`);
        _resolve(value);
        deferred.isResolved = true;
      }
    };
    deferred.reject = (error) => {
      if (!deferred.isRejected && !deferred.isRejected) {
        utils.debug(`Deferred promise rejected with: ${error}`);
        _reject(error);
        deferred.isRejected = true;
      }
    };
  });

  return deferred;
}

const deferredTests = defer();
async function getTests() {
  return await deferredTests.promise;
}

const deferredResults = defer();
async function getResults() {
  return await deferredResults.promise;
}

const addTest = (title, testFn) => {
  utils.debug(`Adding test ${title}.`);
  tests.push({
    title,
    testFn
  });
  utils.debug(`Resolving tests, length: ${tests.length}`);
  deferredTests.resolve(tests);
};

const reportResult = (title, result, error = '') => {
  if (error) {
    utils.log(`${title}: ${result}\n${error.stack}`);
    write(
      `<div class='test-result'>${title} <font color="crimson">${result}</font><br/>${error.stack}</div>`,
      testEntriesElementId);
  } else {
    utils.log(`${title}: ${result}`);
    write(`<div class='test-result'>${title} <font color="seagreen">${result}</font></div>`,
      testEntriesElementId);
  }
};

function runTest(test = { testFn: () => {}, title: '' }) {
  const onSuccess = () => {
    reportResult(test.title, 'PASS');
    return { passed: true, error: null };
  };
  const onFailure = (error) => {
    if (error instanceof AssertionError) {
      reportResult(test.title, 'FAIL', error);
    } else {
      reportResult(test.title, 'EXCEPTION', error);
    }

    return { pass: false, error };
  };

  try {
    const outcome = test.testFn();
    return Promise.resolve(outcome).then(onSuccess, onFailure);
  } catch (error) {
    return Promise.resolve(onFailure(error));
  }
}

function processResults(
  results = { fail_count: 0, pass_count: 0 },
  elementId = 'test-framework-results') {

  const { pass_count, fail_count } = results;
  const total_count = pass_count + fail_count;
  utils.info(`PASSED: ${pass_count}/${total_count}`);
  write(`<font color="seagreen">PASSED</font>: ${pass_count}/${total_count}<br/>`,
    elementId);
  if (fail_count > 0) {
    write(`<font color="crimson">FAILED</font>: ${fail_count}/${total_count}<br/>`,
      elementId);
    utils.info(`FAILED: ${fail_count}/${total_count}`);
  }
}

async function runTests(
  render = ({fail_count, pass_count}) => processResults({ fail_count, pass_count })) {
  let pass_count = 0;
  let fail_count = 0;
  utils.debug('Waiting for tests...');
  const tests = await getTests();
  utils.debug(`Tests available: ${tests.length}`);
  utils.log('Running tests.');
  const testRuns = [];
  try {
    while (tests.length > 0) {
      const testFn = tests.shift();
      const testOutcome = runTest(testFn);
      testRuns.push(
        Promise.resolve(testOutcome)
          .then((result) => result.passed ? pass_count++ : fail_count++)
          .catch(() => fail_count++)
      );

    }
  } finally {
    Promise.allSettled(testRuns).then(() => {
      deferredResults.resolve({ fail_count, pass_count });
      render({
        fail_count,
        pass_count
      });
      // nodejs
      if (typeof process !== 'undefined') {
        if (fail_count > 0) {
          process.exit(1);
        } else {
          process.exit(0);
        }
      }
    });
  }
}

const toJSON = (value) => {
  if (value === null) {
    return 'null';
  }

  if (typeof(value) === 'undefined') {
    return 'undefined';
  }

  return JSON.stringify(value);
};

const makeActualExpectedError = (actual, expected, message) => {
  return new AssertionError(
    `${message}\nActual: ${toJSON(actual)}\nExpected: ${toJSON(expected)}`);
};

const makeActualExpectedMsg = (actual, expected) => {
  let actualJson = 'undefined';
  if (typeof(actual) !== 'undefined') {
    actualJson = JSON.stringify(actual);
  }

  let expectedJson = 'undefined';
  if (typeof(expected) !== 'undefined') {
    expectedJson = JSON.stringify(expected);
  }
  return `Actual: ${actualJson}\nExpected: ${expectedJson}`;
};

const compareArray = (actual, expected, message = '') => {
  if (!Array.isArray(actual)) {
    throw new AssertionError(
      `${message}` +
        `\nExpected an array but got ${typeof(actual)}` +
        `\n${makeActualExpectedMsg(actual, expected)}`);
  }

  if (actual.length !== expected.length) {
    throw new AssertionError(
      `${message}` +
        `\nExpected an array of length: ${expected.length}, ` +
        `but got an array of length ${actual.length}` +
        `\n${makeActualExpectedMsg(actual, expected)}`);
  }

  const nonMatches = [...Array(expected.length).keys()].map((index) => {
    try {
      return assert.deepEquals(
        actual[index],
        expected[index],
        `${message}\n at index: ${index}`);
    } catch (error) {
      return error;
    }
  }).filter((outcome) => outcome !== true);

  if (nonMatches.length > 0) {
    const errors = '[\n' + nonMatches.map(({message}) => message)
      .join('\n') + '\n]';
    throw makeActualExpectedError(actual, expected, errors);
  }

  return true;
};

const isObject = (maybeObj) => !Array.isArray(maybeObj) &&
  typeof(maybeObj) === 'object';

const compareObject = (actual, expected, message = '') => {
  if (!isObject(actual)) {
    throw new AssertionError(`${message}` +
                             `\nExpected an object but found: ${actual}` +
                             `\n${makeActualExpectedMsg(actual, expected)}`);
  }

  return compareObjectKeys(actual, expected, message) &&
    compareObjectProperties(actual, expected, message);
};

const compareObjectProperties = (actual, expected, message = '') => {
  const actualProps = Object.getOwnPropertyNames(actual);
  const expectedProps = Object.getOwnPropertyNames(expected);

  const unmatchedActualProps = actualProps.filter(
    (actualProp) => !expectedProps.includes(actualProp));
  const unmatchedExpectedProps = expectedProps.filter(
    (expectedProp) => !actualProps.includes(expectedProp));

  if (unmatchedActualProps.length > 0) {
    throw new AssertionError(
      `${message}\n` +
      'Some properties not found in the expected object.' +
        `\nUnmatched properties: ${unmatchedActualProps}` +
        `\n${makeActualExpectedMsg(actual, expected)}`);
  }

  if (unmatchedExpectedProps.length > 0) {
    throw new AssertionError(
      `${message}\n` +
      'Some expected properties not found in the actual object.' +
        `\nMissing properties: ${unmatchedExpectedProps}` +
        `\n${makeActualExpectedMsg(actual, expected)}`);
  }

  const nonMatches = actualProps
    .filter((key) => typeof(actual[key]) !== 'function' ||
                typeof(expected[key]) !== 'function')
    .map((propName) =>  {
      try {
        return assert.deepEquals(
          actual[propName],
          expected[propName],
          `${message}\n at property: ${propName}`);
      } catch(error) {
        return error;
      }
    }).filter((outcome) => outcome !== true);

  if (nonMatches.length > 0) {
    const errors = nonMatches.map(({message}) => message)
      .join('\n');
    const message = `${errors}\n${makeActualExpectedMsg(actual, expected)}`;
    throw new AssertionError(message);
  }

  return true;
};

const compareObjectKeys = (actual, expected, message = '') => {
  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);

  const unmatchedActualKeys = actualKeys.filter(
    (actualKey) => !expectedKeys.includes(actualKey));
  const unmatchedExpectedKeys = expectedKeys.filter(
    (expectedKey) => !actualKeys.includes(expectedKey));

  if (unmatchedActualKeys.length > 0) {
    throw new AssertionError(
      `${message}\n` +
      'Some keys not found in the expected object.' +
        `\nUnmatched keys: ${unmatchedActualKeys}` +
        `\n${makeActualExpectedMsg(actual, expected)}`);
  }

  if (unmatchedExpectedKeys.length > 0) {
    throw new AssertionError(
      `${message}\n` +
      'Some expected keys not found in the actual object.' +
        `\nMissing keys: ${unmatchedExpectedKeys}` +
        `\n${makeActualExpectedMsg(actual, expected)}`);
  }

  const nonMatches = actualKeys
    .filter((key) => typeof(actual[key]) !== 'function' ||
                typeof(expected[key]) !== 'function')
    .map((key) =>  {
      try {
        return assert.deepEquals(
          actual[key],
          expected[key],
          `${message}\n at key: ${key}`);
      } catch(error) {
        utils.debug(error.stack);
        return error;
      }
    }).filter((outcome) => outcome !== true);

  if (nonMatches.length > 0) {
    const errors = nonMatches.map(({message}) => message)
      .join('\n');
    const message = `${errors}\n${makeActualExpectedMsg(actual, expected)}`;
    throw new AssertionError(message);
  }

  return true;
};

function compareNullOrUndefined(actual, expected, message) {
  if ((actual === null || expected === null) &&
      (actual !== null || expected !== null)) {
    throw makeActualExpectedError(actual, expected, message);
  }

  if ((typeof(actual) === 'undefined' || typeof(expected) === 'undefined') &&
      (typeof(actual) !== 'undefined' || typeof(expected) !== 'undefined')) {
    throw makeActualExpectedError(actual, expected, message);
  }


  return true;
}

const assert = {
  makeErrorMsg: (actual, expected, title, diffMsg) => {
    let msg = `${toJSON(actual)} ${diffMsg} ${toJSON(expected)}`;
    if (title) {
      msg = `${title}\n${msg}`;
    }
    return msg;
  },
  equals: (actual, expected, title) => {
    if (actual === expected) {
      return true;
    } else {
      throw new AssertionError(
        assert.makeErrorMsg(actual, expected, title, 'is not equal to'));
    }
  },
  notEquals: (actual, expected, title) => {
    if (actual !== expected) {
      return true;
    } else {
      throw new AssertionError(
        assert.makeErrorMsg(actual, expected, title, 'is equal to'));
    }
  },
  areSame: (actual, expected, title) => {
    if (Object.is(actual, expected)) {
      return true;
    } else {
      throw new AssertionError(
        assert.makeErrorMsg(
          actual, expected, title, 'is not the same as'));
    }
  },
  areNotSame: (actual, expected, title) => {
    if (!Object.is(actual, expected)) {
      return true;
    } else {
      throw new AssertionError(
        assert.makeErrorMsg(actual, expected, title, 'is the same as'));
    }
  },
  isNull: (actual, title) => {
    if (actual === null || typeof(actual) === 'undefined') {
      return true;
    } else {
      let strActual = actual + '';
      if (typeof(actual) === 'object') {
        strActual = toJSON(actual);
      }
      let msg = `value ${strActual} was not null or undefined, expected null or undefined.`;
      if (title) {
        msg = `${title}\n${msg}`;
      }
      throw new AssertionError(msg);
    }
  },
  notNull: (actual, title) => {
    if (actual !== null && actual !== undefined) {
      return true;
    } else {
      let msg = 'value was null, expected non-null.';
      if (title) {
        msg = `${title}\n${msg}`;
      }
      throw new AssertionError(msg);
    }
  },
  deepEquals: (actual, expected, message = '') => {
    if (actual === expected) {
      return true;
    }

    compareNullOrUndefined(actual, expected, message);

    if (Array.isArray(expected)) {
      return compareArray(actual, expected, message);
    } else if (typeof(expected) === 'object') {
      return compareObject(actual, expected, message);
    } else {
      return assert.equals(actual, expected, message);
    }
  },
  throws: (fn, message = '') => {
    let error = null;
    try {
      fn();
    } catch(e) {
      error = e;
    }

    assert.notNull(error, message);
  }
};

docReady(() => runTests());

export {
  docReady,
  addTest,
  runTests,
  assert,
  setTestEntriesElementId,
  getResults,
};
