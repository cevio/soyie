/**
 * utils.slice instead of Array.prototype.slice.
 * do writeless.
 */
var config = require('./config');
exports.slice = Array.prototype.slice;
exports.REGEXP_TAGSPILTOR = /\{\{([^\}\}]+)\}\}/g;
exports.REGEXP_STRING = /(["|'])(.+?)*?\1/g;
exports.REGEXP_COMMAND_IN = /([^\s]+?)\sin\s(.+)/i;
exports.REGEXP_PARENT = /(\B\$parent\.)+?[a-zA-z_\.\$0-9]+/g;

/**
 * check the type of object or return this type.
 * @param obj
 * @param type
 * @returns {*}
 */
exports.type = function(obj, type){
    var _type = Object.prototype.toString.call(obj).split(' ')[1].replace(/\]$/, '');
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

/**
 * return value from scope by key.
 * @param key
 * @param value
 * @returns {*}
 */
exports.transform = function(key, value){
    try{ return (new Function('scope', ';with (scope) { return ' + key + '; };'))(value); }
    catch(e){ return config.defaultExpressionCatchErrorValue; }
};

exports.relationRegExp = function(key, compileExpression){
    compileExpression = compileExpression.replace(exports.REGEXP_STRING, '').trim();
    if ( !/^return\s/i.test(compileExpression) ){ compileExpression = 'return ' + compileExpression; }
    var NORMALREGEXP = new RegExp('[^\\.]\\b' + key.replace(/\./g, '\\.').replace(/\$/, '\\$') + '\\b');
    return NORMALREGEXP.test(compileExpression);
};

exports.miss = function(fn, context){
    try{
        fn.call(context);
    }catch(e){
        console.warn(e);
    }
};

exports.searchRepeatBlocks = function(pool, pools, DataRouter){
    var repeatBlocks = pool.repeatBlocks;
    if ( pool.scope.$path === DataRouter ){
        pools.push(pool);
    }else{
        var realy = pool.scope.$realy;
        if (realy.indexOf('.')){
            realy = realy.split('.').slice(1).join('-');
        }
        var path = pool.scope.$path + '-' + realy;
        if ( path === DataRouter ){
            pools.push(pool);
        }
    }
    repeatBlocks.forEach(function(block){
        exports.searchRepeatBlocks(block, pools, DataRouter);
    });
};

exports.reSearchRepeatPools = function(pool){
    var delta = [];
    if ( pool.namespace === 'REAPEATBLOCK' ){
        delta = delta.concat(pool.pools);
        if ( pool.repeatBlocks && pool.repeatBlocks.length > 0 ){
            pool.repeatBlocks.forEach(function(p){
                delta = delta.concat(exports.reSearchRepeatPools(p));
            });
        }
    }
    return delta;
};

exports.reFilterPools = function(delta){
    var x = [];
    delta.forEach(function(d){
        if ( x.indexOf(d) === -1 ){
            x.push(d);
        }
    });
    return x;
};