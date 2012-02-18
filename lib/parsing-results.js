module.exports = {
    failure: function(remaining) {
        return new Result({
            isSuccess: false,
            remaining: remaining
        });
    },
    success: function(value, remaining, source) {
        return new Result({
            isSuccess: true,
            value: value,
            source: source,
            remaining: remaining
        });
    }
};

var Result = function(options) {
    this._value = options.value;
    this._isSuccess = options.isSuccess;
    this._hasValue = options.value !== undefined;
    this._remaining = options.remaining;
    this._source = options.source;
};

Result.prototype.map = function(func) {
    if (this._hasValue) {
        return new Result({
            value: func(this._value),
            isSuccess: this._isSuccess,
            remaining: this._remaining,
            source: this._source
        });
    } else {
        return this;
    }
};

Result.prototype.isSuccess = function() {
    return this._isSuccess;
};

Result.prototype.value = function() {
    return this._value;
};

Result.prototype.remaining = function() {
    return this._remaining;
};

Result.prototype.source = function() {
    return this._source;
};
