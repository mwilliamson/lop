var Tokeniser = require("./tokeniser").Tokeniser;
var TokenIterator = require("./TokenIterator");
var StringIterator = require("./StringIterator");
var stringSource = require("./tokeniser").stringSource;

exports.Parser = function(options) {
    var tokeniser = new Tokeniser(options);
    return {
        parseString: function(parser, string) {
            var source = {
                substring: function(startIndex, endIndex) {
                    return stringSource(string, startIndex, endIndex);
                }
            };
            var iterator = new StringIterator(string, source);
            var tokens = tokeniser.tokenise(iterator).tokens;
            var tokensToParse = options.ignoreWhitespace ? ignoreWhitespace(tokens) : tokens;
            var input = new TokenIterator(tokensToParse);
            return parser(input);
        }
    };
};

var ignoreWhitespace = function(tokens) {
    return tokens.filter(function(token) {
        return token.name !== "whitespace";
    });
};
