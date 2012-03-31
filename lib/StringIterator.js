var StringIterator = module.exports = function(source, string, startIndex) {
    string = string || source.asString();
    var index = startIndex || 0;
    var self = {
        _index: function() {
            return index;
        },
        copy: function() {
            return StringIterator(source, string, index);
        },
        rangeTo: function(end) {
            return source.range(index, end._index());
        },
        next: function() {
            if (self.isAtEnd()) {
                throw new Error("No more characters");
            } else {
                return string.charAt(index++);
            }
        },
        peek: function() {
            return string.charAt(index);
        },
        peekString: function(length) {
            return string.substring(index, index + length);
        },
        isAtEnd: function() {
            return index >= string.length;
        },
        takeWhile: function(condition) {
            var startIndex = index;
            while (condition(self) && !self.isAtEnd()) {
                index += 1;
            }
            return string.substring(startIndex, index);
        }
    };
    return self;
};
