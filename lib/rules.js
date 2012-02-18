var _ = require("underscore");
var results = require("./parsing-results");
var tokeniser = require("./tokeniser");
var errors = require("./errors");

var token = function(tokenType, value) {
    return function(input) {
        var token = input.get(0);
        if (token.name === tokenType && token.value === value) {
            return results.success(value, input.slice(1), token.source);
        } else {
            var error = errors.error({
                expected: tokenType + " \"" + value + "\"",
                actual: token.name + " \"" + token.value + "\"",
                location: token.source
            });
            return results.failure([error], input);
        }
    };
};

exports.keyword = function(keyword) {
    return token("keyword", keyword);
};

exports.symbol = function(symbol) {
    return token("symbol", symbol);
};

exports.firstOf = function(name) {
    var parsers = _.tail(arguments);
    return function(input) {
        var tryParser = function(lastResult, parser) {
            if (lastResult.isSuccess()) {
                return lastResult;
            } else {
                return parser(input);
            }
        };
        return _.foldl(parsers, tryParser, results.failure());
    };
};

exports.then = function(parser, func) {
    return function(input) {
        return parser(input).map(func);
    };
};

exports.sequence = function() {
    var parsers = Array.prototype.slice.call(arguments, 0);
    return function(input) {
        return _.foldl(parsers, function(result, parser) {
            if (!result.isSuccess()) {
                return result;
            }
            var subResult = parser(result.remaining());
            if (subResult.isSuccess()) {
                var values = _.clone(result.value());
                values.push(subResult.value());
                return results.success(values, subResult.remaining());
            } else {
                return results.failure(input);
            }
        }, results.success([], input));
    };
};
