/**
 * Created by evio on 15/8/5.
 */
var HTML2JS = require('../modules/html2js');
var utils = require('../utils');
var node = module.exports = function(DOM){
    this.element = DOM;
    this.expression = null;
    this.dependencies = [];
    this._value_ = null;
    this._type_ = 'ATTRIBUTENODE';
    this.scopePath = null;
};

node.prototype.listen = function(){
    var that = this;
    Object.defineProperty(this, 'value', {
        get: function(){ return that._value_; },
        set: function(value){
            this._value_ = value;
            this.element.nodeValue = that._value_;
        }
    });
};

node.prototype._createCompiler = function(){
    this.compile = HTML2JS(this.expression).bind(this);
};

node.prototype.relation = function(key){
    var that = this;
    var MatchContexts = this.expression.match(utils.REGEXP_TAGSPILTOR);
    if ( !MatchContexts ){
        MatchContexts = [this.expression];
    }
    MatchContexts.forEach(function(matcher){
        matcher = matcher.replace(/^\{\{/, '').replace(/\}\}$/, '');
        if ( utils.relationRegExp(key, matcher) ){
            var relations = (that.scopePath || '#') + '-' + key;
            relations = relations.replace(/\./g, '-');
            if (that.dependencies.indexOf(relations) === -1) that.dependencies.push(relations);
        }
    });
};