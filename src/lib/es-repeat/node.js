/**
 * Created by evio on 15/8/10.
 */
var attrNodeParser = require('../attr-node/index');
var textNodeParser = require('../text-node/index');
var dataParser = require('./compileData');
var utils = require('../utils');
var config = require('../config');
var node = module.exports = function(DOM){
    this.element = DOM;
    this.scope = new dataParser();
    this.pools = [];
    this.namespace = 'REPEATSINGLE';
};

node.prototype.find = function(DOM, callback){
    var childNodes = utils.slice.call(DOM.childNodes, 0);
    var that = this;
    that.pools = that.pools.concat(that.parseAttributes(DOM, that.scope.$path));
    childNodes.forEach(function(child){
        var nodeType = child.nodeType;
        if ( nodeType === 1 ){
            var attributeName = child.getAttribute('es-repeat');
            var tagName = child.tagName.toLowerCase();
            if ( config.exceptTagNames.indexOf(tagName) == -1 ) {
                that.pools = that.pools.concat(that.parseAttributes(child, that.scope.$path));
                if ( !attributeName ){
                    that.find(child, callback);
                }else{
                    typeof callback === 'function' && callback.call(child);
                }
            }
        }
        else if ( nodeType === 3 ){
            that.pools = that.pools.concat(textNodeParser(child, that.scope, that.scope.$path));
        }
    });
};

node.prototype.parseAttributes = function(DOM, PATH){
    var attributes = utils.slice.call(DOM.attributes, 0);
    var pools = [];
    for ( var i = 0 ; i < attributes.length ; i++ ){
        var retNodeCollection = attrNodeParser(attributes[i], this.scope, DOM, PATH);
        if ( retNodeCollection ){
            pools.push(retNodeCollection);
        }
    }
    return pools;
};