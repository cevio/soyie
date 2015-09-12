var attrobject = require('./attr');
var utils = require('../utils');

var AttributeParser = module.exports = function(DOM, PARENT){
    var Attributes = [];
    utils.slice.call(DOM.attributes, 0).forEach(function(AttributeNode){
        var AttributeName = AttributeNode.nodeName;
        var AttributeValue = AttributeNode.nodeValue;
        if ( typeof AttributeParser.commands[AttributeName] === 'function' ){
            Attributes.push(AttributeParser.commands[AttributeName](DOM, AttributeValue, PARENT, AttributeNode));
        }else{
            if ( AttributeValue.split(utils.REGEXP_TAGSPILTOR).length > 1 ){
                Attributes.push(AttributeParser.createNormalAttributeFactory(DOM, AttributeValue, PARENT, AttributeNode));
            }
        }
    });
    return Attributes;
};

AttributeParser.createNormalAttributeFactory = function(DOM, expression, PARENT, AttributeNode){
    expression = utils.formatExpression(expression);
    return new attrobject(DOM, expression, PARENT, AttributeNode);
};

AttributeParser.commands = {
    "es-src": require('../commands/es-src'),
    "es-html": require('../commands/es-html'),
    "es-binding": require('../commands/es-binding'),
    "es-on": require('../commands/es-on'),
    "es-click": require('../commands/es-click')
};