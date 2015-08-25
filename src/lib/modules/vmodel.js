var utils = require('../utils');
var config = require('../config');
var textNodeParser = require('../text-node/index');
var attrNodeParser = require('../attr-node/index');
var repeatNodeParser = require('../es-repeat/index');
var observe = require('./observe');
var taskWorker = require('./task');
var EventEmitter = require('events').EventEmitter;
var differ = require('./data-diff');

var VM = module.exports = function(DOM, scope){
    this.element = DOM;
    this.scope = scope || {};
    this.pools = [];
    this.taskRender = new taskWorker();
    this.changes = {};
};

utils.mixin(VM.prototype, EventEmitter.prototype);

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

VM.prototype.map = function(object, callback){
    var that = this;
    if ( object.pools ){
        object.pools.forEach(function(obj){
            if ( obj.namespace === 'REAPEATBLOCK' ){
                that.eachRepeat(obj, callback);
            }else{
                that.map(obj, callback);
            }
        });
    }else{
        typeof callback === 'function' && callback(object);
    }
};

/**
 * 重置依赖关系
 * @returns {exports}
 */
VM.prototype.reset = function(){
    this.map(this, function(obj){
        if ( obj.dependencies ){
            obj.dependencies = [];
        }
    });
    this.dependencies();
    return this;
};

/**
 * 写入每个碎片的依赖关系
 * @param scopes
 * @param selector
 * @returns {exports}
 */
VM.prototype.dependencies = function(scopes, selector){
    var that = this;
    if ( !scopes ){
        scopes = that.scope;
        selector = '';
    }
    this.pools.forEach(function(pool){
        Object.keys(scopes).forEach(function(key){
            var val = scopes[key];
            if ( pool.namespace === 'REAPEATBLOCK' ){
                gruntRepeatDeps(pool);
            }else{
                pool.relation(selector + key);
            }

            if ( utils.type(val, 'Object') ){
                that.dependencies(val, selector + key + '.');
            }
        });
    });
    return this;
};

/**
 * database to view
 * watch data changing.
 */
VM.prototype.watch = function(property, per){
    var that = this;
    if (per === undefined) this.dependencies();
    if ( !property ){
        observe(this.scope, function(changeName, newValue, oldValue, routerPather){
            utils.miss(function(){ that.emit('change', that.scope, changeName, newValue, oldValue, routerPather); });
            var zoom = routerPather + '-' + changeName;
            var poolCatches = [];
            that.pools.forEach(function(pool){
                if ( pool.namespace === 'REAPEATBLOCK' ){
                    that.watchRepeat(pool, zoom, poolCatches);
                }else{
                    if ( pool.dependencies.indexOf(zoom) > -1 ){
                        if ( pool.bindingRender ){ pool.bindingRender = null; }
                        else{ pool.value = pool.compile(pool.scope); }
                        poolCatches.push(pool);
                    }
                }
            });

            if ( that.changes[zoom] ){
                that.changes[zoom].forEach(function(callback){
                    poolCatches.forEach(function(ast){
                        typeof callback === 'function' && callback.call(ast, newValue, oldValue);
                    });
                });
            }
        });
    }
    else if ( !per ){
        this.scope.$observer.watch(this.scope, property);
    }else{
        var z = property.split('-').slice(1).map(function(x){
            return "['" + x + "']"
        }).join('');
        var s = new Function('a', 'return a' + z);
        var t = s(this.scope);
        this.scope.$observer.watch(t, per);
    }
    return this;
};

VM.prototype.eachRepeat = function(object, callback){
    var that = this;
    object.pools.forEach(function(pool){
        pool.pools.forEach(function(obj){
            typeof callback === 'function' && callback(obj);
        });
    });
    object.repeatBlocks.forEach(function(obj){
        that.eachRepeat(obj, callback);
    });
};

VM.prototype.watchRepeat = function(object, zoom, poolCatches){
    var that = this;
    object.pools.forEach(function(pool){
        var pools = pool.pools;
        pools.forEach(function(obj){
            if ( obj.dependencies.indexOf(zoom) > -1 ){
                if ( obj.bindingRender ){ obj.bindingRender = null; }
                else{ obj.value = obj.compile(obj.scope); }
                if ( poolCatches ){ poolCatches.push(obj); }
            }
        });
    });
    object.repeatBlocks.forEach(function(obj){
        that.watchRepeat(obj, zoom, poolCatches);
    });
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
    var key = /^\#\-/.test(name) ? name : '#-' + name;
    if ( !this.changes[key] ){ this.changes[key] = []; }
    this.changes[key].push(fn);
    return this;
};

VM.prototype.search = function(DataRouter, foo){
    var pools = [];
    var that = this;
    this.pools.forEach(function(pool){
        if ( pool.namespace === 'REAPEATBLOCK' ){
            utils.searchRepeatBlocks(pool, pools, DataRouter);
        }else{
            if ( pool.dependencies.indexOf(DataRouter) > -1 ){
                pools.push(pool);
            }
        }
    });
    //console.log(pools);
    pools.forEach(function(pool){
        typeof foo === 'function' && foo.call(pool, that);
    });
};

VM.prototype.diff = function(data){
    var diff = new differ();
    var that = this;
    diff.append = function(router, dat, index){
        that.search(router, function(){
            this.$append(dat);
        });
    };
    diff.remove = function(router, dat, index){
        that.search(router, function(){
            this.$remove(index);
        });
    };
    diff.watch(this.scope, data);
};

function gruntRepeatDeps(pool){
    pool.relation();
    pool.repeatBlocks.forEach(function(obj){
        gruntRepeatDeps(obj);
    });
};