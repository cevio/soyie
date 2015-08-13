/**
 * Created by evio on 15/8/12.
 */
var which = 'demo-repeat';
var marked = require('marked');
var data = require('../../../package.json').data[which];
var page = module.exports = function(handle){
    page.installed = true;
    page.app = this;
    page.DOM = $("[page-router='" + which + "']");

    var _data = JSON.parse(JSON.stringify(data));
    data.back = this.back.bind(this);

    $.get('html/' + which + '.html', function(html){
        page.DOM.find('article').html(html);
        var html = page.DOM.find('article .sec-demo').html();
        Soyie(which, data);
        page.DOM.find('article .demo-html').html(marked('``` html\n' + html + '\n```'));
        page.handle(_data);
        page.DOM.find('article').find('pre code').each(function(i, block){
            hljs.highlightBlock(block);
        });
        handle();
    });
};

page.handle = function(data){
    Soyie('demo-repeat-example', data);
};