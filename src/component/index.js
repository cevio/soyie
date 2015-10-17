import * as utils from '../utils';
import {DOMSCAN} from '../use/node-scan';
import watcher from '../scope/watcher';

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
        this.arrays = [];
        this.DOMSCAN = DOMSCAN;
        this.keys = {};
        this.parent = null;
        this.scope = null;
        this.watcher = watcher;
        this.installed = false;
        /**
         * Events.
         */
        this.onBeforeInit = null;
        this.onInjectProps = null;
        this.onScanDoms = null;
        this.onInit = null;
        this.onCheckPropsError = null;
        this.onBeforeRender = null;
        this.onRendered = null;
        this.onBeforeUpdate = null;
        this.onUpdated = null;
        this.onWrapTemplate = function(temp){
            return temp;
        };
        //this._onAppend = null;
        //this._onSingleRendered = null;
        //this._onSingleUpdated = null;
        //this._onSingleRemoved = null;
    }
    init(){
        typeof this.onBeforeInit === 'function' && this.onBeforeInit();
        this.injectProps();
        typeof this.onInjectProps === 'function' && this.onInjectProps();
        this.element = utils.createHtmlNode(this.onWrapTemplate(this.template));
        this.virtualDom.parentNode.replaceChild(this.element.node, this.virtualDom);
        DOMSCAN(this.element, this);
        typeof this.onScanDoms === 'function' && this.onScanDoms();
        typeof this.onInit === 'function' && this.onInit();
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
                typeof this.onCheckPropsError === 'function' &&
                this.onCheckPropsError(new Error('key [' + key + '] required, but it is undefined.'));
                return err;
            }
            if ( interfaces.type.indexOf(utils.type(data)) == -1 && interfaces.type.length > 0 ){
                typeof this.onCheckPropsError === 'function' &&
                this.onCheckPropsError(new Error('key [' + key + '] need a value of [' + interfaces.type + ']'));
                return err;
            }
            if ( interfaces.validator ){
                let type = utils.type(data);
                if ( type == 'RegExp' ){
                    if ( !interfaces.validator.test(data) ){
                        typeof this.onCheckPropsError === 'function' &&
                        this.onCheckPropsError(new Error('check props of ' + key + ' faild.'));
                        return err;
                    }
                }else if ( type == 'Function' ){
                    if ( interfaces.validator(data) == false ){
                        typeof this.onCheckPropsError === 'function' &&
                        this.onCheckPropsError(new Error('check props of ' + key + ' faild.'));
                        return err;
                    }
                }else{
                    if ( data != interfaces.validator ){
                        typeof this.onCheckPropsError === 'function' &&
                        this.onCheckPropsError(new Error('check props of ' + key + ' faild.'));
                        return err;
                    }
                }
            }
        }
    }

    notify(scope){
        if ( this.parent && this.parent.__ob__ && this.parent != scope ){
            this.parent.__ob__.vms.$remove(this);
        }
        if (scope) this.parent = scope;
        watcher.create(this.parent, this);

        var ok = true, result;
        if ( this.installed ){
            result = this.scope;
            for ( var i in this.interfaces ){
                let res = this.guest(i), err = this.state(i, res);
                if ( !err ){
                    if ( result[i] != res ){ result[i] = res; };
                }else{
                    ok = false;
                }
            }
        }else{
            result = {};
            for (var i in this.interfaces){
                let res = this.guest(i), err = this.state(i, res);
                if (!err) { result[i] = res; }
                else { ok = false; }
            }
        }

        if (ok) {
            this.scope = result;
            this.watch(this.scope);
            if ( this.installed ){
                typeof this.onBeforeUpdate === 'function' && this.onBeforeUpdate();
                this.objects.forEach(object => object.notify(this.scope));
                //this.arrays.forEach(array => {
                //    if ( !array.installed ){
                //        array.notify(this.scope);
                //    }
                //});
                typeof this.onUpdated === 'function' && this.onUpdated();
            }else{
                typeof this.onBeforeRender === 'function' && this.onBeforeRender();
                typeof this.handle === 'function' && this.handle.call(result, result);
                this.objects.forEach(object => object.notify(this.scope));
                this.arrays.forEach(array => {
                    if ( !array.installed ){
                        array.notify(this.scope);
                    }
                });
                this.components.forEach(object => {
                    if ( !object.installed ){
                        object.notify(this.scope);
                    }
                });
                this.installed = true;
                typeof this.onRendered === 'function' && this.onRendered();
            }
        }
    }

    guest(i){
        let res = utils.get(this.keys[i], this.parent);
        if ( res === undefined || res === null || res === '' ){
            res = this.interfaces[i].default;
        }
        return res;
    }

    watch(scope){
        if ( !scope ) return;
        watcher.create(scope, this);
        if ( utils.type(scope, 'Object') ){
            for ( var key in scope ){
                this.watch(scope[key]);
            }
        }
        else if ( utils.type(scope, 'Array') ){
            var i = scope.length;
            while (i--){
                watcher.take(scope, i, this);
                this.watch(scope[i]);
            }
        }
    }
}