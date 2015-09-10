var textParser = require('./view-model/text');
var attrParser = require('./view-model/attr');
var repeatParser = require('./view-model/repeat');
var watcher = require('./data-model/watch');
var utils = require('./utils');

var vmodel = module.exports = function(){
    this.objects = [];
    this.scope = {};
};

vmodel.prototype.define = function(DOM){
    var that = this;
    this.objects = this.objects.concat(attrParser(DOM));
    utils.slice.call(DOM.childNodes, 0).forEach(function(node){
        if ( utils.exceptTagNames.indexOf(node.tagName) === -1 ){
            switch ( node.nodeType ){
                case 1:
                    if ( !node.hasAttribute('es-controller') ){
                        if ( node.hasAttribute('es-repeat') ){
                            var repeat = new repeatParser(node);
                            that.objects.push(repeat.prepare());
                        }
                        else{ that.define(node); }
                    }
                    break;
                case 3:
                    that.objects = that.objects.concat(textParser(node));
                    break;
            }
        }
    });
    return this;
};

vmodel.prototype.init = function(initData){
    this.scope = initData || {};
    this.render();
    return this;
};

vmodel.prototype.render = function(invar){
    var that = this;
    this.objects.forEach(function(object){
        if ( object.alone ){
            if ( invar ){
                object.objects.forEach(function(obj){
                    obj.render(true);
                });
            }else{
                object.scope.$parent = that.scope;
                object.scope.$path = '#-' + object.realy.replace(/\./g, '-');
                var scopes = object.getData();
                if ( utils.type(scopes, 'Array') ){
                    scopes.forEach(function(scope){ object.$append(scope); });
                }
            }
        }else{
            object.scope.bind(that.scope);
            object.render();
            object.relation();
        }
    });
    return this;
};

vmodel.prototype.watch = function(router, callback){
    var that = this;
    if ( !router ){
        if ( !utils.type(this.scope, 'Object') ){
            this.scope = { "this": this.scope };
        }
        this.observer = watcher.createObjectWatcher(this.scope, '#', that);
    }
    else{
        var observer = watcher.observers[router];
        if ( observer ){
            // TODO HERE.
        }
    }
    return this;
};

vmodel.prototype.unwatch = function(){
    this.observer.close();
    return this;
};

vmodel.prototype.listen = function(scope){
    if ( scope !== undefined ){
        this.scope = scope;
        this.render();
    }
    this.watch();
    return this;
};