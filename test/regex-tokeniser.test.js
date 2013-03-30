var RegexTokeniser = require("../lib/regex-tokeniser").RegexTokeniser;
var Token = require("../lib/Token");
var StringSource = require("../lib/StringSource");

exports.emptyStringIsTokenisedToEndToken = stringIsTokenisedTo("", [
    new Token("end", null, stringSourceRange("", 0, 0))
]);

exports.canMatchSingleToken = stringIsTokenisedTo("blah", [
    new Token("identifier", "blah", stringSourceRange("blah", 0, 4)),
    new Token("end", null, stringSourceRange("blah", 4, 4))
]);

exports.canMatchMultipleTokens = stringIsTokenisedTo("a.btn", [
    new Token("identifier", "a", stringSourceRange("a.btn", 0, 1)),
    new Token("dot", ".", stringSourceRange("a.btn", 1, 2)),
    new Token("identifier", "btn", stringSourceRange("a.btn", 2, 5)),
    new Token("end", null, stringSourceRange("a.btn", 5, 5))
]);

exports.unrecognisedCharactersAreTokenised = stringIsTokenisedTo("!btn", [
    new Token("unrecognisedCharacter", "!", stringSourceRange("!btn", 0, 1)),
    new Token("identifier", "btn", stringSourceRange("!btn", 1, 4)),
    new Token("end", null, stringSourceRange("!btn", 4, 4))
]);

function stringIsTokenisedTo(input, expected) {
    return function(test) {
        test.deepEqual(expected, tokenise(input));
        test.done();
    };
};

function stringSourceRange(string, startIndex, endIndex) {
    return new StringSource(string).range(startIndex, endIndex);
};

function tokenise(input) {
    var rules = [
        {
            name: "identifier",
            regex: /([a-z]+)/
        },
        {
            name: "dot",
            regex: /\./
        }
    ];
    var tokeniser = new RegexTokeniser(rules);
    return tokeniser.tokenise(input);
};

