var ON = require('./es-on');
module.exports = function(DOM, expression, PARENT){
    expression = 'click: ' + expression;
    var object = ON(DOM, expression, PARENT);
    DOM.removeAttribute('es-click');
    return object;
};