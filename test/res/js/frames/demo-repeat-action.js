/**
 * Created by evio on 15/8/12.
 */
var which = 'demo-repeat-action';
var data = require('../../../package.json').data[which];
var page = module.exports = function(handle){
    page.installed = true;
    page.app = this;
    page.DOM = $("[page-router='" + which + "']");

    data.back = this.back.bind(this);
    $.get('html/' + which + '.html', function(html){
        page.DOM.find('article').html(html);
        Soyie(which, data);
        page.DOM.find('article').find('pre code').each(function(i, block){
            hljs.highlightBlock(block);
        });
        handle();
    });
};