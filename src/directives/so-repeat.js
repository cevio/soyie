import * as utils from '../utils';
import * as watcher from '../scope/watcher';

export class Block {
    constructor(node){
        this.element = node;
        this.namespace = 'repeat-block';
        this.fragment = utils.createNodeCopier();
        this.expression = utils.formatExpression(node.getAttribute('so-repeat'));
        this.element.removeAttribute('so-repeat');
        this.template = this.element.cloneNode(true);
        this.parent = null;
        this.scope = null;
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

    render(scope = this.parent){
        this.parent = scope;
        let source = utils.get(this.expression, this.parent);
        if ( source && utils.type(source, 'Array') && source.length > 0 ){
            (this.scope = source).forEach((data, index) => {
                this.add(data, index);
            });
            this.installed = true;
            watcher.create(this.scope, this);
        }
    }

    update(scope = this.parent){
        this.parent = scope;
        if ( !this.installed ){ this.render(this.parent); }
        else{
            let source = utils.get(this.expression, this.parent);
            if ( source && utils.type(source, 'Array') && source.length > 0 ){
                this.scope = source;
                if ( this.scope.length > this.components.length ){
                    (() => {
                        var index = this.scope.length;
                        while (index--){
                            if ( !this.components[index] ){
                                this.add(this.scope[index], index);
                            }else{
                                this.components[index].update(this.scope[index], index, this.parent);
                            }
                        }
                    }).call(this);
                }
                else if ( this.scope.length < this.components.length ){
                    (() => {
                        var index = this.components.length;
                        while (index--){
                            if ( this.scope[index] === undefined ){
                                this.components[index].remove();
                            }else{
                                this.components[index].update(this.scope[index], index, this.parent);
                            }
                        }
                    }).call(this);
                }else{
                    this.scope.forEach((data, index) => this.components[index].update(data, index, this.parent));
                }

            }else{
                this.scope = [];
                var i = this.components.length;
                while (i--){
                    this.components[i].remove();
                }
            }
        }
    }

    add(data, index){
        let single = this.append();
        single.render(data, index, this.parent);
        this.watch(this.scope, index, this.parent);
        watcher.create(data, this.parentroot);
    }

    append(){
        let single = new Single();
        let node = this.template.cloneNode(true);
        this.commentEndNode.parentNode.insertBefore(node, this.commentEndNode);
        this.DOMSCAN(node, single);
        single.element = node;
        single.root = this;
        this.components.push(single);
        return single;
    }

    watch(data, index, parent){
        let obsindexs = data.hasOwnProperty('__obsindexs__') ? data.__obsindexs__ : null;
        if ( !obsindexs ){
            utils.defineValue(data, '__obsindexs__', obsindexs = {});
        }

        if ( !obsindexs[index] ){
            obsindexs[index] = { value: data[index], vms: [this] };
            Object.defineProperty(data, index, {
                get: function(){ return obsindexs[index].value; },
                set: (val) => {
                    obsindexs[index].value = val;
                    obsindexs[index].vms.forEach(VM => {
                        let vm = VM.components[index];
                        if ( vm ){
                            vm.update(obsindexs[index].value, index, parent);
                        }else{
                            this.add(obsindexs[index].value, index);
                        }
                    });
                }
            });
        }else{
            if ( obsindexs[index].vms.indexOf(this) == -1 ){
                obsindexs[index].vms.push(this);
            }
        }

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

    remove(index){
        this.components[index] && this.components[index].remove();
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

    render(scope = this.scope, index = 0, parent = {}){
        this.scope = scope;
        this.options = { $index: index, $parent: parent };
        this.objects.forEach(object => object.render(this.scope, this.options));
        this.arrays.forEach(array => array.update(this.scope, this.options));
        this.components.forEach(object => object.render(this.scope, this.options));
    }

    update(scope = this.scope, index = -1, parent = null){
        this.scope = scope;
        if ( index > -1 ) this.options.$index = index;
        if ( parent != null ) this.options.$parent = parent;
        this.objects.forEach(object => object.update(this.scope, this.options));
        this.arrays.forEach(array => array.update(this.scope, this.options));
        this.components.forEach(object => {
            object.parent = this.scope;
            object.update();
        });
    }

    remove(){
        this.element.parentNode.removeChild(this.element);
        this.root.components.$remove(this);
    }
}