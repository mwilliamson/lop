# lop -- parsing library for JavaScript

## Tokens

When using a parser built with lop, the input is an array of tokens. A token can be any value so long as it has the property `source`, which must be a `StringSourceRange`. For instance, to create a simple tokeniser that generates a stream of words tokens separated by whitespace tokens:

```javascript
var StringSource = require("lop").StringSource;

function tokenise(source) {
    var whitespaceRegex = /(\s+)/g;
    var result;
    var start = 0;
    
    var stringSource = new StringSource(source, "raw string");
    var parts = [];
    
    while ((result = whitespaceRegex.exec(source)) !== null) {
        parts.push({
            type: "word",
            value: source.substring(start, result.index),
            source: stringSource.range(start, result.index)
        });
        parts.push({
            type: "whitespace",
            value: result[1],
            source: stringSource.range(result.index, whitespaceRegex.lastIndex)
        });
        start = whitespaceRegex.lastIndex;
    }
    parts.push({
        type: "word",
        value: source.substring(start),
        source: stringSource.range(start, source.length)
    });
    parts.push({
        type: "end",
        source: stringSource.range(source.length, source.length)
    });
    return parts.filter(function(part) {
        return part.type !== "word" || part.value !== "";
    });
}
```

lop also defines its own notion of a token. Each instance of `lop.Token` has a type, name, and source, similarly to most of the tokens that would be created by the token above. For instance, instead of:

    {
        type: "word",
        value: value,
        source: source
    }

you could use:

    new Token("word", value, source)

The main advantage of using `lop.Token` is that you can then use the rules `lop.rules.token` and `lop.rules.tokenOfType` (described later). If you don't use `lop.Token`, you must define your own atomic rules, but you can use the other rules without any modifications.

## Parser

To parse an array of tokens, you can call the method `parseTokens` on `lop.Parser`, passing in the parsing rule and the array of tokens. For instance, assuming we already have a `tokenise` function (the one above would do fine):

```javascript
function parseSentence(inputString) {
    var tokens = tokenise(inputString);
    var parser = new lop.Parser();
    parser.parseTokens(sentenceRule, tokens);
    if (!parseResult.isSuccess()) {
        throw new Error("Failed to parse: " + describeFailure(parseResult));
    }
    return parseResult.value();
}

function describeFailure(parseResult) {
    return parseResult.errors().map(describeError).join("\n"));
   
    function describeError(error) {
        return error.describe();
    }
}
```

The result of parsing can be success, failure, or error. While failure indicates
that the rule didn't match the input tokens, error indicates that the input
was invalid in some way. In general, rules will backtrack when they
encounter a failure, but will completely abort when they encounter an error.
Each of these results has a number of methods:

```javascript
    result.isSuccess() // true for success, false otherwise
    result.isFailure() // true for failure, false otherwise
    result.isError() // true for error, false otherwise
    result.value() // if success, the value that was parsed
    result.remaining() // if success, the tokens that weren't consumed by parsing
    result.source() // the StringSourceRange containing the consumed tokens
    result.errors() // if failure or error, an array of descriptions of the failure/error
```

The final question is then: how do we define rules for the parser, such as the currently undefined `sentenceRule`?

## Rules

Each rule in lop accepts an iterator over tokens, and returns a result, as
described in the previous section.
