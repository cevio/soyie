/**
 * Created by evio on 15/8/12.
 */
var data = require('../../../package.json');
var url = require('url');
var utils = require('./utils');
var noop = function(){};

var construct = {
    "home": require('../frames/home'),
    "intro": require('../frames/intro'),
    "demo-binding": require('../frames/demo-binding')
};

var application = module.exports = function(){
    this.request();
};

application.prototype.request = function(){
    this.req = url.parse(window.location.href);
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
    if ( !this.req.query.page ){
        this.req.query.page = 'home';
    }
    this.lv = data.data[this.req.query.page].lv;
};

application.prototype.onStatus = function(){
    var that = this;
    $(window).on('popstate', function(){
        var currentState = history.state;
        if ( currentState.page && data.data[currentState.page] ){
            var lv = data.data[currentState.page].lv;
            if ( that.lv > lv ){
                that.back(currentState.page);
            }else{
                that.go(currentState.page);
            }
        }
    });
};

application.prototype.ready = function(handle){
    var page = this.req.query.page;
    if ( !page || page.length === 0 ){
        page = 'home';
    }
    if ( !construct[page] ){
        page = 'home';
    }
    history.replaceState({page:page}, data.data[page].title, '?page=' + page);
    construct[page].call(this, handle);
    $("[page-router='" + page + "']").removeClass('hide');
};

application.prototype.go = function(name){
    var domout = $('.channel:not(.hide)');
    var domin = $("[page-router='" + name + "']");
    var that = this;
    var no = false;
    if ( domout.size() === 0 ){
        domout = $("[page-router='" + this.req.query.page + "']");
        no = true;
    }
    if (!no) domout.addClass('slide-out-n');
    domin.addClass('slide-in-n');
    domin.add(domout).off('bsTransitionEnd').removeClass('hide');
    domin.on('bsTransitionEnd', function(){
        if (!no) domout.removeClass('slide').removeClass('slide-out-n').removeClass('slide-out');
        domin.removeClass('slide').removeClass('slide-in-n').removeClass('slide-in');
        history.pushState({page:name}, data.data[name].title, '?page=' + name);
        that.request();
        domout.addClass('hide');
        domin.removeClass('hide');
    });
    if ( !construct[name].installed ){
        $('.layer').removeClass('hide');
        construct[name].call(this, function(){
            $('.layer').addClass('hide');
            setTimeout(function(){
                if (!no) domout.addClass('slide').addClass('slide-out');
                domin.addClass('slide').addClass('slide-in');
            }, 30);
        });
    }else{
        setTimeout(function(){
            if (!no) domout.addClass('slide').addClass('slide-out');
            domin.addClass('slide').addClass('slide-in');
        }, 30);
    }
};

application.prototype.back = function(name){
    var domout = $('.channel:not(.hide)');
    var domin = $("[page-router='" + name + "']");
    var that = this;
    var no = false;
    if ( domout.size() === 0 ){
        domout = $("[page-router='" + this.req.query.page + "']");
        no = true;
    }
    if (!no) domout.addClass('back-out-n');
    domin.addClass('back-in-n');
    domin.add(domout).off('bsTransitionEnd').removeClass('hide');
    domin.on('bsTransitionEnd', function(){
        if (!no) domout.removeClass('slide').removeClass('back-out-n').removeClass('back-out');
        domin.removeClass('slide').removeClass('back-in-n').removeClass('back-in');
        history.pushState({page:name}, data.data[name].title, '?page=' + name);
        that.request();
        domout.addClass('hide');
        domin.removeClass('hide');
    });
    if ( !construct[name].installed ){
        $('.layer').removeClass('hide');
        construct[name].call(this, function(){
            $('.layer').addClass('hide');
            setTimeout(function(){
                if (!no) domout.addClass('slide').addClass('back-out');
                domin.addClass('slide').addClass('back-in');
            }, 30);
        });
    }else{
        setTimeout(function(){
            if (!no) domout.addClass('slide').addClass('back-out');
            domin.addClass('slide').addClass('back-in');
        }, 30);
    }
};