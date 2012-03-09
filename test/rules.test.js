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
var assertIsError = testing.assertIsError;

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
    assertIsSuccess(test, result, {
        value: "blah",
        source: stringSource("blah", 0, 4)
    });
    test.done();
};

exports.stringConsumesCharactersOfStringIfPresent = function(test) {
    var parser = rules.string();
    var result = parseString(parser, "\"blah\"");
    assertIsSuccess(test, result, {
        value: "blah",
        source: stringSource("\"blah\"", 0, 6)
    });
    test.done();
};

exports.numberConsumesCharactersOfNumberIfPresent = function(test) {
    var parser = rules.number();
    var result = parseString(parser, "42");
    assertIsSuccess(test, result, {
        value: "42",
        source: stringSource("42", 0, 2)
    });
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

exports.firstOfReturnsErrorIfSubRuleReturnsErrorEvenIfLaterRuleSucceeds = function(test) {
    var trueParser = rules.sequence(rules.sequence.cut(), rules.keyword("true"));
    var falseParser = rules.keyword("false");
    var result = parseString(rules.firstOf("Boolean", trueParser, falseParser), "false");
    assertIsError(test, result, {
        remaining:[
            tokens.keyword("false", stringSource("false", 0, 5)),
            tokens.end(stringSource("false", 5, 5))
        ],
        errors: [errors.error({
            expected: "keyword \"true\"",
            actual: "keyword \"false\"",
            location: stringSource("false", 0, 5)
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
    assertIsSuccess(test, result, {
        source: stringSource("()", 0, 2)
    });
    test.done();
};

exports.sequenceFailIfSubParserFails = function(test) {
    var parser = rules.sequence(rules.symbol("("), rules.symbol(")"));
    var result = parseString(parser, "(");
    assertIsFailure(test, result, {
        remaining:[
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
    var name = rules.sequence.capture(rules.identifier(), "name");
    var parser = rules.sequence(rules.symbol("("), name, rules.symbol(")"));
    var result = parseString(parser, "(bob)");
    assertIsSuccess(test, result);
    test.deepEqual(result.value().get(name), "bob");
    test.done();
};

exports.failureInSubRuleInSequenceBeforeCutCausesSequenceToFail = function(test) {
    var parser = rules.sequence(rules.symbol("("), rules.sequence.cut(), rules.identifier(), rules.symbol(")"));
    var result = parseString(parser, "bob");
    assertIsFailure(test, result);
    test.done();
};

exports.failureInSubRuleInSequenceAfterCutCausesError = function(test) {
    var parser = rules.sequence(rules.symbol("("), rules.sequence.cut(), rules.identifier(), rules.symbol(")"));
    var result = parseString(parser, "(");
    assertIsError(test, result, {
        remaining:[
            tokens.end(stringSource("(", 1, 1))
        ],
        errors: [errors.error({
            expected: "identifier",
            actual: "end",
            location: stringSource("(", 1, 1)
        })]
    });
    test.done();
};

exports.canPullSingleValueOutOfCapturedValuesUsingExtract = function(test) {
    var name = rules.sequence.capture(rules.identifier(), "name");
    var parser = rules.then(
        rules.sequence(rules.symbol("("), name, rules.symbol(")")),
        rules.sequence.extract(name)
    );
    var result = parseString(parser, "(bob)");
    assertIsSuccessWithValue(test, result, "bob");
    test.done();
};

exports.canApplyValuesFromSequenceToFunction = function(test) {
    var firstName = rules.sequence.capture(rules.identifier(), "firstName");
    var secondName = rules.sequence.capture(rules.identifier(), "secondName");
    var parser = rules.then(
        rules.sequence(
            secondName,
            rules.symbol(","),
            firstName
        ),
        rules.sequence.applyValues(function(firstName, secondName) {
            return {first: firstName, second: secondName};
        }, firstName, secondName)
    );
    var result = parseString(parser, "Bobertson,Bob");
    assertIsSuccessWithValue(test, result, {first: "Bob", second: "Bobertson"});
    test.done();
};

exports.canApplyValuesWithSourceFromSequenceToFunction = function(test) {
    var firstName = rules.sequence.capture(rules.identifier(), "firstName");
    var secondName = rules.sequence.capture(rules.identifier(), "secondName");
    var parser = rules.then(
        rules.sequence(
            secondName,
            rules.symbol(","),
            firstName
        ),
        rules.sequence.applyValues(function(firstName, secondName, source) {
            return {first: firstName, second: secondName, source: source};
        }, firstName, secondName, rules.sequence.source)
    );
    var result = parseString(parser, "Bobertson,Bob");
    assertIsSuccessWithValue(test, result, {
        first: "Bob",
        second: "Bobertson",
        source: stringSource("Bobertson,Bob", 0, 13)
    });
    test.done();
};

exports.exceptionIfTryingToReadAValueThatHasntBeenCaptured = function(test) {
    var name = rules.sequence.capture(rules.identifier(), "name");
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
    var firstName = rules.sequence.capture(rules.identifier(), "name");
    var secondName = rules.sequence.capture(rules.identifier(), "name");
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

exports.zeroOrMoreWithSeparatorParsesEmptyStringAndReturnsEmptyArray = function(test) {
    var parser = rules.zeroOrMoreWithSeparator(rules.identifier(), rules.symbol(","));
    var result = parseString(parser, "");
    assertIsSuccessWithValue(test, result, []);
    test.done();
};

exports.zeroOrMoreWithSeparatorParsesSingleInstanceOfRuleAndReturnsSingleElementArray = function(test) {
    var parser = rules.zeroOrMoreWithSeparator(rules.identifier(), rules.symbol(","));
    var result = parseString(parser, "blah");
    assertIsSuccessWithValue(test, result, ["blah"]);
    test.done();
};

exports.zeroOrMoreWithSeparatorParsesMultipleInstanceOfRuleAndReturnsArray = function(test) {
    var parser = rules.zeroOrMoreWithSeparator(rules.identifier(), rules.symbol(","));
    var result = parseString(parser, "apple,banana,coconut");
    assertIsSuccessWithValue(test, result, ["apple", "banana", "coconut"]);
    test.done();
};

exports.zeroOrMoreWithSeparatorDoesNotConsumeFinalSeparatorIfItIsNotFollowedByMainRule = function(test) {
    var parser = rules.zeroOrMoreWithSeparator(rules.identifier(), rules.symbol(","));
    var result = parseString(parser, "apple,banana,");
    assertIsSuccess(test, result, {
        remaining: [
            tokens.symbol(",", stringSource("apple,banana,", 12, 13)),
            tokens.end(stringSource("apple,banana,", 13, 13))
        ],
    });
    test.done();
};

exports.zeroOrMoreParsesEmptyStringAndReturnsEmptyArray = function(test) {
    var parser = rules.zeroOrMore(rules.identifier());
    var result = parseString(parser, "");
    assertIsSuccessWithValue(test, result, []);
    test.done();
};

exports.zeroOrMoreParsesSingleInstanceOfRuleAndReturnsSingleElementArray = function(test) {
    var parser = rules.zeroOrMore(rules.identifier());
    var result = parseString(parser, "blah");
    assertIsSuccessWithValue(test, result, ["blah"]);
    test.done();
};

exports.zeroOrMoreParsesMultipleInstanceOfRuleAndReturnsArray = function(test) {
    var parser = rules.zeroOrMore(rules.symbol());
    var result = parseString(parser, "(,)");
    assertIsSuccessWithValue(test, result, ["(", ",", ")"]);
    test.done();
};

exports.oneOrMoreWithSeparatorFailsOnEmptyString = function(test) {
    var parser = rules.oneOrMoreWithSeparator(rules.identifier(), rules.symbol(","));
    var result = parseString(parser, "");
    assertIsFailure(test, result, {
        remaining:[
            tokens.end(stringSource("", 0, 0))
        ],
        errors: [errors.error({
            expected: "identifier",
            actual: "end",
            location: stringSource("", 0, 0)
        })]
    });
    test.done();
};

exports.oneOrMoreWithSeparatorParsesSingleInstanceOfRuleAndReturnsSingleElementArray = function(test) {
    var parser = rules.oneOrMoreWithSeparator(rules.identifier(), rules.symbol(","));
    var result = parseString(parser, "blah");
    assertIsSuccessWithValue(test, result, ["blah"]);
    test.done();
};

exports.oneOrMoreWithSeparatorParsesMultipleInstanceOfRuleAndReturnsArray = function(test) {
    var parser = rules.oneOrMoreWithSeparator(rules.identifier(), rules.symbol(","));
    var result = parseString(parser, "apple,banana,coconut");
    assertIsSuccessWithValue(test, result, ["apple", "banana", "coconut"]);
    test.done();
};

var parseString = function(parser, string) {
    var keywords = ["true", "false"];
    var symbols = ["(", ")", ","];
    var tokens = new tokeniser.Tokeniser({keywords: keywords, symbols: symbols}).tokenise(string).tokens;
    return parser(new TokenIterator(tokens));
}
