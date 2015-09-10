var utils = require('../utils');

/**
 * 数据源s实例化对象
 * @type {Function}
 */
var DATA = module.exports = function(){
    this.$this = null;      // 当前真实数据
    this.$path = null;      // 父数据的数据路由
    this.$parent = null;    // 父数据
    this.$alias = null;     // 别名
    this.$realy = null;     // 真名
    this.$index = null;     // 索引

    /**
     * 监听alias属性
     * 改变$alias的值
     * 并且增加该别名的数据
     * 指向$this数据
     */
    Object.defineProperty(this, 'alias', {
        get: function(){ return this.$alias; },
        set: function(value){
            this.$alias = value;
            this[value] = this.$this;
        }
    });
};

/**
 * 绑定数据源
 * @param router {string | undefined}
 * @param scope {object}
 * @returns {DATA}
 */
DATA.prototype.bind = function(router, scope){
    if ( !scope ){
        scope = router;
        router = '';
    }
    this.$path = router;
    this.$this = scope;
    return this;
};

/**
 * 获取对象的数据路由的依赖关系
 * 兼容数组的依赖关系获取
 * @param expression
 * @returns {Array}
 */
DATA.prototype.relation = function(expression){
    // TODO HERE: $PARENT RESOLVING...
    var RegExpWriters = this.pickRegExpByProperties(), distRelations = [];
    expression = 'return ' + expression.replace(utils.REGEXP_STRING, '');
    var MatchParents = expression.match(utils.REGEXP_PARENT);
    if ( MatchParents && MatchParents.length ){
        distRelations = distRelations.concat(this.parentRelation(MatchParents));
    }else{
        RegExpWriters.forEach(function(writeor){
            var isMatched = false, pather = null;
            for ( var i = 0 ; i < writeor.regs.length ; i++ ){
                if ( writeor.regs[i].test(expression) ){
                    isMatched = true;
                    pather = writeor.keys;
                    break;
                }
            }
            if ( isMatched ){
                distRelations.push(pather);
            }
        });
    }
    return distRelations;
};

/**
 * 获取非数组类型的依赖关系
 * @returns {Array}
 */
DATA.prototype.pickRegExpByProperties = function(){
    var RegExpWriters = [];
    var that = this;
    var sandbox = function(dat, pather, distkey){
        if ( !pather ){ pather = '#'; }
        Object.keys(dat).forEach(function(key){
            var
                data = dat[key],
                distpath = pather + '-' + key;

            if ( distkey ){
                key = distkey + '.' + key;
            }
            if ( utils.type(data, 'Object') ){
                sandbox(data, distpath, key);
            }else{
                var _key = key;
                if ( that.$alias ){
                    _key = that.$alias + '.' + _key;
                }
                RegExpWriters.push({
                    regs: [new RegExp('[^\\.]' + _key.replace(/\./g, '\\.').replace(/\$/, '\\$'))],
                    keys: distpath
                });
            }
        });
    };
    sandbox(this.$this, this.$path);
    return RegExpWriters;
};

DATA.prototype.parentRelation = function(expressions){
    var relations = [];
    var that = this;
    expressions.forEach(function(expression){
        var splitor = expression.split(/\$parent\./);
        var num = splitor.length - 1;
        var m = splitor.lastIndexOf('');
        var express = 'return ' + splitor.slice(m + 1).join('');
        var total = that.$path.split('-').length;
        if ( num > total ) num = total;
        if ( express !== '$index' ){
            var monitor = that;
            for ( var i = 0 ; i < num ; i++ ){ monitor = monitor.$parent; }
            var local = null, useData;
            if ( monitor && monitor.$path ){
                local = monitor.$path;
                useData = monitor.$this;
            }
            else{
                local = '#';
                useData = monitor;
            }
            useData && GruntData(useData, monitor, express, local, relations);
        }
    });
    return relations;
};

function GruntData(useData, monitor, express, local, relations, parent){
    var TAGS = Object.keys(useData), key;
    TAGS.forEach(function(name){
        name = parent ? parent + '.' + name : name;
        var old = name.replace(/\./g, '-');
        var value = useData[name];
        if ( utils.type(value, 'Object') ){
            GruntData(value, monitor, express, local, relations, old);
        }else{
            if ( monitor.$alias ){ name = monitor.$alias + '.' + name; }
            var NORMALREGEXP = new RegExp('[^\\.\\w]' + name.replace(/\./g, '\\.').replace(/\$/, '\\$'));
            if ( NORMALREGEXP.test(express) ){
                key = local + '-' + old;
                if ( relations.indexOf(key) === -1 ) relations.push(key);
            }
        }
    });
}