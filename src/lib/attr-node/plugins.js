/**
 * Created by evio on 15/8/17.
 */
var plugin = module.exports = function(name, callback){
    plugin.exports[name] = callback;
};

plugin.exports = {};