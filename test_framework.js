window.di.inject(_ => {

    const debug = {
        log: (msg) => window.DEBUG && console.log(msg)
    };

    function docReady(fn) {
        // see if DOM is already available
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // call on next available tick
            setTimeout(fn, 1);
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }
    const tests = [];

    const addTest = (title, testFn) => {
        tests.push({
            title,
            testFn
        });
    };

    const runTests = () => {
        console.log("Running all tests");
        tests.forEach(({
            title,
            testFn,
            }) => {
                try {
                    console.log(title);
                    testFn();
                    console.log("PASS");
                } catch (error) {
                    console.log(error);
                    console.log("FAIL");
                }
            }
        );
    };

    const assert = {
        equals: (actual, expected, title) => {
            if (actual === expected) {
                return true;
            } else {
                let msg = `${actual} does not equal ${expected}`;
                if (title) {
                    msg = `${title}\n${msg}`
                }
                throw msg;
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

    return {
        testing: {
            addTest,
            runTests,
            assert,
            debug,
        }
    };
});
