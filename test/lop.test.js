var lop = require("../");
var Parser = lop.Parser;
var rules = lop.rules;
var testing = lop.testing;

exports.canParseUsingParser = function(test) {
    var keywords = ["true", "false"];
    var symbols = ["(", ")", "!"];
    var options = {
        keywords: keywords,
        symbols: symbols
    };
    var parser = new Parser(options);
    var name = rules.capture(rules.identifier(), "name");
    var rule = rules.sequence(
        rules.symbol("!"),
        name
    );
    
    var result = parser.parseString(rule, "!blah");
    
    testing.assertIsSuccessWithValue(test, result, {name: "blah"});
    
    test.done();
};
