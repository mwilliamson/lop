var options = require("options");

var rules = require("../lib/rules");
var tokeniser = require("../lib/tokeniser");
var testing = require("../lib/testing");
var TokenIterator = require("../lib/TokenIterator");
var errors = require("../lib/errors");
var tokens = tokeniser.tokens;
var stringSource = tokeniser.stringSource;
var assertIsSuccess = testing.assertIsSuccess;
var assertIsSuccessWithValue = testing.assertIsSuccessWithValue;
var assertIsFailure = testing.assertIsFailure;
var assertIsFailureWithRemaining = testing.assertIsFailureWithRemaining;

exports.keywordConsumesCharactersOfKeywordIfPresent = function(test) {
    var parser = rules.keyword("true");
    var result = parseString(parser, "true");
    assertIsSuccessWithValue(test, result, "true", stringSource("true", 0, 4));
    test.done();
};

exports.parsingKeywordFailsIfStringIsNotKeyword = function(test) {
    var parser = rules.keyword("true");
    var result = parseString(parser, "blah");
    assertIsFailure(test, result, {
        remaining: [
            tokens.identifier("blah", stringSource("blah", 0, 4)),
            tokens.end(stringSource("blah", 4, 4))
        ],
        errors: [errors.error({
            expected: "keyword \"true\"",
            actual: "identifier \"blah\"",
            location: stringSource("blah", 0, 4)
        })]
    });
    test.done();
};

exports.identifierConsumesCharactersOfIdentifierIfPresent = function(test) {
    var parser = rules.identifier();
    var result = parseString(parser, "blah");
    assertIsSuccessWithValue(test, result, "blah", stringSource("blah", 0, 4));
    test.done();
};

exports.firstSuccessIsReturnedByFirstOf = function(test) {
    var trueParser = rules.keyword("true");
    var falseParser = rules.keyword("false");
    var evilParser = function() {
        throw new Error("Hahaha!");
    };
    var result = parseString(rules.firstOf("Boolean", trueParser, falseParser, evilParser), "false");
    assertIsSuccessWithValue(test, result, "false");
    test.done();
};

exports.firstOfFailsIfNoParsersMatch = function(test) {
    var trueParser = rules.keyword("true");
    var falseParser = rules.keyword("false");
    var result = parseString(rules.firstOf("Boolean", trueParser, falseParser), "blah");
    assertIsFailure(test, result, {
        remaining:[
            tokens.identifier("blah", stringSource("blah", 0, 4)),
            tokens.end(stringSource("blah", 4, 4))
        ],
        errors: [errors.error({
            expected: "Boolean",
            actual: "identifier \"blah\"",
            location: stringSource("blah", 0, 4)
        })]
    });
    test.done();
};

exports.thenReturnsFailureIfOriginalResultIsFailure = function(test) {
    var parser = rules.then(rules.keyword("true"), function() { return true; });
    var result = parseString(parser, "blah");
    assertIsFailure(test, result, {
        remaining:[
            tokens.identifier("blah", stringSource("blah", 0, 4)),
            tokens.end(stringSource("blah", 4, 4))
        ],
        errors: [errors.error({
            expected: "keyword \"true\"",
            actual: "identifier \"blah\"",
            location: stringSource("blah", 0, 4)
        })]
    });
    test.done();
};

exports.thenMapsOverValueIfOriginalResultIsSuccess = function(test) {
    var parser = rules.then(rules.keyword("true"), function() { return true; });
    var result = parseString(parser, "true");
    assertIsSuccessWithValue(test, result, true);
    test.done();
};

exports.sequenceSucceedsIfSubParsersCanBeAppliedInOrder = function(test) {
    var parser = rules.sequence(rules.symbol("("), rules.symbol(")"));
    var result = parseString(parser, "()");
    assertIsSuccess(test, result);
    test.done();
};

exports.sequenceFailIfSubParserFails = function(test) {
    var parser = rules.sequence(rules.symbol("("), rules.symbol(")"));
    var result = parseString(parser, "(");
    assertIsFailure(test, result, {
        remaining:[
            tokens.symbol("(", stringSource("(", 0, 1)),
            tokens.end(stringSource("(", 1, 1))
        ],
        errors: [errors.error({
            expected: "symbol \")\"",
            actual: "end",
            location: stringSource("(", 1, 1)
        })]
    });
    test.done();
};

exports.sequenceFailIfSubParserFailsAndFinalParserSucceeds = function(test) {
    var parser = rules.sequence(rules.symbol("("), rules.symbol(")"));
    var result = parseString(parser, ")");
    assertIsFailure(test, result, {
        remaining:[
            tokens.symbol(")", stringSource(")", 0, 1)),
            tokens.end(stringSource(")", 1, 1))
        ],
        errors: [errors.error({
            expected: "symbol \"(\"",
            actual: "symbol \")\"",
            location: stringSource(")", 0, 1)
        })]
    });
    test.done();
};

exports.sequenceReturnsMapOfCapturedValues = function(test) {
    var name = rules.capture(rules.identifier(), "name");
    var parser = rules.sequence(rules.symbol("("), name, rules.symbol(")"));
    var result = parseString(parser, "(bob)");
    assertIsSuccess(test, result);
    test.deepEqual(result.value().get(name), "bob");
    test.done();
};

exports.canPullSingleValueOutOfCapturedValuesUsingExtract = function(test) {
    var name = rules.capture(rules.identifier(), "name");
    var parser = rules.then(
        rules.sequence(rules.symbol("("), name, rules.symbol(")")),
        rules.sequence.extract(name)
    );
    var result = parseString(parser, "(bob)");
    assertIsSuccessWithValue(test, result, "bob");
    test.done();
};

exports.exceptionIfTryingToReadAValueThatHasntBeenCaptured = function(test) {
    var name = rules.capture(rules.identifier(), "name");
    var parser = rules.sequence(rules.symbol("("), rules.symbol(")"));
    var result = parseString(parser, "()");
    assertIsSuccess(test, result);
    try {
        result.value().get(name);
        test.ok(false, "Expected exception");
    } catch (error) {
        test.equal(error.message, "No value for capture \"name\"");
    }
    test.done();
};

exports.exceptionIfTryingToCaptureValueWithUsedName = function(test) {
    var firstName = rules.capture(rules.identifier(), "name");
    var secondName = rules.capture(rules.identifier(), "name");
    var parser = rules.sequence(secondName, rules.symbol(","), firstName);
    try {
        parseString(parser, "Bobertson,Bob")
        test.ok(false, "Expected exception");
    } catch (error) {
        test.equal(error.message, "Cannot add second value for capture \"name\"");
    }
    test.done();
};

exports.optionalRuleDoesNothingIfValueDoesNotMatch = function(test) {
    var parser = rules.optional(rules.symbol("("));
    var result = parseString(parser, "");
    assertIsSuccess(test, result);
    test.deepEqual(result.value(), options.none);
    test.done();
};

exports.optionalRuleConsumesInputIfPossible = function(test) {
    var parser = rules.optional(rules.symbol("("));
    var result = parseString(parser, "(");
    assertIsSuccess(test, result);
    test.deepEqual(result.value(), options.some("("));
    test.done();
};

var parseString = function(parser, string) {
    var keywords = ["true", "false"];
    var symbols = ["(", ")", ","];
    var tokens = new tokeniser.Tokeniser({keywords: keywords, symbols: symbols}).tokenise(string);
    return parser(new TokenIterator(tokens));
}
