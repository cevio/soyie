var controller = require('./lib/view/controller');
var config = require('./lib/config');
var fastclick = require('fastclick');
var domReady = require('domready');
var Promise = require('./lib/promise');
var observe = require('./lib/view/observe');

var EnvirsParser = module.exports = function(node){
    this.RootElement = node;
};

EnvirsParser.module = function(name){
    var ApplicationElement;
    if ( !name ){ ApplicationElement = document.querySelector('[' + config.attr_module + ']'); }
    else{ ApplicationElement = document.querySelector("[" + config.attr_module + "='" + name + "']"); }
    if ( ApplicationElement ){ return new EnvirsParser(ApplicationElement); }
    else{ console.error('moduler not found. ', config.attr_module + '=' + (name || undefined)); }
};

EnvirsParser.prototype.controller = function(name, data){
    var ControlElement = this.RootElement.querySelector("[" + config.attr_controller + "='" + name + "']");
    if ( ControlElement ){
        var ctrl = new controller();
        ctrl.search(ControlElement, data || {});
        ctrl.fetchDependencies(data);
        ctrl.watch(data);
        return ctrl;
    }else{
        console.error('controller not found.', config.attr_controller + '=' + (name || undefined));
    }
};

EnvirsParser.config = function(key, value){
    if ( !value ){
        for ( var i in key ){
            EnvirsParser.config(i, key[i]);
        }
    }else{
        config[key] = value;
    }
};

EnvirsParser.ready = domReady;
EnvirsParser.observe = observe;
EnvirsParser.fastclick = fastclick;
EnvirsParser.Promise = Promise;

if ( typeof window !== 'undefined' ){
    window.Soyie = EnvirsParser;
    domReady(function(){ fastclick(window.document.body); });
    if ( !window.Promise ) window.Promise = Promise;
}