var Tokeniser = require("../lib/tokeniser").Tokeniser;
var StringIterator = require("../lib/StringIterator");
var tokens = require("../lib/tokeniser").tokens;
var stringSource = require("../lib/tokeniser").stringSource;

var keywords = ["true", "false"];
var symbols = ["(", ")", "=>"];

exports.emptyStringIsTokenisedToEndToken =
    stringIsTokenisedTo("", [tokens.end(stringSource("", 0, 0))]);
    
exports.keywordIsTokenised =
    stringIsTokenisedTo("true", [
        tokens.keyword("true", stringSource("true", 0, 4)),
        tokens.end(stringSource("true", 4, 4))
    ]);
    
exports.secondKeywordIsTokenised =
    stringIsTokenisedTo("false", [
        tokens.keyword("false", stringSource("false", 0, 5)),
        tokens.end(stringSource("false", 5, 5))
    ]);
    
exports.identifierIsTokenised =
    stringIsTokenisedTo("blah", [
        tokens.identifier("blah", stringSource("blah", 0, 4)),
        tokens.end(stringSource("blah", 4, 4))
    ]);
    
exports.whitespaceIsTokenised =
    stringIsTokenisedTo("  \t\n\r ", [
        tokens.whitespace("  \t\n\r ", stringSource("  \t\n\r ", 0, 6)),
        tokens.end(stringSource("  \t\n\r ", 6, 6))
    ]);
    
exports.runsOfDifferentTokensAreTokenised =
    stringIsTokenisedTo("  \t\n\r blah true", [
        tokens.whitespace("  \t\n\r ", stringSource("  \t\n\r blah true", 0, 6)),
        tokens.identifier("blah", stringSource("  \t\n\r blah true", 6, 10)),
        tokens.whitespace(" ", stringSource("  \t\n\r blah true", 10, 11)),
        tokens.keyword("true", stringSource("  \t\n\r blah true", 11, 15)),
        tokens.end(stringSource("  \t\n\r blah true", 15, 15))
    ]);
    
exports.symbolIsTokenised =
    stringIsTokenisedTo("(", [
        tokens.symbol("(", stringSource("(", 0, 1)),
        tokens.end(stringSource("(", 1, 1))
    ]);
    
exports.adjacentSymbolsAreTokenisedAsSeparateSymbols =
    stringIsTokenisedTo("()", [
        tokens.symbol("(", stringSource("()", 0, 1)),
        tokens.symbol(")", stringSource("()", 1, 2)),
        tokens.end(stringSource("()", 2, 2))
    ]);
    
exports.symbolsCanBeMultipleCharacters =
    stringIsTokenisedTo("=>", [
        tokens.symbol("=>", stringSource("=>", 0, 2)),
        tokens.end(stringSource("=>", 2, 2))
    ]);
    
exports.whitespaceIsNotRequiredBetweenIdentifierAndSymbol =
    stringIsTokenisedTo("blah()", [
        tokens.identifier("blah", stringSource("blah()", 0, 4)),
        tokens.symbol("(", stringSource("blah()", 4, 5)),
        tokens.symbol(")", stringSource("blah()", 5, 6)),
        tokens.end(stringSource("blah()", 6, 6))
    ]);
    
exports.canParseSimpleString =
    stringIsTokenisedTo('"Blah"', [
        tokens.string("Blah", stringSource('"Blah"', 0, 6)),
        tokens.end(stringSource('"Blah"', 6, 6))
    ]);
    
exports.canParseStringWithEscapedCharacters =
    stringIsTokenisedTo("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", [
        tokens.string("\"\b\t\n\f\r'\\", stringSource("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", 0, 18)),
        tokens.end(stringSource("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", 18, 18))
    ]);
    
exports.canReadUnicodeCharacters = 
    stringIsTokenisedTo("\"\\u000a\"", [
        tokens.string("\n", stringSource("\"\\u000a\"", 0, 8)),
        tokens.end(stringSource("\"\\u000a\"", 8, 8))
    ]);

exports.canParseZero =
    stringIsTokenisedTo("0", [
        tokens.number("0", stringSource("0", 0, 1)),
        tokens.end(stringSource("0", 1, 1))
    ]);

exports.canParsePositiveIntegers =
    stringIsTokenisedTo("42", [
        tokens.number("42", stringSource("42", 0, 2)),
        tokens.end(stringSource("42", 2, 2))
    ]);

function stringIsTokenisedTo(string, expected) {
    var source = {
        substring: function(startIndex, endIndex) {
            return stringSource(string, startIndex, endIndex);
        }
    };
    var iterator = new StringIterator(string, source);
    var tokeniser = new Tokeniser({keywords: keywords, symbols: symbols});
    
    return function(test) {
        test.deepEqual(expected, tokeniser.tokenise(iterator).tokens);
        test.done();
    };
};
