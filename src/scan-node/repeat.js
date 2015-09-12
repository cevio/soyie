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

Object.defineProperty(createRepeatDataSource.prototype, 'index', {
    set: function(index){
        this.deep.parent = this.parent.deep.parent;
        this.deep.locals = this.parent.deep.locals + "['" + index + "']";
        this.deep.index = index;
    }
});

createRepeatDataSource.prototype.all = function(DOM){
    var that = this;
    if ( !DOM ){ DOM = this.element; }
    this.objects = this.objects.concat(attrParser(DOM, this));
    utils.slice.call(DOM.childNodes, 0).forEach(function(node){
        if ( utils.exceptTagNames.indexOf(node.tagName) === -1 ){
            switch ( node.nodeType ){
                case 1:
                    if ( node.hasAttribute('es-repeat') ){
                        var Block = new that.constructer(node);
                        Block.parent = that;
                        Block.init();
                        that.objects.push(Block);
                    }else{
                        that.all(node);
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

createRepeatDataSource.prototype.render = function(scope){
    this.objects.forEach(function(object){
        object.render(scope);
    });
};

createRepeatDataSource.prototype.update = function(scope, options){
    if ( options && options.type && options.type === 'rebuild' ){
        this.objects.forEach(function(object, index){
            if ( object.alone ){
                object.update(scope, { type: 'rebuild' });
            }else{
                object.index = index;
                object.update(scope, options);
            }
        });
    }else{
        this.objects.forEach(function(object){
            object.update(scope, options);
        });
    }
};