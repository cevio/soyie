/**
 * Created by evio on 15/7/23.
 */
var config = require('../config');
var utils = require('../utils');
var DOM = require('./dom-event');
var shim = require('./dom-shim');

var detective = module.exports = function(attr, $scope){
    var tagName = this.tagName;
    if ( detective[tagName] ){
        return detective[tagName].call(this, attr, $scope);
    }
};

detective.INPUT = detective.TEXTAREA = function( attr, $scope ){
    if ( this.type === 'checkbox' ){
        return detective.CHECKBOX.call(this, attr, $scope);
    }

    this.expression = attr;
    this.dependencies = [];
    this.compile = function(){ return utils.transform(attr, $scope); };
    DOM(this).on('input', function(){ $scope[attr] = this.value + ''; });

    return this;
};

detective.SELECT = detective.CHECKBOX = function(attr, $scope){
    this.expression = attr;
    this.dependencies = [];
    this.compile = function(){ return utils.transform(attr, $scope); };
    DOM(this).on('change', function(){ $scope[attr] = this.value; });

    return this;
};