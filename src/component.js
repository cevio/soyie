var attrComponent = require('./component-attribute');
var attrParser = require('./scan-node/attrscan');
var textParser = require('./scan-node/textscan');
var EventEmitter = require('events').EventEmitter;
var utils = require('./utils');
var repeatParser = require('./scan-node/repeatscan');
var ScopeParent = require('./data-observer/scope-parent');
var component = module.exports = function(DOM){
    this.element = DOM;
    this.namespace = 'component';
    this.fragment = document.createDocumentFragment();
    this.commentStartNode = null;
    this.commentEndNode = null;
    this.props = [];
    this.objects = [];
    this.template = DOM.innerHTML;
    this.humps = {};
    this.deep = new ScopeParent();
};

utils.mixin(component.prototype, EventEmitter.prototype);

component.prototype.rebuild = function(){
    this.deep.parent = this.parent.deep;
    this.deep.locals = this.deep.parent.locals;
};

component.prototype.__init__ = function(){
    this.rebuild();
    this.commentStartNode = document.createComment('Component Start');
    this.commentEndNode = document.createComment('Component End');
    this.fragment.appendChild(this.commentStartNode);
    this.fragment.appendChild(this.commentEndNode);
    this.element.parentNode.replaceChild(this.fragment, this.element);
    this.__compileAttribute__();
    this.__replaceTemplate__();
    this.__all__();
};

component.prototype.__all__ = function(DOM){
    var that = this, jobject;
    if ( !DOM ){
        jobject = this.element;
    }else{
        jobject = [DOM];
    }
    jobject.forEach(function(dom){
        var tagName = dom.tagName;
        if ( tagName ) tagName = tagName.toLowerCase();
        that.objects = that.objects.concat(attrParser(dom, that));
        utils.slice.call(dom.childNodes, 0).forEach(function(node){
            if ( utils.exceptTagNames.indexOf(tagName) === -1 ){
                switch ( node.nodeType ){
                    case 1:
                        if ( utils.components[tagName] ){
                            that.pluginConstructor(tagName, node, utils.components[tagName], that);
                        }
                        else if ( !node.hasAttribute('es-controller') ){
                            if ( node.hasAttribute('es-repeat') ){
                                var repeat = new repeatParser(node);
                                repeat.parent = that;
                                repeat.init();
                                that.objects.push(repeat);
                            }
                            else{ that.__all__(node); }
                        }
                        break;
                    case 3:
                        that.objects = that.objects.concat(textParser(node, that));
                        break;
                }
            }
        });

    });
};

component.prototype.__compileAttribute__ = function(){
    var that = this;
    this.__props__ = this.props.map(function(prop){
        return utils.deHump(prop);
    });
    utils.slice.call(this.element.attributes, 0).forEach(function(attribute){
        if ( that.__props__.indexOf(attribute.nodeName) > -1 ){
            var expression = utils.formatExpression(attribute.nodeValue);
            var nodeAttr = new attrComponent(expression, that.parent);
            that.humps[utils.enHump(attribute.nodeName)] = nodeAttr;
        }
    });
};

component.prototype.__replaceTemplate__ = function(){
    var that = this, elements;
    var sandbox = function(node){
        var next = node.nextSibling;
        if ( !(next === null || next === that.commentEndNode) ){
            sandbox(next);
            next.parentNode.removeChild(next);
        }
    };
    sandbox(this.commentStartNode);
    var fg = document.createDocumentFragment();
    if ( !utils.type(this.template, 'String') ){
        fg.appendChild(this.template);
        elements = [this.template];
    }else{
        var div = document.createElement('div');
        div.innerHTML = this.template;
        elements = [];
        utils.slice.call(div.childNodes, 0).forEach(function(node){
            fg.appendChild(node);
            elements.push(node);
        });
        div = null;
    }
    this.commentEndNode.parentNode.insertBefore(fg, this.commentEndNode);
    this.element = elements;
};

component.prototype.getScope = function(_scope){
    var scope = Object.create({});
    var source = _scope || ScopeParent.source;
    for ( var i in this.humps ){
        scope[i] = this.humps[i].getScope(source);
    }
    return scope;
};

component.prototype.render = function(scope){
    var scope = this.getScope(scope);
    this.objects.forEach(function(object){
        object.render(scope);
    });
};

component.prototype.update = function(scope, options){
    var scope = this.getScope(scope);
    this.objects.forEach(function(object){
        object.update(scope, options);
    });
};