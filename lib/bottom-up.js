var rules = require("./rules");
var results = require("./parsing-results");

exports.parser = function(name, prefixRules, infixRules) {
    infixRules = new InfixRules(infixRules);
    var prefixRule = rules.firstOf(name, prefixRules);
    
    function rule() {
        return createRule(infixRules);
    }
    
    function leftAssociative(name) {
        return createRule(infixRules.untilExclusive(name));
    }
    
    function rightAssociative(name) {
        return createRule(infixRules.untilInclusive(name));
    }
    
    function createRule(infixRules) {
        return apply.bind(null, infixRules);
    }
    
    function apply(infixRules, tokens) {
        var leftResult = prefixRule(tokens);
        if (leftResult.isSuccess()) {
            return infixRules.apply(leftResult);
        } else {
            return leftResult;
        }
    }
    
    return {
        rule: rule,
        leftAssociative: leftAssociative,
        rightAssociative: rightAssociative
    };
};

function InfixRules(infixRules) {
    function untilExclusive(name) {
        return new InfixRules(infixRules.slice(0, ruleNames().indexOf(name)));
    }
    
    function untilInclusive(name) {
        return new InfixRules(infixRules.slice(0, ruleNames().indexOf(name) + 1));
    }
    
    function ruleNames() {
        return infixRules.map(function(rule) {
            return rule.name;
        });
    }
    
    function apply(leftResult) {
        var currentResult;
        while (true) {
            currentResult = applyToTokens(leftResult.remaining());
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
    
    function applyToTokens(tokens) {
        return rules.firstOf("infix", infixRules.map(function(infix) {
            return infix.rule;
        }))(tokens);
    }
    
    return {
        apply: apply,
        untilExclusive: untilExclusive,
        untilInclusive: untilInclusive
    }
}

exports.infix = function(name, rule) {
    return {
        name: name,
        rule: rule
    };
}
