import * as utils from '../utils';
import node from '../use/node-object';

export default (attr, DOM, vm) => {
    var expression = utils.formatExpression(attr.nodeValue);
    var object = new node(DOM, expression);
    object.parent = vm;
    object.set = function(value){
        if ( this.value !== value ){
            this.node.innerHTML = value;
            this.value = value;
        }
    };
    object.node.removeAttribute('so-html');
    return object;
}