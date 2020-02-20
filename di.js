// Very simple dependency injection mehcanism
(function () {
    function registerDeps(dependencies) {
        window.di.deps = Object.freeze({
            ... window.di.deps,
            ... dependencies
        });
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
