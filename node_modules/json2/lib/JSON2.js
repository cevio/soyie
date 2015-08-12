Class('JSON2', {
    
    /*PKGVERSION*/VERSION : 0.04,
    
    use : {
        token       : 'JSON2/static/json2.js',
        presence    : 'JSON'
    },
    
    
    my : {
        
        methods : {
            
            parse : function () {
                return JSON.parse.apply(JSON, arguments)
            },
            
            
            stringify : function () {
                return JSON.stringify.apply(JSON, arguments)
            }
        }
    }
})