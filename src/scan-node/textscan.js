var textobject = require('./text');
var utils = require('../utils');

var text = module.exports = function(DOM, PARENT){
    var contentString = DOM.textContent;
    var cloneFrameElement = document.createDocumentFragment();
    var objects = [];

    contentString.split(utils.REGEXP_TAGSPILTOR).forEach(function(textSpace, index){
        var isTextNodeElement = index % 2 === 1;
        var nodeText = isTextNodeElement ? utils.configs.defaultText : textSpace;
        var cloneTextNode = document.createTextNode(nodeText);
        var expression = textSpace.trim();
        if ( isTextNodeElement && expression.length > 0 ){
            objects.push(new textobject(cloneTextNode, expression, PARENT));
        }
        cloneFrameElement.appendChild(cloneTextNode);
    });

    DOM.parentNode.replaceChild(cloneFrameElement, DOM);

    return objects;
};