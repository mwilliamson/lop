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
        return rules.sequence(
            rules.token("symbol", "("),
            rules.sequence.capture(rule),
            rules.token("symbol", ")")
        ).map(function(arg) {
            return function(left) {
                return [left, arg];
            };
        });
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

exports.parsingStopsIfPrefixRuleFails = function(test) {
    var partialCallRule = lazyRule(function() {
        return rules.sequence(
            rules.token("symbol", "("),
            rules.sequence.capture(rule),
            rules.token("symbol", ")")
        ).map(function(arg) {
            return function(left) {
                return [left, arg];
            };
        });
    });
    
    var rule = bottomUp.parser("expression",
        [rules.tokenOfType("identifier")],
        [bottomUp.infix("call", partialCallRule)]
    ).rule();
    
    var result = parse(rule, [
        token("symbol", "(", source("(name)", 0, 1)),
        token("identifier", "name", source("(name)", 1, 5)),
        token("symbol", ")", source("(name)", 5, 6)),
        token("end", null, source("(name)", 6, 6))
    ]);
    assertIsFailure(test, result, {
        remaining: [
            token("symbol", "(", source("(name)", 0, 1)),
            token("identifier", "name", source("(name)", 1, 5)),
            token("symbol", ")", source("(name)", 5, 6)),
            token("end", null, source("(name)", 6, 6))
        ],
        errors: [errors.error({
            expected: "expression",
            actual: "symbol \"(\"",
            location: source("(name)", 0, 1)
        })]
    });
    test.done();
};


exports.canParseExpressionWithTwoLeftAssociativeOperators = function(test) {
    var partialAddRule = lazyRule(function() {
        var right = rules.sequence.capture(expressionParser.leftAssociative("add"), "right");
        return rules.sequence(
            rules.token("symbol", "+"),
            right
        ).map(function(right) {
            return function(left) {
                return ["+", left, right];
            };
        });
    });
    
    var partialMultiplyRule = lazyRule(function() {
        var right = rules.sequence.capture(expressionParser.leftAssociative("multiply"), "right");
        return rules.sequence(
            rules.token("symbol", "*"),
            right
        ).map(function(right) {
            return function(left) {
                return ["*", left, right];
            };
        });
    });
    
    var expressionParser = bottomUp.parser("expression",
        [rules.tokenOfType("number")],
        [
            bottomUp.infix("multiply", partialMultiplyRule),
            bottomUp.infix("add", partialAddRule)
        ]
    );
    
    var rule = expressionParser.rule();
    
    var result = parse(rule, [
        token("number", "1", source("1 * 2 * 3 + 4 * 5", 0, 1)),
        token("symbol", "*", source("1 * 2 * 3 + 4 * 5", 2, 3)),
        token("number", "2", source("1 * 2 * 3 + 4 * 5", 4, 5)),
        token("symbol", "*", source("1 * 2 * 3 + 4 * 5", 6, 7)),
        token("number", "3", source("1 * 2 * 3 + 4 * 5", 8, 9)),
        token("symbol", "+", source("1 * 2 * 3 + 4 * 5", 10, 11)),
        token("number", "4", source("1 * 2 * 3 + 4 * 5", 12, 13)),
        token("symbol", "*", source("1 * 2 * 3 + 4 * 5", 14, 15)),
        token("number", "5", source("1 * 2 * 3 + 4 * 5", 16, 17)),
        token("end", null, source("1 * 2 * 3 + 4 * 5", 17, 17))
    ]);
    assertIsSuccess(test, result, {
        value: ["+", ["*", ["*", "1", "2"], "3"], ["*", "4", "5"]],
        source: source("1 * 2 * 3 + 4 * 5", 0, 17)
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
