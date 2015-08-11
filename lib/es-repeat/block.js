var dataParser = require('./compileData');
var node = require('./node');
var sup = require('./sup');
var utils = require('../utils');
var repeatBlock = module.exports = function(DOM){
    this.element = DOM;
    this.fragment = document.createDocumentFragment();
    this.template = null;
    this.scope = new dataParser();
    this.parentNode = null;
    this.commentStartNode = null;
    this.commentEndNode = null;
    this.pools = [];
    this.namespace = 'REAPEATBLOCK';
};

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
        datas.forEach(function(data, index){
            that.append(data, index);
        });
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
};

repeatBlock.prototype.dist = function(DOMObject, newCloneNode, data, index){
    DOMObject.scope.$this = data;
    DOMObject.scope.$parent = this.scope.$parent;
    DOMObject.scope.$index = index;
    DOMObject.scope.$alias = this.scope.$alias;
    DOMObject.scope.$realy = this.scope.$realy;
    DOMObject.scope.$push(this.scope.$alias);

    var keys = DOMObject.scope.$realy.split('.');
    var key = keys.length > 1 ? keys.slice(1).join('.') : keys[0];

    DOMObject.scope.$resolvePath(index, key);

    var attrs = DOMObject.compileAttributes();
    DOMObject.pools = DOMObject.pools.concat(attrs);

    DOMObject.find(newCloneNode, function(){
        var block = new repeatBlock(this);
        block.scope.$this = data;
        block.scope.$parent = DOMObject.scope;
        block.grunt();
        block.scope.$resolvePath(index);
        block.compile();
        DOMObject.pools = DOMObject.pools.concat(block.pools);
    });

    this.pools = this.pools.concat(DOMObject.pools);
};

repeatBlock.prototype.relation = function(){
    this.pools.forEach(function(pool){
        sup.reBuildNormalStyle(pool);
    });
};