var utils = require('../utils');
var repeatSource = require('./repeat');
var ScopeParent = require('../data-observer/scope-parent');

var createRepeatConstructor = module.exports = function(DOM){
    this.element = DOM;
    this.deep = new ScopeParent();
    this.alone = true;
    this.template = null;
    this.commentStartNode = null;
    this.commentEndNode = null;
    this.fragment = document.createDocumentFragment();
    this.objects = [];
};

createRepeatConstructor.prototype.format = function(){
    this.expression = this.element.getAttribute('es-repeat').trim();
    this.element.removeAttribute('es-repeat');
    return this.rebuild();
};

createRepeatConstructor.prototype.rebuild = function(){
    this.deep.parent = this.parent.deep;
    this.deep.locals = this.deep.parent.locals + utils.makeDeepOnExpression(this.expression);
    return this;
};

createRepeatConstructor.prototype.init = function(){
    this.format(); this.freeze();
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
    var single = new repeatSource();
    single.constructer = createRepeatConstructor;
    single.coms = this.coms;
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
    if (
        options
        && options.router
        && options.index !== undefined
        && options.type
        && this.deep.locals === options.router
    ){
        if ( options.type === 'add' ){
            if ( options.index > -1 ){
                var single = this.append(options.index);
                single.render(scope);
            }else{
                this.render(scope);
            }
        }
        else if ( options.type === 'remove' ){
            this.remove(options.index);
            var len = this.objects.length - 1, removeIndex = -1;
            if ( options.index > len ){ removeIndex = len; }
            else{ removeIndex = options.index;}
            this.objects.slice(removeIndex).forEach(function(object, index){
                object.index = removeIndex + index;
                object.update(scope, { type: 'rebuild' });
            });
        }
        else if ( options.type === 'change' ){
            this.objects[options.index].update(scope);
        }
    }
    else if ( options && options.type === 'rebuild' ){
        this.rebuild();
        this.objects.forEach(function(object, index){
            object.index = index;
            object.update(scope, options);
        });
    }
    else{
        this.objects.forEach(function(object){
            object.update(scope, options);
        });
    }
};