var node = require('./node');
var utils = require('../utils');
module.exports = function(DOM, expression, PARENT){
    expression = utils.formatExpression(expression);
    var DOMObject = new node(DOM, expression, PARENT);
    DOMObject.set = function(value){
        this.element.innerHTML = value;
    };
    DOM.removeAttribute('es-html');
    return DOMObject;
};