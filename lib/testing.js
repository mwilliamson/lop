var tokeniser = require("../lib/tokeniser");
var _ = require("underscore");

var assertIsSuccessWithValue = exports.assertIsSuccessWithValue = function(test, result, value, source) {
    test.deepEqual(result.isSuccess(), true);
    test.deepEqual(result.value(), value);
    if (source) {
        test.deepEqual(result.source(), source);
    }
    assertRemaining(test, result, [tokeniser.tokens.end()]);
};

var assertIsFailure = exports.assertIsFailure = function(test, result) {
    test.deepEqual(result.isSuccess(), false);
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

var assertIsFailureWithRemaining = exports.assertIsFailureWithRemaining = function(test, result, expectedRemaining) {
    assertIsFailure(test, result);
    assertRemaining(test, result, expectedRemaining);
};

