StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    use('JSON2', function () {
        
        //======================================================================================================================================================================================================================================================
        t.diag('Sanity')
        
        t.ok(JSON2, "JSON2 is here")
        
        
        //======================================================================================================================================================================================================================================================
        t.diag('Stringify')
        
        
        t.ok(JSON2.stringify(false) == 'false', 'Boolean value serialized ok #1')
        t.ok(JSON2.stringify(true) == 'true', 'Boolean value serialized ok #2')
        
        t.ok(JSON2.stringify('yo') == '"yo"', 'String value serialized ok #1')
        
        t.ok(JSON2.stringify('y\\o') == '"y\\\\o"', 'String value serialized ok #2')
        t.ok(JSON2.stringify('""') == '"\\"\\""', 'String value serialized ok #3')
        
        //                                         FF                                               Chrome
        t.ok(JSON2.stringify('foo\nbar') == '"foo\\u000abar"' || JSON2.stringify('foo\nbar') == '"foo\\nbar"', 'String value serialized ok #4')
        
        t.ok(JSON2.stringify(2)    === "2", 'Number value serialized ok #1')
        t.ok(JSON2.stringify(4.5)  === "4.5", 'Number value serialized ok #2')
        
        t.ok(JSON2.stringify(null)  === "null", '`null` value serialized ok')
        
        
        //======================================================================================================================================================================================================================================================
        t.diag('Array')
        
        t.ok(JSON2.stringify([]) == '[]', 'Empty array serialized ok')
        t.ok(JSON2.stringify([ 1, 2, 3 ]) == '[1,2,3]', 'Array serialized ok')
        
        
        //======================================================================================================================================================================================================================================================
        t.diag('Nested array')
        
        t.ok(JSON2.stringify([ [], [] ]) == '[[],[]]', 'Nested array serialized ok #1')
        t.ok(JSON2.stringify([ [ 1, 2 ], [ 3 ] ]) == '[[1,2],[3]]', 'Nested array serialized ok #2')
    
        //======================================================================================================================================================================================================================================================
        t.diag('Objects')
        
        t.ok(JSON2.stringify({}) == '{}', 'Empty object serialized ok')
        t.ok(JSON2.stringify({ foo : 'bar', bar : [ 'baz', 'zab' ]}) == '{"foo":"bar","bar":["baz","zab"]}', 'Object serialized ok')
        
        t.ok(JSON2.stringify({ a : undefined }) == '{}', '"Undefined" entry excluded')
        
        
        t.endAsync(async0)
        
        t.done()
    })
})    
