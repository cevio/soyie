var utils = require('../utils');
var datas = require('../data-model/data');

var createAttributeParser = module.exports = function(AttributeNode, expression){
    this.element = AttributeNode;
    this.expression = expression;
    this.dependencies = [];
    this.scope = new datas();

    Object.defineProperty(this, 'value', {
        set: function(value){ this.element.nodeValue = value; }
    });
};

createAttributeParser.prototype.render = function(){
    this.value = utils.transform(this.expression, this.scope.$alias ? this.scope : this.scope.$this);
    return this;
};

createAttributeParser.prototype.relation = function(){
    this.dependencies = this.scope.relation(this.expression) || [];
    return this;
};