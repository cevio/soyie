/**
 * Created by evio on 15/8/15.
 */
var r1 = /\/\*[\s\S]+?\*\//g;
var r2 = /\/\/[^\n]+\n/g;
module.exports = function(code){
    return code.replace(r1, '').replace(r2, '');
};