var node = require('./node');
var utils = require('../utils');
var ScopeParent = require('../data-observer/scope-parent');

module.exports = function(DOM, expression, PARENT){
    var DOMObject = new node(DOM, expression, PARENT);
    DOMObject.foo = function(){};
    DOMObject.set = function(){
        this.foo = makeFunction(this.expression);
        return this.foo.toString();
    };
    DOMObject.get = function(){
        var fn = makeFunction(this.expression);
        return fn.toString();
    };
    DOMObject.element.addEventListener('click', function(){
        if ( typeof DOMObject.foo === 'function' ){
            var scope = DOMObject.gruntScope(ScopeParent.source || {});
            DOMObject.foo.call(this, scope);
        }
    }, false);
    DOM.removeAttribute('es-click');
    return DOMObject;
};

function makeFunction(expression){
    return new Function('scope', ';with(scope){\n' + expression + '\n};')
}