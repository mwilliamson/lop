var StringIterator = module.exports = function(string, source, startIndex) {
    var index = startIndex || 0;
    var self = {
        _index: function() {
            return index;
        },
        copy: function() {
            return StringIterator(string, source, index);
        },
        rangeTo: function(end) {
            return source.substring(index, end._index());
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
