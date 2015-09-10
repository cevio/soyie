/**
 * 将一个节点下的标签表达式克隆到新的节点缓存副本
 * 节点缓存副本将替换源节点下所有文本节点
 * 返回含有标签表达式的实例化对象集合数组
 * @type {exports|module.exports}
 */
var utils = require('../utils');
var nodeParser = require('./text-node');

/**
 * 实现方法
 * @param <DOM> {HTMLELEMENT} 将被编译的节点
 * @type {Function}
 */
module.exports = function(DOM){
    var contentString = DOM.textContent;
    var cloneFrameElement = document.createDocumentFragment();
    var objects = [];

    contentString.split(utils.REGEXP_TAGSPILTOR).forEach(function(textSpace, index){
        var isTextNodeElement = index % 2 === 1;
        var expression = isTextNodeElement ? '{{' + textSpace + '}}' : textSpace;
        var cloneTextNode = document.createTextNode(expression);
        var express = textSpace.trim();
        if ( isTextNodeElement && express.length > 0 ){
            objects.push(new nodeParser(cloneTextNode, expression));
        }
        cloneFrameElement.appendChild(cloneTextNode);
    });

    DOM.parentNode.replaceChild(cloneFrameElement, DOM);

    return objects;
};