var dataParser = require('./compileData');
var node = require('./node');
var sup = require('./sup');
var utils = require('../utils');
var EventEmitter = require('events').EventEmitter;
var repeatBlock = module.exports = function(DOM){
    this.element = DOM;
    this.fragment = document.createDocumentFragment();
    this.template = null;
    this.scope = new dataParser();
    this.parentNode = null;
    this.commentStartNode = null;
    this.commentEndNode = null;
    this.pools = [];
    this.repeatBlocks = [];
    this.namespace = 'REAPEATBLOCK';
    this.length = 0;
};

utils.mixin(repeatBlock.prototype, EventEmitter.prototype);

// do with dom
repeatBlock.prototype.grunt = function(){
    var commandin = sup.getCommandInVars(this.element.getAttribute('es-repeat'));
    if ( commandin ){
        this.element.removeAttribute('es-repeat');
        this.scope.$alias = commandin.alias;
        this.scope.$realy = commandin.realy;
        this.scope.$push(this.scope.$alias, this.scope.$this);

        var cloneNodeElement = this.element.cloneNode(true);
        var parentNodeDom = this.element.parentNode;
        this.template = cloneNodeElement;
        this.parentNode = parentNodeDom;
        this.commentStartNode = document.createComment('Repeat Start');
        this.commentEndNode = document.createComment('Repeat End');
        this.fragment.appendChild(this.commentStartNode);
        this.fragment.appendChild(this.commentEndNode);
        this.parentNode.replaceChild(this.fragment, this.element);
    }
};

// do with data
repeatBlock.prototype.compile = function(){
    var datas = this.getData();
    var that = this;
    if ( datas && datas.length > 0 ){
        datas.forEach(function(data, index){ that.append(data, index); });
    }
    else{
        // TODO
    }
};

repeatBlock.prototype.getData = function(){
    var key;
    if ( this.scope.$parent.$parent ){
        var keys = this.scope.$realy.split('.');
        key = keys.length > 1 ? keys.slice(1).join('.') : keys[0];
    }else{
        key = this.scope.$realy;
    }
    return utils.transform(key, this.scope[this.scope.$alias]);
};

repeatBlock.prototype.append = function(data, index){
    var newCloneNode = this.template.cloneNode(true);
    var DOMObject = new node(newCloneNode);
    this.dist(DOMObject, newCloneNode, data, index);
    this.commentEndNode.parentNode.insertBefore(newCloneNode, this.commentEndNode);
    this.length++;
    this.pools.push(DOMObject);
};

repeatBlock.prototype.prepend = function(data, index){
    var newCloneNode = this.template.cloneNode(true);
    var DOMObject = new node(newCloneNode);
    this.dist(DOMObject, newCloneNode, data, index);
    var firstChild = this.commentStartNode.nextSibling;
    if ( firstChild === this.commentEndNode ){
        this.commentEndNode.parentNode.insertBefore(newCloneNode, this.commentEndNode);
    }else{
        firstChild.parentNode.insertBefore(newCloneNode, firstChild);
    }
    this.length++;
    this.pools = [DOMObject].concat(this.pools);
};

repeatBlock.prototype.insert = function(data, index){
    var newCloneNode = this.template.cloneNode(true);
    var DOMObject = new node(newCloneNode);
    this.dist(DOMObject, newCloneNode, data, index);
    var element = this.pools[index].element;
    element.parentNode.insertBefore(newCloneNode, element);
    this.length++;
    var a = this.pools.slice(0, index);
    var b = this.pools.slice(index);
    this.pools = a.concat([DOMObject]).concat(b);
};

repeatBlock.prototype.dist = function(DOMObject, newCloneNode, data, index){
    DOMObject.scope.$this = data;
    DOMObject.scope.$parent = this.scope.$parent;
    DOMObject.scope.$index = index;
    DOMObject.scope.$alias = this.scope.$alias;
    DOMObject.scope.$realy = this.scope.$realy;
    DOMObject.scope.$push(this.scope.$alias);
    DOMObject.index = index;

    var keys = DOMObject.scope.$realy.split('.');
    var key = keys.length > 1 ? keys.slice(1).join('.') : keys[0];
    var that = this;
    DOMObject.scope.$resolvePath(this.scope.$path, key);

    var attrs = DOMObject.compileAttributes();
    DOMObject.pools = DOMObject.pools.concat(attrs);

    DOMObject.find(newCloneNode, function(){
        var block = new repeatBlock(this);
        block.scope.$this = data;
        block.scope.$parent = DOMObject.scope;
        block.grunt();
        block.scope.$resolvePath(index);
        block.compile();
        that.repeatBlocks.push(block);
    });
};

repeatBlock.prototype.relation = function(index, after){
    var that = this;
    if ( utils.type(index, 'Boolean') ){
        after = index;
        index = -1;
    }
    if ( index === undefined ){
        index = -1;
    }
    if ( index > -1 && this.pools[index] ){
        this.pools[index].pools.forEach(function(p){
            sup.reBuildNormalStyle(p);
        });
        if ( after ){
            this.repeatBlocks.forEach(function(block){
                block.relation(!!after);
            });
        }
    }else{
        this.pools.forEach(function(pool, i){
            that.relation(i, after);
        });
    }
    return this;
};

repeatBlock.prototype.$append = function(data){
    var index = this.length;
    var isObject = utils.type(data, 'Object');
    this.append(data, index);
    this.relation(index, isObject);
    return this;
};

// TODO FIEX: position index.
repeatBlock.prototype.$prepend = function(data){
    var index = this.length;
    var isObject = utils.type(data, 'Object');
    this.prepend(data, index);
    this.relation(0, isObject);
    return this;
};

repeatBlock.prototype.$insert = function(data, index){
    if ( index === 0 ){
        this.$prepend(data);
    }
    else if ( index >= this.length ){
        this.$append(data);
    }else{
        var isObject = utils.type(data, 'Object');
        this.insert(data, index);
        this.relation(index, isObject);
    }
    return this;
};

repeatBlock.prototype.$remove = function(index){
    var NodeRender = this.pools[index];
    if ( NodeRender ){
        NodeRender.element.parentNode.removeChild(NodeRender.element);
        this.pools.splice(index, 1);
        this.length--;
    }
    return this;
};

repeatBlock.prototype.$removeAll = function(){
    for ( var i = 0 ; i < this.length ; i++ ){
        this.$remove(i);
    }
    return this;
};

repeatBlock.prototype.$replaceAll = function(data){
    var that = this;
    this.$removeAll();
    data.forEach(function(dat){ that.$append(dat); });
    return this;
};

repeatBlock.prototype.$replace = function(data, index){
    this.$remove(index);
    this.$insert(data, index);
};