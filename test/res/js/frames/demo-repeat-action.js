/**
 * Created by evio on 15/8/12.
 */
var which = 'demo-repeat-action';
var marked = require('marked');
var data = require('../../../package.json').data[which];
var page = module.exports = function(handle){
    page.installed = true;
    page.app = this;
    page.DOM = $("[page-router='" + which + "']");

    data.back = this.back.bind(this);
    $.get('html/' + which + '.html', function(html){
        page.DOM.find('article').html(html);
        data.append = page.append;
        data.prepend = page.prepend;
        var h = marked('``` html\n' + page.DOM.find('.sec-demo').html() + '\n```');
        page.vm = Soyie(which, data);
        page.DOM.find('.dt').html(h);
        page.DOM.find('article').find('pre code').each(function(i, block){
            hljs.highlightBlock(block);
        });
        handle();
    });
};

page.append = function(){
    page.vm.search('#-data', function(){
        this.$append({
            a: parseInt(Math.random() * 1000),
            b: parseInt(Math.random() * 1000)
        });
    });
};

page.prepend = function(){
    page.vm.search('#-data', function(){
        this.$prepend({
            a: parseInt(Math.random() * 1000),
            b: parseInt(Math.random() * 1000)
        });
    });
};