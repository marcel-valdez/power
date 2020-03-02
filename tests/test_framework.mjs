import utils from '../core/utils.mjs';

const isBrowser = typeof document !== 'undefined';

class AssertionError extends Error {
  constructor(message) {
    super(message);
  }
}

const write = (msg) => {
  if(!isBrowser) return;
  const body = document.querySelector('body');
  const escaped = msg.replace(/\n/g, '<BR>');
  const result = `<p>${escaped}</p>`;
  body.innerHTML += result;
}

function docReady(fn) {
  // see if DOM is already available
  if (isBrowser) {
    if (document.readyState === "complete" ||
        document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  } else {
    setTimeout(fn, 1);
  }
}

const tests = [];

const testsPromise = new Promise((resolve, reject) => {
  const loopWait = () => {
    if(tests.length > 0) {
      resolve(tests);
    } else {
      setTimeout(() => loopWait(), 10);
    }
  };

  loopWait();
});

async function getTests() {
  if (tests.length > 0) {
    return tests;
  } else {
    return await testsPromise;
  }
}

const addTest = (title, testFn) => {
  utils.debug(`Adding test ${title}.`);
  tests.push({
    title,
    testFn
  });
};

const reportResult = (title = '', result, error = '') => {
  if (error) {
    utils.log(`${title}: ${result}\n${error.stack}`);
    write(`${title} <font color="red">${result}</font><br/>${error.stack}`);
  } else {
    utils.log(`${title}: ${result}`);
    write(`${title} <font color="green">${result}</font>`);
  }
};

function runTest(test = { testFn: () => {}, title: '' }) {
  try {
    test.testFn();
    reportResult(test.title, "PASS");
    return { passed: true, error: null };
  } catch (error) {
    if (error instanceof AssertionError) {
      reportResult(test.title, "FAIL", error);
    } else {
      reportResult(test.title, "EXCEPTION", error);
    }

    return { pass: false, error };
  }
}

function processResults(
  results = { fail_count: 0, pass_count: 0 }) {

  const { pass_count, fail_count } = results;
  const total_count = pass_count + fail_count;
  let resultMsg = `PASSED: ${pass_count}/${total_count}`;
  if (fail_count > 0) {
     resultMsg += `\nFAILED: ${fail_count}/${total_count}`;
  }
  utils.info(resultMsg);
  write(resultMsg);
}

async function runTests() {
  let pass_count = 0;
  let fail_count = 0;
  utils.debug("Waiting for tests...");
  const tests = await getTests();
  utils.log("Running tests.");
  try {
    while (tests.length > 0) {
      const result = runTest(tests.shift());
      if (result.passed) { pass_count++; }
      else { fail_count++; }
    }
  } finally {
    processResults({
      fail_count,
      pass_count
    });
    if (!(typeof process === 'undefined')) {
      if (fail_count > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    }
  }
}

const assert = {
  makeErrorMsg: (actual, expected, title, diffMsg) => {
    let msg = `${actual} ${diffMsg} ${expected}`;
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
  notNull: (actual, title) => {
    if (actual !== null && actual !== undefined) {
      return true;
    } else {
      let msg = 'value was null, expected non-null.';
      if (title) {
        msg = `${title}\n${msg}`;
      }
      throw msg;
    }
  }
};

docReady(_ => runTests());

export {
  addTest,
  runTests,
  assert,
};
