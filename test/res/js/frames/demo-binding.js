/**
 * Created by evio on 15/8/12.
 */
var which = 'demo-binding';
var data = require('../../../package.json').data[which];
var page = module.exports = function(handle){
    page.installed = true;
    page.app = this;
    page.DOM = $("[page-router='" + which + "']");

    data.back = this.back.bind(this);
    Soyie(which, data);

    $.get('html/demo-binding.html', function(html){
        page.DOM.find('article').html(html);
        handle();
    });
};