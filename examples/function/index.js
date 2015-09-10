/**
 * Created by evio on 15/9/8.
 */
var esprima = require('esprima');
var scope = {};
var foo = function($scope){
    var todo = this;
    todo.list = [
        {a:1,b:2}
    ]
};
var baz = 'var a = ' + foo.toString();
console.log(baz);
console.log(esprima.parse(baz));