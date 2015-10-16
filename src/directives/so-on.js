import * as utils from '../utils';
import node from '../use/node-object';

export default (attr, DOM, vm) => {
    var expression = attr.nodeValue;
    var object = new node(DOM, expression);
    object.parent = vm;
    object.value = {};
    object.options = {};
    object.set = (method, foo) => object.value[method].foo = foo;
    object.node.events = object.node.events || [];

    object.expression.split('|').forEach(context => {
        var gate = context.indexOf(':');
        var method = context.substring(0, gate);
        var express = context.substring(gate + 1).trim();
        if ( object.node.events.indexOf(method) == -1 ){
            object.value[method] = { expression: express, foo: null };
            object.node.addEventListener(method, (...args) => {
                var use = object.value[method];
                if ( !use ) return;
                var fn = use.foo;
                if ( typeof fn === 'function' ){
                    var result = fn.call(object.node, object.scope, object.options);
                    if ( typeof result === 'function' ){
                        result.apply(object.node, args);
                    }
                }
            }, false);
            object.node.events.push(method);
        }
    });

    object.notify = function(scope = this.scope, options = {}){
        object.scope = scope;
        object.options = options;
        let str = [];
        for ( var key in object.options ) { str.push("var " + key + " = $options['" + key + "'];"); }
        for ( let method in object.value ){
            this.set(method,
                new Function('$this', '$options', str.join('\n') + '\nwith($this){return ' + object.value[method].expression + '}')
            );
        }
    };

    DOM.removeAttribute('so-on');

    return object;
}