/**
 * Created by evio on 15/8/15.
 */
module.exports = function(code){
    var arr = [];
    if ( code.length > 0 ){
        var z = code.match(/[^\.]require\((["|'])([^\1]+?)\1\)/g);
        if ( z && z.length ){
            z.forEach(function(v){
                var t = /[^\.]require\((["|'])([^\1]+?)\1\)/g.exec(v);
                if ( t && t[2] ) arr.push(t[2]);
            });
        }
    }
    return arr;
};