var tokeniser = require("./tokeniser");

var TokenIterator = module.exports = function(tokens, startIndex) {
    this._tokens = tokens;
    this._startIndex = startIndex || 0;
};

TokenIterator.prototype.get = function(index) {
    return this._tokens[this._startIndex + index];
};

TokenIterator.prototype.toArray = function() {
    return this._tokens.slice(this._startIndex);
};

TokenIterator.prototype.slice = function(startIndex) {
    return new TokenIterator(this._tokens, this._startIndex + startIndex);
};

TokenIterator.prototype.to = function(end) {
    // TODO: Assert that tokens are the same across both iterators
    var string = this._tokens[0].source.string;
    var endToken = end._tokens[end._startIndex] || end._tokens[end._tokens.length - 1];
    return tokeniser.stringSource(
        string,
        this._tokens[this._startIndex].source.startIndex,
        endToken.source.endIndex
    );
};
