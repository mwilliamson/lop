var StringSource = require("../lib/StringSource");

exports.stringSourceRangeDescriptionIncludesLineAndCharacterNumber = function(test) {
    test.equal("Line number: 1\nCharacter number: 3", StringSource.range("blah", 2, 3).describe());
    test.equal("Line number: 3\nCharacter number: 5", StringSource.range("one\ntwo\nthree\nfour", 12, 15).describe());
    test.done();
};
