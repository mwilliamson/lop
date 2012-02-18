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
    var rule = rules.sequence(
        rules.symbol("!"),
        rules.keyword("true")
    );
    
    var result = parser.parseString(rule, "!true");
    
    testing.assertIsSuccessWithValue(test, result, ["!", "true"]);
    
    test.done();
};
