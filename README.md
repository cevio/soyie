### Soyie Doc ###

一套高性能的`MVVM`框架。一期功能已完成

### API ###

框架API简介。

#### Soyie.define(controller, database) ####

用于定义一个UI层的VM，没有数据监听功能

``` javascript
var VM = Soyie.define('demo', { a:1 });
```

一旦使用define后UI界面都已经显示完毕。之后的`VM`代表上面产生的VModel对象。

#### Soyie.watch(datarouter, property) ####

将VM绑定观察者，此时具有监听功能。

``` javascript
VM.watch(); // 全局监听
VM.watch('name'); // 监听根数据的property属性
VM.watch('#-arrs-0-list-ps', 'main'); // 通过查找数据路由监听数据上的property属性
```

它具有3种写法,合理使用这3种写法至关重要。

#### Soyie(controller, database) ####

这个是`define`与`watch`的结合

``` javascript
Soyie('name', val);
// 等同于
Soyie.define('name', val).watch();
```

#### [VM].property(pro, callback) ####

当scope作用域下当pro数据变化时候，会触发callback方法。
`callback`具有3个参数：

  * newValue: 数据变动的新值
  * oldValue: 数据变动的旧值
  * pools: 数据变动时候，相对于这个数据关联的所有表达式对象的数组集合

``` javascript
VM.property('a', function(news, olds, pools){
    console.log(news, olds, pools);
});
```

#### [VM].action(callback) ####

可以简单的认为是VM的回调。`callback`只有一个参数`$scope`，即作用域名。

``` javascript
VM.action(function($scope){
    console.log($scope);
    // do something else.
})
```

#### [VM].task(name, fn) ####

定义一个任务。

  * name: 任务名
  * fn: 任务方法。每个任务方法都是一个`Promise`回调。

`fn`任务方法包含3个参数：

  * $scope: 作用域对象
  * resolve: Promise成功回调函数
  * reject: Promise失败回调函数

具体Promise说明请参见 [https://github.com/jakearchibald/es6-promise](https://github.com/jakearchibald/es6-promise)

``` javascript
VM.task('name', function($scope, resolve, reject){
// ...
});
```

#### [VM].registTask(flow-name, tasks-array) ####

向`[VM]`注册一个任务流水线执行过程。

``` javascript
VM.registTask('test', ['task-1', 'task-2', 'task-3'];
// or
VM.registTask('test', 'task-1', 'task-2', 'task-3');
// or
VM.registTask('taks-1'); // 将被默认为default下的task-1任务流水。
```

#### [VM].run(flow-name, callback) ####

执行一个任务流水线。同时在完毕所有任务后执行`callback`回调。

``` javascript
VM.run('default', function(err){
    if ( err ){
        console.error(err);
    }else{
        console.log('All done.');
    }
});
// or
VM.run(callback);
// 如果不存在流水线任务名，那么默认为default流水线任务名。
```

#### [VM].search(datarouter, callback) ####

通过数据路由`datarouter`查找数据对应的`VCONTROLLER`对象。将其组成的数组逐个用`callback`方法处理。

`callback`方法的`this`指针指向这个`VCONTROLLER`对象。同时存在一个VM对象参数。

``` javascript
VM.search('#-arrs-0-list', function(vm){
    this.$append('今天天气很好');
    vm.$apply(); // 绑定新数据监听
});
```

#### [VCONTROLLER] ####

`VCONTROLLER`是什么？它是一个包括节点对象和repeat对象的单独实例化对象。我们所有节点改变都是基于它提供的方法。

`VCONTROLLER-NORMAL`指非repeat循环对象的对象。

`VCONTROLLER-REPEAT`指单个repeat对象。

#### [VCONTROLLER-REPEAT].$append(data) ####

往新的repeat循环中的尾部添加一条数据。

``` javascript
[VCONTROLLER-REPEAT].$append({a:1});
```

#### [VCONTROLLER-REPEAT].$prepend(data) ####

往新的repeat循环中的头部添加一条数据。

``` javascript
[VCONTROLLER-REPEAT].$prepend({a:1});
```

#### [VCONTROLLER-NORMAL].value ####

为文本节点或者属性节点赋值

``` javascript
[VCONTROLLER-NORMAL].value = 123;
```

#### [VCONTROLLER-NORMAL].compile(scope) ####

返回文本节点或者属性节点通过scope编译后的数据

``` javascript
var value = [VCONTROLLER-NORMAL].compile(scope);
console.log(value);
```

### 指令表达式 ###

我们来说一下各种指令表达式。

#### es-controller ####

该指令将会产生一个VM闭包，之外或者之内的所有同指令都不能跨过作用域调用。

#### es-repeat ####

循环指令。 格式 `item in list` 或者 `list`。如果没有in属性。默认别名为`$this`。

#### es-binding ####

双向绑定。

#### es-src ####

图片的src属性增强。具有事件功能。`[object].on`和`[object].emit`。

事件分为 `load` 和 `error`.

#### es-click ####

模拟点击事件。

``` html
<button es-click="alert(this.TagName)">click</button>
```

其他指令在二期陆续增加。


