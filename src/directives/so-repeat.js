import * as utils from '../utils';
import watcher from '../scope/watcher';
import attrnode from '../use/attrnode';

export class Block {
    constructor(node){
        this.element = node;
        this.namespace = 'repeat-block';
        this.fragment = utils.createNodeCopier();
        this.expression = utils.formatExpression(node.getAttribute('so-repeat'));
        this.element.removeAttribute('so-repeat');
        this.template = this.element.cloneNode(true);
        this.parent = null;
        this.objects = [];
        this.components = [];
        this.installed = false;
    }

    init(){
        this.commentStartNode = document.createComment('Repeat Start');
        this.commentEndNode = document.createComment('Repeat End');
        this.fragment.appendChild(this.commentStartNode);
        this.fragment.appendChild(this.commentEndNode);
        this.element.parentNode.replaceChild(this.fragment, this.element);
    }

    notify(scope){
        let source = utils.get(this.expression, scope);
        if ( source && utils.type(source, 'Array') ){
            if ( !source.hasOwnProperty('__parent__') ) {
                utils.defineValue(source, '__parent__', scope);
            }else{
                source.__parent__ = scope;
            }
            watcher.create(source, this);
            this.removeAll();
            if ( source.length ){
                source.forEach((data, index) => {
                    this.add(source, index, scope);
                });
            }
            this.installed = true;
        }
    }

    removeAll(){
        let i = this.components.length;
        while (i--){
            this.components[i].remove();
        }
    }

    add(source, index, parent){
        let single = this.append();
        single.notify(source, index, parent);
        watcher.take(source, index, single);
    }

    append(){
        let single = new Single();
        let node = this.template.cloneNode(true);
        this.commentEndNode.parentNode.insertBefore(node, this.commentEndNode);
        single.objects = single.objects.concat(attrnode(node, single));
        this.DOMSCAN(node, single);
        single.element = node;
        single.root = this;
        this.components.push(single);
        return single;
    }
}

export class Single {
    constructor(){
        this.namespace = 'repeat-single';
        this.objects = [];
        this.components = [];
        this.arrays = [];
        this.scope = null;
    }

    notify(source, index, parent){
        if ( parent ){
            if (parent !== this.parent && this.parent && this.parent.__ob__) {
                this.parent.__ob__.vms.$remove(this);
            }
            this.parent = parent;
            watcher.create(this.parent, this);
        }
        const options = { $index: index, $parent: this.parent };
        this.objects.forEach(object => object.notify(source[index], options));
        this.arrays.forEach(array => {
            if ( !array.installed ){
                array.notify(source[index]);
            }
        });
        this.components.forEach(component => {
            if ( !component.installed ){
                component.notify(source[index]);
            }
        });
        this.watch(source[index]);
    }

    watch(scope){
        if ( !scope ) return;
        watcher.create(scope, this);
        Object.keys(scope).forEach(key => {
            if ( utils.type(scope[key], 'Object') ){
                this.watch(scope[key]);
            }
        });
    }

    remove(){
        this.element.parentNode.removeChild(this.element);
        this.root.components.$remove(this);
    }
}