/**
 * Created by evio on 15/7/28.
 */
var utils = require('../utils');
var config = require('../config');

module.exports = function(attrNode, node, value, scope, callback){
    attrNode.expression = value;
    attrNode.dependencies = [];
    attrNode.compile = function(){
        return utils.transform(value, scope);
    };

    Object.defineProperty(attrNode, 'value', {
        get: function(){ return this.nodeValue; },
        set: function(xvalue){
            this.nodeValue = xvalue;
            node.src = xvalue;
        }
    });

    if ( typeof callback === 'function' ){
        callback.call(attrNode, scope);
        attrNode.value = attrNode.compile();
    }

    this.$expressions.push(attrNode);
};