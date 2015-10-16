/**
 * 插入watcher模型
 * watcher.create(scope, vm);
 * 将数据源与VM绑定
 */
import * as watcher from './scope/watcher';
import * as utils from './utils';

/**
 * VMODEL 原型
 * Controller控制器
 */
export default class {
    constructor(){
        this.objects = [];
        this.components = [];
        this.arrays = [];
        // 数据源
        this.scope = null;
    }
    /**
     *  模型初始化
     */
    init(data){
        this.scope = data || {};
        this.notify();
        this.watch(this.scope);
        return this;
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

    notify(){
        setTimeout(() => {
            // 只更新objects下的数据
            this.objects.forEach(object => object.notify(this.scope));

            // 判断循环是否被渲染过
            // 如果没有被渲染 那么重新渲染
            this.arrays.forEach(array => {
                if ( !array.installed ){
                    array.notify(this.scope);
                }
            });

            // 判断组件是否被渲染过
            // 如果没有被渲染 那么重新渲染
            this.components.forEach(component => {
                if ( !component.installed ){
                    component.notify(this.scope);
                }
            });
        }, 0);
    }
}