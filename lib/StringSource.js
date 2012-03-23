var StringSource = module.exports = function(string) {
    return {
        asString: function() {
            return string;
        },
        substring: function(startIndex, endIndex) {
            return StringSource.range(string, startIndex, endIndex);
        }
    };
};

StringSource.range = function(string, startIndex, endIndex) {
    return new StringSourceRange(string, startIndex, endIndex);
};

var StringSourceRange = function(string, startIndex, endIndex) {
    this.string = string;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
};

StringSourceRange.prototype.to = function(otherRange) {
    // TODO: Assert that tokens are the same across both iterators
    return new StringSourceRange(this.string, this.startIndex, otherRange.endIndex);
};
