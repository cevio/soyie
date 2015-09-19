import componentMap from '../component/map';
import textnodescan from './textnode';
import attrnodescan from './attrnode';
import * as utils from '../utils';

export function DOMSCAN(node, vm){
    utils.slice.call(node.childNodes, 0).forEach(function(dom){
        if ( dom.nodeType === 1 && dom.tagName.toLowerCase() === 'controller' ) return;
        switch (dom.nodeType){
            case 1: ScanNode(dom, vm); break;
            case 3: ScanText(dom, vm); break;
        }
    });
}

function ScanText(node, vm){ vm.objects = vm.objects.concat(textnodescan(node, vm)); }
function ScanAttr(node, vm){ vm.objects = vm.objects.concat(attrnodescan(node, vm)); }
function ScanNode(node, vm){
    var tagName = node.tagName.toLowerCase();
    if ( componentMap.has(tagName) ){
        var attributes = utils.slice.call(node.attributes, 0);
        var classobject = componentMap.get(tagName);
        var object = new classobject(node);
        pushAttributes(object.keys, attributes)
        object.parent = vm;
        object.init();
        vm.components.push(object);
    }else{
        ScanAttr(node, vm);
        DOMSCAN(node, vm);
    }
}
function pushAttributes(object, attrs){
    attrs.forEach(attr => {
        object[attr.nodeName] = utils.formatExpression(attr.nodeValue);
    });
}