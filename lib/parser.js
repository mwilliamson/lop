var Tokeniser = require("./tokeniser").Tokeniser;
var TokenIterator = require("./TokenIterator");
var StringIterator = require("./StringIterator");
var StringSource = require("./StringSource");

exports.Parser = function(options) {
    var tokeniser = new Tokeniser(options);
    return {
        parseString: function(parser, string) {
            var source = new StringSource(string);
            var iterator = new StringIterator(source);
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
