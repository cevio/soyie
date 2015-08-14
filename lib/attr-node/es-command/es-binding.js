/**
 * Created by evio on 15/8/5.
 */
var node= require('../node');
var utils = require('../../utils');
var EventEmitter = require('events').EventEmitter;
var HtmlEvent = require('../../modules/htmlevent');

module.exports = createCommandEsBinding;

function createCommandEsBinding(SCOPE, NODE, PATH){
    var DOMObject = new node(this);
    DOMObject.expression = this.nodeValue;
    DOMObject._type_ = 'COMMANDNODE-BINDING';
    DOMObject.scopePath = PATH;
    utils.mixin(DOMObject, new EventEmitter());
    var tagName = NODE.tagName.toUpperCase();
    NODE.removeAttribute('es-binding');
    switch ( tagName ){
        case 'INPUT':
            createInputBinding.call(DOMObject, NODE, SCOPE);
            break;
        case 'SELECT':
            createSelectBinding.call(DOMObject, NODE, SCOPE);
            break;
        case 'TEXTAREA':
            createTextAreaBinding.call(DOMObject, NODE, SCOPE);
            break;
    }
    return DOMObject;
}

function createInputBinding(NODE, SCOPE){
    var DOMObject = this;
    var Type = (NODE.type || 'text').toUpperCase();
    var NormalEvents = ['input'];
    var checkEvents = ['change'];
    if ( ['TEXT', 'EMAIL', 'TEL', 'PASSWORD', 'FAX'].indexOf(Type) > -1 ){
        Object.defineProperty(DOMObject, 'value', {
            get: function(){ return this._value_; },
            set: function(value){
                if ( this._value_ != value ){
                    this._value_ = value;
                    NODE.value = value;
                }
            }
        });

        DOMObject.compile2DataBase = function(value){
            SCOPE[DOMObject.expression] = value;
        };

        DOMObject.compile = function($scope){
            return utils.transform(DOMObject.expression, $scope || SCOPE);
        };

        NormalEvents.forEach(function(EventName){
            HtmlEvent(NODE).on(EventName, function(){
                DOMObject.bindingRender = true;
                DOMObject.compile2DataBase(this.value);
                DOMObject.emit(EventName, this);
            });
        });
        DOMObject.value = DOMObject.compile(SCOPE);
    }
    else if ( ['CHECKBOX', 'RADIO'].indexOf(Type) > -1 ){
        Object.defineProperty(DOMObject, 'value', {
            get: function(){ return this._value_; },
            set: function(value){
                if ( this._value_ != value ){
                    var val = NODE.value;
                    if ( val === value + '' ){
                        this._value_ = value;
                        NODE.checked = true;
                    }
                }
            }
        });

        DOMObject.compile2DataBase = function(value){
            SCOPE[DOMObject.expression] = value;
        };

        DOMObject.compile = function($scope){
            return utils.transform(DOMObject.expression, $scope || SCOPE);
        };

        checkEvents.forEach(function(EventName){
            HtmlEvent(NODE).on(EventName, function(){
                DOMObject.bindingRender = true;
                if ( this.checked ){
                    DOMObject.compile2DataBase(this.value);
                }else{
                    DOMObject.compile2DataBase(null);
                }
                DOMObject.emit(EventName, this);
            });
        });

        DOMObject.value = DOMObject.compile(SCOPE);
    }
}

function createTextAreaBinding(NODE, SCOPE){
    var DOMObject = this;
    var NormalEvents = ['input'];

    Object.defineProperty(DOMObject, 'value', {
        get: function(){ return this._value_; },
        set: function(value){
            if ( this._value_ != value ){
                this._value_ = value;
                NODE.value = value
            }
        }
    });

    DOMObject.compile2DataBase = function(value){
        SCOPE[DOMObject.expression] = value;
    };

    DOMObject.compile = function($scope){
        return utils.transform(DOMObject.expression, $scope || SCOPE);
    };

    NormalEvents.forEach(function(EventName){
        HtmlEvent(NODE).on(EventName, function(){
            DOMObject.bindingRender = true;
            DOMObject.compile2DataBase(this.value);
            DOMObject.emit(EventName, this);
        });
    });

    DOMObject.value = DOMObject.compile(SCOPE);
}

function createSelectBinding(NODE, SCOPE){
    var DOMObject = this;
    var NormalEvents = ['change'];
    Object.defineProperty(DOMObject, 'value', {
        get: function(){
            return this._value_;
        },
        set: function(value){
            if ( this._value_ != value ){
                var selectValue = null;
                for ( var i = 0 ; i < NODE.options.length ; i++ ){
                    if ( NODE.options[i].value == value + '' ){
                        NODE.options[i].selected = true;
                        selectValue = value;
                        break;
                    }
                }
                if ( selectValue ){
                    this._value_ = selectValue;
                }
            }
        }
    });

    DOMObject.compile2DataBase = function(value){
        SCOPE[DOMObject.expression] = value;
    };

    DOMObject.compile = function($scope){
        return utils.transform(DOMObject.expression, $scope || SCOPE);
    };

    NormalEvents.forEach(function(EventName){
        HtmlEvent(NODE).on(EventName, function(){
            DOMObject.bindingRender = true;
            DOMObject.compile2DataBase(this.value);
            DOMObject.emit(EventName, this);
        });
    });

    DOMObject.value = DOMObject.compile(SCOPE);
}