/**
 * Created by evio on 15/8/14.
 */
var url = require('url');
var path = require('path');
var utils = require('../lib/utils');
var model = require('../loader/module');
var loader = module.exports = function(locator){
    this.req = url.parse(locator);
    this.map = {};
    this.request();
};

loader.prototype.request = function(){
    var query = this.req.query;
    if ( query && query.length ){
        var ret = {};
        query.split('&').forEach(function(delta){
            var index = delta.indexOf('=');
            var key, value;
            if ( index > -1 ){
                key = delta.substring(0, index);
                value = delta.substring(index + 1);
            }else{
                key = delta;
                value = '';
            }
            if ( ret[key] !== undefined ){
                if ( utils.type(ret[key], 'Array') ){
                    if ( ret[key].indexOf(value) === -1 ){
                        ret[key].push(value);
                    }
                }else{
                    if ( ret[key] !== value ){
                        ret[key] = [ret[key]];
                        ret[key].push(value);
                    }
                }
            }else{
                ret[key] = value;
            }
        });
        query = ret;
    }else{
        query = {};
    }
    this.req.query = query;
};

loader.prototype.fetch = function(uri, callback){
    var ms = new model(path.dirname(this.req.pathname), this.map);
    ms.create(uri, callback);
};

window.SoyieRequire = module.exports = function(uri, callback){
    var load = new loader(window.location.href);
    load.fetch(uri, callback);
};