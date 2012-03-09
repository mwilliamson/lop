var _ = require("underscore");
var options = require("options");
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

exports.string = function() {
    return token("string");
};

exports.number = function() {
    return token("number");
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
                return result.isSuccess() || result.isError();
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
        var result = _.foldl(parsers, function(memo, parser) {
            var result = memo.result;
            var hasCut = memo.hasCut;
            if (!result.isSuccess()) {
                return {result: result, hasCut: hasCut};
            }
            var subResult = parser(result.remaining());
            if (subResult.isCut()) {
                return {result: result, hasCut: true};
            } else if (subResult.isSuccess()) {
                var values;
                if (parser.captureName) {
                    values = result.value().withValue(parser, subResult.value());
                } else {
                    values = result.value();
                }
                var remaining = subResult.remaining();
                var source = input.to(remaining);
                return {
                    result: results.success(values, remaining, source),
                    hasCut: hasCut
                };
            } else if (hasCut) {
                return {result: results.error(subResult.errors(), subResult.remaining()), hasCut: hasCut};
            } else {
                return {result: subResult, hasCut: hasCut};
            }
        }, {result: results.success(new SequenceValues(), input), hasCut: false}).result;
        var source = input.to(result.remaining());
        return result.map(function(values) {
            return values.withValue(exports.sequence.source, source);
        });
    };
};

var SequenceValues = function(values) {
    this._values = values || {};
};

SequenceValues.prototype.withValue = function(rule, value) {
    if (rule.captureName in this._values) {
        throw new Error("Cannot add second value for capture \"" + rule.captureName + "\"");
    } else {
        var newValues = _.clone(this._values);
        newValues[rule.captureName] = value;
        return new SequenceValues(newValues);
    }
};

SequenceValues.prototype.get = function(rule) {
    if (rule.captureName in this._values) {
        return this._values[rule.captureName];
    } else {
        throw new Error("No value for capture \"" + rule.captureName + "\"");
    }
};

exports.sequence.capture = function(rule, name) {
    var captureRule = function() {
        return rule.apply(this, arguments);
    };
    captureRule.captureName = name;
    return captureRule;
};

exports.sequence.extract = function(rule) {
    return function(result) {
        return result.get(rule);
    };
};

exports.sequence.applyValues = function(func) {
    // TODO: check captureName doesn't conflict with source or other captures
    var rules = Array.prototype.slice.call(arguments, 1);
    return function(result) {
        var values = rules.map(function(rule) {
            return result.get(rule);
        });
        return func.apply(this, values);
    };
};

exports.sequence.source = {
    captureName: "☃source☃"
};

exports.sequence.cut = function() {
    return function(input) {
        return results.cut(input);
    };
};

exports.optional = function(rule) {
    return function(input) {
        var result = rule(input);
        if (result.isSuccess()) {
            return result.map(options.some);
        } else {
            return results.success(options.none, input);
        }
    };
};

exports.zeroOrMoreWithSeparator = function(rule, separator) {
    return repeatedWithSeparator(rule, separator, false);
};

exports.oneOrMoreWithSeparator = function(rule, separator) {
    return repeatedWithSeparator(rule, separator, true);
};

var zeroOrMore = exports.zeroOrMore = function(rule) {
    return function(input) {
        var values = [];
        var result;
        while ((result = rule(input)) && result.isSuccess()) {
            input = result.remaining();
            values.push(result.value());
        }
        return results.success(values, input);
    };
};

var repeatedWithSeparator = function(rule, separator, isOneOrMore) {
    return function(input) {
        var result = rule(input);
        if (result.isSuccess()) {
            var mainRule = exports.sequence.capture(rule, "main");
            var remainingRule = zeroOrMore(exports.then(
                exports.sequence(separator, mainRule),
                exports.sequence.extract(mainRule)
            ));
            var remainingResult = remainingRule(result.remaining());
            return results.success([result.value()].concat(remainingResult.value()), remainingResult.remaining());
        } else if (isOneOrMore) {
            return result;
        } else {
            return results.success([], input);
        }
    };
};

exports.leftAssociative = function(leftRule, repeatedRule, func) {
    return function(input) {
        var start = input;
        var leftResult = leftRule(input);
        if (!leftResult.isSuccess()) {
            return leftResult;
        }
        var repeatedResult = repeatedRule(leftResult.remaining());
        while (repeatedResult.isSuccess()) {
            var remaining = repeatedResult.remaining();
            var source = start.to(repeatedResult.remaining());
            leftResult = results.success(
                func(leftResult.value(), repeatedResult.value(), source),
                remaining,
                source
            );
            repeatedResult = repeatedRule(leftResult.remaining());
        }
        return leftResult;
    };
};

var describeToken = function(token) {
    if (token.value) {
        return token.name + " \"" + token.value + "\"";
    } else {
        return token.name;
    }
};
