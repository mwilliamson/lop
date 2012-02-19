var _ = require("underscore");
var results = require("./parsing-results");
var tokeniser = require("./tokeniser");
var errors = require("./errors");
var lazyIterators = require("./lazy-iterators");

var token = function(tokenType, value) {
    var matchValue = value !== undefined;
    return function(input) {
        var token = input.get(0);
        if (token.name === tokenType && (!matchValue || token.value === value)) {
            return results.success(token.value, input.slice(1), token.source);
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

exports.identifier = function() {
    return token("identifier");
};

exports.firstOf = function(name) {
    var parsers = Array.prototype.slice.call(arguments, 1);
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
                var values;
                if (parser.captureName) {
                    values = result.value().withValue(parser, subResult.value());
                } else {
                    values = result.value();
                }
                return results.success(values, subResult.remaining());
            } else {
                return results.failure(subResult.errors(), input);
            }
        }, results.success(new SequenceValues(), input));
    };
};

var SequenceValues = function(values) {
    this._values = values || {};
};

SequenceValues.prototype.withValue = function(rule, value) {
    var newValues = _.clone(this._values);
    newValues[rule.captureName] = value;
    return new SequenceValues(newValues);
};

SequenceValues.prototype.get = function(rule) {
    return this._values[rule.captureName];
};

exports.capture = function(rule, name) {
    var captureRule = function() {
        return rule.apply(this, arguments);
    };
    captureRule.captureName = name;
    return captureRule;
};

var describeToken = function(token) {
    if (token.value) {
        return token.name + " \"" + token.value + "\"";
    } else {
        return token.name;
    }
};
