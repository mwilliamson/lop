var _ = require("underscore");

var tokens = exports.tokens = {
    end: function(source) {
        return new Token("end", null, source);
    },
    keyword: function(value, source) {
        return new Token("keyword", value, source);
    },
    whitespace: function(value, source) {
        return new Token("whitespace", value, source);
    },
    identifier: function(value, source) {
        return new Token("identifier", value, source);
    },
    symbol: function(value, source) {
        return new Token("symbol", value, source);
    }
};

var Token = function(name, value, source) {
    this.name = name;
    this.value = value;
    this.source = source;
};

var Tokeniser = exports.Tokeniser = function(options) {
    var keywords = options.keywords;
    var symbols = options.symbols;
    
    var matchingSymbol = function(input) {
        return _.find(symbols, function(symbol) {
            return input.peekString(symbol.length) === symbol;
        });
    };
    
    var isSymbol = function(input) {
        return !!matchingSymbol(input);
    };
    
    var tokenise = function(string) {
        var input = stringIterator(string);
        var result = [];
        var startIndex;
        var createTokenSource = function() {
            return stringSource(string, startIndex, input.index());
        };
        
        while (!input.isAtEnd()) {
            startIndex = input.index();
            if (isWhitespace(input)) {
                result.push(tokens.whitespace(input.takeWhile(isWhitespace), createTokenSource()));
            } else if (isSymbol(input)) {
                var symbol = matchingSymbol(input);
                for (var i = 0; i < symbol.length; i += 1) {
                    input.next();
                }
                result.push(tokens.symbol(symbol, createTokenSource()));
            } else {
                var value = input.takeWhile(and(not(isWhitespace), not(isSymbol)));
                var token = keywords.indexOf(value) === -1
                    ? tokens.identifier(value, createTokenSource())
                    : tokens.keyword(value, createTokenSource());
                result.push(token);
            }
        }

        result.push(tokens.end(stringSource(string, input.index(), input.index())));
        return result;
    };
    return {
        tokenise: tokenise
    };
};

var isWhitespace = function(input) {
    return /^\s$/.test(input.peek());
};

var stringIterator = function(string) {
    var index = 0;
    var self = {
        index: function() {
            return index;
        },
        next: function() {
            if (self.isAtEnd()) {
                throw new Error("No more characters");
            } else {
                return string.charAt(index++);
            }
        },
        peek: function() {
            return string.charAt(index);
        },
        peekString: function(length) {
            return string.substring(index, index + length);
        },
        isAtEnd: function() {
            return index >= string.length;
        },
        takeWhile: function(condition) {
            var startIndex = index;
            while (condition(self) && !self.isAtEnd()) {
                index += 1;
            }
            return string.substring(startIndex, index);
        }
    };
    return self;
};

var not = function(condition) {
    return function(value) {
        return !condition(value);
    };
};

var and = function() {
    var conditions = Array.prototype.slice.call(arguments, 0);
    return function(value) {
        return conditions.every(function(condition) {
            return condition(value);
        });
    };
};

var stringSource = exports.stringSource = function(string, startIndex, endIndex) {
    return {
        string: string,
        startIndex: startIndex,
        endIndex: endIndex
    };
};
