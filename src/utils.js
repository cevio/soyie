export var slice = Array.prototype.slice;
export var toString = Object.prototype.toString;
export var REGEXP_TAGSPILTOR = /\{\{([^\}\}]+)\}\}/g;
export var REGEXP_STRING = /(["|'])(.+?)*?\1/g;
export var REGEXP_COMMAND_IN = /([^\s]+?)\sin\s(.+)/i;
export var REGEXP_PARENT = /(\B\$parent\.)+?[a-zA-z_\.\$0-9]+/g;
export var exceptTagNames = ['head', 'script', 'meta', 'link', 'title', 'script', 'hr', 'br'];
export var { configs } = {};
configs = { defaultText: '', commandPrefix: 'so' };

import hashcode from 'hashcode';

export function createNodeCopier(){
    return document.createDocumentFragment();
}

export function createHtmlNode(code){
    var copier = createNodeCopier();
    var start = document.createComment('Fragment Start');
    var end = document.createComment('Fragment End');
    var html = document.createElement('div');
    var nodes = [];
    html.innerHTML = code;
    copier.appendChild(start);
    slice.call(html.childNodes, 0).forEach(node => {
        copier.appendChild(node);
        nodes.push(node);
    });
    copier.appendChild(end);
    var cloneNode = Object.create({});
    Object.defineProperties(cloneNode, {
        childNodes: { value: nodes },
        node: { value: copier },
        start: { value: start },
        end: { value: end }
    });
    html = null;
    return cloneNode;
}

export function type(object, type){
    var _type = toString.call(object).split(' ')[1].replace(/\]$/, '');
    if ( type ){
        return _type == type;
    }else{
        return _type;
    }
}

export function extend(source, target, overwrite){
    for ( var i in target ){
        if ( source[i] ){
            if ( overwrite ){
                source[i] = target[i];
            }
        }else{
            source[i] = target[i];
        }
    }
    return source;
}

export function formatExpression(expression){
    var pools = [];
    expression.split(exports.REGEXP_TAGSPILTOR).forEach((text, index) => {
        var isTextNodeElement = index % 2 === 1;
        if ( isTextNodeElement ){
            pools.push('(' + text + ')');
        }else{
            var ex = text.replace(/\'/g, '\\\'');
            if ( ex.length ){
                pools.push("'" + ex + "'");
            }
        }
    });
    return pools.join(' + ');
}

/**
 * 驼峰编码
 * foo-style-css －> fooStyleCss
 * @param str
 * @returns {XML|*|string|void}
 */
export function enHump(str){
    return str.replace(/\-(\w)/g, function(all, letter){
        return letter.toUpperCase();
    });
}

/**
 * 驼峰解码
 * fooStyleCss -> foo-style-css
 * @returns {string}
 */
export function deHump(str){
    return str.replace(/([A-Z])/g,"-$1").toLowerCase();
}

export var hashCode = hashcode;

export function set(value, scope, expression){
    try{
        var foo = new Function('value', 'scope', 'scope.' + expression + '=value;');
        foo(value, scope);
    }catch(e){
        console.warn('scope.' + expression + '=value;', e);
    }
}

export function get(expression, scope){
    try{
        var foo = new Function('$this', 'with($this){return ' + expression + '}');
        var value = foo(scope);
        return value === undefined || value === null ? this.configs.defaultText : value;
    }catch(e){
        return this.configs.defaultText;
    }
}

export function defineValue(obj, key, val, enumerable){
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    });
}

export function defineIndex(obj, index, foo){
    var temp = obj[index];
    Object.defineProperty(obj, index, {
        get: () => { return temp; },
        set: (val) => {
            var old = temp;
            temp = val;
            typeof foo === 'function' && foo(temp, old);
        }
    });
}