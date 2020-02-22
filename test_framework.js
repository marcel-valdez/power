import utils from './utils.js';

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
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // call on next available tick
            setTimeout(fn, 1);
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    } else {
        setTimeout(fn(), 1);
    }
}

const tests = [];

const testsPromise = new Promise((resolve, reject) => {
    const loopWait = () => {
        if(tests.length > 0) {
            resolve(tests);
        } else {
            setTimeout(10, () => loopWait());
        }
    }

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
    let msg = `${title}:`;
    msg += ` ${result}`;
    if (error) msg += `\n${error}`

    utils.log(msg);
    write(msg);
};

async function runTests() {
    utils.debug("Waiting for tests...");
    const tests = await getTests();
    utils.log("Running all tests.");
    while (tests.length > 0) {
        const test = tests.shift();
        try {
            test.testFn();
            reportResult(test.title, "PASS");
        } catch (error) {
            if (error instanceof AssertionError) {
                reportResult(test.title, "FAIL", error);
            } else {
                throw error;
            }
        }
    }
};

const assert = {
    makeErrorMsg: (actual, expected, title, diffMsg) => {
        let msg = `${actual} ${diffMsg} ${expected}`;
        if (title) {
            msg = `${title}\n${msg}`
        }
        return msg;
    },
    equals: (actual, expected, title) => {
        if (actual === expected) {
            return true;
        } else {
            throw new AssertionError(
                assert.makeErrorMsg(actual, expected, title, 'are not equal'));
        }
    },
    areSame: (actual, expected, title) => {
        if (Object.is(actual, expected)) {
            return true;
        } else {
            throw new AssertionError(
                assert.makeErrorMsg(
                    actual, expected, title, 'are not the same'));
        }
    },
    areNotSame: (actual, expected, title) => {
        if (!Object.is(actual, expected)) {
            return true;
        } else {
            throw new AssertionError(
                assert.makeErrorMsg(actual, expected, title, 'are the same'));
        }
    },
    notNull: (actual, title) => {
        if (actual !== null && actual !== undefined) {
            return true;
        } else {
            let msg = 'value was null, expected non-null';
            if (title) {
                msg = `${title}\n${msg}`
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
