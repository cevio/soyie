/**
 * Created by evio on 15/9/9.
 */
var observe = require('./observer');
var utils = require('../utils');

var watcher = module.exports = function(object){
    this.object = object;
};

watcher.prototype.inject = function(){
    this.auto(this.object.source);
};

watcher.prototype.auto = function(scope, router){
    var type = utils.type(scope), obs, that = this; router = router || '';
    switch(type){
        case 'Object':
            obs = new observe.ObjectObserver(scope);
            obs.open(function(added, removed, changed, getOldValueFn) {
                Object.keys(added).forEach(function(property) {
                    that.addObject(property, added[property], router);
                });
                Object.keys(removed).forEach(function(property) {
                    that.removeObject(property, getOldValueFn(property), router);
                });
                Object.keys(changed).forEach(function(property) {
                    that.changeObject(property, changed[property], getOldValueFn(property), router);
                });
            });
            Object.keys(scope).forEach(function(key){
                if ( key === '$parent' ) return;
                that.auto(scope[key], router + "['" + key + "']");
            });
            break;
        case 'Array':
            obs = new observe.ArrayObserver(scope);
            obs.open(function(splices){
                splices.forEach(function(splice){
                    var index = splice.index;
                    // 修改数组
                    if ( splice.removed.length > 0 && splice.addedCount > 0 ){
                        that.changeArray(router, index);
                    }
                    // 删除数组
                    else if ( splice.removed.length > 0 && splice.addedCount === 0 ){
                        that.removeArray(router, index);
                    }
                    // 添加数组
                    else{
                        that.addArray(router, index);
                    }
                });
            });
            scope.forEach(function(object, index){
                that.auto(object, router + "['" + index + "']");
            });
            break;
    }
};

watcher.prototype.addObject = function(property, newvalue, router){
    if ( property === '$parent' ) return;
    this.auto(newvalue, router + "['" + property + "']");
    if ( utils.type(newvalue, 'Array') ){
        this.update({ router: router + "['" + property + "']", index: -1, type: 'add' });
    }else{
        this.update();
    }
};
watcher.prototype.removeObject = function(property, oldvalue, router){
    if ( property === '$parent' ) return;
    this.update();
};
watcher.prototype.changeObject = function(property, newvalue, oldvalue, router){
    if ( property === '$parent' ) return;
    this.auto(newvalue, router);
    this.update();
};



watcher.prototype.addArray = function(router, index){
    var newValue = utils.get(router, this.object.source)[index];
    this.auto(newValue, router + "['" + index + "']");
    this.update({ router: router, index: index, type: 'add' });
};
watcher.prototype.changeArray = function(router, index){
    var newValue = utils.get(router, this.object.source)[index];
    this.auto(newValue, router + "['" + index + "']");
    this.update({ router: router, index: index, type: 'change' });
};
watcher.prototype.removeArray = function(router, index){
    console.log({ router: router, index: index, type: 'remove' })
    this.update({ router: router, index: index, type: 'remove' });
};



watcher.prototype.update = function(){
    var scope = this.object.source;
    var args = [scope].concat(utils.slice.call(arguments, 0));
    this.object.objects.forEach(function(object){
        object.update.apply(object, args);
    });
};