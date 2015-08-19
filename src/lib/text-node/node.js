var utils = require('../utils');
var node = module.exports = function(DOM){
    this.element = DOM;
    this.expression = null;
    this.dependencies = [];
    this._value_ = null;
    this._type_ = 'TEXTNODE';
    this.scopePath = null;
};

node.prototype.listen = function(){
    var that = this;
    Object.defineProperty(this, 'value', {
        get: function(){ return that._value_; },
        set: function(value){
            that._value_ = value;
            that.element.nodeValue = that._value_;
        }
    });
};

node.prototype.compile = function(scope){
    this.scope = scope;
    return utils.transform(this.expression, scope);
};

node.prototype.relation = function(key){
    if ( utils.relationRegExp(key, this.expression) ){
        var relations = (this.scopePath || '#') + '-' + key;
        relations = relations.replace(/\./g, '-');
        if (this.dependencies.indexOf(relations) === -1) this.dependencies.push(relations);
    }
};