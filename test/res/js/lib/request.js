/**
 * Created by evio on 15/7/10.
 */
var EventEmitter = Soyie.EventEmitter;
var utils = require('../../../../lib/utils');
var isArray = Array.isArray;
var global = window.location;

var request = exports = module.exports = function(locations){
    request._handle(locations, function(){
        request.emit('change', request);
    });
    return request;
};

utils.mixin(request, new EventEmitter());

request._url = global.href;
request._host = global.host;
request._path = global.pathname;
request._protocol = global.protocol;
request._port = global.port;
request._hash = global.hash;
request._search = global.search;
request._title = document.title;
request.query = {};

Object.defineProperty(request, 'url', {
    get: function(){
        return request._url;
    },
    set: function(url){
        request._url = url;
        if ( history.replaceState ){
            history.replaceState(null, request.title, url);
            request(url);
        }else{
            window.location.href = url;
        }
    }
});

Object.defineProperty(request, 'title', {
    get: function(){
        return request._title;
    },
    set: function(title){
        request._title = title;
        var $body = $('body');
        document.title = title;
        // hack在微信等webview中无法修改document.title的情况
        var $iframe = $('<iframe src="/favicon.ico"></iframe>').on('load', function() {
            setTimeout(function() {
                $iframe.off('load').remove();
            }, 0);
        }).appendTo($body);
    }
});

Object.defineProperty(request, 'protocol', {
    get: function(){
        return request._protocol;
    },
    set: function(value){
        var arr = ['http', 'https', 'ws'];
        value = value.toLowerCase().replace(/\:$/, '');
        if ( arr.indexOf(value) === -1 ){
            console.error('url protocol type error. you got a value of ' + value);
            return;
        }
        value += ':';
        request._protocol = value;
    }
});

Object.defineProperty(request, 'host', {
    get: function(){
        return request._host;
    },
    set: function(value){
        if ( value.indexOf('/') > -1 ){
            console.error('url host error. you got a value of ' + value);
        }
        request._host = value;
    }
});

Object.defineProperty(request, 'port', {
    get: function(){
        return request._port;
    },
    set: function(value){
        if ( isNaN(value) ){
            console.error('url port error. you got a value of ' + value);
        }
        request._port = value;
    }
});

Object.defineProperty(request, 'path', {
    get: function(){
        return request._path;
    },
    set: function(value){
        if ( !/^\//.test(value) ){
            value = '/' + value;
        }
        request._path = value;
    }
});

Object.defineProperty(request, 'hash', {
    get: function(){
        return request._hash;
    },
    set: function(value){
        if ( !/^\#/.test(value) ){
            value = '#' + value;
        }
        request._hash = value;
    }
});

Object.defineProperty(request, 'search', {
    get: function(){
        return request._search;
    },
    set: function(value){
        if ( typeof value === 'object' ){
            value = request._formatSearcher(value);
        }
        if ( !/^\?/.test(value) ){
            value = '?' + value;
        }
        request._search = value;
        request.query = request._parseSearcher(value);
    }
});

request._handle = function(locations, next){
    if ( typeof locations === 'object' ){
        utils.mixin(request, locations);
    }
    else {
        var pos_http = locations.indexOf ('//');
        request.protocol = locations.substring (0, pos_http);
        locations = locations.substring (pos_http + 2);
        var pos_hostname = locations.indexOf ('/');
        request.host = locations.substring (0, pos_hostname);
        locations = locations.substring (pos_hostname);
        var pos_path = locations.indexOf ('?');
        request.path = locations.substring (0, pos_path);
        locations = locations.substring (pos_path);
        var pos_search = locations.lastIndexOf ('#');

        if ( pos_search > -1 ){
            request.search = locations.substring (0, pos_search);
            request.hash = locations.substring (pos_search);
        }else{
            request.search = locations;
            request.hash = '';
        }

        var pos_port = request._host.indexOf (':');
        if (pos_port > -1) {
            request.port = request.host.substring (pos_port + 1);
            request.host = request.host.substring (0, pos_port);
        }
        else {
            request.port = '';
        }
    }

    next();
};

request._parseSearcher = function(str){
    var query = {};
    str.replace(/^\?/, '').split('&').forEach(function(searcher){
        var uri = searcher.indexOf('=');
        var uriKey, uriValue;

        if ( uri > -1 ){
            uriKey = searcher.substring(0, uri);
            uriValue = decodeURIComponent(searcher.substring(uri + 1));
        }else{
            console.error('parse uri error.');
        }

        if ( !query[uriKey] ) {
            query[uriKey] = uriValue;
        }
        else {
            if ( !isArray(query[uriKey]) ) {
                query[uriKey] = [query[uriKey]];
            }
            query[uriKey].push(uriValue);
        }
    });
    return query;
};

request._formatSearcher = function(obj){
    var str = [];
    for ( var i in obj ){
        var o = obj[i];
        if ( isArray(o) ){
            o.forEach(function(t){
                str.push(i + '=' + encodeURIComponent(t));
            });
        }else{
            str.push(i + '=' + encodeURIComponent(o));
        }
    }
    return '?' + str.join('&');
};

request.parse = function(){
    var str = request.protocol + '//' + request.host;
    if ( request.port != '80' && request.port.length !== 0 ){
        str += ':' + request.port;
    }
    str += request.path;
    if ( request.search.length > 0 ){
        str += request.search;
    }
    if ( request.hash.replace(/^\#/, '').length > 0 ){
        str += request.hash;
    }
    return str;
};

request.isWx = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
