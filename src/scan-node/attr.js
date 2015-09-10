var utils = require('../utils');

var attr = module.exports = function(DOM, expression, DEEP, AttributeNode){
    this.deep = DEEP;
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

attr.prototype.gruntScope = function(scope, index, alias){
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

attr.prototype.makeParentScope = function(scope){
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

attr.prototype.get = function(scope, index, alias){
    return utils.value(this.expression, this.gruntScope(scope, index, alias));
};

attr.prototype.update = attr.prototype.render = function(scope, index, alias){
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