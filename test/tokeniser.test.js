var Tokeniser = require("../lib/tokeniser").Tokeniser;
var StringIterator = require("../lib/StringIterator");
var tokens = require("../lib/tokeniser").tokens;
var StringSource = require("../lib/StringSource");

var keywords = ["true", "false"];
var symbols = ["(", ")", "=>"];

exports.emptyStringIsTokenisedToEndToken =
    stringIsTokenisedTo("", [tokens.end(StringSource.range("", 0, 0))]);
    
exports.keywordIsTokenised =
    stringIsTokenisedTo("true", [
        tokens.keyword("true", StringSource.range("true", 0, 4)),
        tokens.end(StringSource.range("true", 4, 4))
    ]);
    
exports.secondKeywordIsTokenised =
    stringIsTokenisedTo("false", [
        tokens.keyword("false", StringSource.range("false", 0, 5)),
        tokens.end(StringSource.range("false", 5, 5))
    ]);
    
exports.identifierIsTokenised =
    stringIsTokenisedTo("blah", [
        tokens.identifier("blah", StringSource.range("blah", 0, 4)),
        tokens.end(StringSource.range("blah", 4, 4))
    ]);
    
exports.whitespaceIsTokenised =
    stringIsTokenisedTo("  \t\n\r ", [
        tokens.whitespace("  \t\n\r ", StringSource.range("  \t\n\r ", 0, 6)),
        tokens.end(StringSource.range("  \t\n\r ", 6, 6))
    ]);
    
exports.runsOfDifferentTokensAreTokenised =
    stringIsTokenisedTo("  \t\n\r blah true", [
        tokens.whitespace("  \t\n\r ", StringSource.range("  \t\n\r blah true", 0, 6)),
        tokens.identifier("blah", StringSource.range("  \t\n\r blah true", 6, 10)),
        tokens.whitespace(" ", StringSource.range("  \t\n\r blah true", 10, 11)),
        tokens.keyword("true", StringSource.range("  \t\n\r blah true", 11, 15)),
        tokens.end(StringSource.range("  \t\n\r blah true", 15, 15))
    ]);
    
exports.symbolIsTokenised =
    stringIsTokenisedTo("(", [
        tokens.symbol("(", StringSource.range("(", 0, 1)),
        tokens.end(StringSource.range("(", 1, 1))
    ]);
    
exports.adjacentSymbolsAreTokenisedAsSeparateSymbols =
    stringIsTokenisedTo("()", [
        tokens.symbol("(", StringSource.range("()", 0, 1)),
        tokens.symbol(")", StringSource.range("()", 1, 2)),
        tokens.end(StringSource.range("()", 2, 2))
    ]);
    
exports.symbolsCanBeMultipleCharacters =
    stringIsTokenisedTo("=>", [
        tokens.symbol("=>", StringSource.range("=>", 0, 2)),
        tokens.end(StringSource.range("=>", 2, 2))
    ]);
    
exports.whitespaceIsNotRequiredBetweenIdentifierAndSymbol =
    stringIsTokenisedTo("blah()", [
        tokens.identifier("blah", StringSource.range("blah()", 0, 4)),
        tokens.symbol("(", StringSource.range("blah()", 4, 5)),
        tokens.symbol(")", StringSource.range("blah()", 5, 6)),
        tokens.end(StringSource.range("blah()", 6, 6))
    ]);
    
exports.canParseSimpleString =
    stringIsTokenisedTo('"Blah"', [
        tokens.string("Blah", StringSource.range('"Blah"', 0, 6)),
        tokens.end(StringSource.range('"Blah"', 6, 6))
    ]);
    
exports.canParseStringWithEscapedCharacters =
    stringIsTokenisedTo("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", [
        tokens.string("\"\b\t\n\f\r'\\", StringSource.range("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", 0, 18)),
        tokens.end(StringSource.range("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", 18, 18))
    ]);
    
exports.canReadUnicodeCharacters = 
    stringIsTokenisedTo("\"\\u000a\"", [
        tokens.string("\n", StringSource.range("\"\\u000a\"", 0, 8)),
        tokens.end(StringSource.range("\"\\u000a\"", 8, 8))
    ]);

exports.canParseZero =
    stringIsTokenisedTo("0", [
        tokens.number("0", StringSource.range("0", 0, 1)),
        tokens.end(StringSource.range("0", 1, 1))
    ]);

exports.canParsePositiveIntegers =
    stringIsTokenisedTo("42", [
        tokens.number("42", StringSource.range("42", 0, 2)),
        tokens.end(StringSource.range("42", 2, 2))
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
