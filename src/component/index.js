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
        this.upnotify = false;
        this.rendered = false;
        this.watcher = watcher;
        /**
         * Events.
         */
        this._onBeforeInit = null;
        this._onInjectProps = null;
        this._onScanDoms = null;
        this._onInit = null;
        this._onCheckPropsError = null;
        this._onBeforeRender = null;
        this._onRndered = null;
        this._onBeforeUpdate = null;
        this._onUpdated = null;
        this._onAppend = null;
        this._onSingleRendered = null;
        this._onSingleUpdated = null;
        this._onSingleRemoved = null;
    }
    init(){
        typeof this._onBeforeInit === 'function' && this._onBeforeInit();
        this.injectProps();
        typeof this._onInjectProps === 'function' && this._onInjectProps();
        this.element = utils.createHtmlNode(this.template);
        this.virtualDom.parentNode.replaceChild(this.element.node, this.virtualDom);
        DOMSCAN(this.element, this);
        typeof this._onScanDoms === 'function' && this._onScanDoms();
        typeof this._onInit === 'function' && this._onInit();
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
                if ( this.virtualDom.hasAttribute(hump) ){
                    this.keys[pros] = utils.formatExpression(this.virtualDom.getAttribute(hump));
                }
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
                if ( this.virtualDom.hasAttribute(hump) ){
                    this.keys[n] = utils.formatExpression(this.virtualDom.getAttribute(hump));
                }
            }
        }
    }
    state(key, data){
        var err = true;
        if ( this.interfaces[key] ){
            let interfaces = this.interfaces[key];
            if ( !!interfaces.required && (key === undefined || key === null) ){
                typeof this._onCheckPropsError === 'function' && this._onCheckPropsError();
                return err;
            }
            if ( interfaces.type.indexOf(utils.type(data)) == -1 && interfaces.type.length > 0 ){
                typeof this._onCheckPropsError === 'function' && this._onCheckPropsError();
                return err;
            }
            if ( data === undefined || data === null ){
                data = interfaces.default;
            }
            if ( interfaces.validator ){
                let type = utils.type(data);
                if ( type == 'RegExp' ){
                    if ( !interfaces.validator.test(data) ){
                        typeof this._onCheckPropsError === 'function' && this._onCheckPropsError();
                        return err;
                    }
                }else if ( type == 'Function' ){
                    if ( interfaces.validator(data) == false ){
                        typeof this._onCheckPropsError === 'function' && this._onCheckPropsError();
                        return err;
                    }
                }else{
                    if ( data != interfaces.validator ){
                        typeof this._onCheckPropsError === 'function' && this._onCheckPropsError();
                        return err;
                    }
                }
            }
        }
    }
    render(scope) {
        if (scope) this.parent = scope;
        let result = {}, ok = true;
        for (var i in this.keys) {
            let res = utils.get (this.keys[i], this.parent);
            let err = this.state (i, res);
            if (!err) {
                result[i] = res;
            } else {
                ok = false;
            }
        }
        if (ok) {
            typeof this._onBeforeRender === 'function' && this._onBeforeRender();
            typeof this.handle === 'function' && this.handle(result);
            this.rendered = true;
            this.scope = result;
            watcher.create(this.scope, this);
            this.components.forEach (object => object.render (this.scope));
            this.objects.forEach (object => object.render (this.scope));
            typeof this._onRndered === 'function' && this._onRndered();
        }
    }


    update(scope){
        if (scope) this.parent = scope;
        let result = this.rendered ? this.scope : {}, ok = true;
        for ( var i in this.keys ){
            let res = utils.get(this.keys[i], this.parent);
            let err = this.state(i, res);
            if ( !err ){
                if ( result[i] != res ){
                    result[i] = res;
                };
            }else{
                ok = false;
            }
        }
        if ( ok ){
            typeof this._onBeforeUpdate === 'function' && this._onBeforeUpdate();
            this.scope = result;
            if ( !this.rendered ){
                typeof this.handle === 'function' && this.handle(result);
                watcher.create(this.scope, this);
                this.components.forEach(object => object.render(this.scope));
                this.rendered = true;
            }
            watcher.create(this.scope, this);
            this.objects.forEach(object => object.update(this.scope));
            if ( this.upnotify && this.parentroot ){
                this.parentroot.update();
            }
            typeof this._onUpdated === 'function' && this._onUpdated();
        }
    }
}