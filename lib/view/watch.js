/**
 * Created by evio on 15/7/24.
 */
var observe = require('./observe');
var REGEXP_STRING = /(["|']).+?\1/g;
var watch = module.exports = function(data, expressions, $repeatpools){
    observe(data, function(changeName, newValue, oldValue, routerPather){
        //console.log(changeName, newValue, oldValue, routerPather);
        expressions.forEach(function(DOM){
            if ( DOM.dependencies.indexOf(changeName) > -1 ){
                DOM.value = DOM.compile(newValue);
            }
        });
        $repeatpools.forEach(function(DOM){
            var zoom = routerPather + '-' + changeName;
            //console.log(DOM.dependencies, zoom)
            if ( DOM.dependencies.indexOf(zoom) > -1 ){
                DOM.value = newValue;
            }
        });
    });
};

watch.dependencies = function(expressions, tags){
    //console.log(expressions, tags);
    expressions.forEach(function(DOM){
        var compileExpression = DOM.expression.replace(REGEXP_STRING, '').trim();

        if ( /^\./.test(compileExpression) ){
            console.error('sytax error:' + DOM.expression);
            return;
        }

        compileExpression = 'return ' + compileExpression;
        tags = tags || [];

        tags.forEach(function(TAG){
            var NORMALREGEXP = new RegExp('[^\\.]\\b' + TAG.replace(/\./g, '\\.').replace(/\$/, '\\$') + '\\b');
            if ( NORMALREGEXP.test(compileExpression) ){
                DOM.dependencies.push(TAG);
            }
        });
    });
};