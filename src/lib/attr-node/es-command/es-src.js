/**
 * Created by evio on 15/8/5.
 */
var node= require('../node');
var utils = require('../../utils');
var EventEmitter = require('events').EventEmitter;
module.exports = createCommandEsSrc;
/**
 * es-src factory.
 * @param SCOPE
 * @param NODE
 * @returns {module.exports|exports}
 * @emample:
 * ``` javascript
        // x = DOMAttributeObject;
        var x = mods(attr('a'), {
            a:'https://www.baidu.com/img/bd_logo1.png'
        }, document.getElementById('a'));
        x.on('load', function(node){
            console.log('ok', node);
        });
        x.on('error', function(node){
            console.log('error', node);
        });
        x.on('pending', function(node){
            console.log('pending', node);
        });
        setTimeout(function(){
            x.value = '_blank';
            setTimeout(function(){
                x.value = 'http://webmap2.map.bdstatic.com/wolfman/static/common/images/retina/category-icon_a587aee.png'
            }, 2000);
        }, 1000);
 * ```
 */
function createCommandEsSrc(SCOPE, NODE, PATH){
    var DOMObject = new node(this);
    utils.mixin(DOMObject, new EventEmitter());

    DOMObject.expression = this.nodeValue;
    DOMObject._type_ = 'COMMANDNODE-SRC';
    DOMObject.scopePath = PATH;

    DOMObject.on('error', function(dom, src){
        console.log('image url:[' + src + '] catch error on DOM[', dom, ']');
    });

    Object.defineProperty(DOMObject, 'value', {
        get: function(){ return this._value_; },
        set: function(value){
            this._value_ = value;

            utils.miss(function(){ DOMObject.emit('pending', NODE) });

            NODE.onload = function(){
                utils.miss(function(){
                    DOMObject.emit('load', NODE, value);
                });
            };

            NODE.onerror = function(){
                utils.miss(function(){
                    DOMObject.emit('error', NODE, value);
                }, this);
            };

            NODE.src = value;
        }
    });

    DOMObject._createCompiler();
    NODE.removeAttribute('es-src');

    if ( SCOPE ){
        DOMObject.scope = SCOPE;
        DOMObject.value = DOMObject.compile(SCOPE);
    }

    return DOMObject;
}