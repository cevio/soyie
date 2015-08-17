/**
 * Created by evio on 15/8/15.
 */
var ajax = require('./ajax');
var removeComment = require('./removeComment');
var deps = require('./deps');
var path = require('path');

var model = module.exports = function(dirname, map){
    this.__dirname = dirname;
    this.map = map;
};

model.prototype.create = function(uri, callback){
    var which = path.resolve(this.__dirname, uri);
    var ext = path.extname(which).toLowerCase();
    if ( ['.js', '.json'].indexOf(ext) === -1 ){ which += '.js'; }
    var __dirname = path.dirname(which);
    var __filename = which;
    var that = this;

    if ( that.map[__filename] ){
        if ( that.map[__filename].status != 200 ){
            delay(function(){
                return that.map[__filename].status == 200;
            }, function(){
                typeof callback === 'function' && callback(that.map[__filename].exports);
            });
        }else{
            typeof callback === 'function' && callback(that.map[__filename].exports);
        }
        return;
    }

    that.map[__filename] = {};
    that.map[__filename].status = 0;
    ajax(__filename, function(code){
        that.map[__filename].status = 201;
        if ( ext == '.json' ){
            that.map[__filename].exports = JSON.parse(code);
            that.map[__filename].status = 200;
            typeof callback === 'function' && callback(that.map[__filename].exports);
        }else{
            that.make(__dirname, __filename, code, deps(removeComment(code)), callback);
        }
    });
};

model.prototype.make = function(__dirname, __filename, code, deps, callback){
    var codeString = new Function('exports', 'require', 'module', '__dirname', '__filename', '__devmodel', code);
    var that = this;
    this.loadDeps(deps, __dirname, __filename, function(){
        var xmodule = new LoadModule(__dirname, that.map);
        var expose = xmodule.exports = {};
        xmodule.constructor = codeString;
        codeString(expose, xmodule.require.bind(xmodule), xmodule, __dirname, __filename, true);
        that.map[__filename].exports = xmodule.exports;
        that.map[__filename].status = 200;
        typeof callback === 'function' && callback(that.map[__filename].exports);
    });
};

model.prototype.loadDeps = function(deps, __dirname, __filename, callback, i){
    if ( !i ) i = 0;
    this.map[__filename].status = 202 + i;

    if ( deps.length === 0 || !deps[i] ){
        callback();
        return;
    }
    var ms = new model(__dirname, this.map);
    var that = this;
    ms.create(deps[i], function(){
        that.loadDeps(deps, __dirname, __filename, callback, i + 1);
    });
};

function LoadModule(dirname, map){
    this.exports = {};
    this.__dirname = dirname;
    this.map = map;
}

LoadModule.prototype.require = function(uri){
    uri = path.resolve(this.__dirname, uri);
    var ext = path.extname(uri).toLowerCase();
    if ( ['.js', '.json'].indexOf(ext) === -1 ){ uri += '.js'; }
    return this.map[uri].exports;
};

function delay(fn, foo){
    if ( fn() ){
        typeof foo === 'function' && foo();
    }else{
        setTimeout(function(){
            delay(fn, foo);
        }, 10);
    }
}