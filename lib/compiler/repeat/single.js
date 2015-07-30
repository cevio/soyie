/**
 * Created by evio on 15/7/27.
 */
var config = require('../../config');
var utils = require('../../utils');
var textDOMParser = require('../text-parser');
var attrNodeParser = require('../attr-parser');
var REGEXP_STRING = /(["|']).+?\1/g;
var REGEXP_PARENT = /(\B\$parent\.)+?[a-zA-z_\.\$0-9]+/g;
var repeatModule = null;
var slice = Array.prototype.slice;

var single = module.exports = function(RepeatIndexModule){
    this.$expressions = [];
    this.$scope = null;
    this.$compileScope = {};
    this.$dataPath = null;
    this.$namespace = 'Soyie.Repeat';
    repeatModule = RepeatIndexModule;
};

single.prototype.compile = function(node){
    var childNodes = slice.call(node.childNodes, 0);
    var that = this;

    childNodes.forEach(function(child){
        var nodeType = child.nodeType;
        if ( 1 === nodeType ){
            var attrValue = child.getAttribute(config.attr_repeat);
            var tagName = child.tagName.toLowerCase();
            if ( config.exceptTagNames.indexOf(tagName) == -1 ) {
                if ( !attrValue ){
                    var attrObject = new attrNodeParser(child, that.$compileScope);
                    attrObject.search(function(){ this.$parentPath = that.$dataPath; });
                    that.$expressions = that.$expressions.concat(attrObject.$expressions);
                    that.compile(child);
                }
                else{
                    var REPEAT = new repeatModule(that.$compileScope, that, that.$dataPath);
                    REPEAT.search(child);
                    that.$expressions = that.$expressions.concat(REPEAT.$expressions);
                }
            }
        }
        else if ( 3 === nodeType ){
            var textParser = new textDOMParser(child, that.$compileScope);
            textParser.compile(function(){ this.$parentPath = that.$dataPath; });
            textParser.$expressions.forEach(function(DOM){
                DOM.value = DOM.compile();
            });
            that.$expressions = that.$expressions.concat(textParser.$expressions);
        }
    });
};

single.prototype.relation = function(){
    var TAGS = [];
    var that = this;
    var aliaseName = this.$aliaseName;

    if ( utils.type(this.$scope, 'Object') ){
        TAGS = Object.keys(this.$scope);
    }else{
        TAGS.push('');
    }

    TAGS = TAGS.map(function(TAG){
        return {
            express: [
                aliaseName + (TAG.length > 0 ? '.' + TAG : ''),
                '$this' + (TAG.length > 0 ? '.' + TAG : '')
            ],
            tag: TAG
        }
    });

    this.$expressions.forEach(function(DOM){
        var compileExpression = DOM.expression.replace(REGEXP_STRING, '').trim();
        if ( /^\./.test(compileExpression) ){
            console.error('sytax error:' + DOM.expression);
            return;
        }
        compileExpression = 'return ' + compileExpression;
        TAGS.forEach(function(TAG){
            var parentMatcher = compileExpression.match(REGEXP_PARENT);
            if ( parentMatcher && parentMatcher.length > 0 ){
                that.makeParentPather(parentMatcher, DOM, TAG);
            }else{
                var NORMALREGEXP = RegExpMatcher(TAG);
                if (
                    NORMALREGEXP[0].test(compileExpression) ||
                    NORMALREGEXP[1].test(compileExpression)
                ){
                    DOM.dependencies.push(DOM.$parentPath + (TAG.tag.length > 0 ? '-' + TAG.tag : ''));
                }
            }
        });
    });
};

single.prototype.makeParentPather = function(parentMatcher, DOM, TAG){
    var that = this;
    parentMatcher.forEach(function(expression){
        var splitor = expression.split(/\$parent\./);
        var num = splitor.length - 1;
        var express = 'return ' + splitor.slice(-1)[0];
        var total = DOM.$parentPath.split('-').length;
        if ( num > total ) num = total;
        if ( express !== '$index' ){
            var monitor = that;
            for ( var i = 0 ; i < num ; i++ ){
                if ( monitor && monitor.$parentScope && monitor.$namespace === 'Soyie.Repeat' ){
                    monitor = monitor.$parentScope;
                }else{
                    monitor = monitor.$scope;
                }
            }
            var local = null, useData = {};
            if ( monitor && monitor.$dataPath ){
                local = monitor.$dataPath;
                useData = monitor.$scope;
            }else{
                local = '#';
                useData = monitor;
            }

            if ( useData ){
                var TAGS = Object.keys(useData);
                if ( monitor.$aliaseName ){
                    TAGS.forEach(function(name){
                        var old = name;
                        name = monitor.$aliaseName + '.' + name;
                        var NORMALREGEXP = new RegExp(
                            '[^\\.]' + name.replace(/\./g, '\\.').replace(/\$/, '\\$'));
                        if ( NORMALREGEXP.test(express) ){
                            DOM.dependencies.push(local + '-' + old);
                        }
                    });
                }else{
                    TAGS.forEach(function(name){
                        var NORMALREGEXP = new RegExp(
                            '[^\\.]' + name.replace(/\./g, '\\.').replace(/\$/, '\\$'));
                        if ( NORMALREGEXP.test(express) ){
                            DOM.dependencies.push(local + '-' + name);
                        }
                    });
                }
            }
        }
    });
};

function RegExpMatcher(TAG){
    return [
        new RegExp(
            '[^\\.]\\b' + TAG.express[0].replace(/\./g, '\\.').replace(/\$/, '\\$') + '\\b'),
        new RegExp(
            '[^\\.]\\b' + TAG.express[1].replace(/\./g, '\\.').replace(/\$/, '\\$') + '\\b')
    ];
}