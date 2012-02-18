var parsing = require("../lib/parsing");
var tokeniser = require("../lib/tokeniser");
var testing = require("../lib/testing");
var tokens = tokeniser.tokens;
var stringSource = tokeniser.stringSource;
var assertIsSuccessWithValue = testing.assertIsSuccessWithValue;
var assertIsFailureWithRemaining = testing.assertIsFailureWithRemaining;

exports.keywordConsumesCharactersOfKeywordIfPresent = function(test) {
    var parser = parsing.keyword("true");
    var result = parseString(parser, "true");
    assertIsSuccessWithValue(test, result, "true", stringSource("true", 0, 4));
    test.done();
};

exports.parsingKeywordFailsIfStringIsNotKeyword = function(test) {
    var parser = parsing.keyword("true");
    var result = parseString(parser, "blah");
    assertIsFailureWithRemaining(test, result, [
        tokens.identifier("blah", stringSource("blah", 0, 4)),
        tokens.end(stringSource("blah", 4, 4))
    ]);
    test.done();
};

exports.firstSuccessIsReturnedByFirstOf = function(test) {
    var trueParser = parsing.keyword("true");
    var falseParser = parsing.keyword("false");
    var evilParser = function() {
        throw new Error("Hahaha!");
    };
    var result = parseString(parsing.firstOf("Boolean", trueParser, falseParser, evilParser), "false");
    assertIsSuccessWithValue(test, result, "false");
    test.done();
};

exports.firstOfFailsIfNoParsersMatch = function(test) {
    var trueParser = parsing.keyword("true");
    var falseParser = parsing.keyword("false");
    var result = parseString(parsing.firstOf("Boolean", trueParser, falseParser), "blah");
    assertIsFailureWithRemaining(test, result, [
        tokens.identifier("blah", stringSource("blah", 0, 4)),
        tokens.end(stringSource("blah", 4, 4))
    ]);
    test.done();
};

exports.thenReturnsFailureIfOriginalResultIsFailure = function(test) {
    var parser = parsing.then(parsing.keyword("true"), function() { return true; });
    var result = parseString(parser, "blah");
    assertIsFailureWithRemaining(test, result, [
        tokens.identifier("blah", stringSource("blah", 0, 4)),
        tokens.end(stringSource("blah", 4, 4))
    ]);
    test.done();
};

exports.thenMapsOverValueIfOriginalResultIsSuccess = function(test) {
    var parser = parsing.then(parsing.keyword("true"), function() { return true; });
    var result = parseString(parser, "true");
    assertIsSuccessWithValue(test, result, true);
    test.done();
};

exports.sequenceSucceedsWithValuesFromSubParsers = function(test) {
    var parser = parsing.sequence(parsing.symbol("("), parsing.symbol(")"));
    var result = parseString(parser, "()");
    assertIsSuccessWithValue(test, result, ["(", ")"]);
    test.done();
};

var parseString = function(parser, string) {
    var keywords = ["true", "false"];
    var symbols = ["(", ")"];
    var tokens = new tokeniser.Tokeniser({keywords: keywords, symbols: symbols}).tokenise(string);
    return parser(new parsing.TokenIterator(tokens));
}
