/**
 * Created by evio on 15/7/14.
 */
exports.type = function(obj, type){
    var _type = Object.prototype.toString.call(obj).split(' ')[1].replace(/\]$/, '');
    if ( type ){
        return _type == type;
    }else{
        return _type;
    }
};
exports.each = function(obj, callback, ret){
    if ( this.type(obj, 'NodeList') ){
        obj = Array.prototype.slice.call(obj, 0);
    }

    if ( Array.isArray(obj) ){
        obj.forEach(callback, ret);
    }else{
        var i = -1, index;
        for ( index in obj ){
            i++;
            callback.call(ret, obj[index], i);
        }
    }
};

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
};

exports.transform = function(key, value){
    return (new Function('scope', ';with (scope) { return ' + key + '; };'))(value);
};