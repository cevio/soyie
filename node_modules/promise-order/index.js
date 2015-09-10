var Promise = module.exports = require('es6-promise').Promise;

/**
 * Promise.order(arr);
 * @param queues
 * @returns {*|Promise}
 */
Promise.order = function(queues){
    return new Promise(function(resolve, reject){
        nextTick(queues, resolve, reject);
    });
};

/**
 * Promise.queue(context, fn);
 * @param scope
 * @param fn
 * @returns {Function}
 */
Promise.queue = function(scope, fn){
    return function(){
        return new Promise(function(resolve, reject){
            if ( fn ){
                fn(scope, resolve, reject);
            }else{
                scope(resolve, reject);
            }
        });
    }
};

/**
 * Promise.queue.resolve();
 * @returns {Function}
 */
Promise.queue.resolve = function(){
    return function(){
        return Promise.resolve();
    }
};

/**
 * Promise.queue.reject();
 * @returns {Function}
 */
Promise.queue.reject = function(){
    return function(){
        return Promise.reject();
    }
};

/**
 * nextTick fn.
 * @param queues
 * @param resolve
 * @param reject
 */
function nextTick(queues, resolve, reject){
    if ( queues.length > 0 ) {
        var queue = queues.shift();
        queue().then(function(){
            nextTick(queues, resolve, reject);
        })['catch'](reject);
    }else{
        resolve();
    }
}