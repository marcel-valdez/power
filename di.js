// Very simple dependency injection mehcanism
(function () {
    function mergeDeps(oldDeps, newDeps) {
        if(typeof oldDeps !== 'object'
        || oldDeps === null
        || oldDeps === undefined) {
            // scalar value or null value overridden
            return newDeps;
        }

        if(typeof newDeps !== 'object') {
            // value was overridden with scalar object
            return newDeps;
        }

        if (newDeps === null || newDeps === undefined) {
            // null values are ignored, can't override with null.
            return oldDeps;
        }

        const oldKeys = Object.keys(oldDeps);
        const newKeys = Object.keys(newDeps);
        const oldEntries = oldKeys.filter(key => !newKeys.includes(key))
            .map(key => {
                const result = {};
                result[key] = oldDeps[key];
                return result;
            });
        const mergedEntries = oldKeys.filter(key => newKeys.includes(key))
            .map(key => {
                const result = {};
                result[key] = mergeDeps(oldDeps[key], newDeps[key]);
                return result;
            });
        const newEntries = newKeys.filter(key => !oldKeys.includes(key))
            .map(key => {
                const result = {};
                result[key] = newDeps[key];
                return result;
            });
        return Object.assign({}, ...oldEntries, ...mergedEntries, ...newEntries);
    }

    function registerDeps(dependencies) {
        window.di.deps = Object.freeze(mergeDeps(window.di.deps, dependencies));
    }

    function inject(functor) {
        const newDeps = functor(window.di.deps) || {};
        registerDeps(newDeps);
    }

    window.di = {
        registerDeps,
        inject,
        deps: {},
    }
})();
