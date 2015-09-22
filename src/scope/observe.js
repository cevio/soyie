import * as utils from '../utils';
import * as observeShim from './observe-shim';

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
].forEach(method => {
    // cache original method
    var original = arrayProto[method];
    utils.defineValue(arrayMethods, method, function(){
        var i = arguments.length;
        var len = this.length;
        var indexs = new Array(i);
        var args = new Array(i);
        while (i--) {
            switch (method){
                case 'push':
                    indexs[i] = len + i;
                    break;
                case 'unshift':
                    indexs[i] = i;
                    break;
            }
            args[i] = arguments[i];
        }

        if ( method === 'splice' ){
            var _index = args[0] >= 0 ? args[0] : len + args[0];
            var _total = args[1];
            for ( let j = _index ; j < (_index + _total); j++ ){
                if ( j < len ){
                    indexs.push(j);
                }
            }
        }


        var result = original.apply(this, args);
        var obs = this.__obs__;
        if ( obs ){
            var inserted, removed;
            switch (method) {
                case 'push':    inserted = args; break;
                case 'unshift': inserted = args; break;
                case 'splice':  inserted = args.slice(2); removed = result; break;
                case 'pop':     removed = [result]; indexs = [len - 1]; break;
                case 'shift':   removed = [result]; indexs = [0]; break;
            }
            if (inserted) obs.observeArray(inserted, this, indexs);
            if (removed) obs.unObserveArray(removed, this, indexs);
            //obs.notify();
        }
        return result;
    });
});

export function create(value, vm){
    var obs;
    if (
        value &&
        value.hasOwnProperty('__obs__') &&
        value.__obs__ instanceof Observer
    ){
        obs = value.__obs__;
    }
    else if (
        !Object.isFrozen(value)
    ){
        obs = new Observer(value);
    }
    if ( obs && vm ){
        obs.addVm(vm);
    }
    return obs;
}

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
 * Observer 监听数据对象
 *
 * @type {class}
 * @param {*} value
 * @return {class context}
 */
export class Observer {
    constructor(value){
        /**
         * define __obs__ on this
         * __obs_ instance observer
         * mark it with __obs__ object.
         */
        utils.defineValue(value, '__obs__', this);

        /**
         * store vms on this.
         * @type {Array}
         */
        this.vms = [];

        if ( utils.type(value, 'Array') ){
            // copy arrayMethods on value and watch arrayKeys method.
            copyAugment(value, arrayMethods, arrayKeys);
            this.observeArray(value);
        }else{
            // watch object changes.
            this.observeObject(value);
        }
    }

    /**
     * add vm on this
     * filter loaded vms.
     * @param vm
     */
    addVm(vm){
        if ( vm && this.vms.indexOf(vm) === -1 ){
            this.vms.push(vm);
        }
    }

    /**
     * remove vm from vms.
     * @param vm
     */
    removeVm(vm){
        this.vms.$remove(vm);
    }

    /**
     * watch object changes.
     * give callback to deal with changes.
     * @param value
     */
    observeObject(value){
        Object.observe(value, (configs) => {
            configs.forEach(() => {
                this.vms.forEach(vm => {
                    vm.update();
                });
            });
        });
    }
    observeArray(items, data, indexs){
        var obs = items.__obs__;
        if ( !obs ){
            data.__obs__.vms.forEach((vm, i) => {
                items.forEach(item => {
                    var index = indexs[i];
                    vm.add(item, index);
                    var parent = vm.parentroot;
                    if ( parent ){
                        parent.update();
                    }
                });
            });
        }
    }
    unObserveArray(items, data, indexs){
        items.forEach(item => {
            var obs = item.__obs__;
            if ( obs ){
                obs.vms.forEach(vm => {
                    vm.remove();
                });
            }else{
                obs = data.__obs__;
                indexs.forEach(index => {
                    obs.vms.forEach(vm => {
                        let v = vm.components[index];
                        v.remove();
                        v.root.update();
                    });
                });

            }
        });
    }
}

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