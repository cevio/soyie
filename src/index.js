var vmodel = require('./scan-node/index');
var utils = require('./utils');
var domReady = require('domready');
exports.coms = {};
exports.coms.repeat = require('./scan-node/repeatscan');
exports.coms.attr = require('./scan-node/attrscan');
exports.coms.text = require('./scan-node/textscan');

exports.select = function(expression){
    if ( !utils.type(expression, 'String') ){
        return expression;
    }

    var elements = document.querySelectorAll("[es-controller='" + expression + "']");
    return elements.length === 0
        ? null
        : (
        elements.length === 1
            ? elements[0]
            : utils.slice.call(elements, 0)
    );
};

exports.controller = function(controller){
    var vm = new vmodel();
    vm.coms = this.coms;
    return vm.all(this.select(controller));
};

exports.invoke = function(controller, initScope, factory){
    var vm = this.controller(controller);
    if ( typeof initScope === 'function' ){
        factory = initScope;
        initScope = {};
    }
    vm.init(initScope);
    if ( factory ){
        vm.update(factory);
    }
    return vm;
};

exports.ready = domReady;
exports.component = function(name, foo){
    if ( typeof foo === 'function' ){ utils.components[name] = foo; }
    else{
        utils.components[name] = function(){
            return foo;
        };
    }
    return this;
};