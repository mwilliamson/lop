var _ = require("underscore");
var results = require("./parsing-results");
var tokeniser = require("./tokeniser");
var errors = require("./errors");
var lazyIterators = require("./lazy-iterators");

var token = function(tokenType, value) {
    return function(input) {
        var token = input.get(0);
        if (token.name === tokenType && token.value === value) {
            return results.success(value, input.slice(1), token.source);
        } else {
            var error = errors.error({
                expected: describeToken({name: tokenType, value: value}),
                actual: describeToken(token),
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
        return lazyIterators
            .fromArray(parsers)
            .map(function(parser) {
                return parser(input);
            })
            .filter(function(result) {
                return result.isSuccess();
            })
            .first() || results.failure([errors.error({
                expected: name,
                actual: describeToken(input.get(0)),
                location: input.get(0).source
            })], input);
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

var describeToken = function(token) {
    return token.name + " \"" + token.value + "\"";
};
