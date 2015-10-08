/**
 * 加载component组件模型
 */
import {COMPONENT} from './component/index';

/**
 * 加载component组件列表
 */
import componentMap from './component/map';

/**
 * 加载扫描节点功能
 */
import {DOMSCAN} from './use/node-scan';

/**
 * 加载节点树加载完毕功能模型
 */
import domReady from 'domready';

/**
 * 加载utils模型
 */
import * as utils from './utils';

/**
 * 加载vmodel
 */
import vmodel from './vmodel';

import * as watcher from './scope/watcher';
import directMaps from './use/directives';
import structor from './use/node-object';

/**
 * 注册component组件
 * @param name 组件名 即tagName名
 * @param props 组件组成部分 {json}
 * @returns {component}
 */
export function component(name, props){
    if ( typeof props === 'function' ){
        componentMap[name] = props;
    }else{
        class MODEL extends COMPONENT {
            constructor(node){
                super(node);
                var events = props.events;
                if ( events ){
                    for ( let i in events ){
                        var key = i.replace(/^(\w)/, function($1){
                            return $1.toUpperCase()
                        });
                        this['on' + key] = events[i];
                    }
                }
                utils.extend(this, props, true);
            }
        }
        componentMap[name] = MODEL;
    }
    return this;
}

/**
 * 节点加载完毕回调
 * @param foo
 */
export function ready(foo){
    domReady(foo);
}

/**
 * controller模型对象
 * @param name
 * @returns {*}
 */
export function app(name){
    var controller =
        typeof name !== 'string'
            ? name
            : document.querySelector("app[so-name='" + name + "']");

    var template = controller.innerHTML;
    var copy = utils.createHtmlNode(template);
    controller.parentNode.replaceChild(copy.node, controller);
    var vm = new vmodel();
    DOMSCAN(copy, vm);
    return vm;
}

export function bootstrap(name, data, callback){
    if ( typeof data === 'function' ){
        callback = data;
        data = {};
    }
    var vm = this.app(name).init(data);
    typeof callback === 'function' && callback.call(vm.scope, vm.scope);
    return vm.scope;
}

export function directive(name, foo){
    if ( !directMaps[name] ){
        directMaps[name] = foo;
    }
}

export let componentStructor = COMPONENT;
export let watch = watcher;
export let util = utils;
export let nodeStructor = structor;