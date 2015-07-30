/**
 * Created by evio on 15/7/24.
 */
var DOMBinding = require('../compiler/dom-binding');
var DOMRepeaty = require('../compiler/repeat/index');
var textNodeParser = require('../compiler/text-parser');
var attrNodeParser = require('../compiler/attr-parser');
var watchParser = require('./watch');
var taskWorker = require('./task');
var config = require('../config');
var slice = Array.prototype.slice;

var CONTROLLER = module.exports = function(){
    this.$expressions = [];
    this.$repeatpools = [];
    this.taskRender = new taskWorker();
    this.$scope = null;
};

CONTROLLER.prototype.search = function(node, $scope){
    var childs = slice.call(node.childNodes, 0);
    var that = this;

    node.removeAttribute(config.attr_controller)
    if ( !this.$scope ) this.$scope = $scope;
    childs.forEach(function( child ){
        var nodetype = child.nodeType;
        if ( 1 === nodetype ){
            var attr = child.getAttribute(config.attr_controller);
            var tagName = child.tagName.toLowerCase();
            if ( config.exceptTagNames.indexOf(tagName) == -1 ) {
                if ( !attr ){
                    var attr_binding = child.getAttribute(config.attr_binding);
                    var attr_repeaty = child.getAttribute(config.attr_repeat);
                    if ( attr_binding ){
                        child.removeAttribute(config.attr_binding);
                        var bindings = DOMBinding.call(child, attr_binding, $scope);
                        if ( bindings ) that.$expressions.push(bindings);
                    }
                    var attrObject = new attrNodeParser(child, $scope);
                    attrObject.search();
                    that.$expressions = that.$expressions.concat(attrObject.$expressions);
                    if ( attr_repeaty ){
                        var repeat = new DOMRepeaty($scope);
                        repeat.search(child);
                        that.$repeatpools = that.$repeatpools.concat(repeat.$expressions);
                    }else{
                        that.search(child, $scope);
                    }
                }
            }
        }
        else if ( 3 === nodetype ){
            var NODE = new textNodeParser(child, $scope);
            NODE.compile();
            that.$expressions = that.$expressions.concat(NODE.$expressions);
        }
    });

    this.$expressions.forEach(function(DOM){
       DOM.value = DOM.compile();
    });
};

CONTROLLER.prototype.fetchDependencies = function(data){
    watchParser.dependencies(this.$expressions, Object.keys(data));
};

CONTROLLER.prototype.watch = function(data){
    watchParser(data, this.$expressions, this.$repeatpools);
};

/**
 * use task.task
 * @returns {control}
 */
CONTROLLER.prototype.task = function(){
    this.taskRender.task.apply(this.taskRender, arguments);
    return this;
};

/**
 * task.tegistTask
 * @returns {control}
 */
CONTROLLER.prototype.registTask = function(){
    this.taskRender.registTask.apply(this.taskRender, arguments);
    return this;
};

/**
 * task.run
 * @returns {control}
 */
CONTROLLER.prototype.run = function(){
    var args = slice.call(arguments, 0);
    args.push(this.$scope);
    this.taskRender.run.apply(this.taskRender, args);
    return this;
};

/**
 * use action for common
 * @param fn
 */
CONTROLLER.prototype.action = function(fn) {
    typeof fn === 'function' && fn.call (this, this.$scope);
    return this;
};
