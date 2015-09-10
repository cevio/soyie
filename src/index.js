var vmodel = require('./scan-node/index');
var utils = require('./utils');
var domReady = require('./domready');
var fastClick = require('fastclick');

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
    return (new vmodel()).all(this.select(controller));
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

exports.fastClick = function(){
    if ( !this.fastClick.installed ){
        fastClick(document.body);
        this.fastClick.installed = true;
    }
};

exports.ready = function(foo){
    this.fastClick();
    domReady(foo);
};

if ( typeof window !== 'undefined' ){
    window.Soyie = exports;
}