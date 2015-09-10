(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cmd = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var node = require('./node');
var utils = require('../utils');
var ScopeParent = require('../data-observer/scope-parent');
var likeTexts = 'text,password,tel,color,date,datetime,datetime-local,month,week,time,email,number,range,search,url'.split(',');

var bindings = module.exports = function(DOM, expression, DEEP){
    var DOMObject = new node(DOM, expression, DEEP);
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
        utils.set(this.value, ScopeParent.source || {}, object.getRouter());
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
        utils.set(value, ScopeParent.source || {}, object.getRouter());
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
        utils.set(value, ScopeParent.source || {}, object.getRouter());
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
        utils.set(value, ScopeParent.source || {}, object.getRouter());
    }, false);
};
},{"../data-observer/scope-parent":7,"../utils":17,"./node":5}],2:[function(require,module,exports){
var node = require('./node');
var utils = require('../utils');
var ScopeParent = require('../data-observer/scope-parent');

module.exports = function(DOM, expression, DEEP){
    var DOMObject = new node(DOM, expression, DEEP);
    DOMObject.foo = function(){};
    DOMObject.set = function(){
        this.foo = makeFunction(this.expression);
        return this.foo.toString();
    };
    DOMObject.get = function(){
        var fn = makeFunction(this.expression);
        return fn.toString();
    };
    DOMObject.element.addEventListener('click', function(){
        if ( typeof DOMObject.foo === 'function' ){
            var scope = DOMObject.gruntScope(ScopeParent.source || {}, DOMObject.index, DOMObject.alias);
            DOMObject.foo.call(this, scope);
        }
    }, false);
    DOM.removeAttribute('es-click');
    return DOMObject;
};

function makeFunction(expression){
    return new Function('scope', ';with(scope){\n' + expression + '\n};')
}
},{"../data-observer/scope-parent":7,"../utils":17,"./node":5}],3:[function(require,module,exports){
var node = require('./node');
var utils = require('../utils');
module.exports = function(DOM, expression, DEEP){
    expression = utils.formatExpression(expression);
    var DOMObject = new node(DOM, expression, DEEP);
    DOMObject.set = function(value){
        this.element.innerHTML = value;
    };
    DOM.removeAttribute('es-html');
    return DOMObject;
};
},{"../utils":17,"./node":5}],4:[function(require,module,exports){
var node = require('./node');
var utils = require('../utils');
module.exports = function(DOM, expression, DEEP){
    expression = utils.formatExpression(expression);
    var DOMObject = new node(DOM, expression, DEEP);
    DOMObject.set = function(value){
        this.element.src = value;
    };
    DOM.removeAttribute('es-src');
    return DOMObject;
};
},{"../utils":17,"./node":5}],5:[function(require,module,exports){
var utils = require('../utils');

var node = module.exports = function(DOM, expression, DEEP){
    this.deep = DEEP;
    this.expression = expression;
    this.element = DOM;
    this.index = null;
    this.alias = null;
};

Object.defineProperty(node.prototype, 'value', {
    set: function( value ){
        value = this.set(value) || value;
        this.oldValue = value;
    }
});

node.prototype.gruntScope = function(scope, index, alias){
    var data = utils.get(this.deep.locals, scope);
    var _scope = data;

    if ( alias !== undefined && alias !== null ){
        _scope = {};
        _scope[alias] = _scope['$this'] = data;
        _scope['$index'] = index;
    }else{
        if ( index !== undefined && index !== null ){
            _scope['$index'] = index;
        }
    }
    _scope['$parent'] = this.makeParentScope(scope);

    return _scope;
};

node.prototype.makeParentScope = function(scope){
    var data = {};
    var loops = function(vm, dat){
        if ( vm && vm.parent ){
            utils.mixin(dat, utils.get(vm.pather, scope));
            vm = vm.parent;
            if ( vm.parent ){
                dat.$parent = {};
                loops(vm, dat.$parent);
            }
        }
    };
    loops(this.deep.parent, data);
    return data;
};

node.prototype.get = function(scope, index, alias){
    return utils.value(this.expression, this.gruntScope(scope, index, alias));
};

node.prototype.update = node.prototype.render = function(scope, index, alias){
    if ( utils.type(index, 'Object') ){
        index =this.index;
        alias = this.alias;
    }else{
        if ( index ){ this.index = index; }
        else{ index = this.index; }
        if ( alias ){ this.alias = alias; }
        else{alias = this.alias;}
    }

    var value = this.get(scope, index, alias);
    if ( this.oldValue !== value ){
        this.value = value;
    }
};

node.prototype.getRouter = function(){
    var router = this.deep.locals;
    var that = this;
    if ( /\$parent/.test(this.expression) ){
        var splitor = this.expression.split(/\$parent\./g);
        var len = splitor.length - 1;
        var d = this.deep.parent;
        for ( var i = 0 ; i < len ; i++ ){
            if ( d.parent ){
                d = d.parent;
            }else{
                break;
            }
        }
        router = d.pather;
        splitor.slice(len).forEach(function(key){
            router += "['" + key + "']";
        });
        return router;
    }else{
        this.expression.split('.').forEach(function(key, index){
            if ( that.alias && index === 0 ){
                return;
            }else{
                router += "['" + key + "']";
            }
        });
        return router;
    }
};
},{"../utils":17}],6:[function(require,module,exports){
(function (global){
/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(global) {
    'use strict';

    var testingExposeCycleCount = global.testingExposeCycleCount;

    // Detect and do basic sanity checking on Object/Array.observe.
    function detectObjectObserve() {
        if (typeof Object.observe !== 'function' ||
            typeof Array.observe !== 'function') {
            return false;
        }

        var records = [];

        function callback(recs) {
            records = recs;
        }

        var test = {};
        var arr = [];
        Object.observe(test, callback);
        Array.observe(arr, callback);
        test.id = 1;
        test.id = 2;
        delete test.id;
        arr.push(1, 2);
        arr.length = 0;

        Object.deliverChangeRecords(callback);
        if (records.length !== 5)
            return false;

        if (records[0].type != 'add' ||
            records[1].type != 'update' ||
            records[2].type != 'delete' ||
            records[3].type != 'splice' ||
            records[4].type != 'splice') {
            return false;
        }

        Object.unobserve(test, callback);
        Array.unobserve(arr, callback);

        return true;
    }

    var hasObserve = detectObjectObserve();

    function detectEval() {
        // Don't test for eval if we're running in a Chrome App environment.
        // We check for APIs set that only exist in a Chrome App context.
        if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
            return false;
        }

        // Firefox OS Apps do not allow eval. This feature detection is very hacky
        // but even if some other platform adds support for this function this code
        // will continue to work.
        if (typeof navigator != 'undefined' && navigator.getDeviceStorage) {
            return false;
        }

        try {
            var f = new Function('', 'return true;');
            return f();
        } catch (ex) {
            return false;
        }
    }

    var hasEval = detectEval();

    function isIndex(s) {
        return +s === s >>> 0 && s !== '';
    }

    function toNumber(s) {
        return +s;
    }

    function isObject(obj) {
        return obj === Object(obj);
    }

    var numberIsNaN = global.Number.isNaN || function(value) {
            return typeof value === 'number' && global.isNaN(value);
        };

    function areSameValue(left, right) {
        if (left === right)
            return left !== 0 || 1 / left === 1 / right;
        if (numberIsNaN(left) && numberIsNaN(right))
            return true;

        return left !== left && right !== right;
    }

    var createObject = ('__proto__' in {}) ?
        function(obj) { return obj; } :
        function(obj) {
            var proto = obj.__proto__;
            if (!proto)
                return obj;
            var newObject = Object.create(proto);
            Object.getOwnPropertyNames(obj).forEach(function(name) {
                Object.defineProperty(newObject, name,
                    Object.getOwnPropertyDescriptor(obj, name));
            });
            return newObject;
        };

    var identStart = '[\$_a-zA-Z]';
    var identPart = '[\$_a-zA-Z0-9]';
    var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');

    function getPathCharType(char) {
        if (char === undefined)
            return 'eof';

        var code = char.charCodeAt(0);

        switch(code) {
            case 0x5B: // [
            case 0x5D: // ]
            case 0x2E: // .
            case 0x22: // "
            case 0x27: // '
            case 0x30: // 0
                return char;

            case 0x5F: // _
            case 0x24: // $
                return 'ident';

            case 0x20: // Space
            case 0x09: // Tab
            case 0x0A: // Newline
            case 0x0D: // Return
            case 0xA0:  // No-break space
            case 0xFEFF:  // Byte Order Mark
            case 0x2028:  // Line Separator
            case 0x2029:  // Paragraph Separator
                return 'ws';
        }

        // a-z, A-Z
        if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
            return 'ident';

        // 1-9
        if (0x31 <= code && code <= 0x39)
            return 'number';

        return 'else';
    }

    var pathStateMachine = {
        'beforePath': {
            'ws': ['beforePath'],
            'ident': ['inIdent', 'append'],
            '[': ['beforeElement'],
            'eof': ['afterPath']
        },

        'inPath': {
            'ws': ['inPath'],
            '.': ['beforeIdent'],
            '[': ['beforeElement'],
            'eof': ['afterPath']
        },

        'beforeIdent': {
            'ws': ['beforeIdent'],
            'ident': ['inIdent', 'append']
        },

        'inIdent': {
            'ident': ['inIdent', 'append'],
            '0': ['inIdent', 'append'],
            'number': ['inIdent', 'append'],
            'ws': ['inPath', 'push'],
            '.': ['beforeIdent', 'push'],
            '[': ['beforeElement', 'push'],
            'eof': ['afterPath', 'push']
        },

        'beforeElement': {
            'ws': ['beforeElement'],
            '0': ['afterZero', 'append'],
            'number': ['inIndex', 'append'],
            "'": ['inSingleQuote', 'append', ''],
            '"': ['inDoubleQuote', 'append', '']
        },

        'afterZero': {
            'ws': ['afterElement', 'push'],
            ']': ['inPath', 'push']
        },

        'inIndex': {
            '0': ['inIndex', 'append'],
            'number': ['inIndex', 'append'],
            'ws': ['afterElement'],
            ']': ['inPath', 'push']
        },

        'inSingleQuote': {
            "'": ['afterElement'],
            'eof': ['error'],
            'else': ['inSingleQuote', 'append']
        },

        'inDoubleQuote': {
            '"': ['afterElement'],
            'eof': ['error'],
            'else': ['inDoubleQuote', 'append']
        },

        'afterElement': {
            'ws': ['afterElement'],
            ']': ['inPath', 'push']
        }
    };

    function noop() {}

    function parsePath(path) {
        var keys = [];
        var index = -1;
        var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';

        var actions = {
            push: function() {
                if (key === undefined)
                    return;

                keys.push(key);
                key = undefined;
            },

            append: function() {
                if (key === undefined)
                    key = newChar;
                else
                    key += newChar;
            }
        };

        function maybeUnescapeQuote() {
            if (index >= path.length)
                return;

            var nextChar = path[index + 1];
            if ((mode == 'inSingleQuote' && nextChar == "'") ||
                (mode == 'inDoubleQuote' && nextChar == '"')) {
                index++;
                newChar = nextChar;
                actions.append();
                return true;
            }
        }

        while (mode) {
            index++;
            c = path[index];

            if (c == '\\' && maybeUnescapeQuote(mode))
                continue;

            type = getPathCharType(c);
            typeMap = pathStateMachine[mode];
            transition = typeMap[type] || typeMap['else'] || 'error';

            if (transition == 'error')
                return; // parse error;

            mode = transition[0];
            action = actions[transition[1]] || noop;
            newChar = transition[2] === undefined ? c : transition[2];
            action();

            if (mode === 'afterPath') {
                return keys;
            }
        }

        return; // parse error
    }

    function isIdent(s) {
        return identRegExp.test(s);
    }

    var constructorIsPrivate = {};

    function Path(parts, privateToken) {
        if (privateToken !== constructorIsPrivate)
            throw Error('Use Path.get to retrieve path objects');

        for (var i = 0; i < parts.length; i++) {
            this.push(String(parts[i]));
        }

        if (hasEval && this.length) {
            this.getValueFrom = this.compiledGetValueFromFn();
        }
    }

    // TODO(rafaelw): Make simple LRU cache
    var pathCache = {};

    function getPath(pathString) {
        if (pathString instanceof Path)
            return pathString;

        if (pathString == null || pathString.length == 0)
            pathString = '';

        if (typeof pathString != 'string') {
            if (isIndex(pathString.length)) {
                // Constructed with array-like (pre-parsed) keys
                return new Path(pathString, constructorIsPrivate);
            }

            pathString = String(pathString);
        }

        var path = pathCache[pathString];
        if (path)
            return path;

        var parts = parsePath(pathString);
        if (!parts)
            return invalidPath;

        path = new Path(parts, constructorIsPrivate);
        pathCache[pathString] = path;
        return path;
    }

    Path.get = getPath;

    function formatAccessor(key) {
        if (isIndex(key)) {
            return '[' + key + ']';
        } else {
            return '["' + key.replace(/"/g, '\\"') + '"]';
        }
    }

    Path.prototype = createObject({
        __proto__: [],
        valid: true,

        toString: function() {
            var pathString = '';
            for (var i = 0; i < this.length; i++) {
                var key = this[i];
                if (isIdent(key)) {
                    pathString += i ? '.' + key : key;
                } else {
                    pathString += formatAccessor(key);
                }
            }

            return pathString;
        },

        getValueFrom: function(obj, defaultValue) {
            for (var i = 0; i < this.length; i++) {
                var key = this[i];
                if (obj == null || !(key in obj))
                    return defaultValue;
                obj = obj[key];
            }
            return obj;
        },

        iterateObjects: function(obj, observe) {
            for (var i = 0; i < this.length; i++) {
                if (i)
                    obj = obj[this[i - 1]];
                if (!isObject(obj))
                    return;
                observe(obj, this[i]);
            }
        },

        compiledGetValueFromFn: function() {
            var str = '';
            var pathString = 'obj';
            str += 'if (obj != null';
            var i = 0;
            var key;
            for (; i < (this.length - 1); i++) {
                key = this[i];
                pathString += isIdent(key) ? '.' + key : formatAccessor(key);
                str += ' &&\n    ' + pathString + ' != null';
            }

            key = this[i];
            var keyIsIdent = isIdent(key);
            var keyForInOperator = keyIsIdent ? '"' + key.replace(/"/g, '\\"') + '"' : key;
            str += ' &&\n    ' + keyForInOperator + ' in ' + pathString + ')\n';
            pathString += keyIsIdent ? '.' + key : formatAccessor(key);

            str += '  return ' + pathString + ';\nelse\n  return defaultValue;';
            return new Function('obj', 'defaultValue', str);
        },

        setValueFrom: function(obj, value) {
            if (!this.length)
                return false;

            for (var i = 0; i < this.length - 1; i++) {
                if (!isObject(obj))
                    return false;
                obj = obj[this[i]];
            }

            if (!isObject(obj))
                return false;

            obj[this[i]] = value;
            return true;
        }
    });

    var invalidPath = new Path('', constructorIsPrivate);
    invalidPath.valid = false;
    invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};

    var MAX_DIRTY_CHECK_CYCLES = 1000;

    function dirtyCheck(observer) {
        var cycles = 0;
        while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
            cycles++;
        }
        if (testingExposeCycleCount)
            global.dirtyCheckCycleCount = cycles;

        return cycles > 0;
    }

    function objectIsEmpty(object) {
        for (var prop in object)
            return false;
        return true;
    }

    function diffIsEmpty(diff) {
        return objectIsEmpty(diff.added) &&
            objectIsEmpty(diff.removed) &&
            objectIsEmpty(diff.changed);
    }

    function diffObjectFromOldObject(object, oldObject) {
        var added = {};
        var removed = {};
        var changed = {};
        var prop;

        for (prop in oldObject) {
            var newValue = object[prop];

            if (newValue !== undefined && newValue === oldObject[prop])
                continue;

            if (!(prop in object)) {
                removed[prop] = undefined;
                continue;
            }

            if (newValue !== oldObject[prop])
                changed[prop] = newValue;
        }

        for (prop in object) {
            if (prop in oldObject)
                continue;

            added[prop] = object[prop];
        }

        if (Array.isArray(object) && object.length !== oldObject.length)
            changed.length = object.length;

        return {
            added: added,
            removed: removed,
            changed: changed
        };
    }

    var eomTasks = [];
    function runEOMTasks() {
        if (!eomTasks.length)
            return false;

        for (var i = 0; i < eomTasks.length; i++) {
            eomTasks[i]();
        }
        eomTasks.length = 0;
        return true;
    }

    var runEOM = hasObserve ? (function(){
        return function(fn) {
            return Promise.resolve().then(fn);
        };
    })() :
        (function() {
            return function(fn) {
                eomTasks.push(fn);
            };
        })();

    var observedObjectCache = [];

    function newObservedObject() {
        var observer;
        var object;
        var discardRecords = false;
        var first = true;

        function callback(records) {
            if (observer && observer.state_ === OPENED && !discardRecords)
                observer.check_(records);
        }

        return {
            open: function(obs) {
                if (observer)
                    throw Error('ObservedObject in use');

                if (!first)
                    Object.deliverChangeRecords(callback);

                observer = obs;
                first = false;
            },
            observe: function(obj, arrayObserve) {
                object = obj;
                if (arrayObserve)
                    Array.observe(object, callback);
                else
                    Object.observe(object, callback);
            },
            deliver: function(discard) {
                discardRecords = discard;
                Object.deliverChangeRecords(callback);
                discardRecords = false;
            },
            close: function() {
                observer = undefined;
                Object.unobserve(object, callback);
                observedObjectCache.push(this);
            }
        };
    }

    /*
     * The observedSet abstraction is a perf optimization which reduces the total
     * number of Object.observe observations of a set of objects. The idea is that
     * groups of Observers will have some object dependencies in common and this
     * observed set ensures that each object in the transitive closure of
     * dependencies is only observed once. The observedSet acts as a write barrier
     * such that whenever any change comes through, all Observers are checked for
     * changed values.
     *
     * Note that this optimization is explicitly moving work from setup-time to
     * change-time.
     *
     * TODO(rafaelw): Implement "garbage collection". In order to move work off
     * the critical path, when Observers are closed, their observed objects are
     * not Object.unobserve(d). As a result, it's possible that if the observedSet
     * is kept open, but some Observers have been closed, it could cause "leaks"
     * (prevent otherwise collectable objects from being collected). At some
     * point, we should implement incremental "gc" which keeps a list of
     * observedSets which may need clean-up and does small amounts of cleanup on a
     * timeout until all is clean.
     */

    function getObservedObject(observer, object, arrayObserve) {
        var dir = observedObjectCache.pop() || newObservedObject();
        dir.open(observer);
        dir.observe(object, arrayObserve);
        return dir;
    }

    var observedSetCache = [];

    function newObservedSet() {
        var observerCount = 0;
        var observers = [];
        var objects = [];
        var rootObj;
        var rootObjProps;

        function observe(obj, prop) {
            if (!obj)
                return;

            if (obj === rootObj)
                rootObjProps[prop] = true;

            if (objects.indexOf(obj) < 0) {
                objects.push(obj);
                Object.observe(obj, callback);
            }

            observe(Object.getPrototypeOf(obj), prop);
        }

        function allRootObjNonObservedProps(recs) {
            for (var i = 0; i < recs.length; i++) {
                var rec = recs[i];
                if (rec.object !== rootObj ||
                    rootObjProps[rec.name] ||
                    rec.type === 'setPrototype') {
                    return false;
                }
            }
            return true;
        }

        function callback(recs) {
            if (allRootObjNonObservedProps(recs))
                return;

            var i, observer;
            for (i = 0; i < observers.length; i++) {
                observer = observers[i];
                if (observer.state_ == OPENED) {
                    observer.iterateObjects_(observe);
                }
            }

            for (i = 0; i < observers.length; i++) {
                observer = observers[i];
                if (observer.state_ == OPENED) {
                    observer.check_();
                }
            }
        }

        var record = {
            objects: objects,
            get rootObject() { return rootObj; },
            set rootObject(value) {
                rootObj = value;
                rootObjProps = {};
            },
            open: function(obs, object) {
                observers.push(obs);
                observerCount++;
                obs.iterateObjects_(observe);
            },
            close: function(obs) {
                observerCount--;
                if (observerCount > 0) {
                    return;
                }

                for (var i = 0; i < objects.length; i++) {
                    Object.unobserve(objects[i], callback);
                    Observer.unobservedCount++;
                }

                observers.length = 0;
                objects.length = 0;
                rootObj = undefined;
                rootObjProps = undefined;
                observedSetCache.push(this);
                if (lastObservedSet === this)
                    lastObservedSet = null;
            },
        };

        return record;
    }

    var lastObservedSet;

    function getObservedSet(observer, obj) {
        if (!lastObservedSet || lastObservedSet.rootObject !== obj) {
            lastObservedSet = observedSetCache.pop() || newObservedSet();
            lastObservedSet.rootObject = obj;
        }
        lastObservedSet.open(observer, obj);
        return lastObservedSet;
    }

    var UNOPENED = 0;
    var OPENED = 1;
    var CLOSED = 2;
    var RESETTING = 3;

    var nextObserverId = 1;

    function Observer() {
        this.state_ = UNOPENED;
        this.callback_ = undefined;
        this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
        this.directObserver_ = undefined;
        this.value_ = undefined;
        this.id_ = nextObserverId++;
    }

    Observer.prototype = {
        open: function(callback, target) {
            if (this.state_ != UNOPENED)
                throw Error('Observer has already been opened.');

            addToAll(this);
            this.callback_ = callback;
            this.target_ = target;
            this.connect_();
            this.state_ = OPENED;
            return this.value_;
        },

        close: function() {
            if (this.state_ != OPENED)
                return;

            removeFromAll(this);
            this.disconnect_();
            this.value_ = undefined;
            this.callback_ = undefined;
            this.target_ = undefined;
            this.state_ = CLOSED;
        },

        deliver: function() {
            if (this.state_ != OPENED)
                return;

            dirtyCheck(this);
        },

        report_: function(changes) {
            try {
                this.callback_.apply(this.target_, changes);
            } catch (ex) {
                Observer._errorThrownDuringCallback = true;
                console.error('Exception caught during observer callback: ' +
                    (ex.stack || ex));
            }
        },

        discardChanges: function() {
            this.check_(undefined, true);
            return this.value_;
        }
    };

    var collectObservers = !hasObserve;
    var allObservers;
    Observer._allObserversCount = 0;

    if (collectObservers) {
        allObservers = [];
    }

    function addToAll(observer) {
        Observer._allObserversCount++;
        if (!collectObservers)
            return;

        allObservers.push(observer);
    }

    function removeFromAll(observer) {
        Observer._allObserversCount--;
    }

    var runningMicrotaskCheckpoint = false;

    global.Platform = global.Platform || {};

    global.Platform.performMicrotaskCheckpoint = function() {
        if (runningMicrotaskCheckpoint)
            return;

        if (!collectObservers)
            return;

        runningMicrotaskCheckpoint = true;

        var cycles = 0;
        var anyChanged, toCheck;

        do {
            cycles++;
            toCheck = allObservers;
            allObservers = [];
            anyChanged = false;

            for (var i = 0; i < toCheck.length; i++) {
                var observer = toCheck[i];
                if (observer.state_ != OPENED)
                    continue;

                if (observer.check_())
                    anyChanged = true;

                allObservers.push(observer);
            }
            if (runEOMTasks())
                anyChanged = true;
        } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

        if (testingExposeCycleCount)
            global.dirtyCheckCycleCount = cycles;

        runningMicrotaskCheckpoint = false;
    };

    if (collectObservers) {
        global.Platform.clearObservers = function() {
            allObservers = [];
        };
    }

    function ObjectObserver(object) {
        Observer.call(this);
        this.value_ = object;
        this.oldObject_ = undefined;
    }

    ObjectObserver.prototype = createObject({
        __proto__: Observer.prototype,

        arrayObserve: false,

        connect_: function(callback, target) {
            if (hasObserve) {
                this.directObserver_ = getObservedObject(this, this.value_,
                    this.arrayObserve);
            } else {
                this.oldObject_ = this.copyObject(this.value_);
            }

        },

        copyObject: function(object) {
            var copy = Array.isArray(object) ? [] : {};
            for (var prop in object) {
                copy[prop] = object[prop];
            }
            if (Array.isArray(object))
                copy.length = object.length;
            return copy;
        },

        check_: function(changeRecords, skipChanges) {
            var diff;
            var oldValues;
            if (hasObserve) {
                if (!changeRecords)
                    return false;

                oldValues = {};
                diff = diffObjectFromChangeRecords(this.value_, changeRecords,
                    oldValues);
            } else {
                oldValues = this.oldObject_;
                diff = diffObjectFromOldObject(this.value_, this.oldObject_);
            }

            if (diffIsEmpty(diff))
                return false;

            if (!hasObserve)
                this.oldObject_ = this.copyObject(this.value_);

            this.report_([
                diff.added || {},
                diff.removed || {},
                diff.changed || {},
                function(property) {
                    return oldValues[property];
                }
            ]);

            return true;
        },

        disconnect_: function() {
            if (hasObserve) {
                this.directObserver_.close();
                this.directObserver_ = undefined;
            } else {
                this.oldObject_ = undefined;
            }
        },

        deliver: function() {
            if (this.state_ != OPENED)
                return;

            if (hasObserve)
                this.directObserver_.deliver(false);
            else
                dirtyCheck(this);
        },

        discardChanges: function() {
            if (this.directObserver_)
                this.directObserver_.deliver(true);
            else
                this.oldObject_ = this.copyObject(this.value_);

            return this.value_;
        }
    });

    function ArrayObserver(array) {
        if (!Array.isArray(array))
            throw Error('Provided object is not an Array');
        ObjectObserver.call(this, array);
    }

    ArrayObserver.prototype = createObject({

        __proto__: ObjectObserver.prototype,

        arrayObserve: true,

        copyObject: function(arr) {
            return arr.slice();
        },

        check_: function(changeRecords) {
            var splices;
            if (hasObserve) {
                if (!changeRecords)
                    return false;
                splices = projectArraySplices(this.value_, changeRecords);
            } else {
                splices = calcSplices(this.value_, 0, this.value_.length,
                    this.oldObject_, 0, this.oldObject_.length);
            }

            if (!splices || !splices.length)
                return false;

            if (!hasObserve)
                this.oldObject_ = this.copyObject(this.value_);

            this.report_([splices]);
            return true;
        }
    });

    ArrayObserver.applySplices = function(previous, current, splices) {
        splices.forEach(function(splice) {
            var spliceArgs = [splice.index, splice.removed.length];
            var addIndex = splice.index;
            while (addIndex < splice.index + splice.addedCount) {
                spliceArgs.push(current[addIndex]);
                addIndex++;
            }

            Array.prototype.splice.apply(previous, spliceArgs);
        });
    };

    function PathObserver(object, path, defaultValue) {
        Observer.call(this);

        this.object_ = object;
        this.path_ = getPath(path);
        this.defaultValue_ = defaultValue;
        this.directObserver_ = undefined;
    }

    PathObserver.prototype = createObject({
        __proto__: Observer.prototype,

        get path() {
            return this.path_;
        },

        connect_: function() {
            if (hasObserve)
                this.directObserver_ = getObservedSet(this, this.object_);

            this.check_(undefined, true);
        },

        disconnect_: function() {
            this.value_ = undefined;

            if (this.directObserver_) {
                this.directObserver_.close(this);
                this.directObserver_ = undefined;
            }
        },

        iterateObjects_: function(observe) {
            this.path_.iterateObjects(this.object_, observe);
        },

        check_: function(changeRecords, skipChanges) {
            var oldValue = this.value_;
            this.value_ = this.path_.getValueFrom(this.object_, this.defaultValue_);
            if (skipChanges || areSameValue(this.value_, oldValue))
                return false;

            this.report_([this.value_, oldValue, this]);
            return true;
        },

        setValue: function(newValue) {
            if (this.path_)
                this.path_.setValueFrom(this.object_, newValue);
        }
    });

    function CompoundObserver(reportChangesOnOpen) {
        Observer.call(this);

        this.reportChangesOnOpen_ = reportChangesOnOpen;
        this.value_ = [];
        this.directObserver_ = undefined;
        this.observed_ = [];
    }

    var observerSentinel = {};

    CompoundObserver.prototype = createObject({
        __proto__: Observer.prototype,

        connect_: function() {
            if (hasObserve) {
                var object;
                var needsDirectObserver = false;
                for (var i = 0; i < this.observed_.length; i += 2) {
                    object = this.observed_[i];
                    if (object !== observerSentinel) {
                        needsDirectObserver = true;
                        break;
                    }
                }

                if (needsDirectObserver)
                    this.directObserver_ = getObservedSet(this, object);
            }

            this.check_(undefined, !this.reportChangesOnOpen_);
        },

        disconnect_: function() {
            for (var i = 0; i < this.observed_.length; i += 2) {
                if (this.observed_[i] === observerSentinel)
                    this.observed_[i + 1].close();
            }
            this.observed_.length = 0;
            this.value_.length = 0;

            if (this.directObserver_) {
                this.directObserver_.close(this);
                this.directObserver_ = undefined;
            }
        },

        addPath: function(object, path) {
            if (this.state_ != UNOPENED && this.state_ != RESETTING)
                throw Error('Cannot add paths once started.');

            path = getPath(path);
            this.observed_.push(object, path);
            if (!this.reportChangesOnOpen_)
                return;
            var index = this.observed_.length / 2 - 1;
            this.value_[index] = path.getValueFrom(object);
        },

        addObserver: function(observer) {
            if (this.state_ != UNOPENED && this.state_ != RESETTING)
                throw Error('Cannot add observers once started.');

            this.observed_.push(observerSentinel, observer);
            if (!this.reportChangesOnOpen_)
                return;
            var index = this.observed_.length / 2 - 1;
            this.value_[index] = observer.open(this.deliver, this);
        },

        startReset: function() {
            if (this.state_ != OPENED)
                throw Error('Can only reset while open');

            this.state_ = RESETTING;
            this.disconnect_();
        },

        finishReset: function() {
            if (this.state_ != RESETTING)
                throw Error('Can only finishReset after startReset');
            this.state_ = OPENED;
            this.connect_();

            return this.value_;
        },

        iterateObjects_: function(observe) {
            var object;
            for (var i = 0; i < this.observed_.length; i += 2) {
                object = this.observed_[i];
                if (object !== observerSentinel)
                    this.observed_[i + 1].iterateObjects(object, observe);
            }
        },

        check_: function(changeRecords, skipChanges) {
            var oldValues;
            for (var i = 0; i < this.observed_.length; i += 2) {
                var object = this.observed_[i];
                var path = this.observed_[i+1];
                var value;
                if (object === observerSentinel) {
                    var observable = path;
                    value = this.state_ === UNOPENED ?
                        observable.open(this.deliver, this) :
                        observable.discardChanges();
                } else {
                    value = path.getValueFrom(object);
                }

                if (skipChanges) {
                    this.value_[i / 2] = value;
                    continue;
                }

                if (areSameValue(value, this.value_[i / 2]))
                    continue;

                oldValues = oldValues || [];
                oldValues[i / 2] = this.value_[i / 2];
                this.value_[i / 2] = value;
            }

            if (!oldValues)
                return false;

            // TODO(rafaelw): Having observed_ as the third callback arg here is
            // pretty lame API. Fix.
            this.report_([this.value_, oldValues, this.observed_]);
            return true;
        }
    });

    function identFn(value) { return value; }

    function ObserverTransform(observable, getValueFn, setValueFn,
                               dontPassThroughSet) {
        this.callback_ = undefined;
        this.target_ = undefined;
        this.value_ = undefined;
        this.observable_ = observable;
        this.getValueFn_ = getValueFn || identFn;
        this.setValueFn_ = setValueFn || identFn;
        // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
        // at the moment because of a bug in it's dependency tracking.
        this.dontPassThroughSet_ = dontPassThroughSet;
    }

    ObserverTransform.prototype = {
        open: function(callback, target) {
            this.callback_ = callback;
            this.target_ = target;
            this.value_ =
                this.getValueFn_(this.observable_.open(this.observedCallback_, this));
            return this.value_;
        },

        observedCallback_: function(value) {
            value = this.getValueFn_(value);
            if (areSameValue(value, this.value_))
                return;
            var oldValue = this.value_;
            this.value_ = value;
            this.callback_.call(this.target_, this.value_, oldValue);
        },

        discardChanges: function() {
            this.value_ = this.getValueFn_(this.observable_.discardChanges());
            return this.value_;
        },

        deliver: function() {
            return this.observable_.deliver();
        },

        setValue: function(value) {
            value = this.setValueFn_(value);
            if (!this.dontPassThroughSet_ && this.observable_.setValue)
                return this.observable_.setValue(value);
        },

        close: function() {
            if (this.observable_)
                this.observable_.close();
            this.callback_ = undefined;
            this.target_ = undefined;
            this.observable_ = undefined;
            this.value_ = undefined;
            this.getValueFn_ = undefined;
            this.setValueFn_ = undefined;
        }
    };

    var expectedRecordTypes = {
        add: true,
        update: true,
        delete: true
    };

    function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
        var added = {};
        var removed = {};

        for (var i = 0; i < changeRecords.length; i++) {
            var record = changeRecords[i];
            if (!expectedRecordTypes[record.type]) {
                console.error('Unknown changeRecord type: ' + record.type);
                console.error(record);
                continue;
            }

            if (!(record.name in oldValues))
                oldValues[record.name] = record.oldValue;

            if (record.type == 'update')
                continue;

            if (record.type == 'add') {
                if (record.name in removed)
                    delete removed[record.name];
                else
                    added[record.name] = true;

                continue;
            }

            // type = 'delete'
            if (record.name in added) {
                delete added[record.name];
                delete oldValues[record.name];
            } else {
                removed[record.name] = true;
            }
        }

        var prop;
        for (prop in added)
            added[prop] = object[prop];

        for (prop in removed)
            removed[prop] = undefined;

        var changed = {};
        for (prop in oldValues) {
            if (prop in added || prop in removed)
                continue;

            var newValue = object[prop];
            if (oldValues[prop] !== newValue)
                changed[prop] = newValue;
        }

        return {
            added: added,
            removed: removed,
            changed: changed
        };
    }

    function newSplice(index, removed, addedCount) {
        return {
            index: index,
            removed: removed,
            addedCount: addedCount
        };
    }

    var EDIT_LEAVE = 0;
    var EDIT_UPDATE = 1;
    var EDIT_ADD = 2;
    var EDIT_DELETE = 3;

    function ArraySplice() {}

    ArraySplice.prototype = {

        // Note: This function is *based* on the computation of the Levenshtein
        // "edit" distance. The one change is that "updates" are treated as two
        // edits - not one. With Array splices, an update is really a delete
        // followed by an add. By retaining this, we optimize for "keeping" the
        // maximum array items in the original array. For example:
        //
        //   'xxxx123' -> '123yyyy'
        //
        // With 1-edit updates, the shortest path would be just to update all seven
        // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
        // leaves the substring '123' intact.
        calcEditDistances: function(current, currentStart, currentEnd,
                                    old, oldStart, oldEnd) {
            // "Deletion" columns
            var rowCount = oldEnd - oldStart + 1;
            var columnCount = currentEnd - currentStart + 1;
            var distances = new Array(rowCount);

            var i, j;

            // "Addition" rows. Initialize null column.
            for (i = 0; i < rowCount; i++) {
                distances[i] = new Array(columnCount);
                distances[i][0] = i;
            }

            // Initialize null row
            for (j = 0; j < columnCount; j++)
                distances[0][j] = j;

            for (i = 1; i < rowCount; i++) {
                for (j = 1; j < columnCount; j++) {
                    if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
                        distances[i][j] = distances[i - 1][j - 1];
                    else {
                        var north = distances[i - 1][j] + 1;
                        var west = distances[i][j - 1] + 1;
                        distances[i][j] = north < west ? north : west;
                    }
                }
            }

            return distances;
        },

        // This starts at the final weight, and walks "backward" by finding
        // the minimum previous weight recursively until the origin of the weight
        // matrix.
        spliceOperationsFromEditDistances: function(distances) {
            var i = distances.length - 1;
            var j = distances[0].length - 1;
            var current = distances[i][j];
            var edits = [];
            while (i > 0 || j > 0) {
                if (i == 0) {
                    edits.push(EDIT_ADD);
                    j--;
                    continue;
                }
                if (j == 0) {
                    edits.push(EDIT_DELETE);
                    i--;
                    continue;
                }
                var northWest = distances[i - 1][j - 1];
                var west = distances[i - 1][j];
                var north = distances[i][j - 1];

                var min;
                if (west < north)
                    min = west < northWest ? west : northWest;
                else
                    min = north < northWest ? north : northWest;

                if (min == northWest) {
                    if (northWest == current) {
                        edits.push(EDIT_LEAVE);
                    } else {
                        edits.push(EDIT_UPDATE);
                        current = northWest;
                    }
                    i--;
                    j--;
                } else if (min == west) {
                    edits.push(EDIT_DELETE);
                    i--;
                    current = west;
                } else {
                    edits.push(EDIT_ADD);
                    j--;
                    current = north;
                }
            }

            edits.reverse();
            return edits;
        },

        /**
         * Splice Projection functions:
         *
         * A splice map is a representation of how a previous array of items
         * was transformed into a new array of items. Conceptually it is a list of
         * tuples of
         *
         *   <index, removed, addedCount>
         *
         * which are kept in ascending index order of. The tuple represents that at
         * the |index|, |removed| sequence of items were removed, and counting forward
         * from |index|, |addedCount| items were added.
         */

        /**
         * Lacking individual splice mutation information, the minimal set of
         * splices can be synthesized given the previous state and final state of an
         * array. The basic approach is to calculate the edit distance matrix and
         * choose the shortest path through it.
         *
         * Complexity: O(l * p)
         *   l: The length of the current array
         *   p: The length of the old array
         */
        calcSplices: function(current, currentStart, currentEnd,
                              old, oldStart, oldEnd) {
            var prefixCount = 0;
            var suffixCount = 0;

            var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
            if (currentStart == 0 && oldStart == 0)
                prefixCount = this.sharedPrefix(current, old, minLength);

            if (currentEnd == current.length && oldEnd == old.length)
                suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

            currentStart += prefixCount;
            oldStart += prefixCount;
            currentEnd -= suffixCount;
            oldEnd -= suffixCount;

            if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
                return [];

            var splice;
            if (currentStart == currentEnd) {
                splice = newSplice(currentStart, [], 0);
                while (oldStart < oldEnd)
                    splice.removed.push(old[oldStart++]);

                return [ splice ];
            } else if (oldStart == oldEnd)
                return [ newSplice(currentStart, [], currentEnd - currentStart) ];

            var ops = this.spliceOperationsFromEditDistances(
                this.calcEditDistances(current, currentStart, currentEnd,
                    old, oldStart, oldEnd));

            var splices = [];
            var index = currentStart;
            var oldIndex = oldStart;
            for (var i = 0; i < ops.length; i++) {
                switch(ops[i]) {
                    case EDIT_LEAVE:
                        if (splice) {
                            splices.push(splice);
                            splice = undefined;
                        }

                        index++;
                        oldIndex++;
                        break;
                    case EDIT_UPDATE:
                        if (!splice)
                            splice = newSplice(index, [], 0);

                        splice.addedCount++;
                        index++;

                        splice.removed.push(old[oldIndex]);
                        oldIndex++;
                        break;
                    case EDIT_ADD:
                        if (!splice)
                            splice = newSplice(index, [], 0);

                        splice.addedCount++;
                        index++;
                        break;
                    case EDIT_DELETE:
                        if (!splice)
                            splice = newSplice(index, [], 0);

                        splice.removed.push(old[oldIndex]);
                        oldIndex++;
                        break;
                }
            }

            if (splice) {
                splices.push(splice);
            }
            return splices;
        },

        sharedPrefix: function(current, old, searchLength) {
            for (var i = 0; i < searchLength; i++)
                if (!this.equals(current[i], old[i]))
                    return i;
            return searchLength;
        },

        sharedSuffix: function(current, old, searchLength) {
            var index1 = current.length;
            var index2 = old.length;
            var count = 0;
            while (count < searchLength && this.equals(current[--index1], old[--index2]))
                count++;

            return count;
        },

        calculateSplices: function(current, previous) {
            return this.calcSplices(current, 0, current.length, previous, 0,
                previous.length);
        },

        equals: function(currentValue, previousValue) {
            return currentValue === previousValue;
        }
    };

    var arraySplice = new ArraySplice();

    function calcSplices(current, currentStart, currentEnd,
                         old, oldStart, oldEnd) {
        return arraySplice.calcSplices(current, currentStart, currentEnd,
            old, oldStart, oldEnd);
    }

    function intersect(start1, end1, start2, end2) {
        // Disjoint
        if (end1 < start2 || end2 < start1)
            return -1;

        // Adjacent
        if (end1 == start2 || end2 == start1)
            return 0;

        // Non-zero intersect, span1 first
        if (start1 < start2) {
            if (end1 < end2)
                return end1 - start2; // Overlap
            else
                return end2 - start2; // Contained
        } else {
            // Non-zero intersect, span2 first
            if (end2 < end1)
                return end2 - start1; // Overlap
            else
                return end1 - start1; // Contained
        }
    }

    function mergeSplice(splices, index, removed, addedCount) {

        var splice = newSplice(index, removed, addedCount);

        var inserted = false;
        var insertionOffset = 0;

        for (var i = 0; i < splices.length; i++) {
            var current = splices[i];
            current.index += insertionOffset;

            if (inserted)
                continue;

            var intersectCount = intersect(splice.index,
                splice.index + splice.removed.length,
                current.index,
                current.index + current.addedCount);

            if (intersectCount >= 0) {
                // Merge the two splices

                splices.splice(i, 1);
                i--;

                insertionOffset -= current.addedCount - current.removed.length;

                splice.addedCount += current.addedCount - intersectCount;
                var deleteCount = splice.removed.length +
                    current.removed.length - intersectCount;

                if (!splice.addedCount && !deleteCount) {
                    // merged splice is a noop. discard.
                    inserted = true;
                } else {
                    removed = current.removed;

                    if (splice.index < current.index) {
                        // some prefix of splice.removed is prepended to current.removed.
                        var prepend = splice.removed.slice(0, current.index - splice.index);
                        Array.prototype.push.apply(prepend, removed);
                        removed = prepend;
                    }

                    if (splice.index + splice.removed.length > current.index + current.addedCount) {
                        // some suffix of splice.removed is appended to current.removed.
                        var append = splice.removed.slice(current.index + current.addedCount - splice.index);
                        Array.prototype.push.apply(removed, append);
                    }

                    splice.removed = removed;
                    if (current.index < splice.index) {
                        splice.index = current.index;
                    }
                }
            } else if (splice.index < current.index) {
                // Insert splice here.

                inserted = true;

                splices.splice(i, 0, splice);
                i++;

                var offset = splice.addedCount - splice.removed.length;
                current.index += offset;
                insertionOffset += offset;
            }
        }

        if (!inserted)
            splices.push(splice);
    }

    function createInitialSplices(array, changeRecords) {
        var splices = [];

        for (var i = 0; i < changeRecords.length; i++) {
            var record = changeRecords[i];
            switch(record.type) {
                case 'splice':
                    mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
                    break;
                case 'add':
                case 'update':
                case 'delete':
                    if (!isIndex(record.name))
                        continue;
                    var index = toNumber(record.name);
                    if (index < 0)
                        continue;
                    mergeSplice(splices, index, [record.oldValue], 1);
                    break;
                default:
                    console.error('Unexpected record type: ' + JSON.stringify(record));
                    break;
            }
        }

        return splices;
    }

    function projectArraySplices(array, changeRecords) {
        var splices = [];

        createInitialSplices(array, changeRecords).forEach(function(splice) {
            if (splice.addedCount == 1 && splice.removed.length == 1) {
                if (splice.removed[0] !== array[splice.index])
                    splices.push(splice);

                return;
            }

            splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
                splice.removed, 0, splice.removed.length));
        });

        return splices;
    }

    // Export the observe-js object for **Node.js**, with backwards-compatibility
    // for the old `require()` API. Also ensure `exports` is not a DOM Element.
    // If we're in the browser, export as a global object.

    var expose = global;

    if (typeof exports !== 'undefined' && !exports.nodeType) {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports;
        }
        expose = exports;
    }

    expose.Observer = Observer;
    expose.Observer.runEOM_ = runEOM;
    expose.Observer.observerSentinel_ = observerSentinel; // for testing.
    expose.Observer.hasObjectObserve = hasObserve;
    expose.ArrayObserver = ArrayObserver;
    expose.ArrayObserver.calculateSplices = function(current, previous) {
        return arraySplice.calculateSplices(current, previous);
    };

    expose.ArraySplice = ArraySplice;
    expose.ObjectObserver = ObjectObserver;
    expose.PathObserver = PathObserver;
    expose.CompoundObserver = CompoundObserver;
    expose.Path = Path;
    expose.ObserverTransform = ObserverTransform;

})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? global : this || window);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
var Scope = module.exports = function(){
    this.locals = null;
    this.parent = null;
    this.pather = null;
    this.router = null;
};

Scope.source = null;
},{}],8:[function(require,module,exports){
/**
 * Created by evio on 15/9/9.
 */
var observe = require('./observer');
var utils = require('../utils');

var watcher = module.exports = function(object){
    this.object = object;
};

watcher.prototype.inject = function(){
    this.auto(this.object.source);
};

watcher.prototype.auto = function(scope, router){
    var type = utils.type(scope), obs, that = this; router = router || '';
    switch(type){
        case 'Object':
            obs = new observe.ObjectObserver(scope);
            obs.open(function(added, removed, changed, getOldValueFn) {
                Object.keys(added).forEach(function(property) {
                    that.addObject(property, added[property], router);
                });
                Object.keys(removed).forEach(function(property) {
                    that.removeObject(property, getOldValueFn(property), router);
                });
                Object.keys(changed).forEach(function(property) {
                    that.changeObject(property, changed[property], getOldValueFn(property), router);
                });
            });
            Object.keys(scope).forEach(function(key){
                if ( key === '$parent' ) return;
                that.auto(scope[key], router + "['" + key + "']");
            });
            break;
        case 'Array':
            obs = new observe.ArrayObserver(scope);
            obs.open(function(splices){
                splices.forEach(function(splice){
                    var index = splice.index;
                    // 修改数组
                    if ( splice.removed.length > 0 && splice.addedCount > 0 ){
                        that.changeArray(router, index);
                    }
                    // 删除数组
                    else if ( splice.removed.length > 0 && splice.addedCount === 0 ){
                        that.removeArray(router, index);
                    }
                    // 添加数组
                    else{
                        that.addArray(router, index);
                    }
                });
            });
            scope.forEach(function(object, index){
                that.auto(object, router + "['" + index + "']");
            });
            break;
    }
};

watcher.prototype.addObject = function(property, newvalue, router){
    if ( property === '$parent' ) return;
    this.auto(newvalue, router + "['" + property + "']");
    if ( utils.type(newvalue, 'Array') ){
        this.update({ router: router + "['" + property + "']", index: -1, type: 'add' });
    }else{
        this.update();
    }
};
watcher.prototype.removeObject = function(property, oldvalue, router){
    if ( property === '$parent' ) return;
    this.update();
};
watcher.prototype.changeObject = function(property, newvalue, oldvalue, router){
    if ( property === '$parent' ) return;
    this.auto(newvalue, router);
    this.update();
};



watcher.prototype.addArray = function(router, index){
    var newValue = utils.get(router, this.object.source)[index];
    this.auto(newValue, router + "['" + index + "']");
    this.update({ router: router, index: index, type: 'add' });
};
watcher.prototype.changeArray = function(router, index){
    var newValue = utils.get(router, this.object.source)[index];
    this.auto(newValue, router + "['" + index + "']");
    this.update({ router: router, index: index, type: 'change' });
};
watcher.prototype.removeArray = function(router, index){
    console.log({ router: router, index: index, type: 'remove' })
    this.update({ router: router, index: index, type: 'remove' });
};



watcher.prototype.update = function(){
    var scope = this.object.source;
    var args = [scope].concat(utils.slice.call(arguments, 0));
    this.object.objects.forEach(function(object){
        object.update.apply(object, args);
    });
};
},{"../utils":17,"./observer":6}],9:[function(require,module,exports){
var vmodel = require('./scan-node/index');
var utils = require('./utils');

exports.select = function(expression){
    if ( !utils.type(expression, 'String') ){
        return expression;
    }

    var elements = document.querySelectorAll("[es-controller='" + expression + "']");
    return elements.length === 0
        ? null
        : (
        elements.length === 1
            ? elements[0]
            : utils.slice.call(elements, 0)
    );
};

exports.controller = function(controller){
    return (new vmodel()).all(this.select(controller));
};

exports.invoke = function(controller, initScope, factory){
    var vm = this.controller(controller);
    if ( typeof initScope === 'function' ){
        factory = initScope;
        initScope = {};
    }
    vm.init(initScope);
    if ( factory ){
        vm.update(factory);
    }
    return vm;
};
},{"./scan-node/index":12,"./utils":17}],10:[function(require,module,exports){
var utils = require('../utils');

var attr = module.exports = function(DOM, expression, DEEP, AttributeNode){
    this.deep = DEEP;
    this.expression = expression;
    this.element = DOM;
    this.attrnode = AttributeNode;
};

attr.prototype.set = function(value){
    this.attrnode.nodeValue = value;
};

Object.defineProperty(attr.prototype, 'value', {
    set: function( value ){
        this.set(value);
        this.oldValue = value;
    }
});

attr.prototype.gruntScope = function(scope, index, alias){
    var data = utils.get(this.deep.locals, scope);
    var _scope = data;
    if ( alias !== undefined && alias !== null ){
        _scope = {};
        _scope[alias] = _scope['$this'] = data;
        _scope['$index'] = index;
    }else{
        if ( index !== undefined && index !== null ){
            _scope['$index'] = index;
        }
    }
    _scope['$parent'] = this.makeParentScope(scope);
    return _scope;
};

attr.prototype.makeParentScope = function(scope){
    var data = {};
    var loops = function(vm, dat){
        if ( vm && vm.parent ){
            utils.mixin(dat, utils.get(vm.pather, scope));
            vm = vm.parent;
            if ( vm.parent ){
                dat.$parent = {};
                loops(vm, dat.$parent);
            }
        }
    };
    loops(this.deep.parent, data);
    return data;
};

attr.prototype.get = function(scope, index, alias){
    return utils.value(this.expression, this.gruntScope(scope, index, alias));
};

attr.prototype.update = attr.prototype.render = function(scope, index, alias){
    if ( utils.type(index, 'Object') ){
        index =this.index;
        alias = this.alias;
    }else{
        if ( index ){ this.index = index; }
        else{ index = this.index; }
        if ( alias ){ this.alias = alias; }
        else{alias = this.alias;}
    }
    var value = this.get(scope, index, alias);
    if ( this.oldValue !== value ){
        this.value = value;
    }
};
},{"../utils":17}],11:[function(require,module,exports){
var attrobject = require('./attr');
var utils = require('../utils');

var AttributeParser = module.exports = function(DOM, DEEP){
    var Attributes = [];
    utils.slice.call(DOM.attributes, 0).forEach(function(AttributeNode){
        var AttributeName = AttributeNode.nodeName;
        var AttributeValue = AttributeNode.nodeValue;
        if ( typeof AttributeParser.commands[AttributeName] === 'function' ){
            Attributes.push(AttributeParser.commands[AttributeName](DOM, AttributeValue, DEEP, AttributeNode));
        }else{
            if ( AttributeValue.split(utils.REGEXP_TAGSPILTOR).length > 1 ){
                Attributes.push(AttributeParser.createNormalAttributeFactory(DOM, AttributeValue, DEEP, AttributeNode));
            }
        }
    });
    return Attributes;
};

AttributeParser.createNormalAttributeFactory = function(DOM, expression, DEEP, AttributeNode){
    expression = utils.formatExpression(expression);
    return new attrobject(DOM, expression, DEEP, AttributeNode);
};

AttributeParser.commands = {
    "es-src": require('../commands/es-src'),
    "es-html": require('../commands/es-html'),
    "es-binding": require('../commands/es-binding'),
    "es-click": require('../commands/es-click')
};
},{"../commands/es-binding":1,"../commands/es-click":2,"../commands/es-html":3,"../commands/es-src":4,"../utils":17,"./attr":10}],12:[function(require,module,exports){
var utils = require('../utils');
var attrParser = require('./attrscan');
var textParser = require('./textscan');
var repeatParser = require('./repeatscan');
var ScopeParent = require('../data-observer/scope-parent');
var watcher = require('../data-observer/watcher');

var scan = module.exports = function(){
    this.objects = [];
    this.deep = new ScopeParent();
    this.deep.locals = '';
    this.deep.pather = '';
    this.deep.router = '#';
    this.element = null;
    this.source = null;
};

scan.prototype.init = function(data){
    ScopeParent.source = this.source = data || {};
    return this.render(this.source).listen();
};

scan.prototype.all = function(DOM){
    var that = this;
    this.objects = this.objects.concat(attrParser(DOM, this.deep));
    if ( !this.element ) this.element = DOM;
    utils.slice.call(DOM.childNodes, 0).forEach(function(node){
        if ( utils.exceptTagNames.indexOf(node.tagName) === -1 ){
            switch ( node.nodeType ){
                case 1:
                    if ( !node.hasAttribute('es-controller') ){
                        if ( node.hasAttribute('es-repeat') ){
                            var repeat = new repeatParser(node);
                            repeat.init(that.deep, false);
                            that.objects.push(repeat);
                        }
                        else{ that.all(node); }
                    }
                    break;
                case 3:
                    that.objects = that.objects.concat(textParser(node, that.deep));
                    break;
            }
        }
    });
    return this;
};

scan.prototype.render = function(scope){
    this.objects.forEach(function(object){
        object.render(scope);
    });
    return this;
};

scan.prototype.listen = function(){
    this.watcher = new watcher(this);
    this.watcher.inject();
    return this;
};

scan.prototype.update = function(foo){
    foo.call(this.source, this.source, this.element);
    return this;
};
},{"../data-observer/scope-parent":7,"../data-observer/watcher":8,"../utils":17,"./attrscan":11,"./repeatscan":14,"./textscan":16}],13:[function(require,module,exports){
var attrParser = require('./attrscan');
var textParser = require('./textscan');
var utils = require('../utils');
var ScopeParent = require('../data-observer/scope-parent');

var createRepeatDataSource = module.exports = function(){
    this.deep = new ScopeParent();
    this.constructer = null;
    this.objects = [];
    this.parent = null;
    this.element = null;
    this.loop = true;
};

createRepeatDataSource.prototype.all = function(DOM){
    var that = this;
    if ( !DOM ){ DOM = this.element; }
    this.objects = this.objects.concat(attrParser(DOM, this.deep));
    utils.slice.call(DOM.childNodes, 0).forEach(function(node){
        if ( utils.exceptTagNames.indexOf(node.tagName) === -1 ){
            switch ( node.nodeType ){
                case 1:
                    if ( node.hasAttribute('es-repeat') ){
                        var Block = new that.constructer(node);
                        Block.init(that.deep, that.parent.useAlias);
                        that.objects.push(Block);
                    }else{
                        that.all(node);
                    }
                    break;
                case 3:
                    that.objects = that.objects.concat(textParser(node, that.deep));
                    break;
            }
        }
    });
    return this;
};

createRepeatDataSource.prototype.render = function(scope, key){
    var that = this;
    this.objects.forEach(function(object){
        object.render(scope, key, that.parent.alias);
    });
};

createRepeatDataSource.prototype.rebuild = function(index){
    this.deep.locals = this.deep.parent.locals + "['" + index + "']";
    this.index = index;
};

createRepeatDataSource.prototype.update = function(scope, key, alias, options){
    var that = this;
    if ( options && options.type ){
        if ( options.type === 'rebuild' ){
            this.objects.forEach(function(object, index){
                if ( object.alone ){
                    object.deep.parent = that.deep;
                    object.rebuild();
                    object.update(scope, { type: 'rebuild' });
                }else{
                    object.deep = that.deep;
                    object.update(scope, key, alias);
                }
            });
        }
    }else{
        this.objects.forEach(function(object){
            object.update(scope, key, alias);
        });
    }
};
},{"../data-observer/scope-parent":7,"../utils":17,"./attrscan":11,"./textscan":16}],14:[function(require,module,exports){
var utils = require('../utils');
var repeatSource = require('./repeat');
var ScopeParent = require('../data-observer/scope-parent');

var createRepeatConstructor = module.exports = function(DOM){
    this.element = DOM;
    this.alias = null;
    this.realy = null;
    this.deep = new ScopeParent();
    this.alone = true;
    this.template = null;
    this.commentStartNode = null;
    this.commentEndNode = null;
    this.fragment = document.createDocumentFragment();
    this.objects = [];
    this.oldValue = null;
};

createRepeatConstructor.prototype.getCommandInVars = function(DEEP, _ALIAS, rebuild){
    var expression = this.element.getAttribute('es-repeat').trim();
    var expressExec = utils.REGEXP_COMMAND_IN.exec(expression);
    this.element.removeAttribute('es-repeat');
    this.expression = expression;
    this._ALIAS = _ALIAS;

    this.useAlias = true;
    this.expressExec = true;
    this.deep.parent = DEEP;
    this.deep.pather = DEEP.locals;

    if ( !expressExec ){
        this.expressExec = false;
        this.useAlias = false;
        this.deep.locals = DEEP.locals + utils.makeDeepOnRealy(expression, _ALIAS);
        this.deep.router = DEEP.router + '-' + utils.makeRouterOnRealy(expression, _ALIAS);
        return this;
    }

    this.alias = expressExec[1];
    this.realy = expressExec[2];
    this.deep.locals = DEEP.locals + utils.makeDeepOnRealy(this.realy, _ALIAS);
    this.deep.router = DEEP.router + '-' + utils.makeRouterOnRealy(this.realy, _ALIAS);

    return this;
};

createRepeatConstructor.prototype.rebuild = function(){
    this.deep.pather = this.deep.parent.locals;

    if ( !this.expressExec ){
        this.deep.locals = this.deep.parent.locals + utils.makeDeepOnRealy(this.expression, this._ALIAS);
        return this;
    }

    this.deep.locals = this.deep.parent.locals + utils.makeDeepOnRealy(this.realy, this._ALIAS);

    return this;
};

createRepeatConstructor.prototype.init = function(DEEP, _ALIAS){
    this.getCommandInVars(DEEP, _ALIAS);
    this.freeze();
};

createRepeatConstructor.prototype.freeze = function(){
    var cloneNodeElement = this.element.cloneNode(true);
    var parentNodeDom = this.element.parentNode;
    this.template = cloneNodeElement;
    this.commentStartNode = document.createComment('Repeat Start');
    this.commentEndNode = document.createComment('Repeat End');
    this.fragment.appendChild(this.commentStartNode);
    this.fragment.appendChild(this.commentEndNode);
    parentNodeDom.replaceChild(this.fragment, this.element);
};

createRepeatConstructor.prototype.append = function(index){
    var deep = this.deep.locals + "['" + index + "']";
    var _deep = this.deep.router + '-' + index;
    var single = new repeatSource();
    single.deep.locals = deep;
    single.deep.router = _deep;
    single.deep.parent = this.deep;
    single.deep.pather = this.deep.pather;
    single.constructer = createRepeatConstructor;
    single.parent = this;
    single.element = this.template.cloneNode(true);
    single.index = index;
    single.all();
    this.commentEndNode.parentNode.insertBefore(single.element, this.commentEndNode);
    this.objects.push(single);
    return single;
};

createRepeatConstructor.prototype.remove = function(index){
    var router = this.deep.locals + "['" + index + "']";
    for ( var i = 0 ; i < this.objects.length ; i++ ){
        var object = this.objects[i];
        if ( object.deep.locals === router ){
            object.element.parentNode.removeChild(object.element);
            this.objects.splice(i, 1);
            break;
        }
    }
};

createRepeatConstructor.prototype.each = function(scope, foo){
    var data = utils.get(this.deep.locals, scope);
    this.oldValue = data;
    if ( utils.type(data, 'Object') ){
        for ( var key in data ){
            foo.call(this, key, data[key], data);
        }
    }

    else if ( utils.type(data, 'Array') ){
        for ( var index = 0 ; index < data.length ; index++ ){
            foo.call(this, index, data[index], data);
        }
    }

    return this;
};

createRepeatConstructor.prototype.render = function(scope){
    return this.each(scope, function(key){
        var single = this.append(key);
        single.render(scope, key);
    });
};

createRepeatConstructor.prototype.update = function(scope, options){
    var that = this;
    if ( options && options.router && options.index !== undefined && options.type && this.deep.locals === options.router ){
        if ( options.type === 'add' ){
            if ( options.index > -1 ){
                var single = this.append(options.index);
                single.render(scope, options.index);
            }else{
                this.render(scope);
            }
        }
        else if ( options.type === 'remove' ){
            this.remove(options.index);
            var len = this.objects.length - 1;
            var removeIndex = -1;
            if ( options.index > len ){
                removeIndex = len;
            }else{
                removeIndex = options.index;
            }
            this.objects.slice(removeIndex).forEach(function(object, index){
                object.index = removeIndex + index;
                object.deep.locals = that.deep.locals + "['" + object.index + "']";
                object.update(scope, object.index, object.parent.alias, {
                    type: 'rebuild'
                });
            });
        }
        else if ( options.type === 'change' ){
            var changeObject = (function(index){
                var router = this.deep.locals + "['" + index + "']";
                var ret = null;
                for ( var i = 0 ; i < this.objects.length ; i++ ){
                    var object = this.objects[i];
                    if ( object.deep.locals === router ){
                        ret = object;
                        break;
                    }
                }
                return ret;
            }).call(this, options.index);
            if ( changeObject ){
                changeObject.update(scope, options.index, changeObject.parent.alias);
            }
        }
    }
    else if ( options && options.type === 'rebuild' ){
        this.objects.forEach(function(object, index){
            object.deep.locals = object.deep.parent.locals + "['" + index + "']";
            object.deep.pather = object.deep.parent.pather;
            object.update(scope, index, object.parent.alias, {
                type: 'rebuild'
            });
        });
    }
    else{
        this.objects.forEach(function(object){
            object.update(scope, options);
        });
    }
};
},{"../data-observer/scope-parent":7,"../utils":17,"./repeat":13}],15:[function(require,module,exports){
var utils = require('../utils');

var text = module.exports = function(DOM, expression, DEEP){
    this.deep = DEEP;
    this.expression = expression;
    this.element = DOM;
    this.index = null;
    this.alias = null;
};

text.prototype.set = function(value){
    this.element.nodeValue = value;
};

Object.defineProperty(text.prototype, 'value', {
    set: function( value ){
        this.set(value);
        this.oldValue = value;
    }
});

text.prototype.gruntScope = function(scope, index, alias){
    var data = utils.get(this.deep.locals, scope);
    var _scope = data;

    if ( alias !== undefined && alias !== null ){
        _scope = {};
        _scope[alias] = _scope['$this'] = data;
        _scope['$index'] = index;
    }else{
        if ( index !== undefined && index !== null ){
            _scope['$index'] = index;
        }
    }
    _scope['$parent'] = this.makeParentScope(scope);

    return _scope;
};

text.prototype.makeParentScope = function(scope){
    var data = {};
    var loops = function(vm, dat){
        if ( vm && vm.parent ){
            utils.mixin(dat, utils.get(vm.pather, scope));
            vm = vm.parent;
            if ( vm.parent ){
                dat.$parent = {};
                loops(vm, dat.$parent);
            }
        }
    };
    loops(this.deep.parent, data);
    return data;
};

text.prototype.get = function(scope, index, alias){
    return utils.value(this.expression, this.gruntScope(scope, index, alias));
};

text.prototype.update = text.prototype.render = function(scope, index, alias){
    if ( utils.type(index, 'Object') ){
        index =this.index;
        alias = this.alias;
    }else{
        if ( index ){ this.index = index; }
        else{ index = this.index; }
        if ( alias ){ this.alias = alias; }
        else{alias = this.alias;}
    }

    var value = this.get(scope, index, alias);
    if ( this.oldValue !== value ){
        this.value = value;
    }
};
},{"../utils":17}],16:[function(require,module,exports){
var textobject = require('./text');
var utils = require('../utils');

var text = module.exports = function(DOM, DEEP){
    var contentString = DOM.textContent;
    var cloneFrameElement = document.createDocumentFragment();
    var objects = [];

    contentString.split(utils.REGEXP_TAGSPILTOR).forEach(function(textSpace, index){
        var isTextNodeElement = index % 2 === 1;
        var nodeText = isTextNodeElement ? utils.configs.defaultText : textSpace;
        var cloneTextNode = document.createTextNode(nodeText);
        var expression = textSpace.trim();
        if ( isTextNodeElement && expression.length > 0 ){
            objects.push(new textobject(cloneTextNode, expression, DEEP));
        }
        cloneFrameElement.appendChild(cloneTextNode);
    });

    DOM.parentNode.replaceChild(cloneFrameElement, DOM);

    return objects;
};
},{"../utils":17,"./text":15}],17:[function(require,module,exports){
exports.slice = Array.prototype.slice;
exports.toString = Object.prototype.toString;
exports.REGEXP_TAGSPILTOR = /\{\{([^\}\}]+)\}\}/g;
exports.REGEXP_STRING = /(["|'])(.+?)*?\1/g;
exports.REGEXP_COMMAND_IN = /([^\s]+?)\sin\s(.+)/i;
exports.REGEXP_PARENT = /(\B\$parent\.)+?[a-zA-z_\.\$0-9]+/g;
exports.exceptTagNames = ['head', 'script', 'meta', 'link', 'title', 'script', 'hr', 'br'];

exports.configs = {
    defaultText: ''
};

/**
 * check the type of object or return this type.
 * @param obj
 * @param type
 * @returns {*}
 */
exports.type = function(obj, type){
    var _type = this.toString.call(obj).split(' ')[1].replace(/\]$/, '');
    if ( type ){
        return _type == type;
    }else{
        return _type;
    }
};

/**
 * mix target into source object.
 * @param source
 * @param target
 * @param overwrite
 * @returns {*}
 */
exports.mixin = function(source, target, overwrite){
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
};

exports.get = function(deep, scope){
    try{
        var foo = new Function('scope', 'return scope' + deep);
        return foo(scope) || this.configs.defaultText;
    }catch(e){
        return this.configs.defaultText;
    }
};

exports.set = function(value, scope, deep){
    try{
        var foo = new Function('value', 'scope', 'scope' + deep + '=value;');
        foo(value, scope);
    }catch(e){
        console.error(e);
    }
};

exports.value = function(expression, scope){
    try{
        var foo = new Function('scope', 'with(scope){return ' + expression + '}');
        return foo(scope) || this.configs.defaultText;
    }catch(e){
        return this.configs.defaultText;
    }
};

/**
 * 将表达式转义为JS表达式
 * @param expression
 * @returns {string}
 */
exports.formatExpression = function(expression){
    var pools = [];
    expression.split(exports.REGEXP_TAGSPILTOR).forEach(function(text, index){
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
};

exports.makeDeepOnRealy = function(realy, Alias){
    var splitor = realy.split('.');
    if ( Alias ){
        return "['" + splitor.slice(1).join("']['") + "']";
    }else{
        return "['" + splitor.join("']['") + "']";
    }
};

exports.makeRouterOnRealy = function(realy, Alias){
    var splitor = realy.split('.');
    if ( Alias ){
        return splitor.slice(1).join("-");
    }else{
        return splitor.join("-");
    }
};

exports.flatten = arrayFlatten;

/**
 * Recursive flatten function with depth.
 *
 * @param  {Array}  array
 * @param  {Array}  result
 * @param  {Number} depth
 * @return {Array}
 */
function flattenWithDepth (array, result, depth) {
    for (var i = 0; i < array.length; i++) {
        var value = array[i]

        if (depth > 0 && Array.isArray(value)) {
            flattenWithDepth(value, result, depth - 1)
        } else {
            result.push(value)
        }
    }

    return result
}

/**
 * Recursive flatten function. Omitting depth is slightly faster.
 *
 * @param  {Array} array
 * @param  {Array} result
 * @return {Array}
 */
function flattenForever (array, result) {
    for (var i = 0; i < array.length; i++) {
        var value = array[i]

        if (Array.isArray(value)) {
            flattenForever(value, result)
        } else {
            result.push(value)
        }
    }

    return result
}

/**
 * Flatten an array, with the ability to define a depth.
 *
 * @param  {Array}  array
 * @param  {Number} depth
 * @return {Array}
 */
function arrayFlatten (array, depth) {
    if (depth == null) {
        return flattenForever(array, [])
    }

    return flattenWithDepth(array, [], depth)
}

function getParentPather(n, scope){
    for ( var i = 0 ; i < n ; i++ ){
        scope = scope.parent;
    }
    return scope;
}

exports.getParentPather = getParentPather;
exports.unique = unique;

function ascending( a, b ) {
    return a - b;
} // end FUNCTION ascending()


// UNIQUE //

/**
 * FUNCTION: unique( arr, sorted )
 *	Removes duplicate values from a numeric array. Note: the input array is mutated.
 *
 * @param {Array} arr - array to be deduped
 * @param {Boolean} sorted - boolean flag indicating if the input array is sorted
 */
function unique( arr, sorted ) {
    if ( !Array.isArray( arr ) ) {
        throw new TypeError( 'unique()::invalid input argument. First argument must be an array.' );
    }
    if ( arguments.length > 1 && typeof sorted !== 'boolean' ) {
        throw new TypeError( 'unique()::invalid input argument. Second argument must be an array.' );
    }
    var len = arr.length,
        i, j,
        val;

    if ( !len ) {
        return;
    }
    if ( !sorted ) {
        arr.sort( ascending );
    }
    // Loop through the array, only incrementing a pointer when successive values are different. When a succeeding value is different, move the pointer and set the next value. In the trivial case where all array elements are unique, we incur a slight penalty in resetting the element value for each unique value. In other cases, we simply move a unique value to a new position in the array. The end result is a sorted array with unique values.
    for ( i = 1, j = 0; i < len; i++ ) {
        val = arr[ i ];
        if ( arr[ j ] !== val ) {
            j++;
            arr[ j ] = val;
        }
    }
    // Truncate the array:
    arr.length = j+1;
} // end FUNCTION unique()
},{}]},{},[9])(9)
});