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
    },
    string: function(value, source) {
        return new Token("string", value, source);
    },
    number: function(value, source) {
        return new Token("number", value, source);
    }
};

var Token = function(name, value, source) {
    this.name = name;
    this.value = value;
    if (source) {
        this.source = source;
    }
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
        var start;
        var createTokenSource = function() {
            return start.rangeTo(input);
        };
        
        while (!input.isAtEnd()) {
            start = input.copy();
            if (input.peek() === '"') {
                result.push(tokens.string(readStringToken(input), createTokenSource()));
            } else if (isWhitespace(input)) {
                result.push(tokens.whitespace(input.takeWhile(isWhitespace), createTokenSource()));
            } else if (isSymbol(input)) {
                var symbol = matchingSymbol(input);
                for (var i = 0; i < symbol.length; i += 1) {
                    input.next();
                }
                result.push(tokens.symbol(symbol, createTokenSource()));
            } else if (isStartOfNumber(input)) {
                var value = input.takeWhile(isDigit);
                result.push(tokens.number(value, createTokenSource()));
            } else {
                var value = input.takeWhile(and(not(isWhitespace), not(isSymbol)));
                var token = keywords.indexOf(value) === -1
                    ? tokens.identifier(value, createTokenSource())
                    : tokens.keyword(value, createTokenSource());
                result.push(token);
            }
        }

        result.push(tokens.end(input.rangeTo(input)));
        var errors = [];
        return {
            tokens: result,
            errors: errors
        };
    };
    return {
        tokenise: tokenise
    };
};

var readStringToken = function(input) {
    input.next();
    var stringValue = [];
    var value;
    while (input.peek() !== '"') {
        value = input.next();
        if (value === "\\") {
            if (input.peek() === "u") {
                input.next();
                value = String.fromCharCode(parseInt(input.peekString(4), 16));
                for (var i = 0; i < 4; i += 1) {
                    input.next();
                }
            } else {
                value = escapeCharacters[input.next()];
            }
        }
        stringValue.push(value);
    }
    input.next();
    return stringValue.join("");
};

var isWhitespace = function(input) {
    return /^\s$/.test(input.peek());
};

var isStartOfNumber = function(input) {
    return isDigit(input);
};

var isDigit = function(input) {
    return /^[0-9]$/.test(input.peek());
};

var stringIterator = function(string, startIndex) {
    var index = startIndex || 0;
    var self = {
        _index: function() {
            return index;
        },
        copy: function() {
            return stringIterator(string, index);
        },
        rangeTo: function(end) {
            return stringSource(string, index, end._index());
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

var escapeCharacters = {
    '"': '"',
    'b': '\b',
    't': '\t',
    'n': '\n',
    'f': '\f',
    'r': '\r',
    '\'': '\'',
    '\\': '\\'
};
