import node from './node-object';
import * as utils from '../utils';

export default (DOM, vm) => {
    var contentString = DOM.textContent;
    var cloneFrameElement = utils.createNodeCopier();
    var objects = [];

    contentString.split(utils.REGEXP_TAGSPILTOR).forEach((textSpace, index) => {
        let isTextNodeElement = index % 2 === 1;
        let nodeText = isTextNodeElement ? utils.configs.defaultText : textSpace;
        let cloneTextNode = document.createTextNode(nodeText);
        let expression = textSpace.trim();
        if ( isTextNodeElement && expression.length > 0 ){
            var object = new node(cloneTextNode, expression);
            object.parent = vm;
            objects.push(object);
        }
        cloneFrameElement.appendChild(cloneTextNode);
    });

    DOM.parentNode.replaceChild(cloneFrameElement, DOM);
    return objects;
}