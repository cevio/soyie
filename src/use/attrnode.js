import node from './node-object';
import * as utils from '../utils';

var commands = {};

export default (DOM, vm) => {
    var result = [];
    utils.slice.call(DOM.attributes, 0).forEach(attr => {
        var nodeName = attr.nodeName;
        if ( commands[nodeName] ){
            commands[nodeName](attr, DOM);
        }else{
            var expression = utils.formatExpression(attr.nodeValue);
            var object = new node(attr, expression);
            object.parent = vm;
            result.push(object);
        }
    });
    return result;
}