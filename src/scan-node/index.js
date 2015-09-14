var utils = require('../utils');
var ScopeParent = require('../data-observer/scope-parent');
var watcher = require('../data-observer/watcher');
var plugin = require('../plugin');

var scan = module.exports = function(){
    this.objects = [];
    this.deep = new ScopeParent();
    this.deep.locals = '';
    this.element = null;
    this.source = null;
    this.coms = null;
};

scan.prototype.init = function(data){
    ScopeParent.source = this.source = data || {};
    return this.render(this.source).listen();
};

scan.prototype.all = function(DOM){
    var that = this;
    this.objects = this.objects.concat(that.coms.attr(DOM, this));
    if ( !this.element ) this.element = DOM;
    utils.slice.call(DOM.childNodes, 0).forEach(function(node){
        var tagName = node.tagName;
        if ( tagName ) tagName = tagName.toLowerCase();
        if ( utils.exceptTagNames.indexOf(tagName) === -1 ){
            switch ( node.nodeType ){
                case 1:
                    if ( utils.components[tagName] ){
                        plugin(tagName, node, utils.components[tagName], that, that.coms);
                    }
                    else if ( !node.hasAttribute('es-controller') ){
                        if ( node.hasAttribute('es-repeat') ){
                            var repeat = new that.coms.repeat(node);
                            repeat.coms = that.coms;
                            repeat.parent = that;
                            repeat.init();
                            that.objects.push(repeat);
                        }
                        else{ that.all(node); }
                    }
                    break;
                case 3:
                    that.objects = that.objects.concat(that.coms.text(node, that));
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