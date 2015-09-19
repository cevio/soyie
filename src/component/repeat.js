/**
 * 加载component组件模型
 */
import {COMPONENT} from './index';
import * as utils from '../utils';
import * as watcher from '../scope/watcher';

export class RepeatBlock extends COMPONENT {
    constructor(node){
        super(node);
        this.fragment = utils.createNodeCopier();
        this.namespace = 'repeat-block';
        this.props = {
            source: { type: [], required: true },
            parent: { type: [], required: false }
        };
    }
    init(){
        this.injectProps();
        this.commentStartNode = document.createComment('Repeat Start');
        this.commentEndNode = document.createComment('Repeat End');
        this.fragment.appendChild(this.commentStartNode);
        this.fragment.appendChild(this.commentEndNode);
        this.virtualDom.parentNode.replaceChild(this.fragment, this.virtualDom);
        this._init && this._init();
    }
    append(){
        let single = new RepeatSingle();
        let node = utils.createHtmlNode(this.template);
        this.commentEndNode.parentNode.insertBefore(node.node, this.commentEndNode);
        this.DOMSCAN(node, single);
        single.element = node;
        this.components.push(single);
        return single;
    }
    render(scope){
        if ( scope ) this.parent = scope;
        let source = utils.get(this.keys['source'], this.parent);
        let parent = this.getParent();
        let err;
        if ( !(err = this.state('parent', parent)) ){
            (this.scope = source).forEach((data, index) => this.add(data, parent, index, this.scope));
        }else{
            throw err;
        }
        watcher.create(source, this);
    }
    update(){
        let source = utils.get(this.keys['source'], this.parent);
        let parent = this.getParent();
        let err;
        if ( !(err = this.state('parent', parent)) ){
            (this.scope = source).forEach((data, index) =>{
                // TODO FIX IT: console.log(JSON.stringify(this.scope));
                this.components[index] && this.components[index].update({ source: data, parent: parent, $index: index });
            });
        }else{
            throw err;
        }
        watcher.create(source, this);
    }
    remove(index){
        if ( index !== undefined ){
            if ( this.components[index] ){
                this.components[index].remove();
                this.components.$remove(index);
            }
        }else{
            var i = this.components.length;
            while (i--){
                this.remove(i);
            }
        }
    }
    add(scope, parent, index, data){
        let err;
        if ( !(err = this.state('source', scope)) ){
            let single = this.append();
                single.parent = this.parent;
                single.root = this;
                single.render({ source: scope, parent: parent, $index: index });

            this.watch(data, index, parent);
        }else{
            throw err;
        }
    }
    watch(data, index, parent){
        var temp = data[index];
        Object.defineProperty(data, index, {
            get: () => { return temp; },
            set: (val) => {
                temp = val;
                let vm = this.components[index];
                vm.update({ source: temp, parent: parent, $index: index });
                this.watch(this.scope, index, parent);
            }
        });
        this.watchObject(data[index], this.components[index]);
    }
    watchObject(data, vm){
        if ( utils.type(data, 'Object') ){
            watcher.create(data, vm);
            for ( var key in data ){
                this.watchObject(data[key], vm);
            }
        }
    }
    getParent(){
        return utils.get(this.keys['parent'], this.parent);
    }
}

export class RepeatSingle {
    constructor(){
        this.objects = [];
        this.components = [];
        this.namespace = 'repeat-single';
        this.parent = null;
        this.scope = null;
    }
    render(scope){
        if ( scope ) this.scope = scope;
        watcher.create(this.scope, this);
        this.objects.forEach(object => object.render(this.scope));
        this.components.forEach(object => object.render(this.scope));
    }
    update(scope){
        if ( scope ) this.scope = scope;
        watcher.create(this.scope, this);
        this.components.forEach(object => {
            object.parent = this.scope;
            object.update();
        });
        this.objects.forEach(object => object.update(this.scope));
    }
    remove(){
        var next = this.element.start.nextSibling;
        var m = [];
        while ( true ){
            if ( next === this.element.end || !next ){
                break;
            }else{
                m.push(next);
                next = next.nextSibling;
            }
        }
        m.forEach(node => node.parentNode.removeChild(node));
        this.root.components.$remove(this);
    }
}