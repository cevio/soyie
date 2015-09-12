var node = require('./node');
var utils = require('../utils');
var ScopeParent = require('../data-observer/scope-parent');

module.exports = function(DOM, expression, PARENT){
    var gate = expression.indexOf(':');
    var method = expression.substring(0, gate);
    var express = expression.substring(gate + 1).trim();
    var DOMObject = new node(DOM, express, PARENT);
    DOMObject.method = method;
    DOMObject.foo = function(){};
    DOMObject.set = function(){
        this.foo = utils.makeFunction(this.expression);
        return this.foo.toString();
    };
    DOMObject.get = function(){
        var fn = utils.makeFunction(this.expression);
        return fn.toString();
    };
    DOMObject.element.addEventListener(DOMObject.method, function(){
        if ( typeof DOMObject.foo === 'function' ){
            var scope = DOMObject.gruntScope(ScopeParent.source || {});
            var result = DOMObject.foo.call(this, scope);
            if ( typeof result === 'function' ){
                result();
            }
        }
    }, false);
    try{DOM.removeAttribute('es-on');}catch(e){}
    return DOMObject;
};