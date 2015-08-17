StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    use('JSON2', function () {
        
        //======================================================================================================================================================================================================================================================
        t.diag('Sanity')
        
        t.ok(JSON2, "JSON2 is here")
        
        
        //======================================================================================================================================================================================================================================================
        t.diag('Parse')
        
        
        t.ok(JSON2.parse('false') == false, 'Boolean value parsed ok #1')
        t.ok(JSON2.parse('true') == true, 'Boolean value parsed ok #2')
        
        t.ok(JSON2.parse('"yo"') == 'yo', 'String value parsed ok #1')
        
        
        t.ok(JSON2.parse('"y\\\\o"') == 'y\\o', 'String value parsed ok #2')
        t.ok(JSON2.parse('"\\"\\""') == '""', 'String value parsed ok #3')
        
        t.ok(JSON2.parse('"foo\\u000abar"') == 'foo\nbar', 'String value parsed ok #4')
        
        t.ok(JSON2.parse("2") === 2, 'Number value parsed ok #1')
        t.ok(JSON2.parse("4.5") === 4.5, 'Number value parsed ok #2')
        
        t.ok(JSON2.parse("null") === null, '`null` value parsed ok')
        
        
        //======================================================================================================================================================================================================================================================
        t.diag('Array')
        
        t.isDeeply(JSON2.parse('[]'), [], 'Empty array parsed ok')
        t.isDeeply(JSON2.parse('[1,2,3]'), [ 1, 2, 3 ], 'Array parsed ok')
        
        
        //======================================================================================================================================================================================================================================================
        t.diag('Nested array')
        
        t.isDeeply(JSON2.parse('[[],[]]'), [ [], [] ], 'Nested array parsed ok #1')
        t.isDeeply(JSON2.parse('[[1,2],[3]]'), [ [ 1, 2 ], [ 3 ] ], 'Nested array parsed ok #2')
    
        //======================================================================================================================================================================================================================================================
        t.diag('Objects')
        
        t.isDeeply(JSON2.parse('{}'), {}, 'Empty object parsed ok')
        t.isDeeply(JSON2.parse('{"foo":"bar","bar":["baz","zab"]}'), { foo : 'bar', bar : [ 'baz', 'zab' ] }, 'Object parsed ok')
        
        t.endAsync(async0)
        
        t.done()
    })
})    
