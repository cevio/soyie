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
    this.stop = 0;
};

model.prototype.merge = function(dirname, modulename, callback){
    var which = path.resolve(dirname, './node_modules', modulename, 'package.json');
    var that = this;
    ajax(which, function(err, code){
        if ( !err ){
            code = JSON.parse(code);
            code.main = code.main || 'index.js';
            var ext = path.extname(code.main).toLowerCase();
            if ( ['.js', '.json'].indexOf(ext) === -1 ){ code.main += '.js'; }
            var p = path.resolve(dirname, './node_modules', modulename, code.main);
            callback(p);
        }else{
            if ( dirname === '/' ) that.stop++;
            var f = path.dirname(path.dirname(dirname));
            if ( err === 404 && that.stop < 2 ){
                that.merge(f, modulename, callback);
            }else{
                console.warn('can not find the package.');
            }
        }
    });
};

model.prototype.door = function(uri, callback, alias){
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
    if ( alias ){
        that.map[alias] = that.map[__filename];
    }
    ajax(__filename, function(err, code){
        if ( !err ){
            that.map[__filename].status = 201;
            if ( ext == '.json' ){
                that.map[__filename].exports = JSON.parse(code);
                that.map[__filename].status = 200;
                typeof callback === 'function' && callback(that.map[__filename].exports);
            }else{
                that.make(__dirname, __filename, code, deps(removeComment(code)), callback);
            }
        }else{
            if ( err === 404 ){

            }
        }
    });
};

model.prototype.create = function(uri, callback){
    var that = this;
    if ( uri.indexOf('./') == -1 ){
        var m = uri;
        this.merge(this.__dirname, uri, function(uri){
            that.door(uri, callback, m);
        });
    }else{
        that.door(uri, callback);
    }
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
    if ( uri.indexOf('./') == -1 ){
        if ( this.map[uri] ){
            return this.map[uri].exports;
        }
    }else{
        uri = path.resolve(this.__dirname, uri);
        var ext = path.extname(uri).toLowerCase();
        if ( ['.js', '.json'].indexOf(ext) === -1 ){ uri += '.js'; }
        console.info('Cmd require cache: ' + uri, this.map);
        return this.map[uri].exports;
    }
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