var component = require('./component');
var utils = require('./utils');
module.exports = function(name, node, factory, object){
    var expose = new component(node);
    utils.mixin(expose, factory(node), true);
    expose.parent = object;
    expose.pluginConstructor = module.exports;
    expose.__init__();
    expose.parent.objects.push(expose);
};