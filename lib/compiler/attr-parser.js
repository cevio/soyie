/**
 * Created by evio on 15/7/28.
 */
var utils = require('../utils');
var cmd = require('../command/index');
var REGEXP_ATTR = /\{\{([^\}\}]+)\}\}/;
var AttributeConstructor = module.exports = function(node, scope){
    this.$node = node;
    this.$scope = scope;
    this.$expressions = [];
};

AttributeConstructor.prototype.search = function(callback){
    var attrs = this.$node.attributes;
    var that = this;
    for ( var i = 0 ; i < attrs.length ; i++ ){
        var attrNode = attrs[i];
        var attrName = attrNode.nodeName;
        var attrValue = attrNode.nodeValue;
        if ( cmd[attrName] ){
            cmd[attrName].call(this, attrNode, this.$node, attrValue, this.$scope, callback);
        }else{
            var matcher = REGEXP_ATTR.exec(attrValue);
            if ( matcher ){
                var expression = matcher[1];
                attrNode.expression = expression;
                attrNode.dependencies = [];
                attrNode.compile = function(){
                    return utils.transform(expression, that.$scope);
                };
                typeof callback === 'function' && callback.call(this.$node, this.$scope);
                Object.defineProperty(attrNode, 'value', {
                    get: function(){ return this.nodeValue; },
                    set: function(value){ this.nodeValue = value; }
                });
                attrNode.value = attrNode.compile();
                this.$expressions.push(attrNode);
            }
        }
    }
};