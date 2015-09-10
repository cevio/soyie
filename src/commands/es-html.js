var node = require('./node');
var utils = require('../utils');
module.exports = function(DOM, expression, DEEP){
    expression = utils.formatExpression(expression);
    var DOMObject = new node(DOM, expression, DEEP);
    DOMObject.set = function(value){
        this.element.innerHTML = value;
    };
    DOM.removeAttribute('es-html');
    return DOMObject;
};