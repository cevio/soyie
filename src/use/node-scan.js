import componentMap from '../component/map';
import textnodescan from './textnode';
import attrnodescan from './attrnode';
import * as soRepeat from '../directives/so-repeat';
import * as utils from '../utils';

export function DOMSCAN(node, vm){
    utils.slice.call(node.childNodes, 0).forEach(function(dom){
        if ( dom.nodeType === 1 && dom.tagName.toLowerCase() === 'app' ) return;
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
    if ( componentMap[tagName] ){
        var classobject = componentMap[tagName];
        var object = new classobject(node);
        object.parentroot = vm;
        object.init();
        vm.components.push(object);
    }
    else if ( node.hasAttribute('so-repeat') ){
        var repeat = new soRepeat.Block(node);
        repeat.DOMSCAN = DOMSCAN;
        repeat.parentroot = vm;
        repeat.init();
        vm.arrays.push(repeat);
    }
    else{
        ScanAttr(node, vm);
        DOMSCAN(node, vm);
    }
}
function pushAttributes(object, attrs){
    attrs.forEach(attr => {
        object[attr.nodeName] = utils.formatExpression(attr.nodeValue);
    });
}