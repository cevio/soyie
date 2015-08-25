var utils = require('../utils');

var Diff = module.exports = function(){
    this.append = function(){};
    this.remove = function(){};
};

Diff.prototype.watch = function(scope, data, pather){
    this.main(scope, data, pather || '#');
};

Diff.prototype.main = function(obj1, obj2, pather){
    var type1 = utils.type(obj1);
    var type2 = utils.type(obj2);
    if ( type1 !== type2 ){
        console.error('wrong type object');
        return;
    }

    if ( type2 === 'Object' ){
        for ( var i in obj2 ){
            if ( i === '$observeProps' ) continue;
            if ( !checkRel(obj1[i]) ){
                obj1[i] = obj2[i];
            }else{
                this.main(obj1[i], obj2[i], pather + '-' + i);
            }
        }
    }
    else if ( type2 === 'Array' ){
        this.array(obj1, obj2, pather);
    }
    else{
        obj1 = obj2;
    }
    return this;
};

Diff.prototype.array = function(obj1, obj2, pather){
    var len1 = obj1.length;
    var len2 = obj2.length;
    var that = this;
    if ( len1 === len2 ){
        obj2.forEach(function(obj, index){
            if ( !checkRel(obj1[index]) ){
                obj1[index] = obj;
            }else{
                that.main(obj1[index], obj, pather + '-' + index);
            }
        });
    }
    else if ( len1 < len2 ){
        obj2.forEach(function(obj, index){
            if ( obj1[index] !== undefined ){
                if ( !checkRel(obj1[index]) ){
                    obj1[index] = obj;
                }else{
                    that.main(obj1[index], obj, pather + '-' + index);
                }
            }else{
                that.append(pather, obj, index);
            }
        });
    }
    else{
        obj1.forEach(function(obj, index){
            if ( obj2[index] !== undefined ){
                if ( !checkRel(obj1[index]) ){
                    obj1[index] = obj2[index];
                }else{
                    that.main(obj, obj2[index], pather + '-' + index);
                }
            }else{
                // TODO: remove data.
                that.remove(pather, obj, index);
            }
        });
    }
    return this;
};

function checkRel(obj){
    return ['Object', 'Array'].indexOf(utils.type(obj)) > -1;
}