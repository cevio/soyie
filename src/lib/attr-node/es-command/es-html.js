/**
 * Created by evio on 15/8/25.
 */
var node= require('../node');
var utils = require('../../utils');
module.exports = createCommandHTML;

function createCommandHTML(SCOPE, NODE, PATH){
    var DOMObject = new node(this);

    DOMObject.expression = this.nodeValue;
    DOMObject._type_ = 'COMMANDNODE-HTML';
    DOMObject.scopePath = PATH;

    Object.defineProperty(DOMObject, 'value', {
        get: function(){ return this._value_; },
        set: function(value){
            this._value_ = !!value;
            NODE.innerHTML = value;
        }
    });

    DOMObject.compile = function($scope){
        DOMObject.scope = $scope || SCOPE;
        return utils.transform(DOMObject.expression, $scope || DOMObject.scope);
    };

    NODE.removeAttribute('es-html');

    if ( SCOPE ){
        DOMObject.value = DOMObject.compile(SCOPE);
    }

    return DOMObject;
}