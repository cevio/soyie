/**
 * Created by evio on 15/8/10.
 */
var utils = require('../utils');
var data = module.exports = function(){
    this.$this = null;
    this.$index = 0;
    this.$parent = null;
    this.$alias = null;
    this.$realy = null;
    this.$path = null;
};

data.prototype.$push = function(alias, data){
    this[alias] = this.$this;
    if ( data ){
        this.$this = data;
    }
};

data.prototype.$resolvePath = function(){
    if ( !this.$parent.$parent ){
        this.$path = '#-' + this.$realy;
    }else{
        this.$path = this.$parent.$path + '-' + utils.slice.call(arguments, 0).join('-');
    }
};