import * as utils from '../utils';
import node from '../use/node-object';
var likeTexts = 'text,password,tel,color,date,datetime,datetime-local,month,week,time,email,number,range,search,url'.split(',');
var bindings = {};

bindings.Textarea = bindings.Text = function(object){
    object.stop = false;
    object.set = function(value){
        if ( this.stop ){ this.stop = false; }
        else{ this.node.value = value; }
    };

    // data 层改变数据方法
    object.node.addEventListener('input', function(){
        object.stop = true;
        utils.set(this.value, object.scope, object.expression);
    }, false);
};

bindings.Select = function(object){
    object.stop = false;
    object.set = function(value){
        if ( this.stop ){ this.stop = false; }
        else{
            var suc = false, i;
            for ( i = 0 ; i < this.node.options.length ; i++ ){
                if ( this.node.options[i].value == value + '' ){
                    this.node.options[i].selected = true;
                    suc = true;
                    break;
                }
            }
            if ( !suc ){
                for ( i = 0 ; i < this.node.options.length ; i++ ){
                    this.node.options[i].selected = false;
                }
            }
        }
    };

    object.node.addEventListener('change', function(){
        object.stop = true;
        var value = this.value;
        if ( !value ){ value = this.options[this.selectedIndex].value; }
        utils.set(value, object.scope, object.expression);
    }, false);
};

bindings.Checkbox = function(object){
    object.stop = false;
    object.set = function(value){
        if ( this.stop ){ this.stop = false; }
        else{
            if ( this.node.value == value + '' ){ this.node.checked = true; }
            else{ this.node.checked = false; }
        }
    };

    var uncheckedValue;
    if ( object.node.hasAttribute('so-unchecked') ){
        uncheckedValue = object.node.getAttribute('so-unchecked');
        object.node.removeAttribute('so-unchecked');
    }

    object.node.addEventListener('change', function(){
        object.stop = true;
        var value = this.value;
        if ( !this.checked ){ value = uncheckedValue; }
        utils.set(value, object.scope, object.expression);
    }, false);
};

bindings.Radio = function(object){
    object.stop = false;
    object.set = function(value){
        if ( this.stop ){ this.stop = false; }
        else{
            if ( this.node.value == value + '' ){ this.node.checked = true; }
            else{ this.node.checked = false; }
        }
    };

    object.node.addEventListener('change', function(){
        object.stop = true;
        var value = this.value;
        if ( !this.checked ){ value = undefined; }
        utils.set(value, object.scope, object.expression);
    }, false);
};

export default (attr, DOM, vm) => {
    var expression = attr.nodeValue;
    var object = new node(DOM, expression);
    var bindingtype = (DOM.type || 'NULL').toLowerCase();
    var bindingtagname = DOM.tagName.toUpperCase();
    var type = null;
    DOM.removeAttribute('so-binding');
    object.parent = vm;

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

    bindings[type] && bindings[type](object);
    return object;
}