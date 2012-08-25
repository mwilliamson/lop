# lop -- parsing library for JavaScript

## Tokens

When using a parser built with lop, the input is an array of tokens. A token can be any value so long as it has the property `source`, which must be a `StringSourceRange`. For instance, to create a simple tokeniser that generates a stream of words tokens separated by whitespace tokens:

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

lop also defines its own notion of a token. Each instance of `lop.Token` has a type, name, and source, similarly to most of the tokens that would be created by the token above. For instance, instead of:

    {
        type: "word",
        value: value,
        source: source
    }

you could use:

    new Token("word", value, source)

The main advantage of using `lop.Token` is that you can then use the rules `lop.token` and `lop.tokenOfType` (described later). If you don't use `lop.Token`, you must define your own atomic rules, but you can use the other rules without any modifications.

