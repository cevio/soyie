var utils = require('../utils');
var config = require('../config');
var textNodeParser = require('../text-node/index');
var attrNodeParser = require('../attr-node/index');
var repeatNodeParser = require('../es-repeat/index');
var observe = require('./observe');
var taskWorker = require('./task');
var EventEmitter = require('events').EventEmitter;
var VM = module.exports = function(DOM, scope){
    this.element = DOM;
    this.scope = scope || {};
    this.pools = [];
    this.taskRender = new taskWorker();
    this.changes = {};
    utils.mixin(this, EventEmitter.prototype);
};

VM.prototype.find = function(node){
    node = node || this.element;
    var childs = utils.slice.call(node.childNodes, 0);
    var that = this;
    node.removeAttribute('es-controller');
    childs.forEach(function(child){
        var nodeType = child.nodeType;
        if ( 1 === nodeType ){
            var attributeName = child.getAttribute('es-controller');
            var tagName = child.tagName.toLowerCase();
            if ( config.exceptTagNames.indexOf(tagName) == -1 ) {
                if ( !attributeName ){
                    var hasRepeat = child.hasAttribute('es-repeat');
                    if ( !hasRepeat ){
                        that.pools = that.pools.concat(that.parseAttributes(child));
                        that.find(child);
                    }
                    else{
                        that.pools = that.pools.concat(repeatNodeParser(that.scope, child));
                    }
                }
            }
        }
        else if ( 3 === nodeType ){
            that.pools = that.pools.concat(textNodeParser(child, that.scope));
        }
    });
    return this;
};

VM.prototype.parseAttributes = function(DOM){
    var attributes = DOM.attributes;
    var pools = [];
    for ( var i = 0 ; i < attributes.length ; i++ ){
        var retNodeCollection = attrNodeParser(attributes[i], this.scope, DOM);
        if ( retNodeCollection ){
            pools.push(retNodeCollection);
        }
    }
    return pools;
};

VM.prototype.dependencies = function(){
    var that = this;
    this.pools.forEach(function(pool){
        Object.keys(that.scope).forEach(function(key){
            if ( pool.namespace === 'REAPEATBLOCK' ){
                pool.relation();
            }else{
                pool.relation(key);
            }
        });
    });
    return this;
};

/**
 * database to view
 * watch data changing.
 */
VM.prototype.watch = function(property){
    var that = this;
    this.dependencies();
    if ( !property ){
        observe(this.scope, function(changeName, newValue, oldValue, routerPather){
            utils.miss(function(){ that.emit('change', that.scope, changeName, newValue, oldValue, routerPather); });
            var zoom = routerPather + '-' + changeName;
            var poolCatches = [];
            that.pools.forEach(function(pool){
                if ( pool.namespace === 'REAPEATBLOCK' ){
                    pool.pools.forEach(function(p){
                        //console.log(p.scopePath)
                        if ( p.dependencies.indexOf(zoom) > -1 ){
                            p.value = p.compile(p.scope);
                            poolCatches.push(p);
                        }
                    });
                }else{
                    if ( pool.dependencies.indexOf(zoom) > -1 ){
                        pool.value = pool.compile(pool.scope);
                        poolCatches.push(pool);
                    }
                }
            });
            if ( that.changes && that.changes[zoom] ){
                that.changes[zoom].forEach(function(callback){
                    callback(newValue, oldValue, poolCatches);
                });
            }
        });
    }
    else{
        this.scope.$observer.watch(this.scope, property);
    }
    return this;
};

/**
 * use task.task
 * @returns {control}
 */
VM.prototype.task = function(){
    this.taskRender.task.apply(this.taskRender, arguments);
    return this;
};

/**
 * task.tegistTask
 * @returns {control}
 */
VM.prototype.registTask = function(){
    this.taskRender.registTask.apply(this.taskRender, arguments);
    return this;
};

/**
 * task.run
 * @returns {control}
 */
VM.prototype.run = function(){
    var args = utils.slice.call(arguments, 0);
    args.push(this.scope);
    this.taskRender.run.apply(this.taskRender, args);
    return this;
};

/**
 * use action for common
 * @param fn
 */
VM.prototype.action = function(fn) {
    typeof fn === 'function' && fn.call(this, this.scope);
    return this;
};

VM.prototype.property = function(name, fn){
    var scope = this.scope[name];
    if ( scope !== undefined ){
        var key = '#-' + name;
        if ( !this.changes[key] ){ this.changes[key] = []; }
        this.changes[key].push(fn);
    }else{
        console.error('can not find the name of ' + name);
    }
    return this;
};