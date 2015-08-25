/**
 * Created by evio on 15/8/25.
 */
var node= require('../node');
var utils = require('../../utils');
var HtmlEvent = require('../../modules/htmlevent');
var EventEmitter = require('events').EventEmitter;
module.exports = createCommandPassView;
function createCommandPassView(SCOPE, NODE, PATH){
    var DOMObject = new node(this);

    DOMObject.expression = this.nodeValue;
    DOMObject._type_ = 'COMMANDNODE-PASSVIEW';
    DOMObject.scopePath = PATH;

    var isText = NODE.tagName.toUpperCase() === 'INPUT' && NODE.type.toUpperCase() === 'PASSWORD';

    Object.defineProperty(DOMObject, 'value', {
        get: function(){ return this._value_; },
        set: function(value){
            this._value_ = value;
            if ( isText ){
                if ( !!this._value_ ){
                    NODE.type = 'text';
                }else{
                    NODE.type = 'password';
                }
            }else{
                typeof DOMObject.callback === 'function' && DOMObject.callback.call(NODE, this._value_);
            }
        }
    });

    if ( !isText ){
        DOMObject.compile2DataBase = function(value){
            repeatBinding.call(DOMObject, DOMObject.expression, DOMObject.scope, value);
        };

        utils.mixin(DOMObject, new EventEmitter());

        HtmlEvent(NODE).on('click', function(){
            DOMObject.compile2DataBase(!DOMObject.value);
        });
    }

    DOMObject.compile = function($scope){
        return utils.transform(DOMObject.expression, $scope || DOMObject.scope);
    };

    NODE.removeAttribute('es-passview');

    if ( SCOPE ){
        DOMObject.scope = SCOPE;
        DOMObject.value = DOMObject.compile(SCOPE);
    }

    return DOMObject;
}

function repeatBinding(expression, scope, value){
    expression = expression.trim();
    var foo = new Function('scope', 'value', 'scope.' + expression + '=value');
    foo(scope, value);
}