exports.error = function(options) {
    return {
        expected: options.expected,
        actual: options.actual,
        location: options.location,
        describe: "Expected " + options.expected + "\nbut got " + options.actual
    };
};
