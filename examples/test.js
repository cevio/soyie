/**
 * Created by evio on 15/9/14.
 */
require('./test.html');
var soyie = require('../src/index');

soyie.ready(() => {
    soyie.bootstrap('app', function(){
        var that = this;
        var data = { phoneNumber: '', password: '' };
        data.submit = function(){
            console.log(that)
        };
        this.tree = data;
    });
});