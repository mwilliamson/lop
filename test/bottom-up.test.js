var options = require("options");

var rules = require("../lib/rules");
var bottomUp = require("../lib/bottom-up");
var testing = require("../lib/testing");
var TokenIterator = require("../lib/TokenIterator");
var errors = require("../lib/errors");
var results = require("../lib/parsing-results");
var StringSource = require("../lib/StringSource");
var assertIsSuccess = testing.assertIsSuccess;
var assertIsSuccessWithValue = testing.assertIsSuccessWithValue;
var assertIsFailure = testing.assertIsFailure;
var assertIsFailureWithRemaining = testing.assertIsFailureWithRemaining;
var assertIsError = testing.assertIsError;
var Tokeniser = require("./Tokeniser");
var Token = require("../lib/Token");

var stringSourceRange = function(string, startIndex, endIndex) {
    return new StringSource(string).range(startIndex, endIndex);
};

var token = function(tokenType, value, source) {
    return new Token(tokenType, value, source);
};

exports.canParsePrefixExpression = function(test) {
    var rule = bottomUp.parser("expression",
        [rules.tokenOfType("identifier")],
        []
    ).rule();
    var result = parseString(rule, "blah");
    assertIsSuccess(test, result, {
        value: "blah",
        source: stringSourceRange("blah", 0, 4)
    });
    test.done();
};

var parseString = function(parser, string) {
    var keywords = ["true", "false"];
    var tokens = new Tokeniser({keywords: keywords}).tokenise(string);
    return parser(new TokenIterator(tokens));
};

var parseTokens = function(parser, tokens) {
    return parser(new TokenIterator(tokens));
};

