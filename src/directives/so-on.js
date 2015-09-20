import * as utils from '../utils';
import node from '../use/node-object';

export default (attr, DOM, vm) => {
    var expression = attr.nodeValue;
    var object = new node(DOM, expression);
    object.parent = vm;
    object.value = {};
    object.set = (method, foo) => object.value[method] = foo;

    object.render = function(scope){
        var contexts = this.expression.split('|');
        contexts.forEach(context => {
            var gate = context.indexOf(':');
            var method = context.substring(0, gate);
            var express = context.substring(gate + 1).trim();

            if ( typeof this.value[method] !== 'function' ){
                this.node.addEventListener(method, (...args) => {
                    var fn = this.value[method];
                    var result = fn.call(this.node, scope);
                    if ( typeof result === 'function' ){
                        result.apply(this.node, args);
                    }
                }, false);
            }

            this.set(method, new Function('scope', ';with(scope){\nreturn ' + express + '\n};'));
        });
    };

    DOM.removeAttribute('so-on');

    return object;
}