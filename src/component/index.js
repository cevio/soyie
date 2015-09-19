import * as utils from '../utils';
import {DOMSCAN} from '../use/node-scan';
import * as watcher from '../scope/watcher';

export class COMPONENT {
    constructor(node){
        this.namespace = 'component';
        this.props = [];
        this.interfaces = {};
        this.outerfaces = {};
        this.virtualDom = node;
        this.element = null;
        this.template = node.innerHTML;
        this.objects = [];
        this.components = [];
        this.DOMSCAN = DOMSCAN;
        this.keys = {};
        this.parent = null;
        this.scope = null;
    }
    init(){
        this.injectProps();
        this.element = utils.createHtmlNode(this.template);
        this.virtualDom.parentNode.replaceChild(this.element.node, this.virtualDom);
        DOMSCAN(this.element, this);
        this._init && this._init();
    }
    injectProps(){
        if ( utils.type(this.props, 'Array') ){
            this.props.forEach(pros => {
                let hump = utils.deHump(pros);
                this.interfaces[pros] = {
                    type: [],
                    default: '',
                    required: false,
                    validator: null,
                    dehump: hump
                };
                this.outerfaces[hump] = this.interfaces[pros];
                this.keys[pros] = utils.formatExpression(this.virtualDom.getAttribute(hump));
            });
        }else{
            for ( var n in this.props ){
                let hump = utils.deHump(n);
                this.interfaces[n] = {
                    type: this.props[n].type || [],
                    default: this.props[n].default || '',
                    required: this.props[n].required || false,
                    validator: this.props[n].validator || null,
                    dehump: hump
                };
                if (!utils.type(this.interfaces[n].type, 'Array')){
                    this.interfaces[n].type = [this.interfaces[n].type];
                }
                this.outerfaces[hump] = this.interfaces[n];
                this.keys[n] = utils.formatExpression(this.virtualDom.getAttribute(hump));
            }
        }
    }
    state(key, data){
        var err;
        if ( !this.interfaces[key] ){
            err = new Error('key of [' + key + '] is not singed.');
        }else{
            let interfaces = this.interfaces[key];
            if ( !!interfaces.required && (key === undefined || key === null) ){
                err = new Error('miss props of ' + n);
                return err;
            }
            if ( interfaces.type.indexOf(utils.type(data)) == -1 && interfaces.type.length > 0 ){
                err = new Error('props ' + n + ' type error');
                return err;
            }
            if ( data === undefined || data === null ){
                data = interfaces.default;
            }
            if ( interfaces.validator ){
                let type = utils.type(data);
                if ( type == 'RegExp' ){
                    if ( !interfaces.validator.test(data) ){
                        err = new Error('props ' + n + ' catch validator error');
                        return err;
                    }
                }else if ( type == 'Function' ){
                    if ( interfaces.validator(data) == false ){
                        err = new Error('props ' + n + ' catch validator error');
                        return err;
                    }
                }else{
                    if ( data != interfaces.validator ){
                        err = new Error('props ' + n + ' catch validator error');
                        return err;
                    }
                }
            }
        }
    }
    render(scope){
        if (scope) this.parent = scope;
        let result = {};
        for ( var i in this.keys ){
            let res = utils.get(this.keys[i], this.parent);
            let err = this.state(i, res);
            if ( !err ){ result[i] = res;}
            else{ throw err; }
        }
        this.scope = result;
        this.components.forEach(object => object.render(this.scope));
        this.objects.forEach(object => object.render(this.scope));
    }
    update(scope){
        this.render(scope);
    }
}