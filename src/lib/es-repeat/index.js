var BLOCK = require('./block');
module.exports = function(SCOPE, NODE){
    var block = new BLOCK(NODE);
    block.scope.$this = SCOPE;
    block.scope.$parent = SCOPE;
    block.grunt();
    block.scope.$resolvePath();
    block.compile();
    //block.relation();
    return [block];
};