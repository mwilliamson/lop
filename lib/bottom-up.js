var rules = require("./rules");
var results = require("./parsing-results");

exports.parser = function(name, prefixRules, infixRules) {
    var prefixRule = rules.firstOf(name, prefixRules);
    
    function rule() {
        return applyRule;
    }
    
    function applyRule(tokens) {
        var leftResult = prefixRule(tokens);
        if (leftResult.isSuccess()) {
            return applyInfixRulesToLeftResult(leftResult);
        } else {
            return leftResult;
        }
    }
    
    function applyInfixRulesToLeftResult(leftResult) {
        var currentResult;
        while (true) {
            currentResult = applyInfixRulesToTokens(leftResult.remaining());
            if (currentResult.isSuccess()) {
                leftResult = results.success(
                    currentResult.value()(leftResult.value()),
                    currentResult.remaining(),
                    leftResult.source().to(currentResult.source())
                )
            } else if (currentResult.isFailure()) {
                return leftResult;
            } else {
                return currentResult;
            }
        }
    }
    
    function applyInfixRulesToTokens(tokens) {
        return rules.firstOf("infix", infixRules.map(function(infix) {
            return infix.rule;
        }))(tokens);
    }
    
    return {
        rule: rule
    };
};

exports.infix = function(name, rule) {
    return {
        name: name,
        rule: rule
    };
}
