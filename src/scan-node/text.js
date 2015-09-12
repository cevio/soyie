var utils = require('../utils');

var text = module.exports = function(DOM, expression, PARENT){
    this.parent = PARENT;
    this.expression = expression;
    this.element = DOM;
};

text.prototype.set = function(value){
    this.element.nodeValue = value;
};

Object.defineProperty(text.prototype, 'value', {
    set: function( value ){
        this.set(value);
        this.oldValue = value;
    }
});

text.prototype.gruntScope = function(scope){
    var data = utils.get(this.parent.deep.locals, scope);
    var database = Object.create(data);
    database.$index = this.parent.deep.index;
    if ( /\B\$parent\b\./.test(this.expression) ){
        database.$parent = this.makeParentScope(scope);
    }
    return database;
};

text.prototype.makeParentScope = function(scope){
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

text.prototype.get = function(scope){
    return utils.value(this.expression, this.gruntScope(scope));
};

text.prototype.update = text.prototype.render = function(scope){
    var value = this.get(scope);
    if ( this.oldValue !== value ){
        this.value = value;
    }
};