var node = require('./node');
var utils = require('../utils');
var ScopeParent = require('../data-observer/scope-parent');
var likeTexts = 'text,password,tel,color,date,datetime,datetime-local,month,week,time,email,number,range,search,url'.split(',');

var bindings = module.exports = function(DOM, expression, PARENT){
    var DOMObject = new node(DOM, expression, PARENT);
    var bindingtype = (DOM.type || 'NULL').toLowerCase();
    var bindingtagname = DOM.tagName.toUpperCase();
    var type = null;
    DOM.removeAttribute('es-binding');

    switch (bindingtagname){
        case 'INPUT':
            if ( likeTexts.indexOf(bindingtype) > -1 ){ type = 'Text'; }
            else if ( bindingtype === 'radio' ){ type = 'Radio'; }
            else if ( bindingtype === 'checkbox' ){ type = 'Checkbox'; }
            else if ( bindingtype === 'file' ){ type = 'File'; }
            else{ type = 'Common'; }
            break;
        case 'SELECT': type = 'Select'; break;
        case 'TEXTAREA': type = 'Textarea'; break;
        default : type = 'Common';
    }

    bindings[type] && bindings[type](DOMObject);
    return DOMObject;
};

bindings.Textarea = bindings.Text = function(object){
    object.stop = false;
    object.set = function(value){
        if ( this.stop ){ this.stop = false; }
        else{ this.element.value = value; }
    };

    // data 层改变数据方法
    object.element.addEventListener('input', function(){
        object.stop = true;
        var router = object.getRouter();
        utils.set(this.value, ScopeParent.source || {}, router);
    }, false);
};

bindings.Select = function(object){
    object.stop = false;
    object.set = function(value){
        if ( this.stop ){ this.stop = false; }
        else{
            var suc = false, i;
            for ( i = 0 ; i < this.element.options.length ; i++ ){
                if ( this.element.options[i].value == value + '' ){
                    this.element.options[i].selected = true;
                    suc = true;
                    break;
                }
            }
            if ( !suc ){
                for ( i = 0 ; i < this.element.options.length ; i++ ){
                    this.element.options[i].selected = false;
                }
            }
        }
    };

    object.element.addEventListener('change', function(){
        object.stop = true;
        var value = this.value;
        if ( !value ){ value = this.options[this.selectedIndex].value; }
        var router = object.getRouter();
        utils.set(value, ScopeParent.source || {}, router);
    }, false);
};

bindings.Checkbox = function(object){
    object.stop = false;
    object.set = function(value){
        if ( this.stop ){ this.stop = false; }
        else{
            if ( this.element.value == value + '' ){ this.element.checked = true; }
            else{ this.element.checked = false; }
        }
    };

    object.element.addEventListener('change', function(){
        object.stop = true;
        var value = this.value;
        if ( !this.checked ){ value = undefined; }
        var router = object.getRouter();
        utils.set(value, ScopeParent.source || {}, router);
    }, false);
};

bindings.Radio = function(object){
    object.stop = false;
    object.set = function(value){
        if ( this.stop ){ this.stop = false; }
        else{
            if ( this.element.value == value + '' ){ this.element.checked = true; }
            else{ this.element.checked = false; }
        }
    };

    object.element.addEventListener('change', function(){
        object.stop = true;
        var value = this.value;
        if ( !this.checked ){ value = undefined; }
        var router = object.getRouter();
        utils.set(value, ScopeParent.source || {}, router);
    }, false);
};