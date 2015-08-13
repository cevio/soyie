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