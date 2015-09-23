import node from './node-object';
import * as utils from '../utils';
import soSrc from '../directives/so-src';
import soHtml from '../directives/so-html';
import soOn from '../directives/so-on';
import soBinding from '../directives/so-binding';
import maps from './directives';

var commands = {
    "so-src": soSrc,
    "so-html": soHtml,
    "so-on": soOn,
    "so-binding": soBinding
};

utils.extend(commands, maps || {});

export default (DOM, vm) => {
    var result = [];
    utils.slice.call(DOM.attributes, 0).forEach(attr => {
        var nodeName = attr.nodeName;
        if ( commands[nodeName] ){
            result.push(commands[nodeName](attr, DOM, vm));
        }else{
            var expression = utils.formatExpression(attr.nodeValue);
            var object = new node(attr, expression);
            object.parent = vm;
            result.push(object);
        }
    });
    return result;
}