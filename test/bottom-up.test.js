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

var source = function(string, startIndex, endIndex) {
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
    var result = parse(rule, [
        token("identifier", "blah", source("blah", 0, 4)),
        token("end", null, source("blah", 4, 4))
    ]);
    assertIsSuccess(test, result, {
        value: "blah",
        source: source("blah", 0, 4)
    });
    test.done();
};

exports.canParseSimpleInfixExpression = function(test) {
    var partialCallRule = lazyRule(function() {
        var arg = rules.sequence.capture(rule, "arg");
        return rules.then(
            rules.sequence(
                rules.token("symbol", "("),
                arg,
                rules.token("symbol", ")")
            ),
            rules.sequence.applyValues(function(arg) {
                return function(left) {
                    return [left, arg];
                };
            }, arg)
        );
    });
    
    var rule = bottomUp.parser("expression",
        [rules.tokenOfType("identifier")],
        [bottomUp.infix("call", partialCallRule)]
    ).rule();
    
    var result = parse(rule, [
        token("identifier", "print", source("print(name)", 0, 5)),
        token("symbol", "(", source("print(name)", 5, 6)),
        token("identifier", "name", source("print(name)", 6, 10)),
        token("symbol", ")", source("print(name)", 10, 11)),
        token("end", null, source("print(name)", 11, 11))
    ]);
    assertIsSuccess(test, result, {
        value: ["print", "name"],
        source: source("print(name)", 0, 11)
    });
    test.done();
};

var parse = function(parser, tokens) {
    return parser(new TokenIterator(tokens));
};


var lazyRule = function(ruleBuilder) {
    var rule;
    return function(input) {
        if (!rule) {
            rule = ruleBuilder();
        }
        return rule(input);
    };
};
