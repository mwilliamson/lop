var _ = require("underscore");
var results = require("./parsing-results");
var tokeniser = require("./tokeniser");

var token = function(tokenType, value) {
    return function(input) {
        var token = input.get(0);
        if (token.name === tokenType && token.value === value) {
            return results.success(value, input.slice(1), token.source);
        } else {
            return results.failure(input);
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
            //~ if (!result.isSuccess()) {
                //~ return result;
            //~ }
            var subResult = parser(result.remaining());
            var values = _.clone(result.value());
            values.push(subResult.value());
            return results.success(values, subResult.remaining());
        }, results.success([], input));
    };
};

var TokenIterator = exports.TokenIterator = function(tokens, startIndex) {
    this._tokens = tokens;
    this._startIndex = startIndex || 0;
};

TokenIterator.prototype.get = function(index) {
    return this._tokens[this._startIndex + index];
};

TokenIterator.prototype.toArray = function() {
    return this._tokens.slice(this._startIndex);
};

TokenIterator.prototype.slice = function(startIndex) {
    return new TokenIterator(this._tokens, this._startIndex + startIndex);
};

TokenIterator.prototype.to = function(end) {
    var string = this._tokens[0].source.string;
    return tokeniser.stringSource(
        string,
        this._tokens[this._startIndex].source.startIndex,
        end._tokens[end._startIndex].source.endIndex
    );
};
