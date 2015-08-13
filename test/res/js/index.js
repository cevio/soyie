/**
 * Created by evio on 15/8/12.
 */
var express = require('./lib/application');
var app = new express();
app.onStatus();
app.ready(function(){
    $('.layer').addClass('hide');
});