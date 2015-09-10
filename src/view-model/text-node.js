/**
 * 单个标签表达式编译
 * 返回这个标签表达式对应的实例化对象
 * example: /examples/text-node/index.html
 */
var utils = require('../utils');
var datas = require('../data-model/data');

/**
 * 实例化对象
 * @param <cloneTextNode> {HTMLTEXTNODE} 被克隆的文本节点对象
 * @param <expression> {string} 表达式
 * @type {Class}
 */
var createTextNode = module.exports = function(cloneTextNode, expression){
    this.expression = utils.formatExpression(expression);
    this.element = cloneTextNode;
    this.dependencies = [];
    this.scope = new datas();

    Object.defineProperty(this, 'value', {
        set: function(value){ this.element.nodeValue = value; }
    });
};

/**
 * 渲染文本节点数据
 * 必须保证 scope 数据为最新
 * @returns {createTextNode}
 * @constructor
 */
createTextNode.prototype.render = function(){
    this.value = utils.transform(this.expression, this.scope.$alias ? this.scope : this.scope.$this);
    return this;
};

/**
 * 自动绑定本实例化对象的依赖关系
 * @returns {createTextNode}
 */
createTextNode.prototype.relation = function(){
    this.dependencies = this.scope.relation(this.expression) || [];
    return this;
};