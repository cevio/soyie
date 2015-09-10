var attrParser = require('./attrscan');
var textParser = require('./textscan');
var utils = require('../utils');
var ScopeParent = require('../data-observer/scope-parent');

var createRepeatDataSource = module.exports = function(){
    this.deep = new ScopeParent();
    this.constructer = null;
    this.objects = [];
    this.parent = null;
    this.element = null;
    this.loop = true;
};

createRepeatDataSource.prototype.all = function(DOM){
    var that = this;
    if ( !DOM ){ DOM = this.element; }
    this.objects = this.objects.concat(attrParser(DOM, this.deep));
    utils.slice.call(DOM.childNodes, 0).forEach(function(node){
        if ( utils.exceptTagNames.indexOf(node.tagName) === -1 ){
            switch ( node.nodeType ){
                case 1:
                    if ( node.hasAttribute('es-repeat') ){
                        var Block = new that.constructer(node);
                        Block.init(that.deep, that.parent.useAlias);
                        that.objects.push(Block);
                    }else{
                        that.all(node);
                    }
                    break;
                case 3:
                    that.objects = that.objects.concat(textParser(node, that.deep));
                    break;
            }
        }
    });
    return this;
};

createRepeatDataSource.prototype.render = function(scope, key){
    var that = this;
    this.objects.forEach(function(object){
        object.render(scope, key, that.parent.alias);
    });
};

createRepeatDataSource.prototype.rebuild = function(index){
    this.deep.locals = this.deep.parent.locals + "['" + index + "']";
    this.index = index;
};

createRepeatDataSource.prototype.update = function(scope, key, alias, options){
    var that = this;
    if ( options && options.type ){
        if ( options.type === 'rebuild' ){
            this.objects.forEach(function(object, index){
                if ( object.alone ){
                    object.deep.parent = that.deep;
                    object.rebuild();
                    object.update(scope, { type: 'rebuild' });
                }else{
                    object.deep = that.deep;
                    object.update(scope, key, alias);
                }
            });
        }
    }else{
        this.objects.forEach(function(object){
            object.update(scope, key, alias);
        });
    }
};