/**
 * Created by evio on 15/9/30.
 */
import * as utils from '../utils';
import node from '../use/node-object';

export default (attr, DOM, vm) => {
    var expression = utils.formatExpression(attr.nodeValue);
    var object = new node(DOM, expression);
    object.parent = vm;
    object.set = function(value){
        value = !!value;
        if ( this.value !== value ){
            this.node.disabled = value;
            this.value = value;
        }
    };
    object.node.removeAttribute('so-disabled');
    return object;
}