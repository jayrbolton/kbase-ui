(function (global) {
    global.__kbase__build__ = {
        // git rev-parse HEAD
        // dev or prod
        deployType: '{{ targets.ui }}',
        gitCommitHash: '{{ git.abbreviatedSha }}',
        builtAt: {{ stats.start }},
    };
}(window));