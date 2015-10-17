var utils = require('../utils');
var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);
var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

/**
 * Observer factory on watcher
 * @type {Function}
 */
var Observer = module.exports = function(data){
    this.vms = [];
    this.tokens = {};

    utils.defineValue(data, '__ob__', this);
    if ( utils.type(data, 'Array') ){
        copyAugment(data, arrayMethods, arrayKeys);
        this.ArrayObserve(data);
    }
    else if ( utils.type(data, 'Object') ){
        this.ObjectObserve(data);
    }
};

Observer.prototype.ObjectObserve = function(data){
    Object.observe(data, configs => {
        configs.forEach(config => {
            var oldValue = config.oldValue, ob;
            ob = oldValue ? oldValue.__ob__ : null;
            if ( utils.type(oldValue, 'Array') ){
                if ( ob ){
                    ob.vms.forEach(vm => vm.notify());
                }
            }else{
                this.vms.forEach(vm => {
                    if ( vm.namespace === 'component' ){
                        vm.notify();
                    }else{
                        vm.notify(data);
                    }
                });
            }
        });
    });

    for ( var name in data ){
        Observer.create(data[name]);
    }
};

Observer.prototype.ArrayObserve = function(data){
    var i = data.length, that = this;

    while (i--) {
        this.tokens[i] = { value: data[i], vms: [] };
        Object.defineProperty(data, i, {
            get: _defineGetter_(i, that),
            set: _defineSetter_(i, that, data)
        });
        var ob = Observer.create(data[i]);
        if ( ob ){
            ob.vms = this.tokens[i].vms;
        }
    }
};

Observer.prototype.addVM = function(vm){
    if ( vm && this.vms.indexOf(vm) === -1 ){
        this.vms.push(vm);
    }
};

Observer.prototype.addToken = function(i, vm){
    if ( i !== undefined && vm && this.tokens[i].vms.indexOf(vm) === -1 ){
        this.tokens[i].vms.push(vm);
    }
};

Observer.release = function(data, view){
    var ob;
    if (
        data &&
        data.hasOwnProperty('__ob__') &&
        data.__ob__ instanceof Observer
    ){
        ob = data.__ob__;
    }
    else if (
        (utils.type(data, 'Array') || utils.type(data, 'Object')) &&
        !Object.isFrozen(data)
    ){
        ob = new Observer(data);
    }

    if ( ob && view ){
        ob.addVM(view);
    }

    return ob;
};

Observer.create = function(data, view){
    var ob = Observer.release(data, view);

    if ( ob && view ){
        ob.addVM(view);
    }

    return ob;
};

Observer.take = function(data, i, view){
    var ob = Observer.release(data[i], view);

    if ( ob && view ){
        ob.addVM(view);
    }
    else if ( view ){
        ob = data.__ob__;
        ob.addToken(i, view);
    }

    return ob;
};

methods.forEach(function(method){
    var original = arrayProto[method];

    utils.defineValue(arrayMethods, method, function(...args){
        var result = original.apply(this, args);
        this.__ob__.vms.forEach(vm => vm.notify(this.__parent__));
        return result;
    });
});

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * Convenience method to remove the element at given index.
 *
 * @param {Number} index
 * @param {*} val
 */

utils.defineValue(
    arrayProto,
    '$remove',
    function $remove (index) {
        /* istanbul ignore if */
        if (!this.length) return;
        if (typeof index !== 'number') {
            index = this.indexOf(index);
        }
        if (index > -1) {
            return this.splice(index, 1);
        }
    }
);

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment (target, src, keys) {
    var i = keys.length;
    var key;
    while (i--) {
        key = keys[i];
        utils.defineValue(target, key, src[key]);
    }
}

function _defineGetter_(i, that){
    return function(){
        return that.tokens[i].value;
    }
}

function _defineSetter_(i, that, data){
    return function(val){
        var vms = that.tokens[i].vms;
        that.tokens[i].value = val;
        vms.forEach(vm => {
            vm.notify(data, i);
            Observer.take(data, i, vm);
        });
    }
}