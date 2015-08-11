var node = require('./node');
var config = require('../config');
var utils = require('../utils');

module.exports = createTextNodeParser;

function createTextNodeParser(DOM, SCOPE, path){
    var contentString = DOM.textContent;
    var cloneFrameElement = document.createDocumentFragment();
    var pools = [];

    /*
     * use split method to split tags.
     * TODO FIXED: {{{aaa}}.split(REGEXP_TAGSPILTOR);
     */
    contentString.split(utils.REGEXP_TAGSPILTOR).forEach(function(textSpace, index){
        var isTextNodeElement = index % 2 === 1;
        var replaceText = isTextNodeElement
            ? ( config.defaultExpressionValue ? config.defaultExpressionValue : '{{' + textSpace + '}}' )
            : textSpace;
        var cloneTextNode = document.createTextNode(replaceText);
        var trimContent = textSpace.trim();
        if ( isTextNodeElement && trimContent.length > 0 ){
            var DOMOBJECT = createTransformParser(cloneTextNode, trimContent, path);
            if ( SCOPE ){
                DOMOBJECT.value = DOMOBJECT.compile(SCOPE);
            }
            pools.push(DOMOBJECT);
        }
        cloneFrameElement.appendChild(cloneTextNode);
    });

    DOM.parentNode.replaceChild(cloneFrameElement, DOM);

    return pools;
}

function createTransformParser(DOM, expression, path){
    var DOMObject = new node(DOM);
    DOMObject.expression = expression;
    DOMObject.scopePath = path;
    DOMObject.listen();
    return DOMObject;
}