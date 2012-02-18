var Tokeniser = require("./tokeniser").Tokeniser;
var TokenIterator = require("./TokenIterator");

exports.Parser = function(options) {
    var tokeniser = new Tokeniser(options);
    return {
        parseString: function(parser, string) {
            var input = new TokenIterator(tokeniser.tokenise(string));
            return parser(input);
        }
    };
};

