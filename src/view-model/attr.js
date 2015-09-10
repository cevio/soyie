var utils = require('../utils');
var nodeParser = require('./attr-node');

var AttributeParser = module.exports = function(DOM){
    var Attributes = [];
    utils.slice.call(DOM.attributes, 0).forEach(function(AttributeNode){
        var AttributeName = AttributeNode.nodeName;
        var AttributeValue = AttributeNode.nodeValue;
        if ( typeof AttributeParser.commands[AttributeName] === 'function' ){
            Attributes.push(AttributeParser.commands[AttributeName].call(DOM, AttributeValue));
        }else{
            if ( AttributeValue.split(utils.REGEXP_TAGSPILTOR).length > 1 ){
                Attributes.push(AttributeParser.createNormalAttributeFactory.call(AttributeNode, AttributeValue));
            }
        }
    });
    return Attributes;
};

AttributeParser.createNormalAttributeFactory = function(expression){
    expression = utils.formatExpression(expression);
    return new nodeParser(this, expression);
};

AttributeParser.commands = {
    "es-src": require('../commands/es-src'),
    "es-html": require('../commands/es-html'),
    "es-binding": require('../commands/es-binding'),
    "es-click": require('../commands/es-click')
};