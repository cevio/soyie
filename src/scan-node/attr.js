var utils = require('../utils');

var attr = module.exports = function(DOM, expression, PARENT, AttributeNode){
    this.parent = PARENT;
    this.expression = expression;
    this.element = DOM;
    this.attrnode = AttributeNode;
};

attr.prototype.set = function(value){
    this.attrnode.nodeValue = value;
};

Object.defineProperty(attr.prototype, 'value', {
    set: function( value ){
        this.set(value);
        this.oldValue = value;
    }
});

attr.prototype.gruntScope = function(scope){
    var data = utils.get(this.parent.deep.locals, scope);
    var database = Object.create(data);
    database.$index = this.parent.deep.index;
    if ( /\B\$parent\b\./.test(this.expression) ){
        database.$parent = this.makeParentScope(scope);
    }
    return database;
};

attr.prototype.makeParentScope = function(scope){
    var data = {};
    var loops = function(vm, dat){
        if ( vm && vm.parent ){
            dat.$index = vm.index;
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

attr.prototype.get = function(scope){
    return utils.value(this.expression, this.gruntScope(scope));
};

attr.prototype.update = attr.prototype.render = function(scope){
    var value = this.get(scope);
    if ( this.oldValue !== value ){
        this.value = value;
    }
};