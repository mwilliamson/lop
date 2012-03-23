var errors = require("../lib/errors");

exports.errorDescriptionIncludesLocationAndActualValueAndExpectedValue = function(test) {
    var error = errors.error({
        expected: "Nothing",
        actual: "Something",
        location: {
            describe: function() {
                return "Here"
            }
        }
    });
    test.equal("Here:\nExpected Nothing\nbut got Something", error.describe());
    test.done();
};