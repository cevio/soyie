var component = require('./component');
var utils = require('./utils');
module.exports = function(name, node, factory, object, coms){
    var expose = new component(node);
    expose.coms = coms;
    utils.mixin(expose, factory(node), true);
    expose.parent = object;
    expose.pluginConstructor = module.exports;
    expose.__init__();
    expose.parent.objects.push(expose);
};