var util = require("util");

var StringSource = module.exports = function(string) {
    return {
        asString: function() {
            return string;
        },
        range: function(startIndex, endIndex) {
            return new StringSourceRange(string, startIndex, endIndex);
        }
    };
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

StringSourceRange.prototype.describe = function() {
    var self = this;
    var index = 0;
    var nextNewLine = function() {
        return self.string.indexOf("\n", index);
    };
    
    var lineNumber = 1;
    while (nextNewLine() !== -1 && nextNewLine() < this.startIndex) {
        index = nextNewLine() + 1;
        lineNumber += 1;
    }
    var characterNumber = this.startIndex - index + 1;
    return util.format("Line number: %s\nCharacter number: %s", lineNumber, characterNumber);
};
