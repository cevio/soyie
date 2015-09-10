var attrobject = require('./attr');
var utils = require('../utils');

var AttributeParser = module.exports = function(DOM, DEEP){
    var Attributes = [];
    utils.slice.call(DOM.attributes, 0).forEach(function(AttributeNode){
        var AttributeName = AttributeNode.nodeName;
        var AttributeValue = AttributeNode.nodeValue;
        if ( typeof AttributeParser.commands[AttributeName] === 'function' ){
            Attributes.push(AttributeParser.commands[AttributeName](DOM, AttributeValue, DEEP, AttributeNode));
        }else{
            if ( AttributeValue.split(utils.REGEXP_TAGSPILTOR).length > 1 ){
                Attributes.push(AttributeParser.createNormalAttributeFactory(DOM, AttributeValue, DEEP, AttributeNode));
            }
        }
    });
    return Attributes;
};

AttributeParser.createNormalAttributeFactory = function(DOM, expression, DEEP, AttributeNode){
    expression = utils.formatExpression(expression);
    return new attrobject(DOM, expression, DEEP, AttributeNode);
};

AttributeParser.commands = {
    "es-src": require('../commands/es-src'),
    "es-html": require('../commands/es-html'),
    "es-binding": require('../commands/es-binding'),
    "es-click": require('../commands/es-click')
};