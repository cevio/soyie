/**
 * 创建数组循环块状对象
 * 所有数组操作方法基于这个对象
 * 这个对象将被返回到全局VM的对象池中
 * @type {exports|module.exports}
 */
var utils = require('../utils');
var datas = require('../data-model/data');
var repeatNodeParser = require('./repeat-node');
var EventEmitter = require('events').EventEmitter;

/**
 * 具体的实例化块状对象
 * @type {Function}
 */
var createRepeatBlockParser = module.exports = function(DOM){
    this.element = DOM;                                 // 原始节点
    this.alias = null;                                  // 别名
    this.realy = null;                                  // 真名
    this.template = null;                               // 模板对象
    this.parentNode = null;                             // 父节点对象
    this.commentStartNode = null;                       // 块状包裹区域开始的注释对象
    this.commentEndNode = null;                         // 块状包裹区域结束的注释对象
    this.fragment = document.createDocumentFragment();  // 缓冲区
    this.scope = new datas();                           // 数据路由对象
    this.scope.$this = [];
    this.alone = true;
    this.objects = [];
    this.namespace = 'repeat-block';
};

/**
 * 添加事件对象
 * 并且混淆
 */
utils.mixin(createRepeatBlockParser.prototype, EventEmitter.prototype);

/**
 * 循环区域初始化结构方法
 * @returns {createRepeatBlockParser}
 */
createRepeatBlockParser.prototype.prepare = function(){
    this.getCommandInVars();
    var cloneNodeElement = this.element.cloneNode(true);
    var parentNodeDom = this.element.parentNode;
    this.template = cloneNodeElement;
    this.parentNode = parentNodeDom;
    this.commentStartNode = document.createComment('Repeat Start');
    this.commentEndNode = document.createComment('Repeat End');
    this.fragment.appendChild(this.commentStartNode);
    this.fragment.appendChild(this.commentEndNode);
    this.parentNode.replaceChild(this.fragment, this.element);
    return this;
};

/**
 * 分析循环中对应的别名与真名方法
 * 如果不存在别名，那么即使用$this作为别名
 * @returns {createRepeatBlockParser}
 */
createRepeatBlockParser.prototype.getCommandInVars = function(){
    var expression = this.element.getAttribute('es-repeat').trim();
    var expressExec = utils.REGEXP_COMMAND_IN.exec(expression);

    if ( !expressExec ){
        expression = '$this in ' + expression;
        expressExec = utils.REGEXP_COMMAND_IN.exec(expression);
    }

    this.alias = expressExec[1];
    this.realy = expressExec[2];
    this.element.removeAttribute('es-repeat');

    return this;
};

createRepeatBlockParser.prototype.getData = function(){
    return utils.transform(this.realy, this.scope.$parent);
};

createRepeatBlockParser.prototype.create = function(){
    var node = new repeatNodeParser();
    node.element = this.template.cloneNode(true);
    return node;
};

createRepeatBlockParser.prototype.append = function(){
    var node = this.create();
    this.commentEndNode.parentNode.insertBefore(node.element, this.commentEndNode);
    return node;
};
createRepeatBlockParser.prototype.$append = function(data){
    var length = this.scope.$this.length;
    var node = this.append();
    this.scope.$this.push(data);
    node.parent = this;
    node.blockConstructor = createRepeatBlockParser;
    node.scope.$this = data;
    node.scope.$parent = this.scope.$parent;
    node.scope.$path = this.scope.$path + '-' + length;
    node.scope.$index = length;
    node.scope.alias = this.alias;
    node.scope.$realy = this.realy;
    node.prepare();
    node.render();
    node.relation();
    this.objects.push(node);
    return node;
};

createRepeatBlockParser.prototype.$remove = function(pather, callback){
    var that = this;
    if ( !isNaN(pather) ){
        pather = this.scope.$path + pather;
    }

    this.objects.forEach(function(object, index){
        if ( object.scope.$path === pather ){
            if ( that.objects[index + 1] ){
                that.objects.slice(index + 1).forEach(function(obj){
                    obj.scope.$index--;
                    obj.scope.$path = obj.parent.scope.$path + '-' + obj.scope.$index;
                    obj.render(true);
                    obj.relation();
                    typeof callback === 'function' && callback(obj);
                });
            }
            object.element.parentNode.removeChild(object.element);
            that.objects.splice(index, 1);
        }
    });
};