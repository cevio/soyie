/**
 * Created by evio on 15/8/28.
 */
var attr = require('../../src/scan-node/attrscan');
var node = attr(document.getElementById('test'));
console.log(node);

var scope = {
    name: "evio",
    age: 20,
    lv: 33,
    dist: {
        a: 1,
        b: 2,
        c: {
            d: 4,
            e: 5
        }
    }
};

node.forEach(function(model){
    model.render(scope);
});