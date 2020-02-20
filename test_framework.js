window.di.inject(_ => {
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

    const runTests = (title) => {
        console.log(title);
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
        equals: (actual, expected) => {
            if (actual === expected) {
                return true;
            } else {
                throw `${actual} does not equal ${expected}`;
            }
        },
    };

    docReady(_ => runTests());

    return {
        addTest,
        runTests,
        assert
    };
});
