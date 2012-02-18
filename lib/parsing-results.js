module.exports = {
    failure: function(errors, remaining) {
        if (errors.length < 1) {
            throw new Error("Failure must have errors");
        }
        return new Result({
            isSuccess: false,
            remaining: remaining,
            errors: errors
        });
    },
    success: function(value, remaining, source) {
        return new Result({
            isSuccess: true,
            value: value,
            source: source,
            remaining: remaining,
            errors: []
        });
    }
};

var Result = function(options) {
    this._value = options.value;
    this._isSuccess = options.isSuccess;
    this._hasValue = options.value !== undefined;
    this._remaining = options.remaining;
    this._source = options.source;
    this._errors = options.errors;
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

Result.prototype.errors = function() {
    return this._errors;
};
