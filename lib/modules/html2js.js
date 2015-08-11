/**
 * Created by evio on 15/8/5.
 */
var utils = require('../utils');
module.exports = function(template){
    var pools = [];

    template.split(utils.REGEXP_TAGSPILTOR).forEach(function(text, index){
        var isTextNodeElement = index % 2 === 1;
        if ( isTextNodeElement ){
            pools.push(text);
        }else{
            pools.push('"' + text.replace(/\"/g, '\\\\"') + '"')
        }
    });

    return function($scope){
        return utils.transform(pools.join(' + '), $scope);
    }
};