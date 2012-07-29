var rules = require("./rules");

exports.parser = function(name, prefixRules, infixRules) {
    function rule() {
        return rules.firstOf(name, prefixRules);
    }
    
    return {
        rule: rule
    };
};
