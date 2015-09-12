var utils = require('../utils');
var attrParser = require('./attrscan');
var textParser = require('./textscan');
var repeatParser = require('./repeatscan');
var ScopeParent = require('../data-observer/scope-parent');
var watcher = require('../data-observer/watcher');

var scan = module.exports = function(){
    this.objects = [];
    this.deep = new ScopeParent();
    this.deep.locals = '';
    this.element = null;
    this.source = null;
};

scan.prototype.init = function(data){
    ScopeParent.source = this.source = data || {};
    return this.render(this.source).listen();
};

scan.prototype.all = function(DOM){
    var that = this;
    this.objects = this.objects.concat(attrParser(DOM, this));
    if ( !this.element ) this.element = DOM;
    utils.slice.call(DOM.childNodes, 0).forEach(function(node){
        if ( utils.exceptTagNames.indexOf(node.tagName) === -1 ){
            switch ( node.nodeType ){
                case 1:
                    if ( !node.hasAttribute('es-controller') ){
                        if ( node.hasAttribute('es-repeat') ){
                            var repeat = new repeatParser(node);
                            repeat.parent = that;
                            repeat.init();
                            that.objects.push(repeat);
                        }
                        else{ that.all(node); }
                    }
                    break;
                case 3:
                    that.objects = that.objects.concat(textParser(node, that));
                    break;
            }
        }
    });
    return this;
};

scan.prototype.render = function(scope){
    this.objects.forEach(function(object){
        object.render(scope);
    });
    return this;
};

scan.prototype.listen = function(){
    this.watcher = new watcher(this);
    this.watcher.inject();
    return this;
};

scan.prototype.update = function(foo){
    foo.call(this.source, this.source, this.element);
    return this;
};