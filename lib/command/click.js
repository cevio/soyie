/**
 * Created by evio on 15/7/28.
 */
var utils = require('../utils');
var DOM = require('../compiler/dom-event');

module.exports = function(attrNode, node, value, scope, callback){
    attrNode.expression = value;
    attrNode.dependencies = [];
    attrNode.compile = function(){
        return new Function('scope', ';with(scope){\n' + value + '\n};');
    };
    attrNode.callback = null;
    Object.defineProperty(attrNode, 'value', {
        get: function(){ return this.callback; },
        set: function(x){ this.callback = x; }
    });
    DOM(node).on('click', function(){
        attrNode.value.call(node, scope);
    });

    if ( typeof callback === 'function' ){
        callback.call(attrNode, scope);
        attrNode.value = attrNode.compile();
    }

    this.$expressions.push(attrNode);
};