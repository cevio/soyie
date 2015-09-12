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

exports.makeDeepOnExpression = function(realy, router){
    var splitor = realy.split('.');
    return (router || '') + "['" + splitor.join("']['") + "']";
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