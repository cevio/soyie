var utils = require('../utils');
var repeatSource = require('./repeat');
var ScopeParent = require('../data-observer/scope-parent');

var createRepeatConstructor = module.exports = function(DOM){
    this.element = DOM;
    this.alias = null;
    this.realy = null;
    this.deep = new ScopeParent();
    this.alone = true;
    this.template = null;
    this.commentStartNode = null;
    this.commentEndNode = null;
    this.fragment = document.createDocumentFragment();
    this.objects = [];
    this.oldValue = null;
};

createRepeatConstructor.prototype.getCommandInVars = function(DEEP, _ALIAS, rebuild){
    var expression = this.element.getAttribute('es-repeat').trim();
    var expressExec = utils.REGEXP_COMMAND_IN.exec(expression);
    this.element.removeAttribute('es-repeat');
    this.expression = expression;
    this._ALIAS = _ALIAS;

    this.useAlias = true;
    this.expressExec = true;
    this.deep.parent = DEEP;
    this.deep.pather = DEEP.locals;

    if ( !expressExec ){
        this.expressExec = false;
        this.useAlias = false;
        this.deep.locals = DEEP.locals + utils.makeDeepOnRealy(expression, _ALIAS);
        this.deep.router = DEEP.router + '-' + utils.makeRouterOnRealy(expression, _ALIAS);
        return this;
    }

    this.alias = expressExec[1];
    this.realy = expressExec[2];
    this.deep.locals = DEEP.locals + utils.makeDeepOnRealy(this.realy, _ALIAS);
    this.deep.router = DEEP.router + '-' + utils.makeRouterOnRealy(this.realy, _ALIAS);

    return this;
};

createRepeatConstructor.prototype.rebuild = function(){
    this.deep.pather = this.deep.parent.locals;

    if ( !this.expressExec ){
        this.deep.locals = this.deep.parent.locals + utils.makeDeepOnRealy(this.expression, this._ALIAS);
        return this;
    }

    this.deep.locals = this.deep.parent.locals + utils.makeDeepOnRealy(this.realy, this._ALIAS);

    return this;
};

createRepeatConstructor.prototype.init = function(DEEP, _ALIAS){
    this.getCommandInVars(DEEP, _ALIAS);
    this.freeze();
};

createRepeatConstructor.prototype.freeze = function(){
    var cloneNodeElement = this.element.cloneNode(true);
    var parentNodeDom = this.element.parentNode;
    this.template = cloneNodeElement;
    this.commentStartNode = document.createComment('Repeat Start');
    this.commentEndNode = document.createComment('Repeat End');
    this.fragment.appendChild(this.commentStartNode);
    this.fragment.appendChild(this.commentEndNode);
    parentNodeDom.replaceChild(this.fragment, this.element);
};

createRepeatConstructor.prototype.append = function(index){
    var deep = this.deep.locals + "['" + index + "']";
    var _deep = this.deep.router + '-' + index;
    var single = new repeatSource();
    single.deep.locals = deep;
    single.deep.router = _deep;
    single.deep.parent = this.deep;
    single.deep.pather = this.deep.pather;
    single.constructer = createRepeatConstructor;
    single.parent = this;
    single.element = this.template.cloneNode(true);
    single.index = index;
    single.all();
    this.commentEndNode.parentNode.insertBefore(single.element, this.commentEndNode);
    this.objects.push(single);
    return single;
};

createRepeatConstructor.prototype.remove = function(index){
    var router = this.deep.locals + "['" + index + "']";
    for ( var i = 0 ; i < this.objects.length ; i++ ){
        var object = this.objects[i];
        if ( object.deep.locals === router ){
            object.element.parentNode.removeChild(object.element);
            this.objects.splice(i, 1);
            break;
        }
    }
};

createRepeatConstructor.prototype.each = function(scope, foo){
    var data = utils.get(this.deep.locals, scope);
    this.oldValue = data;
    if ( utils.type(data, 'Object') ){
        for ( var key in data ){
            foo.call(this, key, data[key], data);
        }
    }

    else if ( utils.type(data, 'Array') ){
        for ( var index = 0 ; index < data.length ; index++ ){
            foo.call(this, index, data[index], data);
        }
    }

    return this;
};

createRepeatConstructor.prototype.render = function(scope){
    return this.each(scope, function(key){
        var single = this.append(key);
        single.render(scope, key);
    });
};

createRepeatConstructor.prototype.update = function(scope, options){
    var that = this;
    if ( options && options.router && options.index !== undefined && options.type && this.deep.locals === options.router ){
        if ( options.type === 'add' ){
            if ( options.index > -1 ){
                var single = this.append(options.index);
                single.render(scope, options.index);
            }else{
                this.render(scope);
            }
        }
        else if ( options.type === 'remove' ){
            this.remove(options.index);
            var len = this.objects.length - 1;
            var removeIndex = -1;
            if ( options.index > len ){
                removeIndex = len;
            }else{
                removeIndex = options.index;
            }
            this.objects.slice(removeIndex).forEach(function(object, index){
                object.index = removeIndex + index;
                object.deep.locals = that.deep.locals + "['" + object.index + "']";
                object.update(scope, object.index, object.parent.alias, {
                    type: 'rebuild'
                });
            });
        }
        else if ( options.type === 'change' ){
            var changeObject = (function(index){
                var router = this.deep.locals + "['" + index + "']";
                var ret = null;
                for ( var i = 0 ; i < this.objects.length ; i++ ){
                    var object = this.objects[i];
                    if ( object.deep.locals === router ){
                        ret = object;
                        break;
                    }
                }
                return ret;
            }).call(this, options.index);
            if ( changeObject ){
                changeObject.update(scope, options.index, changeObject.parent.alias);
            }
        }
    }
    else if ( options && options.type === 'rebuild' ){
        this.objects.forEach(function(object, index){
            object.deep.locals = object.deep.parent.locals + "['" + index + "']";
            object.deep.pather = object.deep.parent.pather;
            object.update(scope, index, object.parent.alias, {
                type: 'rebuild'
            });
        });
    }
    else{
        this.objects.forEach(function(object){
            object.update(scope, options);
        });
    }
};