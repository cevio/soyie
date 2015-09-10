var datas = require('../data-model/data');
var utils = require('../utils');
var textNodeParser = require('./text');
var attrNodeParser = require('./attr');

var createRepeatNodeParser = module.exports = function(){
    this.element = null;
    this.parent = null;
    this.blockConstructor = null;
    this.scope = new datas();
    this.objects = [];
    this.namespace = 'repeat-item';
};

createRepeatNodeParser.prototype.prepare = function(DOM){
    var nodes = DOM || this.element;
    var that = this;
    if ( nodes === this.element ){
        this.objects = this.objects.concat(attrNodeParser(nodes));
    }
    utils.slice.call(nodes.childNodes, 0).forEach(function(node){
        if ( utils.exceptTagNames.indexOf(node.tagName) === -1 ){
            switch ( node.nodeType ){
                case 1:
                    if ( node.hasAttribute('es-repeat') ){
                        var Block = new that.blockConstructor(node);
                        that.objects.push(Block.prepare());
                        // TODO HERE.
                    }else{
                        that.objects = that.objects.concat(attrNodeParser(node));
                        that.prepare(node);
                    }
                    break;
                case 3:
                    that.objects = that.objects.concat(textNodeParser(node));
                    break;
            }
        }
    });
    return this;
};

createRepeatNodeParser.prototype.render = function(invar){
    var data = this.scope.$this;
    var that = this;
    this.objects.forEach(function(object){
        if ( object.alone ){
            if ( invar ){
                object.objects.forEach(function(obj){
                    obj.render(true);
                });
            }else{
                var expname = utils.fromatRealy(object.realy);
                object.scope.$parent = that.scope;
                object.scope.$path = that.scope.$path + '-' + expname.replace(/\./g, '-');
                var scopes = object.getData();
                if ( utils.type(scopes, 'Array') ){
                    scopes.forEach(function(scope){
                        object.$append(scope);
                    });
                }
            }
        }else{
            object.scope.bind(that.scope.$path, data);
            object.scope.alias = that.scope.alias;
            object.scope.$index = that.scope.$index;
            object.scope.$parent = that.scope.$parent;
            object.scope.$realy = that.scope.$realy;
            object.render();
        }
    });
    return this;
};

createRepeatNodeParser.prototype.relation = function(){
    this.objects.forEach(function(object){
        if ( object.alone ) {
            object.objects.forEach(function(obj){
                obj.relation();
            });
        }else{
            object.relation();
        }
    });
    return this;
};