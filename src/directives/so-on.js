import * as utils from '../utils';
import node from '../use/node-object';

export default (attr, DOM, vm) => {
    var expression = attr.nodeValue;
    var object = new node(DOM, expression);
    object.parent = vm;
    object.value = {};
    object.set = (method, foo) => object.value[method] = foo;

    object.render = function(scope = this.scope, options = {}){
        this.scope = scope;
        var contexts = this.expression.split('|');
        contexts.forEach(context => {
            var gate = context.indexOf(':');
            var method = context.substring(0, gate);
            var express = context.substring(gate + 1).trim();

            if ( typeof this.value[method] !== 'function' ){
                this.node.addEventListener(method, (...args) => {
                    var fn = this.value[method];
                    var result = fn.call(this.node, this.scope, options);
                    if ( typeof result === 'function' ){
                        result.apply(this.node, args);
                    }
                }, false);
            }

            let str = [];
            for ( var key in options ) {
                str.push("var " + key + " = $options['" + key + "'];");
            }

            var foo = new Function('$this', '$options',
                str.join('\n') + '\nwith($this){return ' + express + '}');

            this.set(method, foo);
        });
    };

    DOM.removeAttribute('so-on');

    return object;
}