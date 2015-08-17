/**
 * Created by evio on 15/8/8.
 */
var utils = require('../utils');
exports.getCommandInVars = function(expression){
    var expressExec = utils.REGEXP_COMMAND_IN.exec(expression);

    if ( !expressExec ){
        expression = '$this in ' + expression;
        expressExec = utils.REGEXP_COMMAND_IN.exec(expression);
    }

    if ( !expressExec ){
        console.error('repeat compile catch error.this value is [' + expression + '].');
        return;
    }

    var ScopeAliasName = expressExec[1];
    var ScopeRealyName = expressExec[2];

    return {
        alias: ScopeAliasName,
        realy: ScopeRealyName
    }
};

exports.reBuildNormalStyle = function(pool){
    var scope = pool.scope;
    var compileExpression = getCompileExpression(pool.expression);

    if ( !compileExpression ) return;
    if ( scope && scope.$alias ){
        getReactTags(scope.$this, scope.$alias).forEach(function(TAG){
            var parentMatcher = compileExpression.match(utils.REGEXP_PARENT);
            if ( parentMatcher && parentMatcher.length > 0 ){
                makeParentPather(parentMatcher, pool);
            }else{
                var NORMALREGEXP = RegExpMatcher(TAG);
                if (
                    NORMALREGEXP[0].test(compileExpression) ||
                    NORMALREGEXP[1].test(compileExpression)
                ){
                    var pather = pool.scopePath + '-' + scope.$index + (TAG.tag.length > 0 ? '-' + TAG.tag : '');
                    if ( pool.dependencies.indexOf(pather) === -1 ){
                        pool.dependencies.push(pather);
                    }
                }
            }
        });
        pool.compiled = true;
    }else{
        //console.log(pool)
        Object.keys(pool.attrScope).forEach(function(key){
            pool.relation(key);
            //console.info(pool)
        });
    }
    //console.log(pool.dependencies)
};

function RegExpMatcher(TAG){
    return [
        new RegExp(
            '[^a-zA-z_0-9\\$]' + TAG.express[0].replace(/\./g, '\\.').replace(/\$/, '\\$')),
        new RegExp(
            '[^a-zA-z_0-9\\$]' + TAG.express[1].replace(/\./g, '\\.').replace(/\$/, '\\$'))
    ];
}

function getCompileExpression(expression){
    var soo = expression.split(utils.REGEXP_TAGSPILTOR);
    var express = [], poolExpression;
    if ( soo.length > 1 ){
        soo.forEach(function(so, i){
            var istag = i % 2 === 1;
            if ( istag ){
                express.push(so);
            }else{
                express.push("'" + so + "'");
            }
        });
        poolExpression = express.join(' + ')
    }
    else{
        poolExpression = expression;
    }
    var compileExpression = poolExpression.replace(utils.REGEXP_STRING, '').trim();

    if ( /^\./.test(compileExpression) ){
        console.error('sytax error:' + pool.expression);
        return;
    }
    compileExpression = 'return ' + compileExpression;

    return compileExpression;
}

function getReactTags(datas, alias){
    var TAGS = [];
    if ( utils.type(datas, 'Object') ){
        TAGS = Object.keys(datas);
    }else{
        TAGS.push('');
    }

    TAGS = TAGS.map(function(TAG){
        if ( TAG === '$index' ){
            return {
                express: ['$index', '$index'],
                tag: '$index'
            };
        }else{
            if ( TAG.length === 0 || alias === TAG ){
                return {
                    express: [alias, '$this'],
                    tag: TAG
                }
            }
            else if ( TAG === '$this' ){
                return {
                    express: [alias, '$this'],
                    tag: TAG
                }
            }
            else if ( TAG === '$parent' ){
                return {
                    express: ['$parent', '$parent'],
                    tag: TAG
                }
            }
            else{
                return {
                    express: [
                        alias + '.' + TAG,
                        '$this.' + TAG
                    ],
                    tag: TAG
                }
            }
        }
    });

    return TAGS;
}

function makeParentPather(parentMatcher, DOM){
    parentMatcher.forEach(function(expression){
        var splitor = expression.split(/\$parent\./);
        var num = splitor.length - 1;
        var express = 'return ' + splitor.slice(-1)[0];
        var total = DOM.scopePath.split('-').length;
        if ( num > total ) num = total;
        if ( express !== '$index' ){
            var monitor = DOM.scope;
            for ( var i = 0 ; i < num ; i++ ){
                monitor = monitor.$parent;
            }
            var local = null, useData, index = monitor.$index;
            if ( monitor && monitor.$path ){
                local = monitor.$path;
                useData = monitor.$this;
            }else{
                local = '#';
                useData = monitor;
            }
            if ( useData ){
                var TAGS = Object.keys(useData), key;
                if ( monitor.$alias ){
                    TAGS.forEach(function(name){
                        var old = name;
                        name = monitor.$alias + '.' + name;
                        var NORMALREGEXP = new RegExp(
                            '[^\\.]' + name.replace(/\./g, '\\.').replace(/\$/, '\\$'));
                        if ( NORMALREGEXP.test(express) ){
                            key = local + '-' + index + '-' + old;
                            if ( DOM.dependencies.indexOf(key) === -1 ) DOM.dependencies.push(key);
                        }
                    });
                }else{
                    TAGS.forEach(function(name){
                        var NORMALREGEXP = new RegExp(
                            '[^\\.]' + name.replace(/\./g, '\\.').replace(/\$/, '\\$'));
                        if ( NORMALREGEXP.test(express) ){
                            key = local + '-' + name
                            if ( DOM.dependencies.indexOf(key) === -1 ) DOM.dependencies.push(key);
                        }
                    });
                }
            }
        }
    });
}