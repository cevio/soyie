/**
 * Created by evio on 15/8/12.
 */
var data = require('../../../package.json').data.intro;
var page = module.exports = function(handle){
    data.back = this.back.bind(this);
    Soyie('intro', data);
    page.installed = true;
    page.app = this;
    page.DOM = $("[page-router='intro']");
    handle();
};