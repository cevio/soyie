var observe = require('./observe');
var utils = require('../utils');
var observers = {};
exports.observers = observers;

exports.add = function(property, newValue, pather, vm){
    pather += '-' + property;
    exports.listen(newValue, pather, vm);
    exports.createCommonWatcher(vm);
};

exports.remove = function(property, oldValue, pather, vm){
    pather += '-' + property;
    if ( utils.type(oldValue, 'Object') ){
        DeleteObservers(pather);
    }
    var bs = function(p){
        return p.replace(/\-/g, '\\\-').replace(/\#/g, '\\\#').replace(/\_/g, '\\\_');
    };
    var bs_pather = '^' + bs(pather) + '(\\-)?';
    var sandbox = function(VM){
        VM.objects.forEach(function(object){
            if ( object.alone ){
                object.objects.forEach(function(obj){
                    sandbox(obj);
                });
            }else{
                object.dependencies.forEach(function(dep){
                    if ( dep === pather || new RegExp(bs_pather).test(dep) ){
                        object.render();
                        object.relation();
                    }
                });
            }
        });
    };
    sandbox(vm);
};

exports.change = function(property, newValue, oldValue, pather, vm){
    pather += '-' + property;
    try{
        if ( utils.type(newValue, 'Object') ){
            exports.listen(newValue, pather, vm);
            exports.createCommonWatcher(vm);
        }else{
            var sandbox = function(VM){
                VM.objects.forEach(function(object){
                    if ( object.alone ){
                        object.objects.forEach(function(obj){
                            if ( obj.scope.$path !== pather ){
                                sandbox(obj);
                            }
                        });
                    }else{
                        if ( object.objects ){
                            sandbox(object);
                        }else{
                            if ( object.dependencies.indexOf(pather) > -1 ){
                                object.render();
                            }
                        }
                    }
                });
            };
            sandbox(vm);
        }
    }catch(e){
        console.log(e)
    }

};

exports.listen = function listen(value, pather, obsViewObject){
    switch ( utils.type(value) ){
        case 'Object':
            exports.createObjectWatcher(value, pather, obsViewObject);
            break;
        case 'Array':
            exports.createArrayWatcher(value, pather, obsViewObject);
            break;
    }
};

exports.createObjectWatcher = function createObjectWatcher(newValue, pather, vm){
    var obs = new observe.ObjectObserver(newValue);
    obs.open(function(added, removed, changed, getOldValueFn) {
        Object.keys(added).forEach(function(property) {
            exports.add(property, added[property], pather, vm);
        });
        Object.keys(removed).forEach(function(property) {
            exports.remove(property, getOldValueFn(property), pather, vm);
        });
        Object.keys(changed).forEach(function(property) {
            exports.change(property, changed[property], getOldValueFn(property), pather, vm);
        });
    });
    Object.keys(newValue).forEach(function(key){
        exports.listen(newValue[key], pather + '-' + key, vm);
    });
    observers[pather] = obs;
    return obs;
};

exports.createArrayWatcher = function createArrayWatcher(newValue, pather, vm){
    var obsViewObject = null;
    vm.objects.forEach(function(object){
        if ( object.alone && object.scope.$path === pather ){
            obsViewObject = object;
        }
    });
    if ( obsViewObject ){
        var obs = new observe.ArrayObserver(newValue);
        obs.open(function(splices) {
            splices.forEach(function(splice) {
                var index = splice.index;
                var _pather = pather + '-' + index;
                // 修改数组
                if ( splice.removed.length > 0 && splice.addedCount > 0 ){
                    var sandbix = function(vm, _pather, _value, index){
                        vm.objects.forEach(function(object){
                            if ( object.scope.$path === _pather ){
                                object.parent.scope.$this[index] = object.scope[object.scope.$alias] = object.scope.$this = _value;
                                object.render(true);
                                object.relation();
                                exports.listen(_value, _pather, vm);
                                object.objects.forEach(function(obj){
                                    if ( obj.alone ){
                                        obj.objects.forEach(function(o, _index){
                                            var _realy = utils.fromatRealy(o.scope.$realy);
                                            var p = _pather + '-' + _realy.replace(/\./g, '-') + '-' + _index;
                                            var x = utils.transform(_realy, _value);
                                            sandbix(obj, p, x[_index], _index);
                                        });
                                    }
                                })
                            }
                        });
                    };
                    sandbix(obsViewObject, _pather, newValue[index], index);
                }
                // 删除数组
                else if ( splice.removed.length > 0 && splice.addedCount === 0 ){
                    obsViewObject.$remove(_pather, function(vm){
                        exports.listen(vm.scope.$this, _pather, vm);
                    });
                }
                // 添加数组
                else{
                    var value = newValue[splice.index];
                    var os = obsViewObject.$append(value);
                    exports.listen(value, _pather, os);
                }
            });
        });
        newValue.forEach(function(value, index){
            var os = null;
            obsViewObject.objects.forEach(function(object){
                if ( object.scope.$path === pather + '-' + index ){
                    os = object;
                }
            });
            if ( os ){
                exports.listen(value, pather + '-' + index, os);
            }
        });
        observers[pather] = obs;
        return obs;
    }
};

exports.createCommonWatcher = function createCommonWatcher(vm){
    vm.objects.forEach(function(object){
        if ( object.alone ){
            object.objects.forEach(function(obj){
                obj.render(true);
                obj.relation();
            });
        }else{
            object.render(true);
            object.relation();
        }
    });
};

function RemoveObservers(vm){
    vm.objects.forEach(function(object){
        object.objects.forEach(function(obj){
            if ( obj.alone ){
                RemoveObservers(obj);
            }else{
                DeleteObservers(obj.scope.$path);
            }
        });
        DeleteObservers(object.scope.$path);
    });
}

function DeleteObservers(pather){
    if ( observers[pather] ){
        observers[pather].close();
        delete observers[pather];
    }
}