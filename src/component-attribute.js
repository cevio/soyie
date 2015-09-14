var utils = require('./utils');
var node = module.exports = function(expression, PARENT){
    this.expression = expression;
    this.oldValue = null;
    this.parent = PARENT;
};

node.prototype.getScope = function(source){
    var scope = utils.get(this.parent.deep.locals, source);
    var _scope = utils.value(this.expression, scope);
    return _scope;
};