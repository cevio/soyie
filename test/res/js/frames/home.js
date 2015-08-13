/**
 * Created by evio on 15/8/12.
 */
var data = require('../../../package.json').data.home;
var page = module.exports = function(handle){
    Soyie('home', data);
    page.installed = true;
    page.app = this;
    page.DOM = $("[page-router='home']");
    page.DOM.find('a.bar').on('click', function(){
        var url = $(this).data('url');
        page.app.go(url);
    });
    handle();
};