var Tokeniser = require("../lib/tokeniser").Tokeniser;
var StringIterator = require("../lib/StringIterator");
var tokens = require("../lib/tokeniser").tokens;
var StringSource = require("../lib/StringSource");

var keywords = ["true", "false"];
var symbols = ["(", ")", "=>"];

var stringSourceRange = function(string, startIndex, endIndex) {
    return new StringSource(string).range(startIndex, endIndex);
};

exports.emptyStringIsTokenisedToEndToken =
    stringIsTokenisedTo("", [tokens.end(stringSourceRange("", 0, 0))]);
    
exports.keywordIsTokenised =
    stringIsTokenisedTo("true", [
        tokens.keyword("true", stringSourceRange("true", 0, 4)),
        tokens.end(stringSourceRange("true", 4, 4))
    ]);
    
exports.secondKeywordIsTokenised =
    stringIsTokenisedTo("false", [
        tokens.keyword("false", stringSourceRange("false", 0, 5)),
        tokens.end(stringSourceRange("false", 5, 5))
    ]);
    
exports.identifierIsTokenised =
    stringIsTokenisedTo("blah", [
        tokens.identifier("blah", stringSourceRange("blah", 0, 4)),
        tokens.end(stringSourceRange("blah", 4, 4))
    ]);
    
exports.whitespaceIsTokenised =
    stringIsTokenisedTo("  \t\n\r ", [
        tokens.whitespace("  \t\n\r ", stringSourceRange("  \t\n\r ", 0, 6)),
        tokens.end(stringSourceRange("  \t\n\r ", 6, 6))
    ]);
    
exports.runsOfDifferentTokensAreTokenised =
    stringIsTokenisedTo("  \t\n\r blah true", [
        tokens.whitespace("  \t\n\r ", stringSourceRange("  \t\n\r blah true", 0, 6)),
        tokens.identifier("blah", stringSourceRange("  \t\n\r blah true", 6, 10)),
        tokens.whitespace(" ", stringSourceRange("  \t\n\r blah true", 10, 11)),
        tokens.keyword("true", stringSourceRange("  \t\n\r blah true", 11, 15)),
        tokens.end(stringSourceRange("  \t\n\r blah true", 15, 15))
    ]);
    
exports.symbolIsTokenised =
    stringIsTokenisedTo("(", [
        tokens.symbol("(", stringSourceRange("(", 0, 1)),
        tokens.end(stringSourceRange("(", 1, 1))
    ]);
    
exports.adjacentSymbolsAreTokenisedAsSeparateSymbols =
    stringIsTokenisedTo("()", [
        tokens.symbol("(", stringSourceRange("()", 0, 1)),
        tokens.symbol(")", stringSourceRange("()", 1, 2)),
        tokens.end(stringSourceRange("()", 2, 2))
    ]);
    
exports.symbolsCanBeMultipleCharacters =
    stringIsTokenisedTo("=>", [
        tokens.symbol("=>", stringSourceRange("=>", 0, 2)),
        tokens.end(stringSourceRange("=>", 2, 2))
    ]);
    
exports.whitespaceIsNotRequiredBetweenIdentifierAndSymbol =
    stringIsTokenisedTo("blah()", [
        tokens.identifier("blah", stringSourceRange("blah()", 0, 4)),
        tokens.symbol("(", stringSourceRange("blah()", 4, 5)),
        tokens.symbol(")", stringSourceRange("blah()", 5, 6)),
        tokens.end(stringSourceRange("blah()", 6, 6))
    ]);
    
exports.canParseSimpleString =
    stringIsTokenisedTo('"Blah"', [
        tokens.string("Blah", stringSourceRange('"Blah"', 0, 6)),
        tokens.end(stringSourceRange('"Blah"', 6, 6))
    ]);
    
exports.canParseStringWithEscapedCharacters =
    stringIsTokenisedTo("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", [
        tokens.string("\"\b\t\n\f\r'\\", stringSourceRange("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", 0, 18)),
        tokens.end(stringSourceRange("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", 18, 18))
    ]);
    
exports.canReadUnicodeCharacters = 
    stringIsTokenisedTo("\"\\u000a\"", [
        tokens.string("\n", stringSourceRange("\"\\u000a\"", 0, 8)),
        tokens.end(stringSourceRange("\"\\u000a\"", 8, 8))
    ]);

exports.canParseZero =
    stringIsTokenisedTo("0", [
        tokens.number("0", stringSourceRange("0", 0, 1)),
        tokens.end(stringSourceRange("0", 1, 1))
    ]);

exports.canParsePositiveIntegers =
    stringIsTokenisedTo("42", [
        tokens.number("42", stringSourceRange("42", 0, 2)),
        tokens.end(stringSourceRange("42", 2, 2))
    ]);

function stringIsTokenisedTo(string, expected) {
    var source = new StringSource(string);
    var iterator = new StringIterator(source);
    var tokeniser = new Tokeniser({keywords: keywords, symbols: symbols});
    
    return function(test) {
        test.deepEqual(expected, tokeniser.tokenise(iterator).tokens);
        test.done();
    };
};
