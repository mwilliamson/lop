var TokenIterator = require("../lib/TokenIterator");
var tokeniser = require("../lib/tokeniser");
var tokens = tokeniser.tokens;
var StringSource = require("../lib/StringSource");

exports.canCreateSourceRangeToIteratorBeyondEnd = function(test) {
    var source = function(startIndex, endIndex) {
        return new StringSource("blah").range(startIndex, endIndex);
    };
    var startIterator = new TokenIterator([
        tokens.identifier("blah", source(0, 4)),
        tokens.end(source(4, 4))
    ]);
    var endIterator = startIterator.slice(2);
    var range = startIterator.to(endIterator);
    test.deepEqual(source(0, 4), range);
    test.done();
};
