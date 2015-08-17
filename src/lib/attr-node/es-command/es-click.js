var node= require('../node');
var HtmlEvent = require('../../modules/htmlevent');

module.exports = createCommandEsClick;

function createCommandEsClick(SCOPE, NODE, PATH){
    var DOMObject = new node(this);
    DOMObject.expression = this.nodeValue;
    DOMObject._type_ = 'COMMANDNODE-CLICK';
    DOMObject.scopePath = PATH;

    DOMObject.compile = function($scope){
        var fn = new Function('scope', ';with(scope){\n' + DOMObject.expression + '\n};');
        return fn.call(NODE, $scope);
    };

    HtmlEvent(NODE).on('click', function(){
        DOMObject.scope = SCOPE;
        DOMObject.compile(SCOPE);
    });

    NODE.removeAttribute('es-click');
    return DOMObject;
}