/**
 * Created by evio on 15/7/27.
 */
var config = require('../../config');
var utils = require('../../utils');
var singleModule = require('./single');
var REGEXP_COMMAND_IN = /([^\s]+?)\sin\s(.+)/i;

var RepeatIndexModule = module.exports = function(scope, parent, parentPath){
    this.$expressions = [];
    this.$template = null;
    this.$cloneRootFragment = document.createDocumentFragment();
    this.$aliaseName = null;
    this.$realName = null;
    this.$scope = scope;
    this.$parentScope = parent || scope;
    this.$dataPath = null;
    this.$parentPath = parentPath || '#';
};

RepeatIndexModule.prototype.search = function(node){
    var attrValue = node.getAttribute(config.attr_repeat);
    var commandInner = REGEXP_COMMAND_IN.exec(attrValue);
    var that = this;

    node.removeAttribute(config.attr_repeat);
    if ( !commandInner ){ commandInner = REGEXP_COMMAND_IN.exec('$this in ' + attrValue); }

    this.$aliaseName = commandInner[1];
    this.$realName = commandInner[2];
    this.$dataPath = this.$parentPath + '-' + this.exChangeRealName();

    var AliaseArrayDataBase = utils.transform(this.$realName, this.$scope);
    if ( !AliaseArrayDataBase || !utils.type(AliaseArrayDataBase, 'Array') ){
        console.error('repeat is not an array.');
        return;
    }

    var cloneNodeElement = node.cloneNode(true);
    var parentNodeDom = node.parentNode;
    this.$template = cloneNodeElement;

    AliaseArrayDataBase.forEach(function(database, index){
        var templateNode = that.$template.cloneNode(true);
        var single = new singleModule(RepeatIndexModule);
        if ( that.$aliaseName !== '$this' ){
            single.$compileScope[that.$aliaseName] = single.$compileScope['$this'] = database;
        }else{
            single.$compileScope['$this'] = database;
        }
        single.$compileScope['$index'] = index;
        single.$compileScope['$parent'] = that.$parentScope &&
            that.$parentScope.$namespace === 'Soyie.Repeat' &&
            that.$parentScope.$compileScope ?
            that.$parentScope.$compileScope : that.$parentScope;
        single.$scope = database;
        single.$dataPath = that.$dataPath + '-' + index;
        single.$aliaseName = that.$aliaseName;
        single.$realName = that.$realName;
        single.$parentScope = that.$parentScope;
        single.compile(templateNode);
        single.relation();
        that.$expressions = that.$expressions.concat(single.$expressions);
        that.$cloneRootFragment.appendChild(templateNode);
    });

    parentNodeDom.replaceChild(this.$cloneRootFragment, node);
};

RepeatIndexModule.prototype.exChangeRealName = function(){
    var contribs = [];
    var that = this;

    if (
        this.$parentScope &&
        this.$parentScope.$namespace === 'Soyie.Repeat' &&
        this.$parentScope.$aliaseName
    ){
        this.$aliaseName.split('.').forEach(function(name, index){
            if ( !(index === 0 && that.$parentScope.$aliaseName === name) ){
                contribs.push(name);
            }
        });

        return contribs.join('.');
    }else{
        return this.$realName;
    }

};