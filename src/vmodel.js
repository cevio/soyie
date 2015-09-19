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
        // 属性节点和文本节点保存数组
        this.objects = [];
        // 组件保存数组
        this.components = [];
        // 数据源
        this.scope = null;
    }
    /**
     *  模型初始化
     */
    init(data){
        this.scope = data || {};
        this.render();
        // 监听数据与VM
        this.watch(this.scope);
        return this;
    }
    watch(scope){
        if ( !scope ) return;
        watcher.create(scope, this);
        this.watchComponents(this.components, scope);
        var keys = Object.keys(scope);
        keys.forEach(key => {
            let type = utils.type(scope[key]);
            if ( type === 'Object' ){
                this.watch(scope[key]);
            }
        });
    }
    watchComponents(components, data){
        components.forEach(component => {
            watcher.create(data, component);
            component.components.forEach(com => {
                this.watchComponents(com.components, data);
            });
        });
    }
    /**
     *  模型数据渲染
     */
    render(){
        // 渲染组件列表
        this.components.forEach(object => {
            watcher.create(this.scope, object);
            object.render(this.scope);
        });
        // 渲染基本节点列表
        this.objects.forEach(object => object.render(this.scope));
        return this;
    }
    /**
     *  模型数据更新
     *  changes: 改变数据集合
     */
    update(scope = this.scope){
        this.scope = scope;
        this.watch(this.scope);
        this.objects.forEach(object => object.render(this.scope));
        return this;
    }
}