var tokeniser = require("../lib/tokeniser");
var tokens = tokeniser.tokens;

var keywords = ["true", "false"];
var symbols = ["(", ")", "=>"];

exports.emptyStringIsTokenisedToEndToken =
    stringIsTokenisedTo("", [tokens.end(tokeniser.stringSource("", 0, 0))]);
    
exports.keywordIsTokenised =
    stringIsTokenisedTo("true", [
        tokens.keyword("true", tokeniser.stringSource("true", 0, 4)),
        tokens.end(tokeniser.stringSource("true", 4, 4))
    ]);
    
exports.secondKeywordIsTokenised =
    stringIsTokenisedTo("false", [
        tokens.keyword("false", tokeniser.stringSource("false", 0, 5)),
        tokens.end(tokeniser.stringSource("false", 5, 5))
    ]);
    
exports.identifierIsTokenised =
    stringIsTokenisedTo("blah", [
        tokens.identifier("blah", tokeniser.stringSource("blah", 0, 4)),
        tokens.end(tokeniser.stringSource("blah", 4, 4))
    ]);
    
exports.whitespaceIsTokenised =
    stringIsTokenisedTo("  \t\n\r ", [
        tokens.whitespace("  \t\n\r ", tokeniser.stringSource("  \t\n\r ", 0, 6)),
        tokens.end(tokeniser.stringSource("  \t\n\r ", 6, 6))
    ]);
    
exports.runsOfDifferentTokensAreTokenised =
    stringIsTokenisedTo("  \t\n\r blah true", [
        tokens.whitespace("  \t\n\r ", tokeniser.stringSource("  \t\n\r blah true", 0, 6)),
        tokens.identifier("blah", tokeniser.stringSource("  \t\n\r blah true", 6, 10)),
        tokens.whitespace(" ", tokeniser.stringSource("  \t\n\r blah true", 10, 11)),
        tokens.keyword("true", tokeniser.stringSource("  \t\n\r blah true", 11, 15)),
        tokens.end(tokeniser.stringSource("  \t\n\r blah true", 15, 15))
    ]);
    
exports.symbolIsTokenised =
    stringIsTokenisedTo("(", [
        tokens.symbol("(", tokeniser.stringSource("(", 0, 1)),
        tokens.end(tokeniser.stringSource("(", 1, 1))
    ]);
    
exports.adjacentSymbolsAreTokenisedAsSeparateSymbols =
    stringIsTokenisedTo("()", [
        tokens.symbol("(", tokeniser.stringSource("()", 0, 1)),
        tokens.symbol(")", tokeniser.stringSource("()", 1, 2)),
        tokens.end(tokeniser.stringSource("()", 2, 2))
    ]);
    
exports.symbolsCanBeMultipleCharacters =
    stringIsTokenisedTo("=>", [
        tokens.symbol("=>", tokeniser.stringSource("=>", 0, 2)),
        tokens.end(tokeniser.stringSource("=>", 2, 2))
    ]);
    
exports.whitespaceIsNotRequiredBetweenIdentifierAndSymbol =
    stringIsTokenisedTo("blah()", [
        tokens.identifier("blah", tokeniser.stringSource("blah()", 0, 4)),
        tokens.symbol("(", tokeniser.stringSource("blah()", 4, 5)),
        tokens.symbol(")", tokeniser.stringSource("blah()", 5, 6)),
        tokens.end(tokeniser.stringSource("blah()", 6, 6))
    ]);

function stringIsTokenisedTo(string, expected) {
    return function(test) {
        test.deepEqual(expected, new tokeniser.Tokeniser({keywords: keywords, symbols: symbols}).tokenise(string));
        test.done();
    };
};
