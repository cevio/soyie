var utils = require('../utils');

var node = module.exports = function(DOM, expression, PARENT){
    this.parent = PARENT;
    this.expression = expression;
    this.element = DOM;
};

Object.defineProperty(node.prototype, 'value', {
    set: function( value ){
        value = this.set(value) || value;
        this.oldValue = value;
    }
});

node.prototype.gruntScope = function(scope){
    var data = utils.get(this.parent.deep.locals, scope);
    var database = Object.create(data);
    database.$index = this.parent.deep.index;
    if ( /\B\$parent\b\./.test(this.expression) ){
        database.$parent = this.makeParentScope(scope);
    }
    return database;
};

node.prototype.makeParentScope = function(scope){
    var data = {};
    var loops = function(vm, dat){
        if ( vm && vm.parent ){
            vm = vm.parent;
            utils.mixin(dat, utils.get(vm.locals, scope));
            dat.$parent = {};
            loops(vm, dat.$parent);
        }else{
            utils.mixin(dat, utils.get(vm.locals, scope));
        }
    };
    loops(this.parent.deep, data);
    return data;
};

node.prototype.get = function(scope){
    return utils.value(this.expression, this.gruntScope(scope));
};

node.prototype.update = node.prototype.render = function(scope){
    var value = this.get(scope);
    if ( this.oldValue !== value ){
        this.value = value;
    }
};

node.prototype.getRouter = function(){
    var router = this.parent.deep.locals;
    if ( /\B\$parent\b\./.test(this.expression) ){
        var splitor = this.expression.split(/\B\$parent\b\./g);
        var len = splitor.length - 1;
        var d = this.parent.deep;
        for ( var i = 0 ; i < len ; i++ ){
            if ( d.parent ){
                d = d.parent;
            }else{
                break;
            }
        }
        router = d.locals;
        splitor.slice(len).forEach(function(key){
            router += "['" + key + "']";
        });
        return router;
    }else{
        return utils.makeDeepOnExpression(this.expression, router);
    }
};