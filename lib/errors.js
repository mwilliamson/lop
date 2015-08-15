exports.error = function(options) {
    return new Error(options);
};

var Error = function(options) {
    this.expected = options.expected;
    this.actual = options.actual;
    this._location = options.location;
};

Error.prototype.describe = function() {
    var locationDescription = this._location ? this._location.describe() + ":\n" : "";
    return locationDescription + "Expected " + this.expected + "\nbut got " + this.actual;
};
