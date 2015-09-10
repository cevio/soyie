var utils = require('../utils');

var node = module.exports = function(DOM, expression, DEEP){
    this.deep = DEEP;
    this.expression = expression;
    this.element = DOM;
    this.index = null;
    this.alias = null;
};

Object.defineProperty(node.prototype, 'value', {
    set: function( value ){
        value = this.set(value) || value;
        this.oldValue = value;
    }
});

node.prototype.gruntScope = function(scope, index, alias){
    var data = utils.get(this.deep.locals, scope);
    var _scope = data;

    if ( alias !== undefined && alias !== null ){
        _scope = {};
        _scope[alias] = _scope['$this'] = data;
        _scope['$index'] = index;
    }else{
        if ( index !== undefined && index !== null ){
            _scope['$index'] = index;
        }
    }
    _scope['$parent'] = this.makeParentScope(scope);

    return _scope;
};

node.prototype.makeParentScope = function(scope){
    var data = {};
    var loops = function(vm, dat){
        if ( vm && vm.parent ){
            utils.mixin(dat, utils.get(vm.pather, scope));
            vm = vm.parent;
            if ( vm.parent ){
                dat.$parent = {};
                loops(vm, dat.$parent);
            }
        }
    };
    loops(this.deep.parent, data);
    return data;
};

node.prototype.get = function(scope, index, alias){
    return utils.value(this.expression, this.gruntScope(scope, index, alias));
};

node.prototype.update = node.prototype.render = function(scope, index, alias){
    if ( utils.type(index, 'Object') ){
        index =this.index;
        alias = this.alias;
    }else{
        if ( index ){ this.index = index; }
        else{ index = this.index; }
        if ( alias ){ this.alias = alias; }
        else{alias = this.alias;}
    }

    var value = this.get(scope, index, alias);
    if ( this.oldValue !== value ){
        this.value = value;
    }
};

node.prototype.getRouter = function(){
    var router = this.deep.locals;
    var that = this;
    if ( /\$parent/.test(this.expression) ){
        var splitor = this.expression.split(/\$parent\./g);
        var len = splitor.length - 1;
        var d = this.deep.parent;
        for ( var i = 0 ; i < len ; i++ ){
            if ( d.parent ){
                d = d.parent;
            }else{
                break;
            }
        }
        router = d.pather;
        splitor.slice(len).forEach(function(key){
            router += "['" + key + "']";
        });
        return router;
    }else{
        this.expression.split('.').forEach(function(key, index){
            if ( that.alias && index === 0 ){
                return;
            }else{
                router += "['" + key + "']";
            }
        });
        return router;
    }
};