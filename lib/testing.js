var tokeniser = require("../lib/tokeniser");
var _ = require("underscore");

var assertIsSuccess = exports.assertIsSuccess = function(test, result) {
    test.ok(result.isSuccess(), result.errors().map(function(error) {
        return error.describe();
    }).join("\n\n"));
};

var assertIsSuccessWithValue = exports.assertIsSuccessWithValue = function(test, result, value, source) {
    assertIsSuccess(test, result);
    test.deepEqual(result.value(), value);
    if (source) {
        test.deepEqual(result.source(), source);
    }
    assertRemaining(test, result, [tokeniser.tokens.end()]);
};

var assertIsFailure = exports.assertIsFailure = function(test, result, options) {
    options = options || [];
    test.deepEqual(result.isSuccess(), false);
    if (options.remaining) {
        assertRemaining(test, result, options.remaining);
    }
    if (options.errors) {
        assertErrors(test, result, options.errors);
    }
};

var assertRemaining = exports.assertRemaining = function(test, result, expectedRemaining) {
    var actualRemaining = result.remaining().toArray();
    test.equal(actualRemaining.length, expectedRemaining.length);
    _.map(_.zip(expectedRemaining, actualRemaining), function(values) {
        var expected = values[0];
        var actual = values[1];
        test.deepEqual(expected.name, actual.name);
        test.deepEqual(expected.value, actual.value);
        if (expected.source) {
            test.deepEqual(expected.source, actual.source);
        }
    });
};

var assertErrors = exports.assertErrors = function(test, result, expectedErrors) {
    test.deepEqual(result.errors(), expectedErrors);
};

var assertIsFailureWithRemaining = exports.assertIsFailureWithRemaining = function(test, result, expectedRemaining) {
    assertIsFailure(test, result);
    assertRemaining(test, result, expectedRemaining);
};

