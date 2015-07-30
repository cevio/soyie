/**
 * Created by evio on 15/7/24.
 */
var config = require('../config');
var utils = require('../utils');
var REGEXP_TAGSPILTOR = /\{\{([^\}\}]+)\}\}/g;

var textParser = module.exports = function(textNode, $scope){
    this.$expressions = [];
    this.$node = textNode;
    this.$scope = $scope;
};

textParser.prototype.compile = function(callback){
    var textContentString = this.$node.textContent;
    var cloneFrameElement = document.createDocumentFragment();
    var that = this;

    textContentString.split(REGEXP_TAGSPILTOR)
        .forEach(function(piece, index){
            piece = piece.trim();
            var isTextNodeElement = index % 2 === 1;
            var replaceText = isTextNodeElement
                ? ( config.defaultExpressionValue ? config.defaultExpressionValue : '{{' + piece + '}}' )
                : piece;
            var cloneTextNode = document.createTextNode(replaceText);
            isTextNodeElement && that.transform(cloneTextNode, piece, callback);
            cloneFrameElement.appendChild(cloneTextNode);
        });

    this.$node.parentNode.replaceChild(cloneFrameElement, this.$node);
};

textParser.prototype.transform = function(node, text, callback){
    var that = this;

    node.expression = text;
    node.dependencies = [];
    node.compile = function(){
        return utils.transform(text, that.$scope);
    };

    typeof callback === 'function' && callback.call(node, this.$scope);

    Object.defineProperty(node, 'value', {
        get: function(){ return this.nodeValue; },
        set: function(value){ this.nodeValue = value; }
    });

    this.$expressions.push(node);
};